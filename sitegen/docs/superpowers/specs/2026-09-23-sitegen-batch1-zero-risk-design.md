# Desain Batch 1 — Zero-Risk Docs & Paths (Sitegen)

**Tanggal**: 2026-09-23
**Scope**: Batch 1 dari program C-hybrid (struktur di-template, konten tetap dinamis).
**Prinsip**: hanya dokumen + path (zero-risk). Tidak menyentuh kode generator, tidak mengubah perilaku animasi, tidak membuat `templates/` kode (itu Batch 2).
**Keputusan arsitektur yang dikunci user**: Trilogi Animasi + unidirectional (Lenis + Anime.js + Framer Motion, scroll-reveal satu arah ke bawah + reset); nama laporan tunggal `SEO-AUDIT.md`; harness resmi `render.mjs` (ESM); README scope penuh.
**Kedaluarsa**: `docs/superpowers/specs/2026-08-05-sitegen-master-skill-improvement-design.md` §2.2 (bidirectional) dinyatakan kedaluwarsa dan digantikan keputusan di atas, sesuai supreme `AGENTS.md` repo (BAB III: unidirectional + Lenis + Anime.js v4).

---

## Bukti investigasi (systematic-debugging Phase 1–3)

1. Duplikasi Step 7 `sitegen/SKILL.md:88-117`: blok 7925 chars ≈ 1981 tokens ≈ 31,7% file master; 10 baris kembar persis; diikuti harfiah = 2x panggilan `qa-reviewer` per halaman.
2. Kontradiksi Framer: `generator/SKILL.md:15,59,66` + `generator/AGENTS.md:30-32` + `sitegen/SKILL.md:69` mewajibkan Framer Motion vs `generator/reference/sop.md:64-65` melarangnya.
3. Path mati: `debug/SKILL.md:21` (`../../scripts/render.js`) tidak resolve; file aktual `skills/scripts/render.js` (CJS, default brand `pawitra`) dan `generator/scripts/render.mjs` (ESM, argumen eksplisit). Dry-run versi debug → `Cannot find module`.
4. Ref silang broken: `plugin.json:8` (`skills/SKILL.md` tidak ada; aktual `SKILL.md` root); `research/SKILL.md:27,75` (`planner/reference/...` harusnya `../planner/reference/...`).
5. Rubrik hilang: `qa-reviewer` mode extended (C+D+E ≥ 60/75) tanpa Bagian C/D/E di `reference/review-checklist.md` (hanya A=100, B=100).
6. Inkonsistensi nama laporan: `seo/AGENTS.md:10` (`SEO-REPORT.md`) vs `seo/SKILL.md:13,16,68` (`SEO-AUDIT.md`).
7. Intake: `venv\Scripts\activate` Windows-only + path `./intake/scripts/` ambigu (aktual `skills/intake/scripts/extract.py` 336 baris).
8. Tanpa AGENTS.md: `impeccable/`, `ui-ux-pro-max/`, `systematic-debugging/` (wajib per BAB VI master); redaksi HARD STOP lengkap hanya di `brainstorming/AGENTS.md:22-24`.
9. Pemanggilan `ui-ux-pro-max` di `sitegen/SKILL.md:67` tanpa constraint stack (default skill itu `html-tailwind`, di-AUTO-FAIL debug).
10. README (73 baris): §Prerequisites ganda, §Struktur direktori kadaluarsa (bukan 4-pilar), 13 skill tidak terdokumentasi.

---

## SPEC-01 — Dedup `sitegen/SKILL.md` Step 7

- **File**: `.claude/plugins/sitegen/SKILL.md` (rentang L88-117).
- **Perubahan**: sisakan 1 salinan tiap blok. Susunan akhir: strategi paralel (1x) → constraint 3 poin (1x) → fallback (1x) → eksekusi PAGES-LIST (1x) → 7a SDD loop (1x QA call) → 7b Playwright → 7c Visual QA + STOP (1x) → 7d sisa halaman (1x). Tanpa perubahan perilaku selain hilangnya QA ganda.
- **Acceptance**: tiap kalimat kunci (`Constraint Keamanan Paralelisme`, `Fallback`, `Lakukan eksekusi berdasarkan`, `Setelah pembangunan halaman selesai`, `Visual QA Review`) muncul tepat 1x; file menyusut ±15 baris.

## SPEC-02 — `plugin.json` path master

- **File**: `.claude/plugins/sitegen/plugin.json:8`.
- **Perubahan**: `"path": "skills/SKILL.md"` → `"path": "SKILL.md"`.
- **Acceptance**: 13/13 path skills resolve ke file yang ada.

## SPEC-03 — `research` cross-ref template

- **File**: `skills/research/SKILL.md:27,75` + 1 baris catatan base-dir.
- **Perubahan**: `planner/reference/prd-user-needs-template.md` → `../planner/reference/prd-user-needs-template.md`; sama untuk `prd-competitor-template.md`.
- **Acceptance**: kedua path resolve ke file ada (87 + 145 baris).

## SPEC-04 — Nama laporan SEO tunggal

- **File**: `skills/seo/AGENTS.md:10`, `skills/debug/SKILL.md:39` (hapus fallback `atau reports/SEO-REPORT.md`).
- **Perubahan**: standar `landings/<brand>/reports/SEO-AUDIT.md` di semua file.
- **Acceptance**: `rg -i "SEO-REPORT"` = 0 di plugin (kecuali changelog/README histori).

## SPEC-05 — Satu harness resmi `render.mjs`

- **File**: `skills/debug/SKILL.md:20-21` ditulis ulang jadi `node <skill-dir>/scripts/render.mjs <brand> <baseUrl> <route...>` + contoh; harness resmi di `skills/scripts/render.mjs` (pindahan dari `generator/scripts/render.mjs`); `skills/scripts/render.js` (CJS, default `pawitra`) dihapus/ditandai deprecated.
- **Acceptance**: dry-run tanpa argumen → `Usage: ... <brandName> <baseUrl>...` exit=1; tidak ada referensi `render.js`/`pawitra` tersisa.

## SPEC-06 — Intake Linux-compat + path absolut

- **File**: `skills/intake/SKILL.md:42`.
- **Perubahan**: 2 varian perintah (Linux `source venv/bin/activate` / Windows `venv\Scripts\activate`) + path `<skill-dir>/scripts/extract.py`; catat `venv/` di luar pilar.
- **Acceptance**: perintah valid di bash Linux.

## SPEC-07 — Constraint stack ui-ux-pro-max

- **File**: `sitegen/SKILL.md:67` (Step 5a).
- **Perubahan**: tambah kalimat wajib `stack nextjs`, Vanilla CSS Modules, DILARANG `html-tailwind`/`shadcn`. File ui-ux-pro-max tidak diubah.
- **Acceptance**: constraint eksplisit ada di Step 5a.

## SPEC-08 — Rubrik C/D/E qa-reviewer

- **File**: `skills/qa-reviewer/reference/review-checklist.md` (tambah Bagian C 10+10+5, D 10+10+5, E 8+7+10 + mode `global-extended` di header) dan `skills/qa-reviewer/SKILL.md:183-186` (petakan extended → C/D/E).
- **Acceptance**: C+D+E = 75; threshold tertulis konsisten (A ≥ 90, C+D+E ≥ 60).

## SPEC-09 — AGENTS.md hilang + redaksi HARD STOP

- **File**: buat `skills/impeccable/AGENTS.md`, `skills/ui-ux-pro-max/AGENTS.md`, `skills/systematic-debugging/AGENTS.md` (peran + 1-2 pasal spesifik, tanpa HARD STOP palsu); samakan frasa HARD STOP di titik gerbang mengikuti `brainstorming/AGENTS.md:22-24`.
- **Acceptance**: 12/12 folder skill punya AGENTS.md; frasa `AKHIRI GILIRAN` konsisten di titik gerbang.

## SPEC-10 — README penuh

- **File**: `.claude/plugins/sitegen/README.md`.
- **Perubahan**: gabung §Prerequisites ganda + OS + dependensi berat (`puppeteer`, `sharp`); §Struktur diganti 4-pilar + 13 skill + skrip resmi; tambah § Keputusan Arsitektur + § Changelog Batch 1.
- **Acceptance**: tidak ada daftar direktori gaya lama; 13 skill terdokumentasi.
