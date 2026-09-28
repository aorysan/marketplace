# Design: Brand Color Palette di Business-Intelligence-Layer

**Tanggal:** 2026-09-07
**Status:** Disetujui untuk diimplementasi (spec dulu, implementasi menyusul)
**Scope:** Business-Intelligence-Layer saja. Integrasi compro di task terpisah.

## 1. Latar Belakang & Tujuan

Insightify kini mengekstrak warna dari proyek selama intake dan menyimpannya sebagai
tabel `## Colors` (format `| Color | Hex |`) di Product Knowledge Base.

Plugin `business-intelligence-layer` (BI) menghasilkan 3 dokumen Markdown dari
Product Knowledge Base: Business Knowledge Base, Business Audit Report, dan
Brand Story Guide. Saat ini **tidak ada data warna** di mana pun dalam pipeline BI.

**Tujuan:** BI plugin mengambil data warna dari Product Knowledge Base hasil
Insightify, lalu menyimpannya sebagai section di Brand Story Guide, supaya nanti
bisa diambil oleh plugin `compro` (company profile builder).

**Kontrak antar plugin** saat ini adalah file Markdown di folder `input/`.
Brand Story Guide (`input/brand-story-guide.md`) adalah dokumen brand yang paling
natural untuk membawa data warna.

## 2. Keputusan Desain (dikonfirmasi user)

| Aspek | Keputusan |
|-------|-----------|
| Tujuan penyimpanan | Ambil warna dari Insightify, simpan, supaya plugin compro bisa ambil nanti |
| Lokasi simpan | Section baru di `brand-story-guide.md` |
| Mekanisme ambil | LLM baca tabel `## Colors` di Product Knowledge Base, salin ke Brand Story Guide |
| Format | Tabel + mapping peran warna (primary/secondary/accent/text/background) |
| Penentu peran | LLM menentukan peran secara kontekstual (berdasarkan tone, persona, industri) |
| Scope | Hanya BI plugin. Compro diintegrasikan di task terpisah |

## 3. Data Flow

```
Insightify (intake)
  │  ekstrak warna dari proyek
  ▼
Product Knowledge Base
  │  ## Colors  →  | Color | Hex |
  ▼
[brand-story-writer]  ← LLM baca tabel, salin, mapping peran kontekstual
  ▼
Brand Story Guide  →  ## 7. Brand Color Palette
  ▼
plugin compro (nanti, terpisah)
```

## 4. Perubahan pada `brand-story-writer/SKILL.md`

### 4.1 Input (tambah catatan)

Pada bagian Input, tambahkan catatan bahwa Product Knowledge Base dari Insightify
dapat memuat tabel `## Colors` (format `| Color | Hex |`). Jika tabel ini ada di
input, gunakan sebagai sumber data warna. Jika tidak ada, jangan mengarang.

### 4.2 Output template (tambah section baru `## 7. Brand Color Palette`)

Tambahkan komponen baru setelah Tone of Voice:

```md
## 7. Brand Color Palette
[Mapping peran warna brand. Ambil warna dari tabel ## Colors di Product
Knowledge Base. Tentukan peran secara kontekstual berdasarkan analisis brand:
tone of voice, persona target pelanggan, dan industri. JANGAN mengarang warna
yang tidak ada di input.]

| Peran | Warna (sumber) | Hex |
|-------|----------------|-----|
| Primary | [warna spt tercantum di PKB] | #... |
| Secondary | ... | #... |
| Accent | ... | #... |
| Text | ... | ... |
| Background | ... | ... |
```

Catatan:
- Simpan nilai warna mentah persis seperti di Product Knowledge Base beserta hex,
  agar plugin compro fleksibel menentukan pemakaian nanti.
- Semua role tidak wajib terisi; hanya terisi jika ada warna yang sesuai di input.
- Jika input tidak punya tabel warna, isi section dengan
  "Belum tersedia di Product Knowledge Base — perlu divalidasi".

### 4.3 Self-Validation (tambah item)

Tambahkan ke checklist self-validation:

- [ ] **Warna dari input:** Apakah warna di Brand Color Palette diambil dari tabel
  `## Colors` di Product Knowledge Base, dan bukan dikarang? Jika input tidak punya
  tabel warna, apakah section ditandai "Perlu divalidasi"?
- [ ] **Mapping peran konsisten:** Apakah penentuan primary/secondary/accent konsisten
  dengan tone of voice dan persona target pelanggan yang ditentukan sebelumnya?

## 5. Perubahan pada Testing

- Update `tests/rubrics/brand-story-writer-rubric.md`: tambahkan item untuk
  memverifikasi section Brand Color Palette (kelengkapan, sumber dari input,
  konsistensi mapping peran).
- Update fixture `tests/fixtures/product_kb.md` agar menyertakan tabel `## Colors`
  sehingga `run_bi_test.py` dapat menguji section baru.
- Jalankan harness `python tests/run_bi_test.py --skill brand-story-writer`
  untuk verifikasi.

## 6. Sync ke marketplace-local

Perubahan pada `business-intelligence-layer` di workspace `BI` perlu disinkronkan
ke copy kanonik `marketplace-local/business-intelligence-layer` bila ada, mengikuti
pola yang dipakai untuk perubahan lain.

## 7. Error Handling

- **PKB tanpa tabel `## Colors`:** LLM isi section dengan
  "Belum tersedia di Product Knowledge Base — perlu divalidasi". Jangan mengarang.
- **Warna tidak cukup untuk semua peran:** hanya isi role yang ada; sisanya boleh
  kosong atau ditandai perlu divalidasi.
- **Source fel nilai warna ambigu:** salin nilai mentah apa adanya; mapping peran
  tetap kontekstual.

## 8. Testing & Acceptance Criteria

- [ ] `brand-story-writer/SKILL.md` memuat section template `## 7. Brand Color Palette`.
- [ ] Self-validation mencakup cek sumber warna & konsistensi mapping.
- [ ] Rubric `brand-story-writer` menilai section warna.
- [ ] Fixture PKB menyertakan `## Colors`.
- [ ] (Verifikasi manual) output Brand Story Guide dari PKB yang punya warna
      memuat section Brand Color Palette yang terisi dari input.
