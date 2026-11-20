import { S } from '../state';
import { qstats } from './quality';
import { acState, warStats, warNew, setWarNew } from '../audio';
import { musicStats } from '../music';
import { vstats, voiceName } from '../narration';
import { swStats } from '../pwa';
import { errlog } from '../errlog';
import { keptSaves } from '../boot';

/* Bảng chẩn đoán trên máy (chỉ tải khi mở: ?debug, hay chạm 5 lần vào dòng phiên bản ở Hồ sơ → Giới thiệu; ứng dụng
   trên màn hình chính không thêm được ?debug). Một góc nhỏ kiểu "Bản đồ hồ sơ": khung hình, mức hiệu ứng và các lần
   chấm, âm thanh, lời kể, service worker, bộ nhớ, máy, lỗi gần nhất; nút "Sao chép báo cáo" để dán vào cuộc trò chuyện.
   Không gửi gì đi đâu. */

const CSS = `
#dbg { position: fixed; left: max(8px, env(safe-area-inset-left)); top: calc(env(safe-area-inset-top, 0px) + 8px); z-index: 100; width: min(380px, calc(100vw - 16px)); max-height: min(70vh, 560px); display: flex; flex-direction: column; background: var(--paper); color: var(--ink); border: 1px solid var(--neat); box-shadow: 0 0 0 2px var(--paper), 0 0 0 2.75px var(--neat), 0 10px 28px rgba(0, 0, 0, .3); font: 11px/1.45 var(--mono) }
#dbg header { display: flex; align-items: center; gap: 6px; padding: 6px 6px 5px 10px; border-bottom: .75px solid var(--rule); font: 500 10.5px/1.2 var(--serif); letter-spacing: .12em; text-transform: uppercase; color: var(--ink2) }
#dbg header b { flex: 1; font-weight: 600 }
#dbg header button { width: 30px; height: 26px; border: 1px solid var(--rule); border-radius: var(--r); color: var(--ink2); font: 500 14px/1 var(--mono) }
#dbg pre { margin: 0; padding: 8px 10px; overflow: auto; white-space: pre-wrap; word-break: break-word; font: inherit; flex: 1; min-height: 0 }
#dbg textarea { margin: 0 10px 8px; height: 120px; font: inherit; color: var(--ink); background: var(--paper); border: 1px solid var(--rule) }
#dbg .go, #dbg .ab { width: auto; flex: none; margin: 0 10px 10px; height: 38px; font-size: 15px }
#dbg.min pre, #dbg.min .go, #dbg.min .ab, #dbg.min textarea { display: none }
`;

let fps = 0, worst = 0, panel: HTMLElement | null = null, store = '', timer = 0;

function loop(): void {
  let n = 0, t0 = performance.now(), last = t0, w = 0;
  const f = (t: number) => {
    if (!panel) return;
    n++;
    w = Math.max(w, t - last);
    last = t;
    if (t - t0 >= 1000) { fps = Math.round((n * 1000) / (t - t0)); worst = Math.round(w); n = 0; w = 0; t0 = t; }
    requestAnimationFrame(f);
  };
  requestAnimationFrame(f);
}

async function readStorage(): Promise<void> {
  try {
    const st = navigator.storage;
    const p = st?.persisted ? await st.persisted() : undefined, e = st?.estimate ? await st.estimate() : undefined;
    const mb = (b?: number) => (b == null ? '?' : (b / 1048576).toFixed(1));
    store = `lưu bền ${p === undefined ? '?' : p ? 'có' : 'không'} · đã dùng ${mb(e?.usage)} / ${mb(e?.quota)} MB`;
  } catch { store = 'không đọc được'; }
}

/** Toàn bộ báo cáo (bảng hiện đúng chữ này, nút sao chép chép đúng chữ này). */
function report(): string {
  const safe = <T>(f: () => T, d: T): T => { try { return f(); } catch { return d; } };
  const q = safe(qstats, null), sw = safe(swStats, null), errs = safe(errlog, []);
  const sa = matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
  const rough = document.querySelector('#map > g > g')?.getAttribute('filter') ? 'bật' : 'tắt';
  const L = [
    `Dư Đồ ${__APP_VERSION__} · bản dựng ${__APP_BUILD__}`,
    `Giờ: ${new Date().toISOString()}`,
    `Khung hình: ${fps} fps (khung chậm nhất ${worst} ms) · vsync ${q ? q.vsync : '?'} ms`,
    q ? `Hiệu ứng: mức ${q.level} (${q.mode}${q.mode === 'auto' ? `, tự chỉnh ${q.auto}, mượt ${q.good} / chậm ${q.bad}` : ''}) · nét cổ trên bản đồ: ${rough}` : 'Hiệu ứng: ?',
    ...(q && q.log.length ? ['Các lần chấm (đoạn · số khung · p75 ms · tỉ lệ khung chậm · kết luận · mức):', ...q.log.map(j => `  ${(j.at / 1000).toFixed(0)}s ${j.tag || '-'} · ${j.n} · ${j.p75} · ${j.slow} · ${j.v} · ${j.q}`)] : ['Các lần chấm: chưa có']),
    `Giao diện: ${S.theme} · nét ${S.mstyle} · âm thanh ${S.sound ? 'bật' : 'tắt'} · nhạc ${S.music ? 'bật' : 'tắt'} · giọng đọc ${S.narr ? 'bật' : 'tắt'} · cảnh động ${S.fx ? 'bật' : 'tắt'}`,
    `AudioContext: ${safe(acState, '?')} · audioSession: ${safe(() => (navigator as Navigator & { audioSession?: { type: string } }).audioSession?.type || 'không có', '?')}`,
    safe(() => { const w = warStats(); return `Tiếng trận: kiểu ${w.kind} · nút sống ${w.live} (vị trí trái/phải ${w.pans}, nhiều nhất ${w.peakPans}) · tiếng vang ${w.verb ? 'có' : 'chưa'} · ${w.scenes} cảnh · nhạc ×${w.music}${w.dip ? ' (đang lùi)' : ''}`; }, 'Tiếng trận: ?'),
    `Nhạc: ${safe(musicStats, '?')}`,
    `Lời kể (bản thu): ${vstats.started} phát · ${vstats.refused} bị chặn · ${vstats.error} lỗi · giọng máy: ${safe(voiceName, '') || 'không có giọng tiếng Việt'}`,
    `Ứng dụng: ${sa ? 'màn hình chính (standalone)' : 'trình duyệt'} · ${navigator.onLine ? 'có mạng' : 'mất mạng'} · ${store || '…'}`,
    sw ? `Service worker: ${sw.supported ? `${sw.controlled ? 'đang phục vụ' : 'chưa phục vụ trang này'} · ${sw.active || 'không có'}${sw.waiting ? ' · bản mới đang chờ' : ''}${sw.installing ? ' · đang cài' : ''}${sw.pending ? ' · chờ lúc an toàn' : ''}${sw.lastCheck ? ` · kiểm tra ${sw.lastCheck}` : ''}` : 'không hỗ trợ'}` : 'Service worker: ?',
    safe(() => { const k = keptSaves(), l = k[k.length - 1]; return `Bản lưu: phiên bản ${S.v} · bản sao hỏng đã cất: ${k.length}${l ? ` (mới nhất ${l.t}, ${l.key}, ${l.why})` : ''}`; }, 'Bản lưu: ?'),
    `Máy: ${navigator.userAgent}`,
    `DPR ${devicePixelRatio} · khung nhìn ${innerWidth}×${innerHeight} · màn hình ${screen.width}×${screen.height}`,
    `Lỗi gần nhất (${errs.length}):`,
    ...(errs.length ? errs.slice().reverse().map(e => safe(() => `  ${e.t} [${e.b}]${e.n && e.n > 1 ? ` ×${e.n}` : ''} ${e.m}${e.at ? ` @ ${e.at}` : ''}`, '  ?')) : ['  không có']),
  ];
  return L.join('\n');
}

/** Báo cáo, không bao giờ ném lỗi: bảng không bao giờ trống. */
function safeReport(): string {
  try { return report(); } catch (e) { return `Dư Đồ ${__APP_VERSION__} · bản dựng ${__APP_BUILD__}\nKhông dựng được báo cáo: ${String(e)}`; }
}

function paint(): void {
  const pre = panel?.querySelector('pre');
  if (pre && !panel!.classList.contains('min')) pre.textContent = safeReport();
}

/** Bản sao bản lưu hỏng mới nhất (màn khôi phục, hay bản lưu đã được sửa lúc mở), để dán vào cuộc trò chuyện. */
function keptText(): string {
  const k = keptSaves(), l = k[k.length - 1];
  return l ? `Dư Đồ · bản lưu hỏng ${l.n} · ${l.key} · ${l.t} · ${l.why}\n${l.raw ?? '(trống)'}` : '';
}

async function copy(btn: HTMLButtonElement, text = safeReport(), label = 'Sao chép báo cáo'): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    btn.textContent = 'Đã sao chép';
    setTimeout(() => { btn.textContent = label; }, 2000);
  } catch {
    // không có quyền chép: hiện ô chữ đã chọn sẵn để tự chép
    panel?.querySelector('textarea')?.remove();
    const ta = document.createElement('textarea');
    ta.readOnly = true;
    ta.value = text;
    btn.before(ta);
    ta.focus();
    ta.select();
    try { document.execCommand('copy'); } catch { /* tự chép */ }
    btn.textContent = 'Chọn sẵn: giữ để sao chép';
  }
}

export function openDebug(): void {
  try { sessionStorage.setItem('dudo-debug', '1'); } catch { /* riêng tư */ }
  if (panel) { panel.classList.remove('min'); paint(); return; }
  if (!document.getElementById('dbg-css')) {
    const st = document.createElement('style');
    st.id = 'dbg-css';
    st.textContent = CSS;
    document.head.appendChild(st);
  }
  const p = panel = document.createElement('section');
  p.id = 'dbg';
  p.setAttribute('aria-label', 'Chẩn đoán');
  p.innerHTML = `<header><b>Chẩn đoán</b><button type="button" data-d="min" aria-label="Thu gọn">–</button><button type="button" data-d="x" aria-label="Đóng">×</button></header><pre></pre><button type="button" class="btn go">Sao chép báo cáo</button>${keptSaves().length ? '<button type="button" class="btn go kept">Sao chép bản lưu hỏng</button>' : ''}<button type="button" class="btn ab"></button>`;
  // nghe so sánh tiếng trận cũ / mới trên máy thật (nhớ trên máy này, không vào bản lưu)
  const ab = p.querySelector<HTMLButtonElement>('.ab')!, abShow = () => { ab.textContent = warNew() ? 'Nghe tiếng trận kiểu cũ' : 'Nghe tiếng trận kiểu mới'; };
  abShow();
  p.addEventListener('click', ev => {
    ev.stopPropagation();
    const d = (ev.target as HTMLElement).closest<HTMLElement>('[data-d]')?.dataset.d;
    if (d === 'min') { p.classList.toggle('min'); paint(); }
    else if (d === 'x') { closeDebug(); }
    else if ((ev.target as HTMLElement).closest('.ab')) { setWarNew(!warNew()); abShow(); paint(); }
    else if ((ev.target as HTMLElement).closest('.kept')) void copy(p.querySelector<HTMLButtonElement>('.kept')!, keptText(), 'Sao chép bản lưu hỏng');
    else if ((ev.target as HTMLElement).closest('.go')) void copy(p.querySelector<HTMLButtonElement>('.go')!);
  });
  document.body.appendChild(p);
  loop();
  void readStorage();
  paint();
  let n = 0;
  timer = window.setInterval(() => { if (++n % 10 === 0) void readStorage(); paint(); }, 1000);
}

function closeDebug(): void {
  clearInterval(timer);
  panel?.remove();
  panel = null;
  try { sessionStorage.removeItem('dudo-debug'); } catch { /* riêng tư */ }
}
