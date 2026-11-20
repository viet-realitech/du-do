# Quyết định trước khi ra mắt Dư Đồ

Bản ghi một trang để anh đọc và quyết định trước khi giới thiệu ứng dụng rộng rãi. Mỗi mục có một đề xuất; anh chọn khác cũng được, chỉ cần nói lại để sửa.

> **Đây không phải ý kiến pháp lý.** Người soạn không phải luật sư. Các văn bản luật dưới đây chỉ là danh sách câu hỏi để anh mang tới một luật sư Việt Nam. Luật về an ninh mạng và thông tin trên mạng thay đổi nhiều trong 2025–2026, nên số điều, tên văn bản và ngày hiệu lực đều phải được luật sư kiểm lại.

## 1. Ra mắt ở đâu trước

**Đề xuất:** giới thiệu trước với người Việt ở nước ngoài và bạn bè quen biết; chưa quảng bá rộng trong nước cho tới khi có người rà soát sử học đọc xong bảng A và anh đã hỏi ý kiến luật sư.

Lý do: ứng dụng đặt các góc nhìn ngang hàng (cả góc nhìn của sử quan VNCH và người Việt hải ngoại), có giả định "Nếu Việt Nam Cộng hoà đứng vững sau 1973", có các đề tài nhạy cảm ở trong nước (cải cách ruộng đất, Mậu Thân ở Huế, học tập cải tạo, thuyền nhân, Nhân Văn). Đó là điều bản hướng ban đầu muốn và là giá trị với bà con ở xa; nhưng nội dung còn do AI soạn, chưa ai thẩm định, nên một lỗi sự thật ở đề tài nhạy cảm sẽ nặng hơn nhiều.

## 2. Anh dễ bị nhận ra tới mức nào

Ai muốn tìm người đứng sau ứng dụng có thể lần theo:
- **tên miền**: người đăng ký tên miền (bật chế độ ẩn thông tin, "WHOIS privacy", khi mua);
- **Vercel**: tên tài khoản, tên nhóm hiện trong đường dẫn bản xem thử;
- **GitHub**: tên tài khoản đứng tên kho mã; nếu kho để công khai thì mọi tệp, kể cả bản ghi này, ai cũng đọc được; lịch sử thay đổi ghi tên và email người gửi;
- **địa chỉ nhận góp ý**: dùng một Google Form hay một email riêng cho dự án, không dùng email cá nhân.

**Đề xuất:** kiểm tra kho mã đang công khai hay riêng tư (GitHub → Settings); nếu anh sống ở Việt Nam hay thường về nước, để kho riêng tư và dùng tên dự án, email dự án cho mọi tài khoản. Đừng ghi thêm thông tin cá nhân vào kho mã.

## 3. Màu cờ VNCH là màu mặc định của bản đồ

Hiện người chơi mới thấy vùng của Quốc gia Việt Nam / VNCH tô nền vàng ba sọc đỏ (`src/state.ts`, mặc định `pal: 'flag'`; hình vẽ ở `src/ui/bits.ts`). Đúng ý bản hướng ("màu theo cờ lịch sử"), và người chơi có thể đổi sang "mực nâu" trong Hồ sơ → Giao diện.

**Đề xuất:** ra mắt ở nước ngoài thì giữ; nếu quảng bá trong nước, đổi mặc định sang mực nâu (sửa một dòng, người chơi vẫn chọn lại được màu cờ). Anh quyết.

## 4. Tên miền: .vn hay tên miền quốc tế

Tên miền .vn đăng ký qua nhà đăng ký ở Việt Nam, phải khai thông tin thật và chịu quản lý của cơ quan Việt Nam (có thể bị tạm ngưng). Tên miền .com, .app mua ở nước ngoài, có ẩn thông tin người đăng ký. **Đề xuất:** dùng một tên miền ngắn .com hay .app; chưa cần .vn.

## 5. Người rà soát sử học và luật sư

- Bảng để người rà soát điền đã sẵn ở `docs/review/` (xem `docs/review/README.md`, có đoạn giới thiệu để anh gửi đi). Phần ưu tiên khoảng một ngày làm việc. Nên tìm hai người: một ở trong nước, một ở nước ngoài hay giới nghiên cứu quốc tế.
- Có ghi tên người rà soát trong ứng dụng không: anh và họ thoả thuận. Ứng dụng chưa ghi "đã rà soát" cho tới khi việc ấy xong thật.
- Một buổi tư vấn với luật sư Việt Nam: mang theo `docs/review/nhay-cam.md` (các câu nhạy cảm, nguyên văn, xếp theo đề tài) và các câu hỏi ở mục 7.

## 6. Các điểm nóng và chỗ của chúng trong mã

Danh sách đầy đủ, nguyên văn từng câu: `docs/review/nhay-cam.md` (sinh lại bằng `npm run review:export`).

| Điểm nóng | Hiện ở đâu | Trong mã |
|---|---|---|
| Màu cờ VNCH mặc định | bản đồ, chú giải | `src/state.ts`, `src/ui/bits.ts` |
| Nhãn Hoàng Sa, Trường Sa, Biển Đông, Vịnh Bắc Bộ | bản đồ chính, tấm bản đồ ở màn chào | `src/map.ts`, `src/ui/plate.ts` |
| Góc nhìn "Sử quan VNCH & hải ngoại", xếp ngang hàng | thẻ Góc nhìn của sự kiện | khoá `vnch` trong `src/data/data.js`, `data2.js` |
| Cải cách ruộng đất | sự kiện `cc53`; thẻ Chơi; biến cố "Đội cải cách sắp về làng" | `data2.js`; `src/data/cards.ts`; `src/data/cards2.ts` (`x-diachu53`) |
| Mậu Thân, thảm sát Huế | sự kiện `mt68` | `data.js`, số liệu ở `data2.js` |
| Học tập cải tạo | sự kiện `tn76`; "Gia đình bạn" ở điểm rẽ 6 | `data.js`; `data2.js` (CTX) |
| Nhân Văn – Giai Phẩm | sự kiện `nv56` | `data2.js` |
| Thuyền nhân, nạn kiều, di tản | sự kiện `tn80`, `ct78`; các lối ra đi của Trò chơi; kết cục "Bên kia đại dương" | `data.js`, `data2.js`; `cards.ts`; `src/data/endings.ts` |
| Chiến tranh 1979, Vị Xuyên | sự kiện `cp79`, `bb79`, `vx84` | `data.js`, `data2.js` |
| Biển đảo, biên giới | sự kiện `hs74`, `gm88`, `hd14`, `pca16`, `vbb00`, `bg99` | `data.js`, `data2.js` |
| Giả định "Nếu…" kèm % | màn Kết luận | `src/data/endings.ts` (`CFS`) |
| Lời khép nhắc tên người còn sống | phim hành trình | `src/data/surnames.ts` (`EPILOGUES`) |

## 7. Câu hỏi cho luật sư (cần kiểm lại từng văn bản)

1. **Luật An ninh mạng 2025** (số 116/2025/QH15, hiệu lực từ 1.7.2026, thay Luật An ninh mạng 2018): Điều 7 liệt kê các hành vi bị nghiêm cấm; khoản 1 điểm b cấm đăng tải, phát tán trên mạng thông tin "xuyên tạc lịch sử, phủ nhận thành tựu cách mạng" (ở luật 2018 là Điều 8 khoản 1 điểm c; còn Điều 16 của luật 2018 nói về thông tin tuyên truyền chống Nhà nước, như xúc phạm quốc kỳ, lãnh tụ, anh hùng dân tộc). Các góc nhìn đặt ngang hàng, góc nhìn VNCH, giả định "Nếu…" có rủi ro gì? Nhờ luật sư xác nhận số điều, khoản.
2. **Nghị định 147/2024/NĐ-CP** (dịch vụ Internet, thông tin trên mạng, trò chơi điện tử G1–G4): một trò chơi miễn phí, không tài khoản, chơi một mình, đặt máy chủ ở nước ngoài có cần giấy phép không? Nếu sau này có thu tiền, tài khoản, bảng xếp hạng, hay người vận hành ở Việt Nam thì sao?
3. **Luật Đo đạc và Bản đồ 2018**: bản đồ phải thể hiện đúng chủ quyền, kể cả Hoàng Sa, Trường Sa. Bản đồ lịch sử (ranh giới thời Pháp thuộc, hai miền) có thuộc quy định này không; nhãn hiện có đã đủ chưa?
4. **Bộ luật Hình sự, Điều 117 và Điều 331**: hai điều thường được dùng với nội dung trên mạng. Với anh, rủi ro phụ thuộc vào việc anh sống ở đâu và dễ bị nhận ra tới mức nào (mục 2).

## 8. Anh cần làm

- Chọn: ra mắt ở đâu trước; giữ hay đổi màu cờ mặc định; tên miền.
- Đặt một địa chỉ nhận "Góp ý / Báo sai" (Google Form hay email riêng của dự án) mà anh sẽ thật sự đọc. Khi có địa chỉ, liên kết tự hiện ở cuối thẻ Nguồn của mỗi sự kiện, trong thẻ nhân vật và trong Giới thiệu; chưa có thì không hiện gì.
- Đọc đoạn "Cách đọc" mới trong Giới thiệu (nói rõ phần chữ được soạn với sự trợ giúp của AI và chưa được nhà sử học thẩm định); sửa câu chữ nếu muốn, miễn vẫn đúng sự thật.
- Bắt đầu tìm người rà soát sử học; cân nhắc một buổi với luật sư trước khi quảng bá trong nước.
