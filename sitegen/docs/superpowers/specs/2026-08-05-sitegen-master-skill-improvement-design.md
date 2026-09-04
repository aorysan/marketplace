# Desain Spesifik Peningkatan Arsitektur Masterskill Sitegen dan Sub-skill

**Tanggal**: 2026-08-05  
**Target Pembaruan**: `.agents/skills/sitegen/` (Masterskill `sitegen`, Sub-skill `generator`, Sub-skill `seo`, Alur `planner` & `qa-reviewer`)

---

## 1. Latar Belakang & Tujuan
Investigasi menyeluruh terhadap ekosistem masterskill `sitegen` menemukan lima area kontradiksi aturan dan kesenjangan integrasi. Pembaruan ini bertujuan menyelaraskan aturan antar-berkas (`SKILL.md` dengan `AGENTS.md`), menyatukan ekosistem library animasi (Trilogi Animasi AAA), mengimplementasikan pendekatan shift-left untuk optimasi SEO, serta memperkuat kepastian protokol batas iterasi perbaikan dan pengujian visual nyata.

---

## 2. Rincian Desain Arsitektur & Perubahan Berkas

### 2.1 Resolusi Kontradiksi Library Animasi (Framer Motion vs Anime.js)
* **Masalah Saat Ini**: Berkas `generator/SKILL.md` (Prinsip 1) melarang penggunaan `framer-motion` dan tidak menginstalnya pada tahapan scaffolding. Di sisi lain, `generator/AGENTS.md` (Pasal III.3) dan `sitegen/SKILL.md` mewajibkan kombinasi Anime.js dan Framer Motion sebagai pilar Trilogi Animasi AAA.
* **Target Berkas**: `D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen\generator\SKILL.md`
* **Spesifikasi Perubahan**:
  1. **Prinsip 1 (Estetika & Animasi)**: Hapus kalimat *"DILARANG KERAS MENGGUNAKAN framer-motion"*. Ubah ketetapan menjadi: Wajib memadukan **Anime.js** (untuk mikro-staggering dan masuknya elemen via `AnimatedSection.tsx`) dan **Framer Motion** (untuk interaksi scroll-reveal dua arah serta hover fluidity pada komponen kartu).
  2. **GATE 2 (Scaffolding)**: Modifikasi perintah instalasi NPM dengan menyertakan modul `framer-motion`:  
     `npm install -y --no-fund lenis lucide-react animejs @types/animejs framer-motion`
  3. **GATE 3 Poin 4**: Cabut larangan integrasi Framer Motion dan cantumkan pedoman integrasi statis dengan TypeScript (`as const` pada parameter `transition.ease`).

### 2.2 Sinkronisasi Filosofi Reset Animasi Gulir (Bidirectional Loop)
* **Masalah Saat Ini**: Masterskill `sitegen/SKILL.md` menginstruksikan animasi bergulir dua arah yang aktif tanpa putus (`once: false`, infinite ambient looping). Sebaliknya, `generator/SKILL.md` mewajibkan Asymmetric Reset di mana state animasi direset hanya apabila pengguna menggulir mundur melompati batas bawah viewport.
* **Target Berkas**: `D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen\generator\SKILL.md`
* **Spesifikasi Perubahan**:
  1. Hapus konsep Asymmetric Reset pada GATE 3 Poin 4 dan Prinsip 1.
  2. Tetapkan pedoman bahwa seluruh observasi gulir wajib bersifat dua arah (bidirectional). Untuk Framer Motion gunakan `viewport={{ once: false, amount: 0.15 }}`. Untuk komponen `AnimatedSection.tsx` berbahan Anime.js, elemen berulang merespons animasi masuk/keluar saat batas viewport terlampaui dari arah mana pun.
  3. Perkuat mandat infinite ambient looping pada elemen kartu dan visual kosmik agar antarmuka terus hidup tanpa henti.

### 2.3 Sinkronisasi Penamaan Skill dan Rute Remediasi Audit SEO
* **Masalah Saat Ini**: Pada Langkah 7a masterskill, pemanggilan ditulis `seo-validator`, sedangkan direktori asli bernama `seo`. Selain itu, berkas `SEO-REPORT.md` yang diciptakan agen `seo` tidak dicakup rute eksekusi perbaikannya apabila ditemukan kegagalan sebelum gerbang jeda review.
* **Target Berkas**: `D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen\SKILL.md`
* **Spesifikasi Perubahan**:
  1. **Langkah 7a (SEO Validation)**: Koreksi nama sub-skill dari `seo-validator` menjadi `seo`.
  2. **Rute Remediasi SEO (Langkah 7a Lanjutan)**: Tambahkan protokol: Apabila hasil audit dalam `landings/<brand>/SEO-REPORT.md` mencatat temuan error atau pelanggaran spesifikasi SEO, Master Orchestrator wajib memanggil sub-skill `debug` untuk mengeksekusi perbaikan kode sistematis berdasarkan laporan tersebut maksimal 3 iterasi sebelum memasuki tahap Debug Lokal Final (Langkah 7b).

### 2.4 Shift-Left Standar SEO pada Fase Perencanaan (Master PRD)
* **Masalah Saat Ini**: Skill `seo` melakukan pengecekan mendetail pada Langkah 7 (metadata terspesifikasi, buying keywords, LSI, JSON-LD khusus halaman, serta 3 artikel backlink pada Blog). Kriteria ini belum dititikberatkan saat pembuatan dokumen Master PRD di Langkah 4, sehingga generator berpotensi membiarkan lubang optimasi SEO sejak awal pembangunan halaman.
* **Target Berkas**: `D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen\SKILL.md`
* **Spesifikasi Perubahan**:
  1. **Langkah 4a (Buat PRD Semua Halaman)**: Tambahkan mandat kepada sub-skill `planner` mode=`page` agar wajib menginjeksi parameter **Sitegen Internal SEO Checklist** (grup keyword utama jenis buying keyword, pendukung LSI, panjang Title Tag <= 55 karakter, Meta Description <= 155 karakter, serta spesifikasi Schema.org JSON-LD akurat per halaman) langsung ke dalam setiap dokumen `PLAN-<halaman>.md`.
  2. Khusus rute halaman Blog (`/blog`), wajib dicantumkan rancangan spesifik untuk 3 artikel backlink beserta atribut visual clickable yang mengarah ke domain utama.

### 2.5 Bukti Visual Tangkapan Layar (Playwright) dan Protokol Kegagalan Iterasi
* **Masalah Saat Ini**: Langkah 5a membatasi maksimal 5 iterasi perbaikan loop agen tanpa kejelasan mitigasi apabila batas hitung tercapai. Selanjutnya, agen `qa-reviewer` memeriksa validasi kualitas visual AAA semata melalui inspeksi statis kode sumber tanpa menatap hasil rendering peramban asli.
* **Target Berkas**: `D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen\SKILL.md`
* **Spesifikasi Perubahan**:
  1. **Protokol Batas Putus Asa (Fallback Limit) pada Langkah 5a**: Tambahkan aturan: Jika iterasi perbaikan mencapai batas maksimal 5 kali dan masih bersisa error atau kegagalan kepatuhan, agen pengembang dilarang bergelung atau melangkahi halaman. Agen wajib menghasilkan laporan kegagalan krisis (*Error Digest*), memicu gerbang interupsi keras (`[HARD STOP]`), dan mengakhiri giliran dengan menyajikan laporan kegagalan detail kepada pengguna untuk meminta petunjuk atau keputusan override.
  2. **Bukti Tangkapan Layar Otentik pada Langkah 5b & 5c**: Instruksikan bahwa eksekusi pengujian Playwright (`tests/<slug_tepat>.spec.ts`) wajib menangkap bukti gambar aktual (screenshots) dari penampil antarmuka versi Desktop dan Mobile pada direktori pengujian.
  3. Sub-skill `qa-reviewer` dipanggil untuk mengevaluasi secara visual bukti screenshot otentik tersebut guna memastikan keterwakilan logo resmi, keabsahan gambar relevan, keindahan tata letak responsive, dan tidak adanya placeholder fiktif sebelum memicu `[CRITICAL STOP]` ke pengguna.

---

## 3. Matriks Keterlibatan Berkas (Impact Matrix)

| No | File Path | Modifikasi Utama |
|---|---|---|
| 1 | `D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen\SKILL.md` | Resolusi nama `seo`, penambahan rute perbaikan `debug` SEO, integrasi shift-left checklist SEO ke PRD, protokol mitigasi limit iterasi, dan validasi visual berbukti screenshot Playwright. |
| 2 | `D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen\generator\SKILL.md` | Hapus larangan Framer Motion, perbarui perintah `npm install`, penyertaan Framer Motion pada aturan animasi, pencabutan skema Asymmetric Reset, ketetapan guliran bidirectional mutlak. |

---

## 4. Kriteria Keberhasilan (Definition of Done)
1. Seluruh dokumen skill yang dimodifikasi lolos pemeriksaan konsistensi terhadap `AGENTS.md` (tidak tersisa larangan saling bertolak belakang atau duplikasi konflik library).
2. Tuntutan library animasi dalam perintah instalasi generator 100% cocok dengan instruksi perakitan komponennya.
3. Rute eksekusi master tidak memiliki ambiguitas penamaan agen/skill dan menyediakan alur resolusi jelas saat terjadi kegagalan audit SEO maupun pengujian kualitas visual.
