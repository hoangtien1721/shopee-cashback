const { db } = require('../config/database');

function getUserOrders(req, res) {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    let query = `
      SELECT * FROM cashback_orders
      WHERE user_id = ?
    `;
    const params = [userId];

    if (status) {
      query += ` AND status = ?`;
      params.push(status);
    }

    query += ` ORDER BY created_at DESC`;

    const orders = db.prepare(query).all(...params);

    return res.json({
      success: true,
      orders
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

function getUserStats(req, res) {
  try {
    const userId = req.user.id;

    // Lấy thông tin tài chính mới nhất của user
    const user = db.prepare(`
      SELECT available_balance, pending_balance, withdrawn_total, bank_name, bank_account_number, bank_account_name
      FROM users WHERE id = ?
    `).get(userId);

    // Thống kê đơn hàng
    const orderStats = db.prepare(`
      SELECT 
        COUNT(*) as total_orders,
        SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed_orders,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_orders,
        SUM(CASE WHEN status = 'confirmed' THEN user_cashback ELSE 0 END) as total_earned_cashback
      FROM cashback_orders
      WHERE user_id = ?
    `).get(userId);

    // Thống kê links
    const linkStats = db.prepare(`
      SELECT COUNT(*) as total_links, SUM(clicks_count) as total_clicks
      FROM converted_links
      WHERE user_id = ?
    `).get(userId);

    // Lấy 5 đơn gần nhất
    const recentOrders = db.prepare(`
      SELECT * FROM cashback_orders
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 5
    `).all(userId);

    return res.json({
      success: true,
      stats: {
        available_balance: user.available_balance || 0,
        pending_balance: user.pending_balance || 0,
        withdrawn_total: user.withdrawn_total || 0,
        total_orders: orderStats.total_orders || 0,
        confirmed_orders: orderStats.confirmed_orders || 0,
        pending_orders: orderStats.pending_orders || 0,
        total_earned_cashback: orderStats.total_earned_cashback || 0,
        total_links: linkStats.total_links || 0,
        total_clicks: linkStats.total_clicks || 0,
        bank_configured: !!(user.bank_name && user.bank_account_number && user.bank_account_name)
      },
      recentOrders
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  getUserOrders,
  getUserStats
};
