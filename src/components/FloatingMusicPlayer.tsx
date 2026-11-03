import React, { useState, useEffect } from 'react';
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
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);

  useEffect(() => {
    // Check saved session state
    const savedMuted = sessionStorage.getItem('hny_music_muted');
    if (savedMuted === 'true') {
      romanticAudio.toggleMute();
      birdsongAudio.setMuted(true);
      setIsMuted(true);
    }

    const firstInteractionHandler = () => {
      if (!hasInteracted && autoStartOnInteraction) {
        setHasInteracted(true);
        romanticAudio.play(customAudioUrl);
        birdsongAudio.start();
        setIsPlaying(true);
        onPlayStateChange?.(true);
      }
    };

    window.addEventListener('click', firstInteractionHandler, { once: true });
    window.addEventListener('touchstart', firstInteractionHandler, { once: true });

    return () => {
      window.removeEventListener('click', firstInteractionHandler);
      window.removeEventListener('touchstart', firstInteractionHandler);
    };
  }, [customAudioUrl, hasInteracted, autoStartOnInteraction, onPlayStateChange]);

  // Update song when customAudioUrl changes while music is active
  useEffect(() => {
    if (isPlaying && hasInteracted) {
      romanticAudio.play(customAudioUrl);
    }
  }, [customAudioUrl, isPlaying, hasInteracted]);

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
              className="w-16 sm:w-20 accent-sky-500 h-1 bg-sky-200 rounded-lg cursor-pointer"
              aria-label="Volume Slider"
            />
          </div>

          <span className="text-[11px] text-sky-800 font-medium hidden sm:inline whitespace-nowrap">
            {customAudioUrl ? 'Custom Melody' : 'Garden Melody'}
          </span>

          {/* Audio Visualizer Toggle Button */}
          {onToggleVisualizer && (
            <button
              onClick={onToggleVisualizer}
              title={isVisualizerActive ? 'Waveform Particles: Active' : 'Waveform Particles: Hidden'}
              className={`px-2 py-1 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                isVisualizerActive
                  ? 'bg-rose-500/20 text-rose-700 border border-rose-300/60 shadow-sm'
                  : 'bg-slate-200/50 text-slate-500 hover:bg-slate-200'
              }`}
            >
              <Activity className={`w-3 h-3 ${isVisualizerActive && isPlaying ? 'animate-pulse text-rose-600' : ''}`} />
              <span className="hidden sm:inline">Waves</span>
            </button>
          )}

          {isAdminMode && onOpenSongUpload && (
            <button
              onClick={onOpenSongUpload}
              title="Upload or change song (Admin)"
              className="px-2 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/35 text-sky-800 text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Upload className="w-3 h-3 text-sky-600" />
              <span className="hidden sm:inline">Song</span>
            </button>
          )}
        </div>
      )}

      {/* Main floating sound orb button (Compact icon-only) */}
      <button
        onClick={() => {
          if (!isPlaying) {
            togglePlay();
          }
          setShowControls(!showControls);
        }}
        title="Background Music Controls"
        aria-label="Toggle background music controls"
        style={{ width: '20px', height: '20px' }}
        className="relative group p-0 w-[20px] h-[20px] rounded-full glass-panel hover:border-rose-400 border border-rose-200/90 transition-all duration-300 flex items-center justify-center shadow-sm cursor-pointer shrink-0"
      >
        <Music
          className={`w-2.5 h-2.5 text-rose-600 transition-transform ${
            isPlaying ? 'scale-110 text-rose-700 animate-spin-slow' : 'opacity-85'
          }`}
        />

        {/* Animated equalizer waves when playing */}
        {isPlaying && !isMuted && (
          <span className="absolute -top-1 -right-1 flex gap-0.5 items-end h-2 px-0.5">
            <span className="w-0.5 bg-rose-500 animate-pulse h-1.5 rounded-full" />
            <span className="w-0.5 bg-pink-400 animate-pulse delay-75 h-2 rounded-full" />
          </span>
        )}
      </button>
    </aside>
  );
};
