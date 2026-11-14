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
  // the steps before Genève were watched before the reload (their events are what the quiz may ask about)
  const errors = await boot(page, { step: 'play', name: 'Họ Lê', year: 1954, filt: 'Trận đánh', tourAt: { e: 'e4', id: 'gnv' }, picks: { e1: 'chien', e2: 'duytan', e3: 'cs', e4: 'tl' }, quiz: { e1: [true, true], e2: [true, true], e3: [true, true] }, shown: ['ng45', 'tk46', 'el49', 'dbp'] });
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

/** Trò chơi, bản lưu dựng sẵn: mọi thẻ trước thẻ `upTo` (theo thứ tự trong cards.ts, cũng là thứ tự thời gian) đã quyết. */
async function bootPlay(page: Page, st: Record<string, unknown>, upTo: string, key = 'seeded') {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.route(/wikipedia\.org|wikimedia\.org/, r => r.abort());
  const ids = [...readFileSync('src/data/cards.ts', 'utf8').matchAll(/^  \['(\w+)', '/gm)].map(m => m[1]);
  const cards = { ...Object.fromEntries(ids.slice(0, ids.indexOf(upTo)).map(id => [id, 0])), ...(st.cards as object || {}) };
  const s = { step: 'play', mode: 'play', cardv: {}, xFrom: 2026, narr: false, ...st, cards };
  // một lần cho mỗi khoá: tải lại trang không ghi đè bản lưu; khoá khác thì dựng bản lưu mới trong cùng thẻ
  await page.addInitScript(([x, k]) => { if (!sessionStorage.getItem(k)) { localStorage.setItem('dudo-v2-play', x); localStorage.setItem('dudo-mode', 'play'); sessionStorage.setItem(k, '1'); } }, [JSON.stringify(s), key]);
  await page.goto('/');
  return errors;
}

test('play mode: turning point 5 moves the family — a Huế family that picks Miền Bắc regroups North and gets the North\'s cards', async ({ page }) => {
  const errors = await bootPlay(page, { name: 'Họ Phan', surname: 'phan', home: 'hue', year: 1955, picks: { e1: 'chien', e2: 'canvuong', e3: 'cs', e4: 'vm', e5: 'bac' },
    quiz: { e1: [true, true], e2: [true, true], e3: [true, true], e4: [true, true] }, harvests: ['e1', 'e2', 'e3', 'e4'], res: { g: 40, d: 40, b: 40, u: 40 } }, 'dc54');
  await expect(page.locator('#tourb')).toBeVisible({ timeout: 8000 });
  await page.locator('#tourb [data-t=skip]').click();
  // land reform is a northern card: owed now that the family lives in the North, told from a regrouped family's side
  await expect(page.locator('.scrim h2')).toHaveText('Cải cách ruộng đất ở miền Bắc', { timeout: 8000 });
  await expect(page.locator('.scrim .sheet')).toContainText('Huế → miền Bắc');
  await expect(page.locator('.scrim .sheet')).toContainText('Chạm tới nơi dòng họ đang sống (miền Bắc)');
  await expect(page.locator('.scrim .opt h3').first()).toHaveText('Về nông trường khai hoang');
  await page.locator('.scrim .opt').first().click();
  await page.locator('#cgo').click();
  await page.getByRole('button', { name: 'Tiếp tục ▶' }).click();
  // the 1954 migration card asks whether the whole household goes (not "where to live" again, not a southern host's card)
  await expect(page.locator('.scrim h2')).toHaveText('Cuộc di cư 1954', { timeout: 8000 });
  await expect(page.locator('.scrim .opt h3')).toHaveText(['Cả nhà cùng ra Bắc', 'Người đi, vợ con ở lại giữ đất']);
  expect(errors).toEqual([]);
});

test('play mode: Điện Biên Phủ seen from Nghệ An (free zone), and rice short but silver to spare', async ({ page }) => {
  const errors = await bootPlay(page, { name: 'Họ Lê', surname: 'le', home: 'na', year: 1954, picks: { e1: 'chien', e2: 'canvuong', e3: 'cs', e4: 'vm' },
    quiz: { e1: [true, true], e2: [true, true], e3: [true, true] }, harvests: ['e1', 'e2', 'e3'], res: { g: 5, d: 40, b: 40, u: 30 } }, 'dbp');
  await expect(page.locator('#tourb')).toBeVisible({ timeout: 8000 });
  await page.locator('#tourb [data-t=skip]').click();
  await expect(page.locator('.scrim h2')).toHaveText('Điện Biên Phủ', { timeout: 8000 });
  await expect(page.locator('.scrim .opt h3')).toHaveText(['Đi dân công Điện Biên', 'Đóng thuế nông nghiệp', 'Ở nhà giữ làng, nghe tin chiến thắng']);
  // not enough rice, but silver covers it (one for one), said on the option; the loyal option is not locked
  const go = page.locator('.scrim .opt').first();
  await expect(go).toBeEnabled();
  await expect(go).toContainText('Bỏ 5 bạc đong gạo');
  await expect(go).toContainText('Hợp đường bạn theo');
  await go.click();
  await page.locator('#cgo').click();
  await expect(page.locator('.scrim .resrow')).toContainText('Lúa gạo 0');
  await expect(page.locator('.scrim .resrow')).toContainText('Bạc 31');
  expect(errors).toEqual([]);
});

test('play mode: 30.4.1975 for a Third Force family that migrated South is not the old regime\'s reeducation call', async ({ page }) => {
  const errors = await bootPlay(page, { name: 'Họ Lê', home: 'hn', year: 1975, picks: { e1: 'canhtan', e2: 'duytan', e3: 'laphien', e4: 'tl', e5: 'thuba' },
    quiz: { e1: [true, true], e2: [true, true], e3: [true, true], e4: [true, true] }, harvests: ['e1', 'e2', 'e3', 'e4'], res: { g: 20, d: 50, b: 20, u: 50 } }, 'sg75');
  await expect(page.locator('#tourb')).toBeVisible({ timeout: 8000 });
  await page.locator('#tourb [data-t=skip]').click();
  await expect(page.locator('.scrim h2')).toContainText('Sài Gòn', { timeout: 8000 });
  await expect(page.locator('.scrim .opt h3')).toHaveText(['Di tản', 'Ở lại, chờ hoà hợp', 'Đón quân giải phóng']);
  await expect(page.locator('.scrim .opt').nth(1)).toContainText('Hợp đường bạn theo');
  expect(errors).toEqual([]);
});

test('turning points: "Gia đình bạn" follows what the family lived (a father who returned, a new surname, no phantom branch)', async ({ page }) => {
  // generation 2 followed Cần Vương and took the mother's surname after Hương Khê (1896)
  let errors = await bootPlay(page, { name: 'Họ Lê', surname: 'le', home: 'na', year: 1930, picks: { e1: 'chien', e2: 'canvuong' },
    names: [{ y: 1896, from: 'Họ Nguyễn', to: 'Họ Lê', why: 'Sau khi Hương Khê tan rã' }], xs: { hk96: 'x-canvuong96' }, cards: { 'x:x-canvuong96': 1 },
    quiz: { e1: [true, true], e2: [true, true] }, harvests: ['e1'] }, 'cs30');
  await page.locator('#hv-go').click(); // harvest of generation 2
  if (await page.locator('.cine').count()) await page.goBack(); // chapter opener
  const ctx = page.locator('.scrim .pv.mine');
  await expect(ctx).toContainText('Cha bạn theo nghĩa quân Hương Khê', { timeout: 8000 });
  await expect(ctx).toContainText('Năm 1896, Họ Nguyễn đổi thành Họ Lê.');
  await expect(ctx).toContainText('Nguyễn Ái Quốc');
  await expect(ctx).not.toContainText('Sổ của Pháp ghi gia đình');
  await expect(ctx).not.toContainText('mất trong rừng');
  expect(errors).toEqual([]);
  // a Nghệ An family that stayed North and sent no branch South in 1954: no relatives to meet in Sài Gòn
  errors = await bootPlay(page, { name: 'Họ Lê', surname: 'le', home: 'na', year: 1976, picks: { e1: 'chien', e2: 'canvuong', e3: 'cs', e4: 'vm', e5: 'bac' },
    cards: { dc54: 1, sg75: 1 }, quiz: { e1: [true, true], e2: [true, true], e3: [true, true], e4: [true, true], e5: [true, true] }, harvests: ['e1', 'e2', 'e3', 'e4'] }, 'tn76', 'seeded2');
  await page.locator('#hv-go').click();
  if (await page.locator('.cine').count()) await page.goBack();
  await expect(page.locator('.scrim .pv.mine')).toContainText('tìm tin những người trong họ đã đi chiến trường', { timeout: 8000 });
  await expect(page.locator('.scrim .pv.mine')).not.toContainText('họ hàng chưa từng biết mặt');
  expect(errors).toEqual([]);
});

test('reading mode: the chapter quiz asks only about events the tour showed, before the next chapter takes the header', async ({ page }) => {
  // chapter 1 watched (before a reload) at the 1862 treaty, resumed at Patenôtre; Đà Nẵng 1858 was never shown
  const errors = await boot(page, { step: 'play', name: 'Họ Lê', year: 1884, tourAt: { e: 'e1', id: 'pt84' }, picks: { e1: 'chien' }, quiz: {}, shown: ['nt62'] });
  await page.locator('#play').click();
  await expect(page.locator('#card')).toContainText('Patenôtre', { timeout: 5000 });
  const next = page.locator('#tourb [data-t=next]');
  for (let k = 0; k < 12 && await page.locator('#tourb').count(); k++) { if (await next.count()) await next.click().catch(() => {}); await page.waitForTimeout(400); }
  await expect(page.getByText(/Đố nhanh · Chương 1/i)).toBeVisible({ timeout: 8000 });
  await expect(page.locator('#eraNo')).toContainText('Chương 1'); // drawn over its own chapter, not over chapter 2's header
  const asked: string[] = [];
  for (let q = 0; q < 2; q++) {
    await expect(page.locator('#layer .scrim h2')).not.toHaveText(asked); // the next question, not the one fading out
    asked.push(await page.locator('#layer .scrim h2').textContent() || '');
    await page.locator('#layer .scrim .qa').first().click();
    await page.locator('#qn').click();
  }
  expect(asked.sort()).toEqual(['Hiệp ước Nhâm Tuất 1862 nhượng cho Pháp vùng nào?', 'Hiệp ước nào đặt cả Đại Nam dưới quyền bảo hộ Pháp?']);
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
  // #layer > .ov: the page that left for the replay may still be fading out (ghost) when the replay is closed at once
  await expect(page.locator('#layer > .ov h1')).toContainText('Điện Biên Phủ');
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

test('map sheet: new players open on Lưu trữ (a saved theme stays), the population cartouche clears the country names, icons are drawn', async ({ page }) => {
  const errors = await boot(page);
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'archive');
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#efe5cf');
  await page.evaluate(s => localStorage.setItem('dudo-v2', s), JSON.stringify({ ...midGame, theme: 'night' }));
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'night');
  await expect(page.locator('#map g.m').first()).toBeAttached();
  // two-line cartouche (label, figure) in the sheet's corner, clear of "TRUNG QUỐC" on a phone
  await expect(page.locator('#popl .cap')).toHaveText(/Dân số · 1943/i);
  await expect(page.locator('#popl b')).toHaveText('≈ 22 triệu');
  const tag = (await page.locator('#popl').boundingBox())!, cn = (await page.locator('#map text', { hasText: 'TRUNG QUỐC' }).boundingBox())!;
  expect(tag.x + tag.width <= cn.x || cn.y + cn.height <= tag.y || tag.y + tag.height <= cn.y).toBe(true);
  // one SVG sprite for the instruments, tabs and play / pause / stop (no Unicode glyphs sitting off-centre)
  await expect(page.locator('#zin use')).toHaveAttribute('href', '#i-plus');
  await expect(page.locator('.tab use')).toHaveCount(4);
  await expect(page.locator('#play use')).toHaveAttribute('href', '#i-play');
  await page.locator('#play').click();
  await expect(page.locator('#tourb')).toBeVisible();
  await expect(page.locator('#play use')).toHaveAttribute('href', '#i-pause');
  await expect(page.locator('#tourb [data-t=stop] use')).toHaveAttribute('href', '#i-stop');
  // phone: the tour bar is the sheet's lower margin band, not a card floating over the map
  // (measured against the sheet inside its 6px neatline band, i.e. the frame's padding box)
  const map = await page.locator('#mapwrap').evaluate(e => { const r = e.getBoundingClientRect(); return { x: r.left + e.clientLeft, y: r.top + e.clientTop, w: e.clientWidth, h: e.clientHeight }; });
  const bar = async () => (await page.locator('#tourb').boundingBox())!;
  await expect.poll(async () => { const b = await bar(); return Math.max(Math.abs(b.y + b.height - (map.y + map.h)), Math.abs(b.x - map.x), Math.abs(b.width - map.w)); }).toBeLessThan(2); // after the bar slides in
  await page.locator('#tourb [data-t=stop]').click();
  await expect(page.locator('#play use')).toHaveAttribute('href', '#i-play');
  expect(errors).toEqual([]);
});

test('play mode, tablet: resource icons are drawn (not clipped to a hairline) and relations get their own legend row', async ({ page }) => {
  await page.setViewportSize({ width: 820, height: 1180 });
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.route(/wikipedia\.org|wikimedia\.org/, r => r.abort());
  const st = { step: 'play', mode: 'play', name: 'Họ Phan', surname: 'phan', home: 'na', year: 1861, picks: { e1: 'chien' }, quiz: {}, cards: { nt62: 2 }, cardv: {}, res: { g: 40, d: 30, b: 25, u: 30 } };
  await page.addInitScript(s => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('dudo-v2-play', s); localStorage.setItem('dudo-mode', 'play'); sessionStorage.setItem('seeded', '1'); } }, JSON.stringify(st));
  await page.goto('/');
  await expect(page.locator('#res svg.ri')).toHaveCount(4);
  for (const b of await page.locator('#res svg.ri').all()) expect((await b.boundingBox())!.height).toBeGreaterThan(10);
  const row = page.locator('#legend .lr.rel');
  await expect(row.locator('.relc')).toHaveCount(3); // Triều đình, Pháp, Làng xóm before 1930
  await expect(row.locator('.relc').first()).toBeInViewport();
  const lr = (await page.locator('#legend .lr').first().boundingBox())!, rr = (await row.boundingBox())!;
  expect(rr.y).toBeGreaterThan(lr.y + lr.height - 1); // a row of its own, under the factions
  expect(errors).toEqual([]);
});

test('landscape: the side column indexes the chapter; a row takes you to its event', async ({ page }) => {
  await page.setViewportSize({ width: 1180, height: 820 });
  const errors = await boot(page, midGame);
  const idx = page.locator('#idx');
  await expect(idx).toBeVisible();
  await expect(idx.locator('.cap')).toContainText('Mục lục chương V · 1954 – 1975');
  expect(await idx.locator('li').count()).toBeGreaterThan(5);
  const map = (await page.locator('#mapwrap').boundingBox())!;
  expect((await idx.boundingBox())!.x).toBeGreaterThan(map.x + map.width - 1);
  const row = idx.locator('button').nth(4), title = (await row.locator('span').textContent())!, y = (await row.locator('b').textContent())!;
  await row.click();
  await expect(page.locator('#card .t')).toHaveText(title);
  await expect(page.locator('#yr')).toHaveText(y);
  await expect(row).toHaveClass(/on/);
  // the wide tab bar is a slim row, icons beside the words
  expect((await page.locator('#tabs').boundingBox())!.height).toBeLessThan(60);
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
  // generation 1 has nothing to harvest yet: the chapter opener, then the turning point. Offline (no archive photo) the
  // opener is the caption plate alone, not an empty print frame
  await expect(page.locator('.cine')).toBeVisible();
  await expect(page.locator('.cine .plate h1')).toHaveText('Tiếng súng Sơn Trà');
  await expect(page.locator('.cine .print')).toHaveCount(0);
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

/* Kết cục: mỗi con đường một kết cục riêng, có tỷ lệ hiếm từ mô phỏng và một giả định "Nếu…" cạnh lịch sử thật. */
const reformPath = { e1: 'canhtan', e2: 'duytan', e3: 'laphien', e4: 'tl', e5: 'thuba', e6: 'doimoi' };

test('ending (reading mode): the path picks its own ending, with the family name, rarity, why and a "Nếu…" what-if', async ({ page }) => {
  const errors = await boot(page, { step: 'play', name: 'Họ Trần', year: 2026, picks: reformPath, quiz: { e6: [true, true] } });
  await page.locator('#card [data-a=end].c').click();
  // four reform picks (Canh tân, Duy Tân, Lập hiến, Đổi Mới): the title counts them
  await expect(page.locator('.end-title')).toHaveText('Bốn đời canh tân');
  await expect(page.locator('.end-kick')).toContainText('Họ Trần');
  await expect(page.locator('.end-epi')).toContainText('Bốn đời của Họ Trần chọn học hỏi và cải cách');
  await expect(page.locator('.end-rar')).toContainText(/\d+(,\d)?% con đường đi tới kết cục này/);
  await expect(page.locator('.end-rar')).toContainText('729 con đường');
  await page.getByText('Vì sao là kết cục này?').click();
  await expect(page.locator('.end-why p')).toContainText('Ít nhất ba đời chọn hướng cải cách');
  // the first divergence (1858) gets the what-if card: labelled, estimated, with the real history next to it
  const cf = page.locator('.cf-card');
  await expect(cf).toContainText('Giả định · không phải lịch sử');
  await expect(cf.locator('h2')).toHaveText('Nếu triều đình nghe Nguyễn Trường Tộ');
  await expect(cf).toContainText('Ước lượng của trò chơi: khoảng 20% (1 trên 5)');
  await expect(cf.locator('.cf-real')).toContainText('Hướng chiếm ưu thế: Chủ hoà');
  // later divergences keep a folded what-if under their row; the dominant pick (Đổi Mới) has none
  await expect(page.locator('details.cf')).toHaveCount(4);
  // the gia phả now shows in reading mode too, one mark per generation on its timeline, before the path table; the
  // closing line stays
  await expect(page.getByText('Gia phả Họ Trần')).toBeVisible();
  await expect(page.locator('.end-gp .gp .chron.gen')).toHaveCount(6);
  await expect(page.locator('.end-path .pr')).toHaveCount(6);
  expect(await page.evaluate(() => !!(document.querySelector('.end-gp')!.compareDocumentPosition(document.querySelector('.end-path')!) & Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
  await expect(page.getByText('Mọi con đường đều dẫn về hôm nay')).toBeVisible();
  // the journey film ends on a closed-dossier plate: the ending title, the family name, the six picks as a strip
  await page.getByRole('button', { name: /Xem phim hành trình/ }).click();
  for (let i = 0; i < 6; i++) await page.keyboard.press('ArrowRight');
  await expect(page.locator('.cine.film .fin h1')).toHaveText('Bốn đời canh tân');
  await expect(page.locator('.cine.film .fin .mono').first()).toContainText('Họ Trần');
  await expect(page.locator('.cine.film .fin .strip li')).toHaveCount(6);
  await expect(page.locator('.cine.film .fin .strip li').first()).toContainText('Canh tân');
  await page.locator('.cine.film .x').click();
  await page.getByRole('button', { name: 'Tạo thẻ chia sẻ' }).click();
  await expect(page.getByAltText('Thẻ kết quả')).toBeVisible();
  expect(errors).toEqual([]);
});

/* Ảnh tư liệu của phim hành trình: một bản in trọn ảnh trong lề giấy bồi, không nền nhoè, không phóng quá 1,5 lần cỡ thật,
   tấm nhãn không đè lên ảnh; màn dọc và màn ngang. Wikipedia / Commons được giả lập bằng một ảnh vẽ sẵn 1280 × 853. */
for (const [name, w, h] of [['phone', 390, 844], ['iPad landscape', 1194, 834]] as const) {
  test(`journey film (${name}): the archive photo is a whole print beside its caption plate, never under it`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    const errors = await boot(page, { step: 'play', name: 'Họ Trần', year: 2026, picks: reformPath, quiz: { e6: [true, true] } });
    const png = Buffer.from(await page.evaluate(() => {
      const c = document.createElement('canvas'); c.width = 1280; c.height = 853;
      const x = c.getContext('2d')!; x.fillStyle = '#8a7a60'; x.fillRect(0, 0, 1280, 853); x.fillStyle = '#2a2018'; x.fillRect(320, 200, 640, 420);
      return c.toDataURL('image/png').split(',')[1];
    }), 'base64');
    const sizes: string[] = [];
    const cors = { 'access-control-allow-origin': '*' };
    await page.route(/vi\.wikipedia\.org\/w\/api\.php/, r => r.fulfill({ headers: cors, json: { query: { pages: { 1: { title: 'Ảnh thử', fullurl: 'https://vi.wikipedia.org/wiki/x', extract: 'x', pageimage: 'Test.png', thumbnail: { source: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Test.png/960px-Test.png' } } } } } }));
    await page.route(/rest_v1\/page\/media-list/, r => r.fulfill({ headers: cors, json: { items: [] } }));
    await page.route(/upload\.wikimedia\.org\/.*px-Test\.png/, r => { sizes.push(r.request().url().match(/\/(\d+)px-/)![1]); return r.fulfill({ contentType: 'image/png', body: png }); });
    await page.locator('#card [data-a=end].c').click();
    await page.getByRole('button', { name: /Xem phim hành trình/ }).click();
    const scene = page.locator('.cine.film .scene-s:not(.gone)');
    await expect(scene.locator('.print img')).toBeVisible({ timeout: 6000 });
    await page.locator('.cine.film .pz').click(); // hold the slide while measuring
    await page.waitForTimeout(1200); // entrance animations settle
    const m = await scene.evaluate(s => {
      const r = (e: Element | null) => { const b = e!.getBoundingClientRect(); return { x: b.left, y: b.top, r: b.right, b: b.bottom, w: b.width, h: b.height }; };
      return { print: r(s.querySelector('.print')), win: r(s.querySelector('.print .win')), plate: r(s.querySelector('.plate')), imgs: s.querySelectorAll('img').length, vw: innerWidth, vh: innerHeight };
    });
    expect(m.imgs).toBe(1); // no blurred copy behind the photo
    // the whole print is on screen, at the photo's own proportions (not cropped), and not blown up past 1.5x
    expect(m.print.x).toBeGreaterThanOrEqual(0);
    expect(m.print.r).toBeLessThanOrEqual(m.vw);
    expect(m.print.y).toBeGreaterThanOrEqual(40); // below the progress bar and the buttons
    expect(m.print.b).toBeLessThanOrEqual(m.vh);
    expect(Math.abs(m.win.w / m.win.h - 1280 / 853)).toBeLessThan(0.02);
    expect(m.win.w).toBeLessThanOrEqual(1280 * 1.5 + 1);
    // the caption plate sits beside (landscape) or under (portrait) the print, never over it
    const overlap = Math.max(0, Math.min(m.print.r, m.plate.r) - Math.max(m.print.x, m.plate.x)) * Math.max(0, Math.min(m.print.b, m.plate.b) - Math.max(m.print.y, m.plate.y));
    expect(overlap).toBe(0);
    if (w > h) expect(m.plate.x).toBeGreaterThan(m.print.r); else expect(m.plate.y).toBeGreaterThan(m.print.b);
    // Commons is asked for a standard thumbnail width larger than the article's 960 px, never an odd size
    expect(sizes.length).toBeGreaterThan(0);
    for (const s of sizes) expect(['960', '1280', '1920']).toContain(s);
    expect(sizes).toContain(w > h ? '1920' : '1280');
    expect(errors).toEqual([]);
  });
}

test('share card carries the public address of the game', async ({ page }) => {
  await page.addInitScript(() => {
    const f = CanvasRenderingContext2D.prototype.fillText, seen: string[] = ((window as any).__txt = []);
    CanvasRenderingContext2D.prototype.fillText = function (this: CanvasRenderingContext2D, t: string, x: number, y: number, mw?: number) { seen.push(String(t)); return mw === undefined ? f.call(this, t, x, y) : f.call(this, t, x, y, mw); };
  });
  const errors = await boot(page, { step: 'play', name: 'Họ Trần', year: 2026, picks: reformPath, quiz: { e6: [true, true] } });
  await page.locator('#card [data-a=end].c').click();
  await page.getByRole('button', { name: 'Tạo thẻ chia sẻ' }).click();
  await expect(page.getByAltText('Thẻ kết quả')).toBeVisible();
  expect(await page.evaluate(() => (window as any).__txt as string[])).toContain('du-do-seven.vercel.app');
  expect(errors).toEqual([]);
});

test('ending (play mode): home, card decisions and harvest snapshots shape the ending, tier and gia phả', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.route(/wikipedia\.org|wikimedia\.org/, r => r.abort());
  // every card decided (the first choice), except those that would send a branch away or split the family in 1954
  const ids = [...readFileSync('src/data/cards.ts', 'utf8').matchAll(/^  \['(\w+)', '/gm)].map(m => m[1]);
  const cards = { ...Object.fromEntries(ids.map(id => [id, 0])), gnv: 1, dc54: 1, sg75: 1, tn80: 1 };
  const r = (g: number, d: number, b: number, u: number) => ({ g, d, b, u });
  const st = { step: 'play', mode: 'play', name: 'Họ Lê', surname: 'le', home: 'hn', year: 2026, picks: { e1: 'chien', e2: 'duytan', e3: 'cs', e4: 'vm', e5: 'bac', e6: 'doimoi' },
    quiz: { e1: [true, true], e2: [true, true], e3: [true, true], e4: [true, true], e5: [true, true], e6: [true, true] }, cards, cardv: {}, xFrom: 2026,
    harvests: ['e1', 'e2', 'e3', 'e4', 'e5', 'e6'], snap: { e1: r(55, 42, 30, 22), e2: r(50, 44, 35, 30), e3: r(40, 45, 30, 40), e4: r(30, 40, 20, 45), e5: r(45, 46, 40, 50), e6: r(50, 45, 45, 45) }, res: r(50, 45, 45, 45) };
  await page.addInitScript(s => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('dudo-v2-play', s); localStorage.setItem('dudo-mode', 'play'); sessionStorage.setItem('seeded', '1'); } }, JSON.stringify(st));
  await page.goto('/');
  await page.locator('#card [data-a=end].c').click();
  // 4/5 dominant picks, none on the Quốc gia / VNCH side
  await expect(page.locator('.end-title')).toHaveText('Cùng nhịp với lịch sử');
  await expect(page.locator('.end-kick')).toContainText('Họ Lê · Hà Nội');
  await expect(page.locator('.end-epi')).toContainText('lên chiến khu Việt Bắc theo Việt Minh'); // a northern home's resistance
  await expect(page.locator('.end-epi')).toContainText('Chỉ đời thứ nhất rẽ khác');
  await expect(page.locator('.end-rar')).toContainText(/\d+(,\d)?% dòng họ trong mô phỏng đi tới kết cục này/);
  await expect(page.locator('.cf-card h2')).toHaveText('Nếu triều đình dồn sức chủ chiến (1858–1862)');
  await expect(page.locator('.cf-card')).toContainText('khoảng 5% (1 trên 20)');
  // wealth is ranked against families from the same home (185 in Hà Nội: between P5 and P25)
  await expect(page.locator('.end-rank')).toContainText('Nhà sa sút');
  await expect(page.locator('.end-reg')).toContainText('Nhà sa sút'); // also on the summary register line
  await expect(page.locator('.gens li')).toHaveCount(6);
  await expect(page.locator('.gens li.best')).toContainText('Đời 5');
  await expect(page.locator('.gens li.worst')).toContainText('Đời 4');
  // the gia phả carries the family's biggest decisions, up to two per generation
  await expect(page.locator('.end-gp .chron.gp-dec').first()).toBeAttached();
  expect(await page.locator('.end-gp .chron.gp-dec').count()).toBeLessThanOrEqual(12);
  await page.getByRole('button', { name: /Xem phim hành trình/ }).click();
  for (let i = 0; i < 6; i++) await page.keyboard.press('ArrowRight');
  await expect(page.locator('.cine.film .fin h1')).toHaveText('Cùng nhịp với lịch sử');
  await expect(page.locator('.cine.film .fin .mono').first()).toContainText('Họ Lê');
  expect(errors).toEqual([]);
});

test('reading mode: skipping chapter 6 leads to the conclusion, not to a bare 2026 map', async ({ page }) => {
  const errors = await boot(page, { step: 'play', name: 'Họ Trần', year: 1976, picks: reformPath, quiz: { e1: [true, true], e2: [true, true], e3: [true, true], e4: [true, true], e5: [true, true] } });
  await page.locator('#play').click();
  await expect(page.locator('#tourb')).toBeVisible({ timeout: 5000 });
  const skip = page.locator('#tourb [data-t=skip]');
  await skip.click();
  await skip.click();
  await expect(page.locator('.end-title')).toHaveText('Bốn đời canh tân', { timeout: 6000 });
  await expect(page.getByText(/Đố nhanh/i)).toHaveCount(0); // a skipped chapter is not quizzed
  expect(errors).toEqual([]);
});

test('play mode: after a card decision the family event comes into view, the unpicked options fold, values read as a ledger', async ({ page }) => {
  const errors = await bootPlay(page, { name: 'Họ Tôn Thất', surname: 'tonthat', home: 'hn', year: 1945, picks: { e1: 'chien', e2: 'canvuong', e3: 'cs', e4: 'vm' },
    quiz: { e1: [true, true], e2: [true, true], e3: [true, true] }, harvests: ['e1', 'e2', 'e3'], res: { g: 40, d: 40, b: 40, u: 60 }, xFrom: 0 }, 'ng45');
  await expect(page.locator('#tourb')).toBeVisible({ timeout: 8000 });
  await page.locator('#tourb [data-t=skip]').click();
  await expect(page.locator('.scrim h2')).toContainText('Cách mạng tháng Tám', { timeout: 8000 });
  await expect(page.locator('.scrim .steps')).toContainText('Biến cố riêng'); // the second decision is announced up front
  // values are ledger lines in the text face (name, then a signed number), not monospace pills
  const fx = page.locator('.scrim .opt .fx').first();
  expect(await fx.evaluate(e => getComputedStyle(e).fontFamily)).not.toMatch(/Mono/i);
  await expect(fx.locator('b')).toHaveText(/^[+−]\d+$/);
  await page.locator('.scrim .opt').first().click();
  await page.locator('#cgo').click();
  await expect(page.locator('.scrim .sheet > [role=radiogroup] .opt.skip')).toHaveCount(2);
  await expect(page.locator('.scrim .xsp > h3')).toBeInViewport(); // not ~900 px below the fold
  await expect(page.locator('.scrim .steps')).toHaveClass(/two/);
  expect(errors).toEqual([]);
});

test('toasts come one at a time, above the tab bar on the main screen', async ({ page }) => {
  const errors = await boot(page, midGame);
  await page.waitForTimeout(800);
  // notices in a row (a locked chapter-6 figure tapped twice, plus any badge earned at start): never drawn on top of each other
  const tap = () => page.evaluate(() => { const b = document.createElement('button'); b.dataset.a = 'fig'; b.dataset.id = 'vvk'; document.body.appendChild(b); b.click(); b.remove(); });
  await tap(); await tap();
  let most = 0, shown = 0;
  for (let t = 0; t < 32; t++) { const n = await page.locator('.toast:visible').count(); most = Math.max(most, n); shown += n; await page.waitForTimeout(250); }
  expect(most).toBe(1);
  expect(shown).toBeGreaterThan(14); // more than one notice's 2,8 s: the second showed after the first
  // on the main screen a notice sits above the tab bar, not over the year in the header
  await expect(page.locator('.toast')).toHaveCount(0, { timeout: 8000 });
  await tap();
  await expect(page.locator('.toast:visible')).toHaveCount(1);
  await page.waitForTimeout(600); // đã trượt vào chỗ
  const tb = (await page.locator('.toast:visible').boundingBox())!, yr = (await page.locator('#yr').boundingBox())!, tabs = (await page.locator('#tabs').boundingBox())!;
  expect(tb.y).toBeGreaterThan(yr.y + yr.height);
  expect(tb.y + tb.height).toBeLessThanOrEqual(tabs.y);
  expect(errors).toEqual([]);
});

test('onboarding: the cover shows a map plate with Hoàng Sa and Trường Sa; the home picker marks the chosen home on it', async ({ page }) => {
  const errors = await boot(page);
  await expect(page.locator('.sp-plate .pl-vn')).toBeAttached();
  await expect(page.locator('.sp-plate .pl-lab')).toHaveText(['Q.đ. Hoàng Sa', 'Q.đ. Trường Sa']);
  await page.getByRole('button', { name: /Vào trò chơi/ }).click();
  await expect(page.locator('.hp-map .pl-dot.on text')).toHaveText('Hà Nội');
  await page.getByRole('button', { name: 'Cần Thơ' }).click();
  await expect(page.locator('.hp-map .pl-dot.on text')).toHaveText('Cần Thơ');
  await expect(page.getByRole('button', { name: 'Cần Thơ', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: /Bắt đầu năm 1858 ở Cần Thơ/ })).toBeVisible();
  expect(errors).toEqual([]);
});

test.describe('iPad sheets', () => {
  test('landscape: a card is a document in the side column, the map beside it stays uncovered', async ({ page }) => {
    await page.setViewportSize({ width: 1180, height: 820 });
    const errors = await bootPlay(page, { name: 'Họ Lê', surname: 'le', home: 'na', year: 1954, picks: { e1: 'chien', e2: 'canvuong', e3: 'cs', e4: 'vm' },
      quiz: { e1: [true, true], e2: [true, true], e3: [true, true] }, harvests: ['e1', 'e2', 'e3'], res: { g: 40, d: 40, b: 40, u: 30 } }, 'dbp');
    await expect(page.locator('#tourb')).toBeVisible({ timeout: 8000 });
    await page.locator('#tourb [data-t=skip]').click();
    await expect(page.locator('.scrim h2')).toHaveText('Điện Biên Phủ', { timeout: 8000 });
    const map = (await page.locator('#mapwrap').boundingBox())!, sh = (await page.locator('.scrim .sheet').boundingBox())!;
    expect(sh.x).toBeGreaterThanOrEqual(map.x + map.width - 1);
    expect(Math.round(sh.height)).toBe(820);
    expect(errors).toEqual([]);
  });
  test('landscape: the turning point shows its three roads side by side, the confirm button in view without scrolling', async ({ page }) => {
    await page.setViewportSize({ width: 1180, height: 820 });
    const errors = await boot(page, { step: 'play', name: 'Họ Lê', year: 1930, picks: { e1: 'canhtan', e2: 'duytan' }, quiz: { e1: [true, true], e2: [true, true] } });
    await page.waitForTimeout(800);
    await page.locator('#eraR').click();
    await expect(page.locator('#layer .opt[data-o="cs"]')).toBeAttached({ timeout: 12000 });
    const ys = await page.locator('#layer .opt').evaluateAll(os => os.map(o => Math.round(o.getBoundingClientRect().y)));
    expect(new Set(ys).size).toBe(1);
    const d = await page.locator('#layer .scrim .sheet').evaluate(e => [e.scrollHeight, e.clientHeight]);
    expect(d[0]).toBeLessThanOrEqual(d[1] + 1);
    await expect(page.locator('#go')).toBeInViewport();
    expect(errors).toEqual([]);
  });
  test('portrait: sheets dock across the full width at the bottom, the map above stays in view', async ({ page }) => {
    await page.setViewportSize({ width: 820, height: 1180 });
    const errors = await boot(page, midGame);
    await page.locator('.tab[data-t=src]').click();
    await page.locator('#sl .src[data-a=src]').first().click();
    const box = () => page.locator('.scrim .sheet').evaluate(e => { const r = e.getBoundingClientRect(); return [r.x, r.width, Math.round(r.bottom)]; });
    await expect.poll(box).toEqual([0, 820, 1180]); // sau khi trượt lên xong
    expect(errors).toEqual([]);
  });
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
        // the caption floats right above the replay bar, in the same column (same left and right edges)
        const lt = (await page.locator('#mapwrap .lt').boundingBox())!, bar = (await page.locator('#replb').boundingBox())!;
        expect(Math.abs(lt.x - bar.x)).toBeLessThan(1.5);
        expect(Math.abs(lt.x + lt.width - (bar.x + bar.width))).toBeLessThan(1.5);
        expect(lt.y + lt.height).toBeLessThanOrEqual(bar.y + 1);
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

test.describe('short and wide windows', () => {
  const ng45 = { name: 'Họ Tôn Thất', surname: 'tonthat', home: 'hn', year: 1945, picks: { e1: 'chien', e2: 'canvuong', e3: 'cs', e4: 'vm' },
    quiz: { e1: [true, true], e2: [true, true], e3: [true, true] }, harvests: ['e1', 'e2', 'e3'], res: { g: 40, d: 40, b: 40, u: 60 }, xFrom: 0 };
  test('phone landscape: the map gets room beside the story column, the tab bar stays on screen, the app never scrolls', async ({ page }) => {
    await page.setViewportSize({ width: 844, height: 390 });
    const errors = await bootPlay(page, ng45, 'ng45');
    await expect(page.locator('#map g.m').first()).toBeAttached();
    const map = (await page.locator('#mapwrap').boundingBox())!, card = (await page.locator('#card').boundingBox())!, tabs = (await page.locator('#tabs').boundingBox())!;
    expect(map.height).toBeGreaterThan(200); // trước đây 12 px
    expect(card.x).toBeGreaterThan(map.x + map.width - 1);
    expect(tabs.y + tabs.height).toBeLessThanOrEqual(391);
    // a card decision scrolls its sheet to the family event; the app frame itself never stays scrolled
    await expect(page.locator('#tourb')).toBeVisible({ timeout: 8000 });
    await page.locator('#tourb [data-t=skip]').click();
    await expect(page.locator('.scrim h2')).toContainText('Cách mạng tháng Tám', { timeout: 8000 });
    await page.locator('.scrim .opt').first().evaluate(b => (b as HTMLElement).click());
    await page.locator('#cgo').evaluate(b => (b as HTMLElement).click());
    await expect(page.locator('.scrim .xsp > h3')).toBeVisible();
    expect(await page.locator('#app').evaluate(a => a.scrollTop)).toBe(0);
    const shift = await page.evaluate(async () => { const a = document.getElementById('app')!, d = document.createElement('div'); d.style.cssText = 'position:absolute;top:1500px;width:4px;height:4px'; a.appendChild(d); d.scrollIntoView(); await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); const t = a.scrollTop; d.remove(); return t; });
    expect(shift).toBe(0);
    await page.locator('.xopts .opt').first().evaluate(b => (b as HTMLElement).click());
    await page.locator('#xgo').evaluate(b => (b as HTMLElement).click());
    await page.locator('.scrim .btn[data-a="close-card"]').click();
    await expect(page.locator('#layer > .scrim')).toHaveCount(0);
    await page.locator('.tab[data-t=me]').click();
    await expect(page.locator('#layer > .pane')).toBeVisible();
    expect(errors).toEqual([]);
  });
  for (const [name, w, h] of [['phone', 390, 664], ['iPad landscape', 1180, 820]] as const) {
    test(`${name}: badges earned on the ending show while it is open, clear of the dossier masthead`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: h });
      const errors = await boot(page, { step: 'play', name: 'Họ Trần', year: 2026, picks: reformPath, quiz: { e6: [true, true] }, badges: ['start'] });
      await page.locator('#card [data-a=end].c').click();
      const t = page.locator('.toast:visible');
      await expect(t).toHaveCount(1, { timeout: 4000 }); // màn rộng: trước đây chờ tới khi đóng trang
      await expect(t).toContainText('huy hiệu');
      await page.waitForTimeout(500); // đã trượt vào chỗ
      const a = (await t.boundingBox())!, m = (await page.locator('.end-mast').boundingBox())!;
      expect(a.y + a.height <= m.y || a.y >= m.y + m.height).toBe(true);
      expect(errors).toEqual([]);
    });
  }
  test('iPad landscape: the event page leaves every tab label whole; closing it marks its index row read in place', async ({ page }) => {
    await page.setViewportSize({ width: 1180, height: 820 });
    const errors = await boot(page, midGame);
    const row = page.locator('#idx button:not(.seen)').first(), id = (await row.getAttribute('data-id'))!;
    await page.evaluate(() => { const w = window as unknown as { rb: number }; w.rb = 0; new MutationObserver(r => { for (const m of r) if ([...m.addedNodes].some(n => n.nodeName === 'OL')) w.rb++; }).observe(document.getElementById('idx')!, { childList: true }); });
    await page.evaluate(i => { const b = document.createElement('button'); b.dataset.a = 'ev'; b.dataset.id = i; document.body.appendChild(b); b.click(); b.remove(); }, id);
    const pg = (await page.locator('#layer > .ov.evp').boundingBox())!;
    await expect.poll(async () => Math.max(...(await page.locator('.tab').evaluateAll(ts => ts.map(t => t.getBoundingClientRect().right))))).toBeLessThanOrEqual(pg.x);
    await page.locator('#layer .ov .back').click();
    await expect(page.locator(`#idx button[data-id="${id}"]`)).toHaveClass(/seen/);
    expect(await page.evaluate(() => (window as unknown as { rb: number }).rb)).toBe(0);
    expect(errors).toEqual([]);
  });
});
