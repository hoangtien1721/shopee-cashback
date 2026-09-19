import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, Mail, User, Phone, CreditCard, AlertCircle } from 'lucide-react';
import { VIETNAM_BANKS, apiRequest } from '../services/api';

function GoogleIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.26 21.36 7.33 24 12 24z"/>
      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.02-3.15z"/>
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
    </svg>
  );
}

export default function AuthModal({ isOpen, onClose, initialMode = 'login', onSuccess }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [bankName, setBankName] = useState('Vietcombank');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankAccountName, setBankAccountName] = useState('');

  useEffect(() => {
    setMode(initialMode);
    setError('');
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  // Xử lý khi bấm nút "Đăng nhập bằng Google": Chuyển hướng 100% sang accounts.google.com
  const handleGoogleSignInClick = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      // 1. Kiểm tra URL đăng nhập Google từ server
      const res = await apiRequest('/auth/google/url');
      if (res && res.configured && res.url) {
        // CHUYỂN HƯỚNG TRỰC TIẾP 100% SANG TRANG accounts.google.com
        window.location.href = res.url;
        return;
      }

      // Nếu chưa cấu hình Google Client ID trên Cloud Console:
      setError('Chưa cấu hình Google Client ID. Vui lòng vào Cài đặt Quản trị (#admin-management) để nhập Google Client ID & Secret từ Google Cloud Console trước khi chuyển hướng sang accounts.google.com.');
    } catch (err) {
      // Thử chuyển hướng trực tiếp qua endpoint backend
      window.location.href = '/api/auth/google/redirect';
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register({
          email,
          password,
          full_name: fullName,
          phone,
          bank_name: bankName,
          bank_account_number: bankAccountNumber,
          bank_account_name: bankAccountName.toUpperCase()
        });
      }
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Đã có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-gray-200 max-h-[95vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1.5 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tab switch */}
        <div className="flex p-1 bg-gray-100 rounded-xl mb-5">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              mode === 'login' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(''); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              mode === 'register' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Đăng ký nhận hoàn tiền
          </button>
        </div>

        <div className="text-center mb-5">
          <h3 className="text-xl font-bold text-gray-900 tracking-tight">
            {mode === 'login' ? 'Chào mừng bạn quay lại!' : 'Tạo tài khoản Box Hoàn Tiền'}
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {mode === 'login'
              ? 'Đăng nhập để xem số dư và rút tiền hoàn Shopee'
              : 'Đăng ký nhận hoàn tiền đến 50% cho mọi đơn hàng Shopee'}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl mb-4 leading-relaxed space-y-1">
            <div className="flex items-center gap-2 font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Thông báo xác thực Google:</span>
            </div>
            <p className="pl-6 text-[11px] text-red-600">{error}</p>
          </div>
        )}

        {/* GOOGLE SIGN IN BUTTON */}
        <div className="space-y-3 mb-5">
          <button
            type="button"
            onClick={handleGoogleSignInClick}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white hover:bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 transition-all shadow-xs cursor-pointer hover:border-gray-400 hover:shadow-sm"
          >
            <GoogleIcon className="w-4 h-4 shrink-0" />
            <span>
              {googleLoading
                ? 'Đang chuyển hướng sang accounts.google.com...'
                : mode === 'login'
                ? 'Đăng nhập bằng Google'
                : 'Đăng ký nhanh bằng Google'}
            </span>
          </button>
          <div className="text-center">
            <span className="text-[10px] text-gray-400">Chuyển hướng chính thức tới accounts.google.com</span>
          </div>

          <div className="relative flex items-center justify-center pt-2">
            <div className="border-t border-gray-200 w-full"></div>
            <span className="bg-white px-3 text-[11px] font-medium text-gray-400 uppercase tracking-wider absolute">
              hoặc tiếp tục với email
            </span>
          </div>
        </div>

        {/* EMAIL & PASSWORD FORM */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Họ và tên *</label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="Nguyễn Văn A"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-orange-500 focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Email đăng nhập *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-orange-500 focus:border-orange-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Mật khẩu *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                placeholder="Tối thiểu 6 ký tự"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-orange-500 focus:border-orange-500 focus:outline-none"
              />
            </div>
          </div>

          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Số điện thoại (Nhận thông báo)</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    placeholder="0912345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-orange-500 focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Bank details for payouts */}
              <div className="pt-2 border-t border-gray-100">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-800 mb-2">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Tài khoản ngân hàng nhận tiền hoàn</span>
                </div>

                <div className="space-y-2.5">
                  <div>
                    <label className="block text-[11px] text-gray-500 mb-1">Ngân hàng</label>
                    <select
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white focus:ring-1 focus:ring-orange-500 focus:border-orange-500 focus:outline-none"
                    >
                      {VIETNAM_BANKS.map((b) => (
                        <option key={b.code} value={b.name}>
                          {b.name} ({b.shortName})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] text-gray-500 mb-1">Số tài khoản</label>
                      <input
                        type="text"
                        placeholder="VD: 1012345678"
                        value={bankAccountNumber}
                        onChange={(e) => setBankAccountNumber(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg font-mono focus:ring-1 focus:ring-orange-500 focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-gray-500 mb-1">Tên chủ tài khoản</label>
                      <input
                        type="text"
                        placeholder="NGUYEN VAN A"
                        value={bankAccountName}
                        onChange={(e) => setBankAccountName(e.target.value.toUpperCase())}
                        className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg font-semibold uppercase focus:ring-1 focus:ring-orange-500 focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer mt-2"
          >
            {loading
              ? 'Đang xử lý...'
              : mode === 'login'
              ? 'Đăng nhập vào Ví'
              : 'Hoàn tất Đăng ký'}
          </button>
        </form>
      </div>
    </div>
  );
}
