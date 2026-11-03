import React, { useEffect, useRef } from 'react';
import { GardenLightingMode } from './RealGardenBackground';
import { romanticAudio } from '../utils/romanticAudio';

interface AudioVisualizerProps {
  lightingMode?: GardenLightingMode;
  isPlaying?: boolean;
  className?: string;
}

interface FloatingParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseAlpha: number;
  alpha: number;
  color: string;
  glowColor: string;
  life: number;
  maxLife: number;
  frequencyIndex: number;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  lightingMode = 'twilight',
  isPlaying = false,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const isPlayingRef = useRef<boolean>(isPlaying);
  const lightingModeRef = useRef<GardenLightingMode>(lightingMode);

  // Keep refs synchronized with props for the animation loop
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    lightingModeRef.current = lightingMode;
  }, [lightingMode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Floating particles pool
    const particles: FloatingParticle[] = [];
    const MAX_PARTICLES = 60;

    // Palette generator according to current GardenLightingMode
    const getModeVisualConfig = (mode: GardenLightingMode) => {
      switch (mode) {
        case 'midnight':
          return {
            // Peak Prominence: Starlight diamond, neon cyan, electric indigo
            waveGradients: [
              'rgba(56, 189, 248, 0.45)', // sky-400
              'rgba(129, 140, 248, 0.40)', // indigo-400
              'rgba(244, 114, 182, 0.35)', // pink-400
            ],
            particleColors: ['#38bdf8', '#818cf8', '#67e8f9', '#c084fc', '#ffffff'],
            glowColor: 'rgba(56, 189, 248, 0.85)',
            glowBlur: 18,
            masterAlpha: 0.95,
            particleSpawnRate: 0.65,
            waveHeightMultiplier: 1.25,
          };
        case 'twilight':
          return {
            // High Visibility: Luminous magenta, twilight violet, golden stardust
            waveGradients: [
              'rgba(244, 63, 94, 0.42)',  // rose-500
              'rgba(192, 132, 252, 0.38)', // purple-400
              'rgba(251, 191, 36, 0.32)',  // amber-400
            ],
            particleColors: ['#f43f5e', '#fb7185', '#c084fc', '#fde047', '#fed7aa'],
            glowColor: 'rgba(244, 63, 94, 0.8)',
            glowBlur: 16,
            masterAlpha: 0.88,
            particleSpawnRate: 0.55,
            waveHeightMultiplier: 1.15,
          };
        case 'golden':
          return {
            // Sunset Golden Hour: Honey gold, warm amber, soft peach
            waveGradients: [
              'rgba(245, 158, 11, 0.32)', // amber-500
              'rgba(251, 191, 36, 0.28)', // amber-400
              'rgba(254, 215, 170, 0.22)', // orange-200
            ],
            particleColors: ['#fbbf24', '#f59e0b', '#fed7aa', '#f472b6'],
            glowColor: 'rgba(251, 191, 36, 0.6)',
            glowBlur: 12,
            masterAlpha: 0.65,
            particleSpawnRate: 0.38,
            waveHeightMultiplier: 1.0,
          };
        case 'daylight':
        default:
          return {
            // Soft & Subdued: Warm petal pink, soft sunbeam gold, translucent sky
            waveGradients: [
              'rgba(244, 114, 182, 0.22)', // pink-400
              'rgba(254, 240, 138, 0.20)', // yellow-200
              'rgba(186, 230, 253, 0.18)', // sky-200
            ],
            particleColors: ['#f472b6', '#fef08a', '#bae6fd'],
            glowColor: 'rgba(244, 114, 182, 0.45)',
            glowBlur: 8,
            masterAlpha: 0.45,
            particleSpawnRate: 0.25,
            waveHeightMultiplier: 0.85,
          };
      }
    };

    let time = 0;
    let smoothedEnergy = 0.2;
    let smoothedBass = 0.2;
    let smoothedTreble = 0.2;

    const render = () => {
      time += 0.025;

      // 1. Fetch live audio analysis
      const analysis = romanticAudio.getAudioAnalysis();
      const isAudible = analysis.isPlaying && (isPlayingRef.current || romanticAudio.getIsPlaying());

      // Target dynamic values
      const targetEnergy = isAudible ? Math.max(0.2, analysis.energy) : 0.08;
      const targetBass = isAudible ? Math.max(0.15, analysis.bass) : 0.06;
      const targetTreble = isAudible ? Math.max(0.15, analysis.treble) : 0.05;

      // Smooth interpolation for natural fluid response
      smoothedEnergy += (targetEnergy - smoothedEnergy) * 0.12;
      smoothedBass += (targetBass - smoothedBass) * 0.14;
      smoothedTreble += (targetTreble - smoothedTreble) * 0.15;

      const currentMode = lightingModeRef.current;
      const config = getModeVisualConfig(currentMode);

      ctx.clearRect(0, 0, width, height);

      // We anchor the waveform gracefully in the lower 18-25% of the screen
      const baselineY = height * 0.86;
      const wavePointsCount = 48;
      const pointSpacing = width / (wavePointsCount - 1);

      // Dynamic wave amplitude boosted by bass & current lighting mode
      const amplitude =
        (22 + smoothedBass * 65 + smoothedEnergy * 40) * config.waveHeightMultiplier;

      // 2. Render 3 Harmonic Translucent Waveform Ribbons
      const waves = [
        {
          frequency: 0.0035,
          speed: 1.4,
          phase: 0,
          color: config.waveGradients[0],
          ampFactor: 1.0,
        },
        {
          frequency: 0.0055,
          speed: 1.9,
          phase: Math.PI / 3,
          color: config.waveGradients[1],
          ampFactor: 0.75,
        },
        {
          frequency: 0.0075,
          speed: 2.3,
          phase: (Math.PI * 2) / 3,
          color: config.waveGradients[2],
          ampFactor: 0.55,
        },
      ];

      waves.forEach((w) => {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(0, height);

        for (let i = 0; i < wavePointsCount; i++) {
          const x = i * pointSpacing;
          // Time domain wave deformation
          const audioOffsetIdx = Math.floor((i / wavePointsCount) * analysis.timeData.length);
          const rawAudioVal = (analysis.timeData[audioOffsetIdx] - 128) / 128; // -1 to +1
          const audioDeform = isAudible ? rawAudioVal * (amplitude * 0.6) : 0;

          const harmonicSin =
            Math.sin(x * w.frequency + time * w.speed + w.phase) * amplitude * w.ampFactor;
          const secondarySin =
            Math.cos(x * w.frequency * 1.8 - time * 0.8) * (amplitude * 0.35);

          const y = baselineY + harmonicSin + secondarySin + audioDeform;

          if (i === 0) {
            ctx.lineTo(x, y);
          } else {
            // Smooth bezier interpolation
            const prevX = (i - 1) * pointSpacing;
            const cX = (prevX + x) / 2;
            ctx.quadraticCurveTo(prevX, y, cX, y);
          }
        }

        ctx.lineTo(width, height);
        ctx.closePath();

        // Create vertical gradient fade from crest to floor
        const grad = ctx.createLinearGradient(0, baselineY - amplitude * 1.5, 0, height);
        grad.addColorStop(0, w.color);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();
      });

      // 3. Render Floating Waveform Nodes along the Primary Wave
      ctx.save();
      ctx.shadowBlur = config.glowBlur;
      ctx.shadowColor = config.glowColor;

      for (let i = 0; i < wavePointsCount; i += 2) {
        const x = i * pointSpacing;
        const waveY =
          baselineY +
          Math.sin(x * 0.0035 + time * 1.4) * amplitude +
          Math.cos(x * 0.006 - time * 0.8) * (amplitude * 0.35);

        // Node circle
        const nodeRadius = 2 + smoothedEnergy * 3.5;
        const nodeAlpha = Math.min(1, 0.4 + smoothedEnergy * 0.6) * config.masterAlpha;

        ctx.beginPath();
        ctx.arc(x, waveY, nodeRadius, 0, Math.PI * 2);
        ctx.fillStyle = config.particleColors[i % config.particleColors.length];
        ctx.globalAlpha = nodeAlpha;
        ctx.fill();

        // Spawn upward drifting starlight motes on musical energy peaks
        if (
          isAudible &&
          Math.random() < config.particleSpawnRate * (smoothedEnergy + smoothedTreble) &&
          particles.length < MAX_PARTICLES
        ) {
          const pColor = config.particleColors[Math.floor(Math.random() * config.particleColors.length)];
          particles.push({
            x: x + (Math.random() - 0.5) * 20,
            y: waveY - 2,
            vx: (Math.random() - 0.5) * 1.2,
            vy: -(0.6 + Math.random() * 1.8 + smoothedBass * 2.2),
            radius: 1.5 + Math.random() * 2.8 + smoothedTreble * 2.0,
            baseAlpha: 0.7 + Math.random() * 0.3,
            alpha: 0,
            color: pColor,
            glowColor: config.glowColor,
            life: 0,
            maxLife: 60 + Math.random() * 70,
            frequencyIndex: i,
          });
        }
      }
      ctx.restore();

      // 4. Update and Render Floating Musical Beat Particles
      for (let pIdx = particles.length - 1; pIdx >= 0; pIdx--) {
        const p = particles[pIdx];
        p.life++;

        if (p.life >= p.maxLife) {
          particles.splice(pIdx, 1);
          continue;
        }

        // Float motion: upward with gentle romantic horizontal sine sway
        p.x += p.vx + Math.sin(time * 2 + p.life * 0.05) * 0.6;
        p.y += p.vy;

        // Fade in rapidly, linger warmly, fade out slowly
        const progress = p.life / p.maxLife;
        if (progress < 0.2) {
          p.alpha = (progress / 0.2) * p.baseAlpha;
        } else {
          p.alpha = (1 - progress) * p.baseAlpha;
        }

        p.alpha *= config.masterAlpha;

        // Render particle with ethereal glow in twilight / midnight
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
        if (currentMode === 'twilight' || currentMode === 'midnight') {
          ctx.shadowBlur = config.glowBlur * 1.2;
          ctx.shadowColor = p.glowColor;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        // Tiny starlight sparkle core for larger particles
        if (p.radius > 2.5 && (currentMode === 'twilight' || currentMode === 'midnight')) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 0.4, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        }

        ctx.restore();
      }

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    // Start animation loop
    animFrameIdRef.current = requestAnimationFrame(render);

    // Pause animation when document tab is hidden to conserve mobile battery
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (animFrameIdRef.current) {
          cancelAnimationFrame(animFrameIdRef.current);
          animFrameIdRef.current = null;
        }
      } else {
        if (!animFrameIdRef.current) {
          animFrameIdRef.current = requestAnimationFrame(render);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <div
      className={`fixed inset-0 pointer-events-none z-15 overflow-hidden transition-opacity duration-700 ${className}`}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};
