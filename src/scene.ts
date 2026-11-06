import type { HistEvent } from './data';
import { SCENES, MOVES, SIDE_COLOR, type Scene, type Move } from './data/scenes';
import { fxHost } from './map';
import { WAR, SND, buzz } from './audio';
import { S } from './state';
import { wikiFor, probe, videoUrl } from './wiki';

/* Cảnh động trong tour chương: trận đánh có bản đồ nghiêng 3D, mũi tiến quân vẽ dần, chớp lửa, khói, rung khung và
   âm thanh chiến trường; hiệp ước có ấn triện đóng xuống; mọi sự kiện có khung "phim tư liệu" với ảnh của chính sự
   kiện chạy chậm (Ken Burns). Mọi thứ dừng ngay khi tour sang bước khác, tạm dừng hay dừng hẳn. */

const NS = 'http://www.w3.org/2000/svg';
const calm = matchMedia('(prefers-reduced-motion: reduce)');
type Part = { t0: number; dur: number; step: (p: number) => void; done?: () => void };
interface Run { id: string; timers: number[]; parts: Part[]; raf: number; root: SVGGElement | null; reel: HTMLElement | null; alive: boolean }
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

function later(r: Run, ms: number, f: () => void): void {
  r.timers.push(window.setTimeout(() => { if (r.alive) f(); }, ms));
}
function anim(r: Run, dur: number, step: (p: number) => void, delay = 0, done?: () => void): void {
  later(r, delay, () => {
    if (calm.matches) { step(1); done?.(); return; } // giảm chuyển động: vẽ thẳng trạng thái cuối
    r.parts.push({ t0: performance.now(), dur, step, done });
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

function glyph(type: Scene['type'], root: SVGGElement, color: string): SVGGElement {
  const g = el('g', {}, root);
  if (type === 'air') el('path', { d: 'M0,-7 L1.6,-2 L8,1 L8,2.6 L1.6,1.4 L1,5 L3,6.6 L3,7.6 L0,7 L-3,7.6 L-3,6.6 L-1,5 L-1.6,1.4 L-8,2.6 L-8,1 L-1.6,-2Z', fill: color, stroke: '#111', 'stroke-width': 0.8, transform: 'rotate(90)' }, g);
  else el('path', { d: 'M-8,-2.5 L6,-2.5 L9,0 L6,2.5 L-8,2.5 L-6,0Z', fill: color, stroke: '#111', 'stroke-width': 0.8 }, g);
  return g;
}

function battle(r: Run, v: HistEvent, sc: Scene | undefined): void {
  const h = fxHost();
  if (!h || !r.root) return;
  ensureDefs(h.defs);
  const k = h.k(), root = r.root, type = sc?.type || 'land';
  // Trận gọn trong vài km: phóng sơ đồ quanh vị trí sự kiện cho tới khi chiếm gần nửa khung (minh hoạ, không phải tỉ lệ thật)
  const c0 = h.proj(v.l), pts = (sc?.arrows || []).flatMap(a => [h.proj(a[0]), h.proj(a[1])]).concat((sc?.hold || []).map(x => h.proj([x[0], x[1]])));
  const span = pts.length ? Math.max(...pts.map(p => Math.max(Math.abs(p[0] - c0[0]), Math.abs(p[1] - c0[1])))) * 2 * k : 0;
  const f = span > 0 ? Math.max(1, 150 / span) : 1;
  const P = (l: [number, number]): [number, number] => { const p = h.proj(l); return [c0[0] + (p[0] - c0[0]) * f, c0[1] + (p[1] - c0[1]) * f]; };
  const arrows = sc?.arrows.length ? sc.arrows : [];
  const T0 = 120; // gọi sau khi bản đồ đã bay tới (playScene hẹn 1,25 s), để hệ số zoom k đã đúng
  // vị trí được giữ: vòng sáng nhấp nháy
  for (const [lo, la, side] of sc?.hold || []) {
    const p = P([lo, la]), g = el('g', { transform: `translate(${p[0]},${p[1]}) scale(${1 / k})` }, root);
    const ring = el('circle', { r: 9, fill: 'none', stroke: SIDE_COLOR[side] || '#fff', 'stroke-width': 2, opacity: 0 }, g);
    el('rect', { x: -4, y: -4, width: 8, height: 8, transform: 'rotate(45)', fill: SIDE_COLOR[side] || '#fff', stroke: '#111', 'stroke-width': 1.2 }, g);
    anim(r, 5200, q => { const w = (q * 4) % 1; ring.setAttribute('r', String(7 + 9 * w)); ring.setAttribute('opacity', String(0.8 * (1 - w))); }, T0 - 300);
  }
  if (type === 'land' || type === 'siege') WAR.rumble(5.5, T0 / 1000);
  if (type === 'naval' || type === 'landing') WAR.waves(5, T0 / 1000);
  if (type === 'uprising') WAR.crowd(T0 / 1000);
  let bursts = 0, sounds = 0; // chớp lửa dọc đường bay (máy bay) và tiếng nổ khi tới mục tiêu: hai ngân sách riêng
  arrows.forEach(([from, to, side], i) => {
    const a = P(from), b = P(to), c = curve(a, b, (i % 2 ? -1 : 1) * 0.16);
    const col = SIDE_COLOR[side] || '#ffd84a';
    // nét tính theo đơn vị bản đồ chia cho zoom (không dùng non-scaling-stroke: nó làm pathLength / nét đứt sai trên Chrome)
    const under = el('path', { d: c.d, fill: 'none', stroke: '#0b0b0b', 'stroke-opacity': 0.55, 'stroke-width': 7 / k, 'stroke-linecap': 'round' }, root);
    const line = el('path', { d: c.d, fill: 'none', stroke: col, 'stroke-width': (type === 'uprising' ? 2.4 : 3.4) / k, 'stroke-linecap': 'round' }, root);
    if (type === 'naval' || type === 'landing') line.setAttribute('stroke-dasharray', `${7 / k} ${5 / k}`);
    const len = line.getTotalLength() || 1;
    for (const p of [under, line]) if (!(type === 'naval' || type === 'landing') || p === under) { p.setAttribute('stroke-dasharray', `${len} ${len}`); p.setAttribute('stroke-dashoffset', String(len)); }
    const head = el('g', { transform: `translate(${b[0]},${b[1]}) rotate(${c.ang}) scale(${1 / k})`, opacity: 0 }, root);
    el('path', { d: 'M-2,-7 L9,0 L-2,7 L1,0Z', fill: col, stroke: '#111', 'stroke-width': 1.2, 'stroke-linejoin': 'round' }, head);
    const start = T0 + i * (type === 'uprising' ? 260 : 520), dur = calm.matches ? 1 : type === 'air' ? 1500 : 1900;
    const mover = type === 'naval' || type === 'landing' || type === 'air' ? glyph(type, root, col) : null;
    if (mover) mover.setAttribute('opacity', '0');
    if (type === 'air') WAR.plane(start / 1000);
    let lastB = -1;
    anim(r, dur, q => {
      const e = ease(q);
      under.setAttribute('stroke-dashoffset', String(len * (1 - e)));
      if (!(type === 'naval' || type === 'landing')) line.setAttribute('stroke-dashoffset', String(len * (1 - e)));
      else line.setAttribute('stroke-dashoffset', String(-e * 60 / k));
      if (mover) { const p = c.at(e), p2 = c.at(Math.min(1, e + 0.02)); mover.setAttribute('opacity', q > 0.97 ? '0' : '1'); mover.setAttribute('transform', `translate(${p[0]},${p[1]}) rotate(${(Math.atan2(p2[1] - p[1], p2[0] - p[0]) * 180) / Math.PI}) scale(${1 / k})`); }
      const bk = Math.floor(q * 10);
      if (type === 'air' && q > 0.55 && bk !== lastB && bursts < 14) { lastB = bk; bursts++; explode(r, root, c.at(Math.min(1, e + 0.02)), k, 0, 0.55); }
    }, start, () => {
      head.setAttribute('opacity', '1');
      // tới mục tiêu: chớp lửa, khói, tiếng nổ
      const big = type === 'siege' ? 1.25 : type === 'uprising' ? 0.6 : 1;
      for (let j = 0; j < (type === 'uprising' ? 1 : 3); j++) explode(r, root, [b[0] + (Math.random() - 0.5) * 14 / k, b[1] + (Math.random() - 0.5) * 10 / k], k, j * 260, big * (1 - j * 0.2));
      if (sounds++ < 6) {
        if (type === 'air') WAR.bomb(0); else WAR.boom(0, i ? 0.25 : 0);
        if (type === 'land' || type === 'siege' || type === 'uprising') WAR.crackle(2.2, type === 'uprising' ? 8 : 14, 0.2);
        if (i === 0) { shake(r); buzz([25, 40, 60]); }
      }
    });
  });
  if (!arrows.length) { // chưa có dữ liệu mũi tên: vài chớp lửa tại chỗ
    const p = h.proj(v.l);
    for (let j = 0; j < 4; j++) explode(r, root, [p[0] + (Math.random() - 0.5) * 18 / k, p[1] + (Math.random() - 0.5) * 12 / k], k, T0 + j * 420, 0.9);
    later(r, T0, () => { WAR.boom(0); WAR.crackle(2.4, 12, 0.2); shake(r); buzz([25, 40, 60]); });
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
  const c0 = h.proj(v.l), all = mv.paths.flatMap(p => [p[0], ...p[1], p[2]]).map(l => h.proj(l));
  const span = Math.max(...all.map(p => Math.max(Math.abs(p[0] - c0[0]), Math.abs(p[1] - c0[1])))) * 2 * k;
  const f = span > 0 ? Math.max(1, 120 / span) : 1;
  const P = (l: [number, number]): [number, number] => { const p = h.proj(l); return [c0[0] + (p[0] - c0[0]) * f, c0[1] + (p[1] - c0[1]) * f]; };
  // âm thanh theo lối đi: chỉ có tàu thì còi tàu, sóng; có đường bộ thì tiếng đoàn người / bước quân; có máy bay thì tiếng động cơ
  const sea = mv.paths.some(p => p[5] === 'sea'), land = mv.paths.some(p => p[5] === 'land'), air = mv.paths.findIndex(p => p[5] === 'air');
  if (mv.type === 'uprising' || mv.type === 'crowd') WAR.crowd(T0 / 1000);
  else if (land && mv.type === 'march') WAR.march(8, T0 / 1000);
  else if (land && mv.type === 'withdrawal') WAR.rumble(4, T0 / 1000);
  if (sea) { WAR.horn(T0 / 1000 + 0.2); WAR.waves(5, T0 / 1000 + 1); }
  if (air >= 0) WAR.plane((T0 + air * 700) / 1000 + 0.3);
  mv.paths.forEach(([from, via, to, side, , mode], i) => {
    const pts = [P(from), ...via.map(P), P(to)], d = smooth(pts);
    const col = SIDE_COLOR[side] || '#f1e6c8', thin = mv.type === 'exodus' || mv.type === 'uprising' || mv.type === 'crowd';
    const under = el('path', { d, fill: 'none', stroke: '#0b0b0b', 'stroke-opacity': 0.5, 'stroke-width': (thin ? 5 : 6.5) / k, 'stroke-linecap': 'round' }, root);
    const line = el('path', { d, fill: 'none', stroke: col, 'stroke-width': (thin ? 2.2 : 3) / k, 'stroke-linecap': 'round' }, root);
    if (mv.type === 'withdrawal') line.setAttribute('stroke-dasharray', `${6 / k} ${4 / k}`);
    const len = line.getTotalLength() || 1;
    under.setAttribute('stroke-dasharray', `${len} ${len}`); under.setAttribute('stroke-dashoffset', String(len));
    if (mv.type !== 'withdrawal') { line.setAttribute('stroke-dasharray', `${len} ${len}`); line.setAttribute('stroke-dashoffset', String(len)); }
    // vật đi trên đường: tàu (đường biển), máy bay, đoàn quân / đoàn người (đường bộ)
    const g = el('g', { opacity: 0 }, root);
    if (mode === 'air') el('path', { d: 'M9,0 L4,-1.2 L-1,-8 L-3,-8 L-0.5,-1.4 L-6,-1.2 L-8,-4 L-9.5,-4 L-8.5,0 L-9.5,4 L-8,4 L-6,1.2 L-0.5,1.4 L-3,8 L-1,8 L4,1.2Z', fill: col, stroke: '#111', 'stroke-width': 0.8 }, g);
    else if (mode === 'sea') el('path', { d: 'M-8,-2.5 L6,-2.5 L9,0 L6,2.5 L-8,2.5 L-6,0Z', fill: col, stroke: '#111', 'stroke-width': 0.8 }, g);
    else if (mv.type === 'march' || mv.type === 'withdrawal') { for (let j = 0; j < 3; j++) el('rect', { x: -9 + j * 6, y: -2.5, width: 4.5, height: 5, rx: 1, fill: col, stroke: '#111', 'stroke-width': 0.7 }, g); }
    else { el('circle', { r: 4.2, fill: col, stroke: '#111', 'stroke-width': 1 }, g); el('circle', { r: 8, fill: 'none', stroke: col, 'stroke-width': 1, opacity: 0.5 }, g); }
    const lenPx = len * k, dur = calm.matches ? 1 : Math.max(1600, Math.min(4800, lenPx * 9));
    const start = T0 + i * (thin ? 280 : 700);
    anim(r, dur, q => {
      const e = q < 0.5 ? 2 * q * q : 1 - Math.pow(-2 * q + 2, 2) / 2;
      under.setAttribute('stroke-dashoffset', String(len * (1 - e)));
      if (mv.type !== 'withdrawal') line.setAttribute('stroke-dashoffset', String(len * (1 - e)));
      else line.setAttribute('stroke-dashoffset', String((-e * 40) / k));
      const a = line.getPointAtLength(len * e), b = line.getPointAtLength(Math.min(len, len * e + 1 / k));
      g.setAttribute('opacity', q > 0.98 ? '0' : '1');
      g.setAttribute('transform', `translate(${a.x},${a.y}) rotate(${(Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI}) scale(${1 / k})`);
    }, start, () => {
      const end = pts[pts.length - 1];
      if (mv.type === 'uprising' || mv.type === 'crowd' || mv.type === 'march') ripple(r, end, k, 0, col);
      else { const dot = el('circle', { cx: end[0], cy: end[1], r: 3.2 / k, fill: col, stroke: '#111', 'stroke-width': 1 / k }, root); void dot; }
    });
  });
  void v;
}

/* ---------- hiệp ước ---------- */
function treaty(r: Run, v: HistEvent): void {
  const h = fxHost();
  if (!h || !r.root) return;
  const k = h.k(), p = h.proj(v.l);
  const g = el('g', { transform: `translate(${p[0]},${p[1]}) scale(${1 / k})`, opacity: 0 }, r.root);
  el('circle', { r: 15, fill: '#9c2a22', stroke: '#e8c46a', 'stroke-width': 1.6 }, g);
  el('circle', { r: 11, fill: 'none', stroke: '#e8c46a', 'stroke-width': 0.8 }, g);
  el('path', { d: 'M0,-7 L2,-2 L7,-2 L3,1 L4.5,6 L0,3 L-4.5,6 L-3,1 L-7,-2 L-2,-2Z', fill: '#e8c46a' }, g);
  const T0 = 700;
  WAR.quill(0);
  anim(r, calm.matches ? 1 : 420, q => {
    const s = 2.4 - 1.4 * ease(q);
    g.setAttribute('opacity', String(Math.min(1, q * 2)));
    g.setAttribute('transform', `translate(${p[0]},${p[1]}) scale(${s / k}) rotate(${-12 * (1 - q)})`);
  }, T0, () => { SND.stamp(); buzz([10, 30, 40]); ripple(r, p, k, 0, '#e8c46a'); });
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
  const R = wrap.getBoundingClientRect(), bar = document.getElementById('tourb')?.getBoundingClientRect();
  const bw = Math.min(R.width * 0.4, 230), bh = Math.min(bw * 0.75, R.height * 0.32), low = (bar ? R.bottom - bar.top : 0) + 10;
  const pts: [number, number][] = [];
  const add = (m: DOMMatrix | null, x: number, y: number) => { if (m) pts.push([m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f]); };
  r.root.querySelectorAll<SVGPathElement>('path').forEach(p => {
    const m = p.getScreenCTM(), L = p.getTotalLength();
    for (let i = 0; i <= 16; i++) { const q = p.getPointAtLength((L * i) / 16); add(m, q.x, q.y); }
  });
  r.root.querySelectorAll<SVGCircleElement>('circle').forEach(c => add(c.getScreenCTM(), c.cx.baseVal.value, c.cy.baseVal.value));
  const spots: { s: Partial<CSSStyleDeclaration>; x: number; y: number }[] = [
    { s: {}, x: R.left + 10, y: R.top + 46 },
    { s: { top: 'auto', bottom: `${low}px` }, x: R.left + 10, y: R.bottom - low - bh },
    { s: { top: 'auto', bottom: `${low}px`, left: 'auto', right: '10px' }, x: R.right - 10 - bw, y: R.bottom - low - bh },
  ];
  const hits = spots.map(o => pts.filter(([x, y]) => x > o.x - 8 && x < o.x + bw + 8 && y > o.y - 8 && y < o.y + bh + 8).length);
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
  const nA = v.k === 'Trận đánh' ? SCENES[v.id]?.arrows.length || 0 : MOVES[v.id] ? 2 : 0;
  return nA ? 1250 + 120 + Math.min(nA, 6) * 520 + 1600 : 0;
}
/** Bước tour không có giọng đọc giữ cảnh bao lâu: đủ để cảnh vẽ xong và khung tư liệu kịp hiện vài giây. */
export const sceneHold = (v: HistEvent): number => Math.min(11000, Math.max(6500, reelAt(v) + 4500));

/** Phát cảnh cho bước tour đang ở sự kiện v (gọi ngay khi bản đồ bắt đầu bay tới). */
export function playScene(v: HistEvent): void {
  endScene();
  if (!fxOn() || document.hidden || document.querySelector('#layer .pane')) return; // bảng Nhân vật / Sử liệu / Hồ sơ đang phủ bản đồ
  const h = fxHost();
  const r: Run = { id: v.id, timers: [], parts: [], raf: 0, root: null, reel: null, alive: true };
  cur = r;
  WAR.open();
  if (h) r.root = el('g', { class: 'scene' }, h.g);
  // trận đánh: khung tư liệu hiện sau khi các mũi tiến quân đã tới, để không che chúng
  const at = reelAt(v);
  if (at) later(r, at, () => void reel(r, v)); else void reel(r, v);
  if (v.diary) return;
  if (v.k === 'Trận đánh' && !calm.matches) document.getElementById('mapwrap')?.classList.add('tilt');
  // vẽ khi bản đồ đã bay tới nơi (zoomTo 1,2 s): kích thước chớp lửa, đầu mũi tên tính theo zoom lúc đó
  later(r, 1250, () => {
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
  r.timers.forEach(clearTimeout);
  if (r.raf) cancelAnimationFrame(r.raf);
  if (r.root) {
    const g = r.root;
    g.style.transition = 'opacity .5s';
    g.style.opacity = '0';
    setTimeout(() => g.remove(), 520);
  }
  if (r.reel) { const b = r.reel; b.classList.remove('on'); b.querySelector('video')?.pause(); setTimeout(() => { const vd = b.querySelector('video'); if (vd) { vd.removeAttribute('src'); vd.load(); } b.remove(); }, 520); }
}

// thẻ trình duyệt bị ẩn / khoá máy: dừng cảnh (rAF dừng nhưng hẹn giờ vẫn chạy, tránh dồn hiệu ứng khi quay lại)
document.addEventListener('visibilitychange', () => { if (document.hidden) endScene(); });
