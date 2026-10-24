// Render PNG app icons + the Open Graph card into public/. Run: npm run icons
// Uses the project's own fonts and province geometry; needs Playwright's Chromium.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { geoArea, geoMercator, geoPath } from 'd3';
import { chromium } from 'playwright';

const root = new URL('../', import.meta.url);
// Inline as data URLs: pages set via setContent() can't read file:// fonts.
const font = (pkg, file) => 'data:font/woff2;base64,' + readFileSync(fileURLToPath(new URL(`node_modules/@fontsource/${pkg}/files/${file}`, root))).toString('base64');
const css = `
@font-face{font-family:BS;font-weight:900;src:url(${font('big-shoulders-display', 'big-shoulders-display-vietnamese-900-normal.woff2')})}
@font-face{font-family:BS;font-weight:900;src:url(${font('big-shoulders-display', 'big-shoulders-display-latin-900-normal.woff2')})}
@font-face{font-family:EB;font-style:italic;src:url(${font('eb-garamond', 'eb-garamond-vietnamese-500-italic.woff2')})}
@font-face{font-family:EB;font-style:italic;src:url(${font('eb-garamond', 'eb-garamond-latin-500-italic.woff2')})}
@font-face{font-family:PM;src:url(${font('ibm-plex-mono', 'ibm-plex-mono-vietnamese-500-normal.woff2')})}
@font-face{font-family:PM;src:url(${font('ibm-plex-mono', 'ibm-plex-mono-latin-500-normal.woff2')})}
*{margin:0;box-sizing:border-box}body{background:#16130f}`;

// Vietnam silhouette (provinces, current boundaries) for the share card.
const provs = JSON.parse(readFileSync(new URL('src/data/vn-provinces.json', root)));
// Same rewinding as the app: d3 wants clockwise exterior rings.
const rewind = pg => (geoArea({ type: 'Polygon', coordinates: pg }) > 2 * Math.PI ? pg.map(r => r.slice().reverse()) : pg);
const fc = { type: 'FeatureCollection', features: provs.map(p => ({ type: 'Feature', geometry: { type: 'MultiPolygon', coordinates: p.c.map(rewind) } })) };
const proj = geoMercator().fitExtent([[0, 0], [380, 530]], { type: 'MultiPoint', coordinates: [[102.1, 8.4], [115.2, 23.4]] });
const vnPath = geoPath(proj)(fc);
const y17 = proj([105, 17])[1];
// Hoàng Sa / Trường Sa, as on the in-app map.
const ISL = [[111.6, 16.5], [112.3, 16.8], [111.9, 16.2], [112.7, 16.6], [114.2, 10.4], [113.6, 9.9], [114.4, 9.4], [114.0, 8.9], [114.9, 10.0]];
const isl = ISL.map(q => { const [x, y] = proj(q); return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3" fill="#efe0bf"/>`; }).join('');
const lab = (t, q, dx, dy) => { const [x, y] = proj(q); return `<text x="${(x + dx).toFixed(1)}" y="${(y + dy).toFixed(1)}" text-anchor="middle" font-family="EB" font-style="italic" font-size="17" fill="#c2b08d">${t}</text>`; };

const icon = s => `<div style="width:${s}px;height:${s}px;background:#16130f;display:grid;place-items:center">
  <div style="font:900 ${s * 0.42}px/1 BS;color:#e6a73c;letter-spacing:-.01em;transform:translateY(${s * 0.02}px)">DĐ</div></div>`;
const og = `<div style="width:1200px;height:630px;background:#16130f;position:relative;overflow:hidden;color:#efe0bf">
  <div style="position:absolute;inset:28px;border:2px solid rgba(239,224,191,.35);border-radius:6px"></div>
  <svg width="380" height="530" style="position:absolute;right:64px;top:50px;overflow:visible" viewBox="0 0 380 530">
    <path d="${vnPath}" fill="#d3a338" stroke="#16130f" stroke-width=".6"/>
    <line x1="70" x2="215" y1="${y17}" y2="${y17}" stroke="#efe0bf" stroke-width="2.5" stroke-dasharray="7 5"/>
    ${isl}${lab('Hoàng Sa', [112.2, 16.5], 0, 28)}${lab('Trường Sa', [114.2, 9.6], -8, 34)}
  </svg>
  <div style="position:absolute;left:84px;top:86px;font:500 20px PM;letter-spacing:.14em;color:#c2b08d">HỒ SƠ LƯU TRỮ · 1858 – 2026</div>
  <div style="position:absolute;left:78px;top:132px;font:900 190px/0.9 BS;color:#e6a73c">Dư Đồ</div>
  <div style="position:absolute;left:84px;top:330px;width:620px;font:italic 500 40px/1.2 EB">Cảm hứng bản đồ Việt Nam, từ thời Pháp thuộc tới nay</div>
  <div style="position:absolute;left:84px;bottom:76px;font:500 20px PM;letter-spacing:.12em;color:#c2b08d">6 THẾ HỆ · 6 ĐIỂM RẼ · MỘT TRÒ CHƠI LỊCH SỬ</div>
</div>`;

const b = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
const p = await b.newPage();
async function render(html, w, h, file) {
  await p.setViewportSize({ width: w, height: h });
  await p.setContent(`<!doctype html><meta charset=utf-8><style>${css}</style>${html}`);
  await p.evaluate(() => document.fonts.ready);
  writeFileSync(new URL(`public/${file}`, root), await p.screenshot({ type: 'png' }));
  console.log('wrote', file);
}
await render(icon(512), 512, 512, 'icon-512.png');
await render(icon(192), 192, 192, 'icon-192.png');
await render(icon(180), 180, 180, 'apple-touch-icon.png');
await render(og, 1200, 630, 'og.png');
await b.close();
