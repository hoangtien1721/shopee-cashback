import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import QRModal from '../components/QRModal';
import {
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  ExternalLink,
  QrCode,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  Zap
} from 'lucide-react';

export default function HomePage({ onOpenAuth, onNavigate }) {
  const { user } = useAuth();

  // State chuyển đổi link
  const [inputUrl, setInputUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [convertedResult, setConvertedResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  // Accordion FAQ state
  const [openFaq, setOpenFaq] = useState(null);

  const handleConvert = async (e) => {
    e.preventDefault();
    setError('');

    if (!inputUrl.trim()) {
      setError('Vui lòng dán link Shopee vào ô bên dưới');
      return;
    }

    // Nếu chưa đăng nhập -> yêu cầu đăng nhập trước
    if (!user) {
      onOpenAuth('login');
      return;
    }

    setLoading(true);
    try {
      const res = await apiRequest('/links/convert', {
        method: 'POST',
        body: JSON.stringify({ url: inputUrl.trim() })
      });

      if (res.success && res.link) {
        setConvertedResult(res.link);
      }
    } catch (err) {
      setError(err.message || 'Không thể chuyển đổi link. Vui lòng kiểm tra lại đường dẫn');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-16 py-8">
      {/* 1. HERO & CONVERTER SECTION */}
      <section className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100/80 border border-orange-200 text-orange-700 text-xs font-bold mb-6 animate-pulse">
          <Zap className="w-3.5 h-3.5 fill-orange-500" />
          <span>Chương trình Hoàn Tiền Shopee Chính Thức 2026</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-none mb-8">
          Dán Link Shopee <br className="hidden sm:block" />
          <span className="bg-linear-to-r from-orange-600 via-amber-500 to-orange-500 bg-clip-text text-transparent">
            Nhận Ngay Tiền Hoàn
          </span>
        </h1>

        {/* Link Converter Box */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 p-6 sm:p-8 max-w-3xl mx-auto text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-bl from-orange-500/10 to-transparent rounded-bl-full pointer-events-none" />

          <form onSubmit={handleConvert} className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-bold text-slate-800">
                🔗 Dán link sản phẩm Shopee tại đây:
              </label>
              {!user && (
                <span className="text-xs text-orange-600 font-semibold cursor-pointer hover:underline" onClick={() => onOpenAuth('login')}>
                  * Đăng nhập để lưu link vào ví
                </span>
              )}
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="VD: https://shopee.vn/product/... hoặc s.shopee.vn/..."
                value={inputUrl}
                onChange={(e) => {
                  setInputUrl(e.target.value);
                  setError('');
                }}
                className="w-full px-4 py-3.5 text-sm sm:text-base border-2 border-slate-200 hover:border-slate-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 rounded-2xl transition-all focus:outline-hidden"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-linear-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 disabled:opacity-50 text-white rounded-2xl text-base font-bold shadow-lg shadow-orange-500/25 transition-all cursor-pointer hover:scale-[1.01]"
            >
              {loading ? (
                <span>Đang tạo link affiliate...</span>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>{user ? 'Chuyển Đổi Link & Nhận Hoàn Tiền' : 'Đăng nhập & Chuyển đổi link'}</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Result Card after conversion */}
          {convertedResult && (
            <div className="mt-6 pt-6 border-t border-slate-100 animate-in fade-in slide-in-from-top-3 duration-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Đã tạo link hoàn tiền thành công
                </span>
                <span className="text-xs text-slate-400 font-mono">Mã Sub: u{user?.id}-{convertedResult.short_code}</span>
              </div>

              {/* PRODUCT TITLE IF DETECTED */}
              {convertedResult.product_title && convertedResult.product_title !== 'Sản phẩm Shopee' && (
                <div className="mb-4 px-3.5 py-2.5 bg-orange-50/70 border border-orange-200/80 rounded-xl flex items-center gap-2.5">
                  <ShoppingBag className="w-4 h-4 text-orange-600 shrink-0" />
                  <span className="text-xs text-slate-500 shrink-0">Sản phẩm:</span>
                  <span className="text-xs font-bold text-slate-900 truncate">
                    {convertedResult.product_title}
                  </span>
                </div>
              )}

              {/* Link display box */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 mb-4 flex items-center justify-between gap-3 overflow-hidden">
                <div className="truncate font-mono text-xs sm:text-sm text-slate-700 select-all">
                  {convertedResult.localRedirectUrl || convertedResult.affiliate_url}
                </div>
                <button
                  onClick={() => handleCopy(convertedResult.localRedirectUrl || convertedResult.affiliate_url)}
                  className="shrink-0 flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-xs transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Đã chép' : 'Sao chép link'}</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <a
                  href={convertedResult.affiliate_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-bold shadow-md shadow-orange-500/20 transition-all text-center cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Mở Shopee Đặt Hàng Ngay</span>
                </a>

                <button
                  type="button"
                  onClick={() => setShowQrModal(true)}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-sm font-bold transition-all cursor-pointer"
                >
                  <QrCode className="w-4 h-4 text-orange-600" />
                  <span>Quét QR Mở Shopee App</span>
                </button>
              </div>

              <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 leading-relaxed">
                📌 <strong>Lưu ý quan trọng:</strong> Sau khi click link hoặc quét mã QR, hãy thêm sản phẩm vào giỏ và thanh toán ngay trên Shopee. Không bấm vào link tiếp thị hoặc khuyến mãi khác để hệ thống không bị mất tracking đơn của bạn!
              </div>
            </div>
          )}

        </div>
      </section>

      {/* 2. STEP-BY-STEP PROCESS */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase font-bold text-orange-600 tracking-wider">Quy trình 4 bước đơn giản</span>
          <h2 className="text-3xl font-black text-slate-900 mt-1">
            Cách thức nhận tiền hoàn Shopee
          </h2>
          <p className="text-slate-500 text-sm mt-2">
            Không cần thẻ tín dụng, tiền hoàn trực tiếp vào tài khoản ngân hàng của bạn
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Step 1 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative group hover:border-orange-200 transition-colors">
            <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center font-black text-lg mb-4 group-hover:scale-110 transition-transform">
              1
            </div>
            <h4 className="font-bold text-slate-900 mb-2">Dán link sản phẩm</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Sao chép bất kỳ link sản phẩm nào bạn muốn mua trên ứng dụng hoặc website Shopee rồi dán vào trang web.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative group hover:border-orange-200 transition-colors">
            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center font-black text-lg mb-4 group-hover:scale-110 transition-transform">
              2
            </div>
            <h4 className="font-bold text-slate-900 mb-2">Bấm link đặt hàng</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Hệ thống tự động gắn mã Sub ID của bạn. Bấm mở Shopee hoặc quét mã QR để tiến hành đặt hàng như bình thường.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative group hover:border-orange-200 transition-colors">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-black text-lg mb-4 group-hover:scale-110 transition-transform">
              3
            </div>
            <h4 className="font-bold text-slate-900 mb-2">Đối soát & Cộng tiền hoàn</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Khi bạn nhận hàng thành công và Shopee chốt doanh thu, Admin đối soát và hệ thống cộng tiền hoàn trực tiếp vào Ví của bạn.
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative group hover:border-orange-200 transition-colors">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-black text-lg mb-4 group-hover:scale-110 transition-transform">
              4
            </div>
            <h4 className="font-bold text-slate-900 mb-2">Rút tiền trong 3 ngày</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Tạo lệnh rút tiền về STK ngân hàng đã đăng ký. Ban quản trị sẽ chi trả nhanh chóng trong vòng 3 ngày làm việc.
            </p>
          </div>
        </div>
      </section>

      {/* 3. FAQ SECTION */}
      <section id="faq" className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-slate-900">Câu Hỏi Thường Gặp</h3>
          <p className="text-xs text-slate-500 mt-1">Giải đáp các thắc mắc về chính sách hoàn tiền và chi trả</p>
        </div>

        <div className="space-y-3">
          {[
            {
              q: 'Làm thế nào để chắc chắn đơn hàng được ghi nhận hoàn tiền?',
              a: 'Sau khi dán link và lấy link affiliate từ website, bạn hãy bấm trực tiếp vào link hoặc quét mã QR để mở Shopee và đặt hàng ngay. Không bấm vào các link từ nhóm săn sale, link Facebook hoặc affiliate khác trước khi đặt hàng.'
            },
            {
              q: 'Khi nào số dư cashback được xác nhận khả dụng để rút?',
              a: 'Sau khi bạn nhận hàng thành công và hết hạn đổi trả của Shopee (thường 7-15 ngày), Shopee sẽ ghi nhận kết quả chính thức. Admin sẽ đối soát và duyệt đơn, tiền hoàn sẽ lập tức được cộng vào số dư khả dụng của bạn.'
            },
            {
              q: 'Thời gian rút tiền về tài khoản ngân hàng mất bao lâu?',
              a: 'Cam kết trong vòng tối đa 3 ngày làm việc (không tính thứ Bảy, Chủ Nhật và ngày lễ). Ban quản trị sẽ chuyển khoản trực tiếp qua ngân hàng 24/7 theo số tài khoản bạn đã lưu.'
            },
            {
              q: 'Số tiền rút tối thiểu là bao nhiêu?',
              a: 'Hạn mức rút tiền tối thiểu là 50.000 VNĐ. Khi số dư khả dụng của bạn đạt từ 50.000 VNĐ trở lên, bạn có thể tạo lệnh rút bất kỳ lúc nào.'
            }
          ].map((faq, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xs">
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between p-4 text-left font-bold text-sm text-slate-800 hover:text-orange-600 transition-colors"
              >
                <span>{faq.q}</span>
                {openFaq === idx ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>
              {openFaq === idx && (
                <div className="px-4 pb-4 text-xs text-slate-500 leading-relaxed border-t border-slate-50 pt-2">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* QR Modal */}
      {convertedResult && (
        <QRModal
          isOpen={showQrModal}
          onClose={() => setShowQrModal(false)}
          url={convertedResult.affiliate_url}
          title={convertedResult.product_title}
        />
      )}
    </div>
  );
}
