import type { Fx } from './cards';
import type { Flag } from './endings';

/* Chế độ Chơi: biến cố riêng của dòng họ, gắn vào một sự kiện có sẵn và chỉ hiện khi điều kiện đúng (họ, phe đang theo,
   hướng đã chọn, quê quán, mức bạc, một lựa chọn đã quyết từ trước). Khác thẻ thường, biến cố riêng có thể đổi họ của dòng
   họ ('mother' = lấy họ mẹ do người chơi chọn, 'origin' = nhận lại họ trước lần đổi họ đầu tiên, hoặc một cách viết mới
   như 'Huỳnh'). Một sự kiện có thể mang hai biến cố, quyết lần lượt sau thẻ của sự kiện (play.ts specialsFor): một biến
   cố riêng (họ, phe, quê…: biến cố đầu tiên khớp được dùng) và các biến cố hệ quả (`also`). Số liệu là ước lệ của trò chơi. */

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
  /** Người con đã sang mặt trận Campuchia năm 1979 (play.ts atFront) và cả nhà còn ở trong nước. */
  front?: true;
  /** Hệ quả: dòng họ đã chốt, ở một sự kiện trước, một lựa chọn mang một trong các dấu này (dấu là phần tử thứ sáu của
      lựa chọn, cards.ts Choice): dấu đi theo lựa chọn chứ không theo chỉ số, nên dời lựa chọn không làm hệ quả gắn nhầm. */
  after?: string[];
  /** Nơi dòng họ sống năm ấy: true = cả nhà ở xứ người (đã ra nước ngoài trên thẻ, hay chọn Ra đi ở điểm rẽ 6 và đã đi),
      false = còn ở trong nước. Bỏ trống: biến cố trong nước, trừ biến cố của hướng Ra đi (play.ts matches). */
  abroad?: boolean;
  /** Dòng họ đã (true) hay chưa (false) đổi họ lần nào. */
  renamed?: boolean;
}
/** [nhãn, mô tả, hiệu ứng, kết cục, đổi họ?, cờ?] — cờ như ở thẻ thường (endings.ts); không đổi họ thì phần tử thứ 5 là undefined. */
export type SpecialChoice = [string, string, Fx, string, string?, Flag?];
export interface SpecialCard {
  id: string;
  /** id sự kiện gắn vào. */
  ev: string;
  when: SpecialWhen;
  /** Biến cố hệ quả: hiện thêm sau biến cố riêng của sự kiện (nếu có), không thay nó. Mỗi sự kiện tối đa hai biến cố. */
  also?: true;
  /** Việc nhỏ trong đời dòng họ (hệ quả, gia phả chung cho mọi họ): gia phả và phim hành trình ở kết cục xếp nó như một
      lựa chọn thường (theo mức đổi gia sản), không đặt lên trên như biến cố riêng; lựa chọn đổi họ vẫn đứng trên. */
  minor?: true;
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
    s: "Dòng họ bạn vốn có nhiều ruộng và bạc hơn cả làng; đội cải cách sắp về, và ai cũng đoán được nhà nào sẽ bị quy địa chủ.",
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
      ["Khai đầy đủ, đúng sự thật", "Không giấu gì; chấp nhận bị xếp diện.", {"u": 5, "b": -6, "nn": -10}, "Hồ sơ ghi 'gia đình có người đi cải tạo'. Đứa cháu thi đủ điểm vẫn không được gọi nhập học; phải nhiều năm sau mới có đứa thứ hai vào đại học.", undefined, "lylich"],
      ["Chuyển các cháu sang họ mẹ", "Nhập khẩu về bên ngoại, khai cha 'mất tích'.", {"u": -8, "b": -4, "nn": 5, "lg": -5}, "Mấy đứa trẻ mang họ mẹ, hộ khẩu ở nhà ngoại, và một đứa đỗ đại học. Về quê giỗ họ, nó không biết xưng tên nào trước bàn thờ.", "mother"],
      ["Tìm đường ra đi", "Bán nốt vàng, bán cả ruộng, mua chỗ trên ghe.", {"g": -8, "b": -8, "d": -3, "nn": -20, "my": 8}, "Ghe rời Rạch Giá một đêm tháng 5; ba người tới trại Songkhla, hai người không. Thư đầu tiên về năm 1980, kèm một tờ 20 đô la gấp tư.", undefined, "lylichDi"],
    ],
    note: "Sau 1975, lý lịch ba đời và hộ khẩu quyết định việc học, việc làm; con em các gia đình bị xếp diện 'nguỵ quân, nguỵ quyền' thường bị hạn chế xét tuyển đại học cho đến cuối thập niên 1980. Làn sóng vượt biên lên cao nhất 1978–1979, trùng với đợt cải tạo công thương nghiệp ở miền Nam.",
  },
  // (Biến cố "Chuyến tàu tập kết" cho nhà Nam Bộ theo Miền Bắc đã thành bộ lựa chọn của thẻ di cư 1954 cho mọi nhà phía
  // nam vĩ tuyến 17 chọn Miền Bắc (cards.ts VARIANT dc54): điểm rẽ 5 nay thật sự đưa dòng họ ra Bắc, nên không còn lựa
  // chọn "ở lại cả nhà".)
  // Nhà chọn Ra đi mà người con còn ở mặt trận Campuchia (thẻ cp79): không đi được "cả nhà" trước năm 1989 (play.ts
  // barred). Năm 1989 người con về; cả nhà mới lên đường. Đứng trước "Thùng đồ và chuyến bay về" (của nhà đã ở xứ người):
  // biến cố đầu tiên khớp được dùng. Không mang cờ rời nước: như mọi nhà Ra đi không đi trên thẻ, kết cục và gia phả kể
  // chuyến đi theo hướng Ra đi (endings.ts chronLine, Facts.front).
  {
    id: "x-radi89", ev: "kh89", when: {"picks": ["radi"], "front": true},
    title: "Người con về, cả nhà lên đường",
    s: "Mười năm trước cả nhà đã định ra đi, nhưng người con sang mặt trận Campuchia; nay quân tình nguyện về nước, người con đã về, và không còn gì giữ chân cả nhà ở lại.",
    choices: [
      ["Làm đơn đi diện đoàn tụ", "Nhờ người thân, người quen đã ở xứ người đứng ra bảo lãnh theo Chương trình Ra đi có trật tự (ODP).", {"b": -6, "u": 1, "nn": -5, "my": 8}, "Hồ sơ đi qua nhiều văn phòng và mấy năm chờ phỏng vấn. Đầu thập niên 1990, cả nhà, cả người con từng ở Campuchia, mới lên máy bay ra đi; từ đường để lại cho họ hàng trông nom."],
      ["Xuống ghe như những người đi trước", "Bán nhà, mua chỗ cho cả nhà trên một chiếc ghe ra từ cửa biển miền Tây.", {"g": -10, "b": -15, "d": -2, "u": -3, "nn": -15, "my": 10}, "Ghe tới trại đúng năm các nước bắt đầu thanh lọc người tới sau. Gần hai năm chờ xét hồ sơ, cả nhà được công nhận là người tị nạn và nhận đi định cư; nhiều gia đình cùng ghe thì phải hồi hương."],
    ],
    note: "Quân tình nguyện Việt Nam rút hết khỏi Campuchia tháng 9.1989. Chương trình Ra đi có trật tự (ODP, thoả thuận UNHCR – Việt Nam tháng 5.1979) cho người có thân nhân ở nước ngoài bảo lãnh xuất cảnh hợp pháp. Kế hoạch Hành động Toàn diện (CPA), thông qua ở Hội nghị Genève tháng 6.1989, bắt đầu thanh lọc thuyền nhân tới sau ngày hạn: chỉ người được công nhận tị nạn mới được nhận đi định cư, nhiều người khác phải hồi hương.",
  },
  {
    id: "x-kieuhoi89", ev: "kh89", when: {"picks": ["radi"]},
    title: "Thùng đồ và chuyến bay về",
    s: "Đã mười năm ở xứ người; thư từ quê kể ruộng khoán được mùa nhưng mộ tổ sụt, và người ta bắt đầu nghe chuyện Việt kiều được về thăm.",
    choices: [
      ["Gửi tiền, gửi thùng đồ đều đặn", "Qua đường bưu điện và người quen mang tay.", {"u": 5, "b": -6, "lg": 6, "nn": 5}, "Vải, thuốc tây, radio về trước; đô la gấp trong thư về sau. Nhà ở quê lợp lại mái, mua được xe đạp Nhật; hàng xóm gọi là 'nhà có Việt kiều'.", undefined, "kieuhoi"],
      ["Về thăm quê lần đầu", "Bay qua Bangkok rồi về nước.", {"u": 6, "b": -10, "lg": 8, "nn": 5}, "Hải quan lục từng thùng quà. Mộ tổ xây lại bằng đô la, cả họ chụp tấm ảnh chung đầu tiên sau 1975; bên kia, vài người quen trong cộng đồng không bắt tay nữa.", undefined, "kieuhoi"],
      ["Chưa gửi, chưa về", "Để dành mua nhà, chờ thời thế đổi.", {"u": -8, "b": 5, "lg": -10}, "Tiền để dành mua được căn nhà ở xứ người. Ở quê, giỗ họ vắng một nhánh; hai mươi năm sau, con cháu bên này không đủ tiếng Việt để hỏi đường về làng."],
    ],
    note: "Từ cuối thập niên 1980, Nhà nước nới lỏng việc nhận kiều hối và cho Việt kiều về thăm thân nhân; năm 1989 Việt Nam rút quân khỏi Campuchia và bắt đầu thoát thế cô lập. Trong cộng đồng hải ngoại, việc gửi tiền hay về nước khi đó vẫn gây tranh cãi gay gắt.",
  },
  {
    id: "x-ly79", ev: "bb79", when: {"surnames": ["ly"]},
    title: "Họ Lý, năm 1979",
    s: "Sau tiếng súng biên giới, phường rà soát người gốc Hoa; họ Lý của bạn bị gọi lên hỏi gốc gác, dù gia phả chép tổ tiên là người Việt đã nhiều đời.",
    choices: [
      ["Đưa gia phả, xin ghi dân tộc Kinh", "Nhờ người biết chữ Hán dịch gia phả; chờ xác minh.", {"u": 3, "b": -5, "nn": 5, "lg": -5}, "Hộ khẩu ghi 'Kinh'. Người Hoa cùng phố đi gần hết, cửa hàng bên cạnh đóng cửa; dòng họ ở lại trong một dãy phố bỗng vắng."],
      ["Cả nhà đi 'bán chính thức' như người Hoa", "Nộp vàng theo chuyến cho cả nhà, bán nhà, xuống ghe ra Hồng Kông.", {"g": -8, "b": -5, "d": -3, "nn": -15, "my": 5}, "Mỗi đầu người gần mười lượng vàng. Ghe tới Hồng Kông sau chín ngày; cả nhà vào trại, chờ phái đoàn các nước gọi tên.", undefined, "ly79Di"],
      ["Ở lại, chịu bị để ý", "Không đi, không chứng minh; sống qua ngày.", {"u": -4, "g": -5, "nn": -8}, "Hai người bị cho thôi việc ở cơ quan 'vì lý do an ninh'. Sau 1986 mới có người được nhận lại; cửa hàng mở lại nhờ Đổi Mới."],
    ],
    note: "Năm 1978–1979, quan hệ Việt – Trung xấu đi kéo theo 'nạn kiều': khoảng 250.000 người Hoa ở miền Bắc sang Trung Quốc bằng đường bộ, hàng trăm nghìn người ở miền Nam ra đi bằng ghe, phần lớn theo đường 'bán chính thức' có nộp vàng, và người gốc Hoa bị đưa ra khỏi các vị trí nhạy cảm. Họ Lý (李) ở Việt Nam có người Kinh, người Tày, Nùng, Dao ở miền núi phía Bắc và người Hoa cùng mang, nên khi rà soát gốc gác dễ bị đánh đồng.",
  },
  /* ---- Họ Lê, họ Trần, họ Phạm: người cùng họ trong sử cũ. Chỉ nói cùng họ, không nhận họ hàng: lựa chọn nào cũng để
     dòng họ tự quyết có nhận hay không (người chơi gõ họ thật của mình). ---- */
  {
    id: "x-le93", ev: "la93", when: {"surnames": ["le"]},
    title: "Hăm mốt Lê Lai, hăm hai Lê Lợi",
    s: "Gần ngày giỗ tháng Tám, các cụ trong họ nhắc câu “hăm mốt Lê Lai, hăm hai Lê Lợi”: ngày hăm mốt cúng Lê Lai, người đã chết thay chủ tướng, rồi hăm hai mới cúng Lê Lợi. Năm nay mất mùa, cả họ phải bàn có giữ lệ ấy không.",
    choices: [
      ["Giữ đủ hai ngày lễ", "Hai mâm cúng hai ngày, rồi mới đến giỗ tổ nhà mình; mời cả xóm.", {"g": -5, "u": 3, "lg": 4}, "Hai mâm cỗ đạm bạc giữa năm mất mùa. Người trong xóm đến đông; ông trưởng họ lại kể chuyện Lê Lai mặc áo chủ tướng xông ra giữa vòng vây, như năm nào cũng kể."],
      ["Gộp làm một lễ", "Một mâm cơm, hai nén hương; giữ lệ mà không tốn.", {"g": -2, "u": 1, "lg": 1}, "Lễ gọn, ai cũng hiểu năm nay mất mùa. Bọn trẻ thuộc câu “hăm mốt Lê Lai, hăm hai Lê Lợi” trước khi biết đọc."],
      ["Chỉ giỗ tổ nhà mình", "Cùng họ Lê, nhưng gia phả không chép nhà mình là con cháu Lam Sơn; lệ ấy nhà mình không nhận.", {"lg": -2}, "Vài cụ trong xóm chê nhà bạn bỏ lệ. Ông trưởng họ chỉ nói: cùng họ chưa chắc đã cùng dòng; gia phả nhà mình chép đủ tổ tiên của chính mình là được."],
    ],
    note: "Câu “Hăm mốt Lê Lai, hăm hai Lê Lợi” gắn với chuyện Lê Lai mặc áo chủ tướng, đánh ra giữa vòng vây cho Lê Lợi thoát, những năm đầu khởi nghĩa Lam Sơn; tương truyền Lê Lợi (mất ngày 22 tháng Tám âm lịch năm 1433) dặn cúng Lê Lai trước ngày giỗ của mình một ngày. Lễ hội Lam Kinh (Thanh Hoá) gắn với ngày giỗ này. Biến cố là hư cấu: chỉ nói cùng họ, không nhận họ hàng.",
  },
  {
    id: "x-tran36", ev: "mt36", when: {"surnames": ["tran"]},
    title: "Tháng Tám giỗ Cha",
    s: "Làng sắp vào hội tháng Tám, giỗ Đức Thánh Trần. Năm nay được mùa, làng muốn làm hội to; các cụ trong làng muốn nhà họ Trần đứng ra lo lễ, vì “cùng họ với Đức Thánh”.",
    choices: [
      ["Nhận lời đứng ra lo lễ", "Bỏ tiền sắm lễ, thuê đội tế, lo kiệu rước.", {"b": -6, "u": 4, "lg": 5}, "Kiệu rước đi khắp làng; ông trưởng họ đứng đầu đội tế. Cả năm ấy, người làng có việc gì cũng tìm đến hỏi nhà bạn."],
      ["Góp phần như mọi nhà", "Cùng họ với Đức Thánh không có nghĩa là con cháu ngài; nhà góp tiền, các cụ trong làng chủ lễ.", {"b": -2, "u": 1, "lg": 2}, "Văn tế đọc tên các cụ chủ lễ; tên nhà bạn ở dòng công đức, giữa các nhà khác trong làng. Ông trưởng họ dặn con cháu: cùng họ thì nhớ người xưa, không cần nhận là dòng dõi."],
      ["Cho con cháu vào phường bát âm", "Mấy đứa cháu tập trống, tập kèn rước kiệu suốt tháng Bảy.", {"g": -2, "u": 2, "lg": 3}, "Tiếng trống nhà bạn đi đầu đám rước. Hết hội, phường bát âm giữ mấy đứa cháu lại, năm nào cũng gọi đi đám."],
    ],
    note: "Trần Hưng Đạo (mất năm 1300) được thờ là Đức Thánh Trần ở đền Kiếp Bạc (Hải Dương), đền Trần (Nam Định) và nhiều đền làng khắp Bắc Bộ, cả ở Trung, Nam Bộ; hội tháng Tám âm lịch, giỗ ngày 20, gắn với câu “tháng Tám giỗ Cha, tháng Ba giỗ Mẹ”. Biến cố là hư cấu: chỉ nói cùng họ, không nhận họ hàng.",
  },
  {
    id: "x-pham07", ev: "wto07", when: {"surnames": ["pham"], "abroad": false},
    title: "Bài thơ của người cùng họ",
    s: "Đứa cháu học lớp mười về khoe: sách văn có bài “Tỏ lòng” của Phạm Ngũ Lão, ông tướng đời Trần quê Phù Ủng. Cô giáo hỏi cả lớp ai họ Phạm, và nó về hỏi nhà mình có phải con cháu ông không.",
    choices: [
      ["Nói thật: cùng họ, không cùng dòng", "Gia phả nhà mình không chép tới ông; người họ Phạm có ở khắp ba miền.", {"u": 1}, "Đứa cháu hơi tiu nghỉu, rồi chép bài thơ vào trang đầu cuốn vở. Ông nội bảo: không phải con cháu thì vẫn học được cái chí của người xưa."],
      ["Đưa cả nhà đi thăm đền Phù Ủng", "Nghỉ hè về Hưng Yên, thắp hương ở đền thờ Phạm Ngũ Lão.", {"b": -4, "u": 2, "lg": 1}, "Người trông đền kể chuyện ông ngồi đan sọt bên đường, bị giáo đâm vào đùi mà không hay. Đứa cháu về viết bài văn được điểm cao nhất lớp."],
      ["Nhân dịp, chép lại chi họ nhà mình", "Bài thơ làm cả nhà tò mò về tổ tiên của chính mình.", {"b": -2, "u": 3, "lg": 2}, "Ông nội ngồi kể, đứa cháu gõ vào máy tính: bốn đời, ba nhánh, tên làng cũ. Bản in đầu tiên dán lên tường cạnh bàn thờ."],
    ],
    note: "Phạm Ngũ Lão (1255–1320), người làng Phù Ủng (nay thuộc Hưng Yên), tướng đời Trần; bài “Thuật hoài” (Tỏ lòng) của ông có trong sách Ngữ văn lớp 10. Đền Phù Ủng thờ ông; chuyện ông ngồi đan sọt bị giáo đâm vào đùi là truyền thuyết. Biến cố là hư cấu: chỉ nói cùng họ, không nhận họ hàng.",
  },
  /* ---- Những năm 1990: lập lại gia phả, dựng lại nhà thờ họ (gắn vào năm 1995, mọi họ, cả họ gõ tay). Biến cố đầu tiên
     khớp được dùng: họ Mạc; nhà đã đổi họ (nhận lại họ cũ); mọi nhà trong nước; nhà ở xứ người. ---- */
  {
    id: "x-mac95", ev: "hn95", when: {"surnames": ["mac"], "abroad": false},
    title: "Các chi họ Mạc tìm lại nhau",
    s: "Sau năm 1592, con cháu nhà Mạc tản đi nhiều nơi, nhiều chi phải mang họ khác suốt mấy trăm năm. Nay các chi họ Mạc tìm lại nhau; một chi họ Phạm ở huyện bên mang gia phả đến từ đường nhà bạn, xin đối chiếu để nhận chung tổ.",
    choices: [
      ["Mở gia phả đối chiếu, nhận chung tổ", "Mời các cụ hai bên ngồi lại, so từng đời.", {"b": -3, "u": 4, "lg": 4}, "Hai cuốn gia phả gặp nhau ở một đời rất xa. Chi họ Phạm làm lễ cáo tổ ở từ đường nhà bạn rồi làm giấy tờ trở về họ Mạc; giỗ tổ năm sau đông gấp đôi."],
      ["Góp tiền về quê tổ", "Cùng các chi khác góp tiền tu sửa nơi thờ tổ ở quê gốc nhà Mạc, vùng Cổ Trai (Hải Phòng).", {"b": -7, "u": 3, "lg": 2}, "Tên chi nhà bạn khắc trên bia công đức cùng hàng chục chi khác: có chi mang họ Mạc, có chi vẫn mang họ khác."],
      ["Thận trọng, chưa nhận", "Hai cuốn gia phả chép khác nhau nhiều chỗ; chờ các cụ tra cứu thêm.", {"lg": -1}, "Chi họ kia ra về, hẹn năm sau. Các cụ nhà bạn tra gia phả thêm mấy mùa nữa: nhận họ là việc của trăm năm, không vội được."],
    ],
    note: "Mạc Đăng Dung (người làng Cổ Trai, nay thuộc Hải Phòng) lập nhà Mạc năm 1527; năm 1592 Thăng Long về tay Lê – Trịnh, con cháu nhà Mạc giữ Cao Bằng tới 1677. Nhiều gia phả chép hậu duệ nhà Mạc đổi sang họ khác để tránh truy bức; từ cuối thế kỷ XX, nhiều chi tìm lại nhau, có chi xin nhận lại họ Mạc. Biến cố là hư cấu.",
  },
  {
    id: "x-hoten95", ev: "hn95", when: {"renamed": true, "abroad": false}, minor: true,
    title: "Lập lại gia phả: hai cái tên",
    s: "Các cụ trong họ bàn chuyện chép lại gia phả, sửa sang từ đường. Dòng họ bạn đã có lần phải đổi họ; nay thời thế đã khác, có người trong họ muốn làm giấy tờ nhận lại họ cũ.",
    choices: [
      ["Nhận lại họ cũ", "Làm thủ tục đổi lại họ trên giấy tờ cho con cháu; cáo tổ ở từ đường.", {"b": -4, "u": 4, "lg": 3}, "Giấy tờ đi qua mấy cửa, gần một năm mới xong. Ngày cáo tổ, người trưởng họ đọc lại họ cũ trước bàn thờ; gia phả chép rõ những năm dòng họ mang tên khác, và vì sao.", "origin"],
      ["Giữ họ đang mang, chép cả hai", "Con cháu đã quen tên mới; gia phả ghi rõ họ gốc và năm đổi họ.", {"b": -2, "u": 2, "lg": 2}, "Gia phả mới có một trang riêng cho lần đổi họ: năm nào, vì sao, đổi sang họ gì. Con cháu khai họ mới, nhưng thuộc cả họ gốc."],
      ["Dựng lại từ đường trước", "Cả họ góp tiền lợp lại mái, dựng lại cột; chuyện tên họ để sau.", {"b": -8, "u": 4, "lg": 4}, "Từ đường lợp ngói mới. Chuyện họ cũ, họ mới, các cụ hẹn để đời sau bàn tiếp."],
    ],
    note: "Từ cuối thập niên 1980, nhiều dòng họ biên soạn lại gia phả, tu sửa nhà thờ họ; đổi lại họ trên giấy tờ là một thủ tục hộ tịch. Biến cố là hư cấu.",
  },
  {
    id: "x-giapha95", ev: "hn95", when: {"abroad": false}, minor: true,
    title: "Lập lại gia phả",
    s: "Qua mấy chục năm chiến tranh, cuốn gia phả chữ Hán của dòng họ thất lạc mỗi chi một phần, từ đường thì dột nát. Nay làm ăn khá hơn, các cụ trong họ bàn chuyện chép lại gia phả và dựng lại nhà thờ họ.",
    choices: [
      ["Dựng lại nhà thờ họ", "Cả họ góp tiền, xây lại từ đường trên nền cũ.", {"b": -8, "u": 5, "lg": 4}, "Mái ngói mới, mấy cây cột lim cũ được dựng lại. Ngày khánh thành, con cháu các chi về đông đủ, có người lần đầu biết mặt nhau."],
      ["Chép lại gia phả trước", "Đi hỏi từng chi, nhờ người biết chữ Hán dịch những trang còn giữ được.", {"b": -3, "u": 3, "lg": 2}, "Gia phả mới chép bằng quốc ngữ, kèm bản chữ Hán cũ. Những đời bị đứt, các cụ để trống và ghi “chưa rõ”, không đoán thêm."],
      ["Để dành tiền cho con cháu đi học", "Bàn thờ tổ vẫn đặt ở nhà người trưởng họ; chưa xây, chưa chép.", {"u": -1, "lg": -2}, "Các cụ trách nhẹ rồi thôi. Mấy năm sau, đứa cháu đỗ đại học, ông trưởng họ thắp hương báo tổ ngay trên bàn thờ ở nhà."],
    ],
    note: "Từ cuối thập niên 1980, nhất là sau Đổi Mới, việc tu sửa nhà thờ họ, biên soạn lại gia phả và dịch gia phả chữ Hán sang quốc ngữ nở rộ ở nhiều làng quê. Biến cố là hư cấu.",
  },
  {
    id: "x-giaphaxa95", ev: "hn95", when: {"abroad": true}, minor: true,
    title: "Nhà thờ họ ở quê",
    s: "Họ hàng ở quê đang góp tiền dựng lại nhà thờ họ, chép lại gia phả, và hỏi nhánh ở xứ người có muốn góp phần, ghi tên con cháu vào không.",
    choices: [
      ["Gửi tiền về góp xây", "Gửi qua người quen về thăm quê, kèm thư cho ông trưởng họ.", {"b": -7, "u": 3, "lg": 5}, "Tên nhánh ở xứ người được khắc trên bia công đức, cạnh tên các chi ở quê. Thư cảm ơn gửi sang kèm tấm ảnh ngày khánh thành."],
      ["Gửi tên con cháu bên này về", "Chép tên khai sinh của từng đứa, kèm tên Việt ông bà đặt.", {"b": -1, "u": 2, "lg": 3}, "Gia phả có thêm một trang cho nhánh ở xa: bên cạnh tên khai sinh tiếng nước ngoài là tên Việt các cụ đặt cho từng đứa."],
      ["Chưa góp, chưa trả lời", "Bên này còn nợ nhà, con cái còn nhỏ.", {"u": -1, "lg": -3}, "Nhà thờ họ vẫn xây xong. Trên bia công đức không có tên nhánh ở xa; ở quê, người ta hỏi thăm rồi thôi."],
    ],
    note: "Từ cuối thập niên 1980, nhiều dòng họ ở quê dựng lại nhà thờ họ, chép lại gia phả; người Việt ở nước ngoài gửi tiền góp xây và gửi tên con cháu về ghi vào gia phả. Biến cố là hư cấu.",
  },
  /* ---- Hệ quả: một lựa chọn cũ quay lại, thường một thế hệ sau (dấu trên lựa chọn, cards.ts Choice[5]). Hiện thêm sau
     biến cố riêng của sự kiện (nếu có). Lời nhẹ, không kể trả thù bằng bạo lực; mất mát không được trả công. ---- */
  {
    id: "x-gao59", ev: "pt84", when: {"after": ["banGao59"]}, also: true, minor: true,
    title: "Chuyện bán gạo năm Kỷ Mùi",
    s: "Cháu nội nhà bạn đi hỏi vợ ở làng bên. Nhà gái nhận trầu cau rồi trả lại: các cụ bên ấy còn nhớ năm Kỷ Mùi, khi Pháp chiếm thành Gia Định, nhà bạn bán gạo cho quân Pháp.",
    choices: [
      ["Mang lễ đến xin lỗi trước bàn thờ nhà gái", "Ông nội đích thân đi, nhận lỗi thay đời trước.", {"b": -5, "u": 2, "lg": 4}, "Nhà gái nhận lễ lần thứ hai. Đám cưới làm vào mùa xuân; ông nội nhà gái bảo chuyện đời cũ để đời cũ mang đi."],
      ["Làm cỗ mời cả làng, góp tiền sửa đình", "Cho cả làng thấy nhà mình nay khác xưa.", {"b": -6, "g": -3, "u": 3, "lg": 6}, "Đình làng có thêm mấy cây cột mới, cỗ đãi ba ngày. Người ta vẫn nhắc chuyện bán gạo, nhưng nhắc nhỏ đi."],
      ["Hỏi vợ cho cháu ở nơi khác", "Lên Chợ Lớn, nơi không ai biết chuyện cũ.", {"b": -3, "lg": -3}, "Cháu dâu là người Chợ Lớn, nói giọng khác. Ở làng, chuyện năm Kỷ Mùi có thêm một đời người kể."],
    ],
    note: "Pháp chiếm thành Gia Định tháng 2.1859 (năm Kỷ Mùi); quân Pháp thiếu lương thực và mua gạo của người địa phương. Biến cố là hư cấu.",
  },
  {
    id: "x-re64", ev: "cv85", when: {"after": ["giauNghiaQuan64"]}, also: true, minor: true,
    title: "Người rể từng theo Trương Định",
    s: "Hai mươi năm trước, nhà bạn nuôi giấu mấy người lính tan rã của Trương Định; một người nay là rể trong họ. Tin vua Hàm Nghi xuống chiếu Cần Vương truyền vào tới Nam Kỳ, ông rể ngồi lặng cả buổi bên bàn thờ.",
    choices: [
      ["Để ông ra Trung theo nghĩa quân", "Ông đã có tuổi nhưng còn sức; gửi theo ít tiền đường.", {"b": -4, "u": 3, "tr": 4, "ph": -5}, "Ông đi theo một ghe buôn ra Bình Thuận. Hai năm sau ông trở về, gầy rộc, chỉ nói nghĩa quân ngoài ấy đã tan."],
      ["Giữ ông ở nhà, gửi tiền theo người đi", "Tiền thì góp được, người thì giữ lại.", {"b": -6, "u": 2, "tr": 3, "ph": -3}, "Tiền đi theo người buôn ra Trung, không biết tới tay ai. Ông rể ở nhà, tối tối dạy đám cháu múa côn ngoài sân."],
      ["Khuyên ông ở yên", "Nam Kỳ đã là đất Tây gần hai mươi năm; giữ người cho nhà.", {"u": -1}, "Ông nghe lời, nhưng từ đó ít nói hẳn. Năm nào đến ngày Trương Định tử trận, ông cũng thắp một nén hương ở góc vườn."],
    ],
    note: "Trương Định tử trận ngày 20.8.1864; nhiều nghĩa quân của ông tan về làng. Chiếu Cần Vương ban tháng 7.1885; Nam Kỳ khi ấy đã là thuộc địa Pháp, phong trào Cần Vương chủ yếu ở Trung Kỳ, Bắc Kỳ, có hoạt động ở Bình Thuận. Biến cố là hư cấu.",
  },
  {
    id: "x-thongngon74", ev: "cv85", when: {"after": ["thongNgon74"]}, also: true, minor: true,
    title: "Người thông ngôn trong họ",
    s: "Mười năm trước, con trai thứ nhà bạn học chữ Pháp, ra làm thông ngôn ở toà sứ. Nay Chiếu Cần Vương truyền đi, nghĩa quân ở nhiều nơi coi người làm việc cho Pháp là kẻ thù; một sáng có lá thư không ký tên dán ở cổng nhà, đòi ông bỏ việc.",
    choices: [
      ["Bỏ việc, về quê", "Ông xin thôi việc ở toà sứ, về làng dạy chữ Pháp cho trẻ.", {"b": -6, "u": 2, "tr": 4, "ph": -5, "lg": 3}, "Lương mất, nhưng cổng nhà không còn ai dán thư. Mấy đứa trẻ trong làng biết đọc chữ Pháp trước cả con nhà quan."],
      ["Ở lại, lén báo tin cho nghĩa quân", "Vẫn đi làm, nhưng nghe được gì ở toà sứ thì nhắn người ra.", {"u": 3, "tr": 5, "ph": -4}, "Hai lần nghĩa quân tránh được cuộc càn nhờ tin của ông. Năm sau ông bị nghi, phải xin đổi lên một tỉnh xa; cả nhà giật mình mỗi khi có người lạ gõ cửa."],
      ["Ở lại, xin quan Pháp cho lính canh nhà", "Việc làm là việc làm; nhờ toà sứ che chở.", {"ph": 6, "tr": -5, "lg": -5}, "Hai người lính tập đứng gác cổng mấy tháng liền. Nhà yên, nhưng người làng đi ngang cổng thì cúi mặt."],
    ],
    note: "Sau Chiếu Cần Vương (7.1885), nhiều toán nghĩa quân nhắm vào người làm việc cho chính quyền bảo hộ (thông ngôn, lý dịch) và cả các làng Công giáo; câu chuyện để ở mức một lá thư đòi bỏ việc. Biến cố là hư cấu.",
  },
  {
    id: "x-dongcua85", ev: "dm02", when: {"after": ["dungNgoai85"]}, also: true, minor: true,
    title: "Chỗ ngồi ở đình",
    s: "Năm Ất Dậu, khi nghĩa quân Cần Vương về làng xin lương, nhà bạn đóng cửa. Nay làng xếp lại ngôi thứ ở đình; vài cụ trong hội đồng kỳ mục nhắc lại chuyện cũ, đòi xếp nhà bạn xuống chiếu dưới.",
    choices: [
      ["Góp tiền tu sửa đình", "Lợp lại mái đình, xin làng xét lại.", {"b": -7, "u": 2, "lg": 5}, "Mái đình lợp ngói mới, tên nhà bạn ghi ở bia công đức. Ngôi thứ được giữ, nhưng các cụ vẫn nhắc chuyện năm Ất Dậu."],
      ["Chịu ngồi chiếu dưới", "Không cãi, không xin.", {"u": -3}, "Ngày tế thần, ông trưởng họ ngồi chiếu dưới, lặng lẽ. Con cháu lớn lên biết vì sao, và nhớ."],
      ["Đứng ra nói rõ trước làng", "Năm ấy nhà không theo bên nào, cũng không báo quan; xin làng xét cho.", {"u": 2, "lg": -2}, "Có cụ gật gù, có cụ lắc đầu. Ngôi thứ giữ nguyên; chuyện năm Ất Dậu từ đó thành chuyện để bàn, không còn để trách."],
    ],
    note: "Ngôi thứ ở đình làng (theo tuổi, khoa bảng, chức sắc, đóng góp) do các bậc kỳ mục xếp; năm Ất Dậu là năm 1885, năm có Chiếu Cần Vương. Biến cố là hư cấu.",
  },
  {
    id: "x-nho74", ev: "dd05", when: {"after": ["nhaNho74"]}, also: true, minor: true,
    title: "Ông tú và chữ quốc ngữ",
    s: "Ông tú trong họ, đỗ tú tài từ thời Tự Đức, nay đã ngoài năm mươi. Các nhà nho duy tân đi nhiều nơi cổ động bỏ lối học cử nghiệp, học chữ quốc ngữ, cắt tóc ngắn; có người đến mời ông đứng lớp.",
    choices: [
      ["Ông tú cắt tóc, dạy quốc ngữ", "Mở lớp trong nhà thờ họ.", {"b": -2, "u": 4, "ph": -4, "lg": 3}, "Búi tóc cắt trước sân đình, cả làng ra xem. Lớp quốc ngữ của ông tú học trong nhà thờ họ, ba mươi đứa trẻ ngồi chật."],
      ["Giữ lối cũ, cho cháu học chữ Hán", "Còn khoa thi thì còn đường làm quan.", {"b": -3, "u": 1, "tr": 3}, "Đứa cháu dùi mài kinh sử thêm mười năm. Rồi các khoa thi chữ Hán bị bãi, chữ của nó chỉ còn để viết câu đối Tết cho làng."],
      ["Góp tiền in sách, ông tú ở nhà", "Không đứng lớp, nhưng giúp trường mới có sách.", {"b": -5, "u": 2, "ph": -2, "lg": 2}, "Sách quốc ngữ chuyển về làng trong thúng gạo. Ông tú không đứng lớp, nhưng tối nào cũng ngồi nghe bọn trẻ đọc."],
    ],
    note: "Những năm 1905–1908, phong trào Duy Tân, Đông Kinh Nghĩa Thục cổ động học chữ quốc ngữ, bỏ lối học khoa cử, cắt tóc ngắn. Khoa thi Hương cuối cùng ở Bắc Kỳ năm 1915, ở Trung Kỳ năm 1918. Biến cố là hư cấu.",
  },
  {
    id: "x-xiem30", ev: "cs30", when: {"after": ["dongDu05"]}, also: true, minor: true,
    title: "Thư từ đất Xiêm",
    s: "Người nhà bạn đi Đông Du, bị trục xuất khỏi Nhật năm 1909, đã hơn hai mươi năm sống ở Xiêm, làm ruộng với các gia đình người Việt bên ấy. Nay có thư về qua tay người buôn: ông đã già, hỏi tin nhà, và hỏi trong họ có đứa cháu nào muốn sang.",
    choices: [
      ["Gửi một đứa cháu sang Xiêm", "Theo đường buôn qua Lào, sang ở với ông.", {"d": -1, "u": 3, "ph": -5, "vm": 4}, "Đứa cháu làm ruộng với các gia đình người Việt ở Xiêm, ngày cày cấy, tối học chữ, nghe chuyện thời thế. Thư nó gửi về toàn chuyện người Việt ở xa vẫn lo việc nước."],
      ["Xin ông về quê dưỡng già", "Gửi tiền đường, nhờ người lo giấy tờ.", {"b": -6, "u": 2, "ph": -2, "lg": 2}, "Ông về tới làng sau hai tháng đường. Mật thám ghi tên ông vào sổ, vài tháng lại đến hỏi; ông ngồi đầu hiên kể chuyện Yokohama, Bangkok cho đám cháu."],
      ["Gửi tiền, giữ thư", "Ông ở bên ấy đã quen; nhà gửi chút tiền.", {"b": -4, "u": 1}, "Tiền đi theo người buôn, thư về thưa dần. Lá thư cuối cùng cất trong hộp gỗ trên bàn thờ."],
    ],
    note: "Nhật trục xuất du học sinh Đông Du theo thoả thuận với Pháp (1908–1909); nhiều người sang Xiêm, sống với cộng đồng người Việt ở vùng đông bắc Xiêm, lập trại làm ruộng. Cuối thập niên 1920, nhiều nhà cách mạng Việt Nam qua lại vùng này. Biến cố là hư cấu.",
  },
  {
    id: "x-linhtho36", ev: "mt36", when: {"after": ["linhTho16"]}, also: true, minor: true,
    title: "Ông lính thợ năm xưa",
    s: "Người đi lính thợ sang Pháp năm 1916 nay đã ngoài bốn mươi, vẫn đeo chiếc đồng hồ mang về từ Marseille. Năm nay báo chí được nói nhiều hơn, thợ thuyền ở các thành phố lập hội, đòi tăng lương; ông biết tiếng Pháp, biết nghề máy.",
    choices: [
      ["Mở hiệu sửa xe đạp, máy may", "Hiệu nhỏ ở chợ huyện; thợ là con cháu trong họ.", {"b": 6, "g": -2, "u": 1}, "Ông dạy nghề bằng những tiếng Pháp cả làng nghe quen tai: “bu-lông”, “phanh”, “gác-đờ-bu”. Hiệu nhỏ mà không lúc nào vắng khách."],
      ["Giúp thợ viết bản dân nguyện", "Ông chép, dịch những điều thợ thuyền muốn đòi, gửi lên các uỷ ban của phong trào Đông Dương Đại hội.", {"u": 3, "vm": 4, "ph": -3}, "Bản dân nguyện có chữ ông chép tay bằng tiếng Pháp. Phong trào bị cấm ngay trong năm ấy; ông về nhà, giữ lại bản nháp."],
      ["Dạy tiếng Pháp cho đám cháu", "Học tiếng người ta để biết người ta nghĩ gì.", {"b": -1, "u": 2, "ph": 2}, "Mấy đứa cháu thi đỗ vào trường Pháp – Việt ở tỉnh. Ông ngồi dò bài từng đứa, chiếc đồng hồ Marseille đặt trên bàn."],
    ],
    note: "Gần 50.000 lính thợ Đông Dương sang Pháp trong Thế chiến I, phần lớn về nước khoảng 1919–1920. Năm 1936 chính phủ Mặt trận Bình dân lên cầm quyền ở Pháp; ở Đông Dương có làn sóng đình công và phong trào Đông Dương Đại hội lập uỷ ban, thảo dân nguyện, rồi bị cấm ngay trong năm ấy. Biến cố là hư cấu.",
  },
  {
    id: "x-anxa36", ev: "mt36", when: {"after": ["vaoDang30"]}, also: true, minor: true,
    title: "Người về từ nhà tù",
    s: "Người trong họ vào Đảng năm 1930, bị bắt trong những năm đàn áp sau đó. Năm 1936, chính phủ Mặt trận Bình dân ở Pháp ân xá nhiều tù chính trị; người ấy về tới làng, gầy rộc, mang theo mấy cuốn sách học được trong tù.",
    choices: [
      ["Đón về, cho ở nhà", "Cho ở nhà thờ họ, mặc mật thám dò hỏi.", {"g": -2, "u": 3, "vm": 4, "ph": -4}, "Người ấy ở nhà nửa năm, dạy chữ cho trẻ trong họ. Rồi lại đi, lần này nói rõ với các cụ là đi đâu."],
      ["Lo cho một chân dạy học, viết báo", "Nhờ người quen ở tỉnh.", {"b": -4, "u": 3, "vm": 3, "ph": -2}, "Người ấy viết cho một tờ báo quốc ngữ ở tỉnh, ký tên khác. Báo bán chạy hơn nhờ những bài về giá gạo, giá thuế."],
      ["Khuyên ở nhà lấy vợ, làm ăn", "Mấy năm tù là đủ cho một đời người.", {"ph": 3, "vm": -3, "lg": 1}, "Người ấy nghe lời được một mùa gặt. Cuối năm sau, cái ghế đầu hiên lại để trống."],
    ],
    note: "Sau Xô viết Nghệ Tĩnh (1930–1931), hàng nghìn người bị bắt, đưa ra Côn Đảo, Sơn La, Lao Bảo…; năm 1936, chính phủ Mặt trận Bình dân ở Pháp ân xá, nhiều tù chính trị Đông Dương được thả. Biến cố là hư cấu.",
  },
  {
    id: "x-co45", ev: "ng45", when: {"after": ["coSoVM41"]}, also: true, minor: true,
    title: "Lá cờ đầu tiên của làng",
    s: "Bốn năm trước, nhà bạn là nơi Việt Minh họp bí mật. Tháng Tám năm nay, khi tin Nhật đầu hàng về tới làng, những người từng họp trong nhà bạn đến xin chỗ treo lá cờ đầu tiên.",
    choices: [
      ["Treo cờ trước nhà, mở cửa làm nơi họp", "Nhà mình đã là chỗ họp bốn năm; nay họp công khai.", {"g": -3, "u": 4, "vm": 5, "lg": 2}, "Lá cờ treo trên cây tre trước ngõ. Cả tháng ấy nhà bạn không lúc nào vắng người; mâm cơm nào cũng thêm mấy bát."],
      ["Mang cờ ra treo ở đình", "Để cả làng cùng treo, không phải riêng nhà mình.", {"u": 3, "vm": 3, "lg": 4}, "Lá cờ lên ở cột đình, cả làng ra xem. Người ta nhớ cờ treo ở đình, ít ai nhớ cờ đi ra từ nhà nào."],
      ["Cất cờ, chờ tin chắc", "Lính Nhật còn ở tỉnh; chưa biết ai sẽ cai quản.", {"u": -1, "vm": -3}, "Mấy hôm sau, làng bên treo cờ trước. Lá cờ nhà bạn nằm dưới đáy rương, gấp làm tư."],
    ],
    note: "Sau khi Nhật đầu hàng Đồng minh (15.8.1945), Việt Minh phát động tổng khởi nghĩa; trong khoảng 14 – 28.8.1945, chính quyền ở hầu hết các tỉnh về tay Việt Minh. Biến cố là hư cấu.",
  },
  {
    id: "x-thoc45", ev: "ng45", when: {"after": ["giauThoc40"]}, also: true, minor: true,
    title: "Hầm thóc chôn năm 1940",
    s: "Năm năm trước, nhà bạn chôn thóc trong vườn để khỏi phải bán cho Nhật. Nay đói lan khắp miền Bắc; hầm thóc ấy đủ cho cả họ qua mùa giáp hạt, nếu chỉ dành cho người trong họ.",
    choices: [
      ["Đào thóc chia cho cả xóm", "Chia theo đầu người, nhà nào cũng có phần.", {"g": -8, "u": 5, "lg": 7}, "Mỗi nhà vài đấu thóc. Cả xóm qua được mùa giáp hạt; nhà bạn ăn cháo cùng mọi người."],
      ["Chia cho họ hàng, láng giềng sát vách", "Giữ phần cho nhà, san bớt cho những nhà gần.", {"g": -4, "u": 2, "lg": 3}, "Mấy nhà quanh ngõ qua được mùa đói. Ở đầu làng, người nơi khác đến xin ăn mỗi ngày một đông."],
      ["Giữ cho người trong họ", "Đói còn dài; giữ thóc cho người nhà.", {"u": -2, "lg": -5}, "Cả họ qua được mùa đói. Hàng xóm biết nhà bạn còn thóc; nhiều năm sau vẫn có người không chào."],
    ],
    note: "Nạn đói năm Ất Dậu (cuối 1944 – giữa 1945) ở Bắc Kỳ và bắc Trung Kỳ, số người chết thường được nêu khoảng 1 – 2 triệu tuỳ nguồn; việc Pháp, Nhật thu mua thóc và buộc nhổ lúa trồng đay là những nguyên nhân thường được nêu. Biến cố là hư cấu.",
  },
  {
    id: "x-hen46", ev: "tk46", when: {"after": ["choVM41"]}, also: true, minor: true,
    title: "Người hẹn gặp lại",
    s: "Năm 1941, một người Việt Minh đến nhà bạn rồi đi, hẹn gặp lại. Cuối năm 1946, khi tiếng súng kháng chiến nổ, người ấy quay lại thật, nay là cán bộ huyện, đến hỏi nhà bạn giúp được gì.",
    choices: [
      ["Cho một người con theo đi", "Vào dân quân, rồi vệ quốc đoàn.", {"d": -1, "u": 3, "vm": 5}, "Người con đi theo người cán bộ ngay đêm ấy. Thư về thưa, nhưng có, qua tay giao liên."],
      ["Góp thóc, giữ người ở nhà", "Thóc thì góp được; người còn phải giữ ruộng.", {"g": -6, "u": 1, "vm": 4}, "Hai bồ thóc đi trong đêm. Người cán bộ ghi tên nhà bạn vào sổ, bắt tay rồi đi."],
      ["Xin cho nhà đứng ngoài", "Nhà neo người, già yếu.", {"u": -1, "vm": -4}, "Người cán bộ không nói gì thêm. Từ đó, trong các buổi họp xã, thỉnh thoảng lại có người nhắc tên nhà bạn."],
    ],
    note: "Toàn quốc kháng chiến bắt đầu đêm 19.12.1946. Biến cố là hư cấu.",
  },
  {
    id: "x-haimam54", ev: "gnv", when: {"after": ["chiaDoi46"], "homes": ["hn", "nd", "na"]}, also: true, minor: true,
    title: "Hai nhánh ngồi chung mâm",
    s: "Năm 1946, dòng họ chia đôi: một nhánh đi theo kháng chiến, một nhánh ở lại giữ ruộng. Hiệp định Genève ký xong, nhánh đi xa trở về; lần đầu sau chín năm, cả họ ngồi lại với nhau ở từ đường.",
    choices: [
      ["Làm giỗ chung, đọc lại gia phả", "Một mâm giỗ cho cả hai nhánh.", {"g": -4, "u": 3, "lg": 4}, "Mâm giỗ dọn ra hai dãy, rồi người ta ngồi lẫn vào nhau. Ông trưởng họ đọc tên các cụ của cả hai nhánh, không sót ai."],
      ["Chia lại ruộng hương hoả cho nhánh mới về", "Nhánh đi xa về tay trắng; nhánh ở nhà san bớt ruộng.", {"g": -6, "u": 3, "lg": 3}, "Nhánh ở nhà cắt mấy sào ruộng hương hoả cho nhánh mới về. Có người tiếc, nhưng không ai nói ra."],
      ["Mỗi nhánh một mâm", "Chín năm xa nhau, mỗi bên một nếp sống; chưa ngồi chung được.", {"lg": -2}, "Hai mâm cỗ đặt ở hai gian. Phải đến đời con cháu, hai nhánh mới ngồi chung một chiếu."],
    ],
    note: "Hiệp định Genève ký ngày 21.7.1954; Quân đội Nhân dân Việt Nam tiếp quản Hà Nội ngày 10.10.1954. Biến cố là hư cấu.",
  },
  {
    id: "x-thonggia73", ev: "pr73", when: {"after": ["donDiCu54"], "abroad": false}, also: true, minor: true,
    title: "Đám cưới với nhà di cư",
    s: "Gia đình người Bắc di cư từng ở nhờ nhà bạn năm 1954 nay đã thành hàng xóm thân. Đầu năm 1973, Hiệp định Paris vừa ký, con trai nhà bạn và con gái nhà ấy xin cưới; nhà gái theo đạo Công giáo, như nhiều người di cư năm ấy.",
    choices: [
      ["Cưới ở nhà thờ, rồi lễ gia tiên", "Buổi sáng lễ cưới ở nhà thờ xứ, buổi chiều ra mắt tổ tiên ở nhà trai.", {"b": -6, "u": 3, "lg": 4}, "Buổi sáng ở nhà thờ, buổi chiều trước bàn thờ gia tiên. Hai bên nội ngoại, hai giọng Bắc Nam, cùng ngồi một mâm."],
      ["Đám cưới giản dị, thời chiến", "Vài mâm cỗ, mời hàng xóm.", {"b": -2, "u": 1, "lg": 2}, "Cỗ cưới vài mâm, khách phần lớn là hàng xóm. Ai cũng mong hoà bình đến kịp cho đứa cháu đầu lòng."],
      ["Xin hoãn đến khi yên", "Con trai còn đi lính; chờ hoà bình thật sự.", {"lg": -1}, "Hai nhà giữ lời hứa. Đám cưới hoãn sang năm sau, ít khách hơn, nhưng hai nhà vẫn thành thông gia."],
    ],
    note: "Năm 1954–1955 khoảng 800.000 – 1 triệu người miền Bắc di cư vào Nam, phần lớn là người Công giáo. Hiệp định Paris ký ngày 27.1.1973. Biến cố là hư cấu.",
  },
  {
    id: "x-ho89", ev: "kh89", when: {"after": ["cuuLinh68"], "abroad": false}, also: true, minor: true,
    title: "Người lính năm Mậu Thân",
    s: "Cuối năm 1989, một người đàn ông chống nạng gõ cửa: năm Mậu Thân, ông là người lính bị thương được nhà bạn băng bó. Ông đã qua những năm học tập cải tạo, đầu năm tới sẽ cùng vợ con sang Mỹ theo diện H.O., và muốn ghé tạ ơn trước khi đi.",
    choices: [
      ["Giữ ông lại ăn cơm, ôn chuyện cũ", "Làm mâm cơm, mời cả nhà ra ngồi.", {"g": -2, "u": 2, "lg": 2}, "Ông ngồi đến khuya, kể về những năm trong trại và những người cùng đơn vị. Lúc về, ông xin tấm ảnh chụp cả nhà để mang theo."],
      ["Đưa địa chỉ, hẹn có thư", "Giữ liên lạc với người sắp đi xa.", {"u": 1, "lg": 1, "my": 3}, "Năm sau có thư từ Mỹ, kèm tấm ảnh cả nhà ông trước căn nhà thuê. Thư đi thư lại nhiều năm."],
      ["Nhận lời cảm ơn, tiễn về", "Chuyện cũ, nhắc lại cũng buồn.", {}, "Ông đứng lâu ở cổng rồi mới đi. Cả nhà nhớ mãi dáng người chống nạng ở đầu ngõ."],
    ],
    note: "Theo thoả thuận Mỹ – Việt Nam năm 1989, chương trình H.O. (Humanitarian Operation) cho cựu tù cải tạo cùng gia đình sang định cư ở Mỹ; những chuyến đầu tiên đi đầu năm 1990. Biến cố là hư cấu.",
  },
  {
    id: "x-doi95", ev: "hn95", when: {"after": ["banThoc45"], "homes": ["hn", "nd", "na"], "abroad": false}, also: true, minor: true,
    title: "Năm mươi năm sau nạn đói",
    s: "Năm 1995, tròn năm mươi năm nạn đói Ất Dậu, làng làm lễ cầu siêu và dựng bia cho những người không qua được mùa đói năm ấy. Các cụ trong làng còn nhớ nhà bạn đã bán thóc giá cao giữa lúc người ta đói.",
    choices: [
      ["Góp tiền dựng bia, xin lỗi trước làng", "Ông trưởng họ đứng ra nhận thay đời cha ông.", {"b": -8, "u": 3, "lg": 6}, "Ông trưởng họ thắp hương trước bia, nói thay đời cha ông. Có cụ quay đi, có cụ gật đầu; theo lời ông xin, tên nhà bạn không ghi trên bảng công đức."],
      ["Lặng lẽ thắp hương ở nhà", "Không đến lễ, không góp.", {"u": -1, "lg": -2}, "Nhà bạn không đến lễ. Chuyện năm Ất Dậu lại được kể thêm một lượt, cho cả những người sinh sau."],
      ["Góp tiền, xin giấu tên", "Góp phần dựng bia, không đứng ra.", {"b": -6, "lg": 3}, "Bia dựng xong ở góc đình. Trên bảng công đức có một dòng “một gia đình trong làng”; nhiều người đoán ra, không ai nói."],
    ],
    note: "Nhiều làng ở miền Bắc lập bia, làm lễ tưởng niệm người chết trong nạn đói năm Ất Dậu (1945); năm 1995 là năm thứ năm mươi. Biến cố là hư cấu.",
  },
  {
    id: "x-ghion95", ev: "hn95", when: {"after": ["khoThoc45"], "homes": ["hn", "nd", "na"], "abroad": false}, also: true, minor: true,
    title: "Kho thóc năm Ất Dậu",
    s: "Tròn năm mươi năm nạn đói Ất Dậu, làng làm lễ tưởng niệm ở đình. Tấm biển ghi những nhà mở kho cứu đói năm ấy được lau lại; tên dòng họ bạn ở dòng đầu, và làng mời người trong họ đọc văn tế.",
    choices: [
      ["Nhận lời đọc văn tế", "Người cháu đích tôn đứng ra đọc.", {"u": 3, "lg": 2}, "Người cháu đọc văn tế, giọng run run. Sau lễ, mấy cụ già đến nắm tay, kể lại những ngày đong thóc ở sân nhà bạn."],
      ["Xin ghi chung là “người làng”", "Cứu đói là việc của cả làng; không muốn tên nhà mình đứng riêng.", {"u": 1, "lg": 4}, "Tấm biển mới ghi “người làng góp thóc cứu đói năm Ất Dậu”. Các cụ bảo nhà bạn khiêm nhường; con cháu thì vẫn biết."],
      ["Góp tiền làm lễ cầu siêu", "Lo cơm cho người đi lễ, như năm mươi năm trước lo cháo.", {"b": -5, "u": 2, "lg": 4}, "Lễ cầu siêu làm ba ngày ở chùa làng. Nhà bạn đứng ra lo cơm cho người đi lễ, như năm mươi năm trước."],
    ],
    note: "Nhiều làng ở miền Bắc làm lễ tưởng niệm nạn đói năm Ất Dậu (1945); năm 1995 là năm thứ năm mươi. Biến cố là hư cấu.",
  },
];
