# Pipeline Improvements Backlog (Non-Design)
> Dokumen resmi daftar perbaikan bug teknis, architectural debt, dan rencana refactoring pipeline plugin Compro.
> Tanggal Audit: 22 September 2026

---

## 🔴 Bugs Kritis (Penyebab Utama Output "Amburadul")

### BUG-1: Dual Classifier Divergence (ROOT CAUSE)
Ada **DUA classifier berbeda** yang jalan di pipeline yang sama, dan keduanya **tidak sinkron**:

| Classifier | File | Dipakai Untuk |
|---|---|---|
| `classifyCanvaArchetype()` | `skills/builder/scripts/build-deck.js:1481` | Asset pipeline (download gambar) & slot resolution |
| `classifyModernArchetype()` | `skills/builder/scripts/themes/modern.js:35` | Rendering HTML slide |

- **Dampak**: Gambar yang di-download untuk satu slot tidak terpakai atau terbalik saat di-render karena nama dan logika archetypenya berbeda (Canva era vs Modern era).

### BUG-2: Tiga Detector Slide Type Tumpang Tindih
1. `detectSlideType()` (`build-deck.js:311`) — hanya dipakai di `build.log`.
2. `classifyCanvaArchetype()` (`build-deck.js:1481`) — dipakai asset pipeline.
3. `classifyModernArchetype()` (`modern.js:35`) — dipakai renderer.
Ketiganya memiliki keyword matching yang berbeda sehingga satu slide bisa dikira 3 tipe berbeda.

### BUG-3: Mega-monolith 2568 baris dengan ~1400 Baris Dead Code
`build-deck.js` berisi ~1400 baris kode Canva/Editorial/Dark-mode legacy yang tidak pernah dipanggil oleh runtime aktif (`modern.js`), namun memakan token LLM (~28k tokens) dan membingungkan agent saat melakukan perbaikan.

### BUG-4: Fungsi `inline()` Terduplikasi
Ada 2 fungsi `inline()` terpisah di `build-deck.js:301` dan `modern.js:19`. Jika salah satu diedit, terjadi drift sanitasi HTML escaping.

### BUG-5: Brand Color Hardcoded Fallback ke "Venturo Pro"
Fallback brand extraction (`build-deck.js:2282`) hardcoded ke `"Venturo Pro"`, `#009BAD`, `#006D79`. Jika regex nama brand gagal, profil perusahaan lain akan di-label Venturo Pro.

---

## 🟡 Architectural Debt

### DEBT-1: SKILL.md Instruksi Kontradiktif Antar File
- Orchestrator `SKILL.md` menyebut tema default adalah "Canva Editorial".
- Builder `SKILL.md` punya 71 baris instruksi Canva yang sudah deprecated.
- Template nyata yang aktif adalah `modern`.
- Agent yang membaca instruksi ini menjadi bingung dan menghasilkan output yang tidak konsisten.

### DEBT-2: `design-tokens.md` Memiliki Token Dark-Mode Legacy
Terdapat 2 set token saling bertabrakan: token light-deck (aktif) dan token dark-deck legacy (deprecated tapi terbaca oleh LLM).

### DEBT-3: CSS Token Definisi vs Pemakaian Mismatch
Nama custom property di `theme.css` tidak cocok dengan instruksi di `SKILL.md` (misal `--canvas-bg` vs `--canvas-surface`).

### DEBT-4: Test Suite Gagal (Terbukti di Golden Test)
Test `test-modern-golden.js` **FAIL** dengan error:
`FAIL: local SVG img reference found`
- Asset pipeline melebihi budget (24.2s vs limit 15s).
- 5 dari 8 slot fallback ke SVG.
- Fallback SVG di-link sebagai `<img src="assets/*.svg">` alih-alih di-inline, melanggar rule internal.

### DEBT-5: Writer vs Builder Word Count Conflict
Writer menargetkan 40-60 kata, namun splitter hanya memotong pada >60 kata. Slide dengan <40 kata tidak ditolak oleh Reviewer, menyebabkan slide sering kosong/sparse.

---

## 🟢 Actionable Improvement Plan (Daftar Tindakan)

1. **[P0] Unifikasi Classifier**: Hapus `classifyCanvaArchetype` dan `detectSlideType`. Ekspor `classifyModernArchetype` sebagai single source of truth untuk classifier di asset pipeline, build log, dan renderer.
2. **[P0] Pembersihan Dead Code**: Buang seluruh 1400 baris renderer Canva & Editorial legacy dari `build-deck.js`.
3. **[P1] Modularisasi build-deck.js**: Pecah menjadi `markdown-parser.js`, `asset-pipeline.js`, dan `build-main.js`.
4. **[P1] Sinkronisasi SKILL.md**: Hapus semua rujukan Canva Salford & Co., sesuaikan dengan design system baru.
5. **[P2] Robust Brand Extractor**: Implementasikan fallback chain ekstraksi nama dan warna brand dari input markdown.
6. **[P2] Perbaikan Fallback SVG Inlining**: Pastikan saat timeout/fallback SVG terjadi, SVG di-inline sesuai arsitektur modern.
