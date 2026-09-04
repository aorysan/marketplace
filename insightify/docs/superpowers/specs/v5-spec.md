# Insightify v5 Spec & Design Document

## Ringkasan Perubahan v5

Insightify v5 membawa perombakan besar (major overhaul) dari sisi interaksi, fleksibilitas dokumen, dan kualitas output visual. Perbaikan difokuskan pada 4 area utama yang diidentifikasi dari perbandingan dengan reference artifact.

### 1. Flow & UX Pipeline (P0)

- **Fresh Session Guard:** Agen kini diinstruksikan dengan sangat ketat (melalui hard gate) untuk **wajib** melakukan prompt *project name* dan *sources* pada setiap kali run baru tanpa flag `--resume`. AI tidak diperbolehkan menginferensi sumber secara otomatis dari workspace.
- **State Isolation & Stale Data Cleanup:** Apabila direktori output `.insightify` sudah ada pada fresh run, sistem harus memberikan peringatan (warning) kepada pengguna sebelum menimpa data lama untuk mencegah terjadinya pencampuran data.
- **Progress & Error Recovery:** Ditambahkan mekanisme update state checkpoint yang lebih baik (menyimpan *current step* di `state.md`) agar flag `--resume` dapat berjalan mulus.

### 2. Project Type Detection & Template Consolidation (P1)

Kategori 14 halaman yang sangat berorientasi *frontend* di versi sebelumnya diubah menjadi lebih fleksibel.
- **Phase 0 (Project Type Detection):** Di Planner, agen akan mendeteksi apakah kode yang di-*ingest* adalah `frontend-spa`, `backend-api`, `system-design`, atau `general`.
- **Parameterizable Planning:** `plan-template.md` tidak lagi *hardcoded* ke 14 file dan 5 waves, melainkan dinamis sesuai archetype.
- **Writer Templates:** 14 template Writer dikonsolidasikan menjadi 5 template dasar yang dapat digunakan ulang (Reusable Base Templates): `overview`, `catalog`, `architecture`, `reference`, dan `appendix`.

### 3. Visual Overhaul Builder (HTML & CSS) (P1)

Menggantikan desain *sidebar-heavy* dengan *single-page scrolling* yang jauh lebih premium dan responsif, diinspirasi oleh "Sistem Antrian MPP" artifact.
- **Layout:** Menggunakan *full-width scroll* dengan *floating Table of Contents (TOC)* di sisi kanan atas halaman.
- **Color Palette & Typography:** Palet warna *warm earth tones* (`#faf8f5` cream background, amber/brown headings) dan font serif elegan (`Playfair Display` atau miripnya) untuk heading hierarkis.
- **Section Numbering:** Nomor bab (misal: 01, 02) diletakkan di samping kiri heading untuk kemudahan *skimming*.
- **Custom CSS Components:** Builder dimampukan untuk mengkonversi Markdown *directives* menjadi UI components kaya, seperti:
  - `.card-grid`: Grid berkolom untuk data katalog/kebijakan.
  - `.state-machine` & `.flow-diagram`: Diagram proses bisnis berdasar CSS murni.
  - `.info-block`: Blockquote kaya dengan styling warna latar belakang.

### 4. Builder Logic & Quality of Life Updates (P2)

- **No Absolute Paths:** Membuang semua path *hardcoded absolute* di script Planner dan Builder agar dapat berjalan secara universal.
- **Knowledge Base TOC:** File penggabungan akhir (`knowledge-base.md`) otomatis diberi Table of Contents agar mudah dibaca di IDE.
- **CSS Diagram Rendering:** `build-html.mjs` diperbarui agar mampu memparsing custom directive (contoh: `:::flow`) menjadi tag HTML berkelas.

---

*Spec ini disusun saat upgrade dari v4.1.1 ke v5.0.0 untuk memastikan kualitas output dokumentasi standar premium.*
