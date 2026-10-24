# Vietnamese Historical Maps Interactive

_Started 2026-10-18 09:20 UTC_

---

## User

Design a mobile app for Cảm hứng bản đồ Việt Nam, từ thời Pháp thuộc tới nay. Có timeline, kéo càng tiến về hiện đại thì sẽ thấy line biên giới thay đổi, kèm sử liệu công khai, chính thống, kèm các sự kiện, trận đánh, quan điểm. Mới vào app là kiểu như chơi game, chọn quan điểm lý tưởng, ví dụ hồi đó là 1954 đi, lý tưởng Cộng Sản hay là Cộng Hoà, hay Trung Lập, chọn theo hướng nào thì thấy diễn biến theo hướng đó. Kết luận.

## Assistant



## Assistant

_[tool: ask_user]_

Trước khi bắt đầu thiết kế, tôi cần bạn trả lời vài câu trong form: đối tượng người dùng, mốc bắt đầu timeline, các điểm chọn lý tưởng, cách kết luận, giọng văn và những màn hình cần có.

## User

Answered — audience: Người lớn yêu lịch sử, Du khách / kiều bào; range: 1858 (Pháp đánh Đà Nẵng) → nay; branches: Mỗi giai đoạn lớn đều có lựa chọn; ending: Mọi nhánh hội tụ về lịch sử thực, so sánh với lựa chọn của bạn; tone: Game hoá; screens: Onboarding chọn lý tưởng, Bản đồ + timeline kéo, Chi tiết sự kiện / trận đánh, Kho sử liệu (nguồn), So sánh quan điểm, Màn kết luận, Hồ sơ / tiến trình; variations: 1 prototype hoàn chỉnh, có tweaks; lang: Tiếng Việt

## Assistant



## Assistant

_[tool: ask_user]_

Còn thiếu phong cách hình ảnh và cách tô màu các phe. Bạn chọn xong là tôi dựng.

## User

Answered — vibe: Bản đồ cổ / giấy ngả vàng, mực nâu, chữ serif — như hồ sơ lưu trữ; factions: Màu theo cờ lịch sử của từng phe

## Assistant

_[tool: read_skill_prompt]_

_[tool: update_todos]_

_[tool: set_project_title]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: str_replace_edit]_

_[tool: show_html]_

_[tool: multi_screenshot]_

_[tool: show_html]_

_[tool: multi_screenshot]_

_[tool: eval_js]_

_[tool: run_script]_

_[tool: run_script]_

_[tool: show_html]_

_[tool: multi_screenshot]_

_[tool: eval_js]_

_[tool: ready_for_verification]_

Đã dựng xong prototype **Dư Đồ** (`Du Do App.html`), đang chờ kiểm tra lần cuối.

- **Luồng chơi:** màn mở đầu → hướng dẫn và bút danh → 6 điểm rẽ (1858, 1885, 1930, 1945, 1954, 1976). Ở mỗi điểm rẽ, dòng thời gian dừng lại và bạn chọn một trong ba lý tưởng. Sau đó hiện "con đường của bạn" và bản đồ tô đậm phe bạn đã chọn.
- **Bản đồ:** dùng dữ liệu địa lý thật. Màu từng vùng đổi theo cờ của các chính thể: Đại Nam, thuộc địa và xứ bảo hộ Pháp, Đông Dương, thời có quân Nhật, vùng tranh chấp, vĩ tuyến 17, VNCH, CH miền Nam VN, rồi thống nhất. Bản đồ có thêm Hoàng Sa và Trường Sa.
- **Nội dung:** 41 sự kiện, mỗi sự kiện có 3 tab: Diễn biến, Quan điểm, Sử liệu. Góc nhìn gần với lựa chọn của bạn được đặt lên đầu. Kho có 20 sử liệu công khai, tìm và lọc được.
- **Hồ sơ và kết luận:** Hồ sơ cho biết tiến trình và tuýp nhân vật của bạn. Màn kết luận so từng lựa chọn của bạn với hướng đã chiếm ưu thế trong lịch sử thật.
- **Tweaks:** đổi màu theo cờ hoặc mực nâu, bật/tắt vân giấy, đường biên hiện nay, lưới kinh–vĩ độ. Có nút nhảy nhanh tới từng màn.

**Lưu ý:**
- Ranh giới giữa Bắc Kỳ, Trung Kỳ và Nam Kỳ chỉ là minh hoạ gần đúng, cắt theo vĩ độ. Muốn chính xác cần dữ liệu ranh giới lịch sử.
- Các mốc thời gian và số liệu trong sự kiện nên được người làm sử rà soát lại trước khi phát hành.

## User

Thấy hay hay rồi đó, bản đồ dùng bản đồ gì hấp dẫn hơn được không, hehe

## Assistant

_[tool: read_file]_

_[tool: run_script]_

_[tool: show_html]_

_[tool: multi_screenshot]_

_[tool: run_script]_

_[tool: ready_for_verification]_

Bản đồ giờ mặc định theo phong cách bản đồ cổ khắc in, đang chờ kiểm tra lần cuối:
- **Đường nước quanh bờ biển:** các vòng đồng tâm toả ra từ bờ, kiểu bản đồ hải đồ xưa.
- **Nét vẽ tay:** đường bờ hơi run và không đều, như khắc bằng tay. Nét này cũng che bớt việc dữ liệu nền khá thô.
- **Viền màu đậm dần về phía biên giới**, như bản đồ tô màu nước.
- **Khung viền** có vạch đen trắng xen kẽ theo từng độ, kèm nhãn kinh độ và vĩ độ.
- **Hoa la bàn** trên Biển Đông, góc dưới trái có ô **nhãn ghi năm**, đổi theo dòng thời gian.

Trong Tweaks có thêm mục **Kiểu bản đồ** để chuyển qua lại giữa Cổ điển và Phẳng (bản cũ).

Muốn đẹp hơn nữa thì có thể thêm sông Hồng, sông Mekong và địa hình đồi núi. Tôi chưa làm vì phải nạp thêm dữ liệu địa lý từ nguồn khác.

## User

Tôi cảm thấy vibe chưa ổn, còn hướng khác không?

## Assistant



## Assistant

_[tool: run_script]_

_[tool: show_html]_

_[tool: multi_screenshot]_

_[tool: ready_for_verification]_

_[tool: ask_user]_

Tôi đã làm thêm 2 hướng mới, ngoài bản Lưu trữ đang có. Bạn mở cả 3 bản trong form và chọn một:
- **Lưu trữ:** giữ như bản hiện tại, giấy ngả vàng, nét bản đồ khắc tay.
- **Chiến lược:** nền tối như bàn chỉ huy, số năm to màu hổ phách, đường biên phát sáng, quanh bờ biển có vòng sóng như màn radar.
- **Áp phích:** phong cách áp phích cổ động, chữ không chân rất đậm và viết hoa, khung viền đen dày, bóng đổ khối, biển chấm in lưới.

Bản chính `Du Do App.html` có thêm mục Phong cách trong Tweaks để chuyển qua lại giữa ba hướng. Ba bản này mới chạy được nhưng tôi chưa xem lại trên màn hình; bước kiểm tra tự động đang chạy và sẽ báo nếu có lỗi.

## User

Found issues — fixing…

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

Tôi đã sửa lỗi ở bản Chiến lược (nền tối): trước đó chữ ở màn chọn lý tưởng, chi tiết sự kiện, sử liệu và thanh trạng thái bị tối gần như trùng màu nền. Giờ mỗi phong cách dùng đúng màu chữ của mình. Bản đã sửa đang được kiểm tra lại, chưa có kết quả.

Bạn vẫn chọn hướng ưng ý trong form nhé.

## User

Found issues — fixing…

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

Tôi đã sửa lỗi bản đồ khó đọc ở bản Chiến lược (nền tối) khi dùng màu "Mực nâu": các phe giờ có tông nâu sáng hơn, không còn lẫn vào nền đất tối. Bản sửa đang được kiểm tra lại, chưa có kết quả.

Bạn vẫn chọn hướng ưng ý trong form nhé.

## User

Answered — theme: Du Do - Chien luoc.html

## Assistant

_[tool: run_script]_

_[tool: delete_file]_

_[tool: ready_for_verification]_

`Du Do App.html` giờ mặc định dùng phong cách **Chiến lược**. Tôi đã xoá 3 file mẫu so sánh, chỉ giữ lại một file chính. Hai hướng Lưu trữ và Áp phích vẫn chuyển được trong Tweaks.

Nếu app vẫn hiện giao diện cũ (do lựa chọn lần trước còn lưu trong trình duyệt), bạn bấm "Chiến lược" trong Tweaks là được.

## User

OK ngon lành rồi đó, giờ phần nội dung, UX ngon lành hơn

## Assistant



## Assistant

_[tool: ask_user]_

Tôi đang chờ bạn chọn trong form: muốn thêm gì về gameplay, nội dung, ưu tiên phần nào và giọng kể ra sao.

## User

Answered — ux: Bản đồ zoom/kéo được, chạm vào vùng để xem phe, Điểm rẽ có hệ quả thật: lựa chọn đổi sự kiện & lời kể kế tiếp, Chỉ số nhân vật (Sinh mạng · Độc lập · Tự do · Đoàn kết) thay đổi theo lựa chọn, Nhân vậ…; content: Thêm sự kiện (đích ~80), Ảnh tư liệu thật (placeholder để bạn thả ảnh), Trích nguyên văn ngắn từ văn kiện, Số liệu thương vong / dân số theo từng mốc, Thêm quan điểm Liên Xô, Nhật, Lào, Campuchia, Ra…; priority: Cân bằng; neutral: Trung lập tuyệt đối

## Assistant

_[tool: run_script]_

_[tool: run_script]_

_[tool: copy_starter_component]_

_[tool: write_file]_

_[tool: run_script]_

_[tool: write_file]_

_[tool: ready_for_verification]_

Bản nâng cấp nằm ở **Du Do v2.html**; bản cũ vẫn giữ nguyên. Bản này đang được kiểm tra tự động, chưa có kết quả.

**Gameplay mới:**
- **Dòng họ sáu thế hệ.** Mỗi điểm rẽ mở bằng một đoạn "Gia đình bạn", viết khác nhau tuỳ lựa chọn của đời trước. Mỗi lựa chọn mở thêm 2 trang nhật ký dòng họ trên dòng thời gian (hư cấu, ghi rõ là hư cấu).
- **Bốn chỉ số Độc lập, Sinh mạng, Tự do, Đoàn kết** chạy dưới số năm. Chỉ số cộng theo điều mỗi lực lượng tự tuyên bố theo đuổi, không chấm đúng sai.
- **Nhân vật lịch sử:** mỗi lựa chọn có một người đồng hành, hiện ở góc màn hình. Thêm tab **Nhân vật** với 22 tiểu sử, có ô thả ảnh chân dung.
- **Đố nhanh:** 2 câu sau mỗi chương, tổng 12 câu, bỏ qua được.
- **Huy hiệu:** 15 cái, hiện thông báo kèm âm thanh khi mở khoá.
- **Âm thanh và rung:** tiếng cồng ở điểm rẽ, tiếng tích khi kéo qua sự kiện. Bật/tắt trong Hồ sơ.
- **Thẻ chia sẻ:** tạo ảnh kết quả, tải về hoặc chia sẻ thẳng.

**Bản đồ:**
- Phóng to, kéo được, có nút + − ⟲.
- Chạm vào một tỉnh sẽ hiện vùng ("Bắc Kỳ", "Miền Nam"…) và phe kiểm soát năm đó.
- **Ranh giới ba kỳ** giờ ghép theo địa giới tỉnh thật, không cắt theo vĩ độ nữa. Có tách 3 tỉnh miền Đông (mất năm 1862) và 3 tỉnh miền Tây Nam Kỳ (mất năm 1867). Quảng Trị được cắt đúng tại vĩ tuyến 17.
- Lọc sự kiện theo loại: Trận đánh, Hiệp ước, Chính trị, Xã hội, Nhật ký.

**Nội dung:**
- Từ 41 lên 90 sự kiện, có thêm góc nhìn Liên Xô, Nhật Bản, Lào, Campuchia.
- Có trích nguyên văn ngắn từ văn kiện; bản nào dịch thì ghi "(dịch)".
- Có số liệu thương vong ước tính, ghi rõ "tuỳ nguồn", và dân số theo từng mốc.
- Mỗi sự kiện có ô để bạn thả ảnh tư liệu.

**Lưu ý:**
- Ranh giới ba kỳ ghép theo tỉnh hiện nay, nên vẫn chỉ gần đúng với địa giới thời Pháp.
- Số liệu thương vong và các đoạn trích nên được người làm sử rà soát trước khi phát hành.

## User

OK, mỗi khi chọn xong là kiểu zoom tour vậy, chạy một lèo, timeline nhìn xấu, cải thiện, bản đồ thì phải fixed border ở ngoài, đừng nhảy ra nhảy vô, mọi thứ ok, độc lập sinh mạng tự do đoàn kết thanh đó cũng được mà làm nhìn lean lại đi, đang cảm giác chữ chen chúc quá, ngộp.

## Assistant

_[tool: run_script]_

_[tool: grep]_

_[tool: run_script]_

_[tool: ready_for_verification]_

Tôi đã sửa xong trong `Du Do v2.html`, đang chờ kiểm tra tự động:

- **Tour tự chạy:** chọn xong ở điểm rẽ, bấm "▶ Xem chương diễn ra". Bản đồ bay tới từng sự kiện (tối đa 8, ưu tiên nhật ký dòng họ, trận đánh, hiệp ước), mỗi sự kiện dừng khoảng 3 giây. Hết chương thì thu về toàn cảnh và mở luôn câu đố, rồi tới điểm rẽ kế tiếp. Có nút "Tới điểm rẽ ›" và "Dừng". Nút ▶ cạnh dòng thời gian cũng chạy tour. Kéo bản đồ hoặc kéo dòng thời gian là tour tự dừng.
- **Dòng thời gian:** 6 đoạn mảnh theo 6 chương. Chương đang xem có màu nhấn, chương đã chọn màu tối hơn. Sự kiện là vạch nhỏ, nhật ký dòng họ là vạch màu. Con trỏ gọn, chỉ còn 5 mốc năm.
- **Khung bản đồ cố định:** khung viền bo góc, chiều cao các hàng xung quanh đều cố định nên bản đồ không còn co giãn. Viền trang trí kiểu cổ đã bỏ.
- **Bớt chật chữ:**
  - Bốn chỉ số còn một hàng mảnh, kèm số điểm.
  - Người đồng hành chuyển lên góc phải phần đầu trang (avatar nhỏ và lựa chọn của bạn).
  - Dòng lọc sự kiện thu vào nút ≡ trên bản đồ.
  - Dân số thành nhãn nhỏ ở góc bản đồ.
  - Chú giải chỉ một dòng.
  - Thẻ sự kiện cao cố định, tiêu đề một dòng.

## User

Rất hay, tiếp là zoom tới vùng nào, sự kiện nào, làm nổi bật lên, hehe. Và được phép chọn xem hình ảnh thực tế, liên hệ ảnh thực tế (nếu có, ở wikipedia chắc nhiều) hoặc các video free từ thời xưa, Critical Past hay gì đó.

## Assistant

_[tool: grep]_

_[tool: web_search]_

_[tool: snip]_

_[tool: grep]_

_[tool: run_script]_

_[tool: ready_for_verification]_

Tôi đã thêm phần nổi bật vùng và tư liệu thật vào `Du Do v2.html`; bản kiểm tra tự động đang chạy, nên chưa chắc ảnh từ Wikipedia đã tải đúng cho mọi sự kiện.

**Nổi bật khi tour bay tới sự kiện**
- Mức phóng to tính theo kích thước tỉnh (hoặc nước Lào, Campuchia) chứa sự kiện, nên tỉnh nhỏ được phóng to hơn tỉnh lớn.
- Tỉnh đó được tô màu nhấn và viền sáng.
- Phần còn lại của bản đồ tối đi, chỉ để một vùng tròn sáng quanh sự kiện.
- Trên bản đồ hiện một nhãn nhỏ: loại sự kiện, năm và tên sự kiện.
- Hết tour hoặc bấm Dừng thì mọi thứ trở lại bình thường.

**Ảnh và phim thật**
- **Ảnh đầu trang:** mỗi sự kiện tự lấy ảnh chính từ bài Wikipedia tiếng Việt, có ghi nguồn Wikimedia Commons. Bạn vẫn kéo thả ảnh riêng để thay được.
- **Tab mới "Ảnh & phim":**
  - Đoạn tóm tắt Wikipedia và link "Đọc bài".
  - Lưới ảnh và video từ bài viết. Chạm vào để xem toàn màn hình; video phát ngay trong app.
  - Nút mở CriticalPast (cho sự kiện từ năm 1895), Internet Archive và Wikimedia Commons, tìm sẵn theo tên bài Wikipedia tiếng Anh.

**Cần biết**
- Tôi gán sẵn bài Wikipedia cho khoảng 60 sự kiện. Các sự kiện còn lại dùng kết quả tìm kiếm tự động nên có thể không khớp.
- Phần này cần mạng. Video lịch sử trên Commons khá ít; CriticalPast chỉ mở bằng link vì không cho nhúng vào app.

## User

Found issues — fixing…

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

Tôi đã sửa thanh tab ở trang chi tiết sự kiện: tên tab rút gọn còn "Diễn biến · Góc nhìn · Ảnh, phim · Nguồn" và không bị xuống dòng nữa. Đoạn tóm tắt Wikipedia giờ chỉ hiện tối đa 4 dòng; muốn đọc đủ thì bấm "Đọc bài ↗".

## User

Bắt đầu thấy hay hay rồi đó, có giọng đọc thuần sử không, haha

## Assistant

_[tool: run_script]_

_[tool: run_script]_

_[tool: ready_for_verification]_

Đã thêm giọng đọc kiểu thuyết minh phim tư liệu: đọc chậm, giọng hơi trầm. Giọng đọc dùng sẵn giọng tiếng Việt có trong máy. Bản này đang được kiểm tra tự động, chưa nghe thử thực tế.

- **Trong tour:** mỗi sự kiện được đọc theo mẫu "Năm 1954. Điện Biên Phủ. …". Tour đợi đọc xong mới bay sang sự kiện kế. Nút "Giọng" trên thanh tour bật/tắt nhanh.
- **Ở điểm rẽ:** sau tiếng cồng, app đọc câu hỏi của điểm rẽ.
- **Trong chi tiết sự kiện:** nút "▶ Nghe" đọc cả phần tóm tắt lẫn diễn biến.
- **Cài đặt** (tab Hồ sơ): bật/tắt giọng đọc, chọn tốc độ Chậm, Vừa hoặc Nhanh. Trong Tweaks cũng có nút bật/tắt.

Lưu ý:
- **Giọng phụ thuộc máy.** Mac/iPhone có sẵn giọng "Linh". Chrome trên Android và Windows thường có giọng Google Tiếng Việt. Máy nào chưa có giọng tiếng Việt thì app báo, còn tour vẫn chạy như cũ.
- **Muốn giọng thật** do người đọc hoặc giọng AI cao cấp, nhất quán trên mọi máy, cần thu sẵn file âm thanh cho từng sự kiện. Tôi có thể chuẩn bị kịch bản đọc nếu bạn muốn.

## User

OK, khi xem hình thì swipe qua lại được, zoom to nhỏ được nha. Các sự kiện có video hay hình ảnh gì bấm phát lên coi được luôn nha, nếu kéo hình từ Wikipedia về mà die là hạn chế, phải hiển thị placeholder nha, không để user thấy là hình die nha.

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

Tôi đã làm lại trình xem ảnh, phát video ngay trong app và xử lý ảnh lỗi. Bản này đang được kiểm tra tự động, chưa có kết quả.

**Trình xem ảnh toàn màn hình**
- Vuốt trái/phải để chuyển ảnh. Ngoài ra có nút ‹ › và phím mũi tên.
- Phóng to bằng cách chụm hai ngón, chạm đúp hoặc lăn chuột. Khi đã phóng to thì kéo để di chuyển ảnh.
- Vuốt xuống để đóng.
- Có số thứ tự ảnh, chú thích và link "Nguồn ↗" tới trang giấy phép trên Commons.

**Xem tư liệu ngay ở tab Diễn biến**
- Một dải ảnh nhỏ hiện ngay trong tab; video có dấu ▶. Chạm vào là mở trình xem.
- Ảnh đầu trang có nút ⤢ để xem lớn.
- Video bấm ▶ là phát luôn trong trình xem.

**Không để lộ ảnh lỗi**
- Ảnh đầu trang được tải thử trước, chỉ hiện khi tải được. Ảnh nào lỗi thì app tự thử ảnh kế tiếp; hết ảnh thì giữ ô "Thả ảnh tư liệu vào đây".
- Ảnh nhỏ nào lỗi sẽ thành ô sọc "ẢNH TƯ LIỆU" và bị loại khỏi trình xem.
- Nếu một ảnh hoặc video lỗi ngay trong trình xem, ô thay thế hiện "Tư liệu tạm thời không tải được" kèm link mở trên Commons.

## User

Found issues — fixing…

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

Tôi đã sửa hai lỗi ở trình xem ảnh:
- **Ảnh chính bị lặp:** ảnh đầu bài Wikipedia không còn hiện hai lần trong dải ảnh, lưới ảnh và trình xem nữa.
- **Chú thích lộ tiền tố:** chú thích không còn hiện "Tập tin:" ở đầu, chỉ còn tên ảnh.

Tôi chưa cho chạy kiểm tra tự động sau lần sửa này; trang đã mở được và không có lỗi console.

## User

Tất cả Nhân vật phải có ảnh chân dung. Và đúng ý tôi, phải mở đúng các trạm mới mở được Nhân vật. Còn không là mờ.

## Assistant

_[tool: run_script]_

_[tool: run_script]_

_[tool: ready_for_verification]_

Tôi đã làm xong chân dung và mở khoá theo chương; bản này đang được kiểm tra tự động, chưa có kết quả.

**Chân dung**
- Ảnh của cả 22 nhân vật được lấy từ Wikipedia tiếng Việt trong một lần tải.
- Ảnh hiện ở mọi chỗ có nhân vật: góc đồng hành, tab Nhân vật, thẻ tiểu sử và màn kết quả sau khi chọn.
- Ảnh nào không tải được thì giữ chữ viết tắt tên, không hiện ảnh lỗi. Trong thẻ tiểu sử, bạn vẫn kéo thả ảnh riêng để thay được.

**Mở khoá theo chương**
- Tab Nhân vật chia theo 6 chương. Nhân vật của chương nào chỉ mở khi dòng họ bạn đã qua điểm rẽ của chương đó.
- Nhân vật chưa mở có ảnh mờ và đen trắng, tên cùng vai trò cũng mờ, dòng dưới ghi "Chưa mở". Chạm vào chỉ hiện thông báo "mở khi đi qua điểm rẽ n · năm".
- Sau mỗi lựa chọn, màn kết quả hiện "Mở khoá n nhân vật" kèm chân dung, chạm để đọc tiểu sử.
- Huy hiệu "Người kết giao" giờ tính theo số nhân vật đã mở, không còn đạt được chỉ bằng cách bấm xem.

## User

Found issues — fixing…

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

Tôi đã bổ sung cách tìm ảnh cho 2 nhân vật còn thiếu chân dung là Nguyễn Trường Tộ và Nguyễn Văn Linh; bản này đang được kiểm tra tự động.

App giờ tìm ảnh lần lượt qua ba nguồn: Wikipedia tiếng Việt, rồi Wikipedia tiếng Anh, rồi Wikimedia Commons. Nguyễn Văn Linh sẽ có ảnh từ Wikipedia tiếng Anh. Nguyễn Trường Tộ không có ảnh trên cả hai trang Wikipedia nên lấy kết quả tìm kiếm trên Commons, có thể không đúng chân dung ông. Nếu cả ba nguồn đều không có, app vẫn hiện chữ viết tắt tên.

## User

Found issues — fixing…

## User

Found issues — fixing…

## User

OK, ra link tui chơi trên mobile xem.

## Assistant

_[tool: run_script]_

_[tool: super_inline_html]_

_[tool: get_public_file_url]_

Link chơi trên điện thoại (hết hạn sau khoảng 1 giờ):

https://db0e3866-32e0-4c36-b219-d9d98d37b249.claudeusercontent.com/v1/design/projects/db0e3866-32e0-4c36-b219-d9d98d37b249/serve/Du%20Do%20mobile.html?t=13ef9657bb662f241ec90e93f847a8d840a0bc82d8f16387bfdc4c00f85335f6.329ccede-23fd-4b10-988d-8a3c503e07a3.80eab04c-05a3-486f-99d8-c273f6d3be53.1792338477.fp&direct=1

Tôi đã gộp mọi thứ vào một file duy nhất (`Du Do mobile.html`). Trên điện thoại, app hiện toàn màn hình, không có khung máy giả, và tự chừa chỗ cho tai thỏ và thanh điều hướng. Tôi chưa mở thử link này trên điện thoại thật.

- **Cần mạng:** nền bản đồ, ảnh, chân dung và Wikipedia đều tải trực tuyến.
- **Âm thanh:** chỉ phát sau lần chạm đầu tiên (điện thoại bắt buộc vậy). Giọng đọc dùng giọng tiếng Việt có sẵn trong máy.
- **Tiến trình chơi:** lưu trên trình duyệt của điện thoại đó.
- **Link hết hạn:** báo tôi để tạo link mới. Nếu cần link dùng lâu dài thì phải đưa file lên một host riêng.

