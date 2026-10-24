import { defineConfig, type Plugin } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import pkg from './package.json' with { type: 'json' };

/* Absolute public URL of the deployment (e.g. https://dudo.example.vn/). Used for canonical/Open Graph
   tags, which crawlers require to be absolute. Set SITE_URL when building for production.
   On Vercel / Netlify production builds it is detected automatically. */
function siteUrl(): string {
  const e = process.env;
  const raw = e.SITE_URL
    || (e.VERCEL_ENV === 'production' && e.VERCEL_PROJECT_PRODUCTION_URL ? 'https://' + e.VERCEL_PROJECT_PRODUCTION_URL : '')
    || (e.NETLIFY && e.CONTEXT === 'production' ? e.URL || '' : '');
  return raw ? raw.replace(/\/?$/, '/') : '';
}
const SITE_URL = siteUrl();

const TITLE = 'Dư Đồ — Bản đồ Việt Nam 1858 – nay';
const DESC = 'Cảm hứng bản đồ Việt Nam, từ thời Pháp thuộc tới nay. Sáu thế hệ, sáu điểm rẽ: chọn con đường của dòng họ bạn và so với lịch sử. Một trò chơi lịch sử dựa trên sử liệu công khai.';

/** Content-Security-Policy: own code only; Wikipedia/Wikimedia for article text, images and video. */
export const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://upload.wikimedia.org https://thumb.wikimedia.org https://commons.wikimedia.org",
  "media-src 'self' https://upload.wikimedia.org https://thumb.wikimedia.org",
  "font-src 'self'",
  "connect-src 'self' data: https://vi.wikipedia.org https://en.wikipedia.org https://commons.wikimedia.org https://upload.wikimedia.org",
  "worker-src 'self'",
  "manifest-src 'self'",
  "base-uri 'self'",
  "form-action 'none'",
].join('; ');

function seo(): Plugin {
  return {
    name: 'dudo-seo',
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        const abs = (p: string) => (SITE_URL ? SITE_URL + p : './' + p);
        const tags = [
          `<meta name="description" content="${DESC}">`,
          SITE_URL ? `<link rel="canonical" href="${SITE_URL}">` : '',
          `<meta property="og:type" content="website">`,
          `<meta property="og:locale" content="vi_VN">`,
          `<meta property="og:site_name" content="Dư Đồ">`,
          `<meta property="og:title" content="${TITLE}">`,
          `<meta property="og:description" content="${DESC}">`,
          SITE_URL ? `<meta property="og:url" content="${SITE_URL}">` : '',
          `<meta property="og:image" content="${abs('og.png')}">`,
          `<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">`,
          `<meta property="og:image:alt" content="Dư Đồ — bản đồ Việt Nam 1858 – 2026">`,
          `<meta name="twitter:card" content="summary_large_image">`,
          // The dev server needs inline/HMR scripts, so the policy is only emitted for builds.
          ctx.server ? '' : `<meta http-equiv="Content-Security-Policy" content="${CSP}">`,
        ].filter(Boolean);
        return html.replace('<!--seo-->', tags.join('\n'));
      },
    },
  };
}

export default defineConfig({
  base: './',
  build: { target: 'es2022' },
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  plugins: [
    seo(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'apple-touch-icon.png', 'og.png'],
      manifest: {
        id: './',
        name: TITLE,
        short_name: 'Dư Đồ',
        description: DESC,
        lang: 'vi',
        start_url: './',
        scope: './',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#16130f',
        theme_color: '#16130f',
        categories: ['education', 'games'],
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        // Faces of the optional Lưu trữ / Áp phích themes are cached on first use instead.
        globIgnores: ['og.png', '**/playfair-display-*', '**/be-vietnam-pro-*'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: /\/assets\/(playfair-display|be-vietnam-pro)-[^/]+\.woff2?$/,
            handler: 'CacheFirst',
            options: { cacheName: 'theme-fonts', expiration: { maxEntries: 40 } },
          },
          {
            // Wikipedia / Commons media: keep what was seen for offline replays.
            urlPattern: /^https:\/\/(upload|thumb)\.wikimedia\.org\//,
            handler: 'CacheFirst',
            options: { cacheName: 'wm-media', expiration: { maxEntries: 400, maxAgeSeconds: 60 * 60 * 24 * 30 }, cacheableResponse: { statuses: [0, 200] } },
          },
          {
            urlPattern: /^https:\/\/((vi|en)\.wikipedia\.org|commons\.wikimedia\.org)\/(w\/api\.php|api\/rest_v1)/,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'wm-api', expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 7 }, cacheableResponse: { statuses: [200] } },
          },
        ],
      },
    }),
  ],
});
