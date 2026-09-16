const { db } = require('../config/database');
const { getSetting } = require('../services/shopeeService');

function createWithdrawRequest(req, res) {
  try {
    const userId = req.user.id;
    const { amount, bank_name, bank_account_number, bank_account_name } = req.body;

    const withdrawAmount = parseInt(amount, 10);
    if (!withdrawAmount || isNaN(withdrawAmount) || withdrawAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Số tiền rút không hợp lệ' });
    }

    const minWithdrawal = parseInt(getSetting('min_withdrawal', '50000'), 10);
    if (withdrawAmount < minWithdrawal) {
      return res.status(400).json({
        success: false,
        message: `Số tiền rút tối thiểu là ${minWithdrawal.toLocaleString('vi-VN')} VNĐ`
      });
    }

    // Lấy thông tin user hiện tại
    const user = db.prepare('SELECT available_balance, bank_name, bank_account_number, bank_account_name FROM users WHERE id = ?').get(userId);

    if (user.available_balance < withdrawAmount) {
      return res.status(400).json({
        success: false,
        message: `Số dư khả dụng (${user.available_balance.toLocaleString('vi-VN')} đ) không đủ để rút ${withdrawAmount.toLocaleString('vi-VN')} đ`
      });
    }

    // Sử dụng thông tin ngân hàng gửi lên hoặc từ profile
    const finalBankName = (bank_name || user.bank_name || '').trim();
    const finalAccountNum = (bank_account_number || user.bank_account_number || '').trim();
    const finalAccountName = (bank_account_name || user.bank_account_name || '').trim().toUpperCase();

    if (!finalBankName || !finalAccountNum || !finalAccountName) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ thông tin tài khoản ngân hàng thụ hưởng (Ngân hàng, Số tài khoản, Tên chủ tài khoản)'
      });
    }

    // Thực hiện trừ số dư khả dụng và tạo lệnh rút trong 1 Transaction an toàn
    const createTx = db.transaction(() => {
      // 1. Trừ số dư khả dụng
      db.prepare(`
        UPDATE users
        SET available_balance = available_balance - ?,
            bank_name = ?,
            bank_account_number = ?,
            bank_account_name = ?
        WHERE id = ?
      `).run(withdrawAmount, finalBankName, finalAccountNum, finalAccountName, userId);

      // 2. Tạo yêu cầu rút tiền
      const result = db.prepare(`
        INSERT INTO withdrawal_requests (user_id, amount, bank_name, bank_account_number, bank_account_name, status)
        VALUES (?, ?, ?, ?, ?, 'pending')
      `).run(userId, withdrawAmount, finalBankName, finalAccountNum, finalAccountName);

      return result.lastInsertRowid;
    });

    const withdrawId = createTx();
    const request = db.prepare('SELECT * FROM withdrawal_requests WHERE id = ?').get(withdrawId);

    return res.status(201).json({
      success: true,
      message: 'Tạo yêu cầu rút tiền thành công! Hệ thống sẽ xử lý và chuyển khoản trong vòng 3 ngày làm việc.',
      request
    });
  } catch (error) {
    console.error('Withdraw error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi khi tạo yêu cầu rút tiền: ' + error.message });
  }
}

function getUserWithdrawals(req, res) {
  try {
    const userId = req.user.id;

    const requests = db.prepare(`
      SELECT * FROM withdrawal_requests
      WHERE user_id = ?
      ORDER BY created_at DESC
    `).all(userId);

    return res.json({
      success: true,
      requests
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  createWithdrawRequest,
  getUserWithdrawals
};
