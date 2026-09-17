import React from 'react';
import { ShoppingBag, ShieldCheck, Clock, Sparkles, Crown, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm mt-auto border-t border-slate-800">
      {/* Value props banner */}
      <div className="border-b border-slate-800/80 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-white font-bold text-sm">Hoàn Tiền Thật Lên Đến 10,5%</div>
              <div className="text-xs text-slate-400 mt-0.5">Không tích điểm ảo, hoàn tiền mặt trực tiếp cho mọi đơn hàng Shopee</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-white font-bold text-sm">Rút Tiền Trong 3 Ngày Làm Việc</div>
              <div className="text-xs text-slate-400 mt-0.5">Chi trả nhanh chóng, uy tín về số tài khoản ngân hàng của bạn 24/7</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-white font-bold text-sm">Đối Soát Minh Bạch & Tự Động</div>
              <div className="text-xs text-slate-400 mt-0.5">Gắn mã Sub ID độc quyền, đối soát chính xác theo báo cáo Shopee Affiliate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center text-white font-bold shadow-md shadow-orange-600/30">
                <Crown className="w-5 h-5 text-amber-200 fill-amber-300/30" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-white font-black text-lg">Vua Hoàn Tiền</span>
                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  vuahoantien.vn
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Nền tảng mua sắm hoàn tiền thông minh dành cho người tiêu dùng Việt Nam. Tiết kiệm tối đa chi phí cho mỗi đơn hàng trên Shopee Mall, Shopee Siêu Rẻ và hàng triệu gian hàng đối tác.
            </p>
            <div className="text-xs text-slate-500 pt-1">
              Được bảo trợ bởi <strong className="text-slate-300 font-semibold">VIVA Business Consulting</strong>
            </div>
          </div>

          <div>
            <div className="text-white font-bold text-xs uppercase tracking-wider mb-3.5">Khám phá</div>
            <ul className="space-y-2.5 text-xs">
              <li><a href="#popular-stores" className="hover:text-white transition-colors">Thương hiệu nổi bật</a></li>
              <li><a href="#hot-deals" className="hover:text-white transition-colors">Hot Deals hoàn tiền cao</a></li>
              <li><a href="#calculator" className="hover:text-white transition-colors">Công cụ tính tiền hoàn</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition-colors">Cách thức hoạt động</a></li>
            </ul>
          </div>

          <div>
            <div className="text-white font-bold text-xs uppercase tracking-wider mb-3.5">Chính sách & An toàn</div>
            <ul className="space-y-2.5 text-xs">
              <li><a href="#faq" className="hover:text-white transition-colors">Câu hỏi thường gặp</a></li>
              <li><span className="text-slate-400">Hạn mức rút tối thiểu 50K</span></li>
              <li><span className="text-slate-400">Chính sách hủy / đổi trả đơn</span></li>
              <li><span className="text-slate-400">Cam kết bảo mật tài khoản</span></li>
            </ul>
          </div>

          <div>
            <div className="text-white font-bold text-xs uppercase tracking-wider mb-3.5">Hỗ trợ & Đối soát</div>
            <ul className="space-y-2.5 text-xs">
              <li><span className="text-slate-300">Xử lý rút tiền:</span> Thứ 2 - Thứ 6</li>
              <li><span className="text-slate-300">Thời gian duyệt:</span> Trong 3 ngày làm việc</li>
              <li><span className="text-slate-300">Email:</span> hotro@vuahoantien.vn</li>
              <li><span className="text-slate-300">Kênh hỗ trợ:</span> Zalo OA / Fanpage</li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800/80 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            © 2026 Vua Hoàn Tiền (VuaHoanTien.vn). Bản quyền thuộc về VIVA Business Consulting.
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            <span>Hệ thống tự động đồng bộ Shopee Affiliate Program</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
