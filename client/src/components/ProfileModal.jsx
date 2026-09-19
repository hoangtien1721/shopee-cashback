import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  X,
  User,
  Mail,
  Phone,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { VIETNAM_BANKS } from '../services/api';

export default function ProfileModal({ isOpen, onClose }) {
  const { user, updateProfile, refreshUser } = useAuth();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [bankName, setBankName] = useState('Vietcombank');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankAccountName, setBankAccountName] = useState('');

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedRef, setCopiedRef] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      setFullName(user.full_name || '');
      setPhone(user.phone || '');
      setBankName(user.bank_name || 'Vietcombank');
      setBankAccountNumber(user.bank_account_number || '');
      setBankAccountName(user.bank_account_name || '');
      setSuccessMsg('');
      setErrorMsg('');
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const referralLink = `${window.location.origin}/?ref=u${user.id}`;

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      await updateProfile({
        full_name: fullName.trim(),
        phone: phone.trim(),
        bank_name: bankName,
        bank_account_number: bankAccountNumber.trim(),
        bank_account_name: bankAccountName.trim().toUpperCase()
      });
      await refreshUser();
      setSuccessMsg('Đã cập nhật thông tin cá nhân và tài khoản ngân hàng thành công!');
      setTimeout(() => {
        setSuccessMsg('');
      }, 3500);
    } catch (err) {
      setErrorMsg(err.message || 'Lỗi lưu thông tin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative border border-gray-200 max-h-[92vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-gray-100">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white flex items-center justify-center font-bold text-lg shadow-sm">
            {(user.full_name || user.email || 'U').charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-gray-900 tracking-tight">Thông Tin Cá Nhân</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-200">
                User #{user.id}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">Quản lý hồ sơ cá nhân và tài khoản ngân hàng nhận tiền hoàn</p>
          </div>
        </div>

        {/* Feedback alerts */}
        {successMsg && (
          <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl mb-4 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl mb-4 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5 text-xs">
          {/* Section 1: Personal info */}
          <div className="space-y-3">
            <div className="font-bold text-gray-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 text-orange-600">
              <User className="w-3.5 h-3.5" />
              <span>1. Thông tin tài khoản</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Họ và tên *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="Nguyễn Văn A"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-orange-500 focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Số điện thoại</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    placeholder="0912345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-orange-500 focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Email đăng nhập (Không thể thay đổi)</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 bg-gray-50 text-gray-500 rounded-lg cursor-not-allowed font-mono"
                />
              </div>
              <span className="text-[10px] text-gray-400 mt-1 block">
                Tài khoản liên kết Gmail xác thực Google an toàn.
              </span>
            </div>
          </div>

          {/* Section 2: Bank Account for Cashouts */}
          <div className="space-y-3 pt-3 border-t border-gray-100">
            <div className="font-bold text-gray-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 text-emerald-600">
              <CreditCard className="w-3.5 h-3.5" />
              <span>2. Tài khoản ngân hàng nhận tiền hoàn</span>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Ngân hàng thụ hưởng</label>
              <select
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-1 focus:ring-orange-500 focus:border-orange-500 focus:outline-none"
              >
                {VIETNAM_BANKS.map((b) => (
                  <option key={b.code} value={b.name}>
                    {b.name} ({b.shortName})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Số tài khoản ngân hàng</label>
                <input
                  type="text"
                  placeholder="VD: 1012345678"
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono focus:ring-1 focus:ring-orange-500 focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Tên chủ tài khoản (in hoa không dấu)</label>
                <input
                  type="text"
                  placeholder="NGUYEN VAN A"
                  value={bankAccountName}
                  onChange={(e) => setBankAccountName(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-semibold uppercase focus:ring-1 focus:ring-orange-500 focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Referral link */}
          <div className="space-y-2 pt-3 border-t border-gray-100">
            <div className="font-bold text-gray-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 text-purple-600">
              <Sparkles className="w-3.5 h-3.5" />
              <span>3. Link giới thiệu bạn bè (Nhận 30.000 đ/người)</span>
            </div>
            <div className="flex items-center gap-2 p-1.5 bg-gray-50 rounded-lg border border-gray-200">
              <input
                readOnly
                value={referralLink}
                className="flex-1 bg-transparent px-2 text-gray-700 text-xs font-mono focus:outline-none truncate select-all"
              />
              <button
                type="button"
                onClick={handleCopyReferral}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-xs font-semibold shrink-0 cursor-pointer transition-colors"
              >
                {copiedRef ? 'Đã copy' : 'Sao chép'}
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors cursor-pointer"
            >
              Đóng
            </button>
            <button
              type="submit"
              disabled={loading}
              className="py-2.5 px-5 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-xl font-semibold shadow-xs transition-colors cursor-pointer"
            >
              {loading ? 'Đang lưu...' : 'Lưu thông tin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
