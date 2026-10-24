import { FIG, VAL, type Faction, type Option } from '../data';
import { FIGIMG, figFocus } from '../wiki';

/* Faction colours, after the historical flags. */
export const PAL = { dainam: '#d3a338', phap: '#3f5b8c', bh1: '#8496b6', bh2: '#3f5b8c', red: '#a8322b', yel: '#ddb03a', blue: '#2f5fa0', jp: '#b3322a' };
export const LAND = '#2b251d';
export const SEA = '#0f1619';

const FLAG_CSS: Record<Faction, string> = {
  dainam: `background:${PAL.dainam}`,
  phap: 'background:linear-gradient(90deg,#2f4f8f 33%,#f3ecdc 33% 66%,#b23a32 66%)',
  phap_bh: `background:repeating-linear-gradient(45deg,${PAL.bh1} 0 3px,${PAL.bh2} 3px 5px)`,
  vndcch: `background:${PAL.red}`,
  chxhcn: `background:${PAL.red}`,
  vnch: `background:linear-gradient(${PAL.yel} 0 34%,${PAL.red} 34% 43%,${PAL.yel} 43% 46%,${PAL.red} 46% 55%,${PAL.yel} 55% 58%,${PAL.red} 58% 67%,${PAL.yel} 67%)`,
  cmlt: `background:linear-gradient(${PAL.red} 50%,${PAL.blue} 50%)`,
  tc: `background:repeating-linear-gradient(45deg,${PAL.red} 0 3px,${PAL.phap} 3px 6px)`,
  dnph: `background:repeating-linear-gradient(45deg,${PAL.dainam} 0 3px,${PAL.phap} 3px 6px)`,
  jp: `background:radial-gradient(circle,${PAL.jp} 0 28%,#f3ecdc 32%)`,
};

export function flag(k: Faction): string {
  const star = ['vndcch', 'chxhcn', 'cmlt'].includes(k) ? '<b>★</b>' : '';
  return `<i class="flag" style="${FLAG_CSS[k]}">${star}</i>`;
}

/** SVG fill for a faction on the map (solid colour or a pattern from map defs). */
export function fill(k: Faction | null | undefined): string {
  if (!k) return LAND;
  return ({
    dainam: PAL.dainam, phap: PAL.phap, phap_bh: 'url(#p-bh)', vndcch: PAL.red, chxhcn: PAL.red,
    vnch: 'url(#p-vnch)', cmlt: 'url(#p-cmlt)', tc: 'url(#p-tc)', dnph: 'url(#p-dnph)', jp: PAL.jp,
  } as Record<Faction, string>)[k];
}

export const fxChips = (fx: Option['fx']) =>
  Object.entries(fx || {}).map(([k, n]) => `<span class="fx">+${n} ${VAL.find(v => v[0] === k)![1]}</span>`).join('');

export function initials(n: string): string {
  const w = n.split(' ');
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

export const TAG_LABEL: Record<string, string> = { vutrang: 'Đấu tranh', caicach: 'Cải cách', thuongthuyet: 'Hoà hoãn' };
