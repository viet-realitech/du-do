import { av } from '../ui/bits';
import { SURNAMES, loreOf, surnameKey, asFamily, HOOK_TEXT, spellingOf, bornLine } from '../data/surnames';
import { themeCards, applyTheme } from '../theme';
import { HOMES, home, RES, lockPassed, pendingCard } from '../play';
import { switchMode } from '../state';
import { setTab } from '../tabs';
import { invalidateTrack, renderMain } from '../view';
import { stopTour, startTour } from '../tour';
import { EV, FIG, ERAS } from '../data';
import { S, save, setFocus, evEra } from '../state';
import { on } from '../ui/actions';
import { $, esc, layer, clearLayer } from '../ui/dom';
import { ac } from '../audio';
import { checkBadges } from '../badges';
import { setYear } from '../view';
import { icon } from '../ui/icons';
import { plate } from '../ui/plate';

/** Thước thời gian dưới tấm bản đồ ở màn chào: sáu điểm rẽ trên thước 1858 – nay, đoạn đặc / rỗng xen kẽ như thước tỉ lệ
    bản đồ in (cùng kiểu thanh năm ở màn chính); nhãn năm so le trên / dưới để 1945 và 1954 không chồng nhau. */
function yearScale(): string {
  const p = (y: number) => ((y - 1858) / (2026 - 1858)) * 100, ys = ERAS.map(e => e.cy), ends = [...ys.slice(1), 2026];
  return `<div class="sp-scale" aria-hidden="true"><div class="sp-bar">${ys.map((y, i) => `<i style="left:${p(y)}%;width:${p(ends[i]) - p(y)}%"></i>`).join('')}</div>${ys.map((y, i) => `<span class="${i % 2 ? 'dn' : 'up'}" style="left:${p(y)}%">${y}</span>`).join('')}<span class="dn end">nay</span></div>`;
}

export function splash(): void {
  layer.innerHTML = `<div class="ov splash">
  <header class="sp-head"><div class="mono muted">Hồ sơ lưu trữ · số 1858 – 2026</div><div class="dbl"></div>
  <h1 class="sp-t">Dư Đồ</h1><p class="sp-sub">Cảm hứng bản đồ Việt Nam, từ thời Pháp thuộc tới nay</p></header>
  <figure class="sp-plate"><div class="sp-sheet">${plate()}<span class="stamp">Sử liệu công khai</span></div>
   <figcaption>${yearScale()}<div class="mono muted sp-meta">${ERAS.length} thế hệ · 168 năm · ${EV.length} sự kiện</div></figcaption></figure>
  <div class="sp-go"><button class="btn" data-a="go-read">Mở hồ sơ · Đọc sử</button>
  <button class="btn ghost" data-a="go-play">${icon('seal', 14)}Vào trò chơi dòng họ</button>
  <p class="muted sp-note">Hai luồng riêng, tiến độ lưu riêng. Không có câu trả lời đúng.</p></div></div>`;
}

/** Cách đọc / luật chơi: mục lục đánh số như trang đầu một tập hồ sơ (thay cho cột ký hiệu ◆ ⟷ ✎ ❝ ★). */
const howList = (xs: [string, string][]) => `<ol class="how">${xs.map(([t, d], i) => `<li><span class="n">${i + 1}</span><div><h3>${t}</h3><p>${d}</p></div></li>`).join('')}</ol>`;

const HOW: [string, string][] = [
  ['Mỗi chương, một điểm rẽ', '1858, 1885, 1930, 1945, 1954, 1976. Chọn một hướng nếu muốn (mở nhật ký dòng họ), hoặc cứ đọc tiếp: không bắt buộc.'],
  ['Kéo dòng thời gian', 'Bản đồ đổi theo từng chính thể. Phóng to, chạm vào một vùng để xem nó thuộc về ai.'],
  ['Nhật ký dòng họ', 'Mỗi lựa chọn mở thêm những trang nhật ký riêng trên dòng thời gian.'],
  ['Nhiều góc nhìn', 'Mỗi sự kiện có quan điểm của các bên, kèm sử liệu công khai.'],
  ['Đố vui và huy hiệu', 'Hết mỗi chương có hai câu đố. Đi tới cuối để so con đường của bạn với lịch sử.'],
];

export function intro(): void {
  S.step = 'intro';
  save();
  layer.innerHTML = `<div class="ov intro">
  <section class="in-how"><div class="mono muted">Cách đọc</div><h2>Đi qua 168 năm lịch sử Việt Nam trên bản đồ.</h2>${howList(HOW)}</section>
  <section class="in-set"><div class="mono muted in-lbl">Phong cách</div>
  ${themeCards()}
  <label class="in-lbl" for="nm"><span class="mono muted">Họ của bạn</span> <span class="in-note">không bắt buộc · dùng cho nhật ký</span></label>
  <input class="f" id="nm" placeholder="Ví dụ: Họ Lê" value="${esc(S.name)}" maxlength="24" autocomplete="off">
  <button class="btn in-go" data-a="begin">Bước vào năm 1858</button></section></div>`;
}

const GAME_HOW: [string, string][] = [
  ['Gia sản dòng họ', 'Lúa gạo, nhân đinh, bạc, uy tín. Mỗi lựa chọn tốn hoặc thêm; cạn thì mùa sau đói.'],
  ['Quê quán trên bản đồ', 'Chiến sự lan tới quê là dòng họ phải quyết định. Sự kiện cả nước cũng vậy.'],
  ['Thẻ sự kiện', 'Ở mỗi sự kiện lịch sử, chọn cách ứng xử: góp lương, lánh nạn, theo một bên hay đứng ngoài.'],
  ['Quan hệ với các thế lực', 'Triều đình, Pháp, Việt Minh, VNCH, Mỹ, Nhà nước, làng xóm. Bên cai quản quê bạn quyết định mùa màng.'],
  ['Sáu thế hệ, một gia phả', 'Lịch sử vẫn diễn ra như đã diễn ra. Cuối cùng xem dòng họ còn gì: Vọng tộc hay ly tán.'],
];
/** Chọn quê: danh sách kẻ dòng bên tấm bản đồ nhỏ đánh dấu tám nơi, nơi đang chọn có vòng son và tên (thay đám chip). */
const homeMap = () => plate(HOMES.map(h => [h[0], h[2][0], h[2][1], h[1]] as [string, number, number, string]), S.home, 'plate-svg hp');
export const homeChips = () => `<div class="hpick"><div class="hp-map">${homeMap()}</div><div class="hlist">${HOMES.map(h => `<button class="pick${S.home === h[0] ? ' on' : ''}" data-a="home" data-v="${h[0]}" aria-pressed="${S.home === h[0]}">${h[1]}</button>`).join('')}</div></div>`;

/** Màn vào của Trò chơi: luật, rồi những gì làm nên dòng họ (quê, họ), rồi phong cách. */
export function gameIntro(): void {
  S.step = 'intro';
  save();
  layer.innerHTML = `<div class="ov intro game">
  <section class="in-how"><div class="mono">Trò chơi dòng họ</div><h2>Giữ gia sản một dòng họ qua 168 năm.</h2>${howList(GAME_HOW)}
  <div class="in-res"><span class="mono muted">Gia sản ban đầu</span><div class="resrow">${RES.map(([k, n, ic]) => `<span><i>${ic}</i>${n} <b>${S.res[k]}</b></span>`).join('')}</div></div></section>
  <section class="in-set"><div class="mono muted in-lbl">Quê quán của dòng họ</div>
  ${homeChips()}
  <div class="mono muted in-lbl">Họ của dòng họ bạn</div>
  ${surnamePicker()}
  <div class="mono muted in-lbl">Phong cách</div>
  ${themeCards()}
  <button class="btn in-go" data-a="begin">Bắt đầu năm 1858 ở ${esc(home()[1])}</button></section></div>`;
}

/** Chọn họ từ danh sách (kèm gia phả mở đầu) hay gõ họ khác: một bảng mục lục họ kẻ dòng, họ đang chọn có nét son. */
function surnamePicker(): string {
  const k = S.surname;
  return `<div class="snames" id="snm">${SURNAMES.map(s => `<button class="pick${k === s.key ? ' on' : ''}" data-a="surname" data-k="${s.key}" aria-pressed="${k === s.key}">${esc(s.names.join(' / '))}</button>`).join('')}<button class="pick${!k ? ' on' : ''}" data-a="surname" data-k="" aria-pressed="${!k}">Họ khác…</button></div>
  <div id="slore" aria-live="polite">${loreBox(k)}</div>`;
}
function loreBox(k: string): string {
  const l = loreOf(k);
  if (!l) return `<input class="f" id="nm" placeholder="Gõ họ của bạn, ví dụ: Lê" value="${esc(S.name.replace(/^Họ /, ''))}" maxlength="24" autocomplete="off" style="margin-top:10px">`;
  const kin = l.kin.filter(id => FIG[id]);
  return `<div class="pv mine" style="margin-top:10px"><div class="mono muted">Gia phả mở đầu · Họ ${esc(l.names.join(' / '))}</div>
  <p style="font-size:15.5px;margin-top:4px">${esc(l.lore)}${l.variant ? ' ' + esc(l.variant) : ''}</p>
  ${kin.length ? `<div class="mono muted" style="margin-top:8px">Cùng họ khai sinh trong hồ sơ</div><div class="kin">${kin.slice(0, 8).map(id => `<span>${av(id, 26)}${bornLine(id) ? `<span>${esc(FIG[id][0].replace(/\s*\(.*\)\s*$/, ''))}<small class="muted" style="display:block;font-size:12px">${esc(bornLine(id))}</small></span>` : esc(FIG[id][0].replace(/\s*\(.*\)\s*$/, ''))}</span>`).join('')}${kin.length > 8 ? `<span class="muted">và ${kin.length - 8} người khác</span>` : ''}</div>` : ''}
  ${l.hooks.filter(h => HOOK_TEXT[h]).length ? `<ul class="hooks">${l.hooks.filter(h => HOOK_TEXT[h]).map(h => `<li>${esc(HOOK_TEXT[h])}</li>`).join('')}</ul>` : ''}</div>`;
}
/** Nút chọn trong một nhóm (quê, họ): đúng một nút sáng, aria-pressed theo. */
const pickOne = (el: HTMLElement) => el.parentElement?.querySelectorAll<HTMLElement>('.pick').forEach(b => { const o = b === el; b.classList.toggle('on', o); b.setAttribute('aria-pressed', String(o)); });
on('surname', el => {
  S.surname = el.dataset.k || '';
  if (S.surname) S.name = 'Họ ' + loreOf(S.surname)!.names[0];
  save();
  pickOne(el);
  const box = layer.querySelector('#slore'); if (box) box.innerHTML = loreBox(S.surname);
});

/** Đứng lại đúng chỗ của bản lưu (tải trang, đổi luồng). Trò chơi còn nợ thẻ bắt buộc của một chương trước điểm rẽ
    còn bỏ ngỏ (kể cả Điện Biên Phủ cùng năm 1954 với điểm rẽ 5) → dựng lại tour chương từ thẻ đó (bay tới, cảnh, lời kể,
    rồi mới mở thẻ), không bật liền các thẻ trên bản đồ đứng yên; Trò chơi còn điểm rẽ chưa chọn → mở nó; không thì ▶
    nhấp nháy mời chạy tiếp chương. Đọc sử: điểm rẽ để "chọn sau" không tự mở lại. */
export function resumePlace(ready: Promise<unknown> = Promise.resolve()): void {
  lockPassed(S.year); // bản lưu cũ: thẻ tuỳ chọn đã đi qua không mọc biến cố mới (x-nguyen25 trên tn25)
  setFocus();
  const pc = S.mode === 'play' ? pendingCard(S.year) : undefined, pend = ERAS.find(e => !S.picks[e.id] && e.cy <= S.year);
  if (pc && (!pend || ERAS.indexOf(evEra(pc)) < ERAS.indexOf(pend))) {
    S.year = pc.y;
    setFocus();
    save();
    renderMain();
    void ready.then(() => { if (!document.querySelector('#layer > *')) startTour(evEra(pc)); });
  } else setYear(S.year, !!pend && S.mode === 'play');
}

/** Mở luồng `m` (Đọc sử / Trò chơi) với bản lưu riêng của nó; dùng ở màn chào và Hồ sơ. */
export function goMode(m: 'read' | 'play'): void {
  ac();
  stopTour();
  switchMode(m);
  invalidateTrack();
  applyTheme();
  setTab('map');
  if (S.step === 'play') { resumePlace(); renderMain(); } // renderMain sau: thẻ bên của sự kiện đang chọn (setFocus) được vẽ
  else if (m === 'play') gameIntro();
  else intro();
}

function begin(): void {
  const typed = ($<HTMLInputElement>('#nm')?.value || '').normalize('NFC').trim();
  if (typed) S.surname = surnameKey(typed); // gõ họ: giữ đúng cách viết (Huỳnh, Võ, Thới…)
  S.name = typed ? asFamily(typed) : S.surname ? 'Họ ' + spellingOf(S.surname, '') : S.name || 'Họ Lê';
  S.step = 'play';
  save();
  clearLayer();
  checkBadges();
  setYear(1858, true);
}

on('intro', () => { ac(); intro(); });
on('go-read', () => goMode('read'));
on('go-play', () => goMode('play'));
on('home', el => {
  S.home = el.dataset.v!;
  save();
  pickOne(el);
  const hm = layer.querySelector('.hp-map'); if (hm) hm.innerHTML = homeMap(); // vòng son dời tới quê vừa chọn
  const btn = layer.querySelector('[data-a=begin]'); if (btn && S.step === 'intro' && S.mode === 'play') btn.textContent = `Bắt đầu năm 1858 ở ${home()[1]}`;
  renderMain();
});
on('begin', begin);
