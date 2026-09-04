# Spesifikasi Desain: Rekonstruksi Struktur Direktori Sitegen (4-Pillars Clean Architecture & Zero-Duplication Storage)

- **Tanggal**: 2026-08-06
- **Status**: Siap untuk Review User
- **Target Proyek**: Modul & Panduan Orkestrasi `sitegen` (`D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen`)

---

## 1. Konteks & Motivasi Masalah
Pada implementasi awal pipeline `sitegen`, direktori `landings/<brand>/` difungsikan sebagai ruang kerja tunggal (*single workspace*) yang memuat seluruh output sementara, hasil ekstraksi mentah, dokumen perencanaan, laporan audit, sekaligus kode aplikasi web akhir Next.js. 

Pendekatan ini menimbulkan dua masalah kritis:
1. **Polusi Direktori Root (Workspace Clutter):** Saat tahap pembuatan website (Generator Next.js) dieksekusi, folder root proyek web diokupasi oleh puluhan file non-aplikasi (seperti `intake_raw.json`, `intake_compro.md`, `user_preferences.md`, `final_intake.md`, `PRD.md`, `SEO-REPORT.md`, dan folder `planning/`).
2. **Pemborosan Memori Penyimpanan (Storage Redundancy):** Tahap generator sebelumnya menduplikasi (*copy*) gambar hasil ekstraksi dari `assets/` ke `public/assets/`, memicu duplikasi data gambar dua kali lipat dalam satu direktori brand yang memboroskan ruang penyimpanan lokal.

Tujuan desain ini adalah menerapkan isolasi batas tanggung jawab yang jernih (*separation of concerns*) bertemakan *mini-monorepo* (4 pilar direktori kerja), serta mengeliminasi duplikasi aset fisik secara total melalui آلehan migrasi (*move*) murni.

---

## 2. Arsitektur 4-Pilar Direktori Kerja

Mulai pada versi ini, root direktori `landings/<brand>/` dilarang memuat file sementara (log, analisis, atau dokumen AI). Ruang kerja dipilah secara ketat ke dalam 4 folder pilar fungsional:

```text
landings/<brand>/
├── intake/                   # [TAHAP 1-2] Eksklusif Ekstraksi & Rekonsiliasi Compro
│   ├── assets/               # Folder gambar mentah beresolusi dari Compro (sebelum dipindah)
│   ├── intake_raw.json       # Data warna & metadata visual dari extract.py
│   ├── intake_compro.md      # Rekonstruksi komersial & label [No-Video Default]
│   ├── user_preferences.md   # Rekapitulasi keputusan sesi brainstorming user
│   └── final_intake.md       # Dokumen rekonsiliasi final data compro + preferensi
│
├── planning/                 # [TAHAP 3-5] Eksklusif Perencanaan & Blueprint
│   ├── PLAN-USER-NEEDS.md    # Riset JTBD, objection analysis & trigger audiens
│   ├── PLAN-COMPETITOR.md    # Analisis kompetitor & gap keyword SEO
│   ├── PLAN-GLOBAL.md        # Visi produk, struktur sitemap & fondasi strategi
│   ├── PLAN-DESIGN-SYSTEM.md # Spesifikasi Warna, Tipografi & Animasi Zenless/Modern
│   ├── PAGES-LIST.md         # Pemetaan sitemap operasional generator
│   ├── PLAN-<halaman>.md     # PRD mendalam per halaman (Shift-Left SEO injection)
│   ├── ASSET-MAPPING.md      # Pemetaan spesifik visual nyata ke section UI
│   └── PRD.md                # Master Blueprint PRD konsolidasi total
│
├── web/                      # [TAHAP 6+] Eksklusif Proyek Web Next.js (Clean App Zone)
│   ├── public/assets/        # Destinasi aset nyata pasca-migrasi (Move) dari intake/
│   ├── app/                  # Struktur kode native Next.js App Router & Vanilla CSS
│   ├── next.config.ts        # Konfigurasi aplikasi & remotePatterns
│   └── package.json          # Dependensi Next, Lenis, Anime.js, Lucide, Framer Motion
│
└── reports/                  # [TAHAP 7] Eksklusif Evaluasi, Audit QA & Bukti Visual
    ├── SEO-REPORT.md         # Laporan temuan audit dan status remidiasi dari skill seo
    ├── lighthouse-report.html# Dokumen laporan performa Lighthouse CLI
    └── .preview/             # Hasil tangkapan layar Playwright untuk visual debugging
```

---

## 3. Alur Data & Migrasi Aset (Zero-Duplication Data Flow)

Alur pertukaran informasi antar tahapan dirancang sekuensial dan tidak boleh menyilang batas direktori yang salah:

1. **Intake & Rekonsiliasi:** 
   - Script `extract.py` disuplai parameter direktori output `landings/<brand>/intake/`.
   - Sub-skill `intake` merename foto secara semantik langsung di `intake/assets/` dan memvalidasi kehadiran video sesuai Pasal III Konstitusi. Jika nihil, mencetak label **`[No-Video Default]`** pada `intake/intake_compro.md`.
   - Sub-skill `brainstorming` menyatukan `intake_compro.md` dan `intake/user_preferences.md` menjadi **`intake/final_intake.md`**.
2. **Perencanaan Paralel & Konsolidasi PRD:**
   - Seluruh sub-skill `planner` dan subagent paralel (A, B, dan Planner Halaman) HANYA membaca input dari `intake/final_intake.md`.
   - Seluruh output perencanaan disimpan eksklusif ke `landings/<brand>/planning/`. Dokumen `planning/ASSET-MAPPING.md` merujuk gambar dari `intake/assets/` sebelum digeser ke aplikasi.
3. **Scaffolding Web & Relokasi Permanen Aset (Zero-Duplication Move):**
   - Sub-skill `generator` melakukan instalasi aplikasi di sub-folder baru: `npx -y create-next-app@latest ./landings/<brand>/web ...`.
   - **Kewajiban Relokasi Penuh:** Untuk menghindari pemborosan memori penyimpanan (penyepuluhan dua kali lipat), generator DILARANG melakukan copy/duplikasi atau symlink. Generator WAJIB MEMINDAHKAN TOTAL (*Move-Item* / `mv`) seluruh isi dari `landings/<brand>/intake/assets/` menuju `landings/<brand>/web/public/assets/`. Pasca eksekusi, folder `intake/assets/` akan terosongkan secara alamiah dan gambar terpusat 100% di web.
4. **Audit SEO, Remediasi, & Debug Final:**
   - Audit `seo` memindai kode didapat pada `landings/<brand>/web/`, lantas mencatat laporannya di `landings/<brand>/reports/SEO-REPORT.md`.
   - Proses pengujian performa Lighthouse dan kamera Playwright mengambil sampel saat dev server hidup dari direktori `web/`, tetapi menaroh seluruh output inspeksi (html & screenshot `.preview/`) terkelompok aman di dalam `landings/<brand>/reports/`.

---

## 4. Rincian Modifikasi Komponen Skill (Scope of Changes)

Pembaruan spesifikasi path dan ketentuan migrasi dibekukan pada 8 dokumen spesifik:

| File Target | Modifikasi Kritis |
| :--- | :--- |
| `SKILL.md` (Master Orchestrator) | Memodifikasi tabel Onboarding, Step 1 (Intake path), Step 2 & 3 (Planning path), Step 6 (Generator web target path & aset move rule), dan Step 7 (SEO/Debug reports path). |
| `README.md` | Mengubah dokumentasi arsitektur direktori hasil build di dalam `landings/<brand>/`. |
| `intake/SKILL.md` | Mengarahkan parameter output `extract.py`, lokasi penyimpanan `intake_raw.json`, aset semantik, dan `intake_compro.md` ke folder `landings/<brand>/intake/`. |
| `brainstorming/SKILL.md` | Mengubah target bacaan dari `intake_compro.md` dan peletakan file output `user_preferences.md` serta `final_intake.md` agar mengarah ke `landings/<brand>/intake/`. |
| `brainstorming/AGENTS.md` | Mengupdate hukum pencatatan sesi konsolidasi agar disimpan tepat di `landings/<brand>/intake/user_preferences.md`. |
| `planner/SKILL.md` (termasuk referensi) | Memetakan target bacaan dari `intake/final_intake.md` dan penulisan seluruh `PLAN-*.md`, `ASSET-MAPPING.md`, hingga `PRD.md` menuju folder `landings/<brand>/planning/`. |
| `generator/SKILL.md` | 1. Memperbarui CLI scaffold menjadi `create-next-app ./landings/<brand>/web`.<br>2. Menetapkan aturan wajib MEMINDAHKAN TOTAL (*Move-Item*) gambar dari `intake/assets/` ke `web/public/assets/`. |
| `seo/SKILL.md` & `debug/SKILL.md` | Mengatur rute direktori eksekusi server web pada `landings/<brand>/web/`, serta menjatuhkan laporan temuan `SEO-REPORT.md`, `lighthouse-report.html`, dan screenshot `.preview/` eksklusif ke folder `landings/<brand>/reports/`. |

---

## 5. Penanganan Error & Kasus Batas (Error Handling & Edge Cases)

1. **Re-run Safeguard (Perlindungan Eksekusi Ulang Generator):**
   - *Masalah:* Karena aset dipindahkan secara total (*move*) dari `intake/assets/` ke `web/public/assets/` pada saat Generator berjalan, jika eksekusi Generator terputus di tengah jalan atau sengaja dijalankan ulang oleh user, eksekusi pemindahan aset yang kedua kali akan gagal/error karena `intake/assets/` sudah kosong/hilang.
   - *Solusi & Logika Pembatas (Guard Logic):* Pada instruksi Generator disisipkan klausul pengecekan kondisionir: *"Sebelum menggeser aset, verifikasi apakah file gambar sudah terpasang rapi di `web/public/assets/`. Jika `web/public/assets/` sudah memuat foto-foto dari compro, maka abaikan/SKIP proses perpindahan dari `intake/assets/` dengan aman tanpa melempar fatal error."*
2. **Kekeliruan Eksekusi Terminal (Wrong-Directory Execution Proof):**
   - Semua perintah shell CLI interaktif (seperti `npm init playwright`, `npm install`, `npm run dev`, `npx tsc`, `npm run build`) pada panduan skill dan orchestrator diwajibkan menulis untaian perintah komplit beralamat mutlak: `cd landings/<brand>/web && npm ...` (tidak dibenarkan lagi hanya mengetik `cd landings/<brand>`).

---

## 6. Strategi Verifikasi & Rencana Pengujian (Testing Plan)

Setelah seluruh perubahan teks panduan diaplikasikan, verifikasi kestabilan sistem akan dilakukan melalui:
1. **Pemeriksaan Statis (Static Zero-Pollution Audit):** Menggunakan perkakas `grep_search` pada direktori skill `.agents/skills/sitegen/` untuk melacak string kuno yang merusak pembatasan, seperti:
   - `landings/<brand>/PRD.md`
   - `landings/<brand>/intake_compro.md`
   - `landings/<brand>/package.json`
   - `landings/<brand>/SEO-REPORT.md`
   *Kriteria Sukses:* Hasil pencarian grep wajib nihil (0 matches), menegaskan seluruh instruksi sudah menggunakan sub-folder 4 pilar.
2. **Inspeksi Integritas Rantai (Pipeline Trace Audit):** Memverifikasi bahwa string rujukan input setiap skill penerima (misal `planner` yang membaca dari `intake/final_intake.md` atau `generator` yang membaca dari `planning/PRD.md` dan memindahkan dari `intake/assets/`) seimbang 1-berbanding-1 dengan penamaan direktori output agen pengirim sebelumnya.

---
*Dokumen ini merupakan kontrak rancangan arsitektur sebelum pembentukan Rencana Implementasi (Implementation Plan).*
