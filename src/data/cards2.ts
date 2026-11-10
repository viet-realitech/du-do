import type { Fx } from './cards';
import type { Flag } from './endings';

/* Chế độ Chơi: biến cố riêng của dòng họ, gắn vào một sự kiện có sẵn và chỉ hiện khi điều kiện đúng (họ, phe đang theo,
   hướng đã chọn, quê quán, mức bạc). Khác thẻ thường, biến cố riêng có thể đổi họ của dòng họ ('mother' = lấy họ mẹ do
   người chơi chọn, hoặc một cách viết mới như 'Huỳnh'). Số liệu là ước lệ của trò chơi. */

export interface SpecialWhen {
  /** Khoá họ (surnames.ts). */
  surnames?: string[];
  /** Phe đang theo (CAMP ở play.ts): tr · pt · vm · qg · ph · nn · my · lg. */
  camps?: string[];
  /** Hướng đã chọn ở điểm rẽ của chương đó. */
  picks?: string[];
  /** Bạc tối thiểu. */
  minB?: number;
  /** Quê quán (HOMES). */
  homes?: string[];
}
/** [nhãn, mô tả, hiệu ứng, kết cục, đổi họ?, cờ?] — cờ như ở thẻ thường (endings.ts); không đổi họ thì phần tử thứ 5 là undefined. */
export type SpecialChoice = [string, string, Fx, string, string?, Flag?];
export interface SpecialCard {
  id: string;
  /** id sự kiện gắn vào. */
  ev: string;
  when: SpecialWhen;
  title: string;
  /** Một câu đặt vấn đề, nói với dòng họ. */
  s: string;
  choices: SpecialChoice[];
  /** Ghi chú sử liệu cho phiếu rà soát. */
  note: string;
}

export const SPECIAL: SpecialCard[] = [
  {
    id: "x-south54-h", ev: "dc54", when: {"surnames": ["hoang"], "picks": ["nam"], "homes": ["hn", "nd", "na"]},
    title: "Hoàng hay Huỳnh?",
    s: "Vào Nam, thầy ký ở trại định cư hỏi: khai sinh cho các cháu ghi họ Hoàng như gia phả, hay ghi Huỳnh như người trong này?",
    choices: [
      ["Ghi là Huỳnh, theo cách người Nam", "Hoà vào xóm mới nhanh hơn; gia phả chú thích thêm một dòng.", {"u": -4, "b": -3, "lg": 8, "qg": 5}, "Khai sinh mấy đứa nhỏ ghi họ Huỳnh. Gia phả ở từ đường ngoài Bắc vẫn chép Hoàng; sau 1975, hai nhánh họ nhận nhau qua tên đệm và tên làng.", "Huỳnh"],
      ["Giữ họ Hoàng như gia phả", "Đúng gia phả, nhưng giấy tờ trong này hay bị ghi lệch.", {"u": 3, "b": -3, "lg": -5}, "Vài lần căn cước bị ghi Huỳnh, phải lên quận sửa. Trong khu định cư toàn người Bắc cái họ ấy không lạ; ra khỏi khu thì phải giải thích."],
    ],
    note: "Huỳnh là cách viết tránh huý tên chúa Nguyễn Hoàng ở Đàng Trong từ thế kỷ XVII; sau 1954, gần một triệu người Bắc di cư mang theo cách viết họ miền Bắc, và việc khai sinh con cháu theo cách nào tuỳ từng nhà và từng thầy ký ở trại định cư.",
  },
  {
    id: "x-south54-v", ev: "dc54", when: {"surnames": ["vu"], "picks": ["nam"], "homes": ["hn", "nd", "na"]},
    title: "Vũ hay Võ?",
    s: "Vào Nam, thầy ký ở trại định cư hỏi: khai sinh cho các cháu ghi họ Vũ như gia phả, hay ghi Võ như người trong này?",
    choices: [
      ["Ghi là Võ, theo cách người Nam", "Hoà vào xóm mới nhanh hơn; gia phả chú thích thêm một dòng.", {"u": -4, "b": -3, "lg": 8, "qg": 5}, "Khai sinh mấy đứa nhỏ ghi họ Võ. Gia phả ở từ đường ngoài Bắc vẫn chép Vũ; sau 1975, hai nhánh họ nhận nhau qua tên đệm và tên làng.", "Võ"],
      ["Giữ họ Vũ như gia phả", "Đúng gia phả, nhưng giấy tờ trong này hay bị ghi lệch.", {"u": 3, "b": -3, "lg": -5}, "Vài lần căn cước bị ghi Võ, phải lên quận sửa. Trong khu định cư toàn người Bắc cái họ ấy không lạ; ra khỏi khu thì phải giải thích."],
    ],
    note: "Võ là cách viết của Vũ từ nam sông Gianh trở vào, thường được giải thích là do kiêng huý tước hiệu Vũ Vương của chúa Nguyễn Phúc Khoát (thế kỷ XVIII), dù giới nghiên cứu còn tranh luận; sau 1954, người Bắc di cư thường giữ cách viết Vũ trong các khu định cư riêng, nhưng khai sinh con cháu có thể bị ghi theo cách địa phương.",
  },
  {
    id: "x-ngo63", ev: "dc63", when: {"surnames": ["ngo"], "picks": ["nam", "thuba"]},
    title: "Họ Ngô sau ngày 1 tháng 11",
    s: "Sau đảo chính, cảnh sát lập danh sách người dính dáng đến gia đình Ngô Đình; dòng họ bạn mang họ Ngô, lại đệm chữ Đình và có người từng làm ở toà tỉnh, nên bị gọi lên hỏi.",
    choices: [
      ["Giữ họ, lên trình diện trả lời", "Không có gì phải giấu; chịu xét hỏi vài lần.", {"u": 4, "b": -6, "qg": -8}, "Hai người bị gọi lên Tổng nha Cảnh sát, hỏi về Cần Lao và Phủ Cam. Không tìm ra gì, nhưng hồ sơ đã mở thì theo mãi đến hết thời Đệ nhị Cộng hoà."],
      ["Chuyển các cháu sang họ mẹ", "Khai sinh lại cho con cháu, cho yên chuyện.", {"u": -8, "b": -4, "lg": -5, "qg": 5}, "Xin án thế vì khai sinh ở toà tỉnh, các cháu mang họ mẹ. Vài năm sau không ai còn hỏi đến họ Ngô, nhưng giấy tờ đã mang tên khác và không đổi lại nữa.", "mother", "lylich"],
      ["Đưa gia phả ra chứng minh", "Tổ tiên không dính gì tới Đại Phong, Lệ Thuỷ; nhờ người quen xác nhận.", {"u": 3, "b": -5, "lg": 5}, "Gia phả chép tổ tiên lập nghiệp ở quê từ đời Gia Long. Người ta tin một nửa; con cháu đi học vẫn bị gọi là 'cháu ông Diệm' đến hết năm học."],
    ],
    note: "Sau cuộc đảo chính 1.11.1963, đảng Cần Lao bị giải tán, nhiều người thân cận với gia đình Ngô Đình bị bắt hoặc mất chức; Ngô Đình Cẩn bị xử bắn tháng 5.1964. Họ Ngô Đình gốc làng Đại Phong (Lệ Thuỷ, Quảng Bình), không liên quan đến phần lớn các dòng họ Ngô khác.",
  },
  {
    id: "x-royal45", ev: "ng45", when: {"surnames": ["tonthat"]},
    title: "Tôn Thất giữa mùa thu 1945",
    s: "Vua thoái vị, uỷ ban mới lập sổ hộ tịch; họ Tôn Thất của bạn gắn với hoàng tộc, nay thành điều phải cân nhắc mỗi khi khai tên.",
    choices: [
      ["Khai họ Nguyễn, bỏ chữ Tôn Thất", "Thành một nhà họ Nguyễn như mọi nhà.", {"u": -6, "b": -3, "vm": 8, "lg": 5}, "Giấy tờ mới ghi Nguyễn. Bài vị trong từ đường vẫn chép Tôn Thất; con cháu lớn lên học hai cái tên, một để khai, một để cúng.", "Nguyễn"],
      ["Giữ họ Tôn Thất", "Tổ tiên sao thì mình vậy, bất kể thời thế.", {"u": 5, "vm": -10, "lg": -5}, "Uỷ ban xã gọi lên hỏi về lộc điền và quan hệ với Đại Nội. Lộc điền bị thu; cái họ còn nguyên, và mỗi lần kê khai lại phải giải thích."],
      ["Có người trong họ theo Việt Minh", "Một người cháu vào Vệ quốc đoàn, giữ nguyên họ.", {"u": 3, "d": -3, "b": -2, "vm": 12}, "Người cháu làm thầy thuốc ở chiến khu, ký tên Tôn Thất trên bệnh án. Cái họ hoàng tộc thành bằng chứng ngược: nhà có người đi kháng chiến."],
    ],
    note: "Sau khi Bảo Đại thoái vị (30.8.1945), con cháu hoàng tộc mang họ Tôn Thất hoặc tên lót theo Đế hệ thi (Bửu, Vĩnh…) ở nhiều nơi bị nhìn như 'con cháu phong kiến'; có nhà khai con cháu là Nguyễn Phúc hay Nguyễn, nhiều người khác giữ tên dòng và theo chính quyền mới, như bác sĩ Tôn Thất Tùng.",
  },
  {
    id: "x-phan08", ev: "ct08", when: {"surnames": ["phan"], "homes": ["hue", "qn"]},
    title: "Cùng họ với cụ Phan",
    s: "Phan Châu Trinh bị bắt ở Hà Nội sau những ngày dân Quảng Nam kéo xuống toà sứ đòi giảm thuế; lính dõng và người của quan tỉnh đi hỏi từng làng, và các nhà họ Phan được hỏi kỹ hơn cả.",
    choices: [
      ["Cất giữ sách Tân thư", "Giấu sách của các cụ Duy Tân trong vách nhà thờ họ.", {"u": 5, "b": -2, "ph": -8, "lg": 4}, "Sách nằm trong vách gần hai mươi năm. Con cháu học chữ quốc ngữ từ những trang ấy; khi tin cụ Phan về nước năm 1925 lan đến làng, sách được lấy ra đọc to ở từ đường."],
      ["Khai rõ: cùng họ, khác nhà", "Đưa gia phả cho lý trưởng xem, xin ghi 'không liên can'.", {"u": -2, "ph": 3}, "Lý trưởng ghi 'không liên can'. Làng cười nhà mình sợ bóng sợ gió, nhưng không ai bị gọi lên tỉnh."],
      ["Góp tiền nuôi gia đình người bị bắt", "Gửi gạo, gửi tiền qua tay bà con, không ghi sổ.", {"b": -6, "u": 6, "ph": -6, "lg": 6}, "Tiền đi qua ba tay, không ai ghi tên. Năm 1910 có tin cụ Phan được tha khỏi Côn Đảo; mấy nhà từng nhận gạo đến tận cổng cảm ơn."],
    ],
    note: "Tháng 3.1908, phong trào chống thuế lan từ Quảng Nam ra khắp Trung Kỳ; Phan Châu Trinh bị bắt ở Hà Nội, bị kết án tử hình rồi giảm xuống đày Côn Đảo, Trần Quý Cáp bị xử chém ở Khánh Hoà. Năm 1910 ông được tha nhờ Hội Nhân quyền Pháp can thiệp, sang Pháp năm 1911 và về nước năm 1925. Biến cố là hư cấu: chỉ nói cùng họ, không nhận họ hàng.",
  },
  {
    id: "x-nguyen25", ev: "tn25", when: {"surnames": ["nguyen"]},
    title: "Cái tên Nguyễn Ái Quốc",
    s: "Từ năm 1919, tên Nguyễn Ái Quốc đứng dưới bản Yêu sách của nhân dân An Nam gửi Hội nghị Versailles; năm 1925 người mang tên ấy lập Hội Việt Nam Cách mạng Thanh niên ở Quảng Châu. Mật thám lùng tìm, còn ở làng, các nhà họ Nguyễn nghe cái tên ấy với đủ thứ cảm xúc.",
    choices: [
      ["Truyền tay bản Yêu sách", "Chép lại tám điều, đưa sang làng bên.", {"u": 5, "ph": -8, "vm": 5, "lg": 3}, "Bản chép tay đi qua ba làng. Khi lính đồn về khám, nhà bạn đã đốt bản của mình; bản ở làng bên còn đến năm 1945."],
      ["Đốt mọi giấy tờ có cái tên ấy", "Cho yên nhà; họ Nguyễn đông như lá rừng, chuyện ai người nấy lo.", {"u": -2, "ph": 2}, "Nhà yên ổn. Người già tiếc mãi những trang đã đốt, và kể lại nội dung cho con cháu bằng trí nhớ."],
      ["Kể cho con cháu nghe về người cùng họ", "Không biết ông là ai, chỉ biết ông ký tên họ Nguyễn và đòi quyền cho người An Nam.", {"u": 3, "lg": 2, "vm": 3}, "Trẻ con trong họ thuộc lòng một cái tên mà người lớn chỉ dám nói thầm. Hai mươi năm sau, chúng nhận ra tên ấy trên những tờ truyền đơn."],
    ],
    note: "Bản Yêu sách tám điểm ký tên Nguyễn Ái Quốc được gửi tới Hội nghị Versailles tháng 6.1919, do nhóm người Việt yêu nước ở Paris soạn; tên này về sau gắn với Nguyễn Tất Thành (khai sinh Nguyễn Sinh Cung), người lập Hội Việt Nam Cách mạng Thanh niên ở Quảng Châu tháng 6.1925. Biến cố là hư cấu: chỉ nói cùng họ, không nhận họ hàng.",
  },
  {
    id: "x-canvuong96", ev: "hk96", when: {"picks": ["canvuong"], "homes": ["hn", "nd", "na", "hue", "qn"]},
    title: "Sau khi Hương Khê tan rã",
    s: "Nghĩa quân tan, công sứ và quan tỉnh lập sổ 'nhà phiến loạn'; tên dòng họ bạn ở trang đầu, và lính đồn đã về làng hỏi.",
    choices: [
      ["Dời cả họ sang phủ khác", "Bỏ ruộng vườn, lập nghiệp nơi không ai biết mặt.", {"u": 3, "g": -10, "b": -6, "d": -3}, "Dòng họ làm lại từ mấy sào ruộng thuê ở làng mới, tập nói giọng khác. Ba đời sau mới có người về quê cũ tìm mộ."],
      ["Lấy họ mẹ, ở lại làng", "Lý trưởng sửa sổ đinh; cả họ đổi cách xưng tên.", {"u": -8, "b": -3, "ph": 5, "lg": -5}, "Sổ đinh ghi một họ mới. Khi lính đồn hỏi 'nhà phiến loạn', lý trưởng chỉ sang hướng khác; trong làng ai cũng biết, nhưng không ai nói.", "mother"],
      ["Ra thú với công sứ", "Nộp gươm, ăn thề ở đình, được tha.", {"u": -12, "g": 3, "ph": 12, "lg": -10}, "Được tha, giữ được ruộng. Lễ ăn thề làm trước mặt công sứ và quan huyện; làng gọi dòng họ là 'nhà ra thú' hết một đời người."],
    ],
    note: "Sau khi Phan Đình Phùng mất (12.1895) và Hương Khê tan rã đầu 1896, chính quyền bảo hộ cùng triều đình Thành Thái vừa truy bắt vừa chiêu dụ 'ra thú'; nhiều gia đình nghĩa quân đổi họ, dời làng hoặc đầu thú để giữ ruộng và người, như trước đó Pháp từng bắt thân nhân và đào mộ tổ họ Phan ở Đông Thái để gây sức ép.",
  },
  {
    id: "x-diachu53", ev: "cc53", when: {"homes": ["hn", "nd", "na"], "picks": ["bac"], "minB": 45},
    title: "Đội cải cách sắp về làng",
    s: "Dòng họ bạn có nhiều ruộng và bạc hơn cả làng; đội cải cách sắp về, và ai cũng đoán được nhà nào sẽ bị quy địa chủ.",
    choices: [
      ["Chia nhỏ ruộng, bán tháo trước", "Sang tên cho con cháu, họ hàng; bán trâu, bán thóc.", {"u": -3, "g": -8, "b": -10, "vm": -8}, "Đội vẫn quy địa chủ, ghi thêm 'phân tán tài sản'. Mức xử: tịch thu và quản chế tại làng; không ai trong họ bị đưa ra toà án nhân dân đặc biệt."],
      ["Ở lại, chịu đấu tố", "Có người con đi bộ đội; mong được xếp 'địa chủ kháng chiến'.", {"u": -10, "g": -15, "b": -15, "d": -3, "vm": 5, "lg": -8}, "Được xếp 'địa chủ kháng chiến' nhờ người con ở Điện Biên, nhưng nhà, ruộng, trâu vẫn bị tịch thu và một người già mất khi bị quản chế. Sửa sai 1956 trả danh dự, không trả ruộng."],
      ["Vào Nam trước khi đội về", "Xuống Hải Phòng cho kịp hạn 300 ngày.", {"g": -15, "b": -12, "d": -3, "vm": -20, "qg": 8, "lg": -5}, "Đi trong đêm, xuống tàu ở Hải Phòng tháng 4.1955. Ruộng để lại được chia cho làng; từ đường đóng cửa đến thập niên 1990 mới có người về mở.", undefined, "dicu"],
    ],
    note: "Cải cách ruộng đất 1953–1956 ở miền Bắc chia ruộng cho nông dân qua các đợt phát động quần chúng và toà án nhân dân đặc biệt; số người bị quy sai và bị xử tử được Đảng Lao động thừa nhận trong đợt sửa sai cuối 1956, với con số đến nay còn khác nhau tuỳ nguồn. Hạn 300 ngày tự do di chuyển giữa hai miền theo Hiệp định Genève kết thúc tháng 5.1955.",
  },
  {
    id: "x-lylich78", ev: "ct78", when: {"picks": ["nam"]},
    title: "Tờ khai lý lịch",
    s: "Phường yêu cầu khai lại lý lịch ba đời; dòng họ bạn có người từng làm việc cho chế độ cũ, và con cháu sắp đến tuổi thi đại học.",
    choices: [
      ["Khai đầy đủ, đúng sự thật", "Không giấu gì; chấp nhận bị xếp diện.", {"u": 5, "b": -6, "nn": -10}, "Hồ sơ ghi 'gia đình có người đi cải tạo'. Đứa cháu thi đủ điểm vẫn không được gọi nhập học; đến đầu thập niên 1990 mới có đứa thứ hai vào đại học.", undefined, "lylich"],
      ["Chuyển các cháu sang họ mẹ", "Nhập khẩu về bên ngoại, khai cha 'mất tích'.", {"u": -8, "b": -4, "nn": 5, "lg": -5}, "Mấy đứa trẻ mang họ mẹ, hộ khẩu ở nhà ngoại, và một đứa đỗ đại học. Về quê giỗ họ, nó không biết xưng tên nào trước bàn thờ.", "mother"],
      ["Tìm đường ra đi", "Bán nốt vàng, bán cả ruộng, mua chỗ trên ghe.", {"g": -8, "b": -8, "d": -3, "nn": -20, "my": 10}, "Ghe rời Rạch Giá một đêm tháng 5; ba người tới trại Songkhla, hai người không. Thư đầu tiên về năm 1980, kèm một tờ 20 đô la gấp tư.", undefined, "lylichDi"],
    ],
    note: "Sau 1975, lý lịch ba đời và hộ khẩu quyết định việc học, việc làm; con em các gia đình bị xếp diện 'nguỵ quân, nguỵ quyền' thường bị hạn chế xét tuyển đại học cho đến cuối thập niên 1980. Làn sóng vượt biên lên cao nhất 1978–1979, trùng với đợt cải tạo công thương nghiệp ở miền Nam.",
  },
  {
    id: "x-tapket54", ev: "dc54", when: {"camps": ["vm"], "homes": ["sg", "mt", "ct"]},
    title: "Chuyến tàu tập kết",
    s: "Người của dòng họ thuộc diện tập kết ra Bắc theo Hiệp định Genève; hẹn hai năm tổng tuyển cử, nhưng ruộng, mồ mả và cả nhà đều ở đây.",
    choices: [
      ["Cả nhà cùng xuống tàu ra Bắc", "Về khu tập kết gần nhất, lên tàu ra Sầm Sơn.", {"g": -12, "b": -8, "d": -3, "vm": 12, "qg": -15}, "Tàu Ba Lan chở cả nhà ra Sầm Sơn. Hẹn hai năm thành hai mươi mốt năm; ngày về, ruộng cũ đã qua hai đời chủ, mộ ông bà phải hỏi người làng mới tìm ra.", undefined, "tapketN"],
      ["Người đi, vợ con ở lại giữ đất", "Chỉ người trong diện ra Bắc; gia đình bám quê.", {"d": -3, "b": -4, "vm": 8, "qg": -10, "lg": 5}, "Chồng và con trai ra Bắc. Người ở lại thành 'gia đình tập kết': chiến dịch Tố Cộng đến gõ cửa trước, thư miền Bắc đến sau, rồi đứt hẳn mười năm.", undefined, "nguoiDi54"],
      ["Ở lại cả nhà, giấu quá khứ", "Chôn súng, khai lại giấy tờ, làm dân thường.", {"u": -6, "vm": -12, "qg": 5, "lg": -5}, "Súng chôn dưới gốc dừa, giấy tờ khai mới. Năm 1960 phong trào nổi dậy lan tới xã, những người quen cũ lại tìm đến nhà lúc nửa đêm."],
    ],
    note: "Theo Hiệp định Genève, trên dưới 140.000 cán bộ, bộ đội và một số gia đình ở miền Nam tập kết ra Bắc (các nguồn chênh nhau từ khoảng 100.000 đến hơn 180.000) qua các khu Xuyên Mộc (80 ngày), Cao Lãnh (100 ngày), Chắc Băng – Cà Mau (200 ngày) và Quy Nhơn (300 ngày), phần lớn trên tàu Liên Xô và Ba Lan cập bến Sầm Sơn; nhiều người để vợ con ở lại với lời hẹn hai năm. Các gia đình có người tập kết là đối tượng của chiến dịch Tố Cộng của chính quyền Ngô Đình Diệm từ 1955.",
  },
  {
    id: "x-kieuhoi89", ev: "kh89", when: {"picks": ["radi"]},
    title: "Thùng đồ và chuyến bay về",
    s: "Đã mười năm ở xứ người; thư từ quê kể ruộng khoán được mùa nhưng mộ tổ sụt, và người ta bắt đầu nghe chuyện Việt kiều được về thăm.",
    choices: [
      ["Gửi tiền, gửi thùng đồ đều đặn", "Qua đường bưu điện và người quen mang tay.", {"u": 5, "b": -6, "lg": 6, "nn": 5}, "Vải, thuốc tây, radio về trước; đô la gấp trong thư về sau. Nhà ở quê lợp lại mái, mua được xe đạp Nhật; hàng xóm gọi là 'nhà có Việt kiều'.", undefined, "kieuhoi"],
      ["Về thăm quê lần đầu", "Bay qua Bangkok, xuống Tân Sơn Nhất.", {"u": 6, "b": -10, "lg": 8, "nn": 5}, "Hải quan lục từng thùng quà. Mộ tổ xây lại bằng đô la, cả họ chụp tấm ảnh chung đầu tiên sau 1975; bên kia, vài người quen trong cộng đồng không bắt tay nữa.", undefined, "kieuhoi"],
      ["Chưa gửi, chưa về", "Để dành mua nhà, chờ thời thế đổi.", {"u": -8, "b": 5, "lg": -10}, "Tiền để dành mua được căn nhà ở San Jose. Ở quê, giỗ họ vắng một nhánh; hai mươi năm sau, con cháu bên này không đủ tiếng Việt để hỏi đường về làng."],
    ],
    note: "Từ cuối thập niên 1980, Nhà nước nới lỏng việc nhận kiều hối và cho Việt kiều về thăm thân nhân; năm 1989 Việt Nam rút quân khỏi Campuchia và bắt đầu thoát thế cô lập. Trong cộng đồng hải ngoại, việc gửi tiền hay về nước khi đó vẫn gây tranh cãi gay gắt.",
  },
  {
    id: "x-ly79", ev: "bb79", when: {"surnames": ["ly"]},
    title: "Họ Lý, năm 1979",
    s: "Sau tiếng súng biên giới, phường rà soát người gốc Hoa; họ Lý của bạn bị gọi lên hỏi gốc gác, dù gia phả chép tổ tiên là người Việt đã nhiều đời.",
    choices: [
      ["Đưa gia phả, xin ghi dân tộc Kinh", "Nhờ người biết chữ Hán dịch gia phả; chờ xác minh.", {"u": 3, "b": -5, "nn": 5, "lg": -5}, "Hộ khẩu ghi 'Kinh'. Người Hoa cùng phố đi gần hết, cửa hàng bên cạnh đóng cửa; dòng họ ở lại trong một dãy phố bỗng vắng."],
      ["Đi 'bán chính thức' như người Hoa", "Nộp vàng theo chuyến, bán nhà, xuống ghe ra Hồng Kông.", {"g": -8, "b": -5, "d": -3, "nn": -15, "my": 5}, "Mỗi đầu người gần mười lượng vàng. Ghe tới Hồng Kông sau chín ngày; năm 1981 có thư từ Toronto, năm 1990 có thùng quà đầu tiên gửi về.", undefined, "ly79Di"],
      ["Ở lại, chịu bị để ý", "Không đi, không chứng minh; sống qua ngày.", {"u": -4, "g": -5, "nn": -8}, "Hai người bị cho thôi việc ở cơ quan 'vì lý do an ninh'. Sau 1986 mới có người được nhận lại; cửa hàng mở lại nhờ Đổi Mới."],
    ],
    note: "Năm 1978–1979, quan hệ Việt – Trung xấu đi kéo theo 'nạn kiều': khoảng 250.000 người Hoa ở miền Bắc sang Trung Quốc bằng đường bộ, hàng trăm nghìn người ở miền Nam ra đi bằng ghe, phần lớn theo đường 'bán chính thức' có nộp vàng, và người gốc Hoa bị đưa ra khỏi các vị trí nhạy cảm. Họ Lý (李) ở Việt Nam có người Kinh, người Tày, Nùng, Dao ở miền núi phía Bắc và người Hoa cùng mang, nên khi rà soát gốc gác dễ bị đánh đồng.",
  },
];
