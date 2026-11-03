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
  type: 'rose_petal' | 'small_blossom' | 'garden_leaf' | 'firefly' | 'golden_dust';
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
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const onResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    // Interactive breeze on touch / mouse move
    let windPushX = 0;
    const onMouseMove = (e: MouseEvent | TouchEvent) => {
      const cx = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const norm = cx / window.innerWidth - 0.5;
      windPushX = norm * 2.4;
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('touchmove', onMouseMove, { passive: true });

    // Mode-specific botanical palettes
    const getPalettesForMode = (mode: GardenLightingMode) => {
      if (mode === 'golden') {
        // Sunset Golden Hour Palettes: Amber, peach, terracotta, and warm golden sun dust
        return [
          { type: 'rose_petal' as const, primary: '#f59e0b', edge: '#dc2626', inner: '#fef08a' },
          { type: 'rose_petal' as const, primary: '#ea580c', edge: '#991b1b', inner: '#ffedd5' },
          { type: 'rose_petal' as const, primary: '#fb923c', edge: '#c2410c', inner: '#fff7ed' },
          { type: 'golden_dust' as const, primary: '#fef08a', edge: '#f59e0b', inner: '#ffffff' },
          { type: 'small_blossom' as const, primary: '#f472b6', edge: '#be123c', inner: '#fed7aa' },
        ];
      }
      if (mode === 'midnight') {
        // Midnight Sapphire Palettes: Deep moonlit ruby petals, bioluminescent cyan fireflies, and silver stardust
        return [
          { type: 'rose_petal' as const, primary: '#ec4899', edge: '#831843', inner: '#fce7f3' },
          { type: 'firefly' as const, primary: '#fde047', edge: '#eab308', inner: '#ffffff' },
          { type: 'firefly' as const, primary: '#38bdf8', edge: '#0284c7', inner: '#ffffff' },
          { type: 'golden_dust' as const, primary: '#ffffff', edge: '#67e8f9', inner: '#ffffff' },
          { type: 'small_blossom' as const, primary: '#c084fc', edge: '#581c87', inner: '#f3e8ff' },
        ];
      }
      if (mode === 'twilight') {
        // Twilight Night Palettes: Moonlit rose petals and glowing fairy fireflies
        return [
          { type: 'rose_petal' as const, primary: '#f472b6', edge: '#831843', inner: '#fce7f3' },
          { type: 'firefly' as const, primary: '#fef08a', edge: '#a3e635', inner: '#ffffff' },
          { type: 'rose_petal' as const, primary: '#db2777', edge: '#500724', inner: '#fbcfe8' },
          { type: 'firefly' as const, primary: '#67e8f9', edge: '#06b6d4', inner: '#ffffff' },
          { type: 'small_blossom' as const, primary: '#e879f9', edge: '#701a75', inner: '#fdf4ff' },
        ];
      }
      // Daylight: Crisp fresh English roses and vibrant leaves
      return [
        { type: 'rose_petal' as const, primary: '#f472b6', edge: '#db2777', inner: '#fbcfe8' },
        { type: 'rose_petal' as const, primary: '#fb7185', edge: '#e11d48', inner: '#ffe4e6' },
        { type: 'rose_petal' as const, primary: '#fda4af', edge: '#f43f5e', inner: '#fff1f2' },
        { type: 'small_blossom' as const, primary: '#fbcfe8', edge: '#ec4899', inner: '#ffffff' },
        { type: 'garden_leaf' as const, primary: '#4ade80', edge: '#15803d', inner: '#86efac' },
      ];
    };

    const currentPalettes = getPalettesForMode(lightingMode);
    // Optimized particle count for mobile buttery 60fps performance
    const particleCount = width < 768 ? 16 : 26;
    const particles: PetalParticle[] = [];

    const createParticle = (spawnTop = false): PetalParticle => {
      const palette = currentPalettes[Math.floor(Math.random() * currentPalettes.length)];
      let size = Math.random() * 9 + 11;
      let speedY = Math.random() * 0.85 + 0.6;

      if (palette.type === 'firefly' || palette.type === 'golden_dust') {
        size = Math.random() * 3 + 2;
        speedY = (Math.random() - 0.4) * 0.5; // Fireflies hover and float gently
      }

      return {
        x: Math.random() * width,
        y: spawnTop ? -size * 2 : Math.random() * height,
        size,
        speedY,
        speedX: (Math.random() - 0.45) * 0.7,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.025,
        flip: Math.random() * Math.PI,
        flipSpeed: Math.random() * 0.02 + 0.01,
        type: palette.type,
        primaryColor: palette.primary,
        edgeColor: palette.edge,
        innerShade: palette.inner,
        swingPhase: Math.random() * Math.PI * 2,
        swingSpeed: Math.random() * 0.02 + 0.015,
        swingAmplitude: Math.random() * 1.5 + 0.8,
        alpha: Math.random() * 0.3 + 0.7,
      };
    };

    for (let i = 0; i < particleCount; i++) {
      particles.push(createParticle(false));
    }

    const drawParticle = (
      pCtx: CanvasRenderingContext2D,
      p: PetalParticle,
      scaleX: number
    ) => {
      pCtx.save();
      pCtx.translate(p.x, p.y);

      if (p.type === 'firefly' || p.type === 'golden_dust') {
        // Glowing Firefly / Sun Dust Mote
        const glowRadius = p.size * 3.5;
        const radGrad = pCtx.createRadialGradient(0, 0, 0, 0, 0, glowRadius);
        radGrad.addColorStop(0, p.innerShade);
        radGrad.addColorStop(0.3, p.primaryColor);
        radGrad.addColorStop(1, 'transparent');

        pCtx.fillStyle = radGrad;
        pCtx.beginPath();
        pCtx.arc(0, 0, glowRadius, 0, Math.PI * 2);
        pCtx.fill();

        pCtx.fillStyle = p.innerShade;
        pCtx.beginPath();
        pCtx.arc(0, 0, p.size * 0.7, 0, Math.PI * 2);
        pCtx.fill();
        pCtx.restore();
        return;
      }

      pCtx.rotate(p.rotation);
      pCtx.scale(scaleX, 1);
      const r = p.size;

      // Realistic aerial depth shadow
      pCtx.shadowColor = lightingMode === 'twilight' ? 'rgba(0,0,0,0.4)' : 'rgba(15, 23, 42, 0.15)';
      pCtx.shadowBlur = 4;
      pCtx.shadowOffsetY = 3;

      if (p.type === 'garden_leaf') {
        // Delicate curved leaflet
        pCtx.beginPath();
        pCtx.moveTo(0, -r);
        pCtx.quadraticCurveTo(r * 0.55, 0, 0, r);
        pCtx.quadraticCurveTo(-r * 0.55, 0, 0, -r);
        pCtx.closePath();

        const grad = pCtx.createLinearGradient(-r * 0.3, -r, r * 0.3, r);
        grad.addColorStop(0, p.innerShade);
        grad.addColorStop(0.5, p.primaryColor);
        grad.addColorStop(1, p.edgeColor);

        pCtx.fillStyle = grad;
        pCtx.fill();
      } else {
        // Natural curved English Rose Petal
        pCtx.beginPath();
        pCtx.moveTo(0, r);
        pCtx.bezierCurveTo(-r * 0.8, r * 0.4, -r * 0.95, -r * 0.3, -r * 0.4, -r * 0.85);
        pCtx.quadraticCurveTo(0, -r * 0.65, r * 0.4, -r * 0.85);
        pCtx.bezierCurveTo(r * 0.95, -r * 0.3, r * 0.8, r * 0.4, 0, r);
        pCtx.closePath();

        const petalGrad = pCtx.createRadialGradient(0, 0, r * 0.1, 0, -r * 0.3, r * 1.1);
        petalGrad.addColorStop(0, p.innerShade);
        petalGrad.addColorStop(0.55, p.primaryColor);
        petalGrad.addColorStop(1, p.edgeColor);

        pCtx.fillStyle = petalGrad;
        pCtx.fill();

        // Velvet sheen
        pCtx.beginPath();
        pCtx.ellipse(0, -r * 0.2, r * 0.35, r * 0.5, 0, 0, Math.PI * 2);
        pCtx.fillStyle = 'rgba(255, 255, 255, 0.18)';
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
      className="fixed inset-0 pointer-events-none z-10 select-none"
      aria-hidden="true"
    />
  );
};
