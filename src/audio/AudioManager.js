// AudioManager — procedural Web Audio API sounds, no external files.
// Module-level singleton: import { audioManager } from './AudioManager.js'

class AudioManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.masterVolume = 0.4;
    this.enabled = true;
    this._ambientOsc = null;
    this._ambientGain = null;
    this._ambientNoiseGain = null; // Pre statický šum
    this._ambientNoiseSource = null;
  }

  init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this.masterVolume;
    this.masterGain.connect(this.ctx.destination);
  }

  setVolume(vol) {
    this.masterVolume = vol;
    if (this.masterGain) this.masterGain.gain.value = vol;
    localStorage.setItem('shadow_guild_volume', vol);
  }

  loadVolume() {
    const saved = localStorage.getItem('shadow_guild_volume');
    if (saved !== null) this.setVolume(parseFloat(saved));
  }

  // ── HELPERS ──────────────────────────────────────────────────────────────────

  // Hlavný helper pre klasické tóny s možnosťou pitch shiftu pre variácie
  _playOsc(freq, type, duration, gainVal, delayMs = 0, pitchShift = 0) {
    if (!this.ctx || !this.enabled) return;
    const play = () => {
      const finalFreq = freq * (1 + pitchShift);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.type = type;
      osc.frequency.setValueAtTime(finalFreq, this.ctx.currentTime);
      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    };
    if (delayMs > 0) setTimeout(play, delayMs);
    else play();
  }

  _playNoise(duration, gainVal, delayMs = 0) {
    if (!this.ctx || !this.enabled) return;
    const play = () => {
      const bufferSize = Math.floor(this.ctx.sampleRate * duration);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
      source.connect(gain);
      gain.connect(this.masterGain);
      source.start();
    };
    if (delayMs > 0) setTimeout(play, delayMs);
    else play();
  }

  // Filtered Noise for "texture" (steam, static, glitch)
  _playFilteredNoise(duration, gainVal, filterType, freq, delayMs = 0) {
    if (!this.ctx || !this.enabled) return;
    const play = () => {
      const bufferSize = Math.floor(this.ctx.sampleRate * duration);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      
      const filter = this.ctx.createBiquadFilter();
      filter.type = filterType;
      filter.frequency.value = freq;
      
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
      
      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      source.start();
    };
    if (delayMs > 0) setTimeout(play, delayMs);
    else play();
  }

  // ── BOOT / INTRO SOUNDS ───────────────────────────────────────────────────────

  bootBeep() {
    // Viac "terminálový" pípnutí
    this._playOsc(880, 'sine', 0.05, 0.08);
    this._playFilteredNoise(0.05, 0.04, 'highpass', 3000);
  }

  zeroLine() {
    // "Hlas" stroja - Distorted hum
    this._playOsc(150, 'sawtooth', 0.7, 0.08);
    this._playOsc(155, 'sawtooth', 0.7, 0.06); // Mierne rozladene pre "chorus"
    this._playFilteredNoise(0.5, 0.03, 'bandpass', 500);
  }

  beginClick() {
    // C-E-G chord (C Major)
    const base = 523;
    this._playOsc(base, 'sine', 0.12, 0.15);
    this._playOsc(base * 1.25, 'sine', 0.12, 0.12, 50);
    this._playOsc(base * 1.5, 'sine', 0.15, 0.18, 100);
    this._playFilteredNoise(0.1, 0.05, 'lowpass', 1000, 120);
  }

  // ── ACTION SOUNDS ─────────────────────────────────────────────────────────────

  siphonSuccess() {
    // "Data burst" - rýchly arpeggio + static
    const randShift = (Math.random() - 0.5) * 0.1; // ±5% pitch variation
    this._playOsc(900 * (1 + randShift), 'square', 0.04, 0.1);
    this._playOsc(1200 * (1 + randShift), 'square', 0.04, 0.08, 30);
    this._playOsc(1600 * (1 + randShift), 'triangle', 0.06, 0.06, 60);
    this._playFilteredNoise(0.08, 0.03, 'highpass', 4000);
  }

  siphonFail() {
    // "Connection broken"
    this._playFilteredNoise(0.15, 0.1, 'bandpass', 1000);
    this._playOsc(200, 'sawtooth', 0.15, 0.08, 50);
    this._playOsc(150, 'sawtooth', 0.1, 0.05, 100);
  }

  upgrade() {
    // Majestátne "System Evolved"
    const base = 440;
    this._playOsc(base, 'triangle', 0.1, 0.1);
    this._playOsc(base * 1.5, 'triangle', 0.1, 0.15, 80);
    this._playOsc(base * 2, 'triangle', 0.15, 0.2, 160);
    this._playFilteredNoise(0.2, 0.05, 'lowpass', 800, 200);
  }

  sell() {
    // "Credits transferred"
    this._playOsc(600, 'sine', 0.08, 0.12);
    this._playOsc(800, 'sine', 0.06, 0.1, 40);
  }

  achievement() {
    // "Fanfare" - C E G C
    const notes = [523, 659, 784, 1047];
    notes.forEach((f, i) => {
      this._playOsc(f, 'sine', 0.15, 0.15, i * 100);
      this._playOsc(f * 2, 'sine', 0.1, 0.05, i * 100); // Octave overtone
    });
  }

  zeroMessage() {
    // Deep distorted hum
    this._playOsc(160, 'sawtooth', 0.35, 0.07);
    this._playOsc(165, 'sawtooth', 0.35, 0.05); // Phasing
  }

  bustedSound() {
    // CRITICAL FAILURE
    this._playOsc(300, 'sawtooth', 0.3, 0.2);
    this._playOsc(150, 'sawtooth', 0.3, 0.2);
    this._playOsc(50, 'sine', 0.5, 0.15);
    this._playFilteredNoise(0.4, 0.1, 'lowpass', 500); // Heavy rumble
  }

  raidWarning() {
    // Air raid siren
    [0, 400, 800].forEach(delay => {
      this._playOsc(180, 'square', 0.25, 0.15, delay);
      this._playFilteredNoise(0.2, 0.05, 'bandpass', 800, delay);
    });
  }

  // ── GAME ACTION SOUNDS ────────────────────────────────────────────────────────

  layLow() {
    // Shutting down
    this._playOsc(400, 'sine', 0.3, 0.12);
    this._playOsc(200, 'sine', 0.4, 0.08, 150);
    this._playFilteredNoise(0.4, 0.04, 'lowpass', 400, 200);
  }

  manualCool() {
    // Steam vent
    this._playFilteredNoise(0.12, 0.1, 'highpass', 3000);
    this._playOsc(500, 'sine', 0.1, 0.08, 40);
  }

  darkMarket() {
    // Secret handshake
    this._playOsc(200, 'triangle', 0.15, 0.1);
    this._playOsc(300, 'triangle', 0.15, 0.08, 80);
    this._playFilteredNoise(0.1, 0.02, 'bandpass', 1000);
  }

  barter() {
    // Digital chime
    this._playOsc(500, 'sine', 0.1, 0.1);
    this._playOsc(600, 'sine', 0.1, 0.08);
  }

  decrypt() {
    // Data unlock
    [400, 500, 600, 800].forEach((f, i) =>
      this._playOsc(f, 'square', 0.08, 0.1, i * 50)
    );
  }

  prestige() {
    // "Awakening" - Ascending sweep
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1000, this.ctx.currentTime + 0.5);
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.8);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.8);
    
    this._playFilteredNoise(0.5, 0.06, 'bandpass', 1000);
  }

  deployRunner() {
    // "Sending"
    this._playOsc(500, 'square', 0.05, 0.1);
    this._playOsc(700, 'square', 0.05, 0.08, 50);
    this._playFilteredNoise(0.1, 0.03, 'highpass', 2000);
  }

  maintainNode() {
    // Signal repair
    this._playOsc(350, 'sine', 0.1, 0.1);
    this._playOsc(450, 'sine', 0.1, 0.08, 60);
    this._playFilteredNoise(0.05, 0.02, 'lowpass', 500);
  }

  severConnection() {
    if (!this.ctx || !this.enabled) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(500, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.3);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
    this._playNoise(0.1, 0.05);
  }

  overclock() {
    // Danger boost
    this._playOsc(800, 'sawtooth', 0.06, 0.15);
    this._playOsc(1000, 'sawtooth', 0.06, 0.15, 30);
    this._playOsc(1200, 'sawtooth', 0.06, 0.15, 60);
    this._playFilteredNoise(0.1, 0.05, 'bandpass', 2000);
  }

  tab() {
    // Subtle click
    this._playFilteredNoise(0.02, 0.05, 'highpass', 5000);
  }

  error() {
    this._playOsc(200, 'sawtooth', 0.2, 0.12);
    this._playOsc(205, 'sawtooth', 0.2, 0.10); // Dissonance
  }

  nodeCapture() {
    // Fanfare short
    [500, 600, 750, 1000].forEach((f, i) =>
      this._playOsc(f, 'sine', 0.12, 0.15, i * 60)
    );
  }

  secureNode() {
    // Counter-measure
    this._playOsc(300, 'square', 0.06, 0.1);
    this._playOsc(450, 'square', 0.06, 0.1, 60);
    this._playOsc(600, 'square', 0.06, 0.1, 120);
    this._playFilteredNoise(0.08, 0.03, 'highpass', 3000);
  }

  purgeLogs() {
    // Data wipe
    this._playFilteredNoise(0.15, 0.1, 'lowpass', 800);
    this._playOsc(150, 'sawtooth', 0.3, 0.1, 50);
    this._playFilteredNoise(0.08, 0.06, 'highpass', 4000, 200);
  }

  counterHack() {
    // Aggressive burst
    this._playOsc(1000, 'sawtooth', 0.08, 0.18);
    this._playOsc(800, 'sawtooth', 0.08, 0.16, 50);
    this._playOsc(400, 'sawtooth', 0.08, 0.14, 100);
    this._playNoise(0.15, 0.08, 150);
  }

  healAgent() {
    // Soft repair
    this._playOsc(500, 'sine', 0.12, 0.1);
    this._playOsc(600, 'sine', 0.12, 0.08, 80);
  }

  assignTraining() {
    // UI confirm
    this._playOsc(350, 'square', 0.05, 0.08);
    this._playOsc(450, 'square', 0.05, 0.08, 50);
  }

  stopTraining() {
    this._playOsc(450, 'sine', 0.1, 0.08);
    this._playOsc(350, 'sine', 0.1, 0.06, 60);
  }

  setRunnerSpec() {
    // Doctrine locked
    [400, 600, 800].forEach((f, i) =>
      this._playOsc(f, 'square', 0.07, 0.12, i * 50)
    );
  }

  executeLastStand() {
    // PANIC
    this._playNoise(0.1, 0.12);
    [800, 600, 400, 200].forEach((f, i) =>
      this._playOsc(f, 'sawtooth', 0.15, 0.2, 60 + i * 80)
    );
  }

  systemWakeup() {
    this._playOsc(200, 'sine', 0.1, 0.1);
    this._playOsc(400, 'sine', 0.1, 0.15, 50);
    this._playOsc(600, 'sine', 0.15, 0.2, 100);
    this._playFilteredNoise(0.1, 0.03, 'highpass', 2000);
  }

  // Načítanie dát (Import, Offline Report)
  dataLoad() {
    this._playOsc(400, 'square', 0.05, 0.08);
    this._playOsc(600, 'square', 0.05, 0.08, 40);
    this._playOsc(800, 'square', 0.05, 0.08, 80);
    this._playFilteredNoise(0.1, 0.04, 'bandpass', 1000);
  }

  // Denný bonus (odmena)
  dailyBonus() {
    // Krátka melódia "fanfára"
    [523, 659, 784, 1047].forEach((f, i) =>
      this._playOsc(f, 'sine', 0.12, 0.15, i * 60)
    );
  }

  // Tvrdo reset (vymazanie)
  hardReset() {
    this._playNoise(0.3, 0.2);
    this._playOsc(200, 'sawtooth', 0.2, 0.15);
    this._playOsc(100, 'sawtooth', 0.2, 0.2, 150);
  }

  // Zrušenie akcie (Abort)
  abort() {
    this._playOsc(400, 'sine', 0.1, 0.1);
    this._playOsc(300, 'sine', 0.1, 0.1, 60);
  }

  // ── AMBIENT ───────────────────────────────────────────────────────────────────

  startAmbient() {
    if (!this.ctx || !this.enabled || this._ambientOsc) return;

    // 1. LOW HUM (Base)
    this._ambientOsc = this.ctx.createOscillator();
    this._ambientGain = this.ctx.createGain();
    this._ambientOsc.type = 'sine';
    this._ambientOsc.frequency.value = 55; // Low A
    this._ambientGain.gain.value = 0;
    this._ambientOsc.connect(this._ambientGain);
    this._ambientGain.connect(this.masterGain);
    this._ambientOsc.start();

    // 2. STATIC NOISE (Texture)
    const bufferSize = 2 * this.ctx.sampleRate; // 2 seconds of noise
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    
    this._ambientNoiseSource = this.ctx.createBufferSource();
    this._ambientNoiseSource.buffer = noiseBuffer;
    this._ambientNoiseSource.loop = true;
    
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.value = 400; // Muffled static
    
    this._ambientNoiseGain = this.ctx.createGain();
    this._ambientNoiseGain.gain.value = 0;
    
    this._ambientNoiseSource.connect(noiseFilter);
    noiseFilter.connect(this._ambientNoiseGain);
    this._ambientNoiseGain.connect(this.masterGain);
    this._ambientNoiseSource.start();
  }

  setAmbientIntensity(heat) {
    if (!this._ambientGain || !this._ambientNoiseGain || !this.ctx) return;

    // Hum Volume
    let humVol = 0;
    if (heat < 30) humVol = 0.010;
    else if (heat < 80) humVol = 0.010 + (heat - 30) * ((0.04 - 0.010) / 50);
    else humVol = 0.04 + (heat - 80) * ((0.06 - 0.04) / 20);
    
    // Static Volume (starts appearing at 50 heat)
    let staticVol = 0;
    if (heat > 50) staticVol = (heat - 50) / 50 * 0.015; 

    // Pitch modulation (tension)
    const pitchMod = heat / 100 * 10; // Slight pitch rise

    this._ambientGain.gain.setTargetAtTime(Math.min(0.06, humVol), this.ctx.currentTime, 3);
    this._ambientNoiseGain.gain.setTargetAtTime(Math.min(0.015, staticVol), this.ctx.currentTime, 3);
    
    if(this._ambientOsc) {
      this._ambientOsc.detune.setTargetAtTime(pitchMod, this.ctx.currentTime, 2); // Detune cents
    }
  }
}

export const audioManager = new AudioManager();