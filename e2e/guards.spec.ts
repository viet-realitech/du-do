import { test, expect } from '@playwright/test';
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

/* Các kiểm tra của CI (README, "Checks") bắt đúng điều chúng canh: chạy từng script với một bản chụp bị sửa (khoá lựa chọn,
   bảng hiếm, bộ lọc đường dẫn, mốc cỡ gói) và với bản thật. Chỉ chạy Node, không mở trình duyệt; một lần (dự án chromium). */

const run = (script: string, ...args: string[]) => {
  const r = spawnSync('npx', ['tsx', script, ...args], { encoding: 'utf8' });
  return { code: r.status, out: (r.stdout || '') + (r.stderr || '') };
};

test.beforeEach(({}, info) => { test.skip(info.project.name !== 'chromium', 'Node-only checks: once is enough'); });

test('guards: the choice lock catches reordered options and a variant set inserted ahead of the others', ({}, info) => {
  expect(run('scripts/lock-choices.ts').code).toBe(0);
  const lock = JSON.parse(readFileSync('scripts/lock-choices.json', 'utf8')) as { cards: Record<string, string[]> };
  const cards: Record<string, string[]> = {};
  for (const [k, v] of Object.entries(lock.cards)) {
    if (k === 'dn58') { cards[k] = [v[1], v[0], ...v.slice(2)]; continue; } // khoá cũ: hai lựa chọn đầu theo thứ tự khác
    const m = k.match(/^tn80 @(\d+) (.*)$/); // khoá cũ: chưa có bộ đứng đầu (hôm nay bộ ấy như vừa chèn lên trước)
    if (m) { if (+m[1] > 0) cards[`tn80 @${+m[1] - 1} ${m[2]}`] = v; continue; }
    cards[k] = v;
  }
  const f = info.outputPath('lock.json');
  writeFileSync(f, JSON.stringify({ ...lock, cards }));
  const r = run('scripts/lock-choices.ts', '--lock', f);
  expect(r.code).toBe(1);
  expect(r.out).toContain('dn58 (bộ gốc): đổi thứ tự');
  expect(r.out).toMatch(/tn80: các bộ đổi/);
  expect(r.out).toContain('npm run choices:lock -- --note');
  // ghi lại khoá phải kèm ghi chú
  expect(run('scripts/lock-choices.ts', '--lock', f, '--write').code).toBe(1);
  expect(run('scripts/lock-choices.ts', '--lock', f, '--write', '--note', 'thử').code).toBe(0);
  const again = JSON.parse(readFileSync(f, 'utf8')) as { notes: { ids: string[]; note: string }[] };
  expect(again.notes.at(-1)).toMatchObject({ ids: ['dn58', 'tn80'], note: 'thử' });
  expect(run('scripts/lock-choices.ts', '--lock', f).code).toBe(0);
});

test('guards: the endings table must match the simulation number for number', ({}, info) => {
  expect(run('scripts/check-endings.ts', '--from', 'src/data/endings-rarity.json').code).toBe(0);
  const t = JSON.parse(readFileSync('src/data/endings-rarity.json', 'utf8'));
  t.play.chiadoi = Math.round((t.play.chiadoi + 0.1) * 10) / 10;
  const f = info.outputPath('rarity.json');
  writeFileSync(f, JSON.stringify(t));
  const r = run('scripts/check-endings.ts', '--from', f);
  expect(r.code).toBe(1);
  expect(r.out).toContain('play.chiadoi');
  expect(r.out).toContain('npm run endings');
});

test('guards: the endings path filter must cover every file the simulation imports', ({}, info) => {
  expect(run('scripts/check-endings.ts', '--filter').code).toBe(0);
  const f = info.outputPath('filters.yml');
  writeFileSync(f, readFileSync('.github/filters.yml', 'utf8').replace(/^\s*- 'src\/play\.ts'\n/m, ''));
  const r = run('scripts/check-endings.ts', '--filter', '--filters', f);
  expect(r.code).toBe(1);
  expect(r.out).toContain('src/play.ts');
});

test('guards: the bundle-size tripwire fires on a jump of more than 10%', ({}, info) => {
  const f = info.outputPath('size.json');
  expect(run('scripts/check-size.ts', '--update', '--budget', f).code).toBe(0); // mốc = bản dựng đang thử
  expect(run('scripts/check-size.ts', '--budget', f).code).toBe(0);
  const b = JSON.parse(readFileSync(f, 'utf8'));
  writeFileSync(f, JSON.stringify({ ...b, mainJs: Math.round(b.mainJs / 1.2) })); // như JS chính vừa lớn thêm 20%
  const r = run('scripts/check-size.ts', '--budget', f);
  expect(r.code).toBe(1);
  expect(r.out).toContain('JS chính');
  expect(r.out).toContain('npm run size:update');
});
