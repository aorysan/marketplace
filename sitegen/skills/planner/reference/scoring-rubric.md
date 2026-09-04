# Review Checklist V2 — QA Reviewer (Adaptive)

Rubrik ini digunakan untuk menilai planning yang dihasilkan skill `planner`. 
Agent memilih bagian yang relevan sesuai mode review:
- Mode `global` → gunakan Bagian A
- Mode `page` → gunakan Bagian B

Skor minimum lolos: **90/100**
Batas revisi: **2 putaran**

---

## BAGIAN A — Review Global Planning (100 poin)

Digunakan saat me-review `PLAN-GLOBAL.md`.

### A1. Kelengkapan Branding (20 poin)

| Item | Poin | Kriteria |
|---|---|---|
| Primary color (hex) | 4 | Tercantum dengan hex code valid |
| Secondary color (hex) | 4 | Tercantum dengan hex code valid |
| Dark color (hex) | 4 | Tercantum dengan hex code valid |
| Font heading (Google Font) | 3 | Dideklarasikan, Google Font valid |
| Font body (Google Font) | 3 | Dideklarasikan, Google Font valid |
| Tone visual | 2 | Dideklarasikan dan sesuai industri |

### A2. SEO Keyword Mapping (25 poin)

| Item | Poin | Kriteria |
|---|---|---|
| Seluruh halaman terpetakan | 5 | Semua halaman (dari intake) ada di tabel keyword |
| Anti-kanibalisasi | 7 | Tidak ada buying keyword yang sama di 2+ halaman |
| Buying keyword valid per halaman | 5 | Setiap halaman punya buying keyword relevan |
| LSI keywords (min 2 per halaman) | 5 | Setiap halaman punya min 2 LSI keywords |
| Backlink plan (3 artikel) | 3 | 3 artikel backlink dengan keyword dan gambar |

### A3. Value Proposition Inventory (25 poin)

| Item | Poin | Kriteria |
|---|---|---|
| Semua kalimat persuasi dari PDF ada | 10 | Cross-check dengan final_intake, tidak ada yang hilang |
| Setiap kalimat ditandai target halaman | 5 | Kolom "Target Halaman" terisi untuk semua |
| Setiap kalimat ditandai target section | 5 | Kolom "Target Section" terisi untuk semua |
| Value proposition inti tercantum | 5 | Min 3 keunggulan inti dari PDF |

### A4. Data Perusahaan & Footer (15 poin)

| Item | Poin | Kriteria |
|---|---|---|
| Ringkasan perusahaan lengkap | 5 | Nama, tagline, industri, profil terisi |
| Footer email & WA | 4 | Email dan nomor WA tercantum |
| Footer alamat & sosmed | 3 | Alamat dan min 1 sosmed tercantum |
| Schema.org mapping | 3 | Mapping schema type untuk semua halaman |

### A5. Anti-AI Slop (15 poin)

| Item | Poin | Kriteria |
|---|---|---|
| Tidak ada emoji | 5 | Tidak ada emoji di seluruh dokumen |
| Tidak ada teks generik tanpa basis PDF | 5 | Semua konten berdasarkan data PDF |
| Tidak ada placeholder "[...]" | 5 | Semua field terisi, tidak ada placeholder |

---

## BAGIAN B — Review Page Planning (100 poin)

Digunakan saat me-review `PLAN-<halaman>.md`.
Terbagi 2 dimensi: **Business Review** (60 poin) dan **Technical Review** (40 poin).

### BUSINESS REVIEW (60 poin)

#### B1. Konten Berdasar PDF (12 poin)

| Item | Poin | Kriteria |
|---|---|---|
| Informasi akurat sesuai PDF | 5 | Cross-check konten dengan final_intake |
| Layanan/produk sesuai data PDF | 4 | Tidak mengandung info yang dibuat-buat |
| Tidak ada placeholder "[...]" | 3 | Semua field konten terisi |

#### B2. Value Proposition Tercantum (12 poin)

| Item | Poin | Kriteria |
|---|---|---|
| VP yang di-assign ke halaman ini ada | 5 | Cross-check dengan PLAN-GLOBAL Section 2 |
| Posisi VP di section yang tepat | 4 | VP ditempatkan di section yang sesuai (misal hero, solution) |
| VP tidak diubah substansinya | 3 | Kalimat sesuai asli dari PDF |

#### B3. Branding Consistency (8 poin)

| Item | Poin | Kriteria |
|---|---|---|
| Tone konten sesuai branding global | 3 | Cross-check dengan PLAN-GLOBAL Section 3 |
| Tidak ada konflik branding | 3 | Warna/font/tone konsisten dengan global |
| Kontras warna primary↔secondary valid | 2 | Bukan 2 warna gelap atau 2 warna terang berdampingan |

#### B4. Anti-AI Slop (8 poin)

| Item | Poin | Kriteria |
|---|---|---|
| Tidak ada emoji | 2 | Tidak ada emoji di dokumen |
| Tidak ada teks generik | 3 | Semua konten berbasis data PDF |
| Tidak ada kalimat "Enterprise Solution" dll tanpa konteks | 3 | Tidak ada jargon tanpa basis data |

#### B5. Copywriting Quality (12 poin) *(BARU — diadopsi dari LPG)*

| Item | Poin | Kriteria |
|---|---|---|
| Hero headline ≤ 7 kata (25-40 char) | 2 | Hitung kata/karakter, harus ringkas dan hook dalam 3 detik |
| Hero subheadline ≤ 20 kata | 1 | Maksimal 2 kalimat pendek |
| Section titles ≤ 5 kata | 2 | Terarah, fokus pada esensi bisnis |
| CTA button text ≤ 3 kata | 2 | Agresif, action-oriented (misal: "Konsultasi Gratis Sekarang") |
| Card/feature desc ≤ 2 kalimat | 2 | Maksimal 15 kata per deskripsi |
| Tone of voice konsisten dengan PLAN-GLOBAL | 2 | Sesuai spectrum yang didefinisikan (formal/casual, dll) |
| Tidak ada banned content | 1 | Tidak ada kata berkonotasi buruk sesuai daftar di PLAN-GLOBAL |

#### B6. Messaging & Konversi (8 poin) *(BARU — diadopsi dari LPG)*

| Item | Poin | Kriteria |
|---|---|---|
| Problem section punya pola PAS (jika ada) | 2 | Problem → Agitation ("apa ruginya?") → Solution |
| Testimonial berdasar data PDF, bukan karangan | 2 | Jika tidak ada di PDF → pivot ke Social Proof atau drop section |
| CTA final punya elemen FOMO | 2 | Headline terakhir memicu Fear of Missing Out |
| Value proposition jelas dan terdiferensiasi | 2 | Bukan kalimat generik yang bisa dipakai kompetitor manapun |

### TECHNICAL REVIEW (40 poin)

#### T1. Section Types Valid (8 poin)

| Item | Poin | Kriteria |
|---|---|---|
| Semua section menggunakan types yang didukung | 5 | Dari: hero, problem, solution, about, management, techstack, testimonial, pricing, faq, cta, video |
| Tidak ada section type yang tidak dikenal | 3 | Tidak ada typo atau custom type |

#### T2. Data Konten Lengkap (12 poin)

| Item | Poin | Kriteria |
|---|---|---|
| Hero section lengkap (headline, cta) | 3 | Field wajib hero terisi |
| Section content lengkap (title, items) | 4 | Setiap section punya data konten yang lengkap sesuai type |
| CTA section lengkap | 2 | Headline CTA terisi |
| Semua field wajib per type terisi | 3 | Tidak ada field yang kosong |

#### T3. SEO Compliance (8 poin)

| Item | Poin | Kriteria |
|---|---|---|
| Title tag ≤ 55 char | 2 | Hitung karakter, harus ≤ 55 |
| Title tag memuat 2-3 keyword | 1 | Cross-check dengan keyword mapping |
| Meta desc ≤ 155 char | 2 | Hitung karakter, harus ≤ 155 |
| Meta desc memuat keyword yang belum di title | 1 | Keyword berbeda dari title |
| URL memuat keyword | 2 | Route mengandung buying keyword |

#### T4. Video SMO & Schema.org (6 poin)

| Item | Poin | Kriteria |
|---|---|---|
| Ada min 1 section video/embed SMO | 3 | Section video dengan embedUrl valid |
| Schema.org type sesuai mapping global | 3 | Cross-check dengan PLAN-GLOBAL |

#### T5. Carousel Rule (6 poin)

| Item | Poin | Kriteria |
|---|---|---|
| Section ≥ 10 item → instruksi carousel eksplisit | 6 | Cek setiap section, jika ≥ 10 item harus ada "Gunakan Auto-slide Carousel" |

### BONUS POINTS (opsional, tidak mempengaruhi threshold)

Bonus berdasar tipe halaman:

| Halaman | Bonus Item | Poin |
|---|---|---|
| Beranda | Ada stats/clients di hero | +3 |
| Beranda | Ada problem-solution flow | +2 |
| Layanan | Ada pricing section | +3 |
| Layanan | Ada testimonial section | +2 |
| About | Ada management/team section | +2 |
| Blog | 3 artikel backlink dengan gambar clickable | +3 |
| Portofolio | Ada showcase proyek detail | +2 |

---

## Ringkasan Skor

### Mode Global
| # | Kategori | Bobot |
|---|---|---|
| A1 | Kelengkapan Branding | 20 |
| A2 | SEO Keyword Mapping | 25 |
| A3 | Value Proposition Inventory | 25 |
| A4 | Data Perusahaan & Footer | 15 |
| A5 | Anti-AI Slop | 15 |
| | **TOTAL** | **100** |

### Mode Page
| Dimensi | Kategori | Bobot |
|---|---|---|
| Business | B1. Konten Berdasar PDF | 12 |
| Business | B2. Value Proposition | 12 |
| Business | B3. Branding Consistency | 8 |
| Business | B4. Anti-AI Slop | 8 |
| Business | **B5. Copywriting Quality** | **12** |
| Business | **B6. Messaging & Konversi** | **8** |
| Technical | T1. Section Types Valid | 8 |
| Technical | T2. Data Konten Lengkap | 12 |
| Technical | T3. SEO Compliance | 8 |
| Technical | T4. Video SMO & Schema.org | 6 |
| Technical | T5. Carousel Rule | 6 |
| | **TOTAL** | **100** |

> **Perubahan bobot**: Business Review naik dari 50 → **60 poin**, Technical Review turun dari 50 → **40 poin**.
> Alasan: adopsi aturan copywriting dari LPG menambah 2 kategori baru (B5, B6) yang merupakan aspek bisnis kritis untuk kualitas konten.

### Mode Global Extended
| Dokumen | Bagian Rubrik | Bobot | Threshold Lolos |
|---|---|---|---|
| PLAN-GLOBAL.md | Bagian A | 100 poin | ≥ 90 |
| PLAN-USER-NEEDS.md | Bagian C | 25 poin | (lihat subtotal) |
| PLAN-COMPETITOR.md | Bagian D | 25 poin | (lihat subtotal) |
| PLAN-DESIGN-SYSTEM.md | Bagian E | 25 poin | (lihat subtotal) |
| **Subtotal C+D+E** | | **75 poin** | **≥ 60** |

> **Keputusan PASS**: PLAN-GLOBAL ≥ 90/100 **DAN** subtotal C+D+E ≥ 60/75. Jika salah satu tidak terpenuhi → STATUS = REVISI.
> **Batas revisi**: 2 putaran per dokumen. Lebih dari itu, eskalasi ke user.

**Skor minimum lolos: 90/100 (mode global & page) | 90 + 60/75 (mode global-extended)**
**Batas revisi: 2 putaran**

---

## BAGIAN C — Review User Needs (25 poin)

Digunakan saat me-review `PLAN-USER-NEEDS.md`.

### C1. Kelengkapan Struktur (10 poin)

| Item | Poin | Kriteria |
|---|---|---|
| Profil psikografis terisi | 2 | Spesifik untuk industri ini, bukan generik |
| Pain points min. 5 | 3 | Format lengkap: pain point + intensitas + relevansi ke layanan |
| JTBD min. 3 statements | 2 | Format "Ketika...ingin...agar..." terpenuhi pada semua item |
| Objection + counter-messaging min. 3 | 3 | Counter-messaging spesifik dan actionable — bukan kalimat umum |

### C2. Kedalaman Insight (10 poin)

| Item | Poin | Kriteria |
|---|---|---|
| FAQ min. 5 pertanyaan | 3 | Pertanyaan realistis pra-pembelian, disertai jawaban + lokasi di website |
| User journey 5 tahap | 3 | Semua tahap terisi: channel + konten yang dicari + section website relevan |
| Trigger pembelian min. 3 | 2 | Spesifik dan kontekstual — bukan generik |
| Insight berbasis data nyata / web search | 2 | Ada basis riil, bukan asumsi tanpa landasan |

### C3. Anti-Generik (5 poin)

| Item | Poin | Kriteria |
|---|---|---|
| Tidak ada placeholder "[...]" | 2 | Semua field terisi dengan konten nyata |
| Tidak ada insight generik | 3 | Tidak ada kalimat seperti "mereka ingin solusi yang baik" atau "kualitas terbaik" |

---

## BAGIAN D — Review Competitor Analysis (25 poin)

Digunakan saat me-review `PLAN-COMPETITOR.md`.

### D1. Kelengkapan Kompetitor (10 poin)

| Item | Poin | Kriteria |
|---|---|---|
| Min. 3 kompetitor teridentifikasi | 4 | Ada nama bisnis + URL yang valid atau dapat diverifikasi |
| Setiap kompetitor ada analisis positioning | 3 | Tagline, target audience, kekuatan, kelemahan — semua terisi |
| Setiap kompetitor ada data website | 3 | Section yang digunakan + fitur interaktif tercatat |

### D2. Kedalaman Analisis (10 poin)

| Item | Poin | Kriteria |
|---|---|---|
| Tone of voice per kompetitor | 3 | Formal/casual + teknikal/sederhana + kata kunci dominan |
| Keyword SEO yang mereka target | 3 | Dari observasi title tag dan/atau meta description nyata |
| Gap analysis terisi | 4 | Min. 3 gap konkret dengan rekomendasi cara eksploitasi spesifik |

### D3. Akurasi Data (5 poin)

| Item | Poin | Kriteria |
|---|---|---|
| Data bukan karangan | 3 | Kompetitor nyata, dapat diverifikasi secara online |
| Keyword gap memuat rekomendasi konkret | 2 | Ada rekomendasi spesifik untuk brand ini — bukan hanya daftar keyword |

---

## BAGIAN E — Review Design System (25 poin)

Digunakan saat me-review `PLAN-DESIGN-SYSTEM.md`.

### E1. Color System (8 poin)

| Item | Poin | Kriteria |
|---|---|---|
| Primary palette (3 shade) | 2 | Hex code valid + CSS token name + use case spesifik |
| Secondary palette (3 shade) | 2 | Hex code valid + CSS token name + use case spesifik |
| Neutral palette (min. 5 shade) | 2 | Termasuk dark, minimal 2 gray variant, dan white |
| Semantic colors (4 warna) | 2 | success, error, warning, info — hex code valid |

> Cross-check: semua hex di Bagian E harus konsisten dengan Section 3 PLAN-GLOBAL.md.

### E2. Typography & Spacing (7 poin)

| Item | Poin | Kriteria |
|---|---|---|
| Typography scale (8 level) | 3 | H1-H4 + body-lg + body + body-sm + caption — dengan size/weight/line-height semua terisi |
| Spacing scale (min. 8 step) | 2 | Berbasis 4px grid, ada token name + value numerik |
| Border radius system (min. 5 level) | 2 | Ada token name + px value + use case per level |

### E3. Layout & Component (10 poin)

| Item | Poin | Kriteria |
|---|---|---|
| Grid system (4 breakpoint) | 3 | Mobile/tablet/desktop/wide — container max-width + jumlah kolom |
| Button variants (min. 3) | 3 | Primary/secondary/ghost — background, text, border, padding, hover state semua terisi |
| Card style lengkap | 2 | Shadow, radius, padding, hover shadow + transform, transition — semua terisi |
| Navbar style | 2 | Background glassmorphism, sticky, height per breakpoint, aturan logo tercantum |

