import { CHRONICLE, EPILOGUES, surnameKey } from '../data/surnames';
import { isPlay, home, rank, decidedCount, RES, harvest, lineage } from '../play';
import { mood } from '../music';
import { ERAS, VAL, type Era } from '../data';
import { S, save, rt, optOf, archetype, matchStats, values, resetState, familyName, Y1 } from '../state';
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

/** Gia phả: biên niên theo hướng đã chọn, các lần đổi họ, dấu ấn dòng họ và lời khép theo họ. */
function giaPha(): string {
  const lin = lineage(), key = S.surname || surnameKey(S.name), epi = EPILOGUES[key];
  const rows: [number, string][] = [];
  for (const e of ERAS) { const o = optOf(e); if (o) rows.push([e.cy, `<div class="chron"><span class="mono muted">${e.cy}</span><span>${esc(CHRONICLE[o.id] || o.out)}</span></div>`]); }
  for (const n of S.names) rows.push([n.y + 0.5, `<div class="chron"><span class="mono muted">${n.y}</span><span><b>${esc(n.from)}</b> đổi thành <b>${esc(n.to)}</b> · ${esc(n.why)}</span></div>`]);
  rows.sort((a, b) => a[0] - b[0]);
  return `<h3 style="margin:22px 0 10px">Gia phả ${esc(familyName())}</h3><div class="pv">${rows.map(r => r[1]).join('')}</div>
  ${lin ? `<div class="pv mine" style="margin-top:10px"><div class="mono muted">Dấu ấn dòng họ</div><div style="font:700 21px/1.15 var(--disp);margin-top:4px">${esc(lin.title)}</div><p style="margin-top:6px">${esc(lin.text)}</p>${epi ? `<p class="muted" style="margin-top:8px;font-size:14.5px">${esc(epi)}</p>` : ''}</div>` : ''}`;
}

export function openEnd(): void {
  stopTour();
  if (!S.ended) { S.ended = true; save(); }
  mood('finale');
  ERAS.forEach(e => void preloadEra(e, true)); // ảnh cho phim hành trình
  const a = archetype(), ms = matchStats();
  const rows = ERAS.map(e => {
    const o = optOf(e), pv = e.opts.find(x => x.id === e.prev);
    return `<div style="padding:14px 0;border-top:1px solid var(--rule)"><div class="row sb"><b style="font:700 18px var(--disp)">${e.n}. ${e.title}</b><span class="mono muted">${e.cy}</span></div>
     <div class="cmp"><div class="m"><span class="mono">Bạn chọn</span>${o ? o.label : '—'}</div><div><span class="mono">Hướng chiếm ưu thế</span>${pv ? pv.label : 'Không hướng nào'}</div></div>
     <p class="muted" style="font-size:15.5px;line-height:1.3;margin-top:8px">${e.hist}</p></div>`;
  }).join('');
  layer.innerHTML = `<div class="ov">
  <div class="row sb"><button class="back" data-a="close" aria-label="Đóng">‹</button><span class="mono muted">Kết luận · 1858 – 2026</span></div>
  <div style="text-align:center;margin:24px 0 6px"><span class="stamp">Hồ sơ đã khép</span></div>
  <h1 style="text-align:center;font-size:38px;margin-top:14px">Mọi con đường đều dẫn về hôm nay</h1>
  <p class="muted" style="text-align:center;margin-top:10px">Dù dòng họ bạn chọn gì, bản đồ năm 2026 vẫn là một: một Việt Nam thống nhất từ Lũng Cú đến Cà Mau, cùng các quần đảo ngoài Biển Đông.</p>
  <button class="btn" data-a="film" style="margin-top:18px">▶ Xem phim hành trình</button>
  <div class="dbl" style="margin-top:20px"></div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
   <div class="pv" style="text-align:center"><div class="mono muted">Trùng hướng chiếm ưu thế</div><div style="font:800 40px/1.1 var(--disp);color:var(--acc)">${ms.m}/${ms.t}</div></div>
   <div class="pv" style="text-align:center;margin-top:0"><div class="mono muted">Dòng họ bạn là</div><div style="font:700 21px/1.15 var(--disp);margin-top:6px">${a ? a[0] : '—'}</div></div></div>
  ${isPlay() ? `<h3 style="margin:22px 0 10px">Gia sản dòng họ sau sáu thế hệ</h3>
  <div class="pv mine" style="text-align:center"><div class="mono muted">${esc(home()[1])} · ${decidedCount()} quyết định</div><div style="font:800 30px/1.1 var(--disp);color:var(--acc);margin-top:6px">${rank()[0]}</div><p class="muted" style="margin-top:6px">${rank()[1]}</p></div>
  <div class="gs" style="margin-top:10px">${RES.map(([k, n, ic]) => `<div class="pv"><div class="mono muted">${ic} ${n}</div><b>${S.res[k]}</b></div>`).join('')}</div>` : ''}
  ${isPlay() ? giaPha() : ''}
  <h3 style="margin:22px 0 6px">La bàn giá trị</h3>${compass()}
  <h3 style="margin:22px 0 4px">Con đường của bạn và lịch sử</h3>${rows}
  <div class="pv mine" style="margin-top:14px"><div class="mono muted">Điều đọng lại</div><p style="margin-top:6px">Ở mỗi điểm rẽ, người Việt ở mọi phía đều tin mình đang làm điều đúng cho đất nước. Lịch sử ghi lại bên chiếm ưu thế, còn sử liệu giữ lại tiếng nói của tất cả.</p></div>
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
  x.fillStyle = paper; x.fillRect(0, 0, W, HH);
  x.strokeStyle = ink; x.lineWidth = 3; x.strokeRect(40, 40, W - 80, HH - 80); x.lineWidth = 1; x.strokeRect(54, 54, W - 108, HH - 108);
  x.fillStyle = ink2; x.font = `500 24px ${mono}`; x.fillText('DƯ ĐỒ · HỒ SƠ DÒNG HỌ · 1858 – 2026', 100, 135);
  x.fillStyle = acc; x.font = `900 120px ${disp}`; x.fillText(familyName().slice(0, 16), 96, 260);
  const a = archetype();
  x.fillStyle = ink; x.font = `italic 500 44px ${serif}`; x.fillText(a ? a[0] : 'Đang trên đường', 100, 330);
  let y = 410;
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
  x.fillStyle = ink; x.font = `700 40px ${disp}`; x.fillText(isPlay() ? `${rank()[0]}  ·  ${home()[1]}  ·  ${decidedCount()} quyết định` : `Trùng hướng chiếm ưu thế ${ms.m}/${ms.t}  ·  ${S.badges.length} huy hiệu`, 100, y);
  x.fillStyle = ink2; x.font = `italic 400 30px ${serif}`; x.fillText('Một trò chơi lịch sử. Không có câu trả lời đúng.', 100, HH - 110);
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
      if (navigator.canShare && navigator.canShare({ files: [f] })) await navigator.share({ files: [f], title: 'Dư Đồ', text: `Con đường của ${familyName()} qua sáu thế hệ, 1858 – 2026.`, url: location.origin + location.pathname });
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
