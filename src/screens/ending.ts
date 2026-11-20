import { CHRONICLE, EPILOGUES, surnameKey } from '../data/surnames';
import { isPlay, home, rank, decidedCount, RES, harvest, endingNow, bigChoices, keepEnding, tiersNow } from '../play';
import { mood, finaleFor, moodNow } from '../music';
import { ERAS, VAL, type Era } from '../data';
import { S, save, rt, optOf, archetype, matchStats, values, resetState, familyName, nameChain, Y1, archive, archiveRun, viewRun, readOnly, type ArcRun } from '../state';
import { chronLine, epilogue, whyText, rarityLine, firstDivergence, cfOf, exitNote, LEVEL, CF_METHOD, estimate, matchLine, genDelta, genName, PREV, type Facts, type Ending } from '../data/endings';
import { endSpeech, epiKey } from '../speech';
import { chronKey, endVoiceKey } from '../voiced';
import { sayKey } from '../said';
import { hush, speak } from '../narration';
import { warmKeys } from '../warm';
import { LISTEN } from '../ui/bits';
import { on } from '../ui/actions';
import { app, esc, layer, sheet, toast, clearLayer, clearToasts } from '../ui/dom';
import { icon } from '../ui/icons';
import { checkBadges, clearBadgeQueue } from '../badges';
import { stopTour } from '../tour';
import { renderMain, invalidateTrack } from '../view';
import { compass } from './profile';
// bản đồ dòng họ ở cột bên của hồ sơ kết cục (homePlate)
import { placeAt, livesAbroad } from '../play';
import { Y0 } from '../state';
import { goneOf, GONE_AT } from '../data/endings';
import { plate, type Mark } from '../ui/plate';
import { openQuiz, openHarvest, quizFor } from './gate';
import { splash } from './onboarding';
import { setTab } from '../tabs';
import { montage, preloadEra } from './cinema';
import { nextTry, arcDate, backToLedger } from './ledger';
import { note } from '../errlog';

/** Trò chơi: tour chương 6 kết thúc → mùa màng cuối → đố → kết cục. */
export function endGame(e: Era): void {
  rt.flowTo = null;
  const h = harvest(e, Y1);
  if (h) openHarvest(e, h, Y1, S.quiz.e6 || !quizFor('e6').length ? 'Xem kết cục dòng họ' : 'Đố nhanh chương 6', goEnd); else goEnd();
}

/** Kết luận. Đọc sử: câu đố chương 6 chỉ hỏi khi vừa xem hết chương 6 (như mọi chương: chương chưa xem không đố). */
export function goEnd(): void {
  if (!S.quiz.e6 && (isPlay() || rt.toured === 'e6') && quizFor('e6').length) openQuiz('e6', openEnd);
  else openEnd();
}

/** Đầu mục của hồ sơ kết cục: nét kẻ đôi, nhãn chữ hoa giãn, tít. */
const sh = (k: string, t: string, id: string) => `<header class="end-sh"><span class="mono">${k}</span><h2 id="${id}">${t}</h2></header>`;

/** Gia phả (cả hai luồng): một trục dọc qua các đời, mỗi đời một mốc (năm; điểm rẽ và hướng đã chọn; dòng biên niên theo
    hướng ấy); Trò chơi thêm tối đa hai việc lớn dòng họ đã quyết trong mỗi đời (lời kết trên thẻ) và các lần đổi họ;
    cuối cùng là lời khép theo họ. */
function giaPha(f: Facts): string {
  // lời khép theo họ gốc của dòng họ: nhà họ Nguyễn lấy họ Lê để tránh sổ "phiến loạn" không thành chuyện của họ Lê
  const epi = EPILOGUES[S.names.length ? surnameKey(S.names[0].from) : S.surname || surnameKey(S.name)];
  const rows: [number, string][] = [];
  for (const e of ERAS) {
    const o = optOf(e);
    if (!o) continue;
    rows.push([e.cy, `<li class="chron gen"><span class="y">${e.cy}</span><div><span class="mono">Đời ${e.n} · ${esc(o.label)}</span><p>${esc(chronLine(o.id, f, CHRONICLE))}</p></div></li>`]);
    if (isPlay()) for (const c of bigChoices(e)) rows.push([c.y + 0.1, `<li class="chron gp-dec"><span class="y">${c.y}</span><p><i>${esc(c.label)}.</i> ${esc(c.out)}</p></li>`]);
  }
  for (const n of S.names) rows.push([n.y + 0.5, `<li class="chron nm"><span class="y">${n.y}</span><p><b>${esc(n.from)}</b> đổi thành <b>${esc(n.to)}</b> · ${esc(n.why)}</p></li>`]);
  rows.sort((a, b) => a[0] - b[0]);
  if (!rows.length) return '';
  return `<section class="end-sec end-gp" aria-labelledby="gph">${sh('Sáu thế hệ · 1858 – 2026', `Gia phả ${esc(nameChain())}`, 'gph')}
  <ol class="gp">${rows.map(r => r[1]).join('')}</ol>${epi ? `<p class="gp-epi">${esc(epi)}</p>` : ''}</section>`;
}

/** Thẻ "Nếu…": giả định ở điểm rẽ đầu tiên con đường rời hướng chiếm ưu thế, ghi rõ là giả định, kèm ước lượng của trò
    chơi, cách tính, căn cứ, và lịch sử thật ngay bên dưới. Không bao giờ vẽ lên bản đồ. */
function cfCard(f: Facts): string {
  const d = firstDivergence(f.picks, f); // điểm rẽ 6 nhìn từ xứ người: giả định của bản ấy
  if (!d) return '';
  const e = ERAS[d.i], pv = e.opts.find(o => o.id === e.prev), div = f.picks.filter((x, i) => PREV[i] && x && x !== PREV[i]).length;
  const intro = d.free
    ? 'Con đường của bạn trùng cả năm điểm rẽ có hướng chiếm ưu thế. Riêng điểm rẽ 2 không ngả nào thắng ngay; giả sử ngả bạn chọn đã thành công:'
    : `Con đường của bạn rời hướng chiếm ưu thế ở ${div}/5 điểm rẽ, lần đầu năm ${e.cy}. Giả sử lịch sử cũng rẽ theo bạn từ đó:`;
  return `<section class="end-sec cf-card" aria-labelledby="cfh">
   <div class="cf-tag mono">Giả định · không phải lịch sử</div>
   <p class="muted cf-intro">${intro}</p>
   <h2 id="cfh">${esc(d.cf.title)}</h2>
   <p>${esc(d.cf.body)}</p>
   <p class="cf-est"><b>Ước lượng của trò chơi: ${estimate(d.cf.level)}</b> · mức ${d.cf.level}, ${LEVEL[d.cf.level][1]}. Không phải sử liệu.</p>
   <div class="cf-real"><div class="mono muted">Lịch sử thật · Điểm rẽ ${e.n} · ${e.cy}</div><p>${pv ? `Hướng chiếm ưu thế: <b>${esc(pv.label)}</b>. ` : ''}${esc(e.hist)}</p></div>
   <details class="cf-how"><summary>Cách tính</summary><p>${esc(CF_METHOD)}</p><p>Căn cứ của mức ${d.cf.level}: ${esc(d.cf.basis)}</p></details>
  </section>`;
}

/** Gia sản (Trò chơi): hạng so với các dòng họ cùng quê, một dòng sổ bốn khoản, rồi tổng gia sản tăng / giảm qua từng
    đời, đánh dấu đời gây dựng và mất mát nhiều nhất. */
function wealth(f: Facts): string {
  const [rk, rd] = rank(), gd = genDelta(f);
  const sign = (x: number) => (x > 0 ? '+' : x < 0 ? '−' : '') + Math.abs(x);
  return `<section class="end-sec end-res" aria-labelledby="grh">${sh(`${esc(home()[1])} · ${decidedCount()} quyết định`, 'Gia sản sau sáu thế hệ', 'grh')}
   <p class="end-rank"><b>${esc(rk)}</b>${esc(rd)}</p>
   <dl class="ledger">${RES.map(([k, n, ic]) => `<div><dt class="mono">${ic} ${n}</dt><dd>${S.res[k]}</dd></div>`).join('')}</dl>
   ${gd ? `<ol class="gens" aria-label="Gia sản tăng giảm qua từng đời">${gd.dl.map((x, i) => `<li${i === gd.best ? ' class="best"' : i === gd.worst ? ' class="worst"' : ''}><span class="mono">Đời ${i + 1}</span><b>${sign(x)}</b></li>`).join('')}</ol>
   <p class="gens-n">Gây dựng nhiều nhất: ${genName(gd.best)} · mất mát nhiều nhất: ${genName(gd.worst)}.</p>` : ''}</section>`;
}

/** Quê và những lần dời nhà (Trò chơi): chỉ những gì bản lưu có. Quê đã chọn; nơi ở mới sau Genève (di cư vào Nam, tập
    kết ra Bắc rồi về lại quê năm 1976), theo đúng play.ts placeAt; cả nhà ra nước ngoài (cờ rời nước, hay chọn Ra đi ở
    điểm rẽ 6: play.ts livesAbroad), chỉ ghi trong danh sách vì bản lưu không biết nước nào. Không có chặng nào bản lưu
    không có, không vẽ đường đi: nét đứt chỉ nói từ đâu tới đâu. Đọc sử không có quê nên không có mục này. */
function homePlate(f: Facts): string {
  const h = home(), seen: { y: number; name: string; l: [number, number] }[] = [];
  for (let y = Y0; y <= Y1; y++) {
    // chọn Ra đi ở điểm rẽ 6 mà không qua thẻ rời nước nào: cả nhà cũng sống ở xứ người (play.ts livesAbroad), như kết cục kể
    const p = livesAbroad(y) ? { name: 'xứ người', l: h[2] } : placeAt(y), q = seen[seen.length - 1];
    if (!q || q.name !== p.name || q.l.join() !== p.l.join()) seen.push({ y, name: p.name, l: p.l });
  }
  const marks: Mark[] = [{ l: h[2], kind: 'home', label: h[1] }], moves: [[number, number], [number, number]][] = [];
  const rows: [number, string][] = [[Y0, `Quê nhà: <b>${esc(h[1])}</b>`]];
  let at = h[2];
  for (const s of seen.slice(1)) {
    if (s.name === 'xứ người') {
      const g = goneOf(f), x = g ? GONE_AT[g] : undefined;
      // không có cờ rời nước: đời thứ sáu chọn Ra đi, đêm ra khơi năm 1979 (người con còn ở mặt trận Campuchia: năm 1989)
      rows.push([x ? x.y : f.front ? 1989 : 1979, x ? `Cả nhà ${esc(x.go)}; từ đó sống ở xứ người` : 'Cả nhà ra đi; từ đó sống ở xứ người']);
      continue;
    }
    const back = s.name === h[1];
    // dời nhà theo điểm rẽ 5 (Genève): năm 1954, cả với bản lưu có trước việc dời nhà (play.ts regionAt, S.movedFrom)
    rows.push(back ? [s.y, `Về lại quê nhà <b>${esc(h[1])}</b>`] : [1954, s.name === 'miền Nam' ? 'Di cư vào <b>miền Nam</b>' : 'Tập kết ra <b>miền Bắc</b>']);
    if (!back) marks.push({ l: s.l, kind: 'stop', label: s.name });
    moves.push([at, s.l]);
    at = s.l;
  }
  const n = rows.length - 1;
  return `<section class="end-sec end-plate" aria-labelledby="mph">${sh('Bản đồ dòng họ', n ? 'Quê nhà và những lần dời nhà' : 'Quê nhà', 'mph')}
   <div class="mp">${plate([], '', 'plate-svg mpl', { marks, moves })}<ol class="mp-l">${rows.map(([y, t]) => `<li><span class="y">${y}</span><span>${t}</span></li>`).join('')}${n ? '' : '<li class="none"><span class="y"></span><span>Không lần dời nhà nào trong sáu đời.</span></li>'}</ol></div>
   <p class="mp-n">Chỉ ghi quê bạn chọn và những lần cả nhà dời nơi ở trong ván này. Nét đứt nói nơi đi, nơi đến, không phải đường đi.</p></section>`;
}

/** Con đường của bạn và lịch sử: mỗi điểm rẽ một dòng sổ (năm, tên; hướng bạn chọn cạnh hướng chiếm ưu thế; lịch sử
    thật). Hướng khác lịch sử có giả định gấp sẵn, trừ điểm rẽ đã có thẻ "Nếu…" (`first`). */
function pathTable(first: number | undefined): string {
  // màn ngang: bảng có một dòng tên cột (nhãn trong từng ô khi ấy chỉ còn cho trình đọc màn hình)
  return `<section class="end-sec end-path" aria-labelledby="pth">${sh('Sáu điểm rẽ', 'Con đường của bạn và lịch sử', 'pth')}
  <div class="path-h mono" aria-hidden="true"><span>Năm</span><span>Điểm rẽ</span><span>Bạn chọn</span><span>Hướng chiếm ưu thế</span><span>Lịch sử thật</span></div><ol class="path">${ERAS.map((e, i) => {
    const o = optOf(e), pv = e.opts.find(x => x.id === e.prev), cf = o && o.id !== PREV[i] && first !== i ? cfOf(o) : undefined; // nhìn từ xứ người: giả định của bản ấy
    const mark = o && pv ? `<em>${o.id === pv.id ? 'trùng' : 'rẽ khác'}</em>` : '';
    return `<li class="pr"><span class="y">${e.cy}</span><div><h3>${esc(e.title)}</h3>
     <dl class="pr-c"><div><dt class="mono">Bạn chọn</dt><dd>${o ? esc(o.label) : '—'}${mark}</dd></div><div><dt class="mono">Hướng chiếm ưu thế</dt><dd>${pv ? esc(pv.label) : 'Không hướng nào'}</dd></div></dl>
     <p class="pr-h">${esc(e.hist)}</p>
     ${cf ? `<details class="cf"><summary><span class="cf-tag mono">Giả định</span> ${esc(cf.title)}</summary><p>${esc(cf.body)}</p><div class="mono muted">Ước lượng của trò chơi: ${estimate(cf.level)}. Không phải sử liệu.</div></details>` : ''}</div></li>`;
  }).join('')}</ol></section>`;
}

/** Kết luận, dàn như một tập hồ sơ: đầu hồ sơ (họ, dấu kết cục, tên kết cục, lời kết riêng, độ hiếm, vì sao, phim), dòng
    sổ tóm tắt, gia phả, thẻ "Nếu…", gia sản (Trò chơi), la bàn giá trị, con đường so với lịch sử, lời khép. Điện thoại: một
    cột theo thứ tự ấy; màn ngang: gia phả bên trái, các mục ngắn bên phải, con đường thành một bảng trải ngang bên dưới.
    Hồ sơ khép được (có kết cục; Trò chơi: đã đi tới năm 2026) thì giữ kết cục ấy (S.endFix), cất cả bản lưu vào Sổ kết
    cục (state.ts archiveRun) và gợi ý "Ván sau, thử…". `ro`: hồ sơ một dòng họ đã khép, mở lại từ Sổ kết cục với S tạm là
    bản lưu của nó (openPast): chỉ xem, không lưu, không trao huy hiệu, không phim, không chia sẻ, không nút chọn lại; nút
    đóng về Hồ sơ. */
export function openEnd(ro?: ArcRun): void {
  if (!ro) stopTour();
  const a = archetype(), ms = matchStats(), { f, e: end, title } = endingNow(), play = isPlay();
  // hồ sơ khép được: có kết cục, và Trò chơi đã đi tới năm 2026 (trước đó thẻ còn đổi gia sản, cờ rời nước: không giữ,
  // không cất kết cục đọc sớm)
  const closed = !ro && closable(end);
  // lần đầu mở màn kết có kết cục (hồ sơ còn bỏ ngỏ không tính): giọng thuyết minh tự đọc tên kết cục (một lần)
  const fresh = closed && !S.endSaid;
  if (!ro && (!S.ended || fresh || (closed && !S.endFix?.id))) { S.ended = true; if (closed) { S.endSaid = true; keepEnding(end); } save(); }
  const meta = closed ? runMeta(f, end, title) : null;
  if (meta) archiveRun(meta); // trước khi dựng: gợi ý "Ván sau, thử…" tính cả dòng họ này
  mood(finaleFor(end?.id)); // kết cục mất mát: nhạc khép trầm buồn (music.ts ELEGY), còn lại Heroic Age
  if (!ro) ERAS.forEach(e => void preloadEra(e)); // ảnh cho phim hành trình
  const miss = ERAS.filter(e => !S.picks[e.id]).length, rar = end ? rarityLine(end.id, f.mode) : null, first = end ? firstDivergence(f.picks) : null;
  const film = ro ? '' : `<button class="btn end-film" data-a="film">${icon('play')}Xem phim hành trình</button>`; // phim đọc S suốt lúc chiếu: không chiếu hồ sơ cũ
  // đầu hồ sơ: họ (và quê), dấu kết cục, tên kết cục, lời kết riêng của dòng họ, tỷ lệ hiếm, vì sao; Đọc sử chưa chọn đủ: còn bỏ ngỏ
  const head = end ? `<header class="end-head">
   <div class="end-mast"><span class="mono end-kick">Hồ sơ dòng họ · ${esc(nameChain())}${play ? ' · ' + esc(home()[1]) : ''}</span><span class="stamp">${esc(end.seal)}</span></div>
   <h1 class="end-title" tabindex="-1">${esc(title)}</h1>
   <p class="end-line">${esc(end.line)}</p>
   <p class="end-epi">${esc(epilogue(end.id, f))}</p>
   ${rar ? `<p class="end-rar"><b>${esc(rar.lead)}</b> <span class="muted">${esc(rar.note)}</span></p>` : ''}
   <details class="end-why"><summary>Vì sao là kết cục này?</summary><p>${esc(whyText(end, f))}</p></details>${film}
  </header>` : `<header class="end-head">
   <div class="end-mast"><span class="mono end-kick">Hồ sơ dòng họ · ${esc(familyName())}</span><span class="stamp">Hồ sơ còn mở</span></div>
   <h1 class="end-title" tabindex="-1">Con đường còn bỏ ngỏ</h1>
   <p class="end-epi">Còn ${miss} điểm rẽ chưa chọn. Chọn đủ sáu điểm rẽ để biết kết cục của ${esc(familyName())}; bên dưới là những gì dòng họ đã đi qua.</p>${film}
  </header>`;
  // dòng sổ tóm tắt: các ô ngăn bằng nét dọc, không phải hộp
  const reg = `<dl class="end-sec end-reg">
   <div><dt class="mono">Trùng hướng chiếm ưu thế</dt><dd><b class="n">${ms.m}/${ms.t}</b>${end ? `<span>${esc(matchLine(ms.m))}</span>` : ''}</dd></div>
   <div><dt class="mono">Dòng họ bạn là</dt><dd><b>${a ? esc(a[0]) : '—'}</b></dd></div>
   ${play && rank()[0] !== title ? `<div><dt class="mono">Gia sản</dt><dd><b>${esc(rank()[0])}</b></dd></div>` : ''}</dl>`; // hạng trùng tên kết cục: không lặp
  layer.innerHTML = `<div class="ov end"${ro ? ` data-ro="${esc(ro.id)}"` : ''}>
  <div class="row sb"><button class="back" data-a="close" aria-label="${ro ? 'Về Hồ sơ' : 'Đóng'}">‹</button><span class="row end-tr"><span class="mono muted">${ro ? 'Sổ kết cục · chỉ xem' : 'Kết luận · 1858 – 2026'}</span>${end ? `<button class="chip nbtn" data-a="listen-end" title="Nghe tên kết cục">${LISTEN}</button>` : ''}</span></div>
  ${ro ? roNote(ro) : ''}${head}
  <div class="end-body">
   <div class="end-main">${giaPha(f)}</div>
   <div class="end-side">${reg}${end ? cfCard(f) : ''}${play ? wealth(f) + homePlate(f) : ''}
    <section class="end-sec end-cmp" aria-labelledby="vlh">${sh('Theo các hướng đã chọn', 'La bàn giá trị', 'vlh')}${compass()}</section></div>
  </div>
  ${pathTable(first?.i)}
  <section class="end-close"><h2>Mọi con đường đều dẫn về hôm nay</h2>
  <p>Dù dòng họ bạn chọn gì, bản đồ năm 2026 vẫn là một: một Việt Nam thống nhất từ Lũng Cú đến Cà Mau, cùng các quần đảo ngoài Biển Đông.</p>
  <blockquote class="end-q"><span class="mono">Điều đọng lại</span><p>Ở mỗi điểm rẽ, người Việt ở mọi phía đều tin mình đang làm điều đúng cho đất nước. Lịch sử ghi lại bên chiếm ưu thế, còn sử liệu giữ lại tiếng nói của tất cả.</p></blockquote></section>
  ${ro ? `<div class="end-back"><button class="btn ghost" data-a="close">‹ Về Sổ kết cục</button></div></div>` : `<div class="end-acts"><button class="btn" data-a="share">Tạo thẻ chia sẻ</button><button class="btn ghost" data-a="tab" data-t="src">Đọc sử liệu gốc</button></div>
  ${end ? nextTry() : ''}<button class="lnk" data-a="reset">Chọn lại từ 1858</button></div>`}`;
  layer.querySelector<HTMLElement>('.end-title')?.focus({ preventScroll: true }); // như trang sự kiện: tiêu điểm vào hồ sơ vừa mở, trình đọc màn hình đọc từ tên kết cục
  if (ro) { layer.querySelector<HTMLElement>(':scope > .ov.end')!.dataset.ret = JSON.stringify({ tab: 'me' }); return; } // nút đóng (event.ts) về Hồ sơ
  const nb = S.badges.length;
  checkBadges();
  if (meta && S.badges.length !== nb) archiveRun(meta); // huy hiệu vừa trao (Khép hồ sơ…) cũng vào bản lưu trong sổ
  if (!end) return;
  warmEnd(f, end); // lời kể của phim hành trình cho lúc mất mạng
  // lần đầu mở: đọc tên kết cục và câu tóm sau khi dấu triện đóng xong (~0,8 s) chừng một giây, nếu giọng đọc đang bật và
  // người chơi chưa rời màn kết, chưa mở phim và chưa tự bấm "Nghe" / "Dừng"; mở lại về sau thì chỉ đọc khi bấm "Nghe"
  const ov = layer.querySelector<HTMLElement>('.ov.end'), b = ov?.querySelector<HTMLElement>('[data-a=listen-end]');
  clearTimeout(autoRead);
  if (fresh && ov && b) autoRead = setTimeout(() => { if (layer.contains(ov) && !b.dataset.on && !document.querySelector('.cine.film:not(.out)')) listenEnd(b, false); }, 1800);
}
let autoRead: ReturnType<typeof setTimeout> | undefined;

/** Hồ sơ của ván đang chơi khép được: có kết cục, và Trò chơi đã đi hết tới năm 2026 (Hồ sơ cho xem kết luận từ lúc đủ
    sáu điểm rẽ chỉ ở Đọc sử). */
const closable = (e: Ending | null): e is Ending => !!e && (!isPlay() || S.year >= Y1);
/** Dòng của ván đang chơi trong Sổ kết cục; Trò chơi cất cả ngưỡng gia sản lúc khép, mở lại hồ sơ thì giữ đúng dấu này dù
    bảng mô phỏng tính lại (state.ts viewing). */
const runMeta = (f: Facts, e: Ending, title: string) => ({ end: e.id, title, name: nameChain(), home: isPlay() ? home()[1] : '', ...(isPlay() ? { th: f.th, tiers: tiersNow() } : {}) });
/** Dòng họ đã đọc kết cục ở một bản trước (S.endSaid mà chưa có S.endFix.id: kết cục chỉ được giữ, được cất vào sổ từ bản
    này): giữ kết cục ấy và cất vào Sổ kết cục ngay khi mở Hồ sơ, không đợi mở lại màn kết. Hồ sơ đã khép rồi (kể cả khi
    người chơi vừa xoá sổ) thì không làm gì. */
export function closeLive(): void {
  if (readOnly() || !S.endSaid || S.endFix?.id || (isPlay() && S.year < Y1)) return;
  const { f, e, title } = endingNow();
  if (!closable(e)) return;
  keepEnding(e);
  save();
  archiveRun(runMeta(f, e, title));
}

/** Dòng "chỉ xem" trên đầu hồ sơ mở lại từ Sổ kết cục. */
const roNote = (r: ArcRun) => `<p class="end-ro"><span class="mono">Hồ sơ đã khép</span> ${esc(r.name)} khép hồ sơ ngày ${esc(arcDate(r.at))}${r.mode === 'read' ? ' (Đọc sử)' : ''}. Xem lại ở đây không đổi gì trong ván đang chơi.</p>`;

/** Sổ kết cục: mở lại hồ sơ một dòng họ đã khép, chỉ để xem (openEnd dựng với S tạm là bản lưu của nó, rồi trả S lại). */
export function openPast(id: string): boolean {
  const run = archive().runs.find(r => r.id === id), was = moodNow(); // nhạc lúc mở (tour đang dừng: nhạc của chương)
  let ok = false;
  try { ok = !!run && !!viewRun(run, () => { openEnd(run); return true; }); } catch (e) { note(`Sổ kết cục: không mở được hồ sơ ${id}: ${String((e as Error)?.message || e)}`); }
  if (!ok) { toast('Không mở được hồ sơ này: bản lưu trong sổ đã hỏng.'); return false; }
  backToLedger(id, was);
  return true;
}

/** Tên kết cục và câu tóm bằng giọng thuyết minh (bản thu end-<id>, nếu đọc đúng câu trên màn; không thì giọng của máy);
    bấm lần nữa thì dừng. Hồ sơ mở lại từ Sổ kết cục: đọc kết cục của dòng họ ấy. */
function listenEnd(b: HTMLElement, force: boolean): void {
  if (b.dataset.on) { hush(); return; }
  const id = b.closest<HTMLElement>('.ov.end')?.dataset.ro, run = id ? archive().runs.find(r => r.id === id) : undefined;
  const go = () => {
    const { f, e } = endingNow();
    if (e && speak(endSpeech(e, f), () => { delete b.dataset.on; }, force, endVoiceKey(e, f))) b.dataset.on = '1';
  };
  if (run) viewRun(run, go); else if (!id) go();
}
on('listen-end', el => { clearTimeout(autoRead); listenEnd(el, true); });
/** Lời kể của phim hành trình (dòng gia phả từng đời, kết cục, lời khép theo họ): tải sẵn cho lúc mất mạng (warm.ts). */
function warmEnd(f: Facts, end: Ending): void {
  const skey = S.names.length ? surnameKey(S.names[0].from) : S.surname || surnameKey(S.name), epi = EPILOGUES[skey];
  warmKeys([...ERAS.map(e => { const o = optOf(e); return o ? chronKey(o.id, chronLine(o.id, f, CHRONICLE)) : undefined; }), endVoiceKey(end, f), epi ? sayKey(epiKey(skey), epi) : undefined]);
}

/** Địa chỉ công khai của trò chơi, in ở chân thẻ chia sẻ và gửi kèm khi chia sẻ (bản xem thử, bản chạy trên máy riêng
    vẫn trỏ người xem về đây). */
const SITE = 'du-do-seven.vercel.app';

/** 1080×1350 result card drawn on a canvas with the theme's fonts and colours. */
async function makeCard(): Promise<string> {
  try { await document.fonts.ready; } catch { /* draw with fallbacks */ }
  const cs = getComputedStyle(app), c = (k: string) => cs.getPropertyValue(k).trim();
  const W = 1080, HH = 1350, cv = document.createElement('canvas');
  cv.width = W; cv.height = HH;
  const x = cv.getContext('2d')!;
  const disp = c('--disp'), mono = c('--mono'), serif = c('--serif'), ink = c('--ink'), ink2 = c('--ink2'), acc = c('--acc'), paper = c('--paper'), paper3 = c('--paper3');
  // Áp phích không tải kiểu nghiêng của Be Vietnam Pro: chữ đứng thay vì nghiêng giả
  const it = S.theme === 'poster' ? '' : 'italic ';
  // fonts.ready không tải phông chưa dùng trong trang: nhãn đã sang chữ thân bài nên phông đơn cách chưa tải, canvas vẽ
  // thẻ đầu tiên bằng phông dự phòng thiếu "Ồ", "Ế" ("DƯ ĐÔ` · HÔ`SƠ", "KÊT CỤC"). Tải trước mọi kiểu chữ thẻ dùng.
  try {
    await Promise.all([`500 24px ${mono}`, `600 30px ${mono}`, `900 120px ${disp}`, `700 34px ${disp}`, `${it}500 44px ${serif}`, `400 30px ${serif}`, `${it}400 28px ${serif}`]
      .map(f => document.fonts.load(f, 'ĐỒẾỜỮẪỆ 0123456789' + familyName())));
  } catch { /* vẽ bằng phông dự phòng */ }
  /** Một dòng chữ, thu nhỏ cỡ cho vừa bề ngang (tên kết cục, tên họ dài). Các cụm chữ số vẽ bằng phông đơn cách: Playfair và
      Garamond mặc định là số kiểu cổ (nhấp nhô quanh dòng chân chữ), canvas không bật được số thẳng hàng. */
  const line = (t: string, font: (px: number) => string, px: number, at: number, o: { max?: number; x0?: number; right?: boolean; num?: (px: number) => string } = {}) => {
    const parts = t.split(/(\d+(?:[.,/]\d+)*)/).filter(Boolean), isN = (p: string) => /^\d/.test(p), num = o.num || ((n: number) => `500 ${Math.round(n * 0.9)}px ${mono}`);
    let n = px;
    const width = () => parts.reduce((s, p) => { x.font = isN(p) ? num(n) : font(n); return s + x.measureText(p).width; }, 0);
    while (n > 18 && width() > (o.max ?? W - 200)) n--;
    let cx = o.right ? (o.x0 ?? W - 100) - width() : o.x0 ?? 100;
    for (const p of parts) { x.font = isN(p) ? num(n) : font(n); x.fillText(p, cx, at); cx += x.measureText(p).width; }
  };
  x.textAlign = 'left';
  x.fillStyle = paper; x.fillRect(0, 0, W, HH);
  x.strokeStyle = ink; x.lineWidth = 3; x.strokeRect(40, 40, W - 80, HH - 80); x.lineWidth = 1; x.strokeRect(54, 54, W - 108, HH - 108);
  x.fillStyle = ink2; x.font = `500 24px ${mono}`; x.fillText('DƯ ĐỒ · HỒ SƠ DÒNG HỌ · 1858 – 2026', 100, 135);
  // dấu chồng của tên họ ("ầ" trong Trần, "ễ" trong Nguyễn) cao ~125 px trên dòng chân chữ: đặt tên đủ thấp để dấu cách
  // dòng nhãn phía trên 18 px (trước đây dấu huyền chạm "1858"), phần dưới thẻ dịch xuống theo (còn ~60 px trống trên chân thẻ)
  x.font = `900 120px ${disp}`;
  const dy = Math.min(30, Math.max(0, Math.ceil(135 + 18 + x.measureText(familyName()).actualBoundingBoxAscent) - 260));
  x.fillStyle = acc; line(familyName(), n => `900 ${n}px ${disp}`, 120, 260 + dy);
  // kết cục và độ hiếm (chưa chọn đủ sáu điểm rẽ: kiểu người theo các hướng đã chọn)
  const { e: end, title, f } = endingNow(), a = archetype(), rar = end ? rarityLine(end.id, f.mode) : null;
  x.fillStyle = ink; line(end ? title : a ? a[0] : 'Đang trên đường', n => `${it}500 ${n}px ${serif}`, 44, 326 + dy);
  if (rar) { const f2 = (n: number) => `500 ${n}px ${mono}`; x.fillStyle = ink2; line(rar.lead.toUpperCase(), f2, 22, 366 + dy, { num: f2 }); }
  let y = 420 + dy;
  x.fillStyle = ink; x.fillRect(100, y - 30, W - 200, 2);
  // cả nhà đã ra nước ngoài trên thẻ sự kiện (Trò chơi): dòng năm 1976 ghi thêm một dòng nhỏ dưới hướng đã chọn, trong
  // khoảng trống giữa hai dòng (không đẩy phần dưới thẻ xuống)
  const gone = isPlay() && f.picks[ERAS.length - 1] ? exitNote(f) : undefined;
  ERAS.forEach((e, i) => {
    const o = optOf(e);
    x.fillStyle = acc; x.font = `500 26px ${mono}`; x.fillText(String(e.cy), 100, y + 22);
    x.fillStyle = ink2; x.font = `400 30px ${serif}`; x.fillText(e.title, 220, y + 22);
    x.fillStyle = ink; line(o ? o.label : '—', n => `700 ${n}px ${disp}`, 34, y + 22, { right: true, max: 330 });
    if (gone && i === ERAS.length - 1) { x.fillStyle = ink2; line(gone, n => `${it}400 ${n}px ${serif}`, 24, y + 52, { right: true, max: 600 }); }
    y += 70;
  });
  y += 30;
  x.fillStyle = ink; x.fillRect(100, y - 30, W - 200, 2);
  const v = values();
  VAL.forEach(([k, n]) => {
    x.fillStyle = ink2; x.font = `400 30px ${serif}`; x.fillText(n, 100, y + 10);
    x.fillStyle = paper3; x.fillRect(300, y - 8, 560, 16);
    x.fillStyle = acc; x.fillRect(300, y - 8, 560 * Math.min(1, v[k] / 18), 16);
    x.fillStyle = ink; x.font = `600 30px ${mono}`; x.textAlign = 'right'; x.fillText(String(v[k]), W - 100, y + 12); x.textAlign = 'left';
    y += 56;
  });
  const ms = matchStats();
  y += 36;
  x.fillStyle = ink; line(isPlay() ? `${rank()[0]}  ·  ${home()[1]}  ·  ${decidedCount()} quyết định` : `Trùng hướng chiếm ưu thế ${ms.m}/${ms.t}  ·  ${S.badges.length} huy hiệu`, n => `700 ${n}px ${disp}`, 40, y);
  // chân thẻ: một nét kẻ, câu nhắc, và địa chỉ trò chơi để người xem thẻ tìm tới
  x.fillStyle = ink; x.fillRect(100, HH - 170, W - 200, 1.5);
  x.fillStyle = ink2; x.font = `${it}400 28px ${serif}`; x.fillText('Một trò chơi lịch sử. Không có câu trả lời đúng.', 100, HH - 120);
  x.fillStyle = acc; x.font = `600 30px ${mono}`; x.fillText(SITE, 100, HH - 78);
  return cv.toDataURL('image/png');
}

export async function openShare(): Promise<void> {
  const url = await makeCard();
  if (!S.shared) { S.shared = true; save(); }
  const slug = familyName().replace(/\s+/g, '-').toLowerCase();
  const d = sheet(`<div class="mono muted">Thẻ chia sẻ</div><h2 style="margin:6px 0 12px">Con đường của dòng họ bạn</h2>
  <img src="${url}" alt="Thẻ kết quả" style="width:100%;border-radius:var(--r);border:1px solid var(--rule);display:block">
  <div style="height:14px"></div><a class="btn" href="${url}" download="du-do-${esc(slug)}.png">Tải ảnh</a>
  <div style="height:10px"></div><button class="btn ghost" id="nshare">Chia sẻ…</button>`, true);
  d.querySelector<HTMLButtonElement>('#nshare')!.onclick = async () => {
    try {
      const b = await (await fetch(url)).blob();
      const f = new File([b], 'du-do.png', { type: 'image/png' });
      const { title } = endingNow();
      if (navigator.canShare && navigator.canShare({ files: [f] })) await navigator.share({ files: [f], title: 'Dư Đồ', text: `Con đường của ${familyName()} qua sáu thế hệ, 1858 – 2026${title ? ': ' + title : ''}.`, url: `https://${SITE}/` });
      else toast('Trình duyệt này chưa hỗ trợ chia sẻ trực tiếp. Hãy tải ảnh.');
    } catch { /* user cancelled */ }
  };
  checkBadges();
}

export function resetAll(): void {
  stopTour();
  clearBadgeQueue(); clearToasts(); // thông báo, huy hiệu của dòng họ vừa xoá không theo sang ván mới
  resetState();
  invalidateTrack();
  setTab('map');
  clearLayer();
  renderMain();
  splash();
}

on('tab', el => setTab(el.dataset.t as 'map' | 'fig' | 'src' | 'me'));

on('film', () => montage());
