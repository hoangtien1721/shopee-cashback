import React from 'react';
import { ShieldCheck, Clock, RefreshCw } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 text-xs mt-auto border-t border-gray-800">
      {/* 3 Core Value Props */}
      <div className="border-b border-gray-800 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-gray-300 shrink-0 mt-0.5" />
            <div>
              <div className="text-gray-200 font-semibold text-sm">Đối tác tiếp thị liên kết Shopee</div>
              <div className="text-gray-500 text-xs mt-0.5">Tự động đồng bộ và đối soát dữ liệu với chương trình Shopee Affiliate.</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-gray-300 shrink-0 mt-0.5" />
            <div>
              <div className="text-gray-200 font-semibold text-sm">Chi trả trong 3 ngày làm việc</div>
              <div className="text-gray-500 text-xs mt-0.5">Xử lý lệnh rút tiền về tất cả các tài khoản ngân hàng nội địa Việt Nam.</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <RefreshCw className="w-5 h-5 text-gray-300 shrink-0 mt-0.5" />
            <div>
              <div className="text-gray-200 font-semibold text-sm">Minh bạch & Tự động</div>
              <div className="text-xs text-gray-500 mt-0.5">Theo dõi lịch sử đơn hàng, tỷ lệ hoàn và trạng thái thanh toán trực quan.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-2">
            <div className="flex items-baseline gap-1">
              <span className="font-bold text-base text-white tracking-tight">BoxHoanTien</span>
              <span className="text-xs font-semibold text-orange-500">.com</span>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed">
              Nền tảng hỗ trợ người tiêu dùng tối ưu chi phí mua sắm trực tuyến thông qua cơ chế tiếp thị liên kết hoàn tiền chính ngạch.
            </p>
          </div>

          <div>
            <div className="text-gray-200 font-semibold mb-3">Liên kết nhanh</div>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#popular-stores" className="hover:text-white transition-colors">Thương hiệu đối tác</a></li>
              <li><a href="#hot-deals" className="hover:text-white transition-colors">Ưu đãi hôm nay</a></li>
              <li><a href="#rates-table" className="hover:text-white transition-colors">Biểu phí hoàn tiền</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition-colors">Quy trình ghi nhận</a></li>
            </ul>
          </div>

          <div>
            <div className="text-gray-200 font-semibold mb-3">Chính sách & Hỗ trợ</div>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#faq" className="hover:text-white transition-colors">Câu hỏi thường gặp</a></li>
              <li><span>Hạn mức rút tối thiểu: 50.000 đ</span></li>
              <li><span>Thời gian đối soát: Thứ 2 - Thứ 6</span></li>
              <li><span>Email: hotro@boxhoantien.com</span></li>
            </ul>
          </div>

          <div>
            <div className="text-gray-200 font-semibold mb-3">Lưu ý pháp lý</div>
            <p className="text-gray-500 text-[11px] leading-relaxed">
              Shopee là nhãn hiệu thuộc sở hữu của Tập đoàn Sea Ltd. Box Hoàn Tiền là nền tảng tiếp thị liên kết độc lập, không phải là đơn vị bán lẻ trực tiếp các sản phẩm được niêm yết trên Shopee.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-800 text-[11px] text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            © 2026 BoxHoanTien.com. Tất cả các quyền được bảo lưu.
          </div>
          <div>
            Phiên bản hệ thống 2.4.0 • Shopee Affiliate Integrated
          </div>
        </div>
      </div>
    </footer>
  );
}
