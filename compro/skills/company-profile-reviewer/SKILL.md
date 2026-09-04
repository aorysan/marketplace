# Company Profile Reviewer (Skill 9)

> **Skill untuk:** Memverifikasi akurasi draf terhadap fakta bisnis, panduan brand, struktur presentasi, dan merumuskan On-Page SEO metadata.

## Tujuan
Memastikan draf company profile berkualitas tinggi, bebas kesalahan faktual, sesuai tone of voice, dan siap dikonversi ke HTML.

## Inputs
- `artifacts/01-company-profile-draft.md`: Draf draf dari Writer.
- `input/business-knowledge-base.md`: Sumber fakta bisnis.
- `input/business-audit-report.md`: Analisis pasar dan diferensiasi.
- `input/brand-story-guide.md`: Panduan tone of voice dan persona merek.

## Outputs
- `artifacts/review-report.md`: Laporan evaluasi per kategori dan daftar revisi yang wajib diperbaiki.
- `artifacts/02-company-profile-final.md`: Salinan draf yang telah disetujui (**`APPROVED`**), dilengkapi blok Meta Title & Meta Description di baris awal.

## Checklist Audit Reviewer
1. **Factual Consistency:**
   - Tidak ada angka, nama, harga, atau klaim yang bertentangan dengan `business-knowledge-base.md`.
2. **Brand Voice & Storytelling:**
   - Nada bicara konsisten dengan `brand-story-guide.md`.
   - Alur narasi mengalir logis: Problem -> Solution -> Proof -> Offer -> CTA.
3. **Slide Layout & Capacity:**
   - Setiap slide diawali `# ` (H1).
   - Panjang kata per slide proporsional (150–250 kata). Tidak ada slide yang kepanjangan.
4. **Content SEO & Metadata Formulation:**
   - Judul slide deskriptif dan ramah pencarian.
   - Reviewer menyusun `Meta Title` (maksimal 60 karakter) dan `Meta Description` (150–160 karakter) yang merangkum proposisi nilai perusahaan, disisipkan pada bagian header draf final.

## Status Review
- **`APPROVED`**: Draf memenuhi semua kriteria checklist. Salin konten ke `artifacts/02-company-profile-final.md` dan teruskan ke Builder.
- **`REVISION_REQUIRED`**: Tulis rincian perbaikan di `artifacts/review-report.md`. Orchestrator akan mengembalikan draf ke Writer (maksimal 3 iterasi loop).