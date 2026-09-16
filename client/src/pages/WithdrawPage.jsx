import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest, formatVND, formatDate, VIETNAM_BANKS } from '../services/api';
import {
  ArrowDownCircle,
  CreditCard,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Building2,
  Calendar,
  Check,
  Edit3
} from 'lucide-react';

export default function WithdrawPage({ onNavigate }) {
  const { user, refreshUser, updateProfile } = useAuth();

  const [withdrawals, setWithdrawals] = useState([]);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Bank edit state
  const [isEditingBank, setIsEditingBank] = useState(false);
  const [bankName, setBankName] = useState(user?.bank_name || 'Vietcombank');
  const [bankAccNum, setBankAccNum] = useState(user?.bank_account_number || '');
  const [bankAccName, setBankAccName] = useState(user?.bank_account_name || '');

  const availableBalance = user?.available_balance || 0;
  const minWithdrawal = 50000;

  const loadWithdrawals = async () => {
    try {
      setFetchLoading(true);
      const res = await apiRequest('/withdrawals');
      if (res.success) {
        setWithdrawals(res.requests);
      }
    } catch (err) {
      console.error('Error loading withdrawals:', err);
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    loadWithdrawals();
  }, []);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const withdrawAmount = parseInt(amount, 10);
    if (!withdrawAmount || isNaN(withdrawAmount) || withdrawAmount < minWithdrawal) {
      setError(`Số tiền rút tối thiểu là ${formatVND(minWithdrawal)}`);
      return;
    }

    if (withdrawAmount > availableBalance) {
      setError(`Số dư khả dụng (${formatVND(availableBalance)}) không đủ để rút ${formatVND(withdrawAmount)}`);
      return;
    }

    if (!user?.bank_name || !user?.bank_account_number || !user?.bank_account_name) {
      setError('Vui lòng cài đặt thông tin số tài khoản ngân hàng thụ hưởng trước khi rút tiền');
      setIsEditingBank(true);
      return;
    }

    setLoading(true);
    try {
      const res = await apiRequest('/withdrawals', {
        method: 'POST',
        body: JSON.stringify({ amount: withdrawAmount })
      });

      if (res.success) {
        setSuccessMsg(res.message);
        setAmount('');
        await refreshUser();
        await loadWithdrawals();
      }
    } catch (err) {
      setError(err.message || 'Lỗi khi tạo yêu cầu rút tiền');
    } finally {
      setLoading(false);
    }
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
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          Rút Tiền Về Tài Khoản Ngân Hàng
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">
          Cam kết chi trả trong vòng <strong>3 ngày làm việc</strong> trực tiếp vào số tài khoản của bạn
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Form Tạo lệnh rút tiền */}
        <div className="md:col-span-2 space-y-6">
          {/* Card Số dư */}
          <div className="bg-linear-to-r from-orange-600 to-amber-600 text-white rounded-3xl p-6 shadow-lg shadow-orange-500/15 flex items-center justify-between">
            <div>
              <div className="text-xs text-orange-100 font-semibold uppercase tracking-wider mb-1">
                Số dư khả dụng có thể rút
              </div>
              <div className="text-3xl sm:text-4xl font-black font-mono">
                {formatVND(availableBalance)}
              </div>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
              <ArrowDownCircle className="w-7 h-7 text-white" />
            </div>
          </div>

          {/* Card Tài khoản nhận tiền */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-800">Tài khoản ngân hàng thụ hưởng</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingBank(true)}
                className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{user?.bank_account_number ? 'Thay đổi' : 'Thiết lập'}</span>
              </button>
            </div>

            {user?.bank_account_number ? (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 text-base">{user.bank_name}</div>
                  <div className="font-mono font-bold text-slate-700 text-sm mt-0.5 tracking-wider">
                    {user.bank_account_number}
                  </div>
                  <div className="text-xs text-slate-500 uppercase mt-0.5">{user.bank_account_name}</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Check className="w-5 h-5" />
                </div>
              </div>
            ) : (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center justify-between">
                <span>Bạn chưa thiết lập tài khoản ngân hàng nhận tiền!</span>
                <button
                  onClick={() => setIsEditingBank(true)}
                  className="py-1 px-2.5 bg-rose-600 text-white font-bold rounded-lg text-xs"
                >
                  Thêm ngay
                </button>
              </div>
            )}
          </div>

          {/* Form Nhập số tiền */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <h3 className="font-bold text-sm text-slate-800 mb-4">Số tiền muốn rút</h3>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl mb-4">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl mb-4">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <div className="relative">
                  <input
                    type="number"
                    step="10000"
                    placeholder="VD: 100000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-3.5 text-xl font-bold font-mono border-2 border-slate-200 focus:border-orange-500 rounded-2xl focus:outline-hidden"
                  />
                  <div className="absolute right-4 top-4 text-sm font-bold text-slate-400">
                    VNĐ
                  </div>
                </div>
              </div>

              {/* Quick preset buttons */}
              <div className="grid grid-cols-4 gap-2">
                {[50000, 100000, 200000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(preset.toString())}
                    className="py-2 px-2 text-xs font-bold bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 transition-colors"
                  >
                    {formatVND(preset)}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setAmount(availableBalance.toString())}
                  className="py-2 px-2 text-xs font-bold bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-xl border border-orange-200 transition-colors"
                >
                  Tất cả ({formatVND(availableBalance)})
                </button>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Cam kết chi trả trong 3 ngày làm việc:</strong> Lệnh rút sẽ được ban quản trị kiểm tra và chuyển khoản trực tiếp qua ngân hàng.
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || availableBalance < minWithdrawal}
                className="w-full py-3.5 px-4 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold rounded-2xl text-sm shadow-md shadow-orange-500/20 transition-all cursor-pointer"
              >
                {loading ? 'Đang gửi yêu cầu...' : `Xác nhận Rút ${amount ? formatVND(parseInt(amount, 10)) : ''}`}
              </button>
            </form>
          </div>
        </div>

        {/* Right: Cam kết & Hướng dẫn */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Chính Sách Rút Tiền</h4>

            <ul className="space-y-3 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span><strong>Hạn mức rút tối thiểu:</strong> Từ 50.000 VNĐ / lần</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span><strong>Thời gian chi trả:</strong> Trong vòng 3 ngày làm việc (không tính T7, CN)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span><strong>Phí rút tiền:</strong> Hoàn toàn miễn phí 0đ</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span><strong>Phương thức:</strong> Chuyển khoản liên ngân hàng 24/7 Napas</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Lịch sử các lệnh rút tiền */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-base font-bold text-slate-900 mb-4">
          Lịch Sử Yêu Cầu Rút Tiền ({withdrawals.length})
        </h3>

        {withdrawals.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs">
            Bạn chưa tạo lệnh rút tiền nào.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Mã GD</th>
                  <th className="py-3 px-4">Số tiền</th>
                  <th className="py-3 px-4">Tài khoản nhận</th>
                  <th className="py-3 px-4">Thời gian tạo</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                  <th className="py-3 px-4">Ghi chú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {withdrawals.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-50/80">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                      #{w.id}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 text-sm">
                      {formatVND(w.amount)}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{w.bank_name}</div>
                      <div className="text-[11px] font-mono text-slate-500">{w.bank_account_number} ({w.bank_account_name})</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                      {formatDate(w.created_at)}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {w.status === 'completed' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Đã chi trả
                        </span>
                      ) : w.status === 'processing' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          <Clock className="w-3 h-3" /> Đang chuyển
                        </span>
                      ) : w.status === 'pending' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3 h-3" /> Chờ xử lý (3 ngày)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          Đã hoàn lại ví
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate text-[11px]">
                      {w.bank_trans_code && <span className="font-mono text-slate-700 font-bold mr-1">[{w.bank_trans_code}]</span>}
                      {w.admin_note || '---'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Chỉnh sửa tài khoản ngân hàng */}
      {isEditingBank && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Cập nhật tài khoản ngân hàng</h3>
            <p className="text-xs text-slate-500 mb-4">
              Vui lòng nhập chính xác để nhận tiền trong vòng 3 ngày làm việc.
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
                  Lưu tài khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
