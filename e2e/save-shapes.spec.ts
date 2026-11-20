import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

/* Bộ bản lưu cũ (mỗi hình dạng từng có trong lịch sử state.ts) và bản lưu hỏng, đọc thẳng bằng readSave() trong node, không
   cần trình duyệt: bước nâng cấp 0 → 1 phải suy đúng như load() cũ, kiểm tra kiểu phải sửa từng trường, không bỏ id nào. */

type State = Record<string, unknown> & { v: number; step: string; year: number; xFrom: number; movedFrom: number; cardv: Record<string, string>; cvk: string[]; endSaid: boolean; picks: Record<string, string> };
type Loaded = { s: State; fixed: string[]; from: number; unreadable?: boolean; newer?: boolean };
type Input = [unknown, ('read' | 'play')?];
/** readSave() của ứng dụng trên một loạt bản lưu, chạy trong node qua tsx (e2e/fixtures/read-save.ts). */
function reads(inputs: Input[]): { SAVE_V: number; VARIANT: string[]; out: Loaded[] } {
  const raw = inputs.map(([o, m]) => [o === null || typeof o === 'string' ? o : JSON.stringify(o), m || 'play']);
  return JSON.parse(execFileSync(process.execPath, ['--import', 'tsx', 'e2e/fixtures/read-save.ts'], { input: JSON.stringify(raw), encoding: 'utf8' }));
}
// không mở trình duyệt nào: chạy một lần (dự án chromium)
test.skip(({ browserName }) => browserName !== 'chromium', 'node only');

const six = { e1: 'canhtan', e2: 'duytan', e3: 'cs', e4: 'vm', e5: 'nam', e6: 'doimoi' };

test('version 0 saves: each field added over time is inferred as the old loader did', () => {
  const { SAVE_V, VARIANT, out: r } = reads([
    // 0-1 before biến cố riêng: they apply only from the year the save was reopened
    [{ step: 'play', year: 1930, picks: { e1: 'chien' } }],
    [{ step: 'play', picks: {} }],
    // 2-5 before turning point 5 moved families: a save past it keeps its region up to the year it was reopened
    [{ step: 'play', year: 1966, picks: { e1: 'chien', e5: 'bac' }, xFrom: 1858 }],
    [{ step: 'play', picks: { e5: 'bac' }, xFrom: 1858 }],
    [{ step: 'play', year: 1950, picks: { e1: 'chien' }, xFrom: 1858 }],
    [{ step: 'play', year: 1966, picks: { e5: 'bac' }, shown: [] }],
    // 6-8 before cvk: a save with cardv knew the nt62 and sg75 sets; decided cards of sets added since keep the base set
    [{ step: 'play', year: 1990, picks: six, cards: { tn80: 1, nt62: 2, sg75: 0, dm86: 1 }, cardv: {}, shown: [] }],
    [{ step: 'play', year: 1990, cards: { nt62: 2 }, shown: [] }],
    [{ step: 'play', year: 1990, cards: { nt62: 2, cc53: 1 }, cardv: {}, cvk: ['nt62', 'cc53'] }],
    // 9-11 before the ending was read aloud once: a finished six-pick path has heard it, an open dossier has not
    [{ step: 'play', year: 2026, picks: six, ended: true }, 'read'],
    [{ step: 'play', year: 2026, picks: { e1: 'chien' }, ended: true }, 'read'],
    [{ step: 'play', year: 2026, picks: six, ended: true, endSaid: false }, 'read'],
    // 12-14 plain version 0 saves; 15 no save yet
    [{}], [{ step: 'play', year: 1954 }], [{ step: 'intro', mode: 'play', home: 'hue' }],
    [null, 'read'],
  ]);
  expect(SAVE_V).toBe(1);
  expect(r[0].s.xFrom).toBe(1930);
  expect(r[1].s.xFrom).toBe(1858);
  expect(r.slice(2, 6).map(x => x.s.movedFrom)).toEqual([1966, 2026, 0, 0]);
  expect(r[6].s.cardv).toEqual({ tn80: 'base', dm86: 'base' });
  expect(r[6].s.cvk).toEqual(VARIANT);
  expect(r[7].s.cardv).toEqual({ nt62: 'base' });
  expect(r[8].s.cardv).toEqual({});
  expect(r.slice(9, 12).map(x => x.s.endSaid)).toEqual([true, false, false]);
  for (const x of r.slice(0, 15)) {
    expect(x.s.v).toBe(1); // numbered after loading
    expect(x.fixed).toEqual([]); // nothing reported as repaired
    expect(x.from).toBe(0);
  }
  // no save yet: a fresh game, as before versions
  expect(r[15].s).toMatchObject({ v: 1, step: 'splash', year: 1858, xFrom: 1858, picks: {} });
});

test('the real 6f464aa saves read back unchanged, apart from the version; numbered saves are not migrated again', () => {
  const real = JSON.parse(readFileSync('e2e/fixtures/save-6f464aa.json', 'utf8')) as Record<string, Record<string, string>>;
  const raws = [real.play['dudo-v2-play'], real.read['dudo-v2']];
  const { out: r } = reads([[raws[0], 'play'], [raws[1], 'read'], [{ v: 1, step: 'play', year: 1966, picks: { e5: 'bac' }, cards: { tn80: 1 } }]]);
  raws.forEach((raw, i) => {
    expect(r[i].fixed).toEqual([]);
    const { v, ...rest } = r[i].s;
    expect(v).toBe(1);
    expect(JSON.stringify(rest)).toBe(raw); // same keys, same order, same values
  });
  // a numbered save without `shown` or `cvk` is not taken for a save from before those fields: no family moved back to
  // its old region, no decided card read under an older option set
  expect(r[2].s).toMatchObject({ movedFrom: 0, xFrom: 1966, cardv: {} });
  expect(r[2].fixed).toEqual([]);
});

test('damaged fields are repaired one by one; unknown ids and keys stay', () => {
  const base = { v: 1, step: 'play', name: 'Họ Lê', year: 1954, picks: { e1: 'chien', e2: 'gone-option' }, cards: { dn58: 1, nope99: 2 } };
  const cases: [object, string[], Record<string, unknown>][] = [
    [{ ...base, picks: null }, ['picks'], { picks: {}, cards: { dn58: 1, nope99: 2 } }],
    [{ ...base, picks: ['x'] }, ['picks'], { picks: {} }],
    [{ ...base, picks: { e1: 'chien', e2: 5 } }, ['picks'], { picks: { e1: 'chien' } }],
    [{ ...base, seen: null, shown: 'x', badges: ['a', 1] }, ['seen', 'shown', 'badges'], { seen: [], shown: [], badges: ['a'] }],
    [{ ...base, cards: 'x' }, ['cards'], { cards: {} }],
    [{ ...base, cards: { dn58: '1', nt62: 'a', gt74: 2.5 } }, ['cards'], { cards: { dn58: 1 } }],
    [{ ...base, year: '1954' }, ['year'], { year: 1954 }],
    [{ ...base, year: 3000 }, ['year'], { year: 2026 }],
    [{ ...base, year: null }, ['year'], { year: 1858 }],
    [{ ...base, quiz: { e1: 'x', e2: [true, 'y'], e3: [false, true] } }, ['quiz'], { quiz: { e2: [true, false], e3: [false, true] } }],
    [{ ...base, res: null, rel: 5 }, ['res', 'rel'], { res: { g: 50, d: 40, b: 30, u: 20 }, rel: { tr: 50, ph: 35, nh: 35, vm: 40, qg: 40, my: 35, nn: 45, lg: 50 } }],
    [{ ...base, res: { g: '41', d: null, b: 30 } }, ['res'], { res: { g: 41, d: 40, b: 30, u: 20 } }],
    [{ ...base, snap: { e1: { g: 1, d: 2, b: 3, u: 4 }, e2: 'x' } }, ['snap'], { snap: { e1: { g: 1, d: 2, b: 3, u: 4 } } }],
    [{ ...base, names: [null, { from: 'Họ Nguyễn', to: 'Họ Lê', y: '1946', why: 'đổi họ' }] }, ['names'], { names: [{ from: 'Họ Nguyễn', to: 'Họ Lê', y: 1946, why: 'đổi họ' }] }],
    [{ ...base, tourAt: 5 }, ['tourAt'], { tourAt: null }],
    [{ ...base, tourAt: { e: 'e9', id: 'gone' } }, [], { tourAt: { e: 'e9', id: 'gone' } }],
    [{ ...base, theme: 'neon', sound: 'yes', rate: 0 }, ['sound', 'theme', 'rate'], { theme: 'archive', sound: true, rate: 0.95 }],
    [{ ...base, step: 'zzz' }, ['step'], { step: 'play' }],
    [{ v: 1, step: 7 }, ['step'], { step: 'splash' }],
    [{ ...base, xs: { dn58: 3, nt62: 'x-a' } }, ['xs'], { xs: { nt62: 'x-a' } }],
    [{ ...base, cvk: 'x', cards: { tn80: 1 } }, ['cvk'], { cardv: {} }],
    [{ ...base, v: 'x' }, ['v'], { v: 1 }],
    [{ ...base, home: 'atlantis', filt: 'Không còn', extra: { a: 1 } }, [], { home: 'atlantis', filt: 'Không còn', extra: { a: 1 }, picks: base.picks }],
  ];
  const { out } = reads(cases.map(([raw]): Input => [raw, 'read']));
  cases.forEach(([raw, fixed, want], i) => {
    expect(out[i].unreadable, JSON.stringify(raw)).toBeFalsy();
    expect(out[i].fixed, JSON.stringify(raw)).toEqual(fixed);
    expect(out[i].s, JSON.stringify(raw)).toMatchObject(want);
  });
});

test('a save from a newer app version is read without migrations and keeps its version; an unreadable one is reported', () => {
  const bad = ['{"step":"play","ye', 'null', '[1,2]', '"x"', '42', 'undefined'];
  const { out } = reads([[{ v: 7, step: 'play', year: 1980, picks: { e1: 'chien' }, later: [1] }], ...bad.map((t): Input => [t, 'read'])]);
  expect(out[0]).toMatchObject({ newer: true, from: 7, s: { v: 7, year: 1980, picks: { e1: 'chien' }, later: [1], xFrom: 1980 } });
  out.slice(1).forEach((r, i) => {
    expect(r.unreadable, bad[i]).toBe(true);
    expect(r.s.step).toBe('splash');
  });
});
