import React, { useEffect, useRef } from 'react';
import { GardenLightingMode } from './RealGardenBackground';

interface WeatherOverlayProps {
  lightingMode?: GardenLightingMode;
}

interface AmbientMote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  baseAlpha: number;
  pulsePhase: number;
  pulseSpeed: number;
  color: string;
}

export const WeatherOverlay: React.FC<WeatherOverlayProps> = ({ lightingMode = 'daylight' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lightingModeRef = useRef<GardenLightingMode>(lightingMode);

  useEffect(() => {
    lightingModeRef.current = lightingMode;
  }, [lightingMode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId = 0;
    const isMobile = window.innerWidth < 768;
    const dpr = isMobile ? 1.0 : Math.min(window.devicePixelRatio || 1, 1.25);
    let width = (canvas.width = window.innerWidth * dpr);
    let height = (canvas.height = window.innerHeight * dpr);

    const onResize = () => {
      if (!canvas) return;
      const mob = window.innerWidth < 768;
      const rDpr = mob ? 1.0 : Math.min(window.devicePixelRatio || 1, 1.25);
      width = canvas.width = window.innerWidth * rDpr;
      height = canvas.height = window.innerHeight * rDpr;
    };
    window.addEventListener('resize', onResize);

    // Mote pool (gentle sun pollen for day, amber dust for golden, stardust for twilight/midnight)
    const count = isMobile ? 14 : 26;
    const motes: AmbientMote[] = [];

    const getPalette = (mode: GardenLightingMode) => {
      if (mode === 'midnight') return ['#bae6fd', '#e0e7ff', '#ffffff'];
      if (mode === 'twilight') return ['#c7d2fe', '#fbcfe8', '#ffffff'];
      if (mode === 'golden') return ['#fef08a', '#f59e0b', '#fed7aa'];
      return ['#fef9c3', '#ffffff', '#fed7aa']; // daylight sun pollen
    };

    const colors = getPalette(lightingModeRef.current);
    for (let i = 0; i < count; i++) {
      motes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() * 0.4 - 0.2) * dpr,
        vy: (Math.random() * 0.35 + 0.15) * dpr,
        size: (Math.random() * 1.6 + 1.2) * dpr,
        alpha: Math.random() * 0.5 + 0.2,
        baseAlpha: Math.random() * 0.4 + 0.3,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 1.5 + 1.0,
        color: colors[i % colors.length],
      });
    }

    let lastTime = performance.now();

    const render = (now: number) => {
      const dt = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;

      ctx.clearRect(0, 0, width, height);

      const mode = lightingModeRef.current;
      const currentColors = getPalette(mode);

      for (let i = 0; i < motes.length; i++) {
        const m = motes[i];
        m.pulsePhase += m.pulseSpeed * dt;
        const pulse = (Math.sin(m.pulsePhase) + 1) * 0.5;
        const effAlpha = m.baseAlpha * (0.35 + pulse * 0.65);

        m.x += m.vx + Math.sin(m.pulsePhase * 0.5) * 0.2 * dpr;
        m.y += m.vy;

        if (m.y > height + 10) {
          m.y = -10;
          m.x = Math.random() * width;
          m.color = currentColors[i % currentColors.length];
        }
        if (m.x < -10) m.x = width + 10;
        else if (m.x > width + 10) m.x = -10;

        // Draw soft mote with outer aura (fast multi-pass arc)
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.size * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = m.color;
        ctx.globalAlpha = effAlpha * 0.25;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = effAlpha;
        ctx.fill();
      }

      ctx.globalAlpha = 1.0;
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const handleVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(animId);
      } else {
        lastTime = performance.now();
        animId = requestAnimationFrame(render);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return (
    <>
      {/* 1. Hardware Accelerated Volumetric Atmospheric Haze (Pure CSS) */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-[13] transition-opacity duration-1000 ease-in-out"
      >
        {lightingMode === 'daylight' && (
          <div
            className="absolute top-0 right-0 w-[80vw] h-[70vh] pointer-events-none opacity-30"
            style={{
              background:
                'radial-gradient(ellipse at 85% 0%, rgba(254, 240, 138, 0.4) 0%, rgba(255, 255, 255, 0.2) 35%, transparent 70%)',
            }}
          />
        )}
        {lightingMode === 'golden' && (
          <div
            className="absolute inset-x-0 bottom-0 h-[45vh] pointer-events-none opacity-35"
            style={{
              background:
                'linear-gradient(to top, rgba(245, 158, 11, 0.25) 0%, rgba(251, 146, 60, 0.15) 45%, transparent 100%)',
            }}
          />
        )}
        {(lightingMode === 'twilight' || lightingMode === 'midnight') && (
          <div
            className="absolute inset-x-0 bottom-0 h-[35vh] pointer-events-none opacity-25"
            style={{
              background:
                'linear-gradient(to top, rgba(99, 102, 241, 0.2) 0%, rgba(165, 180, 252, 0.08) 50%, transparent 100%)',
            }}
          />
        )}
      </div>

      {/* 2. Microscopic Atmospheric Motess Canvas (Lightweight, single-pass) */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-[14] w-full h-full"
        aria-hidden="true"
      />
    </>
  );
};

export default WeatherOverlay;
