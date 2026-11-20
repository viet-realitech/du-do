# Danh sách nhạy cảm · Dư Đồ

Sinh tự động bằng `npm run review:export` từ mã nguồn (chạy lại sau mỗi lần sửa nội dung). Mỗi đề tài liệt kê nguyên văn mọi câu chạm tới nó, ở cả phần lịch sử (hạng A, B) lẫn phần hư cấu của Trò chơi (hạng C), để người rà soát sử học và luật sư đọc vài trăm dòng thay vì toàn bộ ứng dụng. Mã dòng khớp cột "Mã" của `bang-day-du.csv`. Danh sách này không phải ý kiến pháp lý.

## Ngoài chữ: màu cờ, nhãn bản đồ

- Màu phe mặc định là màu cờ lịch sử (`pal: 'flag'`, src/state.ts:61): vùng của Quốc gia Việt Nam / VNCH tô nền vàng ba sọc đỏ (src/ui/bits.ts:30). Người chơi đổi được sang "mực nâu" trong Hồ sơ → Giao diện.
- Nhãn chủ quyền trên bản đồ chính: Biển Đông, Vịnh Bắc Bộ, Q.đ. Hoàng Sa, Q.đ. Trường Sa (src/map.ts:174); trên tấm bản đồ nhỏ ở màn chào (src/ui/plate.ts:25).
- Đường biên hiện nay lấy từ Natural Earth 1:50m (src/data/region-50m.json); không đa giác quốc gia nào của Natural Earth phủ lên Hoàng Sa hay Trường Sa.

## Cách mạng tháng Tám và việc bắt, giết người khác chính kiến (1945–1947) · 21 câu

Cần để ý: Ai bị bắt, bị giết, ngày, nơi, theo nguồn nào; điều còn tranh luận (ai ra lệnh, "được cho là") ghi rõ là còn tranh luận; giọng trung tính như với các vụ giết người của mọi phía.

| Mã | Hạng | Chỗ hiện | Nguyên văn |
|---|---|---|---|
| `ev:ng45:t` | B | Chương 4 · trang sự kiện · tiêu đề, ngày, nơi chốn | Đảo chính Nhật, nạn đói, Cách mạng tháng Tám · 9.3 – 2.9.1945 · Hà Nội · Huế |
| `ev:ng45:s` | A | Chương 4 · trang sự kiện › Diễn biến · câu đầu (cũng hiện ở thẻ dưới bản đồ, trong tour) | Nhật lật Pháp, dựng Đế quốc Việt Nam (Trần Trọng Kim). Nạn đói làm khoảng 1 – 2 triệu người chết, tuỳ nguồn. Tháng 8, Việt Minh giành chính quyền. |
| `ev:ng45:x` | A | Chương 4 · trang sự kiện › Diễn biến · đoạn thêm | Ngày 30.8 Bảo Đại thoái vị. Ngày 2.9, tại Ba Đình, Hồ Chí Minh đọc Tuyên ngôn Độc lập, khai sinh VN Dân chủ Cộng hoà. Ngày 23.9 Pháp nổ súng ở Sài Gòn. |
| `ev:ng45:v:vn` | A | Chương 4 · trang sự kiện › Góc nhìn · Sử học chính thống Việt Nam | Cách mạng giành chính quyền về tay nhân dân, mở ra kỷ nguyên độc lập. |
| `ev:ng45:v:vnch` | A | Chương 4 · trang sự kiện › Góc nhìn · Sử quan VNCH & hải ngoại | Việt Minh nắm khoảng trống quyền lực, sau đó loại bỏ các đảng phái quốc gia. |
| `ev:ng45:v:fr` | A | Chương 4 · trang sự kiện › Góc nhìn · Sử liệu Pháp | Không công nhận, quyết tâm tái lập chủ quyền. |
| `ev:ng45:v:us` | A | Chương 4 · trang sự kiện › Góc nhìn · Sử liệu Hoa Kỳ | Tình báo OSS có tiếp xúc với Việt Minh; Mỹ chưa công nhận nhà nước mới. |
| `ev:ng45:v:jp` | A | Chương 4 · trang sự kiện › Góc nhìn · Sử liệu Nhật Bản | Đảo chính 9.3 nhằm loại Pháp trước khi Đồng minh đổ bộ; trao ‘độc lập’ danh nghĩa cho Bảo Đại. |
| `ev:ng45:qt` | A | Chương 4 · trang sự kiện › Diễn biến · khối trích dẫn | “Tất cả mọi người đều sinh ra có quyền bình đẳng. Tạo hoá cho họ những quyền không ai có thể xâm phạm được…” — Tuyên ngôn Độc lập, 2.9.1945 |
| `ev:ng45:n:0` | A | Chương 4 · trang sự kiện › Diễn biến · bảng số liệu | Nạn đói 1944–45: ≈ 1–2 triệu người chết (tuỳ nguồn) |
| `fig:pq` | A | Nhân vật · Phạm Quỳnh | Phạm Quỳnh (1892–1945), Nhà báo, Thượng thư. Chủ bút Nam Phong tạp chí, chủ trương quân chủ lập hiến. Bị Việt Minh bắt và xử tử năm 1945. |
| `fig:ttt2` | A | Nhân vật · Tạ Thu Thâu | Tạ Thu Thâu (1906–1945), Lãnh tụ Đệ Tứ. Chủ trương báo La Lutte (1933), trúng cử Hội đồng Thành phố Sài Gòn (1937) và Hội đồng Quản hạt Nam Kỳ (1939), đày Côn Đảo đến năm 1944. Bị Việt Minh bắt và xử tử ở Quảng Ngãi tháng 9.1945. |
| `fig:bqc` | A | Nhân vật · Bùi Quang Chiêu | Bùi Quang Chiêu (1873–1945), Lãnh tụ Đảng Lập hiến. Kỹ sư canh nông, chủ báo La Tribune Indochinoise, sáng lập Đảng Lập hiến Đông Dương, Phó chủ tịch Hội đồng Quản hạt Nam Kỳ từ năm 1926. Bị Việt Minh bắt và xử tử tại Chợ Đệm ngày 29.9.1945. |
| `fig:hps` | A | Nhân vật · Huỳnh Phú Sổ | Huỳnh Phú Sổ (1920–1947), Người sáng lập Hoà Hảo. Khai đạo Phật giáo Hoà Hảo ở Châu Đốc năm 1939, lập Đảng Dân chủ Xã hội năm 1946. Mất tích ngày 16.4.1947 khi đi hoà giải xung đột Việt Minh – Hoà Hảo; được cho là bị Việt Minh giết. |
| `quiz:e4:0` | B | Câu đố chương 4 (sau sự kiện ng45) | Tuyên ngôn Độc lập được đọc vào ngày nào? Đáp án: 2.9.1945. Tại quảng trường Ba Đình, Hà Nội. |
| `move:ng45:0` | B | Bản đồ "Đảo chính Nhật, nạn đói, Cách mạng tháng Tám" · đường 1 (Việt Minh) | Giải phóng quân từ Tân Trào tiến về thị xã Thái Nguyên (16.8) |
| `move:ng45:1` | B | Bản đồ "Đảo chính Nhật, nạn đói, Cách mạng tháng Tám" · đường 2 (Việt Minh) | Quảng Nam cùng Bắc Giang, Hải Dương, Hà Tĩnh giành chính quyền sớm nhất (18.8) |
| `move:ng45:2` | B | Bản đồ "Đảo chính Nhật, nạn đói, Cách mạng tháng Tám" · đường 3 (Việt Minh) | Nhân dân nội, ngoại thành mít tinh ở Nhà hát Lớn, chiếm Phủ Khâm sai (19.8) |
| `move:ng45:3` | B | Bản đồ "Đảo chính Nhật, nạn đói, Cách mạng tháng Tám" · đường 4 (Việt Minh) | Nhân dân Huế và các huyện lân cận giành chính quyền; 30.8 Bảo Đại thoái vị (23.8) |
| `move:ng45:4` | B | Bản đồ "Đảo chính Nhật, nạn đói, Cách mạng tháng Tám" · đường 5 (Việt Minh) | Quần chúng Sài Gòn – Chợ Lớn và các tỉnh lân cận giành chính quyền (25.8) |
| `lore:ta` | A | Trò chơi · gia phả mở đầu, họ Tạ | Họ Tạ ít người nhưng có mặt từ Bắc vào Nam. Thế kỷ XX, Tạ Thu Thâu (Lấp Vò, Long Xuyên cũ), lãnh tụ nhóm Đệ Tứ ở Sài Gòn bị giết năm 1945, và Tạ Quang Bửu (Nghệ An), bộ trưởng của VNDCCH, đi hai ngả rất khác nhau. |

## Cải cách ruộng đất (1953–1956) · 21 câu

Cần để ý: Số người bị xử, cách gọi "sai lầm", "sửa sai"; không quy chụp tập thể.

| Mã | Hạng | Chỗ hiện | Nguyên văn |
|---|---|---|---|
| `ev:cc53:t` | B | Chương 5 · trang sự kiện · tiêu đề, ngày, nơi chốn | Cải cách ruộng đất ở miền Bắc · 1953–1956 · Đồng bằng Bắc Bộ |
| `ev:cc53:s` | A | Chương 5 · trang sự kiện › Diễn biến · câu đầu (cũng hiện ở thẻ dưới bản đồ, trong tour) | Ruộng đất được chia cho nông dân, kèm các toà án đấu tố địa chủ. |
| `ev:cc53:x` | A | Chương 5 · trang sự kiện › Diễn biến · đoạn thêm | Năm 1956, Đảng Lao động Việt Nam thừa nhận sai lầm, tiến hành sửa sai. Số người bị xử tử đến nay vẫn còn tranh luận. |
| `ev:cc53:v:vn` | A | Chương 5 · trang sự kiện › Góc nhìn · Sử học chính thống Việt Nam | Thực hiện ‘người cày có ruộng’; đã nghiêm khắc sửa sai. |
| `ev:cc53:v:vnch` | A | Chương 5 · trang sự kiện › Góc nhìn · Sử quan VNCH & hải ngoại | Một chiến dịch khủng bố ở nông thôn. |
| `ev:cc53:v:intl` | A | Chương 5 · trang sự kiện › Góc nhìn · Sử gia quốc tế | Ước tính số người chết dao động từ vài nghìn đến hàng chục nghìn. |
| `opt:bac:out` | B | Điểm rẽ 5 (1954) · "Con đường của bạn" sau khi chọn "Miền Bắc — VNDCCH" | Bạn tập kết ra Bắc hoặc ở lại Hà Nội. Cải cách ruộng đất, rồi đường Trường Sơn. |
| `ctx:gate:ca-nha-da-vao-nam-tu-nam-1955` | C | Điểm rẽ · "Gia đình bạn", bản theo quê hay theo biến cố đã quyết (Trò chơi) | Cả nhà đã vào Nam từ năm 1955, trước khi đội cải cách về làng; tháng Tư năm 1975, cha bạn lại đưa cả nhà lên tàu ra biển. Bạn lớn lên ở trại tị nạn, rồi ở một thành phố xa lạ. |
| `ctx:gate:ca-nha-da-vao-nam-tu-nam-1955-2` | C | Điểm rẽ · "Gia đình bạn", bản theo quê hay theo biến cố đã quyết (Trò chơi) | Cả nhà đã vào Nam từ năm 1955, trước khi đội cải cách về làng; hai mươi năm sau, chuyện cũ vẫn chỉ kể trong nhà. |
| `fig:tc` | B | Nhân vật · Trường Chinh | Trường Chinh (1907–1988), Tổng Bí thư. Tổng Bí thư 1941–1956, rời chức sau cải cách ruộng đất; tác giả Kháng chiến nhất định thắng lợi (1947). Chủ tịch Hội đồng Nhà nước 1981–1987, Tổng Bí thư lần hai năm 1986. Mất tại Hà Nội. |
| `card:cc53:0` | C | Trò chơi · thẻ "Cải cách ruộng đất ở miền Bắc" · lựa chọn 1 | Bị quy địa chủ: Dòng họ có ruộng nhiều hơn làng. → Mất ruộng, mất người. Năm sau được sửa sai, nhưng ruộng không về. |
| `card:cc53{special=x-diachu53}:2` | A | Trò chơi · thẻ "Cải cách ruộng đất ở miền Bắc" khi biến cố x-diachu53 · lựa chọn 3 | Giảm tô, thoái tô cho người cấy rẽ: Trước khi đội cải cách về, nông hội phát động giảm tô: nhà có ruộng cho cấy rẽ phải hạ tô và trả lại phần tô đã thu quá mức. → Tá điền nhận lại thóc, nông hội ghi tên nhà vào sổ. Nhưng nhà vẫn nhiều ruộng nhất làng, và đội cải cách sắp về. |
| `card:cc53{from=T2+NE+NW;regions=B}:2` | C | Trò chơi · thẻ "Cải cách ruộng đất ở miền Bắc" khi nhà đang ở vùng B; quê gốc T2, NE, NW · lựa chọn 3 | Đứng ngoài các buổi đấu tố: Đội cải cách về các làng quanh khu ở; nhà không có ruộng ở đây. → Cả nhà chỉ nghe kể về những buổi đấu tố ở làng bên, và học cách không hỏi thêm. |
| `x:x-diachu53` | C | Trò chơi · biến cố riêng "Đội cải cách sắp về làng" (gắn vào "Cải cách ruộng đất ở miền Bắc") | Đội cải cách sắp về làng. Dòng họ bạn vốn có nhiều ruộng và bạc hơn cả làng; đội cải cách sắp về, và ai cũng đoán được nhà nào sẽ bị quy địa chủ. |
| `x:x-diachu53:0` | C | Trò chơi · biến cố riêng "Đội cải cách sắp về làng" · lựa chọn 1 | Chia nhỏ ruộng, bán tháo trước: Sang tên cho con cháu, họ hàng; bán trâu, bán thóc. → Đội vẫn quy địa chủ, ghi thêm 'phân tán tài sản'. Mức xử: tịch thu và quản chế tại làng; không ai trong họ bị đưa ra toà án nhân dân đặc biệt. |
| `x:x-diachu53:1` | C | Trò chơi · biến cố riêng "Đội cải cách sắp về làng" · lựa chọn 2 | Ở lại, chịu đấu tố: Có người con đi bộ đội; mong được xếp 'địa chủ kháng chiến'. → Được xếp 'địa chủ kháng chiến' nhờ người con ở Điện Biên, nhưng nhà, ruộng, trâu vẫn bị tịch thu và một người già mất khi bị quản chế. Sửa sai 1956 trả danh dự, không trả ruộng. |
| `out:out-bac-hn` | C | Điểm rẽ 5 · kết cục của hướng "Miền Bắc — VNDCCH" cho nhà ở Hà Nội | Bạn ở lại Hà Nội, dưới chính quyền Việt Nam Dân chủ Cộng hoà. Cải cách ruộng đất, hợp tác xã, rồi đường Trường Sơn. |
| `out:out-bac-nd` | C | Điểm rẽ 5 · kết cục của hướng "Miền Bắc — VNDCCH" cho nhà ở Nam Định | Bạn ở lại Nam Định, dưới chính quyền Việt Nam Dân chủ Cộng hoà. Cải cách ruộng đất, hợp tác xã, rồi đường Trường Sơn. |
| `out:out-bac-na` | C | Điểm rẽ 5 · kết cục của hướng "Miền Bắc — VNDCCH" cho nhà ở Nghệ An | Bạn ở lại Nghệ An, dưới chính quyền Việt Nam Dân chủ Cộng hoà. Cải cách ruộng đất, hợp tác xã, rồi đường Trường Sơn. |
| `chr:bac` | C | Kết luận · phim hành trình và gia phả · dòng của hướng "Miền Bắc — VNDCCH" | Thế hệ 5 ở lại miền Bắc hoặc tập kết ra Bắc, qua cải cách ruộng đất; có người sau đó đi đường Trường Sơn. |
| `chr:chr-bac-n` | C | Phim hành trình · dòng gia phả của hướng "Miền Bắc — VNDCCH", quê Hà Nội | Thế hệ 5 ở lại miền Bắc, qua cải cách ruộng đất; có người sau đó đi đường Trường Sơn. |

## Mậu Thân 1968 và thảm sát Huế · 16 câu

Cần để ý: Khoảng số nạn nhân và nguồn của mỗi mức; ai chịu trách nhiệm theo các phía.

| Mã | Hạng | Chỗ hiện | Nguyên văn |
|---|---|---|---|
| `ev:ks68:v:vn` | B | Chương 5 · trang sự kiện › Góc nhìn · Sử học chính thống Việt Nam | Đòn nghi binh cho Tổng tấn công Tết Mậu Thân. |
| `ev:mt68:t` | B | Chương 5 · trang sự kiện · tiêu đề, ngày, nơi chốn | Tổng tấn công Tết Mậu Thân · 30.1.1968 · Huế · Sài Gòn |
| `ev:mt68:s` | A | Chương 5 · trang sự kiện › Diễn biến · câu đầu (cũng hiện ở thẻ dưới bản đồ, trong tour) | Đồng loạt tấn công hơn 100 đô thị. Huế bị chiếm gần một tháng. |
| `ev:mt68:x` | A | Chương 5 · trang sự kiện › Diễn biến · đoạn thêm | Tổn thất quân sự rất lớn cho phía tấn công; nhiều dân thường ở Huế bị giết hại. Dư luận Mỹ quay lưng với chiến tranh. |
| `ev:mt68:v:vn` | A | Chương 5 · trang sự kiện › Góc nhìn · Sử học chính thống Việt Nam | Bước ngoặt buộc Mỹ xuống thang, ngồi vào bàn đàm phán. |
| `ev:mt68:v:vnch` | A | Chương 5 · trang sự kiện › Góc nhìn · Sử quan VNCH & hải ngoại | Thắng lợi quân sự của QLVNCH; tưởng niệm thảm sát Huế. |
| `ev:mt68:v:us` | A | Chương 5 · trang sự kiện › Góc nhìn · Sử liệu Hoa Kỳ | Thắng về chiến trường, thua về chính trị; Johnson không tái tranh cử. |
| `ev:mt68:n:0` | A | Chương 5 · trang sự kiện › Diễn biến · bảng số liệu | Thảm sát Huế: ≈ 2.800 – 6.000 thường dân (tuỳ nguồn) |
| `fig:ww` | B | Nhân vật · William Westmoreland | William Westmoreland (1914–2005), Tướng Mỹ. Tư lệnh Bộ Chỉ huy Viện trợ Quân sự Mỹ tại Việt Nam (MACV) 1964–1968, chủ trương chiến thuật tìm và diệt. Sau Tết Mậu Thân 1968 làm Tham mưu trưởng Lục quân Mỹ đến năm 1972. |
| `quiz:e5:2` | B | Câu đố chương 5 (sau sự kiện mt68) | Tổng tấn công Tết Mậu Thân diễn ra năm nào? Đáp án: 1968. Đêm 30 rạng 31.1.1968, ở hơn 100 đô thị miền Nam; Huế bị chiếm gần một tháng. |
| `scene:mt68:0` | B | Cảnh trận "Tổng tấn công Tết Mậu Thân" · mũi tên 1 (QĐND Việt Nam) | Trung đoàn 6 đánh vào Thành nội, Mang Cá |
| `scene:mt68:1` | B | Cảnh trận "Tổng tấn công Tết Mậu Thân" · mũi tên 2 (QĐND Việt Nam) | Trung đoàn 4 đánh khu bờ nam sông Hương |
| `scene:mt68:2` | B | Cảnh trận "Tổng tấn công Tết Mậu Thân" · mũi tên 3 (Quân Giải phóng) | Quân Giải phóng đánh sân bay Tân Sơn Nhứt |
| `scene:mt68:3` | B | Cảnh trận "Tổng tấn công Tết Mậu Thân" · mũi tên 4 (Quân Giải phóng) | Tiến vào Chợ Lớn, trường đua Phú Thọ |
| `card:mt68{regions=B+T1}:0` | C | Trò chơi · thẻ "Tổng tấn công Tết Mậu Thân" khi nhà đang ở vùng B, T1 · lựa chọn 1 | Nghe tin Tết Mậu Thân qua đài: Đài Tiếng nói Việt Nam đọc tin chiến sự suốt những ngày Tết. → Cả xóm tụ quanh chiếc loa. Tin vui, tin dữ đến cùng một lúc. |
| `x:x-ho89` | A | Trò chơi · biến cố riêng "Người lính năm Mậu Thân" (gắn vào "Việt Nam rút quân khỏi Campuchia") | Người lính năm Mậu Thân. Tháng Giêng năm 1990, một người đàn ông chống nạng gõ cửa: năm Mậu Thân, ông là người lính bị thương được nhà bạn băng bó. Ông đã qua những năm học tập cải tạo, sắp cùng vợ con sang Mỹ theo diện H.O., và muốn ghé tạ ơn trước khi đi. |

## Thảm sát, giết hại thường dân · 16 câu

Cần để ý: Số nạn nhân (khoảng, có nguồn), ai gây ra, ai bị xét xử; mọi phía được viết cùng một mức chính xác, cùng một giọng (Xô Viết Nghệ Tĩnh, Mậu Thân ở Huế, Mỹ Lai, Ba Chúc).

| Mã | Hạng | Chỗ hiện | Nguyên văn |
|---|---|---|---|
| `ev:xv30:x` | A | Chương 3 · trang sự kiện › Diễn biến · đoạn thêm | Pháp đàn áp bằng máy bay và quân đội; hàng nghìn người bị bắt, bị giết. |
| `ev:mt68:x` | A | Chương 5 · trang sự kiện › Diễn biến · đoạn thêm | Tổn thất quân sự rất lớn cho phía tấn công; nhiều dân thường ở Huế bị giết hại. Dư luận Mỹ quay lưng với chiến tranh. |
| `ev:mt68:v:vnch` | A | Chương 5 · trang sự kiện › Góc nhìn · Sử quan VNCH & hải ngoại | Thắng lợi quân sự của QLVNCH; tưởng niệm thảm sát Huế. |
| `ev:mt68:n:0` | A | Chương 5 · trang sự kiện › Diễn biến · bảng số liệu | Thảm sát Huế: ≈ 2.800 – 6.000 thường dân (tuỳ nguồn) |
| `ev:ml68:t` | B | Chương 5 · trang sự kiện · tiêu đề, ngày, nơi chốn | Thảm sát Mỹ Lai · 16.3.1968 · Sơn Mỹ, Quảng Ngãi |
| `ev:ml68:s` | A | Chương 5 · trang sự kiện › Diễn biến · câu đầu (cũng hiện ở thẻ dưới bản đồ, trong tour) | Lính Mỹ thuộc đại đội Charlie giết hại hàng trăm thường dân, phần lớn là phụ nữ, trẻ em, người già. |
| `ev:ml68:x` | A | Chương 5 · trang sự kiện › Diễn biến · đoạn thêm | Vụ việc bị che giấu đến tháng 11.1969. Chỉ một sĩ quan bị kết án. |
| `ev:ml68:v:vn` | A | Chương 5 · trang sự kiện › Góc nhìn · Sử học chính thống Việt Nam | Tội ác chiến tranh điển hình. |
| `ev:ml68:v:us` | A | Chương 5 · trang sự kiện › Góc nhìn · Sử liệu Hoa Kỳ | Gây chấn động, thúc đẩy phong trào phản chiến. |
| `ev:ml68:v:intl` | A | Chương 5 · trang sự kiện › Góc nhìn · Sử gia quốc tế | Con số nạn nhân được ghi nhận là 504 người (theo đài tưởng niệm Sơn Mỹ). |
| `move:xv30:0` | B | Bản đồ "Xô viết Nghệ Tĩnh" · đường 1 (Nghĩa quân) | Nông dân Hưng Nguyên kéo về phủ lỵ rồi tiến về Vinh; máy bay Pháp ném bom đoàn biểu tình (12.9.1930) |
| `card:ml68:0` | C | Trò chơi · thẻ "Thảm sát Mỹ Lai" · lựa chọn 1 | Làm chứng về Sơn Mỹ: Kể cho nhà báo nước ngoài. → Lời kể được in ở Mỹ. Ở quê, không ai nhắc nữa. |
| `card:ml68{homes=hue+qn;regions=T2;scope=}:0` | C | Trò chơi · thẻ "Thảm sát Mỹ Lai" khi nhà đang ở vùng T2; quê hue, qn · lựa chọn 1 | Nghe người tị nạn kể chuyện Sơn Mỹ: Người từ Quảng Ngãi chạy ra kể những gì đã thấy. → Câu chuyện chỉ được kể trong nhà. Hơn một năm rưỡi sau, báo chí Mỹ mới đưa tin. |
| `card:cp79:1` | C | Trò chơi · thẻ "Chiến tranh biên giới Tây Nam" · lựa chọn 2 | Tản cư khỏi biên giới: Khmer Đỏ tàn sát Ba Chúc. → Về lại khi quân Việt Nam đã sang Phnom Penh. |
| `lore:tran` | B | Trò chơi · gia phả mở đầu, họ Trần | Ước tính khoảng 11% dân số (thống kê 2005), đứng thứ hai. Nhà Trần (1225–1400) ba lần đẩy lui quân Nguyên Mông; khi Hồ Quý Ly đoạt ngôi, tôn thất Trần bị truy sát, riêng vụ mưu sự năm 1399 hơn 370 người bị giết. |
| `lore:ta` | A | Trò chơi · gia phả mở đầu, họ Tạ | Họ Tạ ít người nhưng có mặt từ Bắc vào Nam. Thế kỷ XX, Tạ Thu Thâu (Lấp Vò, Long Xuyên cũ), lãnh tụ nhóm Đệ Tứ ở Sài Gòn bị giết năm 1945, và Tạ Quang Bửu (Nghệ An), bộ trưởng của VNDCCH, đi hai ngả rất khác nhau. |

## Học tập cải tạo sau 1975 · 11 câu

Cần để ý: Quy mô (số người, số năm), cách gọi; không giảm nhẹ, không cường điệu.

| Mã | Hạng | Chỗ hiện | Nguyên văn |
|---|---|---|---|
| `ev:tn76:t` | B | Chương 6 · trang sự kiện · tiêu đề, ngày, nơi chốn | Cộng hoà XHCN Việt Nam · 2.7.1976 · Hà Nội |
| `ev:tn76:s` | A | Chương 6 · trang sự kiện › Diễn biến · câu đầu (cũng hiện ở thẻ dưới bản đồ, trong tour) | Quốc hội khoá VI đặt tên nước mới. Sài Gòn đổi tên thành TP. Hồ Chí Minh. |
| `ev:tn76:x` | A | Chương 6 · trang sự kiện › Diễn biến · đoạn thêm | Hàng trăm nghìn sĩ quan, viên chức VNCH bị đưa đi "học tập cải tạo". |
| `ev:tn76:v:vn` | A | Chương 6 · trang sự kiện › Góc nhìn · Sử học chính thống Việt Nam | Hoàn thành thống nhất nhà nước. |
| `ev:tn76:v:vnch` | A | Chương 6 · trang sự kiện › Góc nhìn · Sử quan VNCH & hải ngoại | Thời kỳ cải tạo, mất mát của người miền Nam. |
| `ctx:e6:nam` | C | Điểm rẽ 6 (1976) · "Gia đình bạn" (đời trước chọn "Miền Nam — VNCH") | Cha bạn là cựu sĩ quan VNCH, vừa nhận giấy gọi trình diện "học tập cải tạo". |
| `card:xl75:1` | C | Trò chơi · thẻ "Trận Xuân Lộc" · lựa chọn 2 | Tiếp tế cho Sư đoàn 18: Nước, cơm, băng gạc. → Sau này bị hỏi về chuyện này trong trại cải tạo. |
| `card:sg75:1` | C | Trò chơi · thẻ "Sài Gòn — 30 tháng Tư" · lựa chọn 2 | Ở lại, trình diện: Người làm việc cho chế độ cũ đi học tập cải tạo. → Ba năm, năm năm, có người mười năm. Nhà thuộc diện "nguỵ quân nguỵ quyền". |
| `x:x-ngo63:0` | C | Trò chơi · biến cố riêng "Họ Ngô sau ngày 1 tháng 11" · lựa chọn 1 | Giữ họ, lên trình diện trả lời: Không có gì phải giấu; chịu xét hỏi vài lần. → Hai người bị gọi lên Tổng nha Cảnh sát, hỏi về Cần Lao và Phủ Cam. Không tìm ra gì, nhưng hồ sơ đã mở thì theo mãi đến hết thời Đệ nhị Cộng hoà. |
| `x:x-lylich78:0` | C | Trò chơi · biến cố riêng "Tờ khai lý lịch" · lựa chọn 1 | Khai đầy đủ, đúng sự thật: Không giấu gì; chấp nhận bị xếp diện. → Hồ sơ ghi 'gia đình có người đi cải tạo'. Đứa cháu thi đủ điểm vẫn không được gọi nhập học; phải nhiều năm sau mới có đứa thứ hai vào đại học. |
| `x:x-ho89` | A | Trò chơi · biến cố riêng "Người lính năm Mậu Thân" (gắn vào "Việt Nam rút quân khỏi Campuchia") | Người lính năm Mậu Thân. Tháng Giêng năm 1990, một người đàn ông chống nạng gõ cửa: năm Mậu Thân, ông là người lính bị thương được nhà bạn băng bó. Ông đã qua những năm học tập cải tạo, sắp cùng vợ con sang Mỹ theo diện H.O., và muốn ghé tạ ơn trước khi đi. |

## Nhân Văn – Giai Phẩm · 7 câu

Cần để ý: Ai bị kỷ luật, mức nào; cách gọi vụ việc.

| Mã | Hạng | Chỗ hiện | Nguyên văn |
|---|---|---|---|
| `ev:nv56:t` | B | Chương 5 · trang sự kiện · tiêu đề, ngày, nơi chốn | Vụ Nhân Văn – Giai Phẩm · 1955–1958 · Hà Nội |
| `ev:nv56:s` | A | Chương 5 · trang sự kiện › Diễn biến · câu đầu (cũng hiện ở thẻ dưới bản đồ, trong tour) | Một nhóm văn nghệ sĩ ra báo đòi tự do sáng tác và phê phán bộ máy. |
| `ev:nv56:x` | A | Chương 5 · trang sự kiện › Diễn biến · đoạn thêm | Báo bị đình bản, nhiều người bị kỷ luật hoặc bị cấm sáng tác lâu năm. Một số được phục hồi sau Đổi Mới. |
| `ev:nv56:v:vn` | A | Chương 5 · trang sự kiện › Góc nhìn · Sử học chính thống Việt Nam | Từng bị coi là hoạt động chống đối, sau được nhìn nhận lại. |
| `ev:nv56:v:vnch` | A | Chương 5 · trang sự kiện › Góc nhìn · Sử quan VNCH & hải ngoại | Được dẫn như bằng chứng về việc kiểm soát văn nghệ, tư tưởng ở miền Bắc. |
| `ev:nv56:v:intl` | A | Chương 5 · trang sự kiện › Góc nhìn · Sử gia quốc tế | Cuộc tranh luận về tự do sáng tác ở miền Bắc. |
| `card:nv56:0` | C | Trò chơi · thẻ "Vụ Nhân Văn – Giai Phẩm" · lựa chọn 1 | Mua và giữ các số báo Nhân Văn: Trong họ có người thích văn chương. → Báo giấu trong tủ ba mươi năm. |

## Di tản, thuyền nhân, nạn kiều, ra đi có trật tự · 64 câu

Cần để ý: Số người ra đi, số chết trên biển (khoảng, có nguồn); lý do ra đi theo các phía.

| Mã | Hạng | Chỗ hiện | Nguyên văn |
|---|---|---|---|
| `ev:lk71:v:vnch` | A | Chương 5 · trang sự kiện › Góc nhìn · Sử quan VNCH & hải ngoại | Cuộc hành quân vượt biên giới lớn nhất. |
| `ev:sg75:x` | B | Chương 5 · trang sự kiện › Diễn biến · đoạn thêm | Hàng chục nghìn người di tản trong những ngày cuối. Cộng hoà miền Nam Việt Nam tạm quản lý miền Nam. |
| `ev:ct78:t` | B | Chương 6 · trang sự kiện · tiêu đề, ngày, nơi chốn | Cải tạo công thương nghiệp · nạn kiều · 3.1978 · TP. Hồ Chí Minh |
| `ev:ct78:s` | A | Chương 6 · trang sự kiện › Diễn biến · câu đầu (cũng hiện ở thẻ dưới bản đồ, trong tour) | Chính quyền quốc hữu hoá cơ sở kinh doanh tư nhân ở miền Nam. |
| `ev:ct78:x` | A | Chương 6 · trang sự kiện › Diễn biến · đoạn thêm | Nhiều người Hoa rời Việt Nam. Quan hệ Việt – Trung xấu đi nhanh chóng. |
| `ev:ct78:v:vn` | A | Chương 6 · trang sự kiện › Góc nhìn · Sử học chính thống Việt Nam | Sau này thừa nhận là nóng vội, đã điều chỉnh. |
| `ev:ct78:v:cn` | A | Chương 6 · trang sự kiện › Góc nhìn · Quan điểm Trung Quốc | Cáo buộc Việt Nam ‘bài Hoa’. |
| `ev:tn80:t` | B | Chương 6 · trang sự kiện · tiêu đề, ngày, nơi chốn | Làn sóng thuyền nhân · 1975 – 1990s · Biển Đông |
| `ev:tn80:s` | A | Chương 6 · trang sự kiện › Diễn biến · câu đầu (cũng hiện ở thẻ dưới bản đồ, trong tour) | Hàng trăm nghìn người vượt biển. Số người thiệt mạng trên biển đến nay chưa thống kê chính xác. |
| `ev:tn80:x` | A | Chương 6 · trang sự kiện › Diễn biến · đoạn thêm | Năm 1979 và 1989, hai hội nghị quốc tế ở Genève tìm giải pháp; Chương trình Ra đi Có trật tự (ODP) mở ra. |
| `ev:tn80:v:vnch` | A | Chương 6 · trang sự kiện › Góc nhìn · Sử quan VNCH & hải ngoại | Khởi đầu của cộng đồng người Việt hải ngoại. |
| `ev:tn80:v:intl` | A | Chương 6 · trang sự kiện › Góc nhìn · Sử gia quốc tế | Một trong những cuộc khủng hoảng tị nạn lớn nhất hậu chiến. |
| `ev:tn80:v:vn` | A | Chương 6 · trang sự kiện › Góc nhìn · Sử học chính thống Việt Nam | Ngày nay nhìn nhận kiều bào là ‘bộ phận không tách rời của dân tộc’. |
| `ev:tn80:n:0` | A | Chương 6 · trang sự kiện › Diễn biến · bảng số liệu | Rời Việt Nam bằng đường biển: ≈ 800.000 người tới được nơi tị nạn (UNHCR) |
| `ev:tn80:n:1` | A | Chương 6 · trang sự kiện › Diễn biến · bảng số liệu | Chết trên biển: Ước tính hàng chục nghìn đến hơn 200.000, chưa thống kê được |
| `opt:radi:out` | B | Điểm rẽ 6 (1976) · "Con đường của bạn" sau khi chọn "Ra đi" | Bạn vượt biển, qua trại tị nạn, định cư ở Mỹ, Pháp, Úc. Sau 1995, bạn có thể quay về thăm quê. |
| `ctx:gate:ca-nha-da-vao-nam-tu-nam-1955` | C | Điểm rẽ · "Gia đình bạn", bản theo quê hay theo biến cố đã quyết (Trò chơi) | Cả nhà đã vào Nam từ năm 1955, trước khi đội cải cách về làng; tháng Tư năm 1975, cha bạn lại đưa cả nhà lên tàu ra biển. Bạn lớn lên ở trại tị nạn, rồi ở một thành phố xa lạ. |
| `ctx:gate:thang-tu-nam-ay-cha-ban-dua-ca` | C | Điểm rẽ · "Gia đình bạn", bản theo quê hay theo biến cố đã quyết (Trò chơi) | Tháng Tư năm ấy, cha bạn đưa cả nhà lên tàu ra biển; bạn lớn lên ở trại tị nạn, rồi ở một thành phố xa lạ. |
| `ctx:gate:cha-me-ban-tung-xuong-duong-doi-hoa` | C | Điểm rẽ · "Gia đình bạn", bản theo quê hay theo biến cố đã quyết (Trò chơi) | Cha mẹ bạn từng xuống đường đòi hoà bình; tháng Tư năm ấy, cả nhà vẫn lên tàu ra biển. Bạn lớn lên ở trại tị nạn, rồi ở một thành phố xa lạ. |
| `src:unhcr` | B | Sử liệu · hồ sơ "Hồ sơ người tị nạn Đông Dương" | Hồ sơ người tị nạn Đông Dương · Lưu trữ · UNHCR · 1975–1996 · Lưu trữ UNHCR, Genève · Tài liệu về trại tị nạn, Chương trình Ra đi Có trật tự và Kế hoạch Hành động Toàn diện (CPA). |
| `scene:nh40:0` | B | Cảnh trận "Nhật Bản tiến vào Đông Dương" · mũi tên 1 (Quân Nhật) | Sư đoàn 5 Nhật vượt biên giới gần Đồng Đăng, đêm 22.9 |
| `move:ct78:0` | B | Bản đồ "Cải tạo công thương nghiệp · nạn kiều" · đường 1 (Dân thường) | Người Hoa ở Hải Phòng, Quảng Ninh qua cửa khẩu Móng Cái sang Trung Quốc |
| `move:ct78:1` | B | Bản đồ "Cải tạo công thương nghiệp · nạn kiều" · đường 2 (Dân thường) | Người Hoa ở Hà Nội và các tỉnh phía Bắc qua cửa khẩu Hữu Nghị |
| `move:ct78:2` | B | Bản đồ "Cải tạo công thương nghiệp · nạn kiều" · đường 3 (Dân thường) | Người Hoa ở Chợ Lớn ra đi bằng thuyền (1978–79) |
| `move:tn80:0` | B | Bản đồ "Làn sóng thuyền nhân" · đường 1 (Dân thường) | Từ Rạch Giá, Cà Mau qua vịnh Thái Lan sang miền nam Thái Lan |
| `move:tn80:1` | B | Bản đồ "Làn sóng thuyền nhân" · đường 2 (Dân thường) | Từ đồng bằng sông Cửu Long ra cửa Hậu Giang, hướng Malaysia (đảo Bidong) |
| `move:tn80:2` | B | Bản đồ "Làn sóng thuyền nhân" · đường 3 (Dân thường) | Từ Mỹ Tho, Vũng Tàu xuôi nam tới Indonesia (Kuku, Galang) |
| `move:tn80:3` | B | Bản đồ "Làn sóng thuyền nhân" · đường 4 (Dân thường) | Từ Đà Nẵng và miền Trung vòng qua đông Hải Nam tới Hồng Kông |
| `move:tn80:4` | B | Bản đồ "Làn sóng thuyền nhân" · đường 5 (Dân thường) | Từ Hải Phòng, Quảng Ninh qua eo Quỳnh Châu, men bờ biển Trung Quốc tới Hồng Kông |
| `cf:radi` | A | Kết luận · thẻ "Nếu…" (nhãn "Giả định · không phải lịch sử") của hướng "Ra đi" | Nếu Việt Nam và Mỹ bình thường hoá quan hệ từ 1977–1978. Các cuộc đàm phán Việt – Mỹ năm 1977–1978 thành công thay vì bế tắc vì chuyện viện trợ, Campuchia và Trung Quốc. Cấm vận có thể được dỡ sớm hơn mười lăm năm, kiều hối và đường di cư hợp pháp mở sớm hơn, và có lẽ ít người phải liều mạng trên biển. Thực tế, khoảng 800.000 thuyền nhân Việt Nam đã tới các trại tị nạn trong hai thập niên sau năm 1975 (số của UNHCR), và không ai biết chính xác bao nhiêu người không tới. Căn cứ: Đàm phán Việt – Mỹ 1977–1978 có thật và từng tiến gần thoả thuận; Mỹ gác lại để ưu tiên quan hệ với Trung Quốc. Mức B: khoảng 20% (1 trên 5). |
| `card:ml68{homes=hue+qn;regions=T2;scope=}:0` | C | Trò chơi · thẻ "Thảm sát Mỹ Lai" khi nhà đang ở vùng T2; quê hue, qn · lựa chọn 1 | Nghe người tị nạn kể chuyện Sơn Mỹ: Người từ Quảng Ngãi chạy ra kể những gì đã thấy. → Câu chuyện chỉ được kể trong nhà. Hơn một năm rưỡi sau, báo chí Mỹ mới đưa tin. |
| `card:sg75:0` | C | Trò chơi · thẻ "Sài Gòn — 30 tháng Tư" · lựa chọn 1 | Di tản: Lên tàu, lên trực thăng, ra biển. → Guam, rồi California. Dòng họ bắt đầu lại từ số không, bằng tiếng Anh. |
| `card:tn76{flags=ditan+ly79Di+vuotbien+odp}:0` | C | Trò chơi · thẻ "Cộng hoà XHCN Việt Nam" khi dòng họ có cờ ditan, ly79Di, vuotbien, odp · lựa chọn 1 | Ở lại với hội thánh bảo trợ: Một hội thánh ở thị trấn nhỏ miền Trung Tây nước Mỹ đã bảo lãnh cả nhà ra khỏi trại tị nạn. → Hội thánh lo nhà, lo việc làm trong xưởng; cả nhà là người Việt duy nhất trong thị trấn. Mùa đông đầu tiên, tuyết ngập tới bậu cửa sổ. |
| `card:bb79{regions=T2+NE+NW;after=cp79=0}:1` | A | Trò chơi · thẻ "Chiến tranh biên giới phía Bắc" khi nhà đang ở vùng T2, NE, NW; sau cp79=0 · lựa chọn 2 | Nghe tin qua đài: Chiến sự ở tận biên giới phía Bắc; trong này giá gạo lên, phường rà soát người gốc Hoa. → Đầu tháng Ba, Trung Quốc tuyên bố rút quân. Ở phố, mấy nhà người Hoa quen đã bán nhà, lặng lẽ ra đi. |
| `card:bb79{regions=T2+NE+NW}:1` | A | Trò chơi · thẻ "Chiến tranh biên giới phía Bắc" khi nhà đang ở vùng T2, NE, NW · lựa chọn 2 | Nghe tin qua đài: Chiến sự ở tận biên giới phía Bắc; trong này giá gạo lên, phường rà soát người gốc Hoa. → Đầu tháng Ba, Trung Quốc tuyên bố rút quân. Ở phố, mấy nhà người Hoa quen đã bán nhà, lặng lẽ ra đi. |
| `card:tn80:0` | C | Trò chơi · thẻ "Làn sóng thuyền nhân" · lựa chọn 1 | Cả nhà vượt biên: Bán hết nhà cửa, mua chỗ cho cả nhà trên một chiếc ghe. → Ghe lênh đênh hai tuần mới tới trại tị nạn; có người trong nhà không tới bờ. Sau nhiều tháng ở trại, cả nhà được nhận đi định cư; lá thư đầu tiên gửi về cho họ hàng ở quê kèm tấm ảnh chụp trước căn nhà thuê. |
| `card:tn80{flags=ditan}:0` | C | Trò chơi · thẻ "Làn sóng thuyền nhân" khi dòng họ có cờ ditan · lựa chọn 1 | Bảo lãnh người thân theo diện đoàn tụ: Nộp hồ sơ theo Chương trình Ra đi có trật tự (ODP, từ 1979) cho ông bà, cô chú còn ở quê. → Hồ sơ đi qua hai chính phủ và nhiều năm chờ. Năm 1984, ông bà xuống sân bay với hai cái va li và một túi thuốc bắc. |
| `card:tn80{flags=ditan}:1` | C | Trò chơi · thẻ "Làn sóng thuyền nhân" khi dòng họ có cờ ditan · lựa chọn 2 | Gửi tiền đón em ở trại tị nạn: Người em út vượt biển tới Pulau Bidong; gửi tiền, gửi giấy bảo trợ vào trại. → Mười một tháng ở trại, em mới được nhận đi định cư. Ra đón ở sân bay, cả nhà suýt không nhận ra: gầy rộc, đen sạm, cười như người lớn. |
| `card:tn80{flags=ly79Di}:0` | A | Trò chơi · thẻ "Làn sóng thuyền nhân" khi dòng họ có cờ ly79Di · lựa chọn 1 | Bảo lãnh người thân còn ở quê: Vừa được nhận sang Canada; nộp giấy bảo lãnh ông bà, cô chú còn ở quê theo diện đoàn tụ (ODP, từ 1979). → Hồ sơ đi qua hai chính phủ và nhiều năm chờ. Năm 1986, ông bà xuống sân bay Toronto giữa mùa tuyết, tay ôm cuốn gia phả chép tay. |
| `card:tn80{after=x:x-lylich78=2}:1` | C | Trò chơi · thẻ "Làn sóng thuyền nhân" khi sau x:x-lylich78=2 · lựa chọn 2 | Ở lại, chờ thư: Sống bằng sổ gạo và những lá thư từ trại tị nạn. → Thư về đều đặn. Ở nhà vẫn xếp hàng mua gạo, nhưng biết người đi đã tới nơi. |
| `card:tn80{after=x:x-lylich78=2}:2` | C | Trò chơi · thẻ "Làn sóng thuyền nhân" khi sau x:x-lylich78=2 · lựa chọn 3 | Cả nhà làm đơn đi diện đoàn tụ: Người đi trước đã tới nơi, đứng ra bảo lãnh cả nhà theo Chương trình Ra đi có trật tự (ODP). → Hồ sơ đi qua nhiều văn phòng và mấy năm chờ phỏng vấn. Rồi cả nhà lên một chuyến bay rời Tân Sơn Nhất, không phải một chiếc ghe; từ đường để lại cho họ hàng trông nom. |
| `card:tn80{regions=B+T1}:0` | A | Trò chơi · thẻ "Làn sóng thuyền nhân" khi nhà đang ở vùng B, T1 · lựa chọn 1 | Cả nhà vượt biên: Bán hết nhà cửa, mua chỗ cho cả nhà trên một chiếc ghe đi Hồng Kông. → Ghe men theo bờ biển gần ba tuần mới tới Hồng Kông; có người trong nhà không tới nơi. Sau nhiều tháng ở trại, cả nhà được nhận đi định cư; lá thư đầu tiên gửi về cho họ hàng ở quê kèm tấm ảnh chụp trước căn nhà thuê. |
| `card:tn80{regions=NE+NW}:0` | A | Trò chơi · thẻ "Làn sóng thuyền nhân" khi nhà đang ở vùng NE, NW · lựa chọn 1 | Cả nhà vượt biên: Bán hết nhà cửa, mua chỗ cho cả nhà trên một chiếc ghe ra từ cửa biển miền Tây. → Ghe lênh đênh năm ngày mới dạt vào một hòn đảo của Indonesia, rồi cả nhà được đưa về trại Galang; có người trong nhà không tới bờ. Gần một năm ở trại, cả nhà được nhận đi định cư; lá thư đầu tiên gửi về cho họ hàng ở quê kèm tấm ảnh chụp trước căn nhà thuê. |
| `x:x-radi89:0` | C | Trò chơi · biến cố riêng "Người con về, cả nhà lên đường" · lựa chọn 1 | Làm đơn đi diện đoàn tụ: Nhờ người thân, người quen đã ở xứ người đứng ra bảo lãnh theo Chương trình Ra đi có trật tự (ODP). → Hồ sơ đi qua nhiều văn phòng và mấy năm chờ phỏng vấn. Đầu thập niên 1990, cả nhà, cả người con từng ở Campuchia, mới lên máy bay ra đi; từ đường để lại cho họ hàng trông nom. |
| `x:x-radi89:1` | C | Trò chơi · biến cố riêng "Người con về, cả nhà lên đường" · lựa chọn 2 | Xuống ghe như những người đi trước: Bán nhà, mua chỗ cho cả nhà trên một chiếc ghe ra từ cửa biển miền Tây. → Ghe tới trại đúng năm các nước bắt đầu thanh lọc người tới sau. Gần hai năm chờ xét hồ sơ, cả nhà được công nhận là người tị nạn và nhận đi định cư; nhiều gia đình cùng ghe thì phải hồi hương. |
| `x:x-ly79` | C | Trò chơi · biến cố riêng "Họ Lý, năm 1979" (gắn vào "Chiến tranh biên giới phía Bắc") | Họ Lý, năm 1979. Sau tiếng súng biên giới, phường rà soát người gốc Hoa; họ Lý của bạn bị gọi lên hỏi gốc gác, dù gia phả chép tổ tiên là người Việt đã nhiều đời. |
| `x:x-ly79:1` | C | Trò chơi · biến cố riêng "Họ Lý, năm 1979" · lựa chọn 2 | Cả nhà đi 'bán chính thức' như người Hoa: Nộp vàng theo chuyến cho cả nhà, bán nhà, xuống ghe ra Hồng Kông. → Mỗi đầu người gần mười lượng vàng. Ghe tới Hồng Kông sau chín ngày; cả nhà vào trại, chờ phái đoàn các nước gọi tên. |
| `chr:radi` | C | Kết luận · phim hành trình và gia phả · dòng của hướng "Ra đi" | Thế hệ 6 vượt biển, qua trại tị nạn rồi định cư ở Mỹ, Pháp, Úc. |
| `chr:chr-g-baocap-ly79di` | C | Phim hành trình · dòng gia phả của hướng "Giữ kế hoạch hoá", chọn ở trong nước rồi cả nhà ra đi (ly79Di) | Thế hệ 6 sống bằng sổ gạo, tem phiếu những năm đầu sau thống nhất; năm 1979, cả nhà nộp vàng đi “bán chính thức”, tới trại ở Hồng Kông rồi định cư ở Toronto. |
| `chr:chr-g-baocap-vuotbien` | C | Phim hành trình · dòng gia phả của hướng "Giữ kế hoạch hoá", chọn ở trong nước rồi cả nhà ra đi (vuotbien) | Thế hệ 6 sống bằng sổ gạo, tem phiếu những năm đầu sau thống nhất; năm 1980, cả nhà bán hết, xuống ghe vượt biển, qua trại tị nạn rồi định cư ở xứ người. |
| `chr:chr-g-baocap-vuotbien-lylichdi` | C | Phim hành trình · dòng gia phả của hướng "Giữ kế hoạch hoá", chọn ở trong nước rồi cả nhà ra đi (vuotbien, lylichDi) | Thế hệ 6 sống bằng sổ gạo, tem phiếu những năm đầu sau thống nhất; năm 1980, cả nhà còn lại theo đường người đi trước xuống ghe, qua trại tị nạn rồi định cư ở xứ người. |
| `chr:chr-g-baocap-odp` | C | Phim hành trình · dòng gia phả của hướng "Giữ kế hoạch hoá", chọn ở trong nước rồi cả nhà ra đi (odp) | Thế hệ 6 sống bằng sổ gạo, tem phiếu những năm đầu sau thống nhất; đầu thập niên 1980, cả nhà theo diện đoàn tụ của Chương trình Ra đi có trật tự, bay sang với người thân đã đi trước. |
| `chr:chr-g-baocap-odp-lylichdi` | C | Phim hành trình · dòng gia phả của hướng "Giữ kế hoạch hoá", chọn ở trong nước rồi cả nhà ra đi (odp, lylichDi) | Thế hệ 6 sống bằng sổ gạo, tem phiếu những năm đầu sau thống nhất; đầu thập niên 1980, cả nhà theo diện đoàn tụ của Chương trình Ra đi có trật tự, bay sang với nhánh đã xuống ghe năm 1978. |
| `chr:chr-g-doimoi-ly79di` | C | Phim hành trình · dòng gia phả của hướng "Đổi Mới", chọn ở trong nước rồi cả nhà ra đi (ly79Di) | Thế hệ 6 chờ ngày được làm ăn tự do, nhưng Đổi Mới còn xa; năm 1979, cả nhà nộp vàng đi “bán chính thức”, tới trại ở Hồng Kông rồi định cư ở Toronto. |
| `chr:chr-g-doimoi-vuotbien` | C | Phim hành trình · dòng gia phả của hướng "Đổi Mới", chọn ở trong nước rồi cả nhà ra đi (vuotbien) | Thế hệ 6 chờ ngày được làm ăn tự do, nhưng Đổi Mới còn xa; năm 1980, cả nhà bán hết, xuống ghe vượt biển, qua trại tị nạn rồi định cư ở xứ người. |
| `chr:chr-g-doimoi-vuotbien-lylichdi` | C | Phim hành trình · dòng gia phả của hướng "Đổi Mới", chọn ở trong nước rồi cả nhà ra đi (vuotbien, lylichDi) | Thế hệ 6 chờ ngày được làm ăn tự do, nhưng Đổi Mới còn xa; năm 1980, cả nhà còn lại theo đường người đi trước xuống ghe, qua trại tị nạn rồi định cư ở xứ người. |
| `chr:chr-g-doimoi-odp` | C | Phim hành trình · dòng gia phả của hướng "Đổi Mới", chọn ở trong nước rồi cả nhà ra đi (odp) | Thế hệ 6 chờ ngày được làm ăn tự do, nhưng Đổi Mới còn xa; đầu thập niên 1980, cả nhà theo diện đoàn tụ của Chương trình Ra đi có trật tự, bay sang với người thân đã đi trước. |
| `chr:chr-g-doimoi-odp-lylichdi` | C | Phim hành trình · dòng gia phả của hướng "Đổi Mới", chọn ở trong nước rồi cả nhà ra đi (odp, lylichDi) | Thế hệ 6 chờ ngày được làm ăn tự do, nhưng Đổi Mới còn xa; đầu thập niên 1980, cả nhà theo diện đoàn tụ của Chương trình Ra đi có trật tự, bay sang với nhánh đã xuống ghe năm 1978. |
| `chr:chr-g-radi-ly79di` | C | Phim hành trình · dòng gia phả của hướng "Ra đi", chọn ở trong nước rồi cả nhà ra đi (ly79Di) | Thế hệ 6 chọn ra đi: năm 1979, cả nhà nộp vàng đi “bán chính thức”, tới trại ở Hồng Kông rồi định cư ở Toronto. |
| `chr:chr-g-radi-vuotbien` | C | Phim hành trình · dòng gia phả của hướng "Ra đi", chọn ở trong nước rồi cả nhà ra đi (vuotbien) | Thế hệ 6 chọn ra đi: năm 1980, cả nhà bán hết, xuống ghe vượt biển, qua trại tị nạn rồi định cư ở xứ người. |
| `chr:chr-g-radi-vuotbien-lylichdi` | C | Phim hành trình · dòng gia phả của hướng "Ra đi", chọn ở trong nước rồi cả nhà ra đi (vuotbien, lylichDi) | Thế hệ 6 chọn ra đi: năm 1980, cả nhà còn lại theo đường người đi trước xuống ghe, qua trại tị nạn rồi định cư ở xứ người. |
| `chr:chr-g-radi-odp` | C | Phim hành trình · dòng gia phả của hướng "Ra đi", chọn ở trong nước rồi cả nhà ra đi (odp) | Thế hệ 6 chọn ra đi: đầu thập niên 1980, cả nhà theo diện đoàn tụ của Chương trình Ra đi có trật tự, bay sang với người thân đã đi trước. |
| `chr:chr-g-radi-odp-lylichdi` | C | Phim hành trình · dòng gia phả của hướng "Ra đi", chọn ở trong nước rồi cả nhà ra đi (odp, lylichDi) | Thế hệ 6 chọn ra đi: đầu thập niên 1980, cả nhà theo diện đoàn tụ của Chương trình Ra đi có trật tự, bay sang với nhánh đã xuống ghe năm 1978. |
| `epi:lam` | B | Kết luận · lời khép theo họ Lâm | Lâm là họ của nhiều người gốc Hoa (chữ 林) và nhiều người Khmer Nam Bộ, cùng các họ Thạch, Sơn, Danh, Kim mà sử liệu chưa rõ gốc tích. |

## Chiến tranh 1979: biên giới Tây Nam, biên giới phía Bắc, Vị Xuyên · 40 câu

Cần để ý: Thương vong hai phía (khoảng, có nguồn); cách gọi cuộc chiến theo từng phía.

| Mã | Hạng | Chỗ hiện | Nguyên văn |
|---|---|---|---|
| `ev:cm75:s` | B | Chương 5 · trang sự kiện › Diễn biến · câu đầu (cũng hiện ở thẻ dưới bản đồ, trong tour) | Khmer Đỏ chiếm Phnom Penh (17.4); Lào thành lập CHDCND Lào (2.12). |
| `ev:cm75:x` | A | Chương 5 · trang sự kiện › Diễn biến · đoạn thêm | Khmer Đỏ đuổi dân khỏi thành phố. Ước tính 1,5–2 triệu người Campuchia chết dưới chế độ này. |
| `ev:cp79:t` | B | Chương 6 · trang sự kiện · tiêu đề, ngày, nơi chốn | Chiến tranh biên giới Tây Nam · 7.1.1979 · Phnom Penh |
| `ev:cp79:s` | A | Chương 6 · trang sự kiện › Diễn biến · câu đầu (cũng hiện ở thẻ dưới bản đồ, trong tour) | Sau các cuộc tấn công của Khmer Đỏ, quân đội Việt Nam tiến vào Phnom Penh, lật đổ chế độ Pol Pot. |
| `ev:cp79:x` | A | Chương 6 · trang sự kiện › Diễn biến · đoạn thêm | Việt Nam đóng quân ở Campuchia tới năm 1989, chịu cấm vận quốc tế. |
| `ev:cp79:v:vn` | A | Chương 6 · trang sự kiện › Góc nhìn · Sử học chính thống Việt Nam | Cứu dân tộc Campuchia khỏi diệt chủng. |
| `ev:cp79:v:cn` | A | Chương 6 · trang sự kiện › Góc nhìn · Quan điểm Trung Quốc | Coi là ‘xâm lược’, lấy cớ tấn công. |
| `ev:cp79:v:intl` | A | Chương 6 · trang sự kiện › Góc nhìn · Sử gia quốc tế | Phương Tây và ASEAN lúc đó lên án, sau này nhìn nhận lại. |
| `ev:cp79:v:kh` | A | Chương 6 · trang sự kiện › Góc nhìn · Quan điểm Campuchia | Chính quyền mới ở Phnom Penh gọi 7.1 là ‘ngày giải phóng’; Khmer Đỏ và các phe kháng chiến gọi là ‘chiếm đóng’. |
| `ev:cp79:v:su` | A | Chương 6 · trang sự kiện › Góc nhìn · Sử liệu Liên Xô | Ủng hộ Việt Nam theo Hiệp ước Hữu nghị Việt – Xô (11.1978). |
| `ev:bb79:t` | B | Chương 6 · trang sự kiện · tiêu đề, ngày, nơi chốn | Chiến tranh biên giới phía Bắc · 17.2.1979 · Lạng Sơn · Cao Bằng · Lào Cai |
| `ev:bb79:s` | A | Chương 6 · trang sự kiện › Diễn biến · câu đầu (cũng hiện ở thẻ dưới bản đồ, trong tour) | Trung Quốc tấn công sáu tỉnh biên giới, rút quân sau khoảng một tháng. |
| `ev:bb79:x` | A | Chương 6 · trang sự kiện › Diễn biến · đoạn thêm | Xung đột kéo dài ở Vị Xuyên (Hà Giang) suốt thập niên 1980. |
| `ev:bb79:v:vn` | A | Chương 6 · trang sự kiện › Góc nhìn · Sử học chính thống Việt Nam | Cuộc chiến bảo vệ biên giới phía Bắc. |
| `ev:bb79:v:cn` | A | Chương 6 · trang sự kiện › Góc nhìn · Quan điểm Trung Quốc | ‘Phản kích tự vệ’. |
| `ev:bb79:v:su` | A | Chương 6 · trang sự kiện › Góc nhìn · Sử liệu Liên Xô | Lên án Trung Quốc, đưa tàu chiến tới gần nhưng không can thiệp trực tiếp. |
| `ev:bb79:n:0` | A | Chương 6 · trang sự kiện › Diễn biến · bảng số liệu | Thương vong: Hai bên công bố khác nhau, ước tính hàng chục nghìn mỗi phía |
| `ev:vx84:t` | B | Chương 6 · trang sự kiện · tiêu đề, ngày, nơi chốn | Mặt trận Vị Xuyên · 1984–1989 · Vị Xuyên, Hà Giang |
| `ev:vx84:s` | A | Chương 6 · trang sự kiện › Diễn biến · câu đầu (cũng hiện ở thẻ dưới bản đồ, trong tour) | Giao tranh dai dẳng quanh các điểm cao biên giới, ác liệt nhất là tháng 7.1984. |
| `ev:vx84:x` | A | Chương 6 · trang sự kiện › Diễn biến · đoạn thêm | Hàng nghìn người lính hi sinh; nhiều hài cốt đến nay chưa tìm thấy. |
| `ev:vx84:v:vn` | A | Chương 6 · trang sự kiện › Góc nhìn · Sử học chính thống Việt Nam | Cuộc chiến bảo vệ biên giới bị lãng quên lâu năm. |
| `ev:vx84:v:cn` | A | Chương 6 · trang sự kiện › Góc nhìn · Quan điểm Trung Quốc | Gọi là trận ‘Lão Sơn’. |
| `scene:cp79:0` | B | Cảnh trận "Chiến tranh biên giới Tây Nam" · mũi tên 1 (QĐND Việt Nam) | Quân đoàn 4 theo đường 1 qua Neak Luong |
| `scene:cp79:1` | B | Cảnh trận "Chiến tranh biên giới Tây Nam" · mũi tên 2 (QĐND Việt Nam) | Quân đoàn 3 vượt Mê Kông ở Kampong Cham |
| `scene:cp79:2` | B | Cảnh trận "Chiến tranh biên giới Tây Nam" · mũi tên 3 (QĐND Việt Nam) | Quân khu 9, Quân đoàn 2 theo đường 2 qua Takeo |
| `scene:bb79:0` | B | Cảnh trận "Chiến tranh biên giới phía Bắc" · mũi tên 1 (Quân Trung Quốc) | Quân đoàn 43, 54, 55 qua Đồng Đăng đánh Lạng Sơn |
| `scene:bb79:1` | B | Cảnh trận "Chiến tranh biên giới phía Bắc" · mũi tên 2 (Quân Trung Quốc) | Cánh bắc qua Trà Lĩnh đánh Cao Bằng |
| `scene:bb79:2` | B | Cảnh trận "Chiến tranh biên giới phía Bắc" · mũi tên 3 (Quân Trung Quốc) | Cánh đông từ Thủy Khẩu qua Tà Lùng |
| `scene:bb79:3` | B | Cảnh trận "Chiến tranh biên giới phía Bắc" · mũi tên 4 (Quân Trung Quốc) | Quân đoàn 13, 14 qua Hà Khẩu đánh Lào Cai |
| `scene:vx84:0` | B | Cảnh trận "Mặt trận Vị Xuyên" · mũi tên 1 (Quân Trung Quốc) | Sư đoàn 40 (Quân đoàn 14 TQ) chiếm các điểm cao 1509, 772 |
| `scene:vx84:1` | B | Cảnh trận "Mặt trận Vị Xuyên" · mũi tên 2 (Quân Trung Quốc) | Quân Trung Quốc từ Thiên Bảo chiếm điểm cao 1030 bờ đông sông Lô |
| `scene:vx84:2` | B | Cảnh trận "Mặt trận Vị Xuyên" · mũi tên 3 (QĐND Việt Nam) | Sư đoàn 356, 316 phản công 772, 685, 233 (12.7.1984) |
| `scene:vx84:3` | B | Cảnh trận "Mặt trận Vị Xuyên" · mũi tên 4 (QĐND Việt Nam) | Trung đoàn 141 (Sư đoàn 312) đánh điểm cao 1030 |
| `card:cm75:0` | C | Trò chơi · thẻ "Đông Dương đổi chế độ" · lựa chọn 1 | Đưa thân nhân từ Campuchia về: Hoa kiều, Việt kiều chạy Khmer Đỏ. → Thêm năm miệng ăn, thêm năm người sống. |
| `card:cp79:1` | C | Trò chơi · thẻ "Chiến tranh biên giới Tây Nam" · lựa chọn 2 | Tản cư khỏi biên giới: Khmer Đỏ tàn sát Ba Chúc. → Về lại khi quân Việt Nam đã sang Phnom Penh. |
| `card:bb79{regions=T2+NE+NW;after=cp79=0}:0` | A | Trò chơi · thẻ "Chiến tranh biên giới phía Bắc" khi nhà đang ở vùng T2, NE, NW; sau cp79=0 · lựa chọn 1 | Khai tên con theo lệnh tổng động viên: Lệnh tổng động viên ngày 5.3.1979; một người con đã ở mặt trận Campuchia, nay phường, xã lập danh sách cả những người em trong tuổi lính. → Tên người em vào danh sách chờ gọi. Cùng ngày ấy, Trung Quốc tuyên bố rút quân; giấy gọi chưa về, còn thư người anh từ Campuchia thì thưa dần. |
| `card:bb79{regions=T2+NE+NW;after=cp79=0}:1` | A | Trò chơi · thẻ "Chiến tranh biên giới phía Bắc" khi nhà đang ở vùng T2, NE, NW; sau cp79=0 · lựa chọn 2 | Nghe tin qua đài: Chiến sự ở tận biên giới phía Bắc; trong này giá gạo lên, phường rà soát người gốc Hoa. → Đầu tháng Ba, Trung Quốc tuyên bố rút quân. Ở phố, mấy nhà người Hoa quen đã bán nhà, lặng lẽ ra đi. |
| `card:bb79{regions=T2+NE+NW}:0` | A | Trò chơi · thẻ "Chiến tranh biên giới phía Bắc" khi nhà đang ở vùng T2, NE, NW · lựa chọn 1 | Khai tên con theo lệnh tổng động viên: Lệnh tổng động viên ngày 5.3.1979; phường, xã lập danh sách thanh niên trong tuổi lính. → Tên người con vào danh sách chờ gọi. Cùng ngày ấy, Trung Quốc tuyên bố rút quân; giấy gọi chưa về, nhưng nhà nào có con trai lớn cũng thấp thỏm. |
| `card:bb79{regions=T2+NE+NW}:1` | A | Trò chơi · thẻ "Chiến tranh biên giới phía Bắc" khi nhà đang ở vùng T2, NE, NW · lựa chọn 2 | Nghe tin qua đài: Chiến sự ở tận biên giới phía Bắc; trong này giá gạo lên, phường rà soát người gốc Hoa. → Đầu tháng Ba, Trung Quốc tuyên bố rút quân. Ở phố, mấy nhà người Hoa quen đã bán nhà, lặng lẽ ra đi. |
| `card:vx84:0` | C | Trò chơi · thẻ "Mặt trận Vị Xuyên" · lựa chọn 1 | Đi lính Vị Xuyên: Người con nhập ngũ lên Hà Giang. → Những ngày tháng 7 năm 1984 không có trong sách giáo khoa, chỉ có trong trí nhớ dòng họ. |

## Chủ quyền biển đảo và biên giới · 61 câu

Cần để ý: Tên gọi, ngày, số người chết; lập trường chủ quyền của Việt Nam được nêu đúng; quan điểm Trung Quốc chỉ là lời tóm lược.

| Mã | Hạng | Chỗ hiện | Nguyên văn |
|---|---|---|---|
| `ev:ng45:v:fr` | A | Chương 4 · trang sự kiện › Góc nhìn · Sử liệu Pháp | Không công nhận, quyết tâm tái lập chủ quyền. |
| `ev:vb64:t` | B | Chương 5 · trang sự kiện · tiêu đề, ngày, nơi chốn | Sự kiện Vịnh Bắc Bộ · 2–4.8.1964 · Vịnh Bắc Bộ |
| `ev:vb64:x` | B | Chương 5 · trang sự kiện › Diễn biến · đoạn thêm | Quốc hội Mỹ thông qua Nghị quyết Vịnh Bắc Bộ. Tài liệu giải mật năm 2005 cho thấy vụ thứ hai gần như chắc chắn đã không xảy ra. |
| `ev:dn65:s` | B | Chương 5 · trang sự kiện › Diễn biến · câu đầu (cũng hiện ở thẻ dưới bản đồ, trong tour) | Sau sự kiện Vịnh Bắc Bộ (1964), Mỹ đưa quân chiến đấu vào và ném bom miền Bắc. |
| `ev:pr73:qt` | A | Chương 5 · trang sự kiện › Diễn biến · khối trích dẫn | “Hoa Kỳ và các nước khác tôn trọng độc lập, chủ quyền, thống nhất, toàn vẹn lãnh thổ của nước Việt Nam như Hiệp định Giơnevơ năm 1954 về Việt Nam đã công nhận.” — Hiệp định Paris, Điều 1 |
| `ev:hs74:t` | B | Chương 5 · trang sự kiện · tiêu đề, ngày, nơi chốn | Hải chiến Hoàng Sa · 19.1.1974 · Quần đảo Hoàng Sa |
| `ev:hs74:s` | A | Chương 5 · trang sự kiện › Diễn biến · câu đầu (cũng hiện ở thẻ dưới bản đồ, trong tour) | Hải quân VNCH giao chiến với hải quân Trung Quốc. 74 quân nhân VNCH hi sinh; Trung Quốc chiếm toàn bộ Hoàng Sa. |
| `ev:hs74:x` | A | Chương 5 · trang sự kiện › Diễn biến · đoạn thêm | Việt Nam đến nay vẫn khẳng định chủ quyền đối với Hoàng Sa. |
| `ev:hs74:v:vnch` | A | Chương 5 · trang sự kiện › Góc nhìn · Sử quan VNCH & hải ngoại | Cuộc chiến bảo vệ chủ quyền; tưởng niệm 74 tử sĩ. |
| `ev:hs74:v:vn` | A | Chương 5 · trang sự kiện › Góc nhìn · Sử học chính thống Việt Nam | Ngày nay ghi nhận là cuộc chiến bảo vệ chủ quyền. |
| `ev:hs74:v:cn` | A | Chương 5 · trang sự kiện › Góc nhìn · Quan điểm Trung Quốc | Gọi là ‘phản kích tự vệ’ ở ‘Tây Sa’. |
| `ev:hs74:n:0` | A | Chương 5 · trang sự kiện › Diễn biến · bảng số liệu | QL VNCH: 74 tử trận |
| `ev:hs74:n:1` | A | Chương 5 · trang sự kiện › Diễn biến · bảng số liệu | Trung Quốc: 18 tử trận (nguồn TQ) |
| `ev:tn80:t` | B | Chương 6 · trang sự kiện · tiêu đề, ngày, nơi chốn | Làn sóng thuyền nhân · 1975 – 1990s · Biển Đông |
| `ev:gm88:t` | B | Chương 6 · trang sự kiện · tiêu đề, ngày, nơi chốn | Gạc Ma · 14.3.1988 · Quần đảo Trường Sa |
| `ev:gm88:s` | A | Chương 6 · trang sự kiện › Diễn biến · câu đầu (cũng hiện ở thẻ dưới bản đồ, trong tour) | Hải quân Trung Quốc tấn công; 64 chiến sĩ Việt Nam hi sinh. |
| `ev:gm88:x` | A | Chương 6 · trang sự kiện › Diễn biến · đoạn thêm | Trung Quốc chiếm Gạc Ma và một số bãi đá. Việt Nam giữ các đảo còn lại. |
| `ev:gm88:v:vn` | A | Chương 6 · trang sự kiện › Góc nhìn · Sử học chính thống Việt Nam | Tưởng niệm 64 liệt sĩ bảo vệ chủ quyền. |
| `ev:gm88:v:cn` | A | Chương 6 · trang sự kiện › Góc nhìn · Quan điểm Trung Quốc | Gọi là ‘xung đột Xích Qua’. |
| `ev:gm88:n:0` | A | Chương 6 · trang sự kiện › Diễn biến · bảng số liệu | Hải quân Việt Nam: 64 tử trận |
| `ev:bg99:t` | B | Chương 6 · trang sự kiện · tiêu đề, ngày, nơi chốn | Hiệp ước biên giới trên đất liền Việt – Trung · 30.12.1999 · Hữu Nghị, Lạng Sơn |
| `ev:bg99:s` | A | Chương 6 · trang sự kiện › Diễn biến · câu đầu (cũng hiện ở thẻ dưới bản đồ, trong tour) | Phân định đường biên giới dài khoảng 1.400 km. Cắm mốc hoàn thành năm 2008. |
| `ev:bg99:x` | A | Chương 6 · trang sự kiện › Diễn biến · đoạn thêm | Năm 2000 ký tiếp hiệp định phân định Vịnh Bắc Bộ. |
| `ev:bg99:v:vn` | A | Chương 6 · trang sự kiện › Góc nhìn · Sử học chính thống Việt Nam | Xây dựng đường biên giới hoà bình, hữu nghị. |
| `ev:bg99:v:intl` | A | Chương 6 · trang sự kiện › Góc nhìn · Sử gia quốc tế | Giải quyết dứt điểm tranh chấp trên bộ. |
| `ev:vbb00:t` | A | Chương 6 · trang sự kiện · tiêu đề, ngày, nơi chốn | Phân định Vịnh Bắc Bộ · 25.12.2000 · Vịnh Bắc Bộ |
| `ev:vbb00:s` | A | Chương 6 · trang sự kiện › Diễn biến · câu đầu (cũng hiện ở thẻ dưới bản đồ, trong tour) | Hai nước ký hiệp định phân định lãnh hải, vùng đặc quyền kinh tế trong Vịnh Bắc Bộ. |
| `ev:vbb00:x` | A | Chương 6 · trang sự kiện › Diễn biến · đoạn thêm | Việt Nam được khoảng 53% diện tích vịnh. |
| `ev:vbb00:v:vn` | A | Chương 6 · trang sự kiện › Góc nhìn · Sử học chính thống Việt Nam | Thành công trong giải quyết tranh chấp bằng thương lượng. |
| `ev:vbb00:v:intl` | A | Chương 6 · trang sự kiện › Góc nhìn · Sử gia quốc tế | Thường được dẫn làm ví dụ hai nước láng giềng phân định biển bằng đàm phán, theo các nguyên tắc của UNCLOS. |
| `ev:hd14:t` | A | Chương 6 · trang sự kiện · tiêu đề, ngày, nơi chốn | Giàn khoan Hải Dương 981 · 5–7.2014 · Gần quần đảo Hoàng Sa |
| `ev:hd14:s` | A | Chương 6 · trang sự kiện › Diễn biến · câu đầu (cũng hiện ở thẻ dưới bản đồ, trong tour) | Trung Quốc hạ đặt giàn khoan trong vùng đặc quyền kinh tế mà Việt Nam tuyên bố. |
| `ev:hd14:x` | A | Chương 6 · trang sự kiện › Diễn biến · đoạn thêm | Tàu hai bên đối đầu hơn hai tháng; ở Việt Nam bùng nổ biểu tình. |
| `ev:hd14:v:vn` | A | Chương 6 · trang sự kiện › Góc nhìn · Sử học chính thống Việt Nam | Vi phạm chủ quyền, quyền chủ quyền của Việt Nam. |
| `ev:hd14:v:cn` | A | Chương 6 · trang sự kiện › Góc nhìn · Quan điểm Trung Quốc | Hoạt động trong ‘vùng biển Tây Sa’ của Trung Quốc. |
| `ev:pca16:t` | A | Chương 6 · trang sự kiện · tiêu đề, ngày, nơi chốn | Phán quyết Toà Trọng tài về Biển Đông · 12.7.2016 · Biển Đông |
| `ev:pca16:s` | A | Chương 6 · trang sự kiện › Diễn biến · câu đầu (cũng hiện ở thẻ dưới bản đồ, trong tour) | Toà Trọng tài theo UNCLOS bác yêu sách "đường chín đoạn" trong vụ Philippines kiện Trung Quốc. |
| `ev:pca16:x` | A | Chương 6 · trang sự kiện › Diễn biến · đoạn thêm | Trung Quốc không công nhận phán quyết. Việt Nam ủng hộ giải quyết tranh chấp theo luật quốc tế. |
| `ev:pca16:v:vn` | A | Chương 6 · trang sự kiện › Góc nhìn · Sử học chính thống Việt Nam | Hoan nghênh việc giải quyết bằng biện pháp hoà bình, theo UNCLOS. |
| `ev:pca16:v:cn` | A | Chương 6 · trang sự kiện › Góc nhìn · Quan điểm Trung Quốc | ‘Vô hiệu, không có tính ràng buộc’. |
| `ev:pca16:v:intl` | A | Chương 6 · trang sự kiện › Góc nhìn · Sử gia quốc tế | Mốc pháp lý quan trọng cho các bên ven Biển Đông. |
| `fig:lbj` | B | Nhân vật · Lyndon B. Johnson | Lyndon B. Johnson (1908–1973), Tổng thống Mỹ. Tổng thống Mỹ 1963–1969. Sau Nghị quyết Vịnh Bắc Bộ (1964), đưa quân chiến đấu Mỹ vào miền Nam Việt Nam từ tháng 3.1965. Tuyên bố không tái tranh cử ngày 31.3.1968. |
| `src:giaptuat` | B | Sử liệu · hồ sơ "Hiệp ước Giáp Tuất" | Hiệp ước Giáp Tuất · Hiệp ước · Đại Nam – Pháp · 15.3.1874 · ANOM · Thừa nhận chủ quyền của Pháp trên toàn bộ Nam Kỳ lục tỉnh. |
| `src:vbb2000` | A | Sử liệu · hồ sơ "Hiệp định phân định Vịnh Bắc Bộ giữa Việt Nam và Trung Quốc" | Hiệp định phân định Vịnh Bắc Bộ giữa Việt Nam và Trung Quốc · Hiệp ước · Hai chính phủ · 25.12.2000 · Uỷ ban Biên giới quốc gia, Bộ Ngoại giao · Phân định lãnh hải, vùng đặc quyền kinh tế và thềm lục địa của hai nước trong Vịnh Bắc Bộ; có hiệu lực từ 30.6.2004. |
| `src:bngvn` | A | Sử liệu · hồ sơ "Tuyên bố của Người phát ngôn Bộ Ngoại giao Việt Nam" | Tuyên bố của Người phát ngôn Bộ Ngoại giao Việt Nam · Văn kiện · Bộ Ngoại giao Việt Nam · Các năm 2014, 2016 · Cổng thông tin Bộ Ngoại giao · mofa.gov.vn · Các tuyên bố, trả lời báo chí về giàn khoan Hải Dương 981 (5–7.2014) và về phán quyết của Toà Trọng tài (12.7.2016). |
| `src:pca2016` | A | Sử liệu · hồ sơ "Phán quyết vụ Trọng tài Biển Đông (Philippines kiện Trung Quốc)" | Phán quyết vụ Trọng tài Biển Đông (Philippines kiện Trung Quốc) · Văn kiện · Toà Trọng tài theo Phụ lục VII UNCLOS · 12.7.2016 · Toà Trọng tài Thường trực (PCA), La Haye · vụ số 2013-19 · pca-cpa.org · Phán quyết cuối cùng: yêu sách quyền lịch sử trong "đường chín đoạn" không có cơ sở theo UNCLOS; không cấu trúc nào ở Trường Sa có vùng đặc quyền kinh tế riêng. Việt Nam không phải một bên của vụ kiện. |
| `scene:lb72:1` | B | Cảnh trận "Chiến dịch Linebacker II" · mũi tên 2 (Quân Mỹ) | Các tốp B-52 từ vịnh Bắc Bộ (đêm 26.12) |
| `scene:hs74:0` | B | Cảnh trận "Hải chiến Hoàng Sa" · mũi tên 1 (Quân đội VNCH) | HQ-4, HQ-5, HQ-16, HQ-10 tiến về Quang Hòa |
| `scene:hs74:1` | B | Cảnh trận "Hải chiến Hoàng Sa" · mũi tên 2 (Quân đội VNCH) | Biệt hải đổ bộ đảo Quang Hòa |
| `scene:hs74:2` | B | Cảnh trận "Hải chiến Hoàng Sa" · mũi tên 3 (Quân Trung Quốc) | Tàu 271, 274 từ Phú Lâm xuống, cùng 389, 396 chặn tàu VNCH |
| `scene:hs74:3` | B | Cảnh trận "Hải chiến Hoàng Sa" · mũi tên 4 (Quân Trung Quốc) | Trung Quốc đổ bộ chiếm Hoàng Sa, Hữu Nhật (20.1) |
| `scene:gm88:0` | B | Cảnh trận "Gạc Ma" · mũi tên 1 (Quân Trung Quốc) | Tàu hộ vệ 502, 531, 556 từ hướng đá Tư Nghĩa |
| `scene:gm88:1` | B | Cảnh trận "Gạc Ma" · mũi tên 2 (QĐND Việt Nam) | HQ-604 từ Cam Ranh đến giữ Gạc Ma |
| `scene:gm88:2` | B | Cảnh trận "Gạc Ma" · mũi tên 3 (QĐND Việt Nam) | HQ-505 từ đá Lớn đến Cô Lin |
| `scene:gm88:3` | B | Cảnh trận "Gạc Ma" · mũi tên 4 (QĐND Việt Nam) | HQ-605 từ đá Đông qua Tốc Tan đến giữ Len Đao |
| `move:hd14:0` | B | Bản đồ "Giàn khoan Hải Dương 981" · đường 1 (Phía Trung Quốc) | Giàn khoan HD-981 cùng tàu hộ tống Trung Quốc tới hạ đặt (2.5.2014) |
| `move:hd14:1` | B | Bản đồ "Giàn khoan Hải Dương 981" · đường 2 (Phía Việt Nam) | Tàu Cảnh sát biển, Kiểm ngư Việt Nam từ Đà Nẵng ra yêu cầu rút giàn khoan |
| `move:hd14:2` | B | Bản đồ "Giàn khoan Hải Dương 981" · đường 3 (Phía Trung Quốc) | 15–16.7, giàn khoan rút về phía Lăng Thuỷ (Hải Nam) |
| `card:hs74:1` | C | Trò chơi · thẻ "Hải chiến Hoàng Sa" · lựa chọn 2 | Theo dõi tin tức: Không làm gì. → Hoàng Sa thành cái tên trong sách. |
| `card:gm88:0` | C | Trò chơi · thẻ "Gạc Ma" · lựa chọn 1 | Góp tiền cho Trường Sa: Đóng góp qua báo. → Tên dòng họ trên danh sách báo Tuổi Trẻ. |
| `card:gm88:1` | C | Trò chơi · thẻ "Gạc Ma" · lựa chọn 2 | Theo dõi: Tin tức ít ỏi. → Gạc Ma thành một cái tên mãi sau này mới được nhắc. |

## Quốc gia Việt Nam, VNCH và người Việt hải ngoại · 109 câu

Cần để ý: Cách gọi chính thể, quân đội, người ra đi; công bằng với cả hai miền.

| Mã | Hạng | Chỗ hiện | Nguyên văn |
|---|---|---|---|
| `ev:vl67:v:vnch` | A | Chương 1 · trang sự kiện › Góc nhìn · Sử quan VNCH & hải ngoại | Tôn vinh như một bậc trung thần thanh liêm. |
| `ev:cs30:v:vnch` | A | Chương 3 · trang sự kiện › Góc nhìn · Sử quan VNCH & hải ngoại | Một tổ chức theo Quốc tế Cộng sản, đặt mục tiêu giai cấp lên trên dân tộc. |
| `ev:yb30:v:vnch` | A | Chương 3 · trang sự kiện › Góc nhìn · Sử quan VNCH & hải ngoại | Biểu tượng của chủ nghĩa dân tộc không cộng sản. |
| `ev:vm41:v:vnch` | A | Chương 3 · trang sự kiện › Góc nhìn · Sử quan VNCH & hải ngoại | Mặt trận rộng nhưng hạt nhân lãnh đạo là cộng sản. |
| `ev:ng45:v:vnch` | A | Chương 4 · trang sự kiện › Góc nhìn · Sử quan VNCH & hải ngoại | Việt Minh nắm khoảng trống quyền lực, sau đó loại bỏ các đảng phái quốc gia. |
| `ev:el49:t` | B | Chương 4 · trang sự kiện · tiêu đề, ngày, nơi chốn | Hiệp ước Élysée — Quốc gia Việt Nam · 8.3.1949 · Sài Gòn |
| `ev:el49:s` | B | Chương 4 · trang sự kiện › Diễn biến · câu đầu (cũng hiện ở thẻ dưới bản đồ, trong tour) | Pháp công nhận một Việt Nam thống nhất do Bảo Đại làm Quốc trưởng, trong khối Liên hiệp Pháp. |
| `ev:el49:x` | B | Chương 4 · trang sự kiện › Diễn biến · đoạn thêm | Nam Kỳ được trả về cho Việt Nam. Quân đội, ngoại giao, tài chính vẫn chịu nhiều ràng buộc. |
| `ev:el49:v:vnch` | A | Chương 4 · trang sự kiện › Góc nhìn · Sử quan VNCH & hải ngoại | Bước đầu thống nhất và độc lập theo con đường quốc gia. |
| `ev:el49:v:vn` | B | Chương 4 · trang sự kiện › Góc nhìn · Sử học chính thống Việt Nam | Chính quyền bù nhìn do Pháp dựng lên. |
| `ev:el49:v:fr` | B | Chương 4 · trang sự kiện › Góc nhìn · Sử liệu Pháp | ‘Giải pháp Bảo Đại’ quốc tế hoá cuộc chiến chống cộng. |
| `ev:dbp:v:vnch` | A | Chương 5 · trang sự kiện › Góc nhìn · Sử quan VNCH & hải ngoại | Ghi nhận các đơn vị Quân đội Quốc gia Việt Nam, như Tiểu đoàn 5 Nhảy dù, cùng chiến đấu và chịu tổn thất trong tập đoàn cứ điểm. |
| `ev:gnv:v:vnch` | A | Chương 5 · trang sự kiện › Góc nhìn · Sử quan VNCH & hải ngoại | Phái đoàn Quốc gia Việt Nam không ký, phản đối chia cắt. |
| `ev:cc53:v:vnch` | A | Chương 5 · trang sự kiện › Góc nhìn · Sử quan VNCH & hải ngoại | Một chiến dịch khủng bố ở nông thôn. |
| `ev:dc54:v:vnch` | A | Chương 5 · trang sự kiện › Góc nhìn · Sử quan VNCH & hải ngoại | ‘Bỏ phiếu bằng chân’ — lựa chọn tự do. |
| `ev:bx55:s` | B | Chương 5 · trang sự kiện › Diễn biến · câu đầu (cũng hiện ở thẻ dưới bản đồ, trong tour) | Quân đội Quốc gia của Thủ tướng Ngô Đình Diệm đánh bật lực lượng Bình Xuyên khỏi Sài Gòn. |
| `ev:bx55:v:vnch` | A | Chương 5 · trang sự kiện › Góc nhìn · Sử quan VNCH & hải ngoại | Thống nhất quân đội, chấm dứt cát cứ. |
| `ev:vc55:t` | B | Chương 5 · trang sự kiện · tiêu đề, ngày, nơi chốn | Việt Nam Cộng hoà ra đời · 26.10.1955 · Sài Gòn |
| `ev:vc55:s` | B | Chương 5 · trang sự kiện › Diễn biến · câu đầu (cũng hiện ở thẻ dưới bản đồ, trong tour) | Sau trưng cầu dân ý phế truất Bảo Đại, Ngô Đình Diệm làm Tổng thống. |
| `ev:vc55:x` | A | Chương 5 · trang sự kiện › Diễn biến · đoạn thêm | Kết quả công bố 98,2% phiếu ủng hộ. Năm 1956, Hiến pháp Đệ nhất Cộng hoà ban hành. |
| `ev:vc55:v:vnch` | A | Chương 5 · trang sự kiện › Góc nhìn · Sử quan VNCH & hải ngoại | Nền cộng hoà đầu tiên của người Việt. |
| `ev:vc55:v:vn` | B | Chương 5 · trang sự kiện › Góc nhìn · Sử học chính thống Việt Nam | Chính quyền tay sai Mỹ, trưng cầu gian lận. |
| `ev:vc55:v:intl` | A | Chương 5 · trang sự kiện › Góc nhìn · Sử gia quốc tế | Con số 98,2% cho thấy nhiều bất thường. |
| `ev:nv56:v:vnch` | A | Chương 5 · trang sự kiện › Góc nhìn · Sử quan VNCH & hải ngoại | Được dẫn như bằng chứng về việc kiểm soát văn nghệ, tư tưởng ở miền Bắc. |
| `ev:ts59:v:vnch` | A | Chương 5 · trang sự kiện › Góc nhìn · Sử quan VNCH & hải ngoại | Coi con đường là bằng chứng miền Bắc đưa người, vũ khí vào miền Nam qua đất Lào, Campuchia, trái các hiệp định Genève. |
| `ev:dk60:v:vnch` | A | Chương 5 · trang sự kiện › Góc nhìn · Sử quan VNCH & hải ngoại | Các vụ khủng bố, ám sát viên chức xã ấp. |
| `ev:mt60:v:vnch` | A | Chương 5 · trang sự kiện › Góc nhìn · Sử quan VNCH & hải ngoại | Cánh tay của Hà Nội. |
| `ev:ab63:s` | B | Chương 5 · trang sự kiện › Diễn biến · câu đầu (cũng hiện ở thẻ dưới bản đồ, trong tour) | Một đơn vị nhỏ của Quân Giải phóng đẩy lui lực lượng QL VNCH đông hơn có trực thăng Mỹ yểm trợ. |
| `ev:ab63:v:vnch` | A | Chương 5 · trang sự kiện › Góc nhìn · Sử quan VNCH & hải ngoại | Chính quyền Sài Gòn khi đó coi là thắng lợi, vì quân VNCH chiếm được ấp sau khi đối phương rút đi trong đêm. |
| `ev:qd63:v:vnch` | A | Chương 5 · trang sự kiện › Góc nhìn · Sử quan VNCH & hải ngoại | Biến cố làm rạn vỡ chế độ Đệ nhất Cộng hoà. |
| `ev:dc63:t` | B | Chương 5 · trang sự kiện · tiêu đề, ngày, nơi chốn | Đảo chính lật đổ Ngô Đình Diệm · 1.11.1963 · Sài Gòn |
| `ev:dc63:s` | B | Chương 5 · trang sự kiện › Diễn biến · câu đầu (cũng hiện ở thẻ dưới bản đồ, trong tour) | Sau khủng hoảng Phật giáo, các tướng lĩnh lật đổ và sát hại anh em Diệm – Nhu. |
| `ev:dc63:x` | B | Chương 5 · trang sự kiện › Diễn biến · đoạn thêm | Miền Nam bước vào giai đoạn bất ổn với hàng loạt cuộc đảo chính. |
| `ev:dc63:v:vnch` | A | Chương 5 · trang sự kiện › Góc nhìn · Sử quan VNCH & hải ngoại | Tranh luận kéo dài: cách mạng hay sai lầm chí tử. |
| `ev:dc63:v:us` | B | Chương 5 · trang sự kiện › Góc nhìn · Sử liệu Hoa Kỳ | Washington biết trước và không ngăn cản. |
| `ev:dc63:v:vn` | B | Chương 5 · trang sự kiện › Góc nhìn · Sử học chính thống Việt Nam | Mâu thuẫn nội bộ của chế độ Sài Gòn. |
| `ev:vb64:v:vnch` | A | Chương 5 · trang sự kiện › Góc nhìn · Sử quan VNCH & hải ngoại | Chính phủ Nguyễn Khánh, đang hô hào ‘Bắc tiến’, ủng hộ việc Mỹ đánh trả miền Bắc. |
| `ev:dn65:v:vnch` | A | Chương 5 · trang sự kiện › Góc nhìn · Sử quan VNCH & hải ngoại | Đồng minh trực tiếp tham chiến. |
| `ev:ks68:v:vnch` | A | Chương 5 · trang sự kiện › Góc nhìn · Sử quan VNCH & hải ngoại | Ghi nhận Tiểu đoàn 37 Biệt động quân cùng thuỷ quân lục chiến Mỹ giữ căn cứ suốt cuộc vây hãm. |
| `ev:mt68:v:vnch` | A | Chương 5 · trang sự kiện › Góc nhìn · Sử quan VNCH & hải ngoại | Thắng lợi quân sự của QLVNCH; tưởng niệm thảm sát Huế. |
| `ev:hcm69:s` | B | Chương 5 · trang sự kiện › Diễn biến · câu đầu (cũng hiện ở thẻ dưới bản đồ, trong tour) | Chủ tịch Hồ Chí Minh mất. Cùng năm, Tổng thống Nixon bắt đầu rút quân Mỹ, chuyển gánh nặng chiến tranh sang QL VNCH. |
| `ev:hcm69:v:vnch` | A | Chương 5 · trang sự kiện › Góc nhìn · Sử quan VNCH & hải ngoại | Với Sài Gòn, ‘Việt Nam hoá chiến tranh’ nghĩa là QL VNCH dần gánh phần chiến đấu khi quân Mỹ rút. |
| `ev:lk71:s` | B | Chương 5 · trang sự kiện › Diễn biến · câu đầu (cũng hiện ở thẻ dưới bản đồ, trong tour) | QL VNCH, có không quân Mỹ yểm trợ, đánh sang Nam Lào để cắt đường Trường Sơn. |
| `ev:lk71:v:vnch` | A | Chương 5 · trang sự kiện › Góc nhìn · Sử quan VNCH & hải ngoại | Cuộc hành quân vượt biên giới lớn nhất. |
| `ev:qt72:s` | B | Chương 5 · trang sự kiện › Diễn biến · câu đầu (cũng hiện ở thẻ dưới bản đồ, trong tour) | Quân đội VNDCCH chiếm Quảng Trị; QLVNCH tái chiếm Thành cổ sau 81 ngày đêm. |
| `ev:qt72:v:vnch` | A | Chương 5 · trang sự kiện › Góc nhìn · Sử quan VNCH & hải ngoại | ‘Mùa hè đỏ lửa’, chiến thắng tái chiếm Cổ thành. |
| `ev:lb72:v:vnch` | A | Chương 5 · trang sự kiện › Góc nhìn · Sử quan VNCH & hải ngoại | Sài Gòn coi đợt ném bom là sức ép cần thiết lên Hà Nội, dù vẫn phản đối việc hiệp định để quân miền Bắc ở lại miền Nam. |
| `ev:pr73:v:vnch` | A | Chương 5 · trang sự kiện › Góc nhìn · Sử quan VNCH & hải ngoại | Bị đồng minh ép ký, bị bỏ rơi. |
| `ev:hs74:s` | A | Chương 5 · trang sự kiện › Diễn biến · câu đầu (cũng hiện ở thẻ dưới bản đồ, trong tour) | Hải quân VNCH giao chiến với hải quân Trung Quốc. 74 quân nhân VNCH hi sinh; Trung Quốc chiếm toàn bộ Hoàng Sa. |
| `ev:hs74:v:vnch` | A | Chương 5 · trang sự kiện › Góc nhìn · Sử quan VNCH & hải ngoại | Cuộc chiến bảo vệ chủ quyền; tưởng niệm 74 tử sĩ. |
| `ev:hs74:n:0` | A | Chương 5 · trang sự kiện › Diễn biến · bảng số liệu | QL VNCH: 74 tử trận |
| `ev:bmt75:v:vnch` | A | Chương 5 · trang sự kiện › Góc nhìn · Sử quan VNCH & hải ngoại | Quyết định rút quân dẫn tới sụp đổ dây chuyền. |
| `ev:xl75:s` | B | Chương 5 · trang sự kiện › Diễn biến · câu đầu (cũng hiện ở thẻ dưới bản đồ, trong tour) | Sư đoàn 18 QL VNCH cầm cự gần hai tuần ở cửa ngõ phía đông Sài Gòn. |
| `ev:xl75:v:vnch` | A | Chương 5 · trang sự kiện › Góc nhìn · Sử quan VNCH & hải ngoại | Trận đánh cuối cùng đầy kiên cường. |
| `ev:sg75:v:vnch` | A | Chương 5 · trang sự kiện › Góc nhìn · Sử quan VNCH & hải ngoại | Ngày mất nước — ‘Tháng Tư đen’. |
| `ev:sg75:n:2` | A | Chương 5 · trang sự kiện › Diễn biến · bảng số liệu | QL VNCH: ≈ 220.000 – 313.000 tử trận |
| `ev:tn76:x` | A | Chương 6 · trang sự kiện › Diễn biến · đoạn thêm | Hàng trăm nghìn sĩ quan, viên chức VNCH bị đưa đi "học tập cải tạo". |
| `ev:tn76:v:vnch` | A | Chương 6 · trang sự kiện › Góc nhìn · Sử quan VNCH & hải ngoại | Thời kỳ cải tạo, mất mát của người miền Nam. |
| `ev:tn80:v:vnch` | A | Chương 6 · trang sự kiện › Góc nhìn · Sử quan VNCH & hải ngoại | Khởi đầu của cộng đồng người Việt hải ngoại. |
| `ev:hn95:v:vnch` | A | Chương 6 · trang sự kiện › Góc nhìn · Sử quan VNCH & hải ngoại | Mở đường cho kiều bào về nước. |
| `opt:qg:out` | B | Điểm rẽ 4 (1945) · "Con đường của bạn" sau khi chọn "Giải pháp Bảo Đại" | Bạn làm việc cho Quốc gia Việt Nam (1949), giữa hai lằn đạn và một nền độc lập còn hạn chế. |
| `diary:d-qg0` | C | Nhật ký dòng họ (hư cấu) · 1950 · "Tốt nghiệp trường Đà Lạt", nếu chọn "Giải pháp Bảo Đại" | Tốt nghiệp trường Đà Lạt. Bạn nhận cấp hiệu thiếu uý Quân đội Quốc gia. Quân phục vẫn may theo kiểu Pháp. |
| `opt:nam` | B | Điểm rẽ 5 (1954) · lựa chọn "Miền Nam — VNCH" | Miền Nam — VNCH (Sài Gòn): Một nền cộng hoà chống cộng, liên minh với Mỹ. |
| `ctx:e5:qg` | C | Điểm rẽ 5 (1954) · "Gia đình bạn" (đời trước chọn "Giải pháp Bảo Đại") | Cha bạn là sĩ quan trẻ của Quân đội Quốc gia, đóng ở Hà Nội. |
| `opt:radi` | B | Điểm rẽ 6 (1976) · lựa chọn "Ra đi" | Ra đi (Cộng đồng hải ngoại): Rời quê hương, dựng đời sống mới nơi xứ người. |
| `ctx:e6:nam` | C | Điểm rẽ 6 (1976) · "Gia đình bạn" (đời trước chọn "Miền Nam — VNCH") | Cha bạn là cựu sĩ quan VNCH, vừa nhận giấy gọi trình diện "học tập cải tạo". |
| `ctx:gate:ngay-30-thang-tu-cha-ban-treo-co` | C | Điểm rẽ · "Gia đình bạn", bản theo quê hay theo biến cố đã quyết (Trò chơi) | Ngày 30 tháng Tư, cha bạn treo cờ mở cửa; nhưng nhà từng sống dưới chính quyền Sài Gòn, lý lịch vẫn phải khai ba đời. |
| `fig:bd` | B | Nhân vật · Bảo Đại | Bảo Đại (1913–1997), Vua cuối cùng triều Nguyễn. Thoái vị năm 1945, làm Quốc trưởng Quốc gia Việt Nam 1949–1955. Mất tại Paris. |
| `fig:ndd` | B | Nhân vật · Ngô Đình Diệm | Ngô Đình Diệm (1901–1963), Tổng thống VNCH. Tổng thống Đệ nhất Cộng hoà 1955–1963. Bị sát hại trong cuộc đảo chính ngày 1.11.1963. |
| `fig:dvm` | B | Nhân vật · Dương Văn Minh | Dương Văn Minh (1916–2001), Tướng, Tổng thống VNCH. Cầm đầu đảo chính 1963, gần với thành phần thứ ba. Tổng thống cuối cùng của VNCH (28–30.4.1975). Mất tại Mỹ. |
| `fig:nvt` | B | Nhân vật · Nguyễn Văn Thiệu | Nguyễn Văn Thiệu (1923–2001), Tổng thống VNCH. Tổng thống Đệ nhị Cộng hoà 1967–1975. Từ chức ngày 21.4.1975. |
| `fig:tqd` | B | Nhân vật · Thích Quảng Đức | Thích Quảng Đức (1897–1963), Hoà thượng. Tự thiêu ngày 11.6.1963 tại Sài Gòn để phản đối chính sách tôn giáo của chính quyền Ngô Đình Diệm. |
| `fig:bv` | B | Nhân vật · Lê Văn Viễn (Bảy Viễn) | Lê Văn Viễn (Bảy Viễn) (1904–1972), Thủ lĩnh Bình Xuyên. Vượt ngục Côn Đảo, theo kháng chiến Nam Bộ năm 1945, về với Pháp năm 1948, được Quốc gia Việt Nam phong Thiếu tướng năm 1952. Thua quân chính phủ Ngô Đình Diệm năm 1955, mất tại Paris. |
| `fig:ndn` | B | Nhân vật · Ngô Đình Nhu | Ngô Đình Nhu (1910–1963), Cố vấn Tổng thống. Em trai và cố vấn chính trị của Ngô Đình Diệm, Tổng Bí thư Đảng Cần lao Nhân vị, chỉ đạo chương trình Ấp chiến lược từ năm 1962. Bị sát hại cùng anh ngày 2.11.1963 sau cuộc đảo chính. |
| `fig:ndc2` | B | Nhân vật · Ngô Đình Cẩn | Ngô Đình Cẩn (1911–1964), Cố vấn Trung phần. Em trai Ngô Đình Diệm, không giữ chức vụ chính thức nhưng nắm quyền thực tế ở miền Trung từ Huế. Bị bắt sau đảo chính 1963, bị xử bắn tại Sài Gòn ngày 9.5.1964. |
| `fig:tlx` | B | Nhân vật · Trần Lệ Xuân | Trần Lệ Xuân (1924–2011), Đệ nhất Phu nhân. Vợ Ngô Đình Nhu, dân biểu Quốc hội, được xem là Đệ nhất Phu nhân thời Ngô Đình Diệm. Đang ở Mỹ khi đảo chính 1963 xảy ra, sống lưu vong ở Pháp và Ý, mất tại Roma. |
| `fig:nck` | B | Nhân vật · Nguyễn Cao Kỳ | Nguyễn Cao Kỳ (1930–2011), Phó Tổng thống VNCH. Tư lệnh Không quân, Chủ tịch Uỷ ban Hành pháp Trung ương 1965–1967, Phó Tổng thống 1967–1971. Sang Mỹ năm 1975, về thăm Việt Nam năm 2004, mất tại Malaysia. |
| `fig:nk` | B | Nhân vật · Nguyễn Khánh | Nguyễn Khánh (1927–2013), Tướng, Quốc trưởng VNCH. Nắm quyền sau cuộc chỉnh lý ngày 30.1.1964, làm Thủ tướng rồi Quốc trưởng trong năm 1964. Bị các tướng khác loại khỏi chính trường tháng 2.1965, sống ở Pháp rồi Mỹ. |
| `fig:tvh` | B | Nhân vật · Trần Văn Hương | Trần Văn Hương (1902–1982), Tổng thống VNCH. Hai lần làm Thủ tướng (1964–1965, 1968–1969), Phó Tổng thống 1971–1975, Tổng thống từ ngày 21 đến 28.4.1975. Ở lại Sài Gòn sau năm 1975, mất tại đó năm 1982. |
| `fig:nht` | B | Nhân vật · Nguyễn Hữu Thọ | Nguyễn Hữu Thọ (1910–1996), Chủ tịch Mặt trận GP. Luật sư, bị chính quyền Ngô Đình Diệm giam giữ 1954–1961. Chủ tịch Mặt trận Dân tộc Giải phóng miền Nam 1962–1977; sau năm 1976 là Phó Chủ tịch nước, Chủ tịch Quốc hội 1981–1987. |
| `fig:tcs` | B | Nhân vật · Trịnh Công Sơn | Trịnh Công Sơn (1939–2001), Nhạc sĩ. Tác giả tập Ca khúc Da vàng (1967); một số bài phản chiến bị cả VNCH lẫn VNDCCH cấm lưu hành. Hát Nối vòng tay lớn trên đài Sài Gòn trưa 30.4.1975, ở lại trong nước, mất tại TP.HCM năm 2001. |
| `quiz:e4:1` | B | Câu đố chương 4 (sau sự kiện el49) | Hiệp ước Élysée 1949 lập ra nhà nước nào? Đáp án: Quốc gia Việt Nam. Quốc gia Việt Nam, do Bảo Đại làm Quốc trưởng. |
| `src:elysee` | B | Sử liệu · hồ sơ "Hiệp ước Élysée" | Hiệp ước Élysée · Hiệp ước · Bảo Đại – Vincent Auriol · 8.3.1949 · ANOM · Trung tâm Lưu trữ Quốc gia II · Thành lập Quốc gia Việt Nam trong khối Liên hiệp Pháp. |
| `src:vnch` | B | Sử liệu · hồ sơ "Hồ sơ Phủ Tổng thống Đệ nhất & Đệ nhị Cộng hoà" | Hồ sơ Phủ Tổng thống Đệ nhất & Đệ nhị Cộng hoà · Lưu trữ · Chính quyền VNCH · 1955–1975 · Trung tâm Lưu trữ Quốc gia II (TP.HCM) · Phông lưu trữ hành chính của chính quyền Sài Gòn, mở cho nghiên cứu. |
| `src:paris` | B | Sử liệu · hồ sơ "Hiệp định Paris về Việt Nam" | Hiệp định Paris về Việt Nam · Hiệp ước · VNDCCH – Hoa Kỳ – VNCH – CHMNVN · 27.1.1973 · Trung tâm Lưu trữ Quốc gia III · Lưu trữ Liên Hợp Quốc · Chấm dứt chiến tranh, lập lại hoà bình; Mỹ rút quân. |
| `scene:bx55:0` | B | Cảnh trận "Đánh Bình Xuyên tại Sài Gòn" · mũi tên 1 (Quân đội Quốc gia) | Quân đội Quốc gia tiến từ Sài Gòn vào Chợ Lớn |
| `scene:hs74:2` | B | Cảnh trận "Hải chiến Hoàng Sa" · mũi tên 3 (Quân Trung Quốc) | Tàu 271, 274 từ Phú Lâm xuống, cùng 389, 396 chặn tàu VNCH |
| `move:dc63:0` | B | Bản đồ "Đảo chính lật đổ Ngô Đình Diệm" · đường 1 (Quân đội VNCH) | Hai tiểu đoàn Sư đoàn 5 (Đại tá Nguyễn Văn Thiệu) từ Biên Hoà tiến về Dinh Gia Long |
| `move:dc63:1` | B | Bản đồ "Đảo chính lật đổ Ngô Đình Diệm" · đường 2 (Quân đội VNCH) | Tiểu đoàn 6 Nhảy dù từ Vũng Tàu cùng thiết giáp trường Long Hải kéo về Sài Gòn |
| `move:dc63:2` | B | Bản đồ "Đảo chính lật đổ Ngô Đình Diệm" · đường 3 (Quân đội VNCH) | Đơn vị Sư đoàn 7 từ Mỹ Tho lên chặn trục đường phía nam vào Sài Gòn |
| `move:dc63:3` | B | Bản đồ "Đảo chính lật đổ Ngô Đình Diệm" · đường 4 (Quân đội VNCH) | Đêm 1.11, Diệm và Nhu rời dinh lánh về Chợ Lớn; sáng 2.11 bị bắt ở nhà thờ Cha Tam |
| `cf:qg` | A | Kết luận · thẻ "Nếu…" (nhãn "Giả định · không phải lịch sử") của hướng "Giải pháp Bảo Đại" | Nếu Pháp trao độc lập trọn vẹn cho Quốc gia Việt Nam. Năm 1949 Pháp trao cho chính phủ Bảo Đại độc lập thật sự, cả quân đội, ngoại giao, tài chính, thay vì "độc lập trong Liên hiệp Pháp". Một nhà nước quốc gia có thực quyền có thể thu hút nhiều người trung dung hơn; nhưng Việt Minh khi ấy đã giữ nhiều vùng nông thôn và có hậu phương mới ở Trung Quốc, nên chiến tranh nhiều khả năng vẫn tiếp diễn. Căn cứ: Độc lập năm 1949 bị giới hạn về quân đội, ngoại giao, tài chính; từ năm 1950 Việt Minh có hậu phương Trung Quốc. Mức C: khoảng 5% (1 trên 20). |
| `cf:nam` | A | Kết luận · thẻ "Nếu…" (nhãn "Giả định · không phải lịch sử") của hướng "Miền Nam — VNCH" | Nếu Việt Nam Cộng hoà đứng vững sau 1973. Viện trợ Mỹ không bị cắt giảm mạnh năm 1974, Ban Mê Thuột giữ được, lằn ranh của Hiệp định Paris kéo dài. Đất nước có thể bị chia cắt lâu dài như bán đảo Triều Tiên: hai nhà nước, một đường ranh quân sự và những gia đình ly tán qua nhiều thế hệ. Phần đông sử gia cho rằng sau năm 1973 khả năng này đã rất thấp. Căn cứ: Viện trợ Mỹ giảm mạnh năm 1974; phần đông sử gia cho rằng sau năm 1973 cán cân đã nghiêng hẳn. Mức C: khoảng 5% (1 trên 20). |
| `card:el49:0` | C | Trò chơi · thẻ "Hiệp ước Élysée — Quốc gia Việt Nam" · lựa chọn 1 | Làm việc cho Quốc gia Việt Nam: Một người con vào làm công chức Bảo Đại. → Lương tháng đều, nhưng trong họ bắt đầu chia hai lối. |
| `card:el49{picks=qg}:0` | C | Trò chơi · thẻ "Hiệp ước Élysée — Quốc gia Việt Nam" khi đã chọn qg · lựa chọn 1 | Nhận chức ở toà tỉnh: Vào làm công chức Quốc gia Việt Nam. → Lương tháng đều, nhưng trong họ bắt đầu chia hai lối. |
| `card:el49{picks=qg}:1` | C | Trò chơi · thẻ "Hiệp ước Élysée — Quốc gia Việt Nam" khi đã chọn qg · lựa chọn 2 | Cho con vào trường sĩ quan: Một người con theo học trường võ bị của Quân đội Quốc gia. → Người con ra trường với cấp hiệu thiếu uý. Quân phục vẫn may theo kiểu Pháp. |
| `card:gnv{regions=T2+NE+NW}:0` | C | Trò chơi · thẻ "Hiệp định Genève" khi nhà đang ở vùng T2, NE, NW · lựa chọn 1 | Đứng về chính quyền ở Sài Gòn: Không chờ tổng tuyển cử; nhận việc ở xã dưới chính quyền Quốc gia Việt Nam. → Lá cờ trên trụ sở xã đổi màu. Người tập kết đi rồi, xã có thêm những nhà vắng chồng, vắng con. |
| `card:mt60:1` | C | Trò chơi · thẻ "Mặt trận Dân tộc Giải phóng miền Nam" · lựa chọn 2 | Theo chính quyền Sài Gòn: Vào dân vệ ấp chiến lược. → Ngủ trong ấp sau hàng rào kẽm gai. |
| `card:mt68:2` | C | Trò chơi · thẻ "Tổng tấn công Tết Mậu Thân" · lựa chọn 3 | Giúp binh sĩ VNCH bị thương: Mở cửa nhà làm trạm băng bó. → Có người lính sau này quay lại tạ ơn, năm 1990. |
| `card:lk71:0` | C | Trò chơi · thẻ "Hành quân Lam Sơn 719" · lựa chọn 1 | Đi lính Sư đoàn 1 VNCH: Người con bị động viên. → Trở về từ Nam Lào với một chân. |
| `card:hs74:0` | C | Trò chơi · thẻ "Hải chiến Hoàng Sa" · lựa chọn 1 | Quyên góp cho hải quân VNCH: Góp tiền tưởng niệm 74 tử sĩ. → Tấm bằng cảm ơn giữ trong album. |
| `card:cm75:0` | C | Trò chơi · thẻ "Đông Dương đổi chế độ" · lựa chọn 1 | Đưa thân nhân từ Campuchia về: Hoa kiều, Việt kiều chạy Khmer Đỏ. → Thêm năm miệng ăn, thêm năm người sống. |
| `x:x-ngo63` | C | Trò chơi · biến cố riêng "Họ Ngô sau ngày 1 tháng 11" (gắn vào "Đảo chính lật đổ Ngô Đình Diệm") | Họ Ngô sau ngày 1 tháng 11. Sau đảo chính, cảnh sát lập danh sách người dính dáng đến gia đình Ngô Đình; dòng họ bạn mang họ Ngô, lại đệm chữ Đình và có người từng làm ở toà tỉnh, nên bị gọi lên hỏi. |
| `x:x-kieuhoi89` | C | Trò chơi · biến cố riêng "Thùng đồ và chuyến bay về" (gắn vào "Việt Nam rút quân khỏi Campuchia") | Thùng đồ và chuyến bay về. Đã mười năm ở xứ người; thư từ quê kể ruộng khoán được mùa nhưng mộ tổ sụt, và người ta bắt đầu nghe chuyện Việt kiều được về thăm. |
| `x:x-kieuhoi89:0` | C | Trò chơi · biến cố riêng "Thùng đồ và chuyến bay về" · lựa chọn 1 | Gửi tiền, gửi thùng đồ đều đặn: Qua đường bưu điện và người quen mang tay. → Vải, thuốc tây, radio về trước; đô la gấp trong thư về sau. Nhà ở quê lợp lại mái, mua được xe đạp Nhật; hàng xóm gọi là 'nhà có Việt kiều'. |
| `chr:qg` | C | Kết luận · phim hành trình và gia phả · dòng của hướng "Giải pháp Bảo Đại" | Thế hệ 4 làm việc cho Quốc gia Việt Nam từ năm 1949, giữa hai lằn đạn và một nền độc lập còn hạn chế. |
| `lore:ngo` | B | Trò chơi · gia phả mở đầu, họ Ngô | Ước tính khoảng 1,3% dân số. Ngô Quyền thắng trận Bạch Đằng năm 938, mở đầu kỷ nguyên độc lập; thế kỷ XX, dòng Ngô Đình gốc Quảng Bình, theo Công giáo nhiều đời, nắm chính quyền Sài Gòn từ 1954 đến 1963. |
| `lore:duong` | B | Trò chơi · gia phả mở đầu, họ Dương | Ước tính khoảng 1% dân số. Dương Đình Nghệ làm Tiết độ sứ Tĩnh Hải quân trước Ngô Quyền ở thế kỷ X; thế kỷ XX, tướng Dương Văn Minh, quê Mỹ Tho, là tổng thống cuối cùng của Việt Nam Cộng hoà. |
| `hook:ngo-1963` | B | Trò chơi · gia phả mở đầu · biến cố riêng sắp tới của họ | Sau đảo chính tháng 11.1963, một gia đình họ Ngô sẽ bị dò hỏi có bà con với nhà Ngô Đình hay không. |

## Hồ Chí Minh và Đảng Cộng sản · 54 câu

Cần để ý: Đúng sử liệu, giọng trung tính; các chi tiết còn tranh luận (vd. vụ Phan Bội Châu bị bắt năm 1925) ghi rõ là còn tranh luận.

| Mã | Hạng | Chỗ hiện | Nguyên văn |
|---|---|---|---|
| `ev:nq11:t` | B | Chương 2 · trang sự kiện · tiêu đề, ngày, nơi chốn | Nguyễn Tất Thành rời bến Nhà Rồng · 5.6.1911 · Sài Gòn |
| `ev:nq11:x` | B | Chương 2 · trang sự kiện › Diễn biến · đoạn thêm | Ba mươi năm sau, ông trở về với tên Nguyễn Ái Quốc, rồi Hồ Chí Minh. |
| `ev:tn25:t` | B | Chương 2 · trang sự kiện · tiêu đề, ngày, nơi chốn | Hội Việt Nam Cách mạng Thanh niên · 6.1925 · Quảng Châu |
| `ev:tn25:s` | B | Chương 2 · trang sự kiện › Diễn biến · câu đầu (cũng hiện ở thẻ dưới bản đồ, trong tour) | Nguyễn Ái Quốc lập hội, đào tạo cán bộ, ra báo Thanh Niên. |
| `ev:tn25:x` | B | Chương 2 · trang sự kiện › Diễn biến · đoạn thêm | Cùng năm, Phan Bội Châu bị bắt ở Thượng Hải; phong trào đòi ân xá ông lan khắp ba kỳ. |
| `ev:tn25:v:vn` | B | Chương 2 · trang sự kiện › Góc nhìn · Sử học chính thống Việt Nam | Bước chuẩn bị về tư tưởng và tổ chức cho đảng cộng sản. |
| `ev:tn25:v:intl` | A | Chương 2 · trang sự kiện › Góc nhìn · Sử gia quốc tế | Ra đời ở Quảng Châu thời Quốc – Cộng hợp tác, khi Nguyễn Ái Quốc làm phiên dịch cho phái đoàn cố vấn Liên Xô. |
| `ev:cs30:t` | B | Chương 3 · trang sự kiện · tiêu đề, ngày, nơi chốn | Thành lập Đảng Cộng sản Việt Nam · 3.2.1930 · Cửu Long, Hồng Kông |
| `ev:cs30:s` | B | Chương 3 · trang sự kiện › Diễn biến · câu đầu (cũng hiện ở thẻ dưới bản đồ, trong tour) | Nguyễn Ái Quốc hợp nhất các tổ chức cộng sản. Tháng 10 đổi tên thành Đảng Cộng sản Đông Dương. |
| `ev:cs30:x` | B | Chương 3 · trang sự kiện › Diễn biến · đoạn thêm | Chỉ vài tháng sau, Xô viết Nghệ Tĩnh nổ ra rồi bị đàn áp; nhiều lãnh đạo bị bắt. |
| `ev:cs30:v:vn` | B | Chương 3 · trang sự kiện › Góc nhìn · Sử học chính thống Việt Nam | Bước ngoặt vĩ đại, chấm dứt khủng hoảng đường lối cứu nước. |
| `ev:cs30:v:vnch` | A | Chương 3 · trang sự kiện › Góc nhìn · Sử quan VNCH & hải ngoại | Một tổ chức theo Quốc tế Cộng sản, đặt mục tiêu giai cấp lên trên dân tộc. |
| `ev:cs30:v:intl` | B | Chương 3 · trang sự kiện › Góc nhìn · Sử gia quốc tế | Tổ chức có kỷ luật nhất trong các phong trào thời đó. |
| `ev:vm41:s` | B | Chương 3 · trang sự kiện › Diễn biến · câu đầu (cũng hiện ở thẻ dưới bản đồ, trong tour) | Nguyễn Ái Quốc về nước, lập Việt Nam Độc lập Đồng minh hội, đặt độc lập dân tộc lên hàng đầu. |
| `ev:ng45:x` | A | Chương 4 · trang sự kiện › Diễn biến · đoạn thêm | Ngày 30.8 Bảo Đại thoái vị. Ngày 2.9, tại Ba Đình, Hồ Chí Minh đọc Tuyên ngôn Độc lập, khai sinh VN Dân chủ Cộng hoà. Ngày 23.9 Pháp nổ súng ở Sài Gòn. |
| `ev:tu46:s` | B | Chương 4 · trang sự kiện › Diễn biến · câu đầu (cũng hiện ở thẻ dưới bản đồ, trong tour) | Hội nghị Fontainebleau không đạt kết quả. Hồ Chí Minh ký Tạm ước, nhượng bộ một số quyền lợi kinh tế, văn hoá. |
| `ev:cc53:x` | A | Chương 5 · trang sự kiện › Diễn biến · đoạn thêm | Năm 1956, Đảng Lao động Việt Nam thừa nhận sai lầm, tiến hành sửa sai. Số người bị xử tử đến nay vẫn còn tranh luận. |
| `ev:ts59:v:vn` | B | Chương 5 · trang sự kiện › Góc nhìn · Sử học chính thống Việt Nam | ‘Đường mòn Hồ Chí Minh’, con đường huyền thoại. |
| `ev:hcm69:t` | B | Chương 5 · trang sự kiện · tiêu đề, ngày, nơi chốn | Hồ Chí Minh qua đời · "Việt Nam hoá chiến tranh" · 2.9.1969 · Hà Nội |
| `ev:hcm69:s` | B | Chương 5 · trang sự kiện › Diễn biến · câu đầu (cũng hiện ở thẻ dưới bản đồ, trong tour) | Chủ tịch Hồ Chí Minh mất. Cùng năm, Tổng thống Nixon bắt đầu rút quân Mỹ, chuyển gánh nặng chiến tranh sang QL VNCH. |
| `ev:hcm69:x` | B | Chương 5 · trang sự kiện › Diễn biến · đoạn thêm | Hội nghị Paris bước vào giai đoạn bốn bên. |
| `ev:hcm69:v:vn` | B | Chương 5 · trang sự kiện › Góc nhìn · Sử học chính thống Việt Nam | Di chúc của Người được thực hiện trong thống nhất. |
| `ev:hcm69:v:vnch` | A | Chương 5 · trang sự kiện › Góc nhìn · Sử quan VNCH & hải ngoại | Với Sài Gòn, ‘Việt Nam hoá chiến tranh’ nghĩa là QL VNCH dần gánh phần chiến đấu khi quân Mỹ rút. |
| `ev:hcm69:v:us` | B | Chương 5 · trang sự kiện › Góc nhìn · Sử liệu Hoa Kỳ | Rút quân dần, giữ cam kết với đồng minh. |
| `ev:tn76:s` | A | Chương 6 · trang sự kiện › Diễn biến · câu đầu (cũng hiện ở thẻ dưới bản đồ, trong tour) | Quốc hội khoá VI đặt tên nước mới. Sài Gòn đổi tên thành TP. Hồ Chí Minh. |
| `ev:ct78:t` | B | Chương 6 · trang sự kiện · tiêu đề, ngày, nơi chốn | Cải tạo công thương nghiệp · nạn kiều · 3.1978 · TP. Hồ Chí Minh |
| `opt:cs` | B | Điểm rẽ 3 (1930) · lựa chọn "Cộng sản" | Cộng sản (Nguyễn Ái Quốc · Trần Phú): Giải phóng dân tộc gắn với đấu tranh giai cấp, theo Quốc tế Cộng sản. |
| `opt:vm` | B | Điểm rẽ 4 (1945) · lựa chọn "Theo Việt Minh" | Theo Việt Minh (Hồ Chí Minh · Võ Nguyên Giáp): Kháng chiến toàn dân giành độc lập trọn vẹn. |
| `ctx:gate:dong-ho-di-qua-nhung-nam-1919-1925` | C | Điểm rẽ · "Gia đình bạn", bản theo quê hay theo biến cố đã quyết (Trò chơi) | )}, dòng họ đi qua những năm 1919–1925 mà không ai hỏi tới những tờ giấy ký tên Nguyễn Ái Quốc.`);
  return [t, ...lines].filter(Boolean).join( |
| `fig:hcm` | B | Nhân vật · Hồ Chí Minh | Hồ Chí Minh (1890–1969), Chủ tịch nước VNDCCH. Rời Việt Nam năm 1911, sáng lập Đảng Cộng sản Việt Nam (1930), đọc Tuyên ngôn Độc lập (1945). Chủ tịch nước 1945–1969. |
| `fig:ld` | B | Nhân vật · Lê Duẩn | Lê Duẩn (1907–1986), Tổng Bí thư. Bí thư thứ nhất từ 1960, Tổng Bí thư Đảng Cộng sản Việt Nam 1976–1986. |
| `fig:nvl` | B | Nhân vật · Nguyễn Văn Linh | Nguyễn Văn Linh (1915–1998), Tổng Bí thư. Tổng Bí thư 1986–1991, người gắn với đường lối Đổi Mới. |
| `fig:htk` | B | Nhân vật · Huỳnh Thúc Kháng | Huỳnh Thúc Kháng (1876–1947), Nhà báo, Bộ trưởng VNDCCH. Đỗ Tiến sĩ năm 1904, bị đày Côn Đảo 1908–1919, sáng lập báo Tiếng Dân (1927–1943). Bộ trưởng Nội vụ VNDCCH từ 1946, quyền Chủ tịch nước khi Hồ Chí Minh sang Pháp; mất ở Quảng Ngãi năm 1947. |
| `fig:tp` | B | Nhân vật · Trần Phú | Trần Phú (1904–1931), Tổng Bí thư. Tổng Bí thư đầu tiên của Đảng Cộng sản Đông Dương từ tháng 10.1930, người soạn thảo Luận cương chính trị. Bị bắt tại Sài Gòn tháng 4.1931, mất trong khi bị giam ngày 6.9.1931. |
| `fig:lhp` | B | Nhân vật · Lê Hồng Phong | Lê Hồng Phong (1902–1942), Tổng Bí thư. Tổng Bí thư Đảng Cộng sản Đông Dương 1935–1936, uỷ viên Ban Chấp hành Quốc tế Cộng sản từ năm 1935. Bị bắt năm 1939 và 1940, đày Côn Đảo, mất tại đó ngày 6.9.1942. |
| `fig:tc` | B | Nhân vật · Trường Chinh | Trường Chinh (1907–1988), Tổng Bí thư. Tổng Bí thư 1941–1956, rời chức sau cải cách ruộng đất; tác giả Kháng chiến nhất định thắng lợi (1947). Chủ tịch Hội đồng Nhà nước 1981–1987, Tổng Bí thư lần hai năm 1986. Mất tại Hà Nội. |
| `fig:js` | B | Nhân vật · Jean Sainteny | Jean Sainteny (1907–1978), Uỷ viên Cộng hoà Pháp. Uỷ viên Cộng hoà Pháp tại Bắc Kỳ, ký Hiệp định Sơ bộ ngày 6.3.1946 với Hồ Chí Minh. Tổng đại diện Pháp tại Hà Nội từ năm 1954, Bộ trưởng Cựu chiến binh Pháp 1962–1966. |
| `fig:ndn` | B | Nhân vật · Ngô Đình Nhu | Ngô Đình Nhu (1910–1963), Cố vấn Tổng thống. Em trai và cố vấn chính trị của Ngô Đình Diệm, Tổng Bí thư Đảng Cần lao Nhân vị, chỉ đạo chương trình Ấp chiến lược từ năm 1962. Bị sát hại cùng anh ngày 2.11.1963 sau cuộc đảo chính. |
| `fig:vtd` | B | Nhân vật · Văn Tiến Dũng | Văn Tiến Dũng (1917–2002), Tổng Tham mưu trưởng. Tổng Tham mưu trưởng Quân đội Nhân dân Việt Nam 1953–1978, Đại tướng từ năm 1974. Tư lệnh chiến dịch Hồ Chí Minh tháng 4.1975. Bộ trưởng Quốc phòng 1980–1987. |
| `fig:dm` | B | Nhân vật · Đỗ Mười | Đỗ Mười (1917–2018), Tổng Bí thư. Chủ tịch Hội đồng Bộ trưởng 1988–1991, Tổng Bí thư Đảng Cộng sản Việt Nam 1991–1997. Mất tại Hà Nội ngày 1.10.2018, thọ 101 tuổi. |
| `born:hcm` | B | Nhân vật · Hồ Chí Minh · dòng phụ dưới tên | Hồ Chí Minh: khai sinh Nguyễn Sinh Cung |
| `quiz:e3:2` | B | Câu đố chương 3 (sau sự kiện cs30) | Hội nghị thành lập Đảng Cộng sản Việt Nam (2.1930) họp ở đâu? Đáp án: Hồng Kông. Ở Cửu Long, Hồng Kông; tháng 10.1930 đổi tên thành Đảng Cộng sản Đông Dương. |
| `src:tuyenngon` | B | Sử liệu · hồ sơ "Tuyên ngôn Độc lập" | Tuyên ngôn Độc lập · Văn kiện · Hồ Chí Minh · 2.9.1945 · Trung tâm Lưu trữ Quốc gia III · Văn bản khai sinh nước Việt Nam Dân chủ Cộng hoà. |
| `src:sobo` | B | Sử liệu · hồ sơ "Hiệp định Sơ bộ Việt – Pháp" | Hiệp định Sơ bộ Việt – Pháp · Hiệp ước · Hồ Chí Minh – Sainteny · 6.3.1946 · Trung tâm Lưu trữ Quốc gia III · ANOM · Pháp công nhận VNDCCH là "quốc gia tự do" trong Liên hiệp Pháp; quân Pháp ra Bắc thay quân Tưởng. |
| `src:vkd` | B | Sử liệu · hồ sơ "Văn kiện Đảng toàn tập" | Văn kiện Đảng toàn tập · Văn kiện · Đảng Cộng sản Việt Nam · 1930 – nay · NXB Chính trị quốc gia Sự thật · Bộ sưu tập nghị quyết, chỉ thị, văn kiện đại hội. |
| `card:tn25:0` | C | Trò chơi · thẻ "Hội Việt Nam Cách mạng Thanh niên" · lựa chọn 1 | Gửi con sang Quảng Châu: Theo lớp huấn luyện của Nguyễn Ái Quốc. → Người ấy về nước năm 1928, mang theo tờ báo Thanh Niên và một cái tên khác. |
| `x:x-nguyen25` | C | Trò chơi · biến cố riêng "Cái tên Nguyễn Ái Quốc" (gắn vào "Hội Việt Nam Cách mạng Thanh niên") | Cái tên Nguyễn Ái Quốc. Từ năm 1919, tên Nguyễn Ái Quốc đứng dưới bản Yêu sách của nhân dân An Nam gửi Hội nghị Versailles; năm 1925 người mang tên ấy lập Hội Việt Nam Cách mạng Thanh niên ở Quảng Châu. Mật thám lùng tìm, còn ở làng, các nhà họ Nguyễn nghe cái tên ấy với đủ thứ cảm xúc. |
| `chr:cs` | C | Kết luận · phim hành trình và gia phả · dòng của hướng "Cộng sản" | Thế hệ 3 theo Đảng Cộng sản, hoạt động bí mật qua Xô viết Nghệ Tĩnh và nhà tù Côn Đảo, rồi về Pác Bó dựng Việt Minh. |
| `lore:ho` | B | Trò chơi · gia phả mở đầu, họ Hồ | Ước tính khoảng 1,3% dân số. Hồ Quý Ly lập nhà Hồ (1400–1407) rồi bị quân Minh bắt; làng Quỳnh Đôi (Nghệ An) là đất của một dòng họ Hồ lớn, còn tên Hồ Chí Minh là bí danh của Nguyễn Sinh Cung, không phải họ gốc. |
| `lore:ha` | B | Trò chơi · gia phả mở đầu, họ Hà | Họ Hà có ở người Kinh và là một trong các họ lớn của người Mường, người Thái vùng Tây Bắc. Hà Huy Tập (1906–1941), quê Hà Tĩnh, Tổng Bí thư thứ ba của Đảng Cộng sản Đông Dương, bị Pháp xử bắn năm 1941. |
| `epi:le` | B | Kết luận · lời khép theo họ Lê | Lê là họ đông thứ ba (khoảng 9–10%); sau Đổi Mới có Chủ tịch nước Lê Đức Anh và Tổng Bí thư Lê Khả Phiêu. |
| `epi:do` | B | Kết luận · lời khép theo họ Đỗ | Đỗ chiếm khoảng 1–2% dân số; Đỗ Mười, Tổng Bí thư 1991–1997, cầm lái giai đoạn bình thường hoá với Trung Quốc (1991) và Mỹ (1995). |
| `epi:ho` | B | Kết luận · lời khép theo họ Hồ | Hồ chiếm khoảng 1% dân số. Người mang họ này nổi tiếng nhất, Hồ Chí Minh, sinh ra là Nguyễn Sinh Cung và đổi tên nhiều lần trong đời. |
| `hook:nguyen-1925` | B | Trò chơi · gia phả mở đầu · biến cố riêng sắp tới của họ | Khi cái tên Nguyễn Ái Quốc lan về làng (1919–1925), dòng họ Nguyễn sẽ phải chọn giữ hay đốt những tờ giấy mang tên ấy. |

## Bao cấp, cải tạo công thương nghiệp, Đổi Mới · 63 câu

Cần để ý: Số liệu kinh tế (lạm phát, đổi tiền), cách tả đời sống; không bôi đen, không tô hồng.

| Mã | Hạng | Chỗ hiện | Nguyên văn |
|---|---|---|---|
| `ev:nv56:x` | A | Chương 5 · trang sự kiện › Diễn biến · đoạn thêm | Báo bị đình bản, nhiều người bị kỷ luật hoặc bị cấm sáng tác lâu năm. Một số được phục hồi sau Đổi Mới. |
| `ev:ct78:t` | B | Chương 6 · trang sự kiện · tiêu đề, ngày, nơi chốn | Cải tạo công thương nghiệp · nạn kiều · 3.1978 · TP. Hồ Chí Minh |
| `ev:ct78:s` | A | Chương 6 · trang sự kiện › Diễn biến · câu đầu (cũng hiện ở thẻ dưới bản đồ, trong tour) | Chính quyền quốc hữu hoá cơ sở kinh doanh tư nhân ở miền Nam. |
| `ev:ct78:x` | A | Chương 6 · trang sự kiện › Diễn biến · đoạn thêm | Nhiều người Hoa rời Việt Nam. Quan hệ Việt – Trung xấu đi nhanh chóng. |
| `ev:ct78:v:vn` | A | Chương 6 · trang sự kiện › Góc nhìn · Sử học chính thống Việt Nam | Sau này thừa nhận là nóng vội, đã điều chỉnh. |
| `ev:ct78:v:cn` | A | Chương 6 · trang sự kiện › Góc nhìn · Quan điểm Trung Quốc | Cáo buộc Việt Nam ‘bài Hoa’. |
| `ev:dm86:t` | B | Chương 6 · trang sự kiện · tiêu đề, ngày, nơi chốn | Đổi Mới · 12.1986 · Hà Nội |
| `ev:dm86:s` | B | Chương 6 · trang sự kiện › Diễn biến · câu đầu (cũng hiện ở thẻ dưới bản đồ, trong tour) | Đại hội VI chuyển sang kinh tế nhiều thành phần. |
| `ev:dm86:x` | B | Chương 6 · trang sự kiện › Diễn biến · đoạn thêm | Khoán 10 (1988) giải phóng nông nghiệp; từ nước thiếu gạo, Việt Nam thành nước xuất khẩu gạo. |
| `ev:dm86:v:vn` | B | Chương 6 · trang sự kiện › Góc nhìn · Sử học chính thống Việt Nam | Đổi mới tư duy, trước hết là tư duy kinh tế. |
| `ev:dm86:v:intl` | B | Chương 6 · trang sự kiện › Góc nhìn · Sử gia quốc tế | Một trong những cuộc chuyển đổi kinh tế thành công nhất châu Á. |
| `ev:dm86:qt` | A | Chương 6 · trang sự kiện › Diễn biến · khối trích dẫn | “Nhìn thẳng vào sự thật, đánh giá đúng sự thật, nói rõ sự thật.” — Văn kiện Đại hội VI, 1986 |
| `era:e6:q` | B | Điểm rẽ 6 (1976) · câu đặt vấn đề | Sau tiếng súng. Đất nước thống nhất nhưng kiệt quệ: cấm vận, hai cuộc chiến biên giới, lạm phát. Bạn chọn con đường nào? |
| `era:e6:hist` | B | Kết luận · "Lịch sử thật" của điểm rẽ 6 | Đổi Mới 1986 đưa Việt Nam hội nhập. Năm 2025, cả nước sắp xếp lại còn 34 tỉnh, thành. |
| `opt:baocap` | B | Điểm rẽ 6 (1976) · lựa chọn "Giữ kế hoạch hoá" | Giữ kế hoạch hoá (Kinh tế tập trung): Hợp tác xã, tem phiếu, quốc doanh. |
| `opt:baocap:out` | B | Điểm rẽ 6 (1976) · "Con đường của bạn" sau khi chọn "Giữ kế hoạch hoá" | Bạn xếp hàng mua gạo bằng tem phiếu. Đến giữa thập niên 1980, lạm phát lên mức ba con số. |
| `diary:d-baocap0` | C | Nhật ký dòng họ (hư cấu) · 1980 · "Sổ gạo", nếu chọn "Giữ kế hoạch hoá" | Sổ gạo. Mỗi tháng 13 cân gạo, độn bo bo. Bạn xếp gạch giữ chỗ ở cửa hàng mậu dịch từ 4 giờ sáng. |
| `diary:d-baocap1` | C | Nhật ký dòng họ (hư cấu) · 1985 · "Đổi tiền", nếu chọn "Giữ kế hoạch hoá" | Đổi tiền. Lương tháng của bạn chỉ còn đủ mua vài cân thịt. Giá cả đổi từng tuần. |
| `opt:doimoi` | B | Điểm rẽ 6 (1976) · lựa chọn "Đổi Mới" | Đổi Mới (Đại hội VI, 1986): Kinh tế thị trường định hướng XHCN, mở cửa. |
| `opt:doimoi:out` | B | Điểm rẽ 6 (1976) · "Con đường của bạn" sau khi chọn "Đổi Mới" | Bạn mở một xưởng nhỏ sau năm 1986. Khoán 10, rồi ASEAN, rồi WTO. |
| `diary:d-doimoi0` | C | Nhật ký dòng họ (hư cấu) · 1988 · "Ruộng khoán", nếu chọn "Đổi Mới" | Ruộng khoán. Hợp tác xã giao ruộng cho từng hộ. Vụ đầu tiên, nhà bạn thừa thóc. |
| `diary:d-baocap0-n` | A | Trò chơi · nhật ký đời thường ở nhà, nhà ở miền Nam (thay trang d-baocap0) | Bo bo thay gạo. Mua theo sổ gạo ở cửa hàng lương thực, phần nhiều là bo bo, bột mì. Ngoài chợ, gạo đắt gấp mấy lần; thời ngăn sông cấm chợ, chở gạo qua khỏi tỉnh là bị trạm kiểm soát dọc đường thu từng bao. |
| `diary:d-baocap1-t` | A | Trò chơi · nhật ký đời thường ở nhà, nhà ở miền Trung (thay trang d-baocap1) | Đổi tiền. Tháng Chín, mười đồng cũ đổi lấy một đồng mới. Mấy tháng sau, giá muối, giá vải ở chợ huyện đã đổi từng tuần; nhà bạn giữ thóc trong bồ chứ không giữ tiền. |
| `diary:d-baocap1-n` | A | Trò chơi · nhật ký đời thường ở nhà, nhà ở miền Nam (thay trang d-baocap1) | Đổi tiền lần thứ ba. Tháng Chín, mười đồng cũ đổi lấy một đồng mới. Ở miền Nam, đây là lần đổi tiền thứ ba kể từ năm 1975; ai còn chút vàng thì giữ vàng, không ai muốn giữ tiền. |
| `diary:d-doimoi0-t` | A | Trò chơi · nhật ký đời thường ở nhà, nhà ở miền Trung (thay trang d-doimoi0) | Ruộng khoán. Theo Khoán 10, hợp tác xã giao ruộng cho từng hộ. Ruộng ít, lại là đất cát bạc màu, nhưng vụ đầu tiên tự làm, nhà bạn đủ ăn tới vụ sau. |
| `diary:d-doimoi0-n` | A | Trò chơi · nhật ký đời thường ở nhà, nhà ở miền Nam (thay trang d-doimoi0) | Ruộng khoán. Khoán 10 giao ruộng về cho từng hộ. Nhiều nhà trong xóm làm đơn xin lại phần đất cũ đã đưa vào tập đoàn sản xuất; nhà bạn nhận lại mấy công ruộng, vụ đầu đã có lúa bán. |
| `fig:nvl` | B | Nhân vật · Nguyễn Văn Linh | Nguyễn Văn Linh (1915–1998), Tổng Bí thư. Tổng Bí thư 1986–1991, người gắn với đường lối Đổi Mới. |
| `fig:kn` | B | Nhân vật · Kim Ngọc | Kim Ngọc (1917–1979), Bí thư Tỉnh uỷ. Bí thư Tỉnh uỷ Vĩnh Phúc 1959–1968, rồi Vĩnh Phú 1968–1977. Chủ trương khoán hộ trong nông nghiệp năm 1966, sau đó phải kiểm điểm. Mất năm 1979, trước Khoán 100 và Khoán 10. |
| `quiz:e6:0` | B | Câu đố chương 6 (sau sự kiện dm86) | Đổi Mới được quyết định tại Đại hội nào? Đáp án: Đại hội VI. Đại hội VI, tháng 12.1986. |
| `move:ct78:0` | B | Bản đồ "Cải tạo công thương nghiệp · nạn kiều" · đường 1 (Dân thường) | Người Hoa ở Hải Phòng, Quảng Ninh qua cửa khẩu Móng Cái sang Trung Quốc |
| `move:ct78:1` | B | Bản đồ "Cải tạo công thương nghiệp · nạn kiều" · đường 2 (Dân thường) | Người Hoa ở Hà Nội và các tỉnh phía Bắc qua cửa khẩu Hữu Nghị |
| `move:ct78:2` | B | Bản đồ "Cải tạo công thương nghiệp · nạn kiều" · đường 3 (Dân thường) | Người Hoa ở Chợ Lớn ra đi bằng thuyền (1978–79) |
| `cf:baocap` | A | Kết luận · thẻ "Nếu…" (nhãn "Giả định · không phải lịch sử") của hướng "Giữ kế hoạch hoá" | Nếu không có Đổi Mới năm 1986. Đại hội VI giữ nguyên kế hoạch hoá tập trung; không có Khoán 10, không có Luật Đầu tư nước ngoài năm 1987. Lạm phát hàng trăm phần trăm của năm 1986 có thể kéo dài, như ở những nền kinh tế kế hoạch không cải cách. Nhưng "khoán chui" đã có từ những năm 1960 ở nhiều hợp tác xã, nên sức ép đổi mới từ dưới lên khó mà chặn lâu. Căn cứ: Lạm phát năm 1986 thường được dẫn là khoảng 775%; "khoán chui" đã có từ thập niên 1960 và Khoán 100 từ năm 1981. Mức C: khoảng 5% (1 trên 20). |
| `card:pr73:1` | C | Trò chơi · thẻ "Hiệp định Paris" · lựa chọn 2 | Không tin, giữ của: Để bạc trong lu. → Lu bạc năm 1975 đổi tiền thành gần không. |
| `card:tn76:2` | C | Trò chơi · thẻ "Cộng hoà XHCN Việt Nam" · lựa chọn 3 | Xin ở lại thành phố: Lo lót để không phải đi. → Ở lại, nhưng sổ gạo cắt một nửa. |
| `card:tn80:1` | C | Trò chơi · thẻ "Làn sóng thuyền nhân" · lựa chọn 2 | Ở lại: Chịu đói qua thời bao cấp. → Sổ gạo, tem phiếu, xếp hàng. Nhưng còn nhau. |
| `card:tn80{after=x:x-lylich78=2}:1` | C | Trò chơi · thẻ "Làn sóng thuyền nhân" khi sau x:x-lylich78=2 · lựa chọn 2 | Ở lại, chờ thư: Sống bằng sổ gạo và những lá thư từ trại tị nạn. → Thư về đều đặn. Ở nhà vẫn xếp hàng mua gạo, nhưng biết người đi đã tới nơi. |
| `card:dm86:0` | C | Trò chơi · thẻ "Đổi Mới" · lựa chọn 1 | Mở hiệu buôn, khoán sản: Làm ăn tư nhân ngay khi được phép. → Năm 1990 có xe máy đầu tiên trong làng. |
| `card:dm86{flags=ditan+ly79Di+vuotbien+odp}:0` | C | Trò chơi · thẻ "Đổi Mới" khi dòng họ có cờ ditan, ly79Di, vuotbien, odp · lựa chọn 1 | Hùn vốn cho người nhà mở tiệm: Đổi Mới cho làm ăn tư nhân; gửi tiền về cho một người em họ ở quê mở cửa hàng, lời chia đôi. → Tiệm tạp hoá đứng tên người em họ, vốn từ bên này. Năm 1990, thư về kể tiệm có thêm cái tủ lạnh và chiếc xe máy đầu tiên trong xóm. |
| `card:dm86{flags=ditan+ly79Di+vuotbien+odp}:2` | C | Trò chơi · thẻ "Đổi Mới" khi dòng họ có cờ ditan, ly79Di, vuotbien, odp · lựa chọn 3 | Chờ xem, chưa tin: Báo chí cộng đồng chia rẽ: đổi mới thật hay chỉ là đổi giọng. → Hội đồng hương họp mấy buổi, cãi nhau mấy buổi. Quà vẫn gửi về cho họ hàng, nhưng chưa ai dám về. |
| `card:dm86{picks=doimoi}:2` | C | Trò chơi · thẻ "Đổi Mới" khi đã chọn doimoi · lựa chọn 3 | Nhận khoán ruộng: Từ khoán sản phẩm đến Khoán 10 (1988), ruộng giao cho từng hộ. → Vụ đầu tiên, nhà thừa thóc. Năm 1989 Việt Nam xuất khẩu gạo trở lại. |
| `x:x-kieuhoi89` | C | Trò chơi · biến cố riêng "Thùng đồ và chuyến bay về" (gắn vào "Việt Nam rút quân khỏi Campuchia") | Thùng đồ và chuyến bay về. Đã mười năm ở xứ người; thư từ quê kể ruộng khoán được mùa nhưng mộ tổ sụt, và người ta bắt đầu nghe chuyện Việt kiều được về thăm. |
| `x:x-ly79:2` | C | Trò chơi · biến cố riêng "Họ Lý, năm 1979" · lựa chọn 3 | Ở lại, chịu bị để ý: Không đi, không chứng minh; sống qua ngày. → Hai người bị cho thôi việc ở cơ quan 'vì lý do an ninh'. Sau 1986 mới có người được nhận lại; cửa hàng mở lại nhờ Đổi Mới. |
| `abroad:baocap` | C | Điểm rẽ 6, nhà đã di tản · lựa chọn "Gửi quà nuôi người ở quê" (Những thùng quà thời bao cấp) | Gửi quà nuôi người ở quê: Đi làm hai ca; thuốc tây, vải, bột ngọt đóng thùng gửi qua bưu điện, chịu thuế để họ hàng ở quê được nhận. → Bạn lớn lên giữa những thùng quà đóng dở trong phòng khách. Ở quê, họ hàng bán dần từng lọ thuốc, từng xấp vải để đong gạo qua những năm tem phiếu. |
| `abroad:doimoi` | C | Điểm rẽ 6, nhà đã di tản · lựa chọn "Về nước làm ăn" (Việt kiều, sau Đổi Mới) | Về nước làm ăn: Theo dõi Đổi Mới từ xa; khi Mỹ bỏ cấm vận (1994), mang vốn, mang nghề về quê. → Bạn học nghề, đi làm ở xứ người. Tháng 2.1994 Mỹ bỏ cấm vận, và bạn ở trong những chuyến bay đầu tiên về làm ăn: giấy phép mất hai năm, đối tác đổi ba lần, nhưng xưởng vẫn đứng. |
| `out:out-xbaocap` | C | Điểm rẽ 6 · kết cục của hướng "Gửi quà nuôi người ở quê", nhà đã di tản tháng 4.1975 | Bạn lớn lên giữa những thùng quà đóng dở trong phòng khách. Ở quê, họ hàng bán dần từng lọ thuốc, từng xấp vải để đong gạo qua những năm tem phiếu. |
| `chr:baocap` | C | Kết luận · phim hành trình và gia phả · dòng của hướng "Giữ kế hoạch hoá" | Thế hệ 6 ở lại trong hợp tác xã và biên chế, xếp hàng mua gạo bằng tem phiếu qua những năm lạm phát ba con số. |
| `chr:doimoi` | C | Kết luận · phim hành trình và gia phả · dòng của hướng "Đổi Mới" | Thế hệ 6 mở một xưởng nhỏ sau năm 1986, làm ăn qua Khoán 10, rồi ASEAN, rồi WTO. |
| `chr:chr-xbaocap` | C | Phim hành trình · dòng gia phả của hướng "Giữ kế hoạch hoá", nhà đã di tản | Thế hệ 6 lớn lên ở xứ người; lương làm hai ca thành những thùng quà gửi về nuôi họ hàng qua những năm tem phiếu, lạm phát ba con số. |
| `chr:chr-g-baocap-ly79di` | C | Phim hành trình · dòng gia phả của hướng "Giữ kế hoạch hoá", chọn ở trong nước rồi cả nhà ra đi (ly79Di) | Thế hệ 6 sống bằng sổ gạo, tem phiếu những năm đầu sau thống nhất; năm 1979, cả nhà nộp vàng đi “bán chính thức”, tới trại ở Hồng Kông rồi định cư ở Toronto. |
| `chr:chr-g-baocap-vuotbien` | C | Phim hành trình · dòng gia phả của hướng "Giữ kế hoạch hoá", chọn ở trong nước rồi cả nhà ra đi (vuotbien) | Thế hệ 6 sống bằng sổ gạo, tem phiếu những năm đầu sau thống nhất; năm 1980, cả nhà bán hết, xuống ghe vượt biển, qua trại tị nạn rồi định cư ở xứ người. |
| `chr:chr-g-baocap-vuotbien-lylichdi` | C | Phim hành trình · dòng gia phả của hướng "Giữ kế hoạch hoá", chọn ở trong nước rồi cả nhà ra đi (vuotbien, lylichDi) | Thế hệ 6 sống bằng sổ gạo, tem phiếu những năm đầu sau thống nhất; năm 1980, cả nhà còn lại theo đường người đi trước xuống ghe, qua trại tị nạn rồi định cư ở xứ người. |
| `chr:chr-g-baocap-odp` | C | Phim hành trình · dòng gia phả của hướng "Giữ kế hoạch hoá", chọn ở trong nước rồi cả nhà ra đi (odp) | Thế hệ 6 sống bằng sổ gạo, tem phiếu những năm đầu sau thống nhất; đầu thập niên 1980, cả nhà theo diện đoàn tụ của Chương trình Ra đi có trật tự, bay sang với người thân đã đi trước. |
| `chr:chr-g-baocap-odp-lylichdi` | C | Phim hành trình · dòng gia phả của hướng "Giữ kế hoạch hoá", chọn ở trong nước rồi cả nhà ra đi (odp, lylichDi) | Thế hệ 6 sống bằng sổ gạo, tem phiếu những năm đầu sau thống nhất; đầu thập niên 1980, cả nhà theo diện đoàn tụ của Chương trình Ra đi có trật tự, bay sang với nhánh đã xuống ghe năm 1978. |
| `chr:chr-g-doimoi-ly79di` | C | Phim hành trình · dòng gia phả của hướng "Đổi Mới", chọn ở trong nước rồi cả nhà ra đi (ly79Di) | Thế hệ 6 chờ ngày được làm ăn tự do, nhưng Đổi Mới còn xa; năm 1979, cả nhà nộp vàng đi “bán chính thức”, tới trại ở Hồng Kông rồi định cư ở Toronto. |
| `chr:chr-g-doimoi-vuotbien` | C | Phim hành trình · dòng gia phả của hướng "Đổi Mới", chọn ở trong nước rồi cả nhà ra đi (vuotbien) | Thế hệ 6 chờ ngày được làm ăn tự do, nhưng Đổi Mới còn xa; năm 1980, cả nhà bán hết, xuống ghe vượt biển, qua trại tị nạn rồi định cư ở xứ người. |
| `chr:chr-g-doimoi-vuotbien-lylichdi` | C | Phim hành trình · dòng gia phả của hướng "Đổi Mới", chọn ở trong nước rồi cả nhà ra đi (vuotbien, lylichDi) | Thế hệ 6 chờ ngày được làm ăn tự do, nhưng Đổi Mới còn xa; năm 1980, cả nhà còn lại theo đường người đi trước xuống ghe, qua trại tị nạn rồi định cư ở xứ người. |
| `chr:chr-g-doimoi-odp` | C | Phim hành trình · dòng gia phả của hướng "Đổi Mới", chọn ở trong nước rồi cả nhà ra đi (odp) | Thế hệ 6 chờ ngày được làm ăn tự do, nhưng Đổi Mới còn xa; đầu thập niên 1980, cả nhà theo diện đoàn tụ của Chương trình Ra đi có trật tự, bay sang với người thân đã đi trước. |
| `chr:chr-g-doimoi-odp-lylichdi` | C | Phim hành trình · dòng gia phả của hướng "Đổi Mới", chọn ở trong nước rồi cả nhà ra đi (odp, lylichDi) | Thế hệ 6 chờ ngày được làm ăn tự do, nhưng Đổi Mới còn xa; đầu thập niên 1980, cả nhà theo diện đoàn tụ của Chương trình Ra đi có trật tự, bay sang với nhánh đã xuống ghe năm 1978. |
| `end:baocap` | C | Kết luận · kết cục "Sổ gạo và công điểm" | Sổ gạo và công điểm. Đời thứ sáu giữ sổ gạo, công điểm qua những năm bao cấp. |
| `end:doimoi` | C | Kết luận · kết cục "Từ tem phiếu đến xưởng nhỏ" | Từ tem phiếu đến xưởng nhỏ. Đi qua chiến tranh và tem phiếu, rồi làm ăn sau Đổi Mới, như phần đông gia đình Việt Nam. |
| `epi:tran` | B | Kết luận · lời khép theo họ Trần | Trần là họ đông thứ hai (khoảng 11%); hai Chủ tịch nước sau Đổi Mới, Trần Đức Lương và Trần Đại Quang, cùng mang họ này. |
| `epi:le` | B | Kết luận · lời khép theo họ Lê | Lê là họ đông thứ ba (khoảng 9–10%); sau Đổi Mới có Chủ tịch nước Lê Đức Anh và Tổng Bí thư Lê Khả Phiêu. |

## Tôn giáo · 23 câu

Cần để ý: Cách tả xung đột tôn giáo, công bằng với các phía.

| Mã | Hạng | Chỗ hiện | Nguyên văn |
|---|---|---|---|
| `ev:dc54:s` | A | Chương 5 · trang sự kiện › Diễn biến · câu đầu (cũng hiện ở thẻ dưới bản đồ, trong tour) | Khoảng 800.000 đến 1 triệu người, phần lớn là giáo dân, rời Bắc vào Nam. Hàng chục nghìn người tập kết ra Bắc. |
| `ev:bx55:x` | B | Chương 5 · trang sự kiện › Diễn biến · đoạn thêm | Các giáo phái Cao Đài, Hoà Hảo lần lượt bị khuất phục. Chính quyền Diệm củng cố quyền lực. |
| `ev:qd63:t` | B | Chương 5 · trang sự kiện · tiêu đề, ngày, nơi chốn | Hoà thượng Thích Quảng Đức tự thiêu · 11.6.1963 · Sài Gòn |
| `ev:qd63:s` | B | Chương 5 · trang sự kiện › Diễn biến · câu đầu (cũng hiện ở thẻ dưới bản đồ, trong tour) | Hoà thượng tự thiêu tại ngã tư đường Phan Đình Phùng – Lê Văn Duyệt để phản đối chính sách tôn giáo. |
| `ev:qd63:x` | B | Chương 5 · trang sự kiện › Diễn biến · đoạn thêm | Bức ảnh của Malcolm Browne gây chấn động thế giới, khủng hoảng Phật giáo dẫn tới đảo chính. |
| `ev:qd63:v:vnch` | A | Chương 5 · trang sự kiện › Góc nhìn · Sử quan VNCH & hải ngoại | Biến cố làm rạn vỡ chế độ Đệ nhất Cộng hoà. |
| `ev:qd63:v:intl` | B | Chương 5 · trang sự kiện › Góc nhìn · Sử gia quốc tế | Hình ảnh định hình cách thế giới nhìn cuộc chiến. |
| `ev:dc63:s` | B | Chương 5 · trang sự kiện › Diễn biến · câu đầu (cũng hiện ở thẻ dưới bản đồ, trong tour) | Sau khủng hoảng Phật giáo, các tướng lĩnh lật đổ và sát hại anh em Diệm – Nhu. |
| `opt:thuba` | B | Điểm rẽ 5 (1954) · lựa chọn "Thành phần thứ ba" | Thành phần thứ ba (Phật giáo, trí thức hoà bình): Hoà hợp, trung lập, chấm dứt chiến tranh. |
| `fig:ntt` | B | Nhân vật · Nguyễn Trường Tộ | Nguyễn Trường Tộ (1830–1871), Nhà cải cách. Người Công giáo Nghệ An, từng sang Pháp và Ý. Dâng nhiều điều trần lên vua Tự Đức về giáo dục, kinh tế, quốc phòng. |
| `fig:tqd` | B | Nhân vật · Thích Quảng Đức | Thích Quảng Đức (1897–1963), Hoà thượng. Tự thiêu ngày 11.6.1963 tại Sài Gòn để phản đối chính sách tôn giáo của chính quyền Ngô Đình Diệm. |
| `fig:tvk` | B | Nhân vật · Trương Vĩnh Ký | Trương Vĩnh Ký (1837–1898), Học giả, nhà báo. Người Công giáo, thông thạo nhiều ngôn ngữ. Thông ngôn cho Pháp từ năm 1860, đứng đầu Gia Định báo từ năm 1869; năm 1886 ra Huế làm việc ở Cơ Mật viện theo đề nghị của Paul Bert. |
| `fig:hps` | A | Nhân vật · Huỳnh Phú Sổ | Huỳnh Phú Sổ (1920–1947), Người sáng lập Hoà Hảo. Khai đạo Phật giáo Hoà Hảo ở Châu Đốc năm 1939, lập Đảng Dân chủ Xã hội năm 1946. Mất tích ngày 16.4.1947 khi đi hoà giải xung đột Việt Minh – Hoà Hảo; được cho là bị Việt Minh giết. |
| `fig:ttq` | B | Nhân vật · Thích Trí Quang | Thích Trí Quang (1923–2019), Hoà thượng. Lãnh đạo phong trào Phật giáo năm 1963 ở Huế và Sài Gòn, rồi biến động miền Trung năm 1966. Sau đó bị quản thúc, lui về dịch kinh; mất tại chùa Từ Đàm, Huế, năm 2019. |
| `born:tqd` | B | Nhân vật · Thích Quảng Đức · dòng phụ dưới tên | Thích Quảng Đức: khai sinh Lâm Văn Tuất |
| `quiz:e5:0` | A | Câu đố chương 5 (sau sự kiện dc54) | Cuộc di cư 1954 đưa khoảng bao nhiêu người từ Bắc vào Nam? Đáp án: 800.000 – 1 triệu. Phần lớn là giáo dân; chiều ngược lại, khoảng 80.000 – 130.000 người tập kết ra Bắc. |
| `move:dc54:0` | B | Bản đồ "Cuộc di cư 1954" · đường 1 (Dân thường) | Giáo dân Phát Diệm, Bùi Chu đổ về Hải Phòng chờ tàu |
| `card:dc63:0` | C | Trò chơi · thẻ "Đảo chính lật đổ Ngô Đình Diệm" · lựa chọn 1 | Đi theo đoàn biểu tình Phật giáo: Nhà theo Phật. → Bị bắt một đêm, được thả sáng hôm sau. |
| `card:dc63:1` | C | Trò chơi · thẻ "Đảo chính lật đổ Ngô Đình Diệm" · lựa chọn 2 | Giữ im lặng: Nhà theo Công giáo hoặc không muốn lộ. → Sau đảo chính, mọi thứ lại đổi. |
| `card:tn76{flags=ditan+ly79Di+vuotbien+odp}:0` | C | Trò chơi · thẻ "Cộng hoà XHCN Việt Nam" khi dòng họ có cờ ditan, ly79Di, vuotbien, odp · lựa chọn 1 | Ở lại với hội thánh bảo trợ: Một hội thánh ở thị trấn nhỏ miền Trung Tây nước Mỹ đã bảo lãnh cả nhà ra khỏi trại tị nạn. → Hội thánh lo nhà, lo việc làm trong xưởng; cả nhà là người Việt duy nhất trong thị trấn. Mùa đông đầu tiên, tuyết ngập tới bậu cửa sổ. |
| `x:x-thonggia73` | A | Trò chơi · biến cố riêng "Đám cưới với nhà di cư" (gắn vào "Hiệp định Paris") | Đám cưới với nhà di cư. Gia đình người Bắc di cư từng ở nhờ nhà bạn hồi di cư 1954 – 1955 nay đã thành hàng xóm thân. Đầu năm 1973, Hiệp định Paris vừa ký, con trai nhà bạn và con gái nhà ấy xin cưới; nhà gái theo đạo Công giáo, như nhiều người di cư năm ấy. |
| `lore:ngo` | B | Trò chơi · gia phả mở đầu, họ Ngô | Ước tính khoảng 1,3% dân số. Ngô Quyền thắng trận Bạch Đằng năm 938, mở đầu kỷ nguyên độc lập; thế kỷ XX, dòng Ngô Đình gốc Quảng Bình, theo Công giáo nhiều đời, nắm chính quyền Sài Gòn từ 1954 đến 1963. |
| `lore:lam` | B | Trò chơi · gia phả mở đầu, họ Lâm | Họ Lâm (林) phổ biến ở người Hoa gốc Phúc Kiến, Triều Châu định cư Nam Bộ, đồng thời là họ lâu đời của người Kinh miền Trung. Hoà thượng Thích Quảng Đức có thế danh họ Lâm, sinh ở Khánh Hoà. |

## Giả định "Nếu…" và ước lượng % · 14 câu

Cần để ý: Mức A–D, % quy đổi và căn cứ; lời giả định không nói con đường nào "tốt hơn".

| Mã | Hạng | Chỗ hiện | Nguyên văn |
|---|---|---|---|
| `cf:method` | A | Kết luận · thẻ "Nếu…" · cách tính ước lượng | Mỗi giả định được nhóm soạn xếp một mức theo mức đồng thuận của giới sử học, kèm căn cứ: A, nhiều sử gia xem là cơ hội có thật (khoảng 1 trên 3); B, có cơ sở nhưng khó (khoảng 1 trên 5); C, rất khó trong bối cảnh ấy (khoảng 1 trên 20); D, gần như không thể (khoảng 1 trên 100). Trò chơi chỉ ước lượng ở điểm rẽ đầu tiên con đường của bạn rời lịch sử: sau đó các hướng "chiếm ưu thế" không còn là dữ kiện, nên không nhân tiếp. Đây là ước lượng để so sánh các giả định với nhau, không phải xác suất lịch sử. |
| `cf:chien` | A | Kết luận · thẻ "Nếu…" (nhãn "Giả định · không phải lịch sử") của hướng "Chủ chiến" | Nếu triều đình dồn sức chủ chiến (1858–1862). Huế dồn quân, dồn lương cho đại đồn Chí Hoà, rồi không ký Hoà ước Nhâm Tuất mà tiếp tục hậu thuẫn nghĩa quân Trương Định. Pháp khi ấy còn đánh ở Trung Hoa (1860) và Mexico (1861–1867), nên việc chiếm Nam Kỳ có thể kéo dài và tốn kém hơn. Nhưng chênh lệch súng đạn, tàu chiến rất lớn: cái giá có thể là thêm nhiều trận như Chí Hoà, chưa chắc là giữ được đất. Căn cứ: Chênh lệch vũ khí rất lớn; nhà Thanh, lớn hơn nhiều, vẫn thua hai cuộc chiến tranh Nha phiến. Mức C: khoảng 5% (1 trên 20). |
| `cf:canhtan` | A | Kết luận · thẻ "Nếu…" (nhãn "Giả định · không phải lịch sử") của hướng "Canh tân" | Nếu triều đình nghe Nguyễn Trường Tộ. Từ thập niên 1860, Huế mở trường kỹ nghệ, gửi người đi học, đóng tàu như các bản điều trần xin. Xiêm cải cách cùng thời và giữ được độc lập, một phần nhờ nằm giữa hai đế quốc; Đại Nam thì đã có quân Pháp ở Nam Kỳ. Cải cách có thể giúp triều đình mạnh hơn khi thương thuyết, nhưng giữ được độc lập hay không vẫn là câu hỏi mở. Căn cứ: Xiêm cải cách cùng thời và giữ được độc lập, một phần nhờ là vùng đệm giữa Anh và Pháp. Mức B: khoảng 20% (1 trên 5). |
| `cf:canvuong` | A | Kết luận · thẻ "Nếu…" (nhãn "Giả định · không phải lịch sử") của hướng "Cần Vương" | Nếu Cần Vương giữ được vua Hàm Nghi. Vua Hàm Nghi không bị bắt năm 1888; Hương Khê, Ba Đình, Bãi Sậy phối hợp được với nhau. Nghĩa quân có thể giữ một vùng núi lâu hơn, như Hoàng Hoa Thám giữ Yên Thế tới năm 1913. Nhưng thiếu súng, thiếu hậu phương và thiếu một chương trình ngoài khôi phục ngai vàng, con đường ấy khó thành một nước độc lập trong thế kỷ XIX. Căn cứ: Các cuộc khởi nghĩa rời rạc, thiếu vũ khí và hậu phương; Yên Thế trụ tới năm 1913 nhưng chỉ ở một vùng. Mức C: khoảng 5% (1 trên 20). |
| `cf:dongdu` | A | Kết luận · thẻ "Nếu…" (nhãn "Giả định · không phải lịch sử") của hướng "Đông Du" | Nếu Nhật không trục xuất du học sinh Đông Du. Nhật không thoả thuận với Pháp năm 1907, khoảng hai trăm du học sinh Đông Du học xong trường võ bị. Phong trào có thể có một lớp sĩ quan riêng sớm hơn hàng chục năm; nhưng dựa vào Nhật cũng có giá, như cả Đông Nam Á đã thấy khi quân Nhật vào Đông Dương năm 1940. Căn cứ: Hiệp ước Pháp – Nhật năm 1907; lợi ích của Nhật khi ấy gắn với Pháp hơn với phong trào. Mức C: khoảng 5% (1 trên 20). |
| `cf:duytan` | A | Kết luận · thẻ "Nếu…" (nhãn "Giả định · không phải lịch sử") của hướng "Duy Tân" | Nếu Đông Kinh Nghĩa Thục không bị đóng cửa. Trường không bị đóng cuối năm 1907, phong trào chống thuế ở Trung Kỳ năm 1908 không bị đàn áp; hội buôn, trường học, báo quốc ngữ lan khắp ba kỳ. Một tầng lớp trí thức và thương nhân lớn hơn có thể đòi tự trị từng bước, như Ấn Độ hay Philippines đã đi. Nhưng con đường ấy phụ thuộc vào chính quyền thuộc địa, vốn hiếm khi nhượng bộ. Căn cứ: Các phong trào tự trị từng bước có thật ở Ấn Độ, Philippines; nhưng chính quyền thuộc địa Pháp ít nhượng bộ. Mức B: khoảng 20% (1 trên 5). |
| `cf:qdd` | A | Kết luận · thẻ "Nếu…" (nhãn "Giả định · không phải lịch sử") của hướng "Quốc dân đảng" | Nếu Việt Nam Quốc dân đảng không tan vỡ sau Yên Bái. Cuộc khởi nghĩa tháng 2.1930 không nổ ra vội vã, lãnh đạo không bị xử chém hàng loạt. Năm 1945 có thể có một đảng dân tộc không cộng sản đủ mạnh để tranh quyền lãnh đạo, với hậu thuẫn của Trung Hoa Dân Quốc. Kết quả khó đoán: có thể là một nhà nước khác, cũng có thể là một cuộc nội chiến sớm hơn giữa những người cùng chống Pháp. Căn cứ: Lãnh đạo Việt Nam Quốc dân đảng bị xử tử năm 1930; khi trở về năm 1945–1946, lực lượng phụ thuộc quân Trung Hoa Dân Quốc. Mức C: khoảng 5% (1 trên 20). |
| `cf:laphien` | A | Kết luận · thẻ "Nếu…" (nhãn "Giả định · không phải lịch sử") của hướng "Lập hiến" | Nếu Pháp chấp nhận một lộ trình tự trị. Paris giữ các hứa hẹn cải cách, mở rộng Hội đồng Quản hạt, cho người Việt lập đảng, ra báo. Một lộ trình như Philippines (được Mỹ hẹn trả độc lập năm 1934, trao năm 1946) có thể bớt đổ máu. Nhưng Pháp khi ấy nhượng bộ rất ít, và nhiều sử gia cho rằng chính sự đóng cửa ấy đã đẩy thế hệ trẻ sang con đường cách mạng. Căn cứ: Pháp nhượng bộ rất ít suốt thập niên 1920–1930; nhiều sử gia coi sự đóng cửa ấy là một nguyên nhân đẩy giới trẻ sang cách mạng. Mức D: khoảng 1% (1 trên 100). |
| `cf:qg` | A | Kết luận · thẻ "Nếu…" (nhãn "Giả định · không phải lịch sử") của hướng "Giải pháp Bảo Đại" | Nếu Pháp trao độc lập trọn vẹn cho Quốc gia Việt Nam. Năm 1949 Pháp trao cho chính phủ Bảo Đại độc lập thật sự, cả quân đội, ngoại giao, tài chính, thay vì "độc lập trong Liên hiệp Pháp". Một nhà nước quốc gia có thực quyền có thể thu hút nhiều người trung dung hơn; nhưng Việt Minh khi ấy đã giữ nhiều vùng nông thôn và có hậu phương mới ở Trung Quốc, nên chiến tranh nhiều khả năng vẫn tiếp diễn. Căn cứ: Độc lập năm 1949 bị giới hạn về quân đội, ngoại giao, tài chính; từ năm 1950 Việt Minh có hậu phương Trung Quốc. Mức C: khoảng 5% (1 trên 20). |
| `cf:tl` | A | Kết luận · thẻ "Nếu…" (nhãn "Giả định · không phải lịch sử") của hướng "Đứng ngoài" | Nếu chiến tranh không nổ ra cuối năm 1946. Hiệp định Sơ bộ 6.3.1946 và Tạm ước 14.9.1946 được giữ; vụ Hải Phòng tháng 11 và đêm 19.12 không xảy ra. Việt Nam có thể đi tới độc lập qua thương lượng trong vài năm, như nhiều thuộc địa khác sau Thế chiến, và những người chỉ mong giữ làng sẽ không phải sống giữa vùng xôi đậu. Nhưng cả hai phía đều có người không muốn nhượng bộ, nên đây là một khả năng mong manh. Căn cứ: Hiệp định Sơ bộ 6.3.1946 và Tạm ước 14.9.1946 có thật; cả hai phía đều có người muốn và người không muốn thoả hiệp. Mức B: khoảng 20% (1 trên 5). |
| `cf:nam` | A | Kết luận · thẻ "Nếu…" (nhãn "Giả định · không phải lịch sử") của hướng "Miền Nam — VNCH" | Nếu Việt Nam Cộng hoà đứng vững sau 1973. Viện trợ Mỹ không bị cắt giảm mạnh năm 1974, Ban Mê Thuột giữ được, lằn ranh của Hiệp định Paris kéo dài. Đất nước có thể bị chia cắt lâu dài như bán đảo Triều Tiên: hai nhà nước, một đường ranh quân sự và những gia đình ly tán qua nhiều thế hệ. Phần đông sử gia cho rằng sau năm 1973 khả năng này đã rất thấp. Căn cứ: Viện trợ Mỹ giảm mạnh năm 1974; phần đông sử gia cho rằng sau năm 1973 cán cân đã nghiêng hẳn. Mức C: khoảng 5% (1 trên 20). |
| `cf:thuba` | A | Kết luận · thẻ "Nếu…" (nhãn "Giả định · không phải lịch sử") của hướng "Thành phần thứ ba" | Nếu Hội đồng Hoà giải và Hoà hợp Dân tộc ra đời. Hiệp định Paris 1973 được thực thi đúng chữ: một Hội đồng Quốc gia Hoà giải và Hoà hợp Dân tộc ba thành phần ra đời, trong đó có những người như dòng họ bạn, và đứng ra tổ chức tổng tuyển cử. Thống nhất có thể đến qua thương lượng, như Lào từng thử với các chính phủ liên hiệp. Nhưng cả hai bên đều không thực sự muốn chia quyền, và các chính phủ liên hiệp ở Lào cũng không bền. Căn cứ: Điều 12 Hiệp định Paris 1973 dự liệu hội đồng ba thành phần; không bên nào thực thi. Các chính phủ liên hiệp ở Lào (1962, 1974) đều không bền. Mức D: khoảng 1% (1 trên 100). |
| `cf:baocap` | A | Kết luận · thẻ "Nếu…" (nhãn "Giả định · không phải lịch sử") của hướng "Giữ kế hoạch hoá" | Nếu không có Đổi Mới năm 1986. Đại hội VI giữ nguyên kế hoạch hoá tập trung; không có Khoán 10, không có Luật Đầu tư nước ngoài năm 1987. Lạm phát hàng trăm phần trăm của năm 1986 có thể kéo dài, như ở những nền kinh tế kế hoạch không cải cách. Nhưng "khoán chui" đã có từ những năm 1960 ở nhiều hợp tác xã, nên sức ép đổi mới từ dưới lên khó mà chặn lâu. Căn cứ: Lạm phát năm 1986 thường được dẫn là khoảng 775%; "khoán chui" đã có từ thập niên 1960 và Khoán 100 từ năm 1981. Mức C: khoảng 5% (1 trên 20). |
| `cf:radi` | A | Kết luận · thẻ "Nếu…" (nhãn "Giả định · không phải lịch sử") của hướng "Ra đi" | Nếu Việt Nam và Mỹ bình thường hoá quan hệ từ 1977–1978. Các cuộc đàm phán Việt – Mỹ năm 1977–1978 thành công thay vì bế tắc vì chuyện viện trợ, Campuchia và Trung Quốc. Cấm vận có thể được dỡ sớm hơn mười lăm năm, kiều hối và đường di cư hợp pháp mở sớm hơn, và có lẽ ít người phải liều mạng trên biển. Thực tế, khoảng 800.000 thuyền nhân Việt Nam đã tới các trại tị nạn trong hai thập niên sau năm 1975 (số của UNHCR), và không ai biết chính xác bao nhiêu người không tới. Căn cứ: Đàm phán Việt – Mỹ 1977–1978 có thật và từng tiến gần thoả thuận; Mỹ gác lại để ưu tiên quan hệ với Trung Quốc. Mức B: khoảng 20% (1 trên 5). |
