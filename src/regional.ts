import { DIARY_R, type HistEvent, type Option, type Region } from './data';
import { HOMES, home, isPlay, regionAt, placeAt, abroadOpt } from './play';
import { optView } from './state';

/* Lời theo quê của Trò chơi, dùng chung cho màn chơi và kịch bản thu giọng (scripts/voice-lines.ts): kết cục ở điểm rẽ
   theo quê, trang nhật ký đời thường theo nơi dòng họ sống năm ấy. */

type Home = typeof HOMES[number];
const north = (r: Region) => r === 'B' || r === 'T1';

/** Kết cục của hướng `o` cho một nhà ở quê `h`: sau Genève nói đúng nhà ở lại, di cư hay tập kết (data.js nói chung chung
    "tập kết ra Bắc hoặc ở lại Hà Nội" cho mọi quê). */
export function outText(o: Option, h: Home): string {
  const reg = h[3], q = h[1];
  if (o.id === 'bac') return north(reg) ? `Bạn ở lại ${q}, dưới chính quyền Việt Nam Dân chủ Cộng hoà. Cải cách ruộng đất, hợp tác xã, rồi đường Trường Sơn.`
    : `Bạn tập kết ra Bắc theo Hiệp định Genève, để lại ở ${q} một tấm ảnh và lời hẹn hai năm. Hai năm thành hai mươi mốt năm.`;
  if (o.id === 'nam') return north(reg) ? `Bạn rời ${q} trên những chuyến tàu di cư từ Hải Phòng, làm lại nhà ở miền Nam. Hai nền cộng hoà, nhiều cuộc đảo chính, một cuộc chiến ngày càng lớn.`
    : `Bạn ở lại ${q}, dưới chính quyền ở Sài Gòn. Hai nền cộng hoà, nhiều cuộc đảo chính, một cuộc chiến ngày càng lớn.`;
  if (o.id === 'thuba') return north(reg) ? 'Bạn theo dòng người di cư vào Nam năm 1954; ở Sài Gòn, bạn đứng cùng những người đòi hoà bình. Cả hai phía đều nghi ngờ bạn.'
    : reg === 'T2' ? 'Bạn xuống đường đòi hoà bình ở Huế, rồi ở Sài Gòn. Cả hai phía đều nghi ngờ bạn.' : o.out;
  return o.out;
}
/** Kết cục của hướng vừa chọn như dòng họ này thấy (Đọc sử: câu chung). */
export const outFor = (o: Option): string => (isPlay() ? outText(o, home()) : o.out);

/** Miền của trang nhật ký đời thường: '' (miền Bắc, trang gốc), 't' miền Trung, 'n' miền Nam. */
const zone = (r: Region): '' | 't' | 'n' => (r === 'NE' || r === 'NW' ? 'n' : r === 'B' ? '' : 't');
const made = new Map<string, HistEvent>();
/** Trang nhật ký đời thường (sổ gạo, đổi tiền, ruộng khoán) theo nơi dòng họ sống năm ấy, đặt ở chính nơi ấy trên bản
    đồ. Cùng một trang thì cùng một đối tượng (tour, tiêu điểm so sánh theo đối tượng). */
function localPage(v: HistEvent): HistEvent {
  const z = DIARY_R[v.id] && zone(regionAt(v.y)), x = z ? DIARY_R[v.id][z] : undefined;
  if (!x) return v;
  const l = placeAt(v.y).l, k = `${x.id}@${l.join(',')}`;
  if (!made.has(k)) made.set(k, { ...x, l: [l[0], l[1]] });
  return made.get(k)!;
}
/** Một hướng như dòng họ này thấy nó: nhà đã di tản thấy điểm rẽ 6 nói từ xứ người (play.ts abroadOpt), trang nhật ký
    đời thường theo miền dòng họ sống (Trò chơi). */
export const localOpt = (o: Option): Option => {
  const a = abroadOpt(o);
  if (!isPlay() || !a.diary.some(v => DIARY_R[v.id])) return a;
  return { ...a, diary: a.diary.map(localPage) };
};
optView.of = localOpt;
