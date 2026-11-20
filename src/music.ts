import { S } from './state';
import { ac, musicBus } from './audio';
import LOOPS from './music.json';

/* Soundtrack: one track per mood, through the music bus (battles lower it, narration ducks the effects bus behind it).
   Tracks: Kevin MacLeod (incompetech.com), CC BY 4.0, built by `npm run music` with their loop points (src/music.json).

   Two decks (two <audio> elements, made once and unlocked by the first taps, since iOS only lets an element start
   without a tap once a tap has started it). A mood starts on one deck from the top; at the loop point the other deck,
   already running silently from the loop start, takes over with an equal-power crossfade, so the music never fades out
   or restarts from its intro. Every fade is a Web Audio gain: on iOS an <audio> element's volume is read-only. */
export type Mood = 'calm' | 'gate' | 'colony' | 'war' | 'rebuild' | 'finale' | 'elegy';

interface Track { file: string; title: string; dur: number; loop: number[] }
const TRACKS = LOOPS.tracks as Record<Mood, Track>;
/** Crossfade at the loop point (s), from the build. */
const XF = LOOPS.xf;
const VOL: Record<Mood, number> = { calm: 0.28, gate: 0.4, colony: 0.45, war: 0.5, rebuild: 0.45, finale: 0.6, elegy: 0.55 };
const FADE = 1.8;
/** The deck that takes over starts this long before the loop point, silent, so it is running in step when the crossfade begins. */
const PRE = 1.2;

/** Kết cục mất mát (sa sút, chia lìa, rời quê hương), theo số phận của dòng họ chứ không theo phía nào thắng: nhạc khép
    trầm buồn (The Parting) thay cho Heroic Age. */
const ELEGY = new Set(['lytan', 'chiadoi', 'xanam', 'xabac', 'xagiua']);
let fin: Mood = 'finale';
/** Nhạc khép cho kết cục `id` ('elegy' hay 'finale'); phim hành trình mở từ màn kết (mood('finale')) dùng cùng bản ấy. */
export function finaleFor(id?: string): Mood {
  fin = id && ELEGY.has(id) ? 'elegy' : 'finale';
  return fin;
}

/** A deck: its element and gain, the mood it plays (null: idle or fading out), until when it is still audible (context
    time), its timer, a generation number that invalidates stale callbacks, and whether it has ever started playing. */
interface Deck { el: HTMLAudioElement; g: GainNode; m: Mood | null; busy: number; t: number; n: number; blessed: boolean }
const decks: Deck[] = [];
let cur: Deck | null = null;
let want: Mood | null = null;
let master: GainNode | null = null;
/** Bảng chẩn đoán / e2e: số lần đã nối vòng, độ lệch giữa hai deck lúc nối (ms), lần nối bị chặn. */
const stat = { loops: 0, lag: 0, refused: 0 };

/** Mood for a chapter tour (era ids e1…e6). */
export const eraMood = (id: string): Mood => (id <= 'e3' ? 'colony' : id <= 'e5' ? 'war' : 'rebuild');
/** Đường dẫn tệp nhạc của một mood (warm.ts tải sẵn cho lúc mất mạng). */
export const trackUrl = (m: Mood): string => `${import.meta.env.BASE_URL}music/${TRACKS[m].file}`;

const other = (d: Deck) => decks[decks[0] === d ? 1 : 0];
/** Giữ mức hiện tại của gain rồi bỏ mọi lịch đã hẹn (đọc trước khi huỷ: huỷ xong Chrome trả về mức cũ). */
function hold(p: AudioParam, t: number): void {
  const v = p.value;
  p.cancelScheduledValues(t);
  p.setValueAtTime(v, t);
}
/** Equal-power ramp of `p` up to `vol`·sin or down from `vol`·cos over `d` s from `t0`, in short linear steps
    (setValueCurveAtTime cannot be cut short while it runs, and a mood may change mid-crossfade). */
function ramp(p: AudioParam, t0: number, vol: number, d: number, up: boolean): void {
  p.setValueAtTime(up ? 0 : vol, t0);
  for (let i = 1; i <= 12; i++) { const u = i / 12; p.linearRampToValueAtTime(vol * (up ? Math.sin((u * Math.PI) / 2) : Math.cos((u * Math.PI) / 2)), t0 + u * d); }
}
const audible = (d: Deck, a: AudioContext) => !!d.m || d === cur || a.currentTime < d.busy;

/** Fade a deck out over `sec` s and stop it (it keeps its element for the next track). */
function stopDeck(d: Deck, a: AudioContext, sec = FADE): void {
  const n = ++d.n, t = a.currentTime;
  clearTimeout(d.t);
  d.t = 0;
  d.m = null;
  d.busy = t + sec;
  hold(d.g.gain, t);
  d.g.gain.linearRampToValueAtTime(0, t + sec);
  window.setTimeout(() => { if (d.n === n) { d.el.pause(); d.el.removeAttribute('src'); d.el.load(); } }, sec * 1000 + 100);
}

function deck(a: AudioContext, out: AudioNode): Deck {
  const el = new Audio();
  el.preload = 'auto';
  const g = a.createGain();
  g.gain.value = 0;
  a.createMediaElementSource(el).connect(g).connect(out);
  const d: Deck = { el, g, m: null, busy: 0, t: 0, n: 0, blessed: false };
  el.addEventListener('timeupdate', () => near(d));
  // nối vòng không được (deck kia bị chặn): bài chạy tới cuối thì quay về điểm bắt đầu vòng, có một khoảng ngắt
  el.addEventListener('ended', () => { if (cur === d && d.m) { d.el.currentTime = TRACKS[d.m].loop[0]; void d.el.play().catch(() => {}); } });
  return d;
}

/** iOS: an element may start without a tap only once a tap has started it. On each tap (until both have played), an
    idle, silent deck is started and stopped at once with no source, so a later takeover from a timer is allowed. */
function bless(): void {
  const a = ac();
  if (!a) return;
  for (const d of decks) {
    if (d.blessed || audible(d, a) || !d.el.paused) continue;
    d.blessed = true;
    try { void d.el.play().catch(() => {}); d.el.pause(); } catch { /* không sao */ }
  }
}

/** Near the loop point: arm the takeover (timeupdate fires every ~250 ms; the timer is exact). */
function near(d: Deck): void {
  if (d !== cur || !d.m || d.t || d.el.paused) return;
  const left = TRACKS[d.m].loop[1] - PRE - d.el.currentTime;
  if (left > 3) return;
  d.t = window.setTimeout(() => takeover(d), Math.max(0, (left * 1000) / (d.el.playbackRate || 1)));
}

/** The other deck starts silently from the loop start, in step with this one; they crossfade at the loop point. */
function takeover(d: Deck): void {
  d.t = 0;
  const a = ac(), m = d.m;
  if (!a || d !== cur || !m || d.el.paused) return;
  const [L, C] = TRACKS[m].loop, b = other(d);
  clearTimeout(b.t);
  b.t = 0;
  const n = ++b.n, src = trackUrl(m);
  b.m = m;
  hold(b.g.gain, a.currentTime);
  b.g.gain.linearRampToValueAtTime(0, a.currentTime + 0.03); // vẫn còn tắt dần bài trước (hiếm): im trước khi đổi tệp
  if (!b.el.src.endsWith(src.replace(/^\.\//, ''))) b.el.src = src;
  b.el.currentTime = Math.max(0, L + (d.el.currentTime - C));
  b.el.play().then(() => {
    b.blessed = true;
    if (b.n !== n || cur !== d || d.m !== m) return;
    // hai deck đang chạy: nối khi deck này tới điểm vòng; ghi độ lệch giữa hai deck (bảng chẩn đoán)
    const wait = Math.max(0, C - d.el.currentTime), t0 = a.currentTime + wait;
    stat.lag = Math.round((b.el.currentTime - L - (d.el.currentTime - C)) * 1000);
    hold(d.g.gain, a.currentTime);
    ramp(d.g.gain, t0, VOL[m], XF, false);
    hold(b.g.gain, a.currentTime);
    ramp(b.g.gain, t0, VOL[m], XF, true);
    cur = b;
    stat.loops++;
    const dn = ++d.n;
    d.m = null;
    d.busy = t0 + XF;
    d.t = window.setTimeout(() => { d.t = 0; if (d.n === dn) d.el.pause(); }, (wait + XF + 0.3) * 1000);
  }, () => {
    if (b.n !== n) return;
    stat.refused++;
    b.m = null; // bị chặn: deck này chạy tiếp tới cuối rồi quay về điểm vòng ('ended')
  });
}

function apply(): void {
  const m = S.sound && S.music ? want : null;
  if (cur && cur.m === m) return;
  const out = musicBus(), a = ac();
  if (!out || !a) return;
  // Until a user gesture unlocks audio the context stays suspended: wait instead of downloading a track that can't play.
  if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return; // retried on the first tap
  if (a.state !== 'running') { a.resume().then(() => { if (a.state === 'running') apply(); }, () => {}); return; }
  if (!master) { master = a.createGain(); master.connect(out); decks.push(deck(a, master), deck(a, master)); }
  // the deck that starts the new mood: a silent one, else the quieter of the two (cut short first)
  const idle = decks.find(d => !audible(d, a));
  for (const d of decks) if (d.m || d === cur) stopDeck(d, a);
  cur = null;
  if (!m) return;
  const d = idle || (decks[0].g.gain.value <= decks[1].g.gain.value ? decks[0] : decks[1]);
  if (!idle) { hold(d.g.gain, a.currentTime); d.g.gain.linearRampToValueAtTime(0, a.currentTime + 0.05); }
  const n = ++d.n;
  clearTimeout(d.t);
  d.t = 0;
  d.m = m;
  cur = d;
  const start = () => {
    if (d.n !== n) return;
    d.el.src = trackUrl(m);
    d.el.currentTime = 0;
    d.el.play().then(() => {
      d.blessed = true;
      if (d.n !== n || cur !== d) return;
      const t = a.currentTime;
      hold(d.g.gain, t);
      d.g.gain.setValueAtTime(0, t);
      d.g.gain.linearRampToValueAtTime(VOL[m], t + FADE);
    }).catch(() => { if (d.n === n && cur === d) { cur = null; d.m = null; } }); // not allowed yet: retried on the next tap
  };
  if (idle) start(); else window.setTimeout(start, 80); // deck vừa cắt: đổi bài khi nó đã im
}

/** Ask for a mood (null = silence). Starts as soon as the browser allows audio. 'finale': the ending's track (finaleFor). */
export function mood(m: Mood | null): void {
  want = m === 'finale' ? fin : m;
  apply();
}

/** Re-evaluate after the sound / music settings change. */
export const refreshMusic = apply;

/** Bảng chẩn đoán: từng deck (mood, giây, mức) và các lần nối vòng. */
export function musicStats(): string {
  const line = (d: Deck, i: number) => `${'AB'[i]} ${d.m || '—'}${d.el.paused ? '' : ` ${d.el.currentTime.toFixed(1)} s`} ×${d.g.gain.value.toFixed(2)}`;
  return decks.length ? `${decks.map(line).join(' · ')} · nối vòng ${stat.loops} (lệch ${stat.lag} ms${stat.refused ? `, bị chặn ${stat.refused}` : ''})` : 'chưa phát';
}

export function initMusic(): void {
  // Browsers only start audio from a user gesture: try again on every tap until it plays. pointerup / click: một cú chạm
  // trên màn cảm ứng chỉ được tính là cử chỉ người dùng từ lúc nhấc ngón (pointerdown của cảm ứng không mở khoá âm thanh)
  for (const t of ['pointerup', 'click']) addEventListener(t, () => { if (want && !cur) apply(); bless(); }, true);
  document.addEventListener('visibilitychange', () => {
    const a = ac();
    if (!cur || !a) return;
    if (document.hidden) {
      // đang nối vòng dở: dừng deck kia, deck đang phát giữ mức đầy đủ; chỉ deck ấy chạy lại khi quay về
      for (const d of decks) if (d !== cur && !d.el.paused) stopDeck(d, a, 0.05);
      clearTimeout(cur.t);
      cur.t = 0;
      if (cur.m) { hold(cur.g.gain, a.currentTime); cur.g.gain.setValueAtTime(VOL[cur.m], a.currentTime); }
      cur.el.pause();
    } else cur.el.play().catch(() => {});
  });
}
