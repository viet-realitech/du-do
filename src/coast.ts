/* Đường đồng mức quanh bờ biển vẽ bằng WebGL2 (thay 12 đường viền SVG cả khu vực — lớp tốn công vẽ nhất khi bản đồ
   bay / kéo / chụm). Bản đồ khoảng cách tới bờ tính một lần (worker), shader tô các vòng theo khoảng cách ấy, nên
   chi phí mỗi khung không phụ thuộc độ chi tiết đường bờ. Canvas nằm ngay dưới SVG, cùng khung và cùng phép nghiêng
   3D (styles.css); màu biển vẫn là nền của .mapwrap. Không có WebGL2 / mất ngữ cảnh: trả về false / gọi onLost,
   map.ts vẽ lại lớp SVG cũ. */

/** Vùng phủ của bản đồ khoảng cách, theo đơn vị SVG (phép chiếu cố định của map.ts, lõi 390 × 400). */
const B = { x0: -420, y0: -330, x1: 810, y1: 730 };
const UPT = 0.5;   // đơn vị bản đồ trên một texel
const MAXD = 16;   // khoảng cách lớn nhất mã hoá được (vòng ngoài cùng ở 13)

/* Cùng bộ vòng với lớp SVG cũ: nét màu --rip rộng w, đè lên bởi nét màu biển rộng w − 1,3 → còn lại vòng 0,65 đơn vị. */
const RINGS = [26, 20, 15, 10.5, 7, 4];

const VS = `#version 300 es
in vec2 p; void main() { gl_Position = vec4(p, 0., 1.); }`;

const FS = `#version 300 es
precision highp float;
uniform sampler2D uSdf;
uniform vec2 uRes, uBox, uT, uB0, uBS;
uniform float uPx, uDpr, uK, uRough;
uniform vec3 uCol;
uniform float uW[6];
out vec4 o;
float h(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vn(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
  return mix(mix(h(i), h(i + vec2(1, 0)), f.x), mix(h(i + vec2(0, 1)), h(i + vec2(1, 1)), f.x), f.y); }
float fbm(vec2 p) { return .65 * vn(p) + .35 * vn(p * 2.03 + 11.7); }
void main() {
  vec2 sp = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y) / uDpr;     // px CSS từ góc trên trái
  vec2 m = ((uBox + sp / uPx) - uT) / uK;                               // toạ độ bản đồ (trong nhóm zoom)
  if (uRough > 0.) m += (vec2(fbm(m * .045), fbm(m * .045 + 37.1)) - .5) * 3.5 * uRough; // nét khắc tay (feDisplacementMap 3,5)
  vec2 uv = (m - uB0) / uBS;
  if (any(lessThan(uv, vec2(0))) || any(greaterThan(uv, vec2(1)))) discard;
  float d = texture(uSdf, uv).r * ${MAXD.toFixed(1)} - ${(UPT / 2).toFixed(3)};
  if (d <= 0.) discard;
  float aa = max(fwidth(d), 1e-3) * .75;
  vec4 c = vec4(0);
  for (int i = 0; i < 6; i++) {
    float r = uW[i] * .5, a = .14 + float(i) * .06;
    float cov = 1. - smoothstep(r - aa, r + aa, d);
    c = vec4(uCol, 1.) * a * cov + c * (1. - a * cov);
    float cs = 1. - smoothstep(r - .65 - aa, r - .65 + aa, d);
    c *= 1. - cs;                                                     // nét màu biển đè lên: lộ nền biển
  }
  o = c;
}`;

type T = { x: number; y: number; k: number };

export type Coast = {
  /** Phép zoom hiện tại của nhóm Z. */
  view(t: T): void;
  /** viewBox (góc trên trái, đơn vị) và px màn hình trên một đơn vị. */
  box(x: number, y: number, px: number): void;
  /** Bật / tắt, màu vòng (CSS), nét khắc tay. */
  look(on: boolean, color: string, rough: boolean): void;
};

/** Khởi tạo; `drawLand` tô mặt nạ đất lên ngữ cảnh 2D đã đặt sẵn phép biến đổi về đơn vị bản đồ. */
export function initCoast(canvas: HTMLCanvasElement, drawLand: (ctx: CanvasRenderingContext2D) => void, onLost: () => void): Coast | null {
  if (new URLSearchParams(location.search).get('coast') === 'svg') return null;
  const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false });
  if (!gl) return null;

  const sh = (type: number, src: string) => {
    const s = gl.createShader(type)!; gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || 'shader');
    return s;
  };
  let prog: WebGLProgram;
  try {
    prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) || 'link');
  } catch (e) {
    console.warn('coast: WebGL2 shader failed, using SVG', e);
    return null;
  }
  gl.useProgram(prog);
  const vb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, vb);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = (n: string) => gl.getUniformLocation(prog, n);
  const u = { res: U('uRes'), box: U('uBox'), t: U('uT'), b0: U('uB0'), bs: U('uBS'), px: U('uPx'), dpr: U('uDpr'), k: U('uK'), rough: U('uRough'), col: U('uCol'), w: U('uW') };
  gl.uniform2f(u.b0, B.x0, B.y0); gl.uniform2f(u.bs, B.x1 - B.x0, B.y1 - B.y0); gl.uniform1fv(u.w, RINGS);
  gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  const S = { t: { x: 0, y: 0, k: 1 } as T, bx: 0, by: 0, px: 1, on: false, col: [0, 0, 0], rough: 0, ready: false, lost: false };
  let raf = 0;
  const draw = () => {
    raf = 0;
    if (S.lost) return;
    const dpr = Math.min(devicePixelRatio || 1, 2), w = Math.round(canvas.clientWidth * dpr), h = Math.round(canvas.clientHeight * dpr);
    if (!w || !h) return;
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    gl.viewport(0, 0, w, h); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    if (!S.on || !S.ready) return;
    gl.uniform2f(u.res, w, h); gl.uniform1f(u.dpr, dpr);
    gl.uniform2f(u.box, S.bx, S.by); gl.uniform1f(u.px, S.px);
    gl.uniform2f(u.t, S.t.x, S.t.y); gl.uniform1f(u.k, S.t.k);
    gl.uniform3fv(u.col, S.col); gl.uniform1f(u.rough, S.rough);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  const req = () => { if (!raf) raf = requestAnimationFrame(draw); };

  // Mặt nạ đất → worker tính khoảng cách → texture R8 (lọc tuyến tính: đường vòng mịn giữa các texel).
  const tw = Math.ceil((B.x1 - B.x0) / UPT), th = Math.ceil((B.y1 - B.y0) / UPT);
  const tex = gl.createTexture();
  const build = () => {
    const c2 = document.createElement('canvas'); c2.width = tw; c2.height = th;
    const ctx = c2.getContext('2d', { willReadFrequently: true })!;
    ctx.setTransform(1 / UPT, 0, 0, 1 / UPT, -B.x0 / UPT, -B.y0 / UPT);
    ctx.fillStyle = '#000'; ctx.beginPath(); drawLand(ctx); ctx.fill();
    const mask = ctx.getImageData(0, 0, tw, th).data;
    const wk = new Worker(new URL('./coast-sdf.worker.ts', import.meta.url), { type: 'module' });
    wk.onmessage = (e: MessageEvent<Uint8Array>) => {
      wk.terminate();
      if (S.lost) return;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, tw, th, 0, gl.RED, gl.UNSIGNED_BYTE, e.data);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      S.ready = true; canvas.classList.add('ready'); req();
    };
    wk.onerror = () => { wk.terminate(); S.lost = true; onLost(); };
    wk.postMessage({ mask, w: tw, h: th, unitsPerTexel: UPT, maxD: MAXD }, [mask.buffer]);
  };
  build();

  canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); S.lost = true; canvas.classList.add('off'); onLost(); });
  new ResizeObserver(req).observe(canvas);
  // cảnh trận nâng máy quay chậm hơn (scene.ts đặt transitionDuration thẳng lên #map): nghiêng cùng nhịp
  const map = document.getElementById('map');
  if (map) new MutationObserver(() => { canvas.style.transitionDuration = map.style.transitionDuration; }).observe(map, { attributes: true, attributeFilter: ['style'] });

  const rgb = (css: string) => {
    const m = css.trim().match(/^#?([0-9a-f]{6})$/i);
    if (m) { const n = parseInt(m[1], 16); return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255]; }
    return [0.85, 0.64, 0.25];
  };
  return {
    view(t) { S.t = { x: t.x, y: t.y, k: t.k }; req(); },
    box(x, y, px) { S.bx = x; S.by = y; S.px = px; req(); },
    look(on, color, rough) { S.on = on; S.col = rgb(color); S.rough = rough ? 1 : 0; canvas.classList.toggle('off', !on); req(); },
  };
}
