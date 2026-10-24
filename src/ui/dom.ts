import { hush } from '../narration';
import { isTouring } from '../tour';
import { SND } from '../audio';

export const $ = <T extends Element = HTMLElement>(s: string, root: ParentNode = document) => root.querySelector<T>(s);
export const app = document.getElementById('app')!;
export const layer = document.getElementById('layer')!;

export const esc = (s: unknown) =>
  String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

const calm = matchMedia('(prefers-reduced-motion: reduce)');

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
  if (dismiss) d.addEventListener('click', e => { if (e.target === d) ghost(d); });
  else d.dataset.lock = '1'; // a decision is required: Back/Escape won't dismiss it
  // Sheet replacing a sheet: the old one just dissolves and the backdrop stays put.
  const swap = [...app.querySelectorAll('.exiting')].filter(g => g.querySelector(':scope > .scrim'));
  if (swap.length) { swap.forEach(g => g.classList.add('swap')); d.classList.add('cont'); }
  layer.appendChild(d);
  SND.whoosh();
  const s = d.firstElementChild as HTMLElement;
  s.tabIndex = -1;
  s.focus({ preventScroll: true });
  return d;
}
