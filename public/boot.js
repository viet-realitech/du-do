// Apply the saved theme before first paint (the app bundle loads after this). No saved theme: the CSS default (:root) is Lưu trữ.
try {
  var mode = localStorage.getItem('dudo-mode') === 'play' ? 'dudo-v2-play' : 'dudo-v2';
  var s = JSON.parse(localStorage.getItem(mode) || '{}');
  if (s.theme) document.documentElement.dataset.theme = s.theme;
} catch (e) { /* private mode / bản lưu hỏng: màn khôi phục bên dưới lo */ }

/* Lưới an toàn lúc khởi động. Chạy trước mã ứng dụng (một script thường, không phải mô-đun), nên vẫn chạy khi mã ứng
   dụng hỏng ngay lúc nạp (bản lưu đọc lúc nạp: `S = load()`), khi tải không được, hay khi bản đồ chính không vẽ được.
   Khi ấy hiện màn khôi phục bằng lời thường: Thử lại, Sao chép bản lưu hỏng, Bắt đầu lại (hỏi lại trước khi xoá). Luôn cất
   một bản sao bản lưu trước ('dudo-save-broken-<n>', tối đa 3 bản), không xoá gì khi chưa được đồng ý.
   Hợp đồng với mã ứng dụng (src/boot.ts, main.ts): started() lúc main.ts bắt đầu chạy, booted() khi phần đồng bộ của nó
   chạy hết, ready() khi bản đồ chính đã vẽ, fail() khi việc vẽ ấy hỏng; state.ts gọi keep() / rescue('save') khi bản lưu
   không đọc được. Sau ready() lỗi chỉ được ghi vào sổ lỗi trên máy, không còn mở màn khôi phục. */
(function () {
  var KEEP = 'dudo-save-broken-', MAXKEEP = 3;
  var started = false, booted = false, ready = false, box = null, why = '', slot = '', errs = [], hang = 0;
  var B = window.dudoBoot = {};

  function slotKey() { try { return localStorage.getItem('dudo-mode') === 'play' ? 'dudo-v2-play' : 'dudo-v2'; } catch (e) { return 'dudo-v2'; } }
  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }

  /** Ghi một dòng vào sổ lỗi trên máy: qua errlog.ts nếu nó đã nạp (B.sink), không thì ghi thẳng (cùng dạng dòng). */
  function note(m) {
    try {
      if (B.sink) { B.sink(m); return; }
      var a = JSON.parse(get('dudo-errlog') || '[]');
      if (Object.prototype.toString.call(a) !== '[object Array]') a = [];
      a.push({ t: new Date().toISOString(), m: String(m).slice(0, 300), b: 'khởi động' });
      while (a.length > 20) a.shift();
      localStorage.setItem('dudo-errlog', JSON.stringify(a));
    } catch (e) { /* không bao giờ ném lỗi từ đây */ }
  }

  /** Các bản sao đã cất, cũ trước mới sau: { n, t, key, why, raw }. */
  function kept() {
    var out = [];
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (!k || k.indexOf(KEEP) !== 0 || !/^\d+$/.test(k.slice(KEEP.length))) continue;
        try { var o = JSON.parse(localStorage.getItem(k)); if (o && typeof o === 'object') { o.n = +k.slice(KEEP.length); out.push(o); } } catch (e) { /* bỏ qua */ }
      }
    } catch (e) { /* riêng tư */ }
    return out.sort(function (a, b) { return a.n - b.n; });
  }

  /** Cất một bản sao của bản lưu `key` (cùng nội dung với một bản đã cất thì thôi); trả số thứ tự, 0 nếu không cất được. */
  function keep(key, reason) {
    try {
      var raw = get(key), list = kept();
      if (raw === null) return 0;
      for (var i = 0; i < list.length; i++) if (list[i].raw === raw) return list[i].n;
      var n = list.length ? list[list.length - 1].n + 1 : 1;
      var rec = JSON.stringify({ t: new Date().toISOString(), key: key, why: String(reason || ''), raw: raw });
      // giữ tối đa MAXKEEP bản (bỏ bản cũ nhất); bộ nhớ đầy thì bỏ thêm bản cũ rồi thử lại
      while (list.length >= MAXKEEP) localStorage.removeItem(KEEP + list.shift().n);
      for (;;) {
        try { localStorage.setItem(KEEP + n, rec); break; } catch (e) { if (!list.length) return 0; localStorage.removeItem(KEEP + list.shift().n); }
      }
      note('Đã cất bản sao bản lưu ' + key + ' (' + KEEP + n + '): ' + reason);
      return n;
    } catch (e) { return 0; }
  }

  /** Chữ để dán vào tin nhắn: lý do, lỗi, máy, bản sao mới nhất. */
  function report() {
    var L = ['Dư Đồ · bản lưu hỏng', 'Lúc: ' + new Date().toISOString(), 'Vì sao: ' + (why === 'save' ? 'bản lưu không đọc được' : 'ứng dụng không mở được') + (started ? '' : ' (mã ứng dụng chưa chạy)')];
    var log = [];
    try { log = JSON.parse(get('dudo-errlog') || '[]'); } catch (e) { /* bỏ qua */ }
    var all = errs.concat((log && log.slice ? log.slice(-5) : []).map(function (r) { return (r.t || '') + ' [' + (r.b || '') + '] ' + r.m + (r.at ? ' @ ' + r.at : ''); }));
    L.push('Lỗi:'); L.push(all.length ? '  ' + all.join('\n  ') : '  không ghi được lỗi nào');
    L.push('Máy: ' + navigator.userAgent);
    var k = kept(), last = k[k.length - 1];
    if (last) L.push('Bản sao ' + KEEP + last.n + ' · ' + last.key + ' · ' + last.t + ' · ' + last.why, last.raw === null ? '(trống)' : String(last.raw));
    else L.push('Bản lưu ' + slot + ': ' + (get(slot) || '(trống)'));
    return L.join('\n');
  }

  var CSS = '#rescue{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;overflow:auto;'
    + 'padding:max(24px,env(safe-area-inset-top)) max(16px,env(safe-area-inset-right)) max(24px,env(safe-area-inset-bottom)) max(16px,env(safe-area-inset-left));'
    + 'background:#efe5cf;color:#2e2216;font:18px/1.45 "EB Garamond",Georgia,"Times New Roman",serif;-webkit-text-size-adjust:100%}'
    + '#rescue .rs{width:100%;max-width:520px;padding:28px 24px 24px;border:1px solid #6b5636;box-shadow:0 0 0 3px #efe5cf,0 0 0 4px #6b5636;background:#f4ecda}'
    + '#rescue .k{font:500 12px/1.2 ui-monospace,Menlo,monospace;letter-spacing:.14em;text-transform:uppercase;color:#7a6446}'
    + '#rescue h1{margin:10px 0 8px;font:600 28px/1.15 "EB Garamond",Georgia,serif}'
    + '#rescue p{margin:0 0 14px}#rescue .note{font-size:15.5px;color:#5c4a33;margin:16px 0 0}'
    + '#rescue .row{display:flex;flex-direction:column;gap:10px;margin-top:18px}'
    + '#rescue button{display:block;width:100%;box-sizing:border-box;margin:0;min-height:48px;padding:10px 16px;border:1px solid #6b5636;border-radius:3px;background:transparent;color:#2e2216;font:500 17px/1.2 "EB Garamond",Georgia,serif;cursor:pointer;-webkit-tap-highlight-color:transparent}'
    + '#rescue button.go{background:#2e2216;color:#f4ecda;border-color:#2e2216}#rescue button[disabled]{opacity:.6}'
    + '#rescue textarea{width:100%;height:140px;margin-top:12px;font:12px/1.4 ui-monospace,Menlo,monospace;color:#2e2216;background:#fff;border:1px solid #b9a580;box-sizing:border-box}'
    + '#rescue .ask{margin-top:18px;padding-top:14px;border-top:1px solid #cbb994}';

  function el(tag, attrs, text) {
    var e = document.createElement(tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (text) e.textContent = text;
    return e;
  }

  /** Màn khôi phục. why: 'save' (bản lưu `key` không đọc được) hay 'start' (ứng dụng không mở được). */
  function show(w, key, msg) {
    if (box) return;
    if (!document.body) { document.addEventListener('DOMContentLoaded', function () { show(w, key, msg); }); return; }
    why = w; slot = key || slotKey();
    if (msg) errs.push(String(msg).slice(0, 300));
    keep(slot, w === 'save' ? 'không đọc được' : 'ứng dụng không mở được' + (msg ? ': ' + String(msg).slice(0, 120) : ''));
    // chưa có ván nào trên máy (lần mở đầu tiên): không nói tới bản sao, không có gì để xoá
    var has = get(slot) !== null;
    note('Màn khôi phục: ' + (w === 'save' ? 'bản lưu ' + slot + ' không đọc được' : 'ứng dụng không mở được') + (msg ? ' (' + String(msg).slice(0, 160) + ')' : ''));
    var st = el('style', { id: 'rescue-css' }); st.textContent = CSS; document.head.appendChild(st);
    box = el('div', { id: 'rescue', role: 'alertdialog', 'aria-modal': 'true', 'aria-labelledby': 'rescue-h', 'aria-describedby': 'rescue-p' });
    var c = el('div', { class: 'rs' });
    c.appendChild(el('div', { class: 'k' }, 'Dư Đồ'));
    c.appendChild(el('h1', { id: 'rescue-h', tabindex: '-1' }, w === 'save' ? 'Bản lưu bị hỏng' : 'Dư Đồ chưa mở được'));
    c.appendChild(el('p', { id: 'rescue-p' }, w === 'save'
      ? 'Bản lưu trên máy này không đọc được nên ván của bạn chưa mở ra được. Dư Đồ đã cất riêng một bản sao của nó, chưa xoá gì cả.'
      : has ? 'Lần mở này gặp trục trặc. Ván đang chơi vẫn nằm trên máy, và Dư Đồ đã cất thêm một bản sao để phòng.'
        : 'Lần mở này gặp trục trặc. Hãy thử lại sau giây lát.'));
    var row = el('div', { class: 'row' });
    var retry = el('button', { type: 'button', class: 'go', 'data-r': 'retry' }, 'Thử lại');
    var copy = el('button', { type: 'button', 'data-r': 'copy' }, has ? 'Sao chép bản lưu hỏng' : 'Sao chép báo cáo lỗi');
    var reset = el('button', { type: 'button', 'data-r': 'reset' }, 'Bắt đầu lại');
    row.appendChild(retry); row.appendChild(copy); if (has) row.appendChild(reset);
    c.appendChild(row);
    c.appendChild(el('p', { class: 'note' }, has
      ? 'Thử lại vẫn không được thì chép bản lưu hỏng, gửi kèm khi báo lỗi để có thể khôi phục ván. Bắt đầu lại sẽ xoá ván đang lưu; bản sao đã cất vẫn còn.'
      : 'Thử lại vẫn không được thì chép báo cáo này, gửi kèm khi báo lỗi.'));
    box.appendChild(c);
    document.body.appendChild(box);
    var app = document.getElementById('app');
    if (app) { app.inert = true; app.setAttribute('aria-hidden', 'true'); }
    retry.onclick = function () { again(retry); };
    copy.onclick = function () { copyOut(copy, c); };
    reset.onclick = function () { ask(c, row, reset); };
    try { retry.focus(); } catch (e) { /* bỏ qua */ }
  }

  /** Thử lại: có bản ứng dụng mới đang chờ (service worker) thì cho nó nắm quyền trước, rồi tải lại trang. */
  function again(btn) {
    btn.disabled = true; btn.textContent = 'Đang mở lại…';
    var gone = false;
    function go() { if (!gone) { gone = true; location.reload(); } }
    setTimeout(go, 5000);
    try {
      var sw = navigator.serviceWorker;
      if (!sw || !sw.getRegistration) { go(); return; }
      sw.getRegistration().then(function (r) {
        if (!r) { go(); return; }
        var upd = r.update ? r.update().catch(function () { /* mất mạng */ }) : Promise.resolve();
        return upd.then(function () {
          var w = r.waiting;
          if (!w) { go(); return; }
          sw.addEventListener('controllerchange', go);
          w.postMessage({ type: 'SKIP_WAITING' });
        });
      }).catch(go);
    } catch (e) { go(); }
  }

  function copyOut(btn, c) {
    var text = report();
    function manual() {
      var ta = c.querySelector('textarea') || el('textarea', { 'aria-label': 'Bản lưu hỏng' });
      ta.value = text;
      if (!ta.parentNode) c.appendChild(ta);
      try { ta.focus(); ta.select(); ta.setSelectionRange(0, text.length); document.execCommand('copy'); } catch (e) { /* tự chép */ }
      btn.textContent = 'Đã chọn sẵn, giữ để sao chép';
    }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { btn.textContent = 'Đã sao chép'; }, manual);
        return;
      }
    } catch (e) { /* chép tay */ }
    manual();
  }

  function ask(c, row, reset) {
    reset.disabled = true;
    var a = el('div', { class: 'ask', role: 'group', 'aria-labelledby': 'rescue-q' });
    a.appendChild(el('p', { id: 'rescue-q' }, 'Xoá ván đang lưu và bắt đầu từ đầu? Bản sao đã cất vẫn được giữ.'));
    var r2 = el('div', { class: 'row' });
    var yes = el('button', { type: 'button', class: 'go', 'data-r': 'wipe' }, 'Xoá và bắt đầu lại');
    var no = el('button', { type: 'button', 'data-r': 'keep' }, 'Thôi');
    r2.appendChild(yes); r2.appendChild(no); a.appendChild(r2);
    row.parentNode.insertBefore(a, row.nextSibling);
    yes.onclick = function () {
      keep(slot, 'trước khi bắt đầu lại');
      try { localStorage.removeItem(slot); localStorage.setItem('dudo-mode', slot === 'dudo-v2-play' ? 'play' : 'read'); } catch (e) { /* riêng tư */ }
      note('Bắt đầu lại: đã xoá ' + slot);
      location.reload();
    };
    no.onclick = function () { a.remove(); reset.disabled = false; reset.focus(); };
    no.focus(); // như hộp xoá ván của Hồ sơ: tiêu điểm vào nút an toàn
  }

  B.started = function () { started = true; };
  B.booted = function () { booted = true; };
  B.ready = function () {
    ready = true;
    // màn khôi phục vì chờ quá lâu mà rồi ứng dụng vẫn mở được: cất màn đi
    if (box && hang) { box.remove(); box = null; var app = document.getElementById('app'); if (app) { app.inert = false; app.removeAttribute('aria-hidden'); } }
  };
  B.fail = function (msg) { if (!ready) show('start', '', msg); };
  B.rescue = function (w, key, msg) { show(w, key, msg); };
  B.keep = keep;
  B.kept = kept;
  B.note = note;

  // lỗi trước khi bản đồ vẽ xong: nhớ lại để báo cáo (errlog.ts cũng ghi sổ); màn khôi phục do các kiểm tra dưới đây quyết
  addEventListener('error', function (ev) {
    if (ready || !(ev instanceof ErrorEvent)) return;
    errs.push(String(ev.message || ev.error).slice(0, 300) + (ev.filename ? ' @ ' + ev.filename.split('/').pop() + ':' + ev.lineno : ''));
  });
  addEventListener('unhandledrejection', function (ev) {
    if (ready) return;
    var r = ev.reason;
    errs.push('Promise: ' + String(r && r.message ? r.message : r).slice(0, 300));
  });
  // mã ứng dụng (mô-đun) chạy xong trước DOMContentLoaded; quá đó mà phần đồng bộ của main.ts chưa chạy hết thì nó đã hỏng
  // (lỗi lúc nạp, tải không được)
  document.addEventListener('DOMContentLoaded', function () {
    setTimeout(function () { if (!booted && !box) show('start', '', errs[0] || (started ? 'main.ts dừng giữa chừng' : 'mã ứng dụng không chạy')); }, 1200);
    // canh chừng: đã chạy mà bản đồ chính 25 s (lúc trang đang hiện) vẫn chưa vẽ được
    var vis = 0, t = setInterval(function () {
      if (ready || box) { clearInterval(t); return; }
      if (!document.hidden) vis++;
      if (vis >= 25) { clearInterval(t); hang = 1; show('start', '', 'bản đồ chính chưa vẽ được sau 25 giây'); }
    }, 1000);
  });
})();
