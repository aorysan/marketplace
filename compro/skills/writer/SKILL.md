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
- `compros/<slug>/reports/selling-points-research.md`: Laporan research kompetitif internal — berisi tabel perbandingan produk dan selling points teridentifikasi. **Dokumen internal, TIDAK ditampilkan di slide.**

## Aturan Penulisan & Chunking
1. **Pemisah Slide Deterministic:**
   - Gunakan `# [Judul Slide]` (H1) untuk menandai setiap slide utama baru.
   - Panjang kata dalam satu slide dibatasi ~85–140 kata agar proporsional pada layar presentasi 16:9.
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
   - **Slide 7 (Why Choose Us):** `# Mengapa Kami` + tabel pembanding atau differentiator 4–5 kolom vs alternatif kategori/arketipe.
     *(Opsional — hanya jika data kompetitor/alternatif tersedia di business-audit-report.md)*
     *Format Header Tabel Pembanding:* Kolom WAJIB menggunakan label kategori/arketipe generik (misal `| Aspek | [Produk Kita] | Solusi Konvensional | Software Generik | Pendekatan Manual |` atau `Agency Tradisional`, `Alat Manual / In-House`), BUKAN nama merek/brand kompetitor spesifik untuk mematuhi Zero Competitor Leak.
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

## Phase 0.5: Competitive Selling Point Research

Sebelum menulis draf narasi, Writer WAJIB melakukan research kompetitif untuk mengidentifikasi selling points yang tervalidasi pasar.

### Alur Research

1. **Extract Product Identity:**
   - Baca `input/business-knowledge-base.md` dan `input/business-audit-report.md`
   - Identifikasi: nama produk/perusahaan, kategori industri (SaaS, F&B, Property, dll), daftar fitur/layanan utama, model bisnis, target market, serta gap audit / pain points bisnis
   - Formulasikan search queries dari informasi ini

2. **Web Research — Discovery (maks 3 query `search_web`):**
   - Query 1: `"<kategori industri> <jenis produk> Indonesia"` (kompetitor lokal)
   - Query 2: `"<kategori industri> <jenis produk> competitor comparison"` (global)
   - Query 3: `"best <jenis produk> 2025 2026"` (ranking/review)
   - Kumpulkan 3-5 produk serupa: nama, URL website, tagline/positioning singkat
   - **Offline / Failure Graceful Fallback**:
     - Jika `search_web` gagal dieksekusi (lingkungan offline, batasan network/sandbox, kuota limit terlampaui) atau menghasilkan 0 kompetitor relevan (misal produk sangat niche atau sistem internal), **Writer TIDAK BOLEH berhenti atau me-stall pipeline**.
     - Writer WAJIB beralih secara graceful fallback ke **Internal Document Synthesis**: lewati tahap web deep dive (Langkah 3), lalu langsung sintesis 5-8 selling points berbasis data gabungan dari `business-knowledge-base.md` dan `business-audit-report.md`.

3. **Web Research — Deep Dive (maks 5 halaman `read_url_content`):**
   - *(Lewati jika dalam mode Offline / Fallback)*
   - Baca landing page utama setiap kompetitor yang ditemukan
   - Ekstrak: fitur yang diklaim, pricing model (jika publik), positioning, target market, keunggulan yang ditekankan
   - Batasan ketat: maksimal 5 halaman total untuk efisiensi token

4. **Analisis Perbandingan:**
   - **Mode Web Competitor Analysis:** Susun tabel perbandingan fitur: produk kita vs setiap kompetitor yang ditemukan.
   - **Mode Internal Synthesis (Offline / Fallback):** Susun tabel perbandingan internal: kapabilitas/solusi produk kita vs pendekatan konvensional / status quo / gap operasional di `business-audit-report.md`.
   - Identifikasi **keunggulan unik** (fitur yang TIDAK dimiliki mayoritas kompetitor atau memecahkan pain point audit)
   - Identifikasi **table stakes** (fitur standar yang semua punya)
   - Identifikasi **kelemahan** yang perlu diakui secara transparan

5. **Formulasi Selling Points (5-8 poin):**
   - Setiap selling point harus:
     - Berdiri sendiri TANPA menyebut nama kompetitor
     - Berbasis fakta dari `business-knowledge-base.md` dan `business-audit-report.md`
     - Diperkuat oleh temuan research (keunikan relatif) atau gap solutif yang terverifikasi
   - Format per selling point:
     ```
     ### SP-N: [Title]
     - **Klaim:** [Pernyataan keunggulan — positif, bukan komparatif]
     - **Basis Fakta:** [Referensi dari business-knowledge-base.md / business-audit-report.md]
     - **Validasi Kompetitif:** [Mengapa ini unik — tanpa sebut nama kompetitor]
     - **Rekomendasi Slide:** [Hero/Solution/Differentiator/dll]
     ```

6. **Tulis Output:**
   - Simpan ke `compros/<slug>/reports/selling-points-research.md`
   - Format file:
     ```markdown
     # Selling Points Research Report
     ## Metadata
     - Produk: <nama produk>
     - Industri: <kategori>
     - Tanggal Research: <YYYY-MM-DD>
     - Mode Research: Web Competitor Analysis | Internal Synthesis (Offline / Fallback)
     - Jumlah Kompetitor Dianalisis: <N> (0 jika Internal Synthesis)

     ## Ringkasan Temuan
     <1-2 paragraf ringkasan positioning produk di pasar atau sintesis kesiapan produk terhadap kebutuhan pasar>

     ## Tabel Perbandingan Internal
     > ⚠️ DOKUMEN INTERNAL — Data kompetitor di bawah TIDAK ditampilkan di slide.

     | Aspek | [Produk Kita] | [Kompetitor 1 / Alternatif 1] | [Kompetitor 2 / Alternatif 2] | [Kompetitor 3 / Alternatif 3] |
     |-------|...|...|...|...|

     ## Selling Points Teridentifikasi
     ### SP-1: [Title]
     - **Klaim:** ...
     - **Basis Fakta:** ...
     - **Validasi Kompetitif:** ...
     - **Rekomendasi Slide:** ...

     ## Kelemahan yang Harus Diakui
     <Untuk honesty callout di slide Differentiator>

     ## Sumber Research
     - [URL / Dokumen Sumber (input/business-knowledge-base.md, input/business-audit-report.md)] — <deskripsi>
     ```

7. **User Review Gate (BLOCKING):**
   - Tampilkan prompt:
     > "Saya telah melakukan research kompetitif dan mengidentifikasi [N] selling points. Silakan review `compros/<slug>/reports/selling-points-research.md`. Apakah selling points ini sudah sesuai, atau ada yang perlu diubah sebelum saya mulai menulis draf narasi?"
   - Writer TIDAK lanjut ke drafting sampai user approve
   - User boleh mengedit file secara manual atau meminta revisi

### Constraint Research

- **Zero Competitor Leak:** Nama kompetitor TIDAK PERNAH muncul di draf slide (`01-draft.md`) atau output akhir. Hanya di `selling-points-research.md`. Termasuk pada tabel pembanding Slide 7: header kolom dan isi sel WAJIB menggunakan label kategori/arketipe generik (misal `Solusi Konvensional`, `Agency Tradisional`, `Software Generik`, `Pendekatan Manual`, `Alat Manual / In-House`) dan DILARANG menyebut nama merek/brand kompetitor spesifik.
- **Fakta Tetap dari Input Docs:** Research memperkaya perspektif, tapi angka/klaim statistik tetap harus bersumber dari `business-knowledge-base.md` dan `business-audit-report.md`.
- **Selling Points Berdiri Sendiri:** Formulasi harus positif ("Kami adalah satu-satunya yang..."), BUKAN komparatif ("Tidak seperti Kompetitor X...").
- **Offline / Failure Graceful Fallback:** Jika `search_web` gagal, tidak tersedia (lingkungan offline, pembatasan sandbox, quota limit), atau menghasilkan 0 kompetitor relevan (misal produk niche atau internal), Writer WAJIB melakukan graceful fallback dengan mensintesis 5-8 selling points langsung dari `business-knowledge-base.md` dan `business-audit-report.md`. Pipeline tidak boleh macet (stall), dan metadata laporan wajib mencantumkan `Mode Research: Internal Synthesis (Offline / Fallback)`.

## Langkah Kerja
1. Baca ketiga dokumen di `input/`.
2. Identifikasi USP, masalah pelanggan, dan tone yang harus digunakan.
3. **Jalankan Phase 0.5: Competitive Selling Point Research** (lihat section di atas).
4. Tunggu user review dan approval terhadap `selling-points-research.md`.
5. Baca `selling-points-research.md` yang sudah di-approve dan integrasikan selling points ke narasi.
6. Susun draf per slide mengikuti struktur standar di atas — rajut selling points secara natural ke narasi tanpa menyebut nama kompetitor.
7. Periksa jumlah kata per section (pastikan 85–140 kata per H1).
8. Tulis hasil akhir ke `compros/<slug>/drafts/01-draft.md`.

## Referensi Nama Slide (English)
Slide types di bawah menyelaraskan label yang dipakai harness pengujian dengan judul slide di atas:
- **Hero Slide** → Slide 1 (Hero)
- **Problem Slide** → Slide 2 (Problem)
- **Solution** → Slide 3 (Solution)
- **Ecosystem Slide** → Slide 5
- **Differentiator / Why Us** → Slide 7
- **Social Proof / Testimonials** → Slide 8
- **Contact** → Slide 10 (CTA & Contact)

## Kontrak Modern (Template-Consumable Markdown)

Aturan di bawah WAJIB dipenuhi agar output langsung bisa dikonsumsi tema builder
(`modern`) tanpa editing manual. Lihat contoh lengkap di
`test-fixtures/expected/02-final.modern.md`.

1. **Image Directive (satu per slide):**
   - Setiap slide `# ` diawali/diakhi SATU directive dengan format persis:
     ```html
     <!-- image: <slot> -- query: <1 kalimat EN> ; keywords: <3-5 kata> ; style: photo -->
     ```
   - `<slot>`: `hero`, `problem`, `solution`, `services`, `ecosystem`, `metrics`,
     `differentiator`, `pricing`, atau `closing` (huruf kecil, tanpa spasi).
   - `query`: SATU kalimat Bahasa Inggris yang mendeskripsikan foto untuk slot itu.
   - `keywords`: 3–5 kata kunci (dipisah koma) untuk scoring pipeline gambar.
   - `style`: selalu `photo`.
2. **Pricing (Slide Paket & Kerjasama):** tabel markdown TEPAT 3 baris data dengan
   header `| Tier | Harga | Fitur |`, baris tengah adalah tier Pro (di-elevate
   builder sebagai `Best Seller`), kolom Fitur berisi fitur yang dipisah `;`:
   ```
   | Tier | Harga | Fitur |
   |---|---|---|
   | Venturo Lite | Free | 1 Brand DNA + copilot dengan limit; 5 video/bulan dengan watermark; antrean standar |
   | Venturo Pro | Rp99rb/bulan | generate unlimited, full pipeline, tanpa watermark; sync lanjutan + priority support; diskon annual Rp990rb/tahun |
   | Brand / Team | Rp299rb/bulan | multi-seat hingga 5 user; shared asset & kolaborasi; dedicated support |
   ```
3. **Differentiator (Slide Mengapa Kami):** tabel 4–5 kolom dengan header kolom berupa kategori/arketipe generik
   (`| Aspek | [Produk Kita] | Solusi Konvensional | Software Generik | Pendekatan Manual |` — dilarang memakai nama merek/brand kompetitor spesifik sesuai Zero Competitor Leak) + baris kejujuran
   `**Intinya:** ...` yang mengakui aspek di mana alternatif/kompetitor menang
   (misal syarat setup GPU) — tanpa baris ini tabel tidak jujur dan DITOLAK reviewer.
4. **Metrics (Slide Pencapaian & Bukti):** bullet `- **<number>** <title> — <desc>`
   dengan angka berformat `%`, `:`, `Rp`, atau `vX` (misal `~90%`, `20:1`,
   `Rp10rb`) agar `extractBigNumberMetric` tidak jatuh ke default `100%`.
5. **No-Invention (lihat Aturan 2 Zero Hallucination):** semua angka, nama,
   harga, dan klaim perbandingan WAJIB bersumber dari `business-knowledge-base.md`.
   Data tidak tersedia → slide opsional DIHILANGKAN + catat di draf, JANGAN mengarang
   tier, metrik, testimoni, atau kolom kompetitor.
