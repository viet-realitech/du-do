import { ERAS, FIG, FIGERA, QUIZ, type Era, type Option } from '../data';
import { S, save, rt, familyName } from '../state';
import { on } from '../ui/actions';
import { $, esc, sheet, clearLayer } from '../ui/dom';
import { av, fxChips, TAG_LABEL } from '../ui/bits';
import { SND, buzz } from '../audio';
import { hush, speak } from '../narration';
import { checkBadges } from '../badges';
import { stopTour, startTour } from '../tour';
import { renderMain, invalidateTrack } from '../view';

/* Turning points: optional quiz for the previous chapter → choice → outcome. */
export function openGate(e: Era): void {
  const prev = ERAS[ERAS.indexOf(e) - 1];
  if (prev && !S.quiz[prev.id]) openQuiz(prev.id, () => openChoice(e));
  else openChoice(e);
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
     <button class="btn" id="qn" disabled>${i < qs.length - 1 ? 'Câu tiếp' : 'Tiếp tục hành trình'}</button><button class="lnk" id="qs">Bỏ qua</button>`);
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

export function openChoice(e: Era): void {
  stopTour();
  let selOpt: string | null = null;
  clearLayer();
  SND.gong();
  buzz([30, 60, 30]);
  setTimeout(() => speak(`Điểm rẽ thứ ${e.n}, năm ${e.cy}. ${e.title}. ${e.q}`), 1200);
  const prevE = ERAS[ERAS.indexOf(e) - 1], pp = prevE && S.picks[prevE.id], ctx = e.ctx && pp ? e.ctx[pp] : null;
  const d = sheet(`<div class="row sb"><span class="mono" style="color:var(--red)">◆ Điểm rẽ ${e.n}/6 · ${e.cy}</span><span class="mono muted">${esc(familyName())} · thế hệ ${e.n}</span></div>
  <h2 style="margin:8px 0 8px">${e.title}</h2>
  ${ctx ? `<div class="pv mine" style="margin-bottom:10px"><div class="mono muted">Gia đình bạn</div><p style="font-size:16px;font-style:italic;margin-top:3px">${ctx}</p></div>` : ''}
  <p class="muted" style="margin-bottom:14px">${e.q}</p>
  <div role="radiogroup">${e.opts.map(o => `<button class="opt" role="radio" aria-checked="false" data-o="${o.id}"><div class="tt"><h3>${o.label}</h3><span class="mono muted">${TAG_LABEL[o.tag]}</span></div><div class="who">${o.who}</div><p>${o.d}</p><div class="fxs">${fxChips(o.fx)}</div></button>`).join('')}</div>
  <p class="muted" style="font-size:13px;margin-top:10px">Điểm giá trị phản ánh điều mỗi lực lượng tự tuyên bố theo đuổi, không phải đánh giá đúng sai.</p>
  <div style="height:12px"></div><button class="btn" id="go" disabled>Đi theo hướng này</button>`);
  d.querySelectorAll<HTMLButtonElement>('.opt').forEach(b => (b.onclick = () => {
    selOpt = b.dataset.o!;
    d.querySelectorAll('.opt').forEach(x => { x.classList.toggle('sel', x === b); x.setAttribute('aria-checked', String(x === b)); });
    $<HTMLButtonElement>('#go', d)!.disabled = false;
    SND.tick();
    buzz(8);
  }));
  $<HTMLButtonElement>('#go', d)!.onclick = () => {
    if (!selOpt) return;
    hush();
    S.picks[e.id] = selOpt;
    rt.gate = null;
    save();
    invalidateTrack();
    SND.stamp();
    buzz([10, 30, 40]);
    outcome(e, e.opts.find(o => o.id === selOpt)!);
  };
}

function outcome(e: Era, o: Option): void {
  clearLayer();
  renderMain();
  const fs = Object.keys(FIG).filter(id => FIGERA[id] === e.id);
  sheet(`<span class="stamp">Thế hệ ${e.n} · ${o.label}</span>
  <h2 style="margin:14px 0 8px">Con đường của bạn</h2><p>${o.out}</p>
  <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:12px">${fxChips(o.fx)}</div>
  <div class="rule"></div>
  <button class="row" style="width:100%;text-align:left" data-a="fig" data-id="${o.guide}">${av(o.guide, 46)}<span style="flex:1"><span class="mono muted">Người đồng hành</span><br><b style="font:700 18px var(--disp)">${FIG[o.guide][0]}</b> <span class="muted" style="font-size:14px">· ${FIG[o.guide][2]}</span></span><span class="muted">›</span></button>
  <div class="rule"></div><div class="mono" style="color:var(--acc)">Mở khoá ${fs.length} nhân vật</div>
  <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">${fs.map(id => `<button data-a="fig" data-id="${id}" style="display:flex;flex-direction:column;align-items:center;gap:4px;width:64px;font-size:12px;line-height:1.15;text-align:center">${av(id, 48)}<span>${FIG[id][0].split(' ').slice(-2).join(' ')}</span></button>`).join('')}</div>
  ${o.diary.length ? `<div class="rule"></div><div class="mono" style="color:var(--acc)">✎ Mở ${o.diary.length} trang nhật ký dòng họ</div>${o.diary.map(d => `<div style="font-size:16px;margin-top:6px"><span class="mono muted">${d.y}</span> · ${esc(d.t)}</div>`).join('')}` : ''}
  <div style="height:18px"></div><button class="btn" data-a="watch" data-e="${e.id}">▶ Xem chương ${e.n} diễn ra</button><button class="lnk" data-a="close">Tự kéo dòng thời gian</button>`);
}

on('watch', el => { clearLayer(); renderMain(); checkBadges(); startTour(ERAS.find(x => x.id === el.dataset.e)); });
