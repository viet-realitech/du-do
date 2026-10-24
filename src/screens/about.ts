import { sheet } from '../ui/dom';
import { on } from '../ui/actions';

/* Giới thiệu: what the app is, how to read it, data credits and privacy. */
const CREDITS: [string, string, string][] = [
  ['Nền bản đồ', 'Natural Earth 1:50m (phạm vi công cộng), qua gói world-atlas', 'https://www.naturalearthdata.com/'],
  ['Địa giới tỉnh', 'geoBoundaries, Đại học William & Mary (giấy phép mở, yêu cầu ghi nguồn)', 'https://www.geoboundaries.org/'],
  ['Tóm tắt bài viết', 'Wikipedia tiếng Việt (CC BY-SA 4.0)', 'https://vi.wikipedia.org/'],
  ['Ảnh, phim, chân dung', 'Wikimedia Commons, giấy phép theo từng tệp (xem link "Nguồn" ở mỗi ảnh)', 'https://commons.wikimedia.org/'],
  ['Phông chữ', 'EB Garamond, Big Shoulders Display, IBM Plex Mono (SIL Open Font License)', 'https://fontsource.org/'],
  ['Nhạc nền', 'Kevin MacLeod (incompetech.com): Ascending the Vale, Interloper, Crossing the Chasm, Five Armies, Impact Prelude, Heroic Age. Giấy phép Creative Commons: By Attribution 4.0', 'https://creativecommons.org/licenses/by/4.0/'],
];

export function openAbout(): void {
  sheet(`<div class="mono muted">Giới thiệu · phiên bản ${__APP_VERSION__}</div>
  <h2 style="margin:6px 0 10px">Dư Đồ</h2>
  <p>Một trò chơi lịch sử về bản đồ Việt Nam từ năm 1858 tới nay. Bạn dẫn một dòng họ hư cấu qua sáu điểm rẽ, rồi so con đường của mình với hướng đã chiếm ưu thế trong lịch sử.</p>
  <div class="pv" style="margin-top:14px"><div class="mono muted">Cách đọc</div>
   <p style="font-size:16px;margin-top:4px">Các góc nhìn được tóm lược từ sử liệu công khai và xếp ngang hàng; ứng dụng không đứng về phía nào. Nhật ký dòng họ là hư cấu. Số liệu thương vong, dân số là ước tính, khác nhau giữa các nguồn. Ranh giới ba kỳ được ghép theo địa giới tỉnh hiện nay nên chỉ gần đúng với địa giới lịch sử.</p></div>
  <h3 style="margin:18px 0 4px">Nguồn dữ liệu</h3>
  ${CREDITS.map(([k, v, u]) => `<a class="src" href="${u}" target="_blank" rel="noopener"><div class="tt"><h3 style="font-size:16.5px">${k}</h3><span class="mono" style="color:var(--acc)">↗</span></div><div class="muted" style="font-size:15px;margin-top:2px">${v}</div></a>`).join('')}
  <h3 style="margin:18px 0 4px">Quyền riêng tư</h3>
  <p class="muted" style="font-size:16px">Không cần tài khoản, không quảng cáo, không theo dõi. Tiến trình chơi chỉ lưu trên thiết bị này. Khi xem ảnh và bài viết, ứng dụng tải trực tiếp từ Wikipedia và Wikimedia Commons.</p>`, true);
}

on('about', openAbout);
