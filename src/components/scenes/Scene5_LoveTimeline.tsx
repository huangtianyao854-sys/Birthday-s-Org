import React, { useState } from 'react';
import { Heart, Sparkles, Cake, Compass, Sun, ChevronDown, ChevronUp, ArrowRight, Calendar, Camera } from 'lucide-react';
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
  const [expandedId, setExpandedId] = useState<string | null>(
    config.milestones[0]?.id || 'beginning'
  );

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
            const isExpanded = expandedId === m.id;

            return (
              <div
                key={m.id}
                className="relative flex items-start gap-4 sm:gap-6 group"
              >
                {/* Milestone Node Icon with Heartbeat Hover */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : m.id)}
                  className="z-10 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white border-2 border-rose-400 flex items-center justify-center shrink-0 cursor-pointer shadow-lg group-hover:scale-110 group-hover:border-amber-400 transition-all duration-300"
                >
                  {getMilestoneIcon(m.iconName)}
                </div>

                {/* Milestone Card */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : m.id)}
                  className={`flex-1 glass-panel rounded-2xl p-4 sm:p-5 border border-rose-200/90 hover:border-rose-400 transition-all duration-300 cursor-pointer shadow-md text-left text-slate-900 ${
                    isExpanded ? 'border-amber-400/80 bg-amber-50/95 shadow-xl' : ''
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-mono text-rose-800 font-semibold block">
                        {m.dateStr}
                      </span>
                      <h3 className={`text-base sm:text-lg font-bold text-slate-950 group-hover:text-rose-700 transition-colors ${
                        lang === 'my' ? 'font-burmese' : 'font-serif-romantic'
                      }`}>
                        {m.title[lang] || m.title.my}
                      </h3>
                    </div>
                    <button
                      className="text-rose-700 p-1 hover:text-rose-950 cursor-pointer"
                      aria-label="Expand card"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Tagline */}
                  <p className={`text-xs sm:text-sm text-slate-700 mt-1 font-medium ${
                    lang === 'my' ? 'font-burmese not-italic' : 'italic font-serif-romantic'
                  }`}>
                    &ldquo;{m.tagline[lang] || m.tagline.my}&rdquo;
                  </p>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className={`mt-3 pt-3 border-t border-rose-200 space-y-2 animate-fade-in text-xs sm:text-sm text-slate-900 leading-relaxed font-medium ${
                      lang === 'my' ? 'font-burmese' : ''
                    }`}>
                      <p>
                        {m.description[lang] || m.description.my}
                      </p>

                      {/* Photo if provided */}
                      {m.photoUrl && (
                        <div className="mt-3 rounded-xl overflow-hidden border border-rose-200 max-h-48 shadow-md">
                          <img
                            src={m.photoUrl}
                            alt={m.title[lang] || 'Memory'}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

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
