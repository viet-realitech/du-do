import { gateKey, gateSpeech, outKey, outSpeech } from '../speech';
import type { Fx } from '../data/cards';
import { mood } from '../music';
import { ERAS, FIG, FIGERA, QUIZ, type Era, type Option, type QuizItem } from '../data';
import { S, save, rt, familyName, quizAsked, markAsked } from '../state';
import { on } from '../ui/actions';
import { $, esc, sheet, clearLayer, ghost, calm, announce, radios } from '../ui/dom';
import { isPlay, applyFx, eraFx, harvest, home, RES, powersAt, continues, choicesIn, mustDecide, ruler, regionAt, hasFlag, type Harvest } from '../play';
import { fxChipsPlay, relRows } from './card';
import { av, flag, fxChips, TAG_LABEL } from '../ui/bits';
import { SND, buzz } from '../audio';
import { hush, speak } from '../narration';
import { checkBadges } from '../badges';
import { stopTour, startTour } from '../tour';
import { layer } from '../ui/dom';
import { icon } from '../ui/icons';
import { renderMain, invalidateTrack } from '../view';
import { opener } from './cinema';
import { fxOn } from '../scene';
import { loreOf, surnameKey, bornLine } from '../data/surnames';

/** Nhân vật cùng họ với dòng họ người chơi trong một hướng (người đồng hành trước, rồi những người được nêu tên);
    chỉ nói cùng họ, không nhận họ hàng. `birth`: cùng họ khai sinh (Lê Đức Thọ vốn họ Phan…). */
export function kinIn(o: Option): { id: string; fam: string; birth: boolean } | null {
  const l = loreOf(S.surname || surnameKey(S.name));
  if (!l) return null;
  const nm = (id: string) => FIG[id][0].replace(/\s*\(.*\)\s*$/, '');
  const ids = [o.guide, ...l.kin.filter(id => id !== o.guide && FIG[id] && o.who.includes(nm(id)))].filter(id => l.kin.includes(id) && FIG[id]);
  if (!ids.length) return null;
  const id = ids[0], cur = l.names.find(n => nm(id).startsWith(n + ' ')), born = l.names.find(n => bornLine(id).includes(n));
  return { id, fam: cur || born || l.names[0], birth: !cur };
}
const kinLabel = (k: { fam: string; birth: boolean }) => `Cùng họ ${k.fam}${k.birth ? ' (khai sinh)' : ''}`;

/** Câu nối thế hệ 1 cho quê ngoài Nam Kỳ: far = Bắc Kỳ, Nghệ An; t2 = Huế, Quảng Nam (gần Đà Nẵng, Kinh đô). */
const BRIDGE: Record<string, { far?: string; t2?: string }> = {
  chien: { far: 'Người con trai cả rời quê, theo quân Nguyễn Tri Phương xuống Đà Nẵng rồi vào Gia Định.', t2: 'Người con trai cả theo quân Nguyễn Tri Phương từ luỹ Liên Trì vào Gia Định.' },
  canhtan: { far: 'Người con thứ vào Kinh đô Huế học việc, chép lại những bản điều trần của Nguyễn Trường Tộ.' },
  hoa: { far: 'Người con trai cả theo sứ bộ Phan Thanh Giản vào Nam làm thư lại.', t2: 'Người con trai cả theo sứ bộ Phan Thanh Giản vào Nam làm thư lại.' },
};

/** "Gia đình bạn" ở điểm rẽ e, khi đời trước đã chọn hướng pp: câu chung (data2.js CTX); Trò chơi chỉnh theo quê, các
    thẻ và biến cố riêng đã quyết, các lần đổi họ, để không kể một nhánh họ chưa từng đi, một cái sổ "phiến loạn" mà dòng
    họ đã thoát, hay bỏ qua việc cả họ vừa đổi tên. */
export function ctxFor(e: Era, pp: string): string | null {
  let t = e.ctx?.[pp] || null;
  if (!isPlay()) return t;
  const reg = home()[3], north = reg === 'B' || reg === 'T1', q = home()[1], prevE = ERAS[ERAS.indexOf(e) - 1];
  if (e.id === 'e3' && pp === 'canvuong') {
    const x = S.cards['x:x-canvuong96']; // biến cố sau Hương Khê: dời đi / lấy họ mẹ / ra thú
    t = 'Cha bạn theo nghĩa quân Hương Khê; khi chủ tướng mất, ông về làng chôn giấu súng dưới chân ruộng. ' +
      (x === 0 ? 'Cả họ đã dời sang phủ khác, làm lại từ mấy sào ruộng thuê.' : x === 1 ? 'Sổ đinh giờ ghi một họ khác; lính đồn hỏi "nhà phiến loạn" thì không ai chỉ tới nhà bạn.' : x === 2 ? 'Từ ngày ra thú, làng gọi nhà bạn là "nhà ra thú".' : 'Sổ của Pháp ghi gia đình là "phiến loạn".');
  }
  if (e.id === 'e6' && pp === 'bac') {
    t = !north ? (hasFlag(['nguoiDi54']) ? `Cha bạn về ${q} sau hai mươi mốt năm tập kết; mẹ bạn vẫn chờ ở quê, tóc đã bạc.` : `Cha bạn đưa cả nhà về lại ${q} sau hai mươi mốt năm tập kết; ruộng cũ đã qua tay người khác.`)
      : regionAt(1975) !== reg ? 'Cả nhà đã vào Nam từ năm 1955, trước khi đội cải cách về làng; hai mươi năm sau, chuyện cũ vẫn chỉ kể trong nhà.'
      : hasFlag(['tienNhanh']) ? 'Cha bạn vào Sài Gòn sau hai mươi mốt năm, gặp lại nhánh họ đã di cư năm 1954.'
      : 'Hoà bình rồi; cha bạn vào Nam tìm tin những người trong họ đã đi chiến trường, có người không về.';
  }
  if (e.id === 'e6' && pp === 'nam') {
    if (hasFlag(['ditan'])) t = 'Tháng Tư năm ấy, cha bạn đưa cả nhà lên tàu ra biển; bạn lớn lên ở trại tị nạn, rồi ở một thành phố xa lạ.';
    else if (!hasFlag(['caitao']) && S.cards.sg75 === 2 && regionAt(1975) !== 'B') t = 'Ngày 30 tháng Tư, cha bạn treo cờ mở cửa; nhưng nhà từng sống dưới chính quyền Sài Gòn, lý lịch vẫn phải khai ba đời.';
  }
  if (e.id === 'e6' && pp === 'thuba' && hasFlag(['ditan'])) t = 'Cha mẹ bạn từng xuống đường đòi hoà bình; tháng Tư năm ấy, cả nhà vẫn lên tàu ra biển. Bạn lớn lên ở trại tị nạn, rồi ở một thành phố xa lạ.';
  // đổi họ trong đời trước (biến cố riêng): ghi ngay ở "Gia đình bạn", cùng hệ quả với câu chuyện họ Nguyễn năm 1925
  const ren = prevE ? S.names.filter(n => n.y >= prevE.cy && n.y < e.cy) : [];
  const lines = ren.map(n => `Năm ${n.y}, ${n.from} đổi thành ${n.to}.`);
  const ng = ren.find(n => surnameKey(n.from) === 'nguyen' && n.y < 1925);
  if (ng && e.cy > 1925 && !('x:x-nguyen25' in S.cards)) lines.push(`Mang ${ng.to.replace(/^Họ /, 'họ ')}, dòng họ đi qua những năm 1919–1925 mà không ai hỏi tới những tờ giấy ký tên Nguyễn Ái Quốc.`);
  return [t, ...lines].filter(Boolean).join(' ') || null;
}

/** Kết cục của hướng vừa chọn, theo quê (Trò chơi): sau Genève nói đúng nhà ở lại hay ra đi (data.js nói chung chung
    "tập kết ra Bắc hoặc ở lại Hà Nội" cho mọi quê). */
function outFor(o: Option): string {
  if (!isPlay()) return o.out;
  const reg = home()[3], north = reg === 'B' || reg === 'T1', q = home()[1];
  if (o.id === 'bac') return north ? `Bạn ở lại ${q}, dưới chính quyền Việt Nam Dân chủ Cộng hoà. Cải cách ruộng đất, hợp tác xã, rồi đường Trường Sơn.`
    : `Bạn tập kết ra Bắc theo Hiệp định Genève, để lại ở ${q} một tấm ảnh và lời hẹn hai năm. Hai năm thành hai mươi mốt năm.`;
  if (o.id === 'nam') return north ? `Bạn rời ${q} trên những chuyến tàu di cư từ Hải Phòng, làm lại nhà ở miền Nam. Hai nền cộng hoà, nhiều cuộc đảo chính, một cuộc chiến ngày càng lớn.`
    : `Bạn ở lại ${q}, dưới chính quyền ở Sài Gòn. Hai nền cộng hoà, nhiều cuộc đảo chính, một cuộc chiến ngày càng lớn.`;
  if (o.id === 'thuba') return north ? 'Bạn theo dòng người di cư vào Nam năm 1954; ở Sài Gòn, bạn đứng cùng những người đòi hoà bình. Cả hai phía đều nghi ngờ bạn.'
    : reg === 'T2' ? 'Bạn xuống đường đòi hoà bình ở Huế, rồi ở Sài Gòn. Cả hai phía đều nghi ngờ bạn.' : o.out;
  return o.out;
}

/** Câu đố của chương (tối đa hai): chỉ những câu về sự kiện người chơi đã thấy trong tour hay đã mở trang, câu chưa hỏi
    trên máy này (ở cả hai luồng) trước. Không câu nào như thế thì chương không có câu đố. */
export function quizFor(eid: string): QuizItem[] {
  const shown = new Set([...S.shown, ...S.seen]), asked = quizAsked();
  const ok = (QUIZ[eid] || []).filter(q => shown.has(q[4]));
  return [...ok.filter(q => !asked.includes(q[0])), ...ok.filter(q => asked.includes(q[0]))].slice(0, 2);
}

/* Turning points: optional quiz for the previous chapter → choice → outcome. */
export function openGate(e: Era): void {
  rt.flowTo = null;
  const prev = ERAS[ERAS.indexOf(e) - 1];
  // Đọc sử: câu đố của chương trước chỉ khi vừa xem hết tour chương đó (không đố chương người đọc chưa xem)
  const quiz = !!prev && !S.quiz[prev.id] && (isPlay() || rt.toured === prev.id) && quizFor(prev.id).length > 0;
  rt.toured = null;
  const next = () => { if (quiz) openQuiz(prev!.id, () => openChoice(e)); else openChoice(e); };
  // Trò chơi: khép lại thế hệ vừa sống (mùa màng) trước khi đố và bước vào điểm rẽ mới.
  const h = prev ? harvest(prev, e.cy) : null;
  if (prev && h) openHarvest(prev, h, e.cy, quiz ? `Đố nhanh chương ${prev.n}` : `Bước vào điểm rẽ ${e.n}`, next); else next();
}

/** Chế độ Chơi: mùa màng khép lại thế hệ `e`, rồi `next` (điểm rẽ kế hoặc kết cục). */
export function openHarvest(e: Era, h: Harvest, y: number, go: string, next: () => void): void {
  stopTour();
  clearLayer();
  SND.chime();
  const d = sheet(`<div class="kick"><span class="mono">Mùa màng · Thế hệ ${e.n} khép lại</span><span class="mono muted">${esc(familyName())} · ${esc(home()[1])}</span></div>
  <h2 style="margin:10px 0 6px">Gia sản sau một đời người</h2>
  <p class="muted" style="margin-bottom:12px">${e.title}, ${e.cy}–${ERAS[e.n]?.cy ?? 2026}. Ruộng đất, người trong họ và các mối quan hệ quyết định mùa màng.</p>
  ${h.top ? `<div class="hv-top"><span class="mono muted">Việc lớn của đời này</span> ${esc(h.top)}</div>` : ''}
  ${h.lines.map(([n, fx]) => `<div class="row sb hl"><span>${esc(n)}</span><span class="fxs">${fxChipsPlay(fx) || '<span class="muted">—</span>'}</span></div>`).join('')}
  <div class="row sb hl" style="margin-top:6px;font-weight:700"><span>Gia sản đổi thực</span><span class="fxs">${fxChipsPlay(h.total) || '<span class="muted">Không đổi</span>'}</span></div>
  <div class="rule"></div>
  <div class="resrow">${RES.map(([k, n, ic]) => `<span><i>${ic}</i>${n} <b>${S.res[k]}</b></span>`).join('')}</div>
  <div class="mono muted" style="margin-top:12px">Quan hệ</div>
  ${relRows([...new Set([...(ruler(h.ry) ? [ruler(h.ry)!] : []), ...powersAt(y)])], h.ry)}
  <div class="sfoot"><button class="btn" id="hv-go">${esc(go)} ${icon('next', 16)}</button></div>`);
  renderMain();
  d.querySelector<HTMLButtonElement>('#hv-go')!.onclick = () => { ghost(d); next(); };
}

export function openQuiz(eid: string, done?: () => void): void {
  stopTour();
  const qs = quizFor(eid), e = ERAS.find(x => x.id === eid)!;
  let i = 0;
  const res: boolean[] = [];
  const fin = () => { S.quiz[eid] = res.slice(); save(); clearLayer(); checkBadges(); done?.(); };
  if (!qs.length) { fin(); return; } // chương không hiện sự kiện nào có câu đố
  const show = () => {
    const [q, opts, a, ex] = qs[i];
    markAsked(q);
    clearLayer();
    const d = sheet(`<div class="kick"><span class="mono">Đố nhanh · Chương ${e.n}</span><span class="mono muted">Câu ${i + 1}/${qs.length}</span></div>
     <h2 style="margin:12px 0 16px">${q}</h2><div class="qas">${opts.map((o, j) => `<button class="qa" data-j="${j}">${o}</button>`).join('')}</div>
     <p id="qex" class="muted" aria-live="polite" style="margin-top:12px;min-height:24px;font-size:16px"></p>
     <div class="sfoot"><button class="btn" id="qn" disabled>${i < qs.length - 1 ? 'Câu tiếp' : eid === 'e6' ? (isPlay() ? 'Xem kết cục' : 'Xem kết luận') : 'Tiếp tục hành trình'}</button><button class="lnk" id="qs">Bỏ qua</button></div>`, false, 'dlg');
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
    // Bỏ qua: chỉ ghi những câu đã trả lời (câu bỏ qua không tính sai; [] vẫn đánh dấu chương đã hỏi)
    $<HTMLButtonElement>('#qs', d)!.onclick = () => fin();
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
  // bảng đã đóng ("chọn sau"): ghost() còn giữ nó ~320 ms ngoài #layer để mờ dần, nên xét layer.contains, không isConnected
  const release = () => {
    if (open || !layer.contains(d)) return;
    open = true;
    const had = !!d.querySelector('#lst')?.contains(document.activeElement); // "Chọn ngay ›" đang giữ tiêu điểm
    d.querySelector('#lst')?.remove();
    d.querySelectorAll<HTMLButtonElement>('.opt').forEach((b, i) => { b.disabled = false; b.style.animationDelay = `${i * 90}ms`; b.classList.add('in'); });
    if (had) d.querySelector<HTMLElement>('.opt')?.focus({ preventScroll: true });
    else announce('Lời dẫn đã xong, có thể chọn hướng.'); // trình đọc màn hình: các lựa chọn vừa mở khoá
    SND.tick();
  };
  const say = setTimeout(() => {
    if (!layer.contains(d)) return; // đã đóng ("chọn sau") trước khi lời dẫn bắt đầu
    const spoke = speak(gateSpeech(e), () => { if (!sync) release(); }, false, gateKey(e));
    sync = false;
    if (!spoke) setTimeout(release, Math.min(6000, 1800 + e.q.length * 35));
  }, 1200);
  const prevE = ERAS[ERAS.indexOf(e) - 1], pp = prevE && S.picks[prevE.id], ctx = pp ? ctxFor(e, pp) : null;
  // những việc thế hệ trước đã làm ở các thẻ bắt buộc (tối đa ba, theo thời gian): lựa chọn nhỏ cũng thành gia sử
  const did = prevE ? choicesIn(0, 0, prevE).filter(x => mustDecide(x.v)).slice(0, 3).reverse() : [];
  // nhãn của mỗi hướng: tiếp nối / rẽ khỏi đường thế hệ trước, và người cùng họ dẫn đầu hướng đó
  const tag = (o: Option) => {
    const k = kinIn(o), t = (pp ? (continues(pp, o.id) ? '<span class="al ok">Tiếp nối đường cũ</span>' : '<span class="al">Rẽ hướng</span>') : '') +
      (k ? `<span class="al akin" title="${esc(FIG[k.id][0] + (bornLine(k.id) ? ', ' + bornLine(k.id) : ''))}">${esc(kinLabel(k))}</span>` : '');
    return t ? `<div class="alrow">${t}</div>` : '';
  };
  const d = sheet(`<div class="kick must"><span class="mono">${icon('seal', 12)}Điểm rẽ ${e.n}/6 · ${e.cy}</span><span class="mono muted">${esc(familyName())} · thế hệ ${e.n}</span></div>
  <h2 style="margin:10px 0 8px">${e.title}</h2>
  <div class="gq">${ctx || did.length ? `<div class="pv mine" style="margin-bottom:10px"><div class="mono muted">Gia đình bạn</div>${ctx ? `<p style="font-size:16px;font-style:italic;margin-top:3px">${ctx}</p>` : ''}${did.length ? `<ul class="did">${did.map(x => `<li><span class="mono muted">${x.v.y}</span> ${esc(x.ch[0])}</li>`).join('')}</ul>` : ''}</div>` : ''}
  <p class="muted" style="margin-bottom:14px">${e.q}</p></div>
  <div class="listen" id="lst"><i class="pulse"></i><span>Đang kể lời dẫn…</span><button class="lnk" id="lskip">Chọn ngay ›</button></div>
  <div role="radiogroup">${e.opts.map(o => `<button class="opt" role="radio" aria-checked="false" data-o="${o.id}" disabled><div class="tt"><h3>${o.label}</h3><span class="tag">${TAG_LABEL[o.tag]}</span></div>${tag(o)}<div class="who">${o.who}</div><p>${o.d}</p><div class="fxs">${fxChips(o.fx)}${isPlay() ? fxChipsPlay(eraFx(o.id)) : ''}</div></button>`).join('')}</div>
  <p class="muted" style="font-size:13px;margin-top:10px">Điểm giá trị phản ánh điều mỗi lực lượng tự tuyên bố theo đuổi, không phải đánh giá đúng sai.</p>
  <div class="sfoot"><button class="btn" id="go" disabled>Đi theo hướng này</button>${isPlay() ? '' : '<button class="lnk" data-a="gate-later">Đọc chương trước, chọn sau ›</button>'}</div>`, false, 'wide');
  // Đọc sử: điểm rẽ không bắt buộc (Back / Escape = "chọn sau"); Trò chơi: phải chọn
  if (!isPlay()) delete d.dataset.lock;
  radios(d.querySelector('[role=radiogroup]'), d.querySelector('h2'));
  d.querySelector<HTMLButtonElement>('#lskip')!.onclick = () => { clearTimeout(say); hush(); release(); };
  d.querySelectorAll<HTMLButtonElement>('.opt').forEach(b => (b.onclick = () => {
    selOpt = b.dataset.o!;
    d.querySelectorAll('.opt').forEach(x => { x.classList.toggle('sel', x === b); x.setAttribute('aria-checked', String(x === b)); });
    const go = $<HTMLButtonElement>('#go', d)!;
    go.disabled = false;
    go.textContent = `Đi theo hướng “${e.opts.find(o => o.id === selOpt)!.label}”`; // nút chốt gọi tên lựa chọn (như "Quyết định" trên thẻ)
    go.scrollIntoView({ block: 'nearest', behavior: calm.matches ? 'auto' : 'smooth' }); // điện thoại: nút chốt thường nằm dưới mép màn hình
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
  const fs = Object.keys(FIG).filter(id => FIGERA[id] === e.id), kin = kinIn(o);
  // Trò chơi, thế hệ 1: kết cục và nhật ký đặt ở Nam Kỳ (Chí Hoà, Gò Công, sứ bộ ở Sài Gòn); quê ngoài Nam Kỳ thì nói ai
  // trong nhà đã đi vào đó, để quê đã chọn không bị lờ đi
  const reg = home()[3], bridge = isPlay() && e.n === 1 && reg !== 'NE' && reg !== 'NW' ? (BRIDGE[o.id]?.[reg === 'T2' ? 't2' : 'far'] || '') : '';
  const out = outFor(o); // theo quê: nhà ở lại, di cư hay tập kết năm 1954
  if (fxOn()) SND.vow();
  // ngọn cờ của hướng vừa chọn mở ra, người đồng hành bước vào: dòng họ đứng về một phía
  sheet(`<div class="unfurl">${o.fac ? flag(o.fac) : `<i class="flag nf"></i>`}<div class="uf-t"><span class="mono">Thế hệ ${e.n} chọn · ${e.cy}</span><b>${o.label}</b></div>${av(o.guide, 52)}</div>
  <h2 style="margin:14px 0 8px">Con đường của bạn</h2>${bridge ? `<p>${bridge}</p>` : ''}<p>${esc(out)}</p>
  <div class="fxs" style="margin-top:12px">${fxChips(o.fx)}</div>
  ${isPlay() && Object.keys(eraFx(o.id)).length ? `<div class="mono muted" style="margin-top:12px">Các thế lực nhìn dòng họ bạn</div><div class="fxs" style="margin-top:6px">${fxChipsPlay(eraFx(o.id), got)}</div>` : ''}
  <div class="rule"></div>
  <button class="row" style="width:100%;text-align:left" data-a="fig" data-id="${o.guide}">${av(o.guide, 46)}<span style="flex:1"><span class="mono muted">Người đồng hành</span><br><b style="font:700 18px var(--disp)">${FIG[o.guide][0]}</b> <span class="muted" style="font-size:14px">· ${FIG[o.guide][2]}</span></span><span class="muted">›</span></button>
  ${kin && kin.id === o.guide ? `<p class="muted" style="font-size:15px;margin-top:6px"><span class="al akin">${esc(kinLabel(kin))}</span> ${kin.birth ? `Người dẫn đường khai sinh mang họ ${esc(kin.fam)}, như dòng họ bạn.` : `Người dẫn đường cùng họ ${esc(kin.fam)} với dòng họ bạn.`}</p>` : kin ? `<p class="muted" style="font-size:15px;margin-top:6px"><span class="al akin">${esc(kinLabel(kin))}</span> ${esc(FIG[kin.id][0])}${bornLine(kin.id) ? ` (${esc(bornLine(kin.id))})` : ''} cũng đi con đường này.</p>` : ''}
  <div class="rule"></div><div class="mono" style="color:var(--acc)">Mở khoá ${fs.length} nhân vật</div>
  <div class="figs">${fs.slice(0, 8).map(id => `<button data-a="fig" data-id="${id}">${av(id, 48)}<span>${esc(FIG[id][0].replace(/\s*\(.*\)\s*$/, ''))}</span></button>`).join('')}${fs.length > 8 ? `<button data-a="tab" data-t="fig"><span class="av" style="width:48px;height:48px;font-size:14px">+${fs.length - 8}</span><span>Xem hết</span></button>` : ''}</div>
  ${o.diary.length ? `<div class="rule"></div><div class="mono" style="color:var(--acc)">Mở ${o.diary.length} trang nhật ký dòng họ</div>${o.diary.map(d => `<div class="chron"><span class="mono muted">${d.y}</span><span>${esc(d.t)}</span></div>`).join('')}` : ''}
  <div class="sfoot">${isPlay()
    ? `<button class="btn go" data-a="watch" data-e="${e.id}"><i class="cd"></i><span>${icon('play', 16)}</span><span>Sống qua thế hệ ${e.n}</span></button><p class="muted note">Chương tự bắt đầu; chạm nhân vật để đọc thêm trước.</p>`
    : `<button class="btn" data-a="watch" data-e="${e.id}">${icon('play', 16)}Xem chương ${e.n} diễn ra</button><button class="lnk" data-a="close">Tự kéo dòng thời gian</button>`}</div>`);
  if (!isPlay()) return;
  // Trò chơi: đọc kết cục rồi tự sang chương; chạm vào nhân vật / nhật ký thì dừng đếm, để người chơi tự bấm.
  const d = layer.lastElementChild as HTMLElement, bar = d.querySelector<HTMLElement>('.cd')!;
  let armed = true;
  const go = () => { if (!armed || !layer.contains(d)) return; armed = false; clearLayer(); renderMain(); checkBadges(); startTour(e); };
  // speak() gọi callback ngay (đồng bộ) khi không có giọng: khi đó dùng bộ đếm thay vì kết thúc lời đọc.
  let sync = true;
  // giọng thu sẵn (như lời dẫn điểm rẽ) đọc câu chung; câu đã chỉnh theo quê thì giọng máy đọc đúng câu đang hiện
  const spoke = speak(outSpeech(out), () => { if (!sync && armed) setTimeout(go, 700); }, false, out === o.out ? outKey(o.id) : undefined);
  sync = false;
  const ms = spoke ? Math.max(6000, out.length * 95) : Math.max(7000, 4500 + out.length * 80); // tự đọc: đủ chậm
  bar.style.setProperty('animation-duration', ms + 'ms', 'important'); // giảm chuyển động vẫn thấy thanh đếm (không phải hiệu ứng bay)
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
  // bàn phím / trình đọc màn hình: di chuyển trong bảng (Tab, mũi tên) cũng là đang đọc → không tự chuyển
  d.addEventListener('keydown', ev => { if (ev.key !== 'Enter' && ev.key !== ' ') disarm(); });
  d.addEventListener('focusin', ev => { const t = ev.target as Element; if (t.matches('.scrim, .sheet') || t.closest('.btn.go')) return; disarm(); }); // Tab tới nhân vật, nhật ký (bảng tự nhận tiêu điểm lúc mở thì không tính)
}

on('watch', el => { clearLayer(); renderMain(); checkBadges(); startTour(ERAS.find(x => x.id === el.dataset.e)); });

/** Đọc sử: "Đọc chương trước, chọn sau ›" — đóng điểm rẽ, ở lại năm đó; chip "◆ Chọn hướng" ở đầu trang vẫn mời chọn. */
on('gate-later', el => { hush(); mood('calm'); const sc = el.closest<HTMLElement>('.scrim'); if (sc) ghost(sc); rt.gate = null; renderMain(); });
