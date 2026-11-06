import { gateKey, gateSpeech } from '../speech';
import type { Fx } from '../data/cards';
import { mood } from '../music';
import { ERAS, FIG, FIGERA, QUIZ, type Era, type Option } from '../data';
import { S, save, rt, familyName } from '../state';
import { on } from '../ui/actions';
import { $, esc, sheet, clearLayer, ghost } from '../ui/dom';
import { isPlay, applyFx, eraFx, harvest, home, RES, powersAt, continues, type Harvest } from '../play';
import { fxChipsPlay, relChip } from './card';
import { av, flag, fxChips, TAG_LABEL } from '../ui/bits';
import { SND, buzz } from '../audio';
import { hush, speak } from '../narration';
import { checkBadges } from '../badges';
import { stopTour, startTour } from '../tour';
import { layer } from '../ui/dom';
import { renderMain, invalidateTrack } from '../view';
import { opener } from './cinema';
import { fxOn } from '../scene';

/* Turning points: optional quiz for the previous chapter → choice → outcome. */
export function openGate(e: Era): void {
  rt.flowTo = null;
  const prev = ERAS[ERAS.indexOf(e) - 1];
  const next = () => { if (prev && !S.quiz[prev.id]) openQuiz(prev.id, () => openChoice(e)); else openChoice(e); };
  // Trò chơi: khép lại thế hệ vừa sống (mùa màng) trước khi đố và bước vào điểm rẽ mới.
  const h = prev ? harvest(prev, e.cy) : null;
  if (prev && h) openHarvest(prev, h, e.cy, S.quiz[prev.id] ? `Bước vào điểm rẽ ${e.n}` : `Đố nhanh chương ${prev.n}`, next); else next();
}

/** Chế độ Chơi: mùa màng khép lại thế hệ `e`, rồi `next` (điểm rẽ kế hoặc kết cục). */
export function openHarvest(e: Era, h: Harvest, y: number, go: string, next: () => void): void {
  stopTour();
  clearLayer();
  SND.chime();
  const d = sheet(`<div class="row sb"><span class="mono" style="color:var(--acc)">◆ Mùa màng · Thế hệ ${e.n} khép lại</span><span class="mono muted">${esc(familyName())} · ${esc(home()[1])}</span></div>
  <h2 style="margin:10px 0 6px">Gia sản sau một đời người</h2>
  <p class="muted" style="margin-bottom:12px">${e.title}, ${e.cy}–${ERAS[e.n]?.cy ?? 2026}. Ruộng đất, người trong họ và các mối quan hệ quyết định mùa màng.</p>
  ${h.lines.map(([n, fx]) => `<div class="row sb hl"><span>${esc(n)}</span><span class="fxs">${fxChipsPlay(fx) || '<span class="muted">—</span>'}</span></div>`).join('')}
  <div class="row sb hl" style="margin-top:6px;font-weight:700"><span>Gia sản đổi thực</span><span class="fxs">${fxChipsPlay(h.total) || '<span class="muted">Không đổi</span>'}</span></div>
  <div class="rule"></div>
  <div class="resrow">${RES.map(([k, n, ic]) => `<span><i>${ic}</i>${n} <b>${S.res[k]}</b></span>`).join('')}</div>
  <div class="mono muted" style="margin-top:12px">Quan hệ</div>
  <div class="fxs" style="margin-top:6px">${powersAt(y).map(relChip).join('')}</div>
  <div style="height:16px"></div><button class="btn" id="hv-go">${esc(go)} ›</button>`);
  renderMain();
  d.querySelector<HTMLButtonElement>('#hv-go')!.onclick = () => { ghost(d); next(); };
}

export function openQuiz(eid: string, done?: () => void): void {
  stopTour();
  const qs = QUIZ[eid], e = ERAS.find(x => x.id === eid)!;
  let i = 0;
  const res: boolean[] = [];
  const fin = () => { S.quiz[eid] = res.slice(); save(); clearLayer(); checkBadges(); done?.(); };
  const show = () => {
    const [q, opts, a, ex] = qs[i];
    clearLayer();
    const d = sheet(`<div class="row sb"><span class="mono" style="color:var(--acc)">★ Đố nhanh · Chương ${e.n}</span><span class="mono muted">Câu ${i + 1}/${qs.length}</span></div>
     <h2 style="margin:12px 0 16px">${q}</h2><div>${opts.map((o, j) => `<button class="qa" data-j="${j}">${o}</button>`).join('')}</div>
     <p id="qex" class="muted" aria-live="polite" style="margin-top:12px;min-height:24px;font-size:16px"></p><div style="height:8px"></div>
     <button class="btn" id="qn" disabled>${i < qs.length - 1 ? 'Câu tiếp' : eid === 'e6' ? 'Xem kết cục' : 'Tiếp tục hành trình'}</button><button class="lnk" id="qs">Bỏ qua</button>`);
    d.querySelectorAll<HTMLButtonElement>('.qa').forEach(b => (b.onclick = () => {
      if (res.length > i) return;
      const j = +b.dataset.j!, ok = j === a;
      res.push(ok);
      d.querySelectorAll<HTMLElement>('.qa').forEach(x => {
        const k = +x.dataset.j!;
        if (k === a) x.classList.add('ok'); else if (k === j) x.classList.add('no');
      });
      $('#qex', d)!.innerHTML = (ok ? '<b>Chính xác.</b> ' : '<b>Chưa đúng.</b> ') + ex;
      if (ok) SND.ok(); else SND.no();
      buzz(ok ? 15 : [20, 40, 20]);
      $<HTMLButtonElement>('#qn', d)!.disabled = false;
    }));
    $<HTMLButtonElement>('#qn', d)!.onclick = () => { i++; if (i < qs.length) show(); else fin(); };
    $<HTMLButtonElement>('#qs', d)!.onclick = () => { while (res.length < qs.length) res.push(false); fin(); };
  };
  show();
}

/** Điểm rẽ: màn mở chương điện ảnh (cinema.ts) rồi bảng chọn hướng. */
export function openChoice(e: Era): void {
  stopTour();
  clearLayer();
  opener(e, played => choice(e, played));
}

function choice(e: Era, quiet: boolean): void {
  stopTour();
  let selOpt: string | null = null;
  clearLayer();
  mood('gate');
  if (!quiet) { SND.gong(); buzz([30, 60, 30]); }
  // Nghe lời dẫn xong mới chọn: các hướng mờ và khoá cho tới khi giọng đọc kể hết (hoặc người chơi bỏ qua);
  // không có giọng đọc thì mở sau một quãng đủ đọc câu hỏi.
  let open = false, sync = true;
  const release = () => {
    if (open || !d.isConnected) return;
    open = true;
    d.querySelector('#lst')?.remove();
    d.querySelectorAll<HTMLButtonElement>('.opt').forEach((b, i) => { b.disabled = false; b.style.animationDelay = `${i * 90}ms`; b.classList.add('in'); });
    SND.tick();
  };
  const say = setTimeout(() => {
    const spoke = speak(gateSpeech(e), () => { if (!sync) release(); }, false, gateKey(e));
    sync = false;
    if (!spoke) setTimeout(release, Math.min(6000, 1800 + e.q.length * 35));
  }, 1200);
  const prevE = ERAS[ERAS.indexOf(e) - 1], pp = prevE && S.picks[prevE.id], ctx = e.ctx && pp ? e.ctx[pp] : null;
  const tag = (id: string) => (pp ? (continues(pp, id) ? '<div class="alrow"><span class="al mono ok">Tiếp nối đường cũ</span></div>' : '<div class="alrow"><span class="al mono">Rẽ hướng</span></div>') : '');
  const d = sheet(`<div class="row sb"><span class="mono" style="color:var(--red)">◆ Điểm rẽ ${e.n}/6 · ${e.cy}</span><span class="mono muted">${esc(familyName())} · thế hệ ${e.n}</span></div>
  <h2 style="margin:8px 0 8px">${e.title}</h2>
  ${ctx ? `<div class="pv mine" style="margin-bottom:10px"><div class="mono muted">Gia đình bạn</div><p style="font-size:16px;font-style:italic;margin-top:3px">${ctx}</p></div>` : ''}
  <p class="muted" style="margin-bottom:14px">${e.q}</p>
  <div class="listen" id="lst"><i class="pulse"></i><span>Đang kể lời dẫn…</span><button class="lnk" id="lskip">Chọn ngay ›</button></div>
  <div role="radiogroup">${e.opts.map(o => `<button class="opt" role="radio" aria-checked="false" data-o="${o.id}" disabled><div class="tt"><h3>${o.label}</h3><span class="mono muted">${TAG_LABEL[o.tag]}</span></div>${tag(o.id)}<div class="who">${o.who}</div><p>${o.d}</p><div class="fxs">${fxChips(o.fx)}${isPlay() ? fxChipsPlay(eraFx(o.id)) : ''}</div></button>`).join('')}</div>
  <p class="muted" style="font-size:13px;margin-top:10px">Điểm giá trị phản ánh điều mỗi lực lượng tự tuyên bố theo đuổi, không phải đánh giá đúng sai.</p>
  <div style="height:12px"></div><button class="btn" id="go" disabled>Đi theo hướng này</button>`);
  d.querySelector<HTMLButtonElement>('#lskip')!.onclick = () => { clearTimeout(say); hush(); release(); };
  d.querySelectorAll<HTMLButtonElement>('.opt').forEach(b => (b.onclick = () => {
    selOpt = b.dataset.o!;
    d.querySelectorAll('.opt').forEach(x => { x.classList.toggle('sel', x === b); x.setAttribute('aria-checked', String(x === b)); });
    $<HTMLButtonElement>('#go', d)!.disabled = false;
    SND.tick();
    buzz(8);
  }));
  $<HTMLButtonElement>('#go', d)!.onclick = () => {
    if (!selOpt) return;
    clearTimeout(say);
    hush();
    S.picks[e.id] = selOpt;
    rt.gate = null;
    save();
    const got = isPlay() ? applyFx(eraFx(selOpt)) : {};
    invalidateTrack();
    SND.stamp();
    buzz([10, 30, 40]);
    outcome(e, e.opts.find(o => o.id === selOpt)!, got);
  };
}

function outcome(e: Era, o: Option, got: Fx = {}): void {
  clearLayer();
  mood('calm');
  renderMain();
  const fs = Object.keys(FIG).filter(id => FIGERA[id] === e.id);
  if (fxOn()) SND.vow();
  // ngọn cờ của hướng vừa chọn mở ra, người đồng hành bước vào: dòng họ đứng về một phía
  sheet(`<div class="unfurl">${o.fac ? flag(o.fac) : `<i class="flag nf"></i>`}<div class="uf-t"><span class="mono">Thế hệ ${e.n} chọn · ${e.cy}</span><b>${o.label}</b></div>${av(o.guide, 52)}</div>
  <h2 style="margin:14px 0 8px">Con đường của bạn</h2><p>${o.out}</p>
  <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:12px">${fxChips(o.fx)}</div>
  ${isPlay() && Object.keys(got).length ? `<div class="mono muted" style="margin-top:12px">Các thế lực nhìn dòng họ bạn</div><div class="fxs" style="margin-top:6px">${fxChipsPlay(got)}</div>` : ''}
  <div class="rule"></div>
  <button class="row" style="width:100%;text-align:left" data-a="fig" data-id="${o.guide}">${av(o.guide, 46)}<span style="flex:1"><span class="mono muted">Người đồng hành</span><br><b style="font:700 18px var(--disp)">${FIG[o.guide][0]}</b> <span class="muted" style="font-size:14px">· ${FIG[o.guide][2]}</span></span><span class="muted">›</span></button>
  <div class="rule"></div><div class="mono" style="color:var(--acc)">Mở khoá ${fs.length} nhân vật</div>
  <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">${fs.slice(0, 8).map(id => `<button data-a="fig" data-id="${id}" style="display:flex;flex-direction:column;align-items:center;gap:4px;width:64px;font-size:12px;line-height:1.15;text-align:center">${av(id, 48)}<span>${FIG[id][0].replace(/\s*\(.*\)\s*$/, '').split(' ').slice(-2).join(' ')}</span></button>`).join('')}${fs.length > 8 ? `<button data-a="tab" data-t="fig" style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;width:64px;font-size:12px;line-height:1.15;text-align:center"><span class="av" style="width:48px;height:48px;font-size:14px">+${fs.length - 8}</span><span>Xem hết ›</span></button>` : ''}</div>
  ${o.diary.length ? `<div class="rule"></div><div class="mono" style="color:var(--acc)">✎ Mở ${o.diary.length} trang nhật ký dòng họ</div>${o.diary.map(d => `<div style="font-size:16px;margin-top:6px"><span class="mono muted">${d.y}</span> · ${esc(d.t)}</div>`).join('')}` : ''}
  <div style="height:18px"></div>${isPlay()
    ? `<button class="btn go" data-a="watch" data-e="${e.id}"><i class="cd"></i><span>▶ Sống qua thế hệ ${e.n}</span></button><p class="muted" style="font-size:13px;text-align:center;margin-top:10px">Chương tự bắt đầu; chạm nhân vật để đọc thêm trước.</p>`
    : `<button class="btn" data-a="watch" data-e="${e.id}">▶ Xem chương ${e.n} diễn ra</button><button class="lnk" data-a="close">Tự kéo dòng thời gian</button>`}`);
  if (!isPlay()) return;
  // Trò chơi: đọc kết cục rồi tự sang chương; chạm vào nhân vật / nhật ký thì dừng đếm, để người chơi tự bấm.
  const d = layer.lastElementChild as HTMLElement, bar = d.querySelector<HTMLElement>('.cd')!;
  let armed = true;
  const go = () => { if (!armed || !layer.contains(d)) return; armed = false; clearLayer(); renderMain(); checkBadges(); startTour(e); };
  // speak() gọi callback ngay (đồng bộ) khi không có giọng: khi đó dùng bộ đếm thay vì kết thúc lời đọc.
  let sync = true;
  const spoke = speak(`Con đường của bạn. ${o.out}`, () => { if (!sync && armed) setTimeout(go, 700); });
  sync = false;
  const ms = spoke ? Math.max(6000, o.out.length * 95) : Math.max(5000, 3000 + o.out.length * 60);
  bar.style.animationDuration = ms + 'ms';
  setTimeout(go, ms + (spoke ? 4000 : 0)); // bảo hiểm khi lời đọc bị cắt giữa chừng
  // Người chơi đang đọc hay chạm vào bảng (nhân vật, cuộn): dừng đếm, để họ tự bấm. Chạm nút ▶ thì đếm cũng vô hiệu.
  const disarm = () => { if (!armed) return; armed = false; hush(); bar.remove(); };
  d.addEventListener('click', ev => {
    const t = (ev.target as Element).closest<HTMLElement>('[data-a]');
    if (t && t.dataset.a === 'watch') armed = false;
    else if (t) disarm(); // nhân vật, 'Xem hết' (kể cả kích hoạt bằng bàn phím: không có pointerdown)
  }, true);
  d.querySelector('.sheet')!.addEventListener('scroll', disarm, { passive: true });
  d.querySelector('.sheet')!.addEventListener('pointerdown', ev => { if (!(ev.target as Element).closest('.btn.go')) disarm(); }, true);
}

on('watch', el => { clearLayer(); renderMain(); checkBadges(); startTour(ERAS.find(x => x.id === el.dataset.e)); });
