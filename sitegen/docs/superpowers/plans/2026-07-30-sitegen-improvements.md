# Sitegen Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Memperbaiki skill `sitegen` beserta sub-skill `generator` dan `debug` untuk memastikan integrasi desain yang lebih kuat, validasi gambar cerdas, alur data intake yang lebih tertata, dan debugging yang komprehensif.

**Architecture:** Kita memodifikasi instruksi prompt dalam file Markdown (`SKILL.md`) untuk memperbarui alur kontrol agen dalam mode Master Orchestrator, Generator, dan Debugger.

**Tech Stack:** Markdown (Prompt Engineering)

## Global Constraints
- Harus menggunakan file markdown yang ada di `.agents/skills/sitegen/`.
- Perubahan tidak boleh menghapus fungsionalitas inti yang sudah ada.

---

### Task 1: Update Master Orchestrator (`SKILL.md`)

**Files:**
- Modify: `SKILL.md`

**Interfaces:**
- Consumes: Instruksi saat ini di `SKILL.md`
- Produces: `SKILL.md` dengan instruksi Brainstorming (rekonsiliasi intake), pemanggilan `ui-ux-pro-max` & `impeccable` wajib, dan skill `seo` eksternal.

- [ ] **Step 1: Write the failing test (grep check)**

```powershell
Select-String -Path "SKILL.md" -Pattern "final_intake.md"
```
Expected: Fail (No output or no match)

- [ ] **Step 2: Implement the minimal code (Replace Brainstorming, Generator, and SEO steps)**

```powershell
# Ganti teks di SKILL.md menggunakan skrip penggantian (atau gunakan tool edit)
(Get-Content SKILL.md).Replace(
"1. **Intake**: Panggil ``intake`` untuk mengekstrak data PDF/User ke ``landings/<brand>/intake_data.md``.",
"1. **Intake**: Panggil ``intake`` untuk mengekstrak data PDF ke ``landings/<brand>/intake_compro.md``."
).Replace(
"2. **Brainstorming [CRITICAL STOP - TUNGGU REVIEW USER]**:
   a. Berdasarkan data hasil intake, berikan saran kepada user apa saja yang bagus untuk dimasukkan ke PRD nantinya. Lakukan brainstorming secara natural dengan user.
   b. **ATURAN WAJIB (HARD STOP)**: Anda WAJIB mengakhiri respons Anda di sini. JANGAN memanggil tool apa pun. JANGAN lanjut ke Langkah 3. Tunggu user setuju.",
"2. **Brainstorming & Rekonsiliasi Intake [CRITICAL STOP - TUNGGU REVIEW USER]**:
   a. Berdasarkan data hasil intake, lakukan brainstorming (Visi, Misi, Tema Font, UI/UX). Simpan masukan user sebagai ``landings/<brand>/user_preferences.md``.
   b. Lakukan rekonsiliasi dengan menggabungkan ``intake_compro.md`` dan ``user_preferences.md`` menjadi ``landings/<brand>/final_intake.md``.
   c. **ATURAN WAJIB (HARD STOP)**: Anda WAJIB memperlihatkan isi ``final_intake.md`` ke user. Berhenti bekerja dan JANGAN memanggil tool apa pun. Tunggu user setuju sebelum lanjut ke Langkah 3."
).Replace(
"   d. **Generate Halaman:** Setelah detail disetujui, panggil ``generator`` khusus untuk membangun halaman tersebut ke dalam project Next.js.",
"   d. **Persiapan Visual:** WAJIB panggil ``ui-ux-pro-max`` dan ``impeccable`` untuk mendapatkan pedoman layout dan animasi yang memukau.
   e. **Generate Halaman:** Setelah persiapan visual selesai, panggil ``generator`` khusus untuk membangun halaman tersebut ke dalam project Next.js."
).Replace(
"6. **SEO Validation:** Panggil ``seo`` untuk validasi SEO sebelum deploy.",
"6. **SEO Validation:** Panggil skill SEO eksternal (dari github.com/affaan-m/everything-claude-code) untuk validasi struktur SEO terhadap ``final_intake.md`` dan PRD sebelum deploy."
) | Set-Content SKILL.md
```

- [ ] **Step 3: Run test to verify it passes**

```powershell
Select-String -Path "SKILL.md" -Pattern "final_intake.md"
```
Expected: PASS (Prints matching lines)

- [ ] **Step 4: Commit**

```bash
git add SKILL.md
git commit -m "feat(sitegen): update master orchestrator with final_intake and required visual skills"
```

---

### Task 2: Update Generator Skill (`generator/SKILL.md`)

**Files:**
- Modify: `generator/SKILL.md`

**Interfaces:**
- Consumes: Alur pembuatan halaman.
- Produces: Aturan penggunaan gambar (Compro -> Web Search -> HTTP 200).

- [ ] **Step 1: Write the failing test**

```powershell
Select-String -Path "generator\SKILL.md" -Pattern "HTTP Status 200"
```
Expected: Fail

- [ ] **Step 2: Implement the minimal code**

```powershell
$content = Get-Content generator\SKILL.md -Raw
$newText = "4. **Gambar Unik, Responsif & Terverifikasi.** Prioritas penggunaan gambar: (1) Cek gambar ekstraksi compro di ``final_intake.md``/assets. Jika cocok, gunakan. (2) Jika kurang, WAJIB lakukan web search untuk mencari gambar eksternal yang relevan. (3) WAJIB lakukan pengecekan URL eksternal (HTTP ping) untuk memastikan status HTTP 200 (bukan 404). Semua tag `<Image />` harus diberi styling responsif (`max-width: 100%`, `height: auto`, `object-fit: cover`). Sebelum merakit, Anda WAJIB memanggil sub-skill ``ui-ux-pro-max`` dan ``impeccable`` untuk mengkurasi."

$content = $content -replace '4\. \*\*Gambar Unik, Responsif & Terverifikasi\.\*\*.*?(?=5\. \*\*Preservasi)', ($newText + "`r`n")
$content | Set-Content generator\SKILL.md
```

- [ ] **Step 3: Run test to verify it passes**

```powershell
Select-String -Path "generator\SKILL.md" -Pattern "HTTP Status 200"
```
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add generator/SKILL.md
git commit -m "feat(generator): implement smart image fallback and external URL validation"
```

---

### Task 3: Update Debug Skill (`debug/SKILL.md`)

**Files:**
- Modify: `debug/SKILL.md`

**Interfaces:**
- Consumes: Aturan QA otomatis.
- Produces: Aturan QA yang membaca `final_intake.md`, memberlakukan Strict Fail untuk animasi yang hilang, dan otomatisasi `/systematic-debugging`.

- [ ] **Step 1: Write the failing test**

```powershell
Select-String -Path "debug\SKILL.md" -Pattern "final_intake.md"
```
Expected: Fail

- [ ] **Step 2: Implement the minimal code**

```powershell
$content = Get-Content debug\SKILL.md -Raw
$content = $content -replace '\*\*WAJIB EKSTRAK & BACA\*\*: Agen wajib membaca file `landings/<brand>/PRD\.md` terlebih dahulu', "**WAJIB EKSTRAK & BACA**: Agen wajib membaca file ``landings/<brand>/PRD.md`` dan ``landings/<brand>/final_intake.md`` terlebih dahulu untuk memahami Visi, Misi, Tema Font, UI/UX preferensi user"

$content = $content -replace '404 network error pada pemuatan gambar\.', "404 network error pada pemuatan gambar.`r`n   - Ketiadaan animasi (elemen gagal muncul/ter-render) atau layout yang keluar batas (overflow-x)."

$content = $content -replace '3\. Jika ditemukan bug sulit atau ketidaksesuaian, Anda WAJIB memanggil sub-skill `/systematic-debugging` untuk melakukan investigasi dan perbaikan komprehensif\.', "3. Jika terdeteksi bug visual, animasi hilang, atau layout aneh yang gagal diperbaiki dalam 2 iterasi, Anda WAJIB memanggil sub-skill `/systematic-debugging` untuk melakukan investigasi mendalam dan tidak boleh lanjut halaman."

$content | Set-Content debug\SKILL.md
```

- [ ] **Step 3: Run test to verify it passes**

```powershell
Select-String -Path "debug\SKILL.md" -Pattern "final_intake.md"
```
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add debug/SKILL.md
git commit -m "feat(debug): enforce strict visual validation and final_intake alignment"
```

---

### Task 4: Install External SEO Subskill

**Files:**
- Execute command in project root.

**Interfaces:**
- Consumes: `npx skills add`
- Produces: A new external SEO skill in `.agents/skills/seo`.

- [ ] **Step 1: Write the failing test**

```powershell
Test-Path -Path ".agents\skills\seo\SKILL.md"
```
Expected: True if already installed, False otherwise. (Note: the existing 'seo' skill might be overwritten, which is intended).

- [ ] **Step 2: Implement the minimal code**

```powershell
npx skills add https://github.com/affaan-m/everything-claude-code --skill seo
```

- [ ] **Step 3: Run test to verify it passes**

```powershell
Test-Path -Path ".agents\skills\seo\SKILL.md"
```
Expected: True

- [ ] **Step 4: Commit**

```bash
git add .agents/skills/seo/
git commit -m "feat(sitegen): install external seo skill"
```
