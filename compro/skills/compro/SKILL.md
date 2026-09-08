# Compro Orchestrator (Main Skill)

> **Skill untuk:** Menjalankan pipeline Layer 3 — Company Profile secara end-to-end dari dokumen bisnis hingga presentasi web live di Vercel.

## State Machine Pipeline (`writer` ➔ `reviewer` ➔ `builder` ➔ `publisher`)

1. **Gate 0 - Intake Check:**
   - Periksa keberadaan:
     - `input/business-knowledge-base.md`
     - `input/business-audit-report.md`
     - `input/brand-story-guide.md`
   - Jika ada file yang belum tersedia, hentikan proses dan minta pengguna menyediakan dokumen yang kurang.

2. **Phase 1 - Drafting:**
   - Panggil skill `/writer`.
   - Menghasilkan: `compros/<slug>/drafts/01-draft.md` (legacy: `artifacts/01-company-profile-draft.md`).

3. **Phase 2 - Content QA Loop:**
   - Panggil skill `/reviewer`.
   - Jika reviewer mengeluarkan status `REVISION_REQUIRED`:
     - Panggil kembali `/writer` dengan melampirkan `compros/<slug>/reports/review-report.md` (legacy: `artifacts/review-report.md`).
     - Ulangi maksimal 3 kali iterasi.
   - Setelah status **`APPROVED`**:
     - Draf final tersimpan di `compros/<slug>/drafts/02-final.md` (legacy: `artifacts/02-company-profile-final.md`).

4. **Phase 3 - Slide Deck Assembly:**
   - Panggil skill `/builder`.
   - Mengonversi `compros/<slug>/drafts/02-final.md` menjadi:
     - `<project>/compros/<slug>/index.html` (Single-file Reveal.js HTML dengan CSS ter-inline).
     - `<project>/compros/<slug>/compro.md`.
     - `<project>/compros/<slug>/assets/`.
     - `<project>/compros/<slug>/reports/build.log`.
     - Mengonsolidasikan semua file kerja ke folder proyek `compros/<slug>/` (`index.html`, `compro.md`, `assets/`, `reports/`, `drafts/`).

5. **Phase 4 - Pre-flight SEO Audit & Auto-Fix:**
   - Panggil skill `/publisher` mode audit.
   - Memindai `compros/<slug>/index.html` dan otomatis menambal Title, Meta Description, Open Graph, dan JSON-LD Schema jika belum lengkap.
   - Menyimpan laporan ke `compros/<slug>/reports/seo-report.md` (legacy: `qa/seo-report.md`).

6. **Gate 5 - User Confirmation Gate:**
   - Tampilkan ringkasan kesiapan slide ke pengguna:
     - Lokasi file HTML lokal (`<project>/compros/<slug>/index.html`).
     - Ringkasan optimasi SEO yang sudah diterapkan (`<project>/compros/<slug>/reports/seo-report.md`).
   - Tanyakan kepada pengguna:
     > *"Company Profile slide deck telah selesai dirakit dan dioptimasi SEO. Anda dapat membuka `<project>/compros/<slug>/index.html` untuk melihat tampilannya. Apakah Anda ingin langsung men-deploy slide ini ke Vercel sekarang?"*
   - Tunggu respon pengguna:
     - Jika pengguna setuju ("Ya", "Deploy", "Lanjut") ➔ lanjut ke Phase 6.
     - Jika pengguna ingin meninjau dulu ➔ hentikan sementara proses dengan rapi.

7. **Phase 6 - Deployment ke Vercel:**
   - Panggil skill `/publisher` mode deploy.
   - Jalankan `node skills/publisher/scripts/deploy.js <deploy-dir>`.
   - Lakukan verifikasi live URL via HTTP GET 200.
   - Simpan catatan status ke `<project>/compros/<slug>/reports/deployment-status.md`.
   - Kembalikan URL live Vercel dan status rilis kepada pengguna.
