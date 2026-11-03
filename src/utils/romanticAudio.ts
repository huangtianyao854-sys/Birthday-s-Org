/**
 * Romantic Ambient Audio Engine using Web Audio API
 * Generates an ethereal, calming piano & music box melody with gentle chime harmonics.
 * Autoplay-safe, responsive to volume, supports seamless loop, zero external audio asset dependency.
 */

class RomanticAudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private isMuted: boolean = false;
  private volume: number = 0.6;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaElementSource: MediaElementAudioSourceNode | null = null;
  private freqData: Uint8Array | null = null;
  private timeData: Uint8Array | null = null;
  private timerId: number | null = null;
  private externalAudio: HTMLAudioElement | null = null;
  private isExternal: boolean = false;

  // Romantic Pentatonic Progression (Notes in Hz: C4, D4, E4, G4, A4, C5, D5, E5, G5)
  private melodyNotes = [
    { freq: 261.63, dur: 1.2 }, // C4
    { freq: 329.63, dur: 1.0 }, // E4
    { freq: 392.00, dur: 1.4 }, // G4
    { freq: 523.25, dur: 2.0 }, // C5
    { freq: 440.00, dur: 1.2 }, // A4
    { freq: 392.00, dur: 1.2 }, // G4
    { freq: 329.63, dur: 1.6 }, // E4
    { freq: 293.66, dur: 1.8 }, // D4
    { freq: 329.63, dur: 1.2 }, // E4
    { freq: 392.00, dur: 1.2 }, // G4
    { freq: 440.00, dur: 1.4 }, // A4
    { freq: 587.33, dur: 2.2 }, // D5
    { freq: 523.25, dur: 2.8 }, // C5
  ];

  private currentNoteIdx = 0;

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
      
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 128;
      this.analyser.smoothingTimeConstant = 0.8;
      this.freqData = new Uint8Array(this.analyser.frequencyBinCount);
      this.timeData = new Uint8Array(this.analyser.fftSize);

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
      
      // Connect Master Gain -> Analyser -> Speakers
      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public play(customUrl?: string) {
    if (customUrl && customUrl.trim() !== '') {
      this.playExternal(customUrl);
      return;
    }

    if (this.externalAudio) {
      this.externalAudio.pause();
    }
    const wasExternal = this.isExternal;
    this.isExternal = false;

    this.initContext();
    if (this.isPlaying && !wasExternal) return;
    this.isPlaying = true;

    // Start scheduling notes
    this.scheduleNextNote();
  }

  private playExternal(url: string) {
    // If the same URL is already set and playing, don't interrupt
    if (this.externalAudio && this.externalAudio.src === url && this.isPlaying && !this.externalAudio.paused) {
      return;
    }

    this.stopSynth();

    if (!this.externalAudio) {
      this.externalAudio = new Audio();
      this.externalAudio.loop = true;
      this.externalAudio.preload = 'auto';
    }

    this.externalAudio.src = url;
    this.externalAudio.volume = this.isMuted ? 0 : this.volume;

    const playPromise = this.externalAudio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this.isPlaying = true;
          this.isExternal = true;
          this.stopSynth();
        })
        .catch((err) => {
          console.warn('[romanticAudio] Playback waiting for user gesture:', err?.message || err);
          // If blocked by browser autoplay policy (common on mobile when cloud song loads after mount):
          // Register a one-time gesture listener on window so that the very next user tap starts the custom song!
          const resumeOnGesture = () => {
            if (this.externalAudio && this.isExternal) {
              this.externalAudio
                .play()
                .then(() => {
                  this.isPlaying = true;
                  this.stopSynth();
                })
                .catch(() => {
                  // If it still fails, fallback to synth
                  this.isPlaying = false;
                  this.play();
                });
            }
            window.removeEventListener('click', resumeOnGesture);
            window.removeEventListener('touchstart', resumeOnGesture);
            window.removeEventListener('pointerdown', resumeOnGesture);
          };

          window.addEventListener('click', resumeOnGesture, { once: true });
          window.addEventListener('touchstart', resumeOnGesture, { once: true });
          window.addEventListener('pointerdown', resumeOnGesture, { once: true });

          // Start ambient synth in the meantime so the garden isn't silent
          this.isExternal = false;
          this.play();
          this.isExternal = true;
        });
    }

    this.isPlaying = true;
    this.isExternal = true;
  }

  private scheduleNextNote() {
    if (!this.isPlaying || !this.ctx || !this.masterGain || this.isExternal) return;

    const note = this.melodyNotes[this.currentNoteIdx];
    this.playTone(note.freq, note.dur);

    // Occasional low bass octave note for warmth
    if (this.currentNoteIdx % 4 === 0) {
      this.playTone(note.freq / 2, note.dur * 1.5, 0.25, 'sine');
    }

    // Occasional shimmering chime overtone
    if (Math.random() > 0.4) {
      setTimeout(() => {
        if (this.isPlaying && !this.isExternal) {
          this.playTone(note.freq * 2, 1.2, 0.12, 'triangle');
        }
      }, 400);
    }

    this.currentNoteIdx = (this.currentNoteIdx + 1) % this.melodyNotes.length;

    // Interval between notes (staggered romantic flow)
    const delay = note.dur * 780 + Math.random() * 300;
    this.timerId = window.setTimeout(() => this.scheduleNextNote(), delay);
  }

  private playTone(freq: number, duration: number, gainLevel: number = 0.35, type: OscillatorType = 'sine') {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const noteGain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    // Warm, soft envelope (music box / bell-like attack, slow graceful release)
    const now = this.ctx.currentTime;
    noteGain.gain.setValueAtTime(0.0001, now);
    noteGain.gain.exponentialRampToValueAtTime(gainLevel, now + 0.05);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(noteGain);
    noteGain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + duration);
  }

  public pause() {
    this.isPlaying = false;
    this.stopSynth();
    if (this.externalAudio) {
      this.externalAudio.pause();
    }
  }

  private stopSynth() {
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.1);
    }
    if (this.externalAudio && !this.isMuted) {
      this.externalAudio.volume = this.volume;
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime, 0.1);
    }
    if (this.externalAudio) {
      this.externalAudio.volume = this.isMuted ? 0 : this.volume;
    }
    return this.isMuted;
  }

  public playCosmicChime(type: 'star' | 'meteor' | 'constellation' = 'star') {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    if (type === 'meteor') {
      // Sweeping high-to-mid chime
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, now); // A5
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.6); // A4
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.8);
    } else if (type === 'constellation') {
      // Arpeggio of star notes
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          this.playTone(freq, 1.4, 0.22, 'sine');
        }, idx * 110);
      });
    } else {
      // Single gentle celestial star ping
      const starPitches = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
      const pitch = starPitches[Math.floor(Math.random() * starPitches.length)];
      this.playTone(pitch, 1.0, 0.18, 'triangle');
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public getVolume(): number {
    return this.volume;
  }

  /**
   * Real-time audio waveform and frequency analysis for AudioVisualizer
   */
  public getAudioAnalysis(): {
    frequencyData: Uint8Array;
    timeData: Uint8Array;
    energy: number;
    bass: number;
    treble: number;
    isPlaying: boolean;
  } {
    if (!this.isPlaying || this.isMuted) {
      return {
        frequencyData: this.freqData || new Uint8Array(64),
        timeData: this.timeData || new Uint8Array(128).fill(128),
        energy: 0,
        bass: 0,
        treble: 0,
        isPlaying: false,
      };
    }

    // 1. Try reading real hardware FFT data from Web Audio AnalyserNode
    if (this.analyser && this.freqData && this.timeData) {
      this.analyser.getByteFrequencyData(this.freqData as any);
      this.analyser.getByteTimeDomainData(this.timeData as any);

      let sum = 0;
      let bassSum = 0;
      let trebleSum = 0;
      const count = this.freqData.length;
      const bassCount = Math.max(1, Math.min(8, count));
      const trebleStart = Math.floor(count * 0.65);

      for (let i = 0; i < count; i++) {
        const val = this.freqData[i];
        sum += val;
        if (i < bassCount) bassSum += val;
        if (i >= trebleStart) trebleSum += val;
      }

      const rawEnergy = sum / (count * 255);
      const rawBass = bassSum / (bassCount * 255);
      const rawTreble = trebleSum / ((count - trebleStart) * 255);

      if (rawEnergy > 0.02) {
        return {
          frequencyData: this.freqData,
          timeData: this.timeData,
          energy: Math.min(1, rawEnergy * 1.5),
          bass: Math.min(1, rawBass * 1.6),
          treble: Math.min(1, rawTreble * 1.8),
          isPlaying: true,
        };
      }
    }

    // 2. Organic musical pulse rhythm when external audio is playing without direct media stream CORS
    const now = Date.now() / 1000;
    const beatPhase = (now * 2.2) % (Math.PI * 2);
    const mainPulse = Math.pow(Math.sin(beatPhase) * 0.5 + 0.5, 2);
    const shimmer = Math.sin(now * 5.1) * 0.3 + 0.5;

    // Fill artificial gentle wave in timeData so visualizer waveform is organic
    if (this.timeData) {
      for (let i = 0; i < this.timeData.length; i++) {
        const wave = Math.sin((i / this.timeData.length) * Math.PI * 4 + now * 3);
        this.timeData[i] = Math.round(128 + wave * 45 * mainPulse);
      }
    }

    return {
      frequencyData: this.freqData || new Uint8Array(64),
      timeData: this.timeData || new Uint8Array(128).fill(128),
      energy: (mainPulse * 0.6 + 0.3) * this.volume,
      bass: mainPulse * 0.85,
      treble: shimmer * 0.75,
      isPlaying: this.isPlaying,
    };
  }
}

export const romanticAudio = new RomanticAudioEngine();

