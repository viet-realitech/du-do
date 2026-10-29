import { ERAS, F, VAL, pop, regime2, type Era } from './data';
import { S, save, rt, Y0, Y1, eraOf, curPick, values, allEv, visEv, setFocus, pct } from './state';
import { on } from './ui/actions';
import { $, esc } from './ui/dom';
import { av, flag } from './ui/bits';
import { paintMap, paintHome } from './map';
import { isPlay, pendingCard, cardOf, decided, mustDecide, home, RES, powersAt } from './play';
import { openCard, relChip } from './screens/card';
import { SND, ac } from './audio';
import { stopTour } from './tour';
import { openGate } from './screens/gate';
import { openEvent } from './screens/event';
import { openFig } from './screens/figures';
import { goEnd } from './screens/ending';

/* Main map screen: header, value bars, map, legend, event card, timeline. */
/* The big year counter glides to its target instead of jumping (also while scrubbing). */
let shownY = 0, goalY = 0, raf = 0;
function showYear(y: number): void {
  const el = $('#yr')!;
  goalY = y;
  if (!shownY || Math.abs(y - shownY) > 60 || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    shownY = y;
    el.textContent = String(y);
    return;
  }
  const step = () => {
    shownY += (goalY - shownY) * 0.2;
    if (Math.abs(goalY - shownY) < 0.5) shownY = goalY;
    el.textContent = String(Math.round(shownY));
    raf = shownY === goalY ? 0 : requestAnimationFrame(step);
  };
  if (!raf) raf = requestAnimationFrame(step);
}

export function renderMain(): void {
  const y = S.year, R = regime2(y), e = eraOf(y), pk = curPick(y);
  showYear(y);
  $('#eraNo')!.textContent = `Chương ${e.n}/6 · Thế hệ ${e.n}`;
  $('#eraT')!.textContent = e.title;
  const er = $('#eraR')!;
  er.innerHTML = pk ? `${av(pk.guide)}${esc(pk.label)}` : 'Chưa chọn';
  if (pk) { er.dataset.a = 'fig'; er.dataset.id = pk.guide; } else delete er.dataset.a;
  $('#lbl')!.textContent = R.label;
  const pp = pop(y);
  $('#popl')!.textContent = pp ? `Dân số ${pp[1]} · ${pp[0]}` : 'Dân số: chưa có số liệu';
  $('#legend')!.innerHTML = R.legend
    .map(k => `<span${pk && pk.fac === k ? ' style="font-weight:600"' : ''}>${flag(k)}${F[k].n}${pk && pk.fac === k ? ' · bạn' : ''}</span>`)
    .join('') + (isPlay() ? '<span class="sep"></span>' + powersAt(y).map(relChip).join('') : '');
  paintMap();
  paintHome(isPlay() ? home()[2] : null);
  renderVals();
  renderRes();
  $('#fbtn')!.classList.toggle('act', S.filt !== 'Tất cả');
  renderCard();
  renderScrub();
}

function renderVals(): void {
  const v = values();
  $('#vals')!.innerHTML = VAL.map(([k, n]) =>
    `<div class="mt"><span>${n}<b>${v[k]}</b></span><i><b style="width:${Math.min(100, (v[k] / 18) * 100)}%"></b></i></div>`).join('');
}

function renderRes(): void {
  const el = $('#res')!;
  el.hidden = !isPlay();
  if (!isPlay()) return;
  el.innerHTML = RES.map(([k, n, ic]) => `<div class="mt r${S.res[k] <= 10 ? ' low' : ''}"><span><span><i>${ic}</i> ${n}</span><b>${S.res[k]}</b></span><i><b style="width:${S.res[k]}%"></b></i></div>`).join('');
}

function renderCard(): void {
  const c = $('#card')!, y = S.year;
  if (y >= Y1 && ERAS.every(e => S.picks[e.id])) {
    c.className = 'card cta';
    c.innerHTML = `<button class="c" data-a="end"><div class="mono" style="opacity:.75">Hành trình hoàn tất</div><div class="t">Xem kết luận: con đường của bạn và lịch sử</div><div class="s">168 năm, sáu thế hệ, mọi nhánh hội tụ về hôm nay.</div></button><button class="rb" data-a="end" aria-label="Xem kết luận">→</button>`;
    return;
  }
  const v = rt.focusEv;
  c.className = 'card' + (v && v.diary ? ' diary' : '');
  if (!v) {
    c.innerHTML = `<div class="c"><div class="mono muted">Kéo dòng thời gian</div><div class="t">Mỗi năm một trang hồ sơ</div><div class="s">Phóng to bản đồ, chạm vào một vùng để xem nó thuộc về ai.</div></div>`;
    return;
  }
  const seen = S.seen.includes(v.id);
  const card = isPlay() ? cardOf(v) : undefined, open = card && !decided(v.id), must = open && mustDecide(v);
  if (must) c.className += ' must';
  c.innerHTML = `<button class="c" data-a="ev" data-id="${v.id}"><div class="mono muted"${v.diary ? ' style="color:var(--acc)"' : ''}>${v.diary ? '✎ Nhật ký dòng họ' : v.k} · ${v.d}${v.y < y ? ` · ${y - v.y} năm trước` : ''}${seen ? ' · đã đọc' : ''}</div><div class="t">${esc(v.t)}</div><div class="s">${esc(v.s)}</div></button>
    <div class="nav">${card ? `<button class="rb${open ? ' act' : ''}" data-a="card" data-id="${v.id}" aria-label="${open ? 'Dòng họ bạn làm gì?' : 'Xem quyết định'}">${open ? '◆' : '✓'}</button>` : `<button class="rb" data-a="step" data-d="-1" aria-label="Sự kiện trước">‹</button>`}<button class="rb" data-a="step" data-d="1" aria-label="Sự kiện sau">›</button></div>`;
}

/* ---------- timeline ---------- */
let tkKey = '';
/** Force the timeline track (segments/ticks) to rebuild on next render. */
export const invalidateTrack = () => { tkKey = ''; };

function renderScrub(): void {
  const t = $('#trk')!, key = S.filt + JSON.stringify(S.picks);
  if (key !== tkKey) {
    tkKey = key;
    t.innerHTML =
      ERAS.map((e, i) => {
        const nx = ERAS[i + 1], a = pct(e.cy), b = nx ? pct(nx.cy) : 100;
        return `<i class="sg" data-e="${e.id}" style="left:calc(${a}% + 1px);width:calc(${b - a}% - 2px)"></i>`;
      }).join('') +
      visEv().map(v => `<i class="tk${v.diary ? ' d' : ''}" style="left:${pct(v.y)}%"></i>`).join('') +
      ERAS.map(e => `<i class="cp" data-e="${e.id}" style="left:${pct(e.cy)}%"></i>`).join('') +
      ([[1858, 'l'], [1900, ''], [1945, ''], [1975, ''], [2026, 'r']] as [number, string][])
        .map(([y, c]) => `<span class="dec ${c}" style="left:${pct(y)}%">${y === 2026 ? 'NAY' : y}</span>`).join('') +
      '<i class="thumb" id="thumb"></i>';
  }
  const ce = eraOf(S.year).id;
  t.querySelectorAll<HTMLElement>('.sg').forEach(n => { const id = n.dataset.e!; n.className = 'sg' + (id === ce ? ' cur' : S.picks[id] ? ' done' : ''); });
  t.querySelectorAll<HTMLElement>('.cp').forEach(n => { const id = n.dataset.e!; n.className = 'cp' + (S.picks[id] ? ' done' : rt.gate?.id === id ? ' pend' : ''); });
  $('#thumb')!.style.left = pct(S.year) + '%';
}

const pendingGate = (y: number): Era | undefined => ERAS.find(e => !S.picks[e.id] && e.cy <= y);
let lastTick = 0;

/** Move to year `y`, stopping at the first unanswered turning point. `open` shows that turning point. */
export function setYear(yIn: number, open = false): void {
  let y = Math.max(Y0, Math.min(Y1, Math.round(yIn)));
  const pend = pendingGate(y);
  rt.gate = null;
  rt.card = null;
  if (pend) { y = pend.cy; rt.gate = pend; }
  // Chế độ Chơi: dừng ở thẻ sự kiện bắt buộc chưa quyết định; điểm rẽ cùng năm đi trước.
  const pc = pendingCard(y);
  if (pc && (!pend || pc.y < pend.cy)) { y = pc.y; rt.card = pc; rt.gate = null; }
  if (y !== S.year || open) {
    const a = Math.min(S.year, y), b = Math.max(S.year, y);
    if (y !== S.year && visEv().some(v => v.y > a && v.y <= b) && Date.now() - lastTick > 70) { SND.tick(); lastTick = Date.now(); }
    S.year = y;
    setFocus();
    if (rt.card) rt.focusEv = rt.card;
    save();
    renderMain();
  }
  if (open && rt.card) openCard(rt.card);
  else if (open && rt.gate) openGate(rt.gate);
}

export function stepEv(d: number): void {
  const list = visEv(), i = rt.focusEv ? list.indexOf(rt.focusEv) : -1, j = i + d;
  if (j < 0 || j >= list.length) return;
  const v = list[j];
  if (pendingGate(v.y) || pendingCard(v.y)) { setYear(v.y, true); return; }
  S.year = v.y;
  rt.focusEv = v;
  save();
  renderMain();
}

export function initTimeline(): void {
  const sc = $('#tl')!, t = $('#trk')!;
  let drag = false;
  const at = (ev: PointerEvent) => { const r = t.getBoundingClientRect(); return Y0 + ((ev.clientX - r.left) / r.width) * (Y1 - Y0); };
  sc.addEventListener('pointerdown', ev => { ac(); drag = true; stopTour(); sc.setPointerCapture(ev.pointerId); setYear(at(ev)); });
  sc.addEventListener('pointermove', ev => { if (drag) setYear(at(ev)); });
  const up = () => { if (!drag) return; drag = false; if (rt.card) openCard(rt.card); else if (rt.gate) openGate(rt.gate); };
  sc.addEventListener('pointerup', up);
  sc.addEventListener('pointercancel', up);
}

/* ---------- event-type filter ---------- */
const KINDS = ['Tất cả', 'Trận đánh', 'Hiệp ước', 'Chính trị', 'Xã hội', 'Nhật ký'];

function toggleFilter(): void {
  let m = $('#fmenu');
  if (m) { m.remove(); return; }
  const all = allEv();
  m = document.createElement('div');
  m.id = 'fmenu';
  m.className = 'fmenu';
  m.innerHTML = KINDS.map(k => {
    const n = k === 'Tất cả' ? all.length : all.filter(v => v.k === k).length;
    return `<button class="${S.filt === k ? 'on' : ''}" data-a="filt" data-k="${k}">${k}<span>${n}</span></button>`;
  }).join('');
  $('#mapwrap')!.appendChild(m);
}

export function initMainControls(): void {
  $('#fbtn')!.addEventListener('click', e => { e.stopPropagation(); toggleFilter(); });
  document.addEventListener('click', e => {
    const m = $('#fmenu'), t = e.target as Element;
    if (m && !t.closest('#fmenu') && !t.closest('#fbtn')) m.remove();
  });
  on('filt', (el, ev) => { ev.stopPropagation(); S.filt = el.dataset.k!; save(); setFocus(); $('#fmenu')?.remove(); renderMain(); });
  on('step', el => stepEv(+el.dataset.d!));
  on('ev', el => openEvent(el.dataset.id!));
  on('fig', el => openFig(el.dataset.id!));
  on('end', () => goEnd());
  initTimeline();
}
