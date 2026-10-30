/* Typed access to the content tables ported verbatim from the design bundle
   (project/data.js + project/data2.js). data2 extends data in place. */
import DD from './data2.js';
import provinces from './vn-provinces.json';

export type Faction = 'dainam' | 'dnph' | 'phap' | 'phap_bh' | 'jp' | 'vndcch' | 'tc' | 'vnch' | 'cmlt' | 'chxhcn';
export type Region = 'B' | 'T1' | 'QT' | 'T2' | 'NE' | 'NW';
export type ValueKey = 'doc' | 'song' | 'tudo' | 'dk';
export type Tag = 'vutrang' | 'caicach' | 'thuongthuyet';
export type LngLat = [number, number];

export interface Quote { t: string; by: string; src: string }

export interface HistEvent {
  id: string;
  y: number;
  d: string;
  k: string;
  t: string;
  p: string;
  l: LngLat;
  s: string;
  x?: string;
  v: [string, string][];
  src: string[];
  qt?: Quote;
  n?: [string, string][];
  diary?: boolean;
  era?: string;
}

export interface Option {
  id: string;
  tag: Tag;
  label: string;
  who: string;
  d: string;
  out: string;
  persp: string;
  fac: Faction;
  fx: Partial<Record<ValueKey, number>>;
  guide: string;
  diary: HistEvent[];
}

export interface Era {
  id: string;
  n: number;
  from: number;
  to: number;
  cy: number;
  title: string;
  q: string;
  opts: Option[];
  prev: string | null;
  hist: string;
  ctx: Record<string, string> | null;
}

export interface Source { id: string; t: string; k: string; by: string; y: string; at: string; d: string }

export interface Regime {
  b: Faction[];
  laos: Faction | null;
  camb: Faction | null;
  jp: boolean;
  l17: boolean;
  label: string;
  legend: Faction[];
  reg: Record<Exclude<Region, 'QT'>, Faction>;
}

/** [name, years, role, bio] */
export type Figure = [string, string, string, string];
/** [question, options, answerIndex, explanation] */
export type QuizItem = [string, string[], number, string];
/** [id, icon, name, description] */
export type Badge = [string, string, string, string];

export interface ProvinceShape { n: string; c: number[][][][] }

interface DDShape {
  P: Record<string, string>;
  F: Record<Faction, { n: string }>;
  ERAS: Era[];
  EV: HistEvent[];
  SRC: Source[];
  FIG: Record<string, Figure>;
  QUIZ: Record<string, QuizItem[]>;
  BADGES: Badge[];
  VAL: [ValueKey, string][];
  regime2(y: number): Regime;
  provGroup(n: string): Region;
  provName(n: string): string;
  regionName(g: Region, y: number, north: boolean): string;
  pop(y: number): [number, string, string] | null;
}

const D = DD as unknown as DDShape;

export const { P, F, ERAS, EV, SRC, FIG, QUIZ, BADGES, VAL } = D;
export const regime2 = D.regime2;
export const provGroup = D.provGroup;
export const provName = D.provName;
export const regionName = D.regionName;
export const pop = D.pop;
export const PROVINCES = provinces as unknown as ProvinceShape[];

/** Era each figure unlocks with. */
export const FIGERA: Record<string, string> = {
  ntp: 'e1', td: 'e1', ntt: 'e1', ptg: 'e1',
  hn: 'e2', pdp: 'e2', hht: 'e2', pbc: 'e2', pct: 'e2',
  hcm: 'e3', nth: 'e3', pq: 'e3',
  vng: 'e4', bd: 'e4', ttk: 'e4',
  ndd: 'e5', dvm: 'e5', nvt: 'e5', tqd: 'e5',
  ld: 'e6', nvl: 'e6', pd: 'e6',
  // Nhân vật bổ sung theo từng thời kỳ
  tduc: 'e1', ntr: 'e1', hd: 'e1', ndc: 'e1', tvk: 'e1', fg: 'e1', rdg: 'e1',
  ttt: 'e2', dct: 'e2', ntht: 'e2', pdm: 'e2', cd: 'e2', lvc: 'e2', htk: 'e2', nvv: 'e2',
  tp: 'e3', lhp: 'e3', ntmk: 'e3', pdc: 'e3', nan: 'e3', ttt2: 'e3', bqc: 'e3', nl: 'e3', hps: 'e3',
  tc: 'e4', pvd: 'e4', nb: 'e4', tvg: 'e4', js: 'e4', lcl: 'e4', nvx: 'e4', bv: 'e4',
  ndn: 'e5', ndc2: 'e5', tlx: 'e5', nck: 'e5', nk: 'e5', tvh: 'e5', nht: 'e5', ntb: 'e5', ntd: 'e5', ldt: 'e5', nct: 'e5', vtd: 'e5', ttq: 'e5', tcs: 'e5', pxa: 'e5', lbj: 'e5', rn: 'e5', hk: 'e5', ww: 'e5',
  vvk: 'e6', dm: 'e6', ph: 'e6', nct2: 'e6', kn: 'e6', pvk: 'e6', vcc: 'e6', tvk2: 'e6',
};

/** Phe / lĩnh vực của mỗi nhân vật, để nhóm trong màn Nhân vật (thứ tự hiển thị theo SIDES). */
export const SIDES: [string, string][] = [
  ['tr', 'Triều đình & nghĩa quân'], ['ph', 'Pháp'], ['pt', 'Phong trào & lực lượng khác'], ['vm', 'Việt Minh / VNDCCH'],
  ['gp', 'Mặt trận Giải phóng'], ['qg', 'Quốc gia / VNCH'], ['my', 'Mỹ'], ['nn', 'Nhà nước sau 1976'], ['tg', 'Tôn giáo'], ['vh', 'Văn hoá'],
];
export const FIGSIDE: Record<string, string> = {
  ntp: 'tr', td: 'tr', ntt: 'tr', ptg: 'tr', tduc: 'tr', ntr: 'tr', hd: 'tr', ndc: 'vh', tvk: 'vh', fg: 'ph', rdg: 'ph',
  hn: 'tr', pdp: 'tr', hht: 'pt', pbc: 'pt', pct: 'pt', ttt: 'tr', dct: 'tr', ntht: 'tr', pdm: 'ph', cd: 'pt', lvc: 'vh', htk: 'vm', nvv: 'vh',
  hcm: 'vm', nth: 'pt', pq: 'vh', tp: 'vm', lhp: 'vm', ntmk: 'vm', pdc: 'pt', nan: 'pt', ttt2: 'pt', bqc: 'pt', nl: 'vh', hps: 'tg',
  vng: 'vm', bd: 'qg', ttk: 'pt', tc: 'vm', pvd: 'vm', nb: 'vm', tvg: 'vm', js: 'ph', lcl: 'ph', nvx: 'qg', bv: 'pt',
  ndd: 'qg', dvm: 'qg', nvt: 'qg', tqd: 'tg', ndn: 'qg', ndc2: 'qg', tlx: 'qg', nck: 'qg', nk: 'qg', tvh: 'qg', nht: 'gp', ntb: 'gp', ntd: 'gp',
  ldt: 'vm', nct: 'vm', vtd: 'vm', pxa: 'vm', ttq: 'tg', tcs: 'vh', lbj: 'my', rn: 'my', hk: 'my', ww: 'my',
  ld: 'nn', nvl: 'nn', pd: 'vh', vvk: 'nn', dm: 'nn', ph: 'nn', nct2: 'nn', kn: 'vm', pvk: 'nn', vcc: 'nn', tvk2: 'vh',
};
export const sideName = (id: string) => SIDES.find(x => x[0] === FIGSIDE[id])?.[1] || '';

/** Hand-matched Vietnamese Wikipedia article per event; others fall back to search. */
export const WIKI: Record<string, string> = {
  dn58: 'Trận Đà Nẵng (1858–1860)', cd61: 'Trận Đại đồn Chí Hòa', nt62: 'Hòa ước Nhâm Tuất', pt84: 'Hòa ước Giáp Thân 1884',
  cv85: 'Phong trào Cần Vương', ld87: 'Liên bang Đông Dương', hk96: 'Khởi nghĩa Hương Khê', dd05: 'Phong trào Đông Du',
  dk07: 'Đông Kinh Nghĩa Thục', yt13: 'Khởi nghĩa Yên Thế', cs30: 'Đảng Cộng sản Việt Nam', yb30: 'Khởi nghĩa Yên Bái',
  vm41: 'Việt Minh', ng45: 'Cách mạng Tháng Tám', tk46: 'Toàn quốc kháng chiến', el49: 'Hiệp ước Élysée',
  bg50: 'Chiến dịch Biên giới', dbp: 'Chiến dịch Điện Biên Phủ', gnv: 'Hiệp định Genève 1954', vc55: 'Việt Nam Cộng hòa',
  mt60: 'Mặt trận Dân tộc Giải phóng miền Nam Việt Nam', dc63: 'Đảo chính Việt Nam Cộng hòa 1963', mt68: 'Sự kiện Tết Mậu Thân',
  pr73: 'Hiệp định Paris 1973', hs74: 'Hải chiến Hoàng Sa 1974', sg75: 'Sự kiện 30 tháng 4 năm 1975',
  cp79: 'Chiến tranh biên giới Tây Nam', bb79: 'Chiến tranh biên giới Việt–Trung 1979', tn80: 'Thuyền nhân', dm86: 'Đổi mới',
  gm88: 'Hải chiến Trường Sa 1988', nt61: 'Trận Nhật Tảo', td64: 'Trương Định', tt85: 'Chiến tranh Pháp–Thanh',
  bd86: 'Khởi nghĩa Ba Đình', hn88: 'Hàm Nghi', la93: 'Chiến tranh Pháp–Xiêm', tn25: 'Hội Việt Nam Cách mạng Thanh niên',
  xv30: 'Xô viết Nghệ Tĩnh', nk40: 'Khởi nghĩa Nam Kỳ', ft41: 'Chiến tranh Pháp–Thái Lan', vb44: 'Quân đội nhân dân Việt Nam',
  vb47: 'Chiến dịch Việt Bắc', hb52: 'Chiến dịch Hòa Bình', cc53: 'Cải cách ruộng đất tại miền Bắc Việt Nam',
  nv56: 'Nhân Văn – Giai Phẩm', ts59: 'Đường Trường Sơn', dk60: 'Phong trào Đồng khởi', ab63: 'Trận Ấp Bắc',
  qd63: 'Thích Quảng Đức', vb64: 'Sự kiện Vịnh Bắc Bộ', id65: 'Trận Ia Đrăng', ks68: 'Trận Khe Sanh', ml68: 'Thảm sát Mỹ Lai',
  lk71: 'Chiến dịch Lam Sơn 719', lb72: 'Chiến dịch Linebacker II', xl75: 'Trận Xuân Lộc',
  hd14: 'Sự kiện giàn khoan Hải Dương 981', hcm69: 'Hồ Chí Minh', nq11: 'Hồ Chí Minh', wto07: 'Tổ chức Thương mại Thế giới',
};
