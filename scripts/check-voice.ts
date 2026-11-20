// Kiểm tra bản thu thuyết minh: mọi lời ứng dụng có thể đọc đều có src/voice/<khoá>.m4a, mọi câu đã cá nhân hoá (theo
// quê, nhà ở xứ người, tên kết cục) đều tra ra một bản thu đọc đúng nguyên văn, kịch bản docs/voice/kich-ban.csv khớp
// với chữ hiện tại của trò chơi, và mỗi bản thu đọc đúng câu hiện tại (dấu trong src/voice/said.json, ghi lúc dựng bản
// thu): câu đã sửa mà chưa thu lại là lỗi, kể cả sau khi đã chạy voice:script.
// Chạy: npm run voice:check [-- --durations] (thêm đo độ dài từng bản thu bằng ffprobe).
// Thiếu bản thu: npm run voice:script, npm run voice:tts, npm run voice (README, phần Sound).
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { ERAS } from '../src/data';
import { HOMES } from '../src/play';
import { CHRONICLE } from '../src/data/surnames';
import { ABROAD6, ENDINGS, FLAGS, chronLine, endingOf, pathF, type Facts, type Flag } from '../src/data/endings';
import { endKey, endSpeech, outSpeech } from '../src/speech';
import { outText } from '../src/regional';
import { chronRow, outRow, repFacts, endVoiceKey } from '../src/voiced';
import { saidSig, textSig } from '../src/said';
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
// không cờ, từng cờ, và mọi cặp cờ: một câu có thể đọc hai cờ một lúc (nhà đã gửi một nhánh đi rồi cả nhà mới đi)
const flagSets: Flag[][] = [[], ...FLAGS.flatMap((f, i) => [[f], ...FLAGS.slice(i + 1).map(g => [f, g])])];
const miss = new Map<string, string>();
for (const o of OPTS) for (const h of [...HOMES, null]) for (const fl of flagSets) {
  const f: Facts = h ? repFacts(h, fl) : { mode: 'read', name: 'Họ Nguyễn', picks: [], renames: [], flags: new Set(fl) };
  const t = chronLine(o.id, f, CHRONICLE);
  if (!voiced(chronRow(o.id, t), t) && !miss.has(t)) miss.set(t, `dòng gia phả "${o.id}" (${h ? h[1] : 'Đọc sử'}${fl.length ? ', ' + fl.join(', ') : ''})`);
}
for (const o of OPTS) for (const x of [o, ...(ABROAD6[o.id] ? [{ ...o, ...ABROAD6[o.id] }] : [])]) for (const h of HOMES) {
  const t = outText(x, h);
  if (!voiced(outRow(o.id, t), outSpeech(t)) && !miss.has(t)) miss.set(t, `kết cục ở điểm rẽ "${o.id}" (${h[1]})`);
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

// 4. bản thu đọc đúng câu hiện tại: ứng dụng không phát bản thu có dấu khác câu trên màn (src/said.ts)
for (const r of rows) {
  if (!existsSync(clip(r.key))) continue;
  const s = saidSig(r.key);
  if (s !== textSig(r.text)) errors.push(`${s ? 'bản thu đọc câu cũ' : 'src/voice/said.json chưa ghi câu của bản thu'} ${clip(r.key)}: “${r.text}” (thu lại: npm run voice:script, npm run voice:tts -- --only ${r.key}, npm run voice)`);
}
// tự kiểm: câu tóm của một kết cục sửa sau khi thu thì ứng dụng không phát bản thu cũ
const f0: Facts = { mode: 'read', name: 'Họ Nguyễn', picks: [], renames: [], flags: new Set() }, e0 = ENDINGS.find(e => endVoiceKey(e, f0));
if (e0 && endVoiceKey({ ...e0, line: e0.line.replace(/\.$/, ' nữa.') }, f0)) errors.push('src/said.ts: ứng dụng vẫn phát bản thu kết cục khi câu tóm đã đổi');

// 5. chỗ trong bộ nhớ đệm ngoại tuyến (vite.config.ts runtimeCaching): lời kể (/assets/*.m4a) và nhạc (/music/*.m4a) mỗi
// thứ một bộ nhớ đệm, đủ chỗ cho mọi tệp (đầy thì service worker lặng lẽ bỏ tệp cũ nhất: lời kể, nhạc câm khi mất mạng);
// hai luật không bắt nhầm tệp của nhau; mỗi bài nhạc trong src/music.json có tệp, không có tệp nhạc thừa
{
  const cfg = readFileSync('vite.config.ts', 'utf8');
  const rules = [...cfg.matchAll(/urlPattern:\s*\/(.*)\/([a-z]*),\s*\n[\s\S]*?cacheName:\s*'([^']+)'[\s\S]*?maxEntries:\s*(\d+)/g)].map(m => ({ re: new RegExp(m[1], m[2]), name: m[3], max: +m[4] }));
  const clips = readdirSync('src/voice').filter(f => f.endsWith('.m4a')).length;
  const music = JSON.parse(readFileSync('src/music.json', 'utf8')) as { tracks: Record<string, { file: string }> };
  const files = Object.values(music.tracks).map(t => t.file), onDisk = readdirSync('public/music').filter(f => f.endsWith('.m4a'));
  for (const f of files) if (!onDisk.includes(f)) errors.push(`src/music.json: thiếu public/music/${f} (npm run music)`);
  for (const f of onDisk) if (!files.includes(f)) errors.push(`public/music/${f} không bài nào dùng (npm run music xoá tệp cũ)`);
  const room = (kind: string, sample: string, other: string, n: number) => {
    const r = rules.filter(x => x.re.test(sample));
    if (r.length !== 1) { errors.push(`vite.config.ts: ${r.length} luật bộ nhớ đệm cho ${kind} (${sample}), cần đúng 1`); return; }
    if (r[0].re.test(other)) errors.push(`vite.config.ts: luật '${r[0].name}' của ${kind} bắt cả ${other}`);
    if (n > r[0].max) errors.push(`bộ nhớ đệm '${r[0].name}' chỉ giữ ${r[0].max} tệp mà có ${n} ${kind}: tăng maxEntries trong vite.config.ts`);
    else if (n > r[0].max * 0.9) warns.push(`bộ nhớ đệm '${r[0].name}': ${n} ${kind} / ${r[0].max} chỗ, sắp đầy`);
    return r[0];
  };
  const v = room('bản thu lời kể', '/assets/ui-rate-AbCd1234.m4a', '/music/calm-0a1b2c3d.m4a', clips);
  const m = room('bài nhạc', '/music/calm-0a1b2c3d.m4a', '/assets/ui-rate-AbCd1234.m4a', files.length);
  if (v && m && v.name === m.name) errors.push(`vite.config.ts: lời kể và nhạc chung bộ nhớ đệm '${v.name}'`);
}

// 6. (tuỳ chọn) độ dài: bản thu quá ngắn hay quá dài so với số chữ thì có thể đọc sai, đọc sót hay lặp
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
