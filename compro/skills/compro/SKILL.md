# Compro Orchestrator (Main Skill)

> **Skill untuk:** Menjalankan pipeline Layer 3 — Company Profile v2.8.0 secara end-to-end dari dokumen bisnis hingga presentasi web live di Vercel dengan tema default Aperture Cinematic Minimalist, 6 core layout archetypes, standalone zero-dependency presentation engine (HTML5/CSS3/JS), hybrid Unsplash direct CDN asset pipeline, dan Git Worktree workspace sync guarantee.

## Slug Resolution Protocol

Slug adalah identifier unik per proyek company profile. Ditentukan sekali di Gate 0 dan dipakai konsisten di seluruh pipeline.

### Cara menentukan slug:
1. Ambil nama perusahaan dari heading H1 di `business-knowledge-base.md`
2. Terapkan transformasi:
   - Lowercase semua karakter
   - Ganti spasi dan karakter non-alfanumerik dengan dash (`-`)
   - Hapus dash berturut-turut (`--` → `-`)
   - Trim dash di awal dan akhir
   - Potong maksimal 30 karakter
3. Contoh: "Venturo Pro AI Content Generator" → `venturo-pro-ai-content-genera` (lebih baik dipendekkan menjadi `venturo-pro`)

### Konfirmasi slug:
- Tanyakan user: "Slug proyek: `venturo-pro`. Folder output: `compros/venturo-pro/`. OK?"
- User boleh mengubah slug sebelum pipeline dimulai
- Setelah dikonfirmasi, slug TIDAK BOLEH berubah antar phase

### Penggunaan slug:
- `compros/<slug>/index.html`
- `compros/<slug>/compro.md`
- `compros/<slug>/assets/`
- `compros/<slug>/drafts/`
- `compros/<slug>/reports/`
- `compros/<slug>/input/` (symlink atau copy dari root `input/`)

## Pipeline Resumability

Setelah Gate 0 (setelah slug proyek ditentukan dan dikonfirmasi), sebelum memulai Phase 1, periksa apakah ada artefak dari run sebelumnya untuk slug tersebut di `compros/<slug>/`:

### Auto-detect resume point:
| Artefak yang ditemukan | Resume point | Prompt ke user |
|------------------------|--------------|----------------|
| `compros/<slug>/index.html` ada | Phase 4 (SEO Audit) | "Ditemukan slide deck dari run sebelumnya. Mau langsung audit SEO, atau rebuild dari awal?" |
| `compros/<slug>/drafts/02-final.md` ada | Phase 3 (Build) | "Ditemukan draf final. Mau langsung build slide, atau mulai ulang dari drafting?" |
| `compros/<slug>/drafts/01-draft.md` ada | Phase 2 (Review) | "Ditemukan draf awal. Mau lanjut ke review, atau tulis ulang dari awal?" |
| `compros/<slug>/reports/selling-points-research.md` ada | Phase 1 (Drafting — skip research) | "Ditemukan research selling points. Mau langsung lanjut ke drafting, atau riset ulang dari awal?" |
| `compros/<slug>/reports/review-report.md` ada + status REVISION_REQUIRED | Phase 1 (Re-draft) | "Ditemukan review yang meminta revisi. Mau lanjut revisi, atau mulai baru?" |
| Tidak ada artefak | Phase 1 (dari awal) | Lanjut ke Phase 1 seperti biasa |

### Constraint:
- Resume HANYA ditawarkan, BUKAN dipaksakan — user selalu boleh pilih "mulai baru"
- Jika user pilih resume, pastikan input docs masih sama (bandingkan checksum/ukuran)
- Jika input docs berubah sejak run sebelumnya, WAJIB mulai dari Phase 1

## State Machine Pipeline (`writer` ➔ `reviewer` ➔ `builder` ➔ `publisher`)

0. **Gate -1 — User Intent & Input Confirmation** [HARD GATE: Dilarang membaca/mencari file sebelum user konfirmasi]:
   - SEBELUM membaca, mencari, atau mengakses file apapun, tanyakan:
     > "Saya akan membuat Company Profile slide deck. Untuk memulai, saya membutuhkan 3 dokumen input:
     > 1. `business-knowledge-base.md` — data faktual bisnis
     > 2. `business-audit-report.md` — analisis pasar & kompetitor
     > 3. `brand-story-guide.md` — panduan brand & tone of voice
     >
     > Apakah kamu sudah menyiapkan dokumen ini? Jika ya, di mana lokasinya? Jika belum, aku bisa membantu membuatnya dari brief."
   - **HARD GATE:** DILARANG membaca file apapun sebelum user menjawab.
   - Jika user menunjuk file yang ada, tampilkan nama + ukuran file dan konfirmasi: "Apakah ini dokumen yang benar untuk sesi ini?"
   - Baru setelah user mengonfirmasi, salin/link file ke `input/` dan lanjut ke Gate 0.
   - **Constraint:** Gate -1 WAJIB dijalankan setiap kali plugin dipanggil, tanpa exception. Tidak boleh ada shortcut "auto-detect" yang bypass gate ini.

1. **Gate 0 — Intake Check & Slug Resolution** [Cek keberadaan dokumen input & tetapkan serta konfirmasi slug proyek]:
   - Periksa keberadaan:
     - `input/business-knowledge-base.md`
     - `input/business-audit-report.md`
     - `input/brand-story-guide.md`
   - Jika ada file yang belum tersedia, hentikan proses dan minta pengguna menyediakan dokumen yang kurang.
   - Jalankan **Slug Resolution Protocol**: tentukan `<slug>` dari nama perusahaan di `business-knowledge-base.md`, konfirmasikan ke pengguna, dan siapkan folder kerja `compros/<slug>/`.
   - (Resumability Check: jika ada artefak sebelumnya untuk slug ini, tawarkan resume sebelum Phase 1)

2. **Phase 1 — Selling Point Research & Drafting** (`/writer`):
   - **Phase 0.5 — Competitive Research:**
     - Writer membaca `input/business-knowledge-base.md`, melakukan research produk serupa di internet (`search_web` + `read_url_content`), dan menyusun perbandingan internal.
     - *(Graceful Fallback)*: Jika konektivitas internet tidak tersedia (lingkungan offline), web search mengalami error/kegagalan, atau menghasilkan 0 kompetitor relevan, Phase 0.5 secara otomatis beralih (smooth fallback) ke sintesis dokumen internal (`business-knowledge-base.md` & `business-audit-report.md`) tanpa menghentikan atau me-stall pipeline.
     - Menghasilkan: `compros/<slug>/reports/selling-points-research.md`
     - **User Review Gate (BLOCKING):** Menunggu user approve selling points sebelum lanjut drafting.
   - **Phase 1 — Drafting:**
     - Panggil skill `/writer` dengan selling points sebagai input tambahan.
     - Menghasilkan: `compros/<slug>/drafts/01-draft.md`.

3. **Phase 2 — Content QA Loop:**
   - Panggil skill `/reviewer`.
   - Jika reviewer mengeluarkan status `REVISION_REQUIRED`:
     - Panggil kembali `/writer` dengan melampirkan `compros/<slug>/reports/review-report.md` (legacy: `artifacts/review-report.md`).
     - Ulangi maksimal 3 kali iterasi.
   - Setelah status **`APPROVED`**:
     - Draf final tersimpan di `compros/<slug>/drafts/02-final.md` (legacy: `artifacts/02-company-profile-final.md`).

4. **Phase 3 — Slide Deck Assembly:**
   - Panggil skill `/builder`.
   - Mengonversi `compros/<slug>/drafts/02-final.md` menjadi:
     - `<project>/compros/<slug>/index.html` (Single-file presentation HTML 1920×1080 16:9 dengan zero-dependency vanilla engine, CSS ter-inline, tema Aperture Cinematic Minimalist).
     - `<project>/compros/<slug>/compro.md`.
     - `<project>/compros/<slug>/assets/` (Foto resolusi tinggi via `image-fetcher.js`: Openverse web search ➔ kurasi Unsplash direct CDN ➔ Lorem Picsum ➔ SVG vektor lokal. Slot default per arketipe: cover→hero, problem→problem, product→macro, features→hands, usp→viewfinder, pricing→lens, closing→closing; directive gambar di draf selalu menang).
     - `<project>/compros/<slug>/reports/build.log`.
     - Mengonsolidasikan semua file kerja ke folder proyek `compros/<slug>/` (`index.html`, `compro.md`, `assets/`, `reports/`, `drafts/`).
   - **Workspace Sync Guarantee:** Eksekusi di Git worktree manapun secara otomatis memicu `postBuildSyncGuarantee()` yang menjamin seluruh bundel `compros/<slug>/` tersalin utuh ke root workspace utama pengguna.
   - **Content Sanitization:** Otomatis membersihkan frontmatter & meta tags, mengekstrak metrik data untuk spec matrix/stat counter, dan menangani placeholder kontak reviewer: `[Nomor WhatsApp]`, `[Email Resmi]`, `[Alamat Kantor]`, dsb. dirender sebagai penanda eksplisit `Belum tersedia` — tidak pernah tampil mentah dan **tidak pernah diganti dengan nomor/email/alamat karangan** (Zero Hallucination). Daftarnya dicatat di `reports/build.log`.

5. **Phase 3b — Visual Self-Check:**
   - Buka `compros/<slug>/index.html` di browser.
   - Navigasi setiap slide dan verifikasi kepatuhan 7 layout archetype Aperture Cinematic Minimalist:
     1. Cover: Full-bleed cinematic hero, foto arsitektur/produk gelap dengan gradient overlay, brand title, status dot "● Now shipping", vermilion kicker, giant headline, dan glass strip statistik kunci (2–3 angka).
     2. Problem: 12-col asymmetric split (4-col image kiri + 8-col teks kanan), giant ghost watermark "NO", 3-item numbered list dengan angka vermilion dan hover highlight.
     3. Product: 50/50 split dengan foto macro + floating glass badge di kiri, headline + 2x2 spec matrix stat block dengan angka kontras tinggi di kanan.
     4. Features: 3-col rail image vertikal dengan caption rotasi 90° di kiri, 9-col container dengan 4 baris fitur bernomor raksasa 01-04 (berubah vermilion saat hover) di kanan.
     5. USP: Dark viewfinder background dengan 3 kartu frosted glass trio (backdrop blur, border hairline putih), masing-masing dengan kicker, counter 01-03, giant stat, dan penjelasan.
     6. Pricing: 3-col vertical image rail dengan watermark "Siap mulai." di kiri, 9-col container dengan 3 tier pricing di kanan (featured tier inverted black background dengan CTA vermilion).
     7. Closing: 3-col rail image dengan caption rotasi "Langkah berikutnya" di kiri, 9-col container dengan headline, daftar komitmen/benefit, matriks kontak 2 kolom (ikon + label mono + nilai), dan CTA vermilion di kanan. Pastikan tidak ada kurung siku mentah `[...]` yang terlihat pada nilai kontak.
   - Pastikan seluruh foto di `compros/<slug>/assets/` berukuran valid (> 10 KB).
   - Verifikasi keberadaan file di root workspace pengguna (`compros/<slug>/index.html` dan `assets/`).
   - Verifikasi interaktivitas chrome: hairline progress bar (0-100%), dot navigation aktif memancarkan vermilion, tombol panah dan keyboard shortcuts berfungsi lancar tanpa error konsol.
   - Jika ditemukan masalah:
     - Untuk broken image/SVG → inline ulang SVG atau periksa slot asset
     - Untuk overflow teks / clipping → sesuaikan proporsi kartu atau split slide
     - Untuk layout salah → re-render section yang bermasalah
   - Catat hasil verifikasi di `<project>/compros/<slug>/reports/build.log` dengan format:
     ```
     [VISUAL CHECK] Slide 1 (Cover): OK
     [VISUAL CHECK] Slide 2 (Problem): OK
     [VISUAL CHECK] Slide 3 (Product): OK
     [VISUAL CHECK] Slide 4 (Features): OK
     [VISUAL CHECK] Slide 5 (USP): OK
     [VISUAL CHECK] Slide 6 (Pricing): OK
     ```
   - Phase 3b bersifat **blocking**: tidak boleh lanjut ke Phase 4 jika ada slide yang masih bermasalah.

6. **Phase 4 — Pre-flight SEO Audit & Auto-Fix:**
   - Panggil skill `/publisher` mode audit.
   - Memindai `compros/<slug>/index.html` dan otomatis menambal Title, Meta Description, Open Graph, dan JSON-LD Schema jika belum lengkap.
   - Menyimpan laporan ke `compros/<slug>/reports/seo-report.md` (legacy: `qa/seo-report.md`).

7. **Gate 5 — User Confirmation Gate:**
   - Tampilkan ringkasan kesiapan slide ke pengguna:
     - Lokasi file HTML lokal (`<project>/compros/<slug>/index.html`).
     - Ringkasan optimasi SEO yang sudah diterapkan (`<project>/compros/<slug>/reports/seo-report.md`).
   - Tanyakan kepada pengguna:
     > *"Company Profile slide deck telah selesai dirakit dan dioptimasi SEO. Anda dapat membuka `<project>/compros/<slug>/index.html` untuk melihat tampilannya. Apakah Anda ingin langsung men-deploy slide ini ke Vercel sekarang?"*
   - Tunggu respon pengguna:
     - Jika pengguna setuju ("Ya", "Deploy", "Lanjut") ➔ lanjut ke Phase 6.
     - Jika pengguna ingin meninjau dulu ➔ hentikan sementara proses dengan rapi.

8. **Phase 6 — Deployment ke Vercel:**
   - Panggil skill `/publisher` mode deploy.
   - Jalankan `node skills/publisher/scripts/deploy.js <deploy-dir>`.
   - Lakukan verifikasi live URL via HTTP GET 200.
   - Simpan catatan status ke `<project>/compros/<slug>/reports/deployment-status.md`.
   - Kembalikan URL live Vercel dan status rilis kepada pengguna.

---

## Template Tunggal `modern` & Workspace Sync Guarantee

1. **Template tunggal `modern` (Aperture Cinematic Minimalist):**
   - Builder hanya memiliki satu template (`skills/builder/templates/modern/`): tidak ada pemilihan tema di flow mana pun.
   - Palet warna resmi Aperture Cinematic Minimalist:
     - Kanvas: `--background` (`#ffffff`)
     - Teks/Surface gelap: `--foreground` (`#0a0a0a`)
     - Teks sekunder: `--muted-foreground` (`#6b6b6b`)
     - Aksen brand: `--accent` (`var(--brand-primary, #ff3b1d)`)
     - Border: `--border` (`#e4e4e4`)
     - Ghost letter: `--ghost` (`#f1f1f1`)
     - Hover background: `--hover-bg` (`#fafafa`)
   - Tipografi resmi: `Archivo` (display/headline), `Inter` (body), `JetBrains Mono` (kickers/mono).
   - Resolusi fixed 1920×1080 (16:9). Standalone zero-dependency HTML5/CSS3/Vanilla JS presentation shell (tanpa dependensi CDN Reveal.js).

2. **7 Layout Archetypes Aperture Cinematic:**
   - `cover`: Full-Bleed Cinematic Hero dengan background foto gelap, gradient fade, live status indicator (`● Now shipping`), vermilion kicker, dan headline raksasa.
   - `problem`: 12-Col Asymmetric Split (4-col foto kiri + 8-col konten kanan), giant ghost text watermark ("NO"), dan 3-item numbered list dengan nomor vermilion dan highlight hover.
   - `product`: 50/50 Macro & Spec Matrix (50% foto makro produk kiri dengan floating glass badge + 50% kanan berisi headline, deskripsi, dan 2x2 high-contrast stat counter).
   - `features`: Rail Image + Giant Numbered List (3-col rail image vertikal kiri dengan caption rotasi 90° + 9-col kanan dengan 4 baris fitur bernomor raksasa `01`–`04` yang reaktif hover).
   - `usp`: Frosted Glass Trio di atas dark viewfinder canvas dengan 3 kartu semi-transparan (`backdrop-filter: blur(12px)`), hairline white border, kicker, counter, giant stat, dan teks penjelasan.
   - `pricing`: Vertical Image Rail + Tier Matrix (3-col rail foto vertikal kiri dengan tag watermark "Siap mulai." + 9-col kanan dengan 3 tier harga; featured tier inverted black background dengan tombol CTA vermilion).
   - `closing`: Rail Image + Contact Matrix (3-col rail foto vertikal kiri dengan caption rotasi "Langkah berikutnya" + 9-col kanan berisi headline, `.closing-notes` untuk komitmen/benefit, `.closing-contacts` grid 2 kolom ikon + label + nilai, dan `.closing-cta` vermilion).

3. **Hybrid Asset Downloader Pipeline (`image-fetcher.js`):**
   - Mendeteksi slot gambar `<!-- image: <slot> -- ... -->`. Slot default per arketipe: `hero` (cover), `problem` (problem), `macro` (product), `hands` (features), `viewfinder` (usp), `lens` (pricing), `closing` (closing). Directive gambar pada draf selalu menang atas slot default ini.
   - Resolusi gambar berjenjang: Openverse web image search (keyless, mati dengan `COMPRO_OFFLINE=1`) ➔ kurasi Unsplash direct CDN (`images.unsplash.com`) ➔ Lorem Picsum ➔ SVG vektor lokal (`templates/assets/fallback/`).
   - Budget tunggal per build (default 25 s) dibagi seluruh slot secara paralel; `reports/build.log` mencatat jumlah tier yang dipakai.

4. **Git Worktree & Dynamic Workspace Sync Guarantee:**
   - Skrip mendeteksi root repositori secara dinamis via `--root`, `COMPRO_PROJECT_ROOT`, atau inspeksi file pointer `.git` worktree.
   - `postBuildSyncGuarantee` otomatis menyalin seluruh bundel proyek ke root workspace pengguna (`compros/<slug>/`) sehingga file tidak hilang ketika worktree ditutup.

5. **Plugin & Cache Synchronization:**
   - Sinkronisasi kode builder dan template ke `.claude/marketplace/compro/` dan global cache `~/.claude/plugins/cache/aorysan-marketplace/compro/2.8.0/`.
