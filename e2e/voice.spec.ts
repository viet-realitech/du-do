import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

/* Lời thuyết minh thu sẵn (src/voice): kết cục, dòng gia phả theo quê, kết cục ở điểm rẽ của nhà đã di tản, trang nhật ký
   đời thường theo miền, màn Cài đặt. Trình duyệt thử không phát được AAC, nên play() của bản thu được thay bằng một bản
   ghi lại khoá (tên tệp trong assets/) và tốc độ, rồi báo "ended" sau 0,4 s như một bản thu ngắn. */

type Clip = { key: string; rate: number };
const clips = (page: Page) => page.evaluate(() => (window as unknown as { clips: Clip[] }).clips.map(c => c.key));
const lastClip = (page: Page) => page.evaluate(() => { const c = (window as unknown as { clips: Clip[] }).clips; return c[c.length - 1]; });
const count = async (page: Page, key: string) => (await clips(page)).filter(k => k === key).length;

async function stubClips(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as { clips: Clip[] };
    w.clips = [];
    const play = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function (this: HTMLMediaElement) {
      const m = decodeURIComponent(this.src).match(/\/assets\/(.+)-[\w-]{8}\.m4a$/);
      if (!m) return play.call(this);
      w.clips.push({ key: m[1], rate: this.playbackRate });
      setTimeout(() => this.dispatchEvent(new Event('ended')), 400);
      return Promise.resolve();
    };
  });
}

async function boot(page: Page, state: object) {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.route(/wikipedia\.org|wikimedia\.org/, r => r.abort());
  await stubClips(page);
  await page.addInitScript(s => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('dudo-v2', s); sessionStorage.setItem('seeded', '1'); } }, JSON.stringify(state));
  await page.goto('/');
  return errors;
}

/** Trò chơi: bản lưu với mọi thẻ trước `upTo` đã quyết (lựa chọn đầu), như app.spec.ts. */
async function bootPlay(page: Page, st: Record<string, unknown>, upTo: string, key = 'seeded') {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.route(/wikipedia\.org|wikimedia\.org/, r => r.abort());
  await stubClips(page);
  const ids = [...readFileSync('src/data/cards.ts', 'utf8').matchAll(/^  \['(\w+)', '/gm)].map(m => m[1]);
  const cards = { ...Object.fromEntries(ids.slice(0, upTo ? ids.indexOf(upTo) : ids.length).map(id => [id, 0])), ...(st.cards as object || {}) };
  const s = { step: 'play', mode: 'play', cardv: {}, xFrom: 2026, narr: true, sound: false, music: false, shown: [], ...st, cards };
  // một lần cho mỗi khoá: tải lại trang không ghi đè bản lưu; khoá khác thì dựng bản lưu mới trong cùng thẻ
  await page.addInitScript(([x, k]) => { if (!sessionStorage.getItem(k)) { localStorage.setItem('dudo-v2-play', x); localStorage.setItem('dudo-mode', 'play'); sessionStorage.setItem(k, '1'); } }, [JSON.stringify(s), key]);
  await page.goto('/');
  return errors;
}
const live = (page: Page, sel: string) => page.locator(`${sel}:not(.exiting *, .cine.out, .cine.out *)`);
const reformPath = { e1: 'canhtan', e2: 'duytan', e3: 'laphien', e4: 'tl', e5: 'thuba', e6: 'doimoi' };
const quiz6 = { e1: [true, true], e2: [true, true], e3: [true, true], e4: [true, true], e5: [true, true] };

test('ending: the narrator reads the ending once on the first open, "Nghe" replays it, the film\'s last plate speaks it before the surname line', async ({ page }) => {
  const errors = await boot(page, { step: 'play', name: 'Họ Trần', year: 2026, picks: reformPath, quiz: { e6: [true, true] }, narr: true, sound: false, music: false });
  await page.locator('#card [data-a=end].c').click();
  await expect(page.locator('.end-title')).toHaveText('Bốn đời canh tân');
  // the summary line under the title is what the clip reads after the title
  await expect(page.locator('.end-line')).toHaveText('Nhiều đời chọn học hỏi và cải cách; phần lớn đề xuất bị gác lại khi người đề xướng còn sống.');
  await expect.poll(() => count(page, 'end-canhtan-4'), { timeout: 6000 }).toBe(1);
  await page.waitForTimeout(2500);
  expect(await count(page, 'end-canhtan-4')).toBe(1);
  // reopened: no second reading on its own
  await page.locator('.ov.end > .row [data-a=close]').click();
  await page.locator('#card [data-a=end].c').click();
  await expect(page.locator('#layer .end-title')).toHaveText('Bốn đời canh tân'); // #layer: not the closed copy fading out
  await page.waitForTimeout(2800);
  expect(await count(page, 'end-canhtan-4')).toBe(1);
  // "Nghe" reads it again
  await page.locator('#layer [data-a=listen-end]').click();
  await expect.poll(() => count(page, 'end-canhtan-4')).toBe(2);
  // the film: each generation's chronicle line, and the closing plate speaks the ending, then the surname line
  await page.getByRole('button', { name: /Xem phim hành trình/ }).click();
  await expect.poll(() => clips(page), { timeout: 6000 }).toContain('chr-canhtan');
  for (let i = 0; i < 6; i++) await page.keyboard.press('ArrowRight');
  await expect(live(page, '.cine.film .fin h1')).toHaveText('Bốn đời canh tân');
  await expect.poll(async () => (await clips(page)).slice(-2), { timeout: 8000 }).toEqual(['end-canhtan-4', 'epi-tran']);
  expect(errors).toEqual([]);
});

test('ending: with narration off the dossier stays silent until "Nghe" is pressed', async ({ page }) => {
  const errors = await boot(page, { step: 'play', name: 'Họ Trần', year: 2026, picks: { e1: 'chien', e2: 'canvuong', e3: 'cs', e4: 'vm', e5: 'bac', e6: 'baocap' }, quiz: { e6: [true, true] }, narr: false, sound: false, music: false });
  await page.locator('#card [data-a=end].c').click();
  await expect(page.locator('.end-title')).toHaveText('Sổ gạo và công điểm');
  await page.waitForTimeout(2800);
  expect(await clips(page)).toEqual([]);
  await page.locator('#layer [data-a=listen-end]').click();
  await expect.poll(() => clips(page)).toEqual(['end-baocap']);
  expect(errors).toEqual([]);
});

test('play mode: the journey film narrates lines written for the home region (a Huế family: Duy Tân in Trung Kỳ, back home in 1975)', async ({ page }) => {
  const r = (g: number, d: number, b: number, u: number) => ({ g, d, b, u });
  const errors = await bootPlay(page, { name: 'Họ Lê', surname: 'le', home: 'hue', year: 2026, picks: { e1: 'chien', e2: 'duytan', e3: 'cs', e4: 'vm', e5: 'bac', e6: 'doimoi' },
    quiz: { ...quiz6, e6: [true, true] }, cards: { gnv: 1, dc54: 1, sg75: 2, tn80: 1 }, harvests: ['e1', 'e2', 'e3', 'e4', 'e5', 'e6'],
    snap: { e1: r(55, 42, 30, 22), e2: r(50, 44, 35, 30), e3: r(40, 45, 30, 40), e4: r(30, 40, 20, 45), e5: r(45, 46, 40, 50), e6: r(50, 45, 45, 45) }, res: r(50, 45, 45, 45) }, '');
  await page.locator('#card [data-a=end].c').click();
  await expect(page.locator('.end-gp')).toContainText('phong trào Duy Tân ở Trung Kỳ');
  await page.getByRole('button', { name: /Xem phim hành trình/ }).click();
  await page.keyboard.press('ArrowRight');
  await expect(live(page, '.cine.film .scene-s:not(.gone) .plate')).toContainText('Duy Tân ở Trung Kỳ');
  await expect.poll(() => clips(page), { timeout: 6000 }).toContain('chr-duytan-t');
  for (let i = 0; i < 3; i++) await page.keyboard.press('ArrowRight');
  await expect(live(page, '.cine.film .scene-s:not(.gone) .plate')).toContainText('mới về lại Huế');
  await expect.poll(async () => (await clips(page)).some(k => /^chr-bac-s-hue(-hen)?$/.test(k)), { timeout: 6000 }).toBe(true);
  expect(errors).toEqual([]);
});

test('play mode: a family from the South hears its own region — Minh Tân at 1930, the 1954 outcome by home, home-life diary pages of the South', async ({ page }) => {
  // generation 2 followed Duy Tân: the father taught at Đông Kinh Nghĩa Thục, then joined Minh Tân back in Nam Kỳ
  let errors = await bootPlay(page, { name: 'Họ Lê', surname: 'le', home: 'ct', year: 1930, picks: { e1: 'chien', e2: 'duytan' }, quiz: { e1: [true, true], e2: [true, true] }, harvests: ['e1'] }, 'cs30');
  await page.locator('#hv-go').click();
  if (await live(page, '.cine').count()) await page.goBack();
  await expect(live(page, '.scrim .pv.mine')).toContainText('phong trào Minh Tân', { timeout: 8000 });
  expect(errors).toEqual([]);
  // gate 6 for a Cần Thơ family that stayed: the ration-book and currency pages are the South's
  errors = await bootPlay(page, { name: 'Họ Lê', surname: 'le', home: 'ct', year: 1976, picks: { e1: 'chien', e2: 'canvuong', e3: 'cs', e4: 'vm', e5: 'nam' }, cards: { sg75: 2 },
    quiz: quiz6, harvests: ['e1', 'e2', 'e3', 'e4'] }, 'tn76', 'seeded2');
  await page.locator('#hv-go').click();
  if (await live(page, '.cine').count()) await page.goBack();
  // the narrator's gate line (0.4 s here) unlocks the options on its own
  await expect(live(page, '.scrim .opt[data-o=baocap]')).toBeEnabled({ timeout: 8000 });
  await live(page, '.scrim .opt[data-o=baocap]').click();
  await page.locator('#go').click();
  const out = page.locator('#layer > .scrim').last();
  await expect(out.locator('.chron')).toHaveText([/1980\s*Bo bo thay gạo/, /1985\s*Đổi tiền lần thứ ba/]);
  await expect.poll(() => clips(page), { timeout: 6000 }).toContain('out-baocap');
  expect(errors).toEqual([]);
});

test('play mode: turning point 5 speaks the outcome written for the home (Quảng Nam regroups North)', async ({ page }) => {
  const errors = await bootPlay(page, { name: 'Họ Phan', surname: 'phan', home: 'qn', year: 1954, picks: { e1: 'chien', e2: 'canvuong', e3: 'cs', e4: 'vm' },
    quiz: { e1: [true, true], e2: [true, true], e3: [true, true], e4: [true, true] }, harvests: ['e1', 'e2', 'e3'], res: { g: 40, d: 40, b: 40, u: 40 } }, 'dc54');
  await page.locator('#hv-go').click();
  if (await live(page, '.cine').count()) await page.goBack();
  await expect(live(page, '.scrim .opt[data-o=bac]')).toBeEnabled({ timeout: 8000 });
  await live(page, '.scrim .opt[data-o=bac]').click();
  await page.locator('#go').click();
  await expect(page.locator('#layer > .scrim').last()).toContainText('để lại ở Quảng Nam một tấm ảnh');
  await expect.poll(() => clips(page), { timeout: 6000 }).toContain('out-bac-qn');
  expect(errors).toEqual([]);
});

test('play mode: a family that evacuated in 1975 hears gate 6 in the narrator\'s voice, not the device voice', async ({ page }) => {
  const errors = await bootPlay(page, { name: 'Họ Lê', surname: 'le', home: 'ct', year: 1976, picks: { e1: 'chien', e2: 'canvuong', e3: 'cs', e4: 'vm', e5: 'nam' }, cards: { sg75: 0 },
    quiz: quiz6, harvests: ['e1', 'e2', 'e3', 'e4'], res: { g: 40, d: 40, b: 40, u: 40 } }, 'tn76');
  await page.locator('#hv-go').click();
  if (await live(page, '.cine').count()) await page.goBack();
  await expect(page.locator('#layer > .scrim .opt h3')).toHaveText(['Gửi quà nuôi người ở quê', 'Về nước làm ăn', 'Bám rễ nơi xứ người'], { timeout: 8000 });
  await expect(live(page, '.scrim .opt[data-o=baocap]')).toBeEnabled({ timeout: 8000 });
  await live(page, '.scrim .opt[data-o=baocap]').click();
  await page.locator('#go').click();
  await expect(page.locator('#layer > .scrim').last().locator('.chron')).toHaveText([/1981\s*Thùng quà về tới quê/]);
  await expect.poll(() => clips(page), { timeout: 6000 }).toContain('out-xbaocap');
  expect(errors).toEqual([]);
});

test('settings: narration on and the speed buttons play the narrator at that speed; no false "no Vietnamese voice" warning', async ({ page }) => {
  // a device with no Vietnamese system voice (desktop Chrome, Firefox, many Windows PCs)
  await page.addInitScript(() => { if ('speechSynthesis' in window) speechSynthesis.getVoices = () => []; });
  const errors = await boot(page, { step: 'play', name: 'Họ Lê', year: 1885, narr: false, sound: false, music: false });
  await page.locator('#tabs [data-t=me]').click();
  const sw = page.locator('[data-a=set][data-k=narr]');
  await expect(sw).toHaveText('Giọng đọc');
  await sw.click();
  await expect(sw).toHaveAttribute('aria-checked', 'true');
  await expect.poll(() => clips(page)).toEqual(['ui-narr-on']);
  await page.locator('[data-a=rate]', { hasText: 'Chậm' }).click();
  await expect.poll(() => lastClip(page)).toEqual({ key: 'ui-rate', rate: 0.84 });
  await page.locator('[data-a=rate]', { hasText: 'Nhanh' }).click();
  await expect.poll(() => lastClip(page)).toEqual({ key: 'ui-rate', rate: 1.21 });
  await page.waitForTimeout(600);
  await expect(page.locator('.toast', { hasText: 'giọng đọc tiếng Việt' })).toHaveCount(0);
  await expect(page.locator('[data-a=set][data-k=narr]')).toHaveText('Giọng đọc');
  expect(errors).toEqual([]);
});
