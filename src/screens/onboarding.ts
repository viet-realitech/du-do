import { av } from '../ui/bits';
import { SURNAMES, loreOf, surnameKey, asFamily, HOOK_TEXT, spellingOf, bornLine } from '../data/surnames';
import { themeCards, applyTheme } from '../theme';
import { HOMES, home, RES, lockPassed } from '../play';
import { switchMode } from '../state';
import { setTab } from '../tabs';
import { invalidateTrack, renderMain } from '../view';
import { stopTour } from '../tour';
import { EV, FIG } from '../data';
import { S, save, ERAS_PENDING } from '../state';
import { on } from '../ui/actions';
import { $, esc, layer, clearLayer } from '../ui/dom';
import { ac } from '../audio';
import { checkBadges } from '../badges';
import { setYear } from '../view';

export function splash(): void {
  layer.innerHTML = `<div class="ov splash">
  <div class="mono muted">Hồ sơ lưu trữ · số 1858 – 2026</div><div class="dbl"></div>
  <h1 style="font-size:68px;line-height:.9;color:var(--acc)">Dư Đồ</h1>
  <p style="font:italic 500 22px/1.2 var(--disp);margin-top:10px">Cảm hứng bản đồ Việt Nam, từ thời Pháp thuộc tới nay</p>
  <div style="flex:1;display:grid;place-items:center;position:relative;min-height:240px">
   <svg viewBox="0 0 200 200" width="230" height="230" style="color:var(--ink)" aria-hidden="true"><circle cx="100" cy="100" r="92" fill="none" stroke="currentColor" stroke-width="1"/><circle cx="100" cy="100" r="84" fill="none" stroke="currentColor" stroke-width=".5" stroke-dasharray="2 3"/><text x="100" y="94" text-anchor="middle" style="font-family:var(--disp)" font-weight="800" font-size="50" fill="currentColor">6</text><text x="100" y="116" text-anchor="middle" style="font-family:var(--mono)" font-size="9" letter-spacing="2" fill="currentColor" opacity=".7">THẾ HỆ · 168 NĂM</text><text x="100" y="132" text-anchor="middle" style="font-family:var(--mono)" font-size="9" letter-spacing="2" fill="currentColor" opacity=".7">${EV.length} SỰ KIỆN</text></svg>
   <span class="stamp" style="position:absolute;right:6px;bottom:28px">Sử liệu công khai</span>
  </div>
  <button class="btn" data-a="go-read">Mở hồ sơ · Đọc sử</button>
  <div style="height:10px"></div>
  <button class="btn ghost" data-a="go-play">◆ Vào trò chơi dòng họ</button>
  <p class="muted" style="font-size:14px;text-align:center;margin-top:12px">Hai luồng riêng, tiến độ lưu riêng. Không có câu trả lời đúng.</p></div>`;
}

const HOW: [string, string, string][] = [
  ['◆', 'Mỗi chương, một điểm rẽ', '1858, 1885, 1930, 1945, 1954, 1976. Chọn một hướng nếu muốn (mở nhật ký dòng họ), hoặc cứ đọc tiếp: không bắt buộc.'],
  ['⟷', 'Kéo dòng thời gian', 'Bản đồ đổi theo từng chính thể. Phóng to, chạm vào một vùng để xem nó thuộc về ai.'],
  ['✎', 'Nhật ký dòng họ', 'Mỗi lựa chọn mở thêm những trang nhật ký riêng trên dòng thời gian.'],
  ['❝', 'Nhiều góc nhìn', 'Mỗi sự kiện có quan điểm của các bên, kèm sử liệu công khai.'],
  ['★', 'Đố vui và huy hiệu', 'Hết mỗi chương có hai câu đố. Đi tới cuối để so con đường của bạn với lịch sử.'],
];

export function intro(): void {
  S.step = 'intro';
  save();
  layer.innerHTML = `<div class="ov intro">
  <div class="mono muted">Cách đọc</div><h2 style="margin:8px 0 14px">Đi qua 168 năm lịch sử Việt Nam trên bản đồ.</h2>
  ${HOW.map(([i, t, d]) => `<div class="row" style="align-items:flex-start;padding:10px 0;border-top:1px solid var(--rule)"><div style="width:30px;font:700 20px var(--disp);text-align:center;color:var(--acc)">${i}</div><div style="flex:1"><h3 style="font-size:17.5px">${t}</h3><p class="muted" style="font-size:15px;line-height:1.3;margin-top:2px">${d}</p></div></div>`).join('')}
  <div style="flex:1"></div>
  <div class="mono muted" style="margin:16px 0 8px">Phong cách</div>
  ${themeCards()}
  <label class="mono muted" for="nm" style="margin:14px 0 6px;display:block">Họ của bạn (không bắt buộc, dùng cho nhật ký)</label>
  <input class="f" id="nm" placeholder="Ví dụ: Họ Lê" value="${esc(S.name)}" maxlength="24" autocomplete="off">
  <div style="height:12px"></div>
  <button class="btn" data-a="begin">Bước vào năm 1858</button></div>`;
}

const GAME_HOW: [string, string, string][] = [
  ['◆', 'Gia sản dòng họ', 'Lúa gạo, nhân đinh, bạc, uy tín. Mỗi lựa chọn tốn hoặc thêm; cạn thì mùa sau đói.'],
  ['⌂', 'Quê quán trên bản đồ', 'Chiến sự lan tới quê là dòng họ phải quyết định. Sự kiện cả nước cũng vậy.'],
  ['❝', 'Thẻ sự kiện', 'Ở mỗi sự kiện lịch sử, chọn cách ứng xử: góp lương, lánh nạn, theo một bên hay đứng ngoài.'],
  ['⟷', 'Quan hệ với các thế lực', 'Triều đình, Pháp, Việt Minh, VNCH, Mỹ, Nhà nước, làng xóm. Bên cai quản quê bạn quyết định mùa màng.'],
  ['★', 'Sáu thế hệ, một gia phả', 'Lịch sử vẫn diễn ra như đã diễn ra. Cuối cùng xem dòng họ còn gì: Vọng tộc hay ly tán.'],
];
export const homeChips = () => `<div class="homes">${HOMES.map(h => `<button class="chip${S.home === h[0] ? ' on' : ''}" data-a="home" data-v="${h[0]}" aria-pressed="${S.home === h[0]}">${h[1]}</button>`).join('')}</div>`;

/** Màn vào của Trò chơi: luật, quê quán, họ, phong cách. */
export function gameIntro(): void {
  S.step = 'intro';
  save();
  layer.innerHTML = `<div class="ov intro">
  <div class="mono" style="color:var(--acc)">◆ Trò chơi dòng họ</div><h2 style="margin:8px 0 14px">Giữ gia sản một dòng họ qua 168 năm.</h2>
  ${GAME_HOW.map(([i, t, d]) => `<div class="row" style="align-items:flex-start;padding:10px 0;border-top:1px solid var(--rule)"><div style="width:30px;font:700 20px var(--disp);text-align:center;color:var(--acc)">${i}</div><div style="flex:1"><h3 style="font-size:17.5px">${t}</h3><p class="muted" style="font-size:15px;line-height:1.3;margin-top:2px">${d}</p></div></div>`).join('')}
  <div class="resrow" style="border-top:1px solid var(--rule)">${RES.map(([k, n, ic]) => `<span><i>${ic}</i>${n} <b>${S.res[k]}</b></span>`).join('')}</div>
  <div style="flex:1"></div>
  <div class="mono muted" style="margin:10px 0 8px">Quê quán của dòng họ</div>
  ${homeChips()}
  <div class="mono muted" style="margin:16px 0 8px">Phong cách</div>
  ${themeCards()}
  <div class="mono muted" style="margin:16px 0 8px">Họ của dòng họ bạn</div>
  ${surnamePicker()}
  <div style="height:12px"></div>
  <button class="btn" data-a="begin">Bắt đầu năm 1858 ở ${esc(home()[1])}</button></div>`;
}

/** Chọn họ từ danh sách (kèm gia phả mở đầu) hay gõ họ khác. */
function surnamePicker(): string {
  const k = S.surname;
  return `<div class="homes" id="snm">${SURNAMES.map(s => `<button class="chip${k === s.key ? ' on' : ''}" data-a="surname" data-k="${s.key}" aria-pressed="${k === s.key}">${esc(s.names.join(' / '))}</button>`).join('')}<button class="chip${!k ? ' on' : ''}" data-a="surname" data-k="" aria-pressed="${!k}">Họ khác…</button></div>
  <div id="slore" aria-live="polite">${loreBox(k)}</div>`;
}
function loreBox(k: string): string {
  const l = loreOf(k);
  if (!l) return `<input class="f" id="nm" placeholder="Gõ họ của bạn, ví dụ: Lê" value="${esc(S.name.replace(/^Họ /, ''))}" maxlength="24" autocomplete="off" style="margin-top:8px">`;
  const kin = l.kin.filter(id => FIG[id]);
  return `<div class="pv mine" style="margin-top:8px"><div class="mono muted">Gia phả mở đầu · Họ ${esc(l.names.join(' / '))}</div>
  <p style="font-size:15.5px;margin-top:4px">${esc(l.lore)}${l.variant ? ' ' + esc(l.variant) : ''}</p>
  ${kin.length ? `<div class="mono muted" style="margin-top:8px">Cùng họ khai sinh trong hồ sơ</div><div class="kin">${kin.slice(0, 8).map(id => `<span>${av(id, 26)}${bornLine(id) ? `<span>${esc(FIG[id][0].replace(/\s*\(.*\)\s*$/, ''))}<small class="muted" style="display:block;font-size:12px">${esc(bornLine(id))}</small></span>` : esc(FIG[id][0].replace(/\s*\(.*\)\s*$/, ''))}</span>`).join('')}${kin.length > 8 ? `<span class="muted">và ${kin.length - 8} người khác</span>` : ''}</div>` : ''}
  ${l.hooks.filter(h => HOOK_TEXT[h]).map(h => `<p class="muted" style="font-size:13.5px;margin-top:6px">◆ ${esc(HOOK_TEXT[h])}</p>`).join('')}</div>`;
}
on('surname', el => {
  S.surname = el.dataset.k || '';
  if (S.surname) S.name = 'Họ ' + loreOf(S.surname)!.names[0];
  save();
  el.closest('.homes')?.querySelectorAll<HTMLElement>('.chip').forEach(b => { const o = b === el; b.classList.toggle('on', o); b.setAttribute('aria-pressed', String(o)); });
  const box = layer.querySelector('#slore'); if (box) box.innerHTML = loreBox(S.surname);
});

/** Mở luồng `m` (Đọc sử / Trò chơi) với bản lưu riêng của nó; dùng ở màn chào và Hồ sơ. */
export function goMode(m: 'read' | 'play'): void {
  ac();
  stopTour();
  switchMode(m);
  invalidateTrack();
  applyTheme();
  setTab('map');
  if (m === 'play') lockPassed(S.year); // bản lưu cũ: thẻ tuỳ chọn đã đi qua không mọc biến cố mới
  if (S.step === 'play') { renderMain(); if (m === 'play' && ERAS_PENDING()) setYear(S.year, true); } // Đọc sử: điểm rẽ không tự mở
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
  el.closest('.homes')?.querySelectorAll<HTMLElement>('.chip').forEach(b => { const o = b === el; b.classList.toggle('on', o); b.setAttribute('aria-pressed', String(o)); });
  const btn = layer.querySelector('[data-a=begin]'); if (btn && S.step === 'intro' && S.mode === 'play') btn.textContent = `Bắt đầu năm 1858 ở ${home()[1]}`;
  renderMain();
});
on('begin', begin);
