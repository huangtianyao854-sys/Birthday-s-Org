import React, { useEffect, useRef } from 'react';
import { romanticAudio } from '../utils/romanticAudio';
import { GardenLightingMode } from './RealGardenBackground';

interface Star {
  x: number;
  y: number;
  radius: number;
  baseAlpha: number;
  alpha: number;
  twinkleSpeed: number;
  color: string;
}

interface LuminousRing {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

interface DiamondSpark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  rotSpeed: number;
  alpha: number;
  decay: number;
  color: string;
}

interface CelestialMeteor {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  width: number;
  alpha: number;
  color: string;
}

interface ConstellationNode {
  x: number;
  y: number;
  currentX: number;
  currentY: number;
  isSpecial?: boolean;
}

interface OrganicConstellation {
  x: number;
  y: number;
  alpha: number;
  scale: number;
  nodes: ConstellationNode[];
  lines: [number, number][];
}

interface StarfieldCanvasProps {
  showConstellation?: boolean;
  lightingMode?: GardenLightingMode;
}

export const StarfieldCanvas: React.FC<StarfieldCanvasProps> = ({
  showConstellation = false,
  lightingMode = 'twilight',
}) => {
  const bgCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fxCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const isOrbitingRef = useRef(false);
  const orbitAngleRef = useRef(0);

  const ringsRef = useRef<LuminousRing[]>([]);
  const sparksRef = useRef<DiamondSpark[]>([]);
  const meteorsRef = useRef<CelestialMeteor[]>([]);
  const constellationsRef = useRef<OrganicConstellation[]>([]);

  const lastTapTimeRef = useRef(0);
  const holdTimerRef = useRef<number | null>(null);

  // Scorpius constellation relative points (organic, delicate)
  const scorpioNormalized = [
    { x: -50, y: -60 }, // Graffias
    { x: -35, y: -45 }, // Dschubba
    { x: -55, y: -35 }, // Fang
    { x: -20, y: -20 }, // Al Niyat
    { x: -5, y: -5, isSpecial: true }, // Antares (Heart of Scorpio - radiant ruby gold)
    { x: 10, y: 15 },   // Larawag
    { x: 20, y: 35 },   // Wei
    { x: 35, y: 55 },   // Sargas
    { x: 50, y: 58 },   // Iclil
    { x: 65, y: 45 },   // Shaula
    { x: 70, y: 35 },   // Lesath
  ];

  const scorpioLines: [number, number][] = [
    [0, 1], [2, 1], [1, 3], [3, 4], [4, 5],
    [5, 6], [6, 7], [7, 8], [8, 9], [9, 10]
  ];

  // Heart Constellation relative points
  const heartNormalized = [
    { x: 0, y: -25 },
    { x: -20, y: -42 },
    { x: -40, y: -32 },
    { x: -44, y: -8 },
    { x: -28, y: 16 },
    { x: 0, y: 44 },
    { x: 28, y: 16 },
    { x: 44, y: -8 },
    { x: 40, y: -32 },
    { x: 20, y: -42 },
  ];

  const heartLines: [number, number][] = [
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 5],
    [5, 6], [6, 7], [7, 8], [8, 9], [9, 0],
    [0, 5],
  ];

  useEffect(() => {
    const bgCanvas = bgCanvasRef.current;
    const fxCanvas = fxCanvasRef.current;
    if (!bgCanvas || !fxCanvas) return;

    const bgCtx = bgCanvas.getContext('2d');
    const fxCtx = fxCanvas.getContext('2d');
    if (!bgCtx || !fxCtx) return;

    let animId: number;
    let width = (bgCanvas.width = fxCanvas.width = window.innerWidth);
    let height = (bgCanvas.height = fxCanvas.height = window.innerHeight);

    const handleResize = () => {
      if (!bgCanvas || !fxCanvas) return;
      width = bgCanvas.width = fxCanvas.width = window.innerWidth;
      height = bgCanvas.height = fxCanvas.height = window.innerHeight;
      initStars();
    };

    window.addEventListener('resize', handleResize);

    // Color palette for romantic stars
    const starColors = [
      '#ffffff',
      '#fef08a', // Champagne amber
      '#fda4af', // Rose pink
      '#e0e7ff', // Pale blue-violet
      '#fce7f3', // Pale rose
      '#bae6fd', // Soft celestial cyan
    ];

    const isMidnight = lightingMode === 'midnight';

    let stars: Star[] = [];

    const initStars = () => {
      // Midnight mode features higher star density (260-440) and prominent celestial radiance
      const divisor = isMidnight ? 1400 : 2200;
      const minStars = isMidnight ? 260 : 160;
      const maxStars = isMidnight ? 440 : 300;
      const count = Math.min(Math.max(Math.floor((width * height) / divisor), minStars), maxStars);
      stars = [];
      for (let i = 0; i < count; i++) {
        const baseAlpha = isMidnight ? 0.6 + Math.random() * 0.4 : 0.45 + Math.random() * 0.55;
        // Concentrate stars in the sky region (-height * 0.4 to height * 0.15 relative to center)
        const skyY = (Math.random() * 0.68 - 0.5) * height;
        stars.push({
          x: (Math.random() - 0.5) * width * 1.35,
          y: skyY,
          radius: Math.random() * (isMidnight ? 2.4 : 1.8) + (isMidnight ? 1.0 : 0.8),
          baseAlpha,
          alpha: baseAlpha,
          twinkleSpeed: (isMidnight ? 0.022 : 0.015) + Math.random() * (isMidnight ? 0.04 : 0.03),
          color: starColors[Math.floor(Math.random() * starColors.length)],
        });
      }
    };

    initStars();

    // Natural shooting stars sweeping across twilight / midnight garden sky
    const shootingStarTimer = setInterval(() => {
      meteorsRef.current.push({
        x: Math.random() * width * 0.75,
        y: Math.random() * height * 0.35,
        vx: 9 + Math.random() * 5,
        vy: 5 + Math.random() * 3,
        length: (isMidnight ? 140 : 110) + Math.random() * (isMidnight ? 90 : 70),
        width: isMidnight ? 2.2 : 1.8,
        alpha: 0.98,
        color: Math.random() > 0.4 ? '#fef08a' : Math.random() > 0.5 ? '#bae6fd' : '#fda4af',
      });
    }, isMidnight ? 2100 : 3200);

    let tick = 0;

    // Helper: Draw 4-point Diamond Star with optical diffraction spikes
    const drawDiamondStar = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      color: string,
      alpha: number,
      rotation: number = 0
    ) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = size * 3;

      // 4-point star curve
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.quadraticCurveTo(size * 0.15, -size * 0.15, size, 0);
      ctx.quadraticCurveTo(size * 0.15, size * 0.15, 0, size);
      ctx.quadraticCurveTo(-size * 0.15, size * 0.15, -size, 0);
      ctx.quadraticCurveTo(-size * 0.15, -size * 0.15, 0, -size);
      ctx.closePath();
      ctx.fill();

      // Soft center glowing core
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.35, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.restore();
    };

    const render = () => {
      tick++;
      bgCtx.clearRect(0, 0, width, height);
      fxCtx.clearRect(0, 0, width, height);

      // Soft, transparent night-sky atmospheric gradient that enhances twilight while preserving the botanical garden photograph
      const bgGrad = bgCtx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, 'rgba(15, 23, 62, 0.45)'); // Deep twilight indigo at top sky
      bgGrad.addColorStop(0.55, 'rgba(10, 15, 35, 0.18)'); // Soft haze over mountain horizon
      bgGrad.addColorStop(1, 'rgba(0, 0, 0, 0.05)'); // Near transparent at bottom
      bgCtx.fillStyle = bgGrad;
      bgCtx.fillRect(0, 0, width, height);

      // Celestial Orbiting Rotation
      if (isOrbitingRef.current) {
        orbitAngleRef.current += 0.0016; // Elegant slow planetary orbit
      } else {
        orbitAngleRef.current += 0.0003; // Gentle ambient celestial drift
      }

      const cos = Math.cos(orbitAngleRef.current);
      const sin = Math.sin(orbitAngleRef.current);
      const cx = width / 2;
      const cy = height / 2;

      // Render background stars
      for (const star of stars) {
        const rx = star.x * cos - star.y * sin;
        const ry = star.x * sin + star.y * cos;
        const sx = cx + rx;
        const sy = cy + ry;

        if (sx < -10 || sx > width + 10 || sy < -10 || sy > height + 10) continue;

        star.alpha = star.baseAlpha + Math.sin(tick * star.twinkleSpeed) * 0.3;
        const curAlpha = Math.max(0.12, Math.min(1, star.alpha));

        bgCtx.beginPath();
        bgCtx.arc(sx, sy, star.radius, 0, Math.PI * 2);
        bgCtx.fillStyle = star.color;
        bgCtx.globalAlpha = curAlpha;
        bgCtx.fill();

        // Delicate shimmer for larger stars
        if (star.radius > 1.4 && curAlpha > 0.8) {
          bgCtx.strokeStyle = star.color;
          bgCtx.lineWidth = 0.5;
          bgCtx.globalAlpha = curAlpha * 0.5;
          bgCtx.beginPath();
          bgCtx.moveTo(sx - 3, sy);
          bgCtx.lineTo(sx + 3, sy);
          bgCtx.moveTo(sx, sy - 3);
          bgCtx.lineTo(sx, sy + 3);
          bgCtx.stroke();
        }
      }

      bgCtx.globalAlpha = 1;

      // Render Expanding Starlight Rings (Shockwaves of light)
      for (let i = ringsRef.current.length - 1; i >= 0; i--) {
        const r = ringsRef.current[i];
        r.radius += (r.maxRadius - r.radius) * 0.08;
        r.alpha -= 0.022;

        if (r.alpha <= 0) {
          ringsRef.current.splice(i, 1);
          continue;
        }

        fxCtx.save();
        fxCtx.globalAlpha = r.alpha;
        fxCtx.strokeStyle = r.color;
        fxCtx.lineWidth = 1.2;
        fxCtx.shadowColor = r.color;
        fxCtx.shadowBlur = 10;
        fxCtx.beginPath();
        fxCtx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        fxCtx.stroke();
        fxCtx.restore();
      }

      // Render Natural Shooting Meteors
      for (let i = meteorsRef.current.length - 1; i >= 0; i--) {
        const m = meteorsRef.current[i];
        m.x += m.vx;
        m.y += m.vy;
        m.alpha -= 0.016;

        if (m.alpha <= 0 || m.x > width + 50 || m.y > height + 50) {
          meteorsRef.current.splice(i, 1);
          continue;
        }

        fxCtx.save();
        fxCtx.globalAlpha = m.alpha;
        const grad = fxCtx.createLinearGradient(
          m.x,
          m.y,
          m.x - m.vx * 7,
          m.y - m.vy * 7
        );
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.3, m.color);
        grad.addColorStop(1, 'transparent');

        fxCtx.strokeStyle = grad;
        fxCtx.lineWidth = m.width;
        fxCtx.lineCap = 'round';
        fxCtx.beginPath();
        fxCtx.moveTo(m.x, m.y);
        fxCtx.lineTo(m.x - m.vx * (m.length / 10), m.y - m.vy * (m.length / 10));
        fxCtx.stroke();
        fxCtx.restore();
      }

      // Render Ethereal Constellations (Scorpio & Heart)
      for (let i = constellationsRef.current.length - 1; i >= 0; i--) {
        const c = constellationsRef.current[i];
        c.alpha -= 0.007; // Smooth slow fade

        if (c.alpha <= 0) {
          constellationsRef.current.splice(i, 1);
          continue;
        }

        fxCtx.save();
        fxCtx.translate(c.x, c.y);
        fxCtx.scale(c.scale, c.scale);
        fxCtx.globalAlpha = Math.min(1, c.alpha);

        // Ultra-fine glowing filament lines
        fxCtx.strokeStyle = 'rgba(253, 164, 175, 0.45)';
        fxCtx.lineWidth = 1;
        fxCtx.shadowColor = '#fda4af';
        fxCtx.shadowBlur = 6;

        for (const [fromIdx, toIdx] of c.lines) {
          const p1 = c.nodes[fromIdx];
          const p2 = c.nodes[toIdx];
          if (p1 && p2) {
            fxCtx.beginPath();
            fxCtx.moveTo(p1.currentX, p1.currentY);
            fxCtx.lineTo(p2.currentX, p2.currentY);
            fxCtx.stroke();
          }
        }

        // Radiant star nodes
        for (const node of c.nodes) {
          const starColor = node.isSpecial ? '#fb7185' : '#fef08a'; // Antares is ruby
          drawDiamondStar(
            fxCtx,
            node.currentX,
            node.currentY,
            node.isSpecial ? 6 : 4,
            starColor,
            c.alpha,
            tick * 0.02
          );
        }

        fxCtx.restore();
      }

      // Render Floating Diamond Stardust Sparks
      for (let i = sparksRef.current.length - 1; i >= 0; i--) {
        const p = sparksRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.96; // Fluid friction
        p.vy *= 0.96;
        p.rotation += p.rotSpeed;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          sparksRef.current.splice(i, 1);
          continue;
        }

        drawDiamondStar(fxCtx, p.x, p.y, p.size, p.color, p.alpha, p.rotation);
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      clearInterval(shootingStarTimer);
      window.removeEventListener('resize', handleResize);
    };
  }, [lightingMode]);

  // Spawn Starlight Ripple
  const spawnRipple = (x: number, y: number, color: string = '#fbcfe8') => {
    ringsRef.current.push({
      x,
      y,
      radius: 4,
      maxRadius: 45 + Math.random() * 25,
      alpha: 0.8,
      color,
    });
  };

  // Spawn Premium Diamond Starburst
  const spawnDiamondBurst = (x: number, y: number) => {
    const colors = ['#ffffff', '#fef08a', '#fbcfe8', '#fda4af', '#bae6fd'];
    const count = 10 + Math.floor(Math.random() * 6);

    spawnRipple(x, y, '#fef08a');

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.2 + Math.random() * 3.2;
      sparksRef.current.push({
        x: x + (Math.random() - 0.5) * 10,
        y: y + (Math.random() - 0.5) * 10,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.3,
        size: Math.random() * 3 + 2,
        rotation: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 0.08,
        alpha: 1,
        decay: 0.016 + Math.random() * 0.015,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
  };

  // Spawn Ethereal Heart Constellation
  const spawnHeartConstellation = (x: number, y: number) => {
    spawnRipple(x, y, '#fda4af');
    const nodes: ConstellationNode[] = heartNormalized.map((pt) => ({
      x: pt.x,
      y: pt.y,
      currentX: pt.x,
      currentY: pt.y,
    }));

    constellationsRef.current.push({
      x,
      y,
      alpha: 1.1,
      scale: 0.95,
      nodes,
      lines: heartLines,
    });

    // Gentle sparkles around it
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 30 + Math.random() * 30;
      sparksRef.current.push({
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        size: Math.random() * 2.5 + 1.5,
        rotation: 0,
        rotSpeed: 0.03,
        alpha: 0.9,
        decay: 0.018,
        color: '#fbcfe8',
      });
    }
  };

  // Spawn Scorpio Constellation
  const spawnScorpioConstellation = (x: number, y: number) => {
    spawnRipple(x, y, '#fef08a');
    const nodes: ConstellationNode[] = scorpioNormalized.map((pt) => ({
      x: pt.x,
      y: pt.y,
      currentX: pt.x,
      currentY: pt.y,
      isSpecial: pt.isSpecial,
    }));

    constellationsRef.current.push({
      x,
      y,
      alpha: 1.2,
      scale: 1,
      nodes,
      lines: scorpioLines,
    });
  };

  // Spawn Sleek Shooting Star
  const spawnShootingStar = (x: number, y: number) => {
    const angle = (Math.PI / 4) + (Math.random() * 0.3 - 0.15);
    const speed = 12 + Math.random() * 6;
    meteorsRef.current.push({
      x: x - 60,
      y: y - 60,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      length: 120 + Math.random() * 60,
      width: 1.6,
      alpha: 0.95,
      color: '#fef08a',
    });
    spawnRipple(x, y, '#fef08a');
  };

  // GLOBAL TOUCH / POINTER HANDLERS
  useEffect(() => {
    const handleGlobalPointerDown = (e: PointerEvent) => {
      // Don't trigger if user is interacting with form inputs
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }

      const x = e.clientX;
      const y = e.clientY;
      const now = Date.now();

      const isDoubleTap = now - lastTapTimeRef.current < 300;
      lastTapTimeRef.current = now;

      // Hold listener (> 380ms) triggers Scorpio constellation & slow orbit
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
      holdTimerRef.current = window.setTimeout(() => {
        isOrbitingRef.current = !isOrbitingRef.current;
        spawnScorpioConstellation(x, y);
        romanticAudio.playCosmicChime('constellation');
        holdTimerRef.current = null;
      }, 380);

      if (isDoubleTap) {
        if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
        isOrbitingRef.current = !isOrbitingRef.current;
        spawnScorpioConstellation(x, y);
        romanticAudio.playCosmicChime('constellation');
        return;
      }

      // RANDOM PREMIUM VIBE SELECTION:
      // Randomly picks between refined diamond bursts, heart constellations, shooting stars, or Scorpio starlight
      const rand = Math.random();
      if (rand < 0.4) {
        // Diamond Starlight Burst & Ripple
        spawnDiamondBurst(x, y);
        romanticAudio.playCosmicChime('star');
      } else if (rand < 0.68) {
        // Celestial Heart Constellation Formation
        spawnHeartConstellation(x, y);
        romanticAudio.playCosmicChime('constellation');
      } else if (rand < 0.88) {
        // Sleek Shooting Star
        spawnShootingStar(x, y);
        romanticAudio.playCosmicChime('meteor');
      } else {
        // Luminous Scorpio Zodiac Starlight
        spawnScorpioConstellation(x, y);
        romanticAudio.playCosmicChime('constellation');
      }
    };

    const handleGlobalPointerUp = () => {
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
        holdTimerRef.current = null;
      }
    };

    const handleGlobalPointerMove = (e: PointerEvent) => {
      // Fluid, silk-like stardust trail under moving cursor/touch
      if (Math.random() > 0.6) {
        sparksRef.current.push({
          x: e.clientX,
          y: e.clientY,
          vx: (Math.random() - 0.5) * 1.2,
          vy: (Math.random() - 0.5) * 1.2,
          size: Math.random() * 2 + 1,
          rotation: Math.random() * Math.PI,
          rotSpeed: 0.04,
          alpha: 0.75,
          decay: 0.035,
          color: Math.random() > 0.5 ? '#fbcfe8' : '#fef08a',
        });
      }
    };

    window.addEventListener('pointerdown', handleGlobalPointerDown);
    window.addEventListener('pointerup', handleGlobalPointerUp);
    window.addEventListener('pointercancel', handleGlobalPointerUp);
    window.addEventListener('pointermove', handleGlobalPointerMove);

    return () => {
      window.removeEventListener('pointerdown', handleGlobalPointerDown);
      window.removeEventListener('pointerup', handleGlobalPointerUp);
      window.removeEventListener('pointercancel', handleGlobalPointerUp);
      window.removeEventListener('pointermove', handleGlobalPointerMove);
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    };
  }, []);

  return (
    <>
      {/* Background Starfield Canvas */}
      <canvas
        ref={bgCanvasRef}
        className="fixed inset-0 pointer-events-none z-0"
      />

      {/* Foreground Luminous Starlight FX Canvas */}
      <canvas
        ref={fxCanvasRef}
        className="fixed inset-0 pointer-events-none z-20"
      />
    </>
  );
};
