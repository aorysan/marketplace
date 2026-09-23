# Desain Batch 2 — Templates Hybrid C (Sitegen)

**Tanggal**: 2026-09-23
**Scope**: template struktur siap-copy dengan token; konten/visual tetap dinamis per brand (keputusan user: seimbang).
**Dependensi**: mengasumsikan Batch 1 sudah jalan (harness di `skills/scripts/render.mjs`, nama `SEO-AUDIT.md`, rubrik C/D/E, constraint stack). Jika Batch 1 belum dieksekusi, jalankan Task 9 Batch 1 (GO/NO-GO) dulu — template di bawah memakai nama/lokasi baru.
**Sumber kebenaran isi template**: `generator/SKILL.md` GATE 3, `generator/reference/sop.md`, `planner/SKILL.md` MODE 2 (field per section), `seo/SKILL.md` checklist, `debug/SKILL.md` (DEBUG_LOG), master `SKILL.md` Step 6c/7b (ASSET-MAPPING, Playwright).
**Bukan scope Batch 2**: migrasi `landings/` ke 4-pilar + peringatan template Tailwind/Astro di brainstorming (Batch 3).

## Konvensi token (semua template kode)

- `{{BRAND}}`, `{{BRAND_SLUG}}`, `{{PRIMARY}}`, `{{SECONDARY}}`, `{{DARK}}`, `{{FONT_HEADING}}`, `{{FONT_BODY}}`, `{{LOGO_PATH}}`, `{{YEAR}}`.
- Generator WAJIB ganti semua token dari `PLAN-GLOBAL.md` + `ASSET-MAPPING.md`; file dengan token tersisa = gagal QA (tambah 1 baris cek `rg "{{[A-Z_]+}}"` di QA code-review).
- Visual/artwork TIDAK di-hardcode di template: tiap `<Image>` memakai `src` dari `ASSET-MAPPING.md` + atribut ganda `alt`/`title` (AGENTS.md generator Pasal II).

---

## SPEC-11 — `generator/templates/` boilerplate (10 file)

Lokasi baru: `skills/generator/templates/`. Sumber salin-tempel: `reference/sop.md` + `generator/SKILL.md` GATE 3.

| File | Sumber | Token/isi kunci |
|---|---|---|
| `AnimatedSection.tsx` | `sop.md:70-150` (verbatim) | tanpa token; perilaku unidirectional + asymmetric reset + `anime.remove` cleanup (keputusan Trilogi+unidirectional) |
| `SmoothScroll.tsx` | `sop.md:155-173` (verbatim) | tanpa token; `lenis` duration 1.2 |
| `SwipeableCards.tsx` + `SwipeableCards.module.css` | `SKILL.md:70-80` (aturan CSS wajib) | tanpa token; flex row nowrap, `overflow-x:auto`, `snap-x mandatory`, children `flex-shrink:0`, dots pagination mobile-only, keyboard `ArrowLeft/Right`, `tabindex`, `aria-label` |
| `Header.tsx` | `SKILL.md:32-34,68` | `{{LOGO_PATH}}` via `next/image` (`h-9 w-auto object-contain`, `priority`), burger Lucide `Menu`/`X` 3 garis, `sticky top-0 z-50`, glassmorphism on scroll |
| `Footer.tsx` | `SKILL.md:32-34` | `{{LOGO_PATH}}` (wrapper terang bila bg gelap), data dari PLAN-GLOBAL §Footer (email, WA, alamat, sosmed) |
| `globals-tokens.css` | `sop.md:43-53` + PLAN-DESIGN-SYSTEM | `{{PRIMARY}} {{SECONDARY}} {{DARK}} {{FONT_HEADING}} {{FONT_BODY}}`, `html,body { overflow-x:hidden; max-width:100vw }`, `main { padding-top:80px }`, grid `minmax(0,1fr)` |
| `layout.tsx` | `SKILL.md:65` | `SmoothScroll` wrapper + global metadata dari PRD (Title ≤55, Desc ≤155) |
| `sitemap.ts` + `robots.ts` | `SKILL.md:67` | routes dari PAGES-LIST.md |
| `llms.txt` | `SKILL.md:67` | format Markdown H1 + ≥1 absolute link |
| `next.config.ts.snippet` | `sop.md:30-40` + `SKILL.md:63` | `images.remotePatterns` + anti-Turbopack-lockfile note |

Acceptance: 10 file ada; `rg "{{[A-Z_]+}}"` hanya di file bertoken; `AnimatedSection` identik dengan `sop.md:70-150` (tidak ada Framer di dalamnya — Framer hanya untuk kartu interaktif per `SKILL.md:66`).

## SPEC-12 — Section snippets (11 tipe)

Lokasi: `skills/generator/templates/sections/<tipe>.tsx` (`hero`, `problem`, `solution`, `about`, `management`, `techstack`, `testimonial`, `pricing`, `faq`, `cta`, `video`). Props mengikuti `planner/SKILL.md:89-99` (mis. hero: headline ≤7 kata, subheadline ≤2 kalimat, `cta.text` ≤3 kata, stats, clients; faq: 4-5 item; pricing/faq `Membutuhkan Gambar: Tidak`).
Aturan: tiap snippet terima props + `items` array, class `.stagger-item` + `anime.stagger(100)` untuk children, ikon `lucide-react` (DILARANG emoji), `aria-label` + `tabindex="0"` untuk interaktif, `TechStack.tsx` monospaced per `SKILL.md:94-99`.
Acceptance: 11 file; tiap file `< 120` baris; tidak ada teks brand(Image) hardcoded — semua via props.

## SPEC-13 — Playwright spec template

Lokasi: `skills/generator/templates/tests/page.spec.ts.template`. Isi: 2 viewport (Desktop 1280x720, Mobile 375x667 — master Step 7b), screenshot ke `landings/{{BRAND_SLUG}}/reports/.preview/`, nama output `desktop-<slug>.png` / `mobile-<slug>.png`, placeholder `<slug_tepat>` dari PAGES-LIST.md (tanpa translasi).
Acceptance: template memuat kedua viewport + path `.preview/`; token `<slug_tepat>` + `{{BRAND_SLUG}}` jelas.

## SPEC-14 — Report & planning templates (5 file)

| File | Lokasi | Isi |
|---|---|---|
| `ASSET-MAPPING.md.template` | `skills/planner/reference/` | tabel URL logo resmi brand, logo produk/game, foto konvensi, video YouTube → section target + status verifikasi 200 OK (master Step 6c) |
| `PAGES-LIST.md.template` | `skills/planner/reference/` | daftar slug + kolom `✅ disetujui` (master Step 7c mewajibkan centang) |
| `SEO-AUDIT.md.template` | `skills/seo/` (folder `templates/` baru) | kerangka dari `seo/SKILL.md:72-97` (keyword/cannibalization, Title/Meta, backlink 3 artikel, SMO video) + cek teknis `check-technical.js` (11 cek) |
| `DEBUG_LOG.md.template` | `skills/debug/` (folder `templates/` baru) | tanggal, root cause, file diubah, iterasi ke-n/batas, status; dipakai Tahap debug + post-deploy (maks 3 / 2 putaran) |
| `QA-CODE-<halaman>.md.template` + `QA-REPORT` skeletons | `skills/qa-reviewer/reference/` | kerangka 4 cek code-review (`SKILL.md:158-162`: slug, section, logo/alt-title, instruksi revisi) + format Global/Page/Extended dari SKILL.md |

Acceptance: 5(+2) file ada; field mencakup semua poin checklist sumber; nama `SEO-AUDIT.md` konsisten (Batch 1 SPEC-04).

## SPEC-15 — Kanon ekstraksi tunggal

- Kanal resmi PDF→aset: `skills/intake/scripts/extract.py` (teks + `assets/` + `intake_raw.json`).
- `skills/generator/scripts/extract-pdf.mjs` (stdout saja) + `extract-colors.js` (Vibrant, tumpang tindih `_color_to_hex` di `extract.py:20-58`) diberi header `DEPRECATED — pakai intake/extract.py; dipertahankan 1 versi untuk kompatibilitas`, lalu dihapus di Batch 3 bersama migrasi landings.
- Acceptance: kedua file berlabel deprecated; tidak ada SKILL yang merujuknya sebagai langkah utama.

## SPEC-16 — Dependensi QC opsional

- `puppeteer` (±120-170MB) + `sharp` (native) di `generator/package.json` didokumentasikan sebagai QC-opsional: instal default tanpa keduanya; `npm install --include=optional` atau profil terpisah saat butuh screenshot/warna. README Batch 1 (SPEC-10) sudah mencatat bobotnya; Batch 2 menambahkan perintah pastinya.
- Acceptance: path instal cepat (tanpa QC) dan path QC terdokumentasi; tidak ada SKILL yang gagal bila QC-deps absen (skrip memberi pesan jelas).
