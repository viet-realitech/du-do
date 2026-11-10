import { ERAS, EV, type Era } from '../data';
import { S, optOf, familyName, archetype, nameChain } from '../state';
import { CHRONICLE, EPILOGUES, surnameKey } from '../data/surnames';
import { isPlay, rank, endingNow, bigChoices } from '../play';
import { rarityLine } from '../data/endings';
import { wikiFor, probe } from '../wiki';
import { esc, app } from '../ui/dom';
import { SND, buzz } from '../audio';
import { mood } from '../music';
import { fxOn } from '../scene';
import { speak, hush } from '../narration';
import { recording } from '../voice';
import { chrKey, epiKey } from '../speech';

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
  // phim hành trình (toàn màn hình): ảnh thu nhỏ của Commons (…/500px-…) thì thử bản 1280 px trước (Commons chỉ cấp
  // các cỡ chuẩn: 1280 / 1920…; 1600 bị từ chối 400). Ảnh gốc nhỏ hơn thì probe hỏng, dùng lại ảnh thu nhỏ.
  const wide = big ? src.replace(/\/(\d+)px-/, (x, n) => (+n < 1280 ? '/1280px-' : x)) : src;
  if (wide !== src && (await probe(wide, 600))) return wide;
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

const imgHtml = (src: string | null, y: number) => (src ? `<div class="cine-img${y < 1976 ? ' old' : ''}" style="--kx:${Math.random() < 0.5 ? -5 : 5}%;--ky:${Math.round((Math.random() - 0.5) * 6)}%"><img class="bgb" alt="" src="${esc(src)}"><img class="fg" alt="" src="${esc(src)}"></div>` : '<div class="cine-img none"></div>');
/** Ảnh quá nhỏ cho màn hình (phóng hơn ~1,7 lần thì vỡ hạt) hay khác chiều (ảnh ngang trên màn dọc): hiện trọn ảnh, nền là
    chính ảnh ấy làm mờ, không phóng kiểu Ken Burns. */
function fitLowRes(root: ParentNode): void {
  root.querySelectorAll<HTMLImageElement>('.cine-img img.fg').forEach(img => {
    const check = () => {
      if (!img.naturalWidth) return;
      const low = img.naturalWidth < 0.6 * innerWidth * (devicePixelRatio || 1), turned = Math.sign(img.naturalWidth - img.naturalHeight) !== Math.sign(innerWidth - innerHeight);
      if (low || turned) img.parentElement?.classList.add('fit');
    };
    if (img.complete) check(); else img.addEventListener('load', check, { once: true });
  });
}

/** Huỷ màn mở chương đang chạy (không gọi `done` của nó) khi một màn mới thay chỗ. */
let killOpener: (() => void) | null = null;

/** Màn mở chương: ~3,4 s rồi gọi `done`; chạm / Enter / Escape / Back để bỏ qua. Tắt khi Cảnh động tắt hoặc máy giảm chuyển động. */
export function opener(e: Era, done: (played: boolean) => void): void {
  killOpener?.();
  if (!fxOn() || calm.matches) { done(false); return; }
  const prev = ERAS[ERAS.indexOf(e) - 1], y0 = prev ? prev.cy : e.cy - 1;
  const box = document.createElement('div');
  box.className = 'cine';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.setAttribute('aria-label', `Điểm rẽ ${e.n}: ${e.title}`);
  box.innerHTML = `<div class="cine-img none"></div><i class="cine-bar t"></i><i class="cine-bar b"></i>
  <div class="cine-t"><div class="mono">Điểm rẽ ${e.n}/6 · Thế hệ ${e.n}</div><div class="yr">${y0}</div><h1>${esc(e.title)}</h1>
  ${isPlay() ? `<div class="mono fam">${esc(familyName())}</div>` : ''}</div><button class="lnk skip" aria-label="Bỏ qua">Bỏ qua ›</button>`;
  document.body.appendChild(box);
  mood('gate');
  SND.gong();
  buzz([30, 60, 30]);
  let over = false;
  const shut = () => { over = true; app.inert = false; if (killOpener === kill) killOpener = null; box.classList.add('out'); setTimeout(() => box.remove(), 450); };
  const kill = () => { if (!over) shut(); };
  const end = () => { if (over) return; shut(); done(true); };
  killOpener = kill;
  box.onclick = end;
  app.inert = true; // bàn phím / trình đọc màn hình không lọt xuống bản đồ phía sau
  box.querySelector<HTMLElement>('.skip')!.focus({ preventScroll: true });
  requestAnimationFrame(() => box.classList.add('on'));
  void eraImage(e, 1400).then(src => { if (src && !over) { const old = box.querySelector('.cine-img')!; old.outerHTML = imgHtml(src, e.cy); fitLowRes(box); } });
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
/** Độ dài (ms) của bản thu `url` ở tốc độ đọc hiện tại; 0 nếu chưa đọc được metadata sau 1,5 s. */
function clipMs(url: string): Promise<number> {
  return new Promise(res => {
    const a = new Audio(), t = setTimeout(() => res(0), 1500), rate = Math.round(((S.rate || 0.95) / 0.95) * 100) / 100;
    a.preload = 'metadata';
    a.onloadedmetadata = () => { clearTimeout(t); res(isFinite(a.duration) && a.duration > 0 ? (a.duration * 1000) / rate : 0); };
    a.onerror = () => { clearTimeout(t); res(0); };
    a.src = url;
  });
}

interface Slide { y: number; head: string; title: string; lines: string[]; img: Promise<string | null>; say?: [string, string] }

function slides(): Slide[] {
  const out: Slide[] = [];
  for (const e of ERAS) {
    const o = optOf(e);
    if (!o) continue;
    const nx = ERAS[ERAS.indexOf(e) + 1], end = nx ? nx.cy : 2026;
    // dòng gia phả (cả hai luồng, có bản thu), việc lớn nhất dòng họ quyết trong đời ấy (Trò chơi), các lần đổi họ
    const lines = [CHRONICLE[o.id] || o.out];
    const big = isPlay() ? bigChoices(e, 1)[0] : undefined;
    if (big) lines.push(`${big.y} · ${big.out}`);
    for (const n of S.names) if (n.y >= e.cy && n.y < end) lines.push(`${n.y} · ${n.from} đổi thành ${n.to}`);
    out.push({ y: e.cy, head: `Thế hệ ${e.n} · ${e.cy}–${end === 2026 ? 'nay' : end}`, title: `${e.title} · ${o.label}`, lines, img: eraImage(e, 6000, true), say: CHRONICLE[o.id] ? [CHRONICLE[o.id], chrKey(o.id)] : undefined });
  }
  return out;
}

/** Phim hành trình: mỗi thế hệ một cảnh (~5 s), cảnh cuối là kết cục của dòng họ. Chạm phải / trái để sang / lùi. */
export function montage(): void {
  if (document.querySelector('.cine.film:not(.out)')) return; // đang chiếu: không chồng phim thứ hai
  const list = slides();
  if (!list.length) return;
  const { f, e: end, title } = endingNow(), ar = archetype(), skey = S.surname || surnameKey(S.name), epi = EPILOGUES[skey];
  const rar = end ? rarityLine(end.id, f.mode) : null;
  const box = document.createElement('div');
  box.className = 'cine film';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.setAttribute('aria-label', 'Phim hành trình');
  box.innerHTML = `<div class="prog">${list.map(() => '<i><b></b></i>').join('')}<i><b></b></i></div><div class="stage" aria-live="polite"></div>
  <button class="x" aria-label="Đóng">✕</button><button class="pz" aria-label="Tạm dừng" aria-pressed="false">❚❚</button>`;
  document.body.appendChild(box);
  mood('finale');
  requestAnimationFrame(() => box.classList.add('on'));
  const stage = box.querySelector<HTMLElement>('.stage')!, bars = [...box.querySelectorAll<HTMLElement>('.prog b')];
  const per = calm.matches ? 7000 : 5200;
  let i = -1, seq = 0, timer = 0, closed = false, paused = false;
  const pz = box.querySelector<HTMLButtonElement>('.pz')!;
  /** Tạm dừng: đứng ở cảnh này (thanh tiến độ, lời thuyết minh dừng); chạy tiếp: kể lại cảnh này từ đầu. */
  const toggle = () => {
    paused = !paused;
    pz.textContent = paused ? '▶' : '❚❚';
    pz.setAttribute('aria-label', paused ? 'Chạy tiếp' : 'Tạm dừng');
    pz.setAttribute('aria-pressed', String(paused));
    if (paused) {
      seq++; clearTimeout(timer); hush();
      const b = bars[i];
      // đọc độ rộng đang chạy trước khi tắt hiệu ứng (tắt trước thì trình duyệt nhảy luôn tới cuối)
      if (b) { const w = b.parentElement!.getBoundingClientRect().width || 1, now = b.getBoundingClientRect().width; b.style.setProperty('transition', 'none', 'important'); b.style.width = `${(now / w) * 100}%`; }
    } else void show(i);
  };
  const back = document.activeElement as HTMLElement | null;
  const close = () => {
    if (closed) return;
    closed = true;
    clearTimeout(timer);
    hush();
    removeEventListener('keydown', key);
    app.inert = false;
    back?.focus({ preventScroll: true });
    box.classList.add('out');
    setTimeout(() => box.remove(), 450);
    mood(document.querySelector('#layer .ov') ? 'finale' : 'calm'); // phim mở từ màn kết: trả lại nhạc của màn kết
  };
  // Escape / Back do history.ts xử lý (bấm ✕); ở đây chỉ còn phím mũi tên
  const key = (ev: KeyboardEvent) => {
    if (ev.key === 'ArrowRight') void show(i + 1); else if (ev.key === 'ArrowLeft') void show(i - 1);
    // Space: tạm dừng / chạy tiếp (kể cả khi tiêu điểm đang ở ✕, nơi Space mặc định sẽ đóng phim); nút ❚❚ tự xử lý
    else if (ev.key === ' ' && !(ev.target as Element).closest?.('.pz')) { ev.preventDefault(); toggle(); }
  };
  addEventListener('keydown', key);
  app.inert = true;
  box.querySelector<HTMLElement>('.x')!.focus({ preventScroll: true });
  /** Thanh tiến độ của cảnh `j` chạy đầy trong `ms`. */
  /** Thanh tiến độ của cảnh `j` chạy từ chỗ đang đứng tới `to`% trong `ms` (gọi lại được để chỉnh theo bản thu). */
  const fill = (j: number, ms: number, to = 100) => {
    const b = bars[j], w = b.parentElement!.getBoundingClientRect().width || 1;
    const now = Math.min(100, (b.getBoundingClientRect().width / w) * 100);
    b.style.setProperty('transition', 'none', 'important');
    b.style.width = `${now}%`;
    void b.offsetWidth;
    // !important: giảm chuyển động vẫn thấy thanh tiến độ chạy (thước đo thời gian, không phải hiệu ứng)
    b.style.setProperty('transition', `width ${Math.max(0, Math.round(ms))}ms linear`, 'important');
    b.style.width = `${to}%`;
  };
  /** Thuyết minh bằng bản thu (giọng Thanh Bình) nếu có; xong thì sang cảnh. Không có bản thu: chỉ chữ, theo nhịp `wait`.
      Cảnh luôn đứng ít nhất `wait` (bản thu hỏng / mất mạng thì vẫn đủ thời gian đọc chữ). */
  const narrate = (j: number, parts: [string, string][], wait: number) => {
    const me = seq, t0 = performance.now(), rec = S.narr ? parts.filter(([, k]) => recording(k)) : [];
    fill(j, wait);
    if (!rec.length) { timer = window.setTimeout(() => void show(j + 1), wait); return; }
    const live = () => !closed && me === seq;
    // biết độ dài thật của bản thu thì chỉnh thanh cho khớp; không đọc được thì chạy chậm tới 90 %, chờ bản thu đọc xong
    void Promise.all(rec.map(([, k]) => clipMs(recording(k)!))).then(ls => {
      if (!live()) return;
      const total = 700 + ls.reduce((a, b) => a + b, 0) + 300 * (ls.length - 1) + 1200;
      if (ls.every(Boolean)) fill(j, Math.max(total, wait) - (performance.now() - t0));
      else fill(j, wait * 3, 90);
    });
    const next = (n: number) => {
      if (!live()) return;
      if (n >= rec.length) {
        const tail = Math.max(1200, wait - (performance.now() - t0));
        clearTimeout(timer);
        fill(j, tail);
        timer = window.setTimeout(() => void show(j + 1), tail);
        return;
      }
      speak(rec[n][0], () => setTimeout(() => next(n + 1), n + 1 < rec.length ? 300 : 0), false, rec[n][1]);
    };
    timer = window.setTimeout(() => void show(j + 1), wait + 30000); // bảo hiểm nếu bản thu không báo xong
    setTimeout(() => next(0), 700);
  };
  const show = async (j: number) => {
    if (closed) return;
    if (j < 0) j = 0;
    if (j > list.length) { close(); return; }
    i = j;
    if (paused) { paused = false; pz.textContent = '❚❚'; pz.setAttribute('aria-label', 'Tạm dừng'); pz.setAttribute('aria-pressed', 'false'); }
    const me = ++seq;
    clearTimeout(timer);
    hush();
    bars.forEach((b, k) => { b.style.setProperty('transition', 'none', 'important'); b.style.width = k < j ? '100%' : '0%'; });
    SND.page();
    let html: string;
    if (j < list.length) {
      const s = list[j], src = await Promise.race([s.img, new Promise<null>(res => setTimeout(() => res(null), 2200))]);
      if (closed || me !== seq) return;
      html = `${imgHtml(src, s.y)}<div class="cine-t low"><div class="mono">${esc(s.head)}</div><h2>${esc(s.title)}</h2>${s.lines.map((l, k) => `<p style="animation-delay:${0.5 + k * 0.6}s">${esc(l)}</p>`).join('')}</div>`;
    } else {
      // cảnh cuối: tên kết cục và tên họ (cả hai luồng), câu tóm, độ hiếm, hạng gia sản (Trò chơi), lời khép theo họ
      const t = end ? title : ar ? ar[0] : 'Hành trình đã khép';
      const d = end ? end.line : ar ? ar[1] : '';
      html = `<div class="cine-img none"></div><div class="cine-t fin"><div class="mono">${esc(nameChain())} · 1858 – 2026</div>${end ? `<div class="mono seal">Kết cục · ${esc(end.seal)}</div>` : ''}<h1>${esc(t)}</h1>${d ? `<p>${esc(d)}</p>` : ''}
      ${rar ? `<p class="mono" style="animation-delay:1s">${esc(rar.lead)}</p>` : ''}${isPlay() ? `<p class="mono" style="animation-delay:1.2s">${esc(rank()[0])}</p>` : ''}${epi ? `<p style="animation-delay:1.4s">${esc(epi)}</p>` : ''}</div>`;
      SND.fanfare();
    }
    const sc = document.createElement('div');
    sc.className = 'scene-s';
    sc.innerHTML = html;
    stage.querySelectorAll('.scene-s').forEach(o => { o.classList.add('gone'); setTimeout(() => o.remove(), 700); });
    stage.appendChild(sc);
    fitLowRes(sc);
    if (j < list.length) narrate(j, list[j].say ? [list[j].say!] : [], per);
    else {
      const parts: [string, string][] = [];
      if (epi) parts.push([epi, epiKey(skey)]);
      narrate(j, parts, per + 3000);
    }
  };
  box.onclick = ev => {
    const t = ev.target as HTMLElement;
    if (t.closest('.pz')) { toggle(); return; }
    if (t.closest('.x')) { close(); return; }
    // chạm trái: lùi; chạm phải: sang; chạm giữa: tạm dừng / chạy tiếp
    if (ev.clientX < innerWidth / 3) void show(i - 1); else if (ev.clientX > (innerWidth * 2) / 3) void show(i + 1); else toggle();
  };
  void show(0);
}
