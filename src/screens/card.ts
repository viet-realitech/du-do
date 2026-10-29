import type { HistEvent } from '../data';
import type { Fx } from '../data/cards';
import { S, rt, familyName, allEv } from '../state';
import { on } from '../ui/actions';
import { esc, sheet, toast, ghost } from '../ui/dom';
import { flag } from '../ui/bits';
import { SND, buzz } from '../audio';
import { cardOf, canAfford, cost, decide, decided, mustDecide, home, RES, POWERS, relLabel } from '../play';
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
  const done = decided(v.id), must = mustDecide(v), h = home();
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
    const no = noList[i];
    const picked = done && S.cards[v.id] === i;
    return `<button class="opt${picked ? ' sel' : ''}" data-i="${i}" role="radio" aria-checked="${picked}"${no || (done && !picked) ? ' disabled' : ''}>
      <div class="tt"><h3>${esc(ch[0])}</h3>${no ? `<span class="mono" style="color:var(--red)">${no}</span>` : ''}</div>
      <p>${esc(ch[1])}</p><div class="fxs">${fxChipsPlay(ch[2])}</div>${picked ? `<p class="out">${esc(ch[3])}</p>` : ''}</button>`;
  }).join('')}</div>
  <p class="muted" style="font-size:13px;margin-top:10px">Số liệu là ước lệ của trò chơi. Sự kiện lịch sử vẫn diễn ra như đã diễn ra.</p>
  ${done ? '<div style="height:12px"></div><button class="btn ghost" data-a="close-card">Đóng</button>' : inTour && !must ? '<button class="lnk" data-a="close-card">Bỏ qua, đi tiếp ›</button>' : ''}`, done);
  d.dataset.card = v.id;
  if (done) return;
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
      ${warn.length ? `<p style="color:var(--red);margin-top:8px">Cạn ${warn.join(', ')}: mùa màng thế hệ tới sẽ khó khăn.</p>` : ''}
      <div style="height:14px"></div><button class="btn" data-a="close-card">${inTour || rt.flowTo ? 'Tiếp tục ▶' : 'Tiếp tục'}</button>`);
    delete d.dataset.lock;
    if (rt.card?.id === v.id) rt.card = null;
    renderMain();
    checkBadges();
  }));
}

on('card', el => { const v = allEv().find(x => x.id === el.dataset.id); if (v && !pauseForCard(v)) openCard(v); });
on('close-card', el => { const sc = el.closest<HTMLElement>('.scrim'); if (sc) ghost(sc); continueFlow(); });

/** Chip quan hệ cho chú giải màn chính. */
export const relChip = (k: keyof typeof POWERS) => {
  const [name, fac] = POWERS[k], v = S.rel[k];
  return `<span class="relc" title="${name}">${fac ? flag(fac) : '<i class="dot"></i>'}${name} · <b class="${v >= 55 ? 'ok' : v >= 40 ? '' : 'bad'}">${relLabel(v)}</b></span>`;
};

export { toast };
