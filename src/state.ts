import { ERAS, EV, FIG, FIGERA, type Era, type HistEvent, type Option, type ValueKey } from './data';

export type Theme = 'archive' | 'night' | 'poster';
export type Res = { g: number; d: number; b: number; u: number };
export type Rel = { tr: number; ph: number; nh: number; vm: number; qg: number; my: number; nn: number; lg: number };
const RES0: Res = { g: 50, d: 40, b: 30, u: 20 };
const REL0: Rel = { tr: 50, ph: 35, nh: 35, vm: 40, qg: 40, my: 35, nn: 45, lg: 50 };

export const Y0 = 1858;
export const Y1 = 2026;
/* Hai luồng tách riêng, mỗi luồng một bản lưu: Đọc sử ('dudo-v2') và Trò chơi ('dudo-v2-play').
   'dudo-mode' ghi luồng đang mở; public/boot.js đọc cùng khoá để tô giao diện trước khi app chạy. */
const MODE_KEY = 'dudo-mode';
const slotKey = (m: 'read' | 'play') => (m === 'play' ? 'dudo-v2-play' : 'dudo-v2');
const activeMode = (): 'read' | 'play' => { try { return localStorage.getItem(MODE_KEY) === 'play' ? 'play' : 'read'; } catch { return 'read'; } };
/** Thiết lập thiết bị, dùng chung cho cả hai luồng. */
const PREFS = ['sound', 'music', 'theme', 'pal', 'mstyle', 'grain', 'modern', 'grat', 'haptic', 'narr', 'rate'] as const;

export interface State {
  step: 'splash' | 'intro' | 'play';
  name: string;
  /** Đọc sử (kể chuyện) hay Chơi (gia sản, thẻ ứng xử). */
  mode: 'read' | 'play';
  home: string;
  res: Res;
  rel: Rel;
  /** Thẻ sự kiện đã quyết định: id sự kiện → chỉ số lựa chọn. */
  cards: Record<string, number>;
  harvests: string[];
  year: number;
  picks: Record<string, string>;
  seen: string[];
  srcSeen: string[];
  pvSeen: string[];
  figSeen: string[];
  quiz: Record<string, boolean[]>;
  badges: string[];
  filt: string;
  sound: boolean;
  theme: Theme;
  pal: 'flag' | 'sepia';
  mstyle: 'co' | 'flat';
  grain: boolean;
  modern: boolean;
  grat: boolean;
  music: boolean;
  haptic: boolean;
  narr: boolean;
  rate: number;
  zoomed: boolean;
  mapTapped: boolean;
  shared: boolean;
  ended: boolean;
}

const def: State = {
  step: 'splash', name: '', mode: 'read', home: 'hn', res: { ...RES0 }, rel: { ...REL0 }, cards: {}, harvests: [], year: Y0, picks: {}, seen: [], srcSeen: [], pvSeen: [], figSeen: [], quiz: {}, badges: [],
  filt: 'Tất cả', sound: true, music: true, theme: 'night', pal: 'flag', mstyle: 'co', grain: true, modern: false, grat: true, haptic: true, narr: true, rate: 0.95, zoomed: false, mapTapped: false, shared: false, ended: false,
};

function load(mode = activeMode()): State {
  let s: State;
  try { s = Object.assign({}, def, JSON.parse(localStorage.getItem(slotKey(mode)) || '{}')); } catch { s = { ...def }; }
  s.mode = mode;
  s.res = { ...RES0, ...s.res }; s.rel = { ...REL0, ...s.rel };
  return s;
}

export let S: State = load();

export function save(): void {
  try { localStorage.setItem(slotKey(S.mode), JSON.stringify(S)); localStorage.setItem(MODE_KEY, S.mode); } catch { /* private mode: progress lives for this session only */ }
}

/** Start over, keeping device preferences. */
export function resetState(): void {
  S = Object.assign({}, def, { picks: {}, quiz: {}, seen: [], srcSeen: [], pvSeen: [], figSeen: [], badges: [], cards: {}, harvests: [], res: { ...RES0 }, rel: { ...REL0 }, mode: S.mode, home: S.home, sound: S.sound, music: S.music, theme: S.theme, pal: S.pal, mstyle: S.mstyle, grain: S.grain, modern: S.modern, grat: S.grat, haptic: S.haptic, narr: S.narr, rate: S.rate });
  rt.focusEv = null;
  rt.gate = null;
  save();
}

/** Transient (non-persisted) UI state shared across modules. */
export const rt = {
  focusEv: null as HistEvent | null,
  gate: null as Era | null,
  card: null as HistEvent | null,
};

/** Còn điểm rẽ chưa chọn tính đến năm hiện tại. */
export const ERAS_PENDING = () => ERAS.some(e => !S.picks[e.id] && e.cy <= S.year);
export const eraOf = (y: number): Era => [...ERAS].reverse().find(e => y >= e.from) || ERAS[0];
export const optOf = (e: Era): Option | undefined => e.opts.find(o => o.id === S.picks[e.id]);
export const curPick = (y: number) => optOf(eraOf(y));
export const picked = (): Option[] => ERAS.map(optOf).filter((o): o is Option => !!o);

export function values(): Record<ValueKey, number> {
  const v: Record<ValueKey, number> = { doc: 0, song: 0, tudo: 0, dk: 0 };
  picked().forEach(o => Object.entries(o.fx || {}).forEach(([k, n]) => (v[k as ValueKey] += n as number)));
  return v;
}

export function allEv(): HistEvent[] {
  const d: HistEvent[] = [];
  picked().forEach(o => d.push(...o.diary));
  return EV.concat(d).sort((a, b) => a.y - b.y || (a.diary ? 1 : 0) - (b.diary ? 1 : 0));
}

export const visEv = (): HistEvent[] => allEv().filter(v => S.filt === 'Tất cả' || v.k === S.filt);
export const figOpen = (id: string) => !!S.picks[FIGERA[id]];
export const figsMet = () => new Set(Object.keys(FIG).filter(figOpen));
export const pct = (y: number) => ((y - Y0) / (Y1 - Y0)) * 100;

export function setFocus(): void {
  const list = visEv().filter(v => v.y <= S.year);
  rt.focusEv = list.length ? list[list.length - 1] : null;
}

export function archetype(): [string, string] | null {
  const c: Record<string, number> = { vutrang: 0, caicach: 0, thuongthuyet: 0 };
  picked().forEach(o => c[o.tag]++);
  const top = Object.entries(c).sort((a, b) => b[1] - a[1])[0];
  if (!top[1]) return null;
  return ({
    vutrang: ['Người cầm súng', 'Bạn tin rằng độc lập phải giành bằng đấu tranh trực diện.'],
    caicach: ['Nhà canh tân', 'Bạn tin vào giáo dục, cải cách và thay đổi từ bên trong.'],
    thuongthuyet: ['Người hoà giải', 'Bạn chọn thương thuyết, nhượng bộ và giữ gìn sinh mạng.'],
  } as Record<string, [string, string]>)[top[0]];
}

export function matchStats() {
  let m = 0, t = 0, ag = 0;
  ERAS.forEach(e => {
    if (!e.prev) return;
    t++;
    const o = S.picks[e.id];
    if (!o) return;
    if (o === e.prev) m++; else ag++;
  });
  return { m, t, ag };
}

export const quizCorrect = () => Object.values(S.quiz).flat().filter(Boolean).length;
export const familyName = () => S.name || 'Họ Lê';

/** Bắt đầu lại gia sản (khi đổi sang chế độ Chơi giữa chừng). */
export function resetPlay(): void {
  S.res = { ...RES0 }; S.rel = { ...REL0 }; S.cards = {}; S.harvests = [];
  save();
}

/** Chuyển luồng (Đọc sử ⇄ Trò chơi): lưu luồng hiện tại, mở bản lưu của luồng kia, giữ thiết lập thiết bị. */
export function switchMode(m: 'read' | 'play'): void {
  if (m === S.mode) return;
  save();
  const prev = S;
  S = load(m);
  for (const k of PREFS) (S as unknown as Record<string, unknown>)[k] = prev[k];
  rt.focusEv = null; rt.gate = null; rt.card = null;
  save();
}
