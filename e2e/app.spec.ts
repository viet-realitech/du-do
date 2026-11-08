import { test, expect, type Page } from '@playwright/test';

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
  const go = page.locator('#go');
  await expect(go).toBeDisabled();
  await page.locator('.opt').first().click();
  await go.click();
  await expect(page.getByText('Con đường của bạn')).toBeVisible();
  await page.getByRole('button', { name: /Xem chương 1 diễn ra/ }).click();
  await expect(page.locator('#tourb')).toBeVisible();
  await expect(page.locator('#map g.co')).toHaveCount(1); // tour callout on the map
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
  expect(await page.locator('#map g.scene g.bd').count()).toBeGreaterThanOrEqual(2);
  // "›" skips the rest of a long battle step
  await page.locator('#tourb [data-t=next]').click();
  await expect(page.locator('#tourb')).toContainText('2/', { timeout: 5000 });
  await page.locator('#tourb [data-t=stop]').click();
  await expect(page.locator('#tourb')).toHaveCount(0);
  await expect(lt).toHaveCount(0, { timeout: 1000 });
  await expect(page.locator('#mapwrap .slug')).toHaveCount(0);
  await expect(page.locator('#mapwrap.scn')).toHaveCount(0);
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
  await page.locator('#sq').fill('Genève');
  await expect(page.locator('#sl .src').first()).toBeVisible();
  await page.locator('#sl .src').first().click();
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
  await expect(page.locator('#map rect[fill="url(#p-sea)"]')).toHaveCount(1); // poster's half-tone sea
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
  await expect(page.getByText('Dòng họ phải quyết định')).toBeVisible({ timeout: 30_000 }); // opens once the battle scene has played out (~17 s), narration or not
  await expect(page.locator('#tourb')).toContainText('chờ quyết định');
  const before = await page.locator('#res .mt').first().locator('b').first().textContent();
  await page.locator('.scrim .opt').first().click();
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
  await expect(page.getByText('Bạn là một dòng họ Việt đi qua sáu thế hệ.')).toBeVisible();
  await expect(page.locator('#res')).toBeHidden();
  await page.reload();
  await expect(page.getByText('Bạn là một dòng họ Việt đi qua sáu thế hệ.')).toBeVisible();
  expect(errors).toEqual([]);
});

test('reaching the present opens the last quiz, then the ending', async ({ page }) => {
  const done = { ...midGame, year: 2026, picks: { ...midGame.picks, e6: 'doimoi' }, quiz: { ...midGame.quiz, e5: [true, true] } };
  const errors = await boot(page, done);
  await page.locator('#card [data-a=end]').first().click();
  await page.getByRole('button', { name: 'Bỏ qua' }).click();
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
  await page.goBack();
  await expect(page.locator('#replb')).toHaveCount(0);
  expect(page.url()).toContain('localhost');
  await expect(page.locator('#mapwrap.tilt')).toHaveCount(0);
  // again: the replay restarts from the first beat, and Đóng closes it
  await page.locator('#goto-dbp').click();
  await page.locator('.ov .hero .hplay').click();
  await expect(page.locator('#mapwrap .lt .lt-h')).toContainText('2/', { timeout: 9000 });
  await page.locator('#replb [data-t=again]').click();
  await expect(page.locator('#mapwrap .lt .lt-h')).toContainText('1/', { timeout: 5000 });
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
  await expect(page.locator('#map g.scene text.fx-q')).toHaveCount(1, { timeout: 20000 });
  await expect(page.locator('#map g.scene[data-contacts="1"]')).toHaveCount(1);
  await expect(page.locator('#map g.scene g.pc[data-kind=boat]').first()).toBeAttached();
  // Vĩnh Long 1867: handed over without resistance, so no explosions
  await replay('vl67');
  await expect(page.locator('#mapwrap .lt .lt-h')).toContainText('3/3', { timeout: 15000 });
  await page.waitForTimeout(2500);
  await expect(page.locator('#map g.scene circle[fill="url(#fx-boom)"]')).toHaveCount(0);
  // Điện Biên Phủ: the siege of Hồng Cúm draws a ring; the battle closes on its end date, the event's own words,
  // the three fallen French positions greyed out, and a way into the perspectives
  await replay('dbp');
  await expect(page.locator('#map g.scene circle.fx-ring')).toHaveCount(1, { timeout: 16000 });
  await expect(page.locator('#mapwrap .endw .stamp')).toHaveText('7.5.1954', { timeout: 12000 });
  await expect(page.locator('#mapwrap .lt.end p')).toContainText('thất thủ');
  await expect(page.locator('#map g.scene rect[fill-opacity="0"]')).toHaveCount(3, { timeout: 2000 });
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
      expect(errors).toEqual([]);
    });
  }
});
