/* Khoá thứ tự lựa chọn của thẻ (Chế độ Chơi). Bản lưu giữ chỉ số lựa chọn đã quyết (S.cards[id] = i, biến cố riêng
   'x:id'), còn bộ theo vùng (VARIANT) được chọn lại từ trạng thái lúc mở (play.ts variantIx: bộ đầu tiên khớp). Nên thêm,
   xoá, đổi thứ tự lựa chọn, hay thêm, dời, đổi điều kiện một bộ theo vùng đều làm bản lưu cũ đọc sai thẻ đã quyết (lỗi
   "bản lưu Di tản cũ" là do chèn bộ mới lên trước các bộ cũ). scripts/lock-choices.json chụp lại mọi bộ: nhãn từng lựa
   chọn theo thứ tự, cờ, đổi họ, điều kiện của bộ. Lệch khoá thì báo lỗi (CI) cho tới khi ghi lại có chủ ý, kèm ghi chú
   bản lưu cũ được chuyển thế nào. Hiệu ứng (số liệu) không nằm trong khoá: chỉnh số không đổi nghĩa chỉ số đã lưu.
   Kiểm: npm run choices · Ghi lại: npm run choices:lock -- --note "<thẻ nào, vì sao, bản lưu cũ chuyển ra sao>" */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { CARD, VARIANT, type Choice, type Variant } from '../src/data/cards';
import { SPECIAL, type SpecialChoice } from '../src/data/cards2';

const argv = process.argv.slice(2), opt = (k: string) => { const i = argv.indexOf(k); return i >= 0 ? (argv[i + 1] || '').trim() : ''; };
const FILE = opt('--lock') || 'scripts/lock-choices.json'; // --lock <tệp>: khoá khác (e2e/guards.spec.ts)
/** Trong tệp: mỗi bộ một khoá, `id` (bộ gốc), `id @k <điều kiện>` (bộ theo vùng thứ k), `x:id @<sự kiện>` (biến cố riêng). */
type Sets = Record<string, string[]>;
type Lock = { about: string; notes: { date: string; ids: string[]; note: string }[]; cards: Sets; special: Sets };

const ch = (c: Choice) => c[0] + (c[4] ? ` ⚑${c[4]}` : '');
const sp = (c: SpecialChoice) => c[0] + (c[4] ? ` → họ ${c[4]}` : '') + (c[5] ? ` ⚑${c[5]}` : '');
/** Điều kiện của một bộ theo vùng, thứ tự cố định (scope không đổi nghĩa chỉ số đã lưu nên không tính). */
const when = (v: Variant) => (['regions', 'from', 'homes', 'picks', 'notPicks', 'after', 'flags', 'special'] as const)
  .filter(k => v[k] !== undefined).map(k => `${k}=${([] as string[]).concat(v[k] as string | string[]).join(',')}`).join(' ') || 'mọi nhà';

function snapshot(): { cards: Sets; special: Sets } {
  const cards: Sets = {}, special: Sets = {};
  for (const id of Object.keys(CARD).sort()) {
    cards[id] = CARD[id][2].map(ch);
    (VARIANT[id] || []).forEach((v, k) => { cards[`${id} @${k} ${when(v)}`] = v.choices.map(ch); });
  }
  for (const c of [...SPECIAL].sort((a, b) => a.id.localeCompare(b.id))) special[`x:${c.id} @${c.ev}`] = c.choices.map(sp);
  return { cards, special };
}

const idOf = (k: string) => k.split(' ')[0];
/** Tên bộ để so trước / sau: bộ theo vùng nhận nhau theo điều kiện (không theo vị trí), để thấy bộ bị dời hay chèn. */
const setOf = (k: string) => { const r = k.slice(idOf(k).length + 1); return !r ? 'bộ gốc' : r.startsWith('@') && /^@\d+ /.test(r) ? r.replace(/^@\d+ /, '') : `gắn vào ${r.slice(1)}`; };
const q = (ls: string[]) => ls.map(l => `"${l}"`).join(', ');

/** Mô tả chỗ lệch của thẻ (hay biến cố riêng) `id` giữa khoá cũ và hiện tại. */
function explain(was: Sets, now: Sets, id: string): string[] {
  const own = (m: Sets) => Object.keys(m).filter(k => idOf(k) === id);
  const a = own(was), b = own(now), out: string[] = [];
  if (!a.length) return [`${id}: mới (bản lưu cũ chưa quyết thẻ này: chỉ cần ghi khoá)`];
  if (!b.length) return [`${id}: đã xoá (bản lưu đã quyết thẻ này giữ một chỉ số không còn nghĩa)`];
  const sa = a.map(setOf), sb = b.map(setOf);
  if (sa.join('|') !== sb.join('|')) out.push(`${id}: các bộ đổi (bộ đầu tiên khớp được dùng, bản lưu cũ có thể rơi vào bộ khác)\n      trước: ${sa.join(' · ')}\n      nay:   ${sb.join(' · ')}`);
  a.forEach((k, i) => {
    const j = sb.indexOf(sa[i]);
    if (j < 0) return;
    const x = was[k], y = now[b[j]], name = `${id} (${sa[i]})`;
    if (x.join('|') === y.join('|')) return;
    if (y.length > x.length && x.every((l, n) => y[n] === l)) out.push(`${name}: thêm lựa chọn ở cuối: ${q(y.slice(x.length))}`);
    else if (x.length === y.length && [...x].sort().join('|') === [...y].sort().join('|')) out.push(`${name}: đổi thứ tự: ${q(x)} → ${q(y)}`);
    else if (x.length === y.length) x.forEach((l, n) => { if (l !== y[n]) out.push(`${name}: lựa chọn ${n} đổi: "${l}" → "${y[n]}"`); });
    else out.push(`${name}: ${x.length} → ${y.length} lựa chọn: ${q(x)} → ${q(y)}`);
  });
  return out.length ? out : [`${id}: đổi`];
}
const diff = (was: Sets, now: Sets) => [...new Set([...Object.keys(was), ...Object.keys(now)]
  .filter(k => !(k in was) || !(k in now) || was[k].join('|') !== now[k].join('|')).map(idOf))].sort();

const write = argv.includes('--write'), note = opt('--note');
const lock: Lock | null = existsSync(FILE) ? JSON.parse(readFileSync(FILE, 'utf8')) : null;
const now = snapshot();
const changed = lock ? { cards: diff(lock.cards, now.cards), special: diff(lock.special, now.special) } : { cards: [], special: [] };
const ids = [...changed.cards, ...changed.special];
const counts = `${Object.keys(CARD).length} thẻ, ${Object.values(VARIANT).reduce((n, v) => n + v.length, 0)} bộ theo vùng, ${SPECIAL.length} biến cố riêng`;

if (write) {
  if (lock && !ids.length) { console.log(`${FILE} đã khớp (${counts}), không ghi gì.`); process.exit(0); }
  if (lock && !note) { console.error('Ghi lại khoá cần một ghi chú: npm run choices:lock -- --note "<thẻ nào, vì sao, bản lưu cũ chuyển ra sao>"'); process.exit(1); }
  const out: Lock = {
    about: 'Khoá thứ tự lựa chọn của thẻ (scripts/lock-choices.ts). Bản lưu giữ chỉ số lựa chọn: thay đổi ở đây cần một bước chuyển đổi bản lưu (src/state.ts) và một ghi chú. Ghi lại: npm run choices:lock -- --note "..."',
    notes: [...(lock?.notes || []), { date: new Date().toISOString().slice(0, 10), ids, note: note || 'Khoá đầu tiên.' }],
    ...now,
  };
  writeFileSync(FILE, JSON.stringify(out, null, 1) + '\n');
  console.log(`đã ghi ${FILE} (${counts})${ids.length ? `; đổi: ${ids.join(', ')}` : ''}`);
  process.exit(0);
}
if (!lock) { console.error(`thiếu ${FILE}: npm run choices:lock`); process.exit(1); }
if (!ids.length) { console.log(`thứ tự lựa chọn khớp ${FILE}: ${counts}`); process.exit(0); }
for (const id of changed.cards) for (const l of explain(lock.cards, now.cards, id)) console.error('✗ ' + l);
for (const id of changed.special) for (const l of explain(lock.special, now.special, id)) console.error('✗ ' + l);
console.error(`
${ids.length} thẻ lệch ${FILE}. Bản lưu chỉ giữ chỉ số lựa chọn (S.cards), còn bộ theo vùng được chọn lại lúc mở, nên
thêm, xoá, đổi thứ tự lựa chọn hay bộ theo vùng làm bản lưu cũ đọc sai thẻ đã quyết. Thẻ mới, lựa chọn thêm ở cuối, hay
chỉ sửa chữ không đổi nghĩa chỉ số cũ; còn lại cần một bước chuyển đổi bản lưu (src/state.ts). Cố ý thì ghi lại khoá:
  npm run choices:lock -- --note "<thẻ nào, vì sao, bản lưu cũ chuyển ra sao>"`);
process.exit(1);
