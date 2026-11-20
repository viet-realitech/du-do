import { ENDINGS, rarityOf, vnNum, type Ending } from '../data/endings';
import { SURNAMES, surnameKey } from '../data/surnames';
import { SPECIAL } from '../data/cards2';
import { HOMES } from '../play';
import { S, archive, liveRun, clearArchive, familyName, ARC_MAX, type Archive, type ArcRun } from '../state';
import { mood, finaleFor, type Mood } from '../music';
import { on } from '../ui/actions';
import { esc, layer, sheet, ghost, toast } from '../ui/dom';
import { openPast } from './ending';
import { paneMe } from './profile';
import './ledger.css';

/* Sổ kết cục (Hồ sơ): mười lăm dấu kết cục theo đúng thứ tự xét (endings.ts endingOf: kết cục đầu tiên khớp là kết cục
   của dòng họ), dấu đã gặp đóng son và đếm số lần, dấu chưa gặp chỉ có nét viền và một gợi ý "chưa gặp" (điều kiện của
   nó, không phải lời hứa: một dấu xếp trước có thể đến trước). Dưới lưới là các dòng họ đã khép hồ sơ trên máy này; chạm
   để mở lại hồ sơ, chỉ xem (ending.ts openPast). Màn kết có thêm hai gợi ý "Ván sau, thử…" dẫn tới thứ chưa gặp. */

/** "20.11.2026" */
export function arcDate(iso: string): string {
  const d = new Date(iso);
  return isNaN(+d) ? '' : `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`;
}

/** Số lần gặp mỗi kết cục: hồ sơ còn trong sổ và hồ sơ đã rời sổ vì sổ đầy. */
function tally(a: Archive): Record<string, number> {
  const n: Record<string, number> = { ...a.gone };
  for (const r of a.runs) n[r.end] = (n[r.end] || 0) + 1;
  return n;
}

/* Gợi ý cho dấu chưa gặp: luật "vì sao" của kết cục (endings.ts), viết lại chỗ đọc không xuôi khi đứng một mình. */
const HINT: Record<string, string> = {
  doiho: 'Dòng họ đổi họ ít nhất một lần qua một biến cố riêng. Biến cố như vậy chỉ đến trong một số hoàn cảnh: theo một số hướng, ở một số quê, hay với một số họ.',
  doimoi: 'Đời thứ năm theo miền Bắc, đời thứ sáu theo Đổi Mới, và con đường không khớp dấu nào xếp trước trong sổ.',
};
/** Đọc sử không có thẻ sự kiện: rời nước chỉ có một đường, đời thứ sáu chọn Ra đi. */
const HINT_READ: Record<string, string> = {
  xanam: 'Đời thứ năm theo miền Nam, đời thứ sáu chọn Ra đi.',
  xabac: 'Đời thứ năm theo miền Bắc, đời thứ sáu chọn Ra đi.',
  xagiua: 'Đời thứ năm theo thành phần thứ ba, đời thứ sáu chọn Ra đi.',
};
export function hintOf(e: Ending, mode: 'read' | 'play'): string {
  if (mode === 'play') return HINT[e.id] ?? e.why;
  const h = HINT_READ[e.id] ?? HINT[e.id] ?? e.whyRead ?? e.why;
  return e.play ? `Chỉ có ở Trò chơi. ${h}` : h;
}
const FIRST = 'Mỗi dòng họ chỉ nhận một kết cục: sổ xét lần lượt từ dấu số 1, dấu đầu tiên khớp với con đường là kết cục của dòng họ. Đi theo gợi ý vẫn có thể gặp một dấu xếp trước.';

const MODE = { read: 'Đọc sử', play: 'Trò chơi' } as const;
const stamp = (t: string, off = false) => `<span class="sl${off ? ' off' : ''}">${esc(t)}</span>`;
/** Một dòng họ đã khép trong sổ: dấu, tên họ, kết cục, quê, luồng, ngày; chạm để mở lại hồ sơ. `bare`: trong hộp của
    một dấu (dấu đã ở trên đầu hộp, không lặp ở từng dòng). */
function runRow(r: ArcRun, mine: boolean, bare = false): string {
  // luồng và ngày không gãy dòng giữa chừng ("Trò / chơi")
  const e = ENDINGS.find(x => x.id === r.end), sub = [r.title || e?.title || '', r.home].filter(Boolean).map(esc).concat(`<span class="nw">${[MODE[r.mode], arcDate(r.at)].filter(Boolean).join(' · ')}</span>`).join(' · ');
  return `<li><button class="arc-run${bare ? ' bare' : ''}" data-a="arc-open" data-id="${esc(r.id)}">${bare ? '' : stamp(e?.seal || '—')}<span class="t"><b>${esc(r.name)}${mine ? ' <i>· ván này</i>' : ''}</b><span class="d">${sub}</span></span><span class="go" aria-hidden="true">›</span></button></li>`;
}

/** Trình duyệt trên iPhone, iPad, không mở từ màn hình chính: Safari có thể xoá dữ liệu của trang lâu ngày không mở. */
const iosTab = (): boolean => {
  try {
    const ios = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const sa = matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
    return ios && !sa;
  } catch { return false; }
};

/** Mục Sổ kết cục trong Hồ sơ. */
export function ledger(): string {
  const a = archive(), n = tally(a), met = ENDINGS.filter(e => n[e.id]).length, mine = liveRun(a)?.id;
  const cells = ENDINGS.map((e, i) => {
    const k = n[e.id] || 0;
    return `<li><button class="seal${k ? '' : ' off'}" data-a="arc-seal" data-id="${e.id}" aria-label="Dấu số ${i + 1}, ${esc(e.title)}: ${k ? `đã gặp ${k} lần` : 'chưa gặp'}"><span class="no">${i + 1}</span>${stamp(e.seal, !k)}<b>${esc(e.title)}</b><span class="n">${k ? (k > 1 ? `Gặp ${k} lần` : 'Đã gặp') : 'Chưa gặp'}</span></button></li>`;
  }).join('');
  const runs = a.runs.slice().reverse();
  return `<section class="ledg" aria-labelledby="ledh"><h3 id="ledh">Sổ kết cục · ${met}/${ENDINGS.length}</h3>
  <p class="muted small ledg-i">Mười lăm kết cục, mỗi dòng họ đi tới một. Dấu đã gặp đóng son; chạm vào một dấu để xem gợi ý hay mở lại hồ sơ.</p>
  <ol class="seals">${cells}</ol>
  ${runs.length ? `<div class="mono muted ledg-h">Các dòng họ đã khép hồ sơ · ${runs.length}</div><ol class="arc-runs">${runs.map(r => runRow(r, r.id === mine)).join('')}</ol>`
    : '<p class="muted small ledg-e">Chưa có dòng họ nào khép hồ sơ trên máy này. Đi hết sáu thế hệ, hồ sơ của dòng họ sẽ được cất vào đây.</p>'}
  <p class="muted small ledg-k">Sổ nằm trong bộ nhớ của trình duyệt trên máy này: chọn lại từ 1858 không xoá sổ, nhưng xoá dữ liệu trang web thì mất cả sổ.${iosTab() ? ' Safari có thể tự xoá dữ liệu của trang lâu ngày không mở; thêm Dư Đồ vào màn hình chính (nút Chia sẻ → Thêm vào MH chính) thì sổ được giữ lâu hơn.' : ''}</p>
  ${runs.length || Object.keys(a.gone).length ? '<button class="lnk ledg-x" data-a="arc-clear">Xoá sổ kết cục</button>' : ''}</section>`;
}

/** Một dấu: kết cục đã gặp (câu tóm, các dòng họ đã gặp nó) hay chưa gặp (gợi ý). */
on('arc-seal', el => {
  const i = ENDINGS.findIndex(x => x.id === el.dataset.id), e = ENDINGS[i];
  if (!e) return;
  const a = archive(), mine = liveRun(a)?.id, rs = a.runs.filter(r => r.end === e.id).reverse(), gone = a.gone[e.id] || 0, k = rs.length + gone;
  const rp = rarityOf(e.id, 'play'), rr = e.play ? undefined : rarityOf(e.id, 'read');
  const rar = [rp != null ? `${vnNum(rp)}% dòng họ trong mô phỏng của Trò chơi` : '', rr != null ? `${vnNum(rr)}% con đường ở Đọc sử` : ''].filter(Boolean).join(' · ');
  sheet(`<div class="mono muted">Sổ kết cục · dấu số ${i + 1}</div><div class="arc-dt">${stamp(e.seal, !k)}</div>
   <h2 style="margin:4px 0 8px">${esc(e.title)}</h2>
   ${k ? `<p class="arc-line">${esc(e.line)}</p><div class="mono muted ledg-h">${k > 1 ? `Đã gặp ${k} lần` : 'Đã gặp một lần'}</div>
     ${rs.length ? `<ol class="arc-runs">${rs.map(r => runRow(r, r.id === mine, true)).join('')}</ol>` : ''}
     ${gone ? `<p class="muted small" style="margin-top:8px">${gone} hồ sơ cũ hơn đã rời sổ (sổ giữ ${ARC_MAX} hồ sơ gần nhất); dấu vẫn được đếm.</p>` : ''}`
    : `<p class="arc-hint"><span class="mono">Chưa gặp</span> ${esc(hintOf(e, S.mode))}</p><p class="muted small">${FIRST}</p>`}
   ${rar ? `<p class="muted small" style="margin-top:10px">Độ hiếm: ${rar}.</p>` : ''}`, true, 'dlg');
});

/** Mở lại hồ sơ một dòng họ đã khép (từ danh sách hay từ một dấu). */
on('arc-open', el => { if (el.dataset.id) openPast(el.dataset.id); });

/** Hồ sơ mở lại vừa đóng (về Hồ sơ hay sang tab khác): nhạc của màn kết thôi, nhạc lúc mở (`was`: tour chương đang dừng
    thì nhạc của chương ấy, không phải nhạc Hồ sơ) trở lại; tiêu điểm về đúng dòng đã mở. */
export function backToLedger(id: string, was: Mood | null): void {
  const ov = layer.querySelector<HTMLElement>(':scope > .ov.end[data-ro]');
  if (!ov) return;
  const mo = new MutationObserver(() => {
    if (layer.contains(ov)) return;
    mo.disconnect();
    // 'finale' lúc mở là nhạc khép thường (hồ sơ vừa xem có thể đã đổi nó sang khúc trầm buồn: music.ts finaleFor)
    if (!layer.querySelector(':scope > .ov.end')) mood(was === 'finale' ? finaleFor() : was ?? 'calm');
    const row = layer.querySelector<HTMLElement>(`:scope > .pane .arc-runs [data-a="arc-open"][data-id="${CSS.escape(id)}"]`);
    if (row) { row.scrollIntoView({ block: 'center' }); row.focus({ preventScroll: true }); }
  });
  mo.observe(layer, { childList: true });
}

/** Xoá cả sổ: hỏi lại trước (nút Huỷ được chọn sẵn). */
on('arc-clear', () => {
  const a = archive(), n = a.runs.length;
  const d = sheet(`<div class="mono muted">Sổ kết cục</div><h2 style="margin:8px 0 6px">Xoá Sổ kết cục?</h2>
    <p class="muted" style="margin:0 0 16px">Các dấu kết cục đã gặp${n ? ` và hồ sơ của ${n} dòng họ đã khép` : ''} trên máy này sẽ mất; không hoàn tác được. Ván đang chơi, huy hiệu và cài đặt giữ nguyên.</p>
    <div class="row" style="gap:10px"><button class="btn ghost" data-a="reset-no">Huỷ</button><button class="btn" data-a="arc-clear-yes">Xoá sổ</button></div>`, true, 'dlg');
  d.querySelector<HTMLElement>('[data-a=reset-no]')!.focus();
});
on('arc-clear-yes', el => {
  clearArchive();
  const sc = el.closest<HTMLElement>('.scrim');
  if (sc) ghost(sc);
  if (layer.querySelector(':scope > .pane .ledg')) paneMe();
  toast('Đã xoá Sổ kết cục.');
});

/** Câu cho hộp xác nhận chọn lại từ 1858: sổ vẫn giữ (rỗng nếu sổ chưa có gì). */
export function keepLine(): string {
  const a = archive(), n = a.runs.length;
  if (!n) return '';
  return liveRun(a) ? `Hồ sơ đã khép của ${familyName()} vẫn ở lại trong Sổ kết cục${n > 1 ? `, cùng ${n - 1} hồ sơ khác` : ''}.` : `Sổ kết cục vẫn giữ ${n} hồ sơ đã khép.`;
}

/* ---------- Ván sau, thử… ---------- */
/** Họ ban đầu của một bản lưu (trước mọi lần đổi họ). */
const firstSurname = (s: Record<string, unknown>): string => {
  const ns = Array.isArray(s.names) ? s.names : [], n0 = ns[0] && typeof ns[0] === 'object' ? (ns[0] as { from?: unknown }).from : undefined;
  return typeof n0 === 'string' ? surnameKey(n0) : typeof s.surname === 'string' && s.surname ? s.surname : typeof s.name === 'string' ? surnameKey(s.name) : '';
};
/** Họ có biến cố riêng không kèm điều kiện nào khác (cards2.ts): chọn họ ấy là gặp. */
const ownEvent = () => SURNAMES.filter(s => SPECIAL.some(c => c.when.surnames?.includes(s.key) && Object.keys(c.when).length === 1));

/** Hai gợi ý cho ván sau, dẫn tới thứ dòng họ bạn chưa gặp: một kết cục chưa gặp (dễ gặp nhất trong mô phỏng, trừ "Còn
    lại tên họ": không gợi ý làm sa sút dòng họ; trừ kết cục cuối sổ, chỉ đến khi không khớp gì), rồi một quê ở vùng chưa
    chơi, một họ có biến cố riêng chưa chơi (Trò chơi), hay chính Trò chơi (Đọc sử). [lời dẫn, lời giải thích]. */
export function tips(a = archive()): [string, string][] {
  const mode = S.mode, n = tally(a), out: [string, string][] = [];
  const un = ENDINGS.filter(e => !n[e.id] && (mode === 'play' || !e.play) && e.id !== 'lytan' && e.id !== 'doimoi')
    .sort((x, y) => (rarityOf(y.id, mode) ?? 0) - (rarityOf(x.id, mode) ?? 0));
  const endTip = (e: Ending): [string, string] => [`Một kết cục chưa gặp: “${e.title}”.`, hintOf(e, mode)];
  if (un[0]) out.push(endTip(un[0]));
  const plays = a.runs.filter(r => r.mode === 'play').map(r => r.save);
  if (mode === 'play') {
    const homes = new Set([S.home, ...plays.map(s => s.home)]), regs = new Set(HOMES.filter(h => homes.has(h[0])).map(h => h[3]));
    const h = HOMES.find(x => !regs.has(x[3])) || HOMES.find(x => !homes.has(x[0]));
    const played = new Set([firstSurname(S as unknown as Record<string, unknown>), ...plays.map(firstSurname)]), sn = ownEvent().find(s => !played.has(s.key));
    if (h) out.push([`Một quê khác: ${h[1]}.`, 'Mỗi vùng có những sự kiện chạm tới chính quê ấy, nên dòng họ gặp những thẻ phải quyết khác.']);
    if (sn) out.push([`Một họ khác, như họ ${sn.names[0]}.`, 'Họ ấy có một biến cố riêng mà dòng họ bạn chưa gặp; chọn họ ở màn đầu, sau khi chọn lại từ 1858.']);
  } else if (!plays.length) out.push(['Trò chơi dòng họ (Hồ sơ → Luồng đang mở).', 'Chọn quê, giữ gia sản qua sáu thế hệ, quyết từng thẻ sự kiện; có thêm ba kết cục chỉ Trò chơi mới có.']);
  if (un[1]) out.push(endTip(un[1]));
  return out.slice(0, 2);
}

/** Mục "Ván sau, thử…" ở màn kết (dòng họ đang chơi vừa khép hồ sơ). */
export function nextTry(): string {
  const a = archive(), t = tips(a);
  return `<section class="end-next" aria-labelledby="nxh"><h2 id="nxh">Ván sau, thử…</h2>
   ${t.length ? `<ul>${t.map(([k, d]) => `<li><b>${esc(k)}</b> ${esc(d)}</li>`).join('')}</ul>` : ''}
   ${liveRun(a) ? `<p class="muted small">Hồ sơ của ${esc(familyName())} đã vào Sổ kết cục (Hồ sơ). Chọn lại từ 1858 không xoá sổ.</p>` : ''}</section>`;
}
