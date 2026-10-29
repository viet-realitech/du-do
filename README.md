# Dư Đồ — bản đồ Việt Nam 1858 – nay

Mobile-first web app (PWA) built from the Claude Design handoff in `project/` (`Du Do v2.html`, "Chiến lược" night theme).

```sh
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production build to dist/ (static, deploy anywhere)
npm run preview    # serve dist/ on http://localhost:4173
npm run test:e2e   # Playwright end-to-end tests against the build (Wikipedia blocked → offline paths)
npm run geo        # regenerate src/data/region-50m.json from world-atlas
npm run icons      # regenerate PNG icons + og.png in public/ (needs Playwright Chromium)
```

### Deploying

`dist/` is a static site with relative paths, so it works at a domain root or a sub-path. Build with the public URL so
canonical / Open Graph tags are absolute (Facebook, Zalo and X need that to show the share image):

```sh
SITE_URL=https://your-domain.example/ npm run build
```

- **Vercel**: import the repo at vercel.com/new — `vercel.json` sets the build, output and headers. **Netlify**: "Add new site → Import
  from Git" — `netlify.toml` + `public/_headers`. On both, production builds pick up the site URL automatically (no `SITE_URL` needed);
  every push to `main` redeploys, pull requests get preview URLs.
- Headers: `public/_headers` (Netlify / Cloudflare Pages) sets security and caching headers; hashed `assets/*` are immutable,
  `index.html` / `sw.js` / `manifest.webmanifest` must stay `no-cache` so updates reach installed apps.
- A Content-Security-Policy `<meta>` is injected at build time (`vite.config.ts`): own code only, plus Wikipedia/Wikimedia.
  If you add analytics or another API, extend `CSP` there.
- CI (`.github/workflows/ci.yml`) runs typecheck, build and the e2e tests on every push / PR.

Before launch, have a historian review the event texts, quotes and casualty / population figures in `src/data/`
(the design notes flag these as unreviewed), and confirm the attribution text in `src/screens/about.ts`.

**Stack:** Vite + TypeScript, d3 + topojson for the map, self-hosted fonts (Fontsource), `vite-plugin-pwa` for install/offline.
Geodata ships with the app: provinces from `project/vn-provinces.json`, countries from Natural Earth via `world-atlas`, trimmed to the region by `npm run geo` (`src/data/region-50m.json`, lazy-loaded).
Wikipedia/Commons images, portraits and video are fetched at runtime and cached by the service worker; everything degrades to placeholders offline.

| Path | What |
|---|---|
| `src/data/` | Content tables ported verbatim from `project/data.js` + `data2.js` (ES modules), typed in `index.ts` |
| `src/state.ts` | Persisted game state (`localStorage` key `dudo-v2`) and derived helpers |
| `src/map.ts` | Map rendering, zoom/pan, region popover, tour spotlight |
| `src/view.ts` | Main screen: header, value bars, legend, event card, timeline, filter |
| `src/tour.ts` | Chapter zoom tour with narration |
| `src/screens/` | Onboarding, turning points + quiz, event detail, event cards (play mode), lightbox, figures, sources, profile, ending/share card |
| `src/play.ts`, `src/data/cards.ts` | Play-mode rules (resources, relations, harvest, rank) and the event cards |
| `src/wiki.ts` | Wikipedia / Commons lookups (event media, video derivatives) and portrait URLs |
| `src/data/portraits.ts` | Hand-picked Commons portrait per figure (real photo or painting, never statues) with a face focus point |
| `src/ui/` | DOM helpers, delegated `data-a` actions, Back/Escape handling, `<image-slot>` element, flags/avatars |
| `e2e/` | Playwright tests |
| `scripts/` | Geodata trimming, icon / share-image generation, music and voice-over builds |
| `src/music.ts`, `src/audio.ts`, `src/narration.ts` | Soundtrack moods, synthesised effects, narration (recordings or system voice) |

### Play mode (Chế độ Chơi)

Chosen at onboarding (Đọc sử / Chơi) and switchable in Hồ sơ. History still unfolds as it did; the player keeps a
family estate through it: four resources (lúa gạo, nhân đinh, bạc, uy tín), relations with the powers of each
period (triều đình, Pháp, Nhật, Việt Minh/VNDCCH, Quốc gia/VNCH, Mỹ, Nhà nước, làng xóm) and a home town shown on
the map. Each historical event has a card (`src/data/cards.ts`, 91 cards × 2–3 choices) with resource and relation
effects; cards marked nationwide or touching the home region must be decided before the timeline moves on, the rest
are optional. Every generation opens with a harvest that depends on the ruling power's and the village's attitude
(`src/play.ts`); turning-point choices also shift relations. The ending ranks the family (Vọng tộc … Dòng họ ly tán).
All numbers are game abstractions, not historical data.

### Sound

- **Music**: six tracks by Kevin MacLeod (incompetech.com, CC BY 4.0, credited in the About sheet), one per mood
  (`src/music.ts`). `npm run music` downloads and re-encodes them into `public/music/` (needs ffmpeg).
- **Voice-over**: every narration line ships as a pre-rendered clip in `src/voice/` (played instead of the device's
  speech synthesis; that remains the fallback for a missing clip). `npm run voice:script` writes the script to
  `docs/voice/kich-ban.md` / `.csv` (file name, context, exact text). Two sources, merged by `npm run voice`
  (trim, loudness, AAC):
  - **VieNeu-TTS** (open source, Apache-2.0, CPU only, ~1× real time): `pip install -r scripts/tts/requirements.txt`
    then `npm run voice:tts [-- --voice "Thanh Bình"]` renders `tts-out/` (models, ~630 MB, download once into
    `scripts/tts/models/`). `scripts/tts/generate.py` expands abbreviations and day.month dates before synthesis;
    clips are re-rendered only when their text or voice changed.
  - **A narrator's recordings** named after their key (e.g. `recordings/dn58.wav`) always take precedence, so lines
    can be re-recorded one by one.
- **Effects** are synthesised with Web Audio (`src/audio.ts`); narration ducks music and effects.

The prototype's Tweaks became player settings: theme (Lưu trữ / Chiến lược / Áp phích, also offered during onboarding),
faction palette (flags / sepia ink), map style for Lưu trữ (engraved / flat), paper grain, today's border and graticule
(`src/theme.ts`, Hồ sơ → Giao diện). `public/boot.js` applies the saved theme before first paint.
Not carried over from the prototype: the phone-frame mock and the designer's "jump to" buttons.
The designer's drag-and-drop image replacement only worked inside the design tool, so `<image-slot>` is display-only here.

---

# CODING AGENTS: READ THIS FIRST

This is a **handoff bundle** from Claude Design (claude.ai/design).

A user mocked up designs in HTML/CSS/JS using an AI design tool, then exported this bundle so a coding agent can implement the designs for real.

## What you should do — IMPORTANT

**Read the chat transcripts first.** There are 1 chat transcript(s) in `chats/`. The transcripts show the full back-and-forth between the user and the design assistant — they tell you **what the user actually wants** and **where they landed** after iterating. Don't skip them. The final HTML files are the output, but the chat is where the intent lives.

**Read `project/Du Do v2.html` in full.** The user had this file open when they triggered the handoff, so it's almost certainly the primary design they want built. Read it top to bottom — don't skim. Then **follow its imports**: open every file it pulls in (shared components, CSS, scripts) so you understand how the pieces fit together before you start implementing.

**If anything is ambiguous, ask the user to confirm before you start implementing.** It's much cheaper to clarify scope up front than to build the wrong thing.

## About the design files

The design medium is **HTML/CSS/JS** — these are prototypes, not production code. Your job is to **recreate them pixel-perfectly** in whatever technology makes sense for the target codebase (React, Vue, native, whatever fits). Match the visual output; don't copy the prototype's internal structure unless it happens to fit.

**Don't render these files in a browser or take screenshots unless the user asks you to.** Everything you need — dimensions, colors, layout rules — is spelled out in the source. Read the HTML and CSS directly; a screenshot won't tell you anything they don't.

## Bundle contents

- `README.md` — this file
- `chats/` — conversation transcripts (read these!)
- `project/` — the `Vietnamese historical map app` project files (HTML prototypes, assets, components)
