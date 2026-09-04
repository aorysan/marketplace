# Sitegen Directory Reorganization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mengubah struktur penyimpanan seluruh siklus kerja `sitegen` menjadi arsitektur 4-Pilar (`intake/`, `planning/`, `web/`, `reports/`) di bawah `landings/<brand>/` untuk menghilangkan polusi folder root dan menerapkan pemindahan aset tanpa duplikasi (*zero-duplication asset move*).

**Architecture:** Menerapkan pola *mini-monorepo* pada direktori proyek brand yang memisahkan ranah data ekstraksi AI (`intake/` & `planning/`), ranah evaluasi & laporan (`reports/`), dan ruang kerja bersih khusus aplikasi Next.js (`web/`). Relokasi aset gambar dari PDF menggunakan mekanisme *Move* permanen ke folder statis Next.js.

**Tech Stack:** Markdown (Antigravity Skills & Rules), Node.js (Render & Technical Check Scripts), Next.js App Router workspace standard.

## Global Constraints
- **Zero Root Pollution**: Tidak boleh ada file berakhiran `.md`, `.json`, `.html`, atau `.preview` yang ditaruh langsung di root `landings/<brand>/`. Root hanya diperbolehkan menampung 4 sub-direktori pilar (`intake/`, `planning/`, `web/`, `reports/`).
- **Zero-Duplication Storage**: Tahap generator WAJIB memindahkan total (*Move-Item* / `mv`) aset gambar dari `intake/assets/` ke `web/public/assets/`, bukan di-copy atau symlink.
- **Kepatuhan Konstitusi**: Aturan `[No-Video Default]` dan rute remediasi SEO harus tetap dilestarikan sepenuhnya pada spesifikasi folder baru.
- **Konsistensi Path Windows & Cross-Platform**: Setiap instruksi terminal web (seperti `npm run dev`, `npx playwright install`, atau `npm run build`) harus diarahkan ke dalam sub-folder `landings/<brand>/web`.

---

### Task 1: Refactor Intake & Brainstorming Sub-skills (The Intake Pillar)

**Files:**
- Modify: `intake/SKILL.md:22-45`
- Modify: `brainstorming/SKILL.md:16-70`
- Modify: `brainstorming/AGENTS.md:17`

**Interfaces:**
- Consumes: Input file Compro PDF dari user.
- Produces: `landings/<brand>/intake/intake_raw.json`, `landings/<brand>/intake/intake_compro.md`, `landings/<brand>/intake/assets/`, `landings/<brand>/intake/user_preferences.md`, dan `landings/<brand>/intake/final_intake.md`.

- [ ] **Step 1: Verify presence of legacy path strings in Intake & Brainstorming**

Run: `git grep "landings/<brand>/intake_compro.md" -- intake/SKILL.md brainstorming/SKILL.md`
Expected: Return baris referensi lama yang menunjuk langsung ke root `landings/<brand>/`.

- [ ] **Step 2: Update intake/SKILL.md path specifications**

Gunakan `replace_file_content` pada file `intake/SKILL.md` untuk mengganti seluruh referensi output dari root ke sub-folder `intake/`:

```markdown
Script `extract.py` menghasilkan log teks di terminal DAN file terstruktur `intake_raw.json` di direktori output (misal: di `landings/<brand>/intake/`). File JSON ini memuat:
- **`colors`**: Daftar warna brand terklasifikasi (`primary`, `secondary`, `neutral`) dalam format hex `#RRGGBB`.
- **`images`**: Metadata visual termasuk nomor halaman (`page`), dimensi resolusi (`width`, `height`), dan teks judul/heading terdekat (`nearby_heading`). Gambar berukuran <50px telah difilter secara otomatis oleh script sehingga hanya tersisa gambar bermakna yang disimpan di direktori `assets/` (atau `landings/<brand>/intake/assets/`).
```

Dan update pada bagian B (Penyusunan Dokumen `intake_compro.md`):
```markdown
### B. Penyusunan Dokumen `intake_compro.md`
Buat dokumen `intake_compro.md` di folder `landings/<brand>/intake/intake_compro.md` yang memuat rekonstruksi komesial secara terstruktur:
```

Serta pada baris 45 (Aturan Wajib):
```markdown
- **Batasan Skala Kerja**: JANGAN merencanakan struktur, layout, atau kode halaman website. Satu-satunya output akhir Anda pada tahap ini adalah aset fisik yang telah ter-rename di direktori `assets/` dan file dokumen `landings/<brand>/intake/intake_compro.md`.
```

- [ ] **Step 3: Update brainstorming/SKILL.md and brainstorming/AGENTS.md paths**

Gunakan `replace_file_content` pada file `brainstorming/SKILL.md` baris 16:
```markdown
1. `landings/<brand>/intake/intake_compro.md` — data faktual dari company profile
2. `landings/<brand>/planning/PLAN-USER-NEEDS.md` — analisis kebutuhan target user (jika tersedia)
3. `landings/<brand>/planning/PLAN-COMPETITOR.md` — analisis kompetitor (jika tersedia)
```

Dan baris 70 pada `brainstorming/SKILL.md`:
```markdown
1. Tulis file `landings/<brand>/intake/user_preferences.md` dengan format:
```

Gunakan `replace_file_content` pada `brainstorming/AGENTS.md` baris 17:
```markdown
   - Seluruh keputusan user selama sesi brainstorming WAJIB direkam dan disimpan ke file `landings/<brand>/intake/user_preferences.md`.
```

- [ ] **Step 4: Verify legacy paths are eradicated in Task 1 scope**

Run: `git grep "landings/<brand>/intake_compro.md" -- intake/ brainstorming/ ; git grep "landings/<brand>/user_preferences.md" -- brainstorming/`
Expected: No matches found (karena sekarang menunjuk ke `landings/<brand>/intake/...`).

- [ ] **Step 5: Commit Task 1**

```bash
git add intake/SKILL.md brainstorming/SKILL.md brainstorming/AGENTS.md
git commit -m "refactor(intake,brainstorming): move extraction and user preference artifacts to landings/<brand>/intake/"
```

---

### Task 2: Refactor Planner & QA-Reviewer Sub-skills (The Planning Pillar)

**Files:**
- Modify: `planner/SKILL.md:18-166`
- Modify: `qa-reviewer/SKILL.md:19-233`

**Interfaces:**
- Consumes: `landings/<brand>/intake/final_intake.md` (dari Task 1).
- Produces: Seluruh spesifikasi perancangan di bawah `landings/<brand>/planning/`, termasuk `PRD.md` dan `ASSET-MAPPING.md`.

- [ ] **Step 1: Verify presence of legacy root PRD and final_intake in Planner and QA-Reviewer**

Run: `git grep -E "landings/<brand>/(final_intake|PRD)\.md" -- planner/ qa-reviewer/`
Expected: Menyelaraskan hasil pencarian string lama pada kedua sub-skill.

- [ ] **Step 2: Update planner/SKILL.md path references**

Gunakan `replace_file_content` / `multi_replace_file_content` pada file `planner/SKILL.md` untuk memperbaharui input dan output:
- Ganti seluruh kemunculan `landings/<brand>/final_intake.md` menjadi `landings/<brand>/intake/final_intake.md` (terjadi pada baris 18 dan 63).
- Ganti output kemunculan `landings/<brand>/PRD.md` menjadi `landings/<brand>/planning/PRD.md` (terjadi pada baris 143).

- [ ] **Step 3: Update qa-reviewer/SKILL.md path references**

Gunakan `replace_file_content` pada `qa-reviewer/SKILL.md` untuk mengganti referensi input data intake:
- Ganti baris 20, baris 36, dan baris 57 dari `landings/<brand>/final_intake.md` menjadi `landings/<brand>/intake/final_intake.md`.

- [ ] **Step 4: Verify Task 2 path precision**

Run: `git grep -E "landings/<brand>/(final_intake|PRD)\.md" -- planner/ qa-reviewer/`
Expected: No matches found (selesai diganti ke `intake/final_intake.md` dan `planning/PRD.md`).

- [ ] **Step 5: Commit Task 2**

```bash
git add planner/SKILL.md qa-reviewer/SKILL.md
git commit -m "refactor(planner,qa): enforce planning pillar and read input from intake directory"
```

---

### Task 3: Refactor Generator Sub-skill & Render Scripts (The Web & Preview Pillars)

**Files:**
- Modify: `generator/SKILL.md:27-114`
- Modify: `generator/scripts/render.mjs:14`
- Modify: `scripts/render.js:12`

**Interfaces:**
- Consumes: Blueprint `landings/<brand>/planning/PRD.md`, `planning/ASSET-MAPPING.md`, dan foto di `landings/<brand>/intake/assets/`.
- Produces: Aplikasi Next.js di dalam `landings/<brand>/web/`, pemindahan file tanpa duplikasi ke `web/public/assets/`, dan hasil render preview ke `landings/<brand>/reports/.preview/`.

- [ ] **Step 1: Verify target scaffold and asset logic in generator & render scripts**

Run: `git grep -E "create-next-app|landings/\${brand|landings/.*assets" -- generator/ scripts/`
Expected: Menampilkan command create-next-app yang menembak langsung ke root brand dan script render menunjuk ke `.preview` di root.

- [ ] **Step 2: Update generator/SKILL.md scaffolding, CLI paths, and zero-duplication move instruction**

Gunakan `multi_replace_file_content` pada `generator/SKILL.md`:
- **Baris 27 (Lokasi Output):** Ganti dari `root landings/<brand>/` menjadi `folder aplikasi landings/<brand>/web/`.
- **Baris 48 (Referensi PRD):** Ganti `landings/<brand>/PRD.md` menjadi `landings/<brand>/planning/PRD.md`.
- **Baris 51-56 (Scaffolding):** Ganti pengecekan dan eksekusi create-next-app ke sub-folder web:
```markdown
**Guard**: Jika file `landings/<brand>/web/package.json` sudah ada, SKIP scaffolding dan langsung ke GATE 3. Hanya scaffold jika project belum ada.

Beralihlah ke folder `landings/` di root workspace, dan buat folder `<brand>` jika belum ada.
Eksekusi perintah berikut untuk men-scaffold project baru Next.js interaktif (tanpa prompt, menggunakan Vanilla CSS Modules SAMA SEKALI TANPA Tailwind) langsung ke folder web:

npx -y create-next-app@latest ./landings/<brand>/web --use-npm --eslint --tailwind=false --src-dir=false --app --ts --import-alias="@/*"
```
- **Baris 59 (Instalasi Dependensi):**
```markdown
- Instal dependensi animasi Lenis, Anime.js, Framer Motion & Ikon: `cd landings/<brand>/web && npm install -y --no-fund lenis lucide-react animejs @types/animejs framer-motion`.
```
- **Baris 63 (Manajemen Aset Gambar - ZERO DUPLICATE MOVE):**
```markdown
1. **MANAJEMEN ASET GAMBAR (CRITICAL - ZERO DUPLICATION):** Anda WAJIB memindahkan total (*Move-Item* atau `mv`, BUKAN di-copy atau symlink) seluruh isi folder `landings/<brand>/intake/assets/` ke dalam folder statis Next.js yaitu `landings/<brand>/web/public/assets/`. Jika file gambar sudah terisi di `web/public/assets/` dan folder `intake/assets/` sudah kosong (misal karena pengulangan eksekusi), maka abaikan/SKIP langkah pemindahan ini dengan aman. Pastikan pemanggilan komponen `<Image src="/assets/..." />` merujuk tepat ke path tersebut. Jika Anda menggunakan gambar dari URL eksternal, WAJIB pastikan gambar tersebut membalas HTTP 200 OK (DILARANG placeholder seperti `picsum.photos`; jika tidak ada gambar valid, HENTIKAN proses dan minta pengguna menaruh gambar di `public/assets/`). Anda WAJIB mendaftarkan domain eksternal tersebut ke dalam properti `images.remotePatterns` pada file `next.config.ts`.
```
- **Baris 102-114 (Build Validation & Git Init):**
```markdown
Sebelum melakukan inisialisasi Git pada GATE 4, Anda WAJIB menjalankan perintah validasi build di folder `landings/<brand>/web`:

cd landings/<brand>/web && npm run build
...
**Guard**: Jika folder `landings/<brand>/web/.git` sudah ada, SKIP `git init` dan lakukan commit saja.

cd landings/<brand>/web
```

- [ ] **Step 3: Update render preview directory in generator/scripts/render.mjs and scripts/render.js**

Gunakan `replace_file_content` pada `generator/scripts/render.mjs` baris 14:
```javascript
const outDir = path.resolve(`landings/${brandName}/reports/.preview`);
```
Gunakan `replace_file_content` pada `scripts/render.js` baris 12:
```javascript
  const previewDir = path.join(process.cwd(), 'landings', brand, 'reports', '.preview');
```

- [ ] **Step 4: Verify generator and scripts output cleanly to web/ and reports/**

Run: `git grep -E "create-next-app.*web|reports/\.preview|intake/assets" -- generator/ scripts/`
Expected: Menampilkan hasil pembaharu penunjukan direktori eksekusi baru.

- [ ] **Step 5: Commit Task 3**

```bash
git add generator/SKILL.md generator/scripts/render.mjs scripts/render.js
git commit -m "refactor(generator,scripts): target web/ subfolder and enforce zero-duplication asset move"
```

---

### Task 4: Refactor SEO & Debug Sub-skills (The Reports Pillar & Fix Loop)

**Files:**
- Modify: `seo/SKILL.md:13`
- Modify: `debug/SKILL.md:14-36`

**Interfaces:**
- Consumes: Kode Next.js di `landings/<brand>/web/` dan blueprint dari `landings/<brand>/planning/PRD.md` serta `intake/final_intake.md`.
- Produces: Laporan temuan audit dan tes grafis di `landings/<brand>/reports/` (`SEO-REPORT.md`, `lighthouse-report.html`, `.preview/`) dan modifikasi kode langsung di dalam `web/`.

- [ ] **Step 1: Check report and preview target paths in SEO and Debug skills**

Run: `git grep -E "SEO-REPORT|lighthouse-report|\.preview" -- seo/ debug/`
Expected: Menampilkan direktori penampungan output saat ini yang masih berlokasi langsung di bawah root `landings/<brand>/`.

- [ ] **Step 2: Update seo/SKILL.md target directory**

Gunakan `replace_file_content` pada `seo/SKILL.md` baris 13:
```markdown
Skill ini bertindak sebagai **Auditor/Checker Akhir** SEO. Agen `seo` bertugas memeriksa website (source code di folder `landings/<brand>/web/` dan infrastruktur SEO buatan skill `generator`) terhadap SOP Checklist SEO di bawah ini. Agen `seo` TIDAK membuat atau mengedit file `sitemap.ts`, `robots.ts`, atau JSON-LD secara langsung, melainkan membaca source code hasil kerja `generator`. Tulis hasil analisis dan seluruh temuan error/poin yang gagal ke dalam file `landings/<brand>/reports/SEO-REPORT.md` secara detail agar dapat dibaca dan diperbaiki oleh skill `debug`.
```

- [ ] **Step 3: Update debug/SKILL.md target directories and CLI references**

Gunakan `multi_replace_file_content` pada `debug/SKILL.md`:
- **Baris 14 (Ekstrak & Baca):**
```markdown
**WAJIB EKSTRAK & BACA**: Agen wajib membaca file `landings/<brand>/planning/PRD.md` dan `landings/<brand>/intake/final_intake.md` terlebih dahulu untuk memahami Visi, Misi, Tema Font, UI/UX preferensi user
```
- **Baris 28 (Screenshot periksa):**
```markdown
4. Periksa semua gambar screenshot di folder `landings/<brand>/reports/.preview/`.
```
- **Baris 33 (Lighthouse CLI Output):**
```markdown
   `npx -y lighthouse http://localhost:<port> --output html --output-path ./landings/<brand>/reports/lighthouse-report.html --view`
```
- **Baris 36 (Baca SEO Report):**
```markdown
4. Baca file `landings/<brand>/reports/SEO-REPORT.md` dari skill `seo`, perbaiki seluruh masalah meta tag, SOP keyword, dan checklist SEO di folder `web/` hingga 100% patuh.
```

- [ ] **Step 4: Verify audit reports focus solely on reports/ folder**

Run: `git grep -E "landings/<brand>/(SEO-REPORT|\.preview|PRD)" -- seo/ debug/`
Expected: No matches found (karena sekarang terklasifikasi pada `reports/`, `planning/`, dan `web/`).

- [ ] **Step 5: Commit Task 4**

```bash
git add seo/SKILL.md debug/SKILL.md
git commit -m "refactor(seo,debug): route audit logs and visual inspection to reports/ directory"
```

---

### Task 5: Refactor Master Orchestrator & README (System-wide Routing & Documentation)

**Files:**
- Modify: `SKILL.md:19-107`
- Modify: `README.md:17`

**Interfaces:**
- Consumes: Semua definisi path 4-Pilar yang diserahkan dari Task 1 sampai 4.
- Produces: Panduan orkestrasi utama yang harmonis dan instruksi pengguna di README.

- [ ] **Step 1: Check existing orchestrator step mappings in SKILL.md and README.md**

Run: `git grep -E "landings/\`<brand>\`/(intake_compro|PRD|user_preferences|final_intake|SEO-REPORT|package\.json)" -- SKILL.md README.md`
Expected: Muncul referensi-referensi langkah sekuensial master orchestrator ke root brand.

- [ ] **Step 2: Update SKILL.md (Master Orchestrator)**

Gunakan `multi_replace_file_content` untuk memperbarui seluruh spesifikasi tahapan pada `SKILL.md`:
- **Step 1 (Intake - baris 36):** Ganti `landings/<brand>/intake_compro.md` menjadi `landings/<brand>/intake/intake_compro.md`.
- **Step 2 (Brainstorming - baris 50 & 56):** Ganti penyimpanan `user_preferences.md` dan penggabungan ke `landings/<brand>/intake/final_intake.md`.
- **Step 5b & Step 6 (PRD & Asset Mapping - baris 69-71):**
   - Ganti referensi Master PRD menjadi `landings/<brand>/planning/PRD.md`.
   - Pada poin 6a pastikan planner membaca dari `intake/final_intake.md`.
- **Step 7 (Scaffolding & Server Setup - baris 75-76):**
   - Ganti perintah inisialisasi Playwright & dev server:
   ```markdown
   Inisialisasi Playwright di project web: `cd landings/<brand>/web && npm init playwright@latest --yes && npx playwright install --with-deps`.
   Jalankan dev server di background (misal: `cd landings/<brand>/web && npm run dev`) sebelum memulai iterasi agar Playwright dan user bisa memvalidasi halaman.
   ```
- **Step 10 (SEO Remediation & Local Build - baris 105 & 107):**
   - Ganti target pencatatan SEO menjadi `landings/<brand>/reports/SEO-REPORT.md`.
   - Ganti perintah build final: `cd landings/<brand>/web && npm run build`.

- [ ] **Step 3: Update README.md path example**

Gunakan `replace_file_content` pada `README.md` baris 17:
```markdown
   Mengekstrak data dari PDF company profile dan menyimpannya ke `landings/<brand>/intake/intake_compro.md` beserta aset gambar.
```

- [ ] **Step 4: Verify Master Orchestrator references match sub-skills**

Run: `git grep "cd landings/\`<brand>\` &&" -- SKILL.md`
Expected: No matches (selesai diubah ke `cd landings/<brand>/web && ...`).

- [ ] **Step 5: Commit Task 5**

```bash
git add SKILL.md README.md
git commit -m "docs(orchestrator): finalize 4-pillar workspace organization in master skill and README"
```

---

### Task 6: System-wide Zero-Pollution Verification & Final Integration Audit

**Files:**
- Test: `D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen\` (Static Scan)

**Interfaces:**
- Consumes: Keseluruhan sistem skill yang telah disinkronisasikan path-nya.
- Produces: Bukti verifikasi *zero pollution* dan kepatuhan absolut pada arsitektur baru.

- [ ] **Step 1: Execute static audit check for any remaining root folder pollution strings**

Run in terminal from sitegen folder:
```powershell
git grep "landings/\`<brand>\`/PRD.md"
git grep "landings/\`<brand>\`/intake_compro.md"
git grep "landings/\`<brand>\`/user_preferences.md"
git grep "landings/\`<brand>\`/SEO-REPORT.md"
```
Expected: Total nihil output (0 matches), membuktikan tiada lagi agen yang salah kaprah menjatuhi file ke direktori utama brand.

- [ ] **Step 2: Verify consistency of folder pillar keywords across all skill markdowns**

Run:
```powershell
git grep -E "(intake|planning|web|reports)/" -- *.md **/*.md
```
Expected: Daftar teratur pemetaan 4 pilar di masing-masing sub-skill fungsional.

- [ ] **Step 3: Final confirmation commit (if any tiny residual cleanup needed)**

Run: `git status`
Expected: Working tree clean and ready for real-world execution.

---
