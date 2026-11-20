import { test, expect, type Page } from '@playwright/test';
import { readFileSync, writeFileSync } from 'node:fs';

/* Ngân sách công việc của bản đồ, đếm bằng MutationObserver: không đo thời gian hay khung hình (máy CI dùng chung lệch
   ±10–25%, số khung hình vẽ được tuỳ máy). Giữ hai điều làm iPad mượt sau các đợt A–D:
   - vẽ lại khi năm không đổi (về tab Bản đồ, đóng một bảng) không ghi gì vào bản đồ: lỗi nặng nhất trước đây là renderMain
     ghi lại cùng thuộc tính mỗi khung hình (MutationObserver ghi cả những lần ghi cùng giá trị);
   - kéo thanh năm thêm một số nút DOM có hạn (e2e/perf-budget.json, theo trình duyệt). Thay đổi cố ý thêm việc thì đo lại:
     `npm run perf:budget` ghi số đo × margin. */

const BUDGET_FILE = 'e2e/perf-budget.json';
type Budget = { about: string; margin: number; drag: Record<string, { measured: number; budget: number }> };
const readBudget = (): Budget => JSON.parse(readFileSync(BUDGET_FILE, 'utf8'));

const STATE = { step: 'play', name: 'Họ Lê', year: 1955, picks: { e1: 'chien', e2: 'duytan', e3: 'cs', e4: 'vm', e5: 'nam' }, quiz: { e1: [true, true], e2: [true, false], e3: [true, true], e4: [false, true] }, narr: false, sound: false, music: false };

async function boot(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.route(/wikipedia\.org|wikimedia\.org/, r => r.abort());
  // mức hiệu ứng cố định: bộ tự chỉnh không đổi mức (và tô lại bản đồ) giữa chừng trên máy chậm
  await page.addInitScript(s => { localStorage.setItem('dudo-v2', s); localStorage.setItem('dudo-q', JSON.stringify({ m: 'full', q: 2, v: 2 })); }, JSON.stringify(STATE));
  await page.goto('/');
  await page.waitForSelector('#map text[data-city]');
  return errors;
}

type Tally = { records: number; added: number; log: string[] };
/** Đếm mọi thay đổi DOM trong các vùng `sels` (thuộc tính, nút con, chữ): số bản ghi, số nút thêm (kể cả con cháu của nút
    thêm: dựng lại bằng innerHTML tính đủ), vài dòng mô tả cho thông báo lỗi. Gọi lại thì bắt đầu đếm từ đầu. */
async function observe(page: Page, sels: string[]) {
  await page.evaluate(sels => {
    type W = { mut?: { t: { records: number; added: number; log: string[] }; mo: MutationObserver } };
    const w = window as unknown as W;
    w.mut?.mo.disconnect();
    const t = { records: 0, added: 0, log: [] as string[] };
    const name = (n: Node) => { const e = n as Element; return e.id ? '#' + e.id : e.getAttribute?.('class') ? `${e.nodeName.toLowerCase()}.${e.getAttribute('class')}` : n.nodeName.toLowerCase(); };
    const count = (rs: MutationRecord[]) => {
      for (const r of rs) {
        t.records++;
        r.addedNodes.forEach(n => { t.added += 1 + (n.nodeType === 1 ? (n as Element).querySelectorAll('*').length : 0); });
        if (t.log.length < 12) t.log.push(`${r.type} ${name(r.target)}${r.attributeName ? ' @' + r.attributeName : ''}${r.addedNodes.length ? ' +' + r.addedNodes.length : ''}${r.removedNodes.length ? ' -' + r.removedNodes.length : ''}`);
      }
    };
    const mo = new MutationObserver(count);
    for (const s of sels) mo.observe(document.querySelector(s)!, { attributes: true, childList: true, characterData: true, subtree: true });
    w.mut = { t, mo };
    (w as unknown as { flush: () => void }).flush = () => count(mo.takeRecords());
  }, sels);
}
/** Số đếm tới giờ (kể cả bản ghi chưa kịp giao cho callback). */
const tally = (page: Page): Promise<Tally> => page.evaluate(() => {
  const w = window as unknown as { mut: { t: Tally }; flush: () => void };
  w.flush();
  return w.mut.t;
});
/** Chờ tới khi màn chính yên `ms` liền (chuyển cảnh lúc mở, sóng đổi màu), tối đa 15 s. */
const settle = (page: Page, ms = 700) => page.evaluate(ms => new Promise<void>(done => {
  const fin = () => { mo.disconnect(); clearTimeout(cap); done(); };
  let t = setTimeout(fin, ms);
  const mo = new MutationObserver(() => { clearTimeout(t); t = setTimeout(fin, ms); });
  const cap = setTimeout(fin, 15_000);
  mo.observe(document.getElementById('main')!, { attributes: true, childList: true, characterData: true, subtree: true });
}), ms);
/** Hai khung hình: việc hẹn bằng requestAnimationFrame (kéo thanh năm vẽ lại mỗi khung một lần) đã chạy. */
const frames = (page: Page) => page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));

/** Lớp SVG của bản đồ (nền biển, đất và dấu sự kiện, hiệu ứng), và thêm các khung renderMain vẽ lại mà lúc ấy không đổi. */
const MAP = ['#mapbg', '#map', '#mapfx'];
const PANELS = [...MAP, '#popl', '#legend', '#card', '#idx', '#trk', '#vals', '#eraR'];

test('perf: a redraw with the year unchanged writes nothing to the map or the main panels', async ({ page }) => {
  const errors = await boot(page);
  await settle(page);
  // cú bấm tab tới setTab: thanh tab được đánh dấu trước khi vẽ lại, nên đếm nó để biết renderMain đã chạy
  await page.evaluate(() => {
    const w = window as unknown as { tabMarks: number };
    w.tabMarks = 0;
    new MutationObserver(rs => { w.tabMarks += rs.length; }).observe(document.getElementById('tabs')!, { attributes: true, subtree: true });
  });
  // về tab Bản đồ khi đang ở đó: setTab('map') → renderMain() với năm cũ, năm lần
  await observe(page, PANELS);
  for (let i = 0; i < 5; i++) { await page.locator('.tab[data-t=map]').click(); await frames(page); }
  expect(await page.evaluate(() => (window as unknown as { tabMarks: number }).tabMarks)).toBeGreaterThanOrEqual(5);
  const same = await tally(page);
  expect(same.log, `renderMain with the year unchanged wrote to the map or the main panels ${same.records}×`).toEqual([]);
  // mở rồi đóng các bảng che bản đồ: Hồ sơ (đóng bằng tab Bản đồ), trang sự kiện của thẻ bên (đóng bằng Escape). Đóng
  // bảng cũng vẽ lại màn chính. Bảng đặt inert lên các khung màn chính, nên ở đây chỉ xét lớp SVG của bản đồ.
  await observe(page, MAP);
  for (let i = 0; i < 2; i++) {
    await page.locator('.tab[data-t=me]').click();
    await expect(page.locator('#layer .pane')).toHaveCount(1);
    await page.locator('.tab[data-t=map]').click();
    await expect(page.locator('#layer .pane')).toHaveCount(0);
  }
  await page.locator('#card .c').click();
  await expect(page.locator('#et')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('.ov')).toHaveCount(0);
  await frames(page);
  const sheets = await tally(page);
  expect(sheets.log, `opening and closing sheets wrote to the map ${sheets.records}×`).toEqual([]);
  expect(errors).toEqual([]);
});

test('perf: dragging the timeline 1955 → 1975 adds a bounded number of DOM nodes', async ({ page }, info) => {
  const errors = await boot(page);
  await settle(page);
  await observe(page, ['body']);
  const trk = (await page.locator('#trk').boundingBox())!, x = (y: number) => trk.x + ((y - 1858) / (2026 - 1858)) * trk.width, mid = trk.y + trk.height / 2;
  await page.mouse.move(x(1955.2), mid);
  await page.mouse.down();
  // 41 vị trí, nửa năm một bước, chờ hai khung hình sau mỗi bước: mỗi năm mới vẽ lại một lần dù máy nhanh hay chậm
  for (let i = 1; i <= 40; i++) { await page.mouse.move(x(1955.2 + i * 0.5), mid); await frames(page); }
  await page.mouse.up();
  await frames(page);
  const drag = await tally(page);
  const yr = Number(await page.locator('#yr').textContent());
  expect(yr).toBeGreaterThanOrEqual(1972); // thanh năm thật sự đã đi gần hai mươi năm
  const project = info.project.name;
  console.log(`[perf] ${project}: timeline drag 1955 → ${yr} added ${drag.added} DOM nodes (${drag.records} mutation records)`);
  if (process.env.PERF_UPDATE) {
    const b = readBudget();
    b.drag[project] = { measured: drag.added, budget: Math.ceil(drag.added * b.margin) };
    writeFileSync(BUDGET_FILE, JSON.stringify(b, null, 1) + '\n');
    return;
  }
  const b = readBudget().drag[project];
  expect(b, `no drag budget for "${project}" in ${BUDGET_FILE} (npm run perf:budget)`).toBeTruthy();
  expect(drag.added, `the timeline drag added ${drag.added} DOM nodes; budget ${b.budget} (measured ${b.measured} when it was set). ` +
    'Something now rebuilds on every year: find it, or raise the budget on purpose with npm run perf:budget').toBeLessThanOrEqual(b.budget);
  expect(errors).toEqual([]);
});
