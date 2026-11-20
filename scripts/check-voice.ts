// Kiểm tra bản thu thuyết minh: mọi lời ứng dụng có thể đọc đều có src/voice/<khoá>.m4a, mọi câu đã cá nhân hoá (theo
// quê, nhà ở xứ người, tên kết cục) đều tra ra một bản thu đọc đúng nguyên văn, và kịch bản docs/voice/kich-ban.csv khớp
// với chữ hiện tại của trò chơi. Chạy: npm run voice:check [-- --durations] (thêm đo độ dài từng bản thu bằng ffprobe).
// Thiếu bản thu: npm run voice:script, npm run voice:tts, npm run voice (README, phần Sound).
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { ERAS } from '../src/data';
import { HOMES } from '../src/play';
import { CHRONICLE } from '../src/data/surnames';
import { ABROAD6, ENDINGS, FLAGS, chronLine, endingOf, pathF, type Facts, type Flag } from '../src/data/endings';
import { endKey, endSpeech, outSpeech } from '../src/speech';
import { outText } from '../src/regional';
import { chronKey, outVoiceKey, repFacts } from '../src/voiced';
import { voiceRows } from './voice-lines';

const rows = voiceRows(), byKey = new Map(rows.map(r => [r.key, r]));
const errors: string[] = [], warns: string[] = [];
const clip = (k: string) => `src/voice/${k}.m4a`;

// 1. mọi lời có bản thu
for (const r of rows) if (!existsSync(clip(r.key))) errors.push(`thiếu bản thu ${clip(r.key)}: “${r.text}”`);
// bản thu không còn lời nào dùng (chiếm chỗ trong bộ nhớ đệm ngoại tuyến)
for (const f of readdirSync('src/voice').filter(f => f.endsWith('.m4a'))) if (!byKey.has(f.slice(0, -4))) warns.push(`bản thu không còn dùng: src/voice/${f}`);

// 2. câu đã cá nhân hoá: mỗi câu trò chơi có thể hiện phải tra ra một bản thu đọc đúng nguyên văn
const voiced = (key: string | undefined, text: string) => !!key && byKey.get(key)?.text === text;
const OPTS = ERAS.flatMap(e => e.opts);
const flagSets: Flag[][] = [[], ...FLAGS.map(f => [f])];
const miss = new Map<string, string>();
for (const o of OPTS) for (const h of [...HOMES, null]) for (const fl of flagSets) {
  const f: Facts = h ? repFacts(h, fl) : { mode: 'read', name: 'Họ Nguyễn', picks: [], renames: [], flags: new Set(fl) };
  const t = chronLine(o.id, f, CHRONICLE);
  if (!voiced(chronKey(o.id, t), t) && !miss.has(t)) miss.set(t, `dòng gia phả "${o.id}" (${h ? h[1] : 'Đọc sử'}${fl.length ? ', ' + fl.join(', ') : ''})`);
}
for (const o of OPTS) for (const x of [o, ...(ABROAD6[o.id] ? [{ ...o, ...ABROAD6[o.id] }] : [])]) for (const h of HOMES) {
  const t = outText(x, h);
  if (!voiced(outVoiceKey(o.id, t), outSpeech(t)) && !miss.has(t)) miss.set(t, `kết cục ở điểm rẽ "${o.id}" (${h[1]})`);
}
const walk = (i: number, acc: string[]): string[][] => (i === ERAS.length ? [acc] : ERAS[i].opts.flatMap(o => walk(i + 1, [...acc, o.id])));
for (const picks of walk(0, [])) for (const mode of ['read', 'play'] as const) {
  const f: Facts = { mode, name: 'Họ Nguyễn', picks, renames: [], flags: new Set() };
  for (const e of mode === 'read' ? [endingOf(f)] : ENDINGS.filter(e => e.test(f, pathF(picks)))) {
    const t = endSpeech(e, f);
    if (!voiced(endKey(e, f), t) && !miss.has(t)) miss.set(t, `kết cục "${e.id}"`);
  }
}
for (const [t, where] of miss) errors.push(`câu chưa có bản thu (thêm vào src/voiced.ts hoặc scripts/voice-lines.ts): ${where}: “${t}”`);

// 3. kịch bản đã ghi khớp với chữ hiện tại (bản thu được dựng từ kịch bản này)
const csv = existsSync('docs/voice/kich-ban.csv') ? readFileSync('docs/voice/kich-ban.csv', 'utf8') : '';
const cells = (line: string) => [...line.matchAll(/("(?:[^"]|"")*"|[^,]*)(?:,|$)/g)].map(m => m[1].replace(/^"|"$/g, '').replace(/""/g, '"'));
const script = new Map(csv.split('\n').slice(1).filter(Boolean).map(l => { const c = cells(l); return [c[1], c[4]] as [string, string]; }));
for (const r of rows) if (script.get(r.key) !== r.text) errors.push(`docs/voice/kich-ban.csv cũ cho ${r.key} (chạy npm run voice:script, rồi thu lại bản này)`);

// 4. (tuỳ chọn) độ dài: bản thu quá ngắn hay quá dài so với số chữ thì có thể đọc sai, đọc sót hay lặp
if (process.argv.includes('--durations')) {
  for (const r of rows) {
    if (!existsSync(clip(r.key))) continue;
    const sec = +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', clip(r.key)]).toString().trim();
    const cps = r.text.length / sec;
    if (cps < 8.5 || cps > 23) errors.push(`độ dài lạ: ${r.key} ${sec.toFixed(1)} s cho ${r.text.length} ký tự (${cps.toFixed(1)} ký tự/giây)`);
  }
}

for (const w of warns) console.warn('· ' + w);
for (const e of errors) console.error('✗ ' + e);
console.log(`${rows.length} lời thuyết minh, ${rows.length - rows.filter(r => !existsSync(clip(r.key))).length} có bản thu; ${errors.length} lỗi, ${warns.length} lưu ý`);
if (errors.length) process.exit(1);
