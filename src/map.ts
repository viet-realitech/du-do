import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import type { Feature, MultiPolygon, Geometry } from 'geojson';
import { F, PROVINCES, provGroup, provName, regionName, regime2, type HistEvent, type Region } from './data';
import { S, save, rt, curPick, visEv } from './state';
import { esc } from './ui/dom';
import { fill, flag, PAL, LAND, SEA } from './ui/bits';
import { SND, buzz } from './audio';
import { checkBadges } from './badges';
import { isTouring, stopTour } from './tour';
import { openEvent } from './screens/event';

/* Map of Vietnam in 1858–2026 frames. SVG user space is 390 × H; the projection
   is fixed so markers, labels and zoom targets share one coordinate system. */
export const W = 390;
export const H = 400;

type Prov = Feature<MultiPolygon> & { n: string; g: Region };
type Sel<T extends d3.BaseType = SVGPathElement, D = unknown> = d3.Selection<T, D, d3.BaseType, unknown>;
type Pt = { p: [number, number] };

const G = {} as {
  k: number;
  svg: Sel<SVGSVGElement>;
  Z: Sel<SVGGElement>;
  defs: Sel<SVGDefsElement>;
  provs: Prov[];
  laF: Feature<Geometry>;
  khF: Feature<Geometry>;
  pv: Sel<SVGPathElement, Prov>;
  la: Sel; kh: Sel; qtn: Sel; edge: Sel; sel: Sel; hl: Sel; indo: Sel;
  jpr: Sel<SVGRectElement>; spot: Sel<SVGRectElement>; spotC: Sel<SVGCircleElement>;
  l17: Sel<SVGLineElement>;
  labels: Sel<SVGGElement>; cities: Sel<SVGGElement>; mk: Sel<SVGGElement>; call: Sel<SVGGElement>;
  zoom: d3.ZoomBehavior<SVGSVGElement, unknown>;
};
G.k = 1;
let proj: d3.GeoProjection;
let path: d3.GeoPath;
let ready = false;

/** Build the map once the (lazy-loaded) world atlas arrives; paintMap() is a no-op until then. */
export async function initMap(): Promise<void> {
  const svg = d3.select<SVGSVGElement, unknown>('#map');
  G.svg = svg;
  let world: unknown;
  try {
    world = (await import('./data/region-50m.json')).default;
  } catch {
    svg.append('text').attr('x', W / 2).attr('y', H / 2).attr('text-anchor', 'middle').style('fill', 'var(--ink)').text('Không tải được dữ liệu bản đồ');
    return;
  }
  const topo = world as unknown as Topology<{ countries: GeometryCollection }>;
  const fc = (topojson.feature(topo, topo.objects.countries) as unknown as { features: Feature<Geometry>[] }).features;
  const by = (id: number) => fc.find(f => +f.id! === id)!;
  const vn = by(704), la = by(418), kh = by(116);
  const others = fc.filter(f => ![704, 418, 116].includes(+f.id!));

  // Province rings come from geoBoundaries with mixed winding; d3 wants clockwise exteriors.
  const provs: Prov[] = PROVINCES.map(p => {
    const polys = p.c.map(pg => (d3.geoArea({ type: 'Polygon', coordinates: pg }) > 2 * Math.PI ? pg.map(r => r.slice().reverse()) : pg));
    return { type: 'Feature', n: p.n, g: provGroup(p.n), properties: {}, geometry: { type: 'MultiPolygon', coordinates: polys } } as Prov;
  });
  G.provs = provs; G.laF = la; G.khF = kh;

  proj = d3.geoMercator().fitExtent([[6, 4], [384, H - 4]], { type: 'MultiPoint', coordinates: [[101.2, 8.2], [115.2, 23.6]] });
  proj.clipExtent([[-30, -30], [420, H + 30]]);
  path = d3.geoPath(proj);
  const y17 = proj([105, 17])![1];

  const defs = svg.append('defs');
  G.defs = defs;
  const cl = defs.append('clipPath').attr('id', 'vnclip');
  provs.forEach(f => cl.append('path').attr('d', path(f)));
  defs.append('clipPath').attr('id', 'n17').append('rect').attr('x', -50).attr('y', -50).attr('width', 500).attr('height', y17 + 50);
  const gl = defs.append('filter').attr('id', 'glow').attr('x', '-10%').attr('y', '-10%').attr('width', '120%').attr('height', '120%');
  gl.append('feGaussianBlur').attr('stdDeviation', 2.2).attr('result', 'b');
  const gm = gl.append('feMerge');
  gm.append('feMergeNode').attr('in', 'b');
  gm.append('feMergeNode').attr('in', 'SourceGraphic');
  buildPatterns();

  svg.append('rect').attr('x', -10).attr('y', -10).attr('width', W + 20).attr('height', H + 20).attr('fill', SEA).on('click', hidePop);
  const Z = svg.append('g');
  G.Z = Z;
  Z.append('path').attr('d', path(d3.geoGraticule().step([2, 2])())).attr('fill', 'none').style('stroke', 'var(--ink2)')
    .attr('stroke-opacity', 0.35).attr('stroke-width', 0.6).attr('vector-effect', 'non-scaling-stroke').style('pointer-events', 'none');

  // Radar-like ripples around the coastline.
  const land = topojson.merge(topo, topo.objects.countries.geometries.filter(g => g.type) as any);
  const rip = Z.append('g').attr('fill', 'none').style('pointer-events', 'none');
  [26, 20, 15, 10.5, 7, 4].forEach((w, i) => {
    rip.append('path').attr('d', path(land)).style('stroke', 'var(--rip)').attr('stroke-opacity', 0.14 + i * 0.06).attr('stroke-width', w);
    rip.append('path').attr('d', path(land)).attr('stroke', SEA).attr('stroke-width', w - 1.3);
  });

  const R0 = Z.append('g');
  R0.append('g').selectAll('path').data(others).join('path').attr('d', path).attr('fill', LAND).style('stroke', 'var(--ink3)')
    .attr('stroke-width', 0.6).attr('vector-effect', 'non-scaling-stroke').on('click', hidePop);
  G.la = R0.append('path').attr('d', path(la)).style('stroke', 'var(--ink2)').attr('stroke-width', 0.7).attr('vector-effect', 'non-scaling-stroke')
    .style('cursor', 'pointer').on('click', ev => showPop(ev, 'la'));
  G.kh = R0.append('path').attr('d', path(kh)).style('stroke', 'var(--ink2)').attr('stroke-width', 0.7).attr('vector-effect', 'non-scaling-stroke')
    .style('cursor', 'pointer').on('click', ev => showPop(ev, 'kh'));
  R0.append('g').selectAll('path').data(provs).join('path').attr('d', path).attr('fill', 'none').style('stroke', 'var(--ink)')
    .attr('stroke-width', 2.4).attr('vector-effect', 'non-scaling-stroke');
  G.pv = R0.append('g').selectAll<SVGPathElement, Prov>('path').data(provs).join('path').attr('d', path).style('stroke', 'var(--ink)')
    .attr('stroke-opacity', 0.16).attr('stroke-width', 0.5).attr('vector-effect', 'non-scaling-stroke').style('cursor', 'pointer')
    .style('transition', 'opacity .3s').on('click', (ev, d) => showPop(ev, d));
  const qt = provs.find(p => p.g === 'QT')!;
  G.qtn = R0.append('path').attr('d', path(qt)).attr('clip-path', 'url(#n17)').style('pointer-events', 'none');
  G.jpr = R0.append('rect').attr('clip-path', 'url(#vnclip)').attr('width', W).attr('height', H).attr('fill', 'url(#p-jp)').attr('opacity', 0).style('pointer-events', 'none');
  G.edge = R0.append('path').attr('d', path(vn)).attr('clip-path', 'url(#vnclip)').attr('fill', 'none').style('stroke', 'var(--ink)')
    .attr('stroke-opacity', 0.3).attr('stroke-width', 8).style('pointer-events', 'none');
  G.l17 = R0.append('line').attr('clip-path', 'url(#vnclip)').attr('x1', 0).attr('x2', W).attr('y1', y17).attr('y2', y17).style('stroke', 'var(--ink)')
    .attr('stroke-width', 2.2).attr('stroke-dasharray', '5 3').attr('vector-effect', 'non-scaling-stroke').style('pointer-events', 'none');
  G.sel = R0.append('path').attr('fill', 'none').style('stroke', 'var(--red)').attr('stroke-width', 2).attr('vector-effect', 'non-scaling-stroke').style('pointer-events', 'none');
  G.indo = R0.append('path').attr('d', path({ type: 'FeatureCollection', features: [vn, la, kh] })).attr('fill', 'none').attr('stroke', '#3f5b8c')
    .attr('stroke-width', 2.4).attr('stroke-opacity', 0.5).attr('stroke-dasharray', '8 4').attr('vector-effect', 'non-scaling-stroke').style('pointer-events', 'none');

  // Tour spotlight: darken everything but a soft circle around the focused event.
  const mk = defs.append('mask').attr('id', 'spotm').attr('maskUnits', 'userSpaceOnUse').attr('x', -600).attr('y', -600).attr('width', 1600).attr('height', 1600);
  const sg = defs.append('radialGradient').attr('id', 'spotg');
  sg.append('stop').attr('offset', '45%').attr('stop-color', '#000');
  sg.append('stop').attr('offset', '100%').attr('stop-color', '#fff');
  mk.append('rect').attr('x', -600).attr('y', -600).attr('width', 1600).attr('height', 1600).attr('fill', '#fff');
  G.spotC = mk.append('circle').attr('r', 60).attr('fill', 'url(#spotg)');
  G.spot = Z.append('rect').attr('x', -600).attr('y', -600).attr('width', 1600).attr('height', 1600).attr('mask', 'url(#spotm)')
    .style('fill', 'var(--paper)').attr('opacity', 0).style('transition', 'opacity .6s').style('pointer-events', 'none');
  G.hl = Z.append('path').style('fill', 'var(--acc)').attr('fill-opacity', 0.22).style('stroke', 'var(--acc)').attr('stroke-width', 2.2)
    .attr('vector-effect', 'non-scaling-stroke').style('pointer-events', 'none');

  G.labels = Z.append('g').style('font-family', 'var(--serif)').style('fill', 'var(--ink2)').attr('text-anchor', 'middle').style('pointer-events', 'none');
  ([
    ['TRUNG QUỐC', 108.6, 23.0, 11, 3], ['L À O', 103.6, 19.4, 11, 3], ['THÁI LAN', 102.3, 15.3, 11, 3], ['CAMPUCHIA', 104.9, 12.9, 11, 2],
    ['Biển Đông', 112.3, 13.6, 15, 1, 1], ['Vịnh Bắc Bộ', 107.9, 19.9, 11, 0, 1], ['Vịnh Thái Lan', 102.2, 10.4, 11, 0, 1],
    ['Q.đ. Hoàng Sa', 112.2, 17.4, 11, 0, 1, 1], ['Q.đ. Trường Sa', 114.1, 11.1, 11, 0, 1, 1],
  ] as [string, number, number, number, number, number?, number?][]).forEach(([t, x, y, s, ls, it, dk]) => {
    const n = G.labels.append('text').datum<Pt>({ p: proj([x, y])! }).attr('font-size', s).attr('letter-spacing', ls).attr('font-style', it ? 'italic' : null).text(t);
    if (dk) n.style('fill', 'var(--ink)');
  });
  const isl = Z.append('g').style('fill', 'var(--ink)').style('pointer-events', 'none');
  [[111.6, 16.5], [112.3, 16.8], [111.9, 16.2], [112.7, 16.6], [114.2, 10.4], [113.6, 9.9], [114.4, 9.4], [114.0, 8.9], [114.9, 10.0]].forEach(q => {
    const p = proj(q as [number, number])!;
    isl.append('circle').attr('cx', p[0]).attr('cy', p[1]).attr('r', 1.6);
  });
  G.cities = Z.append('g').style('font-family', 'var(--serif)').attr('font-size', 12.5).style('fill', 'var(--ink)').style('pointer-events', 'none');
  ([['Hà Nội', 105.85, 21.03, -1], ['Huế', 107.58, 16.46, 1], ['Đà Nẵng', 108.22, 16.07, 1], ['Sài Gòn', 106.70, 10.78, 1]] as [string, number, number, number][])
    .forEach(([t, x, y, side]) => {
      const g = G.cities.append('g').datum<Pt>({ p: proj([x, y])! });
      g.append('circle').attr('r', 2.6).style('fill', 'var(--paper)').style('stroke', 'var(--ink)').attr('stroke-width', 1.3);
      g.append('text').attr('x', side * 6).attr('y', 4).attr('text-anchor', side < 0 ? 'end' : 'start').attr('data-city', t)
        .style('stroke', 'var(--paper)').attr('stroke-width', 3).attr('paint-order', 'stroke').text(t);
    });
  G.mk = Z.append('g');
  G.call = Z.append('g').style('pointer-events', 'none');

  G.zoom = d3.zoom<SVGSVGElement, unknown>().scaleExtent([1, 8]).translateExtent([[0, 0], [W, H]]).on('zoom', ev => {
    if (ev.sourceEvent && isTouring()) stopTour();
    G.k = ev.transform.k;
    Z.attr('transform', ev.transform);
    rescale();
    if (G.k > 1.3 && !S.zoomed) { S.zoomed = true; save(); checkBadges(); }
  });
  svg.call(G.zoom).on('dblclick.zoom', null);
  document.getElementById('zin')!.onclick = () => svg.transition().duration(300).call(G.zoom.scaleBy, 1.6);
  document.getElementById('zout')!.onclick = () => svg.transition().duration(300).call(G.zoom.scaleBy, 1 / 1.6);
  document.getElementById('zrs')!.onclick = () => { svg.transition().duration(400).call(G.zoom.transform, d3.zoomIdentity); hidePop(); };
  ready = true;
  rescale();
}

function buildPatterns(): void {
  const c = PAL;
  const pat = (id: string, w: number, h: number, rot: number, draw: (p: Sel<SVGPatternElement>) => void) => {
    const p = G.defs.append('pattern').attr('id', id).attr('patternUnits', 'userSpaceOnUse').attr('width', w).attr('height', h);
    if (rot) p.attr('patternTransform', `rotate(${rot})`);
    draw(p);
  };
  pat('p-bh', 6, 6, 45, p => { p.append('rect').attr('width', 6).attr('height', 6).attr('fill', c.bh1); p.append('rect').attr('width', 2).attr('height', 6).attr('fill', c.bh2); });
  pat('p-tc', 10, 10, 45, p => { p.append('rect').attr('width', 5).attr('height', 10).attr('fill', c.red); p.append('rect').attr('x', 5).attr('width', 5).attr('height', 10).attr('fill', c.phap); });
  pat('p-dnph', 10, 10, 45, p => { p.append('rect').attr('width', 5).attr('height', 10).attr('fill', c.dainam); p.append('rect').attr('x', 5).attr('width', 5).attr('height', 10).attr('fill', c.phap); });
  pat('p-vnch', 20, 22, 0, p => { p.append('rect').attr('width', 20).attr('height', 22).attr('fill', c.yel); [8, 11, 14].forEach(y => p.append('rect').attr('y', y).attr('width', 20).attr('height', 1.6).attr('fill', c.red)); });
  pat('p-cmlt', 20, 24, 0, p => { p.append('rect').attr('width', 20).attr('height', 12).attr('fill', c.red); p.append('rect').attr('y', 12).attr('width', 20).attr('height', 12).attr('fill', c.blue); });
  pat('p-jp', 14, 14, 0, p => { p.append('circle').attr('cx', 7).attr('cy', 7).attr('r', 2).attr('fill', c.jp).attr('opacity', 0.8); });
}

/** Keep markers, labels and callouts at constant screen size while zoomed. */
function rescale(): void {
  if (!ready) return;
  const k = G.k || 1;
  const keep = (d: Pt) => `translate(${d.p}) scale(${1 / k})`;
  G.spotC.attr('r', 75 / k);
  G.call.selectAll<SVGGElement, Pt>('g.co').attr('transform', keep);
  G.labels.selectAll<SVGTextElement, Pt>('text').attr('transform', keep);
  G.cities.selectAll<SVGGElement, Pt>('g').attr('transform', keep);
  G.mk.selectAll<SVGGElement, Pt>('g.m').attr('transform', keep);
}

/* ---------- region popover ---------- */
export function hidePop(): void {
  document.getElementById('pop')?.remove();
  if (ready) G.sel.attr('d', null);
}

function showPop(ev: MouseEvent, d: Prov | 'la' | 'kh'): void {
  ev.stopPropagation();
  const y = S.year, R = regime2(y);
  let title: string, fac, sub: string;
  if (d === 'la' || d === 'kh') {
    title = d === 'la' ? 'Lào' : 'Campuchia';
    fac = d === 'la' ? R.laos : R.camb;
    sub = fac ? 'Thuộc Liên bang Đông Dương' : 'Quốc gia láng giềng';
    G.sel.attr('d', null);
  } else {
    const [mx, my] = d3.pointer(ev, G.Z.node());
    const ll = proj.invert!([mx, my]);
    const north = !!ll && ll[1] > 17;
    const g = d.g === 'QT' ? (R.l17 && north ? 'T1' : 'T2') : d.g;
    fac = R.reg[g];
    title = regionName(d.g, y, north);
    sub = 'Tỉnh ' + provName(d.n) + ' (địa giới hôm nay)';
    G.sel.attr('d', path(d));
  }
  document.getElementById('pop')?.remove();
  const el = document.createElement('div');
  el.id = 'pop';
  el.innerHTML = `<div class="row sb" style="gap:8px"><b>${esc(title)}</b><span class="mono muted">${y}</span></div>
    <div class="row" style="gap:7px;margin-top:5px;font-size:14.5px">${fac ? flag(fac) + esc(F[fac].n) : '<span class="muted">Không thuộc Đông Dương</span>'}</div>
    <div class="muted" style="font-size:13px;margin-top:3px">${esc(sub)}</div>`;
  document.getElementById('mapwrap')!.appendChild(el);
  if (!S.mapTapped) { S.mapTapped = true; save(); checkBadges(); }
  SND.tick();
  buzz(8);
}

/* ---------- per-year paint ---------- */
const regOf = (g: Region) => (g === 'QT' ? 'T2' : g);

export function paintMap(): void {
  if (!ready) return;
  const y = S.year, R = regime2(y), pk = curPick(y);
  const dim = !!(pk && pk.fac && R.legend.includes(pk.fac));
  G.pv.attr('fill', d => fill(R.reg[regOf(d.g)])).attr('opacity', d => (dim && R.reg[regOf(d.g)] !== pk!.fac ? 0.5 : 1));
  G.qtn.attr('fill', fill(R.reg.T1)).attr('opacity', R.l17 ? (dim && R.reg.T1 !== pk!.fac ? 0.5 : 1) : 0);
  G.jpr.attr('opacity', R.jp ? 1 : 0);
  G.la.attr('fill', fill(R.laos));
  G.kh.attr('fill', fill(R.camb));
  G.l17.attr('opacity', R.l17 ? 1 : 0);
  G.indo.attr('opacity', R.laos || R.camb ? 1 : 0);
  G.cities.selectAll<SVGTextElement, unknown>('text[data-city="Sài Gòn"]').text(y >= 1976 ? 'TP. HCM' : 'Sài Gòn');

  // Event markers for the last three years.
  const near = visEv().filter(v => v.y <= y && v.y >= y - 3);
  G.mk.selectAll('*').remove();
  near.forEach(v => {
    const on = rt.focusEv?.id === v.id;
    const g = G.mk.append('g').attr('class', 'm').datum<Pt>({ p: proj(v.l)! }).style('cursor', 'pointer')
      .on('click', ev => { ev.stopPropagation(); openEvent(v.id); });
    if (on) g.append('circle').attr('r', 8).attr('fill', 'none').style('stroke', 'var(--red)').attr('stroke-width', 2).attr('class', 'pulse');
    const col = on ? 'var(--red)' : 'var(--ink)';
    let m;
    if (v.diary) m = g.append('path').attr('d', 'M0,-7 L6,0 L0,7 L-6,0Z').style('fill', on ? 'var(--red)' : 'var(--acc)');
    else if (v.k === 'Trận đánh') m = g.append('rect').attr('x', -5).attr('y', -5).attr('width', 10).attr('height', 10).attr('transform', 'rotate(45)');
    else if (v.k === 'Hiệp ước') m = g.append('rect').attr('x', -5).attr('y', -4).attr('width', 10).attr('height', 8);
    else m = g.append('circle').attr('r', 5.5);
    m.style('stroke', 'var(--paper)').attr('stroke-width', 1.5);
    if (!v.diary) m.style('fill', col).attr('opacity', on ? 1 : 0.65);
  });
  highlight();
  rescale();
}

/* ---------- tour focus ---------- */
const featCache = new Map<string, Feature<Geometry> | null>();
function featOf(v: HistEvent): Feature<Geometry> | null {
  if (!featCache.has(v.id)) {
    featCache.set(v.id, G.provs.find(f => d3.geoContains(f, v.l)) || [G.laF, G.khF].find(f => d3.geoContains(f, v.l)) || null);
  }
  return featCache.get(v.id)!;
}

let hlId: string | null = null;
/** Spotlight + province highlight + callout for the event a tour is showing. */
function highlight(): void {
  const v = isTouring() ? rt.focusEv : null;
  if (!v) {
    if (hlId !== null) { G.spot.attr('opacity', 0); G.hl.attr('d', null); G.call.selectAll('*').remove(); hlId = null; }
    return;
  }
  if (hlId === v.id) return;
  hlId = v.id;
  const p = proj(v.l)!;
  G.spotC.attr('cx', p[0]).attr('cy', p[1]);
  G.spot.attr('opacity', 0.62);
  const f = featOf(v);
  G.hl.attr('d', f ? path(f) : null).attr('filter', 'url(#glow)');
  G.call.selectAll('*').remove();
  const g = G.call.append('g').attr('class', 'co').datum<Pt>({ p });
  const t = v.t.length > 34 ? v.t.slice(0, 33) + '…' : v.t;
  const bx = g.append('rect').attr('rx', 7).style('fill', 'var(--paper)').style('stroke', 'var(--acc)').attr('stroke-width', 1.2);
  const t1 = g.append('text').attr('text-anchor', 'middle').attr('y', -38).style('font-family', 'var(--mono)').attr('font-size', 8.5)
    .attr('letter-spacing', 1).style('fill', 'var(--acc)').text((v.diary ? 'NHẬT KÝ · ' : v.k.toUpperCase() + ' · ') + v.y);
  const t2 = g.append('text').attr('text-anchor', 'middle').attr('y', -24).style('font-family', 'var(--disp)').attr('font-weight', 700)
    .attr('font-size', 13).style('fill', 'var(--ink)').text(t);
  const w = Math.max(t1.node()!.getComputedTextLength(), t2.node()!.getComputedTextLength()) + 20;
  bx.attr('x', -w / 2).attr('y', -52).attr('width', w).attr('height', 36);
  g.append('path').attr('d', 'M-5,-16 L0,-10 L5,-16Z').style('fill', 'var(--acc)');
  g.style('opacity', 0).transition().delay(500).duration(400).style('opacity', 1);
}

/** Zoom level that frames the province (or Laos/Cambodia) containing the event. */
export function zoomK(v: HistEvent): number {
  if (!ready) return 3;
  const f = featOf(v);
  if (!f) return 3;
  const b = path.bounds(f), w = b[1][0] - b[0][0], hh = b[1][1] - b[0][1];
  return Math.max(2.4, Math.min(5, 0.55 * Math.min(W / Math.max(w, 1), H / Math.max(hh, 1))));
}

/** Fly to a lon/lat at scale k, or back to the overview when `l` is null. */
export function zoomTo(l: [number, number] | null, k = 1, ms?: number): void {
  if (!ready) return;
  if (!l) {
    G.svg.transition().duration(ms || 900).ease(d3.easeCubicInOut).call(G.zoom.transform, d3.zoomIdentity);
    return;
  }
  const p = proj(l)!;
  const t = d3.zoomIdentity.translate(W / 2, H / 2).scale(k).translate(-p[0], -p[1]);
  G.svg.transition().duration(ms || 1200).ease(d3.easeCubicInOut).call(G.zoom.transform, t);
}
