import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Copy, Check, Download, Printer, ExternalLink, ShieldCheck, Sparkles } from 'lucide-react';

interface OfficialUpiQrCardProps {
  amount?: number;
  note?: string;
  studentName?: string;
  courseName?: string;
  showActions?: boolean;
  compact?: boolean;
  className?: string;
}

export const OfficialUpiQrCard: React.FC<OfficialUpiQrCardProps> = ({
  amount,
  note = 'JSSS Course Fees',
  studentName,
  courseName,
  showActions = true,
  compact = false,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const cardRef = useRef<HTMLDivElement>(null);

  const upiId = '9907323533-1@okbizaxis';
  const payeeName = 'Jeeb Seva Shib Seva Foundation';
  const phone = '+91 99073 23533';

  // Construct UPI URI according to NPCI UPI Specifications
  // upi://pay?pa=VPA&pn=NAME&am=AMOUNT&cu=INR&tn=NOTE
  const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
    payeeName
  )}&cu=INR${amount && amount > 0 ? `&am=${amount}` : ''}&tn=${encodeURIComponent(
    note || (courseName ? `Fees for ${courseName}` : 'Course Fees')
  )}`;

  useEffect(() => {
    // Generate QR Code data URL with high contrast and precision
    QRCode.toDataURL(upiUri, {
      width: compact ? 220 : 300,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Error generating UPI QR:', err));
  }, [upiUri, compact]);

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `JSSS_Official_Payment_QR_${upiId.split('@')[0]}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintCard = () => {
    window.print();
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Outer Card replicating the official Google Pay Standee Card */}
      <div
        ref={cardRef}
        className={`w-full ${
          compact ? 'max-w-[320px]' : 'max-w-[360px]'
        } bg-white rounded-[24px] sm:rounded-[28px] shadow-xl border border-slate-200/90 overflow-hidden text-center select-none transition-transform`}
      >
        {/* Google 4-Color Top Stripe Bar */}
        <div className="grid grid-cols-4 h-2.5 sm:h-3 w-full">
          <div className="bg-[#4285F4]" /> {/* Google Blue */}
          <div className="bg-[#34A853]" /> {/* Google Green */}
          <div className="bg-[#FBBC05]" /> {/* Google Yellow */}
          <div className="bg-[#EA4335]" /> {/* Google Red */}
        </div>

        <div className={`px-5 sm:px-6 ${compact ? 'py-4' : 'py-5'} space-y-3 sm:space-y-3.5`}>
          {/* Google Pay Logo Header */}
          <div className="flex items-center justify-center gap-2">
            {/* Multi-color Google Pay icon */}
            <svg className="w-7 h-7 sm:w-8 sm:h-8" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M43.6 20.5H42V20H24V28H35.3C33.7 32.7 29.2 36 24 36C17.4 36 12 30.6 12 24C12 17.4 17.4 12 24 12C27 12 29.7 13.1 31.8 15L37.5 9.3C33.9 6 29.2 4 24 4C13 4 4 13 4 24C4 35 13 44 24 44C35 44 43.6 36 43.6 24C43.6 22.8 43.5 21.6 43.6 20.5Z"
                fill="#FFC107"
                opacity="0"
              />
              <path
                d="M24 10C27.5 10 30.5 11.3 32.9 13.4L38.9 7.4C35 3.8 29.8 1.6 24 1.6C14.7 1.6 6.9 7.4 3.7 15.6L10.8 21.1C12.5 14.7 17.7 10 24 10Z"
                fill="#EA4335"
              />
              <path
                d="M24 38C17.7 38 12.5 33.3 10.8 26.9L3.7 32.4C6.9 40.6 14.7 46.4 24 46.4C29.6 46.4 34.6 44.3 38.4 40.8L31.5 35.1C29.5 36.9 26.9 38 24 38Z"
                fill="#34A853"
              />
              <path
                d="M44.4 24C44.4 22.4 44.1 20.9 43.7 19.4H24V28.2H35.5C34.8 31.3 33.1 33.7 30.7 35.2L37.6 40.9C41.7 37.1 44.4 31.2 44.4 24Z"
                fill="#4285F4"
              />
              <path
                d="M10.8 26.9C10.3 25.4 10 23.7 10 22C10 20.3 10.3 18.6 10.8 17.1L3.7 11.6C1.3 16.4 0 21.8 0 27.5C0 33.2 1.3 38.6 3.7 43.4L10.8 37.9V26.9Z"
                fill="#FBBC05"
              />
            </svg>
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-[#3c4043]">
              Google Pay
            </span>
          </div>

          {/* Beneficiary Name & Phone */}
          <div className="space-y-0.5">
            <h3 className="text-sm sm:text-base font-bold text-[#202124] leading-tight">
              {payeeName}
            </h3>
            <p className="text-xs sm:text-sm font-medium text-[#5f6368] tracking-wide">
              {phone}
            </p>
          </div>

          {/* "Scan & pay" label */}
          <div className="pt-1">
            <span className="text-xs sm:text-sm font-semibold text-[#3c4043] tracking-wide">
              Scan & pay
            </span>
          </div>

          {/* Dynamic QR Code Matrix Container */}
          <div className="flex justify-center items-center">
            <div className="p-2 sm:p-2.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs inline-block">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Official UPI QR Code - Jeeb Seva Shib Seva Foundation"
                  className={`${compact ? 'w-44 h-44' : 'w-56 h-56'} object-contain mx-auto block`}
                />
              ) : (
                <div
                  className={`${
                    compact ? 'w-44 h-44' : 'w-56 h-56'
                  } bg-slate-100 flex items-center justify-center text-slate-400 text-xs`}
                >
                  Generating QR...
                </div>
              )}
            </div>
          </div>

          {/* Optional Amount / Student Fee Badge */}
          {amount && Number(amount) > 0 ? (
            <div className="py-1 px-3 bg-emerald-50 border border-emerald-200 rounded-full inline-flex items-center gap-1.5 text-xs text-emerald-800 font-bold">
              <span>Payable Amount: ₹{(Number(amount) || 0).toLocaleString()}</span>
              {courseName && <span className="text-slate-500 font-normal">({courseName})</span>}
            </div>
          ) : null}

          {/* UPI ID display with Copy action */}
          <div className="pt-1">
            <div
              onClick={handleCopyUpi}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-mono font-medium text-[#3c4043] cursor-pointer transition-colors"
              title="Click to copy UPI ID"
            >
              <span>UPI ID: <strong className="text-slate-900">{upiId}</strong></span>
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 shrink-0" />
              )}
            </div>
            {copied && (
              <span className="block text-[10px] text-emerald-600 font-semibold mt-0.5">
                ✓ UPI ID copied to clipboard!
              </span>
            )}
          </div>

          {/* BHIM UPI Official Emblem Bar */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-center gap-2">
              {/* BHIM text */}
              <div className="flex items-center gap-1">
                <span className="font-black italic text-sm sm:text-base tracking-tighter text-slate-800">
                  BHIM
                </span>
                <span className="text-[#34A853] font-black text-sm">▶</span>
              </div>
              <div className="h-4 w-px bg-slate-300" />
              {/* UPI text with tricolor arrow */}
              <div className="flex items-center gap-1">
                <span className="font-black italic text-sm sm:text-base tracking-tighter text-[#1A4B8F]">
                  UPI
                </span>
                <span className="text-[#EA4335] font-black text-sm">▶</span>
              </div>
            </div>
            <p className="text-[8px] sm:text-[9px] text-slate-400 uppercase tracking-wider mt-0.5">
              BHARAT INTERFACE FOR MONEY • UNIFIED PAYMENTS INTERFACE
            </p>
          </div>

          {/* Supported UPI Apps Badges */}
          <div className="flex items-center justify-center gap-2 sm:gap-2.5 pt-1">
            {/* GPay badge */}
            <span className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-[10px] font-bold text-slate-700 flex items-center gap-1">
              <span className="text-[#4285F4]">G</span>
              <span className="text-[#EA4335]">P</span>
              <span className="text-[#FBBC05]">a</span>
              <span className="text-[#34A853]">y</span>
            </span>

            {/* Paytm badge */}
            <span className="px-2 py-0.5 rounded-md bg-[#002E6E]/10 border border-[#002E6E]/20 text-[10px] font-black text-[#002E6E]">
              Paytm
            </span>

            {/* PhonePe badge */}
            <span className="px-2 py-0.5 rounded-md bg-[#5f259f]/10 border border-[#5f259f]/20 text-[10px] font-bold text-[#5f259f] flex items-center gap-0.5">
              <span className="w-3 h-3 rounded-full bg-[#5f259f] text-white text-[8px] flex items-center justify-center font-bold">पे</span>
              PhonePe
            </span>

            {/* Amazon Pay badge */}
            <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold text-amber-900">
              amazon pay
            </span>
          </div>
        </div>
      </div>

      {/* External Actions & Direct Pay */}
      {showActions && (
        <div className="w-full max-w-[360px] mt-3 space-y-2 text-xs">
          {/* Mobile UPI Deep Link */}
          <a
            href={upiUri}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open in UPI App (GPay / PhonePe / Paytm)</span>
          </a>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyUpi}
              className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl border border-slate-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-slate-500" />
              <span>{copied ? 'Copied!' : 'Copy UPI ID'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadQr}
              className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl border border-slate-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Download QR</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
