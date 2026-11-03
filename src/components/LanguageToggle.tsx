import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { AppLanguage } from '../config/birthdayConfig';

interface LanguageToggleProps {
  currentLang: AppLanguage;
  onChangeLang: (lang: AppLanguage) => void;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({
  currentLang,
  onChangeLang,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages: { code: AppLanguage; label: string; flag: string }[] = [
    { code: 'my', label: 'မြန်မာ', flag: '🇲🇲' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'ko', label: '한국어', flag: '🇰🇷' },
    { code: 'zh', label: '中文', flag: '🇨🇳' },
  ];

  const currentItem = languages.find((l) => l.code === currentLang) || languages[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <aside aria-label="Language Selector" ref={dropdownRef} className="fixed top-4 left-4 z-40">
      <button
        onClick={() => setIsOpen(!isOpen)}
        title={`Language: ${currentItem.label} (${currentItem.flag})`}
        aria-label="Language Selector"
        style={{ width: '30px', height: '15px' }}
        className="w-[30px] h-[15px] p-0 glass-panel rounded-full flex items-center justify-center text-slate-800 hover:text-rose-950 border border-rose-200/90 transition-all active:scale-95 shadow-sm cursor-pointer"
      >
        <Globe className="w-2.5 h-2.5 text-rose-600" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 glass-panel rounded-2xl py-1.5 px-1 shadow-2xl border border-rose-200/90 min-w-[135px] animate-fade-in flex flex-col gap-0.5">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                onChangeLang(lang.code);
                setIsOpen(false);
              }}
              className={`px-3 py-1.5 rounded-xl text-left text-xs flex items-center justify-between transition-colors ${
                currentLang === lang.code
                  ? 'bg-rose-100/90 text-rose-950 font-semibold'
                  : 'text-slate-700 hover:text-rose-900 hover:bg-rose-50'
              }`}
            >
              <span>{lang.label}</span>
              <span className="text-[11px] opacity-80">{lang.flag}</span>
            </button>
          ))}
        </div>
      )}
    </aside>
  );
};
