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
| `src/screens/` | Onboarding, turning points + quiz, event detail, lightbox, figures, sources, profile, ending/share card |
| `src/wiki.ts` | Wikipedia / Commons lookups (event media, video derivatives) and portrait URLs |
| `src/data/portraits.ts` | Hand-picked Commons portrait per figure (real photo or painting, never statues) with a face focus point |
| `src/ui/` | DOM helpers, delegated `data-a` actions, Back/Escape handling, `<image-slot>` element, flags/avatars |
| `e2e/` | Playwright tests |
| `scripts/` | Geodata trimming and icon / share-image generation |

Not carried over from the prototype: the phone-frame mock, the Tweaks panel and the Lưu trữ / Áp phích themes.
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
