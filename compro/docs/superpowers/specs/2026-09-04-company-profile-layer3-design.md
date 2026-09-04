# Layer 3 — Company Profile Plugin Specification

**Date:** 2026-09-04  
**Status:** Approved (Ready for Implementation Planning)  
**Authors:** Aryo Adi Putro, Antigravity AI  

---

## 1. Overview & Objectives

Dokumen spesifikasi ini mendefinisikan arsitektur multi-agen untuk **Layer 3 — Company Profile**, mengonversi data mentah bisnis menjadi presentasi slide interaktif berbasis web (Reveal.js) yang teroptimasi SEO dan siap dideploy ke Vercel.

Spesifikasi ini menyelaraskan repositori dengan arsitektur resmi Layer 3 yang terdiri dari 4 skill terintegrasi:
* **No. 8: `company-profile-writer`** — Penulisan draf narasi company profile berbasis slide.
* **No. 9: `company-profile-reviewer`** — Quality assurance draf, akurasi fakta bisnis, tone merek, dan content SEO.
* **No. 10: `company-profile-builder`** — Perakitan single-file HTML Reveal.js slide deck dengan CSS inlined.
* **No. 11: `company-profile-publisher`** — Pre-flight audit & auto-fix technical SEO, konfirmasi user, dan deployment ke Vercel.

Arsitektur ini dikoordinasikan secara otomatis oleh orchestrator **`compro`** berbasis *state-machine* dan komunikasi antar file di disk (*filesystem-based contract*).

---

## 2. Pipeline Architecture & Data Flow

```text
               [ Dokumen Input Bisnis ]
               ├── business-knowledge-base.md
               ├── business-audit-report.md
               └── brand-story-guide.md
                          │
                          ▼
            ┌───────────────────────────┐
            │  8. company-profile-writer│ ◄──────────┐
            └─────────────┬─────────────┘            │ (Revisi draf
                          │                          │  jika belum approved,
                          ▼                          │  maksimal 3 loop)
            ┌───────────────────────────┐            │
            │9. company-profile-reviewer├────────────┘
            └─────────────┬─────────────┘
                          │ (Final Company Profile - APPROVED)
                          ▼
            ┌───────────────────────────┐
            │ 10. company-profile-builder
            └─────────────┬─────────────┘
                          │ (Single-File HTML Reveal.js, inlined CSS)
                          ▼
            ┌───────────────────────────┐
            │11. company-profile-publisher
            │   ├── 1. Pre-flight SEO   │ (Audit tag, OpenGraph, Schema)
            │   └── 2. Auto-Fix HTML    │ (Auto-patch tag yang kurang)
            └─────────────┬─────────────┘
                          │
                          ▼
            [ USER CONFIRMATION GATE ] ── (Stop & minta konfirmasi deploy)
                          │ (Jika user menyetujui)
                          ▼
            ┌───────────────────────────┐
            │ Vercel Deployment (CLI)   │ (Adopsi vercel-labs/deploy-to-vercel)
            │ + Validasi HTTP GET 200   │
            └─────────────┬─────────────┘
                          │
                          ▼
                [ Live Website Vercel ]
```

---

## 3. Detailed Skill Specifications

### 3.1 Orchestrator: `compro` (`skills/compro/SKILL.md`)
* **Tujuan:** State-machine driver yang memandu seluruh siklus hidup pipeline tanpa intervensi manual antar tahap kecuali pada gerbang konfirmasi user.
* **Tahapan Pipeline:**
  1. **Gate 0 (Intake Check):** Memeriksa ketersediaan `input/business-knowledge-base.md`, `input/business-audit-report.md`, dan `input/brand-story-guide.md`. Jika tidak lengkap, berhenti dan beri tahu user.
  2. **Phase 1 (Drafting):** Memanggil `/company-profile-writer` untuk membuat draf awal.
  3. **Phase 2 (Content Review Loop):** Memanggil `/company-profile-reviewer`. Jika status `REVISION_REQUIRED`, kirim feedback kembali ke `/company-profile-writer` (maksimal 3 iterasi). Setelah `APPROVED`, lanjutkan.
  4. **Phase 3 (Deck Assembly):** Memanggil `/company-profile-builder` untuk merakit HTML slide deck.
  5. **Phase 4 (Pre-flight Audit & Auto-Fix):** Memanggil `/company-profile-publisher` untuk mengaudit dan menambal technical SEO pada HTML.
  6. **Gate 5 (User Confirmation Gate):** Menampilkan ringkasan kesiapan slide dan meminta persetujuan user sebelum deploy.
  7. **Phase 6 (Deployment):** Setelah konfirmasi user diterima, eksekusi deployment ke Vercel via script publisher.

---

### 3.2 Skill 8: `company-profile-writer` (`skills/company-profile-writer/SKILL.md`)
* **Peran:** Menulis draf presentasi company profile terstruktur (Markdown) yang padat, persuasif, dan siap dipisah menjadi slide.
* **Input:**
  * `input/business-knowledge-base.md`: Fakta perusahaan (sejarah, profil, portofolio produk/jasa, metrik, kontak).
  * `input/business-audit-report.md`: Analisis pain points klien, keunggulan kompetitif, diferensiasi pasar.
  * `input/brand-story-guide.md`: Tone of voice (profesional, inspiratif, dll.), target audiens, panduan merek.
* **Output:**
  * `artifacts/01-company-profile-draft.md`
* **Aturan & Standar:**
  1. **Struktur Slide Baku:**
     * *Hero Slide:* `# [Judul Perusahaan]`, tagline, ringkasan 1 kalimat, 2-3 bullet point statistik kunci.
     * *Problem Slide:* `# Masalah Industri`, 3 poin masalah utama pelanggan.
     * *Solution & Offer Slide:* `# Solusi & Layanan Unggulan`, deskripsi fitur, benefit utama.
     * *Traction / Social Proof Slide:* `# Pencapaian & Testimoni`, metrik terukur.
     * *Pricing / Packages Slide:* `# Paket Layanan` (tabel ringkas jika relevan).
     * *Contact / CTA Slide:* `# Hubungi Kami`, nomor kontak, email, alamat, website.
  2. **Chunking Deterministic:** Setiap slide utama diawali `# ` (H1). Konten per slide dibatasi 150–250 kata.
  3. **Zero Hallucination:** Semua data angka, penghargaan, dan fakta wajib berasal dari dokumen input bisnis.
  4. **Visual Directives:** Menyertakan placeholder gambar atau referensi aset lokal (`![Hero](assets/hero.jpg)`).

---

### 3.3 Skill 9: `company-profile-reviewer` (`skills/company-profile-reviewer/SKILL.md`)
* **Peran:** Auditor kualitas konten, penjaga konsistensi brand, serta perumus metadata On-Page SEO.
* **Input:**
  * `artifacts/01-company-profile-draft.md`
  * Dokumen input bisnis (`business-knowledge-base.md`, `business-audit-report.md`, `brand-story-guide.md`).
* **Checklist Audit:**
  1. *Factual Consistency:* Verifikasi tidak ada klaim keliru atau angka yang bertentangan dengan knowledge base.
  2. *Narrative & Brand Tone:* Verifikasi kesesuaian dengan tone panduan brand, tidak terlalu kaku atau bertele-tele.
  3. *Slide Hierarchy & Capacity:* Memastikan setiap section H1 tidak melebihi 250 kata; tabel diformat rapi.
  4. *Content SEO & Metadata:* Memeriksa kejelasan judul slide dan merumuskan draf `Meta Title` & `Meta Description` di awal file draf.
* **Output:**
  * `artifacts/review-report.md`: Laporan evaluasi per kategori.
  * `artifacts/02-company-profile-final.md`: Dokumen final berstatus **`APPROVED`** yang siap dikonsumsi Builder.

---

### 3.4 Skill 10: `company-profile-builder` (`skills/company-profile-builder/SKILL.md`)
* **Peran:** Mengonversi `artifacts/02-company-profile-final.md` menjadi presentasi web interaktif berbasis Reveal.js.
* **Input:**
  * `artifacts/02-company-profile-final.md`
  * `templates/profile-shell.html` & `templates/custom.css`
  * Folder aset lokal: `assets/` (jika ada).
* **Solusi Single-File HTML & CSS Inlining:**
  * Builder membaca template shell HTML dan membaca stylesheet `custom.css`.
  * Seluruh isi `custom.css` (variabel warna, tipografi Inter, kartu fitur, tabel, hero layout) diinjeksi **langsung ke dalam tag `<style>`** di dalam `<head>`.
  * Menghilangkan dependensi external stylesheet `<link rel="stylesheet" href="custom.css">`, sehingga file `index.html` dapat dibuka secara mandiri tanpa risiko 404 style hilang.
* **Logika Chunking:**
  * Setiap H1 (`#`) dipetakan menjadi elemen `<section>` (1 slide).
  * Section >250 kata dipecah berdasarkan H2/H3 atau pemisah paragraf natural.
  * Tabel data (>5 baris) diberi slide terpisah.
* **Penanganan Gambar:**
  * Remote URL diverifikasi via HTTP HEAD request (harus 200).
  * Gambar lokal disalin ke `<project>/compros/<name>/assets/` dan direferensikan secara relatif.
  * Gambar gagal/hilang tidak menggunakan placeholder rusak; teks tetap tampil utuh dan isu dicatat di `build.log`.
* **Output Directory:**
  ```text
  <project>/compros/<name>/
  ├── index.html       ← Single-file HTML Reveal.js (CSS inlined)
  ├── compro.md        ← Salinan Markdown final
  ├── assets/          ← Aset lokal yang digunakan
  └── build.log        ← Log chunking dan status gambar
  ```

---

### 3.5 Skill 11: `company-profile-publisher` (`skills/company-profile-publisher/SKILL.md`)
* **Peran:** Pre-flight technical SEO auditor, auto-fixer, gatekeeper persetujuan user, dan deployer Vercel.
* **Input:**
  * `<project>/compros/<name>/index.html`
  * `<project>/compros/<name>/assets/`
* **Tahap 1: Pre-flight Audit & Technical SEO Auto-Fix (Adopsi `affaan-m/ecc/seo`):**
  Publisher memindai `index.html` dan otomatis menambal (*auto-patch*):
  1. *Title & Meta Description:* Mengisi jika kosong/placeholder dengan nama entitas dan tagline dari hero slide.
  2. *Open Graph Meta:* Menambahkan `og:title`, `og:description`, `og:type` ("website"), dan `og:image` (mengarah ke hero/logo).
  3. *Structured Data (JSON-LD):* Menyisipkan schema `Organization` atau `LocalBusiness` lengkap dengan nama, deskripsi, dan kontak.
  4. *Image Alt Text:* Memastikan setiap tag `<img>` memiliki atribut `alt` deskriptif.
  5. *CDN Connectivity:* Memeriksa ketersediaan CDN Reveal.js via HEAD request (status 200).
  *Catat seluruh audit dan daftar patch ke `qa/seo-report.md`.*
* **Tahap 2: Penyiapan Folder Deployment Bersih:**
  * Membuat folder temporer deploy flat (hanya berisi `index.html` yang sudah ter-auto-fix dan folder `assets/`).
  * File internal (`compro.md`, `build.log`) tidak disertakan agar tidak terunggah ke web publik.
* **Tahap 3: User Confirmation Gate:**
  * Berhenti dan menampilkan ringkasan kesiapan slide ke user.
  * Menyajikan path lokal file HTML untuk peninjauan mandiri.
  * Menanyakan persetujuan user: *"Apakah Anda ingin men-deploy slide ini ke Vercel sekarang?"*
* **Tahap 4: Eksekusi Deployment Vercel (Adopsi `vercel-labs/deploy-to-vercel`):**
  * Script `deploy.js` memeriksa status Vercel CLI (`vercel --version`) dan auth (`vercel whoami`).
  * Mengeksekusi: `vercel deploy <folder> --yes --no-wait`.
  * Menyaring URL preview domain `https://*.vercel.app` secara presisi.
  * Memvalidasi keterjangkauan live URL menggunakan modul `https` (HTTP GET status 200 OK).
* **Output:**
  * URL Preview Vercel live.
  * `qa/seo-report.md`
  * `deploy/deployment-status.md`

---

## 4. Directory Structure & File Manifest

Struktur direktori plugin setelah implementasi:

```text
D:\AryokPunya\Magang\compro\.claude\plugins\compro\
├── .codex-plugin/
│   └── plugin.json                    # Registrasi seluruh skill plugin
├── skills/
│   ├── compro/                        # Orchestrator
│   │   └── SKILL.md
│   ├── company-profile-writer/        # Skill 8
│   │   └── SKILL.md
│   ├── company-profile-reviewer/      # Skill 9
│   │   └── SKILL.md
│   ├── company-profile-builder/       # Skill 10
│   │   ├── SKILL.md
│   │   └── templates/
│   │       ├── profile-shell.html
│   │       └── custom.css
│   └── company-profile-publisher/     # Skill 11
│       ├── SKILL.md
│       └── scripts/
│           └── deploy.js              # Helper script Vercel CLI + HTTP GET check
├── assets/                            # Global assets (logo, banner default)
├── docs/
│   └── superpowers/
│       ├── specs/
│       │   └── 2026-09-04-company-profile-layer3-design.md
│       └── plans/
└── README.md                          # Dokumentasi mutakhir Layer 3
```

### Format `plugin.json` (`.codex-plugin/plugin.json`):
```json
{
  "name": "compro",
  "description": "Layer 3 Company Profile Multi-Agent Plugin with Slide Deck Generator & Vercel Deployment",
  "version": "2.0.0",
  "skills": [
    {
      "name": "compro",
      "path": "skills/compro/SKILL.md"
    },
    {
      "name": "company-profile-writer",
      "path": "skills/company-profile-writer/SKILL.md"
    },
    {
      "name": "company-profile-reviewer",
      "path": "skills/company-profile-reviewer/SKILL.md"
    },
    {
      "name": "company-profile-builder",
      "path": "skills/company-profile-builder/SKILL.md"
    },
    {
      "name": "company-profile-publisher",
      "path": "skills/company-profile-publisher/SKILL.md"
    }
  ]
}
```

---

## 5. Error Handling & Edge Cases

| Skenario | Penanganan |
|---|---|
| Dokumen intake tidak lengkap | Orchestrator berhenti di Gate 0, menampilkan daftar file yang kurang. |
| Draf tidak lolos review setelah 3x loop | Reviewer berhenti, menyajikan draf terakhir + isu yang belum selesai ke user. |
| Aset gambar 404 / tidak terjangkau | Builder mengabaikan gambar, slide tetap rapi, dicatat di `build.log`. |
| Tag SEO hilang pada HTML hasil Builder | Publisher melakukan *Auto-Fix* otomatis (menyuntikkan tag meta dan schema JSON-LD). |
| User menolak deploy di Gerbang Konfirmasi | Pipeline berhenti dengan status selesai lokal; file HTML tetap tersimpan di disk. |
| Vercel CLI tidak terpasang / belum login | Publisher memberikan panduan terminal jelas (`npm i -g vercel` / `vercel login`). |
| Preview URL Vercel tidak merespons (bukan 200) | Script mencoba ulang (retry) 3x jeda 3 detik; laporkan error jika tetap gagal. |

---

## 6. Verification & Testing Strategy

1. **Uji Intake & Writer:** Berikan file mock intake lengkap, pastikan `artifacts/01-company-profile-draft.md` tercipta dengan struktur slide baku (H1, 150–250 kata).
2. **Uji Reviewer Loop:** Uji draf yang memiliki inkonsistensi fakta untuk memverifikasi review report menangkap error dan mengulang revisi hingga `APPROVED`.
3. **Uji Single-File Builder:** Pastikan file output `index.html` memuat CSS inlined secara utuh di tag `<style>`, dan slide Reveal.js dapat dibuka serta dinavigasikan secara offline/lokal tanpa dependensi `custom.css` eksternal.
4. **Uji SEO Auto-Fix Publisher:** Berikan `index.html` tanpa meta tags; verifikasi bahwa Publisher berhasil menyisipkan Title, Description, Open Graph, dan JSON-LD schema ke file sebelum deploy.
5. **Uji Confirmation Gate:** Pastikan CLI deploy tidak berjalan sebelum user memberi instruksi konfirmasi eksplisit.
6. **Uji Script Deploy:** Jalankan `deploy.js` dalam mode dry-run/preview, verifikasi penangkapan URL `https://*.vercel.app` dan pengetesan HTTP GET 200.
