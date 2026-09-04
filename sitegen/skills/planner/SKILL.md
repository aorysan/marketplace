---
name: planner
description: Menganalisis data hasil ekstraksi PDF Company Profile dari skill intake, lalu menghasilkan dokumen planning dalam format markdown. Mendukung 3 mode: global (planning lintas halaman), page (planning per halaman), dan merge (gabung semua menjadi PRD final).
---

# Sitegen Planner — Multi-Mode Planning

> [!CAUTION]
> **MANDATORY CONSTITUTIONAL BINDING**: Sebelum mengeksekusi alur perancangan di bawah, Anda WAJIB MEMBACA DAN MEMATUHI file konstitusi `AGENTS.md` di folder ini (`AGENTS.md`). Larangan merancang halaman minimalis (Shallow MVP) dan kewajiban parameter AAA Tier-1 bersifat mutlak.

Panduan Operasional Sub-skill Planner: Agen ini bertugas membuat **dokumen planning** berformat markdown. Agen ini beroperasi dalam 4 mode yang dipanggil oleh master orkestrator (`sitegen`).

## Mode Operasi
### MODE 1: `global`
Membuat planning global yang berlaku untuk SELURUH website.

**Input:**
- Data intake: `landings/<brand>/intake/final_intake.md`
- Data riset: `landings/<brand>/planning/PLAN-USER-NEEDS.md` & `landings/<brand>/planning/PLAN-COMPETITOR.md`

**Output:**
- File: `landings/<brand>/planning/PLAN-GLOBAL.md`
- File: `landings/<brand>/planning/PAGES-LIST.md` (hanya daftar nama halaman berdasarkan `PLAN-USER-NEEDS.md` dan `PLAN-COMPETITOR.md`)
- Template: gunakan `reference/prd-global-template.md`

**Yang harus diisi:**
1. Ringkasan Perusahaan (nama, tagline, industri, profil)
2. Value Proposition & Teks Persuasi — inventory SEMUA kalimat persuasi dari PDF
   - Setiap kalimat WAJIB ditandai target posisinya (halaman mana, section mana)
   - DILARANG menghapus/mengubah substansi kalimat persuasi dari PDF
3. Branding & Visual Plan
   - 3 warna (primary, secondary, dark) dari PDF dengan hex code
   - **Aturan Kontras Warna**: primary gelap → secondary HARUS terang, dan sebaliknya. DILARANG 2 warna gelap atau 2 warna terang berdampingan
   - Font heading & body (Google Font modern: Inter, Plus Jakarta Sans, Sora, Roboto)
   - Tone visual
   - Deskripsi aset visual (logo, hero image, gambar pendukung)
4. SEO Strategy Global
   - Keyword mapping untuk SEMUA halaman di `PAGES-LIST.md` (anti-kanibalisasi)
   - 1 grup keyword utama per halaman
   - Buying keyword + minimal 2 LSI keywords per halaman
   - Backlink plan: 3 artikel untuk blog
5. Schema.org JSON-LD mapping per halaman
6. Footer Data (email, WA, alamat, sosmed)
7. **Tone of Voice & Copywriting Guidelines** *(BARU — diadopsi dari LPG)*
   - Tentukan **Tone of Voice** berdasarkan industri dan target audience (spectrum: Formal↔Casual, Simple↔Complex, Serious↔Playful)
   - Tentukan **3-5 personality traits** brand (misal: "Confident, not arrogant", "Friendly, not unprofessional")
   - Daftar **Banned Content** — kata/frasa yang dilarang digunakan (kata berkonotasi buruk, jargon tanpa konteks)
   - **Positioning Statement**: "[Brand] is the [category] for [audience] who want [outcome] because [reason]."
8. **Output `PAGES-LIST.md`**: File `landings/<brand>/planning/PAGES-LIST.md` WAJIB dihasilkan, berisi daftar nama halaman saja hasil sintesis dari `PLAN-USER-NEEDS.md` dan `PLAN-COMPETITOR.md`.

**Prinsip:**
- Anti-kanibalisasi keyword: TIDAK BOLEH ada keyword yang sama di 2+ halaman
- Semua kalimat persuasi dari PDF WAJIB tercantum (tidak boleh hilang)
- Anti-AI Slop: DILARANG emoji, DILARANG teks generik tanpa basis data PDF
- **Copywriting harus berfokus pada konversi** — tulis konten seolah-olah Anda adalah copywriter kelas atas

---

### MODE 2: `page`
Membuat planning untuk SATU halaman spesifik.

**Input:**
- Data intake: `landings/<brand>/intake/final_intake.md`
- Planning global: `landings/<brand>/planning/PLAN-GLOBAL.md` (sebagai context)
- Daftar halaman: `landings/<brand>/planning/PAGES-LIST.md`
- Parameter: nama halaman yang akan di-plan

**Output:**
- File: `landings/<brand>/planning/PLAN-<halaman>.md`
  - Nama file menggunakan slug halaman dari `PAGES-LIST.md`: (misal `beranda`, `layanan`, `about`, `portofolio`, `kontak`, `blog`, `karir`)
- Template: gunakan `reference/prd-page-template.md`

**Urutan halaman (prioritas bisnis):**
1. Beranda (`/`)
2. Layanan (`/services` atau `/layanan-<keyword>`)
3. About (`/about`)
4. Portofolio (`/portfolio`)
5. Kontak (`/contact`)
6. Blog (`/blog`)
7. Karir (`/careers`)

**Yang harus diisi per halaman:**
1. Info Halaman: nama, route/URL (memuat keyword dari mapping global)
2. Title Tag (≤ 55 char, memuat 2-3 keyword, CTR-oriented)
3. Meta Description (≤ 155 char, memuat keyword yang belum di title)
4. Schema.org JSON-LD type (sesuai mapping global)
5. Section Layout — daftar section yang digunakan, dari types yang didukung generator:
   `hero`, `problem`, `solution`, `about`, `management`, `techstack`, `testimonial`, `pricing`, `faq`, `cta`, `video`
6. Data Konten per Section — field lengkap:
   - hero: headline, subheadline, cta.text, cta.target, heroImage, stats, clients
   - problem: title, items [{title, desc}]
   - solution: title, valueProp, benefits [{title, desc, icon}]
   - about: title, story [], teamPhoto
   - management: title, items [{title, desc}]
   - testimonial: title, items [{quote, name, role}]
   - pricing: title, items [{name, price, features[], cta}]
   - faq: title, items [{question, answer}]
   - cta: headline, subheadline, cta.text, guarantee
   - video: title, items [{embedUrl, title, desc}]
7. Referensi value proposition yang dipakai di halaman ini (dari PLAN-GLOBAL)
8. Video SMO (minimal 1 per halaman)
9. **Deklarasi Kebutuhan Gambar (Image Requirements) per Section**: Planner WAJIB menyatakan secara eksplisit apakah setiap section dalam PRD memerlukan gambar (`Membutuhkan Gambar: Ya/Tidak` beserta deskripsi visual aset), HANYA jika secara konseptual section tersebut cocok memerlukan gambar (misal: `hero` pada Beranda, `about`, `portfolio`, `feature showcase`). Section murni teks/struktur seperti `pricing` atau `faq` TIDAK memerlukan gambar (`Membutuhkan Gambar: Tidak`).

**Prinsip:**
- ATURAN CAROUSEL: Jika section memiliki ≥ 10 item, WAJIB tulis instruksi "Gunakan Auto-slide Carousel"
- Keyword dan URL HARUS sesuai dengan mapping di PLAN-GLOBAL
- Konten HARUS berdasarkan data PDF (bukan karangan)
- Anti-AI Slop: DILARANG emoji, DILARANG teks generik

**Aturan Copywriting per Konten (Copyfitting — diadopsi dari LPG):**
- **Hero Headline**: Maksimal **7 kata** (25-40 karakter). Harus memancing hook dalam 3 detik. Hindari kalimat majemuk.
- **Hero Subheadline**: Maksimal **2 kalimat pendek** (total 15-20 kata)
- **Section Title (H2)**: Maksimal **5 kata** — terarah dan fokus pada esensi bisnis
- **CTA Button Text**: Maksimal **3 kata** — agresif dan singkat (misal: "Konsultasi Gratis Sekarang")
- **Card/Feature Description**: Maksimal **2 kalimat** (max 15 kata per deskripsi)
- **Tone of Voice**: Harus konsisten dengan Tone of Voice yang didefinisikan di PLAN-GLOBAL

**Aturan Konten per Tipe Section (diadopsi dari LPG Section SOP):**
- **ATURAN HERO PAGES:** Secara *default*, komponen `hero` dengan gambar besar (`heroImage`) HANYA BOLEH digunakan untuk halaman Beranda (`/`). Untuk seluruh halaman dalam (Inner Pages), Anda WAJIB merancang header berbasis teks murni tanpa `heroImage`. **PENGECUALIAN:** Jika User (manusia) memberikan instruksi revisi yang secara eksplisit meminta adanya gambar hero di halaman dalam, Anda WAJIB mematuhi User dan menambahkan `heroImage` pada rancangan halaman tersebut.
- **ATURAN DEKLARASI GAMBAR PER SECTION:** Setiap section dalam PRD halaman WAJIB mencantumkan status kebutuhan gambar secara eksplisit (misal: `Membutuhkan Gambar: Ya` / `Membutuhkan Gambar: Tidak`). Deklarasi gambar HANYA dilakukan jika secara konseptual section tersebut cocok menggunakan gambar.
- **hero**: Headline harus hook dalam 3 detik. Gunakan kalimat persuasi dari PDF. Stats/trust indicators menggunakan ikon profesional (bukan emoji).
- **problem**: Tulis masalah spesifik yang dihadapi target audience. Buat terasa mendesak ("Apa ruginya jika tidak diselesaikan?").
- **solution**: Perkenalkan brand sebagai solusi. Value proposition harus jelas dan terdiferensiasi.
- **testimonial**: DILARANG mengarang testimonial fiktif. Jika tidak ada di PDF → pivot ke Social Proof (angka/daftar klien) atau drop section.
- **faq**: Sebarkan keyword SEO di dalam pertanyaan. Susun 4-5 pertanyaan umum pembeli (harga, garansi, proses).
- **cta** (final): Headline harus memicu **FOMO** (Fear of Missing Out). Tombol CTA berukuran paling dominan.
- **Semua section**: DILARANG menggunakan emoji. Gunakan ikon profesional (Lucide/SVG).

**Self-Check:**
Sebelum menyimpan, periksa dengan rubrik di `reference/scoring-rubric.md`. Target skor ≥ 90.

---

### MODE 3: `merge`
Menggabungkan semua planning yang sudah approved menjadi PRD final.

**Input:**
- `landings/<brand>/planning/PLAN-GLOBAL.md`
- `landings/<brand>/planning/PAGES-LIST.md`
- Semua file `landings/<brand>/planning/PLAN-<halaman>.md` berdasarkan daftar di `PAGES-LIST.md`

**Output:**
- File: `landings/<brand>/planning/PRD.md`
- Format: HARUS identik dengan `reference/prd-template.md` (format lama)

**Aturan Merge:**
1. Section 1 (Ringkasan Perusahaan) → dari PLAN-GLOBAL
2. Section 2 (Value Proposition & Teks Persuasi) → dari PLAN-GLOBAL
3. Section 3 (Branding & Visual Plan) → dari PLAN-GLOBAL
4. Section 4 (SEO Strategy) → dari PLAN-GLOBAL + enrichment dari setiap PLAN-<halaman>
5. Section 5 (Struktur Halaman & Section Layout) → dari semua PLAN-<halaman> yang terdaftar di `PAGES-LIST.md`
6. Section 6 (Footer Data) → dari PLAN-GLOBAL
7. Section 7 (Catatan Tambahan) → dari PLAN-GLOBAL + catatan dari PLAN-<halaman> jika ada

**PENTING:** PRD.md final HARUS bisa dikonsumsi oleh skill `generator` TANPA perubahan pada generator. Format harus 100% kompatibel dengan `reference/prd-template.md`.

---

### MODE 4: `design-system`
Membuat spesifikasi design system teknis berdasarkan PLAN-GLOBAL.md. Dipanggil segera setelah PLAN-GLOBAL.md selesai dibuat.

**Input:**
- `landings/<brand>/planning/PLAN-GLOBAL.md`

**Output:**
- File: `landings/<brand>/planning/PLAN-DESIGN-SYSTEM.md`
- Template: gunakan `reference/prd-design-system-template.md`

**Yang harus diisi:**
1. Color System — primary (3 shade), secondary (3 shade), neutral (5 shade), semantic (4 warna) — dengan CSS token name + hex code + use case spesifik
2. Typography Scale — H1, H2, H3, H4, body-lg, body, body-sm, caption — dengan font family, size (rem + px), weight, dan line-height
3. Spacing Scale — sistem berbasis 4px grid, minimal 9 step dari `--space-1` (4px) hingga `--space-24` (96px)
4. Border Radius System — 6 level: sm, md, lg, xl, 2xl, full
5. Grid & Layout System — 4 breakpoints (mobile/tablet/desktop/wide) dengan container max-width dan jumlah kolom
6. Component Specs:
   - Button variants: primary, secondary, ghost — dengan background, text color, border, padding, dan hover state
   - Card style: background, border radius, shadow default, padding, hover shadow + transform, transition
   - Navbar style: background (glassmorphism), position, z-index, height per breakpoint, aturan logo
   - Form/input style: border, border radius, padding, focus state, error state, placeholder color

**Prinsip:**
- Semua color token HARUS konsisten dengan warna di PLAN-GLOBAL.md (Section 3 Branding)
- Semua font token HARUS menggunakan font yang sama dengan PLAN-GLOBAL.md (heading & body)
- Nilai HARUS spesifik: angka px, hex code, weight numerik — DILARANG kalimat ambigu
- Component specs HARUS mencakup semua komponen yang digunakan di section types generator
- DILARANG mendefinisikan komponen atau token yang tidak digunakan di generator
- Anti-AI Slop: DILARANG emoji, DILARANG placeholder `[...]`
