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
    this._ambientNoiseGain = null; 
    this._ambientNoiseSource = null;
    this._ambientNoiseFilter = null; // Pridané pre dynamic state-driven filter
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
      filter.Q.value = 1.5; // Ostrší rez pre kybernetický "sterilný" šum
      
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
    // Čistý, presný systémový pulse
    this._playOsc(1400, 'sine', 0.04, 0.06);
    this._playOsc(2800, 'sine', 0.02, 0.03, 30);
    this._playFilteredNoise(0.03, 0.02, 'highpass', 6000);
  }

  zeroLine() {
    // Sterilný AI hlas - čistý rozladný phase effect
    this._playOsc(120, 'sine', 0.8, 0.06);
    this._playOsc(120.5, 'sine', 0.8, 0.06); // Mikro-rozladenie pre "phasing"
    this._playFilteredNoise(0.6, 0.015, 'bandpass', 2200); // Vyrezaný dátový šum
  }

  beginClick() {
    // Presnýamber akcent - čistá matematika (Root + 5th + Octave)
    const base = 440;
    this._playOsc(base, 'sine', 0.08, 0.12);
    this._playOsc(base * 1.5, 'sine', 0.08, 0.1, 40);
    this._playOsc(base * 2, 'sine', 0.12, 0.14, 80);
    this._playFilteredNoise(0.05, 0.03, 'highpass', 5000, 90);
  }

  // ── ACTION SOUNDS ─────────────────────────────────────────────────────────────

  siphonSuccess() {
    // Cyan dátový stream - rýchly, ostrý arpeggio
    const randShift = (Math.random() - 0.5) * 0.05;
    this._playOsc(1200 * (1 + randShift), 'square', 0.03, 0.06);
    this._playOsc(1800 * (1 + randShift), 'square', 0.03, 0.05, 25);
    this._playOsc(2400 * (1 + randShift), 'triangle', 0.04, 0.04, 50);
    this._playFilteredNoise(0.06, 0.02, 'highpass', 6000);
  }

  siphonFail() {
    // Červený disconnect - ostrý rez
    this._playFilteredNoise(0.1, 0.08, 'bandpass', 2500);
    this._playOsc(300, 'sawtooth', 0.1, 0.06, 30);
    this._playOsc(150, 'square', 0.08, 0.04, 80);
  }

  upgrade() {
    // Amber systémová evolúcia - čistý, rozšírený akord
    const base = 330;
    this._playOsc(base, 'triangle', 0.08, 0.08);
    this._playOsc(base * 1.5, 'triangle', 0.08, 0.1, 60);
    this._playOsc(base * 2, 'sine', 0.12, 0.14, 120);
    this._playFilteredNoise(0.12, 0.02, 'highpass', 4000, 150);
  }

  upgradeReveal() {
    // Cyan systémový odkryv - "Scan & Unveil"
    // Ostrý inicializačný pulse
    this._playOsc(1800, 'sine', 0.04, 0.06);
    
    // Otvorený, širší akord (Base -> 5th -> 9th / 2-oktávový skok) pre pocex "odkrytia"
    const base = 440;
    this._playOsc(base, 'triangle', 0.1, 0.08, 40);
    this._playOsc(base * 1.5, 'triangle', 0.1, 0.1, 80); 
    this._playOsc(base * 2.25, 'sine', 0.15, 0.12, 140); 
    
    // Jemný dátový "fľak" namiesto highpassu - znie to ako rozbalenie UI
    this._playFilteredNoise(0.15, 0.03, 'bandpass', 3500, 180);
  }

  sell() {
    // Credits transferred - krátky amber pulse
    this._playOsc(800, 'sine', 0.05, 0.1);
    this._playOsc(1200, 'sine', 0.04, 0.08, 30);
  }

  achievement() {
    // Protokol odomknutý - sus2 akord (žiadny "happy" C dur, len čistý kyber akord)
    const notes = [440, 523.25, 660, 880]; // A C# E A - minimalistický, otvorený zvuk
    notes.forEach((f, i) => {
      this._playOsc(f, 'sine', 0.12, 0.1, i * 80);
      this._playOsc(f * 2, 'sine', 0.08, 0.03, i * 80); // Jemný overtone
    });
  }

  zeroMessage() {
    // Purple AI komunikácia - hlboký, rezonanný priestor
    this._playOsc(80, 'sine', 0.4, 0.06);
    this._playOsc(80.25, 'sine', 0.4, 0.05); // Phasing
    this._playOsc(1600, 'sine', 0.15, 0.02, 100); // Vysoký digitálny stopa
  }

  bustedSound() {
    // CRITICAL - Červený overload
    this._playOsc(60, 'sawtooth', 0.4, 0.15);
    this._playOsc(55, 'square', 0.4, 0.1);
    this._playFilteredNoise(0.3, 0.08, 'lowpass', 300); // Hlboký tlakový rumble
    this._playOsc(800, 'square', 0.1, 0.08, 50);
  }

  raidWarning() {
    // Systémový alert - sterilná siréna
    [0, 300, 600].forEach(delay => {
      this._playOsc(800, 'square', 0.12, 0.08, delay);
      this._playOsc(600, 'square', 0.12, 0.08, delay + 150);
      this._playFilteredNoise(0.1, 0.02, 'bandpass', 3000, delay);
    });
  }

  // ── GAME ACTION SOUNDS ────────────────────────────────────────────────────────

  layLow() {
    // Sleep mode - tichý fade
    this._playOsc(600, 'sine', 0.2, 0.06);
    this._playOsc(300, 'sine', 0.3, 0.04, 100);
    this._playFilteredNoise(0.3, 0.015, 'lowpass', 600, 150);
  }

  manualCool() {
    // Tekutý dusík / vent - vysoký a krátky
    this._playFilteredNoise(0.08, 0.07, 'highpass', 5000);
    this._playOsc(1400, 'sine', 0.06, 0.04, 20);
  }

  darkMarket() {
    // Šifrovaný prenos - skrytý, tlmený
    this._playOsc(200, 'triangle', 0.1, 0.06);
    this._playOsc(450, 'square', 0.05, 0.03, 60);
    this._playFilteredNoise(0.08, 0.01, 'bandpass', 2000);
  }

  barter() {
    // Transakčný potvrď - digitálny kov
    this._playOsc(700, 'sine', 0.05, 0.08);
    this._playOsc(1050, 'sine', 0.04, 0.06, 30);
  }

  decrypt() {
    // Algoritmus beží - rýchle, stúpajúce square kroky
    [800, 1000, 1200, 1600].forEach((f, i) =>
      this._playOsc(f, 'square', 0.04, 0.06, i * 35)
    );
  }

  prestige() {
    // Reset/Evolúcia - čistý nulový sweep
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(100, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(2000, this.ctx.currentTime + 0.4);
    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.6);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.6);
    
    this._playFilteredNoise(0.4, 0.04, 'bandpass', 3000);
  }

  deployRunner() {
    // Deploy packet - ostrý "shot"
    this._playOsc(900, 'square', 0.03, 0.08);
    this._playOsc(1500, 'square', 0.02, 0.06, 30);
    this._playFilteredNoise(0.06, 0.03, 'highpass', 6000);
  }

  maintainNode() {
    // Micro-op - tichá oprava
    this._playOsc(500, 'triangle', 0.06, 0.06);
    this._playOsc(750, 'triangle', 0.06, 0.05, 40);
  }

  severConnection() {
    if (!this.ctx || !this.enabled) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.15);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
    this._playNoise(0.06, 0.04);
  }

  overclock() {
    // Prehrievanie - rýchlo stúpajúca frekvencia
    this._playOsc(800, 'sawtooth', 0.04, 0.08);
    this._playOsc(1200, 'sawtooth', 0.04, 0.08, 20);
    this._playOsc(1800, 'sawtooth', 0.04, 0.08, 40);
    this._playFilteredNoise(0.08, 0.04, 'bandpass', 3000);
  }

  tab() {
    // Nano-click - extrémne minimálny UI zvuk
    this._playFilteredNoise(0.015, 0.04, 'highpass', 8000);
  }

  error() {
    // Dissonance - chýbový stav
    this._playOsc(250, 'square', 0.15, 0.08);
    this._playOsc(254, 'square', 0.15, 0.07); // Ostrý "beating" efekt
  }

  nodeCapture() {
    // Sieťová dominancia - čistá, chladná melódia
    [600, 750, 900, 1200].forEach((f, i) =>
      this._playOsc(f, 'sine', 0.08, 0.1, i * 50)
    );
  }

  secureNode() {
    // Firewall aktívny - pevný, kvadratický
    this._playOsc(200, 'square', 0.04, 0.06);
    this._playOsc(400, 'square', 0.04, 0.06, 40);
    this._playOsc(800, 'square', 0.04, 0.06, 80);
  }

  purgeLogs() {
    // Vymazanie - reverzný sweep
    this._playFilteredNoise(0.12, 0.06, 'highpass', 4000);
    this._playOsc(1200, 'sawtooth', 0.15, 0.06, 40);
    this._playOsc(200, 'sawtooth', 0.1, 0.04, 100);
  }

  counterHack() {
    // Agresívny poplach - reverse arpeggio
    this._playOsc(1800, 'square', 0.04, 0.1);
    this._playOsc(1200, 'square', 0.04, 0.08, 30);
    this._playOsc(600, 'square', 0.06, 0.06, 60);
    this._playNoise(0.08, 0.05, 90);
  }

  healAgent() {
    // Nanite repair - mäkký, pulzujúci
    this._playOsc(600, 'sine', 0.08, 0.06);
    this._playOsc(900, 'sine', 0.08, 0.05, 50);
  }

  assignTraining() {
    // UI Alloc - krátky potvrď
    this._playOsc(400, 'square', 0.03, 0.06);
    this._playOsc(600, 'sine', 0.04, 0.05, 30);
  }

  stopTraining() {
    this._playOsc(600, 'sine', 0.06, 0.05);
    this._playOsc(400, 'sine', 0.06, 0.04, 40);
  }

  setRunnerSpec() {
    // Lock - tríciové kvadratické potvrdenie
    [500, 750, 1000].forEach((f, i) =>
      this._playOsc(f, 'square', 0.04, 0.08, i * 35)
    );
  }

  executeLastStand() {
    // CRITICAL - systémový kolaps
    this._playNoise(0.08, 0.1);
    [1000, 800, 500, 150].forEach((f, i) =>
      this._playOsc(f, 'sawtooth', 0.1, 0.12, 40 + i * 50)
    );
  }

  systemWakeup() {
    // Cold boot - čistý, postupný sync
    this._playOsc(200, 'sine', 0.06, 0.06);
    this._playOsc(400, 'sine', 0.06, 0.08, 40);
    this._playOsc(800, 'sine', 0.08, 0.1, 80);
    this._playFilteredNoise(0.06, 0.02, 'highpass', 6000, 100);
  }

  dataLoad() {
    // Stream - moderný "dial-up" (čistý square)
    this._playOsc(600, 'square', 0.03, 0.06);
    this._playOsc(900, 'square', 0.03, 0.06, 30);
    this._playOsc(1200, 'square', 0.03, 0.06, 60);
    this._playFilteredNoise(0.08, 0.02, 'bandpass', 3000);
  }

  dailyBonus() {
    // Amber reward - čistý, optmistický ale sterile digitálny
    [660, 880, 1100, 1320].forEach((f, i) =>
      this._playOsc(f, 'sine', 0.08, 0.1, i * 50)
    );
  }

  hardReset() {
    // Zničenie - absolútny bianrny kolaps
    this._playNoise(0.2, 0.15);
    this._playOsc(300, 'sawtooth', 0.15, 0.1);
    this._playOsc(80, 'sawtooth', 0.2, 0.12, 100);
  }

  abort() {
    // Zrušenie - zostupný
    this._playOsc(600, 'sine', 0.06, 0.06);
    this._playOsc(400, 'sine', 0.06, 0.06, 40);
  }

  // ── AMBIENT ───────────────────────────────────────────────────────────────────

  startAmbient() {
    if (!this.ctx || !this.enabled || this._ambientOsc) return;

    // 1. Sub-bass server hum (veľmi hlboký, čistý)
    this._ambientOsc = this.ctx.createOscillator();
    this._ambientGain = this.ctx.createGain();
    this._ambientOsc.type = 'sine';
    this._ambientOsc.frequency.value = 45; // Hlboké A
    this._ambientGain.gain.value = 0;
    this._ambientOsc.connect(this._ambientGain);
    this._ambientGain.connect(this.masterGain);
    this._ambientOsc.start();

    // 2. DATA STREAM TEXTURE (Bandpass noise - kybernetický šum dát)
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    
    this._ambientNoiseSource = this.ctx.createBufferSource();
    this._ambientNoiseSource.buffer = noiseBuffer;
    this._ambientNoiseSource.loop = true;
    
    this._ambientNoiseFilter = this.ctx.createBiquadFilter();
    this._ambientNoiseFilter.type = 'bandpass'; // Bandpass pre "dátový tok"
    this._ambientNoiseFilter.frequency.value = 2500; // Stredná vysoká frekvencia (cyan šum)
    this._ambientNoiseFilter.Q.value = 2.0; // Ostrý rez
    
    this._ambientNoiseGain = this.ctx.createGain();
    this._ambientNoiseGain.gain.value = 0;
    
    this._ambientNoiseSource.connect(this._ambientNoiseFilter);
    this._ambientNoiseFilter.connect(this._ambientNoiseGain);
    this._ambientNoiseGain.connect(this.masterGain);
    this._ambientNoiseSource.start();
  }

  setAmbientIntensity(heat) {
    if (!this._ambientGain || !this._ambientNoiseGain || !this.ctx) return;

    // Heat = 0-100
    
    // 1. Sub-bass rastie s heatom (tlak systému)
    let humVol = 0;
    if (heat < 20) humVol = 0.005; // Tichý idle
    else if (heat < 80) humVol = 0.005 + (heat - 20) * ((0.03 - 0.005) / 60);
    else humVol = 0.03 + (heat - 80) * ((0.05 - 0.03) / 20); // Nebezpečný tlak
    
    // 2. Dátový šum (Cyan) - zosilňuje sa a posúva nižšie pri vysokom heate (Red shift)
    let staticVol = 0;
    if (heat > 20) staticVol = (heat - 20) / 80 * 0.012; 

    // Filter shift - pri vysokom heate prechádza cyan šum do červeného (nižšie frekvencie, hrubší šum)
    const filterFreq = 2500 - ((heat / 100) * 1500); // 2500Hz (cold) -> 1000Hz (hot/danger)
    const filterQ = 2.0 + (heat / 100) * 1.5; // Zvýši sa rezonancia pri nebezpečenstve

    // Pitch modulation (detune pre napätie)
    const pitchMod = heat / 100 * 15; // Viac detune pri vysokej záťaži

    this._ambientGain.gain.setTargetAtTime(Math.min(0.05, humVol), this.ctx.currentTime, 3);
    this._ambientNoiseGain.gain.setTargetAtTime(Math.min(0.012, staticVol), this.ctx.currentTime, 3);
    
    if(this._ambientNoiseFilter) {
      this._ambientNoiseFilter.frequency.setTargetAtTime(Math.max(800, filterFreq), this.ctx.currentTime, 2);
      this._ambientNoiseFilter.Q.setTargetAtTime(filterQ, this.ctx.currentTime, 2);
    }

    if(this._ambientOsc) {
      this._ambientOsc.detune.setTargetAtTime(pitchMod, this.ctx.currentTime, 2);
    }
  }
}

export const audioManager = new AudioManager();