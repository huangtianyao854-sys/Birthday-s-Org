import React, { useState } from 'react';
import { Lock, Unlock, Eye, EyeOff, Sparkles, Heart } from 'lucide-react';
import { BirthdayConfig, AppLanguage } from '../../config/birthdayConfig';
import { EditableText } from '../EditableText';

interface Scene2Props {
  config: BirthdayConfig;
  lang: AppLanguage;
  onUnlockSuccess: () => void;
  isAdminMode?: boolean;
  onUpdateConfig?: (newConfig: BirthdayConfig) => void;
}

export const Scene2_PasswordGate: React.FC<Scene2Props> = ({
  config,
  lang,
  onUnlockSuccess,
  isAdminMode = false,
  onUpdateConfig,
}) => {
  const [inputPass, setInputPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = inputPass.trim().toLowerCase();
    const cleanTarget = config.passcode.trim().toLowerCase();

    if (cleanInput === cleanTarget) {
      setErrorMsg(null);
      onUnlockSuccess();
    } else {
      setIsShaking(true);
      setErrorMsg(`${config.gateErrorPrefix[lang]}${config.passcodeHint[lang]}`);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  return (
    <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 pt-20 pb-16 sm:py-16 select-none animate-fade-in-up">
      <div className="glass-panel w-full max-w-md rounded-3xl p-6 sm:p-8 text-center relative border border-rose-200/90 shadow-2xl animate-glow-pulse">
        {/* Enchanted Gate Arc SVG Motif with Heartbeat */}
        <div className="relative flex justify-center mb-6">
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-t from-rose-500/20 via-pink-500/15 to-amber-500/20 flex items-center justify-center border border-rose-400/50 shadow-[0_0_25px_rgba(244,63,94,0.3)] animate-heartbeat">
            <Lock className="w-8 h-8 text-rose-600 animate-pulse" />
            <Sparkles className="w-4 h-4 text-amber-500 absolute -top-1 -right-1 animate-spin-slow" />
          </div>
        </div>

        {/* Question Header */}
        <div className="space-y-2 mb-6">
          <EditableText
            value={config.gateQuestion[lang]}
            onSave={(val) =>
              onUpdateConfig?.({
                ...config,
                gateQuestion: { ...config.gateQuestion, [lang]: val },
              })
            }
            label="Gate Question"
            isAdminMode={isAdminMode}
            as="h2"
            className={`text-xl sm:text-2xl font-bold text-slate-900 block ${
              lang === 'my' ? 'font-burmese leading-relaxed' : 'font-serif-romantic'
            }`}
          />

          <EditableText
            value={config.gateSubtitle[lang]}
            onSave={(val) =>
              onUpdateConfig?.({
                ...config,
                gateSubtitle: { ...config.gateSubtitle, [lang]: val },
              })
            }
            label="Gate Subtitle"
            isAdminMode={isAdminMode}
            as="p"
            className={`text-xs text-rose-800 font-medium block ${
              lang === 'my' ? 'font-burmese mt-1' : 'font-sans'
            }`}
          />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div
            className={`relative transition-transform duration-200 ${
              isShaking ? 'animate-shake' : ''
            }`}
          >
            <input
              type={showPass ? 'text' : 'password'}
              value={inputPass}
              onChange={(e) => {
                setInputPass(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder="••••"
              autoFocus
              className="w-full bg-white border-2 border-rose-300 focus:border-rose-500 rounded-2xl py-3.5 pl-4 pr-12 text-center text-base sm:text-lg tracking-widest text-slate-900 placeholder:text-rose-300 focus:outline-none focus:ring-4 focus:ring-rose-400/20 transition-all font-mono shadow-inner"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-rose-600/80 hover:text-rose-800 p-1 cursor-pointer"
              aria-label={showPass ? 'Hide password' : 'Show password'}
            >
              {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className={`text-xs text-rose-800 bg-rose-100/90 border border-rose-300 rounded-xl p-2.5 animate-fade-in leading-relaxed font-medium ${lang === 'my' ? 'font-burmese' : 'font-sans'}`}>
              {errorMsg}
            </div>
          )}

          {/* Unlock Button */}
          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-rose-600 hover:from-rose-500 hover:to-pink-500 text-white font-medium text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl shadow-rose-600/25 active:scale-98 transition-all cursor-pointer font-semibold"
          >
            <Unlock className="w-4 h-4 text-white" />
            <EditableText
              value={config.gateButtonText[lang]}
              onSave={(val) =>
                onUpdateConfig?.({
                  ...config,
                  gateButtonText: { ...config.gateButtonText, [lang]: val },
                })
              }
              label="Gate Button Text"
              isAdminMode={isAdminMode}
              className={lang === 'my' ? 'font-burmese' : 'font-serif-romantic'}
            />
          </button>
        </form>

        {/* Hint toggle */}
        <div className="mt-5 pt-4 border-t border-rose-200/60 flex flex-col items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => setShowHint(!showHint)}
            className="text-rose-900 hover:text-rose-950 flex items-center gap-1 transition-colors font-medium cursor-pointer"
          >
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/40" />
            <span>{config.gateHintButtonText[lang]}</span>
          </button>

          {showHint && (
            <div className="p-3 bg-rose-50/95 rounded-xl border border-rose-200/80 text-rose-950 text-xs animate-fade-in text-center max-w-xs leading-relaxed font-medium shadow-sm">
              <span className="font-semibold text-amber-700">Hint:</span> {config.passcodeHint[lang]}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
