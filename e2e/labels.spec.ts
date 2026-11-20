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
