import React from 'react';
import { ShoppingBag, ShieldCheck, Clock, Sparkles, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm mt-auto border-t border-slate-800">
      {/* Value props banner */}
      <div className="border-b border-slate-800/80 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-white font-semibold">Hoàn Tiền Mua Sắm Shopee</div>
              <div className="text-xs text-slate-400">Nhận lại tiền hoàn hấp dẫn cho mỗi đơn hàng Shopee đặt qua link</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-white font-semibold">Rút tiền trong 3 ngày</div>
              <div className="text-xs text-slate-400">Chi trả nhanh chóng về STK ngân hàng của bạn trong 3 ngày làm việc</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-white font-semibold">Minh bạch & Chuẩn xác</div>
              <div className="text-xs text-slate-400">Mã định danh Sub ID độc quyền, đối soát rõ ràng từng mã đơn hàng</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white font-bold">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <span className="text-white font-bold text-lg">Shopee Cashback</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Nền tảng hoàn tiền mua sắm Shopee thông qua chương trình Shopee Affiliate. Giúp người tiêu dùng tiết kiệm tối đa chi phí khi mua hàng online mỗi ngày.
            </p>
          </div>

          <div>
            <div className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Liên kết nhanh</div>
            <ul className="space-y-2 text-xs">
              <li><a href="#how-it-works" className="hover:text-white transition-colors">Cách thức hoạt động</a></li>
              <li><a href="#link-converter" className="hover:text-white transition-colors">Chuyển đổi link Shopee</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">Câu hỏi thường gặp</a></li>
            </ul>
          </div>

          <div>
            <div className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Hỗ trợ & Đối soát</div>
            <ul className="space-y-2 text-xs">
              <li>Thời gian xử lý rút: Thứ 2 - Thứ 6</li>
              <li>Cam kết: Chi trả trong 3 ngày làm việc</li>
              <li>Email hỗ trợ: hotro@cashback.vn</li>
              <li>Cộng đồng: Nhóm Săn Deal Hoàn Tiền</li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            © 2026 Shopee Cashback. Bản quyền thuộc về VIVA Business Consulting.
          </div>
          <div className="flex items-center gap-1 text-[11px]">
            <span>Được tối ưu cho Shopee Affiliate Program</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
