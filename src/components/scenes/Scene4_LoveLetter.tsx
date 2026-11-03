import React, { useState, useEffect } from 'react';
import { Heart, RotateCcw, ArrowRight, Sparkles, Edit3 } from 'lucide-react';
import { BirthdayConfig, AppLanguage } from '../../config/birthdayConfig';
import { EditableText } from '../EditableText';

interface Scene4Props {
  config: BirthdayConfig;
  lang: AppLanguage;
  onContinue: () => void;
  isAdminMode?: boolean;
  onUpdateConfig?: (newConfig: BirthdayConfig) => void;
}

export const Scene4_LoveLetter: React.FC<Scene4Props> = ({
  config,
  lang,
  onContinue,
  isAdminMode = false,
  onUpdateConfig,
}) => {
  const [revealedParagraphs, setRevealedParagraphs] = useState<number>(1);
  const [isRevealingAll, setIsRevealingAll] = useState(false);

  // Split active language letter into paragraphs
  const letterText = config.letterContent[lang] || config.letterContent.my;
  const paragraphs = letterText.split('\n\n').filter((p) => p.trim() !== '');

  useEffect(() => {
    if (isRevealingAll) {
      setRevealedParagraphs(paragraphs.length);
      return;
    }

    const timer = setInterval(() => {
      setRevealedParagraphs((prev) => {
        if (prev < paragraphs.length) {
          return prev + 1;
        }
        clearInterval(timer);
        return prev;
      });
    }, 1800);

    return () => clearInterval(timer);
  }, [paragraphs.length, isRevealingAll, lang]);

  const handleReplay = () => {
    setIsRevealingAll(false);
    setRevealedParagraphs(1);
  };

  const handleRevealAll = () => {
    setIsRevealingAll(true);
    setRevealedParagraphs(paragraphs.length);
  };

  return (
    <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 pt-20 pb-16 sm:py-16 select-none animate-fade-in-up">
      {/* Scene Header */}
      <div className="text-center space-y-2 mb-6 max-w-xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/80 backdrop-blur-sm border border-rose-200/90 text-rose-950 text-xs tracking-wider uppercase font-semibold shadow-sm">
          <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500 animate-heartbeat" />
          <EditableText
            value={config.letterTitle[lang]}
            onSave={(val) =>
              onUpdateConfig?.({
                ...config,
                letterTitle: { ...config.letterTitle, [lang]: val },
              })
            }
            label="Letter Badge"
            isAdminMode={isAdminMode}
          />
        </div>

        <EditableText
          value={config.letterSubtitle[lang]}
          onSave={(val) =>
            onUpdateConfig?.({
              ...config,
              letterSubtitle: { ...config.letterSubtitle, [lang]: val },
            })
          }
          label="Letter Title"
          isAdminMode={isAdminMode}
          as="h2"
          className={`text-2xl sm:text-4xl font-bold text-rose-950 block ${
            lang === 'my' ? 'font-burmese' : 'font-serif-romantic'
          }`}
        />
      </div>

      {/* Enchanted Parchment Love Letter */}
      <div className="w-full max-w-xl parchment-bg rounded-3xl p-6 sm:p-10 shadow-2xl border border-amber-400/40 relative overflow-hidden glow-gold">
        {/* Subtle decorative wax seal top corner */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-rose-600 border border-rose-400 flex items-center justify-center shadow-md">
          <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-rose-100 fill-rose-100" />
        </div>

        {/* Parchment content */}
        <div className="space-y-4 text-slate-900">
          {paragraphs.slice(0, revealedParagraphs).map((para, idx) => {
            const isFirst = idx === 0;
            const isLast = idx === paragraphs.length - 1;

            return (
              <p
                key={idx}
                className={`transition-all duration-700 animate-fade-in ${
                  lang === 'my'
                    ? 'font-burmese text-sm sm:text-base text-slate-900 font-medium leading-[1.85]'
                    : 'text-sm sm:text-base text-slate-900 font-serif-romantic leading-relaxed'
                } ${isFirst ? 'text-base sm:text-lg font-bold text-amber-950' : ''} ${
                  isLast ? 'text-right font-bold text-rose-800 pt-3 text-base sm:text-lg' : ''
                }`}
              >
                {para}
              </p>
            );
          })}

          {/* Typing feather indicator while revealing */}
          {revealedParagraphs < paragraphs.length && (
            <div className={`flex items-center gap-2 text-xs text-rose-900 pt-2 font-medium ${lang === 'my' ? 'font-burmese' : 'italic'}`}>
              <Sparkles className="w-3.5 h-3.5 animate-spin text-amber-600" />
              <span>
                {lang === 'my'
                  ? 'အချစ်မေတ္တာများ ရေးဖွဲ့နေဆဲ...'
                  : lang === 'ko'
                  ? '마음을 담아 써 내려가는 중...'
                  : lang === 'zh'
                  ? '正在用真心书写中……'
                  : 'Writing with love...'}
              </span>
              <button
                onClick={handleRevealAll}
                className="ml-auto not-italic text-rose-700 hover:text-rose-950 underline text-xs font-semibold cursor-pointer"
              >
                {lang === 'my'
                  ? 'အားလုံး တစ်ပြိုင်နက် ဖတ်ရန်'
                  : lang === 'ko'
                  ? '전체 내용 보기'
                  : lang === 'zh'
                  ? '展开全部信件'
                  : 'Reveal All'}
              </button>
            </div>
          )}
        </div>

        {/* Bottom letter toolbar */}
        {isAdminMode && (
          <div className="mt-4 pt-3 border-t border-amber-400/20 flex justify-end">
            <EditableText
              value={config.letterContent[lang] || config.letterContent.my}
              onSave={(val) =>
                onUpdateConfig?.({
                  ...config,
                  letterContent: { ...config.letterContent, [lang]: val },
                })
              }
              label="Full Love Letter Text"
              multiline
              isAdminMode={isAdminMode}
              className="text-xs text-pink-200 bg-pink-950/80 border border-pink-400/50 rounded-xl px-3 py-1.5 flex items-center gap-1.5 shadow-md"
            >
              <Edit3 className="w-3.5 h-3.5 text-pink-400" />
              <span>Edit Full Love Letter</span>
            </EditableText>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-amber-900/10 flex items-center justify-between text-xs">
          <button
            onClick={handleReplay}
            className="flex items-center gap-1.5 text-rose-800 hover:text-rose-950 font-medium transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className={lang === 'my' ? 'font-burmese' : ''}>
              {lang === 'my'
                ? 'စာလွှာ ပြန်လည်ကြည့်ရန်'
                : lang === 'ko'
                ? '편지 다시 재생'
                : lang === 'zh'
                ? '重新播放信件'
                : 'Replay Letter'}
            </span>
          </button>

          <span className="text-[11px] text-amber-900/80 font-serif-romantic italic font-medium">
            Forever & Always
          </span>
        </div>
      </div>

      {/* Continue to Timeline */}
      <div className="mt-8">
        <button
          onClick={onContinue}
          className={`px-8 py-3.5 rounded-full bg-gradient-to-r from-rose-600 via-pink-600 to-rose-600 hover:from-rose-500 hover:to-pink-500 text-white font-semibold text-sm sm:text-base shadow-xl shadow-rose-600/30 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer ${
            lang === 'my' ? 'font-burmese' : 'font-sans'
          }`}
        >
          <span>{config.letterExploreButtonText[lang]}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
