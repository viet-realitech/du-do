import { refreshMusic } from '../music';
import { applyTheme, themeCards } from '../theme';
import { flag } from '../ui/bits';
import type { Faction } from '../data';
import { BADGES, ERAS, FIG, VAL } from '../data';
import { S, save, optOf, archetype, quizCorrect, values, pct, familyName } from '../state';
import { on } from '../ui/actions';
import { esc, layer } from '../ui/dom';
import { SND, buzz } from '../audio';
import { hasTTS, hasVoice, speak } from '../narration';
import { openShare, resetAll } from './ending';
import './about';

/** Value compass: cumulative points per value (max ≈ 18). */
export function compass(): string {
  const v = values();
  return VAL.map(([k, n]) => `<div class="vrow"><span>${n}</span><div class="bar"><i style="width:${Math.min(100, (v[k] / 18) * 100)}%"></i></div><b>${v[k]}</b></div>`).join('');
}

const RATES: [number, string][] = [[0.8, 'Chậm'], [0.95, 'Vừa'], [1.15, 'Nhanh']];

export function paneMe(): void {
  const done = ERAS.filter(e => S.picks[e.id]).length, a = archetype();
  const sw = (key: string, label: string, onState: boolean) =>
    `<button class="row set" data-a="set" data-k="${key}" role="switch" aria-checked="${onState}"><span>${label}</span><span class="sw${onState ? ' on' : ''}"></span></button>`;
  const keep = layer.querySelector('.pane')?.scrollTop || 0;
  const seg = (a: string, cur: string, opts: [string, string][]) =>
    `<div class="seg" style="width:180px;flex:none">${opts.map(([v, l]) => `<button class="${cur === v ? 'on' : ''}" style="height:30px;font-size:14px" data-a="${a}" data-v="${v}" aria-pressed="${cur === v}">${l}</button>`).join('')}</div>`;
  const sample = (['dainam', 'phap', 'vndcch', 'vnch'] as Faction[]).map(flag).join('');
  layer.innerHTML = `<div class="pane"><div class="mono muted">Hồ sơ dòng họ</div><h1 style="margin:6px 0 2px">${esc(familyName())}</h1>
  <p class="muted" style="font-style:italic">${a ? a[0] + ' · ' + a[1] : 'Chưa có lựa chọn nào.'}</p>
  <div class="cmp stats">
   <div><span class="mono">Thế hệ</span><b>${done}/6</b></div>
   <div><span class="mono">Sự kiện</span><b>${S.seen.length}</b></div>
   <div><span class="mono">Sử liệu</span><b>${S.srcSeen.length}</b></div>
   <div><span class="mono">Đố đúng</span><b>${quizCorrect()}/12</b></div></div>
  <div class="bar" style="margin:14px 0 4px"><i style="width:${pct(S.year)}%"></i></div><div class="mono muted">Đã đi tới năm ${S.year}</div>
  <h3 style="margin:22px 0 6px">La bàn giá trị</h3>${compass()}
  <p class="muted" style="font-size:13px;margin-top:4px">Cộng dồn từ điều mỗi lực lượng tự tuyên bố theo đuổi.</p>
  <h3 style="margin:22px 0 10px">Huy hiệu · ${S.badges.length}/${BADGES.length}</h3>
  <div class="bgrid">${BADGES.map(([id, ic, n, d]) => `<div class="bdg${S.badges.includes(id) ? '' : ' off'}"><div class="bi">${ic}</div><b>${n}</b><div class="muted" style="font-size:11.5px;margin-top:2px">${d}</div></div>`).join('')}</div>
  <h3 style="margin:22px 0 4px">Sáu thế hệ</h3>
  ${ERAS.map(e => {
    const o = optOf(e);
    return `<div class="era-row"><div class="n">${e.n}</div><div><div class="row sb"><b style="font:700 17px var(--disp)">${e.title}</b><span class="mono muted">${e.cy}</span></div>
     <div style="font-size:16px;margin-top:2px;${o ? '' : 'color:var(--ink3)'}">${o ? 'Chọn <b>' + o.label + '</b> · đồng hành: <i>' + FIG[o.guide][0] + '</i>' : 'Chưa tới'}</div></div></div>`;
  }).join('')}
  <h3 style="margin:22px 0 10px">Giao diện</h3>
  ${themeCards()}
  <div class="row sb" style="padding:12px 0 6px"><span class="row" style="white-space:nowrap"><span class="muted">Màu các phe</span><span class="swl" aria-hidden="true">${sample}</span></span>${seg('pal', S.pal, [['flag', 'Theo cờ'], ['sepia', 'Mực nâu']])}</div>
  <div class="row sb" style="padding:6px 0"><span class="muted">Nét bản đồ${S.theme === 'archive' ? '' : ' <span style="font-size:13px">· với Lưu trữ</span>'}</span>${seg('mstyle', S.mstyle, [['co', 'Cổ điển'], ['flat', 'Phẳng']])}</div>
  ${sw('grain', 'Vân giấy', S.grain)}
  ${sw('modern', 'Đường biên hiện nay', S.modern)}
  ${sw('grat', 'Lưới kinh – vĩ độ', S.grat)}
  <h3 style="margin:22px 0 6px">Cài đặt</h3>
  ${sw('sound', 'Âm thanh', S.sound)}
  ${sw('music', 'Nhạc nền', S.music)}
  ${sw('narr', `Giọng đọc${hasTTS && !hasVoice() ? ' <span class="muted" style="font-size:13px">· chưa có giọng tiếng Việt</span>' : ''}`, S.narr)}
  <div class="row sb" style="padding:6px 0"><span class="muted">Tốc độ đọc</span><div class="seg" style="width:190px">${RATES.map(([r, l]) => `<button class="${S.rate === r ? 'on' : ''}" style="height:30px;font-size:14px" data-a="rate" data-r="${r}" data-l="${l}">${l}</button>`).join('')}</div></div>
  ${sw('haptic', 'Rung', S.haptic)}
  <div style="height:18px"></div>
  ${done ? '<button class="btn" data-a="share">Tạo thẻ chia sẻ</button><div style="height:10px"></div>' : ''}
  ${done === 6 ? '<button class="btn ghost" data-a="end">Xem kết luận</button><div style="height:10px"></div>' : ''}
  <button class="btn ghost" data-a="about">Giới thiệu & nguồn dữ liệu</button>
  <button class="lnk" data-a="reset">Chơi lại từ đầu</button></div>`;
  layer.querySelector('.pane')!.scrollTop = keep;
}

on('set', el => {
  const k = el.dataset.k as 'sound' | 'music' | 'narr' | 'haptic' | 'grain' | 'modern' | 'grat';
  S[k] = !S[k];
  save();
  paneMe();
  if (k === 'sound' && S.sound) SND.chime();
  if (k === 'sound' || k === 'music') refreshMusic();
  if (k === 'narr' && S.narr) speak('Giọng đọc đã bật.');
  if (k === 'haptic') buzz(20);
  if (k === 'grain' || k === 'modern' || k === 'grat') { applyTheme(); SND.tick(); }
});
on('rate', el => { S.rate = +el.dataset.r!; save(); paneMe(); speak(`Tốc độ ${el.dataset.l!.toLowerCase()}.`); });
on('share', () => openShare());
on('reset', () => resetAll());

/* Appearance: theme, faction palette and map style (shared by onboarding and settings). */
on('theme', el => {
  S.theme = el.dataset.v as typeof S.theme;
  save();
  applyTheme(true);
  SND.page();
  el.closest('.thg')?.querySelectorAll<HTMLElement>('.thc').forEach(b => { const o = b === el; b.classList.toggle('on', o); b.setAttribute('aria-checked', String(o)); });
  if (layer.querySelector('.pane .thg')) paneMe();
});
on('pal', el => { S.pal = el.dataset.v as typeof S.pal; save(); applyTheme(); paneMe(); SND.tick(); });
on('mstyle', el => { S.mstyle = el.dataset.v as typeof S.mstyle; save(); applyTheme(); paneMe(); SND.tick(); });
