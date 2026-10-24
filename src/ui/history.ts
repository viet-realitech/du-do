import { app, layer, clearLayer, ghost } from './dom';
import { renderMain } from '../view';
import { setTab } from '../tabs';

/* Hardware/browser Back and Escape close the topmost overlay instead of leaving the app.
   While anything closable is open we keep exactly one extra history entry. */
type Top = { close: () => void } | { locked: true } | null;

function topmost(): Top {
  const lb = app.querySelector<HTMLElement>('.lb');
  if (lb) return { close: () => lb.querySelector<HTMLElement>('.back')!.click() };
  const sc = [...layer.querySelectorAll<HTMLElement>('.scrim')].pop();
  if (sc) return sc.dataset.lock ? { locked: true } : { close: () => ghost(sc) };
  const ov = layer.querySelector<HTMLElement>('.ov:not(.splash):not(.intro)');
  if (ov) {
    const c = ov.querySelector<HTMLElement>('[data-a="close"]');
    return { close: () => (c ? c.click() : (clearLayer(), renderMain())) };
  }
  if (layer.querySelector('.pane')) return { close: () => setTab('map') };
  return null;
}

let pushed = false;
let skipPop = false;

function sync(): void {
  const open = !!topmost();
  if (open && !pushed) {
    history.pushState({ dd: 1 }, '');
    pushed = true;
  } else if (!open && pushed) {
    pushed = false;
    skipPop = true;
    history.back();
  }
}

function closeTop(): void {
  const t = topmost();
  if (t && 'close' in t) t.close();
}

export function initHistory(): void {
  new MutationObserver(sync).observe(layer, { childList: true, subtree: true });
  new MutationObserver(sync).observe(app, { childList: true });
  addEventListener('popstate', () => {
    if (skipPop) { skipPop = false; return; }
    pushed = false;
    closeTop();
    sync(); // re-arm if something (or a locked sheet) is still open
  });
  addEventListener('keydown', e => {
    if (e.key !== 'Escape' || app.querySelector('.lb')) return; // the lightbox handles its own Escape
    closeTop();
  });
}
