import { test, expect, type Page, type BrowserContext } from '@playwright/test';
import { createServer } from 'node:http';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

/* Service worker (the rest of the suite blocks it): install, offline boot, offline narration, and updates that wait for a
   safe moment instead of reloading mid-scene. */
test.use({ serviceWorkers: 'allow' });

const STATE = { step: 'play', name: 'Họ Lê', year: 1885, narr: false, sound: false, music: false };

const DIST = fileURLToPath(new URL('../dist/', import.meta.url));
const TYPES: Record<string, string> = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.m4a': 'audio/mp4', '.txt': 'text/plain' };

/** The built app (dist/) on a port of its own whose sw.js can change: "build B" is the same worker plus a comment, which
    the browser treats as a new worker. (route() does not see the browser's own update checks for sw.js.) A broken build
    serves a page that never loads the app code; from the first broken build on, each build also gives the page a new
    revision, so each worker caches its own page. */
async function serveDist() {
  let tail = '', broken = false, pages = false;
  const srv = createServer(async (req, res) => {
    try {
      const p = decodeURIComponent(new URL(req.url || '/', 'http://x').pathname);
      const f = normalize(join(DIST, p.endsWith('/') ? p + 'index.html' : p));
      if (!f.startsWith(DIST)) throw new Error('outside dist');
      let body = await readFile(f);
      if (broken && f.endsWith('index.html')) body = Buffer.from(String(body).replace(/<script type="module"[^>]*><\/script>/, ''));
      if (p === '/sw.js' && pages) body = Buffer.from(String(body).replace(/(url:"index\.html",revision:")([^"]+)/, `$1$2-${tail}`));
      // each build's worker answers "build?" with its name (a MessageChannel port), so a test can tell which one is active
      if (p === '/sw.js' && tail) body = Buffer.concat([body, Buffer.from(`\n// build ${tail}\nself.addEventListener('message', e => { if (e.data === 'build?') e.ports[0]?.postMessage(${JSON.stringify(tail)}); });\n`)]);
      res.writeHead(200, { 'content-type': TYPES[extname(f)] || 'application/octet-stream', 'cache-control': 'no-cache' });
      res.end(body);
    } catch { res.writeHead(404); res.end(); }
  });
  await new Promise<void>(r => srv.listen(0, r));
  const port = (srv.address() as { port: number }).port;
  return { url: `http://localhost:${port}/`, build: (t: string, bad = false) => { tail = t; broken = bad; pages ||= bad; }, close: () => new Promise<void>(r => srv.close(() => r())) };
}

async function boot(page: Page, context: BrowserContext, state: object = STATE, url = '/') {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await context.route(/wikipedia\.org|wikimedia\.org/, r => r.abort());
  await page.addInitScript(s => { if (!localStorage.getItem('dudo-v2')) localStorage.setItem('dudo-v2', s); }, JSON.stringify(state));
  await page.goto(url);
  await page.waitForSelector('#map text[data-city]');
  // the first install takes over the open page at once (clientsClaim), so its fetches are cached from the start
  await page.waitForFunction(() => !!navigator.serviceWorker.controller, null, { timeout: 30_000 });
  return errors;
}

/** Page errors that come from the app. WebKit reports the worker's "no-response" for a Wikipedia lookup (blocked here)
    made while offline as page errors (two: the message and the URL); the app is unaffected (nothing reaches
    window.onerror or the on-device error log). */
const appErrors = (errors: string[]) => errors.filter(e => !/no-response|wikipedia\.org/.test(e));

const clipCount = (page: Page) => page.evaluate(async () => (await (await caches.open('voice-music')).keys()).length);
/** The build of the active / waiting worker (serveDist), 'base' for the unmodified dist/sw.js, null when there is none. */
const swBuild = (page: Page, which: 'active' | 'waiting') => page.evaluate(async w => {
  const sw = (await navigator.serviceWorker.getRegistration())?.[w];
  if (!sw) return null;
  return new Promise<string>(res => {
    const c = new MessageChannel();
    c.port1.onmessage = e => res(String(e.data));
    sw.postMessage('build?', [c.port2]);
    setTimeout(() => res('base'), 1500);
  });
}, which);

test('service worker installs, controls the page, and an offline reload boots', async ({ page, context }) => {
  const errors = await boot(page, context);
  await context.setOffline(true);
  await page.reload();
  await page.waitForSelector('#map text[data-city]');
  await expect(page.locator('#map > g > g:first-child path').first()).toBeAttached();
  await expect(page.locator('#play')).toBeVisible();
  expect(appErrors(errors)).toEqual([]);
});

test('a chapter tour saves its narration for offline; offline, a clip is served from the cache (whole and in ranges)', async ({ page, context }) => {
  const errors = await boot(page, context, { ...STATE, year: 1858, narr: true, fx: false });
  expect(await clipCount(page)).toBe(0); // audio elements ask for byte ranges (206): playing alone never fills the cache
  await page.locator('#play').click();
  await expect(page.locator('#tourb')).toBeVisible();
  // the chapter's clips are fetched whole, one by one, a few seconds after the tour starts
  await expect.poll(() => clipCount(page), { timeout: 45_000 }).toBeGreaterThanOrEqual(10);
  const url = await page.evaluate(async () => (await (await caches.open('voice-music')).keys()).map(r => r.url).find(u => /\/assets\/[^/]+\.m4a$/.test(u)));
  expect(url).toBeTruthy();
  await page.locator('#tourb [data-t=stop]').click();
  await context.setOffline(true);
  await page.reload();
  await page.waitForSelector('#map text[data-city]');
  const r = await page.evaluate(async u => {
    const a = await fetch(u), b = await fetch(u, { headers: { Range: 'bytes=0-99' } });
    return { s: a.status, n: (await a.arrayBuffer()).byteLength, s2: b.status, n2: (await b.arrayBuffer()).byteLength };
  }, url!);
  expect(r).toMatchObject({ s: 200, s2: 206, n2: 100 });
  expect(r.n).toBeGreaterThan(5000);
  // an audio element (byte-range requests) loads the clip offline
  const ok = await page.evaluate(u => new Promise<boolean>(res => {
    const a = new Audio(u);
    a.preload = 'auto';
    a.onloadedmetadata = () => res(a.duration > 0);
    a.onerror = () => res(false);
    setTimeout(() => res(false), 10_000);
    a.load();
  }), url!);
  expect(ok).toBe(true);
  expect(appErrors(errors)).toEqual([]);
});

test('a new build waits for a safe moment: applied on return to the idle map, offered by a toast during a tour', async ({ page, context }) => {
  test.skip(!existsSync(join(DIST, 'sw.js')), 'needs the production build in dist/');
  const srv = await serveDist();
  try {
    await boot(page, context, STATE, srv.url);
    await page.evaluate(() => { (window as unknown as { build: string }).build = 'A'; });
    // back to the app with the main map idle and untouched: it checks, saves and reloads into B by itself
    srv.build('B');
    const reload = page.waitForEvent('load', { timeout: 30_000 });
    await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
    await reload;
    await page.waitForSelector('#map text[data-city]');
    expect(await page.evaluate(() => (window as unknown as { build?: string }).build)).toBeUndefined();
    await expect.poll(() => page.evaluate(async () => !!(await navigator.serviceWorker.getRegistration())?.waiting)).toBe(false);
    // during a tour it never reloads: a quiet toast offers the update, a tap applies it
    await page.locator('#play').click();
    await expect(page.locator('#tourb')).toBeVisible();
    await page.evaluate(() => { (window as unknown as { build: string }).build = 'B'; });
    srv.build('C');
    await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
    const toast = page.locator('.toast', { hasText: 'Có bản mới' });
    await expect(toast).toBeVisible({ timeout: 30_000 });
    // offered, not applied: same page, the tour still running. Tap at once: the toast lives 9 s, a loaded machine can
    // spend most of that on checks
    expect(await page.evaluate(() => (window as unknown as { build?: string }).build)).toBe('B');
    await expect(page.locator('#tourb')).toBeVisible();
    const reload2 = page.waitForEvent('load', { timeout: 30_000 });
    await toast.getByRole('button', { name: 'Tải lại' }).click();
    await reload2;
    await page.waitForSelector('#map text[data-city]');
    expect(await page.evaluate(() => (window as unknown as { build?: string }).build)).toBeUndefined();
  } finally { await srv.close(); }
});

test('an update that waited through a tour gives way to a newer one on return: one reload, straight into the newest', async ({ page, context }) => {
  test.skip(!existsSync(join(DIST, 'sw.js')), 'needs the production build in dist/');
  const srv = await serveDist();
  try {
    // every "Có bản mới" toast this page ever shows, across reloads
    await page.addInitScript(() => {
      new MutationObserver(() => {
        if ([...document.querySelectorAll('.toast')].some(t => /Có bản mới/.test(t.textContent || ''))) sessionStorage.setItem('offered', '1');
      }).observe(document, { childList: true, subtree: true });
    });
    await boot(page, context, STATE, srv.url);
    // build B arrives during a tour: offered, and left waiting
    await page.locator('#play').click();
    await expect(page.locator('#tourb')).toBeVisible();
    srv.build('B');
    await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
    await expect(page.locator('.toast', { hasText: 'Có bản mới' })).toBeVisible({ timeout: 30_000 });
    await page.locator('#tourb [data-t=stop]').click();
    await expect.poll(() => swBuild(page, 'waiting'), { timeout: 15_000 }).toBe('B');
    await page.waitForTimeout(9500); // the toast goes
    await page.evaluate(() => { sessionStorage.removeItem('offered'); (window as unknown as { build: string }).build = 'A'; });
    // build C lands while the app is in the background; back on the idle, untouched map: it reloads once, into C
    srv.build('C');
    let loads = 0;
    page.on('load', () => { loads++; });
    await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
    await expect.poll(() => loads, { timeout: 30_000 }).toBe(1);
    await page.waitForSelector('#map text[data-city]');
    expect(await page.evaluate(() => (window as unknown as { build?: string }).build)).toBeUndefined();
    expect(await swBuild(page, 'active')).toBe('C');
    // and it does not ask again (it used to reload into B, then offer C a second later)
    await page.waitForTimeout(4000);
    expect(await swBuild(page, 'waiting')).toBeNull();
    expect(await page.evaluate(() => sessionStorage.getItem('offered'))).toBeNull();
    expect(loads).toBe(1);
  } finally { await srv.close(); }
});

test('a broken build shows the recovery screen; when the fix lands while it is open, one tap on Thử lại opens the app', async ({ page, context }) => {
  test.skip(!existsSync(join(DIST, 'sw.js')), 'needs the production build in dist/');
  const srv = await serveDist();
  try {
    await boot(page, context, STATE, srv.url);
    // build B never starts the app; it takes over at the next safe moment (back on the idle map) and the page reloads into it
    srv.build('B', true);
    const reload = page.waitForEvent('load', { timeout: 30_000 });
    await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
    await reload;
    await expect(page.locator('#rescue h1')).toHaveText('Dư Đồ chưa mở được', { timeout: 15_000 });
    expect(await swBuild(page, 'active')).toBe('B');
    // the fix (C) lands while the screen is open. Thử lại finds C still installing: it waits for it, lets it take over, and
    // only then reloads (reloading at once ran broken B again and needed a second tap)
    srv.build('C');
    const reload2 = page.waitForEvent('load', { timeout: 30_000 });
    await page.locator('#rescue [data-r=retry]').click();
    await reload2;
    await page.waitForSelector('#map text[data-city]', { timeout: 15_000 });
    await expect(page.locator('#rescue')).toHaveCount(0);
    expect(await swBuild(page, 'active')).toBe('C');
  } finally { await srv.close(); }
});
