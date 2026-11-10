/* Mô phỏng phân bố kết cục dòng họ (src/data/endings.ts) bằng chính các module của trò chơi, rồi ghi bảng hiếm
   src/data/endings-rarity.json mà màn kết đọc. Chạy: npm run endings (đầy đủ, vài phút) · thêm --quick để thử nhanh.
   - Đọc sử: kết cục chỉ phụ thuộc sáu hướng, nên đếm đủ 3^6 = 729 con đường (cổng điểm rẽ không khoá hướng nào).
   - Trò chơi: 729 con đường × 8 quê × 8 nhóm họ × 5 cách quyết thẻ. Nhóm họ '' đại diện cho các họ không có biến cố
     riêng và "Họ khác" (trọng số 20); mỗi họ có biến cố riêng trọng số 1. Cách quyết: trung thành (như sim-loyal), giữ
     của, giữ người, trọng danh, ngẫu nhiên có hạt giống. Ở mỗi sự kiện dòng họ phải quyết (thẻ bắt buộc, hay thẻ có biến
     cố riêng), mùa màng ở mỗi điểm rẽ, như trong trò chơi.
   - Ngưỡng gia sản theo quê sau từng đời: P5 / P25 / P60 / P92 tổng gia sản (có trọng số), cho hạng gia sản (rank) và
     hai kết cục Vọng tộc / Còn lại tên họ.
   --strict: thoát lỗi nếu kết cục nào dưới 1% hay trên 25% (ở luồng có kết cục ấy). --out <file>: ghi bảng.
   --samples: in một lời kết mẫu cho mỗi kết cục. */
const store: Record<string, string> = {};
(globalThis as unknown as { localStorage: unknown }).localStorage = { getItem: (k: string) => store[k] ?? null, setItem: (k: string, v: string) => { store[k] = v; }, removeItem: (k: string) => { delete store[k]; } };
store['dudo-mode'] = 'play';

import { writeFileSync } from 'node:fs';
const { ERAS, EV } = await import('../src/data');
const st = await import('../src/state');
const P = await import('../src/play');
const { SPECIAL } = await import('../src/data/cards2');
const { SURNAMES, loreOf } = await import('../src/data/surnames');
const E = await import('../src/data/endings');
type Facts = import('../src/data/endings').Facts;
type Fx = Parameters<typeof P.canAfford>[0];

const argv = process.argv.slice(2), quick = argv.includes('--quick'), strict = argv.includes('--strict');
const outAt = argv.indexOf('--out'), outFile = outAt >= 0 ? argv[outAt + 1] : '';
const POL = quick ? ['trung', 'ngau'] : ['trung', 'giau', 'nguoi', 'danh', 'ngau'];
const surnames = quick ? [''] : ['', ...new Set(SPECIAL.flatMap(c => c.when.surnames || []))];
const weight = (sk: string) => (sk ? 1 : 20);

const paths: string[][] = [];
const walk = (i: number, acc: string[]) => { if (i === ERAS.length) { paths.push(acc); return; } for (const o of ERAS[i].opts) walk(i + 1, [...acc, o.id]); };
walk(0, []);

let seed = 1;
const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
type Opt = { i: number; al: number; no: string | null; cost: number; fx: Fx };
/** Chọn một lựa chọn theo cách quyết `pol`, chỉ trong các lựa chọn đủ sức (như card.ts: không lựa chọn nào đủ thì lựa chọn rẻ nhất). */
function choose(pol: string, chs: { fx: Fx; rename?: boolean }[], y: number): number {
  const opts: Opt[] = chs.map((ch, i) => ({ i, al: ch.rename ? 0 : P.alignment(ch.fx, y), no: P.canAfford(ch.fx), cost: P.cost(ch.fx), fx: ch.fx }));
  if (opts.every(o => o.no)) opts.reduce((b, o) => (o.cost < b.cost ? o : b)).no = null;
  const f = (o: Opt, k: keyof Fx) => o.fx[k] || 0;
  const score: Record<string, (o: Opt) => number> = {
    trung: o => o.al * 1000 - o.cost,
    giau: o => f(o, 'g') + f(o, 'd') * 2 + f(o, 'b') + f(o, 'u') * 0.5 + o.al,
    nguoi: o => f(o, 'd') * 6 + f(o, 'g') * 0.5 - o.cost * 0.3 + o.al * 0.1,
    danh: o => f(o, 'u') * 2 + f(o, 'lg') + o.al * 0.5,
    ngau: () => rnd(),
  };
  return opts.filter(o => !o.no).sort((a, b) => score[pol](b) - score[pol](a) || a.i - b.i)[0].i;
}

type Run = { f: Facts; pol: string; w: number };
const runs: Run[] = [];
const t0 = Date.now();
for (const [pi, pol] of POL.entries()) {
  seed = 7 + pi;
  for (const sk of surnames) for (const [hid] of P.HOMES) for (const path of paths) {
    st.resetState();
    const S = st.S;
    S.mode = 'play'; S.home = hid; S.step = 'play';
    S.surname = sk; S.name = sk ? 'Họ ' + loreOf(sk)!.names[0] : 'Họ Lê';
    ERAS.forEach((e, ei) => {
      const prev = ERAS[ei - 1];
      if (prev) P.harvest(prev, e.cy);
      S.picks[e.id] = path[ei];
      P.applyFx(P.eraFx(path[ei]));
      for (const v of EV.filter(v => !v.diary && st.evEra(v) === e).sort((a, b) => a.y - b.y)) {
        const c = P.cardOf(v);
        if (!c || !(P.mustDecide(v) || P.specialFor(v))) continue; // như pendingCard: bắt buộc, hay có biến cố riêng
        const y = st.chYear(v);
        P.decide(v, choose(pol, c[2].map(ch => ({ fx: ch[2] })), y));
        const sp = P.specialFor(v);
        if (sp && !P.specialDecided(sp)) {
          const j = choose(pol, sp.choices.map(ch => ({ fx: ch[2], rename: !!ch[4] })), y);
          const mom = SURNAMES.find(x => x.key !== (S.surname || ''))?.names[0]; // chip mặc định "Lấy họ mẹ"
          P.decideSpecial(sp, j, v.y, sp.choices[j][4] === 'mother' ? mom : sp.choices[j][4]);
        }
      }
    });
    P.harvest(ERAS[ERAS.length - 1], 2026);
    runs.push({ pol, w: weight(sk), f: P.factsFromState() });
  }
  console.error(`  ${pol}: ${runs.length} lượt, ${((Date.now() - t0) / 1000).toFixed(0)}s`);
}

/* ngưỡng theo quê sau từng đời: P5 / P25 / P60 / P92 tổng gia sản (có trọng số) */
const Q = [0.05, 0.25, 0.6, 0.92];
function quants(xs: [number, number][]): number[] {
  xs.sort((a, b) => a[0] - b[0]);
  const W = xs.reduce((a, x) => a + x[1], 0);
  return Q.map(q => { let acc = 0; for (const [v, w] of xs) { acc += w; if (acc >= q * W) return v; } return xs[xs.length - 1][0]; });
}
const tiers: Record<string, number[][]> = {};
for (const [hid] of P.HOMES) {
  const mine = runs.filter(r => r.f.home!.id === hid);
  tiers[hid] = ERAS.map((_, g) => quants(mine.map(r => [E.sum(r.f.snap![g]), r.w] as [number, number])));
}

const ids = E.ENDINGS.map(e => e.id);
const zero = () => Object.fromEntries(ids.map(i => [i, 0])) as Record<string, number>;
const play = zero(), byPol: Record<string, Record<string, number>> = {}, byHome: Record<string, Record<string, number>> = {};
const polW: Record<string, number> = {}, homeW: Record<string, number> = {};
let W = 0;
const cands: Record<string, Run[]> = {};
for (const r of runs) {
  const t = tiers[r.f.home!.id][5];
  r.f.th = { lo: t[0], hi: t[3] };
  const id = E.endingOf(r.f).id;
  play[id] += r.w; W += r.w;
  (byPol[r.pol] ||= zero())[id] += r.w; polW[r.pol] = (polW[r.pol] || 0) + r.w;
  (byHome[r.f.home!.id] ||= zero())[id] += r.w; homeW[r.f.home!.id] = (homeW[r.f.home!.id] || 0) + r.w;
  (cands[id] ||= []).push(r);
}
const readOf = (p: string[]): Facts => ({ mode: 'read', name: 'Họ Lê', picks: p, renames: [], flags: new Set() });
const read = zero();
for (const p of paths) read[E.endingOf(readOf(p)).id] += 1;

const pc = (n: number, d: number) => (100 * n) / d;
const f1 = (x: number) => x.toFixed(1).padStart(5);
console.log(`\n${runs.length} lượt Trò chơi (trọng số ${W}); ${paths.length} con đường Đọc sử. Ngưỡng cuối theo quê P5/P25/P60/P92: ${Object.entries(tiers).map(([h, t]) => `${h} ${t[5].join('/')}`).join(', ')}`);
console.log(`${'kết cục'.padEnd(10)} ${'Đọc'.padStart(5)} ${'Chơi'.padStart(5)} | ${POL.map(p => p.padStart(5)).join(' ')} | quê min–max`);
let bad = 0;
for (const e of E.ENDINGS) {
  const r = pc(read[e.id], paths.length), p = pc(play[e.id], W), hs = Object.keys(byHome).map(h => pc(byHome[h][e.id], homeW[h]));
  const out = (x: number, used: boolean) => used && (x < 1 || x > 25);
  if (out(r, !e.play) || out(p, true)) bad++;
  console.log(`${e.id.padEnd(10)} ${e.play ? '    –' : f1(r)} ${f1(p)} | ${POL.map(k => f1(pc(byPol[k][e.id], polW[k]))).join(' ')} | ${Math.min(...hs).toFixed(1)}–${Math.max(...hs).toFixed(1)}  ${e.title}`);
}
// độ trùng hướng chiếm ưu thế (m/5) và điểm rẽ đầu tiên rời lịch sử, trên 729 con đường
const mDist = [0, 0, 0, 0, 0, 0], first: Record<string, number> = {};
for (const p of paths) { mDist[E.pathF(p).m]++; const d = E.firstDivergence(p); const k = d ? `${ERAS[d.i].id}:${d.cf.level}${d.free ? '*' : ''}` : '-'; first[k] = (first[k] || 0) + 1; }
console.log('\nTrùng hướng chiếm ưu thế:', mDist.map((n, m) => `${m}/5 ${pc(n, paths.length).toFixed(1)}%`).join(' · '));
console.log('Điểm rẽ đầu tiên rời lịch sử (mức ước lượng; * = trùng cả năm, lấy điểm rẽ 2):', Object.entries(first).sort().map(([k, n]) => `${k} ${pc(n, paths.length).toFixed(1)}%`).join(' · '));
if (argv.includes('--samples')) {
  for (const id of ids) {
    const cs = cands[id];
    if (!cs) continue;
    const r = cs[(ids.indexOf(id) * 7919 + 104729) % cs.length]; // mẫu cố định nhưng trải đều quê, họ, cách quyết
    console.log(`\n[${id}] ${r.f.name} · ${r.f.home!.name} · ${r.f.picks.join('>')} · ${r.pol} · cờ ${[...r.f.flags].join(',')}\n${E.epilogue(id, r.f)}`);
  }
  for (const p of [['hoa', 'duytan', 'cs', 'vm', 'bac', 'doimoi'], ['chien', 'duytan', 'cs', 'qg', 'thuba', 'doimoi'], ['canhtan', 'duytan', 'qdd', 'qg', 'nam', 'doimoi'], ['hoa', 'canvuong', 'cs', 'vm', 'bac', 'radi']]) {
    const f = readOf(p), id = E.endingOf(f).id;
    console.log(`\n[Đọc sử · ${id}] ${p.join('>')}\n${E.epilogue(id, f)}`);
  }
}
const r1 = (x: number) => Math.round(x * 10) / 10;
if (outFile) {
  writeFileSync(outFile, JSON.stringify({
    note: 'Sinh bởi scripts/sim-endings.ts (npm run endings); % theo trọng số mô phỏng, không phải thống kê người chơi thật.',
    runs: runs.length, paths: paths.length,
    read: Object.fromEntries(E.ENDINGS.filter(e => !e.play).map(e => [e.id, r1(pc(read[e.id], paths.length))])),
    play: Object.fromEntries(ids.map(i => [i, r1(pc(play[i], W))])),
    tiers, match: mDist.map(n => r1(pc(n, paths.length))),
  }, null, 1) + '\n');
  console.log(`\nđã ghi ${outFile}`);
}
console.log(bad ? `\n${bad} kết cục nằm ngoài 1–25%` : '\nMọi kết cục trong khoảng 1–25%');
if (strict && bad) process.exit(1);
