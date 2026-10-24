import { ERAS, FIG, FIGERA } from '../data';
import { S, save, figOpen, figsMet } from '../state';
import { esc, layer, sheet, toast } from '../ui/dom';
import { av, initials } from '../ui/bits';
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
  sheet(`<div class="row" style="gap:16px;align-items:center"><div style="width:96px;height:96px;flex:none"><image-slot id="fg-${id}" shape="circle" placeholder="Chân dung" initials="${esc(initials(f[0]))}"${img}></image-slot></div>
  <div><div class="mono muted">${f[1]}</div><h2 style="margin-top:4px">${f[0]}</h2><div class="muted" style="font-style:italic">${f[2]}</div></div></div>
  <p style="margin-top:16px">${f[3]}</p>
  ${chose.length ? `<div class="rule"></div><div class="mono muted">Đồng hành khi bạn chọn</div>${chose.map(([e, o]) => `<div style="font-size:16px;margin-top:6px"><span class="mono muted">${e.cy}</span> · ${o.label}${S.picks[e.id] === o.id ? ' <span class="mono" style="color:var(--acc)">· đã chọn</span>' : ''}</div>`).join('')}` : ''}
  <p class="muted" style="font-size:13px;margin-top:16px">Tiểu sử tóm lược từ sử liệu công khai.</p>`, true);
  checkBadges();
}

/** Nhân vật tab: figures grouped by chapter, locked (blurred) until that turning point is passed. */
export function paneFig(): void {
  const met = figsMet(), ids = Object.keys(FIG);
  layer.innerHTML = `<div class="pane"><div class="mono muted">${met.size}/${ids.length} đã mở</div><h1 style="margin:6px 0 4px">Nhân vật</h1>
  <p class="muted" style="font-size:16px;margin-bottom:6px">Mỗi điểm rẽ dòng họ bạn đi qua sẽ mở khoá những nhân vật của thời đó.</p>
  ${ERAS.map(e => {
    const fs = ids.filter(id => FIGERA[id] === e.id), open = !!S.picks[e.id];
    return `<div class="row sb" style="margin:22px 0 10px"><b style="font:700 18px var(--disp)">${e.n}. ${e.title}</b><span class="mono ${open ? '' : 'muted'}" style="${open ? 'color:var(--acc)' : ''}">${open ? 'Đã mở' : 'Mở năm ' + e.cy}</span></div>
     <div class="fgrid">${fs.map(id => {
      const f = FIG[id];
      return `<button class="fcard${open ? '' : ' off'}" data-a="fig" data-id="${id}"${open ? '' : ' aria-label="Nhân vật chưa mở"'}>${av(id, 0, !open)}<div class="nm" style="font:700 16.5px/1.15 var(--disp)">${f[0]}</div><div class="mono muted" style="margin-top:3px">${open ? f[1] : 'Chưa mở'}</div><div class="muted nm" style="font-size:13.5px;margin-top:4px;line-height:1.2">${f[2]}</div></button>`;
    }).join('')}</div>`;
  }).join('')}</div>`;
}
