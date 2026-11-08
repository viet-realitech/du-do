import { surnameKey, asFamily, ARCHETYPES, type Archetype } from './data/surnames';
import { SPECIAL, type SpecialCard } from './data/cards2';
import { ERAS, EV, regime2, type Era, type Faction, type HistEvent, type Region } from './data';
import { CARD, type Fx } from './data/cards';
import { S, save, curPick, type Res, type Rel, renameFamily, matchStats } from './state';

/* Chế độ Chơi: gia sản dòng họ (4 tài nguyên), quan hệ với các thế lực, thẻ ứng xử ở mỗi sự kiện
   và "mùa màng" ở mỗi thế hệ. Lịch sử vẫn diễn ra như đã diễn ra; chỉ vận mệnh dòng họ đổi. */

export const HOMES: [string, string, [number, number], Region][] = [
  ['hn', 'Hà Nội', [105.85, 21.03], 'B'], ['nd', 'Nam Định', [106.17, 20.42], 'B'],
  ['na', 'Nghệ An', [105.67, 18.67], 'T1'], ['hue', 'Huế', [107.58, 16.46], 'T2'],
  ['qn', 'Quảng Nam', [108.3, 15.9], 'T2'], ['sg', 'Sài Gòn – Gia Định', [106.7, 10.78], 'NE'],
  ['mt', 'Mỹ Tho', [106.36, 10.36], 'NE'], ['ct', 'Cần Thơ', [105.78, 10.03], 'NW'],
];
export const home = () => HOMES.find(h => h[0] === S.home) || HOMES[0];

const ic = (d: string) => `<svg class="ri" viewBox="0 0 16 16" width="13" height="13" aria-hidden="true"><path d="${d}" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
/** Tài nguyên: khoá, tên, biểu tượng (bông lúa, người, đồng bạc, đèn lồng). */
export const RES: [keyof Res, string, string][] = [
  ['g', 'Lúa gạo', ic('M8 14V6M8 6c-3 0-4-2-4-4 2 0 4 1 4 4zm0 0c3 0 4-2 4-4-2 0-4 1-4 4zM8 10c-2.5 0-3.5-1.5-3.5-3 1.5 0 3.5 1 3.5 3zm0 0c2.5 0 3.5-1.5 3.5-3-1.5 0-3.5 1-3.5 3z')],
  ['d', 'Nhân đinh', ic('M6 7a2.2 2.2 0 1 0 0-4.4A2.2 2.2 0 0 0 6 7zm5 .5a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6zM1.5 13.5c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4zm9.2 0c0-1.8-.8-3-2-3.6 1.5-.7 5.3 0 5.3 3.6z')],
  ['b', 'Bạc', ic('M8 14.2A6.2 6.2 0 1 0 8 1.8a6.2 6.2 0 0 0 0 12.4zM8 4.5v7M6 6.3c0-1 4-1 4 0s-4 .8-4 1.9 4 1.2 4 2.2-4 1-4 0')],
  ['u', 'Uy tín', ic('M8 2v1.5M5 3.5h6M4.5 5.5h7l-.8 6.5H5.3zM8 5.5v6.5M6.5 13.8h3M4.5 8h7')],
];
export const POWERS: Record<keyof Rel, [string, Faction | null]> = {
  tr: ['Triều đình', 'dainam'], ph: ['Pháp', 'phap'], nh: ['Nhật', 'jp'], vm: ['Việt Minh / VNDCCH', 'vndcch'],
  qg: ['Quốc gia / VNCH', 'vnch'], my: ['Mỹ', null], nn: ['Nhà nước', 'chxhcn'], lg: ['Làng xóm', null],
};

export const isPlay = () => S.mode === 'play';

/** Thế lực đáng kể vào năm y (hiện trên màn chính, sổ quan hệ). */
export function powersAt(y: number): (keyof Rel)[] {
  if (y < 1930) return ['tr', 'ph', 'lg'];
  if (y < 1940) return ['tr', 'ph', 'vm', 'lg'];
  if (y < 1945) return ['ph', 'nh', 'vm', 'lg'];
  if (y < 1954) return ['ph', 'vm', 'qg', 'lg'];
  if (y < 1976) return ['vm', 'qg', 'my', 'lg'];
  return y < 1995 ? ['nn', 'lg'] : ['nn', 'my', 'lg'];
}

/** Thế lực cai quản quê nhà vào năm y. */
export function ruler(y: number): keyof Rel | null {
  const g = home()[3], key = (g === 'QT' ? (y >= 1954 && y < 1976 ? 'T2' : 'T1') : g) as Exclude<Region, 'QT'>;
  const f = regime2(y).reg[key];
  return ({ dainam: 'tr', dnph: 'ph', phap: 'ph', phap_bh: 'ph', jp: 'nh', vndcch: 'vm', cmlt: 'vm', vnch: 'qg', chxhcn: 'nn', tc: null } as Record<string, keyof Rel | null>)[f || ''] ?? null;
}

export const relLabel = (v: number) => (v >= 75 ? 'Tin cậy' : v >= 55 ? 'Thân thiện' : v >= 40 ? 'Trung lập' : v >= 25 ? 'Nghi ngờ' : 'Thù địch');
export const relTone = (v: number) => (v >= 55 ? 'ok' : v >= 40 ? '' : 'bad');

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

/** Áp một bộ hiệu ứng lên gia sản và quan hệ; trả về phần đổi thực. */
export function applyFx(fx: Fx): Fx {
  const got: Fx = {};
  for (const [k, n] of Object.entries(fx) as [keyof Fx, number][]) {
    if (!n) continue;
    if (k in S.res) { const r = S.res as Record<string, number>; const b = r[k]; r[k] = clamp(b + n); if (r[k] !== b) got[k] = r[k] - b; }
    else { const r = S.rel as Record<string, number>; const b = r[k]; r[k] = clamp(b + n); if (r[k] !== b) got[k] = r[k] - b; }
  }
  save();
  return got;
}

/* ---------- thẻ sự kiện ---------- */
export const cardOf = (v: HistEvent) => (v.diary ? undefined : CARD[v.id]);
/** Bắt buộc quyết định: cả nước, hoặc sự kiện chạm tới quê nhà. */
export function mustDecide(v: HistEvent): boolean {
  const c = cardOf(v);
  if (!c) return false;
  if (c[1] === 'all') return true;
  const g = home()[3];
  return c[1].split(',').some(r => r === g || (g === 'QT' && (r === 'T1' || r === 'T2')));
}
export const decided = (id: string) => id in S.cards;
/** Thẻ bắt buộc (hay biến cố riêng) đầu tiên còn bỏ ngỏ tính đến năm y (dừng dòng thời gian ở đó). */
export const pendingCard = (y: number): HistEvent | undefined =>
  isPlay() ? EV.find(v => v.y <= y && needsDecision(v) && (mustDecide(v) || !!specialFor(v))) : undefined;

/** Điều kiện có thể chọn: không để tài nguyên âm quá sức. */
export function canAfford(fx: Fx): string | null {
  for (const [k, name] of RES) {
    const n = fx[k] || 0;
    if (n < 0 && S.res[k] + n < 0) return `Không đủ ${name.toLowerCase()}`;
  }
  return null;
}

export function decide(v: HistEvent, i: number): Fx {
  const c = cardOf(v)!, ch = c[2][i];
  S.xs[v.id] = specialFor(v)?.id || ''; // chốt biến cố riêng theo hoàn cảnh lúc quyết định (trước khi trừ gia sản)
  S.cards[v.id] = i;
  const got = applyFx(ch[2]);
  save();
  return got;
}

/* ---------- biến cố riêng của dòng họ (cards2.ts) ---------- */
function matches(w: SpecialCard['when'], y: number): boolean {
  if (w.surnames && !w.surnames.includes(S.surname || surnameKey(S.name))) return false;
  if (w.homes && !w.homes.includes(S.home)) return false;
  if (w.minB != null && S.res.b < w.minB) return false;
  // picks: dòng họ đã chọn một trong các hướng này ở một điểm rẽ nào đó tính tới năm y; camps: phe đang theo vào năm y.
  if (w.picks && !ERAS.some(e => e.cy <= y && w.picks!.includes(S.picks[e.id]))) return false;
  if (w.camps) { const pk = curPick(y); if (!pk || !w.camps.includes(CAMP[pk.id])) return false; }
  return true;
}
/** Biến cố riêng gắn vào sự kiện v và đúng điều kiện của dòng họ này (họ, phe, quê, gia sản). Điều kiện được xét
    một lần, lúc dòng họ quyết định thẻ của sự kiện (S.xs); sau đó đổi họ hay đổi gia sản không làm sự kiện cũ
    "mọc" thêm biến cố và kéo dòng thời gian lùi lại. */
export function specialFor(v: HistEvent): SpecialCard | undefined {
  if (!isPlay() || v.diary) return undefined;
  if (v.id in S.xs) return SPECIAL.find(c => c.id === S.xs[v.id]);
  if (decided(v.id) || v.y < S.xFrom) return undefined;
  return SPECIAL.find(c => c.ev === v.id && matches(c.when, v.y));
}
export const specialDecided = (c: SpecialCard) => 'x:' + c.id in S.cards;
export function decideSpecial(c: SpecialCard, i: number, y: number, newName?: string): Fx {
  S.cards['x:' + c.id] = i;
  const ch = c.choices[i], got = applyFx(ch[2]);
  if (ch[4]) renameFamily(asFamily(newName || ch[4]), y, c.title);
  save();
  return got;
}
/** Sự kiện còn cần dòng họ quyết định: thẻ thường chưa quyết, hay biến cố riêng chưa quyết. */
export function needsDecision(v: HistEvent): boolean {
  if (cardOf(v) && !decided(v.id)) return true;
  const sp = specialFor(v);
  return !!sp && !specialDecided(sp);
}

/** Dấu ấn dòng họ ở kết cục, theo đường đã đi qua sáu điểm rẽ và việc đổi họ (nội dung: surnames.ts).
    Thứ tự xét: đổi họ → thuận dòng → trung kiên → hai quê → đứng giữa → rẽ nhiều ngả → mặc định. */
export function lineage(): Archetype | null {
  if (!ARCHETYPES.length) return null;
  const by = (id: string) => ARCHETYPES.find(a => a.id === id) || ARCHETYPES.find(a => a.id === 'thuong') || null;
  const os = ERAS.map(e => e.opts.find(o => o.id === S.picks[e.id]));
  if (os.some(o => !o)) return by('thuong');
  // phía của mỗi thế hệ theo góc nhìn sử học của hướng đã chọn: vn, vnch, hay "giữa" (cải cách, thương thuyết, đứng ngoài)
  const side = os.map(o => (o!.persp === 'vn' || o!.persp === 'vnch' ? o!.persp : 'giua'));
  const n = (k: string) => side.filter(x => x === k).length;
  let turns = 0;
  for (let i = 1; i < side.length; i++) if (side[i] !== side[i - 1]) turns++;
  const ms = matchStats();
  if (S.names.length) return by('doiho');
  if (ms.t && ms.m === ms.t) return by('thuandong');
  if (n('vn') >= 4 || n('vnch') >= 4) return by('trungkien');
  if (S.picks.e6 === 'radi') return by('haique');
  if (n('giua') >= 4) return by('dunggiua');
  if (turns >= 3) return by('nhieunga');
  return by('thuong');
}

/* ---------- lựa chọn điểm rẽ đổi quan hệ ---------- */
const ERA_FX: Record<string, Fx> = {
  chien: { tr: 15, ph: -20 }, canhtan: { tr: 5, ph: 5 }, hoa: { tr: 10, ph: 10 },
  canvuong: { tr: 10, ph: -25 }, dongdu: { ph: -15, nh: 10 }, duytan: { ph: 5, lg: 10 },
  cs: { vm: 25, ph: -25, qg: -10 }, qdd: { ph: -25, vm: -5 }, laphien: { ph: 15, vm: -10 },
  vm: { vm: 25, qg: -15, ph: -20 }, qg: { qg: 25, vm: -20, ph: 10 }, tl: { lg: 10 },
  bac: { vm: 20, qg: -25 }, nam: { qg: 20, vm: -25, my: 10 }, thuba: { lg: 10, vm: -5, qg: -5 },
  baocap: { nn: 15 }, doimoi: { nn: 10, lg: 5 }, radi: { nn: -20, my: 10 },
};
export const eraFx = (optId: string): Fx => ERA_FX[optId] || {};

/* ---------- đường đi của dòng họ qua các điểm rẽ ---------- */
/** Phe / lực lượng mà mỗi hướng ở điểm rẽ gắn với: khoá quan hệ, hoặc 'pt' (phong trào, không phải thế lực cai quản). */
export const CAMP: Record<string, keyof Rel | 'pt'> = {
  chien: 'tr', canhtan: 'tr', hoa: 'tr', canvuong: 'tr', dongdu: 'pt', duytan: 'pt',
  cs: 'vm', qdd: 'pt', laphien: 'ph', vm: 'vm', qg: 'qg', tl: 'lg', bac: 'vm', nam: 'qg', thuba: 'lg',
  baocap: 'nn', doimoi: 'nn', radi: 'my',
};
/** Hướng ở điểm rẽ sau được xem là "tiếp nối" hướng trước (cùng phe hoặc kế thừa tinh thần). */
export const NEXT: Record<string, string[]> = {
  chien: ['canvuong'], canhtan: ['duytan', 'dongdu'], hoa: ['duytan'],
  canvuong: ['cs', 'qdd'], dongdu: ['cs', 'qdd'], // Cần Vương → đấu tranh vũ trang (Phan Bội Châu, Nguyễn Thái Học, Nguyễn Ái Quốc) duytan: ['qdd', 'laphien'],
  cs: ['vm'], qdd: ['qg'], laphien: ['qg', 'tl'],
  vm: ['bac'], qg: ['nam'], tl: ['thuba'],
  bac: ['baocap', 'doimoi'], nam: ['radi', 'doimoi'], thuba: ['doimoi'],
};
export const continues = (prev: string | undefined, next: string) => !!prev && (NEXT[prev] || []).includes(next);
/** Lựa chọn trên thẻ hợp (1) hay trái (-1) với đường dòng họ đang theo, xét quan hệ với phe đó; 0 khi không liên quan. */
export function alignment(fx: Fx, y: number): -1 | 0 | 1 {
  const pk = curPick(y), c = pk && CAMP[pk.id];
  if (!c || c === 'pt') return 0;
  const n = fx[c] || 0;
  return n > 0 ? 1 : n < 0 ? -1 : 0;
}

/* ---------- mùa màng mỗi thế hệ ---------- */
/** `lines`: các khoản danh nghĩa; `total`: phần đổi thực sau khi chặn ở 0 và 100. */
export interface Harvest { lines: [string, Fx][]; total: Fx }
/** Mùa màng của thế hệ vừa sống qua (`lived`), tính vào năm `y` nó khép lại; một lần mỗi thế hệ.
    Phụ thuộc bên cai quản quê nhà và làng xóm nghĩ gì về dòng họ. */
export function harvest(lived: Era, y: number): Harvest | null {
  if (!isPlay() || S.harvests.includes(lived.id)) return null;
  const r = ruler(y), rv = r ? S.rel[r] : 45, lg = S.rel.lg;
  // Thu nhập cố định; chi phí tăng theo quy mô (họ càng đông càng tốn gạo, càng giàu càng nặng thuế, danh tiếng phai dần):
  // không chọn gì cũng không thể giàu mãi, và không có tài nguyên nào kẹt ở mức trần.
  const { g, d, b, u } = S.res;
  const lines: [string, Fx][] = [
    ['Ruộng đất của họ', { g: 14, d: 7, b: 5 }],
    ['Nuôi người trong họ', { g: -Math.round(d / 6 + (g * g) / 500) }],
    ['Thuế và sưu dịch', { b: -Math.round((b * b) / 350) }],
    ['Danh tiếng phai theo thời gian', { u: -Math.max(4, Math.round((u * u) / 700)) }],
  ];
  if (r) lines.push([`${POWERS[r][0]} · ${relLabel(rv).toLowerCase()}`, { g: Math.round((rv - 50) / 5), b: Math.round((rv - 50) / 6), u: rv >= 75 ? 3 : rv < 25 ? -4 : 0 }]);
  else lines.push(['Vùng tranh chấp', { g: -6, d: -2 }]);
  lines.push([`Làng xóm · ${relLabel(lg).toLowerCase()}`, { g: Math.round((lg - 50) / 8), u: Math.round((lg - 50) / 10) }]);
  if (d >= 60) lines.push(['Họ đông người', { g: 4, b: 4 }]);
  if (d < 20) lines.push(['Thiếu người làm', { g: -6 }]);
  if (g < 10) lines.push(['Đói kém', { d: -4, u: -3 }]);
  const total: Fx = {};
  const shown = lines.filter(([, fx]) => Object.values(fx).some(Boolean)); // bỏ dòng không đổi gì (vd. thuế khi không có bạc)
  for (const [, fx] of shown) for (const [k, n] of Object.entries(fx) as [keyof Fx, number][]) total[k] = (total[k] || 0) + n;
  const got = applyFx(total); // phần đổi thực (đã chặn ở 0 và 100)
  S.harvests.push(lived.id);
  save();
  return { lines: shown, total: got };
}

/* ---------- kết cục ---------- */
export function rank(): [string, string] {
  const { g, d, b, u } = S.res, s = g + d + b + u;
  if (d < 15) return ['Dòng họ ly tán', 'Người còn lại quá ít; gia phả dừng ở thế hệ này.'];
  if (s >= 225) return ['Vọng tộc', 'Giàu có, đông đúc và được kính trọng qua sáu thế hệ.'];
  if (s >= 185) return ['Gia đình khá giả', 'Giữ được ruộng, giữ được người, có tiếng trong vùng.'];
  if (s >= 140) return ['Thường dân', 'Qua được mọi cơn bão, không giàu, không mất gốc.'];
  return ['Nhà sa sút', 'Chiến tranh và lựa chọn lấy đi gần hết, chỉ còn tên họ.'];
}

export const decidedCount = () => Object.keys(S.cards).length;
export const allPicked = () => ERAS.every(e => !!S.picks[e.id]);
/** Chi phí tài nguyên của một lựa chọn (chỉ phần âm), để tìm lựa chọn rẻ nhất khi không đủ cho mọi lựa chọn. */
export const cost = (fx: Fx) => RES.reduce((n, [k]) => n + Math.max(0, -(fx[k] || 0)), 0);
