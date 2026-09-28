import { defineConfig, devices } from "@playwright/test";

/**
 * Salin ke `landings/<brand>/web/playwright.config.ts`.
 *
 * WAJIB ada: seluruh alur QC (debug Tahap 1, SKILL.md Fase 7, dan header
 * `tests/<slug_tepat>.spec.ts`) memakai perintah resmi
 * `npx playwright test --project=chromium`. Tanpa file ini Playwright hanya
 * punya project default bernama `""` dan perintah tersebut gagal dengan
 * "Project(s) \"chromium\" not found".
 *
 * JANGAN jalankan `npm init playwright@latest` — perintah itu menimpa file ini
 * dan folder `tests/`. Cukup pasang browser-nya: `npx playwright install --with-deps chromium`.
 */
export default defineConfig({
  testDir: "./tests",
  // Artefak gagal (trace/screenshot) tidak ditaruh di reports/.preview/ agar
  // folder itu tetap hanya berisi screenshot yang diminta spec.
  outputDir: "../reports/.playwright",
  timeout: 30_000,
  fullyParallel: true,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // Jalankan sendiri server produksi agar `npx playwright test --project=chromium`
  // bisa dipakai langsung dari folder web (reuseExistingServer: pakai dev server
  // yang sudah menyala bila ada).
  webServer: {
    command: "npm run start -- --port 3000",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
