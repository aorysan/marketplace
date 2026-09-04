# PRD — [Nama Brand]

> Dokumen ini adalah Product Requirements Document (PRD) untuk pembuatan website landing page [Nama Brand]. Dibuat berdasarkan data Company Profile (PDF) yang telah diekstrak oleh skill `intake`.

---

## 1. Ringkasan Perusahaan

| Field | Isi |
|---|---|
| Nama Perusahaan | [Nama resmi perusahaan] |
| Tagline | [Tagline/slogan resmi] |
| Industri/Bidang | [Bidang bisnis utama] |
| Website (jika ada) | [URL website saat ini, kosongkan jika belum ada] |
| Profil Singkat | [2-3 kalimat ringkasan profil perusahaan dari PDF] |

---

## 2. Value Proposition & Teks Persuasi

> **ATURAN**: Semua kalimat di bawah ini DIAMBIL LANGSUNG dari PDF Company Profile. DILARANG DIHAPUS atau DIUBAH secara substansial. Boleh diperkaya dengan keyword SEO secara alami.

### Kalimat Persuasi Utama (dari PDF)
1. "[Kalimat persuasi 1 dari PDF]" — **Posisi**: [Hero Section / Headline / dll]
2. "[Kalimat persuasi 2 dari PDF]" — **Posisi**: [Value Proposition Cards / dll]
3. "[Kalimat persuasi 3 dari PDF]" — **Posisi**: [Solution Section / dll]
4. [... tambahkan sesuai jumlah yang ditemukan di PDF]

### Value Proposition Inti
- [Keunggulan 1 — dari PDF]
- [Keunggulan 2 — dari PDF]
- [Keunggulan 3 — dari PDF]

---

## 3. Branding & Visual Plan

| Field | Isi |
|---|---|
| Primary Color | [Hex code warna utama dari PDF, contoh: #0066CC] |
| Secondary Color | [Hex code warna sekunder, contoh: #004499] |
| Dark Color | [Hex code warna gelap, contoh: #001A33] |
| Font Heading | [Google Font, contoh: Sora] |
| Font Body | [Google Font, contoh: Plus Jakarta Sans] |
| Tone Visual | [Profesional/Modern/Elegan/Dinamis — pilih yang sesuai] |

### Aset Visual
- Logo: [WAJIB tuliskan path/URL lokal dari file logo secara spesifik. Jika User memberi instruksi nama file logo dari hasil rename manual di folder assets, Anda WAJIB menggunakan path tersebut, contoh: /assets/logo.png]
- Hero Image: [Deskripsi gambar hero yang direkomendasikan]
- Gambar pendukung: [Daftar gambar yang diekstrak dari PDF atau aset eksternal yang valid]

---

## 4. SEO Strategy

### 4.1 Keyword Mapping Per Halaman

| Halaman | Route | Buying Keyword | LSI Keywords |
|---|---|---|---|
| Beranda | `/` | [keyword] | [keyword1, keyword2, ...] |
| Tentang Kami | `/about` | [keyword] | [keyword1, keyword2, ...] |
| Layanan | `/services` atau `/layanan-<keyword>` | [keyword] | [keyword1, keyword2, ...] |
| Portofolio | `/portfolio` | [keyword] | [keyword1, keyword2, ...] |
| Blog | `/blog` | [keyword] | [keyword1, keyword2, ...] |
| Karir | `/careers` | [keyword] | [keyword1, keyword2, ...] |
| Kontak | `/contact` | [keyword] | [keyword1, keyword2, ...] |

### 4.2 Title Tag & Meta Description Per Halaman

| Halaman | Title Tag (<= 55 char) | Meta Description (<= 155 char) |
|---|---|---|
| Beranda | [Title — memuat 2-3 keyword, CTR-oriented] | [Description — keyword yang belum di title] |
| Tentang Kami | [Title] | [Description] |
| Layanan | [Title] | [Description] |
| Portofolio | [Title] | [Description] |
| Blog | [Title] | [Description] |
| Karir | [Title] | [Description] |
| Kontak | [Title] | [Description] |

### 4.3 Backlink Plan (Halaman Blog)
Minimal 3 artikel backlink untuk dipublikasikan di `wajibaca.com`:

1. **Judul Artikel 1**: [Memuat 1 buying keyword, solutif, sesuai search intent]
   - Keyword target: [keyword]
   - Gambar: [Deskripsi gambar produk/layanan, clickable mengarah ke website utama]
2. **Judul Artikel 2**: [...]
3. **Judul Artikel 3**: [...]

### 4.4 Schema.org JSON-LD Per Halaman

| Halaman | Schema Type |
|---|---|
| Beranda (`/`) | `Organization` / `LocalBusiness` + `WebSite` |
| Layanan (`/services`) | `Service` |
| Blog (`/blog`) | `Article` / `BlogPosting` |
| Karir (`/careers`) | `JobPosting` |
| Semua Halaman | `BreadcrumbList` |

---

## 5. Struktur Halaman & Section Layout

> **ATURAN CAROUSEL**: Jika suatu section memiliki **10 item atau lebih**, Anda WAJIB secara eksplisit menuliskan instruksi "Gunakan Auto-slide Carousel" pada data layout section tersebut.

### 5.1 Beranda (`/`)

**Sections:**

#### Section 1: `hero`
| Field | Isi |
|---|---|
| headline | [Teks headline — gunakan kalimat persuasi dari bagian 2] |
| subheadline | [Teks subheadline pendukung] |
| cta.text | [Teks tombol CTA, contoh: "Mulai Transformasi"] |
| cta.target | [Target link CTA, contoh: "#solution"] |
| heroImage | [Path atau deskripsi gambar hero] |
| stats | [Array statistik, contoh: { number: "100+", label: "Klien" }] |
| clients | [Array nama klien, contoh: ["Meridian Corp", "PT ABC"]] |

#### Section 2: `problem`
| Field | Isi |
|---|---|
| title | [Judul section — contoh: "Tantangan Bisnis Anda"] |
| items | [Array masalah, masing-masing: { title: "...", desc: "..." }] |

#### Section 3: `solution`
| Field | Isi |
|---|---|
| title | [Judul section — contoh: "Solusi Kami"] |
| valueProp | [Teks value proposition dari bagian 2] |
| benefits | [Array solusi: { title: "...", desc: "...", icon: "SVG string" }] |

#### Section 4: `video`
| Field | Isi |
|---|---|
| title | [Judul section video SMO] |
| items | [Array video: { embedUrl: "YouTube URL", title: "...", desc: "..." }] |

#### Section 5: `cta`
| Field | Isi |
|---|---|
| headline | [Teks CTA utama — contoh: "Siap Memulai?"] |
| subheadline | [Teks pendukung CTA] |
| cta.text | [Teks tombol, contoh: "Konsultasi Gratis"] |
| guarantee | [Teks jaminan, contoh: "Tanpa biaya tersembunyi"] |

---

### 5.2 Tentang Kami (`/about`)

**Sections:**

#### Section 1: `hero`
| Field | Isi |
|---|---|
| headline | [Headline halaman about] |
| subheadline | [Subheadline] |

#### Section 2: `about`
| Field | Isi |
|---|---|
| title | [Judul — contoh: "Tentang Kami"] |
| story | [Array paragraf sejarah/profil: ["Paragraf 1", "Paragraf 2", ...]] |
| teamPhoto | [Path foto tim jika ada] |

#### Section 3: `management`
| Field | Isi |
|---|---|
| title | [Judul — contoh: "Proses Kerja Kami"] |
| items | [Array: { title: "...", desc: "..." }] |

#### Section 4: `video`
| Field | Isi |
|---|---|
| title | [Video SMO terkait about] |
| items | [Array video] |

#### Section 5: `cta`
| Field | Isi |
|---|---|
| headline | [CTA penutup halaman about] |

---

### 5.3 Layanan/Produk (`/services`)

**Sections:**

#### Section 1: `hero`
| Field | Isi |
|---|---|
| headline | [Headline layanan] |

#### Section 2: `solution`
| Field | Isi |
|---|---|
| title | [Daftar layanan] |
| benefits | [Array layanan sebagai benefits] |

#### Section 3: `pricing` (jika ada data harga)
| Field | Isi |
|---|---|
| title | [Judul pricing] |
| items | [Array paket harga: { name, price, features[], cta }] |

#### Section 4: `testimonial`
| Field | Isi |
|---|---|
| title | [Testimoni klien] |
| items | [Array testimoni: { quote, name, role }] |

#### Section 5: `video`
| Field | Isi |
|---|---|
| items | [Video SMO terkait layanan] |

#### Section 6: `cta`
| Field | Isi |
|---|---|
| headline | [CTA penutup halaman layanan] |

---

### 5.4 Portofolio (`/portfolio`)

**Sections:**
Gunakan section types: `hero`, `about` (untuk showcase proyek), `testimonial`, `video`, `cta`.
Isi field setiap section dengan data portofolio dari PDF.

---

### 5.5 Blog (`/blog`)

**Sections:**
Gunakan section types: `hero`, `about` (daftar artikel), `video`, `cta`.
Sertakan 3 artikel backlink lengkap dengan judul, keyword, dan deskripsi gambar clickable.

---

### 5.6 Karir (`/careers`)

**Sections:**
Gunakan section types: `hero`, `about` (budaya kerja), `solution` (benefit bekerja), `video`, `cta`.

---

### 5.7 Kontak (`/contact`)

**Sections:**

#### Section 1: `cta`
| Field | Isi |
|---|---|
| headline | [Headline kontak] |
| contactItems | [Array: { label: "Email", url: "mailto:..." }, ...] |
| socialItems | [Array: { label: "Instagram", url: "https://..." }, ...] |

---

## 6. Footer Data

| Field | Isi |
|---|---|
| contact.email | [Email kontak] |
| contact.wa | [Nomor WhatsApp] |
| contact.address | [Alamat lengkap] |
| social.instagram | [URL Instagram] |
| social.linkedin | [URL LinkedIn] |
| social.tiktok | [URL TikTok] |

---

## 7. Catatan Tambahan

[Catatan atau instruksi khusus yang perlu diperhatikan oleh generator]

---

## 8. User Needs Summary

> Dirangkum dari `PLAN-USER-NEEDS.md`. Skill `generator` menggunakan bagian ini untuk memastikan konten website menjawab kebutuhan nyata target user — bukan sekadar menampilkan informasi perusahaan.

### Pain Points yang Di-address Website Ini
1. [Pain point terpenting — dari PLAN-USER-NEEDS Bagian 2]
2. [Pain point 2]
3. [Pain point 3]

### Objection yang Harus Di-counter di Website
| Objection | Halaman/Section yang Menjawab |
|---|---|
| [Objection 1] | [Halaman/section] |
| [Objection 2] | [Halaman/section] |
| [Objection 3] | [Halaman/section] |

---

## 9. Competitive Intelligence

> Dirangkum dari `PLAN-COMPETITOR.md`. Insight kompetitor yang mempengaruhi keputusan copywriting, pemilihan section, dan strategi diferensiasi.

### Gap yang Dieksploitasi di Website Ini
| # | Gap | Cara Eksploitasi |
|---|---|---|
| 1 | [Gap dari analisis kompetitor] | [Section/halaman yang mengeksploitasi gap ini] |
| 2 | [...] | [...] |
| 3 | [...] | [...] |

### Diferensiasi Utama vs Kompetitor
- [Poin diferensiasi 1 — spesifik, bukan generik]
- [Poin diferensiasi 2]
- [Poin diferensiasi 3]

---

## 10. Design System Reference

> Referensi ke `PLAN-DESIGN-SYSTEM.md`. Skill `generator` WAJIB membaca file ini sebelum menulis kode halaman manapun. Pastikan semua token konsisten.

**File lengkap:** `landings/<brand>/planning/PLAN-DESIGN-SYSTEM.md`

| Token Kunci | Value |
|---|---|
| `--color-primary` | [Hex — dari PLAN-DESIGN-SYSTEM Section 1] |
| `--color-secondary` | [Hex — dari PLAN-DESIGN-SYSTEM Section 1] |
| `--color-dark` | [Hex — dari PLAN-DESIGN-SYSTEM Section 1] |
| Font Heading | [Nama Google Font — dari PLAN-DESIGN-SYSTEM Section 2] |
| Font Body | [Nama Google Font — dari PLAN-DESIGN-SYSTEM Section 2] |
| Spacing Base | 4px grid |
| Container Desktop | [Max-width px — dari PLAN-DESIGN-SYSTEM Section 5] |
