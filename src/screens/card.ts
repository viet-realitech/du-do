import { type SpecialCard } from '../data/cards2';
import { closeReplay } from '../replay';
import { SURNAMES, surnameKey } from '../data/surnames';
import { ERAS, type HistEvent } from '../data';
import type { Fx } from '../data/cards';
import { S, rt, familyName, allEv, chYear } from '../state';
import { on } from '../ui/actions';
import { esc, sheet, toast, ghost, calm, radios, reveal } from '../ui/dom';
import { flag } from '../ui/bits';
import { icon } from '../ui/icons';
import { SND, buzz } from '../audio';
import { cardOf, locks, payFx, alKey, placeAt, decide, decided, mustDecide, home, RES, POWERS, relLabel, alignment, specialFor, specialDecided, decideSpecial, ruler } from '../play';
import { pauseForCard } from '../tour';
import { layer } from '../ui/dom';
import { renderMain, continueFlow } from '../view';
import { checkBadges } from '../badges';

/* Thẻ ứng xử của dòng họ ở một sự kiện (chế độ Chơi). */
const POW_KEYS = Object.keys(POWERS) as (keyof typeof POWERS)[];

/** Chip hiệu ứng: tài nguyên và quan hệ, có dấu. */
/** Chip hiệu ứng. Có `got` (phần đổi thực): khoản bị chặn ở 0 / 100 hiện mờ với lời giải thích thay vì biến mất.
    Không có `got` (đang chọn): quan hệ đã kịch trần / chạm đáy theo đúng chiều thì chip mờ, báo trước là không thêm được. */
export function fxChipsPlay(fx: Fx, got?: Fx, plain = false): string {
  const out: string[] = [];
  const capped = (k: keyof Fx, n: number) => {
    if (plain) return false; // thẻ đã quyết mở lại: ghi đúng hiệu ứng đã chọn, không so với quan hệ hôm nay
    const cur = (k in S.res ? (S.res as Record<string, number>)[k] : (S.rel as Record<string, number>)[k]) ?? 50;
    return got ? !got[k] : (n > 0 && cur >= 100) || (n < 0 && cur <= 0);
  };
  // dòng sổ: tên khoản rồi con số có dấu (xanh thêm, son bớt), không phải viên thuốc chữ đơn cách
  for (const [k, name, ic] of RES) {
    const n = got ? got[k] || fx[k] : fx[k]; if (!n) continue;
    if (got && capped(k, n)) { out.push(`<span class="fx full">${ic}${name} <em>${n > 0 ? 'đã đầy' : 'đã cạn'}</em></span>`); continue; }
    out.push(`<span class="fx ${n > 0 ? 'up' : 'dn'}">${ic}${name} <b>${signed(n)}</b></span>`);
  }
  for (const k of POW_KEYS) {
    const n = got ? got[k] || fx[k] : fx[k]; if (!n) continue;
    const [name, fac] = POWERS[k];
    if (capped(k, n)) { out.push(`<span class="fx rel full" title="Không đổi thêm được">${fac ? flag(fac) : ''}${name} <em>${n > 0 ? 'đã tin cậy tối đa' : 'đã thù địch tột độ'}</em></span>`); continue; }
    out.push(`<span class="fx rel ${n > 0 ? 'up' : 'dn'}">${fac ? flag(fac) : ''}${name} <b>${signed(n)}</b></span>`);
  }
  return out.join('');
}
/** Số có dấu như trong sổ: +14, −20 (dấu trừ thật, không phải gạch nối). */
export const signed = (n: number) => (n > 0 ? '+' : '−') + Math.abs(n);

/** `inTour`: thẻ mở giữa tour; "Tiếp tục" đi tiếp sự kiện kế, thẻ tuỳ chọn có thể bỏ qua. */
export function openCard(v: HistEvent, inTour = false): void {
  const c = cardOf(v);
  if (!c || layer.querySelector(`.scrim[data-card="${v.id}"]`)) return; // thẻ này đang mở: không mở chồng
  const sp0 = specialFor(v), spPending = !!sp0 && !specialDecided(sp0);
  const done = decided(v.id), must = mustDecide(v) || spPending, y = chYear(v), pl = placeAt(y);
  const als = c[2].map((ch, i) => alignment(ch[2], y, alKey(v, i)));
  // Không đủ sức thì khoá, trừ khi thẻ bắt buộc thành ngõ cụt hay chỉ còn lựa chọn trái đường (play.ts locks)
  const noList = done ? c[2].map(() => null) : locks(c[2].map(ch => ch[2]), als);
  if (inTour) { buzz(must ? [15, 30, 15] : 10); }
  const near = c[1] !== 'all' && c[1] !== '' && mustDecide(v); // thẻ bị biến cố riêng buộc (tn25 của họ Nguyễn) không phải vì chạm tới quê
  const d = sheet(`<div class="kick${must ? ' must' : ''}"><span class="mono">${must ? icon('seal', 12) : ''}${must ? 'Dòng họ phải quyết định' : 'Dòng họ có thể hành động'} · ${v.y}</span><span class="mono muted">${esc(familyName())} · ${esc(pl.moved ? `${home()[1]} → ${pl.name}` : pl.name)}</span></div>
  ${spPending ? `<div class="steps" aria-hidden="true"><span class="on">1 · Thẻ sự kiện</span><span>2 · Biến cố riêng</span></div>` : ''}
  <h2 style="margin:8px 0 6px">${esc(v.t)}</h2>
  <p class="muted" style="margin-bottom:6px">${esc(v.s)}</p>
  ${near ? `<div class="mono near">${icon('home', 14)}${pl.moved ? `Chạm tới nơi dòng họ đang sống (${esc(pl.name)})` : `Chạm tới quê nhà ${esc(pl.name)}`}</div>` : '<div style="height:6px"></div>'}
  <div class="resrow">${RES.map(([k, n, ic]) => `<span><i>${ic}</i>${n} <b>${S.res[k]}</b></span>`).join('')}</div>
  <div role="radiogroup">${c[2].map((ch, i) => {
    const no = noList[i], al = als[i];
    const picked = done && S.cards[v.id] === i;
    return `<button class="opt${picked ? ' sel' : done ? ' skip' : ''}" data-i="${i}" role="radio" aria-checked="${picked}"${no || (done && !picked) ? ' disabled' : ''}>
      <h3>${esc(ch[0])}</h3>${no ? `<div class="alrow"><span class="al bad">${no}</span></div>` : al ? `<div class="alrow">${alTag(al)}</div>` : ''}
      <p>${esc(ch[1])}</p><div class="fxs">${fxChipsPlay(ch[2], undefined, done)}${done || no ? '' : swapChip(ch[2])}</div>${picked ? `<p class="out">${esc(ch[3])}</p>` : ''}</button>`;
  }).join('')}</div>
  ${done ? '' : '<div style="height:10px"></div><button class="btn" id="cgo" disabled>Chọn một cách ứng xử</button>'}
  <p class="muted" style="font-size:13px;margin-top:10px">Số liệu là ước lệ của trò chơi. Sự kiện lịch sử vẫn diễn ra như đã diễn ra.</p>
  ${done ? '<div style="height:12px"></div><button class="btn ghost" data-a="close-card">Đóng</button>' : inTour && !must ? '<button class="lnk" data-a="close-card">Bỏ qua, đi tiếp ›</button>' : ''}`, done && !spPending);
  d.dataset.card = v.id;
  radios(d.querySelector('.sheet > [role=radiogroup]'), d.querySelector('h2'));
  if (done) { if (sp0 && spPending) { d.querySelector('.btn.ghost[data-a="close-card"]')?.remove(); mountSpecial(d, v, sp0, inTour); } return; }
  // chạm để chọn, bấm "Quyết định" mới chốt (như điểm rẽ và biến cố riêng): một lần chạm nhầm không tiêu mất gia sản
  const cgo = d.querySelector<HTMLButtonElement>('#cgo')!;
  let sel = -1;
  d.querySelectorAll<HTMLButtonElement>('.opt').forEach(b => (b.onclick = () => {
    if (decided(v.id)) return;
    sel = +b.dataset.i!;
    d.querySelectorAll('.opt').forEach(x => { x.classList.toggle('sel', x === b); x.setAttribute('aria-checked', String(x === b)); });
    cgo.disabled = false;
    cgo.textContent = 'Quyết định';
    reveal(cgo);
    SND.tick();
    buzz(8);
  }));
  cgo.onclick = () => {
    if (sel < 0 || decided(v.id)) return; // một thẻ chỉ quyết một lần: chạm lại không áp hiệu ứng thêm
    const i = sel, ch = c[2][i], b = d.querySelector<HTMLButtonElement>(`.opt[data-i="${i}"]`)!, before = { ...S.res };
    const got = decide(v, i);
    SND.stamp();
    buzz([10, 30, 40]);
    cgo.remove();
    d.querySelectorAll<HTMLButtonElement>('.opt').forEach(x => { x.disabled = true; x.classList.toggle('sel', x === b); x.classList.toggle('skip', x !== b); x.setAttribute('aria-checked', String(x === b)); });
    d.querySelector('.lnk[data-a="close-card"]')?.remove();
    b.insertAdjacentHTML('beforeend', `<p class="out">${esc(ch[3])}</p>`);
    d.querySelector('.resrow')!.innerHTML = RES.map(([k, n, ic]) => `<span><i>${ic}</i>${n} <b>${S.res[k]}</b></span>`).join('');
    const warn = lowNow(before);
    d.querySelector('.sheet')!.insertAdjacentHTML('beforeend', `<div class="rule"></div><div class="mono muted">Thay đổi</div><div class="fxs" style="margin-top:6px">${fxChipsPlay(ch[2], got) || '<span class="muted">Không đổi</span>'}</div>
      ${warn.length ? `<p style="color:var(--red);margin-top:8px">Cạn ${warn.join(', ')}: mùa màng thế hệ tới sẽ khó khăn.</p>` : ''}`);
    const sp = specialFor(v);
    if (sp && !specialDecided(sp)) mountSpecial(d, v, sp, inTour); else finish(d, v, inTour);
  };
}

const alTag = (al: number) => (al ? `<span class="al ${al > 0 ? 'ok' : 'bad'}">${al > 0 ? 'Hợp đường bạn theo' : 'Trái đường bạn theo'}</span>` : '');
const resRow = () => RES.map(([k, n, ic]) => `<span><i>${ic}</i>${n} <b>${S.res[k]}</b></span>`).join('');
/** Lựa chọn chỉ đủ sức nhờ đổi lúa gạo ⇄ bạc (play.ts payFx): nói trước sẽ đổi bao nhiêu. */
function swapChip(fx: Fx): string {
  const sw = payFx(fx).swap;
  return sw ? `<span class="fx swap">⇄ ${sw[0] === 'g' ? `Bỏ ${sw[1]} bạc đong gạo` : `Bán ${sw[1]} lúa gạo lấy bạc`}</span>` : '';
}
/** Tài nguyên vừa tụt xuống mức cạn (≤ 10) sau quyết định này: báo một lần lúc vượt ngưỡng, không lặp lại sau mỗi thẻ. */
const lowNow = (before: Record<string, number>) => RES.filter(([k]) => before[k] > 10 && S.res[k] <= 10).map(([, n]) => n.toLowerCase());

/** Mọi quyết định trên thẻ đã xong: nút tiếp tục, mở khoá đóng thẻ, vẽ lại màn chính. */
function finish(d: HTMLElement, v: HistEvent, inTour: boolean): void {
  // kết cục vừa chọn làm mô tả cho nút tiếp tục, và tiêu điểm chuyển tới nút đó (không rơi về <body> khi lựa chọn bị khoá)
  const outs = [...d.querySelectorAll<HTMLElement>('.opt.sel .out')].map((p, i) => { p.id ||= `cout-${v.id}-${i}`; return p.id; });
  d.querySelector('.sheet')!.insertAdjacentHTML('beforeend', `<div style="height:14px"></div><button class="btn" data-a="close-card"${outs.length ? ` aria-describedby="${outs.join(' ')}"` : ''}>${inTour || rt.flowTo ? 'Tiếp tục ▶' : 'Tiếp tục'}</button>`);
  const nx = d.querySelector<HTMLElement>('.btn[data-a="close-card"]');
  nx?.focus({ preventScroll: true });
  reveal(nx); // điện thoại: nút nằm dưới mép bảng
  delete d.dataset.lock;
  if (rt.card?.id === v.id) rt.card = null;
  // thẻ mở từ trang sự kiện: nút ◆ trên đầu trang thành "✓ Đã quyết"
  const chip = layer.querySelector<HTMLElement>(`:scope > .ov [data-a="card"][data-id="${v.id}"]`);
  if (chip) { chip.textContent = '✓ Đã quyết'; chip.classList.remove('on'); }
  renderMain();
  checkBadges();
}

/** Biến cố riêng của dòng họ (họ, phe, quê…) nối tiếp thẻ sự kiện trong cùng một bảng; có thể đổi họ. */
function mountSpecial(d: HTMLElement, v: HistEvent, sp: SpecialCard, inTour: boolean): void {
  const sh = d.querySelector('.sheet')!;
  const als = sp.choices.map(ch => (ch[4] ? 0 : alignment(ch[2], chYear(v)))); // đổi họ: không hợp, không trái
  const noList = locks(sp.choices.map(ch => ch[2]), als);
  const mine = S.surname || surnameKey(S.name);
  const moms = SURNAMES.filter(s => s.key !== mine).slice(0, 8);
  // vì họ: "của Họ X"; vì đường cha ông theo / phe / quê / gia sản: nói đúng lý do (không ngụ ý vì cái tên)
  const w = sp.when, pk = w.picks ? ERAS.flatMap(e => e.opts).find(o => w.picks!.includes(o.id) && Object.values(S.picks).includes(o.id)) : undefined;
  const why = w.surnames ? `riêng của ${familyName()}` : pk ? `của gia đình · vì đã theo ${pk.label}` : w.camps ? 'của gia đình · vì phe đang theo' : w.homes ? `của gia đình · ở ${home()[1]}` : 'của gia đình';
  sh.querySelector('.steps')?.classList.add('two');
  sh.insertAdjacentHTML('beforeend', `<div class="xsp"><div class="kick"><span class="mono">${icon('seal', 12)}Biến cố ${esc(why)}</span><span class="mono muted">Bước 2/2</span></div>
  <h3 style="margin:8px 0 4px">${esc(sp.title)}</h3><p class="muted" style="margin-bottom:8px">${esc(sp.s)}</p>
  <div role="radiogroup" class="xopts">${sp.choices.map((ch, i) => `<button class="opt" data-x="${i}" role="radio" aria-checked="false"${noList[i] ? ' disabled' : ''}>
    <h3>${esc(ch[0])}</h3>${noList[i] ? `<div class="alrow"><span class="al bad">${noList[i]}</span></div>` : ch[4] ? '<div class="alrow"><span class="al">Đổi họ</span></div>' : als[i] ? `<div class="alrow">${alTag(als[i])}</div>` : ''}<p>${esc(ch[1])}</p><div class="fxs">${fxChipsPlay(ch[2])}${noList[i] ? '' : swapChip(ch[2])}</div></button>`).join('')}</div>
  <div id="xmom" hidden style="margin-top:10px"><div class="mono muted">Lấy họ mẹ</div><div class="homes" style="margin-top:6px">${moms.map((s, i) => `<button class="chip${i === 0 ? ' on' : ''}" data-m="${esc(s.names[0])}" aria-pressed="${i === 0}">${esc(s.names[0])}</button>`).join('')}</div></div>
  <div style="height:10px"></div><button class="btn" id="xgo" disabled>Quyết định</button></div>`);
  const xo = sh.querySelector<HTMLElement>('.xopts'), xh = xo?.previousElementSibling?.previousElementSibling as HTMLElement | null;
  radios(xo, xh); // tên nhóm: tiêu đề biến cố
  // nút "Quyết định" vừa được gỡ: tiêu điểm tới tiêu đề biến cố (trình đọc màn hình đọc nó), không rơi về <body>; bảng
  // cuộn tới đầu biến cố (trước đây nó nằm ~900 px dưới mép màn hình, không gì báo còn một quyết định)
  if (xh) { xh.tabIndex = -1; xh.focus({ preventScroll: true }); }
  const top = sh.querySelector<HTMLElement>('.xsp');
  // cuộn chính tờ bảng (không scrollIntoView: lệnh ấy cuộn cả mọi khung chứa, kể cả #app khi phần chính cao hơn màn hình)
  if (top) requestAnimationFrame(() => sh.scrollTo({ top: sh.scrollTop + top.getBoundingClientRect().top - sh.getBoundingClientRect().top - 10, behavior: calm.matches ? 'auto' : 'smooth' }));
  let sel = -1, mom = moms[0]?.names[0] || 'Nguyễn';
  const xmom = sh.querySelector<HTMLElement>('#xmom')!, xgo = sh.querySelector<HTMLButtonElement>('#xgo')!;
  sh.querySelectorAll<HTMLButtonElement>('.xopts .opt').forEach(b => (b.onclick = () => {
    sel = +b.dataset.x!;
    sh.querySelectorAll('.xopts .opt').forEach(x => { x.classList.toggle('sel', x === b); x.setAttribute('aria-checked', String(x === b)); });
    xmom.hidden = sp.choices[sel][4] !== 'mother';
    xgo.disabled = false;
    reveal(xgo);
    SND.tick();
  }));
  sh.querySelectorAll<HTMLButtonElement>('#xmom .chip').forEach(b => (b.onclick = () => { mom = b.dataset.m!; sh.querySelectorAll('#xmom .chip').forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', String(x === b)); }); }));
  xgo.onclick = () => {
    if (sel < 0 || specialDecided(sp)) return;
    const ch = sp.choices[sel], before = familyName(), had = { ...S.res };
    const got = decideSpecial(sp, sel, v.y, ch[4] === 'mother' ? mom : ch[4]), warn = lowNow(had);
    SND.stamp();
    buzz([10, 30, 40]);
    sh.querySelectorAll<HTMLButtonElement>('.xopts .opt').forEach((x, i) => { x.disabled = true; x.classList.toggle('sel', i === sel); x.classList.toggle('skip', i !== sel); });
    xmom.remove(); xgo.remove();
    sh.querySelector(`.xopts .opt[data-x="${sel}"]`)!.insertAdjacentHTML('beforeend', `<p class="out">${esc(ch[3])}</p>`);
    d.querySelector('.resrow')!.innerHTML = resRow();
    (sh.querySelector('.xsp') || sh).insertAdjacentHTML('beforeend', `<div class="mono muted" style="margin-top:10px">Thay đổi</div><div class="fxs" style="margin-top:6px">${fxChipsPlay(ch[2], got) || '<span class="muted">Không đổi</span>'}</div>${familyName() !== before ? `<p style="margin-top:8px"><b>${esc(before)}</b> từ nay mang tên <b>${esc(familyName())}</b>. Gia phả ghi lại việc đổi họ năm ${v.y}.</p>` : ''}
    ${warn.length ? `<p style="color:var(--red);margin-top:8px">Cạn ${warn.join(', ')}: mùa màng thế hệ tới sẽ khó khăn.</p>` : ''}`);
    finish(d, v, inTour);
  };
}

on('card', el => {
  const v = allEv().find(x => x.id === el.dataset.id);
  if (!v) return;
  if (document.getElementById('replb')) closeReplay(false); // đang xem lại diễn biến: dừng hẳn trước khi mở thẻ
  if (!pauseForCard(v)) openCard(v);
});
on('close-card', el => { const sc = el.closest<HTMLElement>('.scrim'); if (sc) ghost(sc); continueFlow(); });

const relCls = (v: number) => (v >= 55 ? 'ok' : v >= 40 ? '' : 'bad');
/** Chip quan hệ cho chú giải màn chính. `y`: năm để đánh dấu (mái nhà) bên đang cai quản quê (bên quyết định mùa màng). */
export const relChip = (k: keyof typeof POWERS, y?: number) => {
  const [name, fac] = POWERS[k], v = S.rel[k], rules = y !== undefined && ruler(y) === k;
  return `<span class="relc" title="${rules ? `${name}: đang cai quản ${esc(placeAt(y!).name)}` : name}">${rules ? icon('home', 13) : ''}${fac ? flag(fac) : '<i class="dot"></i>'}${name} · <b class="${relCls(v)}">${relLabel(v)}</b></span>`;
};
/** Sổ quan hệ trong bảng (mùa màng): mỗi thế lực một dòng kẻ (cờ, tên, mức), không phải một đám chip xuống dòng lởm chởm;
    bên đang cai quản quê ghi rõ bằng chữ, cạnh dấu mái nhà. */
export const relRows = (ks: (keyof typeof POWERS)[], y?: number) => `<ul class="rels">${ks.map(k => {
  const [name, fac] = POWERS[k], v = S.rel[k], rules = y !== undefined && ruler(y) === k;
  return `<li>${fac ? flag(fac) : '<i class="dot"></i>'}<span>${name}${rules ? `<small>${icon('home', 12)}cai quản ${esc(placeAt(y!).name)}</small>` : ''}</span><b class="${relCls(v)}">${relLabel(v)}</b></li>`;
}).join('')}</ul>`;

export { toast };
