// Trim Natural Earth 1:50m countries (world-atlas) to the region the map can show,
// so the app ships ~a third of the geometry. Run: npm run geo
import { readFileSync, writeFileSync } from 'node:fs';
import { feature } from 'topojson-client';
import { topology } from 'topojson-server';
import { quantize } from 'topojson-client';
import { geoBounds } from 'd3';

const BBOX = [90, -4, 128, 32]; // lon/lat window around the map's fit extent (+ zoom-out margin)
const src = JSON.parse(readFileSync(new URL('../node_modules/world-atlas/countries-50m.json', import.meta.url)));
const all = feature(src, src.objects.countries).features;
const hit = all.filter(f => {
  if (!f.geometry) return false;
  const [[x0, y0], [x1, y1]] = geoBounds(f);
  return x1 >= BBOX[0] && x0 <= BBOX[2] && y1 >= BBOX[1] && y0 <= BBOX[3];
}).map(f => ({ type: 'Feature', id: f.id, properties: { name: f.properties.name }, geometry: f.geometry }));
const topo = quantize(topology({ countries: { type: 'FeatureCollection', features: hit } }), 1e5);
const out = new URL('../src/data/region-50m.json', import.meta.url);
writeFileSync(out, JSON.stringify(topo));
console.log(`${hit.length} countries → ${(JSON.stringify(topo).length / 1024).toFixed(0)} KB`, hit.map(f => f.properties.name).join(', '));
