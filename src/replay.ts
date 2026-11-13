import type { HistEvent } from './data';
import { S, save, rt, allEv, curPick } from './state';
import { isPlay } from './play';
import { on } from './ui/actions';
import { clearLayer, esc, markTab } from './ui/dom';
import { icon } from './ui/icons';
import { hush, speak } from './narration';
import { evKey, evSpeech } from './speech';
import { SND } from './audio';
import { zoomFit, zoomK, paintMap, hidePop } from './map';
import { fogTop, playScene, endScene, sceneFrame, hasScene, fxOn, capH, voiceAt, stepScene, pauseScene, resumeScene, scenePaused, closeAt, beforeClose } from './scene';
import { renderMain, renderLegend, renderCard } from './view';
import { resumeTour, holdTour } from './tour';
import { openEvent } from './screens/event';

/* "Xem diễn biến": phát lại cảnh động của một sự kiện từ trang chi tiết (trận đánh, cảnh di chuyển), có lời kể,
   với thanh nhỏ dưới bản đồ (Xem lại · Đóng). Trò chơi: chỉ sự kiện dòng họ đã đi qua, và không đổi năm đang chơi. */

/** Sự kiện này phát lại được (có cảnh, Cảnh động bật; trò chơi: không xem trước tương lai). */
export const canReplay = (v: HistEvent): boolean => hasScene(v) && fxOn() && (!isPlay() || v.y <= S.year);

let tok = 0; // mỗi lần phát / đóng tăng: lời gọi cũ (onEnd, lời kể hẹn giờ) tự bỏ
let prevFocus: HistEvent | null = null; // trò chơi: sự kiện tour đang đứng (vùng sáng), trả lại khi đóng
let sayNow: (() => void) | null = null; // lời kể của phần xem lại đang chạy (▶ sau ❚❚ gọi lại nếu chưa kể)
let back: { id: string; tab: 'x' | 'v' | 'm' | 's'; ret: string } | null = null; // mở từ trang sự kiện: Đóng / Back trở lại đúng trang, đúng thẻ

export function replayEvent(id: string): void {
  const v = allEv().find(x => x.id === id), fr = v && sceneFrame(v);
  if (!v || !fr || !canReplay(v)) return;
  const t = ++tok, wrap = document.getElementById('mapwrap')!, again = !!document.getElementById('replb');
  if (!again) {
    const sel = document.querySelector<HTMLElement>('#layer .ov #et [aria-selected="true"]');
    back = sel ? { id, tab: (sel.dataset.k as 'x' | 'v' | 'm' | 's') || 'x', ret: sel.closest<HTMLElement>('.ov')?.dataset.ret || '' } : null;
  }
  hush();
  hidePop();
  clearLayer();
  if (!isPlay()) { S.year = v.y; rt.focusEv = v; save(); renderMain(); } // như "Đến sự kiện" của trang nguồn
  else {
    // trò chơi: chỉ vẽ biên giới năm đó (năm đang chơi giữ nguyên); vùng sáng của tour chuyển sang sự kiện đang xem
    if (!again) prevFocus = rt.focusEv;
    rt.focusEv = v;
    paintMap(true, v.y);
    renderLegend(v.y, curPick(v.y)); // chú giải, thẻ theo năm của cảnh (bản đồ đang vẽ năm ấy), không theo năm đang chơi
    renderCard();
  }
  let bar = document.getElementById('replb');
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'replb';
    bar.className = 'tour replay';
    // nhãn "Xem lại · năm" và tên sự kiện; nút chạy lại ghi "Từ đầu" (không lặp chữ "Xem lại"), điện thoại hẹp chỉ còn biểu tượng
    bar.innerHTML = `<div class="rl"><div class="mono muted"></div><div class="rt"></div></div><button class="chip ic" data-t="rpause" aria-label="Giữ cảnh" aria-pressed="false" title="Giữ cảnh">${icon('pause')}</button><button class="chip ic" data-t="rnext" aria-label="Nhịp kế tiếp" title="Nhịp kế tiếp">${icon('next')}</button><button class="chip" data-t="again" aria-label="Xem lại từ đầu" title="Xem lại từ đầu">${icon('again', 15)}<span>Từ đầu</span></button><button class="chip" data-t="rclose">Đóng</button>`;
    wrap.appendChild(bar);
    bar.addEventListener('click', ev => {
      const a = (ev.target as Element).closest<HTMLElement>('[data-t]')?.dataset.t;
      if (a === 'rpause') { if (scenePaused()) { resumeScene(); sayNow?.(); } else { pauseScene(); hush(); } pzState(bar!); }
      else if (a === 'rnext') { stepScene(); pzState(bar!); }
      else if (a === 'again') replayEvent(bar!.dataset.id!);
      else if (a === 'rclose') closeReplay();
    });
  }
  bar.dataset.id = id;
  bar.querySelector('.mono')!.textContent = `Xem lại · ${v.y}`;
  bar.querySelector('.rt')!.innerHTML = esc(v.t);
  wrap.classList.add('replaying');
  // bàn phím / trình đọc màn hình: trang sự kiện vừa đóng, đưa tiêu điểm tới thanh xem lại (khung hình sau: chuyển tiêu
  // điểm ngay trong cú bấm ép tính lại kiểu và dàn trang cả trang, đúng lúc bản đồ bắt đầu bay)
  const ag = bar.querySelector<HTMLElement>('[data-t=again]')!;
  requestAnimationFrame(() => { if (ag.isConnected) ag.focus({ preventScroll: true }); });
  zoomFit(fr, Math.min(8, zoomK(v) * 1.5), undefined, capH(), fogTop(v));
  SND.fly();
  // cảnh bị cắt (chạm bản đồ nghiêng, đổi thẻ, ẩn app, kéo thanh năm): đóng phần xem lại nhưng không cho tour
  // trò chơi đang tạm dừng chạy tiếp sau lưng người chơi; chỉ Đóng / Back mới cho tour đi tiếp
  // lời kể một lần: trận đánh có sơ đồ đọc khi trận khép (bước nhịp tới đó thì đọc ngay)
  let said = false;
  const say = () => { if (said || t !== tok || scenePaused() || beforeClose(v.id) || !document.getElementById('replb')) return; said = true; speak(evSpeech(v), undefined, false, evKey(v)); };
  sayNow = say;
  playScene(v, Infinity, () => { if (t === tok) { closeReplay(false); queueMicrotask(holdTour); } }, undefined, undefined, say); // cắt ngang: tour chờ ▶
  pzState(bar); // sau khi cảnh mới chạy (cảnh cũ đang giữ thì nút không còn ở ▶)
  setTimeout(say, closeAt(v) ? voiceAt(v) + 4000 : voiceAt(v)); // trận có sơ đồ: cảnh tự gọi say khi khép; đây là bảo hiểm
}

/** Nút giữ cảnh của thanh xem lại theo trạng thái cảnh. */
function pzState(bar: HTMLElement): void {
  const b = bar.querySelector<HTMLElement>('[data-t=rpause]'), p = scenePaused();
  if (!b) return;
  b.innerHTML = icon(p ? 'play' : 'pause');
  b.setAttribute('aria-pressed', String(p));
  b.setAttribute('aria-label', p ? 'Chạy tiếp cảnh' : 'Giữ cảnh');
}

/** Đóng phần xem lại; `resume`: tour trò chơi đang tạm dừng thì đi tiếp (chỉ khi người chơi bấm Đóng / Back). */
export function closeReplay(resume = true): void {
  tok++;
  hush();
  document.getElementById('replb')?.remove();
  document.getElementById('mapwrap')?.classList.remove('replaying');
  endScene();
  if (isPlay()) { if (prevFocus) rt.focusEv = prevFocus; prevFocus = null; paintMap(true); renderLegend(); renderCard(); } // biên giới, vùng sáng, chú giải của năm đang chơi
  else renderMain();
  const b = back;
  back = null;
  // người dùng đóng (Đóng / Back): về lại trang sự kiện đã mở phần xem lại, đúng thẻ đang xem; tour (nếu có) vẫn chờ
  // trang đó đóng mới đi tiếp. Không mở từ trang sự kiện: tour trò chơi tạm dừng thì đi tiếp.
  if (resume && b) openEvent(b.id, b.tab, b.ret); // giữ cả đích quay về của trang (bảng Sử liệu…)
  else if (resume) resumeTour('overlay');
  else if (b?.ret) markTab('map'); // bị cắt (kéo thanh năm, chạm bản đồ…): không về bảng nữa, thanh tab về Bản đồ
}

on('replay', el => replayEvent(el.dataset.id!));
