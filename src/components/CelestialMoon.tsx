import React from 'react';

interface CelestialMoonProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  showStardust?: boolean;
}

export const CelestialMoon: React.FC<CelestialMoonProps> = ({
  size = 'md',
  className = '',
  onClick,
  showStardust = true,
}) => {
  const sizeMap = {
    sm: 'w-24 h-24',
    md: 'w-32 h-32 sm:w-40 sm:h-40',
    lg: 'w-40 h-40 sm:w-48 sm:h-48',
  };

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex items-center justify-center select-none group cursor-pointer transition-transform duration-500 hover:scale-105 active:scale-95 ${className}`}
    >
      {/* Outer Ethereal Sunlight & Sky Corona Glow */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-300/30 via-sky-400/25 to-rose-300/25 blur-2xl animate-pulse -z-10" />
      <div className="absolute -inset-3 rounded-full bg-amber-200/20 blur-xl animate-moon -z-10" />

      {/* SVG Detailed Sunlit Crescent with Garden Gold & Daylight Sky */}
      <div className={`${sizeMap[size]} relative filter drop-shadow-[0_0_35px_rgba(251,191,36,0.6)]`}>
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full overflow-visible"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle translucent sky halo */}
          <circle
            cx="100"
            cy="100"
            r="82"
            fill="rgba(224, 242, 254, 0.35)"
            stroke="rgba(56, 189, 248, 0.3)"
            strokeWidth="1.2"
          />

          {/* Crescent Moon Arc (Natural illuminated side) */}
          <path
            d="M 100 18 C 145 18, 182 55, 182 100 C 182 145, 145 182, 100 182 C 128 152, 140 120, 140 100 C 140 80, 128 48, 100 18 Z"
            fill="url(#moonSurfaceGrad)"
            stroke="url(#moonRimGrad)"
            strokeWidth="1.5"
          />

          {/* Soft Lunar Mare & Craters on the crescent */}
          {/* Crater 1 (Upper) */}
          <ellipse cx="146" cy="72" rx="6" ry="9" fill="#e2d4b7" fillOpacity="0.45" />
          <ellipse cx="147" cy="71" rx="4" ry="7" fill="#d4c3a3" fillOpacity="0.3" />

          {/* Crater 2 (Middle Mare) */}
          <ellipse cx="156" cy="104" rx="8" ry="14" fill="#decfae" fillOpacity="0.4" />
          <ellipse cx="157" cy="103" rx="5" ry="10" fill="#cca87a" fillOpacity="0.25" />

          {/* Crater 3 (Lower) */}
          <ellipse cx="140" cy="138" rx="7" ry="10" fill="#e2d4b7" fillOpacity="0.45" />
          <ellipse cx="141" cy="137" rx="4.5" ry="7" fill="#cca87a" fillOpacity="0.3" />

          {/* Micro Craters */}
          <circle cx="163" cy="85" r="3" fill="#cfbe9b" fillOpacity="0.35" />
          <circle cx="150" cy="122" r="3.5" fill="#cfbe9b" fillOpacity="0.35" />

          {/* Luminous Inner Highlight Curve */}
          <path
            d="M 104 26 C 142 42, 172 70, 174 100 C 172 130, 142 158, 104 174 C 124 148, 134 122, 134 100 C 134 78, 124 52, 104 26 Z"
            fill="none"
            stroke="url(#moonInnerGlow)"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.8"
          />

          {/* Tiny companion sparkle resting in crescent cradle */}
          <g className="animate-pulse">
            <circle cx="82" cy="98" r="2.5" fill="#ffffff" />
            <line x1="82" y1="91" x2="82" y2="105" stroke="#fef08a" strokeWidth="0.8" />
            <line x1="75" y1="98" x2="89" y2="98" stroke="#fef08a" strokeWidth="0.8" />
          </g>

          {/* Moon Gradients */}
          <defs>
            <linearGradient id="moonSurfaceGrad" x1="100" y1="18" x2="182" y2="182" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fffbeb" /> {/* Soft cream */}
              <stop offset="35%" stopColor="#fef3c7" /> {/* Champagne ivory */}
              <stop offset="70%" stopColor="#fde68a" /> {/* Warm gold */}
              <stop offset="100%" stopColor="#fcd34d" /> {/* Amber */}
            </linearGradient>

            <linearGradient id="moonRimGrad" x1="100" y1="18" x2="182" y2="182" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="50%" stopColor="#fef08a" />
              <stop offset="100%" stopColor="#f472b6" />
            </linearGradient>

            <linearGradient id="moonInnerGlow" x1="100" y1="26" x2="174" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#fef08a" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#fda4af" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Floating stardust motes around moon */}
      {showStardust && (
        <div className="absolute inset-0 pointer-events-none">
          <span className="absolute top-1 right-2 w-1.5 h-1.5 rounded-full bg-amber-200 shadow-[0_0_6px_#fef08a] animate-ping" />
          <span className="absolute bottom-3 left-4 w-1 h-1 rounded-full bg-pink-300 shadow-[0_0_6px_#f472b6] animate-pulse" />
          <span className="absolute top-1/2 -right-3 w-1.5 h-1.5 rounded-full bg-amber-300 shadow-[0_0_8px_#fbbf24] animate-bounce" />
        </div>
      )}
    </div>
  );
};
