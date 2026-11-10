import { CHRONICLE, EPILOGUES, surnameKey } from '../data/surnames';
import { isPlay, home, rank, decidedCount, RES, harvest, endingNow, bigChoices } from '../play';
import { mood } from '../music';
import { ERAS, VAL, type Era } from '../data';
import { S, save, rt, optOf, archetype, matchStats, values, resetState, familyName, nameChain, Y1 } from '../state';
import { epilogue, whyText, rarityLine, firstDivergence, CFS, LEVEL, CF_METHOD, estimate, matchLine, genDelta, genName, PREV, type Facts } from '../data/endings';
import { on } from '../ui/actions';
import { app, esc, layer, sheet, toast, clearLayer } from '../ui/dom';
import { checkBadges } from '../badges';
import { stopTour } from '../tour';
import { renderMain, invalidateTrack } from '../view';
import { compass } from './profile';
import { openQuiz, openHarvest } from './gate';
import { splash } from './onboarding';
import { setTab } from '../tabs';
import { montage, preloadEra } from './cinema';

/** Trò chơi: tour chương 6 kết thúc → mùa màng cuối → đố → kết cục. */
export function endGame(e: Era): void {
  rt.flowTo = null;
  const h = harvest(e, Y1);
  if (h) openHarvest(e, h, Y1, S.quiz.e6 ? 'Xem kết cục dòng họ' : 'Đố nhanh chương 6', goEnd); else goEnd();
}

/** Kết luận. Đọc sử: câu đố chương 6 chỉ hỏi khi vừa xem hết chương 6 (như mọi chương: chương chưa xem không đố). */
export function goEnd(): void {
  if (!S.quiz.e6 && (isPlay() || rt.toured === 'e6')) openQuiz('e6', openEnd);
  else openEnd();
}

/** Dòng gia phả của một hướng. Trò chơi biết quê nên nói đúng người miền nào làm gì sau Genève (dòng chung của "Miền
    Bắc", "Miền Nam" phải gộp cả người ở lại lẫn người tập kết, di cư); các hướng khác dùng dòng biên niên chung. */
function chronLine(id: string, f: Facts): string {
  const reg = f.home?.region, north = reg === 'B' || reg === 'T1';
  if (reg && id === 'bac') return north
    ? (f.flags.has('dicu') ? 'Thế hệ 5 chọn miền Bắc, nhưng rồi cả nhà vẫn vào Nam trong hạn 300 ngày tự do đi lại sau Genève.' : 'Thế hệ 5 ở lại miền Bắc, qua cải cách ruộng đất; có người sau đó đi đường Trường Sơn.')
    : (f.flags.has('tapketN') ? 'Thế hệ 5 tập kết ra Bắc năm 1954; có người sau đó theo đường Trường Sơn trở lại miền Nam.' : 'Thế hệ 5 ở lại miền Nam, đứng về phía cách mạng; qua những năm Tố Cộng, rồi Mặt trận Dân tộc Giải phóng miền Nam ra đời cuối năm 1960.');
  if (reg && id === 'nam') return north
    ? 'Thế hệ 5 di cư vào Nam năm 1954, sống qua hai nền cộng hoà và một cuộc chiến ngày càng lớn.'
    : 'Thế hệ 5 sống ở miền Nam, qua hai nền cộng hoà và một cuộc chiến ngày càng lớn.';
  return CHRONICLE[id] || ERAS.flatMap(e => e.opts).find(o => o.id === id)?.out || '';
}

/** Gia phả (cả hai luồng): dòng biên niên theo hướng đã chọn; Trò chơi thêm tối đa hai việc lớn dòng họ đã quyết trong
    mỗi đời (lời kết trên thẻ) và các lần đổi họ; cuối cùng là lời khép theo họ. */
function giaPha(f: Facts): string {
  const epi = EPILOGUES[S.surname || surnameKey(S.name)];
  const rows: [number, string][] = [];
  for (const e of ERAS) {
    const o = optOf(e);
    if (!o) continue;
    rows.push([e.cy, `<div class="chron"><span class="mono muted">${e.cy}</span><span>${esc(chronLine(o.id, f))}</span></div>`]);
    if (isPlay()) for (const c of bigChoices(e)) rows.push([c.y + 0.1, `<div class="chron gp-dec"><span class="mono muted">${c.y}</span><span><i>${esc(c.label)}.</i> ${esc(c.out)}</span></div>`]);
  }
  for (const n of S.names) rows.push([n.y + 0.5, `<div class="chron"><span class="mono muted">${n.y}</span><span><b>${esc(n.from)}</b> đổi thành <b>${esc(n.to)}</b> · ${esc(n.why)}</span></div>`]);
  rows.sort((a, b) => a[0] - b[0]);
  if (!rows.length) return '';
  return `<section class="end-gp" aria-labelledby="gph"><h3 id="gph" style="margin:22px 0 10px">Gia phả ${esc(nameChain())}</h3><div class="pv">${rows.map(r => r[1]).join('')}</div>
  ${epi ? `<p class="muted" style="margin-top:8px;font-size:14.5px">${esc(epi)}</p>` : ''}</section>`;
}

/** Thẻ "Nếu…": giả định ở điểm rẽ đầu tiên con đường rời hướng chiếm ưu thế, ghi rõ là giả định, kèm ước lượng của trò
    chơi, cách tính, căn cứ, và lịch sử thật ngay bên dưới. Không bao giờ vẽ lên bản đồ. */
function cfCard(f: Facts): string {
  const d = firstDivergence(f.picks);
  if (!d) return '';
  const e = ERAS[d.i], pv = e.opts.find(o => o.id === e.prev), div = f.picks.filter((x, i) => PREV[i] && x && x !== PREV[i]).length;
  const intro = d.free
    ? 'Con đường của bạn trùng cả năm điểm rẽ có hướng chiếm ưu thế. Riêng điểm rẽ 2 không ngả nào thắng ngay; giả sử ngả bạn chọn đã thành công:'
    : `Con đường của bạn rời hướng chiếm ưu thế ở ${div}/5 điểm rẽ, lần đầu năm ${e.cy}. Giả sử lịch sử cũng rẽ theo bạn từ đó:`;
  return `<section class="cf-card" aria-labelledby="cfh">
   <div class="cf-tag mono">Giả định · không phải lịch sử</div>
   <p class="muted cf-intro">${intro}</p>
   <h2 id="cfh">${esc(d.cf.title)}</h2>
   <p>${esc(d.cf.body)}</p>
   <p class="cf-est"><b>Ước lượng của trò chơi: ${estimate(d.cf.level)}</b> · mức ${d.cf.level}, ${LEVEL[d.cf.level][1]}. Không phải sử liệu.</p>
   <div class="cf-real"><div class="mono muted">Lịch sử thật · Điểm rẽ ${e.n} · ${e.cy}</div><p>${pv ? `Hướng chiếm ưu thế: <b>${esc(pv.label)}</b>. ` : ''}${esc(e.hist)}</p></div>
   <details class="cf-how"><summary>Cách tính</summary><p>${esc(CF_METHOD)}</p><p>Căn cứ của mức ${d.cf.level}: ${esc(d.cf.basis)}</p></details>
  </section>`;
}

/** Gia sản theo từng đời (Trò chơi): tổng gia sản tăng / giảm qua mỗi đời, đánh dấu đời gây dựng và mất mát nhiều nhất. */
function genLedger(f: Facts): string {
  const gd = genDelta(f);
  if (!gd) return '';
  const sign = (x: number) => (x > 0 ? '+' : x < 0 ? '−' : '') + Math.abs(x);
  return `<ol class="gens" aria-label="Gia sản tăng giảm qua từng đời">${gd.dl.map((x, i) => `<li${i === gd.best ? ' class="best"' : i === gd.worst ? ' class="worst"' : ''}><span class="mono">Đời ${i + 1}</span><b>${sign(x)}</b></li>`).join('')}</ol>
  <p class="muted" style="font-size:14px;margin-top:6px">Gây dựng nhiều nhất: ${genName(gd.best)} · mất mát nhiều nhất: ${genName(gd.worst)}.</p>`;
}

export function openEnd(): void {
  stopTour();
  if (!S.ended) { S.ended = true; save(); }
  mood('finale');
  ERAS.forEach(e => void preloadEra(e, true)); // ảnh cho phim hành trình
  const a = archetype(), ms = matchStats(), { f, e: end, title } = endingNow(), play = isPlay();
  const miss = ERAS.filter(e => !S.picks[e.id]).length, rar = end ? rarityLine(end.id, f.mode) : null, first = end ? firstDivergence(f.picks) : null;
  // đầu trang: dấu triện, tên kết cục, lời kết riêng của dòng họ, tỷ lệ hiếm, vì sao; Đọc sử chưa chọn đủ: còn bỏ ngỏ
  const head = end ? `<header class="end-head">
   <div class="end-seal"><span class="stamp">${esc(end.seal)}</span></div>
   <div class="mono muted end-kick">Kết cục của ${esc(nameChain())}${play ? ' · ' + esc(home()[1]) : ''}</div>
   <h1 class="end-title">${esc(title)}</h1>
   <p class="end-epi">${esc(epilogue(end.id, f))}</p>
   ${rar ? `<p class="end-rar"><b>${esc(rar.lead)}</b> <span class="muted">${esc(rar.note)}</span></p>` : ''}
   <details class="end-why"><summary>Vì sao là kết cục này?</summary><p>${esc(whyText(end, f))}</p></details>
  </header>` : `<header class="end-head">
   <div class="end-seal"><span class="stamp">Hồ sơ còn mở</span></div>
   <div class="mono muted end-kick">Kết luận của ${esc(familyName())}</div>
   <h1 class="end-title">Con đường còn bỏ ngỏ</h1>
   <p class="end-epi">Còn ${miss} điểm rẽ chưa chọn. Chọn đủ sáu điểm rẽ để biết kết cục của ${esc(familyName())}; bên dưới là những gì dòng họ đã đi qua.</p>
  </header>`;
  // mỗi điểm rẽ: lựa chọn của bạn cạnh hướng chiếm ưu thế và lịch sử thật; hướng khác lịch sử có giả định gấp sẵn (trừ
  // điểm rẽ đã có thẻ "Nếu…" ở trên)
  const rows = ERAS.map((e, i) => {
    const o = optOf(e), pv = e.opts.find(x => x.id === e.prev), cf = o && o.id !== PREV[i] && first?.i !== i ? CFS[o.id] : undefined;
    return `<div style="padding:14px 0;border-top:1px solid var(--rule)"><div class="row sb"><b style="font:700 18px var(--disp)">${e.n}. ${e.title}</b><span class="mono muted">${e.cy}</span></div>
     <div class="cmp"><div class="m"><span class="mono">Bạn chọn</span>${o ? o.label : '—'}</div><div><span class="mono">Hướng chiếm ưu thế</span>${pv ? pv.label : 'Không hướng nào'}</div></div>
     <p class="muted" style="font-size:15.5px;line-height:1.3;margin-top:8px">${e.hist}</p>
     ${cf ? `<details class="cf"><summary><span class="cf-tag mono">Giả định</span> ${esc(cf.title)}</summary><p>${esc(cf.body)}</p><div class="mono muted">Ước lượng của trò chơi: ${estimate(cf.level)}. Không phải sử liệu.</div></details>` : ''}</div>`;
  }).join('');
  layer.innerHTML = `<div class="ov end">
  <div class="row sb"><button class="back" data-a="close" aria-label="Đóng">‹</button><span class="mono muted">Kết luận · 1858 – 2026</span></div>
  ${head}
  <button class="btn" data-a="film" style="margin-top:18px">▶ Xem phim hành trình</button>
  ${end ? cfCard(f) : ''}
  <div class="dbl" style="margin-top:20px"></div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
   <div class="pv" style="text-align:center"><div class="mono muted">Trùng hướng chiếm ưu thế</div><div style="font:800 40px/1.1 var(--disp);color:var(--acc)">${ms.m}/${ms.t}</div>${end ? `<div class="muted" style="font-size:13px">${esc(matchLine(ms.m))}</div>` : ''}</div>
   <div class="pv" style="text-align:center;margin-top:0"><div class="mono muted">Dòng họ bạn là</div><div style="font:700 21px/1.15 var(--disp);margin-top:6px">${a ? a[0] : '—'}</div></div></div>
  ${play ? `<h3 style="margin:22px 0 10px">Gia sản dòng họ sau sáu thế hệ</h3>
  <div class="pv mine" style="text-align:center"><div class="mono muted">${esc(home()[1])} · ${decidedCount()} quyết định</div><div style="font:800 30px/1.1 var(--disp);color:var(--acc);margin-top:6px">${rank()[0]}</div><p class="muted" style="margin-top:6px">${rank()[1]}</p></div>
  <div class="gs" style="margin-top:10px">${RES.map(([k, n, ic]) => `<div class="pv"><div class="mono muted">${ic} ${n}</div><b>${S.res[k]}</b></div>`).join('')}</div>
  ${genLedger(f)}` : ''}
  ${giaPha(f)}
  <h3 style="margin:22px 0 6px">La bàn giá trị</h3>${compass()}
  <h3 style="margin:22px 0 4px">Con đường của bạn và lịch sử</h3>${rows}
  <section class="end-close"><h2>Mọi con đường đều dẫn về hôm nay</h2>
  <p class="muted">Dù dòng họ bạn chọn gì, bản đồ năm 2026 vẫn là một: một Việt Nam thống nhất từ Lũng Cú đến Cà Mau, cùng các quần đảo ngoài Biển Đông.</p>
  <div class="pv mine" style="margin-top:14px"><div class="mono muted">Điều đọng lại</div><p style="margin-top:6px">Ở mỗi điểm rẽ, người Việt ở mọi phía đều tin mình đang làm điều đúng cho đất nước. Lịch sử ghi lại bên chiếm ưu thế, còn sử liệu giữ lại tiếng nói của tất cả.</p></div></section>
  <div style="height:18px"></div><button class="btn" data-a="share">Tạo thẻ chia sẻ</button><div style="height:10px"></div>
  <button class="btn ghost" data-a="tab" data-t="src">Đọc sử liệu gốc</button>
  <button class="lnk" data-a="reset">Chọn lại từ 1858</button></div>`;
  checkBadges();
}

/** 1080×1350 result card drawn on a canvas with the theme's fonts and colours. */
async function makeCard(): Promise<string> {
  try { await document.fonts.ready; } catch { /* draw with fallbacks */ }
  const cs = getComputedStyle(app), c = (k: string) => cs.getPropertyValue(k).trim();
  const W = 1080, HH = 1350, cv = document.createElement('canvas');
  cv.width = W; cv.height = HH;
  const x = cv.getContext('2d')!;
  const disp = c('--disp'), mono = c('--mono'), serif = c('--serif'), ink = c('--ink'), ink2 = c('--ink2'), acc = c('--acc'), paper = c('--paper'), paper3 = c('--paper3');
  /** Chữ một dòng, thu nhỏ cỡ cho vừa bề ngang (tên kết cục, tên họ dài). */
  const fit = (t: string, font: (px: number) => string, px: number, at: number, max = W - 200) => { let n = px; x.font = font(n); while (n > 18 && x.measureText(t).width > max) x.font = font(--n); x.fillText(t, 100, at); };
  x.fillStyle = paper; x.fillRect(0, 0, W, HH);
  x.strokeStyle = ink; x.lineWidth = 3; x.strokeRect(40, 40, W - 80, HH - 80); x.lineWidth = 1; x.strokeRect(54, 54, W - 108, HH - 108);
  x.fillStyle = ink2; x.font = `500 24px ${mono}`; x.fillText('DƯ ĐỒ · HỒ SƠ DÒNG HỌ · 1858 – 2026', 100, 135);
  x.fillStyle = acc; fit(familyName(), n => `900 ${n}px ${disp}`, 120, 260);
  // kết cục và độ hiếm (chưa chọn đủ sáu điểm rẽ: kiểu người theo các hướng đã chọn)
  const { e: end, title, f } = endingNow(), a = archetype(), rar = end ? rarityLine(end.id, f.mode) : null;
  x.fillStyle = ink; fit(end ? title : a ? a[0] : 'Đang trên đường', n => `italic 500 ${n}px ${serif}`, 44, 326);
  if (rar) { x.fillStyle = ink2; fit(rar.lead.toUpperCase(), n => `500 ${n}px ${mono}`, 22, 366); }
  let y = 420;
  x.fillStyle = ink; x.fillRect(100, y - 30, W - 200, 2);
  ERAS.forEach(e => {
    const o = optOf(e);
    x.fillStyle = acc; x.font = `500 26px ${mono}`; x.fillText(String(e.cy), 100, y + 22);
    x.fillStyle = ink2; x.font = `400 30px ${serif}`; x.fillText(e.title, 220, y + 22);
    x.fillStyle = ink; x.font = `700 34px ${disp}`; x.textAlign = 'right'; x.fillText(o ? o.label : '—', W - 100, y + 22); x.textAlign = 'left';
    y += 74;
  });
  y += 30;
  x.fillStyle = ink; x.fillRect(100, y - 30, W - 200, 2);
  const v = values();
  VAL.forEach(([k, n]) => {
    x.fillStyle = ink2; x.font = `400 30px ${serif}`; x.fillText(n, 100, y + 10);
    x.fillStyle = paper3; x.fillRect(300, y - 8, 560, 16);
    x.fillStyle = acc; x.fillRect(300, y - 8, 560 * Math.min(1, v[k] / 18), 16);
    x.fillStyle = ink; x.font = `700 34px ${disp}`; x.textAlign = 'right'; x.fillText(String(v[k]), W - 100, y + 12); x.textAlign = 'left';
    y += 58;
  });
  const ms = matchStats();
  y += 40;
  x.fillStyle = ink; fit(isPlay() ? `${rank()[0]}  ·  ${home()[1]}  ·  ${decidedCount()} quyết định` : `Trùng hướng chiếm ưu thế ${ms.m}/${ms.t}  ·  ${S.badges.length} huy hiệu`, n => `700 ${n}px ${disp}`, 40, y);
  x.fillStyle = ink2; x.font = `italic 400 30px ${serif}`; x.fillText('Một trò chơi lịch sử. Không có câu trả lời đúng.', 100, HH - 110);
  x.font = `500 22px ${mono}`; x.textAlign = 'right'; x.fillText(location.host, W - 100, HH - 70); x.textAlign = 'left'; // địa chỉ để người xem tìm lại trò chơi
  return cv.toDataURL('image/png');
}

export async function openShare(): Promise<void> {
  const url = await makeCard();
  if (!S.shared) { S.shared = true; save(); }
  const slug = familyName().replace(/\s+/g, '-').toLowerCase();
  const d = sheet(`<div class="mono muted">Thẻ chia sẻ</div><h2 style="margin:6px 0 12px">Con đường của dòng họ bạn</h2>
  <img src="${url}" alt="Thẻ kết quả" style="width:100%;border-radius:10px;border:1px solid var(--rule);display:block">
  <div style="height:14px"></div><a class="btn" href="${url}" download="du-do-${esc(slug)}.png">Tải ảnh</a>
  <div style="height:10px"></div><button class="btn ghost" id="nshare">Chia sẻ…</button>`, true);
  d.querySelector<HTMLButtonElement>('#nshare')!.onclick = async () => {
    try {
      const b = await (await fetch(url)).blob();
      const f = new File([b], 'du-do.png', { type: 'image/png' });
      const { title } = endingNow();
      if (navigator.canShare && navigator.canShare({ files: [f] })) await navigator.share({ files: [f], title: 'Dư Đồ', text: `Con đường của ${familyName()} qua sáu thế hệ, 1858 – 2026${title ? ': ' + title : ''}.`, url: location.origin + location.pathname });
      else toast('Trình duyệt này chưa hỗ trợ chia sẻ trực tiếp. Hãy tải ảnh.');
    } catch { /* user cancelled */ }
  };
  checkBadges();
}

export function resetAll(): void {
  stopTour();
  resetState();
  invalidateTrack();
  setTab('map');
  clearLayer();
  renderMain();
  splash();
}

on('tab', el => setTab(el.dataset.t as 'map' | 'fig' | 'src' | 'me'));

on('film', () => montage());
