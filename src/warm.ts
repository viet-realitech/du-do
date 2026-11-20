import { allEv, evEra, S } from './state';
import { ERAS, type Era } from './data';
import { recording } from './voice';
import { evKey, gateKey, outKey } from './speech';
import { eraMood } from './music';

/* Lời kể và nhạc cho lúc mất mạng (người đi đường, máy bay). Thẻ <audio> chỉ xin từng đoạn byte (206), service worker
   không lưu đoạn: khi một chương bắt đầu, tải trọn (200) các bản thu của chương ấy, lần lượt từng tệp, ưu tiên thấp, để
   service worker lưu vào 'voice-music' (vite.config.ts); lần sau thẻ <audio> được cắt đoạn từ bản đã lưu. Bỏ qua khi
   mất mạng, khi máy bật tiết kiệm dữ liệu, hay khi chưa có service worker (tải về mà không lưu được thì vô ích). */
const asked = new Set<string>();
let queue: Promise<void> = Promise.resolve();

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
    kết cục của nó, nhạc của chương. */
export function warmEra(e: Era, first: string[] = []): void {
  const nx = ERAS[ERAS.indexOf(e) + 1];
  const keys = S.narr ? [...first, ...allEv().filter(v => evEra(v) === e).map(evKey), ...(nx ? [gateKey(nx), ...nx.opts.map(o => outKey(o.id))] : [])] : [];
  const urls = keys.map(recording).filter((u): u is string => !!u);
  if (S.sound && S.music) urls.push(...[eraMood(e.id), 'gate', 'calm'].map(m => `${import.meta.env.BASE_URL}music/${m}.m4a`));
  fetchAll([...new Set(urls)]);
}
