# Company Profile Slides — Design Spec

**Created:** 2026-09-03  
**Status:** Draft  
**Authors:** Aryo Adi Putro (request), Hermes Agent (draft)

---

## 1. Tujuan & Scope

Pipeline **Company Profile** bertujuan menghasilkan presentasi web-based (slide-based) dari dokumen Markdown Company Profile, yang kemudian bisa di-deploy ke Vercel sebagai website live.

Terdapat dua skill baru dalam layer ini:

| No | Skill | Input | Output |
|----|-------|-------|--------|
| 10 | company-profile-builder | Company Profile (Markdown) | HTML Company Profile (Reveal.js slides) |
| 11 | company-profile-publisher | HTML Company Profile | Live Website (URL Vercel) |

**Scope yang\included:**
- Builder: parse Markdown, chunking dinamis ke slide, inject gambar, generate single-file HTML Reveal.js
- Publisher: validasi HTML, deploy ke Vercel via CLI, kembalikan URL

**Scope yang\excluded:**
- Company-profile-writer (skill 8) dan company-profile-reviewer (skill 9) — sudah ada, tidak diseakan
- Generator gambar otomatis tanpa validasi — harus ada pemeriksaan accessibility
- Production deploy — selalu preview kecuali user minta eksplisit

---

## 2. Input & Output Contract

### Skill 10 — company-profile-builder

**Input:**
- File: `Company Profile (Markdown)` — standar dari skill 8/9
- Lokasi: disediakan oleh agent/pipeline sebelumnya

**Output:**
- File: single-file HTML presentasi
- Struktur direktori: `<project>/compros/<name>/index.html`
- File pendamping:
  - `compro.md` — Markdown asli (untuk referensi/edit)
  - `assets/` — gambar yang diunduh/digenerate
  - `build.log` — log chunking: berapa slide, alasan split, path gambar

### Skill 11 — company-profile-publisher

**Input:**
- File: `HTML Company Profile` — hasil dari builder
- Path: `<project>/compros/<name>/index.html`

**Output:**
- String: URL deployment (preview URL)
- Metadata: status deploy, preview URL, claim URL (jika ada), timestamp

---

## 3. Template Approach untuk Konsistensi

Agar hasil generate konsisten, digunakan pendekatan template dengan dua lapisan.

### 3.1 Template HTML Shell (statis)

File template statis disimpan sebagai sumber suara di dalam plugin. Builder hanya menginject konten ke dalam `<div class="slides">`.

Polanya:

```html
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Company Profile — <nama-company></title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/reveal.js/4.6.1/reveal.min.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/reveal.js/4.6.1/theme/black.min.css">
  <style>
    /* custom.css: brand colors, fonts, spacing — dikunci */
  </style>
</head>
<body>
  <div class="reveal">
    <div class="slides">
      <!-- Konten slide di-inject di sini -->
    </div>
  </div>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/reveal.js/4.6.1/reveal.min.js"></script>
  <script>
    Reveal.initialize({
      navigation: true,
      progress: true,
      center: true,
      hash: true,
      controlsBackArrows: 'visible',
    });
  </script>
</body>
</html>
```

### 3.2 Template Konten per Jenis Slide

Builder menggunakan panduan konten ini saat memproses Markdown input. AI diminta memetakan konten ke template ini.

#### Slide Hero
```
# [Judul Perusahaan]
[Tagline/slogan — 1 baris]

💼 [1 kalimat deskripsi singkat tentang perusahaan]

📊 [1-3 statistik kunci, bulleted]
```

#### Slide Problem
```
## Masalah yang Dihadapi

- [Pain point 1]
- [Pain point 2]
- [Pain point 3]
```

#### Slide Solusi/Fitur (per fitur)
```
## [Nama Fitur]

[Deskripsi fitur: 1-3 kalimat]

✨ [Benefit utama atau poin kunci]
```

#### Slide Pricing
```
## Paket & Harga

| Paket | Harga | Fitur Utama |
|-------|-------|-------------|
| ...   | ...   | ...         |
```

#### Slide CTA/Contact
```
## Hubungi Kami

📞 [Nomor kontak]
🌐 [Website]
📍 [Alamat fisik]
```

### 3.3 Chunking Rules (deterministic)

 chunking dilakukan secara deterministic, bukan discretionary AI.

1. H1 (`#`) = pemisah slide utama — setiap H1 adalah awal slide baru
2. Konten dalam satu slide dibatasi ~150-250 kata atau 1 topik utama
3. Kalau section melebihi kapasitas setelah H1, split berdasarkan:
   - Sub-heading (H2/H3) menjadi slide terpisah
   - Jika tidak ada sub-heading tapi konten >250 kata, pecah berdasarkan paragraf natural
4. Tabel: jika tabel besar (>5 baris), beri slide sendiri
5. Daftar fitur: tiap fitur utama jadi slide masing-masing

**Hasil akhir:** jumlah slide ditentukan oleh konten, bukan fix. Konten pendek → slide sedikit; konten panjang → slide banyak.

### 3.4 CSS Custom (dikunci)

File `custom.css` disimpan statis dan tidak di-generate ulang. Berisi:
- Warna brand (primary, secondary, accent)
- Font family dan ukuran
- Layout kartu fitur
- Spacing dan padding konsisten
- Gaya tabel

Perubahan visual hanya dilakukan dengan mengedit `custom.css`, bukan me-routing ulang proses generate.

---

## 4. Company-Profile-Builder Workflow

```
Markdown Company Profile
        │
        ▼
  ┌────────────────────────┐
  │ Step 1: Parse & Analyze│
  │ - Baca file Markdown   │
  │ - Identifikasi H1/H2   │
  │   structure            │
  │ - Hitung konten per    │
  │   section              │
  └────────────────────────┘
        │
        ▼
  ┌────────────────────────┐
  │ Step 2: Slide Chunking │
  │ - Terapkan chunking    │
  │   rules (lihat §3.3)   │
  │ - Tentukan jumlah slide│
  │ - Buat mapping:        │
  │   section → slide      │
  └────────────────────────┘
        │
        ▼
  ┌────────────────────────┐
  │ Step 3: Image Handling │
  │ - Deteksi 이미지 참조   │
  │   di Markdown          │
  │ - Validasi accessibility│
  │   (HEAD 200)           │
  │ - Jika user kasih path │
  │   lokal: copy ke assets/│
  │ - Jika perlu tambah    │
  │   gambar: agent cari/ │
  │   generate → validasi  │
  └────────────────────────┘
        │
        ▼
  ┌────────────────────────┐
  │ Step 4: HTML Assembly  │
  │ - Load template shell  │
  │ - Inject konten per    │
  │   slide sesuai mapping │
  │ - Inject gambar (path  │
  │   relatif ke assets/)  │
  │ - Write index.html     │
  └────────────────────────┘
        │
        ▼
  ┌────────────────────────┐
  │ Step 5: Output         │
  │ - Tulis ke              │
  │   <project>/compros/   │
  │   <name>/index.html    │
  │ - Copy compro.md       │
  │ - Tulis build.log      │
  └────────────────────────┘
```

---

## 5. Chunking Algorithm (detail)

### Input
- Markdown text dengan struktur heading

### Output
- Array slide: `[{ slide_number, heading, content, image_paths }]`

### Algoritma

```
def chunk_slides(markdown):
    sections = split_by_h1(markdown)
    slides = []
    
    for section in sections:
        if section.konten_leq(250_kata) and tidak_ada_subheading:
            slides.append(section)
        elif ada_subheading:
            for sub in split_by_h2(section):
                slides.append(sub)
        elif section.konten_gt(250_kata):
            # Pecah berdasarkan paragraf natural atau tabel
            parts = split_natural(section, max_kata=250)
            slides.extend(parts)
    
    return slides
```

### Spesifikasi kapasitas per slide

| Jenis konten | Batas |
|--------------|-------|
| Teks biasa   | ~150-250 kata |
| 1 topik utama| 1 topik per slide |
| Tabel        | >5 baris → slide sendiri |
| Fitur        | 1 fitur utama per slide |

---

## 6. Image Handling

### 6.1 Gambar dari User

Jika user menyediakan path gambar (URL atau path lokal):
1. Validasi accessibility: lakukan HEAD request, tunggu 200
2. Jika URL: inject langsung sebagai `<img src="URL">`
3. Jika path lokal: copy ke `<project>/compros/<name>/assets/` dan inject sebagai path relatif
4. Jika gagal (404/timeout): catat di build.log, gunakan placeholder kosong

### 6.2 Gambar dari AI Generation/Search

Jika agent AI perlu menambahkan gambar untuk memperkaya konten:
1. Cari gambar relevan via search/image API
2. Atau generate gambar via tool yang tersedia
3. **Wajib** validasi: HEAD request ke URL gambar, pastikan 200
4. Jika tidak accessible: batalkan, catat, tidak pakai
5. Simpan ke `assets/` jika lokal, atau gunakan URL jika remote
6. **Jangan hallucinate** — jika tidak ada gambar yang valid, tidak paksa

### 6.3 Placeholder

Jika gambar diharapkan tapi tidak tersedia:
- Tidak paksa placeholder kosong yang menyesatkan
- Catat di build.log sebagai "missing image"
- Slide tetap tampil tanpa gambar, konten teks tetap utuh

---

## 7. Reveal.js Configuration

### CDN
- reveal.js core: `https://cdnjs.cloudflare.com/ajax/libs/reveal.js/4.6.1/reveal.min.js`
- reveal.js CSS: `https://cdnjs.cloudflare.com/ajax/libs/reveal.js/4.6.1/reveal.min.css`
- theme: `black.min.css` (bisa diganti via config)

### Konfigurasi yang dikunci
```javascript
Reveal.initialize({
  navigation: true,           // next/prev tombol
  progress: true,             // progress bar
  center: true,               // center content
  hash: true,                 // URL hash untuk share slide
  controlsBackArrows: 'visible',
  transition: 'slide',       // transisi slide
});
```

### Fitur yang tersedia (tanpa 추가 config)
- Keyboard navigation (arrow keys, space)
- Touch/swipe (mobile)
- Fullscreen (F key)
- Overview mode (Esc)
- Export PDF (print)

---

## 8. Output Directory Structure

```
<project>/
└── compros/
    └── <name>/
        ├── index.html          ← HTML presentasi (Reveal.js)
        ├── compro.md           ← Markdown asli (untuk referensi/edit)
        ├── assets/             ← gambar yang diunduh/digenerate
        │   ├── logo.png
        │   └── hero.jpg
        └── build.log           ← log chunking: jumlah slide, alasan split, path gambar
```

`<name>` adalah identifier unik untuk company profile ini (bisa dari nama perusahaan, atau nama project, atau di-generate dari timestamp).

---

## 9. Company-Profile-Publisher Workflow

```
HTML Company Profile (path)
        │
        ▼
  ┌────────────────────────┐
  │ Step 1: Pre-deploy     │
  │ Check                  │
  │ - File ada & readable  │
  │ - Cek dependency CDN   │
  │   (CDN reachable?)     │
  └────────────────────────┘
        │
        ▼
  ┌────────────────────────┐
  │ Step 2: Prepare Deploy │
  │ Directory              │
  │ - Salin HTML + assets  │
  │   ke folder deployment │
  │   (flat structure)     │
  └────────────────────────┘
        │
        ▼
  ┌────────────────────────┐
  │ Step 3: Execute Deploy │
  │ - Panggil Vercel CLI   │
  │   (sudah auth)         │
  │ - vercel deploy --yes  │
  │   --implicit-commit    │
  │ - path = deploy dir    │
  └────────────────────────┘
        │
        ▼
  ┌────────────────────────┐
  │ Step 4: Post-deploy   │
  │ - Parse output CLI     │
  │ - Ekstrak preview URL  │
  │ - Cek URL accessibility│
  │ - Kembalikan ke user   │
  └────────────────────────┘
```

### 9.1 Deploy Command

```bash
cd <deploy-directory>
vercel deploy --yes --implicit-commit --path <deploy-directory>
```

Output dari CLI berisi URL preview. Skill parse output, ekstrak URL, cek accessibility (GET 200), lalu kembalikan ke user.

### 9.2 Kriteria Deploy

- Selalu deploy sebagai **preview** (bukan production) kecuali user minta eksplisit
- Jika Vercel CLI tidak ter-install: error dengan pesan jelas
- Jika CLI tidak ter-auth: error dengan pesan jelas (walau user bilang udah auth, masih perlu handle kasus)
- Jika deploy gagal: kembalikan error message dari CLI

---

## 10. Error Handling & Edge Cases

### Builder Errors

| Skenario | Handling |
|----------|----------|
| File Markdown tidak ada | Error: "Markdown file not found" |
| File kosong/tidak readable | Error: "Markdown file empty or unreadable" |
| Gambar tidak accessible | Skip gambar, catat di build.log |
| Konten sangat pendek (<50 kata) | Tetap generate minimal 1 slide |
| Konten sangat panjang (>5000 kata) | Chunking ke banyak slide, tidak error |

### Publisher Errors

| Skenario | Handling |
|----------|----------|
| HTML file tidak ada | Error: "HTML file not found" |
| Vercel CLI tidak ter-install | Error: "Vercel CLI not found. Install: npm i -g vercel" |
| Vercel CLI tidak ter-auth | Error: "Vercel CLI not authenticated. Run: vercel login" |
| Deploy gagal | Kembalikan error dari CLI |
| Preview URL tidak reachable | Cek ulang, jika tetap gagal laporkan |

---

## 11. Integration dengan Plugin compro

### Lokasi skill
- Builder: `D:\AryokPunya\Magang\compro\.claude\plugins\compro\skills\company-profile-builder\SKILL.md`
- Publisher: `D:\AryokPunya\Magang\compro\.claude\plugins\compro\skills\company-profile-publisher\SKILL.md`

### Template file statis
- Template shell: `D:\AryokPunya\Magang\compro\.claude\plugins\compro\templates\profile-shell.html`
- Custom CSS: `D:\AryokPunya\Magang\compro\.claude\plugins\compro\templates\custom.css`

### Asset output
- Direktori output: `<project>/compros/<name>/`

---

## 12. Testing Considerations

### Builder Testing
1. Input Markdown dengan konten pendek → cek 1-3 slide dihasilkan
2. Input Markdown dengan konten panjang (beberapa H1, H2, tabel) → cek chunking benar
3. Input dengan referensi gambar → cek gambar muncul di HTML
4. Input tanpa gambar → cek tidak ada error, build.log mencatat
5. Cek navigasi Reveal.js berfungsi (next/prev, keyboard)

### Publisher Testing
1. Deploy HTML ke Vercel → cek URL kembali
2. Cek URL accessibility dari luar
3. Test kasus CLI tidak ada → handle error
4. Test kasus deploy gagal → handle error

### Konsistensi Testing
1. Jalankan builder dua kali dengan input sama → cek hasil sama (jumlah slide, struktur, tidak ada perbedaan discretionary)
2. Cek template CSS sama di setiap build

---

## 13. Deployment & Versioning

- Skill dan template disimpan dalam repo compro
- Setiap perubahan template/CSS harus melalui review untuk menjaga konsistensi
- Build.log membantu debug ketika hasil tidak sesuai harapan

---

*Spec ini siap untuk ditinjau sebelum implementasi.*
