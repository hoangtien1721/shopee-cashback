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
  Sparkles,
  ChevronDown,
  Gift,
  Trophy,
  Copy,
  Check,
  CreditCard,
  HelpCircle,
  Info,
  ExternalLink,
  Zap,
  Search,
  Crown
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

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calculate total cashback (Available + Pending + Withdrawn)
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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* 1. Left: Brand Logo */}
          <div
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2.5 cursor-pointer select-none group shrink-0"
          >
            <div className="w-10 h-10 rounded-2xl bg-linear-to-tr from-orange-600 via-orange-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <Crown className="w-5 h-5 text-amber-200 fill-amber-300/30" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-xl tracking-tight bg-linear-to-r from-orange-600 via-amber-600 to-orange-500 bg-clip-text text-transparent">
                  Vua Hoàn Tiền
                </span>
                <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  VuaHoanTien.vn
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium -mt-0.5 hidden lg:block">
                Hoàn tiền mua sắm Shopee tự động
              </p>
            </div>
          </div>

          {/* 2. Middle Search / Category Bar (ShopBack Style) */}
          <div className="hidden md:flex flex-1 max-w-md mx-2">
            <div
              onClick={() => {
                setActiveTab('home');
                const el = document.getElementById('shopee-link-input');
                if (el) {
                  el.focus();
                  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }}
              className="w-full flex items-center gap-2 px-3.5 py-2 bg-slate-100/80 hover:bg-slate-100 border border-slate-200/80 rounded-full text-xs text-slate-500 cursor-pointer transition-colors"
            >
              <Search className="w-4 h-4 text-slate-400" />
              <span className="truncate">Tìm sản phẩm hoặc dán link Shopee nhận hoàn tiền...</span>
            </div>
          </div>

          {/* 3. Navigation Badges & Actions (ShopBack style) */}
          <div className="hidden lg:flex items-center gap-2 text-xs font-bold text-slate-700">
            <button
              onClick={() => {
                if (!user) onOpenAuth('login');
                else setActiveTab('dashboard');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-orange-50 text-slate-700 hover:text-orange-600 transition-colors cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Trạm Săn Thưởng</span>
            </button>

            <button
              onClick={() => {
                if (!user) onOpenAuth('login');
                else setShowReferralModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200/80 transition-colors cursor-pointer"
            >
              <Gift className="w-4 h-4 text-amber-600" />
              <span>Mời bạn mới, nhận 30K!</span>
            </button>
          </div>

          {/* 4. Right: User Profile & Balance Dropdown (Exact ShopBack Dropdown) */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                {/* Balance Trigger Button (ShopBack Style) */}
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full font-bold text-slate-900 text-sm transition-all shadow-xs cursor-pointer"
                >
                  <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-black">
                    ₫
                  </div>
                  <span>{formatVND(totalCashback > 0 ? totalCashback : user.available_balance)}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Card (ShopBack Exact UI) */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* User Title */}
                    <div className="px-2 pt-1 pb-3">
                      <h4 className="font-extrabold text-base text-slate-900 truncate">
                        {user.full_name || 'Khách hàng'}
                      </h4>
                      <p className="text-xs text-slate-400 truncate">{user.email}</p>
                    </div>

                    {/* Electric Blue Balance Card (ShopBack Signature) */}
                    <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-blue-600 via-indigo-600 to-blue-500 text-white p-4 shadow-lg shadow-blue-500/25 mb-3">
                      {/* Lightning watermark */}
                      <Zap className="absolute -right-3 -top-3 w-24 h-24 text-white/10 pointer-events-none rotate-12" />

                      <div className="flex items-center gap-1.5 text-xs font-bold text-blue-100 mb-3">
                        <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
                          ₫
                        </div>
                        <span>Hoàn Tiền</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/15">
                        <div>
                          <div className="text-[11px] text-blue-100 font-medium">Tổng Tiền Hoàn</div>
                          <div className="text-lg font-black tracking-tight mt-0.5">
                            {formatVND(totalCashback)}
                          </div>
                        </div>

                        <div className="border-l border-white/15 pl-3">
                          <div className="text-[11px] text-blue-100 font-medium">Số dư khả dụng</div>
                          <div className="text-lg font-black tracking-tight mt-0.5 text-emerald-300">
                            {formatVND(user.available_balance)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Links */}
                    <div className="space-y-1 text-sm font-semibold text-slate-700">
                      <button
                        onClick={() => { setActiveTab('dashboard'); setDropdownOpen(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left"
                      >
                        <Trophy className="w-4 h-4 text-amber-500" />
                        <span>Trạm Săn Thưởng / Ví hoàn tiền</span>
                      </button>

                      <button
                        onClick={() => { setShowProfileModal(true); setDropdownOpen(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left"
                      >
                        <User className="w-4 h-4 text-slate-500" />
                        <span>Thông tin tài khoản</span>
                      </button>

                      <button
                        onClick={() => { setActiveTab('withdraw'); setDropdownOpen(false); }}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-orange-50 text-orange-600 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <ArrowDownCircle className="w-4 h-4" />
                          <span className="font-bold">Rút Tiền (3 ngày)</span>
                        </div>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                          {formatVND(user.available_balance)}
                        </span>
                      </button>

                      <button
                        onClick={() => { setShowReferralModal(true); setDropdownOpen(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-amber-50 text-amber-700 transition-colors text-left"
                      >
                        <Gift className="w-4 h-4 text-amber-500" />
                        <span>Mời bạn bè, nhận 30K!</span>
                      </button>

                      <button
                        onClick={() => { setActiveTab('withdraw'); setDropdownOpen(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left"
                      >
                        <CreditCard className="w-4 h-4 text-slate-500" />
                        <span>Cài Đặt STK Ngân Hàng</span>
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => { setActiveTab('admin'); setDropdownOpen(false); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-purple-50 text-purple-700 transition-colors text-left"
                        >
                          <Shield className="w-4 h-4" />
                          <span>Quản trị Admin (Duyệt chi trả)</span>
                        </button>
                      )}

                      <div className="pt-2 my-1 border-t border-slate-100" />

                      <button
                        onClick={() => {
                          setActiveTab('home');
                          setDropdownOpen(false);
                          setTimeout(() => {
                            document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                          }, 100);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors text-left"
                      >
                        <Info className="w-3.5 h-3.5" />
                        <span>Cách ShopeeCash hoạt động</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('home');
                          setDropdownOpen(false);
                          setTimeout(() => {
                            document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' });
                          }, 100);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors text-left"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Hỗ Trợ & Hỏi Đáp</span>
                      </button>

                      <button
                        onClick={() => { logout(); setDropdownOpen(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors text-left font-bold"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Đăng nhập
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-full shadow-sm shadow-orange-500/20 transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Đăng ký nhận hoàn tiền</span>
                </button>
              </div>
            )}
          </div>

          {/* 5. Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            {user && (
              <div
                onClick={() => setActiveTab('dashboard')}
                className="px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-full text-xs font-bold text-blue-700 flex items-center gap-1 cursor-pointer"
              >
                <span>₫</span>
                <span>{formatVND(user.available_balance)}</span>
              </div>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-6 space-y-3 shadow-xl">
          {user && (
            <div className="p-4 rounded-2xl bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-md">
              <div className="text-xs font-medium text-blue-100">Xin chào, {user.full_name}</div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/20">
                <div>
                  <div className="text-[10px] text-blue-100">Tổng Tiền Hoàn</div>
                  <div className="text-base font-black">{formatVND(totalCashback)}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-blue-100">Số dư khả dụng</div>
                  <div className="text-base font-black text-emerald-300">{formatVND(user.available_balance)}</div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-1">
            <button
              onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold ${
                activeTab === 'home' ? 'bg-orange-50 text-orange-600' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              Trang chủ Shopee Cashback
            </button>

            {user ? (
              <>
                <button
                  onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold ${
                    activeTab === 'dashboard' ? 'bg-orange-50 text-orange-600' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-2"><Trophy className="w-4 h-4 text-amber-500" /> Trạm Săn Thưởng & Ví</span>
                  <span className="text-xs font-bold text-emerald-600">{formatVND(user.available_balance)}</span>
                </button>

                <button
                  onClick={() => { setActiveTab('withdraw'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold ${
                    activeTab === 'withdraw' ? 'bg-orange-50 text-orange-600' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-2"><ArrowDownCircle className="w-4 h-4 text-orange-600" /> Rút tiền (3 ngày)</span>
                </button>

                <button
                  onClick={() => { setShowReferralModal(true); setMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-amber-700 bg-amber-50"
                >
                  <Gift className="w-4 h-4" /> Mời bạn bè, nhận 30K!
                </button>

                {isAdmin && (
                  <button
                    onClick={() => { setActiveTab('admin'); setMobileMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-purple-700 bg-purple-50"
                  >
                    <Shield className="w-4 h-4" /> Quản trị Admin
                  </button>
                )}

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between px-2">
                  <span className="text-xs text-slate-500 truncate">{user.email}</span>
                  <button
                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                    className="text-xs font-bold text-rose-600 flex items-center gap-1"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Đăng xuất
                  </button>
                </div>
              </>
            ) : (
              <div className="pt-2 grid grid-cols-2 gap-2">
                <button
                  onClick={() => { onOpenAuth('login'); setMobileMenuOpen(false); }}
                  className="w-full py-2.5 text-center font-bold text-sm bg-slate-100 text-slate-800 rounded-xl"
                >
                  Đăng nhập
                </button>
                <button
                  onClick={() => { onOpenAuth('register'); setMobileMenuOpen(false); }}
                  className="w-full py-2.5 text-center font-bold text-sm bg-orange-600 text-white rounded-xl"
                >
                  Đăng ký nhận hoàn tiền
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Referral Modal ("Mời bạn mới, nhận 30K!") */}
      {showReferralModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150 relative">
            <button
              onClick={() => setShowReferralModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Gift className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-black text-slate-900 text-center mb-1">
              Mời Bạn Mới - Nhận Thưởng 30.000đ
            </h3>
            <p className="text-xs text-slate-500 text-center mb-5 leading-relaxed">
              Chia sẻ link giới thiệu này cho bạn bè. Khi bạn bè đăng ký và hoàn tất đơn hàng Shopee đầu tiên, bạn sẽ nhận ngay <strong>30.000đ</strong> vào số dư khả dụng!
            </p>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 mb-4 flex items-center justify-between gap-2">
              <div className="text-xs font-mono text-slate-700 truncate select-all">
                {referralLink}
              </div>
              <button
                onClick={handleCopyReferral}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                {copiedRef ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedRef ? 'Đã chép' : 'Sao chép'}</span>
              </button>
            </div>

            <div className="text-[11px] text-slate-400 bg-slate-50 p-3 rounded-xl space-y-1">
              <div>🎁 <strong>Thưởng không giới hạn:</strong> Mời 10 bạn nhận 300.000đ.</div>
              <div>⚡ <strong>Rút tiền:</strong> Tiền thưởng được cộng trực tiếp vào ví rút ngân hàng.</div>
            </div>

            <button
              onClick={() => setShowReferralModal(false)}
              className="w-full mt-5 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold cursor-pointer"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && user && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150 relative">
            <button
              onClick={() => setShowProfileModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-orange-600" />
              <span>Thông tin tài khoản</span>
            </h3>

            <div className="space-y-3 text-sm">
              <div className="p-3 bg-slate-50 rounded-xl">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Họ và tên</div>
                <div className="font-bold text-slate-900">{user.full_name}</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Email</div>
                <div className="font-bold text-slate-900">{user.email}</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Tài khoản ngân hàng nhận tiền</div>
                {user.bank_account_number ? (
                  <div className="font-bold text-slate-900">
                    {user.bank_name} - {user.bank_account_number} ({user.bank_account_name})
                  </div>
                ) : (
                  <div className="text-amber-600 text-xs font-semibold">Chưa cập nhật số tài khoản nhận tiền</div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-6">
              <button
                onClick={() => {
                  setShowProfileModal(false);
                  setActiveTab('withdraw');
                }}
                className="py-2.5 px-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold text-center cursor-pointer"
              >
                Cập nhật STK ngân hàng
              </button>
              <button
                onClick={() => setShowProfileModal(false)}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold text-center cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

