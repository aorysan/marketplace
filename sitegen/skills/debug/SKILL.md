---
name: debug
description: QA Otomatis, Visual Debugging (Puppeteer), dan Analisis Performa/SEO (Lighthouse).
---

# Sitegen Debug

> [!CAUTION]
> **MANDATORY CONSTITUTIONAL BINDING**: Sebelum mengeksekusi diagnosis dan perbaikan bug, Anda WAJIB MEMBACA DAN MEMATUHI file konstitusi `AGENTS.md` di folder ini (`AGENTS.md`). Kepatuhan pada batasan putaran iterasi maksimal dan pemecahan root cause bersifat mutlak.

Skill ini dipanggil setelah server berjalan. Jalankan QA otomatis dalam tahap wajib berikut:

- **Mandat**: Jika user ingin memperbaiki isu, JANGAN HANYA MEMBERIKAN SARAN. Langsung Analisis, Diagnosi, dan LAKUKAN PERBAIKAN langsung ke kode proyek di `landings/<brand>/web/` ! Simpan catatan analisis eksekusi perbaikan Anda di `landings/<brand>/reports/DEBUG_LOG.md`.
- Periksa log build atau dev-server yang menyala di direktori `landings/<brand>/web/` untuk menangkap galat terminal, seperti stack trace atau port bentuk.

## Tahap 0: Pahami PRD
**WAJIB EKSTRAK & BACA**: Agen wajib membaca file `landings/<brand>/planning/PRD.md` dan `landings/<brand>/intake/final_intake.md` terlebih dahulu untuk memahami Visi, Misi, Tema Font, UI/UX preferensi user

## Tahap 1: Visual Debugging (Puppeteer)
1. Jalankan skrip screenshot crawler dengan membaca port aktif dan rute dinamis dari PAGES-LIST.md:
   `node ../../scripts/render.js http://localhost:<port> <brand> <routes...>`
2. **STRICT AUTO-FAIL**: Skrip Puppeteer di atas WAJIB menangkap dan memunculkan error hard-fail jika mendeteksi:
   - Penggunaan Emoji di dalam DOM.
   - Adanya class TailwindCSS.
   - Tag `html` atau `body` tidak memiliki `overflow-x: hidden` dan `max-width: 100vw`.
   - Elemen `<SwipeableCards>` (container flex) yang tidak memiliki `flex-shrink: 0` pada *children*-nya atau gagal menjadi `flex-direction: row` di mobile.
   - Tag `<img>` atau `<Image>` yang tidak memiliki `alt`, `title`, atau tidak responsif (`max-width: 100%`).
   - 404 network error pada pemuatan gambar, atau penggunaan placeholder gambar (`picsum.photos`).
   - Ketiadaan animasi (elemen gagal muncul/ter-render) atau layout yang keluar batas (overflow-x).
3. Periksa log console untuk error React/Next.js (hydration, dll) dan segera perbaiki kode.
4. Periksa semua gambar screenshot di folder `landings/<brand>/reports/.preview/`.
5. Jika ada layout rusak (overflow, gambar terpotong, tipografi error, atau SwipeableCards rusak), perbaiki komponen lalu **ulangi skrip screenshot** sampai 100% sempurna.

## Tahap 2: Performance & SEO (Lighthouse)
1. Setelah Tahap 1 hijau sempurna, jalankan Lighthouse CLI terpisah:
   `npx -y lighthouse http://localhost:<port> --output html --output-path ./landings/<brand>/reports/lighthouse-report.html --view`
2. Analisis skor *Performance*, *Accessibility*, *Best Practices*, dan *SEO*.
3. Lakukan penyesuaian kode (optimasi gambar, aria-labels, dll) untuk meningkatkan skor, lalu jalankan ulang Lighthouse jika perlu.
4. Baca file `landings/<brand>/reports/SEO-AUDIT.md` (atau `reports/SEO-REPORT.md`) dari skill `seo`, perbaiki seluruh masalah meta tag, SOP keyword, dan checklist SEO di folder `web/` hingga 100% patuh.

## Tahap 3: Debugging Mandiri
1. Lakukan pengecekan terhadap kepatuhan aturan `generator`. Agen **WAJIB memverifikasi secara manual**:
   - **Kesesuaian Layout**: Pastikan struktur tampilan mengikuti aturan spesifik dari PRD (misal: aturan *Carousel*).
   - **Integritas Konten**: Pastikan teks persuasi dari PRD tidak terpotong, hilang, atau diganti dengan *lorem ipsum*.
   - **Kesesuaian Visual**: Pastikan elemen menggunakan Warna Brand dan Font yang ditetapkan dari PRD. Periksa file `landings/<brand>/intake/intake_raw.json` atau file konfigurasi CSS utama (`page.module.css` / variabel CSS di folder `web/`) jika ada warna yang terlalu melenceng dari brand.
   - **PENEKANAN KUAT**: Jika hasil *render* melenceng dari PRD, meskipun tidak ada error sintaks/kode, agen **WAJIB** memperbaikinya kembali sesuai PRD.
   - **Lenis Smooth Scroll**: Pastikan scroll berjalan mulus dan tidak ada error Lenis di console.
   - **Animasi Scroll Anime.js (Unidirectional)**: Pastikan elemen/section menggunakan `AnimatedSection.tsx` (Anime.js), animasi HANYA terpicu saat scroll dari atas ke bawah (deteksi arah scroll via `scrollY` tracking), TIDAK terpicu saat scroll ke atas, dan elemen ter-RESET saat keluar viewport. DILARANG `once: true`. Status animasi ter-reset (`anime.remove()`) secara asimetris.
   - **Auto-slide Carousel**: Pastikan list dengan 10+ item otomatis bergeser tanpa interaksi.
   - **Schema.org JSON-LD**: Pastikan metadata JSON-LD valid dan sesuai tipe halaman (Beranda, Layanan, Blog, dll).
   - **Blog Backlink**: Pastikan halaman `/blog` memuat tepat 3 artikel backlink dengan gambar clickable.
   - **Header Mobile**: Pastikan burger menu berupa 3 garis utuh dan memiliki *safe-area padding*.
2. Buka website di browser atau baca source code-nya secara menyeluruh.
3. Jika terdeteksi bug visual, animasi hilang, atau layout aneh yang gagal diperbaiki dalam 2 iterasi, Anda WAJIB memanggil sub-skill `/systematic-debugging` untuk melakukan investigasi mendalam dan tidak boleh lanjut halaman.
4. Lakukan iterasi perbaikan secara mandiri **maksimal 3 kali putaran**. Jika bug membandel, buat laporan dan beri tahu pengguna.

## Tahap 4: Post-Deploy Debug
1. Saat dipanggil setelah deployment Vercel selesai, buka URL live Vercel.
2. Verifikasi tidak ada error di console dan UI tidak rusak di lingkungan produksi.
3. Jika ditemukan error (misalnya API gagal atau gambar 404 di *production*), perbaiki kode secara lokal, lalu re-deploy ke Vercel.
4. Tampilkan URL final ke pengguna hanya setelah dipastikan aman dan LULUS verifikasi live.

Setelah selesai merapikan atau memperbaiki kode di `landings/<brand>/web/`, tuliskan ikhtisar perbaikan Anda dalam bentuk log catatan pendek di `landings/<brand>/reports/DEBUG_LOG.md` (atau sampaikan laporannya secara eksplisit bila skala interaksinya cepat di terminal).

