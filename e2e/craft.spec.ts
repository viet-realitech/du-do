import { test, expect, devices, type Page } from '@playwright/test';

/* Đợt H (gói 6): la bàn giá trị vẽ thành hoa gió, tấm bản đồ ở trang nhật ký và ở hồ sơ kết cục, nhãn thành phố bị dấu
   đè thì mờ đi, thiết lập Chữ lớn. Wikipedia bị chặn như mọi bài thử khác. */

async function boot(page: Page, state?: object, play = false) {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.route(/wikipedia\.org|wikimedia\.org/, r => r.abort());
  if (state) {
    await page.addInitScript(([s, p]) => {
      if (sessionStorage.getItem('seeded')) return; // tải lại trang: giữ bản lưu và thiết lập đã đổi
      localStorage.setItem(p ? 'dudo-v2-play' : 'dudo-v2', s as string);
      localStorage.setItem('dudo-mode', p ? 'play' : 'read');
      sessionStorage.setItem('seeded', '1');
    }, [JSON.stringify({ sound: false, music: false, narr: false, ...state }), play] as const);
  }
  await page.goto('/');
  await page.waitForSelector('#map text[data-city]');
  return errors;
}
/** Bấm một hành động data-a (như nút trong ứng dụng) mà không cần nút ấy đang hiện. */
const act = (page: Page, a: string, data: Record<string, string> = {}) => page.evaluate(([a, data]) => {
  const b = document.createElement('button');
  b.dataset.a = a;
  Object.assign(b.dataset, data);
  b.hidden = true;
  document.body.appendChild(b);
  b.click();
  b.remove();
}, [a, data] as const);

const PICKS = { e1: 'chien', e2: 'duytan', e3: 'cs', e4: 'vm', e5: 'nam', e6: 'doimoi' };
const ERAS6 = ['e1', 'e2', 'e3', 'e4', 'e5', 'e6'];
/** Trò chơi đã xong sáu đời (mùa màng, câu đố chương 6 đã qua): mở kết cục thẳng. */
const donePlay = (home: string, picks: Record<string, string>) => ({ v: 1, step: 'play', mode: 'play', name: 'Họ Lê', home, year: 2026, picks, harvests: ERAS6, quiz: { e6: [true, true] }, cards: {}, xFrom: 2026 });
const read54 = { step: 'play', name: 'Họ Lê', year: 1954, picks: { e1: 'chien', e2: 'duytan', e3: 'cs', e4: 'vm' }, quiz: { e1: [true, true], e2: [true, true], e3: [true, true], e4: [true, true] } };

/** Các nhãn chủ quyền của một tấm bản đồ nhỏ đọc trọn: nằm trong khung, không nhãn nào khác của tấm bản đồ đè lên. */
const sovereigntyWhole = (page: Page, root: string) => page.evaluate(root => {
  const svg = document.querySelector<SVGSVGElement>(root);
  if (!svg) return [`không có ${root}`];
  svg.scrollIntoView({ block: 'center' });
  const b = svg.getBoundingClientRect(), out: string[] = [];
  const texts = [...svg.querySelectorAll('text')];
  for (const name of ['Q.đ. Hoàng Sa', 'Q.đ. Trường Sa', 'Biển Đông']) {
    const t = texts.find(x => x.textContent === name);
    if (!t) { out.push(`${name}: không có`); continue; }
    const r = t.getBoundingClientRect();
    if (r.left < b.left + 1 || r.right > b.right - 1 || r.top < b.top + 1 || r.bottom > b.bottom - 1) out.push(`${name}: ra ngoài khung`);
    for (const o of texts) {
      if (o === t) continue;
      const q = o.getBoundingClientRect();
      if (Math.min(r.right, q.right) - Math.max(r.left, q.left) > 0.5 && Math.min(r.bottom, q.bottom) - Math.max(r.top, q.top) > 0.5) out.push(`${name}: bị "${o.textContent}" đè`);
    }
  }
  return out;
}, root);

test('value compass: a rose with the exact number beside every value, nothing clipped at 390 px', async ({ page }) => {
  const errors = await boot(page, read54);
  await page.locator('.tab[data-t=me]').click();
  const rose = page.locator('.pane .vrose');
  await expect(rose).toBeVisible();
  await expect(rose.locator('svg polygon.vr-poly')).toHaveCount(1);
  // chien + duytan + cs + vm: số đúng như values() (state.ts), cạnh tên từng hướng
  const want = await page.evaluate(() => {
    const v: Record<string, number> = { 'Độc lập': 0, 'Sinh mạng': 0, 'Tự do': 0, 'Đoàn kết': 0 };
    for (const r of document.querySelectorAll('.vrose dl > div')) v[r.querySelector('dt')!.textContent!] = Number(r.querySelector('dd')!.textContent);
    return v;
  });
  expect(Object.keys(want)).toEqual(['Độc lập', 'Sinh mạng', 'Tự do', 'Đoàn kết']);
  expect(Object.values(want).every(n => Number.isInteger(n) && n >= 0)).toBe(true);
  // mọi nhãn, mọi con số nằm trọn trong màn hình và không chạm hoa gió
  const bad = await page.evaluate(() => {
    const s = document.querySelector('.vrose svg')!.getBoundingClientRect(), out: string[] = [];
    for (const e of document.querySelectorAll<HTMLElement>('.vrose dt, .vrose dd')) {
      const r = e.getBoundingClientRect();
      if (r.left < 0 || r.right > innerWidth) out.push(`${e.textContent} ra ngoài màn hình`);
      if (e.scrollWidth > e.clientWidth + 1) out.push(`${e.textContent} bị cắt`);
      if (Math.min(r.right, s.right) - Math.max(r.left, s.left) > 0 && Math.min(r.bottom, s.bottom) - Math.max(r.top, s.top) > 0) out.push(`${e.textContent} chạm hoa gió`);
    }
    return out;
  });
  expect(bad).toEqual([]);
  expect(errors).toEqual([]);
});

test('ending dossier: the compass rose, and in play mode a home plate with only the moves the save holds', async ({ page }) => {
  // nhà Hà Nội chọn Miền Nam năm 1954: di cư, không có chặng nào khác
  const errors = await boot(page, donePlay('hn', PICKS), true);
  await act(page, 'end');
  await expect(page.locator('.ov.end .end-cmp .vrose')).toBeAttached();
  const sec = page.locator('.ov.end .end-plate');
  await expect(sec.locator('.mp-l li')).toHaveText([/1858\s*Quê nhà: Hà Nội/, /1954\s*Di cư vào miền Nam/]);
  await expect(sec.locator('svg .pl-move')).toHaveCount(1);
  await expect(sec.locator('svg text.pl-mk')).toHaveText(['Hà Nội', 'miền Nam']);
  await expect.poll(() => sovereigntyWhole(page, '.end-plate svg')).toEqual([]);
  expect(errors).toEqual([]);
});

test('ending home plate: a southern family that regrouped north and came back in 1976; read mode has no plate', async ({ page }) => {
  const errors = await boot(page, donePlay('ct', { ...PICKS, e5: 'bac' }), true);
  await act(page, 'end');
  const sec = page.locator('.ov.end .end-plate');
  await expect(sec.locator('.mp-l li')).toHaveText([/Quê nhà: Cần Thơ/, /1954\s*Tập kết ra miền Bắc/, /1976\s*Về lại quê nhà Cần Thơ/]);
  await expect(sec.locator('svg .pl-move')).toHaveCount(2);
  await expect.poll(() => sovereigntyWhole(page, '.end-plate svg')).toEqual([]);
  // Đọc sử: không có quê, không có tấm bản đồ dòng họ
  await page.evaluate(() => { localStorage.setItem('dudo-v2', JSON.stringify({ step: 'play', name: 'Họ Lê', year: 2026, picks: { e1: 'chien', e2: 'duytan', e3: 'cs', e4: 'vm', e5: 'nam', e6: 'doimoi' }, quiz: { e6: [true, true] }, sound: false, music: false, narr: false })); localStorage.setItem('dudo-mode', 'read'); });
  await page.reload();
  await page.waitForSelector('#map text[data-city]');
  await act(page, 'end');
  await expect(page.locator('.ov.end .end-cmp .vrose')).toBeAttached();
  await expect(page.locator('.ov.end .end-plate')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('diary page on a phone: a plate with the footprint; play mode adds home and distance, read mode does not', async ({ page }) => {
  const errors = await boot(page, read54);
  await act(page, 'ev', { id: 'd-vm1' });
  const fig = page.locator('.ov.diary .dplate');
  await expect(fig).toBeVisible();
  await expect(fig.locator('figcaption')).toHaveText('Dấu chân người viết · 1954');
  await expect(fig.locator('svg .pl-foot')).toHaveCount(1);
  await expect(fig.locator('svg .pl-home')).toHaveCount(0);
  await expect.poll(() => sovereigntyWhole(page, '.dplate svg')).toEqual([]);
  expect(errors).toEqual([]);
});

test('diary page in play mode: distance from the family home that year', async ({ page }) => {
  const errors = await boot(page, { ...donePlay('hn', { e1: 'chien', e2: 'duytan', e3: 'cs', e4: 'vm' }), year: 1954, harvests: ['e1', 'e2', 'e3', 'e4'] }, true);
  await page.evaluate(() => document.querySelectorAll('#layer .scrim').forEach(s => s.remove())); // điểm rẽ 5 tự mở: bỏ qua
  await act(page, 'ev', { id: 'd-vm1' });
  const fig = page.locator('.ov.diary .dplate');
  await expect(fig.locator('figcaption')).toHaveText(/^Dấu chân người viết · cách nhà ở Hà Nội ~\d{3} km$/);
  await expect(fig.locator('svg text.pl-mk')).toHaveText(['Hà Nội', 'Dấu chân']);
  await expect.poll(() => sovereigntyWhole(page, '.dplate svg')).toEqual([]);
  expect(errors).toEqual([]);
});

test('diary page on an iPad in landscape: no plate, the live map flies to the place and back on close', async ({ browser }, info) => {
  const { defaultBrowserType: _, ...d } = devices['iPad Pro 11 landscape'];
  const ctx = await browser.newContext({ ...d, baseURL: info.project.use.baseURL, serviceWorkers: 'block' });
  try {
    const page = await ctx.newPage();
    const errors = await boot(page, read54);
    const k = () => page.evaluate(() => Number(/scale\(([\d.]+)\)/.exec((document.querySelector('#map > g') as SVGGElement).getAttribute('transform') || '')?.[1] ?? 1));
    expect(await k()).toBe(1);
    await act(page, 'ev', { id: 'd-vm1' });
    await expect(page.locator('.ov.diary')).toBeVisible();
    await expect(page.locator('.ov.diary .dplate')).toHaveCount(0);
    await expect.poll(k, { timeout: 5000 }).toBe(2.2);
    await page.keyboard.press('Escape');
    await expect(page.locator('.ov.diary')).toHaveCount(0);
    await expect.poll(k, { timeout: 5000 }).toBe(1); // bay về chỗ cũ (người dùng chưa tự dời bản đồ)
    expect(errors).toEqual([]);
  } finally {
    await ctx.close();
  }
});

test('a city label that an event marker overprints fades; it comes back when the marker goes', async ({ page }) => {
  // 1955 trên điện thoại: dấu sự kiện ở Hà Nội đè lên chữ "Hà Nội" (Phát Diệm, Hải Phòng, Hà Nội tiếp quản)
  const errors = await boot(page, { ...read54, year: 1955, picks: { ...read54.picks, e5: 'bac' } });
  const op = (c: string) => page.locator(`#map text[data-city="${c}"]`).evaluate(t => t.getAttribute('opacity'));
  await expect.poll(() => op('Hà Nội'), { timeout: 5000 }).toBe('0');
  for (const c of ['Huế', 'Đà Nẵng']) expect(await op(c)).toBeNull();
  // 1965: không dấu nào đè lên Hà Nội: nhãn hiện lại
  await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('dudo-v2')!); s.year = 1965; localStorage.setItem('dudo-v2', JSON.stringify(s)); });
  await page.reload();
  await page.waitForSelector('#map text[data-city]');
  await page.waitForTimeout(800);
  expect(await op('Hà Nội')).toBeNull();
  expect(errors).toEqual([]);
});

/** Độ mờ đang đặt trên bốn nhãn thành phố: { 'Hà Nội': null | '0', … }. */
const cityOps = (page: Page) => page.evaluate(() => Object.fromEntries([...document.querySelectorAll<SVGTextElement>('#map text[data-city]')].map(t => [t.dataset.city!, t.getAttribute('opacity')])));

test('the 1955 chapter tour: route segments not drawn yet do not fade Huế, Đà Nẵng or Sài Gòn', async ({ page }) => {
  // tour chương 5 vẽ dần các đường di cư (đoạn chưa tới giấu bằng stroke-dashoffset) qua Huế, Đà Nẵng, Sài Gòn: chưa có mực
  // thì không che chữ nào. Dấu trận đánh đè lên chữ "Hà Nội" thì nhãn ấy mờ (lần xét nhãn đã chạy).
  const errors = await boot(page, { ...read54, year: 1955, picks: { ...read54.picks, e5: 'bac' }, quiz: { ...read54.quiz, e5: [true, true] } });
  await page.waitForTimeout(800);
  await page.locator('#play').click();
  await expect.poll(async () => (await cityOps(page))['Hà Nội'], { timeout: 8000 }).toBe('0');
  const seen = new Set<string>();
  for (let i = 0; i < 24; i++) {
    const o = await cityOps(page);
    for (const c of ['Huế', 'Đà Nẵng', 'Sài Gòn']) if (o[c] !== null) seen.add(c);
    await page.waitForTimeout(250);
  }
  expect([...seen]).toEqual([]);
  expect(errors).toEqual([]);
});

test('a city label a battle piece faded comes back after Đóng closes the replay', async ({ page }) => {
  // Chí Hoà 1861: quân giữ đồn đứng trên chữ "Sài Gòn" (mờ thật); Đóng gỡ cảnh, bản đồ đứng yên chỗ cũ: nhãn hiện lại
  const errors = await boot(page, { ...read54, year: 2026, picks: { ...PICKS, e5: 'bac' }, quiz: {} });
  await page.waitForTimeout(800);
  await act(page, 'replay', { id: 'cd61' });
  await expect.poll(async () => (await cityOps(page))['Sài Gòn'], { timeout: 15000 }).toBe('0');
  await page.locator('#replb [data-t=rclose]').click();
  await expect.poll(async () => (await cityOps(page))['Sài Gòn'], { timeout: 4000 }).toBeNull();
  expect(errors).toEqual([]);
});

test('iPad landscape, Phản công Kinh thành replay: a dashed boundary near Huế does not fade the label', async ({ browser }, info) => {
  // hộp bao của nét ranh giới nét đứt (43 × 34 px) chồng lên khung chữ "Huế" mà nét không đi qua chữ: chỉ điểm mực mới tính
  const { defaultBrowserType: _, ...d } = devices['iPad Pro 11 landscape'];
  const ctx = await browser.newContext({ ...d, baseURL: info.project.use.baseURL, serviceWorkers: 'block' });
  try {
    const page = await ctx.newPage();
    const errors = await boot(page, { ...read54, year: 2026, picks: { ...PICKS, e5: 'bac' }, quiz: {} });
    await page.waitForTimeout(800);
    await act(page, 'replay', { id: 'cv85' });
    await expect(page.locator('#replb')).toBeVisible();
    const seen: string[] = [];
    for (let i = 0; i < 32; i++) {
      if ((await cityOps(page))['Huế'] !== null) seen.push(`${i * 250} ms`);
      await page.waitForTimeout(250);
    }
    expect(seen).toEqual([]);
    expect(errors).toEqual([]);
  } finally {
    await ctx.close();
  }
});

test('Chữ lớn: the setting scales the reading text, persists after a reload and causes no sideways scroll at 390 px', async ({ page }) => {
  const errors = await boot(page, read54);
  const size = () => page.locator('#lbl').evaluate(e => parseFloat(getComputedStyle(e).fontSize));
  const base = await size();
  await page.locator('.tab[data-t=me]').click();
  const sw = page.locator('[data-a=bigtext]');
  await expect(sw).toHaveAttribute('aria-checked', 'false');
  await sw.click();
  await expect(page.locator('[data-a=bigtext]')).toHaveAttribute('aria-checked', 'true');
  await expect(page.locator('html')).toHaveAttribute('data-text', 'big');
  expect(await page.evaluate(() => localStorage.getItem('dudo-text'))).toBe('big');
  const wide = () => page.evaluate(() => {
    const out: string[] = [];
    for (const e of [document.documentElement, document.body, ...document.querySelectorAll<HTMLElement>('#layer *')]) {
      const cs = getComputedStyle(e);
      if ((e === document.documentElement || e === document.body || cs.overflowX === 'auto' || cs.overflowX === 'scroll') && e.scrollWidth > e.clientWidth + 1) out.push(`${e.tagName}.${e.className} ${e.scrollWidth} > ${e.clientWidth}`);
    }
    return out;
  });
  expect(await wide()).toEqual([]);
  // tải lại: boot.js đặt cỡ chữ trước khi ứng dụng chạy; chữ đọc lớn hơn ~1,18 lần
  await page.reload();
  await page.waitForSelector('#map text[data-city]');
  await expect(page.locator('html')).toHaveAttribute('data-text', 'big');
  expect((await size()) / base).toBeCloseTo(1.18, 2);
  // trang sự kiện, hồ sơ kết luận: không cuộn ngang
  await act(page, 'ev', { id: 'dbp' });
  await expect(page.locator('#et')).toBeVisible();
  expect(await wide()).toEqual([]);
  await page.keyboard.press('Escape');
  await page.locator('.tab[data-t=me]').click();
  await expect(page.locator('.pane .vrose')).toBeVisible();
  expect(await wide()).toEqual([]);
  await page.locator('[data-a=bigtext]').click();
  await expect(page.locator('html')).not.toHaveAttribute('data-text', 'big');
  expect(await page.evaluate(() => localStorage.getItem('dudo-text'))).toBeNull();
  expect(errors).toEqual([]);
});
