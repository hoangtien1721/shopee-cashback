import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import WithdrawPage from './pages/WithdrawPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import { Shield, Lock, Mail, AlertCircle, ArrowLeft } from 'lucide-react';

function AdminGatekeeper({ onLoginSuccess, onCancel }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.user?.role !== 'admin') {
        throw new Error('Tài khoản này không có quyền Quản trị viên hệ thống.');
      }
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setError(err.message || 'Email hoặc mật khẩu quản trị không chính xác.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-16 px-4">
      <div className="bg-white rounded-2xl p-7 shadow-xl border border-gray-200">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-gray-900 text-white flex items-center justify-center mx-auto mb-3 shadow-md">
            <Shield className="w-6 h-6 text-orange-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Cổng Quản Trị Hệ Thống</h2>
          <p className="text-xs text-gray-500 mt-1">
            Khu vực giới hạn nội bộ. Vui lòng xác thực tài khoản quản trị viên để tiếp tục.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl mb-4">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Email Quản trị viên *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                placeholder="admin@boxhoantien.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Mật khẩu Quản trị *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-gray-900 hover:bg-black disabled:opacity-50 text-white rounded-lg font-bold text-xs shadow-md transition-colors cursor-pointer"
          >
            {loading ? 'Đang xác thực...' : 'Đăng nhập Cổng Quản Trị'}
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-gray-100 text-center">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại trang chủ</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function MainApp() {
  const { user, isAdmin, loginWithToken } = useAuth();
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'dashboard' | 'withdraw' | 'admin'
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');
  const [toastNotification, setToastNotification] = useState(null);

  // Secret URL listener: #admin-management (or #admin) & Google OAuth Token handler
  useEffect(() => {
    const handleHash = async () => {
      const fullHash = window.location.hash || '';
      const hash = fullHash.toLowerCase();

      // 1. Google OAuth Token Return
      if (fullHash.includes('auth_token=')) {
        const match = fullHash.match(/auth_token=([^&]+)/);
        if (match && match[1]) {
          const token = decodeURIComponent(match[1]);
          const loggedIn = await loginWithToken(token);
          window.history.replaceState(null, '', window.location.pathname);
          if (loggedIn) {
            setToastNotification({
              type: 'success',
              message: `Xin chào ${loggedIn.full_name || loggedIn.email}! Bạn đã đăng nhập thành công bằng tài khoản Google.`
            });
            setTimeout(() => setToastNotification(null), 5000);
          }
          return;
        }
      }

      // 2. Google OAuth Error / Not Configured Handlers
      if (fullHash.includes('google_not_configured=true')) {
        window.history.replaceState(null, '', window.location.pathname);
        setToastNotification({
          type: 'warning',
          message: 'Chưa cấu hình Google Client ID. Vào #admin-management (Cài đặt) để nhập Client ID từ Google Cloud Console.'
        });
        setTimeout(() => setToastNotification(null), 7000);
        return;
      }

      if (fullHash.includes('google_error=')) {
        const match = fullHash.match(/google_error=([^&]+)/);
        const err = match ? decodeURIComponent(match[1]) : 'Lỗi xác thực';
        window.history.replaceState(null, '', window.location.pathname);
        setToastNotification({
          type: 'error',
          message: `Lỗi đăng nhập Google: ${err}`
        });
        setTimeout(() => setToastNotification(null), 6000);
        return;
      }

      // 3. Navigation
      if (hash === '#admin-management' || hash === '#admin') {
        setActiveTab('admin');
      } else if (hash === '#dashboard') {
        setActiveTab('dashboard');
      } else if (hash === '#withdraw') {
        setActiveTab('withdraw');
      } else if (activeTab === 'admin' && !hash.includes('admin')) {
        setActiveTab('home');
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const openAuth = (mode = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const navigateTo = (tab) => {
    if (tab === 'home') {
      window.history.replaceState(null, '', window.location.pathname);
    } else if (tab === 'admin') {
      window.location.hash = '#admin-management';
    }
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-gray-900 font-sans">
      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={navigateTo}
        onOpenAuth={openAuth}
      />

      {/* Global Toast Notification */}
      {toastNotification && (
        <div className="max-w-4xl mx-auto px-4 pt-3 w-full animate-in fade-in duration-200">
          <div className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between shadow-sm ${
            toastNotification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : toastNotification.type === 'warning'
              ? 'bg-amber-50 border-amber-200 text-amber-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{toastNotification.message}</span>
            </div>
            <button
              onClick={() => setToastNotification(null)}
              className="text-xs opacity-70 hover:opacity-100 font-bold ml-2 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Content View */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <HomePage
            onOpenAuth={openAuth}
            onNavigate={navigateTo}
          />
        )}

        {activeTab === 'dashboard' && (
          user ? (
            <DashboardPage onNavigate={navigateTo} />
          ) : (
            <div className="max-w-md mx-auto my-16 p-6 sm:p-8 bg-white rounded-xl text-center shadow-lg border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Vui lòng đăng nhập</h3>
              <p className="text-xs text-gray-500 mb-6">Bạn cần đăng nhập tài khoản để xem ví tiền và lịch sử hoàn tiền Shopee.</p>
              <button
                onClick={() => openAuth('login')}
                className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg text-xs cursor-pointer shadow-xs"
              >
                Đăng nhập ngay
              </button>
            </div>
          )
        )}

        {activeTab === 'withdraw' && (
          user ? (
            <WithdrawPage onNavigate={navigateTo} />
          ) : (
            <div className="max-w-md mx-auto my-16 p-6 sm:p-8 bg-white rounded-xl text-center shadow-lg border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Vui lòng đăng nhập</h3>
              <p className="text-xs text-gray-500 mb-6">Đăng nhập để rút số dư hoàn tiền về tài khoản ngân hàng của bạn trong 3 ngày.</p>
              <button
                onClick={() => openAuth('login')}
                className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg text-xs cursor-pointer shadow-xs"
              >
                Đăng nhập ngay
              </button>
            </div>
          )
        )}

        {/* SECRET ADMIN MANAGEMENT ROUTE */}
        {activeTab === 'admin' && (
          isAdmin ? (
            <AdminDashboard onNavigate={navigateTo} />
          ) : (
            <AdminGatekeeper
              onLoginSuccess={() => setActiveTab('admin')}
              onCancel={() => navigateTo('home')}
            />
          )
        )}
      </main>

      {/* Global Footer */}
      <Footer />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
        onSuccess={() => {}}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
