import type { Kind, SceneType, ArrowOpt } from './data/scenes';

/* Quân cờ trên sa bàn: hình nhỏ (12–16 px) đi theo mũi tên — bộ binh, thiết giáp, trực thăng, lính dù, tàu,
   máy bay, đoàn người. Chọn theo ghi chú của mũi tên (từ ngữ trong dữ liệu, không đoán thêm), rồi theo loại trận. */

const NS = 'http://www.w3.org/2000/svg';
const el = (tag: string, attrs: Record<string, string | number>, parent: Element): SVGElement => {
  const n = document.createElementNS(NS, tag) as SVGElement;
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v));
  parent.appendChild(n);
  return n;
};
/** Chữ đứng riêng (không dính trong từ khác): "tàu" nhưng không "nghe" chứa "ghe". */
const word = (w: string) => new RegExp(`(^|[^\\p{L}])(${w})(?![\\p{L}])`, 'iu');
const BOAT = word('pháo thuyền|chiến hạm|hạm đội|tàu|ghe|HQ-\\d+');

/** Quân cờ của một mũi tên: ghi đè trong dữ liệu, rồi từ ngữ của ghi chú, rồi loại trận. */
export function kindOf(note: string, type: SceneType | 'land', opt?: ArrowOpt): Kind {
  if (opt?.unit) return opt.unit;
  if (/phục kích/i.test(note)) return 'inf';
  if (/xe tăng|thiết giáp|M113|PT-76/i.test(note)) return 'armour';
  if (/trực thăng/i.test(note)) return 'heli';
  if (/nhảy dù|nhảy xuống/i.test(note)) return 'para';
  if (/B-52|F-8|không vận|máy bay/i.test(note)) return 'plane';
  if (BOAT.test(note)) return 'boat';
  if (type === 'uprising' || /nghĩa quân|du kích|nông dân|nổi dậy/i.test(note)) return 'crowd';
  if (type === 'naval' || type === 'landing') return 'boat';
  if (type === 'air') return 'plane';
  return 'inf';
}

const PLANE = 'M0,-7 L1.6,-2 L8,1 L8,2.6 L1.6,1.4 L1,5 L3,6.6 L3,7.6 L0,7 L-3,7.6 L-3,6.6 L-1,5 L-1.6,1.4 L-8,2.6 L-8,1 L-1.6,-2Z';
const BOAT_D = 'M-8,-2.5 L6,-2.5 L9,0 L6,2.5 L-8,2.5 L-6,0Z';

export interface Piece { g: SVGGElement; body: SVGGElement; rotor?: SVGGElement }

/** Vẽ một quân cờ (gốc toạ độ ở tâm, mũi hướng sang phải). `sy` > 1 khi bản đồ nghiêng: có bóng đổ dưới chân. */
export function drawPiece(kind: Kind, col: string, parent: Element, sy = 1): Piece {
  const g = el('g', { class: 'pc', 'data-kind': kind, opacity: 0 }, parent) as SVGGElement;
  const air = kind === 'plane' || kind === 'para';
  if (sy > 1 && !air) el('ellipse', { cx: 0, cy: 3.5, rx: 8, ry: 2.6, fill: '#000', opacity: 0.28 }, g);
  const body = el('g', {}, g) as SVGGElement;
  const st = { fill: col, stroke: '#111', 'stroke-width': 0.8 };
  let rotor: SVGGElement | undefined;
  if (kind === 'inf') el('path', { d: 'M-9,-2.5h4v5h-4z M-2,-2.5h4v5h-4z M5,-2.5h4v5h-4z', ...st }, body);
  else if (kind === 'armour') {
    el('rect', { x: -7, y: -3.5, width: 14, height: 7, rx: 1.5, ...st }, body);
    el('line', { x1: 0, y1: 0, x2: 9, y2: 0, stroke: '#111', 'stroke-width': 1.6, 'stroke-linecap': 'round' }, body);
    el('circle', { r: 2.6, ...st }, body);
  } else if (kind === 'heli') {
    el('line', { x1: -4, y1: 0, x2: -10, y2: 0, stroke: '#111', 'stroke-width': 1.4 }, body);
    el('ellipse', { rx: 5, ry: 2.6, ...st }, body);
    rotor = el('g', {}, body) as SVGGElement;
    el('line', { x1: -8, y1: 0, x2: 8, y2: 0, stroke: '#111', 'stroke-width': 0.9 }, rotor);
  } else if (kind === 'boat') el('path', { d: BOAT_D, ...st }, body);
  else if (air) el('path', { d: PLANE, ...st, transform: 'rotate(90)' }, body);
  else el('path', { d: 'M-6,0a2,2 0 1,0 4,0a2,2 0 1,0 -4,0 M-2,-3.4a2,2 0 1,0 4,0a2,2 0 1,0 -4,0 M-2,3.4a2,2 0 1,0 4,0a2,2 0 1,0 -4,0 M2,0a2,2 0 1,0 4,0a2,2 0 1,0 -4,0 M6,-2a2,2 0 1,0 4,0a2,2 0 1,0 -4,0', ...st }, body); // đoàn người
  return { g, body, rotor };
}
