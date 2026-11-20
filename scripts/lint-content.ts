/* Kiểm nội dung sử liệu và thẻ (npm run scenes chạy trước check-scenes): thoát mã 1 nếu có lỗi.
   - Góc nhìn: mỗi sự kiện không lặp một góc nhìn, mỗi góc nhìn có nhãn trong P.
   - Nguồn: mọi id trong src có trong kho SRC, id SRC không trùng, câu trích (qt) dẫn đúng một nguồn có trong src của chính
     sự kiện ấy.
   - Mất mát không được trả công: lựa chọn trên thẻ mà kết cục kể người trong họ chết, không về, bị xử, mang thương tật, hay
     giết người, thì không tăng uy tín, lúa gạo, bạc, nhân đinh; quan hệ chỉ được nhích một bước nhỏ (≤ 5) cho biết dòng họ
     đứng về phía nào; đường ra đi bằng ghe giữ quan hệ với nước sở tại không hơn đường ra đi không mất người (ODP, +8).
     Câu kể có chữ như thế nhưng phần được không gắn với mất mát thì ghi vào OK kèm lý do. Chạy: npx tsx scripts/lint-content.ts */
import { EV, SRC, P } from '../src/data';
import { CARDS, VARIANT, type Fx } from '../src/data/cards';
import { SPECIAL } from '../src/data/cards2';

let err = 0;
const bad = (m: string) => { console.error('LỖI ' + m); err++; };

const ids = new Set<string>();
for (const s of SRC) { if (ids.has(s.id)) bad(`SRC ${s.id}: trùng id`); ids.add(s.id); }
for (const e of EV) {
  const seen = new Set<string>();
  for (const [p] of e.v) {
    if (seen.has(p)) bad(`${e.id}: góc nhìn '${p}' lặp lại`);
    seen.add(p);
    if (!P[p]) bad(`${e.id}: góc nhìn '${p}' không có nhãn trong P`);
  }
  if (!e.diary) for (const s of e.src) if (!ids.has(s)) bad(`${e.id}: nguồn '${s}' không có trong SRC`);
  if (e.qt) {
    if (!ids.has(e.qt.src)) bad(`${e.id}: câu trích dẫn nguồn '${e.qt.src}' không có trong SRC`);
    if (!e.src.includes(e.qt.src)) bad(`${e.id}: câu trích dẫn nguồn '${e.qt.src}' nhưng src của sự kiện chỉ có ${JSON.stringify(e.src)}`);
  }
}

// kết cục kể mất mát của chính dòng họ (hay việc giết người): phải là cái giá, không phải phần thưởng
const LOSS = /chết|không về|không tới (bờ|nơi)|hai người không|bị chém|xử bắn|bỏ mạng|lấy đi (một|hai|ba) người|mất (một|hai|ba) người|mất người|người sống sót|bắn rơi|một chân|vết sẹo|mất khi bị/i;
/** Đã xét: chữ khớp nhưng phần được không trả cho mất mát. Khoá như S.cards ('thẻ:chỉ số', bộ VARIANT 'thẻ@k:chỉ số',
    biến cố riêng 'x:id:chỉ số'). */
const OK: Record<string, string> = {
  'dn58:1': 'không ai chết; nhân đinh còn nguyên vì cả họ lánh đi',
  'hn73:2': 'Garnier, không phải người trong họ; bạc là tiền bán hàng',
  'la93:0': 'bạc là lãi buôn muối; người chết vì sốt rừng là cái giá của chuyến buôn',
  'ng45:0': 'không ai chết đói nhờ kho thóc mở',
  'ng45@0:0': 'không ai chết đói nhờ kho thóc mở',
  'ng45:1': 'bạc là tiền bán thóc lúc đói; người chết là người làng, uy tín, làng xóm, Việt Minh đều tụt mạnh',
  'bmt75:0': 'không có gì tăng',
  'cc53:0': 'không có gì tăng',
  'x-diachu53:1': 'Việt Minh +5 (≤ 5) vì được xếp "địa chủ kháng chiến" nhờ người con ở Điện Biên, không vì người già mất',
};
const REL = ['tr', 'ph', 'nh', 'vm', 'qg', 'my', 'nn', 'lg'] as const;
let losses = 0;
const keys = new Set<string>();
const loss = (key: string, label: string, fx: Fx, out: string) => {
  keys.add(key);
  if (!LOSS.test(out) || OK[key] !== undefined) return;
  losses++;
  for (const k of ['u', 'g', 'b', 'd'] as const) if ((fx[k] || 0) > 0) bad(`${key} "${label}": kết cục kể mất mát ("${out}") mà ${k} +${fx[k]}`);
  for (const k of REL) {
    const cap = k === 'my' ? 8 : 5;
    if ((fx[k] || 0) > cap) bad(`${key} "${label}": kết cục kể mất mát ("${out}") mà quan hệ ${k} +${fx[k]} (tối đa +${cap})`);
  }
};
for (const [id, , chs] of CARDS) chs.forEach((c, i) => loss(`${id}:${i}`, c[0], c[2], c[3]));
for (const [id, vs] of Object.entries(VARIANT)) vs.forEach((v, k) => v.choices.forEach((c, i) => loss(`${id}@${k}:${i}`, c[0], c[2], c[3])));
for (const sp of SPECIAL) sp.choices.forEach((c, i) => loss(`${sp.id}:${i}`, c[0], c[2], c[3]));
for (const k of Object.keys(OK)) if (!keys.has(k)) bad(`OK['${k}']: không có lựa chọn này`);

console.log(`kiểm nội dung: ${EV.length} sự kiện, ${SRC.length} sử liệu, ${losses} lựa chọn kể mất mát đã xét; ${err} lỗi`);
if (err) process.exit(1);
