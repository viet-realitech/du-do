import { app, layer, clearLayer, ghost } from './dom';
import { renderMain } from '../view';
import { setTab } from '../tabs';

/* Hardware/browser Back and Escape close the topmost overlay instead of leaving the app.
   While anything closable is open we keep exactly one extra history entry. */
type Top = { close: () => void } | { locked: true } | null;

function topmost(): Top {
  // màn mở chương / phim hành trình (gắn vào body, trên mọi lớp): Back / Escape = bỏ qua / đóng
  const cine = document.querySelector<HTMLElement>('body > .cine:not(.out)');
  if (cine) return { close: () => cine.querySelector<HTMLElement>('.x, .skip')!.click() };
  const lb = app.querySelector<HTMLElement>('.lb');
  if (lb) return { close: () => lb.querySelector<HTMLElement>('.back')!.click() };
  const sc = [...layer.querySelectorAll<HTMLElement>('.scrim')].pop();
  if (sc) {
    const own = sc.querySelector<HTMLElement>('[data-a="close-card"], [data-a="gate-later"]'); // thẻ sự kiện: đóng = đi tiếp luồng; điểm rẽ Đọc sử: chọn sau
    // bảng khoá (phải quyết) trừ thẻ tuỳ chọn có lối "Bỏ qua, đi tiếp ›": Back / Escape = bỏ qua
    if (sc.dataset.lock && !(own && own.matches('.lnk'))) return { locked: true };
    return { close: () => (own ? own.click() : ghost(sc)) };
  }
  const ov = layer.querySelector<HTMLElement>('.ov:not(.splash):not(.intro)');
  if (ov) {
    const c = ov.querySelector<HTMLElement>('[data-a="close"]');
    return { close: () => (c ? c.click() : (clearLayer(), renderMain())) };
  }
  if (layer.querySelector('.pane')) return { close: () => setTab('map') };
  // đang xem lại diễn biến một sự kiện (thanh dưới bản đồ): Back = Đóng
  const rb = document.getElementById('replb');
  if (rb) return { close: () => rb.querySelector<HTMLElement>('[data-t=rclose]')!.click() };
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
  new MutationObserver(sync).observe(document.body, { childList: true }); // .cine
  const mw = document.getElementById('mapwrap');
  if (mw) new MutationObserver(sync).observe(mw, { childList: true }); // #replb

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
