import { ERAS, F, VAL, pop, regime2, type Era } from './data';
import { S, save, rt, Y0, Y1, eraOf, evEra, curPick, optOf, chYear, values, allEv, visEv, setFocus, pct } from './state';
import { on } from './ui/actions';
import { $, esc, announce } from './ui/dom';
import { av, flag } from './ui/bits';
import { icon } from './ui/icons';
import { paintMap, paintHome, hidePop, mapBusy } from './map';
import { isPlay, pendingCard, cardOf, mustDecide, home, RES, powersAt, allPicked, needsDecision, specialFor, homeChoice, ownCard } from './play';
import { openCard, relChip } from './screens/card';
import { SND, ac } from './audio';
import { stopTour, isTourPaused, resumeTour, canResumeChapter, tourEra, tourPause } from './tour';
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

/* Kéo thanh năm / năm đếm lên vẽ lại màn chính mỗi khung hình. Chỉ ghi phần đã đổi: viết lại cùng nội dung vẫn dựng
   lại nút và ảnh (ảnh người dẫn chương nháy mất vì hiệu ứng hiện dần chạy lại), bắt trình duyệt dàn trang lại. */
const shownHtml = new WeakMap<Element, string>();
/** Thay nội dung HTML nếu khác lần trước; trả true nếu đã thay. */
function setHtml(el: Element, h: string): boolean {
  if (shownHtml.get(el) === h) return false;
  shownHtml.set(el, h);
  el.innerHTML = h;
  return true;
}
const setText = (el: Element, t: string): void => { if (el.textContent !== t) el.textContent = t; };

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
  setText($('#eraNo')!, `Chương ${e.n}/6 · Thế hệ ${e.n}`);
  setText($('#eraT')!, e.title);
  const er = $('#eraR')!;
  setHtml(er, pk ? `${av(pk.guide)}${esc(pk.label)}` : isPlay() ? 'Chưa chọn' : '◆ Chọn hướng');
  const ds = (k: 'a' | 'id', v: string) => { if (er.dataset[k] !== v) er.dataset[k] = v; };
  if (pk) { ds('a', 'fig'); ds('id', pk.guide); }
  else if (!isPlay()) { ds('a', 'pickera'); ds('id', e.id); } // Đọc sử: điểm rẽ của chương, không bắt buộc
  else if (er.dataset.a) delete er.dataset.a;
  setText($('#lbl')!, R.label);
  // ô ghi chú góc bản đồ: nhãn (năm số liệu) và con số, hai dòng hẹp, không đè tên nước ở góc trên
  const pp = pop(y);
  setHtml($('#popl')!, pp ? `<span class="cap">Dân số · ${pp[0]}</span><b>${pp[1]}</b>` : '<span class="cap">Dân số</span><b class="na">chưa có số liệu</b>');
  renderLegend(y, pk);
  paintMap();
  paintHome(isPlay() ? home()[2] : null);
  renderVals();
  renderRes();
  $('#fbtn')!.classList.toggle('act', S.filt !== 'Tất cả');
  renderCard();
  renderIndex();
  renderScrub();
}

/** Chú giải các phe của năm y (Trò chơi: kèm quan hệ với các thế lực). Xem lại diễn biến trong Trò chơi gọi với năm của
    cảnh (bản đồ vẽ biên giới năm ấy, năm đang chơi giữ nguyên). */
export function renderLegend(y = S.year, pk = optOf(tourEra() || eraOf(y))): void {
  const h = regime2(y).legend
    .map(k => `<span${pk && pk.fac === k ? ' style="font-weight:600"' : ''}>${flag(k)}${F[k].n}${pk && pk.fac === k ? ' · bạn' : ''}</span>`)
    .join('') + (isPlay() ? '<span class="sep"></span>' + powersAt(y).map(k => relChip(k, y)).join('') : '');
  if (setHtml($('#legend')!, h)) legendEdge(); // đo độ tràn (ép dàn trang) chỉ khi chú giải đổi
}

function renderVals(): void {
  const v = values();
  setHtml($('#vals')!, VAL.map(([k, n]) =>
    `<div class="mt"><span>${n}<b>${v[k]}</b></span><i><b style="width:${Math.min(100, (v[k] / 18) * 100)}%"></b></i></div>`).join(''));
}

/** Trò chơi: sau một thẻ / mùa màng, đi tiếp luồng đang chạy (tour tạm dừng, hoặc năm đích còn thẻ bắt buộc). */
export function continueFlow(): void {
  // thẻ do tour mở: tour đi tiếp. Thẻ mở từ trang sự kiện / khi đã ❚❚: tour chờ trang đóng / ▶ (theo dõi lớp phủ trong tour.ts)
  if (isTourPaused()) { if (tourPause() === 'card') resumeTour(); else renderMain(); return; }
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

/** Thẻ dưới bản đồ: chỉ dựng lại khi nội dung đổi (kéo thanh năm qua những năm cùng sự kiện: thẻ đứng yên, giữ tiêu điểm). */
function cardOut(c: HTMLElement, cls: string, h: string): boolean {
  if (c.className !== cls) c.className = cls;
  return setHtml(c, h);
}

export function renderCard(): void {
  const c = $('#card')!, y = S.year;
  // Đọc sử: điểm rẽ không bắt buộc, nên tới 2026 là xem được kết luận (chương chưa chọn để trống), kèm lối quay lại
  // điểm rẽ sớm nhất còn bỏ ngỏ. Trò chơi: luôn đủ sáu (điểm rẽ chặn dòng thời gian).
  const miss = ERAS.filter(e => !S.picks[e.id]);
  if (y >= Y1 && (!isPlay() || !miss.length)) {
    const m = miss[0];
    cardOut(c, 'card cta', `<button class="c" data-a="end"><div class="mono" style="opacity:.75">Hành trình hoàn tất</div><div class="t">Xem kết luận: con đường của bạn và lịch sử</div><div class="s">${m ? `Còn ${miss.length} điểm rẽ chưa chọn (◆ để chọn, từ năm ${m.cy}); kết luận để trống các chương đó.` : '168 năm, sáu thế hệ, mọi nhánh hội tụ về hôm nay.'}</div></button>${m ? `<button class="rb" data-a="pickera" data-id="${m.id}" aria-label="Chọn điểm rẽ năm ${m.cy}">${icon('seal', 16)}</button>` : `<button class="rb" data-a="end" aria-label="Xem kết luận">${icon('arrow')}</button>`}`);
    return;
  }
  const v = rt.focusEv, pk = v ? curPick(chYear(v)) : undefined;
  // Trò chơi: thẻ trên bản đồ đọc sự kiện bằng giọng của phe dòng họ đang theo (tóm tắt vẫn có trong lời kể và màn chi tiết)
  const minePv = isPlay() && pk && SIDE_PV.includes(pk.persp) ? v?.v?.find(([p]) => p === pk.persp)?.[1] : undefined;
  let cls = 'card' + (v && v.diary ? ' diary' : '');
  if (!v) {
    cardOut(c, cls, `<div class="c"><div class="mono muted">Kéo dòng thời gian</div><div class="t">Mỗi năm một trang hồ sơ</div><div class="s">Phóng to bản đồ, chạm vào một vùng để xem nó thuộc về ai.</div></div>`);
    return;
  }
  const seen = S.seen.includes(v.id);
  const card = ownCard(v) ? cardOf(v) : undefined, open = card && needsDecision(v), must = open && (mustDecide(v) || !!specialFor(v));
  const hc = homeChoice(v); // nhật ký: nói rõ cả họ ở nhà đã chọn gì, người viết (bạn) đi đường riêng
  if (must) cls += ' must';
  // dựng lại thẻ (‹ / › bằng bàn phím): giữ tiêu điểm trên nút tương ứng thay vì để rơi về <body>
  const f = c.contains(document.activeElement) ? document.activeElement as HTMLElement : null, fa = f?.dataset.a, fd = f?.dataset.d;
  if (!cardOut(c, cls, `<button class="c" data-a="ev" data-id="${v.id}"><div class="mono muted"${v.diary ? ' style="color:var(--acc)"' : ''}>${v.diary ? 'Nhật ký dòng họ' : v.k} · ${v.d}${v.y < y ? ` · ${y - v.y} năm trước` : ''}${seen ? ' · đã đọc' : ''}</div><div class="t">${esc(v.t)}</div>${minePv ? `<div class="s"><b class="pvl">Phe bạn:</b> ${esc(minePv)}</div>` : hc ? `<div class="s"><b class="pvl">Ở nhà</b> cả họ “${esc(hc.ch[0])}”${hc.al > 0 ? ':' : '; riêng bạn:'} ${esc(v.s)}</div>` : `<div class="s">${esc(v.s)}</div>`}</button>
    <div class="nav">${card ? `<button class="rb${open ? ' act' : ''}" data-a="card" data-id="${v.id}" aria-label="${open ? 'Dòng họ bạn làm gì?' : 'Xem quyết định'}">${icon(open ? 'seal' : 'check', 16)}</button>` : `<button class="rb" data-a="step" data-d="-1" aria-label="Sự kiện trước">${icon('prev')}</button>`}<button class="rb" data-a="step" data-d="1" aria-label="Sự kiện sau">${icon('next')}</button></div>`)) return;
  if (f) (c.querySelector<HTMLElement>(`[data-a="${fa}"]${fd ? `[data-d="${fd}"]` : ''}`) || c.querySelector<HTMLElement>('.c'))?.focus({ preventScroll: true });
}

/* ---------- mục lục chương (cột bên, màn hình ngang) ---------- */
/** Cột bên màn hình ngang (styles.css, cùng điều kiện): ở đó mới có chỗ cho mục lục. */
const side = matchMedia('(min-width: 1000px) and (min-aspect-ratio: 1/1) and (min-height: 600px)');
const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI'];
let idxKey = '', idxOn = '', idxT = 0;
/** Mục lục các sự kiện của chương đang xem (theo bộ lọc): năm, tên, loại; sự kiện đang xem gạch chân đỏ. Chạm một dòng
    để tới sự kiện ấy. Trước đây cột bên trống gần nửa dưới thẻ sự kiện. Chỉ dựng lại khi chương / bộ lọc / số đã đọc đổi. */
function renderIndex(): void {
  if (!side.matches) return;
  const box = $('#idx')!, e = tourEra() || eraOf(S.year);
  const key = e.id + S.filt + S.seen.length;
  if (key !== idxKey) {
    idxKey = key; idxOn = '';
    const L = visEv().filter(v => evEra(v) === e);
    box.innerHTML = `<div class="cap muted">Mục lục chương ${ROMAN[e.n]} · ${e.from} – ${e.to >= Y1 ? 'nay' : e.to}</div><ol>${L.map(v =>
      `<li><button data-a="idx" data-id="${v.id}"${S.seen.includes(v.id) ? ' class="seen"' : ''}><b>${v.y}</b><span>${esc(v.t)}</span><em>${v.diary ? 'Nhật ký' : v.k}</em></button></li>`).join('')}</ol>`;
  }
  const id = rt.focusEv?.id || '';
  if (id === idxOn) return;
  idxOn = id;
  box.querySelector('.on')?.classList.remove('on');
  const b = id ? box.querySelector<HTMLElement>(`[data-id="${id}"]`) : null;
  b?.classList.add('on');
  // dòng đang xem luôn trong khung, nhưng chỉ cuộn khi thanh năm đã yên (cuộn giữa lúc kéo là ép dàn trang mỗi khung)
  clearTimeout(idxT);
  if (b) idxT = window.setTimeout(() => b.isConnected && b.scrollIntoView({ block: 'nearest' }), 160);
}
side.addEventListener('change', () => { idxKey = ''; idxOn = ''; renderIndex(); });

/** Tới một sự kiện (mục lục): như ‹ / ›, kể cả dừng ở điểm rẽ / thẻ còn nợ trong Trò chơi. */
function goEv(id: string): void {
  const v = visEv().find(x => x.id === id);
  if (!v) return;
  stopTour();
  if ((isPlay() && pendingGate(v.y)) || pendingCard(v.y)) { setYear(v.y, true); return; }
  S.year = v.y;
  rt.focusEv = v;
  save();
  renderMain();
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
  const ce = (tourEra() || eraOf(S.year)).id, cn = (n: Element, c: string) => { if (n.className !== c) n.className = c; };
  t.querySelectorAll<HTMLElement>('.sg').forEach(n => { const id = n.dataset.e!; cn(n, 'sg' + (id === ce ? ' cur' : S.picks[id] ? ' done' : '')); });
  t.querySelectorAll<HTMLElement>('.cp').forEach(n => { const id = n.dataset.e!; cn(n, 'cp' + (S.picks[id] ? ' done' : rt.gate?.id === id ? ' pend' : '')); });
  $('#thumb')!.style.left = pct(S.year) + '%';
  const tl = $('#tl')!, at = (k: string, v: string) => { if (tl.getAttribute(k) !== v) tl.setAttribute(k, v); };
  at('aria-valuenow', String(S.year));
  at('aria-valuetext', `Năm ${S.year}, chương ${(tourEra() || eraOf(S.year)).n}`);
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
    if (y !== S.year) hidePop(); // khung tỉnh ghi năm nó được mở
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
  // hai đầu: chạm vào nhãn "1858" / "NAY" hay sát mép là đúng năm đầu / năm cuối (năm 2026 có thẻ kết luận; trên điện
  // thoại một năm chỉ ~1,8 px, nhãn NAY canh phải nên giữa nhãn rơi vào ~2021)
  // khung thanh năm đo một lần lúc chạm (không đứng yên thì cũng không đổi trong lúc kéo): mỗi lần đọc
  // getBoundingClientRect ngay sau khi vẽ lại màn chính là một lần ép dàn trang
  let r = t.getBoundingClientRect();
  const at = (ev: PointerEvent) => {
    const d = ev.type === 'pointerdown' ? (ev.target as Element).closest?.('.dec') : null;
    if (ev.clientX >= r.right - 6 || d?.classList.contains('r')) return Y1;
    if (ev.clientX <= r.left + 6 || d?.classList.contains('l')) return Y0;
    return Y0 + ((ev.clientX - r.left) / r.width) * (Y1 - Y0);
  };
  let target = S.year;
  sc.addEventListener('pointerdown', ev => { ac(); drag = true; stopTour(); sc.setPointerCapture(ev.pointerId); r = t.getBoundingClientRect(); mapBusy(true); target = at(ev); setYear(target); });
  // một lần vẽ lại mỗi khung hình: màn cảm ứng có thể báo hai lần chạm di chuyển trong một khung
  let pend = 0;
  sc.addEventListener('pointermove', ev => { if (drag) { target = at(ev); pend ||= requestAnimationFrame(() => { pend = 0; if (drag) setYear(target); }); } });
  const up = () => {
    if (!drag) return;
    drag = false;
    if (pend) { cancelAnimationFrame(pend); pend = 0; setYear(target); }
    mapBusy(false);
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

/** Đóng menu lọc; `back`: tiêu điểm về nút ≡ (Escape, vừa chọn), không rơi về <body>. */
function closeFilter(back = false): void {
  $('#fmenu')?.remove();
  $('#fbtn')!.setAttribute('aria-expanded', 'false');
  if (back) $('#fbtn')!.focus({ preventScroll: true });
}
function toggleFilter(): void {
  let m = $('#fmenu');
  if (m) { closeFilter(); return; }
  const all = allEv();
  m = document.createElement('div');
  m.id = 'fmenu';
  m.className = 'fmenu';
  m.innerHTML = KINDS.map(k => {
    const n = k === 'Tất cả' ? all.filter(v => !v.diary).length : all.filter(v => v.k === k).length; // như màn mở đầu: sự kiện, chưa kể trang nhật ký
    return `<button class="${S.filt === k ? 'on' : ''}" data-a="filt" data-k="${k}">${k}<span>${n}</span></button>`;
  }).join('');
  $('#mapwrap')!.appendChild(m);
  $('#fbtn')!.setAttribute('aria-expanded', 'true');
  // tiêu điểm rời menu (Tab đi chỗ khác): đóng, không để menu treo trên bản đồ
  m.addEventListener('focusout', ev => { const t = ev.relatedTarget as Element | null; if (t && !t.closest('#fmenu, #fbtn')) closeFilter(); });
}

export function initMainControls(): void {
  $('#fbtn')!.setAttribute('aria-expanded', 'false');
  // Escape (tiêu điểm ở menu hay còn ở nút ≡): chỉ đóng menu, không đóng trang / bảng nào khác
  document.addEventListener('keydown', ev => { if (ev.key === 'Escape' && $('#fmenu') && !$('#layer')!.children.length) { ev.stopPropagation(); closeFilter(true); } }, true);
  $('#fbtn')!.addEventListener('click', e => { e.stopPropagation(); toggleFilter(); });
  document.addEventListener('click', e => {
    const m = $('#fmenu'), t = e.target as Element;
    if (m && !t.closest('#fmenu') && !t.closest('#fbtn')) closeFilter();
  });
  on('filt', (el, ev) => { ev.stopPropagation(); S.filt = el.dataset.k!; save(); setFocus(); closeFilter(true); renderMain(); announce(`Lọc: ${S.filt}`); });
  on('step', el => stepEv(+el.dataset.d!));
  on('idx', el => { ac(); SND.page(); goEv(el.dataset.id!); });
  on('ev', el => openEvent(el.dataset.id!, (el.dataset.tab as 'x' | 'v' | 'm' | 's') || 'x')); // data-tab: mở thẳng một thẻ (Góc nhìn từ khép trận)
  on('fig', el => openFig(el.dataset.id!));
  on('end', () => (isPlay() ? endGame(ERAS[ERAS.length - 1]) : goEnd()));
  on('pickera', el => { const g = ERAS.find(x => x.id === el.dataset.id); if (g) { stopTour(); openGate(g); } });
  initTimeline();
}
