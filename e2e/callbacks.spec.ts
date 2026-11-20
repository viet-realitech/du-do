import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

/* Lựa chọn cũ quay lại (biến cố hệ quả) và biến cố gia phả năm 1995 (src/data/cards2.ts):
   - một sự kiện mang hai biến cố: quyết lần lượt sau thẻ, biến cố sau chỉ mở khi người chơi bấm sang (đọc xong kết cục);
   - nhà đã đổi họ nhận lại họ cũ;
   - bản lưu của bản d11afee (trước đợt này) đã đi qua các sự kiện thì không "mọc" biến cố mới trên chúng. */

const live = (page: Page, sel: string) => page.locator(`${sel}:not(.exiting *, .cine.out, .cine.out *)`);
const ids = [...readFileSync('src/data/cards.ts', 'utf8').matchAll(/^  \['(\w+)', '/gm)].map(m => m[1]);
const es = ['e1', 'e2', 'e3', 'e4', 'e5', 'e6'];

/** Bản lưu dựng sẵn: mọi thẻ trước thẻ `upTo` (thứ tự trong cards.ts) đã quyết bằng lựa chọn đầu, trừ `cards`; biến cố
    riêng tính từ năm 0 (xFrom), nên sự kiện `upTo` có biến cố của nó. */
async function seed(page: Page, st: Record<string, unknown>, upTo: string) {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.route(/wikipedia\.org|wikimedia\.org/, r => r.abort());
  const cards = { ...Object.fromEntries(ids.slice(0, ids.indexOf(upTo)).map(id => [id, 0])), ...(st.cards as object || {}) };
  const s = { step: 'play', mode: 'play', cardv: {}, cvk: ids, xFrom: 0, narr: false, sound: false, music: false, shown: [], ...st, cards };
  await page.addInitScript(x => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('dudo-v2-play', x); localStorage.setItem('dudo-mode', 'play'); sessionStorage.setItem('seeded', '1'); } }, JSON.stringify(s));
  await page.goto('/');
  return errors;
}
const stored = (page: Page) => page.evaluate(() => JSON.parse(localStorage.getItem('dudo-v2-play')!));
/** Năm 1995, đời thứ sáu: nhà Hà Nội ở lại trong nước (năm 1980 không vượt biển). */
const y95 = { home: 'hn', year: 1995, picks: { e1: 'chien', e2: 'canvuong', e3: 'cs', e4: 'vm', e5: 'bac', e6: 'doimoi' },
  quiz: Object.fromEntries(es.slice(0, 5).map(e => [e, [true, true]])), harvests: es.slice(0, 5), res: { g: 40, d: 40, b: 40, u: 40 } };

test('1995: a typed surname gets the gia phả event, then the 1945 granary comes back, one after the other', async ({ page }) => {
  // ng45 = 0: mở kho thóc cứu đói năm 1945 (dấu khoThoc45); tn80 = 1: ở lại
  const errors = await seed(page, { ...y95, name: 'Họ Khúc', surname: '', cards: { tn80: 1 } }, 'hn95');
  await expect(page.locator('#tourb')).toBeVisible({ timeout: 8000 });
  await page.locator('#tourb [data-t=skip]').click();
  await expect(live(page, '.scrim h2')).toContainText('Bình thường hoá với Mỹ', { timeout: 8000 });
  // the two decisions after the card are announced up front
  await expect(live(page, '.scrim .steps span')).toHaveText(['1 · Thẻ sự kiện', '2 · Biến cố riêng', '3 · Hệ quả']);
  await live(page, '.scrim .opt').first().click();
  await page.locator('#cgo').click();
  const first = live(page, '.scrim .xsp').first();
  await expect(first.locator('> h3')).toHaveText('Lập lại gia phả');
  await expect(first).toContainText('Bước 2/3');
  await expect(live(page, '.scrim .steps span.on')).toHaveText('2 · Biến cố riêng');
  await first.locator('.xopts .opt').nth(1).click();
  await first.locator('#xgo').click();
  await expect(first.locator('.opt.sel .out')).toContainText('Gia phả mới chép bằng quốc ngữ');
  // the follow-up waits for the player: its outcome stays in view until "next" is tapped
  await expect(live(page, '.scrim .xsp')).toHaveCount(1);
  await expect(live(page, '.scrim .btn[data-a="close-card"]')).toHaveCount(0);
  const next = live(page, '.scrim #xnext');
  await expect(next).toBeFocused();
  await next.click();
  const second = live(page, '.scrim .xsp').nth(1);
  await expect(second.locator('> h3')).toHaveText('Kho thóc năm Ất Dậu');
  await expect(second.locator('.kick')).toContainText('Hệ quả việc năm 1945');
  await expect(second).toContainText('Bước 3/3');
  await expect(live(page, '.scrim .steps span.on')).toHaveText('3 · Hệ quả');
  await expect(second.locator('> h3')).toBeInViewport();
  await second.locator('.xopts .opt').first().click();
  await second.locator('#xgo').click();
  await expect(second.locator('.opt.sel .out')).toContainText('đọc văn tế');
  await expect(live(page, '.scrim .btn[data-a="close-card"]')).toBeVisible();
  const s = await stored(page);
  expect(s.xs.hn95).toBe('x-giapha95,x-ghion95');
  expect(s.cards).toMatchObject({ hn95: 0, 'x:x-giapha95': 1, 'x:x-ghion95': 0 });
  expect(errors).toEqual([]);
});

test('1995: a family that changed its surname can take the old one back', async ({ page }) => {
  // đổi họ năm 1945 (Tôn Thất → Nguyễn); ng45 = 2: không có hệ quả kho thóc
  const errors = await seed(page, { ...y95, name: 'Họ Nguyễn', surname: 'nguyen', names: [{ y: 1945, from: 'Họ Tôn Thất', to: 'Họ Nguyễn', why: 'Tôn Thất giữa mùa thu 1945' }],
    cards: { tn80: 1, ng45: 2, 'x:x-royal45': 0 }, xs: { ng45: 'x-royal45' } }, 'hn95');
  await expect(page.locator('#tourb')).toBeVisible({ timeout: 8000 });
  await page.locator('#tourb [data-t=skip]').click();
  await expect(live(page, '.scrim h2')).toContainText('Bình thường hoá với Mỹ', { timeout: 8000 });
  await expect(live(page, '.scrim .steps span')).toHaveText(['1 · Thẻ sự kiện', '2 · Biến cố riêng']);
  await live(page, '.scrim .opt').first().click();
  await page.locator('#cgo').click();
  const x = live(page, '.scrim .xsp');
  await expect(x.locator('> h3')).toHaveText('Lập lại gia phả: hai cái tên');
  await expect(live(page, '.scrim .steps')).toHaveClass(/two/);
  await expect(x.locator('.xopts .opt').first()).toContainText('Đổi họ');
  await x.locator('.xopts .opt').first().click();
  await x.locator('#xgo').click();
  await expect(x).toContainText('Họ Nguyễn từ nay mang tên Họ Tôn Thất');
  const s = await stored(page);
  expect(s.name).toBe('Họ Tôn Thất');
  expect(s.surname).toBe('tonthat');
  expect(s.names.map((n: { to: string }) => n.to)).toEqual(['Họ Nguyễn', 'Họ Tôn Thất']);
  expect(errors).toEqual([]);
});

test('1995: a Mạc family meets the clan branches instead of the common gia phả event', async ({ page }) => {
  const errors = await seed(page, { ...y95, name: 'Họ Mạc', surname: 'mac', cards: { tn80: 1, ng45: 2 } }, 'hn95');
  await expect(page.locator('#tourb')).toBeVisible({ timeout: 8000 });
  await page.locator('#tourb [data-t=skip]').click();
  await expect(live(page, '.scrim h2')).toContainText('Bình thường hoá với Mỹ', { timeout: 8000 });
  await live(page, '.scrim .opt').first().click();
  await page.locator('#cgo').click();
  await expect(live(page, '.scrim .xsp > h3')).toHaveText('Các chi họ Mạc tìm lại nhau');
  await expect(live(page, '.scrim .xsp .kick')).toContainText('Biến cố riêng của Họ Mạc');
  expect(errors).toEqual([]);
});

test('a save written before this wave keeps the events it has passed as they were', async ({ page }) => {
  // bản lưu thật của bản d11afee, năm 1990: họ Trần (biến cố năm 1936 nay có), đã lập cơ sở Việt Minh năm 1941 (hệ quả năm
  // 1945 nay có); cả hai sự kiện đã quyết từ trước nên không hiện thêm gì, dòng thời gian không lùi về
  const old = JSON.parse(readFileSync('e2e/fixtures/save-d11afee-1990.json', 'utf8'));
  expect(old.cards).toMatchObject({ mt36: expect.any(Number), vm41: 0, ng45: expect.any(Number) });
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.route(/wikipedia\.org|wikimedia\.org/, r => r.abort());
  await page.addInitScript(x => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('dudo-v2-play', x); localStorage.setItem('dudo-mode', 'play'); sessionStorage.setItem('seeded', '1'); } },
    JSON.stringify({ ...old, narr: false, sound: false, music: false }));
  await page.goto('/');
  await expect(page.locator('#yr')).toHaveText('1990');
  await page.waitForTimeout(1500);
  await expect(page.locator('#tourb')).toBeHidden();
  await expect(page.locator('#layer > .scrim')).toHaveCount(0);
  const s = await stored(page);
  expect(s.year).toBe(1990);
  expect(s.cards).toEqual(old.cards); // chỉ số đã quyết đọc y như cũ
  for (const [id, x] of Object.entries(old.xs)) expect(s.xs[id], id).toBe(x); // biến cố đã chốt giữ nguyên
  expect(s.xs.mt36).toBe('');
  expect(s.xs.ng45).toBe('');
  expect(errors).toEqual([]);
});
