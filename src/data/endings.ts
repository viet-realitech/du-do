import { ERAS } from './index';
import RARITY from './endings-rarity.json';

/* Kết cục dòng họ cho cả hai luồng (Đọc sử: 12 kết cục; Trò chơi: 15), lời kết cá nhân hoá, lớp giả định "Nếu…"
   và các con số %. Hàm thuần trên `Facts`: màn kết (play.ts factsFromState) và mô phỏng (scripts/sim-endings.ts) gọi
   cùng một luật. Tỷ lệ hiếm và ngưỡng gia sản theo quê lấy từ endings-rarity.json, do `npm run endings` sinh ra.
   Mọi con số giả định là ƯỚC LƯỢNG CỦA TRÒ CHƠI, không phải sử liệu. */

export type Res = { g: number; d: number; b: number; u: number };
/** Cờ gắn trên lựa chọn của thẻ sự kiện (cards.ts, phần tử thứ 5) và biến cố riêng (cards2.ts, phần tử thứ 6): việc lớn
    của dòng họ mà kết cục cần biết. Gắn theo dữ liệu chứ không khớp theo nhãn, để sửa câu chữ không làm lệch kết cục. */
export const FLAGS = ['tapketS', 'tapketN', 'tienNhanh', 'nguoiDi54', 'dicu', 'ditan', 'vuotbien', 'odp', 'lylichDi', 'ly79Di',
  'caitao', 'lylich', 'kieuhoi', 'dmBiz', 'seek75', 'chiadoi46', 'guiDi'] as const;
export type Flag = typeof FLAGS[number];

export interface Facts {
  mode: 'read' | 'play';
  /** Họ hiển thị cuối cùng, vd. "Họ Lê". */
  name: string;
  /** Sáu hướng đã chọn (id), theo thứ tự điểm rẽ; '' nếu còn bỏ ngỏ. */
  picks: string[];
  /** Quê (Trò chơi): khoá, tên, vùng (B, T1, T2, NE, NW). */
  home?: { id: string; name: string; region: string };
  res?: Res;
  /** Gia sản sau mùa màng của từng thế hệ (tối đa 6), để nói đời nào gây dựng / mất mát nhiều nhất. */
  snap?: Res[];
  renames: { y: number; from: string; to: string; why: string }[];
  flags: Set<Flag>;
  /** Ngưỡng tổng gia sản của quê này trong mô phỏng: lo = P5 (sa sút nhất), hi = P92 (khá nhất). */
  th?: { lo: number; hi: number };
}

/* ---------- con đường qua sáu điểm rẽ ---------- */
/** Hướng chiếm ưu thế ở mỗi điểm rẽ (null: điểm rẽ 2, không ngả nào thắng ngay). */
export const PREV: (string | null)[] = ERAS.map(e => e.prev);
const OPT = Object.fromEntries(ERAS.flatMap(e => e.opts.map(o => [o.id, o]))) as Record<string, typeof ERAS[number]['opts'][number]>;
/** Phía của một hướng theo góc nhìn sử học của nó: cách mạng (vn), Quốc gia / VNCH (vnch), hay đứng giữa (cải cách,
    thương thuyết, đứng ngoài). */
const side = (id: string) => { const p = OPT[id]?.persp; return p === 'vn' || p === 'vnch' ? p : 'giua'; };
const caicach = (id: string) => OPT[id]?.tag === 'caicach';

export interface PathF { m: number; div: number; turns: number; nVN: number; nVNCH: number; nG: number; cc: number }
export function pathF(p: string[]): PathF {
  const s = p.map(side);
  let m = 0, div = 0, turns = 0;
  p.forEach((x, i) => {
    if (PREV[i]) { if (x === PREV[i]) m++; else div++; }
    if (i && s[i] !== s[i - 1]) turns++;
  });
  const n = (k: string) => s.filter(x => x === k).length;
  return { m, div, turns, nVN: n('vn'), nVNCH: n('vnch'), nG: n('giua'), cc: p.filter(caicach).length };
}

/* ---------- kết cục: xét theo thứ tự, kết cục đầu tiên thoả điều kiện được chọn ---------- */
export interface Ending {
  id: string;
  title: string;
  /** Dấu triện (vài chữ) trên đầu màn kết. */
  seal: string;
  /** Một câu tóm, cho phim hành trình và thẻ chia sẻ. */
  line: string;
  /** Luật bằng lời, cho mục "Vì sao là kết cục này?". */
  why: string;
  /** Luật ở Đọc sử, nếu khác Trò chơi. */
  whyRead?: string;
  /** Chỉ ở Trò chơi (cần gia sản, thẻ sự kiện, đổi họ). */
  play?: true;
  test: (f: Facts, p: PathF) => boolean;
  /** Tên theo con đường cụ thể (vd. "Bốn đời canh tân"), nếu khác `title`. */
  name?: (f: Facts, p: PathF) => string;
}
/** Rời đất nước: đời thứ sáu "Ra đi", hay một lựa chọn đưa cả nhà (hay một nhánh) ra nước ngoài trên thẻ sự kiện. */
const EXIT: Flag[] = ['ditan', 'vuotbien', 'odp', 'lylichDi', 'ly79Di'];
export const away = (f: Facts) => f.picks[5] === 'radi' || EXIT.some(x => f.flags.has(x));
export const sum = (r?: Res) => (r ? r.g + r.d + r.b + r.u : 0);
const NUMW = ['Không', 'Một', 'Hai', 'Ba', 'Bốn', 'Năm', 'Sáu'];

export const ENDINGS: Ending[] = [
  { id: 'lytan', title: 'Còn lại tên họ', seal: 'Giữ được tên', play: true,
    line: 'Gia sản gần cạn, người còn ít, nhưng gia phả vẫn giữ được cái tên.',
    why: 'Gia sản cuối cùng thuộc nhóm 5% thấp nhất của các dòng họ cùng quê trong mô phỏng, hoặc dòng họ còn dưới 25 nhân đinh.',
    test: f => (!!f.th && sum(f.res) <= f.th.lo) || (!!f.res && f.res.d < 25) },
  { id: 'xanam', title: 'Bên kia đại dương', seal: 'Hai bờ đại dương',
    line: 'Từ miền Nam sau năm 1975, dòng họ dựng lại đời sống ở bên kia đại dương.',
    why: 'Đời thứ năm theo miền Nam; đời thứ sáu (hoặc một lựa chọn trên thẻ sự kiện) đưa dòng họ ra nước ngoài.',
    test: f => away(f) && f.picks[4] === 'nam' },
  { id: 'xabac', title: 'Người đi từ phía Bắc', seal: 'Ở xứ người',
    line: 'Đời thứ năm theo miền Bắc; sau chiến tranh, dòng họ có người ra đi, có người ở lại giữ từ đường.',
    why: 'Đời thứ năm theo miền Bắc; đời thứ sáu (hoặc một lựa chọn trên thẻ sự kiện) đưa dòng họ ra nước ngoài.',
    test: f => away(f) && f.picks[4] === 'bac' },
  { id: 'xagiua', title: 'Tiếng nói từ xa', seal: 'Bắc cầu',
    line: 'Bị cả hai phía nghi ngờ, rồi ra đi; con cháu thành người bắc cầu.',
    why: 'Đời thứ năm theo thành phần thứ ba; đời thứ sáu (hoặc một lựa chọn trên thẻ sự kiện) đưa dòng họ ra nước ngoài.',
    test: f => away(f) && f.picks[4] === 'thuba' },
  { id: 'thuandong', title: 'Cùng nhịp với lịch sử', seal: 'Cùng nhịp',
    line: 'Ở hầu hết các điểm rẽ, dòng họ đứng về hướng sau này chiếm ưu thế.',
    why: 'Ở ít nhất 4 trong 5 điểm rẽ có hướng chiếm ưu thế, dòng họ chọn đúng hướng ấy, và không đời nào theo phía Quốc gia / VNCH.',
    test: (_f, p) => p.m >= 4 && !p.nVNCH },
  { id: 'doiho', title: 'Hai cái tên, một từ đường', seal: 'Hai tên họ', play: true,
    line: 'Dòng họ đổi họ để qua một cơn biến, rồi giữ cả hai tên trong gia phả.',
    why: 'Dòng họ đã đổi họ ít nhất một lần qua một biến cố riêng.',
    test: f => f.renames.length > 0 },
  { id: 'vongtoc', title: 'Vọng tộc', seal: 'Có của, có người', play: true,
    line: 'Sau sáu đời, một nhà có của, có người, có tiếng ở quê mình.',
    why: 'Gia sản cuối cùng thuộc nhóm 8% cao nhất của các dòng họ cùng quê trong mô phỏng.',
    test: f => !!f.th && sum(f.res) >= f.th.hi },
  // Trò chơi: chia nhánh thật trên thẻ năm 1954 (tập kết, di cư). Đọc sử không có thẻ: hai đời đứng hai bên vĩ tuyến
  // (theo Việt Minh rồi theo miền Nam, hay theo Quốc gia Việt Nam rồi theo miền Bắc).
  { id: 'chiadoi', title: 'Hai mươi mốt năm chờ nhau', seal: 'Hai nhánh',
    line: 'Năm 1954 dòng họ chia hai nhánh ở hai miền; hai mươi mốt năm sau mới gặp lại.',
    why: 'Năm 1954 dòng họ chia hai nhánh ở hai miền (tập kết, di cư), và hướng của đời thứ năm không đưa cả nhà về một phía.',
    whyRead: 'Đời thứ tư và đời thứ năm đứng ở hai phía của vĩ tuyến 17: theo Việt Minh rồi theo miền Nam, hoặc theo Quốc gia Việt Nam rồi theo miền Bắc.',
    test: f => (f.mode === 'play'
      ? f.flags.has('tienNhanh') || f.flags.has('nguoiDi54') || (f.flags.has('tapketS') && f.picks[4] !== 'bac')
      : (f.picks[3] === 'vm' && f.picks[4] === 'nam') || (f.picks[3] === 'qg' && f.picks[4] === 'bac')) },
  { id: 'canhtan', title: 'Ba đời canh tân', seal: 'Canh tân',
    line: 'Nhiều đời chọn học hỏi và cải cách; phần lớn đề xuất bị gác lại khi người đề xướng còn sống.',
    why: 'Ít nhất ba đời chọn hướng cải cách: Canh tân, Duy Tân, Lập hiến hay Đổi Mới.',
    test: (_f, p) => p.cc >= 3, name: (_f, p) => `${NUMW[p.cc]} đời canh tân` },
  { id: 'nhieunga', title: 'Rẽ nhiều ngả', seal: 'Mỗi đời một ngả',
    line: 'Mỗi đời đi một ngả khác đời trước; gia phả giống một tấm bản đồ.',
    why: 'Cả năm lần sang đời, dòng họ đều đổi phía (cách mạng / Quốc gia – VNCH / đứng giữa).',
    test: (_f, p) => p.turns >= 5 },
  { id: 'nguocdong', title: 'Năm lần rẽ khác', seal: 'Ngả khác',
    line: 'Ở cả năm điểm rẽ có hướng chiếm ưu thế, dòng họ đều chọn ngả khác.',
    why: 'Không điểm rẽ nào trùng hướng chiếm ưu thế (0/5).',
    test: (_f, p) => p.m === 0 },
  { id: 'dunggiua', title: 'Người đứng giữa', seal: 'Đứng giữa',
    line: 'Dòng họ thường chọn thương thuyết, cải cách hay đứng ngoài hơn là cầm súng.',
    why: 'Ít nhất bốn đời chọn thương thuyết, cải cách hay đứng ngoài, hoặc đời thứ năm theo thành phần thứ ba và ở lại.',
    test: (f, p) => p.nG >= 4 || f.picks[4] === 'thuba' },
  { id: 'olainam', title: 'Ở lại sau ngày 30 tháng Tư', seal: 'Ở lại',
    line: 'Đời thứ năm theo miền Nam, và dòng họ ở lại sau ngày 30.4.1975.',
    why: 'Đời thứ năm theo miền Nam, và dòng họ ở lại sau năm 1975.',
    test: f => f.picks[4] === 'nam' },
  { id: 'baocap', title: 'Sổ gạo và công điểm', seal: 'Thời bao cấp',
    line: 'Đời thứ sáu giữ sổ gạo, công điểm qua những năm bao cấp.',
    why: 'Đời thứ sáu chọn giữ kế hoạch hoá.',
    test: f => f.picks[5] === 'baocap' },
  { id: 'doimoi', title: 'Từ tem phiếu đến xưởng nhỏ', seal: 'Đổi Mới',
    line: 'Đi qua chiến tranh và tem phiếu, rồi làm ăn sau Đổi Mới, như phần đông gia đình Việt Nam.',
    why: 'Không rơi vào kết cục nào ở trên: đời thứ năm theo miền Bắc, đời thứ sáu theo Đổi Mới.',
    test: () => true },
];
/** Đủ sáu hướng mới có kết cục (Đọc sử cho bỏ ngỏ điểm rẽ: màn kết khi ấy ghi "con đường còn bỏ ngỏ"). */
export const complete = (f: Facts) => f.picks.length === ERAS.length && f.picks.every(Boolean);
export function endingOf(f: Facts): Ending {
  const p = pathF(f.picks);
  return ENDINGS.find(e => (!e.play || f.mode === 'play') && e.test(f, p))!;
}
export const titleOf = (e: Ending, f: Facts) => (e.name ? e.name(f, pathF(f.picks)) : e.title);

/* ---------- tỷ lệ (endings-rarity.json) ---------- */
type Rarity = { runs: number; paths: number; read: Record<string, number>; play: Record<string, number>; tiers: Record<string, number[][]>; match: number[] };
export const RAR = RARITY as unknown as Rarity;
/** "5,2" — số thập phân kiểu Việt. */
export const vnNum = (x: number, d = 1) => x.toFixed(d).replace(/\.0+$/, '').replace('.', ',');
/** Tỷ lệ hiếm của kết cục (%), theo luồng; undefined nếu bảng chưa có. */
export const rarityOf = (id: string, mode: 'read' | 'play'): number | undefined => RAR[mode]?.[id];
/** Câu hiếm cho người chơi; nói rõ con số đến từ đâu. */
export function rarityLine(id: string, mode: 'read' | 'play'): { lead: string; note: string } | null {
  const x = rarityOf(id, mode);
  if (x == null) return null;
  const pc = `${x < 10 ? 'Chỉ ' : ''}${vnNum(x)}%`;
  return mode === 'play'
    ? { lead: `${pc} dòng họ trong mô phỏng đi tới kết cục này.`, note: `Mô phỏng ${RAR.runs.toLocaleString('vi-VN')} dòng họ: đủ 729 con đường qua sáu điểm rẽ × 8 quê × 8 nhóm họ × 5 cách quyết thẻ. Không phải thống kê người chơi thật.` }
    : { lead: `${pc} con đường đi tới kết cục này.`, note: 'Đếm đủ 729 con đường qua sáu điểm rẽ (ba hướng mỗi điểm rẽ). Không phải thống kê người chơi thật.' };
}
/** Ngưỡng tổng gia sản theo quê sau thế hệ `gen` (1–6): [P5, P25, P60, P92] trong mô phỏng. */
export const tiersOf = (home: string, gen = 6): number[] | undefined => RAR.tiers?.[home]?.[Math.max(1, Math.min(6, gen)) - 1];
export const thOf = (home: string): { lo: number; hi: number } | undefined => { const t = tiersOf(home); return t ? { lo: t[0], hi: t[3] } : undefined; };
/** Trùng hướng chiếm ưu thế m/5: bao nhiêu % con đường trùng nhiều (m ≥ 3) hay ít (m ≤ 2) như vậy. */
export function matchLine(m: number): string {
  const d = RAR.match;
  if (!d?.length) return '';
  const hi = m >= 3, x = (hi ? d.slice(m) : d.slice(0, m + 1)).reduce((a, b) => a + b, 0);
  return `${x < 10 ? 'chỉ ' : ''}${vnNum(x)}% con đường trùng ${hi ? 'nhiều' : 'ít'} như vậy`;
}

/* ---------- lời kết cá nhân hoá ---------- */
const GEN = ['thứ nhất', 'thứ hai', 'thứ ba', 'thứ tư', 'thứ năm', 'thứ sáu'];
export const genName = (i: number) => 'đời ' + GEN[i];
const bare = (n: string) => n.replace(/^Họ /, '');
const list = (xs: string[]) => (xs.length < 2 ? xs.join('') : xs.slice(0, -1).join(', ') + ' và ' + xs[xs.length - 1]);
const north = (f: Facts) => f.home?.region === 'B' || f.home?.region === 'T1';
/** Cụm động từ ngắn cho mỗi hướng ("đời thứ ba …", "những người …"); không có dấu phẩy, vì lời kết xâu chúng thành danh sách. */
const DOI: Record<string, string> = {
  chien: 'theo phe chủ chiến giữ đồn luỹ', canhtan: 'dâng điều trần xin canh tân', hoa: 'theo sứ bộ chủ hoà',
  canvuong: 'ứng nghĩa Cần Vương', dongdu: 'sang Nhật theo phong trào Đông Du', duytan: 'theo phong trào Duy Tân',
  cs: 'hoạt động bí mật theo Đảng Cộng sản', qdd: 'theo Việt Nam Quốc dân đảng', laphien: 'viết báo đòi cải cách lập hiến',
  vm: 'theo Việt Minh kháng chiến', qg: 'làm việc cho Quốc gia Việt Nam', tl: 'đứng ngoài để giữ làng',
  bac: 'sống ở miền Bắc', nam: 'sống ở miền Nam', thuba: 'xuống đường đòi hoà bình',
  baocap: 'giữ sổ gạo thời bao cấp', doimoi: 'mở xưởng nhỏ sau Đổi Mới', radi: 'rời quê ra đi sau năm 1975',
};
/** Cụm cho đời thứ i, có tính quê: nhà miền Bắc theo "Miền Nam" là di cư năm 1954; nhà phía nam vĩ tuyến 17 theo
    "Miền Bắc" là tập kết (nếu đã lên tàu) hay theo cách mạng ngay tại chỗ; Đông Kinh Nghĩa Thục ở Hà Nội, Việt Minh
    Nam Bộ ở chiến khu Đ, U Minh. Đọc sử không có quê: cụm chung. */
export function doi(f: Facts, i: number): string {
  const id = f.picks[i], reg = f.home?.region;
  if (!reg) return DOI[id] || '';
  if (id === 'nam') return north(f) ? 'di cư vào Nam năm 1954' : DOI.nam;
  if (id === 'bac') {
    if (north(f)) return f.flags.has('dicu') ? 'vẫn vào Nam trong hạn 300 ngày sau Genève' : 'ở lại miền Bắc';
    return f.flags.has('tapketN') ? 'tập kết ra Bắc năm 1954' : 'theo cách mạng ở miền Nam';
  }
  if (id === 'duytan' && north(f)) return 'dạy chữ ở Đông Kinh Nghĩa Thục';
  if (id === 'vm') return reg === 'B' || reg === 'T1' ? 'lên chiến khu Việt Bắc theo Việt Minh' : reg === 'NE' ? 'theo Việt Minh vào chiến khu Đ' : reg === 'NW' ? 'theo Việt Minh vào rừng U Minh' : DOI.vm;
  return DOI[id] || '';
}
/** Đời được nhiều / mất nhiều nhất (tổng gia sản đổi giữa hai mùa màng); null khi chưa đủ sáu mùa. */
export function genDelta(f: Facts): { best: number; worst: number; dl: number[] } | null {
  if (!f.snap || f.snap.length < 6) return null;
  const start = { g: 50, d: 40, b: 30, u: 20 }; // RES0 trong state.ts
  const dl = f.snap.map((r, i) => sum(r) - sum(i ? f.snap![i - 1] : start));
  return { best: dl.indexOf(Math.max(...dl)), worst: dl.indexOf(Math.min(...dl)), dl };
}
/** Mệnh đề "rời đất nước" theo thẻ đã chọn (năm và cách đi), hay theo hướng "Ra đi" của đời thứ sáu. */
function exitClause(f: Facts): string {
  if (f.flags.has('ditan')) return 'tháng 4.1975, cả nhà di tản';
  if (f.flags.has('lylichDi')) return 'năm 1978, một nhánh xuống ghe ở Rạch Giá';
  if (f.flags.has('ly79Di')) return 'năm 1979, cả nhà đi “bán chính thức” sang Hồng Kông';
  if (f.flags.has('vuotbien')) return 'năm 1980, cả nhà vượt biển';
  if (f.flags.has('odp')) return 'đầu thập niên 1980, cả nhà đi theo Chương trình Ra đi có trật tự';
  return 'sau năm 1975, đời thứ sáu ra đi';
}
/** Việc riêng sau 1975 theo thẻ đã chọn (học tập cải tạo, lý lịch, gửi một người đi…), cho các kết cục ở lại. */
function after75(f: Facts): string[] {
  return [
    f.flags.has('caitao') ? 'có người đi học tập cải tạo' : '',
    f.flags.has('lylich') ? 'con cháu khai lý lịch ba đời trước mỗi kỳ thi' : '',
    f.flags.has('guiDi') ? 'năm 1980 cả nhà dồn tiền cho một người con vượt biển' : '',
    f.flags.has('kieuhoi') ? 'thân nhân ở nước ngoài gửi tiền về sửa nhà, xây mộ' : '',
  ].filter(Boolean);
}

/** Lời kết 2–4 câu cho kết cục `id`, theo đúng con đường, quê, thẻ đã chọn và các lần đổi họ của dòng họ. */
export function epilogue(id: string, f: Facts): string {
  const ho = f.name, que = f.home?.name || '', oQue = que ? ` ở ${que}` : '', p = pathF(f.picks), gd = genDelta(f), r = f.res;
  const at = (i: number) => `${genName(i)} ${doi(f, i)}`, atHo = (i: number) => `${genName(i)} của ${ho} ${doi(f, i)}`;
  switch (id) {
    case 'lytan': {
      // chỉ nêu những phần gia sản thật sự cạn (≤ 25), không thì hai phần thấp nhất
      const RN: [keyof Res, string][] = [['g', 'lúa gạo'], ['d', 'nhân đinh'], ['b', 'bạc'], ['u', 'uy tín']];
      const lows = r ? RN.filter(([k]) => r[k] <= 25).sort((a, b) => r[a[0]] - r[b[0]]) : [];
      const shown = (lows.length ? lows : r ? [...RN].sort((a, b) => r[a[0]] - r[b[0]]).slice(0, 2) : []).slice(0, 3);
      const low = r ? `gia sản của ${ho} chỉ còn ${list(shown.map(([k, n]) => `${n} ${r[k]}`))}` : `${ho} còn lại rất ít`;
      return `Sáu đời ${ho}${oQue} đi qua giặc giã, đói kém và những lần phải chọn phe.${gd ? ` ${cap(genName(gd.worst))}, những người ${doi(f, gd.worst)}, mất mát nhiều nhất.` : ''} Đến năm 2026, ${low}. Gia phả không đứt: người còn lại giữ cái tên và thắp hương cho cả những người không về.`;
    }
    case 'xanam':
      return `${cap(atHo(4))}; ${exitClause(f)}, rồi dựng lại đời sống ở xứ người. ${f.flags.has('kieuhoi') ? `Từ cuối thập niên 1980, tiền và thùng đồ gửi về sửa lại nhà, xây lại mộ tổ${oQue}.` : 'Nhiều năm liền, những lá thư là sợi dây duy nhất nối hai bờ.'} Năm 2026, ${ho} có hai bàn thờ, một ở ${que || 'quê nhà'} và một ở bên kia đại dương; con cháu đời thứ bảy nói tiếng Việt với ông bà và một thứ tiếng khác ở trường.`;
    case 'xabac': {
      // nhà phía nam vĩ tuyến 17 theo miền Bắc: không lấy ví dụ ghe Hải Phòng, Quảng Ninh hay lao động Đông Âu của người miền Bắc
      const how = EXIT.some(x => f.flags.has(x)) ? exitClause(f) : f.home && !north(f)
        ? 'sau chiến tranh, đời thứ sáu vẫn rời đất nước, như không ít gia đình từng đứng về phía cách mạng mà con cháu ra đi vì sinh kế, vì đoàn tụ, hay đi học rồi ở lại'
        : 'sau chiến tranh, đời thứ sáu rời đất nước, như những người đi ghe từ Hải Phòng, Quảng Ninh sang Hồng Kông, hay những người đi lao động ở Đông Âu rồi ở lại sau năm 1990';
      return `${cap(atHo(4))} qua những năm chiến tranh; ${how}. Năm 2026, ${ho} có người ở xứ người, còn từ đường${oQue} vẫn do nhánh ở lại trông nom. Gia phả ghi cả hai: người từng ${doi(f, 3)} và người đã ra đi.`;
    }
    case 'xagiua':
      return `${cap(atHo(4))} và bị cả hai phía nghi ngờ; ${exitClause(f)}. Ở xứ người, ${ho} vẫn viết, dạy học, gây quỹ xây trường ở ${que || 'quê nhà'}, ít ồn ào nhưng bền bỉ. Năm 2026, con cháu là người bắc cầu: đủ gần để về quê ăn giỗ, đủ xa để kể lại chuyện cũ mà không phải chọn phe.`;
    case 'thuandong': {
      const matched = f.picks.map((x, i) => (PREV[i] && x === PREV[i] ? at(i) : '')).filter(Boolean);
      const off = f.picks.findIndex((x, i) => !!PREV[i] && x !== PREV[i]);
      return `Ở ${p.m}/5 điểm rẽ có hướng chiếm ưu thế, ${ho} đứng về hướng ấy: ${list(matched)}.${off >= 0 ? ` Chỉ ${genName(off)} rẽ khác: ${doi(f, off)}.` : ''} Gia phả vì thế đi cùng nhịp với sử chính thống; những ngả khác mà nhiều người Việt đã đi không có trong gia phả này, nhưng vẫn có trong sử liệu.`;
    }
    case 'doiho': {
      const n = f.renames[0], last = f.renames[f.renames.length - 1];
      return `Năm ${n.y}, qua biến cố “${n.why}”, ${n.from} đổi thành ${n.to}.${f.renames.length > 1 ? ` Năm ${last.y}, dòng họ đổi thêm một lần nữa, thành ${last.to}.` : ''} Năm 2026, con cháu khai họ ${bare(last.to)} trên căn cước, nhưng bài vị ở từ đường${oQue} vẫn chép họ ${bare(n.from)}; ngày giỗ tổ, cả hai cái tên cùng được đọc lên.`;
    }
    case 'vongtoc':
      return `Sau sáu đời, ${ho}${oQue} là một nhà có của, có người, có tiếng.${gd ? ` Của cải gây dựng nhiều nhất ở ${genName(gd.best)}, khi dòng họ ${doi(f, gd.best)}; ${genName(gd.worst)} là đời mất mát nhiều nhất.` : ''} Người trong vùng nhắc tới ${ho} với chút nể trọng, còn người trong họ biết những của ấy đã phải đổi bằng gì.`;
    case 'chiadoi': {
      if (f.mode === 'read') return `Năm 1954, vĩ tuyến 17 chạy qua giữa hai đời của ${ho}: ${at(3)}, ${at(4)}. Trong nhà, cha và con nhìn cùng một cuộc chiến từ hai phía; hai mươi mốt năm sau mới ngồi lại được cùng một mâm cơm. Năm 2026, ${ho} ăn giỗ chung, và có những chuyện cả hai bên vẫn chọn không nhắc.`;
      const tk = !f.flags.has('tienNhanh');
      const how = !tk ? `một nhánh xuống Hải Phòng lên tàu vào Nam, nhánh kia ở lại giữ đất tổ${oQue}` : f.flags.has('nguoiDi54') ? 'chồng và con trai ra Bắc theo diện tập kết, vợ con ở lại giữ đất' : `một người con theo bộ đội tập kết ra Bắc, cả nhà ở lại${oQue}`;
      return `Năm 1954, ${ho} chia làm hai: ${how}. ${tk ? 'Hẹn hai năm thành hai mươi mốt năm' : 'Tưởng xa nhau ít lâu, hoá ra hai mươi mốt năm'}${f.flags.has('seek75') ? '; tháng 5.1975, nhánh ở Bắc vào Nam tìm người thân' : ''}.${f.flags.has('chiadoi46') ? ' Đó không phải lần đầu: năm 1946, khi kháng chiến bùng nổ, dòng họ đã chia đôi một lần.' : ''} Hai nhánh gặp lại nhau với hai giọng nói và hai cách nhớ về cùng một cuộc chiến. Năm 2026, ${ho} ăn giỗ chung, và có những chuyện cả hai bên vẫn chọn không nhắc.`;
    }
    case 'canhtan': {
      const cc = f.picks.map((x, i) => (caicach(x) ? at(i) : '')).filter(Boolean);
      return `${NUMW[p.cc]} đời của ${ho} chọn học hỏi và cải cách: ${list(cc)}. Phần lớn những đề xuất ấy bị gác lại khi người đề xướng còn sống. ${f.picks[5] === 'doimoi' ? 'Đến Đổi Mới, con cháu mới thấy nhiều điều ông cha từng xin thành chính sách.' : 'Gia phả giữ lại những bản điều trần và những tờ báo bị kiểm duyệt như một món nợ chưa đòi.'} Năm 2026, ${ho} vẫn đặt chuyện học lên trước chuyện giàu.`;
    }
    case 'nhieunga':
      return `Không đời nào của ${ho} đi tiếp phía của đời trước: ${f.picks.map((_, i) => doi(f, i)).join(' → ')}. Có những năm hai thế hệ trong nhà đứng ở hai phía của cùng một cuộc tranh luận, có khi của cùng một chiến tuyến. Năm 2026, gia phả ${ho} giống một tấm bản đồ hơn là một con đường thẳng.`;
    case 'nguocdong': {
      const diverged = f.picks.map((x, i) => (PREV[i] && x !== PREV[i] ? doi(f, i) : '')).filter(Boolean);
      return `Ở cả năm điểm rẽ có hướng chiếm ưu thế, ${ho} đều chọn ngả khác: ${list(diverged)}. Sử chính thống ít ghi tên những người như thế, nhưng sử liệu vẫn giữ tiếng nói của họ. Năm 2026, ${ho} vẫn có tên trên tấm bản đồ chung${oQue}.`;
    }
    case 'dunggiua': {
      const g = f.picks.map((x, i) => (side(x) === 'giua' ? at(i) : '')).filter(Boolean);
      return `${g.length >= 4 ? `${ho} thường chọn đứng giữa: ${list(g)}.` : `${cap(atHo(4))} cùng thành phần thứ ba, bị cả hai phía nghi ngờ, rồi ở lại sau năm 1975.`} Đứng giữa không phải đứng yên: cả hai phía đều có lúc nghi ngờ, có lúc cần đến những người như thế. Năm 2026, ${ho} vẫn giữ những mối quan hệ mà người cầm súng ở cả hai bên từng cắt đứt.`;
    }
    case 'olainam': {
      const bits = after75(f);
      const where = north(f) ? `ở miền Nam, còn từ đường ở ${que} do bà con ngoài ấy trông nom` : que ? `ở ${que}` : 'ở quê';
      return `${cap(atHo(4))}; sau ngày 30.4.1975, dòng họ ở lại.${bits.length ? ' Những năm sau đó, ' + list(bits) + '.' : ''} ${f.picks[5] === 'doimoi' ? 'Đến Đổi Mới, đời thứ sáu làm lại từ một xưởng nhỏ.' : 'Đời thứ sáu sống qua những năm tem phiếu, sổ gạo.'} Năm 2026, con cháu ${ho} vẫn ${where}; chuyện của ông bà được kể trong nhà nhiều hơn ngoài sách.`;
    }
    case 'baocap': {
      const bits = after75(f);
      return `${cap(atHo(4))}; đời thứ sáu ở lại trong hợp tác xã và biên chế, giữ sổ gạo qua những năm lạm phát ba con số.${bits.length ? ' Trong những năm ấy, ' + list(bits) + '.' : ''} Khi Đổi Mới tới, ${ho} không phải người đi đầu, nhưng là người giữ lại những thứ thị trường không định giá được: ngày công, tình làng, đám giỗ đủ mặt. Năm 2026, cuốn sổ gạo cũ nằm trong tủ kính${oQue}, cạnh kỷ vật của đời thứ nhất, người từng ${doi(f, 0)}.`;
    }
    default: {
      const bits = after75(f);
      return `${cap(atHo(4))}; đời thứ sáu đi qua tem phiếu rồi ${f.flags.has('dmBiz') ? 'mở hiệu buôn ngay khi được phép, kịp có chiếc xe máy đầu tiên trong xóm năm 1990' : 'mở một xưởng nhỏ sau năm 1986'}.${bits.length ? ' Gia phả còn ghi: ' + list(bits) + '.' : ''} Từ người ${doi(f, 0)} đến người ${doi(f, 5)}, gia phả ${ho} là câu chuyện của phần đông gia đình Việt Nam: không ở đầu sóng, không ở cuối dòng. Năm 2026, con cháu sống trong một đất nước đã hội nhập, và vẫn về ${que || 'quê'} ăn Tết.`;
    }
  }
}
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
/** Vì sao là kết cục này: luật bằng lời, kèm con số của chính dòng họ khi luật dựa vào gia sản. */
export function whyText(e: Ending, f: Facts): string {
  if (f.mode === 'read' && e.whyRead) return e.whyRead;
  if ((e.id === 'lytan' || e.id === 'vongtoc') && f.res && f.th) {
    const s = sum(f.res), q = f.home?.name || 'quê này';
    if (e.id === 'lytan' && f.res.d < 25 && s > f.th.lo) return `${e.why} Dòng họ còn ${f.res.d} nhân đinh.`;
    return `${e.why} Tổng gia sản ${s}; ${e.id === 'lytan' ? `ngưỡng 5% thấp nhất ở ${q} là ${f.th.lo}` : `ngưỡng 8% cao nhất ở ${q} là ${f.th.hi}`}.`;
  }
  return e.why;
}

/* ---------- lớp giả định ("Nếu…") ---------- */
/** Mức đồng thuận của giới sử học (nhóm soạn gán, kèm căn cứ) → hệ số ước lượng của trò chơi. KHÔNG phải xác suất lịch sử. */
export const LEVEL: Record<'A' | 'B' | 'C' | 'D', [number, string]> = {
  A: [1 / 3, 'nhiều sử gia xem là một cơ hội có thật'],
  B: [1 / 5, 'có cơ sở, nhưng khó'],
  C: [1 / 20, 'rất khó trong bối cảnh ấy'],
  D: [1 / 100, 'gần như không thể trong bối cảnh ấy'],
};
export type Level = keyof typeof LEVEL;
export const CF_METHOD = 'Mỗi giả định được nhóm soạn xếp một mức theo mức đồng thuận của giới sử học, kèm căn cứ: A, nhiều sử gia xem là cơ hội có thật (khoảng 1 trên 3); B, có cơ sở nhưng khó (khoảng 1 trên 5); C, rất khó trong bối cảnh ấy (khoảng 1 trên 20); D, gần như không thể (khoảng 1 trên 100). Trò chơi chỉ ước lượng ở điểm rẽ đầu tiên con đường của bạn rời lịch sử: sau đó các hướng "chiếm ưu thế" không còn là dữ kiện, nên không nhân tiếp. Đây là ước lượng để so sánh các giả định với nhau, không phải xác suất lịch sử.';
export interface CF { title: string; body: string; level: Level; basis: string }
/** Một giả định cho mỗi hướng không chiếm ưu thế, và cho cả ba hướng ở điểm rẽ 2 (không ngả nào thắng ngay:
    "nếu ngả này thành công"). Nêu bản lề có thật, cái giá và độ bất định ở cả hai phía; không nói kết quả "tốt hơn". */
export const CFS: Record<string, CF> = {
  chien: { title: 'Nếu triều đình dồn sức chủ chiến (1858–1862)', level: 'C', basis: 'Chênh lệch vũ khí rất lớn; nhà Thanh, lớn hơn nhiều, vẫn thua hai cuộc chiến tranh Nha phiến.',
    body: 'Huế dồn quân, dồn lương cho đại đồn Chí Hoà, rồi không ký Hoà ước Nhâm Tuất mà tiếp tục hậu thuẫn nghĩa quân Trương Định. Pháp khi ấy còn đánh ở Trung Hoa (1860) và Mexico (1861–1867), nên việc chiếm Nam Kỳ có thể kéo dài và tốn kém hơn. Nhưng chênh lệch súng đạn, tàu chiến rất lớn: cái giá có thể là thêm nhiều trận như Chí Hoà, chưa chắc là giữ được đất.' },
  canhtan: { title: 'Nếu triều đình nghe Nguyễn Trường Tộ', level: 'B', basis: 'Xiêm cải cách cùng thời và giữ được độc lập, một phần nhờ là vùng đệm giữa Anh và Pháp.',
    body: 'Từ thập niên 1860, Huế mở trường kỹ nghệ, gửi người đi học, đóng tàu như các bản điều trần xin. Xiêm cải cách cùng thời và giữ được độc lập, một phần nhờ nằm giữa hai đế quốc; Đại Nam thì đã có quân Pháp ở Nam Kỳ. Cải cách có thể giúp triều đình mạnh hơn khi thương thuyết, nhưng giữ được độc lập hay không vẫn là câu hỏi mở.' },
  canvuong: { title: 'Nếu Cần Vương giữ được vua Hàm Nghi', level: 'C', basis: 'Các cuộc khởi nghĩa rời rạc, thiếu vũ khí và hậu phương; Yên Thế trụ tới năm 1913 nhưng chỉ ở một vùng.',
    body: 'Vua Hàm Nghi không bị bắt năm 1888; Hương Khê, Ba Đình, Bãi Sậy phối hợp được với nhau. Nghĩa quân có thể giữ một vùng núi lâu hơn, như Hoàng Hoa Thám giữ Yên Thế tới năm 1913. Nhưng thiếu súng, thiếu hậu phương và thiếu một chương trình ngoài khôi phục ngai vàng, con đường ấy khó thành một nước độc lập trong thế kỷ XIX.' },
  dongdu: { title: 'Nếu Nhật không trục xuất du học sinh Đông Du', level: 'C', basis: 'Hiệp ước Pháp – Nhật năm 1907; lợi ích của Nhật khi ấy gắn với Pháp hơn với phong trào.',
    body: 'Nhật không thoả thuận với Pháp năm 1907, khoảng hai trăm du học sinh Đông Du học xong trường võ bị. Phong trào có thể có một lớp sĩ quan riêng sớm hơn hàng chục năm; nhưng dựa vào Nhật cũng có giá, như cả Đông Nam Á đã thấy khi quân Nhật vào Đông Dương năm 1940.' },
  duytan: { title: 'Nếu Đông Kinh Nghĩa Thục không bị đóng cửa', level: 'B', basis: 'Các phong trào tự trị từng bước có thật ở Ấn Độ, Philippines; nhưng chính quyền thuộc địa Pháp ít nhượng bộ.',
    body: 'Trường không bị đóng cuối năm 1907, phong trào chống thuế ở Trung Kỳ năm 1908 không bị đàn áp; hội buôn, trường học, báo quốc ngữ lan khắp ba kỳ. Một tầng lớp trí thức và thương nhân lớn hơn có thể đòi tự trị từng bước, như Ấn Độ hay Philippines đã đi. Nhưng con đường ấy phụ thuộc vào chính quyền thuộc địa, vốn hiếm khi nhượng bộ.' },
  qdd: { title: 'Nếu Việt Nam Quốc dân đảng không tan vỡ sau Yên Bái', level: 'C', basis: 'Lãnh đạo Việt Nam Quốc dân đảng bị xử tử năm 1930; khi trở về năm 1945–1946, lực lượng phụ thuộc quân Trung Hoa Dân Quốc.',
    body: 'Cuộc khởi nghĩa tháng 2.1930 không nổ ra vội vã, lãnh đạo không bị xử chém hàng loạt. Năm 1945 có thể có một đảng dân tộc không cộng sản đủ mạnh để tranh quyền lãnh đạo, với hậu thuẫn của Trung Hoa Dân Quốc. Kết quả khó đoán: có thể là một nhà nước khác, cũng có thể là một cuộc nội chiến sớm hơn giữa những người cùng chống Pháp.' },
  laphien: { title: 'Nếu Pháp chấp nhận một lộ trình tự trị', level: 'D', basis: 'Pháp nhượng bộ rất ít suốt thập niên 1920–1930; nhiều sử gia coi sự đóng cửa ấy là một nguyên nhân đẩy giới trẻ sang cách mạng.',
    body: 'Paris giữ các hứa hẹn cải cách, mở rộng Hội đồng Quản hạt, cho người Việt lập đảng, ra báo. Một lộ trình như Philippines (được Mỹ hẹn trả độc lập năm 1934, trao năm 1946) có thể bớt đổ máu. Nhưng Pháp khi ấy nhượng bộ rất ít, và nhiều sử gia cho rằng chính sự đóng cửa ấy đã đẩy thế hệ trẻ sang con đường cách mạng.' },
  qg: { title: 'Nếu Pháp trao độc lập trọn vẹn cho Quốc gia Việt Nam', level: 'C', basis: 'Độc lập năm 1949 bị giới hạn về quân đội, ngoại giao, tài chính; từ năm 1950 Việt Minh có hậu phương Trung Quốc.',
    body: 'Năm 1949 Pháp trao cho chính phủ Bảo Đại độc lập thật sự, cả quân đội, ngoại giao, tài chính, thay vì "độc lập trong Liên hiệp Pháp". Một nhà nước quốc gia có thực quyền có thể thu hút nhiều người trung dung hơn; nhưng Việt Minh khi ấy đã giữ nhiều vùng nông thôn và có hậu phương mới ở Trung Quốc, nên chiến tranh nhiều khả năng vẫn tiếp diễn.' },
  tl: { title: 'Nếu chiến tranh không nổ ra cuối năm 1946', level: 'B', basis: 'Hiệp định Sơ bộ 6.3.1946 và Tạm ước 14.9.1946 có thật; cả hai phía đều có người muốn và người không muốn thoả hiệp.',
    body: 'Hiệp định Sơ bộ 6.3.1946 và Tạm ước 14.9.1946 được giữ; vụ Hải Phòng tháng 11 và đêm 19.12 không xảy ra. Việt Nam có thể đi tới độc lập qua thương lượng trong vài năm, như nhiều thuộc địa khác sau Thế chiến, và những người chỉ mong giữ làng sẽ không phải sống giữa vùng xôi đậu. Nhưng cả hai phía đều có người không muốn nhượng bộ, nên đây là một khả năng mong manh.' },
  nam: { title: 'Nếu Việt Nam Cộng hoà đứng vững sau 1973', level: 'C', basis: 'Viện trợ Mỹ giảm mạnh năm 1974; phần đông sử gia cho rằng sau năm 1973 cán cân đã nghiêng hẳn.',
    body: 'Viện trợ Mỹ không bị cắt giảm mạnh năm 1974, Ban Mê Thuột giữ được, lằn ranh của Hiệp định Paris kéo dài. Đất nước có thể bị chia cắt lâu dài như bán đảo Triều Tiên: hai nhà nước, một đường ranh quân sự và những gia đình ly tán qua nhiều thế hệ. Phần đông sử gia cho rằng sau năm 1973 khả năng này đã rất thấp.' },
  thuba: { title: 'Nếu Hội đồng Hoà giải và Hoà hợp Dân tộc ra đời', level: 'D', basis: 'Điều 12 Hiệp định Paris 1973 dự liệu hội đồng ba thành phần; không bên nào thực thi. Các chính phủ liên hiệp ở Lào (1962, 1974) đều không bền.',
    body: 'Hiệp định Paris 1973 được thực thi đúng chữ: một Hội đồng Quốc gia Hoà giải và Hoà hợp Dân tộc ba thành phần ra đời, trong đó có những người như dòng họ bạn, và đứng ra tổ chức tổng tuyển cử. Thống nhất có thể đến qua thương lượng, như Lào từng thử với các chính phủ liên hiệp. Nhưng cả hai bên đều không thực sự muốn chia quyền, và các chính phủ liên hiệp ở Lào cũng không bền.' },
  baocap: { title: 'Nếu không có Đổi Mới năm 1986', level: 'C', basis: 'Lạm phát năm 1986 thường được dẫn là khoảng 775%; "khoán chui" đã có từ thập niên 1960 và Khoán 100 từ năm 1981.',
    body: 'Đại hội VI giữ nguyên kế hoạch hoá tập trung; không có Khoán 10, không có Luật Đầu tư nước ngoài năm 1987. Lạm phát hàng trăm phần trăm của năm 1986 có thể kéo dài, như ở những nền kinh tế kế hoạch không cải cách. Nhưng "khoán chui" đã có từ những năm 1960 ở nhiều hợp tác xã, nên sức ép đổi mới từ dưới lên khó mà chặn lâu.' },
  radi: { title: 'Nếu Việt Nam và Mỹ bình thường hoá quan hệ từ 1977–1978', level: 'B', basis: 'Đàm phán Việt – Mỹ 1977–1978 có thật và từng tiến gần thoả thuận; Mỹ gác lại để ưu tiên quan hệ với Trung Quốc.',
    body: 'Các cuộc đàm phán Việt – Mỹ năm 1977–1978 thành công thay vì bế tắc vì chuyện viện trợ, Campuchia và Trung Quốc. Cấm vận có thể được dỡ sớm hơn mười lăm năm, kiều hối và đường di cư hợp pháp mở sớm hơn, và có lẽ ít người phải liều mạng trên biển. Thực tế, khoảng 800.000 thuyền nhân Việt Nam đã tới các trại tị nạn trong hai thập niên sau năm 1975 (số của UNHCR), và không ai biết chính xác bao nhiêu người không tới.' },
};
/** Điểm rẽ đầu tiên con đường rời hướng chiếm ưu thế ("lịch sử rẽ từ đây"); con đường trùng cả năm thì lấy hướng ở
    điểm rẽ 2 (không ngả nào thắng: "nếu ngả này thành công"). Sau điểm rẽ đầu tiên, hướng "chiếm ưu thế" của các điểm
    rẽ sau không còn là dữ kiện, nên trò chơi không nhân tiếp các ước lượng. */
export function firstDivergence(picks: string[]): { i: number; id: string; cf: CF; p: number; free: boolean } | null {
  let i = picks.findIndex((x, k) => !!x && !!PREV[k] && x !== PREV[k]);
  const free = i < 0;
  if (free) i = PREV.findIndex((x, k) => !x && !!picks[k]);
  const id = picks[i], cf = id ? CFS[id] : undefined;
  return i >= 0 && cf ? { i, id, cf, p: LEVEL[cf.level][0], free } : null;
}
/** "khoảng 5% (1 trên 20)". */
export const estimate = (lv: Level) => { const p = LEVEL[lv][0]; return `khoảng ${Math.round(p * 100)}% (1 trên ${Math.round(1 / p)})`; };
