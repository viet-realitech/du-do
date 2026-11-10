import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

/* Wikipedia/Commons are blocked so runs are deterministic and the offline fallbacks get exercised. */
async function boot(page: Page, state?: object) {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(m.text()); });
  await page.addInitScript(() => document.addEventListener('securitypolicyviolation', e => console.error('CSP: ' + e.violatedDirective + ' ' + e.blockedURI)));
  await page.route(/wikipedia\.org|wikimedia\.org/, r => r.abort());
  if (state) await page.addInitScript(s => localStorage.setItem('dudo-v2', s), JSON.stringify(state));
  await page.goto('/');
  return errors;
}

const midGame = { step: 'play', name: 'Họ Lê', year: 1954, picks: { e1: 'chien', e2: 'duytan', e3: 'cs', e4: 'vm', e5: 'nam' }, quiz: { e1: [true, true], e2: [true, false], e3: [true, true], e4: [false, true] } };

test('first run: onboarding → turning point → outcome → chapter tour', async ({ page }) => {
  const errors = await boot(page);
  await page.getByRole('button', { name: /Mở hồ sơ/ }).click();
  await page.locator('#nm').fill('Họ Trần');
  await page.getByRole('button', { name: 'Bước vào năm 1858' }).click();
  await expect(page.getByText('Tiếng súng Sơn Trà').first()).toBeVisible();
  // the open turning point owns the keyboard: the map, timeline and tabs behind it are inert
  await expect(page.locator('#main')).toHaveJSProperty('inert', true);
  const go = page.locator('#go');
  await expect(go).toBeDisabled();
  await page.locator('.opt').first().click();
  await go.click();
  await expect(page.getByText('Con đường của bạn')).toBeVisible();
  await page.getByRole('button', { name: /Xem chương 1 diễn ra/ }).click();
  await expect(page.locator('#tourb')).toBeVisible();
  await expect(page.locator('#main')).toHaveJSProperty('inert', false);
  await expect(page.locator('#mapfx g.co')).toHaveCount(1); // tour callout on the map
  // the first stop (Đà Nẵng 1858) opens with a title card (sides, no ranking), then a small slug replaces the population tag
  await expect(page.locator('#mapwrap .ttl')).toContainText('Trận đánh');
  expect(await page.locator('#mapwrap .ttl .sides span').count()).toBeGreaterThanOrEqual(1);
  await expect(page.locator('#mapwrap .slug')).toContainText('1858', { timeout: 4000 });
  await expect(page.locator('#mapwrap .ttl')).toHaveCount(0);
  // ...and tells its battle beat by beat: a lower-third caption per arrow, numbered on the map
  const lt = page.locator('#mapwrap .lt');
  await expect(lt).toBeVisible({ timeout: 8000 });
  await expect(lt.locator('.lt-h')).toContainText('1/3');
  await expect(lt.locator('.lt-h')).toContainText('2/3', { timeout: 7000 });
  expect(await page.locator('#mapfx g.scene g.bd').count()).toBeGreaterThanOrEqual(2);
  // "›" steps the battle beat by beat (a tap on the caption does the same), then moves on to the next event
  await page.locator('#tourb [data-t=next]').click();
  await expect(lt.locator('.lt-h')).toContainText('3/3', { timeout: 1500 });
  await page.locator('#tourb [data-t=next]').click();
  await expect(lt).toContainText(/khép trận/i, { timeout: 2500 });
  await page.locator('#tourb [data-t=next]').click();
  await expect(page.locator('#tourb')).toContainText('2/', { timeout: 5000 });
  // reading mode pauses instead of stopping: ❚❚ holds the step, ▶ goes on from it
  await page.locator('#play').click();
  await expect(page.locator('#tourb')).toContainText('tạm dừng');
  await expect(page.locator('#tourb [data-t=resume]')).toBeVisible();
  await page.locator('#play').click();
  await expect(page.locator('#tourb')).not.toContainText('tạm dừng');
  await expect(page.locator('#tourb')).toContainText('2/');
  await page.locator('#tourb [data-t=stop]').click();
  await expect(page.locator('#tourb')).toHaveCount(0);
  await expect(lt).toHaveCount(0, { timeout: 1000 });
  await expect(page.locator('#mapwrap .slug')).toHaveCount(0);
  await expect(page.locator('#mapwrap.scn')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('reading mode: the timeline moves freely past unchosen turning points; the chapter chip offers the choice', async ({ page }) => {
  const errors = await boot(page, { step: 'play', name: 'Họ Lê', year: 1936, picks: { e1: 'chien', e2: 'duytan' }, quiz: {} });
  const trk = (await page.locator('#trk').boundingBox())!;
  await page.mouse.click(trk.x + ((1960 - 1858) / (2026 - 1858)) * trk.width, trk.y + trk.height / 2);
  await expect(page.locator('#yr')).toHaveText(/196[01]/);
  await expect(page.locator('#layer .scrim')).toHaveCount(0); // no quiz, no forced turning point
  // the timeline is a keyboard slider too: ←/→ one year, PageUp ten
  const tl = page.locator('#tl');
  await tl.focus();
  const y0 = Number(await tl.getAttribute('aria-valuenow'));
  await page.keyboard.press('ArrowRight');
  await expect(tl).toHaveAttribute('aria-valuenow', String(y0 + 1));
  await page.keyboard.press('PageUp');
  await expect(page.locator('#yr')).toHaveText(String(y0 + 11));
  await page.keyboard.press('PageDown');
  await page.keyboard.press('ArrowLeft');
  await expect(tl).toHaveAttribute('aria-valuenow', String(y0));
  await expect(page.locator('#eraR')).toHaveText('◆ Chọn hướng');
  await page.locator('#eraR').click();
  await expect(page.locator('#layer .scrim .opt').first()).toBeVisible({ timeout: 8000 }); // the chapter's own choice, no quiz first
  await expect(page.getByText('ĐỐ NHANH')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('turning points mark which options continue the family path (every path has a successor)', async ({ page }) => {
  for (const [e2, cont] of [['duytan', ['qdd', 'laphien']], ['canvuong', ['cs', 'qdd']]] as const) {
    const errors = await boot(page, { step: 'play', name: 'Họ Lê', year: 1930, picks: { e1: 'canhtan', e2 }, quiz: { e1: [true, true], e2: [true, true] } });
    // reading mode: a turning point left for later does not reopen by itself on load; the header chip offers it
    await page.waitForTimeout(1200);
    await expect(page.locator('body > .cine')).toHaveCount(0);
    await expect(page.locator('#layer .scrim')).toHaveCount(0);
    await page.locator('#eraR').click();
    await expect(page.locator('#layer .opt[data-o="cs"]')).toBeAttached({ timeout: 12000 });
    for (const o of ['cs', 'qdd', 'laphien']) {
      const tag = page.locator(`#layer .opt[data-o="${o}"] .al`).first();
      await expect(tag).toHaveText(cont.includes(o as never) ? /Tiếp nối đường cũ/i : /Rẽ hướng/i);
    }
    expect(errors).toEqual([]);
  }
});

test('play mode: a family diary page says what the family at home decided', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.route(/wikipedia\.org|wikimedia\.org/, r => r.abort());
  const st = { step: 'play', mode: 'play', name: 'Họ Phan', surname: 'phan', home: 'na', year: 1861, picks: { e1: 'chien' }, quiz: {}, cards: { nt62: 2 }, cardv: {}, res: { g: 40, d: 30, b: 25, u: 30 } };
  await page.addInitScript(s => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('dudo-v2-play', s); localStorage.setItem('dudo-mode', 'play'); sessionStorage.setItem('seeded', '1'); } }, JSON.stringify(st));
  await page.goto('/');
  for (let i = 0; i < 6 && !(await page.locator('#card').textContent())?.includes('Gò Công'); i++) await page.locator('#card [data-a=step][data-d="1"]').click();
  await expect(page.locator('#card')).toContainText('Gò Công');
  await expect(page.locator('#card')).toContainText('Ở nhà');
  await expect(page.locator('#card')).toContainText('Than khóc rồi sống tiếp');
  await expect(page.locator('#card')).toContainText('riêng bạn');
  expect(errors).toEqual([]);
});

test('reading mode never forces a side: the turning point can wait, tours run without a pick, skipping asks first and brings no quiz', async ({ page }) => {
  const errors = await boot(page);
  await page.getByRole('button', { name: /Mở hồ sơ/ }).click();
  await expect(page.getByText('Đi qua 168 năm lịch sử Việt Nam trên bản đồ.')).toBeVisible();
  await page.getByRole('button', { name: 'Bước vào năm 1858' }).click();
  await expect(page.locator('#layer .scrim .opt').first()).toBeAttached();
  await page.keyboard.press('Escape'); // "Đọc chương trước, chọn sau"
  await expect(page.locator('#layer .scrim')).toHaveCount(0);
  await expect(page.locator('#yr')).toHaveText('1858');
  await expect(page.locator('#eraR')).toHaveText('◆ Chọn hướng');
  await page.locator('#play').click();
  await expect(page.locator('#tourb')).toBeVisible({ timeout: 5000 });
  await expect(page.locator('#layer .scrim')).toHaveCount(0); // no gate forced before the tour
  const skip = page.locator('#tourb [data-t=skip]');
  await skip.click();
  await expect(skip).toContainText('Bỏ'); // first tap only asks
  await expect(page.locator('#tourb')).toBeVisible();
  await skip.click();
  await expect(page.locator('#tourb')).toHaveCount(0, { timeout: 3000 });
  if (await page.locator('.cine').count()) await page.goBack(); // chapter 2 opener
  await expect(page.locator('#layer .scrim .opt').first()).toBeAttached({ timeout: 8000 }); // next turning point (optional)
  await expect(page.getByText(/Đố nhanh/i)).toHaveCount(0); // a skipped chapter is not quizzed
  expect(errors).toEqual([]);
});

test('reading mode: ▶ late in a chapter tours what is left of it; 2026 offers the conclusion with a turning point still open', async ({ page }) => {
  let errors = await boot(page, { step: 'play', name: 'Họ Lê', year: 1920, picks: { e1: 'canhtan', e2: 'duytan' }, quiz: { e1: [true, true] } });
  await page.locator('#play').click();
  await expect(page.locator('#tourb')).toBeVisible({ timeout: 5000 }); // not a jump straight to 1930 and its quiz
  await expect(page.locator('#tourb .mono')).toContainText('Chương 2');
  await expect(page.locator('#card')).toContainText('Thanh niên', { timeout: 6000 }); // 1925, after the chapter's last sampled stop
  await expect(page.getByText(/Đố nhanh/i)).toHaveCount(0);
  expect(errors).toEqual([]);
  errors = await boot(page, { step: 'play', name: 'Họ Lê', year: 2026, picks: { e2: 'duytan', e3: 'cs', e4: 'vm', e5: 'bac', e6: 'doimoi' }, quiz: { e6: [true, true] } });
  await expect(page.locator('#card [data-a=end].c')).toContainText('Xem kết luận');
  await expect(page.locator('#card [data-a=pickera]')).toHaveAttribute('data-id', 'e1'); // the earliest open turning point
  await page.locator('#card [data-a=end].c').click();
  await expect(page.getByText('Mọi con đường đều dẫn về hôm nay')).toBeVisible({ timeout: 6000 });
  expect(errors).toEqual([]);
});

test('reading mode: a tour stopped at Genève resumes chapter 4 after a reload, even with a filter, then quizzes it and moves on', async ({ page }) => {
  const errors = await boot(page, { step: 'play', name: 'Họ Lê', year: 1954, filt: 'Trận đánh', tourAt: { e: 'e4', id: 'gnv' }, picks: { e1: 'chien', e2: 'duytan', e3: 'cs', e4: 'tl' }, quiz: { e1: [true, true], e2: [true, true], e3: [true, true] } });
  await page.locator('#play').click();
  await expect(page.locator('#tourb .mono').first()).toContainText('Chương 4', { timeout: 5000 }); // not chapter 5 at 1955
  await expect(page.locator('#card')).toContainText('Genève', { timeout: 5000 });
  const next = page.locator('#tourb [data-t=next]');
  for (let k = 0; k < 12 && await page.locator('#tourb').count(); k++) { if (await next.count()) await next.click().catch(() => {}); await page.waitForTimeout(400); }
  if (await page.locator('.cine').count()) await page.goBack(); // chapter 5 opener
  await expect(page.getByText(/Đố nhanh · Chương 4/i)).toBeVisible({ timeout: 8000 }); // the chapter was watched: quiz, then turning point 5
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('dudo-v2') || '{}').tourAt)).toBeNull(); // ▶ at 1954 now starts chapter 5
  expect(errors).toEqual([]);
});

test('reading mode: a tour waits while a pane or a figure sheet covers the map, and goes on when the map is back', async ({ page }) => {
  const errors = await boot(page, { step: 'play', name: 'Họ Lê', year: 1883, picks: { e1: 'canhtan' }, quiz: {} });
  await page.locator('#play').click();
  const bar = page.locator('#tourb .mono').first();
  await expect(bar).toBeVisible({ timeout: 5000 });
  await expect(bar).not.toContainText('tạm dừng');
  await page.locator('.tab[data-t=fig]').click(); // Nhân vật covers the map
  await expect(bar).toContainText('tạm dừng');
  await page.waitForTimeout(1500);
  await expect(page.locator('#layer > .pane')).toHaveCount(1); // no quiz or card replaced the pane
  await page.locator('.tab[data-t=map]').click();
  await expect(bar).not.toContainText('tạm dừng', { timeout: 3000 });
  await page.locator('#eraR').click(); // the companion's figure sheet
  await expect(page.locator('#layer > .scrim')).toHaveCount(1);
  await expect(bar).toContainText('tạm dừng');
  await page.keyboard.press('Escape');
  await expect(page.locator('#layer > .scrim')).toHaveCount(0);
  await expect(bar).not.toContainText('tạm dừng', { timeout: 3000 });
  expect(errors).toEqual([]);
});

test('keyboard: choices move with arrow keys, the filter menu closes on Escape, sheets over a page keep focus to themselves', async ({ page }) => {
  let errors = await boot(page);
  await page.getByRole('button', { name: /Mở hồ sơ/ }).click();
  await page.getByRole('button', { name: 'Bước vào năm 1858' }).click();
  if (await page.locator('.cine').count()) await page.goBack();
  await page.locator('#lskip').click({ timeout: 10000 });
  const opts = page.locator('#layer .opt');
  await opts.first().focus();
  await page.keyboard.press('ArrowDown');
  await expect(opts.nth(1)).toBeFocused();
  await expect(opts.nth(1)).toHaveAttribute('aria-checked', 'true');
  await expect(page.locator('#layer [role=radiogroup]')).toHaveAttribute('aria-labelledby', /.+/);
  expect(errors).toEqual([]);
  errors = await boot(page, midGame);
  await page.locator('#fbtn').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#fmenu')).toBeVisible();
  await expect(page.locator('#fbtn')).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(page.locator('#fmenu')).toHaveCount(0);
  await expect(page.locator('#fbtn')).toBeFocused();
  await page.locator('.tab[data-t=fig]').click(); // Nhân vật pane, then a figure sheet over it
  await page.locator('#layer .pane .fcard:not(.off)').first().click();
  await expect(page.locator('#layer > .scrim')).toHaveCount(1);
  await expect(page.locator('#layer > .pane')).toHaveJSProperty('inert', true); // Shift+Tab cannot reach the pane behind
  await page.keyboard.press('Escape');
  await expect(page.locator('#layer > .scrim')).toHaveCount(0);
  await expect(page.locator('#layer > .pane')).toHaveJSProperty('inert', false);
  expect(errors).toEqual([]);
});

test('keyboard: the side card keeps focus across ‹ ›, an event page focuses its title and Escape returns to the card', async ({ page }) => {
  const errors = await boot(page, midGame);
  const next = page.locator('#card [data-a=step][data-d="1"]');
  await next.focus();
  const t0 = await page.locator('#card .t').textContent();
  await page.keyboard.press('Enter');
  await expect(page.locator('#card .t')).not.toHaveText(t0!);
  await expect(page.locator('#card [data-a=step][data-d="1"]')).toBeFocused();
  const t1 = await page.locator('#card .t').textContent();
  await page.keyboard.press('Enter');
  await expect(page.locator('#card .t')).not.toHaveText(t1!);
  await page.locator('#card .c').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.ov h1')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('.ov')).toHaveCount(0);
  await expect(page.locator('#card .c')).toBeFocused();
  expect(errors).toEqual([]);
});

test('play mode: another region\'s optional card is not offered (Hà Nội 1882 for a Nghệ An family)', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.route(/wikipedia\.org|wikimedia\.org/, r => r.abort());
  const st = { step: 'play', mode: 'play', name: 'Họ Phan', surname: 'phan', home: 'na', year: 1883, picks: { e1: 'chien' }, quiz: {}, cards: { nt62: 2, gt74: 1 }, cardv: {}, res: { g: 40, d: 30, b: 25, u: 30 } };
  await page.addInitScript(s => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('dudo-v2-play', s); localStorage.setItem('dudo-mode', 'play'); sessionStorage.setItem('seeded', '1'); } }, JSON.stringify(st));
  await page.goto('/');
  await page.evaluate(() => { const b = document.createElement('button'); b.dataset.a = 'ev'; b.dataset.id = 'hd82'; b.id = 'goto'; b.style.cssText = 'position:fixed;left:0;top:0;z-index:99999;width:12px;height:12px'; document.body.appendChild(b); });
  await page.locator('#goto').click();
  await expect(page.locator('.ov h1')).toBeVisible();
  await expect(page.locator('.ov [data-a=card]')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('play mode: Điện Biên Phủ and Genève, still owed at 1954, are played before turning point 5 (after a reload too)', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.route(/wikipedia\.org|wikimedia\.org/, r => r.abort());
  // every card decided except the two 1954 events that close chapter 4
  const ids = [...readFileSync('src/data/cards.ts', 'utf8').matchAll(/^  \['(\w+)', '/gm)].map(m => m[1]).filter(id => id !== 'dbp' && id !== 'gnv');
  const cards = Object.fromEntries(ids.map(id => [id, 0]));
  const st = { step: 'play', mode: 'play', name: 'Họ Lê', surname: 'le', home: 'hn', year: 1954, picks: { e1: 'chien', e2: 'duytan', e3: 'cs', e4: 'vm' }, quiz: { e1: [true, true], e2: [true, true], e3: [true, true] }, cards, cardv: {}, xFrom: 2026, harvests: ['e1', 'e2', 'e3'] };
  await page.addInitScript(s => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('dudo-v2-play', s); localStorage.setItem('dudo-mode', 'play'); sessionStorage.setItem('seeded', '1'); } }, JSON.stringify(st));
  await page.goto('/');
  await expect(page.locator('#tourb')).toBeVisible({ timeout: 8000 }); // chapter 4 resumes at Điện Biên Phủ
  await expect(page.locator('#eraNo')).toContainText('Chương 4');
  await expect(page.getByText('Mùa màng')).toHaveCount(0); // not the generation-4 harvest / turning point 5 first
  expect(errors).toEqual([]);
});

test('reading mode: ❚❚ pressed while the map flies to the next stop, then ▶, keeps the tour going', async ({ page }) => {
  const errors = await boot(page, { step: 'play', name: 'Họ Lê', year: 1858, picks: { e1: 'chien' }, quiz: {}, narr: false });
  await page.locator('#play').click();
  await expect(page.locator('#mapwrap .lt .lt-h')).toContainText('1/3', { timeout: 9000 });
  for (let i = 0; i < 3; i++) await page.locator('#tourb [data-t=next]').click();
  await expect(page.locator('#mapwrap .lt.end')).toBeVisible({ timeout: 3000 });
  await page.locator('#tourb [data-t=next]').click(); // leave the battle: the year starts moving to the next stop
  await page.locator('#play').click(); // ❚❚ during the flight
  await expect(page.locator('#tourb')).toContainText('tạm dừng');
  await page.locator('#play').click(); // ▶
  await expect(page.locator('#tourb')).not.toContainText('tạm dừng');
  await expect(page.locator('#tourb .mono').first()).toHaveText(/^3\//, { timeout: 20000 }); // went on past stop 2
  expect(errors).toEqual([]);
});

test('an event opened from Sử liệu returns there, through a replay too', async ({ page }) => {
  const errors = await boot(page, midGame);
  await page.locator('.tab[data-t=src]').click();
  await page.locator('#sq').fill('dien bien');
  await page.locator('#sl .src[data-a=ev][data-id=dbp]').click();
  await expect(page.locator('.ov h1')).toContainText('Điện Biên Phủ');
  await page.locator('.ov .hero .hplay').click(); // replay, then Đóng: back on the event page
  await expect(page.locator('#replb')).toBeVisible();
  await page.locator('#replb [data-t=rclose]').click();
  await expect(page.locator('.ov h1')).toContainText('Điện Biên Phủ');
  await page.keyboard.press('Escape'); // and the page closes back to the Sử liệu pane, not the bare map
  await expect(page.locator('#layer .pane')).toBeVisible();
  await expect(page.locator('.tab[data-t=src]')).toHaveClass(/on/);
  await page.locator('.tab[data-t=map]').click();
  await page.locator('#card .c').click(); // an event opened from the map closes to the map
  await page.keyboard.press('Escape');
  await expect(page.locator('#layer .pane')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('map renders the 1954 regime and legend', async ({ page }) => {
  const errors = await boot(page, midGame);
  // event markers survive a repaint at the same year (a finger resting on one must not lose its element mid-gesture)
  const mk = await page.locator('#map g.m').first().elementHandle();
  await page.evaluate(() => { const b = document.createElement('button'); b.dataset.a = 'ev'; b.dataset.id = 'dbp'; b.id = 'goto'; b.style.cssText = 'position:fixed;left:0;top:0;z-index:99999;width:12px;height:12px'; document.body.appendChild(b); });
  await page.locator('#goto').click();
  await expect(page.locator('.ov')).toBeVisible();
  await page.goBack();
  await expect(page.locator('#layer .ov')).toHaveCount(0);
  expect(await mk!.evaluate(e => e.isConnected)).toBe(true);
  await expect(page.locator('#yr')).toHaveText('1954');
  await expect(page.locator('#lbl')).toContainText('vĩ tuyến 17');
  await expect(page.locator('#map path[fill]').first()).toBeAttached();
  await page.locator('#legend').getByText('VN Dân chủ Cộng hoà').waitFor();
  expect(errors).toEqual([]);
});

test('event detail tabs work offline and Back closes overlays without leaving the app', async ({ page }) => {
  const errors = await boot(page, { ...midGame, filt: 'Trận đánh' });
  await page.locator('#card .c').click();
  await expect(page.locator('#et')).toBeVisible();
  for (const t of ['Góc nhìn', 'Ảnh, phim', 'Nguồn', 'Diễn biến']) await page.locator('#et').getByRole('tab', { name: t }).click();
  await page.locator('#et').getByRole('tab', { name: 'Ảnh, phim' }).click();
  await expect(page.getByText('Chưa tìm thấy bài Wikipedia phù hợp.')).toBeVisible();
  await page.goBack();
  await expect(page.locator('.ov')).toHaveCount(0);
  await expect(page.locator('#yr')).toBeVisible();
  // tabs + Escape
  await page.locator('.tab[data-t=src]').click();
  await page.locator('#sq').fill('geneve'); // không dấu vẫn khớp "Genève"; tìm cả sự kiện lẫn văn bản
  await expect(page.locator('#sl .src[data-a=ev]').first()).toBeVisible();
  await expect(page.locator('#sl .src[data-a=src]').first()).toBeVisible();
  await page.locator('#sl .src[data-a=src]').first().click();
  await expect(page.locator('.scrim')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('.scrim')).toHaveCount(0);
  await page.goBack();
  await expect(page.locator('.pane')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('figures lock until their turning point; profile, about and share card', async ({ page }) => {
  const errors = await boot(page, midGame);
  await page.locator('.tab[data-t=fig]').click();
  await expect(page.locator('.fcard.off')).toHaveCount(11); // chapter 6 figures still locked
  await page.locator('.tab[data-t=me]').click();
  await page.getByRole('button', { name: 'Giới thiệu & nguồn dữ liệu' }).click();
  await expect(page.getByText('Quyền riêng tư')).toBeVisible();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Tạo thẻ chia sẻ' }).click();
  await expect(page.getByAltText('Thẻ kết quả')).toBeVisible();
  expect(errors).toEqual([]);
});

test('appearance: theme picked at onboarding, changed in settings, kept after reload', async ({ page }) => {
  const errors = await boot(page);
  await page.getByRole('button', { name: /Mở hồ sơ/ }).click();
  await page.getByRole('radio', { name: /Lưu trữ/ }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'archive');
  await page.locator('#nm').fill('Họ Phan');
  await page.getByRole('button', { name: 'Bước vào năm 1858' }).click();
  await page.locator('.opt').first().click();
  await page.locator('#go').click();
  await page.locator('[data-a=close]').first().click();
  await page.locator('.tab[data-t=me]').click();
  await page.getByRole('radio', { name: /Áp phích/ }).click();
  await page.getByRole('button', { name: 'Mực nâu' }).click();
  await page.getByRole('switch', { name: 'Đường biên hiện nay' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'poster');
  await expect(page.getByRole('switch', { name: 'Đường biên hiện nay' })).toHaveAttribute('aria-checked', 'true');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'poster');
  await expect(page.locator('#mapbg rect[fill="url(#p-sea)"]')).toHaveCount(1); // poster's half-tone sea
  expect(errors).toEqual([]);
});

test('smooth map: static layers apart, ripples rest while moving, nothing rebuilt while scrubbing, effects level in settings', async ({ page }) => {
  const errors = await boot(page, midGame);
  // sea, graticule and coastal ripples live on their own background layer; the tour spotlight is off, not just transparent
  await expect(page.locator('#mapbg .rip')).toHaveCount(1);
  await expect(page.locator('#map .rip')).toHaveCount(0);
  await expect(page.locator('#map rect[fill="url(#spotg)"]')).toHaveCSS('display', 'none');
  await expect(page.locator('#map mask')).toHaveCount(0);
  // the ripples step aside while the map flies and come back once it rests
  await page.locator('#zin').click();
  await expect(page.locator('#mapbg .rip')).toHaveCSS('visibility', 'hidden');
  await expect(page.locator('#mapbg .rip')).toHaveCSS('visibility', 'visible', { timeout: 3000 });
  // dragging the timeline inside one chapter keeps the guide's portrait (it used to blink out every frame)
  const guide = await page.locator('#eraR .av').elementHandle();
  const trk = (await page.locator('#trk').boundingBox())!, x = (y: number) => trk.x + ((y - 1858) / (2026 - 1858)) * trk.width;
  await page.mouse.move(x(1954.5), trk.y + trk.height / 2);
  await page.mouse.down();
  for (const y of [1956, 1958, 1961, 1963]) await page.mouse.move(x(y + 0.5), trk.y + trk.height / 2);
  await page.mouse.up();
  await expect(page.locator('#yr')).toHaveText('1963');
  expect(await guide!.evaluate(e => e.isConnected)).toBe(true);
  // Hồ sơ → Cài đặt: effects level (auto by default); "Nhẹ" drops the ripples and is kept after a reload
  await page.locator('.tab[data-t=me]').click();
  await expect(page.getByRole('button', { name: 'Tự động', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Nhẹ', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-q', '1');
  await expect(page.locator('#mapbg .rip')).toHaveClass(/off/);
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-q', '1');
  await page.locator('.tab[data-t=me]').click();
  await expect(page.getByRole('button', { name: 'Nhẹ', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Tự động', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-q', '2');
  await expect(page.locator('#mapbg .rip')).not.toHaveClass(/off/);
  expect(errors).toEqual([]);
});

test('game flow: one continuous loop — choice → tour auto-starts → card pauses it → continue resumes', async ({ page }) => {
  const errors = await boot(page);
  await page.getByRole('button', { name: /Vào trò chơi/ }).click();
  await expect(page.getByText('Giữ gia sản một dòng họ qua 168 năm.')).toBeVisible();
  await page.getByRole('button', { name: 'Huế' }).click();
  // the family name is chosen from a list and opens its family record (lore, kin in the roster, special events)
  await page.getByRole('button', { name: 'Tôn Thất / Nguyễn Phúc' }).click();
  await expect(page.getByText('Gia phả mở đầu · Họ Tôn Thất / Nguyễn Phúc')).toBeVisible();
  await expect(page.locator('#slore .kin .av')).not.toHaveCount(0);
  await page.getByRole('button', { name: /Bắt đầu năm 1858 ở Huế/ }).click();
  // generation 1 has nothing to harvest yet: the chapter opener, then the turning point
  await expect(page.locator('.cine')).toBeVisible();
  // Back skips the opener instead of leaving the app
  await page.goBack();
  await expect(page.locator('.cine')).toHaveCount(0);
  expect(page.url()).toContain('localhost');
  await expect(page.getByText('Tiếng súng Sơn Trà').first()).toBeVisible();
  await expect(page.getByText('Gia sản sau một đời người')).toHaveCount(0);
  // options stay locked while the turning point is being told, then open by themselves
  await expect(page.locator('.listen')).toBeVisible();
  await page.locator('.opt').first().click();
  await expect(page.locator('.listen')).toHaveCount(0);
  await page.locator('#go').click();
  // outcome: a single "live through the generation" button with a countdown; the chapter starts by itself
  await expect(page.locator('.btn.go .cd')).toBeAttached();
  await expect(page.locator('#tourb')).toBeVisible({ timeout: 15_000 });
  await expect(page.locator('#res')).toBeVisible();
  await expect(page.locator('#map g.home g')).toHaveCount(1); // home marker
  // the first tour stop (Đà Nẵng 1858) touches Huế's region: its card opens by itself and pauses the tour
  // opens once the battle has played out and the narrator, who speaks over the close, has finished (~30 s)
  await expect(page.getByText('Dòng họ phải quyết định')).toBeVisible({ timeout: 50_000 });
  await expect(page.locator('#tourb')).toContainText('chờ quyết định');
  const before = await page.locator('#res .mt').first().locator('b').first().textContent();
  // a tap only selects: nothing is spent until "Quyết định"
  await expect(page.locator('#cgo')).toBeDisabled();
  await page.locator('.scrim .opt').first().click();
  expect(await page.locator('#res .mt').first().locator('b').first().textContent()).toBe(before);
  await expect(page.locator('.scrim .opt').first()).toHaveAttribute('aria-checked', 'true');
  await page.locator('#cgo').click();
  await expect(page.locator('.scrim .opt').first()).toBeDisabled();
  await expect(page.locator('.scrim .opt').first()).toHaveAttribute('aria-checked', 'true');
  await expect(page.getByRole('button', { name: 'Tiếp tục ▶' })).toBeFocused(); // focus moves on, not to <body>
  await page.getByRole('button', { name: 'Tiếp tục ▶' }).click();
  // the tour goes on by itself: progress advances past 1/n, no Play press needed
  await expect(page.locator('#tourb')).toBeVisible();
  await expect(page.locator('#tourb')).not.toContainText('chờ quyết định');
  await expect(page.locator('#tourb .mono')).not.toHaveText(/^1\//);
  expect(await page.locator('#res .mt').first().locator('b').first().textContent()).not.toBe(before);
  await page.locator('#tourb [data-t=stop]').click();
  // the reading flow is a separate save: switching lands on its own intro, no resources
  await page.locator('.tab[data-t=me]').click();
  await expect(page.getByText('Gia sản dòng họ · Huế')).toBeVisible();
  await page.getByRole('button', { name: /Sang Đọc sử/ }).click();
  await expect(page.getByText('Đi qua 168 năm lịch sử Việt Nam trên bản đồ.')).toBeVisible();
  await expect(page.locator('#res')).toBeHidden();
  await page.reload();
  await expect(page.getByText('Đi qua 168 năm lịch sử Việt Nam trên bản đồ.')).toBeVisible();
  expect(errors).toEqual([]);
});

test('reaching the present opens the ending (reading mode does not quiz a chapter 6 it did not watch)', async ({ page }) => {
  const done = { ...midGame, year: 2026, picks: { ...midGame.picks, e6: 'doimoi' }, quiz: { ...midGame.quiz, e5: [true, true] } };
  const errors = await boot(page, done);
  await page.locator('#card [data-a=end]').first().click();
  await expect(page.getByText(/Đố nhanh/i)).toHaveCount(0);
  await expect(page.getByText('Mọi con đường đều dẫn về hôm nay')).toBeVisible();
  // the journey film: one scene per generation, closable
  await page.getByRole('button', { name: /Xem phim hành trình/ }).click();
  await expect(page.locator('.cine.film')).toBeVisible();
  await expect(page.locator('.cine.film .prog i')).toHaveCount(7);
  // Escape closes only the film; the ending stays underneath
  await page.keyboard.press('Escape');
  await expect(page.locator('.cine.film')).toHaveCount(0);
  await expect(page.getByText('Mọi con đường đều dẫn về hôm nay')).toBeVisible();
  await page.getByRole('button', { name: /Xem phim hành trình/ }).click();
  // the film can be held on a slide (Space or ❚❚) and resumed; Space with focus on ✕ pauses, it does not close
  const pz = page.locator('.cine.film .pz');
  await expect(page.locator('.cine.film .x')).toBeFocused();
  await page.keyboard.press('Space');
  await expect(pz).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.cine.film:not(.out)')).toHaveCount(1);
  await page.keyboard.press('Space');
  await expect(pz).toHaveAttribute('aria-pressed', 'false');
  await pz.click();
  await expect(pz).toHaveAttribute('aria-pressed', 'true');
  const w = await page.locator('.cine.film .prog b').first().evaluate(b => b.getBoundingClientRect().width);
  await page.waitForTimeout(600);
  expect(await page.locator('.cine.film .prog b').first().evaluate(b => b.getBoundingClientRect().width)).toBeCloseTo(w, 0);
  await pz.click();
  await expect(pz).toHaveAttribute('aria-label', 'Tạm dừng');
  await page.locator('.cine.film .x').click();
  await expect(page.locator('.cine.film')).toHaveCount(0);
  // starting over asks first; Huỷ keeps the ending
  await page.getByRole('button', { name: 'Chọn lại từ 1858' }).click();
  await expect(page.getByText('và bắt đầu lại từ 1858?')).toBeVisible();
  await page.getByRole('button', { name: 'Huỷ' }).click();
  await expect(page.getByText('Mọi con đường đều dẫn về hôm nay')).toBeVisible();
  expect(errors).toEqual([]);
});

test('an event page replays its battle scene; Back closes the replay without leaving the app', async ({ page }) => {
  const errors = await boot(page, midGame);
  await page.evaluate(() => { const b = document.createElement('button'); b.dataset.a = 'ev'; b.dataset.id = 'dbp'; b.id = 'goto-dbp'; b.style.cssText = 'position:fixed;left:0;top:0;z-index:99999;width:12px;height:12px'; document.body.appendChild(b); });
  await page.locator('#goto-dbp').click();
  await expect(page.locator('.ov .hero .hplay')).toBeVisible();
  await page.locator('.ov .hero .hplay').click();
  await expect(page.locator('.ov')).toHaveCount(0);
  await expect(page.locator('#replb')).toContainText('Điện Biên Phủ');
  await expect(page.locator('#mapwrap.tilt')).toHaveCount(1, { timeout: 3000 });
  await expect(page.locator('#mapwrap .lt')).toContainText('Him Lam', { timeout: 6000 });
  // the teacher can step the siege: › or a tap on the caption shows the next beat at once
  await page.locator('#replb [data-t=rnext]').click();
  await expect(page.locator('#mapwrap .lt')).toContainText('Độc Lập', { timeout: 1500 });
  await page.locator('#mapwrap .lt').click();
  await expect(page.locator('#mapwrap .lt')).toContainText('A1, C1', { timeout: 1500 });
  await expect(page.locator('#mapfx g.scene text.fx-at')).not.toHaveCount(0); // place names at the arrow heads
  await page.goBack();
  await expect(page.locator('#replb')).toHaveCount(0);
  expect(page.url()).toContain('localhost');
  await expect(page.locator('#mapwrap.tilt')).toHaveCount(0);
  await expect(page.locator('.ov .hero .hplay')).toBeVisible(); // back on the event page the replay came from
  await page.goBack();
  await expect(page.locator('.ov')).toHaveCount(0);
  // again: the replay restarts from the first beat, and Đóng closes it
  await page.locator('#goto-dbp').click();
  await page.locator('.ov .hero .hplay').click();
  await expect(page.locator('#mapwrap .lt .lt-h')).toContainText('2/', { timeout: 9000 });
  await page.locator('#replb [data-t=again]').click();
  // › during the fly-in goes to the first beat, not past the battle
  await page.locator('#replb [data-t=rnext]').click();
  await expect(page.locator('#mapwrap .lt .lt-h')).toContainText('1/', { timeout: 1500 });
  // tapping the caption through to the close, then once more: the replay stays (the tap never falls through to the map)
  for (const t of ['2/', '3/', '4/']) { await page.locator('#mapwrap .lt').click(); await expect(page.locator('#mapwrap .lt .lt-h')).toContainText(t, { timeout: 1500 }); }
  await page.locator('#mapwrap .lt').click();
  await expect(page.locator('#mapwrap .lt.end')).toBeVisible({ timeout: 2500 });
  await page.locator('#mapwrap .lt.end p').click();
  await page.waitForTimeout(400);
  await expect(page.locator('#replb')).toHaveCount(1);
  await expect(page.locator('#mapwrap.tilt')).toHaveCount(1);
  await page.locator('#replb [data-t=rclose]').click();
  await expect(page.locator('#replb')).toHaveCount(0);
  // a treaty has no scene to replay
  await page.evaluate(() => { const b = document.createElement('button'); b.dataset.a = 'ev'; b.dataset.id = 'el49'; b.id = 'goto-el'; b.style.cssText = 'position:fixed;left:20px;top:0;z-index:99999;width:12px;height:12px'; document.body.appendChild(b); });
  await page.locator('#goto-el').click();
  await expect(page.locator('.ov .hero')).toBeVisible();
  await expect(page.locator('.ov .hero .hplay')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('battle pieces follow the sources: a doubted attack, an engagement, an unopposed advance, a siege ring, the close', async ({ page }) => {
  test.setTimeout(120000);
  const errors = await boot(page, midGame);
  const replay = async (id: string) => {
    await page.evaluate(id => { document.getElementById('goto')?.remove(); const b = document.createElement('button'); b.dataset.a = 'ev'; b.dataset.id = id; b.id = 'goto'; b.style.cssText = 'position:fixed;left:0;top:0;z-index:99999;width:12px;height:12px'; document.body.appendChild(b); }, id);
    await page.locator('#goto').click();
    await page.locator('.ov .hero .hplay').click();
  };
  // Vịnh Bắc Bộ: the 4.8 attack is shown dotted with a "?" (declassified 2005); Maddox and the torpedo boats engage
  await replay('vb64');
  await expect(page.locator('#mapfx g.scene text.fx-q')).toHaveCount(1, { timeout: 20000 });
  await expect(page.locator('#mapfx g.scene[data-contacts="1"]')).toHaveCount(1);
  await expect(page.locator('#mapfx g.scene g.pc[data-kind=boat]').first()).toBeAttached();
  // Vĩnh Long 1867: handed over without resistance, so no explosions
  await replay('vl67');
  await expect(page.locator('#mapwrap .lt .lt-h')).toContainText('3/3', { timeout: 15000 });
  await page.waitForTimeout(2500);
  await expect(page.locator('#mapfx g.scene circle[fill="url(#fx-boom)"]')).toHaveCount(0);
  // Điện Biên Phủ: the siege of Hồng Cúm draws a ring; the battle closes on its end date, the event's own words,
  // the three fallen French positions greyed out, and a way into the perspectives
  await replay('dbp');
  await expect(page.locator('#mapfx g.scene circle.fx-ring')).toHaveCount(1, { timeout: 16000 });
  await expect(page.locator('#mapwrap .endw .stamp')).toHaveText('7.5.1954', { timeout: 18000 }); // beats are read at ≥2.8 s each
  await expect(page.locator('#mapwrap .lt.end p')).toContainText('thất thủ');
  await expect(page.locator('#mapfx g.scene rect[fill-opacity="0"]')).toHaveCount(3, { timeout: 2000 });
  await page.locator('#mapwrap .lt.end [data-tab=v]').click();
  await expect(page.locator('.ov #et button[data-k="v"]')).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#replb')).toHaveCount(0);
  await expect(page.locator('#mapwrap .endw')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('play mode: a replay cut short by a tab switch keeps the paused tour paused', async ({ page }) => {
  const errors = await boot(page);
  await page.getByRole('button', { name: /Vào trò chơi/ }).click();
  await page.getByRole('button', { name: 'Huế' }).click();
  await page.getByRole('button', { name: 'Tôn Thất / Nguyễn Phúc' }).click();
  await page.getByRole('button', { name: /Bắt đầu năm 1858 ở Huế/ }).click();
  await page.goBack(); // skip the chapter opener
  await page.locator('.opt').first().click();
  await page.locator('#go').click();
  await expect(page.locator('#tourb')).toBeVisible({ timeout: 15_000 });
  // open the first stop's page (pauses the tour), replay its battle, then switch tab mid-replay
  await page.evaluate(() => { const b = document.createElement('button'); b.dataset.a = 'ev'; b.dataset.id = 'dn58'; b.id = 'goto'; b.style.cssText = 'position:fixed;left:0;top:0;z-index:99999;width:12px;height:12px'; document.body.appendChild(b); });
  await page.locator('#goto').click();
  await expect(page.locator('#tourb')).toContainText('tạm dừng');
  await page.locator('.ov .hero .hplay').click();
  await expect(page.locator('#replb')).toBeVisible();
  await expect(page.locator('#mapwrap.tilt')).toHaveCount(1, { timeout: 3000 });
  await page.locator('.tab[data-t=fig]').click();
  await expect(page.locator('#replb')).toHaveCount(0);
  await expect(page.locator('#mapwrap.tilt')).toHaveCount(0);
  await expect(page.locator('#tourb')).toContainText('tạm dừng'); // the tour did not resume behind the pane
  await page.waitForTimeout(1500);
  await expect(page.locator('#mapwrap .lt')).toHaveCount(0); // no battle captions running behind the pane
  expect(errors).toEqual([]);
});

test('play mode: "Điểm rẽ ›" still flies to each decision the family owes, one at a time', async ({ page }) => {
  const errors = await boot(page);
  await page.getByRole('button', { name: /Vào trò chơi/ }).click();
  await page.getByRole('button', { name: 'Huế' }).click();
  await page.getByRole('button', { name: 'Tôn Thất / Nguyễn Phúc' }).click();
  await page.getByRole('button', { name: /Bắt đầu năm 1858 ở Huế/ }).click();
  await page.goBack(); // skip the chapter opener
  await page.locator('.opt').first().click();
  await page.locator('#go').click();
  await expect(page.locator('#tourb')).toBeVisible({ timeout: 15_000 });
  await page.locator('#tourb [data-t=skip]').click();
  // the first stop (Đà Nẵng, Huế's region) is owed: its card opens now; the bar counts what is left
  await expect(page.getByText('Dòng họ phải quyết định')).toBeVisible({ timeout: 5000 });
  await expect(page.locator('#tourb')).toContainText('Còn');
  await expect(page.locator('#tourb [data-t=skip]')).toHaveCount(0);
  await page.locator('.scrim .opt:not([disabled])').first().click();
  await page.locator('#cgo').click();
  await page.getByRole('button', { name: 'Tiếp tục ▶' }).click();
  // the next owed card comes after a flight to its place, not stacked on the last one
  await expect(page.locator('.scrim')).toHaveCount(0, { timeout: 1500 });
  await expect(page.getByText('Dòng họ phải quyết định')).toBeVisible({ timeout: 8000 });
  expect(errors).toEqual([]);
});

test('play mode: reloading mid-chapter resumes the tour at the owed card instead of stacking cards', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.route(/wikipedia\.org|wikimedia\.org/, r => r.abort());
  const st = { step: 'play', mode: 'play', name: 'Họ Lê', surname: 'le', home: 'hn', year: 1874, picks: { e1: 'chien' }, quiz: {}, cards: { nt62: 2 },
    res: { g: 40, d: 30, b: 25, u: 30 } };
  await page.addInitScript(s => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('dudo-v2-play', s); localStorage.setItem('dudo-mode', 'play'); sessionStorage.setItem('seeded', '1'); } }, JSON.stringify(st));
  await page.goto('/');
  // the chapter tour is rebuilt from the owed event: tour bar first, the card only after its step plays
  await expect(page.locator('#tourb')).toBeVisible({ timeout: 8000 });
  await expect(page.locator('#layer .scrim')).toHaveCount(0);
  await expect(page.getByText('Dòng họ phải quyết định')).toBeVisible({ timeout: 50_000 });
  await expect(page.locator('#tourb')).toContainText('chờ quyết định');
  expect(errors).toEqual([]);
});

test.describe('iPad layouts', () => {
  for (const [name, w, h, twoCol] of [['portrait', 820, 1180, false], ['landscape', 1180, 820, true]] as const) {
    test(`${name}: full-screen ${twoCol ? 'map + side panel' : 'single column'}`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: h });
      const errors = await boot(page, midGame);
      await expect(page.locator('#map g.m').first()).toBeAttached();
      const app = (await page.locator('#app').boundingBox())!;
      expect(app.width).toBe(w); // no phone-sized column
      const map = (await page.locator('#mapwrap').boundingBox())!, card = (await page.locator('#card').boundingBox())!;
      if (twoCol) expect(card.x).toBeGreaterThan(map.x + map.width - 1);
      else expect(card.y).toBeGreaterThan(map.y + map.height - 1);
      // the whole of Vietnam stays in the frame: Hà Nội and Sài Gòn markers visible
      for (const c of ['Hà Nội', 'Sài Gòn']) {
        const b = (await page.locator(`#map text[data-city="${c}"]`).boundingBox())!;
        expect(b.y).toBeGreaterThan(map.y);
        expect(b.y + b.height).toBeLessThan(map.y + map.height);
      }
      // a battle replay lists its beats in the side panel (landscape only); tapping a later beat jumps to it
      await page.evaluate(() => { const b = document.createElement('button'); b.dataset.a = 'ev'; b.dataset.id = 'dbp'; b.id = 'goto-dbp'; b.style.cssText = 'position:fixed;left:0;top:0;z-index:99999;width:12px;height:12px'; document.body.appendChild(b); });
      await page.locator('#goto-dbp').click();
      await page.locator('.ov .hero .hplay').click();
      if (twoCol) {
        await expect(page.locator('#beats li')).toHaveCount(4);
        const side = (await page.locator('#beats').boundingBox())!;
        expect(side.x).toBeGreaterThan(map.x + map.width - 1);
        await page.locator('#beats li').nth(2).locator('button').click();
        await expect(page.locator('#beats li').nth(2)).toHaveClass(/on/, { timeout: 1500 });
        await expect(page.locator('#mapwrap .lt .lt-h')).toContainText('3/4');
        await page.locator('#replb [data-t=rclose]').click();
        await expect(page.locator('#beats')).toBeHidden();
      } else {
        await expect(page.locator('#mapwrap .lt')).toBeVisible({ timeout: 8000 });
        await expect(page.locator('#beats')).toBeHidden();
      }
      expect(errors).toEqual([]);
    });
  }
});
