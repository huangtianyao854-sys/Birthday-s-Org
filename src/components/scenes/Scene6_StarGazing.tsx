import React, { useState } from 'react';
import { Sparkles, Heart, ArrowRight } from 'lucide-react';
import { BirthdayConfig, AppLanguage } from '../../config/birthdayConfig';
import { GardenWishBlossom } from '../GardenWishBlossom';
import { EditableText } from '../EditableText';

interface Scene6Props {
  config: BirthdayConfig;
  lang: AppLanguage;
  onContinue: () => void;
  showConstellation: boolean;
  onToggleConstellation: () => void;
  isAdminMode?: boolean;
  onUpdateConfig?: (newConfig: BirthdayConfig) => void;
}

export const Scene6_StarGazing: React.FC<Scene6Props> = ({
  config,
  lang,
  onContinue,
  showConstellation,
  onToggleConstellation,
  isAdminMode = false,
  onUpdateConfig,
}) => {
  const [whisperIdx, setWhisperIdx] = useState<number>(0);
  const [showBlossomMessage, setShowBlossomMessage] = useState(false);
  const [blossomTapped, setBlossomTapped] = useState(false);

  const handleTapBlossom = () => {
    setBlossomTapped(true);
    setShowBlossomMessage(true);
    setWhisperIdx((prev) => (prev + 1) % config.moonWhispers.length);
    setTimeout(() => setBlossomTapped(false), 500);
  };

  const currentWhisper = config.moonWhispers[whisperIdx]?.text[lang] || config.moonWhispers[0].text.my;

  return (
    <div className="relative z-10 min-h-screen flex flex-col items-center justify-between px-4 pt-20 pb-16 sm:py-16 select-none animate-fade-in-up text-center">
      {/* Top Atmospheric Header */}
      <div className="max-w-xl mx-auto space-y-3 pt-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/80 backdrop-blur-sm border border-rose-200/90 text-rose-950 text-xs shadow-sm font-semibold">
          <span className="text-amber-500 text-sm">🌸</span>
          <EditableText
            value={config.starsTitle[lang]}
            onSave={(val) =>
              onUpdateConfig?.({
                ...config,
                starsTitle: { ...config.starsTitle, [lang]: val },
              })
            }
            label="Stars Badge"
            isAdminMode={isAdminMode}
          />
        </div>

        <EditableText
          value={config.starsQuote[lang]}
          onSave={(val) =>
            onUpdateConfig?.({
              ...config,
              starsQuote: { ...config.starsQuote, [lang]: val },
            })
          }
          label="Stars Quote"
          multiline
          isAdminMode={isAdminMode}
          as="h2"
          className={`text-2xl sm:text-3xl md:text-4xl font-bold text-rose-950 leading-snug block ${
            lang === 'my' ? 'font-burmese' : 'font-serif-romantic'
          }`}
        >
          &ldquo;{config.starsQuote[lang]}&rdquo;
        </EditableText>

        <EditableText
          value={config.starsSubtitle[lang]}
          onSave={(val) =>
            onUpdateConfig?.({
              ...config,
              starsSubtitle: { ...config.starsSubtitle, [lang]: val },
            })
          }
          label="Stars Subtitle"
          isAdminMode={isAdminMode}
          as="p"
          className={`text-xs sm:text-sm text-slate-800 pt-2 block font-medium ${
            lang === 'my' ? 'font-burmese not-italic' : 'font-serif-romantic italic'
          }`}
        />
      </div>

      {/* Central Interactive Blooming Wishing Blossom & Garden Section */}
      <div className="my-auto py-8 flex flex-col items-center justify-center">
        {/* Interactive Garden Wishing Blossom with Ambient Whisper Prompt */}
        <div className="relative flex flex-col items-center">
          <GardenWishBlossom
            onClick={handleTapBlossom}
            isTapped={blossomTapped}
          />

          <span className={`mt-3 whitespace-nowrap text-xs text-rose-950 font-semibold bg-white/95 px-4 py-1.5 rounded-full border border-rose-200/90 shadow-md cursor-pointer ${
            lang === 'my' ? 'font-burmese' : ''
          }`}>
            {config.moonTapPrompt[lang]}
          </span>
        </div>

        {/* Revealed Blossom Whisper Toast / Card */}
        {showBlossomMessage && (
          <div className="mt-8 max-w-sm glass-panel-gold rounded-2xl p-5 border border-amber-400/50 text-center animate-fade-in shadow-2xl glow-gold text-slate-900">
            <div className="flex items-center justify-center gap-1.5 text-amber-800 text-xs font-semibold mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-spin" />
              <span className={lang === 'my' ? 'font-burmese' : ''}>
                {lang === 'my'
                  ? 'ညီညီ့ရင်ထဲက စကားသံလေး'
                  : lang === 'ko'
                  ? '정원이 전하는 달콤한 고백'
                  : lang === 'zh'
                  ? '来自心底的温存心语'
                  : 'Whisper from Nyi Nyi'}
              </span>
            </div>
            <p className={`text-sm text-slate-900 leading-relaxed font-medium ${
              lang === 'my' ? 'font-burmese not-italic' : 'font-serif-romantic italic'
            }`}>
              &ldquo;{currentWhisper}&rdquo;
            </p>
          </div>
        )}

        {/* Constellation Toggle Button */}
        <div className="mt-6">
          <button
            onClick={onToggleConstellation}
            className={`px-4 py-2 rounded-full text-xs font-medium flex items-center gap-2 border transition-all cursor-pointer shadow-sm ${
              showConstellation
                ? 'bg-rose-500 text-white border-rose-400 shadow-md font-semibold'
                : 'bg-white/95 border-rose-200/90 text-rose-900 hover:text-rose-950 font-medium'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className={lang === 'my' ? 'font-burmese' : ''}>
              {showConstellation
                ? lang === 'my'
                  ? 'နှလုံးသား ကြယ်တာရာ လင်းလက်နေသည် ✨'
                  : lang === 'ko'
                  ? '하트 별자리 켜짐 ✨'
                  : lang === 'zh'
                  ? '心形星座已点亮 ✨'
                  : 'Heart Constellation Active ✨'
                : lang === 'my'
                ? 'နှလုံးသား ကြယ်တာရာ ရေးဆွဲရန်'
                : lang === 'ko'
                ? '하늘에 하트 별자리 그리기'
                : lang === 'zh'
                ? '在夜空绘制心形星座'
                : 'Draw Heart Constellation in Sky'}
            </span>
          </button>
        </div>
      </div>

      {/* Bottom CTA to Final Surprise */}
      <div className="w-full max-w-md pt-4 pb-2">
        <button
          onClick={onContinue}
          className={`w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-rose-600 via-pink-600 to-rose-600 hover:from-rose-500 hover:to-pink-500 text-white font-medium text-sm sm:text-base shadow-xl shadow-rose-600/30 active:scale-95 transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer font-semibold ${
            lang === 'my' ? 'font-burmese' : 'font-sans'
          }`}
        >
          <Heart className="w-4 h-4 text-white fill-white" />
          <span>{config.starsNextButtonText[lang]}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
