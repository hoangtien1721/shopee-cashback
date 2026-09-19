import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, Mail, User, Phone, CreditCard, AlertCircle, ExternalLink, UserPlus, ArrowRight } from 'lucide-react';
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

// Authentic Google Account Chooser Modal (matching accounts.google.com/v3/signin/accountchooser screenshot)
function GoogleAccountChooserModal({ isOpen, onClose, onSelectAccount, onDirectRedirect }) {
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherEmail, setOtherEmail] = useState('');
  const [otherName, setOtherName] = useState('');
  const [loadingEmail, setLoadingEmail] = useState(null);

  if (!isOpen) return null;

  const defaultAccounts = [
    {
      name: 'Tien Hoang',
      email: 'hoangtien1721@gmail.com',
      avatarBg: 'bg-amber-600',
      initial: 'T'
    },
    {
      name: 'Tiến Trần',
      email: 'hoangtien11721@gmail.com',
      avatarBg: 'bg-emerald-600',
      initial: 'T'
    },
    {
      name: 'Tiến Trần',
      email: 'hoangtien17121@gmail.com',
      avatarBg: 'bg-teal-600',
      initial: 'T'
    }
  ];

  const handleAccountClick = async (account) => {
    setLoadingEmail(account.email);
    try {
      await onSelectAccount(account);
    } finally {
      setLoadingEmail(null);
    }
  };

  const handleCustomSubmit = async (e) => {
    e.preventDefault();
    if (!otherEmail || !otherEmail.includes('@')) return;
    const name = otherName.trim() || otherEmail.split('@')[0];
    setLoadingEmail(otherEmail);
    try {
      await onSelectAccount({ email: otherEmail.trim().toLowerCase(), name });
    } finally {
      setLoadingEmail(null);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#202124] text-[#e8eaed] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#3c4043] relative overflow-hidden font-sans">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#9aa0a6] hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Google Header */}
        <div className="flex items-center gap-2 mb-6">
          <GoogleIcon className="w-5 h-5" />
          <span className="text-xs text-[#9aa0a6] font-medium tracking-wide">Đăng nhập bằng Google</span>
        </div>

        {/* Brand & Title */}
        <div className="mb-6">
          <div className="w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 font-bold text-base mb-3 shadow-inner">
            ⚡
          </div>
          <h2 className="text-2xl sm:text-3xl font-normal text-white tracking-tight">
            Chọn tài khoản
          </h2>
          <p className="text-sm text-[#9aa0a6] mt-1">
            Tiếp tục tới <span className="text-orange-400 font-semibold">Box Hoàn Tiền</span>
          </p>
        </div>

        {/* Accounts List */}
        <div className="space-y-1 mb-6 border-t border-b border-[#3c4043] divide-y divide-[#3c4043]">
          {defaultAccounts.map((acct) => (
            <button
              key={acct.email}
              type="button"
              disabled={loadingEmail !== null}
              onClick={() => handleAccountClick(acct)}
              className="w-full flex items-center gap-3.5 py-3 px-2 rounded-xl hover:bg-white/5 transition-all text-left cursor-pointer group disabled:opacity-50"
            >
              <div className={`w-9 h-9 rounded-full ${acct.avatarBg} text-white font-bold flex items-center justify-center text-sm shrink-0 shadow-xs`}>
                {acct.initial}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white group-hover:text-orange-300 transition-colors truncate">
                  {acct.name}
                </div>
                <div className="text-xs text-[#9aa0a6] truncate font-mono">
                  {acct.email}
                </div>
              </div>
              {loadingEmail === acct.email ? (
                <div className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <ArrowRight className="w-4 h-4 text-[#5f6368] group-hover:text-white transition-colors shrink-0" />
              )}
            </button>
          ))}

          {/* Use another account option */}
          {!showOtherInput ? (
            <button
              type="button"
              onClick={() => setShowOtherInput(true)}
              className="w-full flex items-center gap-3.5 py-3 px-2 rounded-xl hover:bg-white/5 transition-all text-left cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-full bg-[#303134] text-[#9aa0a6] group-hover:text-white flex items-center justify-center text-sm shrink-0">
                <UserPlus className="w-4 h-4" />
              </div>
              <div className="flex-1 text-sm font-medium text-[#e8eaed] group-hover:text-orange-300">
                Sử dụng một tài khoản khác
              </div>
            </button>
          ) : (
            <form onSubmit={handleCustomSubmit} className="py-3 px-2 space-y-2.5 animate-in fade-in">
              <div className="text-xs text-[#9aa0a6] font-medium">Nhập tài khoản Google / Gmail khác:</div>
              <input
                type="text"
                placeholder="Họ và tên (Tùy chọn)"
                value={otherName}
                onChange={(e) => setOtherName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#303134] border border-[#5f6368] rounded-lg text-white placeholder-[#9aa0a6] focus:border-orange-400 focus:outline-none"
              />
              <div className="flex gap-2">
                <input
                  type="email"
                  required
                  placeholder="name@gmail.com"
                  value={otherEmail}
                  onChange={(e) => setOtherEmail(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-[#303134] border border-[#5f6368] rounded-lg text-white placeholder-[#9aa0a6] focus:border-orange-400 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={loadingEmail !== null}
                  className="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded-lg shrink-0 cursor-pointer"
                >
                  {loadingEmail === otherEmail ? 'Đang vào...' : 'Tiếp theo'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Direct official redirect & Admin note */}
        <div className="bg-[#303134]/80 rounded-xl p-3 border border-[#3c4043] space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-[#9aa0a6]">Kết nối trực tiếp Google Cloud:</span>
            <button
              type="button"
              onClick={onDirectRedirect}
              className="text-orange-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>Mở accounts.google.com</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
          <p className="text-[10px] text-[#9aa0a6] leading-relaxed">
            💡 Để chuyển thẳng sang trang của Google, bạn cấu hình Google Client ID & Secret trong cổng quản trị bí mật (<a href="#admin-management" onClick={onClose} className="text-orange-400 underline">#admin-management</a>).
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AuthModal({ isOpen, onClose, initialMode = 'login', onSuccess }) {
  const { login, register, loginWithGoogle } = useAuth();
  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showAccountChooser, setShowAccountChooser] = useState(false);

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
    setShowAccountChooser(false);
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  // Xử lý khi bấm nút "Đăng nhập bằng Google"
  const handleGoogleSignInClick = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      // 1. Kiểm tra xem server đã được cấu hình Google Client ID chưa
      const res = await apiRequest('/auth/google/url');
      if (res && res.configured && res.url) {
        // ĐÃ CẤU HÌNH: Chuyển hướng trực tiếp 100% sang trang Chọn tài khoản của Google
        window.location.href = res.url;
        return;
      }
      // CHƯA CẤU HÌNH TRÊN CLOUD CONSOLE:
      // Mở màn hình Chọn tài khoản Google (chuẩn giao diện Google như ảnh mẫu)
      setShowAccountChooser(true);
    } catch (err) {
      console.warn('Google auth check fallback:', err);
      setShowAccountChooser(true);
    } finally {
      setGoogleLoading(false);
    }
  };

  // Chọn tài khoản từ màn hình Google Account Chooser
  const handleSelectGoogleAccount = async (account) => {
    setError('');
    try {
      await loginWithGoogle(null, {
        email: account.email,
        name: account.name
      });
      setShowAccountChooser(false);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Lỗi xác thực tài khoản Google');
      setShowAccountChooser(false);
    }
  };

  const handleDirectRedirectToGoogle = () => {
    window.location.href = '/api/auth/google/redirect';
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
    <>
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
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg mb-4">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
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
                  ? 'Đang kết nối Google...'
                  : mode === 'login'
                  ? 'Đăng nhập bằng Google'
                  : 'Đăng ký nhanh bằng Google'}
              </span>
            </button>

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

      {/* GOOGLE ACCOUNT CHOOSER SCREEN */}
      <GoogleAccountChooserModal
        isOpen={showAccountChooser}
        onClose={() => setShowAccountChooser(false)}
        onSelectAccount={handleSelectGoogleAccount}
        onDirectRedirect={handleDirectRedirectToGoogle}
      />
    </>
  );
}
