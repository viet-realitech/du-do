/* Đi trọn một con đường bằng chính mã của trò chơi (play.ts decide, specialsFor, decideSpecial) trong node, cho
   e2e/callbacks.spec.ts: thẻ nào cũng chọn lựa chọn đầu, trừ những thẻ (và biến cố 'x:id') ép theo nhãn. Vào (stdin): JSON
   [{ sk: khoá họ hay họ gõ tay, home, path: [6 hướng], want: { id: phần nhãn }, moms: { 'x:id': 'Họ X' } }, …]. Ra (stdout): JSON
   [{ xs, name, names, cards, doiho }, …] (xs: biến cố đã chốt trên mỗi sự kiện, như S.xs; doiho: lời kết "đổi họ" khi dòng
   họ đã đổi họ). */
import { readFileSync } from 'node:fs';

const store: Record<string, string> = {};
(globalThis as unknown as { localStorage: unknown }).localStorage = { getItem: (k: string) => store[k] ?? null, setItem: (k: string, v: string) => { store[k] = v; }, removeItem: (k: string) => { delete store[k]; }, key: () => null, length: 0 };
store['dudo-mode'] = 'play';

type Ch = [string, ...unknown[]];
type Ev = { id: string; y: number; diary?: boolean };
type Sp = { id: string; choices: Ch[] };
// chuỗi đường dẫn không phải hằng: tsc của e2e (tsconfig.node.json) không kéo mã ứng dụng vào
const app = '../../src/';
const { ERAS, EV } = await import(app + 'data/index') as { ERAS: { id: string; cy: number }[]; EV: Ev[] };
const st = await import(app + 'state') as any;
const P = await import(app + 'play') as any;
const { loreOf } = await import(app + 'data/surnames') as any;
const { epilogue } = await import(app + 'data/endings') as any;

type Case = { sk: string; home: string; path: string[]; want?: Record<string, string>; moms?: Record<string, string> };
const cases = JSON.parse(readFileSync(0, 'utf8')) as Case[];
const pick = (chs: Ch[], want: string | undefined, id: string) => {
  if (!want) return 0;
  const i = chs.findIndex(ch => ch[0].includes(want));
  if (i < 0) throw new Error(`${id}: không có lựa chọn "${want}": ${chs.map(ch => ch[0]).join(' | ')}`);
  return i;
};
const out = cases.map(({ sk, home, path, want = {}, moms = {} }) => {
  st.resetState();
  const S = st.S;
  S.mode = 'play'; S.home = home; S.step = 'play';
  S.surname = loreOf(sk) ? sk : ''; S.name = 'Họ ' + (loreOf(sk)?.names[0] || sk[0].toUpperCase() + sk.slice(1));
  ERAS.forEach((e, ei) => {
    if (ei) P.harvest(ERAS[ei - 1], e.cy);
    S.picks[e.id] = path[ei];
    P.applyFx(P.eraFx(path[ei]));
    for (const v of EV.filter(v => !v.diary && st.evEra(v) === e).sort((a, b) => a.y - b.y)) {
      const c = P.cardOf(v);
      if (!c || !(P.mustDecide(v) || P.specialFor(v))) continue;
      P.decide(v, pick(c[2], want[v.id], v.id));
      for (let sp: Sp = P.specialFor(v); sp && !P.specialDecided(sp); sp = P.specialFor(v)) {
        const j = pick(sp.choices, want['x:' + sp.id], 'x:' + sp.id), to = sp.choices[j][4];
        P.decideSpecial(sp, j, v.y, to === 'mother' ? moms['x:' + sp.id] || 'Họ Nguyễn' : to);
      }
    }
  });
  return { xs: S.xs, name: S.name, names: S.names, cards: S.cards, doiho: S.names.length ? epilogue('doiho', P.factsFromState()) : '' };
});
process.stdout.write(JSON.stringify(out));
