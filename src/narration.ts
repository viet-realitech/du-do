import { S } from './state';
import { toast } from './ui/dom';
import type { HistEvent } from './data';

/* Documentary-style narration with the device's Vietnamese system voice. */
export const hasTTS = 'speechSynthesis' in window;
let VOICE: SpeechSynthesisVoice | null = null;
let warnedVoice = false;

function pickVoice(): void {
  if (!hasTTS) return;
  const vs = speechSynthesis.getVoices();
  VOICE = vs.find(v => /^vi/i.test(v.lang) && /google|linh|an|hoaimy|namminh/i.test(v.name)) || vs.find(v => /^vi/i.test(v.lang)) || null;
}
if (hasTTS) {
  pickVoice();
  speechSynthesis.onvoiceschanged = pickVoice;
}

export const hasVoice = () => !!VOICE;

export function hush(): void {
  if (hasTTS) speechSynthesis.cancel();
  document.querySelectorAll<HTMLElement>('.nbtn').forEach(b => (b.textContent = '▶ Nghe'));
}

/** Speak `text`; `onend` always fires (also when narration is off or unavailable). Returns whether speech started. */
export function speak(text: string, onend?: () => void, force = false): boolean {
  let cb = onend;
  const done = () => { cb?.(); cb = undefined; };
  if ((!S.narr && !force) || !hasTTS) { done(); return false; }
  speechSynthesis.cancel();
  if (!VOICE) {
    pickVoice();
    if (!VOICE) {
      if (!warnedVoice) {
        warnedVoice = true;
        toast('Máy này chưa có giọng đọc tiếng Việt. Hãy cài giọng "Tiếng Việt" trong cài đặt hệ điều hành.');
      }
      done();
      return false;
    }
  }
  const u = new SpeechSynthesisUtterance(text);
  u.voice = VOICE;
  u.lang = VOICE.lang;
  u.rate = S.rate || 0.95;
  u.pitch = 0.9;
  u.volume = 1;
  // Some engines never fire onend; don't let a tour hang on them.
  const guard = setTimeout(done, Math.max(6000, text.length * 120));
  u.onend = u.onerror = () => { clearTimeout(guard); done(); };
  speechSynthesis.speak(u);
  return true;
}

export const evSpeech = (v: HistEvent) => (v.diary ? `Nhật ký dòng họ, năm ${v.y}. ` : `Năm ${v.y}. `) + v.t + '. ' + v.s;
