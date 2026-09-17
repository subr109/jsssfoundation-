import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { Certificate } from '../../types';
import { Download, Printer, CheckCircle, ShieldCheck, Share2, ExternalLink } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface CertificateCardProps {
  certificate: Certificate;
  isPreviewMode?: boolean;
}

export const CertificateCard: React.FC<CertificateCardProps> = ({ certificate, isPreviewMode = false }) => {
  const { foundationInfo, setCurrentView, setSelectedCertificateToView } = useApp();
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const verifyUrl = `${window.location.origin}?verify=${encodeURIComponent(certificate.certificateNo)}`;
    QRCode.toDataURL(verifyUrl, {
      width: 140,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch((err) => console.error('QR code generation error:', err));
  }, [certificate.certificateNo]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}?verify=${encodeURIComponent(certificate.certificateNo)}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-5xl mx-auto">
      {/* Top Action Bar (hidden in print) */}
      {!isPreviewMode && (
        <div className="w-full flex flex-wrap items-center justify-between gap-3 p-4 mb-4 bg-white rounded-xl shadow-xs border border-slate-200 print:hidden">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Official ISO/Govt. Reg. Verified Certificate
            </span>
            <span className="text-xs text-slate-500 font-mono hidden sm:inline">
              Hash: {certificate.verificationHash.substring(0, 12)}...
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              {copied ? 'Link Copied!' : 'Copy Verify URL'}
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save as PDF
            </button>
          </div>
        </div>
      )}

      {/* Main Authentic Certificate Canvas (A4 Landscape aspect ratio matching Reference Picture 2) */}
      <div
        ref={certRef}
        id={`certificate-${certificate.certificateNo.replace(/\//g, '-')}`}
        className="certificate-print-container relative w-full bg-[#fcfbf7] border-[10px] border-[#0a192f] shadow-2xl overflow-hidden text-slate-900 select-none aspect-[1.28/1] min-h-[580px] p-6 md:p-10 flex flex-col justify-between"
        style={{
          boxShadow: '0 25px 50px -12px rgba(10, 25, 47, 0.25)',
        }}
      >
        {/* Background Texture & Watermark */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.035] flex items-center justify-center">
          <svg width="450" height="450" viewBox="0 0 400 400" className="rotate-[-15deg]">
            <circle cx="200" cy="200" r="180" fill="none" stroke="#000" strokeWidth="20" />
            <text x="200" y="210" textAnchor="middle" fontSize="32" fontWeight="900">
              JEEB SEVA SHIB SEVA FOUNDATION
            </text>
          </svg>
        </div>

        {/* Ornate Gold & Navy Corner Geometries (Reference Picture 2 exact styling) */}
        {/* Top-Left Corner Navy/Gold Ribbon Shapes */}
        <div className="absolute top-0 left-0 w-36 h-36 md:w-48 md:h-48 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 200 200">
            <polygon points="0,0 200,0 0,200" fill="#0c1e36" />
            <polygon points="0,0 150,0 0,150" fill="#142c4c" />
            <line x1="0" y1="170" x2="170" y2="0" stroke="#d4af37" strokeWidth="6" />
            <line x1="0" y1="185" x2="185" y2="0" stroke="#b8860b" strokeWidth="2" />
            <polygon points="12,12 188,12 12,188" fill="none" stroke="#e5c07b" strokeWidth="1" opacity="0.4" />
          </svg>
        </div>

        {/* Bottom-Right Corner Navy/Gold Ribbon Shapes */}
        <div className="absolute bottom-0 right-0 w-36 h-36 md:w-52 md:h-52 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 200 200">
            <polygon points="200,200 0,200 200,0" fill="#0c1e36" />
            <polygon points="200,200 50,200 200,50" fill="#142c4c" />
            <line x1="200" y1="30" x2="30" y2="200" stroke="#d4af37" strokeWidth="6" />
            <line x1="200" y1="15" x2="15" y2="200" stroke="#b8860b" strokeWidth="2" />
            <polygon points="188,188 12,188 188,12" fill="none" stroke="#e5c07b" strokeWidth="1" opacity="0.4" />
          </svg>
        </div>

        {/* Inner Gold Thin Border Frame */}
        <div className="absolute inset-3.5 md:inset-5 border-2 border-[#d4af37] pointer-events-none z-10" />
        <div className="absolute inset-5 md:inset-7 border border-[#e5c07b] opacity-60 pointer-events-none z-10" />

        {/* TOP LEFT: Golden Rosette Medal with Ribbon (Reference Picture 2) */}
        <div className="absolute top-4 left-6 md:top-6 md:left-9 z-20 flex flex-col items-center">
          {/* Blue hanging ribbon tails */}
          <div className="relative">
            <div className="w-16 h-20 md:w-20 md:h-24 bg-[#0c1e36] absolute top-8 -left-3 shadow-md transform -rotate-12 [clip-path:polygon(0_0,100%_0,100%_100%,50%_80%,0_100%)] border-l-2 border-r-2 border-[#d4af37]" />
            <div className="w-16 h-20 md:w-20 md:h-24 bg-[#0c1e36] absolute top-8 left-3 shadow-md transform rotate-12 [clip-path:polygon(0_0,100%_0,100%_100%,50%_80%,0_100%)] border-l-2 border-r-2 border-[#d4af37]" />
          </div>

          {/* Golden Medallion Badge */}
          <div className="relative w-16 h-16 md:w-22 md:h-22 rounded-full bg-radial from-[#fef08a] via-[#eab308] to-[#ca8a04] p-1 shadow-lg flex items-center justify-center border-2 border-[#b45309]">
            <div className="w-full h-full rounded-full border border-dashed border-[#78350f] flex flex-col items-center justify-center text-center p-1 bg-gradient-to-b from-[#fef9c3] to-[#fde047]">
              <span className="text-[7px] md:text-[8px] font-black text-[#78350f] tracking-tighter leading-tight uppercase">
                COMMITMENT
              </span>
              <span className="text-[7px] md:text-[8px] font-black text-[#0c1e36] tracking-tighter leading-tight uppercase my-0.5">
                KNOWLEDGE
              </span>
              <span className="text-[7px] md:text-[8px] font-black text-[#78350f] tracking-tighter leading-tight uppercase">
                IMPACT
              </span>
              <div className="text-[9px] text-[#b45309]">★ ★ ★</div>
            </div>
          </div>
        </div>

        {/* TOP RIGHT: Certificate ID & Flourish */}
        <div className="absolute top-5 right-6 md:top-8 md:right-10 z-20 text-right">
          <div className="text-[9px] md:text-[11px] font-bold tracking-widest text-slate-500 uppercase">
            CERTIFICATE ID
          </div>
          <div className="text-sm md:text-base font-extrabold font-mono text-[#0c1e36] tracking-wider">
            {certificate.certificateNo}
          </div>
          {/* Gold flourish divider */}
          <div className="flex items-center justify-end gap-1 mt-0.5 text-[#d4af37]">
            <span className="h-[1px] w-6 bg-[#d4af37]" />
            <span className="text-xs">❦</span>
            <span className="h-[1px] w-6 bg-[#d4af37]" />
          </div>
        </div>

        {/* HEADER SECTION: JSSS Foundation Crest & Name */}
        <div className="relative z-20 text-center pt-2 md:pt-4 max-w-xl mx-auto">
          {/* Top Crest / Open Book & Wings */}
          <div className="flex justify-center mb-1">
            <svg width="44" height="34" viewBox="0 0 100 80" className="text-[#0c1e36]">
              <path
                d="M50,15 Q30,35 10,25 Q30,55 50,70 Q70,55 90,25 Q70,35 50,15 Z"
                fill="#0c1e36"
              />
              <path
                d="M50,20 Q35,35 20,30 Q35,50 50,62 Q65,50 80,30 Q65,35 50,20 Z"
                fill="#d4af37"
              />
              <circle cx="50" cy="8" r="4" fill="#d4af37" />
              <polygon points="35,18 38,24 44,24 39,28 41,34 35,30 29,34 31,28 26,24 32,24" fill="#d4af37" transform="scale(0.5) translate(40, -10)" />
              <polygon points="35,18 38,24 44,24 39,28 41,34 35,30 29,34 31,28 26,24 32,24" fill="#d4af37" transform="scale(0.5) translate(80, -10)" />
            </svg>
          </div>

          <h2 className="text-lg md:text-2xl font-black tracking-widest text-[#0c1e36] font-['Cinzel',serif] uppercase">
            JSSS FOUNDATION
          </h2>
          <p className="text-[8px] md:text-[10px] font-bold tracking-[0.25em] text-[#b8860b] uppercase mt-0.5">
            EMPOWERING PEOPLE, TRANSFORMING LIVES
          </p>
        </div>

        {/* MAIN BODY: Certificate Title & Student Presentation */}
        <div className="relative z-20 text-center my-auto px-4 md:px-12">
          {/* Big Certificate Title */}
          <div className="relative inline-block my-1 md:my-2">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-[0.08em] text-[#0c1e36] font-['Playfair_Display',serif] uppercase">
              CERTIFICATE
            </h1>
            <div className="flex items-center justify-center gap-2 md:gap-4 mt-0.5">
              <span className="h-[2px] w-12 md:w-20 bg-[#d4af37]" />
              <span className="text-[10px] md:text-xs font-bold tracking-[0.3em] text-[#d4af37] uppercase">
                OF COMPLETION
              </span>
              <span className="h-[2px] w-12 md:w-20 bg-[#d4af37]" />
            </div>
          </div>

          <p className="text-[10px] md:text-xs font-bold tracking-widest text-slate-500 uppercase mt-2 md:mt-3">
            THIS CERTIFICATE IS PROUDLY PRESENTED TO
          </p>

          {/* Student Name in Signature Calligraphy Script */}
          <div className="my-2 md:my-3">
            <div className="text-3xl md:text-5xl lg:text-6xl font-normal text-[#0c1e36] font-['Alex_Brush','Great_Vibes',cursive] tracking-wide py-1 drop-shadow-xs">
              {certificate.studentName}
            </div>
            {/* Center Ornate Divider */}
            <div className="flex items-center justify-center gap-2 text-[#d4af37] my-1">
              <span className="h-[1px] w-16 md:w-32 bg-[#d4af37]" />
              <span className="text-sm">❦</span>
              <span className="h-[1px] w-16 md:w-32 bg-[#d4af37]" />
            </div>
          </div>

          {/* Course Details Text */}
          <p className="text-[11px] md:text-sm text-slate-700 max-w-2xl mx-auto leading-relaxed font-['Montserrat',sans-serif]">
            for successfully completing the vocational course on{' '}
            <span className="font-bold text-[#0c1e36] block md:inline text-xs md:text-base">
              ‘{certificate.courseName}’
            </span>{' '}
            organized by <span className="font-semibold text-slate-900">JSSS Foundation</span> from{' '}
            <span className="font-medium text-slate-800">{certificate.courseDuration || certificate.issueDate}</span>.
            We appreciate your dedication, active participation and commitment to excellence.
          </p>

          <div className="mt-1 text-[10px] md:text-xs font-bold text-emerald-800 tracking-wider">
            Grade Achieved: <span className="px-2 py-0.5 bg-amber-100/80 text-amber-900 rounded-sm border border-amber-300 font-extrabold">{certificate.grade || 'A+ (Distinction)'}</span>
            <span className="mx-2 text-slate-400">•</span>
            Registration No: <span className="font-mono font-bold text-slate-800">{certificate.studentRegNo}</span>
          </div>
        </div>

        {/* FOOTER SECTION: QR Code, Gold Medallion & Official Signatures */}
        <div className="relative z-20 grid grid-cols-3 items-end pt-3 md:pt-4 border-t border-slate-200/80">
          {/* Left: QR Code Scan to Verify */}
          <div className="flex items-center gap-2 md:gap-3 pl-2">
            <div className="p-1 bg-white border border-slate-300 rounded shadow-xs shrink-0">
              {qrCodeDataUrl ? (
                <img
                  src={qrCodeDataUrl}
                  alt="Certificate Verification QR Code"
                  className="w-12 h-12 md:w-16 md:h-16"
                />
              ) : (
                <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-100 flex items-center justify-center text-[8px]">
                  QR Code
                </div>
              )}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[8px] md:text-[9px] font-black tracking-widest text-[#0c1e36] uppercase leading-none">
                SCAN TO VERIFY
              </span>
              <span className="text-[7px] md:text-[8px] text-slate-500 font-mono mt-0.5">
                Official Digital Record
              </span>
              <span className="text-[7px] md:text-[8px] text-emerald-700 font-bold flex items-center gap-0.5 mt-0.5">
                <CheckCircle className="w-2.5 h-2.5" /> Authentic
              </span>
            </div>
          </div>

          {/* Center: Gold Medallion (LEARN • GROW • SUCCEED) */}
          <div className="flex flex-col items-center justify-center">
            <div className="w-14 h-14 md:w-18 md:h-18 rounded-full bg-gradient-to-b from-[#fde047] via-[#ca8a04] to-[#78350f] p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-[#0c1e36] flex flex-col items-center justify-center text-center p-1 border border-[#eab308]">
                <span className="text-[9px] text-[#fde047]">👑</span>
                <span className="text-[6px] md:text-[7px] font-black text-[#fde047] tracking-tighter uppercase leading-tight">
                  LEARN
                </span>
                <span className="text-[6px] md:text-[7px] font-black text-white tracking-tighter uppercase leading-tight">
                  GROW
                </span>
                <span className="text-[6px] md:text-[7px] font-black text-[#fde047] tracking-tighter uppercase leading-tight">
                  SUCCEED
                </span>
                <span className="text-[6px] text-[#eab308]">★</span>
              </div>
            </div>
          </div>

          {/* Right: Two Director Signatures (Soumen Ghosh & Subrata Roy) */}
          <div className="flex items-center justify-end gap-3 md:gap-6 pr-2">
            {/* Director 1: Soumen Ghosh */}
            <div className="flex flex-col items-center text-center">
              <div className="font-['Alex_Brush','Great_Vibes',cursive] text-lg md:text-2xl text-[#0c1e36] font-bold leading-none -mb-1 transform -rotate-3">
                Soumen Ghosh
              </div>
              <div className="w-20 md:w-28 h-[1.5px] bg-[#d4af37] my-1" />
              <div className="text-[9px] md:text-[11px] font-bold text-[#0c1e36]">
                {certificate.signatoryDirector || 'Soumen Ghosh'}
              </div>
              <div className="text-[7px] md:text-[9px] text-slate-500 font-medium">Director</div>
            </div>

            {/* Director 2: Subrata Roy */}
            <div className="flex flex-col items-center text-center">
              <div className="font-['Alex_Brush','Great_Vibes',cursive] text-lg md:text-2xl text-[#0c1e36] font-bold leading-none -mb-1 transform -rotate-3">
                Subrata Roy
              </div>
              <div className="w-20 md:w-28 h-[1.5px] bg-[#d4af37] my-1" />
              <div className="text-[9px] md:text-[11px] font-bold text-[#0c1e36]">
                {certificate.signatoryProjectDirector || 'Subrata Roy'}
              </div>
              <div className="text-[7px] md:text-[9px] text-slate-500 font-medium">Project Director</div>
            </div>
          </div>
        </div>

        {/* Micro Legal Footnote */}
        <div className="text-center text-[7px] md:text-[8px] text-slate-400 mt-1">
          {foundationInfo.legalName} • Regd. Under Section 8 Companies Act 2013 • CIN: {foundationInfo.cin} • Verify at jsssfoundation.in
        </div>
      </div>
    </div>
  );
};
