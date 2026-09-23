# Desain Batch 3 — Konsolidasi & Kebersihan (Sitegen)

**Tanggal**: 2026-09-23
**Scope**: hapus Puppeteer, migrasi 3 brand ke 4-pilar, guard template brainstorming, hapus helper deprecated + dep tak terpakai.
**Dependensi**: Batch 1 GO + Batch 2 GO (Playwright spec template + `render.mjs` resmi + label deprecated). SPEC-17 hanya jalan setelah SPEC-13 (Playwright template) ada — screenshot QC pindah ke sana.
**Bukan scope**: perubahan perilaku animasi/desain; konsolidasi `MASTER-PLAN.md` vs `PRD.md` di hoyoverse (dicatat follow-up).

## Fakta investigasi

- `landings/` 0 referensi puppeteer; hoyoverse + jawara full `@playwright/test`; timebase sudah punya PNG Playwright. Puppeteer hanya dipakai 2 harness debug + import opsional `impeccable/.../detect-url.mjs` (berpesan ramah bila absen).
- `sharp` tidak di-import file mana pun (hanya `generator/package.json`); `pdf-parse`/`node-vibrant` hanya dipakai 2 helper deprecated SPEC-15.
- Template brainstorming: `screwfast.uk` = Astro + Tailwind (footer situs), `launch-pad-roan` = Next.js + Tailwind + Motion + Aceternity (footer situs), `show.saasfly.io` = boilerplate SaaS (stack CSS tak tertera di footer — verifikasi sebelum tawarkan), `jawara-woad` = output sitegen sendiri (aman).
- hoyoverse/jawara = proyek Next.js di brand-root (src/, public/, package.json di root); timebase = 4-pilar + duplikat root.

---

## SPEC-17 — Hapus Puppeteer, screenshot full Playwright

- **Hapus**: `skills/scripts/render.mjs` (lokasi Batch 1; bila Batch 1 belum jalan: `skills/scripts/render.js` + `generator/scripts/render.mjs`), dep `puppeteer` di `generator/package.json`, script `qc` (menunjuk render mati → hapus; perintah QC resmi jadi `npx playwright test` dari `web/`).
- **Tulis ulang** `debug/SKILL.md` Tahap 1 langkah 1-5: `cd landings/<brand>/web && npx playwright test` → review PNG `reports/.preview/` (konvensi Batch 2 SPEC-13) → daftar STRICT AUTO-FAIL tetap, diverifikasi via assertion spec + `seo/scripts/check-technical.js` (11 cek, tanpa browser).
- **Tidak diubah**: `impeccable/.../detect-url.mjs` (import opsional, pesan error sudah ramah).
- **Acceptance**: `rg -i puppeteer` di plugin = hanya `detect-url.mjs` + changelog; `rg render\.(js|mjs)` = 0 di SKILL; 1x `npx playwright test` lolos di 1 brand (jawara/timebase).

## SPEC-18 — Migrasi 3 brand ke 4-pilar

Aturan umum: commit git dulu sebagai backup; `mv` (bukan copy) untuk aset; JANGAN pindahkan `node_modules/` + `.next/` (fresh `npm install` di `web/`, hapus yang root pasca build lolos); `.vercel/` tetap di root + langkah manual: update Vercel → Settings → Root Directory = `landings/<brand>/web`; `README.md`, `AGENTS.md`, `CLAUDE.md` tetap di root (instruksi agen, bukan arsip kerja).

**hoyoverse** (buat `intake/`, `reports/`; `planning/` ada):
- → `intake/`: `final_intake.md`, `intake_compro.md`, `user_preferences.md`, `intake_raw.json`; `assets/` → `web/public/assets/` (gabung bila sudah ada, tanpa overwrite).
- → `planning/`: root `PRD.md` → `planning/PRD.md` (catat anomali `MASTER-PLAN.md` berdampingan sebagai follow-up, jangan hapus).
- → `web/`: `package.json`, `package-lock.json`, `next.config.ts`, `tsconfig.json`, `tsconfig.tsbuildinfo`, `next-env.d.ts`, `eslint.config.mjs`, `postcss.config.mjs`, `.gitignore`, `.env.local`, `src/`, `public/`, `tests/`, `scripts/`, `playwright.config.ts`.
- → `reports/`: `test-results/`, `playwright-report/`.

**jawara** (buat `intake/`, `web/`; `planning/` + `reports/` ada, merge):
- Sama seperti hoyoverse; `IMAGE-MAPPING.md` tetap di `planning/`; `reports/` digabung (tanpa hapus isi lama).

**timebase** (4-pilar ada; bersihkan root):
- `diff` 5 duplikat root (`assets/`, `final_intake.md`, `intake_compro.md`, `user_preferences.md`, `PRD.md`) vs `intake/`/`planning/`; identik (exit 0) → hapus yang root; beda → simpan terbaru + catat di commit message.
- `playwright/*.png` + `playwright-timelog.zip` → `reports/.preview/` (buat folder); hapus folder `playwright/` root bila kosong.

**Acceptance per brand**: `ls landings/<brand>/` = hanya `intake planning web reports` + `README.md AGENTS.md CLAUDE.md .vercel/`; `npm run build` + `npx tsc --noEmit` lolos dari `web/`; tidak ada `node_modules/`/`.next/` di root.

## SPEC-19 — Guard template brainstorming

- **Fakta stack** (dari footer situs, terverifikasi 2026-09-23): screwfast = Astro + Tailwind; launch-pad = Next.js + Tailwind; jawara-woad = output sitegen (aman); saasfly = belum terverifikasi (tulis `stack CSS belum terverifikasi — konfirmasi sebelum tawarkan`).
- **Ubah** `brainstorming/SKILL.md` Q4: tiap opsi template diberi label stack + peringatan; aturan: template Tailwind/Astro HANYA via opsi (2) Modifikasi dengan konversi ke Vanilla CSS Modules (tambah estimasi waktu) atau generator WAJIB menolak di GATE 2 (tambah 1 kalimat penolakan di `generator/SKILL.md` GATE 2). Rekomendasi default agen: Custom atau jawara-woad.
- **Acceptance**: 4 URL berlabel stack; ada kalimat penolakan Tailwind/Astro di generator GATE 2.

## SPEC-20 — Hapus helper deprecated + dep tak terpakai

- **Hapus**: `generator/scripts/extract-pdf.mjs`, `generator/scripts/extract-colors.js` (label Batch 2 SPEC-15).
- **Hapus dari `generator/package.json`**: `pdf-parse`, `node-vibrant`, `sharp` (tak terpakai), `puppeteer` (bila SPEC-17 belum menghapusnya); hapus script `qc` yang menunjuk render mati (bila SPEC-17 belum).
- **Acceptance**: `rg "pdf-parse|node-vibrant|sharp|puppeteer|render\.mjs" generator/package.json generator/scripts/` = kosong (selain changelog); `npm install --omit=optional` di skill dir tetap sukses (bila masih ada optionalDeps sisa Batch 2).
