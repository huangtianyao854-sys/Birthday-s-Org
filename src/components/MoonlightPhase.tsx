import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Moon, Sparkles } from 'lucide-react';
import { GardenLightingMode } from './RealGardenBackground';

interface MoonlightPhaseProps {
  idleTimeoutMs?: number; // Idle time required to trigger (default 18 seconds)
  lightingMode?: GardenLightingMode;
}

export const MoonlightPhase: React.FC<MoonlightPhaseProps> = ({
  idleTimeoutMs = 18000,
  lightingMode = 'twilight',
}) => {
  const [isMoonlightActive, setIsMoonlightActive] = useState(false);
  const idleTimerRef = useRef<number | null>(null);

  // Idle detection: watches for user interaction across pointer, touch, scroll, and keyboard
  const resetIdleTimer = useCallback(() => {
    setIsMoonlightActive(false);
    if (idleTimerRef.current !== null) {
      window.clearTimeout(idleTimerRef.current);
    }
    idleTimerRef.current = window.setTimeout(() => {
      setIsMoonlightActive(true);
    }, idleTimeoutMs);
  }, [idleTimeoutMs]);

  useEffect(() => {
    const events: (keyof WindowEventMap)[] = [
      'pointermove',
      'pointerdown',
      'touchstart',
      'touchmove',
      'scroll',
      'keydown',
    ];

    events.forEach((evt) => {
      window.addEventListener(evt, resetIdleTimer, { passive: true });
    });

    idleTimerRef.current = window.setTimeout(() => {
      setIsMoonlightActive(true);
    }, idleTimeoutMs);

    return () => {
      events.forEach((evt) => {
        window.removeEventListener(evt, resetIdleTimer);
      });
      if (idleTimerRef.current !== null) {
        window.clearTimeout(idleTimerRef.current);
      }
    };
  }, [resetIdleTimer, idleTimeoutMs]);

  // Mode-aware volumetric intensity
  const beamOpacity =
    lightingMode === 'midnight'
      ? 'opacity-40'
      : lightingMode === 'golden'
      ? 'opacity-25'
      : 'opacity-35';

  return (
    <>
      {/* 1. Subtle Color Temperature Shift Overlay (Cooling Lunar White Balance) */}
      <div
        aria-hidden="true"
        className={`fixed inset-0 pointer-events-none z-[14] transition-opacity duration-[2000ms] ease-in-out ${
          isMoonlightActive ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Cool silver-cyan white-balance temperature shift */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-950/20 via-blue-900/10 to-indigo-950/20 mix-blend-color" />
        
        {/* Soft moonlight illumination wash across garden lake & florals */}
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-900/10 via-sky-800/10 to-indigo-900/15 mix-blend-soft-light" />
      </div>

      {/* 2. Sweeping Volumetric Moonbeam Light Shaft (100% GPU Hardware Accelerated CSS) */}
      <div
        aria-hidden="true"
        className={`fixed inset-0 pointer-events-none z-[14] overflow-hidden transition-opacity duration-[2000ms] ease-in-out ${
          isMoonlightActive ? beamOpacity : 'opacity-0'
        }`}
      >
        {/* Primary Moonbeam Shaft */}
        <div
          className="absolute -top-[20vh] right-[10vw] w-[140vw] sm:w-[90vw] h-[140vh] origin-top-right transform -rotate-[28deg] pointer-events-none"
          style={{
            background:
              'conic-gradient(from 195deg at 90% 0%, rgba(224, 242, 254, 0.45) 0deg, rgba(186, 230, 253, 0.2) 20deg, transparent 40deg)',
            filter: 'blur(32px)',
          }}
        />
        {/* Secondary soft reflection on the water / ground */}
        <div
          className="absolute bottom-0 right-[15vw] w-[60vw] h-[30vh] rounded-full pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(224, 242, 254, 0.25) 0%, rgba(186, 230, 253, 0.1) 40%, transparent 70%)',
            filter: 'blur(24px)',
          }}
        />
      </div>

      {/* 3. Discrete Romantic Gaze Indicator (Appears when idle, vanishes on any movement) */}
      <div
        className={`fixed top-14 left-1/2 -translate-x-1/2 z-40 pointer-events-none transition-all duration-700 ease-out select-none ${
          isMoonlightActive
            ? 'opacity-85 translate-y-0 scale-100'
            : 'opacity-0 -translate-y-2 scale-95 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-sm border border-cyan-300/40 text-cyan-100 text-[11px] font-serif-romantic tracking-wide shadow-xl">
          <Moon className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
          <span>Serene Moonlight Gaze</span>
          <Sparkles className="w-3 h-3 text-cyan-200" />
        </div>
      </div>
    </>
  );
};

export default MoonlightPhase;
