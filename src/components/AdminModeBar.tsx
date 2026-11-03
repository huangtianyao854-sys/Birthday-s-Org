import React, { useState } from 'react';
import {
  ShieldAlert,
  Edit3,
  Settings,
  Cloud,
  X,
  ChevronDown,
  ChevronUp,
  Check,
  Sparkles,
  Heart,
  User,
  Calendar,
  Layers,
  Save,
  Loader2,
  Music,
  BookOpen,
} from 'lucide-react';
import { BirthdayConfig, replaceNicknameEverywhere } from '../config/birthdayConfig';
import { saveSiteSettingsToSupabase, saveTimelineItemsToSupabase } from '../services/supabaseService';

interface AdminModeBarProps {
  isAdminMode: boolean;
  onExitAdminMode: () => void;
  config: BirthdayConfig;
  onUpdateConfig: (newConfig: BirthdayConfig) => void;
  onOpenSettings: () => void;
  onOpenTextEditor?: () => void;
  onOpenSongUpload?: () => void;
  onOpenGuestbook?: () => void;
  currentScene: number;
  onChangeScene: (scene: number) => void;
}

export const AdminModeBar: React.FC<AdminModeBarProps> = ({
  isAdminMode,
  onExitAdminMode,
  config,
  onUpdateConfig,
  onOpenSettings,
  onOpenTextEditor,
  onOpenSongUpload,
  onOpenGuestbook,
  currentScene,
  onChangeScene,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isQuickNamesOpen, setIsQuickNamesOpen] = useState(false);
  const [isSavingCloud, setIsSavingCloud] = useState(false);
  const [cloudStatus, setCloudStatus] = useState<string | null>(null);

  // Quick edit names form state
  const [gfName, setGfName] = useState(config.girlfriendName);
  const [nickname, setNickname] = useState(config.nickname);
  const [nicknameBurmese, setNicknameBurmese] = useState(config.nicknameBurmese || 'မနှင်းလေး');
  const [bfName, setBfName] = useState(config.boyfriendName);
  const [autoReplaceAll, setAutoReplaceAll] = useState(true);

  if (!isAdminMode) return null;

  const handleSaveQuickNames = (e: React.FormEvent) => {
    e.preventDefault();

    let updated: BirthdayConfig;
    if (autoReplaceAll) {
      updated = replaceNicknameEverywhere(
        {
          ...config,
          girlfriendName: gfName.trim() || config.girlfriendName,
          boyfriendName: bfName.trim() || config.boyfriendName,
        },
        nickname.trim(),
        nicknameBurmese.trim()
      );
    } else {
      updated = {
        ...config,
        girlfriendName: gfName.trim() || config.girlfriendName,
        nickname: nickname.trim() || config.nickname,
        nicknameBurmese: nicknameBurmese.trim() || config.nicknameBurmese,
        boyfriendName: bfName.trim() || config.boyfriendName,
      };
    }

    onUpdateConfig(updated);
    localStorage.setItem('hny_custom_birthday_config_v3', JSON.stringify(updated));
    setIsQuickNamesOpen(false);
    setCloudStatus('Nickname & names updated!');
    setTimeout(() => setCloudStatus(null), 3000);
  };

  const handleSaveToCloud = async () => {
    setIsSavingCloud(true);
    setCloudStatus(null);
    try {
      const res1 = await saveSiteSettingsToSupabase(config);
      const res2 = await saveTimelineItemsToSupabase(config.milestones);
      if (res1.success && res2.success) {
        setCloudStatus('Saved to Cloud!');
      } else {
        setCloudStatus('Saved locally (check Supabase)');
      }
    } catch {
      setCloudStatus('Saved locally');
    } finally {
      setIsSavingCloud(false);
      setTimeout(() => setCloudStatus(null), 3500);
    }
  };

  const scenes = [
    { num: 1, name: '1: Entrance' },
    { num: 2, name: '2: Gate' },
    { num: 3, name: '3: Cake' },
    { num: 4, name: '4: Letter' },
    { num: 5, name: '5: Journey' },
    { num: 6, name: '6: Stars' },
    { num: 7, name: '7: Surprise' },
  ];

  return (
    <>
      {/* Floating Top Admin Bar (Mobile-Optimized) */}
      <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 w-[96vw] max-w-4xl pointer-events-auto animate-fade-in font-sans">
        <div className="bg-slate-950/95 border border-pink-500/50 rounded-2xl shadow-2xl p-2 sm:p-2.5 backdrop-blur-md text-xs text-slate-100 flex flex-col gap-2">
          
          {/* Top Status & Controls Header Row */}
          <div className="flex items-center justify-between gap-2 w-full">
            <div className="flex items-center gap-2 min-w-0">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-pink-500/25 border border-pink-400/40 text-pink-200 font-semibold shrink-0">
                <span className="w-2 h-2 rounded-full bg-pink-400 animate-ping" />
                <span>Admin Mode</span>
              </span>

              <span className="text-[11px] text-pink-300/80 truncate hidden sm:inline">
                ✨ Click any text to edit directly
              </span>

              {cloudStatus && (
                <span className="text-[11px] text-emerald-300 font-mono animate-fade-in shrink-0 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  ✓ {cloudStatus}
                </span>
              )}
            </div>

            {/* Quick Action Controls */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer flex items-center gap-1 text-[11px]"
                title={isCollapsed ? 'Expand Admin Toolbar' : 'Minimize Toolbar'}
              >
                {isCollapsed ? (
                  <>
                    <ChevronDown className="w-3.5 h-3.5 text-pink-400" />
                    <span className="hidden xs:inline">Expand</span>
                  </>
                ) : (
                  <>
                    <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                    <span className="hidden xs:inline">Minimize</span>
                  </>
                )}
              </button>

              <button
                onClick={onExitAdminMode}
                className="px-2.5 py-1 rounded-lg bg-rose-950/90 hover:bg-rose-900 text-rose-200 border border-rose-500/50 text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1"
                title="Exit Admin Mode"
              >
                <X className="w-3 h-3" />
                <span>Exit</span>
              </button>
            </div>
          </div>

          {/* Action Buttons Row: Smooth Horizontal Scroll on Mobile Phone */}
          {!isCollapsed && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 w-full max-w-full touch-pan-x scroll-smooth border-t border-slate-800/80 pt-2">
              {/* Quick Edit Nickname Button */}
              <button
                onClick={() => {
                  setGfName(config.girlfriendName);
                  setNickname(config.nickname);
                  setNicknameBurmese(config.nicknameBurmese || 'မနှင်းလေး');
                  setBfName(config.boyfriendName);
                  setIsQuickNamesOpen(true);
                }}
                className="shrink-0 flex items-center justify-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 text-pink-200 border border-pink-500/40 transition-colors cursor-pointer active:scale-95 text-xs font-medium whitespace-nowrap"
                title="Quickly change nickname & names"
              >
                <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400/40 shrink-0" />
                <span className="hidden xs:inline">Edit Names</span>
              </button>

              {/* Edit All Texts Modal */}
              {onOpenTextEditor && (
                <button
                  onClick={onOpenTextEditor}
                  className="shrink-0 flex items-center justify-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-sky-900/80 hover:bg-sky-800 text-sky-200 border border-sky-500/60 transition-colors cursor-pointer active:scale-95 text-xs font-medium whitespace-nowrap"
                  title="Edit All Texts and Messages"
                >
                  <Edit3 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span className="hidden xs:inline">Edit All Texts</span>
                </button>
              )}

              {/* Upload Any Song Modal */}
              {onOpenSongUpload && (
                <button
                  onClick={onOpenSongUpload}
                  className="shrink-0 flex items-center justify-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-pink-900/80 hover:bg-pink-800 text-pink-200 border border-pink-500/50 transition-colors cursor-pointer active:scale-95 text-xs font-medium whitespace-nowrap"
                  title="Upload any song or audio file"
                >
                  <Music className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                  <span className="hidden xs:inline">Upload Song</span>
                </button>
              )}

              {/* Guestbook Wishes Button */}
              {onOpenGuestbook && (
                <button
                  onClick={onOpenGuestbook}
                  className="shrink-0 flex items-center justify-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-rose-900/80 hover:bg-rose-800 text-rose-200 border border-rose-500/50 transition-colors cursor-pointer active:scale-95 text-xs font-medium whitespace-nowrap"
                  title="Moderate Guestbook Wishes"
                >
                  <BookOpen className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span className="hidden xs:inline">Guestbook</span>
                </button>
              )}

              {/* Full Settings Modal */}
              <button
                onClick={onOpenSettings}
                className="shrink-0 flex items-center justify-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors cursor-pointer active:scale-95 text-xs font-medium whitespace-nowrap"
                title="All Settings & Secrets"
              >
                <Settings className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="hidden xs:inline">Settings</span>
              </button>

              {/* Save to Cloud Button */}
              <button
                onClick={handleSaveToCloud}
                disabled={isSavingCloud}
                className="shrink-0 flex items-center justify-center gap-1 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold shadow-sm transition-all cursor-pointer active:scale-95 text-xs whitespace-nowrap"
                title="Save Changes to Cloud"
              >
                {isSavingCloud ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                ) : (
                  <Save className="w-3.5 h-3.5 shrink-0" />
                )}
                <span className="hidden xs:inline">Save Cloud</span>
              </button>

              {/* Scene Jumper Segment */}
              <div className="shrink-0 flex items-center gap-1 bg-slate-900/90 rounded-xl p-1 border border-slate-800">
                <span className="text-[10px] text-slate-400 px-1 font-semibold uppercase">Scene:</span>
                {scenes.map((s) => (
                  <button
                    key={s.num}
                    onClick={() => onChangeScene(s.num)}
                    className={`px-2 py-0.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      currentScene === s.num
                        ? 'bg-pink-500 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {s.num}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Edit Nickname & Names Modal */}
      {isQuickNamesOpen && (
        <div
          onClick={() => setIsQuickNamesOpen(false)}
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in font-sans select-none"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="glass-panel w-full max-w-md rounded-3xl p-5 border border-pink-500/40 text-slate-100 shadow-2xl bg-slate-950/95 space-y-4 animate-scale-up cursor-default"
          >
            <div className="flex items-center justify-between pb-3 border-b border-pink-500/20">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-400 fill-pink-400/30 animate-heartbeat" />
                <div>
                  <h3 className="text-base font-semibold text-pink-200">
                    Quick Edit Nicknames &amp; Names
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Change nickname anytime without touching any code!
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsQuickNamesOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveQuickNames} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs text-pink-300 font-medium flex items-center gap-1">
                  <span>Nickname (Burmese / အခေါ်အဝေါ်)</span>
                </label>
                <input
                  type="text"
                  value={nicknameBurmese}
                  onChange={(e) => setNicknameBurmese(e.target.value)}
                  placeholder="e.g. မနှင်းလေး, အသဲလေး, သဲလေး, ပူတူးလေး"
                  className="w-full bg-slate-900 border border-slate-700 focus:border-pink-400 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-pink-300 font-medium flex items-center gap-1">
                  <span>Nickname (English / Global)</span>
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="e.g. Baby, Honey, Sweetheart, My Love"
                  className="w-full bg-slate-900 border border-slate-700 focus:border-pink-400 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-medium">Girlfriend Full Name</label>
                  <input
                    type="text"
                    value={gfName}
                    onChange={(e) => setGfName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 focus:border-pink-400 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-medium">Boyfriend Name</label>
                  <input
                    type="text"
                    value={bfName}
                    onChange={(e) => setBfName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 focus:border-pink-400 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              <label className="flex items-start gap-2 pt-1 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoReplaceAll}
                  onChange={(e) => setAutoReplaceAll(e.target.checked)}
                  className="mt-0.5 rounded text-pink-500 focus:ring-pink-400 bg-slate-900 border-slate-700"
                />
                <span className="leading-snug">
                  Automatically update this nickname across all love letters, greetings, whispers, and messages across the entire app
                </span>
              </label>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsQuickNamesOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white font-medium text-xs shadow-md shadow-pink-500/25 flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Apply Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
