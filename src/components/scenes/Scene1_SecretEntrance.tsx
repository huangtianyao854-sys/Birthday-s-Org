import React from 'react';
import { Sparkles, Heart } from 'lucide-react';
import { BirthdayConfig, AppLanguage } from '../../config/birthdayConfig';
import { GardenFloralArch } from '../GardenFloralArch';
import { EditableText } from '../EditableText';

interface Scene1Props {
  config: BirthdayConfig;
  lang: AppLanguage;
  onEnter: () => void;
  isAdminMode?: boolean;
  onUpdateConfig?: (newConfig: BirthdayConfig) => void;
}

export const Scene1_SecretEntrance: React.FC<Scene1Props> = ({
  config,
  lang,
  onEnter,
  isAdminMode = false,
  onUpdateConfig,
}) => {
  const currentNickname = lang === 'my'
    ? (config.nicknameBurmese || 'မနှင်းလေး')
    : (config.nickname || config.girlfriendName);

  return (
    <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 pt-20 pb-16 sm:py-16 text-center select-none animate-fade-in-up">
      {/* Enchanted Garden Floral Trellis Arch Centerpiece */}
      <div className="relative mb-5 sm:mb-8">
        <GardenFloralArch onClick={onEnter} />
      </div>

      {/* Greeting line */}
      <div className="max-w-xl mx-auto space-y-4">
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-rose-200/90 shadow-2xl space-y-4">
          <EditableText
            value={config.entranceGreeting[lang]}
            onSave={(val) =>
              onUpdateConfig?.({
                ...config,
                entranceGreeting: { ...config.entranceGreeting, [lang]: val },
              })
            }
            label="Entrance Greeting"
            multiline
            isAdminMode={isAdminMode}
            as="p"
            className={`text-sm sm:text-base md:text-lg text-slate-900 block ${
              lang === 'my'
                ? 'font-burmese leading-loose'
                : 'font-serif-romantic italic leading-relaxed'
            }`}
          >
            &ldquo;{config.entranceGreeting[lang]}&rdquo;
          </EditableText>

          {/* Welcome Headline */}
          <div className="pt-2 pb-1">
            <EditableText
              value={config.entranceWelcome[lang]}
              onSave={(val) =>
                onUpdateConfig?.({
                  ...config,
                  entranceWelcome: { ...config.entranceWelcome, [lang]: val },
                })
              }
              label="Welcome Headline"
              isAdminMode={isAdminMode}
              as="h1"
              className={`text-2xl sm:text-4xl md:text-5xl font-bold leading-tight block text-rose-950 ${
                lang === 'my' ? 'font-burmese font-semibold' : 'font-serif-romantic'
              }`}
            />

            <p
              className={`text-xs sm:text-sm text-rose-800 font-semibold mt-2.5 ${
                lang === 'my' ? 'font-burmese' : 'font-sans tracking-wider uppercase'
              }`}
            >
              {lang === 'my'
                ? `${currentNickname} အတွက် အချစ်ပန်းဥယျာဉ် ခရီးစဉ် 🌸`
                : lang === 'ko'
                ? '당신만을 위한 찬란한 꽃들의 정원 🌸'
                : lang === 'zh'
                ? '专属于你的烂漫繁花秘境 🌸'
                : `A Journey of Love in the Garden for ${currentNickname} 🌸`}
            </p>
          </div>
        </div>

        {/* Interactive Glowing CTA Button */}
        <div className="pt-4">
          <button
            onClick={onEnter}
            className="group relative inline-flex items-center gap-3 px-8 py-3.5 sm:px-10 sm:py-4 rounded-full bg-gradient-to-r from-rose-600 via-pink-600 to-rose-600 hover:from-rose-500 hover:to-pink-500 text-white font-medium text-sm sm:text-base transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer shadow-xl shadow-rose-600/30 animate-breathe"
          >
            <Heart className="w-4 h-4 text-white fill-white group-hover:scale-125 transition-transform animate-heartbeat" />
            <EditableText
              value={config.entranceButtonText[lang]}
              onSave={(val) =>
                onUpdateConfig?.({
                  ...config,
                  entranceButtonText: { ...config.entranceButtonText, [lang]: val },
                })
              }
              label="Button Text"
              isAdminMode={isAdminMode}
              className={`tracking-wide text-base sm:text-lg font-semibold ${
                lang === 'my' ? 'font-burmese' : 'font-serif-romantic'
              }`}
            />
            <Sparkles className="w-4 h-4 text-amber-200 animate-spin-slow" />
          </button>
        </div>

        <p className={`text-xs text-slate-700 font-medium pt-3 ${lang === 'my' ? 'font-burmese' : 'font-sans'}`}>
          {lang === 'my'
            ? 'နှင်းဆီဥယျာဉ်ထဲမှာ နှင်းဆီပွင့်ဖတ်လေးများ လေပြေထဲ ဝဲပျံနေသည် 🌹'
            : lang === 'ko'
            ? '장미꽃잎이 흩날리는 신비로운 정원 🌹'
            : lang === 'zh'
            ? '浪漫花海里，芬芳花瓣随风轻扬 🌹'
            : 'Fragrant rose petals drifting softly through the enchanted garden 🌹'}
        </p>
      </div>
    </div>
  );
};
