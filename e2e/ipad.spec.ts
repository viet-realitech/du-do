import { test, expect, type Page } from '@playwright/test';

/* iPad / Safari safety net. Runs in any browser; the zoomed-map test is the one only WebKit could fail
   (Safari drops a filter whose region passes ~16.8M device pixels, and the land layer vanished with it). */

const STATE = { step: 'play', name: 'Họ Lê', year: 1885, narr: false, sound: false, music: false };

async function boot(page: Page, state: object = STATE) {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.route(/wikipedia\.org|wikimedia\.org/, r => r.abort());
  await page.addInitScript(s => { if (!localStorage.getItem('dudo-v2')) localStorage.setItem('dudo-v2', s); }, JSON.stringify(state));
  await page.goto('/');
  await page.waitForSelector('#map text[data-city]');
  return errors;
}

/** Share of #mapwrap pixels that the land layer (provinces, regimes, neighbours, coast) changes: screenshot as is,
    then with that layer hidden. A land layer that is not drawn changes nothing. */
async function landShare(page: Page): Promise<number> {
  const wrap = page.locator('#mapwrap');
  const r0 = '#map > g > g:first-child';
  const a = await wrap.screenshot({ animations: 'disabled' });
  await page.locator(r0).evaluate(n => { (n as SVGGElement).style.visibility = 'hidden'; });
  const b = await wrap.screenshot({ animations: 'disabled' });
  await page.locator(r0).evaluate(n => { (n as SVGGElement).style.visibility = ''; });
  return page.evaluate(async ([a, b]) => {
    const px = async (s: string) => {
      const i = new Image();
      i.src = 'data:image/png;base64,' + s;
      await i.decode();
      const c = document.createElement('canvas');
      c.width = i.width; c.height = i.height;
      const x = c.getContext('2d')!;
      x.drawImage(i, 0, 0);
      return x.getImageData(0, 0, c.width, c.height).data;
    };
    const p = await px(a), q = await px(b);
    let n = 0;
    for (let i = 0; i < p.length; i += 4) if (Math.abs(p[i] - q[i]) + Math.abs(p[i + 1] - q[i + 1]) + Math.abs(p[i + 2] - q[i + 2]) > 30) n++;
    return n / (p.length / 4);
  }, [a.toString('base64'), b.toString('base64')]);
}

/** Zoom in with the map's + button `n` times and wait until the map has settled (archive wobble back on). */
async function zoomIn(page: Page, n: number) {
  for (let i = 0; i < n; i++) {
    await page.locator('#zin').click();
    await page.waitForTimeout(450);
  }
  await expect(page.locator('#map > g > g:first-child')).toHaveAttribute('filter', 'url(#rough)');
  await page.waitForTimeout(400);
}

test('archive map keeps its land layer when zoomed in (phone)', async ({ page }) => {
  const errors = await boot(page);
  await expect(page.locator('#map > g > g:first-child')).toHaveAttribute('filter', 'url(#rough)'); // the default look: wobble on
  expect(await landShare(page)).toBeGreaterThan(0.15);
  await zoomIn(page, 4); // k ≈ 6.6
  expect(await landShare(page)).toBeGreaterThan(0.15);
  expect(errors).toEqual([]);
});

test.describe('iPad Pro 11 landscape', () => {
  test.use({ viewport: { width: 1194, height: 834 }, deviceScaleFactor: 2 });
  test('archive map keeps its land layer when zoomed in (tablet)', async ({ page }) => {
    const errors = await boot(page);
    expect(await landShare(page)).toBeGreaterThan(0.15);
    await zoomIn(page, 2); // k ≈ 2.6: every tour stop zooms at least this far
    expect(await landShare(page)).toBeGreaterThan(0.15);
    await zoomIn(page, 2); // k ≈ 6.6
    expect(await landShare(page)).toBeGreaterThan(0.15);
    expect(errors).toEqual([]);
  });
});

test.describe('large desktop screen', () => {
  test.use({ viewport: { width: 2560, height: 1440 }, deviceScaleFactor: 2, isMobile: false, hasTouch: false });
  test('archive wobble stays on when zoomed in (the filter region keeps to the view at any zoom)', async ({ page }) => {
    const errors = await boot(page);
    await expect(page.locator('#map > g > g:first-child')).toHaveAttribute('filter', 'url(#rough)');
    await zoomIn(page, 2); // k ≈ 2.6: a margin fixed in map units used to push the region past the cap here
    await zoomIn(page, 2); // k ≈ 6.6
    expect(errors).toEqual([]);
  });
});

test('a narration clip the browser refuses (Safari, no recent tap) keeps its stop; "Chạm để nghe" plays it', async ({ page }) => {
  // the first narration clip is refused as iOS refuses a clip started from a timer; later calls play normally
  await page.addInitScript(() => {
    const play = HTMLMediaElement.prototype.play;
    const w = window as unknown as { clipPlays: number };
    w.clipPlays = 0;
    HTMLMediaElement.prototype.play = function (this: HTMLMediaElement) {
      if (/\/assets\/[^/]+\.m4a/.test(this.src) && !w.clipPlays++) return Promise.reject(new DOMException('not allowed', 'NotAllowedError'));
      return play.call(this);
    };
  });
  const errors = await boot(page, { ...STATE, year: 1858, narr: true, fx: false });
  await page.locator('#play').click();
  const chip = page.locator('#tapvo');
  await expect(chip).toBeVisible({ timeout: 15000 });
  await expect(chip).toHaveText('Chạm để nghe');
  // a refused clip used to end the stop at once (next stop 900 ms later): the stop now keeps its reading time
  await page.waitForTimeout(2500);
  await expect(page.locator('#tourb')).toContainText('1/');
  // above the tour bar with a clear gap (its ring never touches the bar's border)
  const [cb, tb] = [await chip.boundingBox(), await page.locator('#tourb').boundingBox()];
  expect(tb!.y - (cb!.y + cb!.height)).toBeGreaterThanOrEqual(8);
  // a press held like a finger or a trackpad click: the chip stays under the pointer (it used to slide half its width to
  // the right while :active, so the release landed beside it and nothing played)
  await page.mouse.move(cb!.x + cb!.width / 3, cb!.y + cb!.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(200);
  expect(Math.abs((await chip.boundingBox())!.x - cb!.x)).toBeLessThan(4);
  await page.mouse.up();
  await expect(chip).toHaveCount(0);
  expect(await page.evaluate(() => (window as unknown as { clipPlays: number }).clipPlays)).toBe(2);
  // the next stop's clip plays without asking
  await page.locator('#tourb [data-t=next]').click();
  await expect(page.locator('#tourb')).toContainText('2/');
  await expect.poll(() => page.evaluate(() => (window as unknown as { clipPlays: number }).clipPlays), { timeout: 15000 }).toBeGreaterThanOrEqual(3);
  await expect(chip).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('"Chạm để nghe" at a battle stop sits above the scene caption, never over its text', async ({ page }) => {
  await page.addInitScript(() => {
    const play = HTMLMediaElement.prototype.play;
    let n = 0;
    HTMLMediaElement.prototype.play = function (this: HTMLMediaElement) {
      if (/\/assets\/[^/]+\.m4a/.test(this.src) && !n++) return Promise.reject(new DOMException('not allowed', 'NotAllowedError'));
      return play.call(this);
    };
  });
  const errors = await boot(page, { ...STATE, year: 1858, narr: true, fx: true });
  await page.locator('#play').click();
  const chip = page.locator('#tapvo'), cap = page.locator('#mapwrap > .lt:not(.out)');
  await expect(chip).toBeVisible({ timeout: 15000 });
  await expect(cap).toBeVisible({ timeout: 15000 }); // the scene's caption comes after the chip, when the map has arrived
  // placed again when the caption appears and on each beat (its height changes)
  for (let i = 0; i < 3; i++) {
    await page.waitForTimeout(i ? 1200 : 300);
    if (!(await chip.count()) || !(await cap.count())) break;
    const [c, l] = [await chip.boundingBox(), await cap.boundingBox()];
    expect(l!.y - (c!.y + c!.height)).toBeGreaterThanOrEqual(8);
  }
  expect(errors).toEqual([]);
});

test('debug panel: 5 taps on the version line, build id, error log, copy report', async ({ page }) => {
  const errors = await boot(page);
  // an uncaught error is kept in the on-device log (never shown outside the panel)
  await page.evaluate(() => setTimeout(() => { throw new Error('thử sổ lỗi'); }));
  // the log is written at most once a second (later on a loaded machine)
  await expect.poll(() => page.evaluate(() => localStorage.getItem('dudo-errlog') || ''), { timeout: 10_000 }).toContain('thử sổ lỗi');
  await expect(page.locator('#dbg')).toHaveCount(0);
  await page.locator('.tab[data-t=me]').click();
  await page.locator('[data-a=about]').click();
  const ver = page.locator('[data-a=ver]');
  await expect(ver).toContainText(/phiên bản \d+\.\d+\.\d+/);
  // the build id on a line of its own, as the report and git write it (not upper-cased, not wrapped)
  const bid = ver.locator('.bid');
  await expect(bid).toHaveText(/^[0-9a-f]{7}|^dev/);
  expect(await bid.evaluate(e => [getComputedStyle(e).textTransform, getComputedStyle(e).whiteSpace])).toEqual(['none', 'nowrap']);
  expect((await ver.boundingBox())!.height).toBeLessThan(44);
  for (let i = 0; i < 5; i++) await ver.click();
  const dbg = page.locator('#dbg');
  await expect(dbg).toBeVisible();
  await expect(dbg).toContainText('bản dựng');
  await expect(dbg).toContainText('Hiệu ứng: mức 2');
  await expect(dbg).toContainText('AudioContext');
  await expect(dbg).toContainText('thử sổ lỗi');
  await expect(dbg).toContainText(/Khung hình: [1-9]\d* fps/);
  await dbg.getByRole('button', { name: 'Sao chép báo cáo' }).click();
  await expect(dbg.locator('.go')).toHaveText(/Đã sao chép|Chọn sẵn/);
  // remembered for the session (the Home Screen app cannot take ?debug)
  await page.reload();
  await expect(page.locator('#dbg')).toBeVisible();
  await page.locator('#dbg [data-d=x]').click();
  await page.reload();
  await page.waitForSelector('#map text[data-city]');
  await expect(page.locator('#dbg')).toHaveCount(0);
  expect(errors.filter(e => !e.includes('thử sổ lỗi'))).toEqual([]);
});

test('debug panel survives a damaged error log (a null row used to blank it and throw every second)', async ({ page }) => {
  await page.addInitScript(() => {
    if (sessionStorage.getItem('seen')) return;
    sessionStorage.setItem('seen', '1');
    localStorage.setItem('dudo-errlog', JSON.stringify([null, 5, 'x', [1], { m: 7 }, { t: '2026-11-19T00:00:00Z', m: 'dòng cũ còn đọc được', b: 'abc1234' }]));
  });
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.route(/wikipedia\.org|wikimedia\.org/, r => r.abort());
  await page.addInitScript(s => { if (!localStorage.getItem('dudo-v2')) localStorage.setItem('dudo-v2', s); }, JSON.stringify(STATE));
  await page.goto('/?debug');
  const dbg = page.locator('#dbg');
  await expect(dbg).toContainText('Lỗi gần nhất (1)');
  await expect(dbg).toContainText('dòng cũ còn đọc được');
  await page.waitForTimeout(1500); // a few repaints
  expect(errors).toEqual([]);
});

test('an auto effects level stored by the old tuner (flights counted) is reset once to the full look', async ({ page }) => {
  await page.addInitScript(() => { if (!sessionStorage.getItem('seen')) { sessionStorage.setItem('seen', '1'); localStorage.setItem('dudo-q', JSON.stringify({ m: 'auto', q: 0 })); } });
  await boot(page);
  await expect(page.locator('html')).toHaveAttribute('data-q', '2');
  await expect(page.locator('#map > g > g:first-child')).toHaveAttribute('filter', 'url(#rough)');
  // a level judged by the new tuner is kept
  await page.evaluate(() => localStorage.setItem('dudo-q', JSON.stringify({ m: 'auto', q: 1, v: 2 })));
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-q', '1');
  // a fixed choice from Hồ sơ → Cài đặt is kept as it was
  await page.evaluate(() => localStorage.setItem('dudo-q', JSON.stringify({ m: 'lite', q: 2 })));
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-q', '1');
});
