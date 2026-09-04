# Sitegen Master Skill Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Melakukan pembenahan 5 pilar peningkatan pada masterskill sitegen dan sub-skill untuk mengatasi kontradiksi aturan animasi (Framer Motion vs Anime.js & Asymmetric Reset), sinkronisasi penamaan dan alur audit SEO, injeksi shift-left standar SEO ke Master PRD, dan perkuatan verifikasi visual nyata melalui screenshot Playwright.

**Architecture:** Modifikasi instruksi deklaratif pada berkas `SKILL.md` di repo skill sitegen (`D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen`) agar 100% harmonis dengan hukum konstitusi absolut di `AGENTS.md`.

**Tech Stack:** Markdown, Next.js App Router Guidelines, Anime.js v4, Framer Motion, Lenis Smooth Scroll, Playwright E2E.

## Global Constraints
- Kepatuhan mutlak pada Konstitusi Master (`AGENTS.md`).
- Larangan menyelaraskan instruksi dengan kata-kata placeholder (tanpa TBD/TODO/implement later).
- Setiap pengubahan instruksi teks pada `SKILL.md` wajib menyalin blok kode atau teks pengganti eksplisit yang utuh.

---

### Task 1: Resolusi Kontradiksi Library Animasi & Aturan Reset pada Sub-skill Generator

**Files:**
- Modify: `D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen\generator\SKILL.md:13-35`
- Modify: `D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen\generator\SKILL.md:50-58`
- Modify: `D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen\generator\SKILL.md:60-92`

**Interfaces:**
- Consumes: Aturan konjungsi animasi dari `generator/AGENTS.md` (Pasal III.3) & masterskill `sitegen/SKILL.md`.
- Produces: Instruksi scaffolding baru dengan `framer-motion`, pencabutan larangan Framer Motion, penghapusan klausal Asymmetric Reset, dan penetapan guliran dua arah konsisten (*Bidirectional Scroll-Reveal & Looping*).

- [ ] **Step 1: Periksa dan modifikasi Prinsip 1 pada `generator/SKILL.md`**

Ganti teks Prinsip 1 (baris ke-15) dari yang semula melarang Framer Motion dengan instruksi pemaduan sah:
```markdown
1. **Estetika Profesional, Rasa Dinamis (Trilogi Animasi AAA Standard).** Desain WAJIB 100% profesional dan elegan (Corporate style). Animasi WAJIB memadukan dua kekuatan utama: (1) **Anime.js (`animejs`) + `IntersectionObserver`** via komponen HOC `AnimatedSection.tsx` untuk kemunculan sekuensial dan animasi mikro bersusun, serta (2) **Framer Motion** untuk interaksi *scroll-reveal* dua arah (`viewport={{ once: false, amount: 0.15 }}`) dan transisi *hover state* kartu yang fluid (*infinite ambient looping*). Untuk mencegah glitch di React Strict Mode dan memory leak, Anda WAJIB memanggil `anime.remove(elementRef.current)` pada fungsi *cleanup return* `useEffect`. *Smooth scrolling* Lenis tetap aktif di seluruh halaman. **Kewajiban Animasi Mikro (Staggering):** Selain section utama, SETIAP elemen detail (poin-poin, list, cards, grid items) WAJIB diberikan class `.stagger-item` dan dianimasikan berurutan menggunakan Anime.js (`delay: anime.stagger(100)`). Jangan hanya menganimasi section luarnya saja; elemen di dalamnya harus muncul satu per satu dengan transisi halus yang responsif terhadap gulir layar dari arah atas maupun bawah (tanpa larangan sekali-jalan).
```

- [ ] **Step 2: Modifikasi instruksi perintah instalasi pada GATE 2 (`generator/SKILL.md`)**

Ganti baris instalasi dependensi animasi (baris ke-57) agar memasang `framer-motion`:
```markdown
- Instal dependensi animasi Lenis, Anime.js, Framer Motion & Ikon: `cd landings/<brand> && npm install -y --no-fund lenis lucide-react animejs @types/animejs framer-motion`.
```

- [ ] **Step 3: Modifikasi instruksi GATE 3 Poin 4 pada `generator/SKILL.md` (Hapus Asymmetric Reset)**

Ganti penjelasan poin 4 (baris ke-64) agar mencabut Asymmetric Reset dan mengesahkan gerak dua arah:
```markdown
4. **Komponen Animasi `AnimatedSection.tsx` (Anime.js HOC Standard & Framer Motion Integration):** Buat komponen `AnimatedSection.tsx` sebagai Client Component (`'use client'`). Gunakan `useRef` untuk mereferensikan elemen DOM dan `IntersectionObserver` untuk mendeteksi kapan elemen masuk ke viewport. Ketika elemen terlihat (intersecting), jalankan animasi Anime.js via `anime({ targets: elementRef.current, opacity: [0, 1], translateY: [30, 0], duration: 800, easing: 'easeOutCubic', ... })`. Untuk mencegah glitch di React Strict Mode dan memory leak, Anda WAJIB memanggil `anime.remove(elementRef.current)` dan `observer.disconnect()` di fungsi *cleanup return* `useEffect`. **Aturan Guliran Dua Arah (Bidirectional Reveal):** Animasi merespons pergerakan layar baik saat gulir turun maupun naik; jangan kunci elemen sekali muncul. Pada komponen bergaya interaktif (seperti kartu atau banner), aplikasikan juga pembungkus **Framer Motion** (`motion.div`) dengan spesifikasi tipe ketat (`as const` pada `transition.ease`) dan loop efek melayang statis (*infinite ambient looping*).
```

- [ ] **Step 4: Verifikasi perubahan spesifik melalui git diff**

Run: `cd D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen; git diff generator/SKILL.md`
Expected: Perbedaan kode menampilkan penghapusan larangan Framer Motion, penambahan instalasi `framer-motion`, serta bergantinya klausal *Asymmetric Reset* menjadi *Bidirectional Reveal*.

- [ ] **Step 5: Commit perubahan Task 1**

```bash
cd D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen
git add generator/SKILL.md
git commit -m "fix(generator): resolve framer motion contradiction, include npm module, and adopt bidirectional animation loops"
```

---

### Task 2: Sinkronisasi Penamaan Skill `seo`, Rute Remediasi Debug, dan Shift-Left PRD di Masterskill Sitegen

**Files:**
- Modify: `D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen\SKILL.md:33-38`
- Modify: `D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen\SKILL.md:57-64`

**Interfaces:**
- Consumes: Checklist Internal SEO dari `seo/SKILL.md` dan struktur nama folder `seo`.
- Produces: Aturan Langkah 4a yang mewajibkan injeksi parameter SEO ke PRD, serta Langkah 7a yang mengoreksi panggilan menjadi `seo` dilengkapi rute perbaikan otomatis `debug` maksimal 3 iterasi saat `SEO-REPORT.md` gagal.

- [ ] **Step 1: Modifikasi instruksi Langkah 4a di `SKILL.md` (Shift-Left SEO ke Master PRD)**

Ganti teks Langkah 4a (baris ke-34) dengan penekanan kewajiban spesifikasi SEO internal:
```markdown
   a. **Buat PRD Semua Halaman (Shift-Left SEO Injection):** Baca `landings/<brand>/planning/PAGES-LIST.md`. Panggil sub-skill `planner` mode=page untuk men-generate PRD (`PLAN-<halaman>.md`) untuk **semua** halaman yang terdaftar sekaligus dengan ketentuan kedalaman konten penuh (tanpa ringkasan MVP dangkal). **Kewajiban Injeksi SEO Internal:** Sub-skill planner WAJIB mencantumkan spesifikasi SEO per halaman secara eksplisit: (1) Grup keyword utama jenis *buying keyword* dan keyword pendukung LSI, (2) Title Tag (<= 55 karakter) memuat 2-3 keyword impression tinggi berjiwa CTR-oriented, (3) Meta Description (<= 155 karakter) memuat value proposition kuat dan LSI yang belum tercakup di Title Tag, serta (4) Spesifikasi Schema.org JSON-LD akurat. Khusus halaman Blog (`/blog`), wajib mencantumkan perancangan 3 artikel backlink berkualitas berserta gambar representatif *clickable* mengarah ke situs utama.
```

- [ ] **Step 2: Modifikasi instruksi Langkah 7a di `SKILL.md` (Resolusi nama `seo` & Rute Remediasi `debug`)**

Ganti teks Langkah 7a (baris ke-58) dengan pengoreksian nama skill dan rute perbaikan laporan error:
```markdown
   a. **SEO Validation & Remediation Loop**: Panggil sub-skill `seo` (bukan `seo-validator`) untuk memverifikasi seluruh tag `<img />` dan `next/image` terbekali atribut ganda `alt` dan `title` yang kaya makna SEO spesifik brand, memeriksa kesesuaian checklist SEO internal, serta menyingkirkan gambar fiktif/rusak atau tidak relevan. Hasil analisis dicatat pada berkas `landings/<brand>/SEO-REPORT.md`. **Rute Remediasi Wajib:** Apabila `SEO-REPORT.md` mencatat adanya error, pelanggaran, atau kegagalan spesifikasi SEO, Master Orchestrator WAJIB memanggil sub-skill `debug` untuk mengeksekusi perbaikan kode secara sistematis berdasarkan catatan laporan tersebut (maksimal 3 iterasi fix loop) hingga audit `seo` menyatakan bersih (*clean PASS*) sebelum melanjutkan ke tahap debug lokal final.
```

- [ ] **Step 3: Verifikasi perubahan spesifik melalui git diff**

Run: `cd D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen; git diff SKILL.md`
Expected: Perbedaan kode menampilkan injeksi spesifikasi SEO di Langkah 4a dan bergantinya nama `seo-validator` menjadi `seo` berikut penambahan rute remediasi `debug` pada Langkah 7a.

- [ ] **Step 4: Commit perubahan Task 2**

```bash
cd D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen
git add SKILL.md
git commit -m "feat(sitegen): correct seo skill invocation, add debug remediation loop, and enforce shift-left SEO in Master PRD"
```

---

### Task 3: Protokol Batas Iterasi (Fallback Limit) & Verifikasi Bukti Tangkapan Layar Playwright di Masterskill Sitegen

**Files:**
- Modify: `D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen\SKILL.md:39-56`

**Interfaces:**
- Consumes: Alur eksekusi halaman Langkah 5 (Hybrid SDD Iteration & Deep Storytelling).
- Produces: Protokol penanganan saat batas maksimal 5 iterasi terlampaui (*Error Digest & Hard Stop*), serta instruksi penangkapan bukti screenshot Playwright nyata yang dicek visual oleh `qa-reviewer`.

- [ ] **Step 1: Modifikasi instruksi Langkah 5a, 5b, dan 5c di `SKILL.md`**

Ganti teks Langkah 5a, 5b, dan 5c (baris ke-42 hingga 53) untuk menambahkan protokol batas iterasi putus asa dan verifikasi visual screenshot nyata:
```markdown
   a. **AI-to-AI SDD Loop & Fallback Protocol:**
      - Panggil subagent `generator` khusus untuk membangun halaman tersebut ke dalam project Next.js berdasarkan Master PRD (`PRD.md`), pedoman visual, dan `ASSET-MAPPING.md`.
      - **Kepatuhan Arsitektur & Aturan Eksekusi Wajib Generator (`AGENTS.md` Compliance):**
        1. **Framework Compliance**: WAJIB memuat dan mematuhi aturan panduan modern di file `AGENTS.md` serta dokumentasi resmi Next.js App Router.
        2. **Strict Slug Enforcement**: Generator DILARANG mengubah, mentranslasikan, atau memodifikasi nama slug string dari `PAGES-LIST.md`. Rute folder, nama penanganan struktur komponen, hingga referensi tautan WAJIB 100% kongruen.
        3. **Mandatory Brand Logo & Relevant Artwork Attributes**: Generator WAJIB menyisipkan elemen logo brand asli dan gambar produk tulen bersumber dari `ASSET-MAPPING.md` pada kartu dan banner, dengan pasangan atribut ganda `alt="..."` DAN `title="..."` berisikan kata kunci (keyword) SEO yang akurat.
        4. **Continuous Bidirectional & Looped Animations (Anti Sekali Jalan)**: Gunakan **Anime.js v4** dan Framer Motion dengan animasi gulir dua arah (`viewport={{ once: false, amount: 0.15 }}`) serta animasi mikro melayang tak henti (*repeat: Infinity*) pada elemen kartu, ikon, dan background kosmik agar UI hidup 24/7.
      - Setelah pembangunan halaman selesai, panggil subagent `qa-reviewer` untuk mengecek hasil kode terhadap PRD, *Strict Slug*, keberadaan logo & gambar nyata yang relevan, serta verifikasi bahwa animasi TIDAK berjalan sekali doang (`once: false`).
      - Jika ada bug, UI kurang memukau, atau pelanggaran spesifikasi di atas, biarkan subagent saling berkoordinasi (maksimal 5 iterasi fix loop).
      - **Protokol Batas Iterasi (Fallback Limit Protocol):** Apabila iterasi perbaikan mencapai batas maksimal (5 kali) namun halaman belum sepenuhnya lulus spesifikasi QA atau masih terdapat error, subagent DILARANG melompati halaman atau terus bergelung tanpa henti. Agen WAJIB merangkai laporan kegagalan krisis (*Error Digest*) yang mencerminkan detail masalah tak terselesaikan, memicu gerbang interupsi keras (`[HARD STOP]`), dan mengakhiri giliran dengan menyuguhkan laporan tersebut kepada user untuk meminta petunjuk lanjutan atau persetujuan override.
   b. **Playwright Spec & Authentic Visual Screenshot Capture:** Setelah AI menganggap halaman sempurna, generate file pengujian Playwright berdasarkan PRD dan jalankan pengujian dengan nama `tests/<slug_tepat>.spec.ts`. **Kewajiban Rekam Bukti Visual:** Dalam skrip pengujian Playwright tersebut, Anda WAJIB menginstruksikan penangkapan gambar aktual layar peramban (*screenshot capture*) untuk penampil versi Desktop (1280x720) dan Mobile (375x667), lalu mengawetkan berkas bukti `.png` tersebut ke dalam direktori pengujian/aset.
   c. **Visual QA Review & [CRITICAL STOP - TUNGGU REVIEW USER - ZERO BYPASS]:** Sebelum menyerahkan hasil ke user, panggil subagent `qa-reviewer` untuk melakukan evaluasi visual secara langsung terhadap berkas tangkapan layar otentik dari Playwright guna memastikan kenyataan render logo asli, tata letak responsif berseri AAA, dan ketidakhadiran placeholder palsu. Tampilkan kesimpulan review dan hasil akhir halaman beserta bukti screenshot tersebut kepada user. **HARD STOP**: BERHENTI MENGEKSEKUSI TOOL APA PUN (END TURN). Tunggu user mengecek dev server dan memberikan persetujuan eksplisit atau revisi. JANGAN lanjut ke halaman berikutnya sebelum disetujui.
```

- [ ] **Step 2: Verifikasi perubahan spesifik melalui git diff**

Run: `cd D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen; git diff SKILL.md`
Expected: Perbedaan kode menampilkan penambahan Protokol Batas Iterasi (*Fallback Limit*) pada Langkah 5a, perintah tangkap screenshot Playwright pada Langkah 5b, dan pengecekan visual nyata sebelum Critical Stop di Langkah 5c.

- [ ] **Step 3: Commit perubahan Task 3**

```bash
cd D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen
git add SKILL.md
git commit -m "feat(sitegen): implement fallback limit protocol on SDD loop and mandate authentic playwright screenshot visual review"
```

---

## Self-Review Verification Checklist
- [x] **Spec coverage:** Keterangan seluruh 5 pilar perbaikan tercermin pada Task 1 (Animasi generator), Task 2 (SEO & PRD shift-left), dan Task 3 (Iterasi fallback & visual screenshot QA).
- [x] **Placeholder scan:** Tidak ada TBD, TODO, atau kata placeholder tidak terdefinisi. Semua skema modifikasi disertai baris pengganti utuh.
- [x] **Type & Slug consistency:** Pengutipan nama skill `seo`, parameter `once: false, amount: 0.15`, serta direktori repo konsisten di semua bagian dokumen.
