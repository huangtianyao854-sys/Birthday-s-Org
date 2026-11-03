import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Heart, Flame, Wind, ArrowRight } from 'lucide-react';
import { BirthdayConfig, AppLanguage } from '../../config/birthdayConfig';
import { EditableText } from '../EditableText';

interface Scene3Props {
  config: BirthdayConfig;
  lang: AppLanguage;
  onContinue: () => void;
  isAdminMode?: boolean;
  onUpdateConfig?: (newConfig: BirthdayConfig) => void;
}

export const Scene3_BirthdayCake: React.FC<Scene3Props> = ({
  config,
  lang,
  onContinue,
  isAdminMode = false,
  onUpdateConfig,
}) => {
  const [candlesLit, setCandlesLit] = useState(true);
  const [wishMade, setWishMade] = useState(false);
  const [isBlowing, setIsBlowing] = useState(false);

  const currentNickname = lang === 'my'
    ? (config.nicknameBurmese || 'မနှင်းလေး')
    : (config.nickname || config.girlfriendName);

  const handleMakeWish = () => {
    if (isBlowing || wishMade) return;
    setIsBlowing(true);

    setTimeout(() => {
      setCandlesLit(false);
      setIsBlowing(false);
      setWishMade(true);

      try {
        confetti({
          particleCount: 90,
          spread: 90,
          origin: { y: 0.65 },
          colors: ['#f472b6', '#fbbf24', '#fbcfe8', '#f43f5e', '#ffffff'],
          shapes: ['circle'],
        });
      } catch {
        // Safe fallback
      }
    }, 700);
  };

  const handleRelight = () => {
    setCandlesLit(true);
    setWishMade(false);
  };

  return (
    <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 pt-20 pb-16 sm:py-16 text-center select-none animate-fade-in-up">
      {/* Name and Celebration Header - Open garden view with no blocking white card */}
      <div className="space-y-3 mb-6 max-w-2xl mx-auto">
        <div className="inline-block px-4 py-1 rounded-full bg-white/80 backdrop-blur-sm border border-rose-200/90 text-rose-950 text-xs tracking-widest uppercase mb-1 font-semibold shadow-sm">
          {lang === 'my'
            ? `${currentNickname} အတွက် အထူးခြားဆုံးနေ့ 🌸`
            : lang === 'ko'
            ? '오직 당신만을 위한 가장 눈부신 날 🌸'
            : lang === 'zh'
            ? '庆祝属于你的特别日子 🌸'
            : `Celebrating ${currentNickname} 🌸`}
        </div>

        <EditableText
          value={currentNickname}
          onSave={(val) => {
            if (lang === 'my') {
              onUpdateConfig?.({ ...config, nicknameBurmese: val });
            } else {
              onUpdateConfig?.({ ...config, nickname: val });
            }
          }}
          label="Nickname / Name"
          isAdminMode={isAdminMode}
          as="h1"
          className={`text-3xl sm:text-5xl md:text-6xl font-bold text-rose-950 drop-shadow-[0_2px_4px_rgba(255,255,255,0.85)] block ${
            lang === 'my' ? 'font-burmese' : 'font-serif-romantic tracking-wide'
          }`}
        />

        <div>
          <EditableText
            value={config.celebrationTitle[lang]}
            onSave={(val) =>
              onUpdateConfig?.({
                ...config,
                celebrationTitle: { ...config.celebrationTitle, [lang]: val },
              })
            }
            label="Celebration Title"
            isAdminMode={isAdminMode}
            as="h2"
            style={{ backgroundColor: '#e23838' }}
            className={`text-xl sm:text-3xl md:text-4xl font-bold text-white px-4 py-1.5 rounded-2xl shadow-md inline-block ${
              lang === 'my' ? 'font-burmese mt-1' : 'font-serif-romantic'
            }`}
          />
        </div>

        <EditableText
          value={config.celebrationSubtitle[lang]}
          onSave={(val) =>
            onUpdateConfig?.({
              ...config,
              celebrationSubtitle: { ...config.celebrationSubtitle, [lang]: val },
            })
          }
          label="Celebration Message"
          multiline
          isAdminMode={isAdminMode}
          as="p"
          className={`text-xs sm:text-base text-slate-900 drop-shadow-[0_1px_3px_rgba(255,255,255,0.9)] max-w-md mx-auto block font-semibold ${
            lang === 'my' ? 'font-burmese leading-loose' : 'font-sans leading-relaxed'
          }`}
        />
      </div>

      {/* Interactive Birthday Cake Container */}
      <div className="relative my-4 flex flex-col items-center justify-center">
        {/* Glow halo behind cake */}
        <div
          className={`absolute w-64 h-64 sm:w-80 sm:h-80 rounded-full transition-all duration-1000 -z-10 ${
            candlesLit
              ? 'bg-gradient-to-t from-pink-500/20 via-amber-500/15 to-transparent blur-3xl'
              : 'bg-indigo-900/10 blur-2xl'
          }`}
        />

        {/* SVG Detailed 3-Tier Birthday Cake with Candles */}
        <div className="relative w-64 sm:w-76 h-56 sm:h-64 flex items-end justify-center filter drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]">
          <svg
            viewBox="0 0 320 280"
            className="w-full h-full overflow-visible"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Porcelain Pedestal Stand with Real Gold Rim */}
            <ellipse cx="160" cy="265" rx="142" ry="12" fill="#ffffff" stroke="#f59e0b" strokeWidth="1.8" />
            <path d="M125 265 L142 278 L178 278 L195 265 Z" fill="#e2e8f0" stroke="#f59e0b" strokeWidth="1" />
            <ellipse cx="160" cy="278" rx="42" ry="5" fill="#ffffff" stroke="#f59e0b" strokeWidth="1" />

            {/* Bottom Tier (Tier 1) */}
            <path
              d="M50 205 C50 225, 270 225, 270 205 L270 245 C270 265, 50 265, 50 245 Z"
              fill="url(#cakeGradientBottom)"
            />
            <ellipse cx="160" cy="205" rx="110" ry="20" fill="url(#creamGradient)" stroke="#fbcfe8" strokeWidth="1" />
            {/* Tier 1 Frosting Drips */}
            <path
              d="M50 205 Q70 225 90 207 Q110 230 130 206 Q160 232 190 208 Q220 230 240 207 Q255 220 270 205"
              fill="none"
              stroke="#fed7aa"
              strokeWidth="4"
              strokeLinecap="round"
            />

            {/* Middle Tier (Tier 2) */}
            <path
              d="M80 150 C80 170, 240 170, 240 150 L240 185 C240 205, 80 205, 80 185 Z"
              fill="url(#cakeGradientMiddle)"
            />
            <ellipse cx="160" cy="150" rx="80" ry="16" fill="url(#creamGradient)" stroke="#fbcfe8" strokeWidth="1" />
            {/* Rose piping on Middle Tier */}
            <circle cx="100" cy="172" r="3.5" fill="#fda4af" />
            <circle cx="130" cy="178" r="3.5" fill="#fda4af" />
            <circle cx="160" cy="180" r="3.5" fill="#fda4af" />
            <circle cx="190" cy="178" r="3.5" fill="#fda4af" />
            <circle cx="220" cy="172" r="3.5" fill="#fda4af" />

            {/* Top Tier (Tier 3) */}
            <path
              d="M105 105 C105 120, 215 120, 215 105 L215 135 C215 150, 105 150, 105 135 Z"
              fill="url(#cakeGradientTop)"
            />
            <ellipse cx="160" cy="105" rx="55" ry="12" fill="url(#creamGradient)" stroke="#fed7aa" strokeWidth="1" />

            {/* Golden Heart Cake Topper */}
            <path
              d="M160 124 C154 116, 144 118, 144 126 C144 134, 160 143, 160 143 C160 143, 176 134, 176 126 C176 118, 166 116, 160 124 Z"
              fill="#fbbf24"
              stroke="#f59e0b"
              strokeWidth="1"
            />

            {/* Candle Sticks (3 Golden Candles) */}
            {/* Candle 1 (Left) */}
            <rect x="128" y="70" width="6" height="30" rx="2" fill="url(#candleGradient)" />
            {/* Candle 2 (Center) */}
            <rect x="157" y="60" width="6" height="36" rx="2" fill="url(#candleGradient)" />
            {/* Candle 3 (Right) */}
            <rect x="186" y="70" width="6" height="30" rx="2" fill="url(#candleGradient)" />

            {/* Candle Wicks */}
            <line x1="131" y1="70" x2="131" y2="65" stroke="#475569" strokeWidth="1.5" />
            <line x1="160" y1="60" x2="160" y2="55" stroke="#475569" strokeWidth="1.5" />
            <line x1="189" y1="70" x2="189" y2="65" stroke="#475569" strokeWidth="1.5" />

            {/* Candle Flames (Only when lit) */}
            {candlesLit && (
              <g className="animate-flame">
                {/* Flame 1 */}
                <ellipse cx="131" cy="56" rx="4.5" ry="8" fill="#fbbf24" />
                <ellipse cx="131" cy="57" rx="2.5" ry="5" fill="#fef08a" />
                <circle cx="131" cy="59" r="1.5" fill="#3b82f6" fillOpacity="0.8" />

                {/* Flame 2 (Center - taller) */}
                <ellipse cx="160" cy="46" rx="5.5" ry="10" fill="#fbbf24" />
                <ellipse cx="160" cy="47" rx="3" ry="6" fill="#fef08a" />
                <circle cx="160" cy="49" r="1.8" fill="#3b82f6" fillOpacity="0.8" />

                {/* Flame 3 */}
                <ellipse cx="189" cy="56" rx="4.5" ry="8" fill="#fbbf24" />
                <ellipse cx="189" cy="57" rx="2.5" ry="5" fill="#fef08a" />
                <circle cx="189" cy="59" r="1.5" fill="#3b82f6" fillOpacity="0.8" />
              </g>
            )}

            {/* Extinguished Smoke Wisps */}
            {!candlesLit && (
              <g className="animate-fade-in opacity-60">
                <path d="M131 63 Q128 55 133 48 Q130 40 132 35" stroke="#cbd5e1" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                <path d="M160 53 Q164 45 158 38 Q162 30 159 24" stroke="#cbd5e1" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                <path d="M189 63 Q192 55 187 48 Q190 40 188 35" stroke="#cbd5e1" strokeWidth="1.2" strokeLinecap="round" fill="none" />
              </g>
            )}

            {/* Gradients */}
            <defs>
              <linearGradient id="cakeGradientBottom" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#831843" />
                <stop offset="50%" stopColor="#be185d" />
                <stop offset="100%" stopColor="#9d174d" />
              </linearGradient>
              <linearGradient id="cakeGradientMiddle" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#9d174d" />
                <stop offset="50%" stopColor="#db2777" />
                <stop offset="100%" stopColor="#be185d" />
              </linearGradient>
              <linearGradient id="cakeGradientTop" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#db2777" />
                <stop offset="50%" stopColor="#f472b6" />
                <stop offset="100%" stopColor="#be185d" />
              </linearGradient>
              <linearGradient id="creamGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#fdf2f8" />
                <stop offset="50%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#fce7f3" />
              </linearGradient>
              <linearGradient id="candleGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="50%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Blowing Animation Indicator */}
        {isBlowing && (
          <div className="absolute top-10 flex items-center gap-2 text-pink-200 text-xs animate-pulse bg-slate-900/80 px-3 py-1 rounded-full border border-pink-400/30">
            <Wind className="w-4 h-4 text-pink-300 animate-spin" />
            <span>Making a wish...</span>
          </div>
        )}
      </div>

      {/* Wish Actions & Wish Revealed Message */}
      <div className="max-w-md w-full mt-4 space-y-4">
        {candlesLit ? (
          <button
            onClick={handleMakeWish}
            disabled={isBlowing}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-rose-600 via-pink-600 to-rose-600 hover:from-rose-500 hover:to-pink-500 text-white font-medium text-sm sm:text-base shadow-xl shadow-rose-600/25 active:scale-95 transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer animate-breathe"
          >
            <Flame className="w-4 h-4 text-amber-200 animate-bounce" />
            <span className={`font-semibold tracking-wide ${lang === 'my' ? 'font-burmese' : 'font-serif-romantic'}`}>
              {config.cakeButtonText[lang]}
            </span>
            <Sparkles className="w-4 h-4 text-amber-100" />
          </button>
        ) : (
          <div className="space-y-4 animate-fade-in">
            {/* Wish Granted Card */}
            <div className="glass-panel-gold rounded-2xl p-5 border border-amber-300 shadow-lg text-center space-y-2 text-slate-900">
              <div className="flex items-center justify-center gap-1.5 text-amber-800 text-xs font-semibold">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span className={lang === 'my' ? 'font-burmese' : 'font-sans'}>{config.cakeWishWhisper[lang]}</span>
              </div>
              <p className={`text-sm sm:text-base text-slate-900 leading-relaxed font-medium ${lang === 'my' ? 'font-burmese leading-loose' : 'font-serif-romantic italic'}`}>
                &ldquo;{config.cakeWishMessage[lang]}&rdquo;
              </p>
              <button
                onClick={handleRelight}
                className="text-xs text-rose-700 hover:text-rose-900 underline pt-1 block mx-auto cursor-pointer font-medium"
              >
                {lang === 'my'
                  ? 'ဖယောင်းတိုင်လေးတွေ ပြန်လည်ထွန်းညှိရန်'
                  : lang === 'ko'
                  ? '촛불 다시 켜기'
                  : lang === 'zh'
                  ? '再次点亮蜡烛'
                  : 'Light the candles again'}
              </button>
            </div>

            {/* Next Scene Button */}
            <button
              onClick={onContinue}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-rose-600 via-pink-600 to-rose-600 hover:from-rose-500 hover:to-pink-500 text-white font-medium text-sm sm:text-base shadow-xl shadow-rose-600/25 active:scale-95 transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer font-semibold"
            >
              <span className={lang === 'my' ? 'font-burmese' : 'font-serif-romantic'}>{config.readLetterButtonText[lang]}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
