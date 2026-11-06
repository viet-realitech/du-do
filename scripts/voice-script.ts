// Writes the voice-over script (docs/voice/kich-ban.md + .csv) from the game data: one line per clip,
// keyed by the file name the recording must have. Run: npm run voice:script
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { ERAS, EV, type HistEvent } from '../src/data';
import { evKey, evSpeechFull, gateKey, gateSpeech, chrKey, linKey, epiKey } from '../src/speech';
import { CHRONICLE, ARCHETYPES, EPILOGUES, SURNAMES } from '../src/data/surnames';

type Row = { key: string; ch: number; ctx: string; text: string };
const rows: Row[] = [];
for (const e of ERAS) {
  rows.push({ key: gateKey(e), ch: e.n, ctx: `Điểm rẽ ${e.n} (${e.cy}), đọc khi người chơi đứng trước lựa chọn`, text: gateSpeech(e) });
  const evs: HistEvent[] = EV.filter(v => (v.era ? v.era === e.id : v.y >= e.cy && (!ERAS[e.n] || v.y < ERAS[e.n].cy)));
  for (const v of evs) rows.push({ key: evKey(v), ch: e.n, ctx: `${v.k} · ${v.d}`, text: evSpeechFull(v) });
  for (const o of e.opts) for (const v of o.diary) rows.push({ key: evKey(v), ch: e.n, ctx: `Nhật ký dòng họ, nếu chọn "${o.label}" · ${v.y}`, text: evSpeechFull(v) });
}
// Phim hành trình ở kết cục (chế độ Chơi): dòng gia phả từng hướng, dấu ấn dòng họ, lời khép theo họ
for (const [opt, line] of Object.entries(CHRONICLE)) rows.push({ key: chrKey(opt), ch: 7, ctx: `Phim hành trình · dòng gia phả của hướng "${opt}"`, text: line });
for (const a of ARCHETYPES) rows.push({ key: linKey(a.id), ch: 7, ctx: `Phim hành trình · dấu ấn dòng họ "${a.title}"`, text: `${a.title}. ${a.text}` });
for (const [k, line] of Object.entries(EPILOGUES)) rows.push({ key: epiKey(k), ch: 7, ctx: `Phim hành trình · lời khép, họ ${SURNAMES.find(s => s.key === k)?.names.join(' / ') || k}`, text: line });
const seen = new Set<string>();
const uniq = rows.filter(r => !seen.has(r.key) && seen.add(r.key));
const secs = (t: string) => Math.round(t.length / 13);
const total = uniq.reduce((n, r) => n + secs(r.text), 0);
const done = (k: string) => existsSync(`recordings/${k}.wav`) || existsSync(`recordings/${k}.mp3`);
const synth = (k: string) => !done(k) && existsSync(`tts-out/${k}.wav`);

mkdirSync('docs/voice', { recursive: true });
const csv = (s: string) => `"${s.replace(/"/g, '""')}"`;
writeFileSync('docs/voice/kich-ban.csv', '﻿STT,Tên file,Chương,Ngữ cảnh,Lời đọc,Ước tính (giây),Đã thu\n' +
  uniq.map((r, i) => [i + 1, r.key, r.ch, csv(r.ctx), csv(r.text), secs(r.text), done(r.key) ? 'x' : synth(r.key) ? 'máy' : ''].join(',')).join('\n') + '\n');

const md = [`# Dư Đồ · Kịch bản thu giọng thuyết minh`, '',
  `${uniq.length} đoạn, tổng khoảng ${Math.round(total / 60)} phút đọc. Người thật đã thu: ${uniq.filter(r => done(r.key)).length}/${uniq.length}; giọng máy VieNeu: ${uniq.filter(r => synth(r.key)).length}.`, '',
  '## Hướng dẫn thu', '',
  '- **Giọng**: nam, trầm, hùng tráng nhưng điềm tĩnh, như người dẫn phim tài liệu lịch sử. Không kịch hoá, không bình luận thêm.',
  '- **Nhịp**: chậm vừa (khoảng 13 ký tự/giây). Ngừng rõ sau mốc năm ("Năm 1858." … ), ngừng ngắn sau mỗi câu.',
  '- **Số liệu**: đọc "1.500" là "một nghìn năm trăm"; ngày "7.5.1954" là "ngày bảy tháng năm năm một nghìn chín trăm năm mươi tư".',
  '- **Kỹ thuật**: phòng yên tĩnh, không vang; WAV 48 kHz / 24-bit (hoặc MP3 ≥ 192 kbps), mono. Để 0,5 giây lặng ở đầu và cuối mỗi file (máy sẽ tự cắt).',
  '- **Tên file**: đúng cột "Tên file", ví dụ `gate-e1.wav`, `dn58.wav`. Chép vào thư mục `recordings/` rồi chạy `npm run voice`.',
  '- Đoạn nào chưa thu, ứng dụng dùng giọng tổng hợp VieNeu-TTS (`npm run voice:tts`), nên có thể thu và thay thế dần; bản thu người thật luôn được ưu tiên.', '',
  ...ERAS.flatMap(e => ['', `## Chương ${e.n} · ${e.title} (${e.cy})`, '',
    ...uniq.filter(r => r.ch === e.n).flatMap(r => [`### \`${r.key}\`${done(r.key) ? ' ✓ đã thu' : synth(r.key) ? ' · giọng máy' : ''}`, '', `*${r.ctx} · ~${secs(r.text)} giây*`, '', `> ${r.text}`, ''])]),
  '', '## Kết cục · Phim hành trình', '',
  ...uniq.filter(r => r.ch === 7).flatMap(r => [`### \`${r.key}\`${done(r.key) ? ' ✓ đã thu' : synth(r.key) ? ' · giọng máy' : ''}`, '', `*${r.ctx} · ~${secs(r.text)} giây*`, '', r.text, '']),
].join('\n');
writeFileSync('docs/voice/kich-ban.md', md);
console.log(`${uniq.length} clips, ~${Math.round(total / 60)} min → docs/voice/kich-ban.md, kich-ban.csv`);
