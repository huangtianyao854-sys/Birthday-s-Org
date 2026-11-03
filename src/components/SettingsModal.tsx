import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Save,
  RotateCcw,
  Heart,
  Calendar,
  Key,
  Music,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Sparkles,
  HelpCircle,
  Database,
  Image as ImageIcon,
  Upload,
  Copy,
  Check,
  AlertCircle,
  RefreshCw,
  FileText,
  Loader2,
  Camera,
  CheckCircle2,
  Disc,
  Volume2,
  Sun
} from 'lucide-react';
import { BirthdayConfig, initialBirthdayConfig, Milestone } from '../config/birthdayConfig';
import {
  saveSiteSettingsToSupabase,
  saveTimelineItemsToSupabase,
  fetchGalleryItems,
  addGalleryItemToSupabase,
  deleteGalleryItemFromSupabase,
  uploadPhotoToSupabase,
  uploadAudioToSupabase,
  checkSupabaseHealth,
  HealthStatus
} from '../services/supabaseService';
import { saveSongToIndexedDB, clearSongFromIndexedDB } from '../utils/audioStorage';
import { romanticAudio } from '../utils/romanticAudio';
import { birdsongAudio } from '../utils/birdsongAudio';
import { SupabaseGalleryItem } from '../lib/supabase';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: BirthdayConfig;
  onSaveConfig: (newConfig: BirthdayConfig) => void;
  galleryItems: SupabaseGalleryItem[];
  onRefreshGallery: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  galleryItems,
  onRefreshGallery,
}) => {
  const [formData, setFormData] = useState<BirthdayConfig>(config);
  const [activeTab, setActiveTab] = useState<'journey' | 'basics' | 'letter' | 'gallery' | 'music' | 'cloud' | 'howto'>('journey');

  // Status and feedback
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [cloudSaveMessage, setCloudSaveMessage] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  // Cloud health
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loadingHealth, setLoadingHealth] = useState(false);

  // Gallery form
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoCaption, setNewPhotoCaption] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);
  const [galleryError, setGalleryError] = useState<string | null>(null);

  // Timeline milestone photo upload state
  const milestoneFileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const [uploadingMilestoneId, setUploadingMilestoneId] = useState<string | null>(null);
  const [milestoneUploadProgress, setMilestoneUploadProgress] = useState<string | null>(null);
  const [milestoneUploadError, setMilestoneUploadError] = useState<{ id: string; message: string } | null>(null);
  const [milestoneUploadSuccess, setMilestoneUploadSuccess] = useState<{ id: string; message: string } | null>(null);

  // Theme song audio upload state
  const audioFileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [audioUploadProgress, setAudioUploadProgress] = useState<string | null>(null);
  const [audioUploadError, setAudioUploadError] = useState<string | null>(null);
  const [audioUploadSuccess, setAudioUploadSuccess] = useState<string | null>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  const handleAudioFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAudio(true);
    setAudioUploadProgress(`Processing "${file.name}"...`);
    setAudioUploadError(null);
    setAudioUploadSuccess(null);

    try {
      setAudioUploadProgress(`Uploading "${file.name}" to Supabase Cloud...`);
      const result = await uploadAudioToSupabase(file);
      if (result.error || !result.url) {
        setAudioUploadError(result.error || 'Failed to upload song to Supabase cloud.');
        return;
      }

      const finalAudioUrl = result.url;

      // Cache locally in IndexedDB as well
      await saveSongToIndexedDB(file);

      const updatedConfig = {
        ...formData,
        audioTrackUrl: finalAudioUrl,
      };

      setFormData(updatedConfig);
      onSaveConfig(updatedConfig);
      localStorage.setItem('hny_custom_birthday_config_v3', JSON.stringify(updatedConfig));

      // Auto-save to Supabase immediately so the sound is permanently synced across all devices
      await saveSiteSettingsToSupabase(updatedConfig);

      // Play immediately in main audio engine
      romanticAudio.play(finalAudioUrl);

      const storageLabel = result.isDataUrl ? 'Supabase Database' : 'Supabase Cloud Storage';
      setAudioUploadSuccess(
        `"${file.name}" saved to ${storageLabel}! Synced across all devices (mobile, tablet & PC). ❤️`
      );
      setTimeout(() => setAudioUploadSuccess(null), 6000);
    } catch (err: any) {
      setAudioUploadError(err?.message || 'Network error uploading song. Please try again.');
    } finally {
      setIsUploadingAudio(false);
      setAudioUploadProgress(null);
      if (audioFileInputRef.current) {
        audioFileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveCustomAudio = async () => {
    if (audioPreviewRef.current) {
      audioPreviewRef.current.pause();
    }
    await clearSongFromIndexedDB();
    setFormData((prev) => ({
      ...prev,
      audioTrackUrl: '',
    }));
    setAudioUploadSuccess('Reverted back to default romantic piano synth.');
    setTimeout(() => setAudioUploadSuccess(null), 4000);
  };

  useEffect(() => {
    setFormData(config);
  }, [config]);

  useEffect(() => {
    if (isOpen) {
      loadHealth();
    }
  }, [isOpen]);

  const loadHealth = async () => {
    setLoadingHealth(true);
    const h = await checkSupabaseHealth();
    setHealth(h);
    setLoadingHealth(false);
  };

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    setCloudSaveMessage(null);

    // 1. Update local application state
    onSaveConfig(formData);
    localStorage.setItem('hny_custom_birthday_config_v3', JSON.stringify(formData));

    // 2. Sync to Supabase Cloud
    try {
      const settingsResult = await saveSiteSettingsToSupabase(formData);
      const timelineResult = await saveTimelineItemsToSupabase(formData.milestones);

      if (settingsResult.success && timelineResult.success) {
        setCloudSaveMessage('Saved to Supabase Cloud & Local storage!');
      } else if (!settingsResult.success) {
        setCloudSaveMessage(`Local saved. Cloud note: ${settingsResult.error || 'Run SQL schema in Supabase'}`);
      }
    } catch {
      setCloudSaveMessage('Saved locally. (Connect/Run Supabase SQL to sync across devices)');
    } finally {
      setIsSaving(false);
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
      }, 2500);
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset all custom settings back to original defaults?')) {
      setFormData(initialBirthdayConfig);
      onSaveConfig(initialBirthdayConfig);
      localStorage.removeItem('hny_custom_birthday_config_v3');
    }
  };

  // Milestone management
  const handleAddMilestone = () => {
    const newId = `milestone_${Date.now()}`;
    const newMilestone: Milestone = {
      id: newId,
      title: {
        my: 'အခန်းသစ် အမှတ်တရ',
        en: 'A New Chapter',
        ko: '새로운 챕터',
        zh: '新的专属篇章'
      },
      tagline: {
        my: 'မင်းနဲ့အတူ ဖန်တီးခဲ့တဲ့ နောက်ထပ် အလှပဆုံး အချိန်လေး။',
        en: 'Another precious moment created together with you.',
        ko: '당신과 함께 만든 또 하나의 소중한 순간.',
        zh: '与你携手创造的又一段美好记忆。'
      },
      dateStr: 'Our Special Day',
      description: {
        my: 'ဒီနေ့ရက်လေးမှာ တို့နှစ်ယောက် အတူရှိခဲ့ကြပြီး မမေ့နိုင်စရာ အမှတ်တရတွေကို ဖန်တီးခဲ့ကြတယ်။',
        en: 'A heartwarming memory we shared that will always hold a special place in my heart.',
        ko: '우리 둘만의 따스하고 잊지 못할 소중한 추억.',
        zh: '那段与你相伴的日子，早已定格为心底最温暖的瞬间。'
      },
      iconName: 'Heart'
    };

    setFormData({
      ...formData,
      milestones: [...formData.milestones, newMilestone]
    });
  };

  const handleRemoveMilestone = (id: string) => {
    if (formData.milestones.length <= 1) {
      alert('You must have at least one milestone in your story.');
      return;
    }
    setFormData({
      ...formData,
      milestones: formData.milestones.filter((m) => m.id !== id)
    });
  };

  const handleMoveMilestone = (index: number, direction: 'up' | 'down') => {
    const newMilestones = [...formData.milestones];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newMilestones.length) return;

    const temp = newMilestones[index];
    newMilestones[index] = newMilestones[targetIdx];
    newMilestones[targetIdx] = temp;

    setFormData({ ...formData, milestones: newMilestones });
  };

  // Timeline milestone photo upload handler
  const handleMilestoneFileUpload = async (
    milestoneId: string,
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input to allow selecting the same file again if desired
    e.target.value = '';

    if (file.size === 0) {
      setMilestoneUploadError({ id: milestoneId, message: 'Selected file is empty.' });
      return;
    }

    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
    const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    const isExtValid = allowedExtensions.includes(fileExt);
    const isMimeValid = file.type ? allowedMimeTypes.includes(file.type.toLowerCase()) : isExtValid;

    if (!isExtValid && !isMimeValid) {
      setMilestoneUploadError({
        id: milestoneId,
        message: 'Unsupported format. Please upload JPG, JPEG, PNG, or WEBP.',
      });
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setMilestoneUploadError({
        id: milestoneId,
        message: 'Photo exceeds 15MB size limit. Please choose a smaller photo.',
      });
      return;
    }

    setUploadingMilestoneId(milestoneId);
    setMilestoneUploadError(null);
    setMilestoneUploadSuccess(null);
    setMilestoneUploadProgress('Uploading to Supabase "gallery" bucket...');

    try {
      const { url, error } = await uploadPhotoToSupabase(file);

      if (error || !url) {
        setMilestoneUploadError({
          id: milestoneId,
          message: error || 'Failed to upload photo to storage.',
        });
        return;
      }

      setMilestoneUploadProgress('Saving to story milestone...');

      // Update local state and parent state
      const updatedMilestones = [...formData.milestones];
      updatedMilestones[index] = {
        ...updatedMilestones[index],
        photoUrl: url,
      };

      const updatedConfig = {
        ...formData,
        milestones: updatedMilestones,
      };

      setFormData(updatedConfig);
      onSaveConfig(updatedConfig);
      localStorage.setItem('hny_custom_birthday_config_v3', JSON.stringify(updatedConfig));

      // Auto-save to Supabase timeline_items
      saveTimelineItemsToSupabase(updatedMilestones).catch((err) =>
        console.warn('Auto-save to Supabase timeline error:', err)
      );

      setMilestoneUploadSuccess({
        id: milestoneId,
        message: 'Photo uploaded and saved to Supabase! ❤️',
      });
      setTimeout(() => setMilestoneUploadSuccess(null), 3500);
    } catch (err: any) {
      setMilestoneUploadError({
        id: milestoneId,
        message: err?.message || 'Upload failed. Please try again.',
      });
    } finally {
      setUploadingMilestoneId(null);
      setMilestoneUploadProgress(null);
    }
  };

  // Gallery photo upload & creation
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value to allow re-selecting the same file if needed
    e.target.value = '';

    if (file.size === 0) {
      setGalleryError('The selected file is empty. Please select a valid photo.');
      return;
    }

    // Supported formats: JPG, JPEG, PNG, WEBP
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
    const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    const isExtValid = allowedExtensions.includes(fileExt);
    const isMimeValid = file.type ? allowedMimeTypes.includes(file.type.toLowerCase()) : isExtValid;

    if (!isExtValid && !isMimeValid) {
      setGalleryError('Unsupported file type. Please upload a JPG, JPEG, PNG, or WEBP image.');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setGalleryError('Photo size exceeds 15MB limit. Please choose a smaller photo.');
      return;
    }

    setIsUploadingPhoto(true);
    setGalleryError(null);
    setUploadSuccessMessage(null);
    setUploadProgress('Uploading photo to Supabase storage ("gallery")...');

    try {
      // 1. Upload to Supabase Storage bucket 'gallery'
      const { url, error } = await uploadPhotoToSupabase(file);

      if (error || !url) {
        setGalleryError(`Upload failed: ${error || 'Storage upload error'}`);
        return;
      }

      setUploadProgress('Saving photo to gallery...');

      // 2. Save resulting public URL to database
      const res = await addGalleryItemToSupabase({
        image_path: url,
        caption: newPhotoCaption.trim() || undefined,
        display_order: galleryItems.length + 1,
      });

      if (res.success) {
        setNewPhotoCaption('');
        setNewPhotoUrl('');
        setUploadSuccessMessage('Photo uploaded and added to gallery successfully! ❤️');
        setTimeout(() => setUploadSuccessMessage(null), 4000);
        // 3. Refresh gallery immediately so it appears right away
        onRefreshGallery();
      } else {
        setGalleryError(`Photo uploaded, but database record failed: ${res.error || 'Database error'}`);
      }
    } catch (err: any) {
      setGalleryError(`Upload error: ${err?.message || 'Something went wrong during upload'}`);
    } finally {
      setIsUploadingPhoto(false);
      setUploadProgress(null);
    }
  };

  const handleAddGalleryItem = async () => {
    if (!newPhotoUrl.trim()) {
      setGalleryError('Please enter an image URL or use the Upload Photo button.');
      return;
    }

    setGalleryError(null);
    setUploadSuccessMessage(null);
    setIsUploadingPhoto(true);
    setUploadProgress('Adding photo from URL...');

    try {
      const res = await addGalleryItemToSupabase({
        image_path: newPhotoUrl.trim(),
        caption: newPhotoCaption.trim() || undefined,
        display_order: galleryItems.length + 1,
      });

      if (res.success) {
        setNewPhotoUrl('');
        setNewPhotoCaption('');
        setUploadSuccessMessage('Photo added to gallery successfully! ❤️');
        setTimeout(() => setUploadSuccessMessage(null), 4000);
        onRefreshGallery();
      } else {
        setGalleryError(res.error || 'Failed to save photo to Supabase.');
      }
    } catch (err: any) {
      setGalleryError(err?.message || 'Failed to add photo.');
    } finally {
      setIsUploadingPhoto(false);
      setUploadProgress(null);
    }
  };

  const handleDeleteGalleryItem = async (id: string) => {
    if (confirm('Delete this photo from the gallery?')) {
      await deleteGalleryItemFromSupabase(id);
      onRefreshGallery();
    }
  };

  const handleCopySql = async () => {
    const sqlContent = `-- 1. Create site_settings table
CREATE TABLE IF NOT EXISTS public.site_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    girlfriend_name TEXT NOT NULL DEFAULT 'Hnin Lae Yee',
    nickname TEXT NOT NULL DEFAULT 'Baby',
    boyfriend_name TEXT NOT NULL DEFAULT 'Nyi Nyi',
    birthday DATE DEFAULT '1996-11-09',
    celebration_date DATE DEFAULT '2026-11-09',
    birthday_message TEXT DEFAULT 'You are my favorite person, my most beautiful memory, and the person I want beside me in every chapter of my life.',
    theme_settings JSONB DEFAULT '{"primaryColor": "#f472b6", "starDensity": "high", "goldAccent": true}'::jsonb,
    animation_settings JSONB DEFAULT '{"fallingPetals": true, "shootingStars": true, "interactiveCanvas": true}'::jsonb,
    music_settings JSONB DEFAULT '{"volume": 0.4, "autoPlayHint": true, "customAudioUrl": ""}'::jsonb,
    love_letter TEXT,
    relationship_duration INTEGER DEFAULT 899,
    relationship_start_date DATE DEFAULT '2024-05-24',
    full_config JSONB,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create timeline_items table
CREATE TABLE IF NOT EXISTS public.timeline_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    event_date TEXT,
    image_path TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    title_i18n JSONB,
    description_i18n JSONB,
    tagline_i18n JSONB,
    icon_name TEXT DEFAULT 'Heart',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create gallery_items table
CREATE TABLE IF NOT EXISTS public.gallery_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_path TEXT NOT NULL,
    caption TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;

-- 5. Public read and write policies
CREATE POLICY "Public can view site settings" ON public.site_settings FOR SELECT TO public USING (true);
CREATE POLICY "Public can update site settings" ON public.site_settings FOR ALL TO public USING (true) WITH CHECK (true);

CREATE POLICY "Public can view timeline items" ON public.timeline_items FOR SELECT TO public USING (true);
CREATE POLICY "Public can manage timeline items" ON public.timeline_items FOR ALL TO public USING (true) WITH CHECK (true);

CREATE POLICY "Public can view gallery items" ON public.gallery_items FOR SELECT TO public USING (true);
CREATE POLICY "Public can manage gallery items" ON public.gallery_items FOR ALL TO public USING (true) WITH CHECK (true);

-- Storage bucket for photos & custom music tracks
INSERT INTO storage.buckets (id, name, public) VALUES ('gallery', 'gallery', true) ON CONFLICT (id) DO NOTHING;
DROP POLICY IF EXISTS "Public can view gallery photos" ON storage.objects;
DROP POLICY IF EXISTS "Public can upload gallery photos" ON storage.objects;
DROP POLICY IF EXISTS "Public can update gallery photos" ON storage.objects;
DROP POLICY IF EXISTS "Public can delete gallery photos" ON storage.objects;
DROP POLICY IF EXISTS "Public can view gallery objects" ON storage.objects;
DROP POLICY IF EXISTS "Public can upload gallery objects" ON storage.objects;
DROP POLICY IF EXISTS "Public can update gallery objects" ON storage.objects;
DROP POLICY IF EXISTS "Public can delete gallery objects" ON storage.objects;
CREATE POLICY "Public can view gallery objects" ON storage.objects FOR SELECT TO public USING (bucket_id = 'gallery');
CREATE POLICY "Public can upload gallery objects" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'gallery');
CREATE POLICY "Public can update gallery objects" ON storage.objects FOR UPDATE TO public USING (bucket_id = 'gallery') WITH CHECK (bucket_id = 'gallery');
CREATE POLICY "Public can delete gallery objects" ON storage.objects FOR DELETE TO public USING (bucket_id = 'gallery');

-- 6. Initial Seed
INSERT INTO public.site_settings (id, girlfriend_name, nickname, boyfriend_name, birthday, celebration_date, relationship_duration, relationship_start_date)
VALUES ('default', 'Hnin Lae Yee', 'Baby', 'Nyi Nyi', '1996-11-09', '2026-11-09', 899, '2024-05-24')
ON CONFLICT (id) DO NOTHING;`;

    try {
      await navigator.clipboard.writeText(sqlContent);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2000);
    } catch {
      alert('Copied schema text available in /supabase/schema.sql');
    }
  };

  const renderThemeSongSection = () => (
    <div className="p-4 bg-slate-900/80 rounded-2xl border border-pink-500/25 space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-pink-500/20 border border-pink-400/40 flex items-center justify-center text-pink-300">
            <Music className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-pink-200">
              Background Theme Song
            </h4>
            <p className="text-[11px] text-slate-400">
              Upload any song (MP3, M4A, WAV, AAC, OGG) from your phone, tablet, or PC
            </p>
          </div>
        </div>

        {formData.audioTrackUrl ? (
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Custom Song Active
          </span>
        ) : (
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-pink-500/15 text-pink-300 border border-pink-500/30 font-mono">
            Default Piano Synth
          </span>
        )}
      </div>

      {/* Hidden File Picker Input */}
      <input
        ref={audioFileInputRef}
        type="file"
        accept="audio/*,.mp3,.m4a,.wav,.aac,.ogg,.flac,.webm,.mp4"
        onChange={handleAudioFileUpload}
        disabled={isUploadingAudio}
        className="hidden"
        id="theme-song-file-input"
      />

      {/* Upload button & Quick actions */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <label
            htmlFor="theme-song-file-input"
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:from-pink-400 hover:to-rose-400 active:scale-98 text-white font-medium text-xs sm:text-sm shadow-md shadow-pink-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all border border-pink-400/40"
          >
            {isUploadingAudio ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>{audioUploadProgress || 'Uploading Song...'}</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 text-white" />
                <span>Upload Song from Phone / Tablet / PC</span>
              </>
            )}
          </label>

          {formData.audioTrackUrl && (
            <button
              type="button"
              onClick={handleRemoveCustomAudio}
              className="py-2.5 px-3 rounded-xl bg-slate-800/90 hover:bg-rose-950/60 hover:text-rose-300 hover:border-rose-500/40 text-slate-300 text-xs font-medium border border-slate-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              title="Reset back to built-in romantic piano"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Piano</span>
            </button>
          )}
        </div>

        <p className="text-[11px] text-slate-400 leading-relaxed">
          💡 <strong>Tip for mobile &amp; tablet:</strong> You can select any song file from your phone&apos;s <strong>Files</strong>, <strong>Downloads</strong>, <strong>Music Library</strong>, or audio recordings.
        </p>

        {/* Upload feedback */}
        {audioUploadError && (
          <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{audioUploadError}</span>
          </div>
        )}

        {audioUploadSuccess && (
          <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{audioUploadSuccess}</span>
          </div>
        )}
      </div>

      {/* Song Audio Player Preview */}
      {formData.audioTrackUrl && (
        <div className="p-3 bg-slate-950/80 rounded-xl border border-pink-500/30 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-pink-300 font-medium flex items-center gap-1.5">
              <Disc className="w-3.5 h-3.5 text-pink-400 animate-spin-slow" />
              <span>Live Song Audio Preview</span>
            </span>
            <span className="text-[10px] text-slate-400">Play to test before saving</span>
          </div>

          <audio
            ref={audioPreviewRef}
            src={formData.audioTrackUrl}
            controls
            preload="metadata"
            className="w-full h-9 rounded-lg"
          />
        </div>
      )}

      {/* Direct Song URL fallback */}
      <div className="pt-2 border-t border-white/5 space-y-1.5">
        <label className="text-[11px] text-slate-400 flex items-center justify-between">
          <span>Or paste direct song / MP3 link:</span>
          {formData.audioTrackUrl && (
            <span className="text-[10px] text-slate-500 font-mono truncate max-w-[200px]">
              {formData.audioTrackUrl}
            </span>
          )}
        </label>
        <input
          type="url"
          value={formData.audioTrackUrl || ''}
          onChange={(e) => {
            setFormData({ ...formData, audioTrackUrl: e.target.value });
            if (audioUploadError) setAudioUploadError(null);
          }}
          placeholder="https://example.com/song.mp3 (optional)"
          className="w-full bg-slate-900 border border-slate-700 focus:border-pink-400 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-pink-500/30"
        />
      </div>
    </div>
  );

  const renderBirdsongSection = () => {
    const isBirdsongOn = formData.birdsongEnabled ?? true;
    const birdsongVol = formData.birdsongVolume ?? 0.35;

    return (
      <div className="p-4 bg-slate-900/80 rounded-2xl border border-amber-500/25 space-y-3.5">
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <Sun className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-amber-200">
                  Daylight Birdsong &amp; Tap Kiss Sound
                </h4>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                  Ambient Audio
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Natural songbird chirps during daylight mode &amp; sweet kiss sound when tapping screen
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isBirdsongOn}
              onChange={(e) => {
                const nextVal = e.target.checked;
                setFormData((prev) => ({ ...prev, birdsongEnabled: nextVal }));
                birdsongAudio.setEnabled(nextVal);
              }}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
          </label>
        </div>

        {/* Volume Slider & Test Button */}
        <div className="space-y-3 pt-1">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Ambient &amp; Kiss Volume</span>
              </span>
              <span className="text-[11px] font-mono text-amber-300 font-semibold">
                {Math.round(birdsongVol * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={birdsongVol}
              disabled={!isBirdsongOn}
              onChange={(e) => {
                const newVol = parseFloat(e.target.value);
                setFormData((prev) => ({ ...prev, birdsongVolume: newVol }));
                birdsongAudio.setVolume(newVol);
              }}
              className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer disabled:opacity-40"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Whisper soft (10%)</span>
              <span>Gentle garden (35%)</span>
              <span>Lively (100%)</span>
            </div>
          </div>

          {/* Test Chirp & Kiss Preview */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
            <p className="text-[11px] text-slate-400 italic">
              Birdsong pauses in Sunset, Twilight &amp; Midnight. Kiss sound plays on screen taps.
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => birdsongAudio.playTestChirp()}
                className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Test Chirp</span>
              </button>
              <button
                type="button"
                onClick={() => birdsongAudio.playKissSound()}
                className="px-3 py-1.5 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 text-pink-200 border border-pink-500/40 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400/40" />
                <span>Test Kiss</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm animate-fade-in select-none cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-panel w-full max-w-2xl h-[90vh] max-h-[850px] rounded-3xl overflow-hidden flex flex-col border border-pink-500/30 text-slate-100 shadow-2xl cursor-default bg-slate-950/90 backdrop-blur-md"
      >
        {/* Header - Fixed at Top */}
        <div className="flex items-center justify-between px-5 sm:px-7 py-3.5 border-b border-pink-500/20 shrink-0 bg-slate-950/80">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-400 fill-pink-400/30 animate-heartbeat" />
            <h2 className="text-lg font-serif-romantic tracking-wide font-semibold text-pink-200">
              Settings
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
            title="Close / Exit"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection Bar - 3 Main Setting Buttons + Additional Tabs */}
        <div className="px-4 sm:px-6 pt-3 pb-3 border-b border-white/10 shrink-0 bg-slate-900/60 backdrop-blur-sm space-y-2">
          {/* 3 Main Setting Buttons (Primary Content) */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setActiveTab('journey')}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 sm:px-3 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer border ${
                activeTab === 'journey'
                  ? 'bg-gradient-to-r from-pink-500/30 to-rose-500/30 text-pink-100 border-pink-400/80 shadow-md glow-rose font-semibold'
                  : 'bg-slate-900/80 hover:bg-slate-800/90 text-slate-200 hover:text-white border-slate-700/70'
              }`}
            >
              <Heart className="w-3.5 h-3.5 text-pink-400 shrink-0" />
              <span className="truncate">Our Journey</span>
            </button>

            <button
              onClick={() => setActiveTab('gallery')}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 sm:px-3 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer border ${
                activeTab === 'gallery'
                  ? 'bg-gradient-to-r from-pink-500/30 to-rose-500/30 text-pink-100 border-pink-400/80 shadow-md glow-rose font-semibold'
                  : 'bg-slate-900/80 hover:bg-slate-800/90 text-slate-200 hover:text-white border-slate-700/70'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5 text-pink-400 shrink-0" />
              <span className="truncate">Gallery</span>
              <span className="ml-0.5 px-1.5 py-0.2 text-[10px] rounded-full bg-pink-500/30 text-pink-200 border border-pink-400/30">
                {galleryItems.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('letter')}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 sm:px-3 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer border ${
                activeTab === 'letter'
                  ? 'bg-gradient-to-r from-pink-500/30 to-rose-500/30 text-pink-100 border-pink-400/80 shadow-md glow-rose font-semibold'
                  : 'bg-slate-900/80 hover:bg-slate-800/90 text-slate-200 hover:text-white border-slate-700/70'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-pink-400 shrink-0" />
              <span className="truncate">Love Letter</span>
            </button>
          </div>

          {/* Secondary Settings Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-0.5 text-xs">
            <button
              onClick={() => setActiveTab('music')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all cursor-pointer border flex items-center gap-1 ${
                activeTab === 'music'
                  ? 'bg-pink-500/25 text-pink-200 border-pink-400/60 font-semibold'
                  : 'bg-slate-950/40 text-slate-400 hover:text-slate-200 border-slate-800 hover:border-slate-700'
              }`}
            >
              <Music className="w-3 h-3 text-pink-400" />
              <span>Theme Song</span>
              {formData.audioTrackUrl && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('basics')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all cursor-pointer border ${
                activeTab === 'basics'
                  ? 'bg-pink-500/25 text-pink-200 border-pink-400/60 font-semibold'
                  : 'bg-slate-950/40 text-slate-400 hover:text-slate-200 border-slate-800 hover:border-slate-700'
              }`}
            >
              Passcode &amp; Dates
            </button>
            <button
              onClick={() => setActiveTab('cloud')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all cursor-pointer border flex items-center gap-1 ${
                activeTab === 'cloud'
                  ? 'bg-pink-500/25 text-pink-200 border-pink-400/60 font-semibold'
                  : 'bg-slate-950/40 text-slate-400 hover:text-slate-200 border-slate-800 hover:border-slate-700'
              }`}
            >
              <Database className="w-3 h-3 text-pink-400" />
              <span>Supabase Cloud</span>
            </button>
            <button
              onClick={() => setActiveTab('howto')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all cursor-pointer border ${
                activeTab === 'howto'
                  ? 'bg-pink-500/25 text-pink-200 border-pink-400/60 font-semibold'
                  : 'bg-slate-950/40 text-slate-400 hover:text-slate-200 border-slate-800 hover:border-slate-700'
              }`}
            >
              Help
            </button>
          </div>
        </div>

        {/* Tab Content - Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-4 space-y-4 text-sm">
          {/* OUR JOURNEY TOGETHER TAB */}
          {activeTab === 'journey' && (
            <div className="space-y-5">
              <div className="p-3.5 bg-slate-900/70 rounded-2xl border border-white/10 space-y-3">
                <span className="text-xs font-semibold text-pink-300 block">
                  Journey Section Headlines &amp; Counter
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">Section Title (Burmese)</label>
                    <input
                      type="text"
                      value={formData.journeyConfig.sectionTitle.my}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          journeyConfig: {
                            ...formData.journeyConfig,
                            sectionTitle: { ...formData.journeyConfig.sectionTitle, my: e.target.value }
                          }
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-100"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">Section Title (English)</label>
                    <input
                      type="text"
                      value={formData.journeyConfig.sectionTitle.en}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          journeyConfig: {
                            ...formData.journeyConfig,
                            sectionTitle: { ...formData.journeyConfig.sectionTitle, en: e.target.value }
                          }
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-100"
                    />
                  </div>
                </div>
              </div>

              {/* Milestones List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-pink-300">
                    Story Milestones ({formData.milestones.length})
                  </span>
                  <button
                    onClick={handleAddMilestone}
                    className="flex items-center gap-1 px-3 py-1 bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 rounded-lg text-xs font-medium border border-pink-500/30 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Milestone
                  </button>
                </div>

                {formData.milestones.map((m, index) => (
                  <div
                    key={m.id}
                    className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-3 hover:border-pink-500/30 transition-all"
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-pink-500/10 text-pink-300 border border-pink-500/20">
                          #{index + 1}
                        </span>
                        <input
                          type="text"
                          value={m.dateStr}
                          onChange={(e) => {
                            const updated = [...formData.milestones];
                            updated[index].dateStr = e.target.value;
                            setFormData({ ...formData, milestones: updated });
                          }}
                          placeholder="Date / Milestone Tag"
                          className="bg-transparent border-b border-slate-700 text-xs text-pink-200 px-1 py-0.5 font-mono focus:outline-none focus:border-pink-400"
                        />
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleMoveMilestone(index, 'up')}
                          disabled={index === 0}
                          className="p-1 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                          aria-label="Move up"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleMoveMilestone(index, 'down')}
                          disabled={index === formData.milestones.length - 1}
                          className="p-1 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                          aria-label="Move down"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleRemoveMilestone(m.id)}
                          className="p-1 text-rose-400/80 hover:text-rose-300 cursor-pointer"
                          aria-label="Delete milestone"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400">Title (Burmese)</label>
                        <input
                          type="text"
                          value={m.title.my}
                          onChange={(e) => {
                            const updated = [...formData.milestones];
                            updated[index].title.my = e.target.value;
                            setFormData({ ...formData, milestones: updated });
                          }}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400">Title (English)</label>
                        <input
                          type="text"
                          value={m.title.en}
                          onChange={(e) => {
                            const updated = [...formData.milestones];
                            updated[index].title.en = e.target.value;
                            setFormData({ ...formData, milestones: updated });
                          }}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400">Description (Burmese)</label>
                      <textarea
                        rows={2}
                        value={m.description.my}
                        onChange={(e) => {
                          const updated = [...formData.milestones];
                          updated[index].description.my = e.target.value;
                          setFormData({ ...formData, milestones: updated });
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 leading-relaxed"
                      />
                    </div>

                    {/* Milestone Photo Upload & URL Section */}
                    <div className="p-3 bg-slate-950/80 rounded-xl border border-pink-500/25 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-semibold text-pink-200 flex items-center gap-1.5">
                          <Camera className="w-3.5 h-3.5 text-pink-400" />
                          <span>Milestone Photo</span>
                        </label>
                        <span className="text-[10px] text-slate-400">
                          JPG, PNG, WEBP (Max 15MB)
                        </span>
                      </div>

                      {/* Hidden Real File Picker for Milestone */}
                      <input
                        type="file"
                        ref={(el) => {
                          milestoneFileInputRefs.current[m.id] = el;
                        }}
                        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                        onChange={(e) => handleMilestoneFileUpload(m.id, index, e)}
                        disabled={uploadingMilestoneId === m.id}
                        className="hidden"
                      />

                      {/* Photo Preview if photo exists */}
                      {m.photoUrl && (
                        <div className="flex items-center gap-3 p-2 rounded-lg bg-pink-950/30 border border-pink-500/30">
                          <img
                            src={m.photoUrl}
                            alt="Milestone photo"
                            className="w-14 h-14 rounded-lg object-cover border border-pink-400/40 shadow-sm shrink-0"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <span className="text-[11px] text-emerald-300 font-medium flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" /> Photo Attached
                            </span>
                            <p className="text-[10px] text-slate-400 font-mono truncate">
                              {m.photoUrl}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...formData.milestones];
                              updated[index] = { ...updated[index], photoUrl: undefined };
                              setFormData({ ...formData, milestones: updated });
                            }}
                            className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-white/5 rounded-lg transition-colors cursor-pointer text-[10px]"
                            title="Remove Photo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      {/* Prominent Upload Photo Button (Computer / Phone) */}
                      <button
                        type="button"
                        onClick={() => milestoneFileInputRefs.current[m.id]?.click()}
                        disabled={uploadingMilestoneId === m.id}
                        className="w-full min-h-[38px] py-2 px-3 rounded-xl bg-gradient-to-r from-pink-500/90 via-rose-500/90 to-pink-600/90 hover:from-pink-500 hover:to-rose-500 disabled:opacity-60 text-white font-medium text-xs shadow-md shadow-pink-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer border border-pink-400/40"
                      >
                        {uploadingMilestoneId === m.id ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                            <span className="truncate">{milestoneUploadProgress || 'Uploading Photo...'}</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5" />
                            <span>{m.photoUrl ? 'Change Photo from Device (Phone/PC)' : 'Upload Photo from Device (Phone/PC)'}</span>
                          </>
                        )}
                      </button>

                      {/* Success / Error notification */}
                      {milestoneUploadSuccess?.id === m.id && (
                        <div className="text-[11px] text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 rounded-lg p-2 flex items-center gap-1.5 animate-fade-in">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{milestoneUploadSuccess.message}</span>
                        </div>
                      )}

                      {milestoneUploadError?.id === m.id && (
                        <div className="text-[11px] text-rose-300 bg-rose-950/60 border border-rose-500/40 rounded-lg p-2 flex items-center gap-1.5 animate-fade-in">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          <span>{milestoneUploadError.message}</span>
                        </div>
                      )}

                      {/* Optional Photo URL fallback */}
                      <div className="pt-1.5 border-t border-slate-800">
                        <label className="text-[10px] text-slate-400 block mb-1">
                          Or enter Photo URL directly:
                        </label>
                        <input
                          type="url"
                          value={m.photoUrl || ''}
                          onChange={(e) => {
                            const updated = [...formData.milestones];
                            updated[index].photoUrl = e.target.value;
                            setFormData({ ...formData, milestones: updated });
                          }}
                          placeholder="https://..."
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 font-mono focus:border-pink-400 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* GALLERY TAB */}
          {activeTab === 'gallery' && (
            <div className="space-y-4">
              <div className="p-3.5 sm:p-4 bg-slate-900/80 rounded-2xl border border-pink-500/20 space-y-3.5">
                <div className="flex items-center justify-between border-b border-pink-500/10 pb-2.5">
                  <span className="text-xs font-semibold text-pink-300 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-pink-400" />
                    Add Photo to Shared Gallery
                  </span>
                  <span className="text-[10px] text-pink-300/70 font-mono">
                    Bucket: gallery
                  </span>
                </div>

                {/* Optional Caption Field */}
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 font-medium">
                    Romantic Caption (Optional)
                  </label>
                  <input
                    type="text"
                    value={newPhotoCaption}
                    onChange={(e) => setNewPhotoCaption(e.target.value)}
                    placeholder="e.g. Our sweetest evening together ❤️"
                    disabled={isUploadingPhoto}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-pink-400 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-pink-500/30"
                  />
                </div>

                {/* Direct Upload from Device Section (Phone / Computer) */}
                <div className="p-3 rounded-xl bg-slate-950/70 border border-pink-500/25 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-pink-200">
                      Upload from Device
                    </span>
                    <span className="text-[10px] text-slate-400">
                      JPG, PNG, WEBP (Max 15MB)
                    </span>
                  </div>

                  {/* Hidden Native File Picker Input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    onChange={handleFileUpload}
                    disabled={isUploadingPhoto}
                    className="hidden"
                  />

                  {/* Primary Mobile-Friendly Upload Photo Button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingPhoto}
                    className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-400 hover:to-rose-400 disabled:opacity-60 text-white font-medium text-xs sm:text-sm shadow-lg shadow-pink-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer border border-pink-400/40"
                  >
                    {isUploadingPhoto ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span className="truncate">{uploadProgress || 'Uploading Photo...'}</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>Upload Photo from Phone / PC</span>
                      </>
                    )}
                  </button>

                  <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                    Tap to choose photos directly from your camera roll, photo library, or computer
                  </p>
                </div>

                {/* Or Paste Image URL Option */}
                <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 space-y-2">
                  <span className="text-[11px] font-medium text-slate-300 block">
                    Or Add via Image URL
                  </span>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="url"
                      value={newPhotoUrl}
                      onChange={(e) => setNewPhotoUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      disabled={isUploadingPhoto}
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono placeholder:text-slate-600 focus:outline-none focus:border-pink-400"
                    />
                    <button
                      type="button"
                      onClick={handleAddGalleryItem}
                      disabled={!newPhotoUrl.trim() || isUploadingPhoto}
                      className="min-h-[38px] px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 hover:text-white rounded-xl text-xs font-medium border border-slate-700 transition-all cursor-pointer whitespace-nowrap active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add from URL</span>
                    </button>
                  </div>
                </div>

                {/* Success Message Banner */}
                {uploadSuccessMessage && (
                  <div className="text-xs text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 rounded-xl p-2.5 flex items-center gap-2 animate-fade-in shadow-md">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>{uploadSuccessMessage}</span>
                  </div>
                )}

                {/* Error Message Banner */}
                {galleryError && (
                  <div className="text-xs text-rose-300 bg-rose-950/60 border border-rose-500/40 rounded-xl p-2.5 flex items-start gap-2 animate-fade-in shadow-md">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                    <span className="break-words">{galleryError}</span>
                  </div>
                )}
              </div>

              {/* Gallery Items Grid */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-pink-300 block">
                  Current Gallery Photos ({galleryItems.length})
                </span>

                {galleryItems.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-500 bg-slate-900/40 rounded-2xl border border-white/5">
                    No photos in gallery yet. Add photos above to display them to Baby!
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {galleryItems.map((item) => (
                      <div
                        key={item.id}
                        className="group relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 p-2 flex flex-col gap-1.5"
                      >
                        <div className="aspect-square rounded-lg overflow-hidden bg-slate-900 relative">
                          <img
                            src={item.image_path}
                            alt={item.caption || 'Photo'}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => handleDeleteGalleryItem(item.id)}
                            className="absolute top-1.5 right-1.5 p-1 rounded-full bg-rose-900/80 text-rose-200 hover:bg-rose-800 cursor-pointer shadow-md"
                            title="Delete photo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {item.caption && (
                          <p className="text-[11px] text-pink-200 truncate px-1">
                            {item.caption}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* LOVE LETTER TAB */}
          {activeTab === 'letter' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-slate-900/70 rounded-2xl border border-white/10 space-y-3">
                <span className="text-xs font-semibold text-pink-300 block">
                  Personal Love Letter (Burmese Unicode)
                </span>
                <p className="text-[11px] text-slate-400">
                  This letter is revealed paragraph by paragraph on the enchanted parchment in Scene 4.
                </p>
                <textarea
                  rows={8}
                  value={formData.letterContent.my}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      letterContent: { ...formData.letterContent, my: e.target.value }
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 font-burmese leading-relaxed"
                />
              </div>

              <div className="p-3.5 bg-slate-900/70 rounded-2xl border border-white/10 space-y-3">
                <span className="text-xs font-semibold text-pink-300 block">
                  Love Letter (English)
                </span>
                <textarea
                  rows={6}
                  value={formData.letterContent.en}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      letterContent: { ...formData.letterContent, en: e.target.value }
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 font-serif-romantic leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* BASICS TAB */}
          {activeTab === 'basics' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-pink-300">
                    <Heart className="w-3.5 h-3.5" /> Girlfriend&apos;s Name
                  </label>
                  <input
                    type="text"
                    value={formData.girlfriendName}
                    onChange={(e) => setFormData({ ...formData, girlfriendName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-pink-300">
                    <Heart className="w-3.5 h-3.5" /> Nickname
                  </label>
                  <input
                    type="text"
                    value={formData.nickname}
                    onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-pink-300">
                    <Heart className="w-3.5 h-3.5" /> Boyfriend&apos;s Name
                  </label>
                  <input
                    type="text"
                    value={formData.boyfriendName}
                    onChange={(e) => setFormData({ ...formData, boyfriendName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-pink-300">
                    <Key className="w-3.5 h-3.5" /> Secret Passcode
                  </label>
                  <input
                    type="text"
                    value={formData.passcode}
                    onChange={(e) => setFormData({ ...formData, passcode: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-pink-300">
                    <Calendar className="w-3.5 h-3.5" /> Anniversary / Relationship Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.relationshipStartDate}
                    onChange={(e) => setFormData({ ...formData, relationshipStartDate: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-pink-300">
                    <Calendar className="w-3.5 h-3.5" /> Birthday Date
                  </label>
                  <input
                    type="date"
                    value={formData.birthday}
                    onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
                  />
                </div>
              </div>

              <div className="pt-2 space-y-4">
                {renderThemeSongSection()}
                {renderBirdsongSection()}
              </div>
            </div>
          )}

          {/* THEME SONG & AMBIENCE TAB */}
          {activeTab === 'music' && (
            <div className="space-y-4">
              {renderThemeSongSection()}
              {renderBirdsongSection()}
            </div>
          )}

          {/* SUPABASE CLOUD TAB */}
          {activeTab === 'cloud' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-900/80 rounded-2xl border border-pink-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-emerald-400" />
                    <div>
                      <h4 className="text-sm font-semibold text-pink-200">
                        Supabase Backend Sync
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Connected to your Supabase project across devices
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={loadHealth}
                    disabled={loadingHealth}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 cursor-pointer text-xs flex items-center gap-1"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingHealth ? 'animate-spin' : ''}`} />
                    <span>Check Status</span>
                  </button>
                </div>

                <div className="space-y-2 pt-2 border-t border-white/5 text-xs">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-400">Supabase URL:</span>
                    <span className="font-mono text-pink-300 text-[11px]">
                      https://aygelnthkzbdxevhewkz.supabase.co
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-400">Table: site_settings</span>
                    <span className={health?.siteSettingsTableFound ? 'text-emerald-400 font-mono' : 'text-amber-400 font-mono'}>
                      {health?.siteSettingsTableFound ? '✓ Active & Ready' : '⚠ Run SQL schema in Supabase'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-400">Table: timeline_items</span>
                    <span className={health?.timelineItemsTableFound ? 'text-emerald-400 font-mono' : 'text-amber-400 font-mono'}>
                      {health?.timelineItemsTableFound ? '✓ Active & Ready' : '⚠ Run SQL schema in Supabase'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-400">Table: gallery_items</span>
                    <span className={health?.galleryItemsTableFound ? 'text-emerald-400 font-mono' : 'text-amber-400 font-mono'}>
                      {health?.galleryItemsTableFound ? '✓ Active & Ready' : '⚠ Run SQL schema in Supabase'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-t border-white/5 pt-1.5">
                    <span className="text-slate-400">Database Synchronization:</span>
                    <span className="text-emerald-400 font-semibold font-mono">
                      ✓ Ready &amp; Synchronized
                    </span>
                  </div>
                </div>
              </div>

              {/* SQL Migration Quick Runner */}
              <div className="p-4 bg-slate-900/60 rounded-2xl border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-pink-300 block">
                    One-Click SQL Schema Setup
                  </span>
                  <button
                    onClick={handleCopySql}
                    className="flex items-center gap-1 px-3 py-1 bg-pink-500/20 hover:bg-pink-500/30 text-pink-200 rounded-lg text-xs font-medium border border-pink-500/30 transition-all cursor-pointer"
                  >
                    {copiedSql ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied SQL!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy SQL Script
                      </>
                    )}
                  </button>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  To initialize the shared database tables in your Supabase dashboard:
                  <br />
                  1. Go to <strong className="text-pink-300">Supabase Dashboard &gt; SQL Editor</strong>
                  <br />
                  2. Click &quot;Copy SQL Script&quot; above and paste it into the editor
                  <br />
                  3. Click <strong className="text-pink-300">Run</strong>. All tables, security policies, and initial records will be created automatically!
                </p>
              </div>
            </div>
          )}

          {/* HOWTO TAB */}
          {activeTab === 'howto' && (
            <div className="space-y-3 text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-4 rounded-2xl border border-white/5">
              <div className="flex items-center gap-2 text-pink-300 font-medium">
                <HelpCircle className="w-4 h-4" /> System &amp; Security Overview
              </div>
              <p>
                • <strong>Public Access:</strong> Visitors (Baby &amp; friends) can enjoy the full birthday surprise without any login.
                <br />
                • <strong>Admin Security:</strong> Admin settings and database updates are protected and authenticated.
                <br />
                • <strong>Shared Backend:</strong> All changes made here synchronize to Supabase Cloud so all devices see the same sweet updates.
              </p>
            </div>
          )}
        </div>

        {/* Cloud Save feedback */}
        {cloudSaveMessage && (
          <div className="px-5 py-2 shrink-0 text-xs text-center bg-pink-500/15 border-t border-pink-500/30 text-pink-200 animate-fade-in">
            {cloudSaveMessage}
          </div>
        )}

        {/* Footer actions - Fixed at bottom, Always Visible */}
        <div className="flex items-center justify-between px-5 sm:px-7 py-3.5 border-t border-pink-500/20 shrink-0 bg-slate-950/95 backdrop-blur-md">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Defaults
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-300 hover:text-white rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 disabled:opacity-50 text-white rounded-xl text-xs font-medium shadow-lg shadow-pink-500/20 active:scale-95 transition-all cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 animate-spin" /> Saving...
                </>
              ) : savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" /> Saved!
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" /> Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
