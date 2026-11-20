# Phiếu rà soát nội dung Dư Đồ

Thư ngắn cho người rà soát sử học. Sinh tự động bằng `npm run review:export`; chạy lại sau mỗi lần sửa nội dung (các con số dưới đây theo bản mã lúc chạy).

## Đoạn giới thiệu để gửi

> Chào anh/chị, tôi đang làm **Dư Đồ**, một ứng dụng miễn phí trên điện thoại và máy tính bảng kể lịch sử Việt Nam từ năm 1858 tới nay trên một tấm bản đồ, cho người lớn yêu sử và bà con người Việt ở nước ngoài. Phần chữ được soạn với sự trợ giúp của công cụ AI và mới chỉ đối chiếu với Wikipedia, chưa qua tay nhà sử học nào. Tôi cần một người có chuyên môn đọc khoảng 213 câu rủi ro nhất (số liệu thương vong, lời trích, các đề tài nhạy cảm như các vụ bắt, giết người khác chính kiến năm 1945–1947, cải cách ruộng đất, Mậu Thân và thảm sát Huế, Mỹ Lai, học tập cải tạo, thuyền nhân, chiến tranh 1979, biển đảo, góc nhìn VNCH và hải ngoại, các giả định "Nếu…"), đánh dấu Đúng / Sửa / Bỏ / Thiếu nguồn / Còn tranh luận và ghi nguồn đối chiếu. Ước chừng một đến hai ngày làm việc; tôi sẽ trả thù lao, xin anh/chị cho biết mức phí. Bảng tính kèm theo đã có sẵn cột để điền.

## Ứng dụng là gì

- Một bản đồ Việt Nam 1858 – 2026: ranh giới đổi theo năm, 91 sự kiện có thật, mỗi sự kiện có phần diễn biến, các "góc nhìn" (lời tóm lược của ứng dụng về cách từng phía nhìn sự kiện: sử học chính thống Việt Nam, sử quan VNCH và hải ngoại, sử liệu Pháp, Mỹ, Trung Quốc, sử gia quốc tế…), nguồn, câu đố; 81 nhân vật; 26 hồ sơ sử liệu.
- Sáu "điểm rẽ" (1858, 1885, 1930, 1945, 1954, 1976): người chơi chọn một hướng rồi so với hướng đã chiếm ưu thế trong lịch sử. Hướng không chiếm ưu thế có một thẻ "Nếu…" (giả định, ghi rõ "không phải lịch sử", kèm một ước lượng %).
- Chế độ Chơi: một dòng họ hư cấu qua sáu thế hệ, với các thẻ lựa chọn đặt trong bối cảnh có thật. Phần hư cấu không cần kiểm văn chương, chỉ cần kiểm chi tiết lịch sử trong đó.
- Ứng dụng chạy trên trình duyệt, không cần cài đặt (người gửi phiếu kèm đường dẫn). Ứng dụng tự nhận là đứng ngang hàng giữa các phía. Người rà soát giúp giữ đúng điều ấy: chính xác, cân bằng, không bịa lời trích của người thật, số người chết ghi bằng khoảng có nguồn.

## Việc cần làm (khoảng một đến hai ngày)

1. Mở `bang-a-rui-ro-cao.csv` (213 dòng, xếp theo năm). Mọi dòng trong bảng đều cần xem (cột "Ưu tiên" đều là 1). Trong bảng có 37 dòng có số liệu, 10 lời trích, 96 dòng thuộc đề tài nhạy cảm, 35 góc nhìn VNCH & hải ngoại, 14 giả định "Nếu…", 60 câu mới viết gần đây được đánh dấu cần kiểm (cột "Cần kiểm" ghi điều cụ thể cần đối chiếu). Một dòng có thể thuộc nhiều nhóm.
2. Với mỗi dòng, điền:
   - **Ý kiến**: Đúng · Sửa · Bỏ · Thiếu nguồn · Còn tranh luận (khi giới sử học còn chia rẽ: ghi các cách đọc, ứng dụng sẽ nêu cả hai thay vì chọn một);
   - **Đề xuất sửa**: nguyên văn câu mới, nếu chọn Sửa;
   - **Nguồn của người rà soát**: sách, tập, trang, hay đường dẫn;
   - **Người rà soát, ngày**.
3. Không sửa cột "Mã" (để ghép phiếu với bản mã sau này). Các cột khác có thể ghi chú thêm.
4. Còn thời gian thì đọc tiếp các dòng hạng B trong `bang-day-du.csv` (lọc cột "Hạng").

Góc nhìn là lời tóm lược, không phải trích dẫn: chỉ cần xét câu có đúng và công bằng với phía ấy không. Ứng dụng sẽ không gắn tên sách nào vào một câu mà chưa ai đối chiếu với sách ấy.

## Các tệp

- `bang-a-rui-ro-cao.csv`: 213 dòng rủi ro cao.
- `bang-day-du.csv`: mọi câu có nội dung lịch sử, 1533 dòng: hạng A 213, hạng B 807 (phần lịch sử còn lại: sự kiện, điểm rẽ, nhân vật, câu đố, hồ sơ nguồn, cảnh trận, dữ kiện về các họ), hạng C 513 (phần hư cấu của Trò chơi).
- `nhay-cam.md`: các câu chạm đề tài nhạy cảm, xếp theo đề tài, nguyên văn; dành cả cho người rà soát lẫn luật sư.

Mở bằng Google Sheets (Tệp → Nhập → Tải lên) hay Excel (mở thẳng tệp: có BOM UTF-8 nên dấu tiếng Việt hiện đúng). Cột "Có giọng đọc" cho người làm ứng dụng biết câu nào phải thu lại giọng khi sửa; cột cuối "Vị trí trong mã" cũng chỉ dành cho người làm ứng dụng.

## Sau khi rà soát

Gửi lại tệp đã điền. Người làm ứng dụng sửa theo từng dòng, rồi xuất lại bộ phiếu để đối chiếu. Có ghi tên người rà soát trong ứng dụng hay không là việc hai bên thoả thuận; ứng dụng chỉ ghi "đã rà soát" khi việc ấy đã thật sự xong.
