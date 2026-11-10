import { S, type Theme } from './state';
import { app } from './ui/dom';
import { themeMap } from './map';
import { renderMain } from './view';
import { mapColors } from './ui/bits';

/* Look & feel chosen by the player: Lưu trữ (archive paper, the default for new players), Đèn dầu (the same map sheet
   read at night: dark paper, brass ink) and Áp phích (propaganda poster), plus faction palette, map style and overlays. */
export const THEMES: [Theme, string, string][] = [
  ['archive', 'Lưu trữ', 'Giấy ngả vàng, mực nâu, bản đồ khắc tay'],
  ['night', 'Đèn dầu', 'Tấm bản đồ ấy đọc ban đêm: nền tối, chữ ánh đồng'],
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

/** Đường bờ Việt Nam (đất liền) giản lược còn ~60 điểm từ dữ liệu bản đồ, khung 30 × 52: thẻ xem trước là một tấm bản đồ nhỏ. */
const VN = 'M22.1 7.5L19.5 9.4L17.9 9.2L17.6 11.3L15.6 12.9L14.5 16.2L17.3 19.7L16.8 20.4L24.8 28.4L26.9 37.7L26.1 37.6L25.4 41.9L19.8 45L19 44.2L18.8 45L17.7 44.8L18.2 45.4L17.2 45.4L18.2 46L17.6 46.8L16.1 45.6L17.6 47.5L15.1 46.3L16.2 48.3L11.7 51L12.7 46.5L10.6 45L12.6 43.3L16.2 43.7L15.2 40.9L20.6 38.5L20.9 34.9L20 32.6L21.1 28.9L19.5 27L20.2 26.2L17.8 24.7L12.9 17.3L8.8 15.1L9.3 13.8L11.1 14L12.2 12.6L10.4 11.2L11.1 10.4L9.5 9.4L8 10.3L6.3 9.6L5.8 6.8L4.9 6.9L3.1 4.4L4.2 3.1L5.9 4.2L7 3L9 3.8L13.3 1L15.2 2.5L18.2 3L17.5 4L17.8 5.8Z';

/** Three preview cards, each rendered in its own theme's tokens. */
export const themeCards = () => `<div class="thg" role="radiogroup" aria-label="Phong cách">${THEMES.map(([id, n, d]) => {
  const c = mapColors(id);
  return `<button class="thc${S.theme === id ? ' on' : ''}" data-a="theme" data-v="${id}" role="radio" aria-checked="${S.theme === id}">
    <span class="pvw" data-theme="${id}"><b>1858</b><svg viewBox="0 0 30 52" aria-hidden="true"><rect width="30" height="52" fill="${c.sea}"/><path d="${VN}" fill="${c.land}" stroke="currentColor" stroke-width=".8" stroke-linejoin="round"/></svg></span><span class="nm">${n}</span><span class="ds">${d}</span></button>`;
}).join('')}</div>`;
