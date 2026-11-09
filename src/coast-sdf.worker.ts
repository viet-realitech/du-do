/* Khoảng cách từ mỗi điểm biển tới bờ gần nhất (Felzenszwalb & Huttenlocher, khoảng cách Euclid chính xác),
   tính ngoài luồng chính. Vào: mặt nạ đất (alpha của canvas 2D), ra: R8, 0..255 ứng với 0..MAXD đơn vị bản đồ. */
type In = { mask: Uint8ClampedArray; w: number; h: number; unitsPerTexel: number; maxD: number };

const INF = 1e20;

function edt1d(f: Float64Array, n: number, d: Float64Array, v: Int32Array, z: Float64Array): void {
  let k = 0;
  v[0] = 0; z[0] = -INF; z[1] = INF;
  for (let q = 1; q < n; q++) {
    let s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
    while (s <= z[k]) { k--; s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]); }
    k++; v[k] = q; z[k] = s; z[k + 1] = INF;
  }
  k = 0;
  for (let q = 0; q < n; q++) {
    while (z[k + 1] < q) k++;
    const dq = q - v[k];
    d[q] = dq * dq + f[v[k]];
  }
}

self.onmessage = (e: MessageEvent<In>) => {
  const { mask, w, h, unitsPerTexel, maxD } = e.data;
  const grid = new Float64Array(w * h);
  // mask có 4 kênh RGBA; đất = alpha ≥ 128
  for (let i = 0; i < w * h; i++) grid[i] = mask[i * 4 + 3] >= 128 ? 0 : INF;
  const n = Math.max(w, h);
  const f = new Float64Array(n), d = new Float64Array(n), v = new Int32Array(n), z = new Float64Array(n + 1);
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) f[y] = grid[y * w + x];
    edt1d(f, h, d, v, z);
    for (let y = 0; y < h; y++) grid[y * w + x] = d[y];
  }
  const out = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    const r = y * w;
    for (let x = 0; x < w; x++) f[x] = grid[r + x];
    edt1d(f, w, d, v, z);
    for (let x = 0; x < w; x++) out[r + x] = Math.min(255, Math.round((Math.sqrt(d[x]) * unitsPerTexel / maxD) * 255));
  }
  (self as unknown as Worker).postMessage(out, [out.buffer]);
};
