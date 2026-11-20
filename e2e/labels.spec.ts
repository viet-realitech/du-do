import { test, expect, devices, type Page } from '@playwright/test';

/* Nhãn chủ quyền (Hoàng Sa, Trường Sa, Biển Đông, Vịnh Bắc Bộ) phải hiện đủ chữ: trên tấm bản đồ nhỏ ở màn chào (nằm
   trọn trong khung, không chạm nét viền) và ở bản đồ mặc định (trong vùng bản đồ thấy được, không bị gì che), trên điện
   thoại dọc, ngang và iPad Pro 11 dọc, ngang. Mỗi khung máy một ngữ cảnh riêng, cùng trình duyệt của project. */
const VIEWS: [string, string][] = [
  ['điện thoại dọc', 'iPhone 13'], ['điện thoại ngang', 'iPhone 13 landscape'],
  ['iPad Pro 11 dọc', 'iPad Pro 11'], ['iPad Pro 11 ngang', 'iPad Pro 11 landscape'],
];
const PLATE = ['Q.đ. Hoàng Sa', 'Q.đ. Trường Sa', 'Biển Đông'];
const MAP = [...PLATE, 'Vịnh Bắc Bộ'];
const midGame = { step: 'play', name: 'Họ Lê', year: 1954, picks: { e1: 'chien', e2: 'duytan', e3: 'cs', e4: 'vm', e5: 'nam' } };

/** Lỗi của từng nhãn (rỗng là đạt): thiếu nhãn, chữ ra ngoài vùng thấy được (hộp `root` cách lề `pad` px, giao với mọi tổ
    tiên cắt tràn và khung nhìn), hay bị phần tử khác che. */
function problems(page: Page, root: string, names: string[], pad: number) {
  return page.evaluate(([root, names, pad]) => {
    const svg = document.querySelector<SVGSVGElement>(root as string);
    if (!svg) return [`không có ${root}`];
    svg.scrollIntoView({ block: 'center' });
    const b = svg.getBoundingClientRect();
    let v = { l: b.left + (pad as number), t: b.top + (pad as number), r: b.right - (pad as number), b: b.bottom - (pad as number) };
    for (let n = svg.parentElement; n; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.overflowX === 'visible' && cs.overflowY === 'visible') continue;
      const q = n.getBoundingClientRect();
      v = { l: Math.max(v.l, q.left), t: Math.max(v.t, q.top), r: Math.min(v.r, q.right), b: Math.min(v.b, q.bottom) };
    }
    v = { l: Math.max(v.l, 0), t: Math.max(v.t, 0), r: Math.min(v.r, innerWidth), b: Math.min(v.b, innerHeight) };
    const out: string[] = [];
    for (const name of names as string[]) {
      const t = [...svg.querySelectorAll('text')].find(x => x.textContent!.trim() === name);
      if (!t) { out.push(`${name}: không có nhãn`); continue; }
      const r = t.getBoundingClientRect();
      if (!r.width) { out.push(`${name}: không hiện`); continue; }
      if (r.left < v.l - 0.5 || r.right > v.r + 0.5 || r.top < v.t - 0.5 || r.bottom > v.b + 0.5)
        out.push(`${name}: [${Math.round(r.left)}, ${Math.round(r.right)}] × [${Math.round(r.top)}, ${Math.round(r.bottom)}] ra ngoài [${Math.round(v.l)}, ${Math.round(v.r)}] × [${Math.round(v.t)}, ${Math.round(v.b)}]`);
      for (const [x, y] of [[r.left + 1, (r.top + r.bottom) / 2], [r.right - 1, (r.top + r.bottom) / 2], [(r.left + r.right) / 2, (r.top + r.bottom) / 2]]) {
        const el = document.elementFromPoint(x, y);
        if (el && el !== svg && !svg.contains(el)) { out.push(`${name}: bị ${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}.${String(el.getAttribute('class') || '').split(' ')[0]} che`); break; }
      }
    }
    return out;
  }, [root, names, pad] as const);
}

for (const [name, dev] of VIEWS) {
  test(`sovereignty labels are whole on the splash plate and the default map · ${name}`, async ({ browser }, info) => {
    const { defaultBrowserType: _, ...d } = devices[dev];
    const ctx = await browser.newContext({ ...d, baseURL: info.project.use.baseURL, serviceWorkers: 'block' });
    try {
      const page = await ctx.newPage();
      await page.route(/wikipedia\.org|wikimedia\.org/, r => r.abort());
      await page.goto('/');
      await expect(page.locator('.sp-plate svg text', { hasText: 'Trường Sa' })).toBeVisible();
      // khung có viền 1 px và nét viền ngoài: chữ phải cách mép hộp ít nhất 2 px
      await expect.poll(() => problems(page, '.sp-plate svg', PLATE, 2), { timeout: 8000 }).toEqual([]);

      await page.addInitScript(s => localStorage.setItem('dudo-v2', s), JSON.stringify(midGame));
      await page.goto('/');
      await expect(page.locator('#map text', { hasText: 'Trường Sa' })).toBeAttached({ timeout: 10_000 });
      await expect.poll(() => problems(page, '#map', MAP, 0), { timeout: 10_000 }).toEqual([]);
    } finally {
      await ctx.close();
    }
  });
}

/* Màn chọn quê: tên quê đang chọn (chữ đậm cạnh vòng son) không chạm nhãn chủ quyền nào trên tấm bản đồ nhỏ, với cả tám
   quê. Nhãn Trường Sa canh lề phải từng đè lên "Sài Gòn – Gia Định". So hộp chữ theo đơn vị viewBox (getBBox). */
for (const [name, dev] of VIEWS) {
  test(`the home picker's selected home label clears the sovereignty labels · ${name}`, async ({ browser }, info) => {
    const { defaultBrowserType: _, ...d } = devices[dev];
    const ctx = await browser.newContext({ ...d, baseURL: info.project.use.baseURL, serviceWorkers: 'block' });
    try {
      const page = await ctx.newPage();
      await page.route(/wikipedia\.org|wikimedia\.org/, r => r.abort());
      await page.goto('/');
      await page.locator('[data-a=go-play]').click();
      await expect(page.locator('.hp-map svg')).toBeVisible();
      const homes = await page.locator('.hlist [data-a=home]').evaluateAll(bs => bs.map(b => (b as HTMLElement).dataset.v!));
      expect(homes.length).toBe(8);
      for (const h of homes) {
        await page.locator(`.hlist [data-a=home][data-v=${h}]`).click();
        await expect(page.locator('.hp-map .pl-dot.on text')).toHaveCount(1);
        const hits = await page.evaluate(names => {
          const svg = document.querySelector<SVGSVGElement>('.hp-map svg')!;
          const on = svg.querySelector<SVGTextElement>('.pl-dot.on text')!, a = on.getBBox();
          const out: string[] = [];
          for (const n of names) {
            const t = [...svg.querySelectorAll<SVGTextElement>('text')].find(x => x.textContent!.trim() === n);
            if (!t) { out.push(`${n}: không có nhãn`); continue; }
            const q = t.getBBox(), gap = 0.5;
            if (a.x < q.x + q.width + gap && q.x < a.x + a.width + gap && a.y < q.y + q.height + gap && q.y < a.y + a.height + gap)
              out.push(`${on.textContent} chạm ${n}: [${a.x.toFixed(1)}–${(a.x + a.width).toFixed(1)}] × [${a.y.toFixed(1)}–${(a.y + a.height).toFixed(1)}] / [${q.x.toFixed(1)}–${(q.x + q.width).toFixed(1)}] × [${q.y.toFixed(1)}–${(q.y + q.height).toFixed(1)}]`);
          }
          return out;
        }, PLATE);
        expect(hits, h).toEqual([]);
      }
      await expect.poll(() => problems(page, '.hp-map svg', PLATE, 2), { timeout: 8000 }).toEqual([]);
    } finally {
      await ctx.close();
    }
  });
}

/* Góc nhìn là lời tóm lược của ứng dụng, không phải trích dẫn: không có ngoặc kép (<q>), có nhãn "Tóm lược"; câu trích thật
   (khối .quote ở thẻ Diễn biến) vẫn có ngoặc và nguồn. pt84 từng có hai dòng "Quan điểm Trung Quốc". */
test('Góc nhìn shows unquoted summaries under a Tóm lược label; real quotes keep their block', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.route(/wikipedia\.org|wikimedia\.org/, r => r.abort());
  await page.addInitScript(s => localStorage.setItem('dudo-v2', s), JSON.stringify(midGame));
  await page.goto('/');
  const open = async (id: string) => {
    await page.evaluate(id => { const b = document.createElement('button'); b.dataset.a = 'ev'; b.dataset.id = id; b.id = 'goto-' + id; b.style.cssText = 'position:fixed;left:0;top:0;z-index:99999;width:12px;height:12px'; document.body.appendChild(b); }, id);
    await page.locator('#goto-' + id).click();
    await expect(page.locator('#layer > .ov #et')).toBeVisible();
  };
  await open('pt84');
  await expect(page.locator('#eb .quote blockquote')).toContainText('thừa nhận và chấp nhận quyền bảo hộ');
  await page.locator('#et').getByRole('tab', { name: 'Góc nhìn' }).click();
  await expect(page.locator('#eb .pv-sum')).toContainText('Tóm lược');
  await expect(page.locator('#eb .pv')).toHaveCount(3);
  await expect(page.locator('#eb .pv .pvt')).toHaveCount(3);
  await expect(page.locator('#eb q')).toHaveCount(0);
  await expect(page.locator('#eb .pvh', { hasText: 'Quan điểm Trung Quốc' })).toHaveCount(1);
  // câu trích Yên Bái đọc đúng câu trong phần Diễn biến (có bản thu); dị bản ghi ở dòng nguồn
  await page.locator('#layer > .ov .back[data-a=close]').click();
  await expect(page.locator('#layer > .ov')).toHaveCount(0);
  await open('yb30');
  await expect(page.locator('#eb .quote blockquote')).toHaveText('Không thành công cũng thành nhân.');
  await expect(page.locator('#eb .quote')).toContainText('còn truyền là');
  expect(errors).toEqual([]);
});

/* Bảng số liệu giữ số ngắn; phạm vi và nguồn của một số (mức 3,8 triệu ở sg75) in nhỏ trong dòng ghi chú dưới bảng, không
   nhồi vào ô số đậm (từng thành bốn dòng chữ đậm trên iPhone). */
test('sg75 number row stays short; the scope note sits in the muted line under the table', async ({ page }) => {
  await page.route(/wikipedia\.org|wikimedia\.org/, r => r.abort());
  await page.addInitScript(s => localStorage.setItem('dudo-v2', s), JSON.stringify(midGame));
  await page.goto('/');
  await page.evaluate(() => { const b = document.createElement('button'); b.dataset.a = 'ev'; b.dataset.id = 'sg75'; b.id = 'goto-sg75'; b.style.cssText = 'position:fixed;left:0;top:0;z-index:99999;width:12px;height:12px'; document.body.appendChild(b); });
  await page.locator('#goto-sg75').click();
  await expect(page.locator('#layer > .ov #et')).toBeVisible();
  const row = page.locator('#eb .nums > div', { hasText: 'Toàn cuộc chiến' });
  await expect(row.locator('b')).toHaveText('≈ 1,3 – 3,8 triệu người chết');
  await expect(page.locator('#eb .nums + p')).toContainText('Obermeyer');
  await expect(page.locator('#eb .nums + p')).toContainText('1955–2002');
  // mỗi ô số một dòng: không còn khối chữ đậm nhiều dòng
  for (const b of await page.locator('#eb .nums b').all()) {
    const [h, lh] = await b.evaluate(el => [el.getBoundingClientRect().height, parseFloat(getComputedStyle(el).lineHeight)]);
    expect(h).toBeLessThan(lh * 1.5);
  }
});
