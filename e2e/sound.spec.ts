import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

/* Tiếng trận và nhạc với Âm thanh bật (src/audio.ts, src/music.ts). Trình duyệt thử chạy Web Audio thật (không có loa):
   sổ của chuỗi cảnh và hai deck nhạc đọc từ bảng chẩn đoán (?debug); mức nhạc qua mối nối vòng đo bằng một AnalyserNode
   gắn thêm vào hai deck (init script bắt createMediaElementSource), không đổi gì của ứng dụng. */
const LOOPS = JSON.parse(readFileSync('src/music.json', 'utf8')) as { xf: number; tracks: Record<string, { file: string; loop: [number, number] }> };
const midGame = { step: 'play', name: 'Họ Lê', year: 1954, picks: { e1: 'chien', e2: 'duytan', e3: 'cs', e4: 'vm', e5: 'nam' }, quiz: { e1: [true, true], e2: [true, false], e3: [true, true], e4: [false, true] }, narr: false, sound: true, music: true, fx: true };
const live = (page: Page, sel: string) => page.locator(`${sel}:not(.exiting *, .cine.out, .cine.out *)`);

type Deck = { el: HTMLMediaElement; g: AudioNode };
type W = Window & { decks: Deck[]; music: string[]; lv?: { t: number; db: number; a: number; b: number; pa: boolean; pb: boolean }[] };

async function boot(page: Page, state: object) {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(m.text()); });
  await page.route(/wikipedia\.org|wikimedia\.org/, r => r.abort());
  await page.addInitScript(() => {
    const w = window as unknown as W;
    w.decks = []; w.music = [];
    // hai deck nhạc: phần tử và gain của nó (đích đầu tiên của nguồn), để gắn thêm bộ đo
    const make = AudioContext.prototype.createMediaElementSource;
    AudioContext.prototype.createMediaElementSource = function (this: AudioContext, el: HTMLMediaElement) {
      const n = make.call(this, el), connect = n.connect.bind(n) as (d: AudioNode) => AudioNode;
      (n as unknown as { connect: (d: AudioNode) => AudioNode }).connect = (d: AudioNode) => { w.decks.push({ el, g: d }); return connect(d); };
      return n;
    };
    const play = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function (this: HTMLMediaElement) { if (/\/music\//.test(this.src)) w.music.push(this.src.split('/').pop()!); return play.call(this); };
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
  await expect.poll(() => musicLine(page), { timeout: 15_000 }).toMatch(/A calm \d/);
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

test('music loops by crossfading its two decks at the loop point, with no dip in level', async ({ page }) => {
  test.setTimeout(90_000);
  const errors = await boot(page, { ...midGame, year: 1885 });
  const [L, C] = LOOPS.tracks.calm.loop, XF = LOOPS.xf;
  // deck đang phát 'calm' (bản đầu tiên) đã chạy được một lúc
  await expect.poll(() => page.evaluate(() => (window as unknown as W).decks.filter(d => !d.el.paused && d.el.currentTime > 1).length), { timeout: 15_000 }).toBe(1);
  // tới gần điểm vòng, rồi đo mức tổng của hai deck (sau gain của chúng) mỗi 50 ms
  const t0 = await page.evaluate(([C]) => {
    const w = window as unknown as W, a = w.decks.find(d => !d.el.paused)!, b = w.decks.find(d => d !== a)!;
    const ctx = (a.g as GainNode).context as AudioContext, an = ctx.createAnalyser();
    an.fftSize = 2048;
    for (const d of w.decks) d.g.connect(an);
    a.el.currentTime = C - 3.5;
    const buf = new Float32Array(an.fftSize), lv: NonNullable<W['lv']> = (w.lv = []), start = performance.now();
    const iv = setInterval(() => {
      an.getFloatTimeDomainData(buf);
      let e = 0; for (const x of buf) e += x * x;
      lv.push({ t: performance.now() - start, db: 10 * Math.log10(e / buf.length + 1e-12), a: a.el.currentTime, b: b.el.currentTime, pa: a.el.paused, pb: b.el.paused });
      if (performance.now() - start > (3.5 + 4 + 4) * 1000) clearInterval(iv);
    }, 50);
    return a.el.currentTime;
  }, [C]);
  expect(t0).toBeGreaterThan(C - 4);
  await page.waitForTimeout((3.5 + XF + 4.5) * 1000);
  const lv = await page.evaluate(() => (window as unknown as W).lv!);
  // deck kia đã nhận: đang chạy từ điểm bắt đầu vòng, deck cũ đã dừng sau lần chuyển
  const last = lv[lv.length - 1];
  expect(last.pa).toBe(true);
  expect(last.pb).toBe(false);
  expect(last.b).toBeGreaterThan(L + XF);
  expect(last.b).toBeLessThan(L + XF + 6);
  await expect.poll(() => musicLine(page), { timeout: 4000 }).toMatch(/nối vòng 1/);
  // mức qua mối nối (cửa sổ 0,4 s): không hụt quá 6 dB so với mức trước mối nối; kiểu cũ (mờ dần về im lặng rồi phát lại từ
  // đầu bài) hụt tới −40…−90 dB
  const iC = lv.findIndex(x => x.a >= C), n = Math.round(XF / 0.05);
  const win = (i: number) => 10 * Math.log10(lv.slice(i, i + 8).reduce((s, x) => s + Math.pow(10, x.db / 10), 0) / 8);
  expect(iC).toBeGreaterThan(30);
  expect(lv.length).toBeGreaterThan(iC + n + 8);
  const before = Array.from({ length: iC - 10 - Math.max(0, iC - 60) }, (_, k) => win(Math.max(0, iC - 60) + k)).sort((p, q) => p - q);
  const ref = before[before.length >> 1], seam = Array.from({ length: n }, (_, k) => win(iC - 4 + k));
  expect(Math.min(...seam) - ref).toBeGreaterThan(-6);
  expect(errors).toEqual([]);
});

test('the ending plays the elegiac finale for a family that lost its homeland, and Heroic Age for the others', async ({ page }) => {
  const st = { step: 'play', name: 'Họ Trần', year: 2026, picks: { e1: 'chien', e2: 'canvuong', e3: 'qdd', e4: 'qg', e5: 'nam', e6: 'radi' }, quiz: { e6: [true, true] }, narr: false, sound: true, music: true };
  const errors = await boot(page, st);
  await page.locator('#card [data-a=end].c').click();
  await expect(page.locator('#layer .end-title')).toHaveText('Bên kia đại dương');
  await expect.poll(() => page.evaluate(() => (window as unknown as W).music.slice(-1)[0]), { timeout: 10_000 }).toBe(LOOPS.tracks.elegy.file);
  // the journey film keeps the ending's track
  await page.getByRole('button', { name: /Xem phim hành trình/ }).click();
  await page.waitForTimeout(1500);
  expect(await page.evaluate(() => (window as unknown as W).music.slice(-1)[0])).toBe(LOOPS.tracks.elegy.file);
  // another family, another ending: Heroic Age
  await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('dudo-v2')!); s.picks = { e1: 'chien', e2: 'canvuong', e3: 'cs', e4: 'vm', e5: 'bac', e6: 'doimoi' }; localStorage.setItem('dudo-v2', JSON.stringify(s)); });
  await page.reload();
  await page.locator('#card [data-a=end].c').click();
  await expect(page.locator('#layer .end-title')).not.toHaveText('Bên kia đại dương');
  await expect.poll(() => page.evaluate(() => (window as unknown as W).music.slice(-1)[0]), { timeout: 10_000 }).toBe(LOOPS.tracks.finale.file);
  expect(errors).toEqual([]);
});
