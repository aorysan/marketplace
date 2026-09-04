# Modular Agent Rules Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menanamkan konstitusi aturan modular (`AGENTS.md`) ke dalam folder skill master `sitegen` dan seluruh folder sub-skill, serta mengaitkan pembacaan aturan (Self-Binding Clause) di setiap `SKILL.md`.

**Architecture:** Menerapkan konsep co-location di mana setiap folder skill (`D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen\`) berisikan file `SKILL.md` untuk alur kerja dan `AGENTS.md` untuk batasan hukum mutlak spesifik domain, dilengkapi klausa pengikatan konstitusional yang wajib dibaca sebelum eksekusi alur.

**Tech Stack:** Markdown, Git, Antigravity Customization Framework.

## Global Constraints

- Wajib mempertahankan seluruh instruksi dan alur kerja yang sudah ada di file `SKILL.md` saat ini (tanpa merusak logika utama).
- Setiap penaklukan atau sisipan klausa di `SKILL.md` wajib ditempatkan tepat di bawah judul utama (`# <Judul>`) atau sebelum bagian alur kerja pertama.
- Dilarang keras menyingkat pasal aturan atau menuliskan placeholder seperti TODO, TBD, atau "dan lain-lain". Semua pasal aturan di `AGENTS.md` harus lengkap dan tuntas.
- Penamaan file harus presisi berformat `AGENTS.md` di folder target.
- Verifikasi pembentukan file dilakukan dengan perintah pengecekan git status dan inspeksi teks (grep/cat).

---

### Task 1: Master Orchestrator Constitution & Self-Binding

**Files:**
- Create: `D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen\AGENTS.md`
- Modify: `D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen\SKILL.md:6-9`
- Test: `D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen\AGENTS.md`

**Interfaces:**
- Produces: Konstitusi master orkestrator yang akan menaungi pemanggilan seluruh sub-skill dan mewajibkan eksekusi berurutan tanpa melewati gerbang review user.

- [ ] **Step 1: Buat file `AGENTS.md` di root repo sitegen skill**

Tuliskan konten berikut secara lengkap ke `D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen\AGENTS.md`:
```markdown
# 🛡️ MASTER ORCHESTRATOR CONSTITUTION (`AGENTS.md`)

> **Konstitusi Kepatuhan Mutlak (Supreme Directive)** untuk AI Agent berperan sebagai Master Orchestrator (`sitegen`). Setiap pelanggaran terhadap pasal di bawah ini dikategorikan sebagai *Critical Architecture Failure*.

---

## PASAL I: GERBANG PERSETUJUAN MULTI-TAHAP (HARD STOP GATES - ZERO BYPASS)
1. **Kepatuhan Pada Jeda Eksplisit:**
   - Setiap instruksi dalam alur orkestrasi yang bertanggar **`[CRITICAL STOP]`**, **`[HARD STOP]`**, atau **`[TUNGGU REVIEW USER]`** adalah BATAS INTERUPSI KERAS.
   - **Aturan Eksekusi:** Master Orchestrator **WAJIB LANGSUNG BERHENTI MENGEKSEKUSI TOOL APA PUN** (`END TURN`) segera setelah menghasilkan dokumen atau tugas pada gerbang tersebut.
   - **Larangan Keras:** Dilarang berasumsi bahwa user akan menyetujui. Dilarang merakit sub-skill atau subagent tahap berikutnya secara bersamaan atau memanfaatkan *momentum otomatisasi* untuk melintasi gerbang sebelum ada teks persetujuan eksplisit dari user di terminal.

---

## PASAL II: DISIPLIN ORKESTRASI SEKUENSIAL & KEJELASAN DELEGASI
1. **Eksekusi Berurutan Tanpa Lompati:**
   - Seluruh langkah (Step 1 hingga Step 11) wajib dijalankan sekuensial. Master Orchestrator dilarang melewati atau menggabungkan eksekusi dua fase kritis sekaligus.
2. **Kewajiban Pengikatan Aturan Sub-Skill:**
   - Saat memanggil sub-skill atau mendelegasikan tugas ke subagent (misal `planner`, `generator`, `qa-reviewer`), Master Orchestrator wajib menyertakan instruksi teks agar agen tersebut mematuhi file konstitusi lokalnya (`<subskill>/AGENTS.md`).

---

## PASAL III: VERIFIKASI KEHADIRAN ASET DARI INTAKE
1. Pada tahap Intake dan Planning, jika aset video dari dokumen asli tidak tersedia, Master Orchestrator wajib menolak asumsi video fiktif dan memastikan status **`[No-Video Default]`** tercatat resmi dalam laporan intake untuk diteruskan ke tahap rancang UI.
```

- [ ] **Step 2: Verifikasi eksistensi dan validasi konten file master `AGENTS.md`**

Run di PowerShell:
```powershell
Get-Content -Path "D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen\AGENTS.md" -TotalCount 5
```
Expected: Menampilkan judul `# 🛡️ MASTER ORCHESTRATOR CONSTITUTION (AGENTS.md)`.

- [ ] **Step 3: Sisipkan Self-Binding Clause di awal master `SKILL.md`**

Pada file `D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen\SKILL.md`, cari blok judul utama:
```markdown
# Sitegen Master Flow

Anda adalah master orkestrator untuk membangun website secara lengkap beralaskan spesifikasi AAA Tier-1. Jalankan langkah-langkah ini sesuai urutan yang tepat dan **PATUHI SETIAP PASAL PADA FILE `AGENTS.md` TANPA KECUALI**.
```

Ganti (drop-in replacement) menjadi:
```markdown
# Sitegen Master Flow

> [!CAUTION]
> **MANDATORY CONSTITUTIONAL BINDING**: Sebelum mengeksekusi alur kerja di bawah, Anda WAJIB MEMBACA DAN MEMATUHI file konstitusi master `AGENTS.md` yang berada se-direktori dengan file skill ini (`D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen\AGENTS.md`). Pelanggaran terhadap gerbang persetujuan (*Hard Stop*) atau pasal di file tersebut adalah *Critical Architecture Failure*.

Anda adalah master orkestrator untuk membangun website secara lengkap beralaskan spesifikasi AAA Tier-1. Jalankan langkah-langkah ini sesuai urutan yang tepat dan **PATUHI SETIAP PASAL PADA FILE `AGENTS.md` TANPA KECUALI**.
```

- [ ] **Step 4: Verifikasi modifikasi pada master `SKILL.md`**

Run di PowerShell:
```powershell
Select-String -Path "D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen\SKILL.md" -Pattern "MANDATORY CONSTITUTIONAL BINDING"
```
Expected: Mengeluarkan teks baris yang cocok berisi "MANDATORY CONSTITUTIONAL BINDING".

- [ ] **Step 5: Commit perubahan Task 1**

Run di PowerShell:
```powershell
cd D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen; git add AGENTS.md SKILL.md; git commit -m "feat(sitegen): add master constitution AGENTS.md and self-binding clause"
```
Expected: [feat-add-rule xxxxxxx] feat(sitegen): add master constitution AGENTS.md and self-binding clause.

---

### Task 2: Planner Sub-skill Constitution & Binding

**Files:**
- Create: `D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen\planner\AGENTS.md`
- Modify: `D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen\planner\SKILL.md:6-10`
- Test: `D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen\planner\AGENTS.md`

**Interfaces:**
- Consumes: Aturan delegasi dari Master Orchestrator.
- Produces: Konstitusi planner yang menjamin tidak adanya PRD pendek/dangkal serta kewajiban parameter AAA Tier-1 di dalam dokumen rancangan (PLAN-GLOBAL, PRD, Sitemap).

- [ ] **Step 1: Buat file `AGENTS.md` untuk Planner**

Tuliskan konten berikut secara lengkap ke `D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen\planner\AGENTS.md`:
```markdown
# 🛡️ PLANNER SUB-SKILL CONSTITUTION (`AGENTS.md`)

> **Konstitusi Kepatuhan Mutlak (Supreme Directive)** untuk AI Agent berperan sebagai Perancang Sistem (`planner`). Setiap pelanggaran terhadap pasal di bawah ini dikategorikan sebagai *Critical Architecture Failure*.

---

## PASAL I: MENOLAK DESAIN DANGKAL (ANTI-SHALLOW MVP)
1. **Kedalaman Konten Mandatori:**
   - Agen dilarang meringkas halaman spesifik (seperti `/game`, `/teknologi`, `/komunitas`, `/karir`, `/tentang-kami`) menjadi sekadar paragraf pendek atau rangkuman minimalis.
   - **Standar Kedalaman PRD:** Setiap rancangan halaman di `PLAN-<halaman>.md` wajib diisi dengan struktur storytelling bernilai tinggi:
     - *Halaman Game/Produk:* Tabel spesifikasi platform, skor penghargaan riwayat pengunduhan, prasarana Cross-Play, dan showcase visual.
     - *Halaman Teknologi/R&D:* Spesifikasi arsitektur komputasi (contoh: Cel-Shading, AI Deep Learning, Cloud Infrastructure), diagram spesifikasi teknis bergaya monospaced, dan statistik latensi/FPS.
     - *Halaman Komunitas:* Integrasi pemutar video rasional (*Touch-Safe YouTube embeds*), fitur hub komunitas (forum, peta interaktif, alat hitung statistik game), dan agenda event/konser offline.
     - *Halaman Karir:* Jaringan kantor global, filter posisi lowongan interaktif, serta rancangan formulir lamaran berbingkai validasi visual elegan.

---

## PASAL II: KEPATUHAN PILAR DESAIN AAA TIER-1
1. Dokumen perancangan global (`PLAN-GLOBAL.md`) WAJIB mengunci 4 parameter desain antarmuka AAA Tier-1:
   - **Sticky Top Navbar:** Header wajib berkonfigurasi `sticky top-0` atau `fixed top-0` dengan z-index minimum `z-50` serta transisi latar belakang visual (*slate glassmorphism* saat gulir).
   - **Trilogi Dynamic Motion AAA:** Wajib meresepkan pemakaian 3 library standar: (1) **Lenis** untuk *inertial smooth scrolling* di Root Layout, (2) **Anime.js** untuk animasi mikro prosedural & partikel interaktif, dan (3) **Framer Motion** untuk *scroll-reveal* & hover fluiditas kartu dengan penulisan tipe ketat (`as const`).
   - **Touch-Safe Mobile Video:** Pemutar video wajib terbungkus di area ergonomis dengan target tombol >44x44px, menyediakan kontrol eksplisit tanpa auto-lock fullscreen atau autoplay berpotensi macet.
   - **Active Visual Sourcing & Asset Mapping:** Dokumen perancangan wajib menjamin ketersediaan pemetaan aset (`ASSET-MAPPING.md`) menuju URL gambar asli beresolusi tinggi. Dilarang merancang UI hampa gambar (*text-only layout*) ataupun memakai tautan rusak/fiktif.
```

- [ ] **Step 2: Verifikasi file `planner/AGENTS.md`**

Run di PowerShell:
```powershell
Test-Path "D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen\planner\AGENTS.md"
```
Expected: `True`.

- [ ] **Step 3: Sisipkan Self-Binding Clause di awal `planner/SKILL.md`**

Pada file `D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen\planner\SKILL.md`, cari:
```markdown
# Sitegen Planner — Multi-Mode Planning

Anda adalah AI Agent yang bertugas membuat **dokumen planning** berformat markdown. Anda beroperasi dalam 3 mode yang dipanggil oleh master orkestrator (`sitegen`).
```

Ganti (drop-in replacement) menjadi:
```markdown
# Sitegen Planner — Multi-Mode Planning

> [!CAUTION]
> **MANDATORY CONSTITUTIONAL BINDING**: Sebelum mengeksekusi alur perancangan di bawah, Anda WAJIB MEMBACA DAN MEMATUHI file konstitusi `AGENTS.md` di folder ini (`D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen\planner\AGENTS.md`). Larangan merancang halaman minimalis (Shallow MVP) dan kewajiban parameter AAA Tier-1 bersifat mutlak.

Anda adalah AI Agent yang bertugas membuat **dokumen planning** berformat markdown. Anda beroperasi dalam 3 mode yang dipanggil oleh master orkestrator (`sitegen`).
```

- [ ] **Step 4: Verifikasi modifikasi pada `planner/SKILL.md`**

Run di PowerShell:
```powershell
Select-String -Path "D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen\planner\SKILL.md" -Pattern "MANDATORY CONSTITUTIONAL BINDING"
```
Expected: Menampilkan baris yang mengandung teks banner tersebut.

- [ ] **Step 5: Commit perubahan Task 2**

Run di PowerShell:
```powershell
cd D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen; git add planner/AGENTS.md planner/SKILL.md; git commit -m "feat(planner): add sub-skill constitution AGENTS.md and self-binding clause"
```

---

### Task 3: Generator Sub-skill Constitution & Binding

**Files:**
- Create: `D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen\generator\AGENTS.md`
- Modify: `D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen\generator\SKILL.md:6-10`
- Test: `D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen\generator\AGENTS.md`

**Interfaces:**
- Consumes: Master PRD, `ASSET-MAPPING.md`, dan instruksi eksekusi dari Master Orchestrator.
- Produces: Konstitusi mutlak untuk pengembang kode Next.js yang menegakkan Strict Slug, verifikasi gambar hasil web search, dan implementasi animasi AAA.

- [ ] **Step 1: Buat file `AGENTS.md` untuk Generator**

Tuliskan konten berikut secara lengkap ke `D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen\generator\AGENTS.md`:
```markdown
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
3. **Scroll-Reveal & Fluidity Cards:** Komponen antarmuka yang memerlukan transisi gesek (*scroll-triggered enters*) dan *hover state* kartu fluid dikerjakan menggunakan **Framer Motion** dengan penulisan tipe ketat (menambah `as const` pada spesifikasi `transition.ease` agar lolos TypeScript checking).

---

## PASAL IV: TOUCH-SAFE MOBILE VIDEO CONTROLLER
1. Seluruh pemutar video (YouTube iframe maupun video lokal) wajib disajikan dalam wrapper ergonomis dengan target tombol interaksi >44x44px.
2. Dilarang memaksakan penguncian *fullscreen* otomatis (*force-lock*) atau *autoplay* suara mendadak yang merusak performa peramban seluler.
```

- [ ] **Step 2: Verifikasi file `generator/AGENTS.md`**

Run di PowerShell:
```powershell
Test-Path "D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen\generator\AGENTS.md"
```
Expected: `True`.

- [ ] **Step 3: Sisipkan Self-Binding Clause di awal `generator/SKILL.md`**

Pada file `D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen\generator\SKILL.md`, cari:
```markdown
# Generator Website

Menghasilkan **Website Multi-Page berbasis Next.js (TypeScript)** dengan *feel* premium, animasi *smooth scroll* via Lenis, transisi mulus, dan *micro-interactions* tingkat tinggi. Input utama adalah dokumen **Company Profile (PDF)**. Output adalah struktur proyek Next.js lengkap (komponen, halaman, routing, aset, SEO files).
```

Ganti (drop-in replacement) menjadi:
```markdown
# Generator Website

> [!CAUTION]
> **MANDATORY CONSTITUTIONAL BINDING**: Sebelum mengeksekusi pembangunan kode, Anda WAJIB MEMBACA DAN MEMATUHI file konstitusi `AGENTS.md` di folder ini (`D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen\generator\AGENTS.md`). Pelanggaran terhadap Strict Slug, verifikasi aksesibilitas gambar eksternal 200 OK, dan Trilogi Animasi AAA adalah *Critical Architecture Failure*.

Menghasilkan **Website Multi-Page berbasis Next.js (TypeScript)** dengan *feel* premium, animasi *smooth scroll* via Lenis, transisi mulus, dan *micro-interactions* tingkat tinggi. Input utama adalah dokumen **Company Profile (PDF)**. Output adalah struktur proyek Next.js lengkap (komponen, halaman, routing, aset, SEO files).
```

- [ ] **Step 4: Verifikasi modifikasi pada `generator/SKILL.md`**

Run di PowerShell:
```powershell
Select-String -Path "D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen\generator\SKILL.md" -Pattern "MANDATORY CONSTITUTIONAL BINDING"
```
Expected: Menampilkan teks baris cocok.

- [ ] **Step 5: Commit perubahan Task 3**

Run di PowerShell:
```powershell
cd D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen; git add generator/AGENTS.md generator/SKILL.md; git commit -m "feat(generator): add sub-skill constitution AGENTS.md and self-binding clause"
```

---

### Task 4: QA-Reviewer Sub-skill Constitution & Binding

**Files:**
- Create: `D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen\qa-reviewer\AGENTS.md`
- Modify: `D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen\qa-reviewer\SKILL.md:6-10`
- Test: `D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen\qa-reviewer\AGENTS.md`

**Interfaces:**
- Consumes: Hasil kode Generator, PRD, dan standar aturan AAA Tier-1.
- Produces: Konstitusi pengujian QA yang menegakkankan penampikan kode cacat aturan dan kesahihan tes Playwright.

- [ ] **Step 1: Buat file `AGENTS.md` untuk QA Reviewer**

Tuliskan konten berikut secara lengkap ke `D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen\qa-reviewer\AGENTS.md`:
```markdown
# 🛡️ QA-REVIEWER SUB-SKILL CONSTITUTION (`AGENTS.md`)

> **Konstitusi Kepatuhan Mutlak (Supreme Directive)** untuk AI Agent berperan sebagai Auditor & Reviewer Kualitas (`qa-reviewer`). Setiap pelanggaran terhadap pasal di bawah ini dikategorikan sebagai *Critical Architecture Failure*.

---

## PASAL I: INSPEKSI ZERO TOLERANCE TERHADAP PELANGGARAN SLUG & SLOP
1. **Audit Kepatuhan Ketat:**
   - QA Reviewer bertugas sebagai benteng pengaman dan WAJIB menolak (menjatuhkan vonis *Fail* atau meminta revisi wajib) terhadap hasil kerja generator apabila mendapati salah satu dari:
     - Pelanggaran *Strict Slug* (rute url, nama berkas, atau tautan tidak sejalan dengan `PAGES-LIST.md`).
     - Keberadaan gambar fiktif, rusak (404), atau kotak abu-abu *placeholder*.
     - Hilang atau rumpang nya pasangan atribut SEO ganda (`alt` dan `title`) pada elemen gambar.
     - Penggunaan emoji standar pada UI (seperti 🚀, 💡, 🛡️) yang merusak estetika korporat.

---

## PASAL II: MANDATORI SANITY TEST TIER-1 AAA
1. Dalam melakukan inspeksi teknikal, QA Reviewer wajib memvalidasi tercapainya standar antarmuka AAA Tier-1:
   - Verifikasi Top Navbar tetap melekat secara mulus (`sticky top-0`, minimum `z-50`) dengan transisi latar glassmorphic tatkala halaman digulir.
   - Verifikasi kehadiran pembungkus smooth scrolling **Lenis** pada struktur root layout.
   - Verifikasi interaktivitas dan keamanan sentuhan jemari (tombol >44x44px) pada pemutar video, tanpa kebisingan autoplay atau kuncian layar paksaan.

---

## PASAL III: KEPATUHAN PENAMAAN & BERKAS PLAYWRIGHT
1. Setelah seluruh pengecekan lulus, berkas pengujian Playwright end-to-end yang di-generate WAJIB menempuh penamaan yang akurat dan kongruen terhadap slug halaman target, tepatnya berformat: `tests/<slug_tepat>.spec.ts` ( Tanpa modifikasi kata atau translasi sepihak).
```

- [ ] **Step 2: Verifikasi file `qa-reviewer/AGENTS.md`**

Run di PowerShell:
```powershell
Test-Path "D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen\qa-reviewer\AGENTS.md"
```
Expected: `True`.

- [ ] **Step 3: Sisipkan Self-Binding Clause di awal `qa-reviewer/SKILL.md`**

Pada file `D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen\qa-reviewer\SKILL.md`, cari:
```markdown
# Sitegen QA Reviewer — Adaptive Quality Gate

Anda adalah AI Agent yang bertugas menjadi **Quality Gate** untuk planning sebelum di-review oleh manusia. Anda beroperasi dalam 2 mode.
```

Ganti (drop-in replacement) menjadi:
```markdown
# Sitegen QA Reviewer — Adaptive Quality Gate

> [!CAUTION]
> **MANDATORY CONSTITUTIONAL BINDING**: Sebelum melakukan review, Anda WAJIB MEMBACA DAN MEMATUHI file konstitusi `AGENTS.md` di folder ini (`D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen\qa-reviewer\AGENTS.md`). Prinsip *Zero Tolerance* terhadap cacat Strict Slug, foto rusak/fiktif, dan kehilangan atribut SEO ganda bersifat mutlak.

Anda adalah AI Agent yang bertugas menjadi **Quality Gate** untuk planning sebelum di-review oleh manusia. Anda beroperasi dalam 2 mode.
```

- [ ] **Step 4: Verifikasi modifikasi pada `qa-reviewer/SKILL.md`**

Run di PowerShell:
```powershell
Select-String -Path "D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen\qa-reviewer\SKILL.md" -Pattern "MANDATORY CONSTITUTIONAL BINDING"
```
Expected: Menampilkan teks baris cocok.

- [ ] **Step 5: Commit perubahan Task 4**

Run di PowerShell:
```powershell
cd D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen; git add qa-reviewer/AGENTS.md qa-reviewer/SKILL.md; git commit -m "feat(qa-reviewer): add sub-skill constitution AGENTS.md and self-binding clause"
```

---

### Task 5: Supporting Sub-skills Constitutions (Intake & Research)

**Files:**
- Create: `D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen\intake\AGENTS.md`
- Create: `D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen\research\AGENTS.md`
- Modify: `D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen\intake\SKILL.md:6-9`
- Modify: `D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen\research\SKILL.md:6-9`

**Interfaces:**
- Produces: Konstitusi untuk proses ekstraksi awal (Intake) dan analisis riset pasar/kompetitor (Research).

- [ ] **Step 1: Buat `intake/AGENTS.md`**

Tuliskan konten berikut secara lengkap ke `D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen\intake\AGENTS.md`:
```markdown
# 🛡️ INTAKE SUB-SKILL CONSTITUTION (`AGENTS.md`)

> **Konstitusi Kepatuhan Mutlak** untuk AI Agent berperan sebagai Ekstraktor Dokumen (`intake`).

---

## PASAL I: VERIFIKASI KEHADIRAN ASET & MEDIA COM PRO
1. **Penegakan Fakta Aset:**
   - Saat memproses data ekstraksi dari dokumen Company Profile, agen wajib mengecek dan mengidentifikasi keberadaan aset foto maupun tautan video murni.
   - **Label No-Video Default:** Apabila dokumen compro terbukti TIDAK MENYEDIAKAN tautan media/video, agen dilarang membuat asumsi tautan palsu. Wajib mencantumkan status **`[No-Video Default]`** secara jelas dalam file `intake_compro.md` sebagai patokan validasi bagi perancang layout berikutnya.
```

- [ ] **Step 2: Buat `research/AGENTS.md`**

Tuliskan konten berikut secara lengkap ke `D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen\research\AGENTS.md`:
```markdown
# 🛡️ RESEARCH SUB-SKILL CONSTITUTION (`AGENTS.md`)

> **Konstitusi Kepatuhan Mutlak** untuk AI Agent berperan sebagai Riset Kebutuhan & Kompetitor (`research`).

---

## PASAL I: ANTI-HALUSINASI DATA & PENCARIAN WEB RIIL
1. **Integritas Analisis Pasar:**
   - Seluruh analisa kompetitor (`PLAN-COMPETITOR.md`) dan kebutuhan pengguna (`PLAN-USER-NEEDS.md`) wajib bersumber dari inferensi valid atas data `intake_compro.md` didampingi oleh eksplorasi pencarian web (web search) otomatis terhadap kondisi aktual industri.
   - Dilarang mengarang atau memanipulasi spesifikasi, keunggulan, maupun SEO keyword dari kompetitor rekaan tanpa fundamen pencarian rill.
```

- [ ] **Step 3: Sisipkan Self-Binding Clause di `intake/SKILL.md`**

Pada `D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen\intake\SKILL.md`, cari:
```markdown
# Sitegen Intake

Anda adalah langkah pertama dalam pipeline pembuatan website. Tugas Anda adalah memproses PDF Company Profile untuk mengekstrak data dan aset visual, lalu merekonstruksinya menjadi dokumen komersial terstruktur. Anda TIDAK MERANCANG struktur halaman atau merencanakan kode; Anda hanya menyiapkan data dan aset yang bersih, semantis, dan terstruktur untuk skill `planning`.
```

Ganti menjadi:
```markdown
# Sitegen Intake

> [!CAUTION]
> **MANDATORY CONSTITUTIONAL BINDING**: Sebelum mengecek dan mengekstrak dokumen, Anda WAJIB MEMBACA DAN MEMATUHI file konstitusi `AGENTS.md` di folder ini (`D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen\intake\AGENTS.md`). Penanaman label `[No-Video Default]` bila tidak ditemukan tautan video adalah wajib.

Anda adalah langkah pertama dalam pipeline pembuatan website. Tugas Anda adalah memproses PDF Company Profile untuk mengekstrak data dan aset visual, lalu merekonstruksinya menjadi dokumen komersial terstruktur. Anda TIDAK MERANCANG struktur halaman atau merencanakan kode; Anda hanya menyiapkan data dan aset yang bersih, semantis, dan terstruktur untuk skill `planning`.
```

- [ ] **Step 4: Sisipkan Self-Binding Clause di `research/SKILL.md`**

Pada `D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen\research\SKILL.md`, cari:
```markdown
# Sitegen Research Skill

Anda adalah AI Researcher. Tugas Anda menghasilkan 2 dokumen riset yang menjadi fondasi planning selanjutnya. Anda TIDAK merancang halaman atau menulis kode. Anda hanya melakukan riset berbasis data dan web search.
```

Ganti menjadi:
```markdown
# Sitegen Research Skill

> [!CAUTION]
> **MANDATORY CONSTITUTIONAL BINDING**: Sebelum melakukan analisa riset pasar dan kompetitor, Anda WAJIB MEMBACA DAN MEMATUHI file konstitusi `AGENTS.md` di folder ini (`D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen\research\AGENTS.md`). Larangan halusinasi data kompetitor dan kewajiban web search rill bersifat mutlak.

Anda adalah AI Researcher. Tugas Anda menghasilkan 2 dokumen riset yang menjadi fondasi planning selanjutnya. Anda TIDAK merancang halaman atau menulis kode. Anda hanya melakukan riset berbasis data dan web search.
```

- [ ] **Step 5: Verifikasi dan commit Task 5**

Run di PowerShell:
```powershell
cd D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen; Test-Path intake/AGENTS.md, research/AGENTS.md; git add intake/ research/; git commit -m "feat(intake,research): add AGENTS.md constitutions and self-binding clauses"
```

---

### Task 6: Supporting Sub-skills Constitutions (SEO, Deploy & Debug)

**Files:**
- Create: `D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen\seo\AGENTS.md`
- Create: `D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen\deploy\AGENTS.md`
- Create: `D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen\debug\AGENTS.md`
- Modify: `D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen\seo\SKILL.md:8-11`
- Modify: `D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen\deploy\SKILL.md:9-11`
- Modify: `D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen\debug\SKILL.md:6-9`

**Interfaces:**
- Produces: Konstitusi pengaman akhir (Audit SEO, validasi Build sebelum Deploy, dan batasan iterasi Debuging).

- [ ] **Step 1: Buat file `seo/AGENTS.md`**

Tuliskan konten berikut secara lengkap ke `D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen\seo\AGENTS.md`:
```markdown
# 🛡️ SEO SUB-SKILL CONSTITUTION (`AGENTS.md`)

> **Konstitusi Kepatuhan Mutlak** untuk AI Agent berperan sebagai Auditor SEO (`seo`).

---

## PASAL I: VALIDASI TOTAL ATRIBUT GANDA & TAUTAN FOTO RIIL
1. **Audit Mutlak Terhadap DOM:**
   - Dalam membedah source code hasil rakitan generator, agen SEO wajib menginvestigasi keberadaan pasangan atribut ganda: `alt="..."` dan `title="..."` pada setiap tag foto (`<img />` / `<Image />`).
   - Setiap temuan foto yang lumpuh (404), memakai placeholder fiktif, atau kehilangan atribut SEO wajib dicatat ke dalam `SEO-REPORT.md` sebagai cacat kritis yang menahan kelayakan rilis web.
```

- [ ] **Step 2: Buat file `deploy/AGENTS.md`**

Tuliskan konten berikut secara lengkap ke `D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen\deploy\AGENTS.md`:
```markdown
# 🛡️ DEPLOY SUB-SKILL CONSTITUTION (`AGENTS.md`)

> **Konstitusi Kepatuhan Mutlak** untuk AI Agent berperan sebagai Rilis Cloud Vercel (`deploy`).

---

## PASAL I: PRASYARAT LOLOS BUILD LOKAL TANPA CACAT
1. **Sanity Check Sebelum Deploy:**
   - Sebelum mengeksekusi pengiriman menuju production cloud (Vercel), agen wajib memastikan bahwa proses pemeriksaan tipe statik (`npx tsc --noEmit`) dan tes build produksi secara lokal (`npm run build`) telah terkonfirmasi LULUS 100% tanpa error.
   - Dilarang melakukan deploy apabila masih terdapat error statik atau laporan kegagalan tes Playwright dari tahapan QA sebelumnya.
```

- [ ] **Step 3: Buat file `debug/AGENTS.md`**

Tuliskan konten berikut secara lengkap ke `D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen\debug\AGENTS.md`:
```markdown
# 🛡️ DEBUG SUB-SKILL CONSTITUTION (`AGENTS.md`)

> **Konstitusi Kepatuhan Mutlak** untuk AI Agent berperan sebagai Troubleshooting & QA Otomatis (`debug`).

---

## PASAL I: DISIPLIN REKONSILIASI EROR & BATAS ITERASI
1. **Pemadaman Root Cause:**
   - Dalam mengoperasikan perbaikan bug lokal maupun pasca-deploy, agen wajib mengidentifikasi akar penyebab (*root cause*) dengan membaca laporan kegagalan tes, `SEO-REPORT.md`, dan log terminal sebelum menerapkan pengeditan kode.
2. **Batasan Iterasi & Pencegahan Loop Tanpa Henti:**
   - Putaran iterasi perbaikan dibatasi maksimal sesuai instruksi master (maksimal 5 putaran di fase generator, maksimal 2 putaran di post-deploy). Apabila masalah belum bergeming, berhentikan sesi dan laporkan diagnosis kepada user.
```

- [ ] **Step 4: Sisipkan Self-Binding Clause di `seo/SKILL.md`**

Pada `D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen\seo\SKILL.md`, cari:
```markdown
# Sitegen SEO

Skill ini bertindak sebagai **Auditor/Checker Akhir** SEO. Agen `seo` bertugas memeriksa website (source code dan infrastruktur SEO buatan skill `generator`) terhadap SOP Checklist SEO di bawah ini.
```

Ganti menjadi:
```markdown
# Sitegen SEO

> [!CAUTION]
> **MANDATORY CONSTITUTIONAL BINDING**: Sebelum mengaudit dokumen dan kode web, Anda WAJIB MEMBACA DAN MEMATUHI file konstitusi `AGENTS.md` di folder ini (`D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen\seo\AGENTS.md`). Kepatuhan audit terhadap atribut ganda `alt`/`title` dan keaslian foto bersifat mutlak.

Skill ini bertindak sebagai **Auditor/Checker Akhir** SEO. Agen `seo` bertugas memeriksa website (source code dan infrastruktur SEO buatan skill `generator`) terhadap SOP Checklist SEO di bawah ini.
```

- [ ] **Step 5: Sisipkan Self-Binding Clause di `deploy/SKILL.md`**

Pada `D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen\deploy\SKILL.md`, cari:
```markdown
# Deploy to Vercel
```

Ganti menjadi:
```markdown
# Deploy to Vercel

> [!CAUTION]
> **MANDATORY CONSTITUTIONAL BINDING**: Sebelum menjalankan proses pengiriman ke Vercel, Anda WAJIB MEMBACA DAN MEMATUHI file konstitusi `AGENTS.md` di folder ini (`D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen\deploy\AGENTS.md`). Larangan melampar deploy tatkala build lokal masih gagal bersifat mutlak.
```

- [ ] **Step 6: Sisipkan Self-Binding Clause di `debug/SKILL.md`**

Pada `D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen\debug\SKILL.md`, cari:
```markdown
# Sitegen Debug

Skill ini dipanggil setelah server berjalan. Jalankan QA otomatis dalam tahap wajib berikut:
```

Ganti menjadi:
```markdown
# Sitegen Debug

> [!CAUTION]
> **MANDATORY CONSTITUTIONAL BINDING**: Sebelum mengeksekusi diagnosis dan perbaikan bug, Anda WAJIB MEMBACA DAN MEMATUHI file konstitusi `AGENTS.md` di folder ini (`D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen\debug\AGENTS.md`). Kepatuhan pada batasan putaran iterasi maksimal dan pemecahan root cause bersifat mutlak.

Skill ini dipanggil setelah server berjalan. Jalankan QA otomatis dalam tahap wajib berikut:
```

- [ ] **Step 7: Verifikasi dan commit Task 6**

Run di PowerShell:
```powershell
cd D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen; Test-Path seo/AGENTS.md, deploy/AGENTS.md, debug/AGENTS.md; git add seo/ deploy/ debug/; git commit -m "feat(seo,deploy,debug): add AGENTS.md constitutions and self-binding clauses"
```

---

### Task 7: Constitutional Bridge on Workspace Root `AGENTS.md`

**Files:**
- Modify: `D:\AryokPunya\Magang\sitegen\AGENTS.md` (Di root workspace luar)
- Test: `D:\AryokPunya\Magang\sitegen\AGENTS.md`

**Interfaces:**
- Produces: Pasal jembatan hukum pada konstitusi utama workspace yang menjamin sahnya konstitusi di setiap folder skill.

- [ ] **Step 1: Tambahkan Bab Jembatan Hukum di `D:\AryokPunya\Magang\sitegen\AGENTS.md`**

Baca bagian akhir dari `D:\AryokPunya\Magang\sitegen\AGENTS.md` dan tambahkan bab baru di paling bawah file:
```markdown
---

## BAB VI: KEPATUHAN PADA KONSTITUSI MODULAR SUB-SKILL (*CO-LOCATED AGENT RULES*)
1. **Legalitas Hukum Sub-Skill Modular:**
   - Seluruh folder skill dan sub-skill di dalam repositori `.agents/skills/sitegen/` dilengkapi dengan file konstitusi khusus (`AGENTS.md`) masing-masing yang berada berdampingan dengan `SKILL.md`.
2. **Kepatuhan Dual-Constituencies:**
   - Apabila sebuah agen AI, Koordinator Master (`sitegen`), ataupun subagent (seperti `generator`, `planner`, `qa-reviewer`, dll.) dipanggil untuk menjalankan tugas porsi skill tertentu, maka file `AGENTS.md` lokal pada folder skill tersebut **berlaku sah sebagai Konstitusi Domain Mutlak** yang seiring dan wajib dilunasi serentak dengan undang-undang di file master ini.
```

- [ ] **Step 2: Verifikasi penambahan bab pada `D:\AryokPunya\Magang\sitegen\AGENTS.md`**

Run di PowerShell:
```powershell
Get-Content -Path "D:\AryokPunya\Magang\sitegen\AGENTS.md" -Tail 15
```
Expected: Menampilkan teks `BAB VI: KEPATUHAN PADA KONSTITUSI MODULAR SUB-SKILL`.

- [ ] **Step 3: Commit perubahan Task 7 pada repository workspace utama**

Run di PowerShell:
```powershell
cd D:\AryokPunya\Magang\sitegen; git add AGENTS.md; git commit -m "docs(rules): add constitutional bridge for co-located modular subskill AGENTS.md"
```
Expected: Lolos commit dengan deskripsi penambahan jembatan hukum konstitusi modular.

---

## Self-Review Loop Check
1. **Spec Coverage:** Sepenuhnya mencakup requirement integrasi `AGENTS.md` modular di repo `sitegen` (root repo skill + tiap folder sub-skill: planner, generator, qa-reviewer, intake, research, seo, deploy, debug) serta penguatan bab jembatan di root workspace global `AGENTS.md`.
2. **No Placeholders:** Semua file target memiliki path Windows absolut murni, kode teks markdown tertulis secara lengkap tanpa TODO, TBD, atau perintah fiksi. Aturan active sourcing + pengecekan HTTP 200 OK di generator tertanam secara eksplisit.
3. **Consistency Check:** Penamaan file, path folder, dan rujukan klausul konsisten satu sama lain dan selaras dengan rancangan desain 2026-08-04.
