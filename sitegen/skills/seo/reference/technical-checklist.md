# Technical Checklist — Checklist Reviewer

Daftar item teknis yang dicek oleh script `check-technical.js` dan AI agent.

---

## A. Cek Teknis Otomatis (Script)

Berikut item yang dicek otomatis oleh script `scripts/check-technical.js`:

| # | Item | Cara Cek | Acuan |
|---|---|---|---|
| 1 | Title tag ada | Cari `<title>` di HTML atau `metadata.title` di TSX | Generator SOP §8 |
| 2 | Title tag <= 55 char | Hitung panjang isi title tag | SEO SOP Checklist §3 |
| 3 | Meta description ada | Cari `<meta name="description">` di HTML atau metadata di TSX | Generator SOP §8 |
| 4 | Meta description <= 155 char | Hitung panjang isi meta desc | SEO SOP Checklist §3 |
| 5 | Alt text semua gambar | Cari `alt=` di semua `<img>` dan `<Image>` | Generator Prinsip §9 |
| 6 | Title attr semua link | Cari `title=` di semua `<a>` | Generator Prinsip §9 |
| 7 | robots.txt ada | Cek file `robots.txt` atau `app/robots.ts` | Generator SOP §8 |
| 8 | sitemap ada | Cek file `sitemap.xml` atau `app/sitemap.ts` | Generator SOP §8 |
| 9 | Schema.org JSON-LD ada | Cari `application/ld+json` di file | Generator GATE 3 §6 |
| 10 | overflow-x: hidden | Cari di CSS files | Generator Prinsip §8 |
| 11 | Lenis terintegrasi | Cek package.json atau import di TSX | Generator Prinsip §6 |
| 12 | Tidak ada emoji | Scan karakter emoji Unicode di file | Generator Prinsip §3 |
| 13 | CSS Modules (bukan Tailwind) | Cek tidak ada tailwindcss di dependencies | Generator Prinsip §2 |

---

## B. Cek Konten oleh AI Agent (Manual vs PRD)

Berikut item yang dicek oleh AI agent dengan membandingkan landing page vs PRD:

| # | Item | Cara Cek | Acuan |
|---|---|---|---|
| 1 | Rute inti sesuai PAGES-LIST.md | Cek folder `app/` memiliki rute sesuai PRD | PRD §5 |
| 2 | Route/URL sesuai PRD | Bandingkan route di `app/` dengan PRD §4.1 | PRD §4.1 |
| 3 | Sections per halaman sesuai | Baca TSX setiap halaman, bandingkan dengan PRD §5 | PRD §5.1-5.7 |
| 4 | Kalimat persuasi muncul | Cari string kalimat persuasi dari PRD §2 di file TSX/HTML | PRD §2 |
| 5 | Headline sesuai PRD | Bandingkan `<h1>`, `<h2>` di TSX dengan field headline di PRD | PRD §5 |
| 6 | CTA text sesuai PRD | Bandingkan teks tombol CTA di TSX dengan PRD | PRD §5 |
| 7 | Warna sesuai PRD | Cek CSS variables `--primary`, `--secondary`, `--dark` vs PRD §3 | PRD §3 |
| 8 | Font sesuai PRD | Cek Google Font import atau CSS font-family vs PRD §3 | PRD §3 |
| 9 | Gambar unik | Cek tidak ada URL/path gambar yang dipakai lebih dari 1 kali | Generator Prinsip §4 |
| 10 | Footer data sesuai | Bandingkan footer component dengan PRD §6 | PRD §6 |
| 11 | Video SMO ada | Cek ada `<iframe>` atau embed video di setiap halaman | PRD §5, SEO SOP §6 |
| 12 | Blog backlinks ada | Cek halaman blog ada 3 artikel dengan link ke website utama | PRD §4.3 |
