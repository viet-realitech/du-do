# Thư Nhà · Giờ G trên giấy: "Đêm rằm ở Chí Hoà"

*Bộ chơi thử trên bàn, bản nháp 4 · soạn lại 20.11.2026 sau hai bàn chơi thử mô phỏng trên bản 3 (`sim3-f.md`,
`sim3-g.md`). Bản 3 soạn sau hai bàn mô phỏng trên bản 2 (`sim2-d.md`, `sim2-e.md`). Bản 2 soạn sau ba phiếu đọc: nhà sử học, người đọc nhạy cảm, chơi thử mô phỏng ba bàn (`sim-a.md`,
`sim-b.md`, `sim-c.md`, chạy trên bản 1) · dựa trên `game/direction.md`, `dir-story.md`, `dir-battle.md`, `systems.md`
và dữ liệu ứng dụng (`cards.ts`: gd59, cd61, nt61, nt62, td64; `scenes.ts`: cd61; `data.js`: sự kiện cd61;
`surnames.ts`). Bản 1 lưu ở `kit-v1.md`, `board-v1.svg`. Bản 2 lưu ở `kit-v2.md`, `board-v2.svg`, `kit-v2.pdf`.
Bản 3 lưu ở `kit-v3.md`, `board-v3.svg`, `kit-v3.pdf`. **Bản 4 chưa ai chơi, kể cả chơi mô phỏng.***

---

## Đọc trước khi in

**Bộ này để làm gì.** Thử thật rẻ một "Giờ G" của hướng *Thư Nhà · Sáu đời người, một từ đường*, trước khi viết dòng
code nào. Một bàn cờ in sẵn, bảy lượt, một nhà sáu người, hai người lạ, một Khoảnh khắc. Chơi khoảng 85 phút, kể cả
mở đầu và ghi Sổ, rồi chừng 8 phút hỏi; thư mời ghi 100 phút. Chủ dự án chơi cùng chừng ba người nữa. Một người dẫn đọc sử.

**Buổi thử phải trả lời bốn câu:**
1. Sau lần gặp nạn đầu tiên (kể cả lần tung thử), người chơi có hiểu bàn cờ không?
2. Họ thấy mình đang lo cho người, hay chỉ đang né ô màu cam, đếm sức, đếm chỗ?
3. Hôm sau, họ có nhớ tên người trong nhà không?
4. Họ có muốn chơi mùa kế tiếp không?

**Nhãn dùng trong bộ này**
- **[nháp]**: đoạn kể chuyện, lời nhân vật, thư từ, lời người dẫn. Máy soạn để chạy thử. Người viết tiếng Việt phải
  viết lại hết trước khi đưa ra ngoài nhóm thử. Viết lại xong thì bỏ dấu [nháp].
- **[sử gia kiểm]**: chi tiết lịch sử chưa đủ chắc. Nhà sử học phải xem. Danh sách ở phần cuối.
- **(hư cấu)**, **Chuyện hư cấu**: nhãn in luôn. **Không bỏ** khi bỏ dấu [nháp]. Nhà họ Đỗ, anh Quảng, chị Nhàn, xóm
  Bưng Lác, rạch, đình, chùa, chợ đều là hư cấu. Mỗi đoạn "Ở xóm" đều mang nhãn (hư cấu).
- **(sử)**: việc và người có thật. Người có thật chỉ có mặt trong dòng "Sử đã chép", đúng vai công khai của họ.

**Họ mặc định: Đỗ.** Họ trung tính; `surnames.ts` không có `kin` cho họ Đỗ. Không dùng chip "cùng họ". Còn một điều
phải kiểm: ông Đỗ Trình Thoại, tri huyện vùng Gia Định, theo nhiều nguồn mất năm 1861 khi đánh Pháp gần Gò Công
[sử gia kiểm]. Nếu đúng, in thêm một dòng "Nhà họ Đỗ là hư cấu, không liên quan ông Đỗ Trình Thoại", hoặc đổi họ.

**Không ai trong nhà chết trong buổi này.** Xúc xắc chỉ quyết vết thương, đồ rơi, và lạc. Cái chết của người có tên
trong *Thư Nhà* luôn do người viết đặt, có báo trước, không bao giờ do xúc xắc.

**Chữ "lượt".** Một lượt là một chặng chơi, có khi là một buổi sáng, có khi là cả đêm. Bộ này không dùng chữ "canh".

**Người đọc cộng đồng Công giáo** phải đọc trước buổi thử: thẻ chị Nhàn, hộp "Chuyện cấm đạo", thẻ sự việc "Bờ tre",
câu cúng rằm người dẫn đọc ở lượt 3, mục D, F và G của Sổ. Xem Phụ lục A.

**Bản nháp 4 đổi gì** (cho ai đã đọc bản 3; sửa theo bàn F và bàn G, `sim3-f.md`, `sim3-g.md`)
- **Lửa ở xóm từ lượt 4.** Chợ gốc me (8) có Lửa từ lượt 4; Bờ rạch (12) có Lửa lượt 4 và lượt 5 (phỏng theo: sáng 25.2
  pháo hai bên bắn qua lại mặt bắc, đạn rơi lạc xuống chợ, mé rạch) [sử gia kiểm]. Trên bản 3, bàn F và bàn G đều tìm ra
  đường đưa cả nhà tới chỗ yên chỉ với một lần tung (tía đi ngang Chợ ở lượt 5): ai rời nhà ở lượt 4 hay 5 cũng khỏi
  tung. Giờ ai rời Nhà mình ở lượt nào cũng phải tung ít nhất một lần; cả nhà ít nhất 5 lần từ lượt 3 trở đi (thêm lần
  của Lộc ở lượt 2), mỗi lần chỉ gặp nạn khi ra 6. Bỏ một trong ba ô lửa mới là đường một lần tung mở lại. Lượt 4 dùng
  đủ 6 thẻ Lửa. "Ở xóm" lượt 4 thêm một câu [nháp].
- **Ăn rằm ở nhà.** Hết lượt 3, bà Sáu, Má Thơm, Mận, Út Cò ở Nhà mình (Lộc tuỳ ý, tía ở đồn). Bản 3 chỉ cấm ra lối ra,
  nên có thể đưa người ra chùa ngay đêm rằm rồi lượt 4 qua cầu khỉ mà khỏi tung.
- **Lộc đi tuần:** hết lượt 2, Lộc phải ở Gò mả (bỏ "hay Đình": Đình lượt 2 không có lửa, nên luật cũ không làm gì).
  Bàn nào cũng có một lần tung thật sớm, ra 6 mới gặp nạn.
- **Tung thử không tung thật.** Người dẫn đặt xúc xắc mặt 5: "Giả sử Lộc tung ra 5." Nói luôn: đi ngang thì phải ra 6.
  Chỉ kẹp khi bàn chọn chịu thương; không tung cho văn tự. Bàn F: người 60 tuổi hỏi "người dẫn sửa được xúc xắc hả?".
- **Anh Quảng, câu 2.** Anh rời bàn cờ lúc hết lượt (ai đi ngang trong lượt vẫn băng được). Chưa ai băng thì hết đêm Sổ B
  ghi anh mang tật, như người còn trên bàn cờ. Hết đêm (5.9) tính cả người lạ đã ra lối ra hay đã rời bàn cờ. Bàn G: câu 2
  với tía là người nói thì không ai phải lo cho anh mà Sổ không ghi gì.
- **Khoảnh khắc.** Không ai tới gốc me lượt 5 thì không ai nói, không ai được +2, anh nằm lại như câu 3. Thẻ Đạn chùm ghi
  rõ: tía là người nói thì cộng +2.
- **Út Cò bị thương:** dẫn em tốn 2 sức như dẫn người bị thương (bà Sáu không dẫn được). Đã bị thương mà gặp nạn nữa khi
  đang cầm đồ thì phải buông. Bàn F: để em chịu thương mà giữ đồ là nước lợi nhất.
- **Bát nhang** chỉ rời tay người cầm khi buông lúc gặp nạn, hay khi đưa cho người đứng cùng ô với bà. Bàn G: "đặt" bát
  nhang ở ngoài thì bà thành rảnh.
- **Trang luật** chép thêm từ 5.8: tự đi trước rồi mới được dẫn; băng bó cả ở ô đi ngang. 5.8 thêm: người đang được dẫn,
  được cõng thì không dẫn ai. Thẻ Má Thơm: tới chùa thì được; tía ra khỏi đồn trong lượt nào thì má ra được ngay lượt đó,
  nếu tía đi trước. Thẻ chị Nhàn: hết đêm chưa tới chỗ yên cùng nhà mình thì sáng ra chị đi một mình. Thẻ lửa 1–2: "Nhà
  mình chưa đi: còn ăn rằm với bà." Thẻ lửa 3 nhắc ăn rằm. "Người chơi lớn tuổi nhất" (không phải nhân vật). Sổ F: thư còn
  hay mất cũng đánh ô lời hứa.
- **Bàn cờ.** Cổng hậu dời xuống (y 50 → 55), Kho lương sang phải (x 46 → 48), mũi tên 25.2 dừng trước Ruộng trước đồn.
  Đường d (2–5) giờ thấy rõ; bàn F không thấy đường này.
- **Giờ.** Thư mời ghi 100 phút; bàn F chơi 92 phút trên bản 3 rồi hỏi 11 phút. Kế hoạch 10.3: khoảng 85 phút chơi, 8
  phút hỏi; lượt 4 (lượt đầu được ra lối ra) khoảng 11 phút. Bỏ "một câu" ở lượt 2. Người giữ bút ghi Sổ D ngay lúc việc
  xảy ra. Hỏi ngay sau buổi còn 7 câu; ba câu (chơi game quá, không công bằng, từ khó) dời sang cuộc gọi hôm sau.
- **Người dẫn.** Người chơi đã hết quân đọc to "Sử đã chép" các lượt còn lại. Phép kiểm 10.4 đổi: tìm đường đưa cả nhà ra
  với ít lần tung nhất; bản 3 qua được phép kiểm cũ ("không tung lần nào") dù có đường một lần tung. Núm 9.5 ghi rõ núm
  nào đổi số lần tung, núm nào không.

**Bản nháp 3 đổi gì** (cho ai đã đọc bản 2; sửa theo bàn D và bàn E, `sim2-d.md`, `sim2-e.md`)
- **Lửa ở Đình.** Đình (7) có Lửa cả lượt 5 lẫn lượt 6 (phỏng theo: liên quân giữ mặt bắc sau khi phá cổng)
  [sử gia kiểm]. Lượt 6, mọi ô kề Nhà mình đều có lửa: ai rời nhà cũng phải tung ít nhất một lần. Bàn D đã đi
  Nhà → Đình → Bà Điểm mà không tung lần nào.
- **Bàn cờ.** Bỏ ô Đầu cầu khỉ: từ Chùa qua cầu khỉ (2 sức) là ra thẳng lối bên kia đồng. Lối ra đánh số lại: 13 Bà
  Điểm, 14 Bến ghe, 15 Bên kia đồng. Còn 15 ô, 21 đường (a–u; lối bưng giờ là u). Bỏ vòng "sân chùa". Chùa chứa
  3 người (bản 2: 4), tính cả người lạ. `board.svg` vẽ lại từ `tools/board.py`, cùng hình với bàn cờ trong `kit.pdf`.
- **Chữ người chơi thấy.** Nét nối hai ô gọi là "đường"; "lối ra" chỉ dùng cho ô 13–15. Luôn ghi "bị thương nặng",
  không để chữ "nặng" đứng một mình. Chỉ dùng chữ "dẫn" (bỏ "dắt"). Lối bưng ghi "(qua đất trũng)". Thẻ Tía Bền bỏ
  câu "ngoài xóm kêu là anh Tư" (chuyển vào ghi chú cho người viết).
- **Trang luật.** Dòng Sức ghi rõ người lớn là Tía Bền, Má Thơm, Lộc, Mận; câu "Nói gọn" sửa cho đúng với dẫn Út Cò và
  Tía Bền dẫn. Thêm: bước ra khỏi ô mình đứng từ đầu lượt thì không tung; người bị thương không cõng ai; trong đồn là
  ô 2–4, tía không tới Đồn Hữu; đồ nằm ở ô Tâm ra 4–6 là mất (bản 2: 1–3, ngược chiều mọi ngưỡng khác); buông đồ thì
  tung cho món đồ (4–6 mất, 1–3 rơi ở ô gặp nạn); chùa, ghe tính cả người lạ, chùa đủ người thì không ai đi ngang,
  kể cả để qua cầu khỉ; khoảng cách để nhẩm nhanh (bản 2 chỉ người dẫn thấy).
- **Bốn điều người nhà không chịu** (bản 2: ba). Thêm: trước khi hết lượt 3, không ai trong nhà ra lối ra (cả nhà ăn
  rằm với bà). Bát nhang: bà không cầm đồ; bà chỉ rời nhà khi có người cầm bát nhang đi cùng, hết mỗi lượt người đó
  đứng cùng ô với bà; bát nhang không rời nhà trước bà.
- **Lộc đi tuần:** hết lượt 2, Lộc phải ở Gò mả hay Đình.
- **Người lạ không tung xúc xắc.** Hết đêm còn bị thương nặng mà không ai băng thì mang tật. Chị Nhàn tự đi, nhưng chỉ
  tới chỗ yên khi đi cùng ô với một người nhà; người cầm thẻ quyết chị đi lúc nào, đi đâu. Thẻ người lạ đưa cho người
  có ít người nhà còn trên bàn cờ nhất; bằng nhau thì người lớn tuổi nhất.
- **Khoảnh khắc.** Người nói phải còn trên bàn cờ, và trong lượt 5 phải tới hay đi ngang gốc me. Chỉ người nói được
  +2; +2 này không cộng với +2 của Lộc. Câu 1 chỉ cho người lớn đang lành. Câu 2 không còn bắt đứng ở gốc me lúc
  hết lượt. Trước thẻ, người dẫn đặt anh Quảng, gõ ba tiếng, báo anh bị thương nặng. Thẻ Đạn chùm: lượt 5 tía tự đi
  được, không cõng được ai.
- **Cúng rằm.** Câu người dẫn đọc ở lượt 3 không còn tính chị Nhàn là đã cúng: chị có ở Nhà thì Sổ ghi chị ngồi
  nhờ. Sổ D thêm dòng "ai ngồi nhờ". Phụ lục A hỏi người đọc Công giáo chỗ này.
- **Tung thử** lúc nào cũng thành gặp nạn (người dẫn xoay xúc xắc sang mặt 5), để cả bàn thấy kẹp giấy và chỗ chọn
  chịu thương hay buông văn tự. Q1 đếm từ lần gặp nạn đầu tiên, không đếm theo lượt.
- **Giờ.** Thư mời ghi 90 phút. Kế hoạch 10.3 theo giờ bàn D: khoảng 75 phút chơi, 10 phút hỏi. Lúc chơi, Sổ chỉ
  ghi A, B, D: mỗi người nói to, người giữ bút viết. Người dẫn ghi C, E, F sau buổi. Mục G đọc một dòng, mục H đọc
  nguyên văn.
- **Người dẫn.** Giữ xấp thẻ lửa trong tay, mỗi lượt lật một thẻ. Lượt 5–6 hỏi từng người "[tên] đi đâu?". Lượt
  không ai có việc thì đọc, đặt lửa, lật thẻ, sang lượt. Núm chỉnh 9.5 có núm mới đứng đầu: lửa ở Đình lượt 5–6.
  Mục 10.4 có phép kiểm "đường không tung".

**Bản nháp 2 đổi gì** (cho ai đã đọc bản 1)
- Hướng đánh theo nguồn: đồn Hữu (Redoute) ở đầu nam; ngày 25 liên quân vòng lên đánh mặt bắc. Xóm dời sang phía
  đông bắc, bên rạch. Đêm 24–25 yên, không bắn. Giờ giấc ngày 24 và 25 theo Pallu.
- Tám canh thành bảy lượt (gộp sáng và chiều 24.2). Có tung thử từ đầu.
- Thẻ lửa (cả bàn thấy) tách khỏi kịch bản (chỉ người dẫn giữ). Người lạ và Khoảnh khắc nằm trong thẻ úp.
- Đồ rơi khi gặp nạn thì nằm đó tới sáng. Bờ rạch có lửa ở lượt 6. Lối Bà Điểm đóng lượt 3–5. Tía Bền bị thương ở
  cuối lượt 4, do người viết đặt.
- Khoảnh khắc: câu nào cũng được thêm 2 sức như nhau. Câu nào cũng làm được ngay. Sổ ghi việc, không ghi lời trách.
- Chị Hạnh đổi tên tạm là chị Nhàn, tự đi được, không còn đi về hướng Chợ Lớn. Hộp cấm đạo viết lại.
- Mỗi người một tên. "Ba Mận" thành "Mận". Bỏ chén muỗng, bỏ chấm đỏ, bỏ chữ "thương tật", bỏ luật trốn phu.
- Có hộp "Phân xử nhanh". Người chết mọi bên ghi theo khoảng, có tên nguồn.

---

## Mục lục

1. Một trang luật (in cho người chơi), ví dụ, từ khó
2. Bàn cờ: 15 ô, 21 đường, lửa theo từng lượt
3. Sử đã chép: dải cho cả bàn, bảy thẻ lửa, kịch bản từng lượt
4. Người trong nhà: 6 thẻ người nhà, 2 thẻ người lạ
5. Luật đầy đủ cho người dẫn, phân xử nhanh
6. Thẻ sự việc (úp): Bờ tre, Đạn chùm, Khoảnh khắc, Lộc gặp tía
7. Mở đầu (lá thư), Kết, Sổ
8. Kịch bản cho người dẫn
9. Câu hỏi và phiếu quan sát
10. In, chuẩn bị, kế hoạch thời gian

Phụ lục A: người đọc cộng đồng Công giáo · B: nguồn · C: nối với ứng dụng
Ghi chú cho người viết và sử gia

---

## 1. Một trang luật

> *In riêng, khổ A4, chữ cỡ 13. Mặt sau in ví dụ và "Từ khó".*

### Đêm rằm ở Chí Hoà

**Mình biết sử. Người trong nhà thì không.**
Ngày 24 và 25 tháng Hai năm 1861, đại đồn Chí Hoà sẽ vỡ. Không ai đổi được chuyện đó. Cả bàn cùng lo cho một nhà ở
xóm gần đồn qua hai ngày ấy: giữ người, giữ đồ, và quyết có giúp người lạ hay không.
**Không có thắng thua. Không có điểm. Không ai trong nhà chết vì xúc xắc.**

**Mỗi lượt (có 7 lượt)**
1. Người dẫn đọc "Sử đã chép" (sử) và "Ở xóm" (chuyện hư cấu), rồi đặt lửa lên bàn cờ.
2. Người dẫn lật **thẻ lửa lượt sau** cho cả bàn xem trước.
3. Cả bàn bàn với nhau, rồi đi quân.
4. Ai đi ngang ô Lửa, ai đứng ở ô có lửa lúc hết lượt thì tung xúc xắc.

**Chữ trên bàn cờ**
- **Ô**: vòng tròn có số, 1 tới 12. **Đường**: nét nối hai ô, có tên a tới u. **Lối ra**: ô 13, 14, 15; bước tới là ra
  khỏi bàn cờ.
- **Trong đồn**: ô 2, 3, 4 (trong khung đại đồn). Đồn Hữu (1) ở ngoài.

**Sức** (hạt đậu, mỗi lượt, không để dành): Người lớn (Tía Bền, Má Thơm, Lộc, Mận): 2 sức; riêng Mận 3 · bà Sáu 1 ·
Út Cò 1 · người bị thương 1 · người bị thương nặng 0.
*Nói gọn:* người lớn đi 2 đường, dẫn ai thì đi 1 (dẫn Út Cò còn lành, hay Tía Bền dẫn: vẫn 2). Bà Sáu, Út Cò, người bị
thương đi 1 đường.

**Đi và làm**
- Đi 1 đường: 1 sức. Qua cầu khỉ: 2 sức.
- **Dẫn** một người (bà Sáu, người bị thương, người lạ): mỗi đường 2 sức. Dẫn Út Cò: 1 sức (em bị thương: 2, như dẫn
  người bị thương). Tía Bền dẫn ai cũng chỉ 1.
- Tự đi trước rồi mới được dẫn thì được; đã được dẫn thì lượt đó thôi tự đi.
- **Người bị thương nặng** không tự đi: 2 người lớn cùng cõng (mỗi người 2 sức mỗi đường), hoặc Tía Bền cõng một mình
  khi tía còn lành. **Người bị thương không cõng ai.**
- **Băng bó**: 2 sức (Má Thơm: 1), đứng cùng ô (kể cả ô đi ngang). Người bị thương nặng được băng thì thành bị thương.
- **Đồ**: mỗi người cầm 1 món. Nhặt, đặt, đưa cho người cùng ô: không tốn sức.
- Mỗi lượt, mỗi người lớn dẫn hay cõng một người thôi. Dẫn ai ra lối ra thì mình ra theo.

**Lửa**

| Hết lượt mà đứng ở ô | Ô trống: gặp nạn khi ra | Ô có che ▲: gặp nạn khi ra |
|---|---|---|
| **Lửa** (cam) | 5 hoặc 6 | 6 |
| **Tâm** (đỏ) | 3 đến 6 | 4 đến 6 |

- Đi ngang ô Lửa: tung một lần, ra 6 là gặp nạn. Không bước vào, không đi ngang ô Tâm.
- **Bước ra khỏi ô mình đứng từ đầu lượt thì không tung**, dù ô đó có Lửa hay Tâm.
- Ô **Chặn** (đen): không vào được.
- Ô **vỡ** (cờ đen): hết lượt, ai còn ở đó thì lạc, đồ ở đó mất.
- Đồ nằm ở ô Tâm lúc hết lượt: tung, ra 4–6 là mất.

**Gặp nạn thì sao**
- Lành → **Bị thương** (1 kẹp) → **Bị thương nặng** (2 kẹp).
- Hết đêm còn bị thương nặng, hoặc đang bị thương nặng mà gặp nạn nữa: người đó **mang tật** theo suốt đời.
- Đang cầm đồ mà gặp nạn thì chọn: chịu thương, **hoặc té, phải buông đồ mới chạy kịp**. Buông thì tung cho món đồ:
  ra 4–6 là mất; ra 1–3 là đồ rơi lại ở ô mình gặp nạn (gặp nạn khi đi ngang thì ở ô đi ngang). Đêm nay không ai
  nhặt lại được.
- Út Cò gặp nạn thì chỉ tới bị thương. Em đã bị thương mà gặp nạn nữa khi đang cầm đồ thì phải buông đồ.

**Lạc**
- Hết lượt mà còn ở ô vỡ.
- Út Cò hết lượt ở ô có lửa mà không có người lớn nhà mình (kể cả bà Sáu) đứng cùng.

**Lạc không phải là mất.** Mùa sau cả nhà đi tìm.

**Người lạ.** Trong đêm có thể gặp người lạ. Họ cũng lành, bị thương, bị thương nặng như người nhà, không bao giờ chết.
**Người lạ không tung xúc xắc.** Hết đêm còn bị thương nặng mà không ai băng thì mang tật.

**Lối ra và chỗ yên** *(nơi đến là hư cấu)*
- **13 · Bà Điểm**: lên nhà bà con ở Bà Điểm. Mở lượt 1–2 và 6–7; đóng lượt 3–5.
- **14 · Bến ghe**: ghe ngược rạch, về xóm bà con xa mé đồn. Lượt 1–6, mỗi lượt 3 người; chuyến chót lượt 6.
- **15 · Bên kia đồng**: từ Chùa qua cầu khỉ (2 sức), về làng bên ngoại. Mở cả đêm.
- Ra lối ra rồi thì yên tới sáng, không quay lại.
- **Yên cả đêm:** Chùa. Các ô khác đều có thể có lửa.
- **Chùa 3 người, ghe 3 người mỗi lượt, tính cả người lạ**; con chị Nhàn không tính. Chùa đủ người thì không ai vào,
  không ai đi ngang, kể cả để qua cầu khỉ.
- *Khoảng cách:* Nhà → Bà Điểm 2 đường · Nhà → Chùa 2 · Nhà → Bến ghe 3 (2 nếu đi lối bưng cùng bà Sáu) · Chùa →
  bên kia đồng: cầu khỉ, 2 sức · Kho lương → Nhà 3 · Kho lương → Chùa 3 · Gò mả → Nhà 2.

**Bốn điều người nhà không chịu** (ghi trên thẻ)
- Bà Sáu ở nhà tới hết lượt 3 để cúng rằm, không cầm đồ. Bà chỉ rời nhà khi có người cầm bát nhang đi cùng; hết mỗi
  lượt người đó đứng cùng ô với bà. Bát nhang không rời nhà trước bà; chỉ rời tay người cầm khi buông lúc gặp nạn, hay
  đưa cho người đứng cùng ô với bà.
- Cả nhà ăn rằm với bà: hết lượt 3, bà Sáu, Má Thơm, Mận, Út Cò ở Nhà mình (Lộc tuỳ ý). Trước đó không ai ra lối ra.
- Tía Bền không bỏ đồn (ô 2–4) trước lệnh rút (lượt 5). Tía không tới Đồn Hữu.
- Má Thơm không ra lối ra khi tía còn trong đồn (tới chùa thì được).

**Hết lượt 7:** người giữ bút ghi Sổ.

---

### Ví dụ (giả định, không phải một lượt thật)

*Lửa ở Chợ gốc me (ô trống).*
- **Bà Sáu** (1 sức) dẫn **Út Cò** từ Nhà mình ra Chợ gốc me. Dẫn Út Cò tốn 1. Bà hết sức.
- **Lộc** ôm bát nhang, đi cùng bà: Nhà mình → Chợ gốc me, 1 sức. Bà chỉ rời nhà khi có người cầm bát nhang đi cùng, và
  hết lượt người đó đứng cùng ô với bà.
- **Mận** (3 sức) ôm gia phả, đi Nhà mình → Chợ gốc me → Chùa: 2 sức. Bước ra khỏi Nhà (ô Mận đứng từ đầu lượt): không
  tung. Đi ngang Chợ (Lửa) nên tung một lần, ra 6 mới gặp nạn. Ra 3: không sao. Mận tới chùa.
- **Tung** ở Chợ (Lửa, ô trống: ra 5 hay 6 là gặp nạn). Bà Sáu ra 1, Út Cò ra 4: không sao. Lộc ra 5: gặp nạn, đang
  ôm bát nhang. Người chơi chọn: chịu thương (kẹp 1 kẹp, lượt sau còn 1 sức), hay té, buông bát nhang mới chạy kịp.
  Buông thì tung cho bát nhang: ra 4–6 là mất; ra 1–3 là bát nhang rơi ở Chợ gốc me, đêm nay không ai nhặt lại được.
- **Lạc:** Út Cò đứng ở ô có lửa nhưng có bà đứng cùng: không lạc.

---

### Mặt sau trang luật: Từ khó

| Từ | Nghĩa |
|---|---|
| Đại đồn Chí Hoà (Kỳ Hoà) | Trại quân lớn của triều Nguyễn ở Gia Định, tường đất dày, có hào và hố chông. Kỳ Hoà là cách người Pháp đọc trại tên làng Chí Hoà (Ki-hoa). (sử) |
| Phòng tuyến | Dãy đồn, luỹ nối nhau |
| Đồn Hữu (Redoute) | Đồn ở đầu nam phòng tuyến, phía chùa Cây Mai. Người Pháp gọi là Redoute. (sử) [sử gia kiểm] |
| Phòng tuyến các chùa | Dãy đồn quân Pháp đóng trong các chùa giữa Sài Gòn và Chợ Lớn, đối diện Chí Hoà (sử) |
| Liên quân | Quân Pháp và quân Tây Ban Nha đánh chung. Lính Tây Ban Nha phần đông là người Philippines, khi đó thuộc Tây Ban Nha. (sử) [sử gia kiểm] |
| Luỹ, hào, hố chông | Tường đất đắp cao; mương đào quanh đồn; hố cắm chông tre nhọn |
| Đạn chùm | Đạn pháo bắn gần, văng ra nhiều viên nhỏ |
| Tán lý, tán tương | Chức quan giúp việc quân trong đồn [sử gia kiểm] |
| Dân phu, đi xâu | Dân bị bắt đi làm việc quan không công (đắp luỹ, khiêng) |
| Lượt | Một chặng chơi |
| Đường | Nét nối hai ô trên bàn cờ, có tên a tới u. Đi 1 đường tốn 1 sức |
| Lối ra | Ô 13, 14, 15 ở mép bàn cờ. Bước tới là ra khỏi bàn cờ, yên tới sáng |
| Bị thương nặng | Bị thương tới mức không tự đi được, phải có người cõng |
| Lối bưng | Lối tắt qua đất trũng (bưng), nối Nhà mình với Bờ rạch |
| Gò mả | Gò có mộ. Quanh Chí Hoà có vùng đồng mả thật, người Pháp gọi là "cánh đồng mộ". |
| Gia phả | Cuốn sổ chép tên, ngày giỗ ông bà các đời |
| Bát nhang (lư hương) | Bát cắm nhang trên bàn thờ ông bà |
| Văn tự ruộng | Giấy mua bán, chia ruộng của nhà, viết chữ Hán |
| Bưng | Đất trũng, lau sậy |
| Cầu khỉ | Cầu một cây tre bắc qua rạch, có tay vịn |
| Ghe | Thuyền nhỏ |
| Hai, Ba, Tư… Út | Người Nam kêu con đầu là Hai, rồi Ba, Tư…; con nhỏ nhất là Út |
| Tía, má · bây, tụi bây | Cha, mẹ (tiếng Nam) · các con, tụi con (người lớn gọi) |
| Má sắp nhỏ | Chồng gọi vợ: "má của mấy đứa nhỏ" |
| Người có đạo | Cách người Nam Kỳ gọi người theo Công giáo |
| Lần chuỗi | Lần từng hạt chuỗi (tràng hạt) khi đọc kinh |
| Cấm đạo | Lệnh triều đình cấm theo đạo Thiên Chúa (sử) |
| Phân sáp | Lệnh năm 1861 bắt người có đạo rời làng, chia ra giao cho các làng khác canh giữ (sử; xem mặt sau thẻ chị Nhàn) |
| Thích chữ | Khắc chữ lên da |
| Giáo sĩ | Người đi truyền đạo |
| Tị địa | Bỏ đất đã nhượng cho Pháp, dời sang vùng triều đình còn giữ |

---

## 2. Bàn cờ

### 2.1 Bố cục

Bắc ở trên. Bàn cờ là một vùng **phỏng theo** quanh mặt bắc đại đồn Chí Hoà, không vẽ đúng bản đồ.

- **Đại đồn** ở giữa, lệch về bên trái, phía dưới. **Đồn Hữu (Redoute)** ở góc dưới bên trái: đầu nam phòng tuyến,
  phía chùa Cây Mai.
- **Ngày 24.2**, liên quân từ chùa Cây Mai (ngoài mép dưới) tiến lên đánh đồn Hữu. Tối đó họ còn cách đại đồn chừng
  2 km.
- **Đêm 24–25**, liên quân ngủ lại ở một xóm bỏ hoang phía tây bắc đại đồn (ngoài mép trái). Đường lên Bà Điểm đi
  ngang vùng đó.
- **Ngày 25.2**, liên quân vòng lên phía bắc, đánh vào **mặt bắc** đại đồn. Trục tiến quân đi ngang gò mả, đình,
  ruộng trước đồn (bên trái bàn cờ).
- Quân triều đình rút ra mé đông, rồi về đồn Thuận Kiều phía sau [sử gia kiểm: nguồn ghi khác nhau; trên bàn cờ,
  hướng rút là phỏng theo].
- **Xóm Bưng Lác (hư cấu)** ở phía đông bắc, bên rạch, ngoài trục tiến quân. Nửa xóm đã đi từ mấy tháng trước. [nháp]
  [sử gia kiểm: năm 1861 còn dân ở gần đại đồn không]
- Mùa này là **mùa khô**: lúa gặt từ cuối năm, ruộng còn gốc rạ, đi được như đường đất [sử gia kiểm].

**Theo sử:** đại đồn, đồn Hữu ở đầu nam, hướng đánh ngày 24 và ngày 25. **Phỏng theo:** vị trí từng ô, khoảng cách,
hướng rút. **Hư cấu:** xóm, rạch, đình, chùa, chợ, nhà.

### 2.2 Các ô

Toạ độ x, y từ 0 đến 100. x tính từ trái sang phải, **y tính từ trên xuống**. ▲ = ô có che. Bản 4 dời Cổng hậu xuống
(y 50 → 55) và Kho lương sang phải (x 46 → 48) để đường d và đường b hiện rõ.

| # | Ô | Loại | Che | x | y | Ghi chú |
|---|---|---|---|---|---|---|
| 1 | Đồn Hữu (Redoute) | đồn nhỏ (sử) | ▲ | 14 | 86 | Đầu nam phòng tuyến. Vỡ cuối lượt 2. Ngoài đồn chính: tía không tới. |
| 2 | Cổng hậu | cổng mặt bắc đại đồn (vị trí phỏng theo) | | 38 | 55 | Chỗ liên quân phá vào. Vỡ cuối lượt 5. |
| 3 | Kho lương | kho trong đồn | ▲ | 48 | 68 | Tía Bền bắt đầu ở đây. |
| 4 | Cửa đông | cửa mé đông đồn | | 70 | 62 | Đường lính rút ra phía chợ. Vỡ cuối lượt 6. |
| 5 | Ruộng trước đồn | ruộng khô | | 32 | 38 | Trên trục tiến quân ngày 25. |
| 6 | Gò mả | gò đất, mộ xây | ▲ | 10 | 30 | Lộc bắt đầu ở đây (đi tuần mé tây). |
| 7 | Đình làng | đình (hư cấu) | ▲ | 38 | 18 | |
| 8 | Chợ gốc me | chợ chồm hổm dưới cây me | | 60 | 42 | Ngã tư. Anh Quảng xuất hiện ở đây. |
| 9 | Nhà mình | nhà lá ba gian | ▲ | 70 | 22 | Bà Sáu, Má Thơm, Mận, Út Cò bắt đầu ở đây. Có gia phả, bát nhang, văn tự ruộng. |
| 10 | Bờ tre | luỹ tre sau nhà | ▲ | 80 | 13 | Chị Nhàn xuất hiện ở đây. |
| 11 | Chùa làng | chùa (hư cấu) | ▲ | 76 | 54 | Yên cả đêm. Tối đa 3 người, tính cả người lạ. Cầu khỉ đi từ đây. |
| 12 | Bờ rạch | bờ rạch, đường nước | | 86 | 34 | |
| 13 | Lối ra Bà Điểm | lối ra | — | 30 | 3 | Đóng lượt 3–5. |
| 14 | Lối ra Bến ghe | lối ra | — | 93 | 3 | 3 người mỗi lượt. Chuyến chót lượt 6. |
| 15 | Lối ra bên kia đồng | lối ra | — | 93 | 92 | Mở cả đêm. Chỉ tới được từ Chùa, qua cầu khỉ. |

**Ô 1–4:** "trong đồn" là ô 2, 3, 4 (trong khung đại đồn). Đồn Hữu (1) ở ngoài khung.

**Chùa (hư cấu):** không lửa nào rơi vào chùa. Trò chơi không nói một ngôi chùa thật nào bị bắn, vì chưa có nguồn.

### 2.3 Các đường

Ở mọi chỗ người chơi thấy, nét nối hai ô gọi là **đường**; chữ **lối ra** chỉ dùng cho ô 13–15. Mỗi đường tốn 1 sức,
trừ khi ghi khác. Đi được cả hai chiều.

| Đường | Nối | Ghi chú |
|---|---|---|
| a | 1 – 3 | đường hào dọc luỹ |
| b | 2 – 3 | trong đồn |
| c | 3 – 4 | trong đồn |
| d | 2 – 5 | từ cổng hậu ra ruộng |
| e | 4 – 8 | từ cửa đông ra chợ |
| f | 5 – 6 | bờ ruộng |
| g | 5 – 7 | bờ ruộng |
| h | 5 – 8 | bờ ruộng |
| i | 6 – 7 | |
| j | 6 – 13 | ra lối Bà Điểm |
| k | 7 – 13 | ra lối Bà Điểm |
| l | 7 – 8 | |
| m | 7 – 9 | đường làng |
| n | 8 – 9 | |
| o | 8 – 11 | |
| p | 9 – 10 | |
| q | 10 – 12 | |
| r | 11 – 12 | |
| s | 12 – 14 | ra Bến ghe |
| t | 11 – 15 | **cầu khỉ**, ra thẳng lối bên kia đồng: 2 sức, kể cả khi dẫn người. Không cõng người bị thương nặng qua được. Chùa đủ người thì không ai đi ngang chùa để qua cầu. |
| u | 9 – 12 | **lối bưng** (qua đất trũng, chấm chấm): chỉ đi được trong lượt bà Sáu cũng đi lối này |

Khoảng cách để nhẩm nhanh (bản 3 in cả trên trang luật): Nhà → Bà Điểm 2 đường · Nhà → Chùa 2 · Nhà → Bến ghe 3 (2
nếu đi lối bưng cùng bà Sáu) · Nhà → bên kia đồng: tới Chùa 2 đường, rồi cầu khỉ 2 sức · Kho lương → Nhà 3 · Kho
lương → Chùa 3 · Gò mả → Nhà 2.

### 2.4 Lửa theo từng lượt

`·` yên · **L** Lửa · **T** Tâm · **T↓** Tâm, vỡ cuối lượt · **X** Chặn · **M** mở · **Đ** đóng

| # | Ô | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
|---|---|---|---|---|---|---|---|---|
| 1 | Đồn Hữu | · | T↓ | X | X | X | X | X |
| 2 | Cổng hậu | · | · | · | T | T↓ | X | X |
| 3 | Kho lương | · | · | · | L | T | T↓ | X |
| 4 | Cửa đông | · | · | · | · | L | T↓ | X |
| 5 | Ruộng trước đồn | · | · | · | L | L | L | · |
| 6 | Gò mả | · | L | · | L | · | · | · |
| 7 | Đình làng | · | · | · | L | **L** | **L** | · |
| 8 | Chợ gốc me | · | · | · | **L** | L | L | · |
| 9 | Nhà mình | · | · | · | · | · | T | L |
| 10 | Bờ tre | · | · | · | · | · | L | · |
| 11 | Chùa | · | · | · | · | · | · | · |
| 12 | Bờ rạch | · | · | · | **L** | **L** | L | · |
| 13 | Bà Điểm | M | M | Đ | Đ | Đ | M | M |
| 14 | Bến ghe | M | M | M | M | M | M (chót) | Đ |
| 15 | Bên kia đồng | M | M | M | M | M | M | M |

- **Theo sử:** đồn Hữu mất ngày 24 (lượt 2). Đêm 24–25 không bắn (lượt 3). Sáng 25 pháo bắn mặt bắc (lượt 4). Cổng
  mặt bắc bị phá (lượt 5). Cả đại đồn mất (lượt 6). Lối Bà Điểm đóng khi liên quân ngủ lại, rồi dàn quân ở mé tây
  bắc và bắc (lượt 3–5) [sử gia kiểm].
- **Phỏng theo:** Gò mả ở lượt 2 (chiều 24.2 liên quân tiến lên mé tây đại đồn) [sử gia kiểm]. Gò mả, Đình, Ruộng ở
  lượt 4 (trục tiến quân ngày 25). **Đình ở lượt 5–6** (liên quân giữ mặt bắc sau khi phá cổng) [sử gia kiểm]. **Chợ
  gốc me lượt 4, Bờ rạch lượt 4–5** (bản 4: sáng 25.2 pháo hai bên bắn qua lại mặt bắc, đạn rơi lạc xuống chợ, mé
  rạch) [sử gia kiểm]. Bản 3 thêm lửa ở Đình, bản 4 thêm lửa ở Chợ và Bờ rạch: từ lượt 4, ai rời Nhà mình cũng phải tung
  ít nhất một lần. Bỏ một trong ba ô lửa bản 4 là đường một lần tung mở lại (mục 10.4).
- **Hư cấu:** lửa ở chợ, nhà, bờ tre, bờ rạch ở lượt 4–7. Sử không chép mái nhà nào ở xóm nào cháy. Bàn cờ chỉ nói
  "lửa bén mái lá", không nói ai đốt. Lửa ở Bờ rạch lượt 6: lính rút chen xuống bến, đạn lạc (hư cấu) [sử gia kiểm:
  quân rút có đi ngang rạch nào không].

**Người xuất hiện:** chị Nhàn ở Bờ tre (10) đầu lượt 3. Anh Quảng ở Chợ gốc me (8) đầu lượt 5, đang bị thương nặng.
**Do người viết đặt:** hết lượt 4, Tía Bền bị thương (thẻ sự việc "Đạn chùm", mục 6.2).

### 2.5 Bàn cờ in

- **`board.svg`** cùng thư mục: bản 4 vẽ lại từ `tools/board.py`, cùng hình với bàn cờ trong `kit.pdf`. Mở bằng trình
  duyệt, in A3 ngang, tỉ lệ 100%. Có đủ 15 ô, 21 đường, dấu che, rạch, cầu khỉ (từ Chùa ra lối bên kia đồng), lối
  bưng, hai dải hướng liên quân, chỗ đi tới của từng lối ra, ô "Lạc" bên lề. Không có máy in A3: in bàn cờ A4 hay
  ghép hai tờ A4 trong `kit.pdf`.
- **Vẽ tay:** A3 ngang, lề 1 cm. **ngang (cm) = 1 + x × 0,40**, **dọc (cm) = 1 + y × 0,277**. Mỗi ô là vòng tròn
  chừng 3 cm, ghi số và tên bằng bút đen to.
- Đại đồn: hình chữ nhật tô nhạt màu đất, x 26 đến 70, y 50 đến 80. Một đường đậm "phòng tuyến" nối đồn Hữu với góc
  dưới bên trái đại đồn.
- Rạch: đường xanh từ (90, 0) qua (91, 18), (91, 40), (87, 58), (83, 76) xuống (81, 100). Cầu khỉ bắc qua rạch trên
  đường t, từ Chùa xuống lối ra bên kia đồng.
- Mũi tên liên quân (chỉ để nhìn, không phải ô): một mũi từ mép dưới lên đồn Hữu, ghi "24.2 · liên quân từ chùa Cây
  Mai lên"; một mũi từ góc trên bên trái, dừng trước Ruộng trước đồn, chĩa về Cổng hậu, ghi "25.2 · liên quân vòng
  lên, đánh mặt bắc". Mũi tên không được che đường d (Cổng hậu – Ruộng).
- Ghi ở mép trên: "Xóm Bưng Lác và đại đồn Chí Hoà · bàn cờ phỏng theo, xóm là hư cấu".
- Chú giải ghi: "đường: 1 sức · a–u: tên đường"; "lối bưng (qua đất trũng)".

---

## 3. Sử đã chép

### 3.1 Dải "Sử đã chép" (cả bàn thấy, đặt cạnh bàn cờ từ đầu)

| Lượt | Lúc | Sử đã chép |
|---|---|---|
| 1 | Khuya 23 rạng 24.2.1861 | Liên quân kéo quân ra phía chùa Cây Mai |
| 2 | Sáng – chiều 24.2 · rằm tháng Giêng | Liên quân đánh chiếm đồn Hữu (Redoute), đầu nam phòng tuyến |
| 3 | Tối 24 rạng 25.2 · đêm rằm | Đêm yên, hai bên không bắn |
| 4 | Sáng 25.2 | Liên quân vòng lên phía bắc. Pháo bắn vào mặt bắc đại đồn |
| 5 | Gần trưa 25.2 | Luỹ mặt bắc vỡ, cổng bị phá. Quân triều đình rút |
| 6 | Trưa – chiều 25.2 | Đánh trong thành trong. Cả đại đồn mất |
| 7 | Tối 25.2 | Trận tàn |

**Con số (in ở cuối dải, không đọc to)** [sử gia kiểm]
- Charner tới Sài Gòn đầu tháng 2.1861 (6 hay 7.2), với 50–70 tàu các loại và chừng 3.500 quân.
- Đồn binh Sài Gòn: 800–1.000 người, bị vây từ khoảng tháng 3.1860.
- Liên quân đánh Chí Hoà: chừng 3.500–5.000 người (có nguồn ghi 8.000).
- Quân triều đình: khoảng 12.000 theo một số sách Việt, tới hơn 30.000 theo phía Pháp (Pallu). Sử gia Trần Văn Giàu
  cho là phía Pháp nói tăng.
- Phòng tuyến dài chừng 12 km. Trại chính khoảng 3.000 × 900–1.000 m, tường đất cao 3,5 m, dày 2 m, khoảng 150 khẩu
  pháo.

**Ngày âm lịch.** Đã tính lại theo thiên văn: Tết Tân Dậu là 10.2.1861; 24.2 là rằm, 25.2 là 16 tháng Giêng. Trăng
tròn đêm 24–25. [sử gia kiểm: đối chiếu lịch Hiệp kỷ]

### 3.2 Bảy thẻ lửa (cả bàn thấy)

Thẻ A6. Mặt trước: "Lượt N · lúc". Mặt sau: chỉ có lửa và lối ra, không có chuyện. **Người dẫn giữ xấp thẻ trong
tay**, theo thứ tự; đầu mỗi lượt lật thẻ **lượt sau** cho cả bàn xem.

| Thẻ | Mặt sau in |
|---|---|
| Lượt 1 | Yên khắp nơi. Ba lối ra mở. Nhà mình chưa đi: còn ăn rằm với bà. |
| Lượt 2 | Tâm, vỡ cuối lượt: Đồn Hữu (1). Lửa: Gò mả (6). Ba lối ra mở. Nhà mình chưa đi: còn ăn rằm với bà. |
| Lượt 3 | Chặn: Đồn Hữu (1). Không có lửa. **Bà Điểm đóng** (liên quân đóng ở mé tây bắc). Hết lượt: bà Sáu, Má Thơm, Mận, Út Cò ở Nhà mình (ăn rằm). |
| Lượt 4 | Chặn: 1. Tâm: Cổng hậu (2). Lửa: Kho lương (3), Ruộng trước đồn (5), Gò mả (6), Đình (7), Chợ gốc me (8), Bờ rạch (12). Bà Điểm đóng. |
| Lượt 5 | Chặn: 1. Tâm, vỡ cuối lượt: Cổng hậu (2). Tâm: Kho lương (3). Lửa: Cửa đông (4), Ruộng (5), Đình (7), Chợ gốc me (8), Bờ rạch (12). Bà Điểm đóng. |
| Lượt 6 | Chặn: 1, 2. Tâm, vỡ cuối lượt: Kho lương (3), Cửa đông (4). Tâm: Nhà mình (9). Lửa: Ruộng (5), Đình (7), Chợ gốc me (8), Bờ tre (10), Bờ rạch (12). **Bà Điểm mở lại. Bến ghe: chuyến chót.** |
| Lượt 7 | Chặn: 1–4. Lửa: Nhà mình (9). **Bến ghe đóng.** |

### 3.3 Kịch bản từng lượt (chỉ người dẫn giữ)

In thành tờ riêng, không để trên bàn. Mỗi lượt có ba phần:
- **Sử đã chép** (sử): đọc to. Sự kiện theo nguồn; lời văn là [nháp], người viết sửa giọng.
- **Ở xóm (hư cấu)**: in trong khung riêng, chữ nghiêng, khác kiểu chữ "Sử đã chép". Đọc to cả tiêu đề "Ở xóm".
- **Việc của người dẫn**: không đọc.

---

**LƯỢT 1 · Khuya 23 rạng sáng 24.2.1861 (14 rạng 15 tháng Giêng)**

*Sử đã chép.* Ngày 23.2.1861, liên quân Pháp – Tây Ban Nha kéo quân ra phía chùa Cây Mai, gần Chợ Lớn. Trước mặt họ
là phòng tuyến Chí Hoà dài chừng 12 km, do Nguyễn Tri Phương giữ.

> **Ở xóm (hư cấu)** [nháp]
> Khuya. Trăng gần tròn. Nửa xóm đã đi từ mấy tháng trước. Chó sủa từng chặp. Phía nam có tiếng bánh xe nghiến đường
> đất, rồi im.

*Việc của người dẫn.* Không đặt lửa. Lật thẻ lửa lượt 2. Lượt này để học luật: ai hỏi thì trả lời ngắn.

---

**LƯỢT 2 · Sáng – chiều 24.2 (rằm tháng Giêng)**

*Sử đã chép.* Khoảng 4 giờ 30 sáng, pháo Pháp trên phòng tuyến các chùa bắt đầu bắn. 5 giờ 30, liên quân từ Cây Mai
tiến lên, bắn rồi đánh đồn Hữu, người Pháp gọi là Redoute. Bộ binh Pháp và Tây Ban Nha (phần đông lính Tây Ban Nha là
người Philippines) đánh chừng hai giờ thì đồn mất. Tướng Vassoigne (Pháp) và đại tá Palanca (Tây Ban Nha) bị thương.
Chiều, quân triều đình cho voi xông ra, bị đẩy lui. Tối, liên quân còn cách đại đồn chừng 2 km.
[sử gia kiểm: giờ theo Pallu và HistoryNet; pháo dã chiến bắn đồn Hữu từ chừng 1.100 m rồi 500 m; khoảng 15 giờ liên
quân tiến tiếp, khoảng 16 giờ voi xông ra]

> **Ở xóm (hư cấu)** [nháp]
> Tiếng đại bác dội qua ruộng từ phía nam. Mái lá rung. Gà trong chuồng kêu loạn. Con nít trong xóm tưởng sấm.

*Việc của người dẫn.* Đặt lửa lượt 2. Lật thẻ lửa lượt 3. Hết lượt: ai còn ở đồn Hữu thì lạc; Lộc phải đang ở Gò mả
(Lộc đi tuần; Gò mả có Lửa, ô có che: Lộc tung, ra 6 là gặp nạn).

---

**LƯỢT 3 · Tối 24 rạng 25.2 (đêm rằm)**

*Sử đã chép.* Đêm đó yên lặng. Hai bên không bắn (Pallu, sĩ quan Pháp có mặt). Liên quân ngủ lại trong một xóm bỏ
hoang, đã bị phá một phần, cách góc tây bắc đại đồn chừng 1,5 km. [sử gia kiểm]

> **Ở xóm (hư cấu)** [nháp]
> Trăng rằm sáng tới mức thấy rõ từng bụi tre. Không một tiếng súng. Nhà nào còn người thì thắp nhang cúng rằm.

*Việc của người dẫn.* Đặt Chặn ở đồn Hữu, đặt thẻ "Đóng" lên lối Bà Điểm. Lật thẻ lửa lượt 4. Rồi đọc **thẻ sự việc
"Bờ tre"** (mục 6.1). Nhắc một câu: "Người nhà mình ở Nhà lúc hết lượt này là đã cúng rằm cùng bà Sáu. Chị Nhàn có ở
đó thì Sổ ghi chị ngồi nhờ, không tính là cúng." Hết lượt: bà Sáu, Má Thơm, Mận, Út Cò phải ở Nhà mình (ăn rằm).
Người giữ bút ghi Sổ D ngay: ai cúng, ai ngồi nhờ, nhà mình đã làm gì khi chị Nhàn tới.

---

**LƯỢT 4 · Sáng 25.2 (16 tháng Giêng)**

*Sử đã chép.* 5 giờ sáng, liên quân lên đường, vòng lên phía bắc đại đồn. Khoảng 10 giờ, họ dàn quân cách mặt bắc
chừng 2 km. Trong hàng có lính Pháp, lính người Philippines dưới quyền sĩ quan Tây Ban Nha, một đại đội lính người
Việt, và phu khiêng thang. Pháo tiến dần tới 1.000 m, 500 m, rồi 200 m, bắn đạn chùm vào luỹ. Mặt trời buổi sáng chiếu
vào mắt pháo thủ liên quân (Pallu).
[sử gia kiểm: thành phần liên quân theo HistoryNet; phu khiêng thang, có nguồn nói là người Hoa mộ ở Quảng Đông]

> **Ở xóm (hư cấu)** [nháp]
> Sáng sớm im. Trong đồn có tiếng chiêng, tiếng trống. Nắng lên cao thì pháo nổ, lần này ở mé bắc, gần hơn, dồn hơn.
> Đất dưới chân rung. Có đạn rơi lạc xuống chợ, xuống mé rạch.

*Việc của người dẫn.* Đặt lửa lượt 4 (đủ sáu thẻ Lửa, có Chợ và Bờ rạch). Lật thẻ lửa lượt 5. Lượt đầu được ra lối ra:
để bàn bàn, khoảng 11 phút. Hết lượt, sau khi tung: đọc **thẻ sự việc "Đạn chùm"** (mục 6.2). Một câu.

---

**LƯỢT 5 · Gần trưa 25.2**

*Sử đã chép.* Liên quân vượt sáu hàng hố chông và hai lớp hào. Thang tre gãy; lính trèo lên vai nhau, ném lựu đạn,
móc câu lên luỹ. Công binh phá cổng bằng rìu. Chưa tới nửa giờ, tường ngoài mặt bắc vỡ. Quân triều đình rút.

> **Ở xóm (hư cấu)** [nháp]
> Từ mé đông đồn, lính túa ra. Có người chạy, có người khiêng nhau. Có người còn cầm giáo, có người không.

*Việc của người dẫn.* Nói: "**Đây là lệnh rút.** Từ lượt này Tía Bền được rời đồn." Đặt lửa lượt 5. **Lật thẻ lửa
lượt 6 trước**, để cả bàn thấy nhà mình sẽ thành Tâm. Đặt anh Quảng ở Chợ gốc me (8), bị thương nặng (2 kẹp), cầm lá
thư. Gõ ba tiếng. Đọc [nháp]: "Anh Quảng bị thương nặng. Nếu tới hết đêm chưa được băng, anh sẽ mang tật theo suốt
đời." Rồi mới đọc **thẻ Khoảnh khắc** (mục 6.3). Rồi cả bàn mới đi quân; hỏi từng người (mục 8.3). Hết lượt: ai còn ở
Cổng hậu thì lạc.

---

**LƯỢT 6 · Trưa – chiều 25.2**

*Sử đã chép.* Liên quân đánh tiếp vào thành trong, sách Pháp gọi là "thành Quan". Cả đại đồn mất. Nguyễn Tri Phương
trúng mảnh đạn, bị thương. Em ông là Nguyễn Duy, và Tôn Thất Trĩ, tử trận. Quân triều đình rút về đồn Thuận Kiều phía
sau.
[sử gia kiểm: giờ kết thúc trận (HistoryNet ghi cuối buổi sáng; một bài tiếng Việt ghi 8 giờ tối, không dẫn nguồn);
chức của Nguyễn Duy; có nguồn ghi Nguyễn Tri Phương qua rạch Thị Nghè về thẳng Biên Hoà]

> **Ở xóm (hư cấu)** [nháp]
> Lửa bén mái lá đầu xóm. Lính rút ngang chợ, xuống mé rạch. Khói che nửa trời.

*Việc của người dẫn.* Đặt lửa lượt 6. Lật thẻ lửa lượt 7. Nói: "Bến ghe: chuyến chót." **Không nói ai đốt.** Hết
lượt: ai còn ở Kho lương, Cửa đông thì lạc, đồ ở đó mất. Một câu.

---

**LƯỢT 7 · Tối 25.2**

*Sử đã chép.* Trận tàn. Liên quân đóng trong đại đồn. Ba ngày sau (28.2), quân triều đình bỏ đồn Thuận Kiều, rút về
Biên Hoà. Trương Định đưa quân về Gò Công. Mấy tháng sau, quân Pháp chiếm Mỹ Tho (4.1861), rồi Biên Hoà (12.1861).
[sử gia kiểm]

> **Ở xóm (hư cấu)** [nháp]
> Tiếng súng thưa rồi tắt. Khói còn nằm trên ruộng. Mái nhà mình cháy từ trưa, giờ sụp. Ngoài ruộng có người cầm đuốc
> đi kiếm người nhà.

*Việc của người dẫn.* Đặt lửa lượt 7, đặt "Đóng" lên Bến ghe. Không còn thẻ để lật. Hết lượt: làm "Hết đêm" (mục 5.9),
rồi đọc Kết (mục 7.2).

---

## 4. Người trong nhà

Thẻ A6. Mặt trước: tên thật to, tuổi, một dòng về người, nét, làm được, mang theo, câu nói, ô bắt đầu. Hai vòng tròn
để hạt đậu sức. Góc dưới in **"Người hư cấu"**. Chữ nghiêng là đoạn kể [nháp].

*Nhà ông bà Sáu, họ Đỗ, ở xóm Bưng Lác (hư cấu), gần đại đồn Chí Hoà. Ông Sáu mất đã ba năm.* [nháp]

> Chia vai cho 4 người chơi: chủ dự án giữ bút, cầm Má Thơm và Út Cò · một người cầm Tía Bền · một người cầm Bà Sáu
> và Mận · một người cầm Lộc. Ba người chơi: gộp Tía Bền với Lộc. Năm người: tách Bà Sáu và Mận.
> Người lạ: người dẫn đưa thẻ cho người chơi có ít người nhà còn trên bàn cờ nhất. Bằng nhau thì đưa thẻ cho người
> chơi lớn tuổi nhất trong số đó (tuổi người chơi, không phải tuổi nhân vật).

---

### BÀ SÁU · 66 tuổi
*Bà nội. Ông Sáu mất đã ba năm.* [nháp]
- **Nét:** Giữ lễ.
- **Làm được:** 1 sức. Dẫn được Út Cò còn lành (1 sức mỗi đường); Út Cò đứng cùng bà thì không lạc. Bà không cầm đồ.
- **Lối bưng** (qua đất trũng, Nhà mình ↔ Bờ rạch): chỉ đi được trong lượt bà cũng đi lối đó; ai đi cùng lượt với bà
  cũng được.
- **Mang theo:** túi trầu (không phải đồ). Bát nhang ở trên bàn thờ.
- **Không chịu:** rời nhà trước khi hết lượt 3 (cúng rằm); hết lượt 3, má, Mận, Út Cò cũng ở nhà ăn rằm. Rời nhà khi
  không có người cầm bát nhang đi cùng (hết mỗi lượt, người đó đứng cùng ô với bà). Bát nhang không rời nhà trước bà;
  chỉ rời tay người cầm khi buông lúc gặp nạn, hay đưa cho người đứng cùng ô với bà. Bà bị thương nặng thì được cõng
  đi, không phải chờ.
- **Câu** [nháp]: "Chạy giặc thì chạy. Mà ông bây phải đi theo."
- **Bắt đầu:** Nhà mình (9).

### TÍA BỀN · 43 tuổi
*Con thứ ba của ông bà Sáu. Đi xâu đắp luỹ ở đại đồn từ năm ngoái.* [nháp] [sử gia kiểm: dân phu ở Chí Hoà]
- **Nét:** Khoẻ.
- **Làm được:** 2 sức. Dẫn ai cũng chỉ 1 sức mỗi đường. Còn lành thì cõng người bị thương nặng một mình được (2 sức
  mỗi đường). Người bị thương không cõng ai.
- **Mang theo:** đôi quang gánh đất (để lại trong đồn, không phải đồ).
- **Không chịu:** bỏ đồn trước lệnh rút (lượt 5). Đồn là các ô 2, 3, 4 (trong khung đại đồn). Tía không tới Đồn Hữu (1).
- **Câu** [nháp]: "Đứa nào đi không nổi thì leo lên lưng tía."
- **Bắt đầu:** Kho lương (3).

### MÁ THƠM · 39 tuổi
*Vợ Tía Bền. Người làng bên kia đồng, về làm dâu năm mười bảy tuổi.* [nháp]
- **Nét:** Biết thuốc.
- **Làm được:** 2 sức. Băng bó chỉ tốn 1 sức.
- **Mang theo:** túi lá thuốc, xấp vải sạch xé sẵn (không phải đồ).
- **Không chịu:** ra lối ra khi tía còn trong đồn (ô 2–4); tới chùa thì được. Tía ra khỏi đồn trong lượt nào (đi
  trước má), hay lạc, thì má ra lối ra được ngay lượt đó.
- **Câu** [nháp]: "Chưa thấy mặt tía tụi bây, má không đi đâu hết."
- **Bắt đầu:** Nhà mình (9).

### LỘC · 19 tuổi
*Con trai đầu, trong nhà kêu anh Hai. Đi tuần đêm với trai làng.* [nháp]
- **Nét:** Gan.
- **Làm được:** 2 sức. **Một lần trong đêm**, nói trước khi đi: thêm 2 sức (đang bị thương cũng được; không cộng với
  +2 ở Khoảnh khắc trong cùng lượt).
- **Đi tuần:** hết lượt 2, Lộc phải ở Gò mả.
- **Mang theo:** cây đuốc, cái mõ tuần (không phải đồ).
- **Câu** [nháp]: "Má cứ lo nhà. Con lên kiếm tía."
- **Bắt đầu:** Gò mả (6), đang tuần mé tây.

### MẬN · 14 tuổi
*Con gái, trong nhà kêu chị Ba. Ông nội dạy cho mấy chữ trước khi mất.* [nháp]
- **Nét:** Lanh chân.
- **Làm được:** 3 sức. Là người lớn trong luật: dẫn, cõng, băng được, tốn như mọi người.
- **Mang theo:** hai tay không.
- **Câu** [nháp]: "Cuốn sổ này con ôm. Ai giựt con cũng không buông."
- **Bắt đầu:** Nhà mình (9).

### ÚT CÒ · 7 tuổi
*Con út. Ở nhà kêu là Cò vì ốm nhom.* [nháp]
- **Nét:** Nhỏ.
- **Làm được:** 1 sức. Ai dẫn em chỉ tốn 1 sức mỗi đường; em bị thương thì tốn 2, như dẫn người bị thương.
- **Gặp nạn:** chỉ tới bị thương, không bao giờ bị thương nặng. Đã bị thương mà gặp nạn nữa khi đang cầm đồ thì phải
  buông đồ.
- **Lạc khi:** hết lượt ở ô có lửa (Lửa hay Tâm) mà không có người lớn nhà mình (kể cả bà Sáu) đứng cùng.
- **Mang theo:** con cào cào lá dừa tía thắt cho hồi Tết (một món đồ).
- **Câu** [nháp]: "Bà ơi, trời chưa sáng mà sao bên kia đỏ vậy?"
- **Bắt đầu:** Nhà mình (9).

---

### ANH QUẢNG · 24 tuổi · người lạ
*Tên thật Lê Văn Khiêm [nháp: người viết đặt]. Ở trại ai cũng kêu là anh Quảng. Lính triều đình, quê Mộ Đức, Quảng
Ngãi, đóng kế trại phu. Biết chữ, đã viết giùm lá thư của Tía Bền (mục 7.1).* [nháp] [sử gia kiểm: lính Quảng Ngãi ở
Gia Định năm 1861]
- **Xuất hiện:** lượt 5, ở Chợ gốc me (8), đang **bị thương nặng**.
- **Đi:** chỉ khi được cõng hay dẫn. Được băng thì thành bị thương; khi đó một người lớn dẫn được.
- **Mang theo:** lá thư gửi mẹ ở Mộ Đức (một món đồ; ngoài thư có tên thật của anh).
- **Tung:** không bao giờ (người lạ không tung xúc xắc). Hết đêm còn bị thương nặng mà không ai băng thì mang tật.
- **Muốn** [nháp]: theo đồng đội rút. Không thì tìm chỗ nằm cho qua đêm.
- **Câu** [nháp; nhờ người nói giọng Quảng Ngãi chỉnh]: "Tui ở Mộ Đức. Mẹ tui còn ở nhà, một mình."

### CHỊ NHÀN · 26 tuổi · người lạ
*Người có đạo. Ở một xóm bên kia bưng, chạy ra từ chiều. Bồng đứa con trai chín tháng.* [nháp] [sử gia kiểm: năm 1861
người có đạo còn ở quanh đại đồn không]
- **Xuất hiện:** lượt 3, ở Bờ tre (10).
- **Đi:** tự đi 1 đường mỗi lượt, không tốn sức của ai (bồng con nên chậm). Được dẫn thì đi theo người dẫn. Qua cầu
  khỉ phải có người nhà dẫn. Đi lối bưng thì đi cùng lượt với bà Sáu.
- Không cầm thêm đồ, không dẫn ai.
- **Tung:** không bao giờ (người lạ không tung xúc xắc).
- **Đứa nhỏ** luôn ở trong tay chị. Đứa nhỏ không bao giờ bị tung xúc xắc. Đứa nhỏ không phải là đồ, không tính chỗ.
- **Muốn** [nháp]: chị tự đi, nhưng chỉ đi cùng ô với một người nhà mình tới chỗ yên (chùa, ghe, lối ra). Ngồi nhờ
  tới sáng, rồi về nhà má ruột ở một làng xa mé đồn (hư cấu).
- **Câu** [nháp]: "Cho tui ngồi nhờ tới sáng. Sáng tui tự đi."
- **Người cầm thẻ** quyết chị đi lúc nào, đi đâu, theo dòng "Muốn".
- **Hết đêm** chị chưa tới chỗ yên cùng nhà mình thì sáng ra chị đi một mình. Sổ ghi: không ai biết chị tới đâu. Không
  tung xúc xắc, không ai bị thương.

---

**Mặt sau thẻ chị Nhàn: Chuyện cấm đạo (sử)** · *đọc khi bàn hỏi, hoặc lúc ghi Sổ* · [nháp] [sử gia kiểm toàn hộp]

> Từ thời Minh Mạng (1833), rồi dưới thời Thiệu Trị, và dưới thời Tự Đức từ 1848, triều Nguyễn nhiều lần ra lệnh cấm
> đạo Thiên Chúa. Cuối 1859 và đầu 1860 lệnh ngặt hơn: triều đình lo người có đạo theo giúp quân Pháp. Có người có
> đạo làm thông ngôn, dẫn đường cho Pháp. Phần đông thì không, và không nổi dậy như phía Pháp, nghe lời vài giáo sĩ
> người Pháp, từng trông đợi. Pháp cũng lấy cớ bảo vệ giáo sĩ để đem quân sang năm 1858.
>
> Ngày 5.8.1861, chừng năm tháng sau đêm nay, triều đình ra lệnh **phân sáp**, nghĩa là chia người có đạo ra, cài
> xen vào làng khác. Người có đạo bị bắt rời làng mình, giao về các làng không theo đạo canh giữ: năm người không theo
> đạo coi một người có đạo. Nhà thờ, xóm đạo bị phá. Ruộng đất bị lấy chia cho người khác. Má bị thích (khắc) hai chữ
> "tả đạo", nghĩa là đạo sai. Nhiều nhà bị chia lìa. Có người chết trong tù, có người chết trên đường bị giải đi.
>
> Lệnh này thi hành ở những nơi triều đình còn nắm, nặng nhất ở Bắc Kỳ và Trung Kỳ. Ở Sài Gòn – Chợ Lớn, khi đó đã
> thuộc quyền Pháp, lệnh không thi hành được.
>
> Số người có đạo chết, bị tù trong những năm này: bộ chơi chưa có con số đối chiếu được nguồn. Sẽ ghi khoảng số và
> tên nguồn khi đã tra.
>
> Hoà ước 5.6.1862 buộc triều đình để người có đạo tự do giữ đạo. Lệnh phân sáp được bãi sau đó.
>
> *Chị Nhàn, xóm của chị và gia đình chị là hư cấu. Việc cấm đạo và lệnh phân sáp là có thật. Ngày tháng và nội dung
> lệnh phân sáp chủ yếu lấy từ nguồn giáo hội, còn phải đối chiếu với Đại Nam thực lục.*

---

## 5. Luật đầy đủ cho người dẫn

### 5.1 Thứ tự một lượt

1. **Đọc** "Sử đã chép" và "Ở xóm (hư cấu)" của lượt này (mục 3.3).
2. **Đặt lửa** theo thẻ lửa lượt này (đã lật từ lượt trước). Gỡ lửa lượt trước. Cờ "vỡ" lên ô T↓. Thẻ "Đóng" lên lối
   ra đóng.
3. **Lật thẻ lửa lượt sau** (người dẫn giữ xấp thẻ), để cạnh bàn cờ.
4. **Sự việc** nếu có: lượt 3 (chị Nhàn), lượt 5 (anh Quảng, Khoảnh khắc).
5. **Bàn và đi quân.** Ai cầm người nào thì đi người đó, thứ tự tuỳ ý. Đặt hạt đậu sức lên thẻ, dùng tới đâu gạt
   tới đó. Đổi ý được tới khi cả bàn nói "xong".
6. **Tung xúc xắc**, theo thứ tự đã đi: trước là các lần đi ngang ô Lửa, sau là người đứng ở ô Lửa, Tâm. Bước ra khỏi
   ô mình đứng từ đầu lượt thì không tung. Người lạ không tung.
7. **Kiểm tra.** Ô vỡ: ai còn ở đó thì lạc, đồ ở đó mất. Út Cò. Đồ nằm ở ô Tâm. Người cầm bát nhang đứng cùng ô với
   bà Sáu. Hết lượt 2: Lộc ở Gò mả. Hết lượt 3: bà Sáu, Má Thơm, Mận, Út Cò ở Nhà mình. Lộc gặp tía (mục 6.4). Hết
   lượt 4: thẻ "Đạn chùm" (mục 6.2).
8. **Một câu** (lượt 4, 6): hỏi một người chơi, mỗi lần một người khác (mục 8.3).

### 5.2 Sức

| Ai | Sức mỗi lượt |
|---|---|
| Người lớn lành (Tía Bền, Má Thơm, Lộc) | 2 |
| Mận | 3 |
| Lộc, một lần trong đêm | +2 (cộng cả khi bị thương; không cộng với +2 ở Khoảnh khắc trong cùng lượt) |
| Bà Sáu, Út Cò | 1 |
| Ai đang bị thương | 1 |
| Ai đang bị thương nặng | 0 (phải được cõng) |
| Người nói ở Khoảnh khắc | +2, chỉ lượt 5; phải còn trên bàn cờ, phải tới hay đi ngang gốc me |
| Chị Nhàn | tự đi 1 đường |
| Anh Quảng | 0 (đi theo người nhà) |

Sức không để dành. **Người lớn** trong luật này là Tía Bền, Má Thơm, Lộc, Mận: dẫn, cõng, băng được. **Người bị
thương không cõng ai.** Bà Sáu không cõng, không băng, không cầm đồ, chỉ dẫn được Út Cò.

### 5.3 Các việc

| Việc | Tốn | Ai làm | Luật |
|---|---|---|---|
| **Đi** | 1 sức mỗi đường · cầu khỉ 2 | ai còn sức | Không vào, không đi ngang ô Tâm, ô Chặn. Bước ra khỏi ô mình đứng từ đầu lượt thì không tung, dù ô đó có Lửa hay Tâm. Đi ngang ô Lửa: tung, ra 6 là gặp nạn. |
| **Dẫn** (bà Sáu, người bị thương, người lạ) | 2 sức mỗi đường · dẫn Út Cò lành 1 (bị thương 2) · Tía Bền 1 · cầu khỉ vẫn 2 | người lớn · bà Sáu chỉ dẫn Út Cò | Hai người đi chung, người được dẫn không tốn sức. |
| **Cõng** người bị thương nặng | mỗi người cõng 2 sức mỗi đường | hai người lớn lành cùng ô, cùng đi · hoặc Tía Bền một mình khi còn lành | Người bị thương không cõng ai. Không qua cầu khỉ. |
| **Băng bó** | 2 sức · Má Thơm 1 | người lớn, đứng cùng ô với người bị thương nặng (kể cả ô đi ngang) | Bị thương nặng thành bị thương (gỡ 1 kẹp). Đêm nay không băng được từ bị thương thành lành. |
| **Đồ** | 0 | ai cũng được, trừ bà Sáu và chị Nhàn | Mỗi người cầm 1 món, kể cả khi đang dẫn hay cõng. |
| **Đứng yên** | 0 | ai cũng được | |

### 5.4 Lửa và xúc xắc

| Ô | Hết lượt đứng ở đó, ô trống | Hết lượt đứng ở đó, ô có che | Đi ngang |
|---|---|---|---|
| Lửa | gặp nạn khi ra 5–6 | gặp nạn khi ra 6 | gặp nạn khi ra 6 |
| Tâm | gặp nạn khi ra 3–6 | gặp nạn khi ra 4–6 | không được đi ngang |
| Chặn | không vào được | | |

- **Ô có che:** 1, 3, 6, 7, 9, 10, 11.
- **Bước ra khỏi ô mình đứng từ đầu lượt thì không tung**, dù ô đó có Lửa hay Tâm.
- Người nhà tung riêng từng người, kể cả người đang được cõng. **Người lạ không tung.**
- Đi ngang nhiều ô Lửa thì tung mỗi ô một lần.
- Người dẫn **không** nói phần trăm. Chỉ nói "ra mấy thì gặp nạn".

### 5.5 Trạng thái

| Trạng thái | Đánh dấu | Sức | Ý nghĩa |
|---|---|---|---|
| **Lành** | không kẹp | đủ | |
| **Bị thương** | 1 kẹp giấy | 1 | Đi được, chậm. Không cõng ai. Hết đêm: lành dần sau vài tuần. |
| **Bị thương nặng** | 2 kẹp giấy | 0 | Không tự đi. Phải cõng. Người dẫn gõ bàn và báo trước (mục 8.4). |
| **Mang tật** | cột một sợi chỉ nâu vào quân | như bị thương nặng tới hết đêm | Hết đêm còn bị thương nặng, hoặc đang bị thương nặng mà gặp nạn thêm. Người chơi nói một dòng cho Sổ: tật đó theo người ấy ra sao (đi đứng, làm ruộng, ra chợ). |
| **Lạc** | dời quân sang ô "Lạc" bên lề, ghi ô cuối cùng | — | Không phải là mất. Mùa sau đi tìm. |

**Không có trạng thái "chết" trong buổi này.** Không kết quả xúc xắc nào làm một người có tên chết.

- **Đang cầm đồ mà gặp nạn:** người chơi chọn ngay: chịu thương, hay té, buông đồ mới chạy kịp. Buông thì người không
  sao, và tung cho món đồ: ra 4–6 là mất; ra 1–3 là đồ rơi ở ô mình gặp nạn (gặp nạn khi đi ngang thì là ô đi ngang),
  đêm nay không ai nhặt lại được. Người đang dẫn, đang cõng cũng được chọn vậy.
- **Út Cò:** gặp nạn chỉ tới bị thương. Đã bị thương mà gặp nạn nữa thì không thêm gì, nhưng đang cầm đồ thì phải buông.
  Em bị thương thì dẫn em tốn 2 sức như dẫn người bị thương; bà Sáu không dẫn được.
- **Người lạ:** cùng thang lành, bị thương, bị thương nặng, mang tật như người nhà. Không bao giờ chết. Không lạc trong
  đêm. **Không tung xúc xắc**, nên không gặp nạn; đứng cùng ô với người lạ không làm họ nguy hơn. Hết đêm còn bị
  thương nặng mà không ai băng thì mang tật, kể cả khi đã ra lối ra hay đã rời bàn cờ (anh Quảng, câu 2).
- **Lạc xảy ra khi:** hết lượt mà còn ở ô vỡ (kể cả người bị thương nặng); Út Cò hết lượt ở ô Lửa hay Tâm mà không có
  người lớn nhà mình (kể cả bà Sáu) đứng cùng.

### 5.6 Đồ

| Đồ | Lúc đầu ở đâu | Ghi chú |
|---|---|---|
| Gia phả | Nhà mình, gói vải tẩm dầu rái, bỏ trong ống tre | Sổ chép tên, ngày giỗ ông bà; ông nội chép bằng chữ Nôm [sử gia kiểm] |
| Bát nhang | Nhà mình, trên bàn thờ | Không rời nhà trước bà Sáu. Từ khi bà rời nhà, người cầm bát nhang hết mỗi lượt đứng cùng ô với bà. Chỉ rời tay người cầm khi buông lúc gặp nạn, hay khi đưa cho người đứng cùng ô với bà; không đặt xuống. |
| Văn tự ruộng | Nhà mình, trong rương nhỏ | |
| Con cào cào lá | Trong tay Út Cò | Đồ của riêng em. |
| Thư anh Quảng | Trong áo anh Quảng (lượt 5) | Xem Khoảnh khắc. |

- **Buông** (khi gặp nạn): tung cho món đồ. Ra 4–6: mất. Ra 1–3: rơi, nằm lại ô mình gặp nạn (đi ngang thì ô đi
  ngang); đêm nay không ai nhặt. Hết đêm Sổ ghi "rơi ở ___" hay "mất"; mùa sau đi tìm.
- **Đặt** (tự đặt xuống, không do gặp nạn): ai đứng cùng ô thì nhặt được.
- Đồ nằm ở ô **Tâm** lúc hết lượt: tung một lần, ra 4–6 là mất (cháy, vùi), 1–3 là còn.
- Đồ nằm ở ô **vỡ** lúc hết lượt: mất.
- Đồ nằm ở ô Lửa hay ô yên: còn nằm đó.
- Bát nhang đã rơi hay mất rồi thì bà Sáu đi được mà không cần ai cầm theo.

### 5.7 Lối ra, chùa

- **Ăn rằm:** trước khi hết lượt 3, không ai trong nhà ra lối ra; hết lượt 3, bà Sáu, Má Thơm, Mận, Út Cò ở Nhà mình.
  Lộc tuỳ ý (cúng rằm hay lên đồn).
- **Bà Điểm (13):** mở lượt 1–2 và 6–7. Ra là lên nhà bà con ở Bà Điểm (hư cấu).
- **Bến ghe (14):** lượt 1–6, mỗi lượt nhiều nhất 3 người bước lên ghe (tính cả người lạ; con chị Nhàn không tính).
  Ai lên trước do bàn chọn. Ghe ngược rạch, về một xóm bà con ở xa mé đồn (hư cấu).
- **Bên kia đồng (15):** mở cả đêm. Chỉ tới được từ Chùa, qua cầu khỉ (2 sức). Ra là về làng bên ngoại, quê Má Thơm
  (hư cấu).
- Bước tới ô lối ra là ra khỏi bàn cờ, yên tới sáng, không quay lại. Người được dẫn, được cõng ra cùng người dẫn.
- **Chùa (11):** yên cả đêm, tối đa 3 người của bàn (người nhà và người lạ; con chị Nhàn không tính). Ra vào tự do.
  Đủ 3 thì không ai vào, không ai đi ngang, kể cả để qua cầu khỉ.
- **Má Thơm** không bước ra lối ra khi Tía Bền còn ở ô 2–4. Tới chùa thì được. Tía ra khỏi đồn trong lượt nào thì má
  ra được ngay lượt đó, nếu tía đi trước.
- **Chị Nhàn** chỉ tới chùa, ghe, lối ra khi đi cùng ô với một người nhà mình trong lượt đó.

### 5.8 Phân xử nhanh

- **Sức** tính ở đầu lượt. Được băng giữa lượt thì lượt sau mới có 1 sức.
- **Được dẫn, được cõng:** tự đi trước rồi mới được dẫn thì được. Đã được dẫn, được cõng rồi thì lượt đó thôi tự đi.
  Người đang được dẫn, được cõng thì không dẫn ai.
- Mỗi lượt, mỗi người lớn dẫn hay cõng **nhiều nhất một người**.
- **Băng, nhặt, đặt, đưa đồ:** làm ở ô nào mình có mặt trong lượt, kể cả ô đi ngang.
- **Tung:** làm hết ở bước tung, theo thứ tự đã đi. Gặp nạn khi đi ngang thì người đó vẫn tới chỗ đã đi; buông đồ thì
  đồ rơi ở ô đi ngang.
- **Bước ra** khỏi ô mình đứng từ đầu lượt: không tung, dù ô đó có Lửa hay Tâm.
- **Mận:** luôn 3 sức (bị thương thì 1). Là người lớn. Dẫn, cõng vẫn tốn như người khác.
- **Lộc:** +2 cộng cả khi bị thương; không cộng với +2 ở Khoảnh khắc trong cùng lượt.
- **Người bị thương** không cõng ai, kể cả Tía Bền sau thẻ "Đạn chùm".
- **Bát nhang:** người cầm phải đứng cùng ô với bà lúc hết mỗi lượt, từ khi bà rời nhà. Bát nhang chỉ rời tay người cầm
  khi buông lúc gặp nạn, hay khi đưa cho người đứng cùng ô với bà; không đặt xuống. Rơi hay mất rồi thì luật này thôi.
- **Út Cò bị thương:** dẫn em tốn 2 sức như dẫn người bị thương. Gặp nạn nữa khi cầm đồ thì em phải buông.
- **Lối bưng:** chỉ đi được trong lượt bà Sáu cũng đi lối đó. Ai đi cùng lượt với bà thì đi được, kể cả chị Nhàn.
- **Chùa:** ra vào tự do; đủ 3 người thì không ai vào, không ai đi ngang, kể cả để qua cầu khỉ. Con chị Nhàn không
  tính chỗ.
- **Ghe:** mỗi lượt 3 người bước lên; ai lên trước do bàn chọn.
- **Dẫn, cõng ai ra lối ra** thì người dẫn ra theo.
- **Người lạ** không tung xúc xắc, không lạc trong đêm.
- **Mang tật:** hết đêm còn bị thương nặng, hoặc đang bị thương nặng mà gặp nạn thêm. Đã băng (thành bị thương) mà gặp
  nạn lại thì thành bị thương nặng lần nữa, phải băng lần nữa.
- **Luật không nói:** người dẫn quyết trong 30 giây, theo hướng dễ cho người nhà, rồi ghi câu hỏi vào phiếu quan sát.

### 5.9 Hết đêm (sau khi tung xúc xắc lượt 7)

1. Ai còn **bị thương nặng** (người nhà; người lạ còn trên bàn cờ, đã ra lối ra, hay đã rời bàn cờ như anh Quảng ở
   câu 2): mang tật. Người chơi nói một dòng về tật đó.
2. Người còn ở ô nào thì ghi ô đó. Người đã ra lối nào thì ghi lối đó.
3. Đồ còn trong tay ai, rơi ở đâu, đặt ở đâu, mất.
4. Người lạ: ở đâu, ra sao. Chị Nhàn chưa tới chỗ yên cùng nhà mình thì sáng ra chị đi một mình.
5. Đọc Kết (mục 7.2), rồi ghi Sổ mục A, B: mỗi người nói to, người giữ bút viết (mục 7.3, 8.5). Mục D đã ghi lúc chơi.

### 5.10 Hỏi nhanh

- *Nhà mình có súng không?* Không. Đêm nay nhà mình không cầm vũ khí. Việc của nhà mình là lo cho người.
- *Đánh lại được không, cứu đồn được không?* Không. Sử đã chép.
- *Ghe đi đâu? Lối này ra đâu?* Xem bảng lối ra trên trang luật.
- *Hai người cõng một người bị thương nặng, một người hết sức thì sao?* Không cõng được đường đó. Phải đủ sức cả hai.
- *Người bị thương cõng được không?* Không. Người bị thương không cõng ai.
- *Út Cò đi một mình được không?* Được, 1 đường mỗi lượt. Nhớ luật lạc.
- *Người bị thương nặng có lạc không?* Chỉ khi còn ở ô vỡ.
- *Đứng cùng ô với người lạ ở chỗ có lửa thì người lạ có tung không?* Không. Người lạ không tung xúc xắc.
- *Đã ra lối ra rồi còn giúp ai được không?* Không. Người đó yên rồi.
- *Có ai chết không?* Đêm nay không ai trong nhà mình chết. Nhưng hai ngày này có nhiều người chết thật. Hết trận sẽ
  đọc.

---

## 6. Thẻ sự việc (úp, người dẫn giữ)

Bốn thẻ, úp ở chỗ người dẫn, không cho xem trước. Góc trên mỗi thẻ in **"Chuyện hư cấu"**.

### 6.1 Thẻ "Bờ tre" · lượt 3

*Chuyện hư cấu* · đọc sau khi lật thẻ lửa lượt 4

> Ở bờ tre sau nhà có tiếng con nít khóc, rồi tiếng người dỗ. Một người đàn bà bồng con, chân đất, áo ướt sương. Chị
> nói chị ở xóm bên kia bưng, chạy ra từ chiều. Chị muốn về nhà má ruột ở làng xa. Tay chị lần chuỗi, miệng đọc kinh
> nhỏ. Chị không giấu, cũng không đưa ra. [nháp]

Đặt chị Nhàn ở Bờ tre (10). Đưa thẻ chị cho người chơi có ít người nhà còn trên bàn cờ nhất (bằng nhau thì người
chơi lớn tuổi nhất). Mời người cầm Bà Sáu đọc câu này, hay nói câu của mình:

> "Mở cửa sau. Con nít ngoài sương vậy sao được." [nháp]

Không hỏi "có cứu không". Để bàn tự quyết trên bàn cờ. Bàn hỏi chuyện cấm đạo thì đọc hộp mặt sau thẻ chị, không thêm
ý mình.

### 6.2 Thẻ "Đạn chùm" · hết lượt 4

*Chuyện hư cấu* · đọc sau khi tung xúc xắc lượt 4

> Đạn chùm bắn vào tường luỹ. Đất đá văng. Tía Bền bị thương ở vai. [nháp]

- Kẹp 1 kẹp lên thẻ Tía Bền. Nếu xúc xắc lượt 4 đã làm tía bị thương rồi thì giữ nguyên, không thêm.
- Đạn chùm bắn vào luỹ là sử (Pallu). **Vết thương của tía do người viết đặt**, không do xúc xắc.
- Lượt 5, tía còn 1 sức (cộng +2 nếu tía là người nói ở gốc me): tự đi được, không cõng được ai. Không nói gì thêm.
- Tía đã lạc thì bỏ thẻ này.

### 6.3 Thẻ Khoảnh khắc · Gốc me · lượt 5

*In khổ A5, giấy dày.* Góc trên: **Chuyện hư cấu**. Người dẫn đọc sau khi đã lật thẻ lửa lượt 6, đặt anh Quảng và báo
anh bị thương nặng (mục 3.3, lượt 5).

---

**KHOẢNH KHẮC · Gốc me**
*Gần trưa 16 tháng Giêng (25.2.1861)*

> Lính rút ngang chợ. Dưới gốc me có một người nằm. Chân anh dập, không đứng dậy nổi. Anh nói giọng Quảng Ngãi.
> [nháp]
>
> Anh hỏi người chạy ngang: "Có ai là người nhà chú Bền không? Tui viết thư giùm chú hôm kia." [nháp]
>
> Anh móc trong áo ra một lá thư khác, gấp tư. "Thư tui gửi mẹ ở Mộ Đức. Tui đi không nổi." [nháp]

**Ai muốn thì nói một câu: người nhà mình đang cầm lo cho ai lúc này.**
**Rồi cả bàn chọn một câu dưới đây, và chọn người nhà sẽ nói câu đó. Người cầm người đó đọc to.**
**Người nói phải còn trên bàn cờ, và trong lượt này phải tới hay đi ngang gốc me. Chỉ người nói được thêm 2 sức, chỉ
lượt này. +2 này không cộng với +2 của Lộc trong cùng lượt.**
**Không ai tới gốc me lượt này thì không ai nói, không ai được +2; anh Quảng nằm lại như câu 3.**

**1. "Để tui cõng anh."** [nháp] *(người nói: người lớn đang lành, trong số Tía Bền, Má Thơm, Lộc, Mận)*
- Từ giờ tới hết đêm, người nói cõng anh Quảng một mình được (2 sức mỗi đường).
- Anh Quảng đi theo nhà mình: được cõng, được băng, được dẫn. Lá thư vẫn trong áo anh.
- Sổ ghi: "[người nói] nhận cõng anh Quảng. Hết đêm anh ở ___." [nháp]

**2. "Anh đưa thư đây. Tui hứa gửi tới."** [nháp]
- Đang cầm đồ khác thì đặt xuống ở gốc me (ai đứng cùng ô thì nhặt được). Lá thư thành đồ người nói cầm.
- Nhận thư xong, anh Quảng lết theo đồng đội. Anh rời bàn cờ lúc hết lượt (ai đi ngang trong lượt vẫn băng được).
- Chưa ai băng thì hết đêm Sổ B ghi anh mang tật, như người còn trên bàn cờ.
- Sổ ghi: "Nhà mình hứa gửi thư về Mộ Đức. Không ai biết anh tới đâu." [nháp]

**3. "Nhà tui còn bà già con nhỏ. Anh ráng."** [nháp]
- Trước khi đi, nhà mình kéo anh vô gốc me cho khuất, để lại bầu nước. Không tốn sức.
- Đêm nay nhà mình không cõng, không dẫn anh. Ai đi ngang thì băng được. Lá thư ở lại với anh.
- Sổ ghi câu đã nói, và: "Anh Quảng hết đêm ở gốc me." [nháp]

*Khi Tía Bền tới hay đi ngang gốc me ở lượt 5 hay 6 mà anh Quảng còn đó, người dẫn đọc:*
> Tía nhận ra anh. Anh là người viết lá thư hôm kia. [nháp]

**Không có câu nào đúng.** Ghi câu đã chọn vào Sổ, mục D.

---

*Ghi chú thiết kế (không in lên thẻ).* Ba câu là ba thứ đáng giữ va vào nhau: đôi tay và sức để cõng một người lạ;
một lời hứa phải đi vào lửa mới nhận được; sức để lo cho bà già con nhỏ. Câu nào cũng cho người nói thêm 2 sức như
nhau, và người nói nào cũng phải tới hay đi ngang gốc me (ô Lửa), nên không câu nào được "thưởng", không câu nào khỏi
tốn gì. Câu 2 không xoá vết thương của anh Quảng: chưa ai băng thì anh vẫn mang tật (bản 4). Lượt này nhà mình còn phải lo cho tía đang bị thương trong đồn và cho nhà sắp cháy. Tía tự đi được nhưng không
cõng được ai, nên +2 phải chọn: cho tía, hay cho người đi cứu anh Quảng. Sổ ghi việc đã làm, không ghi lời khen hay
trách.

### 6.4 Thẻ "Lộc gặp tía" · khi xảy ra

*Chuyện hư cấu* · đọc lần đầu Lộc hết lượt cùng ô với Tía Bền, khi tía còn trong đồn

> Tía thấy Lộc thì nạt: "Tao dặn đừng lên mà." Rồi tía dúi vô tay nó nắm cơm, còn ấm. [nháp]

Đánh dấu Sổ D: "☐ Lộc đã lên đồn gặp tía (lượt __)". Không cộng gì thêm.

---

## 7. Mở đầu và Kết

### 7.1 Mở đầu: lá thư đọc to trước khi chơi

*Người dẫn nói trước* [nháp]:
> Đây là một lá thư hư cấu. Trận đánh trong thư là có thật. Ngày 24 và 25 tháng Hai năm 1861, đại đồn Chí Hoà sẽ vỡ.
> Người viết thư không biết. Mình thì biết.

*In trên giấy màu ngà, chữ viết tay hay font chữ viết tay. Đề:* **Thư hư cấu · bản chuyển ra quốc ngữ**

> Mười bốn tháng Giêng, năm Tân Dậu.
>
> Má sắp nhỏ,
>
> Tui nói, anh Quảng viết giùm. Ảnh người Quảng Ngãi, biết chữ, là lính đóng kế trại phu.
>
> Ở đồn vẫn yên. Từ hồi trước Tết, tàu bên Sài Gòn tới nhiều, khói đen cả mé sông. Người ta nói Tây sắp đánh. Người
> ta cũng nói luỹ này dày, đánh không vô.
>
> Tui khiêng đất, đắp mấy chỗ luỹ sụp. Cơm đủ ăn. Đêm lạnh. Đừng ai lên đồn kiếm tui.
>
> Mai rằm. Má sắp nhỏ cúng giùm tui. Thắp cho ông một cây nhang, nói tui còn mạnh.
>
> Cuốn gia phả gói cho kỹ, bỏ trong ống tre. Giấy ruộng để trong cái rương nhỏ. Có chuyện gì thì lo cho má tui trước,
> rồi mới tới đồ.
>
> Thằng Lộc đi tuần thì đi, đừng ham lên mé đồn. Con Mận coi em. Thằng Cò, tía về thắt cho con con cào cào khác.
>
> Bền
>
> *Anh Quảng viết thêm: Chú Bền nói chậm, em chép đúng lời. Chúc cả nhà bình an.*

[nháp toàn bộ lá thư]

### 7.2 Kết: đọc khi hết lượt 7

*Người dẫn đọc chậm* [nháp]:
> Tối 16 tháng Giêng. Đại đồn Chí Hoà đã vào tay liên quân Pháp – Tây Ban Nha. Quân triều đình rút về đồn Thuận Kiều.
> Ba ngày sau, họ rút về Biên Hoà.
>
> Ở xóm Bưng Lác, lửa còn âm ỉ trên mấy mái lá.
>
> Đêm nay nhà mình không ai chết. Nhưng hai ngày này có nhiều người chết thật. Sử ghi được chừng này.

*Rồi đọc ba dòng (bản nói)* [sử gia kiểm]:
> Bên quân triều đình: chết từ khoảng 300 tới khoảng 1.000 người, các nguồn ghi khác nhau. Nguyễn Duy và Tôn Thất Trĩ
> tử trận. Nguyễn Tri Phương bị thương.
>
> Bên liên quân: chết từ 12 tới 19 người tại trận, bị thương từ chừng 200 tới chừng 300. Trong đó có lính Pháp, lính
> người Philippines, lính người Việt, và phu.
>
> Dân phu, dân các xóm quanh đồn: sử chưa cho mình con số.

*Đặt thẻ số liệu (in, bên dưới) lên bàn cho ai muốn đọc. Im năm giây. Rồi nói:* "Giờ mình ghi Sổ."

**Người chết và bị thương ở Chí Hoà, 24–25.2.1861 · ước tính, các nguồn ghi khác nhau** [sử gia kiểm toàn hộp]

| Bên | Chết | Bị thương, bị bắt | Ghi chú |
|---|---|---|---|
| Quân triều đình (Đại Nam) | Từ khoảng 300 (HistoryNet, theo lời Charner kể "nhiều xác") tới khoảng 1.000 (ước tính phía Pháp, Thomazi). fr.wikipedia ghi khoảng 500. Có nguồn tính 1.000 là cả chết lẫn bị thương. | chưa rõ | Nguyễn Duy (em Nguyễn Tri Phương) và Tôn Thất Trĩ tử trận. Nguyễn Tri Phương bị thương. Tham tán Phạm Thế Hiển: có nguồn ghi tử trận, có nguồn ghi ốm nặng, mất ít ngày sau. Nguồn Việt (*Đại Nam thực lục*, *Việt sử tân biên*): chưa tra. |
| Liên quân Pháp – Tây Ban Nha | 12 đến 19 tại trận (12: báo cáo Charner 27.2 và Thomazi; 16: báo *Le Mémorial d'Asie*; 19, trong đó 5 sĩ quan: Pallu). Chưa kể người chết vì vết thương về sau, như trung tá Testard. | 213 đến khoảng 300 (Charner 213, Thomazi 225, fr.wikipedia 255, *Le Mémorial d'Asie* 299, Pallu khoảng 300) | Trong liên quân có lính Pháp, lính người Philippines dưới quyền sĩ quan Tây Ban Nha (chừng 200 bộ binh, 70 kỵ), một đại đội lính người Việt, và phu khiêng thang. Số của từng nhóm chưa tách riêng. |
| Phu đi theo liên quân | chưa tìm thấy số liệu | | |
| Dân phu của triều đình, dân các xóm quanh đồn | chưa tìm thấy số liệu | | Trò chơi không bịa số. |

*Theo một sĩ quan Pháp có mặt (Pallu), người trong đồn không chạy kịp đều bị giết.* [sử gia kiểm]

### 7.3 Sổ (in A4, một tờ hai mặt)

**SỔ NHÀ HỌ ĐỖ**
**Đêm rằm tháng Giêng năm Tân Dậu (24–25.2.1861) · xóm Bưng Lác, Gia Định** *(nhà và xóm là hư cấu)*
Người giữ bút: ____________________

**A. Người trong nhà** *(lúc chơi · mỗi người chơi nói to dòng cuối cho người mình cầm, bằng giọng người đó; người
giữ bút viết)*

| Người | Hết đêm ở đâu | Ra sao | Một dòng |
|---|---|---|---|
| Bà Sáu | | Lành · Bị thương · Bị thương nặng đã băng · Mang tật: ____ · Lạc ở ____ | |
| Tía Bền | | | |
| Má Thơm | | | |
| Lộc | | | |
| Mận | | | |
| Út Cò | | | |

**B. Người lạ** *(lúc chơi)*

| Người | Hết đêm ở đâu | Ra sao | Một dòng (ai viết cũng được) |
|---|---|---|---|
| Anh Quảng | | | |
| Chị Nhàn và đứa nhỏ | | | |

**C. Đồ** *(người dẫn điền sau buổi)*

| Đồ | Còn, ai giữ | Rơi hay đặt ở đâu | Mất |
|---|---|---|---|
| Gia phả | | | |
| Bát nhang | | | |
| Văn tự ruộng | | | |
| Thư anh Quảng | | | |
| Con cào cào lá | | | |

**D. Những điều nhà mình đã nói, đã làm** *(lúc chơi)*
- Đêm rằm, ai cúng cùng bà Sáu: ________________________
- Đêm rằm, ai ngồi nhờ: ________________________
- ☐ Lộc đã lên đồn gặp tía (lượt ___)
- Đêm rằm, chị Nhàn tới bờ tre. Nhà mình đã: ________________________
- Câu ở gốc me: "______________________________" · người nói: ________

**E. Bốn điều nhà mình giữ** *(người dẫn điền sau buổi · mỗi dòng một câu, không chấm điểm)*
- **Người** (cả nhà còn bên nhau, hay chia mấy ngả?): ________________________
- **Nếp** (gia phả, bát nhang, cúng rằm): ________________________
- **Lời** (đã hứa gì, với ai): ________________________
- **Kế** (ruộng, sức làm ăn mùa tới): ________________________

**F. Để dành cho mùa sau** *(người dẫn đánh dấu sau buổi)*
☐ Có người lạc: ______ ☐ Lời hứa gửi thư về Mộ Đức (thư còn hay mất cũng đánh) ☐ Chị Nhàn và đứa nhỏ ngồi nhờ nhà mình ☐ Anh Quảng ở với nhà mình
☐ Đồ rơi ở: ______ ☐ Mang tật: ______ ☐ Nhà chia mấy ngả: ______ ☐ Lộc đã lên đồn gặp tía

**G. Sau đêm nay, sử chép** *(người dẫn đọc to một dòng: 5.8.1861; không chơi)* [sử gia kiểm]
- 28.2.1861: quân triều đình bỏ đồn Thuận Kiều, rút về Biên Hoà.
- 12.4.1861 (có sách ghi 15.4): quân Pháp chiếm Mỹ Tho.
- 5.8.1861: triều đình ra lệnh phân sáp (bắt người có đạo rời làng, chia đi các làng khác canh giữ).
- 10.12.1861: Nguyễn Trung Trực đốt tàu L'Espérance trên sông Nhật Tảo.
- 16.12.1861 (có sách Việt ghi đầu năm 1862): quân Pháp chiếm Biên Hoà.
- 5.6.1862: Hoà ước Nhâm Tuất. Biên Hoà, Gia Định, Định Tường thành đất nhượng cho Pháp. Triều đình phải để người có
  đạo tự do giữ đạo. Nhiều nhà phải quyết ở lại hay dời sang ba tỉnh miền Tây (tị địa).

**H. Mùa sau** *(người dẫn đọc nguyên văn, rồi hỏi câu 6 ở mục 9.1)* [nháp]
> Cuối năm 1861. Ai lạc thì nhà mình đi tìm: ở chùa, trên đường Biên Hoà, ở nhà bà con. Đồ rơi thì đi tìm đồ. Ai bị
> thương thì tập đi lại. Có thể có một lá thư phải gửi về Mộ Đức. Rồi tới chuyện ruộng: ở lại hay đi.

---

## 8. Kịch bản cho người dẫn

### 8.0 Thư mời (gửi trước vài ngày) [nháp]

> Mời anh chị tới chơi thử một trò chơi trên giấy về một nhà ở Gia Định năm 1861. Chừng 100 phút, kể cả nói chuyện sau
> đó. Không cần biết chơi game.
>
> Trò chơi có một trận đánh thật, có người bị thương, có chuyện triều đình cấm đạo hồi đó. Không có cảnh máu me. Ai
> thấy không hợp, cứ nói trước hay giữa buổi, không sao hết.

### 8.1 Trước buổi chơi (20 phút, trước khi khách tới)

- Trải bàn cờ. Đặt quân: Tía Bền ở 3; Lộc ở 6; Bà Sáu, Má Thơm, Mận, Út Cò ở 9. Gia phả, bát nhang, văn tự ở 9. Con
  cào cào lá đặt dưới quân Út Cò. Ô "Lạc" bên lề.
- Đặt dải "Sử đã chép" cạnh bàn cờ, mặt chữ lên. **Người dẫn giữ xấp bảy thẻ lửa trong tay**, theo thứ tự, mỗi lượt
  lật một thẻ. **Lật sẵn thẻ lửa lượt 1.**
- Để riêng một bên, úp, chỉ người dẫn với tới: kịch bản từng lượt, bốn thẻ sự việc, thẻ chị Nhàn, thẻ anh Quảng, quân
  hai người lạ, lá thư anh Quảng, thẻ số liệu người chết.
- Xúc xắc, kẹp giấy, chỉ nâu, hạt đậu, thẻ Lửa, Tâm, Chặn, cờ vỡ, thẻ "Đóng", bút, Sổ, phiếu quan sát, đồng hồ.
- Đọc lướt lại mục 5 và mục 6 một lần.

### 8.2 Mở đầu (12 phút)

**00:00 · Chào** [nháp]
> Hôm nay mình thử một trò chơi trên giấy. Nó còn là bản nháp. Không có đúng sai, không có thắng thua. Tôi đọc và ghi
> chép để sửa trò chơi, không phải để chấm anh chị.
>
> Như trong thư mời: có một trận đánh thật, có người bị thương, có chuyện triều đình cấm đạo hồi đó. Không có cảnh
> máu me. Ai thấy mệt, thấy khó chịu, cứ nói, mình ngưng.

**00:01 · Đọc lá thư** (mục 7.1). Đọc chậm. Đọc xong im ba giây.

**00:03 · Phát thẻ người.** Chia vai theo mục 4. Mời từng người **đọc to tên và câu nói** của người mình cầm. Không
giải thích thêm về nhân vật.

**00:06 · Luật.** Đặt trang luật giữa bàn. Nói [nháp]:
> Mỗi lượt tôi đọc hai đoạn. "Sử đã chép" là sử. "Ở xóm" là chuyện hư cấu. Rồi tôi đặt lửa, lật cho mọi người xem
> lửa lượt sau. Nhà mình bàn rồi đi. Ai đứng chỗ có lửa thì tung xúc xắc.

Chỉ trên bàn cờ: một ô có che, một đường, ba lối ra (đọc chỗ đi tới), chùa, cầu khỉ. Đọc bốn điều người nhà không
chịu.

**Tung thử (không tung thật).** Người dẫn **đặt** xúc xắc lên bàn, mặt 5 ngửa lên, chỉ vào ô Chợ gốc me. Nói
[nháp]: "Giả sử Lộc hết lượt đứng ở Chợ gốc me, có Lửa, ô trống, và tung ra 5. Đứng ở ô Lửa trống thì ra 5 hay 6 là
gặp nạn. Đi ngang thì phải ra 6. Lộc gặp nạn. Lộc đang cầm văn tự. Chịu thương, hay té, buông văn tự?"
- Bàn chọn **chịu thương**: kẹp 1 kẹp lên Lộc. "Bị thương: lượt sau Lộc còn 1 sức."
- Bàn chọn **buông**: không kẹp. "Buông thì tung cho văn tự: ra 4 tới 6 là mất, 1 tới 3 là rơi lại ở Chợ, đêm nay không
  ai nhặt được." Không tung cho văn tự; chỉ nói luật.

Rồi gỡ kẹp, cất xúc xắc. Không dời quân. Từ đây xúc xắc là thật: người dẫn không đụng tới mặt xúc xắc nữa.

### 8.3 Mỗi lượt (3 tới 10 phút; lượt 4 khoảng 11 phút, lượt 5 khoảng 16)

Nói đúng khuôn này:
1. "Lượt [số]. [Lúc]." Đọc "Sử đã chép". Nói "Ở xóm", rồi đọc đoạn hư cấu.
2. Đặt lửa lượt này. Không đọc tên từng ô; chỉ đặt.
3. Lật thẻ lửa lượt sau: "Lượt sau, lửa sẽ ở đây." Chỉ tay.
4. Sự việc nếu có.
5. "**Nhà mình tính sao?**" Rồi im. Chờ. Ở lượt 5 và 6, sau câu đó, hỏi từng người, bắt đầu từ người ít chơi game
   nhất: "**[Tên nhân vật] đi đâu?**". Người cầm nhân vật nào thì tự nói nước đi của nhân vật đó.
6. Khi bàn nói xong: "Ai đi ngang chỗ có lửa? Ai đứng chỗ có lửa?" Mời người chơi tự tung.
7. Báo bằng tên người, không bằng con số: "Lộc gặp nạn. Lộc đang cầm văn tự. Lộc chịu thương, hay té, buông văn tự?"
8. Lượt 4 và 6: hỏi một người (mỗi lần một người khác): "**[Tên] đang lo cho ai?**" hay "**[Tên] đang nhớ gì?**"
   Ghi nguyên văn. Lượt 4 và 6, nếu có người nhà đã ra lối ra, hỏi bằng tên người đó: "**[Tên] đang ở đâu, nghĩ
   gì?**"

**Lượt không ai có việc:** đọc, đặt lửa, lật thẻ, sang lượt.

**Sổ D ghi tại chỗ.** Lượt 3, 4, 5: việc nào có dòng trong Sổ D (ai cúng rằm, ai ngồi nhờ, chị Nhàn, Lộc gặp tía, câu ở
gốc me) thì người giữ bút ghi ngay lúc đó, không để tới cuối.

**Người hết quân.** Người chơi nào không còn quân trên bàn cờ thì đọc to "Sử đã chép" các lượt còn lại; người dẫn vẫn đọc
"Ở xóm".

Bàn bàn quá giờ ghi ở mục 10.3: "Mình còn [số] lượt nữa." Không giục hơn.

### 8.4 Những lúc đặc biệt

**Có người thành bị thương nặng.** Gõ ngón tay xuống bàn ba tiếng, chậm. Nói [nháp]:
> [Tên] bị thương nặng. Nếu tới hết đêm chưa được băng, hay gặp nạn thêm, [tên] sẽ mang tật theo suốt đời.

Đầu mỗi lượt sau, chừng nào người ấy còn bị thương nặng, gõ chậm ba tiếng trước khi đọc. Anh Quảng xuất hiện ở lượt 5
đã bị thương nặng: gõ và báo ngay khi đặt anh, trước thẻ Khoảnh khắc.

**Má Thơm băng cho ai.** Nói tên cả hai: "Má Thơm băng cho [tên]."

**Có người lạc.** Im năm giây. Dời quân thật chậm sang ô "Lạc". Nói [nháp]:
> [Tên] lạc ở [tên ô]. Lạc không phải là mất.

Không gõ chén, không rung chuông. Không nói gì thêm.

**Có người mang tật.** Nói [nháp]: "[Tên] sẽ mang tật từ đêm nay." Cột sợi chỉ nâu vào quân. Mời người chơi nói một
dòng cho Sổ: tật đó theo người ấy ra sao. Không bình luận.

**Lượt 3, chị Nhàn.** Đọc thẻ "Bờ tre" (mục 6.1).

**Hết lượt 4, Đạn chùm.** Đọc thẻ (mục 6.2). Không giải thích vì sao tía bị thương.

**Lượt 5, Khoảnh khắc.** Lật thẻ lửa lượt 6 **trước**. Đặt anh Quảng, gõ ba tiếng, báo anh bị thương nặng. Đọc thẻ
chậm. "Ai muốn thì nói một câu"; không ép ai. Không chen vào. Sau đó: "Nhà mình chọn câu nào? Ai nói câu đó?" Bàn
chia phe mà không chịu nhau thì người giữ bút quyết. Người cầm người nói đọc to câu đã chọn. Ghi ngay vào Sổ, mục D.

**Lộc gặp tía.** Đọc thẻ (mục 6.4) lần đầu Lộc hết lượt cùng ô với tía khi tía còn trong đồn.

**Người chơi đi sớm** (đưa vài người ra lối ra trước lượt 5). Vẫn đọc đủ bảy lượt. Hỏi: "Người nhà mình đang ở đâu,
làm gì?" Đây cũng là kết quả cần ghi, không phải lỗi.

**Người chơi muốn đánh, muốn có súng.** "Nhà mình không cầm vũ khí đêm nay. Việc của nhà mình là lo cho người."

**Người chơi buồn, im, hay khó chịu.** Ngưng. Hỏi nhỏ có muốn nghỉ không. Không ép nói. "Không muốn kể" là một câu trả
lời được tôn trọng.

**Trễ giờ.** Bỏ "một câu" ở lượt 4. Tung xúc xắc cùng lúc bằng hai con.

**Luật không nói.** Quyết trong 30 giây, theo hướng dễ cho người nhà. Ghi câu hỏi vào phiếu quan sát.

### 8.5 Kết (10 phút)

1. Làm "Hết đêm" (mục 5.9).
2. Đọc Kết và ba dòng số người chết (mục 7.2). Đặt thẻ số liệu lên bàn. Im năm giây.
3. Đưa Sổ cho người giữ bút. **Mỗi người nói to dòng của người mình cầm; người giữ bút viết.** Mục D đã ghi lúc chơi;
   giờ điền A và B. Người dẫn điền C, E, F sau buổi.
4. Đọc mục G một dòng (5.8.1861). Đọc mục H nguyên văn.
5. Chuyển sang câu hỏi (mục 9.1).

### 8.6 Những điều KHÔNG làm

- Không gợi ý nên đi đâu, nên cứu ai, nên cầm đồ gì.
- Không nói phần trăm hay "khả năng". Chỉ nói "ra mấy thì gặp nạn".
- Không cho xem kịch bản, thẻ sự việc. Trang luật đã nói có người lạ; không báo trước ai, ở đâu, lúc nào.
- Không nói "thắng", "thua", "điểm", "nhiệm vụ", "màn", "phần thưởng".
- Không khen, không tiếc thay người chơi ("hay quá", "tiếc ghê", "đúng rồi").
- Giải nghĩa một từ thì được, trong một câu. Không giảng thêm lịch sử ngoài kịch bản. Ai hỏi thêm thì hẹn sau buổi.
- Không giải thích thiết kế ("trò này muốn anh chị thấy…").
- Không nhắc tên giùm khi người chơi gọi "ông già", "thằng nhỏ". Chỉ ghi lại.
- Không nói trước rằng hôm sau sẽ gọi hỏi tên.
- Không phân xử ai đúng ai sai giữa các bên trong trận.

---

## 9. Câu hỏi sau buổi chơi

**Quy ước:** ghi người chơi là P1, P2, P3, P4 (chủ dự án là P1). Không ghi tên thật lên phiếu. Không ghi âm nếu chưa
hỏi và được đồng ý.

### 9.1 Ngay sau buổi (8 phút, hỏi chung, từng người trả lời)

| # | Câu hỏi | Đo câu nào |
|---|---|---|
| 1 | Tới lượt thứ mấy thì anh chị thấy mình biết cách chơi? | Q1 hiểu bàn cờ |
| 2 | Kể lại một lúc anh chị đắn đo nhất. Đắn đo vì cái gì? | Q2 ý nghĩa |
| 3 | Có lúc nào anh chị thấy mình chỉ đang né ô màu cam, hay chỉ đang đếm sức, đếm chỗ? Lúc nào? | Q2 |
| 4 | Câu ở gốc me nhà mình đã chọn, giờ nghĩ lại anh chị có chọn vậy không? Vì sao? | Q2 |
| 5 | Phần chị Nhàn có chỗ nào anh chị thấy sai, thiếu, hay khó chịu không? | tôn trọng (Công giáo) |
| 6 | Nếu tuần sau có mùa kế tiếp (cuối năm 1861: đi tìm người lạc, đồ rơi, chuyện lá thư, chuyện ở lại hay đi), anh chị có muốn ngồi chơi không? Có · Có thể · Không. Vì sao? | Q4 mùa sau |
| 7 | Anh chị muốn biết chuyện gì xảy ra với ai nhất? | Q4 (và Q3, gián tiếp) |

Bản 4 bớt bốn câu cho kịp giờ. "Còn chỗ nào lúng túng" đã có trong phiếu quan sát. Ba câu "chơi game quá", "không công
bằng", "từ khó" hỏi trong cuộc gọi hôm sau (mục 9.2, câu 9–11).

**Không hỏi gì về tên người trong nhà ngay sau buổi.** Để dành cho hôm sau.

### 9.2 Gọi điện hôm sau (khoảng 24 giờ sau, 7 phút mỗi người)

Gọi từng người riêng. Hỏi đúng thứ tự, không gợi ý.

1. "Hôm qua mình chơi về chuyện gì? Kể sơ cho tui nghe." *(nhớ tự do)*
2. "Nhà đó có những ai? Anh chị nhớ tên ai?" *(đếm tên nhớ được, không gợi ý)*
3. "[Người đầu tiên họ nhắc] cuối cùng ra sao?" *(nhớ người và chuyện)*
4. "Ngoài người trong nhà, còn ai nữa không?" *(anh Quảng, chị Nhàn)*
5. "Từ hôm qua tới giờ, anh chị có lúc nào nghĩ lại chuyện trong trò chơi không? Lúc nào?"
6. "Anh chị có kể chuyện này cho ai chưa?"
7. "Nếu có mùa sau, anh chị có muốn chơi không? Muốn biết gì?"
8. *(Hỏi sau cùng trong phần nhớ, có gợi ý.)* "Tui đọc mấy cái tên, anh chị nói tên nào có trong trò chơi: Bà Sáu · anh
   Tấn · Tía Bền · chị Lụa · Mận · ông Bảy · Út Cò · Má Thơm · anh Quảng · Lộc · chị Nhàn." *(Anh Tấn, chị Lụa, ông Bảy là
   tên mồi.)*
9. "Có chỗ nào anh chị thấy 'chơi game' quá, không hợp với chuyện thật, với người thật đã chết?" *(tôn trọng)*
10. "Có chỗ nào anh chị thấy không công bằng với một bên, một nhóm người nào?" *(tôn trọng)*
11. "Có từ nào khó hiểu không?" *(ngôn ngữ: người Việt ở nước ngoài, người trẻ)*

**Cách đếm:** "ông Tư", "anh Tư", "Tư Bền", "tía thằng Lộc" tính là nhớ Tía Bền. "Anh Hai" tính là Lộc. "Chị Ba"
tính là Mận. Ghi lại cách người đó gọi.

### 9.3 Phiếu quan sát cho người dẫn (ghi trong lúc chơi)

| Lượt | Giờ bắt đầu | Câu hỏi về luật | Câu về **người, đồ** | Câu về **ô, xúc xắc** | Câu **đếm** (sức, chỗ) | Câu đáng nhớ (chép nguyên văn) |
|---|---|---|---|---|---|---|
| 1 | | | | | | |
| 2 | | | | | | |
| 3 | | | | | | |
| 4 | | | | | | |
| 5 | | | | | | |
| 6 | | | | | | |
| 7 | | | | | | |

Ghi thêm: lúc nào cả bàn cười; lúc nào cả bàn im; ai gọi nhân vật bằng tên, ai gọi bằng vai ("ông già", "thằng
nhỏ"); ai hỏi "rồi sao nữa?"; thời gian Khoảnh khắc; câu đã chọn; **mọi chỗ "luật không nói"** và mình đã quyết sao.

### 9.4 Đọc kết quả

| Câu hỏi của buổi thử | Đạt khi | Nguồn |
|---|---|---|
| Q1 · Hiểu bàn cờ | Từ lượt 3 không còn câu hỏi về đi và sức. Từ sau lần gặp nạn đầu tiên (lần gặp nạn giả sử ở mục 8.2 cũng tính; đếm theo lần gặp nạn, không đếm theo lượt) không còn câu hỏi về lửa, xúc xắc. | phiếu quan sát, câu 1 |
| Q2 · Ý nghĩa hay né ô | Ít nhất 3 trên 4 người kể lúc đắn đo bằng người hay đồ ("sợ bỏ bà", "cái bát nhang", "lá thư"), không bằng ô hay số. Từ lượt 3, câu về người, đồ nhiều hơn câu về ô cộng câu đếm. Không ai nói cả buổi chỉ là né ô hay đếm. | câu 2–4, phiếu quan sát |
| Q3 · Nhớ tên hôm sau | Ít nhất 3 trên 4 người (khoảng 70%) tự nói được ít nhất một tên người nhà **và** chuyện xảy ra với người đó. Tên mồi không bị nhận nhầm. | gọi điện, câu 2–3, 8 |
| Q4 · Muốn mùa sau | Ít nhất 3 trên 4 người trả lời "có" và nói được muốn biết điều gì. | câu 6–7, gọi điện câu 7 |
| Tôn trọng | Không ai nói chuyện mất mát hay trận đánh có vẻ "game". Không có ý kiến chặn nào về phần chị Nhàn. | câu 5, gọi điện câu 9–10 |

### 9.5 Núm chỉnh cho buổi thử sau

Chỉnh **một** núm mỗi lần. Sau mỗi lần chỉnh, làm lại phép kiểm ở mục 10.4 (đường ít lần tung nhất).
- **Núm đầu tiên: Lửa ở Chợ lượt 4, Bờ rạch lượt 4–5** (bản 4 thêm). Thấy quá khó, quá nặng nề thì tắt núm này trước.
  Tắt cả ba ô, hay chỉ một ô, đều mở lại đường một lần tung (bản 3): cả nhà tới chỗ yên, chỉ tía tung.
- **Lửa ở Đình (7) lượt 5–6** (bản 3 thêm). Tắt thì lượt 5–6 đi Nhà → Đình → Bà Điểm khỏi tung.
- Thấy quá dễ, hay người chơi chỉ còn tính: "đi ngang ô Lửa: ra 5 hay 6 là gặp nạn" (số lần tung giữ nguyên, mỗi lần
  nguy gấp đôi). Chùa còn 2 chỗ · Bến ghe chuyến chót ở lượt 5 · bỏ +2 của Lộc: chỉ làm chật chỗ, bớt sức, **không thêm
  lần tung nào** trên đường ít lần tung nhất (bàn G đo trên bản 3).
- Thấy quá khó, quá nặng nề (sau núm đầu tiên): chùa lại 4 chỗ · bỏ luật "đi ngang ô Lửa phải tung" · bỏ thẻ "Đạn chùm" ·
  bỏ luật Lộc ở Gò mả hết lượt 2.

**Nếu không đạt** (theo `direction.md` §8.4):
- Không nhớ tên: dừng hướng này. Thất bại rẻ.
- Bàn cờ thành "né ô màu cam" hay thành bài toán đếm: chuyển về cảnh xem có 1–3 Khoảnh khắc, thử lại.
- Không ai muốn mùa sau: trước khi làm chương mới, thêm biến thể (người lạ khác, xóm khác) và thử lại.

---

## 10. In và chuẩn bị

### 10.1 In

| Thứ | Khổ | Số lượng | Ghi chú |
|---|---|---|---|
| Bàn cờ | A3 | 1 | `board.svg`, A3 ngang, tỉ lệ 100%. |
| Trang luật + Từ khó | A4, hai mặt | 1 mỗi người + 1 | Chữ cỡ 13 trở lên. |
| Dải "Sử đã chép" và con số | A4 cắt dọc, dán nối | 1 | Mục 3.1. |
| Thẻ lửa | A6, hai mặt | 7 | Mục 3.2. Cả bàn thấy; người dẫn giữ xấp. |
| Kịch bản từng lượt | A4 | 1 | Mục 3.3. Chỉ người dẫn. |
| Thẻ người | A6 | 8 | 6 người nhà, 2 người lạ. Mặt sau thẻ chị Nhàn: "Chuyện cấm đạo". |
| Thẻ sự việc | A6 (Khoảnh khắc: A5, giấy dày) | 4 | Mục 6. Úp, chỉ người dẫn. |
| Lá thư mở đầu | A5, giấy màu ngà | 1 | Mục 7.1. |
| Thẻ số liệu người chết | A5 | 1 | Mục 7.2. |
| Sổ | A4, hai mặt | 2 | Một bản chơi, một bản dự phòng. |
| Luật cho người dẫn | A4 | 1 bộ | Mục 5, 8. |
| Phiếu quan sát | A4 | 1 | Mục 9.3. |
| Phiếu câu hỏi | A4 | 1 | Mục 9.1 và 9.2. |

### 10.2 Quân và đồ chơi

| Thứ | Số lượng | Làm bằng gì |
|---|---|---|
| Quân người | 8 | Giấy gấp hình mái nhà, tên to hai mặt, hay nắp chai dán tên. Người lạ dùng màu khác. |
| Thẻ đồ | 5 | Giấy màu nhỏ: gia phả (nâu), bát nhang (xám), văn tự ruộng (vàng), thư anh Quảng (trắng), con cào cào lá (xanh lá). |
| Thẻ Lửa | 6 | Giấy cam, vuông 3 cm. |
| Thẻ Tâm | 4 | Giấy đỏ, vuông 3 cm. |
| Thẻ Chặn | 5 | Giấy đen, vuông 3 cm. |
| Cờ "vỡ" | 3 | Tam giác đen nhỏ, đặt chồng lên thẻ Tâm. |
| Thẻ "Đóng" | 2 | Giấy xám gạch chéo, đặt lên lối ra. |
| Xúc xắc sáu mặt | 2 | |
| Hạt đậu (sức) | 22 | Hay đồng xu nhỏ. |
| Kẹp giấy | 16 | Bị thương 1 kẹp, bị thương nặng 2 kẹp. |
| Chỉ nâu | 6 đoạn | Mang tật: cột vào quân. Không dùng màu đỏ, không dùng màu trắng. |
| Bút | 4 | |
| Đồng hồ | 1 | Điện thoại cũng được. |

### 10.3 Kế hoạch thời gian (khoảng 85 phút chơi, 8 phút hỏi; thư mời ghi 100 phút)

Theo giờ bàn F (`sim3-f.md`, bản 3: 92 phút chơi, 11 phút hỏi; bàn nói nhiều, có người 60 tuổi chưa chơi board game).
Bản 4 bớt: tung thử không tung thật, Sổ D ghi tại chỗ, bỏ "một câu" ở lượt 2, hỏi 7 câu thay vì 11. Lượt 4 là lượt đầu
được ra lối ra (ghe, lối bưng, bát nhang, ai dẫn ai): cho nó 11 phút.

| Giờ | Việc |
|---|---|
| −00:20 | Người dẫn sắp bàn (mục 8.1). |
| 00:00 | Chào, đọc lá thư. |
| 00:03 | Phát thẻ, mỗi người đọc tên và câu nói. |
| 00:06 | Luật, tung thử (6 phút). |
| 00:12 | Lượt 1, học luật (8 phút). |
| 00:20 | Lượt 2, Lộc đi tuần (4 phút). |
| 00:24 | Lượt 3, chị Nhàn, cúng rằm, ghi Sổ D (9 phút). |
| 00:33 | Lượt 4, lượt đầu được ra lối ra, Đạn chùm (11 phút). |
| 00:44 | Lượt 5, anh Quảng, Khoảnh khắc (16 phút). |
| 01:00 | Lượt 6 (10 phút). |
| 01:10 | Lượt 7 (3 phút). |
| 01:13 | Hết đêm, Kết, ghi Sổ A, B (10 phút). |
| 01:23 | Câu hỏi sau buổi (8 phút). |
| ~01:31 | Xong; thư mời ghi 100 phút, còn chừng 9 phút dư. Hẹn giờ gọi điện hôm sau. Người dẫn điền Sổ C, E, F. |

### 10.4 Chuẩn bị khác

- **Người dẫn** không phải chủ dự án. Nên là người đọc tiếng Việt rõ, chậm, giọng bình thường, không diễn.
- **Người chơi:** chủ dự án và chừng ba người lớn thích sử, ít nhất một người trên 45 tuổi không quen chơi game, nếu
  được thì một người Việt ở nước ngoài.
- **Người dẫn chơi thử một mình hai lần** trước buổi (mỗi lần chừng 30 phút): một lần đi cẩn thận, một lần đi kiểu
  "tính toán". Xem kỹ lượt 4 (lượt đầu được ra lối ra), lượt 5 (tía bị thương trong đồn, anh Quảng, nhà sắp cháy) và
  lượt 6. Ghi chỗ kẹt. Luật bản 4 chưa ai chơi; bàn F và G (`sim3-f.md`, `sim3-g.md`) chạy trên bản 3.
- **Phép kiểm khi tự chơi thử:** tìm một đường đưa cả nhà ra với ít lần tung nhất (mỗi người nhà tung riêng; không tính
  lần tung của Lộc ở Gò mả lượt 2). Còn tìm được đường **1 lần tung hay ít hơn** thì sửa lửa (mục 9.5). Bản 3 có đường
  1 lần (chỉ tía, ra 6 mới gặp nạn) mà phép kiểm cũ ("không tung lần nào") không bắt được. Bản 4: ít nhất 5 lần, mỗi
  người ở nhà một lần và tía một lần, lần nào cũng chỉ gặp nạn khi ra 6.
- Ngồi bàn tròn hay bàn vuông, bàn cờ ở giữa, ai cũng với tới.
- Không bật nhạc. Phòng yên.

---

## Phụ lục A · Cho người đọc cộng đồng Công giáo

Nhờ một người đọc trong cộng đồng Công giáo (nếu được, người gốc Nam Bộ, biết sử họ đạo) đọc trước buổi thử những
phần sau và trả lời các câu hỏi bên dưới. Người đọc có quyền quyết những chỗ ghi "người đọc quyết".

**Phần cần đọc**
1. Thẻ chị Nhàn (mục 4) và hộp "Chuyện cấm đạo" ở mặt sau.
2. Thẻ sự việc "Bờ tre" (mục 6.1), cả câu của bà Sáu.
3. Sổ: mục D (dòng "Đêm rằm, ai ngồi nhờ"), mục F ("Chị Nhàn và đứa nhỏ ngồi nhờ nhà mình") và mục G (dòng
   5.8.1861, dòng 5.6.1862).
4. Câu hỏi 5 sau buổi chơi (mục 9.1).
5. Câu người dẫn đọc ở lượt 3 về cúng rằm (mục 3.3).

**Câu hỏi cho người đọc**
- **Tên (người đọc quyết).** Bản 1 gọi chị là Hạnh. Thánh Phaolô Hạnh sinh ở Chợ Quán, chịu chết ở Sài Gòn năm 1859,
  được phong thánh năm 1988; một người có đạo tên Hạnh ở vùng này năm 1861 dễ bị hiểu là nhắc tới ngài. Bản 2 đổi tạm
  là Nhàn. Giữ Nhàn, đổi tên khác, hay giữ Hạnh có chủ ý (và không bao giờ nêu Chợ Quán)?
- **Tên thánh.** Bản 1 ghi "tên thánh Anê", dễ gợi tới thánh Anê Lê Thị Thành. Bản 2 bỏ. Có nên cho chị một tên thánh
  không, tên nào?
- **Tên Lộc.** Con trai đầu nhà họ Đỗ (không có đạo) tên Lộc. Có một vị thánh tử đạo là Phaolô Lê Văn Lộc, chịu chết ở
  Sài Gòn năm 1859 [sử gia kiểm]. Có sao không?
- **Lần chuỗi.** Năm 1861, chạy giặc giữa đêm, một người có đạo có lần chuỗi, đọc kinh mà không giấu không? Người Nam
  nói "lần chuỗi", "chuỗi Mân Côi" hay "tràng hạt"?
- **Chị có là một con người không.** Từ bản 3, chị tự đi, không tốn sức của ai, không bao giờ bị tung xúc xắc. Nhưng
  chị chỉ tới chỗ yên (chùa, ghe, lối ra) khi đi cùng ô với một người nhà họ Đỗ, để "có giúp chị không" thành một
  lựa chọn có giá (một chỗ chùa, một chỗ ghe, một người đi cùng). Người cầm thẻ quyết chị đi lúc nào, đi đâu. Chị còn
  bị viết thành "một gánh" của nhà họ Đỗ không?
- **Sáng ra chị đi một mình.** Bàn F thấy chị "như ngồi ngoài trò chơi": bỏ chị lại không tốn gì. Bản 4 thêm một dòng,
  không xúc xắc, không ai bị thương: hết đêm chị chưa tới chỗ yên cùng nhà mình thì sáng ra chị đi một mình; Sổ ghi
  "không ai biết chị tới đâu". Dòng này có nặng tay với chị, có thành "phạt" chị không? Nên kể thế nào?
- **Ngồi nhờ đêm cúng rằm.** Chị có thể ngồi trong nhà họ Đỗ lúc nhà cúng rằm (hết lượt 3). Bản 2 cho người dẫn đọc
  "Ai ở Nhà mình lúc hết lượt này là đã cúng rằm cùng bà Sáu", tức là tính luôn chị. Bản 3 đọc: "Người nhà mình ở Nhà
  lúc hết lượt này là đã cúng rằm cùng bà Sáu. Chị Nhàn có ở đó thì Sổ ghi chị ngồi nhờ, không tính là cúng." Sổ D có
  dòng "Đêm rằm, ai ngồi nhờ". Chị ngồi trong nhà lúc nhà cúng rằm thì nên kể thế nào?
- **Hướng đi.** Bản 1 cho chị đi về hướng Chợ Lớn (phía Pháp giữ), dễ bị đọc là "người có đạo theo Pháp". Bản 2 cho
  chị về nhà má ruột ở một làng xa, lối nào cũng được. Có còn chỗ nào gợi ý đó không?
- **Hộp "Chuyện cấm đạo".** Có thiếu, có nói quá điều gì không? Có nên nêu hai chữ "tả đạo" thích trên má không? Có nên
  nêu số người chết, và nếu nêu thì theo nguồn nào (nguồn giáo hội, sử gia khác)?
- **Câu của bà Sáu** ("Mở cửa sau. Con nít ngoài sương vậy sao được.") có đẩy người chơi về một phía trước khi họ tự
  quyết không? Có làm nhẹ chuyện cấm đạo không?
- **Chùa.** Chị trú ở chùa làng (hư cấu) thì có ổn không?
- **Mùa sau** có lệnh phân sáp (tháng 8.1861). Nếu kể tiếp chị Nhàn, nên kể thế nào để nỗi đau không thành "nội dung"?

**Điều thiết kế đã giữ**
- Không có kẻ ác. Triều đình, làng, người có đạo, liên quân Pháp – Tây Ban Nha (có lính người Philippines) đều được
  nói đúng việc, không gán ý.
- Không xoá chuyện cấm đạo. Không biến nó thành luật phạt người chơi: giúp người lạ không bao giờ bị trừ gì.
- Người lạ không bao giờ bị tung xúc xắc: chị, đứa nhỏ, anh Quảng. Chị không bao giờ bị thương nặng.

---

## Phụ lục B · Nguồn đã dùng

- Dữ liệu ứng dụng Dư Đồ (đọc, không sửa): `src/data/data.js` sự kiện `cd61`; `src/data/scenes.ts` cảnh `cd61`;
  `src/data/cards.ts` thẻ `gd59`, `cd61`, `nt61`, `nt62`, `td64`; `src/data/surnames.ts` (họ Đỗ).
- Léopold Pallu de la Barrière, *Histoire de l'expédition de Cochinchine en 1861*: bản gốc trên Gallica
  (ark:/12148/bpt6k5783366m); bản dịch của Hoàng Phong, NXB Phương Đông 2008, trích trên vi.wikipedia "Trận Đại đồn
  Chí Hòa". Nhà sử học chưa đọc thẳng bản dịch; cần đọc.
- Trần Văn Giàu, *Địa chí văn hóa TP. Hồ Chí Minh*, tập I, tr. 250–252 (qua vi.wikipedia).
- vi.wikipedia "Trận Đại đồn Chí Hòa", "Đại đồn Chí Hòa".
- en.wikipedia "Battle of Kỳ Hòa" (dẫn Thomazi, *La conquête de l'Indochine*; Chapuis; *Việt sử tân biên*);
  fr.wikipedia "Bataille de Ky Hoa".
- HistoryNet, "1861 French Conquest of Saigon: Battle of the Ky Hoa Forts".
- en.wikipedia "Tự Đức's Catholic persecution" (dẫn *Annales de la Propagation de la Foi*, 1862), "Cochinchina
  campaign", "Capture of Biên Hòa".
- Historic Vietnam, "Mapping the French 'Line of Pagodas'".
- Báo cáo của Charner ngày 27.2.1861 và báo *Le Mémorial d'Asie* (qua Đào Đăng Vỹ), dẫn lại; chưa đọc thẳng.
- Lịch: tính tuần trăng bằng thư viện thiên văn ephem. Trăng non 20:04 UT ngày 9.2.1861 (khoảng 03:00 ngày 10.2 giờ
  Gia Định); trăng tròn 04:43 UT ngày 25.2.1861 (gần trưa giờ địa phương); mặt trời mọc ngày 25.2 chừng 6 giờ 10.
- Sách cần tra thêm: *Đại Nam thực lục*; *Việt sử tân biên* (Phạm Văn Sơn); Hoàng Văn Lân (ngày Biên Hoà mất).

---

## Phụ lục C · Nối với ứng dụng (cho nhóm làm)

- Bàn cờ 15 ô này là bản giấy của "Giờ G" trong `direction.md` §5.6 (đề xuất 14–22 ô). Toạ độ 0–100 dùng thẳng được
  làm lớp `<svg>` phủ lên bản đồ. `tools/board.py` trong scratchpad vẽ lại `board.svg` và bàn cờ trong `kit.pdf` từ
  bảng ô và đường.
- **`SCENES.cd61`**: mũi tên ngày 25.2 trong `scenes.ts` chạy từ tây sang đông ("Cánh phải… đánh về phía đông"), không
  khớp Pallu (liên quân đánh mặt bắc). Sửa trước khi dùng lại [sử gia kiểm]. Bảy lượt ở đây cần dữ liệu mới.
- **Thẻ `cd61`**: lựa chọn "Gửi trai tráng vào đồn" đang cho `tr: 12` với kết quả "Hai người không về"
  (`src/data/cards.ts` dòng 25). Đó là thưởng điểm cho cái chết, trái `direction.md` §6 luật 3. Đưa vào danh sách sửa ở
  Giai đoạn 0, cùng `qt72` và `lb72`.
- Chỗ ngồi mới ("nhà ở xóm gần đồn, cha đi xâu đắp luỹ") nên thành lựa chọn thứ ba của `cd61`.
- Mùa sau nối với `nt61` (Nhật Tảo, 10.12.1861), `nt62` (tị địa, 1862), `td64` (Trương Định; lượt 7 đã nhắc ông đưa
  quân về Gò Công). Các ô ở mục F của Sổ là "hạt giống" cho Hồi âm.
- Phép kiểm tự động cho `sim-thu.ts` khi làm bản số: không ai chết vì xúc xắc; người lạ và đứa nhỏ không bị tung; Út
  Cò không quá bị thương; giúp người lạ không bao giờ bị trừ gì; ba câu Khoảnh khắc cùng một mức giúp, người nói nào
  cũng phải tới hay đi ngang gốc me; đồ rơi khi gặp nạn không nhặt lại được trong đêm; từ lượt 4 không có đường nào rời
  Nhà mình mà khỏi tung; anh Quảng rời bàn cờ còn bị thương nặng mà chưa ai băng thì vẫn mang tật.

---

## Ghi chú cho người viết và sử gia

### Cho người viết (phải viết lại hay quyết)

1. **Viết lại mọi chỗ [nháp]:** các đoạn "Ở xóm" (7 lượt); bốn thẻ sự việc (Bờ tre, Đạn chùm, Khoảnh khắc, Lộc gặp
   tía), kể cả các dòng Sổ trong Khoảnh khắc; lá thư mở đầu; dòng kể và câu nói trên 8 thẻ người, các dòng "Muốn";
   hộp "Chuyện cấm đạo" (cùng người đọc Công giáo); lời người dẫn (chào, luật, tung thử, bị thương nặng, anh Quảng bị thương nặng, lạc, mang tật, Kết);
   thư mời; mục H của Sổ; câu "Nửa xóm đã đi…".
2. **Sửa giọng "Sử đã chép"** cho cả 7 lượt. Sự kiện, con số, tên giữ nguyên trừ khi sử gia sửa.
3. **Giữ nhãn hư cấu** khi bỏ dấu [nháp]: "Ở xóm (hư cấu)", "Chuyện hư cấu" trên thẻ sự việc, "Người hư cấu" trên thẻ
   người, "Thư hư cấu" trên lá thư.
4. **Giọng.** Người kể trung tính, câu ngắn, không cảm thán, không gán ý cho bên nào. Nhân vật nói giọng của họ: nhà
   họ Đỗ giọng Nam Bộ thôn quê giữa thế kỷ 19; anh Quảng giọng Quảng Ngãi (nhờ người Quảng Ngãi đọc mọi câu của anh);
   chị Nhàn giọng Nam Bộ, có thể có chút cách nói của người có đạo.
5. **Từ.** Người kể dùng: liên quân Pháp – Tây Ban Nha; lính người Philippines; quân triều đình (Đại Nam); người có
   đạo. Không dùng "giặc", "quân xâm lược" trong lời người kể. Chữ thời đó như "Tây", "giặc", "Lang Sa", "Y Pha Nho",
   "Ma Ní", "tả đạo" chỉ nằm trong lời nhân vật, và không bao giờ là lời chửi nhắm vào một người trên bàn cờ. Nhân vật
   nói "đi xâu", "trốn xâu"; người kể nói "dân phu". Không dùng "nhà nước", "kiều bào", "Bạn".
6. **Tên.** Mỗi người một tên ở mọi chỗ người chơi thấy: Bà Sáu, Tía Bền, Má Thơm, Lộc, Mận, Út Cò, anh Quảng, chị
   Nhàn. Chữ đầu khác nhau. Tên đầy đủ chỉ để ở đây: Đỗ Văn Bền, Lê Thị Thơm, Đỗ Văn Lộc, Đỗ Thị Mận, Đỗ Văn Tài (Út
   Cò); tên khai sinh của bà Sáu người viết đặt (bản 1 dùng Huỳnh Thị Nhạn, nên đổi vì gần tên Nhàn). Tên thật anh
   Quảng ("Lê Văn Khiêm") là tạm, người viết đặt lại, và ghi đúng tên đó ngoài lá thư gửi mẹ. Tên chị Nhàn chờ người
   đọc Công giáo. **Tía Bền** là con thứ ba của ông bà Sáu; người Nam kêu con đầu là Hai, nên ngoài xóm có thể kêu
   tía là anh Tư. Bản 3 bỏ câu này khỏi thẻ: ở bàn D, người chơi gọi nhân vật mình là "ông Tư" suốt buổi. Người viết
   quyết có đưa lại không, và đưa thì đưa vào lời kể nào.
7. **Lá thư.** Năm 1861 thư sẽ viết bằng chữ Nôm. Chồng miền Nam xưa có khi xưng "qua" với vợ; cân nhắc. "Má tui" là bà
   Sáu; "ông" là ông Sáu đã mất. Ký "Bền".
8. **Đồ và cách gọi.** Lời nhân vật nói "bát nhang". Gia phả của nhà thường dân có thể chỉ là sổ chép tên, ngày giỗ,
   hay bài vị; người viết chọn theo ý sử gia. Nếu cần thêm đồ tiền bạc: xâu tiền kẽm, tiền đồng Tự Đức thông bảo, bạc
   nén [sử gia kiểm].
9. **Câu của bà Sáu ở bờ tre** nên là một việc làm, không là một câu nói lên chủ đề. Hộp cấm đạo mang phần sử.
10. **Độ dài khi đọc to.** Mỗi đoạn "Ở xóm" dưới 15 giây. "Sử đã chép" lượt 1 dưới 15 giây, các lượt khác dưới 40
    giây. Lá thư dưới 90 giây. Thẻ Khoảnh khắc dưới 60 giây. Thẻ "Bờ tre" dưới 30 giây.
11. **Đừng thêm** cái chết của người có tên, cảnh máu, tiếng reo thắng trận, câu "bài học", hay ai đốt nhà.

### Cho sử gia (phải kiểm)

1. **Lịch.** Đã tính bằng thiên văn: Tết Tân Dậu 10.2.1861; 24.2 là rằm; trăng tròn đêm 24–25. Chỉ cần đối chiếu lịch
   Hiệp kỷ.
2. **Quân số.** Charner tới 6 hay 7.2.1861; 50–70 tàu; chừng 3.500 quân; đồn binh Sài Gòn 800–1.000, bị vây từ khoảng
   3.1860; liên quân đánh Chí Hoà 3.500–5.000 (có nguồn 8.000); quân triều đình 12.000 (sách Việt) tới hơn 30.000
   (Pallu: 21.000 lính chính quy, 10.000 quân đồn điền). Nguồn Việt ghi bao nhiêu?
3. **Phòng tuyến và tên đồn.** Dài chừng 12 km; trại chính 3.000 × 900–1.000 m, tường đất sét và đá ong cao 3,5 m, dày
   2 m, khoảng 150 khẩu pháo. Đồn Redoute có đúng là đồn Hữu trong sách Việt không, và ở đầu nam, phía chùa Cây Mai?
4. **Hướng đánh** như bàn cờ đang vẽ: 24.2 từ Cây Mai lên đồn Hữu; 25.2 vòng lên đánh mặt bắc. Cổng hậu có ở mặt bắc
   không?
5. **Giờ giấc** (Pallu, HistoryNet): 4 giờ 30 pháo phòng tuyến chùa bắn; 5 giờ 30 xuất quân; đồn Hữu mất trong buổi
   sáng; 15 giờ tiến tiếp; 16 giờ voi xông ra; tối cách đại đồn 2 km. Ngày 25: 5 giờ lên đường, 10 giờ dàn quân, pháo
   tiến 1.000 – 500 – 200 m; tường ngoài vỡ chưa tới nửa giờ. **Giờ trận kết thúc:** HistoryNet ghi cuối buổi sáng;
   vi.wikipedia ghi 8 giờ tối, không dẫn nguồn.
6. **Đêm 24–25.** Yên, không bắn (Pallu). Liên quân ngủ ở xóm bỏ hoang cách góc tây bắc 1,5 km. Đường lên Bà Điểm có
   đi ngang vùng đó không (lý do đóng lối Bà Điểm lượt 3–5)?
7. **Liên quân.** Lính Philippines (chừng 200 bộ binh, 70 kỵ) có phải phần đông quân "Tây Ban Nha" không; đại đội lính
   người Việt ở cánh trái; phu khiêng thang có phải người Hoa mộ ở Quảng Đông không.
8. **Người có tên.** Vassoigne và Palanca bị thương ngày 24; Testard mất vì vết thương; Nguyễn Tri Phương trúng mảnh
   đạn ở bụng; chức của Nguyễn Duy (Tán lý hay Lang trung) theo *Đại Nam thực lục*; Tôn Thất Trĩ (tán tương); Phạm Thế
   Hiển tử trận hay ốm mất ít ngày sau.
9. **Người chết, mọi bên.** Kiểm toàn bộ thẻ số liệu (mục 7.2). Nguồn Việt ghi gì? Có số dân phu, dân thường không? Câu
   của Pallu ("người không chạy kịp đều bị giết") có nên in, và in thế nào?
10. **Hướng rút.** Về đồn Thuận Kiều (Trần Văn Giàu), 28.2 bỏ Thuận Kiều và Tây Thới về Biên Hoà; hay qua rạch Thị
    Nghè về thẳng Biên Hoà (HistoryNet). Trương Định về Gò Công. Quân rút có đi ngang rạch nào không (lửa hư cấu ở Bờ
    rạch lượt 6)? Tàu Pháp đậu trên sông Bến Nghé, Thị Nghè: ghe dân trên rạch nhỏ có đi được không?
11. **Lửa phỏng theo.** Chiều 24.2 có đạn tới vùng gò mả mé tây bắc không (Gò mả lượt 2)? Trục tiến quân sáng 25 có
    đi ngang đồng mả không? Bản 3 thêm: sau khi phá cổng (gần trưa 25.2), liên quân có giữ mặt bắc, quanh vùng đình
    phía bắc đồn, tới chiều không (Đình lượt 5–6)? Bản 4 thêm: sáng 25.2, đạn pháo hai bên có rơi lạc ra vùng dân phía
    đông bắc đồn (chợ, mé rạch) không (Chợ lượt 4, Bờ rạch lượt 4–5)?
12. **Dân quanh đồn.** Năm 1861 còn dân ở gần đại đồn không? Dân phu đắp luỹ Chí Hoà năm 1860 gọi từ đâu, ở đâu, bỏ
    về thì làng phải làm gì?
13. **Lính Quảng Ngãi** ở Gia Định năm 1861; lính biết chữ; lính đóng gần trại phu.
14. **Cấm đạo** (cùng người đọc Công giáo). Các dụ 1833, 1836 (Minh Mạng), thời Thiệu Trị, 1848, 1851, 1855, cuối 1859,
    17.1.1860. Lệnh phân sáp 5.8.1861 (29 tháng 6 Tân Dậu): đủ năm điều; có áp cho đàn bà, trẻ con không; chi tiết "má
    kia thích tên huyện bị đưa tới"; nơi thi hành (không thi hành ở Sài Gòn – Chợ Lớn); ngày bãi sau Hoà ước 1862.
    Khoảng số người có đạo chết, bị tù 1857–1862, có tên nguồn (nguồn giáo hội và sử gia khác). Từ 1859 tới tháng
    2.1861, quan quân làm gì với người có đạo quanh đại đồn (bắt giam, dời đi, buộc bỏ đạo)? Cho một giáo dân thường
    ngồi nhờ thì bị tội gì? Đối chiếu với *Đại Nam thực lục*.
15. **Giấy tờ, đồ vật.** Văn tự ruộng (tờ đoạn mãi, tờ tương phân, chữ Hán); địa bộ 1836; gia phả hay bài vị, sổ giỗ
    của nhà thường dân; gói vải tẩm dầu rái bỏ ống tre; vải xé để băng; tiền kẽm, tiền Tự Đức thông bảo.
16. **Đời sống.** Mùa khô, ruộng đã gặt; nhà lá ba gian; gò mả có mộ xây; chợ chồm hổm; cầu khỉ; ghe trên rạch; tục kêu
    thứ (Hai, Ba, Tư, Út); "tía", "má sắp nhỏ", chồng xưng "qua". Có chỗ nào sai thời không?
17. **Sau trận.** Mỹ Tho 12.4.1861 (có sách ghi 15.4), quân Tây Ban Nha có dự không; Nhật Tảo 10.12.1861; Biên Hoà
    16.12.1861 (Hoàng Văn Lân ghi 7.1.1862, có thể lẫn với Bà Rịa); Hoà ước Nhâm Tuất 5.6.1862 (có nguồn ghi 6.6) và
    điều khoản tự do giữ đạo.
18. **Tên gọi.** Kỳ Hoà có phải là cách người Pháp đọc trại "Chí Hoà" (Ki-hoa) không. Ông Đỗ Trình Thoại (họ Đỗ mặc
    định). Thánh Phaolô Lê Văn Lộc (tên Lộc).

### Việc chung trước buổi thật

- Người đọc Công giáo đọc Phụ lục A và quyết tên chị Nhàn.
- Sử gia đọc bản dịch Pallu và trả lời mục 3–10 trước tiên: đó là những chỗ bàn cờ dựa vào.
- Người dẫn chơi thử một mình hai lần với luật bản 4 (mục 10.4), làm cả phép kiểm "ít lần tung nhất".
- Bàn F và G (`sim3-f.md`, `sim3-g.md`) chạy trên bản 3; bản 4 chưa ai chơi. Phải chạy mô phỏng lại trên bản 4 trước
  buổi thật, nhất là lửa ở xóm lượt 4–5 (bàn cẩn thận có thấy nặng quá không), lần tung của Lộc ở lượt 2, câu 2 ở gốc
  me, chị Nhàn và giờ của lượt 4.
