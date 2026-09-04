# Sitegen Master Skill Improvement Design

## 1. Goal
Memperbaiki kelemahan pada eksekusi generator website `sitegen` yang sering menghasilkan UI/UX bermasalah (layout aneh, animasi hilang), ketiadaan gambar, serta aliran data intake/brainstorming yang belum optimal. 

## 2. Core Improvements

### 2.1. Integrasi UI/UX Pro Max & Impeccable (Anti Layout Aneh/Animasi Hilang)
- **Masalah:** Hasil generate sering aneh dan animasi hilang walau instruksi `generator` ada.
- **Solusi:** `SKILL.md` utama (Master Orchestrator) akan DIWAJIBKAN memanggil sub-skill `ui-ux-pro-max` dan `impeccable` **tepat sebelum menulis kode halaman/komponen**.
- **Garansi:** Kode tidak boleh di-commit/selesai ditulis sebelum melewati validasi ketat dari kedua skill ini. Aturan layout dan `AnimatedSection` (Anime.js) dikunci secara rigid dalam instruksi prompt.

### 2.2. Manajemen Aset Gambar Otomatis & Cerdas
- **Aturan Baru Generator:** 
  1. Cari gambar di `final_intake.md` atau aset Compro.
  2. Jika cocok, gunakan.
  3. Jika gambar kurang atau tidak cocok, Agen **wajib** melakukan pencarian (web search) untuk URL gambar yang relevan.
  4. Agen **wajib** melakukan ping/HTTP Request ke URL gambar tersebut untuk memastikan HTTP Status 200 (bukan 404/broken).
  5. Setelah diverifikasi, embed gambar dengan responsif (`width: 100%`, `height: auto`, `object-fit: cover`).

### 2.3. Rekonsiliasi Intake & User Preferences
- **Alur Data Baru:**
  - `intake_compro.md`: Hasil ekstraksi mentah dari PDF.
  - `user_preferences.md`: Hasil sesi brainstorming (Visi, Misi, Tema Font, UI/UX).
  - Agen wajib membaca kedua file, menggabungkannya secara harmonis, dan menyimpannya sebagai `final_intake.md` di direktori root website target (`landings/<brand>/`).
  - **Hard Gate:** Hasil rekonsiliasi ini WAJIB diperlihatkan ke user untuk review sebelum masuk tahap Global Design.

### 2.4. Instalasi Sub-skill SEO Eksternal
- **Perintah:** Jalankan instalasi `npx skills add https://github.com/affaan-m/everything-claude-code --skill seo` agar masuk sebagai sub-skill dari `sitegen`.
- **Eksekusi:** Master skill akan memanggil `seo` ini di tahap SEO Validation sebelum deploy.

### 2.5. Pengetatan `debug` & `systematic-debugging`
- `debug/SKILL.md` akan diperketat:
  - Validasi UI/UX hasil render Wajib mencocokkan dengan `final_intake.md` (terutama estetika font, warna, visi misi).
  - Skrip Puppeteer Crawler akan dibuat gagal (Hard Fail) jika mendeteksi ketiadaan animasi (elemen tidak ter-render dengan benar) atau layout yang keluar batas (overflow-x).
  - Jika ditemui error visual yang bandel > 2 iterasi, Agen **wajib** memanggil `/systematic-debugging` secara komprehensif, tidak boleh lanjut ke halaman berikutnya.

## 3. Scope
Pembaruan terbatas pada file-file markdown skill (`SKILL.md` utama, `generator/SKILL.md`, `debug/SKILL.md`) dan pemanggilan script sub-skill instalasi.

## 4. Next Steps
Jika desain ini disetujui, kami akan melanjutkan ke tahap pembuatan plan (writing-plans).
