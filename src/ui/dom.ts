import { hush } from '../narration';
import { isTouring } from '../tour';
import { SND } from '../audio';

export const $ = <T extends Element = HTMLElement>(s: string, root: ParentNode = document) => root.querySelector<T>(s);
export const app = document.getElementById('app')!;
export const layer = document.getElementById('layer')!;
/* Bảng chọn / trang chi tiết / màn mở đầu đang phủ: phần chính phía sau không nhận tiêu điểm bàn phím, trình đọc
   màn hình không đọc lẫn (trước đây Tab đi vào bản đồ, các nút ẩn sau bảng). Bảng Nhân vật / Sử liệu / Hồ sơ
   (.pane) không phủ thanh thẻ nên không tính. */
const mainEl = document.getElementById('main');
/** Nút đã mở một bảng / trang (để đóng xong trả tiêu điểm về đó). */
const invoker = new WeakMap<Element, HTMLElement>();
export function remember(el: Element, who: Element | null = document.activeElement): void {
  if (who instanceof HTMLElement && who !== document.body && !el.contains(who)) invoker.set(el, who);
}
if (mainEl) new MutationObserver(recs => {
  const back = recs.flatMap(r => [...r.removedNodes]).map(n => invoker.get(n as Element)).filter((x): x is HTMLElement => !!x).pop();
  mainEl.inert = !!layer.querySelector(':scope > .scrim, :scope > .ov');
  // bảng chồng lên trang / bảng khác (nhân vật trên trang sự kiện, xác nhận trên Hồ sơ…): mọi lớp dưới bảng trên cùng
  // không nhận tiêu điểm (Shift+Tab không lọt xuống nút bị che), bảng trên cùng đóng thì lớp dưới dùng lại được
  const kids = [...layer.children] as HTMLElement[], top = kids.map(k => k.matches('.scrim')).lastIndexOf(true);
  kids.forEach((k, i) => { k.inert = top >= 0 && i < top; });
  // menu lọc sự kiện không treo dưới trang / bảng vừa mở (Escape đầu tiên phải đóng trang, không đóng menu khuất)
  if (kids.length) { document.getElementById('fmenu')?.remove(); document.getElementById('fbtn')?.setAttribute('aria-expanded', 'false'); }
  // bảng Nhân vật / Sử liệu / Hồ sơ phủ bản đồ: chỉ thanh tab còn dùng được, phần dưới bảng (dòng thời gian, nút zoom…) không nhận tiêu điểm
  const pane = !!layer.querySelector(':scope > .pane');
  for (const c of mainEl.children) if (c.id !== 'tabs') (c as HTMLElement).inert = pane;
  // bảng / trang vừa đóng mang theo tiêu điểm: đưa về nút điều khiển đang có (tour, xem lại, ▶), không để rơi về <body>
  requestAnimationFrame(() => {
    const a = document.activeElement;
    if (a && a !== document.body && a.isConnected) return;
    // nút đã mở bảng vừa đóng (vd. thẻ dưới bản đồ, nhân vật trong danh sách), nếu còn và không bị che
    if (back && back.isConnected && !back.closest('[inert]')) { back.focus({ preventScroll: true }); return; }
    if (layer.querySelector(':scope > .scrim, :scope > .ov, :scope > .pane')) return;
    focusFallback();
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

/** Thanh tab sáng ở thẻ `t` (aria-current theo), không dựng lại bảng. */
export function markTab(t: string): void {
  document.querySelectorAll<HTMLElement>('.tab').forEach(b => { const on = b.dataset.t === t; b.classList.toggle('on', on); if (on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
}

export function clearLayer(): void {
  // bảng Nhân vật / Sử liệu / Hồ sơ bị dọn đi (điểm rẽ, xem lại…): thanh tab trở về Bản đồ, không sáng nhầm thẻ cũ
  if (layer.querySelector(':scope > .pane')) markTab('map');
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
  remember(d);
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

/** Nhóm lựa chọn role=radiogroup dựng bằng nút: một điểm dừng Tab (nút đang chọn, hay nút đầu), mũi tên chuyển và chọn
    (gọi đúng hành vi bấm của nút), tên nhóm theo tiêu đề `label`. Nút bị khoá (không đủ sức, chưa nghe xong lời dẫn) bỏ qua. */
export function radios(g: HTMLElement | null, label?: Element | null): void {
  if (!g) return;
  if (label) { label.id ||= 'rg-' + Math.random().toString(36).slice(2, 8); g.setAttribute('aria-labelledby', label.id); }
  const all = () => [...g.querySelectorAll<HTMLButtonElement>(':scope > [role=radio]')], opts = () => all().filter(b => !b.disabled);
  const sync = () => {
    const o = opts();
    if (!o.length) return; // còn khoá hết (lời dẫn đang kể): để nguyên
    const cur = o.find(b => b.getAttribute('aria-checked') === 'true') || o[0];
    all().forEach(b => (b.tabIndex = b === cur ? 0 : -1));
  };
  sync();
  g.addEventListener('focusin', sync);
  g.addEventListener('click', () => requestAnimationFrame(sync));
  g.addEventListener('keydown', ev => {
    const d = ev.key === 'ArrowDown' || ev.key === 'ArrowRight' ? 1 : ev.key === 'ArrowUp' || ev.key === 'ArrowLeft' ? -1 : 0, o = opts();
    if (!d || !o.length) return;
    ev.preventDefault();
    const i = o.indexOf(document.activeElement as HTMLButtonElement), n = o[(i + d + o.length) % o.length];
    n.focus();
    n.click();
  });
}

/** Thông báo lịch sự cho trình đọc màn hình (vùng ẩn có sẵn trước khi điền, để được đọc). */
export function announce(t: string): void {
  let n = document.getElementById('tourlive');
  if (!n) { n = document.createElement('div'); n.id = 'tourlive'; n.className = 'sr'; n.setAttribute('aria-live', 'polite'); app.appendChild(n); }
  const box = n;
  box.textContent = '';
  setTimeout(() => { box.textContent = t; }, 120);
}

/** Tiêu điểm về nút điều khiển đang có, theo thứ tự ưu tiên, bỏ qua nút đang ẩn (thanh tour bị che khi đang xem lại). */
export function focusFallback(): void {
  for (const q of ['#replb [data-t=again]', '#tourb [data-t=next]', '#tourb [data-t=resume]', '#card .c', '#play']) {
    const b = document.querySelector<HTMLElement>(q);
    if (b && b.getClientRects().length && !b.closest('[inert]')) { b.focus({ preventScroll: true }); return; }
  }
}
