import React, { useEffect, useRef } from 'react';
import { GardenLightingMode } from './RealGardenBackground';

interface WeatherOverlayProps {
  lightingMode?: GardenLightingMode;
}

// Microscopic sunlit dust / pollen motes for daylight
interface SunMote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseAlpha: number;
  pulsePhase: number;
  pulseSpeed: number;
}

// Warm golden evening bokeh & sunset dust for golden hour
interface GoldenDust {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  wobblePhase: number;
}

// Shimmering celestial stardust particles for twilight
interface StarDust {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  twinklePhase: number;
  twinkleSpeed: number;
  color: string;
  hasGlint: boolean;
}

// Volumetric sun ray definition
interface SunRay {
  baseAngle: number;
  widthSpread: number;
  baseAlpha: number;
  breathSpeed: number;
  breathPhase: number;
  lengthMult: number;
}

export const WeatherOverlay: React.FC<WeatherOverlayProps> = ({ lightingMode = 'daylight' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lightingModeRef = useRef<GardenLightingMode>(lightingMode);

  // Sync ref
  useEffect(() => {
    lightingModeRef.current = lightingMode;
  }, [lightingMode]);

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

    // Smooth mode weights for cross-fading
    let daylightWeight = lightingModeRef.current === 'daylight' ? 1 : 0;
    let goldenWeight = lightingModeRef.current === 'golden' ? 1 : 0;
    let twilightWeight = lightingModeRef.current === 'twilight' ? 1 : 0;
    let midnightWeight = lightingModeRef.current === 'midnight' ? 1 : 0;

    // --- 1. Daylight Volumetric Sun Rays & Motes Setup ---
    const sunRays: SunRay[] = [
      { baseAngle: 0.58, widthSpread: 0.14, baseAlpha: 0.12, breathSpeed: 0.45, breathPhase: 0, lengthMult: 1.4 },
      { baseAngle: 0.76, widthSpread: 0.18, baseAlpha: 0.16, breathSpeed: 0.6, breathPhase: 1.8, lengthMult: 1.6 },
      { baseAngle: 0.98, widthSpread: 0.22, baseAlpha: 0.14, breathSpeed: 0.35, breathPhase: 3.5, lengthMult: 1.5 },
      { baseAngle: 1.22, widthSpread: 0.16, baseAlpha: 0.11, breathSpeed: 0.52, breathPhase: 4.9, lengthMult: 1.3 },
      { baseAngle: 1.42, widthSpread: 0.12, baseAlpha: 0.08, breathSpeed: 0.4, breathPhase: 2.3, lengthMult: 1.2 },
    ];

    const sunMotesCount = window.innerWidth < 640 ? 18 : 34;
    const sunMotes: SunMote[] = [];
    for (let i = 0; i < sunMotesCount; i++) {
      sunMotes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (0.15 + Math.random() * 0.3) * dpr,
        vy: (0.2 + Math.random() * 0.35) * dpr,
        size: (1.0 + Math.random() * 2.2) * dpr,
        baseAlpha: 0.25 + Math.random() * 0.55,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: 1.2 + Math.random() * 2.0,
      });
    }

    // --- 2. Golden Hour Sunset Haze & Warm Dust Setup ---
    const goldenDustCount = window.innerWidth < 640 ? 16 : 28;
    const goldenDust: GoldenDust[] = [];
    const goldenColors = [
      'rgba(251, 191, 36, 0.85)', // amber-400
      'rgba(245, 158, 11, 0.8)', // amber-500
      'rgba(251, 146, 60, 0.75)', // orange-400
      'rgba(253, 224, 71, 0.9)', // yellow-300
    ];
    for (let i = 0; i < goldenDustCount; i++) {
      goldenDust.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (0.1 + Math.random() * 0.25) * dpr,
        vy: (-0.15 - Math.random() * 0.3) * dpr, // buoyant evening upward drift
        size: (1.5 + Math.random() * 3.0) * dpr,
        alpha: 0.3 + Math.random() * 0.5,
        color: goldenColors[i % goldenColors.length],
        wobblePhase: Math.random() * Math.PI * 2,
      });
    }

    // --- 3. Twilight Nocturnal Mist & Stardust Setup ---
    const starDustCount = window.innerWidth < 640 ? 25 : 48;
    const starDust: StarDust[] = [];
    const twilightColors = [
      'rgba(224, 231, 255, 0.95)', // indigo-100
      'rgba(199, 210, 254, 0.9)', // indigo-200
      'rgba(251, 207, 232, 0.85)', // pink-200
      'rgba(254, 240, 138, 0.9)', // fairy pale gold
      'rgba(165, 243, 252, 0.9)', // cyan-200
    ];
    for (let i = 0; i < starDustCount; i++) {
      starDust.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (-0.12 - Math.random() * 0.22) * dpr, // gentle diagonal galactic drift
        vy: (0.15 + Math.random() * 0.25) * dpr,
        size: (1.0 + Math.random() * 2.2) * dpr,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: 1.5 + Math.random() * 3.0,
        color: twilightColors[i % twilightColors.length],
        hasGlint: Math.random() > 0.6,
      });
    }

    // --- 4. Midnight Deep Sapphire Mist & Prominent Stardust Setup ---
    const midnightStarDustCount = window.innerWidth < 640 ? 42 : 78;
    const midnightStarDust: StarDust[] = [];
    const midnightColors = [
      'rgba(255, 255, 255, 1)', // Brilliant diamond
      'rgba(186, 230, 253, 0.95)', // Soft celestial cyan
      'rgba(147, 197, 253, 0.95)', // Sapphire starlight
      'rgba(224, 231, 255, 0.95)', // Indigo-blue starlight
      'rgba(254, 240, 138, 0.95)', // Warm champagne gold star
      'rgba(251, 207, 232, 0.9)', // Rose stardust
    ];
    for (let i = 0; i < midnightStarDustCount; i++) {
      midnightStarDust.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (-0.16 - Math.random() * 0.28) * dpr,
        vy: (0.18 + Math.random() * 0.32) * dpr,
        size: (1.2 + Math.random() * 2.8) * dpr,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: 2.0 + Math.random() * 3.5,
        color: midnightColors[i % midnightColors.length],
        hasGlint: Math.random() > 0.45,
      });
    }

    let lastTime = performance.now();

    // Main animation loop
    const render = (time: number) => {
      animId = requestAnimationFrame(render);

      const dt = Math.min(0.1, (time - lastTime) / 1000);
      lastTime = time;
      const t = time * 0.001;

      // 1. Smooth cross-fade interpolation towards active lighting mode
      const currentMode = lightingModeRef.current;
      const targetDaylight = currentMode === 'daylight' ? 1 : 0;
      const targetGolden = currentMode === 'golden' ? 1 : 0;
      const targetTwilight = currentMode === 'twilight' ? 1 : 0;
      const targetMidnight = currentMode === 'midnight' ? 1 : 0;

      const fadeSpeed = dt * 1.8;
      daylightWeight += (targetDaylight - daylightWeight) * fadeSpeed;
      goldenWeight += (targetGolden - goldenWeight) * fadeSpeed;
      twilightWeight += (targetTwilight - twilightWeight) * fadeSpeed;
      midnightWeight += (targetMidnight - midnightWeight) * fadeSpeed;

      // Clear frame
      ctx.clearRect(0, 0, width, height);

      // ==============================================================
      // EFFECT 1: DAYLIGHT - SOFT SUN RAYS & SUNLIT POLLEN MOTES
      // ==============================================================
      if (daylightWeight > 0.005) {
        ctx.save();
        ctx.globalAlpha = Math.min(1, daylightWeight);

        // Volumetric Sun Origin (top-left sky beyond the rose arbor)
        const sunOriginX = width * 0.12;
        const sunOriginY = -40 * dpr;
        const maxRayDist = Math.hypot(width, height) * 1.1;

        // Render crepuscular sun rays with composite blending
        for (let i = 0; i < sunRays.length; i++) {
          const ray = sunRays[i];
          const breath = Math.sin(t * ray.breathSpeed + ray.breathPhase);
          const currentAlpha = ray.baseAlpha * (0.8 + breath * 0.28);
          const currentAngle = ray.baseAngle + Math.sin(t * 0.25 + i) * 0.025;
          const halfSpread = ray.widthSpread * (0.9 + breath * 0.15) * 0.5;

          const angle1 = currentAngle - halfSpread;
          const angle2 = currentAngle + halfSpread;
          const rayDist = maxRayDist * ray.lengthMult;

          const p1x = sunOriginX + Math.cos(angle1) * rayDist;
          const p1y = sunOriginY + Math.sin(angle1) * rayDist;
          const p2x = sunOriginX + Math.cos(angle2) * rayDist;
          const p2y = sunOriginY + Math.sin(angle2) * rayDist;

          // Radial-linear gradient cone for natural volumetric light falloff
          const grad = ctx.createRadialGradient(
            sunOriginX,
            sunOriginY,
            10 * dpr,
            sunOriginX,
            sunOriginY,
            rayDist * 0.85
          );
          grad.addColorStop(0, `rgba(255, 255, 230, ${currentAlpha * 0.95})`);
          grad.addColorStop(0.2, `rgba(254, 249, 195, ${currentAlpha * 0.75})`);
          grad.addColorStop(0.55, `rgba(253, 230, 138, ${currentAlpha * 0.35})`);
          grad.addColorStop(1, 'rgba(254, 240, 138, 0)');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.moveTo(sunOriginX, sunOriginY);
          ctx.lineTo(p1x, p1y);
          ctx.lineTo(p2x, p2y);
          ctx.closePath();
          ctx.fill();
        }

        // Sunlit pollen / dust motes drifting across the sunbeams
        for (let i = 0; i < sunMotes.length; i++) {
          const m = sunMotes[i];
          m.x += m.vx + Math.sin(t * 0.8 + i) * 0.2 * dpr;
          m.y += m.vy;

          if (m.x > width + 20 * dpr) m.x = -20 * dpr;
          if (m.y > height + 20 * dpr) {
            m.y = -20 * dpr;
            m.x = Math.random() * width;
          }

          const pulse = (Math.sin(t * m.pulseSpeed + m.pulsePhase) + 1) * 0.5;
          const effAlpha = m.baseAlpha * (0.4 + pulse * 0.6);

          ctx.beginPath();
          ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 253, 235, ${effAlpha})`;
          ctx.fill();

          // Soft halo around motes
          ctx.beginPath();
          ctx.arc(m.x, m.y, m.size * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(254, 240, 138, ${effAlpha * 0.25})`;
          ctx.fill();
        }

        ctx.restore();
      }

      // ==============================================================
      // EFFECT 2: GOLDEN HOUR - AMBER SUNSET HAZE & WARM DUST
      // ==============================================================
      if (goldenWeight > 0.005) {
        ctx.save();
        ctx.globalAlpha = Math.min(1, goldenWeight);

        // 1. Low Horizon Sun Flare / Golden Shimmer along bottom-left
        const sunsetGrad = ctx.createRadialGradient(
          width * 0.2,
          height * 0.82,
          50 * dpr,
          width * 0.3,
          height * 0.75,
          width * 0.85
        );
        sunsetGrad.addColorStop(0, 'rgba(251, 146, 60, 0.16)');
        sunsetGrad.addColorStop(0.35, 'rgba(245, 158, 11, 0.11)');
        sunsetGrad.addColorStop(0.7, 'rgba(217, 119, 6, 0.05)');
        sunsetGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');

        ctx.fillStyle = sunsetGrad;
        ctx.fillRect(0, 0, width, height);

        // 2. Rolling horizontal golden haze bands across middle & lower garden
        const bandCount = 3;
        for (let b = 0; b < bandCount; b++) {
          const baseY = height * (0.52 + b * 0.18);
          const hazeAlpha = 0.055 + Math.sin(t * 0.4 + b) * 0.02;

          ctx.beginPath();
          ctx.moveTo(0, baseY);

          // Wave curve across the screen width
          const steps = 8;
          for (let s = 0; s <= steps; s++) {
            const wx = (width / steps) * s;
            const wy = baseY + Math.sin(wx * 0.003 + t * 0.6 + b * 2) * (18 * dpr);
            if (s === 0) ctx.moveTo(wx, wy);
            else ctx.lineTo(wx, wy);
          }

          ctx.lineTo(width, height);
          ctx.lineTo(0, height);
          ctx.closePath();

          const hazeGrad = ctx.createLinearGradient(0, baseY - 20 * dpr, 0, height);
          hazeGrad.addColorStop(0, `rgba(251, 191, 36, ${hazeAlpha})`);
          hazeGrad.addColorStop(0.5, `rgba(245, 158, 11, ${hazeAlpha * 0.8})`);
          hazeGrad.addColorStop(1, 'rgba(251, 146, 60, 0)');
          ctx.fillStyle = hazeGrad;
          ctx.fill();
        }

        // 3. Floating buoyant golden dust & sunset sparks
        for (let i = 0; i < goldenDust.length; i++) {
          const g = goldenDust[i];
          g.x += g.vx + Math.sin(t * 0.7 + g.wobblePhase) * 0.3 * dpr;
          g.y += g.vy; // rising gently

          if (g.y < -30 * dpr) {
            g.y = height + 20 * dpr;
            g.x = Math.random() * width;
          }
          if (g.x > width + 20 * dpr) g.x = -20 * dpr;

          const shimmer = (Math.sin(t * 2.5 + i) + 1) * 0.5;
          const effAlpha = g.alpha * (0.5 + shimmer * 0.5);

          // Core spark
          ctx.beginPath();
          ctx.arc(g.x, g.y, g.size, 0, Math.PI * 2);
          ctx.fillStyle = g.color.replace(/[\d.]+\)$/, `${effAlpha})`);
          ctx.fill();

          // Warm outer glow
          ctx.beginPath();
          ctx.arc(g.x, g.y, g.size * 2.8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(245, 158, 11, ${effAlpha * 0.28})`;
          ctx.fill();
        }

        ctx.restore();
      }

      // ==============================================================
      // EFFECT 3: TWILIGHT - MISTY NOCTURNAL VEIL & GLITTERING STARDUST
      // ==============================================================
      if (twilightWeight > 0.005) {
        ctx.save();
        ctx.globalAlpha = Math.min(1, twilightWeight);

        // 1. Ethereal nocturnal mist layers floating over the lake & garden floor
        const mistBands = 3;
        for (let m = 0; m < mistBands; m++) {
          const mistBaseY = height * (0.62 + m * 0.14);
          const mistAlpha = 0.065 + Math.sin(t * 0.35 + m * 1.5) * 0.025;

          ctx.beginPath();
          const steps = 10;
          for (let s = 0; s <= steps; s++) {
            const mx = (width / steps) * s;
            const my =
              mistBaseY +
              Math.sin(mx * 0.0025 + t * 0.45 + m * 3) * (22 * dpr) +
              Math.cos(mx * 0.005 - t * 0.3) * (10 * dpr);
            if (s === 0) ctx.moveTo(mx, my);
            else ctx.lineTo(mx, my);
          }
          ctx.lineTo(width, height);
          ctx.lineTo(0, height);
          ctx.closePath();

          const mistGrad = ctx.createLinearGradient(0, mistBaseY - 30 * dpr, 0, height);
          if (m % 2 === 0) {
            mistGrad.addColorStop(0, `rgba(165, 180, 252, ${mistAlpha})`); // indigo-300
            mistGrad.addColorStop(0.5, `rgba(192, 132, 252, ${mistAlpha * 0.7})`); // purple-400
            mistGrad.addColorStop(1, 'rgba(129, 140, 248, 0)');
          } else {
            mistGrad.addColorStop(0, `rgba(147, 197, 253, ${mistAlpha})`); // blue-300
            mistGrad.addColorStop(0.6, `rgba(244, 114, 182, ${mistAlpha * 0.6})`); // pink-400
            mistGrad.addColorStop(1, 'rgba(99, 102, 241, 0)');
          }

          ctx.fillStyle = mistGrad;
          ctx.fill();
        }

        // 2. Celestial shimmering stardust drifting through the nocturnal air
        for (let i = 0; i < starDust.length; i++) {
          const s = starDust[i];
          s.x += s.vx + Math.sin(t * 0.5 + i) * 0.15 * dpr;
          s.y += s.vy;

          if (s.x < -20 * dpr) s.x = width + 20 * dpr;
          if (s.y > height + 20 * dpr) {
            s.y = -20 * dpr;
            s.x = Math.random() * width;
          }

          const twinkle = (Math.sin(t * s.twinkleSpeed + s.twinklePhase) + 1) * 0.5;
          const effAlpha = 0.2 + twinkle * 0.75;

          // Tiny luminous stardust bead
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
          ctx.fillStyle = s.color.replace(/[\d.]+\)$/, `${effAlpha})`);
          ctx.fill();

          // Soft starlight aura
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size * 2.6, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(199, 210, 254, ${effAlpha * 0.35})`;
          ctx.fill();

          // 4-point diamond sparkle glint for special stardust particles
          if (s.hasGlint && twinkle > 0.65) {
            const glintLen = s.size * (2.0 + twinkle * 3.5);
            const glintAlpha = (twinkle - 0.65) / 0.35 * effAlpha;

            ctx.strokeStyle = `rgba(255, 255, 255, ${glintAlpha})`;
            ctx.lineWidth = 1.0 * dpr;

            // Horizontal cross
            ctx.beginPath();
            ctx.moveTo(s.x - glintLen, s.y);
            ctx.lineTo(s.x + glintLen, s.y);
            ctx.stroke();

            // Vertical cross
            ctx.beginPath();
            ctx.moveTo(s.x, s.y - glintLen);
            ctx.lineTo(s.x, s.y + glintLen);
            ctx.stroke();
          }
        }

        ctx.restore();
      }

      // ==============================================================
      // EFFECT 4: MIDNIGHT - DEEP SAPPHIRE MIST & PROMINENT STARDUST
      // ==============================================================
      if (midnightWeight > 0.005) {
        ctx.save();
        ctx.globalAlpha = Math.min(1, midnightWeight);

        // 1. Deep sapphire and royal blue rolling nocturnal mist bands
        const mistBands = 4;
        for (let m = 0; m < mistBands; m++) {
          const mistBaseY = height * (0.58 + m * 0.12);
          const mistAlpha = 0.08 + Math.sin(t * 0.4 + m * 1.8) * 0.03;

          ctx.beginPath();
          const steps = 10;
          for (let s = 0; s <= steps; s++) {
            const mx = (width / steps) * s;
            const my =
              mistBaseY +
              Math.sin(mx * 0.003 + t * 0.5 + m * 2.5) * (26 * dpr) +
              Math.cos(mx * 0.006 - t * 0.35) * (14 * dpr);
            if (s === 0) ctx.moveTo(mx, my);
            else ctx.lineTo(mx, my);
          }
          ctx.lineTo(width, height);
          ctx.lineTo(0, height);
          ctx.closePath();

          const mistGrad = ctx.createLinearGradient(0, mistBaseY - 35 * dpr, 0, height);
          if (m % 2 === 0) {
            mistGrad.addColorStop(0, `rgba(59, 130, 246, ${mistAlpha})`); // blue-500
            mistGrad.addColorStop(0.5, `rgba(30, 58, 138, ${mistAlpha * 0.8})`); // blue-900
            mistGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
          } else {
            mistGrad.addColorStop(0, `rgba(147, 197, 253, ${mistAlpha})`); // sky-300
            mistGrad.addColorStop(0.5, `rgba(99, 102, 241, ${mistAlpha * 0.75})`); // indigo-500
            mistGrad.addColorStop(1, 'rgba(30, 58, 138, 0)');
          }

          ctx.fillStyle = mistGrad;
          ctx.fill();
        }

        // 2. Prominent celestial stardust with 4-point and 8-point diamond flares
        for (let i = 0; i < midnightStarDust.length; i++) {
          const s = midnightStarDust[i];
          s.x += s.vx + Math.sin(t * 0.6 + i) * 0.2 * dpr;
          s.y += s.vy;

          if (s.x < -20 * dpr) s.x = width + 20 * dpr;
          if (s.y > height + 20 * dpr) {
            s.y = -20 * dpr;
            s.x = Math.random() * width;
          }

          const twinkle = (Math.sin(t * s.twinkleSpeed + s.twinklePhase) + 1) * 0.5;
          const effAlpha = 0.25 + twinkle * 0.75;

          // Luminous stardust bead
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
          ctx.fillStyle = s.color.replace(/[\d.]+\)$/, `${effAlpha})`);
          ctx.fill();

          // Radiant starlight aura
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size * 3.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(186, 230, 253, ${effAlpha * 0.45})`;
          ctx.fill();

          // Prominent diamond cross flares (much more prominent than twilight)
          if (s.hasGlint && twinkle > 0.5) {
            const glintLen = s.size * (2.8 + twinkle * 4.2);
            const glintAlpha = (twinkle - 0.5) / 0.5 * effAlpha;

            ctx.strokeStyle = `rgba(255, 255, 255, ${glintAlpha})`;
            ctx.lineWidth = 1.2 * dpr;

            // Horizontal ray
            ctx.beginPath();
            ctx.moveTo(s.x - glintLen, s.y);
            ctx.lineTo(s.x + glintLen, s.y);
            ctx.stroke();

            // Vertical ray
            ctx.beginPath();
            ctx.moveTo(s.x, s.y - glintLen);
            ctx.lineTo(s.x, s.y + glintLen);
            ctx.stroke();

            // Additional 8-point diagonal flares for extra brilliant stars
            if (twinkle > 0.8) {
              const diagLen = glintLen * 0.55;
              ctx.lineWidth = 0.8 * dpr;
              ctx.beginPath();
              ctx.moveTo(s.x - diagLen, s.y - diagLen);
              ctx.lineTo(s.x + diagLen, s.y + diagLen);
              ctx.moveTo(s.x - diagLen, s.y + diagLen);
              ctx.lineTo(s.x + diagLen, s.y - diagLen);
              ctx.stroke();
            }
          }
        }

        ctx.restore();
      }
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[14] w-full h-full"
      style={{ willChange: 'transform, opacity' }}
      aria-hidden="true"
    />
  );
};

export default WeatherOverlay;
