import { registerSW } from 'virtual:pwa-register';
import { save } from './state';
import { isTouring } from './tour';
import { speaking } from './narration';
import { cineOpen, layer, toast } from './ui/dom';
import { on } from './ui/actions';

/* Bản mới của ứng dụng (service worker, chế độ 'prompt'): không tự tải lại giữa chừng như autoUpdate trước đây.
   - Ứng dụng trên màn hình chính quay lại từ nền không điều hướng nên không bao giờ tự kiểm tra bản mới: kiểm tra mỗi
     lần hiện lại (visibilitychange) và khoảng mỗi giờ khi đang mở.
   - Có bản mới: chỉ áp dụng (lưu, rồi tải lại) lúc an toàn: ngay sau khi mở hay vừa quay lại app, chưa chạm gì, bản đồ
     chính đang yên (không tour, không trang / bảng nào mở, không màn điện ảnh, không lời kể). Còn lại: một thông báo nhẹ
     "Có bản mới · Tải lại", chạm thì tải lại. Không bao giờ tải lại giữa tour, cảnh trận, phim hay khi đang mở một bảng. */

let update: ((reload?: boolean) => Promise<void>) | null = null;
let reg: ServiceWorkerRegistration | undefined;
let pending = false, applying = false, checked = 0, offered = -1e9;
/** Lần chạm / phím gần nhất, lúc trang hiện lại gần nhất (lúc mở cũng tính). */
let touchedAt = 0, shownAt = performance.now();
const WINDOW = 30_000;

/** Bản đồ chính đang yên: không gì đang chạy hay đang mở trên nó. */
const idle = (): boolean => !isTouring() && !cineOpen() && !layer.children.length && !document.getElementById('replb')
  && !document.querySelector('#mapwrap .lt, #mapwrap .ttl, body > .cine, .lb') && !speaking();
/** Lúc an toàn để tải lại: vừa mở / vừa quay lại (≤ 30 s), chưa chạm gì từ đó, bản đồ yên. */
const safe = (): boolean => !document.hidden && touchedAt < shownAt && performance.now() - shownAt < WINDOW && idle();

function apply(): void {
  if (applying || !update) return;
  // chống vòng lặp: tự áp dụng tối đa một lần trong 5 phút (bản mới hỏng không kéo app vào tải lại liên tục)
  try {
    if (Date.now() - +(sessionStorage.getItem('dudo-sw-applied') || 0) < 300_000) { offer(); return; }
    sessionStorage.setItem('dudo-sw-applied', String(Date.now()));
  } catch { /* riêng tư */ }
  reload();
}
/** Lưu rồi cho bản mới nắm quyền: SKIP_WAITING → bản mới nắm quyền (controllerchange) → tải lại (initPwa). */
function reload(): void {
  if (!update) return;
  applying = true;
  save();
  void update(true);
  setTimeout(() => { applying = false; }, 10_000); // không có bản nào đang chờ (đã nắm quyền nơi khác): thôi
}

function offer(): void {
  if (applying || performance.now() - offered < 60_000) return;
  offered = performance.now();
  toast('<span style="flex:1">Có bản mới</span><button class="chip" data-a="sw-reload">Tải lại</button>', undefined, false, 9000);
}

function decide(): void {
  if (!pending) return;
  if (safe()) apply(); else offer();
}

on('sw-reload', reload);

function check(): Promise<void> {
  if (!reg || !navigator.onLine) return Promise.resolve();
  checked = Date.now();
  return reg.update().then(() => undefined, () => { /* mất mạng / máy chủ: lần sau */ });
}

/** Chờ bản đang cài (nếu có) cài xong hay hỏng, tối đa 30 s. */
function settled(): Promise<void> {
  const w = reg?.installing;
  if (!w) return Promise.resolve();
  return new Promise(res => {
    const done = () => { clearTimeout(t); w.removeEventListener('statechange', f); res(); };
    const f = () => { if (w.state !== 'installing') done(); };
    const t = setTimeout(done, 30_000);
    w.addEventListener('statechange', f);
  });
}

export function initPwa(): void {
  if (!('serviceWorker' in navigator)) return;
  for (const t of ['pointerdown', 'keydown']) addEventListener(t, () => { touchedAt = performance.now(); }, true);
  update = registerSW({
    immediate: true,
    onRegisteredSW(_url, r) {
      reg = r;
      setInterval(() => { if (!document.hidden) void check(); }, 60 * 60 * 1000);
    },
    onNeedRefresh() { pending = true; decide(); },
    onNeedReload() { /* tải lại ở controllerchange dưới đây */ },
  });
  // tự tải lại khi bản mới đã nắm quyền theo yêu cầu của trang này; virtual:pwa-register chỉ làm thế khi trang đã có
  // service worker lúc mở (lần cài đầu thì không: bản mới chiếm trang mà mã cũ vẫn chạy)
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (applying) location.reload(); });
  // quay lại app: kiểm tra trước, quyết sau. Bản đang chờ có thể đã cũ (một bản mới hơn ra lúc app ở nền): áp dụng nó thì
  // trang tải lại vào bản cũ rồi lập tức hỏi lại. Chờ bản mới nhất cài xong, rồi áp dụng một lần (workbox-window chỉ báo
  // bản mới đầu tiên từ nơi khác, nên tự xem có bản đang chờ không)
  let shown = 0;
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) return;
    shownAt = performance.now();
    const me = ++shown;
    void check().then(settled).then(() => {
      if (me !== shown || document.hidden) return;
      if (reg?.waiting) pending = true;
      decide();
    });
  });
}

/** Bảng chẩn đoán: trạng thái service worker và bản mới đang chờ. */
export const swStats = () => ({
  supported: 'serviceWorker' in navigator,
  controlled: !!navigator.serviceWorker?.controller,
  active: reg?.active?.state || '',
  waiting: !!reg?.waiting,
  installing: !!reg?.installing,
  pending,
  lastCheck: checked ? new Date(checked).toISOString() : '',
});
