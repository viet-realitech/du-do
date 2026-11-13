import { isPlay, mustDecide, pendingCard, needsDecision, specialFor, homeChoice, localCard, ownCard } from './play';
import { openCard } from './screens/card';
import { mood, eraMood } from './music';
import { ERAS, QUIZ, type Era, type HistEvent } from './data';
import { S, save, rt, Y1, eraOf, evEra, allEv, setFocus } from './state';
import { $, announce } from './ui/dom';
import { icon } from './ui/icons';
import { SND } from './audio';
import { canSpeak, hush, speak, speaking } from './narration';
import { evKey, evSpeech, evSpeechFull } from './speech';
import { hidePop, zoomTo, zoomK, zoomFit } from './map';
import { fogTop, playScene, endScene, sceneFrame, sceneHold, sceneLen, sceneLeft, capH, hasScene, voiceAt, stepScene, pauseScene, resumeScene, scenePaused, closeAt, holdable, beforeClose } from './scene';
import { preloadEra } from './screens/cinema';
import { renderMain, setYear } from './view';
import { openGate, openQuiz, quizFor } from './screens/gate';
import { goEnd } from './screens/ending';

/* Chapter "zoom tour": fly through key events of an era, narrating each, then return to the overview and
   open the next turning point. In the game flow the tour pauses (never stops) for cards, overlays and map
   gestures and resumes by itself where it can; "Dừng" and a timeline scrub are the player taking over. */
interface Tour {
  e: Era; L: HistEvent[]; i: number; end: number; t: number | undefined; cur?: string;
  /** Lý do tạm dừng: thẻ sự kiện, màn chi tiết / nhân vật, hay cử chỉ bản đồ. */
  paused?: 'card' | 'overlay' | 'map' | 'user';
  /** Bước hiện tại; mọi callback hẹn giờ so với nó để lời đọc / hẹn giờ cũ không tác động lên bước sau. */
  step: number;
  /** Đi tiếp bước hiện tại (dùng khi giọng đọc bị tắt giữa chừng). */
  next?: (d: number) => void;
  /** Lúc bước hiện tại bắt đầu (để giữ đủ thời lượng cảnh trận khi tắt giọng giữa chừng). */
  t0?: number;
  /** Trò chơi, sau "Điểm rẽ ›": chỉ còn các sự kiện dòng họ phải quyết định; mỗi bước bay tới rồi mở thẻ ngay. */
  rush?: boolean;
  /** Đọc sử: xem một chương chọn muộn từ năm 2026: xem xong (và câu đố) thì về lại đó, nơi có kết luận. */
  back?: number | null;
  /** Đọc sử: lúc chạm "Điểm rẽ ›" lần đầu (đang chờ chạm lần hai để xác nhận bỏ qua chương). */
  arm?: number;
  /** Bước mà `next` thuộc về (next của bước cũ không hẹn được gì: live() sai). */
  nextStep?: number;
  /** Bước hiện tại còn nợ lời kể (có giọng, chưa đọc): đừng rút ngắn bước trước khi kể. */
  owed?: () => boolean;
  /** Lời kể của bước (một lần; tự bỏ qua khi đã kể, đang giữ cảnh, trận chưa khép): ▶ sau ❚❚ gọi lại nếu còn nợ. */
  say?: () => void;
}
let tour: Tour | null = null;
let mapIdle: number | undefined;

export const isTouring = () => !!tour;
/** Xem lại diễn biến bị cắt (chạm bản đồ, ẩn app): tour đang chờ trang đã đóng thành dừng hẳn (▶ để chạy tiếp), không
    để lần đóng một bảng bất kỳ về sau lặng lẽ cho nó chạy. */
export function holdTour(): void {
  if (tour?.paused === 'overlay' && !covered()) { tour.paused = 'user'; tourBar(); }
}
/** Lý do tour đang tạm dừng (không dừng: undefined). */
export const tourPause = () => tour?.paused;
/** Có gì đang che bản đồ: trang sự kiện, bảng Nhân vật / Sử liệu / Hồ sơ, bảng nhân vật / sử liệu / xác nhận, hay đang
    xem lại diễn biến. */
// #layer lấy thẳng từ DOM: ui/dom.ts nhập tour.ts (vòng nhập), lúc module này chạy `layer` của nó chưa có
const layerEl = document.getElementById('layer')!;
const covered = (): boolean => !!layerEl.querySelector(':scope > .ov, :scope > .pane, :scope > .scrim') || !!document.getElementById('replb');
// Mọi thứ che bản đồ đều tạm dừng tour: không kể, không đi tiếp sau lưng người đọc, không bật thẻ hay câu đố cuối chương
// đè lên bảng đang đọc. Bản đồ lộ lại thì tour chạy tiếp từ đúng bước đang đứng (kể lại, dựng lại cảnh). Thẻ do chính
// tour mở ('card') và ❚❚ ('user') giữ nguyên lý do của chúng.
new MutationObserver(() => {
  if (!tour) return;
  if (covered()) { if (!tour.paused || tour.paused === 'map') pauseTour('overlay'); }
  else if (tour.paused === 'overlay') resumeTour('overlay');
}).observe(layerEl, { childList: true });
export const isTourPaused = () => !!tour?.paused;
/** Đọc sử: tour dừng (■, tải lại) giữa chừng ở năm mở chương sau (1954: nhật ký, Điện Biên Phủ, Genève vẫn thuộc chương
    4): chương còn dang dở ấy, theo mốc tour đã ghi (S.tourAt, xoá khi xem xong / bỏ qua chương), không theo sự kiện đang
    chọn (bộ lọc đổi được nó). */
export function resumeEra(): Era | undefined {
  const at = !isPlay() ? S.tourAt : null, atEv = at ? allEv().find(v => v.id === at.id) : undefined;
  const e = atEv && atEv.y === S.year ? ERAS.find(x => x.id === at!.e) : undefined;
  return e && e !== eraOf(S.year) ? e : undefined;
}
/** Chương tour đang kể, hay chương còn dang dở (resumeEra): đầu đề màn chính, chip điểm rẽ, thanh năm theo chương này
    khi đứng ở mốc khép chương cùng năm với điểm rẽ sau. */
export const tourEra = (): Era | null =>
  (tour && (!tour.paused || (S.year >= tour.e.cy && S.year <= tour.end)) ? tour.e : null) || resumeEra() || null; // tour đang dừng mà xem năm khác (xem lại, "đến sự kiện"): đầu trang theo năm ấy

/** Đọc sử: mốc khép / mở các chương, và sự kiện của hai câu đố đầu mỗi chương (data2.js QUIZ), luôn có trong tour của
    chương chứa nó: lần xem đầu, câu đố hỏi đúng điều tour đã kể (gate.ts quizFor chỉ hỏi sự kiện đã hiện). Hai câu còn lại
    hỏi khi sự kiện của chúng có trong tour (Trò chơi: thẻ cả nước, luôn có), để tour vẫn còn chỗ cho các trận đánh. */
const MUST = new Set(['pt84', 'cv85', 'yb30', 'ng45', 'dbp', 'gnv', 'mt68', 'sg75', 'dm86', ...Object.values(QUIZ).flatMap(qs => qs.slice(0, 2).map(q => q[4]))]);
/** Chỉ số thứ j trong `need` mẫu rải đều trên `len` phần tử, gồm cả đầu và cuối (sự kiện khép chương: 30.4.1975, Patenôtre…). */
const spread = (j: number, need: number, len: number) => (need <= 1 || len <= 1 ? 0 : Math.round((j * (len - 1)) / (need - 1)));

function tourList(e: Era): { L: HistEvent[]; end: number } {
  const i = ERAS.indexOf(e), nx = ERAS[i + 1], end = nx ? nx.cy : Y1;
  // sự kiện của chương (evEra: trang nhật ký theo hướng đã mở nó, Điện Biên Phủ / Genève khép chương 4), từ năm đang đứng
  // cả chương (không chỉ từ năm đang đứng): chạy tiếp giữa chương thì đếm bước theo cùng một danh sách (4/8, không 1/5)
  let L = allEv().filter(v => evEra(v) === e && v.y >= e.cy);
  const ord = new Map(L.map((v, i) => [v, i])), at = (v: HistEvent) => ord.get(v)!; // cùng năm: theo ngày (allEv đã xếp)
  if (isPlay()) {
    // Trò chơi: mọi thẻ bắt buộc (cả thẻ đã quyết: danh sách không đổi theo các quyết định, tải lại giữa chương vẫn đếm
    // 4/10 như trước) và nhật ký luôn có mặt, phần còn lại lấy đều, ưu tiên sự kiện có thẻ của dòng họ này.
    const must = L.filter(v => !v.diary && (mustDecide(v) || !!specialFor(v))), d = L.filter(v => v.diary);
    const rest = L.filter(v => !must.includes(v) && !v.diary);
    const owed = rest.filter(v => localCard(v)); // thẻ tuỳ chọn của vùng khác không mời
    const pool = owed.length >= 3 ? owed : rest;
    // tám bước: chương đầu tới thẻ quyết định đầu tiên nhanh hơn, mỗi chương bớt khoảng hai bước chỉ để xem
    const need = Math.max(0, 8 - must.length - d.length), pick: HistEvent[] = [];
    for (let j = 0; j < need && pool.length; j++) pick.push(pool[spread(j, need, pool.length)]);
    L = [...new Set([...must, ...d, ...pick])].sort((a, b) => a.y - b.y || (a.diary ? 1 : 0) - (b.diary ? 1 : 0) || at(a) - at(b));
    return { L, end };
  }
  if (L.length > 8) {
    // Keep every family-diary page, then sample battles/treaties/quoted events evenly.
    // mốc then chốt của chương luôn có mặt (câu đố cuối chương cũng hỏi về chúng)
    const d = L.filter(v => v.diary), must = L.filter(v => MUST.has(v.id)), rest = L.filter(v => !v.diary && !must.includes(v));
    const key = rest.filter(v => v.k === 'Trận đánh' || v.k === 'Hiệp ước' || v.qt || hasScene(v)); // cả cảnh di chuyển (Nhà Rồng, di cư…)
    const pool = key.length >= 4 ? key : rest, need = Math.max(0, 8 - d.length - must.length), pick: HistEvent[] = [];
    for (let j = 0; j < need && pool.length; j++) pick.push(pool[spread(j, need, pool.length)]);
    L = [...new Set([...d, ...must, ...pick])].sort((a, b) => a.y - b.y || (b.diary ? 1 : 0) - (a.diary ? 1 : 0) || at(a) - at(b)); // cùng năm: trang nhật ký trước (như trước đây), rồi theo ngày
  }
  return { L, end };
}

export function startTour(eIn?: Era): void {
  stopTour();
  live0();
  hidePop();
  const pc0 = !eIn && isPlay() ? pendingCard(S.year) : undefined;
  // Đọc sử: ■ / tải lại ở Điện Biên Phủ rồi ▶: kể tiếp chương 4 từ bước đã dừng (rồi câu đố chương 4, điểm rẽ 5)
  const cont = !eIn ? resumeEra() : undefined, atEv = cont ? allEv().find(v => v.id === S.tourAt!.id) : undefined;
  const e = eIn || (pc0 ? evEra(pc0) : cont || eraOf(S.year)); // thẻ còn nợ của chương trước (ĐBP 1954): kể tiếp chương ấy
  if (!S.picks[e.id] && isPlay()) {
    // Trò chơi: điểm rẽ chưa chọn sớm nhất phải chọn trước. Đọc sử: xem chương không cần chọn (chip "◆ Chọn hướng" mời chọn)
    const g = ERAS.find(x => !S.picks[x.id] && x.cy <= S.year);
    if (g) { openGate(g); return; }
  }
  let back: number | null = null;
  if (eIn && !isPlay()) {
    // Đọc sử: "▶ Xem chương N diễn ra" sau khi chọn muộn một điểm rẽ (từ năm 2026, hay đã ở chương sau): về đầu chương ấy
    const nx = ERAS[ERAS.indexOf(e) + 1], end0 = nx ? nx.cy : Y1;
    if (S.year >= Y1 || S.year > end0 || S.year < e.cy) { back = S.year >= Y1 ? Y1 : null; S.year = e.cy; setFocus(); save(); }
  }
  if (S.year >= Y1) return;
  const tl = tourList(e), end = tl.end;
  let L = tl.L, i0 = L.findIndex(v => v.y >= S.year); // bắt đầu từ năm đang đứng (đếm bước theo danh sách cả chương)
  if (cont && atEv && L.includes(atEv)) i0 = L.indexOf(atEv); // kể lại đúng bước đã dừng (thứ tự của tour: nhật ký trước)
  if (i0 < 0 && !isPlay()) {
    // Đọc sử, chạy sau bước mẫu cuối của chương (vd. 1920: còn Thanh niên 1925): kể nốt các sự kiện còn lại của chương,
    // không nhảy thẳng tới điểm rẽ kế
    const tail = allEv().filter(v => evEra(v) === e && v.y >= S.year && v.y >= e.cy && !L.includes(v)), need = Math.min(4, tail.length);
    const add = [...new Set(Array.from({ length: need }, (_, j) => tail[spread(j, need, tail.length)]))];
    if (add.length) { i0 = L.length; L = [...L, ...add]; }
  }
  // không còn bước nào: khép chương ngay (tourStep), không tính là đã xem (không đố chương chưa xem)
  tour = { e, L, i: i0 < 0 ? L.length : i0, end, t: undefined, step: 0, back };
  void preloadEra(ERAS[ERAS.indexOf(e) + 1]); // ảnh cho màn mở chương kế tiếp
  mood(eraMood(e.id));
  tourBar();
  tourStep();
}

function tourStep(): void {
  if (!tour) return;
  const { L, i } = tour;
  if (i >= L.length) { finishTour(tour.step === 0); return; } // chưa kể bước nào (▶ ở cuối chương): như bỏ qua
  const v = L[i], step = ++tour.step;
  const live = () => !!tour && tour.step === step && !tour.paused;
  hidePop(); // khung tỉnh mở ở bước trước (ghi năm cũ, đè thanh tour) không ở lại
  animYear(v.y, () => {
    if (!live()) return;
    rt.focusEv = v;
    tour!.cur = v.id;
    if (!S.shown.includes(v.id)) S.shown.push(v.id); // câu đố cuối chương chỉ hỏi về sự kiện đã hiện (gate.ts quizFor)
    if (!isPlay()) S.tourAt = { e: tour!.e.id, id: v.id }; // ■ / tải lại rồi ▶: kể tiếp đúng chương, đúng bước
    save();
    renderMain();
    const hc = homeChoice(v);
    announce(`Chương ${tour!.e.n}, ${tour!.i + 1} trên ${tour!.L.length}: ${v.t}, ${v.y}${hc ? `. Ở nhà, cả họ đã chọn: ${hc.ch[0]}` : ''}`);
    const fr = sceneFrame(v);
    if (fr) zoomFit(fr, Math.min(8, zoomK(v) * 1.5), undefined, capH(), fogTop(v)); else zoomTo(v.l, zoomK(v)); // trận đánh: khung vừa mọi mũi tiến quân, chừa phụ đề
    SND.fly();
    // Trò chơi: sự kiện có thẻ thì nghe kể xong mới tạm dừng tour và mở thẻ (không có giọng đọc: sau 4,5 s),
    // để người chơi không phải quyết định khi lời kể còn dang dở; "Tiếp tục" trên thẻ gọi resumeTour().
    // Chạm ◆ sớm hơn đi cùng một đường (pauseForCard).
    const card = isPlay() && needsDecision(v) && ownCard(v), rush = !!tour!.rush, voiced = !rush && S.narr && canSpeak(evKey(v));
    // cảnh có nhịp kể: giữ đủ để đọc hết phụ đề (thẻ cũng mở sau đó, tối đa 14 s); "Điểm rẽ ›": bay tới, mở thẻ ngay
    const hold = fr ? sceneHold(v) : 0, cardAt = rush ? 1700 : fr ? Math.max(4500, sceneLen(v) + 1000) : 4500;
    // bước nhịp (›, chạm phụ đề): cảnh ngắn lại thì hẹn lại bước tour; đang có lời kể thì để lời kể xong tự đi tiếp
    // lời kể (một lần): trận đánh có sơ đồ đọc khi trận khép, kể cả khi người xem bước nhịp tới đó sớm
    let said = false;
    const speechMs = () => Math.round(Math.max(9000, evSpeechFull(v).length * 120 / ((S.rate || 0.95) / 0.95)));
    const say = () => {
      if (said || !voiced || !live() || scenePaused() || tour!.cur !== v.id || !S.narr || beforeClose(v.id)) return; // trận còn nhịp: chờ khép
      said = true;
      next(speechMs() + 2500); // bảo hiểm tính từ lúc bắt đầu kể (bước nhịp / giữ cảnh trước đó đã hẹn ngắn hơn)
      speak(evSpeech(v), () => next(Math.max(card ? 500 : 900, Math.min(9000, sceneLeft() + (sceneLeft() ? 600 : 0)))), false, evKey(v));
    };
    const owed = () => voiced && !said && S.narr;
    // bước nhịp: cảnh ngắn lại thì hẹn lại bước, trừ khi lời kể còn nợ (say() sẽ hẹn khi bắt đầu kể) hay đang kể
    const stepped = () => { if (live() && !owed() && !speaking()) next(Math.max(900, sceneLeft() + (card ? 600 : 1200))); };
    const onward = () => { if (live()) { hush(); next(0); } }; // chạm phụ đề khi đã hết nhịp: như "›"
    if (!rush) playScene(v, card && !voiced ? cardAt : Infinity, undefined, stepped, onward, say); // cảnh động: trận đánh, ấn triện, phim tư liệu
    tourBar();
    const advance = () => { if (!live()) return; tour!.t = window.setTimeout(() => { if (!live()) return; tour!.i++; tourStep(); }, 0); };
    const openIt = () => { if (!live()) return; if (!needsDecision(v) || !ownCard(v)) advance(); else pauseForCard(v); };
    const next = (d: number) => {
      if (!live()) return;
      clearTimeout(tour!.t);
      tour!.t = window.setTimeout(card ? openIt : advance, d);
    };
    tour!.next = next;
    tour!.nextStep = step;
    tour!.owed = owed;
    tour!.say = say;
    tour!.t0 = performance.now();
    if (voiced) {
      // bảo hiểm: lời kể bị cắt (đổi tốc độ, bật/tắt giọng ở Hồ sơ…) thì bước này vẫn đi tiếp; onend thay hẹn giờ này
      next(Math.round(Math.max(hold, voiceAt(v) + Math.max(9000, evSpeechFull(v).length * 120 / ((S.rate || 0.95) / 0.95))) + 2500));
      // kể xong mà cảnh còn nhịp chưa đọc: chờ thêm (tối đa 9 s) cho hết phụ đề
      // (Giọng tắt trước lúc này: nút Giọng đã hẹn lại theo cảnh, không đọc nữa)
      // trận có sơ đồ: cảnh gọi say khi khép (theo đồng hồ của cảnh: bước nhịp, giữ cảnh đều đúng); hẹn giờ này chỉ là
      // bảo hiểm khi cảnh không vẽ được; cảnh khác: đọc ngay sau tiếng mở
      setTimeout(say, closeAt(v) ? voiceAt(v) + 4000 : voiceAt(v));
    }
    else next(card ? cardAt : fr ? hold : 2900); // không giọng đọc: cảnh động giữ đủ lâu để đọc hết phụ đề
  });
}

function animYear(to: number, cb: () => void): void {
  const from = S.year;
  if (from === to) { cb(); return; }
  const dur = Math.min(900, Math.abs(to - from) * 70), t0 = performance.now();
  const f = (now: number) => {
    if (!tour) return;
    const k = Math.min(1, (now - t0) / dur), y = Math.round(from + (to - from) * k);
    // chỉ vẽ lại khi năm đổi (~70 ms một năm: ba, bốn khung hình liền vẽ lại y hệt nhau)
    if (y !== S.year) { S.year = y; setFocus(); renderMain(); }
    if (k < 1) requestAnimationFrame(f);
    else { save(); cb(); }
  };
  requestAnimationFrame(f);
}

function finishTour(skipped = false): void {
  const end = tour!.end, done = tour!.e.id, back = tour!.back;
  stopTour();
  if (S.tourAt) { S.tourAt = null; save(); } // chương đã xong: ▶ ở năm 1954 sang chương 5, không kể lại chương 4
  zoomTo(null);
  // Trò chơi: thẻ bắt buộc còn sót (sau khi bỏ qua tour) mở lần lượt, rồi điểm rẽ kế hoặc kết cục (setYear).
  if (isPlay()) rt.flowTo = end;
  else rt.toured = skipped ? null : done; // Đọc sử: xem hết chương thì câu đố của nó hỏi trước điểm rẽ kế; bỏ qua thì không
  // câu đố / điểm rẽ / mùa màng mở khi bản đồ không bị che (người đọc vừa mở bảng Nhân vật…: chờ họ về bản đồ);
  // tour mới hay người dùng đổi năm trong lúc chờ thì thôi
  const y0 = S.year, then = (f: () => void) => {
    const go = () => { if (tour || S.year !== y0) return; if (covered()) { setTimeout(go, 400); return; } f(); };
    setTimeout(go, 950);
  };
  if (back != null && !isPlay()) {
    // chương chọn muộn từ năm 2026: đố chương vừa xem (nếu chưa), rồi về 2026 (thẻ kết luận, điểm rẽ còn bỏ ngỏ); chương 6
    // thì mở luôn kết luận (nút cuối câu đố ghi "Xem kết luận")
    const home = () => { rt.toured = null; setYear(back, true); if (done === ERAS[ERAS.length - 1].id) goEnd(); };
    then(() => (!skipped && !S.quiz[done] ? openQuiz(done, home) : home()));
    return;
  }
  // Đọc sử, chương 6 xem hết hay bỏ qua: như mọi chương dẫn tới điểm rẽ kế, chương cuối dẫn tới kết luận (goEnd đố
  // chương 6 nếu vừa xem hết), không thả người đọc ở bản đồ năm 2026
  if (!isPlay() && done === ERAS[ERAS.length - 1].id) { then(() => { setYear(end, true); goEnd(); }); return; }
  // Đọc sử, vừa xem hết chương: câu đố của chương mở ngay trên bản đồ của chương ấy, rồi mới sang năm của điểm rẽ kế
  // (không để đầu trang đã ghi "Chương sau" khi còn đang đố chương này)
  if (!isPlay() && !skipped && !S.quiz[done] && quizFor(done).length) { then(() => openQuiz(done, () => { rt.toured = null; setYear(end, true); })); return; }
  then(() => setYear(end, true));
}

/** Thẻ của sự kiện `v` đang là bước hiện tại: tạm dừng tour và mở thẻ (một lần, không mở chồng). */
export function pauseForCard(v: HistEvent): boolean {
  if (!tour || tour.cur !== v.id || tour.paused) return false;
  clearTimeout(tour.t);
  clearTimeout(mapIdle);
  endScene(); // cảnh chạy lại khi tour đi tiếp; không nổ pháo dưới thẻ quyết định
  tour.paused = 'card';
  tourBar();
  openCard(v, true);
  return true;
}

/** Tạm dừng vì người chơi mở màn chi tiết / nhân vật (tự chạy tiếp khi đóng) hay chạm bản đồ (tự chạy tiếp sau 5 s yên). */
/** `user`: nút ❚❚ (đứng yên tới khi bấm ▶); `map`: cử chỉ bản đồ (tự chạy tiếp sau 5 s yên); `overlay`: trang chi tiết (chạy tiếp khi đóng). */
export function pauseTour(why: 'overlay' | 'map' | 'user'): void {
  if (!tour) return;
  clearTimeout(mapIdle);
  if (tour.paused) {
    if (why === 'map' && tour.paused === 'map') mapIdle = window.setTimeout(() => resumeTour(), 5000);
    // vừa chạm bản đồ (tự chạy tiếp sau 5 s) rồi mở trang / bảng: thành dừng vì trang, đóng trang thì chạy tiếp
    else if (why === 'overlay' && tour.paused === 'map') { tour.paused = 'overlay'; tourBar(); }
    return;
  }
  clearTimeout(tour.t);
  hush();
  // ❚❚: giữ nguyên trận đang kể (chỉ vào mũi tên được); cử chỉ bản đồ: làm phẳng ngay, không trượt dưới ngón tay
  // chỉ giữ cảnh của chính bước đang đứng và có nhịp (không giữ cảnh bước trước khi bản đồ còn đang bay sang bước sau)
  const held = why === 'user' && tour.cur === tour.L[tour.i]?.id && holdable(tour.cur) && pauseScene();
  if (!held) endScene(why === 'map');
  tour.paused = why;
  tourBar();
  if (why === 'map') mapIdle = window.setTimeout(() => resumeTour(), 5000);
}

/** Tour đang tạm dừng: đi tiếp. Sau một thẻ thì sang sự kiện kế; sau màn chi tiết / bản đồ thì chơi lại bước hiện tại. */
export function resumeTour(why?: 'overlay'): void {
  if (!tour || !tour.paused) return;
  if (why === 'overlay' && tour.paused !== 'overlay') return;
  clearTimeout(mapIdle);
  clearTimeout(tour.t);
  hush();
  const was = tour.paused;
  tour.paused = undefined;
  if (was === 'card') tour.i++;
  tourBar();
  // ▶ sau ❚❚: cảnh đã giữ chạy tiếp từ chỗ dừng (lời kể đã cắt thì không đọc lại); bước hẹn lại theo đồng hồ của cảnh
  // (cảnh đang giữ phải là của bước tour, không phải cảnh "Xem diễn biến" đang mở đè lên: khi đó kể lại bước này)
  if (was === 'user' && scenePaused() && tour.next && tour.nextStep === tour.step && holdable(tour.cur) && !document.getElementById('replb')) {
    resumeScene();
    const v = tour.L[tour.i];
    // lời kể còn nợ (trận chưa khép): say() sẽ hẹn bước khi bắt đầu kể; giờ chỉ hẹn bảo hiểm dài
    tour.next(tour.owed?.() ? sceneLeft() + 30000 : Math.max(900, sceneLeft() + (v && isPlay() && needsDecision(v) ? 600 : 1500)));
    tour.say?.(); // giữ cảnh trước khi lời kể kịp bắt đầu (cảnh di chuyển: 0,7 s đầu): kể ngay khi chạy tiếp
    return;
  }
  tourStep();
}

export function stopTour(): void {
  clearTimeout(mapIdle);
  // gỡ tour trước khi dừng cảnh: onEnd của phần xem lại (closeReplay) không được khởi động lại bước tour
  const t = tour;
  tour = null;
  if (t) clearTimeout(t.t);
  endScene();
  if (t) {
    renderMain(); // clears the spotlight
    hush();
    mood('calm');
    zoomTo(null); // dừng giữa chừng (■, kéo thanh năm): về toàn cảnh, không đứng ở mức phóng của một trận nơi khác
  }
  const tb = $('#tourb'), had = !!tb?.contains(document.activeElement);
  tb?.remove();
  const p = $('#play');
  if (p) { p.innerHTML = icon('play'); p.setAttribute('aria-label', 'Chạy chương này'); if (had) p.focus({ preventScroll: true }); } // ■: tiêu điểm sang ▶
}

/** Trình đọc màn hình: báo bước tour mới (vùng ẩn, lịch sự, không chen lời đọc). */
/** Tạo sẵn vùng thông báo (rỗng) trước bước đầu tiên, để thông báo đầu không bị trình đọc bỏ qua. */
const live0 = (): void => { if (!document.getElementById('tourlive')) announce(''); };

/** "Điểm rẽ ›": Đọc sử thì tới điểm rẽ ngay. Trò chơi còn sự kiện dòng họ phải quyết định thì không bật thẻ liền
    nhau: tour chỉ giữ các bước đó, mỗi bước vẫn bay tới nơi xảy ra rồi mở thẻ (thanh tour báo còn mấy quyết định). */
function skipTour(): void {
  if (!tour) return;
  clearTimeout(tour.t);
  hush();
  if (isPlay()) {
    const must = (v: HistEvent) => !v.diary && needsDecision(v) && (mustDecide(v) || !!specialFor(v));
    const cur = tour.L[tour.i], rest = tour.L.slice(tour.i + 1).filter(must);
    if ((cur && must(cur)) || rest.length) {
      clearTimeout(mapIdle); // tạm dừng vì cử chỉ bản đồ: đừng để hẹn "chạy tiếp sau 5 s" mở thêm thẻ đè lên thẻ này
      tour.L = [...tour.L.slice(0, tour.i + 1), ...rest];
      tour.rush = true;
      tour.paused = undefined;
      tourBar(); // bỏ nút "Điểm rẽ ›" ngay, báo số quyết định còn lại
      if (cur && must(cur) && tour.cur === cur.id && tour.next) { endScene(); tour.next(0); return; } // thẻ của bước này mở ngay
      endScene();
      if (!(cur && must(cur))) tour.i++; // bước đang bay tới một quyết định còn nợ: chạy lại chính bước đó (không bỏ mất)
      tourStep();
      return;
    }
  }
  // Đọc sử: chỉ tính là bỏ qua chương (không đố) khi thật sự bỏ qua bước (còn hơn một bước sau bước đang xem)
  finishTour(isPlay() || tour.L.length - tour.i - 1 > 1);
}

/** Nút ▶ ở dòng thời gian: chạy / tạm dừng / chạy tiếp chương. */
export function togglePlay(): void {
  if (!tour) { startTour(); return; }
  if (tour.paused === 'card') return; // đang chờ quyết định trên thẻ
  if (tour.paused) { resumeTour(); return; }
  pauseTour('user'); // cả Đọc sử lẫn Trò chơi: tạm dừng thật, giữ bước và cảnh; ▶ chạy tiếp
}

function tourBar(): void {
  if (!tour) return;
  let b = $('#tourb');
  if (!b) {
    b = document.createElement('div');
    b.id = 'tourb';
    b.className = 'tour';
    $('#mapwrap')!.appendChild(b);
    b.addEventListener('click', ev => {
      const a = (ev.target as Element).closest<HTMLElement>('[data-t]')?.dataset.t;
      if (a === 'narr') {
        S.narr = !S.narr; save();
        if (!S.narr) { // không để bước hiện tại treo; cảnh động vẫn giữ đủ thời gian (sceneHold)
          hush();
          if (tour && !tour.paused && tour.next && !tour.rush && tour.nextStep === tour.step) { // "Điểm rẽ ›": bước đã hẹn mở thẻ, không hẹn lại
            const v = tour.L[tour.i], el = performance.now() - (tour.t0 || 0), left = sceneLeft();
            // đang có cảnh: theo đồng hồ của cảnh (đã tính các lần bước nhịp); chưa / không có cảnh: theo thời gian đã qua
            tour.next(v && sceneFrame(v) ? Math.max(600, left ? left + (needsDecision(v) && isPlay() ? 600 : 1200) : sceneHold(v) - el) : 600);
          }
        }
        tourBar();
      }
      // "›": cảnh còn nhịp thì sang nhịp kế; hết nhịp thì bỏ qua bước đang chạy (bước có thẻ: mở thẻ ngay)
      else if (a === 'next') { if (tour && !tour.paused && tour.next && !stepScene()) { hush(); tour.next(0); } }
      else if (a === 'skip') {
        // Đọc sử, còn nhiều bước: chạm lần đầu chỉ hỏi lại ("Bỏ N sự kiện? ›"), chạm lần nữa trong 3 s mới bỏ qua chương
        const left = tour ? tour.L.length - tour.i - 1 : 0;
        if (tour && !isPlay() && left > 1 && !(tour.arm && Date.now() - tour.arm < 3000)) {
          const t = tour;
          t.arm = Date.now();
          tourBar();
          setTimeout(() => { if (tour === t && t.arm) { t.arm = 0; tourBar(); } }, 3000);
        } else skipTour();
      }
      else if (a === 'stop') stopTour();
      else if (a === 'resume') resumeTour();
    });
  }
  const { e, L, i, paused } = tour, n = Math.max(1, L.length), at = Math.min(i + 1, n);
  // dựng lại thanh mỗi bước: giữ tiêu điểm bàn phím trên nút đang bấm (vd. "›" bấm liên tiếp)
  const fk = b.contains(document.activeElement) ? (document.activeElement as HTMLElement).dataset.t : undefined;
  // trạng thái: bản đầy đủ, và bản ngắn cho điện thoại (nhãn một dòng; đầu trang đã ghi chương)
  const state = paused === 'card' ? '<span class="tlg"> · chờ quyết định</span><span class="tsh"> · chờ chọn</span>' : paused ? '<span class="tlg"> · tạm dừng</span><span class="tsh"> · dừng</span>' : '';
  const left = tour.rush ? L.slice(i).filter(v => needsDecision(v)).length : 0;
  b.innerHTML = `<div style="flex:1;min-width:0"><div class="mono muted">${tour.rush ? `Còn ${left} quyết định` : `${at}/${n}`}<span class="tch"> · Chương ${e.n}</span>${state}</div><div class="prog"><i style="width:${(at / n) * 100}%"></i></div></div>
    ${paused && paused !== 'card' ? `<button class="chip on" data-t="resume">${icon('play', 14)}Tiếp</button>` : `<button class="chip${S.narr ? ' on' : ''}" data-t="narr" aria-label="Giọng đọc" aria-pressed="${S.narr}">Giọng</button>`}${paused ? '' : `<button class="chip ic" data-t="next" aria-label="Tiếp: nhịp trận kế tiếp, hết nhịp thì sự kiện kế tiếp" title="Nhịp / sự kiện kế tiếp">${icon('next')}</button>`}${tour.rush ? '' : `<button class="chip${tour.arm ? ' on' : ''}" data-t="skip">${tour.arm ? `Bỏ ${L.length - i - 1} sự kiện?` : 'Điểm rẽ'}${icon('next', 14)}</button>`}<button class="chip ic" data-t="stop" aria-label="Dừng" title="Dừng">${icon('stop', 16)}</button>`;
  if (fk) (b.querySelector<HTMLElement>(`[data-t="${fk}"]`) || b.querySelector<HTMLElement>(fk === 'next' ? '[data-t=resume]' : '[data-t=stop]'))?.focus({ preventScroll: true });
  const pb = $('#play')!;
  pb.innerHTML = icon(paused && paused !== 'card' ? 'play' : 'pause');
  pb.setAttribute('aria-label', paused === 'card' ? 'Đang chờ quyết định' : paused ? 'Chạy tiếp chương' : 'Tạm dừng chương');
}

/** Trò chơi: còn gì để tự chạy tiếp từ năm hiện tại (nút ▶ nhấp nháy sau khi dừng / tải lại). */
export const canResumeChapter = () => isPlay() && !tour && S.year < Y1 && !!S.picks[eraOf(S.year).id] && !pendingCard(S.year);
