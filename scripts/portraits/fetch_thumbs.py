"""Download Commons thumbnails for figure portraits from thumb.wikimedia.org only (the host the app itself uses).
Tries 330px, then 250px and 120px (for originals narrower than the requested size). Never blocks on a long
Retry-After: an entry that gets a long 429 is left for a later run. Short Retry-After (<= 30 s) is honoured.
Usage: python3 -I scripts/portraits/fetch_thumbs.py scripts/portraits/new-figures.json out/thumbs   (images.json: {id: Commons file name})
Writes outdir/<id>.img and outdir/meta.json ({id: {name, kind 'T', size, w, h, rel}} or {name, fail})."""
import hashlib, json, os, sys, time, urllib.parse, urllib.request, urllib.error
from PIL import Image

UA = {'User-Agent': 'DuDoHistoryApp/1.0 (https://du-do-seven.vercel.app)'}
imgs = json.load(open(sys.argv[1])); out = sys.argv[2]; os.makedirs(out, exist_ok=True)
mp = f'{out}/meta.json'
meta = json.load(open(mp)) if os.path.exists(mp) else {}

def fetch(u):
    for i in range(4):
        try:
            r = urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=40)
            return r.status, r.read()
        except urllib.error.HTTPError as e:
            if e.code == 429:
                ra = e.headers.get('Retry-After')
                w = int(ra) if ra and ra.isdigit() else 60
                if w > 30: return 429, None
                time.sleep(w + 2); continue
            return e.code, None
        except Exception as ex:
            print('  err', ex, flush=True); time.sleep(10)
    return 0, None

deferred = 0
for k, name in imgs.items():
    if k in meta and 'kind' in meta[k]: continue
    name = name.replace(' ', '_')
    m = hashlib.md5(name.encode('utf-8')).hexdigest(); q = urllib.parse.quote(name)
    rel = f'{m[0]}/{m[:2]}/{q}'
    ext = '.png' if name.lower().endswith(('.svg', '.tif', '.tiff')) else ''
    got = None
    for size in (330, 250, 120):
        st, data = fetch(f'https://thumb.wikimedia.org/wikipedia/commons/thumb/{rel}/{size}px-{q}{ext}')
        if st == 200 and data: got = (size, data); break
        if st == 429: break
        if st == 404 and size == 330: break  # no such file on Commons
    if not got:
        if st == 429: deferred += 1; print(k, name, 'DEFERRED (429)', flush=True)
        else: meta[k] = {'name': name, 'fail': st}; print(k, name, 'FAIL', st, flush=True)
    else:
        size, data = got
        p = f'{out}/{k}.img'; open(p, 'wb').write(data)
        try: w, h = Image.open(p).size
        except Exception: w = h = 0
        meta[k] = {'name': name, 'kind': 'T', 'size': size, 'w': w, 'h': h, 'rel': rel}
        print(k, name, 'T', w, h, flush=True)
    json.dump(meta, open(mp, 'w'), ensure_ascii=False, indent=1)
    time.sleep(1.5)
print('done', sum(1 for v in meta.values() if 'kind' in v), '/', len(imgs), 'deferred', deferred, flush=True)
