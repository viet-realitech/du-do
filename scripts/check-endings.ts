/* Bảng hiếm của kết cục (src/data/endings-rarity.json) phải đúng là bảng scripts/sim-endings.ts tính ra: mô phỏng dùng hạt
   giống cố định nên tính lại cho đúng từng số, và bảng cũ (quên chạy npm run endings sau khi đổi thẻ, luật hay kết cục)
   là lỗi. Chạy: npm run endings:check (chạy cả mô phỏng, vài phút) · thêm `-- --from <tệp>` để so một bảng đã tính.
   `--filter`: CI chỉ chạy việc này khi một tệp mô phỏng dùng tới đổi (.github/filters.yml, nhóm `endings`); kiểm nhóm ấy
   phủ đủ mọi tệp mô phỏng nhập (lần theo import từ scripts/sim-endings.ts), để một import mới không lọt khỏi bộ lọc. */
import { existsSync, mkdtempSync, readFileSync, statSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dirname, join, normalize, relative } from 'node:path';

const argv = process.argv.slice(2), opt = (k: string) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] || '' : ''; };
const SIM = 'scripts/sim-endings.ts', TABLE = 'src/data/endings-rarity.json', FILTERS = opt('--filters') || '.github/filters.yml';

/** Các tệp trong repo mà `entry` nhập (import / export … from / import()), lần hết vào trong. */
function closure(entry: string): string[] {
  const seen = new Set<string>(), todo = [entry];
  const resolve = (from: string, spec: string) => {
    const base = normalize(join(dirname(from), spec));
    return [base, `${base}.ts`, `${base}.js`, `${base}.json`, join(base, 'index.ts'), join(base, 'index.js')].find(f => existsSync(f) && statSync(f).isFile());
  };
  while (todo.length) {
    const f = todo.pop()!;
    if (seen.has(f)) continue;
    seen.add(f);
    if (!/\.[jt]s$/.test(f)) continue;
    for (const m of readFileSync(f, 'utf8').matchAll(/(?:\bfrom|\bimport)\s*\(?\s*['"](\.{1,2}\/[^'"]+)['"]/g)) {
      const r = resolve(f, m[1]);
      if (r) todo.push(relative('.', r));
      else { console.error(`không tìm thấy ${m[1]} (nhập từ ${f})`); process.exit(1); }
    }
  }
  return [...seen].sort();
}
/** Các mẫu đường dẫn của một nhóm trong .github/filters.yml (YAML đơn giản: `nhóm:` rồi các dòng `- 'mẫu'`). */
function globs(group: string): string[] {
  const out: string[] = [];
  let on = false;
  for (const l of readFileSync(FILTERS, 'utf8').split('\n')) {
    if (/^\S[^:]*:\s*$/.test(l)) on = l.trim() === `${group}:`;
    else if (on) { const m = l.match(/^\s*-\s*['"]?([^'"#]+?)['"]?\s*(#.*)?$/); if (m) out.push(m[1]); }
  }
  return out;
}
const toRe = (g: string) => new RegExp('^' + g.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*\*\/?/g, '\0').replace(/\*/g, '[^/]*').replace(/\?/g, '[^/]').replace(/\0/g, '.*') + '$');

if (argv.includes('--filter')) {
  const gs = globs('endings'), res = gs.map(toRe), files = closure(SIM);
  if (!gs.length) { console.error(`${FILTERS}: không có nhóm "endings"`); process.exit(1); }
  const miss = files.filter(f => !res.some(r => r.test(f)));
  for (const f of miss) console.error(`✗ ${f}: mô phỏng kết cục dùng tệp này nhưng nhóm "endings" của ${FILTERS} không có: thêm vào, kẻo đổi nó mà CI không tính lại bảng hiếm`);
  if (miss.length) process.exit(1);
  console.log(`bộ lọc "endings" phủ ${files.length} tệp mô phỏng kết cục dùng tới`);
  process.exit(0);
}

let fresh = opt('--from');
if (!fresh) {
  fresh = join(mkdtempSync(join(tmpdir(), 'endings-')), 'rarity.json');
  const t0 = Date.now();
  // cùng node, cùng bộ nạp TypeScript (tsx) với tiến trình này
  const r = spawnSync(process.execPath, [...process.execArgv, SIM, '--strict', '--out', fresh], { stdio: ['ignore', 'ignore', 'inherit'] });
  console.log(`mô phỏng: ${((Date.now() - t0) / 60000).toFixed(1)} phút`);
  if (r.status !== 0) { console.error(`✗ ${SIM} --strict thất bại (mã ${r.status}): có kết cục ngoài 1–25%, chạy npm run endings để xem bảng`); process.exit(1); }
}
const want = JSON.parse(readFileSync(fresh, 'utf8')), have = JSON.parse(readFileSync(TABLE, 'utf8'));
const diffs: string[] = [];
const walk = (a: unknown, b: unknown, path: string) => {
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) walk((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k], path ? `${path}.${k}` : k);
  } else if (JSON.stringify(a) !== JSON.stringify(b)) diffs.push(`${path}: ghi ${JSON.stringify(b)}, tính lại ${JSON.stringify(a)}`);
};
walk(want, have, '');
if (diffs.length) {
  for (const d of diffs.slice(0, 40)) console.error('✗ ' + d);
  if (diffs.length > 40) console.error(`… và ${diffs.length - 40} chỗ khác`);
  console.error(`\n${TABLE} không khớp mô phỏng (${diffs.length} chỗ): chạy npm run endings rồi commit bảng mới (mọi kết cục phải trong 1–25%).`);
  process.exit(1);
}
console.log(`${TABLE} khớp đúng từng số với mô phỏng`);
