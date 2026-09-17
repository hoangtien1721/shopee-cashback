const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { initDb } = require('./config/database');
const { seedDatabase } = require('./services/seedService');
const { authenticateToken, requireAdmin } = require('./middleware/auth');

const authController = require('./controllers/authController');
const linkController = require('./controllers/linkController');
const orderController = require('./controllers/orderController');
const withdrawController = require('./controllers/withdrawController');
const adminController = require('./controllers/adminController');

// Khởi tạo DB & Seed data
initDb();
seedDatabase();

const app = express();
const PORT = process.env.PORT || 8080;

// Setup upload directory
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'report-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- PUBLIC & REDIRECT ROUTES ---
app.get('/api/links/go/:shortCode', linkController.redirectLink);

// --- AUTH ROUTES ---
app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);
app.get('/api/auth/profile', authenticateToken, authController.getProfile);
app.put('/api/auth/profile', authenticateToken, authController.updateProfile);

// --- USER LINK CONVERSION ---
app.post('/api/links/convert', authenticateToken, linkController.convertLink);
app.get('/api/links', authenticateToken, linkController.getUserLinks);

// --- USER CASHBACK ORDERS & STATS ---
app.get('/api/orders', authenticateToken, orderController.getUserOrders);
app.get('/api/orders/stats', authenticateToken, orderController.getUserStats);

// --- USER WITHDRAWALS ---
app.post('/api/withdrawals', authenticateToken, withdrawController.createWithdrawRequest);
app.get('/api/withdrawals', authenticateToken, withdrawController.getUserWithdrawals);

// --- ADMIN ROUTES ---
app.get('/api/admin/stats', authenticateToken, requireAdmin, adminController.getAdminStats);
app.get('/api/admin/users', authenticateToken, requireAdmin, adminController.getAllUsers);

app.get('/api/admin/orders', authenticateToken, requireAdmin, adminController.getAllOrders);
app.post('/api/admin/orders', authenticateToken, requireAdmin, adminController.addManualOrder);
app.put('/api/admin/orders/:id/confirm', authenticateToken, requireAdmin, adminController.confirmOrder);
app.put('/api/admin/orders/:id/reject', authenticateToken, requireAdmin, adminController.rejectOrder);
app.post('/api/admin/orders/import-excel', authenticateToken, requireAdmin, upload.single('file'), adminController.importShopeeReport);

// Route tải file Excel mẫu cho Admin thử nghiệm
app.get('/api/admin/sample-report', authenticateToken, requireAdmin, (req, res) => {
  const samplePath = path.join(__dirname, 'data/sample_shopee_affiliate_report.xlsx');
  if (fs.existsSync(samplePath)) {
    return res.download(samplePath, 'sample_shopee_affiliate_report.xlsx');
  }
  return res.status(404).json({ success: false, message: 'File mẫu chưa được tạo' });
});

app.get('/api/admin/withdrawals', authenticateToken, requireAdmin, adminController.getAllWithdrawals);
app.put('/api/admin/withdrawals/:id', authenticateToken, requireAdmin, adminController.processWithdrawal);

app.get('/api/admin/settings', authenticateToken, requireAdmin, adminController.getSettings);
app.put('/api/admin/settings', authenticateToken, requireAdmin, adminController.updateSettings);
app.post('/api/admin/test-shopee-api', authenticateToken, requireAdmin, adminController.testShopeeApi);

// Health check (supports /health and /api/health for UptimeRobot & keep-alive pingers)
app.get(['/health', '/api/health'], (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: 'Shopee Cashback API'
  });
});

// Serve frontend build in production / unified mode
const clientDist = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  // Express 5 fallback handler for SPA
  app.use((req, res) => {
    if (!req.path.startsWith('/api')) {
      return res.sendFile(path.join(clientDist, 'index.html'));
    }
    res.status(404).json({ success: false, message: 'API route not found' });
  });
}

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Shopee Cashback Platform running on http://localhost:${PORT}`);
});

