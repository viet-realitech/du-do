"""Download 330px Commons thumbnails for figure portraits, honouring Retry-After on 429.
Usage: python3 -I scripts/portraits/fetch_thumbs.py scripts/portraits/new-figures.json out/thumbs   (images.json: {id: Commons file name})
Writes outdir/<id>.img (+ outdir/meta.json with path kind 'T' thumb / 'U' original, width, height)."""
import hashlib, json, os, sys, time, urllib.parse, urllib.request, urllib.error
from PIL import Image

UA = {'User-Agent': 'DuDoHistoryApp/1.0 (https://du-do-seven.vercel.app)'}
imgs = json.load(open(sys.argv[1])); out = sys.argv[2]; os.makedirs(out, exist_ok=True)
meta = json.load(open(f'{out}/meta.json')) if os.path.exists(f'{out}/meta.json') else {}

def fetch(u):
    for i in range(12):
        try:
            r = urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=40)
            return r.status, r.read()
        except urllib.error.HTTPError as e:
            if e.code == 429:
                ra = e.headers.get('Retry-After'); w = int(ra) + 3 if ra and ra.isdigit() else 45 + 15 * i
                print(f'  429, wait {w}s', flush=True); time.sleep(w); continue
            return e.code, None
        except Exception as ex:
            print('  err', ex, flush=True); time.sleep(15)
    return 0, None

for k, name in imgs.items():
    if k in meta: continue
    name = name.replace(' ', '_')
    m = hashlib.md5(name.encode('utf-8')).hexdigest(); q = urllib.parse.quote(name)
    rel = f'{m[0]}/{m[:2]}/{q}'
    st, data = fetch(f'https://upload.wikimedia.org/wikipedia/commons/thumb/{rel}/330px-{q}' + ('.png' if name.lower().endswith(('.svg', '.tif', '.tiff')) else ''))
    kind = 'T'
    if st != 200:  # too small to scale up (400) or other: take the original
        st, data = fetch(f'https://upload.wikimedia.org/wikipedia/commons/{rel}'); kind = 'U'
    if st != 200 or not data:
        print(k, name, 'FAIL', st, flush=True); meta[k] = {'name': name, 'fail': st}
    else:
        p = f'{out}/{k}.img'; open(p, 'wb').write(data)
        try: w, h = Image.open(p).size
        except Exception: w = h = 0
        meta[k] = {'name': name, 'kind': kind, 'w': w, 'h': h, 'rel': rel}
        print(k, name, kind, w, h, flush=True)
    json.dump(meta, open(f'{out}/meta.json', 'w'), ensure_ascii=False, indent=1)
    time.sleep(1.5)
print('done', sum(1 for v in meta.values() if 'kind' in v), '/', len(imgs))
