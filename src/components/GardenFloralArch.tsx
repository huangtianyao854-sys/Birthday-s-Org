import React from 'react';
import { Heart, Sparkles } from 'lucide-react';

interface GardenFloralArchProps {
  onClick?: () => void;
  className?: string;
}

export const GardenFloralArch: React.FC<GardenFloralArchProps> = ({
  onClick,
  className = '',
}) => {
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      aria-label="Enter the Dreamy Rose Garden"
      className={`group relative flex flex-col items-center justify-center cursor-pointer transition-transform duration-500 hover:scale-105 active:scale-95 select-none ${className}`}
    >
      {/* Outer Warm Golden Sunbeam Glow */}
      <div className="absolute inset-0 -m-8 rounded-full bg-gradient-to-tr from-rose-400/25 via-amber-300/30 to-sky-300/25 blur-3xl animate-pulse pointer-events-none" />

      {/* Main White Wooden Trellis Arch Frame */}
      <div className="relative w-56 h-60 sm:w-64 sm:h-68 md:w-72 md:h-76 flex flex-col items-center justify-end pb-3">
        {/* SVG White Classical Garden Trellis Archway */}
        <svg
          viewBox="0 0 300 320"
          className="absolute inset-0 w-full h-full drop-shadow-2xl pointer-events-none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* White Wood Trellis Gradient */}
            <linearGradient id="whiteWoodGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="50%" stopColor="#fdfbf7" />
              <stop offset="100%" stopColor="#f1ede6" />
            </linearGradient>

            {/* Trellis Wood Shadow */}
            <linearGradient id="woodShadowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#e5e0d8" />
              <stop offset="100%" stopColor="#d4cdbf" />
            </linearGradient>
          </defs>

          {/* Left Arch Column */}
          <rect x="42" y="110" width="16" height="195" rx="3" fill="url(#whiteWoodGrad)" stroke="#dcd6cb" strokeWidth="2" />
          <rect x="36" y="295" width="28" height="16" rx="2" fill="url(#woodShadowGrad)" />
          <rect x="38" y="105" width="24" height="10" rx="2" fill="url(#woodShadowGrad)" />

          {/* Right Arch Column */}
          <rect x="242" y="110" width="16" height="195" rx="3" fill="url(#whiteWoodGrad)" stroke="#dcd6cb" strokeWidth="2" />
          <rect x="236" y="295" width="28" height="16" rx="2" fill="url(#woodShadowGrad)" />
          <rect x="238" y="105" width="24" height="10" rx="2" fill="url(#woodShadowGrad)" />

          {/* Latticed Curved Top Arch Vault */}
          <path
            d="M 50 110 C 50 25, 250 25, 250 110"
            stroke="url(#whiteWoodGrad)"
            strokeWidth="18"
            strokeLinecap="round"
          />
          <path
            d="M 50 110 C 50 25, 250 25, 250 110"
            stroke="#dcd6cb"
            strokeWidth="2"
            fill="none"
          />

          {/* Inner Decorative Arch Curve */}
          <path
            d="M 64 110 C 64 45, 236 45, 236 110"
            stroke="url(#woodShadowGrad)"
            strokeWidth="4"
            fill="none"
          />

          {/* Trellis Lattice Cross-Ribs */}
          <line x1="90" y1="62" x2="105" y2="40" stroke="#dcd6cb" strokeWidth="3" />
          <line x1="125" y1="45" x2="135" y2="28" stroke="#dcd6cb" strokeWidth="3" />
          <line x1="165" y1="28" x2="175" y2="45" stroke="#dcd6cb" strokeWidth="3" />
          <line x1="195" y1="40" x2="210" y2="62" stroke="#dcd6cb" strokeWidth="3" />
        </svg>

        {/* Abundant Blooming English Roses Entwined Along the Arch */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Top Arch Center Roses */}
          <div className="absolute top-1 left-1/2 -translate-x-1/2 flex items-center gap-1 drop-shadow-md">
            <span className="text-2xl filter drop-shadow">🌹</span>
            <span className="text-3xl filter drop-shadow">🌸</span>
            <span className="text-2xl filter drop-shadow">🌹</span>
          </div>

          {/* Left Upper Curve Blooms */}
          <div className="absolute top-6 left-12 flex flex-col items-center drop-shadow-md">
            <span className="text-2xl filter drop-shadow">🌺</span>
            <span className="text-lg -mt-1 filter drop-shadow">🌿</span>
          </div>

          {/* Right Upper Curve Blooms */}
          <div className="absolute top-6 right-12 flex flex-col items-center drop-shadow-md">
            <span className="text-2xl filter drop-shadow">🌸</span>
            <span className="text-lg -mt-1 filter drop-shadow">🌿</span>
          </div>

          {/* Left Pillar Climbing Blooms */}
          <div className="absolute top-28 left-6 flex flex-col items-center gap-1.5 drop-shadow">
            <span className="text-xl">🌹</span>
            <span className="text-base">🌸</span>
            <span className="text-sm">🌿</span>
            <span className="text-lg">🌺</span>
          </div>

          {/* Right Pillar Climbing Blooms */}
          <div className="absolute top-28 right-6 flex flex-col items-center gap-1.5 drop-shadow">
            <span className="text-xl">🌸</span>
            <span className="text-base">🌹</span>
            <span className="text-sm">🌿</span>
            <span className="text-lg">🌹</span>
          </div>

          {/* Hanging Mini Glass Lantern Under Keystone */}
          <div className="absolute top-16 left-1/2 -translate-x-1/2 flex flex-col items-center">
            <div className="w-0.5 h-4 bg-slate-600" />
            <div className="w-5 h-7 rounded-md bg-amber-100/90 border border-amber-500/80 shadow-[0_0_12px_rgba(245,158,11,0.6)] flex items-center justify-center animate-flame">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Center Portal Glass Heart Plaque (Translucent to showcase arch and garden) */}
        <div className="relative z-10 w-44 sm:w-48 p-4 rounded-3xl bg-white/50 backdrop-blur-md border border-white/70 shadow-2xl flex flex-col items-center text-center group-hover:border-rose-400 group-hover:bg-white/65 transition-all">
          <div className="relative mb-2">
            <Heart className="w-8 h-8 sm:w-9 sm:h-9 text-rose-600 fill-rose-500 filter drop-shadow-md group-hover:scale-110 transition-transform animate-heartbeat" />
            <Sparkles className="w-3.5 h-3.5 text-amber-500 absolute -top-1 -right-1" />
          </div>

          <span className="text-xs sm:text-sm font-burmese font-semibold text-slate-900 leading-normal">
            နှင်းဆီဥယျာဉ် တံခါးဝ
          </span>
          <span className="text-[11px] sm:text-xs text-rose-700 font-semibold tracking-wide flex items-center gap-1 mt-0.5">
            <span>Tap to Enter</span>
            <span>🌸</span>
          </span>
        </div>
      </div>
    </div>
  );
};
