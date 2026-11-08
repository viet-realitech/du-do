/* Chế độ Chơi: họ của dòng họ có ý nghĩa. Gia phả mở đầu cho các họ phổ biến, dòng biên niên cho từng hướng ở
   điểm rẽ, các "dấu ấn dòng họ" ở kết cục và lời khép theo họ. Nội dung do đội soạn và kiểm chứng với Wikipedia
   tiếng Việt (10.2026); xem docs/figures-review.md cho phần nhân vật cùng họ. */

export interface SurnameLore {
  /** Khoá ascii (nguyen, tran, hoang…). */
  key: string;
  /** Các cách viết: ['Hoàng', 'Huỳnh']. */
  names: string[];
  /** Hai câu gia phả mở đầu. */
  lore: string;
  /** Biến thể vùng miền / kỵ huý, hoặc ''. */
  variant: string;
  /** Nhân vật trong hồ sơ mang họ này (id FIG). */
  kin: string[];
  /** Biến cố riêng trong trò chơi áp dụng cho họ này: south-spelling · ngo-1963 · royal-1945 · mac-lore · none. */
  hooks: string[];
}

export const SURNAMES: SurnameLore[] = [
  { key: "nguyen", names: ["Nguyễn"], lore: "Ước tính khoảng 38% người Việt mang họ Nguyễn (số liệu thường dẫn năm 2005), tỷ lệ hiếm thấy trên thế giới. Sử chép năm 1232 người họ Lý bị buộc đổi sang Nguyễn vì kiêng huý nhà Trần; nhiều dòng họ khác nhập vào qua các biến động về sau.",
    variant: "", kin: ["ntp", "ntt", "ntr", "ndc", "ntht", "nvv", "nth", "ntmk", "nan", "nl", "nb", "nvx", "nck", "nk", "nht", "ntb", "ntd", "nct", "nvl", "nvt", "hcm", "dm"], hooks: [] },
  { key: "tran", names: ["Trần"], lore: "Ước tính khoảng 11% dân số (thống kê 2005), đứng thứ hai. Nhà Trần (1225–1400) ba lần đẩy lui quân Nguyên Mông; khi Hồ Quý Ly đoạt ngôi, tôn thất Trần bị truy sát, riêng vụ mưu sự năm 1399 hơn 370 người bị giết.",
    variant: "", kin: ["ttk", "tp", "tvg", "tlx", "tvh", "tvk2"], hooks: [] },
  { key: "le", names: ["Lê"], lore: "Ước tính khoảng 9,5% dân số (thống kê 2005), đứng thứ ba. Hai triều đại mang họ này: Tiền Lê (980–1009) và Hậu Lê (1428–1789); Lê Lợi dựng cờ Lam Sơn từ Thanh Hoá, nơi nhiều chi họ Lê lớn vẫn nhận làm quê gốc.",
    variant: "", kin: ["ld", "lhp", "bv"], hooks: [] },
  { key: "pham", names: ["Phạm"], lore: "Ước tính khoảng 7% dân số, đứng thứ tư. Họ Phạm không lập triều đại nào nhưng có mặt đều khắp ba miền, từ võ tướng Phạm Ngũ Lão thời Trần đến các nhà báo, nhạc sĩ, chính khách thế kỷ XX.",
    variant: "", kin: ["pq", "pd", "pvd", "pxa", "ph", "nct2", "ttq"], hooks: [] },
  { key: "hoang", names: ["Hoàng", "Huỳnh"], lore: "Ước tính khoảng 5% dân số, đứng thứ năm. Chữ Hoàng (黃) nghĩa là màu vàng; họ này phổ biến ở người Kinh lẫn người Tày, Nùng vùng Đông Bắc, và ở Nam Kỳ xuất hiện dưới dạng Huỳnh.",
    variant: "Từ Huế trở vào, Hoàng đọc và viết thành Huỳnh để kiêng huý chúa Nguyễn Hoàng (1525–1613); cùng một họ, hai cách viết Bắc – Nam.", kin: ["hht", "hd", "htk", "hps"], hooks: ["south-spelling"] },
  { key: "phan", names: ["Phan"], lore: "Ước tính khoảng 4,5% dân số (thống kê 2005), đứng thứ sáu. Cuối thế kỷ XIX – đầu XX, người họ Phan đứng ở nhiều ngả: Phan Thanh Giản (Bến Tre) chủ hoà, Phan Đình Phùng (Hà Tĩnh) Cần Vương, Phan Châu Trinh (Quảng Nam) duy tân.",
    variant: "", kin: ["ptg", "pdp", "pbc", "pct", "pvk", "ldt", "vvk"], hooks: [] },
  { key: "vu", names: ["Vũ", "Võ"], lore: "Ước tính khoảng 3,9% dân số (thống kê 2005), đứng thứ bảy. Nhiều gia phả họ Vũ ở Bắc Bộ nhận tổ ở làng Mộ Trạch (Hải Dương), \"làng tiến sĩ\" với 36 người đỗ đại khoa thời Lê; từ nam sông Gianh trở vào, họ này viết là Võ.",
    variant: "Vũ (miền Bắc) và Võ (từ Quảng Bình vào) là hai âm đọc của cùng chữ Hán 武; cách đọc Võ có thuyết cho là do kiêng huý Vũ Vương Nguyễn Phúc Khoát (1738–1765).", kin: ["vng", "vcc"], hooks: ["south-spelling"] },
  { key: "dang", names: ["Đặng"], lore: "Ước tính khoảng 2% dân số (thống kê 2005), đứng thứ tám. Làng Hành Thiện (Nam Định), nổi tiếng về khoa bảng, là quê của dòng Đặng Xuân, trong đó có Trường Chinh (tên khai sinh Đặng Xuân Khu, 1907–1988).",
    variant: "", kin: ["tc"], hooks: [] },
  { key: "bui", names: ["Bùi"], lore: "Ước tính khoảng 2% dân số. Bùi là một trong những họ lớn nhất của người Mường (Hoà Bình, Thanh Hoá) và cũng phổ biến ở người Kinh; Bùi Quang Chiêu, lãnh tụ Đảng Lập hiến, xuất thân điền chủ Bến Tre.",
    variant: "", kin: ["bqc"], hooks: [] },
  { key: "do", names: ["Đỗ"], lore: "Ước tính khoảng 1,4% dân số. Thời Trần, Đỗ Khắc Chung được ban quốc tính thành Trần Khắc Chung sau chuyến đi sứ trại quân Nguyên năm 1285; thế kỷ XX, Đỗ Mười là bí danh của Nguyễn Duy Cống (Thanh Trì, Hà Nội).",
    variant: "", kin: [], hooks: [] },
  { key: "ho", names: ["Hồ"], lore: "Ước tính khoảng 1,3% dân số. Hồ Quý Ly lập nhà Hồ (1400–1407) rồi bị quân Minh bắt; làng Quỳnh Đôi (Nghệ An) là đất của một dòng họ Hồ lớn, còn tên Hồ Chí Minh là bí danh của Nguyễn Sinh Cung, không phải họ gốc.",
    variant: "", kin: [], hooks: [] },
  { key: "ngo", names: ["Ngô"], lore: "Ước tính khoảng 1,3% dân số. Ngô Quyền thắng trận Bạch Đằng năm 938, mở đầu kỷ nguyên độc lập; thế kỷ XX, dòng Ngô Đình gốc Quảng Bình, theo Công giáo nhiều đời, nắm chính quyền Sài Gòn từ 1954 đến 1963.",
    variant: "", kin: ["ndd", "ndn", "ndc2"], hooks: ["ngo-1963"] },
  { key: "duong", names: ["Dương"], lore: "Ước tính khoảng 1% dân số. Dương Đình Nghệ làm Tiết độ sứ Tĩnh Hải quân trước Ngô Quyền ở thế kỷ X; thế kỷ XX, tướng Dương Văn Minh, quê Mỹ Tho, là tổng thống cuối cùng của Việt Nam Cộng hoà.",
    variant: "", kin: ["dvm"], hooks: [] },
  { key: "ly", names: ["Lý"], lore: "Nhà Lý (1009–1225) dời đô về Thăng Long, nhưng ngày nay họ Lý chỉ ước tính khoảng 0,5% dân số. Sử chép năm 1232 Trần Thủ Độ bắt người họ Lý đổi sang họ Nguyễn; một chi hậu duệ theo Lý Long Tường sang Cao Ly, nay còn ở Hàn Quốc.",
    variant: "", kin: [], hooks: [] },
  { key: "dinh", names: ["Đinh"], lore: "Đinh Bộ Lĩnh dẹp mười hai sứ quân, lập nhà Đinh (968–980) đóng đô ở Hoa Lư. Ngày nay họ Đinh tập trung ở Ninh Bình, Thanh Hoá và là một họ lớn của người Mường; Đinh Công Tráng, lãnh tụ Ba Đình, quê Hà Nam.",
    variant: "", kin: ["dct"], hooks: [] },
  { key: "truong", names: ["Trương"], lore: "Họ Trương (張) phổ biến khắp cả nước, cả ở người Hoa. Trương Định sinh ở Quảng Ngãi, năm 1844 theo cha vào Nam, rồi mộ dân khai hoang lập đồn điền ở Gò Công — con đường Nam tiến quen thuộc của nhiều gia đình miền Trung thế kỷ XIX.",
    variant: "", kin: ["td", "tvk"], hooks: [] },
  { key: "mac", names: ["Mạc"], lore: "Mạc Đăng Dung lập nhà Mạc (1527–1592); thua Lê – Trịnh, con cháu giữ Cao Bằng đến năm 1677 rồi tan. Họ Mạc ở Hà Tiên của Mạc Cửu là dòng người Hoa Quảng Đông, viết bằng chữ Hán khác (鄚), không cùng gốc.",
    variant: "Nhiều gia phả ghi hậu duệ nhà Mạc đổi sang họ Phạm, Hoàng, Nguyễn, Thái, Bế… để tránh truy sát sau 1592; vài chi họ gần đây xin nhận lại họ Mạc.", kin: [], hooks: ["mac-lore"] },
  { key: "tonthat", names: ["Tôn Thất", "Nguyễn Phúc"], lore: "Nguyễn Phúc là họ của các chúa và vua Nguyễn, từ Nguyễn Hoàng (1558) đến Bảo Đại (1945). Từ thời Minh Mạng, con cháu các chúa không thuộc dòng Gia Long mang họ Tôn Thất, còn dòng vua đặt tên theo bài Đế hệ thi.",
    variant: "Phúc đọc thành Phước (Nguyễn Phước) do kiêng huý; nữ mang họ Tôn Nữ (quy định năm 1829); về sau Tôn Thất, Tôn Nữ được dùng như những họ độc lập, tách khỏi họ Nguyễn.", kin: ["ttt", "tduc", "hn", "bd", "cd"], hooks: ["royal-1945"] },
  { key: "lam", names: ["Lâm"], lore: "Họ Lâm (林) phổ biến ở người Hoa gốc Phúc Kiến, Triều Châu định cư Nam Bộ, đồng thời là họ lâu đời của người Kinh miền Trung. Hoà thượng Thích Quảng Đức có thế danh họ Lâm, sinh ở Khánh Hoà.",
    variant: "", kin: ["tqd"], hooks: [] },
  { key: "trinh", names: ["Trịnh"], lore: "Chúa Trịnh, gốc Vĩnh Lộc (Thanh Hoá), nắm thực quyền Đàng Ngoài bên cạnh vua Lê từ 1545 đến 1787. Ngày nay họ Trịnh vẫn tập trung đông ở Thanh Hoá và đồng bằng Bắc Bộ; nhạc sĩ Trịnh Công Sơn thuộc một nhánh họ Trịnh ở Huế.",
    variant: "", kin: ["tcs"], hooks: [] },
  { key: "cao", names: ["Cao"], lore: "Nhiều gia phả họ Cao nhận tổ là tướng Cao Lỗ thời An Dương Vương. Cuối thế kỷ XIX, Cao Thắng (1864–1893), quê Hương Sơn, Hà Tĩnh, là người chế súng theo kiểu Pháp cho nghĩa quân Hương Khê của Phan Đình Phùng.",
    variant: "", kin: [], hooks: [] },
  { key: "doan", names: ["Đoàn"], lore: "Họ Đoàn gặp nhiều ở Bắc Bộ và Bắc Trung Bộ. Đoàn Thị Điểm (1705–1748), nữ sĩ Hưng Yên, được gắn với bản dịch Chinh phụ ngâm; đầu thế kỷ XX, Đoàn Trần Nghiệp (Ký Con) là yếu nhân Việt Nam Quốc dân đảng.",
    variant: "", kin: [], hooks: [] },
  { key: "luong", names: ["Lương"], lore: "Họ Lương phổ biến ở Bắc Bộ và ở người Tày, Nùng. Lương Văn Can (1854–1927), Thục trưởng Đông Kinh Nghĩa Thục, và con trai Lương Ngọc Quyến, chết trong khởi nghĩa Thái Nguyên 1917, là hai thế hệ của một nhà ở Hà Nội.",
    variant: "", kin: ["lvc"], hooks: [] },
  { key: "ha", names: ["Hà"], lore: "Họ Hà có ở người Kinh và là một trong các họ lớn của người Mường, người Thái vùng Tây Bắc. Hà Huy Tập (1906–1941), quê Hà Tĩnh, Tổng Bí thư thứ ba của Đảng Cộng sản Đông Dương, bị Pháp xử bắn năm 1941.",
    variant: "", kin: [], hooks: [] },
  { key: "ta", names: ["Tạ"], lore: "Họ Tạ ít người nhưng có mặt từ Bắc vào Nam. Thế kỷ XX, Tạ Thu Thâu (Lấp Vò, Long Xuyên cũ), lãnh tụ nhóm Đệ Tứ ở Sài Gòn bị giết năm 1945, và Tạ Quang Bửu (Nghệ An), bộ trưởng của VNDCCH, đi hai ngả rất khác nhau.",
    variant: "", kin: ["ttt2"], hooks: [] },
  { key: "thai", names: ["Thái", "Thới"], lore: "Họ Thái gặp ở người Kinh, người Hoa, và khá đông ở Nghệ An, Quảng Nam. Thái Phiên (1882–1916), người Quảng Nam, cùng Trần Cao Vân mưu khởi nghĩa với vua Duy Tân năm 1916 và bị xử chém ở Huế.",
    variant: "Ở Nam Bộ, Thái thường đọc và viết thành Thới (như trong các địa danh Thới Bình, Thới Lai); cách đọc này thường được giải thích là kiêng huý chúa Nguyễn Phúc Thái (1687–1691).", kin: [], hooks: [] },
];

const norm = (s: string) => s.normalize('NFC').replace(/^họ\s+/i, '').trim().toLowerCase();
/** Khoá họ từ tên người chơi gõ ("Họ Huỳnh" → hoang); '' khi không nhận ra. */
export const surnameKey = (name: string): string => {
  const n = norm(name);
  return SURNAMES.find(s => s.names.some(x => x.toLowerCase() === n))?.key || '';
};
export const loreOf = (key: string): SurnameLore | undefined => SURNAMES.find(s => s.key === key);
/** Tên khai sinh (hay dòng tộc) của những người được biết đến bằng tên khác: vì sao họ đứng trong danh sách "cùng họ". */
export const BORN: Record<string, string> = {
  nl: 'Nguyễn Tường Tam', hcm: 'Nguyễn Sinh Cung', dm: 'Nguyễn Duy Cống', nct2: 'Phạm Văn Cương', ttq: 'Phạm Văn Bồng',
  ldt: 'Phan Đình Khải', vvk: 'Phan Văn Hòa', tc: 'Đặng Xuân Khu', tduc: 'Nguyễn Phúc Hồng Nhậm', hn: 'Nguyễn Phúc Ưng Lịch',
  bd: 'Nguyễn Phúc Vĩnh Thụy', cd: 'hoàng tộc Nguyễn Phúc', tqd: 'Lâm Văn Tuất',
};
/** "khai sinh X" / "hoàng tộc X" cho dòng phụ dưới tên. */
export const bornLine = (id: string): string => (BORN[id] ? (/^hoàng tộc/.test(BORN[id]) ? BORN[id] : 'khai sinh ' + BORN[id]) : '');
/** Tên hiển thị chuẩn: "Họ X". */
export const asFamily = (name: string): string => { const n = name.normalize('NFC').replace(/^họ\s+/i, '').trim(); return n ? 'Họ ' + n[0].toUpperCase() + n.slice(1) : ''; };
/** Cách viết khớp với họ đã gõ (Huỳnh vẫn là Huỳnh dù chung khoá với Hoàng), hoặc cách viết đầu. */
export const spellingOf = (key: string, typed: string): string => { const l = SURNAMES.find(s => s.key === key); if (!l) return ''; const t = norm(typed); return l.names.find(x => x.toLowerCase() === t) || l.names[0]; };

/** Dòng biên niên (gia phả cuối trò chơi) cho mỗi hướng ở điểm rẽ: id hướng → câu quá khứ. */
export const CHRONICLE: Record<string, string> = {
  chien: "Thế hệ 1 theo quân triều đình giữ đồn Liên Trì rồi Chí Hoà; khi triều đình đã ký hoà, vẫn ở lại Nam Kỳ đánh cùng nghĩa quân.",
  canhtan: "Thế hệ 1 theo đường canh tân, dâng điều trần xin mở trường, đóng tàu, gửi người đi học; triều đình phần lớn gác lại.",
  hoa: "Thế hệ 1 theo đoàn sứ thần chủ hoà vào Sài Gòn rồi sang Paris xin chuộc ba tỉnh miền Đông; việc không thành.",
  canvuong: "Thế hệ 2 ứng nghĩa Cần Vương, lên núi Vụ Quang, Yên Thế; hơn mười năm du kích rồi các cuộc khởi nghĩa lần lượt tan rã.",
  dongdu: "Thế hệ 2 xuống tàu sang Yokohama theo phong trào Đông Du; năm 1909 bị Nhật trục xuất theo thoả thuận với Pháp.",
  duytan: "Thế hệ 2 dạy ở Đông Kinh Nghĩa Thục, cắt tóc ngắn, mặc âu phục; trường bị đóng cửa sau vài tháng.",
  cs: "Thế hệ 3 theo Đảng Cộng sản, hoạt động bí mật qua Xô viết Nghệ Tĩnh và nhà tù Côn Đảo, rồi về Pác Bó dựng Việt Minh.",
  qdd: "Thế hệ 3 theo Quốc dân đảng, sống sót sau Yên Bái rồi lưu vong sang Vân Nam; phong trào phân tán nơi đất khách.",
  laphien: "Thế hệ 3 theo đường lập hiến, viết báo và vận động Hội đồng Quản hạt; Pháp nhượng bộ rất ít.",
  vm: "Thế hệ 4 theo Việt Minh lên chiến khu Việt Bắc; chín năm kháng chiến, từ du kích đến những chiến dịch lớn.",
  qg: "Thế hệ 4 làm việc cho Quốc gia Việt Nam từ năm 1949, giữa hai lằn đạn và một nền độc lập còn hạn chế.",
  tl: "Thế hệ 4 không theo phe nào, ở lại vùng xôi đậu: ban ngày một chính quyền, ban đêm một chính quyền khác.",
  bac: "Thế hệ 5 ở lại miền Bắc hoặc tập kết ra Bắc, qua cải cách ruộng đất; có người sau đó đi đường Trường Sơn.",
  nam: "Thế hệ 5 vào Nam năm 1954 hoặc vốn là người Nam, sống qua hai nền cộng hoà và một cuộc chiến ngày càng lớn.",
  thuba: "Thế hệ 5 xuống đường đòi hoà bình ở Sài Gòn cùng thành phần thứ ba; cả hai phía đều nghi ngờ.",
  baocap: "Thế hệ 6 ở lại trong hợp tác xã và biên chế, xếp hàng mua gạo bằng tem phiếu qua những năm lạm phát ba con số.",
  doimoi: "Thế hệ 6 mở một xưởng nhỏ sau năm 1986, làm ăn qua Khoán 10, rồi ASEAN, rồi WTO.",
  radi: "Thế hệ 6 vượt biển, qua trại tị nạn rồi định cư ở Mỹ, Pháp, Úc; sau năm 1995 mới có người về thăm quê.",
};

/** Dấu ấn dòng họ ở kết cục; luật chọn nằm ở play.ts (lineage). */
export interface Archetype { id: string; title: string; text: string }
export const ARCHETYPES: Archetype[] = [
  { id: "doiho", title: "Dòng họ đổi tên giữ gốc", text: "Dòng họ bạn từng đổi tên để qua một cơn biến, rồi giữ cả tên cũ lẫn tên mới trong gia phả. Nhiều dòng họ Việt Nam cũng mang một cái tên khác với tên tổ tiên vì những lý do tương tự." },
  { id: "haique", title: "Dòng họ hai quê", text: "Một nhánh của dòng họ bạn rời đất nước sau 1975 và dựng lại đời sống ở nơi khác. Từ 1995 hai nhánh gặp lại nhau; mộ tổ ở quê và bàn thờ ở xứ người cùng ghi một tên họ." },
  { id: "thuandong", title: "Dòng họ thuận dòng", text: "Qua năm điểm rẽ, dòng họ bạn đều đứng về hướng sau này chiếm ưu thế. Gia phả vì thế đi cùng nhịp với sử chính thống, nhưng ít ghi lại những ngả đường mà nhiều người Việt khác đã đi." },
  { id: "trungkien", title: "Dòng họ trung kiên", text: "Dòng họ bạn giữ một hướng đi qua ít nhất bốn thế hệ, dù hướng ấy có lúc thắng, có lúc thua. Cái giá và phần được của sự nhất quán đều hiện rõ trong gia sản để lại." },
  { id: "dunggiua", title: "Dòng họ đứng giữa", text: "Dòng họ bạn thường chọn thương thuyết, cải cách hay đứng ngoài hơn là cầm súng. Sử sách ít ghi tên những người như thế, dù họ chiếm phần đông trong mỗi làng." },
  { id: "nhieunga", title: "Dòng họ rẽ nhiều ngả", text: "Nhiều thế hệ của dòng họ bạn chọn một ngả khác cha ông. Gia phả vì thế ghi những người đi những con đường rất khác nhau, có khi ở hai bên một chiến tuyến, điều không hiếm trong các gia đình Việt Nam thế kỷ XX." },
  { id: "thuong", title: "Một dòng họ Việt Nam", text: "Dòng họ bạn đi qua sáu thế hệ không theo một khuôn nào rõ rệt, như phần lớn các gia đình Việt Nam. Gia phả ghi đủ người cầm súng, người đi học và người ở lại giữ ruộng." },
];

/** Lời khép theo họ ở kết cục: khoá họ → một câu. */
export const EPILOGUES: Record<string, string> = {
  nguyen: "Nguyễn vẫn là họ đông nhất nước, ước khoảng 38% dân số: cứ ba người Việt thì có hơn một người mang họ này.",
  tran: "Trần là họ đông thứ hai (khoảng 11%); hai Chủ tịch nước sau Đổi Mới, Trần Đức Lương và Trần Đại Quang, cùng mang họ này.",
  le: "Lê là họ đông thứ ba (khoảng 9–10%); sau Đổi Mới có Chủ tịch nước Lê Đức Anh và Tổng Bí thư Lê Khả Phiêu.",
  pham: "Phạm là họ đông thứ tư (khoảng 7%); ba người đứng đầu chính phủ mang họ này: Phạm Văn Đồng, Phạm Hùng và Phạm Minh Chính.",
  hoang: "Hoàng và Huỳnh vốn một họ: Đàng Trong kiêng tên chúa Nguyễn Hoàng nên đọc thành Huỳnh; gộp lại chiếm khoảng 5% dân số.",
  phan: "Phan chiếm khoảng 4–5% dân số; Phan Văn Khải, Thủ tướng 1997–2006, là Thủ tướng Việt Nam đầu tiên thăm chính thức Mỹ (2005).",
  vu: "Vũ ở miền Bắc và Võ ở miền Nam là cùng một họ, viết cùng chữ Hán 武; gộp lại chiếm khoảng 4% dân số.",
  dang: "Đặng chiếm khoảng 2% dân số; Đặng Thái Sơn, người châu Á đầu tiên thắng cuộc thi Chopin (1980), vẫn biểu diễn và giảng dạy khắp thế giới.",
  bui: "Bùi chiếm khoảng 2% dân số; tranh phố cổ Hà Nội của Bùi Xuân Phái (1920–1988) nay thuộc hàng được sưu tập nhiều nhất của hội hoạ Việt Nam.",
  do: "Đỗ chiếm khoảng 1–2% dân số; Đỗ Mười, Tổng Bí thư 1991–1997, cầm lái giai đoạn bình thường hoá với Trung Quốc (1991) và Mỹ (1995).",
  ho: "Hồ chiếm khoảng 1% dân số. Người mang họ này nổi tiếng nhất, Hồ Chí Minh, sinh ra là Nguyễn Sinh Cung và đổi tên nhiều lần trong đời.",
  ngo: "Ngô chiếm khoảng 1% dân số; Ngô Bảo Châu, Huy chương Fields 2010, là nhà toán học Việt Nam đầu tiên nhận giải này.",
  duong: "Dương chiếm khoảng 1% dân số; sử gia Dương Trung Quốc, Tổng Thư ký Hội Khoa học Lịch sử Việt Nam, là đại biểu Quốc hội bốn khoá (2002–2021).",
  ly: "Lý nay chỉ còn khoảng 0,5% dân số: năm 1232 nhà Trần bắt người họ Lý đổi sang họ Nguyễn, một lần đổi họ hàng loạt còn ghi trong sử.",
  dinh: "Đinh là họ của vị vua đặt quốc hiệu Đại Cồ Việt; cố đô Hoa Lư của Đinh Tiên Hoàng nay nằm trong quần thể Tràng An, di sản thế giới từ 2014.",
  truong: "Trương có Trương Tấn Sang làm Chủ tịch nước 2011–2016 và Trương Mỹ Hoa làm Phó Chủ tịch nước 2002–2007.",
  mac: "Sau khi nhà Mạc đổ, con cháu đổi sang hàng chục họ khác để tránh truy sát; ngày nay Hội đồng Mạc tộc Việt Nam quy tụ lại các nhánh ấy.",
  tonthat: "Tôn Thất dành cho con cháu các chúa Nguyễn ngoài dòng vua, nữ là Tôn Nữ; nay vẫn nhiều người giữ, như nhà ngoại giao Tôn Nữ Thị Ninh.",
  lam: "Lâm là họ của nhiều người gốc Hoa (chữ 林) và nhiều người Khmer Nam Bộ, cùng các họ Thạch, Sơn, Danh, Kim mà sử liệu chưa rõ gốc tích.",
  trinh: "Trịnh là họ của Trịnh Công Sơn (1939–2001); nhạc ông vẫn được hát khắp nước, tên ông được đặt cho đường phố ở Huế (2011) và Hà Nội (2015).",
  cao: "Cao là họ của nhà ngôn ngữ học Cao Xuân Hạo (1930–2007), người đặt nền cho ngữ pháp chức năng tiếng Việt; chữ Hán 高, cùng chữ với họ Gao.",
  doan: "Đoàn là họ của Đoàn Giỏi (1925–1989); 'Đất rừng phương Nam' của ông được dựng thành phim truyền hình năm 1997 và phim điện ảnh năm 2023.",
  luong: "Lương là họ của nhà nông học Lương Định Của (1920–1975); từ 2006, Trung ương Đoàn trao giải thưởng mang tên ông cho nông dân trẻ mỗi năm.",
  ha: "Hà viết chữ Hán 何, cùng chữ với họ He, một trong 20 họ đông nhất Trung Quốc; ở Việt Nam, Hà là một họ nhỏ, dưới 1% dân số.",
  ta: "Tạ là họ của Tạ Quang Bửu (1910–1986); Giải thưởng Tạ Quang Bửu của Bộ Khoa học và Công nghệ trao cho nghiên cứu cơ bản từ năm 2014.",
  thai: "Thái là một họ nhỏ; nghệ sĩ dương cầm Thái Thị Liên (1918–2023), người đồng sáng lập Trường Âm nhạc Việt Nam, là mẹ của Đặng Thái Sơn.",
};

/** Mô tả ngắn các biến cố riêng, cho gia phả mở đầu. */
export const HOOK_TEXT: Record<string, string> = {
  'south-spelling': 'Nếu di cư vào Nam năm 1954, dòng họ sẽ đứng trước cách viết họ của người miền Nam.',
  'ngo-1963': 'Sau đảo chính tháng 11.1963, một gia đình họ Ngô sẽ bị dò hỏi có bà con với nhà Ngô Đình hay không.',
  'royal-1945': 'Mùa thu 1945, dòng dõi hoàng tộc phải chọn giữ hay bỏ tên dòng.',
  'mac-lore': 'Tổ tiên họ Mạc từng đổi họ để tránh truy bức sau năm 1592; dòng họ bạn mang ký ức ấy.',
};
