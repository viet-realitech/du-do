// Converts voice-over clips into src/voice/<key>.m4a: trims leading/trailing silence, matches loudness
// (-16 LUFS) and encodes 64 kbps mono AAC. A narrator's take in recordings/ wins; otherwise the VieNeu-TTS
// clip in tts-out/ (scripts/tts/generate.py) is used. A clip whose .m4a is newer than its source is skipped (--force
// rebuilds all). Needs ffmpeg.
import { execFileSync } from 'node:child_process';
import { readdirSync, mkdirSync, existsSync, statSync } from 'node:fs';
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
for (const { dir, f, key } of files) {
  if (fresh(join(dir, f), join(OUT, key + '.m4a'))) { kept++; continue; }
  // Trim the start, reverse to trim the end, then loudness-match; keep 0.15 s of air at both ends.
  // Resample inside the chain: loudnorm emits 192 kHz and `-ar` after it makes ffmpeg hang with lossy encoders.
  execFileSync('ffmpeg', ['-nostdin', '-v', 'error', '-y', '-i', join(dir, f), '-vn',
    '-af', `${trim},areverse,${trim},areverse,loudnorm=I=-16:TP=-3:LRA=7,highpass=f=70,aresample=44100`,
    '-ac', '1', '-c:a', 'aac', '-b:a', '64k', '-movflags', '+faststart', join(OUT, key + '.m4a')]);
  console.log(dir === 'recordings' ? '✓' : '·', key);
}
if (kept) console.log(`${kept} clips already up to date`);
