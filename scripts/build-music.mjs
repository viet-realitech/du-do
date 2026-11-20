// Downloads the soundtrack (Kevin MacLeod, incompetech.com, CC BY 4.0) and writes loudness-matched AAC files to
// public/music/ plus their loop points to src/music.json. Needs ffmpeg. Credits are listed in src/screens/about.ts.
//
// No fade at either end: each file opens on its first sound (leading silence cut) and runs a little past its loop point.
// src/music.ts plays the intro once, then loops [loop[0], loop[1]] with an equal-power crossfade of `xf` seconds between
// its two decks (deck A from loop[1] fades out while deck B from loop[0] fades in). The loop points are found here by
// matching the music around them (harmony, timbre, onsets, level), so the crossfade joins like with like; the seam is then
// rendered offline from the encoded file at the same timing and its level checked (a dip deeper than MAX_DIP dB below the
// same stretch played straight through fails the build).
//
// node scripts/build-music.mjs [--src <folder with the .mp3s>] [--only war,elegy]
import { execFileSync } from 'node:child_process';
import { mkdirSync, existsSync, writeFileSync, readFileSync, mkdtempSync, rmSync, readdirSync, unlinkSync, renameSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

/** mood id → incompetech title, where the loop may start (s, after the intro) and where the crossfade may begin (s); the
    loop lasts at least a minute, and a longer one is slightly preferred (it repeats less often). */
const TRACKS = {
  calm: { title: 'Ascending the Vale', from: [4, 100], to: [128, 168] },
  gate: { title: 'Interloper', from: [4, 100], to: [120, 168] },
  colony: { title: 'Crossing the Chasm', from: [4, 100], to: [128, 168] },
  // the whole piece is 156 s and ends on a held brass chord from ~147 s: loop before it
  war: { title: 'Five Armies', from: [4, 80], to: [100, 144] },
  rebuild: { title: 'Impact Prelude', from: [4, 100], to: [128, 168] },
  // 97 s, the last bars from ~86 s are the piece's ending
  finale: { title: 'Heroic Age', from: [3, 30], to: [52, 84] },
  // kết cục mất mát (src/music.ts ELEGY)
  elegy: { title: 'The Parting', from: [3, 100], to: [120, 170] },
};
/** Crossfade between the decks (s), also in src/music.json for src/music.ts. */
const XF = 4;
/** Seam check: the quietest 0.4 s of the crossfade may sit at most this many dB below the same stretch played straight. */
const MAX_DIP = 3;

const args = process.argv.slice(2), opt = k => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : undefined; };
const SRC = opt('--src'), ONLY = opt('--only')?.split(',');
const out = 'public/music', manifest = 'src/music.json';
mkdirSync(out, { recursive: true });
const tmp = mkdtempSync(join(tmpdir(), 'dudo-music-'));
const SR = 44100, AR = 11025; // phát / phân tích

const ff = (a, big = false) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...a], big ? { maxBuffer: 1 << 30 } : undefined);
/** Float32 PCM from a file (`ch` channels at `sr`). */
const pcm = (f, sr, ch, af = []) => { const b = ff(['-i', f, ...af, '-ac', String(ch), '-ar', String(sr), '-f', 'f32le', '-'], true); return new Float32Array(b.buffer, b.byteOffset, b.byteLength / 4); };

/* ---------- phân tích: STFT 2048 / bước 256 ở 11025 Hz (23 ms một khung) ---------- */
const N = 2048, HOP = 256, FR = AR / HOP;
function fft(re, im) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) { let b = n >> 1; for (; j & b; b >>= 1) j ^= b; j ^= b; if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; } }
  for (let len = 2; len <= n; len <<= 1) {
    const a = (-2 * Math.PI) / len, wr = Math.cos(a), wi = Math.sin(a);
    for (let i = 0; i < n; i += len) {
      let cr = 1, ci = 0;
      for (let k = 0; k < len / 2; k++) {
        const p = i + k, q = p + len / 2, tr = re[q] * cr - im[q] * ci, ti = re[q] * ci + im[q] * cr;
        re[q] = re[p] - tr; im[q] = im[p] - ti; re[p] += tr; im[p] += ti;
        const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t;
      }
    }
  }
}
/** Per frame: chroma (12, unit length), 16 log band energies, onset flux, level (dB). */
function features(x) {
  const n = Math.floor((x.length - N) / HOP) + 1, hann = Float64Array.from({ length: N }, (_, i) => 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / N));
  const bin = f => Math.round((f * N) / AR), edges = Array.from({ length: 17 }, (_, i) => bin(60 * Math.pow(5000 / 60, i / 16)));
  const pc = new Int8Array(N / 2).fill(-1);
  for (let k = bin(55); k <= bin(2000); k++) pc[k] = ((Math.round(12 * Math.log2((k * AR) / N / 440)) % 12) + 12) % 12;
  const chroma = new Float32Array(n * 12), bands = new Float32Array(n * 16), flux = new Float32Array(n), db = new Float32Array(n);
  const re = new Float64Array(N), im = new Float64Array(N);
  let prev = new Float64Array(N / 2), cur = new Float64Array(N / 2);
  for (let t = 0; t < n; t++) {
    let e = 0;
    for (let i = 0; i < N; i++) { const v = x[t * HOP + i]; e += v * v; re[i] = v * hann[i]; im[i] = 0; }
    db[t] = 10 * Math.log10(e / N + 1e-12);
    fft(re, im);
    let fl = 0;
    for (let k = 1; k < N / 2; k++) {
      const m2 = re[k] * re[k] + im[k] * im[k], lm = Math.log1p(1000 * Math.sqrt(m2));
      cur[k] = lm;
      fl += Math.max(0, lm - prev[k]);
      if (pc[k] >= 0) chroma[t * 12 + pc[k]] += m2;
    }
    flux[t] = fl;
    for (let b = 0; b < 16; b++) { let s = 0; for (let k = edges[b]; k < Math.max(edges[b] + 1, edges[b + 1]); k++) s += Math.expm1(cur[k]); bands[t * 16 + b] = Math.log10(s + 1e-6); }
    let c = 0; for (let j = 0; j < 12; j++) c += chroma[t * 12 + j] ** 2; c = Math.sqrt(c) || 1;
    for (let j = 0; j < 12; j++) chroma[t * 12 + j] /= c;
    [prev, cur] = [cur, prev];
  }
  // dải tần chuẩn hoá theo cả bài (so âm sắc với mức trung bình của bài, không với số tuyệt đối)
  for (let b = 0; b < 16; b++) {
    let m = 0, s = 0; for (let t = 0; t < n; t++) m += bands[t * 16 + b]; m /= n;
    for (let t = 0; t < n; t++) s += (bands[t * 16 + b] - m) ** 2; s = Math.sqrt(s / n) || 1;
    for (let t = 0; t < n; t++) bands[t * 16 + b] = (bands[t * 16 + b] - m) / s;
  }
  return { n, chroma, bands, flux, db };
}
/** Blocks of B frames (~93 ms): mean features, for the coarse search. */
function blocks(F, B = 4) {
  const n = Math.floor(F.n / B), ch = new Float32Array(n * 12), bd = new Float32Array(n * 16), db = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    let e = 0;
    for (let t = i * B; t < (i + 1) * B; t++) { for (let j = 0; j < 12; j++) ch[i * 12 + j] += F.chroma[t * 12 + j] / B; for (let j = 0; j < 16; j++) bd[i * 16 + j] += F.bands[t * 16 + j] / B; e += Math.pow(10, F.db[t] / 10) / B; }
    db[i] = 10 * Math.log10(e + 1e-12);
  }
  return { n, ch, bd, db, B };
}
const cos = (a, i, b, j, d) => { let s = 0, x = 0, y = 0; for (let k = 0; k < d; k++) { const p = a[i * d + k], q = b[j * d + k]; s += p * q; x += p * p; y += q * q; } return s / (Math.sqrt(x * y) || 1); };
/** How alike the music is from `a` and from `b` (block indices) over the window [-pre, +post) blocks. */
function like(K, a, b, pre, post) {
  let c = 0, t = 0, ea = 0, eb = 0;
  for (let k = -pre; k < post; k++) { c += cos(K.ch, a + k, K.ch, b + k, 12); t += cos(K.bd, a + k, K.bd, b + k, 16); ea += Math.pow(10, K.db[a + k] / 10); eb += Math.pow(10, K.db[b + k] / 10); }
  const w = pre + post, lv = Math.abs(10 * Math.log10(ea / eb));
  return 0.55 * (c / w) + 0.45 * (t / w) - 0.04 * lv;
}
/** Loop points (s): the pair (L, C) in the allowed ranges whose surroundings match best, refined to the frame (23 ms)
    by the onsets, so beats line up through the crossfade. */
function loopPoints(F, from, to) {
  const K = blocks(F), bs = K.B / FR, pre = Math.round(3 / bs), post = Math.round((XF + 3) / bs);
  let best = { s: -Infinity, sim: 0, l: 0, c: 0 };
  for (let l = Math.round(from[0] / bs); l <= Math.round(from[1] / bs); l++) {
    for (let c = Math.round(to[0] / bs); c <= Math.round(to[1] / bs); c++) {
      if (c + post >= K.n) break;
      if ((c - l) * bs < 60) continue;
      const sim = like(K, l, c, pre, post), s = sim + 0.001 * (c - l) * bs;
      if (s > best.s) best = { s, sim, l, c };
    }
  }
  // tinh chỉnh tới từng khung: tương quan nhịp (onset) và hoà âm quanh hai điểm
  const L = best.l * K.B, C0 = best.c * K.B, fp = Math.round(3 * FR), fq = Math.round((XF + 3) * FR);
  const mean = (a, i0, n) => { let m = 0; for (let i = 0; i < n; i++) m += a[i0 + i]; return m / n; };
  let fine = { s: -Infinity, c: C0 };
  for (let d = -2 * K.B; d <= 2 * K.B; d++) {
    const C = C0 + d, ma = mean(F.flux, L - fp, fp + fq), mb = mean(F.flux, C - fp, fp + fq);
    let r = 0, xa = 0, xb = 0, h = 0;
    for (let k = -fp; k < fq; k++) { const p = F.flux[L + k] - ma, q = F.flux[C + k] - mb; r += p * q; xa += p * p; xb += q * q; h += cos(F.chroma, L + k, F.chroma, C + k, 12); }
    const s = r / (Math.sqrt(xa * xb) || 1) + h / (fp + fq);
    if (s > fine.s) fine = { s, c: C };
  }
  return { L: L / FR, C: fine.c / FR, score: best.sim };
}

/* ---------- kiểm tra mối nối: dựng lại đúng như music.ts, từ tệp đã mã hoá ---------- */
/** 0.4 s levels (dB) of the stereo signal y from t0 for `sec` seconds. */
const levels = (y, t0, sec) => { const w = Math.round(0.4 * SR), out = []; for (let s = Math.round(t0 * SR); s + w <= Math.round((t0 + sec) * SR); s += Math.round(0.2 * SR)) { let e = 0; for (let i = s; i < s + w; i++) e += y[2 * i] ** 2 + y[2 * i + 1] ** 2; out.push(10 * Math.log10(e / (2 * w) + 1e-12)); } return out; };
function seam(y, L, C) {
  // trước mối nối 6 s (chỉ deck A), mối nối XF s, sau 6 s (chỉ deck B)
  const pre = 6, post = 6, len = Math.round((pre + XF + post) * SR), mix = new Float32Array(2 * len);
  for (let i = 0; i < len; i++) {
    const t = i / SR - pre, u = Math.min(1, Math.max(0, t / XF));
    const ga = t < 0 ? 1 : Math.cos((u * Math.PI) / 2), gb = t < 0 ? 0 : Math.sin((u * Math.PI) / 2);
    const ia = Math.round((C + t) * SR), ib = Math.round((L + t) * SR);
    for (let c = 0; c < 2; c++) mix[2 * i + c] = (ia >= 0 && 2 * ia + c < y.length ? ga * y[2 * ia + c] : 0) + (ib >= 0 && t >= 0 ? gb * y[2 * ib + c] : 0);
  }
  const lv = levels(mix, 0, pre + XF + post), straight = levels(y, C - pre, pre + XF + post);
  // trong mối nối (và 0,4 s quanh nó): mức thấp nhất so với cùng đoạn ấy nếu deck A cứ chạy thẳng, và so với deck B chạy thẳng
  const inSeam = (_, i) => i * 0.2 + 0.4 > pre - 0.2 && i * 0.2 < pre + XF + 0.2;
  const from = levels(y, L - pre, pre + XF + post), min = a => Math.min(...a.filter(inSeam));
  const dip = min(lv) - Math.min(min(straight), min(from));
  const med = a => { const s = [...a].sort((p, q) => p - q); return s[s.length >> 1]; };
  return { dip, seamMin: min(lv) - med(lv), straightMin: min(straight) - med(straight), bump: Math.max(...lv.filter(inSeam)) - Math.max(...straight.filter(inSeam), ...from.filter(inSeam)) };
}

/* ---------- dựng ---------- */
const prev = existsSync(manifest) ? JSON.parse(readFileSync(manifest, 'utf8')) : { tracks: {} };
const tracks = { ...prev.tracks }, report = [];
let bad = 0;
try {
  for (const [id, t] of Object.entries(TRACKS)) {
    if (ONLY && !ONLY.includes(id)) continue;
    let src = SRC && join(SRC, t.title + '.mp3');
    if (!src || !existsSync(src)) {
      src = join(tmp, id + '.mp3');
      const res = await fetch('https://incompetech.com/music/royalty-free/mp3-royaltyfree/' + encodeURIComponent(t.title) + '.mp3');
      if (!res.ok) throw new Error(`${t.title}: HTTP ${res.status}`);
      writeFileSync(src, Buffer.from(await res.arrayBuffer()));
    }
    // cả bài, cùng độ to (loudnorm như trước), PCM nổi
    const raw = join(tmp, id + '.f32');
    ff(['-i', src, '-vn', '-af', 'loudnorm=I=-18:TP=-1.5:LRA=11', '-ac', '2', '-ar', String(SR), '-f', 'f32le', raw]);
    const rb = readFileSync(raw), all = new Float32Array(rb.buffer, rb.byteOffset, rb.byteLength / 4);
    // im lặng đầu bài (Interloper ~2 s, Heroic Age ~1 s): bắt đầu ở tiếng đầu tiên, chừa 40 ms
    // (theo từng 10 ms, mức trung bình trên −45 dB: loudnorm nâng tiếng nền của khoảng lặng lên quanh −70 dB)
    const W10 = SR / 100, rms10 = s => { let e = 0; for (let i = s; i < s + W10; i++) e += all[2 * i] ** 2 + all[2 * i + 1] ** 2; return Math.sqrt(e / (2 * W10)); };
    let first = 0; while (2 * (first + W10) < all.length && rms10(first) < 0.0056) first += W10;
    const lead = Math.max(0, first / SR - 0.04);
    const mono = new Float32Array(Math.floor((all.length / 2 - lead * SR) / 4));
    for (let i = 0; i < mono.length; i++) { let s = 0; for (let j = 0; j < 4; j++) { const p = Math.round(lead * SR) + 4 * i + j; s += all[2 * p] + all[2 * p + 1]; } mono[i] = s / 8; }
    const F = features(mono), { L, C, score } = loopPoints(F, t.from, t.to);
    // tệp chạy qua hết lần chuyển (C + XF) thêm 1 s, khép bằng 0,3 s rất ngắn ở tận cùng (bình thường không bao giờ nghe tới)
    const len = C + XF + 1, tmpOut = join(tmp, id + '.m4a');
    ff(['-f', 'f32le', '-ar', String(SR), '-ac', '2', '-ss', lead.toFixed(4), '-i', raw, '-t', len.toFixed(3),
      '-af', `afade=t=in:d=0.04,afade=t=out:st=${(len - 0.3).toFixed(3)}:d=0.3`, '-c:a', 'aac', '-b:a', '64k', '-movflags', '+faststart', tmpOut]);
    const hash = createHash('sha1').update(readFileSync(tmpOut)).digest('hex').slice(0, 8), file = `${id}-${hash}.m4a`;
    for (const f of readdirSync(out)) if (f === `${id}.m4a` || (f.startsWith(id + '-') && f !== file)) unlinkSync(join(out, f));
    renameSync(tmpOut, join(out, file));
    // đo mối nối trên chính tệp đã mã hoá
    const y = pcm(join(out, file), SR, 2), s = seam(y, L, C);
    if (s.dip < -MAX_DIP) bad++;
    tracks[id] = { file, title: t.title, dur: +(y.length / 2 / SR).toFixed(2), loop: [+L.toFixed(3), +C.toFixed(3)] };
    report.push(`${id.padEnd(7)} ${t.title.padEnd(19)} lead ${lead.toFixed(2)} s · loop ${L.toFixed(2)} → ${C.toFixed(2)} s (match ${score.toFixed(2)}) · file ${(y.length / 2 / SR).toFixed(1)} s · seam: dip ${s.dip.toFixed(1)} dB vs straight, quietest ${s.seamMin.toFixed(1)} dB (straight ${s.straightMin.toFixed(1)}) below median, bump ${s.bump >= 0 ? '+' : ''}${s.bump.toFixed(1)} dB${s.dip < -MAX_DIP ? '  ✗' : ''}`);
    console.log(report[report.length - 1]);
  }
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
writeFileSync(manifest, JSON.stringify({ about: 'npm run music (scripts/build-music.mjs): tệp trong public/music/, điểm vòng lặp [bắt đầu, lúc chuyển] (giây), độ dài chuyển xf (giây).', xf: XF, tracks }, null, 1) + '\n');
if (bad) { console.error(`✗ ${bad} mối nối hụt hơn ${MAX_DIP} dB`); process.exit(1); }
