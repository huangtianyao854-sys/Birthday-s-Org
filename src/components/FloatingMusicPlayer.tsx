import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Music, Play, Pause, Upload, Activity } from 'lucide-react';
import { romanticAudio } from '../utils/romanticAudio';
import { birdsongAudio } from '../utils/birdsongAudio';

interface FloatingMusicPlayerProps {
  customAudioUrl?: string;
  autoStartOnInteraction?: boolean;
  isAdminMode?: boolean;
  onOpenSongUpload?: () => void;
  isVisualizerActive?: boolean;
  onToggleVisualizer?: () => void;
  onPlayStateChange?: (playing: boolean) => void;
}

export const FloatingMusicPlayer: React.FC<FloatingMusicPlayerProps> = ({
  customAudioUrl,
  autoStartOnInteraction = true,
  isAdminMode = false,
  onOpenSongUpload,
  isVisualizerActive = true,
  onToggleVisualizer,
  onPlayStateChange,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.6);
  const [showControls, setShowControls] = useState<boolean>(false);
  const [needsGesturePrompt, setNeedsGesturePrompt] = useState<boolean>(false);

  const customAudioUrlRef = useRef<string | undefined>(customAudioUrl);
  useEffect(() => {
    customAudioUrlRef.current = customAudioUrl;
  }, [customAudioUrl]);

  // Attempt immediate playback on mount & register universal gesture unlock
  useEffect(() => {
    // Check saved session state
    const savedMuted = sessionStorage.getItem('hny_music_muted');
    if (savedMuted === 'true') {
      romanticAudio.toggleMute();
      birdsongAudio.setMuted(true);
      setIsMuted(true);
    }

    const startPlayback = () => {
      const targetUrl = customAudioUrlRef.current;
      romanticAudio.play(targetUrl);
      birdsongAudio.start();
      setIsPlaying(true);
      onPlayStateChange?.(true);
      setNeedsGesturePrompt(false);
    };

    // 1. Attempt immediate playback as soon as website opens
    try {
      startPlayback();
    } catch {
      setNeedsGesturePrompt(true);
    }

    // 2. Comprehensive universal gesture unlock listener across all interaction types
    const handleFirstGesture = () => {
      startPlayback();
      window.removeEventListener('pointerdown', handleFirstGesture);
      window.removeEventListener('touchstart', handleFirstGesture);
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('scroll', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
    };

    window.addEventListener('pointerdown', handleFirstGesture, { once: true });
    window.addEventListener('touchstart', handleFirstGesture, { once: true });
    window.addEventListener('click', handleFirstGesture, { once: true });
    window.addEventListener('scroll', handleFirstGesture, { once: true });
    window.addEventListener('keydown', handleFirstGesture, { once: true });

    return () => {
      window.removeEventListener('pointerdown', handleFirstGesture);
      window.removeEventListener('touchstart', handleFirstGesture);
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('scroll', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
    };
  }, [onPlayStateChange]);

  // Update song immediately whenever customAudioUrl arrives (e.g. from Supabase / IndexedDB)
  useEffect(() => {
    if (customAudioUrl && customAudioUrl.trim() !== '') {
      romanticAudio.play(customAudioUrl);
      birdsongAudio.start();
      setIsPlaying(true);
      onPlayStateChange?.(true);
      setNeedsGesturePrompt(false);
    }
  }, [customAudioUrl, onPlayStateChange]);

  const togglePlay = () => {
    if (isPlaying) {
      romanticAudio.pause();
      birdsongAudio.pause();
      setIsPlaying(false);
      onPlayStateChange?.(false);
    } else {
      romanticAudio.play(customAudioUrl);
      birdsongAudio.start();
      setIsPlaying(true);
      onPlayStateChange?.(true);
      setNeedsGesturePrompt(false);
    }
  };

  const toggleMute = () => {
    const muted = romanticAudio.toggleMute();
    birdsongAudio.setMuted(muted);
    setIsMuted(muted);
    sessionStorage.setItem('hny_music_muted', String(muted));
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    romanticAudio.setVolume(newVol);
    if (isMuted && newVol > 0) {
      romanticAudio.toggleMute();
      setIsMuted(false);
    }
  };

  return (
    <>
      <aside aria-label="Music Controls" className="fixed top-4 right-4 z-50 flex items-center gap-2">
        {/* Expanded Control Drawer */}
        {showControls && (
          <div className="glass-panel px-3 py-2 rounded-2xl flex items-center gap-3 shadow-xl animate-fade-in border border-sky-300/70 text-xs text-slate-800">
            <button
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause music' : 'Play music'}
              className="p-1.5 rounded-full bg-sky-500/20 hover:bg-sky-500/35 text-sky-700 transition-colors cursor-pointer"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>

            <div className="flex items-center gap-1.5">
              <button
                onClick={toggleMute}
                aria-label={isMuted ? 'Unmute sound' : 'Mute sound'}
                className="text-sky-700 hover:text-sky-900 cursor-pointer"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-3.5 h-3.5" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 accent-sky-500 cursor-pointer h-1.5 bg-sky-100 rounded-lg"
                aria-label="Volume slider"
              />
            </div>

            {/* Audio Visualizer Mode Toggle */}
            {onToggleVisualizer && (
              <button
                onClick={onToggleVisualizer}
                className={`p-1.5 rounded-full transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-medium ${
                  isVisualizerActive
                    ? 'bg-sky-500/25 text-sky-800 border border-sky-400/40'
                    : 'bg-slate-200/50 text-slate-500 hover:bg-slate-200'
                }`}
                title={isVisualizerActive ? 'Disable Audio Visualizer' : 'Enable Audio Visualizer'}
                aria-label="Toggle Audio Visualizer"
              >
                <Activity className="w-3 h-3 text-sky-600" />
              </button>
            )}

            {/* Admin Quick Upload Button */}
            {isAdminMode && onOpenSongUpload && (
              <button
                onClick={onOpenSongUpload}
                className="p-1.5 rounded-full bg-pink-500/20 hover:bg-pink-500/30 text-pink-700 transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-medium"
                title="Change or Upload Song"
              >
                <Upload className="w-3 h-3" />
                <span className="hidden sm:inline">Song</span>
              </button>
            )}
          </div>
        )}

        {/* Main Floating Orb Trigger */}
        <button
          onClick={() => setShowControls(!showControls)}
          aria-expanded={showControls}
          aria-label="Toggle music player settings"
          className={`p-2.5 rounded-full glass-panel shadow-lg border transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center relative ${
            isPlaying
              ? 'border-sky-400/60 text-sky-600 bg-sky-50/70 shadow-sky-500/20'
              : 'border-rose-300/60 text-rose-600 bg-rose-50/70 shadow-rose-500/20'
          }`}
        >
          {isPlaying ? (
            <Music className="w-5 h-5 animate-pulse" />
          ) : (
            <VolumeX className="w-5 h-5" />
          )}

          {/* Glowing Animated Ring when Playing */}
          {isPlaying && (
            <span className="absolute -inset-1 rounded-full border border-sky-400/40 animate-ping pointer-events-none" />
          )}
        </button>
      </aside>

      {/* Gentle Floating Prompt if Browser Autoplay Blocked Sound Until Tap */}
      {needsGesturePrompt && !isPlaying && (
        <div
          onClick={() => {
            romanticAudio.play(customAudioUrl);
            birdsongAudio.start();
            setIsPlaying(true);
            onPlayStateChange?.(true);
            setNeedsGesturePrompt(false);
          }}
          className="fixed bottom-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-slate-950/85 backdrop-blur-md border border-pink-400/60 text-pink-200 text-xs font-serif-romantic shadow-2xl animate-bounce flex items-center gap-2 cursor-pointer hover:bg-slate-900 transition-colors"
        >
          <Music className="w-3.5 h-3.5 text-pink-400 animate-spin" />
          <span>Tap anywhere to hear our theme song 🎵</span>
        </div>
      )}
    </>
  );
};
