/* Kiểm dữ liệu cảnh trận đánh (src/data/scenes.ts): in bảng mọi mũi tên (bên, việc, quân cờ, ghi chú) để rà,
   kiểm các cặp giáp chiến (`meet`) và vòng vây, thoát mã 1 nếu có lỗi. Chạy: npm run scenes */
import { SCENES, actOf, SIDE_COLOR } from '../src/data/scenes';
import { kindOf } from '../src/units';
import { EV, ERAS } from '../src/data';
import { NEXT, HOMES } from '../src/play';
import { CARD, VARIANT } from '../src/data/cards';
import { SPECIAL } from '../src/data/cards2';
import { ENDINGS, RAR, FLAGS, CFS, LEVEL, PREV, endingOf, pathF } from '../src/data/endings';

let err = 0;
const kinds: Record<string, number> = {}, acts: Record<string, number> = {};
let contacts = 0, rings = 0;
const rows: string[] = [];
for (const [id, sc] of Object.entries(SCENES)) {
  sc.arrows.forEach((a, i) => {
    const act = actOf(a), kind = kindOf(a[3], sc.type, a[4]);
    kinds[kind] = (kinds[kind] || 0) + 1;
    acts[act] = (acts[act] || 0) + 1;
    rows.push(`${id.padEnd(5)} ${i} ${a[2].padEnd(9)} ${act.padEnd(7)} ${(act === 'doubt' ? '-' : kind).padEnd(6)} ${a[3]}${a[4]?.at ? `  ⟶ ${a[4].at}` : ''}`);
    if (a[4]?.at !== undefined && (!a[4].at || !a[3].includes(a[4].at))) { console.error(`LỖI ${id} ${i}: nhãn "${a[4].at}" không có nguyên văn trong ghi chú`); err++; }
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
// bảng "tiếp nối" của trò chơi: mỗi hướng chỉ nối sang hướng của điểm rẽ kế tiếp
ERAS.forEach((e, i) => {
  const nx = ERAS[i + 1];
  for (const o of e.opts) for (const t of NEXT[o.id] || []) if (!nx || !nx.opts.some(x => x.id === t)) { console.error(`LỖI NEXT.${o.id} → ${t}: không phải hướng của điểm rẽ ${nx ? nx.n : '(hết)'}`); err++; }
  // mỗi hướng (trừ điểm rẽ cuối) phải có ít nhất một hướng tiếp nối: thiếu khoá thì mọi lựa chọn sau đều hiện "Rẽ hướng"
  if (nx) for (const o of e.opts) if (!NEXT[o.id]?.length) { console.error(`LỖI NEXT.${o.id}: không có hướng tiếp nối ở điểm rẽ ${nx.n}`); err++; }
});
// màu hai phe đối địch trong cùng một trận phải phân biệt được: ΔE76 (Lab) ≥ 30, và ≥ 15 khi mô phỏng mù màu lục
// (deuteranopia, ma trận Machado 2009). Đồng minh được phép gần màu nhau.
const ALLIES = [['phap', 'es'], ['vndcch', 'cmlt'], ['my', 'vnch'], ['dainam', 'cd'], ['dainam', 'nghiaquan']];
const lin = (c: number) => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
const rgbOf = (hex: string) => [1, 3, 5].map(i => lin(parseInt(hex.slice(i, i + 2), 16)));
const DEU = [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.01182, 0.04294, 0.968881]];
const lab = ([r, g, b]: number[]) => {
  const f = (t: number) => (t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116);
  const X = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047, Y = 0.2126 * r + 0.7152 * g + 0.0722 * b, Z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883;
  return [116 * f(Y) - 16, 500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z))];
};
const dE = (a: number[], b: number[]) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const deu = (c: number[]) => DEU.map(row => Math.max(0, Math.min(1, row[0] * c[0] + row[1] * c[1] + row[2] * c[2])));
const seenPair = new Set<string>();
for (const [id, sc] of Object.entries(SCENES)) {
  const sides = [...new Set([...sc.arrows.map(a => a[2]), ...sc.hold.map(h => h[2])])];
  for (let i = 0; i < sides.length; i++) for (let j = i + 1; j < sides.length; j++) {
    const [a, b] = [sides[i], sides[j]];
    if (ALLIES.some(([x, y]) => (x === a && y === b) || (x === b && y === a))) continue;
    const ca = rgbOf(SIDE_COLOR[a] || '#f1e6c8'), cb = rgbOf(SIDE_COLOR[b] || '#f1e6c8');
    const n = dE(lab(ca), lab(cb)), d = dE(lab(deu(ca)), lab(deu(cb)));
    if (n < 30 || d < 15) { const k = [a, b].sort().join('/'); if (!seenPair.has(k)) { seenPair.add(k); console.error(`LỖI màu ${id}: ${a} ${SIDE_COLOR[a]} và ${b} ${SIDE_COLOR[b]} khó phân biệt (ΔE ${n.toFixed(0)}, mù màu lục ${d.toFixed(0)})`); err++; } }
  }
}
// thẻ theo vùng: cùng số lựa chọn với thẻ gốc (S.cards lưu chỉ số), vùng hợp lệ
for (const [id, vs] of Object.entries(VARIANT)) {
  if (!CARD[id]) { console.error(`LỖI VARIANT.${id}: không có thẻ gốc`); err++; continue; }
  for (const va of vs) {
    if (va.choices.length !== CARD[id][2].length) { console.error(`LỖI VARIANT.${id} ${va.regions}: ${va.choices.length} lựa chọn, thẻ gốc ${CARD[id][2].length}`); err++; }
    for (const r of va.regions || []) if (!['B', 'T1', 'T2', 'NE', 'NW'].includes(r)) { console.error(`LỖI VARIANT.${id}: vùng ${r}`); err++; }
    for (const h of va.homes || []) if (!HOMES.some(x => x[0] === h)) { console.error(`LỖI VARIANT.${id}: quê ${h}`); err++; }
    for (const a of va.after || []) {
      const [k, i] = a.split('='), sp = k.startsWith('x:') ? SPECIAL.find(c => c.id === k.slice(2)) : undefined, n = sp ? sp.choices.length : CARD[k]?.[2].length;
      if (!n || !(+i >= 0 && +i < n)) { console.error(`LỖI VARIANT.${id}: after ${a} không có lựa chọn đó`); err++; }
    }
  }
}
// kết cục (data/endings.ts) và bảng hiếm (endings-rarity.json, do `npm run endings` sinh): bảng khớp danh sách kết cục,
// mỗi quê đủ ngưỡng sáu đời tăng dần, tỷ lệ Đọc sử khớp khi đếm lại 729 con đường (bảng cũ sau khi đổi luật thì báo);
// mỗi hướng khác lịch sử có giả định "Nếu…"; mọi cờ kết cục được gắn trên ít nhất một lựa chọn.
{
  const ids = ENDINGS.map(e => e.id), readIds = ENDINGS.filter(e => !e.play).map(e => e.id);
  if (new Set(ids).size !== ids.length) { console.error('LỖI kết cục: trùng id'); err++; }
  const same = (a: string[], b: string[]) => a.length === b.length && a.every(x => b.includes(x));
  if (!same(Object.keys(RAR.play || {}), ids)) { console.error(`LỖI endings-rarity.json: "play" phải có đúng các kết cục ${ids.join(', ')} (chạy npm run endings)`); err++; }
  if (!same(Object.keys(RAR.read || {}), readIds)) { console.error(`LỖI endings-rarity.json: "read" phải có đúng các kết cục ${readIds.join(', ')} (chạy npm run endings)`); err++; }
  for (const k of ['play', 'read'] as const) {
    const tot = Object.values(RAR[k] || {}).reduce((a, b) => a + b, 0);
    if (Math.abs(tot - 100) > 1) { console.error(`LỖI endings-rarity.json: tổng "${k}" = ${tot.toFixed(1)}%`); err++; }
  }
  for (const [hid] of HOMES) {
    const t = RAR.tiers?.[hid];
    if (!t || t.length !== ERAS.length || t.some(q => q.length !== 4 || q.some((x, i) => typeof x !== 'number' || (i && x < q[i - 1])))) { console.error(`LỖI endings-rarity.json: ngưỡng quê ${hid} phải là ${ERAS.length} bộ [P5, P25, P60, P92] tăng dần`); err++; }
  }
  const paths: string[][] = [];
  const walk = (i: number, acc: string[]) => { if (i === ERAS.length) { paths.push(acc); return; } for (const o of ERAS[i].opts) walk(i + 1, [...acc, o.id]); };
  walk(0, []);
  const n: Record<string, number> = {}, m = ERAS.map(() => 0).concat(0);
  for (const p of paths) { const id = endingOf({ mode: 'read', name: 'Họ Lê', picks: p, renames: [], flags: new Set() }).id; n[id] = (n[id] || 0) + 1; m[pathF(p).m]++; }
  for (const id of readIds) { const x = Math.round((1000 * (n[id] || 0)) / paths.length) / 10; if (Math.abs(x - (RAR.read?.[id] ?? -1)) > 0.05) { console.error(`LỖI endings-rarity.json: Đọc sử "${id}" ghi ${RAR.read?.[id]}%, đếm lại ${x}% (chạy npm run endings)`); err++; } }
  if (RAR.paths !== paths.length || m.some((c, i) => Math.abs(Math.round((1000 * c) / paths.length) / 10 - (RAR.match?.[i] ?? -1)) > 0.05)) { console.error('LỖI endings-rarity.json: "paths" / "match" không khớp 729 con đường (chạy npm run endings)'); err++; }
  ERAS.forEach((e, i) => { for (const o of e.opts) {
    const cf = CFS[o.id], need = !PREV[i] || o.id !== PREV[i];
    if (need && (!cf || !(cf.level in LEVEL) || !cf.title.startsWith('Nếu') || !cf.body || !cf.basis)) { console.error(`LỖI giả định: hướng ${o.id} (điểm rẽ ${e.n}) thiếu "Nếu…" đủ tiêu đề, nội dung, mức, căn cứ`); err++; }
    if (!need && cf) { console.error(`LỖI giả định: ${o.id} là hướng chiếm ưu thế, không cần "Nếu…"`); err++; }
  } });
  const used = new Set<string>();
  for (const c of Object.values(CARD)) for (const ch of c[2]) if (ch[4]) used.add(ch[4]);
  for (const vs of Object.values(VARIANT)) for (const va of vs) for (const ch of va.choices) if (ch[4]) used.add(ch[4]);
  for (const c of SPECIAL) for (const ch of c.choices) if (ch[5]) used.add(ch[5]);
  for (const f of used) if (!(FLAGS as readonly string[]).includes(f)) { console.error(`LỖI cờ "${f}": không có trong FLAGS (endings.ts)`); err++; }
  for (const f of FLAGS) if (!used.has(f)) { console.error(`LỖI cờ "${f}": không lựa chọn nào gắn cờ này`); err++; }
  console.log(`\nkết cục: ${ids.length} (Đọc sử ${readIds.length}); bảng hiếm ${RAR.runs} lượt mô phỏng; ${Object.keys(CFS).length} giả định; ${used.size} cờ`);
}
console.log('\n' + rows.join('\n'));
console.log('\nKhép trận\n' + ends.join('\n'));
console.log('\nquân cờ', JSON.stringify(kinds), '\nviệc', JSON.stringify(acts), `\n${contacts} cặp giáp chiến, ${rings} vòng vây`);
if (err) { console.error(`${err} lỗi`); process.exit(1); }
