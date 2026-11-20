// Converts voice-over clips into src/voice/<key>.m4a: trims leading/trailing silence, matches loudness
// (-16 LUFS) and encodes 64 kbps mono AAC. A narrator's take in recordings/ wins; otherwise the VieNeu-TTS
// clip in tts-out/ (scripts/tts/generate.py) is used. A clip whose .m4a is newer than its source is skipped (--force
// rebuilds all). Needs ffmpeg.
// Also writes src/voice/said.json: for each clip, a signature of the exact line it reads (the line kept in
// tts-out/manifest.json for a VieNeu clip; the script line at build time for a narrator's take). The app plays a clip
// only when the line on screen has that signature (src/said.ts), and voice:check flags clips whose line has changed.
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { join, parse } from 'node:path';

const OUT = 'src/voice';
mkdirSync(OUT, { recursive: true });
const AUDIO = /\.(wav|mp3|m4a|aac|flac)$/i;
const list = dir => (existsSync(dir) ? readdirSync(dir).filter(f => AUDIO.test(f)).map(f => ({ dir, f, key: parse(f).name })) : []);
const human = list('recordings'), taken = new Set(human.map(x => x.key));
const files = human.concat(list('tts-out').filter(x => !taken.has(x.key)));
if (!files.length) console.log('No clips in recordings/ or tts-out/ (see docs/voice/kich-ban.md).');
else console.log(`${human.length} recorded, ${files.length - human.length} synthesised`);
const force = process.argv.includes('--force');
const fresh = (src, dst) => !force && existsSync(dst) && statSync(dst).mtimeMs >= statSync(src).mtimeMs;
let kept = 0;
const trim = 'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.15';
// same as textSig in src/said.ts (FNV-1a, 32 bit, over UTF-16 code units)
const sig = t => { let h = 0x811c9dc5; for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 0x01000193); } return (h >>> 0).toString(16).padStart(8, '0'); };
const json = p => (existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : {});
const SAID = join(OUT, 'said.json'), said = json(SAID), man = json('tts-out/manifest.json');
const cells = line => [...line.matchAll(/("(?:[^"]|"")*"|[^,]*)(?:,|$)/g)].map(m => m[1].replace(/^"|"$/g, '').replace(/""/g, '"'));
const csv = existsSync('docs/voice/kich-ban.csv') ? readFileSync('docs/voice/kich-ban.csv', 'utf8') : '';
const script = new Map(csv.split('\n').slice(1).filter(Boolean).map(l => { const c = cells(l); return [c[1], c[4]]; }));
/** The line clip `key` reads: VieNeu's manifest says; a take just (re)built reads the current script; otherwise keep. */
const line = (dir, key, built) => (dir === 'tts-out' && typeof man[key]?.text === 'string' ? man[key].text : built || !(key in said) ? script.get(key) : undefined);
for (const { dir, f, key } of files) {
  if (fresh(join(dir, f), join(OUT, key + '.m4a'))) { kept++; const t = line(dir, key, false); if (t !== undefined) said[key] = sig(t); continue; }
  const t = line(dir, key, true);
  if (t !== undefined) said[key] = sig(t);
  // Trim the start, reverse to trim the end, then loudness-match; keep 0.15 s of air at both ends.
  // Resample inside the chain: loudnorm emits 192 kHz and `-ar` after it makes ffmpeg hang with lossy encoders.
  execFileSync('ffmpeg', ['-nostdin', '-v', 'error', '-y', '-i', join(dir, f), '-vn',
    '-af', `${trim},areverse,${trim},areverse,loudnorm=I=-16:TP=-3:LRA=7,highpass=f=70,aresample=44100`,
    '-ac', '1', '-c:a', 'aac', '-b:a', '64k', '-movflags', '+faststart', join(OUT, key + '.m4a')]);
  console.log(dir === 'recordings' ? '✓' : '·', key);
}
if (kept) console.log(`${kept} clips already up to date`);
for (const k of Object.keys(said)) if (!existsSync(join(OUT, k + '.m4a'))) delete said[k];
writeFileSync(SAID, JSON.stringify(Object.fromEntries(Object.entries(said).sort(([a], [b]) => (a < b ? -1 : 1))), null, 1) + '\n');
