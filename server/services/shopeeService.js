const crypto = require('crypto');
const xlsx = require('xlsx');
const { db } = require('../config/database');

/**
 * Bóc tách link Shopee từ bất kỳ văn bản nào (tin nhắn, copy từ app có kèm text)
 */
function extractShopeeUrl(text) {
  if (!text || typeof text !== 'string') return null;

  // Regex tìm URL Shopee (shopee.vn, s.shopee.vn, vn.shp.ee, shp.ee)
  const urlRegex = /(https?:\/\/(?:[a-zA-Z0-9_-]+\.)?shopee\.vn\/[^\s]+|https?:\/\/(?:[a-zA-Z0-9_-]+\.)?shp\.ee\/[^\s]+)/i;
  const match = text.match(urlRegex);

  if (!match) return null;

  let url = match[1].trim();

  // Làm sạch các ký tự thừa ở cuối nếu có (dấu ngoặc, chấm, phẩy)
  url = url.replace(/[\)\],.;!]+$/, '');

  return url;
}

/**
 * Làm sạch link Shopee để giữ lại link sản phẩm chuẩn
 */
function sanitizeShopeeUrl(url) {
  try {
    const parsed = new URL(url);

    // Nếu là link rút gọn s.shopee.vn hoặc shp.ee thì giữ nguyên
    if (parsed.hostname.includes('s.shopee.vn') || parsed.hostname.includes('shp.ee')) {
      return url;
    }

    // Nếu là link sản phẩm shopee.vn thì loại bỏ các tham số tracking rác
    const searchParams = new URLSearchParams(parsed.search);
    const cleanParams = new URLSearchParams();

    // Giữ lại các param quan trọng nếu có (như sp_atk, shop_id, item_id)
    ['sp_atk', 'shopid', 'itemid'].forEach(key => {
      if (searchParams.has(key)) {
        cleanParams.set(key, searchParams.get(key));
      }
    });

    const queryString = cleanParams.toString();
    return `${parsed.origin}${parsed.pathname}${queryString ? '?' + queryString : ''}`;
  } catch (e) {
    return url;
  }
}

/**
 * Bóc tách tên sản phẩm dễ nhìn từ đường dẫn Shopee
 */
function extractProductTitle(url) {
  try {
    const parsed = new URL(url);
    const pathParts = parsed.pathname.split('/').filter(Boolean);
    if (pathParts.length > 0) {
      let slug = pathParts[0];
      if (slug.includes('-i.')) {
        slug = slug.split('-i.')[0];
      }
      const title = decodeURIComponent(slug.replace(/[-_+]/g, ' ')).trim();
      if (title && title.length > 2 && !title.startsWith('product') && !title.startsWith('an_redir')) {
        return title.charAt(0).toUpperCase() + title.slice(1);
      }
    }
  } catch (e) {}
  return 'Sản phẩm Shopee';
}

/**
 * Tạo mã ngắn ngẫu nhiên cho link
 */
function generateShortCode(length = 6) {
  return crypto.randomBytes(length).toString('hex').substring(0, length);
}


/**
 * Lấy cấu hình hệ thống từ SQLite
 */
function getSetting(key, defaultValue = '') {
  try {
    const row = db.prepare('SELECT value FROM system_settings WHERE key = ?').get(key);
    return row ? row.value : defaultValue;
  } catch (e) {
    return defaultValue;
  }
}

/**
 * Tạo link Shopee Affiliate có gắn Sub ID theo User ID
 */
async function generateAffiliateLink({ originUrl, userId, shortCode }) {
  const appId = getSetting('shopee_app_id');
  const appSecret = getSetting('shopee_app_secret');
  const shopeeCookie = getSetting('shopee_cookie');
  const subId1 = `u${userId}`;
  const subId2 = shortCode;

  // 1. Thử gọi qua Shopee Web Session Cookie nếu Admin cung cấp SPC_EC / Cookie
  if (shopeeCookie) {
    try {
      const cleanCookie = shopeeCookie.includes('SPC_EC=') ? shopeeCookie : `SPC_EC=${shopeeCookie}`;
      const query = `
        mutation {
          batchCustomLink(linkParams: [{
            originalLink: "${originUrl}",
            subIdCollection: {
              subId1: "${subId1}",
              subId2: "${subId2}"
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
        return {
          affiliateUrl: resJson.data.batchCustomLink[0].shortLink,
          mode: 'session_cookie'
        };
      }
    } catch (cookieErr) {
      console.warn('Shopee Cookie internal API call failed, falling back to Universal Link:', cookieErr.message);
    }
  }

  // 2. Thử gọi Shopee Affiliate GraphQL API nếu có Open API
  if (appId && appSecret) {
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const query = `
        mutation {
          generateShortLink(input: {
            originUrl: "${originUrl}",
            subIds: ["${subId1}", "${subId2}"]
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
      if (data && data.data && data.data.generateShortLink && data.data.generateShortLink.shortLink) {
        return {
          affiliateUrl: data.data.generateShortLink.shortLink,
          mode: 'api_graphql'
        };
      }
    } catch (apiError) {
      console.warn('Shopee Affiliate API call failed, falling back to universal redirect link:', apiError.message);
    }
  }

  // 3. Chế độ Universal Affiliate Link (gắn Affiliate ID trực tiếp - Hoạt động 100% không cần Open API)
  const affiliateId = getSetting('shopee_affiliate_id', 'viva_cashback');
  const encodedOrigin = encodeURIComponent(originUrl);
  
  // Format link redirect affiliate Shopee với sub_id
  const affiliateUrl = `https://s.shopee.vn/an_redir?origin_link=${encodedOrigin}&affiliate_id=${affiliateId}&sub_id=${subId1}-${subId2}`;

  return {
    affiliateUrl,
    mode: 'universal_redirect'
  };
}


/**
 * Bóc tách file báo cáo doanh thu Shopee Affiliate (Excel hoặc CSV)
 * Hỗ trợ các định dạng file Conversion Report tiêu chuẩn của Shopee
 */
function parseShopeeReportFile(filePath) {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // Chuyển sheet sang dạng JSON
  const rawRows = xlsx.utils.sheet_to_json(worksheet, { defval: '' });

  const parsedOrders = [];

  for (const row of rawRows) {
    // Tìm các trường dựa trên các biến thể tên cột của Shopee
    // Tiếng Anh: 'Purchase Time', 'Order ID', 'Sub ID 1', 'Total Commission', 'Order Amount'
    // Tiếng Việt: 'Thời gian mua', 'Mã đơn hàng', 'Mã phụ 1' / 'Sub ID 1', 'Hoa hồng thực tế', 'Giá trị đơn'
    
    const orderId = row['Order ID'] || row['Mã đơn hàng'] || row['OrderID'] || row['order_id'] || '';
    const subId1 = row['Sub ID 1'] || row['Mã phụ 1'] || row['Sub_ID_1'] || row['sub_id_1'] || row['Sub ID'] || '';
    const subId2 = row['Sub ID 2'] || row['Mã phụ 2'] || row['Sub_ID_2'] || row['sub_id_2'] || '';
    
    // Giá trị đơn hàng
    let orderAmount = row['Order Amount'] || row['Giá trị đơn'] || row['Gross Sales'] || row['order_amount'] || 0;
    if (typeof orderAmount === 'string') {
      orderAmount = parseFloat(orderAmount.replace(/[^0-9.-]+/g, '')) || 0;
    }

    // Hoa hồng Shopee chi trả
    let commission = row['Total Commission'] || row['Hoa hồng'] || row['Estimated Total Commission'] || row['Hoa hồng thực tế'] || row['Actual Commission'] || row['commission'] || 0;
    if (typeof commission === 'string') {
      commission = parseFloat(commission.replace(/[^0-9.-]+/g, '')) || 0;
    }

    // Trạng thái đơn hàng
    const statusText = (row['Order Status'] || row['Trạng thái đơn'] || row['Status'] || '').toLowerCase();
    let status = 'pending';
    if (statusText.includes('complete') || statusText.includes('hoàn thành') || statusText.includes('thành công') || statusText.includes('valid')) {
      status = 'confirmed';
    } else if (statusText.includes('cancel') || statusText.includes('hủy') || statusText.includes('return') || statusText.includes('trả') || statusText.includes('invalid')) {
      status = 'rejected';
    }

    // Tên sản phẩm
    const productName = row['Item Name'] || row['Tên sản phẩm'] || row['Product Name'] || row['Shop Name'] || 'Đơn hàng Shopee';

    // Bóc tách User ID từ Sub ID 1 (Ví dụ: "u3" -> userId = 3, hoặc "3" -> 3)
    let matchedUserId = null;
    if (subId1) {
      const match = String(subId1).match(/u?(\d+)/i);
      if (match) {
        matchedUserId = parseInt(match[1], 10);
      }
    }

    if (orderId && matchedUserId) {
      parsedOrders.push({
        orderId: String(orderId).trim(),
        userId: matchedUserId,
        subCode: subId2 || '',
        orderAmount: Math.round(orderAmount),
        shopeeCommission: Math.round(commission),
        status,
        productName: String(productName).trim()
      });
    }
  }

  return parsedOrders;
}

module.exports = {
  extractShopeeUrl,
  sanitizeShopeeUrl,
  extractProductTitle,
  generateShortCode,
  generateAffiliateLink,
  parseShopeeReportFile,
  getSetting
};

