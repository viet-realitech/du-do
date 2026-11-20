import { test as base, expect, type Page } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

/* "Góp ý / Báo sai" (src/ui/feedback.ts): one address, set at build time (VITE_FEEDBACK_URL). While it is empty, as in
   the normal build, no link renders anywhere (no dead link); once set, the link sits at the bottom of an event's Nguồn
   tab, in Giới thiệu and under a figure, opens a new tab and sends nothing from the app (About promises no tracking). */

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const FORM = 'https://forms.example.org/du-do?ref={ref}';
const TYPES: Record<string, string> = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.woff': 'font/woff', '.m4a': 'audio/mp4', '.txt': 'text/plain' };

/** A second production build of this checkout with VITE_FEEDBACK_URL set, once per worker (a few seconds). */
const test = base.extend<{}, { fbDist: string }>({
  fbDist: [async ({}, use) => {
    const dir = mkdtempSync(join(tmpdir(), 'dudo-feedback-'));
    execFileSync(process.execPath, [join(ROOT, 'node_modules', 'vite', 'bin', 'vite.js'), 'build', '--outDir', dir, '--emptyOutDir', '--logLevel', 'error'],
      { cwd: ROOT, env: { ...process.env, VITE_FEEDBACK_URL: FORM }, stdio: 'pipe' });
    await use(dir + sep);
    rmSync(dir, { recursive: true, force: true });
  }, { scope: 'worker', timeout: 180_000 }],
});

// the card under the map is a battle (Điện Biên Phủ), so tapping it opens the event page
const midGame = { step: 'play', name: 'Họ Lê', year: 1954, picks: { e1: 'chien', e2: 'duytan', e3: 'cs', e4: 'vm', e5: 'nam' }, quiz: { e1: [true, true], e2: [true, false], e3: [true, true], e4: [false, true] }, filt: 'Trận đánh' };

/** Boots the app (from `dist`, the build to serve instead of the preview server's, when given); returns the page errors
    and the requests the app page made to other hosts than its own and Wikipedia (blocked here, as in the other specs). */
async function boot(page: Page, baseURL: string, dist?: string) {
  const errors: string[] = [], away: string[] = [];
  const own = new URL(baseURL).origin;
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(m.text()); });
  page.on('request', r => { const u = new URL(r.url()); if (u.origin !== own && !/wikipedia\.org|wikimedia\.org/.test(u.host) && u.protocol !== 'data:') away.push(r.url()); });
  await page.addInitScript(() => document.addEventListener('securitypolicyviolation', e => console.error('CSP: ' + e.violatedDirective + ' ' + e.blockedURI)));
  await page.route(/wikipedia\.org|wikimedia\.org/, r => r.abort());
  if (dist) {
    await page.route(u => u.origin === own, async r => {
      const p = decodeURIComponent(new URL(r.request().url()).pathname);
      const f = normalize(join(dist, p.endsWith('/') ? p + 'index.html' : p));
      if (!f.startsWith(dist)) return r.fulfill({ status: 404, body: '' });
      try { await r.fulfill({ body: await readFile(f), contentType: TYPES[extname(f)] || 'application/octet-stream' }); }
      catch { await r.fulfill({ status: 404, body: '' }); }
    });
  }
  await page.addInitScript(s => localStorage.setItem('dudo-v2', s), JSON.stringify(midGame));
  await page.goto('/');
  await expect(page.locator('#card .c')).toBeVisible();
  return { errors, away };
}

const live = (page: Page, sel: string) => page.locator(`${sel}:not(.exiting *, .cine.out, .cine.out *)`);
const fbLinks = (page: Page) => page.getByRole('link', { name: /Góp ý \/ Báo sai/ });

async function openAbout(page: Page) {
  await page.locator('.tab[data-t=me]').click();
  await page.getByRole('button', { name: 'Giới thiệu & nguồn dữ liệu' }).click();
  await expect(live(page, '.scrim').getByText('Quyền riêng tư')).toBeVisible();
}
async function openFigure(page: Page) {
  await page.locator('.tab[data-t=fig]').click();
  await page.locator('#layer .pane .fcard:not(.off)').first().click();
  await expect(live(page, '.scrim h2')).toBeVisible();
}
async function openSources(page: Page) {
  await page.locator('#card .c').click();
  await page.locator('#et').getByRole('tab', { name: 'Nguồn' }).click();
  await expect(page.locator('#eb .src').first()).toBeVisible();
}

test('no "Góp ý / Báo sai" link anywhere while the feedback address is empty', async ({ page, baseURL }) => {
  test.skip(!!process.env.VITE_FEEDBACK_URL, 'this run builds with a feedback address');
  const { errors, away } = await boot(page, baseURL!);
  await openSources(page);
  await expect(page.locator('#eb .src')).not.toHaveCount(0);
  await expect(page.locator('#eb')).not.toContainText('Góp ý');
  await expect(page.locator('#eb a.fb')).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(page.locator('.ov')).toHaveCount(0);
  await openFigure(page);
  await expect(live(page, '.scrim')).toContainText('Tiểu sử tóm lược từ sử liệu công khai.');
  await expect(live(page, '.scrim')).not.toContainText('Góp ý');
  await page.keyboard.press('Escape');
  await expect(page.locator('.scrim')).toHaveCount(0);
  await openAbout(page);
  // the method paragraph is there, without a pointer to a link that does not exist
  await expect(live(page, '.scrim')).toContainText('Nội dung chưa được nhà sử học thẩm định.');
  // it claims only the check that was done (Wikipedia), not one against every source in a Nguồn tab
  const method = live(page, '.scrim .method');
  await expect(method).toContainText('mới được đối chiếu với Wikipedia tiếng Việt, tiếng Anh.');
  await expect(method).toContainText('chưa được đối chiếu từng câu với các sử liệu ấy');
  await expect(method).not.toContainText('và các sử liệu ghi ở mục Nguồn');
  await expect(live(page, '.scrim')).not.toContainText('Góp ý');
  await expect(fbLinks(page)).toHaveCount(0);
  await expect(page.locator('a.fb')).toHaveCount(0);
  expect(away).toEqual([]);
  expect(errors).toEqual([]);
});

test('with VITE_FEEDBACK_URL set, the Nguồn tab, a figure and Giới thiệu link to that one address in a new tab', async ({ page, context, baseURL, fbDist }) => {
  const { errors, away } = await boot(page, baseURL!, fbDist);
  await context.route('https://forms.example.org/**', r => r.fulfill({ contentType: 'text/html; charset=utf-8', body: '<!doctype html><title>Góp ý</title><p>ok</p>' }));
  const check = async (ref: RegExp) => {
    const a = live(page, 'a.fb');
    await expect(a).toHaveCount(1);
    await expect(a).toHaveAccessibleName(/Góp ý \/ Báo sai/);
    await expect(a).toHaveAttribute('target', '_blank');
    await expect(a).toHaveAttribute('rel', /\bnoopener\b/);
    const href = (await a.getAttribute('href'))!;
    expect(href.startsWith('https://forms.example.org/du-do?ref=')).toBe(true);
    const tag = decodeURIComponent(href.split('?ref=')[1]);
    expect(tag).toMatch(ref);
    expect(tag).toContain('bản 2.'); // the app version, so a report names the build it came from
    return a;
  };

  // event page → Nguồn: the link is the last row, after the sources, and names the event
  await openSources(page);
  const id = await live(page, '.ov.evp [data-a=listen]').getAttribute('data-id');
  const ev = await check(new RegExp(`^sự kiện ${id} · `));
  expect(await page.locator('#eb > *').last().evaluate(n => !!n.querySelector('a.fb'))).toBe(true);
  // a tap opens the form in a new tab; the app itself sends nothing
  const [popup] = await Promise.all([page.waitForEvent('popup'), ev.click()]);
  await popup.waitForLoadState();
  expect(popup.url()).toMatch(/^https:\/\/forms\.example\.org\/du-do\?ref=/);
  await expect(popup.locator('p')).toHaveText('ok');
  await popup.close();
  await page.keyboard.press('Escape');
  await expect(page.locator('.ov')).toHaveCount(0);

  // figure sheet: under the "Tiểu sử tóm lược" note
  await openFigure(page);
  await check(/^nhân vật [a-z0-9]+ · /);
  await page.keyboard.press('Escape');
  await expect(page.locator('.scrim')).toHaveCount(0);

  // Giới thiệu: its own "Góp ý" section, and the method paragraph points to it
  await openAbout(page);
  await check(/^giới thiệu · /);
  await expect(live(page, '.scrim')).toContainText('Bạn có thể báo chỗ sai qua mục Góp ý / Báo sai ở dưới.');
  await expect(fbLinks(page)).toHaveCount(1);

  expect(away).toEqual([]);
  expect(errors).toEqual([]);
});
