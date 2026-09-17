# Reviewer

> **Skill untuk:** Memverifikasi akurasi draf terhadap fakta bisnis, panduan brand, struktur presentasi, dan merumuskan On-Page SEO metadata.

## Tujuan
Memastikan draf company profile berkualitas tinggi, bebas kesalahan faktual, sesuai tone of voice, dan siap dikonversi ke HTML.

## Inputs
- `compros/<slug>/drafts/01-draft.md` (legacy: `artifacts/01-company-profile-draft.md`): Draf draf dari Writer.
- `input/business-knowledge-base.md`: Sumber fakta bisnis.
- `input/business-audit-report.md`: Analisis pasar dan diferensiasi.
- `input/brand-story-guide.md`: Panduan tone of voice dan persona merek.

## Outputs
- `compros/<slug>/reports/review-report.md` (legacy: `artifacts/review-report.md`): Laporan evaluasi per kategori dan daftar revisi yang wajib diperbaiki.
- `compros/<slug>/drafts/02-final.md` (legacy: `artifacts/02-company-profile-final.md`): Salinan draf yang telah disetujui (**`APPROVED`**), dilengkapi blok Meta Title & Meta Description di baris awal.

## Checklist Audit Reviewer
1. **Factual Consistency:**
   - Tidak ada angka, nama, harga, atau klaim yang bertentangan dengan `business-knowledge-base.md`.
2. **Brand Voice & Storytelling:**
   - Nada bicara konsisten dengan `brand-story-guide.md`.
   - Alur narasi mengalir logis: Problem -> Solution -> Proof -> Offer -> CTA.
3. **Slide Layout & Capacity:**
   - Setiap slide diawali `# ` (H1).
   - Panjang kata per slide proporsional (85–140 kata). Tidak ada slide yang kepanjangan.
4. **Content SEO & Metadata Formulation:**
   - Judul slide deskriptif dan ramah pencarian.
   - Reviewer menyusun `Meta Title` (maksimal 60 karakter) dan `Meta Description` (150–160 karakter) yang merangkum proposisi nilai perusahaan, disisipkan pada bagian header draf final.
5. **Content Deduplication:**
   - Tidak ada kalimat atau frasa yang diulang verbatim antar elemen pada slide yang sama (tagline ≠ deskripsi, heading ≠ body).
   - Jika repetisi >40% terdeteksi pada slide manapun → REVISION_REQUIRED dengan catatan "Repetisi verbatim pada Slide X: [elemen A] vs [elemen B]".
6. **Contact Information Factual Check:**
   - Semua informasi kontak (nomor telepon, email, website, alamat, nama PIC) WAJIB bersumber langsung dari `business-knowledge-base.md`.
   - Cross-check setiap item kontak di Slide CTA/Contact terhadap data kontak di input docs.
   - Jika input docs TIDAK menyediakan kontak tertentu:
     - Gunakan placeholder eksplisit: `[Nomor WhatsApp]`, `[Email Resmi]`, `[Alamat Kantor]`
     - Tandai di review report: "Kontak X belum tersedia di input docs — menggunakan placeholder"
   - **DILARANG KERAS** mengarang/memfabrikasi nomor telepon, email, atau alamat yang tidak ada di dokumen sumber. Ini merupakan pelanggaran Zero Hallucination yang serius.
7. **Template-Consumability** (template-consumability — output harus langsung bisa
   dirender tema builder `modern` tanpa editing manual):
   - Setiap slide `# ` membawa SATU image directive valid
     (`<!-- image: <slot> -- query: ...; keywords: ...; style: photo -->`).
     image directive hilang/format salah → REVISION_REQUIRED.
   - pricing rows: tabel pricing WAJIB tepat 3 baris data (`| Tier | Harga | Fitur |`,
     baris tengah = Pro). Bukan 3 baris parseable → REVISION_REQUIRED.
   - differentiator columns: tabel pembanding WAJIB 4–5 kolom. Kurang dari 4 kolom
     dan bullet tidak bisa dikonversi ke tabel → REVISION_REQUIRED.
   - big-number regex: setiap bullet metrik WAJIB cocok dengan big-number regex
     (`%`, `:`, `Rp`, `vX` — misal `~90%`, `20:1`, `Rp10rb`) agar tidak jatuh ke
     default `100%`. Tidak cocok → REVISION_REQUIRED, kecuali bullet
     struktural/prosa yang tidak membawa klaim metrik (misal label pipeline
     seperti `3-tier`).
   - honesty callout: baris `**Intinya:** ...` WAJIB ada bila kompetitor menang di
     satu aspek (misal syarat setup GPU 8 GB). honesty callout hilang padahal ada
     aspek yang dimenangkan kompetitor → REVISION_REQUIRED.

## Status Review
- **`APPROVED`**: Draf memenuhi semua kriteria checklist. Salin konten ke `compros/<slug>/drafts/02-final.md` (legacy: `artifacts/02-company-profile-final.md`) dan teruskan ke Builder.
- **`REVISION_REQUIRED`**: Tulis rincian perbaikan di `compros/<slug>/reports/review-report.md` (legacy: `artifacts/review-report.md`). Orchestrator akan mengembalikan draf ke Writer (maksimal 3 iterasi loop).