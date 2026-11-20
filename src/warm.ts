import { allEv, evEra, S, optView } from './state';
import { ERAS, type Era } from './data';
import { recording } from './voice';
import { evKey, gateKey } from './speech';
import { eraMood, trackUrl, type Mood } from './music';
import { outFor } from './regional';
import { outVoiceKey } from './voiced';

/* Lời kể và nhạc cho lúc mất mạng (người đi đường, máy bay). Thẻ <audio> chỉ xin từng đoạn byte (206), service worker
   không lưu đoạn: khi một chương bắt đầu, tải trọn (200) các bản thu của chương ấy, lần lượt từng tệp, ưu tiên thấp, để
   service worker lưu vào 'voice-music' (lời kể) và 'music' (nhạc; vite.config.ts); lần sau thẻ <audio> được cắt đoạn từ
   bản đã lưu. Bỏ qua khi mất mạng, khi máy bật tiết kiệm dữ liệu, hay khi chưa có service worker (tải về mà không lưu được thì vô ích). */
const asked = new Set<string>();
let queue: Promise<void> = Promise.resolve();

/** Nhạc của các bản trước (music/<mood>.m4a, trước khi nhạc có bộ nhớ đệm riêng) còn nằm trong 'voice-music' mà không
    còn ai đọc tới: xoá một lần mỗi lần mở ứng dụng (~7 MB trên máy đã nghe đủ nhạc). */
let swept = false;
function sweep(): void {
  if (swept || !('caches' in window)) return;
  swept = true;
  void caches.has('voice-music').then(async has => {
    if (!has) return;
    const c = await caches.open('voice-music');
    for (const r of await c.keys()) if (/\/music\/[^/]+\.m4a$/.test(r.url)) await c.delete(r);
  }).catch(() => { /* không đọc được bộ nhớ đệm: để đó */ });
}

function fetchAll(urls: string[]): void {
  const c = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (!navigator.onLine || c?.saveData || !navigator.serviceWorker?.controller) return;
  const todo = urls.filter(u => !asked.has(u));
  todo.forEach(u => asked.add(u));
  if (!todo.length) return;
  queue = queue.then(async () => {
    await new Promise(r => setTimeout(r, 4000)); // để bản thu của bước đầu tải trước
    for (const u of todo) {
      if (!navigator.onLine) { asked.delete(u); continue; }
      try { await (await fetch(u, { priority: 'low' } as RequestInit)).arrayBuffer(); } catch { asked.delete(u); }
    }
  });
}

/** Chương `e` bắt đầu (tour): các bước tour trước (`first`), rồi mọi sự kiện khác của chương, lời dẫn điểm rẽ kế và các
    kết cục của nó (đúng câu dòng họ này sẽ nghe: theo quê, nói từ xứ người), nhạc của chương. */
export function warmEra(e: Era, first: string[] = []): void {
  sweep();
  const nx = ERAS[ERAS.indexOf(e) + 1];
  const keys = S.narr ? [...first, ...allEv().filter(v => evEra(v) === e).map(evKey), ...(nx ? [gateKey(nx), ...nx.opts.map(o => { const x = optView.of(o); return outVoiceKey(x.id, outFor(x)); })] : [])] : [];
  const urls = keys.map(recording).filter((u): u is string => !!u);
  // chương cuối: cả hai bản nhạc khép (kết cục chưa biết), màn kết tới ngay sau chương ấy
  if (S.sound && S.music) urls.push(...([eraMood(e.id), 'gate', 'calm', ...(nx ? [] : ['finale', 'elegy'])] as Mood[]).map(trackUrl));
  fetchAll([...new Set(urls)]);
}
/** Tải sẵn các bản thu `keys` (khoá không có bản thu thì bỏ qua), khi giọng đọc đang bật. */
export function warmKeys(keys: (string | undefined)[]): void {
  if (S.narr) fetchAll([...new Set(keys.map(recording).filter((u): u is string => !!u))]);
}
