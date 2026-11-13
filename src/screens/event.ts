import { isPlay, decided, homeChoice, ownCard } from '../play';
import { mood } from '../music';
import { isTouring } from '../tour';
import { EV, EVFIG, FIG, P, SRC } from '../data';
import { S, save, rt, allEv, evEra, chYear, curPick, figOpen } from '../state';
import { av } from '../ui/bits';
import { icon } from '../ui/icons';
import { on } from '../ui/actions';
import { $, esc, layer, clearLayer, remember } from '../ui/dom';
import { checkBadges } from '../badges';
import { hush, speak } from '../narration';
import { evKey, evSpeechFull } from '../speech';
import { stopTour, pauseTour, resumeTour } from '../tour';
import { hidePop } from '../map';
import { renderMain } from '../view';
import { wikiFor, cachedWiki, probe, mediaCaption, commonsPage, type WikiInfo } from '../wiki';
import { openMedia } from './lightbox';
import { openSrc } from './sources';
import { canReplay, closeReplay } from '../replay';
import type { HistEvent } from '../data';
import { setTab, type TabId } from '../tabs';
import { openFig } from './figures';

type Tab = 'x' | 'v' | 'm' | 's';
/** Góc nhìn sử học nào là "của phe" dòng họ theo (sử liệu quốc tế, Pháp không phải tiếng nói của phe người chơi). */
export const SIDE_PV = ['vn', 'vnch', 'nguyen'];
const TABS: [Tab, string][] = [['x', 'Diễn biến'], ['v', 'Góc nhìn'], ['m', 'Ảnh, phim'], ['s', 'Nguồn']];
const closeBtn = `<button class="back" data-a="close" aria-label="Đóng">${icon('prev', 20)}</button>`;
/** nút Nghe / Dừng: hai nhãn sẵn trong nút, data-on chọn nhãn (narration.ts hush() gỡ data-on khi lời đọc dừng) */
const LISTEN = `<span class="l1">${icon('listen', 16)}Nghe</span><span class="l2">${icon('stop', 14)}Dừng</span>`;

/** Trang sự kiện mở từ bảng Nhân vật / Sử liệu / Hồ sơ (và thẻ nhân vật đang mở): đóng thì về lại đó, không về bản đồ trống.
    Đích quay về ghi trên chính trang (data-ret), suy từ những gì đang thật sự mở (không từ thanh tab, có thể đã cũ). */
/** `id`: sự kiện của trang (quay về bảng thì tiêu điểm về đúng dòng của nó trong bảng). */
type Ret = { tab: TabId; fig?: string; id?: string };
export function openEvent(id: string, tab: Tab = 'x', retIn?: string): void {
  const v = allEv().find(x => x.id === id);
  if (!v) return;
  const prevOv = layer.querySelector<HTMLElement>(':scope > .ov');
  let ret: string | undefined = retIn ?? prevOv?.dataset.ret; // từ trang sự kiện khác / phần xem lại: giữ đích cũ
  if (retIn === undefined && !prevOv) {
    const pane = layer.querySelector(':scope > .pane'), fig = [...layer.querySelectorAll<HTMLElement>(':scope > .scrim[data-fig]')].pop()?.dataset.fig;
    const t = (pane ? document.querySelector<HTMLElement>('#tabs .tab.on')?.dataset.t || 'map' : 'map') as TabId;
    ret = t !== 'map' || fig ? JSON.stringify({ tab: t, fig, id } as Ret) : undefined;
  }
  const who = document.activeElement; // đóng trang thì tiêu điểm về nút đã mở nó
  if (document.getElementById('replb')) closeReplay(false); // đang xem lại diễn biến: dừng hẳn trước khi mở trang
  if (isTouring()) pauseTour('overlay'); else stopTour(); // đóng trang thì tour chạy tiếp từ đúng bước này (cả Đọc sử)
  hidePop();
  if (!S.seen.includes(id)) { S.seen.push(id); save(); }
  const e = evEra(v), pk = curPick(chYear(v)), mine = pk?.persp;

  if (v.diary) {
    const real = EV.find(x => x.y === v.y), home0 = homeChoice(v); // người viết nhật ký đi xa; ở nhà, cả họ đã quyết thế này
    layer.innerHTML = `<div class="ov evp"><div class="evtop">${closeBtn}<span class="mono muted">Thế hệ ${e.n} · ${e.title}</span></div>
     <div style="margin-top:22px"><span class="stamp acc">Nhật ký dòng họ · ${v.y}</span></div>
     <h1 style="margin:16px 0 6px;font-size:32px">${esc(v.t)}</h1><div class="dbl"></div>
     <p style="font:italic 400 21px/1.45 var(--serif)">${esc(v.s)}</p>
     ${home0 ? `<div class="pv mine" style="margin-top:18px"><div class="mono muted">Ở nhà · ${home0.v.y} · ${esc(home0.v.t)}</div><p style="font-size:16px;margin-top:3px">Dòng họ đã chọn “${esc(home0.ch[0])}”. ${esc(home0.ch[3])}${home0.al > 0 ? '' : ' Người viết những dòng này đi đường riêng.'}</p></div>` : ''}
     <p class="muted" style="font-size:14px;margin-top:18px">Trang nhật ký hư cấu, đặt trong bối cảnh có thật, mở ra vì bạn chọn "${esc(pk ? pk.label : '')}".</p>
     ${real ? `<div class="rule"></div><div class="mono muted">Cùng năm ${v.y} trong sử liệu</div><button class="src" data-a="ev" data-id="${real.id}"><div class="tt"><h3>${esc(real.t)}</h3><span class="mono muted">${real.k}</span></div></button>` : ''}</div>`;
    pageFocus(who, ret);
    return;
  }

  const vs = [...v.v].sort((a, b) => Number(b[0] === mine) - Number(a[0] === mine));
  layer.innerHTML = `<div class="ov evp">
  <div class="evtop">${closeBtn}<span class="mono muted">Chương ${e.n} · ${esc(e.title)}</span>${ownCard(v) ? `<button class="chip${decided(v.id) ? '' : ' on'}" data-a="card" data-id="${v.id}">${decided(v.id) ? '✓ Đã quyết' : `${icon('seal', 12)}Dòng họ làm gì?`}</button>` : ''}<button class="chip nbtn" data-a="listen" data-id="${v.id}">${LISTEN}</button></div>
  <figure class="hfig"><div class="hero"><image-slot id="ev-${v.id}" shape="rect" busy placeholder="Đang tìm ảnh tư liệu…"></image-slot><button class="hzoom" id="hzoom" hidden aria-label="Xem ảnh lớn">${icon('zoom', 16)}</button>${canReplay(v) ? `<button class="hplay" data-a="replay" data-id="${v.id}">${icon('play', 14)}Xem diễn biến</button>` : ''}</div><figcaption class="hcap" id="hcap-${v.id}" hidden></figcaption></figure>
  <div class="evk mono"><span>${v.k}</span> · ${v.d}</div>
  <h1 class="evh">${esc(v.t)}</h1>
  ${v.p && v.p !== v.t ? `<div class="evp-p">${esc(v.p)}</div>` : ''}
  <div class="dbl"></div>
  <div class="seg" id="et" role="tablist">${TABS.map(([k, l]) => `<button role="tab" id="et-${k}" data-k="${k}" aria-controls="eb" aria-selected="${k === tab}" tabindex="${k === tab ? 0 : -1}" class="${k === tab ? 'on' : ''}">${l}</button>`).join('')}</div>
  <div id="eb" style="margin-top:16px" role="tabpanel"></div></div>`;

  const body = (k: Tab): string => {
    if (k === 'x') {
      return `<p style="font-size:19px;line-height:1.38">${esc(v.s)}</p>${v.x ? `<p style="margin-top:12px" class="muted">${esc(v.x)}</p>` : ''}
     ${isPlay() && mine && SIDE_PV.includes(mine) && vs.some(([pp]) => pp === mine) ? `<div class="pv mine" style="margin-top:12px"><div class="mono muted">Phe bạn theo nhìn nhận · ${P[mine]}</div><q>${esc(vs.find(([pp]) => pp === mine)![1])}</q></div>` : ''}
     ${v.qt ? `<button class="quote" data-a="src" data-id="${v.qt.src}"><blockquote>${esc(v.qt.t)}</blockquote><div class="mono muted" style="margin-top:8px">— ${esc(v.qt.by)}</div></button>` : ''}
     ${v.n ? `<div class="nums">${v.n.map(([a, b]) => `<div><span class="muted">${esc(a)}</span><b>${esc(b)}</b></div>`).join('')}</div><p class="muted" style="font-size:13px;margin-top:6px">Số liệu ước tính, khác nhau giữa các nguồn.</p>` : ''}
     <div id="mstrip"></div>
     ${(EVFIG[v.id] || []).filter(id => FIG[id]).length ? `<div class="mono muted" style="margin-top:18px">Nhân vật</div><div class="figrow">${(EVFIG[v.id] || []).filter(id => FIG[id]).map(id => `<button data-a="fig" data-id="${id}"${figOpen(id) ? '' : ' aria-label="Nhân vật chưa mở"'}>${av(id, 44, !figOpen(id))}<span><b>${esc(FIG[id][0].replace(/\s*\(.*\)\s*$/, ''))}</b><br><span class="muted">${esc(FIG[id][2])}</span></span></button>`).join('')}</div>` : ''}
     ${pk ? `<div class="pv mine" style="margin-top:18px"><div class="mono muted">Gia đình bạn đang theo · ${esc(pk.label)}</div><p style="font-size:16px;margin-top:4px">${esc(pk.out)}</p></div>` : ''}`;
    }
    if (k === 'v') {
      if (!S.pvSeen.includes(v.id)) { S.pvSeen.push(v.id); save(); }
      return vs.map(([pp, tx]) => `<div class="pv${pp === mine ? ' mine' : ''}"><div class="pvh"><span class="mono muted">${P[pp]}</span>${pp === mine ? '<span class="mono" style="color:var(--acc)">Gần lựa chọn của bạn</span>' : ''}</div><q>${esc(tx)}</q></div>`).join('') +
        `<p class="muted" style="font-size:14px;margin-top:14px">Các góc nhìn được tóm lược từ sử liệu công khai, xếp ngang hàng nhau. Ứng dụng không đứng về phía nào.</p>`;
    }
    if (k === 'm') return `<div class="skel" style="height:120px;border-radius:14px"></div><div class="mgrid" style="margin-top:18px">${'<div class="skel" style="aspect-ratio:4/3;border-radius:10px"></div>'.repeat(6)}</div>`;
    return v.src.map(sid => {
      const s = SRC.find(x => x.id === sid)!;
      return `<button class="src" data-a="src" data-id="${sid}"><div class="tt"><h3>${esc(s.t)}</h3><span class="mono muted">${s.k}</span></div><div class="muted" style="font-size:15px;margin-top:3px">${esc(s.at)}</div></button>`;
    }).join('');
  };
  const show = (k: Tab) => {
    $('#eb')!.innerHTML = body(k);
    layer.querySelectorAll<HTMLElement>('#et button').forEach(b => { const o = b.dataset.k === k; b.classList.toggle('on', o); b.setAttribute('aria-selected', String(o)); b.tabIndex = o ? 0 : -1; });
    $('#eb')!.setAttribute('aria-labelledby', 'et-' + k);
    if (k === 'x') cachedWiki(v.id)?.then(w => { if (w && w.media.length) fillStrip(v, w); });
    if (k === 'm') mediaTab(v);
  };
  layer.querySelectorAll<HTMLElement>('#et button').forEach(b => (b.onclick = () => show(b.dataset.k as Tab)));
  // bàn phím: một điểm dừng Tab cho cả dải thẻ, ←/→ (Home/End) chuyển thẻ và mở luôn
  layer.querySelector<HTMLElement>('#et')!.addEventListener('keydown', ev => {
    const bs = [...layer.querySelectorAll<HTMLElement>('#et button')], i = bs.indexOf(ev.target as HTMLElement);
    if (i < 0) return;
    const j = ev.key === 'ArrowRight' ? (i + 1) % bs.length : ev.key === 'ArrowLeft' ? (i - 1 + bs.length) % bs.length : ev.key === 'Home' ? 0 : ev.key === 'End' ? bs.length - 1 : -1;
    if (j < 0) return;
    ev.preventDefault();
    bs[j].focus();
    show(bs[j].dataset.k as Tab);
  });
  show(tab);
  loadHero(v);
  pageFocus(who, ret);
}
/** Trang sự kiện vừa mở: tiêu điểm lên tiêu đề (trình đọc đọc tên sự kiện), nhớ nút đã mở để đóng thì trả về. */
function pageFocus(who: Element | null, ret?: string): void {
  const ov = layer.querySelector<HTMLElement>(':scope > .ov'), h1 = ov?.querySelector<HTMLElement>('h1');
  if (!ov) return;
  if (ret) ov.dataset.ret = ret;
  remember(ov, who);
  if (h1) { h1.tabIndex = -1; h1.focus({ preventScroll: true }); }
}

/** Header image: first media item that actually loads; otherwise keep the placeholder. */
async function loadHero(v: HistEvent): Promise<void> {
  const w = await wikiFor(v);
  const imgs = w ? w.media.filter(m => m.type === 'image') : [];
  for (const m of imgs) {
    if (!document.getElementById('ev-' + v.id)) return;
    if (!(await probe(m.src, 60))) { m.bad = true; continue; }
    const sl = document.getElementById('ev-' + v.id);
    if (!sl) return;
    const tall = await aspect(m.src);
    if (!document.getElementById('ev-' + v.id)) return;
    sl.closest('.hero')?.classList.toggle('tall', tall);
    if (tall) sl.setAttribute('focus', 'object-fit:contain;object-position:50% 50%');
    sl.setAttribute('src', m.src);
    const cap = document.getElementById('hcap-' + v.id);
    if (cap) { cap.innerHTML = `${esc(mediaCaption(m))} · <a href="${esc(commonsPage(m))}" target="_blank" rel="noopener">Wikimedia Commons</a>`; cap.hidden = false; }
    const z = $<HTMLButtonElement>('#hzoom');
    if (z) { z.hidden = false; z.onclick = () => openMedia(v.id, w!.media.indexOf(m)); }
    break;
  }
  const sl = document.getElementById('ev-' + v.id);
  sl?.removeAttribute('busy');
  if (sl && !sl.getAttribute('src')) sl.setAttribute('placeholder', 'Ảnh tư liệu chưa có');
  if (w && w.media.length) fillStrip(v, w);
}

/** A failed thumbnail becomes a hatched "ẢNH TƯ LIỆU" tile and is dropped from the viewer. */
function wireTiles(root: HTMLElement, v: HistEvent, w: WikiInfo): void {
  root.querySelectorAll<HTMLImageElement>('img[data-i]').forEach(img => {
    if (img.complete && img.naturalWidth) img.classList.add('in');
    else img.addEventListener('load', () => img.classList.add('in'), { once: true });
    img.addEventListener('error', () => {
      const b = img.parentElement;
      img.remove();
      const m = w.media[+img.dataset.i!];
      if (m) m.bad = true;
      if (b) { b.classList.add('ph'); delete b.dataset.a; }
    }, { once: true });
  });
  root.dataset.ev = v.id;
}

const tile = (v: HistEvent, w: WikiInfo, i: number) => {
  const m = w.media[i];
  return `<button data-a="media" data-id="${v.id}" data-i="${i}" aria-label="Xem tư liệu ${i + 1}"><img src="${m.thumb || m.src}" alt="" loading="lazy" data-i="${i}">${m.type === 'video' ? `<span class="vplay">${icon('play', 22)}</span>` : ''}</button>`;
};

function fillStrip(v: HistEvent, w: WikiInfo): void {
  const st = document.getElementById('mstrip');
  if (!st || st.dataset.f) return;
  const list = w.media.map((m, i) => [m, i] as const).filter(([m]) => !m.bad);
  if (!list.length) return;
  st.dataset.f = '1';
  st.innerHTML = `<div class="row sb" style="margin-top:20px"><span class="mono muted">Tư liệu hình ảnh · ${list.length}${w.media.some(m => m.type === 'video') ? ' · có video' : ''}</span><button class="mono" style="color:var(--acc)" data-a="mtab">Xem tất cả ›</button></div>
   <div class="mstrip">${list.map(([, i]) => tile(v, w, i)).join('')}</div>`;
  wireTiles(st, v, w);
}

const ascii = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');

async function mediaTab(v: HistEvent): Promise<void> {
  const w = await wikiFor(v);
  const eb = $('#eb');
  if (!eb || !layer.querySelector('#et button[data-k="m"].on')) return;
  const q = (w && w.en ? w.en.replace(/\s*\(.*?\)/g, '') : ascii(v.t)) + (w && w.en ? '' : ' Vietnam');
  const films = ([
    v.y >= 1895 ? ['CriticalPast', 'Phim tư liệu lịch sử, chủ yếu từ lưu trữ Mỹ', 'https://www.criticalpast.com/stock-footage-video/' + encodeURIComponent(q).replace(/%20/g, '+')] : null,
    ['Internet Archive', 'Phim, ảnh thuộc phạm vi công cộng', 'https://archive.org/search?query=' + encodeURIComponent(q) + '&and%5B%5D=mediatype%3A%22movies%22'],
    ['Wikimedia Commons', 'Video tự do bản quyền', 'https://commons.wikimedia.org/w/index.php?title=Special:MediaSearch&type=video&search=' + encodeURIComponent(q)],
  ].filter(Boolean) as [string, string, string][]);
  const good = w ? w.media.map((m, i) => [m, i] as const).filter(([m]) => !m.bad) : [];
  eb.innerHTML = (w
    ? `<div class="pv"><div class="row sb"><span class="mono muted">Wikipedia tiếng Việt</span><a href="${esc(w.url)}" target="_blank" rel="noopener" class="mono">Đọc bài ↗</a></div><h3 style="margin-top:6px">${esc(w.title)}</h3>${w.ext ? `<p class="clamp4" style="font-size:15.5px;margin-top:6px;line-height:1.35">${esc(w.ext)}</p>` : ''}</div>`
    : '<p class="muted">Chưa tìm thấy bài Wikipedia phù hợp.</p>') +
    (w && good.length ? `<div class="mono muted" style="margin:18px 0 8px">Ảnh & video · ${good.length} tệp</div><div class="mgrid" id="mgrid">${good.map(([, i]) => tile(v, w, i)).join('')}</div>` : '') +
    `<div class="mono muted" style="margin:20px 0 4px">Phim tư liệu · tìm "${esc(q)}"</div>${films.map(([n, d, u]) => `<a class="src" href="${u}" target="_blank" rel="noopener"><div class="tt"><h3>${n}</h3><span class="mono" style="color:var(--acc)">Mở ↗</span></div><div class="muted" style="font-size:14.5px;margin-top:2px">${d}</div></a>`).join('')}
    <p class="muted" style="font-size:13px;margin-top:12px">Ảnh và video thuộc Wikimedia Commons, giấy phép tự do theo từng tệp. Phim từ các kho bên ngoài có điều khoản sử dụng riêng.</p>`;
  const g = document.getElementById('mgrid');
  if (g && w) wireTiles(g, v, w);
}

function listen(id: string, b: HTMLElement): void {
  const v = allEv().find(x => x.id === id);
  if (!v) return;
  if (b.dataset.on) { hush(); return; }
  const ok = speak(evSpeechFull(v), () => { delete b.dataset.on; }, true, evKey(v));
  if (ok) b.dataset.on = '1';
}
/** Ảnh dọc hay ngang (đọc kích thước thật khi ảnh tải xong; ảnh đã nằm trong bộ nhớ đệm sau probe nên nhanh). */
function aspect(src: string): Promise<boolean> {
  return new Promise(res => { const im = new Image(); im.onload = () => res(im.naturalHeight > im.naturalWidth * 1.05); im.onerror = () => res(false); im.src = src; });
}

on('listen', el => listen(el.dataset.id!, el));
on('media', el => openMedia(el.dataset.id!, +el.dataset.i!));
on('mtab', () => layer.querySelector<HTMLElement>('#et button[data-k="m"]')?.click());
on('src', el => openSrc(el.dataset.id!));
/** Jump the map to an event (from a source sheet) and open it. */
on('goev', el => {
  const v = EV.find(x => x.id === el.dataset.id);
  if (!v) return;
  // Đọc sử: chủ ý "đến sự kiện": đóng trang thì ở lại bản đồ năm đó. Trò chơi: năm đang chơi giữ nguyên (không vượt điểm
  // rẽ, thẻ còn nợ), chỉ mở trang
  if (!isPlay()) { S.year = v.y; rt.focusEv = v; save(); }
  openEvent(v.id, 'x', JSON.stringify({ tab: 'map' } as Ret));
});
// Closing an overlay returns to where it was opened from: a pane (and the figure sheet), else the refreshed map.
// Chỉ nút đóng của chính trang sự kiện mới dùng đích quay về của nó (nút "close" khác: về bản đồ như cũ).
on('close', el => {
  const raw = el.closest<HTMLElement>('.ov')?.dataset.ret, r: Ret | null = raw ? JSON.parse(raw) : null;
  hush(); // "▶ Nghe" của trang vừa đóng thì dừng (cả khi tour đang giữ bằng ❚❚); tour chạy tiếp thì tự kể lại
  if (r && r.tab !== 'map') {
    setTab(r.tab);
    // bàn phím / trình đọc màn hình: tiêu điểm về đúng dòng đã mở trang (bảng vừa dựng lại, nút cũ không còn); mở lại
    // bảng nhân vật thì tiêu điểm đặt trước lên thẻ nhân vật trong bảng, để đóng bảng nhân vật xong quay về đó
    const pane = layer.querySelector<HTMLElement>(':scope > .pane'), q = (s: string) => pane?.querySelector<HTMLElement>(s);
    const at = r.fig ? q(`[data-a="fig"][data-id="${r.fig}"]`) : r.id ? q(`[data-a="ev"][data-id="${r.id}"]`) : null;
    (at || q('#sq') || document.querySelector<HTMLElement>('#tabs .tab.on'))?.focus();
    if (r.fig) openFig(r.fig);
    return; // bảng vẫn che bản đồ: tour (nếu có) chờ tới khi về Bản đồ
  }
  if (r) setTab('map'); else clearLayer(); // "Đến sự kiện" từ sử liệu: thanh tab trở về Bản đồ
  renderMain(); checkBadges(); if (!isTouring()) mood('calm'); else if (!r?.fig) resumeTour('overlay');
  if (r?.fig) openFig(r.fig); // bảng nhân vật mở lại: tour vẫn chờ (không chạy một nhịp rồi dừng lại)
});
