import { ERAS, F, VAL, pop, regime2, type Era } from './data';
import { S, save, rt, Y0, Y1, eraOf, evEra, curPick, optOf, chYear, values, allEv, visEv, setFocus, pct } from './state';
import { on } from './ui/actions';
import { $, esc } from './ui/dom';
import { av, flag } from './ui/bits';
import { paintMap, paintHome } from './map';
import { isPlay, pendingCard, cardOf, mustDecide, home, RES, powersAt, allPicked, needsDecision, specialFor, homeChoice, ownCard } from './play';
import { openCard, relChip } from './screens/card';
import { SND, ac } from './audio';
import { stopTour, isTourPaused, resumeTour, canResumeChapter, tourEra } from './tour';
import { endGame } from './screens/ending';
import { openGate } from './screens/gate';
import { openEvent, SIDE_PV } from './screens/event';
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

/** Chú giải tràn ngang (điện thoại): mờ mép phải cho biết còn nữa; cuộn tới cuối thì bỏ mờ. */
function legendEdge(): void {
  const lg = $('#legend')!;
  const upd = () => { lg.classList.toggle('over', lg.scrollWidth > lg.clientWidth + 2); lg.classList.toggle('end', lg.scrollLeft + lg.clientWidth >= lg.scrollWidth - 2); };
  if (!lg.dataset.w) { lg.dataset.w = '1'; lg.addEventListener('scroll', upd, { passive: true }); addEventListener('resize', upd); }
  upd();
}
export function renderMain(): void {
  const y = S.year, R = regime2(y), e = tourEra() || eraOf(y), pk = optOf(e);
  showYear(y);
  $('#eraNo')!.textContent = `Chương ${e.n}/6 · Thế hệ ${e.n}`;
  $('#eraT')!.textContent = e.title;
  const er = $('#eraR')!;
  er.innerHTML = pk ? `${av(pk.guide)}${esc(pk.label)}` : isPlay() ? 'Chưa chọn' : '◆ Chọn hướng';
  if (pk) { er.dataset.a = 'fig'; er.dataset.id = pk.guide; }
  else if (!isPlay()) { er.dataset.a = 'pickera'; er.dataset.id = e.id; } // Đọc sử: điểm rẽ của chương, không bắt buộc
  else delete er.dataset.a;
  $('#lbl')!.textContent = R.label;
  const pp = pop(y);
  $('#popl')!.textContent = pp ? `Dân số ${pp[1]} · ${pp[0]}` : 'Dân số: chưa có số liệu';
  $('#legend')!.innerHTML = R.legend
    .map(k => `<span${pk && pk.fac === k ? ' style="font-weight:600"' : ''}>${flag(k)}${F[k].n}${pk && pk.fac === k ? ' · bạn' : ''}</span>`)
    .join('') + (isPlay() ? '<span class="sep"></span>' + powersAt(y).map(k => relChip(k, y)).join('') : '');
  legendEdge();
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

/** Trò chơi: sau một thẻ / mùa màng, đi tiếp luồng đang chạy (tour tạm dừng, hoặc năm đích còn thẻ bắt buộc). */
export function continueFlow(): void {
  if (isTourPaused()) { resumeTour(); return; }
  // setYear mở thẻ bắt buộc kế tiếp hoặc điểm rẽ / kết cục; openGate và endGame xoá flowTo, hoặc setYear khi hết việc.
  if (rt.flowTo != null) { setYear(rt.flowTo, true); return; }
  renderMain();
}

let shownRes: Record<string, number> | null = null, resKey = '';
function renderRes(): void {
  const el = $('#res')!;
  el.hidden = !isPlay();
  if (!isPlay()) { shownRes = null; resKey = ''; return; }
  // Số nổi lên khi gia sản đổi so với lần cuối thấy rõ màn chính (không có bảng che, kể cả bảng đang đóng).
  const covered = !!document.querySelector('#layer .scrim, #layer .ov, #app > .exiting');
  const key = RES.map(([k]) => S.res[k]).join(',') + (covered ? 'c' : 'o');
  if (key === resKey) return; // không dựng lại mỗi khung hình: giữ số nổi đang bay
  resKey = key;
  el.innerHTML = RES.map(([k, n, ic]) => {
    const d = shownRes && !covered ? S.res[k] - shownRes[k] : 0;
    return `<div class="mt r${S.res[k] <= 10 ? ' low' : ''}"><span><span><i>${ic}</i> ${n}</span><b>${S.res[k]}</b>${d ? `<em class="delta ${d > 0 ? 'up' : 'dn'}">${d > 0 ? '+' : ''}${d}</em>` : ''}</span><i><b style="width:${S.res[k]}%"></b></i></div>`;
  }).join('');
  if (!covered) shownRes = { ...S.res };
}

function renderCard(): void {
  const c = $('#card')!, y = S.year;
  // Đọc sử: điểm rẽ không bắt buộc, nên tới 2026 là xem được kết luận (chương chưa chọn để trống), kèm lối quay lại
  // điểm rẽ sớm nhất còn bỏ ngỏ. Trò chơi: luôn đủ sáu (điểm rẽ chặn dòng thời gian).
  const miss = ERAS.filter(e => !S.picks[e.id]);
  if (y >= Y1 && (!isPlay() || !miss.length)) {
    c.className = 'card cta';
    const m = miss[0];
    c.innerHTML = `<button class="c" data-a="end"><div class="mono" style="opacity:.75">Hành trình hoàn tất</div><div class="t">Xem kết luận: con đường của bạn và lịch sử</div><div class="s">${m ? `Còn ${miss.length} điểm rẽ chưa chọn (◆ để chọn, từ năm ${m.cy}); kết luận để trống các chương đó.` : '168 năm, sáu thế hệ, mọi nhánh hội tụ về hôm nay.'}</div></button>${m ? `<button class="rb" data-a="pickera" data-id="${m.id}" aria-label="Chọn điểm rẽ năm ${m.cy}">◆</button>` : '<button class="rb" data-a="end" aria-label="Xem kết luận">→</button>'}`;
    return;
  }
  const v = rt.focusEv, pk = v ? curPick(chYear(v)) : undefined;
  // Trò chơi: thẻ trên bản đồ đọc sự kiện bằng giọng của phe dòng họ đang theo (tóm tắt vẫn có trong lời kể và màn chi tiết)
  const minePv = isPlay() && pk && SIDE_PV.includes(pk.persp) ? v?.v?.find(([p]) => p === pk.persp)?.[1] : undefined;
  c.className = 'card' + (v && v.diary ? ' diary' : '');
  if (!v) {
    c.innerHTML = `<div class="c"><div class="mono muted">Kéo dòng thời gian</div><div class="t">Mỗi năm một trang hồ sơ</div><div class="s">Phóng to bản đồ, chạm vào một vùng để xem nó thuộc về ai.</div></div>`;
    return;
  }
  const seen = S.seen.includes(v.id);
  const card = ownCard(v) ? cardOf(v) : undefined, open = card && needsDecision(v), must = open && (mustDecide(v) || !!specialFor(v));
  const hc = homeChoice(v); // nhật ký: nói rõ cả họ ở nhà đã chọn gì, người viết (bạn) đi đường riêng
  if (must) c.className += ' must';
  // dựng lại thẻ (‹ / › bằng bàn phím): giữ tiêu điểm trên nút tương ứng thay vì để rơi về <body>
  const f = c.contains(document.activeElement) ? document.activeElement as HTMLElement : null, fa = f?.dataset.a, fd = f?.dataset.d;
  c.innerHTML = `<button class="c" data-a="ev" data-id="${v.id}"><div class="mono muted"${v.diary ? ' style="color:var(--acc)"' : ''}>${v.diary ? '✎ Nhật ký dòng họ' : v.k} · ${v.d}${v.y < y ? ` · ${y - v.y} năm trước` : ''}${seen ? ' · đã đọc' : ''}</div><div class="t">${esc(v.t)}</div>${minePv ? `<div class="s"><b class="pvl">Phe bạn:</b> ${esc(minePv)}</div>` : hc ? `<div class="s"><b class="pvl">Ở nhà</b> cả họ “${esc(hc.ch[0])}”${hc.al > 0 ? ':' : '; riêng bạn:'} ${esc(v.s)}</div>` : `<div class="s">${esc(v.s)}</div>`}</button>
    <div class="nav">${card ? `<button class="rb${open ? ' act' : ''}" data-a="card" data-id="${v.id}" aria-label="${open ? 'Dòng họ bạn làm gì?' : 'Xem quyết định'}">${open ? '◆' : '✓'}</button>` : `<button class="rb" data-a="step" data-d="-1" aria-label="Sự kiện trước">‹</button>`}<button class="rb" data-a="step" data-d="1" aria-label="Sự kiện sau">›</button></div>`;
  if (f) (c.querySelector<HTMLElement>(`[data-a="${fa}"]${fd ? `[data-d="${fd}"]` : ''}`) || c.querySelector<HTMLElement>('.c'))?.focus({ preventScroll: true });
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
  const ce = (tourEra() || eraOf(S.year)).id;
  t.querySelectorAll<HTMLElement>('.sg').forEach(n => { const id = n.dataset.e!; n.className = 'sg' + (id === ce ? ' cur' : S.picks[id] ? ' done' : ''); });
  t.querySelectorAll<HTMLElement>('.cp').forEach(n => { const id = n.dataset.e!; n.className = 'cp' + (S.picks[id] ? ' done' : rt.gate?.id === id ? ' pend' : ''); });
  $('#thumb')!.style.left = pct(S.year) + '%';
  const tl = $('#tl')!;
  tl.setAttribute('aria-valuenow', String(S.year));
  tl.setAttribute('aria-valuetext', `Năm ${S.year}, chương ${(tourEra() || eraOf(S.year)).n}`);
}

const pendingGate = (y: number): Era | undefined => ERAS.find(e => !S.picks[e.id] && e.cy <= y);
let lastTick = 0;

/** Move to year `y`, stopping at the first unanswered turning point. `open` shows that turning point. */
export function setYear(yIn: number, open = false): void {
  let y = Math.max(Y0, Math.min(Y1, Math.round(yIn)));
  // Đọc sử: thanh năm đi tự do (không kéo về điểm rẽ chưa chọn); điểm rẽ chỉ mở khi chủ ý tới đúng năm của nó
  // (bắt đầu, xem hết chương). Trò chơi: dừng ở điểm rẽ chưa chọn như trước.
  const pend = isPlay() ? pendingGate(y) : open ? ERAS.find(e => !S.picks[e.id] && e.cy === y) : undefined;
  rt.gate = null;
  rt.card = null;
  if (pend) { y = pend.cy; rt.gate = pend; }
  // Chế độ Chơi: dừng ở thẻ sự kiện bắt buộc chưa quyết định; điểm rẽ cùng năm đi trước.
  const pc = pendingCard(y);
  // thẻ còn nợ của một chương trước (kể cả Điện Biên Phủ, Genève: cùng năm 1954 nhưng thuộc chương 4) đi trước điểm rẽ
  if (pc && (!pend || pc.y < pend.cy || ERAS.indexOf(evEra(pc)) < ERAS.indexOf(pend))) { y = pc.y; rt.card = pc; rt.gate = null; }
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
  else if (open && isPlay() && y >= Y1 && allPicked() && rt.flowTo != null) { rt.flowTo = null; endGame(ERAS[ERAS.length - 1]); }
  else if (open && rt.flowTo != null && y >= rt.flowTo) rt.flowTo = null; // tới đích mà không còn gì để mở
  $('#play')!.classList.toggle('act', canResumeChapter());
}

export function stepEv(d: number): void {
  const list = visEv(), i = rt.focusEv ? list.indexOf(rt.focusEv) : -1, j = i + d;
  if (j < 0 || j >= list.length) return;
  const v = list[j];
  if ((isPlay() && pendingGate(v.y)) || pendingCard(v.y)) { setYear(v.y, true); return; }
  S.year = v.y;
  rt.focusEv = v;
  save();
  renderMain();
}

export function initTimeline(): void {
  const sc = $('#tl')!, t = $('#trk')!;
  let drag = false;
  const at = (ev: PointerEvent) => { const r = t.getBoundingClientRect(); return Y0 + ((ev.clientX - r.left) / r.width) * (Y1 - Y0); };
  let target = S.year;
  sc.addEventListener('pointerdown', ev => { ac(); drag = true; stopTour(); sc.setPointerCapture(ev.pointerId); target = at(ev); setYear(target); });
  sc.addEventListener('pointermove', ev => { if (drag) { target = at(ev); setYear(target); } });
  const up = () => {
    if (!drag) return;
    drag = false;
    if (rt.card) { if (isPlay()) rt.flowTo = Math.min(Y1, Math.round(target)); openCard(rt.card); }
    else if (rt.gate) openGate(rt.gate);
  };
  sc.addEventListener('pointerup', up);
  sc.addEventListener('pointercancel', up);
  // bàn phím: thanh trượt năm (←/→ một năm, PageUp/PageDown mười năm, Home/End hai đầu); dừng ở điểm rẽ / thẻ như khi kéo
  sc.tabIndex = 0;
  sc.setAttribute('role', 'slider');
  sc.setAttribute('aria-label', 'Dòng thời gian');
  sc.setAttribute('aria-valuemin', String(Y0));
  sc.setAttribute('aria-valuemax', String(Y1));
  sc.addEventListener('keydown', ev => {
    const d: Record<string, number> = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1, PageUp: 10, PageDown: -10 };
    let y: number | null = null;
    if (ev.key in d) y = S.year + d[ev.key]; else if (ev.key === 'Home') y = Y0; else if (ev.key === 'End') y = Y1;
    if (y === null) return;
    ev.preventDefault();
    stopTour();
    target = Math.max(Y0, Math.min(Y1, y));
    drag = true;
    setYear(target);
    up();
  });
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
    const n = k === 'Tất cả' ? all.filter(v => !v.diary).length : all.filter(v => v.k === k).length; // như màn mở đầu: sự kiện, chưa kể trang nhật ký
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
  on('ev', el => openEvent(el.dataset.id!, (el.dataset.tab as 'x' | 'v' | 'm' | 's') || 'x')); // data-tab: mở thẳng một thẻ (Góc nhìn từ khép trận)
  on('fig', el => openFig(el.dataset.id!));
  on('end', () => (isPlay() ? endGame(ERAS[ERAS.length - 1]) : goEnd()));
  on('pickera', el => { const g = ERAS.find(x => x.id === el.dataset.id); if (g) { stopTour(); openGate(g); } });
  initTimeline();
}
