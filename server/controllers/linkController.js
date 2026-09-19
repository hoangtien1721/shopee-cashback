const { db } = require('../config/database');
const {
  extractShopeeUrl,
  sanitizeShopeeUrl,
  extractProductTitle,
  generateShortCode,
  generateAffiliateLink,
  analyzeShopeeProduct
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

    // Phân tích thông tin sản phẩm và tính toán tiền hoàn dự kiến
    const productInfo = await analyzeShopeeProduct(rawUrl, product_title);

    // Tạo link affiliate có gắn sub_id
    const { affiliateUrl, mode } = await generateAffiliateLink({
      originUrl: cleanUrl,
      userId,
      shortCode
    });

    const host = req.get('host');
    const protocol = req.protocol;
    const localRedirectUrl = `${protocol}://${host}/api/links/go/${shortCode}`;

    // Lưu vào cơ sở dữ liệu
    const stmt = db.prepare(`
      INSERT INTO converted_links (
        user_id, original_url, clean_url, affiliate_url, short_code,
        product_title, product_image, product_price, estimated_cashback, category_name
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      userId,
      rawUrl,
      cleanUrl,
      affiliateUrl,
      shortCode,
      productInfo.title,
      productInfo.image,
      productInfo.price,
      productInfo.estimatedCashback,
      productInfo.category
    );

    const savedLink = db.prepare('SELECT * FROM converted_links WHERE id = ?').get(result.lastInsertRowid);

    return res.json({
      success: true,
      message: 'Chuyển đổi link hoàn tiền thành công!',
      link: {
        ...savedLink,
        localRedirectUrl,
        product_title: productInfo.title,
        product_image: productInfo.image,
        product_price: productInfo.price,
        estimated_cashback: productInfo.estimatedCashback,
        cashback_rate: productInfo.cashbackRate,
        category_name: productInfo.category
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
