"""Contact sheets from newfigs/thumbs2 (meta.json): 5 columns, 220px cells, id + name label, a 10% grid overlay
so face focus points (x%, y%) can be read off. Usage: python3 -I scripts/portraits/contact_sheets.py out/thumbs out/sheet"""
import json, sys, os
from PIL import Image, ImageDraw

d = sys.argv[1]; pref = sys.argv[2]
meta = json.load(open(f'{d}/meta.json'))
keys = [k for k, v in meta.items() if 'kind' in v and os.path.exists(f'{d}/{k}.img')]
W, H, cols, per = 220, 260, 5, 20
for part in range(0, len(keys), per):
    ks = keys[part:part + per]; rows = (len(ks) + cols - 1) // cols
    sheet = Image.new('RGB', (cols * W, rows * (H + 24)), 'white'); dr = ImageDraw.Draw(sheet)
    for i, k in enumerate(ks):
        x, y = (i % cols) * W, (i // cols) * (H + 24)
        try:
            im = Image.open(f'{d}/{k}.img').convert('RGB')
        except Exception:
            dr.text((x + 4, y + 4), 'BAD ' + k, fill='red'); continue
        # fit inside W×H keeping aspect; record scale so grid = % of the image
        s = min((W - 6) / im.width, (H - 6) / im.height); im = im.resize((max(1, int(im.width * s)), max(1, int(im.height * s))))
        ox, oy = x + 3, y + 3
        sheet.paste(im, (ox, oy))
        for g in range(1, 10):  # 10% grid
            gx = ox + im.width * g / 10; gy = oy + im.height * g / 10
            dr.line([(gx, oy), (gx, oy + im.height)], fill=(255, 0, 0) if g == 5 else (255, 160, 160), width=1)
            dr.line([(ox, gy), (ox + im.width, gy)], fill=(255, 0, 0) if g == 5 else (255, 160, 160), width=1)
        dr.text((x + 4, y + H + 4), f"{k} {meta[k]['kind']} {meta[k]['w']}x{meta[k]['h']} {meta[k]['name'][:22]}", fill='black')
    sheet.save(f'{pref}-{part // per}.png')
print('sheets', (len(keys) + per - 1) // per, 'figures', len(keys))
