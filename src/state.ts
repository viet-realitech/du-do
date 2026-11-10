import { surnameKey } from './data/surnames';
import { ERAS, EV, FIG, FIGERA, type Era, type HistEvent, type Option, type ValueKey } from './data';
import { VARIANT } from './data/cards';

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
const PREFS = ['sound', 'music', 'theme', 'pal', 'mstyle', 'grain', 'modern', 'grat', 'haptic', 'fx', 'narr', 'rate'] as const;

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
  /** Gia sản ngay sau mùa màng của từng thế hệ (id điểm rẽ → gia sản): kết cục nói đời nào gây dựng, đời nào mất mát. */
  snap: Record<string, Res>;
  /** Khoá họ (surnames.ts) khi chọn từ danh sách; '' khi gõ họ khác. */
  surname: string;
  /** Lịch sử đổi họ: năm, từ, sang, vì sao. */
  names: { y: number; from: string; to: string; why: string }[];
  /** Biến cố riêng đã gắn với một sự kiện, chốt lúc dòng họ quyết định thẻ của sự kiện đó: id sự kiện → id biến cố ('' = không có). */
  xs: Record<string, string>;
  /** Biến cố riêng chỉ áp dụng cho sự kiện từ năm này (bản lưu có trước tính năng: năm đang ở lúc mở lại). */
  xFrom: number;
  year: number;
  picks: Record<string, string>;
  seen: string[];
  /** Sự kiện tour đã đưa tới (bước tour đã bắt đầu): câu đố cuối chương chỉ hỏi về chúng (hay sự kiện đã mở trang). */
  shown: string[];
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
  /** Cảnh động: trận đánh 3D, ấn triện, phim tư liệu trong tour. */
  fx: boolean;
  narr: boolean;
  rate: number;
  zoomed: boolean;
  mapTapped: boolean;
  shared: boolean;
  ended: boolean;
  /** Thẻ đã quyết bằng bộ lựa chọn gốc trước khi có lựa chọn theo vùng (VARIANT): chỉ số lưu trong `cards` hiểu theo bộ gốc. */
  cardv: Record<string, 'base'>;
  /** Các thẻ có bộ lựa chọn thay thế (VARIANT) mà bản lưu này đã biết: thẻ có bộ mới thêm sau, đã quyết, giữ bộ gốc. */
  cvk: string[];
  /** Đọc sử: bước tour đang / vừa kể (chương, sự kiện); xoá khi xem xong hay bỏ qua chương. */
  tourAt: { e: string; id: string } | null;
}

const def: State = {
  step: 'splash', name: '', mode: 'read', home: 'hn', res: { ...RES0 }, rel: { ...REL0 }, cards: {}, harvests: [], snap: {}, surname: '', names: [], xs: {}, xFrom: 0, year: Y0, picks: {}, seen: [], shown: [], srcSeen: [], pvSeen: [], figSeen: [], quiz: {}, badges: [],
  filt: 'Tất cả', sound: true, music: true, theme: 'night', pal: 'flag', mstyle: 'co', grain: true, modern: false, grat: true, haptic: true, fx: true, narr: true, rate: 0.95, zoomed: false, mapTapped: false, shared: false, ended: false, cardv: {}, cvk: Object.keys(VARIANT), tourAt: null,
};

function load(mode = activeMode()): State {
  let s: State;
  let raw: Record<string, unknown> = {};
  try { raw = JSON.parse(localStorage.getItem(slotKey(mode)) || '{}'); } catch { /* hỏng: dùng mặc định */ }
  s = Object.assign({}, def, raw);
  // Bản lưu có trước biến cố riêng: không kéo dòng thời gian về những sự kiện đã đi qua.
  if (!('xFrom' in raw)) s.xFrom = typeof raw.year === 'number' ? raw.year : Y0;
  s.xs = { ...(s.xs || {}) }; s.names = [...(s.names || [])]; s.snap = { ...(s.snap || {}) }; s.shown = [...(s.shown || [])];
  // Bản lưu có trước lựa chọn theo vùng: thẻ đã quyết giữ nghĩa của bộ lựa chọn gốc (chỉ số không đổi nghĩa)
  s.cardv = { ...(s.cardv || {}) };
  const known = Array.isArray(raw.cvk) ? raw.cvk as string[] : 'cardv' in raw ? ['nt62', 'sg75'] : []; // cvk có từ khi thêm bộ tn80
  for (const id of Object.keys(VARIANT)) if (!known.includes(id) && s.cards && id in s.cards) s.cardv[id] = 'base';
  s.cvk = Object.keys(VARIANT);
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
  S = Object.assign({}, def, { picks: {}, quiz: {}, seen: [], shown: [], srcSeen: [], pvSeen: [], figSeen: [], badges: [], cards: {}, cardv: {}, cvk: Object.keys(VARIANT), tourAt: null, harvests: [], snap: {}, surname: '', names: [], xs: {}, xFrom: 0, res: { ...RES0 }, rel: { ...REL0 }, mode: S.mode, home: S.home, sound: S.sound, music: S.music, theme: S.theme, pal: S.pal, mstyle: S.mstyle, grain: S.grain, modern: S.modern, grat: S.grat, haptic: S.haptic, fx: S.fx, narr: S.narr, rate: S.rate });
  rt.focusEv = null;
  rt.gate = null;
  rt.card = null;
  rt.flowTo = null;
  save();
}

/** Transient (non-persisted) UI state shared across modules. */
export const rt = {
  focusEv: null as HistEvent | null,
  gate: null as Era | null,
  card: null as HistEvent | null,
  /** Chế độ Chơi: năm mà luồng đang tự chạy tới (qua các thẻ bắt buộc) trước khi mở điểm rẽ. */
  flowTo: null as number | null,
  /** Đọc sử: chương vừa xem hết tour (câu đố của chương chỉ hỏi khi vừa xem xong). */
  toured: null as string | null,
};

/** Còn điểm rẽ chưa chọn tính đến năm hiện tại. */
export const ERAS_PENDING = () => ERAS.some(e => !S.picks[e.id] && e.cy <= S.year);
export const eraOf = (y: number): Era => [...ERAS].reverse().find(e => y >= e.from) || ERAS[0];
/** Sự kiện đầu năm 1954 khép chương 4 (Điện Biên Phủ, Genève) dù cùng năm với điểm rẽ 5, vốn hỏi "sau Genève, ở lại đâu?". */
const CH: Record<string, string> = { dbp: 'e4', gnv: 'e4' };
/** Chương của một sự kiện: trang nhật ký theo hướng đã mở nó; vài mốc khép chương theo CH; còn lại theo năm. */
export const evEra = (v: HistEvent): Era => ERAS.find(e => e.id === (v.diary ? v.era : CH[v.id])) || eraOf(v.y);
/** Năm đại diện của sự kiện trong chương của nó (tra hướng đã chọn, biến cố riêng…): Điện Biên Phủ → 1953. */
export const chYear = (v: HistEvent): number => { const e = evEra(v), nx = ERAS[ERAS.indexOf(e) + 1]; return Math.max(e.cy, Math.min(v.y, nx ? nx.cy - 1 : v.y)); };
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
/* Câu đố đã hỏi trên máy này, chung cho cả hai luồng (Đọc sử, Trò chơi có bản lưu riêng): lần sau hỏi câu khác. */
const ASKED_KEY = 'dudo-quiz-asked';
export function quizAsked(): string[] {
  try { const a = JSON.parse(localStorage.getItem(ASKED_KEY) || '[]'); return Array.isArray(a) ? a : []; } catch { return []; }
}
export function markAsked(q: string): void {
  try { const a = quizAsked(); if (!a.includes(q)) { a.push(q); localStorage.setItem(ASKED_KEY, JSON.stringify(a)); } } catch { /* private mode */ }
}
export const familyName = () => S.name || 'Họ Lê';
/** Tên họ qua các lần đổi: "Họ Nguyễn → Họ Lê" (gia phả, kết cục, phim hành trình). */
export const nameChain = (): string => (S.names.length ? [S.names[0].from, ...S.names.map(n => n.to)].join(' → ') : familyName());
/** Dòng họ đổi họ (biến cố riêng): ghi vào gia phả rồi đổi tên hiển thị. */
export function renameFamily(to: string, y: number, why: string): void {
  if (!to || to === S.name) return;
  S.names.push({ y, from: familyName(), to, why });
  S.name = to;
  S.surname = surnameKey(to);
  save();
}

/** Bắt đầu lại gia sản (khi đổi sang chế độ Chơi giữa chừng). */
export function resetPlay(): void {
  if (S.names.length) { S.name = S.names[0].from; S.surname = surnameKey(S.name); } // chơi lại: họ ban đầu
  S.res = { ...RES0 }; S.rel = { ...REL0 }; S.cards = {}; S.harvests = []; S.snap = {}; S.names = []; S.xs = {}; S.xFrom = 0;
  save();
}

/** Chuyển luồng (Đọc sử ⇄ Trò chơi): lưu luồng hiện tại, mở bản lưu của luồng kia, giữ thiết lập thiết bị. */
export function switchMode(m: 'read' | 'play'): void {
  if (m === S.mode) return;
  save();
  const prev = S;
  S = load(m);
  for (const k of PREFS) (S as unknown as Record<string, unknown>)[k] = prev[k];
  rt.focusEv = null; rt.gate = null; rt.card = null; rt.flowTo = null;
  save();
}
