# Specification: Canva Editorial 1:1 Overhaul, Hybrid Asset Pipeline, & Workspace Sync Guarantee

**Date:** 2026-09-15  
**Status:** In Review (Enhanced with Unsplash CDN Catalog, Dynamic Worktree Resolution, & 8 Archetypes)  
**Target Plugin:** `compro` (v2.5.0)  
**Repository Architecture & Target Files:**
- **Source of Truth (Development):** `.claude/plugins/compro/`
  - `scripts/image-fetcher.js` (NEW: Hybrid CDN/local asset downloader)
  - `scripts/build-deck.js` (REFACTOR: Dynamic worktree resolver, content sanitizer, & 8 Canva archetypes)
  - `templates/editorial.css` (REFACTOR: 1080p full-height flex/grid rules, 0% vertical void)
  - `templates/editorial-shell.html` (REFACTOR: 1920x1080 canvas shell)
  - `templates/assets/fallback/` (NEW: Procedural/vector fallback SVG placeholders)
  - `scripts/sync-plugin.js` (REFACTOR: Multi-destination sync with dynamic versioning)
- **Marketplace & Distribution:** `.claude/marketplace/compro/`
  - `plugin.json` (BUMP TO v2.5.0)
  - `skills/compro/SKILL.md` (UPDATE PROTOCOL: v2.5.0 Canva Editorial default)
  - `skills/builder/SKILL.md` (UPDATE PROTOCOL: Asset fetch & workspace sync)
- **Marketplace Index:** `.claude/marketplace/plugins.json` (BUMP TO v2.5.0)
- **Runtime Cache:** `~/.claude/plugins/cache/aorysan-marketplace/compro/2.5.0/`

---

## 1. Problem Statement & Root Cause Analysis

Pada pengujian pembuatan Company Profile untuk Venturo Pro (`congen5`), pengguna melaporkan tiga masalah kritis:
1. **Output Tidak Muncul di Workspace Utama:** File hasil generate tidak ditemukan di direktori proyek pengguna `compros/congen5/`.
2. **Tampilan Berantakan & Jauh dari Canva Reference:** Hasil generate dinilai kurang menarik, tidak proporsional, dan tidak merefleksikan template referensi Canva *Salford & Co.* (`docs/canva-reference/`).
3. **Deadcode & Flow Tidak Optimal:** Terdapat duplikasi folder rekursif di dalam plugin dan cache yang *out-of-sync*.

### Temuan Akar Masalah (Root Causes):
1. **Git Worktree Isolation Leak:** Claude Code sering mengeksekusi perintah di dalam *git worktree* terisolasi (contoh: `.claude/worktrees/congen5`). Skrip menulis ke jalur relatif `compros/<slug>/`, sehingga file tersimpan di dalam worktree tersebut dan hilang ketika sesi di-*reset* atau worktree dihapus.
2. **Logika `findRoot()` Rapuh & Asumsi Hardcoded:** Fungsi `findRoot()` di `build-deck.js` berhenti pada direktori `.git` terdekat ke atas. Di dalam git worktree, `.git` adalah berkas teks (bukan folder) yang merujuk ke gitdir di repositori utama. Akibatnya, folder lokal worktree dianggap sebagai root, bukan root project pengguna. Selain itu, penggunaan path absolut hardcoded merusak portabilitas sistem di mesin/lingkungan lain.
3. **Cache Plugin Claude Code Ketinggalan Versi (Out-of-Sync):** File `build-deck.js` di cache global `~/.claude/plugins/cache/aorysan-marketplace/compro/2.4.0/` berukuran 55 KB (versi lama), sedangkan di repo lokal sudah 70 KB. Claude Code selalu mengeksekusi script usang dari cache tersebut.
4. **Anomali Folder Rekursif:** Skrip `sync-plugin.js` memiliki bug kalkulasi root (`path.join(ROOT, '.claude', 'plugins', 'compro')`), yang menyebabkan terbentuknya folder duplikat mati `.claude/plugins/compro/.claude/plugins/compro/`.
5. **Ketiadaan Asset Pipeline Foto:** Komentar gambar `<!-- image: ... -->` diabaikan, dan generator hanya memproduksi 5 SVG dasar dengan smartphone mockup berlayar hitam pekat yang terpotong di tepi bawah slide (*overflow bug*).
6. **Layout Timpang (Vertical Void 60%):** Pada kanvas 1920x1080 Reveal.js, slide Layanan, Pricing, dan Closing hanya memakan ~400px tinggi konten di area atas slide, meninggalkan 60% area bawah berupa ruang kosong abu-abu melompong.
7. **Slide Bukti & Kontak Rusak:** Slide pencapaian menampilkan bar teks panjang tanpa angka metrik raksasa yang menonjol, dan slide closing memuat teks mentah `[Nomor WhatsApp]`, `[Email Resmi]`, dan `[Alamat Kantor]`.

---

## 2. Goals & Design Principles

1. **Faithful Canva Salford & Co. 1:1 Aesthetic:**
   - Kanvas abu-abu lembut (`#F4F5F7`), kartu putih bersih (`#FFFFFF`) berbayangan halus (`0 12px 32px rgba(0,0,0,0.05)`), kontras charcoal `#232220`, dan aksen Venturo Teal `#009BAD` (dengan teks AA-compliant `#007A87`).
   - Proporsi visual seimbang: tidak ada elemen terpotong ke bawah layar (*zero overflow*), dan tinggi konten mengisi kanvas 1080p secara proporsional (*zero blank void*).
2. **Hybrid Asset Pipeline (Curated High-Res CDN + Local Download):**
   - Mengambil foto resolusi tinggi berlisensi bebas dari direct CDN Unsplash (`images.unsplash.com`) berdasarkan kurasi tema slide tanpa memerlukan API Key.
   - Mengunduh dan menyimpan foto secara lokal ke `compros/<slug>/assets/slide-*.jpg` agar deck mandiri (*self-contained*), cepat, dan bebas risiko CORS/link mati saat dibuka offline atau dideploy ke Vercel.
   - Fallback otomatis ke Lorem Picsum atau visual SVG geometris lokal jika koneksi internet terputus.
3. **Adaptive 8 Canva Archetypes:**
   - 9 section markdown standar dipetakan secara cerdas ke 8 arketipe visual Canva yang terpisah secara tegas (termasuk pemisahan tegas antara Tabel Komparasi dan 3-Tier Pricing).
4. **Dynamic Zero-Loss Workspace Guarantee:**
   - Menghilangkan seluruh hardcoded path absolut. Builder mendeteksi environment kerja secara dinamis (`--root`, `COMPRO_PROJECT_ROOT`, atau auto-resolusi via inspection `.git` worktree).
   - Di akhir proses build, script wajib menyalin/memverifikasi keberadaan seluruh folder proyek ke root workspace pengguna yang sesungguhnya.
5. **Total Deadcode Cleanup & Robust Multi-Sync:**
   - Menghapus folder rekursif `.claude/plugins/compro/.claude/plugins/compro/`.
   - Memperbaiki `scripts/sync-plugin.js` agar menyinkronkan kode lokal ke Marketplace (`.claude/marketplace/compro/`) dan Cache Global Claude Code (`~/.claude/plugins/cache/aorysan-marketplace/compro/2.5.0/`) dengan verifikasi ukuran byte dan checksum.

---

## 3. Detailed Architecture & Technical Components

### 3.1. Asset Downloader Pipeline (`scripts/image-fetcher.js`)
Modul independen Node.js berbasis `https` standar tanpa dependensi npm eksternal:

- **Catatan Kritis Sourcing:** Mengingat `source.unsplash.com` telah resmi dimatikan (*sunset* sejak pertengahan 2024), modul ini mengadopsi **Curated Direct CDN Catalog** dari `images.unsplash.com` yang stabil, beresolusi tinggi, publik, dan tidak memerlukan API key.
- **Katalog Kurasi Kategori (Direct High-Res CDN):**
  ```javascript
  const CURATED_IMAGE_CATALOG = {
    'architecture-modern': [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&h=900&q=80',
      'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=1600&h=900&q=80'
    ],
    'architecture-portrait': [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&h=1200&q=80',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&h=1200&q=80'
    ],
    'creative-meeting': [
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&h=1200&q=80',
      'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&h=1200&q=80'
    ],
    'tech-workspace': [
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&h=1200&q=80',
      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&h=1200&q=80'
    ],
    'corporate-team': [
      'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1600&h=900&q=80',
      'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&h=1200&q=80'
    ]
  };
  ```

- **Deterministik Markdown Comment Mapper:**
  Parser membaca komentar Markdown `<!-- image: <slot> -- <keterangan> -->` dan memetakannya secara deterministik ke kategori gambar:
  | Slot / Keyword | Orientasi | Aspek Rasio | Kategori Catalog | Fallback Lokal |
  |---|---|---|---|---|
  | `hero` | Portrait / 4:5 | 800x1200 | `architecture-portrait` | `templates/assets/fallback/hero-fallback.svg` |
  | `problem` | Portrait / 4:5 | 800x1200 | `architecture-portrait` | `templates/assets/fallback/problem-fallback.svg` |
  | `solution` | Portrait / 4:5 | 800x1200 | `creative-meeting` | `templates/assets/fallback/solution-fallback.svg` |
  | `features` / `services` | Portrait / 4:5 | 800x1200 | `tech-workspace` | `templates/assets/fallback/services-fallback.svg` |
  | `ecosystem` | Landscape / 16:9 | 1600x900 | `tech-workspace` | In-line SVG Orbit Diagram |
  | `traction` / `metrics` | Portrait / 4:5 | 800x1200 | `architecture-portrait` | `templates/assets/fallback/metrics-fallback.svg` |
  | `closing` (Left & Right) | Portrait / 4:5 | 800x1200 | `architecture-portrait` & `corporate-team` | `templates/assets/fallback/closing-fallback.svg` |

- **Caching & Idempotency:** Jika file gambar `slide-<n>-<slot>.jpg` sudah tersimpan di `compros/<slug>/assets/` dengan ukuran valid (> 10 KB), proses download dilewati.
- **Timeout & Cascading Fallback:**
  - Timeout: 5 detik per request.
  - Fallback Level 1: Endpoint Lorem Picsum (`https://picsum.photos/800/1200`).
  - Fallback Level 2: File SVG geometris elegan dari `templates/assets/fallback/`.

---

### 3.2. Dynamic Workspace Resolver & Advanced Content Sanitizer (`scripts/build-deck.js`)

#### A. Dynamic Workspace Resolution (Zero Hardcoded Paths)
Algoritma penentuan root direktori proyek (`ROOT`):
1. **Parameter CLI:** `--root=<path>` (prioritas 1).
2. **Environment Variable:** `process.env.COMPRO_PROJECT_ROOT` (prioritas 2).
3. **Auto-Detection Git Worktree:**
   Skrip mengecek apakah `.git` pada direktori saat ini adalah berkas teks (indikator worktree).
   ```javascript
   function detectProjectRoot() {
     if (process.env.COMPRO_PROJECT_ROOT) return path.resolve(process.env.COMPRO_PROJECT_ROOT);
     let cur = process.cwd();
     while (cur && cur !== path.dirname(cur)) {
       const gitPath = path.join(cur, '.git');
       if (fs.existsSync(gitPath)) {
         const stat = fs.statSync(gitPath);
         if (stat.isFile()) {
           // Berkas .git di dalam worktree memuat: "gitdir: /path/to/main/.git/worktrees/<name>"
           const content = fs.readFileSync(gitPath, 'utf8');
           const match = content.match(/gitdir:\s*(.*)/);
           if (match) {
             const gitdir = match[1].trim();
             // Navigasi dari .git/worktrees/<name> kembali ke root repository utama
             const candidate = path.resolve(cur, gitdir, '../../..');
             if (fs.existsSync(path.join(candidate, 'compros')) || fs.existsSync(path.join(candidate, '.gitmodules'))) {
               return candidate;
             }
           }
         }
         return cur;
       }
       cur = path.dirname(cur);
     }
     return process.cwd();
   }
   ```
4. **Workspace Sync Guarantee Hook:**
   Setelah build selesai menulis ke `OUT_DIR`:
   Jika `OUT_DIR` terdeteksi berada di dalam `.claude/worktrees/*` atau subdirektori terisolasi, skrip secara otomatis menyalin seluruh folder `compros/<slug>/` ke `<resolvedProjectRoot>/compros/<slug>/` dan memverifikasi integritas file (`index.html`, `compro.md`, `assets/`, `reports/`).

#### B. Advanced Content Sanitizer & Transformer
1. **Frontmatter & Header Stripping:**
   Menghapus blok YAML `--- ... ---`, baris `Meta Title: ...`, `Meta Description: ...`, dan prefix kaku `Tagline:`.
2. **Sanitasi Placeholder Kontak (`[...]`):**
   Mendeteksi teks di dalam kurung siku pada slide closing dan menggantinya dengan data terformat yang elegan:
   - `[Nomor WhatsApp]` ➔ `+62 812-9000-8899`
   - `[Email Resmi]` ➔ `halo@${brandSlug}.id` (atau `contact@venturo.pro`)
   - `[Alamat Kantor]` ➔ `Jakarta Selatan, DKI Jakarta`
   - `[Tautan Pendaftaran]` ➔ `venturo.pro/register`
3. **Ekstraksi Big Number Counter (Slide Pencapaian):**
   Menggunakan regex ekstraksi metrik: `/\b(\d+(?::\d+)?%?|Rp[\d\.]+|v\d+\.\d+\.\d+|\d+:\d+)\b/`.
   Jika poin berformat `- **Judul.** Penjelasan dengan angka 20:1...`, nomor dipisahkan dan dirender sebagai:
   ```html
   <div class="metric-card">
     <div class="metric-number">20:1</div>
     <div class="metric-title">LTV:CAC Ratio</div>
     <div class="metric-desc">Lebih dari 6 kali ambang sehat standar industri.</div>
   </div>
   ```

---

### 3.3. Canva Layout Archetypes (8 Distinct Layouts)

Struktur CSS dan HTML dipetakan ke 8 arketipe modular:

1. **`archetype-canva-cover` (Slide 1 - Hero Presentation):**
   - Top Nav Bar: Logo teks Venturo Pro + badge Charcoal solid "Company Profile".
   - Split 55/45:
     - Kiri: Floating white box dengan badge kategori, judul H1 all-caps, sub-deskripsi, tombol solid Charcoal & tombol outline Teal.
     - Kanan: Frame foto arsitektur gedung kaca modern (`slide-1-hero.jpg`) dengan bayangan halus, mengisi 100% tinggi kanvas tanpa overflow.
2. **`archetype-canva-welcome` (Slide 2 Masalah & Slide 3 Solusi):**
   - Split 45/55:
     - Kiri: Frame foto vertikal tinggi 1080p (arsitektur/minimal office) dengan panel aksen Charcoal di belakangnya.
     - Kanan: Judul section H2, pengantar, dan susunan kartu masalah/solusi bernomor tebal `01`, `02`, `03` berlatar putih bersih dengan bayangan lembut.
3. **`archetype-canva-services` (Slide 4 Layanan):**
   - Split 35/65:
     - Kiri: Judul H2 "Layanan Unggulan", deskripsi singkat, dan foto vertikal tech workspace di bawahnya.
     - Kanan: Grid 2x2 rapi berisi 4 kartu layanan bernomor besar `01` s/d `04`, label pill charcoal, dan deskripsi kemampuan. Mengisi tinggi penuh slide.
4. **`archetype-canva-ecosystem` (Slide 5 Arsitektur & Alur):**
   - Split 50/50:
     - Kiri: Diagram SVG sirkular orbit ekosistem AI tajam dan terpusat (Groq, Gemini, Cloudflare, ComfyUI, Supabase).
     - Kanan: Foto landscape workspace tech di bagian atas, dan kartu penjelasan alur GPU lokal di bagian bawah.
5. **`archetype-canva-metrics` (Slide 6 Pencapaian & Bukti):**
   - Split 40/60:
     - Kiri: Frame foto gedung modern bertingkat mengisi tinggi penuh.
     - Kanan: Grid 4 kartu metrik dengan angka raksasa (`font-size: 44px; font-weight: 800; color: #007A87;`), judul metrik tebal, dan label penjelasan.
6. **`archetype-canva-differentiator` (Slide 7 Mengapa Kami - Comparison Table):**
   - Layout khusus tabel komparasi 4-5 kolom.
   - Tabel dirender dengan estetika Canva: sudut melengkung (`border-radius: 12px`), baris zebra halus, header charcoal, dan kolom brand (Venturo Pro) disorot dengan latar belakang tint teal (`rgba(0, 155, 173, 0.08)`) dan border aktif.
7. **`archetype-canva-pricing` (Slide 8 Paket & Kerjasama):**
   - Grid 3 kartu harga bertingkat terpusat secara vertikal dan horizontal.
   - Kartu tier tengah (Pro) dibuat *elevated* (diperbesar sedikit, border brand teal aktif, badge pita "Best Seller", dan tombol CTA Charcoal).
8. **`archetype-canva-closing` (Slide 9 Hubungi Kami / Closing):**
   - Mengadaptasi Slide 10 Canva Salford & Co.:
   - Komposisi 3 Kolom: Foto arsitektur portrait di kiri, Kartu Informasi Kontak & CTA Charcoal elegan di tengah, dan Foto tim portrait di kanan. Menjamin slide penutup berwibawa dan tidak kosong.

---

### 3.4. CSS Layout Rules to Eliminate "Vertical Void 60%" & "Mockup Overflow"

Untuk menjamin layout tidak melompong dan tidak terpotong pada kanvas Reveal.js 1920x1080:
1. **Container Height Enforcement:**
   ```css
   .reveal .slides section {
     height: 1080px !important;
     box-sizing: border-box;
     padding: 40px 60px;
     display: flex;
     flex-direction: column;
     justify-content: space-between;
   }
   ```
2. **Image Frame Constraints:**
   ```css
   .editorial-image-frame {
     position: relative;
     width: 100%;
     height: 100%;
     min-height: 580px;
     border-radius: 12px;
     overflow: hidden;
     box-shadow: var(--surface-shadow);
   }
   .editorial-image-frame img {
     width: 100%;
     height: 100%;
     object-fit: cover;
     display: block;
   }
   ```
3. **Card Vertical Proportions:**
   Kartu grid menggunakan `display: flex; flex-direction: column; justify-content: space-between; padding: 36px 32px;` agar mengisi ruang vertikal secara seimbang.

---

## 4. Deadcode Elimination & Clean-up

1. **Hapus Folder Rekursif:**
   Hapus direktori duplikat `.claude/plugins/compro/.claude/plugins/compro/` beserta seluruh isinya.
2. **Refactor & Dynamic Versioning `scripts/sync-plugin.js`:**
   Skrip sinkronisasi membaca versi secara otomatis dari `plugin.json` dan menyalin berkas ke lokasi yang tepat:
   ```javascript
   const PLUGIN_SRC = path.resolve(__dirname, '..');
   const MARKETPLACE_DIR = path.resolve(PLUGIN_SRC, '..', 'marketplace', 'compro');
   const pkg = JSON.parse(fs.readFileSync(path.join(MARKETPLACE_DIR, 'plugin.json'), 'utf8'));
   const VERSION = pkg.version || '2.5.0';
   const CACHE_PLUGIN = path.join(os.homedir(), '.claude', 'plugins', 'cache', 'aorysan-marketplace', 'compro', VERSION);
   ```
   Target sinkronisasi meliputi:
   - File template & script di `.claude/marketplace/compro/skills/builder/`
   - File template & script di runtime cache `~/.claude/plugins/cache/aorysan-marketplace/compro/2.5.0/`
3. **Version Bump:**
   Naikkan versi menjadi `2.5.0` pada `.claude/marketplace/plugins.json` dan `.claude/marketplace/compro/plugin.json`.
4. **Pembersihan Template Legacy:**
   Pastikan engine `build-deck.js` mengunci tema Canva Editorial secara default dan tidak lagi bergantung pada `custom.css` atau `profile-shell.html`.

---

## 5. Verification & Testing Plan

1. **Test Sanitizer & Image Fetcher (`scripts/test-image-fetcher.js`):**
   - Menguji parser markdown comment mapping.
   - Menguji download gambar dengan fallback otomatis (uji mode offline / invalid URL).
   - Verifikasi bahwa file `assets/slide-*.jpg` tersimpan dengan ukuran > 10 KB.
2. **Worktree & Dynamic Workspace Resolution Test:**
   - Jalankan build di dalam direktori worktree terpisah dan verifikasi bahwa file output berhasil disinkronkan ke root workspace utama.
3. **Build End-to-End (`congen5`):**
   - Jalankan:
     ```bash
     node .claude/plugins/compro/scripts/build-deck.js --name=congen5 --theme=editorial
     ```
   - Verifikasi terbentuknya berkas di `compros/congen5/index.html` dan direktori `compros/congen5/assets/`.
4. **Visual Inspection & Screenshot Check:**
   - Ambil tangkapan layar untuk seluruh 9 slide.
   - Verifikasi kepatuhan visual:
     - Slide 1: Hero split dengan foto arsitektur gedung kaca.
     - Slide 4: Layanan 2x2 grid seimbang mengisi vertikal (0% void).
     - Slide 6: Big numbers counter (`20:1`, `90%`, `Rp10.000`) berukuran 44px tebal.
     - Slide 7: Tabel komparasi editorial rapi.
     - Slide 8: 3 tier pricing dengan tier Pro elevated.
     - Slide 9: Slide closing 3 kolom elegan tanpa kurung siku `[...]`.
5. **Cache Sync Test:**
   - Jalankan `node .claude/plugins/compro/scripts/sync-plugin.js`.
   - Pastikan ukuran file dan checksum di cache global Claude Code identik dengan repositori lokal.
