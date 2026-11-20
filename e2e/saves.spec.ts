import { test, expect, devices, type Page, type Route } from '@playwright/test';
import { readFileSync } from 'node:fs';

/* Bản lưu không bao giờ làm chết ứng dụng (iPad Pro 11, cả Chromium lẫn WebKit):
   - bản lưu hỏng từng trường (null, sai kiểu, phiên bản lạ) được sửa từng trường, ván vẫn mở, bản gốc được cất một bản sao;
   - bản lưu không đọc được (JSON cụt, không phải đối tượng), mã ứng dụng hỏng lúc nạp, tải không được, hay bản đồ chính
     không vẽ được: màn khôi phục (Thử lại · Sao chép bản lưu hỏng · Bắt đầu lại), bản sao được cất trước;
   - bản lưu thật ghi bởi bản 6f464aa (trước khi có số phiên bản) mở ra y như cũ. */

const { defaultBrowserType: _webkit, ...ipad } = devices['iPad Pro 11'];
test.use(ipad);

const midGame = { step: 'play', name: 'Họ Lê', year: 1954, picks: { e1: 'chien', e2: 'duytan', e3: 'cs', e4: 'vm', e5: 'nam' }, quiz: { e1: [true, true], e2: [true, false], e3: [true, true], e4: [false, true] } };
const midPlay = { ...midGame, mode: 'play', home: 'hue', year: 1885, picks: { e1: 'chien', e2: 'duytan' }, quiz: { e1: [true, true] }, harvests: ['e1'], cards: { dn58: 0, nt62: 1 }, res: { g: 44, d: 38, b: 31, u: 22 } };
type Kept = { n: number; t: string; key: string; why: string; raw: string | null };

/** Đặt bản lưu một lần (lần tải lại sau không đặt lại), chặn Wikipedia, gom lỗi trang. */
async function seed(page: Page, items: Record<string, string>) {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.route(/wikipedia\.org|wikimedia\.org/, r => r.abort());
  await page.addInitScript(items => {
    if (sessionStorage.getItem('seeded')) return;
    for (const [k, v] of Object.entries(items)) localStorage.setItem(k, v);
    sessionStorage.setItem('seeded', '1');
  }, items);
  // "Sao chép": giữ chữ đã chép để đọc lại (WebKit chạy thử không cho đọc bộ nhớ tạm)
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: (t: string) => { (window as unknown as { copied: string }).copied = t; return Promise.resolve(); } } });
  });
  return errors;
}
const kept = (page: Page) => page.evaluate(() => Object.keys(localStorage).filter(k => /^dudo-save-broken-\d+$/.test(k)).sort().map(k => ({ ...JSON.parse(localStorage.getItem(k)!), n: +k.split('-').pop()! }) as Kept));
const stored = (page: Page, key: string) => page.evaluate(k => localStorage.getItem(k), key);
const errlog = (page: Page) => page.evaluate(() => (JSON.parse(localStorage.getItem('dudo-errlog') || '[]') as { m: string }[]).map(r => r.m).join('\n'));
/** Ứng dụng mở được: bản đồ đã vẽ, không có màn khôi phục. */
async function alive(page: Page) {
  await page.waitForSelector('#map text[data-city]', { timeout: 15_000 });
  expect(await page.locator('#map path').count()).toBeGreaterThan(100);
  await expect(page.locator('#rescue')).toHaveCount(0);
}
/** Bản lưu đã được ghi lại bằng mã mới (có số phiên bản): ứng dụng tự lưu lúc mở (thẻ còn nợ, năm của chương); không thì
    lưu bằng một thao tác vô hại: chọn lại phong cách đang dùng (Hồ sơ). */
/** Phiên bản bản lưu hiện nay (src/state.ts SAVE_V): 2 từ khi kết cục đã đọc được giữ lại (endFix). */
const SAVE_V = 2;
async function savedAgain(page: Page, key: string) {
  const v = async () => JSON.parse((await stored(page, key)) || '{}').v;
  if ((await v()) !== SAVE_V && !(await page.locator('#main').evaluate(m => (m as HTMLElement).inert))) {
    await page.locator('.tab[data-t=me]').click();
    await page.locator('.thc.on').first().click();
    await page.locator('.tab[data-t=map]').click();
  }
  await expect.poll(v).toBe(SAVE_V);
  return JSON.parse((await stored(page, key))!);
}

const DAMAGED: { name: string; key: 'dudo-v2' | 'dudo-v2-play'; save: object; fixed: string; check: (page: Page) => Promise<void> }[] = [
  { name: 'picks: null', key: 'dudo-v2', save: { ...midGame, picks: null }, fixed: 'picks', check: async page => { await expect(page.locator('#yr')).toHaveText('1954'); } },
  { name: 'seen: null', key: 'dudo-v2', save: { ...midGame, seen: null }, fixed: 'seen', check: async page => { await expect(page.locator('#eraR')).toBeVisible(); } },
  { name: 'year: "1954" (a string)', key: 'dudo-v2', save: { ...midGame, year: '1954' }, fixed: 'year', check: async page => { await expect(page.locator('#yr')).toHaveText('1954'); } },
  { name: 'quiz, tourAt and theme of the wrong type', key: 'dudo-v2', save: { ...midGame, quiz: { e1: 'x' }, tourAt: 5, theme: 7 }, fixed: 'quiz', check: async page => { await expect(page.locator('html')).toHaveAttribute('data-theme', 'archive'); } },
  { name: 'play: cards: "x"', key: 'dudo-v2-play', save: { ...midPlay, cards: 'x' }, fixed: 'cards', check: async page => { await expect(page.locator('#res')).toBeVisible(); } },
  { name: 'play: res null, rel a number, names a string', key: 'dudo-v2-play', save: { ...midPlay, res: null, rel: 5, names: 'x' }, fixed: 'res', check: async page => { await expect(page.locator('#res')).toContainText('50'); } },
];

test.describe('damaged saves are repaired field by field', () => {
  for (const c of DAMAGED) {
    test(c.name, async ({ page }) => {
      const raw = JSON.stringify(c.save);
      const errors = await seed(page, { [c.key]: raw, 'dudo-mode': c.key === 'dudo-v2-play' ? 'play' : 'read' });
      await page.goto('/');
      await alive(page);
      await c.check(page);
      // the damaged original is kept, word for word, before anything overwrites it
      const k = await kept(page);
      expect(k).toHaveLength(1);
      expect(k[0]).toMatchObject({ n: 1, key: c.key, raw });
      expect(k[0].why).toContain(c.fixed);
      await expect.poll(() => errlog(page)).toContain(`Bản lưu ${c.key}: đã sửa`);
      // the repaired save is written back with a version; the next start opens it without repairing again
      await savedAgain(page, c.key);
      await page.reload();
      await alive(page);
      expect(await kept(page)).toHaveLength(1);
      expect(errors).toEqual([]);
    });
  }

  test('a save from a newer app version opens, keeps its version and unknown fields, and is copied once', async ({ page }) => {
    const raw = JSON.stringify({ ...midGame, v: 99, later: { x: 1 } });
    const errors = await seed(page, { 'dudo-v2': raw });
    await page.goto('/');
    await alive(page);
    await expect(page.locator('#yr')).toHaveText('1954');
    expect((await kept(page))[0]).toMatchObject({ raw, why: expect.stringContaining('99') });
    await page.locator('.tab[data-t=me]').click();
    await page.locator('.thc[data-v=night]').click(); // a real change, so the save is written again
    await page.locator('.tab[data-t=map]').click();
    await expect.poll(async () => JSON.parse((await stored(page, 'dudo-v2'))!).theme).toBe('night');
    expect(JSON.parse((await stored(page, 'dudo-v2'))!)).toMatchObject({ v: 99, later: { x: 1 }, year: 1954, picks: midGame.picks });
    await page.reload();
    await alive(page);
    expect(await kept(page)).toHaveLength(1);
    expect(errors).toEqual([]);
  });

  test('the debug panel shows the save version and copies the kept original', async ({ page }) => {
    const raw = JSON.stringify({ ...midGame, picks: null });
    await seed(page, { 'dudo-v2': raw });
    await page.goto('/?debug');
    await alive(page);
    const dbg = page.locator('#dbg');
    await expect(dbg.locator('pre')).toContainText(`Bản lưu: phiên bản ${SAVE_V} · bản sao hỏng đã cất: 1`);
    await expect(dbg.locator('pre')).toContainText('đã sửa picks');
    await dbg.getByRole('button', { name: 'Sao chép bản lưu hỏng' }).click();
    await expect(dbg.getByRole('button', { name: 'Đã sao chép' })).toBeVisible();
    expect(await page.evaluate(() => (window as unknown as { copied: string }).copied)).toContain(raw);
  });
});

test.describe('the recovery screen', () => {
  for (const [name, raw] of [['truncated JSON', JSON.stringify(midGame).slice(0, 60)], ['not an object', '[1,2]']] as const) {
    test(`an unreadable save (${name}) offers Thử lại, a copy and Bắt đầu lại, and keeps the other mode's save`, async ({ page }) => {
      const play = JSON.stringify({ ...midPlay, v: 1 });
      const errors = await seed(page, { 'dudo-v2': raw, 'dudo-v2-play': play, 'dudo-mode': 'read' });
      await page.goto('/');
      const box = page.locator('#rescue');
      await expect(box).toBeVisible();
      await expect(box.getByRole('heading')).toHaveText('Bản lưu bị hỏng');
      await expect(page.locator('#app')).toHaveJSProperty('inert', true);
      await expect(box.getByRole('button', { name: 'Thử lại' })).toBeFocused();
      expect(await kept(page)).toMatchObject([{ n: 1, key: 'dudo-v2', raw }]);
      expect(await stored(page, 'dudo-v2')).toBe(raw); // nothing overwritten
      expect(errors.join()).toContain('không đọc được');
      // the copy is plain text to paste into a message: why, and the save itself
      await box.getByRole('button', { name: 'Sao chép bản lưu hỏng' }).click();
      await expect(box.getByRole('button', { name: 'Đã sao chép' })).toBeVisible();
      const copied = await page.evaluate(() => (window as unknown as { copied: string }).copied);
      expect(copied).toContain('bản lưu không đọc được');
      expect(copied).toContain(raw);
      // Thử lại reloads; the save is still unreadable, so the screen comes back, without a second copy
      const reloaded = page.waitForEvent('load'); // the reload starts a moment after the tap (service worker check)
      await box.getByRole('button', { name: 'Thử lại' }).click();
      await reloaded;
      await expect(page.locator('#rescue')).toBeVisible();
      expect(await kept(page)).toHaveLength(1);
      // Bắt đầu lại asks first; Thôi keeps everything
      await page.locator('#rescue').getByRole('button', { name: 'Bắt đầu lại' }).click();
      await expect(page.locator('#rescue')).toContainText('Xoá ván đang lưu và bắt đầu từ đầu?');
      await page.locator('#rescue').getByRole('button', { name: 'Thôi' }).click();
      await expect(page.locator('#rescue [data-r=wipe]')).toHaveCount(0);
      expect(await stored(page, 'dudo-v2')).toBe(raw);
      await page.locator('#rescue').getByRole('button', { name: 'Bắt đầu lại' }).click();
      const fresh = page.waitForEvent('load');
      await page.locator('#rescue').getByRole('button', { name: 'Xoá và bắt đầu lại' }).click();
      await fresh;
      // a fresh reading game: the cover, the copy still kept, the play save untouched
      await expect(page.getByRole('button', { name: /Mở hồ sơ/ })).toBeVisible({ timeout: 15_000 });
      await expect(page.locator('#rescue')).toHaveCount(0);
      expect(await kept(page)).toMatchObject([{ n: 1, raw }]);
      expect(await stored(page, 'dudo-v2-play')).toBe(play);
    });
  }

  test('the app code throwing while it loads shows the recovery screen; Thử lại opens the same game once the fault is gone', async ({ page }) => {
    const save = JSON.stringify({ ...midGame, v: 1 });
    const errors = await seed(page, { 'dudo-v2': save });
    // a fault at import time (as a bad save once made `S = load()` throw): matchMedia throws while the modules load
    await page.addInitScript(() => {
      if (!sessionStorage.getItem('fixed')) window.matchMedia = () => { throw new Error('lỗi thử lúc nạp'); };
    });
    await page.goto('/');
    const box = page.locator('#rescue');
    await expect(box).toBeVisible({ timeout: 10_000 });
    await expect(box.getByRole('heading')).toHaveText('Dư Đồ chưa mở được');
    expect(errors.join()).toContain('lỗi thử lúc nạp');
    expect(await kept(page)).toMatchObject([{ n: 1, key: 'dudo-v2', raw: save }]);
    await box.getByRole('button', { name: 'Sao chép bản lưu hỏng' }).click();
    expect(await page.evaluate(() => (window as unknown as { copied: string }).copied)).toContain('lỗi thử lúc nạp');
    await page.evaluate(() => sessionStorage.setItem('fixed', '1'));
    await box.getByRole('button', { name: 'Thử lại' }).click();
    await alive(page);
    await expect(page.locator('#yr')).toHaveText('1954');
    expect(await stored(page, 'dudo-v2')).toBe(save);
    await expect.poll(() => errlog(page)).toContain('Màn khôi phục: ứng dụng không mở được');
  });

  test('the app code failing to download leaves no blank screen; Thử lại opens the game once it downloads', async ({ page }) => {
    const save = JSON.stringify({ ...midGame, v: 1 });
    await seed(page, { 'dudo-v2': save });
    const entry = /\/assets\/index-[\w-]+\.js$/;
    await page.route(entry, r => r.abort());
    await page.goto('/');
    await expect(page.locator('#rescue')).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('#rescue h1')).toHaveText('Dư Đồ chưa mở được');
    await page.unroute(entry);
    await page.locator('#rescue').getByRole('button', { name: 'Thử lại' }).click();
    await alive(page);
    await expect(page.locator('#yr')).toHaveText('1954');
  });

  test('on a first visit with no save, the recovery screen speaks of no copy and offers nothing to wipe', async ({ page }) => {
    await seed(page, {});
    await page.route(/\/assets\/index-[\w-]+\.js$/, r => r.abort());
    await page.goto('/');
    const box = page.locator('#rescue');
    await expect(box).toBeVisible({ timeout: 10_000 });
    await expect(box.locator('#rescue-p')).toHaveText('Lần mở này gặp trục trặc. Hãy thử lại sau giây lát.');
    await expect(box.getByRole('button', { name: 'Bắt đầu lại' })).toHaveCount(0);
    await box.getByRole('button', { name: 'Sao chép báo cáo lỗi' }).click();
    expect(await page.evaluate(() => (window as unknown as { copied: string }).copied)).toContain('mã ứng dụng chưa chạy');
    expect(await kept(page)).toEqual([]);
  });

  test('with storage full, the screen promises no copy it could not keep; Bắt đầu lại says the game will be lost, then keeps a copy in the space it frees', async ({ page }) => {
    // a big unreadable play save (no copy fits beside it), and the origin's storage filled up to a small gap
    const raw = JSON.stringify({ ...midPlay, name: 'Họ Lê ' + 'x'.repeat(6000) }).slice(0, -20);
    const errors = await seed(page, { 'dudo-v2-play': raw, 'dudo-mode': 'play' });
    await page.addInitScript(() => {
      if (sessionStorage.getItem('filled')) return;
      sessionStorage.setItem('filled', '1');
      localStorage.setItem('gap', 'g'.repeat(2000));
      let chunk = 'y'.repeat(1 << 20), i = 0;
      while (chunk.length > 8) { try { localStorage.setItem('filler-' + i++, chunk); } catch { chunk = chunk.slice(0, chunk.length >> 1); } }
      localStorage.removeItem('gap');
    });
    await page.goto('/');
    const box = page.locator('#rescue');
    await expect(box.getByRole('heading')).toHaveText('Bản lưu bị hỏng');
    expect(await kept(page)).toEqual([]);
    await expect(box.locator('#rescue-p')).toHaveText('Bản lưu trên máy này không đọc được nên ván của bạn chưa mở ra được. Dư Đồ chưa xoá gì cả, nhưng chỗ lưu của Dư Đồ trên máy đã đầy nên chưa cất được bản sao. Muốn giữ ván này, hãy bấm Sao chép bản lưu hỏng rồi dán vào một ghi chú hay tin nhắn.');
    await expect(box.locator('.note')).toContainText('Chưa cất được bản sao nào, nên Bắt đầu lại sẽ xoá hẳn ván đang lưu');
    await box.getByRole('button', { name: 'Sao chép bản lưu hỏng' }).click();
    expect(await page.evaluate(() => (window as unknown as { copied: string }).copied)).toContain(raw);
    // the question says the game will be lost, not that a copy is kept
    await box.getByRole('button', { name: 'Bắt đầu lại' }).click();
    await expect(page.locator('#rescue-q')).toHaveText('Xoá ván đang lưu và bắt đầu từ đầu? Chỗ lưu đã đầy nên chưa cất được bản sao: nếu chưa chép bản lưu hỏng ra, ván này sẽ mất hẳn.');
    expect(await stored(page, 'dudo-v2-play')).toBe(raw);
    const fresh = page.waitForEvent('load');
    await box.getByRole('button', { name: 'Xoá và bắt đầu lại' }).click();
    await fresh;
    await expect(page.getByRole('button', { name: /Mở hồ sơ/ })).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('#rescue')).toHaveCount(0);
    // the old save, removed from its slot, went into the space it left
    expect(await stored(page, 'dudo-v2-play')).not.toBe(raw);
    expect(await kept(page)).toMatchObject([{ n: 1, key: 'dudo-v2-play', why: 'trước khi bắt đầu lại', raw }]);
    expect(errors.join()).toContain('không đọc được');
  });

  test('a main map that never draws brings up the recovery screen after a while, and it goes away if the map draws after all', async ({ page }) => {
    test.setTimeout(90_000);
    await seed(page, { 'dudo-v2': JSON.stringify({ ...midGame, v: 1 }) });
    const held: { r: Route | null } = { r: null };
    await page.route(/\/assets\/region-50m-[\w-]+\.js$/, r => { held.r = r; }); // the map data never arrives
    await page.goto('/', { waitUntil: 'commit' }); // the held request also holds the page's load event (WebKit)
    await expect(page.locator('#rescue')).toBeVisible({ timeout: 40_000 });
    await expect(page.locator('#rescue h1')).toHaveText('Dư Đồ chưa mở được');
    expect(held.r).not.toBeNull();
    await held.r!.continue();
    await alive(page);
  });
});

test.describe('saves written before versions (6f464aa)', () => {
  const real = JSON.parse(readFileSync('e2e/fixtures/save-6f464aa.json', 'utf8')) as Record<string, Record<string, string>>;
  for (const mode of ['play', 'read'] as const) {
    test(`a real ${mode === 'play' ? 'play-mode' : 'reading'} save opens exactly as before, now numbered`, async ({ page }) => {
      const key = mode === 'play' ? 'dudo-v2-play' : 'dudo-v2', raw = real[mode][key], before = JSON.parse(raw);
      const errors = await seed(page, real[mode]);
      await page.goto('/');
      await alive(page);
      await expect(page.locator('#yr')).toHaveText(String(before.year));
      if (mode === 'play') await expect(page.locator('#res')).toBeVisible();
      expect(await kept(page)).toEqual([]); // nothing to repair, nothing copied
      const after = await savedAgain(page, key);
      delete after.v;
      expect(after).toEqual(before);
      await page.reload();
      await alive(page);
      await expect(page.locator('#yr')).toHaveText(String(before.year));
      expect(errors).toEqual([]);
    });
  }
});
