import { test, expect, devices, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

/* Sổ kết cục (iPad Pro 11, cả Chromium lẫn WebKit):
   - dòng họ đi tới kết cục được cất cả bản lưu vào 'dudo-archive'; mở lại màn kết không cất thêm; chọn lại từ 1858 giữ sổ
     (hộp xác nhận nói rõ), dấu kết cục vẫn đóng son trong Hồ sơ;
   - mở lại hồ sơ một dòng họ đã khép chỉ để xem: bộ nhớ (ván đang chơi, ván của luồng kia, huy hiệu, cài đặt, sổ) không
     đổi một byte, không phim, không chia sẻ, không nút chọn lại; bản lưu cũ chưa đánh số trong sổ đi qua các bước nâng cấp;
   - sổ hỏng không bao giờ làm chết ứng dụng (không màn khôi phục): hỏng cả thì coi như trống và cất một bản sao trước khi
     ghi đè, hỏng một hồ sơ thì bỏ riêng hồ sơ ấy;
   - "Xoá sổ kết cục" hỏi lại trước và không đụng ván đang chơi. */

const { defaultBrowserType: _webkit, ...ipad } = devices['iPad Pro 11'];
test.use(ipad);

const live = (page: Page, sel: string) => page.locator(`${sel}:not(.exiting *, .cine.out, .cine.out *)`);
const ids = [...readFileSync('src/data/cards.ts', 'utf8').matchAll(/^  \['(\w+)', '/gm)].map(m => m[1]);
const es = ['e1', 'e2', 'e3', 'e4', 'e5', 'e6'];
const r = (g: number, d: number, b: number, u: number) => ({ g, d, b, u });
/** Một dòng họ đã đi hết sáu thế hệ (Trò chơi): mọi thẻ tới năm 2025 đã quyết, đố đủ, mùa màng đủ. */
const finished = (name: string, home: string, picks: Record<string, string>) => ({
  v: 1, step: 'play', mode: 'play', name, surname: '', home, year: 2026, picks, cvk: ids, cardv: {}, xFrom: 2026, narr: false, shown: [],
  cards: Object.fromEntries(ids.slice(0, ids.indexOf('st25') + 1).map(id => [id, 0])), quiz: Object.fromEntries(es.map(e => [e, [true, true]])), harvests: es,
  snap: { e1: r(55, 42, 30, 22), e2: r(50, 44, 35, 30), e3: r(40, 45, 30, 40), e4: r(30, 40, 20, 45), e5: r(45, 46, 40, 50), e6: r(50, 45, 45, 45) }, res: r(50, 45, 45, 45),
});
const midRead = { v: 1, step: 'play', name: 'Họ Lê', year: 1954, narr: false, picks: { e1: 'chien', e2: 'duytan', e3: 'cs', e4: 'vm', e5: 'nam' }, quiz: { e1: [true, true], e2: [true, false], e3: [true, true], e4: [false, true] } };
const reformPath = { e1: 'canhtan', e2: 'duytan', e3: 'laphien', e4: 'tl', e5: 'thuba', e6: 'doimoi' };
const oldPath = { e1: 'chien', e2: 'canvuong', e3: 'cs', e4: 'vm', e5: 'nam', e6: 'doimoi' };
type Run = { id: string; at: string; mode: 'read' | 'play'; end: string; title: string; name: string; home: string; save: Record<string, unknown> };
const run = (id: string, save: Record<string, unknown>, end: string, title: string, home: string): Run => ({ id, at: '2026-11-02T09:00:00.000Z', mode: 'play', end, title, name: save.name as string, home, save });

/** Đặt bộ nhớ một lần (tải lại trang không đặt lại), chặn Wikipedia, gom lỗi trang. */
async function seed(page: Page, items: Record<string, string>) {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.route(/wikipedia\.org|wikimedia\.org/, rt => rt.abort());
  await page.addInitScript(items => {
    if (sessionStorage.getItem('seeded')) return;
    for (const [k, v] of Object.entries(items)) localStorage.setItem(k, v);
    sessionStorage.setItem('seeded', '1');
  }, items);
  return errors;
}
async function alive(page: Page) {
  await page.waitForSelector('#map text[data-city]', { timeout: 15_000 });
  await expect(page.locator('#rescue')).toHaveCount(0);
}
/** Toàn bộ bộ nhớ của trang, khoá xếp theo thứ tự. */
const storage = (page: Page) => page.evaluate(() => Object.fromEntries(Object.keys(localStorage).sort().map(k => [k, localStorage.getItem(k)])));
const arc = (page: Page) => page.evaluate(() => JSON.parse(localStorage.getItem('dudo-archive') || 'null') as { runs: Run[]; gone: Record<string, number>; live: Record<string, string> } | null);
async function openLedger(page: Page) {
  await page.locator('.tab[data-t=me]').click();
  await expect(live(page, '.pane .ledg')).toBeVisible();
}

test('a family that reaches its ending goes into Sổ kết cục and stays there through Chọn lại từ 1858', async ({ page }) => {
  const errors = await seed(page, { 'dudo-v2-play': JSON.stringify(finished('Họ Phan', 'qn', reformPath)), 'dudo-mode': 'play' });
  await page.goto('/');
  await alive(page);
  await page.locator('#card [data-a=end].c').click();
  const title = (await live(page, '.end-title').textContent())!.trim();
  expect(title).not.toBe('');
  await expect.poll(async () => (await arc(page))?.runs.length).toBe(1);
  const a = (await arc(page))!, r0 = a.runs[0];
  expect(r0).toMatchObject({ mode: 'play', name: 'Họ Phan', home: 'Quảng Nam', title });
  expect(r0.save).toMatchObject({ name: 'Họ Phan', home: 'qn', picks: reformPath, ended: true });
  expect(a.live).toEqual({ play: r0.id });
  // two leads for the next game, and the note that this family is now in the book
  const next = live(page, '.end-next');
  await expect(next.locator('h2')).toHaveText('Ván sau, thử…');
  await expect(next.locator('li')).toHaveCount(2);
  await expect(next).toContainText('Hồ sơ của Họ Phan đã vào Sổ kết cục');
  // opening the ending again updates the same entry, it does not add one
  await live(page, '.ov.end .back').click();
  await page.locator('#card [data-a=end].c').click();
  await expect(live(page, '.end-title')).toHaveText(title);
  expect((await arc(page))!.runs.map(x => x.id)).toEqual([r0.id]);
  // restarting says the book is kept, and keeps it
  await live(page, '.ov.end [data-a=reset]').click();
  const dlg = page.locator('#layer > .scrim.dlg');
  await expect(dlg).toContainText('Hồ sơ đã khép của Họ Phan vẫn ở lại trong Sổ kết cục.');
  await page.locator('[data-a=reset-yes]').click();
  await expect.poll(async () => JSON.parse((await page.evaluate(() => localStorage.getItem('dudo-v2-play')))!).picks).toEqual({});
  const b = (await arc(page))!;
  expect(b.runs).toEqual(a.runs.map(x => ({ ...x, save: expect.objectContaining({ picks: reformPath }) })));
  expect(b.live).toEqual({});
  // a new game (reading mode here): the seal is still stamped and the family still listed
  await page.evaluate(s => { localStorage.setItem('dudo-v2', s); localStorage.setItem('dudo-mode', 'read'); }, JSON.stringify(midRead));
  await page.reload();
  await alive(page);
  await openLedger(page);
  await expect(page.locator('.ledg h3')).toHaveText('Sổ kết cục · 1/15');
  await expect(page.locator(`.seal[data-id="${r0.end}"]`)).not.toHaveClass(/off/);
  await expect(page.locator(`.seal[data-id="${r0.end}"] .n`)).toHaveText('Đã gặp');
  await expect(page.locator('.seal.off')).toHaveCount(14);
  await expect(page.locator('.ledg .arc-runs li')).toHaveCount(1);
  await expect(page.locator('.ledg .arc-runs')).toContainText('Họ Phan');
  expect(errors).toEqual([]);
});

test('reopening a past family is read-only: every stored byte stays the same, and there is no film, sharing or restart', async ({ page }) => {
  // the past family in the book: one written by this version, one from before save versions (no v, cvk, endSaid, xFrom, shown)
  const cur = finished('Họ Đinh', 'ct', oldPath);
  const { v: _v, cvk: _c, xFrom: _x, shown: _s, ...v0 } = finished('Họ Đoàn', 'hn', reformPath);
  const book = { v: 1, runs: [run('old0', { ...v0, ended: true }, 'canhtan', 'Bốn đời canh tân', 'Hà Nội'), run('cur1', { ...cur, ended: true, endSaid: true }, 'olainam', 'Ở lại sau ngày 30 tháng Tư', 'Cần Thơ')], gone: {}, live: {} };
  const errors = await seed(page, {
    'dudo-v2': JSON.stringify(midRead), 'dudo-mode': 'read', 'dudo-v2-play': JSON.stringify(finished('Họ Phan', 'qn', reformPath)),
    'dudo-archive': JSON.stringify(book), 'dudo-quiz-asked': '["q-e1-0"]', 'dudo-q': JSON.stringify({ m: 'auto', q: 2, v: 2 }),
  });
  await page.goto('/');
  await alive(page);
  await openLedger(page);
  await expect(page.locator('.ledg h3')).toHaveText('Sổ kết cục · 2/15');
  await expect(page.locator('.ledg .arc-runs li')).toHaveCount(2);
  const before = await storage(page);
  expect(before['dudo-archive']).toBe(JSON.stringify(book));

  for (const [id, name, home] of [['cur1', 'Họ Đinh', 'Cần Thơ'], ['old0', 'Họ Đoàn', 'Hà Nội']]) {
    await page.locator(`.ledg .arc-runs [data-a=arc-open][data-id=${id}]`).click();
    const ov = live(page, '.ov.end[data-ro]');
    await expect(ov).toBeVisible();
    await expect(ov.locator('.end-title')).not.toHaveText('');
    await expect(ov.locator('.end-kick')).toContainText(`${name} · ${home}`);
    await expect(ov.locator('.end-ro')).toContainText(`${name} khép hồ sơ ngày 2.11.2026`);
    await expect(ov.locator('.gp .gen')).toHaveCount(6);
    await expect(ov.locator('.ledger')).toBeVisible(); // gia sản: the past family's own (play mode), though the live game is reading mode
    for (const a of ['film', 'share', 'reset']) await expect(ov.locator(`[data-a=${a}]`)).toHaveCount(0);
    await expect(ov.locator('.end-next')).toHaveCount(0);
    await ov.getByText('Vì sao là kết cục này?').click();
    await ov.locator('[data-a=listen-end]').click();
    await page.waitForTimeout(1200);
    await ov.locator('[data-a=listen-end]').click();
    await ov.locator('.end-back [data-a=close]').click();
    await expect(page.locator('.ov.end')).toHaveCount(0);
    await expect(live(page, '.pane h1')).toHaveText('Họ Lê');
    await expect(page.locator(`.pane [data-a=arc-open][data-id=${id}]`)).toBeFocused();
    expect(await storage(page)).toEqual(before);
  }
  // from a seal, and closed with Escape
  await page.locator('.seal[data-id=olainam]').click();
  await live(page, '.scrim [data-a=arc-open]').click();
  await expect(live(page, '.ov.end[data-ro]')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('.ov.end')).toHaveCount(0);
  await expect(live(page, '.pane .ledg')).toBeVisible();
  await page.waitForTimeout(800);
  expect(await storage(page)).toEqual(before);
  await expect(page.locator('.toast')).toHaveCount(0); // no badge was awarded to anyone
  expect(errors).toEqual([]);
});

test('a damaged book never stops the app: unreadable is treated as empty and copied before it is overwritten; one bad entry is dropped alone', async ({ page }) => {
  const broken = '{"v":1,"runs":[{"id":"a","mode":"play","end":"xanam","save":{"name":"Họ';
  const errors = await seed(page, { 'dudo-v2': JSON.stringify(midRead), 'dudo-archive': broken });
  await page.goto('/');
  await alive(page);
  await openLedger(page);
  await expect(page.locator('.ledg h3')).toHaveText('Sổ kết cục · 0/15');
  await expect(page.locator('.ledg-e')).toContainText('Chưa có dòng họ nào khép hồ sơ');
  expect(await page.evaluate(() => localStorage.getItem('dudo-archive'))).toBe(broken); // reading never rewrites it
  // reading mode reaches its ending: a fresh book is written, the unreadable one is kept aside first
  await page.evaluate(s => localStorage.setItem('dudo-v2', s), JSON.stringify({ v: 1, step: 'play', name: 'Họ Trần', year: 2026, narr: false, picks: reformPath, quiz: { e6: [true, true] } }));
  await page.reload();
  await alive(page);
  await page.locator('#card [data-a=end].c').click();
  await expect(live(page, '.end-title')).toBeVisible();
  await expect.poll(async () => (await arc(page))?.runs.map(x => [x.mode, x.name, x.end])).toEqual([['read', 'Họ Trần', 'canhtan']]);
  expect(await page.evaluate(() => localStorage.getItem('dudo-archive-broken'))).toBe(broken);
  // in reading mode, an unmet play-only seal says so
  await live(page, '.ov.end .back').click();
  await openLedger(page);
  await page.locator('.seal[data-id=vongtoc]').click();
  await expect(live(page, '.scrim .arc-hint')).toContainText('Chỉ có ở Trò chơi.');
  await expect(live(page, '.scrim')).toContainText('Đi theo gợi ý vẫn có thể gặp một dấu xếp trước.');
  expect(errors).toEqual([]);
});

test('one bad entry in the book is dropped on its own; its neighbours and the counts of dropped-out runs still show', async ({ page }) => {
  const good = run('ok1', { ...finished('Họ Đinh', 'ct', oldPath), ended: true }, 'olainam', 'Ở lại sau ngày 30 tháng Tư', 'Cần Thơ');
  const book = { v: 1, runs: [{ id: 5 }, good, { id: 'x', mode: 'play', end: 'xanam', save: 'oops' }, null], gone: { chiadoi: 2, xabac: 'two' }, live: { play: 'nope' } };
  const errors = await seed(page, { 'dudo-v2': JSON.stringify(midRead), 'dudo-archive': JSON.stringify(book) });
  await page.goto('/');
  await alive(page);
  await openLedger(page);
  await expect(page.locator('.ledg h3')).toHaveText('Sổ kết cục · 2/15');
  await expect(page.locator('.ledg .arc-runs li')).toHaveCount(1);
  await expect(page.locator('.seal[data-id=chiadoi] .n')).toHaveText('Gặp 2 lần');
  await expect(page.locator('.seal[data-id=xanam]')).toHaveClass(/off/);
  await page.locator('.ledg .arc-runs [data-a=arc-open]').click();
  await expect(live(page, '.ov.end[data-ro] .end-kick')).toContainText('Họ Đinh');
  expect(errors).toEqual([]);
});

test('Xoá sổ kết cục asks first, with Huỷ chosen, and leaves the game, badges and settings alone', async ({ page }) => {
  const book = { v: 1, runs: [run('ok1', { ...finished('Họ Đinh', 'ct', oldPath), ended: true }, 'olainam', 'Ở lại sau ngày 30 tháng Tư', 'Cần Thơ')], gone: {}, live: {} };
  const errors = await seed(page, { 'dudo-v2': JSON.stringify({ ...midRead, badges: ['start'] }), 'dudo-archive': JSON.stringify(book) });
  await page.goto('/');
  await alive(page);
  await openLedger(page);
  const before = await storage(page);
  await page.locator('[data-a=arc-clear]').click();
  const dlg = page.locator('#layer > .scrim.dlg');
  await expect(dlg).toContainText('Xoá Sổ kết cục?');
  await expect(dlg).toContainText('hồ sơ của 1 dòng họ đã khép');
  await expect(dlg.locator('[data-a=reset-no]')).toBeFocused();
  await dlg.locator('[data-a=reset-no]').click();
  await expect(page.locator('#layer > .scrim.dlg')).toHaveCount(0);
  expect(await storage(page)).toEqual(before);
  await page.locator('[data-a=arc-clear]').click();
  await live(page, '#layer > .scrim.dlg [data-a=arc-clear-yes]').click();
  await expect(page.locator('.ledg h3')).toHaveText('Sổ kết cục · 0/15');
  await expect(page.locator('[data-a=arc-clear]')).toHaveCount(0);
  const after = await storage(page);
  expect(after['dudo-archive']).toBeUndefined();
  const { 'dudo-archive': _gone, ...rest } = before;
  expect(after).toEqual(rest);
  expect(errors).toEqual([]);
});
