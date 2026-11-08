import type { HistEvent } from './data';
import { SCENES, MOVES, SIDE_COLOR, sideName, actOf, type Scene, type Move, type Kind } from './data/scenes';
import { kindOf, drawPiece } from './units';
import { fxHost } from './map';
import { WAR, SND, buzz } from './audio';
import { S } from './state';
import { wikiFor, probe, videoUrl } from './wiki';
import { esc, lite, focusFallback } from './ui/dom';
import { speaking } from './narration';

/* Cảnh động trong tour chương: trận đánh có bản đồ nghiêng 3D, mũi tiến quân vẽ dần, chớp lửa, khói, rung khung và
   âm thanh chiến trường; hiệp ước có ấn triện đóng xuống; mọi sự kiện có khung "phim tư liệu" với ảnh của chính sự
   kiện chạy chậm (Ken Burns). Mọi thứ dừng ngay khi tour sang bước khác, tạm dừng hay dừng hẳn. */

const NS = 'http://www.w3.org/2000/svg';
const calm = matchMedia('(prefers-reduced-motion: reduce)');
type Part = { t0: number; dur: number; step: (p: number) => void; done?: () => void };
/** Một cảnh đang chạy. Đồng hồ ảo: `t0` lúc bắt đầu, `skew` phần đã nhảy tới trước (bước nhịp); mọi hẹn giờ của cảnh
    nằm trong hàng `q` (một setTimeout `qt` cho mục gần nhất), nên nhảy tới nhịp sau chỉ là cộng `skew`. `marks`: lúc
    (đồng hồ ảo) mỗi nhịp và phần khép trận bắt đầu. */
interface Run {
  id: string; q: { at: number; f: () => void }[]; qt: number; skew: number; marks: number[]; parts: Part[]; raf: number;
  root: SVGGElement | null; reel: HTMLElement | null; lt: HTMLElement | null; ttl?: HTMLElement | null; slug?: HTMLElement | null; stamp?: HTMLElement | null;
  len: number; t0: number; alive: boolean; onEnd?: () => void; onStep?: () => void;
  /** Chạm phụ đề khi hết nhịp: người mở cảnh quyết (tour: sang sự kiện kế; xem lại: không làm gì). */
  onNext?: () => void;
  /** Trận khép (dòng kết hiện), theo đồng hồ của cảnh: lời kể bắt đầu ở đây. */
  onClose?: () => void;
  /** Cảnh sẽ gọi onClose (trận đánh có sơ đồ và phần khép); cảnh di chuyển thì không, lời kể đọc ngay. */
  closes?: boolean;
  /** Tiếng nền của trận (pháo xa / sóng): lúc hết (đồng hồ ảo), để nhảy nhịp thì phát lại phần còn lại. */
  bed?: { kind: 'rumble' | 'waves'; end: number };
  /** Màn hình ngang: danh sách các nhịp ở cột bên (#beats). */
  list?: HTMLElement | null;
  /** Đang tạm dừng (❚❚): lúc bắt đầu dừng (performance.now), 0 khi đang chạy. Đồng hồ ảo đứng yên trong lúc dừng. */
  paused?: number;
}
/** Bố cục hai cột (bản đồ trái, cột truyện phải): như @media trong styles.css. */
const wide = matchMedia('(min-width: 1000px) and (min-aspect-ratio: 1/1) and (min-height: 760px)'); // thấp hơn: cột bên không còn chỗ cho danh sách
let cur: Run | null = null;

/** Hiệu ứng sống động bật (Hồ sơ → Cài đặt). */
export const fxOn = () => S.fx !== false;

const el = <K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number>, parent?: Element): SVGElementTagNameMap[K] => {
  const n = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v));
  parent?.appendChild(n);
  return n;
};
const ease = (p: number) => 1 - Math.pow(1 - p, 3);

/* ---------- nhịp kể: mỗi mũi tên / đường đi một nhịp, phụ đề chân hình đọc ghi chú của nó ---------- */
/** Thời gian (ms) đủ đọc một ghi chú. */
const READ = (s: string, mv = false, up = false) => Math.min(mv ? 5600 : 4600, Math.max(up ? 2200 : 2800, 1000 + 45 * s.length));
const CAP = 16000; // cả cảnh không quá 16 s nhịp (khởi nghĩa 5 hướng, thuyền nhân 5 tuyến); "›" / chạm phụ đề để đi nhanh
/** Độ dài từng nhịp của cảnh v (rỗng nếu không có cảnh mũi tên / đường đi). */
function beats(v: HistEvent): number[] {
  const sc = v.k === 'Trận đánh' ? SCENES[v.id] : undefined, mv = sc ? undefined : MOVES[v.id];
  const raw = sc ? sc.arrows.map(a => READ(a[3], false, sc.type === 'uprising')) : mv ? mv.paths.map(p => READ(p[4], true)) : [];
  const sum = raw.reduce((a, b) => a + b, 0);
  return sum > CAP ? raw.map(x => Math.max(2000, (x * CAP) / sum)) : raw;
}
/** Lúc bắt đầu của từng nhịp (tính từ đầu phần vẽ). */
const offsets = (b: number[]) => b.map((_, i) => b.slice(0, i).reduce((a, x) => a + x, 0));
/** Khoảng mở đầu trước nhịp đầu: trận đánh có tít mở trận (~2,2 s, trong lúc bản đồ bay tới và nghiêng). */
const lead = (v: HistEvent) => (v.k === 'Trận đánh' && SCENES[v.id] && !v.diary ? 1000 : 0);
/** Lời kể bắt đầu lúc nào (ms từ playScene). Trận đánh có sơ đồ: khi trận khép (dòng kết hiện), để lời kể (vốn mở đầu
    bằng kết cục) không chồng lên các nhịp phụ đề kể diễn biến; cảnh khác: ngay sau tiếng mở. */
export const voiceAt = (v: HistEvent): number => closeAt(v) || (lead(v) ? 1200 : 700);
/** Lúc (ms từ playScene) phần khép của trận đánh có sơ đồ bắt đầu; 0 nếu không có (Cảnh động tắt, không có sơ đồ). */
export function closeAt(v: HistEvent): number {
  if (!fxOn() || v.diary || !lead(v)) return 0;
  const bt = beats(v);
  return bt.length ? DRAW_AT + 120 + lead(v) + bt.reduce((a, x) => a + x, 0) + OUTRO_AT : 0;
}

/** Kiểu rung theo loại trận (Android; iOS không rung). */
/** Cỡ quân cờ trên sa bàn (so với nét vẽ gốc ~18 px). */
const PIECE = 1.35;
/** Máy tính bảng / màn rộng: quân cờ to hơn một phần ba (đọc được từ cuối lớp). */
const piece = () => PIECE * (innerWidth >= 700 ? 1.3 : 1);
const HAPTIC: Record<string, number[]> = { land: [25, 40, 60], siege: [40, 30, 40, 30, 90], naval: [25, 70, 25], landing: [30, 50, 60], uprising: [10, 110, 10, 110, 10], air: [18] };

/** Tít mở trận: tên trận, thời gian, nơi, các phe (không xếp hạng, không "đấu với"); sau đó thu thành dòng nhỏ góc trên. */
const TTL_AT = 550;
/** Lúc (ms) cảnh bắt đầu vẽ: bản đồ đã bay tới nơi (zoomTo 1,2 s), kích thước tính theo zoom lúc đó. */
const DRAW_AT = 1250;
function titleCard(r: Run, v: HistEvent, sc: Scene): void {
  const wrap = document.getElementById('mapwrap');
  if (!wrap) return;
  const sides = [...new Set([...sc.arrows.map(a => a[2]), ...sc.hold.map(h => h[2])])];
  const card = document.createElement('div');
  card.className = 'ttl';
  card.setAttribute('aria-hidden', 'true'); // thẻ dưới bản đồ đã có tên trận cho trình đọc màn hình
  card.innerHTML = `<div class="mono">Trận đánh · ${esc(v.d)}</div><h2>${esc(v.t)}</h2>${v.p ? `<p>${esc(v.p)}</p>` : ''}<div class="sides">${sides.map(sd => `<span><i style="--c:${SIDE_COLOR[sd] || '#f1e6c8'}"></i>${esc(sideName(sd, v.y))}</span>`).join('')}</div>`;
  wrap.classList.add('scn');
  // thẻ tên trận hiện khi bản đồ đã bay gần tới nơi (không đè lên nơi cũ), tắt trước mũi tên đầu tiên
  later(r, TTL_AT, () => { wrap.appendChild(card); r.ttl = card; requestAnimationFrame(() => card.classList.add('on')); });
  later(r, TTL_AT + 1750, () => card.classList.add('out'));
  later(r, TTL_AT + 2250, () => {
    card.remove();
    r.ttl = null;
    const sl = document.createElement('div');
    sl.className = 'slug mono';
    sl.setAttribute('aria-hidden', 'true');
    sl.textContent = `${v.y} · ${v.t}`;
    wrap.appendChild(sl);
    r.slug = sl;
  });
}
/** Khép trận sau nhịp cuối: 0,6 s nghỉ rồi ~3 s cho dấu ngày và câu kết (chỉ trận đánh có sơ đồ). */
const OUTRO_AT = 600, OUTRO = OUTRO_AT + 3000;
const outro = (v: HistEvent) => (lead(v) ? OUTRO : 0);
/** Độ dài cảnh (ms từ lúc playScene) tới khi nhịp cuối (và phần khép trận) xong; 0 nếu không có nhịp. */
export function sceneLen(v: HistEvent): number {
  const b = beats(v);
  return b.length ? 1250 + 120 + lead(v) + b.reduce((a, x) => a + x, 0) + outro(v) : 0;
}
/** Cảnh đang chạy còn bao lâu nữa mới đọc xong nhịp cuối (0 nếu không có cảnh). */
export const sceneLeft = (): number => (cur && cur.alive ? Math.max(0, cur.len - vnow(cur)) : 0);
/** Chiều cao dành cho phụ đề chân hình (để khung bản đồ và khung tư liệu chừa chỗ). */
export const capH = (): number => (innerWidth >= 1000 ? 100 : innerWidth >= 700 ? 82 : 72); // phụ đề 20 px (≥1000 px) cao ~96 px
/** Thanh đang nằm dưới đáy bản đồ (thanh xem lại, hoặc thanh tour). */
const barEl = () => document.getElementById('replb') || document.getElementById('tourb');

/** Cỡ sơ đồ (px màn hình) cho trận / cảnh gọn: theo phần bản đồ còn trống (trừ nhãn trên, phụ đề, thanh dưới, cột nút zoom). */
/** Khoảng trống (px màn hình, rộng × cao) cho sơ đồ cảnh: trừ nút zoom, nhãn trên, phụ đề và thanh tour dưới. */
function diagBox(): [number, number] {
  const w = document.getElementById('mapwrap');
  if (!w) return [150, 150];
  const bar = barEl(), low = (bar ? w.clientHeight - bar.offsetTop : 0) + capH() + 16;
  return [Math.max(150, w.clientWidth - 80), Math.max(130, w.clientHeight - 40 - low)];
}
/** Phóng sơ đồ (minh hoạ, không phải tỉ lệ thật) quanh tâm khung các điểm `lls` (khung mà bản đồ vừa bay tới, như
    sceneFrame) cho tới khi chiếm `share` khoảng trống theo chiều chật hơn; không bao giờ thu nhỏ. */
function fitScale(h: NonNullable<ReturnType<typeof fxHost>>, lls: [number, number][], share: number): (l: [number, number]) => [number, number] {
  const ps = lls.map(l => h.proj(l)), xs = ps.map(p => p[0]), ys = ps.map(p => p[1]);
  const c = [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2];
  const bw = (Math.max(...xs) - Math.min(...xs)) * h.ppu(), bh = (Math.max(...ys) - Math.min(...ys)) * h.ppu(), [aw, ah] = diagBox();
  const f = bw > 0 || bh > 0 ? Math.max(1, Math.min(30, (aw * share) / Math.max(bw, 1), (ah * share) / Math.max(bh, 1))) : 1;
  return l => { const p = h.proj(l); return [c[0] + (p[0] - c[0]) * f, c[1] + (p[1] - c[1]) * f]; };
}

/** Phụ đề chân hình của cảnh: một khung, đổi nội dung theo nhịp (hiệu ứng lau chữ mỗi lần đổi). */
function caption(r: Run, html: string, col: string, cls = ''): void {
  const wrap = document.getElementById('mapwrap');
  if (!wrap) return;
  let b = r.lt;
  if (!b) {
    b = document.createElement('div'); b.setAttribute('role', 'status'); wrap.appendChild(b); r.lt = b;
    // chạm phụ đề: sang nhịp kế (như "›"). Phụ đề nhận chạm suốt cảnh (CSS), nên chạm không lọt xuống bản đồ nghiêng
    // (chạm bản đồ = cắt cảnh); nút trong phụ đề (Góc nhìn) đi theo đường data-a như mọi nút khác
    b.addEventListener('click', ev => { if (!(ev.target as Element).closest('button, a')) tapCaption(r); });
  }
  b.className = 'lt' + cls;
  later(r, 0, () => b!.classList.toggle('step', sceneSteppable())); // sau khi nhịp này đã được đánh dấu
  b.setAttribute('aria-live', speaking() ? 'off' : 'polite'); // đang có lời kể: không đọc chồng
  b.style.setProperty('--c', col);
  const bar = barEl();
  b.style.bottom = `${(bar ? wrap.clientHeight - bar.offsetTop : 0) + 8}px`;
  b.innerHTML = `<div class="lt-i">${html}</div>`; // hiệu ứng lau chữ chạy trên lớp trong: khung ngoài luôn nhận chạm
  b.classList.remove('in');
  void b.offsetWidth;
  b.classList.add('in');
}
/** Nội dung một nhịp: phe (màu), thứ tự, ngày (nếu ghi chú kết thúc bằng ngày trong ngoặc), ghi chú. */
function beatHtml(side: string, y: number, note: string, i: number, n: number, extra = ''): string {
  const m = note.match(/\s*\(([^()]*\d[^()]*)\)\s*$/), text = m ? note.slice(0, m.index) : note;
  return `<div class="lt-h mono"><i></i><b>${esc(sideName(side, y) + extra)}</b>${n > 1 ? `<span>${i + 1}/${n}</span>` : ''}${m ? `<em>${esc(m[1])}</em>` : ''}</div><p>${esc(text)}</p>`;
}
/** Chú giải cuối cảnh: mỗi phe một ô màu. */
function legendHtml(sides: string[], y: number): string {
  return `<div class="lg mono">${[...new Set(sides)].map(sd => `<span><i style="--c:${SIDE_COLOR[sd] || '#f1e6c8'}"></i>${esc(sideName(sd, y))}</span>`).join('')}</div>`;
}
/** Số thứ tự ở gốc mũi tên (đứng thẳng cả khi bản đồ nghiêng). */
function badge(root: SVGGElement, p: [number, number], k: number, n: number, col: string): SVGGElement {
  const sy = document.getElementById('mapwrap')?.classList.contains('tilt') ? 1.24 : 1;
  const g = el('g', { class: 'bd', transform: `translate(${p[0]},${p[1]}) scale(${1 / k},${sy / k})`, opacity: 0 }, root);
  el('circle', { r: 6.5, fill: col, stroke: '#111', 'stroke-width': 1 }, g);
  const t = el('text', { y: 3, 'text-anchor': 'middle', 'font-size': 8.5, 'font-weight': 700, fill: '#111', style: 'font-family:var(--mono)' }, g);
  t.textContent = String(n);
  return g;
}
/** Nhịp i bắt đầu: phụ đề đổi, các mũi tên trước mờ đi, số thứ tự hiện. */
/** Màn hình ngang: mọi nhịp của cảnh thành một danh sách ở cột bên (đọc được từ cuối lớp); nhịp đang kể sáng lên,
    nhịp đã qua mờ đi; chạm một nhịp phía sau để nhảy tới. */
function beatList(r: Run, v: HistEvent): HTMLElement | null {
  const box = document.getElementById('beats');
  if (!box || !wide.matches) return null;
  const sc = v.k === 'Trận đánh' ? SCENES[v.id] : undefined, mv = sc ? undefined : MOVES[v.id];
  const items: [string, string][] = sc ? sc.arrows.map(a => [a[2], a[3]]) : mv ? mv.paths.map(p => [p[3], p[4]]) : [];
  if (!items.length) return null;
  box.innerHTML = `<div class="mono muted">Diễn biến · ${esc(v.t)}</div><ol>${items.map(([side, note], i) => {
    const m = note.match(/\s*\(([^()]*\d[^()]*)\)\s*$/), text = m ? note.slice(0, m.index) : note;
    return `<li data-i="${i}" style="--c:${SIDE_COLOR[side] || '#f1e6c8'}"><button type="button"><span class="bn">${i + 1}</span><span><b>${esc(sideName(side, v.y))}</b>${m ? ` <em>${esc(m[1])}</em>` : ''}<br>${esc(text)}</span></button></li>`;
  }).join('')}</ol>`;
  box.hidden = false;
  box.querySelectorAll<HTMLButtonElement>('li button').forEach((b, i) => (b.onclick = () => {
    if (cur !== r || !r.alive || r.paused) return; // đang giữ cảnh: ▶ trước
    const t = r.marks[i], now = vnow(r);
    if (t > now + 250) { jump(r, t - now + 20); r.onStep?.(); }
  }));
  return box;
}
function listAt(r: Run, i: number): void {
  r.list?.querySelectorAll<HTMLElement>('li').forEach((li, j) => {
    li.classList.toggle('on', j === i); li.classList.toggle('done', j < i);
    if (j === i) li.scrollIntoView({ block: 'nearest', behavior: calm.matches ? 'auto' : 'smooth' }); // nhịp đang kể luôn trong khung
  });
}
function beat(r: Run, parts: Element[][], i: number, html: string, col: string): void {
  caption(r, html, col);
  listAt(r, i);
  parts.forEach((ps, j) => { if (j < i) ps.forEach(e => { const op = e.getAttribute('opacity'); if (op === '0' || e.hasAttribute('data-op')) return; e.setAttribute('data-op', op || '1'); e.setAttribute('opacity', '0.45'); }); });
  parts[i]?.forEach(e => { if (e.classList.contains('bd')) e.setAttribute('opacity', '1'); });
}
/** Hết nhịp: trả độ đậm cho mọi mũi tên, phụ đề thành chú giải các phe. */
function undim(parts: Element[][]): void {
  parts.forEach(ps => ps.forEach(e => { const op = e.getAttribute('data-op'); if (op !== null) { e.setAttribute('opacity', op); e.removeAttribute('data-op'); } }));
}
function closing(r: Run, parts: Element[][], sides: string[], y: number): void {
  undim(parts);
  listAt(r, Infinity);
  caption(r, legendHtml(sides, y), 'var(--ink3)', ' leg');
}

const vnow = (r: Run) => (r.paused || performance.now()) - r.t0 + r.skew;
/** Lúc "bây giờ" theo kịch bản: trong một hẹn giờ chạy muộn (vừa nhảy nhịp) là lúc lẽ ra nó chạy, để những gì nó hẹn
    tiếp (vd. battle() hẹn các nhịp) vẫn đúng mốc đã tính trước (marks). */
const vat = (r: Run) => vnow(r) - lateBy;
function later(r: Run, ms: number, f: () => void): void {
  const at = vat(r) + ms;
  let i = r.q.length;
  while (i > 0 && r.q[i - 1].at > at) i--; // giữ thứ tự hẹn cùng lúc
  r.q.splice(i, 0, { at, f });
  arm(r);
}
function arm(r: Run): void {
  clearTimeout(r.qt);
  if (r.alive && !r.paused && r.q.length) r.qt = window.setTimeout(() => tick(r), Math.max(0, r.q[0].at - vnow(r)));
}
function tick(r: Run): void {
  if (!r.alive) return;
  while (r.q.length && r.q[0].at <= vnow(r) + 1) {
    const it = r.q.shift()!;
    lateBy = Math.max(0, vnow(r) - it.at); // hẹn giờ chạy muộn (vừa nhảy nhịp): chuyển động bắt đầu từ chỗ lẽ ra đã tới
    it.f();
    lateBy = 0;
    if (!r.alive) return;
  }
  arm(r);
}
let lateBy = 0;
/** Nhảy đồng hồ của cảnh tới trước `d` ms: hẹn giờ tới hạn chạy ngay theo thứ tự, chuyển động đang dở chạy tới cuối. */
function jump(r: Run, d: number): void {
  if (d <= 0) return;
  const now = performance.now();
  r.skew += d;
  clearTimeout(r.qt);
  // tiếng đã hẹn trên đồng hồ âm thanh không nhảy theo: cắt bus của cảnh, phát lại phần tiếng nền còn lại
  WAR.close(); WAR.open();
  const left = r.bed ? (r.bed.end - vnow(r)) / 1000 : 0;
  if (r.bed && left > 1) WAR[r.bed.kind](left, 0);
  // chuyển động mà cú nhảy đưa tới cuối: vẽ trạng thái cuối và gọi done() ngay, trước các nhịp sau (đầu mũi tên, nhãn
  // địa danh có mặt kịp để nhịp sau làm mờ cùng mũi tên của chúng)
  const fin: Part[] = [];
  r.parts = r.parts.filter(p => { p.t0 = Math.max(p.t0 - d, now - p.dur); if (now - p.t0 >= p.dur) { fin.push(p); return false; } return true; });
  for (const p of fin) { p.step(1); p.done?.(); if (!r.alive) return; }
  tick(r);
}
/** Cảnh đang chạy còn nhịp phía trước thì nhảy tới nhịp đó (hay phần khép trận) và trả true; hết nhịp thì false. */
export function stepScene(): boolean {
  const r = cur;
  if (!r || !r.alive) return false;
  if (r.paused) resumeScene(); // bước khi đang giữ: chạy tiếp rồi sang nhịp
  const now = vnow(r), t = r.marks.filter(m => m > now + 250).sort((a, b) => a - b)[0];
  if (t === undefined) return false;
  jump(r, t - now + 20); // quá mốc một chút: nhịp hẹn ngay sau mốc (vài ms) cũng chạy luôn
  r.onStep?.();
  return true;
}
/** ❚❚: giữ nguyên cảnh (mũi tên, phụ đề, nghiêng) để chỉ vào bản đồ; đồng hồ, chuyển động, tiếng của cảnh dừng lại. */
export function pauseScene(): boolean {
  const r = cur;
  if (!r || !r.alive || r.paused) return false;
  r.paused = performance.now();
  clearTimeout(r.qt);
  if (r.raf) { cancelAnimationFrame(r.raf); r.raf = 0; }
  WAR.close(); // tiếng đã hẹn trên đồng hồ âm thanh: cắt; chạy tiếp thì phát lại phần nền còn lại
  r.reel?.querySelector('video')?.pause();
  return true;
}
/** Chạy tiếp cảnh đã giữ: dời mọi mốc theo thời gian đã dừng. */
export function resumeScene(): boolean {
  const r = cur;
  if (!r || !r.alive || !r.paused) return false;
  const d = performance.now() - r.paused;
  r.paused = 0;
  r.t0 += d;
  for (const p of r.parts) p.t0 += d;
  WAR.open();
  const left = r.bed ? (r.bed.end - vnow(r)) / 1000 : 0;
  if (r.bed && left > 1) WAR[r.bed.kind](left, 0);
  void r.reel?.querySelector('video')?.play().catch(() => { /* bị chặn tự phát: để khung đứng */ });
  arm(r);
  if (r.parts.length && !r.raf) r.raf = requestAnimationFrame(t => frame(r, t));
  return true;
}
export const scenePaused = (): boolean => !!cur?.alive && !!cur.paused;
/** Cảnh của sự kiện `id` đang chạy và có nhịp (sơ đồ trận / đường đi): ❚❚ giữ được nó. Cảnh khác (nhật ký, hiệp ước,
    sự kiện thường) thì ❚❚ dừng hẳn, ▶ kể lại bước đó. */
export const holdable = (id: string | undefined): boolean => !!cur && cur.alive && cur.id === id && cur.marks.length > 0;
/** Trận có phần khép của `id` đang chạy mà chưa tới lúc khép: lời kể chờ khép (onClose), hẹn giờ dự phòng không chen
    vào. Cảnh di chuyển không có phần khép (không gọi onClose): không chờ. */
export const beforeClose = (id: string): boolean => holdable(id) && !!cur!.closes && vnow(cur!) < cur!.marks[cur!.marks.length - 1] - 50;
/** Chạm phụ đề: sang nhịp kế; hết nhịp thì để người mở cảnh quyết (tour đi tiếp, xem lại đứng yên). */
function tapCaption(r: Run): void {
  if (cur !== r || !r.alive || r.paused) return; // đang giữ cảnh: chạm phụ đề không làm gì (▶ để chạy tiếp)
  if (!stepScene()) r.onNext?.();
}
/** Cảnh đang chạy có nhịp để bước (cho phép chạm phụ đề). */
export const sceneSteppable = (): boolean => !!cur && cur.alive && cur.marks.some(m => m > vnow(cur!) + 250);
function anim(r: Run, dur: number, step: (p: number) => void, delay = 0, done?: () => void): void {
  later(r, delay, () => {
    if (calm.matches) { step(1); done?.(); return; } // giảm chuyển động: vẽ thẳng trạng thái cuối
    r.parts.push({ t0: Math.max(performance.now() - lateBy, performance.now() - dur), dur, step, done });
    if (!r.raf) r.raf = requestAnimationFrame(t => frame(r, t));
  });
}
function frame(r: Run, now: number): void {
  r.raf = 0;
  if (!r.alive) return;
  r.parts = r.parts.filter(p => {
    const k = Math.min(1, (now - p.t0) / p.dur);
    p.step(k);
    // quá hạn lâu (thẻ trình duyệt bị ẩn): kết thúc lặng lẽ, không dồn mọi tiếng nổ vào một khung hình
    if (k >= 1) { if (now - p.t0 < p.dur + 500) p.done?.(); return false; }
    return true;
  });
  if (r.parts.length) r.raf = requestAnimationFrame(t => frame(r, t));
}

/** Gradient, bộ lọc khói, dùng chung (tạo một lần trong defs của bản đồ). */
function ensureDefs(defs: SVGDefsElement): void {
  if (defs.querySelector('#fx-boom')) return;
  const g = el('radialGradient', { id: 'fx-boom' }, defs);
  el('stop', { offset: '0%', 'stop-color': '#fff7d6' }, g);
  el('stop', { offset: '35%', 'stop-color': '#ffb43a' }, g);
  el('stop', { offset: '70%', 'stop-color': '#e2461f', 'stop-opacity': 0.7 }, g);
  el('stop', { offset: '100%', 'stop-color': '#7a1f0d', 'stop-opacity': 0 }, g);
  for (const [id, c] of [['fx-puff-n', '#a09a90'], ['fx-puff-d', '#5f5950']]) { // khói: chấm mờ bằng gradient, không dùng bộ lọc blur (nhẹ cho máy yếu)
    const s = el('radialGradient', { id }, defs);
    el('stop', { offset: '0%', 'stop-color': c, 'stop-opacity': 0.85 }, s);
    el('stop', { offset: '60%', 'stop-color': c, 'stop-opacity': 0.35 }, s);
    el('stop', { offset: '100%', 'stop-color': c, 'stop-opacity': 0 }, s);
  }
}

/* ---------- trận đánh ---------- */
function curve(a: [number, number], b: [number, number], bend: number): { d: string; at: (t: number) => [number, number]; ang: number } {
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1];
  const cx = mx - dy * bend, cy = my + dx * bend;
  const at = (t: number): [number, number] => [(1 - t) * (1 - t) * a[0] + 2 * (1 - t) * t * cx + t * t * b[0], (1 - t) * (1 - t) * a[1] + 2 * (1 - t) * t * cy + t * t * b[1]];
  return { d: `M${a[0]},${a[1]} Q${cx},${cy} ${b[0]},${b[1]}`, at, ang: (Math.atan2(b[1] - cy, b[0] - cx) * 180) / Math.PI };
}

function explode(r: Run, root: SVGGElement, p: [number, number], k: number, delay: number, big = 1): void {
  if (calm.matches) return; // giảm chuyển động: không chớp lửa, không khói
  const g = el('g', { transform: `translate(${p[0]},${p[1]}) scale(${1 / k})` }, root);
  later(r, delay + 3800, () => g.remove()); // dọn nút sau khi khói tan
  const ball = el('circle', { r: 0, fill: 'url(#fx-boom)', opacity: 0 }, g);
  const flash = el('circle', { r: 5 * big, fill: '#fffbe8', opacity: 0 }, g);
  anim(r, 160, q => flash.setAttribute('opacity', String(0.95 * (1 - q))), delay);
  anim(r, 760, q => { ball.setAttribute('r', String(4 + 15 * big * ease(q))); ball.setAttribute('opacity', String(q < 0.2 ? q * 5 : 1 - (q - 0.2) / 0.8)); }, delay);
  for (let i = 0; i < 3; i++) {
    const dx = (Math.random() - 0.5) * 10, sm = el('circle', { cx: dx, cy: 0, r: 5, fill: S.theme === 'night' ? 'url(#fx-puff-n)' : 'url(#fx-puff-d)', opacity: 0 }, g);
    anim(r, 2600 + i * 300, q => { sm.setAttribute('r', String(5 + 12 * big * q)); sm.setAttribute('cy', String(-22 * q - i * 3)); sm.setAttribute('cx', String(dx + 6 * q)); sm.setAttribute('opacity', String(0.75 * (q < 0.15 ? q / 0.15 : 1 - (q - 0.15) / 0.85))); }, delay + 120 + i * 140);
  }
}

function shake(r: Run): void {
  if (calm.matches) return;
  const m = document.getElementById('map');
  if (!m) return;
  m.classList.remove('shake');
  void m.getBoundingClientRect();
  m.classList.add('shake');
  later(r, 450, () => m.classList.remove('shake'));
}

/** Khói bụi sau xích xe tăng. */
function dust(r: Run, root: SVGGElement, p: [number, number], k: number): void {
  const c = el('circle', { cx: p[0], cy: p[1], r: 2 / k, fill: 'url(#fx-puff-d)', opacity: 0.6 }, root);
  anim(r, 900, q => { c.setAttribute('r', String((2 + 5 * q) / k)); c.setAttribute('opacity', String(0.6 * (1 - q))); }, 0, () => c.remove());
}

/** Hai mũi tên giáp nhau (cặp `meet` có nguồn trong dữ liệu): loạt đạn vạch chéo giữa hai đầu mũi, hay khói súng hoả mai. */
function contact(r: Run, root: SVGGElement, pA: [number, number], pB: [number, number], k: number, cA: string, cB: string, old: boolean): void {
  root.dataset.contacts = String(+(root.dataset.contacts || 0) + 1);
  WAR.crackle(1.2, 10, 0, old);
  if (calm.matches) return;
  for (let j = 0; j < 4; j++) {
    const [p, q, c] = j % 2 ? [pB, pA, cB] : [pA, pB, cA];
    if (old) {
      const pf = el('circle', { cx: p[0] + (q[0] - p[0]) * 0.15, cy: p[1] + (q[1] - p[1]) * 0.15, r: 2 / k, fill: '#f4f1ea', opacity: 0.8 }, root);
      anim(r, 1200, t => { pf.setAttribute('r', String((2 + 5 * t) / k)); pf.setAttribute('opacity', String(0.8 * (1 - t))); }, j * 120, () => pf.remove());
    } else {
      const ln = el('line', { x1: p[0], y1: p[1], x2: p[0] + (q[0] - p[0]) * 0.7, y2: p[1] + (q[1] - p[1]) * 0.7, stroke: c, 'stroke-width': 1.4 / k, 'stroke-linecap': 'round', opacity: 0 }, root);
      anim(r, 120, t => ln.setAttribute('opacity', String(1 - t)), j * 80, () => ln.remove());
    }
  }
}

interface HoldEl { g: SVGGElement; ring: SVGCircleElement; rect: SVGRectElement; side: string; p: [number, number]; stop: boolean }
const sentences = (t: string) => (t.match(/.+?(?:[.!?…](?=\s|$)|$)/g) || []).map(x => x.trim()).filter(Boolean);
/** Ngày kết thúc của khoảng thời gian ("13.3 – 7.5.1954" → "7.5.1954"). */
const endOf = (d: string) => (/[–-]/.test(d) ? d.split(/\s*[–-]\s*/).pop()!.trim() : d);

/** Khép trận: máy quay nâng lên, vị trí thất thủ xám lại (bị bỏ: mờ đi, viền chấm), dấu ngày kết thúc, câu kết
    trích nguyên văn của sự kiện và lối vào "Góc nhìn". Không số thương vong, không tô màu bên thắng. */
function outcome(r: Run, v: HistEvent, sc: Scene, hs: HoldEl[], parts: Element[][], k: number): void {
  undim(parts);
  listAt(r, Infinity);
  later(r, 0, () => r.onClose?.()); // sau khi dòng kết đã dựng xong
  const wrap = document.getElementById('mapwrap'), m = document.getElementById('map'), end = sc.end || {};
  const fought = sc.arrows.some(a => actOf(a) === 'fight'); // giao thành không kháng cự (Vĩnh Long 1867): không khói
  if (!calm.matches && wrap?.classList.contains('tilt') && m) { m.style.transitionDuration = '2.4s'; wrap.style.setProperty('--rx', '31deg'); wrap.style.setProperty('--cs', '1.15'); } // máy quay nâng nhẹ
  hs.forEach((hd, j) => {
    hd.stop = true;
    hd.ring.setAttribute('opacity', '0');
    if (end.fell?.includes(j) || end.left?.includes(j)) r.root?.appendChild(hd.g); // nổi lên trên mũi tên, quân cờ: thấy được trạng thái
    if (end.fell?.includes(j)) {
      hd.rect.setAttribute('stroke', '#8f887c');
      hd.rect.setAttribute('stroke-width', '1.6');
      anim(r, 600, q => hd.rect.setAttribute('fill-opacity', String(1 - q)));
      if (!calm.matches && r.root && fought) for (let i = 0; i < 3; i++) {
        const sm = el('circle', { cx: hd.p[0], cy: hd.p[1], r: 3 / k, fill: S.theme === 'night' ? 'url(#fx-puff-n)' : 'url(#fx-puff-d)', opacity: 0 }, r.root);
        anim(r, 2600, q => { sm.setAttribute('r', String((3 + 7 * q) / k)); sm.setAttribute('cy', String(hd.p[1] - (14 * q) / k)); sm.setAttribute('opacity', String(0.6 * (q < 0.15 ? q / 0.15 : 1 - (q - 0.15) / 0.85))); }, i * 400, () => sm.remove());
      }
    } else if (end.left?.includes(j)) {
      el('circle', { class: 'fx-left', r: 11, fill: 'none', stroke: SIDE_COLOR[hd.side] || '#fff', 'stroke-width': 1.2, 'stroke-dasharray': '2 2' }, hd.g);
      anim(r, 600, q => hd.g.setAttribute('opacity', String(1 - 0.55 * q)));
    }
  });
  const date = end.date ?? endOf(v.d);
  if (wrap && date) {
    const st = document.createElement('div');
    st.className = 'endw';
    st.setAttribute('aria-hidden', 'true');
    st.innerHTML = `<span class="stamp">${esc(date)}</span>`;
    wrap.appendChild(st);
    r.stamp = st;
  }
  if (!speaking()) SND.stamp();
  buzz([10, 30, 40]);
  const lines = end.line || sentences(v.x || v.s).slice(0, 1);
  caption(r, `<div class="lt-h mono"><b>Khép trận</b><button class="chip" data-a="ev" data-id="${v.id}" data-tab="v">Góc nhìn · ${v.v.length}</button></div><p>${esc(lines.join(' '))}</p>`, 'var(--ink3)', ' end');
}

type Box = [number, number, number, number];
const box = (x: number, y: number, rx: number, ry: number): Box => [x - rx, y - ry, x + rx, y + ry];
/** Chỗ đặt nhãn địa danh cạnh điểm p (đơn vị bản đồ): thử trên, dưới, phải, trái, rồi xa hơn; chọn chỗ đầu tiên không đè
    lên nhãn / đầu mũi tên / vị trí giữ đã có (so bằng px màn hình), ghi chỗ đó vào `placed`. dx, dy tính bằng px. */
function labelSpot(placed: Box[], p: [number, number], k: number, sy: number, t: string): { dx: number; dy: number; anchor: string } {
  const fs = innerWidth >= 700 ? 1.2 : 1; // màn rộng: nhãn 12 px (styles.css .fx-at)
  const w = t.length * 6.1 * fs + 4, h = 12 * fs, x = p[0] * k, y = (p[1] * k) / sy; // bản đồ nghiêng: chiều dọc trên màn hình co lại sy lần
  const tries: [number, number, string][] = [[0, -13, 'middle'], [0, 19, 'middle'], [11, 4, 'start'], [-11, 4, 'end'], [0, -27, 'middle'], [0, 33, 'middle'], [24, -10, 'start'], [-24, -10, 'end']];
  const rect = ([dx, dy, a]: [number, number, string]): Box => {
    const x0 = a === 'middle' ? x + dx - w / 2 : a === 'start' ? x + dx : x + dx - w;
    return [x0, y + dy - h + 3, x0 + w, y + dy + 3];
  };
  const hit = (b: Box) => placed.some(q => b[0] < q[2] && b[2] > q[0] && b[1] < q[3] && b[3] > q[1]);
  const pick = tries.find(c => !hit(rect(c))) || tries[0];
  placed.push(rect(pick));
  return { dx: pick[0], dy: pick[1], anchor: pick[2] };
}
function battle(r: Run, v: HistEvent, sc: Scene | undefined): void {
  const h = fxHost();
  if (!h || !r.root) return;
  ensureDefs(h.defs);
  const k = h.k(), root = r.root, type = sc?.type || 'land';
  // Trận gọn trong vài km: phóng sơ đồ quanh tâm khung cho tới khi chiếm phần lớn chỗ trống (minh hoạ, không phải tỉ lệ thật)
  const P = fitScale(h, [v.l, ...(sc?.arrows || []).flatMap(a => [a[0], a[1]]), ...(sc?.hold || []).map(x => [x[0], x[1]] as [number, number])], 0.8);
  const arrows = sc?.arrows.length ? sc.arrows : [];
  const T0 = 120; // gọi sau khi bản đồ đã bay tới (playScene hẹn 1,25 s), để hệ số zoom k đã đúng
  // nhịp kể: mũi tên thứ i vẽ khi nhịp i bắt đầu, phụ đề đọc ghi chú của nó
  const bt = beats(v), B = offsets(bt), total = bt.reduce((a, x) => a + x, 0), L0 = T0 + lead(v);
  const parts: Element[][] = [];
  // vị trí được giữ: vòng sáng nhấp nháy suốt các nhịp (tắt khi khép trận)
  const ringDur = Math.max(2600, lead(v) + total + OUTRO_AT + 300), hs: HoldEl[] = [];
  for (const [lo, la, side] of sc?.hold || []) {
    const p = P([lo, la]), g = el('g', { transform: `translate(${p[0]},${p[1]}) scale(${1 / k})` }, root);
    const ring = el('circle', { r: 9, fill: 'none', stroke: SIDE_COLOR[side] || '#fff', 'stroke-width': 2, opacity: 0 }, g);
    const rect = el('rect', { x: -4, y: -4, width: 8, height: 8, transform: 'rotate(45)', fill: SIDE_COLOR[side] || '#fff', stroke: '#111', 'stroke-width': 1.2 }, g);
    const hd: HoldEl = { g, ring, rect, side, p, stop: false };
    hs.push(hd);
    anim(r, ringDur, q => { if (hd.stop) { ring.setAttribute('opacity', '0'); return; } const w = ((q * ringDur) / 1300) % 1; ring.setAttribute('r', String(7 + 9 * w)); ring.setAttribute('opacity', String(0.8 * (1 - w))); }, T0 - 300);
  }
  const bed = Math.max(5, Math.min(14, (L0 + total) / 1000)); // tiếng nền kéo suốt các nhịp
  // tiếng nền: vẽ muộn vì vừa nhảy nhịp thì chỉ phát phần còn lại
  const bedLeft = bed - lateBy / 1000, kindBed = type === 'land' || type === 'siege' ? 'rumble' : type === 'naval' || type === 'landing' ? 'waves' : null;
  if (kindBed) { if (bedLeft > 1) WAR[kindBed](bedLeft, lateBy ? 0 : T0 / 1000); r.bed = { kind: kindBed, end: vat(r) + T0 + bed * 1000 }; }
  if (type === 'uprising') WAR.crowd(T0 / 1000);
  let bursts = 0, sounds = 0; // chớp lửa dọc đường bay (máy bay) và tiếng nổ khi tới mục tiêu: hai ngân sách riêng
  // máy yếu: bỏ cánh quạt quay, bụi xích (mọi thứ khác giữ nguyên)
  const old = v.y < 1900, sy = document.getElementById('mapwrap')?.classList.contains('tilt') ? 1.24 : 1;
  const holds = (sc?.hold || []).map(([lo, la, side]) => ({ side, ll: [lo, la] as [number, number], ringed: false }));
  const arrived = new Set<number>(), meets = sc?.meet || [];
  // chỗ đã chiếm (px màn hình): đầu mũi tên, vị trí giữ; nhãn địa danh tránh đè lên nhau và lên chúng
  const placed: Box[] = arrows.map(a => { const q = P(a[1]); return box(q[0] * k, (q[1] * k) / sy, 7, 7); })
    .concat((sc?.hold || []).map(x => { const q = P([x[0], x[1]]); return box(q[0] * k, (q[1] * k) / sy, 6, 6); }));
  root.dataset.contacts = '0';
  arrows.forEach((arw, i) => {
    const [from, to, side, note] = arw;
    const act = actOf(arw), kind: Kind = kindOf(note, type, arw[4]);
    const a = P(from), b = P(to), c = curve(a, b, (i % 2 ? -1 : 1) * 0.16);
    const col = SIDE_COLOR[side] || '#ffd84a', ink = act === 'doubt' ? '#9a9a9a' : col;
    // nét: giao chiến / hành quân vẽ dần; rút lui nét đứt chạy; thuỷ chiến nét đứt chạy; nghi vấn nét chấm xám
    const marching = act === 'retreat' || (act !== 'doubt' && (type === 'naval' || type === 'landing')), reveal = act !== 'doubt' && !marching;
    // nét tính theo đơn vị bản đồ chia cho zoom (không dùng non-scaling-stroke: nó làm pathLength / nét đứt sai trên Chrome)
    const under = el('path', { d: c.d, fill: 'none', stroke: '#0b0b0b', 'stroke-opacity': 0.55, 'stroke-width': 7 / k, 'stroke-linecap': 'round' }, root);
    const line = el('path', { d: c.d, fill: 'none', stroke: ink, 'stroke-width': (type === 'uprising' ? 2.4 : 3.4) / k, 'stroke-linecap': 'round' }, root);
    if (act === 'doubt') { line.setAttribute('stroke-opacity', '0.55'); line.setAttribute('stroke-dasharray', `${0.01 / k} ${4.5 / k}`); }
    else if (act === 'retreat') line.setAttribute('stroke-dasharray', `${6 / k} ${4 / k}`);
    else if (marching) line.setAttribute('stroke-dasharray', `${7 / k} ${5 / k}`);
    const len = line.getTotalLength() || 1;
    for (const p of reveal ? [under, line] : [under]) { p.setAttribute('stroke-dasharray', `${len} ${len}`); p.setAttribute('stroke-dashoffset', String(len)); }
    const head = el('g', { transform: `translate(${b[0]},${b[1]}) rotate(${c.ang}) scale(${1 / k})`, opacity: 0 }, root);
    el('path', { d: 'M-2,-7 L9,0 L-2,7 L1,0Z', fill: ink, stroke: '#111', 'stroke-width': 1.2, 'stroke-linejoin': 'round' }, head);
    const sdur = (type === 'air' ? 1500 : 1900) * (act === 'retreat' ? 1.4 : 1), start = L0 + B[i], dur = calm.matches ? 1 : sdur;
    parts[i] = [under, line, head];
    if (arrows.length > 1) parts[i].push(badge(root, a, k, i + 1, col));
    later(r, start, () => beat(r, parts, i, beatHtml(side, v.y, note, i, arrows.length), col));
    // quân cờ đi theo mũi tên (nghi vấn thì không: sử liệu không chắc có lực lượng nào ở đó)
    const pc = act === 'doubt' ? null : drawPiece(kind, col, root, sy), airborne = kind === 'plane' || kind === 'para';
    if (pc) parts[i].push(pc.g);
    // tiếng động cơ theo nhịp, hẹn trên đồng hồ của cảnh (bước nhịp thì tiếng tới cùng mũi tên, không trễ)
    if (pc) later(r, start, () => { if (airborne) WAR.plane(0); else if (kind === 'armour') WAR.tank(sdur / 1000, 0); else if (kind === 'heli') WAR.heli(sdur / 1000, 0); });
    // quân cờ đi sau đầu mũi tên và dừng ở khoảng 3/4 đường (không đè đầu mũi tên, vị trí giữ, khói)
    const put = (e: number, s = 1) => {
      if (!pc) return;
      const t = airborne ? e : e * 0.74, p = c.at(t), p2 = c.at(Math.min(1, t + 0.02)), z = s * piece();
      pc.g.setAttribute('transform', `translate(${p[0]},${p[1]}) scale(${z / k},${(z * sy) / k})`);
      pc.body.setAttribute('transform', `rotate(${(Math.atan2(p2[1] - p[1], p2[0] - p[0]) * 180) / Math.PI})`);
    };
    // vòng vây: ghi chú nói "vây" / "siết" (không phải "bị vây", không phải địa danh Làng Vây) → vòng siết quanh vị trí bên kia gần mũi tên
    if (act === 'fight' && /(^|\s)(vây|siết)/.test(note) && !/bị vây/.test(note)) {
      const tgt = holds.filter(hd => hd.side !== side && Math.hypot(hd.ll[0] - to[0], hd.ll[1] - to[1]) <= 0.08)
        .sort((x, y) => Math.hypot(x.ll[0] - to[0], x.ll[1] - to[1]) - Math.hypot(y.ll[0] - to[0], y.ll[1] - to[1]))[0];
      if (tgt && !tgt.ringed) { // vị trí gần nhất đã có vòng vây: không vẽ vòng thứ hai quanh vị trí khác
        tgt.ringed = true;
        const hp = P(tgt.ll), ring = el('circle', { class: 'fx-ring', cx: hp[0], cy: hp[1], r: 34 / k, fill: 'none', stroke: col, 'stroke-width': 1.6 / k, 'stroke-dasharray': `${3 / k} ${3 / k}`, opacity: 0 }, root);
        anim(r, Math.max(dur, 1), q => { ring.setAttribute('r', String((34 - 19 * ease(q)) / k)); ring.setAttribute('opacity', '0.9'); }, start);
      }
    }
    let lastB = -1, puff = 0;
    anim(r, dur, q => {
      const e = ease(q);
      under.setAttribute('stroke-dashoffset', String(len * (1 - e)));
      if (reveal) line.setAttribute('stroke-dashoffset', String(len * (1 - e)));
      else if (marching) line.setAttribute('stroke-dashoffset', String((act === 'retreat' ? -e * 40 : -e * 60) / k));
      if (pc) {
        pc.g.setAttribute('opacity', airborne && q > 0.97 ? '0' : '1');
        put(e);
        if (pc.rotor && !lite) pc.rotor.setAttribute('transform', `rotate(${q * dur * 1.5})`);
        if (kind === 'armour' && !lite && puff < 3 && q > (puff + 1) * 0.25) { puff++; dust(r, root, c.at(e * 0.74), k); }
      }
      const bk = Math.floor(q * 10);
      if (type === 'air' && act === 'fight' && q > 0.55 && bk !== lastB && bursts < 14) { lastB = bk; bursts++; explode(r, root, c.at(Math.min(1, e + 0.02)), k, 0, 0.55); }
    }, start, () => {
      head.setAttribute('opacity', '1');
      arrived.add(i);
      // tên nơi mũi tên tới (Him Lam, Quang Hòa…): chữ sáng viền tối, đứng thẳng, phía trên đầu mũi tên
      const at = arw[4]?.at;
      if (at) {
        const o = labelSpot(placed, b, k, sy, at);
        const tg = el('g', { transform: `translate(${b[0] + o.dx / k},${b[1] + (o.dy * sy) / k}) scale(${1 / k},${sy / k})`, opacity: 0 }, root);
        const tx = el('text', { class: 'fx-at', 'text-anchor': o.anchor, 'font-size': 10, fill: '#f6efdd', stroke: '#111', 'stroke-width': 2.6, 'stroke-linejoin': 'round', 'paint-order': 'stroke' }, tg);
        tx.textContent = at;
        parts[i].push(tg);
        anim(r, 350, q => tg.setAttribute('opacity', String(q)), 0);
      }
      // quân cờ tới nơi: máy bay bay khỏi; lính dù bung dù rồi đứng lại; trực thăng hạ cánh tung bụi; còn lại dừng trước đầu mũi tên
      if (pc && !airborne) { put(1, 0.85); if (act === 'retreat') pc.g.setAttribute(pc.g.hasAttribute('data-op') ? 'data-op' : 'opacity', '0.7'); }
      if (pc && kind === 'heli' && !calm.matches) {
        const tp = c.at(0.74), dr = el('circle', { cx: tp[0], cy: tp[1], r: 4 / k, fill: 'none', stroke: '#c9bfa8', 'stroke-width': 1.2 / k, opacity: 0.8 }, root);
        anim(r, 700, q => { dr.setAttribute('r', String((4 + 10 * q) / k)); dr.setAttribute('opacity', String(0.8 * (1 - q))); }, 0, () => dr.remove());
      }
      if (pc && kind === 'para') {
        const lp = c.at(0.74); // chỗ lính dù đứng lại (như mọi quân cờ khác)
        for (let j = -1; j <= 1; j++) {
          const cg = el('g', { transform: `translate(${lp[0] + (j * 7) / k},${lp[1] - 16 / k}) scale(${1 / k},${sy / k})`, opacity: 1 }, root);
          el('path', { d: 'M-4,0 A4,4 0 0 1 4,0Z', fill: '#f3ecdc', stroke: '#111', 'stroke-width': 0.6 }, cg);
          el('line', { x1: 0, y1: 0, x2: 0, y2: 5, stroke: '#111', 'stroke-width': 0.6 }, cg);
          anim(r, 1100, q => { cg.setAttribute('transform', `translate(${lp[0] + (j * 7) / k},${lp[1] - (16 * (1 - q)) / k}) scale(${1 / k},${sy / k})`); cg.setAttribute('opacity', String(q < 0.7 ? 1 : (1 - q) / 0.3)); }, j * 120 + 120, () => cg.remove());
        }
        const ground = drawPiece('inf', col, root, sy);
        parts[i].push(ground.g);
        const gp = c.at(0.74), z = 0.85 * piece();
        ground.g.setAttribute('transform', `translate(${gp[0]},${gp[1]}) scale(${z / k},${(z * sy) / k})`);
        later(r, calm.matches ? 0 : 1200, () => { const lineOp = parts[i][1].getAttribute('opacity'); if (lineOp === '0.45') { ground.g.setAttribute('data-op', '1'); ground.g.setAttribute('opacity', '0.45'); } else ground.g.setAttribute('opacity', '1'); });
      }
      if (act === 'fight') {
        // tới mục tiêu: chớp lửa, khói, tiếng nổ
        const big = type === 'siege' ? 1.25 : type === 'uprising' ? 0.6 : 1;
        for (let j = 0; j < (type === 'uprising' ? 1 : 3); j++) explode(r, root, [b[0] + (Math.random() - 0.5) * 14 / k, b[1] + (Math.random() - 0.5) * 10 / k], k, j * 260, big * (1 - j * 0.2));
        if (sounds++ < 6) {
          if (type === 'air') WAR.bomb(0); else WAR.boom(0, i ? 0.25 : 0);
          if (type === 'land' || type === 'siege' || type === 'uprising') WAR.crackle(2.2, type === 'uprising' ? 8 : 14, 0.2, old);
          if (i === 0) { shake(r); buzz(HAPTIC[type] || [25, 40, 60]); } else if (type === 'air' && i < 3) buzz(18);
        }
      } else if (act === 'move') ripple(r, b, k, 0, col);
      else if (act === 'doubt') {
        const qg = el('g', { transform: `translate(${b[0]},${b[1] - 8 / k}) scale(${1 / k},${sy / k})` }, root);
        const tx = el('text', { class: 'fx-q', 'text-anchor': 'middle', y: 0, 'font-size': 13, 'font-weight': 700, fill: '#d8d2c4', stroke: '#111', 'stroke-width': 0.6, 'paint-order': 'stroke', style: 'font-family:var(--mono)' }, qg);
        tx.textContent = '?';
        parts[i].push(qg);
      }
      // giáp chiến: khi cả hai mũi tên của một cặp đã tới
      for (const [x, y] of meets) if ((x === i || y === i) && arrived.has(x) && arrived.has(y)) contact(r, root, P(arrows[x][1]), P(arrows[y][1]), k, SIDE_COLOR[arrows[x][2]] || '#fff', SIDE_COLOR[arrows[y][2]] || '#fff', old);
    });
  });
  if (arrows.length && sc) {
    later(r, L0 + total + OUTRO_AT, () => outcome(r, v, sc, hs, parts, k));
    r.len = 1250 + L0 + total + OUTRO;
  }
  if (!arrows.length) { // chưa có dữ liệu mũi tên: vài chớp lửa tại chỗ
    const p = h.proj(v.l);
    for (let j = 0; j < 4; j++) explode(r, root, [p[0] + (Math.random() - 0.5) * 18 / k, p[1] + (Math.random() - 0.5) * 12 / k], k, T0 + j * 420, 0.9);
    later(r, T0, () => { WAR.boom(0); WAR.crackle(2.4, 12, 0.2); shake(r); buzz(HAPTIC[type] || [25, 40, 60]); });
    void v;
  }
}

/* ---------- cảnh di chuyển (chuyến đi, di cư, hành quân, rút quân, khởi nghĩa) ---------- */
/** Đường mượt qua các điểm (Catmull-Rom → Bézier bậc ba). */
function smooth(pts: [number, number][]): string {
  if (pts.length < 3) return `M${pts[0]} L${pts[pts.length - 1]}`;
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    d += ` C${p1[0] + (p2[0] - p0[0]) / 6},${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6},${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]},${p2[1]}`;
  }
  return d;
}

function movement(r: Run, v: HistEvent, mv: Move): void {
  const h = fxHost();
  if (!h || !r.root) return;
  ensureDefs(h.defs);
  const k = h.k(), root = r.root, T0 = 120;
  // mít tinh / khởi nghĩa gọn trong một vùng: phóng sơ đồ như với trận đánh
  const P = fitScale(h, [v.l, ...mv.paths.flatMap(p => [p[0], ...p[1], p[2]])], 0.7);
  // âm thanh theo lối đi: chỉ có tàu thì còi tàu, sóng; có đường bộ thì tiếng đoàn người / bước quân; có máy bay thì tiếng động cơ
  const sea = mv.paths.some(p => p[5] === 'sea'), land = mv.paths.some(p => p[5] === 'land');
  if (mv.type === 'uprising' || mv.type === 'crowd') WAR.crowd(T0 / 1000);
  else if (land && mv.type === 'march') WAR.march(8, T0 / 1000);
  else if (land && mv.type === 'withdrawal') WAR.rumble(4, T0 / 1000);
  if (sea) { WAR.horn(T0 / 1000 + 0.2); WAR.waves(5, T0 / 1000 + 1); }
  const bt = beats(v), B = offsets(bt), total = bt.reduce((a, x) => a + x, 0), parts: Element[][] = [];
  const MODE: Record<string, string> = { land: 'Đường bộ', sea: 'Đường biển', air: 'Đường không' };
  mv.paths.forEach(([from, via, to, side, note, mode], i) => {
    const pts = [P(from), ...via.map(P), P(to)], d = smooth(pts);
    const col = SIDE_COLOR[side] || '#f1e6c8', thin = mv.type === 'exodus' || mv.type === 'uprising' || mv.type === 'crowd';
    // Đường dài (đi Pháp, vượt biển) phủ cả bản đồ: vẽ dần cả một path thì mỗi khung hình trình duyệt vẽ lại cả bản đồ.
    // Lấy mẫu đường cong một lần (LUT), chia thành các đoạn ngắn; mỗi khung hình chỉ đoạn đang vẽ thay đổi.
    const probe = el('path', { d, fill: 'none', stroke: 'none' }, root), len = probe.getTotalLength() || 1, lenPx = len * k;
    const N = Math.max(24, Math.min(240, Math.round(lenPx / 3)));
    const L: [number, number][] = [];
    for (let j = 0; j <= N; j++) { const q = probe.getPointAtLength((len * j) / N); L.push([q.x, q.y]); }
    probe.remove();
    const S_ = Math.max(3, Math.min(24, Math.round(lenPx / 40))), per = N / S_;
    // viền tối: các đoạn tô đặc, độ trong 0,5 đặt ở cả nhóm (ghép một lần, chỗ nối không đậm lên)
    const gU = el('g', {}, root), gU2 = el('g', { opacity: 0.5 }, gU), gL = el('g', {}, root), P_ = 10 / k;
    let cum = 0;
    const segs = Array.from({ length: S_ }, (_, j) => {
      const a = Math.round(j * per), b = Math.round((j + 1) * per), sd = 'M' + L.slice(a, b + 1).map(p => `${p[0]},${p[1]}`).join(' L');
      const u = el('path', { d: sd, fill: 'none', stroke: '#0b0b0b', 'stroke-width': (thin ? 5 : 6.5) / k, 'stroke-linecap': 'round' }, gU2);
      const ln = el('path', { d: sd, fill: 'none', stroke: col, 'stroke-width': (thin ? 2.2 : 3) / k, 'stroke-linecap': 'round' }, gL);
      const sl = u.getTotalLength() || 0.001;
      // ẩn bằng khoảng trống dài hơn đoạn: không còn vạch dài 0 ở cuối đoạn (Chrome vẽ thành chấm tròn)
      const hide = `${sl} ${sl * 2 + 1}`;
      u.setAttribute('stroke-dasharray', hide); u.setAttribute('stroke-dashoffset', String(sl));
      if (mv.type === 'withdrawal') { // rút quân: nét đứt hiện theo đoạn, nối tiếp nhịp nét của đoạn trước
        ln.setAttribute('stroke-dasharray', `${6 / k} ${4 / k}`); ln.setAttribute('stroke-dashoffset', String(cum % P_)); ln.setAttribute('opacity', '0');
      } else { ln.setAttribute('stroke-dasharray', hide); ln.setAttribute('stroke-dashoffset', String(sl)); }
      cum += sl;
      return { a, b, sl, u, ln, done: false };
    });
    // quân cờ trên đường: tàu (đường biển), máy bay, đoàn người (di cư, khởi nghĩa), đoàn quân (hành quân, rút quân);
    // chuyến đi của một người: chấm sáng
    const pk: Kind | null = mode === 'air' ? 'plane' : mode === 'sea' ? 'boat' : thin ? 'crowd' : mv.type === 'march' || mv.type === 'withdrawal' ? kindOf(note, 'land') : null;
    let g: SVGGElement;
    if (pk) g = drawPiece(pk, col, root).g;
    else { g = el('g', { opacity: 0 }, root); el('circle', { r: 4.2, fill: col, stroke: '#111', 'stroke-width': 1 }, g); el('circle', { r: 8, fill: 'none', stroke: col, 'stroke-width': 1, opacity: 0.5 }, g); }
    const dur = calm.matches ? 1 : Math.max(1600, Math.min(4800, lenPx * 9));
    const start = T0 + B[i];
    parts[i] = [gU, gL];
    if (mv.paths.length > 1) parts[i].push(badge(root, pts[0], k, i + 1, col));
    later(r, start, () => beat(r, parts, i, beatHtml(side, v.y, note, i, mv.paths.length, MODE[mode] ? ' · ' + MODE[mode] : ''), col));
    if (mode === 'air') later(r, start, () => WAR.plane(0)); // tiếng máy bay cùng lúc máy bay cất cánh
    let cur = 0;
    anim(r, dur, q => {
      const e = q < 0.5 ? 2 * q * q : 1 - Math.pow(-2 * q + 2, 2) / 2, h = e * N;
      // đoạn đã qua: vẽ đủ (một lần); đoạn đang vẽ: lộ dần; đoạn sau: chưa động tới
      while (cur < S_ && segs[cur].b <= h) {
        const sg = segs[cur++];
        if (!sg.done) { sg.done = true; sg.u.setAttribute('stroke-dashoffset', '0'); if (mv.type === 'withdrawal') sg.ln.setAttribute('opacity', '1'); else sg.ln.setAttribute('stroke-dashoffset', '0'); }
      }
      if (cur < S_) {
        const sg = segs[cur], f = Math.max(0, Math.min(1, (h - sg.a) / (sg.b - sg.a || 1))), off = String(sg.sl * (1 - f));
        sg.u.setAttribute('stroke-dashoffset', off);
        if (mv.type === 'withdrawal') { if (f > 0.5) sg.ln.setAttribute('opacity', '1'); } else sg.ln.setAttribute('stroke-dashoffset', off);
      }
      const j = Math.min(N - 1, Math.floor(h)), t = Math.min(1, h - j), p0 = L[j], p1 = L[j + 1];
      const x = p0[0] + (p1[0] - p0[0]) * t, y = p0[1] + (p1[1] - p0[1]) * t;
      g.setAttribute('opacity', q > 0.98 ? '0' : '1');
      g.setAttribute('transform', `translate(${x},${y}) rotate(${(Math.atan2(p1[1] - p0[1], p1[0] - p0[0]) * 180) / Math.PI}) scale(${1 / k})`);
    }, start, () => {
      const end = pts[pts.length - 1];
      if (mv.type === 'uprising' || mv.type === 'crowd' || mv.type === 'march') ripple(r, end, k, 0, col);
      else { const dot = el('circle', { cx: end[0], cy: end[1], r: 3.2 / k, fill: col, stroke: '#111', 'stroke-width': 1 / k }, root); void dot; }
    });
  });
  later(r, T0 + total, () => closing(r, parts, mv.paths.map(x => x[3]), v.y));
  r.len = 1250 + T0 + total;
}

/* ---------- hiệp ước ---------- */
function treaty(r: Run, v: HistEvent): void {
  const h = fxHost();
  if (!h || !r.root) return;
  // Ấn triện trung tính (vuông, màu son, ghi năm ký), không mang biểu tượng của bên nào; đóng lệch lên phải để không
  // che tên thành phố.
  const k = h.k(), p0 = h.proj(v.l), p: [number, number] = [p0[0] + 20 / k, p0[1] - 18 / k];
  const g = el('g', { transform: `translate(${p[0]},${p[1]}) scale(${1 / k})`, opacity: 0 }, r.root);
  el('rect', { x: -15, y: -15, width: 30, height: 30, rx: 2.5, fill: '#b23a2e', stroke: '#5c1a12', 'stroke-width': 1.2 }, g);
  el('rect', { x: -11.5, y: -11.5, width: 23, height: 23, rx: 1.5, fill: 'none', stroke: '#f3e2c0', 'stroke-width': 1 }, g);
  const t = el('text', { y: 4, 'text-anchor': 'middle', 'font-size': 10.5, 'font-weight': 700, fill: '#f3e2c0', style: 'font-family:var(--mono);letter-spacing:-.04em' }, g);
  t.textContent = String(v.y);
  const T0 = 700;
  WAR.quill(0);
  anim(r, calm.matches ? 1 : 420, q => {
    const s = 2.4 - 1.4 * ease(q);
    g.setAttribute('opacity', String(Math.min(1, q * 2)));
    g.setAttribute('transform', `translate(${p[0]},${p[1]}) scale(${s / k}) rotate(${-8 - 10 * (1 - q)})`);
  }, T0, () => { SND.stamp(); buzz([10, 30, 40]); ripple(r, p0, k, 0, '#e8c46a'); });
}

function ripple(r: Run, p: [number, number], k: number, delay: number, color: string): void {
  if (!r.root) return;
  for (let i = 0; i < 3; i++) {
    const c = el('circle', { cx: p[0], cy: p[1], r: 0, fill: 'none', stroke: color, 'stroke-width': 1.6 / k, opacity: 0 }, r.root);
    anim(r, 1700, q => { c.setAttribute('r', String((6 + 46 * ease(q)) / k)); c.setAttribute('opacity', String(0.75 * (1 - q))); }, delay + i * 380);
  }
}

/* ---------- phim tư liệu (Ken Burns) ---------- */
async function reel(r: Run, v: HistEvent): Promise<void> {
  if (v.diary) return;
  const w = await Promise.race([wikiFor(v), new Promise<null>(res => setTimeout(() => res(null), 4000))]);
  if (!r.alive || !w) return;
  // có phim tư liệu (Commons) và mạng không tiết kiệm dữ liệu: chiếu phim câm, lặp; hỏng thì về ảnh
  const vid = w.media.find(m => m.type === 'video' && !m.bad);
  const net = (navigator as unknown as { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  if (vid && !calm.matches && !(net && (net.saveData || /2g/.test(net.effectiveType || '')))) {
    const url = await Promise.race([videoUrl(vid, true).catch(() => ''), new Promise<string>(res => setTimeout(() => res(''), 4000))]);
    if (!r.alive) return;
    if (url && (await film(r, v, url, vid.thumb || vid.src))) return;
  }
  const im = w.media.find(m => m.type === 'image' && !m.bad);
  const src = im ? im.thumb || im.src : ''; // ảnh nhỏ đủ cho khung ≤ 230 px
  if (!im || !(await Promise.race([probe(src, 120), new Promise<boolean>(res => setTimeout(() => res(false), 5000))])) || !r.alive) return;
  const box = document.createElement('button');
  box.className = 'reel' + (v.y < 1976 ? ' old' : '');
  box.dataset.a = 'ev';
  box.dataset.id = v.id;
  box.setAttribute('aria-label', 'Tư liệu hình ảnh: ' + v.t);
  const dir = Math.random() < 0.5 ? -1 : 1;
  box.style.setProperty('--kx', `${dir * 6}%`);
  box.style.setProperty('--ky', `${(Math.random() - 0.5) * 6}%`);
  box.innerHTML = `<img alt="" src="${src.replace(/"/g, '&quot;')}"><i class="flick"></i><span class="mono">Tư liệu · ${v.y}</span>`;
  place(box, r);
  document.getElementById('mapwrap')?.appendChild(box);
  r.reel = box;
  requestAnimationFrame(() => box.classList.add('on'));
}

/** Đặt khung tư liệu vào góc ít che cảnh nhất (trên trái, dưới trái, dưới phải; góc trên phải có nút zoom, tiêu đề).
    Trận đánh nghiêng 3D giữ góc trên trái (dải sương), vì toạ độ màn hình của bản đồ nghiêng không tính phẳng được. */
function place(box: HTMLElement, r: Run): void {
  const wrap = document.getElementById('mapwrap');
  if (!wrap || !r.root || wrap.classList.contains('tilt')) return;
  const R = wrap.getBoundingClientRect(), bar = barEl()?.getBoundingClientRect();
  const bw = Math.min(R.width * 0.4, 230), bh = Math.min(bw * 0.75, R.height * 0.32), low = (bar ? R.bottom - bar.top : 0) + 10 + Math.max(capH(), r.lt?.offsetHeight || 0) + 8;
  const pts: [number, number][] = [];
  const add = (m: DOMMatrix | null, x: number, y: number) => { if (m) pts.push([m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f]); };
  const ps = r.root.querySelectorAll<SVGPathElement>('path'), nS = ps.length > 40 ? 2 : 16; // nhiều đoạn ngắn (cảnh di chuyển): lấy hai đầu mỗi đoạn
  ps.forEach(p => {
    const m = p.getScreenCTM(), L = p.getTotalLength();
    for (let i = 0; i <= nS; i++) { const q = p.getPointAtLength((L * i) / nS); add(m, q.x, q.y); }
  });
  r.root.querySelectorAll<SVGCircleElement>('circle').forEach(c => add(c.getScreenCTM(), c.cx.baseVal.value, c.cy.baseVal.value));
  const spots: { s: Partial<CSSStyleDeclaration>; x: number; y: number }[] = [
    { s: {}, x: R.left + 10, y: R.top + 46 },
    { s: { top: 'auto', bottom: `${low}px` }, x: R.left + 10, y: R.bottom - low - bh },
    { s: { top: 'auto', bottom: `${low}px`, left: 'auto', right: '10px' }, x: R.right - 10 - bw, y: R.bottom - low - bh },
  ];
  // cột nút zoom (trên phải) là vật cản: góc nào chạm vào nó thì không dùng (khung tư liệu sẽ che, nhận nhầm cú chạm)
  const zc = document.querySelector('.zoomc')?.getBoundingClientRect();
  const blocked = (o: { x: number; y: number }) => !!zc && o.x < zc.right + 6 && o.x + bw > zc.left - 6 && o.y < zc.bottom + 6 && o.y + bh > zc.top - 6;
  const hits = spots.map(o => (blocked(o) ? Infinity : pts.filter(([x, y]) => x > o.x - 8 && x < o.x + bw + 8 && y > o.y - 8 && y < o.y + bh + 8).length));
  Object.assign(box.style, spots[hits.indexOf(Math.min(...hits))].s);
}

/** Khung phim tư liệu: video câm, lặp, chạy chậm cùng hiệu ứng phim cũ; trả về false nếu không phát được trong 5 s. */
function film(r: Run, v: HistEvent, url: string, poster: string): Promise<boolean> {
  return new Promise(res => {
    const box = document.createElement('button');
    box.className = 'reel film' + (v.y < 1976 ? ' old' : '');
    box.dataset.a = 'ev';
    box.dataset.id = v.id;
    box.setAttribute('aria-label', 'Phim tư liệu: ' + v.t);
    const vd = document.createElement('video');
    Object.assign(vd, { muted: true, loop: true, playsInline: true, autoplay: true, preload: 'auto' });
    vd.setAttribute('muted', ''); vd.setAttribute('playsinline', '');
    vd.poster = poster;
    vd.src = url;
    box.appendChild(vd);
    box.insertAdjacentHTML('beforeend', `<i class="flick"></i><span class="mono">Phim tư liệu · ${v.y}</span>`);
    let done = false;
    const unload = () => { vd.removeAttribute('src'); vd.load(); box.remove(); };
    const fail = () => { if (done) return; done = true; clearTimeout(t); if (r.reel === box) r.reel = null; unload(); res(false); };
    const ok = () => { if (done) return; done = true; clearTimeout(t); if (!r.alive) { unload(); res(true); return; } requestAnimationFrame(() => box.classList.add('on')); res(true); };
    vd.addEventListener('playing', ok, { once: true });
    vd.addEventListener('error', fail, { once: true });
    const t = setTimeout(fail, 5000);
    place(box, r);
    document.getElementById('mapwrap')?.appendChild(box);
    r.reel = box; // endScene dừng và gỡ phim cả khi nó còn đang tải
    vd.play().catch(fail);
  });
}

/* ---------- vào / ra ---------- */
/** Các điểm cần thấy trong khung khi phát cảnh của sự kiện v (mũi tiến quân, vị trí giữ, chính sự kiện); null nếu không có cảnh. */
export function sceneFrame(v: HistEvent): [number, number][] | null {
  if (!fxOn()) return null;
  const sc = v.k === 'Trận đánh' ? SCENES[v.id] : undefined;
  if (sc) return [v.l, ...sc.arrows.flatMap(a => [a[0], a[1]]), ...sc.hold.map(h => [h[0], h[1]] as [number, number])];
  const mv = MOVES[v.id];
  if (mv) return [v.l, ...mv.paths.flatMap(p => [p[0], ...p[1], p[2]])];
  return null;
}

/** Sự kiện có cảnh động riêng (trận đánh có sơ đồ, hoặc cảnh di chuyển): tour ưu tiên đưa vào. */
export const hasScene = (v: HistEvent): boolean => (v.k === 'Trận đánh' && !!SCENES[v.id]) || !!MOVES[v.id];

/** Lúc (ms từ đầu cảnh) khung tư liệu bắt đầu tải: trận đánh / cảnh di chuyển chờ các mũi tên vẽ gần xong để không che chúng. */
function reelAt(v: HistEvent): number {
  const b = beats(v);
  return b.length ? 1250 + 120 + lead(v) + offsets(b)[Math.min(2, b.length - 1)] + 1600 : 0;
}
/** Bước tour không có giọng đọc giữ cảnh bao lâu: đủ đọc hết các nhịp (phụ đề) rồi nhìn thêm chút. */
export const sceneHold = (v: HistEvent): number => Math.min(24000, Math.max(6500, sceneLen(v) + 2500));

/** Phát cảnh cho bước tour đang ở sự kiện v (gọi ngay khi bản đồ bắt đầu bay tới). */
/** `onStep`: vừa nhảy nhịp (tour hẹn lại bước); `onNext`: chạm phụ đề khi đã hết nhịp. */
export function playScene(v: HistEvent, hold = Infinity, onEnd?: () => void, onStep?: () => void, onNext?: () => void, onClose?: () => void): void {
  endScene();
  document.querySelectorAll('#mapwrap .lt.out').forEach(n => n.remove()); // phụ đề cảnh trước: gỡ ngay, không mờ dần dưới cảnh mới
  if (!fxOn() || document.hidden || document.querySelector('#layer .pane')) return; // bảng Nhân vật / Sử liệu / Hồ sơ đang phủ bản đồ
  const h = fxHost();
  const r: Run = { id: v.id, q: [], qt: 0, skew: 0, marks: [], parts: [], raf: 0, root: null, reel: null, lt: null, len: sceneLen(v), t0: performance.now(), alive: true, onEnd, onStep, onNext, onClose };
  cur = r;
  WAR.open();
  if (h) r.root = el('g', { class: 'scene' }, h.g);
  // các mốc nhịp biết trước từ dữ liệu (cảnh vẽ lúc DRAW_AT): "›" khi bản đồ còn đang bay / thẻ tên trận còn hiện thì
  // sang nhịp đầu, không bỏ qua cả trận
  const bt = beats(v);
  if (h && !v.diary && bt.length) {
    const base = DRAW_AT + 120 + lead(v), B = offsets(bt), total = bt.reduce((a, x) => a + x, 0);
    r.marks = [...B.map(b => base + b), base + total + (lead(v) ? OUTRO_AT : 0)];
    r.closes = !!lead(v);
    r.list = beatList(r, v);
  }
  // trận đánh: khung tư liệu hiện sau khi các mũi tiến quân đã tới, để không che chúng
  const at = reelAt(v);
  // bước sẽ dừng (mở thẻ) trước khi khung tư liệu kịp hiện ~2 s: bỏ, khỏi tải phim / ảnh rồi gỡ ngay
  if (at && hold - at < 2000) { /* không chiếu tư liệu */ } else if (at) later(r, at, () => void reel(r, v)); else void reel(r, v);
  if (v.diary) return;
  if (v.k === 'Trận đánh' && !calm.matches) document.getElementById('mapwrap')?.classList.add('tilt');
  const sc = v.k === 'Trận đánh' ? SCENES[v.id] : undefined;
  if (!sc && MOVES[v.id]) document.getElementById('mapwrap')?.classList.add('scn'); // cảnh di chuyển: nền lùi, nhãn dân số / tên sự kiện nhường chỗ
  if (sc) {
    titleCard(r, v, sc);
    later(r, 120, () => { if (!speaking()) WAR.sting(sc.type); }); // một tiếng mở trận, xong trước lời kể (voiceAt)
  }
  // vẽ khi bản đồ đã bay tới nơi (zoomTo 1,2 s): kích thước chớp lửa, đầu mũi tên tính theo zoom lúc đó
  later(r, DRAW_AT, () => {
    if (v.k === 'Trận đánh') battle(r, v, SCENES[v.id]);
    else if (MOVES[v.id]) movement(r, v, MOVES[v.id]);
    else if (v.k === 'Hiệp ước') treaty(r, v);
    else if (h) ripple(r, h.proj(v.l), h.k(), 0, S.theme === 'night' ? '#e8c46a' : '#a8322b');
  });
}

/** Dừng cảnh đang chạy: cắt âm thanh của cảnh, xoá hiệu ứng, trả bản đồ về phẳng, cất khung tư liệu.
    `instant`: phẳng ngay không chuyển tiếp (khi người dùng vừa chạm / vuốt bản đồ). */
export function endScene(instant = false): void {
  const r = cur;
  cur = null;
  WAR.close();
  const m = document.getElementById('map'), wrap = document.getElementById('mapwrap');
  if (instant && m && wrap?.classList.contains('tilt')) { m.style.transition = 'none'; wrap.classList.remove('tilt'); void m.getBoundingClientRect(); m.style.transition = ''; }
  wrap?.classList.remove('tilt');
  m?.classList.remove('shake');
  if (!r) return;
  r.alive = false;
  clearTimeout(r.qt);
  r.q = [];
  if (r.list) {
    const had = r.list.contains(document.activeElement);
    r.list.hidden = true; r.list.innerHTML = '';
    if (had) requestAnimationFrame(focusFallback); // đang đứng trên một nhịp của danh sách: không để tiêu điểm rơi về <body>
  }
  if (r.raf) cancelAnimationFrame(r.raf);
  if (r.root) {
    const g = r.root;
    g.style.transition = 'opacity .5s';
    g.style.opacity = '0';
    setTimeout(() => g.remove(), 520);
  }
  if (r.lt) { const b = r.lt; b.classList.add('out'); setTimeout(() => b.remove(), 320); }
  r.ttl?.remove();
  r.slug?.remove();
  r.stamp?.remove();
  wrap?.classList.remove('scn');
  wrap?.style.removeProperty('--rx');
  wrap?.style.removeProperty('--cs');
  if (m) m.style.transitionDuration = '';
  if (r.reel) { const b = r.reel; b.classList.remove('on'); b.querySelector('video')?.pause(); setTimeout(() => { const vd = b.querySelector('video'); if (vd) { vd.removeAttribute('src'); vd.load(); } b.remove(); }, 520); }
  const f = r.onEnd;
  r.onEnd = undefined;
  f?.();
}

// thẻ trình duyệt bị ẩn / khoá máy: dừng cảnh (rAF dừng nhưng hẹn giờ vẫn chạy, tránh dồn hiệu ứng khi quay lại)
document.addEventListener('visibilitychange', () => { if (document.hidden) endScene(); });
