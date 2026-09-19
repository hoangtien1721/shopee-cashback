import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest, formatVND } from '../services/api';
import QRModal from '../components/QRModal';
import {
  CheckCircle2,
  ExternalLink,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Clock,
  Percent,
  Copy,
  Check,
  Search,
  Sparkles,
  ShoppingBag,
  Tag,
  Coins,
  Info
} from 'lucide-react';

export default function HomePage({ onOpenAuth, onNavigate }) {
  const { user } = useAuth();

  // Converter state
  const [inputUrl, setInputUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [convertedResult, setConvertedResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  // Accordion state
  const [openFaq, setOpenFaq] = useState(null);

  // Categories & Commission Rates (Official Shopee Affiliate Vietnam)
  const categoryRates = [
    {
      id: 'fashion',
      name: 'Thời trang, Giày dép & Phụ kiện',
      oldCustomerRate: '8.0%',
      newCustomerRate: '10.5%',
      note: 'Shopee Mall & Shop Yêu Thích'
    },
    {
      id: 'beauty',
      name: 'Sức khỏe & Sắc đẹp, Mỹ phẩm',
      oldCustomerRate: '6.0%',
      newCustomerRate: '7.5%',
      note: 'Dự kiến hoàn 18.000 đ - 45.000 đ / đơn'
    },
    {
      id: 'home',
      name: 'Nhà cửa & Đời sống, Thiết bị gia dụng',
      oldCustomerRate: '5.0%',
      newCustomerRate: '6.5%',
      note: 'Dự kiến hoàn 15.000 đ - 50.000 đ / đơn'
    },
    {
      id: 'baby',
      name: 'Mẹ & Bé, Bách Hóa Online & Thực phẩm',
      oldCustomerRate: '4.0%',
      newCustomerRate: '5.5%',
      note: 'Dự kiến hoàn 12.000 đ - 35.000 đ / đơn'
    },
    {
      id: 'electronics',
      name: 'Điện thoại, Máy tính bảng & Thiết bị số',
      oldCustomerRate: '1.5%',
      newCustomerRate: '3.0%',
      note: 'Mức hoàn cao cho đơn hàng giá trị lớn'
    },
    {
      id: 'new_user',
      name: 'Khách hàng mới Shopee (Đơn hàng đầu tiên)',
      oldCustomerRate: '10.0%',
      newCustomerRate: '12.0%',
      note: 'Tài khoản Shopee mới đăng ký và mua đơn đầu'
    }
  ];

  const handleConvert = async (e, customUrl = null) => {
    if (e) e.preventDefault();
    setError('');

    const targetUrl = customUrl || inputUrl;
    if (!targetUrl || !targetUrl.trim()) {
      setError('Vui lòng dán đường dẫn sản phẩm Shopee cần mua');
      return;
    }

    if (!user) {
      onOpenAuth('login');
      return;
    }

    setLoading(true);
    try {
      const res = await apiRequest('/links/convert', {
        method: 'POST',
        body: JSON.stringify({
          url: targetUrl.trim()
        })
      });

      if (res.success && res.link) {
        setConvertedResult(res.link);
        setTimeout(() => {
          document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
      }
    } catch (err) {
      setError(err.message || 'Không thể tạo liên kết hoàn tiền. Vui lòng kiểm tra lại đường dẫn');
    } finally {
      setLoading(false);
    }
  };

  const handleApplySample = (url) => {
    setInputUrl(url);
    const el = document.getElementById('shopee-link-input');
    if (el) {
      el.focus();
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    if (user) {
      handleConvert(null, url);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-12 pb-16 bg-[#F8F9FA]">
      {/* 1. HERO CONVERTER SECTION (PROMINENTLY HIGHLIGHTED) */}
      <section className="bg-gradient-to-b from-orange-50/70 via-amber-50/25 to-[#F8F9FA] border-b border-gray-200/80 pt-12 pb-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-7 space-y-2.5 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100/90 border border-orange-200/90 text-orange-800 text-xs font-semibold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-orange-600 animate-pulse"></span>
              <span>BoxHoanTien.com • Nền tảng hoàn tiền mua sắm Shopee</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
              Nhận hoàn tiền cho mọi đơn hàng Shopee
            </h1>

            <p className="text-sm text-gray-600 max-w-2xl leading-relaxed">
              Dán đường dẫn sản phẩm Shopee cần mua vào ô bên dưới để lấy link kích hoạt hoàn tiền. Tiền hoàn tự động ghi nhận vào ví và rút về tài khoản ngân hàng trong 3 ngày làm việc.
            </p>
          </div>

          {/* HIGHLIGHTED Link Converter Tool Box */}
          <div className="bg-white rounded-2xl border-2 border-orange-500/50 shadow-xl shadow-orange-500/10 p-5 sm:p-7 relative ring-4 ring-orange-500/5 transition-all hover:border-orange-500/70">
            <form onSubmit={handleConvert} className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100 text-xs">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-600"></span>
                  </span>
                  <label htmlFor="shopee-link-input" className="font-bold text-gray-900 uppercase tracking-wide">
                    Dán link Shopee để kích hoạt hoàn tiền
                  </label>
                </div>
                {!user && (
                  <button
                    type="button"
                    onClick={() => onOpenAuth('login')}
                    className="text-orange-600 hover:text-orange-700 font-semibold cursor-pointer hover:underline text-left sm:text-right"
                  >
                    Đăng nhập để nhận hoàn tiền vào ví →
                  </button>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-orange-600">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    id="shopee-link-input"
                    type="text"
                    placeholder="Dán link sản phẩm Shopee (ví dụ: https://shopee.vn/... hoặc https://s.shopee.vn/...)"
                    value={inputUrl}
                    onChange={(e) => {
                      setInputUrl(e.target.value);
                      setError('');
                    }}
                    className="w-full pl-10 pr-16 py-3 text-sm border-2 border-gray-200 hover:border-gray-300 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 bg-gray-50/40 hover:bg-white focus:bg-white text-gray-900 placeholder:text-gray-400 font-medium transition-all"
                  />
                  {inputUrl && (
                    <button
                      type="button"
                      onClick={() => setInputUrl('')}
                      className="absolute inset-y-0 right-2 my-auto h-7 px-2 text-[11px] font-semibold text-gray-500 hover:text-gray-700 rounded bg-gray-100 hover:bg-gray-200 cursor-pointer"
                    >
                      Xóa
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-7 py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-all shrink-0 shadow-md shadow-orange-600/25 cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
                >
                  {loading ? (
                    <span>Đang kiểm tra...</span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Lấy link hoàn tiền</span>
                    </>
                  )}
                </button>
              </div>

              {/* Quick sample link pills */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-gray-500">
                <span className="font-semibold text-gray-700">Thử nhanh mẫu:</span>
                {[
                  { label: 'Điện thoại Honor X9b', url: 'https://shopee.vn/HONOR-X9b-5G-12GB-256GB-Chong-Roi-Vo-Toan-Dien-i.1234567.8901234' },
                  { label: 'Tai nghe Soundcore', url: 'https://shopee.vn/Tai-Nghe-Soundcore-Space-One-Chong-On-i.2345678.9012345' },
                  { label: 'Kem chống nắng La Roche-Posay', url: 'https://shopee.vn/Kem-Chong-Nang-La-Roche-Posay-50ml-i.3456789.0123456' },
                  { label: 'Áo Polo Coolmate', url: 'https://shopee.vn/Ao-Polo-Nam-Coolmate-Cotton-Compact-i.5678901.2345678' }
                ].map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplySample(s.url)}
                    className="px-2.5 py-1 bg-gray-100 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-300 text-gray-700 rounded-full border border-gray-200 transition-colors cursor-pointer text-xs font-medium"
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </form>

            {/* CONVERSION RESULT CARD (100% VUA HOAN TIEN LAYOUT) */}
            {convertedResult && (
              <div
                id="result-section"
                className="mt-6 pt-6 border-t border-gray-200/90 space-y-4 animate-in fade-in duration-200"
              >
                {/* Product Header: Image, Title & Badges */}
                <div className="flex flex-col sm:flex-row gap-4 items-start bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
                  {/* Thumbnail */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-orange-50 border border-orange-200/80 shrink-0 flex items-center justify-center shadow-xs">
                    {convertedResult.product_image ? (
                      <img
                        src={convertedResult.product_image}
                        alt={convertedResult.product_title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = '<div class="flex flex-col items-center justify-center text-orange-600 p-2 text-center"><svg class="w-8 h-8 stroke-[1.5]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg><span class="text-[10px] font-bold mt-1 text-orange-700">Shopee</span></div>';
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-orange-600 p-2 text-center">
                        <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
                        <span className="text-[10px] font-bold mt-1 text-orange-700">Shopee</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Sản phẩm hợp lệ nhận hoàn tiền</span>
                      </div>
                      {convertedResult.category_name && (
                        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gray-100 border border-gray-200 text-gray-700 text-xs font-medium">
                          <Tag className="w-3 h-3 text-gray-500" />
                          <span>{convertedResult.category_name}</span>
                        </div>
                      )}
                    </div>

                    <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-2">
                      {convertedResult.product_title || 'Sản phẩm Shopee hợp lệ'}
                    </h3>
                  </div>
                </div>

                {/* 2 Cards Side-by-Side: Giá bán hiện tại & Tiền hoàn dự kiến */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Card 1: GIÁ BÁN HIỆN TẠI */}
                  <div className="p-4 rounded-2xl bg-white border border-gray-200/90 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between text-xs font-bold text-gray-500 uppercase tracking-wider">
                      <span className="flex items-center gap-1.5">
                        <Tag className="w-4 h-4 text-gray-400" />
                        GIÁ BÁN HIỆN TẠI
                      </span>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                        Niêm yết Shopee
                      </span>
                    </div>
                    <div className="mt-2 text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                      {convertedResult.product_price && convertedResult.product_price > 0
                        ? formatVND(convertedResult.product_price)
                        : 'Theo hóa đơn Shopee'}
                    </div>
                    <div className="text-[11px] text-gray-500 mt-1 font-medium">
                      Chưa tính voucher giảm giá bổ sung
                    </div>
                  </div>

                  {/* Card 2: TIỀN HOÀN DỰ KIẾN */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-50 via-amber-50/50 to-orange-50/80 border-2 border-orange-300 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between text-xs font-bold text-orange-900 uppercase tracking-wider">
                      <span className="flex items-center gap-1.5">
                        <Coins className="w-4 h-4 text-orange-600" />
                        TIỀN HOÀN DỰ KIẾN
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-200/80 text-orange-800">
                        Cộng vào Ví
                      </span>
                    </div>
                    <div className="mt-2 text-2xl sm:text-3xl font-black text-orange-600 tracking-tight">
                      {convertedResult.estimated_cashback && convertedResult.estimated_cashback > 0
                        ? formatVND(convertedResult.estimated_cashback)
                        : `Lên đến ${convertedResult.cashback_rate || '10.5%'}`}
                    </div>
                    <div className="text-[11px] text-orange-800/80 mt-1 font-medium">
                      Tỷ lệ hoàn: ~{convertedResult.cashback_rate || '4.0%'} (50% hoa hồng Shopee)
                    </div>
                  </div>
                </div>

                {/* Disclaimer Notice Box (Exact Vua Hoan Tien notice) */}
                <div className="p-3.5 bg-amber-50/80 rounded-xl border border-amber-200/90 text-xs text-amber-900 flex items-start gap-2.5 leading-relaxed">
                  <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-semibold text-amber-950">Lưu ý: </strong>
                    Tiền hoàn hiển thị là tạm tính. Số tiền thực nhận sẽ được ghi nhận theo giá trị đơn hàng sau khi trừ voucher và mã giảm giá trên hóa đơn thanh toán thực tế của Shopee.
                  </div>
                </div>

                {/* Single Direct CTA Button: Mở Mua Hàng Nhận Hoàn Tiền */}
                <a
                  href={convertedResult.localRedirectUrl || convertedResult.affiliate_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 px-6 bg-gradient-to-r from-orange-600 via-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-xl text-base font-bold text-center flex items-center justify-center gap-2.5 cursor-pointer transition-all shadow-lg shadow-orange-600/25 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99]"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>Mở Mua Hàng Nhận Hoàn Tiền</span>
                  <ExternalLink className="w-4 h-4 opacity-80 ml-1" />
                </a>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. THREE CORE PROPOSITIONS (CLEAN TRUST BAR) */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-start gap-3 shadow-xs">
            <div className="w-8 h-8 rounded-md bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600 shrink-0 mt-0.5">
              <Percent className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 text-sm">Hoàn tiền đến 10.5%</h4>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                Tự động áp dụng mức hoàn cao nhất cho mọi đơn hàng Shopee Mall và Shop Yêu Thích.
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-start gap-3 shadow-xs">
            <div className="w-8 h-8 rounded-md bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0 mt-0.5">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 text-sm">Rút tiền trong 3 ngày</h4>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                Xử lý chuyển khoản trực tiếp về tất cả tài khoản ngân hàng nội địa Việt Nam.
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-start gap-3 shadow-xs">
            <div className="w-8 h-8 rounded-md bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 text-sm">100% Miễn phí</h4>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                Không phí dịch vụ, không phí duy trì. Nhận trọn vẹn số tiền hoàn về tài khoản.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS (3 SIMPLE STEPS) */}
      <section id="how-it-works" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-4 text-center sm:text-left">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
            Quy trình 3 bước nhận hoàn tiền
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Dễ dàng thực hiện chỉ trong 30 giây trước khi mua hàng
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-lg border border-gray-200 space-y-2 shadow-xs">
            <div className="w-7 h-7 rounded bg-gray-900 text-white font-bold text-xs flex items-center justify-center">
              1
            </div>
            <h4 className="font-semibold text-gray-900 text-sm">Sao chép link sản phẩm</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Mở Shopee, chọn sản phẩm bạn muốn mua và bấm nút chia sẻ để sao chép đường dẫn.
            </p>
          </div>

          <div className="bg-white p-5 rounded-lg border border-gray-200 space-y-2 shadow-xs">
            <div className="w-7 h-7 rounded bg-gray-900 text-white font-bold text-xs flex items-center justify-center">
              2
            </div>
            <h4 className="font-semibold text-gray-900 text-sm">Tạo link hoàn tiền</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Dán link vào Box Hoàn Tiền để tạo đường dẫn chuyển hướng có gắn mã định danh Sub ID.
            </p>
          </div>

          <div className="bg-white p-5 rounded-lg border border-gray-200 space-y-2 shadow-xs">
            <div className="w-7 h-7 rounded bg-gray-900 text-white font-bold text-xs flex items-center justify-center">
              3
            </div>
            <h4 className="font-semibold text-gray-900 text-sm">Mua hàng & Rút tiền</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Thanh toán trên Shopee như thường lệ. Tiền hoàn sẽ ghi nhận vào ví và rút về tài khoản ngân hàng.
            </p>
          </div>
        </div>
      </section>

      {/* 4. RATES TABLE (CLEAN, TRANSPARENT) */}
      <section id="rates-table" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
            Biểu phí hoàn tiền Shopee
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Áp dụng theo khung tỷ lệ chương trình Shopee Affiliate Program tại Việt Nam
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold">
                  <th className="py-2.5 px-4">Ngành hàng</th>
                  <th className="py-2.5 px-4 text-right">Khách hàng cũ</th>
                  <th className="py-2.5 px-4 text-right">Khách hàng mới</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {categoryRates.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/50">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{c.name}</div>
                      <div className="text-[11px] text-gray-400 mt-0.5">{c.note}</div>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-gray-800">
                      {c.oldCustomerRate}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-orange-600">
                      {c.newCustomerRate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 5. FAQ (CORE ESSENTIALS) */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
            Câu hỏi thường gặp
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Giải đáp thắc mắc về cơ chế ghi nhận và chi trả tiền hoàn
          </p>
        </div>

        <div className="space-y-2">
          {[
            {
              q: 'Đơn hàng được ghi nhận hoàn tiền như thế nào?',
              a: 'Khi bạn bấm vào liên kết đã chuyển đổi hoặc quét mã QR từ Box Hoàn Tiền, hệ thống sẽ chuyển bạn sang Shopee kèm mã theo dõi Sub ID. Khi bạn thanh toán thành công, Shopee tự động đồng bộ đơn hàng về hệ thống.'
            },
            {
              q: 'Khi nào tiền hoàn có thể rút về tài khoản ngân hàng?',
              a: 'Sau khi đơn hàng chuyển sang trạng thái "Giao thành công" và hết hạn đổi trả theo quy định của Shopee (thường từ 7 đến 15 ngày), tiền hoàn sẽ chuyển sang trạng thái "Khả dụng" để bạn có thể tạo lệnh rút.'
            },
            {
              q: 'Hạn mức rút tối thiểu và thời gian nhận tiền?',
              a: 'Số dư khả dụng tối thiểu để rút tiền là 50.000 đ. Lệnh rút tiền được ban quản trị duyệt và chuyển khoản trực tiếp về tài khoản ngân hàng của bạn trong vòng tối đa 3 ngày làm việc.'
            },
            {
              q: 'Trường hợp nào đơn hàng không được ghi nhận hoàn tiền?',
              a: 'Đơn hàng bị hủy, trả hàng, phát sinh khiếu nại, vi phạm quy chế Shopee, hoặc trước khi thanh toán bạn đã bấm vào liên kết tiếp thị của bên khác dẫn đến bị ghi đè mã theo dõi.'
            }
          ].map((item, idx) => (
            <div key={idx} className="bg-white rounded-lg border border-gray-200 overflow-hidden text-xs shadow-xs">
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between p-3.5 text-left font-semibold text-gray-800 hover:text-orange-600 transition-colors cursor-pointer"
              >
                <span>{item.q}</span>
                {openFaq === idx ? (
                  <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                )}
              </button>
              {openFaq === idx && (
                <div className="px-3.5 pb-3.5 text-gray-600 leading-relaxed border-t border-gray-100 pt-2.5">
                  {item.a}
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
