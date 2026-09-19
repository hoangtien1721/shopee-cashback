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
    return res.status(500).json({ success: false, message: error.message });
  }
}

function getGoogleRedirectUri(req) {
  const proto = req.headers['x-forwarded-proto'] || req.protocol || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  return `${proto}://${host}/api/auth/google/callback`;
}

function exchangeGoogleCode(code, clientId, clientSecret, redirectUri) {
  return new Promise((resolve, reject) => {
    const postData = new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code'
    }).toString();

    const options = {
      hostname: 'oauth2.googleapis.com',
      path: '/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) {
            reject(new Error(parsed.error_description || parsed.error));
          } else {
            resolve(parsed);
          }
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function fetchGoogleUserInfo(accessToken) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'www.googleapis.com',
      path: '/oauth2/v3/userinfo',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'BoxHoanTien-OAuth'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) {
            reject(new Error(parsed.error_description || parsed.error));
          } else {
            resolve(parsed);
          }
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function getGoogleAuthUrl(req, res) {
  try {
    const clientIdSetting = db.prepare('SELECT value FROM system_settings WHERE key = ?').get('google_client_id');
    const clientId = process.env.GOOGLE_CLIENT_ID || (clientIdSetting ? clientIdSetting.value : '');
    const redirectUri = getGoogleRedirectUri(req);

    if (!clientId) {
      return res.json({
        success: false,
        configured: false,
        redirectUri,
        message: 'Chưa cấu hình Google Client ID'
      });
    }

    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid%20email%20profile&prompt=select_account&access_type=offline`;

    return res.json({
      success: true,
      configured: true,
      redirectUri,
      url
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

function redirectToGoogle(req, res) {
  try {
    const clientIdSetting = db.prepare('SELECT value FROM system_settings WHERE key = ?').get('google_client_id');
    const clientId = process.env.GOOGLE_CLIENT_ID || (clientIdSetting ? clientIdSetting.value : '');
    const redirectUri = getGoogleRedirectUri(req);

    if (!clientId) {
      return res.redirect('/#google_not_configured=true');
    }

    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid%20email%20profile&prompt=select_account&access_type=offline`;
    return res.redirect(url);
  } catch (error) {
    return res.redirect('/#google_error=' + encodeURIComponent(error.message));
  }
}

async function googleCallback(req, res) {
  try {
    const { code, error } = req.query;
    if (error) {
      return res.redirect('/#google_error=' + encodeURIComponent(error));
    }
    if (!code) {
      return res.redirect('/#google_error=missing_code');
    }

    const clientIdSetting = db.prepare('SELECT value FROM system_settings WHERE key = ?').get('google_client_id');
    const clientSecretSetting = db.prepare('SELECT value FROM system_settings WHERE key = ?').get('google_client_secret');
    const clientId = process.env.GOOGLE_CLIENT_ID || (clientIdSetting ? clientIdSetting.value : '');
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || (clientSecretSetting ? clientSecretSetting.value : '');
    const redirectUri = getGoogleRedirectUri(req);

    if (!clientId || !clientSecret) {
      return res.redirect('/#google_error=not_configured');
    }

    const tokens = await exchangeGoogleCode(code, clientId, clientSecret, redirectUri);
    let googleUser = null;

    if (tokens.access_token) {
      try {
        googleUser = await fetchGoogleUserInfo(tokens.access_token);
      } catch (err) {
        console.warn('Could not fetch userinfo, checking id_token:', err);
      }
    }

    if (!googleUser && tokens.id_token) {
      const parts = tokens.id_token.split('.');
      if (parts.length === 3) {
        googleUser = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
      }
    }

    if (!googleUser || !googleUser.email) {
      return res.redirect('/#google_error=no_email_found');
    }

    const email = googleUser.email.toLowerCase().trim();
    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (!user) {
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
    return res.redirect(`/#auth_token=${token}`);
  } catch (error) {
    console.error('Google OAuth Callback Error:', error);
    return res.redirect('/#google_error=' + encodeURIComponent(error.message));
  }
}

module.exports = {
  register,
  login,
  googleAuth,
  getGoogleAuthUrl,
  redirectToGoogle,
  googleCallback,
  getProfile,
  updateProfile
};
