# Company Profile Builder

> **Skill untuk:** Mengubah Company Profile (Markdown) menjadi HTML presentasi slide-based (Reveal.js) yang siap di-deploy.

## Tujuan
Mengkonversi dokumen Markdown company profile menjadi single-file HTML presentasi interactif menggunakan Reveal.js. Output harus konsisten — urutan, struktur, dan gaya ditentukan oleh template statis, bukan discretion AI.

## Input
- File Markdown company profile: path disediakan oleh caller
- Gambar (opsional): path/URL gambar yang disediakan user, atau jika user ingin tambah gambar, agent boleh mencari/generate

## Output
- `<project>/compros/<name>/index.html` — single-file HTML presentasi
- `<project>/compros/<name>/compro.md` — Markdown asli (copy)
- `<project>/compros/<name>/assets/` — folder gambar (jika ada)
- `<project>/compros/<name>/build.log` — log chunking dan image handling

## Prinsip
1. **Konsistensi:** Gunakan template statis (`templates/profile-shell.html`) dan CSS statis (`templates/custom.css`). Jangan modifikasi template; hanya inject konten.
2. **Chunking deterministic:** H1 = pemisah slide utama. Konten dalam satu slide dibatasi ~150-250 kata atau 1 topik utama.
3. **Gambar valid:** HEAD request ke URL gambar harus 200 sebelum inject. Jika tidak accessible, skip dan catat di build.log.
4. **Tidak ada hallucination:** Jika gambar tidak tersedia, tidak paksa placeholder. Slide tetap tampil tanpa gambar.

## Langkah Kerja

### 1. Parse dan Analyze Markdown
- Baca file Markdown input
- Identifikasi struktur heading (H1, H2, H3)
- Hitung perkiraan kata per section
- Catat semua referensi gambar yang ada di Markdown

### 2. Chunking — Tentukan Slide
Terapkan aturan chunking:
- Setiap H1 → awal slide baru
- Konten dalam satu slide: maksimal ~250 kata atau 1 topik
- Kalau section terlalu panjang, pecah berdasarkan H2/H3 sub-section, atau paragraf natural
- Tabel besar (>5 baris): slide sendiri
- Tiap fitur utama: slide terpisah

Hasil: daftar slide dengan konten yang sudah dipetakan.

### 3. Handle Gambar
- Jika user menyediakan gambar (path/URL dalam Markdown atau via instruksi khusus):
  - Validasi setiap URL: HEAD request, cek 200
  - Jika URL remote dan valid: inject sebagai `<img src="URL">`
  - Jika path lokal: copy ke `assets/`, inject sebagai path relatif
  - Jika gagal: catat di build.log, skip gambar
- Jika user ingin tambah gambar dan AI perlu mencari/generate:
  - Cari atau generate gambar yang relevan
  - Validasi accessibility (HEAD 200)
  - Simpan ke assets/, inject
  - Jika tidak ada yang valid: skip, catat

### 4. Assembly HTML
- Load template `profile-shell.html`
- Baca `templates/custom.css` dan inject konten mentahnya menggantikan placeholder `/* {{CUSTOM_CSS}} */` di dalam `<style>`
- Replace `{{COMPANY_NAME}}` pada `<title>` dengan nama perusahaan
- Inject konten setiap slide ke dalam `<div class="slides">` sebagai `<section>`
  - Konten slide menggunakan format sesuai template (lihat panduan di bawah)
  - Jika ada gambar, inject `<img>` dengan path yang valid
- Tulis hasil assembly ke `<project>/compros/<name>/index.html` (single-file HTML dengan CSS sudah ter-inline, tanpa `<link>` eksternal yang hilang)

### 5. Output
- Create directory: `<project>/compros/<name>/`
- Tulis `index.html`
- Copy `compro.md` (Markdown asli)
- Buat `assets/` folder (kalau ada gambar)
- Tulis `build.log` dengan:
  - Jumlah slide
  - Alasan splitting per slide (jika ada)
  - Path gambar yang di-inject
  - Gambar yang skip (jika ada)

## Template Konten per Slide

### Slide Hero
```
# [Judul Perusahaan]
[Tagline/slogan — 1 baris]

💼 [1 kalimat deskripsi singkat]

📊 [1-3 statistik kunci, bulleted]
```

### Slide Problem
```
## Masalah yang Dihadapi

- [Pain point 1]
- [Pain point 2]
- [Pain point 3]
```

### Slide Solusi/Fitur
```
## [Nama Fitur]

[Deskripsi fitur: 1-3 kalimat]

✨ [Benefit utama]
```

### Slide Pricing
```
## Paket & Harga

| Paket | Harga | Fitur Utama |
|-------|-------|-------------|
| ...   | ...   | ...         |
```

### Slide CTA/Contact
```
## Hubungi Kami

📞 [Kontak]
🌐 [Website]
📍 [Alamat]
```

## Error Handling

| Skenario | Tindakan |
|----------|----------|
| File Markdown tidak ada | Error: "Markdown file not found at <path>" |
| File kosong | Error: "Markdown file is empty" |
| Gambar tidak accessible | Skip gambar, catat di build.log |
| Konten sangat pendek (<50 kata) | Tetap generate minimal 1 slide |
| Konten sangat panjang (>5000 kata) | Chunking ke banyak slide, tidak error |

## Contoh Penggunaan

**User request:** "Buatkan company profile slides dari file `D:/project/compro.md` dengan nama perusahaan 'Acme Inc'"

**Skill execution:**
1. Baca `D:/project/compro.md`
2. Parse, chunking → tentukan slide
3. Handle gambar (jika ada)
4. Assembly HTML dengan template
5. Output ke `<project>/compros/acme-inc/index.html`
6. Return pesan: "Company profile slides dibuat di `<path>/index.html` dengan N slide"
