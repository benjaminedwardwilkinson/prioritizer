/**
 * Web Audio API Sound Synthesizer for Prioritizer
 * Zero external audio files required. Completely standalone, works offline,
 * respects user mute setting, and handles browser autoplay gracefully.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private hasInteracted: boolean = false;

  constructor() {
    // Check local storage for sound preference
    const saved = typeof window !== 'undefined' ? localStorage.getItem('prioritizer_sound_muted') : null;
    this.isMuted = saved === 'true';
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public enableAudioOnFirstTouch() {
    if (!this.hasInteracted) {
      this.hasInteracted = true;
      this.initCtx();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('prioritizer_sound_muted', String(this.isMuted));
    }
    if (!this.isMuted) {
      this.initCtx();
      this.playChime(523.25, 'sine', 0.15); // soft confirm
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Star Trek LCARS Console Chirp / Touch Beep
   */
  public playLcarsBeep() {
    this.haptic(12);
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    // Classic 1760 Hz to 2200 Hz LCARS interface touch chirp
    osc.frequency.setValueAtTime(1760, t);
    osc.frequency.setValueAtTime(2217.46, t + 0.035);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.09, t + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.075);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.08);
  }

  /**
   * Starfleet LCARS Command Acknowledged chime
   */
  public playLcarsConfirm() {
    this.haptic([15, 25]);
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = [1046.5, 1318.51, 1567.98]; // C6 - E6 - G6 Starfleet tricorder triple acknowledge

    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const delay = idx * 0.045;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + delay);

      gain.gain.setValueAtTime(0.001, t + delay);
      gain.gain.linearRampToValueAtTime(0.08, t + delay + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + delay + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t + delay);
      osc.stop(t + delay + 0.22);
    });
  }

  /**
   * Starfleet LCARS Tricorder Scanning Sweep
   */
  public playLcarsScan() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.linearRampToValueAtTime(1480, t + 0.12);
    osc.frequency.linearRampToValueAtTime(660, t + 0.24);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.06, t + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.26);
  }

  /**
   * Satisfying Nintendo Coin chime (B-ling!)
   */
  public playCoin() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(987.77, t); // B5
    osc1.frequency.setValueAtTime(1318.51, t + 0.08); // E6

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(987.77 * 2, t);
    osc2.frequency.setValueAtTime(1318.51 * 2, t + 0.08);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.setValueAtTime(0.12, t + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.46);
    osc2.stop(t + 0.46);
  }

  /**
   * Nintendo Boing / Jump sound
   */
  public playBoing() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(660, t + 0.15);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.linearRampToValueAtTime(0.08, t + 0.12);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.26);
  }

  /**
   * Nintendo Stamp / Block Lock (Thump-Click)
   */
  public playStampLock() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Low thud
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.12);
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.13);

    // High snap click
    const clickOsc = this.ctx.createOscillator();
    const clickGain = this.ctx.createGain();
    clickOsc.type = 'square';
    clickOsc.frequency.setValueAtTime(1200, t);
    clickGain.gain.setValueAtTime(0.08, t);
    clickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    clickOsc.connect(clickGain);
    clickGain.connect(this.ctx.destination);
    clickOsc.start(t);
    clickOsc.stop(t + 0.045);
  }

  /**
   * Satisfying card click for quiz selections
   */
  public playCardSelect() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(540, t + 0.08);

    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.09);
  }

  /**
   * Ascending priority sound
   */
  public playAscend() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const notes = [440, 554.37, 659.25];
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const t = this.ctx.currentTime + idx * 0.06;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.06, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.13);
    });
  }

  /**
   * Priority lock / confirmation chord
   */
  public playLockConfirm() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const chord = [261.63, 329.63, 392.00, 523.25]; // C Major
    const t = this.ctx.currentTime;

    chord.forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      const delay = i * 0.04;
      gain.gain.setValueAtTime(0.001, t + delay);
      gain.gain.linearRampToValueAtTime(0.08, t + delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + delay + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t + delay);
      osc.stop(t + delay + 0.65);
    });
  }

  /**
   * Major reveal payoff chord (triumphant cosmic chord)
   */
  public playBigReveal() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const arpeggio = [220, 277.18, 329.63, 440, 554.37, 659.25, 880]; // A Major lush
    const t = this.ctx.currentTime;

    arpeggio.forEach((freq, idx) => {
      if (!this.ctx) return;
      const delay = idx * 0.07;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + delay);

      gain.gain.setValueAtTime(0.01, t + delay);
      gain.gain.linearRampToValueAtTime(0.12, t + delay + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + delay + 1.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t + delay);
      osc.stop(t + delay + 1.25);
    });
  }

  /**
   * Achievement unlock fanfare
   */
  public playAchievement() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const notes = [
      { f: 523.25, d: 0.1 },  // C5
      { f: 659.25, d: 0.1 },  // E5
      { f: 783.99, d: 0.12 }, // G5
      { f: 1046.5, d: 0.35 }, // C6
    ];

    let offset = 0;
    const t = this.ctx.currentTime;

    notes.forEach((item) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(item.f, t + offset);

      gain.gain.setValueAtTime(0.001, t + offset);
      gain.gain.linearRampToValueAtTime(0.12, t + offset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + offset + item.d);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t + offset);
      osc.stop(t + offset + item.d + 0.02);

      offset += item.d * 0.85;
    });
  }

  /**
   * Interactive object chime (e.g. Celestial planet tap)
   */
  public playChime(freq: number = 440, type: OscillatorType = 'sine', duration: number = 0.4) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);

    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + duration);
  }

  /**
   * Subtle tick for sliders / drag reordering
   */
  public playTick() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(800, t);
    gain.gain.setValueAtTime(0.02, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.035);
  }

  /**
   * Smooth whoosh for slide transitions / card drags
   */
  public playWhoosh() {
    this.haptic(10);
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(620, t + 0.08);
    osc.frequency.exponentialRampToValueAtTime(120, t + 0.16);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.06, t + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.19);
  }

  /**
   * Multi-stage level up celebration fanfare
   */
  public playLevelUp() {
    this.haptic([30, 60, 30, 90]);
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const notes = [392, 523.25, 659.25, 783.99, 1046.5]; // G4, C5, E5, G5, C6
    const t = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const delay = idx * 0.08;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + delay);

      const dur = idx === notes.length - 1 ? 0.6 : 0.14;
      gain.gain.setValueAtTime(0.001, t + delay);
      gain.gain.linearRampToValueAtTime(0.12, t + delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + delay + dur);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t + delay);
      osc.stop(t + delay + dur + 0.02);
    });
  }

  /**
   * Pitch-increasing combo feedback (e.g. for sequential card ranking)
   */
  public playCombo(step: number = 1) {
    this.haptic(15);
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const baseFreqs = [330, 392, 440, 523, 659, 784];
    const freq = baseFreqs[Math.min(step - 1, baseFreqs.length - 1)] || 440;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.25, t + 0.08);

    gain.gain.setValueAtTime(0.09, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.13);
  }

  /**
   * Game error / mismatch buzz
   */
  public playBuzz() {
    this.haptic([50, 40, 50]);
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(130, t);
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(138, t); // Dissonant minor second beat

    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.23);
    osc2.stop(t + 0.23);
  }

  /**
   * Trigger mobile haptic vibration if supported by device browser
   */
  public haptic(pattern: number | number[] = 20) {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Ignore if restricted by browser policy
      }
    }
  }
}

export const sound = new SoundEngine();
