import { FIG, VAL, type Faction, type Option } from '../data';
import { FIGIMG, figFocus } from '../wiki';
import { S, type Theme } from '../state';

/* Faction colours: after the historical flags, or a sepia-ink set (lighter on the night theme). */
type Pal = { dainam: string; phap: string; bh1: string; bh2: string; red: string; yel: string; blue: string; jp: string };
const FLAGS: Pal = { dainam: '#d3a338', phap: '#3f5b8c', bh1: '#8496b6', bh2: '#3f5b8c', red: '#a8322b', yel: '#ddb03a', blue: '#2f5fa0', jp: '#b3322a' };
const SEPIA: Pal = { dainam: '#c7a46a', phap: '#6e5a43', bh1: '#a8916f', bh2: '#6e5a43', red: '#4f3a27', yel: '#d9bf8c', blue: '#8b7457', jp: '#4f3a27' };
const NIGHT_SEPIA: Pal = { dainam: '#e2c48a', phap: '#a88d68', bh1: '#cdb48a', bh2: '#a88d68', red: '#d8b47a', yel: '#efdcae', blue: '#9a8466', jp: '#d8b47a' };
export const pal = (): Pal => (S.pal === 'sepia' ? (S.theme === 'night' ? NIGHT_SEPIA : SEPIA) : FLAGS);

/** Unclaimed land and sea per theme. */
const TH: Record<Theme, { land: string; sea: string }> = {
  archive: { land: '#e3d3b0', sea: '#c9d2c4' }, night: { land: '#2b251d', sea: '#0f1619' }, poster: { land: '#f2e7cd', sea: '#dcc99c' },
};
export const land = () => TH[S.theme].land;
export const sea = () => TH[S.theme].sea;

function flagCss(k: Faction): string {
  const c = pal();
  return ({
    dainam: `background:${c.dainam}`,
    phap: 'background:linear-gradient(90deg,#2f4f8f 33%,#f3ecdc 33% 66%,#b23a32 66%)',
    phap_bh: `background:repeating-linear-gradient(45deg,${c.bh1} 0 3px,${c.bh2} 3px 5px)`,
    vndcch: `background:${c.red}`,
    chxhcn: `background:${c.red}`,
    vnch: `background:linear-gradient(${c.yel} 0 34%,${c.red} 34% 43%,${c.yel} 43% 46%,${c.red} 46% 55%,${c.yel} 55% 58%,${c.red} 58% 67%,${c.yel} 67%)`,
    cmlt: `background:linear-gradient(${c.red} 50%,${c.blue} 50%)`,
    tc: `background:repeating-linear-gradient(45deg,${c.red} 0 3px,${c.phap} 3px 6px)`,
    dnph: `background:repeating-linear-gradient(45deg,${c.dainam} 0 3px,${c.phap} 3px 6px)`,
    jp: `background:radial-gradient(circle,${c.jp} 0 28%,#f3ecdc 32%)`,
  } as Record<Faction, string>)[k];
}

export function flag(k: Faction): string {
  const star = S.pal === 'flag' && ['vndcch', 'chxhcn', 'cmlt'].includes(k) ? '<b>★</b>' : '';
  return `<i class="flag" style="${flagCss(k)}">${star}</i>`;
}

/** SVG fill for a faction on the map (solid colour or a pattern from map defs). */
export function fill(k: Faction | null | undefined): string {
  if (!k) return land();
  const c = pal();
  return ({
    dainam: c.dainam, phap: c.phap, phap_bh: 'url(#p-bh)', vndcch: c.red, chxhcn: c.red,
    vnch: 'url(#p-vnch)', cmlt: 'url(#p-cmlt)', tc: 'url(#p-tc)', dnph: 'url(#p-dnph)', jp: c.jp,
  } as Record<Faction, string>)[k];
}

export const fxChips = (fx: Option['fx']) =>
  Object.entries(fx || {}).map(([k, n]) => `<span class="fx">+${n} ${VAL.find(v => v[0] === k)![1]}</span>`).join('');

export function initials(n: string): string {
  const w = n.replace(/\s*\(.*\)\s*$/, '').split(' '); // bỏ biệt danh trong ngoặc
  return (w.length > 1 ? w[w.length - 2][0] + w[w.length - 1][0] : w[0].slice(0, 2)).toUpperCase();
}

/** Round portrait (initials until the Wikipedia image arrives). */
export function av(id: string, sz = 0, lock = false): string {
  const style = sz ? ` style="width:${sz}px;height:${sz}px;font-size:${Math.round(sz * 0.36)}px"` : '';
  return `<span class="av${lock ? ' lock' : ''}" data-fig="${id}"${style}>${FIGIMG[id] ? `<img src="${FIGIMG[id]}" alt="" style="${figFocus(id)}">` : initials(FIG[id][0])}</span>`;
}

// A portrait that fails to load (offline, blocked) falls back to the figure's initials.
document.addEventListener('error', e => {
  const im = e.target, box = im instanceof HTMLImageElement ? im.parentElement : null;
  if (box && box.classList.contains('av') && box.dataset.fig && FIG[box.dataset.fig]) box.textContent = initials(FIG[box.dataset.fig][0]);
}, true);

export const TAG_LABEL: Record<string, string> = { vutrang: 'Đấu tranh', caicach: 'Cải cách', thuongthuyet: 'Hoà hoãn', giunep: 'Giữ nếp' };
