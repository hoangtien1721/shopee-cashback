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
  Percent,
  Wallet,
  Search,
  Crown,
  Flame,
  Tag,
  Star,
  Smartphone,
  Shield,
  Users,
  ArrowUpRight
} from 'lucide-react';

export default function HomePage({ onOpenAuth, onNavigate }) {
  const { user } = useAuth();

  // Link conversion state
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

  // Cashback category rates data (Standard ShopBack / Shopee Affiliate)
  const categoryRates = [
    {
      id: 'fashion',
      name: 'Thời trang Nữ, Nam, Giày dép & Phụ kiện',
      minRate: 8.0,
      maxRate: 10.5,
      rateDisplay: '8,0% - 10,5%',
      isEligible: true,
      note: 'Áp dụng mọi Shop Mall, Shopee Yêu thích'
    },
    {
      id: 'beauty',
      name: 'Sức khỏe & Sắc đẹp (Mỹ phẩm, Skincare)',
      minRate: 6.0,
      maxRate: 7.5,
      rateDisplay: '6,0% - 7,5%',
      isEligible: true,
      note: 'Dự kiến hoàn ~18.000đ - 45.000đ/đơn'
    },
    {
      id: 'home',
      name: 'Nhà cửa & Đời sống, Gia dụng tiện ích',
      minRate: 5.0,
      maxRate: 6.5,
      rateDisplay: '5,0% - 6,5%',
      isEligible: true,
      note: 'Dự kiến hoàn ~15.000đ - 50.000đ/đơn'
    },
    {
      id: 'baby',
      name: 'Mẹ & Bé, Bách Hóa Online & Thực phẩm',
      minRate: 4.0,
      maxRate: 5.5,
      rateDisplay: '4,0% - 5,5%',
      isEligible: true,
      note: 'Dự kiến hoàn ~12.000đ - 35.000đ/đơn'
    },
    {
      id: 'electronics',
      name: 'Điện thoại, Laptop & Thiết bị điện tử',
      minRate: 1.5,
      maxRate: 3.0,
      rateDisplay: '1,5% - 3,0%',
      isEligible: true,
      note: 'Giá trị đơn cao, nhận hoàn 30.000đ - 150.000đ'
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
      name: 'Đơn từ Shopee Video / Shopee Live',
      minRate: 0.0,
      maxRate: 1.0,
      rateDisplay: '0% - 1,0%',
      isEligible: false,
      note: 'Tùy thuộc chính sách từng shop và khung giờ live'
    },
    {
      id: 'food',
      name: 'ShopeeFood, e-voucher & nạp thẻ điện thoại',
      minRate: 0,
      maxRate: 0,
      rateDisplay: '0%',
      isEligible: false,
      note: 'Shopee chưa áp dụng hoàn tiền cho danh mục này'
    }
  ];

  // Top Shopee Merchant Channels (ShopBack Top Stores grid)
  const popularMerchants = [
    {
      id: 'shopee-official',
      name: 'Shopee Official Stores',
      category: 'Sàn thương mại điện tử',
      badge: '↑ Hoàn Tiền Đến 10,5%',
      badgeColor: 'bg-purple-100 text-purple-700',
      logo: '🛍️',
      logoBg: 'bg-orange-500',
      verified: true
    },
    {
      id: 'shopee-mall',
      name: 'Shopee Mall Chính Hãng',
      category: 'Chính hãng 100% • 7 ngày đổi trả',
      badge: '↑ Hoàn Tiền Đến 8,0%',
      badgeColor: 'bg-red-100 text-red-700',
      logo: '⭐',
      logoBg: 'bg-red-600',
      verified: true
    },
    {
      id: 'shopee-fashion',
      name: 'Shopee Thời Trang & Giày',
      category: 'Quần áo, Giày dép & Phụ kiện',
      badge: '↑ Hoàn Tiền Đến 10,0%',
      badgeColor: 'bg-pink-100 text-pink-700',
      logo: '👗',
      logoBg: 'bg-pink-500',
      verified: true
    },
    {
      id: 'shopee-beauty',
      name: 'Shopee Sức Khỏe & Làm Đẹp',
      category: 'Mỹ phẩm, Skincare & Nước hoa',
      badge: '↑ Hoàn Tiền Đến 7,5%',
      badgeColor: 'bg-rose-100 text-rose-700',
      logo: '💄',
      logoBg: 'bg-rose-500',
      verified: true
    },
    {
      id: 'shopee-home',
      name: 'Shopee Nhà Cửa & Đời Sống',
      category: 'Gia dụng, Bếp & Nội thất',
      badge: '↑ Hoàn Tiền Đến 6,5%',
      badgeColor: 'bg-amber-100 text-amber-800',
      logo: '🏡',
      logoBg: 'bg-amber-600',
      verified: true
    },
    {
      id: 'shopee-baby',
      name: 'Shopee Mẹ & Bé',
      category: 'Tã bỉm, Sữa bột & Đồ sơ sinh',
      badge: '↑ Hoàn Tiền Đến 5,5%',
      badgeColor: 'bg-sky-100 text-sky-700',
      logo: '🍼',
      logoBg: 'bg-sky-500',
      verified: true
    },
    {
      id: 'shopee-tech',
      name: 'Shopee Điện Tử & Công Nghệ',
      category: 'Điện thoại, Laptop & Phụ kiện số',
      badge: '↑ Hoàn Tiền Đến 3,0%',
      badgeColor: 'bg-blue-100 text-blue-700',
      logo: '📱',
      logoBg: 'bg-blue-600',
      verified: true
    },
    {
      id: 'shopee-mart',
      name: 'Shopee Bách Hóa Online',
      category: 'Thực phẩm, Đồ khô & Đồ uống',
      badge: '↑ Hoàn Tiền Đến 5,0%',
      badgeColor: 'bg-emerald-100 text-emerald-700',
      logo: '🛒',
      logoBg: 'bg-emerald-600',
      verified: true
    }
  ];

  // Authentic Featured Hot Deals with High Cashback
  const featuredDeals = [
    {
      id: 1,
      title: 'Điện Thoại HONOR X9b 5G (12GB/256GB) Chống Rơi Vỡ Toàn Diện',
      store: 'HONOR Official Store',
      image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500&auto=format&fit=crop&q=80',
      price: 6890000,
      originalPrice: 8990000,
      cashback: 116890,
      sampleUrl: 'https://shopee.vn/HONOR-X9b-5G-12GB-256GB-Chong-Roi-Vo-Toan-Dien-i.1234567.8901234'
    },
    {
      id: 2,
      title: 'Tai Nghe Chống Ồn Chủ Động Soundcore Space One Hi-Res Audio',
      store: 'Anker Soundcore Mall',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80',
      price: 1690000,
      originalPrice: 2190000,
      cashback: 135200,
      sampleUrl: 'https://shopee.vn/Tai-Nghe-Soundcore-Space-One-Chong-On-i.2345678.9012345'
    },
    {
      id: 3,
      title: 'Kem Chống Nắng Kiềm Dầu La Roche-Posay Anthelios XL Gel-Crème 50ml',
      store: 'La Roche-Posay Mall',
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&auto=format&fit=crop&q=80',
      price: 445000,
      originalPrice: 535000,
      cashback: 35600,
      sampleUrl: 'https://shopee.vn/Kem-Chong-Nang-La-Roche-Posay-50ml-i.3456789.0123456'
    },
    {
      id: 4,
      title: 'Nồi Chiên Không Dầu Điện Tử Philips 4.1L HD9200/90 Tiện Dụng',
      store: 'Philips Home Mall',
      image: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=500&auto=format&fit=crop&q=80',
      price: 1490000,
      originalPrice: 2290000,
      cashback: 74500,
      sampleUrl: 'https://shopee.vn/Noi-Chien-Khong-Dau-Philips-HD9200-i.4567890.1234567'
    },
    {
      id: 5,
      title: 'Áo Polo Nam Công Sở Coolmate Cotton Compact Thoáng Mát',
      store: 'Coolmate Official Mall',
      image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500&auto=format&fit=crop&q=80',
      price: 199000,
      originalPrice: 289000,
      cashback: 19900,
      sampleUrl: 'https://shopee.vn/Ao-Polo-Nam-Coolmate-Cotton-Compact-i.5678901.2345678'
    },
    {
      id: 6,
      title: 'Chuột Công Thái Học Không Dây Logitech Lift Vertical Ergonomic',
      store: 'Logitech Official Store',
      image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&auto=format&fit=crop&q=80',
      price: 1290000,
      originalPrice: 1590000,
      cashback: 38700,
      sampleUrl: 'https://shopee.vn/Chuot-Logitech-Lift-Vertical-i.6789012.3456789'
    }
  ];

  // Calculate estimated cashback for interactive widget
  const currentCat = categoryRates.find((c) => c.id === calcCategory) || categoryRates[0];
  const minCashback = Math.round((calcAmount * currentCat.minRate) / 100);
  const maxCashback = Math.round((calcAmount * currentCat.maxRate) / 100);

  const handleConvert = async (e, customUrl = null) => {
    if (e) e.preventDefault();
    setError('');

    const targetUrl = customUrl || inputUrl;

    if (!targetUrl || !targetUrl.trim()) {
      setError('Vui lòng dán link sản phẩm Shopee vào ô bên dưới');
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
          document.getElementById('conversion-result-card')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 150);
      }
    } catch (err) {
      setError(err.message || 'Không thể chuyển đổi link. Vui lòng kiểm tra lại đường dẫn');
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
    <div className="space-y-10 pb-16 bg-slate-50 min-h-screen">
      {/* 1. HERO SECTION (AUTHENTIC SHOPBACK VIETNAM STYLE) */}
      <section className="bg-gradient-to-b from-[#FFF5F2] via-white to-slate-50 border-b border-slate-100 pt-8 sm:pt-12 pb-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Main Headline & Intro */}
          <div className="max-w-3xl mb-8 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100/80 text-orange-800 text-xs font-extrabold border border-orange-200">
              <Crown className="w-3.5 h-3.5 text-orange-600" />
              <span>VUA HOÀN TIỀN • ĐỐI TÁC SHOPEE VIỆT NAM</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Cứ mua sắm là được <span className="text-orange-600">Hoàn Tiền</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Bạn đã quen mua sắm online trên Shopee, giờ còn có thể nhận thêm <strong>Hoàn Tiền thật</strong>. Không tích điểm ảo, không vòng vo – Rút trực tiếp về tài khoản ngân hàng của bạn trong <strong>3 ngày làm việc</strong>.
            </p>
          </div>

          {/* Universal Shopee Link Converter Card */}
          <div className="bg-white rounded-3xl shadow-xl shadow-orange-500/5 border border-slate-200/90 p-5 sm:p-7">
            <form onSubmit={handleConvert} className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label htmlFor="shopee-link-input" className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-orange-600" />
                  <span>Dán link sản phẩm Shopee nhận hoàn tiền tự động:</span>
                </label>
                {!user ? (
                  <button
                    type="button"
                    onClick={() => onOpenAuth('login')}
                    className="text-xs text-orange-600 font-bold hover:underline self-start sm:self-auto cursor-pointer"
                  >
                    * Đăng nhập để nhận hoàn tiền vào ví
                  </button>
                ) : (
                  <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Tài khoản đã sẵn sàng nhận tiền hoàn
                  </span>
                )}
              </div>

              {/* Input & Action Button */}
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Search className="w-5 h-5" />
                  </div>
                  <input
                    id="shopee-link-input"
                    type="text"
                    placeholder="Dán link sản phẩm Shopee (VD: https://shopee.vn/... hoặc https://s.shopee.vn/...)"
                    value={inputUrl}
                    onChange={(e) => {
                      setInputUrl(e.target.value);
                      setError('');
                    }}
                    className="w-full pl-10 pr-4 py-3.5 text-sm sm:text-base border-2 border-slate-200 hover:border-slate-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 rounded-2xl transition-all focus:outline-none bg-slate-50/50 focus:bg-white text-slate-800 placeholder:text-slate-400 font-medium"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center gap-2 py-3.5 px-7 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-2xl text-sm sm:text-base font-bold shadow-lg shadow-orange-500/25 transition-all cursor-pointer shrink-0 active:scale-98"
                >
                  {loading ? (
                    <span>Đang kiểm tra đơn...</span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-200" />
                      <span>{user ? 'Lấy Link Hoàn Tiền' : 'Đăng nhập & Nhận hoàn tiền'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {/* Quick sample link chips */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs font-bold text-slate-400">Gợi ý thử nhanh:</span>
                {[
                  { label: '📱 Điện Thoại Honor X9b', url: 'https://shopee.vn/HONOR-X9b-5G-12GB-256GB-Chong-Roi-Vo-Toan-Dien-i.1234567.8901234' },
                  { label: '🎧 Tai Nghe Anker', url: 'https://shopee.vn/Tai-Nghe-Soundcore-Space-One-Chong-On-i.2345678.9012345' },
                  { label: '☀️ Kem Chống Nắng', url: 'https://shopee.vn/Kem-Chong-Nang-La-Roche-Posay-50ml-i.3456789.0123456' },
                  { label: '👕 Áo Polo Coolmate', url: 'https://shopee.vn/Ao-Polo-Nam-Coolmate-Cotton-Compact-i.5678901.2345678' }
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplySample(chip.url)}
                    className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-orange-50 hover:text-orange-600 text-slate-600 transition-colors cursor-pointer border border-slate-200/60"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </form>

            {/* CONVERSION RESULT CARD (EXACT VUA HOÀN TIỀN SPEC) */}
            {convertedResult && (
              <div
                id="conversion-result-card"
                className="mt-6 p-5 sm:p-6 bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 space-y-4"
              >
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

                    {/* Two Metric Boxes: Giá bán hiện tại & Tiền hoàn dự kiến */}
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

                {/* Important Notes Box */}
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
                  className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl text-base font-black shadow-lg shadow-orange-500/25 transition-all text-center cursor-pointer"
                >
                  <ExternalLink className="w-5 h-5" />
                  <span>Mở Mua Hàng Nhận Hoàn Tiền</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. FLOATING STATS BAR (SHOPBACK CREDIBILITY BAR) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-5 relative z-10">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 sm:p-6 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="space-y-1">
            <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">500.000+</div>
            <div className="text-xs text-slate-500 font-medium">Đơn hàng Shopee đã hoàn tiền</div>
          </div>

          <div className="space-y-1">
            <div className="text-xl sm:text-2xl font-black text-purple-700 tracking-tight">10,5%</div>
            <div className="text-xs text-slate-500 font-medium">Mức hoàn tiền cao nhất thị trường</div>
          </div>

          <div className="space-y-1">
            <div className="text-xl sm:text-2xl font-black text-emerald-600 tracking-tight">3 Ngày</div>
            <div className="text-xs text-slate-500 font-medium">Cam kết chi trả về STK ngân hàng</div>
          </div>

          <div className="space-y-1">
            <div className="text-xl sm:text-2xl font-black text-blue-600 tracking-tight">100%</div>
            <div className="text-xs text-slate-500 font-medium">Hoàn tiền thật, miễn phí trọn đời</div>
          </div>
        </div>
      </section>

      {/* 3. THƯƠNG HIỆU NỔI BẬT & ĐỐI TÁC (SHOPBACK POPULAR MERCHANTS) */}
      <section id="popular-stores" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-2">
          <div>
            <div className="text-xs uppercase font-extrabold text-orange-600 tracking-wider">Đối tác chính thức</div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
              Thương Hiệu Nổi Bật Shopee
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Chọn ngành hàng và dán link để nhận tỷ lệ hoàn cao nhất
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {popularMerchants.map((merchant) => (
            <div
              key={merchant.id}
              onClick={() => {
                const el = document.getElementById('shopee-link-input');
                if (el) {
                  el.focus();
                  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-orange-300 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-12 h-12 rounded-xl ${merchant.logoBg} text-white flex items-center justify-center text-xl shadow-xs`}>
                    {merchant.logo}
                  </div>
                  <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full ${merchant.badgeColor}`}>
                    {merchant.badge}
                  </span>
                </div>

                <h3 className="font-extrabold text-slate-900 text-sm group-hover:text-orange-600 transition-colors flex items-center gap-1.5">
                  <span>{merchant.name}</span>
                  {merchant.verified && (
                    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 text-[10px]" title="Xác thực">
                      ✓
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-500 mt-1">{merchant.category}</p>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700 group-hover:text-orange-600">
                <span>Dán link nhận hoàn tiền</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. HOT DEALS HOÀN TIỀN CAO (FEATURED PRODUCTS & DEALS) */}
      <section id="hot-deals" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-orange-600 text-white flex items-center justify-center font-black">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Ưu Đãi & Deal Hoàn Tiền Cực Hot
              </h2>
              <p className="text-xs text-slate-500">Các sản phẩm bán chạy có mức hoàn tiền cao nhất trong ngày</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {featuredDeals.map((deal) => (
            <div
              key={deal.id}
              className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-lg hover:border-orange-300 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Product Image & Badge */}
                <div className="relative h-48 bg-slate-100 overflow-hidden">
                  <img
                    src={deal.image}
                    alt={deal.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 bg-orange-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs">
                    Shopee Mall
                  </div>
                  <div className="absolute top-3 right-3 bg-amber-500 text-slate-900 text-xs font-black px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-slate-900" />
                    <span>+ Hoàn {formatVND(deal.cashback)}</span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 space-y-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{deal.store}</div>
                  <h3 className="font-extrabold text-slate-900 text-sm leading-snug line-clamp-2 group-hover:text-orange-600 transition-colors">
                    {deal.title}
                  </h3>

                  <div className="flex items-baseline gap-2 pt-1">
                    <span className="text-base font-black text-slate-900">{formatVND(deal.price)}</span>
                    <span className="text-xs text-slate-400 line-through">{formatVND(deal.originalPrice)}</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-4 pt-0">
                <button
                  type="button"
                  onClick={() => handleApplySample(deal.sampleUrl)}
                  className="w-full py-2.5 px-4 bg-orange-50 hover:bg-orange-600 text-orange-700 hover:text-white rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Mua & Nhận Hoàn Tiền Ngay</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. SHOPBACK DUAL VALUE PROPOSITIONS (PASTEL BANNERS) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Box 1: Ice Blue */}
          <div className="bg-[#E6F8FE] rounded-3xl p-7 flex flex-col justify-between border border-sky-200/60">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-sky-500 text-white flex items-center justify-center shadow-md shadow-sky-500/20">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                Mua sắm Shopee nhận Hoàn Tiền thật
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Không cần tích điểm đổi quà phức tạp, không phí thường niên. Tiền hoàn được cộng trực tiếp vào ví sau khi đơn hàng hoàn tất và rút thẳng về tài khoản ngân hàng của bạn trong 3 ngày làm việc.
              </p>
            </div>

            <div className="pt-6">
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('shopee-link-input');
                  if (el) {
                    el.focus();
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }
                }}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-full text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <span>Dán link mua sắm ngay</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Box 2: Mint Green */}
          <div className="bg-[#EAFBF1] rounded-3xl p-7 flex flex-col justify-between border border-emerald-200/60">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
                <Gift className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                Mời bạn mới, nhận ngay 30.000đ
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Chia sẻ liên kết giới thiệu của bạn cho bạn bè, người thân. Khi người được mời tạo tài khoản và hoàn tất đơn hàng Shopee đầu tiên, bạn sẽ nhận ngay 30.000đ vào số dư tài khoản.
              </p>
            </div>

            <div className="pt-6">
              <button
                type="button"
                onClick={() => {
                  if (!user) onOpenAuth('login');
                  else onNavigate('dashboard');
                }}
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-full text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <span>{user ? 'Lấy mã giới thiệu' : 'Đăng ký để nhận link mời'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. MAIN 2-COLUMN SECTION: RATES TABLE & ESTIMATION CALCULATOR */}
      <section id="calculator" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT: CASHBACK RATES TABLE (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-extrabold mb-3">
                <Percent className="w-3.5 h-3.5" />
                <span>Mức Hoàn Tiền Chi Tiết</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
                Hoàn tiền lên đến 10,5%
              </h2>

              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-6">
                Mức tiền hoàn thực tế được tính dựa trên số tiền thực bạn thanh toán cho Shopee (sau khi đã trừ voucher giảm giá của shop, voucher Shopee và Shopee Xu).
              </p>

              {/* Category rates table */}
              <div className="divide-y divide-slate-100">
                {categoryRates.map((item) => (
                  <div key={item.id} className="py-3 flex items-start justify-between gap-4">
                    <div className="space-y-0.5">
                      <div className="text-xs sm:text-sm font-bold text-slate-800">{item.name}</div>
                      <div className="text-[11px] text-slate-400">{item.note}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className={`text-xs sm:text-sm font-black ${item.isEligible ? 'text-purple-700' : 'text-slate-400'}`}>
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

            {/* INTERACTIVE CASHBACK CALCULATOR */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-orange-600 mb-2">
                <Calculator className="w-4 h-4" />
                <span>Ước Tính Tiền Hoàn Thực Tế Theo Đơn Hàng</span>
              </div>

              <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-4">
                Bạn sẽ nhận lại bao nhiêu tiền?
              </h3>

              {/* Pick Amount */}
              <div className="space-y-3 bg-slate-50 rounded-2xl p-4 border border-slate-200/70">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span>Giá trị đơn hàng dự kiến:</span>
                  <span className="text-base font-black text-orange-600">{formatVND(calcAmount)}</span>
                </div>

                {/* Preset Amount Buttons */}
                <div className="grid grid-cols-4 gap-1.5">
                  {[200000, 500000, 1000000, 2000000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setCalcAmount(amt)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        calcAmount === amt
                          ? 'bg-orange-600 text-white shadow-xs'
                          : 'bg-white hover:bg-slate-200/70 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {amt >= 1000000 ? `${amt / 1000000} Triệu` : `${amt / 1000}K`}
                    </button>
                  ))}
                </div>

                {/* Select Category */}
                <div className="pt-2">
                  <label className="block text-xs text-slate-600 font-bold mb-1.5">
                    Chọn ngành hàng sản phẩm:
                  </label>
                  <select
                    value={calcCategory}
                    onChange={(e) => setCalcCategory(e.target.value)}
                    className="w-full bg-white text-slate-900 font-bold text-xs sm:text-sm rounded-xl px-3 py-2.5 border border-slate-200 focus:outline-none focus:border-orange-500"
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
              <div className="mt-5 p-4 rounded-2xl bg-orange-50/80 border border-orange-200/80 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500 font-semibold">Mức tiền hoàn dự kiến nhận về ví:</div>
                  <div className="text-2xl sm:text-3xl font-black text-orange-600 mt-0.5">
                    {formatVND(minCashback)} - {formatVND(maxCashback)}
                  </div>
                  <div className="text-[11px] text-emerald-700 font-bold mt-0.5">
                    ✓ Rút trực tiếp về STK ngân hàng trong 3 ngày làm việc
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
                  className="shrink-0 px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-transform hover:scale-102 cursor-pointer shadow-sm"
                >
                  Dán link ngay
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: BUYER TIPS, TIMELINE & TERMS (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Mẹo Hoàn Tiền Tránh Mất Đơn */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-base font-black text-slate-900">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                <span>Mẹo Hoàn Tiền Tránh Mất Đơn</span>
              </div>

              <div className="space-y-3 text-xs leading-relaxed text-slate-600">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-800">Làm trống giỏ hàng trước khi nhấn link:</strong> Hãy chuyển các món cũ sang mục "Mua sau", sau đó bấm link Vua Hoàn Tiền và mới thêm vào giỏ.
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
                    <strong className="text-slate-800">Không bấm link quảng cáo khác:</strong> Tránh click banner Facebook, tin nhắn group Zalo săn sale giữa chừng vì sẽ làm mất tracking đơn hàng.
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline Thời Gian Hoàn Tiền */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
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
                    <div className="text-xs font-bold text-slate-900">Mua sắm qua link Vua Hoàn Tiền</div>
                    <div className="text-[11px] text-slate-400">Ngay khi bạn bấm link chuyển hướng hoặc quét QR</div>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 relative">
                  <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-xs">
                    2
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Ghi nhận tạm tính vào ví</div>
                    <div className="text-[11px] text-slate-400">Sau 2 - 3 ngày làm việc kể từ lúc đặt hàng thành công</div>
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

            {/* Điều Khoản & Điều Kiện Accordion */}
            <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
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
                <div className="p-5 pt-0 text-xs text-slate-500 space-y-2 border-t border-slate-100 leading-relaxed">
                  <p>• <strong>Điều kiện hủy đơn:</strong> Đơn hàng bị hủy, trả hàng hoặc khiếu nại hoàn tiền trên Shopee sẽ không được tính tiền hoàn.</p>
                  <p>• <strong>Hạn mức rút tiền:</strong> Số dư khả dụng đạt tối thiểu <strong>50.000 VNĐ</strong> có thể gửi yêu cầu rút tiền về STK ngân hàng bất kỳ lúc nào.</p>
                  <p>• <strong>Cam kết thời gian chi trả:</strong> Trong vòng tối đa 3 ngày làm việc (không tính thứ Bảy, Chủ Nhật và ngày lễ) qua chuyển khoản ngân hàng 24/7.</p>
                  <p>• <strong>Quy định gian lận:</strong> Nghiêm cấm các hành vi tự click gian lận, dùng bot hoặc cố tình vi phạm chính sách của Shopee Affiliate.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 7. STEP-BY-STEP HOW IT WORKS (SHOPBACK MINIMALIST 3 STEPS) */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs uppercase font-extrabold text-orange-600 tracking-wider">Cách hoạt động</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            Quy Trình Hoàn Tiền 3 Bước Đơn Giản
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Không cần thẻ tín dụng, không mất phí – tiền hoàn chuyển khoản trực tiếp về ngân hàng
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs relative">
            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center font-black text-lg mb-4">
              1
            </div>
            <h4 className="font-extrabold text-slate-900 mb-2 text-base">Tìm sản phẩm & Dán link</h4>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Mở ứng dụng Shopee, chọn sản phẩm bạn muốn mua, nhấn nút "Chia sẻ" để sao chép liên kết rồi dán vào Vua Hoàn Tiền.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs relative">
            <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center font-black text-lg mb-4">
              2
            </div>
            <h4 className="font-extrabold text-slate-900 mb-2 text-base">Mua sắm trên Shopee như mọi khi</h4>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Hệ thống tự động gắn mã tracking độc quyền. Bạn chỉ cần bấm mở Shopee hoặc quét mã QR và hoàn tất đặt hàng trong 30 phút.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs relative">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center font-black text-lg mb-4">
              3
            </div>
            <h4 className="font-extrabold text-slate-900 mb-2 text-base">Nhận tiền hoàn thật về ngân hàng</h4>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Khi giao hàng thành công, tiền hoàn được cộng vào số dư ví. Tạo lệnh rút tiền và nhận tiền về tài khoản ngân hàng trong 3 ngày làm việc.
            </p>
          </div>
        </div>
      </section>

      {/* 8. FAQ ACCORDION */}
      <section id="faq" className="max-w-3xl mx-auto px-4 sm:px-6 pt-8">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-black text-slate-900">Câu Hỏi Thường Gặp</h3>
          <p className="text-xs text-slate-500 mt-1">Giải đáp các thắc mắc về chính sách hoàn tiền và chi trả</p>
        </div>

        <div className="space-y-3">
          {[
            {
              q: 'Làm thế nào để chắc chắn đơn hàng được ghi nhận hoàn tiền?',
              a: 'Sau khi dán link và lấy link affiliate từ Vua Hoàn Tiền, bạn hãy bấm trực tiếp vào link hoặc quét mã QR để mở Shopee và đặt hàng ngay. Không bấm vào các link từ nhóm săn sale, link Facebook hoặc affiliate khác trước khi đặt hàng.'
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
            <div key={idx} className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between p-4 text-left font-bold text-sm text-slate-800 hover:text-orange-600 transition-colors cursor-pointer"
              >
                <span>{faq.q}</span>
                {openFaq === idx ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>
              {openFaq === idx && (
                <div className="px-4 pb-4 text-xs text-slate-500 leading-relaxed border-t border-slate-100 pt-2">
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
