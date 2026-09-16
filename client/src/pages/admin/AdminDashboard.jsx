import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest, formatVND, formatDate } from '../../services/api';
import VietQRModal from '../../components/VietQRModal';
import {
  Shield,
  LayoutDashboard,
  ShoppingBag,
  ArrowDownCircle,
  Users,
  Settings,
  Upload,
  Download,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  QrCode,
  FileSpreadsheet,
  AlertCircle,
  Check,
  Search
} from 'lucide-react';

export default function AdminDashboard({ onNavigate }) {
  const { user } = useAuth();

  const [adminTab, setAdminTab] = useState('overview'); // 'overview' | 'orders' | 'withdrawals' | 'users' | 'settings'
  const [loading, setLoading] = useState(true);

  // Stats
  const [stats, setStats] = useState(null);

  // Orders
  const [orders, setOrders] = useState([]);
  const [orderStatusFilter, setOrderStatusFilter] = useState('');
  const [orderSearch, setOrderSearch] = useState('');

  // Withdrawals
  const [withdrawals, setWithdrawals] = useState([]);
  const [withdrawFilter, setWithdrawFilter] = useState('');
  const [selectedWithdrawalForQr, setSelectedWithdrawalForQr] = useState(null);

  // Users
  const [usersList, setUsersList] = useState([]);
  const [userSearch, setUserSearch] = useState('');

  // Settings
  const [settings, setSettings] = useState({
    cashback_rate: '0.5',
    min_withdrawal: '50000',
    payout_sla_days: '3',
    shopee_app_id: '',
    shopee_app_secret: '',
    shopee_affiliate_id: 'viva_cashback',
    shopee_cookie: ''
  });
  const [saveSettingMsg, setSaveSettingMsg] = useState('');
  const [testingApi, setTestingApi] = useState(false);
  const [apiTestResult, setApiTestResult] = useState(null);

  // Manual Add Order Modal
  const [showAddOrderModal, setShowAddOrderModal] = useState(false);
  const [newOrder, setNewOrder] = useState({
    shopee_order_id: '',
    user_id: '',
    order_amount: '500000',
    shopee_commission: '40000',
    product_names: '',
    status: 'confirmed',
    note: ''
  });

  // Import Excel State
  const [uploadingFile, setUploadingFile] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [statsRes, ordersRes, withdrawsRes, usersRes, settingsRes] = await Promise.all([
        apiRequest('/admin/stats'),
        apiRequest('/admin/orders'),
        apiRequest('/admin/withdrawals'),
        apiRequest('/admin/users'),
        apiRequest('/admin/settings')
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (ordersRes.success) setOrders(ordersRes.orders);
      if (withdrawsRes.success) setWithdrawals(withdrawsRes.withdrawals);
      if (usersRes.success) setUsersList(usersRes.users);
      if (settingsRes.success) setSettings(settingsRes.settings);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Xác nhận đơn hàng
  const handleConfirmOrder = async (orderId) => {
    try {
      const res = await apiRequest(`/admin/orders/${orderId}/confirm`, { method: 'PUT' });
      alert(res.message);
      loadAllData();
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  // Từ chối đơn hàng
  const handleRejectOrder = async (orderId) => {
    const reason = prompt('Nhập lý do từ chối hoàn tiền (VD: Đơn bị hủy / Hoàn hàng trên Shopee):');
    if (reason === null) return;
    try {
      const res = await apiRequest(`/admin/orders/${orderId}/reject`, {
        method: 'PUT',
        body: JSON.stringify({ reason })
      });
      alert(res.message);
      loadAllData();
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  // Thêm đơn hàng thủ công
  const handleAddManualOrder = async (e) => {
    e.preventDefault();
    try {
      const res = await apiRequest('/admin/orders', {
        method: 'POST',
        body: JSON.stringify(newOrder)
      });
      alert(res.message);
      setShowAddOrderModal(false);
      setNewOrder({
        shopee_order_id: '',
        user_id: '',
        order_amount: '500000',
        shopee_commission: '40000',
        product_names: '',
        status: 'confirmed',
        note: ''
      });
      loadAllData();
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  // Upload file Excel Shopee
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploadingFile(true);
    setImportResult(null);

    try {
      const res = await apiRequest('/admin/orders/import-excel', {
        method: 'POST',
        body: formData
      });
      setImportResult(res);
      loadAllData();
    } catch (err) {
      alert('Lỗi xử lý file: ' + err.message);
    } finally {
      setUploadingFile(false);
      e.target.value = '';
    }
  };

  // Hoàn tất chi trả rút tiền
  const handleConfirmPaidWithdrawal = async (withdrawId, payload) => {
    try {
      const res = await apiRequest(`/admin/withdrawals/${withdrawId}`, {
        method: 'PUT',
        body: JSON.stringify({
          status: 'completed',
          ...payload
        })
      });
      alert(res.message);
      loadAllData();
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  // Từ chối rút tiền (hoàn lại ví)
  const handleRejectWithdrawal = async (withdrawId) => {
    const reason = prompt('Nhập lý do từ chối rút tiền (Số tiền sẽ được hoàn lại vào ví của user):');
    if (reason === null) return;
    try {
      const res = await apiRequest(`/admin/withdrawals/${withdrawId}`, {
        method: 'PUT',
        body: JSON.stringify({
          status: 'rejected',
          admin_note: reason
        })
      });
      alert(res.message);
      loadAllData();
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  // Lưu cài đặt
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      const res = await apiRequest('/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(settings)
      });
      setSaveSettingMsg('Cập nhật cấu hình hệ thống thành công!');
      setTimeout(() => setSaveSettingMsg(''), 3000);
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  // Kiểm tra kết nối Shopee API
  const handleTestShopeeApi = async () => {
    setTestingApi(true);
    setApiTestResult(null);
    try {
      const res = await apiRequest('/admin/test-shopee-api', {
        method: 'POST',
        body: JSON.stringify(settings)
      });
      setApiTestResult(res);
    } catch (err) {
      setApiTestResult({
        success: false,
        message: err.message
      });
    } finally {
      setTestingApi(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900">Bảng Điều Khiển Quản Trị</h1>
              <span className="text-xs font-bold px-2.5 py-0.5 bg-purple-100 text-purple-700 rounded-full border border-purple-200">
                Admin Panel
              </span>
            </div>
            <p className="text-slate-500 text-xs mt-0.5">
              Đối soát doanh thu Shopee, cộng 50% hoàn tiền và duyệt chi trả trong 3 ngày
            </p>
          </div>
        </div>

        <button
          onClick={loadAllData}
          className="flex items-center gap-1.5 py-2 px-3.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Làm mới dữ liệu</span>
        </button>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {[
          { key: 'overview', label: 'Tổng quan', icon: LayoutDashboard },
          { key: 'orders', label: `Đơn hàng & Đối soát (${orders.length})`, icon: ShoppingBag },
          { key: 'withdrawals', label: `Yêu cầu Rút tiền (${withdrawals.filter(w => w.status === 'pending').length} chờ)`, icon: ArrowDownCircle },
          { key: 'users', label: `Thành viên (${usersList.length})`, icon: Users },
          { key: 'settings', label: 'Cài đặt hệ thống', icon: Settings }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = adminTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setAdminTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-purple-700 text-white shadow-md shadow-purple-600/20'
                  : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. OVERVIEW TAB */}
      {adminTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Sales */}
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tổng Doanh Thu Shopee</span>
              <div className="text-2xl font-black font-mono text-slate-900 mt-2">
                {formatVND(stats?.orders?.total_sales)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Từ {stats?.orders?.total || 0} đơn hàng phát sinh</div>
            </div>

            {/* Total Shopee Commission */}
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Hoa Hồng Shopee Trả</span>
              <div className="text-2xl font-black font-mono text-emerald-600 mt-2">
                {formatVND(stats?.orders?.total_shopee_commission)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Doanh thu hoa hồng Affiliate tổng</div>
            </div>

            {/* User Cashback Paid (50%) */}
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tiền Hoàn Đã Duyệt (50%)</span>
              <div className="text-2xl font-black font-mono text-orange-600 mt-2">
                {formatVND(stats?.orders?.user_cashback_paid)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Đã cộng vào ví khả dụng của user</div>
            </div>

            {/* Pending Withdrawals */}
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Chờ Rút Ngân Hàng</span>
              <div className="text-2xl font-black font-mono text-rose-600 mt-2">
                {formatVND(stats?.withdrawals?.pending_amount)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {stats?.withdrawals?.pending_count || 0} yêu cầu cần chi trả trong 3 ngày
              </div>
            </div>
          </div>

          {/* Additional quick stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-purple-50 rounded-3xl border border-purple-100">
              <div className="text-xs font-bold text-purple-900 uppercase">Thành viên đăng ký</div>
              <div className="text-3xl font-black text-purple-700 mt-1">{stats?.total_users || 0} người</div>
              <div className="text-xs text-purple-600/80 mt-1">Đã tạo {stats?.total_links || 0} link affiliate</div>
            </div>

            <div className="p-5 bg-amber-50 rounded-3xl border border-amber-100">
              <div className="text-xs font-bold text-amber-900 uppercase">Tiền hoàn chờ đối soát</div>
              <div className="text-3xl font-black text-amber-700 mt-1">
                {formatVND(stats?.orders?.user_cashback_pending)}
              </div>
              <div className="text-xs text-amber-700/80 mt-1">{stats?.orders?.pending || 0} đơn đang đợi Shopee chốt</div>
            </div>

            <div className="p-5 bg-emerald-50 rounded-3xl border border-emerald-100">
              <div className="text-xs font-bold text-emerald-900 uppercase">Tổng tiền đã chi trả</div>
              <div className="text-3xl font-black text-emerald-700 mt-1">
                {formatVND(stats?.withdrawals?.completed_amount)}
              </div>
              <div className="text-xs text-emerald-700/80 mt-1">Đã chuyển khoản thành công về STK</div>
            </div>
          </div>
        </div>
      )}

      {/* 2. ORDERS & RECONCILIATION TAB */}
      {adminTab === 'orders' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Action Bar: Upload Excel & Manual Add */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Đối Soát Báo Cáo Doanh Thu Shopee</h3>
                <p className="text-xs text-slate-500">
                  Tải lên file Excel/CSV xuất từ Shopee Affiliate Dashboard để tự động bóc tách Sub ID và cộng 50% hoàn tiền
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Download Sample Excel */}
                <a
                  href="/api/admin/sample-report"
                  download
                  className="flex items-center gap-1.5 py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải file Excel mẫu</span>
                </a>

                {/* Upload File Input */}
                <label className="flex items-center gap-1.5 py-2 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingFile ? 'Đang xử lý...' : 'Tải lên Báo cáo Shopee (.xlsx)'}</span>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={uploadingFile}
                  />
                </label>

                {/* Manual Add Order */}
                <button
                  onClick={() => setShowAddOrderModal(true)}
                  className="flex items-center gap-1.5 py-2 px-3.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm đơn thủ công</span>
                </button>
              </div>
            </div>

            {/* Import result alert */}
            {importResult && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center justify-between">
                <div>
                  <strong>{importResult.message}</strong>
                  <div className="text-[11px] text-emerald-600 mt-0.5">
                    Thêm mới: {importResult.result.addedCount} đơn | Cập nhật: {importResult.result.updatedCount} đơn | Bỏ qua: {importResult.result.skippedCount} dòng
                  </div>
                </div>
                <button
                  onClick={() => setImportResult(null)}
                  className="text-emerald-700 font-bold hover:underline"
                >
                  Đóng
                </button>
              </div>
            )}
          </div>

          {/* Filter & Search */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Tìm theo mã đơn hàng, email, tên người mua..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-hidden"
              />
            </div>
            <div className="flex gap-2">
              {['', 'pending', 'confirmed', 'rejected'].map((st) => (
                <button
                  key={st}
                  onClick={() => setOrderStatusFilter(st)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                    orderStatusFilter === st
                      ? 'bg-slate-900 text-white'
                      : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {st === '' ? 'Tất cả' : st === 'pending' ? 'Chờ duyệt' : st === 'confirmed' ? 'Đã duyệt (+Ví)' : 'Từ chối'}
                </button>
              ))}
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase font-bold border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Mã đơn Shopee</th>
                    <th className="py-3 px-4">Người mua (User ID)</th>
                    <th className="py-3 px-4">Sản phẩm</th>
                    <th className="py-3 px-4">Giá trị đơn</th>
                    <th className="py-3 px-4">Hoa hồng Shopee</th>
                    <th className="py-3 px-4 text-orange-600">User nhận (50%)</th>
                    <th className="py-3 px-4">Thời gian</th>
                    <th className="py-3 px-4 text-center">Trạng thái</th>
                    <th className="py-3 px-4 text-right">Thao tác duyệt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {orders
                    .filter((o) => {
                      if (orderStatusFilter && o.status !== orderStatusFilter) return false;
                      if (orderSearch) {
                        const term = orderSearch.toLowerCase();
                        return (
                          o.shopee_order_id.toLowerCase().includes(term) ||
                          (o.user_email || '').toLowerCase().includes(term) ||
                          (o.user_name || '').toLowerCase().includes(term)
                        );
                      }
                      return true;
                    })
                    .map((o) => (
                      <tr key={o.id} className="hover:bg-slate-50/80">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                          #{o.shopee_order_id}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900">{o.user_name}</div>
                          <div className="text-[11px] text-slate-400">ID: {o.user_id} ({o.user_email})</div>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs truncate text-slate-700">
                          {o.product_names || 'Đơn hàng Shopee'}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-600">
                          {formatVND(o.order_amount)}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-semibold text-emerald-600">
                          {formatVND(o.shopee_commission)}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-orange-600 text-sm">
                          {formatVND(o.user_cashback)}
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                          {formatDate(o.created_at)}
                        </td>
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          {o.status === 'confirmed' ? (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Đã cộng ví
                            </span>
                          ) : o.status === 'pending' ? (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              Chờ xác nhận
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              Từ chối / Hủy
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          {o.status === 'pending' ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleConfirmOrder(o.id)}
                                title="Xác nhận cộng 50% tiền vào ví"
                                className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold flex items-center gap-1"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Duyệt (+Ví)</span>
                              </button>
                              <button
                                onClick={() => handleRejectOrder(o.id)}
                                title="Từ chối hoàn tiền"
                                className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400">Đã chốt</span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. WITHDRAWALS TAB */}
      {adminTab === 'withdrawals' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Danh Sách Yêu Cầu Rút Tiền</h3>
              <p className="text-xs text-slate-500">
                Cam kết chi trả trong vòng 3 ngày làm việc. Quét mã VietQR để chuyển tiền nhanh 24/7.
              </p>
            </div>

            <div className="flex gap-2">
              {['', 'pending', 'processing', 'completed', 'rejected'].map((st) => (
                <button
                  key={st}
                  onClick={() => setWithdrawFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    withdrawFilter === st
                      ? 'bg-slate-900 text-white'
                      : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {st === '' ? 'Tất cả' : st === 'pending' ? 'Chờ xử lý (3 ngày)' : st === 'processing' ? 'Đang chuyển' : st === 'completed' ? 'Đã chi trả' : 'Đã từ chối'}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase font-bold border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Mã GD</th>
                    <th className="py-3 px-4">Người rút</th>
                    <th className="py-3 px-4">Số tiền cần chi</th>
                    <th className="py-3 px-4">Tài khoản ngân hàng thụ hưởng</th>
                    <th className="py-3 px-4">Ngày yêu cầu</th>
                    <th className="py-3 px-4 text-center">Trạng thái</th>
                    <th className="py-3 px-4 text-right">Chi trả / Xử lý</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {withdrawals
                    .filter((w) => !withdrawFilter || w.status === withdrawFilter)
                    .map((w) => (
                      <tr key={w.id} className="hover:bg-slate-50/80">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                          #{w.id}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{w.user_name}</div>
                          <div className="text-[11px] text-slate-400">{w.user_email} | SĐT: {w.user_phone || '---'}</div>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-black text-rose-600 text-sm">
                          {formatVND(w.amount)}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-800">{w.bank_name}</div>
                          <div className="font-mono text-slate-900 font-bold">{w.bank_account_number}</div>
                          <div className="text-[11px] text-slate-500 uppercase">{w.bank_account_name}</div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                          {formatDate(w.created_at)}
                        </td>
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          {w.status === 'completed' ? (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Đã chi trả ({w.bank_trans_code})
                            </span>
                          ) : w.status === 'pending' ? (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              Chờ chi trả (3 ngày)
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              Từ chối & Đã hoàn ví
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          {w.status === 'pending' ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setSelectedWithdrawalForQr(w)}
                                className="flex items-center gap-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                              >
                                <QrCode className="w-3.5 h-3.5" />
                                <span>Quét VietQR & Trả</span>
                              </button>
                              <button
                                onClick={() => handleRejectWithdrawal(w.id)}
                                className="py-1.5 px-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold"
                              >
                                Từ chối
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400">Hoàn tất</span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. USERS TAB */}
      {adminTab === 'users' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Danh Sách Thành Viên & Số Dư</h3>
            <div className="w-72">
              <input
                type="text"
                placeholder="Tìm thành viên theo tên, email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white"
              />
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase font-bold border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">User ID</th>
                    <th className="py-3 px-4">Họ và tên</th>
                    <th className="py-3 px-4">Email / SĐT</th>
                    <th className="py-3 px-4">Số dư khả dụng</th>
                    <th className="py-3 px-4">Chờ đối soát</th>
                    <th className="py-3 px-4">Tổng đã rút</th>
                    <th className="py-3 px-4">Tài khoản ngân hàng</th>
                    <th className="py-3 px-4">Ngày đăng ký</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {usersList
                    .filter((u) => {
                      if (!userSearch) return true;
                      const term = userSearch.toLowerCase();
                      return (
                        u.full_name.toLowerCase().includes(term) ||
                        u.email.toLowerCase().includes(term)
                      );
                    })
                    .map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/80">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-600">
                          #{u.id}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {u.full_name} {u.role === 'admin' && <span className="text-[10px] text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded-full ml-1">Admin</span>}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          <div>{u.email}</div>
                          <div className="text-[11px] text-slate-400">{u.phone || '---'}</div>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-600">
                          {formatVND(u.available_balance)}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-amber-600">
                          {formatVND(u.pending_balance)}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-600">
                          {formatVND(u.withdrawn_total)}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 text-[11px]">
                          {u.bank_name ? (
                            <div>
                              <div className="font-semibold">{u.bank_name}</div>
                              <div className="font-mono">{u.bank_account_number} ({u.bank_account_name})</div>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Chưa cài đặt</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                          {formatDate(u.created_at)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. SETTINGS TAB */}
      {adminTab === 'settings' && (
        <div className="max-w-2xl bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 animate-in fade-in duration-150">
          <h3 className="text-lg font-bold text-slate-900 mb-2">Cấu Hình Hệ Thống Hoàn Tiền</h3>
          <p className="text-xs text-slate-500 mb-6">
            Thiết lập tỷ lệ chia sẻ hoa hồng Shopee, thời gian chi trả và tích hợp Shopee Affiliate API
          </p>

          {saveSettingMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl mb-4">
              {saveSettingMsg}
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tỷ lệ chia sẻ hoa hồng cho User (0.5 = 50%)
              </label>
              <input
                type="number"
                step="0.05"
                min="0.1"
                max="0.9"
                value={settings.cashback_rate || '0.5'}
                onChange={(e) => setSettings({ ...settings, cashback_rate: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden"
              />
              <p className="text-[11px] text-slate-400 mt-1">Mặc định 0.5 tương ứng chia 50% hoa hồng Shopee cho người mua hàng.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Hạn mức rút tiền tối thiểu (VNĐ)
              </label>
              <input
                type="number"
                step="10000"
                value={settings.min_withdrawal || '50000'}
                onChange={(e) => setSettings({ ...settings, min_withdrawal: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Thời gian cam kết chi trả (ngày làm việc)
              </label>
              <input
                type="number"
                value={settings.payout_sla_days || '3'}
                onChange={(e) => setSettings({ ...settings, payout_sla_days: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-4">
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl space-y-2">
                <h4 className="text-xs font-bold text-orange-900 uppercase tracking-wider flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-orange-600" />
                  <span>Giải Pháp Khi Shopee Không Mở Open API Cho Tài Khoản Cá Nhân</span>
                </h4>
                <p className="text-xs text-orange-800 leading-relaxed">
                  Shopee hiện chỉ cấp Open API cho các Agency/KOL lớn có quản lý trực tiếp. Đừng lo lắng, hệ thống đã xây dựng sẵn <strong>2 phương án thay thế</strong> hoàn toàn không cần Shopee duyệt Open API:
                </p>
                <div className="space-y-2 text-xs text-orange-950 pl-2">
                  <div className="p-2.5 bg-white/80 rounded-xl border border-orange-200/60">
                    <span className="font-bold text-orange-700">⭐ Cách 1 (Khuyên Dùng Nhất - Không Cần API):</span> Điền mã <strong>Shopee Affiliate Partner ID</strong> (mã tiếp thị liên kết của bạn). Hệ thống sẽ tự động tạo Universal Tracking Link chuẩn của Shopee (<code>https://s.shopee.vn/an_redir?...</code>) gắn Sub ID người mua. Hoạt động vĩnh viễn, không bao giờ hết hạn!
                  </div>
                  <div className="p-2.5 bg-white/80 rounded-xl border border-orange-200/60">
                    <span className="font-bold text-purple-700">⚡ Cách 2 (Tự Động Sinh Link s.shopee.vn Qua Cookie):</span> Lấy cookie đăng nhập <code>SPC_EC</code> từ trình duyệt khi bạn đăng nhập vào <u>affiliate.shopee.vn</u> rồi dán vào ô bên dưới. Hệ thống sẽ tự động gọi API nội bộ của Shopee để sinh link ngắn <code>s.shopee.vn</code> chính chủ của bạn!
                  </div>
                </div>
              </div>

              {/* Input 1: Affiliate Partner ID */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ⭐ Shopee Affiliate Partner ID (Mã đối tác tiếp thị của bạn)
                </label>
                <input
                  type="text"
                  placeholder="VD: viva_cashback hoặc mã số KOL của bạn (VD: 17382910...)"
                  value={settings.shopee_affiliate_id || ''}
                  onChange={(e) => setSettings({ ...settings, shopee_affiliate_id: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono focus:outline-hidden"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  💡 Cách lấy: Bạn tạo 1 link bất kỳ trên Shopee Affiliate, dán link vào trình duyệt, xem trên thanh URL sẽ thấy đoạn <code>affiliate_id=...</code>
                </p>
              </div>

              {/* Input 2: Shopee Session Cookie */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ⚡ Shopee Session Cookie (SPC_EC) - Tùy chọn để sinh link s.shopee.vn tự động
                </label>
                <textarea
                  rows="2"
                  placeholder="Dán giá trị cookie SPC_EC khi đăng nhập affiliate.shopee.vn vào đây"
                  value={settings.shopee_cookie || ''}
                  onChange={(e) => setSettings({ ...settings, shopee_cookie: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono focus:outline-hidden"
                />
              </div>

              {/* Input 3 & 4: Open API (Optional) */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2.5">
                <div className="text-xs font-bold text-slate-500 uppercase">
                  Shopee Open API (Dành riêng cho đối tác lớn được Shopee duyệt)
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">App ID</label>
                    <input
                      type="text"
                      placeholder="Bỏ trống nếu chưa có"
                      value={settings.shopee_app_id || ''}
                      onChange={(e) => setSettings({ ...settings, shopee_app_id: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg font-mono focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Secret Key</label>
                    <input
                      type="password"
                      placeholder="Bỏ trống nếu chưa có"
                      value={settings.shopee_app_secret || ''}
                      onChange={(e) => setSettings({ ...settings, shopee_app_secret: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg font-mono focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {apiTestResult && (
                <div className={`p-3 rounded-xl border text-xs ${
                  apiTestResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}>
                  <strong>Kết quả kiểm tra:</strong> {apiTestResult.message}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <button
                type="submit"
                className="py-2.5 px-5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
              >
                Lưu cấu hình hệ thống
              </button>

              <button
                type="button"
                disabled={testingApi}
                onClick={handleTestShopeeApi}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                {testingApi ? 'Đang kiểm tra...' : '🔍 Kiểm tra kết nối Shopee API'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Thêm Đơn Hàng Thủ Công */}
      {showAddOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Thêm đơn hàng hoàn tiền thủ công</h3>
            <p className="text-xs text-slate-500 mb-4">
              Nhập thông tin đơn Shopee để tự động tính 50% hoa hồng và cộng vào ví người mua.
            </p>

            <form onSubmit={handleAddManualOrder} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mã đơn hàng Shopee *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: 240905SHP991122"
                  value={newOrder.shopee_order_id}
                  onChange={(e) => setNewOrder({ ...newOrder, shopee_order_id: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Chọn người dùng (User) *</label>
                <select
                  required
                  value={newOrder.user_id}
                  onChange={(e) => setNewOrder({ ...newOrder, user_id: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white"
                >
                  <option value="">-- Chọn thành viên nhận hoàn tiền --</option>
                  {usersList.map((u) => (
                    <option key={u.id} value={u.id}>
                      ID #{u.id}: {u.full_name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Giá trị đơn hàng (VNĐ)</label>
                  <input
                    type="number"
                    value={newOrder.order_amount}
                    onChange={(e) => setNewOrder({ ...newOrder, order_amount: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Hoa hồng Shopee (VNĐ) *</label>
                  <input
                    type="number"
                    required
                    value={newOrder.shopee_commission}
                    onChange={(e) => setNewOrder({ ...newOrder, shopee_commission: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono font-bold text-emerald-600"
                  />
                </div>
              </div>

              {/* Preview 50% split */}
              <div className="p-2.5 bg-orange-50 rounded-xl border border-orange-200 text-xs text-orange-800 flex justify-between">
                <span>Tiền hoàn User nhận (50%):</span>
                <span className="font-bold font-mono">
                  {formatVND(Math.round((parseInt(newOrder.shopee_commission, 10) || 0) * 0.5))}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tên sản phẩm</label>
                <input
                  type="text"
                  placeholder="VD: Tai nghe Sony WH-1000XM5"
                  value={newOrder.product_names}
                  onChange={(e) => setNewOrder({ ...newOrder, product_names: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Trạng thái xác nhận</label>
                <select
                  value={newOrder.status}
                  onChange={(e) => setNewOrder({ ...newOrder, status: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white font-semibold"
                >
                  <option value="confirmed">Đã xác nhận (Cộng số dư khả dụng ngay)</option>
                  <option value="pending">Chờ đối soát (Cộng vào số dư chờ)</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddOrderModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl"
                >
                  Xác nhận Thêm đơn
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VietQR Payout Modal */}
      {selectedWithdrawalForQr && (
        <VietQRModal
          isOpen={true}
          onClose={() => setSelectedWithdrawalForQr(null)}
          withdrawal={selectedWithdrawalForQr}
          onConfirmPaid={handleConfirmPaidWithdrawal}
        />
      )}
    </div>
  );
}
