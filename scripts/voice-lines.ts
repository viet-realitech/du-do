// Mọi lời thuyết minh ứng dụng có thể đọc, mỗi lời một khoá (tên bản thu src/voice/<khoá>.m4a). Kịch bản thu giọng
// (voice-script.ts) và kiểm tra bản thu (check-voice.ts) dùng chung danh sách này.
import { ERAS, EV, DIARY_R, type HistEvent } from '../src/data';
import { evKey, evSpeechFull, gateKey, gateSpeech, chrKey, epiKey, outKey, outSpeech, endKey, endSpeech, UI_LINES } from '../src/speech';
import { CHRONICLE, EPILOGUES, SURNAMES } from '../src/data/surnames';
import { ENDINGS, ABROAD6, pathF, type Facts } from '../src/data/endings';
import { chronVariants, outVariants } from '../src/voiced';

/** `ch`: chương 1–6; 7 = kết cục và phim hành trình; 0 = màn Cài đặt. */
export type Row = { key: string; ch: number; ctx: string; text: string };

/** Sáu hướng ở mọi điểm rẽ: 729 con đường (Đọc sử), để gom đủ các tên kết cục đổi theo con đường. */
function paths(): string[][] {
  const out: string[][] = [];
  const walk = (i: number, acc: string[]) => { if (i === ERAS.length) { out.push(acc); return; } for (const o of ERAS[i].opts) walk(i + 1, [...acc, o.id]); };
  walk(0, []);
  return out;
}

export function voiceRows(): Row[] {
  const rows: Row[] = [];
  const page = (ch: number, why: string, v: HistEvent) => rows.push({ key: evKey(v), ch, ctx: `${why} · ${v.y}`, text: evSpeechFull(v) });
  const outs = outVariants();
  for (const e of ERAS) {
    rows.push({ key: gateKey(e), ch: e.n, ctx: `Điểm rẽ ${e.n} (${e.cy}), đọc khi người chơi đứng trước lựa chọn`, text: gateSpeech(e) });
    for (const o of e.opts) rows.push({ key: outKey(o.id), ch: e.n, ctx: `Điểm rẽ ${e.n} · kết cục của hướng "${o.label}" (màn Con đường của bạn)`, text: outSpeech(o.out) });
    // kết cục theo quê (Trò chơi), của nhà đã di tản
    for (const r of outs) if (e.opts.some(o => r.key.startsWith(`out-${o.id}-`) || r.key === 'out-x' + o.id)) rows.push({ ...r, ch: e.n });
    const evs: HistEvent[] = EV.filter(v => (v.era ? v.era === e.id : v.y >= e.cy && (!ERAS[e.n] || v.y < ERAS[e.n].cy)));
    for (const v of evs) rows.push({ key: evKey(v), ch: e.n, ctx: `${v.k} · ${v.d}`, text: evSpeechFull(v) });
    for (const o of e.opts) for (const v of o.diary) {
      page(e.n, `Nhật ký dòng họ, nếu chọn "${o.label}"`, v);
      // trang đời thường ở nhà theo miền (Trò chơi)
      for (const [z, x] of Object.entries(DIARY_R[v.id] || {})) if (x) page(e.n, `Nhật ký dòng họ, nếu chọn "${o.label}", nhà ở miền ${z === 't' ? 'Trung' : 'Nam'}`, x);
    }
    for (const [id, x] of Object.entries(ABROAD6)) for (const v of x.diary) if (e.opts.some(o => o.id === id)) page(e.n, `Nhật ký dòng họ, nhà đã di tản, nếu chọn "${x.label}"`, v);
  }
  // Phim hành trình ở kết cục: dòng gia phả từng hướng (chung, theo quê, nhà ở xứ người), lời khép theo họ
  for (const [opt, line] of Object.entries(CHRONICLE)) rows.push({ key: chrKey(opt), ch: 7, ctx: `Phim hành trình · dòng gia phả của hướng "${opt}"`, text: line });
  for (const r of chronVariants()) rows.push({ ...r, ch: 7 });
  for (const [k, line] of Object.entries(EPILOGUES)) rows.push({ key: epiKey(k), ch: 7, ctx: `Phim hành trình · lời khép, họ ${SURNAMES.find(s => s.key === k)?.names.join(' / ') || k}`, text: line });
  // Kết cục: tên và câu tóm (màn kết, tấm cuối phim); tên đổi theo con đường thì mỗi tên một bản
  const facts = (picks: string[]): Facts => ({ mode: 'read', name: 'Họ Nguyễn', picks, renames: [], flags: new Set() });
  for (const e of ENDINGS) {
    const fs = e.name ? paths().map(facts).filter(f => e.test(f, pathF(f.picks))) : [facts([])];
    for (const f of fs) rows.push({ key: endKey(e, f), ch: 7, ctx: `Kết cục "${e.title}" · tên và câu tóm (màn kết, tấm cuối phim hành trình)`, text: endSpeech(e, f) });
  }
  for (const [key, text] of Object.entries(UI_LINES)) rows.push({ key, ch: 0, ctx: key === 'ui-rate' ? 'Cài đặt · nghe thử tốc độ đọc' : 'Cài đặt · bật giọng đọc', text });
  const seen = new Set<string>();
  return rows.filter(r => !seen.has(r.key) && !!seen.add(r.key));
}
