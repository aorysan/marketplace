# Writer

> **Skill untuk:** Mengolah 3 dokumen input bisnis menjadi draf narasi company profile berbasis slide (Markdown).

## Tujuan
Menghasilkan draf presentasi company profile yang persuasif, faktual, dan terstruktur rapi per-slide dari dokumen pengetahuan bisnis, audit, dan panduan merek.

## Inputs
Dokumen yang disediakan di folder `input/`:
1. `input/business-knowledge-base.md`: Data faktual bisnis (profil perusahaan, sejarah, produk/layanan, USP, metrik, portofolio, kontak).
2. `input/business-audit-report.md`: Analisis pasar, masalah pelanggan (*pain points*), keunggulan kompetitif.
3. `input/brand-story-guide.md`: Panduan nada suara (*tone of voice*), persona audiens, dan pesan kunci merek.

## Outputs
- `compros/<slug>/drafts/01-draft.md` (legacy: `artifacts/01-company-profile-draft.md`): Draf presentasi company profile lengkap dengan pemisah heading slide.

## Aturan Penulisan & Chunking
1. **Pemisah Slide Deterministic:**
   - Gunakan `# [Judul Slide]` (H1) untuk menandai setiap slide utama baru.
   - Panjang kata dalam satu slide dibatasi ~150–250 kata agar proporsional pada layar presentasi 16:9.
2. **Zero Hallucination:**
   - Semua angka statistik, portofolio, nama klien, dan klaim kompetitif wajib bersumber langsung dari `business-knowledge-base.md`.
3. **Struktur Urutan Slide Standar (Diperluas):**
   - **Slide 1 (Hero):** `# [Nama Perusahaan]` + Tagline 1 baris + Ringkasan 1 kalimat deskripsi + 2–3 statistik kunci.
   - **Slide 2 (Problem):** `# Masalah yang Dihadapi` + 3 poin masalah utama pelanggan.
   - **Slide 3 (Solution):** `# Solusi & Nilai Tambah` + 1–3 kalimat penjelasan solusi utama.
   - **Slide 4 (Key Features / Services):** `# Layanan Unggulan` + card-based features (pisahkan jika >3 layanan).
   - **Slide 5 (Ecosystem):** `# Arsitektur & Ekosistem` + diagram platform/alur.
     *(Opsional — hanya jika bisnis punya platform/ekosistem yang layak divisualisasikan)*
   - **Slide 6 (Traction & Proof):** `# Pencapaian & Bukti` + metrik kuantitatif + device mockup.
   - **Slide 7 (Why Choose Us):** `# Mengapa Kami` + tabel pembanding atau differentiator vs alternatif/kompetitor.
     *(Opsional — hanya jika data kompetitor tersedia di business-audit-report.md)*
   - **Slide 8 (Social Proof):** `# Testimoni & Kepercayaan` + quotes klien atau logo trust badges.
     *(Opsional — hanya jika testimoni/portofolio klien tersedia di input docs)*
   - **Slide 9 (Pricing / Packages):** `# Paket & Kerjasama` (opsional jika ada pricing).
   - **Slide 10 (CTA & Contact):** `# Hubungi Kami` + kontak lengkap (Telepon, Email, Website, Alamat).
   *Catatan Slide Opsional:* Slide 5, 7, 8 opsional — hanya dihasilkan jika data relevan tersedia. Writer TIDAK BOLEH mengarang data. Output minimal 7 slide, maksimal 10.
4. **Visual & Asset Directives:**
   - Cantumkan referensi visual jika relevan, misal `![Logo](assets/logo.png)` atau arahan `<!-- image: hero modern office -->`.
5. **No Verbatim Repetition:**
   - Dalam satu slide, setiap elemen teks (tagline, deskripsi, bullet point) HARUS menyampaikan informasi yang BERBEDA satu sama lain.
   - **Tagline** = hook pendek yang punchy, maksimal 1-2 kalimat.
   - **Deskripsi** = elaborasi value proposition yang menambah detail BARU, BUKAN mengulang kata-kata tagline.
   - **Statistik** = angka faktual yang memperkuat, bukan memarafrase tagline.
   - Rule of thumb: jika >40% kata di deskripsi sama dengan tagline, itu repetisi.
   - Pelanggaran aturan ini merupakan alasan reviewer mengeluarkan REVISION_REQUIRED.

## Langkah Kerja
1. Baca ketiga dokumen di `input/`.
2. Identifikasi USP, masalah pelanggan, dan tone yang harus digunakan.
3. Susun draf per slide mengikuti struktur standar di atas.
4. Periksa jumlah kata per section (pastikan 150–250 kata per H1).
5. Tulis hasil akhir ke `compros/<slug>/drafts/01-draft.md` (legacy: `artifacts/01-company-profile-draft.md`).

## Referensi Nama Slide (English)
Slide types di bawah menyelaraskan label yang dipakai harness pengujian dengan judul slide di atas:
- **Hero Slide** → Slide 1 (Hero)
- **Problem Slide** → Slide 2 (Problem)
- **Solution** → Slide 3 (Solution)
- **Ecosystem Slide** → Slide 5
- **Differentiator / Why Us** → Slide 7
- **Social Proof / Testimonials** → Slide 8
- **Contact** → Slide 10 (CTA & Contact)
