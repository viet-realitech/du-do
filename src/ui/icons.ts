/* Biểu tượng nét từ bộ ký hiệu trong index.html (#i-…): cùng nét 1,5, cùng lưới 20 × 20, màu theo chữ. Thay các ký tự
   Unicode (▶ ❚❚ › ■ + −) vốn lệch 2–3 px khỏi tâm nút tuỳ phông chữ của giao diện. */
export type Icon = 'plus' | 'minus' | 'fit' | 'filter' | 'play' | 'pause' | 'stop' | 'next' | 'prev' | 'seal' | 'check' | 'arrow' | 'again';
export const icon = (n: Icon, s = 18): string => `<svg class="i" width="${s}" height="${s}" aria-hidden="true"><use href="#i-${n}"/></svg>`;
