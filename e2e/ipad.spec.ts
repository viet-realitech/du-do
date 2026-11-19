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
