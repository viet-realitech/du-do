import { ERAS, type Option } from './data';
import { HOMES } from './play';
import { CHRONICLE } from './data/surnames';
import { ABROAD6, chronLine, type Ending, type Facts, type Flag } from './data/endings';
import { chrKey, endKey, endSpeech, outKey, outSpeech } from './speech';
import { outText } from './regional';
import { sayKey } from './said';

/* Câu thuyết minh đã cá nhân hoá (theo quê, theo nhà đã ra nước ngoài) có bản thu riêng. Mỗi biến thể được dựng lại từ
   chính hàm sinh câu (chronLine, outText) với một dòng họ đại diện; lúc chơi, câu đang hiện được tra đúng nguyên văn
   trong bảng ấy, rồi đối với dấu của câu bản thu ấy đã đọc (said.ts). Vì vậy bản thu chỉ phát khi đọc đúng chữ trên màn
   hình: một câu mới, hay một câu đã sửa mà chưa thu lại, thì phim chỉ hiện chữ chứ không đọc nhầm câu khác.
   scripts/check-voice.ts báo câu nào còn thiếu bản thu và bản thu nào đọc câu cũ. */

export interface Line { key: string; text: string; ctx: string }
type Home = typeof HOMES[number];
const OPT = Object.fromEntries(ERAS.flatMap(e => e.opts.map(o => [o.id, o]))) as Record<string, Option>;
const isNorth = (h: Home) => h[3] === 'B' || h[3] === 'T1';
const SOUTH = HOMES.filter(h => !isNorth(h));
/** Dòng họ đại diện: quê `h`, các cờ `fl` (đủ cho chronLine); `front`: người con ở mặt trận Campuchia (Facts.front). */
export const repFacts = (h: Home, fl: Flag[] = [], front = false): Facts =>
  ({ mode: 'play', name: 'Họ Nguyễn', picks: [], home: { id: h[0], name: h[1], region: h[3] }, renames: [], flags: new Set(fl), ...(front ? { front } : {}) });
const H = (id: string) => HOMES.find(h => h[0] === id)!;

/** Cờ cả nhà rời nước sau năm 1976 (endings.ts GONE trừ di tản), có và không có nhánh đã đi trước năm 1978. */
const GONE_REP: Flag[][] = [['ly79Di'], ['vuotbien'], ['vuotbien', 'lylichDi'], ['odp'], ['odp', 'lylichDi']];
/** Dòng gia phả theo quê và theo nhà ở xứ người (phim hành trình): khoá, hướng, quê đại diện, cờ. Nhà tập kết từ phía nam
    vĩ tuyến 17 về lại quê năm 1975: mỗi quê một bản thu (câu gọi tên quê). */
const CHRON_REP: [string, string, Home, Flag[]][] = [
  ['chr-bac-n', 'bac', H('hn'), []],
  ['chr-bac-n-dicu', 'bac', H('hn'), ['dicu']],
  ...SOUTH.flatMap(h => [[`chr-bac-s-${h[0]}`, 'bac', h, []], [`chr-bac-s-${h[0]}-hen`, 'bac', h, ['nguoiDi54']]] as [string, string, Home, Flag[]][]),
  ['chr-nam-n', 'nam', H('hn'), []],
  ['chr-nam-s', 'nam', H('sg'), []],
  ['chr-thuba-n', 'thuba', H('hn'), []],
  ['chr-duytan-t', 'duytan', H('hue'), []],
  ['chr-duytan-s', 'duytan', H('sg'), []],
  ...Object.keys(ABROAD6).map(id => ['chr-x' + id, id, H('sg'), ['ditan']] as [string, string, Home, Flag[]]),
  // đời thứ sáu chọn hướng ở trong nước năm 1976 rồi cả nhà mới ra đi (endings.ts GEN6_GONE): câu không gọi tên quê, mỗi
  // cách đi một bản; nhà đã có một nhánh xuống ghe năm 1978 (lylichDi) thì cả nhà còn lại đi theo nhánh ấy
  ...Object.keys(ABROAD6).flatMap(id => GONE_REP.map(fl => [`chr-g-${id}-${fl.join('-').toLowerCase()}`, id, H('sg'), fl] as [string, string, Home, Flag[]])),
];
export function chronVariants(): Line[] {
  return [...CHRON_REP.map(([key, id, h, fl]) => ({ key, text: chronLine(id, repFacts(h, fl), CHRONICLE),
    ctx: `Phim hành trình · dòng gia phả của hướng "${OPT[id].label}", ${fl.includes('ditan') ? 'nhà đã di tản' : key.startsWith('chr-g-') ? `chọn ở trong nước rồi cả nhà ra đi (${fl.join(', ')})` : `quê ${h[1]}${fl.length ? ' · ' + fl.join(', ') : ''}`}` })),
    // chọn Ra đi mà người con còn ở mặt trận Campuchia (chỉ nhà Cần Thơ có thẻ cp79): đi sau năm 1989
    { key: 'chr-radi-front', text: chronLine('radi', repFacts(H('ct'), [], true), CHRONICLE), ctx: `Phim hành trình · dòng gia phả của hướng "${OPT.radi.label}", người con còn ở mặt trận Campuchia nên cả nhà đi sau năm 1989` }];
}

/** Kết cục ở điểm rẽ theo quê (outText) và của nhà đã di tản (ABROAD6): khoá theo quê khi câu đổi theo từng quê (gọi tên
    quê), không thì theo miền (n: Bắc, gồm Nghệ An; t: Huế, Quảng Nam; s: Nam Kỳ cũ). */
export function outVariants(): Line[] {
  const rows: Line[] = [], seen = new Set<string>();
  const zone = (h: Home) => (isNorth(h) ? 'n' : h[3] === 'T2' ? 't' : 's'), ZN = { n: 'miền Bắc', t: 'miền Trung', s: 'miền Nam' };
  for (const e of ERAS) for (const o of e.opts) for (const h of HOMES) {
    const t = outText(o, h);
    if (t === o.out || seen.has(t)) continue;
    seen.add(t);
    const each = HOMES.some(g => zone(g) === zone(h) && outText(o, g) !== t);
    rows.push({ key: `out-${o.id}-${each ? h[0] : zone(h)}`, text: outSpeech(t), ctx: `Điểm rẽ ${e.n} · kết cục của hướng "${o.label}" cho nhà ở ${each ? h[1] : ZN[zone(h)]}` });
  }
  for (const [id, x] of Object.entries(ABROAD6)) rows.push({ key: 'out-x' + id, text: outSpeech(x.out), ctx: `Điểm rẽ 6 · kết cục của hướng "${x.label}", nhà đã di tản tháng 4.1975` });
  return rows;
}

let CHR: Map<string, string> | null = null, OUT: Map<string, string> | null = null;
const index = (ls: Line[], raw: (l: Line) => string) => new Map(ls.map(l => [raw(l), l.key] as [string, string]).reverse());
/** Khoá trong kịch bản của dòng gia phả `text` (chronLine) của hướng `id`, chưa xét bản thu (check-voice). */
export function chronRow(id: string, text: string): string | undefined {
  if (text === CHRONICLE[id]) return chrKey(id);
  CHR ||= index(chronVariants(), l => l.text);
  return CHR.get(text);
}
/** Khoá bản thu của dòng gia phả `text` của hướng `id`; undefined nếu câu này chưa có bản thu đọc đúng nguyên văn. */
export const chronKey = (id: string, text: string): string | undefined => sayKey(chronRow(id, text), text);
/** Khoá trong kịch bản của kết cục `out` (đã theo quê, hay nói từ xứ người) của hướng `id`, chưa xét bản thu. */
export function outRow(id: string, out: string): string | undefined {
  if (out === OPT[id]?.out) return outKey(id);
  OUT ||= index(outVariants(), l => l.text);
  return OUT.get(outSpeech(out));
}
/** Khoá bản thu của kết cục `out` của hướng `id`; undefined nếu chưa có bản thu đọc đúng nguyên văn. */
export const outVoiceKey = (id: string, out: string): string | undefined => sayKey(outRow(id, out), outSpeech(out));
/** Khoá bản thu của tên kết cục và câu tóm (endSpeech); undefined nếu tên hay câu tóm đã đổi mà chưa thu lại. */
export const endVoiceKey = (e: Ending, f: Facts): string | undefined => sayKey(endKey(e, f), endSpeech(e, f));
