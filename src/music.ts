import { S } from './state';
import { ac, musicBus } from './audio';
import LOOPS from './music.json';

/* Soundtrack: one track per mood, through the music bus (battles lower it, narration ducks the effects bus behind it).
   Tracks: Kevin MacLeod (incompetech.com), CC BY 4.0, built by `npm run music` with their loop points (src/music.json).

   Each track is fetched whole and decoded once (a Web Audio buffer), then played by buffer sources started on the audio
   clock: the intro once, then each pass of the loop starts at the loop start at the exact moment the pass before reaches
   the loop point, to the sample, with an equal-power crossfade, so the music never fades out or restarts from its intro.
   Two <audio> elements cannot be joined like that: an element's currentTime is not where its sound is (in WebKit about
   1 s apart, and not the same for a freshly started element), so the two passes crossfaded up to a beat apart. Once the
   context runs, a buffer source needs no further tap (iOS); every fade is a gain. */
export type Mood = 'calm' | 'gate' | 'colony' | 'war' | 'rebuild' | 'finale' | 'elegy';

interface Track { file: string; title: string; dur: number; loop: number[] }
const TRACKS = LOOPS.tracks as Record<Mood, Track>;
/** Crossfade at the loop point (s), from the build. */
const XF = LOOPS.xf;
const VOL: Record<Mood, number> = { calm: 0.28, gate: 0.4, colony: 0.45, war: 0.5, rebuild: 0.45, finale: 0.6, elegy: 0.55 };
const FADE = 1.8;
/** Decoded tracks kept in memory (~45–65 MB each at 48 kHz): the mood playing and the one before, so going back and forth
    (map ↔ battle) decodes nothing again. */
const KEEP = 2;

/** Kết cục mất mát (sa sút, chia lìa, rời quê hương), theo số phận của dòng họ chứ không theo phía nào thắng: nhạc khép
    trầm buồn (The Parting) thay cho Heroic Age. */
const ELEGY = new Set(['lytan', 'chiadoi', 'xanam', 'xabac', 'xagiua']);
let fin: Mood = 'finale';
/** Nhạc khép cho kết cục `id` ('elegy' hay 'finale'); phim hành trình mở từ màn kết (mood('finale')) dùng cùng bản ấy. */
export function finaleFor(id?: string): Mood {
  fin = id && ELEGY.has(id) ? 'elegy' : 'finale';
  return fin;
}

/** One pass through the track: its source and crossfade gain, started at context time `t0`, `off` s into the track. */
interface Pass { src: AudioBufferSourceNode; g: GainNode; t0: number; off: number }
/** A mood playing: its gain (fade in / out, level), its passes (the one playing and the next, already scheduled), the
    timer that schedules the pass after, and where it stopped while the page was hidden. */
interface Play { m: Mood; a: AudioContext; buf: AudioBuffer; g: GainNode; passes: Pass[]; t: number; at: number | null }
let cur: Play | null = null;
/** The mood being fetched / decoded (nothing plays yet). */
let loading: Mood | null = null;
let want: Mood | null = null;
let master: GainNode | null = null;
/** Invalidates a decode that ends after the mood has changed. */
let gen = 0;
const cache = new Map<Mood, Promise<AudioBuffer>>();
/** Bảng chẩn đoán / e2e: số lần đã nối vòng, thời gian tải + giải mã bản gần nhất (ms), số lần tải hỏng. */
const stat = { loops: 0, decode: 0, failed: 0 };

/** Mood for a chapter tour (era ids e1…e6). */
export const eraMood = (id: string): Mood => (id <= 'e3' ? 'colony' : id <= 'e5' ? 'war' : 'rebuild');
/** Đường dẫn tệp nhạc của một mood (warm.ts tải sẵn cho lúc mất mạng). */
export const trackUrl = (m: Mood): string => `${import.meta.env.BASE_URL}music/${TRACKS[m].file}`;

/** Giữ mức hiện tại của gain rồi bỏ mọi lịch đã hẹn (đọc trước khi huỷ: huỷ xong Chrome trả về mức cũ). */
function hold(p: AudioParam, t: number): void {
  const v = p.value;
  p.cancelScheduledValues(t);
  p.setValueAtTime(v, t);
}
/** Equal-power ramp of `p` up to `vol`·sin or down from `vol`·cos over `d` s from `t0`, in short linear steps. */
function ramp(p: AudioParam, t0: number, vol: number, d: number, up: boolean): void {
  p.setValueAtTime(up ? 0 : vol, t0);
  for (let i = 1; i <= 12; i++) { const u = i / 12; p.linearRampToValueAtTime(vol * (up ? Math.sin((u * Math.PI) / 2) : Math.cos((u * Math.PI) / 2)), t0 + u * d); }
}
/** Dừng nguồn lúc `t` (một nguồn đã hẹn dừng: Safari cũ không cho hẹn lại, thì ngắt nó khỏi gain). */
function halt(q: Pass, t: number): void {
  try { q.src.stop(t); } catch { window.setTimeout(() => q.src.disconnect(), Math.max(0, t - q.g.context.currentTime) * 1000); }
}

/** Fetch and decode a track once (the last KEEP stay decoded). */
function load(a: AudioContext, m: Mood): Promise<AudioBuffer> {
  let p = cache.get(m);
  if (p) { cache.delete(m); cache.set(m, p); return p; }
  const t = performance.now();
  p = fetch(trackUrl(m))
    .then(r => { if (!r.ok) throw new Error(`music ${r.status}`); return r.arrayBuffer(); })
    // dạng gọi lại cho Safari cũ; bản mới còn trả về một promise: bắt nó để lỗi không bị báo hai lần
    .then(b => new Promise<AudioBuffer>((ok, no) => { (a.decodeAudioData(b, ok, no) as Promise<AudioBuffer> | undefined)?.catch?.(() => {}); }))
    .then(buf => { stat.decode = Math.round(performance.now() - t); return buf; });
  const q = p;
  q.catch(() => { if (cache.get(m) === q) cache.delete(m); });
  cache.set(m, q);
  while (cache.size > KEEP) cache.delete(cache.keys().next().value as Mood);
  return q;
}

/** Start a pass of `p` at context time `t`, `off` s into the track, crossfading in from the pass before when `xf`. When it
    starts, the next pass is scheduled at its loop point: both start on the audio clock, so they are in step to the sample. */
function pass(p: Play, t: number, off: number, xf: boolean): void {
  const a = p.a, [L, C] = TRACKS[p.m].loop;
  const src = a.createBufferSource(), g = a.createGain();
  src.buffer = p.buf;
  src.connect(g).connect(p.g);
  if (xf) ramp(g.gain, t, 1, XF, true);
  const q: Pass = { src, g, t0: t, off };
  src.onended = () => { const i = p.passes.indexOf(q); if (i >= 0) p.passes.splice(i, 1); g.disconnect(); };
  src.start(t, off);
  p.passes.push(q);
  const seam = t + Math.max(0, C - off);
  p.t = window.setTimeout(() => {
    p.t = 0;
    if (cur !== p || p.at !== null) return;
    if (xf) stat.loops++;
    // hẹn trễ (hiếm: luồng chính bị chặn): hai lượt vẫn khớp nhau, chỉ nối muộn hơn một chút
    const at = Math.max(seam, a.currentTime + 0.05);
    ramp(g.gain, at, 1, XF, false); // sau lúc lượt này lên xong (một vòng dài hơn một phút)
    halt(q, at + XF + 0.05);
    pass(p, at, L + (at - seam), true);
  }, Math.max(0, (t - a.currentTime) * 1000));
}

/** Where the music is now (s into the track): the pass that started last. */
function where(p: Play): number {
  const now = p.a.currentTime, q = p.passes.filter(x => x.t0 <= now).pop() || p.passes[0];
  if (!q) return p.at ?? 0;
  const [L, C] = TRACKS[p.m].loop, x = q.off + Math.max(0, now - q.t0);
  return x >= C ? L + (x - C) : x;
}

function start(a: AudioContext, m: Mood, buf: AudioBuffer): Play {
  const g = a.createGain(), t = a.currentTime;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(VOL[m], t + FADE);
  g.connect(master!);
  const p: Play = { m, a, buf, g, passes: [], t: 0, at: null };
  pass(p, t + 0.05, 0, false); // tệp mới: phát từ đầu
  return p;
}

/** Fade a mood out over `sec` s and let it go (its decoded track stays in the cache). */
function stop(p: Play, sec = FADE): void {
  const t = p.a.currentTime;
  clearTimeout(p.t);
  p.t = 0;
  hold(p.g.gain, t);
  p.g.gain.linearRampToValueAtTime(0, t + sec);
  for (const q of p.passes) halt(q, t + sec + 0.05);
  window.setTimeout(() => p.g.disconnect(), (sec + 0.3) * 1000);
}

function apply(): void {
  const m = S.sound && S.music ? want : null;
  if (cur ? cur.m === m : loading === m) return;
  if (document.hidden) return; // khi quay lại trang (visibilitychange)
  const out = musicBus(), a = ac();
  if (!out || !a) return;
  // Until a user gesture unlocks audio the context stays suspended: wait instead of downloading a track that can't play.
  if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return; // retried on the first tap
  if (a.state !== 'running') { a.resume().then(() => { if (a.state === 'running') apply(); }, () => {}); return; }
  if (!master) { master = a.createGain(); master.connect(out); }
  const n = ++gen;
  if (cur) stop(cur);
  cur = null;
  loading = m;
  if (!m) return;
  load(a, m).then(buf => {
    if (gen !== n) return;
    loading = null;
    cur = start(a, m, buf);
  }, () => {
    if (gen !== n) return;
    loading = null; // tải / giải mã không được (mất mạng, chưa lưu): thử lại ở lần chạm sau
    stat.failed++;
  });
}

/** Ask for a mood (null = silence). Starts as soon as the browser allows audio. 'finale': the ending's track (finaleFor). */
export function mood(m: Mood | null): void {
  want = m === 'finale' ? fin : m;
  apply();
}

/** Re-evaluate after the sound / music settings change. */
export const refreshMusic = apply;

/** Bảng chẩn đoán: nghe chỗ nối vòng ngay, không phải đợi vài phút: nhảy tới `before` giây trước điểm vòng của bản đang
    phát (cắt ngang, có một chớp im ngắn); lượt sau nối vào đúng như mọi vòng. */
export function musicToSeam(before = 4): boolean {
  const p = cur;
  if (!p || p.at !== null) return false;
  const a = p.a, t = a.currentTime, [, C] = TRACKS[p.m].loop;
  clearTimeout(p.t);
  p.t = 0;
  for (const q of p.passes) halt(q, t + 0.04);
  p.passes = [];
  hold(p.g.gain, t);
  p.g.gain.linearRampToValueAtTime(0, t + 0.04);
  p.g.gain.setValueAtTime(0, t + 0.06);
  p.g.gain.linearRampToValueAtTime(VOL[p.m], t + 0.2);
  pass(p, t + 0.06, C - before, false);
  return true;
}

/** Bảng chẩn đoán: bản đang phát, vị trí theo đồng hồ âm thanh, mức, số lần nối vòng, thời gian tải + giải mã. */
export function musicStats(): string {
  if (!cur) return loading ? `${loading} đang tải` : `chưa phát${stat.failed ? ` · tải hỏng ${stat.failed}` : ''}`;
  return `${cur.m} ${where(cur).toFixed(1)} s ×${cur.g.gain.value.toFixed(2)}${cur.at !== null ? ' (tạm dừng)' : ''} · nối vòng ${stat.loops} · tải + giải mã ${stat.decode} ms${stat.failed ? ` · tải hỏng ${stat.failed}` : ''}`;
}

export function initMusic(): void {
  // Browsers only start audio from a user gesture: try again on every tap until it plays. pointerup / click: một cú chạm
  // trên màn cảm ứng chỉ được tính là cử chỉ người dùng từ lúc nhấc ngón (pointerdown của cảm ứng không mở khoá âm thanh)
  for (const t of ['pointerup', 'click']) addEventListener(t, () => { if (want && !cur) apply(); }, true);
  document.addEventListener('visibilitychange', () => {
    const p = cur;
    if (document.hidden) {
      // ẩn trang: nhớ chỗ đang phát rồi dừng các lượt (không phát nền, không lỡ một lần nối)
      if (!p || p.at !== null) return;
      const t = p.a.currentTime;
      p.at = where(p);
      clearTimeout(p.t);
      p.t = 0;
      hold(p.g.gain, t);
      p.g.gain.linearRampToValueAtTime(0, t + 0.04);
      for (const q of p.passes) halt(q, t + 0.05);
      p.passes = [];
      return;
    }
    apply(); // mood đã đổi trong lúc ẩn
    if (cur && cur === p && p.at !== null) {
      const t = p.a.currentTime, at = p.at;
      p.at = null;
      hold(p.g.gain, t);
      p.g.gain.linearRampToValueAtTime(VOL[p.m], t + 0.5);
      pass(p, t + 0.05, at, false);
    }
  });
}
