import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  Image as ImageIcon,
  Heart,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Play,
  Pause,
  Maximize2,
  Minimize2,
  Clock,
  RotateCcw
} from 'lucide-react';
import { SupabaseGalleryItem } from '../lib/supabase';
import { AppLanguage } from '../config/birthdayConfig';

interface GalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: SupabaseGalleryItem[];
  lang: AppLanguage;
}

// Fallback romantic memories for Hnin Lae Yee when Supabase has not yet been populated
const DEFAULT_MEMORIES: SupabaseGalleryItem[] = [
  {
    id: 'sample-1',
    image_path: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=1200&auto=format&fit=crop',
    caption: 'တို့နှစ်ယောက်ရဲ့ စတင်တွေ့ဆုံခြင်း အမှတ်တရညလေး (Under the gentle starry sky)',
    display_order: 1,
    created_at: new Date().toISOString()
  },
  {
    id: 'sample-2',
    image_path: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=1200&auto=format&fit=crop',
    caption: 'မနှင်းလေးရဲ့ အပြုံးလေးတွေနဲ့ ပြည့်နှက်နေတဲ့ နွေးထွေးတဲ့ နေ့ရက်များ (Sweet moments together)',
    display_order: 2,
    created_at: new Date().toISOString()
  },
  {
    id: 'sample-3',
    image_path: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?q=80&w=1200&auto=format&fit=crop',
    caption: 'အတူတူ ကြည့်ခဲ့ကြတဲ့ နေဝင်ဆည်းဆာ အလှတရား (Walking side by side into the sunset)',
    display_order: 3,
    created_at: new Date().toISOString()
  },
  {
    id: 'sample-4',
    image_path: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?q=80&w=1200&auto=format&fit=crop',
    caption: 'မွေးနေ့ရက်မြတ်မှာ မနှင်းလေး အမြဲ ပျော်ရွှင်ပါစေ (Happy Birthday, my sweet Baby)',
    display_order: 4,
    created_at: new Date().toISOString()
  },
  {
    id: 'sample-5',
    image_path: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop',
    caption: 'တို့နှစ်ယောက်ရဲ့ ချစ်ခြင်းမေတ္တာ ခရီးစဉ်ဟာ အမြဲတမ်း ဆက်လက်ရှင်သန်နေပါမယ် (Forever and always)',
    display_order: 5,
    created_at: new Date().toISOString()
  }
];

export const GalleryModal: React.FC<GalleryModalProps> = ({
  isOpen,
  onClose,
  items,
  lang,
}) => {
  // Use user-provided items if present, otherwise romantic presets
  const displayItems = items && items.length > 0 ? items : DEFAULT_MEMORIES;

  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [slideSpeed, setSlideSpeed] = useState<number>(4000); // 4 seconds default
  const [progress, setProgress] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartXRef = useRef<number | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Reset states when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setSelectedIdx(null);
      setIsPlaying(false);
      setProgress(0);
    }
  }, [isOpen]);

  const handleNext = useCallback(() => {
    setProgress(0);
    setSelectedIdx((prev) => {
      if (prev === null) return 0;
      if (prev < displayItems.length - 1) return prev + 1;
      return 0; // Loop seamlessly to start
    });
  }, [displayItems.length]);

  const handlePrev = useCallback(() => {
    setProgress(0);
    setSelectedIdx((prev) => {
      if (prev === null) return 0;
      if (prev > 0) return prev - 1;
      return displayItems.length - 1; // Loop to end
    });
  }, [displayItems.length]);

  // Slideshow auto-advance timer and progress animation
  useEffect(() => {
    if (selectedIdx === null || !isPlaying) {
      setProgress(0);
      return;
    }

    const startTime = Date.now();
    const intervalMs = 50;

    const intervalTimer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentProgress = Math.min((elapsed / slideSpeed) * 100, 100);
      setProgress(currentProgress);

      if (elapsed >= slideSpeed) {
        clearInterval(intervalTimer);
        handleNext();
      }
    }, intervalMs);

    return () => {
      clearInterval(intervalTimer);
    };
  }, [selectedIdx, isPlaying, slideSpeed, handleNext]);

  // Auto-hide controls when playing slideshow after inactivity
  const handleUserActivity = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3500);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen || selectedIdx === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      handleUserActivity();
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      } else if (e.key === 'Escape') {
        if (isFullscreen) {
          if (document.exitFullscreen) {
            document.exitFullscreen().catch(() => {});
          }
          setIsFullscreen(false);
        } else {
          setSelectedIdx(null);
          setIsPlaying(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIdx, isFullscreen, handleNext, handlePrev, isPlaying]);

  // Touch Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    handleUserActivity();
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndX;

    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        // Swiped left -> next
        handleNext();
      } else {
        // Swiped right -> prev
        handlePrev();
      }
    }
    touchStartXRef.current = null;
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().then(() => {
        setIsFullscreen(true);
      }).catch(() => {
        setIsFullscreen(true);
      });
    } else {
      document.exitFullscreen?.().then(() => {
        setIsFullscreen(false);
      }).catch(() => {
        setIsFullscreen(false);
      });
    }
  };

  // Start slideshow from beginning
  const startSlideshow = () => {
    setSelectedIdx(0);
    setIsPlaying(true);
    setProgress(0);
  };

  if (!isOpen) return null;

  const currentItem = selectedIdx !== null ? displayItems[selectedIdx] : null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm animate-fade-in select-none cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-panel w-full max-w-4xl max-h-[92vh] rounded-3xl p-4 sm:p-7 overflow-y-auto flex flex-col border border-pink-500/30 text-slate-100 shadow-2xl relative cursor-default"
      >
        {/* Header with Title and Start Slideshow Button */}
        <div className="flex items-center justify-between pb-4 border-b border-pink-500/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-pink-500/20 border border-pink-400/40 flex items-center justify-center text-pink-300 shadow-md glow-rose">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-serif-romantic tracking-wide font-semibold text-pink-200">
                  {lang === 'my'
                    ? 'မနှင်းလေး နှင့် ကိုကို့ရဲ့ အမှတ်တရပုံရိပ်များ'
                    : lang === 'ko'
                    ? '우리의 소중한 추억 갤러리'
                    : lang === 'zh'
                    ? '我们的珍贵回忆相册'
                    : 'Our Precious Memories Gallery'}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 text-[10px] font-mono border border-pink-500/30">
                  {displayItems.length}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-pink-300/70">
                {lang === 'my'
                  ? 'အတူတူ ဖန်တီးခဲ့တဲ့ အလှပဆုံး အခိုက်အတန့်များ'
                  : lang === 'ko'
                  ? '함께 만들어온 가장 눈부신 순간들'
                  : lang === 'zh'
                  ? '携手走过的每一个温柔瞬间'
                  : 'Precious moments captured in love'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Auto-Playing Slideshow Launcher Button */}
            <button
              onClick={startSlideshow}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white text-xs font-semibold shadow-lg hover:shadow-pink-500/30 active:scale-95 transition-all cursor-pointer glow-rose"
              title="Start auto-playing slideshow"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">
                {lang === 'my'
                  ? 'Slideshow ပြသမည်'
                  : lang === 'ko'
                  ? '슬라이드쇼 재생'
                  : lang === 'zh'
                  ? '播放幻灯片'
                  : 'Start Slideshow'}
              </span>
              <span className="sm:hidden">Play</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="py-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {displayItems.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => {
                  setSelectedIdx(idx);
                  setIsPlaying(false);
                  setProgress(0);
                }}
                className="group relative rounded-2xl overflow-hidden border border-pink-400/30 aspect-square cursor-pointer shadow-md hover:border-pink-300 hover:scale-[1.02] transition-all bg-slate-900/60"
              >
                <img
                  src={item.image_path}
                  alt={item.caption || 'Memory'}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2.5 flex flex-col justify-end">
                  <p className="text-xs text-pink-200 line-clamp-2 font-serif-romantic">
                    {item.caption || 'Our Sweet Memory'}
                  </p>
                  <div className="mt-1 flex items-center justify-between text-[10px] text-pink-300/80">
                    <span>#{idx + 1}</span>
                    <span className="flex items-center gap-0.5 text-pink-400">
                      <Heart className="w-3 h-3 fill-pink-400/60" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {items && items.length === 0 && (
            <p className="text-center text-[11px] text-pink-300/50 mt-4 italic font-serif-romantic">
              {lang === 'my'
                ? '(လက်ရှိတွင် နမူနာ အမှတ်တရပုံရိပ်များကို ပြသထားပါသည်။ Admin Settings &gt; Gallery မှတစ်ဆင့် မိမိတို့၏ ကိုယ်ပိုင်ဓာတ်ပုံများကို ထည့်သွင်းနိုင်ပါသည်)'
                : '(Showing curated memory samples. You can upload custom memories anytime in Admin Settings &gt; Gallery)'}
            </p>
          )}
        </div>

        {/* ============================================================== */}
        {/* LIGHTBOX & THEATER SLIDESHOW VIEW                              */}
        {/* ============================================================== */}
        {currentItem && selectedIdx !== null && (
          <div
            ref={containerRef}
            onMouseMove={handleUserActivity}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="fixed inset-0 z-60 bg-black/95 flex flex-col items-center justify-between p-3 sm:p-6 overflow-hidden animate-fade-in select-none"
          >
            {/* Top Slideshow Progress Bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-pink-950/40 z-30">
              <div
                className="h-full bg-gradient-to-r from-pink-500 via-rose-400 to-amber-300 transition-all ease-linear shadow-glow"
                style={{
                  width: `${isPlaying ? progress : ((selectedIdx + 1) / displayItems.length) * 100}%`,
                  transitionDuration: isPlaying ? '50ms' : '300ms',
                }}
              />
            </div>

            {/* Top Toolbar (Controls fade out when playing) */}
            <div
              className={`w-full max-w-4xl flex items-center justify-between z-30 transition-opacity duration-300 ${
                showControls ? 'opacity-100' : 'opacity-0 hover:opacity-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-black/60 border border-pink-400/30 text-xs font-mono text-pink-300 backdrop-blur-md">
                  {selectedIdx + 1} / {displayItems.length}
                </span>

                {/* Slideshow Playing Status Pill */}
                {isPlaying && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-pink-500/20 border border-pink-400/40 text-pink-200 text-xs font-medium animate-pulse">
                    <Sparkles className="w-3 h-3 text-amber-300 animate-spin" />
                    <span className="text-[11px]">
                      {lang === 'my'
                        ? 'အလိုအလျောက်ပြသနေသည်'
                        : lang === 'ko'
                        ? '슬라이드쇼 재생 중'
                        : lang === 'zh'
                        ? '正在自动播放'
                        : 'Auto-Playing'}
                    </span>
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Speed Selector */}
                <div className="relative group">
                  <button
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 border border-white/20 text-xs text-slate-300 hover:text-white hover:border-pink-400/40 transition-colors cursor-pointer"
                    title="Change slide duration"
                  >
                    <Clock className="w-3 h-3 text-pink-400" />
                    <span>{slideSpeed / 1000}s</span>
                  </button>
                  <div className="absolute right-0 top-full mt-1.5 hidden group-hover:flex flex-col bg-slate-900/95 border border-pink-500/30 rounded-xl p-1 shadow-xl text-xs z-40 min-w-[70px]">
                    {[3000, 4000, 6000, 8000].map((speed) => (
                      <button
                        key={speed}
                        onClick={() => {
                          setSlideSpeed(speed);
                          setProgress(0);
                        }}
                        className={`px-2 py-1 rounded-lg text-left transition-colors cursor-pointer ${
                          slideSpeed === speed
                            ? 'bg-pink-500/30 text-pink-200 font-bold'
                            : 'text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        {speed / 1000}s
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fullscreen Toggle */}
                <button
                  onClick={toggleFullscreen}
                  className="p-2 rounded-full bg-black/60 hover:bg-white/20 text-slate-300 hover:text-white border border-white/20 transition-colors cursor-pointer"
                  title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                  aria-label="Fullscreen"
                >
                  {isFullscreen ? (
                    <Minimize2 className="w-4 h-4" />
                  ) : (
                    <Maximize2 className="w-4 h-4" />
                  )}
                </button>

                {/* Close Lightbox */}
                <button
                  onClick={() => {
                    setSelectedIdx(null);
                    setIsPlaying(false);
                  }}
                  className="p-2 rounded-full bg-black/60 hover:bg-white/20 text-slate-300 hover:text-white border border-white/20 transition-colors cursor-pointer"
                  aria-label="Close Lightbox"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Left Prev Arrow */}
            <button
              onClick={handlePrev}
              className={`absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 p-2.5 sm:p-3.5 rounded-full bg-black/60 hover:bg-pink-600/60 text-white border border-white/20 hover:border-pink-400 backdrop-blur-md cursor-pointer z-30 transition-all duration-300 active:scale-90 ${
                showControls ? 'opacity-100' : 'opacity-0 hover:opacity-100'
              }`}
              aria-label="Previous image"
              title="Previous photo (Left Arrow)"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Right Next Arrow */}
            <button
              onClick={handleNext}
              className={`absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 p-2.5 sm:p-3.5 rounded-full bg-black/60 hover:bg-pink-600/60 text-white border border-white/20 hover:border-pink-400 backdrop-blur-md cursor-pointer z-30 transition-all duration-300 active:scale-90 ${
                showControls ? 'opacity-100' : 'opacity-0 hover:opacity-100'
              }`}
              aria-label="Next image"
              title="Next photo (Right Arrow)"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Center Main Stage Image with Smooth Crossfade & Ken-Burns Zoom */}
            <div
              onClick={() => setIsPlaying((prev) => !prev)}
              className="relative my-auto flex items-center justify-center max-w-4xl max-h-[70vh] sm:max-h-[76vh] w-full rounded-2xl overflow-hidden shadow-2xl border border-pink-400/30 group cursor-pointer"
            >
              <img
                key={currentItem.id || selectedIdx}
                src={currentItem.image_path}
                alt={currentItem.caption || 'Memory'}
                referrerPolicy="no-referrer"
                className={`max-w-full max-h-[70vh] sm:max-h-[76vh] object-contain mx-auto select-none transition-transform duration-3000 ease-out ${
                  isPlaying ? 'scale-105' : 'scale-100'
                }`}
              />

              {/* Quick Play/Pause Center Indicator on hover */}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="p-3.5 rounded-full bg-black/70 text-white border border-pink-400/40 backdrop-blur-md shadow-lg scale-90 group-hover:scale-100 transition-transform">
                  {isPlaying ? (
                    <Pause className="w-6 h-6 fill-current text-pink-300" />
                  ) : (
                    <Play className="w-6 h-6 fill-current text-pink-300 pl-0.5" />
                  )}
                </div>
              </div>
            </div>

            {/* Caption & Playback Controller Bar */}
            <div
              className={`w-full max-w-2xl flex flex-col items-center gap-2.5 z-30 transition-opacity duration-300 ${
                showControls ? 'opacity-100' : 'opacity-0 hover:opacity-100'
              }`}
            >
              {/* Romantic Caption Banner */}
              {currentItem.caption && (
                <div className="glass-panel px-4 sm:px-6 py-2 rounded-2xl border border-pink-400/40 shadow-xl max-w-xl text-center">
                  <p className="text-sm sm:text-base text-pink-100 font-serif-romantic tracking-wide leading-relaxed">
                    &ldquo;{currentItem.caption}&rdquo;
                  </p>
                </div>
              )}

              {/* Bottom Controller Bar: Play/Pause, Rewind, Next, Dots */}
              <div className="flex items-center gap-3 px-4 py-1.5 rounded-full glass-panel border border-pink-400/30 backdrop-blur-md shadow-lg">
                <button
                  onClick={handlePrev}
                  className="p-1.5 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Previous"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Primary Play / Pause Slideshow Button */}
                <button
                  onClick={() => setIsPlaying((prev) => !prev)}
                  className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white text-xs font-semibold shadow-md active:scale-95 transition-all cursor-pointer glow-rose"
                  title={isPlaying ? 'Pause slideshow (Space)' : 'Play slideshow (Space)'}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5 fill-current" />
                      <span>{lang === 'my' ? 'ရပ်မည်' : 'Pause'}</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{lang === 'my' ? 'ဆက်ပြမည်' : 'Play'}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleNext}
                  className="p-1.5 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Next"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Mini dots selector */}
                <div className="hidden sm:flex items-center gap-1 pl-2 border-l border-white/20">
                  {displayItems.slice(0, 10).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedIdx(idx);
                        setProgress(0);
                      }}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        selectedIdx === idx
                          ? 'w-5 bg-pink-400'
                          : 'w-1.5 bg-white/30 hover:bg-white/60'
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                  {displayItems.length > 10 && (
                    <span className="text-[10px] text-pink-300/60 pl-1">
                      +{displayItems.length - 10}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
