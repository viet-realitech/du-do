// Converts voice-over recordings in recordings/<key>.(wav|mp3|m4a|aac|flac) into src/voice/<key>.m4a:
// trims leading/trailing silence, matches loudness (-16 LUFS) and encodes 64 kbps mono AAC. Needs ffmpeg.
import { execFileSync } from 'node:child_process';
import { readdirSync, mkdirSync } from 'node:fs';
import { join, parse } from 'node:path';

const IN = 'recordings', OUT = 'src/voice';
mkdirSync(OUT, { recursive: true });
const files = readdirSync(IN).filter(f => /\.(wav|mp3|m4a|aac|flac)$/i.test(f));
if (!files.length) console.log(`No recordings in ${IN}/ (see docs/voice/kich-ban.md).`);
const trim = 'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.15';
for (const f of files) {
  const key = parse(f).name;
  // Trim the start, reverse to trim the end, then loudness-match; keep 0.15 s of air at both ends.
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', join(IN, f), '-vn',
    '-af', `${trim},areverse,${trim},areverse,loudnorm=I=-16:TP=-1.5:LRA=7,highpass=f=70`,
    '-ac', '1', '-ar', '44100', '-c:a', 'aac', '-b:a', '64k', '-movflags', '+faststart', join(OUT, key + '.m4a')]);
  console.log('✓', key);
}
