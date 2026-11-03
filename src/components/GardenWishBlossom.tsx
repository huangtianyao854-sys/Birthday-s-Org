import React from 'react';
import { Sparkles, Heart } from 'lucide-react';

interface GardenWishBlossomProps {
  onClick?: () => void;
  className?: string;
  isTapped?: boolean;
}

export const GardenWishBlossom: React.FC<GardenWishBlossomProps> = ({
  onClick,
  className = '',
  isTapped = false,
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
      aria-label="Enchanted Garden Wishing Blossom"
      className={`group relative flex flex-col items-center justify-center cursor-pointer transition-transform duration-300 select-none ${
        isTapped ? 'scale-110' : 'hover:scale-105 active:scale-95'
      } ${className}`}
    >
      {/* Sunlit Amber & Rose Aura Glow */}
      <div className="absolute inset-0 -m-8 rounded-full bg-gradient-to-tr from-rose-400/35 via-amber-300/30 to-sky-300/35 blur-3xl animate-pulse pointer-events-none" />

      {/* Outer Petal Ring */}
      <div className="relative w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 rounded-full flex items-center justify-center p-3 bg-gradient-to-br from-white/95 via-rose-50/90 to-amber-50/95 shadow-2xl border-2 border-rose-300/70 backdrop-blur-md">
        
        {/* Soft border ring */}
        <div className="absolute inset-1.5 rounded-full border border-rose-300/40 pointer-events-none" />

        {/* Petal halo */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="absolute -top-3 text-2xl filter drop-shadow">🌸</span>
          <span className="absolute -bottom-3 text-2xl filter drop-shadow">🌺</span>
          <span className="absolute -left-3 text-2xl filter drop-shadow">🌹</span>
          <span className="absolute -right-3 text-2xl filter drop-shadow">🌸</span>
        </div>

        {/* Heart Center of Blossom */}
        <div className="relative w-full h-full rounded-full bg-gradient-to-b from-rose-100 via-rose-50 to-amber-100 flex flex-col items-center justify-center border border-rose-200/80 shadow-inner text-center p-4">
          <div className="relative">
            <span className="text-4xl sm:text-5xl md:text-6xl filter drop-shadow-md transition-transform group-hover:scale-110 inline-block">
              🌸
            </span>
            <Sparkles className="w-5 h-5 text-amber-500 absolute -top-1 -right-2" />
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 absolute -bottom-1 -left-1" />
          </div>

          <span className="text-xs sm:text-sm font-burmese font-semibold text-rose-950 mt-1">
            ဆုတောင်းပန်းပွင့်
          </span>
          <span className="text-[10px] sm:text-xs text-rose-800 font-medium">
            Tap for Whisper
          </span>
        </div>
      </div>
    </div>
  );
};
