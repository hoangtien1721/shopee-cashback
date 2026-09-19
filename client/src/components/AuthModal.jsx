import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, Mail, User, Phone, CreditCard, AlertCircle, Sparkles } from 'lucide-react';
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
  const { login, register, loginWithGoogle } = useAuth();
  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleClientId, setGoogleClientId] = useState('');
  const [showGmailPrompt, setShowGmailPrompt] = useState(false);
  const [gmailInput, setGmailInput] = useState('');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [bankName, setBankName] = useState('Vietcombank');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankAccountName, setBankAccountName] = useState('');

  const googleBtnRef = useRef(null);

  useEffect(() => {
    setMode(initialMode);
    setError('');
  }, [initialMode, isOpen]);

  // Fetch Google Client ID and initialize Google Identity Services
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    async function initGoogle() {
      try {
        const res = await apiRequest('/settings/public');
        if (isMounted && res.success && res.settings?.google_client_id) {
          setGoogleClientId(res.settings.google_client_id);
          loadGoogleScript(res.settings.google_client_id);
        }
      } catch (err) {
        console.warn('Could not fetch Google OAuth client ID:', err.message);
      }
    }

    initGoogle();
    return () => { isMounted = false; };
  }, [isOpen]);

  const loadGoogleScript = (clientId) => {
    if (window.google?.accounts?.id) {
      setupGoogleButton(clientId);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => setupGoogleButton(clientId);
    document.head.appendChild(script);
  };

  const setupGoogleButton = (clientId) => {
    if (!window.google?.accounts?.id || !clientId) return;

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCredentialResponse,
        auto_select: false
      });

      if (googleBtnRef.current) {
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'outline',
          size: 'large',
          width: '100%',
          text: mode === 'login' ? 'signin_with' : 'signup_with',
          shape: 'rectangular',
          logo_alignment: 'center'
        });
      }
    } catch (e) {
      console.warn('Google GIS init error:', e);
    }
  };

  const handleGoogleCredentialResponse = async (response) => {
    if (!response.credential) return;
    setError('');
    setGoogleLoading(true);
    try {
      await loginWithGoogle(response.credential);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Lỗi đăng nhập tài khoản Google');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleDirectGoogleClick = async () => {
    if (googleClientId && window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else {
      // Khi chưa cấu hình Google Client ID trên Cloud Console,
      // hiển thị form nhập nhanh Gmail tiện lợi
      setShowGmailPrompt(true);
    }
  };

  const handleGmailPromptSubmit = async (e) => {
    e.preventDefault();
    if (!gmailInput || !gmailInput.includes('@')) {
      setError('Vui lòng nhập địa chỉ Gmail hợp lệ');
      return;
    }
    setError('');
    setGoogleLoading(true);
    try {
      await loginWithGoogle(null, {
        email: gmailInput.trim().toLowerCase(),
        name: gmailInput.split('@')[0]
      });
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Lỗi đăng nhập nhanh bằng Gmail');
    } finally {
      setGoogleLoading(false);
    }
  };

  if (!isOpen) return null;

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
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl relative border border-gray-200 max-h-[95vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1.5 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tab switch */}
        <div className="flex p-1 bg-gray-100 rounded-lg mb-5">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); setShowGmailPrompt(false); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              mode === 'login' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(''); setShowGmailPrompt(false); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all cursor-pointer ${
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
          {googleClientId ? (
            <div ref={googleBtnRef} className="w-full min-h-[40px] flex justify-center"></div>
          ) : (
            <button
              type="button"
              onClick={handleDirectGoogleClick}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 transition-colors shadow-xs cursor-pointer hover:border-gray-400"
            >
              <GoogleIcon className="w-4 h-4 shrink-0" />
              <span>{googleLoading ? 'Đang xác thực...' : mode === 'login' ? 'Đăng nhập bằng Google' : 'Đăng ký nhanh bằng Google'}</span>
            </button>
          )}

          {/* Quick Gmail popup if Google Client ID not yet set */}
          {showGmailPrompt && (
            <form onSubmit={handleGmailPromptSubmit} className="p-3 bg-orange-50/70 border border-orange-200 rounded-lg space-y-2 text-xs animate-in fade-in">
              <div className="font-semibold text-gray-800">Nhập địa chỉ Gmail để tiếp tục:</div>
              <div className="flex gap-2">
                <input
                  type="email"
                  required
                  placeholder="tenban@gmail.com"
                  value={gmailInput}
                  onChange={(e) => setGmailInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-md focus:outline-none focus:border-orange-500"
                />
                <button
                  type="submit"
                  disabled={googleLoading}
                  className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-md shrink-0 cursor-pointer"
                >
                  Xác nhận
                </button>
              </div>
            </form>
          )}

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
            className="w-full py-2.5 px-4 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer mt-2"
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
