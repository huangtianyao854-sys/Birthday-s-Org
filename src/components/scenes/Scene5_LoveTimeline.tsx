import React, { useState } from 'react';
import {
  Heart,
  Sparkles,
  Cake,
  Compass,
  Sun,
  ArrowRight,
  Calendar,
  Camera,
  Maximize2,
  X,
} from 'lucide-react';
import { BirthdayConfig, calculateDaysTogether, Milestone, AppLanguage } from '../../config/birthdayConfig';
import { EditableText } from '../EditableText';

interface Scene5Props {
  config: BirthdayConfig;
  lang: AppLanguage;
  onContinue: () => void;
  isAdminMode?: boolean;
  onUpdateConfig?: (newConfig: BirthdayConfig) => void;
}

export const Scene5_LoveTimeline: React.FC<Scene5Props> = ({
  config,
  lang,
  onContinue,
  isAdminMode = false,
  onUpdateConfig,
}) => {
  // Fullscreen photo modal state
  const [modalPhoto, setModalPhoto] = useState<{ url: string; title: string } | null>(null);

  const daysTogether = calculateDaysTogether(
    config.relationshipStartDate,
    config.relationshipDurationDays
  );

  const getMilestoneIcon = (iconName: Milestone['iconName']) => {
    switch (iconName) {
      case 'Sparkles':
        return <Sparkles className="w-4 h-4 text-amber-300" />;
      case 'Cake':
        return <Cake className="w-4 h-4 text-pink-300" />;
      case 'Sun':
        return <Sun className="w-4 h-4 text-amber-300" />;
      case 'Camera':
        return <Camera className="w-4 h-4 text-rose-300" />;
      case 'Compass':
        return <Compass className="w-4 h-4 text-pink-300" />;
      default:
        return <Heart className="w-4 h-4 text-rose-300 fill-rose-300/40" />;
    }
  };

  return (
    <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 pt-20 pb-16 sm:py-16 select-none animate-fade-in-up">
      {/* Title & Relationship Counter Banner */}
      <div className="text-center space-y-3 mb-8 sm:mb-10 max-w-xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-rose-200/90 text-rose-950 text-xs shadow-sm font-semibold">
          <Calendar className="w-3.5 h-3.5 text-rose-600" />
          <EditableText
            value={config.journeyConfig.sectionTag[lang]}
            onSave={(val) =>
              onUpdateConfig?.({
                ...config,
                journeyConfig: {
                  ...config.journeyConfig,
                  sectionTag: { ...config.journeyConfig.sectionTag, [lang]: val },
                },
              })
            }
            label="Section Tag"
            isAdminMode={isAdminMode}
            className="font-semibold tracking-wider uppercase"
          />
        </div>

        <EditableText
          value={config.journeyConfig.sectionTitle[lang]}
          onSave={(val) =>
            onUpdateConfig?.({
              ...config,
              journeyConfig: {
                ...config.journeyConfig,
                sectionTitle: { ...config.journeyConfig.sectionTitle, [lang]: val },
              },
            })
          }
          label="Section Title"
          isAdminMode={isAdminMode}
          as="h2"
          className={`text-3xl sm:text-4xl md:text-5xl font-bold text-rose-950 block ${
            lang === 'my' ? 'font-burmese' : 'font-serif-romantic'
          }`}
        />

        {/* Highlighted Days Milestone Ring */}
        <div className="pt-2">
          <div className="inline-block px-6 py-2.5 rounded-2xl glass-panel-gold border border-amber-400/50 shadow-lg glow-gold animate-breathe">
            <span className={`text-2xl sm:text-3xl font-bold text-amber-950 tracking-wider ${
              lang === 'my' ? 'font-burmese' : 'font-serif-romantic'
            }`}>
              {daysTogether} {config.journeyConfig.counterSuffix[lang]}
            </span>
            <p className="text-xs text-rose-800 font-semibold mt-0.5">
              {config.journeyConfig.counterSubtext[lang]} ({config.relationshipStartDate})
            </p>
          </div>
        </div>
      </div>

      {/* Vertical Interactive Timeline */}
      <div className="relative max-w-xl w-full mx-auto pl-4 sm:pl-0">
        {/* Glowing Center / Left Connecting Line */}
        <div className="absolute left-7 sm:left-1/2 top-4 bottom-4 w-1 -translate-x-1/2 bg-gradient-to-b from-rose-400 via-pink-400 to-amber-400 shadow-md rounded-full" />

        <div className="space-y-6 sm:space-y-8">
          {config.milestones.map((m) => {
            return (
              <div
                key={m.id}
                className="relative flex items-start gap-4 sm:gap-6 group"
              >
                {/* Milestone Node Icon with Heartbeat Hover */}
                <div
                  className="z-10 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white border-2 border-rose-400 flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 group-hover:border-amber-400 transition-all duration-300"
                >
                  {getMilestoneIcon(m.iconName)}
                </div>

                {/* Milestone Card: Cleanly focused on Main Caption and Auto-fitting Photo */}
                <div
                  className="flex-1 glass-panel rounded-2xl p-4 sm:p-5 border border-rose-200/90 hover:border-rose-400 transition-all duration-300 shadow-md text-left text-slate-900 bg-white/70"
                >
                  {/* Card Header: Date & Main Caption */}
                  <div className="space-y-1">
                    <span className="text-xs font-mono text-rose-800 font-semibold block">
                      {m.dateStr}
                    </span>
                    <h3 className={`text-base sm:text-lg font-bold text-slate-950 group-hover:text-rose-700 transition-colors ${
                      lang === 'my' ? 'font-burmese' : 'font-serif-romantic'
                    }`}>
                      {m.title[lang] || m.title.my}
                    </h3>
                  </div>

                  {/* Photo: Auto-sized according to the uploaded photo (9:16 portrait, 16:9 landscape, 1:1, etc.) */}
                  {m.photoUrl && (
                    <div
                      className="mt-3.5 relative rounded-2xl overflow-hidden border border-rose-200/90 shadow-md bg-slate-950/20 group/photo select-none cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setModalPhoto({
                          url: m.photoUrl!,
                          title: m.title[lang] || m.title.my || 'Memory',
                        });
                      }}
                      title="Click to view full photo"
                    >
                      {/* Ambient soft glow matching the photo's colors */}
                      <div
                        className="absolute inset-0 bg-cover bg-center filter blur-xl scale-110 opacity-30 pointer-events-none"
                        style={{ backgroundImage: `url(${m.photoUrl})` }}
                      />

                      {/* Auto-adapts naturally to whatever photo is uploaded - 100% visible, no cropped people */}
                      <div className="relative w-full flex items-center justify-center p-1 sm:p-2">
                        <img
                          src={m.photoUrl}
                          alt={m.title[lang] || 'Memory'}
                          referrerPolicy="no-referrer"
                          className="w-full h-auto max-h-[75vh] object-contain rounded-xl shadow-sm transition-transform duration-300 group-hover/photo:scale-[1.01] block"
                          loading="lazy"
                        />
                      </div>

                      {/* Tap to view full size badge */}
                      <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/75 backdrop-blur-md border border-white/20 text-white text-[11px] font-medium shadow-md opacity-85 group-hover/photo:opacity-100 transition-opacity pointer-events-none">
                        <Maximize2 className="w-3 h-3 text-pink-300" />
                        <span>{lang === 'my' ? 'ပုံအပြည့်ကြည့်ရန်' : 'View Full Photo'}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fullscreen Lightbox Modal for Full-Res Viewing */}
      {modalPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-fade-in"
          onClick={() => setModalPhoto(null)}
        >
          {/* Top Bar with Title & Close */}
          <div className="absolute top-4 inset-x-4 max-w-4xl mx-auto flex items-center justify-between z-10 pointer-events-auto">
            <span className="text-white font-medium text-sm sm:text-base px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
              {modalPhoto.title}
            </span>
            <button
              onClick={() => setModalPhoto(null)}
              className="p-2 rounded-full bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer border border-white/20"
              aria-label="Close photo view"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Full Photo: Auto-sized to full screen, preserving 9:16 and all aspect ratios */}
          <div
            className="relative max-w-4xl max-h-[85vh] w-full flex items-center justify-center my-auto pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={modalPhoto.url}
              alt={modalPhoto.title}
              referrerPolicy="no-referrer"
              className="max-h-[85vh] max-w-[92vw] object-contain rounded-2xl shadow-2xl border border-white/10 select-none"
            />
          </div>

          <div className="absolute bottom-4 text-center text-xs text-white/70 pointer-events-none">
            {lang === 'my' ? 'ပိတ်ရန် နေရာလွတ်ကို နှိပ်ပါ' : 'Click anywhere outside to close'}
          </div>
        </div>
      )}

      {/* Continue to Under the Stars */}
      <div className="mt-12 text-center">
        <button
          onClick={onContinue}
          className={`px-8 py-3.5 rounded-full bg-gradient-to-r from-rose-600 via-pink-600 to-rose-600 hover:from-rose-500 hover:to-pink-500 text-white font-medium text-sm sm:text-base shadow-xl shadow-rose-600/30 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer font-semibold mx-auto ${
            lang === 'my' ? 'font-burmese' : 'font-sans'
          }`}
        >
          <span>
            {lang === 'my'
              ? 'မိုးပြာရောင်ကောင်းကင်အောက် မေပယ်လ်ဥယျာဉ်ဆီသို့ 🍁'
              : lang === 'ko'
              ? '푸른 하늘 아래 비밀의 정원으로 🍁'
              : lang === 'zh'
              ? '前往枫叶轻舞的花海之境 🍁'
              : 'To the Maple Garden of Whispers 🍁'}
          </span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
