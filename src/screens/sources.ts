import { EV, SRC } from '../data';
import { S, save } from '../state';
import { esc, layer, sheet } from '../ui/dom';
import { checkBadges } from '../badges';

export function openSrc(id: string): void {
  const s = SRC.find(x => x.id === id);
  if (!s) return;
  if (!S.srcSeen.includes(id)) { S.srcSeen.push(id); save(); }
  const evs = EV.filter(v => v.src.includes(id));
  sheet(`<div class="row sb"><span class="mono" style="color:var(--red)">${s.k}</span><span class="stamp" style="font-size:10px">Công khai</span></div>
  <h2 style="margin:10px 0 4px">${esc(s.t)}</h2><div class="muted" style="font-style:italic">${esc(s.by)} · ${esc(s.y)}</div>
  <p style="margin-top:12px">${esc(s.d)}</p>
  <div class="pv" style="margin-top:14px"><div class="mono muted">Nơi lưu giữ</div><p style="font-size:16px;margin-top:3px">${esc(s.at)}</p></div>
  ${evs.length ? `<div class="mono muted" style="margin:16px 0 4px">Được dẫn trong ${evs.length} sự kiện</div>` +
    evs.map(v => `<button class="src" data-a="goev" data-id="${v.id}"><div class="tt"><h3 style="font-size:16.5px">${esc(v.t)}</h3><span class="mono muted">${v.y}</span></div></button>`).join('') : ''}`, true);
  checkBadges();
}

let srcFilter = 'Tất cả';
let srcQ = '';

/** Sử liệu tab: searchable, filterable archive. Only the list re-renders while typing. */
export function paneSrc(): void {
  const kinds = ['Tất cả', ...new Set(SRC.map(s => s.k))];
  layer.innerHTML = `<div class="pane"><div class="mono muted">Kho sử liệu · ${SRC.length} hồ sơ</div><h1 style="margin:6px 0 4px">Sử liệu</h1>
  <p class="muted" style="font-size:16px">Văn bản gốc, hiệp ước, phông lưu trữ đã công bố, từ Huế, Hà Nội, Sài Gòn, Aix-en-Provence đến Washington.</p>
  <input class="f" id="sq" type="search" aria-label="Tìm sử liệu" placeholder="Tìm văn bản, nơi lưu trữ…" value="${esc(srcQ)}" style="margin:14px 0 10px;height:44px;font-size:17px">
  <div class="chips" id="sk">${kinds.map(k => `<button class="chip${k === srcFilter ? ' on' : ''}" data-k="${esc(k)}">${esc(k)}</button>`).join('')}</div>
  <div style="margin-top:8px" id="sl"></div></div>`;
  const list = () => {
    const q = srcQ.toLowerCase();
    const L = SRC.filter(s => (srcFilter === 'Tất cả' || s.k === srcFilter) && (!q || (s.t + s.by + s.at).toLowerCase().includes(q)));
    layer.querySelector('#sl')!.innerHTML = L.map(s => `<button class="src" data-a="src" data-id="${s.id}"><div class="tt"><h3>${esc(s.t)}</h3><span class="mono muted" style="white-space:nowrap">${S.srcSeen.includes(s.id) ? '✓ ' : ''}${s.k}</span></div><div class="muted" style="font-size:15px;margin-top:3px">${esc(s.y)} · ${esc(s.at)}</div></button>`).join('') ||
      '<p class="muted" style="padding:20px 0">Không có kết quả.</p>';
  };
  layer.querySelectorAll<HTMLElement>('#sk .chip').forEach(b => (b.onclick = () => {
    srcFilter = b.dataset.k!;
    layer.querySelectorAll('#sk .chip').forEach(x => x.classList.toggle('on', x === b));
    list();
  }));
  const qi = layer.querySelector<HTMLInputElement>('#sq')!;
  qi.oninput = () => { srcQ = qi.value; list(); };
  list();
}
