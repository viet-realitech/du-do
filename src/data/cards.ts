/* Chế độ Chơi: thẻ ứng xử của dòng họ cho từng sự kiện lịch sử.
   Mỗi thẻ: [id sự kiện, phạm vi, các lựa chọn]. Phạm vi 'all' = cả nước phải quyết định;
   danh sách vùng (B, T1, T2, QT, NE, NW) = bắt buộc nếu quê ở đó, còn lại là tuỳ chọn; '' = luôn tuỳ chọn.
   Lựa chọn: [nhãn, mô tả, hiệu ứng, kết cục]. Hiệu ứng: g lúa gạo · d nhân đinh · b bạc · u uy tín;
   quan hệ: tr triều đình · ph Pháp · nh Nhật · vm Việt Minh/VNDCCH · qg Quốc gia/VNCH · my Mỹ · nn Nhà nước sau 1976 · lg làng xóm.
   Số liệu là ước lệ của trò chơi, không phải sử liệu. */
export type Fx = Partial<Record<'g' | 'd' | 'b' | 'u' | 'tr' | 'ph' | 'nh' | 'vm' | 'qg' | 'my' | 'nn' | 'lg', number>>;
export type Choice = [string, string, Fx, string];
export type Card = [string, string, Choice[]];

export const CARDS: Card[] = [
  ['dn58', 'T2', [
    ['Góp lương cho đồn Liên Trì', 'Chở gạo và trâu ra tiền tuyến của Nguyễn Tri Phương.', { g: -12, u: 4, tr: 10, ph: -8 }, 'Quan trấn thủ ghi tên dòng họ vào sổ công. Vựa lúa vơi một nửa.'],
    ['Đưa cả họ lên núi tránh pháo', 'Bỏ ruộng ven biển, tạm lánh vào vùng cao.', { g: -6, d: 2, lg: -4 }, 'Không ai chết vì đạn pháo, nhưng làng xóm xì xào về nhà "bỏ chạy trước".'],
    ['Giữ ruộng, chờ xem', 'Ở lại làm mùa, không theo bên nào.', { b: 3, u: -3 }, 'Vụ mùa vẫn gặt được. Những người lính qua làng nhìn dòng họ bằng ánh mắt lạ.'],
  ]],
  ['gd59', 'NE', [
    ['Chạy khỏi Gia Định', 'Gom của cải, đưa người về quê ngoại.', { g: -8, b: -5, d: 3 }, 'Thành cháy ba ngày sau lưng. Dòng họ mất kho thóc nhưng còn đủ người.'],
    ['Bán gạo cho quân Pháp', 'Thuyền Pháp thiếu lương, trả bằng bạc.', { b: 14, u: -10, ph: 10, tr: -12, lg: -8 }, 'Bạc đầy rương, nhưng người làng gọi dòng họ là "kẻ bán gạo cho Tây".'],
    ['Tiếp tế cho quân triều đình', 'Đưa thóc vào đại đồn đang xây.', { g: -10, u: 4, tr: 10, ph: -6 }, 'Thóc của dòng họ đắp vào luỹ Chí Hoà.'],
  ]],
  ['cd61', 'NE', [
    ['Gửi trai tráng vào đồn', 'Con cháu cầm giáo giữ luỹ với Nguyễn Tri Phương.', { d: -6, u: 6, tr: 12, ph: -10 }, 'Đồn vỡ. Hai người không về. Tên họ được ghi trong bài vị làng.'],
    ['Giấu lương, đóng cổng làng', 'Không cho bên nào lấy thóc.', { g: -3, lg: 4, tr: -3 }, 'Lính thua chạy qua làng không ai mở cổng. Thóc còn, nhưng lòng áy náy.'],
  ]],
  ['nt61', 'NE,NW', [
    ['Cho nghĩa quân mượn ghe', 'Ghe của họ chở người của Nguyễn Trung Trực.', { b: -4, u: 5, tr: 5, ph: -10 }, 'Tàu Espérance cháy trên sông. Pháp lùng ghe lạ khắp vùng, dòng họ phải đục chìm hai chiếc.'],
    ['Không dính dáng', 'Chuyện sông nước để người sông nước lo.', { u: -2 }, 'Đêm đó cả làng nghe tiếng nổ. Dòng họ im lặng.'],
  ]],
  ['nt62', 'all', [
    ['Ở lại ba tỉnh miền Đông', 'Chấp nhận sống dưới quyền Pháp để giữ ruộng.', { g: 4, ph: 6, tr: -6, u: -4 }, 'Ruộng còn nguyên, nhưng phải nộp thuế cho quan Tây.'],
    ['Dời sang miền Tây theo triều đình', 'Bỏ đất nhượng, về vùng còn thuộc Đại Nam.', { g: -10, b: -6, u: 4, tr: 8 }, 'Mất đất tổ, nhưng không làm dân thuộc địa.'],
    ['Than khóc rồi nộp thuế', 'Làm lễ cáo tổ tiên, rồi sống tiếp.', { lg: 3 }, 'Ruộng vẫn cày. Chuyện hiệp ước thành câu chuyện kể bên bếp.'],
  ]],
  ['kh63', '', [
    ['Mở đường buôn lên Nam Vang', 'Theo thương lái Hoa kiều đi Campuchia.', { b: 8, g: -2, ph: 3 }, 'Đường buôn mở, bạc về đều. Dòng họ bắt đầu biết tiếng Khmer.'],
    ['Không quan tâm', 'Chuyện bên kia biên giới.', {}, 'Tin tức đến làng trễ nửa năm.'],
  ]],
  ['td64', 'NE', [
    ['Che giấu nghĩa quân tan rã', 'Nuôi giấu mấy người lính của Trương Định.', { g: -6, d: 2, u: 6, ph: -10, lg: 5 }, 'Ba người lính sau này thành rể, thành bạn của dòng họ.'],
    ['Giao nộp để yên thân', 'Chỉ chỗ cho quan Pháp.', { b: 6, u: -15, ph: 8, lg: -15 }, 'Pháp thưởng bạc. Làng không ai mời dòng họ đi đám nữa.'],
    ['Đóng cửa, không biết gì', 'Mặc ai hỏi cũng lắc đầu.', { u: -2 }, 'Nghĩa quân tan vào ruộng. Dòng họ sống như chưa có gì.'],
  ]],
  ['vl67', 'NW', [
    ['Theo Phan Thanh Giản giao thành', 'Tin rằng giữ dân hơn giữ thành.', { g: 3, u: -3, ph: 5, tr: -3 }, 'Không đổ máu. Mấy năm sau con cháu phải học chữ Tây.'],
    ['Về rừng lập trại', 'Theo nghĩa quân rút vào Đồng Tháp Mười.', { g: -10, d: -3, u: 7, ph: -15, tr: 6 }, 'Sốt rét lấy đi hai người. Tên dòng họ xuất hiện trong thơ Nguyễn Đình Chiểu.'],
  ]],
  ['hn73', 'B', [
    ['Giữ cổng thành với Nguyễn Tri Phương', 'Đưa người lên mặt thành.', { d: -4, u: 6, tr: 10, ph: -8 }, 'Thành mất trong một buổi sáng. Những người sống sót kể chuyện đến già.'],
    ['Lánh ra ngoại thành', 'Đóng cửa hiệu buôn phố Hàng, chạy về quê.', { b: -6, d: 2 }, 'Hiệu buôn bị lính cướp sạch, nhưng người còn đủ.'],
    ['Bán hàng cho quân Garnier', 'Lính Pháp cần vải, muối, gạo.', { b: 10, u: -8, ph: 8, tr: -10 }, 'Garnier chết ở Cầu Giấy, Pháp rút. Người mua hàng của bạn không còn, danh tiếng cũng không.'],
  ]],
  ['gt74', 'all', [
    ['Xin làm việc cho toà sứ', 'Cho con học chữ Pháp để làm thông ngôn.', { b: 8, u: -5, ph: 10, tr: -5 }, 'Con trai thứ thành thông ngôn, lương bằng cả vụ lúa.'],
    ['Giữ nếp nhà Nho', 'Con vẫn học chữ Hán đi thi.', { u: 3, tr: 5, b: -3 }, 'Hai khoa thi nữa còn mở. Dòng họ có người đỗ tú tài.'],
  ]],
  ['hd82', 'B', [
    ['Theo Hoàng Diệu giữ thành', 'Người của họ lên thành lần nữa.', { d: -4, u: 7, tr: 10, ph: -10 }, 'Hoàng Diệu tuẫn tiết. Dòng họ lập bàn thờ ông ở từ đường.'],
    ['Chạy về quê gốc', 'Rời Hà Nội trước khi thành mất.', { b: -5, g: -3 }, 'Phố phường tan hoang, nhưng dòng họ lại đông đủ ở quê.'],
  ]],
  ['ta83', 'T2', [
    ['Tản cư khỏi Thuận An', 'Dời nhà lên vùng gò.', { g: -5, d: 2 }, 'Pháo hạm bắn suốt ba ngày. Nhà cũ chỉ còn nền.'],
    ['Góp thuyền chở quân triều đình', 'Thuyền của họ chở lính ra đồn.', { b: -5, u: 4, tr: 8, ph: -8 }, 'Thuyền chìm hai chiếc. Triều đình ghi công mà không có tiền thưởng.'],
  ]],
  ['pt84', 'all', [
    ['Chấp nhận bảo hộ, giữ chức làng', 'Xin làm lý trưởng dưới chế độ mới.', { b: 6, u: 1, ph: 8, lg: 4, tr: -4 }, 'Dòng họ nắm sổ đinh sổ điền của làng suốt một đời.'],
    ['Từ quan, về dạy học', 'Không làm việc với người Pháp.', { b: -4, u: 6, tr: 6, ph: -6, lg: 5 }, 'Học trò kéo đến đầy sân. Nhà nghèo đi nhưng được kính.'],
  ]],
  ['cv85', 'all', [
    ['Hưởng ứng Chiếu Cần Vương', 'Bán ruộng mua gươm, lập đội nghĩa binh.', { g: -12, d: -6, b: -8, u: 11, tr: 15, ph: -20 }, 'Cả họ lên rừng. Tên dòng họ đi vào các bài vè Cần Vương.'],
    ['Góp tiền, không góp người', 'Gửi bạc cho nghĩa quân, giữ con cháu ở nhà.', { b: -10, u: 4, tr: 8, ph: -8 }, 'Quan Pháp nghi ngờ nhưng không có bằng chứng.'],
    ['Đứng ngoài', 'Chờ xem vua nào thắng.', { u: -5, lg: -5 }, 'Khi nghĩa quân về làng xin lương, dòng họ đóng cửa. Người làng nhớ điều đó.'],
  ]],
  ['tt85', 'B', [
    ['Bán gạo cho quân Thanh', 'Quân Thanh ở Lạng Sơn thiếu lương.', { b: 8, g: -8, ph: -5 }, 'Bạc nhận bằng nén. Sau hiệp ước, quân Thanh rút, nợ cũng đi theo.'],
    ['Tránh xa vùng chiến sự', 'Dọn ra khỏi đường quân đi.', { g: -4, d: 2 }, 'Làng cũ bị cả hai bên lấy lương, may mà người còn.'],
  ]],
  ['bd86', 'T1', [
    ['Tiếp tế cho căn cứ Ba Đình', 'Chở gạo qua đồng chiêm trũng ban đêm.', { g: -10, u: 7, tr: 8, ph: -15 }, 'Ba Đình giữ được thêm một mùa. Rồi Pháp đốt làng.'],
    ['Lánh sang phủ bên', 'Mang con cháu đi trước khi Pháp vây.', { g: -5, b: -3, d: 2 }, 'Làng thành tro, nhưng dòng họ còn đủ mặt.'],
  ]],
  ['ld87', '', [
    ['Cho con học trường Pháp – Việt', 'Đón trước thời thế mới.', { b: -5, u: -2, ph: 8 }, 'Hai mươi năm sau, con trai làm tham biện. Dòng họ đổi cả cách ăn mặc.'],
    ['Giữ trường làng chữ Nho', 'Thầy đồ vẫn ngồi chiếu giữa.', { u: 2, lg: 4, b: -2 }, 'Chữ Nho còn, nhưng bằng cấp dần vô dụng.'],
  ]],
  ['hn88', 'T1,T2', [
    ['Nuôi giấu người theo vua', 'Những người hộ giá tan tác tìm về.', { g: -6, u: 6, tr: 8, ph: -10 }, 'Một ông quan già mất trong nhà bạn, được chôn như người trong họ.'],
    ['Không mở cửa', 'Sợ liên luỵ.', { u: -4, lg: -3 }, 'Người gõ cửa đi tiếp trong đêm. Không ai biết ông ta ra sao.'],
  ]],
  ['la93', '', [
    ['Đi buôn muối lên Lào', 'Đường mới mở sang Mekong.', { b: 8, g: -2, d: -1 }, 'Một người bỏ mạng vì sốt rừng, nhưng muối bán được giá gấp ba.'],
    ['Không đi', 'Rừng Lào quá xa.', {}, 'Người khác làm giàu bằng con đường đó.'],
  ]],
  ['hk96', 'T1', [
    ['Chôn cất nghĩa quân', 'Đưa xác người của Phan Đình Phùng về an táng.', { b: -3, u: 7, lg: 8, ph: -8 }, 'Mộ không tên ở sau chùa. Mỗi rằm tháng bảy dòng họ thắp hương.'],
    ['Nộp vũ khí nghĩa quân để lập công', 'Giao súng tìm được cho đồn.', { b: 6, u: -12, ph: 8, lg: -12 }, 'Pháp cho làm phó lý. Làng gọi sau lưng là "phó lý súng".'],
  ]],
  ['dm02', 'all', [
    ['Mở hiệu buôn ở ga xe lửa', 'Đường sắt qua tỉnh, lập cửa hàng.', { b: 12, g: -4, ph: 5 }, 'Bạc từ khách tàu chảy về đều mỗi tháng.'],
    ['Nấu rượu lậu', 'Độc quyền rượu khiến giá đắt gấp bốn.', { b: 10, u: -4, ph: -10, lg: 6 }, 'Hai lần bị bắt, một lần mất cả nồi. Làng vẫn mua rượu của bạn.'],
    ['Chịu thuế, giữ ruộng', 'Nộp thuế muối, thuế thân như mọi người.', { g: -6, b: -4 }, 'Năm nào cũng thiếu một chút. Dòng họ gầy đi.'],
  ]],
  ['dd05', 'all', [
    ['Gửi con sang Nhật', 'Bán ruộng lo tiền đường cho một người đi Đông Du.', { g: -8, b: -12, d: -1, u: 7, ph: -12, nh: 8 }, 'Thư từ Tokyo về được hai năm rồi tắt. Năm 1909 cậu bị trục xuất, lưu lạc sang Xiêm.'],
    ['Góp tiền quỹ Duy Tân hội', 'Không cho con đi, nhưng góp bạc.', { b: -8, u: 4, ph: -6 }, 'Mật thám lập hồ sơ về dòng họ.'],
    ['Từ chối', 'Chuyện xuất dương quá mạo hiểm.', { u: -2 }, 'Người đến quyên tiền đi tay không.'],
  ]],
  ['dk07', 'B', [
    ['Cho con cháu học Nghĩa Thục', 'Học quốc ngữ, cắt tóc ngắn.', { b: -2, u: 4, ph: -5, lg: 3 }, 'Trường đóng cửa sau chín tháng, nhưng cả nhà đã biết đọc quốc ngữ.'],
    ['Giữ trường làng', 'Không tin "trường miễn phí".', { u: -1 }, 'Chậm hơn hàng xóm một thế hệ trong việc đọc báo.'],
  ]],
  ['ct08', 'T2', [
    ['Kéo về toà sứ đòi giảm thuế', 'Cả họ cùng dân làng xuống tỉnh.', { d: -2, u: 7, ph: -12, lg: 12 }, 'Hai người bị đày Côn Đảo. Làng từ đó gọi dòng họ là "họ biểu tình".'],
    ['Nộp đủ thuế, đứng ngoài', 'Không xuống tỉnh.', { b: -5, lg: -6 }, 'Thuế vẫn phải nộp, mà làng thì lạnh nhạt.'],
  ]],
  ['nq11', '', [
    ['Cho một người con đi làm tàu viễn dương', 'Theo gương người thanh niên ở bến Nhà Rồng.', { d: -1, b: 4, u: 2 }, 'Thư từ Marseille, rồi New York. Hai mươi năm sau mới về.'],
    ['Giữ con ở nhà', 'Biển rộng quá.', {}, 'Người ở lại làm ruộng.'],
  ]],
  ['yt13', 'B', [
    ['Che chở tàn quân Yên Thế', 'Giấu người của Đề Thám trong vườn.', { g: -5, u: 6, ph: -10, lg: 5 }, 'Pháp lục soát ba lần, không tìm thấy ai.'],
    ['Báo đồn', 'Lấy thưởng.', { b: 8, u: -15, ph: 8, lg: -15 }, 'Bạc thưởng đủ mua ba mẫu ruộng. Ba mẫu ruộng ấy không ai chịu cày thuê.'],
  ]],
  ['ww14', 'all', [
    ['Đi lính thợ sang Pháp', 'Một người con đăng lính thợ để có lương.', { d: -2, b: 10, u: 1, ph: 6 }, 'Năm 1919 về với chiếc đồng hồ và tiếng Pháp. Kể chuyện Marseille cả đời.'],
    ['Nộp tiền để khỏi đi', 'Lo lót để không bị bắt lính.', { b: -10 }, 'Người giữ được, bạc mất.'],
  ]],
  ['tn25', '', [
    ['Gửi con sang Quảng Châu', 'Theo lớp huấn luyện của Nguyễn Ái Quốc.', { d: -1, b: -1, g: -3, u: 4, vm: 15, ph: -10 }, 'Người ấy về nước năm 1928, mang theo tờ báo Thanh Niên và một cái tên khác.'],
    ['Không biết chuyện này', 'Tin đến làng rất muộn.', {}, 'Một người cháu họ xa đi mà không ai hay.'],
  ]],
  ['cs30', 'all', [
    ['Có người vào Đảng', 'Một người cháu được kết nạp.', { u: 3, vm: 20, ph: -15, tr: -5 }, 'Cháu đi biệt. Mật thám đến hỏi ba lần.'],
    ['Giữ khoảng cách', 'Không muốn liên luỵ.', { vm: -5 }, 'Dòng họ không có tên trong hồ sơ Sở Liêm phóng.'],
  ]],
  ['yb30', 'B', [
    ['Có người trong Quốc dân đảng', 'Một người con theo Nguyễn Thái Học.', { d: -2, u: 6, ph: -20, vm: 3 }, 'Người ấy bị chém ở Yên Bái. Dòng họ giữ tấm ảnh trong hộp gỗ.'],
    ['Đứng ngoài', 'Không tham gia.', {}, 'Tin tử hình về làng, cả họ im lặng.'],
  ]],
  ['xv30', 'T1', [
    ['Theo Xô viết, chia ruộng công', 'Dòng họ góp ruộng hương hoả vào quỹ làng.', { g: -10, u: 6, vm: 20, ph: -20, lg: 10 }, 'Pháp ném bom, bắt bớ. Ruộng hương hoả mất, uy tín trong làng lên.'],
    ['Giữ ruộng, báo quan', 'Sợ mất đất.', { g: 2, u: -10, ph: 10, vm: -25, lg: -15 }, 'Ruộng còn. Làng gọi dòng họ là "nhà tố cáo" suốt ba đời.'],
    ['Đi lánh ở Vinh', 'Tránh cả hai bên.', { b: -6, g: -4 }, 'Trở về khi yên, thấy ruộng bỏ hoang một mùa.'],
  ]],
  ['mt36', 'all', [
    ['Ra báo quốc ngữ', 'Mở tờ báo tỉnh, in tin Mặt trận Bình dân.', { b: -2, u: 6, vm: 6, ph: 3 }, 'Báo sống ba năm, đóng cửa năm 1939. Dòng họ có người biết viết.'],
    ['Mở hiệu buôn lớn', 'Thời làm ăn dễ.', { b: 12, g: 2 }, 'Hiệu buôn thành nhà mặt phố.'],
  ]],
  ['nh40', 'B', [
    ['Bán hàng cho quân Nhật', 'Nhật trả bằng tiền quân phiếu.', { b: 6, g: -6, nh: 10, ph: -5, lg: -4 }, 'Quân phiếu Nhật năm năm sau thành giấy lộn.'],
    ['Giấu thóc', 'Chôn thóc trong vườn.', { g: 4, nh: -8 }, 'Thóc chôn này cứu được cả họ năm 1945.'],
  ]],
  ['nk40', 'NE,NW', [
    ['Theo khởi nghĩa', 'Người của họ cầm cờ đỏ sao vàng.', { d: -4, u: 7, vm: 20, ph: -25 }, 'Pháp xử bắn hàng loạt. Cờ được giấu trong ống tre.'],
    ['Cho người trốn qua Miên', 'Giúp người của họ lánh sang Campuchia.', { b: -5, d: 1, vm: 5, ph: -8 }, 'Người về sau năm 1945, kể chuyện sông Mekong.'],
    ['Đóng cửa', 'Không ra khỏi làng.', { u: -3 }, 'Cuộc khởi nghĩa đi qua ngoài cửa.'],
  ]],
  ['vm41', 'all', [
    ['Lập cơ sở Việt Minh trong làng', 'Nhà thành nơi họp bí mật.', { g: -4, u: 4, vm: 20, ph: -12, nh: -8 }, 'Bốn năm sau, chính nhà này treo cờ đầu tiên của làng.'],
    ['Theo dõi, chưa quyết', 'Chờ xem.', {}, 'Người Việt Minh đến rồi đi, hẹn gặp lại.'],
  ]],
  ['ft41', '', [
    ['Đi lính thuỷ cho Pháp', 'Có lương, được đi Koh Chang.', { d: -1, b: 5, ph: 6 }, 'Về kể chuyện trận hải chiến đến cuối đời.'],
    ['Không', 'Chiến tranh của người khác.', {}, 'Tin thắng trận đọc trên báo.'],
  ]],
  ['vb44', '', [
    ['Gửi trai tráng vào đội Tuyên truyền', 'Một người con lên Cao Bằng.', { d: -1, u: 4, vm: 15, ph: -8 }, 'Người ấy sau này là sĩ quan, về làng với huân chương.'],
    ['Không', 'Rừng xa quá.', {}, 'Nghe chuyện 34 người qua đài, mười năm sau.'],
  ]],
  ['ng45', 'all', [
    ['Mở kho thóc cứu đói', 'Phát thóc cho làng, không bán.', { g: -20, u: 14, vm: 10, lg: 20 }, 'Không ai trong làng chết đói mùa đó. Tên dòng họ được ghi ở đình.'],
    ['Bán thóc giá cao', 'Thóc giờ đắt hơn vàng.', { b: 25, g: -15, u: -25, lg: -25, vm: -15 }, 'Rương bạc đầy. Làng chôn người ngoài đồng, có nhà chết cả.'],
    ['Theo Việt Minh cướp chính quyền', 'Người của họ vào đoàn người kéo về tỉnh lỵ.', { d: -1, u: 8, vm: 25, qg: -10, lg: 8 }, 'Dòng họ có người trong uỷ ban nhân dân đầu tiên.'],
  ]],
  ['tq45', 'B,NE', [
    ['Bán gạo cho quân Trung Hoa', 'Quân Tưởng ở Bắc cần lương, trả bằng tiền quan kim.', { b: 6, g: -8, vm: -5 }, 'Tiền quan kim mất giá, gạo thì mất thật.'],
    ['Giấu gạo', 'Không giao dịch với lính nước ngoài.', { g: 2, lg: 3 }, 'Lính Tưởng lục soát hai lần, không thấy.'],
  ]],
  ['tk46', 'all', [
    ['Tản cư theo kháng chiến', 'Bỏ nhà ra vùng tự do.', { g: -12, d: -1, u: 7, vm: 20, ph: -20 }, 'Nhà bị đốt. Dòng họ sống bằng ruộng rẫy chín năm.'],
    ['Ở lại vùng tạm chiếm', 'Giữ nhà, giữ ruộng.', { g: 2, b: 4, vm: -12, ph: 8, qg: 5 }, 'Nhà còn, nhưng mỗi đêm nghe tiếng súng mà không biết nên mong ai thắng.'],
    ['Chia đôi họ', 'Một nhánh đi, một nhánh ở.', { g: -6, b: -2, d: -1, vm: 5, ph: 0 }, 'Hai nhánh gặp lại nhau ở hai phía chiến tuyến.'],
  ]],
  ['tu46', '', [
    ['Tin vào Tạm ước', 'Mở lại buôn bán với người Pháp.', { b: 6, ph: 5, vm: -3 }, 'Ba tháng sau súng nổ, hàng hoá cháy sạch.'],
    ['Không tin', 'Chuẩn bị cho chiến tranh.', { g: 3, b: -3 }, 'Thóc chôn sẵn trước khi Hà Nội nổ súng.'],
  ]],
  ['vb47', 'B', [
    ['Che giấu cán bộ kháng chiến', 'Nhà thành trạm liên lạc.', { g: -5, u: 6, vm: 15, ph: -15 }, 'Pháp nhảy dù hụt. Trạm liên lạc còn hoạt động đến 1954.'],
    ['Không tham gia', 'Sợ máy bay.', { vm: -5 }, 'Bom rơi cách làng hai cây số.'],
  ]],
  ['el49', 'all', [
    ['Làm việc cho Quốc gia Việt Nam', 'Một người con vào làm công chức Bảo Đại.', { b: 10, u: 1, qg: 20, ph: 8, vm: -15 }, 'Lương tháng đều, nhưng trong họ bắt đầu chia hai lối.'],
    ['Từ chối, theo kháng chiến', 'Không làm với chính phủ do Pháp dựng.', { u: 4, vm: 12, qg: -15 }, 'Tên dòng họ trong sổ "bất hợp tác" của tỉnh.'],
    ['Giữ trung lập', 'Buôn bán với cả hai.', { b: 5, vm: -3, qg: -3 }, 'Ai cũng mua hàng, không ai tin.'],
  ]],
  ['bg50', 'B', [
    ['Đi dân công tiếp tế', 'Gánh gạo lên Đông Khê.', { g: -8, d: -1, u: 6, vm: 15 }, 'Đường số 4 khai thông. Hai người về với bằng khen.'],
    ['Ở lại làng', 'Không đi dân công.', { vm: -6 }, 'Uỷ ban xã nhắc tên dòng họ trong cuộc họp.'],
  ]],
  ['hb52', 'B', [
    ['Tản cư khỏi Hoà Bình', 'Pháp chiếm thị xã.', { g: -6, b: -3 }, 'Ba tháng sau về, nhà còn tường.'],
    ['Tiếp tế cho bộ đội', 'Gánh gạo qua rừng.', { g: -8, u: 4, vm: 12, ph: -10 }, 'Bộ đội thắng, Pháp rút.'],
  ]],
  ['dbp', 'all', [
    ['Đi dân công Điện Biên', 'Cả nhánh họ đẩy xe thồ lên Tây Bắc.', { g: -10, d: -2, b: -4, u: 11, vm: 20 }, 'Về với chiếc xe thồ đã mòn và câu chuyện kể suốt đời.'],
    ['Đóng thuế nông nghiệp', 'Nộp thóc theo quy định vùng tự do.', { g: -8, vm: 8 }, 'Thóc của dòng họ đi lên Điện Biên bằng xe của người khác.'],
    ['Ở vùng Pháp, không liên quan', 'Nghe tin qua đài.', { qg: 3, vm: -5 }, 'Ngày 7 tháng 5, cả phố im lặng.'],
  ]],
  ['gnv', 'all', [
    ['Di cư vào Nam', 'Lên tàu há mồm ở Hải Phòng.', { g: -15, b: -8, d: -1, qg: 15, vm: -20, my: 5 }, 'Khởi đầu lại từ trại định cư. Mười năm sau có ruộng mới ở Cái Sắn.'],
    ['Ở lại miền Bắc', 'Giữ đất tổ.', { vm: 10, qg: -10 }, 'Ruộng sắp vào hợp tác xã.'],
    ['Tập kết ra Bắc', 'Người của họ ở Nam ra Bắc theo diện tập kết.', { d: -1, u: 3, vm: 15, qg: -12 }, 'Hẹn hai năm, thành hai mươi mốt năm.'],
  ]],
  ['dc54', 'all', [
    ['Đón người di cư', 'Cho một gia đình Bắc di cư ở nhờ.', { g: -5, u: 4, lg: 5, qg: 5 }, 'Nhà ấy sau thành thông gia.'],
    ['Giữ nhà, không nhận', 'Sợ khác đạo, khác giọng.', { lg: -3 }, 'Hàng xóm mới đến, nhìn nhau xa lạ nhiều năm.'],
  ]],
  ['vc55', 'NE,NW,T2', [
    ['Tham gia chính quyền mới', 'Làm xã trưởng thời Đệ nhất Cộng hoà.', { b: 8, u: 2, qg: 20, vm: -20 }, 'Ba năm sau, đêm nào cũng lo ám sát.'],
    ['Bỏ phiếu rồi về', 'Không dính vào chính trị.', { qg: 3 }, 'Phiếu bầu dòng họ nằm trong con số 98%.'],
  ]],
  ['cc53', 'B,T1', [
    ['Bị quy địa chủ', 'Dòng họ có ruộng nhiều hơn làng.', { g: -25, b: -15, u: -15, d: -2, vm: -15, lg: -10 }, 'Mất ruộng, mất người. Năm sau được sửa sai, nhưng ruộng không về.'],
    ['Hiến ruộng trước', 'Tự nguyện giao ruộng cho nông hội.', { g: -15, u: 4, vm: 10, lg: 5 }, 'Giữ được người và tiếng tốt. Ruộng thì mất như mọi nhà.'],
    ['Là bần nông được chia ruộng', 'Dòng họ nghèo, nay có ruộng.', { g: 12, u: 2, vm: 15, lg: 3 }, 'Lần đầu dòng họ có tên trong sổ điền.'],
  ]],
  ['bx55', 'NE', [
    ['Tránh khỏi Chợ Lớn', 'Dọn về quê khi hai bên bắn nhau.', { b: -6, g: -3 }, 'Nhà phố cháy mất một gian.'],
    ['Ủng hộ quân chính phủ', 'Cho lính Diệm dùng nhà làm chốt.', { b: -3, qg: 12, lg: -3 }, 'Bình Xuyên rút, dòng họ được tỉnh trưởng cảm ơn.'],
  ]],
  ['nv56', 'B', [
    ['Mua và giữ các số báo Nhân Văn', 'Trong họ có người thích văn chương.', { u: 2, vm: -8 }, 'Báo giấu trong tủ ba mươi năm.'],
    ['Phê phán theo chủ trương', 'Phát biểu trong buổi họp.', { vm: 6, u: -2 }, 'Được tin cậy hơn ở cơ quan.'],
  ]],
  ['ts59', 'T1,QT', [
    ['Đi bộ đội Trường Sơn', 'Người con theo Đoàn 559.', { d: -2, u: 6, vm: 15 }, 'Mười năm trong rừng. Về với sốt rét và một tấm huân chương.'],
    ['Góp gạo cho đoàn vận tải', 'Gạo của họ đi vào Nam.', { g: -8, vm: 8 }, 'Thóc ra đi lặng lẽ mỗi mùa.'],
  ]],
  ['mt60', 'NE,NW', [
    ['Theo Mặt trận Giải phóng', 'Người của họ vào bưng.', { d: -3, u: 6, vm: 15, qg: -20 }, 'Ban ngày là dân, ban đêm là người của Mặt trận.'],
    ['Theo chính quyền Sài Gòn', 'Vào dân vệ ấp chiến lược.', { b: 5, qg: 15, vm: -15 }, 'Ngủ trong ấp sau hàng rào kẽm gai.'],
    ['Đứng giữa', 'Ngày nộp thuế, đêm nộp gạo.', { g: -8, b: -5, lg: 3 }, 'Cả hai bên đến nhà, cả hai bên đều lấy.'],
  ]],
  ['dk60', 'NW', [
    ['Theo Đồng khởi', 'Cả họ phá đồn tề.', { d: -2, u: 7, vm: 18, qg: -20 }, 'Xã thành vùng giải phóng. Rồi bom.'],
    ['Lánh lên tỉnh', 'Tránh xa chuyện làng.', { b: -5, g: -5 }, 'Về sau ruộng đã có người khác cày.'],
  ]],
  ['dc63', 'NE', [
    ['Đi theo đoàn biểu tình Phật giáo', 'Nhà theo Phật.', { u: 4, qg: -8, lg: 5 }, 'Bị bắt một đêm, được thả sáng hôm sau.'],
    ['Giữ im lặng', 'Nhà theo Công giáo hoặc không muốn lộ.', { qg: 3 }, 'Sau đảo chính, mọi thứ lại đổi.'],
  ]],
  ['ab63', 'NE', [
    ['Tản cư khỏi Ấp Bắc', 'Trực thăng, pháo, súng máy.', { g: -8, b: -3, d: -1 }, 'Về nhà thấy mái bị đạn xuyên.'],
    ['Che giấu du kích', 'Hầm bí mật sau nhà.', { g: -5, u: 6, vm: 15, qg: -15, my: -10 }, 'Hầm không bị lộ suốt chiến tranh.'],
  ]],
  ['qd63', '', [
    ['Về chùa thắp hương', 'Cùng Phật tử tưởng niệm.', { u: 2, qg: -4, lg: 3 }, 'Bức ảnh ngọn lửa treo trong nhà.'],
    ['Không bày tỏ', 'Chuyện tôn giáo nhạy cảm.', {}, 'Tin đến nhà qua radio.'],
  ]],
  ['vb64', '', [
    ['Chuẩn bị hầm trú ẩn', 'Biết bom sắp tới miền Bắc.', { b: -4, d: 2 }, 'Hầm cứu được hai mạng người năm 1972.'],
    ['Không', 'Tin xa quá.', {}, 'Bom đến sớm hơn mọi người nghĩ.'],
  ]],
  ['dn65', 'T2', [
    ['Làm việc cho căn cứ Mỹ', 'Giặt đồ, bán hàng cho lính.', { b: 15, u: -5, my: 12, qg: 5, vm: -12 }, 'Đô la và nhạc rock vào nhà. Làng gọi là "nhà Mỹ".'],
    ['Dọn khỏi vùng căn cứ', 'Đất bị trưng dụng làm sân bay.', { g: -10, b: 5, my: -5 }, 'Được đền bù ít, mất ruộng nhiều.'],
  ]],
  ['id65', 'T2', [
    ['Tản cư khỏi Tây Nguyên', 'Người Kinh ở Pleiku đi xuống đồng bằng.', { g: -6, b: -5 }, 'Rẫy cà phê bỏ hoang.'],
    ['Ở lại', 'Rừng vẫn là nhà.', { d: -1, u: 2 }, 'Pháo đi qua rẫy mỗi tuần.'],
  ]],
  ['mt68', 'all', [
    ['Trú trong hầm nhà thờ', 'Huế, Sài Gòn: đạn khắp nơi.', { g: -8, b: -5, d: -1 }, 'Hai mươi lăm ngày trong hầm. Ra ngoài, thành phố khác hẳn.'],
    ['Dẫn đường cho quân Giải phóng', 'Người của họ biết đường thành nội.', { u: 6, vm: 15, qg: -20, my: -15, d: -2 }, 'Sau trận, đổi tên, đổi chỗ ở.'],
    ['Giúp binh sĩ VNCH bị thương', 'Mở cửa nhà làm trạm băng bó.', { g: -5, u: 4, qg: 12, vm: -8 }, 'Có người lính sau này quay lại tạ ơn, năm 1990.'],
  ]],
  ['ks68', 'QT', [
    ['Rời Khe Sanh', 'Dân quanh căn cứ được đưa đi.', { g: -10, b: -3 }, 'Không bao giờ quay lại bản cũ.'],
    ['Ở lại vùng Bru', 'Sống với người Bru-Vân Kiều.', { d: -1, u: 3, lg: 6 }, 'Học tiếng Bru, mất một người vì bom.'],
  ]],
  ['ml68', 'T2', [
    ['Làm chứng về Sơn Mỹ', 'Kể cho nhà báo nước ngoài.', { u: 7, my: -10, qg: -5 }, 'Lời kể được in ở Mỹ. Ở quê, không ai nhắc nữa.'],
    ['Im lặng', 'Sợ trả thù.', { u: -3 }, 'Hai mươi năm sau mới dám kể cho con.'],
  ]],
  ['hcm69', 'all', [
    ['Để tang', 'Treo cờ rủ, lập bàn thờ.', { vm: 8, qg: -5 }, 'Bàn thờ nhỏ trong góc nhà, giữ đến nay.'],
    ['Không bày tỏ', 'Nhà ở miền Nam hoặc khác chính kiến.', {}, 'Nghe tin trên BBC.'],
  ]],
  ['lk71', 'QT', [
    ['Đi lính Sư đoàn 1 VNCH', 'Người con bị động viên.', { d: -2, b: 5, qg: 12, vm: -10 }, 'Trở về từ Nam Lào với một chân.'],
    ['Trốn lính', 'Lên rừng, đổi tên.', { b: -8, qg: -12, vm: 5 }, 'Sống chui ba năm, rồi theo luôn bên kia.'],
  ]],
  ['qt72', 'QT,T2', [
    ['Chạy trên "Đại lộ Kinh hoàng"', 'Rời Quảng Trị theo Quốc lộ 1.', { g: -12, b: -8, d: -3 }, 'Mất hai người trên đường. Tới Huế với hai bàn tay trắng.'],
    ['Ở lại vùng giải phóng', 'Không chạy vào Nam.', { g: -8, d: -1, vm: 10, qg: -10 }, 'Sống dưới bom B-52 ba tháng.'],
  ]],
  ['lb72', 'B', [
    ['Sơ tán khỏi Hà Nội', 'Về quê tránh bom.', { g: -6, b: -4 }, 'Phố Khâm Thiên bị san phẳng. Nhà bạn ở cách đó hai phố.'],
    ['Ở lại trực chiến', 'Người của họ trong tự vệ.', { d: -1, u: 6, vm: 12 }, 'Bắn rơi một máy bay, được ghi tên trên báo.'],
  ]],
  ['pr73', 'all', [
    ['Tin hoà bình, sửa nhà', 'Lấy bạc dành dụm ra xây.', { b: -10, g: 3, u: 1 }, 'Nhà xây xong năm 1974. Năm 1975 đổi chủ.'],
    ['Không tin, giữ của', 'Để bạc trong lu.', { b: 3 }, 'Lu bạc năm 1975 đổi tiền thành gần không.'],
  ]],
  ['hs74', '', [
    ['Quyên góp cho hải quân VNCH', 'Góp tiền tưởng niệm 74 tử sĩ.', { b: -4, u: 3, qg: 8 }, 'Tấm bằng cảm ơn giữ trong album.'],
    ['Theo dõi tin tức', 'Không làm gì.', {}, 'Hoàng Sa thành cái tên trong sách.'],
  ]],
  ['bmt75', 'T2', [
    ['Chạy theo Quốc lộ 7', 'Rút khỏi Tây Nguyên cùng đoàn quân, đoàn dân.', { g: -15, b: -10, d: -4 }, 'Con đường chết. Tới Tuy Hoà còn một nửa.'],
    ['Ở lại Buôn Ma Thuột', 'Không chạy.', { g: -5, vm: 5, qg: -5 }, 'Thị xã đổi chủ trong hai ngày. Rẫy còn nguyên.'],
  ]],
  ['xl75', 'NE', [
    ['Tản cư về Sài Gòn', 'Tránh pháo Xuân Lộc.', { g: -8, b: -5 }, 'Tới Sài Gòn mười ngày trước 30 tháng Tư.'],
    ['Tiếp tế cho Sư đoàn 18', 'Nước, cơm, băng gạc.', { g: -6, u: 4, qg: 10, vm: -8 }, 'Sau này bị hỏi về chuyện này trong trại cải tạo.'],
  ]],
  ['sg75', 'all', [
    ['Di tản', 'Lên tàu, lên trực thăng, ra biển.', { g: -25, b: -15, d: -3, u: -5, my: 15, nn: -20 }, 'Guam, rồi California. Dòng họ bắt đầu lại từ số không, bằng tiếng Anh.'],
    ['Ở lại, trình diện', 'Người làm việc cho chế độ cũ đi học tập cải tạo.', { b: -15, d: -1, u: -8, nn: -5, qg: 0 }, 'Ba năm, năm năm, có người mười năm. Nhà thuộc diện "nguỵ quân nguỵ quyền".'],
    ['Đón quân giải phóng', 'Treo cờ, mở cửa.', { u: 4, vm: 12, nn: 15, qg: -15 }, 'Dòng họ có người vào uỷ ban quân quản phường.'],
  ]],
  ['cm75', '', [
    ['Đưa thân nhân từ Campuchia về', 'Hoa kiều, Việt kiều chạy Khmer Đỏ.', { g: -6, d: 3, u: 3, lg: 3 }, 'Thêm năm miệng ăn, thêm năm người sống.'],
    ['Không liên quan', 'Chuyện bên kia biên giới.', {}, 'Tin đến muộn và kinh hoàng.'],
  ]],
  ['tn76', 'all', [
    ['Vào hợp tác xã', 'Góp ruộng, trâu, nông cụ.', { g: -8, b: -3, nn: 12, lg: 4 }, 'Công điểm thay cho thóc. Thóc ít đi.'],
    ['Đi kinh tế mới', 'Nhận đất ở vùng mới.', { g: -10, b: -5, d: -1, nn: 8 }, 'Đất chua, sốt rét. Một nửa quay về thành phố.'],
    ['Xin ở lại thành phố', 'Lo lót để không phải đi.', { b: -10, nn: -5 }, 'Ở lại, nhưng sổ gạo cắt một nửa.'],
  ]],
  ['ct78', 'NE', [
    ['Bị kiểm kê, mất cửa hàng', 'Dòng họ buôn bán ở Chợ Lớn.', { b: -25, g: -5, u: -5, nn: -15 }, 'Cửa hàng ba đời thành cửa hàng mậu dịch.'],
    ['Giao nộp sớm, xin việc nhà nước', 'Chủ động hợp tác.', { b: -6, nn: 8 }, 'Làm công nhân viên trong chính tiệm của mình.'],
    ['Giấu vàng, chuẩn bị đi', 'Chôn vàng, tìm đường.', { b: -5, nn: -10 }, 'Vàng này mua được chỗ trên ghe năm 1980.'],
  ]],
  ['cp79', 'NW', [
    ['Đi bộ đội tình nguyện', 'Người con sang Campuchia.', { d: -2, u: 6, nn: 15 }, 'Mười năm sau về, không nói gì về Campuchia.'],
    ['Tản cư khỏi biên giới', 'Khmer Đỏ tàn sát Ba Chúc.', { g: -10, b: -5, d: -1 }, 'Về lại khi quân Việt Nam đã sang Phnom Penh.'],
  ]],
  ['bb79', 'B', [
    ['Đi dân quân biên giới', 'Người của họ lên Lạng Sơn.', { d: -2, u: 6, nn: 12 }, 'Một tháng chiến tranh, cả đời mang vết sẹo.'],
    ['Sơ tán về xuôi', 'Rời tỉnh biên giới.', { g: -8, b: -4 }, 'Thị xã Lạng Sơn bị san phẳng. Nhà không còn.'],
  ]],
  ['tn80', 'all', [
    ['Vượt biên', 'Bán hết, mua chỗ trên ghe.', { b: -25, g: -15, d: -4, u: -5, nn: -25, my: 15 }, 'Hai tuần trên biển. Có người không tới. Người tới gửi tiền về mỗi tháng.'],
    ['Ở lại', 'Chịu đói qua thời bao cấp.', { g: -8, nn: 5 }, 'Sổ gạo, tem phiếu, xếp hàng. Nhưng còn nhau.'],
    ['Gửi một người đi, giữ phần còn lại', 'Dồn tiền cho một người con.', { b: -15, d: -1, nn: -8, my: 8 }, 'Người ấy tới Pulau Bidong, rồi Úc. Thùng đồ đầu tiên về năm 1983.'],
  ]],
  ['vx84', 'B', [
    ['Đi lính Vị Xuyên', 'Người con nhập ngũ lên Hà Giang.', { d: -2, u: 6, nn: 10 }, 'Những ngày tháng 7 năm 1984 không có trong sách giáo khoa, chỉ có trong trí nhớ dòng họ.'],
    ['Không', 'Nhà đã có người đi.', {}, 'Tin từ biên giới đến bằng thư tay.'],
  ]],
  ['dm86', 'all', [
    ['Mở hiệu buôn, khoán sản', 'Làm ăn tư nhân ngay khi được phép.', { b: 20, g: 8, u: 4, nn: 8 }, 'Năm 1990 có xe máy đầu tiên trong làng.'],
    ['Ở lại biên chế nhà nước', 'Lương ổn định.', { b: 3, nn: 6 }, 'Lương đủ sống, không giàu.'],
    ['Hoài nghi', 'Sợ "cởi trói rồi lại trói".', { b: -2, u: -2 }, 'Chậm chân mười năm.'],
  ]],
  ['gm88', '', [
    ['Góp tiền cho Trường Sa', 'Đóng góp qua báo.', { b: -3, u: 3, nn: 6 }, 'Tên dòng họ trên danh sách báo Tuổi Trẻ.'],
    ['Theo dõi', 'Tin tức ít ỏi.', {}, 'Gạc Ma thành một cái tên mãi sau này mới được nhắc.'],
  ]],
  ['kh89', '', [
    ['Đón con về từ Campuchia', 'Bộ đội tình nguyện về nước.', { d: 2, u: 2, lg: 3 }, 'Về với vết thương và nghề sửa xe học trong quân ngũ.'],
    ['Không có ai đi', 'Dòng họ không có lính.', {}, 'Lễ đón ở bến xe tỉnh.'],
  ]],
  ['bt91', 'B', [
    ['Buôn hàng Trung Quốc qua biên giới', 'Cửa khẩu mở lại.', { b: 15, g: 2, nn: 3 }, 'Hàng Tàu tràn vào, dòng họ giàu lên từ đó.'],
    ['Mất việc ở Liên Xô', 'Người đi lao động xuất khẩu về nước.', { b: -5, d: 2 }, 'Về với vali hàng và tiếng Nga.'],
  ]],
  ['hn95', 'all', [
    ['Nhận tiền từ thân nhân ở Mỹ', 'Việt kiều về thăm quê lần đầu.', { b: 15, u: 2, my: 10, lg: 3 }, 'Nhà sửa, mộ tổ xây lại. Hai nhánh họ gặp nhau sau 20 năm.'],
    ['Mở công ty xuất khẩu', 'Thị trường mở.', { b: 12, g: -2, nn: 5, my: 5 }, 'Container đầu tiên đi Mỹ năm 2001.'],
  ]],
  ['bg99', '', [
    ['Nhận ruộng tái định cư', 'Ruộng sát biên giới được phân định lại.', { g: 4, nn: 4 }, 'Cột mốc mới cách ruộng ba trăm mét.'],
    ['Không ảnh hưởng', 'Quê xa biên giới.', {}, 'Tin trên thời sự.'],
  ]],
  ['vbb00', '', [
    ['Đóng tàu đánh cá xa bờ', 'Ngư trường được phân định.', { b: -8, g: 10, nn: 4 }, 'Tàu về đầy cá, nhưng ngày càng ít.'],
    ['Không', 'Nhà không đi biển.', {}, 'Cá vẫn mua ở chợ.'],
  ]],
  ['wto07', 'all', [
    ['Mở xưởng gia công xuất khẩu', 'Hàng may mặc đi Mỹ, EU.', { b: 18, g: 2, d: 2, nn: 5 }, 'Xưởng 50 công nhân, rồi 500.'],
    ['Giữ ruộng, nuôi tôm', 'Nông nghiệp vẫn là gốc.', { g: 10, b: 5 }, 'Tôm được mùa, rồi mất mùa, rồi được.'],
    ['Cho con du học', 'Đầu tư vào người.', { b: -15, u: 6, d: -1 }, 'Về với bằng thạc sĩ và một công ty khởi nghiệp.'],
  ]],
  ['hd14', '', [
    ['Xuống đường phản đối', 'Biểu tình ôn hoà ở Hà Nội, Sài Gòn.', { u: 3, nn: -4 }, 'Ảnh đăng trên mạng.'],
    ['Góp tiền cho ngư dân', 'Ủng hộ tàu cá Lý Sơn.', { b: -3, u: 2, nn: 3 }, 'Thư cảm ơn từ Quảng Ngãi.'],
  ]],
  ['pca16', '', [
    ['Theo dõi và chia sẻ', 'Phán quyết được bàn trên mạng.', { u: 1 }, 'Một cuộc tranh luận trong nhóm gia đình.'],
    ['Không quan tâm', 'Chuyện xa.', {}, 'Tin lướt qua màn hình.'],
  ]],
  ['st25', 'all', [
    ['Đón tên tỉnh mới', 'Quê nhập vào tỉnh khác.', { nn: 3, lg: 2 }, 'Địa chỉ trên căn cước đổi, mộ tổ vẫn ở chỗ cũ.'],
    ['Lưu giữ tên cũ trong gia phả', 'Ghi cả hai tên.', { u: 2, lg: 3 }, 'Gia phả dòng họ có thêm một trang.'],
  ]],
];

export const CARD = Object.fromEntries(CARDS.map(c => [c[0], c])) as Record<string, Card>;

/** Thẻ cả nước viết cho một vùng: lựa chọn thay thế theo vùng quê (B, T1, T2, NE, NW), cùng số lựa chọn với thẻ gốc
    (S.cards lưu chỉ số lựa chọn). npm run scenes kiểm số lựa chọn. */
/** `notPicks`: không dùng bộ này nếu dòng họ đã chọn một trong các hướng đó (vd. nhà miền Bắc đã di cư vào Nam năm 1954).
    `regions` bỏ trống: mọi vùng. `after`: chỉ dùng khi dòng họ đã chọn một trong các lựa chọn đó trước ('khoá=chỉ số'
    như trong S.cards; biến cố riêng là 'x:id'), vd. đã có người vượt biên năm 1978 thì năm 1980 có đường bảo lãnh. */
/** `homes`: chỉ cho các quê này (khoá trong HOMES), khi khác biệt nằm ở từng tỉnh chứ không ở cả vùng (sáp nhập tỉnh 2025). */
export const VARIANT: Record<string, { regions?: string[]; homes?: string[]; notPicks?: string[]; after?: string[]; choices: Choice[] }[]> = {
  // Hiệp ước Nhâm Tuất nhượng ba tỉnh miền Đông; ba tỉnh miền Tây còn thuộc Đại Nam tới 1867, Bắc và Trung còn xa chiến sự.
  // Hoà ước buộc Đại Nam bồi thường bốn triệu đồng trong mười năm.
  nt62: [
    { regions: ['NW'], choices: [
      ['Đón người miền Đông chạy sang', 'Nhiều nhà ở Gia Định, Định Tường bỏ đất nhượng, sang ba tỉnh miền Tây.', { g: -6, u: 4, lg: 5, tr: 3 }, 'Người miền Đông sang ở nhờ, dạy chữ cho con cháu trong họ. Ai cũng biết ba tỉnh còn lại chẳng yên được lâu.'],
      ['Gửi thóc cho nghĩa quân Trương Định', 'Lén chở thóc sang Gò Công, nơi nghĩa quân chưa chịu giải giáp.', { g: -8, u: 5, ph: -8 }, 'Ghe thóc đi đêm. Quan triều đình làm ngơ, quan Tây thì bắt đầu dò hỏi.'],
      ['Than khóc rồi nộp thuế', 'Làm lễ cáo tổ tiên, rồi sống tiếp.', { lg: 3 }, 'Ruộng vẫn cày. Chuyện hiệp ước thành câu chuyện kể bên bếp.'],
    ] },
    { regions: ['B', 'T1', 'T2'], choices: [
      ['Đóng thuế đền chiến phí', 'Triều đình tăng thuế để trả khoản bồi thường cho Pháp và Tây Ban Nha.', { b: -6, u: 2, tr: 6 }, 'Rương bạc vơi đi. Quan huyện khen nhà đóng đủ, đóng sớm.'],
      ['Đón bà con Nam Kỳ chạy ra', 'Cho một nhà từ Gia Định chạy loạn ra ở nhờ.', { g: -5, d: 1, u: 4, lg: 4 }, 'Người khách kể về những đồn luỹ đã mất. Cả nhà ngồi nghe đến khuya.'],
      ['Than khóc rồi sống tiếp', 'Làm lễ cáo tổ tiên, rồi sống tiếp.', { lg: 3 }, 'Ruộng vẫn cày. Chuyện mất đất phương Nam thành câu chuyện kể bên bếp.'],
    ] },
  ],
  // Genève 1954 với một nhà ở phía nam vĩ tuyến 17 (Huế, Quảng Nam, Nam Bộ): không ai "di cư vào Nam" hay "ở lại miền
  // Bắc"; Hiệp định hẹn tổng tuyển cử tháng 7.1956 (không bao giờ diễn ra), bộ đội Việt Minh ở Nam tập kết ra Bắc.
  // Cùng thứ tự với thẻ gốc: theo chính quyền phía Nam / ở lại chờ / theo Việt Minh.
  gnv: [
    { regions: ['T2', 'NE', 'NW'], choices: [
      ['Đứng về chính quyền ở Sài Gòn', 'Không chờ tổng tuyển cử; nhận việc ở xã dưới chính quyền Quốc gia Việt Nam.', { b: -3, u: 2, qg: 15, vm: -15, my: 3 }, 'Lá cờ trên trụ sở xã đổi màu. Người tập kết đi rồi, xã có thêm những nhà vắng chồng, vắng con.'],
      ['Ở lại, chờ tổng tuyển cử 1956', 'Hiệp định hẹn hai năm sau thống nhất bằng một cuộc tổng tuyển cử.', { lg: 3 }, 'Tháng 7.1956 đến rồi qua; cuộc tổng tuyển cử không bao giờ diễn ra.'],
      ['Có người tập kết ra Bắc', 'Một người con theo bộ đội Việt Minh xuống tàu ra Bắc.', { d: -1, u: 3, vm: 15, qg: -12 }, 'Hẹn hai năm, thành hai mươi mốt năm. Người đi để lại ở quê một tấm ảnh và một lời hứa.'],
    ] },
  ],
  // Cuộc di cư 1954 nhìn từ miền Bắc: nhà đã vào Nam (điểm rẽ 5 không phải "Miền Bắc", như mọi nội dung 1954–1975) lập
  // ấp mới ở miền Nam; nhà ở lại thì tiễn một nhánh họ đi, hay giữ nhà. Thẻ gốc (đón người di cư) dành cho nhà ở miền Nam.
  dc54: [
    { regions: ['B', 'T1'], notPicks: ['bac'], choices: [
      ['Dựng nhà ở khu định cư', 'Cùng người cùng xứ đạo lập ấp mới ở miền Nam.', { g: -6, d: 1, u: 3, lg: 3, qg: 5 }, 'Ấp mới đặt theo tên làng cũ ngoài Bắc; giọng nói, nhà thờ, cả cách gói bánh đều mang theo.'],
      ['Ở nhờ họ hàng đã vào trước', 'Chen chúc trong căn nhà của người quen ở Sài Gòn.', { g: -3, lg: 2 }, 'Hai năm ở nhờ rồi mới có chỗ riêng; hai nhà thành thân như ruột thịt.'],
    ] },
    { regions: ['B', 'T1'], choices: [
      ['Tiễn một nhánh họ di cư', 'Một nhánh họ xuống Hải Phòng lên tàu vào Nam.', { d: -1, u: 2, qg: 5, vm: -5 }, 'Hai nhánh họ cách nhau con sông Bến Hải; tin tức bặt dần, hai mươi mốt năm sau mới gặp lại.'],
      ['Ở lại, giữ nhà', 'Cả nhà không đi; đất tổ, mồ mả còn đây.', { lg: 3, vm: 3 }, 'Nhà vẫn ở chỗ cũ. Mấy nhà hàng xóm bỏ trống, rồi có người mới đến ở.'],
    ] },
  ],
  // Sắp xếp tỉnh 2025 (từ 1.7.2025, Nghị quyết 202/2025/QH15): Hà Nội, Huế, Nghệ An nằm trong 11 tỉnh thành giữ nguyên;
  // TP Hồ Chí Minh (nhận Bình Dương, Bà Rịa – Vũng Tàu) và Cần Thơ (nhận Sóc Trăng, Hậu Giang) giữ tên. Cấp huyện bỏ, xã
  // nhập lại ở mọi nơi. Nam Định (vào Ninh Bình), Quảng Nam (vào Đà Nẵng), Tiền Giang (vào Đồng Tháp): thẻ gốc.
  st25: [
    { homes: ['hn', 'hue', 'na'], choices: [
      ['Giữ nếp như cũ', 'Tỉnh không sáp nhập; chỉ cấp huyện bỏ đi, xã nhập lại.', { nn: 3, lg: 2 }, 'Tên tỉnh trên căn cước giữ nguyên; tên xã thì đổi, phải học thuộc lại.'],
      ['Ghi tên xã cũ vào gia phả', 'Xã quê nhập vào xã khác; tên làng cũ chép lại cho con cháu.', { u: 2, lg: 3 }, 'Gia phả dòng họ có thêm một trang.'],
    ] },
    { homes: ['sg', 'ct'], choices: [
      ['Đón thêm tỉnh bạn', 'Tỉnh khác nhập vào; tên quê vẫn giữ.', { nn: 3, lg: 2 }, 'Tên quê trên căn cước giữ nguyên; tỉnh rộng ra gấp mấy lần, tên phường thì đổi.'],
      ['Ghi tên phường cũ vào gia phả', 'Phường cũ nhập vào phường khác; tên cũ chép lại.', { u: 2, lg: 3 }, 'Gia phả dòng họ có thêm một trang.'],
    ] },
  ],
  // Đã có người trong họ đi trước (lý lịch 1978: "Tìm đường ra đi"; họ Lý 1979: "bán chính thức"): người tới nơi gửi
  // thư, gửi tiền, và từ năm 1979 bảo lãnh được theo Chương trình Ra đi có trật tự (ODP, thoả thuận UNHCR – Việt Nam
  // tháng 5.1979). Cùng thứ tự với thẻ gốc: đi cả nhà / ở lại / một đường hẹp hơn.
  tn80: [
    { after: ['x:x-lylich78=2', 'x:x-ly79=1'], choices: [
      ['Cả nhà theo đường người đi trước', 'Người đi trước gửi về tên chủ ghe, nơi đón; bán nhà mua chỗ.', { b: -10, g: -8, d: -3, u: -3, nn: -20, my: 15 }, 'Lần này cả nhà đi, theo đường dây người đi trước đã dò. Ghe tới Pulau Bidong sau sáu ngày; ở trại đã có thư của người đi trước, ghi sẵn địa chỉ bảo lãnh.'],
      ['Ở lại, chờ thư', 'Sống bằng sổ gạo và những lá thư từ trại tị nạn.', { g: -6, nn: 5 }, 'Thư về đều đặn. Ở nhà vẫn xếp hàng mua gạo, nhưng biết người đi đã tới nơi.'],
      ['Làm đơn xin đi diện đoàn tụ', 'Người đã tới nơi bảo lãnh; nộp đơn theo Chương trình Ra đi có trật tự (ODP).', { d: -1, u: -2, nn: -5, my: 8 }, 'Hồ sơ đi qua nhiều văn phòng và nhiều năm chờ; rồi một chuyến bay rời Tân Sơn Nhất, không phải một chiếc ghe.'],
    ] },
  ],
  // 30.4.1975 với một nhà còn ở miền Bắc: không di tản, không đón quân vào thành phố mình. Nhà đã di cư vào Nam năm 1954
  // (hướng 'nam') đang ở Sài Gòn: dùng bộ gốc (di tản, trình diện, đón quân).
  sg75: [
    { regions: ['B', 'T1'], notPicks: ['nam'], choices: [
      ['Vào Nam tìm người thân', 'Lên xe vào Nam tìm nhánh họ di cư từ năm 1954.', { b: -6, u: 3, lg: 4, nn: 3 }, 'Hai nhánh họ gặp lại sau hai mươi mốt năm. Có người mừng, có người ngượng ngùng.'],
      ['Chờ con về từ chiến trường', 'Cả nhà ngóng tin người đi bộ đội.', { d: -1, u: 3, vm: 5, nn: 5 }, 'Có người về, có nhà chỉ nhận giấy báo tử.'],
      ['Làm cỗ mừng thống nhất', 'Treo cờ, mời cả xóm.', { g: -4, lg: 5, vm: 6, nn: 6 }, 'Cả xóm ăn mừng. Ai cũng tin những ngày khó nhất đã qua.'],
    ] },
  ],
};
