import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest, formatVND } from '../services/api';
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
  Zap,
  TrendingUp,
  Lightbulb,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Calculator,
  Gift,
  HelpCircle,
  Layers,
  Percent
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

  // Accordion state
  const [openFaq, setOpenFaq] = useState(null);
  const [openTerms, setOpenTerms] = useState(false);

  // Interactive Cashback Calculator state
  const [calcAmount, setCalcAmount] = useState(500000);
  const [calcCategory, setCalcCategory] = useState('fashion');

  // Cashback categories data (ShopBack standard)
  const categoryRates = [
    {
      id: 'fashion',
      name: 'Thời trang Nữ, Nam, Giày dép & Túi xách',
      minRate: 8.0,
      maxRate: 10.5,
      rateDisplay: '8,0% - 10,5%',
      isEligible: true,
      note: 'Áp dụng cho mọi thương hiệu và Shop Mall/Yêu thích'
    },
    {
      id: 'beauty',
      name: 'Sức khỏe & Sắc đẹp (Mỹ phẩm, Skincare)',
      minRate: 6.0,
      maxRate: 7.5,
      rateDisplay: '6,0% - 7,5%',
      isEligible: true,
      note: 'Dự kiến ~18.000đ - 45.000đ/đơn'
    },
    {
      id: 'home',
      name: 'Nhà cửa & Đời sống, Đồ gia dụng tiện ích',
      minRate: 5.0,
      maxRate: 6.5,
      rateDisplay: '5,0% - 6,5%',
      isEligible: true,
      note: 'Dự kiến ~15.000đ - 40.000đ/đơn'
    },
    {
      id: 'baby',
      name: 'Mẹ & Bé, Bách Hóa Online & Thực phẩm',
      minRate: 4.0,
      maxRate: 5.5,
      rateDisplay: '4,0% - 5,5%',
      isEligible: true,
      note: 'Dự kiến ~12.000đ - 35.000đ/đơn'
    },
    {
      id: 'electronics',
      name: 'Điện thoại, Laptop & Thiết bị điện tử',
      minRate: 1.5,
      maxRate: 3.0,
      rateDisplay: '1,5% - 3,0%',
      isEligible: true,
      note: 'Giá trị đơn cao, dự kiến hoàn 30.000đ - 150.000đ'
    },
    {
      id: 'new_user',
      name: 'Khách hàng mới Shopee (Đơn đầu tiên)',
      minRate: 10.0,
      maxRate: 12.0,
      rateDisplay: 'Thưởng đến 12%',
      isEligible: true,
      note: 'Thưởng thêm khi tài khoản Shopee lần đầu mua sắm'
    },
    {
      id: 'video',
      name: 'Mua sắm tại Shopee Video, livestream trên Shopee',
      minRate: 0.0,
      maxRate: 1.0,
      rateDisplay: '0% - 1,0%',
      isEligible: false,
      note: 'Tùy thuộc chính sách từng shop và khung giờ live'
    },
    {
      id: 'food',
      name: 'Food delivery (ShopeeFood), e-voucher & dịch vụ',
      minRate: 0,
      maxRate: 0,
      rateDisplay: '0%',
      isEligible: false,
      note: 'Shopee chưa áp dụng hoàn tiền cho danh mục này'
    },
    {
      id: 'restricted',
      name: 'Sản phẩm cấm quảng cáo (Sữa dưới 24T, thẻ cào...)',
      minRate: 0,
      maxRate: 0,
      rateDisplay: '0%',
      isEligible: false,
      note: 'Theo quy định pháp luật hiện hành'
    }
  ];

  // Calculate estimated cashback
  const currentCat = categoryRates.find((c) => c.id === calcCategory) || categoryRates[0];
  const minCashback = Math.round((calcAmount * currentCat.minRate) / 100);
  const maxCashback = Math.round((calcAmount * currentCat.maxRate) / 100);

  const handleConvert = async (e) => {
    e.preventDefault();
    setError('');

    if (!inputUrl.trim()) {
      setError('Vui lòng dán link Shopee vào ô bên dưới');
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
    <div className="space-y-12 pb-16">
      {/* 1. SHOPBACK-STYLE HERO COVER & STORE BANNER */}
      <section className="relative bg-linear-to-b from-slate-900 via-slate-800 to-slate-900 text-white pt-8 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background lifestyle glow effects */}
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#ee4d2d_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10">
          {/* Official Store Card (Exact ShopBack layout) */}
          <div className="bg-white text-slate-900 rounded-3xl shadow-2xl p-6 sm:p-8 border border-slate-100">
            {/* Store Header Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-4">
                {/* Shopee Logo Box */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-linear-to-tr from-orange-600 to-amber-500 flex flex-col items-center justify-center text-white shadow-lg shadow-orange-500/30 shrink-0">
                  <ShoppingBag className="w-8 h-8 sm:w-10 sm:h-10" />
                  <span className="text-[10px] font-black tracking-wider uppercase -mt-0.5">Shopee</span>
                </div>

                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold mb-1">
                    <span>Sàn thương mại điện tử</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    Shopee Official Stores
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 text-xs" title="Đối tác xác thực">
                      ✓
                    </span>
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Hoàn tiền tự động vào số dư khả dụng • Chi trả chuyển khoản trong 3 ngày làm việc
                  </p>
                </div>
              </div>

              {/* Tag rates badge */}
              <div className="sm:text-right shrink-0">
                <span className="inline-block text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-3 py-1 rounded-full">
                  ↑ Hoàn Tiền Đến 10,5%
                </span>
                <div className="text-[11px] text-slate-400 mt-1">Đã kiểm chứng bởi Shopee Affiliate</div>
              </div>
            </div>

            {/* Link Converter Form (Embedded inside the Store Card) */}
            <div className="mt-6">
              <form onSubmit={handleConvert} className="space-y-3">
                <div className="flex items-center justify-between">
                  <label htmlFor="shopee-link-input" className="block text-xs sm:text-sm font-bold text-slate-800">
                    🔗 Dán link sản phẩm Shopee của bạn vào đây:
                  </label>
                  {!user && (
                    <span
                      onClick={() => onOpenAuth('login')}
                      className="text-xs text-orange-600 font-bold hover:underline cursor-pointer"
                    >
                      * Đăng nhập để nhận hoàn tiền
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5">
                  <input
                    id="shopee-link-input"
                    type="text"
                    placeholder="VD: https://shopee.vn/product/... hoặc https://s.shopee.vn/..."
                    value={inputUrl}
                    onChange={(e) => {
                      setInputUrl(e.target.value);
                      setError('');
                    }}
                    className="flex-1 px-4 py-3.5 text-sm sm:text-base border-2 border-slate-200 hover:border-slate-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 rounded-2xl transition-all focus:outline-hidden"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center justify-center gap-2 py-3.5 px-6 bg-linear-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 disabled:opacity-50 text-white rounded-2xl text-sm sm:text-base font-bold shadow-lg shadow-orange-500/25 transition-all cursor-pointer shrink-0"
                  >
                    {loading ? (
                      <span>Đang tạo link...</span>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>{user ? 'Lấy Link Hoàn Tiền' : 'Đăng nhập & Nhận hoàn tiền'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
              </form>

              {/* Conversion Result Output (Exact VuaHoanTien UI) */}
              {convertedResult && (
                <div className="mt-6 p-5 sm:p-6 bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 animate-in fade-in slide-in-from-top-3 duration-200 space-y-4">
                  {/* Product Main Container */}
                  <div className="flex flex-col sm:flex-row gap-4 items-start">
                    {/* Product Image Thumbnail */}
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 shadow-xs relative">
                      <img
                        src={convertedResult.product_image || 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&auto=format&fit=crop&q=80'}
                        alt={convertedResult.product_title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop&q=80';
                        }}
                      />
                      <div className="absolute bottom-1 right-1 bg-orange-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md">
                        Shopee
                      </div>
                    </div>

                    {/* Product Info & Two Metric Boxes */}
                    <div className="flex-1 space-y-3 min-w-0">
                      {/* Valid badge */}
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200/80 text-orange-700 text-xs font-bold">
                        <ShoppingBag className="w-3.5 h-3.5 text-orange-600" />
                        <span>Sản phẩm hợp lệ nhận hoàn tiền</span>
                      </div>

                      {/* Product full title */}
                      <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-snug line-clamp-2">
                        {convertedResult.product_title || 'Sản phẩm Shopee hợp lệ'}
                      </h3>

                      {/* Two Metric Boxes: Giá bán hiện tại & Tiền hoàn dự kiến (Exact VuaHoanTien style) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        {/* Box 1: Giá bán hiện tại */}
                        <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 shadow-xs shrink-0">
                            <span className="text-base">🏷️</span>
                          </div>
                          <div>
                            <div className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                              GIÁ BÁN HIỆN TẠI:
                            </div>
                            <div className="text-sm sm:text-base font-black text-slate-800">
                              {convertedResult.product_price && convertedResult.product_price > 0
                                ? formatVND(convertedResult.product_price)
                                : '0đ'}
                            </div>
                          </div>
                        </div>

                        {/* Box 2: Tiền hoàn dự kiến (Highlight) */}
                        <div className="flex items-center gap-3 p-3 rounded-2xl bg-amber-50/80 border border-amber-200/90 shadow-xs">
                          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                            <Wallet className="w-5 h-5 text-orange-600" />
                          </div>
                          <div>
                            <div className="text-[10px] sm:text-[11px] font-extrabold text-amber-900 uppercase tracking-wider">
                              TIỀN HOÀN DỰ KIẾN:
                            </div>
                            <div className="text-base sm:text-xl font-black text-orange-600">
                              {formatVND(convertedResult.estimated_cashback || 116890)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Important Notes Box (Exact text from screenshot) */}
                  <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200/80 text-xs text-slate-600 leading-relaxed space-y-1.5">
                    <div className="font-extrabold text-slate-900 flex items-center gap-1.5 text-xs">
                      <span className="text-red-500 font-black">❗</span>
                      <span>Lưu ý:</span>
                    </div>
                    <p>
                      Tiền hoàn hiển thị là tạm tính. Số tiền thực nhận sẽ được ghi nhận theo giá trị đơn hàng sau khi trừ voucher và mã giảm giá.
                    </p>
                    <p className="text-slate-500">
                      Nếu mua nhiều sản phẩm trong cùng một đơn, tiền hoàn sẽ được nhân lên theo số lượng sản phẩm đủ điều kiện. Một số ngành hàng Shopee có thể giới hạn tối đa 50K/đơn, nên với đơn lớn bạn có thể tách đơn hoặc nhắn hỗ trợ để được tư vấn.
                    </p>
                  </div>

                  {/* Converted Short Link Input */}
                  <div className="space-y-1.5 pt-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Liên kết rút gọn hoàn tiền của bạn:
                    </label>
                    <div className="flex items-center gap-2 p-2 sm:p-2.5 bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
                      <div className="flex-1 truncate font-mono text-xs sm:text-sm text-slate-700 select-all pl-2">
                        {convertedResult.localRedirectUrl || convertedResult.affiliate_url}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => setShowQrModal(true)}
                          title="Quét mã QR"
                          className="p-2 hover:bg-white text-slate-600 hover:text-orange-600 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-slate-200"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopy(convertedResult.localRedirectUrl || convertedResult.affiliate_url)}
                          title="Sao chép link"
                          className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-xs transition-colors cursor-pointer"
                        >
                          {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                          <span>{copied ? 'Đã chép' : 'Sao chép'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Big Primary Action Button */}
                  <a
                    href={convertedResult.affiliate_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-linear-to-r from-orange-600 via-orange-500 to-red-500 hover:from-orange-700 hover:to-red-600 text-white rounded-2xl text-base font-black shadow-lg shadow-orange-500/25 transition-all text-center cursor-pointer hover:scale-[1.01]"
                  >
                    <ExternalLink className="w-5 h-5" />
                    <span>Mở Mua Hàng Nhận Hoàn Tiền</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. MAIN 2-COLUMN SECTION (SHOPBACK LAYOUT) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN: CASHBACK RATES & ESTIMATION (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Header Mức Hoàn Tiền */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-sm">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-extrabold mb-3">
                <Percent className="w-3.5 h-3.5" />
                <span>Mức Hoàn Tiền Chi Tiết</span>
              </div>

              <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
                Hoàn tiền lên đến 10,5%
              </h2>

              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-6">
                Mức tiền hoàn thực tế được tính dựa trên số tiền thực tế bạn thanh toán cho Shopee (sau khi đã trừ voucher giảm giá của shop, voucher Shopee và Shopee Xu).
              </p>

              {/* Category rates table / list */}
              <div className="divide-y divide-slate-100">
                {categoryRates.map((item) => (
                  <div key={item.id} className="py-3.5 flex items-start justify-between gap-4">
                    <div className="space-y-0.5">
                      <div className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <span>{item.name}</span>
                      </div>
                      <div className="text-xs text-slate-400">{item.note}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className={`text-sm font-black ${item.isEligible ? 'text-purple-700' : 'text-slate-400'}`}>
                        {item.rateDisplay}
                      </div>
                      {item.isEligible && (
                        <div className="text-[10px] text-emerald-600 font-bold">Áp dụng</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* INTERACTIVE CASHBACK CALCULATOR (BỘ ƯỚC TÍNH TIỀN HOÀN CHO MỖI ĐƠN) */}
            <div className="bg-linear-to-br from-orange-500 via-amber-500 to-orange-600 rounded-3xl p-6 sm:p-7 text-white shadow-xl shadow-orange-500/20">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-orange-100 mb-2">
                <Calculator className="w-4 h-4" />
                <span>Ước Tính Tiền Hoàn Thực Tế Theo Đơn Hàng</span>
              </div>

              <h3 className="text-2xl font-black tracking-tight mb-4">
                Bạn sẽ nhận lại bao nhiêu tiền?
              </h3>

              {/* Pick Amount */}
              <div className="space-y-3 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span>Giá trị đơn hàng dự kiến:</span>
                  <span className="text-base font-black text-amber-200">{formatVND(calcAmount)}</span>
                </div>

                {/* Quick Buttons */}
                <div className="grid grid-cols-4 gap-1.5">
                  {[200000, 500000, 1000000, 2000000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setCalcAmount(amt)}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        calcAmount === amt
                          ? 'bg-white text-orange-600 shadow-sm'
                          : 'bg-white/15 hover:bg-white/25 text-white'
                      }`}
                    >
                      {amt >= 1000000 ? `${amt / 1000000} Triệu` : `${amt / 1000}K`}
                    </button>
                  ))}
                </div>

                {/* Select Category */}
                <div className="pt-2">
                  <label className="block text-xs text-orange-100 font-semibold mb-1.5">
                    Chọn ngành hàng sản phẩm:
                  </label>
                  <select
                    value={calcCategory}
                    onChange={(e) => setCalcCategory(e.target.value)}
                    className="w-full bg-white text-slate-900 font-bold text-xs sm:text-sm rounded-xl px-3 py-2.5 focus:outline-hidden"
                  >
                    <option value="fashion">👗 Thời trang, Giày dép, Phụ kiện (8% - 10.5%)</option>
                    <option value="beauty">💄 Sức khỏe & Sắc đẹp, Mỹ phẩm (6% - 7.5%)</option>
                    <option value="home">🏡 Nhà cửa & Đời sống, Gia dụng (5% - 6.5%)</option>
                    <option value="baby">🍼 Mẹ & Bé, Bách Hóa Online (4% - 5.5%)</option>
                    <option value="electronics">📱 Điện thoại, Laptop & Thiết bị số (1.5% - 3%)</option>
                    <option value="new_user">🎁 Khách hàng mới Shopee (Thưởng đến 12%)</option>
                  </select>
                </div>
              </div>

              {/* Estimation Display Result */}
              <div className="mt-5 p-4 rounded-2xl bg-white text-slate-900 shadow-md flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500 font-semibold">Mức tiền hoàn dự kiến nhận về ví:</div>
                  <div className="text-2xl sm:text-3xl font-black text-orange-600 mt-0.5">
                    {formatVND(minCashback)} - {formatVND(maxCashback)}
                  </div>
                  <div className="text-[11px] text-emerald-600 font-bold mt-0.5">
                    ✓ Rút trực tiếp về STK ngân hàng trong 3 ngày
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('shopee-link-input');
                    if (el) {
                      el.focus();
                      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                  }}
                  className="shrink-0 px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-transform hover:scale-105 cursor-pointer shadow-md"
                >
                  Dán link ngay
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: PROMO, TIPS, & TIMELINE (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Ưu đãi và Giảm giá (ShopBack Style) */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">
                <Gift className="w-4 h-4 text-orange-600" />
                <span>Ưu đãi và Giảm giá</span>
              </div>

              <div className="p-4 rounded-2xl bg-linear-to-r from-purple-50 to-indigo-50 border border-purple-200/80 flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-black text-xl shrink-0 shadow-md shadow-purple-500/20">
                  %
                </div>
                <div>
                  <div className="font-extrabold text-slate-900 text-sm">
                    Chiến thần chốt đơn Shopee
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Thưởng thêm đến <strong>30.000đ</strong> cho đơn hàng đầu tiên hoặc bạn bè giới thiệu!
                  </div>
                </div>
              </div>
            </div>

            {/* Mẹo Hoàn Tiền (ShopBack Tips - Crucial) */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-base font-black text-slate-900">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                <span>Mẹo Hoàn Tiền Tránh Mất Đơn</span>
              </div>

              <div className="space-y-3 text-xs leading-relaxed text-slate-600">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-800">Làm trống giỏ hàng trước khi nhấn link:</strong> Hãy chuyển các món cũ sang mục "Mua sau", sau đó bấm link ShopeeCash và mới thêm vào giỏ.
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-800">Thanh toán trong cùng một phiên:</strong> Sau khi bấm link chuyển hướng sang Shopee, hãy đặt hàng ngay trong vòng 30 phút.
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-800">Không bấm link quảng cáo khác:</strong> Tránh click banner Facebook, tin nhắn group Zalo săn sale giữa chừng vì sẽ làm mất tracking ShopeeCash.
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline Thời Gian Hoàn Tiền (ShopBack Tracker) */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 text-base font-black text-slate-900 mb-4">
                <Clock className="w-5 h-5 text-blue-600" />
                <span>Thời Gian Hoàn Tiền</span>
              </div>

              <div className="space-y-4 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                <div className="flex items-start gap-3.5 relative">
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-xs">
                    1
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Mua sắm qua link ShopeeCash</div>
                    <div className="text-[11px] text-slate-400">Ngay hôm nay khi click chuyển hướng</div>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 relative">
                  <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-xs">
                    2
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Ghi nhận tạm tính vào ví</div>
                    <div className="text-[11px] text-slate-400">Sau 2 - 3 ngày làm việc kể từ lúc đặt hàng</div>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 relative">
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-xs">
                    3
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Xác nhận & Rút tiền về ngân hàng</div>
                    <div className="text-[11px] text-slate-400">Sau khi nhận hàng thành công, Admin duyệt chi trả trong 3 ngày làm việc</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Điều Khoản và Điều Kiện Accordion (ShopBack Terms) */}
            <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
              <button
                type="button"
                onClick={() => setOpenTerms(!openTerms)}
                className="w-full flex items-center justify-between p-5 text-left font-black text-sm text-slate-900 hover:text-orange-600 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-slate-400" />
                  <span>Điều Khoản & Điều Kiện Áp Dụng</span>
                </div>
                {openTerms ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>

              {openTerms && (
                <div className="p-5 pt-0 text-xs text-slate-500 space-y-2 border-t border-slate-50 leading-relaxed">
                  <p>• <strong>Điều kiện hủy đơn:</strong> Đơn hàng bị hủy, trả hàng, hoặc hoàn tiền trên Shopee sẽ không được tính tiền hoàn.</p>
                  <p>• <strong>Hạn mức rút tiền:</strong> Số dư khả dụng đạt tối thiểu <strong>50.000 VNĐ</strong> có thể gửi yêu cầu rút tiền về STK ngân hàng.</p>
                  <p>• <strong>Cam kết thời gian chi trả:</strong> Trong vòng tối đa 3 ngày làm việc (không tính thứ Bảy, Chủ Nhật và ngày lễ) qua chuyển khoản ngân hàng 24/7.</p>
                  <p>• <strong>Quy định gian lận:</strong> Nghiêm cấm các hành vi tự click gian lận, dùng bot hoặc cố tình vi phạm chính sách của Shopee Affiliate.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3. STEP-BY-STEP HOW IT WORKS */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs uppercase font-extrabold text-orange-600 tracking-wider">Quy trình đơn giản</span>
          <h2 className="text-3xl font-black text-slate-900 mt-1">
            Cách Thức Hoàn Tiền 4 Bước
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Không cần thẻ tín dụng, tiền hoàn trực tiếp vào tài khoản ngân hàng của bạn
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:border-orange-200 transition-colors">
            <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center font-black text-base mb-3">
              1
            </div>
            <h4 className="font-bold text-slate-900 mb-1.5 text-sm">Dán link sản phẩm</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Sao chép bất kỳ link sản phẩm Shopee nào bạn muốn mua rồi dán vào trang web.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:border-orange-200 transition-colors">
            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center font-black text-base mb-3">
              2
            </div>
            <h4 className="font-bold text-slate-900 mb-1.5 text-sm">Bấm link đặt hàng</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Hệ thống tự động gắn Sub ID. Bấm mở Shopee hoặc quét mã QR để thanh toán ngay.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:border-orange-200 transition-colors">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-black text-base mb-3">
              3
            </div>
            <h4 className="font-bold text-slate-900 mb-1.5 text-sm">Đối soát & Tích lũy</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Khi giao hàng thành công, hệ thống đối soát và tự động cộng tiền hoàn vào ví.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:border-orange-200 transition-colors">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-black text-base mb-3">
              4
            </div>
            <h4 className="font-bold text-slate-900 mb-1.5 text-sm">Rút tiền trong 3 ngày</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Tạo lệnh rút tiền về STK ngân hàng. Ban quản trị chuyển khoản trong 3 ngày làm việc.
            </p>
          </div>
        </div>
      </section>

      {/* 4. FAQ ACCORDION */}
      <section id="faq" className="max-w-3xl mx-auto px-4 sm:px-6 pt-6">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-black text-slate-900">Câu Hỏi Thường Gặp</h3>
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
                type="button"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between p-4 text-left font-bold text-sm text-slate-800 hover:text-orange-600 transition-colors cursor-pointer"
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

