import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import WithdrawPage from './pages/WithdrawPage';
import AdminDashboard from './pages/admin/AdminDashboard';

function MainApp() {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'dashboard' | 'withdraw' | 'admin'
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');

  const openAuth = (mode = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={openAuth}
      />

      {/* Main Content View */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <HomePage
            onOpenAuth={openAuth}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'dashboard' && (
          user ? (
            <DashboardPage onNavigate={(tab) => setActiveTab(tab)} />
          ) : (
            <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl text-center shadow-lg border border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Vui lòng đăng nhập</h3>
              <p className="text-xs text-slate-500 mb-6">Bạn cần đăng nhập tài khoản để xem ví tiền và lịch sử hoàn tiền Shopee.</p>
              <button
                onClick={() => openAuth('login')}
                className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-sm"
              >
                Đăng nhập ngay
              </button>
            </div>
          )
        )}

        {activeTab === 'withdraw' && (
          user ? (
            <WithdrawPage onNavigate={(tab) => setActiveTab(tab)} />
          ) : (
            <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl text-center shadow-lg border border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Vui lòng đăng nhập</h3>
              <p className="text-xs text-slate-500 mb-6">Đăng nhập để rút số dư cashback về tài khoản ngân hàng của bạn trong 3 ngày.</p>
              <button
                onClick={() => openAuth('login')}
                className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-sm"
              >
                Đăng nhập ngay
              </button>
            </div>
          )
        )}

        {activeTab === 'admin' && (
          isAdmin ? (
            <AdminDashboard onNavigate={(tab) => setActiveTab(tab)} />
          ) : (
            <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl text-center shadow-lg border border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Yêu cầu quyền Quản trị viên</h3>
              <p className="text-xs text-slate-500 mb-6">Khu vực này chỉ dành cho Admin đối soát và duyệt thanh toán.</p>
              <button
                onClick={() => openAuth('login')}
                className="w-full py-3 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl text-sm"
              >
                Đăng nhập bằng tài khoản Admin
              </button>
            </div>
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
        onSuccess={() => {
          // If logged in on a protected tab, keep it, otherwise can stay on current
        }}
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
