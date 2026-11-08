/* Kiểm dữ liệu cảnh trận đánh (src/data/scenes.ts): in bảng mọi mũi tên (bên, việc, quân cờ, ghi chú) để rà,
   kiểm các cặp giáp chiến (`meet`) và vòng vây, thoát mã 1 nếu có lỗi. Chạy: npm run scenes */
import { SCENES, actOf } from '../src/data/scenes';
import { kindOf } from '../src/units';
import { EV } from '../src/data';

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
    const t = sc.hold.map((h, j) => ({ j, d: Math.hypot(h[0] - a[1][0], h[1] - a[1][1]), side: h[2] })).filter(h => h.side !== a[2] && h.d <= 0.08).sort((p, q) => p.d - q.d)[0];
    if (t && !ringed.has(t.j)) { ringed.add(t.j); rings++; console.log(`vòng vây    ${id}: hold ${t.j} (${sc.hold[t.j][2]}) ← ${a[3]}`); }
  }
}
// khép trận: chỉ số trong hold, không vừa thất thủ vừa bị bỏ; câu kết phải trích nguyên văn s / x của sự kiện
const sent = (t: string) => (t.match(/.+?(?:[.!?…](?=\s|$)|$)/g) || []).map(x => x.trim()).filter(Boolean);
const ends: string[] = [];
for (const [id, sc] of Object.entries(SCENES)) {
  const v = EV.find(x => x.id === id), e = sc.end || {};
  if (!v) { console.error(`LỖI ${id}: không có sự kiện`); err++; continue; }
  for (const j of [...(e.fell || []), ...(e.left || [])]) if (!sc.hold[j]) { console.error(`LỖI ${id}: end chỉ số ${j} ngoài hold`); err++; }
  for (const j of e.fell || []) if (e.left?.includes(j)) { console.error(`LỖI ${id}: vị trí ${j} vừa fell vừa left`); err++; }
  for (const l of e.line || []) if (!v.s.includes(l) && !(v.x || '').includes(l)) { console.error(`LỖI ${id}: câu kết không có nguyên văn trong s / x: ${l}`); err++; }
  const line = e.line ? e.line.join(' ') : sent(v.x || v.s)[0];
  ends.push(`${id.padEnd(5)} | ${sc.hold.map(h => h[2]).join(',').padEnd(22)} | fell ${JSON.stringify(e.fell || [])} left ${JSON.stringify(e.left || [])} | ${line}`);
}
console.log('\n' + rows.join('\n'));
console.log('\nKhép trận\n' + ends.join('\n'));
console.log('\nquân cờ', JSON.stringify(kinds), '\nviệc', JSON.stringify(acts), `\n${contacts} cặp giáp chiến, ${rings} vòng vây`);
if (err) { console.error(`${err} lỗi`); process.exit(1); }
