/* Lưới an toàn lúc khởi động: public/boot.js (chạy trước mọi mô-đun) dựng `window.dudoBoot`; ở đây chỉ có kiểu và cách
   gọi. Không có lưới (công cụ chạy bằng node, như sim-loyal) thì mọi lời gọi bỏ qua. */

/** Một bản sao bản lưu hỏng đã cất ('dudo-save-broken-<n>'). */
export interface Kept { n: number; t: string; key: string; why: string; raw: string | null }

export interface Boot {
  /** Mã ứng dụng bắt đầu chạy (main.ts). */
  started(): void;
  /** Phần đồng bộ của main.ts chạy hết. */
  booted(): void;
  /** Bản đồ chính đã vẽ: từ đây lỗi chỉ ghi sổ, không còn mở màn khôi phục. */
  ready(): void;
  /** Khởi động hỏng (bản đồ chính không vẽ được): mở màn khôi phục. */
  fail(msg: string): void;
  /** Mở màn khôi phục: 'save' = bản lưu `key` không đọc được; 'start' = ứng dụng không mở được. */
  rescue(why: 'save' | 'start', key?: string, msg?: string): void;
  /** Cất một bản sao của bản lưu `key` (trùng nội dung bản đã cất thì thôi); số thứ tự, 0 nếu không cất được. */
  keep(key: string, why: string): number;
  /** Các bản sao đã cất, cũ trước mới sau. */
  kept(): Kept[];
  /** Ghi một dòng vào sổ lỗi trên máy (errlog.ts đặt khi nạp). */
  sink?: (m: string) => void;
}

export const boot = (): Boot | undefined => {
  try { return (globalThis as unknown as { dudoBoot?: Boot }).dudoBoot; } catch { return undefined; }
};

const KEEP = 'dudo-save-broken-';
/** Các bản sao bản lưu hỏng đã cất, đọc thẳng từ bộ nhớ (cả khi boot.js không có). */
export function keptSaves(): Kept[] {
  const b = boot();
  if (b) { try { return b.kept(); } catch { /* đọc thẳng dưới đây */ } }
  const out: Kept[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || !k.startsWith(KEEP) || !/^\d+$/.test(k.slice(KEEP.length))) continue;
      try { const o = JSON.parse(localStorage.getItem(k) || 'null'); if (o && typeof o === 'object') out.push({ ...o, n: +k.slice(KEEP.length) }); } catch { /* bản sao hỏng: bỏ qua */ }
    }
  } catch { /* riêng tư */ }
  return out.sort((a, b) => a.n - b.n);
}
