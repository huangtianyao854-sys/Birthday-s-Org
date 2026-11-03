import React, { useState, useEffect, useCallback } from 'react';
import { Settings, Image as ImageIcon } from 'lucide-react';
import { initialBirthdayConfig, BirthdayConfig, AppLanguage } from './config/birthdayConfig';
import { RealGardenBackground, GardenLightingMode } from './components/RealGardenBackground';
import { GardenAtmosphereBar } from './components/GardenAtmosphereBar';
import { FallingLeavesOverlay } from './components/FallingLeavesOverlay';
import { FloatingMusicPlayer } from './components/FloatingMusicPlayer';
import { LanguageToggle } from './components/LanguageToggle';
import { SettingsModal } from './components/SettingsModal';
import { AdminAuthModal } from './components/AdminAuthModal';
import { GalleryModal } from './components/GalleryModal';
import { GuestbookModal } from './components/GuestbookModal';
import { AllTextEditorModal } from './components/AllTextEditorModal';
import { AdminSongUploadModal } from './components/AdminSongUploadModal';
import { getSongFromIndexedDB } from './utils/audioStorage';
import { SupabaseGalleryItem } from './lib/supabase';
import {
  fetchSiteSettings,
  fetchTimelineItems,
  fetchGalleryItems
} from './services/supabaseService';

import { Scene1_SecretEntrance } from './components/scenes/Scene1_SecretEntrance';
import { Scene2_PasswordGate } from './components/scenes/Scene2_PasswordGate';
import { Scene3_BirthdayCake } from './components/scenes/Scene3_BirthdayCake';
import { Scene4_LoveLetter } from './components/scenes/Scene4_LoveLetter';
import { Scene5_LoveTimeline } from './components/scenes/Scene5_LoveTimeline';
import { Scene6_StarGazing } from './components/scenes/Scene6_StarGazing';
import { Scene8_FinalSurprise } from './components/scenes/Scene8_FinalSurprise';
import { AdminModeBar } from './components/AdminModeBar';
import { StarfieldCanvas } from './components/StarfieldCanvas';
import { FloatingHeartsOverlay } from './components/FloatingHeartsOverlay';
import { Fireflies } from './components/Fireflies';
import { WeatherOverlay } from './components/WeatherOverlay';
import { MoonlightPhase } from './components/MoonlightPhase';
import { LoveScroll } from './components/LoveScroll';
import { AudioVisualizer } from './components/AudioVisualizer';
import { birdsongAudio } from './utils/birdsongAudio';

export default function App() {
  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(false);
  const [showVisualizer, setShowVisualizer] = useState<boolean>(true);

  const [config, setConfig] = useState<BirthdayConfig>(() => {
    const saved = localStorage.getItem('hny_custom_birthday_config_v3');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialBirthdayConfig;
      }
    }
    return initialBirthdayConfig;
  });

  const [currentScene, setCurrentScene] = useState<number>(1);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    return sessionStorage.getItem('hny_gate_unlocked') === 'true';
  });

  // Admin Mode state
  const [isAdminMode, setIsAdminMode] = useState<boolean>(() => {
    return sessionStorage.getItem('hny_admin_mode') === 'true';
  });

  // Default / Main language is Burmese as requested
  const [lang, setLang] = useState<AppLanguage>('my');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isTextEditorOpen, setIsTextEditorOpen] = useState<boolean>(false);
  const [isSongUploadOpen, setIsSongUploadOpen] = useState<boolean>(false);
  const [adminTargetModal, setAdminTargetModal] = useState<'settings' | 'textEditor' | 'songUpload'>('settings');
  const [isAdminAuthOpen, setIsAdminAuthOpen] = useState<boolean>(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState<boolean>(false);
  const [isGuestbookOpen, setIsGuestbookOpen] = useState<boolean>(false);
  const [showConstellation, setShowConstellation] = useState<boolean>(false);

  // Time-of-day Garden Lighting Mode ('daylight' | 'golden' | 'twilight') - Mobile friendly & persistent
  const [lightingMode, setLightingMode] = useState<GardenLightingMode>(() => {
    return (localStorage.getItem('hny_garden_lighting_mode') as GardenLightingMode) || 'daylight';
  });
  const [showExploreMode, setShowExploreMode] = useState<boolean>(false);

  const handleLightingModeChange = (mode: GardenLightingMode) => {
    setLightingMode(mode);
    localStorage.setItem('hny_garden_lighting_mode', mode);
    birdsongAudio.setLightingMode(mode);
  };

  // Synchronize birdsong audio engine with lighting mode and settings
  useEffect(() => {
    birdsongAudio.setLightingMode(lightingMode);
    if (config.birdsongEnabled !== undefined) {
      birdsongAudio.setEnabled(config.birdsongEnabled);
    }
    if (config.birdsongVolume !== undefined) {
      birdsongAudio.setVolume(config.birdsongVolume);
    }
  }, [lightingMode, config.birdsongEnabled, config.birdsongVolume]);

  // Supabase Data State
  const [galleryItems, setGalleryItems] = useState<SupabaseGalleryItem[]>([]);

  // Refresh Gallery items
  const loadGallery = useCallback(async () => {
    const items = await fetchGalleryItems();
    setGalleryItems(items);
  }, []);

  // Fetch initial shared configuration from Supabase & restore custom song from IndexedDB
  useEffect(() => {
    const loadSharedCloudData = async () => {
      try {
        const cloudSettings = await fetchSiteSettings();
        if (cloudSettings) {
          setConfig((prev) => {
            const merged = {
              ...prev,
              ...cloudSettings,
            };
            // Sync to local cache so subsequent visits on this device immediately have cloud settings
            try {
              localStorage.setItem('hny_custom_birthday_config_v3', JSON.stringify(merged));
            } catch {
              // ignore
            }
            return merged;
          });
        }

        const cloudTimeline = await fetchTimelineItems();
        if (cloudTimeline && cloudTimeline.length > 0) {
          setConfig((prev) => ({
            ...prev,
            milestones: cloudTimeline,
          }));
        }

        await loadGallery();

        // Only restore custom song from IndexedDB if cloud audioTrackUrl is completely absent
        const localSong = await getSongFromIndexedDB();
        if (localSong && localSong.url) {
          setConfig((prev) => {
            if (!prev.audioTrackUrl || prev.audioTrackUrl.trim() === '' || prev.audioTrackUrl.startsWith('blob:')) {
              return { ...prev, audioTrackUrl: localSong.url };
            }
            return prev;
          });
        }
      } catch (err) {
        console.warn('[App] Supabase initial load fell back to local configuration:', err);
      }
    };

    loadSharedCloudData();
  }, [loadGallery]);

  // Save config changes to localStorage and state
  const handleSaveConfig = (newConfig: BirthdayConfig) => {
    setConfig(newConfig);
    localStorage.setItem('hny_custom_birthday_config_v3', JSON.stringify(newConfig));
  };

  const handleUnlockSuccess = () => {
    setIsUnlocked(true);
    sessionStorage.setItem('hny_gate_unlocked', 'true');
    setCurrentScene(3);
  };

  const handleResetExperience = () => {
    setIsUnlocked(false);
    sessionStorage.removeItem('hny_gate_unlocked');
    setCurrentScene(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen w-full bg-slate-950/20 text-slate-800 overflow-x-hidden select-none">
      {/* Real-Life Botanical Dreamy Rose Garden Retreat Backdrop (Mobile-First 3 Modes) */}
      <RealGardenBackground
        lightingMode={lightingMode}
        onChangeLightingMode={handleLightingModeChange}
        showExploreMode={showExploreMode}
      />

      {/* Atmospheric Weather Layer (Soft sun rays for daylight, Golden haze for sunset, Misty stardust for twilight) */}
      <WeatherOverlay lightingMode={lightingMode} />

      {/* Idle Moonlight Phase (Subtle cool color temperature shift & sweeping volumetric moonbeam light shaft) */}
      <MoonlightPhase lightingMode={lightingMode} />

      {/* Soft Floating Audio Waveform Particles (Synced to FloatingMusicPlayer beat, prominent in Twilight & Midnight) */}
      {showVisualizer && (
        <AudioVisualizer lightingMode={lightingMode} isPlaying={isMusicPlaying} />
      )}

      {/* Natural Drifting Rose Petals & Garden Leaves Overlay (Mode-Sensitive) */}
      <FallingLeavesOverlay lightingMode={lightingMode} />

      {/* Magical Golden Fireflies Overlay (Twinkling on & off, peak density in Twilight mode) */}
      <Fireflies lightingMode={lightingMode} />

      {/* Romantic Rising Floating Hearts Overlay (Periodic from bottom + Tap bursts) */}
      <FloatingHeartsOverlay />

      {/* Interactive Celestial Starfield with Twinkling Stars & Shooting Meteors (Active in Twilight & Midnight Modes, and Star Scene) */}
      {(lightingMode === 'twilight' || lightingMode === 'midnight' || currentScene === 6) && (
        <StarfieldCanvas showConstellation={showConstellation} lightingMode={lightingMode} />
      )}

      {/* Admin Mode Floating Toolbar */}
      <AdminModeBar
        isAdminMode={isAdminMode}
        onExitAdminMode={() => {
          setIsAdminMode(false);
          sessionStorage.removeItem('hny_admin_mode');
        }}
        config={config}
        onUpdateConfig={handleSaveConfig}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenTextEditor={() => setIsTextEditorOpen(true)}
        onOpenSongUpload={() => setIsSongUploadOpen(true)}
        onOpenGuestbook={() => setIsGuestbookOpen(true)}
        currentScene={currentScene}
        onChangeScene={(scene) => setCurrentScene(scene)}
      />

      {/* Mobile-First Header Navigation Bar */}
      <LanguageToggle currentLang={lang} onChangeLang={setLang} />
      <GardenAtmosphereBar
        currentMode={lightingMode}
        onChangeMode={handleLightingModeChange}
        lang={lang}
        showExploreMode={showExploreMode}
        onToggleExploreMode={() => setShowExploreMode(!showExploreMode)}
        isAdminMode={isAdminMode}
      />
      <FloatingMusicPlayer
        customAudioUrl={config.audioTrackUrl}
        isAdminMode={isAdminMode}
        onOpenSongUpload={() => setIsSongUploadOpen(true)}
        isVisualizerActive={showVisualizer}
        onToggleVisualizer={() => setShowVisualizer(!showVisualizer)}
        onPlayStateChange={(playing) => setIsMusicPlaying(playing)}
      />

      {/* Main Narrative Scene Router with Smooth Animated Transition */}
      <main className="relative z-10 w-full min-h-screen flex flex-col justify-center">
        <div key={currentScene} className="w-full flex-1 flex flex-col justify-center animate-fade-in-up">
          {currentScene === 1 && (
            <Scene1_SecretEntrance
              config={config}
              lang={lang}
              isAdminMode={isAdminMode}
              onUpdateConfig={handleSaveConfig}
              onEnter={() => {
                if (isUnlocked) {
                  setCurrentScene(3);
                } else {
                  setCurrentScene(2);
                }
              }}
            />
          )}

          {currentScene === 2 && (
            <Scene2_PasswordGate
              config={config}
              lang={lang}
              isAdminMode={isAdminMode}
              onUpdateConfig={handleSaveConfig}
              onUnlockSuccess={handleUnlockSuccess}
            />
          )}

          {currentScene === 3 && (
            <Scene3_BirthdayCake
              config={config}
              lang={lang}
              isAdminMode={isAdminMode}
              onUpdateConfig={handleSaveConfig}
              onContinue={() => setCurrentScene(4)}
            />
          )}

          {currentScene === 4 && (
            <Scene4_LoveLetter
              config={config}
              lang={lang}
              isAdminMode={isAdminMode}
              onUpdateConfig={handleSaveConfig}
              onContinue={() => setCurrentScene(5)}
            />
          )}

          {currentScene === 5 && (
            <Scene5_LoveTimeline
              config={config}
              lang={lang}
              isAdminMode={isAdminMode}
              onUpdateConfig={handleSaveConfig}
              onContinue={() => setCurrentScene(6)}
            />
          )}

          {currentScene === 6 && (
            <Scene6_StarGazing
              config={config}
              lang={lang}
              isAdminMode={isAdminMode}
              onUpdateConfig={handleSaveConfig}
              onContinue={() => setCurrentScene(7)}
              showConstellation={showConstellation}
              onToggleConstellation={() => setShowConstellation(!showConstellation)}
            />
          )}

          {currentScene === 7 && (
            <Scene8_FinalSurprise
              config={config}
              lang={lang}
              isAdminMode={isAdminMode}
              onUpdateConfig={handleSaveConfig}
              onResetExperience={handleResetExperience}
            />
          )}
        </div>
      </main>

      {/* Dynamic Slow-Scrolling Romantic Birthday Wishes Marquee */}
      <LoveScroll
        wishes={config.loveScrollWishes}
        lang={lang}
        enabled={config.loveScrollEnabled}
      />

      {/* Bottom Floating Navigation (Gallery & Settings) */}
      <footer className="fixed bottom-4 right-4 z-40 flex items-center gap-2">

        {/* Photo Gallery Button for Baby / Visitors */}
        <button
          onClick={() => setIsGalleryOpen(true)}
          title="Our Photo Memories"
          aria-label="Our Photo Memories"
          className="p-2.5 rounded-full glass-panel hover:border-rose-400 text-rose-900 hover:text-rose-950 transition-colors shadow-lg active:scale-95 cursor-pointer flex items-center gap-1.5 border border-rose-200/80"
        >
          <ImageIcon className="w-4 h-4 text-rose-600" />
          <span className="hidden sm:inline text-xs font-serif-romantic pr-1 font-semibold">Memories</span>
        </button>

        {/* Discrete Admin/Settings Button */}
        <button
          onClick={() => {
            if (isAdminMode) {
              setIsSettingsOpen(true);
            } else {
              setAdminTargetModal('settings');
              setIsAdminAuthOpen(true);
            }
          }}
          title={isAdminMode ? 'Admin Settings (Active)' : 'Admin Settings (Passcode Required)'}
          aria-label="Admin Settings"
          className={`p-2.5 rounded-full glass-panel transition-colors shadow-lg active:scale-95 cursor-pointer border ${
            isAdminMode
              ? 'border-rose-500 text-rose-700 ring-2 ring-rose-400/50 bg-rose-50/90'
              : 'border-rose-200/70 hover:border-rose-400 text-slate-500 hover:text-rose-700'
          }`}
        >
          <Settings className="w-4 h-4" />
        </button>
      </footer>

      {/* Birthday Wishes Guestbook Modal (Supabase-backed) */}
      <GuestbookModal
        isOpen={isGuestbookOpen}
        onClose={() => setIsGuestbookOpen(false)}
        lang={lang}
        isAdminMode={isAdminMode}
      />

      {/* Public Photo Gallery Modal */}
      <GalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        items={galleryItems}
        lang={lang}
      />

      {/* Password Required Modal for Admin */}
      <AdminAuthModal
        isOpen={isAdminAuthOpen}
        onClose={() => setIsAdminAuthOpen(false)}
        onSuccess={() => {
          setIsAdminAuthOpen(false);
          setIsAdminMode(true);
          sessionStorage.setItem('hny_admin_mode', 'true');
          if (adminTargetModal === 'textEditor') {
            setIsTextEditorOpen(true);
          } else if (adminTargetModal === 'songUpload') {
            setIsSongUploadOpen(true);
          } else {
            setIsSettingsOpen(true);
          }
        }}
      />

      {/* All Text & Story Editor Modal - Strictly Admin Protected */}
      <AllTextEditorModal
        isOpen={isTextEditorOpen}
        onClose={() => setIsTextEditorOpen(false)}
        config={config}
        onSaveConfig={handleSaveConfig}
        isAdminMode={isAdminMode}
        onToggleAdminMode={(active) => {
          setIsAdminMode(active);
          sessionStorage.setItem('hny_admin_mode', active ? 'true' : 'false');
        }}
      />

      {/* Admin Song Upload Modal - Any Song File / Voice Note Upload */}
      <AdminSongUploadModal
        isOpen={isSongUploadOpen}
        onClose={() => setIsSongUploadOpen(false)}
        config={config}
        onUpdateConfig={handleSaveConfig}
      />

      {/* Admin Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onSaveConfig={handleSaveConfig}
        galleryItems={galleryItems}
        onRefreshGallery={loadGallery}
      />
    </div>
  );
}
