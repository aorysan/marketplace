# Design Specification: Modular Agent Rules Integration for Sitegen
**Date**: 2026-08-04
**Status**: Approved / Ready for Plan
**Target Repository**: `D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen`
**Target Architecture**: Co-located `AGENTS.md` rules inside the master skill folder and all sub-skill directories.

## 1. Overview & Objectives
Tujuan dari desain ini adalah membangun arsitektur aturan agen yang modular dan ter-struktur tepat di dalam repositori skill master `sitegen` (`D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen`). Alih-alih membebankan seluruh rincian instruksi dan larangan dari setiap subagent ke dalam satu file hukum tunggal atau mencampuradukannya dalam alur kerja `SKILL.md`, kita membagi aturan sesuai domain peran dan sub-skill.
Dengan menempatkan file konstitusi khusus (`AGENTS.md`) berdampingan dengan file alur kerja (`SKILL.md`) di dalam folder skill utama dan sub-skill, kita mewujudkan prinsip *Separation of Concerns*, hemat penggunaan *context window* (*progressive disclosure*), serta kepatuhan mutlak (*zero bypass*) yang lebih presisi.

## 2. Directory Architecture
Struktur direktori di dalam repositori skill (`D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen`) ditata sebagai berikut:

```
D:/AryokPunya/Magang/sitegen/.agents/skills/sitegen/   <-- Git Repository (branch: feat-add-rule)
├── SKILL.md                          (Alur kerja master 11 langkah orkestrasi)
├── AGENTS.md                         (Konstitusi Master: Aturan koordinasi, Hard Stop Gates, Zero Bypass)
│
├── planner/                          <-- Sub-skill Perencanaan & Desain Sistem
│   ├── SKILL.md
│   └── AGENTS.md                     (Aturan khusus: Anti-shallow MVP, kedalaman konten, AAA Tier-1 mandate)
│
├── generator/                        <-- Sub-skill Pembangun Halaman Next.js
│   ├── SKILL.md
│   └── AGENTS.md                     (Aturan khusus: Strict Slug, foto SEO ganda, Trilogi Animasi, Active Visual Sourcing)
│
├── qa-reviewer/                      <-- Sub-skill Audit & Pengujian Playwright
│   ├── SKILL.md
│   └── AGENTS.md                     (Checklist wajib QA: sticky navbar, lenis, touch-safe video, zero tolerance)
│
├── intake/                           <-- Sub-skill Ekstraksi Dokumen Compro PDF
│   ├── SKILL.md
│   └── AGENTS.md                     (Wajib validasi ketersediaan aset & penandaan status No-Video Default)
│
├── research/                         <-- Sub-skill Riset Kebutuhan User & Kompetitor
│   ├── SKILL.md
│   └── AGENTS.md                     (Larangan halusinasi data kompetitor, wajib pencarian web aktual)
│
├── seo/                              <-- Sub-skill Audit SEO Final
│   ├── SKILL.md
│   └── AGENTS.md                     (Audit duplikasi atribut alt/title, anti link gambar rusak/fiktif)
│
├── deploy/                           <-- Sub-skill Deployment Vercel
│   ├── SKILL.md
│   └── AGENTS.md                     (Prinsip verifikasi lolos build lokal sebelum pengiriman cloud)
│
└── debug/                            <-- Sub-skill Post-Deploy Troubleshooting
    ├── SKILL.md
    └── AGENTS.md                     (Batas maksimal iterasi fix loop, dokumentasi root cause)
```

## 3. Detailed Rule Decomposition per Role
Berikut adalah pembagian pasal aturan mutlak yang wajib ditanamkan di setiap file `AGENTS.md` pada folder skill yang bersesuaian:

### 3.1 Master Orchestrator: `AGENTS.md` (di root repo sitegen skill)
1. **Kepatuhan Jeda Eksplisit (Hard Stop Gates)**: Wajib mengakhiri giliran kerja (`END TURN`) dan dilarang memotong atau melintasi tag `[CRITICAL STOP]` dan `[HARD STOP]`. Dilarang memanfaatkan momentum eksekusi otomatis untuk melanjutkan sesi tanpa konfirmasi persetujuan teks dari user.
2. **Orkestrasi Sekuensial & Verifikasi Dokumen**: Wajib memanggil sub-skill sesuai urutan resmi langkah 1 sampai 11. Dilarang melangkahi gerbang persetujuan user atau menggabungkan eksekusi dua fase kritis sekaligus.

### 3.2 Planner: `planner/AGENTS.md`
1. **Larangan Desain Dangkal (No Shallow MVPs)**: Setiap PRD halaman khusus (`/game`, `/teknologi`, `/komunitas`, `/karir`, dll.) wajib ditulis dengan kedalaman maksimal (tabel spesifikasi platform, diagram arsitektur komputasi, spesifikasi integrasi YouTube touch-safe). Dilarang meringkas halaman menjadi paragraf pendek.
2. **Kepatuhan Pilar AAA Tier-1**: Dokumen `PLAN-GLOBAL.md` wajib mematuhikan 4 parameter mutlak: Sticky Top Navbar (`z-50` minimum), Trilogi Dynamic Motion (Lenis, Anime.js, Framer Motion), Touch-Safe Mobile Video wrapper, serta Pemetaan Aset Aktual (*Active Visual Sourcing*).

### 3.3 Generator: `generator/AGENTS.md`
1. **Strict Slug Enforcement**: Nama rute folder Next.js App Router, slug URL, dan relasi berkas pengujian wajib 100% kongruen dengan tabel di `PAGES-LIST.md`. Dilarang menerjemahkan atau memodifikasi slug secara sepihak.
2. **Anti-Placeholder Enforcer & Active Visual Sourcing**: Dilarang keras memakai tautan gambar fiktif/rusak (`placeholder.com` atau kotak abu-abu kosong). Wajib menggunakan URL karya seni aktual bersolusi tinggi dari `ASSET-MAPPING.md`. *Apabila diperlukan aset tambahan saat proses pembangunan, generator wajib aktif melakukan pencarian internet (web search) untuk mendapatkan gambar asli dan memverifikasi bahwa URL gambar tersebut dapat diakses (valid) sebelum disematkan*.
3. **Kewajiban Atribut SEO Foto Ganda**: Setiap elemen foto (`<img />` atau `next/image`) wajib menyertakan pasangan atribut `alt="..."` (deskripsi tunanetra & SEO) dan `title="..."` (tooltip relevansi keyword industri).
4. **Trilogi Animasi AAA Interaktif**: Wajib memasang pembungkus *Lenis smooth scrolling* pada Root Layout. Animasi mikro dan latar kosmik wajib menggunakan Anime.js. Transisi elemen dan scroll-reveal dilayani oleh Framer Motion dengan penulisan tipe ketat (`as const` pada spesifikasi `transition.ease` guna menembus pemeriksaan statik TypeScript).
5. **Touch-Safe Video Controller**: Pemutar media wajib terbungkus di dalam area target interaksi sentuh seluler (>44x44px). Dilarang memaksakan penguncian *fullscreen* otomatis (*force-lock*) ataupun *autoplay* suara yang mendadak.

### 3.4 QA Reviewer: `qa-reviewer/AGENTS.md`
1. **Zero Tolerance Inspection**: QA Reviewer bertugas menolak (*fail*) pengajuan kode halaman apabila ditemukan: pelanggaran *Strict Slug*, penggunaan foto fiktif/placeholder rusak, atau alpanya pasangan atribut SEO `alt`/`title`.
2. **Sanity QA & Otentikasi AAA**: Wajib menguji keandalan fungsionalitas Top Navbar berposisi `sticky top-0`, kenyamanan pengguliran *Lenis*, serta keamanan kontrol interaktif pada pemutar video seluler.
3. **Penamaan Berkas Playwright Ketat**: Seluruh berkas pengujian end-to-end wajib dinamai secara akurat sesuai tata aturan `tests/<slug_tepat>.spec.ts`.

### 3.5 Supporting Sub-skills Rules (`intake/`, `research/`, `seo/`, `deploy/`, `debug/`)
- **intake & research**: Aturan wajib verifikasi fakta berlandaskan dokumen PDF dan hasil pencarian web terkini. Dilarang melakukan halusinasi data kompetitor. Jika video di dokumen intake tidak tersedia, wajib secara eksplisit mencatat status `[No-Video Default]`.
- **seo (`seo/AGENTS.md`)**: Audit ketat untuk memastikan 100% tag foto bebas error SEO (memiliki pasangan `alt`/`title`) dan menyingkirkan seluruh tautan media yang rusak/fiktif.
- **deploy & debug**: Aturan verifikasi bahwa build lokal `npm run build` dan pemeriksaan tipe `npx tsc --noEmit` wajib lulus tanpa cacat sebelum mengeksekusi pengiriman menuju production environment cloud (Vercel).

## 4. Wiring & Enforcement Mechanism
Untuk memastikan sub-agent yang dipanggil benar-benar membaca dan terikat secara mutlak oleh file `AGENTS.md` di folder perannya:

### 4.1 Self-Binding Clause di Setiap `SKILL.md`
Pada setiap awal file `SKILL.md` (baik di root master `sitegen` maupun seluruh sub-skill), ditanamkan blok peringatan konstitusional wajib di bawah judul utama:
```markdown
> [!CAUTION]
> **MANDATORY CONSTITUTIONAL BINDING**: Sebelum menjalankan alur kerja di bawah, Anda WAJIB MEMBACA DAN MEMATUHI file konstitusi `AGENTS.md` yang berada se-folder dengan skill ini (`AGENTS.md` lokal pada direktori skill bersangkutan). Pelanggaran terhadap pasal di file tersebut akan dicatat sebagai *Critical Architecture Failure*.
```

### 4.2 Instruksi Pemanggilan dari Master Orchestrator
Dalam file master `SKILL.md`, setiap pemantulan tugas atau pemanggilan ke sub-skill (atau pemantulan AI thread/subagent) disertakan rujukan teks wajib baca hukum lokal:
- Contoh: *"Panggil subagent `generator` untuk membangun halaman X berdasarkan `PRD.md`. Instruksikan bahwa agen tersebut WAJIB menerapkan seluruh pasal larangan dan kewajiban pada file `generator/AGENTS.md` (termasuk verifikasi aksesibilitas tautan gambar hasil pencarian internet)."*

### 4.3 Jembatan Hukum di Konstitusi Root Proyek
Pada file global `AGENTS.md` di tingkat atas workspace (di luar repositori skill ini jika berlaku), ditambahkan satu klausul penaklukan domain:
- **Kepatuhan Modular Sub-Skill**: *"Apabila agen atau subagent dijalankan dalam lingkup penugasan sebuah skill dari repositori `sitegen`, file `AGENTS.md` yang menetap di folder skill atau sub-skill tersebut berlaku sebagai Konstitusi Domain Mutlak yang wajib dilunasi."*

## 5. Verification & Self-Review Check
- **Placeholder Check**: Seluruh instruksi dan target file teridentifikasi secara jelas, spesifik pada path `D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen\`, tanpa nilai fiktif atau TODO gantung.
- **Konsistensi Arsitektur**: Tidak ada kontradiksi. File `AGENTS.md` ada di folder master skill dan juga di folder setiap sub-skill persis seperti permintaan user.
- **Scope Check**: Desain terfokus 100% pada integrasi aturan modular (AGENTS.md) di dalam struktur repositori skill `sitegen`.
