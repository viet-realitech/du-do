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
  hn: 'tr', pdp: 'tr', hht: 'pt', pbc: 'pt', pct: 'pt', ttt: 'tr', dct: 'tr', ntht: 'tr', pdm: 'ph', cd: 'pt', lvc: 'vh', htk: 'pt', nvv: 'vh',
  hcm: 'vm', nth: 'pt', pq: 'vh', tp: 'vm', lhp: 'vm', ntmk: 'vm', pdc: 'pt', nan: 'pt', ttt2: 'pt', bqc: 'pt', nl: 'vh', hps: 'tg',
  vng: 'vm', bd: 'qg', ttk: 'pt', tc: 'vm', pvd: 'vm', nb: 'vm', tvg: 'vm', js: 'ph', lcl: 'ph', nvx: 'qg', bv: 'pt',
  ndd: 'qg', dvm: 'qg', nvt: 'qg', tqd: 'tg', ndn: 'qg', ndc2: 'qg', tlx: 'qg', nck: 'qg', nk: 'qg', tvh: 'qg', nht: 'gp', ntb: 'gp', ntd: 'gp',
  ldt: 'vm', nct: 'vm', vtd: 'vm', pxa: 'vm', ttq: 'tg', tcs: 'vh', lbj: 'my', rn: 'my', hk: 'my', ww: 'my',
  ld: 'nn', nvl: 'nn', pd: 'vh', vvk: 'nn', dm: 'nn', ph: 'nn', nct2: 'nn', kn: 'nn', pvk: 'nn', vcc: 'nn', tvk2: 'vh',
};
export const sideName = (id: string) => SIDES.find(x => x[0] === FIGSIDE[id])?.[1] || '';

/** Nhân vật trực tiếp liên quan tới từng sự kiện (chỉ huy, người ký, người khởi xướng, người bị cuốn vào biến cố);
    màn chi tiết sự kiện và hồ sơ nhân vật nối qua lại bằng bảng này. Mỗi liên kết đã qua hai lượt phản biện (10.2026). */
export const EVFIG: Record<string, string[]> = {
  dn58: ['rdg', 'ntp'], gd59: ['rdg'], cd61: ['ntp', 'td'], nt61: ['ntr'], nt62: ['ptg', 'tduc'], td64: ['td'], vl67: ['ptg'], hn73: ['fg', 'ntp'],
  gt74: ['tduc'], hd82: ['hd'], ta83: ['ttt'], pt84: ['ttt'], cv85: ['ttt', 'hn'], bd86: ['dct'], hn88: ['hn'], hk96: ['pdp'], dm02: ['pdm'],
  dd05: ['pbc', 'cd'], dk07: ['lvc', 'nvv', 'pct'], ct08: ['pct', 'htk'], nq11: ['hcm'], yt13: ['hht'], tn25: ['hcm', 'lhp'], cs30: ['hcm', 'tp'],
  yb30: ['nth', 'pdc'], mt36: ['nan', 'ttt2', 'lhp', 'ntmk', 'tc', 'vng'], nk40: ['ntmk', 'tc', 'vvk'], vm41: ['hcm', 'tc'], vb44: ['vng', 'hcm'],
  ng45: ['hcm', 'bd', 'ttk', 'tvg', 'tc', 'vng', 'pq', 'ttt2'], tq45: ['lcl', 'tvg', 'hcm'], tk46: ['hcm', 'vng', 'tc', 'js'], tu46: ['hcm', 'pvd'],
  vb47: ['vng', 'hcm', 'tc'], el49: ['bd', 'nvx'], bg50: ['vng', 'hcm'], hb52: ['vng', 'nct'], dbp: ['vng', 'hcm'], gnv: ['pvd', 'hcm', 'ndd'],
  dc54: ['ndd'], vc55: ['ndd', 'bd'], cc53: ['tc', 'hcm', 'vng'], bx55: ['ndd', 'bv', 'dvm', 'bd'], mt60: ['ld', 'nvl'], dk60: ['ntd'],
  dc63: ['dvm', 'ndd', 'ndn', 'nvt', 'ndc2'], ab63: ['pxa'], qd63: ['tqd', 'ttq', 'ndd', 'tlx'], vb64: ['lbj'], dn65: ['lbj', 'ww'], id65: ['ww'],
  mt68: ['ld', 'ph', 'ww', 'lbj', 'nvt'], ks68: ['ww', 'lbj'], hcm69: ['hcm', 'rn', 'ld', 'nvt'], lk71: ['nvt', 'rn'], qt72: ['nvt', 'ld', 'vtd'],
  lb72: ['rn', 'hk', 'vng'], pr73: ['ldt', 'hk', 'ntb', 'rn', 'nvt'], hs74: ['nvt'], sg75: ['dvm', 'vtd', 'ph', 'ld', 'tcs', 'tvh', 'ldt'],
  bmt75: ['vtd', 'nvt', 'ld'], xl75: ['nvt'], tn76: ['tc', 'ld', 'pvd', 'ph', 'nht'], ct78: ['dm', 'ld', 'vvk'], cp79: ['ld', 'ldt', 'vtd', 'pvd'],
  bb79: ['ld', 'vtd', 'vng'], vx84: ['vtd'], dm86: ['tc', 'nvl', 'vvk', 'ldt'], gm88: ['nct2'], kh89: ['nvl', 'nct2', 'dm'],
  bt91: ['dm', 'vvk', 'nvl', 'pvd'], hn95: ['vvk', 'dm'], bg99: ['pvk'], vbb00: ['pvk'], wto07: ['pvk'],
};
/** Sự kiện liên quan tới một nhân vật (chiều ngược của EVFIG), theo thứ tự thời gian. */
export const figEvents = (id: string): HistEvent[] => EV.filter(v => EVFIG[v.id]?.includes(id));

/** Bài Wikipedia tiếng Việt về đúng sự kiện (đã kiểm chứng từng bài, tháng 10.2026): ảnh và phim tư liệu lấy từ bài này.
    Ba sự kiện không có bài riêng dùng bài gần nhất (kh63 → Campuchia thuộc Pháp, td64 → Trương Định, hn88 → Hàm Nghi). */
export const WIKI: Record<string, string> = {
  dn58: 'Trận Đà Nẵng (1858–1859)', gd59: 'Trận thành Gia Định, 1859', cd61: 'Trận Đại đồn Chí Hòa', nt61: 'Trận Nhựt Tảo',
  nt62: 'Hòa ước Nhâm Tuất (1862)', kh63: 'Campuchia thuộc Pháp', td64: 'Trương Định', vl67: 'Trận Vĩnh Long',
  hn73: 'Trận thành Hà Nội (1873)', gt74: 'Hòa ước Giáp Tuất (1874)', hd82: 'Trận thành Hà Nội (1882)', ta83: 'Trận Cửa Thuận An',
  pt84: 'Hòa ước Giáp Thân (1884)', cv85: 'Trận Kinh thành Huế 1885', tt85: 'Chiến tranh Pháp – Thanh', bd86: 'Khởi nghĩa Ba Đình',
  ld87: 'Liên bang Đông Dương', hn88: 'Hàm Nghi', la93: 'Chiến tranh Xiêm – Pháp', hk96: 'Khởi nghĩa Hương Khê',
  dm02: 'Toàn quyền Đông Dương', dd05: 'Phong trào Đông Du', dk07: 'Đông Kinh Nghĩa Thục', ct08: 'Phong trào chống sưu thuế Trung Kỳ 1908',
  nq11: 'Ngày Bác Hồ ra đi tìm đường cứu nước', yt13: 'Khởi nghĩa Yên Thế', ww14: 'Việt Nam trong Chiến tranh thế giới thứ nhất', tn25: 'Việt Nam Thanh niên Cách mạng Đồng chí Hội',
  cs30: 'Hội nghị thành lập Đảng Cộng sản Việt Nam', yb30: 'Khởi nghĩa Yên Bái', xv30: 'Xô Viết Nghệ Tĩnh', mt36: 'Phong trào Dân chủ Đông Dương (1936–1939)',
  nh40: 'Chiến dịch Đông Dương (1940)', nk40: 'Nam Kỳ khởi nghĩa', vm41: 'Việt Minh', ft41: 'Chiến tranh Pháp – Thái',
  vb44: 'Việt Nam Tuyên truyền Giải phóng quân', ng45: 'Cách mạng Tháng Tám', tq45: 'Hoa quân nhập Việt', tk46: 'Toàn quốc kháng chiến',
  tu46: 'Tạm ước Việt – Pháp', vb47: 'Chiến dịch Việt Bắc', el49: 'Hiệp định Élysée (1949)', bg50: 'Chiến dịch Biên giới',
  hb52: 'Chiến dịch Hòa Bình', dbp: 'Chiến dịch Điện Biên Phủ', gnv: 'Hiệp định Genève 1954', dc54: 'Cuộc di cư Việt Nam (1954)',
  vc55: 'Trưng cầu dân ý Quốc gia Việt Nam 1955', cc53: 'Cải cách ruộng đất tại miền Bắc Việt Nam', bx55: 'Trận Sài Gòn (1955)', nv56: 'Phong trào Nhân Văn – Giai Phẩm',
  ts59: 'Đường Trường Sơn', mt60: 'Mặt trận Dân tộc Giải phóng miền Nam Việt Nam', dk60: 'Phong trào Đồng khởi', dc63: 'Đảo chính Việt Nam Cộng hòa 1963',
  ab63: 'Trận Ấp Bắc', qd63: 'Biến cố Phật giáo 1963', vb64: 'Sự kiện Vịnh Bắc Bộ', dn65: 'Can thiệp của Hoa Kỳ trong Chiến tranh Việt Nam',
  id65: 'Trận Ia Đrăng', mt68: 'Sự kiện Tết Mậu Thân', ks68: 'Chiến dịch Đường 9 – Khe Sanh', ml68: 'Thảm sát Mỹ Lai',
  hcm69: 'Hồ Chí Minh', lk71: 'Chiến dịch Lam Sơn 719', qt72: 'Trận Thành cổ Quảng Trị', lb72: 'Chiến dịch Linebacker II',
  pr73: 'Hiệp định Paris 1973', hs74: 'Hải chiến Hoàng Sa 1974', sg75: 'Sự kiện 30 tháng 4 năm 1975', bmt75: 'Chiến dịch Tây Nguyên',
  xl75: 'Trận Xuân Lộc', cm75: 'Phnôm Pênh sụp đổ', tn76: 'Quốc hội Việt Nam khóa VI', ct78: 'Cải tạo kinh tế tại Việt Nam',
  cp79: 'Chiến tranh biên giới Việt Nam – Campuchia', bb79: 'Chiến tranh biên giới Việt – Trung 1979', tn80: 'Thuyền nhân Việt Nam', vx84: 'Mặt trận Vị Xuyên',
  dm86: 'Đổi Mới', gm88: 'Xung đột giành quyền kiểm soát tại quần đảo Trường Sa 1988', kh89: 'Quân tình nguyện Việt Nam tại Campuchia', bt91: 'Quan hệ Trung Quốc – Việt Nam',
  hn95: 'Bình thường hóa quan hệ ngoại giao Hoa Kỳ – Việt Nam', bg99: 'Vấn đề lãnh thổ biên giới Trung Quốc – Việt Nam', vbb00: 'Hiệp định Phân định Vịnh Bắc Bộ', wto07: 'Tổ chức Thương mại Thế giới',
  hd14: 'Vụ hạ giàn khoan Hải Dương 981', pca16: 'Philippines kiện Trung Quốc về Tranh chấp chủ quyền Biển Đông', st25: 'Sáp nhập tỉnh, thành Việt Nam 2025',
};
