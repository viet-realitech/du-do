import { hush } from '../narration';
import { isTouring } from '../tour';
import { SND } from '../audio';

export const $ = <T extends Element = HTMLElement>(s: string, root: ParentNode = document) => root.querySelector<T>(s);
export const app = document.getElementById('app')!;
/** Máy yếu (≤ 4 nhân hoặc ≤ 2 GB RAM): bớt hiệu ứng tốn công vẽ. */
export const lite = (navigator.hardwareConcurrency || 8) <= 4 || ((navigator as { deviceMemory?: number }).deviceMemory || 8) <= 2;
export const layer = document.getElementById('layer')!;
/* Bảng chọn / trang chi tiết / màn mở đầu đang phủ: phần chính phía sau không nhận tiêu điểm bàn phím, trình đọc
   màn hình không đọc lẫn (trước đây Tab đi vào bản đồ, các nút ẩn sau bảng). Bảng Nhân vật / Sử liệu / Hồ sơ
   (.pane) không phủ thanh thẻ nên không tính. */
const mainEl = document.getElementById('main');
if (mainEl) new MutationObserver(() => {
  mainEl.inert = !!layer.querySelector(':scope > .scrim, :scope > .ov');
  // bảng Nhân vật / Sử liệu / Hồ sơ phủ bản đồ: chỉ thanh tab còn dùng được, phần dưới bảng (dòng thời gian, nút zoom…) không nhận tiêu điểm
  const pane = !!layer.querySelector(':scope > .pane');
  for (const c of mainEl.children) if (c.id !== 'tabs') (c as HTMLElement).inert = pane;
  // bảng / trang vừa đóng mang theo tiêu điểm: đưa về nút điều khiển đang có (tour, xem lại, ▶), không để rơi về <body>
  requestAnimationFrame(() => {
    const a = document.activeElement;
    if (a && a !== document.body && a.isConnected) return;
    if (layer.querySelector(':scope > .scrim, :scope > .ov, :scope > .pane')) return;
    document.querySelector<HTMLElement>('#tourb [data-t=next], #tourb [data-t=resume], #replb [data-t=again], #play')?.focus({ preventScroll: true });
  });
}).observe(layer, { childList: true });

export const esc = (s: unknown) =>
  String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export const calm = matchMedia('(prefers-reduced-motion: reduce)');

/** Let `els` play their exit animation outside the live layer (inert, no ids), then drop them.
    The layer itself is empty at once, so callers can render the next screen immediately. */
export function ghost(...els: Element[]): void {
  if (calm.matches) { els.forEach(e => e.remove()); return; }
  const g = document.createElement('div');
  g.className = 'exiting';
  g.inert = true;
  g.setAttribute('aria-hidden', 'true');
  g.append(...els);
  g.querySelectorAll('[id]').forEach(e => e.removeAttribute('id'));
  app.appendChild(g);
  setTimeout(() => g.remove(), 320);
}

export function clearLayer(): void {
  ghost(...layer.children);
  if (!isTouring()) hush();
}

/** Màn mở chương hay phim hành trình đang chiếu (che cả toast). */
export const cineOpen = () => !!document.querySelector('body > .cine:not(.out)');
/** Chạy `fn` khi không còn màn điện ảnh nào che (ngay nếu không có). */
export function whenClear(fn: () => void): void {
  if (cineOpen()) setTimeout(() => whenClear(fn), 500); else fn();
}

export function toast(html: string): void {
  if (cineOpen()) { whenClear(() => toast(html)); return; }
  const n = document.createElement('div');
  n.className = 'toast';
  n.setAttribute('role', 'status');
  n.innerHTML = html;
  app.appendChild(n);
  setTimeout(() => n.remove(), 2800);
}

/** Bottom sheet in the overlay layer. `dismiss` lets a tap on the scrim close it. */
export function sheet(html: string, dismiss = false): HTMLElement {
  const d = document.createElement('div');
  d.className = 'scrim';
  d.innerHTML = `<div class="sheet" role="dialog" aria-modal="true"><div class="grab"></div>${html}</div>`;
  if (dismiss) d.addEventListener('click', e => { if (e.target === d) ghost(d); });
  else d.dataset.lock = '1'; // a decision is required: Back/Escape won't dismiss it
  // Sheet replacing a sheet: the old one just dissolves and the backdrop stays put.
  const swap = [...app.querySelectorAll('.exiting')].filter(g => g.querySelector(':scope > .scrim'));
  if (swap.length) { swap.forEach(g => g.classList.add('swap')); d.classList.add('cont'); }
  layer.appendChild(d);
  const sh = d.querySelector<HTMLElement>('.sheet')!, h = sh.querySelector('h2');
  if (h) { h.id ||= 'sh-' + Math.random().toString(36).slice(2, 8); sh.setAttribute('aria-labelledby', h.id); }
  sh.tabIndex = -1;
  requestAnimationFrame(() => { if (d.isConnected && !sh.contains(document.activeElement)) sh.focus({ preventScroll: true }); });
  SND.whoosh();
  const s = d.firstElementChild as HTMLElement;
  s.tabIndex = -1;
  s.focus({ preventScroll: true });
  return d;
}
