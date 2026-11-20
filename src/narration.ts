import { S } from './state';
import { duck } from './audio';
import { recording } from './voice';
import { toast } from './ui/dom';
import { icon } from './ui/icons';

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
/** Đã có một câu chưa có bản thu cần đọc trên máy không có giọng tiếng Việt (nhãn ở Cài đặt, thông báo một lần). */
let missed = false;
export const missedVoice = () => missed;
function noVoice(): void {
  missed = true;
  if (warnedVoice) return;
  warnedVoice = true;
  toast('Đoạn này chưa có bản thu, và máy này chưa có giọng đọc tiếng Việt để đọc thay.');
}
/** Tên giọng hệ thống đang dùng (bảng chẩn đoán). */
export const voiceName = (): string => VOICE?.name || '';
/** Bảng chẩn đoán: bản thu bắt đầu phát, bị trình duyệt chặn (cần một cú chạm), lỗi tải / giải mã (mất mạng…). */
export const vstats = { started: 0, refused: 0, error: 0 };

// iOS chỉ cho giọng hệ thống đọc từ hẹn giờ sau khi đã đọc một lần trong một cú chạm: đọc một câu rỗng, không tiếng,
// ở cú chạm đầu tiên khi máy có giọng tiếng Việt (một lần)
if (hasTTS) {
  const prime = () => {
    try {
      if (!VOICE) return;
      removeEventListener('pointerup', prime, true);
      removeEventListener('keydown', prime, true);
      if (speechSynthesis.speaking || speechSynthesis.pending) return;
      const u = new SpeechSynthesisUtterance('');
      u.volume = 0;
      speechSynthesis.speak(u);
    } catch { /* không có giọng hệ thống */ }
  };
  addEventListener('pointerup', prime, true);
  addEventListener('keydown', prime, true);
}

/* "Chạm để nghe": chỉ hiện khi trình duyệt chặn bản thu (NotAllowedError: Safari, không có cú chạm gần đây). Phát lại
   chính bản thu ấy trong cú chạm; bước tour vẫn theo hẹn giờ đọc, không bị rút ngắn. */
let tapOff: (() => void) | null = null;
function hideTap(): void { tapOff?.(); tapOff = null; document.getElementById('tapvo')?.remove(); }
function tapToHear(play: () => void): void {
  hideTap();
  const b = document.createElement('button');
  b.id = 'tapvo';
  b.type = 'button';
  b.className = 'chip on tapvo';
  b.innerHTML = `${icon('listen', 15)}Chạm để nghe`;
  b.addEventListener('click', ev => { ev.stopPropagation(); hideTap(); play(); });
  const tb = document.getElementById('tourb'), wrap = tb?.parentElement;
  // có thanh tour (và không có màn điện ảnh phủ lên): trong khung bản đồ, ngay trên phụ đề cảnh nếu có (không che chữ),
  // không thì trên thanh tour; cách 12 px để vòng viền của chip không dính nét viền bên dưới. Đặt lại khi phụ đề hiện,
  // đổi cỡ theo nhịp hay mất đi. Còn lại: giữa chân màn hình
  if (!tb || !wrap || document.querySelector('body > .cine')) { document.body.appendChild(b); return; }
  let lt: HTMLElement | null = null;
  const place = () => {
    const c = wrap.querySelector<HTMLElement>(':scope > .lt:not(.out)');
    if (c !== lt) { if (lt) ro.unobserve(lt); if (c) ro.observe(c); lt = c; }
    b.style.bottom = `${wrap.clientHeight - (c || tb).offsetTop + 12}px`;
  };
  const ro = new ResizeObserver(place), mo = new MutationObserver(place);
  ro.observe(tb);
  mo.observe(wrap, { childList: true });
  tapOff = () => { ro.disconnect(); mo.disconnect(); };
  place();
  wrap.appendChild(b);
}
/** Narration is possible for `key`: a recorded clip, or a Vietnamese system voice. */
export const canSpeak = (key?: string) => !!recording(key) || (hasTTS && !!VOICE);

let clip: HTMLAudioElement | null = null;
/** Đang có lời kể (bản thu hoặc giọng hệ thống): phụ đề cảnh không đọc chồng cho trình đọc màn hình, tiếng trận dịu lại. */
export const speaking = (): boolean => !!clip || (hasTTS && speechSynthesis.speaking);

let run = 0; // bumps on every new speech / hush so stale queues stop

export function hush(): void {
  run++;
  hideTap();
  if (clip) { clip.pause(); clip = null; }
  if (hasTTS) speechSynthesis.cancel();
  duck(false);
  document.querySelectorAll<HTMLElement>('.nbtn').forEach(b => delete b.dataset.on); // nút "Nghe" của trang sự kiện trở lại
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

/** Speak `text` (or play the recording for `key` when there is one); `onend` always fires (also when narration
    is off or unavailable). Returns whether speech started. */
export function speak(text: string, onend?: () => void, force = false, key?: string): boolean {
  let cb = onend;
  const done = () => { duck(false); cb?.(); cb = undefined; };
  if (!S.narr && !force) { done(); return false; }
  const rec = recording(key);
  if (rec) {
    hush();
    const me = run, a = new Audio(rec);
    clip = a;
    a.playbackRate = Math.round(((S.rate || 0.95) / 0.95) * 100) / 100; // "Tốc độ đọc": Vừa = natural pace; browsers keep the pitch
    // Bảo hiểm: iOS tạm dừng clip khi khoá máy / chuyển app và có thể không bao giờ báo "ended".
    let guard = setTimeout(() => end(), Math.max(6000, text.length * 130));
    // khi biết độ dài thật của bản thu, hẹn lại theo đó (bản thu có thể dài hơn câu được truyền vào, và chạy theo tốc độ đọc)
    a.onloadedmetadata = () => { if (isFinite(a.duration) && a.duration > 0) { clearTimeout(guard); guard = setTimeout(() => end(), (a.duration * 1000) / (a.playbackRate || 1) + 2500); } };
    const end = () => { clearTimeout(guard); if (me === run) { hideTap(); if (clip === a) { a.pause(); clip = null; } done(); } };
    // lỗi tải / giải mã (mất mạng, bản thu chưa lưu ngoại tuyến): không rút ngắn bước, chờ hết giờ đọc (guard)
    let bad = false;
    const fail = () => { if (!bad && me === run) { bad = true; vstats.error++; } };
    a.onended = end;
    a.onerror = fail;
    duck(true);
    a.play().then(() => { vstats.started++; }, (e: unknown) => {
      if (me !== run) return; // hush() / lời kể mới đã cắt ngang
      if ((e as DOMException)?.name !== 'NotAllowedError') { fail(); return; }
      // trình duyệt chặn (không có cú chạm gần đây): giữ hẹn giờ đọc, mời chạm để nghe lại chính bản thu này
      vstats.refused++;
      tapToHear(() => {
        if (me !== run || clip !== a) return;
        a.play().then(() => {
          vstats.started++;
          if (me === run && isFinite(a.duration) && a.duration > 0) { clearTimeout(guard); guard = setTimeout(() => end(), ((a.duration - a.currentTime) * 1000) / (a.playbackRate || 1) + 2500); }
        }, () => { /* vẫn bị chặn: hẹn giờ đọc lo bước này */ });
      });
    });
    return true;
  }
  // câu chưa có bản thu: giọng tiếng Việt của máy đọc thay; máy không có thì báo (một lần), đúng lúc ấy
  if (!hasTTS) { noVoice(); done(); return false; }
  hush();
  if (!VOICE) {
    pickVoice();
    if (!VOICE) { noVoice(); done(); return false; }
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

// Quay lại app sau khi khoá máy: clip đang dở chạy tiếp (hoặc coi như xong nếu không phát lại được).
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && clip && clip.paused && !clip.ended) clip.play().catch(() => clip?.dispatchEvent(new Event('ended')));
});
