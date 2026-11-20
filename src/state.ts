import { surnameKey } from './data/surnames';
import { ERAS, EV, FIG, FIGERA, type Era, type HistEvent, type Option, type ValueKey } from './data';
import { VARIANT } from './data/cards';
import { boot } from './boot';

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
  /** Phiên bản hình dạng bản lưu (SAVE_V lúc ghi); bản lưu chưa có trường này là phiên bản 0. */
  v: number;
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
  /** Bản lưu có trước việc điểm rẽ 5 dời nhà (di cư, tập kết): năm đang ở lúc mở lại. Trước năm này dòng họ vẫn ở quê,
      như lúc đã quyết các thẻ ấy (play.ts regionAt); 0 = bản lưu mới. */
  movedFrom: number;
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
  /** Đã tự đọc tên kết cục một lần (lần đầu mở màn kết có kết cục; hồ sơ còn bỏ ngỏ không tính). */
  endSaid: boolean;
  /** Thẻ đã quyết bằng bộ lựa chọn gốc trước khi có lựa chọn theo vùng (VARIANT): chỉ số lưu trong `cards` hiểu theo bộ gốc. */
  cardv: Record<string, 'base'>;
  /** Các thẻ có bộ lựa chọn thay thế (VARIANT) mà bản lưu này đã biết: thẻ có bộ mới thêm sau, đã quyết, giữ bộ gốc. */
  cvk: string[];
  /** Đọc sử: bước tour đang / vừa kể (chương, sự kiện); xoá khi xem xong hay bỏ qua chương. */
  tourAt: { e: string; id: string } | null;
}

/* ---------- bản lưu: số phiên bản, các bước nâng cấp, kiểm tra kiểu ---------- */
type Raw = Record<string, unknown>;
const isObj = (x: unknown): x is Raw => !!x && typeof x === 'object' && !Array.isArray(x);
/** MIGRATE[i] nâng bản lưu phiên bản i lên i + 1. Đổi hình dạng bản lưu: thêm một bước vào cuối (SAVE_V tự tăng theo);
    không sửa, không xoá bước cũ, để bản lưu cũ đến mấy cũng đi qua đủ các bước theo đúng thứ tự. */
const MIGRATE: ((raw: Raw) => void)[] = [
  // 0 → 1: bản lưu chưa đánh số (mọi bản lưu tới 6f464aa, cả các trường đợt E, F thêm như endSaid). Các trường thêm dần
  // trước đây được suy bằng "bản lưu đã có khoá này chưa", y như load() cũ
  raw => {
    const y = typeof raw.year === 'number' ? raw.year : undefined, pk = isObj(raw.picks) ? raw.picks : {};
    // Bản lưu có trước biến cố riêng: không kéo dòng thời gian về những sự kiện đã đi qua.
    if (!('xFrom' in raw)) raw.xFrom = y ?? Y0;
    // Bản lưu có trước việc điểm rẽ 5 dời nhà (cùng bản với `shown`): những năm đã chơi giữ vùng quê như lúc chơi, không kéo
    // dòng thời gian về 1955 bắt quyết lại thẻ của nơi ở mới (bản lưu đã xong thì không dời nhà nữa)
    if (!('shown' in raw) && pk.e5) raw.movedFrom = y ?? Y1;
    // cvk có từ khi thêm bộ tn80; bản lưu có cardv mà chưa có cvk đã biết hai bộ nt62, sg75
    if (!Array.isArray(raw.cvk)) raw.cvk = 'cardv' in raw ? ['nt62', 'sg75'] : [];
    // bản lưu có trước việc tự đọc tên kết cục: ai đã mở kết luận khi đủ sáu điểm rẽ (đã thấy tên kết cục) thì không tự đọc
    // nữa; ai mới chỉ mở hồ sơ còn bỏ ngỏ (Đọc sử) thì chưa thấy kết cục nào, lần đầu có kết cục vẫn được đọc
    if (!('endSaid' in raw)) raw.endSaid = !!raw.ended && ERAS.every(e => !!pk[e.id]);
  },
];
/** Phiên bản bản lưu hiện nay (trường `v`). */
export const SAVE_V = MIGRATE.length;

const def: State = {
  v: SAVE_V, step: 'splash', name: '', mode: 'read', home: 'hn', res: { ...RES0 }, rel: { ...REL0 }, cards: {}, harvests: [], snap: {}, surname: '', names: [], xs: {}, xFrom: 0, movedFrom: 0, year: Y0, picks: {}, seen: [], shown: [], srcSeen: [], pvSeen: [], figSeen: [], quiz: {}, badges: [],
  filt: 'Tất cả', sound: true, music: true, theme: 'archive', pal: 'flag', mstyle: 'co', grain: true, modern: false, grat: true, haptic: true, fx: true, narr: true, rate: 0.95, zoomed: false, mapTapped: false, shared: false, ended: false, endSaid: false, cardv: {}, cvk: Object.keys(VARIANT), tourAt: null,
};


/** Số hữu hạn (cả chuỗi số như "1954"), không thì undefined. */
const toNum = (x: unknown): number | undefined => {
  const n = typeof x === 'number' ? x : typeof x === 'string' && x.trim() !== '' ? Number(x) : NaN;
  return Number.isFinite(n) ? n : undefined;
};
const ENUM: Partial<Record<keyof State, readonly string[]>> = { step: ['splash', 'intro', 'play'], theme: ['archive', 'night', 'poster'], pal: ['flag', 'sepia'], mstyle: ['co', 'flat'] };
const LISTS = ['harvests', 'seen', 'shown', 'srcSeen', 'pvSeen', 'figSeen', 'badges', 'cvk'] as const;
const FLAGS = ['sound', 'music', 'grain', 'modern', 'grat', 'haptic', 'fx', 'narr', 'zoomed', 'mapTapped', 'shared', 'ended', 'endSaid'] as const;
const TEXTS = ['name', 'home', 'surname', 'filt'] as const;

/** Kiểm tra từng trường theo kiểu của nó, sửa được gì sửa nấy, không bỏ cả bản lưu. Khoá thiếu lấy mặc định (bản lưu cũ,
    không tính là sửa); khoá sai kiểu thì sửa và ghi tên vào `fixed`. Không bỏ id nào chỉ vì ứng dụng không còn biết nó
    (hướng, thẻ, sự kiện đã đổi tên vẫn mở được như trước); khoá lạ giữ nguyên. Đối tượng, mảng trả về đều là bản mới. */
function sanitize(raw: Raw, fixed: string[]): State {
  const D = JSON.parse(JSON.stringify(def)) as Raw; // mặc định, bản mới: không dùng chung mảng / đối tượng với `def`
  const s: Raw = { ...D, ...raw }; // thứ tự khoá như trước (mặc định, rồi khoá lạ của bản lưu)
  const has = (k: string) => raw[k] !== undefined;
  const fix = (k: string) => { if (!fixed.includes(k)) fixed.push(k); };
  // { khoá: giá trị } giữ những mục `ok`; `conv` đổi giá trị gần đúng (chuỗi số → số)
  const rec = <T>(k: string, ok: (x: unknown) => x is T, conv?: (x: unknown) => T | undefined): void => {
    if (!has(k)) { s[k] = D[k]; return; }
    if (!isObj(raw[k])) { fix(k); s[k] = D[k]; return; }
    const o: Record<string, T> = {};
    for (const [id, x] of Object.entries(raw[k] as Raw)) {
      if (ok(x)) o[id] = x;
      else { fix(k); const c = conv?.(x); if (c !== undefined) o[id] = c; }
    }
    s[k] = o;
  };
  const isStr = (x: unknown): x is string => typeof x === 'string';
  const isInt = (x: unknown): x is number => typeof x === 'number' && Number.isInteger(x);
  const intOf = (x: unknown) => { const n = toNum(x); return n !== undefined && Number.isInteger(n) ? n : undefined; };
  // gia sản / quan hệ: đủ các khoá số, khoá thiếu hay sai lấy mặc định
  const pool = <T extends Record<string, number>>(x: unknown, d: T, k: string): T => {
    if (!isObj(x)) { fix(k); return { ...d }; }
    const o: Raw = { ...x };
    for (const n of Object.keys(d)) {
      if (x[n] === undefined) { o[n] = d[n]; continue; }
      const v = toNum(x[n]);
      if (typeof x[n] !== 'number' || v === undefined) fix(k);
      o[n] = v ?? d[n];
    }
    return o as T;
  };

  for (const k of TEXTS) if (has(k) && !isStr(raw[k])) { fix(k); s[k] = D[k]; } else if (!has(k)) s[k] = D[k];
  for (const k of FLAGS) if (has(k) && typeof raw[k] !== 'boolean') { fix(k); s[k] = D[k]; } else if (!has(k)) s[k] = D[k];
  for (const k of LISTS) {
    if (!has(k)) { s[k] = D[k]; continue; }
    const a = raw[k];
    if (!Array.isArray(a)) { fix(k); s[k] = k === 'cvk' ? Object.keys(VARIANT) : []; continue; } // cvk hỏng: coi như đã biết mọi bộ, không đọc lại thẻ nào
    const b = a.filter(isStr);
    if (b.length !== a.length) fix(k);
    s[k] = b;
  }
  for (const [k, vals] of Object.entries(ENUM)) if (has(k) && !vals!.includes(raw[k] as string)) { fix(k); s[k] = D[k]; } else if (!has(k)) s[k] = D[k];
  rec('picks', isStr);
  rec('xs', isStr);
  rec('cards', isInt, intOf); // chỉ số lựa chọn: "1" → 1; không đọc được thì thẻ ấy hỏi lại
  rec('cardv', (x): x is 'base' => x === 'base');
  rec('quiz', (x): x is boolean[] => Array.isArray(x) && x.every(b => typeof b === 'boolean'), x => (Array.isArray(x) ? x.map(b => b === true) : undefined));
  s.res = has('res') ? pool(raw.res, RES0, 'res') : { ...RES0 };
  s.rel = has('rel') ? pool(raw.rel, REL0, 'rel') : { ...REL0 };
  if (has('snap')) {
    if (!isObj(raw.snap)) { fix('snap'); s.snap = {}; }
    else s.snap = Object.fromEntries(Object.entries(raw.snap).flatMap(([id, r]) => (isObj(r) ? [[id, pool(r, RES0, 'snap')]] : (fix('snap'), []))));
  } else s.snap = {};
  if (has('names')) {
    const a = Array.isArray(raw.names) ? raw.names : (fix('names'), []);
    s.names = a.flatMap(n => {
      if (!isObj(n) || !isStr(n.from) || !isStr(n.to)) { fix('names'); return []; }
      const y = toNum(n.y);
      if (y === undefined || !isStr(n.why)) fix('names');
      return [{ ...n, y: y ?? Y0, why: isStr(n.why) ? n.why : '' }];
    });
  } else s.names = [];
  if (has('tourAt') && raw.tourAt !== null) {
    const t = raw.tourAt;
    if (isObj(t) && isStr(t.e) && isStr(t.id)) s.tourAt = { e: t.e, id: t.id };
    else { fix('tourAt'); s.tourAt = null; }
  } else s.tourAt = null;
  // năm: số trong 1858–2026 ("1954" đọc được; ngoài khoảng thì kẹp lại)
  const y = toNum(raw.year);
  if (has('year') && (typeof raw.year !== 'number' || y === undefined || y < Y0 || y > Y1)) fix('year');
  s.year = y === undefined ? Y0 : Math.min(Y1, Math.max(Y0, y));
  for (const k of ['xFrom', 'movedFrom'] as const) {
    const n = toNum(raw[k]);
    if (has(k) && (typeof raw[k] !== 'number' || n === undefined)) fix(k);
    // biến cố riêng chỉ từ năm đang ở (như bản lưu có trước tính năng); dời nhà: không ghim năm nào
    s[k] = n ?? (k === 'xFrom' ? s.year : 0);
  }
  const r = toNum(raw.rate);
  if (has('rate') && (typeof raw.rate !== 'number' || r === undefined || r <= 0 || r > 3)) { fix('rate'); s.rate = D.rate; } else s.rate = r ?? D.rate;
  // bước hỏng: đã chọn điểm rẽ hay đã đi qua năm đầu thì đang chơi dở, không về màn chào
  if (has('step') && fixed.includes('step') && (Object.keys(s.picks as Raw).length || (s.year as number) > Y0)) s.step = 'play';
  return s as unknown as State;
}

/** Kết quả đọc một bản lưu: trạng thái, các trường đã sửa, phiên bản gốc; `unreadable` khi không đọc được gì (không phải
    JSON, hay không phải một đối tượng); `newer` khi bản lưu do bản ứng dụng mới hơn ghi. */
export interface Loaded { s: State; fixed: string[]; from: number; unreadable?: boolean; newer?: boolean }

/** Đọc chuỗi bản lưu `txt` của luồng `mode` (không đụng bộ nhớ, không báo gì ra ngoài: load() làm việc ấy).
    Chưa có bản lưu: như một bản lưu rỗng chưa đánh số, đúng như trước khi có phiên bản. */
export function readSave(txt: string | null, mode: 'read' | 'play'): Loaded {
  let raw: unknown = {};
  if (txt) { try { raw = JSON.parse(txt); } catch { raw = undefined; } }
  if (!isObj(raw)) { const s = sanitize({}, []); s.mode = mode; return { s, fixed: [], from: SAVE_V, unreadable: true }; }
  const fixed: string[] = [];
  let from = 0;
  if (raw.v !== undefined) {
    const n = toNum(raw.v);
    if (n !== undefined && Number.isInteger(n) && n >= 0) from = n; else fixed.push('v');
  }
  // chạy từng bước nâng cấp còn thiếu; bản lưu của bản ứng dụng mới hơn: không đoán bước nào, chỉ kiểm tra kiểu
  for (let i = from; i < SAVE_V; i++) MIGRATE[i](raw);
  const s = sanitize(raw, fixed);
  // Bản lưu có trước lựa chọn theo vùng: thẻ đã quyết giữ nghĩa của bộ lựa chọn gốc (chỉ số không đổi nghĩa). Thẻ đã có
  // bộ thay thế mà nay thêm bộ mới thì đọc theo bộ mới, xếp cùng thứ tự nghĩa: vd. nhà vượt biển 1980, "bán chính thức"
  // 1979, đi diện đoàn tụ (ODP) đã quyết Đổi Mới 1986, năm 1995, WTO 2007 khi các thẻ ấy còn nói từ trong nước, nay đọc
  // bằng bộ nói từ xứ người; nhà họ Lý đi năm 1979 đã quyết thẻ năm 1980 thì đọc bằng bộ của nhà đã ở Hồng Kông; nhà giàu
  // nhất làng đã quyết thẻ năm 1955 nay đọc theo bộ "trước khi đội về": "bị quy địa chủ" là giữ ruộng chờ đội, "bần nông"
  // là giảm tô, thoái tô (cards.ts VARIANT). Chạy mỗi lần mở: bộ thay thế mới có thể thêm vào mà không đổi phiên bản.
  for (const id of Object.keys(VARIANT)) if (!s.cvk.includes(id) && id in s.cards) s.cardv[id] = 'base';
  s.cvk = Object.keys(VARIANT);
  s.mode = mode;
  // không bao giờ hạ số phiên bản: bản ứng dụng mới hơn mở lại bản lưu này thì không chạy lại các bước đã chạy
  s.v = Math.max(from, SAVE_V);
  return { s, fixed, from, newer: from > SAVE_V || undefined };
}

/** Ghi chú về bản lưu lúc mở (đã sửa gì, đã cất bản sao nào): main.ts chuyển vào sổ lỗi trên máy (errlog.ts) khi sổ đã
    sẵn sàng (state.ts chạy cả trong node, không nhập errlog.ts). */
export const saveNotes = { list: [] as string[], sink: null as ((m: string) => void) | null };
const noteSave = (m: string) => { if (saveNotes.sink) saveNotes.sink(m); else saveNotes.list.push(m); };

function load(mode = activeMode()): State {
  const key = slotKey(mode);
  let txt: string | null = null;
  try { txt = localStorage.getItem(key); } catch { /* chế độ riêng tư: bắt đầu mới */ }
  const r = readSave(txt, mode), b = boot();
  if (r.unreadable) {
    // không đọc được gì: cất bản sao, mở màn khôi phục (public/boot.js) và dừng ứng dụng tại đây, không ghi đè lên nó
    noteSave(`Bản lưu ${key} không đọc được (${(txt || '').length} ký tự)`);
    if (b) {
      b.keep(key, 'không đọc được');
      b.rescue('save', key);
      throw new Error(`Bản lưu ${key} không đọc được`);
    }
    return r.s; // không có lưới khởi động (công cụ chạy bằng node): bắt đầu mới
  }
  if (r.fixed.length) { noteSave(`Bản lưu ${key}: đã sửa ${r.fixed.join(', ')}`); b?.keep(key, 'đã sửa ' + r.fixed.join(', ')); }
  // bản lưu của bản ứng dụng mới hơn: cất một bản sao lần đầu gặp phiên bản ấy (bản này ghi lại thì không cất thêm)
  const newer = `phiên bản ${r.from}, mới hơn bản ứng dụng này`;
  if (r.newer && b && !b.kept().some(k => k.key === key && k.why === newer)) { noteSave(`Bản lưu ${key} của bản ứng dụng mới hơn (phiên bản ${r.from})`); b.keep(key, newer); }
  return r.s;
}

export let S: State = load();

/** Đang mở lại hồ sơ một dòng họ đã khép (viewRun): S là bản lưu trong Sổ kết cục, không được ghi đè lên ván đang chơi. */
let frozen = 0;
export const readOnly = (): boolean => frozen > 0;

export function save(): void {
  if (frozen) return;
  try { localStorage.setItem(slotKey(S.mode), JSON.stringify(S)); localStorage.setItem(MODE_KEY, S.mode); } catch { /* private mode: progress lives for this session only */ }
}

/* ---------- Sổ kết cục: hồ sơ các dòng họ đã khép, giữ qua mọi lần chọn lại ---------- */
/* Khoá riêng 'dudo-archive', ngoài hai bản lưu: chọn lại từ 1858 không đụng tới nó. Chỉ đọc khi mở Hồ sơ hay màn kết
   (không bao giờ lúc khởi động), và đọc kiểu không bao giờ ném lỗi: sổ hỏng thì sửa được gì sửa nấy hay coi như trống,
   không mở màn khôi phục (public/boot.js chỉ lo hai bản lưu). Mỗi hồ sơ giữ cả bản lưu lúc khép (~2 KB), mở lại qua
   readSave() như một bản lưu thật, nên đi qua đủ các bước nâng cấp MIGRATE của mọi phiên bản về sau. */
const ARC_KEY = 'dudo-archive';
/** Bản sao sổ không đọc được, cất một lần trước khi ghi đè. */
const ARC_BROKEN = 'dudo-archive-broken';
/** Số hồ sơ giữ tối đa; đầy thì bỏ hồ sơ cũ nhất, dấu kết cục của nó vẫn được đếm (`gone`). */
export const ARC_MAX = 20;
export interface ArcRun {
  /** Mã ngẫu nhiên của ván. */
  id: string;
  /** Lúc dòng họ khép hồ sơ lần đầu (ISO). */
  at: string;
  mode: 'read' | 'play';
  /** Kết cục (id trong ENDINGS) và tên kết cục theo con đường, lúc khép. */
  end: string;
  title: string;
  /** Tên họ qua các lần đổi; quê (Trò chơi, '' ở Đọc sử). */
  name: string;
  home: string;
  /** Cả bản lưu lúc khép. */
  save: Raw;
}
export interface Archive {
  v: number;
  /** Cũ trước, mới sau. */
  runs: ArcRun[];
  /** Hồ sơ đã rời sổ vì sổ đầy: kết cục → số lần. */
  gone: Record<string, number>;
  /** Ván đang chơi của mỗi luồng đã có hồ sơ nào trong sổ (mở lại màn kết thì cập nhật hồ sơ ấy, không thêm hồ sơ mới). */
  live: Partial<Record<'read' | 'play', string>>;
  /** Đã xin trình duyệt giữ bộ nhớ lâu dài (navigator.storage.persist) một lần. */
  asked?: boolean;
}
const okRun = (r: unknown): r is Raw => isObj(r) && typeof r.id === 'string' && !!r.id && (r.mode === 'read' || r.mode === 'play') && typeof r.end === 'string' && isObj(r.save);
const str = (x: unknown) => (typeof x === 'string' ? x : '');
/** Đọc sổ: hồ sơ hỏng thì bỏ riêng hồ sơ ấy; cả sổ không đọc được thì coi như trống (`bad`: chưa ghi đè thì cất bản sao). */
function readArc(): { a: Archive; raw: string | null; bad: boolean } {
  const a: Archive = { v: 1, runs: [], gone: {}, live: {} };
  let raw: string | null = null;
  try { raw = localStorage.getItem(ARC_KEY); } catch { /* riêng tư */ }
  if (raw === null) return { a, raw, bad: false };
  let o: unknown;
  try { o = JSON.parse(raw); } catch { return { a, raw, bad: true }; }
  if (!isObj(o)) return { a, raw, bad: true };
  let bad = false;
  if (o.runs !== undefined && !Array.isArray(o.runs)) bad = true;
  const runs: unknown[] = Array.isArray(o.runs) ? o.runs : [];
  for (const r of runs) {
    if (!okRun(r)) { bad = true; continue; }
    if (a.runs.some(x => x.id === r.id)) continue;
    // khoá lạ (bản ứng dụng mới hơn ghi) giữ nguyên
    a.runs.push({ ...r, id: r.id as string, mode: r.mode as 'read' | 'play', end: r.end as string, save: r.save as Raw, at: str(r.at), title: str(r.title), name: str(r.name), home: str(r.home) });
  }
  if (isObj(o.gone)) for (const [k, n] of Object.entries(o.gone)) { if (typeof n === 'number' && Number.isInteger(n) && n > 0) a.gone[k] = n; else bad = true; }
  if (isObj(o.live)) for (const m of ['read', 'play'] as const) { const id = o.live[m]; if (typeof id === 'string' && a.runs.some(r => r.id === id)) a.live[m] = id; }
  if (o.asked === true) a.asked = true;
  const v = toNum(o.v);
  if (v !== undefined && Number.isInteger(v) && v > 1) a.v = v; // sổ do bản ứng dụng mới hơn ghi: không hạ số
  return { a: { ...o, ...a }, raw, bad };
}
/** Ghi sổ; bộ nhớ đầy thì bỏ dần hồ sơ cũ nhất (vẫn đếm dấu) rồi thử lại. Sổ cũ không đọc được: cất một bản sao trước. */
function writeArc(a: Archive, prev: { raw: string | null; bad: boolean }): boolean {
  try {
    if (prev.bad && prev.raw !== null && localStorage.getItem(ARC_BROKEN) === null) {
      localStorage.setItem(ARC_BROKEN, prev.raw);
      noteSave(`Sổ kết cục ${ARC_KEY} hỏng (${prev.raw.length} ký tự): đã cất bản sao ${ARC_BROKEN} trước khi ghi lại`);
    }
  } catch { /* đầy: thôi không cất */ }
  for (;;) {
    try { localStorage.setItem(ARC_KEY, JSON.stringify(a)); return true; } catch {
      if (a.runs.length <= 1) return false;
      dropOldest(a);
    }
  }
}
function dropOldest(a: Archive): void {
  const r = a.runs.shift();
  if (!r) return;
  a.gone[r.end] = (a.gone[r.end] || 0) + 1;
  for (const m of ['read', 'play'] as const) if (a.live[m] === r.id) delete a.live[m];
}
/** Sổ kết cục hiện có (không bao giờ ném lỗi). */
export const archive = (): Archive => readArc().a;
/** Dấu hiệu nhận ra cùng một dòng họ: luồng, họ ban đầu, quê, sáu hướng (đủ cả sáu khi đã có kết cục, không đổi nữa). */
const runKey = (s: State | Raw): string => {
  const x = s as Raw, names = Array.isArray(x.names) ? x.names : [], n0 = isObj(names[0]) ? str(names[0].from) : '', pk = isObj(x.picks) ? x.picks : {};
  return [x.mode, n0 || str(x.name), str(x.home), ...ERAS.map(e => str(pk[e.id]))].join('|');
};
/** Hồ sơ trong sổ của ván đang chơi (luồng hiện tại), nếu đã khép. */
export function liveRun(a = archive()): ArcRun | undefined {
  const id = a.live[S.mode], r = id ? a.runs.find(x => x.id === id) : undefined;
  return r && runKey(r.save) === runKey(S) ? r : undefined;
}
/** Dòng họ đang chơi vừa đi tới kết cục: cất cả bản lưu vào Sổ kết cục (mở lại màn kết thì cập nhật hồ sơ ấy). Lần ghi
    đầu tiên xin trình duyệt giữ bộ nhớ lâu dài, nếu trình duyệt có cách ấy (không hứa gì: trình duyệt vẫn có thể xoá). */
export function archiveRun(meta: { end: string; title: string; name: string; home: string }): ArcRun | null {
  if (frozen) return null;
  const prev = readArc(), a = prev.a, snap = JSON.parse(JSON.stringify(S)) as Raw;
  let r = liveRun(a);
  if (r) Object.assign(r, meta, { save: snap });
  else {
    r = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7), at: new Date().toISOString(), mode: S.mode, ...meta, save: snap };
    a.runs.push(r);
    a.live[S.mode] = r.id;
    while (a.runs.length > ARC_MAX) dropOldest(a);
  }
  if (!a.asked) {
    a.asked = true;
    try { void navigator.storage?.persist?.().catch(() => false); } catch { /* không có: thôi */ }
  }
  return writeArc(a, prev) ? r : null;
}
/** Xoá cả Sổ kết cục (người chơi đã xác nhận); ván đang chơi không đổi. */
export function clearArchive(): void {
  try { localStorage.removeItem(ARC_KEY); localStorage.removeItem(ARC_BROKEN); } catch { /* riêng tư */ }
}
/** Chọn lại từ 1858: sổ giữ nguyên, chỉ quên rằng ván của luồng này đã có hồ sơ (ván mới, dù đi y hệt, là một hồ sơ mới). */
function forgetLive(mode: 'read' | 'play'): void {
  const prev = readArc();
  if (prev.bad || !prev.a.live[mode]) return;
  delete prev.a.live[mode];
  writeArc(prev.a, prev);
}
/** Chạy `fn` với S là bản lưu của hồ sơ `run` (đọc qua readSave như một bản lưu thật; thiết lập thiết bị lấy của ván đang
    chơi), rồi trả lại S như cũ. Trong lúc ấy save() không ghi gì, checkBadges() không trao gì. undefined khi bản lưu của
    hồ sơ không đọc được. Chỉ cho việc đồng bộ (dựng màn, đọc lời): đừng để việc chạy sau (setTimeout, await) đọc S. */
export function viewRun<T>(run: ArcRun, fn: () => T): T | undefined {
  const r = readSave(JSON.stringify(run.save), run.mode);
  if (r.unreadable) return undefined;
  const live = S, t = r.s as unknown as Raw;
  for (const k of PREFS) t[k] = live[k];
  S = r.s;
  frozen++;
  try { return fn(); } finally { S = live; frozen--; }
}

/** Start over, keeping device preferences. */
export function resetState(): void {
  forgetLive(S.mode);
  S = Object.assign({}, def, { picks: {}, quiz: {}, seen: [], shown: [], srcSeen: [], pvSeen: [], figSeen: [], badges: [], cards: {}, cardv: {}, cvk: Object.keys(VARIANT), tourAt: null, harvests: [], snap: {}, surname: '', names: [], xs: {}, xFrom: 0, movedFrom: 0, res: { ...RES0 }, rel: { ...REL0 }, mode: S.mode, home: S.home, sound: S.sound, music: S.music, theme: S.theme, pal: S.pal, mstyle: S.mstyle, grain: S.grain, modern: S.modern, grat: S.grat, haptic: S.haptic, fx: S.fx, narr: S.narr, rate: S.rate });
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
/** Một hướng như dòng họ này thấy nó: play.ts gán (nhà đã di tản năm 1975 thấy các hướng của điểm rẽ 6 nói từ xứ người,
    cùng id; nhà ra đi sau đó thì hướng giữ nguyên nhưng bỏ các trang nhật ký đề năm sau năm ra đi, nên allEv cũng bỏ);
    state.ts không nhập play.ts để tránh vòng nhập. */
export const optView = { of: (o: Option): Option => o };
export const optOf = (e: Era): Option | undefined => { const o = e.opts.find(x => x.id === S.picks[e.id]); return o && optView.of(o); };
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
  picked().forEach(o => { if (o.tag in c) c[o.tag]++; }); // 'giunep' (giữ kế hoạch hoá) không nghiêng về kiểu nào
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
  S.res = { ...RES0 }; S.rel = { ...REL0 }; S.cards = {}; S.harvests = []; S.snap = {}; S.names = []; S.xs = {}; S.xFrom = 0; S.movedFrom = 0;
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
