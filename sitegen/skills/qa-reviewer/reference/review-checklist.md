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
| Seluruh halaman terpetakan | 5 | Semua halaman (dari PRD) ada di tabel keyword |
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

**Skor minimum lolos: 90/100**
**Batas revisi: 2 putaran**
