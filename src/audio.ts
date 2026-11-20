import { S } from './state';

/* Synthesised sound design (no audio assets) and haptics. Everything goes through one
   master bus with a soft compressor so layered cues never clip; `duck()` lowers the
   effects/music bus while narration speaks.

   Tiếng trận (WAR) đi qua chuỗi của cảnh: mỗi tiếng một bộ đặt vị trí trái / phải (StereoPanner, theo chỗ mũi tên trên
   màn hình) → bus của cảnh (cắt được ngay) → lọc dịu khi có lời kể → hiệu ứng / nhạc; từ bộ lọc một nhánh sang tiếng vang
   chung (một ConvolverNode, tạo một lần). Trong lúc trận đánh có tiếng, nhạc lùi xuống (WAR.dip) trên bus nhạc riêng, độc
   lập với việc hạ khi có lời kể. Bản thu tiếng trận sau này nối vào WAR.port(pan) là đi đúng chuỗi ấy. */
let AC: AudioContext | null = null;
/** Nơi tiếng được dựng: AC, hay một OfflineAudioContext trong lúc renderOffline() (đo phổ, so sánh cũ / mới). */
let CTX: BaseAudioContext | null = null;
let MASTER: GainNode | null = null;
let FX: GainNode | null = null;
/** Bus nhạc (music.ts nối vào đây): lùi xuống trong lúc trận đánh có tiếng. */
let MUS: GainNode | null = null;
let NOISE: AudioBuffer | null = null;
/** Bus riêng của cảnh động đang chạy (WAR.open/close): cắt được ngay khi tour sang bước khác. */
let SCN: GainNode | null = null;
/** Lọc thông thấp trên bus cảnh: khi có lời kể, tiếng súng / tiếng nổ chói dịu đi, tiếng ầm vẫn nghe (không át giọng). */
let SCNF: BiquadFilterNode | null = null;
/** Tiếng vang chung của mọi cảnh (một lần, dùng lại). */
let VERB: ConvolverNode | null = null;
let voiced = false;
let offline = false;

/* Tiếng trận kiểu mới (lớp bội âm, trái / phải, tiếng vang, nhạc lùi) hay kiểu cũ: công tắc A/B trong bảng chẩn đoán, để
   nghe so sánh trên máy thật. Nhớ trên máy này (không phải bản lưu). */
const OLD_KEY = 'dudo-war-old';
let OLD = (() => { try { return localStorage.getItem(OLD_KEY) === '1'; } catch { return false; } })();
export const warNew = (): boolean => !OLD;
export function setWarNew(on: boolean): void {
  OLD = !on;
  try { if (OLD) localStorage.setItem(OLD_KEY, '1'); else localStorage.removeItem(OLD_KEY); } catch { /* riêng tư */ }
  if (OLD) WAR.dip(false, true);
}

/** Master compressor, effects bus, music bus and the noise buffer for context `a`. */
function graph(a: BaseAudioContext): void {
  const comp = a.createDynamicsCompressor();
  comp.threshold.value = -14;
  comp.ratio.value = 4;
  MASTER = a.createGain();
  MASTER.gain.value = 0.9;
  FX = a.createGain();
  FX.connect(MASTER);
  MUS = a.createGain();
  MUS.connect(FX);
  MASTER.connect(comp).connect(a.destination);
  NOISE = a.createBuffer(1, a.sampleRate * 2, a.sampleRate);
  const ch = NOISE.getChannelData(0);
  for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1;
}

/** Lazily create / resume the audio context; call from a user gesture. */
export function ac(): AudioContext | null {
  if (!AC) {
    try {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      AC = new Ctor();
      CTX = AC;
      graph(AC);
    } catch { /* no Web Audio */ }
  }
  wake();
  return AC;
}

/** Nối lại AudioContext khi nó không chạy: 'suspended' (chưa chạm), hay 'interrupted' riêng của Safari (khoá máy, cuộc
    gọi, Siri), trước đây chỉ 'suspended' được nối lại nên tiếng trận và nhạc câm tới khi tải lại trang. */
function wake(): void {
  if (AC && AC.state !== 'running' && AC.state !== 'closed') AC.resume().catch(() => { /* chưa được phép: lần chạm sau */ });
}
for (const t of ['pointerup', 'keydown']) addEventListener(t, wake, true);
document.addEventListener('visibilitychange', () => { if (!document.hidden) wake(); });
addEventListener('pageshow', wake);

/** Trạng thái AudioContext cho bảng chẩn đoán ('none': chưa tạo). */
export const acState = (): string => (AC ? AC.state : 'none');

/** iOS / iPadOS 16.4+: Web Audio (tiếng trận, nhạc) mặc định theo nút im lặng, còn lời kể (thẻ audio) thì không. Khi bật
    Âm thanh, đặt phiên 'playback' để tiếng trận theo cùng một luật với lời kể; tắt Âm thanh thì trả về mặc định. */
export function audioSession(): void {
  try {
    const s = (navigator as Navigator & { audioSession?: { type: string } }).audioSession;
    if (s) s.type = S.sound ? 'playback' : 'auto';
  } catch { /* không hỗ trợ */ }
}
audioSession();

/** Output bus for other audio sources; null when sound is unavailable. */
export const bus = (): GainNode | null => (ac() ? FX : null);
/** Bus for the soundtrack (music.ts): the effects bus behind a gain that battles lower (WAR.dip). */
export const musicBus = (): GainNode | null => (ac() ? MUS : null);

/** Duck effects/music under narration (`on`) and bring them back afterwards. */
export function duck(on: boolean): void {
  voiced = on;
  if (!AC || !FX || offline) return;
  const t = AC.currentTime;
  FX.gain.cancelScheduledValues(t);
  FX.gain.setTargetAtTime(on ? 0.35 : 1, t, on ? 0.08 : 0.4);
  if (SCNF) { SCNF.frequency.cancelScheduledValues(t); SCNF.frequency.setTargetAtTime(on ? 1200 : 18000, t, on ? 0.08 : 0.5); }
}

const live = (): BaseAudioContext | null => { if (offline) return CTX; const a = ac(); return a && S.sound && FX ? a : null; };

function env(a: BaseAudioContext, t: number, v: number, att: number, d: number): GainNode {
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

/** Đường cong bão hoà mềm, lệch một chút (tanh có độ lệch): sinh bội âm chẵn và lẻ, không bao giờ vượt ±1. */
let SAT: Float32Array<ArrayBuffer> | null = null;
function sat(): Float32Array<ArrayBuffer> {
  if (SAT) return SAT;
  const n = 1024, k = 2.6, b = 0.35, c = new Float32Array(n), top = Math.tanh(k + b) - Math.tanh(b), bot = Math.tanh(b) - Math.tanh(-k + b);
  for (let i = 0; i < n; i++) { const x = (i / (n - 1)) * 2 - 1, y = Math.tanh(k * x + b) - Math.tanh(b); c[i] = y / (y >= 0 ? top : bot); }
  return (SAT = c);
}
/** Lớp "punch" cho loa máy tính bảng: cùng nốt trầm `f`→`f2`, bão hoà mềm sinh bội âm 2f, 3f, 4f…; bỏ phần dưới
    ~130 Hz (lọc bậc bốn: chính nốt gốc, loa nhỏ không phát được) và trên ~1 kHz (không rè). Tai nghe các bội âm ấy mà
    đoán ra nốt gốc. Ngắn hơn tiếng trầm. */
function punch(f: number, f2: number, d: number, v: number, delay = 0, dst?: AudioNode): void {
  const a = live();
  if (!a || OLD) return;
  const t = a.currentTime + delay, o = a.createOscillator(), sh = a.createWaveShaper(), lp = a.createBiquadFilter();
  o.frequency.setValueAtTime(f, t);
  o.frequency.exponentialRampToValueAtTime(f2, t + d * 0.6);
  sh.curve = sat();
  const [h1, h2] = [0.54, 1.31].map(q => { const h = a.createBiquadFilter(); h.type = 'highpass'; h.frequency.value = PUNCH.hp; h.Q.value = q; return h; });
  lp.type = 'lowpass'; lp.frequency.value = PUNCH.lp; lp.Q.value = 0.5;
  o.connect(sh).connect(h1).connect(h2).connect(lp).connect(env(a, t, v, 0.005, d)).connect(dst || FX!);
  o.start(t);
  o.stop(t + d + 0.05);
}
/** Lớp punch: tần số cắt dưới / trên (Hz), mức so với tiếng trầm của pháo và của trống (đo: npm run audio:measure). */
const PUNCH = { hp: 130, lp: 1000, boom: 0.8, drum: 0.55 };

/** Low drum: pitched body dropping in frequency plus a skin transient (and the punch layer). */
function drum(delay = 0, v = 0.5, f = 110, dst?: AudioNode): void {
  tone(f, 0.9, 'sine', v, delay, f * 0.45, dst);
  tone(f * 1.5, 0.25, 'triangle', v * 0.25, delay, f * 0.6, dst);
  punch(f, f * 0.5, 0.6, v * PUNCH.drum, delay, dst);
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
  /** Lời thề theo một hướng: hợp âm kèn đồng trên nhịp trống. */
  vow() { drum(0, 0.4, 70); brass([147, 220, 294], 1.4, 0.06, 0.08); tone(587, 0.9, 'triangle', 0.03, 0.5); },
  /** Regime / borders change on the map. */
  shift() { drum(0, 0.32, 55); noise(0.7, 150, 600, 0.1, 0.5, 0, 0.05); },
};

/* ---------- âm thanh chiến trường (cảnh động, scene.ts) ---------- */
/** Low-passed noise burst: the body of an explosion. */
function thud(d: number, f: number, f2: number, v: number, delay = 0, dst?: AudioNode): void {
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
  s.connect(lp).connect(env(a, t, v, 0.004, d)).connect(dst || SCN || FX!);
  s.start(t, Math.random());
  s.stop(t + d + 0.05);
}

const sc = (): AudioNode => SCN || FX!;

/* Sổ nút của chuỗi cảnh (bảng chẩn đoán, e2e): bus, bộ lọc, nhánh vang của mỗi cảnh đang mở, bộ đặt vị trí của từng
   tiếng. Mỗi nút được ngắt và trừ khỏi sổ khi tiếng của nó hết hay khi cảnh đóng: sau mười trận sổ phải về 0. */
interface Bus { g: GainNode; p: GainNode; f: BiquadFilterNode; s: GainNode | null; pans: Set<StereoPannerNode> }
let BUS: Bus | null = null;
const stats = { live: 0, pans: 0, peakPans: 0, scenes: 0, dip: false };
/** Bảng chẩn đoán / e2e: số nút đang sống của chuỗi cảnh, bộ đặt vị trí, có tiếng vang chưa, nhạc có đang lùi. */
export const warStats = () => ({ ...stats, verb: !!VERB, music: MUS && AC && !offline ? +MUS.gain.value.toFixed(2) : 1, kind: OLD ? 'cũ' : 'mới' });

/** Phần tiếng vang (đi qua bộ lọc của cảnh nên cũng dịu khi có lời kể). */
const WET = 0.22;
/** Xung tiếng vang dựng sẵn: nhiễu tắt dần trong ~1,3 s (RT60), tối dần về cuối, hai kênh khác nhau cho độ rộng,
    trễ đầu 12 ms. Không cần tệp âm thanh. */
function impulse(a: BaseAudioContext): AudioBuffer {
  const sr = a.sampleRate, n = Math.round(sr * 1.5), pre = Math.round(sr * 0.012), b = a.createBuffer(2, n, sr);
  for (let c = 0; c < 2; c++) {
    const ch = b.getChannelData(c);
    let lp = 0;
    for (let i = pre; i < n; i++) {
      const t = (i - pre) / sr, k = 0.6 - 0.45 * Math.min(1, t / 1.2); // lọc một cực: hệ số giảm dần, đuôi tối dần
      lp += k * (Math.random() * 2 - 1 - lp);
      ch[i] = lp * Math.exp((-6.9 * t) / 1.3);
    }
    let e = 0;
    for (const x of ch) e += x * x;
    const k = 1 / Math.sqrt(e || 1);
    for (let i = 0; i < n; i++) ch[i] *= k;
  }
  return b;
}
function verb(a: BaseAudioContext): ConvolverNode | null {
  if (VERB) return VERB;
  try {
    const c = a.createConvolver();
    c.normalize = false; // xung đã chuẩn về năng lượng 1: WET là tỉ lệ năng lượng vang / tiếng gốc
    c.buffer = impulse(a);
    c.connect(FX!);
    VERB = c;
  } catch { /* không có ConvolverNode */ }
  return VERB;
}

const clamp = (x: number) => Math.max(-1, Math.min(1, x));
function release(p: StereoPannerNode, b: Bus): void {
  if (!b.pans.delete(p)) return;
  try { p.disconnect(); } catch { /* đã ngắt */ }
  stats.live--; stats.pans--;
}
/** Đầu vào cho một tiếng của cảnh đang chạy: bộ đặt vị trí (−1 trái … 1 phải; [từ, tới] thì trượt trong `d` giây) nối vào
    bus của cảnh, tự ngắt sau `delay` + `d` giây (hay khi cảnh đóng). Không có vị trí / kiểu cũ / chưa mở cảnh: bus cảnh. */
function port(pan: number | [number, number] | undefined, d: number, delay = 0): AudioNode {
  const b = BUS, a = live();
  if (!b || !a || pan === undefined || OLD || !a.createStereoPanner) return sc();
  const p = a.createStereoPanner(), t = a.currentTime + delay;
  if (typeof pan === 'number') p.pan.value = clamp(pan);
  else { p.pan.setValueAtTime(clamp(pan[0]), t); p.pan.linearRampToValueAtTime(clamp(pan[1]), t + d); }
  p.connect(b.p);
  b.pans.add(p);
  stats.live++; stats.pans++; stats.peakPans = Math.max(stats.peakPans, stats.pans);
  setTimeout(() => release(p, b), (delay + d + 0.6) * 1000);
  return p;
}

export const WAR = {
  /** Artillery / cannon: transient, body, sub drop and its punch; `far` (0–1) softens and darkens it; `pan` −1…1. */
  boom(delay = 0, far = 0, pan?: number) {
    const v = 0.55 * (1 - far * 0.6), o = port(pan, 1.4 + far, delay);
    thud(1.3 + far, 900 - far * 600, 60, v, delay, o);
    tone(62 - far * 15, 1.1, 'sine', v * 0.7, delay, 28, o);
    punch(62 - far * 15, 30, 1 - far * 0.3, v * PUNCH.boom * (1 - far * 0.5), delay, o);
    if (far < 0.5) noise(0.06, 3200, 1500, v * 0.4, 1, delay, 0.001, o);
  },
  /** Rifle / machine-gun fire: scattered short cracks over `d` seconds. */
  crackle(d = 2.5, n = 18, delay = 0, old = false, pan?: number) {
    const o = port(pan, d + 0.3, delay);
    if (old) { // súng hoả mai, súng trường thế kỷ 19: từng loạt bắn đồng loạt, không phải tiếng liên thanh
      const vol = Math.max(2, Math.round(n / 5));
      for (let i = 0; i < vol; i++) { const at = delay + (i * d) / vol + Math.random() * 0.15; for (let j = 0; j < 5; j++) noise(0.09, 1200 + Math.random() * 1000, 500, 0.06, 1, at + j * 0.025, 0.002, o); }
      return;
    }
    for (let i = 0; i < n; i++) {
      const at = delay + Math.random() * d, burst = Math.random() < 0.3 ? 3 : 1;
      for (let j = 0; j < burst; j++) noise(0.05, 2600 + Math.random() * 1500, 900, 0.05 + Math.random() * 0.06, 1.4, at + j * 0.07, 0.001, o);
    }
  },
  /** Distant rolling front: a low bed with a few far booms. */
  rumble(d = 5, delay = 0) {
    thud(d, 220, 90, 0.12, delay);
    const n = Math.max(2, Math.min(8, Math.round(d / 1.4)));
    for (let i = 0; i < n; i++) WAR.boom(delay + 0.4 + Math.random() * (d - 0.8), 0.8);
  },
  /** Aircraft passing overhead (pitch drops as it passes); `pan` [from, to] follows it across the screen. */
  plane(delay = 0, pan?: [number, number]) {
    const a = live();
    if (!a) return;
    const t = a.currentTime + delay, d = 3.2, out = port(pan, d, delay);
    const o = a.createOscillator(), lp = a.createBiquadFilter();
    o.type = 'sawtooth'; o.frequency.setValueAtTime(118, t); o.frequency.exponentialRampToValueAtTime(82, t + d);
    lp.type = 'lowpass'; lp.frequency.value = 520;
    o.connect(lp).connect(env(a, t, 0.06, 1.2, d)).connect(out);
    o.start(t); o.stop(t + d + 0.1);
    noise(d, 300, 700, 0.07, 0.6, delay, 1.1, out);
  },
  /** Bomb whistle into a blast. */
  bomb(delay = 0, pan?: number) { tone(1700, 0.9, 'sine', 0.05, delay, 420, port(pan, 0.9, delay)); WAR.boom(delay + 0.85, 0.1, pan); },
  /** Sea: slow swells of filtered noise; with the cannons, a naval scene. */
  waves(d = 5, delay = 0) { const n = Math.max(3, Math.min(8, Math.ceil(d / 1.5))); for (let i = 0; i < n; i++) noise(1.8, 300, 900, 0.08, 0.5, delay + i * 1.5, 0.7, sc()); },
  /** Crowd / uprising: murmur swell with drums. */
  crowd(delay = 0) { noise(3.5, 400, 900, 0.09, 0.4, delay, 1.2, sc()); drum(delay + 0.3, 0.3, 80, sc()); drum(delay + 0.9, 0.3, 80, sc()); drum(delay + 1.5, 0.35, 76, sc()); },
  /** Treaty: quill scratches, then the seal. */
  quill(delay = 0) { for (let i = 0; i < 5; i++) noise(0.12 + Math.random() * 0.1, 3500, 5200, 0.04, 2, delay + i * 0.17, 0.01, sc()); },
  /** Còi tàu rời bến: hai âm trầm. */
  horn(delay = 0) { tone(110, 1.6, 'sawtooth', 0.05, delay, undefined, sc()); tone(165, 1.6, 'sawtooth', 0.035, delay, undefined, sc()); tone(110, 1.1, 'sawtooth', 0.04, delay + 1.9, undefined, sc()); },
  /** Nhịp hành quân: trống đều. */
  march(n = 8, delay = 0) { for (let i = 0; i < n; i++) drum(delay + i * 0.42, i % 2 ? 0.16 : 0.24, i % 2 ? 120 : 95, sc()); },
  /** Xe tăng / thiết giáp: tiếng máy trầm và tiếng xích lách cách trong `d` giây; `pan` [từ, tới] theo mũi tên. */
  tank(d = 2, delay = 0, pan?: [number, number]) {
    const a = live();
    if (!a) return;
    const t = a.currentTime + delay, o = a.createOscillator(), lp = a.createBiquadFilter(), out = port(pan, d, delay);
    o.type = 'sawtooth'; o.frequency.value = 42;
    lp.type = 'lowpass'; lp.frequency.value = 160;
    o.connect(lp).connect(env(a, t, 0.05, 0.3, d)).connect(out);
    o.start(t); o.stop(t + d + 0.1);
    const n = Math.min(18, Math.floor(d / 0.11));
    for (let i = 0; i < n; i++) noise(0.03, 1800, 1200, 0.025, 3, delay + i * 0.11, 0.001, out);
  },
  /** Trực thăng: tiếng cánh quạt đập đều (nhiễu lọc, nhịp 13 Hz) trong `d` giây; `pan` [từ, tới] theo mũi tên. */
  heli(d = 2, delay = 0, pan?: [number, number]) {
    const a = live();
    if (!a || !NOISE) return;
    const t = a.currentTime + delay, s = a.createBufferSource(), bp = a.createBiquadFilter(), am = a.createGain(), lfo = a.createOscillator(), depth = a.createGain();
    s.buffer = NOISE; s.loop = true;
    bp.type = 'bandpass'; bp.frequency.value = 380; bp.Q.value = 2;
    am.gain.value = 0.5; lfo.frequency.value = 13; depth.gain.value = 0.5;
    lfo.connect(depth).connect(am.gain);
    s.connect(bp).connect(am).connect(env(a, t, 0.09, 0.4, d)).connect(port(pan, d, delay));
    s.start(t); lfo.start(t); s.stop(t + d + 0.05); lfo.stop(t + d + 0.05);
  },
  /** Tiếng mở trận theo loại trận (xong trước khi lời kể bắt đầu, ~1,1 s). */
  sting(type: string) {
    if (type === 'naval' || type === 'landing') { drum(0, 0.45, 66, sc()); tone(98, 0.6, 'sawtooth', 0.04, 0.1, undefined, sc()); tone(147, 0.5, 'sawtooth', 0.025, 0.1, undefined, sc()); }
    else if (type === 'air') { tone(180, 0.7, 'sawtooth', 0.022, 0, 360, sc()); drum(0.45, 0.35, 58, sc()); }
    else if (type === 'uprising') { [0, 0.2, 0.34, 0.45, 0.54].forEach((t, i) => drum(t, 0.22 + i * 0.04, 80, sc())); }
    else { drum(0, 0.5, 62, sc()); drum(0.16, 0.55, 52, sc()); noise(0.6, 120, 380, 0.07, 0.5, 0.16, 0.08, sc()); }
  },
  /** Đầu vào cho một tiếng của cảnh (vd. bản thu tiếng trận sau này): đặt vị trí `pan`, đi qua tiếng vang, lọc khi có lời
      kể và cắt khi cảnh đóng như mọi tiếng trận; tự ngắt sau `d` giây. null khi không có âm thanh. */
  port(pan?: number, d = 3): AudioNode | null { return live() ? port(pan, d) : null; },
  /** Mở bus riêng cho một cảnh (gọi khi cảnh bắt đầu). */
  open() {
    WAR.close();
    const a = live();
    if (!a) return;
    const g = a.createGain(), pin = a.createGain(), f = a.createBiquadFilter();
    f.type = 'lowpass';
    f.Q.value = 0.7;
    f.frequency.value = voiced ? 1200 : 18000;
    g.connect(f).connect(FX!);
    // tiếng có vị trí: bộ đặt vị trí chia một kênh thành hai, mỗi bên −3 dB ở giữa; bù lại để tổng công suất bằng tiếng
    // một kênh không đặt vị trí (trình duyệt chép nó ra cả hai loa)
    pin.gain.value = Math.SQRT2;
    pin.connect(g);
    let s: GainNode | null = null;
    const v = OLD ? null : verb(a);
    if (v) { s = a.createGain(); s.gain.value = WET; f.connect(s).connect(v); }
    BUS = { g, p: pin, f, s, pans: new Set() };
    SCN = g; SCNF = f;
    stats.live += s ? 4 : 3;
    stats.scenes++;
  },
  /** Cắt mọi tiếng của cảnh đang chạy (đã hẹn trước hay chưa): hạ nhanh rồi ngắt bus và mọi bộ đặt vị trí của nó. */
  close() {
    const b = BUS, c = CTX;
    BUS = null; SCN = null; SCNF = null;
    if (!b || !c) return;
    b.g.gain.setTargetAtTime(0, c.currentTime, 0.05);
    setTimeout(() => {
      for (const p of [...b.pans]) release(p, b);
      try { b.g.disconnect(); b.p.disconnect(); b.f.disconnect(); b.s?.disconnect(); } catch { /* đã ngắt */ }
      stats.live -= b.s ? 4 : 3;
    }, 400);
  },
  /** Nhạc lùi xuống ~7 dB trong lúc trận đánh có tiếng (`on`), rồi lên lại êm; độc lập với việc hạ khi có lời kể (duck).
      `force`: đặt lại ngay cả khi trạng thái không đổi (đổi kiểu cũ / mới). */
  dip(on: boolean, force = false) {
    const want = on && !OLD;
    if (stats.dip === want && !force) return;
    stats.dip = want;
    if (!AC || !MUS || offline) return;
    const t = AC.currentTime, p = MUS.gain, v = p.value;
    p.cancelScheduledValues(t);
    p.setValueAtTime(v, t);
    p.setTargetAtTime(want ? DIP : 1, t, want ? 0.25 : 0.9);
  },
};
/** Mức nhạc trong lúc trận đánh có tiếng (≈ −7 dB). */
const DIP = 0.45;

/** Đo / so sánh (công cụ npm run audio:measure, không dùng trong ứng dụng): dựng tiếng của `fn` vào một OfflineAudioContext
    `sec` giây, qua đúng chuỗi của cảnh (WAR.open), rồi trả bộ đệm stereo. `old`: kiểu cũ (không punch, vị trí, vang). */
export async function renderOffline(fn: () => void, sec: number, old = false, sr = 44100): Promise<AudioBuffer> {
  const keep = { CTX, MASTER, FX, MUS, NOISE, SCN, SCNF, VERB, BUS, OLD, offline }, st = { ...stats };
  const a = new OfflineAudioContext(2, Math.round(sr * sec), sr);
  try {
    offline = true; OLD = old; CTX = a; VERB = null; BUS = null;
    graph(a);
    WAR.open();
    fn();
    return await a.startRendering();
  } finally {
    BUS?.pans.clear(); // hẹn ngắt của các nút dựng ngoại tuyến không đụng vào sổ của cảnh thật
    ({ CTX, MASTER, FX, MUS, NOISE, SCN, SCNF, VERB, BUS, OLD, offline } = keep);
    Object.assign(stats, st);
  }
}

export function buzz(p: number | number[]): void {
  // trình duyệt chặn (và báo lỗi) rung trước lần chạm đầu tiên, vd. điểm rẽ mở ngay khi tải lại trang
  const ua = (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }).userActivation;
  if (ua && !ua.hasBeenActive) return;
  if (S.haptic && navigator.vibrate) {
    try { navigator.vibrate(p); } catch { /* ignore */ }
  }
}
