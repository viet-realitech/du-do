import { ERAS, EV, type Era } from '../data';
import { S, optOf, familyName, archetype } from '../state';
import { CHRONICLE, EPILOGUES, surnameKey } from '../data/surnames';
import { isPlay, lineage, rank } from '../play';
import { wikiFor, probe } from '../wiki';
import { esc } from '../ui/dom';
import { SND, buzz } from '../audio';
import { mood } from '../music';
import { fxOn } from '../scene';

/* Điện ảnh: màn mở chương ở mỗi điểm rẽ (ảnh tư liệu chạy chậm, năm đếm lên, tên chương) và "phim hành trình" ở
   kết cục (mỗi thế hệ một cảnh: ảnh, năm, dòng gia phả). Chạm để bỏ qua / sang cảnh. */

const calm = matchMedia('(prefers-reduced-motion: reduce)');
/** Sự kiện đại diện cho mỗi điểm rẽ (ảnh của màn mở chương và của phim hành trình). */
const KEY_EV: Record<string, string> = { e1: 'dn58', e2: 'cv85', e3: 'yb30', e4: 'ng45', e5: 'dbp', e6: 'sg75' };

const cache = new Map<string, Promise<string | null>>();
async function load(e: Era, big: boolean): Promise<string | null> {
  const v = EV.find(x => x.id === KEY_EV[e.id]);
  if (!v) return null;
  const w = await wikiFor(v).catch(() => null);
  const m = w?.media.find(x => x.type === 'image' && !x.bad);
  if (!m) return null;
  const src = big ? m.src : m.thumb || m.src;
  return (await probe(src, 120)) ? src : null;
}
/** Tải sẵn ảnh tư liệu của chương (một lần; gọi trước khi cần: lúc tour chương trước chạy, lúc mở màn kết). */
export function preloadEra(e: Era | undefined, big = false): Promise<string | null> {
  if (!e) return Promise.resolve(null);
  const k = e.id + (big ? ':b' : '');
  if (!cache.has(k)) cache.set(k, load(e, big).catch(() => null));
  return cache.get(k)!;
}
/** Ảnh tư liệu của chương (ảnh đầu bài Wikipedia của sự kiện đại diện), hoặc null nếu chưa có trong `ms`. */
export function eraImage(e: Era, ms: number, big = false): Promise<string | null> {
  return Promise.race([preloadEra(e, big), new Promise<null>(res => setTimeout(() => res(null), ms))]);
}

const imgHtml = (src: string | null, y: number) => (src ? `<div class="cine-img${y < 1976 ? ' old' : ''}" style="--kx:${Math.random() < 0.5 ? -5 : 5}%;--ky:${Math.round((Math.random() - 0.5) * 6)}%"><img alt="" src="${esc(src)}"></div>` : '<div class="cine-img none"></div>');

/** Màn mở chương: ~3,4 s rồi gọi `done`; chạm để bỏ qua. Tắt khi Cảnh động tắt hoặc máy giảm chuyển động. */
export function opener(e: Era, done: (played: boolean) => void): void {
  if (!fxOn() || calm.matches) { done(false); return; }
  const prev = ERAS[ERAS.indexOf(e) - 1], y0 = prev ? prev.cy : e.cy - 1;
  const box = document.createElement('div');
  box.className = 'cine';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-label', `Điểm rẽ ${e.n}: ${e.title}`);
  box.innerHTML = `<div class="cine-img none"></div><i class="cine-bar t"></i><i class="cine-bar b"></i>
  <div class="cine-t"><div class="mono">Điểm rẽ ${e.n}/6 · Thế hệ ${e.n}</div><div class="yr">${y0}</div><h1>${esc(e.title)}</h1>
  ${isPlay() ? `<div class="mono fam">${esc(familyName())}</div>` : ''}</div><button class="lnk skip" aria-label="Bỏ qua">Bỏ qua ›</button>`;
  document.body.appendChild(box);
  mood('gate');
  SND.gong();
  buzz([30, 60, 30]);
  let over = false;
  const end = () => { if (over) return; over = true; box.classList.add('out'); setTimeout(() => box.remove(), 450); done(true); };
  box.onclick = end;
  requestAnimationFrame(() => box.classList.add('on'));
  void eraImage(e, 1400).then(src => { if (src && !over) { const old = box.querySelector('.cine-img')!; old.outerHTML = imgHtml(src, e.cy); } });
  // năm đếm từ điểm rẽ trước lên năm của điểm rẽ này
  const yr = box.querySelector<HTMLElement>('.yr')!, t0 = performance.now(), dur = 1500;
  const tick = (now: number) => {
    if (over) return;
    const k = Math.min(1, (now - t0) / dur), q = 1 - Math.pow(1 - k, 3);
    yr.textContent = String(Math.round(y0 + (e.cy - y0) * q));
    if (k < 1) requestAnimationFrame(tick); else { yr.classList.add('hit'); SND.stamp(); }
  };
  setTimeout(() => requestAnimationFrame(tick), 350);
  setTimeout(end, 3600);
}

/* ---------- phim hành trình ---------- */
interface Slide { y: number; head: string; title: string; lines: string[]; img: Promise<string | null> }

function slides(): Slide[] {
  const out: Slide[] = [];
  for (const e of ERAS) {
    const o = optOf(e);
    if (!o) continue;
    const nx = ERAS[ERAS.indexOf(e) + 1], end = nx ? nx.cy : 2026;
    const lines = [isPlay() ? CHRONICLE[o.id] || o.out : o.out];
    for (const n of S.names) if (n.y >= e.cy && n.y < end) lines.push(`${n.y} · ${n.from} đổi thành ${n.to}`);
    out.push({ y: e.cy, head: `Thế hệ ${e.n} · ${e.cy}–${end === 2026 ? 'nay' : end}`, title: `${e.title} · ${o.label}`, lines, img: eraImage(e, 6000, true) });
  }
  return out;
}

/** Phim hành trình: mỗi thế hệ một cảnh (~5 s), cảnh cuối là dấu ấn dòng họ. Chạm phải / trái để sang / lùi. */
export function montage(): void {
  const list = slides();
  if (!list.length) return;
  const lin = isPlay() ? lineage() : null, ar = archetype(), epi = EPILOGUES[S.surname || surnameKey(S.name)];
  const box = document.createElement('div');
  box.className = 'cine film';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-label', 'Phim hành trình');
  box.innerHTML = `<div class="prog">${list.map(() => '<i><b></b></i>').join('')}<i><b></b></i></div><div class="stage"></div>
  <button class="x" aria-label="Đóng">✕</button>`;
  document.body.appendChild(box);
  mood('finale');
  requestAnimationFrame(() => box.classList.add('on'));
  const stage = box.querySelector<HTMLElement>('.stage')!, bars = [...box.querySelectorAll<HTMLElement>('.prog b')];
  const per = calm.matches ? 7000 : 5200;
  let i = -1, timer = 0, closed = false;
  const close = () => { if (closed) return; closed = true; clearTimeout(timer); box.classList.add('out'); setTimeout(() => box.remove(), 450); mood('calm'); };
  const show = async (j: number) => {
    if (closed) return;
    if (j < 0) j = 0;
    if (j > list.length) { close(); return; }
    i = j;
    clearTimeout(timer);
    bars.forEach((b, k) => { b.style.transition = 'none'; b.style.width = k < j ? '100%' : '0%'; });
    void bars[j].offsetWidth;
    bars[j].style.transition = `width ${per}ms linear`;
    bars[j].style.width = '100%';
    SND.page();
    let html: string;
    if (j < list.length) {
      const s = list[j], src = await Promise.race([s.img, new Promise<null>(res => setTimeout(() => res(null), 2200))]);
      if (closed || i !== j) return;
      html = `${imgHtml(src, s.y)}<div class="cine-t low"><div class="mono">${esc(s.head)}</div><h2>${esc(s.title)}</h2>${s.lines.map((l, k) => `<p style="animation-delay:${0.5 + k * 0.6}s">${esc(l)}</p>`).join('')}</div>`;
    } else {
      const t = lin ? lin.title : ar ? ar[0] : 'Hành trình đã khép';
      const d = lin ? lin.text : ar ? ar[1] : '';
      html = `<div class="cine-img none"></div><div class="cine-t"><div class="mono">${isPlay() ? esc(familyName()) + ' · ' : ''}1858 – 2026</div><h1>${esc(t)}</h1>${d ? `<p>${esc(d)}</p>` : ''}
      ${isPlay() ? `<p class="mono" style="animation-delay:1s">${esc(rank()[0])}</p>` : ''}${epi && isPlay() ? `<p style="animation-delay:1.4s">${esc(epi)}</p>` : ''}</div>`;
      SND.fanfare();
    }
    const sc = document.createElement('div');
    sc.className = 'scene-s';
    sc.innerHTML = html;
    stage.querySelectorAll('.scene-s').forEach(o => { o.classList.add('gone'); setTimeout(() => o.remove(), 700); });
    stage.appendChild(sc);
    timer = window.setTimeout(() => void show(j + 1), j < list.length ? per : per + 3000);
  };
  box.onclick = ev => {
    const t = ev.target as HTMLElement;
    if (t.closest('.x')) { close(); return; }
    void show(ev.clientX < innerWidth / 3 ? i - 1 : i + 1);
  };
  const key = (ev: KeyboardEvent) => { if (closed) { removeEventListener('keydown', key); return; } if (ev.key === 'Escape') close(); else if (ev.key === 'ArrowRight') void show(i + 1); else if (ev.key === 'ArrowLeft') void show(i - 1); };
  addEventListener('keydown', key);
  void show(0);
}
