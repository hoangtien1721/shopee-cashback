import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Wallet, ArrowDownCircle, Shield, LogOut, User, Menu, X, Sparkles } from 'lucide-react';
import { formatVND } from '../services/api';

export default function Navbar({ activeTab, setActiveTab, onOpenAuth }) {
  const { user, logout, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg tracking-tight bg-linear-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  ShopeeCash
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-700 border border-orange-200">
                  Cashback
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium -mt-0.5 hidden sm:block">
                Hoàn tiền mua sắm Shopee Affiliate
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'home'
                  ? 'bg-orange-50 text-orange-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Trang chủ
            </button>

            {user && (
              <>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                    activeTab === 'dashboard'
                      ? 'bg-orange-50 text-orange-600'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Wallet className="w-4 h-4" />
                  Ví hoàn tiền
                </button>

                <button
                  onClick={() => setActiveTab('withdraw')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                    activeTab === 'withdraw'
                      ? 'bg-orange-50 text-orange-600'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <ArrowDownCircle className="w-4 h-4" />
                  Rút tiền
                </button>
              </>
            )}

            {isAdmin && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                  activeTab.startsWith('admin')
                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                    : 'text-purple-700 hover:bg-purple-50'
                }`}
              >
                <Shield className="w-4 h-4" />
                Quản trị Admin
              </button>
            )}
          </nav>

          {/* Right Action / Auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                {/* Balance Chip */}
                <div
                  onClick={() => setActiveTab('dashboard')}
                  className="cursor-pointer flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-orange-50/60 border border-slate-200/80 rounded-xl transition-colors"
                >
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 font-medium leading-none">Số dư ví</div>
                    <div className="text-xs font-bold text-slate-900 leading-tight">
                      {formatVND(user.available_balance)}
                    </div>
                  </div>
                </div>

                {/* User Dropdown / Menu */}
                <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                  <div className="text-right hidden lg:block">
                    <div className="text-xs font-bold text-slate-800 leading-none">{user.full_name}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{user.email}</div>
                  </div>
                  <button
                    onClick={logout}
                    title="Đăng xuất"
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  Đăng nhập
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-xs shadow-orange-200 transition-all hover:shadow-md"
                >
                  <Sparkles className="w-4 h-4" />
                  Đăng ký nhận hoàn tiền
                </button>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="md:hidden flex items-center gap-2">
            {user && (
              <div className="px-2.5 py-1 bg-orange-50 border border-orange-200 rounded-lg text-xs font-bold text-orange-700">
                {formatVND(user.available_balance)}
              </div>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-2 pb-4 space-y-2 shadow-lg">
          <button
            onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Trang chủ
          </button>
          {user ? (
            <>
              <button
                onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <span>Ví hoàn tiền</span>
                <span className="text-orange-600 font-bold">{formatVND(user.available_balance)}</span>
              </button>
              <button
                onClick={() => { setActiveTab('withdraw'); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Rút tiền (3 ngày làm việc)
              </button>
              {isAdmin && (
                <button
                  onClick={() => { setActiveTab('admin'); setMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-purple-700 bg-purple-50"
                >
                  Quản trị Admin
                </button>
              )}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between px-3 text-xs text-slate-500">
                <span>{user.full_name} ({user.email})</span>
                <button onClick={logout} className="text-rose-600 font-semibold flex items-center gap-1">
                  <LogOut className="w-3.5 h-3.5" /> Đăng xuất
                </button>
              </div>
            </>
          ) : (
            <div className="pt-2 grid grid-cols-2 gap-2">
              <button
                onClick={() => { onOpenAuth('login'); setMobileMenuOpen(false); }}
                className="w-full py-2.5 text-center font-semibold text-sm bg-slate-100 text-slate-800 rounded-xl"
              >
                Đăng nhập
              </button>
              <button
                onClick={() => { onOpenAuth('register'); setMobileMenuOpen(false); }}
                className="w-full py-2.5 text-center font-semibold text-sm bg-orange-600 text-white rounded-xl"
              >
                Đăng ký
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
