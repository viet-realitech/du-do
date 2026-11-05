/* Cảnh động cho các trận đánh trong tour chương: loại cảnh, mũi tiến quân (từ → tới, bên), vị trí phòng thủ.
   Toạ độ [kinh độ, vĩ độ]. Dữ liệu do đội soạn và kiểm chứng với Wikipedia (11.2026); là minh hoạ hướng tiến quân,
   không phải bản đồ tác chiến. */

export type SceneType = 'land' | 'siege' | 'naval' | 'air' | 'uprising' | 'landing';
export type LonLat = [number, number];
/** [từ, tới, bên, ghi chú] */
export type Arrow = [LonLat, LonLat, string, string];
export interface Scene {
  type: SceneType;
  arrows: Arrow[];
  /** Vị trí được giữ: [kinh độ, vĩ độ, bên]. */
  hold: [number, number, string][];
}

/** Màu mũi tên theo bên (sáng, đọc được trên mọi màu lãnh thổ; luôn có viền tối). */
export const SIDE_COLOR: Record<string, string> = {
  dainam: '#f2c443', phap: '#5b8ef0', es: '#e9a23b', cd: '#c3cad4', jp: '#ff6159', th: '#7fb0ff',
  vndcch: '#ff4b3e', cmlt: '#ff7d6b', vnch: '#ffd84a', bx: '#c58ae6', my: '#4fa3ff', kh: '#d0615c', cn: '#ff8a3d', nghiaquan: '#ffa04a',
};
export const SIDE_NAME: Record<string, string> = {
  dainam: 'Quân triều Nguyễn', phap: 'Quân Pháp', es: 'Quân Tây Ban Nha', cd: 'Quân Cờ Đen', jp: 'Quân Nhật', th: 'Quân Thái Lan',
  vndcch: 'Việt Minh / QĐND', cmlt: 'Quân Giải phóng', vnch: 'Quân đội VNCH', bx: 'Bình Xuyên', my: 'Quân Mỹ', kh: 'Khmer Đỏ',
  cn: 'Quân Trung Quốc', nghiaquan: 'Nghĩa quân',
};

export const SCENES: Record<string, Scene> = {
  dn58: { type: "landing", arrows: [[[108.33, 16.28], [108.27, 16.14], "phap", "Ba chiến hạm nã pháo các đồn trên bán đảo Sơn Trà"], [[108.22, 16.29], [108.22, 16.1], "phap", "Cánh thứ hai áp sát cửa sông Hàn, bắn đồn Đông, đồn Tây"], [[108.17, 16.18], [108.24, 16.09], "es", "Quân Tây Ban Nha – Philippines cùng đổ bộ Sơn Trà (2.9)"]],
    hold: [[108.22, 16.07, "dainam"], [108.24, 16.08, "dainam"], [108.2, 16.04, "dainam"]] },
  gd59: { type: "siege", arrows: [[[106.99, 10.44], [106.75, 10.69], "phap", "Hạm đội ngược sông Lòng Tàu, phá sáu đồn ven sông"], [[106.78, 10.7], [106.71, 10.76], "es", "Quân Tây Ban Nha chiếm hai đồn phía nam (16.2)"], [[106.75, 10.72], [106.7, 10.78], "phap", "Thủy quân lục chiến đổ bộ, đánh thành (17.2)"]],
    hold: [[106.7, 10.78, "dainam"]] },
  cd61: { type: "siege", arrows: [[[106.66, 10.74], [106.63, 10.82], "phap", "Đạo quân Charner vòng lên mạn tây bắc, chiếm đồn Redoute (24.2)"], [[106.58, 10.8], [106.66, 10.79], "es", "Cánh phải: bộ binh Tây Ban Nha và thủy binh đánh về phía đông (25.2)"], [[106.58, 10.84], [106.66, 10.81], "phap", "Cánh trái: công binh, thủy quân lục chiến, khinh binh"]],
    hold: [[106.66, 10.79, "dainam"], [106.63, 10.81, "dainam"]] },
  nt61: { type: "naval", arrows: [[[106.41, 10.54], [106.51, 10.56], "dainam", "Năm ghe nghĩa quân giả ghe buôn theo rạch Nhật Tảo áp sát tàu"], [[106.53, 10.66], [106.52, 10.57], "dainam", "Nghĩa quân phục trên bờ ập ra tiếp ứng"]],
    hold: [[106.52, 10.56, "phap"]] },
  td64: { type: "land", arrows: [[[106.67, 10.36], [106.74, 10.41], "phap", "Quân Pháp từ Gò Công, Huỳnh Công Tấn dẫn đường, tập kích ban đêm"], [[106.71, 10.33], [106.75, 10.41], "phap", "Cánh thứ hai từ hướng Tân Hòa khép vòng vây"]],
    hold: [[106.75, 10.42, "dainam"]] },
  vl67: { type: "naval", arrows: [[[106.36, 10.35], [105.98, 10.26], "phap", "La Grandière cùng pháo thuyền đến Vĩnh Long (20.6)"], [[105.95, 10.27], [105.12, 10.7], "phap", "Ngược sông lên Châu Đốc (22.6)"], [[105.06, 10.6], [104.49, 10.39], "phap", "Tiến tới Hà Tiên (24.6)"]],
    hold: [[105.97, 10.25, "dainam"], [105.12, 10.7, "dainam"], [104.48, 10.38, "dainam"]] },
  hn73: { type: "siege", arrows: [[[105.92, 20.97], [105.86, 21.04], "phap", "Pháo thuyền Scorpion, Espingole bắn từ sông Hồng"], [[105.89, 20.97], [105.84, 21.03], "phap", "Garnier đánh cửa Đông Nam"], [[105.5, 21.14], [105.8, 21.03], "cd", "Quân Cờ Đen từ Sơn Tây phục kích ở Cầu Giấy (21.12)"]],
    hold: [[105.84, 21.04, "dainam"]] },
  hd82: { type: "siege", arrows: [[[105.92, 20.97], [105.85, 21.05], "phap", "Pháo thuyền Fanfare, Surprise bắn phá cửa Bắc"], [[105.89, 20.97], [105.84, 21.03], "phap", "Bộ binh Rivière từ Đồn Thủy đánh vào thành"]],
    hold: [[105.84, 21.04, "dainam"]] },
  ta83: { type: "landing", arrows: [[[107.82, 16.74], [107.67, 16.58], "phap", "Hạm đội Courbet thả neo ngoài cửa biển, nã pháo các đồn"], [[107.7, 16.62], [107.65, 16.56], "phap", "Đổ bộ lên bãi cát, chiếm thành Trấn Hải – đồn lớn phía bắc (20.8)"], [[107.75, 16.6], [107.67, 16.55], "phap", "Lynx, Vipère vượt hàng cản vào cửa sông, đấu pháo với đồn phía nam (20.8)"]],
    hold: [[107.66, 16.55, "dainam"], [107.68, 16.54, "dainam"], [107.63, 16.56, "dainam"]] },
  bd86: { type: "siege", arrows: [[[105.78, 19.82], [105.91, 19.99], "phap", "Quân Pháp từ tỉnh thành Thanh Hoá"], [[105.96, 20.24], [105.93, 20.02], "phap", "Cánh quân từ Ninh Bình qua Tam Điệp"], [[106.02, 19.98], [105.94, 20], "phap", "Vòng vây mặt đông, pháo binh bắn phá"]],
    hold: [[105.92, 20, "dainam"]] },
  hk96: { type: "land", arrows: [[[105.9, 18.34], [105.48, 18.36], "phap", "Quân Nguyễn Thân và Pháp từ Hà Tĩnh tiến vào"], [[105.68, 18.67], [105.46, 18.4], "phap", "Lực lượng từ Nghệ An chặn mạn bắc"], [[105.71, 18.18], [105.47, 18.33], "phap", "Đồn bốt dọc sông Ngàn Sâu cắt đường tiếp tế"]],
    hold: [[105.45, 18.35, "dainam"]] },
  yt13: { type: "land", arrows: [[[106.2, 21.28], [106.13, 21.48], "phap", "Quân Pháp (đại tá Bataille) từ Phủ Lạng Thương tiến vào Yên Thế, 1.1909"], [[106.1, 21.44], [106.14, 21.51], "phap", "Cánh quân Pháp từ đồn Nhã Nam đánh lên"], [[106.13, 21.48], [105.79, 21.31], "nghiaquan", "Nghĩa quân rút sang Tam Đảo, đánh ở núi Hàm Lợn (3.1909)"]],
    hold: [[106.13, 21.48, "nghiaquan"]] },
  yb30: { type: "uprising", arrows: [[[104.81, 21.77], [104.89, 21.72], "nghiaquan", "Lính khố đỏ trong trại nổi dậy, đánh khu sĩ quan Pháp"], [[104.93, 21.79], [104.89, 21.72], "nghiaquan", "Đảng viên VNQDĐ ngoài thành đánh đồn Cao, đồn Dưới"], [[105.2, 21.27], [105.29, 21.25], "nghiaquan", "Nguyễn Khắc Nhu đánh đồn Hưng Hoá"], [[105.33, 21.39], [105.29, 21.32], "nghiaquan", "Nghĩa quân chiếm phủ lỵ Lâm Thao"]],
    hold: [[104.89, 21.72, "phap"], [105.29, 21.25, "phap"], [105.29, 21.32, "phap"]] },
  nh40: { type: "land", arrows: [[[106.75, 22.11], [106.7, 21.95], "jp", "Sư đoàn 5 Nhật vượt biên giới gần Đồng Đăng, đêm 22.9"], [[106.7, 21.95], [106.76, 21.86], "jp", "Bộ binh, xe tăng Nhật vây Lạng Sơn"], [[106.74, 21.85], [106.32, 21.9], "phap", "Quân Pháp thua, rút qua châu Bắc Sơn"]],
    hold: [[106.7, 21.95, "phap"], [106.76, 21.85, "phap"]] },
  nk40: { type: "uprising", arrows: [[[106.61, 10.81], [106.59, 10.88], "nghiaquan", "Du kích Hóc Môn – Bà Điểm vây đồn Hóc Môn"], [[106.33, 10.6], [106.4, 10.54], "nghiaquan", "Nghĩa quân Tân An nổi dậy hai bờ Vàm Cỏ Tây"], [[106.28, 10.44], [106.34, 10.38], "nghiaquan", "Nghĩa quân Châu Thành (Mỹ Tho) giành quyền ở các làng"], [[106.08, 10.5], [106.12, 10.41], "nghiaquan", "Nghĩa quân Cai Lậy nổi dậy"], [[106.13, 10.04], [106.19, 10.1], "nghiaquan", "Du kích Vũng Liêm chiếm đồn, giữ ba ngày"]],
    hold: [[106.36, 10.36, "phap"], [106.59, 10.88, "phap"], [106.7, 10.78, "phap"]] },
  ft41: { type: "naval", arrows: [[[102.3, 11.5], [102.48, 12], "phap", "Tuần dương hạm Lamotte-Picquet vòng phía đông chặn lối thoát"], [[102.22, 11.52], [102.47, 11.97], "phap", "Hai tàu aviso Dumont d'Urville, Amiral Charner đánh vào giữa"], [[102.05, 11.62], [102.42, 11.94], "phap", "Hai tàu aviso Tahure, Marne đánh phía tây"]],
    hold: [[102.45, 12, "th"]] },
  vb44: { type: "land", arrows: [[[106.04, 22.53], [106.01, 22.6], "vndcch", "Đội VN Tuyên truyền GPQ từ rừng Trần Hưng Đạo đánh đồn Phai Khắt (17 giờ 25.12)"], [[106.01, 22.6], [106.09, 22.63], "vndcch", "Hành quân xuyên rừng suốt đêm, sáng 26.12 hạ đồn Nà Ngần (Hoa Thám)"]],
    hold: [[106.01, 22.6, "phap"], [106.09, 22.63, "phap"]] },
  tk46: { type: "land", arrows: [[[105.77, 20.96], [105.82, 21.03], "vndcch", "Tiểu đoàn 56 (Hà Đông) đánh vào Giảng Võ, Ô Chợ Dừa"], [[105.86, 20.93], [105.85, 21.01], "vndcch", "Lực lượng Liên khu II đánh ở cửa ô Cầu Dền"], [[105.85, 21.04], [105.7, 21.09], "vndcch", "Trung đoàn Thủ đô rút qua gầm cầu Long Biên (17.2.1947)"]],
    hold: [[105.85, 21.03, "vndcch"], [105.84, 21.04, "phap"], [105.89, 21.04, "phap"]] },
  vb47: { type: "land", arrows: [[[105.85, 21.03], [105.84, 22.14], "phap", "Lính dù Pháp nhảy xuống Bắc Kạn, Chợ Đồn (7–8.10)"], [[106.76, 21.85], [106.25, 22.66], "phap", "Binh đoàn Beaufre theo Đường 4 lên Cao Bằng"], [[105.43, 21.3], [105.22, 21.82], "phap", "Binh đoàn Communal ngược sông Lô lên Tuyên Quang"], [[105.25, 21.7], [105.18, 21.63], "vndcch", "Phục kích tàu Pháp trên sông Lô ở Đoan Hùng (24.10)"]],
    hold: [[105.63, 21.9, "vndcch"]] },
  bg50: { type: "land", arrows: [[[106.5, 22.52], [106.44, 22.44], "vndcch", "Trung đoàn 174 đánh chính Đông Khê từ đông bắc, bắc"], [[106.36, 22.39], [106.43, 22.44], "vndcch", "Trung đoàn 209 đánh hướng tây nam, tây"], [[106.48, 22.26], [106.39, 22.4], "phap", "Binh đoàn Le Page từ Thất Khê lên, bị vây ở Cốc Xá"], [[106.25, 22.67], [106.38, 22.43], "phap", "Binh đoàn Charton rút khỏi Cao Bằng, xuyên rừng"]],
    hold: [[106.44, 22.44, "phap"], [106.48, 22.26, "phap"], [106.25, 22.67, "phap"]] },
  hb52: { type: "land", arrows: [[[105.56, 20.89], [105.35, 20.83], "phap", "Binh đoàn cơ động Pháp theo Đường 6 lên Hoà Bình"], [[105.36, 21.24], [105.33, 20.86], "phap", "Binh đoàn cơ động 7 và tàu Pháp ngược sông Đà"], [[105.18, 21.1], [105.28, 21.07], "vndcch", "Trung đoàn 88 (Đại đoàn 308) đánh cứ điểm Tu Vũ"], [[105.47, 20.76], [105.45, 20.85], "vndcch", "Đại đoàn 304 phục kích, cắt Đường 6"]],
    hold: [[105.34, 20.82, "phap"], [105.28, 21.07, "phap"], [105.56, 20.89, "phap"]] },
  dbp: { type: "siege", arrows: [[[103.1, 21.47], [103.04, 21.41], "vndcch", "Đại đoàn 312 đánh Him Lam (13.3)"], [[102.95, 21.5], [103.02, 21.44], "vndcch", "Đại đoàn 308 đánh đồi Độc Lập (15.3)"], [[103.11, 21.37], [103.03, 21.38], "vndcch", "Đại đoàn 316 đánh đồi A1, C1 phía đông"], [[103.03, 21.24], [103, 21.33], "vndcch", "Trung đoàn 57 vây cứ điểm Hồng Cúm"]],
    hold: [[103.01, 21.39, "phap"], [103.04, 21.41, "phap"], [103, 21.33, "phap"]] },
  bx55: { type: "land", arrows: [[[106.7, 10.83], [106.66, 10.75], "vnch", "Quân đội Quốc gia tiến từ Sài Gòn vào Chợ Lớn"], [[106.65, 10.83], [106.68, 10.75], "vnch", "Lính Dù đánh Đại Thế Giới, trường Petrus Ký"], [[106.67, 10.74], [106.85, 10.55], "bx", "Bình Xuyên rút về Rừng Sát"]],
    hold: [[106.68, 10.75, "bx"], [106.85, 10.55, "bx"]] },
  dk60: { type: "uprising", arrows: [[[106.43, 10.04], [106.38, 10.1], "cmlt", "Định Thủy, Phước Hiệp, Bình Khánh nổi dậy (17.1)"], [[106.26, 10.18], [106.33, 10.13], "cmlt", "Lan khắp huyện Mỏ Cày"], [[106.43, 10.22], [106.51, 10.17], "cmlt", "Lan sang Giồng Trôm"], [[106.53, 10.12], [106.6, 10.05], "cmlt", "Lan sang Ba Tri"], [[106.43, 10.02], [106.51, 9.96], "cmlt", "Lan sang Thạnh Phú"]],
    hold: [[106.33, 10.13, "vnch"]] },
  ab63: { type: "land", arrows: [[[106.34, 10.43], [106.19, 10.47], "vnch", "Trực thăng Mỹ chở Trung đoàn 11 từ Tân Hiệp"], [[106.21, 10.35], [106.2, 10.43], "vnch", "Hai chiến đoàn Bảo an tiến từ phía nam"], [[106.12, 10.39], [106.18, 10.44], "vnch", "Đại đội M113 vượt kênh từ phía tây nam"], [[106.66, 10.82], [106.18, 10.43], "vnch", "Tiểu đoàn 8 Dù nhảy dù chiều 2.1"]],
    hold: [[106.2, 10.44, "cmlt"], [106.19, 10.45, "cmlt"]] },
  vb64: { type: "naval", arrows: [[[105.93, 19.37], [106.5, 19.76], "vndcch", "Ba tàu phóng lôi Hải đội 3, Đoàn 135 xuất kích từ Hòn Mê"], [[106.3, 19.2], [106.53, 19.78], "my", "Tàu khu trục Maddox tuần tra DESOTO"], [[107.6, 18.6], [106.45, 19.7], "my", "F-8 từ tàu sân bay Ticonderoga đánh tàu phóng lôi"], [[107.1, 19.05], [107.35, 19.6], "my", "Maddox và Turner Joy, đêm 4.8"]],
    hold: [[105.93, 19.37, "vndcch"]] },
  dn65: { type: "landing", arrows: [[[108.3, 16.28], [108.15, 16.1], "my", "Tiểu đoàn 3/9 TQLC đổ bộ bãi Đỏ (Nam Ô)"], [[108.6, 16.2], [108.2, 16.05], "my", "Tiểu đoàn 1/3 TQLC không vận vào sân bay Đà Nẵng"], [[108.14, 16.11], [108.17, 16.04], "my", "Lên chốt giữ Đồi 327"]],
    hold: [[108.2, 16.04, "my"]] },
  id65: { type: "land", arrows: [[[107.92, 13.62], [107.71, 13.57], "my", "Tiểu đoàn 1/7 Kỵ binh đổ quân bằng trực thăng xuống X-Ray"], [[107.65, 13.49], [107.71, 13.56], "vndcch", "Trung đoàn 66 từ khối núi Chư Prông đánh xuống"], [[107.62, 13.55], [107.7, 13.57], "vndcch", "Các đơn vị Trung đoàn 33 đánh từ phía tây"], [[107.65, 13.66], [107.72, 13.6], "vndcch", "Tiểu đoàn 8 Trung đoàn 66 phục kích ở Albany (17.11)"]],
    hold: [[107.71, 13.57, "my"], [107.72, 13.6, "my"]] },
  mt68: { type: "land", arrows: [[[107.46, 16.44], [107.57, 16.47], "vndcch", "Trung đoàn 6 đánh vào Thành nội, Mang Cá"], [[107.53, 16.36], [107.59, 16.46], "vndcch", "Trung đoàn 4 đánh khu bờ nam sông Hương"], [[106.5, 10.98], [106.65, 10.82], "cmlt", "Quân Giải phóng đánh sân bay Tân Sơn Nhứt"], [[106.52, 10.62], [106.65, 10.76], "cmlt", "Tiến vào Chợ Lớn, trường đua Phú Thọ"]],
    hold: [[107.58, 16.48, "vnch"], [107.59, 16.46, "my"], [106.66, 10.82, "vnch"]] },
  ks68: { type: "siege", arrows: [[[106.62, 16.76], [106.69, 16.69], "vndcch", "Sư đoàn 325C vây các điểm cao phía tây bắc"], [[106.53, 16.61], [106.67, 16.6], "vndcch", "Sư đoàn 304 cùng xe tăng PT-76 đánh Làng Vây (7.2)"], [[106.66, 16.56], [106.72, 16.64], "vndcch", "Sư đoàn 304 siết vòng vây phía tây nam"], [[106.85, 16.7], [106.74, 16.65], "my", "Sư đoàn Kỵ binh 1 giải toả theo Đường 9 (4.1968)"]],
    hold: [[106.73, 16.65, "my"], [106.67, 16.6, "my"]] },
  lk71: { type: "land", arrows: [[[106.73, 16.65], [106.43, 16.64], "vnch", "Lữ đoàn Thiết giáp 1 và Dù theo Đường 9 tới A Lưới"], [[106.73, 16.66], [106.26, 16.69], "vnch", "Sư đoàn 1 đổ bộ trực thăng gần Sê Pôn (6.3)"], [[106.43, 16.85], [106.43, 16.72], "vndcch", "Sư đoàn 308, 320 và xe tăng đánh Ranger Bắc, đồi 31"], [[106.6, 16.4], [106.35, 16.61], "vndcch", "Sư đoàn 2 từ phía nam đánh Lolo, Sophia"]],
    hold: [[106.43, 16.64, "vnch"], [106.41, 16.72, "vnch"], [106.49, 16.74, "vnch"]] },
  qt72: { type: "land", arrows: [[[107, 17.07], [107.08, 16.84], "vndcch", "Cánh bắc vượt Bến Hải, đánh Cồn Tiên – Gio Linh về Đông Hà"], [[106.76, 16.64], [107.13, 16.77], "vndcch", "Sư đoàn 304 theo đường 9, qua Tân Lâm về Ái Tử"], [[107.24, 16.58], [107.18, 16.72], "vnch", "Sư đoàn Dù phản công phía tây đường 1"], [[107.33, 16.64], [107.19, 16.75], "vnch", "Thủy quân lục chiến tái chiếm Thành cổ"]],
    hold: [[107.19, 16.75, "vndcch"], [107.3, 16.63, "vnch"]] },
  lb72: { type: "air", arrows: [[[104.9, 21.85], [105.92, 21.08], "my", "B-52 vào từ tây bắc (đêm 18–20.12)"], [[107.2, 20.45], [105.84, 21], "my", "Các tốp B-52 từ vịnh Bắc Bộ (đêm 26.12)"], [[107.3, 20.65], [106.68, 20.86], "my", "B-52 đánh kho xăng, ga Hải Phòng"]],
    hold: [[105.85, 21.03, "vndcch"], [106.68, 20.86, "vndcch"]] },
  hs74: { type: "naval", arrows: [[[111.4, 16.38], [111.66, 16.44], "vnch", "HQ-4, HQ-5, HQ-16, HQ-10 tiến về Quang Hòa"], [[111.64, 16.4], [111.71, 16.45], "vnch", "Biệt hải đổ bộ đảo Quang Hòa"], [[112.28, 16.78], [111.76, 16.47], "cn", "Tàu 271, 274 từ Phú Lâm xuống, cùng 389, 396 chặn tàu VNCH"], [[111.76, 16.58], [111.62, 16.53], "cn", "Trung Quốc đổ bộ chiếm Hoàng Sa, Hữu Nhật (20.1)"]],
    hold: [[111.61, 16.53, "vnch"], [111.72, 16.45, "cn"]] },
  sg75: { type: "land", arrows: [[[106.64, 11.15], [106.67, 10.8], "vndcch", "Quân đoàn 1 từ hướng bắc, đánh Bộ Tổng tham mưu"], [[106.4, 11.06], [106.65, 10.82], "vndcch", "Quân đoàn 3 qua Đồng Dù, vào Tân Sơn Nhất"], [[106.99, 10.96], [106.71, 10.79], "vndcch", "Quân đoàn 4 qua Biên Hòa, Hố Nai vào nội thành"], [[107.02, 10.7], [106.7, 10.78], "vndcch", "Quân đoàn 2 qua Long Thành, cầu Sài Gòn vào Dinh Độc Lập"]],
    hold: [[106.7, 10.78, "vnch"], [106.66, 10.82, "vnch"]] },
  bmt75: { type: "siege", arrows: [[[107.93, 12.76], [108.03, 12.69], "vndcch", "Trung đoàn 174 và xe tăng đánh từ tây bắc"], [[108.13, 12.8], [108.06, 12.69], "vndcch", "Trung đoàn 95B đánh từ đông bắc"], [[108.1, 12.53], [108.05, 12.66], "vndcch", "Sư đoàn 316 (Trung đoàn 149) đánh từ phía nam"], [[108.3, 12.71], [108.17, 12.69], "vnch", "Sư đoàn 23 phản kích từ Phước An"]],
    hold: [[108.04, 12.67, "vnch"], [108.12, 12.67, "vnch"]] },
  xl75: { type: "siege", arrows: [[[107.22, 11.1], [107.24, 10.95], "vndcch", "Sư đoàn 341 đánh từ hướng bắc"], [[107.4, 10.97], [107.26, 10.94], "vndcch", "Sư đoàn 7 đánh từ hướng đông"], [[107.2, 10.8], [107.15, 10.93], "vndcch", "Sư đoàn 6, Trung đoàn 95B cắt đường 1 ở Hưng Nghĩa – Dầu Giây"], [[106.99, 10.95], [107.13, 10.94], "vnch", "Thiết giáp, biệt động quân tăng viện từ Trảng Bom"]],
    hold: [[107.24, 10.93, "vnch"]] },
  cp79: { type: "land", arrows: [[[105.9, 11.08], [104.95, 11.55], "vndcch", "Quân đoàn 4 theo đường 1 qua Neak Luong"], [[105.46, 12], [104.93, 11.6], "vndcch", "Quân đoàn 3 vượt Mê Kông ở Kampong Cham"], [[104.9, 10.78], [104.9, 11.52], "vndcch", "Quân khu 9, Quân đoàn 2 theo đường 2 qua Takeo"]],
    hold: [[104.92, 11.56, "kh"], [105.28, 11.26, "kh"]] },
  bb79: { type: "land", arrows: [[[106.78, 22.1], [106.76, 21.86], "cn", "Quân đoàn 43, 54, 55 qua Đồng Đăng đánh Lạng Sơn"], [[106.36, 22.92], [106.27, 22.68], "cn", "Cánh bắc qua Trà Lĩnh đánh Cao Bằng"], [[106.62, 22.52], [106.29, 22.66], "cn", "Cánh đông từ Thủy Khẩu qua Tà Lùng"], [[103.88, 22.68], [103.98, 22.45], "cn", "Quân đoàn 13, 14 qua Hà Khẩu đánh Lào Cai"]],
    hold: [[106.76, 21.85, "vndcch"], [106.26, 22.67, "vndcch"], [103.97, 22.49, "vndcch"]] },
  vx84: { type: "land", arrows: [[[104.75, 23.05], [104.82, 22.92], "cn", "Sư đoàn 40 (Quân đoàn 14 TQ) chiếm các điểm cao 1509, 772"], [[104.81, 23.03], [104.9, 22.94], "cn", "Quân Trung Quốc từ Thiên Bảo chiếm điểm cao 1030 bờ đông sông Lô"], [[104.88, 22.8], [104.83, 22.91], "vndcch", "Sư đoàn 356, 316 phản công 772, 685, 233 (12.7.1984)"], [[104.98, 22.84], [104.91, 22.93], "vndcch", "Trung đoàn 141 (Sư đoàn 312) đánh điểm cao 1030"]],
    hold: [[104.82, 22.92, "cn"], [104.87, 22.87, "vndcch"]] },
  gm88: { type: "naval", arrows: [[[114.48, 9.9], [114.3, 9.73], "cn", "Tàu hộ vệ 502, 531, 556 từ hướng đá Tư Nghĩa"], [[114, 9.84], [114.27, 9.72], "vndcch", "HQ-604 từ Cam Ranh đến giữ Gạc Ma"], [[113.88, 10.03], [114.25, 9.77], "vndcch", "HQ-505 từ đá Lớn đến Cô Lin"], [[114.1, 9.1], [114.37, 9.78], "vndcch", "HQ-605 từ đá Đông qua Tốc Tan đến giữ Len Đao"]],
    hold: [[114.28, 9.72, "vndcch"], [114.25, 9.77, "vndcch"], [114.37, 9.78, "vndcch"]] },
};
