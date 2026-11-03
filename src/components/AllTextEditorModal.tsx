import React, { useState, useRef } from 'react';
import {
  X,
  Save,
  RotateCcw,
  Sparkles,
  Heart,
  Type,
  BookOpen,
  Calendar,
  Lock,
  Cake,
  Mail,
  Check,
  Edit3,
  Music,
  Upload,
  Play,
  Pause,
  ShieldCheck,
  Volume2,
  Loader2,
  Sun,
  ScrollText,
  Plus,
  Trash2,
} from 'lucide-react';
import { BirthdayConfig, AppLanguage, initialBirthdayConfig, LoveScrollWish } from '../config/birthdayConfig';
import { saveSiteSettingsToSupabase, uploadAudioToSupabase } from '../services/supabaseService';
import { saveSongToIndexedDB, clearSongFromIndexedDB } from '../utils/audioStorage';
import { romanticAudio } from '../utils/romanticAudio';
import { birdsongAudio } from '../utils/birdsongAudio';

interface AllTextEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: BirthdayConfig;
  onSaveConfig: (newConfig: BirthdayConfig) => void;
  isAdminMode: boolean;
  onToggleAdminMode: (active: boolean) => void;
}

type TabKey =
  | 'names'
  | 'scene1'
  | 'scene2'
  | 'scene3'
  | 'scene4'
  | 'scene5'
  | 'scene6'
  | 'scene7'
  | 'music'
  | 'lovescroll';

export const AllTextEditorModal: React.FC<AllTextEditorModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  isAdminMode,
  onToggleAdminMode,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('names');
  const [editLang, setEditLang] = useState<AppLanguage>('my');
  const [draft, setDraft] = useState<BirthdayConfig>(() => JSON.parse(JSON.stringify(config)));
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Admin Verification Gate for non-admins
  const [adminPasscodeInput, setAdminPasscodeInput] = useState('');
  const [adminPasscodeError, setAdminPasscodeError] = useState<string | null>(null);

  // Audio Upload & Preview State
  const audioFileInputRef = useRef<HTMLInputElement>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [audioUploadProgress, setAudioUploadProgress] = useState<string | null>(null);
  const [audioUploadSuccess, setAudioUploadSuccess] = useState<string | null>(null);
  const [audioUploadError, setAudioUploadError] = useState<string | null>(null);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [customLinkInput, setCustomLinkInput] = useState('');

  // Sync draft when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setDraft(JSON.parse(JSON.stringify(config)));
      setSaveSuccess(false);
      setAdminPasscodeError(null);
      setAdminPasscodeInput('');
    }
    return () => {
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
      }
    };
  }, [isOpen, config]);

  if (!isOpen) return null;

  // STRICT ACCESS CONTROL: Only admin can change text
  if (!isAdminMode) {
    const handleVerifyAdmin = (e: React.FormEvent) => {
      e.preventDefault();
      if (adminPasscodeInput.trim().toUpperCase() === 'H143') {
        onToggleAdminMode(true);
        sessionStorage.setItem('hny_admin_mode', 'true');
        setAdminPasscodeError(null);
      } else {
        setAdminPasscodeError('Incorrect passcode. Only admin can change text.');
      }
    };

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sky-950/70 backdrop-blur-md animate-fade-in select-none"
        role="dialog"
        aria-modal="true"
      >
        <div className="relative w-full max-w-sm bg-white/95 rounded-3xl shadow-2xl border border-sky-200 p-6 text-center animate-scale-up text-slate-800">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 via-rose-500 to-amber-500 text-white flex items-center justify-center mx-auto mb-3 shadow-md">
            <Lock className="w-6 h-6" />
          </div>

          <h3 className="text-base font-bold text-sky-950 font-serif-romantic mb-1">
            Admin Access Required
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Only the administrator can edit text, poems, and messages. Please enter the admin passcode.
          </p>

          <form onSubmit={handleVerifyAdmin} className="space-y-3">
            <input
              type="password"
              value={adminPasscodeInput}
              onChange={(e) => setAdminPasscodeInput(e.target.value)}
              placeholder="Enter Admin Passcode"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-center text-sm focus:outline-none focus:border-rose-500 tracking-widest font-mono bg-white"
              autoFocus
            />

            {adminPasscodeError && (
              <p className="text-xs text-rose-600 font-medium animate-shake">
                {adminPasscodeError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-500 via-rose-500 to-amber-500 hover:from-sky-600 hover:to-rose-600 text-white text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
            >
              Unlock Editor
            </button>
          </form>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    setIsSaving(true);
    try {
      onSaveConfig(draft);
      // Persist to Supabase if configured
      await saveSiteSettingsToSupabase(draft);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.warn('Failed to sync settings to Supabase, saved locally:', err);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset all texts back to original garden birthday defaults?')) {
      setDraft(JSON.parse(JSON.stringify(initialBirthdayConfig)));
    }
  };

  // Audio Upload Handlers
  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAudio(true);
    setAudioUploadProgress(`Processing "${file.name}"...`);
    setAudioUploadError(null);
    setAudioUploadSuccess(null);

    try {
      setAudioUploadProgress(`Uploading "${file.name}" to Supabase Cloud...`);
      const cloudResult = await uploadAudioToSupabase(file);
      if (cloudResult.error || !cloudResult.url) {
        setAudioUploadError(cloudResult.error || 'Failed to upload song to Supabase cloud.');
        return;
      }

      const finalAudioUrl = cloudResult.url;

      // Cache in local IndexedDB
      await saveSongToIndexedDB(file);

      const updatedDraft = {
        ...draft,
        audioTrackUrl: finalAudioUrl,
      };

      setDraft(updatedDraft);
      onSaveConfig(updatedDraft);
      localStorage.setItem('hny_custom_birthday_config_v3', JSON.stringify(updatedDraft));

      // Auto-save to Supabase immediately
      await saveSiteSettingsToSupabase(updatedDraft);

      // Play immediately in main audio engine
      romanticAudio.play(finalAudioUrl);

      const storageLabel = cloudResult.isDataUrl ? 'Supabase Database' : 'Supabase Cloud Storage';
      setAudioUploadSuccess(`"${file.name}" saved to ${storageLabel}! Synced across all devices. ❤️`);
      setTimeout(() => setAudioUploadSuccess(null), 5000);
    } catch (err: any) {
      setAudioUploadError(err?.message || 'Failed to upload song.');
    } finally {
      setIsUploadingAudio(false);
      setAudioUploadProgress(null);
      if (audioFileInputRef.current) {
        audioFileInputRef.current.value = '';
      }
    }
  };

  const handleApplyAudioLink = () => {
    const url = customLinkInput.trim();
    if (!url) return;

    setDraft((prev) => ({
      ...prev,
      audioTrackUrl: url,
    }));
    romanticAudio.play(url);
    setAudioUploadSuccess('Custom song link applied and playing!');
    setTimeout(() => setAudioUploadSuccess(null), 4000);
  };

  const handleResetAudioToDefault = async () => {
    await clearSongFromIndexedDB();
    setDraft((prev) => ({
      ...prev,
      audioTrackUrl: '',
    }));
    romanticAudio.play('');
    setAudioUploadSuccess('Restored romantic piano & garden chimes melody!');
    setTimeout(() => setAudioUploadSuccess(null), 4000);
  };

  const togglePreviewAudio = () => {
    if (!audioPreviewRef.current || !draft.audioTrackUrl) return;

    if (isPreviewPlaying) {
      audioPreviewRef.current.pause();
      setIsPreviewPlaying(false);
    } else {
      audioPreviewRef.current.play().catch((err) => console.warn(err));
      setIsPreviewPlaying(true);
    }
  };

  const tabs: { id: TabKey; label: string; icon: React.ReactNode }[] = [
    { id: 'names', label: 'Names & Dates', icon: <Heart className="w-4 h-4 text-rose-500" /> },
    { id: 'scene1', label: 'Scene 1: Entrance', icon: <Sparkles className="w-4 h-4 text-amber-500" /> },
    { id: 'scene2', label: 'Scene 2: Gate', icon: <Lock className="w-4 h-4 text-sky-500" /> },
    { id: 'scene3', label: 'Scene 3: Cake', icon: <Cake className="w-4 h-4 text-pink-500" /> },
    { id: 'scene4', label: 'Scene 4: Love Letter', icon: <Mail className="w-4 h-4 text-rose-600" /> },
    { id: 'scene5', label: 'Scene 5: Story Timeline', icon: <Calendar className="w-4 h-4 text-emerald-500" /> },
    { id: 'scene6', label: 'Scene 6: Whispers', icon: <Type className="w-4 h-4 text-purple-500" /> },
    { id: 'scene7', label: 'Scene 7: Final Surprise', icon: <BookOpen className="w-4 h-4 text-amber-600" /> },
    { id: 'lovescroll', label: 'Love Scroll Wishes', icon: <ScrollText className="w-4 h-4 text-rose-500" /> },
    { id: 'music', label: 'Background Song', icon: <Music className="w-4 h-4 text-pink-500" /> },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-sky-950/60 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-white/95 rounded-3xl shadow-2xl border border-sky-200 overflow-hidden text-slate-800">
        
        {/* Header */}
        <div
          style={{ minHeight: '80px' }}
          className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-sky-100 bg-gradient-to-r from-sky-50 via-rose-50/60 to-amber-50 w-full"
        >
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-rose-500 flex items-center justify-center text-white shadow-md shrink-0">
              <Edit3 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold font-serif-romantic text-sky-950 flex items-center gap-1.5 flex-wrap">
                <span className="truncate">Edit All Texts & Story</span>
                <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-sans font-semibold flex items-center gap-1 shrink-0">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Admin Only
                </span>
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 truncate">
                Customize every word, message, whisper, letter, and background song.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-full hover:bg-slate-200/60 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Language Selection Bar & Status Notification */}
        <div
          style={{ minHeight: '49px' }}
          className="flex flex-wrap items-center justify-between px-3 sm:px-6 py-2 bg-sky-50/70 border-b border-sky-100 gap-1.5 w-full"
        >
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-[11px] sm:text-xs font-semibold text-sky-900 mr-1">Language:</span>
            {(['my', 'en', 'ko', 'zh'] as AppLanguage[]).map((l) => (
              <button
                key={l}
                onClick={() => setEditLang(l)}
                className={`px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[11px] sm:text-xs font-semibold transition-all cursor-pointer ${
                  editLang === l
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-sky-100 border border-slate-200'
                }`}
              >
                {l === 'my' ? '🇲🇲 မြန်မာ' : l === 'en' ? '🇬🇧 English' : l === 'ko' ? '🇰🇷 한국어' : '🇨🇳 中文'}
              </button>
            ))}
          </div>

          {saveSuccess && (
            <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-medium animate-fade-in shrink-0">
              <Check className="w-3 h-3 text-emerald-600" />
              <span>Saved! All scenes updated.</span>
            </div>
          )}
        </div>

        {/* Tab Navigation - Fixed 30px x 25px buttons with icons and active label */}
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-100 bg-white gap-2">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 touch-pan-x">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  title={tab.label}
                  aria-label={tab.label}
                  style={{ width: '30px', height: '25px', minWidth: '30px' }}
                  className={`w-[30px] h-[25px] min-w-[30px] p-0 rounded-lg flex items-center justify-center shrink-0 transition-all cursor-pointer active:scale-95 ${
                    isActive
                      ? 'bg-sky-500 text-white shadow-sm ring-1 ring-sky-400'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800 border border-slate-200/70'
                  }`}
                >
                  <span className={`scale-90 flex items-center justify-center ${isActive ? '[&_svg]:text-white' : ''}`}>
                    {tab.icon}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Tab Label Indicator */}
          <div className="shrink-0 text-[11px] font-medium text-sky-800 bg-sky-50 border border-sky-200/80 px-2 py-0.5 rounded-md truncate max-w-[140px] sm:max-w-none">
            {tabs.find((t) => t.id === activeTab)?.label}
          </div>
        </div>

        {/* Tab Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
          
          {/* TAB 1: Names & Dates */}
          {activeTab === 'names' && (
            <div className="space-y-4 max-w-2xl mx-auto">
              <div className="p-4 rounded-2xl bg-white border border-sky-100 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-sky-950 font-serif-romantic border-b pb-2">
                  Personal Names & Nicknames
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Girlfriend Name
                    </label>
                    <input
                      type="text"
                      value={draft.girlfriendName}
                      onChange={(e) => setDraft({ ...draft, girlfriendName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-sky-500 focus:outline-none bg-white text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Boyfriend Name
                    </label>
                    <input
                      type="text"
                      value={draft.boyfriendName}
                      onChange={(e) => setDraft({ ...draft, boyfriendName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-sky-500 focus:outline-none bg-white text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Burmese Nickname (မနှင်းလေး)
                    </label>
                    <input
                      type="text"
                      value={draft.nicknameBurmese}
                      onChange={(e) => setDraft({ ...draft, nicknameBurmese: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-sky-500 focus:outline-none bg-white text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      English Nickname (Baby)
                    </label>
                    <input
                      type="text"
                      value={draft.nickname}
                      onChange={(e) => setDraft({ ...draft, nickname: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-sky-500 focus:outline-none bg-white text-slate-800"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-sky-100 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-sky-950 font-serif-romantic border-b pb-2">
                  Dates & Passcode
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Birthday Date (YYYY-MM-DD)
                    </label>
                    <input
                      type="date"
                      value={draft.birthday}
                      onChange={(e) => setDraft({ ...draft, birthday: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-sky-500 focus:outline-none bg-white text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Relationship Start Date (Anniversary)
                    </label>
                    <input
                      type="date"
                      value={draft.relationshipStartDate}
                      onChange={(e) => setDraft({ ...draft, relationshipStartDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-sky-500 focus:outline-none bg-white text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Gate Passcode (e.g. 2405)
                    </label>
                    <input
                      type="text"
                      value={draft.passcode}
                      onChange={(e) => setDraft({ ...draft, passcode: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-sky-500 focus:outline-none bg-white text-slate-800 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Passcode Hint ({editLang.toUpperCase()})
                    </label>
                    <input
                      type="text"
                      value={draft.passcodeHint[editLang]}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          passcodeHint: { ...draft.passcodeHint, [editLang]: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-sky-500 focus:outline-none bg-white text-slate-800"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Scene 1 Entrance */}
          {activeTab === 'scene1' && (
            <div className="space-y-4 max-w-2xl mx-auto text-xs">
              <div className="p-4 rounded-2xl bg-white border border-sky-100 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-sky-950 font-serif-romantic border-b pb-2">
                  Scene 1: Secret Garden Entrance ({editLang.toUpperCase()})
                </h3>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Opening Greeting Quote
                  </label>
                  <textarea
                    rows={3}
                    value={draft.entranceGreeting[editLang]}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        entranceGreeting: { ...draft.entranceGreeting, [editLang]: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-sky-500 focus:outline-none bg-white text-slate-800 leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Welcome Headline
                  </label>
                  <input
                    type="text"
                    value={draft.entranceWelcome[editLang]}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        entranceWelcome: { ...draft.entranceWelcome, [editLang]: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-sky-500 focus:outline-none bg-white text-slate-800 font-serif-romantic font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Enter Button Text
                  </label>
                  <input
                    type="text"
                    value={draft.entranceButtonText[editLang]}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        entranceButtonText: { ...draft.entranceButtonText, [editLang]: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-sky-500 focus:outline-none bg-white text-slate-800"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Scene 2 Gate */}
          {activeTab === 'scene2' && (
            <div className="space-y-4 max-w-2xl mx-auto text-xs">
              <div className="p-4 rounded-2xl bg-white border border-sky-100 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-sky-950 font-serif-romantic border-b pb-2">
                  Scene 2: Heart Gate Question ({editLang.toUpperCase()})
                </h3>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Gate Prompt / Question
                  </label>
                  <textarea
                    rows={2}
                    value={draft.gateQuestion[editLang]}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        gateQuestion: { ...draft.gateQuestion, [editLang]: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-sky-500 focus:outline-none bg-white text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Gate Subtitle
                  </label>
                  <input
                    type="text"
                    value={draft.gateSubtitle[editLang]}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        gateSubtitle: { ...draft.gateSubtitle, [editLang]: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-sky-500 focus:outline-none bg-white text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Unlock Button Text
                  </label>
                  <input
                    type="text"
                    value={draft.gateButtonText[editLang]}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        gateButtonText: { ...draft.gateButtonText, [editLang]: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-sky-500 focus:outline-none bg-white text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Hint Button Text
                  </label>
                  <input
                    type="text"
                    value={draft.gateHintButtonText[editLang]}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        gateHintButtonText: { ...draft.gateHintButtonText, [editLang]: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-sky-500 focus:outline-none bg-white text-slate-800"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Scene 3 Cake */}
          {activeTab === 'scene3' && (
            <div className="space-y-4 max-w-2xl mx-auto text-xs">
              <div className="p-4 rounded-2xl bg-white border border-sky-100 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-sky-950 font-serif-romantic border-b pb-2">
                  Scene 3: Birthday Cake & Candles ({editLang.toUpperCase()})
                </h3>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Celebration Headline (Title)
                  </label>
                  <input
                    type="text"
                    value={draft.celebrationTitle[editLang]}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        celebrationTitle: { ...draft.celebrationTitle, [editLang]: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-sky-500 focus:outline-none bg-white text-slate-800 font-serif-romantic font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Celebration Subtitle / Birthday Message
                  </label>
                  <textarea
                    rows={3}
                    value={draft.celebrationSubtitle[editLang]}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        celebrationSubtitle: { ...draft.celebrationSubtitle, [editLang]: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-sky-500 focus:outline-none bg-white text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Make a Wish Candle Button
                  </label>
                  <input
                    type="text"
                    value={draft.cakeButtonText[editLang]}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        cakeButtonText: { ...draft.cakeButtonText, [editLang]: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-sky-500 focus:outline-none bg-white text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Wish Whispered Toast Message
                  </label>
                  <input
                    type="text"
                    value={draft.cakeWishWhisper[editLang]}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        cakeWishWhisper: { ...draft.cakeWishWhisper, [editLang]: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-sky-500 focus:outline-none bg-white text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Wish Realization Message
                  </label>
                  <textarea
                    rows={2}
                    value={draft.cakeWishMessage[editLang]}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        cakeWishMessage: { ...draft.cakeWishMessage, [editLang]: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-sky-500 focus:outline-none bg-white text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Read Letter CTA Button Text
                  </label>
                  <input
                    type="text"
                    value={draft.readLetterButtonText[editLang]}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        readLetterButtonText: { ...draft.readLetterButtonText, [editLang]: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-sky-500 focus:outline-none bg-white text-slate-800"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Scene 4 Love Letter */}
          {activeTab === 'scene4' && (
            <div className="space-y-4 max-w-2xl mx-auto text-xs">
              <div className="p-4 rounded-2xl bg-white border border-sky-100 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-sky-950 font-serif-romantic border-b pb-2">
                  Scene 4: Heartfelt Love Letter ({editLang.toUpperCase()})
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Letter Title
                    </label>
                    <input
                      type="text"
                      value={draft.letterTitle[editLang]}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          letterTitle: { ...draft.letterTitle, [editLang]: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-sky-500 focus:outline-none bg-white text-slate-800 font-serif-romantic font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Letter Subtitle
                    </label>
                    <input
                      type="text"
                      value={draft.letterSubtitle[editLang]}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          letterSubtitle: { ...draft.letterSubtitle, [editLang]: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-sky-500 focus:outline-none bg-white text-slate-800 font-serif-romantic"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Complete Love Letter Body Text (Supports paragraphs and line breaks)
                  </label>
                  <textarea
                    rows={12}
                    value={draft.letterContent[editLang]}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        letterContent: { ...draft.letterContent, [editLang]: e.target.value },
                      })
                    }
                    className="w-full p-4 rounded-2xl border border-slate-200 focus:border-rose-400 focus:outline-none bg-rose-50/20 text-slate-800 font-serif-romantic text-xs sm:text-sm leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Continue to Timeline Button Text
                  </label>
                  <input
                    type="text"
                    value={draft.letterExploreButtonText[editLang]}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        letterExploreButtonText: { ...draft.letterExploreButtonText, [editLang]: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-sky-500 focus:outline-none bg-white text-slate-800"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: Scene 5 Timeline */}
          {activeTab === 'scene5' && (
            <div className="space-y-4 max-w-2xl mx-auto text-xs">
              <div className="p-4 rounded-2xl bg-white border border-sky-100 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-sky-950 font-serif-romantic border-b pb-2">
                  Scene 5: Our Journey Story & Milestones ({editLang.toUpperCase()})
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Section Tag
                    </label>
                    <input
                      type="text"
                      value={draft.journeyConfig.sectionTag[editLang]}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          journeyConfig: {
                            ...draft.journeyConfig,
                            sectionTag: { ...draft.journeyConfig.sectionTag, [editLang]: e.target.value },
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-sky-500 focus:outline-none bg-white text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Section Title
                    </label>
                    <input
                      type="text"
                      value={draft.journeyConfig.sectionTitle[editLang]}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          journeyConfig: {
                            ...draft.journeyConfig,
                            sectionTitle: { ...draft.journeyConfig.sectionTitle, [editLang]: e.target.value },
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-sky-500 focus:outline-none bg-white text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Day Counter Suffix
                    </label>
                    <input
                      type="text"
                      value={draft.journeyConfig.counterSuffix[editLang]}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          journeyConfig: {
                            ...draft.journeyConfig,
                            counterSuffix: { ...draft.journeyConfig.counterSuffix, [editLang]: e.target.value },
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-sky-500 focus:outline-none bg-white text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Counter Subtext
                    </label>
                    <input
                      type="text"
                      value={draft.journeyConfig.counterSubtext[editLang]}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          journeyConfig: {
                            ...draft.journeyConfig,
                            counterSubtext: { ...draft.journeyConfig.counterSubtext, [editLang]: e.target.value },
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-sky-500 focus:outline-none bg-white text-slate-800"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t space-y-3">
                  <h4 className="font-semibold text-slate-800">Timeline Chapters:</h4>
                  {draft.milestones.map((ms, idx) => (
                    <div key={ms.id || idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sky-900">Chapter #{idx + 1}</span>
                        <input
                          type="text"
                          value={ms.dateStr}
                          onChange={(e) => {
                            const updated = [...draft.milestones];
                            updated[idx] = { ...updated[idx], dateStr: e.target.value };
                            setDraft({ ...draft, milestones: updated });
                          }}
                          placeholder="Date string"
                          className="px-2 py-1 text-xs rounded-lg border border-slate-200 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600">Title</label>
                        <input
                          type="text"
                          value={ms.title[editLang]}
                          onChange={(e) => {
                            const updated = [...draft.milestones];
                            updated[idx] = {
                              ...updated[idx],
                              title: { ...updated[idx].title, [editLang]: e.target.value },
                            };
                            setDraft({ ...draft, milestones: updated });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600">Tagline</label>
                        <input
                          type="text"
                          value={ms.tagline[editLang]}
                          onChange={(e) => {
                            const updated = [...draft.milestones];
                            updated[idx] = {
                              ...updated[idx],
                              tagline: { ...updated[idx].tagline, [editLang]: e.target.value },
                            };
                            setDraft({ ...draft, milestones: updated });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600">Story</label>
                        <textarea
                          rows={2}
                          value={ms.description[editLang]}
                          onChange={(e) => {
                            const updated = [...draft.milestones];
                            updated[idx] = {
                              ...updated[idx],
                              description: { ...updated[idx].description, [editLang]: e.target.value },
                            };
                            setDraft({ ...draft, milestones: updated });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: Scene 6 Whispers */}
          {activeTab === 'scene6' && (
            <div className="space-y-4 max-w-2xl mx-auto text-xs">
              <div className="p-4 rounded-2xl bg-white border border-sky-100 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-sky-950 font-serif-romantic border-b pb-2">
                  Scene 6: Garden Whispers & Wishing Flower ({editLang.toUpperCase()})
                </h3>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Badge Title
                  </label>
                  <input
                    type="text"
                    value={draft.starsTitle[editLang]}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        starsTitle: { ...draft.starsTitle, [editLang]: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-sky-500 focus:outline-none bg-white text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Sky & Garden Quote
                  </label>
                  <textarea
                    rows={2}
                    value={draft.starsQuote[editLang]}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        starsQuote: { ...draft.starsQuote, [editLang]: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-sky-500 focus:outline-none bg-white text-slate-800 leading-relaxed font-serif-romantic font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    value={draft.starsSubtitle[editLang]}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        starsSubtitle: { ...draft.starsSubtitle, [editLang]: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-sky-500 focus:outline-none bg-white text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Wishing Flower Tap Prompt
                  </label>
                  <input
                    type="text"
                    value={draft.moonTapPrompt[editLang]}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        moonTapPrompt: { ...draft.moonTapPrompt, [editLang]: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-sky-500 focus:outline-none bg-white text-slate-800"
                  />
                </div>

                <div className="pt-2 border-t space-y-3">
                  <h4 className="font-semibold text-slate-800">Sweet Whispers (Tapped by Baby):</h4>
                  {draft.moonWhispers.map((w, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-purple-50/50 border border-purple-100">
                      <label className="block font-medium text-purple-900 mb-1">
                        Whisper #{idx + 1}
                      </label>
                      <textarea
                        rows={2}
                        value={w.text[editLang]}
                        onChange={(e) => {
                          const updated = [...draft.moonWhispers];
                          updated[idx] = {
                            ...updated[idx],
                            text: { ...updated[idx].text, [editLang]: e.target.value },
                          };
                          setDraft({ ...draft, moonWhispers: updated });
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-purple-200 focus:border-purple-400 focus:outline-none bg-white text-slate-800"
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Continue to Final Surprise Button
                  </label>
                  <input
                    type="text"
                    value={draft.starsNextButtonText[editLang]}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        starsNextButtonText: { ...draft.starsNextButtonText, [editLang]: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-sky-500 focus:outline-none bg-white text-slate-800"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: Scene 7 Final Surprise */}
          {activeTab === 'scene7' && (
            <div className="space-y-4 max-w-2xl mx-auto text-xs">
              <div className="p-4 rounded-2xl bg-white border border-sky-100 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-sky-950 font-serif-romantic border-b pb-2">
                  Scene 7: Final Surprise & Secret Love Note ({editLang.toUpperCase()})
                </h3>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Final Chapter Tag
                  </label>
                  <input
                    type="text"
                    value={draft.finalChapterTag[editLang]}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        finalChapterTag: { ...draft.finalChapterTag, [editLang]: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-sky-500 focus:outline-none bg-white text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Final Surprise Invitation
                  </label>
                  <input
                    type="text"
                    value={draft.finalSurprisePrompt[editLang]}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        finalSurprisePrompt: { ...draft.finalSurprisePrompt, [editLang]: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-sky-500 focus:outline-none bg-white text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Open Gift Box Button Text
                  </label>
                  <input
                    type="text"
                    value={draft.openGiftButtonText[editLang]}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        openGiftButtonText: { ...draft.openGiftButtonText, [editLang]: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-sky-500 focus:outline-none bg-white text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Heartfelt Final Surprise Message (Revealed from Box)
                  </label>
                  <textarea
                    rows={8}
                    value={draft.finalMessage[editLang]}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        finalMessage: { ...draft.finalMessage, [editLang]: e.target.value },
                      })
                    }
                    className="w-full p-3 rounded-2xl border border-slate-200 focus:border-amber-400 focus:outline-none bg-amber-50/20 text-slate-800 font-serif-romantic leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Romantic Signature Tagline
                  </label>
                  <input
                    type="text"
                    value={draft.signature[editLang]}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        signature: { ...draft.signature, [editLang]: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-sky-500 focus:outline-none bg-white text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Experience It Again / Replay Button
                  </label>
                  <input
                    type="text"
                    value={draft.replayButtonText[editLang]}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        replayButtonText: { ...draft.replayButtonText, [editLang]: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-sky-500 focus:outline-none bg-white text-slate-800"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: Background Song Upload */}
          {activeTab === 'music' && (
            <div className="space-y-4 max-w-2xl mx-auto text-xs">
              <div className="p-4 rounded-2xl bg-white border border-sky-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="text-sm font-bold text-sky-950 font-serif-romantic flex items-center gap-2">
                    <Music className="w-4 h-4 text-pink-500" />
                    <span>Background Song & Audio (Admin Only)</span>
                  </h3>
                  {draft.audioTrackUrl ? (
                    <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Custom Song Active
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800">
                      Default Garden Piano
                    </span>
                  )}
                </div>

                {audioUploadSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-fade-in">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{audioUploadSuccess}</span>
                  </div>
                )}

                {audioUploadError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-fade-in">
                    <X className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{audioUploadError}</span>
                  </div>
                )}

                {/* Upload Any Audio File Card */}
                <div
                  onClick={() => audioFileInputRef.current?.click()}
                  className="border-2 border-dashed border-sky-300 hover:border-pink-400 rounded-2xl p-5 text-center cursor-pointer transition-all bg-sky-50/30 hover:bg-sky-50/70 group"
                >
                  <input
                    type="file"
                    ref={audioFileInputRef}
                    onChange={handleAudioUpload}
                    accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg,.flac,.webm,.mp4"
                    className="hidden"
                  />
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-400 to-rose-400 text-white flex items-center justify-center mx-auto mb-2 shadow-sm group-hover:scale-105 transition-transform">
                    {isUploadingAudio ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                  </div>
                  <p className="text-xs font-bold text-sky-950 font-serif-romantic">
                    {isUploadingAudio ? audioUploadProgress : 'Click to Upload Any Song (MP3, WAV, M4A, etc.)'}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Select any music file from your phone or computer (up to 50MB)
                  </p>
                </div>

                {/* Live Preview Player */}
                {draft.audioTrackUrl && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <audio
                      ref={audioPreviewRef}
                      src={draft.audioTrackUrl}
                      onEnded={() => setIsPreviewPlaying(false)}
                      className="hidden"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={togglePreviewAudio}
                        className="w-7 h-7 rounded-full bg-pink-600 hover:bg-pink-700 text-white flex items-center justify-center transition-transform active:scale-95 cursor-pointer shadow-sm"
                      >
                        {isPreviewPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                      </button>
                      <span className="text-xs font-medium text-slate-700">Test Play Active Song</span>
                    </div>

                    <button
                      type="button"
                      onClick={handleResetAudioToDefault}
                      className="text-[11px] px-2.5 py-1 rounded-full text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer flex items-center gap-1 font-medium"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset to Garden Piano</span>
                    </button>
                  </div>
                )}

                {/* Paste Direct Audio Link */}
                <div className="pt-2 border-t border-slate-100">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Or Enter Direct Audio Link
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={customLinkInput}
                      onChange={(e) => setCustomLinkInput(e.target.value)}
                      placeholder="https://example.com/song.mp3"
                      className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white focus:border-sky-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleApplyAudioLink}
                      disabled={!customLinkInput.trim()}
                      className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-semibold transition-colors cursor-pointer text-xs"
                    >
                      Apply Link
                    </button>
                  </div>
                </div>

                {/* Daylight Ambient Birdsong Layer Settings */}
                <div className="pt-4 border-t border-slate-200 space-y-3">
                  <div className="flex items-center justify-between pb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-600">
                        <Sun className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-slate-800">Daylight Birdsong &amp; Tap Kiss Sound</h4>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 font-semibold">
                            Ambient Audio
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Soft songbirds in daylight &amp; romantic kiss sound when tapping screen for heart bursts
                        </p>
                      </div>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={draft.birdsongEnabled ?? true}
                        onChange={(e) => {
                          const val = e.target.checked;
                          setDraft((prev) => ({ ...prev, birdsongEnabled: val }));
                          birdsongAudio.setEnabled(val);
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                    </label>
                  </div>

                  <div className="space-y-1.5 bg-amber-50/60 p-3 rounded-xl border border-amber-200/70">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-700 font-medium flex items-center gap-1.5">
                        <Volume2 className="w-3.5 h-3.5 text-amber-600" />
                        <span>Ambient &amp; Kiss Volume</span>
                      </span>
                      <span className="font-mono text-amber-800 font-bold">
                        {Math.round((draft.birdsongVolume ?? 0.35) * 100)}%
                      </span>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={draft.birdsongVolume ?? 0.35}
                      disabled={draft.birdsongEnabled === false}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setDraft((prev) => ({ ...prev, birdsongVolume: val }));
                        birdsongAudio.setVolume(val);
                      }}
                      className="w-full accent-amber-500 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer disabled:opacity-40"
                    />

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-slate-500">
                        Birdsong pauses at dusk; kiss sound plays on heart bursts.
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => birdsongAudio.playTestChirp()}
                          className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer active:scale-95"
                        >
                          <Sparkles className="w-3 h-3 text-amber-600" />
                          <span>Test Chirp</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => birdsongAudio.playKissSound()}
                          className="px-2.5 py-1 rounded-lg bg-pink-100 hover:bg-pink-200 text-pink-900 border border-pink-300 text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer active:scale-95"
                        >
                          <Heart className="w-3 h-3 text-pink-500 fill-pink-500/40" />
                          <span>Test Kiss</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: Love Scroll Marquee Wishes */}
          {activeTab === 'lovescroll' && (
            <div className="space-y-4 max-w-2xl mx-auto text-xs">
              <div className="p-4 rounded-2xl bg-white border border-rose-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-rose-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-600">
                      <ScrollText className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-rose-950 font-serif-romantic flex items-center gap-1.5">
                        <span>Love Scroll Wishes Marquee</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-sans font-semibold">
                          Admin Customizable
                        </span>
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Dynamic slow-scrolling romantic marquee displayed across the bottom of the garden.
                      </p>
                    </div>
                  </div>

                  {/* Toggle Enable/Disable */}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={draft.loveScrollEnabled ?? true}
                      onChange={(e) =>
                        setDraft({ ...draft, loveScrollEnabled: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-500 italic">
                    Editing text in <strong className="text-rose-700">{editLang.toUpperCase()}</strong>. Tap languages above to translate.
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const newWish: LoveScrollWish = {
                        id: `wish-${Date.now()}`,
                        text: {
                          my: '',
                          en: '',
                          ko: '',
                          zh: '',
                        },
                      };
                      setDraft({
                        ...draft,
                        loveScrollWishes: [...(draft.loveScrollWishes || []), newWish],
                      });
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-sm transition-transform active:scale-95 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Wish</span>
                  </button>
                </div>

                {/* List of Wishes */}
                <div className="space-y-3 pt-2">
                  {(draft.loveScrollWishes || initialBirthdayConfig.loveScrollWishes || []).map((wish, idx) => (
                    <div
                      key={wish.id || `wish-${idx}`}
                      className="p-3.5 rounded-2xl bg-rose-50/40 border border-rose-200/70 space-y-2 hover:border-rose-300 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-rose-900 text-xs flex items-center gap-1.5">
                          <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500/40" />
                          <span>Wish #{idx + 1}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const list = draft.loveScrollWishes || initialBirthdayConfig.loveScrollWishes || [];
                            if (list.length <= 1) {
                              return;
                            }
                            const updated = list.filter((_, i) => i !== idx);
                            setDraft({ ...draft, loveScrollWishes: updated });
                          }}
                          disabled={(draft.loveScrollWishes || initialBirthdayConfig.loveScrollWishes || []).length <= 1}
                          className="text-slate-400 hover:text-rose-600 disabled:opacity-30 p-1 rounded-lg hover:bg-rose-100 transition-colors cursor-pointer"
                          title="Remove Wish"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div>
                        <textarea
                          rows={2}
                          value={wish.text[editLang] || ''}
                          onChange={(e) => {
                            const list = [...(draft.loveScrollWishes || initialBirthdayConfig.loveScrollWishes || [])];
                            list[idx] = {
                              ...list[idx],
                              text: {
                                ...list[idx].text,
                                [editLang]: e.target.value,
                              },
                            };
                            setDraft({ ...draft, loveScrollWishes: list });
                          }}
                          placeholder={`Enter birthday wish message in ${editLang.toUpperCase()}...`}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-rose-200 focus:border-rose-500 focus:outline-none bg-white text-slate-800"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Reset wishes button */}
                <div className="pt-2 border-t border-rose-100 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Reset all love scroll wishes back to original defaults?')) {
                        setDraft({
                          ...draft,
                          loveScrollWishes: JSON.parse(JSON.stringify(initialBirthdayConfig.loveScrollWishes || [])),
                        });
                      }
                    }}
                    className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset Wishes to Defaults</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between px-6 py-4 border-t border-sky-100 bg-white gap-3">
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-300 text-slate-600 hover:text-rose-600 hover:border-rose-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Defaults</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2 rounded-full bg-gradient-to-r from-sky-500 via-rose-500 to-amber-500 hover:from-sky-600 hover:to-rose-600 text-white text-xs font-bold shadow-lg shadow-sky-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save All Changes'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
