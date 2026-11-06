import { S } from './state';

/* Synthesised sound design (no audio assets) and haptics. Everything goes through one
   master bus with a soft compressor so layered cues never clip; `duck()` lowers the
   effects/music bus while narration speaks. */
let AC: AudioContext | null = null;
let MASTER: GainNode | null = null;
let FX: GainNode | null = null;
let NOISE: AudioBuffer | null = null;
/** Bus riêng của cảnh động đang chạy (WAR.open/close): cắt được ngay khi tour sang bước khác. */
let SCN: GainNode | null = null;

/** Lazily create / resume the audio context; call from a user gesture. */
export function ac(): AudioContext | null {
  if (!AC) {
    try {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      AC = new Ctor();
      const comp = AC.createDynamicsCompressor();
      comp.threshold.value = -14;
      comp.ratio.value = 4;
      MASTER = AC.createGain();
      MASTER.gain.value = 0.9;
      FX = AC.createGain();
      FX.connect(MASTER);
      MASTER.connect(comp).connect(AC.destination);
      NOISE = AC.createBuffer(1, AC.sampleRate * 2, AC.sampleRate);
      const ch = NOISE.getChannelData(0);
      for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1;
    } catch { /* no Web Audio */ }
  }
  if (AC && AC.state === 'suspended') AC.resume();
  return AC;
}

/** Output bus for other audio sources (music); null when sound is unavailable. */
export const bus = (): GainNode | null => (ac() ? FX : null);

/** Duck effects/music under narration (`on`) and bring them back afterwards. */
export function duck(on: boolean): void {
  if (!AC || !FX) return;
  const t = AC.currentTime;
  FX.gain.cancelScheduledValues(t);
  FX.gain.setTargetAtTime(on ? 0.35 : 1, t, on ? 0.08 : 0.4);
}

const live = () => { const a = ac(); return a && S.sound && FX ? a : null; };

function env(a: AudioContext, t: number, v: number, att: number, d: number): GainNode {
  const g = a.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(v, t + att);
  g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  return g;
}

function tone(f: number, d: number, type: OscillatorType = 'sine', v = 0.2, delay = 0, f2?: number, dst?: AudioNode): void {
  const a = live();
  if (!a) return;
  const t = a.currentTime + delay;
  const o = a.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(f, t);
  if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d * 0.6);
  o.connect(env(a, t, v, 0.012, d)).connect(dst || FX!);
  o.start(t);
  o.stop(t + d + 0.05);
}

/** Filtered noise burst; `f`→`f2` sweeps the band-pass (whooshes, skin hits, paper). */
function noise(d: number, f: number, f2: number, v: number, q = 0.8, delay = 0, att = 0.01, dst?: AudioNode): void {
  const a = live();
  if (!a || !NOISE) return;
  const t = a.currentTime + delay;
  const s = a.createBufferSource();
  s.buffer = NOISE;
  s.loop = true; // tiếng dài hơn bộ đệm 2 s không bị cụt
  s.playbackRate.value = 0.7 + Math.random() * 0.6;
  const bp = a.createBiquadFilter();
  bp.type = 'bandpass';
  bp.Q.value = q;
  bp.frequency.setValueAtTime(f, t);
  bp.frequency.exponentialRampToValueAtTime(f2, t + d);
  s.connect(bp).connect(env(a, t, v, att, d)).connect(dst || FX!);
  s.start(t, Math.random());
  s.stop(t + d + 0.05);
}

/** Low drum: pitched body dropping in frequency plus a skin transient. */
function drum(delay = 0, v = 0.5, f = 110, dst?: AudioNode): void {
  tone(f, 0.9, 'sine', v, delay, f * 0.45, dst);
  tone(f * 1.5, 0.25, 'triangle', v * 0.25, delay, f * 0.6, dst);
  noise(0.18, 900, 200, v * 0.35, 0.7, delay, 0.002, dst);
}

/** Warm brass-like chord: detuned saws through a closing low-pass. */
function brass(freqs: number[], d: number, v: number, delay = 0): void {
  const a = live();
  if (!a) return;
  const t = a.currentTime + delay;
  const lp = a.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.setValueAtTime(400, t);
  lp.frequency.linearRampToValueAtTime(2400, t + 0.12);
  lp.frequency.exponentialRampToValueAtTime(600, t + d);
  const g = env(a, t, v, 0.06, d);
  lp.connect(g).connect(FX!);
  for (const f of freqs) for (const det of [-7, 7]) {
    const o = a.createOscillator();
    o.type = 'sawtooth';
    o.frequency.value = f;
    o.detune.value = det;
    o.connect(lp);
    o.start(t);
    o.stop(t + d + 0.05);
  }
}

export const SND = {
  /** Era / turning point: taiko roll into a deep gong. */
  gong() { drum(0, 0.45, 70); drum(0.16, 0.35, 74); drum(0.32, 0.55, 64); tone(98, 3.4, 'sine', 0.3, 0.34); tone(147, 2.6, 'sine', 0.1, 0.35); tone(262, 1.4, 'triangle', 0.04, 0.36); },
  chime() { tone(880, 0.6, 'triangle', 0.1); tone(1318, 0.9, 'sine', 0.07, 0.09); },
  ok() { tone(660, 0.3, 'triangle', 0.12); tone(990, 0.45, 'triangle', 0.1, 0.1); },
  no() { tone(150, 0.4, 'sawtooth', 0.05); },
  tick() { tone(1500, 0.035, 'square', 0.022); },
  /** Sheet / overlay sliding in. */
  whoosh() { noise(0.42, 300, 2400, 0.16, 0.9, 0, 0.12); },
  /** Map flight to a new place. */
  fly() { noise(1.1, 200, 1400, 0.1, 0.6, 0, 0.35); },
  /** Decision confirmed: a seal stamped on paper. */
  stamp() { drum(0, 0.6, 90); noise(0.09, 2500, 1200, 0.25, 1.2, 0.01, 0.001); },
  /** Tab / page change. */
  page() { noise(0.16, 1800, 4200, 0.08, 1.4, 0, 0.02); },
  /** Badge earned: short heroic fanfare. */
  fanfare() { brass([196, 294], 0.32, 0.07); brass([262, 392, 523], 1.2, 0.08, 0.2); tone(1046, 1, 'sine', 0.03, 0.25); },
  /** Regime / borders change on the map. */
  shift() { drum(0, 0.32, 55); noise(0.7, 150, 600, 0.1, 0.5, 0, 0.05); },
};

/* ---------- âm thanh chiến trường (cảnh động, scene.ts) ---------- */
/** Low-passed noise burst: the body of an explosion. */
function thud(d: number, f: number, f2: number, v: number, delay = 0): void {
  const a = live();
  if (!a || !NOISE) return;
  const t = a.currentTime + delay;
  const s = a.createBufferSource();
  s.buffer = NOISE;
  s.loop = true;
  s.playbackRate.value = 0.5 + Math.random() * 0.3;
  const lp = a.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.setValueAtTime(f, t);
  lp.frequency.exponentialRampToValueAtTime(f2, t + d);
  s.connect(lp).connect(env(a, t, v, 0.004, d)).connect(SCN || FX!);
  s.start(t, Math.random());
  s.stop(t + d + 0.05);
}

const sc = (): AudioNode => SCN || FX!;

export const WAR = {
  /** Artillery / cannon: transient, body and sub drop; `far` (0–1) softens and darkens it. */
  boom(delay = 0, far = 0) {
    const v = 0.55 * (1 - far * 0.6);
    thud(1.3 + far, 900 - far * 600, 60, v, delay);
    tone(62 - far * 15, 1.1, 'sine', v * 0.7, delay, 28, sc());
    if (far < 0.5) noise(0.06, 3200, 1500, v * 0.4, 1, delay, 0.001, sc());
  },
  /** Rifle / machine-gun fire: scattered short cracks over `d` seconds. */
  crackle(d = 2.5, n = 18, delay = 0) {
    for (let i = 0; i < n; i++) {
      const at = delay + Math.random() * d, burst = Math.random() < 0.3 ? 3 : 1;
      for (let j = 0; j < burst; j++) noise(0.05, 2600 + Math.random() * 1500, 900, 0.05 + Math.random() * 0.06, 1.4, at + j * 0.07, 0.001, sc());
    }
  },
  /** Distant rolling front: a low bed with a few far booms. */
  rumble(d = 5, delay = 0) {
    thud(d, 220, 90, 0.12, delay);
    for (let i = 0; i < 4; i++) WAR.boom(delay + 0.4 + Math.random() * (d - 0.8), 0.8);
  },
  /** Aircraft passing overhead (pitch drops as it passes) and a bomb whistle into a blast. */
  plane(delay = 0) {
    const a = live();
    if (!a) return;
    const t = a.currentTime + delay, d = 3.2;
    const o = a.createOscillator(), lp = a.createBiquadFilter();
    o.type = 'sawtooth'; o.frequency.setValueAtTime(118, t); o.frequency.exponentialRampToValueAtTime(82, t + d);
    lp.type = 'lowpass'; lp.frequency.value = 520;
    o.connect(lp).connect(env(a, t, 0.06, 1.2, d)).connect(sc());
    o.start(t); o.stop(t + d + 0.1);
    noise(d, 300, 700, 0.07, 0.6, delay, 1.1, sc());
  },
  bomb(delay = 0) { tone(1700, 0.9, 'sine', 0.05, delay, 420, sc()); WAR.boom(delay + 0.85, 0.1); },
  /** Sea: slow swells of filtered noise; with the cannons, a naval scene. */
  waves(d = 5, delay = 0) { for (let i = 0; i < 3; i++) noise(1.8, 300, 900, 0.08, 0.5, delay + i * 1.5, 0.7, sc()); void d; },
  /** Crowd / uprising: murmur swell with drums. */
  crowd(delay = 0) { noise(3.5, 400, 900, 0.09, 0.4, delay, 1.2, sc()); drum(delay + 0.3, 0.3, 80, sc()); drum(delay + 0.9, 0.3, 80, sc()); drum(delay + 1.5, 0.35, 76, sc()); },
  /** Treaty: quill scratches, then the seal. */
  quill(delay = 0) { for (let i = 0; i < 5; i++) noise(0.12 + Math.random() * 0.1, 3500, 5200, 0.04, 2, delay + i * 0.17, 0.01, sc()); },
  /** Còi tàu rời bến: hai âm trầm. */
  horn(delay = 0) { tone(110, 1.6, 'sawtooth', 0.05, delay, undefined, sc()); tone(165, 1.6, 'sawtooth', 0.035, delay, undefined, sc()); tone(110, 1.1, 'sawtooth', 0.04, delay + 1.9, undefined, sc()); },
  /** Nhịp hành quân: trống đều. */
  march(n = 8, delay = 0) { for (let i = 0; i < n; i++) drum(delay + i * 0.42, i % 2 ? 0.16 : 0.24, i % 2 ? 120 : 95, sc()); },
  /** Mở bus riêng cho một cảnh (gọi khi cảnh bắt đầu). */
  open() { WAR.close(); const a = live(); if (!a) return; SCN = a.createGain(); SCN.connect(FX!); },
  /** Cắt mọi tiếng của cảnh đang chạy (đã hẹn trước hay chưa): hạ nhanh rồi ngắt bus. */
  close() {
    const g = SCN; SCN = null;
    if (!g || !AC) return;
    g.gain.setTargetAtTime(0, AC.currentTime, 0.05);
    setTimeout(() => { try { g.disconnect(); } catch { /* đã ngắt */ } }, 400);
  },
};

export function buzz(p: number | number[]): void {
  if (S.haptic && navigator.vibrate) {
    try { navigator.vibrate(p); } catch { /* ignore */ }
  }
}
