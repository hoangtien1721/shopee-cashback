const { db } = require('../config/database');
const {
  extractShopeeUrl,
  sanitizeShopeeUrl,
  extractProductTitle,
  generateShortCode,
  generateAffiliateLink
} = require('../services/shopeeService');

async function convertLink(req, res) {
  try {
    const { url, product_title } = req.body;
    const userId = req.user.id;

    if (!url) {
      return res.status(400).json({ success: false, message: 'Vui lòng dán link Shopee' });
    }

    const rawUrl = extractShopeeUrl(url);
    if (!rawUrl) {
      return res.status(400).json({
        success: false,
        message: 'Không tìm thấy link Shopee hợp lệ. Link phải có dạng shopee.vn, s.shopee.vn hoặc shp.ee'
      });
    }

    const cleanUrl = sanitizeShopeeUrl(rawUrl);
    const shortCode = generateShortCode(8);

    // Tạo link affiliate có gắn sub_id
    const { affiliateUrl, mode } = await generateAffiliateLink({
      originUrl: cleanUrl,
      userId,
      shortCode
    });

    const host = req.get('host');
    const protocol = req.protocol;
    const localRedirectUrl = `${protocol}://${host}/api/links/go/${shortCode}`;
    const finalTitle = product_title || extractProductTitle(cleanUrl);

    // Lưu vào cơ sở dữ liệu
    const stmt = db.prepare(`
      INSERT INTO converted_links (user_id, original_url, clean_url, affiliate_url, short_code, product_title)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      userId,
      rawUrl,
      cleanUrl,
      affiliateUrl,
      shortCode,
      finalTitle
    );

    const savedLink = db.prepare('SELECT * FROM converted_links WHERE id = ?').get(result.lastInsertRowid);


    return res.json({
      success: true,
      message: 'Chuyển đổi link hoàn tiền thành công!',
      link: {
        ...savedLink,
        localRedirectUrl
      }
    });
  } catch (error) {
    console.error('Convert link error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi chuyển đổi link: ' + error.message });
  }
}

function getUserLinks(req, res) {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const links = db.prepare(`
      SELECT * FROM converted_links
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).all(userId, limit, offset);

    const total = db.prepare('SELECT COUNT(*) as count FROM converted_links WHERE user_id = ?').get(userId).count;

    return res.json({
      success: true,
      links,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

function redirectLink(req, res) {
  try {
    const { shortCode } = req.params;

    const link = db.prepare('SELECT * FROM converted_links WHERE short_code = ?').get(shortCode);

    if (!link) {
      return res.status(404).send('Link không tồn tại hoặc đã hết hạn.');
    }

    // Tăng số lượt click
    db.prepare('UPDATE converted_links SET clicks_count = clicks_count + 1 WHERE id = ?').run(link.id);

    // Chuyển hướng người dùng sang link affiliate Shopee
    return res.redirect(link.affiliate_url);
  } catch (error) {
    return res.status(500).send('Lỗi chuyển hướng: ' + error.message);
  }
}

module.exports = {
  convertLink,
  getUserLinks,
  redirectLink
};
