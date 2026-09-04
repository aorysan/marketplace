# 🛡️ GENERATOR SUB-SKILL CONSTITUTION (`AGENTS.md`)

> **Konstitusi Kepatuhan Mutlak (Supreme Directive)** untuk AI Agent berperan sebagai Pembangun Kode Website (`generator`). Setiap pelanggaran terhadap pasal di bawah ini dikategorikan sebagai *Critical Architecture Failure*.

---

## PASAL I: STRICT SLUG & FRAMEWORK ENFORCEMENT
1. **Kepatuhan Rute Tanpa Toleransi:**
   - Gunakan selalu **Next.js App Router** (TypeScript + Vanilla CSS Modules). DILARANG KERAS menggunakan Tailwind CSS.
   - Nama rute folder, slug URL, penamaan direktori, dan tautan internal WAJIB 100% kongruen dengan dokumen `PAGES-LIST.md`.
   - **Larangan Translasi:** Dilarang merubah, memotong, atau menerjemahkan nama slug secara sepihak (contoh: jika slug di sitemap adalah `/tentang-kami`, dilarang merubahnya menjadi `/about` atau `/tentang`).

---

## PASAL II: ANTI-PLACEHOLDER, ACTIVE SOURCING & ATRIBUT SEO GANDA
1. **Anti-Placeholder & Anti-Empty Slop:**
   - Dilarang keras menggunakan tautan gambar rusak/fiktif (seperti `https://via.placeholder.com`, `picsum.photos`, atau `example.jpg`) serta dilarang menggunakan kotak abu-abu kosong.
   - Website wajib menampilkan gambar karya seni visual riil (*poster, character art, screenshot, hero photo*) bersumber dari `ASSET-MAPPING.md` atau direktori lokal `public/assets/`.
2. **Kewajiban Pencarian Aktif & Verifikasi URL (Active Visual Sourcing):**
   - Apabila gambar di folder aset kurang atau dibutuhkan gambar eksternal baru, Generator **WAJIB aktif melakukan pencarian internet (web search)** untuk mendapatkan gambar beresolusi tinggi yang akurat sesuai industri web.
   - **Mandate Verifikasi Aksesibilitas:** Generator **WAJIB memeriksa dan memverifikasi (melalui HTTP ping/status pengecekan)** bahwa URL eksternal yang ditemukan berstatus valid dan dapat diakses (HTTP Status 200 OK, bukan 404/403) sebelum disematkan ke dalam kode antarmuka.
3. **Kepatuhan Atribut SEO Foto Ganda:**
   - Setiap elemen gambar (`<img />` atau `next/image`) WAJIB dibekali pasangan atribut ganda yang sarat kata kunci (keyword) industri:
     - `alt="..."`: Deskripsi teks akurat yang ramah SEO dan tunanetra.
     - `title="..."`: Judul tooltip konseptual yang menguatkan relevansi tema halaman.

---

## PASAL III: IMPLEMENTASI TRILOGI ANIMASI AAA TIER-1
1. **Inertial Smooth Scrolling:** Root Layout (`app/layout.tsx`) wajib dipasangi wrapper smooth scrolling memanfaatkan library **`lenis`** untuk kelembutan gulir beresolusi tinggi.
2. **Animasi Mikro & Staggering:** Seluruh elemen detail (poin-poin, list, card, grid) wajib dipasangi class `.stagger-item` dan dianimasikan menggunakan **Anime.js** (`anime.stagger`). Jangan hanya menganimasi section luar; elemen anak harus muncul satu per satu. Wajib memprioritaskan pembersihan (`anime.remove`) di fungsi cleanup `useEffect`.
3. **Scroll-Reveal Satu Arah & Fluidity Cards:** Komponen antarmuka yang memerlukan transisi gesek (*scroll-triggered enters*) dikerjakan menggunakan **Framer Motion** dengan animasi HANYA terpicu saat scroll KE BAWAH (implementasikan deteksi arah scroll, DILARANG `once: true`, DILARANG bidirectional). *Hover state* kartu fluid menggunakan penulisan tipe ketat (menambah `as const` pada spesifikasi `transition.ease` agar lolos TypeScript checking).

---

## PASAL IV: TOUCH-SAFE MOBILE VIDEO CONTROLLER
1. Seluruh pemutar video (YouTube iframe maupun video lokal) wajib disajikan dalam wrapper ergonomis dengan target tombol interaksi >44x44px.
2. Dilarang memaksakan penguncian *fullscreen* otomatis (*force-lock*) atau *autoplay* suara mendadak yang merusak performa peramban seluler.
