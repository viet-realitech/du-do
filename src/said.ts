import SAID from './voice/said.json';

/* Câu mà mỗi bản thu đọc: src/voice/said.json giữ dấu (FNV-1a 32 bit) của đúng nguyên văn đã thu, do `npm run voice`
   (scripts/build-voice.mjs) ghi lúc dựng bản thu. Câu trên màn đã sửa mà chưa thu lại thì dấu không khớp: ứng dụng không
   phát bản thu cũ (chỉ hiện chữ, hay giọng của máy), và `npm run voice:check` báo bản thu cần thu lại.
   build-voice.mjs tính dấu y hệt textSig. */
export function textSig(t: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return (h >>> 0).toString(16).padStart(8, '0');
}
const SIG = SAID as Record<string, string>;
/** Dấu đã ghi của bản thu `key` (undefined nếu chưa có). */
export const saidSig = (key: string): string | undefined => SIG[key];
/** `key` nếu bản thu ấy đọc đúng `text`; undefined nếu không có khoá, chưa có bản thu, hay bản thu đọc một câu cũ. */
export const sayKey = (key: string | undefined, text: string): string | undefined => (key && SIG[key] === textSig(text) ? key : undefined);
