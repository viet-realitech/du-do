import { ERAS, EV, type Era } from '../data';
import { S, optOf, familyName, archetype, nameChain } from '../state';
import { CHRONICLE, EPILOGUES, surnameKey } from '../data/surnames';
import { isPlay, rank, endingNow, bigChoices, factsFromState } from '../play';
import { rarityLine, chronLine } from '../data/endings';
import { wikiFor } from '../wiki';
import { esc, app } from '../ui/dom';
import { icon } from '../ui/icons';
import { watch } from '../ui/quality';
import { SND, buzz } from '../audio';
import { mood } from '../music';
import { fxOn } from '../scene';
import { speak, hush } from '../narration';
import { recording } from '../voice';
import { chrKey, epiKey } from '../speech';

/* Điện ảnh: màn mở chương ở mỗi điểm rẽ (ảnh tư liệu, năm đếm lên, tên chương) và "phim hành trình" ở kết cục (mỗi thế
   hệ một cảnh: ảnh, năm, dòng gia phả). Chạm để bỏ qua / sang cảnh.
   Như phòng xem tư liệu của kho lưu trữ: nền tối, ảnh là một bản in đặt trong lề giấy bồi (passe-partout), trọn khung,
   đúng tỉ lệ, không phóng quá cỡ thật 1,5 lần; chữ nằm trên tấm nhãn riêng (bên phải khi màn ngang, bên dưới khi màn
   dọc), không bao giờ đè lên ảnh. Không nền nhoè, không dải đen che mép ảnh. */

const calm = matchMedia('(prefers-reduced-motion: reduce)');
/** Sự kiện đại diện cho mỗi điểm rẽ (ảnh của màn mở chương và của phim hành trình). */
const KEY_EV: Record<string, string> = { e1: 'dn58', e2: 'cv85', e3: 'yb30', e4: 'ng45', e5: 'dbp', e6: 'sg75' };
/** Chú thích ảnh tư liệu của từng chương, theo tên tập tin trên Commons (bài Wikipedia đổi ảnh đầu bài thì dùng chú
    thích của bài, không thì chỉ ghi nguồn). `true`: ảnh chụp thời nay, không giả màu phim cũ. */
const KEY_CAP: Record<string, [string, boolean?]> = {
  'french ships at danang 1858.jpg': ['Tàu chiến Pháp ở Đà Nẵng, 1858 · tranh khắc thời ấy'],
  'ngomon2.jpg': ['Ngọ Môn, Kinh thành Huế · ảnh chụp thời nay', true],
  'portraits of 13 nationalists executed in yen-bay on 17 june 1930.png': ['Mười ba đảng viên Việt Nam Quốc dân Đảng bị xử tử ở Yên Bái, 17.6.1930 · trang báo đương thời'],
  'cách mạng tháng 8 b.jpg': ['Người Hà Nội tiến vào Phủ Khâm sai Bắc Bộ, 19.8.1945'],
  'victory in battle of dien bien phu.jpg': ['Lá cờ trên nóc hầm De Castries, 1954 · cảnh quay lại cho phim tư liệu của Roman Karmen'],
  'tank 843 and tank 390 at the gates of independence palace.jpg': ['Xe tăng 843 và 390 ở cổng Dinh Độc Lập, 30.4.1975'],
};
const fileKey = (s: string) => decodeURIComponent(s).replace(/_/g, ' ').replace(/^(File|Tập tin|Image|Hình):/i, '').trim().toLowerCase();

/** Ảnh tư liệu đã tải xong: địa chỉ, cỡ thật (dựng khung đúng tỉ lệ ngay, không chờ sự kiện load, không đo lại) và chú thích. */
export interface Pic { src: string; w: number; h: number; cap: string; now?: boolean }

/** Bề ngang ảnh Commons cần: cạnh dài màn hình × ~0,62 (phần dành cho bản in) × mật độ điểm ảnh (tính tối đa 2).
    Commons chỉ cấp các cỡ chuẩn (960 / 1280 / 1920…; cỡ lạ như 1600 bị từ chối 400). */
function want(): number {
  const need = Math.max(innerWidth, innerHeight) * 0.62 * Math.min(2, devicePixelRatio || 1);
  return need > 1280 ? 1920 : need > 960 ? 1280 : 960;
}
/** Tải và giải mã sẵn ảnh (cảnh chuyển không khựng vì giải mã ảnh 1920 px); null nếu hỏng hay nhỏ hơn `minW`. */
function grab(src: string, minW: number, cap: [string, boolean?]): Promise<Pic | null> {
  return new Promise(res => {
    const im = new Image();
    im.onload = () => {
      if (im.naturalWidth < minW) { res(null); return; }
      const p: Pic = { src, w: im.naturalWidth, h: im.naturalHeight, cap: cap[0], now: cap[1] };
      (im.decode ? im.decode() : Promise.resolve()).then(() => res(p), () => res(p));
    };
    im.onerror = () => res(null);
    im.src = src;
  });
}
async function load(e: Era): Promise<Pic | null> {
  const v = EV.find(x => x.id === KEY_EV[e.id]);
  if (!v) return null;
  const w = await wikiFor(v).catch(() => null);
  const m = w?.media.find(x => x.type === 'image' && !x.bad);
  if (!m) return null;
  const cap = KEY_CAP[fileKey(m.file)] || [m.cap ? m.cap.replace(/\s+/g, ' ').trim() : 'Ảnh tư liệu'];
  // ảnh thu nhỏ của Commons (…/960px-…): thử cỡ chuẩn lớn hơn mà màn hình cần; ảnh gốc nhỏ hơn cỡ ấy thì Commons báo lỗi,
  // lùi một cỡ, cuối cùng dùng chính ảnh của bài
  const n = +(m.src.match(/\/(\d+)px-[^/]+$/)?.[1] || 0), top = want();
  for (const c of [1920, 1280]) {
    if (!n || c <= n || c > top) continue;
    const p = await grab(m.src.replace(/\/\d+px-([^/]+)$/, `/${c}px-$1`), 600, cap);
    if (p) return p;
  }
  return grab(m.src, 120, cap);
}
const cache = new Map<string, Promise<Pic | null>>();
/** Kết quả đã có (kể cả không có ảnh): màn mở chương dựng khung ngay, không phải chờ. */
const got = new Map<string, Pic | null>();
/** Tải sẵn ảnh tư liệu của chương (một lần; gọi trước khi cần: lúc tour chương trước chạy, lúc mở màn kết). */
export function preloadEra(e: Era | undefined): Promise<Pic | null> {
  if (!e) return Promise.resolve(null);
  if (!cache.has(e.id)) cache.set(e.id, load(e).catch(() => null).then(p => { got.set(e.id, p); return p; }));
  return cache.get(e.id)!;
}
/** Ảnh tư liệu của chương (ảnh đầu bài Wikipedia của sự kiện đại diện), hoặc null nếu chưa có trong `ms`. */
export function eraImage(e: Era, ms: number): Promise<Pic | null> {
  return Promise.race([preloadEra(e), new Promise<null>(res => setTimeout(() => res(null), ms))]);
}
// ván mới: màn mở chương đầu tiên đến ngay sau phần giới thiệu, tải sẵn ảnh của nó khi máy rảnh
if (!S.picks.e1) setTimeout(() => void preloadEra(ERAS[0]), 4000);

/** Bản in: ảnh trọn khung trong lề giấy bồi, dòng chú thích và nguồn ở lề dưới. Bề rộng tính bằng CSS theo ô chứa (đơn vị
    cq), tỉ lệ thật của ảnh (--ar) và cỡ thật (--nw): ảnh nhỏ thành bản in nhỏ, không phóng vỡ hạt. */
const printHtml = (p: Pic, y: number) => `<div class="pic" style="--ar:${(p.w / p.h).toFixed(4)};--nw:${p.w}"><figure class="print${y < 1976 && !p.now ? ' old' : ''}" style="--kx:${Math.random() < 0.5 ? -1.5 : 1.5}%;--ky:${Math.round((Math.random() - 0.5) * 2)}%">
  <div class="win"><img alt="" decoding="async" src="${esc(p.src)}"></div><figcaption><span>${esc(p.cap)}</span><span class="cr">Wikimedia Commons</span></figcaption></figure></div>`;
/** Nút đóng (✕) vẽ bằng nét như bộ biểu tượng, không dùng ký tự (lệch tâm tuỳ phông). */
const X_ICON = '<svg class="i" width="18" height="18" viewBox="0 0 20 20" aria-hidden="true"><path d="M5 5l10 10M15 5L5 15" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';

/** Huỷ màn mở chương đang chạy (không gọi `done` của nó) khi một màn mới thay chỗ. */
let killOpener: (() => void) | null = null;

/** Màn mở chương: ~3,4 s rồi gọi `done`; chạm / Enter / Escape / Back để bỏ qua. Tắt khi Cảnh động tắt hoặc máy giảm chuyển động. */
export function opener(e: Era, done: (played: boolean) => void): void {
  killOpener?.();
  if (!fxOn() || calm.matches) { done(false); return; }
  const prev = ERAS[ERAS.indexOf(e) - 1], y0 = prev ? prev.cy : e.cy - 1;
  const box = document.createElement('div');
  box.className = 'cine op';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.setAttribute('aria-label', `Điểm rẽ ${e.n}: ${e.title}`);
  box.innerHTML = `<button class="lnk skip" aria-label="Bỏ qua">Bỏ qua ›</button>`;
  document.body.appendChild(box);
  mood('gate');
  SND.gong();
  buzz([30, 60, 30]);
  let over = false;
  const fade = () => { box.classList.add('out'); setTimeout(() => box.remove(), 450); };
  const shut = () => { over = true; app.inert = false; if (killOpener === kill) killOpener = null; };
  const kill = () => { if (!over) { shut(); fade(); } };
  // hết màn: dựng bảng chọn hướng ngay dưới màn còn đặc, hai khung hình sau mới mờ màn đi; lần vẽ đầu của bảng (cả trang
  // chữ và nền tối) không rơi vào giữa lúc màn đang mờ dần (một khung ~300 ms trên CPU chậm)
  const end = () => { if (over) return; shut(); done(true); requestAnimationFrame(() => requestAnimationFrame(fade)); };
  killOpener = kill;
  box.onclick = end;
  app.inert = true; // bàn phím / trình đọc màn hình không lọt xuống bản đồ phía sau
  box.querySelector<HTMLElement>('.skip')!.focus({ preventScroll: true });
  // ảnh đã tải sẵn (tour chương trước đã tải): dựng khung ngay; chưa xong thì chờ tối đa 0,3 s rồi dựng không ảnh (ảnh đến
  // muộn không chen vào giữa màn, vì khung bản in và tấm nhãn đã đặt chỗ)
  const pic = got.has(e.id) ? Promise.resolve(got.get(e.id) ?? null) : eraImage(e, 300);
  void pic.then(p => {
    if (over) return;
    const fr = document.createElement('div');
    fr.className = 'frame' + (p ? '' : ' bare');
    fr.innerHTML = `${p ? printHtml(p, e.cy) : ''}<div class="plate"><div class="mono k">Điểm rẽ ${e.n}/6 · Thế hệ ${e.n}</div><div class="yr">${y0}</div><h1>${esc(e.title)}</h1>${isPlay() ? `<div class="mono fam">${esc(familyName())}</div>` : ''}</div>`;
    box.prepend(fr);
    requestAnimationFrame(() => box.classList.add('on'));
    // năm đếm từ điểm rẽ trước lên năm của điểm rẽ này (lớp riêng: không vẽ lại bản in mỗi khung)
    const yr = fr.querySelector<HTMLElement>('.yr')!, dur = 1500;
    let t0 = 0;
    const tick = (now: number) => {
      if (over) return;
      const k = Math.min(1, Math.max(0, (now - t0) / dur)), q = 1 - Math.pow(1 - k, 3);
      yr.textContent = String(Math.round(y0 + (e.cy - y0) * q));
      if (k < 1) requestAnimationFrame(tick); else { yr.classList.add('hit'); SND.stamp(); }
    };
    setTimeout(() => { t0 = performance.now(); requestAnimationFrame(tick); watch(dur); }, 350); // đo khung hình lúc năm đếm lên (ui/quality.ts)
    setTimeout(end, 3600);
  });
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

interface Slide { y: number; head: string; title: string; pick: string; lines: string[]; img: Promise<Pic | null>; say?: [string, string] }

function slides(): Slide[] {
  const f = factsFromState(); // dòng gia phả theo quê (data/endings.ts chronLine)
  const out: Slide[] = [];
  for (const e of ERAS) {
    const o = optOf(e);
    if (!o) continue;
    const nx = ERAS[ERAS.indexOf(e) + 1], end = nx ? nx.cy : 2026;
    // dòng gia phả (cả hai luồng, có bản thu), việc lớn nhất dòng họ quyết trong đời ấy (Trò chơi), các lần đổi họ
    const chron = chronLine(o.id, f, CHRONICLE), lines = [chron];
    const big = isPlay() ? bigChoices(e, 1)[0] : undefined;
    if (big) lines.push(`${big.y} · ${big.out}`);
    for (const n of S.names) if (n.y >= e.cy && n.y < end) lines.push(`${n.y} · ${n.from} đổi thành ${n.to}`);
    out.push({ y: e.cy, head: `Thế hệ ${e.n} · ${e.cy}–${end === 2026 ? 'nay' : end}`, title: e.title, pick: o.label, lines, img: eraImage(e, 6000), say: chron === CHRONICLE[o.id] ? [chron, chrKey(o.id)] : undefined }); // câu đã chỉnh theo quê: không có bản thu
  }
  return out;
}

/** Tấm cuối của phim: tờ hồ sơ khép lại, viền đôi như khung bản đồ. Tên họ, dấu kết cục, tên kết cục, câu tóm, dải sáu
    điểm rẽ (năm, đoạn thước, hướng đã chọn), độ hiếm, hạng gia sản (Trò chơi), lời khép theo họ, chữ "Hết". */
function endPlate(): string {
  const { f, e: end, title } = endingNow(), ar = archetype(), rar = end ? rarityLine(end.id, f.mode) : null;
  const skey = S.names.length ? surnameKey(S.names[0].from) : S.surname || surnameKey(S.name), epi = EPILOGUES[skey];
  const t = end ? title : ar ? ar[0] : 'Hành trình đã khép';
  const d = end ? end.line : ar ? ar[1] : '';
  const strip = ERAS.map(e => { const o = optOf(e); return `<li${o ? '' : ' class="none"'}><b>${e.cy}</b><i></i><span>${o ? esc(o.label) : '—'}</span></li>`; }).join('');
  return `<div class="plate fin"><div class="mono k">Hồ sơ dòng họ · ${esc(nameChain())} · 1858 – 2026</div>
   ${end ? `<span class="stamp">Kết cục · ${esc(end.seal)}</span>` : ''}<h1>${esc(t)}</h1>${d ? `<p class="d">${esc(d)}</p>` : ''}
   <ol class="strip" aria-label="Sáu điểm rẽ và hướng dòng họ đã chọn">${strip}</ol>
   ${rar ? `<p class="r">${esc(rar.lead)}</p>` : ''}${isPlay() ? `<p class="r">Gia sản: ${esc(rank()[0])}</p>` : ''}
   ${epi ? `<p class="epi">${esc(epi)}</p>` : ''}<div class="het">Hết</div></div>`;
}

/** Phim hành trình: mỗi thế hệ một cảnh (~5 s), cảnh cuối là kết cục của dòng họ. Chạm phải / trái để sang / lùi. */
export function montage(): void {
  if (document.querySelector('.cine.film:not(.out)')) return; // đang chiếu: không chồng phim thứ hai
  const list = slides();
  if (!list.length) return;
  const skey = S.names.length ? surnameKey(S.names[0].from) : S.surname || surnameKey(S.name), epi = EPILOGUES[skey];
  const box = document.createElement('div');
  box.className = 'cine film';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.setAttribute('aria-label', 'Phim hành trình');
  box.innerHTML = `<div class="prog">${list.map(() => '<i><b></b></i>').join('')}<i><b></b></i></div><div class="stage" aria-live="polite"></div>
  <button class="x" aria-label="Đóng">${X_ICON}</button><button class="pz" aria-label="Tạm dừng" aria-pressed="false">${icon('pause')}</button>`;
  document.body.appendChild(box);
  mood('finale');
  requestAnimationFrame(() => box.classList.add('on'));
  const stage = box.querySelector<HTMLElement>('.stage')!, bars = [...box.querySelectorAll<HTMLElement>('.prog b')];
  const per = calm.matches ? 7000 : 5200;
  let i = -1, seq = 0, timer = 0, closed = false, paused = false;
  const pz = box.querySelector<HTMLButtonElement>('.pz')!;
  const pzShow = () => { pz.innerHTML = icon(paused ? 'play' : 'pause'); pz.setAttribute('aria-label', paused ? 'Chạy tiếp' : 'Tạm dừng'); pz.setAttribute('aria-pressed', String(paused)); };
  /* Thanh tiến độ chạy bằng scaleX (trình duyệt tự nội suy trên lớp riêng): đổi width mỗi khung hình thì cả phim phải dàn
     trang lại 60 lần mỗi giây. Đọc chỗ đang đứng qua kiểu đã tính (không ép dàn trang). */
  const at = (b: HTMLElement) => { const m = getComputedStyle(b).transform; return m.startsWith('matrix(') ? +m.slice(7).split(',')[0] || 0 : 0; };
  const hold = (b: HTMLElement, k: number) => { b.style.setProperty('transition', 'none', 'important'); b.style.transform = `scaleX(${k})`; };
  /** Tạm dừng: đứng ở cảnh này (thanh tiến độ, lời thuyết minh dừng); chạy tiếp: kể lại cảnh này từ đầu. */
  const toggle = () => {
    paused = !paused;
    pzShow();
    if (paused) {
      seq++; clearTimeout(timer); hush();
      const b = bars[i];
      // đọc chỗ đang chạy tới trước khi tắt hiệu ứng (tắt trước thì trình duyệt nhảy luôn tới cuối)
      if (b) hold(b, at(b));
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
  /** Thanh tiến độ của cảnh `j` chạy từ chỗ đang đứng tới `to`% trong `ms` (gọi lại được để chỉnh theo bản thu). */
  const fill = (j: number, ms: number, to = 100) => {
    const b = bars[j];
    hold(b, Math.min(1, at(b)));
    void getComputedStyle(b).transform; // điểm xuất phát mới có hiệu lực trước khi bật lại chuyển tiếp
    // !important: giảm chuyển động vẫn thấy thanh tiến độ chạy (thước đo thời gian, không phải hiệu ứng)
    b.style.setProperty('transition', `transform ${Math.max(0, Math.round(ms))}ms linear`, 'important');
    b.style.transform = `scaleX(${to / 100})`;
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
    if (paused) { paused = false; pzShow(); }
    const me = ++seq;
    clearTimeout(timer);
    hush();
    bars.forEach((b, k) => hold(b, k < j ? 1 : 0));
    SND.page();
    const sc = document.createElement('div');
    if (j < list.length) {
      const s = list[j], p = await Promise.race([s.img, new Promise<null>(res => setTimeout(() => res(null), 2200))]);
      if (closed || me !== seq) return;
      sc.className = 'scene-s frame' + (p ? '' : ' bare');
      sc.innerHTML = `${p ? printHtml(p, s.y) : ''}<div class="plate"><div class="mono k">${esc(s.head)}</div><h2>${esc(s.title)}</h2><div class="pick">Hướng đã chọn: <b>${esc(s.pick)}</b></div>${s.lines.map((l, k) => `<p${k ? ' class="x2"' : ''} style="animation-delay:${0.5 + k * 0.6}s">${esc(l)}</p>`).join('')}</div>`;
    } else {
      // cảnh cuối: tấm hồ sơ khép (cả hai luồng)
      sc.className = 'scene-s frame bare fin-s';
      sc.innerHTML = endPlate();
      SND.fanfare();
    }
    stage.querySelectorAll('.scene-s').forEach(o => { o.classList.add('gone'); setTimeout(() => o.remove(), 700); });
    stage.appendChild(sc);
    watch(900); // lúc hai cảnh chồng mờ vào nhau
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
