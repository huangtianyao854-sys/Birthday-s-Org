import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Gift, Heart, Sparkles, RotateCcw, BookOpen } from 'lucide-react';
import { BirthdayConfig, AppLanguage } from '../../config/birthdayConfig';
import { EditableText } from '../EditableText';

interface Scene8Props {
  config: BirthdayConfig;
  lang: AppLanguage;
  onResetExperience: () => void;
  isAdminMode?: boolean;
  onUpdateConfig?: (newConfig: BirthdayConfig) => void;
  onOpenGuestbook?: () => void;
}

export const Scene8_FinalSurprise: React.FC<Scene8Props> = ({
  config,
  lang,
  onResetExperience,
  isAdminMode = false,
  onUpdateConfig,
  onOpenGuestbook,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isOpening, setIsOpening] = useState(false);

  const currentNickname = lang === 'my'
    ? (config.nicknameBurmese || 'မနှင်းလေး')
    : (config.nickname || config.girlfriendName);

  const handleOpenGift = () => {
    if (isOpen || isOpening) return;
    setIsOpening(true);

    setTimeout(() => {
      setIsOpen(true);
      setIsOpening(false);

      try {
        confetti({
          particleCount: 110,
          spread: 100,
          origin: { y: 0.6 },
          colors: ['#fbbf24', '#f472b6', '#fbcfe8', '#f59e0b', '#ffffff'],
        });
      } catch {
        // Safe fallback
      }
    }, 600);
  };

  return (
    <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 pt-20 pb-16 sm:py-16 select-none animate-fade-in-up text-center">
      {/* Surprise Teaser Header */}
      <div className="max-w-xl mx-auto space-y-3 mb-8">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/80 backdrop-blur-sm border border-rose-200/90 text-rose-950 text-xs shadow-sm font-semibold">
          <Gift className="w-3.5 h-3.5 text-rose-600" />
          <EditableText
            value={config.finalChapterTag[lang]}
            onSave={(val) =>
              onUpdateConfig?.({
                ...config,
                finalChapterTag: { ...config.finalChapterTag, [lang]: val },
              })
            }
            label="Chapter Badge"
            isAdminMode={isAdminMode}
          />
        </div>

        <EditableText
          value={config.finalSurprisePrompt[lang]}
          onSave={(val) =>
            onUpdateConfig?.({
              ...config,
              finalSurprisePrompt: { ...config.finalSurprisePrompt, [lang]: val },
            })
          }
          label="Surprise Prompt"
          isAdminMode={isAdminMode}
          as="h2"
          className={`text-2xl sm:text-4xl font-bold text-rose-950 leading-relaxed block ${
            lang === 'my' ? 'font-burmese' : 'font-serif-romantic'
          }`}
        />
      </div>

      {/* Interactive 3D Gift Box */}
      {!isOpen ? (
        <div className="flex flex-col items-center">
          <div
            onClick={handleOpenGift}
            className={`relative group cursor-pointer p-6 transition-transform duration-500 ${
              isOpening ? 'scale-110' : 'hover:scale-105'
            }`}
          >
            {/* Glowing Aura behind Box */}
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500/30 via-amber-500/20 to-rose-500/30 rounded-3xl blur-2xl animate-pulse" />

            {/* SVG 3D Gift Box with Ribbon and Bow */}
            <div className="relative w-48 sm:w-56 h-48 sm:h-56">
              <svg
                viewBox="0 0 200 200"
                className="w-full h-full overflow-visible drop-shadow-[0_15px_30px_rgba(244,114,182,0.4)]"
              >
                {/* Gift Box Base */}
                <rect
                  x="30"
                  y="75"
                  width="140"
                  height="100"
                  rx="12"
                  fill="url(#giftBodyGrad)"
                  stroke="#fda4af"
                  strokeWidth="1.5"
                />

                {/* Vertical Ribbon */}
                <rect x="88" y="75" width="24" height="100" fill="url(#ribbonGrad)" />
                {/* Horizontal Ribbon */}
                <rect x="30" y="115" width="140" height="20" fill="url(#ribbonGrad)" />

                {/* Gift Box Lid (with lift animation) */}
                <g
                  className={`transition-all duration-500 origin-top-left ${
                    isOpening ? '-translate-y-8 -rotate-12' : ''
                  }`}
                >
                  <rect
                    x="24"
                    y="55"
                    width="152"
                    height="25"
                    rx="6"
                    fill="url(#lidGrad)"
                    stroke="#fbcfe8"
                    strokeWidth="1.5"
                  />
                  {/* Lid Ribbon */}
                  <rect x="88" y="55" width="24" height="25" fill="url(#ribbonGrad)" />

                  {/* Ribbon Bow on top */}
                  <path
                    d="M100 55 C80 30, 60 40, 85 52 Z"
                    fill="#fbbf24"
                    stroke="#d97706"
                    strokeWidth="1"
                  />
                  <path
                    d="M100 55 C120 30, 140 40, 115 52 Z"
                    fill="#fbbf24"
                    stroke="#d97706"
                    strokeWidth="1"
                  />
                  <circle cx="100" cy="54" r="7" fill="#f59e0b" />
                </g>

                <defs>
                  <linearGradient id="giftBodyGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#831843" />
                    <stop offset="50%" stopColor="#be185d" />
                    <stop offset="100%" stopColor="#4c0519" />
                  </linearGradient>
                  <linearGradient id="lidGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#9d174d" />
                    <stop offset="50%" stopColor="#db2777" />
                    <stop offset="100%" stopColor="#831843" />
                  </linearGradient>
                  <linearGradient id="ribbonGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#fef08a" />
                    <stop offset="50%" stopColor="#fbbf24" />
                    <stop offset="100%" stopColor="#d97706" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          <button
            onClick={handleOpenGift}
            className={`mt-6 px-8 py-3.5 rounded-full bg-gradient-to-r from-rose-600 via-pink-600 to-rose-600 hover:from-rose-500 hover:to-pink-500 text-white font-medium text-sm sm:text-base shadow-xl shadow-rose-600/30 active:scale-95 transition-all flex items-center gap-2 cursor-pointer font-semibold animate-breathe ${
              lang === 'my' ? 'font-burmese' : 'font-sans'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-200 animate-spin-slow" />
            <span>{config.openGiftButtonText[lang]}</span>
          </button>
        </div>
      ) : (
        /* Revealed Final Message Card */
        <div className="max-w-xl w-full parchment-bg rounded-3xl p-6 sm:p-10 border border-amber-400/40 shadow-2xl animate-fade-in text-center space-y-6 glow-gold text-slate-900">
          <div className="w-12 h-12 rounded-full bg-rose-100 border border-rose-300 flex items-center justify-center mx-auto text-rose-600 animate-heartbeat shadow-sm">
            <Heart className="w-6 h-6 fill-rose-500 text-rose-500" />
          </div>

          <div className="space-y-4 text-slate-900">
            <p
              className={`leading-relaxed whitespace-pre-line text-slate-900 font-medium ${
                lang === 'my'
                  ? 'font-burmese text-sm sm:text-base leading-[1.85]'
                  : 'text-sm sm:text-base md:text-lg font-serif-romantic'
              }`}
            >
              {config.finalMessage[lang]}
            </p>
          </div>

          {/* Emotional Signature */}
          <div className="pt-6 border-t border-amber-900/10 text-center">
            <span className={`text-sm sm:text-base tracking-widest text-amber-950 font-bold block ${
              lang === 'my' ? 'font-burmese' : 'font-serif-romantic'
            }`}>
              {config.signature[lang]}
            </span>
            <span className={`text-xs text-rose-800 font-semibold block mt-1 ${
              lang === 'my' ? 'font-burmese' : ''
            }`}>
              {lang === 'my'
                ? `${currentNickname} အတွက် · ထာဝရချစ်ခြင်းများစွာဖြင့် 🌸`
                : lang === 'ko'
                ? `${currentNickname}에게 · 영원토록 변치 않는 사랑으로 🌸`
                : lang === 'zh'
                ? `献给最爱的${currentNickname} · 愿岁月缱绻，爱意长存 🌸`
                : `For ${currentNickname} · Forever and Always 🌸`}
            </span>
          </div>

          {/* Action Buttons: Guestbook & Replay */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-2.5">
            {onOpenGuestbook && (
              <button
                onClick={onOpenGuestbook}
                className={`px-6 py-2.5 rounded-full bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 hover:from-rose-500 hover:to-pink-500 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 border border-rose-300/80 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-md ${
                  lang === 'my' ? 'font-burmese' : ''
                }`}
              >
                <BookOpen className="w-4 h-4 text-white" />
                <span>{lang === 'my' ? 'မွေးနေ့ဆုတောင်းလွှာ ဖွင့်ရန် 💌' : 'Sign Guestbook 💌'}</span>
              </button>
            )}

            <button
              onClick={onResetExperience}
              className={`px-6 py-2.5 rounded-full bg-white/95 hover:bg-white text-rose-950 hover:text-rose-900 text-xs sm:text-sm font-semibold flex items-center gap-2 border border-rose-200/90 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-md ${
                lang === 'my' ? 'font-burmese' : ''
              }`}
            >
              <RotateCcw className="w-4 h-4 text-rose-600" />
              <span>{config.replayButtonText[lang]}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
