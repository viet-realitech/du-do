import { S } from './state';
import { duck } from './audio';
import { toast } from './ui/dom';
import type { HistEvent } from './data';

/* Documentary-style narration with the device's Vietnamese system voice. */
export const hasTTS = 'speechSynthesis' in window;
let VOICE: SpeechSynthesisVoice | null = null;
let warnedVoice = false;

function pickVoice(): void {
  if (!hasTTS) return;
  const vi = speechSynthesis.getVoices().filter(v => /^vi/i.test(v.lang));
  // Prefer a male / natural voice (Edge: "NamMinh Online (Natural)"), then any known good Vietnamese voice.
  VOICE = vi.find(v => /namminh|\bnam\b|male/i.test(v.name)) || vi.find(v => /natural|online/i.test(v.name))
    || vi.find(v => /google|linh|an|hoaimy/i.test(v.name)) || vi[0] || null;
}
if (hasTTS) {
  pickVoice();
  speechSynthesis.onvoiceschanged = pickVoice;
}

export const hasVoice = () => !!VOICE;

let run = 0; // bumps on every new speech / hush so stale queues stop

export function hush(): void {
  run++;
  if (hasTTS) speechSynthesis.cancel();
  duck(false);
  document.querySelectorAll<HTMLElement>('.nbtn').forEach(b => (b.textContent = '▶ Nghe'));
}

/** Break narration into sentences (and long clauses) with a pause after each, like a documentary voice-over.
    Only punctuation followed by a space ends a phrase, so 1.500 or 7.5.1954 stay whole. */
export function phrases(text: string): [string, number][] {
  const out: [string, number][] = [];
  for (const raw of text.replace(/\s+/g, ' ').match(/.+?(?:[.!?…;:](?=\s|$)|$)/g) || []) {
    const t = raw.trim();
    if (!t) continue;
    const long = /^(Năm|Nhật ký|Điểm rẽ)\b/.test(t) && t.length < 40;
    out.push([t, /[;:]$/.test(t) ? 260 : long ? 620 : 420]);
  }
  return out;
}

/** Speak `text`; `onend` always fires (also when narration is off or unavailable). Returns whether speech started. */
export function speak(text: string, onend?: () => void, force = false): boolean {
  let cb = onend;
  const done = () => { duck(false); cb?.(); cb = undefined; };
  if ((!S.narr && !force) || !hasTTS) { done(); return false; }
  hush();
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
  const me = run, parts = phrases(text);
  duck(true);
  const say = (i: number) => {
    if (me !== run) return;
    if (i >= parts.length) { done(); return; }
    const [t, gap] = parts[i];
    const u = new SpeechSynthesisUtterance(t);
    u.voice = VOICE;
    u.lang = VOICE!.lang;
    u.rate = S.rate || 0.92;
    u.pitch = 0.82;
    u.volume = 1;
    let fired = false;
    const next = () => { if (fired) return; fired = true; clearTimeout(guard); setTimeout(() => say(i + 1), gap); };
    // Some engines never fire onend; don't let a tour hang on them.
    const guard = setTimeout(next, Math.max(4000, t.length * 130));
    u.onend = u.onerror = next;
    speechSynthesis.speak(u);
  };
  say(0);
  return true;
}

export const evSpeech = (v: HistEvent) => (v.diary ? `Nhật ký dòng họ, năm ${v.y}. ` : `Năm ${v.y}. `) + v.t + '. ' + v.s;
