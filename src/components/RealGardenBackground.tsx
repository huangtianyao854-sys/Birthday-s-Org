import React, { useState, useEffect } from 'react';
import { Sun, Sunset, Moon, Sparkles, X } from 'lucide-react';

export type GardenLightingMode = 'daylight' | 'golden' | 'twilight' | 'midnight';
export type GardenCameraView = 'arch' | 'bench' | 'pond' | 'vista';

interface HotspotInfo {
  id: string;
  titleBurmese: string;
  titleEnglish: string;
  descBurmese: string;
  descEnglish: string;
  icon: string;
  x: string; // percentage left
  y: string; // percentage top
}

const GARDEN_HOTSPOTS: HotspotInfo[] = [
  {
    id: 'rose-arch',
    titleBurmese: 'အချစ်နှင်းဆီ ပန်းခုံးကြီး',
    titleEnglish: 'The Grand Rose Archway',
    descBurmese: 'ဤပန်းခုံးပေါ်ရှိ နှင်းဆီပန်းပွင့်တိုင်းသည် မနှင်းလေးအပေါ် နီနီ့ရဲ့ ချစ်ခြင်းမေတ္တာနှင့် ဂရုစိုက်မှုတို့ကို ကိုယ်စားပြုနေပါတယ်။',
    descEnglish: 'Every single blooming rose on this archway symbolizes a promise of endless love and happiness for Hnin Lae Yee.',
    icon: '🌹',
    x: '38%',
    y: '32%',
  },
  {
    id: 'garden-bench',
    titleBurmese: 'နှစ်ယောက်ထိုင် ပန်းဥယျာဉ်ခုံတန်းလေး',
    titleEnglish: 'Our Cozy Garden Bench',
    descBurmese: 'အေးချမ်းတဲ့ ဥယျာဉ်ထဲမှာ နီနီနဲ့ မနှင်းလေး အတူတူလက်တွဲထိုင်ပြီး ရေပြင်ကျယ်နဲ့ တောင်တန်းကြီးတွေကို ငေးမောကြည့်ဖို့ သီးသန့်နေရာလေးပါ။',
    descEnglish: 'Our peaceful spot with a soft floral cushion, where we can sit close, hold hands, and watch the sun over the lake.',
    icon: '🪑',
    x: '22%',
    y: '68%',
  },
  {
    id: 'koi-waterfall',
    titleBurmese: 'ဆုတောင်းရေတံခွန်နှင့် ရေကန်',
    titleEnglish: 'Whispering Waterfall & Koi Pond',
    descBurmese: 'ကြည်လင်အေးမြတဲ့ ရေတံခွန်စီးဆင်းသံနှင့် ကံကောင်းခြင်းငါးလေးများက မနှင်းလေးရဲ့ မွေးနေ့မှာ စိတ်ချမ်းသာခြင်းအပြည့် ဆောင်ကြဉ်းပေးပါစေ။',
    descEnglish: 'The gentle crystal waterfall and happy koi bring peace, health, and good fortune to your special birthday year.',
    icon: '🐟',
    x: '82%',
    y: '78%',
  },
  {
    id: 'tree-lantern',
    titleBurmese: 'ရှေးဟောင်း မီးအိမ်လေး',
    titleEnglish: 'Vintage Garden Lantern',
    descBurmese: 'ညနေစောင်းချိန်တိုင်း အလင်းနွေးနွေးလေးပေးပြီး မနှင်းလေးရဲ့ အနာဂတ်လမ်းခရီးကို ထာဝရအလင်းဆောင်ပေးမယ့် မေတ္တာမီးအိမ်လေးပါ။',
    descEnglish: 'A warm golden light hanging from the garden tree, lighting up your world with warmth and sweet comfort.',
    icon: '🏮',
    x: '13%',
    y: '18%',
  },
  {
    id: 'lake-terrace',
    titleBurmese: 'ရေကန်ရှုခင်း ကော်ဖီဝိုင်းလေး',
    titleEnglish: 'Lakeside Bistro Terrace',
    descBurmese: 'အပြာရောင်ရေပြင်နှင့် တောင်တန်းစိမ်းလန်းမှုတို့ကို ငေးရင်း မနှင်းလေးနဲ့ နံနက်ခင်းကော်ဖီ အတူသောက်ချင်တဲ့ အိပ်မက်နေရာလေးပါ။',
    descEnglish: 'A quiet morning tea table overlooking turquoise waters and distant mountains, dreaming of our future together.',
    icon: '☕',
    x: '40%',
    y: '55%',
  },
];

interface RealGardenBackgroundProps {
  lightingMode?: GardenLightingMode;
  onChangeLightingMode?: (mode: GardenLightingMode) => void;
  showExploreMode?: boolean;
}

export const RealGardenBackground: React.FC<RealGardenBackgroundProps> = ({
  lightingMode = 'daylight',
  onChangeLightingMode,
  showExploreMode = false,
}) => {
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [activeHotspot, setActiveHotspot] = useState<HotspotInfo | null>(null);
  const [cameraView] = useState<GardenCameraView>('arch');

  // Subtle mobile touch & device motion parallax
  useEffect(() => {
    let frameId = 0;
    const handleMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const normX = (clientX / window.innerWidth - 0.5) * 10;
      const normY = (clientY / window.innerHeight - 0.5) * 8;

      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        setMouseOffset({ x: normX, y: normY });
      });
    };

    window.addEventListener('mousemove', handleMove, { passive: true });
    window.addEventListener('touchmove', handleMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleMove);
      cancelAnimationFrame(frameId);
    };
  }, []);

  // Compute mobile camera translation based on view selection for mobile immersion
  const getCameraTransform = () => {
    let panX = 0;
    let panY = 0;
    let scale = 1.05;

    switch (cameraView) {
      case 'arch':
        // Default focal point: perfectly centered on the Grand Rose Arch and Lake
        panX = 0;
        panY = 0;
        scale = 1.06;
        break;
      case 'bench':
        // Pan left toward the vintage garden bench
        panX = 18;
        panY = -6;
        scale = 1.1;
        break;
      case 'pond':
        // Pan right toward the cascading waterfall and koi pond
        panX = -20;
        panY = -8;
        scale = 1.1;
        break;
      case 'vista':
        // Wider perspective
        panX = 0;
        panY = 4;
        scale = 1.03;
        break;
    }

    return `translate3d(${panX - mouseOffset.x * 0.7}px, ${panY - mouseOffset.y * 0.7}px, 0) scale(${scale})`;
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none" aria-hidden="true">
      {/* 1. Core High-Fidelity Photorealistic Rose Garden Retreat Backdrop */}
      <div
        className="absolute inset-[-16px] sm:inset-[-24px] transition-transform duration-1000 ease-out will-change-transform"
        style={{ transform: getCameraTransform() }}
      >
        {/* 1. Base Photorealistic Rose Garden Retreat Backdrop with Cinematic Color Grading */}
        <img
          src="/assets/aistudio/Dreamy_Rose_Garden_Retreat_19bd990d.png"
          alt="Dreamy Rose Garden Retreat"
          // Mobile-first object positioning: 38% 36% perfectly anchors the rose arch and lake on tall mobile screens
          className={`w-full h-full object-cover object-[38%_36%] sm:object-center transition-all duration-1000 ${
            lightingMode === 'golden'
              ? 'filter contrast-[1.07] saturate-[1.28] brightness-[1.04] sepia-[0.14]'
              : lightingMode === 'midnight'
              ? 'filter contrast-[1.22] saturate-[1.32] brightness-[0.74] hue-rotate-[-18deg]'
              : lightingMode === 'twilight'
              ? 'filter contrast-[1.14] saturate-[1.20] brightness-[0.88] hue-rotate-[-8deg]'
              : 'filter contrast-[1.03] saturate-[1.08] brightness-[1.02]'
          }`}
          loading="eager"
        />

        {/* 1b. Optical Bloom & Dreamy Glow Diffusion Pass (Pro-Mist Lens Effect) */}
        <img
          src="/assets/aistudio/Dreamy_Rose_Garden_Retreat_19bd990d.png"
          alt=""
          aria-hidden="true"
          className={`absolute inset-0 w-full h-full object-cover object-[38%_36%] sm:object-center pointer-events-none transition-all duration-1000 mix-blend-screen ${
            lightingMode === 'golden'
              ? 'animate-bloom-golden'
              : lightingMode === 'midnight'
              ? 'animate-bloom-twilight opacity-75'
              : lightingMode === 'twilight'
              ? 'animate-bloom-twilight'
              : 'animate-bloom-day'
          }`}
        />

        {/* 1c. Dreamy Anamorphic Bloom Highlights (Enhanced for Golden, Twilight & Midnight) */}
        {lightingMode === 'golden' && (
          <div
            className="absolute inset-0 pointer-events-none mix-blend-screen opacity-75 animate-pulse"
            style={{
              background:
                'radial-gradient(ellipse at 52% 34%, rgba(251, 191, 36, 0.48) 0%, rgba(249, 115, 22, 0.32) 35%, rgba(244, 63, 94, 0.2) 60%, transparent 80%), radial-gradient(circle at 38% 30%, rgba(254, 240, 138, 0.4) 0%, transparent 50%), linear-gradient(135deg, rgba(254, 215, 170, 0.25) 0%, transparent 60%)',
              animationDuration: '5.5s',
            }}
          />
        )}

        {lightingMode === 'midnight' && (
          <div
            className="absolute inset-0 pointer-events-none mix-blend-screen opacity-85 animate-pulse"
            style={{
              background:
                'radial-gradient(ellipse at 50% 25%, rgba(37, 99, 235, 0.45) 0%, rgba(30, 58, 138, 0.38) 40%, rgba(15, 23, 42, 0.6) 75%), radial-gradient(circle at 78% 78%, rgba(56, 189, 248, 0.4) 0%, transparent 55%), radial-gradient(circle at 22% 65%, rgba(99, 102, 241, 0.32) 0%, transparent 50%)',
              animationDuration: '7s',
            }}
          />
        )}

        {lightingMode === 'twilight' && (
          <div
            className="absolute inset-0 pointer-events-none mix-blend-screen opacity-70 animate-pulse"
            style={{
              background:
                'radial-gradient(ellipse at 48% 30%, rgba(192, 132, 252, 0.42) 0%, rgba(96, 165, 250, 0.3) 38%, rgba(244, 114, 182, 0.22) 65%, transparent 85%), radial-gradient(circle at 82% 80%, rgba(103, 232, 249, 0.4) 0%, transparent 55%), radial-gradient(circle at 20% 70%, rgba(244, 114, 182, 0.25) 0%, transparent 50%)',
              animationDuration: '6s',
            }}
          />
        )}

        {lightingMode === 'daylight' && (
          <div
            className="absolute inset-0 pointer-events-none mix-blend-screen opacity-40"
            style={{
              background:
                'radial-gradient(ellipse at 45% 24%, rgba(254, 240, 138, 0.32) 0%, rgba(253, 164, 175, 0.2) 40%, transparent 75%)',
            }}
          />
        )}

        {/* 2. Living Waterfall & Koi Pond Water Shimmer (Bottom Right) */}
        <div
          className="absolute bottom-0 right-0 w-[55vw] sm:w-[42vw] h-[45vh] sm:h-[38vh] min-w-[260px] pointer-events-none opacity-50 mix-blend-screen"
          style={{
            background:
              'radial-gradient(ellipse at 80% 80%, rgba(125, 211, 252, 0.5) 0%, rgba(56, 189, 248, 0.25) 45%, transparent 75%)',
          }}
        >
          {/* Subtle water caustics wave overlay */}
          <div
            className="w-full h-full animate-pulse opacity-60 bg-[radial-gradient(#bae6fd_1.5px,transparent_1.5px)] [background-size:20px_14px]"
            style={{ animationDuration: '3.5s' }}
          />
        </div>

        {/* 3. Hanging Tree Lantern Glow (Top Left ~12% on desktop, ~8% on mobile) */}
        <div
          className="absolute left-[9%] sm:left-[11.5%] top-[14%] sm:top-[16%] w-20 h-20 sm:w-28 sm:h-28 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        >
          <div
            className={`w-full h-full rounded-full transition-all duration-1000 ${
              lightingMode === 'midnight'
                ? 'bg-amber-300 blur-xl opacity-100 animate-flame drop-shadow-[0_0_30px_rgba(245,158,11,1)]'
                : lightingMode === 'twilight'
                ? 'bg-amber-300/90 blur-xl opacity-95 animate-flame drop-shadow-[0_0_25px_rgba(245,158,11,0.9)]'
                : lightingMode === 'golden'
                ? 'bg-amber-200/70 blur-lg opacity-80 animate-pulse'
                : 'bg-amber-100/35 blur-md opacity-40'
            }`}
          />
        </div>

        {/* 4. Balustrade Pillar Lantern Glow (Right ~95%, 48%) */}
        <div
          className="absolute right-[4.5%] sm:right-[5%] top-[46%] sm:top-[48%] w-16 h-16 sm:w-24 sm:h-24 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        >
          <div
            className={`w-full h-full rounded-full transition-all duration-1000 ${
              lightingMode === 'midnight'
                ? 'bg-amber-300 blur-xl opacity-100 animate-flame drop-shadow-[0_0_26px_rgba(245,158,11,0.95)]'
                : lightingMode === 'twilight'
                ? 'bg-amber-300/90 blur-xl opacity-95 animate-flame drop-shadow-[0_0_20px_rgba(245,158,11,0.85)]'
                : lightingMode === 'golden'
                ? 'bg-amber-200/60 blur-md opacity-75 animate-pulse'
                : 'bg-amber-100/30 blur-sm opacity-35'
            }`}
          />
        </div>

        {/* 5. Volumetric Natural Daylight Sunbeams & Horizon Haze */}
        {lightingMode === 'daylight' && (
          <>
            <div className="absolute -top-12 left-[20vw] w-[55vw] h-[65vh] bg-gradient-to-b from-white/30 via-amber-50/10 to-transparent transform -rotate-12 blur-2xl pointer-events-none" />
            <div className="absolute top-2 left-1/2 w-48 h-48 -translate-x-1/2 rounded-full bg-white/20 blur-3xl pointer-events-none" />
          </>
        )}
      </div>

      {/* 6. Cinematic Modes: Visual Atmosphere Overlays */}
      {/* 🌅 SUNSET MODE: Warm Golden Hour Amber & Apricot glow */}
      {lightingMode === 'golden' && (
        <div className="absolute inset-0 transition-opacity duration-1000 pointer-events-none">
          {/* Golden sun horizon wash */}
          <div className="absolute inset-0 bg-gradient-to-t from-amber-600/30 via-rose-500/20 to-amber-200/25 mix-blend-color-burn" />
          {/* Warm setting sun radiance over lake */}
          <div className="absolute top-[28%] left-[55%] w-80 h-52 -translate-x-1/2 rounded-full bg-amber-400/45 blur-3xl mix-blend-screen" />
          {/* Dreamy golden rose bloom aura across the sky and flowers */}
          <div className="absolute inset-0 bg-gradient-to-b from-rose-400/15 via-amber-300/10 to-amber-900/30 mix-blend-overlay" />
          {/* Luminous horizon streak */}
          <div className="absolute top-[32%] inset-x-0 h-24 bg-gradient-to-r from-transparent via-amber-200/25 to-transparent blur-xl mix-blend-screen" />
        </div>
      )}

      {/* 🌙 TWILIGHT MODE: Deep Starry Sapphire Night & Bioluminescent Glow */}
      {lightingMode === 'twilight' && (
        <div className="absolute inset-0 transition-opacity duration-1000 pointer-events-none">
          {/* Midnight indigo atmosphere */}
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/75 via-blue-950/50 to-slate-950/65 mix-blend-multiply" />
          {/* Soft violet evening tone */}
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/25 via-transparent to-blue-900/35 mix-blend-screen" />
          {/* Dreamy starlight mist & celestial aura */}
          <div className="absolute top-[18%] left-1/2 -translate-x-1/2 w-[85vw] h-48 rounded-full bg-violet-400/15 blur-3xl mix-blend-screen" />

          {/* Twinkling Starlight Fields in upper sky (high contrast mix-blend-screen) */}
          <div className="absolute top-0 inset-x-0 h-[52vh] bg-[radial-gradient(#ffffff_2px,transparent_2px)] [background-size:36px_36px] opacity-85 mix-blend-screen animate-pulse" style={{ animationDuration: '3.5s' }} />
          <div className="absolute top-2 inset-x-0 h-[46vh] bg-[radial-gradient(#fde047_2.5px,transparent_2.5px)] [background-size:60px_60px] opacity-90 mix-blend-screen animate-pulse" style={{ animationDuration: '4.8s' }} />
          <div className="absolute top-1 inset-x-0 h-[38vh] bg-[radial-gradient(#bae6fd_1.8px,transparent_1.8px)] [background-size:44px_44px] opacity-75 mix-blend-screen animate-pulse" style={{ animationDuration: '2.8s' }} />

          {/* Prominent Bright Evening Stars (Star Constellation Points) */}
          <div className="absolute top-[8%] left-[22%] w-2 h-2 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.9)] animate-ping opacity-90" style={{ animationDuration: '2.5s' }} />
          <div className="absolute top-[12%] left-[45%] w-2.5 h-2.5 rounded-full bg-amber-200 shadow-[0_0_14px_rgba(254,240,138,0.95)] animate-ping opacity-95" style={{ animationDuration: '3.2s' }} />
          <div className="absolute top-[15%] right-[28%] w-2 h-2 rounded-full bg-pink-200 shadow-[0_0_12px_rgba(253,164,175,0.9)] animate-ping opacity-85" style={{ animationDuration: '2.9s' }} />
          <div className="absolute top-[6%] right-[18%] w-1.5 h-1.5 rounded-full bg-cyan-200 shadow-[0_0_10px_rgba(186,230,253,0.9)] animate-ping opacity-80" style={{ animationDuration: '3.8s' }} />

          {/* Moonlight glisten on the lake water */}
          <div className="absolute top-[36%] left-[48%] w-80 h-28 -translate-x-1/2 rounded-full bg-cyan-200/35 blur-2xl mix-blend-screen" />

          {/* Bioluminescent dancing fairy fireflies near roses & pond */}
          <div className="absolute bottom-[20%] right-[15%] w-3 h-3 rounded-full bg-amber-300/90 blur-[1px] animate-ping opacity-85" style={{ animationDuration: '3s' }} />
          <div className="absolute bottom-[35%] left-[25%] w-2.5 h-2.5 rounded-full bg-emerald-300/90 blur-[1px] animate-ping opacity-80" style={{ animationDuration: '4s' }} />
          <div className="absolute bottom-[28%] left-[45%] w-3 h-3 rounded-full bg-amber-200/90 blur-[1px] animate-ping opacity-90" style={{ animationDuration: '2.5s' }} />
        </div>
      )}

      {/* 🌌 MIDNIGHT MODE: Deep Blue Palette, Increased Starlight & Luminous Night */}
      {lightingMode === 'midnight' && (
        <div className="absolute inset-0 transition-opacity duration-1000 pointer-events-none">
          {/* Deep blue color palette multiply base */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/95 via-blue-950/85 to-indigo-950/85 mix-blend-multiply" />
          {/* Radiant sapphire and deep royal blue wash */}
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-950/60 via-blue-900/30 to-sky-950/45 mix-blend-screen" />
          {/* Deep blue celestial starlight nebulae across the sky */}
          <div className="absolute top-[12%] left-1/2 -translate-x-1/2 w-[92vw] h-64 rounded-full bg-blue-600/25 blur-3xl mix-blend-screen" />
          <div className="absolute top-[22%] left-[42%] -translate-x-1/2 w-[75vw] h-44 rounded-full bg-indigo-500/20 blur-3xl mix-blend-screen" />

          {/* High-density prominent starlight fields across midnight sky */}
          <div className="absolute top-0 inset-x-0 h-[60vh] bg-[radial-gradient(#ffffff_2.2px,transparent_2.2px)] [background-size:26px_26px] opacity-95 mix-blend-screen animate-pulse" style={{ animationDuration: '2.8s' }} />
          <div className="absolute top-1 inset-x-0 h-[52vh] bg-[radial-gradient(#bae6fd_2.4px,transparent_2.4px)] [background-size:40px_40px] opacity-90 mix-blend-screen animate-pulse" style={{ animationDuration: '3.9s' }} />
          <div className="absolute top-2 inset-x-0 h-[44vh] bg-[radial-gradient(#fef08a_2.2px,transparent_2.2px)] [background-size:48px_48px] opacity-90 mix-blend-screen animate-pulse" style={{ animationDuration: '3.2s' }} />
          <div className="absolute top-0 inset-x-0 h-[36vh] bg-[radial-gradient(#e0e7ff_1.5px,transparent_1.5px)] [background-size:18px_18px] opacity-80 mix-blend-screen" />

          {/* Prominent Celestial Diamond Stars with cross glints */}
          <div className="absolute top-[6%] left-[16%] w-3 h-3 rounded-full bg-white shadow-[0_0_18px_rgba(255,255,255,1)] animate-ping opacity-100" style={{ animationDuration: '2.2s' }} />
          <div className="absolute top-[10%] left-[42%] w-3.5 h-3.5 rounded-full bg-amber-100 shadow-[0_0_22px_rgba(254,240,138,1)] animate-ping opacity-100" style={{ animationDuration: '2.7s' }} />
          <div className="absolute top-[13%] right-[20%] w-3 h-3 rounded-full bg-sky-200 shadow-[0_0_18px_rgba(186,230,253,1)] animate-ping opacity-95" style={{ animationDuration: '3.0s' }} />
          <div className="absolute top-[4%] right-[32%] w-2.5 h-2.5 rounded-full bg-cyan-100 shadow-[0_0_16px_rgba(207,250,254,1)] animate-ping opacity-90" style={{ animationDuration: '3.4s' }} />
          <div className="absolute top-[17%] left-[68%] w-2.5 h-2.5 rounded-full bg-indigo-100 shadow-[0_0_14px_rgba(224,231,255,1)] animate-ping opacity-90" style={{ animationDuration: '2.5s' }} />
          <div className="absolute top-[8%] left-[82%] w-2 h-2 rounded-full bg-pink-100 shadow-[0_0_12px_rgba(252,231,243,0.9)] animate-ping opacity-85" style={{ animationDuration: '3.8s' }} />

          {/* Majestic midnight moonbeam sheen on the calm lake water */}
          <div className="absolute top-[34%] left-[48%] w-96 h-36 -translate-x-1/2 rounded-full bg-sky-200/40 blur-2xl mix-blend-screen" />
          <div className="absolute top-[37%] left-[48%] w-72 h-16 -translate-x-1/2 rounded-full bg-white/35 blur-xl mix-blend-screen animate-pulse" style={{ animationDuration: '4s' }} />

          {/* Bioluminescent dancing midnight firefly points */}
          <div className="absolute bottom-[22%] right-[14%] w-3.5 h-3.5 rounded-full bg-amber-300 blur-[1px] animate-ping opacity-95" style={{ animationDuration: '2.3s' }} />
          <div className="absolute bottom-[36%] left-[22%] w-3 h-3 rounded-full bg-sky-300 blur-[1px] animate-ping opacity-90" style={{ animationDuration: '3.1s' }} />
          <div className="absolute bottom-[26%] left-[46%] w-3.5 h-3.5 rounded-full bg-yellow-200 blur-[1px] animate-ping opacity-95" style={{ animationDuration: '2.0s' }} />
          <div className="absolute bottom-[18%] left-[70%] w-3 h-3 rounded-full bg-cyan-200 blur-[1px] animate-ping opacity-90" style={{ animationDuration: '2.6s' }} />
        </div>
      )}

      {/* 7. Subtle Edge Vignette for Text Legibility & Focus */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-slate-950/15 pointer-events-none" />

      {/* 8. Interactive Hotspot Markers (Visible when toggled or in explore mode) */}
      {showExploreMode && (
        <div className="absolute inset-0 pointer-events-none z-20 animate-fade-in">
          {GARDEN_HOTSPOTS.map((spot) => (
            <div
              key={spot.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
              style={{ left: spot.x, top: spot.y }}
            >
              <button
                onClick={() => setActiveHotspot(activeHotspot?.id === spot.id ? null : spot)}
                title={spot.titleEnglish}
                aria-label={spot.titleEnglish}
                className="group relative p-2 rounded-full bg-white/95 border-2 border-rose-400 shadow-xl scale-100 hover:scale-110 active:scale-95 transition-all cursor-pointer"
              >
                <span className="text-base sm:text-lg filter drop-shadow block leading-none">
                  {spot.icon}
                </span>
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-500 animate-ping opacity-80" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 9. Hotspot Detail Modal for Touch/Click */}
      {activeHotspot && (
        <div className="fixed inset-x-4 top-20 sm:top-24 max-w-sm sm:max-w-md mx-auto z-50 pointer-events-auto animate-fade-in-up">
          <div className="glass-panel p-5 rounded-3xl border-2 border-rose-300 shadow-2xl relative">
            <button
              onClick={() => setActiveHotspot(null)}
              className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-rose-50 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-100 to-amber-100 border border-rose-200 flex items-center justify-center text-2xl shrink-0 shadow-sm">
                {activeHotspot.icon}
              </div>
              <div className="space-y-1 pr-4">
                <h3 className="font-serif-romantic text-base sm:text-lg font-bold text-rose-950 leading-tight">
                  {activeHotspot.titleBurmese}
                </h3>
                <p className="text-xs text-rose-700 font-medium">
                  {activeHotspot.titleEnglish}
                </p>
                <p className="text-xs sm:text-sm text-slate-700 pt-1 leading-relaxed">
                  {activeHotspot.descBurmese}
                </p>
                <p className="text-[11px] sm:text-xs text-slate-500 italic pt-0.5">
                  &ldquo;{activeHotspot.descEnglish}&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
