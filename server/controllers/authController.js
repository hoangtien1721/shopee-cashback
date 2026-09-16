const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../config/database');
const { JWT_SECRET } = require('../middleware/auth');

function register(req, res) {
  try {
    const { email, password, full_name, phone, bank_name, bank_account_number, bank_account_name } = req.body;

    if (!email || !password || !full_name) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ email, mật khẩu và họ tên' });
    }

    // Kiểm tra email đã tồn tại chưa
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email này đã được đăng ký' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const stmt = db.prepare(`
      INSERT INTO users (email, password, full_name, phone, bank_name, bank_account_number, bank_account_name)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      email.toLowerCase().trim(),
      hashedPassword,
      full_name.trim(),
      phone ? phone.trim() : '',
      bank_name ? bank_name.trim() : '',
      bank_account_number ? bank_account_number.trim() : '',
      bank_account_name ? bank_account_name.trim().toUpperCase() : ''
    );

    const userId = result.lastInsertRowid;
    const token = jwt.sign({ id: userId, email: email.toLowerCase().trim() }, JWT_SECRET, { expiresIn: '30d' });

    const newUser = db.prepare(`
      SELECT id, email, full_name, phone, role, bank_name, bank_account_number, bank_account_name, available_balance, pending_balance, withdrawn_total
      FROM users WHERE id = ?
    `).get(userId);

    return res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản thành công',
      token,
      user: newUser
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, message: 'Đã có lỗi xảy ra khi đăng ký: ' + error.message });
  }
}

function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập email và mật khẩu' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (!user) {
      return res.status(400).json({ success: false, message: 'Email hoặc mật khẩu không chính xác' });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Email hoặc mật khẩu không chính xác' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });

    // Không trả về password hash
    delete user.password;

    return res.json({
      success: true,
      message: 'Đăng nhập thành công',
      token,
      user
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi đăng nhập: ' + error.message });
  }
}

function getProfile(req, res) {
  try {
    const user = db.prepare(`
      SELECT id, email, full_name, phone, role, bank_name, bank_account_number, bank_account_name,
             available_balance, pending_balance, withdrawn_total, created_at
      FROM users WHERE id = ?
    `).get(req.user.id);

    return res.json({
      success: true,
      user
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

function updateProfile(req, res) {
  try {
    const { full_name, phone, bank_name, bank_account_number, bank_account_name } = req.body;

    const stmt = db.prepare(`
      UPDATE users
      SET full_name = COALESCE(?, full_name),
          phone = COALESCE(?, phone),
          bank_name = COALESCE(?, bank_name),
          bank_account_number = COALESCE(?, bank_account_number),
          bank_account_name = COALESCE(?, bank_account_name),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(
      full_name ? full_name.trim() : null,
      phone ? phone.trim() : null,
      bank_name ? bank_name.trim() : null,
      bank_account_number ? bank_account_number.trim() : null,
      bank_account_name ? bank_account_name.trim().toUpperCase() : null,
      req.user.id
    );

    const updatedUser = db.prepare(`
      SELECT id, email, full_name, phone, role, bank_name, bank_account_number, bank_account_name,
             available_balance, pending_balance, withdrawn_total
      FROM users WHERE id = ?
    `).get(req.user.id);

    return res.json({
      success: true,
      message: 'Cập nhật thông tin thành công',
      user: updatedUser
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  register,
  login,
  getProfile,
  updateProfile
};
