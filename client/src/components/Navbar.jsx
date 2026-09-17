import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ShoppingBag,
  Wallet,
  ArrowDownCircle,
  Shield,
  LogOut,
  User,
  Menu,
  X,
  ChevronDown,
  Gift,
  Copy,
  Check,
  CreditCard,
  HelpCircle,
  Info,
  Search,
  ExternalLink
} from 'lucide-react';
import { formatVND } from '../services/api';

export default function Navbar({ activeTab, setActiveTab, onOpenAuth }) {
  const { user, logout, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);

  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalCashback = user
    ? (user.available_balance || 0) + (user.pending_balance || 0) + (user.withdrawn_total || 0)
    : 0;

  const referralLink = user
    ? `${window.location.origin}/?ref=u${user.id}`
    : '';

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      {/* Main Top Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo */}
          <div
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2 cursor-pointer select-none shrink-0"
          >
            <div className="w-8 h-8 rounded-md bg-orange-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
              V
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-bold text-lg text-gray-900 tracking-tight">
                VuaHoanTien
              </span>
              <span className="text-xs font-semibold text-orange-600">
                .vn
              </span>
            </div>
          </div>

          {/* Search / Converter bar */}
          <div className="hidden md:flex flex-1 max-w-lg mx-4">
            <div
              onClick={() => {
                setActiveTab('home');
                const el = document.getElementById('shopee-link-input');
                if (el) {
                  el.focus();
                  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }}
              className="w-full flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-md text-xs text-gray-500 cursor-pointer transition-colors"
            >
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="truncate">Dán link Shopee hoặc tìm kiếm danh mục hoàn tiền...</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden lg:flex items-center gap-5 text-xs font-medium text-gray-600">
            <a href="#popular-stores" className="hover:text-gray-900 transition-colors">
              Thương hiệu
            </a>
            <a href="#hot-deals" className="hover:text-gray-900 transition-colors">
              Ưu đãi hôm nay
            </a>
            <a href="#rates-table" className="hover:text-gray-900 transition-colors">
              Biểu phí
            </a>
            <button
              onClick={() => {
                if (!user) onOpenAuth('login');
                else setShowReferralModal(true);
              }}
              className="text-orange-600 hover:text-orange-700 font-semibold cursor-pointer transition-colors"
            >
              Mời bạn bè nhận 30.000 đ
            </button>
          </div>

          {/* User actions */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-md text-xs font-semibold text-gray-800 transition-colors cursor-pointer"
                >
                  <span className="text-gray-500 font-normal">Ví:</span>
                  <span className="font-bold text-orange-600">{formatVND(user.available_balance)}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 py-3 px-4 text-xs text-gray-700 z-50 animate-in fade-in duration-150">
                    <div className="pb-3 border-b border-gray-100">
                      <div className="font-semibold text-gray-900">{user.full_name}</div>
                      <div className="text-gray-500 text-[11px] truncate">{user.email}</div>
                    </div>

                    <div className="py-2.5 space-y-1.5 border-b border-gray-100">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Khả dụng:</span>
                        <span className="font-bold text-gray-900">{formatVND(user.available_balance)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Chờ duyệt:</span>
                        <span className="text-gray-700">{formatVND(user.pending_balance)}</span>
                      </div>
                    </div>

                    <div className="pt-2 space-y-1 font-medium">
                      <button
                        onClick={() => { setActiveTab('dashboard'); setDropdownOpen(false); }}
                        className="w-full text-left py-1.5 px-2 hover:bg-gray-50 rounded text-gray-700"
                      >
                        Lịch sử hoàn tiền
                      </button>
                      <button
                        onClick={() => { setActiveTab('withdraw'); setDropdownOpen(false); }}
                        className="w-full text-left py-1.5 px-2 hover:bg-gray-50 rounded text-orange-600 font-semibold"
                      >
                        Yêu cầu rút tiền
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => { setActiveTab('admin'); setDropdownOpen(false); }}
                          className="w-full text-left py-1.5 px-2 hover:bg-gray-50 rounded text-purple-700 font-semibold"
                        >
                          Quản trị hệ thống
                        </button>
                      )}
                      <button
                        onClick={() => { logout(); setDropdownOpen(false); }}
                        className="w-full text-left py-1.5 px-2 hover:bg-gray-50 rounded text-red-600"
                      >
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-3 py-1.5 text-xs font-semibold text-gray-700 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Đăng nhập
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-md transition-colors shadow-xs cursor-pointer"
                >
                  Đăng ký
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-md text-gray-600 hover:bg-gray-100 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Sub-navbar (Category Navigation) */}
      <nav className="border-t border-gray-200 bg-white hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs py-2 text-gray-600 font-medium">
          <div className="flex items-center gap-6 overflow-x-auto">
            <button
              onClick={() => {
                setActiveTab('home');
                const el = document.getElementById('shopee-link-input');
                if (el) {
                  el.focus();
                  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }}
              className="font-bold text-gray-900 hover:text-orange-600 transition-colors flex items-center gap-1.5 shrink-0"
            >
              <Menu className="w-3.5 h-3.5" />
              <span>Tất cả danh mục</span>
            </button>
            <a href="#popular-stores" className="hover:text-gray-900 transition-colors shrink-0">Shopee Mall</a>
            <a href="#popular-stores" className="hover:text-gray-900 transition-colors shrink-0">Thời trang</a>
            <a href="#popular-stores" className="hover:text-gray-900 transition-colors shrink-0">Làm đẹp</a>
            <a href="#popular-stores" className="hover:text-gray-900 transition-colors shrink-0">Gia dụng</a>
            <a href="#popular-stores" className="hover:text-gray-900 transition-colors shrink-0">Thiết bị số</a>
            <a href="#popular-stores" className="hover:text-gray-900 transition-colors shrink-0">Mẹ & Bé</a>
            <a href="#how-it-works" className="hover:text-gray-900 transition-colors shrink-0">Quy trình hoàn tiền</a>
          </div>

          <div className="text-[11px] text-gray-500 font-normal shrink-0 pl-4 border-l border-gray-200">
            Cam kết chi trả trong <span className="font-semibold text-gray-800">3 ngày làm việc</span>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 py-3 space-y-2 text-xs">
          {user ? (
            <div className="pb-2 mb-2 border-b border-gray-100 flex justify-between items-center">
              <span className="font-medium text-gray-600">{user.full_name}</span>
              <span className="font-bold text-orange-600">{formatVND(user.available_balance)}</span>
            </div>
          ) : (
            <div className="flex gap-2 pb-2 mb-2 border-b border-gray-100">
              <button
                onClick={() => { onOpenAuth('login'); setMobileMenuOpen(false); }}
                className="flex-1 py-2 text-center bg-gray-100 rounded-md font-semibold text-gray-700"
              >
                Đăng nhập
              </button>
              <button
                onClick={() => { onOpenAuth('register'); setMobileMenuOpen(false); }}
                className="flex-1 py-2 text-center bg-orange-600 text-white rounded-md font-semibold"
              >
                Đăng ký
              </button>
            </div>
          )}
          <a
            href="#popular-stores"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1.5 text-gray-700"
          >
            Thương hiệu đối tác
          </a>
          <a
            href="#hot-deals"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1.5 text-gray-700"
          >
            Ưu đãi hoàn tiền hôm nay
          </a>
          <a
            href="#rates-table"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1.5 text-gray-700"
          >
            Biểu phí hoàn tiền
          </a>
          <a
            href="#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1.5 text-gray-700"
          >
            Quy trình hoạt động
          </a>
          <a
            href="#faq"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1.5 text-gray-700"
          >
            Câu hỏi thường gặp
          </a>
        </div>
      )}

      {/* Referral Modal */}
      {showReferralModal && user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4 shadow-xl border border-gray-200 text-xs">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-base text-gray-900">Mời bạn bè nhận 30.000 đ</h3>
              <button onClick={() => setShowReferralModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Chia sẻ liên kết giới thiệu dưới đây. Khi bạn bè đăng ký và hoàn tất đơn hàng Shopee đầu tiên, tài khoản của bạn sẽ nhận 30.000 đ vào số dư khả dụng.
            </p>
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md border border-gray-200">
              <input
                readOnly
                value={referralLink}
                className="flex-1 bg-transparent text-gray-800 text-xs focus:outline-none font-mono"
              />
              <button
                onClick={handleCopyReferral}
                className="px-3 py-1.5 bg-orange-600 text-white rounded font-medium hover:bg-orange-700 shrink-0"
              >
                {copiedRef ? 'Đã sao chép' : 'Sao chép'}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
