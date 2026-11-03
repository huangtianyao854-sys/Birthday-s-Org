import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Music,
  Upload,
  Play,
  Pause,
  RotateCcw,
  Check,
  Radio,
  Volume2,
  FileAudio,
  Sparkles,
  Link,
  Loader2,
} from 'lucide-react';
import { BirthdayConfig } from '../config/birthdayConfig';
import { uploadAudioToSupabase, saveSiteSettingsToSupabase } from '../services/supabaseService';
import { saveSongToIndexedDB, clearSongFromIndexedDB } from '../utils/audioStorage';
import { romanticAudio } from '../utils/romanticAudio';

interface AdminSongUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: BirthdayConfig;
  onUpdateConfig: (newConfig: BirthdayConfig) => void;
}

export const AdminSongUploadModal: React.FC<AdminSongUploadModalProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  const [activeUrl, setActiveUrl] = useState<string>(config.audioTrackUrl || '');
  const [customLinkInput, setCustomLinkInput] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [uploadedSongName, setUploadedSongName] = useState<string | null>(null);
  const [uploadedFileSize, setUploadedFileSize] = useState<string | null>(null);
  const [storageType, setStorageType] = useState<'cloud' | 'local' | null>(null);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveUrl(config.audioTrackUrl || '');
      setSuccessMessage(null);
      setErrorMessage(null);
    }
    return () => {
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
      }
    };
  }, [isOpen, config.audioTrackUrl]);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(`Processing "${file.name}"...`);
    setErrorMessage(null);
    setSuccessMessage(null);

    const sizeStr = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
    setUploadedSongName(file.name);
    setUploadedFileSize(sizeStr);

    try {
      // 1. Upload to Supabase cloud storage (with intelligent multi-folder & DB fallback)
      setUploadProgress(`Uploading "${file.name}" to Supabase Cloud...`);
      const cloudResult = await uploadAudioToSupabase(file);

      if (cloudResult.error || !cloudResult.url) {
        throw new Error(cloudResult.error || 'Failed to upload song to Supabase cloud storage.');
      }

      const finalAudioUrl = cloudResult.url;
      setStorageType('cloud');
      setActiveUrl(finalAudioUrl);

      // 2. Cache in local IndexedDB for fast instant playback
      await saveSongToIndexedDB(file);

      // 3. Apply to configuration and permanently save to Supabase cloud
      const updatedConfig = { ...config, audioTrackUrl: finalAudioUrl };
      onUpdateConfig(updatedConfig);
      localStorage.setItem('hny_custom_birthday_config_v3', JSON.stringify(updatedConfig));
      
      const saveRes = await saveSiteSettingsToSupabase(updatedConfig);
      if (!saveRes.success) {
        console.warn('[AdminSongUploadModal] Supabase site_settings save warning:', saveRes.error);
      }

      // 4. Play immediately in main romantic audio engine
      romanticAudio.play(finalAudioUrl);

      const storageLabel = cloudResult.isDataUrl ? 'Supabase Database' : 'Supabase Cloud Storage';
      setSuccessMessage(
        `"${file.name}" saved to ${storageLabel}! Synced across all devices (mobile, tablet & PC) and playing! ❤️`
      );
      setTimeout(() => setSuccessMessage(null), 6000);
    } catch (err: any) {
      console.error('Song upload error:', err);
      setErrorMessage(
        err?.message || 'Failed to upload song to Supabase. Please ensure your admin account is logged in or try a smaller MP3.'
      );
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleApplyCustomLink = async () => {
    const url = customLinkInput.trim();
    if (!url) return;

    setActiveUrl(url);
    setUploadedSongName('Direct Audio Stream');
    setStorageType('cloud');

    const updatedConfig = { ...config, audioTrackUrl: url };
    onUpdateConfig(updatedConfig);
    localStorage.setItem('hny_custom_birthday_config_v3', JSON.stringify(updatedConfig));
    await saveSiteSettingsToSupabase(updatedConfig);

    romanticAudio.play(url);
    setSuccessMessage('Song link applied and playing!');
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const handleResetToSynthesizer = async () => {
    setActiveUrl('');
    setUploadedSongName(null);
    setUploadedFileSize(null);
    setStorageType(null);
    if (audioPreviewRef.current) {
      audioPreviewRef.current.pause();
    }
    setIsPreviewPlaying(false);

    await clearSongFromIndexedDB();

    const updatedConfig = { ...config, audioTrackUrl: '' };
    onUpdateConfig(updatedConfig);
    localStorage.setItem('hny_custom_birthday_config_v3', JSON.stringify(updatedConfig));
    await saveSiteSettingsToSupabase(updatedConfig);

    romanticAudio.play(''); // Reverts to synthesized ambient garden music
    setSuccessMessage('Restored original romantic piano & garden chimes melody!');
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const togglePreview = () => {
    if (!audioPreviewRef.current || !activeUrl) return;

    if (isPreviewPlaying) {
      audioPreviewRef.current.pause();
      setIsPreviewPlaying(false);
    } else {
      audioPreviewRef.current.play().catch((err) => {
        console.warn('Preview error:', err);
      });
      setIsPreviewPlaying(true);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sky-950/60 backdrop-blur-md animate-fade-in select-none"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-lg bg-white/95 rounded-3xl shadow-2xl border border-sky-200 overflow-hidden text-slate-800 animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-sky-100 bg-gradient-to-r from-sky-50 via-rose-50/60 to-amber-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 via-rose-500 to-amber-500 flex items-center justify-center text-white shadow-md">
              <Music className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-serif-romantic text-sky-950 flex items-center gap-2">
                Upload Any Song
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-sans font-medium">
                  Admin Only
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Upload your favorite MP3, love song, or voice note to play throughout the garden.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200/60 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Notifications */}
          {successMessage && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2 animate-fade-in">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2 animate-fade-in">
              <X className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Current Status Card */}
          <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-sky-600 shadow-sm border border-sky-100">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-sky-950">Active Background Music</p>
                <p className="text-[11px] text-slate-500 truncate max-w-[220px]">
                  {activeUrl ? (uploadedSongName || 'Custom Uploaded Song') : 'Romantic Garden Synthesizer (Default)'}
                </p>
              </div>
            </div>

            {activeUrl ? (
              <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-1">
                <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
                Custom Song Active
              </span>
            ) : (
              <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-sky-100 text-sky-700">
                Default Melody
              </span>
            )}
          </div>

          {/* Upload Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-sky-300 hover:border-sky-500 rounded-3xl p-6 text-center cursor-pointer transition-all bg-sky-50/40 hover:bg-sky-50/80 group"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg,.flac,.webm,.mp4"
              className="hidden"
            />

            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-400 to-rose-400 text-white flex items-center justify-center mx-auto mb-3 shadow-md group-hover:scale-110 transition-transform">
              {isUploading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <Upload className="w-6 h-6" />
              )}
            </div>

            <p className="text-sm font-bold text-sky-950 font-serif-romantic mb-1">
              {isUploading ? uploadProgress : 'Click or Drag & Drop Any Song Here'}
            </p>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Supports MP3, WAV, M4A, FLAC, OGG, AAC or mobile voice recordings. Up to 50MB.
            </p>

            <button
              type="button"
              disabled={isUploading}
              className="mt-3.5 px-4 py-1.5 rounded-full bg-white text-sky-700 text-xs font-semibold border border-sky-200 shadow-sm group-hover:bg-sky-600 group-hover:text-white transition-colors cursor-pointer"
            >
              Choose Song File
            </button>
          </div>

          {/* Audio Preview Element (if custom active) */}
          {activeUrl && (
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
              <audio
                ref={audioPreviewRef}
                src={activeUrl}
                onEnded={() => setIsPreviewPlaying(false)}
                className="hidden"
              />

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={togglePreview}
                  className="w-8 h-8 rounded-full bg-sky-600 hover:bg-sky-700 text-white flex items-center justify-center transition-transform active:scale-95 cursor-pointer shadow-sm"
                  title={isPreviewPlaying ? 'Pause preview' : 'Play preview'}
                >
                  {isPreviewPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>
                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    {uploadedSongName || 'Preview Uploaded Song'}
                  </p>
                  {uploadedFileSize && (
                    <p className="text-[10px] text-slate-400">File size: {uploadedFileSize}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetToSynthesizer}
                  className="px-3 py-1 rounded-full text-[11px] font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset to Default</span>
                </button>
              </div>
            </div>
          )}

          {/* Alternative: Direct URL link input */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Link className="w-3.5 h-3.5 text-sky-600" />
              <span>Or Paste Direct Song URL (MP3 link)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={customLinkInput}
                onChange={(e) => setCustomLinkInput(e.target.value)}
                placeholder="https://example.com/our-love-song.mp3"
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-sky-500 bg-white"
              />
              <button
                type="button"
                onClick={handleApplyCustomLink}
                disabled={!customLinkInput.trim()}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Apply Link
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-sky-100 bg-slate-50 flex items-center justify-between">
          <p className="text-[11px] text-slate-500">
            Song plays in background across all scenes for you and Baby.
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-gradient-to-r from-sky-500 to-rose-500 text-white text-xs font-bold shadow-md hover:from-sky-600 hover:to-rose-600 transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
