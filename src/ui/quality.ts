/* Mức hiệu ứng tự chỉnh theo khung hình đo được trên chính máy này (thay cho đoán theo số nhân CPU: iPad Pro báo 8
   nhân nên trước đây không bao giờ được bớt hiệu ứng, còn máy tính 4 nhân lại bị bớt oan).
   2 đủ · 1 bớt (không gợn sóng bờ biển, không bộ lọc nét cổ, khói một đợt, không rung khung) · 0 tối giản (bản đồ
   không nghiêng, không chớp lửa, ảnh tư liệu đứng yên). Người dùng chọn cố định ở Hồ sơ → Cài đặt thì không tự chỉnh. */

export type QMode = 'auto' | 'full' | 'lite';
type Lvl = 0 | 1 | 2;
const KEY = 'dudo-q';

let mode: QMode = 'auto', lvl: Lvl = 2;
try {
  const v = JSON.parse(localStorage.getItem(KEY) || 'null') as { m?: QMode; q?: number } | null;
  if (v && (v.m === 'auto' || v.m === 'full' || v.m === 'lite')) mode = v.m;
  if (v && (v.q === 0 || v.q === 1 || v.q === 2)) lvl = v.q;
} catch { /* chế độ riêng tư: mặc định đủ hiệu ứng, đo lại mỗi lần mở */ }

const subs: (() => void)[] = [];
/** Mức đang dùng: 2 đủ, 1 bớt, 0 tối giản. */
export const quality = (): Lvl => (mode === 'full' ? 2 : mode === 'lite' ? 1 : lvl);
export const qmode = (): QMode => mode;
/** Gọi `f` mỗi khi mức đổi (tự chỉnh hay người dùng chọn). */
export const onQuality = (f: () => void): void => { subs.push(f); };

function apply(): void {
  document.documentElement.dataset.q = String(quality());
  try { localStorage.setItem(KEY, JSON.stringify({ m: mode, q: lvl })); } catch { /* không lưu được: vẫn dùng trong phiên này */ }
  subs.forEach(f => f());
}
document.documentElement.dataset.q = String(quality());

/** Người dùng chọn ở Cài đặt; 'auto' đo lại từ mức đủ. */
export function setQMode(m: QMode): void {
  mode = m;
  if (m === 'auto') { lvl = 2; good = 0; bad = 0; }
  apply();
}

/* Khoảng một khung hình chuẩn của màn này (60 Hz: 16,7 ms; 120 Hz: 8,3 ms), học lúc rảnh. */
let vsync = 1000 / 60, good = 0, bad = 0;
export function learnVsync(): void {
  const g: number[] = [];
  let last = 0;
  const f = (t: number) => {
    if (last) g.push(t - last);
    last = t;
    if (g.length < 40) { requestAnimationFrame(f); return; }
    g.sort((a, b) => a - b);
    vsync = Math.min(17, Math.max(6, g[Math.floor(g.length / 4)]));
  };
  requestAnimationFrame(f);
}

/** Đo khung hình trong một đoạn nặng (bản đồ bay, cảnh mở trận, màn điện ảnh) dài `ms`, rồi chỉnh mức (chế độ tự động).
    Chỉ dựa vào khoảng cách giữa các khung hình (Safari không có longtask): phần lớn khung chậm hơn hai lần chuẩn (dưới
    ~30 khung/giây) hai đoạn liền thì hạ một mức; mượt sáu đoạn liền thì thử lại mức trên. Máy mạnh không bao giờ bị hạ
    vì một lần khựng (tải ảnh, đổi thẻ trình duyệt). */
let until = 0;
export function watch(ms: number): void {
  if (mode !== 'auto' || document.hidden) return;
  const end = performance.now() + ms;
  if (until) { until = Math.max(until, end); return; } // đoạn đang đo (bay + mở cảnh cùng lúc): nối dài, không đếm hai lần
  until = end;
  const gaps: number[] = [];
  let last = 0;
  const f = (t: number) => {
    if (last) gaps.push(t - last);
    last = t;
    if (t < until && !document.hidden) { requestAnimationFrame(f); return; }
    until = 0;
    judge(gaps);
  };
  requestAnimationFrame(f);
}
function judge(g: number[]): void {
  if (mode !== 'auto' || document.hidden || g.length < 8) return;
  g.sort((a, b) => a - b);
  const p75 = g[Math.floor(g.length * 0.75)], slow = g.filter(x => x > 3 * vsync).length / g.length;
  if (p75 > 2 * vsync || slow > 0.25) {
    good = 0;
    if (++bad >= 2 && lvl > 0) { bad = 0; lvl = (lvl - 1) as Lvl; apply(); }
  } else if (p75 < 1.3 * vsync && slow < 0.05) {
    bad = 0;
    if (++good >= 6 && lvl < 2) { good = 0; lvl = (lvl + 1) as Lvl; apply(); }
  }
}
