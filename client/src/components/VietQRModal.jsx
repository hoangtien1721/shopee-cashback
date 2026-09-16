import React, { useState } from 'react';
import { X, Copy, Check, CheckCircle2, ArrowRight } from 'lucide-react';
import { VIETNAM_BANKS, formatVND } from '../services/api';

export default function VietQRModal({ isOpen, onClose, withdrawal, onConfirmPaid }) {
  const [copiedField, setCopiedField] = useState(null);
  const [bankTransCode, setBankTransCode] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !withdrawal) return null;

  // Tìm BIN code của ngân hàng
  const bankInfo = VIETNAM_BANKS.find(b => 
    b.name.toLowerCase().includes((withdrawal.bank_name || '').toLowerCase()) ||
    (withdrawal.bank_name || '').toLowerCase().includes(b.shortName.toLowerCase())
  );
  const bankBin = bankInfo ? bankInfo.bin : '970436'; // Mặc định VCB nếu không khớp

  const cleanAccNum = (withdrawal.bank_account_number || '').replace(/\s+/g, '');
  const accName = (withdrawal.bank_account_name || '').toUpperCase();
  const amount = withdrawal.amount || 0;
  const transferContent = `CB${withdrawal.id} ${cleanAccNum.slice(-4)}`;

  const vietQrUrl = `https://img.vietqr.io/image/${bankBin}-${cleanAccNum}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(accName)}`;

  const handleCopy = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleApprove = async () => {
    try {
      setSubmitting(true);
      await onConfirmPaid(withdrawal.id, {
        bank_trans_code: bankTransCode || 'NHANH247-' + Date.now().toString().slice(-6),
        admin_note: adminNote || 'Đã chuyển khoản qua ngân hàng'
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative border border-slate-100 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-bold">
            QR
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Chi trả yêu cầu rút tiền #{withdrawal.id}</h3>
            <p className="text-xs text-slate-500">Quét VietQR bằng app ngân hàng để chuyển tiền nhanh</p>
          </div>
        </div>

        {/* VietQR Image */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center mb-5">
          <img
            src={vietQrUrl}
            alt="VietQR Payout"
            className="mx-auto rounded-xl shadow-xs max-h-56 object-contain"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <p className="text-[11px] text-slate-400 mt-2">Mã QR tự động điền sẵn STK, số tiền và nội dung chuyển</p>
        </div>

        {/* Thông tin chuyển khoản sao chép tay */}
        <div className="space-y-2.5 mb-5 text-sm">
          <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
            <div>
              <div className="text-xs text-slate-400">Ngân hàng thụ hưởng</div>
              <div className="font-semibold text-slate-800">{withdrawal.bank_name}</div>
            </div>
            <button
              onClick={() => handleCopy(withdrawal.bank_name, 'bank')}
              className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500"
            >
              {copiedField === 'bank' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
            <div>
              <div className="text-xs text-slate-400">Số tài khoản</div>
              <div className="font-mono font-bold text-slate-900 text-base">{cleanAccNum}</div>
            </div>
            <button
              onClick={() => handleCopy(cleanAccNum, 'accNum')}
              className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500"
            >
              {copiedField === 'accNum' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
            <div>
              <div className="text-xs text-slate-400">Tên chủ tài khoản</div>
              <div className="font-bold text-slate-800">{accName}</div>
            </div>
            <button
              onClick={() => handleCopy(accName, 'name')}
              className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500"
            >
              {copiedField === 'name' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
            <div>
              <div className="text-xs text-emerald-700">Số tiền cần chi trả</div>
              <div className="font-bold text-emerald-700 text-lg">{formatVND(amount)}</div>
            </div>
            <button
              onClick={() => handleCopy(amount.toString(), 'amount')}
              className="p-1.5 hover:bg-emerald-100 rounded-lg text-emerald-700"
            >
              {copiedField === 'amount' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Form xác nhận sau khi admin đã chuyển khoản */}
        <div className="pt-3 border-t border-slate-100 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mã giao dịch ngân hàng (Tùy chọn)
            </label>
            <input
              type="text"
              placeholder="VD: FT240905123456"
              value={bankTransCode}
              onChange={(e) => setBankTransCode(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ghi chú của Admin
            </label>
            <input
              type="text"
              placeholder="VD: Đã chuyển khoản qua VCB 24/7"
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-colors"
            >
              Đóng
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={handleApprove}
              className="flex-2 flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold shadow-sm shadow-emerald-200 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              {submitting ? 'Đang cập nhật...' : 'Xác nhận Đã Chuyển Tiền'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
