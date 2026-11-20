import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

/* Tiếng trận và nhạc với Âm thanh bật (src/audio.ts, src/music.ts). Trình duyệt thử chạy Web Audio thật (không có loa):
   sổ của chuỗi cảnh và nhạc đọc từ bảng chẩn đoán (?debug); các lượt nhạc (nguồn đệm dài) được ghi lại khi bắt đầu (init
   script bắt AudioBufferSourceNode.start / connect), rồi tiếng của chúng thu bằng một AudioWorklet gắn thêm, không đổi gì
   của ứng dụng. */
const LOOPS = JSON.parse(readFileSync('src/music.json', 'utf8')) as { xf: number; tracks: Record<string, { file: string; loop: [number, number] }> };
const midGame = { step: 'play', name: 'Họ Lê', year: 1954, picks: { e1: 'chien', e2: 'duytan', e3: 'cs', e4: 'vm', e5: 'nam' }, quiz: { e1: [true, true], e2: [true, false], e3: [true, true], e4: [false, true] }, narr: false, sound: true, music: true, fx: true };
const live = (page: Page, sel: string) => page.locator(`${sel}:not(.exiting *, .cine.out, .cine.out *)`);

/** Một lượt nhạc: lúc bắt đầu (đồng hồ âm thanh), bắt đầu từ giây nào của bản, nguồn và gain của nó (đích nối đầu tiên). */
type Pass = { when: number; off: number; src: AudioBufferSourceNode; g: AudioNode | null };
type Rec = { t: number[]; d: Float32Array[] };
type W = Window & { passes: Pass[]; onpass?: (p: Pass, i: number) => void; recs?: Rec[]; pans: { set: [string, number][] }[] };
/** Máy thu trong luồng âm thanh: mỗi khối 128 mẫu (trung bình hai kênh) ghi đúng lúc được dựng (currentTime), gom 4096
    mẫu một lần gửi về trang. */
const REC_JS = `registerProcessor('du-do-rec', class extends AudioWorkletProcessor {
  constructor() { super(); this.n = 0; this.t = 0; this.m = new Float32Array(4096); }
  process(ins) {
    const i = ins[0], a = i && i[0], b = i && (i[1] || i[0]);
    if (!this.n) this.t = currentTime;
    for (let k = 0; k < 128; k++) this.m[this.n + k] = a ? (a[k] + b[k]) / 2 : 0;
    this.n += 128;
    if (this.n === 4096) { this.port.postMessage({ t: this.t, d: this.m }, [this.m.buffer]); this.m = new Float32Array(4096); this.n = 0; }
    return true;
  }
});`;

async function boot(page: Page, state: object) {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(m.text()); });
  await page.route(/wikipedia\.org|wikimedia\.org/, r => r.abort());
  await page.addInitScript(() => {
    const w = window as unknown as W;
    w.passes = []; w.pans = [];
    // nhạc: nguồn đệm dài (hơn 30 s; tiếng nhiễu của tiếng trận dài 2 s) → lượt nhạc
    type Src = AudioBufferSourceNode & { g?: AudioNode };
    const long = (n: AudioBufferSourceNode) => !!n.buffer && n.buffer.duration > 30;
    const connect = AudioBufferSourceNode.prototype.connect as (this: AudioNode, ...a: unknown[]) => AudioNode;
    (AudioBufferSourceNode.prototype as unknown as { connect: unknown }).connect = function (this: Src, ...a: unknown[]) { if (long(this) && !this.g) this.g = a[0] as AudioNode; return connect.apply(this, a); };
    const start = AudioBufferSourceNode.prototype.start;
    AudioBufferSourceNode.prototype.start = function (this: Src, when = 0, off = 0, ...r: number[]) {
      if (long(this)) { const p = { when, off, src: this, g: this.g || null }; w.passes.push(p); w.onpass?.(p, w.passes.length - 1); }
      return start.call(this, when, off, ...r);
    };
    // tiếng trận: vị trí trái / phải của từng bộ đặt vị trí (gán thẳng, hay hẹn từ → tới)
    const mk = AudioContext.prototype.createStereoPanner;
    AudioContext.prototype.createStereoPanner = function (this: AudioContext) {
      const n = mk.call(this), rec = { set: [] as [string, number][] }, P = n.pan, d = Object.getOwnPropertyDescriptor(AudioParam.prototype, 'value')!;
      w.pans.push(rec);
      Object.defineProperty(P, 'value', { get() { return d.get!.call(P); }, set(v: number) { rec.set.push(['v', v]); d.set!.call(P, v); } });
      const sv = P.setValueAtTime.bind(P), lr = P.linearRampToValueAtTime.bind(P);
      P.setValueAtTime = (v: number, t: number) => { rec.set.push(['s', v]); return sv(v, t); };
      P.linearRampToValueAtTime = (v: number, t: number) => { rec.set.push(['r', v]); return lr(v, t); };
      return n;
    };
  });
  await page.addInitScript(s => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('dudo-v2', s); sessionStorage.setItem('seeded', '1'); } }, JSON.stringify(state));
  await page.goto('/?debug');
  await page.waitForSelector('#map text[data-city]');
  await expect(page.locator('#dbg pre')).toContainText('Tiếng trận');
  // một cú chạm vào tên bảng chẩn đoán (không mở gì): AudioContext, nhạc bắt đầu. Rồi cho chạm xuyên qua bảng, vốn phủ
  // góc trên màn điện thoại (chữ của nó vẫn được vẽ lại mỗi giây)
  await page.locator('#dbg header b').click();
  await page.addStyleTag({ content: '#dbg { pointer-events: none !important; opacity: .4 }' });
  return errors;
}

/** Sổ "Tiếng trận" của bảng chẩn đoán (vẽ lại mỗi giây). */
async function war(page: Page) {
  const t = (await page.locator('#dbg pre').textContent()) || '';
  const m = t.match(/Tiếng trận: kiểu (\S+) · nút sống (-?\d+) \(vị trí trái\/phải (-?\d+), nhiều nhất (\d+)\) · tiếng vang (có|chưa) · (\d+) cảnh · nhạc ×([\d.]+)( \(đang lùi\))?/);
  return m ? { kind: m[1], live: +m[2], pans: +m[3], peak: +m[4], verb: m[5] === 'có', scenes: +m[6], music: +m[7], dip: !!m[8] } : null;
}
const musicLine = async (page: Page) => ((await page.locator('#dbg pre').textContent()) || '').match(/Nhạc: .*/)?.[0] || '';

/** Mở trang sự kiện `id` (nút gắn tạm) rồi xem lại cảnh của nó. */
async function replay(page: Page, id: string) {
  await page.evaluate(id => { document.getElementById('goto')?.remove(); const b = document.createElement('button'); b.dataset.a = 'ev'; b.dataset.id = id; b.id = 'goto'; b.style.cssText = 'position:fixed;right:0;bottom:0;z-index:99999;width:12px;height:12px'; document.body.appendChild(b); }, id);
  await page.locator('#goto').click();
  await live(page, '.ov .hero .hplay').click();
  await expect(page.locator('#replb')).toBeVisible();
}

test('a battle lowers the music while it sounds and brings it back; its panners and reverb are made, then released', async ({ page }) => {
  test.setTimeout(90_000);
  const errors = await boot(page, midGame);
  await expect.poll(() => musicLine(page), { timeout: 15_000 }).toMatch(/^Nhạc: calm \d/);
  expect(await war(page)).toMatchObject({ kind: 'mới', live: 0, dip: false, music: 1 });
  await replay(page, 'dbp');
  // nhạc lùi ~7 dB khi trận mở (bus nhạc riêng; lời kể tắt nên không có hạ nào khác)
  await expect.poll(async () => (await war(page))?.music ?? 1, { timeout: 8000 }).toBeLessThan(0.5);
  expect((await war(page))!.dip).toBe(true);
  // các mũi tên tới nơi: mỗi tiếng nổ một bộ đặt vị trí; tiếng vang chung đã có
  for (let i = 0; i < 2; i++) await page.locator('#replb [data-t=rnext]').click();
  await expect.poll(async () => (await war(page))?.peak ?? 0, { timeout: 10_000 }).toBeGreaterThanOrEqual(2);
  expect((await war(page))!.verb).toBe(true);
  // tới phần khép trận: nhạc lên lại êm (~1,8 s sau dòng kết, rồi vài giây lên dần)
  for (let i = 0; i < 4 && !(await page.locator('#mapwrap .lt.end').count()); i++) await page.locator('#replb [data-t=rnext]').click();
  await expect(page.locator('#mapwrap .lt.end')).toBeVisible({ timeout: 6000 });
  await expect.poll(async () => (await war(page))?.dip, { timeout: 8000 }).toBe(false);
  await expect.poll(async () => (await war(page))?.music ?? 0, { timeout: 12_000 }).toBeGreaterThanOrEqual(0.95);
  // đóng: bus của cảnh và mọi bộ đặt vị trí được ngắt
  await page.locator('#replb [data-t=rclose]').click();
  await expect.poll(async () => { const w = await war(page); return w && [w.live, w.pans]; }, { timeout: 8000 }).toEqual([0, 0]);
  expect(errors).toEqual([]);
});

test('ten battles in a row leave no scene audio nodes behind', async ({ page }) => {
  test.setTimeout(150_000);
  const errors = await boot(page, { ...midGame, music: false });
  const ids = ['dn58', 'cd61', 'dbp', 'ab63', 'vb64', 'id65', 'mt68', 'ks68', 'hs74', 'bmt75'];
  for (const id of ids) {
    await replay(page, id);
    await page.locator('#replb [data-t=rnext]').click();
    await page.locator('#replb [data-t=rnext]').click();
    await page.waitForTimeout(900); // tiếng nổ của các mũi tên vừa tới
    await page.locator('#replb [data-t=rclose]').click();
    await expect(page.locator('#replb')).toHaveCount(0);
  }
  await expect.poll(async () => { const w = await war(page); return w && [w.live, w.pans]; }, { timeout: 8000 }).toEqual([0, 0]);
  const w = (await war(page))!;
  expect(w.scenes).toBeGreaterThanOrEqual(ids.length);
  expect(w.peak).toBeGreaterThan(0);
  expect(errors).toEqual([]);
});

test('the A/B switch in the debug panel plays the old combat sound: no panners, no reverb, no music dip', async ({ page }) => {
  const errors = await boot(page, midGame);
  const ab = page.locator('#dbg .ab');
  await expect(ab).toHaveText('Nghe tiếng trận kiểu cũ');
  await ab.dispatchEvent('click');
  await expect(ab).toHaveText('Nghe tiếng trận kiểu mới');
  expect(await page.evaluate(() => localStorage.getItem('dudo-war-old'))).toBe('1');
  await expect.poll(async () => (await war(page))?.kind).toBe('cũ');
  await replay(page, 'dbp');
  for (let i = 0; i < 2; i++) await page.locator('#replb [data-t=rnext]').click();
  await page.waitForTimeout(2500);
  expect(await war(page)).toMatchObject({ kind: 'cũ', peak: 0, verb: false, dip: false });
  await page.locator('#replb [data-t=rclose]').click();
  await ab.dispatchEvent('click');
  expect(await page.evaluate(() => localStorage.getItem('dudo-war-old'))).toBeNull();
  expect(errors).toEqual([]);
});

test.describe(() => {
  test.use({ bypassCSP: true }); // máy thu AudioWorklet nạp từ blob:
  test('music loops: each pass starts on the audio clock at the loop point of the one before and plays in step with it through the crossfade, with no dip in level', async ({ page }) => {
    test.setTimeout(90_000);
    const errors = await boot(page, { ...midGame, year: 1885 });
    const [L, C] = LOOPS.tracks.calm.loop, XF = LOOPS.xf;
    await expect.poll(() => musicLine(page), { timeout: 20_000 }).toMatch(/^Nhạc: calm \d/);
    // ba máy thu: tiếng thô của các lượt chẵn / lẻ (trước gain của chúng), và tổng các lượt sau gain (cái tới bus nhạc).
    // Thu trong luồng âm thanh (AudioWorklet, REC_JS): không mất khối nào khi máy bận. ScriptProcessor chạy ở luồng chính:
    // máy CI bận thì tiếng thu được đứt quãng và phép tương quan bên dưới không tìm ra vị trí. Mô-đun: WebKit nạp từ một
    // đường dẫn cùng nguồn do bài thử trả lời (không nạp worklet từ blob:); Chromium không cho bắt yêu cầu tải mô-đun
    // worklet nên nạp từ blob: (bài này bỏ qua CSP của ứng dụng: bypassCSP ở trên).
    await page.context().route('**/__du-do-rec.js', r => r.fulfill({ contentType: 'text/javascript', body: REC_JS }));
    await page.evaluate(async js => {
      const w = window as unknown as W, ctx = w.passes[0].src.context as AudioContext, z = ctx.createGain();
      z.gain.value = 0;
      z.connect(ctx.destination);
      try { await ctx.audioWorklet.addModule('/__du-do-rec.js'); } catch {
        const url = URL.createObjectURL(new Blob([js], { type: 'text/javascript' }));
        await ctx.audioWorklet.addModule(url);
        URL.revokeObjectURL(url);
      }
      const recs: Rec[] = (w.recs = []), sps = [0, 1, 2].map(() => {
        const sp = new AudioWorkletNode(ctx, 'du-do-rec', { numberOfInputs: 1, numberOfOutputs: 1, channelCount: 2, channelCountMode: 'explicit' }), r: Rec = { t: [], d: [] };
        recs.push(r);
        sp.port.onmessage = e => { r.t.push(e.data.t); r.d.push(e.data.d); };
        sp.connect(z);
        return sp;
      });
      const tap = (p: Pass, i: number) => { p.src.connect(sps[i % 2]); p.g?.connect(sps[2]); };
      w.passes.forEach(tap);
      w.onpass = tap;
    }, REC_JS);
    // nút của bảng chẩn đoán: tới 4 s trước điểm vòng (để nghe thử trên máy thật), rồi qua mối nối
    await page.locator('#dbg .seam').dispatchEvent('click');
    await page.waitForTimeout((4 + XF + 1.5) * 1000);
    await expect.poll(() => musicLine(page), { timeout: 4000 }).toMatch(/nối vòng 1/);
    const r = await page.evaluate(([L, C, XF]) => {
      const w = window as unknown as W, P = w.passes, ia = P.map(p => Math.abs(p.off - (C - 4)) < 1e-3).lastIndexOf(true);
      const A = P[ia], B = P[ia + 1], N = P[ia + 2], sched = [A, B, N].map(p => p && { when: p.when, off: p.off });
      if (!B) return { sched, rows: [], lv: null };
      const buf = A.src.buffer!, sr = buf.sampleRate, D = 8;
      // bản nhạc, một kênh, giảm mẫu D lần (trung bình)
      const c0 = buf.getChannelData(0), c1 = buf.numberOfChannels > 1 ? buf.getChannelData(1) : c0, ref = new Float32Array(Math.floor(c0.length / D));
      for (let i = 0; i < ref.length; i++) { let s = 0; for (let k = 0; k < D; k++) s += c0[i * D + k] + c1[i * D + k]; ref[i] = s / (2 * D); }
      // `n` mẫu (đã giảm) một máy thu ghi được từ lúc `T` (đồng hồ âm thanh)
      const grab = (r: Rec, T: number, n: number): Float32Array | null => {
        const i = r.t.findIndex((t, j) => t <= T && (r.t[j + 1] ?? Infinity) > T);
        if (i < 0) return null;
        const raw: number[] = [];
        for (let j = i, o = Math.round((T - r.t[i]) * sr); j < r.d.length && raw.length < n * D; j++, o = 0) raw.push(...r.d[j].subarray(o));
        if (raw.length < n * D) return null;
        return Float32Array.from({ length: n }, (_, k) => { let s = 0; for (let q = 0; q < D; q++) s += raw[k * D + q]; return s / D; });
      };
      // vị trí thật trong bản (s) của đoạn `q`: tương quan chuẩn hoá quanh `guess` ± 0,6 s
      const find = (q: Float32Array | null, guess: number) => {
        if (!q) return null;
        const n = q.length, k0 = Math.max(0, Math.round(((guess - 0.6) * sr) / D)), k1 = Math.min(ref.length - n, Math.round(((guess + 0.6) * sr) / D));
        let qq = 0;
        for (const x of q) qq += x * x;
        if (qq < 1e-8 * n) return null;
        let best = -2, at = 0;
        for (let k = k0; k <= k1; k++) {
          let s = 0, e = 0;
          for (let i = 0; i < n; i++) { const v = ref[k + i]; s += q[i] * v; e += v * v; }
          const c = s / Math.sqrt(qq * e + 1e-12);
          if (c > best) { best = c; at = k; }
        }
        return { pos: (at * D) / sr, r: best };
      };
      const [ra, rb] = ia % 2 ? [w.recs![1], w.recs![0]] : [w.recs![0], w.recs![1]], n = Math.round((0.25 * sr) / D);
      const rows = [0.5, 1.5, 2.5, 3.5].map(dt => {
        const a = find(grab(ra, B.when + dt, n), C + dt), b = find(grab(rb, B.when + dt, n), L + dt);
        return { dt, a, b, d: a && b ? b.pos - L - (a.pos - C) : null };
      });
      // mức tổng sau gain, cửa sổ 0,4 s: trước mối nối (trung vị) và qua mối nối (thấp nhất)
      const m = w.recs![2], all = new Float32Array(m.d.reduce((s, x) => s + x.length, 0));
      m.d.reduce((o, x) => { all.set(x, o); return o + x.length; }, 0);
      const db = (T: number) => { const i = Math.round((T - m.t[0]) * sr), k = Math.round(0.4 * sr); let e = 0; for (let j = i; j < i + k; j++) e += all[j] * all[j]; return 10 * Math.log10(e / k + 1e-12); };
      const before = Array.from({ length: 20 }, (_, k) => db(B.when - 3 + k * 0.1)).sort((p, q) => p - q);
      const seam = Array.from({ length: Math.round((XF + 0.8) / 0.1) }, (_, k) => db(B.when - 0.2 + k * 0.1));
      return { sched, rows, lv: { ref: before[10], low: Math.min(...seam) } };
    }, [L, C, XF]);
    // trên đồng hồ âm thanh: lượt sau bắt đầu từ điểm bắt đầu vòng đúng lúc lượt trước tới điểm vòng; lượt sau nữa đã hẹn
    const [A, B, N] = r.sched;
    expect(B).toBeTruthy();
    expect(Math.abs(B!.when - (A!.when + C - A!.off))).toBeLessThan(1e-6);
    expect(B!.off).toBeCloseTo(L, 6);
    expect(N).toBeTruthy();
    expect(Math.abs(N!.when - (B!.when + C - L))).toBeLessThan(1e-6);
    expect(N!.off).toBeCloseTo(L, 6);
    // tiếng thật của hai lượt suốt lần chuyển: cùng nhịp (kiểu cũ, hai thẻ <audio>: WebKit lệch 0,7–0,9 s)
    const good = r.rows.filter(x => x.a && x.b && x.a.r > 0.9 && x.b.r > 0.9);
    expect(good.length, JSON.stringify(r.rows)).toBeGreaterThanOrEqual(2);
    for (const x of good) expect(Math.abs(x.d!), JSON.stringify(r.rows)).toBeLessThan(0.015);
    // mức qua mối nối: không hụt quá 6 dB so với trước (kiểu mờ về im lặng rồi phát lại từ đầu bài hụt −40…−90 dB)
    expect(r.lv!.low - r.lv!.ref).toBeGreaterThan(-6);
    expect(errors).toEqual([]);
  });
});

test('hiding the page pauses the music where it is, and showing it plays on from there', async ({ page }) => {
  const errors = await boot(page, { ...midGame, year: 1885 });
  await expect.poll(() => musicLine(page), { timeout: 20_000 }).toMatch(/^Nhạc: calm \d/);
  await page.waitForTimeout(1500);
  // trang ẩn / hiện (khoá máy, sang ứng dụng khác): document.hidden giả lập, rồi sự kiện visibilitychange
  const flip = (h: boolean) => page.evaluate(h => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => h }); document.dispatchEvent(new Event('visibilitychange')); }, h);
  const pos = async () => Number((await musicLine(page)).match(/calm ([\d.]+) s/)?.[1] ?? NaN);
  const started = () => page.evaluate(() => (window as unknown as W).passes.length);
  await flip(true);
  await expect.poll(() => musicLine(page)).toMatch(/tạm dừng/);
  const p0 = await pos(), n0 = await started();
  await page.waitForTimeout(1500);
  expect(await pos()).toBe(p0);
  expect(await started()).toBe(n0); // không có lượt nào bắt đầu trong lúc ẩn
  await flip(false);
  await expect.poll(() => musicLine(page)).not.toMatch(/tạm dừng/);
  // một lượt mới bắt đầu đúng từ chỗ đã dừng
  const resumed = await page.evaluate(n0 => (window as unknown as W).passes.slice(n0).map(p => p.off), n0);
  expect(resumed.length).toBeGreaterThan(0);
  expect(Math.abs(resumed[0] - p0)).toBeLessThan(0.06);
  await page.waitForTimeout(1200);
  expect(await pos()).toBeGreaterThan(p0);
  expect(await pos()).toBeLessThan(p0 + 4);
  expect(errors).toEqual([]);
});

test('the ending plays the elegiac finale for a family that lost its homeland, and Heroic Age for the others', async ({ page }) => {
  const st = { step: 'play', name: 'Họ Trần', year: 2026, picks: { e1: 'chien', e2: 'canvuong', e3: 'qdd', e4: 'qg', e5: 'nam', e6: 'radi' }, quiz: { e6: [true, true] }, narr: false, sound: true, music: true };
  const errors = await boot(page, st);
  await page.locator('#card [data-a=end].c').click();
  await expect(page.locator('#layer .end-title')).toHaveText('Bên kia đại dương');
  await expect.poll(() => musicLine(page), { timeout: 15_000 }).toMatch(/^Nhạc: elegy \d/);
  // the journey film keeps the ending's track
  await page.getByRole('button', { name: /Xem phim hành trình/ }).click();
  await page.waitForTimeout(1500);
  expect(await musicLine(page)).toMatch(/^Nhạc: elegy \d/);
  // another family, another ending: Heroic Age (a new family has not read an ending yet: no endFix, which keeps a read ending)
  await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('dudo-v2')!); s.picks = { e1: 'chien', e2: 'canvuong', e3: 'cs', e4: 'vm', e5: 'bac', e6: 'doimoi' }; delete s.endFix; delete s.endSaid; s.ended = false; localStorage.setItem('dudo-v2', JSON.stringify(s)); });
  await page.reload();
  await page.locator('#card [data-a=end].c').click();
  await expect(page.locator('#layer .end-title')).not.toHaveText('Bên kia đại dương');
  await expect.poll(() => musicLine(page), { timeout: 15_000 }).toMatch(/^Nhạc: finale \d/);
  expect(errors).toEqual([]);
});

test('music asked for while the page is hidden waits for the page to be shown: a track that finishes loading behind it does not start', async ({ page }) => {
  // tệp nhạc tới chậm 3 s: trang ẩn đi (khoá máy, sang ứng dụng khác) ngay sau cú chạm, trong lúc tải
  await page.route(/\/music\//, async r => { await new Promise(f => setTimeout(f, 3000)); await r.continue(); });
  const errors = await boot(page, { ...midGame, year: 1885 });
  const flip = (h: boolean) => page.evaluate(h => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => h }); document.dispatchEvent(new Event('visibilitychange')); }, h);
  await flip(true);
  await page.waitForTimeout(6000); // tải xong, giải mã xong
  expect(await page.evaluate(() => (window as unknown as W).passes.length)).toBe(0);
  expect(await musicLine(page)).not.toMatch(/^Nhạc: calm \d/);
  await flip(false);
  await expect.poll(() => musicLine(page), { timeout: 8000 }).toMatch(/^Nhạc: calm \d/);
  expect(errors).toEqual([]);
});

test('a chapter tour paused under Hồ sơ keeps its music through an archived dossier: closing the dossier brings the chapter music back where it was, and the tour resumes on it', async ({ page }) => {
  test.setTimeout(120_000);
  // Sổ kết cục có một hồ sơ Đọc sử (kết cục không mất mát: nhạc khép Heroic Age)
  const save = { v: 2, step: 'play', name: 'Họ Phan', year: 2026, picks: { e1: 'canhtan', e2: 'duytan', e3: 'laphien', e4: 'tl', e5: 'thuba', e6: 'doimoi' }, quiz: { e6: [true, true] }, ended: true, endSaid: true };
  const book = { v: 1, runs: [{ id: 'r1', at: '2026-11-02T09:00:00.000Z', mode: 'read', end: 'canhtan', title: 'Bốn đời canh tân', name: 'Họ Phan', home: '', save }], gone: {}, live: {} };
  await page.addInitScript(b => { if (!sessionStorage.getItem('arc')) { localStorage.setItem('dudo-archive', b); sessionStorage.setItem('arc', '1'); } }, JSON.stringify(book));
  const errors = await boot(page, { ...midGame, year: 1945, picks: { e1: 'chien', e2: 'duytan', e3: 'cs', e4: 'vm' }, quiz: { e1: [true, true], e2: [true, true], e3: [true, true] } });
  await expect.poll(() => musicLine(page), { timeout: 15_000 }).toMatch(/^Nhạc: calm \d/);
  const pos = async (m: string) => Number((await musicLine(page)).match(new RegExp(`^Nhạc: ${m} ([\\d.]+) s`))?.[1] ?? NaN);
  // chương 4 chạy: nhạc chiến tranh
  await page.locator('#play').click();
  await expect(page.locator('#tourb')).toBeVisible();
  await expect.poll(() => musicLine(page), { timeout: 20_000 }).toMatch(/^Nhạc: war \d/);
  await page.waitForTimeout(3000);
  // Hồ sơ: tour dừng, nhạc của chương vẫn chơi
  await page.locator('.tab[data-t=me]').click();
  await expect(page.locator('#tourb')).toContainText('tạm dừng');
  await page.waitForTimeout(1000);
  expect(await musicLine(page)).toMatch(/^Nhạc: war \d/);
  const opened = async () => {
    await page.locator('.ledg .arc-runs [data-a=arc-open][data-id=r1]').click();
    await expect(live(page, '.ov.end[data-ro=r1]')).toBeVisible();
    await expect.poll(() => musicLine(page), { timeout: 15_000 }).toMatch(/^Nhạc: finale \d/);
  };
  const p1 = await pos('war');
  await opened();
  // ‹ Về Sổ kết cục: nhạc của chương trở lại, chơi tiếp từ chỗ đã rời (không lại từ khúc dạo đầu)
  await live(page, '.ov.end .end-back [data-a=close]').click();
  await expect.poll(() => musicLine(page), { timeout: 8000 }).toMatch(/^Nhạc: war \d/);
  expect(await pos('war')).toBeGreaterThanOrEqual(p1);
  const back = await page.evaluate(() => (window as unknown as W).passes.at(-1)!.off);
  expect(back).toBeGreaterThan(p1 - 0.5);
  // mở lại lần nữa, đóng bằng phím Esc, rồi về Bản đồ: tour chạy tiếp, trên nhạc của chương
  await opened();
  await page.keyboard.press('Escape');
  await expect(page.locator('.ov.end')).toHaveCount(0);
  await expect.poll(() => musicLine(page), { timeout: 8000 }).toMatch(/^Nhạc: war \d/);
  await page.locator('.tab[data-t=map]').click();
  await expect(page.locator('#tourb')).not.toContainText('tạm dừng');
  await expect.poll(() => musicLine(page), { timeout: 8000 }).toMatch(/^Nhạc: war \d/);
  await page.waitForTimeout(4000);
  expect(await musicLine(page)).toMatch(/^Nhạc: war \d/);
  expect(errors).toEqual([]);
});

test.describe('on an iPad in landscape', () => {
  test.use({ viewport: { width: 1194, height: 834 } });

  test('battle sounds come from where their arrows land on screen, even when the flight in ends late (WebKit)', async ({ page }) => {
    test.setTimeout(90_000);
    const errors = await boot(page, { ...midGame, music: false });
    // Ấp Bắc: mọi mũi tên tới ở nửa trái màn hình (trước đây WebKit đọc ma trận lúc bản đồ còn bay: mọi tiếng lệch hẳn sang phải)
    await replay(page, 'ab63');
    await expect(page.locator('#mapwrap .lt.end')).toBeVisible({ timeout: 60_000 });
    const r = await page.evaluate(() => {
      const w = window as unknown as W;
      const heads = [...document.querySelectorAll('#mapfx path[d="M-2,-7 L9,0 L-2,7 L1,0Z"]')].map(p => { const b = p.getBoundingClientRect(); return Math.max(-0.7, Math.min(0.7, ((2 * (b.left + b.width / 2)) / innerWidth - 1) * 0.7)); });
      // tiếng nổ (gán thẳng) và điểm tới của tiếng máy (hẹn từ đầu → đầu mũi tên)
      return { heads, pans: w.pans.flatMap(p => p.set.filter(x => x[0] !== 's').map(x => x[1])) };
    });
    expect(r.heads.length).toBeGreaterThan(0);
    expect(r.pans.length).toBeGreaterThan(0);
    for (const v of r.pans) expect(Math.min(...r.heads.map(h => Math.abs(h - v))), JSON.stringify(r)).toBeLessThan(0.12);
    expect(errors).toEqual([]);
  });
});
