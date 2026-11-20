// Writes the voice-over script (docs/voice/kich-ban.md + .csv) from the game data: one line per clip,
// keyed by the file name the recording must have. Run: npm run voice:script
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { ERAS } from '../src/data';
import { voiceRows } from './voice-lines';

const uniq = voiceRows();
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
  '', '## Cài đặt', '',
  ...uniq.filter(r => r.ch === 0).flatMap(r => [`### \`${r.key}\`${done(r.key) ? ' ✓ đã thu' : synth(r.key) ? ' · giọng máy' : ''}`, '', `*${r.ctx} · ~${secs(r.text)} giây*`, '', r.text, '']),
].join('\n');
writeFileSync('docs/voice/kich-ban.md', md);
console.log(`${uniq.length} clips, ~${Math.round(total / 60)} min → docs/voice/kich-ban.md, kich-ban.csv`);
