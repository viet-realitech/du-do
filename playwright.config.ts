import { defineConfig, devices, webkit } from '@playwright/test';
import { existsSync } from 'node:fs';

/* Runs against the production build (`vite preview`), on an iPhone 13 profile in Chromium and in WebKit (iPad Safari's engine).
   PW_PORT: port for the preview server (default 4173), so parallel runs need no local config file.
   PW_BASE_URL: test a server that is already running (no webServer is started).
   PW_CHROMIUM: use a preinstalled Chromium binary for the chromium project.
   Without WebKit installed (`npx playwright install webkit`) only the chromium project runs, with a warning. */
const port = Number(process.env.PW_PORT) || 4173;
const baseURL = process.env.PW_BASE_URL || `http://localhost:${port}/`;
const hasWebkit = (() => { try { return existsSync(webkit.executablePath()); } catch { return false; } })();
if (!hasWebkit && !process.env.CI && !process.env.TEST_WORKER_INDEX) console.warn('WebKit is not installed (npx playwright install webkit): running the chromium project only.');

export default defineConfig({
  testDir: 'e2e',
  timeout: 60_000,
  // tests share no state (each has its own browser context, save and route), so they spread over the workers
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL,
    serviceWorkers: 'block',
    // a trace only for a retried test (CI retries once): recording every test slows WebKit several-fold and upsets timing checks
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['iPhone 13'], browserName: 'chromium', launchOptions: process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {} },
    },
    ...(hasWebkit ? [{
      name: 'webkit',
      use: { ...devices['iPhone 13'], browserName: 'webkit' as const },
    }] : []),
  ],
  webServer: process.env.PW_BASE_URL ? undefined : { command: `npx vite preview --port ${port} --strictPort`, url: baseURL, reuseExistingServer: !process.env.CI },
});
