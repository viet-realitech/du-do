import { WIKI, type HistEvent } from './data';
import { PORTRAIT } from './data/portraits';

/* ---------- figure portraits: curated Commons files (src/data/portraits.ts) ---------- */
const COMMONS = 'https://upload.wikimedia.org/wikipedia/commons/';
const portraitUrl = (p: string) => (p[0] === 'T' ? 'https://thumb.wikimedia.org/wikipedia/commons/thumb/' : COMMONS) + p.slice(1);

export const FIGIMG: Record<string, string> = Object.fromEntries(Object.entries(PORTRAIT).map(([id, [p]]) => [id, portraitUrl(p)]));

/** Commons description page for a figure's portrait, for the credit link. */
export function figImgPage(id: string): string {
  const p = PORTRAIT[id][0].split('/');
  return 'https://commons.wikimedia.org/wiki/File:' + p[p.length - 1].replace(/^330px-/, '');
}

/** Inline style that frames the face: "object-position + scale" about the same point. */
export function figFocus(id: string): string {
  const f = PORTRAIT[id];
  return f ? `object-position:${f[1]}% ${f[2]}%;transform:scale(${f[3]});transform-origin:${f[1]}% ${f[2]}%` : '';
}

/** fetch with a timeout so a stalled network falls back to placeholders instead of spinning forever. */
const fetchT = (u: string, ms = 10_000) => fetch(u, { signal: AbortSignal.timeout(ms) });

/** Preload an image; resolves false when it fails or is a broken/tiny placeholder. */
export function probe(url: string, minW = 40): Promise<boolean> {
  return new Promise(res => {
    const im = new Image();
    im.onload = () => res(im.naturalWidth >= minW);
    im.onerror = () => res(false);
    im.src = url;
  });
}

/* ---------- event articles & media ---------- */
export interface Media { type: 'image' | 'video'; thumb: string; src: string; file: string; cap: string | null; bad?: boolean }
export interface WikiInfo { title: string; url: string; ext: string | null; media: Media[]; en: string | null }

const WAPI = 'https://vi.wikipedia.org/w/api.php?format=json&origin=*&action=query&redirects=1&prop=pageimages|extracts|langlinks|info&inprop=url&piprop=original|thumbnail|name&pithumbsize=960&exintro=1&explaintext=1&exsentences=3&lllang=en';

/* Mạng chập chờn (iPad ngoài trời, trên tàu): một lần tải hỏng không được giữ cả phiên. Kết quả hỏng vì mạng (không phải
   "không có bài") chỉ nhớ RETRY_MS; quá hạn, hay khi máy có mạng trở lại (sự kiện 'online'), lần mở sau tải lại. Không thử
   lại ngay mỗi lần mở: mạng treo chứ không đứt thì mỗi lần thử lại phải chờ tới 10 s. */
export const RETRY_MS = 45_000;
/** Lúc máy có mạng trở lại gần nhất (ms, Date.now). */
let onlineAt = 0;
const backOnline: (() => void)[] = [];
/** Gọi `f` mỗi khi máy có mạng trở lại (sau khi các kết quả hỏng đã hết hạn). */
export const onOnline = (f: () => void): void => { backOnline.push(f); };
if (typeof window !== 'undefined') addEventListener('online', () => { onlineAt = Date.now(); backOnline.forEach(f => { try { f(); } catch { /* một nơi hỏng không chặn nơi khác */ } }); });
/** Một lần hỏng lúc `t` (ms) đã hết hạn: quá RETRY_MS, hay có mạng trở lại sau đó. */
export const expired = (t: number): boolean => Date.now() - t > RETRY_MS || t <= onlineAt;

/** Bài của một sự kiện: lời hứa kết quả; `failAt` khi lần tải này hỏng vì mạng / máy chủ (bài trọn hay thiếu ảnh). */
interface Entry { p: Promise<WikiInfo | null>; failAt?: number }
const wcache: Partial<Record<string, Entry>> = {};
/** Ảnh tải hỏng (đánh dấu `bad`): lúc hỏng, để gỡ dấu khi hết hạn. */
const badAt = new Map<Media, number>();

/** Đánh dấu một ảnh tải hỏng: bỏ khỏi dải ảnh, trình xem ảnh, nhưng chỉ tới khi hết hạn (mạng chập chờn) rồi thử lại. */
export function markBad(m: Media): void { m.bad = true; badAt.set(m, Date.now()); }
/** Gỡ dấu hỏng đã hết hạn của các ảnh trong bài. */
function heal(w: WikiInfo | null): void {
  if (w) for (const m of w.media) { const t = badAt.get(m); if (m.bad && t !== undefined && expired(t)) { delete m.bad; badAt.delete(m); } }
}

/** Lỗi mạng / máy chủ (không phải "không có bài"): HTTP lỗi, trang lỗi không phải JSON, hết giờ chờ. */
async function getJson(u: string): Promise<any> {
  const r = await fetchT(u);
  if (!r.ok) throw new Error('HTTP ' + r.status);
  return r.json();
}

async function wikiQuery(q: string): Promise<any> {
  const r = await getJson(WAPI + q);
  const pg = r.query && r.query.pages && Object.values<any>(r.query.pages)[0];
  return pg && pg.missing === undefined && !pg.invalid ? pg : null;
}

/** File title without namespace prefix, lower-cased, for de-duplication. */
const fileKey = (s: string) => decodeURIComponent(String(s)).replace(/_/g, ' ').replace(/^(File|Tập tin|Image|Hình):/i, '').trim().toLowerCase();

export const cachedWiki = (id: string): Promise<WikiInfo | null> | undefined => wcache[id]?.p.then(w => { heal(w); return w; });
/** Lần tải gần nhất của bài sự kiện `id` hỏng vì mạng (khác với "không tìm thấy bài"). */
export const wikiFailed = (id: string): boolean => wcache[id]?.failAt !== undefined;

/** Bài Wikipedia và ảnh của một sự kiện. Kết quả tốt và "không có bài" nhớ cả phiên; kết quả hỏng vì mạng nhớ tới khi hết
    hạn (expired). `again`: người chơi bấm Thử lại, tải lại ngay nếu lần trước hỏng. */
export function wikiFor(v: HistEvent, again = false): Promise<WikiInfo | null> {
  const hit = wcache[v.id];
  if (hit && !(hit.failAt !== undefined && (again || expired(hit.failAt)))) return hit.p.then(w => { heal(w); return w; });
  const e: Entry = { p: Promise.resolve(null) };
  const fail = () => { e.failAt = Date.now(); };
  e.p = (async () => {
    try {
      let pg = WIKI[v.id] ? await wikiQuery('&titles=' + encodeURIComponent(WIKI[v.id])) : null;
      if (!pg) pg = await wikiQuery('&generator=search&gsrlimit=1&gsrsearch=' + encodeURIComponent(v.t));
      if (!pg) return null;
      let media: Media[] = [];
      try {
        const m = await getJson('https://vi.wikipedia.org/api/rest_v1/page/media-list/' + encodeURIComponent(pg.title.replace(/ /g, '_')));
        media = (m.items || [])
          .filter((i: any) => (i.type === 'image' || i.type === 'video') && i.srcset && i.srcset.length && !/\.svg/i.test(i.title) &&
            !/(flag|cờ|icon|logo|coat_of_arms|huy_hiệu|emblem|seal)/i.test(i.title))
          .slice(0, 10)
          .map((i: any) => ({ type: i.type, thumb: 'https:' + i.srcset[0].src, src: 'https:' + i.srcset[i.srcset.length - 1].src, file: i.title, cap: i.caption && i.caption.text }));
      } catch { fail(); /* bài không có danh sách ảnh vẫn dùng được; lần mở sau (hết hạn) tải lại cho đủ ảnh */ }
      // Lead image at the 960px standard thumbnail; originals can be many MB.
      if (pg.pageimage && pg.thumbnail && !media.some(m => fileKey(m.file) === fileKey(pg.pageimage)))
        media.unshift({ type: 'image', thumb: pg.thumbnail.source, src: pg.thumbnail.source, file: 'File:' + pg.pageimage, cap: null });
      const en = (pg.langlinks && pg.langlinks[0] && pg.langlinks[0]['*']) || null;
      return { title: pg.title, url: pg.fullurl, ext: pg.extract || null, media, en };
    } catch {
      fail();
      return null;
    }
  })();
  wcache[v.id] = e;
  return e.p;
}

export const commonsPage = (m: Media) => 'https://commons.wikimedia.org/wiki/' + encodeURIComponent(m.file.replace(/ /g, '_'));
export const mediaCaption = (m: Media) =>
  m.cap || decodeURIComponent(m.file).replace(/_/g, ' ').replace(/^(File|Tập tin|Image|Hình):/i, '').replace(/\.[a-z0-9]+$/i, '');

/** Resolve a playable derivative (webm/mp4, prefer 480p/360p) for a Commons video file. */
export async function videoUrl(m: Media, small = false): Promise<string> {
  const r = await (await fetchT('https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&prop=videoinfo&viprop=url|derivatives&titles=' + encodeURIComponent(m.file))).json();
  const pg = Object.values<any>(r.query.pages)[0];
  const vi = pg.videoinfo && pg.videoinfo[0];
  if (!vi) throw new Error('no video');
  // chỉ các bản chuyển mã trình duyệt này phát được; lấy bản có chiều cao gần nhất với khung (360p cho khung nhỏ)
  const tv = document.createElement('video'), want = small ? 360 : 480;
  const der = ((vi.derivatives || []) as any[])
    // .mov 360p (mp4v) là bản Commons dành cho iOS cũ; chuỗi codecs="mp4v" không chuẩn nên thử thêm kiểu gốc
    .filter(x => /^video\/(webm|mp4|quicktime)/.test(x.type || '') && (tv.canPlayType(x.type) !== '' || (/^video\/quicktime/.test(x.type) && tv.canPlayType('video/quicktime') !== '')))
    .map(x => ({ x, h: +x.height || +(String(x.transcodekey || '').match(/(\d+)p/)?.[1] || 0) }))
    .sort((a, b) => Math.abs(a.h - want) - Math.abs(b.h - want))[0]?.x;
  if (der?.src) return der.src;
  if (small) throw new Error('no playable small derivative'); // khung nhỏ: không tải bản gốc nặng
  return vi.url;
}
