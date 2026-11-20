import { test, expect, devices, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

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
  // the card's own outcome first: nothing scrolls it away until "next" is tapped
  const next0 = live(page, '.scrim #xnext');
  await expect(next0).toBeFocused();
  await page.waitForTimeout(700);
  await expect(live(page, '.scrim .sheet > [role=radiogroup] .opt.sel .out')).toBeInViewport({ ratio: 1 });
  await expect(live(page, '.scrim .xsp')).toHaveCount(0);
  await next0.click();
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
  await live(page, '.scrim #xnext').click();
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
  await live(page, '.scrim #xnext').click();
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

/** Đi trọn con đường bằng mã của trò chơi trong node (e2e/fixtures/follow-ups.ts). */
type Run = { xs: Record<string, string>; name: string; names: { y: number; from: string; to: string; why: string }[]; doiho: string };
type Path = { sk: string; home: string; path: string[]; want?: Record<string, string>; moms?: Record<string, string> };
const runs = (cases: Path[]): Run[] => JSON.parse(execFileSync(process.execPath, ['--import', 'tsx', 'e2e/fixtures/follow-ups.ts'], { input: JSON.stringify(cases), encoding: 'utf8' }));

test('a follow-up is settled after the card it rides on: it never asks about what the family has just done', () => {
  test.skip(test.info().project.name !== 'chromium', 'node only');
  const hn = (path: string[], want: Record<string, string>): Path => ({ sk: 'khuc', home: 'hn', path, want });
  const base = ['chien', 'duytan', 'cs', 'qg', 'bac', 'doimoi'], cv = ['chien', 'canvuong', 'cs', 'qg', 'bac', 'doimoi'], vm = ['chien', 'duytan', 'cs', 'vm', 'bac', 'doimoi'];
  const r = runs([
    // 0-5 Cần Vương 1885: the interpreter son (gt74) and the son-in-law who served Trương Định (td64, Nam Kỳ)
    hn(base, { gt74: 'Xin làm việc', cv85: 'Hưởng ứng' }),
    hn(base, { gt74: 'Xin làm việc', cv85: 'Góp tiền' }),
    ...['Bán ruộng', 'Gửi con trai', 'Giấu lương'].map(c => hn(cv, { gt74: 'Xin làm việc', cv85: c })),
    { sk: 'khuc', home: 'sg', path: base, want: { td64: 'Che giấu', gt74: 'Giữ nếp', cv85: 'Hưởng ứng' } },
    { sk: 'khuc', home: 'sg', path: base, want: { td64: 'Che giấu', gt74: 'Giữ nếp', cv85: 'Đứng ngoài' } },
    // 7-11 August 1945: the buried rice (nh40) and the Việt Minh cell (vm41)
    hn(base, { nh40: 'Giấu thóc', vm41: 'Theo dõi', ng45: 'Bán thóc' }),
    hn(base, { nh40: 'Giấu thóc', vm41: 'Theo dõi', ng45: 'Mở kho' }),
    hn(base, { nh40: 'Bán hàng', vm41: 'Lập cơ sở', ng45: 'Theo Việt Minh' }),
    hn(vm, { nh40: 'Bán hàng', vm41: 'Lập cơ sở', ng45: 'Dẫn đoàn' }),
    hn(vm, { nh40: 'Bán hàng', vm41: 'Lập cơ sở', ng45: 'Giữ an ninh' }),
  ]);
  expect(r[0].xs.cv85).toBe('');
  expect(r[1].xs.cv85).toBe('x-thongngon74');
  for (const x of r.slice(2, 5)) expect(x.xs.cv85).toBe('');
  expect(r[5].xs.cv85).toBe('');
  expect(r[6].xs.cv85).toBe('x-re64');
  expect(r[7].xs.ng45).toBe('');
  expect(r[8].xs.ng45).toBe('x-thoc45');
  expect(r[9].xs.ng45).toBe('');
  expect(r[10].xs.ng45).toBe('');
  expect(r[11].xs.ng45).toBe('x-co45');
});

test('1995: the village memorials reach families still in the village; taking the old name back is offered only to those who lost it', () => {
  test.skip(test.info().project.name !== 'chromium', 'node only');
  // ở lại trong nước: năm 1975 (nhà đã vào Nam) và năm 1980
  const stay = { tn80: 'Ở lại', sg75: 'Ở lại' };
  const r = runs([
    // 0-1 a Nam Định family that opened its granary in 1945, then moved South in 1954 or stayed
    { sk: 'khuc', home: 'nd', path: ['chien', 'duytan', 'cs', 'vm', 'nam', 'doimoi'], want: { ...stay, ng45: 'Mở kho', dc54: 'Cả nhà đi' } },
    { sk: 'khuc', home: 'nd', path: ['chien', 'duytan', 'cs', 'vm', 'bac', 'doimoi'], want: { tn80: 'Ở lại', ng45: 'Mở kho' } },
    // 2 Trần → Nguyễn (1896) → Trần again on the 1978 form: already on its first name
    { sk: 'tran', home: 'hn', path: ['hoa', 'canvuong', 'cs', 'qg', 'nam', 'doimoi'], want: { ...stay, 'x:x-canvuong96': 'Lấy họ mẹ', 'x:x-lylich78': 'Chuyển các cháu' }, moms: { 'x:x-canvuong96': 'Họ Nguyễn', 'x:x-lylich78': 'Họ Trần' } },
    // 3 Ngô → the mother's name in 1963, then back in 1995
    { sk: 'ngo', home: 'sg', path: ['chien', 'canvuong', 'cs', 'qg', 'nam', 'doimoi'], want: { ...stay, 'x:x-ngo63': 'Chuyển các cháu', 'x:x-hoten95': 'Nhận lại họ cũ' } },
  ]);
  expect(r[0].xs.hn95).not.toContain('x-ghion95');
  expect(r[1].xs.hn95).toContain('x-ghion95');
  expect(r[2].name).toBe('Họ Trần');
  expect(r[2].xs.hn95).toBe('x-giapha95');
  expect(r[2].doiho).toContain('Năm 1978, qua biến cố “Tờ khai lý lịch”, dòng họ lại mang họ Trần.');
  expect(r[2].doiho).not.toContain('nhận lại họ cũ');
  expect(r[3].xs.hn95).toBe('x-hoten95');
  expect(r[3].names.map(n => n.to)).toEqual(['Họ Nguyễn', 'Họ Ngô']);
  expect(r[3].doiho).toContain('Năm 1995, dòng họ làm giấy tờ nhận lại họ cũ.');
});

test('1885: joining the Cần Vương call drops the follow-ups the card had announced', async ({ page }) => {
  // nhà Nam Kỳ đã nuôi giấu lính Trương Định (td64 = 0) và có con làm thông ngôn (gt74 = 0): thẻ báo trước hai hệ quả
  const errors = await seed(page, { home: 'sg', year: 1885, name: 'Họ Khúc', surname: '', picks: { e1: 'chien', e2: 'duytan' }, quiz: { e1: [true, true] }, harvests: ['e1'], res: { g: 40, d: 40, b: 40, u: 40 } }, 'cv85');
  await expect(page.locator('#tourb')).toBeVisible({ timeout: 8000 });
  await page.locator('#tourb [data-t=skip]').click();
  await expect(live(page, '.scrim h2')).toContainText('Chiếu Cần Vương', { timeout: 8000 });
  await expect(live(page, '.scrim .steps span')).toHaveText(['1 · Thẻ sự kiện', '2 · Hệ quả', '3 · Hệ quả']);
  await live(page, '.scrim .opt').filter({ hasText: 'Hưởng ứng Chiếu Cần Vương' }).click();
  await page.locator('#cgo').click();
  await expect(live(page, '.scrim .opt.sel .out')).toContainText('Cả họ lên rừng');
  await expect(live(page, '.scrim .btn[data-a="close-card"]')).toBeVisible();
  await expect(live(page, '.scrim .xsp')).toHaveCount(0);
  await expect(live(page, '.scrim #xnext')).toHaveCount(0);
  await expect(live(page, '.scrim .steps')).toHaveCount(0);
  const s = await stored(page);
  expect(s.xs.cv85).toBe('');
  expect(errors).toEqual([]);
});

test('an ending once read keeps its name when the wealth table is regenerated', async ({ page }) => {
  // bản lưu thật của bản d11afee đã đọc kết cục "Bên kia đại dương" (Nam Định, tổng gia sản 169, ngưỡng 5% thấp nhất khi
  // ấy là 165): mở lại vẫn kết cục ấy, và hồ sơ ghi kết cục cùng ngưỡng đã dùng
  const old = JSON.parse(readFileSync('e2e/fixtures/save-d11afee-end.json', 'utf8'));
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.route(/wikipedia\.org|wikimedia\.org/, r => r.abort());
  const open = async (st: object, key: string) => {
    await page.addInitScript(([x, k]) => { if (!sessionStorage.getItem(k)) { localStorage.setItem('dudo-v2-play', x); localStorage.setItem('dudo-mode', 'play'); sessionStorage.setItem(k, '1'); } }, [JSON.stringify(st), key]);
    await page.goto('/');
    await page.locator('#card [data-a=end].c').click();
  };
  await open({ ...old, narr: false, sound: false, music: false }, 'seeded');
  await expect(page.locator('.end-title')).toHaveText('Bên kia đại dương');
  expect((await stored(page)).endFix).toEqual({ id: 'xanam', t: [165, 197, 265, 298] });
  // ngưỡng lấy từ hồ sơ: đặt ngưỡng cao hơn mọi gia sản thì cùng dòng họ ấy thành nhóm sa sút nhất, và giữ như vậy khi mở lại
  await open({ ...old, v: 2, narr: false, sound: false, music: false, endSaid: false, endFix: { t: [999, 999, 999, 999] } }, 'seeded2');
  await expect(page.locator('.end-title')).toHaveText('Còn lại tên họ');
  await expect(page.locator('.end-rank')).toContainText('Còn lại tên họ');
  expect((await stored(page)).endFix).toEqual({ id: 'lytan', t: [999, 999, 999, 999] });
  await page.reload();
  await page.locator('#card [data-a=end].c').click();
  await expect(page.locator('.end-title')).toHaveText('Còn lại tên họ');
  expect(errors).toEqual([]);
});

test.describe('on an iPad in landscape', () => {
  const { defaultBrowserType: _, ...ipadL } = devices['iPad Pro 11 landscape'];
  test.use(ipadL);

  test('1995: the card outcome stays in view after Quyết định; the family event waits for Sang việc kế tiếp', async ({ page }) => {
    const errors = await seed(page, { ...y95, name: 'Họ Khúc', surname: '', cards: { tn80: 1 } }, 'hn95');
    await expect(page.locator('#tourb')).toBeVisible({ timeout: 8000 });
    await page.locator('#tourb [data-t=skip]').click();
    await expect(live(page, '.scrim h2')).toContainText('Bình thường hoá với Mỹ', { timeout: 8000 });
    await live(page, '.scrim .opt').first().click();
    await page.locator('#cgo').click();
    const next = live(page, '.scrim #xnext');
    await expect(next).toBeFocused();
    // trước đây ~300 ms sau khi quyết, bảng tự cuộn tới biến cố: kết cục của thẻ trôi lên khỏi mép bảng
    await page.waitForTimeout(700);
    await expect(live(page, '.scrim .sheet > [role=radiogroup] .opt.sel .out')).toBeInViewport({ ratio: 1 });
    await expect(live(page, '.scrim .xsp')).toHaveCount(0);
    await next.click();
    await expect(live(page, '.scrim .xsp > h3').first()).toBeInViewport();
    expect(errors).toEqual([]);
  });
});
