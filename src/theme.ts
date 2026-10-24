import { S, type Theme } from './state';
import { app } from './ui/dom';
import { themeMap } from './map';
import { renderMain } from './view';

/* Look & feel chosen by the player: Lưu trữ (archive paper), Chiến lược (night command table),
   Áp phích (propaganda poster), plus faction palette, map style and overlays. */
export const THEMES: [Theme, string, string][] = [
  ['archive', 'Lưu trữ', 'Giấy ngả vàng, mực nâu, bản đồ khắc tay'],
  ['night', 'Chiến lược', 'Bàn chỉ huy ban đêm, đường biên phát sáng'],
  ['poster', 'Áp phích', 'Chữ đậm, khung đen, màu cổ động'],
];
const BAR: Record<Theme, string> = { archive: '#efe5cf', night: '#16130f', poster: '#f2e7cd' };

function paint(): void {
  const r = document.documentElement;
  r.dataset.theme = S.theme;
  app.classList.toggle('grain', S.grain);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', BAR[S.theme]);
  document.querySelector('meta[name="color-scheme"]')?.setAttribute('content', S.theme === 'night' ? 'dark' : 'light');
  themeMap();
  renderMain();
}

/** Apply the current settings; `animate` cross-fades the whole screen where View Transitions exist. */
export function applyTheme(animate = false): void {
  const d = document as Document & { startViewTransition?: (cb: () => void) => unknown };
  if (animate && d.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) d.startViewTransition(paint);
  else paint();
}

/** Three preview cards, each rendered in its own theme's tokens. */
export const themeCards = () => `<div class="thg" role="radiogroup" aria-label="Phong cách">${THEMES.map(([id, n, d]) =>
  `<button class="thc${S.theme === id ? ' on' : ''}" data-a="theme" data-v="${id}" role="radio" aria-checked="${S.theme === id}">
    <span class="pvw" data-theme="${id}"><b>1858</b><u></u><i></i></span><span class="nm">${n}</span><span class="ds">${d}</span></button>`).join('')}</div>`;
