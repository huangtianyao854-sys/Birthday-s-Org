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

    const isMobile = window.innerWidth < 768;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const handleResize = () => {
      if (!canvas) return;
      const mob = window.innerWidth < 768;
      const dpr = mob ? 1.0 : Math.min(window.devicePixelRatio || 1, 1.25);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Floating particles pool
    const particles: FloatingParticle[] = [];
    const MAX_PARTICLES = isMobile ? 10 : 22;

    // Palette generator according to current GardenLightingMode
    const getModeVisualConfig = (mode: GardenLightingMode) => {
      switch (mode) {
        case 'midnight':
          return {
            waveGradients: [
              'rgba(56, 189, 248, 0.40)', // sky-400
              'rgba(129, 140, 248, 0.35)', // indigo-400
              'rgba(244, 114, 182, 0.30)', // pink-400
            ],
            particleColors: ['#38bdf8', '#818cf8', '#67e8f9', '#c084fc', '#ffffff'],
            glowColor: 'rgba(56, 189, 248, 0.5)',
            masterAlpha: 0.9,
            particleSpawnRate: 0.45,
            waveHeightMultiplier: 1.1,
          };
        case 'twilight':
          return {
            waveGradients: [
              'rgba(244, 63, 94, 0.36)',  // rose-500
              'rgba(192, 132, 252, 0.32)', // purple-400
              'rgba(251, 191, 36, 0.28)',  // amber-400
            ],
            particleColors: ['#f43f5e', '#fb7185', '#c084fc', '#fde047', '#fed7aa'],
            glowColor: 'rgba(244, 63, 94, 0.45)',
            masterAlpha: 0.82,
            particleSpawnRate: 0.4,
            waveHeightMultiplier: 1.05,
          };
        case 'golden':
          return {
            waveGradients: [
              'rgba(245, 158, 11, 0.32)', // amber-500
              'rgba(251, 146, 60, 0.26)', // orange-400
              'rgba(254, 240, 138, 0.22)', // yellow-200
            ],
            particleColors: ['#f59e0b', '#fb923c', '#fef08a', '#ea580c'],
            glowColor: 'rgba(245, 158, 11, 0.4)',
            masterAlpha: 0.65,
            particleSpawnRate: 0.3,
            waveHeightMultiplier: 0.95,
          };
        case 'daylight':
        default:
          return {
            waveGradients: [
              'rgba(244, 114, 182, 0.20)', // pink-400
              'rgba(254, 240, 138, 0.18)', // yellow-200
              'rgba(186, 230, 253, 0.16)', // sky-200
            ],
            particleColors: ['#f472b6', '#fef08a', '#bae6fd'],
            glowColor: 'rgba(244, 114, 182, 0.35)',
            masterAlpha: 0.4,
            particleSpawnRate: 0.2,
            waveHeightMultiplier: 0.8,
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

      // If audio is not playing and particles are empty, throttle
      if (!isAudible && smoothedEnergy < 0.05 && particles.length === 0) {
        ctx.clearRect(0, 0, width, height);
        animFrameIdRef.current = requestAnimationFrame(render);
        return;
      }

      // Target dynamic values
      const targetEnergy = isAudible ? Math.max(0.2, analysis.energy) : 0.04;
      const targetBass = isAudible ? Math.max(0.15, analysis.bass) : 0.03;
      const targetTreble = isAudible ? Math.max(0.15, analysis.treble) : 0.03;

      // Smooth interpolation for natural fluid response
      smoothedEnergy += (targetEnergy - smoothedEnergy) * 0.12;
      smoothedBass += (targetBass - smoothedBass) * 0.14;
      smoothedTreble += (targetTreble - smoothedTreble) * 0.15;

      const currentMode = lightingModeRef.current;
      const config = getModeVisualConfig(currentMode);

      ctx.clearRect(0, 0, width, height);

      // Baseline position
      const baselineY = height * 0.86;
      const wavePointsCount = isMobile ? 18 : 32;
      const pointSpacing = width / (wavePointsCount - 1);

      // Dynamic wave amplitude boosted by bass & current lighting mode
      const amplitude =
        (16 + smoothedBass * 50 + smoothedEnergy * 30) * config.waveHeightMultiplier;

      // 2. Render 2 Harmonic Translucent Waveform Ribbons (Fast 2-pass)
      const waves = [
        {
          frequency: 0.0035,
          speed: 1.4,
          phase: 0,
          color: config.waveGradients[0],
        },
        {
          frequency: 0.006,
          speed: 2.0,
          phase: Math.PI / 3,
          color: config.waveGradients[1],
        },
      ];

      waves.forEach((w) => {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(0, height);

        for (let i = 0; i < wavePointsCount; i++) {
          const x = i * pointSpacing;
          const audioOffsetIdx = Math.floor((i / wavePointsCount) * analysis.timeData.length);
          const rawWaveVal = analysis.timeData[audioOffsetIdx] || 128;
          const normalizedAudioDisp = isAudible ? (rawWaveVal - 128) / 128 : 0;

          const harmonicSway = Math.sin(x * w.frequency + time * w.speed + w.phase);
          const y =
            baselineY +
            harmonicSway * amplitude +
            normalizedAudioDisp * (amplitude * 0.7);

          if (i === 0) {
            ctx.lineTo(x, y);
          } else {
            const prevX = (i - 1) * pointSpacing;
            const cX = (prevX + x) / 2;
            ctx.quadraticCurveTo(prevX, y, cX, y);
          }
        }

        ctx.lineTo(width, height);
        ctx.closePath();

        const grad = ctx.createLinearGradient(0, baselineY - amplitude, 0, height);
        grad.addColorStop(0, w.color);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();
      });

      // 3. Render Floating Waveform Nodes along the Primary Wave (Zero shadowBlur overhead)
      for (let i = 0; i < wavePointsCount; i += 2) {
        const x = i * pointSpacing;
        const waveY =
          baselineY +
          Math.sin(x * 0.0035 + time * 1.4) * amplitude +
          Math.cos(x * 0.006 - time * 0.8) * (amplitude * 0.3);

        const nodeRadius = 2 + smoothedEnergy * 2.5;
        const nodeAlpha = Math.min(1, 0.4 + smoothedEnergy * 0.5) * config.masterAlpha;

        // Outer halo
        ctx.beginPath();
        ctx.arc(x, waveY, nodeRadius * 2.0, 0, Math.PI * 2);
        ctx.fillStyle = config.glowColor;
        ctx.globalAlpha = nodeAlpha * 0.35;
        ctx.fill();

        // Node dot
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
            x: x + (Math.random() - 0.5) * 16,
            y: waveY - 2,
            vx: (Math.random() - 0.5) * 0.8,
            vy: -(0.5 + Math.random() * 1.4 + smoothedBass * 1.6),
            radius: 1.4 + Math.random() * 2.0,
            baseAlpha: 0.6 + Math.random() * 0.3,
            alpha: 0,
            color: pColor,
            glowColor: config.glowColor,
            life: 0,
            maxLife: 50 + Math.random() * 50,
          });
        }
      }

      // 4. Update and Render Floating Musical Beat Particles
      for (let pIdx = particles.length - 1; pIdx >= 0; pIdx--) {
        const p = particles[pIdx];
        p.life++;

        if (p.life >= p.maxLife) {
          particles.splice(pIdx, 1);
          continue;
        }

        p.x += p.vx + Math.sin(time * 2 + p.life * 0.05) * 0.5;
        p.y += p.vy;

        const progress = p.life / p.maxLife;
        p.alpha = (progress < 0.2 ? progress / 0.2 : 1 - progress) * p.baseAlpha * config.masterAlpha;

        // Draw particle glow (multi-pass arc without costly shadowBlur)
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = p.glowColor;
        ctx.globalAlpha = p.alpha * 0.35;
        ctx.fill();

        // Inner solid particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
      }

      ctx.globalAlpha = 1.0;
      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

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
