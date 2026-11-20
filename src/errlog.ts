/* Sổ lỗi trên máy, không gửi đi đâu: lỗi chưa bắt (window error) và promise bị từ chối không ai xử lý, 20 dòng gần nhất
   trong localStorage 'dudo-errlog'. Chỉ bảng chẩn đoán (ui/debug.ts) đọc. Nạp đầu tiên (main.ts) để bắt cả lỗi lúc các
   mô-đun khác chạy. Mọi bước bọc try/catch: sổ lỗi không bao giờ tự gây lỗi hay chặn giao diện. */
const KEY = 'dudo-errlog', MAX = 20;

export interface ErrRow {
  /** Giờ (ISO), lần cuối gặp. */
  t: string;
  m: string;
  /** Dòng đầu của ngăn xếp / tệp:dòng. */
  at?: string;
  /** Bản dựng (vite.config.ts). */
  b: string;
  /** Số lần liền nhau (lỗi lặp mỗi khung hình chỉ ghi một dòng). */
  n?: number;
}

let rows: ErrRow[] | null = null;
export function errlog(): ErrRow[] {
  if (!rows) {
    try {
      const v = JSON.parse(localStorage.getItem(KEY) || '[]');
      // chỉ giữ dòng hợp lệ (bộ nhớ hỏng / bản cũ ghi khác: một dòng null từng làm trống bảng chẩn đoán)
      rows = Array.isArray(v) ? v.filter((r: unknown) => !!r && typeof r === 'object' && typeof (r as ErrRow).m === 'string').slice(-MAX) : [];
    } catch { rows = []; }
  }
  return rows;
}

let tw = 0;
function add(m: string, at?: string): void {
  try {
    const l = errlog(), last = l[l.length - 1], t = new Date().toISOString();
    if (last && last.m === m && last.at === at) { last.n = (last.n || 1) + 1; last.t = t; }
    else {
      l.push({ t, m: m.slice(0, 300), at: at?.slice(0, 200), b: __APP_BUILD__ });
      while (l.length > MAX) l.shift();
    }
    // ghi gộp tối đa mỗi giây một lần (lỗi lặp trong vòng vẽ không ghi bộ nhớ mỗi khung)
    if (!tw) tw = window.setTimeout(() => { tw = 0; try { localStorage.setItem(KEY, JSON.stringify(errlog())); } catch { /* đầy / riêng tư */ } }, 1000);
  } catch { /* không bao giờ ném lỗi từ đây */ }
}

const top = (e: unknown): string | undefined => {
  try {
    const s = (e as Error)?.stack;
    return s ? s.split('\n').map(x => x.trim()).find(x => /:\d+/.test(x) && !x.startsWith((e as Error).name + ':')) : undefined;
  } catch { return undefined; }
};

addEventListener('error', ev => {
  try {
    if (!(ev instanceof ErrorEvent)) return; // ảnh / âm thanh tải hỏng không lên tới đây (không nổi bọt), chỉ lỗi mã
    add(ev.message || String(ev.error), top(ev.error) || (ev.filename ? `${ev.filename.split('/').pop()}:${ev.lineno}:${ev.colno}` : undefined));
  } catch { /* bỏ qua */ }
});
addEventListener('unhandledrejection', ev => {
  try {
    const r = ev.reason as Error | undefined;
    add('Promise: ' + (r && typeof r === 'object' && 'message' in r ? `${r.name}: ${r.message}` : String(r)), top(r));
  } catch { /* bỏ qua */ }
});
