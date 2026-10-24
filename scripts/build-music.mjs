// Downloads the soundtrack (Kevin MacLeod, incompetech.com, CC BY 4.0) and writes loudness-matched,
// trimmed AAC files to public/music/. Needs ffmpeg. Credits are listed in src/screens/about.ts.
import { execFileSync } from 'node:child_process';
import { mkdirSync, existsSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// mood id → [incompetech title, max seconds]
const TRACKS = {
  calm: ['Ascending the Vale', 150],
  gate: ['Interloper', 150],
  colony: ['Crossing the Chasm', 150],
  war: ['Five Armies', 156],
  rebuild: ['Impact Prelude', 150],
  finale: ['Heroic Age', 98],
};

const out = 'public/music';
mkdirSync(out, { recursive: true });
const tmp = mkdtempSync(join(tmpdir(), 'dudo-music-'));
try {
  for (const [id, [title, max]] of Object.entries(TRACKS)) {
    const src = join(tmp, id + '.mp3');
    const res = await fetch('https://incompetech.com/music/royalty-free/mp3-royaltyfree/' + encodeURIComponent(title) + '.mp3');
    if (!res.ok) throw new Error(`${title}: HTTP ${res.status}`);
    writeFileSync(src, Buffer.from(await res.arrayBuffer()));
    const dst = join(out, id + '.m4a');
    // Match loudness, short fade-in, fade-out before the cut, 64 kbps stereo AAC.
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', src, '-vn', '-map_metadata', '-1', '-t', String(max),
      '-af', `loudnorm=I=-18:TP=-1.5:LRA=11,afade=t=in:d=1.5,afade=t=out:st=${max - 6}:d=6`,
      '-ac', '2', '-ar', '44100', '-c:a', 'aac', '-b:a', '64k', '-movflags', '+faststart', dst]);
    console.log(`${id.padEnd(8)} ${title}${existsSync(dst) ? '' : ' (failed)'}`);
  }
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
