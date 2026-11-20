import { test, expect, devices, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { navCut } from './fixtures/errors';

/* Sổ kết cục (iPad Pro 11, cả Chromium lẫn WebKit):
   - dòng họ đi tới kết cục được cất cả bản lưu vào 'dudo-archive'; mở lại màn kết không cất thêm; chọn lại từ 1858 giữ sổ
     (hộp xác nhận nói rõ), dấu kết cục vẫn đóng son trong Hồ sơ;
   - mở lại hồ sơ một dòng họ đã khép chỉ để xem: bộ nhớ (ván đang chơi, ván của luồng kia, huy hiệu, cài đặt, sổ) không
     đổi một byte, không phim, không chia sẻ, không nút chọn lại; bản lưu cũ chưa đánh số trong sổ đi qua các bước nâng cấp;
   - sổ hỏng không bao giờ làm chết ứng dụng (không màn khôi phục): hỏng cả thì coi như trống và cất một bản sao trước khi
     ghi đè, hỏng một hồ sơ thì bỏ riêng hồ sơ ấy;
   - "Xoá sổ kết cục" hỏi lại trước và không đụng ván đang chơi;
   - hồ sơ mở lại giữ đúng kết cục và ngưỡng gia sản đã ghi lúc khép, dù bảng mô phỏng (endings-rarity.json) đã tính lại;
   - "Bắt đầu lại" của màn khôi phục, như chọn lại từ 1858, làm ván mới thành một hồ sơ mới trong sổ. */

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
type Run = { id: string; at: string; mode: 'read' | 'play'; end: string; title: string; name: string; home: string; save: Record<string, unknown>; th?: unknown; tiers?: unknown };
/** Hàng ngưỡng gia sản [P5, P25, P60, P92] của quê sau đời thứ sáu, theo bảng mô phỏng hôm nay. */
const tiers6 = (home: string): number[] => JSON.parse(readFileSync('src/data/endings-rarity.json', 'utf8')).tiers[home][5];
const run = (id: string, save: Record<string, unknown>, end: string, title: string, home: string): Run => ({ id, at: '2026-11-02T09:00:00.000Z', mode: 'play', end, title, name: save.name as string, home, save });

/** Đặt bộ nhớ một lần (tải lại trang không đặt lại), chặn Wikipedia, gom lỗi trang. */
async function seed(page: Page, items: Record<string, string>) {
  const errors: string[] = [];
  page.on('pageerror', e => { if (!navCut(e.message)) errors.push(e.message); });
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
  const t6 = tiers6('qn');
  expect(r0).toMatchObject({ mode: 'play', name: 'Họ Phan', home: 'Quảng Nam', title, th: { lo: t6[0], hi: t6[3] }, tiers: t6 }); // the wealth lines it was stamped with
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
  // two rename events come to any surname, typed ones too: the hint names paths and homes as well as surnames
  await page.keyboard.press('Escape');
  await expect(page.locator('#layer .scrim')).toHaveCount(0);
  await page.locator('.seal[data-id=doiho]').click();
  await expect(live(page, '.scrim .arc-hint')).toContainText('Biến cố như vậy chỉ đến trong một số hoàn cảnh: theo một số hướng, ở một số quê, hay với một số họ.');
  expect(errors).toEqual([]);
});

test('one bad entry in the book is dropped on its own; its neighbours and the counts of dropped-out runs still show', async ({ page }) => {
  const good = { ...run('ok1', { ...finished('Họ Đinh', 'ct', oldPath), ended: true }, 'olainam', 'Ở lại sau ngày 30 tháng Tư', 'Cần Thơ'), th: { lo: 'x' }, tiers: [1, 2] }; // bad thresholds: dropped; its save has no endFix either, so today's table is used
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

test('a reopened family keeps the ending and wealth lines it was stamped with, even after the simulation table has moved', async ({ page }) => {
  // two families stamped with thresholds that today's table (endings-rarity.json) no longer has: worked out again today,
  // "up" would fall to Còn lại tên họ and "down" would climb out of it
  const t = tiers6('ct'), d = 45, at = (s: number) => { const x = Math.floor((s - d) / 3); return r(s - d - 2 * x, d, x, x); };
  const up = t[0] - 3, down = t[0] + 20;
  expect(down).toBeLessThan(t[3]);
  const runUp = { ...run('up', { ...finished('Họ Đinh', 'ct', oldPath), res: at(up), ended: true, endSaid: true }, 'olainam', 'Ở lại sau ngày 30 tháng Tư', 'Cần Thơ'),
    th: { lo: up - 15, hi: up + 120 }, tiers: [up - 15, up + 20, up + 80, up + 120] };
  const runDown = { ...run('down', { ...finished('Họ Đoàn', 'ct', oldPath), res: at(down), ended: true, endSaid: true }, 'lytan', 'Còn lại tên họ', 'Cần Thơ'),
    th: { lo: down + 10, hi: down + 100 }, tiers: [down + 10, down + 30, down + 60, down + 100] };
  const book = { v: 1, runs: [runUp, runDown], gone: {}, live: {} };
  const errors = await seed(page, { 'dudo-v2': JSON.stringify(midRead), 'dudo-mode': 'read', 'dudo-archive': JSON.stringify(book) });
  await page.goto('/');
  await alive(page);
  await openLedger(page);
  for (const id of ['olainam', 'lytan']) await expect(page.locator(`.seal[data-id=${id}] .n`)).toHaveText('Đã gặp');
  const before = await storage(page);

  await page.locator('.ledg .arc-runs [data-a=arc-open][data-id=up]').click();
  let ov = live(page, '.ov.end[data-ro=up]');
  await expect(ov.locator('.end-mast .stamp')).toHaveText('Ở lại');
  await expect(ov.locator('.end-title')).toHaveText('Ở lại sau ngày 30 tháng Tư');
  await expect(ov.locator('.end-rank b')).toHaveText('Nhà sa sút'); // its own lines: above P5, below P25
  await ov.locator('[data-a=listen-end]').click();
  await ov.locator('[data-a=listen-end]').click();
  await ov.locator('.end-back [data-a=close]').click();
  await expect(page.locator('.ov.end')).toHaveCount(0);

  await page.locator('.ledg .arc-runs [data-a=arc-open][data-id=down]').click();
  ov = live(page, '.ov.end[data-ro=down]');
  await expect(ov.locator('.end-mast .stamp')).toHaveText('Giữ được tên');
  await expect(ov.locator('.end-title')).toHaveText('Còn lại tên họ');
  await expect(ov.locator('.end-why p')).toHaveText(new RegExp(`Tổng gia sản ${down}; ngưỡng 5% thấp nhất ở Cần Thơ là ${down + 10}\\.$`));
  await expect(ov.locator('.end-rank b')).toHaveText('Còn lại tên họ');
  await ov.locator('.end-back [data-a=close]').click();
  await expect(page.locator('.ov.end')).toHaveCount(0);
  expect(await storage(page)).toEqual(before);
  expect(errors).toEqual([]);
});

test("after the recovery screen's Bắt đầu lại, the same path played again is a new family in the book, not the archived one overwritten", async ({ page }) => {
  const old = { ...finished('Họ Phan', 'qn', reformPath), ended: true, endSaid: true };
  const book = { v: 1, runs: [run('famX', old, 'canhtan', 'Ba đời canh tân', 'Quảng Nam')], gone: {}, live: { play: 'famX' } };
  await seed(page, { 'dudo-v2-play': '{"step":"play","mode":"play",', 'dudo-mode': 'play', 'dudo-archive': JSON.stringify(book) });
  await page.goto('/');
  const box = page.locator('#rescue');
  await expect(box).toBeVisible();
  await box.getByRole('button', { name: 'Bắt đầu lại' }).click();
  const fresh = page.waitForEvent('load');
  await box.getByRole('button', { name: 'Xoá và bắt đầu lại' }).click();
  await fresh;
  await expect(page.locator('#rescue')).toHaveCount(0);
  const a = (await arc(page))!;
  expect(a.live).toEqual({}); // the wiped game is no longer the archived family
  expect(a.runs).toEqual(book.runs);
  // a new family on the same surname, home and six turning points, with another journey (other wealth)
  const errors: string[] = [];
  page.on('pageerror', e => { if (!navCut(e.message)) errors.push(e.message); });
  await page.evaluate(s => localStorage.setItem('dudo-v2-play', s), JSON.stringify({ ...finished('Họ Phan', 'qn', reformPath), res: r(70, 70, 70, 70) }));
  await page.reload();
  await alive(page);
  await page.locator('#card [data-a=end].c').click();
  await expect(live(page, '.end-title')).not.toHaveText('');
  await expect.poll(async () => (await arc(page))?.runs.length).toBe(2);
  const b = (await arc(page))!;
  expect(b.runs[0]).toEqual(book.runs[0]); // the earlier family's dossier is untouched
  expect(b.runs[1].id).not.toBe('famX');
  expect(b.runs[1].save).toMatchObject({ res: r(70, 70, 70, 70) });
  expect(b.live).toEqual({ play: b.runs[1].id });
  expect(errors).toEqual([]);
});

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
const stored = (page: Page) => page.evaluate(() => JSON.parse(localStorage.getItem('dudo-v2-play')!));
/** Mọi thẻ tới thẻ `id` (thứ tự trong cards.ts) đã quyết bằng lựa chọn `n`. */
const upTo = (id: string, n: number) => Object.fromEntries(ids.slice(0, ids.indexOf(id) + 1).map(x => [x, n]));

test('play mode closes a dossier only at 2026: no Xem kết luận in Hồ sơ at 1976, an early read is neither kept nor filed, and the 1980 crossing decides the ending', async ({ page }) => {
  const path = { e1: 'chien', e2: 'canvuong', e3: 'qdd', e4: 'qg', e5: 'nam', e6: 'baocap' };
  // 1976: six turning points chosen, five harvests; in 1975 the family stayed (sg75 = 2)
  const at76 = { ...finished('Họ Trần', 'hn', path), year: 1976, xFrom: 1976, cards: { ...upTo('tn76', 0), sg75: 2 }, harvests: es.slice(0, 5), sound: false, music: false };
  const errors = await seed(page, { 'dudo-v2-play': JSON.stringify(at76), 'dudo-mode': 'play' });
  await page.goto('/');
  await alive(page);
  await openLedger(page);
  await expect(live(page, '.pane [data-a=share]')).toBeVisible();
  await expect(page.locator('.pane [data-a=end]')).toHaveCount(0);
  expect((await stored(page)).harvests).toEqual(es.slice(0, 5)); // the sixth harvest is not taken early
  // the ending screen itself keeps nothing before 2026 (2025, every harvest and quiz done: the action opens it directly)
  await page.evaluate(s => localStorage.setItem('dudo-v2-play', s), JSON.stringify({ ...at76, year: 2025, harvests: es }));
  await page.reload();
  await alive(page);
  await act(page, 'end');
  await expect(live(page, '.ov.end .end-title')).not.toHaveText('');
  let s = await stored(page);
  expect(s.endFix).toBeUndefined();
  expect(s.endSaid).toBe(false);
  expect(await arc(page)).toBeNull();
  // 2026, after the 1980 crossing (tn80 = 0): the ending follows it, and only now is it kept and filed
  const at26 = { ...at76, year: 2026, cards: { ...upTo('st25', 1), ...upTo('tn76', 0), sg75: 2, tn80: 0 }, harvests: es };
  await page.evaluate(s => localStorage.setItem('dudo-v2-play', s), JSON.stringify(at26));
  await page.reload();
  await alive(page);
  await openLedger(page);
  await live(page, '.pane [data-a=end]').click();
  const end = live(page, '.ov.end');
  await expect(end.locator('.end-title')).toHaveText('Bên kia đại dương');
  await expect(end.locator('.end-plate .mp-l li').last()).toHaveText(/1980\s*Cả nhà vượt biển; từ đó sống ở xứ người/);
  s = await stored(page);
  expect(s.endFix?.id).toBe('xanam');
  await expect.poll(async () => (await arc(page))?.runs.map(x => x.end)).toEqual(['xanam']);
  // closed, then the timeline moved back to 1960: Hồ sơ still offers the kept ending (it no longer changes)
  await page.evaluate(() => { const k = 'dudo-v2-play', s = JSON.parse(localStorage.getItem(k)!); s.year = 1960; localStorage.setItem(k, JSON.stringify(s)); });
  await page.reload();
  await alive(page);
  await openLedger(page);
  await live(page, '.pane [data-a=end]').click();
  await expect(live(page, '.ov.end .end-title')).toHaveText('Bên kia đại dương');
  await expect.poll(async () => (await arc(page))?.runs.map(x => x.end)).toEqual(['xanam']); // nothing filed twice
  expect(errors).toEqual([]);
});

test('a closed play dossier takes no further card decisions: a skipped optional card offers no Dòng họ làm gì?', async ({ page }) => {
  const fam = finished('Họ Đỗ', 'hn', oldPath), { ld87: _skip, ...cards } = fam.cards;
  const errors = await seed(page, { 'dudo-v2-play': JSON.stringify({ ...fam, cards, sound: false, music: false }), 'dudo-mode': 'play' });
  await page.goto('/');
  await alive(page);
  // before the dossier is closed, the 1887 card can still be taken up
  await act(page, 'ev', { id: 'ld87' });
  await expect(live(page, '.ov.evp [data-a=card]')).toContainText('Dòng họ làm gì?');
  await page.keyboard.press('Escape');
  await expect(page.locator('#layer > .ov')).toHaveCount(0);
  await page.locator('#card [data-a=end].c').click();
  const title = (await live(page, '.ov.end .end-title').textContent())!.trim();
  expect((await stored(page)).endFix?.id).toBeTruthy();
  await live(page, '.ov.end .back').click();
  await expect(page.locator('#layer > .ov')).toHaveCount(0);
  // closed: no card on the event page, nothing left to decide; the ending reads the same
  await act(page, 'ev', { id: 'ld87' });
  await expect(live(page, '.ov.evp h1')).toBeVisible();
  await expect(page.locator('.ov.evp [data-a=card]')).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(page.locator('#layer > .ov')).toHaveCount(0);
  await page.locator('#card [data-a=end].c').click();
  await expect(live(page, '.ov.end .end-title')).toHaveText(title);
  expect('ld87' in (await stored(page)).cards).toBe(false);
  expect(errors).toEqual([]);
});

test('a family that read its ending before this update is in Sổ kết cục as soon as Hồ sơ opens; clearing the book does not bring it back', async ({ page }) => {
  // bản lưu thật của bản d11afee đã đọc kết cục "Bên kia đại dương" (ended, endSaid), khi chưa có Sổ kết cục
  const old = JSON.parse(readFileSync('e2e/fixtures/save-d11afee-end.json', 'utf8'));
  const errors = await seed(page, { 'dudo-v2-play': JSON.stringify({ ...old, narr: false, sound: false, music: false }), 'dudo-mode': 'play' });
  await page.goto('/');
  await alive(page);
  await openLedger(page);
  await expect(page.locator('.ledg h3')).toHaveText('Sổ kết cục · 1/15');
  await expect(page.locator('.ledg-e')).toHaveCount(0);
  await expect(page.locator('.ledg .arc-runs li')).toHaveCount(1);
  await expect(page.locator('.ledg .arc-runs')).toContainText('Họ Lê · ván này');
  await expect(page.locator('.seal[data-id=xanam] .n')).toHaveText('Đã gặp');
  const a = (await arc(page))!;
  expect(a.runs.map(x => [x.end, x.title, x.home])).toEqual([['xanam', 'Bên kia đại dương', 'Nam Định']]);
  expect(a.runs[0].tiers).toEqual([165, 197, 265, 298]); // the wealth lines it was read with
  expect((await stored(page)).endFix).toEqual({ id: 'xanam', t: [165, 197, 265, 298] });
  // the player clears the book: the finished family is not filed again behind their back
  await page.locator('[data-a=arc-clear]').click();
  await live(page, '#layer > .scrim.dlg [data-a=arc-clear-yes]').click();
  await expect(page.locator('.ledg h3')).toHaveText('Sổ kết cục · 0/15');
  await page.locator('[data-a=bigtext]').click(); // Hồ sơ is drawn again
  await expect(page.locator('html')).toHaveAttribute('data-text', 'big');
  await expect(page.locator('.ledg h3')).toHaveText('Sổ kết cục · 0/15');
  expect(await arc(page)).toBeNull();
  expect(errors).toEqual([]);
});

test('Chữ lớn enlarges the seal stamps and numbers of Sổ kết cục like the text beside them', async ({ page }) => {
  const book = { v: 1, runs: [run('ok1', { ...finished('Họ Đinh', 'ct', oldPath), ended: true }, 'olainam', 'Ở lại sau ngày 30 tháng Tư', 'Cần Thơ')], gone: {}, live: {} };
  const errors = await seed(page, { 'dudo-v2': JSON.stringify({ ...midRead, sound: false, music: false }), 'dudo-archive': JSON.stringify(book) });
  await page.goto('/');
  await alive(page);
  await openLedger(page);
  const SEL = ['.seal .no', '.seal .sl', '.arc-run .sl', '.seal b'];
  const sizes = () => page.evaluate(sel => sel.map(s => parseFloat(getComputedStyle(document.querySelector(s)!).fontSize)), SEL);
  /** Cỡ chữ của dấu trong hộp một dấu (chạm vào dấu). */
  const dt = async () => {
    await page.locator('.seal[data-id=olainam]').click();
    const n = parseFloat(await live(page, '.scrim .arc-dt .sl').evaluate(e => getComputedStyle(e).fontSize));
    await page.keyboard.press('Escape');
    await expect(page.locator('#layer > .scrim')).toHaveCount(0);
    return n;
  };
  const s0 = await sizes(), d0 = await dt();
  await page.locator('[data-a=bigtext]').click();
  await expect(page.locator('html')).toHaveAttribute('data-text', 'big');
  const s1 = await sizes(), d1 = await dt();
  s0.forEach((n, i) => expect(s1[i] / n, SEL[i]).toBeCloseTo(1.18, 2));
  expect(d1 / d0).toBeCloseTo(1.18, 2);
  // the larger stamps wrap inside their cells: nothing scrolls sideways
  expect(await page.evaluate(() => [...document.querySelectorAll<HTMLElement>('.pane, .seals, .arc-runs')].filter(e => e.scrollWidth > e.clientWidth + 1).map(e => e.className))).toEqual([]);
  expect(errors).toEqual([]);
});
