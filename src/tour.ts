import { isPlay, mustDecide, decided, cardOf } from './play';
import { openCard } from './screens/card';
import { endGame } from './screens/ending';
import { mood, eraMood } from './music';
import { ERAS, type Era, type HistEvent } from './data';
import { S, save, rt, Y1, eraOf, allEv, setFocus } from './state';
import { $ } from './ui/dom';
import { SND } from './audio';
import { canSpeak, hush, speak } from './narration';
import { evKey, evSpeech } from './speech';
import { hidePop, zoomTo, zoomK } from './map';
import { renderMain, setYear } from './view';
import { openGate } from './screens/gate';

/* Chapter "zoom tour": fly through up to 8 key events of an era, narrating each,
   then return to the overview and open the next turning point. */
interface Tour { e: Era; L: HistEvent[]; i: number; end: number; t: number | undefined; cur?: string; paused?: boolean }
let tour: Tour | null = null;

export const isTouring = () => !!tour;
export const isTourPaused = () => !!tour?.paused;

function tourList(e: Era): { L: HistEvent[]; end: number } {
  const i = ERAS.indexOf(e), nx = ERAS[i + 1], end = nx ? nx.cy : Y1;
  let L = allEv().filter(v => v.y >= Math.max(e.cy, S.year) && v.y < (nx ? nx.cy : Y1 + 1));
  if (isPlay()) {
    // Trò chơi: mọi thẻ bắt buộc còn bỏ ngỏ và nhật ký luôn có mặt, phần còn lại lấy đều, ưu tiên sự kiện có thẻ.
    const must = L.filter(v => !v.diary && mustDecide(v) && !decided(v.id)), d = L.filter(v => v.diary);
    const rest = L.filter(v => !must.includes(v) && !v.diary);
    const pool = rest.filter(v => cardOf(v) && !decided(v.id)).length >= 3 ? rest.filter(v => cardOf(v) && !decided(v.id)) : rest;
    const need = Math.max(0, 10 - must.length - d.length), pick: HistEvent[] = [];
    for (let j = 0; j < need && pool.length; j++) pick.push(pool[Math.floor((j * pool.length) / need)]);
    L = [...new Set([...must, ...d, ...pick])].sort((a, b) => a.y - b.y || (a.diary ? 1 : 0) - (b.diary ? 1 : 0));
    return { L, end };
  }
  if (L.length > 8) {
    // Keep every family-diary page, then sample battles/treaties/quoted events evenly.
    const d = L.filter(v => v.diary), rest = L.filter(v => !v.diary);
    const key = rest.filter(v => v.k === 'Trận đánh' || v.k === 'Hiệp ước' || v.qt);
    const pool = key.length >= 4 ? key : rest, need = Math.max(0, 8 - d.length), pick: HistEvent[] = [];
    for (let j = 0; j < need; j++) pick.push(pool[Math.floor((j * pool.length) / need)]);
    L = [...new Set([...d, ...pick])].sort((a, b) => a.y - b.y);
  }
  return { L, end };
}

export function startTour(eIn?: Era): void {
  stopTour();
  hidePop();
  const e = eIn || eraOf(S.year);
  if (!S.picks[e.id]) {
    const g = ERAS.find(x => !S.picks[x.id] && x.cy <= S.year);
    if (g) { openGate(g); return; }
  }
  if (S.year >= Y1) return;
  const { L, end } = tourList(e);
  tour = { e, L, i: 0, end, t: undefined };
  mood(eraMood(e.id));
  tourBar();
  tourStep();
}

function tourStep(): void {
  if (!tour) return;
  const { L, i } = tour;
  if (i >= L.length) { finishTour(); return; }
  const v = L[i];
  animYear(v.y, () => {
    if (!tour) return;
    rt.focusEv = v;
    tour.cur = v.id;
    renderMain();
    zoomTo(v.l, zoomK(v));
    SND.fly();
    tourBar();
    // Trò chơi: sự kiện có thẻ thì tạm dừng tour và mở thẻ, sớm nhất sau 4,5 s (giọng đọc vẫn tiếp tục
    // trong lúc người chơi đọc thẻ); "Tiếp tục" trên thẻ gọi resumeTour().
    const card = isPlay() && cardOf(v) && !decided(v.id);
    const openIt = () => { if (!tour || tour.cur !== v.id || tour.paused) return; clearTimeout(tour.t); tour.paused = true; tourBar(); openCard(v, true); };
    if (card) tour.t = window.setTimeout(openIt, 4500);
    const next = (d: number) => {
      if (!tour || tour.cur !== v.id) return;
      if (card) { clearTimeout(tour.t); tour.t = window.setTimeout(openIt, Math.min(d, 500)); return; }
      tour.t = window.setTimeout(() => { if (!tour) return; tour.i++; tourStep(); }, d);
    };
    if (S.narr && canSpeak(evKey(v))) setTimeout(() => { if (tour && tour.cur === v.id) speak(evSpeech(v), () => next(900), false, evKey(v)); }, 700);
    else next(2900);
  });
}

function animYear(to: number, cb: () => void): void {
  const from = S.year;
  if (from === to) { cb(); return; }
  const dur = Math.min(900, Math.abs(to - from) * 70), t0 = performance.now();
  const f = (now: number) => {
    if (!tour) return;
    const k = Math.min(1, (now - t0) / dur);
    S.year = Math.round(from + (to - from) * k);
    setFocus();
    renderMain();
    if (k < 1) requestAnimationFrame(f);
    else { save(); cb(); }
  };
  requestAnimationFrame(f);
}

function finishTour(): void {
  const end = tour!.end, e = tour!.e;
  stopTour();
  zoomTo(null);
  if (isPlay()) rt.flowTo = end; // thẻ bắt buộc còn sót (sau khi bỏ qua tour) được mở lần lượt rồi mới tới điểm rẽ
  setTimeout(() => { if (isPlay() && end >= Y1) endGame(e); else setYear(end, true); }, 950);
}

/** Tour đang tạm dừng ở một thẻ: đi tiếp sự kiện kế. */
export function resumeTour(): void {
  if (!tour || !tour.paused) return;
  tour.paused = false;
  tour.i++;
  tourBar();
  tourStep();
}

export function stopTour(): void {
  if (tour) {
    clearTimeout(tour.t);
    tour = null;
    renderMain(); // clears the spotlight
    hush();
    mood('calm');
  }
  $('#tourb')?.remove();
  const p = $('#play');
  if (p) p.textContent = '▶';
}

function skipTour(): void {
  if (!tour) return;
  clearTimeout(tour.t);
  hush();
  finishTour();
}

function tourBar(): void {
  if (!tour) return;
  let b = $('#tourb');
  if (!b) {
    b = document.createElement('div');
    b.id = 'tourb';
    b.className = 'tour';
    $('#mapwrap')!.appendChild(b);
    b.addEventListener('click', ev => {
      const a = (ev.target as Element).closest<HTMLElement>('[data-t]')?.dataset.t;
      if (a === 'narr') { S.narr = !S.narr; save(); if (!S.narr) hush(); tourBar(); }
      else if (a === 'skip') skipTour();
      else if (a === 'stop') stopTour();
    });
  }
  const { e, L, i, paused } = tour, n = Math.max(1, L.length), at = Math.min(i + 1, n);
  b.innerHTML = `<div style="flex:1;min-width:0"><div class="mono muted">Chương ${e.n} · ${at}/${n}${paused ? ' · chờ quyết định' : ''}</div><div class="prog"><i style="width:${(at / n) * 100}%"></i></div></div>
    <button class="chip${S.narr ? ' on' : ''}" data-t="narr" aria-label="Giọng đọc" aria-pressed="${S.narr}">Giọng</button><button class="chip" data-t="skip">Điểm rẽ ›</button><button class="chip" data-t="stop">Dừng</button>`;
  $('#play')!.textContent = '❚❚';
}
