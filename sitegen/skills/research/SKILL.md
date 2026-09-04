---
name: research
description: Melakukan riset mendalam tentang kebutuhan user dan analisis kompetitor berdasarkan data intake. Dipanggil setelah intake dan sebelum brainstorming. Menghasilkan PLAN-USER-NEEDS.md dan PLAN-COMPETITOR.md.
---

# Sitegen Research Skill

> [!CAUTION]
> **MANDATORY CONSTITUTIONAL BINDING**: Sebelum melakukan analisa riset pasar dan kompetitor, Anda WAJIB MEMBACA DAN MEMATUHI file konstitusi `AGENTS.md` di folder ini (`AGENTS.md`). Larangan halusinasi data kompetitor dan kewajiban web search riil bersifat mutlak.

Panduan Operasional Sub-skill Research: Agen ini bertugas menghasilkan 2 dokumen riset yang menjadi fondasi planning selanjutnya. Agen ini TIDAK merancang halaman atau menulis kode. Agen hanya melakukan riset berbasis data dan web search.

## STEP 1 — Baca Data Intake

Baca file `landings/<brand>/intake/intake_compro.md`. Identifikasi dan catat:
- Industri bisnis utama
- Target audience yang disebutkan
- Layanan/produk yang dijual
- Geografi target market (kota/region/nasional)
- Nama brand dan tagline jika ada

---

## STEP 2 — User Needs Analysis

Buat file `landings/<brand>/planning/PLAN-USER-NEEDS.md`.
Gunakan template `planner/reference/prd-user-needs-template.md` sebagai panduan format output.

### Yang harus ada di PLAN-USER-NEEDS.md:

#### 2.1. Profil Psikografis Target User
- Nilai, gaya hidup, dan aspirasi target user di industri ini
- Sumber: inferensi dari data intake **+** web search tentang target pasar industri tersebut
- Harus spesifik untuk industri dan segmen yang tercantum di intake

#### 2.2. Pain Points Utama (min. 5)
- Masalah nyata yang dihadapi target user — bukan asumsi generik
- Format per item:
  - `pain_point`: deskripsi masalah spesifik
  - `intensitas`: tinggi / sedang / rendah
  - `relevansi_ke_layanan`: bagaimana layanan brand ini menjawabnya

#### 2.3. Jobs-to-be-Done (JTBD) — min. 3 statements
- Apa yang user ingin "selesaikan" dengan menggunakan layanan brand ini
- Format wajib: **"Ketika [situasi], saya ingin [motivasi], agar [hasil yang diharapkan]."**

#### 2.4. Objection & Hambatan Pembelian (min. 3)
- Apa yang biasa mencegah target user dari membeli (harga, kepercayaan, alternatif, waktu, dll)
- Setiap objection WAJIB disertai **counter-messaging yang direkomendasikan** — yakni cara konkret menjawabnya di website

#### 2.5. FAQ Pra-Pembelian (min. 5)
- Pertanyaan yang biasa diajukan target user SEBELUM memutuskan membeli
- Sertakan jawaban singkat + rekomendasi halaman/section di website yang paling tepat untuk menjawabnya

#### 2.6. User Journey (5 tahap)
Petakan tahapan user dari awal mengenal hingga memutuskan beli:
- Aware → Interest → Consideration → Intent → Purchase
- Untuk setiap tahap isi: channel utama yang digunakan, konten yang mereka cari, dan section website yang paling relevan

#### 2.7. Trigger Pembelian (min. 3)
- Kejadian atau situasi spesifik yang memicu target user mencari solusi ini SEKARANG (bukan kapan-kapan)
- Harus kontekstual dan realistis sesuai industri

**Prinsip:**
- Gunakan web search untuk mendapatkan insight nyata tentang target pasar industri ini
- DILARANG membuat asumsi generik seperti "mereka ingin solusi yang baik" atau "mereka menginginkan kualitas terbaik"
- Setiap insight HARUS spesifik, kontekstual, dan actionable
- Anti-AI Slop: DILARANG emoji, DILARANG placeholder `[...]`

---

## STEP 3 — Competitor Analysis

Buat file `landings/<brand>/planning/PLAN-COMPETITOR.md`.
Gunakan template `planner/reference/prd-competitor-template.md` sebagai panduan format output.

### Yang harus ada di PLAN-COMPETITOR.md:

#### 3.1. Identifikasi Kompetitor (min. 3)
- Lakukan web search dengan query seperti: `"[industri] [kota/region target] terbaik"` atau `"jasa [industri] [kota]"`
- Pilih min. 3 kompetitor paling relevan berdasarkan hasil pencarian
- Per kompetitor: nama bisnis, URL website, estimasi ukuran bisnis (besar/menengah/kecil)

#### 3.2. Analisis per Kompetitor
Untuk **setiap** kompetitor, dokumentasikan:
- **Positioning**: tagline/klaim utama mereka dan target audience yang mereka sasar
- **Kekuatan (3 poin)**: hal terkuat dari website atau penawaran mereka
- **Kelemahan (3 poin)**: hal yang kurang atau bisa dieksploitasi
- **Section & fitur website**: section apa saja yang ada, fitur interaktif (booking form, chatbot, kalkulator, dll), elemen visual menonjol
- **Tone of voice**: formal/casual, teknikal/sederhana, kata kunci dominan yang digunakan
- **Keyword SEO**: buying keyword utama yang mereka kejar (observasi dari title tag dan meta description)

#### 3.3. Gap Analysis — Peluang Diferensiasi
Berdasarkan analisis seluruh kompetitor, identifikasi:
- Apa yang **TIDAK dimiliki semua kompetitor** tapi bisa menjadi keunggulan brand ini?
- Di section mana website brand ini bisa lebih unggul?
- Keyword gap: keyword berharga yang belum dikuasai oleh kompetitor?
- Minimal **3 gap konkret** dengan rekomendasi cara eksploitasinya

**Prinsip:**
- Gunakan web search untuk mengobservasi website kompetitor
- Jika website tidak dapat diakses, gunakan snippet hasil pencarian sebagai data
- DILARANG mengarang nama kompetitor atau data yang tidak dapat diverifikasi
- Anti-AI Slop: DILARANG kalimat generik tanpa basis observasi nyata

---

## Output Akhir

Setelah kedua file selesai dibuat, laporkan ke master orkestrator:
- Path `PLAN-USER-NEEDS.md`
- Path `PLAN-COMPETITOR.md`
- Ringkasan singkat: industri yang dianalisis, jumlah kompetitor yang ditemukan, dan 3 gap terpenting
