/* Mô phỏng dòng họ trung thành (npm run scenes chạy kèm): với mỗi quê và mỗi con đường "tiếp nối" qua sáu điểm rẽ,
   ở mỗi thẻ bắt buộc chọn lựa chọn hợp đường nhất mà còn đủ sức, mùa màng ở mỗi điểm rẽ. Báo lỗi khi một lựa chọn
   "Hợp đường bạn theo" của thẻ bắt buộc không đủ sức trong khi lựa chọn khác vẫn đủ: trung thành bị phạt tới mức khoá. */
const store: Record<string, string> = {};
(globalThis as unknown as { localStorage: unknown }).localStorage = { getItem: (k: string) => store[k] ?? null, setItem: (k: string, v: string) => { store[k] = v; }, removeItem: (k: string) => { delete store[k]; } };
store['dudo-mode'] = 'play';

const { ERAS, EV } = await import('../src/data');
const st = await import('../src/state');
const P = await import('../src/play');

const paths: string[][] = [];
const walk = (i: number, acc: string[]) => {
  if (i === ERAS.length) { paths.push(acc); return; }
  const opts = i === 0 ? ERAS[0].opts.map(o => o.id) : P.NEXT[acc[i - 1]] || [];
  for (const o of opts) walk(i + 1, [...acc, o]);
};
walk(0, []);

let bad = 0, runs = 0, minG = 100, lowAt = '';
const starve = new Set<string>();
const fails: string[] = [];
for (const [hid] of P.HOMES) for (const path of paths) {
  st.resetState();
  const S = st.S;
  S.mode = 'play'; S.home = hid; S.step = 'play';
  runs++;
  ERAS.forEach((e, ei) => {
    const prev = ERAS[ei - 1];
    if (prev) P.harvest(prev, e.cy);
    S.picks[e.id] = path[ei];
    P.applyFx(P.eraFx(path[ei]));
    const evs = EV.filter(v => !v.diary && st.evEra(v) === e).sort((a, b) => a.y - b.y);
    for (const v of evs) {
      const c = P.cardOf(v);
      if (!c || !P.mustDecide(v)) continue;
      const opts = c[2].map((ch, i) => ({ i, al: P.alignment(ch[2], st.chYear(v)), no: P.canAfford(ch[2]), cost: P.cost(ch[2]) }));
      const ok = opts.filter(o => !o.no);
      // bị khoá thật: thẻ có lựa chọn hợp đường nhưng không cái nào đủ sức, trong khi lựa chọn khác vẫn đủ
      const loyal = opts.filter(o => o.al > 0), lockedLoyal = loyal.length && loyal.every(o => o.no) ? loyal[0] : null;
      if (lockedLoyal && ok.length) { bad++; fails.push(`${hid} ${path.join('>')} ${v.id} (${v.y}): "${c[2][lockedLoyal.i][0]}" ${lockedLoyal.no}`); }
      const pick = (ok.length ? ok : opts).sort((a, b) => b.al - a.al || a.cost - b.cost)[0];
      P.decide(v, pick.i);
      if (S.res.g < minG) { minG = S.res.g; lowAt = `${hid} ${path.join('>')} ${v.id} (${v.y})`; }
      if (S.res.g <= 5) starve.add(`${hid} ${path.join('>')}`);
    }
  });
  P.harvest(ERAS[ERAS.length - 1], 2026);
}
console.log(`mô phỏng trung thành: ${runs} lượt (${P.HOMES.length} quê × ${paths.length} con đường), ${bad} lần lựa chọn hợp đường bị khoá; lúa gạo thấp nhất ${minG} (${lowAt}); ${starve.size} lượt có lúc lúa gạo ≤ 5`);
for (const x of [...starve].slice(0, 12)) console.log('  đói: ' + x);
for (const f of fails.slice(0, 30)) console.log('  ' + f);
if (process.argv.includes('--strict') && bad) process.exit(1);
