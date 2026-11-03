import React, { useState } from 'react';
import { Heart, Sparkles, Pause, Play } from 'lucide-react';
import { LoveScrollWish, AppLanguage } from '../config/birthdayConfig';

interface LoveScrollProps {
  wishes?: LoveScrollWish[];
  lang: AppLanguage;
  enabled?: boolean;
}

export const LoveScroll: React.FC<LoveScrollProps> = ({
  wishes = [],
  lang = 'my',
  enabled = true,
}) => {
  const [isPaused, setIsPaused] = useState(false);

  if (!enabled || !wishes || wishes.length === 0) {
    return null;
  }

  // Filter out any empty wishes for current language
  const activeWishes = wishes
    .map((w) => w.text[lang] || w.text.my || w.text.en)
    .filter(Boolean);

  if (activeWishes.length === 0) return null;

  const ICONS = ['✨', '💖', '🌸', '💍', '🌟', '🌹'];

  return (
    <div
      role="region"
      aria-label="Romantic Birthday Wishes Scroll"
      className="fixed bottom-3.5 left-3 sm:left-6 right-28 sm:right-36 z-30 pointer-events-auto select-none transition-all duration-300"
    >
      <div
        className="group relative flex items-center h-8 sm:h-9 rounded-full bg-slate-950/65 hover:bg-slate-950/80 backdrop-blur-md border border-rose-300/35 hover:border-rose-400/50 shadow-lg shadow-rose-950/30 overflow-hidden cursor-pointer"
        onClick={() => setIsPaused((prev) => !prev)}
        title={isPaused ? 'Click to resume scrolling' : 'Click to pause reading'}
      >
        {/* Left Glowing Ribbon Badge */}
        <div className="flex items-center gap-1.5 px-2.5 sm:px-3 h-full bg-gradient-to-r from-rose-500/25 to-pink-500/15 border-r border-rose-300/20 shrink-0 text-rose-200 text-[11px] sm:text-xs font-serif-romantic font-semibold tracking-wide">
          <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400/40 animate-heartbeat shrink-0" />
          <span className="hidden xs:inline">Love Notes</span>
          <span className="text-[10px] text-pink-300/70 sm:hidden">❤️</span>
        </div>

        {/* Marquee Track with Soft Gradient Fade Mask */}
        <div
          className="relative flex-1 h-full flex items-center overflow-hidden"
          style={{
            maskImage: 'linear-gradient(to right, transparent, black 20px, black calc(100% - 20px), transparent)',
            WebkitMaskImage: 'linear-gradient(to right, transparent, black 20px, black calc(100% - 20px), transparent)',
          }}
        >
          <div
            className={`flex items-center gap-6 sm:gap-8 whitespace-nowrap will-change-transform ${
              isPaused ? '' : 'animate-marquee'
            } group-hover:[animation-play-state:paused]`}
          >
            {/* First Set of Wishes */}
            {activeWishes.map((wishText, idx) => (
              <span
                key={`wish-1-${idx}`}
                className="inline-flex items-center gap-2.5 text-xs sm:text-[13px] font-medium text-rose-100 hover:text-white transition-colors"
              >
                <span className="text-[11px] sm:text-xs filter drop-shadow">
                  {ICONS[idx % ICONS.length]}
                </span>
                <span>{wishText}</span>
              </span>
            ))}

            {/* Duplicate Set for Seamless Continuous Loop */}
            {activeWishes.map((wishText, idx) => (
              <span
                key={`wish-2-${idx}`}
                className="inline-flex items-center gap-2.5 text-xs sm:text-[13px] font-medium text-rose-100 hover:text-white transition-colors"
                aria-hidden="true"
              >
                <span className="text-[11px] sm:text-xs filter drop-shadow">
                  {ICONS[idx % ICONS.length]}
                </span>
                <span>{wishText}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Right Pause / Play Indicator Hint */}
        <div className="flex items-center px-2 sm:px-2.5 h-full text-rose-300/60 group-hover:text-rose-200 transition-colors shrink-0">
          {isPaused ? (
            <Play className="w-3 h-3 text-amber-300 animate-pulse" />
          ) : (
            <Pause className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </div>
      </div>
    </div>
  );
};

export default LoveScroll;
