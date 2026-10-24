import { hush } from '../narration';
import { isTouring } from '../tour';

export const $ = <T extends Element = HTMLElement>(s: string, root: ParentNode = document) => root.querySelector<T>(s);
export const app = document.getElementById('app')!;
export const layer = document.getElementById('layer')!;

export const esc = (s: unknown) =>
  String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export function clearLayer(): void {
  layer.innerHTML = '';
  if (!isTouring()) hush();
}

export function toast(html: string): void {
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
  if (dismiss) d.addEventListener('click', e => { if (e.target === d) d.remove(); });
  else d.dataset.lock = '1'; // a decision is required: Back/Escape won't dismiss it
  layer.appendChild(d);
  const s = d.firstElementChild as HTMLElement;
  s.tabIndex = -1;
  s.focus({ preventScroll: true });
  return d;
}
