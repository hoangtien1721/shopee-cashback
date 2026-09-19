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
 * Tự động bóc tách giá tiền nếu người dùng copy cả đoạn văn bản chia sẻ từ Shopee App
 * Ví dụ: "Combo 3 Túi Đường... chỉ với 85.000₫. Mua trên Shopee: https..."
 */
function extractPriceFromText(text) {
  if (!text || typeof text !== 'string') return 0;
  try {
    const match = text.match(/([0-9]{1,3}(?:[.,][0-9]{3})+|[0-9]{2,}\s*k)\s*(?:₫|đ|k|vnd)?/i) ||
                  text.match(/(?:chỉ với|giá|giá chỉ|với giá)\s*([0-9]{1,3}(?:[.,][0-9]{3})+|[0-9]+)/i);
    if (match) {
      let raw = match[1].toLowerCase().replace(/\s+/g, '');
      if (raw.endsWith('k')) {
        return parseInt(raw.replace('k', ''), 10) * 1000;
      }
      const cleanNum = parseInt(raw.replace(/[.,]/g, ''), 10);
      if (cleanNum >= 1000 && cleanNum <= 500000000) {
        return cleanNum;
      }
    }
  } catch (e) {}
  return 0;
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
  const affiliateId = getSetting('shopee_affiliate_id', 'partner_cashback');
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

/**
 * Chuẩn hóa tên sản phẩm
 */
function cleanProductTitle(raw) {
  if (!raw) return 'Sản phẩm Shopee';
  let title = decodeURIComponent(raw)
    .replace(/[-_+]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  if (title.length > 2) {
    return title.charAt(0).toUpperCase() + title.slice(1);
  }
  return 'Sản phẩm Shopee';
}

/**
 * Tự động phân tích sản phẩm từ link Shopee:
 * 1. Fetch Open Graph metadata (hình ảnh thật từ Shopee CDN, tiêu đề thật)
 * 2. Phân loại ngành hàng thông minh
 * 3. Trả về tỷ lệ hoàn tiền chuẩn xác thay vì giá giả lập gây hiểu nhầm
 */
async function analyzeShopeeProduct(url, explicitTitle = '', customPrice = 0) {
  let resolvedUrl = url;
  let scrapedImage = '';
  let scrapedTitle = '';

  // 1. Thử cào dữ liệu thật từ Shopee (sử dụng User-Agent crawler được Shopee cung cấp OG metadata)
  try {
    let targetFetchUrl = url;
    if (url.includes('an_redir') && url.includes('origin_link=')) {
      const parsed = new URL(url);
      if (parsed.searchParams.has('origin_link')) {
        targetFetchUrl = decodeURIComponent(parsed.searchParams.get('origin_link'));
      }
    }

    const res = await fetch(targetFetchUrl, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'User-Agent': 'WhatsApp/2.21.12.21 A',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7'
      }
    });

    if (res.url && res.url !== url) {
      resolvedUrl = res.url;
    }

    const html = await res.text();

    // Lấy hình ảnh thật từ og:image của Shopee CDN
    const ogImgMatch = html.match(/property=["']og:image["']\s+content=["']([^"']+)["']/i) ||
                       html.match(/content=["']([^"']+)["']\s+property=["']og:image["']/i);
    if (ogImgMatch && ogImgMatch[1] && !ogImgMatch[1].includes('shopee-logo') && !ogImgMatch[1].includes('default') && !ogImgMatch[1].endsWith('.ico')) {
      scrapedImage = ogImgMatch[1];
    }

    // Lấy tiêu đề thật từ og:title
    const ogTitleMatch = html.match(/property=["']og:title["']\s+content=["']([^"']+)["']/i) ||
                         html.match(/content=["']([^"']+)["']\s+property=["']og:title["']/i);
    if (ogTitleMatch && ogTitleMatch[1]) {
      let t = ogTitleMatch[1].replace(/\s*\|\s*Shopee Việt Nam.*$/i, '').trim();
      if (t && !t.includes('Shopee Việt Nam | Mua và Bán')) {
        scrapedTitle = t;
      }
    }
  } catch (err) {
    console.warn('Shopee OG scrape attempt warning:', err.message);
  }

  // 2. Tiêu đề sản phẩm
  let title = explicitTitle || scrapedTitle;
  if (!title) {
    try {
      const parsed = new URL(resolvedUrl);
      const pathParts = parsed.pathname.split('/').filter(Boolean);
      for (const part of pathParts) {
        if (part.includes('-i.')) {
          const slug = part.split('-i.')[0];
          title = cleanProductTitle(slug);
          break;
        } else if (!part.startsWith('product') && !part.startsWith('an_redir') && part.length > 5) {
          title = cleanProductTitle(part);
          break;
        }
      }
    } catch (e) {}
  }
  if (!title || title === 'Sản phẩm Shopee') {
    title = 'Sản phẩm Shopee hợp lệ';
  }

  // 3. Phân tích ngành hàng và tỷ lệ hoàn tiền
  const lower = title.toLowerCase();
  let category = 'Bách Hóa & Đời Sống';
  let cashbackRate = '7.0%';
  let price = 0; // 0 nghĩa là tính theo giá mua thực tế trên hóa đơn Shopee
  let estimatedCashback = 0;

  // Kiểm tra các mẫu demo có giá cố định để người dùng test
  if (lower.includes('honor x9b') || (lower.includes('honor') && lower.includes('x9'))) {
    category = 'Điện Thoại & Phụ Kiện';
    price = 5844500;
    cashbackRate = '4.0%';
    estimatedCashback = 116890;
    if (!scrapedImage) scrapedImage = 'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lsiujgfcw1ve42';
  } else if (lower.includes('soundcore space one') || (lower.includes('soundcore') && lower.includes('tai nghe'))) {
    category = 'Thiết Bị Âm Thanh';
    price = 1890000;
    cashbackRate = '8.0%';
    estimatedCashback = 75600;
  } else if (lower.includes('la roche-posay') || (lower.includes('la roche posay') && lower.includes('chống nắng'))) {
    category = 'Dược Mỹ Phẩm';
    price = 450000;
    cashbackRate = '8.5%';
    estimatedCashback = 19125;
  } else if (lower.includes('polo') && lower.includes('coolmate')) {
    category = 'Thời Trang Nam';
    price = 299000;
    cashbackRate = '10.5%';
    estimatedCashback = 15697;
  } else if (lower.includes('áo thun') || lower.includes('áo sơ mi') || lower.includes('áo khoác') || lower.includes('quần jean') || lower.includes('quần tây') || lower.includes('váy') || lower.includes('đầm') || lower.includes('giày sneaker') || lower.includes('giày cao gót') || lower.includes('túi xách') || lower.includes('túi đeo chéo') || lower.includes('balo')) {
    category = 'Thời Trang & Phụ Kiện';
    cashbackRate = '10.5%';
  } else if (lower.includes('son') || lower.includes('serum') || lower.includes('kem chống nắng') || lower.includes('kem dưỡng') || lower.includes('nước hoa') || lower.includes('sữa rửa mặt') || lower.includes('dưỡng da') || lower.includes('mỹ phẩm')) {
    category = 'Sức Khỏe & Sắc Đẹp';
    cashbackRate = '8.5%';
  } else if (lower.includes('đường') || lower.includes('muối') || lower.includes('gạo') || lower.includes('mì') || lower.includes('nước mắm') || lower.includes('dầu ăn') || lower.includes('bánh') || lower.includes('kẹo') || lower.includes('trà') || lower.includes('cà phê') || lower.includes('thực phẩm') || lower.includes('gia vị') || lower.includes('giấy vệ sinh') || lower.includes('khăn giấy') || lower.includes('nước giặt') || lower.includes('nước xả') || lower.includes('tạp hóa') || lower.includes('bách hóa')) {
    category = 'Bách Hóa Online & Tiêu Dùng';
    cashbackRate = '7.0%';
  } else if (lower.includes('nồi') || lower.includes('chảo') || lower.includes('quạt') || lower.includes('kệ') || lower.includes('đèn') || lower.includes('máy hút bụi') || lower.includes('gia dụng') || lower.includes('nhà cửa')) {
    category = 'Nhà Cửa & Đời Sống';
    cashbackRate = '6.5%';
  } else if (lower.includes('tã') || lower.includes('bỉm') || lower.includes('sữa bột') || lower.includes('xe đẩy') || lower.includes('trẻ em') || lower.includes('mẹ và bé')) {
    category = 'Mẹ & Bé';
    cashbackRate = '6.0%';
  } else if (lower.includes('điện thoại') || lower.includes('iphone') || lower.includes('samsung') || lower.includes('xiaomi') || lower.includes('oppo') || lower.includes('laptop') || lower.includes('macbook') || lower.includes('ipad') || lower.includes('máy tính bảng')) {
    category = 'Thiết Bị Điện Tử';
    cashbackRate = '4.0%';
  } else if (lower.includes('tai nghe') || lower.includes('loa') || lower.includes('sạc') || lower.includes('cáp') || lower.includes('chuột') || lower.includes('bàn phím') || lower.includes('ốp lưng')) {
    category = 'Phụ Kiện Công Nghệ';
    cashbackRate = '8.0%';
  } else {
    category = 'Sản Phẩm Shopee';
    cashbackRate = '5.0% - 10.5%';
  }

  // Nếu có giá tùy chọn hoặc bóc tách từ văn bản chia sẻ
  if (customPrice && customPrice > 0) {
    price = customPrice;
    const rateNum = parseFloat(cashbackRate) || 7.0;
    // Tiền hoàn cho user = 50% hoa hồng Shopee chi trả
    estimatedCashback = Math.round(customPrice * (rateNum / 100) * 0.5);
  }

  // Hình ảnh: Ưu tiên hình ảnh thật lấy từ Shopee CDN
  const image = scrapedImage || '';

  return {
    resolvedUrl,
    title,
    category,
    cashbackRate,
    price,
    estimatedCashback,
    image
  };
}

module.exports = {
  extractShopeeUrl,
  extractPriceFromText,
  sanitizeShopeeUrl,
  extractProductTitle,
  generateShortCode,
  generateAffiliateLink,
  parseShopeeReportFile,
  getSetting,
  analyzeShopeeProduct
};

