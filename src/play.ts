import { surnameKey, asFamily } from './data/surnames';
import { SPECIAL, type SpecialCard } from './data/cards2';
import { ERAS, EV, regime2, type Era, type Faction, type HistEvent, type Option, type Region } from './data';
import { CARD, VARIANT, type Card, type Choice, type Fx } from './data/cards';
import { S, save, curPick, chYear, evEra, optView, type Res, type Rel, renameFamily, familyName, viewing } from './state';
import { tiersOf, thOf, complete, endingOf, titleOf, ENDINGS, ABROAD6, GONE, GONE_AT, type Ending, type Facts, type Flag } from './data/endings';

/* Chế độ Chơi: gia sản dòng họ (4 tài nguyên), quan hệ với các thế lực, thẻ ứng xử ở mỗi sự kiện
   và "mùa màng" ở mỗi thế hệ. Lịch sử vẫn diễn ra như đã diễn ra; chỉ vận mệnh dòng họ đổi. */

export const HOMES: [string, string, [number, number], Region][] = [
  ['hn', 'Hà Nội', [105.85, 21.03], 'B'], ['nd', 'Nam Định', [106.17, 20.42], 'B'],
  ['na', 'Nghệ An', [105.67, 18.67], 'T1'], ['hue', 'Huế', [107.58, 16.46], 'T2'],
  ['qn', 'Quảng Nam', [108.3, 15.9], 'T2'], ['sg', 'Sài Gòn – Gia Định', [106.7, 10.78], 'NE'],
  ['mt', 'Mỹ Tho', [106.36, 10.36], 'NE'], ['ct', 'Cần Thơ', [105.78, 10.03], 'NW'],
];
export const home = () => HOMES.find(h => h[0] === S.home) || HOMES[0];
const NORTH: Region[] = ['B', 'T1'];
/** Vùng dòng họ thật sự sống vào năm y: điểm rẽ 5 (Genève, 1954) dời nhà. Nhà miền Bắc (Hà Nội, Nam Định, Nghệ An)
    chọn Miền Nam hay Thành phần thứ ba thì di cư vào Nam, sống quanh Sài Gòn – Biên Hoà như phần đông người di cư, và
    ở lại đó cả sau 1975; nhà chọn ở lại mà rồi vẫn vào Nam trước khi đội cải cách về (x-diachu53) cũng vậy. Nhà phía
    nam vĩ tuyến 17 chọn Miền Bắc thì tập kết ra Bắc, sau 1975 về lại quê. Thẻ theo vùng, bên cai quản (mùa màng), nhãn
    "chạm tới quê" đều theo vùng này. Bản lưu có trước việc dời nhà: những năm trước lúc mở lại vẫn ở quê (S.movedFrom). */
export function regionAt(y: number): Region {
  const g = home()[3], p = S.picks.e5;
  if (y < 1954 || !p || y < S.movedFrom) return g;
  if (NORTH.includes(g)) return p === 'nam' || p === 'thuba' || S.cards['x:x-diachu53'] === 2 ? 'NE' : g;
  return p === 'bac' && y < 1976 ? 'B' : g;
}
/** Nơi dòng họ sống vào năm y: quê nhà, hay nơi ở mới sau 1954 (tên, toạ độ cho dấu nhà trên bản đồ). */
export function placeAt(y: number): { name: string; l: [number, number]; moved: boolean } {
  const h = home(), r = regionAt(y);
  if (abroad(y)) return { name: 'xứ người', l: h[2], moved: true }; // cả nhà đã ra nước ngoài: dấu nhà trên bản đồ vẫn ở quê gốc
  if (r === h[3]) return { name: h[1], l: h[2], moved: false };
  return r === 'B' ? { name: 'miền Bắc', l: [105.85, 21.03], moved: true } : { name: 'miền Nam', l: [106.82, 10.95], moved: true };
}

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
  if (abroad(y)) return 'my'; // cả nhà đã ra nước ngoài: mùa màng theo nơi ở mới (quan hệ với Mỹ, phương Tây), không theo chính quyền ở quê
  const g = regionAt(y), key = (g === 'QT' ? (y >= 1954 && y < 1976 ? 'T2' : 'T1') : g) as Exclude<Region, 'QT'>;
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
/** Thẻ của sự kiện; thẻ cả nước có lựa chọn riêng cho vùng quê của dòng họ (VARIANT) thì dùng lựa chọn đó. */
export function cardOf(v: HistEvent): Card | undefined {
  const k = variantIx(v);
  if (k === undefined) return undefined;
  const c = CARD[v.id], va = k >= 0 ? VARIANT[v.id][k] : undefined;
  return va ? [c[0], va.scope ?? c[1], va.choices] : c;
}
/** Bộ lựa chọn thẻ của sự kiện dùng: chỉ số trong VARIANT, -1 = bộ gốc, undefined = không có thẻ. Vùng (`regions`) là
    vùng dòng họ đang sống vào năm của chương (regionAt), `from` là vùng quê gốc: nhà Huế tập kết ra Bắc là regions B,
    from T2. `picks`: đã chọn một trong các hướng đó; `flags`: một lựa chọn đã quyết trước năm của sự kiện mang cờ đó;
    `special`: biến cố riêng ấy gắn vào sự kiện (chốt trong S.xs lúc quyết định). */
function variantIx(v: HistEvent): number | undefined {
  if (v.diary || !CARD[v.id]) return undefined;
  if (S.cardv[v.id] === 'base' || !VARIANT[v.id]) return -1; // quyết trước khi có lựa chọn theo vùng: giữ bộ gốc
  const picked = Object.values(S.picks), g = regionAt(chYear(v)), g0 = home()[3];
  return VARIANT[v.id].findIndex(x => (!x.regions || x.regions.includes(g)) && (!x.from || x.from.includes(g0)) && (!x.homes || x.homes.includes(S.home)) &&
    (!x.picks || x.picks.some(p => picked.includes(p))) && !x.notPicks?.some(p => picked.includes(p)) &&
    (!x.after || x.after.some(a => { const [k, i] = a.split('='); return S.cards[k] === +i; })) && (!x.flags || hasFlag(x.flags, v.y)) &&
    (!x.special || specialsFor(v).some(c => c.id === x.special)));
}
/** Sự kiện và biến cố riêng có thể mang mỗi cờ (bộ gốc và mọi bộ thay thế): hasFlag chỉ xét chúng, không dựng lại cả
    trăm thẻ (và các bộ thay thế theo cờ lồng nhau) mỗi lần vẽ. */
const FLAG_EV: Partial<Record<Flag, HistEvent[]>> = {}, FLAG_SP: Partial<Record<Flag, [SpecialCard, number][]>> = {};
for (const v of EV) if (!v.diary && CARD[v.id]) for (const ch of [CARD[v.id][2], ...(VARIANT[v.id] || []).map(x => x.choices)].flat()) if (ch[4]) { const l = (FLAG_EV[ch[4]] ||= []); if (!l.includes(v)) l.push(v); }
for (const c of SPECIAL) { const y = EV.find(x => x.id === c.ev)?.y; if (y != null) for (const ch of c.choices) if (ch[5]) { const l = (FLAG_SP[ch[5]] ||= []); if (!l.some(x => x[0] === c)) l.push([c, y]); } }
/** Sự kiện có lựa chọn mang mỗi dấu (cards.ts Choice[5]; bộ gốc và mọi bộ thay thế): biến cố hệ quả chỉ xét chúng. */
const MARK_EV: Record<string, HistEvent[]> = {};
for (const v of EV) if (!v.diary && CARD[v.id]) for (const ch of [CARD[v.id][2], ...(VARIANT[v.id] || []).map(x => x.choices)].flat()) if (ch[5]) { const l = (MARK_EV[ch[5]] ||= []); if (!l.includes(v)) l.push(v); }
/** Sự kiện trước `v` mà dòng họ đã chốt một lựa chọn mang dấu `m` (biến cố hệ quả nói "năm ấy"), hay undefined. */
export function markedAt(m: string, v: HistEvent): HistEvent | undefined {
  const at = EV.indexOf(v);
  return (MARK_EV[m] || []).find(e => EV.indexOf(e) < at && decided(e.id) && cardOf(e)?.[2][S.cards[e.id]]?.[5] === m);
}
/** Dòng họ đã chốt một lựa chọn mang một trong các cờ này ở sự kiện trước năm y (thẻ thường, biến cố riêng). */
export function hasFlag(fs: readonly Flag[], y = 9999): boolean {
  for (const f of fs) {
    for (const v of FLAG_EV[f] || []) if (v.y < y && decided(v.id)) { const g = cardOf(v)?.[2][S.cards[v.id]]?.[4]; if (g && fs.includes(g)) return true; }
    for (const [c, cy] of FLAG_SP[f] || []) { const i = S.cards['x:' + c.id], g = i != null && cy < y ? c.choices[i]?.[5] : undefined; if (g && fs.includes(g)) return true; }
  }
  return false;
}
/** Khoá tra bảng ALIGN_OVR cho lựa chọn i trên thẻ đang dùng của v: 'ng45:2' (bộ gốc), 'dc54@1:0' (bộ thay thế thứ 1). */
export function alKey(v: HistEvent, i: number): string {
  const k = variantIx(v);
  return k !== undefined && k >= 0 ? `${v.id}@${k}:${i}` : `${v.id}:${i}`;
}
/** Cả nhà đã ra nước ngoài trước năm y (cờ rời nước endings.ts GONE: di tản tháng 4.1975, "bán chính thức" 1979, vượt
    biển hay đi diện đoàn tụ ODP 1980; hasFlag xét năm của thẻ mang cờ): dòng họ sống ở xứ người từ sau năm ấy, nên thẻ
    theo vùng và biến cố trong nước không còn là việc của họ; thẻ cả nước có bộ lựa chọn nói từ xứ người (VARIANT, cờ
    GONE). Điểm rẽ 6 (1976) nói từ xứ người chỉ với nhà đã đi trước năm ấy (abroadOpt, ABROAD6). */
export const abroad = (y = 9999): boolean => isPlay() && y > 1975 && hasFlag(GONE, y);
/** Bộ lựa chọn VARIANT nói từ xứ người (mang cờ rời nước). */
const abroadSet = (k: number, id: string) => k >= 0 && !!VARIANT[id][k].flags?.some(f => GONE.includes(f));
/** Bắt buộc quyết định: cả nước, hoặc sự kiện chạm tới nơi dòng họ đang sống (quê, hay nơi ở mới sau 1954). */
export function mustDecide(v: HistEvent): boolean {
  const c = cardOf(v);
  if (!c) return false;
  if (c[1] === 'all') return true;
  if (abroad(chYear(v))) return false; // đã ra nước ngoài: chiến tranh biên giới, kiểm kê Chợ Lớn… không chạm tới nhà
  const g = regionAt(chYear(v));
  return c[1].split(',').some(r => r === g || (g === 'QT' && (r === 'T1' || r === 'T2')));
}
export const decided = (id: string) => id in S.cards;
/** Điểm rẽ cuối (năm 1976): hướng Ra đi. */
const GATE6_ID = ERAS[ERAS.length - 1].id;
/** Thẻ dành cho dòng họ này: thẻ bắt buộc (cả nước / chạm quê) hay thẻ tuỳ chọn chung (phạm vi ''); thẻ tuỳ chọn của
    vùng khác (vd. giữ thành Hà Nội 1882 với nhà ở Nghệ An) không mời. Nhà đã ra nước ngoài: thẻ tuỳ chọn viết cho người
    trong nước (góp tiền qua báo Tuổi Trẻ, nhận ruộng tái định cư…) không mời, trừ thẻ có bộ lựa chọn nói từ xứ người. */
export const localCard = (v: HistEvent): boolean => {
  if (closed() && !decided(v.id)) return false;
  const c = cardOf(v), k = variantIx(v);
  return !!c && ((c[1] === '' && (!abroad(chYear(v)) || (k !== undefined && abroadSet(k, v.id)))) || mustDecide(v));
};
/** Hồ sơ dòng họ đã khép (Trò chơi, kết cục đã giữ ở S.endFix): không mời quyết thêm thẻ nào, kể cả thẻ tuỳ chọn còn bỏ
    ngỏ của những năm đã qua. Kết cục đã khép không đổi nữa, nên một quyết định muộn chỉ làm gia sản, hạng và lời "vì sao"
    trong hồ sơ nói khác kết cục. */
const closed = (): boolean => isPlay() && !!S.endFix?.id;
/** Thẻ hiện cho dòng họ này (nút ◆ / ✓): thẻ của mình, thẻ đã quyết từ trước, hay có biến cố riêng gắn vào. Hồ sơ đã
    khép: chỉ thẻ đã quyết. */
export const ownCard = (v: HistEvent): boolean => isPlay() && !!cardOf(v) && (decided(v.id) || (!closed() && (localCard(v) || !!specialFor(v))));
/** Trang nhật ký (người viết đi xa) và việc cả họ ở nhà vừa quyết gần nhất trong cùng chương: lựa chọn, và nó hợp (1) /
    trái (-1) / không liên quan (0) với hướng thế hệ này theo. Trò chơi; null nếu chưa quyết thẻ nào. */
export function homeChoice(v: HistEvent): { v: HistEvent; ch: Choice; al: -1 | 0 | 1 } | null {
  if (!isPlay() || !v.diary) return null;
  // việc cùng năm chỉ tính khi đã xảy ra trước tháng của trang nhật ký (kéo pháo Điện Biên tháng 3 – 5.1954 không nhắc
  // việc dòng họ chọn sau Genève tháng 7)
  const xs = choicesIn(evEra(v).cy, v.y), x = xs.find(c => c.v.y < v.y || !v.m || evMonth(c.v) <= v.m);
  return x ? { ...x, al: alignment(x.ch[2], chYear(v), alKey(x.v, S.cards[x.v.id])) } : null;
}
/** Tháng bắt đầu của sự kiện theo ngày ghi ('13.3 – 7.5.1954' → 3, '8.1954 – 5.1955' → 8); 0 nếu chỉ ghi năm. */
export function evMonth(v: HistEvent): number {
  const ns = (String(v.d).split(/\s*[–-]\s*/)[0].match(/\d+/g) || []).map(Number).filter(n => n < 1000);
  return ns.length >= 2 ? ns[1] : ns[0] || 0;
}
/** Các lựa chọn dòng họ đã chốt trên thẻ sự kiện trong các năm [y0, y1], mới nhất trước (Trò chơi). */
export function choicesIn(y0: number, y1: number, era?: Era): { v: HistEvent; ch: Choice }[] {
  if (!isPlay()) return [];
  return EV.filter(v => !v.diary && (era ? evEra(v) === era : v.y >= y0 && v.y <= y1) && decided(v.id))
    .map(v => ({ v, ch: cardOf(v)?.[2][S.cards[v.id]] }))
    .filter((x): x is { v: HistEvent; ch: Choice } => !!x.ch).reverse();
}
/** Thẻ bắt buộc (hay biến cố riêng) đầu tiên còn bỏ ngỏ tính đến năm y (dừng dòng thời gian ở đó). */
export const pendingCard = (y: number): HistEvent | undefined =>
  isPlay() ? EV.find(v => v.y <= y && needsDecision(v) && (mustDecide(v) || !!specialFor(v))) : undefined;

/** Điều kiện có thể chọn: không để tài nguyên âm quá sức. Lúa gạo và bạc bù cho nhau (payFx): chỉ khi cả hai cộng lại
    vẫn không đủ mới khoá. */
export function canAfford(fx: Fx): string | null {
  for (const [k, name] of RES) {
    if (k === 'g' || k === 'b') continue;
    const n = fx[k] || 0;
    if (n < 0 && S.res[k] + n < 0) return `Không đủ ${name.toLowerCase()}`;
  }
  const g1 = S.res.g + (fx.g || 0), b1 = S.res.b + (fx.b || 0);
  if (g1 + b1 < 0) return g1 < 0 && b1 < 0 ? 'Không đủ lúa gạo, bạc' : g1 < 0 ? 'Không đủ lúa gạo' : 'Không đủ bạc';
  return null;
}
/** Lúa gạo và bạc đổi một ăn một, như nhà có của vẫn làm (bỏ bạc đong gạo năm đói; bán thóc, bán ruộng lấy bạc): phần
    thiếu của thứ này lấy từ thứ kia. Trả hiệu ứng sẽ áp thật và phần đã đổi: ['g', n] đong n lúa gạo bằng bạc, ['b', n]
    bán n lúa gạo lấy bạc; null khi không cần đổi (hay cả hai cộng lại vẫn thiếu). */
export function payFx(fx: Fx): { fx: Fx; swap: ['g' | 'b', number] | null } {
  const g1 = S.res.g + (fx.g || 0), b1 = S.res.b + (fx.b || 0);
  if (g1 < 0 && b1 + g1 >= 0) return { fx: { ...fx, g: -S.res.g, b: (fx.b || 0) + g1 }, swap: ['g', -g1] };
  if (b1 < 0 && g1 + b1 >= 0) return { fx: { ...fx, b: -S.res.b, g: (fx.g || 0) + b1 }, swap: ['b', -b1] };
  return { fx, swap: null };
}
/** Lựa chọn nào bấm được (null) hay bị khoá (lý do) trên một thẻ chưa quyết; `al`: hợp (1) / trái (-1) đường. Không đủ
    sức thì khoá, trừ khi thế thì thẻ bắt buộc thành ngõ cụt hay chỉ còn câu trả lời trái đường dòng họ theo: khi ấy lựa
    chọn không trái đường rẻ nhất mở (tài nguyên dừng ở 0), như nhà Nghệ An ở vùng tự do không bị ép trả lời "ở vùng
    Pháp" năm 1954; không có lựa chọn nào như thế mà cũng không gì đủ sức thì lựa chọn rẻ nhất mở. */
export function locks(fxs: Fx[], al: number[], bar: (string | null)[] = []): (string | null)[] {
  // `bar` (barred): khoá cứng vì một việc đã quyết, không phải vì thiếu sức: không bao giờ mở lại để tránh ngõ cụt
  const no = fxs.map((fx, i) => bar[i] || canAfford(fx)), all = fxs.map((_, i) => i).filter(i => !bar[i]);
  const open = (ix: number[]) => { if (ix.length) no[ix.reduce((b, i) => (cost(fxs[i]) < cost(fxs[b]) ? i : b))] = null; };
  if (!all.some(i => !no[i] && al[i] >= 0)) { const on = all.filter(i => al[i] >= 0); if (on.length) open(on); else if (all.every(i => no[i])) open(all); }
  return no;
}
/** Người con đã đi bộ đội tình nguyện sang Campuchia năm 1979 (cp79), trên thẻ thật là của nhà này (nhà ở miền Tây Nam Bộ
    năm ấy); quân tình nguyện về hết năm 1989. */
export function atFront(): boolean {
  if (S.cards.cp79 !== 0) return false;
  const cp = EV.find(v => v.id === 'cp79');
  return !!cp && mustDecide(cp);
}
/** Lựa chọn mang cờ `flag` không thể chọn năm y vì một việc dòng họ đã quyết (lý do, hay null): người con còn ở mặt trận
    Campuchia (atFront) thì không còn "cả nhà" để cùng ra đi (cờ GONE: "bán chính thức", vượt biển, diện đoàn tụ). Nhà
    chọn Ra đi mà bị giữ lại thì đi sau khi người con về (biến cố x-radi89 năm 1989). card.ts và các mô phỏng (npm run
    scenes, npm run endings) cùng dùng. */
export function barred(flag: Flag | undefined, y: number): string | null {
  if (!flag || !GONE.includes(flag) || y >= 1989 || !atFront()) return null;
  return 'Người con còn ở mặt trận Campuchia';
}

export function decide(v: HistEvent, i: number): Fx {
  const c = cardOf(v)!, ch = c[2][i];
  // chốt các biến cố của sự kiện (S.xs) theo hoàn cảnh lúc quyết định, trước khi trừ gia sản: biến cố riêng trước khi ghi
  // lựa chọn, biến cố hệ quả sau khi ghi (SpecialWhen.notAfter: nhà vừa theo nghĩa quân không bị hỏi có cho người nhà
  // theo nghĩa quân không). S.xs ghi biến cố riêng trước, để bộ lựa chọn theo biến cố riêng (VARIANT.special) không đổi
  // giữa lúc xem thẻ và lúc đọc lại dấu của lựa chọn vừa chọn.
  const fresh = isPlay() && !v.diary && !(v.id in S.xs) && !decided(v.id) && v.y >= S.xFrom;
  const own = fresh ? candidates(v).find(x => !x.also) : undefined;
  S.xs[v.id] = fresh ? own?.id || '' : specialsFor(v).map(x => x.id).join(',');
  S.cards[v.id] = i;
  if (fresh) S.xs[v.id] = pickX(own, candidates(v).filter(x => x.also)).map(x => x.id).join(',');
  const got = applyFx(payFx(ch[2]).fx);
  save();
  return got;
}

/* ---------- biến cố riêng của dòng họ (cards2.ts) ---------- */
/** Cả nhà sống ở xứ người năm y: đã ra nước ngoài trên thẻ (abroad), hay chọn Ra đi ở điểm rẽ 6 và đã đi (đêm ra khơi năm
    1979; người con còn ở mặt trận Campuchia thì cả nhà đi sau năm 1989, biến cố x-radi89). */
export const livesAbroad = (y: number): boolean => abroad(y) || (isPlay() && S.picks[GATE6_ID] === 'radi' && y > (atFront() ? 1989 : 1979));
function matches(w: SpecialCard['when'], y: number, v: HistEvent): boolean {
  if (w.abroad !== undefined) { if (livesAbroad(y) !== w.abroad) return false; }
  // nhà đã ra nước ngoài: biến cố trong nước (khai lý lịch, rà soát người Hoa) không đến; biến cố của người ra đi (kiều hối) vẫn đến
  else if (abroad(y) && !w.picks?.includes('radi')) return false;
  if (w.surnames && !w.surnames.includes(S.surname || surnameKey(S.name))) return false;
  if (w.homes && !w.homes.includes(S.home)) return false;
  if (w.minB != null && S.res.b < w.minB) return false;
  // picks: dòng họ đã chọn một trong các hướng này ở một điểm rẽ nào đó tính tới năm y; camps: phe đang theo vào năm y.
  if (w.picks && !ERAS.some(e => e.cy <= y && w.picks!.includes(S.picks[e.id]))) return false;
  if (w.camps) { const pk = curPick(y); if (!pk || !w.camps.includes(CAMP[pk.id])) return false; }
  if (w.front && (!atFront() || abroad(y))) return false;
  if (w.renamed !== undefined && (S.names.length > 0 && S.name !== S.names[0].from) !== w.renamed) return false;
  if (w.after && !w.after.some(m => markedAt(m, v))) return false;
  if (w.notAfter?.some(m => markedAt(m, v) || markedOn(m, v))) return false;
  if (w.atHome && placeAt(y).moved) return false;
  return true;
}
/** Lựa chọn dòng họ vừa chốt trên chính thẻ của sự kiện v mang dấu `m` (SpecialWhen.notAfter). */
const markedOn = (m: string, v: HistEvent) => decided(v.id) && cardOf(v)?.[2][S.cards[v.id]]?.[5] === m;
/** Các biến cố gắn vào v khớp điều kiện lúc này, theo thứ tự trong SPECIAL. */
const candidates = (v: HistEvent): SpecialCard[] => { const y = chYear(v); return SPECIAL.filter(c => c.ev === v.id && matches(c.when, y, v)); };
/** Biến cố riêng (nếu có) rồi các biến cố hệ quả, tối đa MAX_X. */
const pickX = (own: SpecialCard | undefined, also: SpecialCard[]): SpecialCard[] => [...(own ? [own] : []), ...also].slice(0, MAX_X);
/** Tối đa bấy nhiêu biến cố trên một sự kiện (biến cố riêng, rồi hệ quả): quá thì bảng thẻ thành một chuỗi dài. */
const MAX_X = 2;
/** Các biến cố gắn vào sự kiện v và đúng điều kiện của dòng họ này (họ, phe, quê, gia sản, việc đã quyết), theo thứ tự
    quyết: biến cố riêng đầu tiên khớp (không có `also`), rồi các biến cố hệ quả. Điều kiện được xét một lần, lúc dòng
    họ quyết định thẻ của sự kiện (S.xs, các id cách nhau bằng dấu phẩy); sau đó đổi họ hay đổi gia sản không làm sự kiện
    cũ "mọc" thêm biến cố và kéo dòng thời gian lùi lại. Bản lưu đã đi qua sự kiện (thẻ đã quyết, hay S.xs đã chốt ''
    khi mở lại: lockPassed) giữ nguyên như cũ: biến cố mới thêm sau không mọc lại trên sự kiện ấy. Trước khi thẻ được
    quyết, danh sách là dự kiến: biến cố hệ quả có `notAfter` còn tuỳ lựa chọn trên chính thẻ (decide chốt lại). */
export function specialsFor(v: HistEvent): SpecialCard[] {
  if (!isPlay() || v.diary) return [];
  if (v.id in S.xs) return S.xs[v.id] ? S.xs[v.id].split(',').map(id => SPECIAL.find(c => c.id === id)).filter((c): c is SpecialCard => !!c) : [];
  if (decided(v.id) || v.y < S.xFrom) return [];
  const on = candidates(v);
  return pickX(on.find(c => !c.also), on.filter(c => c.also));
}
/** Biến cố của sự kiện v còn chờ quyết (biến cố đầu tiên chưa quyết), hay biến cố đầu tiên nếu đã quyết hết; undefined
    nếu sự kiện không có biến cố nào. */
export function specialFor(v: HistEvent): SpecialCard | undefined {
  const l = specialsFor(v);
  return l.find(c => !specialDecided(c)) || l[0];
}
/** Sự kiện của lựa chọn mà biến cố hệ quả nhắc lại (sự kiện sớm nhất mang dấu `after` đã chốt), cho dòng "hệ quả việc năm…". */
export function causeOf(c: SpecialCard, v: HistEvent): HistEvent | undefined {
  return (c.when.after || []).map(m => markedAt(m, v)).filter((e): e is HistEvent => !!e).sort((a, b) => a.y - b.y)[0];
}
/** Thẻ không bắt buộc đã đi qua (trước năm y) mà còn bỏ ngỏ: chốt "không có biến cố riêng" (S.xs = ''). Gọi khi đổi
    họ (Khai họ Nguyễn, lý lịch theo họ mẹ: biến cố của họ mới không "mọc" trên sự kiện cũ rồi kéo dòng thời gian lùi
    lại) và khi tải bản lưu (bản lưu có trước một biến cố mới, như x-nguyen25 trên tn25). */
export function lockPassed(y: number): void {
  if (!isPlay()) return;
  let n = 0;
  for (const v of EV) if (v.y < y && !(v.id in S.xs) && cardOf(v) && !decided(v.id) && !mustDecide(v)) { S.xs[v.id] = ''; n++; }
  if (n) save();
}
export const specialDecided = (c: SpecialCard) => 'x:' + c.id in S.cards;
export function decideSpecial(c: SpecialCard, i: number, y: number, newName?: string): Fx {
  S.cards['x:' + c.id] = i;
  const ch = c.choices[i], got = applyFx(payFx(ch[2]).fx);
  // 'origin': nhận lại họ trước lần đổi họ đầu tiên (gia phả, S.names)
  const to = ch[4] === 'origin' ? S.names[0]?.from : newName || ch[4];
  if (to) { renameFamily(asFamily(to), y, c.title); lockPassed(y + 1); } // sự kiện tới năm đổi họ: không mọc biến cố của họ mới
  save();
  return got;
}
/** Sự kiện còn cần dòng họ quyết định: thẻ thường chưa quyết, hay một biến cố của nó chưa quyết. */
export function needsDecision(v: HistEvent): boolean {
  if (closed()) return false; // hồ sơ đã khép: không còn gì phải quyết
  if (cardOf(v) && !decided(v.id)) return true;
  return specialsFor(v).some(c => !specialDecided(c));
}

/** Điểm rẽ 6 (năm 1976) với nhà đã di tản năm 1975: cùng id (kết cục, quan hệ, nhãn Hợp / Trái đọc như cũ), lời nói từ
    xứ người. Nhà chọn hướng ở trong nước rồi mới ra đi (1979, 1980): hướng giữ nguyên, nhưng trang nhật ký của hướng ấy đề
    năm sau năm ra đi (sổ gạo, ruộng khoán ở quê, ngày vào WTO) không còn là chuyện của nhà; hướng Ra đi bỏ trang đêm ra
    khơi năm 1979, vì thẻ rời nước đã kể chuyến đi thật của nhà (như nhà di tản). */
const GATE6 = ERAS[ERAS.length - 1].cy;
export const abroadOpt = (o: Option): Option => {
  const x = ABROAD6[o.id];
  if (!x || !isPlay()) return o;
  if (abroad(GATE6)) return { ...o, ...x };
  const g = GONE.find(f => hasFlag([f]));
  // chọn Ra đi mà người con còn ở mặt trận Campuchia: cả nhà chỉ đi sau năm 1989, không có đêm ra khơi năm 1979
  if (!g) return o.id === 'radi' && atFront() ? { ...o, diary: x.diary } : o;
  return { ...o, diary: o.id === 'radi' ? x.diary : o.diary.filter(d => d.y <= GONE_AT[g].y) };
};
optView.of = abroadOpt;

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
  // Cần Vương, Đông Du → đấu tranh vũ trang (Nguyễn Ái Quốc, Nguyễn Thái Học); Duy Tân → Quốc dân đảng, lập hiến
  canvuong: ['cs', 'qdd'], dongdu: ['cs', 'qdd'], duytan: ['qdd', 'laphien'],
  cs: ['vm'], qdd: ['qg'], laphien: ['qg', 'tl'],
  vm: ['bac'], qg: ['nam'], tl: ['thuba'],
  bac: ['baocap', 'doimoi'], nam: ['radi', 'doimoi'], thuba: ['doimoi'],
};
export const continues = (prev: string | undefined, next: string) => !!prev && (NEXT[prev] || []).includes(next);
/** Đường mỗi hướng theo, đọc qua quan hệ: [thế lực, +1 thân / −1 chống]. Phong trào (Đông Du, Quốc dân đảng) không có
    thế lực riêng nên đọc qua việc chống Pháp; Cần Vương chống Pháp (sau 1888 triều đình về tay bảo hộ, nên không đọc
    qua Triều đình: ra thú cũng làm Triều đình hài lòng); Duy Tân, trung lập, thứ ba đọc qua làng xóm. */
// Chủ hoà đọc qua cả triều đình lẫn Pháp: hướng này giữ hoà với cả hai (ERA_FX hoa tăng cả tr lẫn ph).
const ALIGN: Record<string, [keyof Rel, 1 | -1][]> = {
  chien: [['tr', 1], ['ph', -1]], canhtan: [['tr', 1]], hoa: [['tr', 1], ['ph', 1]],
  canvuong: [['ph', -1]], dongdu: [['ph', -1]], duytan: [['lg', 1]],
  cs: [['vm', 1]], qdd: [['ph', -1]], laphien: [['ph', 1]],
  vm: [['vm', 1]], qg: [['qg', 1]], tl: [['lg', 1]],
  bac: [['vm', 1]], nam: [['qg', 1]], thuba: [['lg', 1]],
  baocap: [['nn', 1]], doimoi: [['nn', 1]], radi: [['my', 1]],
};
/** Dòng họ đứng vững thế nào trên đường mình theo (0–100), theo đúng các quan hệ ALIGN: thân với phe mình, xa phe đối lập. */
export function standing(id: string): number {
  const refs = ALIGN[id] || [];
  return refs.length ? Math.round(refs.reduce((a, [k, sg]) => a + (sg > 0 ? S.rel[k] : 100 - S.rel[k]), 0) / refs.length) : 0;
}
/** Vài lựa chọn mà đọc qua quan hệ thì sai nghĩa của hướng (khoá alKey: 'thẻ:chỉ số', bộ thay thế 'thẻ@k:chỉ số'):
    ra làm lý trưởng dưới bảo hộ là đúng lối chủ hoà, từ quan thì không; "Đứng ngoài" buôn bán với cả hai, ở lại vùng xôi
    đậu mới là đường của mình; giữ kế hoạch hoá thì mở hiệu buôn tư nhân năm 1986 là rẽ khỏi đường ấy. */
const ALIGN_OVR: Record<string, Partial<Record<string, -1 | 0 | 1>>> = {
  'pt84:0': { hoa: 1 }, 'pt84:1': { hoa: -1 },
  'ng45:2': { tl: -1 }, 'el49:2': { tl: 1 }, 'tk46:1': { tl: 1 },
  'dm86:0': { baocap: -1, doimoi: 1 },
  // 30.4.1975 với nhà theo miền Nam: di tản theo chính quyền cũ, hay ở lại trình diện như những người đã làm việc cho
  // chính quyền ấy, đều là đi tiếp đường của mình (đón quân giải phóng thì không)
  'sg75:1': { nam: 1 },
  // nhà đã chọn Ra đi: người con sang mặt trận Campuchia thì cả nhà không đi được tới năm 1989 (barred)
  'cp79:0': { radi: -1 },
};
/** Đứng ngoài, thành phần thứ ba: không theo phe nào, nên lựa chọn ngả hẳn về một phe (tổng thay đổi quan hệ với các
    phe từ 15 trở lên) là trái đường, dù làng xóm có vui. */
const PARTISAN: (keyof Rel)[] = ['vm', 'qg', 'ph', 'nh', 'my'];
/** Lựa chọn trên thẻ hợp (1) hay trái (-1) với đường dòng họ đang theo; 0 khi không liên quan hay khi hai chiều triệt nhau.
    `key` (alKey): lựa chọn có nghĩa riêng ghi trong ALIGN_OVR. */
export function alignment(fx: Fx, y: number, key?: string): -1 | 0 | 1 {
  const pk = curPick(y), refs = pk ? ALIGN[pk.id] : undefined;
  if (!pk || !refs) return 0;
  const o = key ? ALIGN_OVR[key]?.[pk.id] : undefined;
  if (o !== undefined) return o;
  if ((pk.id === 'tl' || pk.id === 'thuba') && PARTISAN.reduce((a, k) => a + Math.abs(fx[k] || 0), 0) >= 15) return -1;
  const n = refs.reduce((a, [k, sg]) => a + sg * Math.sign(fx[k] || 0), 0);
  return n > 0 ? 1 : n < 0 ? -1 : 0;
}

/* ---------- mùa màng mỗi thế hệ ---------- */
/** `lines`: các khoản danh nghĩa; `total`: phần đổi thực sau khi chặn ở 0 và 100. */
/** `ry`: năm giữa thế hệ, năm xét bên cai quản quê (dòng "Bên cai quản"; ⌂ trên bảng mùa màng theo cùng năm này). */
/** `top`: việc lớn nhất thế hệ ấy đã quyết (năm · lựa chọn), mở đầu bảng mùa màng: mỗi đời một khác. */
export interface Harvest { lines: [string, Fx][]; total: Fx; ry: number; top?: string }
/** Mùa màng của thế hệ vừa sống qua (`lived`), tính vào năm `y` nó khép lại; một lần mỗi thế hệ.
    Phụ thuộc bên cai quản quê nhà và làng xóm nghĩ gì về dòng họ. */
export function harvest(lived: Era, y: number): Harvest | null {
  if (!isPlay() || S.harvests.includes(lived.id)) return null;
  // bên cai quản quê trong thế hệ vừa sống (giữa thế hệ), không phải bên vừa tới lúc nó khép lại
  const ry = Math.round((lived.cy + y) / 2), r = ruler(ry), rv = r ? S.rel[r] : 45, lg = S.rel.lg;
  // phe dòng họ theo (nếu không phải bên cai quản): được che chở, có người, có tiếng — trung thành không thành gánh nặng
  // đường dòng họ theo, đo bằng chính cách đọc của nhãn Hợp/Trái (ALIGN): Cần Vương, Đông Du, Quốc dân đảng là chống Pháp
  // (không phải lòng tin của triều đình bảo hộ); đường chỉ đọc qua làng xóm đã có dòng "Làng xóm"; bên cai quản mà là
  // phe mình thì đã được trả ở dòng cai quản
  const pk = curPick(lived.cy), refs = pk ? ALIGN[pk.id] || [] : [];
  const onlyLg = refs.every(([k]) => k === 'lg'), rulesForUs = !!r && refs.some(([k, sg]) => k === r && sg > 0);
  // đời này chọn một đường ở trong nước (giữ kế hoạch hoá, Đổi Mới) rồi cả nhà ra đi giữa đời (1979, 1980): không còn
  // "người cùng đường góp gạo, góp tiền" cho một đường nhà đã rời; nhà di tản năm 1975 thấy hướng nói từ xứ người
  // (ABROAD6), nhà chọn Ra đi thì đã đi đúng đường mình
  const leftPath = !!pk && pk.id !== 'radi' && abroad(ry) && !abroad(lived.cy);
  const st = pk && refs.length && !onlyLg && !rulesForUs && !leftPath ? standing(pk.id) : 0;
  // Thu nhập cố định; chi phí tăng theo quy mô (họ càng đông càng tốn gạo, càng giàu càng nặng thuế, danh tiếng phai dần):
  // không chọn gì cũng không thể giàu mãi, và không có tài nguyên nào kẹt ở mức trần.
  const { g, d, b, u } = S.res;
  const lines: [string, Fx][] = [
    ['Ruộng đất của họ', { g: 14, d: 7, b: 5 }],
    ['Nuôi người trong họ', { g: -Math.round(d / 6 + (g * g) / 500) }],
    ['Thuế và sưu dịch', { b: -Math.round((b * b) / 350) }],
    ['Danh tiếng phai theo thời gian', { u: -Math.max(4, Math.round((u * u) / 700)) }],
  ];
  const pl = placeAt(ry); // sau 1954: nơi dòng họ thật sự sống (di cư, tập kết)
  // ở xứ người: không ai "cai quản" nhà, nhưng làm ăn, giấy tờ nơi ở mới vẫn tuỳ quan hệ với Mỹ và phương Tây (số đọc
  // từ quan hệ 'my'); lời không gọi tên nước nào, vì nhà có thể ở Canada, Anh, Úc, Pháp…
  if (r) lines.push([abroad(ry) ? `Nơi ở mới ở xứ người · quan hệ với nước sở tại: ${relLabel(rv).toLowerCase()}` : `Bên cai quản ${pl.moved ? `nơi ở mới (${pl.name})` : pl.name}: ${POWERS[r][0]} · ${relLabel(rv).toLowerCase()}`, { g: Math.round((rv - 50) / 5), b: Math.round((rv - 50) / 8), u: rv >= 75 ? 3 : rv < 25 ? -4 : 0 }]);
  else lines.push(['Vùng tranh chấp', { g: -6, d: -2 }]);
  if (pk && st >= 55) lines.push([`Đường bạn theo: ${pk.label} · ${st >= 75 ? 'son sắt' : 'vững vàng'}`, { g: Math.round((st - 40) / 6), d: 2, b: st >= 75 ? 3 : 2, u: st >= 75 ? 4 : 2 }]); // người cùng đường góp gạo, góp tiền
  else if (pk && onlyLg && refs.length && CAMP[pk.id] === 'pt' && lg >= 55) lines.push(['Anh em trong phong trào', { d: 2, u: 3 }]);
  lines.push([`Làng xóm · ${relLabel(lg).toLowerCase()}`, { g: Math.round((lg - 50) / 8), u: Math.round((lg - 50) / 10) }]);
  if (d >= 60) lines.push(['Họ đông người', { g: 4, b: 4 }]);
  if (d < 20) lines.push(['Thiếu người làm', { g: -6 }]);
  // nhà còn bạc thì không để đói: bỏ bạc đong gạo (một ăn một, như trên thẻ)
  if (g < 12 && b >= 22) lines.push(['Bỏ bạc đong gạo', { g: 10, b: -10 }]);
  else if (g < 10) lines.push(['Đói kém', { d: -4, u: -3 }]);
  const total: Fx = {};
  const shown = lines.filter(([, fx]) => Object.values(fx).some(Boolean)); // bỏ dòng không đổi gì (vd. thuế khi không có bạc)
  for (const [, fx] of shown) for (const [k, n] of Object.entries(fx) as [keyof Fx, number][]) total[k] = (total[k] || 0) + n;
  const got = applyFx(total); // phần đổi thực (đã chặn ở 0 và 100)
  S.harvests.push(lived.id);
  S.snap[lived.id] = { ...S.res }; // gia sản sau mỗi đời: kết cục nói đời nào gây dựng, đời nào mất mát
  save();
  const top = bigChoices(lived, 1)[0];
  return { lines: shown, total: got, ry, top: top ? `${top.y} · ${top.label}` : undefined };
}

/* ---------- kết cục ---------- */
/** Hạng gia sản so với các dòng họ CÙNG QUÊ trong mô phỏng (scripts/sim-endings.ts), sau đời vừa gặt gần nhất: thu
    nhập mùa màng khác hẳn giữa các vùng, nên một ngưỡng chung cho cả nước chỉ thưởng cho quê miền Bắc. Bậc: P92 Vọng tộc,
    P60 khá giả, P25 thường dân, P5 sa sút, thấp hơn nữa "Còn lại tên họ"; "ly tán" khi còn chưa tới 15 người. */
export function rank(): [string, string] {
  const { g, d, b, u } = S.res, s = g + d + b + u, n = S.harvests.length, t = tiersNow();
  if (d < 15) return ['Dòng họ ly tán', 'Người còn lại quá ít; gia phả dừng ở thế hệ này.'];
  if (!n || !t) return ['Thường dân', 'Chưa qua mùa màng nào; gia sản như mọi dòng họ lúc khởi đầu.'];
  const k = n >= 6 ? 'qua sáu thế hệ' : `sau ${n} thế hệ`;
  if (s >= t[3]) return ['Vọng tộc', `Giàu có, đông đúc và được kính trọng ${k}: nhóm 8% khá nhất cùng quê trong mô phỏng.`];
  if (s >= t[2]) return ['Gia đình khá giả', 'Giữ được ruộng, giữ được người, có tiếng trong vùng.'];
  if (s >= t[1]) return ['Thường dân', 'Qua được mọi cơn bão, không giàu, không mất gốc.'];
  if (s > t[0]) return ['Nhà sa sút', 'Chiến tranh và lựa chọn lấy đi nhiều; nhà còn người, còn ruộng, nhưng kém xưa.'];
  // nói đúng số trên sổ: họ còn đông người thì cái thiếu là lúa gạo, bạc, uy tín (phần cạn nhất), không phải người
  const RN: [number, string][] = [[g, 'lúa gạo'], [b, 'bạc'], [u, 'uy tín']], dry = RN.filter(x => x[0] <= 25);
  const low = (dry.length ? dry : RN.sort((x, y) => x[0] - y[0]).slice(0, 2)).map(x => x[1]);
  const lowT = `${low.length > 1 ? low.slice(0, -1).join(', ') + ' và ' + low[low.length - 1] : low[0]} ${dry.length ? 'gần cạn' : 'xuống thấp'}`;
  return ['Còn lại tên họ', `Nhóm 5% sa sút nhất cùng quê trong mô phỏng: ${lowT}${d >= 40 ? `, dù trong họ vẫn còn ${d} nhân đinh` : d >= 25 ? '' : ', người cũng còn ít'}; tên họ thì vẫn giữ được.`];
}

/** Bậc gia sản để xếp hạng lúc này: hồ sơ mở lại từ Sổ kết cục dùng bậc đã đóng dấu; hồ sơ đã khép (S.endFix) dùng
    ngưỡng đời thứ sáu như lúc kết cục được đọc lần đầu; còn lại theo bảng hôm nay. */
export const tiersNow = (): number[] | undefined => {
  const n = S.harvests.length;
  return viewing()?.tiers ?? ((n >= 6 && S.endFix?.t) || tiersOf(S.home, n));
};

/** Dữ kiện cho kết cục (data/endings.ts): sáu hướng, quê, gia sản, gia sản sau từng mùa màng, các lần đổi họ và cờ
    trên các lựa chọn đã quyết (thẻ sự kiện, biến cố riêng). */
export function factsFromState(): Facts {
  const flags = new Set<Flag>();
  for (const v of EV) if (!v.diary && decided(v.id)) { const f = cardOf(v)?.[2][S.cards[v.id]]?.[4]; if (f) flags.add(f); }
  for (const c of SPECIAL) { const i = S.cards['x:' + c.id]; const f = i != null ? c.choices[i]?.[5] : undefined; if (f) flags.add(f); }
  const play = isPlay(), h = home();
  return {
    mode: play ? 'play' : 'read', name: familyName(), picks: ERAS.map(e => S.picks[e.id] || ''),
    home: play ? { id: h[0], name: h[1], region: h[3] } : undefined,
    res: play ? { ...S.res } : undefined, snap: play ? ERAS.map(e => S.snap[e.id]).filter((r): r is Res => !!r) : undefined,
    renames: play ? S.names.map(n => ({ ...n })) : [], flags, th: play ? viewing()?.th ?? frozenTh() ?? thOf(S.home) : undefined,
    ...(play && atFront() ? { front: true } : {}),
  };
}
/** Ngưỡng P5, P92 đã ghi khi kết cục được đọc lần đầu (S.endFix), hay undefined. */
const frozenTh = (): { lo: number; hi: number } | undefined => { const t = S.endFix?.t; return t ? { lo: t[0], hi: t[3] } : undefined; };
/** Kết cục của dòng họ lúc này: null khi còn điểm rẽ bỏ ngỏ (Đọc sử cho xem kết luận khi chưa chọn đủ). Hồ sơ mở lại
    từ Sổ kết cục (state.ts viewing): kết cục và tên đã đóng dấu lúc khép, không xét lại theo luật và bảng hôm nay. Hồ sơ
    đã khép (S.endFix, ghi ở lần đầu mở màn kết: ending.ts openEnd) giữ kết cục đã đọc, kể cả khi bảng ngưỡng gia sản sinh lại. */
export function endingNow(): { f: Facts; e: Ending | null; title: string } {
  const f = factsFromState(), v = viewing(), done = complete(f), seen = v && ENDINGS.find(x => x.id === v.end);
  const kept = seen || (done && S.endFix?.id ? ENDINGS.find(x => x.id === S.endFix!.id && (!x.play || f.mode === 'play')) : undefined);
  const e = kept || (done ? endingOf(f) : null);
  return { f, e, title: seen ? v.title || titleOf(seen, f) : e ? titleOf(e, f) : '' };
}
/** Ghi kết cục vừa đọc lần đầu (id, ngưỡng gia sản đời thứ sáu): mở lại về sau đọc đúng kết cục ấy (S.endFix). */
export function keepEnding(e: Ending): void {
  if (S.endFix?.id) return;
  const t = isPlay() ? S.endFix?.t || tiersOf(S.home, 6) : undefined;
  S.endFix = { id: e.id, ...(t ? { t: [...t] } : {}) };
}

/** Việc dòng họ đã quyết trong chương `e` (thẻ sự kiện và biến cố riêng), việc lớn trước: biến cố riêng, lựa chọn có cờ
    (di cư, tập kết, vượt biên…), rồi lựa chọn đổi gia sản nhiều nhất. Cho gia phả và phim hành trình ở kết cục. */
export function bigChoices(e: Era, n = 2): { y: number; label: string; out: string }[] {
  const xs: { y: number; o: number; label: string; out: string; w: number }[] = [];
  const mag = (fx: Fx) => RES.reduce((a, [k]) => a + Math.abs(fx[k] || 0), 0);
  // cả nhà rời nước (cờ GONE) đứng trên cả biến cố riêng: phim và gia phả của đời ấy mở bằng chuyến đi, không bằng một
  // việc quyết trước đó mà kết cục còn kể chuyện ở quê
  const w0 = (fl: Flag | undefined, base: number) => (fl && GONE.includes(fl) ? 3000 : base);
  // `o`: thứ tự quyết trong năm: thẻ sự kiện trước, biến cố riêng gắn vào nó ngay sau
  for (const { v, ch } of choicesIn(0, 0, e)) xs.push({ y: v.y, o: EV.indexOf(v), label: ch[0], out: ch[3], w: w0(ch[4], ch[4] ? 1000 : 0) + mag(ch[2]) });
  for (const c of SPECIAL) {
    const i = S.cards['x:' + c.id], v = EV.find(x => x.id === c.ev), ch = i != null ? c.choices[i] : undefined;
    if (ch && v && evEra(v) === e) xs.push({ y: v.y, o: EV.indexOf(v) + 0.5, label: ch[0], out: ch[3], w: w0(ch[5], c.minor && !ch[4] ? 0 : 2000) + mag(ch[2]) });
  }
  return xs.sort((a, b) => b.w - a.w).slice(0, n).sort((a, b) => a.y - b.y || a.o - b.o).map(({ y, label, out }) => ({ y, label, out }));
}

export const decidedCount = () => Object.keys(S.cards).length;
export const allPicked = () => ERAS.every(e => !!S.picks[e.id]);
/** Chi phí tài nguyên của một lựa chọn (chỉ phần âm), để tìm lựa chọn rẻ nhất khi không đủ cho mọi lựa chọn. */
export const cost = (fx: Fx) => RES.reduce((n, [k]) => n + Math.max(0, -(fx[k] || 0)), 0);
