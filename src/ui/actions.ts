/* Delegated click actions: markup carries data-a="name" (+ data-* args) instead of inline handlers.
   Kept dependency-free so screens can register at module load regardless of import cycles. */
type Handler = (el: HTMLElement, ev: MouseEvent) => void;
const actions: Record<string, Handler> = {};

export function on(name: string, h: Handler): void { actions[name] = h; }

document.addEventListener('click', ev => {
  const el = (ev.target as Element).closest<HTMLElement>('[data-a]');
  if (!el || el.hasAttribute('disabled')) return;
  actions[el.dataset.a!]?.(el, ev);
});
