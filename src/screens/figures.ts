import { ERAS, FIG, FIGERA, FIGSIDE, SIDES, sideName, figEvents } from '../data';
import { bornLine } from '../data/surnames';
import { S, save, figOpen, figsMet } from '../state';
import { esc, layer, sheet, toast } from '../ui/dom';
import { av, initials } from '../ui/bits';
import { icon } from '../ui/icons';
import { buzz } from '../audio';
import { checkBadges } from '../badges';
import { FIGIMG, figFocus, figImgPage } from '../wiki';

export function openFig(id: string): void {
  const f = FIG[id];
  if (!f) return;
  if (!figOpen(id)) {
    const e = ERAS.find(x => x.id === FIGERA[id])!;
    toast(`Nhân vật này mở khi dòng họ bạn đi qua điểm rẽ ${e.n} · ${e.cy}.`);
    buzz(15);
    return;
  }
  if (!S.figSeen.includes(id)) { S.figSeen.push(id); save(); }
  const chose = ERAS.flatMap(e => e.opts.filter(o => o.guide === id).map(o => [e, o] as const));
  const img = FIGIMG[id] ? ` src="${esc(FIGIMG[id])}" focus="${figFocus(id)}" credit="Wikimedia Commons" credit-href="${esc(figImgPage(id))}"` : '';
  // ảnh hồ sơ chữ nhật khung đôi (như thẻ nhân vật trong bảng), tên / năm / vai trò đặt bên cạnh như nhãn bảo tàng
  sheet(`<div class="fhead"><div class="fph"><image-slot id="fg-${id}" shape="rect" placeholder="Chân dung" initials="${esc(initials(f[0]))}"${img}></image-slot></div>
  <div><div class="mono muted">${f[1]}${sideName(id) ? ' · ' + sideName(id) : ''}</div><h2 style="margin-top:4px">${f[0]}</h2><div class="muted" style="font-style:italic;margin-top:2px">${f[2]}${bornLine(id) ? ` · ${esc(bornLine(id))}` : ''}</div></div></div>
  <p style="margin-top:16px">${f[3]}</p>
  ${figEvents(id).length ? `<div class="rule"></div><div class="mono muted">Sự kiện liên quan</div>${figEvents(id).map(v => `<button class="row evl" data-a="ev" data-id="${v.id}"><span class="mono muted">${v.y}</span><span style="flex:1">${esc(v.t)}</span><span class="muted">${icon('next', 16)}</span></button>`).join('')}` : ''}
  ${chose.length ? `<div class="rule"></div><div class="mono muted">Đồng hành khi bạn chọn</div>${chose.map(([e, o]) => `<div style="font-size:16px;margin-top:6px"><span class="mono muted">${e.cy}</span> · ${o.label}${S.picks[e.id] === o.id ? ' <span class="mono" style="color:var(--acc)">· đã chọn</span>' : ''}</div>`).join('')}` : ''}
  <p class="muted" style="font-size:13px;margin-top:16px">Tiểu sử tóm lược từ sử liệu công khai.</p>`, true).dataset.fig = id; // trang sự kiện mở từ đây thì đóng xong mở lại thẻ này
  checkBadges();
}

/** Nhân vật tab: figures grouped by chapter, locked (blurred) until that turning point is passed. */
export function paneFig(): void {
  const met = figsMet(), ids = Object.keys(FIG);
  layer.innerHTML = `<div class="pane"><div class="mono muted">${met.size}/${ids.length} đã mở</div><h1 style="margin:6px 0 4px">Nhân vật</h1>
  <p class="muted" style="font-size:var(--t-body);margin-bottom:6px">Mỗi điểm rẽ dòng họ bạn đi qua sẽ mở khoá những nhân vật của thời đó.</p>
  ${ERAS.map(e => {
    const fs = ids.filter(id => FIGERA[id] === e.id), open = !!S.picks[e.id];
    const card = (id: string) => {
      const f = FIG[id];
      return `<button class="fcard${open ? '' : ' off'}" data-a="fig" data-id="${id}"${open ? '' : ' aria-label="Nhân vật chưa mở"'}>${av(id, 0, !open)}<div class="nm h4">${f[0]}</div><div class="mono muted" style="margin-top:4px">${open ? f[1] : 'Chưa mở'}</div><div class="muted nm small" style="margin-top:3px">${f[2]}</div></button>`;
    };
    // Nhóm theo phe / lĩnh vực (thứ tự SIDES); người đồng hành của điểm rẽ luôn đứng đầu nhóm.
    const groups = SIDES.map(([k, name]) => [name, fs.filter(id => FIGSIDE[id] === k)] as const).filter(g => g[1].length);
    const other = fs.filter(id => !FIGSIDE[id]); if (other.length) groups.push(['Khác', other]);
    return `<div class="row sb" style="margin:22px 0 10px"><b class="h4">${e.n}. ${e.title}</b><span class="mono ${open ? '' : 'muted'}" style="${open ? 'color:var(--acc)' : ''}">${open ? 'Đã mở' : 'Mở năm ' + e.cy}</span></div>
     ${groups.length > 1 ? groups.map(([name, g]) => `<div class="mono muted fside">${name} · ${g.length}</div><div class="fgrid">${g.map(card).join('')}</div>`).join('') : `<div class="fgrid">${fs.map(card).join('')}</div>`}`;
  }).join('')}</div>`;
}
