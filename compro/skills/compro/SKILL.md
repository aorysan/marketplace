# Compro Orchestrator (Main Skill)

> **Skill untuk:** Menjalankan pipeline Layer 3 — Company Profile secara end-to-end dari dokumen bisnis hingga presentasi web live di Vercel.

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

2. **Phase 1 — Drafting** (`/writer`):
   - Panggil skill `/writer`.
   - Menghasilkan: `compros/<slug>/drafts/01-draft.md` (legacy: `artifacts/01-company-profile-draft.md`).

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
     - `<project>/compros/<slug>/index.html` (Single-file Reveal.js HTML dengan CSS ter-inline).
     - `<project>/compros/<slug>/compro.md`.
     - `<project>/compros/<slug>/assets/`.
     - `<project>/compros/<slug>/reports/build.log`.
     - Mengonsolidasikan semua file kerja ke folder proyek `compros/<slug>/` (`index.html`, `compro.md`, `assets/`, `reports/`, `drafts/`).

5. **Phase 3b — Visual Self-Check:**
   - Buka `compros/<slug>/index.html` di browser.
   - Navigasi setiap slide dan periksa:
     1. Apakah ada gambar/ikon yang broken (placeholder kosong)?
     2. Apakah teks terpotong atau overflow di luar slide boundary?
     3. Apakah layout sesuai archetype yang dimaksud?
     4. Apakah semua `<img>` me-render dengan benar?
   - Jika ditemukan masalah:
     - Untuk broken SVG → inline ulang SVG ke HTML
     - Untuk overflow teks → potong konten atau split slide
     - Untuk layout salah → re-render section yang bermasalah
   - Catat hasil verifikasi di `<project>/compros/<slug>/reports/build.log` dengan format:
     ```
     [VISUAL CHECK] Slide 1 (Hero): OK
     [VISUAL CHECK] Slide 2 (Problem): OK
     [VISUAL CHECK] Slide 3 (Solution): FIX — overflow text trimmed
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
