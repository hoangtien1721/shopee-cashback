const bcrypt = require('bcryptjs');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');
const { db } = require('../config/database');

function seedDatabase() {
  console.log('Checking database seed data...');

  // 1. Kiểm tra tài khoản Admin
  const adminExists = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@cashback.vn');
  if (!adminExists) {
    const adminPass = bcrypt.hashSync('admin123', 10);
    db.prepare(`
      INSERT INTO users (email, password, full_name, phone, role, bank_name, bank_account_number, bank_account_name, available_balance, pending_balance, withdrawn_total)
      VALUES (?, ?, ?, ?, 'admin', ?, ?, ?, 0, 0, 0)
    `).run(
      'admin@cashback.vn',
      adminPass,
      'Quản Trị Viên Cashback',
      '0909123456',
      'Techcombank',
      '19033456789012',
      'QUAN TRI VIEN'
    );
    console.log('✅ Seeded admin: admin@cashback.vn / admin123');
  }

  // Đảm bảo tài khoản chủ sàn hoangtien1721@gmail.com luôn có quyền admin
  db.prepare("UPDATE users SET role = 'admin' WHERE email = 'hoangtien1721@gmail.com'").run();

  // 2. Kiểm tra tài khoản Demo User
  let demoUser = db.prepare('SELECT id FROM users WHERE email = ?').get('user@cashback.vn');
  let demoUserId;
  if (!demoUser) {
    const userPass = bcrypt.hashSync('user123', 10);
    const result = db.prepare(`
      INSERT INTO users (email, password, full_name, phone, role, bank_name, bank_account_number, bank_account_name, available_balance, pending_balance, withdrawn_total)
      VALUES (?, ?, ?, ?, 'user', ?, ?, ?, 245000, 68000, 150000)
    `).run(
      'user@cashback.vn',
      userPass,
      'Nguyễn Văn Mua Sắm',
      '0987654321',
      'Vietcombank',
      '10123456789',
      'NGUYEN VAN MUA SAM'
    );
    demoUserId = result.lastInsertRowid;
    console.log(`✅ Seeded demo user: user@cashback.vn / user123 (ID: ${demoUserId})`);
  } else {
    demoUserId = demoUser.id;
  }

  // 3. Seed converted links cho demo user nếu chưa có
  const linkCount = db.prepare('SELECT COUNT(*) as count FROM converted_links WHERE user_id = ?').get(demoUserId).count;
  if (linkCount === 0) {
    const insertLink = db.prepare(`
      INSERT INTO converted_links (user_id, original_url, clean_url, affiliate_url, short_code, product_title, clicks_count, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now', ?))
    `);

    insertLink.run(
      demoUserId,
      'https://shopee.vn/Tai-nghe-Bluetooth-chong-on-Sony-WH-1000XM5-i.123456.78910',
      'https://shopee.vn/Tai-nghe-Bluetooth-chong-on-Sony-WH-1000XM5-i.123456.78910',
      `https://s.shopee.vn/an_redir?origin_link=https%3A%2F%2Fshopee.vn%2FTai-nghe-Bluetooth-Sony&sub_id=u${demoUserId}-sonywh5`,
      'sonywh5',
      'Tai nghe Bluetooth chống ồn Sony WH-1000XM5',
      12,
      '-3 days'
    );

    insertLink.run(
      demoUserId,
      'https://shopee.vn/Ao-Thun-Unisex-Cotton-100-Form-Rong-i.98765.43210',
      'https://shopee.vn/Ao-Thun-Unisex-Cotton-100-Form-Rong-i.98765.43210',
      `https://s.shopee.vn/an_redir?origin_link=https%3A%2F%2Fshopee.vn%2FAo-Thun-Unisex&sub_id=u${demoUserId}-aothun1`,
      'aothun1',
      'Áo Thun Unisex Cotton 100% Form Rộng Cao Cấp',
      28,
      '-5 days'
    );

    insertLink.run(
      demoUserId,
      'https://shopee.vn/Noi-chien-khong-dau-Philips-HD9252-4.1L-i.45678.99999',
      'https://shopee.vn/Noi-chien-khong-dau-Philips-HD9252-4.1L-i.45678.99999',
      `https://s.shopee.vn/an_redir?origin_link=https%3A%2F%2Fshopee.vn%2FNoi-chien-Philips&sub_id=u${demoUserId}-philips`,
      'philips',
      'Nồi chiên không dầu Philips HD9252/90 4.1 Lít',
      8,
      '-1 days'
    );
    console.log('✅ Seeded demo converted links');
  }

  // 4. Seed demo orders
  const orderCount = db.prepare('SELECT COUNT(*) as count FROM cashback_orders WHERE user_id = ?').get(demoUserId).count;
  if (orderCount === 0) {
    const insertOrder = db.prepare(`
      INSERT INTO cashback_orders (shopee_order_id, user_id, order_amount, shopee_commission, user_rate, user_cashback, status, product_names, confirmed_time, created_at, note)
      VALUES (?, ?, ?, ?, 0.5, ?, ?, ?, ?, datetime('now', ?), ?)
    `);

    insertOrder.run(
      '240905SHP112233',
      demoUserId,
      6490000,
      350000,
      175000,
      'confirmed',
      'Tai nghe Bluetooth chống ồn Sony WH-1000XM5',
      new Date().toISOString(),
      '-2 days',
      'Đã đối soát thành công tháng 9'
    );

    insertOrder.run(
      '240902SHP889900',
      demoUserId,
      280000,
      40000,
      20000,
      'confirmed',
      'Áo Thun Unisex Cotton 100% Form Rộng Cao Cấp',
      new Date().toISOString(),
      '-4 days',
      'Đã hoàn tất thanh toán'
    );

    insertOrder.run(
      '240908SHP554433',
      demoUserId,
      1750000,
      136000,
      68000,
      'pending',
      'Nồi chiên không dầu Philips HD9252/90 4.1 Lít',
      null,
      '-1 days',
      'Đang chờ Shopee đối soát đơn hàng hoàn tất'
    );
    console.log('✅ Seeded demo cashback orders');
  }

  // 5. Seed demo withdrawal requests
  const withdrawCount = db.prepare('SELECT COUNT(*) as count FROM withdrawal_requests WHERE user_id = ?').get(demoUserId).count;
  if (withdrawCount === 0) {
    const insertWithdraw = db.prepare(`
      INSERT INTO withdrawal_requests (user_id, amount, bank_name, bank_account_number, bank_account_name, status, admin_note, bank_trans_code, created_at, processed_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now', ?), ?)
    `);

    insertWithdraw.run(
      demoUserId,
      150000,
      'Vietcombank',
      '10123456789',
      'NGUYEN VAN MUA SAM',
      'completed',
      'Đã chuyển tiền qua Vietcombank 24/7',
      'VCB240904998812',
      '-6 days',
      new Date().toISOString()
    );

    insertWithdraw.run(
      demoUserId,
      100000,
      'Vietcombank',
      '10123456789',
      'NGUYEN VAN MUA SAM',
      'pending',
      'Chờ đối soát ca chiều',
      '',
      '-1 hours',
      null
    );
    console.log('✅ Seeded demo withdrawal requests');
  }

  // 6. Tạo file mẫu Excel Shopee Report để test upload
  createSampleShopeeExcelReport(demoUserId);
}

function createSampleShopeeExcelReport(userId) {
  try {
    const dataDir = path.join(__dirname, '../data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const sampleFilePath = path.join(dataDir, 'sample_shopee_affiliate_report.xlsx');

    const sampleRows = [
      {
        'Order ID': '240909SHP991122',
        'Purchase Time': '2026-09-08 14:22:15',
        'Sub ID 1': `u${userId}`,
        'Sub ID 2': 'sonywh5',
        'Item Name': 'Bàn phím cơ không dây Logitech MX Mechanical Mini',
        'Order Amount': 2990000,
        'Total Commission': 180000,
        'Order Status': 'Completed'
      },
      {
        'Order ID': '240909SHP882233',
        'Purchase Time': '2026-09-09 09:15:30',
        'Sub ID 1': `u${userId}`,
        'Sub ID 2': 'aothun1',
        'Item Name': 'Chuột công thái học Logitech Lift Vertical',
        'Order Amount': 1490000,
        'Total Commission': 90000,
        'Order Status': 'Completed'
      },
      {
        'Order ID': '240909SHP773344',
        'Purchase Time': '2026-09-09 16:40:00',
        'Sub ID 1': `u${userId}`,
        'Sub ID 2': 'philips',
        'Item Name': 'Bình giữ nhiệt Lock&Lock 800ml thép không gỉ',
        'Order Amount': 450000,
        'Total Commission': 32000,
        'Order Status': 'Pending'
      }
    ];

    const ws = xlsx.utils.json_to_sheet(sampleRows);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Conversion Report');
    xlsx.writeFile(wb, sampleFilePath);
    console.log('✅ Created sample Shopee report Excel file at:', sampleFilePath);
  } catch (e) {
    console.warn('Could not create sample Excel file:', e.message);
  }
}

module.exports = {
  seedDatabase
};
