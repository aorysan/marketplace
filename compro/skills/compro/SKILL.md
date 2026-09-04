# Compro Orchestrator (Main Skill)

> **Skill untuk:** Menjalankan pipeline Layer 3 — Company Profile secara end-to-end dari dokumen bisnis hingga presentasi web live di Vercel.

## State Machine Pipeline

1. **Gate 0 - Intake Check:**
   - Periksa keberadaan:
     - `input/business-knowledge-base.md`
     - `input/business-audit-report.md`
     - `input/brand-story-guide.md`
   - Jika ada file yang belum tersedia, hentikan proses dan minta pengguna menyediakan dokumen yang kurang.

2. **Phase 1 - Drafting:**
   - Panggil skill `/company-profile-writer`.
   - Menghasilkan: `artifacts/01-company-profile-draft.md`.

3. **Phase 2 - Content QA Loop:**
   - Panggil skill `/company-profile-reviewer`.
   - Jika reviewer mengeluarkan status `REVISION_REQUIRED`:
     - Panggil kembali `/company-profile-writer` dengan melampirkan `artifacts/review-report.md`.
     - Ulangi maksimal 3 kali iterasi.
   - Setelah status **`APPROVED`**:
     - Draf final tersimpan di `artifacts/02-company-profile-final.md`.

4. **Phase 3 - Slide Deck Assembly:**
   - Panggil skill `/company-profile-builder`.
   - Mengonversi `artifacts/02-company-profile-final.md` menjadi:
     - `<project>/compros/<name>/index.html` (Single-file Reveal.js HTML dengan CSS ter-inline).
     - `<project>/compros/<name>/compro.md`.
     - `<project>/compros/<name>/assets/`.
     - `<project>/compros/<name>/build.log`.

5. **Phase 4 - Pre-flight SEO Audit & Auto-Fix:**
   - Panggil skill `/company-profile-publisher` mode audit.
   - Memindai `index.html` dan otomatis menambal Title, Meta Description, Open Graph, dan JSON-LD Schema jika belum lengkap.
   - Menyimpan laporan ke `qa/seo-report.md`.

6. **Gate 5 - User Confirmation Gate:**
   - Tampilkan ringkasan kesiapan slide ke pengguna:
     - Lokasi file HTML lokal.
     - Ringkasan optimasi SEO yang sudah diterapkan.
   - Tanyakan kepada pengguna:
     > *"Company Profile slide deck telah selesai dirakit dan dioptimasi SEO. Anda dapat membuka `<project>/compros/<name>/index.html` untuk melihat tampilannya. Apakah Anda ingin langsung men-deploy slide ini ke Vercel sekarang?"*
   - Tunggu respon pengguna:
     - Jika pengguna setuju ("Ya", "Deploy", "Lanjut") ➔ lanjut ke Phase 6.
     - Jika pengguna ingin meninjau dulu ➔ hentikan sementara proses dengan rapi.

7. **Phase 6 - Deployment ke Vercel:**
   - Panggil skill `/company-profile-publisher` mode deploy.
   - Jalankan `node skills/company-profile-publisher/scripts/deploy.js <deploy-dir>`.
   - Lakukan verifikasi live URL via HTTP GET 200.
   - Kembalikan URL live Vercel dan status rilis kepada pengguna.
