import { test, expect, type Page } from '@playwright/test';

/* Ảnh tư liệu của trang sự kiện với Wikipedia / Commons giả lập (không mạng thật, không qua máy chủ trung gian nào): bài
   viết và danh sách ảnh dựng tay, ảnh vẽ bằng canvas với ba dáng (dọc 2:3, ngang 3:1, vuông). `net.mode` đổi giữa chừng:
   'ok' trả bài và ảnh, 'down' cắt mạng (như iPad mất sóng), 'missing' trả "không có bài". */

const midGame = { step: 'play', name: 'Họ Lê', year: 1954, filt: 'Trận đánh', picks: { e1: 'chien', e2: 'duytan', e3: 'cs', e4: 'vm', e5: 'nam' }, quiz: { e1: [true, true], e2: [true, false], e3: [true, true], e4: [false, true] } };
const SHAPES = { Tall: [600, 900], Wide: [1200, 400], Square: [600, 600] } as const;
type Shape = keyof typeof SHAPES;
const cors = { 'access-control-allow-origin': '*' };
const thumb = (f: string, w: number) => `//upload.wikimedia.org/wikipedia/commons/thumb/a/ab/${f}.png/${w}px-${f}.png`;

async function boot(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(m.text()); });
  const net = { mode: 'ok' as 'ok' | 'down' | 'missing', lead: 'Tall' as Shape, api: 0, imgs: {} as Record<string, Buffer>, delay: 0, log: [] as string[] };
  await page.route(/wikipedia\.org|wikimedia\.org/, async r => {
    const u = r.request().url();
    if (net.delay) await new Promise(res => setTimeout(res, net.delay));
    net.log.push(`${net.mode} ${decodeURIComponent(u)}`);
    if (net.mode === 'down') return r.abort('internetdisconnected');
    if (/\/w\/api\.php/.test(u)) {
      net.api++;
      if (net.mode === 'missing') return r.fulfill({ headers: cors, json: { query: { pages: { '-1': { title: 'x', missing: '' } } } } });
      return r.fulfill({ headers: cors, json: { query: { pages: { 7: { title: 'Bài thử', fullurl: 'https://vi.wikipedia.org/wiki/B%C3%A0i_th%E1%BB%AD', extract: 'Đoạn mở đầu của bài thử.', pageimage: net.lead + '.png', thumbnail: { source: 'https:' + thumb(net.lead, 960) }, langlinks: [{ '*': 'Test article' }] } } } } });
    }
    if (/rest_v1\/page\/media-list/.test(u)) {
      const order = [net.lead, ...(Object.keys(SHAPES) as Shape[]).filter(s => s !== net.lead)];
      return r.fulfill({ headers: cors, json: { items: order.map(f => ({ type: 'image', title: `File:${f}.png`, caption: { text: `Ảnh ${f}` }, srcset: [{ src: thumb(f, 320), scale: '1x' }, { src: thumb(f, 960), scale: '2x' }] })) } });
    }
    const f = u.match(/px-(Tall|Wide|Square)\.png$/)?.[1];
    if (f && net.imgs[f]) return r.fulfill({ contentType: 'image/png', body: net.imgs[f] });
    return r.abort();
  });
  await page.addInitScript(s => { if (!localStorage.getItem('dudo-v2')) localStorage.setItem('dudo-v2', s); }, JSON.stringify(midGame));
  await page.goto('/');
  await page.waitForSelector('#map text[data-city]');
  // ảnh vẽ sẵn: nền giấy, một khối sẫm ở giữa
  for (const [f, [w, h]] of Object.entries(SHAPES)) {
    net.imgs[f] = Buffer.from(await page.evaluate(([w, h]) => {
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      const x = c.getContext('2d')!; x.fillStyle = '#8a7a60'; x.fillRect(0, 0, w, h); x.fillStyle = '#2a2018'; x.fillRect(w / 4, h / 4, w / 2, h / 2);
      return c.toDataURL('image/png').split(',')[1];
    }, [w, h]), 'base64');
  }
  return { errors, net };
}

/** Mở trang sự kiện đang chọn trên bản đồ (lọc Trận đánh: Điện Biên Phủ); trả id của nó. */
async function openFocused(page: Page): Promise<string> {
  await page.locator('#card .c').click();
  const slot = page.locator('.ov.evp .hero image-slot');
  await expect(slot).toBeAttached();
  return (await slot.getAttribute('id'))!.slice(3);
}
/** Mở trang một sự kiện tìm được trong Sử liệu (không dấu vẫn khớp). */
async function openSearch(page: Page, q: string) {
  if (!(await page.locator('#sq').isVisible())) await page.locator('.tab[data-t=src]').click();
  await page.locator('#sq').fill(q);
  await page.locator('#sl .src[data-a=ev]').first().click();
  await expect(page.locator('.ov.evp .hero image-slot')).toBeAttached();
}
const closePage = async (page: Page) => { await page.locator('.ov.evp [data-a=close]').click(); await expect(page.locator('.ov.evp')).toHaveCount(0); };
const hero = (page: Page) => page.locator('.ov.evp .hero image-slot');

test('event photos: the hero frames a tall print whole, the strip loads every tile, the viewer pages and closes on Escape', async ({ page }) => {
  const { errors, net } = await boot(page);
  await openFocused(page);
  await expect(hero(page)).toHaveAttribute('data-filled', '', { timeout: 10_000 });
  // a tall (2:3) lead photo is shown whole, not cropped to the frame's landscape shape
  await expect(page.locator('.ov.evp .hero')).toHaveClass(/\btall\b/);
  expect(await hero(page).getAttribute('focus')).toContain('object-fit:contain');
  await expect(page.locator('#hcap-' + (await hero(page).getAttribute('id'))!.slice(3))).toContainText('Wikimedia Commons');
  // the strip under the story: three tiles, each lazily loaded image actually arrives (a clipped strip once stopped them)
  const tiles = page.locator('#mstrip .mstrip button');
  await expect(tiles).toHaveCount(3);
  await expect(page.locator('#mstrip')).toContainText('Tư liệu hình ảnh · 3');
  for (let i = 0; i < 3; i++) {
    await tiles.nth(i).scrollIntoViewIfNeeded();
    await expect(tiles.nth(i)).toHaveClass(/\bin\b/, { timeout: 8000 });
  }
  // the viewer opens on the tapped tile, pages with the arrow keys, and Escape closes only the viewer
  await tiles.nth(1).click();
  const lb = page.locator('.lb');
  await expect(lb).toBeVisible();
  await expect(lb.locator('[data-r=n]')).toHaveText('2 / 3');
  await expect(lb.locator('[data-r=cap]')).toHaveText('Ảnh Wide');
  await page.keyboard.press('ArrowRight');
  await expect(lb.locator('[data-r=n]')).toHaveText('3 / 3');
  await expect(lb.locator('.lbtrack img')).toHaveJSProperty('complete', true);
  expect(await lb.locator('.lbtrack img').evaluate(i => (i as HTMLImageElement).naturalWidth)).toBe(600);
  await page.keyboard.press('Escape');
  await expect(page.locator('.lb')).toHaveCount(0);
  await expect(page.locator('.ov.evp')).toBeVisible();
  // the zoom button opens the viewer on the hero photo
  await page.locator('#hzoom').click();
  await expect(page.locator('.lb [data-r=n]')).toHaveText('1 / 3');
  await page.keyboard.press('Escape');
  await closePage(page);
  // a wide lead photo fills the frame (cropped by design), no contain
  net.lead = 'Wide';
  await openSearch(page, 'yen bai');
  await expect(hero(page)).toHaveAttribute('data-filled', '', { timeout: 10_000 });
  await expect(page.locator('.ov.evp .hero')).not.toHaveClass(/\btall\b/);
  expect(await hero(page).getAttribute('focus')).toBeNull();
  expect(errors).toEqual([]);
});

test('event photos: a page opened offline says the photos could not load, retries after a short wait, when the network returns, or on Thử lại', async ({ page }) => {
  const { errors, net } = await boot(page);
  net.mode = 'down';
  const id = await openFocused(page);
  await expect(hero(page)).toHaveAttribute('placeholder', 'Chưa tải được ảnh · thử lại sau', { timeout: 15_000 });
  await expect(page.locator('#hzoom')).toBeHidden(); // nothing to enlarge
  await page.locator('#et').getByRole('tab', { name: 'Ảnh, phim' }).click();
  await expect(page.getByText(/Chưa tải được bài Wikipedia và ảnh tư liệu/)).toBeVisible();
  await expect(page.getByText('Chưa tìm thấy bài Wikipedia phù hợp.')).toHaveCount(0);
  await closePage(page);
  // the network is back, but the failure is still fresh: reopening right away does not hammer the API
  net.mode = 'ok';
  const before = net.api;
  await openFocused(page);
  await expect(hero(page)).toHaveAttribute('placeholder', 'Chưa tải được ảnh · thử lại sau');
  expect(net.api).toBe(before);
  await closePage(page);
  // a minute later the same page loads its photos
  await page.evaluate(() => { const now = Date.now.bind(Date); Date.now = () => now() + 60_000; });
  expect(await openFocused(page)).toBe(id);
  await expect(hero(page)).toHaveAttribute('data-filled', '', { timeout: 10_000 });
  await expect(page.locator('#mstrip .mstrip button')).toHaveCount(3);
  expect(net.api).toBeGreaterThan(before);
  await closePage(page);

  // another event, offline: the network coming back (the 'online' event) fills the open page without reopening it
  net.mode = 'down';
  await openSearch(page, 'yen bai');
  await expect(hero(page)).toHaveAttribute('placeholder', 'Chưa tải được ảnh · thử lại sau', { timeout: 15_000 });
  net.mode = 'ok';
  await page.evaluate(() => dispatchEvent(new Event('online')));
  await expect(hero(page)).toHaveAttribute('data-filled', '', { timeout: 10_000 });
  await expect(page.locator('#mstrip .mstrip button')).toHaveCount(3);
  await closePage(page);

  // and a third, offline, on the media tab: Thử lại fetches at once
  net.mode = 'down';
  await openSearch(page, 'dong kinh');
  await page.locator('#et').getByRole('tab', { name: 'Ảnh, phim' }).click();
  const retry = page.locator('#eb [data-a=wretry]');
  await expect(retry).toBeVisible({ timeout: 15_000 });
  net.mode = 'ok';
  await retry.click();
  await expect(page.locator('#eb .pv h3')).toHaveText('Bài thử');
  await expect(page.locator('#mgrid button')).toHaveCount(3);
  await expect(hero(page)).toHaveAttribute('data-filled', '', { timeout: 10_000 });
  expect(errors).toEqual([]);
});

test('event photos: an event with no Wikipedia article says so, not that the network failed', async ({ page }) => {
  const { errors, net } = await boot(page);
  net.mode = 'missing';
  await openFocused(page);
  await expect(hero(page)).toHaveAttribute('placeholder', 'Ảnh tư liệu chưa có', { timeout: 15_000 });
  await expect(page.locator('#mstrip')).toBeEmpty();
  await page.locator('#et').getByRole('tab', { name: 'Ảnh, phim' }).click();
  await expect(page.getByText('Chưa tìm thấy bài Wikipedia phù hợp.')).toBeVisible();
  await expect(page.locator('#eb [data-a=wretry]')).toHaveCount(0);
  // the film archives are still offered
  await expect(page.locator('#eb a.src')).not.toHaveCount(0);
  expect(errors).toEqual([]);
});

/* Màn mở chương 2 (Đọc sử, chương 1 đang kể): ảnh của nó tải sẵn lúc tour chương 1 bắt đầu. Lần ấy hỏng vì mất mạng thì
   ảnh phải được tải lại trước khi tới màn mở chương (ở đó chỉ chờ 0,3 s): ngay khi máy có mạng lại, hay ở bước tour sau
   khi lần hỏng đã hết hạn (mạng chập chờn mà máy không báo mất mạng). Mỗi lần hỏi mạng chậm 0,4 s như mạng thật. */
for (const back of ['the online event', 'a later tour step once the failure has expired'])
  test(`chapter opener: a photo that failed at tour start is fetched again on ${back}, and the opener shows it`, async ({ page }) => {
    test.setTimeout(90_000);
    await page.addInitScript(s => { if (!localStorage.getItem('dudo-v2')) localStorage.setItem('dudo-v2', s); },
      JSON.stringify({ step: 'play', name: 'Họ Lê', mode: 'read', year: 1860, picks: { e1: 'chien' }, quiz: { e1: [true, true] }, narr: false, music: false, sound: false }));
    const { errors, net } = await boot(page);
    net.lead = 'Wide';
    net.delay = 400;
    // bài của sự kiện đại diện chương 2 (Kinh thành Huế 1885), và ảnh cỡ lớn chỉ màn mở chương xin (cảnh tour dùng ảnh nhỏ)
    const era2 = (m: string) => net.log.filter(l => l.startsWith(m) && l.includes('api.php') && l.includes('Trận Kinh thành Huế 1885')).length;
    const print = () => net.log.filter(l => l.startsWith('ok') && /\/(960|1280|1920)px-Wide\.png$/.test(l)).length;
    net.mode = 'down';
    await page.locator('#play').click();
    await expect(page.locator('#tourb')).toBeVisible();
    await expect.poll(() => era2('down'), { timeout: 10_000 }).toBeGreaterThan(0);
    await page.waitForTimeout(300);
    net.mode = 'ok';
    if (back === 'the online event') await page.evaluate(() => dispatchEvent(new Event('online')));
    else await page.evaluate(() => { const now = Date.now.bind(Date); Date.now = () => now() + 60_000; });
    // tải lại ngay (không đợi tới màn mở chương), lúc tour chương 1 còn đang chạy
    await expect.poll(print, { timeout: 20_000 }).toBeGreaterThan(0);
    await expect(page.locator('#tourb')).toBeVisible();
    expect(await page.locator('.cine.op').count()).toBe(0);
    await page.waitForTimeout(600); // giải mã ảnh
    const skip = page.locator('#tourb [data-t=skip]');
    await skip.click();
    await expect(skip).toContainText('Bỏ');
    await skip.click();
    await expect(page.locator('.cine.op')).toBeAttached({ timeout: 10_000 });
    await expect(page.locator('.cine.op .pic img')).toHaveCount(1);
    expect(errors).toEqual([]);
  });
