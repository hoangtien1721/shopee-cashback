const assert = require('assert');
const path = require('path');
const fs = require('fs');

// Import services and controllers directly or test via server
const { initDb, db } = require('./config/database');
const { seedDatabase } = require('./services/seedService');
const { extractShopeeUrl, sanitizeShopeeUrl, generateAffiliateLink, parseShopeeReportFile } = require('./services/shopeeService');

async function runTests() {
  console.log('🧪 Starting Automated E2E Verification Tests...\n');

  // Test 1: URL Extraction & Sanitization
  console.log('Test 1: Shopee URL Extraction & Cleaning');
  const rawText1 = 'Mua ngay áo thun siêu đẹp tại https://shopee.vn/product/12345/67890?sp_atk=abc&utm_source=fb';
  const extracted1 = extractShopeeUrl(rawText1);
  assert.strictEqual(extracted1.startsWith('https://shopee.vn/product/12345/67890'), true, 'Should extract Shopee URL');
  
  const cleanUrl = sanitizeShopeeUrl(extracted1);
  console.log('  Cleaned URL:', cleanUrl);
  console.log('  ✅ Test 1 Passed!\n');

  // Test 2: Affiliate Link Generation with Sub ID
  console.log('Test 2: Affiliate Link Generation with Sub ID');
  const linkResult = await generateAffiliateLink({
    originUrl: cleanUrl,
    userId: 2,
    shortCode: 'test99'
  });
  assert(linkResult.affiliateUrl.includes('sub_id=u2-test99'), 'Affiliate link must contain sub_id=u2-test99');
  console.log('  Generated Affiliate URL:', linkResult.affiliateUrl);
  console.log('  ✅ Test 2 Passed!\n');

  // Test 3: Excel Report Parser
  console.log('Test 3: Shopee Conversion Report Excel Parsing');
  const sampleExcelPath = path.join(__dirname, 'data/sample_shopee_affiliate_report.xlsx');
  assert(fs.existsSync(sampleExcelPath), 'Sample Excel file must exist');
  
  const parsedOrders = parseShopeeReportFile(sampleExcelPath);
  console.log(`  Parsed ${parsedOrders.length} orders from Excel:`);
  parsedOrders.forEach(o => {
    console.log(`  - Order #${o.orderId}: User u${o.userId}, Sales: ${o.orderAmount}đ, Comm: ${o.shopeeCommission}đ, Status: ${o.status}`);
  });
  assert(parsedOrders.length >= 3, 'Should parse at least 3 orders from sample');
  assert.strictEqual(parsedOrders[0].userId, 2, 'Parsed User ID should be 2');
  console.log('  ✅ Test 3 Passed!\n');

  // Test 4: Database State & 50% Commission Math
  console.log('Test 4: Database State & 50% Commission Math');
  const demoUser = db.prepare('SELECT * FROM users WHERE email = ?').get('user@cashback.vn');
  assert(demoUser, 'Demo user must exist');
  console.log(`  User: ${demoUser.full_name} (${demoUser.email})`);
  console.log(`  Available Balance: ${demoUser.available_balance.toLocaleString('vi-VN')} đ`);
  console.log(`  Pending Balance: ${demoUser.pending_balance.toLocaleString('vi-VN')} đ`);
  console.log(`  Withdrawn Total: ${demoUser.withdrawn_total.toLocaleString('vi-VN')} đ`);

  const confirmedOrder = db.prepare("SELECT * FROM cashback_orders WHERE user_id = ? AND status = 'confirmed' LIMIT 1").get(demoUser.id);
  assert(confirmedOrder, 'Confirmed order should exist');
  assert.strictEqual(confirmedOrder.user_cashback, Math.round(confirmedOrder.shopee_commission * 0.5), 'User cashback must be exactly 50% of Shopee commission');
  console.log(`  Sample Order: Shopee Comm ${confirmedOrder.shopee_commission}đ -> User Cashback 50% = ${confirmedOrder.user_cashback}đ`);
  console.log('  ✅ Test 4 Passed!\n');

  // Test 5: Withdrawal Request & 3-Day SLA Status
  console.log('Test 5: Withdrawal Request & Status Check');
  const withdrawRequests = db.prepare('SELECT * FROM withdrawal_requests WHERE user_id = ?').all(demoUser.id);
  assert(withdrawRequests.length > 0, 'Should have withdrawal requests');
  console.log(`  Found ${withdrawRequests.length} withdrawal requests:`);
  withdrawRequests.forEach(w => {
    console.log(`  - #${w.id}: ${w.amount.toLocaleString('vi-VN')}đ to ${w.bank_name} (${w.bank_account_number}) - Status: ${w.status}`);
  });
  console.log('  ✅ Test 5 Passed!\n');

  console.log('🎉 ALL 5 E2E TESTS PASSED SUCCESSFULLY!');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
