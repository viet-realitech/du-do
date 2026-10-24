import { S } from './state';

/* Synthesised sound cues (no audio assets) and haptics. */
let AC: AudioContext | null = null;

/** Lazily create / resume the audio context; call from a user gesture. */
export function ac(): AudioContext | null {
  if (!AC) {
    try {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      AC = new Ctor();
    } catch { /* no Web Audio */ }
  }
  if (AC && AC.state === 'suspended') AC.resume();
  return AC;
}

function tone(f: number, d: number, type: OscillatorType = 'sine', v = 0.2, delay = 0): void {
  const a = ac();
  if (!a || !S.sound) return;
  const t = a.currentTime + delay;
  const o = a.createOscillator(), g = a.createGain();
  o.type = type;
  o.frequency.value = f;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(v, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  o.connect(g).connect(a.destination);
  o.start(t);
  o.stop(t + d + 0.05);
}

export const SND = {
  gong() { tone(98, 3.4, 'sine', 0.32); tone(147, 2.6, 'sine', 0.12, 0.01); tone(262, 1.4, 'triangle', 0.05, 0.02); },
  chime() { tone(880, 0.6, 'triangle', 0.11); tone(1318, 0.9, 'sine', 0.08, 0.09); },
  ok() { tone(660, 0.3, 'triangle', 0.12); tone(990, 0.45, 'triangle', 0.1, 0.1); },
  no() { tone(150, 0.4, 'sawtooth', 0.05); },
  tick() { tone(1500, 0.035, 'square', 0.025); },
};

export function buzz(p: number | number[]): void {
  if (S.haptic && navigator.vibrate) {
    try { navigator.vibrate(p); } catch { /* ignore */ }
  }
}
