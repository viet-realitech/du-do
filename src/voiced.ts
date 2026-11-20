import { ERAS, type Option } from './data';
import { HOMES } from './play';
import { CHRONICLE } from './data/surnames';
import { ABROAD6, chronLine, type Facts, type Flag } from './data/endings';
import { chrKey, outKey, outSpeech } from './speech';
import { outText } from './regional';

/* Câu thuyết minh đã cá nhân hoá (theo quê, theo nhà đã ra nước ngoài) có bản thu riêng. Mỗi biến thể được dựng lại từ
   chính hàm sinh câu (chronLine, outText) với một dòng họ đại diện; lúc chơi, câu đang hiện được tra đúng nguyên văn
   trong bảng ấy. Vì vậy bản thu luôn đọc đúng chữ trên màn hình, và một câu mới chưa có bản thu thì phim chỉ hiện chữ
   chứ không đọc nhầm câu khác. scripts/check-voice.ts báo câu nào còn thiếu bản thu. */

export interface Line { key: string; text: string; ctx: string }
type Home = typeof HOMES[number];
const OPT = Object.fromEntries(ERAS.flatMap(e => e.opts.map(o => [o.id, o]))) as Record<string, Option>;
const isNorth = (h: Home) => h[3] === 'B' || h[3] === 'T1';
const SOUTH = HOMES.filter(h => !isNorth(h));
/** Dòng họ đại diện: quê `h`, các cờ `fl` (đủ cho chronLine). */
export const repFacts = (h: Home, fl: Flag[] = []): Facts =>
  ({ mode: 'play', name: 'Họ Nguyễn', picks: [], home: { id: h[0], name: h[1], region: h[3] }, renames: [], flags: new Set(fl) });
const H = (id: string) => HOMES.find(h => h[0] === id)!;

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
];
export function chronVariants(): Line[] {
  return CHRON_REP.map(([key, id, h, fl]) => ({ key, text: chronLine(id, repFacts(h, fl), CHRONICLE),
    ctx: `Phim hành trình · dòng gia phả của hướng "${OPT[id].label}", ${fl.includes('ditan') ? 'nhà đã di tản' : `quê ${h[1]}${fl.length ? ' · ' + fl.join(', ') : ''}`}` }));
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
/** Khoá bản thu của dòng gia phả `text` (chronLine) của hướng `id`; undefined nếu câu này chưa có bản thu. */
export function chronKey(id: string, text: string): string | undefined {
  if (text === CHRONICLE[id]) return chrKey(id);
  CHR ||= index(chronVariants(), l => l.text);
  return CHR.get(text);
}
/** Khoá bản thu của kết cục `out` (đã theo quê, hay nói từ xứ người) của hướng `id`; undefined nếu chưa có bản thu. */
export function outVoiceKey(id: string, out: string): string | undefined {
  if (out === OPT[id]?.out) return outKey(id);
  OUT ||= index(outVariants(), l => l.text);
  return OUT.get(outSpeech(out));
}
