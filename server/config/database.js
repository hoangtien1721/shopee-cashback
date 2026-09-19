const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'cashback.db');
const db = new Database(dbPath);

// Enable WAL mode for high concurrency
db.pragma('journal_mode = WAL');

// Initialize tables
function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      full_name TEXT NOT NULL,
      phone TEXT,
      role TEXT DEFAULT 'user', -- 'user' | 'admin'
      bank_name TEXT DEFAULT '',
      bank_account_number TEXT DEFAULT '',
      bank_account_name TEXT DEFAULT '',
      available_balance INTEGER DEFAULT 0,
      pending_balance INTEGER DEFAULT 0,
      withdrawn_total INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS converted_links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      original_url TEXT NOT NULL,
      clean_url TEXT NOT NULL,
      affiliate_url TEXT NOT NULL,
      short_code TEXT UNIQUE NOT NULL,
      product_title TEXT DEFAULT '',
      product_image TEXT DEFAULT '',
      product_price INTEGER DEFAULT 0,
      estimated_cashback INTEGER DEFAULT 0,
      category_name TEXT DEFAULT '',
      clicks_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS cashback_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      shopee_order_id TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      link_id INTEGER,
      order_amount INTEGER NOT NULL DEFAULT 0,
      shopee_commission INTEGER NOT NULL DEFAULT 0,
      user_rate REAL DEFAULT 0.5,
      user_cashback INTEGER NOT NULL DEFAULT 0,
      status TEXT DEFAULT 'pending', -- 'pending' | 'confirmed' | 'rejected'
      product_names TEXT DEFAULT '',
      order_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      confirmed_time DATETIME,
      note TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS withdrawal_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      amount INTEGER NOT NULL,
      bank_name TEXT NOT NULL,
      bank_account_number TEXT NOT NULL,
      bank_account_name TEXT NOT NULL,
      status TEXT DEFAULT 'pending', -- 'pending' | 'processing' | 'completed' | 'rejected'
      admin_note TEXT DEFAULT '',
      bank_trans_code TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      processed_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS system_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      description TEXT DEFAULT ''
    );
  `);

  // Safe column migrations for existing tables
  try { db.exec("ALTER TABLE converted_links ADD COLUMN product_image TEXT DEFAULT ''"); } catch(e){}
  try { db.exec("ALTER TABLE converted_links ADD COLUMN product_price INTEGER DEFAULT 0"); } catch(e){}
  try { db.exec("ALTER TABLE converted_links ADD COLUMN estimated_cashback INTEGER DEFAULT 0"); } catch(e){}
  try { db.exec("ALTER TABLE converted_links ADD COLUMN category_name TEXT DEFAULT ''"); } catch(e){}

  // Default settings
  const insertSetting = db.prepare(`
    INSERT OR IGNORE INTO system_settings (key, value, description)
    VALUES (?, ?, ?)
  `);

  insertSetting.run('cashback_rate', '0.5', 'Tỷ lệ chia sẻ hoa hồng cho người dùng (0.5 = 50%)');
  insertSetting.run('min_withdrawal', '50000', 'Hạn mức rút tiền tối thiểu (VNĐ)');
  insertSetting.run('payout_sla_days', '3', 'Thời gian cam kết chi trả (ngày làm việc)');
  insertSetting.run('shopee_app_id', '', 'Shopee Affiliate Open API App ID');
  insertSetting.run('shopee_app_secret', '', 'Shopee Affiliate Open API Secret Key');
  insertSetting.run('shopee_affiliate_id', 'partner_cashback_master', 'Shopee Affiliate Partner ID');
  insertSetting.run('site_name', 'Box Hoàn Tiền - Nền tảng hoàn tiền Shopee 50%', 'Tên website');
  insertSetting.run('google_client_id', process.env.GOOGLE_CLIENT_ID || '', 'Google OAuth Client ID cho đăng nhập Gmail');
  insertSetting.run('google_client_secret', process.env.GOOGLE_CLIENT_SECRET || '', 'Google OAuth Client Secret');

  console.log('Database initialized successfully with WAL mode at:', dbPath);
}

module.exports = {
  db,
  initDb
};
