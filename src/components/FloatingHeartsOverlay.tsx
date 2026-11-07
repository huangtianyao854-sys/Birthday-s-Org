import React, { useEffect, useRef } from 'react';
import { birdsongAudio } from '../utils/birdsongAudio';

interface FloatingHeart {
  id: number;
  x: number;
  y: number;
  baseX: number;
  vx: number;
  vy: number;
  size: number;
  speedY: number;
  swingAmp: number;
  swingSpeed: number;
  swingPhase: number;
  rotation: number;
  rotSpeed: number;
  alpha: number;
  maxAlpha: number;
  color: string;
  glowColor: string;
  pulsePhase: number;
  pulseSpeed: number;
  pulseAmplitude: number;
  hasSparkles: boolean;
  isBurst: boolean;
  age: number;
  maxAge: number;
  birthScale: number;
}

interface Sparkle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  decay: number;
}

interface TapRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

const ROMANTIC_PALETTES = [
  { fill: '#f43f5e', glow: 'rgba(244, 63, 94, 0.45)' },
  { fill: '#ec4899', glow: 'rgba(236, 72, 153, 0.45)' },
  { fill: '#fb7185', glow: 'rgba(251, 113, 133, 0.4)' },
  { fill: '#f472b6', glow: 'rgba(244, 114, 182, 0.4)' },
  { fill: '#e11d48', glow: 'rgba(225, 29, 72, 0.45)' },
  { fill: '#fda4af', glow: 'rgba(253, 164, 175, 0.35)' },
  { fill: '#fb923c', glow: 'rgba(251, 146, 60, 0.4)' },
  { fill: '#f59e0b', glow: 'rgba(245, 158, 11, 0.4)' },
];

export const FloatingHeartsOverlay: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId = 0;
    const isMobile = window.innerWidth < 768;
    let dpr = isMobile ? 1.0 : Math.min(window.devicePixelRatio || 1, 1.25);
    let width = (canvas.width = window.innerWidth * dpr);
    let height = (canvas.height = window.innerHeight * dpr);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    const onResize = () => {
      if (!canvas) return;
      const mob = window.innerWidth < 768;
      dpr = mob ? 1.0 : Math.min(window.devicePixelRatio || 1, 1.25);
      width = canvas.width = window.innerWidth * dpr;
      height = canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };
    window.addEventListener('resize', onResize);

    const hearts: FloatingHeart[] = [];
    const sparkles: Sparkle[] = [];
    const ripples: TapRipple[] = [];
    let nextId = 1;
    let lastSpawnTime = 0;
    let lastTapTimestamp = 0;

    const createAmbientHeart = (): FloatingHeart => {
      const palette = ROMANTIC_PALETTES[Math.floor(Math.random() * ROMANTIC_PALETTES.length)];
      const size = (Math.random() * 8 + 14) * dpr;
      const startX = (0.1 + Math.random() * 0.8) * width;

      return {
        id: nextId++,
        x: startX,
        y: height + size,
        baseX: startX,
        vx: 0,
        vy: 0,
        size,
        speedY: (0.45 + Math.random() * 0.45) * dpr,
        swingAmp: (12 + Math.random() * 18) * dpr,
        swingSpeed: 0.02 + Math.random() * 0.015,
        swingPhase: Math.random() * Math.PI * 2,
        rotation: (Math.random() - 0.5) * 0.25,
        rotSpeed: (Math.random() - 0.5) * 0.008,
        alpha: 0,
        maxAlpha: 0.65 + Math.random() * 0.25,
        color: palette.fill,
        glowColor: palette.glow,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.055,
        pulseAmplitude: 0.08,
        hasSparkles: Math.random() > 0.65,
        isBurst: false,
        age: 0,
        maxAge: 16,
        birthScale: 1,
      };
    };

    const createBurstHeart = (
      originX: number,
      originY: number,
      index: number,
      total: number
    ): FloatingHeart => {
      const palette = ROMANTIC_PALETTES[Math.floor(Math.random() * ROMANTIC_PALETTES.length)];
      const angle = (index / total) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      const speed = (2.2 + Math.random() * 3.2) * dpr;
      const size = (Math.random() * 8 + 12) * dpr;

      return {
        id: nextId++,
        x: originX,
        y: originY,
        baseX: originX,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.2 * dpr,
        size,
        speedY: 0.6 * dpr,
        swingAmp: (8 + Math.random() * 12) * dpr,
        swingSpeed: 0.03,
        swingPhase: Math.random() * Math.PI * 2,
        rotation: (Math.random() - 0.5) * 0.4,
        rotSpeed: (Math.random() - 0.5) * 0.018,
        alpha: 0.9,
        maxAlpha: 0.95,
        color: palette.fill,
        glowColor: palette.glow,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.07,
        pulseAmplitude: 0.1,
        hasSparkles: Math.random() > 0.5,
        isBurst: true,
        age: 0,
        maxAge: 1.4 + Math.random() * 0.8,
        birthScale: 0.3,
      };
    };

    const triggerTapBurst = (clientX: number, clientY: number) => {
      const now = performance.now();
      if (now - lastTapTimestamp < 80) return;
      lastTapTimestamp = now;

      birdsongAudio.playKissSound();

      const cx = clientX * dpr;
      const cy = clientY * dpr;

      ripples.push({
        x: cx,
        y: cy,
        radius: 4 * dpr,
        maxRadius: 32 * dpr,
        alpha: 0.6,
        color: 'rgba(251, 113, 133, 0.7)',
      });

      const clusterSize = isMobile ? 4 : 6;
      for (let i = 0; i < clusterSize; i++) {
        if (hearts.length < 20) {
          hearts.push(createBurstHeart(cx, cy, i, clusterSize));
        }
      }

      const sparkleCount = isMobile ? 4 : 8;
      for (let i = 0; i < sparkleCount; i++) {
        if (sparkles.length < 20) {
          const spAngle = Math.random() * Math.PI * 2;
          const spSpeed = (1.2 + Math.random() * 2.5) * dpr;
          sparkles.push({
            x: cx,
            y: cy,
            vx: Math.cos(spAngle) * spSpeed,
            vy: Math.sin(spAngle) * spSpeed - 1.0 * dpr,
            size: (1.2 + Math.random() * 1.8) * dpr,
            alpha: 0.9,
            color: Math.random() > 0.4 ? '#fef08a' : '#fbcfe8',
            decay: 0.035 + Math.random() * 0.025,
          });
        }
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      triggerTapBurst(e.clientX, e.clientY);
    };

    window.addEventListener('pointerdown', handlePointerDown, { passive: true });

    // Vector heart without heavy shadowBlur
    const drawHeart = (
      c: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      size: number,
      color: string,
      glow: string,
      alpha: number,
      rotation: number,
      scaleX: number = 1,
      scaleY: number = 1
    ) => {
      c.save();
      c.translate(cx, cy);
      c.rotate(rotation);
      c.scale(scaleX, scaleY);
      c.globalAlpha = Math.max(0, Math.min(1, alpha));

      c.beginPath();
      const topCurveHeight = size * 0.3;
      c.moveTo(0, topCurveHeight);
      c.bezierCurveTo(0, 0, -size / 2, 0, -size / 2, topCurveHeight);
      c.bezierCurveTo(-size / 2, (size + topCurveHeight) / 1.7, 0, size, 0, size);
      c.bezierCurveTo(0, size, size / 2, (size + topCurveHeight) / 1.7, size / 2, topCurveHeight);
      c.bezierCurveTo(size / 2, 0, 0, 0, 0, topCurveHeight);
      c.closePath();

      c.fillStyle = color;
      c.fill();

      // Soft glow stroke instead of shadowBlur
      c.strokeStyle = glow;
      c.lineWidth = 1.5 * dpr;
      c.stroke();

      // Inner shine highlight
      c.beginPath();
      c.arc(-size * 0.18, topCurveHeight * 0.7, size * 0.1, 0, Math.PI * 2);
      c.fillStyle = 'rgba(255, 255, 255, 0.45)';
      c.fill();

      c.restore();
    };

    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      animId = requestAnimationFrame(loop);

      if (document.hidden) return;

      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      // Spawn periodic ambient heart (cap active count)
      const maxAmbient = isMobile ? 3 : 6;
      const activeAmbient = hearts.filter((h) => !h.isBurst).length;
      if (currentTime - lastSpawnTime > (isMobile ? 3800 : 2500) && activeAmbient < maxAmbient) {
        hearts.push(createAmbientHeart());
        lastSpawnTime = currentTime;
      }

      ctx.clearRect(0, 0, width, height);

      // 1. Draw ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i];
        rp.radius += (rp.maxRadius - rp.radius) * (dt * 8);
        rp.alpha -= dt * 1.5;

        if (rp.alpha <= 0) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = rp.alpha;
        ctx.strokeStyle = rp.color;
        ctx.lineWidth = 2 * dpr;
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, rp.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // 2. Draw sparkles
      for (let i = sparkles.length - 1; i >= 0; i--) {
        const sp = sparkles[i];
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.alpha -= sp.decay;

        if (sp.alpha <= 0) {
          sparkles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = sp.alpha;
        ctx.fillStyle = sp.color;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 3. Draw hearts
      for (let i = hearts.length - 1; i >= 0; i--) {
        const h = hearts[i];
        h.age += dt;

        if (h.isBurst) {
          h.x += h.vx * (dt * 60);
          h.y += h.vy * (dt * 60);
          h.vx *= 0.93;
          h.vy *= 0.94;
          h.vy -= 0.07 * dpr;

          if (h.birthScale < 1) {
            h.birthScale = Math.min(1, h.birthScale + dt * 7);
          }

          const lifeProgress = h.age / h.maxAge;
          if (lifeProgress > 0.6) {
            h.alpha = Math.max(0, h.maxAlpha * (1 - (lifeProgress - 0.6) / 0.4));
          }
        } else {
          h.y -= h.speedY * (dt * 60);
          h.swingPhase += h.swingSpeed * (dt * 60);
          h.x = h.baseX + Math.sin(h.swingPhase) * h.swingAmp;

          if (h.alpha < h.maxAlpha && h.y > height * 0.25) {
            h.alpha = Math.min(h.maxAlpha, h.alpha + 0.02 * (dt * 60));
          }
          if (h.y < height * 0.22) {
            h.alpha -= 0.018 * (dt * 60);
          }
        }

        h.rotation += h.rotSpeed * (dt * 60);
        h.pulsePhase += h.pulseSpeed * (dt * 60);

        const cycle = ((h.pulsePhase % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2) / (Math.PI * 2);
        const beatStrength = cycle < 0.15 ? Math.sin((cycle / 0.15) * Math.PI) : 0;
        const scaleBase = (1 + h.pulseAmplitude * beatStrength) * h.birthScale;

        if (
          h.y < -h.size * 2 ||
          h.alpha <= 0 ||
          (h.isBurst && h.age >= h.maxAge) ||
          h.x < -h.size * 2 ||
          h.x > width + h.size * 2
        ) {
          hearts.splice(i, 1);
          continue;
        }

        drawHeart(
          ctx,
          h.x,
          h.y,
          h.size,
          h.color,
          h.glowColor,
          h.alpha,
          h.rotation,
          scaleBase,
          scaleBase
        );
      }
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointerdown', handlePointerDown);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-20"
      aria-hidden="true"
    />
  );
};

export default FloatingHeartsOverlay;
