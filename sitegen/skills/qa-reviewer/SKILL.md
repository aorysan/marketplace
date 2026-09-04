---
name: qa-reviewer
description: Me-review planning dan kode yang dihasilkan planner/generator. Mendukung 4 mode (global, page, global-extended, dan code-review). Review per halaman memuat 2 dimensi: Business Review dan Technical Review. Skor 0-100, threshold ≥90.
---

# Sitegen QA Reviewer — Adaptive Quality Gate

> [!CAUTION]
> **MANDATORY CONSTITUTIONAL BINDING**: Sebelum melakukan review, Anda WAJIB MEMBACA DAN MEMATUHI file konstitusi `AGENTS.md` di folder ini (`AGENTS.md`). Prinsip *Zero Tolerance* terhadap cacat Strict Slug, foto rusak/fiktif, dan kehilangan atribut SEO ganda bersifat mutlak.

Panduan Operasional Sub-skill QA-Reviewer: Agen ini bertugas menjadi **Quality Gate** untuk planning dan kode. Agen beroperasi dalam 4 mode.

## Mode Operasi

### MODE 1: `global`
Review planning global (`PLAN-GLOBAL.md`).

**Input:**
- File planning global: `landings/<brand>/planning/PLAN-GLOBAL.md`
- Data intake asli: `landings/<brand>/intake/final_intake.md`

**Output:**
- File: `landings/<brand>/planning/QA-REVIEW-GLOBAL.md`

**Yang di-review:**
Gunakan **Bagian A** dari rubrik `reference/review-checklist.md`.

---

### MODE 2: `page`
Review planning per halaman (`PLAN-<halaman>.md`).

**Input:**
- File planning halaman: `landings/<brand>/planning/PLAN-<halaman>.md`
- Planning global: `landings/<brand>/planning/PLAN-GLOBAL.md` (untuk cross-check konsistensi)
- Data intake asli: `landings/<brand>/intake/final_intake.md`

**Output:**
- File: `landings/<brand>/planning/QA-REVIEW-<halaman>.md`

**Yang di-review:**
Gunakan **Bagian B** dari rubrik `reference/review-checklist.md`.
Laporan HARUS memuat 2 section:
1. **Business Review** — cek kesesuaian konten dengan PDF, value proposition, branding, **copywriting quality (copyfitting, tone, konversi)**
2. **Technical Review** — cek section types, data konten, SEO, carousel, schema.org

---

### MODE 3: `global-extended`
Review semua dokumen planning sekaligus, termasuk 3 dokumen baru dari skill `research` dan planner mode `design-system`.

**Input:**
- `landings/<brand>/planning/PLAN-GLOBAL.md`
- `landings/<brand>/planning/PLAN-USER-NEEDS.md`
- `landings/<brand>/planning/PLAN-COMPETITOR.md`
- `landings/<brand>/planning/PLAN-DESIGN-SYSTEM.md`
- `landings/<brand>/intake/final_intake.md`

**Output:**
- File: `landings/<brand>/planning/QA-REVIEW-EXTENDED.md`

**Yang di-review:**
- Bagian A (existing) untuk `PLAN-GLOBAL.md` — threshold ≥ 90/100
- Bagian C (baru) untuk `PLAN-USER-NEEDS.md`
- Bagian D (baru) untuk `PLAN-COMPETITOR.md`
- Bagian E (baru) untuk `PLAN-DESIGN-SYSTEM.md`
- Subtotal Bagian C+D+E — threshold ≥ 60/75

**Cross-Check Konsistensi antar Dokumen (wajib dicek semuanya):**
1. Apakah pain points dari `PLAN-USER-NEEDS` ter-address di section halaman yang relevan (problem/faq/cta)?
2. Apakah gap dari `PLAN-COMPETITOR` dieksploitasi dalam copywriting atau pemilihan section halaman?
3. Apakah color token di `PLAN-DESIGN-SYSTEM` konsisten (hex sama) dengan `PLAN-GLOBAL` Section 3?
4. Apakah font heading & body di `PLAN-DESIGN-SYSTEM` sama dengan `PLAN-GLOBAL`?
5. Apakah objection user dari `PLAN-USER-NEEDS` ter-cover oleh FAQ section atau counter-messaging di halaman relevan?

**Format Output tambahan untuk mode ini — QA-REVIEW-EXTENDED.md:**

```
# QA Review Report — Global Extended — [Nama Brand]

**Tanggal Review**: [YYYY-MM-DD]
**Reviewer**: QA Reviewer Skill (Automated)
**Mode**: Global Extended

---

## A. Review PLAN-GLOBAL — [XX]/100 — [PASS/REVISI]
[Gunakan format output Mode Global yang sudah ada]

---

## C. Review User Needs (PLAN-USER-NEEDS.md) — [XX]/25
| # | Kategori | Bobot | Skor | Status |
|---|---|---|---|---|
| C1 | Kelengkapan Struktur | 10 | [XX]/10 | [OK/KURANG] |
| C2 | Kedalaman Insight | 10 | [XX]/10 | [OK/KURANG] |
| C3 | Anti-Generik | 5 | [XX]/5 | [OK/KURANG] |

[Detail per item]

---

## D. Review Competitor Analysis (PLAN-COMPETITOR.md) — [XX]/25
| # | Kategori | Bobot | Skor | Status |
|---|---|---|---|---|
| D1 | Kelengkapan Kompetitor | 10 | [XX]/10 | [OK/KURANG] |
| D2 | Kedalaman Analisis | 10 | [XX]/10 | [OK/KURANG] |
| D3 | Akurasi Data | 5 | [XX]/5 | [OK/KURANG] |

[Detail per item]

---

## E. Review Design System (PLAN-DESIGN-SYSTEM.md) — [XX]/25
| # | Kategori | Bobot | Skor | Status |
|---|---|---|---|---|
| E1 | Color System | 8 | [XX]/8 | [OK/KURANG] |
| E2 | Typography & Spacing | 7 | [XX]/7 | [OK/KURANG] |
| E3 | Layout & Component | 10 | [XX]/10 | [OK/KURANG] |

[Detail per item]

---

## F. Cross-Check Konsistensi antar Dokumen
1. Pain points ter-address di halaman: [OK/KURANG — sebutkan yang belum]
2. Gap kompetitor dieksploitasi: [OK/KURANG — sebutkan yang terlewat]
3. Color token konsisten: [OK/KURANG — sebutkan perbedaan hex jika ada]
4. Font konsisten: [OK/KURANG]
5. Objection user ter-cover: [OK/KURANG — sebutkan yang belum]

---

## Keputusan Final
| Dokumen | Skor | Threshold | Status |
|---|---|---|---|
| PLAN-GLOBAL | [XX]/100 | ≥ 90 | [PASS/REVISI] |
| Subtotal C+D+E | [XX]/75 | ≥ 60 | [PASS/REVISI] |
| **STATUS KESELURUHAN** | | | **[PASS / REVISI]** |

## Feedback Revisi (jika ada yang REVISI)
[Instruksi revisi spesifik per dokumen yang tidak lolos]
```

---

### MODE 4: `code-review`
Review hasil KODE eksekusi halaman di Next.js terhadap PRD.

**Input:**
- File PRD halaman: `landings/<brand>/planning/PLAN-<halaman>.md`
- File Kode: `landings/<brand>/web/app/<slug>/page.tsx` dan komponen terkait di `web/components/`
- Asset Mapping: `landings/<brand>/planning/ASSET-MAPPING.md`

**Output:**
- File: `landings/<brand>/reports/QA-CODE-<halaman>.md`

**Yang di-review:**
1. **Strict Slug & Struktur**: Apakah nama komponen dan slug URL 100% kongruen dengan PRD.
2. **Kesesuaian Fitur & Section**: Cek kehadiran semua section dari PRD di dalam file kode.
3. **Pengecekan Atribut Logo & Gambar**: Verifikasi bahwa `<Image>` memanggil path yang benar dari folder `public/assets/` sesuai `ASSET-MAPPING.md` dan memiliki `alt` & `title`.
4. **Instruksi Revisi**: Hasilkan instruksi baris-per-baris untuk generator jika ada pelanggaran.

---

## Prinsip Review (JANGAN DILANGGAR)

1. **Objektif dan Terukur.** Setiap poin penilaian merujuk ke item spesifik di rubrik. Cek satu per satu.
2. **Cross-Check dengan Data Intake.** Bandingkan konten planning dengan data asli dari intake. Kalimat persuasi yang hilang = kesalahan.
3. **Cross-Check dengan Generator.** Pastikan section types yang dipakai ada dalam daftar yang didukung generator.
4. **Cross-Check dengan PLAN-GLOBAL.** (Khusus mode page) Pastikan keyword, URL, dan branding konsisten dengan planning global.
5. **Cek Copywriting Quality.** Verifikasi batas karakter (copyfitting), tone of voice, dan standar penulisan konversi sesuai aturan yang diadopsi dari LPG.
6. **Feedback Revisi Harus Spesifik.** Sebutkan PERSIS apa yang kurang, di section mana, dan apa yang harus ditambah/diubah.
7. **Batas Revisi (Eskalasi):** Serahkan kendali batas iterasi kepada Orkestrator. QA hanya memberikan feedback perbaikan spesifik.
8. **Cross-Check Konsistensi (mode global-extended).** Verifikasi bahwa pain points, gap kompetitor, token warna, dan objection user saling terhubung secara kohesif antar semua dokumen planning.


## Workflow Eksekusi

### STEP 1 — Baca Planning
Baca file planning yang akan di-review (PLAN-GLOBAL atau PLAN-<halaman>).

### STEP 2 — Siapkan Rubrik
Buka `reference/review-checklist.md`. Pilih bagian yang relevan:
- Mode global → Bagian A
- Mode page → Bagian B

### STEP 3 — Penilaian
Cek setiap item di rubrik satu per satu. Beri skor per item.

Khusus mode page, pisahkan penilaian menjadi:
- **Business Review**: konten sesuai PDF, value prop, branding consistency, **copywriting quality**
- **Technical Review**: section types, data konten, SEO, carousel, schema.org

### STEP 4 — Hitung Skor
Jumlahkan skor semua item. Total = 100 poin.

### STEP 5 — Tulis Laporan
Simpan laporan ke file output sesuai mode.

### STEP 6 — Keputusan
- Skor ≥ 90: STATUS = PASS
- Skor < 90: STATUS = REVISI + feedback spesifik

## Format Output — Mode Global

---

# QA Review Report — Global Planning — [Nama Brand]

**Tanggal Review**: [YYYY-MM-DD]
**File Planning**: `landings/<brand>/planning/PLAN-GLOBAL.md`
**Reviewer**: QA Reviewer Skill (Automated)
**Mode**: Global

---

## Skor: [XX]/100 — [PASS / REVISI]

---

## Breakdown Skor

| # | Kategori | Bobot | Skor | Status |
|---|---|---|---|---|
| 1 | Kelengkapan Branding | 20 | [XX]/20 | [OK/KURANG] |
| 2 | SEO Keyword Mapping | 25 | [XX]/25 | [OK/KURANG] |
| 3 | Value Proposition Inventory | 25 | [XX]/25 | [OK/KURANG] |
| 4 | Data Perusahaan & Footer | 15 | [XX]/15 | [OK/KURANG] |
| 5 | Anti-AI Slop | 15 | [XX]/15 | [OK/KURANG] |
| | **TOTAL** | **100** | **[XX]/100** | **[PASS/REVISI]** |

---

## Detail Penilaian
[Detail per kategori]

---

## Feedback Revisi (jika skor < 90)
[Instruksi revisi spesifik]

---

## Format Output — Mode Page

---

# QA Review Report — [Nama Halaman] — [Nama Brand]

**Tanggal Review**: [YYYY-MM-DD]
**File Planning**: `landings/<brand>/planning/PLAN-<halaman>.md`
**Reviewer**: QA Reviewer Skill (Automated)
**Mode**: Page

---

## Skor: [XX]/100 — [PASS / REVISI]

---

## A. Business Review — [XX]/60

| # | Item | Bobot | Skor | Status |
|---|---|---|---|---|
| B1 | Konten Berdasar PDF | 12 | [XX]/12 | [OK/KURANG] |
| B2 | Value Proposition Tercantum | 12 | [XX]/12 | [OK/KURANG] |
| B3 | Branding Consistency | 8 | [XX]/8 | [OK/KURANG] |
| B4 | Anti-AI Slop | 8 | [XX]/8 | [OK/KURANG] |
| B5 | Copywriting Quality | 12 | [XX]/12 | [OK/KURANG] |
| B6 | Messaging & Konversi | 8 | [XX]/8 | [OK/KURANG] |

### Detail Business Review
[Detail per item]

---

## B. Technical Review — [XX]/40

| # | Item | Bobot | Skor | Status |
|---|---|---|---|---|
| T1 | Section Types Valid | 8 | [XX]/8 | [OK/KURANG] |
| T2 | Data Konten Lengkap | 12 | [XX]/12 | [OK/KURANG] |
| T3 | SEO Compliance | 8 | [XX]/8 | [OK/KURANG] |
| T4 | Video SMO & Schema.org | 6 | [XX]/6 | [OK/KURANG] |
| T5 | Carousel Rule | 6 | [XX]/6 | [OK/KURANG] |

### Detail Technical Review
[Detail per item]

---

## Bonus Points (jika ada)
[Bonus berdasar tipe halaman]

---

## Feedback Revisi (jika skor < 90)
1. **[Business/Technical]**
   - **Root Cause / Masalah:** `[Deskripsi detail mengapa planning/konten tidak memenuhi spesifikasi]`

---
