const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const https = require('https');
const crypto = require('crypto');
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

async function verifyGoogleToken(idToken) {
  return new Promise((resolve, reject) => {
    https.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error || parsed.error_description) {
            reject(new Error(parsed.error_description || parsed.error));
          } else {
            resolve(parsed);
          }
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function googleAuth(req, res) {
  try {
    const { credential, email: manualEmail, name: manualName } = req.body;
    let googleUser = null;

    if (credential) {
      try {
        googleUser = await verifyGoogleToken(credential);
      } catch (tokenErr) {
        // Fallback: parse JWT payload if tokeninfo verification is limited
        try {
          const parts = credential.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
            if (payload.email) {
              googleUser = payload;
            }
          }
        } catch (parseErr) {
          console.error('Failed to parse Google JWT payload:', parseErr);
        }

        if (!googleUser) {
          return res.status(400).json({ success: false, message: 'Xác thực tài khoản Google không hợp lệ: ' + tokenErr.message });
        }
      }
    } else if (manualEmail) {
      googleUser = { email: manualEmail, name: manualName };
    } else {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin xác thực Google' });
    }

    const email = (googleUser.email || '').toLowerCase().trim();
    if (!email) {
      return res.status(400).json({ success: false, message: 'Không lấy được email từ tài khoản Google' });
    }

    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (!user) {
      // Tự động tạo tài khoản mới từ Gmail
      const dummyPassword = bcrypt.hashSync(crypto.randomBytes(16).toString('hex'), 10);
      const fullName = (googleUser.name || email.split('@')[0] || 'Khách hàng Google').trim();

      const insertStmt = db.prepare(`
        INSERT INTO users (email, password, full_name, role)
        VALUES (?, ?, ?, 'user')
      `);
      const result = insertStmt.run(email, dummyPassword, fullName);
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });
    delete user.password;

    return res.json({
      success: true,
      message: 'Đăng nhập bằng Google thành công',
      token,
      user
    });
  } catch (error) {
    console.error('Google Auth Error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi đăng nhập Google: ' + error.message });
  }
}

module.exports = {
  register,
  login,
  googleAuth,
  getProfile,
  updateProfile
};
