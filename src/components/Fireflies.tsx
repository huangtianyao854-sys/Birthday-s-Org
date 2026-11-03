import React, { useEffect, useRef } from 'react';
import { GardenLightingMode } from './RealGardenBackground';

interface Firefly {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseSpeed: number;
  wanderAngle: number;
  wanderSpeed: number;
  size: number;
  glowRadius: number;
  colorTheme: {
    core: string;
    midGlow: string;
    outerAura: string;
    warmth: string;
  };
  // Twinkle & bioluminescence state
  flashState: 'dark' | 'rising' | 'peaking' | 'decaying';
  flashTimer: number;
  darkDuration: number;
  riseDuration: number;
  peakDuration: number;
  decayDuration: number;
  currentAlpha: number;
  maxAlpha: number;
  targetMaxAlpha: number;
  // Dynamic mode transitions
  fadeAlpha: number; // 0 to 1 for smooth entrance/exit
  isFadingOut: boolean;
  // Interaction response
  alertTimer: number;
}

interface FirefliesProps {
  lightingMode?: GardenLightingMode;
}

const FIREFLY_PALETTES = [
  // 1. Classic Summer Gold (Warm Lampyridae)
  {
    core: '#ffffff',
    midGlow: 'rgba(254, 240, 138, 0.95)', // yellow-200
    outerAura: 'rgba(250, 204, 21, 0.45)', // yellow-400
    warmth: 'rgba(245, 158, 11, 0.18)', // amber-500
  },
  // 2. Fairy Chartreuse / Emerald Meadow Gold
  {
    core: '#fefce8',
    midGlow: 'rgba(234, 179, 8, 0.9)', // yellow-500
    outerAura: 'rgba(163, 230, 53, 0.4)', // lime-400
    warmth: 'rgba(132, 204, 22, 0.16)', // lime-500
  },
  // 3. Deep Honey Amber (Romantic Sunset)
  {
    core: '#fffbeb',
    midGlow: 'rgba(251, 191, 36, 0.92)', // amber-400
    outerAura: 'rgba(245, 158, 11, 0.48)', // amber-500
    warmth: 'rgba(217, 119, 6, 0.2)', // amber-600
  },
  // 4. Soft Rose Gold Firefly (Dreamy Garden)
  {
    core: '#ffffff',
    midGlow: 'rgba(253, 230, 138, 0.9)', // amber-200
    outerAura: 'rgba(251, 146, 60, 0.42)', // orange-400
    warmth: 'rgba(244, 63, 94, 0.15)', // rose-500
  },
  // 5. Luminous Moonlight Starlight Gold
  {
    core: '#ffffff',
    midGlow: 'rgba(254, 252, 232, 0.95)',
    outerAura: 'rgba(253, 224, 71, 0.5)',
    warmth: 'rgba(250, 204, 21, 0.22)',
  },
];

export const Fireflies: React.FC<FirefliesProps> = ({ lightingMode = 'daylight' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lightingModeRef = useRef<GardenLightingMode>(lightingMode);

  // Keep lightingModeRef in sync
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

    const resizeCanvas = () => {
      if (!canvas) return;
      dpr = window.devicePixelRatio || 1;
      width = canvas.width = window.innerWidth * dpr;
      height = canvas.height = window.innerHeight * dpr;
    };

    window.addEventListener('resize', resizeCanvas);

    // Pointer interactivity (soft deflection & curiosity glow)
    let pointerX = -9999;
    let pointerY = -9999;
    let lastPointerTime = 0;

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e && e.touches.length > 0 ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e && e.touches.length > 0 ? e.touches[0].clientY : (e as MouseEvent).clientY;
      if (clientX !== undefined && clientY !== undefined) {
        pointerX = clientX * dpr;
        pointerY = clientY * dpr;
        lastPointerTime = performance.now();
      }
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerMove, { passive: true });

    // Target firefly count by lighting mode:
    // Midnight: highest firefly density, magical swarms illuminating the deep blue darkness
    // Twilight: dense, magical enchanted evening atmosphere with lots of twinkling golden lights
    // Golden: moderate sunset emergence
    // Daylight: gentle, sparse golden motes catching the sun
    const getTargetCount = (mode: GardenLightingMode): number => {
      if (mode === 'midnight') {
        return window.innerWidth < 640 ? 68 : 100;
      }
      if (mode === 'twilight') {
        return window.innerWidth < 640 ? 42 : 64;
      }
      if (mode === 'golden') {
        return window.innerWidth < 640 ? 18 : 28;
      }
      return window.innerWidth < 640 ? 7 : 12;
    };

    // Mode-specific flash timing and brightness
    const getModeParams = (mode: GardenLightingMode) => {
      if (mode === 'midnight') {
        return {
          maxAlphaMin: 0.9,
          maxAlphaMax: 1.0,
          darkDurationMin: 0.7,
          darkDurationMax: 2.2,
          riseDurationMin: 0.3,
          riseDurationMax: 0.65,
          decayDurationMin: 0.45,
          decayDurationMax: 1.0,
          speedMult: 1.08,
        };
      }
      if (mode === 'twilight') {
        return {
          maxAlphaMin: 0.82,
          maxAlphaMax: 1.0,
          darkDurationMin: 1.0,
          darkDurationMax: 3.2,
          riseDurationMin: 0.35,
          riseDurationMax: 0.75,
          decayDurationMin: 0.5,
          decayDurationMax: 1.2,
          speedMult: 1.0,
        };
      }
      if (mode === 'golden') {
        return {
          maxAlphaMin: 0.65,
          maxAlphaMax: 0.9,
          darkDurationMin: 1.6,
          darkDurationMax: 4.2,
          riseDurationMin: 0.45,
          riseDurationMax: 0.9,
          decayDurationMin: 0.6,
          decayDurationMax: 1.4,
          speedMult: 0.9,
        };
      }
      // Daylight: softer, more spaced out
      return {
        maxAlphaMin: 0.4,
        maxAlphaMax: 0.65,
        darkDurationMin: 2.5,
        darkDurationMax: 5.5,
        riseDurationMin: 0.5,
        riseDurationMax: 1.0,
        decayDurationMin: 0.7,
        decayDurationMax: 1.6,
        speedMult: 0.85,
      };
    };

    let nextFireflyId = 1;
    const fireflies: Firefly[] = [];

    // Helper to spawn an individual firefly
    const spawnFirefly = (initialX?: number, initialY?: number, startAwake: boolean = false): Firefly => {
      const currentMode = lightingModeRef.current;
      const params = getModeParams(currentMode);
      const palette = FIREFLY_PALETTES[Math.floor(Math.random() * FIREFLY_PALETTES.length)];
      
      const x = initialX !== undefined ? initialX : Math.random() * width;
      const y = initialY !== undefined ? initialY : Math.random() * height;
      const baseSpeed = (0.22 + Math.random() * 0.45) * dpr * params.speedMult;
      const wanderAngle = Math.random() * Math.PI * 2;
      const wanderSpeed = 0.015 + Math.random() * 0.025;
      const size = (1.5 + Math.random() * 1.8) * dpr;
      const glowRadius = (10 + Math.random() * 14) * dpr;
      const targetMaxAlpha = params.maxAlphaMin + Math.random() * (params.maxAlphaMax - params.maxAlphaMin);

      // Start either dark or rising
      const flashState: 'dark' | 'rising' = startAwake && Math.random() > 0.4 ? 'rising' : 'dark';

      return {
        id: nextFireflyId++,
        x,
        y,
        vx: Math.cos(wanderAngle) * baseSpeed,
        vy: Math.sin(wanderAngle) * baseSpeed - 0.1 * dpr,
        baseSpeed,
        wanderAngle,
        wanderSpeed,
        size,
        glowRadius,
        colorTheme: palette,
        flashState,
        flashTimer: Math.random() * 1.5,
        darkDuration: params.darkDurationMin + Math.random() * (params.darkDurationMax - params.darkDurationMin),
        riseDuration: params.riseDurationMin + Math.random() * (params.riseDurationMax - params.riseDurationMin),
        peakDuration: 0.15 + Math.random() * 0.35,
        decayDuration: params.decayDurationMin + Math.random() * (params.decayDurationMax - params.decayDurationMin),
        currentAlpha: flashState === 'rising' ? 0.3 : 0,
        maxAlpha: targetMaxAlpha,
        targetMaxAlpha,
        fadeAlpha: 0, // Starts at 0 and fades in smoothly
        isFadingOut: false,
        alertTimer: 0,
      };
    };

    // Pre-populate initial fireflies
    const initialTarget = getTargetCount(lightingModeRef.current);
    for (let i = 0; i < initialTarget; i++) {
      const f = spawnFirefly(undefined, undefined, true);
      f.fadeAlpha = 1; // initial ones are fully present
      // Stagger initial phases
      if (Math.random() > 0.5) {
        f.flashState = 'rising';
        f.currentAlpha = Math.random() * f.maxAlpha;
      }
      fireflies.push(f);
    }

    let lastTime = performance.now();

    // Main animation loop
    const animate = (time: number) => {
      animId = requestAnimationFrame(animate);

      const dt = Math.min(0.1, (time - lastTime) / 1000);
      lastTime = time;

      const currentMode = lightingModeRef.current;
      const targetCount = getTargetCount(currentMode);
      const params = getModeParams(currentMode);

      // 1. Maintain population smoothly
      // Count currently non-fading fireflies
      const activeCount = fireflies.filter((f) => !f.isFadingOut).length;

      if (activeCount < targetCount) {
        // Spawn up to 2 per frame to smoothly ramp up
        const deficit = targetCount - activeCount;
        const toSpawn = Math.min(2, deficit);
        for (let i = 0; i < toSpawn; i++) {
          fireflies.push(spawnFirefly());
        }
      } else if (activeCount > targetCount) {
        // Mark excess fireflies to fade out
        let toRemoveCount = activeCount - targetCount;
        for (let i = 0; i < fireflies.length && toRemoveCount > 0; i++) {
          if (!fireflies[i].isFadingOut) {
            fireflies[i].isFadingOut = true;
            toRemoveCount--;
          }
        }
      }

      // 2. Clear canvas with clean clearRect
      ctx.clearRect(0, 0, width, height);

      const isPointerActive = performance.now() - lastPointerTime < 2500;
      const interactionRadius = 85 * dpr;

      // 3. Update & render each firefly
      for (let i = fireflies.length - 1; i >= 0; i--) {
        const f = fireflies[i];

        // Smooth population fade-in/fade-out
        if (f.isFadingOut) {
          f.fadeAlpha -= dt * 0.8;
          if (f.fadeAlpha <= 0.01) {
            fireflies.splice(i, 1);
            continue;
          }
        } else if (f.fadeAlpha < 1) {
          f.fadeAlpha = Math.min(1, f.fadeAlpha + dt * 1.2);
        }

        // Adjust target maxAlpha based on current mode
        f.targetMaxAlpha = params.maxAlphaMin + (f.id % 5) * 0.04;
        f.maxAlpha += (f.targetMaxAlpha - f.maxAlpha) * dt * 2;

        // --- Kinematics & Meandering ---
        f.wanderAngle += (Math.random() - 0.5) * f.wanderSpeed;
        const targetVx = Math.cos(f.wanderAngle) * f.baseSpeed;
        const targetVy = Math.sin(f.wanderAngle) * f.baseSpeed - 0.08 * dpr; // slight natural upward buoyancy

        f.vx += (targetVx - f.vx) * 0.04;
        f.vy += (targetVy - f.vy) * 0.04;

        // Pointer avoidance & curious flash
        if (isPointerActive) {
          const dx = f.x - pointerX;
          const dy = f.y - pointerY;
          const dist = Math.hypot(dx, dy);

          if (dist < interactionRadius && dist > 1) {
            const pushFactor = (1 - dist / interactionRadius) * 1.8 * dpr;
            f.vx += (dx / dist) * pushFactor;
            f.vy += (dy / dist) * pushFactor;
            f.alertTimer = 1.0; // Trigger alert glow
          }
        }

        if (f.alertTimer > 0) {
          f.alertTimer -= dt * 1.5;
        }

        f.x += f.vx;
        f.y += f.vy;

        // Soft screen bounds wrapping with gentle margin
        const pad = 40 * dpr;
        if (f.x < -pad) f.x = width + pad;
        else if (f.x > width + pad) f.x = -pad;
        if (f.y < -pad) f.y = height + pad;
        else if (f.y > height + pad) f.y = -pad;

        // --- Bioluminescence Twinkle State Machine ---
        f.flashTimer += dt;

        switch (f.flashState) {
          case 'dark':
            f.currentAlpha = 0;
            if (f.flashTimer >= f.darkDuration || f.alertTimer > 0.6) {
              f.flashState = 'rising';
              f.flashTimer = 0;
              // Randomize next dark duration
              f.darkDuration =
                params.darkDurationMin + Math.random() * (params.darkDurationMax - params.darkDurationMin);
            }
            break;

          case 'rising': {
            const progress = Math.min(1, f.flashTimer / Math.max(0.1, f.riseDuration));
            // Smooth ease-out swell
            f.currentAlpha = Math.sin((progress * Math.PI) / 2) * f.maxAlpha;
            if (progress >= 1) {
              f.flashState = 'peaking';
              f.flashTimer = 0;
            }
            break;
          }

          case 'peaking':
            // Slight organic micro-flutter during peak
            const microFlutter = Math.sin(time * 0.015 + f.id) * 0.05;
            f.currentAlpha = Math.min(1, Math.max(0, f.maxAlpha + microFlutter));
            if (f.flashTimer >= f.peakDuration) {
              f.flashState = 'decaying';
              f.flashTimer = 0;
            }
            break;

          case 'decaying': {
            const progress = Math.min(1, f.flashTimer / Math.max(0.1, f.decayDuration));
            // Smooth exponential-like decay
            f.currentAlpha = (1 - Math.sin((progress * Math.PI) / 2)) * f.maxAlpha;
            if (progress >= 1) {
              f.flashState = 'dark';
              f.flashTimer = 0;
              f.currentAlpha = 0;
            }
            break;
          }
        }

        // Boost alpha if recently alerted by pointer
        if (f.alertTimer > 0) {
          f.currentAlpha = Math.max(f.currentAlpha, f.alertTimer * 0.85);
        }

        const effAlpha = f.currentAlpha * f.fadeAlpha;
        if (effAlpha <= 0.008) continue; // Skip rendering if essentially invisible

        // --- Render Golden Bioluminescent Glow ---
        const { core, midGlow, outerAura, warmth } = f.colorTheme;
        const currentGlowRadius = f.glowRadius * (0.65 + effAlpha * 0.6);

        // 1. Soft Warm Ambient Halo
        const glowGrad = ctx.createRadialGradient(
          f.x,
          f.y,
          0,
          f.x,
          f.y,
          currentGlowRadius
        );
        glowGrad.addColorStop(0, midGlow.replace(/[\d.]+\)$/, `${effAlpha * 0.95})`));
        glowGrad.addColorStop(0.25, outerAura.replace(/[\d.]+\)$/, `${effAlpha * 0.65})`));
        glowGrad.addColorStop(0.65, warmth.replace(/[\d.]+\)$/, `${effAlpha * 0.3})`));
        glowGrad.addColorStop(1, 'rgba(250, 204, 21, 0)');

        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(f.x, f.y, currentGlowRadius, 0, Math.PI * 2);
        ctx.fill();

        // 2. Bright Concentrated Core Dot
        const coreRadius = Math.max(1.2 * dpr, f.size * (0.75 + effAlpha * 0.4));
        const coreGrad = ctx.createRadialGradient(
          f.x,
          f.y,
          0,
          f.x,
          f.y,
          coreRadius
        );
        coreGrad.addColorStop(0, `rgba(255, 255, 255, ${effAlpha})`);
        coreGrad.addColorStop(0.5, `rgba(254, 240, 138, ${effAlpha * 0.95})`);
        coreGrad.addColorStop(1, `rgba(250, 204, 21, ${effAlpha * 0.4})`);

        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(f.x, f.y, coreRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[16] w-full h-full"
      style={{ willChange: 'transform, opacity' }}
      aria-hidden="true"
    />
  );
};

export default Fireflies;
