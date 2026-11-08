import type { Era, HistEvent } from './data';

/* Narration texts, shared by the app and the voice-over script generator (scripts/voice-script.ts).
   Keys name the recordings: src/voice/<key>.m4a (see `npm run voice`). */
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
/** Phim hành trình (kết cục): dòng gia phả của một hướng, dấu ấn dòng họ, lời khép theo họ. */
export const chrKey = (opt: string) => 'chr-' + opt;
export const linKey = (id: string) => 'lin-' + id;
export const epiKey = (k: string) => 'epi-' + k;
