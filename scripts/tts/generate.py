"""Synthesise the narration script with VieNeu-TTS (open source, Apache-2.0, runs on this CPU).

    python3 scripts/tts/generate.py [--voice "Thanh Bình"] [--only key,key] [--force]

Reads docs/voice/kich-ban.csv (from `npm run voice:script`), writes tts-out/<key>.wav (48 kHz) and
tts-out/manifest.json. A clip is regenerated only when its text or the voice changed. The manifest keeps the
script line each clip reads ("text"); `npm run voice` stamps it into src/voice/said.json, so the app never plays
a clip whose line has since changed. Human recordings in recordings/ take precedence when `npm run voice` builds
src/voice/."""
import argparse, csv, hashlib, json, re, sys, time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(Path(__file__).resolve().parent))

# Spoken forms VieNeu's own normaliser does not know (it spells abbreviations letter by letter).
ABBREV = {
    "QLVNCH": "Quân lực Việt Nam Cộng hoà", "QL VNCH": "Quân lực Việt Nam Cộng hoà", "VNDCCH": "Việt Nam Dân chủ Cộng hoà",
    "VNCH": "Việt Nam Cộng hoà", "CHDCND": "Cộng hoà Dân chủ Nhân dân", "XHCN": "Xã hội chủ nghĩa", "LHQ": "Liên Hợp Quốc",
    "ASEAN": "A-xê-an", "B-52": "B năm mươi hai", "TP.": "Thành phố", "VN": "Việt Nam",
}


def spoken(text: str) -> str:
    t = text.replace(" · ", ". ").replace("·", ",").replace(" — ", ", ").replace("—", ",")
    for k, v in ABBREV.items():
        t = re.sub(r"(?<![\wĐđ])" + re.escape(k) + r"(?![\wĐđ])", v, t)
    # Day.month without a year ("Ngày 30.8", "(17.4)") would be read as a decimal.
    t = re.sub(r"(?i)(ngày\s+)(\d{1,2})\.(\d{1,2})(?![\d.])", r"\g<1>\2 tháng \3", t)
    t = re.sub(r"(?<![\d.])(\d{1,2})\.(\d{1,2})(?![\d.])", r"ngày \1 tháng \2", t)
    return re.sub(r"\s+", " ", t).strip()


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--voice", default="Thanh Bình")
    ap.add_argument("--out", default=str(ROOT / "tts-out"))
    ap.add_argument("--only", default="")
    ap.add_argument("--force", action="store_true")
    ap.add_argument("--dry", action="store_true", help="print the spoken text, synthesise nothing")
    a = ap.parse_args()
    out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
    rows = list(csv.DictReader(open(ROOT / "docs/voice/kich-ban.csv", encoding="utf-8-sig")))
    only = set(filter(None, a.only.split(",")))
    mpath = out / "manifest.json"
    man = json.loads(mpath.read_text()) if mpath.exists() else {}
    if a.dry:
        for r in rows: print(r["Tên file"], "|", spoken(r["Lời đọc"]))
        return
    sig_of = lambda voice, text: hashlib.sha1((voice + "\n" + text).encode()).hexdigest()[:12]
    # clips made before the manifest kept the line: record it when the signature proves the clip reads this line
    for r in rows:
        m = man.get(r["Tên file"])
        if m and "text" not in m and m.get("sig") == sig_of(m.get("voice", a.voice), spoken(r["Lời đọc"])): m["text"] = r["Lời đọc"]
    mpath.write_text(json.dumps(man, ensure_ascii=False, indent=1))
    tts = voice = None
    done = 0
    for i, r in enumerate(rows, 1):
        key, text = r["Tên file"], spoken(r["Lời đọc"])
        if only and key not in only: continue
        sig = sig_of(a.voice, text)
        dst = out / f"{key}.wav"
        if not a.force and dst.exists() and man.get(key, {}).get("sig") == sig: continue
        if tts is None:
            from vieneu_local import load
            t0 = time.time(); tts = load(); voice = tts.get_preset_voice(a.voice)
            print(f"VieNeu ready in {time.time() - t0:.0f}s, voice {a.voice}, {len(rows)} lines", flush=True)
        t = time.time()
        wav = tts.infer(text, voice=voice, show_progress=False, apply_watermark=False)
        tts.save(wav, dst)
        man[key] = {"sig": sig, "voice": a.voice, "sec": round(len(wav) / tts.sample_rate, 1), "text": r["Lời đọc"]}
        mpath.write_text(json.dumps(man, ensure_ascii=False, indent=1))
        done += 1
        print(f"[{i}/{len(rows)}] {key}: {man[key]['sec']}s in {time.time() - t:.0f}s", flush=True)
    total = sum(v["sec"] for v in man.values())
    print(f"done: {done} new, {len(man)} clips, {total / 60:.1f} min of narration")


if __name__ == "__main__":
    main()
