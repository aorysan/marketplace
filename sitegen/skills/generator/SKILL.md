---
name: Generator Website
description: Generator Website Multi-Page Next.js berdasarkan asupan dokumen Company Profile (PDF). Menghasilkan website korporat profesional dengan standar animasi interaktif modern (terinspirasi dari *Zenless Zone Zero*), animasi smooth scroll Lenis, serta optimasi SEO Lanjutan & UI/UX Pro Max. Output berupa project Next.js TypeScript lengkap (App Router, Vanilla CSS Modules) di folder `landings/<brand>/web/`.
---

# Generator Website

> [!CAUTION]
> **MANDATORY CONSTITUTIONAL BINDING**: Sebelum mengeksekusi pembangunan kode, Anda WAJIB MEMBACA DAN MEMATUHI file konstitusi `AGENTS.md` di folder ini (`AGENTS.md`). Pelanggaran terhadap Strict Slug, verifikasi aksesibilitas gambar eksternal 200 OK, dan Trilogi Animasi AAA adalah *Critical Architecture Failure*.

Menghasilkan **Website Multi-Page berbasis Next.js (TypeScript)** dengan *feel* premium, animasi *smooth scroll* via Lenis, transisi mulus, dan *micro-interactions* tingkat tinggi. Input utama adalah dokumen **Company Profile (PDF)**. Output adalah struktur proyek Next.js lengkap (komponen, halaman, routing, aset, SEO files).

## Prinsip (JANGAN DILANGGAR)

1. **Estetika Profesional, Rasa Dinamis (Trilogi Animasi AAA Standard).** Desain WAJIB 100% profesional dan elegan (Corporate style). Animasi WAJIB memadukan dua kekuatan utama: (1) **Anime.js (`animejs`) + `IntersectionObserver`** via komponen HOC `AnimatedSection.tsx` untuk kemunculan sekuensial dan animasi mikro bersusun, serta (2) **Framer Motion** untuk interaksi *scroll-reveal* satu arah atas-ke-bawah (DILARANG `once: true`, DILARANG bidirectional — implementasikan deteksi arah scroll via `scrollY` tracking) dan transisi *hover state* kartu yang fluid (*infinite ambient looping*). Untuk mencegah glitch di React Strict Mode dan memory leak, Anda WAJIB memanggil `anime.remove(elementRef.current)` pada fungsi *cleanup return* `useEffect`. *Smooth scrolling* Lenis tetap aktif di seluruh halaman. **Kewajiban Animasi Mikro (Staggering):** Selain section utama, SETIAP elemen detail (poin-poin, list, cards, grid items) WAJIB diberikan class `.stagger-item` dan dianimasikan berurutan menggunakan Anime.js (`delay: anime.stagger(100)`). Jangan hanya menganimasi section luarnya saja; elemen di dalamnya harus muncul satu per satu dengan transisi halus yang responsif terhadap gulir layar dari arah atas saja (tanpa larangan sekali-jalan).
2. **Framework & Styling Wajib.** Hanya gunakan **Next.js (App Router)** dengan **TypeScript (`.tsx`)** dan **Vanilla CSS Modules** (`.module.css`). **DILARANG KERAS menggunakan Tailwind CSS**.
3. **Anti-AI Slop & Dilarang Emoji.** DILARANG KERAS menggunakan EMOJI (seperti 🚀, 💡, 🛡️) di elemen UI mana pun karena merusak tingkat profesionalisme korporat. Anda WAJIB hanya menggunakan *iconography* modern berbasis SVG murni atau *library* ikon profesional seperti `lucide-react`.
4. **Gambar Unik, Responsif & Terverifikasi (DILARANG PLACEHOLDER).** DILARANG KERAS menggunakan gambar *placeholder* (seperti `picsum.photos` atau sejenisnya). Prioritas penggunaan gambar: (1) Cek gambar ekstraksi compro di `final_intake.md`/assets. Jika cocok, gunakan. (2) Jika kurang, WAJIB lakukan web search untuk mencari gambar eksternal yang relevan. (3) WAJIB lakukan pengecekan URL eksternal (HTTP ping) untuk memastikan HTTP Status 200 OK (bukan 404). Jika tidak ditemukan gambar eksternal yang valid (berstatus 200 OK), HENTIKAN proses (*halt*) dan minta pengguna menempatkan gambar di folder `public/assets/`. Semua tag `<Image />` harus diberi styling responsif (`max-width: 100%`, `height: auto`, `object-fit: cover`). Gunakan panduan visual dari `PLAN-GLOBAL.md` dan `PLAN-DESIGN-SYSTEM.md` yang sudah dibuat di fase planning.
5. **Preservasi Pesan & Persuasi PDF.** Teks persuasi, poin *value proposition*, dan kalimat berdaya pikat yang ada di PDF Company Profile DILARANG dihapus/dibuang. Teks tersebut harus diadaptasi secara alami dan diperkaya dengan kata kunci SEO.
6. **Animasi Lenis & Anime.js Mandatory.** Setiap proyek WAJIB menginstal `lenis` dan `animejs`. Integrasikan Lenis secara global di `app/layout.tsx` untuk *smooth scrolling*, dan gunakan komponen `AnimatedSection.tsx` (berbasis Anime.js) untuk animasi interaksi saat scroll.
7. **Kepatuhan Mutlak pada PRD.** Seluruh keyword SEO, metadata (Title/Description), konten, struktur halaman, layout section (seperti Grid vs Carousel), dan URL WAJIB diimplementasikan PERSIS seperti yang tertulis di PRD. Dilarang mengarang konten, melakukan riset ulang, atau melanggar spesifikasi PRD.
8. **UI/UX Mobile Responsiveness & Layout Safety untuk tampilan mobile.** 
   - `html` dan `body` WAJIB memiliki `overflow-x: hidden` dan `max-width: 100vw` untuk mencegah bug konten keluar layar.
   - Semua elemen Grid/List dengan **2-9 item WAJIB dibungkus `<SwipeableCards>`** yang dilengkapi **indikator visual jelas** (*pagination dots*, *horizontal scrollbar*, atau *peek effect*).
   - Elemen Grid/List dengan **10 item atau lebih WAJIB diubah menjadi Auto-slide Carousel** dengan indikator visual dan kontrol gesture agar pengguna tidak lelah/bingung melakukan swipe manual terlalu banyak.
9. **Aksesibilitas & Attributes (A11y).** Semua tag `<a>` (link) dan `<img>` / `<Image />` WAJIB memiliki atribut `title` dan `alt`. Seluruh elemen interaktif (seperti tombol Carousel, kartu Swipeable, modal, burger menu) WAJIB dilengkapi `aria-label` yang deskriptif, `tabindex="0"` (jika bukan elemen input/button bawaan), serta mendukung penuh navigasi keyboard (akses via tombol `Tab`, `Enter`, `Space`, dan tombol panah `ArrowLeft`/`ArrowRight`).
10. **LOKASI OUTPUT.** Hasil akhir (proyek Next.js) DILARANG ditaruh di dalam folder skill `.agents/skills/sitegen/`. Harus selalu di-*scaffold* di folder aplikasi `landings/<brand>/web/`.
11. **Generasi Kode Bertahap & Penanganan Revisi Presisi (Atomic Chunking & Line-level Patching).** DILARANG KERAS menghasilkan atau melempar seluruh kode proyek/file sekaligus dalam satu langkah besar untuk menghindari batas token (token limit) atau respon terpotong (*truncated output*). Proses eksekusi WAJIB dilakukan secara bertahap (chunking): scaffold -> setup styling & utility -> buat komponen pendukung mandiri (`components/Hero.tsx`, `components/FAQ.tsx`, dll) -> rakit halaman satu per satu -> validasi build. **Aturan Penanganan Feedback QA:** Jika menerima instruksi revisi dari QA-Reviewer, Anda WAJIB menargetkan secara spesifik file komponen yang disebutkan oleh QA. DILARANG KERAS menulis ulang seluruh kode halaman atau merender ulang file dari awal; Anda HANYA boleh melakukan patch/edit baris (*line-level editing*) pada titik kerusakan spesifik di dalam file komponen tersebut.
12. ** Aturan Wajib Penanganan Logo & Aset Visual (Mandatory Asset Inspection):**
    - **Pemeriksaan Aset Ekstraksi Wajib**: Sebelum membuat atau memperbarui komponen `Header.tsx` dan `Footer.tsx`, Agent WAJIB memeriksa ketersediaan file gambar di folder `public/assets/` atau `assets/`. Cari file gambar hasil ekstraksi (misal `extracted_img_*`, `logo.*`, `brand-logo.*`).
    - **Penggunaan Logo Resmi**: Jika ditemukan file logo hasil ekstraksi dari PDF intake (misal `extracted_img_0_5.jpeg`), Agent WAJIB menggunakannya pada `Header.tsx` dan `Footer.tsx` menggunakan komponen `<Image />` dari `next/image`. **DILARANG** mengganti logo asli dengan badge teks/CSS generik (seperti `<div className="bg-primary">RT</div>`) kecuali jika folder `public/assets/` benar-benar kosong atau tidak berisi file gambar.
    - **Styling Logo pada Layout**:
      - **Header**: Gunakan `<Image src="..." alt="Logo" width={...} height={...} className="h-9 w-auto object-contain" priority />`.
      - **Footer**: Jika footer berlatar gelap, bungkus logo dalam kontainer bersih/terang agar kontras dan mudah dibaca.

---



---

## Workflow Eksekusi

### GATE 0 — PREREQUISITE: PRD & INTAKE DATA
BACA dan GUNAKAN dokumen PRD spesifik halaman (misalnya `PLAN-<halaman>.md`). Namun, apabila terdapat dokumen Master PRD gabungan bernama `PRD.md` di folder root brand, maka prioritaskan penggunaan `PRD.md` tersebut. Gunakan juga `final_intake.md` dan aset gambar dari skill `intake`. DILARANG membuat asumsi atau perencanaan ulang di luar PRD.

### GATE 1 — BACA DAN PAHAMI PRD
Gunakan pemetaan halaman dari `PAGES-LIST.md` / `landings/<brand>/planning/PRD.md`, keyword, Title Tag, Meta Description, struktur section, dan instruksi spesifik (seperti Auto-slide Carousel) yang sudah ada di PRD. JANGAN membuat file JSON terpisah. JANGAN melakukan riset keyword atau merencanakan ulang konten. Langsung gunakan PRD sebagai referensi cetak biru untuk tahap selanjutnya.

### GATE 2 — SCAFFOLDING (TypeScript)
**Guard**: Jika file `landings/<brand>/web/package.json` sudah ada, SKIP scaffolding dan langsung ke GATE 3. Hanya scaffold jika project belum ada.

Beralihlah ke folder `landings/` di root workspace, dan buat folder `<brand>` jika belum ada.
Eksekusi perintah berikut untuk men-scaffold project baru Next.js interaktif (tanpa prompt, menggunakan Vanilla CSS Modules SAMA SEKALI TANPA Tailwind) langsung ke folder web:
```bash
npx -y create-next-app@latest ./landings/<brand>/web --use-npm --eslint --tailwind=false --src-dir=false --app --ts --import-alias="@/*"
```
- Jika ada warning Turbopack/lockfile, atur `next.config.ts`.
- Instal dependensi animasi Lenis, Anime.js, Framer Motion & Ikon: `cd landings/<brand>/web && npm install -y --no-fund lenis lucide-react animejs @types/animejs framer-motion`.

### GATE 3 — DEVELOPMENT, MOBILE UX & SEO INTEGRATION
Setelah Next.js siap:
1. **MANAJEMEN ASET GAMBAR (CRITICAL - ZERO DUPLICATION):** Anda WAJIB memindahkan total (*Move-Item* atau `mv`, BUKAN di-copy atau symlink) seluruh isi folder `landings/<brand>/intake/assets/` ke dalam folder statis Next.js yaitu `landings/<brand>/web/public/assets/`. Jika file gambar sudah terisi di `web/public/assets/` dan folder `intake/assets/` sudah kosong (misal karena pengulangan eksekusi), maka abaikan/SKIP langkah pemindahan ini dengan aman. Pastikan pemanggilan komponen `<Image src="/assets/..." />` merujuk tepat ke path tersebut. Jika Anda menggunakan gambar dari URL eksternal, WAJIB pastikan gambar tersebut membalas HTTP 200 OK (DILARANG placeholder seperti `picsum.photos`; jika tidak ada gambar valid, HENTIKAN proses dan minta pengguna menaruh gambar di `public/assets/`). Anda WAJIB mendaftarkan domain eksternal tersebut ke dalam properti `images.remotePatterns` pada file `next.config.ts`.
2. **CSS System & Anti-Overflow:** Atur CSS variables dari warna brand PDF di `app/globals.css`. Pastikan `html, body` diset `max-width: 100vw; overflow-x: hidden;` untuk mencegah bug konten keluar layar di mobile.
3. **Lenis Provider & SEO Meta:** Konfigurasi Smooth Scroll Lenis di `app/layout.tsx` bersama global metadata.
4. **Komponen Animasi `AnimatedSection.tsx` (Anime.js HOC Standard & Framer Motion Integration):** Buat komponen `AnimatedSection.tsx` sebagai Client Component (`'use client'`). Gunakan `useRef` untuk mereferensikan elemen DOM dan `IntersectionObserver` untuk mendeteksi kapan elemen masuk ke viewport. **Deteksi Arah Scroll Wajib:** Implementasikan tracking `window.scrollY` (atau variabel `lastScrollY`) untuk mendeteksi arah guliran. Animasi Anime.js HANYA boleh dijalankan ketika elemen memasuki viewport DAN arah scroll adalah KE BAWAH (`currentScrollY > lastScrollY`). Jika user scroll ke atas, animasi TIDAK BOLEH terpicu meskipun elemen re-enter viewport. Animasi harus di-RESET (`opacity: 0, translateY: 30`) saat elemen KELUAR viewport, sehingga animasi siap terpicu kembali saat scroll ke bawah berikutnya. Panggil `anime({ targets: elementRef.current, opacity: [0, 1], translateY: [30, 0], duration: 800, easing: 'easeOutCubic', ... })`. Untuk mencegah glitch di React Strict Mode dan memory leak, Anda WAJIB memanggil `anime.remove(elementRef.current)` dan `observer.disconnect()` di fungsi *cleanup return* `useEffect`. Pada komponen bergaya interaktif (seperti kartu atau banner), aplikasikan juga pembungkus **Framer Motion** (`motion.div`) dengan spesifikasi tipe ketat (`as const` pada `transition.ease`) dan loop efek melayang statis (*infinite ambient looping*).
5. **File SEO Wajib:** Buat `app/sitemap.ts`, `app/robots.ts`, dan `public/llms.txt`. (WAJIB pastikan `llms.txt` menggunakan format Markdown standar, diawali dengan H1 header `#`, dan memuat setidaknya satu *absolute link* agar lolos validasi SEO Vercel).
6. **Header & Footer:** Buat `components/Header.tsx` (dengan burger menu mobile 3 garis utuh, safe-area padding) & `components/Footer.tsx`. **PENTING UNTUK HEADER:** Anda WAJIB membaca file Logo dari daftar aset di PRD dan merendernya menggunakan tag `<Image />` di pojok kiri atas Navbar. DILARANG KERAS hanya menggunakan teks polos sebagai logo jika URL gambar logo tersedia.
7. **Mobile Swipeable & Carousel Rules (CRITICAL):**
   - Komponen `<SwipeableCards>` harus dirancang untuk **Native CSS Horizontal Scroll**. JANGAN gunakan manipulasi JS (seperti `transform: translateX`) untuk menggeser kartu karena sering menyebabkan bug "semua kartu bergerak bersamaan".
   - **Struktur CSS Wajib untuk SwipeableCards:**
     1. Parent container WAJIB memiliki `display: flex !important; flex-direction: row !important; flex-wrap: nowrap !important;` pada saat aktif (mobile ≤ 768px, atau all screens untuk carousel).
     2. Parent WAJIB memiliki `overflow-x: auto` dan `scroll-snap-type: x mandatory`. Sembunyikan scrollbar native.
     3. **Semua direct children (kartu)** WAJIB memiliki lebar relatif/tetap dengan larangan shrink (`flex-shrink: 0`), contoh `flex: 0 0 85vw !important;`, agar tidak mengecil dan memaksa munculnya *horizontal scroll*.
     4. Berikan vertical padding (contoh: `padding-block: 20px; margin-block: -20px;`) agar bayangan (shadow) atau efek hover kartu tidak terpotong (clipped).
   - **Larangan Keras:** DILARANG menambahkan media query CSS Grid (contoh: `.gridClass { grid-template-columns: 1fr; }`) dari CSS luar yang menimpa elemen SwipeableCards pada mode mobile.
   - **Aturan Penggunaan Berdasarkan Jumlah Item:**
     - **< 10 Item:** Tampilkan sebagai **Grid biasa di Desktop**, dan jadikan **SwipeableCards di Mobile**. Pastikan pagination dots/counter HANYA MUNCUL DI MOBILE (saat layout menjadi flex-scroll), jangan sampai counter muncul berantakan di desktop.
      - **≥ 10 Item:** Wajib gunakan **Auto-slide Carousel** yang aktif di **Desktop DAN Mobile**. Slider harus otomatis bergerak (`setInterval` mengubah `scrollLeft`) tanpa interaksi pengguna.
   - **Aksesibilitas & Navigasi Keyboard (A11y):** Setiap komponen Carousel dan SwipeableCards WAJIB menyertakan atribut `aria-label` pada tombol penjelajah/pagination, `tabindex="0"` pada container/kartu interaktif, serta mendukung navigasi panah keyboard (`ArrowLeft` dan `ArrowRight` untuk berpindah slide/kartu).
8. **Page Implementation & Schema.org (CRITICAL):**
   - Setiap Halaman WAJIB diinjeksi **Page-Specific Schema.org JSON-LD**:
     - Beranda (`/`): `Organization` / `LocalBusiness` + `WebSite`
     - Layanan (`/services`): `Service`
     - Blog (`/blog`): `Article` / `BlogPosting`
     - Karir (`/careers`): `JobPosting`
     - Semua Halaman: `BreadcrumbList`
   - **Optimasi Performa & Lazy Loading (`next/dynamic`):** Komponen berat seperti **Auto-slide Carousel**, **embedded Maps**, atau section interaktif berukuran besar WAJIB di-import menggunakan `next/dynamic` (Lazy Loading, contoh: `const MapSection = dynamic(() => import('@/components/MapSection'), { ssr: false })`) untuk mengurangi ukuran JS bundle awal dan meningkatkan skor Core Web Vitals.
   - Semua Halaman wajib menyertakan metadata SEO (Title ≤ 55 char, Meta Description ≤ 155 char).
   - Setiap Halaman memuat 1 *section embed video* SMO. Jika membuat embed Google Maps, gunakan URL `https://maps.google.com/maps?q=ALAMAT_URL_ENCODED&output=embed` yang valid dan HINDARI parameter `pb=` hasil halusinasi AI yang memicu *Invalid Request*.
   - Semua `<Image />` atau `<img>` memuat atribut `title` & `alt`, gambar unik/tidak duplikat, dan responsive style. Untuk mengakali skrip regex SEO checker tanpa menyebabkan error *compiler* TypeScript *duplicate props*, gunakan sintaks komentar seperti: `alt={art.alt} /* alt="Deskripsi Statis" */`.
   - Di Halaman Blog: 3 artikel backlink dengan gambar clickable mengarah ke situs utama.
9. **ATURAN LAYOUT HERO/HEADER TANPA GAMBAR:** Jika Anda men-generate komponen Hero (khususnya pada halaman dalam) yang **tidak memiliki `heroImage`**, Anda WAJIB mengubah struktur layout CSS-nya menjadi satu kolom penuh (single column, DILARANG memakai grid 2 kolom). Seluruh teks (Headline, Subheadline, CTA) WAJIB ditata rata tengah (`text-align: center`, `align-items: center`, `justify-content: center`) agar terlihat elegan dan simetris di tengah layar.
10. **IMPLEMENTASI SECTION TYPE `techstack`:** Jika PRD mencantumkan section bertipe `techstack`, buat komponen `TechStack.tsx` dengan ketentuan berikut:
    - **Data Konten**: Terima props `title: string` dan `items: Array<{ name: string, description: string, icon?: string, category?: string }>`.
    - **Layout**: Gunakan CSS Grid responsif (3-4 kolom desktop, 2 kolom tablet, 1 kolom mobile). Jika item ≥ 10, terapkan aturan Auto-slide Carousel. Jika 2-9 item, bungkus dengan `<SwipeableCards>` di mobile.
    - **Visual Style**: Kartu bergaya monospaced/terminal untuk kesan teknis (font `monospace` pada nama teknologi, border tipis dengan aksen warna primary). Setiap kartu WAJIB menggunakan ikon SVG profesional dari `lucide-react` (DILARANG emoji). Jika `icon` prop tersedia dari PRD, gunakan ikon yang sesuai; jika tidak, pilih ikon `lucide-react` yang paling relevan dengan nama teknologi.
    - **Animasi**: Terapkan `.stagger-item` class dengan Anime.js staggering (`anime.stagger(100)`) agar kartu muncul satu per satu saat scroll ke bawah. Sertakan efek hover transform ringan (`scale(1.03)` + shadow elevation).
    - **Aksesibilitas**: Setiap kartu wajib memiliki `aria-label` deskriptif dan `tabindex="0"`.

### GATE 3.5 — VALIDASI BUILD & ERROR HANDLING (CRITICAL)
Sebelum melakukan inisialisasi Git pada GATE 4, Anda WAJIB menjalankan perintah validasi build di folder `landings/<brand>/web`:
```bash
cd landings/<brand>/web && npm run build
```
Jika build gagal atau melempar error (terutama masalah TypeScript, komponen belum di-import, atau struktur HTML salah), HENTIKAN proses. JANGAN melanjut ke inisialisasi git sebelum error diperbaiki sepenuhnya (Anda dilarang mengabaikan kegagalan build ini).

---

### GATE 4 — Version Control (Git Repo Setup)

**Guard**: Jika folder `landings/<brand>/web/.git` sudah ada, SKIP `git init` dan lakukan commit saja.

Buka terminal dan lakukan inisialisasi repositori Git dan buat commit awal di dalam folder proyek Anda:
```bash
cd landings/<brand>/web
# Hanya jika .git belum ada:
git init
# Selalu lakukan:
git add .
git commit -m "feat: page [nama halaman] built by generator"
```
Eksekusi generator selesai di sini. Master orchestrator akan mengambil alih untuk tahap selanjutnya.
