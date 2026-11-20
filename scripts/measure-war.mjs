// Đo tiếng trận của src/audio.ts, kiểu mới so với kiểu cũ (công tắc A/B của bảng chẩn đoán), bằng cách dựng ngoại tuyến
// (renderOffline: đúng chuỗi của cảnh, qua bộ nén chung) trong Chromium của Playwright:
// - phần năng lượng trên 150 Hz (loa máy tính bảng, điện thoại gần như không phát được phần dưới) và dưới 120 Hz;
// - đỉnh (dBFS, không được chạm 0) và mức trung bình;
// - trái / phải của một tiếng nổ đặt ở −0,7;
// - năng lượng phần đuôi (sau 0,6 s) so với phần đầu, dB: tiếng vang.
// Tai người mới quyết được hay / dở; số đo chỉ để so sánh và để thấy không có gì vỡ tiếng.
// PW_CHROMIUM=<chrome> PORT=<cổng> npm run audio:measure
import { createServer } from 'vite';
import { chromium } from '@playwright/test';

const server = await createServer({ server: { port: Number(process.env.PORT) || 0, strictPort: !!process.env.PORT }, logLevel: 'error' });
await server.listen();
const url = server.resolvedUrls?.local[0];
const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
try {
  const page = await browser.newPage();
  await page.route(/wikipedia\.org|wikimedia\.org/, r => r.abort());
  await page.goto(url);
  const rows = await page.evaluate(async () => {
    const A = await import('/src/audio.ts');
    const energy = (b, c0 = 0, c1 = b.length) => { let e = 0; for (let c = 0; c < b.numberOfChannels; c++) { const d = b.getChannelData(c); for (let i = c0; i < c1; i++) e += d[i] * d[i]; } return e; };
    /** Năng lượng qua một bộ lọc thông thấp / thông cao bậc hai tại f Hz (cách đo của bản rà soát, boom.cjs). */
    const band = async (b, type, f) => {
      const a = new OfflineAudioContext(b.numberOfChannels, b.length, b.sampleRate), s = a.createBufferSource(), q = a.createBiquadFilter();
      s.buffer = b; q.type = type; q.frequency.value = f; q.Q.value = 0.7;
      s.connect(q).connect(a.destination); s.start();
      return energy(await a.startRendering());
    };
    const db = x => 10 * Math.log10(x + 1e-20);
    const SOUNDS = [
      ['pháo (boom)', () => A.WAR.boom(0, 0, 0), 2.5],
      ['pháo xa (boom far)', () => A.WAR.boom(0, 0.8, 0), 3],
      ['bom (bomb)', () => A.WAR.bomb(0, 0), 3],
      ['trống mở trận (sting land)', () => A.WAR.sting('land'), 2],
      ['trống dấu (SND.stamp)', () => A.SND.stamp(), 1.5],
      ['súng (crackle)', () => A.WAR.crackle(2.2, 14, 0, false, 0), 3],
      // một trận 5 mũi tên dồn nhất có thể: tiếng mở, pháo xa nền suốt trận, năm mũi tên tới cách nhau 2 s (nhịp ngắn nhất,
      // scene.ts beats) kèm súng, giáp chiến; và cùng thế nhưng năm tiếng nổ dồn trong 1,4 s (không trận nào như vậy)
      ['trận 5 mũi tên (nhịp 2 s)', () => { A.WAR.sting('siege'); A.WAR.rumble(12, 0.1); [-0.6, 0.5, -0.2, 0.3, 0.6].forEach((p, i) => { A.WAR.boom(1.2 + i * 2, i ? 0.25 : 0, p); A.WAR.crackle(2.2, 14, 1.4 + i * 2, false, p); }); A.WAR.crackle(1.2, 10, 5.3, false, 0); }, 13],
      ['5 tiếng nổ dồn trong 1,4 s', () => { A.WAR.sting('siege'); A.WAR.rumble(5, 0.1); [-0.6, 0.5, -0.2, 0.3, 0.6].forEach((p, i) => { A.WAR.boom(0.4 + i * 0.35, i ? 0.25 : 0, p); A.WAR.crackle(2.2, 14, 0.6 + i * 0.35, false, p); }); A.WAR.crackle(1.2, 10, 1.4, false, 0); }, 6],
    ];
    const out = [];
    for (const [name, fn, sec] of SOUNDS) {
      const r = {};
      for (const old of [true, false]) {
        const m = { hi150: 0, lo120: 0, peak: 0, rms: 0, tail: 0 }, N = 4; // Math.random trong tiếng: lấy trung bình 4 lần dựng
        for (let k = 0; k < N; k++) {
          const b = await A.renderOffline(fn, sec, old);
          const e = energy(b), h = await band(b, 'highpass', 150), l1 = await band(b, 'lowpass', 120), h1 = await band(b, 'highpass', 120);
          let pk = 0; for (let c = 0; c < 2; c++) for (const x of b.getChannelData(c)) pk = Math.max(pk, Math.abs(x));
          m.hi150 += (100 * h) / (h + (await band(b, 'lowpass', 150))) / N;
          m.lo120 += (100 * l1) / (l1 + h1) / N;
          m.peak = Math.max(m.peak, pk);
          m.rms += db(e / (2 * b.length)) / N;
          const at = Math.round(0.6 * b.sampleRate); m.tail += (db(energy(b, at)) - db(energy(b, 0, at))) / N;
        }
        r[old ? 'old' : 'new'] = m;
      }
      out.push({ name, r });
    }
    // trái / phải: tiếng nổ đặt ở −0,7 (gần mép trái màn hình)
    const b = await A.renderOffline(() => A.WAR.boom(0, 0, -0.7), 2.5);
    const ch = c => { let e = 0; for (const x of b.getChannelData(c)) e += x * x; return e; };
    return { out, lr: db(ch(0)) - db(ch(1)) };
  });
  const f = (x, d = 1) => x.toFixed(d).padStart(6);
  console.log('tiếng'.padEnd(28) + '  trên 150 Hz (%)    dưới 120 Hz (%)    đỉnh (dBFS)        trung bình (dB)    đuôi sau 0,6 s so với trước (dB)');
  console.log(''.padEnd(28) + '   cũ →  mới          cũ →  mới          cũ →  mới          cũ →  mới          cũ →  mới');
  for (const { name, r } of rows.out) {
    const p = k => `${f(r.old[k])} →${f(r.new[k])}      `;
    console.log(name.padEnd(28) + p('hi150') + p('lo120') + `${f(20 * Math.log10(r.old.peak))} →${f(20 * Math.log10(r.new.peak))}      ` + p('rms') + `${f(r.old.tail)} →${f(r.new.tail)}`);
  }
  console.log(`trái / phải của tiếng nổ đặt ở −0,7: kênh trái to hơn kênh phải ${rows.lr.toFixed(1)} dB`);
} finally {
  await browser.close();
  await server.close();
}
