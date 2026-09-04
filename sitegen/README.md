# Sitegen Master Flow

Sitegen adalah master orkestrator berbasis agen AI (AI Agent) untuk membangun website secara komprehensif dari awal (ekstraksi data) hingga akhir (deployment). Sistem ini dirancang menggunakan arsitektur modular (plugin-based) di mana setiap fungsi utama ditangani oleh sub-skill terpisah yang dipanggil secara berurutan.

## 📦 Install via Marketplace (Claude Code)

Sitegen tersedia sebagai **plugin Claude Code** dan dapat dipasang dari marketplace `sitegen-marketplace`:

```shell
/plugin marketplace add aorysan/sitegen
/plugin install sitegen@sitegen-marketplace
```

Setelah terpasang, jalankan `/sitegen` untuk memulai alur master. Sub-skill tersedia dengan namespace: `/sitegen:intake`, `/sitegen:planner`, `/sitegen:generator`, `/sitegen:qa-reviewer`, dan lainnya.

> Instalasi manual: tanpa marketplace, kamu bisa memuat plugin ini langsung dengan `claude --plugin-dir <path-ke-repo>`.

## Prerequisites

## 📋 Prerequisites

Pastikan sudah terinstall sebelum menjalankan sitegen:
- **Python 3.x** — untuk script extraction (`intake/scripts/extract.py`) dan UI search (`ui-ux-pro-max/scripts/search.py`)
- **Node.js 18+** — untuk Next.js scaffolding dan Playwright
- **Git** — untuk version control

## 🚀 Alur Kerja (Master Workflow)

0. **User Onboarding (`[HARD STOP]`)**
   Tanya nama brand dan path ke file PDF Company Profile. Verifikasi file exists.
1. **Intake (`/intake`)**
   Mengekstrak data dari PDF company profile dan menyimpannya ke `landings/<brand>/intake/intake_compro.md` beserta aset gambar.
2. **Research (`/research`)**
   Riset mendalam berbasis `intake_compro.md` dan web search otomatis. Menghasilkan `landings/<brand>/planning/PLAN-USER-NEEDS.md` dan `PLAN-COMPETITOR.md`.
3. **Brainstorming (`/brainstorming`) — Sesi Interaktif**
   Sesi dialog multi-turn dengan user untuk menggali preferensi desain. Menghasilkan `landings/<brand>/intake/user_preferences.md`.
4. **Rekonsiliasi & Review (`[HARD STOP]`)**
   Menggabungkan `intake_compro.md` dan `user_preferences.md` menjadi `landings/<brand>/intake/final_intake.md`. User review dan approve.
5. **Global Design & Planning (`/planner`, `/ui-ux-pro-max`, `/impeccable`)**
   Membuat `PLAN-GLOBAL.md`, `PLAN-DESIGN-SYSTEM.md`, dan `PAGES-LIST.md`.
6. **PRD Batch & Asset Mapping (`/planner`, `/qa-reviewer`)**
   Generate PRD per halaman, QA review, merge menjadi `PRD.md`, dan buat `ASSET-MAPPING.md`.
7. **Eksekusi Halaman (`/generator`, `/qa-reviewer`) — Loop per Halaman**
   Scaffold Next.js (hanya 1x), lalu build setiap halaman dengan generator, QA review, Playwright test.
8. **Integration**
   Gabungkan navigasi antar halaman.
9. **SEO & Debug Final (`/seo`, `/debug`)**
   Validasi SEO dan debug lokal final.
10. **User Review Final (`[HARD STOP]`)**
11. **Deploy (`/deploy`)**
12. **Post-Deploy Debug (`/debug`)**
13. **Cleanup**

## 📁 Struktur Direktori Repositori

- `intake/` — Modul untuk ekstraksi dan konsolidasi data aset (PDF/brand).
- `research/` — Modul riset target user dan kompetitor.
- `planner/` — Modul perumus arsitektur aplikasi (pembuat PRD).
- `qa-reviewer/` — Modul quality control dokumen perencanaan.
- `generator/` — Mesin pembuat kode berbasis Next.js.
- `seo/` — Modul audit Search Engine Optimization.
- `debug/` — Sistem iteratif perbaikan masalah kode (UI/UX, hydration, & error).
- `deploy/` — Integrasi continuous deployment ke Vercel.
- `scripts/` — Skrip utilitas pelengkap.
- `SKILL.md` — Inti instruksi untuk orkestrator utama agar memahami cara merantai sub-skill di atas.

## 🛠 Cara Penggunaan

Cukup berikan agen (AI) instruksi untuk memulai pembuatan website melalui kerangka kerja Sitegen. 
Contoh instruksi:
> *"Tolong buatkan website untuk brand [Nama Brand], aset company profile ada di direktori X. Gunakan alur master Sitegen."*

Agen akan secara otomatis memuat `SKILL.md` utama, membaca daftar periksa, dan melimpahkan (delegate) pekerjaan ke masing-masing sub-skill step-by-step.
