/* Kiểm dữ liệu cảnh trận đánh (src/data/scenes.ts): in bảng mọi mũi tên (bên, việc, quân cờ, ghi chú) để rà,
   kiểm các cặp giáp chiến (`meet`) và vòng vây, thoát mã 1 nếu có lỗi. Chạy: npm run scenes */
import { SCENES, actOf } from '../src/data/scenes';
import { kindOf } from '../src/units';

let err = 0;
const kinds: Record<string, number> = {}, acts: Record<string, number> = {};
let contacts = 0, rings = 0;
const rows: string[] = [];
for (const [id, sc] of Object.entries(SCENES)) {
  sc.arrows.forEach((a, i) => {
    const act = actOf(a), kind = kindOf(a[3], sc.type, a[4]);
    kinds[kind] = (kinds[kind] || 0) + 1;
    acts[act] = (acts[act] || 0) + 1;
    rows.push(`${id.padEnd(5)} ${i} ${a[2].padEnd(9)} ${act.padEnd(7)} ${(act === 'doubt' ? '-' : kind).padEnd(6)} ${a[3]}`);
  });
  for (const [x, y] of sc.meet || []) {
    if (!sc.arrows[x] || !sc.arrows[y]) { console.error(`LỖI ${id}: meet [${x}, ${y}] ngoài số mũi tên`); err++; continue; }
    if (sc.arrows[x][2] === sc.arrows[y][2]) { console.error(`LỖI ${id}: meet [${x}, ${y}] cùng một bên`); err++; }
    contacts++;
    console.log(`giáp chiến  ${id} ${x}×${y}: ${sc.arrows[x][3]}  ×  ${sc.arrows[y][3]}`);
  }
  // vòng vây: như scene.ts battle()
  const ringed = new Set<number>();
  for (const a of sc.arrows) {
    if (actOf(a) !== 'fight' || !/(^|\s)(vây|siết)/.test(a[3]) || /bị vây/.test(a[3])) continue;
    const t = sc.hold.map((h, j) => ({ j, d: Math.hypot(h[0] - a[1][0], h[1] - a[1][1]), side: h[2] })).filter(h => h.side !== a[2] && !ringed.has(h.j) && h.d <= 0.08).sort((p, q) => p.d - q.d)[0];
    if (t) { ringed.add(t.j); rings++; console.log(`vòng vây    ${id}: ${a[3]}`); }
  }
}
console.log('\n' + rows.join('\n'));
console.log('\nquân cờ', JSON.stringify(kinds), '\nviệc', JSON.stringify(acts), `\n${contacts} cặp giáp chiến, ${rings} vòng vây`);
if (err) { console.error(`${err} lỗi`); process.exit(1); }
