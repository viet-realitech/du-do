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

const WAPI = 'https://vi.wikipedia.org/w/api.php?format=json&origin=*&action=query&redirects=1&prop=pageimages|extracts|langlinks|info&inprop=url&piprop=original|thumbnail|name&pithumbsize=900&exintro=1&explaintext=1&exsentences=3&lllang=en';
const wcache: Partial<Record<string, Promise<WikiInfo | null>>> = {};

async function wikiQuery(q: string): Promise<any> {
  const r = await (await fetchT(WAPI + q)).json();
  const pg = r.query && r.query.pages && Object.values<any>(r.query.pages)[0];
  return pg && pg.missing === undefined && !pg.invalid ? pg : null;
}

/** File title without namespace prefix, lower-cased, for de-duplication. */
const fileKey = (s: string) => decodeURIComponent(String(s)).replace(/_/g, ' ').replace(/^(File|Tập tin|Image|Hình):/i, '').trim().toLowerCase();

export const cachedWiki = (id: string): Promise<WikiInfo | null> | undefined => wcache[id];

export function wikiFor(v: HistEvent): Promise<WikiInfo | null> {
  const hit = wcache[v.id];
  if (hit) return hit;
  return (wcache[v.id] = (async () => {
    try {
      let pg = WIKI[v.id] ? await wikiQuery('&titles=' + encodeURIComponent(WIKI[v.id])) : null;
      if (!pg) pg = await wikiQuery('&generator=search&gsrlimit=1&gsrsearch=' + encodeURIComponent(v.t));
      if (!pg) return null;
      let media: Media[] = [];
      try {
        const m = await (await fetchT('https://vi.wikipedia.org/api/rest_v1/page/media-list/' + encodeURIComponent(pg.title.replace(/ /g, '_')))).json();
        media = (m.items || [])
          .filter((i: any) => (i.type === 'image' || i.type === 'video') && i.srcset && i.srcset.length && !/\.svg/i.test(i.title) &&
            !/(flag|cờ|icon|logo|coat_of_arms|huy_hiệu|emblem|seal)/i.test(i.title))
          .slice(0, 10)
          .map((i: any) => ({ type: i.type, thumb: 'https:' + i.srcset[0].src, src: 'https:' + i.srcset[i.srcset.length - 1].src, file: i.title, cap: i.caption && i.caption.text }));
      } catch { /* article text without media is still useful */ }
      if (pg.pageimage && pg.thumbnail && !media.some(m => fileKey(m.file) === fileKey(pg.pageimage)))
        media.unshift({ type: 'image', thumb: pg.thumbnail.source, src: (pg.original && pg.original.source) || pg.thumbnail.source, file: 'File:' + pg.pageimage, cap: null });
      const en = (pg.langlinks && pg.langlinks[0] && pg.langlinks[0]['*']) || null;
      return { title: pg.title, url: pg.fullurl, ext: pg.extract || null, media, en };
    } catch {
      return null;
    }
  })());
}

export const commonsPage = (m: Media) => 'https://commons.wikimedia.org/wiki/' + encodeURIComponent(m.file.replace(/ /g, '_'));
export const mediaCaption = (m: Media) =>
  m.cap || decodeURIComponent(m.file).replace(/_/g, ' ').replace(/^(File|Tập tin|Image|Hình):/i, '').replace(/\.[a-z0-9]+$/i, '');

/** Resolve a playable derivative (webm/mp4, prefer 480p/360p) for a Commons video file. */
export async function videoUrl(m: Media): Promise<string> {
  const r = await (await fetchT('https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&prop=videoinfo&viprop=url|derivatives&titles=' + encodeURIComponent(m.file))).json();
  const pg = Object.values<any>(r.query.pages)[0];
  const vi = pg.videoinfo && pg.videoinfo[0];
  if (!vi) throw new Error('no video');
  const der = (vi.derivatives || [])
    .filter((x: any) => /webm|mp4/.test(x.type || ''))
    .sort((a: any, b: any) => (/480|360/.test(b.transcodekey) ? 1 : 0) - (/480|360/.test(a.transcodekey) ? 1 : 0))[0];
  return (der && der.src) || vi.url;
}
