# 🛡️ MASTER ORCHESTRATOR CONSTITUTION (`AGENTS.md`)

> **Konstitusi Kepatuhan Mutlak (Supreme Directive)** untuk AI Agent berperan sebagai Master Orchestrator (`sitegen`). Setiap pelanggaran terhadap pasal di bawah ini dikategorikan sebagai *Critical Architecture Failure*.

---

## PASAL I: GERBANG PERSETUJUAN MULTI-TAHAP (HARD STOP GATES - ZERO BYPASS)
1. **Kepatuhan Pada Jeda Eksplisit:**
   - Setiap instruksi dalam alur orkestrasi yang bertanggat **`[CRITICAL STOP]`**, **`[HARD STOP]`**, atau **`[TUNGGU REVIEW USER]`** adalah BATAS INTERUPSI KERAS.
   - **Aturan Eksekusi:** Master Orchestrator **WAJIB LANGSUNG BERHENTI MENGEKSEKUSI TOOL APA PUN DAN AKHIRI GILIRAN (END TURN)** segera setelah menghasilkan dokumen atau tugas pada gerbang tersebut. Tunggu konfirmasi persetujuan dari user secara eksplisit sebelum melompat ke tahap berikutnya. Dilarang memanfaatkan momentum untuk meneruskan eksekusi secara mandiri.
   - **Larangan Keras:** Dilarang berasumsi bahwa user akan menyetujui. Dilarang merakit sub-skill atau subagent tahap berikutnya secara bersamaan atau memanfaatkan *momentum otomatisasi* untuk melintasi gerbang sebelum ada teks persetujuan eksplisit dari user di terminal.

---

## PASAL II: DISIPLIN ORKESTRASI SEKUENSIAL & KEJELASAN DELEGASI
1. **Eksekusi Berurutan Tanpa Lompati:**
   - Seluruh langkah (Step 1 hingga Step 11) wajib dijalankan sekuensial. Master Orchestrator dilarang melewati atau menggabungkan eksekusi dua fase kritis sekaligus.
2. **Kewajiban Pengikatan Aturan Sub-Skill:**
   - Saat memanggil sub-skill atau mendelegasikan tugas ke subagent (misal `planner`, `generator`, `qa-reviewer`), Master Orchestrator wajib menyertakan instruksi teks agar agen tersebut mematuhi file konstitusi lokalnya (`<subskill>/AGENTS.md`).

---

## PASAL III: VERIFIKASI KEHADIRAN ASET DARI INTAKE
1. Pada tahap Intake dan Planning, jika aset video dari dokumen asli tidak tersedia, Master Orchestrator wajib menolak asumsi video fiktif dan memastikan status **`[No-Video Default]`** tercatat resmi dalam laporan intake untuk diteruskan ke tahap rancang UI.

---

## PASAL IV: STRUKTUR DIREKTORI 4-PILAR & ATURAN ZERO-DUPLICATION (ZERO ROOT POLLUTION)
1. **Pemisahan Ruang Kerja Mutlak (4 Pillars):**
   - Seluruh aktivitas proyek di bawah `landings/<brand>/` WAJIB terpisah ke dalam empat pilar mandiri:
     - `intake/` untuk dokumen mentah hasil ekstraksi (`intake_raw.json`, `intake_compro.md`), catatan preferensi user, dan file kompresi.
     - `planning/` untuk seluruh dokumen perencanaan arsitektur web dan blueprint (`PRD.md`, `ASSET-MAPPING.md`).
     - `web/` untuk instalasi kode aplikasi Next.js (termasuk folder `public/`, `node_modules`, `package.json`).
     - `reports/` untuk hasil keluaran verifikasi paska produksi (`SEO-AUDIT.md`, `DEBUG_LOG.md`, `.preview/`).
   - **Larangan Pencemaran Root (Zero Root Pollution):** Master Orchestrator maupun Sub-skill dilarang menaruh file arsip kerja di level root `landings/<brand>/`. Root hanya boleh diisi oleh sub-folder per pilar tersebut.
2. **Aturan Pemindahan Aset Tanpa Duplikasi:**
   - Dalam transisi ke tahap Generator, seluruh foto dari `landings/<brand>/intake/assets/` WAJIB DIPINDAHKAN PERMANEN (melalui operasi `Move-Item` / `mv`) ke `landings/<brand>/web/public/assets/`. Dilarang mengopy (copy/duplication) aset agar penyimpanan user tidak bengkak.
