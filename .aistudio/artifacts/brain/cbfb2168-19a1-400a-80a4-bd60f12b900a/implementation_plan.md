# A Cinematic Birthday Surprise for Hnin Lae Yee ❤️

A cinematic, mobile-first romantic garden birthday experience dedicated to Hnin Lae Yee (မနှင်းလေး / Baby) from her boyfriend Nyi Nyi, celebrating her 30th birthday on November 9, 2026, and their 899 days of love together.

## User Requirements & Aesthetic Direction

- **Theme & Atmosphere**: Realistic, daylight enchanted garden and azure sky blue theme with tumbling 3D Japanese red, amber, and emerald maple leaves falling from the sky.
- **Tree Style (Real-Life Botanical)**: Replaced poly dodecahedron meshes with realistic botanical Acer Palmatum (Japanese Maple) trees featuring procedural vertical-groove wood bark texture, curved multi-segment organic trunks with root flare, spreading branch hierarchy, and airy botanical leaf-cluster cards with alpha testing.
- **Moon Removal**: The moon has been completely removed across all scenes in favor of a daytime garden floral heart centerpiece (`GardenFloralArch`) and wishing rose (`GardenWishBlossom`).
- **Admin-Only Text Editing Security**: Strictly protected so that only authenticated administrators can edit texts, quotes, letters, or timeline milestones. Non-admins cannot edit texts; attempting to open the text editor prompts for the admin passcode. Inline direct click-to-edit is strictly restricted to active admin sessions.
- **Admin Song Upload**: Admins can upload any audio file (MP3, WAV, M4A, FLAC, OGG, AAC, WEBM) from their phone or computer. Uses dual-storage (IndexedDB local audio blob + Supabase cloud storage) so any song plays immediately and reliably across all scenes with zero 5MB quota restrictions, live audio preview, and one-click reset to default garden piano chimes.

---

## 1. Scene Flow & Features

```
[Scene 1: Secret Garden Entrance]
      │  Floral Heart Centerpiece + Daylight Welcome Quote & Headline
      ▼
[Scene 2: Heart Gate Password]
      │  Passcode: 2405 | Hint: "တို့နှစ်ယောက်ရဲ့ နှစ်ပတ်လည်နေ့စွဲ (၂၄ ရက်၊ ၅ လပိုင်း)"
      ▼
[Scene 3: Birthday Cake & Celebration]
      │  Candle blowing interaction + Flower petal confetti & wish message
      ▼
[Scene 4: The Heartfelt Love Letter]
      │  Parchment paper note with full sincere Burmese / multilingual text
      ▼
[Scene 5: Our Love Story Timeline]
      │  "899 ရက်တာ တို့နှစ်ယောက် လက်တွဲခဲ့ကြပြီ" -> Beginning, Journey, Today, Forever
      ▼
[Scene 6: Garden of Whispers]
      │  Interactive Blooming Wishing Rose -> Tap for sweet whispers from Nyi Nyi
      ▼
[Scene 7: Final Surprise Gift Box]
      │  Golden gift box -> Unwrapping animation -> Heartfelt final promise -> Replay
```

---

## 2. Text Editing & Music Capabilities (Admin Only)

- **Admin Access Protection**:
  - The floating `Edit Texts` button displays a lock icon when not in admin mode.
  - Clicking `Edit Texts` prompts for the Admin Passcode if not already logged in.
  - `AllTextEditorModal` contains an integrated admin passcode verification screen preventing unauthorized edits.
  - `EditableText` inline click-to-edit is only active when authenticated as admin.
- **Song Upload Features**:
  - Accessible via `🎵 Upload Song` on the top Admin Toolbar, inside the floating music player, in `AllTextEditorModal`'s `Background Song` tab, and in `SettingsModal`.
  - Supports all audio formats: MP3, WAV, M4A, FLAC, OGG, AAC, WEBM, mobile voice notes.
  - In-modal audio preview with Play/Pause and size information.
  - Seamless persistence via IndexedDB and Supabase cloud storage.
  - Reset to original romantic synthesized garden piano melody anytime.

---

## 3. Romantic Atmospheric Effects & Mobile Sizing

- **Floating Heart Animation (`FloatingHeartsOverlay`)**:
  - Periodically floats luminous pink, ruby, coral, blush, and golden hearts rising from the bottom of the screen.
  - Organic rhythmic scaling pulse (biological "lub-dub" heartbeat rhythm with primary contraction, soft diastolic recoil, and resting respiration).
  - Subtle non-uniform elastic squish/stretch and synchronized outer glow bloom on each pulse.
  - Smooth harmonic sine-wave horizontal drift and trailing sparkle glitter.
  - Tap-to-Burst Interaction: Tapping or clicking anywhere on the screen triggers a contact ripple ring and bursts a cluster of 6–10 hearts radially outward with pop-in expansion, drag deceleration, upward buoyancy, and fairy glitter stars.
- **Mobile-First Auto Sizing & Icon Fallbacks**:
  - Tab navigation buttons and admin action buttons strictly sized at 30px x 25px with icon-only presentation on mobile.
  - Active tab indicator badge clearly identifies current tab without squishing button rows.
  - Header and language bars adjusted to compact mobile proportions with auto font size fitting.
- **Dreamy Optical Bloom & Glow Filter (`RealGardenBackground`)**:
  - Optical diffusion pass (`mix-blend-screen` with mode-tuned blur, brightness, and saturation pulse) emulating Pro-Mist cinema lenses.
  - Golden Hour Sunset mode: Rich golden-amber sunburst bloom across the lake horizon, warm apricot flower aura, and luminous atmospheric streaks.
  - Twilight Night mode: Ethereal violet-indigo starlight mist, bioluminescent floral and waterfall glisten, and celestial bloom.
  - Daylight mode: Gentle sunbeam diffusion through the rose canopy.
- **Streamlined Navigation & Minimalist Chrome**:
  - Removed the unused compass viewpoint button on the bottom-left to maximize unobstructed garden visibility.
  - Removed the public "Birthday Wishes from Others" (Guestbook) button from the bottom navigation bar and final surprise scene, keeping the experience focused and intimate.
- **Ambient Daylight Birdsong & Tap Kiss Sound Layer (`AmbientBirdsongEngine`)**:
  - Procedural Web Audio API songbird synthesis playing soft, sweet chirps, morning trills, and answering calls exclusively during Daylight mode.
  - Automatically pauses when transitioning to Golden Sunset or Twilight Night modes.
  - Procedural romantic 'kiss' sound effect (peck/mwah sound via sine suction sweep, shaped bandpass noise release, and warm 680Hz acoustic body tone) triggered synchronously when tapping or clicking the screen for a heart burst.
  - Kiss sound effect is governed strictly by the exact same audio volume settings, enable/disable toggle, and mute state as the ambient birdsong.
  - Settings Modal and Admin Editor have been updated to reflect both effects with "Test Chirp" and "Test Kiss" preview buttons.
- **Enchanted Bioluminescent Fireflies (`Fireflies`)**:
  - Adds randomized, slow-moving golden dots across the screen that twinkle on and off with organic bioluminescence.
  - Multi-tier radial gradient lighting: intense white-gold core, warm amber-yellow mid glow, and soft breathing outer aura.
  - Physics-based gentle meandering with sinusoidal angle drift and natural upward buoyancy.
  - Lighting Mode-Sensitive Frequency:
    - **Twilight Mode**: Peak density (42–64 fireflies) with luminous, frequent twinkling cycles that transform the evening garden into a fairy-tale starlight haven.
    - **Golden Sunset Mode**: Moderate emergence (18–28 fireflies) warming up the dusk atmosphere.
    - **Daylight Mode**: Sparse subtle golden sunbeam motes (7–12 fireflies).
  - Smooth population transitions when switching modes, without abrupt pops or flashes.
  - Interactive touch/pointer repulsion and curiosity alert flash.
- **Atmospheric Weather Overlay (`WeatherOverlay`)**:
  - Adds dynamic, mode-dependent atmospheric weather effects that smoothly cross-fade when changing garden lighting:
    - **Daylight**: Volumetric crepuscular 'soft sun rays' emanating from the top sky with undulating breathing intensity and microscopic sunlit pollen motes.
    - **Golden Hour**: Low-angle sunset radiance, rolling horizontal amber-apricot mist bands across the lake and garden floor, and warm buoyant sunset dust sparks.
    - **Twilight**: Ethereal rolling nocturnal ground mist in soft indigo, purple, and cyan tones paired with celestial glittering stardust particles drifting in slow diagonal streams with diamond 4-point sparkle glints.
    - **Midnight**: Deep sapphire and royal blue nocturnal mist bands, paired with intensified celestial stardust with 4-point and 8-point diamond flares.
  - Optimized hardware-accelerated canvas implementation with smooth exponential cross-fading and zero CPU overhead.
- **Midnight Lighting Mode (`'midnight'`)**:
  - Introduced as a 4th lighting mode alongside Daylight, Golden Sunset, and Twilight.
  - Features a deep blue/sapphire color palette (`#0f172a`, deep lapis, royal navy, celestial cyan) with high-contrast cinematic color grading and anamorphic bloom highlights.
  - Increased firefly density (68–100 fireflies) with luminous bioluminescence shining brightly against the dark midnight backdrop.
  - Enhanced celestial starlight with 260–440 stars, prominent cross flares, faster meteor showers, and a moonbeam sheen across the lake.
  - Integrated into the mobile-friendly `GardenAtmosphereBar` with a dedicated MoonStar button and multilingual labels.
- **Dynamic Romantic Love Scroll (`LoveScroll`)**:
  - A dynamic, slow-scrolling marquee ribbon floating at the bottom of the screen that continuously loops romantic birthday wishes.
  - Features soft left and right gradient fade masks, an animated glowing heart ribbon badge, and seamless CSS translate marquee looping.
  - Interactive pause: users can tap or hover anywhere on the marquee to pause and read wishes comfortably, or tap again to resume.
  - Positioned thoughtfully to preserve full access to the bottom-right Memories and Settings buttons.
  - Fully manageable via `AllTextEditorModal` under a dedicated "Love Scroll Wishes" tab, allowing the admin to customize message wording in all 4 languages (Burmese, English, Korean, Chinese), add new wishes, delete wishes, or toggle marquee visibility.
- **Serene Moonlight Idle Phase (`MoonlightPhase`)**:
  - Triggers automatically upon 18 seconds of continuous inactivity (resting gaze mode).
  - Subtly cools the entire scene's color temperature via a multi-layered silver-cyan white-balance shift and soft-light lunar wash with deep nocturnal vignetting.
  - Renders a slow-moving, sweeping volumetric 'moonbeam' light shaft originating high in the celestial night sky that glides across the lake and floral arch in a graceful 26-second pendulum sweep.
  - Generates floating lunar silver dust motes that glow brightly when illuminated by the sweeping light cone.
  - Displays a discrete romantic badge ("🌙 Serene Moonlight Gaze").
  - Seamlessly dissolves back to the active scene upon any pointer move, tap, touch, keypress, or scroll via a gentle 2.5s transition.






