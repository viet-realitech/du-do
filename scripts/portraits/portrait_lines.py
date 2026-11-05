"""Print PORTRAIT entries for src/data/portraits.ts from thumbs meta + focus picks.
Usage: python3 -I scripts/portraits/portrait_lines.py out/thumbs/meta.json picks.json
picks.json: {id: [x, y, zoom]} (percent focus + scale); ids missing from picks get [50, 30, 1.4]; ids listed with null are skipped."""
import json, sys, urllib.parse

meta = json.load(open(sys.argv[1])); picks = json.load(open(sys.argv[2]))
for k, v in meta.items():
    if 'kind' not in v or picks.get(k, 0) is None: continue
    x, y, z = picks.get(k, [50, 30, 1.4])
    q = urllib.parse.quote(v['name'])
    path = f"{v['rel']}/{v.get('size', 330)}px-{q}" if v['kind'] == 'T' else v['rel']
    if v['kind'] == 'T' and v['name'].lower().endswith(('.svg', '.tif', '.tiff')): path += '.png'
    print(f"  {k}: ['{v['kind']}{path}', {x}, {y}, {z}],")
