# Mobile Performance Optimization: Silky Smooth & Lightweight 60 FPS

## Root Causes Resolved
1. **Uncapped Device Pixel Ratio (DPR 2x-3x)**: On modern phones, canvases were allocating ~3M pixels each. Compositing 5 stacked transparent canvases was burning >15 million pixels every 16ms.
2. **Continuous CSS `filter: blur()` & `drop-shadow()` Keyframes**: Animating CSS blur every frame forced mobile GPUs to re-rasterize entire screen textures continuously.
3. **Heavy Canvas `ctx.shadowBlur`**: Used across particles, stars, hearts, ripples, and waveform nodes, causing massive frame drops on mobile.
4. **Per-frame `createRadialGradient` Heap Allocations**: Fireflies was instantiating up to 200 radial gradient objects in JavaScript memory 60 times a second.
5. **Mobile `touchmove` React State Spam**: Scrolling on phone touchscreens triggered continuous React state re-renders of the garden background.

## Key Changes Applied
- **`src/index.css`**:
  - Replaced `filter: blur(...)` and `drop-shadow` in `bloomPulseDay`, `bloomPulseGolden`, and `bloomPulseTwilight` with GPU compositor opacity keyframes.
  - Capped `.glass-panel` and `.parchment-bg` to `blur(8px)` on desktop and `blur(4px)` on mobile screens.
  - Added `transform: translateZ(0)` for hardware acceleration.
- **`src/components/MoonlightPhase.tsx`**:
  - Replaced the heavy canvas rendering loop with 100% hardware-accelerated CSS conic & radial volumetric light shafts.
- **`src/components/Fireflies.tsx`**:
  - Clamped mobile DPR to 1.0.
  - Eliminated `createRadialGradient` allocations, replacing with high-speed multi-pass arc rendering (halo + mid-glow + core).
  - Streamlined firefly counts to 12-18 on mobile.
- **`src/components/FloatingHeartsOverlay.tsx`**:
  - Clamped mobile DPR to 1.0.
  - Removed all `ctx.shadowBlur` calls; used glowing stroke vectors.
  - Capped ambient floating hearts (3-4 max) and tap burst clusters (4 max on mobile) to eliminate touch lag.
- **`src/components/AudioVisualizer.tsx`**:
  - Clamped DPR to 1.0 on mobile.
  - Removed `ctx.shadowBlur` from waveform nodes and beat motes.
  - Reduced wave points from 48 to 18-20 on mobile; idle throttling when music is paused.
- **`src/components/FallingLeavesOverlay.tsx`**:
  - Removed duplicate firefly and dust logic; focused purely on 9-10 delicate rose petals on mobile.
  - Clamped DPR to 1.0 and removed shadow blur.
- **`src/components/WeatherOverlay.tsx`**:
  - Converted volumetric rays and haze into pure GPU CSS gradients.
  - Replaced heavy multi-band wave gradient canvas with a single-pass 14-mote micro-particle canvas.
- **`src/components/StarfieldCanvas.tsx`**:
  - Adjusted star density on mobile (50-80 stars instead of 260-440).
  - Removed `shadowBlur` from diamond stars, rings, and constellation lines.
- **`src/components/RealGardenBackground.tsx`**:
  - Disabled touchmove parallax on mobile touchscreens to ensure completely fluid 60-120 FPS finger scrolling without React re-render lag.
