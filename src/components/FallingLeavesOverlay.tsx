import React, { useEffect, useRef } from 'react';
import { GardenLightingMode } from './RealGardenBackground';

interface PetalParticle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  rotation: number;
  rotSpeed: number;
  flip: number;
  flipSpeed: number;
  type: 'rose_petal' | 'small_blossom' | 'garden_leaf';
  primaryColor: string;
  edgeColor: string;
  innerShade: string;
  swingPhase: number;
  swingSpeed: number;
  swingAmplitude: number;
  alpha: number;
}

interface FallingLeavesOverlayProps {
  lightingMode?: GardenLightingMode;
}

export const FallingLeavesOverlay: React.FC<FallingLeavesOverlayProps> = ({
  lightingMode = 'daylight',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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

    // Interactive breeze on touch / mouse move
    let windPushX = 0;
    const onMouseMove = (e: MouseEvent | TouchEvent) => {
      const cx = 'touches' in e && e.touches.length > 0 ? e.touches[0].clientX : (e as MouseEvent).clientX;
      if (cx !== undefined) {
        const norm = cx / window.innerWidth - 0.5;
        windPushX = norm * 1.8 * dpr;
      }
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('touchmove', onMouseMove, { passive: true });

    // Mode-specific botanical palettes (focused on delicate rose petals & garden leaves)
    const getPalettesForMode = (mode: GardenLightingMode) => {
      if (mode === 'golden') {
        return [
          { type: 'rose_petal' as const, primary: '#f59e0b', edge: '#dc2626', inner: '#fef08a' },
          { type: 'rose_petal' as const, primary: '#ea580c', edge: '#991b1b', inner: '#ffedd5' },
          { type: 'rose_petal' as const, primary: '#fb923c', edge: '#c2410c', inner: '#fff7ed' },
          { type: 'small_blossom' as const, primary: '#f472b6', edge: '#be123c', inner: '#fed7aa' },
        ];
      }
      if (mode === 'midnight') {
        return [
          { type: 'rose_petal' as const, primary: '#ec4899', edge: '#831843', inner: '#fce7f3' },
          { type: 'rose_petal' as const, primary: '#db2777', edge: '#4c0519', inner: '#fbcfe8' },
          { type: 'small_blossom' as const, primary: '#c084fc', edge: '#581c87', inner: '#f3e8ff' },
        ];
      }
      if (mode === 'twilight') {
        return [
          { type: 'rose_petal' as const, primary: '#f472b6', edge: '#831843', inner: '#fce7f3' },
          { type: 'rose_petal' as const, primary: '#db2777', edge: '#500724', inner: '#fbcfe8' },
          { type: 'small_blossom' as const, primary: '#e879f9', edge: '#701a75', inner: '#fdf4ff' },
        ];
      }
      // Daylight
      return [
        { type: 'rose_petal' as const, primary: '#f472b6', edge: '#db2777', inner: '#fbcfe8' },
        { type: 'rose_petal' as const, primary: '#fb7185', edge: '#e11d48', inner: '#ffe4e6' },
        { type: 'rose_petal' as const, primary: '#fda4af', edge: '#f43f5e', inner: '#fff1f2' },
        { type: 'garden_leaf' as const, primary: '#4ade80', edge: '#15803d', inner: '#86efac' },
      ];
    };

    const currentPalettes = getPalettesForMode(lightingMode);
    // Optimized particle count: 9 on mobile, 18 on desktop
    const particleCount = isMobile ? 9 : 18;
    const particles: PetalParticle[] = [];

    const createParticle = (spawnTop = false): PetalParticle => {
      const palette = currentPalettes[Math.floor(Math.random() * currentPalettes.length)];
      const size = (Math.random() * 8 + 10) * dpr;
      const speedY = (Math.random() * 0.75 + 0.5) * dpr;

      return {
        x: Math.random() * width,
        y: spawnTop ? -size * 2 : Math.random() * height,
        size,
        speedY,
        speedX: (Math.random() - 0.45) * 0.6 * dpr,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.02,
        flip: Math.random() * Math.PI,
        flipSpeed: Math.random() * 0.02 + 0.01,
        type: palette.type,
        primaryColor: palette.primary,
        edgeColor: palette.edge,
        innerShade: palette.inner,
        swingPhase: Math.random() * Math.PI * 2,
        swingSpeed: Math.random() * 0.02 + 0.012,
        swingAmplitude: (Math.random() * 1.2 + 0.7) * dpr,
        alpha: Math.random() * 0.3 + 0.65,
      };
    };

    for (let i = 0; i < particleCount; i++) {
      particles.push(createParticle(false));
    }

    const drawParticle = (pCtx: CanvasRenderingContext2D, p: PetalParticle, scaleX: number) => {
      pCtx.save();
      pCtx.translate(p.x, p.y);
      pCtx.globalAlpha = p.alpha;
      pCtx.rotate(p.rotation);
      pCtx.scale(scaleX, 1);
      const r = p.size;

      if (p.type === 'garden_leaf') {
        pCtx.beginPath();
        pCtx.moveTo(0, -r);
        pCtx.quadraticCurveTo(r * 0.5, 0, 0, r);
        pCtx.quadraticCurveTo(-r * 0.5, 0, 0, -r);
        pCtx.closePath();
        pCtx.fillStyle = p.primaryColor;
        pCtx.fill();
      } else {
        // Natural curved English Rose Petal
        pCtx.beginPath();
        pCtx.moveTo(0, r);
        pCtx.bezierCurveTo(-r * 0.75, r * 0.35, -r * 0.85, -r * 0.25, -r * 0.35, -r * 0.8);
        pCtx.quadraticCurveTo(0, -r * 0.6, r * 0.35, -r * 0.8);
        pCtx.bezierCurveTo(r * 0.85, -r * 0.25, r * 0.75, r * 0.35, 0, r);
        pCtx.closePath();
        pCtx.fillStyle = p.primaryColor;
        pCtx.fill();

        // Subtle highlight
        pCtx.beginPath();
        pCtx.ellipse(0, -r * 0.2, r * 0.3, r * 0.4, 0, 0, Math.PI * 2);
        pCtx.fillStyle = p.innerShade;
        pCtx.globalAlpha = p.alpha * 0.4;
        pCtx.fill();
      }

      pCtx.restore();
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.swingPhase += p.swingSpeed;
        const sway = Math.sin(p.swingPhase) * p.swingAmplitude;

        p.x += p.speedX + sway + windPushX;
        p.y += p.speedY;

        p.rotation += p.rotSpeed;
        p.flip += p.flipSpeed;
        const scaleX = Math.cos(p.flip);

        drawParticle(ctx, p, scaleX);

        if (p.y > height + 40 || p.x < -60 || p.x > width + 60 || p.y < -60) {
          particles[i] = createParticle(true);
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onMouseMove);
    };
  }, [lightingMode]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-10 w-full h-full"
    />
  );
};
