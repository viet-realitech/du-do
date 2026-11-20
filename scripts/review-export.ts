/* Bộ phiếu rà soát nội dung cho người rà soát sử học: npm run review:export
   Đọc nội dung ngay từ mã (src/data và các hàm sinh câu của trò chơi), ghi vào docs/review/:
   - bang-a-rui-ro-cao.csv: khoảng một trăm mấy chục dòng rủi ro nhất (số liệu, lời trích, đề tài nhạy cảm, góc nhìn
     VNCH & hải ngoại, giả định "Nếu…" kèm %, câu mới đánh dấu cần kiểm), cho một ngày làm việc của người rà soát;
   - bang-day-du.csv: mọi câu có nội dung lịch sử, chia hạng A (rủi ro cao), B (phần lịch sử còn lại), C (phần hư cấu
     của Trò chơi đặt trong bối cảnh có thật);
   - nhay-cam.md: các câu chạm đề tài nhạy cảm, xếp theo đề tài, nguyên văn, cho người rà soát và luật sư;
   - README.md: thư ngắn cho người rà soát (ứng dụng là gì, cần kiểm gì, điền phiếu thế nào).
   CSV có BOM UTF-8 và xuống dòng CRLF để Excel, Google Sheets đọc đúng dấu tiếng Việt. Cột "Mã" không đổi giữa các lần
   xuất, để phiếu đã điền ghép lại được với bản mới. Chạy lại sau mỗi lần sửa nội dung; `-- --check` chỉ so, thoát mã 1
   nếu docs/review/ đã cũ. Chưa có bước nhập phiếu đã điền ngược vào mã: việc ấy chờ khi đã có người rà soát. */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import DD from '../src/data/data2.js';
import { EV, ERAS, SRC, FIG, QUIZ, P, DIARY_R, type HistEvent } from '../src/data';
import { CARDS, VARIANT, type Choice, type Variant } from '../src/data/cards';
import { SPECIAL } from '../src/data/cards2';
import { ENDINGS, CFS, CF_METHOD, ABROAD6, estimate } from '../src/data/endings';
import { SURNAMES, CHRONICLE, EPILOGUES, HOOK_TEXT, BORN } from '../src/data/surnames';
import { SCENES, MOVES, sideName } from '../src/data/scenes';
import { chronVariants, outVariants } from '../src/voiced';
import { voiceRows } from './voice-lines';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const OUT = join(ROOT, 'docs', 'review');
const CHECK = process.argv.includes('--check');

type Tier = 'A' | 'B' | 'C';
/** hist: nội dung trình bày như sử (sự kiện, điểm rẽ, nhân vật, câu đố…); fact: dữ kiện của phần họ tộc (tỷ lệ, người
    nổi tiếng); play: lời hư cấu của Trò chơi. */
type Cls = 'hist' | 'fact' | 'play';
interface Row {
  id: string; cls: Cls; kind: string; year: string; where: string; text: string; src: string; check: string[];
  /** Đoạn để tìm vị trí trong mã (mặc định: chính câu). */
  needle?: string; file?: string;
  /** Sự kiện của dòng (để xét đề tài theo sự kiện). */
  ev?: string; persp?: string;
  tier?: Tier; why?: string[]; topics?: string[]; voiced?: string; loc?: string;
  /** Bảng A: 1 = làm trước (khoảng một ngày), 2 = nếu còn thời gian. */
  pri?: 1 | 2;
}
const rows: Row[] = [];
const add = (r: Row) => { rows.push(r); return r; };

/* ---------- đề tài nhạy cảm: theo sự kiện, theo chữ ---------- */
interface Hot { key: string; name: string; ev: string[]; re: RegExp; core: boolean; note: string }
/** `core`: đề tài mà mọi câu lịch sử của nó vào bảng A (danh sách của lộ trình); còn lại chỉ vào danh sách nhạy cảm. */
const HOT: Hot[] = [
  { key: 'ccrd', name: 'Cải cách ruộng đất (1953–1956)', ev: ['cc53'], core: true, re: /cải cách ruộng đất|đội cải cách|giảm tô|thoái tô|đấu tố|địa chủ|sửa sai|quy thành phần/i,
    note: 'Số người bị xử, cách gọi "sai lầm", "sửa sai"; không quy chụp tập thể.' },
  { key: 'hue68', name: 'Mậu Thân 1968 và thảm sát Huế', ev: ['mt68'], core: true, re: /Mậu Thân|thảm sát Huế|Tết 1968/i,
    note: 'Khoảng số nạn nhân và nguồn của mỗi mức; ai chịu trách nhiệm theo các phía.' },
  { key: 'caitao', name: 'Học tập cải tạo sau 1975', ev: ['tn76'], core: true, re: /học tập cải tạo|trại cải tạo|đi cải tạo|trình diện/i,
    note: 'Quy mô (số người, số năm), cách gọi; không giảm nhẹ, không cường điệu.' },
  { key: 'nhanvan', name: 'Nhân Văn – Giai Phẩm', ev: ['nv56'], core: true, re: /Nhân Văn|Giai Phẩm/i,
    note: 'Ai bị kỷ luật, mức nào; cách gọi vụ việc.' },
  { key: 'thuyennhan', name: 'Di tản, thuyền nhân, nạn kiều, ra đi có trật tự', ev: ['tn80', 'ct78'], core: true, re: /di tản|thuyền nhân|vượt biên|vượt biển|tị nạn|Ra đi có trật tự|ODP|bán chính thức|nạn kiều|người gốc Hoa/i,
    note: 'Số người ra đi, số chết trên biển (khoảng, có nguồn); lý do ra đi theo các phía.' },
  { key: 'bg79', name: 'Chiến tranh 1979: biên giới Tây Nam, biên giới phía Bắc, Vị Xuyên', ev: ['cp79', 'bb79', 'vx84'], core: true, re: /biên giới phía Bắc|biên giới Tây Nam|Khmer Đỏ|Vị Xuyên|tổng động viên|Pol Pot/i,
    note: 'Thương vong hai phía (khoảng, có nguồn); cách gọi cuộc chiến theo từng phía.' },
  { key: 'bien', name: 'Chủ quyền biển đảo và biên giới', ev: ['hs74', 'gm88', 'hd14', 'pca16', 'vbb00', 'bg99'], core: true, re: /Hoàng Sa|Trường Sa|Gạc Ma|Biển Đông|đường chín đoạn|giàn khoan|Vịnh Bắc Bộ|chủ quyền|UNCLOS|Toà Trọng tài/i,
    note: 'Tên gọi, ngày, số người chết; lập trường chủ quyền của Việt Nam được nêu đúng; quan điểm Trung Quốc chỉ là lời tóm lược.' },
  { key: 'vnch', name: 'Quốc gia Việt Nam, VNCH và người Việt hải ngoại', ev: ['el49', 'vc55', 'dc63'], core: false, re: /VNCH|Việt Nam Cộng hoà|Quốc gia Việt Nam|hải ngoại|Việt kiều|Ngô Đình|Nguyễn Văn Thiệu|chính quyền Sài Gòn|Quân đội Quốc gia/i,
    note: 'Cách gọi chính thể, quân đội, người ra đi; công bằng với cả hai miền.' },
  { key: 'lanhtu', name: 'Hồ Chí Minh và Đảng Cộng sản', ev: ['tn25', 'cs30', 'hcm69'], core: false, re: /Hồ Chí Minh|Nguyễn Ái Quốc|Nguyễn Sinh Cung|Nguyễn Tất Thành|Đảng Cộng sản|Đảng Lao động|Tổng Bí thư/i,
    note: 'Đúng sử liệu, giọng trung tính; các chi tiết còn tranh luận (vd. vụ Phan Bội Châu bị bắt năm 1925) ghi rõ là còn tranh luận.' },
  { key: 'baocap', name: 'Bao cấp, cải tạo công thương nghiệp, Đổi Mới', ev: ['ct78', 'dm86'], core: false, re: /bao cấp|tem phiếu|sổ gạo|ngăn sông cấm chợ|đổi tiền|Đổi Mới|khoán|lạm phát|cải tạo công thương|tập đoàn sản xuất/i,
    note: 'Số liệu kinh tế (lạm phát, đổi tiền), cách tả đời sống; không bôi đen, không tô hồng.' },
  { key: 'tongiao', name: 'Tôn giáo', ev: ['qd63'], core: false, re: /Phật giáo|tự thiêu|Thích Quảng Đức|Công giáo|giáo dân|Cao Đài|Hoà Hảo|hội thánh/i,
    note: 'Cách tả xung đột tôn giáo, công bằng với các phía.' },
  { key: 'neu', name: 'Giả định "Nếu…" và ước lượng %', ev: [], core: true, re: /^$/,
    note: 'Mức A–D, % quy đổi và căn cứ; lời giả định không nói con đường nào "tốt hơn".' },
];
const HOT_BY = Object.fromEntries(HOT.map(h => [h.key, h]));

/* ---------- câu mới đánh dấu cần kiểm (đợt F đã gộp; đợt G đang sửa song song, chữ có thể còn đổi khi gộp) ---------- */
/** `id`: mã dòng (đuôi '*' = mọi mã bắt đầu như thế); `has`: hay một đoạn chữ có trong câu. */
interface Mark { id?: string; has?: string; wave: 'F' | 'G'; note: string }
const MARKS: Mark[] = [
  // đợt F: lối ra đi của cả nhà (thẻ tn80, x-ly79), lời theo miền
  { wave: 'F', id: 'card:tn80{regions=B+T1}:0', note: 'Ghe từ Hải Phòng, Quảng Ninh men bờ biển lên Hồng Kông: tuyến đường và thời gian đi (gần ba tuần).' },
  { wave: 'F', id: 'card:tn80{regions=B+T1}:2', note: 'Người tị nạn ở các trại Hồng Kông được Anh nhận định cư (khoảng 1979–1982).' },
  { wave: 'F', id: 'card:tn80{regions=NE+NW}:0', note: 'Trại Galang (Indonesia) mở năm 1979; người cập các đảo Anambas, Natuna được chuyển về Galang; ghe đi khoảng năm ngày.' },
  { wave: 'F', id: 'card:tn80{flags=ly79Di}:0', note: 'Canada nhận người theo diện đoàn tụ (ODP) từ 1979–1980; mốc năm 1986 có hợp lý không.' },
  { wave: 'F', id: 'card:tn80{flags=ly79Di}:1', note: 'Trại ở Hồng Kông là trại mở cho tới chính sách trại đóng tháng 7.1982; người tị nạn được ra phố làm thuê.' },
  { wave: 'F', id: 'card:bb79{regions=T2+NE+NW}:0', note: 'Lệnh tổng động viên ngày 5.3.1979; thanh niên miền Nam phần lớn được đưa sang mặt trận Campuchia.' },
  { wave: 'F', id: 'card:bb79{regions=T2+NE+NW;after=cp79=0}:0', note: 'Lệnh tổng động viên ngày 5.3.1979; thanh niên miền Nam phần lớn được đưa sang mặt trận Campuchia.' },
  { wave: 'F', id: 'card:bb79{regions=T2+NE+NW}:1', note: 'Trung Quốc tuyên bố rút quân ngày 5.3.1979, rút xong ngày 16.3; việc rà soát người gốc Hoa ở miền Nam.' },
  { wave: 'F', id: 'card:bb79{regions=T2+NE+NW;after=cp79=0}:1', note: 'Trung Quốc tuyên bố rút quân ngày 5.3.1979, rút xong ngày 16.3; việc rà soát người gốc Hoa ở miền Nam.' },
  { wave: 'F', id: 'card:cc53{special=x-diachu53}:2', note: 'Đợt phát động quần chúng giảm tô, thoái tô 1953–1954 (Hà Nội, phần lớn Nam Định giảm tô sau khi tiếp quản 1954).' },
  { wave: 'F', id: 'chr:chr-duytan-t', note: 'Phan Châu Trinh bị đày ra Côn Đảo sau phong trào chống thuế Trung Kỳ năm 1908.' },
  { wave: 'F', id: 'chr:chr-duytan-s', note: 'Trần Chánh Chiếu (Gilbert Chiếu) bị bắt cuối năm 1908, được thả năm 1909; khách sạn Minh Tân ở Mỹ Tho, Sài Gòn là nơi gặp gỡ, quyên góp; Lục tỉnh tân văn là tờ báo của phong trào.' },
  { wave: 'F', has: 'góp vốn vào một hội buôn của phong trào Minh Tân', note: 'Người từng dạy Đông Kinh Nghĩa Thục (đóng cửa 12.1907) về Nam Kỳ theo phong trào Minh Tân: mốc thời gian có khớp không.' },
  { wave: 'F', has: 'mở lớp dạy chữ Quốc ngữ theo phong trào Duy Tân ở Trung Kỳ', note: 'Người từng dạy Đông Kinh Nghĩa Thục (đóng cửa 12.1907) về quê theo phong trào Duy Tân ở Trung Kỳ: mốc thời gian có khớp không.' },
  { wave: 'F', id: 'chr:laphien', note: 'Hội đồng Quản hạt là hội đồng của riêng Nam Kỳ (Đảng Lập hiến của Bùi Quang Chiêu); Bắc Kỳ, Trung Kỳ có Viện Dân biểu (1926). Câu hiện cho nhà ở mọi miền: tách theo miền hay giữ một câu?' },
  { wave: 'F', id: 'cf:laphien', note: 'Cùng câu hỏi về Hội đồng Quản hạt (chỉ ở Nam Kỳ).' },
  { wave: 'F', id: 'diary:d-baocap0-t', note: 'Chia thóc theo công điểm, độn khoai sắn ở miền Trung khoảng năm 1980.' },
  { wave: 'F', id: 'diary:d-baocap0-n', note: 'Bo bo, bột mì bán theo sổ gạo và các trạm kiểm soát thời "ngăn sông cấm chợ" quanh năm 1980.' },
  { wave: 'F', id: 'diary:d-baocap1-t', note: 'Đổi tiền tháng 9.1985: mười đồng cũ lấy một đồng mới.' },
  { wave: 'F', id: 'diary:d-baocap1-n', note: 'Ba lần đổi tiền ở miền Nam: 9.1975, 5.1978, 9.1985.' },
  { wave: 'F', id: 'diary:d-doimoi0-t', note: 'Khoán 10 (4.1988) giao ruộng cho hộ.' },
  { wave: 'F', id: 'diary:d-doimoi0-n', note: 'Sau Khoán 10, nông dân đồng bằng sông Cửu Long làm đơn đòi lại đất đã đưa vào tập đoàn sản xuất.' },
  // đợt G (P08, P11): sửa sự thật, góc nhìn VNCH và góc nhìn thứ hai, mất mát không được trả công
  { wave: 'G', id: 'era:e4:hist', note: 'Điện Biên Phủ thất thủ 7.5.1954; Hội nghị Genève đã được quyết định triệu tập ở Hội nghị Berlin (2.1954), phiên về Đông Dương mở 8.5.1954. Câu không được nói Điện Biên Phủ "buộc" Pháp vào Genève.' },
  { wave: 'G', id: 'ev:dbp:v:intl', note: 'Nhận định "lần đầu một dân tộc thuộc địa đánh bại một đạo quân châu Âu trong trận quy ước lớn": nên gán cho "nhiều sử gia"; có thể bị phản bác (trận Annual 1921).' },
  { wave: 'G', id: 'ev:pt84:v:cn*', note: 'Góc nhìn Trung Quốc: theo Hiệp ước Thiên Tân (5.1884) nhà Thanh đã hứa tôn trọng các hiệp ước Pháp – Việt; chiến tranh bùng sau vụ Bắc Lệ (6.1884). Trước đợt G có hai dòng trùng nhau.' },
  { wave: 'G', id: 'ev:yb30:qt', note: 'Hai dị bản "Không thành công thì thành nhân" và "Không thành công cũng thành nhân"; tập nào của bộ Lịch sử Việt Nam chép câu này.' },
  { wave: 'G', id: 'ev:sg75:n:0', note: 'Mức cao 3,8 triệu theo Obermeyer và cộng sự (BMJ 2008: người chết vì bạo lực chiến tranh ở Việt Nam 1955–2002); mức thấp 1,3 triệu chưa có nguồn.' },
  { wave: 'G', id: 'ev:sg75:n:1', note: '58.220 là tổng số quân nhân Mỹ chết (NARA), khoảng 47.434 chết do giao chiến: không gọi cả 58.220 là "tử trận".' },
  { wave: 'G', id: 'src:bthmy95', note: 'Hồ sơ nguồn mới: tên văn bản, người ký, ngày, nơi lưu giữ.' },
  { wave: 'G', id: 'src:asean95', note: 'Hồ sơ nguồn mới: tên văn bản, ngày, nơi lưu giữ.' },
  { wave: 'G', id: 'src:vbb2000', note: 'Hồ sơ nguồn mới: tên hiệp định, ngày ký 25.12.2000, ngày hiệu lực 30.6.2004.' },
  { wave: 'G', id: 'src:wto2006', note: 'Hồ sơ nguồn mới: ngày Đại hội đồng WTO chấp thuận (7.11.2006), thành viên thứ 150 từ 11.1.2007.' },
  { wave: 'G', id: 'src:bngvn', note: 'Hồ sơ nguồn mới ở mức bộ sưu tập: nên ghi ngày từng tuyên bố (giàn khoan 981, phán quyết 2016).' },
  { wave: 'G', id: 'src:pca2016', note: 'Hồ sơ nguồn mới: tên vụ, số vụ 2013-19, ngày 12.7.2016, tóm tắt phán quyết; Việt Nam không phải một bên.' },
  ...['hn95', 'vbb00', 'hd14', 'pca16', 'wto07', 'tk46'].map(id => ({ wave: 'G' as const, id: `ev:${id}:t`, note: 'Nguồn dẫn cho sự kiện này từng không che được nội dung (đợt G trỏ lại nguồn): nguồn hiện ghi có thật sự chép sự kiện này không.' })),
  { wave: 'G', id: 'ev:dbp:v:vnch', note: 'Tiểu đoàn 5 Nhảy dù Việt Nam nhảy xuống Điện Biên Phủ ngày 14.3.1954.' },
  { wave: 'G', id: 'ev:ab63:v:vnch', note: 'Quân Giải phóng rút trong đêm 2 rạng 3.1.1963; Sài Gòn (và tướng Harkins) gọi trận là thắng lợi.' },
  { wave: 'G', id: 'ev:ks68:v:vnch', note: 'Tiểu đoàn 37 Biệt động quân giữ mặt đông căn cứ từ cuối tháng 1.1968.' },
  { wave: 'G', id: 'ev:lb72:v:vnch', note: 'Tổng thống Thiệu phản đối dự thảo hiệp định 10.1972 chủ yếu vì quân miền Bắc được ở lại miền Nam; thái độ của Sài Gòn với chính đợt ném bom cần xác nhận.' },
  { wave: 'G', id: 'ev:hcm69:v:vnch', note: 'Cách Sài Gòn hiểu "Việt Nam hoá chiến tranh".' },
  { wave: 'G', id: 'ev:ts59:v:vnch', note: 'Lập trường chính thức của VNCH (và sách trắng Mỹ 1965); "các hiệp định Genève" là 1954 và 1962 (về Lào).' },
  { wave: 'G', id: 'ev:nv56:v:vnch', note: 'Cách phía VNCH và hải ngoại dẫn vụ Nhân Văn – Giai Phẩm.' },
  { wave: 'G', id: 'ev:vb64:v:vnch', note: 'Nguyễn Khánh phát động khẩu hiệu "Bắc tiến" tháng 7.1964.' },
  { wave: 'G', id: 'ev:bd86:v:fr', note: 'Khoảng 3.500 quân Pháp có pháo binh, vây Ba Đình từ 12.1886 tới 20.1.1887.' },
  { wave: 'G', id: 'ev:hk96:v:fr', note: 'Cách sử liệu Pháp gọi việc dẹp Hương Khê ("bình định").' },
  { wave: 'G', id: 'ev:tn25:v:intl', note: 'Nguyễn Ái Quốc tới Quảng Châu 11.1924, làm phiên dịch cho phái đoàn Borodin. Đề tài nhạy cảm: câu chỉ nói bối cảnh, không nói về vụ Phan Bội Châu bị bắt.' },
  { wave: 'G', id: 'ev:nk40:v:fr', note: 'Pháp đàn áp Nam Kỳ khởi nghĩa bằng quân đội, cả máy bay ném bom; số người bị bắt.' },
  { wave: 'G', id: 'ev:vb44:v:us', note: 'Toán OSS "Con Nai" (Deer Team) nhảy dù xuống Tân Trào ngày 16.7.1945.' },
  { wave: 'G', id: 'ev:vbb00:v:intl', note: 'Đề tài nhạy cảm: chọn một câu quốc tế trung tính, không viết góc nhìn Trung Quốc; hiệp định có dẫn UNCLOS 1982 trong lời mở đầu.' },
  { wave: 'G', id: 'ev:st25:v:intl', note: 'Đề tài nhạy cảm: tranh luận về tên gọi mới và bản sắc các tỉnh cũ sau sáp nhập.' },
  { wave: 'G', has: 'vùng Quân đội Nhân dân Việt Nam kiểm soát', note: 'Quảng Trị về tay QĐND Việt Nam từ 1.5.1972; lời của trò chơi tránh chữ mang lập trường ("vùng giải phóng").' },
  { wave: 'G', has: 'Xã về tay những người nổi dậy', note: 'Mặt trận Dân tộc Giải phóng ra đời 12.1960, sau Đồng khởi (1.1960); lời trung tính (bỏ "tề", "vùng giải phóng").' },
  { wave: 'G', id: 'scene:cd61:1', note: 'Theo Pallu de la Barrière, ngày 25.2.1861 liên quân vòng lên đánh mặt bắc đại đồn; cánh phải có phải là bộ binh Tây Ban Nha không.' },
  { wave: 'G', id: 'scene:cd61:2', note: 'Cánh trái (công binh, thủy quân lục chiến, khinh binh) đánh vào mặt bắc đại đồn ngày 25.2.1861.' },
];

/** Mã ngắn từ mấy chữ đầu của câu (bỏ dấu), cho các câu không có khoá riêng trong mã. */
const slug = (t: string) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().split(' ').slice(0, 8).join('-');

/* ---------- nguồn ---------- */
const srcTitle = (id: string) => { const s = SRC.find(x => x.id === id); return s ? `${s.t} (${s.y})` : id; };
const srcList = (ids: string[]) => ids.map(srcTitle).join('; ');
const NO_SRC = 'Không gắn nguồn riêng';
const FICTION = 'Hư cấu của trò chơi (bối cảnh có thật)';

/* ---------- 1. sự kiện ---------- */
const era = (y: number) => ERAS.filter(e => e.cy <= y).pop() || ERAS[0];
const eraOf = (v: HistEvent) => (v.era ? ERAS.find(e => e.id === v.era)! : era(v.y));
for (const v of EV) {
  const ch = `Chương ${eraOf(v).n}`, src = srcList(v.src), y = String(v.y);
  add({ id: `ev:${v.id}:t`, cls: 'hist', kind: 'tiêu đề, ngày, nơi', year: y, ev: v.id, where: `${ch} · trang sự kiện · tiêu đề, ngày, nơi chốn`,
    text: `${v.t} · ${v.d} · ${v.p}`, needle: v.s, src, check: ['Tên gọi sự kiện, ngày tháng, nơi chốn.'] });
  add({ id: `ev:${v.id}:s`, cls: 'hist', kind: 'tóm tắt', year: y, ev: v.id, where: `${ch} · trang sự kiện › Diễn biến · câu đầu (cũng hiện ở thẻ dưới bản đồ, trong tour)`,
    text: v.s, src, check: ['Sự việc, ngày tháng, con số, tên người trong câu.'] });
  if (v.x) add({ id: `ev:${v.id}:x`, cls: 'hist', kind: 'diễn biến', year: y, ev: v.id, where: `${ch} · trang sự kiện › Diễn biến · đoạn thêm`,
    text: v.x, src, check: ['Sự việc, ngày tháng, con số, tên người trong đoạn.'] });
  const seen: Record<string, number> = {};
  for (const [pp, tx] of v.v) {
    seen[pp] = (seen[pp] || 0) + 1;
    add({ id: `ev:${v.id}:v:${pp}${seen[pp] > 1 ? ':' + seen[pp] : ''}`, cls: 'hist', kind: 'góc nhìn (tóm lược)', year: y, ev: v.id, persp: pp,
      where: `${ch} · trang sự kiện › Góc nhìn · ${P[pp] || pp}`, text: tx, src: `${NO_SRC} (lời tóm lược của ứng dụng)`,
      check: [`Lời tóm lược của ứng dụng, không phải trích dẫn: có đúng và công bằng với cách "${P[pp] || pp}" nhìn sự kiện không?`] });
  }
  if (v.qt) add({ id: `ev:${v.id}:qt`, cls: 'hist', kind: 'trích dẫn', year: y, ev: v.id, where: `${ch} · trang sự kiện › Diễn biến · khối trích dẫn`,
    text: `“${v.qt.t}” — ${v.qt.by}`, needle: v.qt.t, src: srcTitle(v.qt.src), check: ['Nguyên văn, người nói hay văn bản, ngày; bản dịch (nếu có) có đúng; nguồn ứng dụng dẫn có chép câu này không.'] });
  (v.n || []).forEach(([a, b], i) => add({ id: `ev:${v.id}:n:${i}`, cls: 'hist', kind: 'số liệu', year: y, ev: v.id, where: `${ch} · trang sự kiện › Diễn biến · bảng số liệu`,
    text: `${a}: ${b}`, needle: b, src, check: ['Con số và khoảng ước tính; mỗi mức theo nguồn nào; nhãn (tử trận / chết / thương vong / bị bắt) có đúng loại số không.'] }));
}

/* ---------- 2. điểm rẽ ---------- */
for (const e of ERAS) {
  const y = String(e.cy), at = `Điểm rẽ ${e.n} (${e.cy})`;
  add({ id: `era:${e.id}:q`, cls: 'hist', kind: 'điểm rẽ', year: y, where: `${at} · câu đặt vấn đề`, text: `${e.title}. ${e.q}`, needle: e.q, src: NO_SRC,
    check: ['Bối cảnh, ngày tháng; câu hỏi có công bằng với mọi lựa chọn không.'] });
  add({ id: `era:${e.id}:hist`, cls: 'hist', kind: 'lịch sử thật', year: y, where: `Kết luận · "Lịch sử thật" của điểm rẽ ${e.n}`, text: e.hist, src: NO_SRC,
    check: ['Câu tóm hướng đã chiếm ưu thế trong lịch sử.'] });
  for (const o of e.opts) {
    add({ id: `opt:${o.id}`, cls: 'hist', kind: 'lựa chọn ở điểm rẽ', year: y, where: `${at} · lựa chọn "${o.label}"`, text: `${o.label} (${o.who}): ${o.d}`, needle: o.d, src: NO_SRC,
      check: ['Người đại diện và mô tả có đúng với lập trường của hướng này.'] });
    add({ id: `opt:${o.id}:out`, cls: 'hist', kind: 'kết cục ở điểm rẽ', year: y, where: `${at} · "Con đường của bạn" sau khi chọn "${o.label}"`, text: o.out, src: NO_SRC,
      check: ['Những gì kể là đã xảy ra với người theo hướng này.'] });
    for (const v of o.diary) add({ id: `diary:${v.id}`, cls: 'play', kind: 'nhật ký dòng họ', year: String(v.y), where: `Nhật ký dòng họ (hư cấu) · ${v.y} · "${v.t}", nếu chọn "${o.label}"`,
      text: `${v.t}. ${v.s}`, needle: v.s, src: FICTION, check: ['Chi tiết đời sống, ngày tháng trong trang nhật ký.'] });
  }
  for (const [pp, t] of Object.entries(e.ctx || {})) {
    const o = ERAS[e.n - 2]?.opts.find(x => x.id === pp);
    add({ id: `ctx:${e.id}:${pp}`, cls: 'play', kind: 'gia đình bạn', year: y, where: `${at} · "Gia đình bạn" (đời trước chọn "${o?.label || pp}")`, text: t, src: FICTION,
      check: ['Chi tiết lịch sử trong bối cảnh gia đình hư cấu.'] });
  }
}
for (const [id, z] of Object.entries(DIARY_R)) for (const [k, v] of Object.entries(z)) if (v)
  add({ id: `diary:${v.id}`, cls: 'play', kind: 'nhật ký dòng họ', year: String(v.y), where: `Trò chơi · nhật ký đời thường ở nhà, nhà ở miền ${k === 't' ? 'Trung' : 'Nam'} (thay trang ${id})`,
    text: `${v.t}. ${v.s}`, needle: v.s, src: FICTION, check: ['Chi tiết đời sống, ngày tháng trong trang nhật ký.'] });
// "Gia đình bạn" theo quê, theo biến cố đã quyết (src/screens/gate.ts ctxFor): đọc chữ từ mã, ‹quê› thay tên quê
{
  const file = join(ROOT, 'src/screens/gate.ts'), code = readFileSync(file, 'utf8');
  const body = code.slice(code.indexOf('export function ctxFor'), code.indexOf('\n}\n', code.indexOf('export function ctxFor')));
  const lits = [...body.matchAll(/'((?:[^'\\]|\\.){40,})'|`((?:[^`\\]|\\.){40,})`/g)].map(m => (m[1] ?? m[2]).replace(/\\'/g, "'").replace(/\$\{q\}/g, '‹quê›'));
  const n: Record<string, number> = {};
  [...new Set(lits)].filter(t => !/\$\{/.test(t)).forEach(t => { const k = slug(t); n[k] = (n[k] || 0) + 1; add({ id: `ctx:gate:${k}${n[k] > 1 ? '-' + n[k] : ''}`, cls: 'play', kind: 'gia đình bạn', year: '', where: 'Điểm rẽ · "Gia đình bạn", bản theo quê hay theo biến cố đã quyết (Trò chơi)',
    text: t, needle: t.split('‹quê›')[0].slice(0, 40), file: 'src/screens/gate.ts', src: FICTION, check: ['Chi tiết lịch sử trong bối cảnh gia đình hư cấu.'] }); });
}

/* ---------- 3. nhân vật, câu đố, kho sử liệu, dân số ---------- */
for (const [id, f] of Object.entries(FIG)) add({ id: `fig:${id}`, cls: 'hist', kind: 'nhân vật', year: f[1], where: `Nhân vật · ${f[0]}`, text: `${f[0]} (${f[1]}), ${f[2]}. ${f[3]}`, needle: f[3].slice(0, 50), src: NO_SRC,
  check: ['Năm sinh – mất, vai trò, các mốc trong tiểu sử.'] });
for (const [id, b] of Object.entries(BORN)) add({ id: `born:${id}`, cls: 'fact', kind: 'tên khai sinh', year: '', where: `Nhân vật · ${FIG[id]?.[0] || id} · dòng phụ dưới tên`, text: `${FIG[id]?.[0] || id}: ${/^hoàng tộc/.test(b) ? b : 'khai sinh ' + b}`, needle: b, src: NO_SRC,
  check: ['Tên khai sinh / dòng tộc.'] });
for (const [eid, qs] of Object.entries(QUIZ)) qs.forEach((q, i) => add({ id: `quiz:${eid}:${i}`, cls: 'hist', kind: 'câu đố', year: String(EV.find(v => v.id === q[4])?.y || ''), ev: q[4],
  where: `Câu đố chương ${ERAS.find(e => e.id === eid)?.n} (sau sự kiện ${q[4]})`, text: `${q[0]} Đáp án: ${q[1][q[2]]}. ${q[3]}`, needle: q[0], src: NO_SRC, check: ['Câu hỏi, đáp án đúng, lời giải thích; các đáp án sai có thật sự sai.'] }));
for (const s of SRC) {
  const used = EV.filter(v => v.src.includes(s.id) || v.qt?.src === s.id).map(v => v.id);
  add({ id: `src:${s.id}`, cls: 'hist', kind: 'hồ sơ nguồn', year: s.y, where: `Sử liệu · hồ sơ "${s.t}"`, text: `${s.t} · ${s.k} · ${s.by} · ${s.y} · ${s.at} · ${s.d}`, needle: s.t, src: '—',
    check: [`Tên văn bản, tác giả, năm, nơi lưu giữ; nguồn có thật sự chép các sự kiện dẫn nó không: ${used.join(', ') || '(chưa sự kiện nào)'}.`] });
}
const POP = (DD as unknown as { POP: [number, string, string][] }).POP;
add({ id: 'pop', cls: 'hist', kind: 'số liệu', year: `${POP[0][0]}–${POP[POP.length - 1][0]}`, where: 'Bản đồ · chú giải dân số theo năm', text: POP.map(([y, n, k]) => `${y}: ${n} (${k})`).join('; '),
  needle: 'D.POP=[[', src: 'Ước tính thời Pháp, tổng điều tra dân số, Tổng cục Thống kê (theo ghi chú từng mức)', check: ['Từng mức dân số và loại nguồn (ước tính hay tổng điều tra).'] });

/* ---------- 4. cảnh trận, đường hành quân ---------- */
const evT = (id: string) => EV.find(v => v.id === id);
for (const [id, sc] of Object.entries(SCENES)) sc.arrows.forEach((a, i) => add({ id: `scene:${id}:${i}`, cls: 'hist', kind: 'cảnh trận', year: String(evT(id)?.y || ''), ev: id,
  where: `Cảnh trận "${evT(id)?.t || id}" · mũi tên ${i + 1} (${sideName(a[2], evT(id)?.y || 0)})`, text: a[3], src: srcList(evT(id)?.src || []), check: ['Bên, hướng đánh, ngày tháng của mũi tên.'] }));
for (const [id, mv] of Object.entries(MOVES)) mv.paths.forEach((p, i) => add({ id: `move:${id}:${i}`, cls: 'hist', kind: 'đường đi', year: String(evT(id)?.y || ''), ev: id,
  where: `Bản đồ "${evT(id)?.t || id}" · đường ${i + 1} (${sideName(p[3], evT(id)?.y || 0)})`, text: p[4], src: srcList(evT(id)?.src || []), check: ['Đường đi, mốc thời gian.'] }));

/* ---------- 5. giả định "Nếu…" ---------- */
const optEra = (id: string) => ERAS.find(e => e.opts.some(o => o.id === id));
add({ id: 'cf:method', cls: 'hist', kind: 'giả định', year: '', where: 'Kết luận · thẻ "Nếu…" · cách tính ước lượng', text: CF_METHOD, needle: CF_METHOD.slice(0, 50), src: NO_SRC,
  check: ['Cách xếp mức A–D và quy đổi % có hợp lý; có nói đủ rõ đây không phải xác suất lịch sử.'] });
for (const [id, cf] of Object.entries(CFS)) add({ id: `cf:${id}`, cls: 'hist', kind: 'giả định', year: String(optEra(id)?.cy || ''), where: `Kết luận · thẻ "Nếu…" (nhãn "Giả định · không phải lịch sử") của hướng "${optEra(id)?.opts.find(o => o.id === id)?.label || ABROAD6[id]?.label || id}"`,
  text: `${cf.title}. ${cf.body} Căn cứ: ${cf.basis} Mức ${cf.level}: ${estimate(cf.level)}.`, needle: cf.body.slice(0, 50), src: NO_SRC,
  check: [`Mức ${cf.level} (${estimate(cf.level)}) và căn cứ có hợp lý; các sự kiện, con số trong lời giả định; lời không nói con đường nào "tốt hơn".`] });

/* ---------- 6. Trò chơi: thẻ, biến thể, biến cố riêng, kết cục, gia phả ---------- */
const choiceText = (c: Choice) => `${c[0]}: ${c[1]} → ${c[3]}`;
const condOf = (v: Variant) => Object.entries(v).filter(([k]) => k !== 'choices').map(([k, x]) => `${k}=${Array.isArray(x) ? x.join('+') : x}`).join(';');
const condWords = (v: Variant) => {
  const w: string[] = [];
  if (v.regions) w.push(`nhà đang ở vùng ${v.regions.join(', ')}`);
  if (v.from) w.push(`quê gốc ${v.from.join(', ')}`);
  if (v.homes) w.push(`quê ${v.homes.join(', ')}`);
  if (v.picks) w.push(`đã chọn ${v.picks.join(', ')}`);
  if (v.notPicks) w.push(`không chọn ${v.notPicks.join(', ')}`);
  if (v.after) w.push(`sau ${v.after.join(', ')}`);
  if (v.flags) w.push(`dòng họ có cờ ${v.flags.join(', ')}`);
  if (v.special) w.push(`biến cố ${v.special}`);
  return w.join('; ');
};
const cardCheck = ['Chi tiết lịch sử trong lựa chọn hư cấu của dòng họ (bối cảnh, ngày tháng, nơi chốn).'];
for (const [ev, , chs] of CARDS) {
  const v = evT(ev), y = String(v?.y || ''), base = new Set(chs.map(choiceText));
  chs.forEach((c, i) => add({ id: `card:${ev}:${i}`, cls: 'play', kind: 'thẻ Trò chơi', year: y, ev, where: `Trò chơi · thẻ "${v?.t || ev}" · lựa chọn ${i + 1}`, text: choiceText(c), needle: c[3] || c[1], src: FICTION, check: cardCheck }));
  const seenCond: Record<string, number> = {};
  for (const vr of VARIANT[ev] || []) {
    let cond = condOf(vr);
    seenCond[cond] = (seenCond[cond] || 0) + 1;
    if (seenCond[cond] > 1) cond += '#' + seenCond[cond];
    vr.choices.forEach((c, i) => { if (!base.has(choiceText(c))) add({ id: `card:${ev}{${cond}}:${i}`, cls: 'play', kind: 'thẻ Trò chơi (biến thể)', year: y, ev,
      where: `Trò chơi · thẻ "${v?.t || ev}" khi ${condWords(vr)} · lựa chọn ${i + 1}`, text: choiceText(c), needle: c[3] || c[1], src: FICTION, check: cardCheck }); });
  }
}
for (const x of SPECIAL) {
  const v = evT(x.ev), y = String(v?.y || '');
  add({ id: `x:${x.id}`, cls: 'play', kind: 'biến cố riêng', year: y, ev: x.ev, where: `Trò chơi · biến cố riêng "${x.title}" (gắn vào "${v?.t || x.ev}")`, text: `${x.title}. ${x.s}`, needle: x.s, src: FICTION, check: [x.note] });
  x.choices.forEach((c, i) => add({ id: `x:${x.id}:${i}`, cls: 'play', kind: 'biến cố riêng', year: y, ev: x.ev, where: `Trò chơi · biến cố riêng "${x.title}" · lựa chọn ${i + 1}`,
    text: `${c[0]}: ${c[1]} → ${c[3]}`, needle: c[3] || c[1], src: FICTION, check: cardCheck }));
}
for (const [id, a] of Object.entries(ABROAD6)) {
  add({ id: `abroad:${id}`, cls: 'play', kind: 'điểm rẽ 6 ở xứ người', year: '1976', where: `Điểm rẽ 6, nhà đã di tản · lựa chọn "${a.label}" (${a.who})`, text: `${a.label}: ${a.d} → ${a.out}`, needle: a.out.slice(0, 50), src: FICTION, check: cardCheck });
  for (const v of a.diary.filter(d => d.id.startsWith('d-x'))) add({ id: `diary:${v.id}`, cls: 'play', kind: 'nhật ký dòng họ', year: String(v.y), where: `Nhật ký dòng họ (hư cấu), nhà đã di tản · ${v.y} · "${v.t}"`,
    text: `${v.t}. ${v.s}`, needle: v.s, src: FICTION, check: ['Chi tiết đời sống, ngày tháng trong trang nhật ký.'] });
}
for (const r of outVariants()) add({ id: `out:${r.key}`, cls: 'play', kind: 'kết cục ở điểm rẽ (theo quê)', year: '', where: r.ctx, text: r.text.replace(/^Con đường của bạn\. /, ''), needle: r.text.replace(/^Con đường của bạn\. /, '').split(/[‹$]/)[0].slice(0, 40), src: FICTION, check: ['Những gì kể là đã xảy ra với nhà ở quê này.'] });
for (const [id, t] of Object.entries(CHRONICLE)) add({ id: `chr:${id}`, cls: 'play', kind: 'gia phả', year: String(optEra(id)?.cy || ''), where: `Kết luận · phim hành trình và gia phả · dòng của hướng "${optEra(id)?.opts.find(o => o.id === id)?.label || id}"`, text: t, src: FICTION, check: ['Mốc lịch sử trong dòng gia phả.'] });
for (const r of chronVariants()) if (r.text !== CHRONICLE[r.key.replace(/^chr-/, '')]) add({ id: `chr:${r.key}`, cls: 'play', kind: 'gia phả (theo quê)', year: '', where: r.ctx, text: r.text, needle: r.text.slice(0, 40), src: FICTION, check: ['Mốc lịch sử trong dòng gia phả.'] });
for (const e of ENDINGS) add({ id: `end:${e.id}`, cls: 'play', kind: 'kết cục', year: '', where: `Kết luận · kết cục "${e.title}"`, text: `${e.title}. ${e.line}`, needle: e.line, src: FICTION, check: ['Câu tóm kết cục: chi tiết lịch sử (nếu có).'] });

/* ---------- 7. họ tộc: dữ kiện trình bày như sự thật ---------- */
for (const s of SURNAMES) {
  add({ id: `lore:${s.key}`, cls: 'fact', kind: 'họ tộc', year: '', where: `Trò chơi · gia phả mở đầu, họ ${s.names.join(' / ')}`, text: s.lore, needle: s.lore.slice(0, 50), src: NO_SRC, check: ['Tỷ lệ dân số (năm, nguồn), mốc lịch sử, người nổi tiếng của họ.'] });
  if (s.variant) add({ id: `lore:${s.key}:variant`, cls: 'fact', kind: 'họ tộc', year: '', where: `Trò chơi · gia phả mở đầu, họ ${s.names.join(' / ')} · cách viết theo vùng`, text: s.variant, needle: s.variant.slice(0, 50), src: NO_SRC, check: ['Giải thích cách viết theo vùng, kỵ huý.'] });
}
for (const [k, t] of Object.entries(EPILOGUES)) add({ id: `epi:${k}`, cls: 'fact', kind: 'họ tộc', year: '', where: `Kết luận · lời khép theo họ ${SURNAMES.find(s => s.key === k)?.names.join(' / ') || k}`, text: t, needle: t.slice(0, 50), src: NO_SRC,
  check: ['Tỷ lệ dân số, chức vụ, năm, giải thưởng của người được nêu tên (người còn sống: thật chính xác).'] });
for (const [k, t] of Object.entries(HOOK_TEXT)) add({ id: `hook:${k}`, cls: 'fact', kind: 'họ tộc', year: '', where: 'Trò chơi · gia phả mở đầu · biến cố riêng sắp tới của họ', text: t, src: NO_SRC, check: ['Mốc lịch sử nêu trong câu.'] });

/* ---------- phân hạng ---------- */
// con số đếm người, của, đất (không tính ngày tháng, năm)
const N1 = String.raw`(?<![\d.,])(?!(?:18|19|20)\d\d(?![\d.,]))\d+(?:[.,]\d+)*`;
const NUM = new RegExp(String.raw`${N1}\s*(?:[–-]\s*${N1}\s*)?(?:%|\s(?:triệu|nghìn|vạn|người|km|tử trận|thương vong|lính|quân|chiến sĩ|thường dân|tàu|máy bay|xe tăng|tiểu đoàn|sư đoàn|trung đoàn|lượng|ha|tấn|phần trăm|nạn nhân|tù nhân|du học sinh|gia đình|hộ)(?![\p{L}]))`, 'iu');
const voiced = voiceRows().map(r => r.text);
const markOf = (r: Row) => MARKS.filter(m => (m.id && (m.id.endsWith('*') ? r.id.startsWith(m.id.slice(0, -1)) : r.id === m.id)) || (m.has && r.text.includes(m.has)));
const used = new Set<Mark>();
for (const r of rows) {
  const topics = HOT.filter(h => h.key !== 'neu' && ((r.ev && h.ev.includes(r.ev) && r.cls === 'hist') || h.re.test(r.text))).map(h => h.key);
  if (r.id.startsWith('cf:')) topics.push('neu');
  if (r.persp === 'vnch' && !topics.includes('vnch')) topics.push('vnch');
  r.topics = topics;
  const why: string[] = [];
  if (r.cls === 'hist' && (r.kind === 'số liệu' || (!['hồ sơ nguồn', 'giả định', 'cảnh trận', 'đường đi'].includes(r.kind) && NUM.test(r.text)))) why.push('số liệu');
  if (r.kind === 'trích dẫn') why.push('trích dẫn');
  // nhạy cảm vào bảng A: chữ lịch sử của chính các sự kiện thuộc đề tài (các câu khác chạm đề tài: danh sách nhạy cảm)
  if (r.cls === 'hist' && r.ev && HOT.some(h => h.core && h.ev.includes(r.ev!)) && ['tóm tắt', 'diễn biến', 'góc nhìn (tóm lược)', 'trích dẫn', 'số liệu'].includes(r.kind)) why.push('nhạy cảm');
  if (r.persp === 'vnch') why.push('góc nhìn VNCH & hải ngoại');
  if (r.id.startsWith('cf:')) why.push('giả định "Nếu…" kèm %');
  const ms = markOf(r);
  for (const m of ms) { used.add(m); why.push(`câu mới cần kiểm (đợt ${m.wave})`); r.check.unshift(m.note); }
  for (const k of topics) if (why.includes('nhạy cảm') || r.persp === 'vnch' || k === 'neu') r.check.push(`Đề tài nhạy cảm (${HOT_BY[k].name}): ${HOT_BY[k].note}`);
  r.why = [...new Set(why)];
  r.tier = r.why.length ? 'A' : r.cls === 'play' ? 'C' : 'B';
  // ưu tiên 2: câu hư cấu của Trò chơi, cảnh trận, góc nhìn của sự kiện ngoài các đề tài nhạy cảm nhất (câu ngắn, đọc nhanh)
  const coreEv = !!r.ev && HOT.some(h => h.core && h.ev.includes(r.ev!));
  if (r.tier === 'A') r.pri = r.cls === 'play' || ['cảnh trận', 'đường đi'].includes(r.kind) || (r.kind === 'góc nhìn (tóm lược)' && !coreEv) ? 2 : 1;
  // câu thuyết minh đọc nguyên văn câu này (sửa thì phải thu lại giọng); trang sự kiện: tên sự kiện được đọc, ngày và nơi thì không
  const title = r.kind === 'tiêu đề, ngày, nơi' ? EV.find(v => v.id === r.ev)!.t : '';
  r.voiced = title ? (voiced.some(t => t.includes(`. ${title}. `)) ? 'tên sự kiện có (sửa tên thì thu lại giọng)' : '') : voiced.some(t => t.includes(r.text)) ? 'có (sửa thì phải thu lại giọng)' : '';
}
// dấu của đợt đang sửa song song chưa gộp, hay câu đã bị bỏ: chỉ báo, không dừng
const idle = MARKS.filter(m => !used.has(m));
if (idle.length) console.warn(`(${idle.length} dấu cần kiểm chưa khớp dòng nào: ${idle.map(m => `${m.id || '“' + m.has + '”'} [đợt ${m.wave}]`).join(', ')})`);

/* ---------- vị trí trong mã ---------- */
const FILES = ['src/data/data.js', 'src/data/data2.js', 'src/data/cards.ts', 'src/data/cards2.ts', 'src/data/endings.ts', 'src/data/surnames.ts', 'src/data/scenes.ts', 'src/regional.ts', 'src/screens/gate.ts', 'src/play.ts'];
const SRCS = FILES.map(f => ({ f, lines: readFileSync(join(ROOT, f), 'utf8').split('\n') }));
/** Các đoạn để tìm, dài trước: cắt ở dấu câu, dấu nháy, gạch chéo ngược (chữ trong mã có thể viết \' hay \u…) và chỗ
    chữ đổi theo quê (câu dựng từ khuôn trong mã), mỗi đoạn tối đa 40 ký tự. */
const probes = (t: string, min = 12) => t.split(/[,.;:!?()'"‘’“”\\]|‹[^›]*›|\$\{[^}]*\}/).map(x => x.trim()).filter(x => x.length >= min).sort((a, b) => b.length - a.length).map(x => x.slice(0, 40));
/** Dòng mã của một sự kiện: dòng có mã sự kiện trong dấu nháy (bảng N, fv/fq/fn ở data2.js) và vài dòng sau `id:'…'` (data.js). */
const evLines = (id: string) => SRCS.slice(0, 2).flatMap(s => s.lines.flatMap((l, i) => l.includes(`id:'${id}'`) ? [...Array(8).keys()].map(k => [s.f, i + k] as const) : l.includes(`'${id}'`) ? [[s.f, i] as const] : []));
for (const r of rows) {
  const files = SRCS.filter(s => !r.file || s.f === r.file);
  // chữ của một sự kiện: tìm trước trong các dòng của chính sự kiện ấy (góc nhìn, số liệu ngắn hay lặp ở sự kiện khác)
  const near = r.id.startsWith('ev:') && r.ev ? evLines(r.ev) : [];
  for (const p of near.length ? [...(r.needle ? probes(r.needle, 5) : []), ...probes(r.text, 5)] : []) {
    const hit = near.find(([f, i]) => SRCS.find(s => s.f === f)!.lines[i]?.includes(p));
    if (hit) { r.loc = `${hit[0]}:${hit[1] + 1}`; break; }
  }
  if (!r.loc) for (const p of [...(r.needle ? probes(r.needle) : []), ...probes(r.text)]) {
    const hit = files.flatMap(s => { const i = s.lines.findIndex(l => l.includes(p)); return i < 0 ? [] : [`${s.f}:${i + 1}`]; })[0];
    if (hit) { r.loc = hit; break; }
  }
  r.loc ||= r.file || '';
}

/* ---------- ghi tệp ---------- */
const HEAD = ['Mã', 'Hạng', 'Ưu tiên', 'Vì sao vào bảng A', 'Đề tài nhạy cảm', 'Năm', 'Chỗ hiện trong ứng dụng', 'Loại', 'Nguyên văn', 'Nguồn ứng dụng đang dẫn', 'Cần kiểm',
  'Có giọng đọc', 'Ý kiến (Đúng / Sửa / Bỏ / Thiếu nguồn / Còn tranh luận)', 'Đề xuất sửa (nguyên văn mới)', 'Nguồn của người rà soát (sách, trang, đường dẫn)', 'Người rà soát, ngày', 'Vị trí trong mã'];
const cell = (x: string) => { const s = /^[=+\-@]/.test(x) ? "'" + x : x; return '"' + s.replace(/"/g, '""').replace(/\r?\n/g, ' ') + '"'; };
const csv = (rs: Row[]) => '﻿' + [HEAD, ...rs.map(r => [r.id, r.tier!, r.pri ? String(r.pri) : '', r.why!.join('; '), r.topics!.map(k => HOT_BY[k].name).join('; '), r.year, r.where, r.kind, r.text, r.src,
  r.check.join(' '), r.voiced || '', '', '', '', '', r.loc || ''])].map(l => l.map(cell).join(',')).join('\r\n') + '\r\n';
const yr = (r: Row) => Number((r.year.match(/\d{4}/) || ['9999'])[0]);
const tierA = rows.filter(r => r.tier === 'A').map((r, i) => ({ r, i })).sort((a, b) => yr(a.r) - yr(b.r) || a.i - b.i).map(x => x.r);
const count = (t: Tier) => rows.filter(r => r.tier === t).length;

const md = (s: string) => s.replace(/\|/g, '\\|');
function sensitivity(): string {
  const L: string[] = [];
  L.push('# Danh sách nhạy cảm · Dư Đồ', '');
  L.push('Sinh tự động bằng `npm run review:export` từ mã nguồn (chạy lại sau mỗi lần sửa nội dung). Mỗi đề tài liệt kê nguyên văn mọi câu chạm tới nó, ở cả phần lịch sử (hạng A, B) lẫn phần hư cấu của Trò chơi (hạng C), để người rà soát sử học và luật sư đọc vài trăm dòng thay vì toàn bộ ứng dụng. Mã dòng khớp cột "Mã" của `bang-day-du.csv`. Danh sách này không phải ý kiến pháp lý.', '');
  L.push('## Ngoài chữ: màu cờ, nhãn bản đồ', '');
  const find = (f: string, s: string) => { const ls = readFileSync(join(ROOT, f), 'utf8').split('\n'); const i = ls.findIndex(l => l.includes(s)); return i < 0 ? f : `${f}:${i + 1}`; };
  L.push(`- Màu phe mặc định là màu cờ lịch sử (\`pal: 'flag'\`, ${find('src/state.ts', "pal: 'flag'")}): vùng của Quốc gia Việt Nam / VNCH tô nền vàng ba sọc đỏ (${find('src/ui/bits.ts', 'vnch: `background:linear-gradient')}). Người chơi đổi được sang "mực nâu" trong Hồ sơ → Giao diện.`);
  L.push(`- Nhãn chủ quyền trên bản đồ chính: Biển Đông, Vịnh Bắc Bộ, Q.đ. Hoàng Sa, Q.đ. Trường Sa (${find('src/map.ts', "['Q.đ. Hoàng Sa'")}); trên tấm bản đồ nhỏ ở màn chào (${find('src/ui/plate.ts', 'Q.đ. Hoàng Sa')}).`);
  L.push('- Đường biên hiện nay lấy từ Natural Earth 1:50m (src/data/region-50m.json); không đa giác quốc gia nào của Natural Earth phủ lên Hoàng Sa hay Trường Sa.', '');
  for (const h of HOT) {
    const rs = rows.filter(r => r.topics!.includes(h.key));
    if (!rs.length) continue;
    L.push(`## ${h.name} · ${rs.length} câu`, '', `Cần để ý: ${h.note}`, '');
    L.push('| Mã | Hạng | Chỗ hiện | Nguyên văn |', '|---|---|---|---|');
    for (const r of rs) L.push(`| \`${r.id}\` | ${r.tier} | ${md(r.where)} | ${md(r.text)} |`);
    L.push('');
  }
  return L.join('\n');
}
function brief(): string {
  const nA = count('A'), why = (w: string) => rows.filter(r => r.tier === 'A' && r.why!.some(x => x.startsWith(w))).length;
  const p1 = rows.filter(r => r.pri === 1).length, p2 = rows.filter(r => r.pri === 2).length;
  return `# Phiếu rà soát nội dung Dư Đồ

Thư ngắn cho người rà soát sử học. Sinh tự động bằng \`npm run review:export\`; chạy lại sau mỗi lần sửa nội dung (các con số dưới đây theo bản mã lúc chạy).

## Đoạn giới thiệu để gửi

> Chào anh/chị, tôi đang làm **Dư Đồ**, một ứng dụng miễn phí trên điện thoại và máy tính bảng kể lịch sử Việt Nam từ năm 1858 tới nay trên một tấm bản đồ, cho người lớn yêu sử và bà con người Việt ở nước ngoài. Phần chữ được soạn với sự trợ giúp của công cụ AI và mới chỉ đối chiếu với Wikipedia, chưa qua tay nhà sử học nào. Tôi cần một người có chuyên môn đọc khoảng ${p1} câu rủi ro nhất (số liệu thương vong, lời trích, các đề tài nhạy cảm như cải cách ruộng đất, Mậu Thân, học tập cải tạo, thuyền nhân, chiến tranh 1979, biển đảo, góc nhìn VNCH và hải ngoại, các giả định "Nếu…"), đánh dấu Đúng / Sửa / Bỏ / Thiếu nguồn / Còn tranh luận và ghi nguồn đối chiếu; nếu còn thời gian thì thêm ${p2} câu ngắn. Ước chừng một ngày làm việc; tôi sẽ trả thù lao, xin anh/chị cho biết mức phí. Bảng tính kèm theo đã có sẵn cột để điền.

## Ứng dụng là gì

- Một bản đồ Việt Nam 1858 – 2026: ranh giới đổi theo năm, ${EV.length} sự kiện có thật, mỗi sự kiện có phần diễn biến, các "góc nhìn" (lời tóm lược của ứng dụng về cách từng phía nhìn sự kiện: sử học chính thống Việt Nam, sử quan VNCH và hải ngoại, sử liệu Pháp, Mỹ, Trung Quốc, sử gia quốc tế…), nguồn, câu đố; ${Object.keys(FIG).length} nhân vật; ${SRC.length} hồ sơ sử liệu.
- Sáu "điểm rẽ" (1858, 1885, 1930, 1945, 1954, 1976): người chơi chọn một hướng rồi so với hướng đã chiếm ưu thế trong lịch sử. Hướng không chiếm ưu thế có một thẻ "Nếu…" (giả định, ghi rõ "không phải lịch sử", kèm một ước lượng %).
- Chế độ Chơi: một dòng họ hư cấu qua sáu thế hệ, với các thẻ lựa chọn đặt trong bối cảnh có thật. Phần hư cấu không cần kiểm văn chương, chỉ cần kiểm chi tiết lịch sử trong đó.
- Ứng dụng chạy trên trình duyệt, không cần cài đặt (người gửi phiếu kèm đường dẫn). Ứng dụng tự nhận là đứng ngang hàng giữa các phía. Người rà soát giúp giữ đúng điều ấy: chính xác, cân bằng, không bịa lời trích của người thật, số người chết ghi bằng khoảng có nguồn.

## Việc cần làm (khoảng một ngày)

1. Mở \`bang-a-rui-ro-cao.csv\` (${nA} dòng, xếp theo năm). Làm trước các dòng có cột "Ưu tiên" là 1 (${p1} dòng, khoảng một ngày); các dòng ưu tiên 2 (${p2} dòng: góc nhìn của những sự kiện ít nhạy cảm hơn, câu hư cấu của Trò chơi có chi tiết lịch sử, cảnh trận) làm nếu còn thời gian. Trong bảng có ${why('số liệu')} dòng có số liệu, ${why('trích dẫn')} lời trích, ${why('nhạy cảm')} dòng thuộc đề tài nhạy cảm, ${why('góc nhìn VNCH')} góc nhìn VNCH & hải ngoại, ${why('giả định')} giả định "Nếu…", ${why('câu mới')} câu mới viết gần đây được đánh dấu cần kiểm (cột "Cần kiểm" ghi điều cụ thể cần đối chiếu). Một dòng có thể thuộc nhiều nhóm.
2. Với mỗi dòng, điền:
   - **Ý kiến**: Đúng · Sửa · Bỏ · Thiếu nguồn · Còn tranh luận (khi giới sử học còn chia rẽ: ghi các cách đọc, ứng dụng sẽ nêu cả hai thay vì chọn một);
   - **Đề xuất sửa**: nguyên văn câu mới, nếu chọn Sửa;
   - **Nguồn của người rà soát**: sách, tập, trang, hay đường dẫn;
   - **Người rà soát, ngày**.
3. Không sửa cột "Mã" (để ghép phiếu với bản mã sau này). Các cột khác có thể ghi chú thêm.
4. Còn thời gian thì đọc tiếp các dòng hạng B trong \`bang-day-du.csv\` (lọc cột "Hạng").

Góc nhìn là lời tóm lược, không phải trích dẫn: chỉ cần xét câu có đúng và công bằng với phía ấy không. Ứng dụng sẽ không gắn tên sách nào vào một câu mà chưa ai đối chiếu với sách ấy.

## Các tệp

- \`bang-a-rui-ro-cao.csv\`: ${nA} dòng rủi ro cao (${p1} dòng ưu tiên 1, ${p2} dòng ưu tiên 2).
- \`bang-day-du.csv\`: mọi câu có nội dung lịch sử, ${rows.length} dòng: hạng A ${nA}, hạng B ${count('B')} (phần lịch sử còn lại: sự kiện, điểm rẽ, nhân vật, câu đố, hồ sơ nguồn, cảnh trận, dữ kiện về các họ), hạng C ${count('C')} (phần hư cấu của Trò chơi).
- \`nhay-cam.md\`: các câu chạm đề tài nhạy cảm, xếp theo đề tài, nguyên văn; dành cả cho người rà soát lẫn luật sư.

Mở bằng Google Sheets (Tệp → Nhập → Tải lên) hay Excel (mở thẳng tệp: có BOM UTF-8 nên dấu tiếng Việt hiện đúng). Cột "Có giọng đọc" cho người làm ứng dụng biết câu nào phải thu lại giọng khi sửa; cột cuối "Vị trí trong mã" cũng chỉ dành cho người làm ứng dụng.

## Sau khi rà soát

Gửi lại tệp đã điền. Người làm ứng dụng sửa theo từng dòng, rồi xuất lại bộ phiếu để đối chiếu. Có ghi tên người rà soát trong ứng dụng hay không là việc hai bên thoả thuận; ứng dụng chỉ ghi "đã rà soát" khi việc ấy đã thật sự xong.
`;
}

const files: [string, string][] = [
  ['bang-a-rui-ro-cao.csv', csv(tierA)],
  ['bang-day-du.csv', csv(rows)],
  ['nhay-cam.md', sensitivity()],
  ['README.md', brief()],
];
const dupe = rows.map(r => r.id).filter((id, i, a) => a.indexOf(id) !== i);
if (dupe.length) { console.error('LỖI: mã dòng trùng: ' + [...new Set(dupe)].join(', ')); process.exit(1); }
let stale = 0;
if (!CHECK) mkdirSync(OUT, { recursive: true });
for (const [f, body] of files) {
  const p = join(OUT, f);
  if (CHECK) { if (!existsSync(p) || readFileSync(p, 'utf8') !== body) { console.error(`cũ: ${relative(ROOT, p)}`); stale++; } }
  else writeFileSync(p, body);
}
const byWhy = (w: string) => tierA.filter(r => r.why!.some(x => x.startsWith(w))).length;
console.log(`${rows.length} dòng: A ${count('A')} · B ${count('B')} · C ${count('C')}. Bảng A: số liệu ${byWhy('số liệu')}, trích dẫn ${byWhy('trích dẫn')}, nhạy cảm ${byWhy('nhạy cảm')}, góc nhìn VNCH ${byWhy('góc nhìn VNCH')}, giả định ${byWhy('giả định')}, câu mới ${byWhy('câu mới')}.`);
console.log(`đề tài: ${HOT.map(h => `${h.key} ${rows.filter(r => r.topics!.includes(h.key)).length}`).join(' · ')}`);
if (CHECK && stale) { console.error('docs/review/ đã cũ: chạy npm run review:export'); process.exit(1); }
if (!CHECK) console.log(`đã ghi ${relative(ROOT, OUT)}/`);
