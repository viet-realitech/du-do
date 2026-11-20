import { esc } from './dom';

/* Góp ý / Báo sai: một liên kết ra trang bên ngoài (Google Form, hay email riêng của dự án) ở cuối thẻ Nguồn của sự
   kiện, cuối thẻ nhân vật và trong Giới thiệu. Ứng dụng không gửi gì, không đếm lượt bấm (Giới thiệu hứa "không theo
   dõi"): người đọc tự mở trang góp ý trong thẻ mới. Chưa có địa chỉ thì không hiện liên kết nào, không để link chết. */

/** Địa chỉ nhận góp ý, đặt lúc dựng bằng biến môi trường VITE_FEEDBACK_URL (Vercel: Settings → Environment Variables),
    hay điền thẳng vào chuỗi '' dưới đây. Chỉ nhận https:// hoặc mailto:. Có `{ref}` thì thay bằng mã chỗ đang đọc và
    phiên bản (vd. ô "Mã" điền sẵn của Google Form); mailto: tự thêm tiêu đề thư. */
export const FEEDBACK_URL: string = ok(String(import.meta.env.VITE_FEEDBACK_URL || '').trim());

function ok(u: string): string {
  return /^(https:\/\/[^\s"'<>]+|mailto:[^\s"'<>]+)$/i.test(u) ? u : '';
}

/** Đường dẫn góp ý cho chỗ `ref` (vd. "sự kiện dn58 · Tiếng súng Sơn Trà"); '' khi chưa có địa chỉ. */
export function feedbackHref(ref: string): string {
  if (!FEEDBACK_URL) return '';
  const tag = `${ref} · bản ${__APP_VERSION__} (${__APP_BUILD__})`;
  if (FEEDBACK_URL.includes('{ref}')) return FEEDBACK_URL.split('{ref}').join(encodeURIComponent(tag));
  if (/^mailto:/i.test(FEEDBACK_URL) && !/[?&]subject=/i.test(FEEDBACK_URL)) return `${FEEDBACK_URL}${FEEDBACK_URL.includes('?') ? '&' : '?'}subject=${encodeURIComponent('Dư Đồ · góp ý · ' + tag)}`;
  return FEEDBACK_URL;
}

/** Một dòng "Góp ý / Báo sai" cùng kiểu các dòng nguồn (.src): mở thẻ mới (mailto: thì mở ứng dụng thư); '' khi chưa có
    địa chỉ. `about`: tiêu đề dòng, vd. "về sự kiện này". */
export function feedbackRow(ref: string, about = ''): string {
  const href = feedbackHref(ref);
  if (!href) return '';
  const tab = /^mailto:/i.test(href) ? '' : ' target="_blank" rel="noopener"';
  return `<a class="src fb" href="${esc(href)}"${tab}><div class="tt"><h3 style="font-size:16.5px">Góp ý / Báo sai${about ? ' ' + about : ''}</h3><span class="mono" style="color:var(--acc)" aria-hidden="true">↗</span></div>` +
    `<div class="muted" style="font-size:15px;margin-top:2px">Thấy sai ngày tháng, số liệu, lời trích, hay một đoạn viết chưa công bằng? Trang góp ý mở ra bên ngoài ứng dụng; ứng dụng không tự gửi gì.</div></a>`;
}
