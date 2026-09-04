# Improve Business Intelligence Layer Plugin - Design Spec

**Date:** 2026-09-03
**Status:** Draft (needs review)
**Branch:** improvement
**Context:** Plugin `business-intelligence-layer` sudah berjalan dengan 3 skill (business-strategist, business-strategist-reviewer, brand-story-writer). Testing awal menunjukkan kualitas isi tinggi tapi ada masalah konsistensi struktural (Claude CLI pertama menghasilkan ringkasan, bukan template lengkap) dan kurangnya mekanisme self-validation di dalam skill.

---

## 1. Latar Belakang & Masalah

### Masalah Utama
1. **Output tidak selalu mengikuti template** — Claude CLI pertama menghasilkan ringkasan (3,128 chars), bukan template lengkap (11,140 chars). Setelah di-reprompt eksplisit, menghasilkan output lengkap. Ini menunjukkan instruction saja tidak cukup untuk enforce konsistensi.
2. **Tidak ada self-validation di dalam skill** — Skill langsung menghasilkan output tanpa cek: "apakah semua section terisi?" atau "apakah ada klaim yang tidak didukung?".
3. **Chain dependency tidak eksplisit** — Brand story writer bisa generate meski BKB belum di-review atau ada section kosong.
4. **Test hanya single-run** — Belum bisa measure konsistensi berulang.

### Tujuan Perbaikan
- Memperbaiki konsistensi output struktural: setiap skill menghasilkan output lengkap sesuai template, bukan ringkasan.
- Menambah self-validation step di setiap skill sebelum output akhir.
- Memperjelas chain dependency antara skill.
- Menyiapkan dasar untuk test konsistensi yang bisa diulang.

---

## 2. Pendekatan

### Prinsip
- **Self-validation sebagai enforcement utama** — bukan bergantung pada model "mau ikut template atau tidak", tapi memberi langkah eksplisit di dalam skill untuk cek output sebelum final.
- **Instruction yang lebih tegas** — perbaiki root cause perilaku ringkasan dengan "no summary" instruction.
- **Chain awareness** — skill yang bergantung pada output skill lain harus eksplisit cek kelengkapan input.

### Yang Tidak Masuk Scope (untuk saat ini)
- **Multi-run consistency test** — tertunda, bisa masuk nanti saat test harness diimprove.
- **Input validation otomatis** — tertunda, kompleks karena butuh parse input.
- **Structured output (JSON)** — ditolak, risiko output jadi kaku dan kurang natural.

---

## 3. Perbaikan per Skill

### 3.1 business-strategist

#### Perubahan di SKILL.md

**A. Self-validation step**

Tambahkan di bagian instructions, sebelum "Output Template":

```
## Self-Validation (lakukan sebelum output akhir)

Sebelum menyelesaikan output, lakukan checklist berikut dan perbaiki jika ada yang gagal:

- [ ] **Kelengkapan:** Apakah semua 10 section terisi? Jika ada section yang kosong atau hanya 1-2 kalimat, isi dengan konten yang lebih substantive. Jika benar-benar tidak ada data, tandai sebagai "Belum bisa diisi — perlu divalidasi" dan jelaskan apa data yang dibutuhkan.
- [ ] **Tidak ada ringkasan:** Apakah output adalah analisis lengkap sesuai template, BUKAN ringkasan atau overview dari analisis? Jika hanya ringkasan, regenerate dengan mengisi semua section.
- [ ] **Tidak ada klaim angka tanpa label:** Apakah setiap angka, estimasi, atau proyeksi memiliki label "Asumsi" atau "Estimasi"? Jika ada angka tanpa label, tambahkan labelnya.
- [ ] **USP dibedakan dari fitur:** Apakah USP secara eksplisit dibedakan dari fitur yang bisa diklaim kompetitor? Jika USP hanya sebut fitur, perbaiki dengan menjelaskan mengapa fitur tersebut menjadi unik dalam konteks positioning.
- [ ] **Tidak ada kontradiksi internal:** Apakah ada kontradiksi antara section (mis. target persona tapi pricing tidak cocok, positioning tapi value proposition bertentangan)? Jika ada, perbaiki.
- [ ] **Konsistensi dengan input:** Apakah analisis berbasis pada input yang diberikan, bukan asumsi yang tidak disebutkan? Jika ada asumsi baru yang tidak didukung input, tandai.
```

**B. "No summary" instruction (file terpisah)**

Buat file terpisah `skills/business-strategist/no-summary-instruction.md` berisi:

```
# No-Summary Instruction untuk Business Strategist

PERHATIAN: Jangan berikan ringkasan, overview, atau summary dari analisis. Output HARUS berisi analisis lengkap untuk SEMUA 10 section sesuai template. Jika Anda hanya memberikan ringkasan, itu dianggap tidak lengkap dan harus diperbaiki.

Skill ini menghasilkan analisis lengkap — bukan ringkasan. Jika pengguna meminta ringkasan, tawarkan untuk generate analisis lengkap dulu baru kemudian dibuatkan ringkasan dari analisis tersebut.
```

Referensi file ini dari SKILL.md dengan menambahkan baris:

```
Lihat juga: [no-summary-instruction.md](./no-summary-instruction.md) untuk peringatan penting tentang output format.
```

tempat yang tepat adalah setelah bagian "Input yang Dibutuhkan" atau di awal section "Tugas Analisis".

#### Output Rubric Check (tambah di rubric evaluator)
N/A - tidak ada perubahan di rubric, tapi hasil output seharusnya lebih consistent secara struktural.

---

### 3.2 business-strategist-reviewer

#### Perubahan di SKILL.md

**A. Self-validation step**

Tambahkan sebelum output:

```
## Self-Validation (lakukan sebelum output akhir)

- [ ] **Kelengkapan:** Apakah semua 5 section terisi dengan analisis substantif? Jika ada yang kosong atau hanya pernyataan dangkal, perbaiki.
- [ ] ** Tidak merangkum ulang:** Apakah output adalah analisis kritis (menemukan kelemahan, asumsi belum valid, risiko) dan bukan sekadar merangkum Business Knowledge Base? Jika hanya rangkuman, tambahkan analisis kritis.
- [ ] **Rujukan ke bagian spesifik:** Apakah setiap kelemahan/keunggulan yang disebut merujuk ke bagian spesifik di BKB? Jika tidak, tambahkan rujukan.
- [ ] **Konsistensi dengan BKB:** Apakah reviewer menemukan kontradiksi atau inkonsistensi dalam BKB? Jika BKB tidak ada masalah yang ditemukan, katakan mengapa (mis. "BKB cukup konsisten, tidak ada kontradiksi yang ditemukan").
- [ ] **Rekomendasi actionable:** Apakah tiap rekomendasi perbaikan konkret (bukan "perkuat analisis")? Jika masih general, spesifikkan.
```

**B. Chain input validation**

Tambahkan di bagian Input:

```
Jika Business Knowledge Base yang diberikan tidak lengkap (ada section yang kosong, tidak ada USP yang jelas, atau tidak ada rekomendasi go/no-go), TANYAKAN kepada pengguna sebelum melakukan review. Jangan review BKB yang tidak lengkap — hasil review akan tidak akurat.

Contoh pertanyaan: "Business Knowledge Base yang Anda berikan tidak memiliki section [X]. Sebelum saya review, apakah Anda ingin saya bantu generate section tersebut terlebih dahulu, atau Anda punya versi yang lebih lengkap?"
```

---

### 3.3 brand-story-writer

#### Perubahan di SKILL.md

**A. Self-validation step**

Tambahkan sebelum output:

```
## Self-Validation (lakukan sebelum output akhir)

- [ ] **Kelengkapan:** Apakah semua 6 section terisi? Brand narrative, core message, key claims, tone of voice, messaging pillars, elevator pitch — semuanya harus ada.
- [ ] **Konsistensi dengan BKB:** Apakah persona, USP, dan positioning yang digunakan di brand story konsisten dengan Business Knowledge Base? Jika ada perbedaan, cek ulang dan perbaiki.
- [ ] **Tidak overclaim:** Apakah ada klaim yang bertentangan dengan kelemahan yang ditemukan di Business Audit Report? Jika ada, hapus atau tandai sebagai "klaim aspirasional" dengan penjelasan.
- [ ] **Klaim didukung:** Apakah setiap key claim memiliki dasar di Business Knowledge Base atau Audit Report? Jika ada klaim tanpa dukungan, tambahkan catatan "asumsi" atau hapus.
- [ ] **Tidak generic:** Apakah brand story terasa spesifik untuk produk ini dan tidak seperti template marketing umum? Jika terasa generic, perbaiki dengan memasukkan detail spesifik dari BKB/Audit.
- [ ] **Catatan konsistensi:** Apakah bagian "Catatan Konsistensi" diisi dengan explisit menyebutkan klaim yang diadopsi dari BKB/Audit dan bagaimana brand story tetap jujur terhadap kelemahan?
```

**B. Konsistensi check eksplisit**

Tambahkan di akhir instruction:

```
Sebelum final output, lakukan cross-check:
1. Bandingkan persona di BKB dengan persona yang digunakan di brand story — sama?
2. Bandingkan USP di BKB dengan klaim di brand story — USP yang sama atau turunannya?
3. Cek apakah ada klaim di brand story yang bertentangan dengan poin "Apa yang Lemah" atau "Apa yang Belum Valid" di Audit Report.
4. Jika ada inkonsistensi, perbaiki atau tandai sebagai asumsi.
```

---

## 4. Test Harness Improvement (Tertunda)

### Yang sudah ada
- Fixture untuk 1 scenario (InventFlow)
- 3 rubric (satu per skill)
- Script `run_bi_test.py` dengan mode manual dan auto

### Yang perlu ditambah (future)
1. **Multi-run consistency test** — Generate output beberapa kali dengan input sama, evaluate semua, bandingkan skor rubric. Jika skor variasi tinggi, ada masalah konsistensi.
2. **Automated rubric scoring** — Gunakan LLM evaluator (bukan manual) untuk scoring checklist. Skrip bisa meminta evaluator model lain untuk menilai output berdasarkan rubric.
3. **Scenario coverage** — Tambah 1-2 scenario lain selain InventFlow untuk test coverage lebih luas.

### Ketentuan tertunda
Karena improvement ini tidak mengubah skill behavior secara langsung, tertunda sampai:
- Perbaikan skill (self-validation, no-summary, chain validation) sudah dilakukan dan di-test
- Test harness perlu diimprove untuk measure dampak perbaikan

---

## 5. Prioritas & Urutan Pengerjaan

### Tingkat 1 (high impact, low effort)
1. **Self-validation step di business-strategist** — langsung mempengaruhi kualitas output skill pertama dalam chain.
2. **"No summary" instruction** — perbaiki root cause perilaku ringkasan. Pisah jadi file terpisah `no-summary-instruction.md` yang di-referensikan dari SKILL.md.
3. **Self-validation step di business-strategist-reviewer** — reviewer jadi lebih konsisten menemukan kelemahan.

### Tingkat 2 (high impact, menengah effort)
4. **Self-validation + cross-check step di brand-story-writer** — termasuk chain consistency check.

### Tingkat 3 (future)
5. **Multi-run consistency test** — setelah skill diimprove, test apakah konsistensi memang membaik.
6. **Automated rubric scoring** — perlu setup evaluator terpisah.
7. **Scenario coverage** — perlu buat fixture tambahan.

---

## 6. Risiko & Mitigation

| Risiko | Dampak | Mitigation |
|--------|--------|------------|
| Self-validation membuat skill lebih panjang dan kompleks | Model mungkin skip langkah self-validation jika instruction terlalu panjang | Simpan checklist self-validation di tempat yang mudah ditemukan (near output instruction), bukan di bagian yang tersembunyi |
| 'No summary' instruction terlalu tegas bisa membuat model overthinking | Output jadi berlebihan atau tangential | Pisah jadi file terpisah `no-summary-instruction.md` yang di-referensikan dari SKILL.md, jadi gampang diupdate tanpa menyentuh SKILL.md utama |
| Self-validation tidak dieksekusi oleh model | Tidak ada enforcement nyata | Possible future: tambahkan post-processing validation di test harness untuk cek apakah self-validation muncul di output |

---

## 7. Success Criteria

Setelah perbaikan diimplementasikan, success criteria yang bisa diukur:

1. **Konsistensi struktural:** 3 kali generate dengan input sama, semua menghasilkan output lengkap sesuai template (semua section terisi).
2. **Tidak ada ringkasan:** 0 dari N generate yang hanya menghasilkan ringkasan/overview.
3. **Chain consistency:** Brand story writer tidak menghasilkan klaim yang bertentangan dengan audit report (jika audit tersedia).
4. **Self-validation tercermin:** Output mencerminkan self-validation (mis. section "Belum bisa diisi" muncul jika memang tidak ada data).

---

## 8. File yang Akan Diubah

- `skills/business-strategist/SKILL.md` — tambah self-validation checklist, tambah referensi ke `no-summary-instruction.md`
- `skills/business-strategist/no-summary-instruction.md` — **CREATE**: file terpisah berisi "no summary" instruction
- `skills/business-strategist-reviewer/SKILL.md` — tambah self-validation checklist + chain input validation
- `skills/brand-story-writer/SKILL.md` — tambah self-validation checklist + cross-check checklist (TANPA chain input validation)
- `.claude-plugin/plugin.json` — naikkan version ke 1.1.0

---

## 9. Review Notes

(Reviewer: isi setelah review spec ini)

- [ ] Apakah self-validation checklist cukup atau terlalu panjang?
- [ ] Apakah "no summary" instruction sudah cukup tegas?
- [ ] Apakah chain dependency eksplisit sudah tepat atau terlalu kaku?
- [ ] Apakah ada improvement lain yang terlewat?
