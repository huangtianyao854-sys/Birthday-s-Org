/**
 * Ambient Birdsong Engine using Web Audio API
 * Generates natural, procedural songbird calls (sweet chirps, warbles, and melodic trills)
 * for the daylight enchanted garden retreat.
 * Fully autonomous, zero network dependency, customizable volume.
 */

export class AmbientBirdsongEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private isEnabled: boolean = true;
  private isMuted: boolean = false;
  private volume: number = 0.35;
  private isDaylight: boolean = true;
  private timerId: number | null = null;
  private isRunning: boolean = false;
  private lastKissTime: number = 0;

  constructor() {
    // Read persisted birdsong preferences from localStorage
    try {
      const savedEnabled = localStorage.getItem('hny_birdsong_enabled');
      if (savedEnabled !== null) {
        this.isEnabled = savedEnabled === 'true';
      }
      const savedVol = localStorage.getItem('hny_birdsong_volume');
      if (savedVol !== null) {
        const parsed = parseFloat(savedVol);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
          this.volume = parsed;
        }
      }
    } catch {
      // Ignore storage errors
    }
  }

  private initAudio() {
    if (!this.ctx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;

      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();

      // Gentle bandpass filter to shape natural bird frequencies (2.5kHz - 6.5kHz)
      this.filterNode = this.ctx.createBiquadFilter();
      this.filterNode.type = 'bandpass';
      this.filterNode.frequency.setValueAtTime(3800, this.ctx.currentTime);
      this.filterNode.Q.setValueAtTime(1.2, this.ctx.currentTime);

      this.masterGain.gain.setValueAtTime(
        this.isMuted || !this.isEnabled ? 0 : this.volume * 0.45,
        this.ctx.currentTime
      );

      this.filterNode.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setLightingMode(mode: string) {
    const wasDaylight = this.isDaylight;
    this.isDaylight = mode === 'daylight';

    if (this.isDaylight && !wasDaylight) {
      // Switched into daylight: resume soft birdsong after gentle delay
      if (this.isRunning) {
        this.scheduleNextChirp(1200);
      }
    } else if (!this.isDaylight && wasDaylight) {
      // Switched away from daylight: gently stop
      this.stopTimer();
    }
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    localStorage.setItem('hny_birdsong_enabled', String(enabled));
    this.updateGain();

    if (enabled && this.isDaylight && this.isRunning) {
      this.scheduleNextChirp(800);
    } else if (!enabled) {
      this.stopTimer();
    }
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    localStorage.setItem('hny_birdsong_volume', String(this.volume));
    this.updateGain();
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    this.updateGain();
  }

  public getVolume(): number {
    return this.volume;
  }

  public getIsEnabled(): boolean {
    return this.isEnabled;
  }

  private updateGain() {
    if (this.masterGain && this.ctx) {
      const targetGain =
        this.isMuted || !this.isEnabled ? 0 : this.volume * 0.45;
      this.masterGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.15);
    }
  }

  public start() {
    this.isRunning = true;
    this.initAudio();
    if (this.isDaylight && this.isEnabled) {
      this.scheduleNextChirp(1500);
    }
  }

  public pause() {
    this.stopTimer();
  }

  private stopTimer() {
    if (this.timerId !== null) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  private scheduleNextChirp(delayMs?: number) {
    this.stopTimer();
    if (!this.isRunning || !this.isDaylight || !this.isEnabled) return;

    // Natural randomized pauses between songbird phrases (3 to 7 seconds)
    const delay = delayMs !== undefined ? delayMs : 3200 + Math.random() * 4500;

    this.timerId = window.setTimeout(() => {
      this.playRandomBirdsongPhrase();
      // Chance of a quick answering reply call from another bird in the garden
      if (Math.random() < 0.4) {
        window.setTimeout(() => {
          if (this.isRunning && this.isDaylight && this.isEnabled) {
            this.playRandomBirdsongPhrase(true);
          }
        }, 750 + Math.random() * 400);
      }
      this.scheduleNextChirp();
    }, delay);
  }

  /**
   * Synthesize natural songbird acoustic notes
   */
  private playChirpNote(
    startFreq: number,
    endFreq: number,
    duration: number,
    delayOffset: number = 0,
    peakGain: number = 0.28,
    panX: number = 0
  ) {
    if (!this.ctx || !this.filterNode) return;

    const startTime = this.ctx.currentTime + delayOffset;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Use sine wave with subtle FM-like clarity for bird whistle
    osc.type = 'sine';
    osc.frequency.setValueAtTime(startFreq, startTime);
    // Smooth natural pitch curve
    osc.frequency.exponentialRampToValueAtTime(Math.max(100, endFreq), startTime + duration);

    // Natural attack and decay envelope
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(peakGain, startTime + duration * 0.18);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    // Optional stereo spatial panner
    if ('createStereoPanner' in this.ctx) {
      const panner = this.ctx.createStereoPanner();
      panner.pan.setValueAtTime(Math.max(-0.8, Math.min(0.8, panX)), startTime);
      osc.connect(gain);
      gain.connect(panner);
      panner.connect(this.filterNode);
    } else {
      osc.connect(gain);
      gain.connect(this.filterNode);
    }

    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
  }

  /**
   * Plays a randomized songbird phrase
   */
  public playRandomBirdsongPhrase(isReply: boolean = false) {
    this.initAudio();
    if (!this.ctx || !this.filterNode || this.isMuted || !this.isEnabled || this.volume <= 0) return;

    // Randomize bird position in the garden (pan left or right)
    const pan = isReply ? (Math.random() > 0.5 ? 0.45 : -0.45) : (Math.random() - 0.5) * 0.6;
    const baseFreq = (isReply ? 3400 : 3100) + (Math.random() - 0.5) * 400;

    // Choose 1 of 5 melodic songbird patterns
    const phraseType = Math.floor(Math.random() * 5);

    switch (phraseType) {
      case 0: {
        // Double Sweet Whistle: "Peep... Peep!"
        this.playChirpNote(baseFreq, baseFreq * 1.35, 0.09, 0, 0.32, pan);
        this.playChirpNote(baseFreq * 1.05, baseFreq * 1.45, 0.11, 0.13, 0.35, pan);
        break;
      }
      case 1: {
        // Melodic Trill: 4 micro-chirps
        for (let i = 0; i < 4; i++) {
          const chirpFreq = baseFreq * (1 + (i % 2) * 0.15 + (Math.random() - 0.5) * 0.08);
          this.playChirpNote(chirpFreq, chirpFreq * 1.25, 0.055, i * 0.075, 0.25, pan);
        }
        break;
      }
      case 2: {
        // Robin Sunset/Morning Warble: High-low-high flourish
        this.playChirpNote(baseFreq * 1.3, baseFreq * 0.95, 0.1, 0, 0.28, pan);
        this.playChirpNote(baseFreq * 0.95, baseFreq * 1.4, 0.12, 0.12, 0.34, pan);
        this.playChirpNote(baseFreq * 1.4, baseFreq * 1.6, 0.14, 0.26, 0.3, pan);
        break;
      }
      case 3: {
        // Single Soft Cheep (gentle distant call)
        this.playChirpNote(baseFreq * 1.1, baseFreq * 1.38, 0.085, 0, 0.22, pan);
        break;
      }
      case 4: {
        // Morning Nightingale Pip: Staccato chirp then graceful descending note
        this.playChirpNote(baseFreq * 1.25, baseFreq * 1.5, 0.06, 0, 0.3, pan);
        this.playChirpNote(baseFreq * 1.3, baseFreq * 1.6, 0.06, 0.09, 0.32, pan);
        this.playChirpNote(baseFreq * 1.5, baseFreq * 1.05, 0.15, 0.2, 0.26, pan);
        break;
      }
    }
  }

  /**
   * Preview test chirp for Settings Modal
   */
  public playTestChirp() {
    this.initAudio();
    if (this.masterGain && this.ctx) {
      // Temporarily ensure gain is audible for the test preview
      const previewGain = Math.max(0.12, this.volume * 0.45);
      this.masterGain.gain.setValueAtTime(previewGain, this.ctx.currentTime);
      this.playRandomBirdsongPhrase();
      setTimeout(() => this.updateGain(), 500);
    }
  }

  /**
   * Subtle procedural 'kiss' sound effect (sweet romantic peck / mwah)
   * Plays whenever a user taps the screen to trigger the heart burst cluster.
   * Controlled by the exact same audio volume and mute settings as the birdsong.
   */
  public playKissSound() {
    this.initAudio();
    if (!this.ctx || this.isMuted || !this.isEnabled || this.volume <= 0) return;

    const now = this.ctx.currentTime;
    if (now - this.lastKissTime < 0.08) return;
    this.lastKissTime = now;

    const effVolume = Math.min(1, Math.max(0, this.volume));

    // Master gain for this kiss sound, strictly respecting birdsong volume setting
    const kissMaster = this.ctx.createGain();
    kissMaster.gain.setValueAtTime(effVolume * 0.45, now);
    kissMaster.connect(this.ctx.destination);

    // 1. Lip contact suction sweep (Sine wave with fast upward-downward suction curve)
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'sine';

    // Suction arc: 1900Hz -> 2950Hz in 22ms -> 1300Hz in 65ms
    osc.frequency.setValueAtTime(1900, now);
    osc.frequency.exponentialRampToValueAtTime(2950, now + 0.022);
    osc.frequency.exponentialRampToValueAtTime(1300, now + 0.065);

    oscGain.gain.setValueAtTime(0.0001, now);
    oscGain.gain.linearRampToValueAtTime(0.32, now + 0.016);
    oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);

    osc.connect(oscGain);
    oscGain.connect(kissMaster);
    osc.start(now);
    osc.stop(now + 0.075);

    // 2. Soft airy lip release (Shaped noise burst)
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.08);
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2600, now);
    filter.frequency.exponentialRampToValueAtTime(1900, now + 0.075);
    filter.Q.setValueAtTime(2.2, now);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.0001, now);
    noiseGain.gain.linearRampToValueAtTime(0.24, now + 0.012);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.075);

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(kissMaster);
    whiteNoise.start(now);
    whiteNoise.stop(now + 0.08);

    // 3. Delicate warm acoustic body tone (low formant ~680Hz)
    const bodyOsc = this.ctx.createOscillator();
    const bodyGain = this.ctx.createGain();
    bodyOsc.type = 'triangle';
    bodyOsc.frequency.setValueAtTime(680, now);
    bodyOsc.frequency.exponentialRampToValueAtTime(420, now + 0.04);

    bodyGain.gain.setValueAtTime(0.0001, now);
    bodyGain.gain.linearRampToValueAtTime(0.15, now + 0.01);
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);

    bodyOsc.connect(bodyGain);
    bodyGain.connect(kissMaster);
    bodyOsc.start(now);
    bodyOsc.stop(now + 0.05);
  }
}

export const birdsongAudio = new AmbientBirdsongEngine();
