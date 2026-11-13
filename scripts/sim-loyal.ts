/* Mô phỏng dòng họ trung thành (npm run scenes chạy kèm): với mỗi quê, mỗi con đường "tiếp nối" qua sáu điểm rẽ và
   mỗi họ có biến cố riêng (cùng "không chọn họ"), ở mỗi sự kiện dòng họ buộc phải quyết (thẻ bắt buộc, hay thẻ có biến
   cố riêng: thẻ trước, rồi biến cố) chọn lựa chọn hợp đường nhất mà còn đủ sức, mùa màng ở mỗi điểm rẽ. Báo lỗi khi
   một lựa chọn "Hợp đường bạn theo" không đủ sức trong khi lựa chọn khác vẫn đủ: trung thành bị phạt tới mức khoá. */
const store: Record<string, string> = {};
(globalThis as unknown as { localStorage: unknown }).localStorage = { getItem: (k: string) => store[k] ?? null, setItem: (k: string, v: string) => { store[k] = v; }, removeItem: (k: string) => { delete store[k]; } };
store['dudo-mode'] = 'play';

const { ERAS, EV } = await import('../src/data');
const st = await import('../src/state');
const P = await import('../src/play');
const { SPECIAL } = await import('../src/data/cards2');
const { SURNAMES, loreOf } = await import('../src/data/surnames');
type Fx = Parameters<typeof P.canAfford>[0];

const paths: string[][] = [];
const walk = (i: number, acc: string[]) => {
  if (i === ERAS.length) { paths.push(acc); return; }
  const opts = i === 0 ? ERAS[0].opts.map(o => o.id) : P.NEXT[acc[i - 1]] || [];
  for (const o of opts) walk(i + 1, [...acc, o]);
};
walk(0, []);

let bad = 0, runs = 0, minG = 100, lowAt = '';
// lúa gạo ≤ 5 (bạc còn thì vẫn đong được gạo, payFx) và nghèo kiệt (lúa gạo cộng bạc ≤ 5: không còn gì để đổi)
const starve = new Set<string>(), broke = new Set<string>();
const fails: string[] = [];
// họ có biến cố riêng theo họ (cùng '' = không chọn họ nào trong danh sách)
const surnames = ['', ...new Set(SPECIAL.flatMap(c => c.when.surnames || []))];
/** Chọn như dòng họ trung thành: hợp đường nhất mà đủ sức (rẻ hơn nếu ngang nhau); ghi lại lần lựa chọn hợp đường bị khoá.
    `rename[i]`: lựa chọn đổi họ (thẻ hiện nhãn "Đổi họ", không tính là hợp / trái đường). */
function choose(tag: string, chs: { fx: Fx; label: string; rename?: boolean; key?: string }[], y: number): number {
  const als = chs.map(ch => (ch.rename ? 0 : P.alignment(ch.fx, y, ch.key)));
  // như card.ts: không lựa chọn nào đủ sức thì lựa chọn rẻ nhất mở; chỉ còn lựa chọn trái đường thì lựa chọn không trái
  // đường rẻ nhất mở (play.ts locks)
  const no = P.locks(chs.map(ch => ch.fx), als);
  const opts = chs.map((ch, i) => ({ i, al: als[i], no: no[i], cost: P.cost(ch.fx) }));
  const ok = opts.filter(o => !o.no);
  // bị khoá thật: có lựa chọn hợp đường nhưng không cái nào đủ sức, trong khi lựa chọn khác vẫn đủ
  const loyal = opts.filter(o => o.al > 0), locked = loyal.length && loyal.every(o => o.no) ? loyal[0] : null;
  if (locked && ok.length) { bad++; fails.push(`${tag}: "${chs[locked.i].label}" ${locked.no}`); }
  return (ok.length ? ok : opts).sort((a, b) => b.al - a.al || a.cost - b.cost)[0].i;
}
for (const sk of surnames) for (const [hid] of P.HOMES) for (const path of paths) {
  st.resetState();
  const S = st.S;
  S.mode = 'play'; S.home = hid; S.step = 'play';
  S.surname = sk; S.name = sk ? 'Họ ' + loreOf(sk)!.names[0] : 'Họ Lê';
  runs++;
  const who = `${sk || '-'} ${hid} ${path.join('>')}`;
  ERAS.forEach((e, ei) => {
    const prev = ERAS[ei - 1];
    if (prev) P.harvest(prev, e.cy);
    S.picks[e.id] = path[ei];
    P.applyFx(P.eraFx(path[ei]));
    const evs = EV.filter(v => !v.diary && st.evEra(v) === e).sort((a, b) => a.y - b.y);
    for (const v of evs) {
      const c = P.cardOf(v);
      if (!c || !(P.mustDecide(v) || P.specialFor(v))) continue; // như pendingCard: bắt buộc, hay có biến cố riêng
      const y = st.chYear(v);
      P.decide(v, choose(`${who} ${v.id} (${v.y})`, c[2].map((ch, i) => ({ fx: ch[2], label: ch[0], key: P.alKey(v, i) })), y));
      const sp = P.specialFor(v);
      if (sp && !P.specialDecided(sp)) {
        const i = choose(`${who} ${sp.id} (${v.y})`, sp.choices.map(ch => ({ fx: ch[2], label: ch[0], rename: !!ch[4] })), y);
        const mom = SURNAMES.find(x => x.key !== (S.surname || ''))?.names[0]; // chip mặc định "Lấy họ mẹ"
        P.decideSpecial(sp, i, v.y, sp.choices[i][4] === 'mother' ? mom : sp.choices[i][4]);
      }
      if (S.res.g < minG) { minG = S.res.g; lowAt = `${who} ${v.id} (${v.y})`; }
      if (S.res.g <= 5) starve.add(who);
      if (S.res.g + S.res.b <= 5) broke.add(who);
    }
  });
  P.harvest(ERAS[ERAS.length - 1], 2026);
}
console.log(`mô phỏng trung thành: ${runs} lượt (${surnames.length} họ × ${P.HOMES.length} quê × ${paths.length} con đường), ${bad} lần lựa chọn hợp đường bị khoá; lúa gạo thấp nhất ${minG} (${lowAt}); ${starve.size} lượt có lúc lúa gạo ≤ 5, ${broke.size} lượt có lúc cả lúa gạo lẫn bạc cộng lại ≤ 5`);
for (const x of [...broke].slice(0, 12)) console.log('  kiệt: ' + x);
for (const f of fails.slice(0, 30)) console.log('  ' + f);
if (process.argv.includes('--strict') && bad) process.exit(1);
