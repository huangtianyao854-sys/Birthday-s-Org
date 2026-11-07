import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Heart, Sparkles } from 'lucide-react';
import { AppLanguage } from '../config/birthdayConfig';
import { romanticAudio } from '../utils/romanticAudio';

interface WaxSealInteractiveProps {
  lang: AppLanguage;
  onBreak: () => void;
  className?: string;
}

interface SparkleParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
}

export const WaxSealInteractive: React.FC<WaxSealInteractiveProps> = ({
  lang,
  onBreak,
  className = '',
}) => {
  const [progress, setProgress] = useState<number>(0); // 0 to 1
  const [isPressing, setIsPressing] = useState<boolean>(false);
  const [isBreaking, setIsBreaking] = useState<boolean>(false);
  const [sparks, setSparks] = useState<SparkleParticle[]>([]);

  const pressStartTimeRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastPingProgressRef = useRef<number>(0);
  const isBreakingRef = useRef<boolean>(false);

  const REQUIRED_HOLD_MS = 1100; // 1.1s for a smooth, dramatic press & hold

  // Prompt labels
  const promptTexts: Record<AppLanguage, string> = {
    my: 'စာလွှာဖတ်ရန် တံဆိပ်ကို ဖိထားပါ (သို့) နှိပ်ပါ 💌',
    en: 'Press & hold or tap to break the wax seal 💌',
    ko: '실링 왁스를 길게 누르거나 탭하여 개봉 💌',
    zh: '长按或轻触蜡封，开启专属情书 💌',
  };

  const breakingTexts: Record<AppLanguage, string> = {
    my: 'အချစ်မေတ္တာ စာလွှာပွင့်လှစ်နေပြီ... ✨',
    en: 'Unsealing your love letter... ✨',
    ko: '사랑의 편지가 열리고 있어요... ✨',
    zh: '封蜡已解，心意开启…… ✨',
  };

  // Generate explosion sparks when broken
  const triggerBreak = useCallback(() => {
    if (isBreakingRef.current) return;
    isBreakingRef.current = true;
    setIsBreaking(true);
    setProgress(1);

    // Audio & Haptic feedback
    try {
      romanticAudio.playWaxSealBreak();
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([40, 60, 80]);
      }
    } catch {
      // Safe fallback
    }

    // Generate bursting golden sparks
    const newSparks: SparkleParticle[] = [];
    const colors = ['#fde047', '#f59e0b', '#fb7185', '#ffffff', '#fbbf24'];
    for (let i = 0; i < 18; i++) {
      const angle = (Math.PI * 2 * i) / 18 + (Math.random() - 0.5) * 0.4;
      const speed = 2.5 + Math.random() * 4.5;
      newSparks.push({
        id: i,
        x: 0,
        y: 0,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2.5 + Math.random() * 3.5,
        color: colors[i % colors.length],
      });
    }
    setSparks(newSparks);

    // Delay slightly to allow the shattering & particle animation to play out
    setTimeout(() => {
      onBreak();
    }, 700);
  }, [onBreak]);

  // Hold loop using requestAnimationFrame
  const updateHold = useCallback(() => {
    if (!isPressing || isBreakingRef.current || pressStartTimeRef.current === null) return;

    const elapsed = Date.now() - pressStartTimeRef.current;
    const currentProgress = Math.min(1, elapsed / REQUIRED_HOLD_MS);
    setProgress(currentProgress);

    // Play periodic tension crack audio at progress intervals
    if (currentProgress - lastPingProgressRef.current > 0.25) {
      lastPingProgressRef.current = currentProgress;
      romanticAudio.playWaxTensionPing(currentProgress);
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(15);
      }
    }

    if (currentProgress >= 1) {
      triggerBreak();
      return;
    }

    animFrameRef.current = requestAnimationFrame(updateHold);
  }, [isPressing, triggerBreak]);

  useEffect(() => {
    if (isPressing && !isBreaking) {
      animFrameRef.current = requestAnimationFrame(updateHold);
    } else if (!isPressing && !isBreaking && progress > 0) {
      // If released before 100%, decay progress gradually back to zero
      const decayTimer = setInterval(() => {
        setProgress((prev) => {
          if (prev <= 0.05) {
            clearInterval(decayTimer);
            lastPingProgressRef.current = 0;
            return 0;
          }
          return prev - 0.06;
        });
      }, 30);
      return () => clearInterval(decayTimer);
    }

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPressing, isBreaking, updateHold, progress]);

  // Handle pointer down (press start)
  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    if (isBreakingRef.current) return;

    setIsPressing(true);
    pressStartTimeRef.current = Date.now() - progress * REQUIRED_HOLD_MS;
    romanticAudio.playWaxTensionPing(progress);
  };

  // Handle pointer up or leave (press end)
  const handlePointerUp = () => {
    if (isBreakingRef.current) return;
    setIsPressing(false);
    pressStartTimeRef.current = null;
  };

  // Handle quick tap: each tap adds +35% crack progress
  const handleClick = () => {
    if (isBreakingRef.current) return;

    const nextProgress = progress + 0.36;
    if (nextProgress >= 1) {
      triggerBreak();
    } else {
      setProgress(nextProgress);
      romanticAudio.playWaxTensionPing(nextProgress);
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(18);
      }
    }
  };

  // Radial progress circumference (radius = 52)
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      {/* Outer Glow Halo when pressing */}
      <div
        className={`absolute -inset-6 rounded-full transition-all duration-300 pointer-events-none ${
          isPressing
            ? 'bg-gradient-to-r from-rose-500/35 via-amber-400/40 to-rose-500/35 blur-xl scale-110 opacity-100'
            : 'bg-rose-500/10 blur-lg opacity-40'
        }`}
      />

      {/* Main Interactive Wax Seal Medallion */}
      <div
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        aria-label="Break wax seal to read love letter"
        className={`relative z-10 w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center cursor-pointer select-none touch-none transition-transform duration-150 ${
          isBreaking
            ? 'scale-110 animate-fade-out'
            : isPressing
            ? 'scale-95 shadow-inner'
            : 'hover:scale-105 active:scale-95'
        }`}
      >
        {/* SVG Circular Progress Meter (fills around the seal while holding) */}
        <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="rgba(251, 191, 36, 0.25)"
            strokeWidth="3.5"
            strokeDasharray="4 4"
          />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="url(#sealProgressGradient)"
            strokeWidth="4.5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-75"
          />
          <defs>
            <linearGradient id="sealProgressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#f43f5e" />
            </linearGradient>
          </defs>
        </svg>

        {/* Tactile 3D Wax Seal Body with Organic Molten Rim */}
        <div
          className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center shadow-2xl transition-all duration-200 overflow-hidden ${
            isPressing ? 'ring-2 ring-amber-300/80 shadow-rose-950/60' : 'shadow-rose-950/40 ring-1 ring-amber-400/40'
          }`}
          style={{
            background: 'radial-gradient(circle at 35% 30%, #e11d48 0%, #be123c 45%, #881337 80%, #4c0519 100%)',
            boxShadow: isPressing
              ? 'inset 0 3px 8px rgba(0,0,0,0.4), 0 8px 25px rgba(225, 29, 72, 0.45)'
              : 'inset 0 2px 4px rgba(255,255,255,0.4), inset 0 -3px 6px rgba(0,0,0,0.5), 0 10px 25px rgba(136, 19, 55, 0.5)',
          }}
        >
          {/* Molten Wavy Wax Rim (Organic edges) */}
          <div
            className="absolute inset-1 rounded-full border border-amber-300/30 opacity-70 pointer-events-none"
            style={{
              clipPath:
                'polygon(50% 0%, 63% 5%, 77% 2%, 87% 11%, 95% 23%, 98% 37%, 96% 50%, 99% 65%, 93% 78%, 84% 88%, 71% 95%, 55% 99%, 40% 97%, 26% 94%, 14% 85%, 5% 72%, 2% 57%, 4% 42%, 2% 28%, 11% 16%, 23% 7%, 37% 3%)',
            }}
          />

          {/* Inner Golden Embossed Ring */}
          <div className="absolute inset-2.5 sm:inset-3 rounded-full border-2 border-amber-300/50 flex items-center justify-center shadow-inner pointer-events-none">
            <div className="w-full h-full rounded-full border border-amber-200/30 flex items-center justify-center" />
          </div>

          {/* Golden Embossed Monogram & Heart Crest */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center pointer-events-none">
            <Heart className={`w-5 h-5 sm:w-6 sm:h-6 text-amber-200 fill-amber-200 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)] ${
              isPressing ? 'scale-110 text-amber-100 fill-amber-100' : 'animate-pulse'
            }`} />
            <span
              className="text-[10px] sm:text-xs font-bold font-serif-romantic tracking-widest text-amber-100 drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)] uppercase pt-0.5"
            >
              H &bull; N
            </span>
          </div>

          {/* Surface Crack Fissures that progressively illuminate */}
          {progress > 0.05 && (
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-20"
              viewBox="0 0 100 100"
              style={{
                filter: 'drop-shadow(0 0 3px rgba(254, 240, 138, 0.9))',
              }}
            >
              {/* Primary central crack line */}
              <path
                d="M 50 15 L 48 35 L 53 45 L 47 58 L 54 75 L 50 88"
                fill="none"
                stroke="#fef08a"
                strokeWidth={1.8 + progress * 1.5}
                strokeLinecap="round"
                strokeDasharray="100"
                strokeDashoffset={100 - Math.min(1, progress * 1.3) * 100}
                className="transition-all duration-75"
              />

              {/* Branch crack 1 (left) */}
              {progress > 0.3 && (
                <path
                  d="M 48 35 L 34 38 L 22 45"
                  fill="none"
                  stroke="#fde047"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeDasharray="50"
                  strokeDashoffset={50 - Math.min(1, (progress - 0.3) * 2) * 50}
                  className="transition-all duration-75"
                />
              )}

              {/* Branch crack 2 (right) */}
              {progress > 0.5 && (
                <path
                  d="M 47 58 L 62 64 L 78 68"
                  fill="none"
                  stroke="#fde047"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeDasharray="50"
                  strokeDashoffset={50 - Math.min(1, (progress - 0.5) * 2.2) * 50}
                  className="transition-all duration-75"
                />
              )}

              {/* Branch crack 3 (cross diagonal) */}
              {progress > 0.75 && (
                <path
                  d="M 53 45 L 68 38 L 82 28"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray="50"
                  strokeDashoffset={50 - Math.min(1, (progress - 0.75) * 4) * 50}
                  className="transition-all duration-75"
                />
              )}
            </svg>
          )}

          {/* Golden Specular Sheen across wax */}
          <div className="absolute top-1 left-2 w-10 h-5 bg-gradient-to-b from-white/35 to-transparent rounded-full rotate-[-35deg] pointer-events-none blur-[1px]" />
        </div>

        {/* Bursting Golden Particle Sparks on Break */}
        {isBreaking && sparks.length > 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
            {sparks.map((spark) => (
              <span
                key={spark.id}
                className="absolute rounded-full animate-ping"
                style={{
                  width: `${spark.size}px`,
                  height: `${spark.size}px`,
                  backgroundColor: spark.color,
                  boxShadow: `0 0 8px ${spark.color}`,
                  transform: `translate(${spark.vx * 15}px, ${spark.vy * 15}px)`,
                  transition: 'transform 0.6s ease-out, opacity 0.6s ease-out',
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Interactive Guidance & Hint Label */}
      <div className="mt-4 text-center">
        <div
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-md transition-all duration-300 ${
            isBreaking
              ? 'bg-rose-600 text-white animate-pulse'
              : isPressing
              ? 'bg-amber-100 text-amber-950 border border-amber-300 scale-105'
              : 'bg-white/90 text-rose-950 border border-rose-200 hover:bg-rose-50'
          }`}
        >
          <Sparkles className={`w-3.5 h-3.5 ${isPressing ? 'text-amber-600 animate-spin' : 'text-rose-500'}`} />
          <span className={lang === 'my' ? 'font-burmese text-xs' : 'font-sans'}>
            {isBreaking ? breakingTexts[lang] : promptTexts[lang]}
          </span>
        </div>

        {/* Subtle hold progress percentage feedback when actively pressing */}
        {isPressing && !isBreaking && (
          <p className="text-[11px] font-mono text-amber-800 font-bold mt-1.5 tracking-wider animate-fade-in">
            {Math.round(progress * 100)}% UNSEALING
          </p>
        )}
      </div>
    </div>
  );
};
