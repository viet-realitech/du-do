/* Chuông báo cỡ gói (sau npm run build): cỡ nén gzip của JS, CSS chính (mà index.html nạp), tổng JS, và tổng các tệp
   service worker lưu sẵn ngoại tuyến, so với scripts/size-budget.json cộng 10%. Vượt thì lỗi: một thư viện lớn, một
   tệp dữ liệu bị gộp nhầm vào gói chính… Không phải để ép nhỏ, chỉ để thấy cú nhảy. Thêm có chủ ý thì ghi lại mốc:
   npm run build && npm run size:update. Chạy: npm run size */
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join } from 'node:path';

const argv = process.argv.slice(2), at = argv.indexOf('--budget');
const DIST = 'dist', FILE = (at >= 0 && argv[at + 1]) || 'scripts/size-budget.json', HEAD = 0.1; // --budget <tệp>: mốc khác (e2e/guards.spec.ts)
type Sizes = { mainJs: number; mainCss: number; allJs: number; precache: number };
const LABEL: Record<keyof Sizes, string> = { mainJs: 'JS chính (gzip)', mainCss: 'CSS chính (gzip)', allJs: 'tổng JS (gzip)', precache: 'lưu sẵn ngoại tuyến (thô)' };

if (!existsSync(join(DIST, 'index.html'))) { console.error('chưa có dist/: chạy npm run build trước'); process.exit(1); }
const gz = (f: string) => gzipSync(readFileSync(join(DIST, f)), { level: 9 }).length;
const html = readFileSync(join(DIST, 'index.html'), 'utf8');
const refs = (re: RegExp) => [...html.matchAll(re)].map(m => m[1].replace(/^\.?\//, ''));
const js = refs(/<script[^>]+type="module"[^>]+src="([^"]+)"/g), css = refs(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g);
if (!js.length || !css.length) { console.error('dist/index.html: không thấy script module hay stylesheet chính'); process.exit(1); }
// danh sách lưu sẵn của service worker (vite-plugin-pwa): {url:"…",revision:…}
const sw = existsSync(join(DIST, 'sw.js')) ? readFileSync(join(DIST, 'sw.js'), 'utf8') : '';
const pre = [...new Set([...sw.matchAll(/\burl:\s*"([^"]+)"/g)].map(m => m[1]))].filter(u => existsSync(join(DIST, u)));
const now: Sizes = {
  mainJs: js.reduce((n, f) => n + gz(f), 0),
  mainCss: css.reduce((n, f) => n + gz(f), 0),
  allJs: readdirSync(join(DIST, 'assets')).filter(f => f.endsWith('.js')).reduce((n, f) => n + gz(join('assets', f)), 0),
  precache: pre.reduce((n, u) => n + statSync(join(DIST, u)).size, 0),
};
const kb = (n: number) => `${(n / 1024).toFixed(1)} KB`;

if (argv.includes('--update')) {
  writeFileSync(FILE, JSON.stringify({ about: `Mốc cỡ gói (byte), scripts/check-size.ts: lỗi khi vượt mốc ${HEAD * 100}%. Ghi lại: npm run build && npm run size:update`, ...now }, null, 1) + '\n');
  console.log(`đã ghi ${FILE}: ${(Object.keys(LABEL) as (keyof Sizes)[]).map(k => `${LABEL[k]} ${kb(now[k])}`).join(', ')}`);
  process.exit(0);
}
if (!existsSync(FILE)) { console.error(`thiếu ${FILE}: npm run size:update`); process.exit(1); }
const base = JSON.parse(readFileSync(FILE, 'utf8')) as Sizes;
let bad = 0;
for (const k of Object.keys(LABEL) as (keyof Sizes)[]) {
  const lim = Math.round(base[k] * (1 + HEAD)), d = Math.round((now[k] / base[k] - 1) * 1000) / 10;
  const over = now[k] > lim;
  if (over) bad++;
  console[over ? 'error' : 'log'](`${over ? '✗' : '·'} ${LABEL[k].padEnd(26)} ${kb(now[k]).padStart(10)}  mốc ${kb(base[k])} (${d > 0 ? '+' : ''}${d ? d.toFixed(1) : '0.0'}%)${over ? `, quá ${kb(lim)}` : ''}`);
}
if (bad) {
  console.error(`\nGói lớn hơn mốc quá ${HEAD * 100}%. Tìm xem cái gì vừa vào gói (npx vite build in cỡ từng tệp); nếu cố ý, ghi lại mốc: npm run build && npm run size:update`);
  process.exit(1);
}
console.log(`cỡ gói trong mốc ${FILE} + ${HEAD * 100}%`);
