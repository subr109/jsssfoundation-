import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', showText = true }) => {
  const sizeMap = {
    sm: { dimension: 40, textTitle: 'text-sm', textSub: 'text-[9px]' },
    md: { dimension: 56, textTitle: 'text-base font-bold', textSub: 'text-[10px]' },
    lg: { dimension: 76, textTitle: 'text-xl font-extrabold', textSub: 'text-xs' },
    xl: { dimension: 110, textTitle: 'text-2xl font-black', textSub: 'text-sm' },
  };

  const { dimension, textTitle, textSub } = sizeMap[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* High-Fidelity SVG of JSSS Foundation Emblem (Reference Picture 1) */}
      <svg
        width={dimension}
        height={dimension}
        viewBox="0 0 400 400"
        className="shrink-0 drop-shadow-sm transition-transform hover:scale-105 duration-200"
      >
        <defs>
          <linearGradient id="jsssGreenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="50%" stopColor="#059669" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>
          <linearGradient id="jsssLeafGrad" x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="50%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#065f46" />
          </linearGradient>
          <path id="jsssTopTextPath" d="M 60,200 A 140,140 0 1,1 340,200" fill="none" />
          <path id="jsssBottomTextPath" d="M 330,205 A 130,130 0 0,1 70,205" fill="none" />
        </defs>

        {/* Outer White Circular Base */}
        <circle cx="200" cy="200" r="192" fill="#ffffff" stroke="#e2e8f0" strokeWidth="2" />

        {/* Outer Bold Green Ring */}
        <circle
          cx="200"
          cy="200"
          r="165"
          fill="none"
          stroke="url(#jsssGreenGrad)"
          strokeWidth="48"
        />

        {/* Top Text along Path: JEEB SEVA SHIB SEVA FOUNDATION */}
        <text fill="#ffffff" fontSize="23" fontWeight="800" letterSpacing="3.5" fontFamily="system-ui, sans-serif">
          <textPath href="#jsssTopTextPath" startOffset="50%" textAnchor="middle">
            JEEB SEVA SHIB SEVA FOUNDATION
          </textPath>
        </text>

        {/* Bottom Text along Path: HELPING HAND with Stars */}
        <text fill="#ffffff" fontSize="25" fontWeight="900" letterSpacing="4.5" fontFamily="system-ui, sans-serif">
          <textPath href="#jsssBottomTextPath" startOffset="50%" textAnchor="middle">
            ★  HELPING HAND  ★
          </textPath>
        </text>

        {/* Center Inner Circle */}
        <circle cx="200" cy="200" r="138" fill="#ffffff" />

        {/* Center Emblem: Stylized Hand & Two Sprouting Leaves */}
        <g transform="translate(10, 5)">
          {/* Main Large Leaf */}
          <path
            d="M 120,105 C 190,95 245,140 230,195 C 195,200 135,170 120,105 Z"
            fill="url(#jsssLeafGrad)"
          />
          <path
            d="M 130,115 Q 185,150 220,190"
            stroke="#ecfdf5"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
            opacity="0.8"
          />

          {/* Smaller Secondary Leaf */}
          <path
            d="M 235,105 C 275,120 280,165 250,185 C 235,165 230,130 235,105 Z"
            fill="url(#jsssLeafGrad)"
          />

          {/* Supporting Gentle Hand */}
          <path
            d="M 185,240 C 230,235 270,205 285,190 C 270,195 240,210 220,210 C 205,210 190,200 240,180 C 220,185 200,200 185,210 C 180,213 170,225 185,240 Z"
            fill="url(#jsssGreenGrad)"
          />
          <path
            d="M 175,235 C 225,235 275,200 285,185 C 270,200 240,220 200,225 C 175,228 170,230 175,235 Z"
            fill="#047857"
          />
        </g>

        {/* Green Arch Below Motif */}
        <path
          d="M 115,280 C 155,240 245,240 285,280"
          stroke="url(#jsssGreenGrad)"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />

        {/* JSSS FOUNDATION Banner in Center Base */}
        <text
          x="200"
          y="302"
          textAnchor="middle"
          fontSize="22"
          fontWeight="900"
          fill="#1e3a8a"
          letterSpacing="1.2"
          fontFamily="system-ui, sans-serif"
        >
          JSSS FOUNDATION
        </text>
        <text
          x="200"
          y="318"
          textAnchor="middle"
          fontSize="10"
          fontWeight="700"
          fill="#059669"
          letterSpacing="1.5"
          fontFamily="system-ui, sans-serif"
        >
          ACADEMY & VOCATIONAL WING
        </text>
      </svg>

      {showText && (
        <div className="flex flex-col">
          <span className={`tracking-tight text-slate-900 leading-none ${textTitle}`}>
            JSSS FOUNDATION <span className="text-emerald-600 font-extrabold">ACADEMY</span>
          </span>
          <span className={`text-slate-500 font-medium tracking-wide mt-1 leading-tight ${textSub}`}>
            JEEB SEVA SHIB SEVA FOUNDATION
          </span>
          <span className="text-[9px] text-emerald-700 font-semibold uppercase tracking-wider">
            Govt. Registered Sec. 8 Non-Profit • CIN: U85300WB2021NPL248962
          </span>
        </div>
      )}
    </div>
  );
};
