import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest, formatVND, formatDate, VIETNAM_BANKS } from '../services/api';
import QRModal from '../components/QRModal';
import {
  Wallet,
  Clock,
  CheckCircle2,
  ArrowDownCircle,
  Link as LinkIcon,
  ShoppingBag,
  ExternalLink,
  Copy,
  Check,
  QrCode,
  CreditCard,
  Edit3,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

export default function DashboardPage({ onNavigate }) {
  const { user, refreshUser, updateProfile } = useAuth();

  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [links, setLinks] = useState([]);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'links' | 'bank'
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  // Bank edit state
  const [isEditingBank, setIsEditingBank] = useState(false);
  const [bankName, setBankName] = useState(user?.bank_name || 'Vietcombank');
  const [bankAccNum, setBankAccNum] = useState(user?.bank_account_number || '');
  const [bankAccName, setBankAccName] = useState(user?.bank_account_name || '');
  const [bankSaveMsg, setBankSaveMsg] = useState('');

  // Selected link for QR
  const [selectedQrLink, setSelectedQrLink] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, ordersRes, linksRes] = await Promise.all([
        apiRequest('/orders/stats'),
        apiRequest('/orders'),
        apiRequest('/links')
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (ordersRes.success) setOrders(ordersRes.orders);
      if (linksRes.success) setLinks(linksRes.links);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveBank = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({
        bank_name: bankName,
        bank_account_number: bankAccNum,
        bank_account_name: bankAccName.toUpperCase()
      });
      setIsEditingBank(false);
      setBankSaveMsg('Cập nhật tài khoản ngân hàng thành công!');
      setTimeout(() => setBankSaveMsg(''), 3000);
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Ví Hoàn Tiền Của Tôi
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Theo dõi số dư, tiền hoàn và lịch sử đặt hàng Shopee
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            title="Làm mới dữ liệu"
            className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl shadow-xs transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => onNavigate('withdraw')}
            className="flex items-center gap-2 py-2.5 px-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-bold shadow-md shadow-orange-500/20 transition-all cursor-pointer"
          >
            <ArrowDownCircle className="w-4 h-4" />
            <span>Rút tiền (3 ngày)</span>
          </button>
        </div>
      </div>

      {/* 1. FINANCIAL SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Available Balance */}
        <div className="bg-linear-to-br from-emerald-500 to-teal-700 text-white p-5 rounded-3xl shadow-lg shadow-emerald-500/15 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-emerald-100 uppercase tracking-wider">Số dư khả dụng</span>
            <div className="p-2 bg-white/15 rounded-xl">
              <Wallet className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono">
            {formatVND(stats?.available_balance ?? user?.available_balance)}
          </div>
          <div className="text-[11px] text-emerald-100 mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Có thể tạo lệnh rút tiền ngay</span>
          </div>
        </div>

        {/* Pending Balance */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Chờ Shopee duyệt</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-800">
            {formatVND(stats?.pending_balance ?? user?.pending_balance)}
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            Đang chờ Shopee đối soát đơn hàng
          </div>
        </div>

        {/* Total Withdrawn */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tổng đã rút</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <ArrowDownCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-800">
            {formatVND(stats?.withdrawn_total ?? user?.withdrawn_total)}
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            Đã nhận về tài khoản ngân hàng
          </div>
        </div>

        {/* Total Earned / Stats */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tổng đơn hoàn tiền</span>
            <div className="p-2 bg-orange-50 text-orange-600 rounded-xl">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-orange-600">
            {stats?.total_orders || 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            Đơn hàng Shopee đã ghi nhận
          </div>
        </div>
      </div>

      {/* 2. BANK ACCOUNT NOTIFICATION / QUICK EDIT */}
      {(!user?.bank_name || !user?.bank_account_number) ? (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <div className="text-xs text-amber-800">
              <strong>Chưa cài đặt thông tin ngân hàng:</strong> Vui lòng cập nhật số tài khoản để nhận tiền hoàn trong 3 ngày làm việc.
            </div>
          </div>
          <button
            onClick={() => setIsEditingBank(true)}
            className="py-1.5 px-3 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl whitespace-nowrap"
          >
            Cài đặt ngay
          </button>
        </div>
      ) : (
        <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div className="text-xs">
              <div className="text-slate-400">Tài khoản nhận tiền hoàn:</div>
              <div className="font-bold text-slate-800 text-sm">
                {user.bank_name} - <span className="font-mono">{user.bank_account_number}</span> ({user.bank_account_name})
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsEditingBank(true)}
            className="flex items-center gap-1 py-1.5 px-3 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Đổi tài khoản</span>
          </button>
        </div>
      )}

      {bankSaveMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl">
          {bankSaveMsg}
        </div>
      )}

      {/* 3. TABS: ORDERS / LINKS */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-100 px-6 pt-4">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 pb-4 px-2 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Đơn hàng hoàn tiền ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('links')}
            className={`flex items-center gap-2 pb-4 px-4 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'links'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <LinkIcon className="w-4 h-4" />
            <span>Link đã chuyển đổi ({links.length})</span>
          </button>
        </div>

        {/* TAB CONTENT: ORDERS */}
        {activeTab === 'orders' && (
          <div className="p-6">
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="text-base font-bold text-slate-700">Chưa có đơn hàng hoàn tiền</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Hãy dán link Shopee ở trang chủ và đặt hàng để hệ thống ghi nhận đơn và cộng tiền hoàn vào ví của bạn.
                </p>
                <button
                  onClick={() => onNavigate('home')}
                  className="mt-4 py-2 px-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  Dán link Shopee ngay
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase font-bold border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4">Mã đơn hàng</th>
                      <th className="py-3 px-4">Sản phẩm</th>
                      <th className="py-3 px-4">Giá trị đơn</th>
                      <th className="py-3 px-4 text-orange-600">Tiền hoàn nhận được</th>
                      <th className="py-3 px-4">Thời gian</th>
                      <th className="py-3 px-4 text-center">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                          #{o.shopee_order_id}
                        </td>
                        <td className="py-3.5 px-4 max-w-xs truncate text-slate-700 font-medium">
                          {o.product_names || 'Đơn hàng Shopee'}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-600">
                          {formatVND(o.order_amount)}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-orange-600 text-sm">
                          +{formatVND(o.user_cashback)}
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                          {formatDate(o.created_at)}
                        </td>
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          {o.status === 'confirmed' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" /> Đã cộng ví
                            </span>
                          ) : o.status === 'pending' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              <Clock className="w-3 h-3" /> Chờ đối soát
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              Đã hủy / Hoàn
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB CONTENT: LINKS */}
        {activeTab === 'links' && (
          <div className="p-6">
            {links.length === 0 ? (
              <div className="text-center py-12">
                <LinkIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="text-base font-bold text-slate-700">Chưa có link nào được chuyển đổi</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Mỗi khi dán link ở trang chủ, link affiliate của bạn sẽ được lưu tại đây để tiện mua lại.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase font-bold border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4">Tên / Link gốc</th>
                      <th className="py-3 px-4">Mã Sub ID</th>
                      <th className="py-3 px-4">Lượt click</th>
                      <th className="py-3 px-4">Ngày tạo</th>
                      <th className="py-3 px-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {links.map((l) => (
                      <tr key={l.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 max-w-sm">
                          <div className="font-semibold text-slate-800 truncate mb-0.5">
                            {l.product_title || 'Sản phẩm Shopee'}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono truncate">
                            {l.clean_url}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-600">
                          u{user?.id}-{l.short_code}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-700">
                          {l.clicks_count} lượt
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                          {formatDate(l.created_at)}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleCopy(l.affiliate_url, l.id)}
                              title="Sao chép link"
                              className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors"
                            >
                              {copiedId === l.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => setSelectedQrLink(l)}
                              title="Mã QR điện thoại"
                              className="p-1.5 hover:bg-slate-100 text-orange-600 rounded-lg transition-colors"
                            >
                              <QrCode className="w-4 h-4" />
                            </button>
                            <a
                              href={l.affiliate_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Mở Shopee"
                              className="p-1.5 hover:bg-orange-50 text-orange-600 rounded-lg transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal chỉnh sửa tài khoản ngân hàng */}
      {isEditingBank && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Cập nhật tài khoản ngân hàng</h3>
            <p className="text-xs text-slate-500 mb-4">
              Tiền hoàn sẽ được chuyển về tài khoản này trong vòng 3 ngày làm việc sau khi duyệt.
            </p>

            <form onSubmit={handleSaveBank} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Ngân hàng</label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                >
                  {VIETNAM_BANKS.map((b) => (
                    <option key={b.code} value={b.name}>
                      {b.name} ({b.shortName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Số tài khoản</label>
                <input
                  type="text"
                  required
                  placeholder="VD: 1012345678"
                  value={bankAccNum}
                  onChange={(e) => setBankAccNum(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tên chủ tài khoản (in hoa không dấu)</label>
                <input
                  type="text"
                  required
                  placeholder="NGUYEN VAN A"
                  value={bankAccName}
                  onChange={(e) => setBankAccName(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl font-bold uppercase focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingBank(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-xs shadow-orange-200"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Modal for links */}
      {selectedQrLink && (
        <QRModal
          isOpen={true}
          onClose={() => setSelectedQrLink(null)}
          url={selectedQrLink.affiliate_url}
          title={selectedQrLink.product_title}
        />
      )}
    </div>
  );
}
