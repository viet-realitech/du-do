import { type SpecialCard } from '../data/cards2';
import { SURNAMES, surnameKey } from '../data/surnames';
import type { HistEvent } from '../data';
import type { Fx } from '../data/cards';
import { S, rt, familyName, allEv } from '../state';
import { on } from '../ui/actions';
import { esc, sheet, toast, ghost } from '../ui/dom';
import { flag } from '../ui/bits';
import { SND, buzz } from '../audio';
import { cardOf, canAfford, cost, decide, decided, mustDecide, home, RES, POWERS, relLabel, alignment, specialFor, specialDecided, decideSpecial } from '../play';
import { pauseForCard } from '../tour';
import { layer } from '../ui/dom';
import { renderMain, continueFlow } from '../view';
import { checkBadges } from '../badges';

/* Thẻ ứng xử của dòng họ ở một sự kiện (chế độ Chơi). */
const POW_KEYS = Object.keys(POWERS) as (keyof typeof POWERS)[];

/** Chip hiệu ứng: tài nguyên và quan hệ, có dấu. */
export function fxChipsPlay(fx: Fx, got?: Fx): string {
  const src = got || fx;
  const out: string[] = [];
  for (const [k, name, ic] of RES) {
    const n = src[k]; if (!n) continue;
    out.push(`<span class="fx ${n > 0 ? 'up' : 'dn'}">${ic} ${n > 0 ? '+' : ''}${n} ${name}</span>`);
  }
  for (const k of POW_KEYS) {
    const n = src[k]; if (!n) continue;
    const [name, fac] = POWERS[k];
    out.push(`<span class="fx rel ${n > 0 ? 'up' : 'dn'}">${fac ? flag(fac) : ''}${name} ${n > 0 ? '+' : ''}${n}</span>`);
  }
  return out.join('');
}

/** `inTour`: thẻ mở giữa tour; "Tiếp tục" đi tiếp sự kiện kế, thẻ tuỳ chọn có thể bỏ qua. */
export function openCard(v: HistEvent, inTour = false): void {
  const c = cardOf(v);
  if (!c || layer.querySelector(`.scrim[data-card="${v.id}"]`)) return; // thẻ này đang mở: không mở chồng
  const sp0 = specialFor(v), spPending = !!sp0 && !specialDecided(sp0);
  const done = decided(v.id), must = mustDecide(v) || spPending, h = home();
  // Không đủ cho lựa chọn nào thì lựa chọn rẻ nhất vẫn bấm được (tài nguyên dừng ở 0): thẻ bắt buộc không thành ngõ cụt.
  const noList = done ? c[2].map(() => null) : c[2].map(ch => canAfford(ch[2]));
  if (!done && noList.every(Boolean)) { const cheap = c[2].reduce((b, ch, i) => (cost(ch[2]) < cost(c[2][b][2]) ? i : b), 0); noList[cheap] = null; }
  if (inTour) { buzz(must ? [15, 30, 15] : 10); }
  const near = c[1] !== 'all' && must;
  const d = sheet(`<div class="row sb"><span class="mono" style="color:var(--red)">◆ ${must ? 'Dòng họ phải quyết định' : 'Dòng họ có thể hành động'} · ${v.y}</span><span class="mono muted">${esc(familyName())} · ${esc(h[1])}</span></div>
  <h2 style="margin:8px 0 6px">${esc(v.t)}</h2>
  <p class="muted" style="margin-bottom:6px">${esc(v.s)}</p>
  ${near ? `<div class="mono" style="color:var(--acc);margin-bottom:10px">⌂ Chạm tới quê nhà ${esc(h[1])}</div>` : '<div style="height:6px"></div>'}
  <div class="resrow">${RES.map(([k, n, ic]) => `<span><i>${ic}</i>${n} <b>${S.res[k]}</b></span>`).join('')}</div>
  <div role="radiogroup">${c[2].map((ch, i) => {
    const no = noList[i], al = alignment(ch[2], v.y);
    const picked = done && S.cards[v.id] === i;
    return `<button class="opt${picked ? ' sel' : ''}" data-i="${i}" role="radio" aria-checked="${picked}"${no || (done && !picked) ? ' disabled' : ''}>
      <div class="tt"><h3>${esc(ch[0])}</h3>${no ? `<span class="mono" style="color:var(--red)">${no}</span>` : al ? `<span class="al mono ${al > 0 ? 'ok' : 'bad'}">${al > 0 ? 'Hợp đường bạn theo' : 'Trái đường bạn theo'}</span>` : ''}</div>
      <p>${esc(ch[1])}</p><div class="fxs">${fxChipsPlay(ch[2])}</div>${picked ? `<p class="out">${esc(ch[3])}</p>` : ''}</button>`;
  }).join('')}</div>
  <p class="muted" style="font-size:13px;margin-top:10px">Số liệu là ước lệ của trò chơi. Sự kiện lịch sử vẫn diễn ra như đã diễn ra.</p>
  ${done ? '<div style="height:12px"></div><button class="btn ghost" data-a="close-card">Đóng</button>' : inTour && !must ? '<button class="lnk" data-a="close-card">Bỏ qua, đi tiếp ›</button>' : ''}`, done && !spPending);
  d.dataset.card = v.id;
  if (done) { if (sp0 && spPending) { d.querySelector('.btn.ghost[data-a="close-card"]')?.remove(); mountSpecial(d, v, sp0, inTour); } return; }
  d.querySelectorAll<HTMLButtonElement>('.opt').forEach(b => (b.onclick = () => {
    if (decided(v.id)) return; // một thẻ chỉ quyết một lần: chạm lại không áp hiệu ứng thêm
    const i = +b.dataset.i!, ch = c[2][i];
    const got = decide(v, i);
    SND.stamp();
    buzz([10, 30, 40]);
    d.querySelectorAll<HTMLButtonElement>('.opt').forEach(x => { x.disabled = true; x.classList.toggle('sel', x === b); });
    d.querySelector('.lnk[data-a="close-card"]')?.remove();
    b.insertAdjacentHTML('beforeend', `<p class="out">${esc(ch[3])}</p>`);
    d.querySelector('.resrow')!.innerHTML = RES.map(([k, n, ic]) => `<span><i>${ic}</i>${n} <b>${S.res[k]}</b></span>`).join('');
    const warn = RES.filter(([k]) => S.res[k] <= 10).map(([, n]) => n.toLowerCase());
    d.querySelector('.sheet')!.insertAdjacentHTML('beforeend', `<div class="rule"></div><div class="mono muted">Thay đổi</div><div class="fxs" style="margin-top:6px">${fxChipsPlay(ch[2], got) || '<span class="muted">Không đổi</span>'}</div>
      ${warn.length ? `<p style="color:var(--red);margin-top:8px">Cạn ${warn.join(', ')}: mùa màng thế hệ tới sẽ khó khăn.</p>` : ''}`);
    const sp = specialFor(v);
    if (sp && !specialDecided(sp)) mountSpecial(d, v, sp, inTour); else finish(d, v, inTour);
  }));
}

const resRow = () => RES.map(([k, n, ic]) => `<span><i>${ic}</i>${n} <b>${S.res[k]}</b></span>`).join('');

/** Mọi quyết định trên thẻ đã xong: nút tiếp tục, mở khoá đóng thẻ, vẽ lại màn chính. */
function finish(d: HTMLElement, v: HistEvent, inTour: boolean): void {
  d.querySelector('.sheet')!.insertAdjacentHTML('beforeend', `<div style="height:14px"></div><button class="btn" data-a="close-card">${inTour || rt.flowTo ? 'Tiếp tục ▶' : 'Tiếp tục'}</button>`);
  delete d.dataset.lock;
  if (rt.card?.id === v.id) rt.card = null;
  renderMain();
  checkBadges();
}

/** Biến cố riêng của dòng họ (họ, phe, quê…) nối tiếp thẻ sự kiện trong cùng một bảng; có thể đổi họ. */
function mountSpecial(d: HTMLElement, v: HistEvent, sp: SpecialCard, inTour: boolean): void {
  const sh = d.querySelector('.sheet')!;
  const noList = sp.choices.map(ch => canAfford(ch[2]));
  if (noList.every(Boolean)) { const cheap = sp.choices.reduce((b, ch, i) => (cost(ch[2]) < cost(sp.choices[b][2]) ? i : b), 0); noList[cheap] = null; }
  const mine = S.surname || surnameKey(S.name);
  const moms = SURNAMES.filter(s => s.key !== mine).slice(0, 8);
  sh.insertAdjacentHTML('beforeend', `<div class="rule"></div><div class="mono" style="color:var(--acc)">◆ Biến cố riêng của ${esc(familyName())}</div>
  <h3 style="margin:6px 0 4px">${esc(sp.title)}</h3><p class="muted" style="margin-bottom:8px">${esc(sp.s)}</p>
  <div role="radiogroup" class="xopts">${sp.choices.map((ch, i) => `<button class="opt" data-x="${i}" role="radio" aria-checked="false"${noList[i] ? ' disabled' : ''}>
    <div class="tt"><h3>${esc(ch[0])}</h3>${noList[i] ? `<span class="mono" style="color:var(--red)">${noList[i]}</span>` : ch[4] ? '<span class="al mono">Đổi họ</span>' : ''}</div><p>${esc(ch[1])}</p><div class="fxs">${fxChipsPlay(ch[2])}</div></button>`).join('')}</div>
  <div id="xmom" hidden style="margin-top:10px"><div class="mono muted">Lấy họ mẹ</div><div class="homes" style="margin-top:6px">${moms.map((s, i) => `<button class="chip${i === 0 ? ' on' : ''}" data-m="${esc(s.names[0])}" aria-pressed="${i === 0}">${esc(s.names[0])}</button>`).join('')}</div></div>
  <div style="height:10px"></div><button class="btn" id="xgo" disabled>Quyết định</button>`);
  let sel = -1, mom = moms[0]?.names[0] || 'Nguyễn';
  const xmom = sh.querySelector<HTMLElement>('#xmom')!, xgo = sh.querySelector<HTMLButtonElement>('#xgo')!;
  sh.querySelectorAll<HTMLButtonElement>('.xopts .opt').forEach(b => (b.onclick = () => {
    sel = +b.dataset.x!;
    sh.querySelectorAll('.xopts .opt').forEach(x => { x.classList.toggle('sel', x === b); x.setAttribute('aria-checked', String(x === b)); });
    xmom.hidden = sp.choices[sel][4] !== 'mother';
    xgo.disabled = false;
    SND.tick();
  }));
  sh.querySelectorAll<HTMLButtonElement>('#xmom .chip').forEach(b => (b.onclick = () => { mom = b.dataset.m!; sh.querySelectorAll('#xmom .chip').forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', String(x === b)); }); }));
  xgo.onclick = () => {
    if (sel < 0 || specialDecided(sp)) return;
    const ch = sp.choices[sel], before = familyName();
    const got = decideSpecial(sp, sel, v.y, ch[4] === 'mother' ? mom : ch[4]);
    SND.stamp();
    buzz([10, 30, 40]);
    sh.querySelectorAll<HTMLButtonElement>('.xopts .opt').forEach((x, i) => { x.disabled = true; x.classList.toggle('sel', i === sel); });
    xmom.remove(); xgo.remove();
    sh.querySelector(`.xopts .opt[data-x="${sel}"]`)!.insertAdjacentHTML('beforeend', `<p class="out">${esc(ch[3])}</p>`);
    d.querySelector('.resrow')!.innerHTML = resRow();
    sh.insertAdjacentHTML('beforeend', `<div class="mono muted" style="margin-top:10px">Thay đổi</div><div class="fxs" style="margin-top:6px">${fxChipsPlay(ch[2], got) || '<span class="muted">Không đổi</span>'}</div>${familyName() !== before ? `<p style="margin-top:8px"><b>${esc(before)}</b> từ nay mang tên <b>${esc(familyName())}</b>. Gia phả ghi lại việc đổi họ năm ${v.y}.</p>` : ''}`);
    finish(d, v, inTour);
  };
}

on('card', el => { const v = allEv().find(x => x.id === el.dataset.id); if (v && !pauseForCard(v)) openCard(v); });
on('close-card', el => { const sc = el.closest<HTMLElement>('.scrim'); if (sc) ghost(sc); continueFlow(); });

/** Chip quan hệ cho chú giải màn chính. */
export const relChip = (k: keyof typeof POWERS) => {
  const [name, fac] = POWERS[k], v = S.rel[k];
  return `<span class="relc" title="${name}">${fac ? flag(fac) : '<i class="dot"></i>'}${name} · <b class="${v >= 55 ? 'ok' : v >= 40 ? '' : 'bad'}">${relLabel(v)}</b></span>`;
};

export { toast };
