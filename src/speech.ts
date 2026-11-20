import type { Era, HistEvent } from './data';
import { titleOf, pathF, type Ending, type Facts } from './data/endings';

/* Narration texts, shared by the app and the voice-over script generator (scripts/voice-script.ts).
   Keys name the recordings: src/voice/<key>.m4a (see `npm run voice`). Lines personalised by home or by a family abroad
   find their recording in src/voiced.ts. */
export const evKey = (v: HistEvent) => v.id;
export const gateKey = (e: Era) => 'gate-' + e.id;

/** Short form for the chapter tour. */
export const evSpeech = (v: HistEvent) => (v.diary ? `Nhật ký dòng họ, năm ${v.y}. ` : `Năm ${v.y}. `) + v.t + '. ' + v.s;
/** Full form for "Nghe" in the event page; this is also what a voice actor records. */
export const evSpeechFull = (v: HistEvent) => evSpeech(v) + (v.x ? ' ' + v.x : '');
export const gateSpeech = (e: Era) => `Điểm rẽ thứ ${e.n}, năm ${e.cy}. ${e.title}. ${e.q}`;
/** Kết cục của một hướng ở điểm rẽ (màn "Con đường của bạn"). */
export const outKey = (opt: string) => 'out-' + opt;
export const outSpeech = (out: string) => `Con đường của bạn. ${out}`;
/** Phim hành trình (kết cục): dòng gia phả của một hướng, lời khép theo họ. */
export const chrKey = (opt: string) => 'chr-' + opt;
export const epiKey = (k: string) => 'epi-' + k;
/** Kết cục dòng họ (màn kết, tấm cuối phim hành trình): tên kết cục rồi câu tóm, đúng như hai dòng trên màn. Tên đổi theo
    con đường ("Bốn đời canh tân") thì mỗi tên một bản thu, khoá theo số đời chọn cải cách. */
export const endKey = (e: Ending, f: Facts) => (titleOf(e, f) === e.title ? 'end-' + e.id : `end-${e.id}-${pathF(f.picks).cc}`);
export const endSpeech = (e: Ending, f: Facts) => `${titleOf(e, f)}. ${e.line}`;
/** Câu của màn Cài đặt, đọc bằng giọng thuyết minh: bật giọng đọc, nghe thử tốc độ đọc. */
export const UI_LINES = {
  'ui-narr-on': 'Giọng đọc đã bật.',
  'ui-rate': 'Đây là giọng thuyết minh của Dư Đồ, đọc ở tốc độ bạn vừa chọn.',
} as const;
