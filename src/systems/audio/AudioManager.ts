export class AudioManager {
  private ctx: AudioContext;
  private masterGain: GainNode;

  private engineOsc?: OscillatorNode;
  private engineGain?: GainNode;
  private engineFilter?: BiquadFilterNode;

  private driftNoise?: AudioBufferSourceNode;
  private driftGain?: GainNode;
  private driftFilter?: BiquadFilterNode;
  private driftActive = false;

  private resumed = false;

  constructor() {
    const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AC();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.2;
    this.masterGain.connect(this.ctx.destination);
    this.setupEngine();
    this.setupDrift();
  }

  resumeOnUserGesture() {
    if (this.resumed) return;
    const resume = async () => {
      try { await this.ctx.resume(); this.resumed = true; } catch {}
      window.removeEventListener('pointerdown', resume);
      window.removeEventListener('keydown', resume);
    };
    window.addEventListener('pointerdown', resume);
    window.addEventListener('keydown', resume);
  }

  private setupEngine() {
    this.engineOsc = this.ctx.createOscillator();
    this.engineOsc.type = 'sawtooth';
    this.engineGain = this.ctx.createGain();
    this.engineGain.gain.value = 0.0;
    this.engineFilter = this.ctx.createBiquadFilter();
    this.engineFilter.type = 'lowpass';
    this.engineFilter.frequency.value = 800;
    this.engineOsc.connect(this.engineFilter);
    this.engineFilter.connect(this.engineGain);
    this.engineGain.connect(this.masterGain);
    this.engineOsc.start();
  }

  private setupDrift() {
    const size = 2 * this.ctx.sampleRate;
    const buffer = this.ctx.createBuffer(1, size, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < size; i++) data[i] = Math.random() * 2 - 1;
    this.driftNoise = this.ctx.createBufferSource();
    this.driftNoise.buffer = buffer;
    this.driftNoise.loop = true;
    this.driftFilter = this.ctx.createBiquadFilter();
    this.driftFilter.type = 'bandpass';
    this.driftFilter.frequency.value = 500;
    this.driftFilter.Q.value = 0.6;
    this.driftGain = this.ctx.createGain();
    this.driftGain.gain.value = 0.0;
    this.driftNoise.connect(this.driftFilter);
    this.driftFilter.connect(this.driftGain);
    this.driftGain.connect(this.masterGain);
    this.driftNoise.start();
  }

  updateEngine(normalizedSpeed: number) {
    if (!this.engineOsc || !this.engineGain || !this.engineFilter) return;
    const clamped = Math.max(0, Math.min(1, normalizedSpeed));
    const freq = 40 + clamped * 140; // 40..180 Hz
    const gain = 0.02 + clamped * 0.18;
    const filter = 800 + clamped * 2000;
    this.engineOsc.frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.02);
    this.engineGain.gain.setTargetAtTime(gain, this.ctx.currentTime, 0.05);
    this.engineFilter.frequency.setTargetAtTime(filter, this.ctx.currentTime, 0.05);
  }

  updateDrift(active: boolean) {
    if (!this.driftGain) return;
    if (active && !this.driftActive) this.driftActive = true;
    if (!active && this.driftActive) this.driftActive = false;
    const target = active ? 0.25 : 0.0;
    this.driftGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.05);
  }

  triggerBoost() {
    // Whoosh: short noise burst through highpass filter
    const src = this.ctx.createBufferSource();
    const size = 0.4 * this.ctx.sampleRate;
    const buffer = this.ctx.createBuffer(1, size, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < size; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / size);
    src.buffer = buffer;
    const hp = this.ctx.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 1200;
    const g = this.ctx.createGain(); g.gain.value = 0.4;
    src.connect(hp); hp.connect(g); g.connect(this.masterGain);
    src.start();
  }
}


