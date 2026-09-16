import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { X, ExternalLink, Copy, Check, Smartphone } from 'lucide-react';

export default function QRModal({ isOpen, onClose, url, title }) {
  const canvasRef = useRef(null);
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    if (isOpen && canvasRef.current && url) {
      QRCode.toCanvas(canvasRef.current, url, {
        width: 220,
        margin: 2,
        color: {
          dark: '#1e293b',
          light: '#ffffff'
        }
      }, (error) => {
        if (error) console.error('QR Generation error:', error);
      });
    }
  }, [isOpen, url]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl relative border border-slate-100 text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
          <Smartphone className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-bold text-slate-800 mb-1">
          Quét QR Mở Shopee App
        </h3>
        <p className="text-xs text-slate-500 mb-4 px-2">
          Dùng camera điện thoại hoặc Zalo quét mã để mở thẳng Shopee và nhận hoàn tiền
        </p>

        {/* QR Code Canvas */}
        <div className="bg-slate-50 p-3 rounded-xl inline-block border border-slate-200 shadow-inner mb-4">
          <canvas ref={canvasRef} className="rounded-lg" />
        </div>

        <div className="text-xs text-slate-500 bg-amber-50 text-amber-800 p-2.5 rounded-lg border border-amber-200 mb-4 text-left">
          💡 <strong>Mẹo:</strong> Sau khi mở Shopee, thêm sản phẩm vào giỏ và đặt hàng ngay để không bị ngắt kết nối hoàn tiền nhé!
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Đã sao chép' : 'Sao chép link'}
          </button>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-orange-200 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Mở Shopee
          </a>
        </div>
      </div>
    </div>
  );
}
