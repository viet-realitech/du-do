import { isPlay, cardOf, decided } from '../play';
import { mood } from '../music';
import { isTouring } from '../tour';
import { EV, EVFIG, FIG, P, SRC } from '../data';
import { S, save, rt, allEv, eraOf, curPick, figOpen } from '../state';
import { av } from '../ui/bits';
import { on } from '../ui/actions';
import { $, esc, layer, clearLayer } from '../ui/dom';
import { checkBadges } from '../badges';
import { hush, speak } from '../narration';
import { evKey, evSpeechFull } from '../speech';
import { stopTour, pauseTour, resumeTour } from '../tour';
import { hidePop } from '../map';
import { renderMain } from '../view';
import { wikiFor, cachedWiki, probe, type WikiInfo } from '../wiki';
import { openMedia } from './lightbox';
import { openSrc } from './sources';
import { canReplay, closeReplay } from '../replay';
import type { HistEvent } from '../data';

type Tab = 'x' | 'v' | 'm' | 's';
/** Góc nhìn sử học nào là "của phe" dòng họ theo (sử liệu quốc tế, Pháp không phải tiếng nói của phe người chơi). */
export const SIDE_PV = ['vn', 'vnch', 'nguyen'];
const TABS: [Tab, string][] = [['x', 'Diễn biến'], ['v', 'Góc nhìn'], ['m', 'Ảnh, phim'], ['s', 'Nguồn']];
const KIND_ICON: Record<string, string> = { 'Trận đánh': '◆', 'Hiệp ước': '■' };
const closeBtn = `<button class="back" data-a="close" aria-label="Đóng">‹</button>`;

export function openEvent(id: string, tab: Tab = 'x'): void {
  const v = allEv().find(x => x.id === id);
  if (!v) return;
  if (document.getElementById('replb')) closeReplay(false); // đang xem lại diễn biến: dừng hẳn trước khi mở trang
  if (isPlay() && isTouring()) pauseTour('overlay'); else stopTour();
  hidePop();
  if (!S.seen.includes(id)) { S.seen.push(id); save(); }
  const e = eraOf(v.y), pk = curPick(v.y), mine = pk?.persp;

  if (v.diary) {
    const real = EV.find(x => x.y === v.y);
    layer.innerHTML = `<div class="ov"><div class="row sb">${closeBtn}<span class="mono muted">Thế hệ ${e.n} · ${e.title}</span></div>
     <div style="margin-top:22px"><span class="stamp acc">Nhật ký dòng họ · ${v.y}</span></div>
     <h1 style="margin:16px 0 6px;font-size:32px">${esc(v.t)}</h1><div class="dbl"></div>
     <p style="font:italic 400 21px/1.45 var(--serif)">${esc(v.s)}</p>
     <p class="muted" style="font-size:14px;margin-top:18px">Trang nhật ký hư cấu, đặt trong bối cảnh có thật, mở ra vì bạn chọn "${esc(pk ? pk.label : '')}".</p>
     ${real ? `<div class="rule"></div><div class="mono muted">Cùng năm ${v.y} trong sử liệu</div><button class="src" data-a="ev" data-id="${real.id}"><div class="tt"><h3>${esc(real.t)}</h3><span class="mono muted">${real.k}</span></div></button>` : ''}</div>`;
    return;
  }

  const vs = [...v.v].sort((a, b) => Number(b[0] === mine) - Number(a[0] === mine));
  layer.innerHTML = `<div class="ov">
  <div class="row sb">${closeBtn}<span class="mono muted" style="flex:1;text-align:center">Chương ${e.n}</span>${isPlay() && cardOf(v) ? `<button class="chip${decided(v.id) ? '' : ' on'}" data-a="card" data-id="${v.id}">${decided(v.id) ? '✓ Đã quyết' : '◆ Dòng họ làm gì?'}</button>` : ''}<button class="chip nbtn" data-a="listen" data-id="${v.id}">▶ Nghe</button></div>
  <div class="hero"><image-slot id="ev-${v.id}" shape="rect" busy placeholder="Đang tìm ảnh tư liệu…"></image-slot><button class="hzoom" id="hzoom" hidden aria-label="Xem ảnh lớn">⤢</button>${canReplay(v) ? `<button class="hplay" data-a="replay" data-id="${v.id}">▶ Xem diễn biến</button>` : ''}</div>
  <div style="margin-top:14px" class="mono"><span style="color:var(--red)">${KIND_ICON[v.k] || '●'} ${v.k}</span> · ${v.d}</div>
  <h1 style="margin:8px 0 6px;font-size:30px">${esc(v.t)}</h1>
  <div class="muted" style="font-style:italic;font-size:16px">${esc(v.p)}</div>
  <div class="dbl"></div>
  <div class="seg" id="et" role="tablist">${TABS.map(([k, l]) => `<button role="tab" data-k="${k}" aria-selected="${k === tab}" class="${k === tab ? 'on' : ''}">${l}</button>`).join('')}</div>
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
      return vs.map(([pp, tx]) => `<div class="pv${pp === mine ? ' mine' : ''}"><div class="row sb"><span class="mono muted">${P[pp]}</span>${pp === mine ? '<span class="mono" style="color:var(--acc)">Gần lựa chọn của bạn</span>' : ''}</div><q>${esc(tx)}</q></div>`).join('') +
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
    layer.querySelectorAll<HTMLElement>('#et button').forEach(b => { const o = b.dataset.k === k; b.classList.toggle('on', o); b.setAttribute('aria-selected', String(o)); });
    if (k === 'x') cachedWiki(v.id)?.then(w => { if (w && w.media.length) fillStrip(v, w); });
    if (k === 'm') mediaTab(v);
  };
  layer.querySelectorAll<HTMLElement>('#et button').forEach(b => (b.onclick = () => show(b.dataset.k as Tab)));
  show(tab);
  loadHero(v);
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
    sl.setAttribute('src', m.src);
    sl.setAttribute('credit', 'Wikimedia Commons');
    sl.setAttribute('credit-href', 'https://commons.wikimedia.org/wiki/' + encodeURIComponent(m.file.replace(/ /g, '_')));
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
  return `<button data-a="media" data-id="${v.id}" data-i="${i}" aria-label="Xem tư liệu ${i + 1}"><img src="${m.thumb || m.src}" alt="" loading="lazy" data-i="${i}">${m.type === 'video' ? '<span class="vplay">▶</span>' : ''}</button>`;
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
  if (b.textContent!.startsWith('■')) { hush(); return; }
  const ok = speak(evSpeechFull(v), () => { b.textContent = '▶ Nghe'; }, true, evKey(v));
  if (ok) b.textContent = '■ Dừng';
}

on('listen', el => listen(el.dataset.id!, el));
on('media', el => openMedia(el.dataset.id!, +el.dataset.i!));
on('mtab', () => layer.querySelector<HTMLElement>('#et button[data-k="m"]')?.click());
on('src', el => openSrc(el.dataset.id!));
/** Jump the map to an event (from a source sheet) and open it. */
on('goev', el => {
  const v = EV.find(x => x.id === el.dataset.id);
  if (!v) return;
  S.year = v.y;
  rt.focusEv = v;
  save();
  openEvent(v.id);
});
// Closing an overlay returns to the refreshed map.
on('close', () => { clearLayer(); renderMain(); checkBadges(); if (!isTouring()) mood('calm'); else resumeTour('overlay'); });
