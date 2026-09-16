const fs = require('fs');
const { db } = require('../config/database');
const { parseShopeeReportFile, getSetting } = require('../services/shopeeService');

// Thống kê tổng quan cho Admin Dashboard
function getAdminStats(req, res) {
  try {
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users WHERE role = "user"').get().count;
    const totalLinks = db.prepare('SELECT COUNT(*) as count, SUM(clicks_count) as total_clicks FROM converted_links').get();

    const orderStats = db.prepare(`
      SELECT 
        COUNT(*) as total_orders,
        SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed_orders,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_orders,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_orders,
        SUM(order_amount) as total_gross_sales,
        SUM(shopee_commission) as total_shopee_commission,
        SUM(CASE WHEN status = 'confirmed' THEN user_cashback ELSE 0 END) as total_user_cashback_paid,
        SUM(CASE WHEN status = 'pending' THEN user_cashback ELSE 0 END) as total_user_cashback_pending
      FROM cashback_orders
    `).get();

    const withdrawStats = db.prepare(`
      SELECT 
        COUNT(*) as total_withdraws,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_withdraws,
        SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pending_withdraw_amount,
        SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as total_withdrawn_completed
      FROM withdrawal_requests
    `).get();

    return res.json({
      success: true,
      stats: {
        total_users: totalUsers,
        total_links: totalLinks.count || 0,
        total_clicks: totalLinks.total_clicks || 0,
        orders: {
          total: orderStats.total_orders || 0,
          confirmed: orderStats.confirmed_orders || 0,
          pending: orderStats.pending_orders || 0,
          rejected: orderStats.rejected_orders || 0,
          total_sales: orderStats.total_gross_sales || 0,
          total_shopee_commission: orderStats.total_shopee_commission || 0,
          user_cashback_paid: orderStats.total_user_cashback_paid || 0,
          user_cashback_pending: orderStats.total_user_cashback_pending || 0
        },
        withdrawals: {
          total: withdrawStats.total_withdraws || 0,
          pending_count: withdrawStats.pending_withdraws || 0,
          pending_amount: withdrawStats.pending_withdraw_amount || 0,
          completed_amount: withdrawStats.total_withdrawn_completed || 0
        }
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// Quản lý danh sách thành viên
function getAllUsers(req, res) {
  try {
    const { search } = req.query;
    let query = `
      SELECT id, email, full_name, phone, role, bank_name, bank_account_number, bank_account_name,
             available_balance, pending_balance, withdrawn_total, created_at
      FROM users
    `;
    const params = [];

    if (search) {
      query += ` WHERE email LIKE ? OR full_name LIKE ? OR phone LIKE ?`;
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    query += ` ORDER BY id DESC`;

    const users = db.prepare(query).all(...params);
    return res.json({ success: true, users });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// Quản lý danh sách đơn hàng hoàn tiền
function getAllOrders(req, res) {
  try {
    const { status, search } = req.query;
    let query = `
      SELECT o.*, u.email as user_email, u.full_name as user_name
      FROM cashback_orders o
      JOIN users u ON o.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ` AND o.status = ?`;
      params.push(status);
    }

    if (search) {
      query += ` AND (o.shopee_order_id LIKE ? OR u.email LIKE ? OR u.full_name LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    query += ` ORDER BY o.created_at DESC`;

    const orders = db.prepare(query).all(...params);
    return res.json({ success: true, orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// Thêm đơn hàng thủ công
function addManualOrder(req, res) {
  try {
    const { shopee_order_id, user_id, order_amount, shopee_commission, product_names, status, note } = req.body;

    if (!shopee_order_id || !user_id || shopee_commission === undefined) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp mã đơn hàng, ID người dùng và hoa hồng Shopee' });
    }

    const user = db.prepare('SELECT id FROM users WHERE id = ?').get(user_id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng có ID: ' + user_id });
    }

    const rate = parseFloat(getSetting('cashback_rate', '0.5'));
    const commissionVal = parseInt(shopee_commission, 10) || 0;
    const userCashback = Math.round(commissionVal * rate);
    const orderStatus = status || 'confirmed';

    const insertTx = db.transaction(() => {
      const result = db.prepare(`
        INSERT INTO cashback_orders (shopee_order_id, user_id, order_amount, shopee_commission, user_rate, user_cashback, status, product_names, note, confirmed_time)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        shopee_order_id.trim(),
        user_id,
        parseInt(order_amount, 10) || 0,
        commissionVal,
        rate,
        userCashback,
        orderStatus,
        product_names || 'Đơn hàng Shopee',
        note || 'Nhập thủ công bởi Admin',
        orderStatus === 'confirmed' ? new Date().toISOString() : null
      );

      // Cập nhật số dư người dùng
      if (orderStatus === 'confirmed') {
        db.prepare(`
          UPDATE users
          SET available_balance = available_balance + ?
          WHERE id = ?
        `).run(userCashback, user_id);
      } else if (orderStatus === 'pending') {
        db.prepare(`
          UPDATE users
          SET pending_balance = pending_balance + ?
          WHERE id = ?
        `).run(userCashback, user_id);
      }

      return result.lastInsertRowid;
    });

    const orderId = insertTx();
    const newOrder = db.prepare('SELECT * FROM cashback_orders WHERE id = ?').get(orderId);

    return res.status(201).json({
      success: true,
      message: 'Thêm đơn hàng và cộng tiền hoàn thành công!',
      order: newOrder
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// Xác nhận đơn hàng hoàn tiền -> Cộng tiền vào số dư khả dụng của user
function confirmOrder(req, res) {
  try {
    const { id } = req.params;

    const order = db.prepare('SELECT * FROM cashback_orders WHERE id = ?').get(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    if (order.status === 'confirmed') {
      return res.status(400).json({ success: false, message: 'Đơn hàng này đã được xác nhận trước đó' });
    }

    const confirmTx = db.transaction(() => {
      // Cập nhật trạng thái đơn
      db.prepare(`
        UPDATE cashback_orders
        SET status = 'confirmed',
            confirmed_time = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(id);

      // Cộng vào số dư khả dụng, trừ khỏi số dư chờ duyệt nếu trước đó là pending
      if (order.status === 'pending') {
        db.prepare(`
          UPDATE users
          SET available_balance = available_balance + ?,
              pending_balance = MAX(0, pending_balance - ?)
          WHERE id = ?
        `).run(order.user_cashback, order.user_cashback, order.user_id);
      } else {
        db.prepare(`
          UPDATE users
          SET available_balance = available_balance + ?
          WHERE id = ?
        `).run(order.user_cashback, order.user_id);
      }
    });

    confirmTx();

    return res.json({
      success: true,
      message: `Đã xác nhận đơn hàng #${order.shopee_order_id} và cộng ${order.user_cashback.toLocaleString('vi-VN')} đ vào ví người dùng!`
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// Từ chối đơn hàng (do đơn hủy hoặc trả hàng trên Shopee)
function rejectOrder(req, res) {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const order = db.prepare('SELECT * FROM cashback_orders WHERE id = ?').get(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    if (order.status === 'rejected') {
      return res.status(400).json({ success: false, message: 'Đơn hàng này đã bị từ chối trước đó' });
    }

    const rejectTx = db.transaction(() => {
      db.prepare(`
        UPDATE cashback_orders
        SET status = 'rejected',
            note = COALESCE(?, note)
        WHERE id = ?
      `).run(reason ? `Từ chối: ${reason}` : 'Từ chối bởi Admin', id);

      if (order.status === 'pending') {
        db.prepare(`
          UPDATE users
          SET pending_balance = MAX(0, pending_balance - ?)
          WHERE id = ?
        `).run(order.user_cashback, order.user_id);
      } else if (order.status === 'confirmed') {
        db.prepare(`
          UPDATE users
          SET available_balance = MAX(0, available_balance - ?)
          WHERE id = ?
        `).run(order.user_cashback, order.user_id);
      }
    });

    rejectTx();

    return res.json({
      success: true,
      message: `Đã từ chối hoàn tiền cho đơn hàng #${order.shopee_order_id}`
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// Import báo cáo chuyển đổi Shopee từ file Excel/CSV
function importShopeeReport(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn file báo cáo Excel (.xlsx, .xls) hoặc CSV' });
    }

    const filePath = req.file.path;
    const parsedOrders = parseShopeeReportFile(filePath);

    // Xóa file tạm sau khi parse
    try {
      fs.unlinkSync(filePath);
    } catch (e) {}

    if (parsedOrders.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Không tìm thấy đơn hàng hợp lệ nào trong file. Hãy chắc chắn file có cột Mã đơn hàng và Sub ID 1 chứa ID người dùng (dạng u1, u2,...)'
      });
    }

    const rate = parseFloat(getSetting('cashback_rate', '0.5'));
    let addedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    const importTx = db.transaction(() => {
      for (const item of parsedOrders) {
        // Kiểm tra user có tồn tại trong hệ thống không
        const user = db.prepare('SELECT id FROM users WHERE id = ?').get(item.userId);
        if (!user) {
          skippedCount++;
          continue;
        }

        const userCashback = Math.round(item.shopeeCommission * rate);

        // Kiểm tra đơn đã tồn tại chưa
        const existingOrder = db.prepare('SELECT id, status, user_cashback FROM cashback_orders WHERE shopee_order_id = ?').get(item.orderId);

        if (existingOrder) {
          // Nếu đơn đã có mà trạng thái chuyển từ pending -> confirmed
          if (existingOrder.status === 'pending' && item.status === 'confirmed') {
            db.prepare(`
              UPDATE cashback_orders
              SET status = 'confirmed',
                  confirmed_time = CURRENT_TIMESTAMP,
                  shopee_commission = ?,
                  user_cashback = ?
              WHERE id = ?
            `).run(item.shopeeCommission, userCashback, existingOrder.id);

            db.prepare(`
              UPDATE users
              SET available_balance = available_balance + ?,
                  pending_balance = MAX(0, pending_balance - ?)
              WHERE id = ?
            `).run(userCashback, existingOrder.user_cashback, item.userId);

            updatedCount++;
          } else {
            skippedCount++;
          }
        } else {
          // Tạo mới đơn hàng
          db.prepare(`
            INSERT INTO cashback_orders (shopee_order_id, user_id, order_amount, shopee_commission, user_rate, user_cashback, status, product_names, confirmed_time)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            item.orderId,
            item.userId,
            item.orderAmount,
            item.shopeeCommission,
            rate,
            userCashback,
            item.status,
            item.productName,
            item.status === 'confirmed' ? new Date().toISOString() : null
          );

          if (item.status === 'confirmed') {
            db.prepare(`
              UPDATE users
              SET available_balance = available_balance + ?
              WHERE id = ?
            `).run(userCashback, item.userId);
          } else if (item.status === 'pending') {
            db.prepare(`
              UPDATE users
              SET pending_balance = pending_balance + ?
              WHERE id = ?
            `).run(userCashback, item.userId);
          }

          addedCount++;
        }
      }
    });

    importTx();

    return res.json({
      success: true,
      message: `Đối soát thành công: Thêm mới ${addedCount} đơn, Cập nhật ${updatedCount} đơn, Bỏ qua ${skippedCount} dòng trùng lặp.`,
      result: {
        totalRowsParsed: parsedOrders.length,
        addedCount,
        updatedCount,
        skippedCount
      }
    });
  } catch (error) {
    console.error('Import Shopee Report Error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi xử lý file báo cáo: ' + error.message });
  }
}

// Lấy danh sách tất cả yêu cầu rút tiền
function getAllWithdrawals(req, res) {
  try {
    const { status } = req.query;
    let query = `
      SELECT w.*, u.email as user_email, u.full_name as user_name, u.phone as user_phone, u.available_balance as current_user_balance
      FROM withdrawal_requests w
      JOIN users u ON w.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ` AND w.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY w.created_at DESC`;

    const withdrawals = db.prepare(query).all(...params);
    return res.json({ success: true, withdrawals });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// Xử lý yêu cầu rút tiền (Chuyển khoản / Hoàn tất / Từ chối)
function processWithdrawal(req, res) {
  try {
    const { id } = req.params;
    const { status, admin_note, bank_trans_code } = req.body;

    if (!['processing', 'completed', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ' });
    }

    const withdraw = db.prepare('SELECT * FROM withdrawal_requests WHERE id = ?').get(id);
    if (!withdraw) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy yêu cầu rút tiền' });
    }

    if (withdraw.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Yêu cầu này đã được hoàn tất trước đó' });
    }

    const processTx = db.transaction(() => {
      if (status === 'completed') {
        // Đã chuyển khoản thành công
        db.prepare(`
          UPDATE withdrawal_requests
          SET status = 'completed',
              admin_note = COALESCE(?, admin_note),
              bank_trans_code = COALESCE(?, bank_trans_code),
              processed_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(admin_note, bank_trans_code, id);

        // Tăng tổng tiền đã rút của user
        db.prepare(`
          UPDATE users
          SET withdrawn_total = withdrawn_total + ?
          WHERE id = ?
        `).run(withdraw.amount, withdraw.user_id);

      } else if (status === 'rejected') {
        // Từ chối yêu cầu -> Hoàn lại tiền vào số dư khả dụng của user
        db.prepare(`
          UPDATE withdrawal_requests
          SET status = 'rejected',
              admin_note = ?,
              processed_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(admin_note || 'Yêu cầu bị từ chối và tiền đã được hoàn lại vào ví', id);

        db.prepare(`
          UPDATE users
          SET available_balance = available_balance + ?
          WHERE id = ?
        `).run(withdraw.amount, withdraw.user_id);

      } else if (status === 'processing') {
        db.prepare(`
          UPDATE withdrawal_requests
          SET status = 'processing',
              admin_note = COALESCE(?, admin_note)
          WHERE id = ?
        `).run(admin_note, id);
      }
    });

    processTx();

    return res.json({
      success: true,
      message: `Cập nhật trạng thái lệnh rút #${id} thành "${status === 'completed' ? 'Đã chi trả' : status === 'rejected' ? 'Từ chối & Hoàn tiền' : 'Đang xử lý'}" thành công!`
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// Lấy & Lưu cài đặt hệ thống
function getSettings(req, res) {
  try {
    const settings = db.prepare('SELECT * FROM system_settings').all();
    const settingsMap = {};
    settings.forEach(s => {
      settingsMap[s.key] = s.value;
    });
    return res.json({ success: true, settings: settingsMap });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

function updateSettings(req, res) {
  try {
    const { cashback_rate, min_withdrawal, payout_sla_days, shopee_app_id, shopee_app_secret, shopee_affiliate_id, shopee_cookie, site_name } = req.body;

    const upsertStmt = db.prepare(`
      INSERT INTO system_settings (key, value)
      VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `);

    const updateTx = db.transaction(() => {
      if (cashback_rate !== undefined) upsertStmt.run('cashback_rate', String(cashback_rate));
      if (min_withdrawal !== undefined) upsertStmt.run('min_withdrawal', String(min_withdrawal));
      if (payout_sla_days !== undefined) upsertStmt.run('payout_sla_days', String(payout_sla_days));
      if (shopee_app_id !== undefined) upsertStmt.run('shopee_app_id', String(shopee_app_id));
      if (shopee_app_secret !== undefined) upsertStmt.run('shopee_app_secret', String(shopee_app_secret));
      if (shopee_affiliate_id !== undefined) upsertStmt.run('shopee_affiliate_id', String(shopee_affiliate_id));
      if (shopee_cookie !== undefined) upsertStmt.run('shopee_cookie', String(shopee_cookie));
      if (site_name !== undefined) upsertStmt.run('site_name', String(site_name));
    });

    updateTx();

    return res.json({ success: true, message: 'Cập nhật cấu hình hệ thống thành công!' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }

}

// Kiểm tra kết nối Shopee Affiliate API
async function testShopeeApi(req, res) {
  try {
    const appId = req.body.shopee_app_id || getSetting('shopee_app_id');
    const appSecret = req.body.shopee_app_secret || getSetting('shopee_app_secret');
    const shopeeCookie = req.body.shopee_cookie || getSetting('shopee_cookie');
    const partnerId = req.body.shopee_affiliate_id || getSetting('shopee_affiliate_id', 'viva_cashback');

    // 1. Nếu có Shopee Cookie -> Thử gọi internal GraphQL API
    if (shopeeCookie) {
      try {
        const cleanCookie = shopeeCookie.includes('SPC_EC=') ? shopeeCookie : `SPC_EC=${shopeeCookie}`;
        const query = `
          mutation {
            batchCustomLink(linkParams: [{
              originalLink: "https://shopee.vn",
              subIdCollection: {
                subId1: "test_cookie",
                subId2: "check"
              }
            }]) {
              shortLink
              failCode
            }
          }
        `;

        const response = await fetch('https://affiliate.shopee.vn/api/v3/gql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': cleanCookie,
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': 'https://affiliate.shopee.vn/'
          },
          body: JSON.stringify({ query })
        });

        const resJson = await response.json();
        if (resJson && resJson.data && resJson.data.batchCustomLink && resJson.data.batchCustomLink[0]?.shortLink) {
          return res.json({
            success: true,
            mode: 'session_cookie',
            message: '🎉 Kết nối qua Shopee Cookie (SPC_EC) thành công 100%! Đã sinh link test s.shopee.vn: ' + resJson.data.batchCustomLink[0].shortLink
          });
        } else {
          return res.json({
            success: false,
            mode: 'session_cookie',
            message: 'Shopee phản hồi lỗi Cookie hoặc Cookie đã hết hạn: ' + JSON.stringify(resJson)
          });
        }
      } catch (err) {
        return res.json({
          success: false,
          mode: 'session_cookie',
          message: 'Lỗi gọi Shopee qua Cookie: ' + err.message
        });
      }
    }

    // 2. Nếu có Open API
    if (appId && appSecret) {
      const crypto = require('crypto');
      const timestamp = Math.floor(Date.now() / 1000);
      const query = `
        mutation {
          generateShortLink(input: {
            originUrl: "https://shopee.vn",
            subIds: ["test_connection"]
          }) {
            shortLink
          }
        }
      `;
      const factor = `${appId}${timestamp}${query}${appSecret}`;
      const signature = crypto.createHash('sha256').update(factor).digest('hex');

      const response = await fetch('https://open-api.affiliate.shopee.vn/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `SHA256 Credential=${appId}, Timestamp=${timestamp}, Signature=${signature}`
        },
        body: JSON.stringify({ query })
      });

      const data = await response.json();

      if (data && data.data && data.data.generateShortLink) {
        return res.json({
          success: true,
          mode: 'api_graphql',
          message: 'Kết nối Shopee Open API thành công 100%! Link test: ' + data.data.generateShortLink.shortLink
        });
      } else {
        return res.json({
          success: false,
          mode: 'api_graphql',
          message: 'Shopee phản hồi: ' + (data.errors ? data.errors[0].message : JSON.stringify(data))
        });
      }
    }

    // 3. Mặc định: Universal Affiliate Link
    return res.json({
      success: true,
      mode: 'universal_redirect',
      message: `✅ Hệ thống đang hoạt động ở chế độ "Universal Affiliate Link" (Không cần Open API). Mọi link Shopee của người dùng sẽ tự động chuyển đổi thành: https://s.shopee.vn/an_redir?... gắn mã Partner ID "${partnerId}" và Sub ID người mua hàng.`
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: 'Lỗi kiểm tra Shopee API: ' + error.message });
  }
}


module.exports = {
  getAdminStats,
  getAllUsers,
  getAllOrders,
  addManualOrder,
  confirmOrder,
  rejectOrder,
  importShopeeReport,
  getAllWithdrawals,
  processWithdrawal,
  getSettings,
  updateSettings,
  testShopeeApi
};
