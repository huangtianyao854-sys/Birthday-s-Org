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
  maxAge: number; // in seconds
  birthScale: number; // For pop-in animation
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
  { fill: '#f43f5e', glow: 'rgba(244, 63, 94, 0.6)' }, // Rose crimson
  { fill: '#ec4899', glow: 'rgba(236, 72, 153, 0.6)' }, // Hot pink
  { fill: '#fb7185', glow: 'rgba(251, 113, 133, 0.55)' }, // Soft blush
  { fill: '#f472b6', glow: 'rgba(244, 114, 182, 0.5)' }, // Pastel blossom
  { fill: '#e11d48', glow: 'rgba(225, 29, 72, 0.6)' }, // Deep ruby
  { fill: '#fda4af', glow: 'rgba(253, 164, 175, 0.5)' }, // Fairy rose
  { fill: '#fb923c', glow: 'rgba(251, 146, 60, 0.55)' }, // Peach coral
  { fill: '#f59e0b', glow: 'rgba(245, 158, 11, 0.55)' }, // Golden warmth
];

export const FloatingHeartsOverlay: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = (canvas.width = window.innerWidth * dpr);
    let height = (canvas.height = window.innerHeight * dpr);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    const onResize = () => {
      if (!canvas) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
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

    // Ambient floating heart rising gently from the bottom edge
    const createAmbientHeart = (): FloatingHeart => {
      const palette = ROMANTIC_PALETTES[Math.floor(Math.random() * ROMANTIC_PALETTES.length)];
      const screenW = width;
      const screenH = height;

      const size = (14 + Math.random() * 20) * dpr;
      const initX = (0.05 + Math.random() * 0.9) * screenW;
      const initY = screenH + (10 + Math.random() * 30) * dpr;

      return {
        id: nextId++,
        x: initX,
        y: initY,
        baseX: initX,
        vx: 0,
        vy: -(0.85 + Math.random() * 1.3) * dpr,
        size,
        speedY: (0.85 + Math.random() * 1.3) * dpr,
        swingAmp: (12 + Math.random() * 26) * dpr,
        swingSpeed: 0.015 + Math.random() * 0.025,
        swingPhase: Math.random() * Math.PI * 2,
        rotation: (Math.random() - 0.5) * 0.25,
        rotSpeed: (Math.random() - 0.5) * 0.01,
        alpha: 0,
        maxAlpha: 0.55 + Math.random() * 0.35,
        color: palette.fill,
        glowColor: palette.glow,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.042 + Math.random() * 0.035,
        pulseAmplitude: 0.12 + Math.random() * 0.07,
        hasSparkles: Math.random() > 0.45,
        isBurst: false,
        age: 0,
        maxAge: 30,
        birthScale: 1,
      };
    };

    // Burst heart spawned right at the tap/click contact point
    const createBurstHeart = (cx: number, cy: number, index: number, total: number): FloatingHeart => {
      const palette = ROMANTIC_PALETTES[Math.floor(Math.random() * ROMANTIC_PALETTES.length)];

      // Radial angle spread biased slightly upwards
      const baseAngle = (index / total) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      const burstSpeed = (2.2 + Math.random() * 4.2) * dpr;

      // Varied cute sizes for the cluster (some delicate 10-14px, some 18-24px)
      const size = (10 + Math.random() * 16) * dpr;

      return {
        id: nextId++,
        x: cx,
        y: cy,
        baseX: cx,
        vx: Math.cos(baseAngle) * burstSpeed,
        vy: Math.sin(baseAngle) * burstSpeed - (1.6 + Math.random() * 2.2) * dpr, // Upward lift
        size,
        speedY: (1.2 + Math.random() * 1.8) * dpr,
        swingAmp: (8 + Math.random() * 18) * dpr,
        swingSpeed: 0.02 + Math.random() * 0.03,
        swingPhase: Math.random() * Math.PI * 2,
        rotation: (Math.random() - 0.5) * 0.5,
        rotSpeed: (Math.random() - 0.5) * 0.03,
        alpha: 0.95 + Math.random() * 0.05, // Immediately bright and radiant!
        maxAlpha: 1.0,
        color: palette.fill,
        glowColor: palette.glow,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.065 + Math.random() * 0.04,
        pulseAmplitude: 0.18 + Math.random() * 0.08,
        hasSparkles: true,
        isBurst: true,
        age: 0,
        maxAge: 2.5 + Math.random() * 1.5, // 2.5 to 4.0 seconds lifetime
        birthScale: 0.2, // Pops outwards enthusiastically
      };
    };

    // Seed initial gentle hearts so the screen is immediately romantic
    for (let i = 0; i < 8; i++) {
      const h = createAmbientHeart();
      h.y = Math.random() * height;
      h.alpha = h.maxAlpha * (0.4 + Math.random() * 0.6);
      hearts.push(h);
    }

    // Tap-to-Burst Interaction: Spawns a vibrant cluster of love hearts and sparkles at contact point
    const triggerTapBurst = (clientX: number, clientY: number) => {
      const now = performance.now();
      // Debounce slightly to prevent accidental double-firing between pointerdown & click
      if (now - lastTapTimestamp < 60) return;
      lastTapTimestamp = now;

      // Play subtle romantic kiss sound effect (controlled by the birdsong/ambient volume settings)
      birdsongAudio.playKissSound();

      const cx = clientX * dpr;
      const cy = clientY * dpr;

      // 1. Expanding romantic touch ripple ring
      ripples.push({
        x: cx,
        y: cy,
        radius: 4 * dpr,
        maxRadius: (40 + Math.random() * 20) * dpr,
        alpha: 0.7,
        color: 'rgba(251, 113, 133, 0.75)',
      });

      // 2. Spawn a cluster of 6 to 9 hearts bursting outward from the contact point
      const clusterSize = 6 + Math.floor(Math.random() * 4);
      for (let i = 0; i < clusterSize; i++) {
        if (hearts.length < 55) {
          hearts.push(createBurstHeart(cx, cy, i, clusterSize));
        }
      }

      // 3. Spawn a burst of sparkling fairy glitter stars around the contact point
      const sparkleCount = 8 + Math.floor(Math.random() * 6);
      for (let i = 0; i < sparkleCount; i++) {
        if (sparkles.length < 60) {
          const spAngle = Math.random() * Math.PI * 2;
          const spSpeed = (1.5 + Math.random() * 3.5) * dpr;
          sparkles.push({
            x: cx,
            y: cy,
            vx: Math.cos(spAngle) * spSpeed,
            vy: Math.sin(spAngle) * spSpeed - 1.2 * dpr,
            size: (1.5 + Math.random() * 2.5) * dpr,
            alpha: 1.0,
            color: Math.random() > 0.4 ? '#fef08a' : '#fbcfe8',
            decay: 0.025 + Math.random() * 0.025,
          });
        }
      }
    };

    // Universal pointer event listener (works instantly across touch, mouse, and stylus)
    const handlePointerDown = (e: PointerEvent) => {
      triggerTapBurst(e.clientX, e.clientY);
    };

    window.addEventListener('pointerdown', handlePointerDown, { passive: true });

    // Path helper: draw crisp vector heart with subtle scale stretch & heartbeat glow
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
      scaleY: number = 1,
      glowBlur: number = 10
    ) => {
      c.save();
      c.translate(cx, cy);
      c.rotate(rotation);
      c.scale(scaleX, scaleY);
      c.globalAlpha = Math.max(0, Math.min(1, alpha));

      // Living outer glow pulsating in harmony with the heartbeat
      c.shadowColor = glow;
      c.shadowBlur = glowBlur * dpr;

      c.beginPath();
      const topCurveHeight = size * 0.3;
      c.moveTo(0, topCurveHeight);
      // top left curve
      c.bezierCurveTo(0, 0, -size / 2, 0, -size / 2, topCurveHeight);
      // bottom left curve
      c.bezierCurveTo(-size / 2, (size + topCurveHeight) / 1.7, 0, size, 0, size);
      // bottom right curve
      c.bezierCurveTo(0, size, size / 2, (size + topCurveHeight) / 1.7, size / 2, topCurveHeight);
      // top right curve
      c.bezierCurveTo(size / 2, 0, 0, 0, 0, topCurveHeight);
      c.closePath();

      c.fillStyle = color;
      c.fill();

      // Delicate inner shine highlight
      c.shadowBlur = 0;
      c.beginPath();
      c.arc(-size * 0.18, topCurveHeight * 0.7, size * 0.1, 0, Math.PI * 2);
      c.fillStyle = 'rgba(255, 255, 255, 0.45)';
      c.fill();

      c.restore();
    };

    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      animId = requestAnimationFrame(loop);

      // Skip render if document is hidden to conserve power
      if (document.hidden) return;

      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      ctx.clearRect(0, 0, width, height);

      // 1. Update and draw tap ripple rings
      for (let rIdx = ripples.length - 1; rIdx >= 0; rIdx--) {
        const rp = ripples[rIdx];
        rp.radius += (rp.maxRadius - rp.radius) * (dt * 12);
        rp.alpha -= 0.04 * (dt * 60);

        if (rp.alpha <= 0) {
          ripples.splice(rIdx, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, rp.radius, 0, Math.PI * 2);
        ctx.strokeStyle = rp.color;
        ctx.lineWidth = 2 * dpr;
        ctx.globalAlpha = Math.max(0, rp.alpha);
        ctx.shadowColor = 'rgba(244, 63, 94, 0.5)';
        ctx.shadowBlur = 8 * dpr;
        ctx.stroke();
        ctx.restore();
      }

      // 2. Periodically spawn ambient background hearts from the bottom
      if (currentTime - lastSpawnTime > 750 && hearts.length < 24) {
        lastSpawnTime = currentTime;
        hearts.push(createAmbientHeart());
      }

      // 3. Update and draw sparkles
      for (let sIdx = sparkles.length - 1; sIdx >= 0; sIdx--) {
        const sp = sparkles[sIdx];
        sp.x += sp.vx * (dt * 60);
        sp.y += sp.vy * (dt * 60);
        sp.vx *= 0.95;
        sp.vy *= 0.95;
        sp.vy -= 0.04 * dpr; // slight floating rise
        sp.alpha -= sp.decay * (dt * 60);

        if (sp.alpha <= 0) {
          sparkles.splice(sIdx, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, sp.alpha);
        ctx.fillStyle = sp.color;
        ctx.shadowColor = sp.color;
        ctx.shadowBlur = 6 * dpr;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 4. Update and draw floating & burst hearts
      for (let i = hearts.length - 1; i >= 0; i--) {
        const h = hearts[i];
        h.age += dt;

        if (h.isBurst) {
          // Burst physics: initial radial burst, decelerating smoothly with friction, then rising buoyantly
          h.x += h.vx * (dt * 60);
          h.y += h.vy * (dt * 60);

          // Drag / air resistance
          h.vx *= 0.93;
          h.vy *= 0.94;
          // Buoyant upward drift
          h.vy -= 0.07 * dpr;

          // Pop-in scale expansion during the first 0.2s of life
          if (h.birthScale < 1) {
            h.birthScale = Math.min(1, h.birthScale + (dt * 7));
          }

          // Fade out based on age
          const lifeProgress = h.age / h.maxAge;
          if (lifeProgress > 0.6) {
            h.alpha = Math.max(0, h.maxAlpha * (1 - (lifeProgress - 0.6) / 0.4));
          }
        } else {
          // Ambient bottom-rising heart physics
          h.y -= h.speedY * (dt * 60);
          h.swingPhase += h.swingSpeed * (dt * 60);
          h.x = h.baseX + Math.sin(h.swingPhase) * h.swingAmp;

          // Fade in when appearing from bottom
          if (h.alpha < h.maxAlpha && h.y > height * 0.25) {
            h.alpha = Math.min(h.maxAlpha, h.alpha + 0.02 * (dt * 60));
          }
          // Fade out as it floats near the top of the screen
          if (h.y < height * 0.22) {
            h.alpha -= 0.018 * (dt * 60);
          }
        }

        // Gentle rotation
        h.rotation += h.rotSpeed * (dt * 60);

        // Rhythmic organic heartbeat scaling pulse (lub-dub rhythm)
        h.pulsePhase += h.pulseSpeed * (dt * 60);
        const cycle = ((h.pulsePhase % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2) / (Math.PI * 2);

        let beatStrength = 0;
        if (cycle < 0.15) {
          // Primary systolic beat: warm, energetic expansion
          beatStrength = Math.sin((cycle / 0.15) * Math.PI);
        } else if (cycle >= 0.20 && cycle < 0.35) {
          // Secondary diastolic echo: soft, delicate recoil beat
          beatStrength = Math.sin(((cycle - 0.20) / 0.15) * Math.PI) * 0.52;
        } else {
          // Resting respiration pause: calm, gentle organic drift
          beatStrength = Math.sin(cycle * Math.PI * 2) * 0.08;
        }

        // Calculate dynamic scaling and subtle organic stretch & squish
        const scaleBase = (1 + h.pulseAmplitude * beatStrength) * h.birthScale;
        const scaleX = scaleBase * (1 - Math.max(0, beatStrength) * 0.04);
        const scaleY = scaleBase * (1 + Math.max(0, beatStrength) * 0.06);
        const glowBlur = 8 + 14 * Math.max(0, beatStrength);

        // Emit delicate trailing glitter sparkles occasionally
        if (h.hasSparkles && Math.random() < 0.14 && sparkles.length < 50) {
          sparkles.push({
            x: h.x + (Math.random() - 0.5) * h.size * 0.5,
            y: h.y + h.size * 0.7,
            vx: (Math.random() - 0.5) * 0.8 * dpr,
            vy: 0.2 * dpr,
            size: (1 + Math.random() * 2) * dpr,
            alpha: 0.85,
            color: '#fef08a',
            decay: 0.022,
          });
        }

        // Remove if expired, off screen, or fully faded
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
          scaleX,
          scaleY,
          glowBlur
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
