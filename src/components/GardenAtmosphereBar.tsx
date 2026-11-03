import React from 'react';
import { Sun, Sunset, Moon, MoonStar, Sparkles } from 'lucide-react';
import { GardenLightingMode } from './RealGardenBackground';
import { AppLanguage } from '../config/birthdayConfig';

interface GardenAtmosphereBarProps {
  currentMode: GardenLightingMode;
  onChangeMode: (mode: GardenLightingMode) => void;
  lang: AppLanguage;
  showExploreMode: boolean;
  onToggleExploreMode: () => void;
  isAdminMode?: boolean;
}

export const GardenAtmosphereBar: React.FC<GardenAtmosphereBarProps> = ({
  currentMode,
  onChangeMode,
  lang,
  showExploreMode,
  onToggleExploreMode,
  isAdminMode = false,
}) => {
  const getModeLabel = (mode: GardenLightingMode) => {
    switch (mode) {
      case 'daylight':
        return lang === 'my' ? 'နေ့ခင်း' : lang === 'ko' ? '낮' : lang === 'zh' ? '白昼' : 'Day';
      case 'golden':
        return lang === 'my' ? 'ဆည်းဆာ' : lang === 'ko' ? '노을' : lang === 'zh' ? '夕阳' : 'Sunset';
      case 'twilight':
        return lang === 'my' ? 'ကြယ်စုံည' : lang === 'ko' ? '별밤' : lang === 'zh' ? '星夜' : 'Twilight';
      case 'midnight':
        return lang === 'my' ? 'သန်းခေါင်' : lang === 'ko' ? '자정' : lang === 'zh' ? '午夜' : 'Midnight';
    }
  };

  return (
    <div
      role="region"
      aria-label="Garden Time of Day Mode Switcher"
      className={`fixed left-1/2 -translate-x-1/2 z-40 pointer-events-auto transition-all duration-300 ${
        isAdminMode ? 'top-24 sm:top-16' : 'top-3.5'
      }`}
    >
      <div
        style={{ width: '154px', height: '30px' }}
        className="glass-panel p-1 rounded-full flex items-center justify-between shadow-lg border border-rose-200/90 backdrop-blur-md w-[154px] h-[30px] overflow-hidden"
      >
        {/* Day Mode */}
        <button
          onClick={() => onChangeMode('daylight')}
          title={`Daylight (${getModeLabel('daylight')})`}
          aria-label="Day Mode"
          style={{ width: '30px', height: '20px' }}
          className={`w-[30px] h-[20px] p-0 rounded-full transition-all duration-300 flex items-center justify-center cursor-pointer active:scale-95 shrink-0 ${
            currentMode === 'daylight'
              ? 'bg-amber-500 text-white shadow-sm font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
          }`}
        >
          <Sun className="w-3.5 h-3.5 text-amber-100" />
        </button>

        {/* Sunset Mode */}
        <button
          onClick={() => onChangeMode('golden')}
          title={`Sunset (${getModeLabel('golden')})`}
          aria-label="Sunset Mode"
          style={{ width: '30px', height: '20px' }}
          className={`w-[30px] h-[20px] p-0 rounded-full transition-all duration-300 flex items-center justify-center cursor-pointer active:scale-95 shrink-0 ${
            currentMode === 'golden'
              ? 'bg-gradient-to-r from-amber-600 to-rose-600 text-white shadow-sm font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
          }`}
        >
          <Sunset className="w-3.5 h-3.5 text-amber-200" />
        </button>

        {/* Twilight Mode */}
        <button
          onClick={() => onChangeMode('twilight')}
          title={`Twilight (${getModeLabel('twilight')})`}
          aria-label="Twilight Mode"
          style={{ width: '30px', height: '20px' }}
          className={`w-[30px] h-[20px] p-0 rounded-full transition-all duration-300 flex items-center justify-center cursor-pointer active:scale-95 shrink-0 ${
            currentMode === 'twilight'
              ? 'bg-gradient-to-r from-indigo-900 to-purple-900 text-amber-200 shadow-sm font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
          }`}
        >
          <Moon className="w-3.5 h-3.5 text-amber-300" />
        </button>

        {/* Midnight Mode */}
        <button
          onClick={() => onChangeMode('midnight')}
          title={`Midnight (${getModeLabel('midnight')})`}
          aria-label="Midnight Mode"
          style={{ width: '30px', height: '20px' }}
          className={`w-[30px] h-[20px] p-0 rounded-full transition-all duration-300 flex items-center justify-center cursor-pointer active:scale-95 shrink-0 ${
            currentMode === 'midnight'
              ? 'bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 text-sky-200 shadow-sm font-semibold ring-1 ring-sky-400/50'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
          }`}
        >
          <MoonStar className="w-3.5 h-3.5 text-sky-300" />
        </button>

        {/* Explore hotspots toggle */}
        <button
          onClick={onToggleExploreMode}
          title={showExploreMode ? 'Hide Garden Markers' : 'Explore Romantic Hotspots'}
          aria-label="Explore Garden Hotspots"
          style={{ width: '22px', height: '20px' }}
          className={`w-[22px] h-[20px] p-0 rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center shrink-0 ${
            showExploreMode
              ? 'bg-rose-500 text-white shadow-sm'
              : 'text-slate-500 hover:text-rose-700 hover:bg-rose-50'
          }`}
        >
          <Sparkles className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
