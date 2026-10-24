import { ERAS, type Era, type HistEvent } from './data';
import { S, save, rt, Y1, eraOf, allEv, setFocus } from './state';
import { $ } from './ui/dom';
import { SND } from './audio';
import { hasTTS, hasVoice, hush, speak, evSpeech } from './narration';
import { hidePop, zoomTo, zoomK } from './map';
import { renderMain, setYear } from './view';
import { openGate } from './screens/gate';

/* Chapter "zoom tour": fly through up to 8 key events of an era, narrating each,
   then return to the overview and open the next turning point. */
interface Tour { e: Era; L: HistEvent[]; i: number; end: number; t: number | undefined; cur?: string }
let tour: Tour | null = null;

export const isTouring = () => !!tour;

function tourList(e: Era): { L: HistEvent[]; end: number } {
  const i = ERAS.indexOf(e), nx = ERAS[i + 1], end = nx ? nx.cy : Y1;
  let L = allEv().filter(v => v.y >= Math.max(e.cy, S.year) && v.y < (nx ? nx.cy : Y1 + 1));
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
    const next = (d: number) => {
      if (!tour || tour.cur !== v.id) return;
      tour.t = window.setTimeout(() => { if (!tour) return; tour.i++; tourStep(); }, d);
    };
    if (S.narr && hasTTS && hasVoice()) setTimeout(() => { if (tour && tour.cur === v.id) speak(evSpeech(v), () => next(900)); }, 700);
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
  const end = tour!.end;
  stopTour();
  zoomTo(null);
  setTimeout(() => setYear(end, true), 950);
}

export function stopTour(): void {
  if (tour) {
    clearTimeout(tour.t);
    tour = null;
    renderMain(); // clears the spotlight
    hush();
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
  const { e, L, i } = tour, n = Math.max(1, L.length), at = Math.min(i + 1, n);
  b.innerHTML = `<div style="flex:1;min-width:0"><div class="mono muted">Chương ${e.n} · ${at}/${n}</div><div class="prog"><i style="width:${(at / n) * 100}%"></i></div></div>
    <button class="chip${S.narr ? ' on' : ''}" data-t="narr" aria-label="Giọng đọc" aria-pressed="${S.narr}">Giọng</button><button class="chip" data-t="skip">Điểm rẽ ›</button><button class="chip" data-t="stop">Dừng</button>`;
  $('#play')!.textContent = '❚❚';
}
