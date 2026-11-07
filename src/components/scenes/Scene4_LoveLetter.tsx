import React, { useState, useEffect } from 'react';
import { Heart, RotateCcw, ArrowRight, Sparkles, Edit3, Lock, MailOpen } from 'lucide-react';
import { BirthdayConfig, AppLanguage } from '../../config/birthdayConfig';
import { EditableText } from '../EditableText';
import { WaxSealInteractive } from '../WaxSealInteractive';

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
  // Wax seal state (true = sealed envelope, false = unsealed love letter)
  const [isSealed, setIsSealed] = useState<boolean>(true);
  const [revealedParagraphs, setRevealedParagraphs] = useState<number>(1);
  const [isRevealingAll, setIsRevealingAll] = useState<boolean>(false);

  // Split active language letter into paragraphs
  const letterText = config.letterContent[lang] || config.letterContent.my;
  const paragraphs = letterText.split('\n\n').filter((p) => p.trim() !== '');

  // Only start paragraph reveal sequence once the wax seal is broken
  useEffect(() => {
    if (isSealed) return;

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
  }, [paragraphs.length, isRevealingAll, lang, isSealed]);

  const handleSealBreak = () => {
    setIsSealed(false);
    setIsRevealingAll(false);
    setRevealedParagraphs(1);
  };

  const handleReplayText = () => {
    setIsRevealingAll(false);
    setRevealedParagraphs(1);
  };

  const handleReseal = () => {
    setIsSealed(true);
    setIsRevealingAll(false);
    setRevealedParagraphs(1);
  };

  const handleRevealAll = () => {
    setIsRevealingAll(true);
    setRevealedParagraphs(paragraphs.length);
  };

  const envelopeRecipientTitles: Record<AppLanguage, string> = {
    my: `ချစ်ရသော ${config.girlfriendName} (${config.nicknameBurmese || 'မနှင်းလေး'}) ဆီသို့`,
    en: `To My Beloved ${config.girlfriendName} (${config.nickname})`,
    ko: `사랑하는 ${config.girlfriendName} (${config.nickname}) 에게`,
    zh: `致我最深爱的 ${config.girlfriendName} (${config.nickname})`,
  };

  const senderTitles: Record<AppLanguage, string> = {
    my: `ချစ်လှစွာသော ${config.boyfriendName} ထံမှ`,
    en: `With All My Heart, ${config.boyfriendName}`,
    ko: `영원한 사랑을 담아, ${config.boyfriendName}`,
    zh: `永远爱你的 ${config.boyfriendName}`,
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

      {/* SEALED STATE: Folded Envelope with Interactive Wax Seal */}
      {isSealed ? (
        <div className="w-full max-w-xl parchment-bg rounded-3xl p-8 sm:p-12 shadow-2xl border border-amber-400/50 relative overflow-hidden glow-gold animate-scale-up">
          {/* Envelope Top Triangle Flap Line */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-amber-200/40 via-amber-100/20 to-transparent pointer-events-none" />

          {/* Decorative Corner Filigrees */}
          <div className="absolute top-3 left-3 text-amber-700/30 text-xs font-serif-romantic tracking-widest pointer-events-none">
            ✦ OUR STORY ✦
          </div>
          <div className="absolute top-3 right-3 text-amber-700/30 text-xs font-serif-romantic tracking-widest pointer-events-none">
            ✦ WITH LOVE ✦
          </div>

          {/* Satin Rose Ribbon crossing horizontally */}
          <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-8 bg-gradient-to-r from-rose-900/60 via-rose-700/80 to-rose-900/60 border-y border-amber-300/40 shadow-inner flex items-center justify-between px-6 pointer-events-none opacity-85">
            <span className="text-[10px] tracking-widest text-amber-200 uppercase font-serif-romantic hidden sm:inline">
              Secret Keepsake
            </span>
            <span className="text-[10px] tracking-widest text-amber-200 uppercase font-serif-romantic hidden sm:inline">
              Sealed with Love
            </span>
          </div>

          {/* Envelope Body Content */}
          <div className="relative z-10 flex flex-col items-center justify-center py-6 text-center">
            {/* Hand-addressed Missive Header */}
            <div className="mb-6 space-y-1 max-w-sm">
              <span className="inline-block text-[11px] font-mono tracking-widest text-amber-900/70 uppercase">
                Confidential &bull; Just for you
              </span>
              <h3
                className={`text-lg sm:text-xl font-bold text-rose-950 ${
                  lang === 'my' ? 'font-burmese' : 'font-serif-romantic'
                }`}
              >
                {envelopeRecipientTitles[lang]}
              </h3>
              <p
                className={`text-xs text-amber-900/80 italic ${
                  lang === 'my' ? 'font-burmese' : 'font-serif-romantic'
                }`}
              >
                {senderTitles[lang]}
              </p>
            </div>

            {/* The Interactive Wax Seal Element */}
            <div className="my-2">
              <WaxSealInteractive lang={lang} onBreak={handleSealBreak} />
            </div>

            {/* Hint message below seal */}
            <p className="mt-4 text-[11px] text-amber-900/70 font-medium max-w-xs">
              {lang === 'my'
                ? 'တံဆိပ်ခေါင်းလေးကို ဖိနှိပ်ထားပါ သို့မဟုတ် အကြိမ်ကြိမ်နှိပ်၍ ချစ်မေတ္တာစာလွှာကို ဖွင့်ဖတ်ပါ'
                : lang === 'ko'
                ? '실링 왁스를 길게 누르거나 여러 번 탭하여 사랑의 편지를 열어보세요'
                : lang === 'zh'
                ? '长按蜡封约 1 秒或轻触多次，即可破封展开情书'
                : 'Hold down for 1s or tap repeatedly to crack the wax seal and open the letter'}
            </p>
          </div>
        </div>
      ) : (
        /* UNSEALED STATE: Unrolled Parchment Love Letter with Unfurling Animation */
        <div className="w-full max-w-xl parchment-bg rounded-3xl p-6 sm:p-10 shadow-2xl border border-amber-400/40 relative overflow-hidden glow-gold animate-fade-in-up">
          {/* Wax Seal Keepsake Badge at top right */}
          <div
            className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-600/90 text-rose-100 text-[11px] font-serif-romantic font-semibold shadow-md border border-amber-300/40"
            title="Unsealed with love"
          >
            <MailOpen className="w-3.5 h-3.5 text-amber-200" />
            <span className="hidden sm:inline">Unsealed</span>
          </div>

          {/* Parchment content */}
          <div className="space-y-4 text-slate-900 pt-2">
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
              <div
                className={`flex items-center gap-2 text-xs text-rose-900 pt-2 font-medium ${
                  lang === 'my' ? 'font-burmese' : 'italic'
                }`}
              >
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

          {/* Bottom letter toolbar for admin editing */}
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

          {/* Footer Controls: Replay Text & Reseal Letter */}
          <div className="mt-6 pt-4 border-t border-amber-900/10 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <button
                onClick={handleReplayText}
                className="flex items-center gap-1.5 text-rose-800 hover:text-rose-950 font-medium transition-colors cursor-pointer"
                title="Replay text typewriter animation"
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

              <span className="text-amber-900/30">&bull;</span>

              <button
                onClick={handleReseal}
                className="flex items-center gap-1.5 text-amber-800 hover:text-amber-950 font-medium transition-colors cursor-pointer"
                title="Reseal with wax seal"
              >
                <Lock className="w-3.5 h-3.5 text-amber-700" />
                <span className={lang === 'my' ? 'font-burmese' : ''}>
                  {lang === 'my'
                    ? 'တံဆိပ် ပြန်ခတ်ရန်'
                    : lang === 'ko'
                    ? '편지 다시 봉인하기'
                    : lang === 'zh'
                    ? '重新封印蜡印'
                    : 'Reseal'}
                </span>
              </button>
            </div>

            <span className="text-[11px] text-amber-900/80 font-serif-romantic italic font-medium">
              Forever & Always
            </span>
          </div>
        </div>
      )}

      {/* Continue to Timeline button */}
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
