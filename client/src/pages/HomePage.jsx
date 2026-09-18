import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest, formatVND } from '../services/api';
import QRModal from '../components/QRModal';
import {
  Search,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  QrCode,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ShieldCheck,
  Clock,
  HelpCircle,
  Calculator,
  RefreshCw,
  ShoppingBag,
  Tag
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

  // Interactive Calculator state
  const [calcAmount, setCalcAmount] = useState(500000);
  const [calcCategory, setCalcCategory] = useState('fashion');

  // Categories & Commission Rates
  const categoryRates = [
    {
      id: 'fashion',
      name: 'Thời trang, Giày dép & Phụ kiện',
      oldCustomerRate: '8.0%',
      newCustomerRate: '10.5%',
      minRate: 8.0,
      maxRate: 10.5,
      note: 'Áp dụng cho Shopee Mall và Shop Yêu Thích'
    },
    {
      id: 'beauty',
      name: 'Sức khỏe & Sắc đẹp, Mỹ phẩm',
      oldCustomerRate: '6.0%',
      newCustomerRate: '7.5%',
      minRate: 6.0,
      maxRate: 7.5,
      note: 'Dự kiến hoàn 18.000 đ - 45.000 đ / đơn'
    },
    {
      id: 'home',
      name: 'Nhà cửa & Đời sống, Thiết bị gia dụng',
      oldCustomerRate: '5.0%',
      newCustomerRate: '6.5%',
      minRate: 5.0,
      maxRate: 6.5,
      note: 'Dự kiến hoàn 15.000 đ - 50.000 đ / đơn'
    },
    {
      id: 'baby',
      name: 'Mẹ & Bé, Bách Hóa Online & Thực phẩm',
      oldCustomerRate: '4.0%',
      newCustomerRate: '5.5%',
      minRate: 4.0,
      maxRate: 5.5,
      note: 'Dự kiến hoàn 12.000 đ - 35.000 đ / đơn'
    },
    {
      id: 'electronics',
      name: 'Điện thoại, Máy tính bảng & Thiết bị số',
      oldCustomerRate: '1.5%',
      newCustomerRate: '3.0%',
      minRate: 1.5,
      maxRate: 3.0,
      note: 'Mức hoàn cao cho đơn hàng giá trị lớn'
    },
    {
      id: 'new_user',
      name: 'Khách hàng mới Shopee (Đơn hàng đầu tiên)',
      oldCustomerRate: '10.0%',
      newCustomerRate: '12.0%',
      minRate: 10.0,
      maxRate: 12.0,
      note: 'Tài khoản Shopee mới đăng ký và mua đơn đầu'
    }
  ];

  // Merchant Categories
  const merchants = [
    {
      id: 'shopee-mall',
      name: 'Shopee Mall',
      desc: 'Gian hàng chính hãng 100%',
      rate: 'Hoàn đến 8.0%',
      color: 'text-red-700 bg-red-50 border-red-200'
    },
    {
      id: 'fashion',
      name: 'Thời Trang & Phụ Kiện',
      desc: 'Quần áo, Giày dép, Túi xách',
      rate: 'Hoàn đến 10.5%',
      color: 'text-purple-700 bg-purple-50 border-purple-200'
    },
    {
      id: 'beauty',
      name: 'Mỹ Phẩm & Sắc Đẹp',
      desc: 'Chăm sóc da, Trang điểm, Nước hoa',
      rate: 'Hoàn đến 7.5%',
      color: 'text-rose-700 bg-rose-50 border-rose-200'
    },
    {
      id: 'home',
      name: 'Nhà Cửa & Đời Sống',
      desc: 'Gia dụng, Bếp, Tiện ích gia đình',
      rate: 'Hoàn đến 6.5%',
      color: 'text-amber-800 bg-amber-50 border-amber-200'
    },
    {
      id: 'tech',
      name: 'Điện Thoại & Công Nghệ',
      desc: 'Smartphone, Laptop, Phụ kiện',
      rate: 'Hoàn đến 3.0%',
      color: 'text-blue-700 bg-blue-50 border-blue-200'
    },
    {
      id: 'baby',
      name: 'Mẹ & Bé',
      desc: 'Tã bỉm, Sữa công thức, Đồ sơ sinh',
      rate: 'Hoàn đến 5.5%',
      color: 'text-sky-700 bg-sky-50 border-sky-200'
    },
    {
      id: 'supermarket',
      name: 'Bách Hóa Online',
      desc: 'Thực phẩm, Đồ ăn vặt, Nhu yếu phẩm',
      rate: 'Hoàn đến 5.0%',
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200'
    },
    {
      id: 'official',
      name: 'Shop Yêu Thích & Mall',
      desc: 'Hàng triệu gian hàng uy tín',
      rate: 'Hoàn đến 10.5%',
      color: 'text-orange-700 bg-orange-50 border-orange-200'
    }
  ];

  // Authentic Deals
  const deals = [
    {
      id: 1,
      title: 'Điện thoại HONOR X9b 5G (12GB/256GB) Chống rơi vỡ toàn diện',
      store: 'HONOR Official Store',
      image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500&auto=format&fit=crop&q=80',
      price: 6890000,
      originalPrice: 8990000,
      cashback: 116890,
      sampleUrl: 'https://shopee.vn/HONOR-X9b-5G-12GB-256GB-Chong-Roi-Vo-Toan-Dien-i.1234567.8901234'
    },
    {
      id: 2,
      title: 'Tai nghe chụp tai Soundcore Space One chống ồn chủ động Hi-Res',
      store: 'Anker Soundcore Mall',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80',
      price: 1690000,
      originalPrice: 2190000,
      cashback: 135200,
      sampleUrl: 'https://shopee.vn/Tai-Nghe-Soundcore-Space-One-Chong-On-i.2345678.9012345'
    },
    {
      id: 3,
      title: 'Kem chống nắng kiểm soát dầu La Roche-Posay Anthelios XL 50ml',
      store: 'La Roche-Posay Mall',
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&auto=format&fit=crop&q=80',
      price: 445000,
      originalPrice: 535000,
      cashback: 35600,
      sampleUrl: 'https://shopee.vn/Kem-Chong-Nang-La-Roche-Posay-50ml-i.3456789.0123456'
    },
    {
      id: 4,
      title: 'Nồi chiên không dầu điện tử Philips 4.1L HD9200/90 tiện dụng',
      store: 'Philips Home Mall',
      image: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=500&auto=format&fit=crop&q=80',
      price: 1490000,
      originalPrice: 2290000,
      cashback: 74500,
      sampleUrl: 'https://shopee.vn/Noi-Chien-Khong-Dau-Philips-HD9200-i.4567890.1234567'
    },
    {
      id: 5,
      title: 'Áo Polo nam công sở Coolmate Cotton Compact thoáng khí',
      store: 'Coolmate Official Mall',
      image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500&auto=format&fit=crop&q=80',
      price: 199000,
      originalPrice: 289000,
      cashback: 19900,
      sampleUrl: 'https://shopee.vn/Ao-Polo-Nam-Coolmate-Cotton-Compact-i.5678901.2345678'
    },
    {
      id: 6,
      title: 'Chuột không dây công thái học Logitech Lift Vertical Ergonomic',
      store: 'Logitech Official Store',
      image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&auto=format&fit=crop&q=80',
      price: 1290000,
      originalPrice: 1590000,
      cashback: 38700,
      sampleUrl: 'https://shopee.vn/Chuot-Logitech-Lift-Vertical-i.6789012.3456789'
    }
  ];

  // Calculation logic
  const selectedCat = categoryRates.find((c) => c.id === calcCategory) || categoryRates[0];
  const estMin = Math.round((calcAmount * selectedCat.minRate) / 100);
  const estMax = Math.round((calcAmount * selectedCat.maxRate) / 100);

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
        body: JSON.stringify({ url: targetUrl.trim() })
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
      {/* 1. HERO CONVERTER SECTION */}
      <section className="bg-white border-b border-gray-200 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-6 space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <span>Nền tảng hoàn tiền tiếp thị liên kết</span>
              <span className="text-gray-300">•</span>
              <span className="text-gray-700">Shopee Affiliate Partner</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
              Nhận hoàn tiền cho mọi đơn hàng Shopee
            </h1>

            <p className="text-sm text-gray-600 max-w-2xl leading-relaxed">
              Dán liên kết sản phẩm cần mua vào công cụ bên dưới để tạo mã theo dõi hoàn tiền. Tiền hoàn được chi trả trực tiếp về tài khoản ngân hàng trong vòng 3 ngày làm việc.
            </p>
          </div>

          {/* Link Converter Tool Box */}
          <div className="bg-white rounded-lg border border-gray-300 p-5 shadow-xs">
            <form onSubmit={handleConvert} className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <label htmlFor="shopee-link-input" className="font-semibold text-gray-800">
                  Đường dẫn sản phẩm Shopee:
                </label>
                {!user && (
                  <button
                    type="button"
                    onClick={() => onOpenAuth('login')}
                    className="text-orange-600 hover:underline font-medium"
                  >
                    Đăng nhập để ghi nhận tiền hoàn vào ví
                  </button>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <input
                    id="shopee-link-input"
                    type="text"
                    placeholder="Dán link sản phẩm (ví dụ: https://shopee.vn/... hoặc https://s.shopee.vn/...)"
                    value={inputUrl}
                    onChange={(e) => {
                      setInputUrl(e.target.value);
                      setError('');
                    }}
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-white text-gray-900 placeholder:text-gray-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-md text-sm font-semibold transition-colors shrink-0 shadow-xs cursor-pointer"
                >
                  {loading ? 'Đang kiểm tra...' : 'Lấy link hoàn tiền'}
                </button>
              </div>

              {/* Sample link triggers */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs text-gray-500">
                <span className="font-medium text-gray-600">Thử nhanh mẫu:</span>
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
                    className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded border border-gray-200 transition-colors"
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {error && (
                <div className="flex items-center gap-2 p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </form>

            {/* CONVERSION RESULT CARD */}
            {convertedResult && (
              <div
                id="result-section"
                className="mt-5 pt-5 border-t border-gray-200 space-y-4 animate-in fade-in duration-150"
              >
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  {/* Thumbnail */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-md overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                    <img
                      src={convertedResult.product_image || 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&auto=format&fit=crop&q=80'}
                      alt={convertedResult.product_title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop&q=80';
                      }}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Sản phẩm áp dụng hoàn tiền</span>
                    </div>

                    <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">
                      {convertedResult.product_title || 'Sản phẩm Shopee hợp lệ'}
                    </h3>

                    {/* Rates Grid */}
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="p-2.5 rounded-md bg-gray-50 border border-gray-200">
                        <div className="text-[10px] text-gray-500 uppercase font-semibold">Giá bán hiện tại</div>
                        <div className="text-sm font-bold text-gray-800">
                          {convertedResult.product_price && convertedResult.product_price > 0
                            ? formatVND(convertedResult.product_price)
                            : 'Theo hóa đơn Shopee'}
                        </div>
                      </div>

                      <div className="p-2.5 rounded-md bg-orange-50 border border-orange-200">
                        <div className="text-[10px] text-orange-800 uppercase font-semibold">Tiền hoàn dự kiến</div>
                        <div className="text-sm sm:text-base font-bold text-orange-600">
                          {formatVND(convertedResult.estimated_cashback || 116890)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Important Notice */}
                <div className="p-3 bg-gray-50 rounded-md border border-gray-200 text-xs text-gray-600 space-y-1">
                  <div className="font-semibold text-gray-800">Điều kiện ghi nhận:</div>
                  <p className="leading-relaxed">
                    Mức tiền hoàn tạm tính được ước tính dựa trên ngành hàng và giá niêm yết. Số tiền thực nhận sẽ được đối soát theo giá trị thanh toán thực tế sau khi áp dụng voucher của Shop và Shopee. Đơn hàng hủy hoặc trả hàng sẽ không đủ điều kiện hoàn tiền.
                  </p>
                </div>

                {/* Short link */}
                <div className="space-y-1 text-xs">
                  <span className="font-semibold text-gray-700">Liên kết mua hàng có gắn mã theo dõi (Sub ID):</span>
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md border border-gray-200">
                    <div className="flex-1 font-mono text-xs text-gray-700 truncate select-all">
                      {convertedResult.localRedirectUrl || convertedResult.affiliate_url}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => setShowQrModal(true)}
                        className="px-2 py-1 bg-white hover:bg-gray-100 border border-gray-200 rounded text-gray-700 font-medium text-xs cursor-pointer"
                      >
                        Mã QR
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopy(convertedResult.localRedirectUrl || convertedResult.affiliate_url)}
                        className="px-2.5 py-1 bg-white hover:bg-gray-100 border border-gray-200 rounded text-gray-700 font-medium text-xs cursor-pointer"
                      >
                        {copied ? 'Đã chép' : 'Sao chép'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Big CTA */}
                <a
                  href={convertedResult.affiliate_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-md text-sm font-semibold text-center flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Chuyển đến Shopee mua hàng</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. STATS BAR */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5 shadow-xs grid grid-cols-2 md:grid-cols-4 gap-4 text-center divide-y md:divide-y-0 md:divide-x divide-gray-100">
          <div className="space-y-0.5">
            <div className="text-xl font-bold text-gray-900">500.000+</div>
            <div className="text-xs text-gray-500">Đơn hàng đã hoàn tiền</div>
          </div>
          <div className="space-y-0.5 pt-2 md:pt-0">
            <div className="text-xl font-bold text-orange-600">10.5%</div>
            <div className="text-xs text-gray-500">Mức hoàn cao nhất</div>
          </div>
          <div className="space-y-0.5 pt-2 md:pt-0">
            <div className="text-xl font-bold text-gray-900">3 Ngày</div>
            <div className="text-xs text-gray-500">Thời gian xử lý rút tiền</div>
          </div>
          <div className="space-y-0.5 pt-2 md:pt-0">
            <div className="text-xl font-bold text-emerald-700">100%</div>
            <div className="text-xs text-gray-500">Miễn phí dịch vụ</div>
          </div>
        </div>
      </section>

      {/* 3. MERCHANT PARTNERS */}
      <section id="popular-stores" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
            Thương hiệu & Ngành hàng đối tác
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Tỷ lệ hoàn tiền áp dụng cho các gian hàng chính thức trên Shopee Việt Nam
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {merchants.map((m) => (
            <div
              key={m.id}
              onClick={() => {
                const el = document.getElementById('shopee-link-input');
                if (el) {
                  el.focus();
                  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }}
              className="bg-white rounded-lg border border-gray-200 p-3.5 hover:border-gray-300 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded border ${m.color} mb-2`}>
                  {m.rate}
                </span>
                <h3 className="font-semibold text-gray-900 text-xs sm:text-sm">{m.name}</h3>
                <p className="text-gray-500 text-xs mt-0.5">{m.desc}</p>
              </div>
              <div className="mt-3 pt-2 border-t border-gray-100 text-[11px] font-medium text-orange-600 flex items-center gap-1">
                <span>Dán link</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. FEATURED DEALS */}
      <section id="hot-deals" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
            Ưu đãi hoàn tiền hôm nay
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Các sản phẩm có mức hoàn tiền cao được người dùng quan tâm
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {deals.map((deal) => (
            <div
              key={deal.id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-gray-300 hover:shadow-xs transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative h-44 bg-gray-100 overflow-hidden border-b border-gray-100">
                  <img
                    src={deal.image}
                    alt={deal.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-gray-900/80 text-white text-[10px] font-medium px-2 py-0.5 rounded">
                    {deal.store}
                  </div>
                  <div className="absolute top-2 right-2 bg-orange-600 text-white text-[11px] font-semibold px-2 py-0.5 rounded">
                    Hoàn {formatVND(deal.cashback)}
                  </div>
                </div>

                <div className="p-3.5 space-y-1.5">
                  <h3 className="font-semibold text-gray-900 text-xs sm:text-sm line-clamp-2 leading-snug">
                    {deal.title}
                  </h3>

                  <div className="flex items-baseline gap-2 pt-1">
                    <span className="text-sm font-bold text-gray-900">{formatVND(deal.price)}</span>
                    <span className="text-xs text-gray-400 line-through">{formatVND(deal.originalPrice)}</span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 pt-0">
                <button
                  type="button"
                  onClick={() => handleApplySample(deal.sampleUrl)}
                  className="w-full py-2 bg-gray-50 hover:bg-orange-50 hover:text-orange-600 text-gray-700 border border-gray-200 rounded text-xs font-semibold transition-colors cursor-pointer"
                >
                  Nhận liên kết hoàn tiền
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. RATE TABLE & CALCULATOR */}
      <section id="rates-table" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Table (7 Cols) */}
          <div className="lg:col-span-7 space-y-3">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
                Biểu phí hoàn tiền chi tiết
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Áp dụng theo khung chính sách Shopee Affiliate Program Việt Nam
              </p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold">
                      <th className="py-2.5 px-3">Danh mục sản phẩm</th>
                      <th className="py-2.5 px-3 text-right">Khách cũ</th>
                      <th className="py-2.5 px-3 text-right">Khách mới</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {categoryRates.map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50/50">
                        <td className="py-2.5 px-3">
                          <div className="font-medium text-gray-900">{c.name}</div>
                          <div className="text-[11px] text-gray-400">{c.note}</div>
                        </td>
                        <td className="py-2.5 px-3 text-right font-semibold text-gray-800">
                          {c.oldCustomerRate}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-orange-600">
                          {c.newCustomerRate}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Calculator (5 Cols) */}
          <div className="lg:col-span-5 space-y-3">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
                Ước tính tiền hoàn
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Tính nhanh số tiền nhận về theo ngân sách dự kiến
              </p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-xs space-y-4">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between font-medium">
                  <span className="text-gray-600">Giá trị đơn hàng:</span>
                  <span className="font-bold text-gray-900">{formatVND(calcAmount)}</span>
                </div>

                <div className="grid grid-cols-4 gap-1.5">
                  {[200000, 500000, 1000000, 2000000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setCalcAmount(amt)}
                      className={`py-1.5 text-xs font-medium rounded border transition-colors cursor-pointer ${
                        calcAmount === amt
                          ? 'bg-orange-600 text-white border-orange-600'
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                      }`}
                    >
                      {amt >= 1000000 ? `${amt / 1000000}Tr` : `${amt / 1000}K`}
                    </button>
                  ))}
                </div>

                <div className="pt-1">
                  <label className="block text-gray-600 font-medium mb-1">Ngành hàng:</label>
                  <select
                    value={calcCategory}
                    onChange={(e) => setCalcCategory(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-orange-500"
                  >
                    <option value="fashion">Thời trang, Giày dép (8.0% - 10.5%)</option>
                    <option value="beauty">Sức khỏe & Sắc đẹp (6.0% - 7.5%)</option>
                    <option value="home">Nhà cửa & Đời sống (5.0% - 6.5%)</option>
                    <option value="baby">Mẹ & Bé, Bách Hóa (4.0% - 5.5%)</option>
                    <option value="electronics">Điện tử, Thiết bị số (1.5% - 3.0%)</option>
                    <option value="new_user">Khách mới Shopee (Lên đến 12.0%)</option>
                  </select>
                </div>
              </div>

              {/* Estimation result */}
              <div className="p-3 bg-orange-50/80 rounded border border-orange-200 text-xs">
                <div className="text-gray-600">Tiền hoàn dự kiến nhận về ví:</div>
                <div className="text-xl font-bold text-orange-600 mt-0.5">
                  {formatVND(estMin)} - {formatVND(estMax)}
                </div>
                <div className="text-[11px] text-gray-500 mt-1">
                  Rút về tài khoản ngân hàng sau khi đơn hoàn tất
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
                className="w-full py-2 bg-gray-900 hover:bg-black text-white text-xs font-semibold rounded cursor-pointer transition-colors"
              >
                Dán link mua sắm ngay
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. HOW IT WORKS (3 SIMPLE STEPS) */}
      <section id="how-it-works" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-4 text-center sm:text-left">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
            Quy trình hoàn tiền 3 bước
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Đơn giản, minh bạch và hoàn toàn miễn phí
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-lg border border-gray-200 space-y-2">
            <div className="w-8 h-8 rounded bg-gray-100 text-gray-800 font-bold text-xs flex items-center justify-center">
              1
            </div>
            <h4 className="font-semibold text-gray-900 text-sm">Sao chép liên kết sản phẩm</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Mở ứng dụng Shopee, chọn sản phẩm cần mua và sao chép đường dẫn (link chia sẻ).
            </p>
          </div>

          <div className="bg-white p-5 rounded-lg border border-gray-200 space-y-2">
            <div className="w-8 h-8 rounded bg-gray-100 text-gray-800 font-bold text-xs flex items-center justify-center">
              2
            </div>
            <h4 className="font-semibold text-gray-900 text-sm">Tạo link hoàn tiền</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Dán link vào Box Hoàn Tiền để tạo đường dẫn chuyển hướng có gắn mã định danh Sub ID.
            </p>
          </div>

          <div className="bg-white p-5 rounded-lg border border-gray-200 space-y-2">
            <div className="w-8 h-8 rounded bg-gray-100 text-gray-800 font-bold text-xs flex items-center justify-center">
              3
            </div>
            <h4 className="font-semibold text-gray-900 text-sm">Nhận tiền hoàn về ngân hàng</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Sau khi đơn hàng giao thành công và hết hạn đổi trả, tiền hoàn được cộng vào ví và có thể rút về tài khoản ngân hàng trong 3 ngày.
            </p>
          </div>
        </div>
      </section>

      {/* 7. FAQ */}
      <section id="faq" className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-4 text-center">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
            Câu hỏi thường gặp
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Thông tin chi tiết về chính sách ghi nhận và chi trả
          </p>
        </div>

        <div className="space-y-2.5">
          {[
            {
              q: 'Đơn hàng được ghi nhận hoàn tiền như thế nào?',
              a: 'Hệ thống sử dụng cơ chế tiếp thị liên kết Shopee Affiliate. Khi bạn bấm vào liên kết đã chuyển đổi hoặc quét mã QR từ website, một mã theo dõi duy nhất sẽ được kích hoạt để đối soát đơn hàng khi thanh toán thành công.'
            },
            {
              q: 'Khi nào số dư tiền hoàn có thể rút về tài khoản ngân hàng?',
              a: 'Sau khi bạn nhận hàng thành công và kết thúc thời gian đổi trả theo quy định của Shopee (thường từ 7 đến 15 ngày), tiền hoàn sẽ chuyển từ trạng thái Chờ duyệt sang Khả dụng.'
            },
            {
              q: 'Hạn mức rút tiền tối thiểu và thời gian xử lý lệnh rút?',
              a: 'Số dư khả dụng tối thiểu để tạo lệnh rút tiền là 50.000 đ. Ban quản trị sẽ xử lý chuyển khoản trực tiếp về tài khoản ngân hàng của bạn trong vòng tối đa 3 ngày làm việc (không tính Thứ Bảy, Chủ Nhật và ngày lễ).'
            },
            {
              q: 'Những trường hợp nào đơn hàng không đủ điều kiện nhận hoàn tiền?',
              a: 'Đơn hàng bị hủy, hoàn trả, phát sinh khiếu nại, vi phạm chính sách của Shopee hoặc khách hàng bấm vào liên kết quảng cáo khác trước khi hoàn tất đặt hàng.'
            }
          ].map((item, idx) => (
            <div key={idx} className="bg-white rounded-lg border border-gray-200 overflow-hidden text-xs">
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between p-3.5 text-left font-semibold text-gray-800 hover:text-orange-600 transition-colors cursor-pointer"
              >
                <span>{item.q}</span>
                {openFaq === idx ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
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
