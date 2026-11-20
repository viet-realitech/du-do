import { sheet } from '../ui/dom';
import { on } from '../ui/actions';
import { FEEDBACK_URL, feedbackRow } from '../ui/feedback';

/* Giới thiệu: what the app is, how to read it, data credits and privacy. */
const CREDITS: [string, string, string][] = [
  ['Nền bản đồ', 'Natural Earth 1:50m (phạm vi công cộng), qua gói world-atlas', 'https://www.naturalearthdata.com/'],
  ['Địa giới tỉnh', 'geoBoundaries, Đại học William & Mary (giấy phép mở, yêu cầu ghi nguồn)', 'https://www.geoboundaries.org/'],
  ['Tóm tắt bài viết', 'Wikipedia tiếng Việt (CC BY-SA 4.0)', 'https://vi.wikipedia.org/'],
  ['Ảnh, phim, chân dung', 'Wikimedia Commons, giấy phép theo từng tệp (xem link "Nguồn" ở mỗi ảnh)', 'https://commons.wikimedia.org/'],
  ['Phông chữ', 'EB Garamond, Big Shoulders Display, Playfair Display, Be Vietnam Pro, IBM Plex Mono (SIL Open Font License)', 'https://fontsource.org/'],
  ['Giọng đọc', 'VieNeu-TTS v3 (pnnbao-ump, mã nguồn mở Apache-2.0), giọng "Thanh Bình"; sinh sẵn lúc dựng ứng dụng', 'https://github.com/pnnbao97/VieNeu-TTS'],
  ['Nhạc nền', 'Kevin MacLeod (incompetech.com): Ascending the Vale, Interloper, Crossing the Chasm, Five Armies, Impact Prelude, Heroic Age. Giấy phép Creative Commons: By Attribution 4.0', 'https://creativecommons.org/licenses/by/4.0/'],
];

export function openAbout(): void {
  // mã bản dựng trên dòng riêng, đúng chữ như trong báo cáo chẩn đoán và git (không viết hoa, không xuống dòng giữa chừng)
  sheet(`<div class="mono muted" data-a="ver">Giới thiệu · phiên bản ${__APP_VERSION__} <span class="bid">${__APP_BUILD__}</span></div>
  <h2 style="margin:6px 0 10px">Dư Đồ</h2>
  <p>Một trò chơi lịch sử về bản đồ Việt Nam từ năm 1858 tới nay. Bạn dẫn một dòng họ hư cấu qua sáu điểm rẽ, rồi so con đường của mình với hướng đã chiếm ưu thế trong lịch sử.</p>
  <div class="pv" style="margin-top:14px"><div class="mono muted">Cách đọc</div>
   <p style="font-size:calc(16px*var(--ts));margin-top:4px">Các góc nhìn được tóm lược từ sử liệu công khai và xếp ngang hàng; ứng dụng không đứng về phía nào. Nhật ký dòng họ là hư cấu. Số liệu thương vong, dân số là ước tính, khác nhau giữa các nguồn. Ranh giới ba kỳ được ghép theo địa giới tỉnh hiện nay nên chỉ gần đúng với địa giới lịch sử.</p>
   <p style="font-size:calc(16px*var(--ts));margin-top:8px" class="method">Phần chữ được soạn với sự trợ giúp của công cụ AI và mới được đối chiếu với Wikipedia tiếng Việt, tiếng Anh. Mục Nguồn của mỗi sự kiện ghi văn kiện gốc hay bộ sử liên quan để bạn tìm đọc thêm; phần chữ chưa được đối chiếu từng câu với các sử liệu ấy. Mỗi góc nhìn là lời tóm lược của ứng dụng, không phải lời trích; cụm chữ đặt trong ngoặc ‘…’ là tên gọi, khẩu hiệu hay cách nói quen dùng của một phía. Chỉ những câu đặt trong khung trích dẫn, có ghi người nói hay văn bản gốc, mới là trích dẫn nguyên văn. Các con số của phần Chơi (gia sản, tỉ lệ kết cục, ước lượng trong thẻ "Nếu…") là của trò chơi, không phải số liệu lịch sử.</p>
   <p style="font-size:calc(16px*var(--ts));margin-top:8px">Nội dung chưa được nhà sử học thẩm định. Chỗ sai nào được chỉ ra, sau khi đối chiếu với sử liệu, sẽ được sửa trong bản cập nhật sau.${FEEDBACK_URL ? ' Bạn có thể báo chỗ sai qua mục Góp ý / Báo sai ở dưới.' : ''}</p></div>
  ${FEEDBACK_URL ? `<div style="margin-top:16px">${feedbackRow('giới thiệu')}</div>` : ''}
  <h3 style="margin:18px 0 4px">Nguồn dữ liệu</h3>
  ${CREDITS.map(([k, v, u]) => `<a class="src" href="${u}" target="_blank" rel="noopener"><div class="tt"><h3 style="font-size:calc(16.5px*var(--ts))">${k}</h3><span class="mono" style="color:var(--acc)">↗</span></div><div class="muted" style="font-size:calc(15px*var(--ts));margin-top:2px">${v}</div></a>`).join('')}
  <h3 style="margin:18px 0 4px">Quyền riêng tư</h3>
  <p class="muted" style="font-size:calc(16px*var(--ts))">Không cần tài khoản, không quảng cáo, không theo dõi. Tiến trình chơi chỉ lưu trên thiết bị này. Khi xem ảnh và bài viết, ứng dụng tải trực tiếp từ Wikipedia và Wikimedia Commons.</p>`, true);
}

on('about', openAbout);
// chạm 5 lần vào dòng phiên bản: bảng chẩn đoán (ui/debug.ts; ứng dụng trên màn hình chính không thêm được ?debug)
let taps = 0, tapAt = 0;
on('ver', () => {
  const t = Date.now();
  taps = t - tapAt < 1500 ? taps + 1 : 1;
  tapAt = t;
  if (taps >= 5) { taps = 0; void import('../ui/debug').then(m => m.openDebug()); }
});
