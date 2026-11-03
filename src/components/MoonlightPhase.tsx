import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Moon, Sparkles } from 'lucide-react';
import { GardenLightingMode } from './RealGardenBackground';

interface MoonlightPhaseProps {
  idleTimeoutMs?: number; // Idle time required to trigger (default 18 seconds)
  lightingMode?: GardenLightingMode;
}

interface MoonMote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseAlpha: number;
  pulsePhase: number;
  pulseSpeed: number;
}

export const MoonlightPhase: React.FC<MoonlightPhaseProps> = ({
  idleTimeoutMs = 18000, // 18 seconds of inactivity
  lightingMode = 'twilight',
}) => {
  const [isMoonlightActive, setIsMoonlightActive] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const activeRef = useRef(false);
  const idleTimerRef = useRef<number | null>(null);

  // Keep ref in sync for animation loop
  useEffect(() => {
    activeRef.current = isMoonlightActive;
  }, [isMoonlightActive]);

  // Idle detection: watches for user interaction across pointer, touch, scroll, and keyboard
  const resetIdleTimer = useCallback(() => {
    if (activeRef.current) {
      setIsMoonlightActive(false);
    }
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
      'wheel',
    ];

    events.forEach((evt) => {
      window.addEventListener(evt, resetIdleTimer, { passive: true });
    });

    // Start initial timer
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

  // Canvas animation for the sweeping volumetric moonbeam and lunar motes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId = 0;
    let dpr = window.devicePixelRatio || 1;
    let width = (canvas.width = window.innerWidth * dpr);
    let height = (canvas.height = window.innerHeight * dpr);

    const onResize = () => {
      if (!canvas) return;
      dpr = window.devicePixelRatio || 1;
      width = canvas.width = window.innerWidth * dpr;
      height = canvas.height = window.innerHeight * dpr;
    };
    window.addEventListener('resize', onResize);

    // Silver-cyan floating lunar dust motes
    const motesCount = window.innerWidth < 640 ? 18 : 32;
    const motes: MoonMote[] = [];
    for (let i = 0; i < motesCount; i++) {
      motes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (-0.12 - Math.random() * 0.22) * dpr,
        vy: (0.15 + Math.random() * 0.28) * dpr,
        size: (1.2 + Math.random() * 2.2) * dpr,
        baseAlpha: 0.3 + Math.random() * 0.55,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: 1.2 + Math.random() * 2.2,
      });
    }

    let currentTransitionAlpha = 0; // Smooth 0 to 1 transition
    let lastTime = performance.now();

    const render = (time: number) => {
      animId = requestAnimationFrame(render);

      const dt = Math.min(0.1, (time - lastTime) / 1000);
      lastTime = time;
      const t = time * 0.001;

      // Smoothly approach target alpha (2.2s transition for cinematic elegance)
      const targetAlpha = activeRef.current ? 1 : 0;
      currentTransitionAlpha += (targetAlpha - currentTransitionAlpha) * Math.min(1, dt * 1.5);

      ctx.clearRect(0, 0, width, height);

      if (currentTransitionAlpha <= 0.005) {
        return; // Idle phase inactive or fully faded out
      }

      ctx.save();
      ctx.globalAlpha = currentTransitionAlpha;

      // --- Sweeping Volumetric Moonbeam Light Shaft ---
      // Source origin: Celestial Moon position high in the upper sky (drifting gently)
      const moonSourceX = width * 0.65 + Math.sin(t * 0.14) * (width * 0.18);
      const moonSourceY = -60 * dpr;

      // Sweeping angle trajectory across the garden (slow 26s pendulum sweep)
      const sweepCycle = Math.sin(t * 0.24); // -1 to 1
      const centralSweepAngle = Math.PI * 0.58 + sweepCycle * 0.28; // ~85 deg to ~125 deg
      const beamHalfWidthAngle = 0.18 + Math.sin(t * 0.4) * 0.03; // breathing cone width
      const beamReach = Math.hypot(width, height) * 1.4;

      const angle1 = centralSweepAngle - beamHalfWidthAngle;
      const angle2 = centralSweepAngle + beamHalfWidthAngle;

      const p1x = moonSourceX + Math.cos(angle1) * beamReach;
      const p1y = moonSourceY + Math.sin(angle1) * beamReach;
      const p2x = moonSourceX + Math.cos(angle2) * beamReach;
      const p2y = moonSourceY + Math.sin(angle2) * beamReach;

      // 1. Primary Volumetric Moonbeam Light Cone
      const beamGrad = ctx.createRadialGradient(
        moonSourceX,
        moonSourceY,
        15 * dpr,
        moonSourceX,
        moonSourceY,
        beamReach * 0.75
      );
      // Mode-aware moonbeam intensity
      const beamMaxAlpha = lightingMode === 'midnight' ? 0.32 : lightingMode === 'golden' ? 0.2 : 0.26;
      beamGrad.addColorStop(0, `rgba(255, 255, 255, ${beamMaxAlpha * 0.95})`);
      beamGrad.addColorStop(0.2, `rgba(224, 242, 254, ${beamMaxAlpha * 0.75})`); // sky-100
      beamGrad.addColorStop(0.55, `rgba(186, 230, 253, ${beamMaxAlpha * 0.38})`); // sky-200
      beamGrad.addColorStop(0.85, `rgba(147, 197, 253, ${beamMaxAlpha * 0.15})`); // blue-300
      beamGrad.addColorStop(1, 'rgba(186, 230, 253, 0)');

      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.moveTo(moonSourceX, moonSourceY);
      ctx.lineTo(p1x, p1y);
      ctx.lineTo(p2x, p2y);
      ctx.closePath();
      ctx.fill();

      // 2. Secondary Soft Lateral Moon Halo (Ambient celestial sheen)
      const haloAngle1 = centralSweepAngle - beamHalfWidthAngle * 1.7;
      const haloAngle2 = centralSweepAngle + beamHalfWidthAngle * 1.7;
      const h1x = moonSourceX + Math.cos(haloAngle1) * beamReach;
      const h1y = moonSourceY + Math.sin(haloAngle1) * beamReach;
      const h2x = moonSourceX + Math.cos(haloAngle2) * beamReach;
      const h2y = moonSourceY + Math.sin(haloAngle2) * beamReach;

      const haloGrad = ctx.createRadialGradient(
        moonSourceX,
        moonSourceY,
        20 * dpr,
        moonSourceX,
        moonSourceY,
        beamReach * 0.65
      );
      haloGrad.addColorStop(0, 'rgba(240, 249, 255, 0.12)');
      haloGrad.addColorStop(0.4, 'rgba(224, 242, 254, 0.06)');
      haloGrad.addColorStop(1, 'rgba(224, 242, 254, 0)');

      ctx.fillStyle = haloGrad;
      ctx.beginPath();
      ctx.moveTo(moonSourceX, moonSourceY);
      ctx.lineTo(h1x, h1y);
      ctx.lineTo(h2x, h2y);
      ctx.closePath();
      ctx.fill();

      // 3. Floating Silver-Cyan Moonlit Motes
      for (let i = 0; i < motes.length; i++) {
        const m = motes[i];
        m.x += m.vx + Math.sin(t * 0.6 + i) * 0.18 * dpr;
        m.y += m.vy;

        if (m.x < -20 * dpr) m.x = width + 20 * dpr;
        if (m.y > height + 20 * dpr) {
          m.y = -20 * dpr;
          m.x = Math.random() * width;
        }

        // Check if mote is currently illuminated by the sweeping moonbeam
        const dx = m.x - moonSourceX;
        const dy = m.y - moonSourceY;
        const moteAngle = Math.atan2(dy, dx);
        const angleDiff = Math.abs(moteAngle - centralSweepAngle);
        const inBeamFactor = Math.max(0, 1 - angleDiff / (beamHalfWidthAngle * 1.4));

        const pulse = (Math.sin(t * m.pulseSpeed + m.pulsePhase) + 1) * 0.5;
        const moteAlpha = m.baseAlpha * (0.35 + pulse * 0.65) * (0.7 + inBeamFactor * 0.9);

        // Core starlet
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${moteAlpha})`;
        ctx.fill();

        // Moonlight aura
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.size * 2.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(186, 230, 253, ${moteAlpha * 0.35})`;
        ctx.fill();
      }

      ctx.restore();
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
    };
  }, [lightingMode]);

  return (
    <>
      {/* 1. Subtle Color Temperature Shift Overlay (Cooling Lunar White Balance) */}
      <div
        aria-hidden="true"
        className={`fixed inset-0 pointer-events-none z-[15] transition-opacity duration-[2500ms] ease-in-out ${
          isMoonlightActive ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Cool silver-cyan white-balance temperature shift */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-950/25 via-blue-900/15 to-indigo-950/25 mix-blend-color" />
        
        {/* Soft moonlight illumination wash across garden lake & florals */}
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-900/10 via-sky-800/10 to-indigo-900/20 mix-blend-soft-light" />
        
        {/* Gentle deep vignette for nocturnal intimacy */}
        <div className="absolute inset-0 bg-radial from-transparent via-transparent to-slate-950/30 mix-blend-multiply" />
      </div>

      {/* 2. Sweeping Volumetric Moonbeam Light Shaft Canvas */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-[15] w-full h-full"
        style={{ willChange: 'transform, opacity' }}
      />

      {/* 3. Discrete Romantic Gaze Indicator (Appears when idle, vanishes on any movement) */}
      <div
        className={`fixed top-14 left-1/2 -translate-x-1/2 z-40 pointer-events-none transition-all duration-1000 ease-out select-none ${
          isMoonlightActive
            ? 'opacity-85 translate-y-0 scale-100'
            : 'opacity-0 -translate-y-2 scale-95'
        }`}
      >
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/70 backdrop-blur-md border border-cyan-300/40 text-cyan-100 text-[11px] font-serif-romantic tracking-wide shadow-xl">
          <Moon className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
          <span>Serene Moonlight Gaze</span>
          <Sparkles className="w-3 h-3 text-cyan-200" />
        </div>
      </div>
    </>
  );
};

export default MoonlightPhase;
