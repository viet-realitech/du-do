import { app, esc } from '../ui/dom';
import { SND } from '../audio';
import { cachedWiki, commonsPage, mediaCaption, videoUrl, type Media } from '../wiki';

/* Fullscreen media viewer: swipe ←/→ to page, swipe ↓ to close, pinch / double-tap / wheel to zoom. */
export async function openMedia(id: string, start: number): Promise<void> {
  const w = await cachedWiki(id);
  if (!w) return;
  const M = w.media.filter(m => !m.bad);
  if (!M.length) return;
  let idx = Math.max(0, M.indexOf(w.media[start]));
  let sc = 1, tx = 0, ty = 0;
  let img: HTMLImageElement | null = null;

  const d = document.createElement('div');
  d.className = 'lb';
  d.setAttribute('role', 'dialog');
  d.setAttribute('aria-modal', 'true');
  d.innerHTML = `<div class="lbtop"><button class="back" aria-label="Đóng">✕</button><span class="mono" data-r="n" style="color:#aaa"></span><a data-r="src" class="mono" target="_blank" rel="noopener">Nguồn ↗</a></div>
  <div class="lbstage"><div class="lbtrack"></div></div>
  <button class="lbnav l" aria-label="Trước">‹</button><button class="lbnav r" aria-label="Sau">›</button>
  <div class="lbcap" data-r="cap"></div><div class="lbdots" data-r="dots"></div><div class="lbhint">Vuốt để chuyển · chụm hoặc chạm đúp để phóng to</div>`;
  app.appendChild(d);
  const q = <T extends HTMLElement = HTMLElement>(s: string) => d.querySelector<T>(s)!;
  const T = q('.lbtrack'), stage = q('.lbstage');
  const navL = q<HTMLButtonElement>('.lbnav.l'), navR = q<HTMLButtonElement>('.lbnav.r');

  const apply = (anim: boolean) => {
    if (!img) return;
    img.style.transition = anim ? 'transform .25s' : 'none';
    img.style.transform = `translate(${tx}px,${ty}px) scale(${sc})`;
  };
  const reset = () => { sc = 1; tx = 0; ty = 0; apply(true); };
  const fail = (m: Media) => {
    img = null;
    T.innerHTML = `<div class="lbph"><div class="mono">Tư liệu tạm thời không tải được</div><a href="${esc(commonsPage(m))}" target="_blank" rel="noopener">Mở trên Commons ↗</a></div>`;
  };

  function render(): void {
    const m = M[idx];
    sc = 1; tx = 0; ty = 0;
    q('[data-r="n"]').textContent = `${idx + 1} / ${M.length}`;
    q<HTMLAnchorElement>('[data-r="src"]').href = commonsPage(m);
    q('[data-r="cap"]').textContent = mediaCaption(m);
    q('[data-r="dots"]').innerHTML = M.length > 1 ? M.slice(0, 12).map((_, j) => `<i class="${j === idx ? 'on' : ''}"></i>`).join('') : '';
    navL.disabled = idx === 0;
    navR.disabled = idx === M.length - 1;
    if (m.type === 'video') {
      img = null;
      T.innerHTML = `<div class="lbvid"><img src="${esc(m.thumb || m.src)}" alt=""><button class="lbbig" aria-label="Phát video">▶</button></div>`;
      T.querySelector('img')!.onerror = () => fail(m);
      q('.lbbig').onclick = e => { e.stopPropagation(); playVid(m); };
    } else {
      T.innerHTML = `<img src="${esc(m.src)}" alt="${esc(mediaCaption(m))}" draggable="false">`;
      img = T.querySelector('img');
      img!.onerror = () => fail(m);
    }
  }

  async function playVid(m: Media): Promise<void> {
    T.innerHTML = '<div class="mono" style="color:#aaa">Đang tải video…</div>';
    try {
      const url = await videoUrl(m);
      T.innerHTML = `<video src="${esc(url)}" controls autoplay playsinline poster="${esc(m.thumb || m.src)}"></video>`;
      T.querySelector('video')!.onerror = () => fail(m);
    } catch {
      fail(m);
    }
  }

  function go(dir: number): void {
    const n = idx + dir;
    if (n < 0 || n >= M.length) { T.style.transition = 'transform .2s'; T.style.transform = 'translateX(0)'; return; }
    T.style.transition = 'transform .2s ease-in, opacity .2s';
    T.style.transform = `translateX(${-dir * 100}%)`;
    T.style.opacity = '0';
    setTimeout(() => {
      idx = n;
      render();
      T.style.transition = 'none';
      T.style.transform = `translateX(${dir * 40}%)`;
      void T.offsetWidth;
      T.style.transition = 'transform .25s ease-out, opacity .25s';
      T.style.transform = 'translateX(0)';
      T.style.opacity = '1';
    }, 200);
    SND.tick();
  }

  const close = () => { d.remove(); document.removeEventListener('keydown', kd); };
  const kd = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') go(-1);
    else if (e.key === 'ArrowRight') go(1);
    else if (e.key === 'Escape') close();
  };
  document.addEventListener('keydown', kd);
  q('.back').onclick = close;
  navL.onclick = () => go(-1);
  navR.onclick = () => go(1);

  // Gestures
  type St = { mode: 'pan' | 'swipe'; x: number; y: number; tx: number; ty: number } | { mode: 'pinch'; d: number; sc: number };
  const ptrs = new Map<number, { x: number; y: number }>();
  let st: St | null = null, lastTap = 0;
  stage.addEventListener('pointerdown', e => {
    if ((e.target as Element).closest('video,.lbbig')) return;
    stage.setPointerCapture(e.pointerId);
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (ptrs.size === 1) {
      st = { x: e.clientX, y: e.clientY, tx, ty, mode: sc > 1.02 ? 'pan' : 'swipe' };
      const now = Date.now();
      if (now - lastTap < 280 && img) {
        if (sc > 1.02) reset();
        else {
          sc = 2.5;
          const r = stage.getBoundingClientRect();
          tx = (r.left + r.width / 2 - e.clientX) * 1.5;
          ty = (r.top + r.height / 2 - e.clientY) * 1.5;
          apply(true);
        }
        st = null;
      }
      lastTap = now;
    } else if (ptrs.size === 2 && img) {
      const [a, b] = [...ptrs.values()];
      st = { mode: 'pinch', d: Math.hypot(a.x - b.x, a.y - b.y), sc };
    }
  });
  stage.addEventListener('pointermove', e => {
    if (!ptrs.has(e.pointerId) || !st) return;
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (st.mode === 'pinch') {
      if (ptrs.size !== 2) return;
      const [a, b] = [...ptrs.values()];
      sc = Math.max(1, Math.min(5, (st.sc * Math.hypot(a.x - b.x, a.y - b.y)) / st.d));
      apply(false);
    } else if (st.mode === 'pan') {
      tx = st.tx + e.clientX - st.x;
      ty = st.ty + e.clientY - st.y;
      apply(false);
    } else {
      const dx = e.clientX - st.x, dy = e.clientY - st.y;
      T.style.transition = 'none';
      if (Math.abs(dy) > Math.abs(dx) && dy > 0) {
        T.style.transform = `translateY(${dy}px)`;
        d.style.background = `rgba(5,4,3,${Math.max(0.3, 1 - dy / 400)})`;
      } else T.style.transform = `translateX(${dx}px)`;
    }
  });
  const up = (e: PointerEvent) => {
    if (!ptrs.has(e.pointerId)) return;
    ptrs.delete(e.pointerId);
    if (!st) return;
    if (st.mode === 'swipe' && ptrs.size === 0) {
      const dx = e.clientX - st.x, dy = e.clientY - st.y;
      d.style.background = '';
      if (dy > 110 && Math.abs(dy) > Math.abs(dx)) close();
      else if (Math.abs(dx) > 60) go(dx < 0 ? 1 : -1);
      else { T.style.transition = 'transform .2s'; T.style.transform = 'translate(0,0)'; }
    }
    if (st.mode === 'pinch' && sc < 1.05) reset();
    if (ptrs.size === 0 || st.mode === 'pinch') st = null;
  };
  stage.addEventListener('pointerup', up);
  stage.addEventListener('pointercancel', up);
  stage.addEventListener('wheel', e => {
    if (!img) return;
    e.preventDefault();
    sc = Math.max(1, Math.min(5, sc * Math.exp(-e.deltaY * 0.002)));
    if (sc < 1.02) { sc = 1; tx = 0; ty = 0; }
    apply(false);
  }, { passive: false });
  render();
}
