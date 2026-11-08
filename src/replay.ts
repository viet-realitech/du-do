import type { HistEvent } from './data';
import { S, save, rt, allEv } from './state';
import { isPlay } from './play';
import { on } from './ui/actions';
import { clearLayer, esc } from './ui/dom';
import { hush, speak } from './narration';
import { evKey, evSpeech } from './speech';
import { SND } from './audio';
import { zoomFit, zoomK, paintMap } from './map';
import { playScene, endScene, sceneFrame, hasScene, fxOn, capH, voiceAt } from './scene';
import { renderMain } from './view';
import { resumeTour } from './tour';

/* "Xem diễn biến": phát lại cảnh động của một sự kiện từ trang chi tiết (trận đánh, cảnh di chuyển), có lời kể,
   với thanh nhỏ dưới bản đồ (Xem lại · Đóng). Trò chơi: chỉ sự kiện dòng họ đã đi qua, và không đổi năm đang chơi. */

/** Sự kiện này phát lại được (có cảnh, Cảnh động bật; trò chơi: không xem trước tương lai). */
export const canReplay = (v: HistEvent): boolean => hasScene(v) && fxOn() && (!isPlay() || v.y <= S.year);

let tok = 0; // mỗi lần phát / đóng tăng: lời gọi cũ (onEnd, lời kể hẹn giờ) tự bỏ

export function replayEvent(id: string): void {
  const v = allEv().find(x => x.id === id), fr = v && sceneFrame(v);
  if (!v || !fr || !canReplay(v)) return;
  const t = ++tok;
  hush();
  clearLayer();
  if (!isPlay()) { S.year = v.y; rt.focusEv = v; save(); renderMain(); } // như "Đến sự kiện" của trang nguồn
  else paintMap(true, v.y); // trò chơi: chỉ vẽ biên giới năm đó, năm đang chơi giữ nguyên
  const wrap = document.getElementById('mapwrap')!;
  let bar = document.getElementById('replb');
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'replb';
    bar.className = 'tour replay';
    wrap.appendChild(bar);
    bar.addEventListener('click', ev => {
      const a = (ev.target as Element).closest<HTMLElement>('[data-t]')?.dataset.t;
      if (a === 'again') replayEvent(bar!.dataset.id!);
      else if (a === 'rclose') closeReplay();
    });
  }
  bar.dataset.id = id;
  bar.innerHTML = `<div style="flex:1;min-width:0"><div class="mono muted">Xem lại · ${v.y}</div><div class="rt">${esc(v.t)}</div></div><button class="chip" data-t="again">↻ Xem lại</button><button class="chip" data-t="rclose">Đóng</button>`;
  wrap.classList.add('replaying');
  zoomFit(fr, Math.min(8, zoomK(v) * 1.5), undefined, capH());
  SND.fly();
  playScene(v, Infinity, () => { if (t === tok) closeReplay(); }); // cảnh bị cắt (chạm bản đồ nghiêng, đổi thẻ, ẩn app): đóng luôn
  setTimeout(() => { if (t === tok && document.getElementById('replb')) speak(evSpeech(v), undefined, false, evKey(v)); }, voiceAt(v));
}

/** Đóng phần xem lại; `resume`: tour trò chơi đang tạm dừng thì đi tiếp (không khi mở ngay một trang sự kiện khác). */
export function closeReplay(resume = true): void {
  tok++;
  hush();
  document.getElementById('replb')?.remove();
  document.getElementById('mapwrap')?.classList.remove('replaying');
  endScene();
  if (isPlay()) paintMap(true); else renderMain(); // trò chơi: trả biên giới của năm đang chơi (không trống đổi chế độ)
  if (resume) resumeTour('overlay'); // tour trò chơi tạm dừng khi mở trang sự kiện thì đi tiếp
}

on('replay', el => replayEvent(el.dataset.id!));
