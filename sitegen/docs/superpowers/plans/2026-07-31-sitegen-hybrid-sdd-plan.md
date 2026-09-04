# Sitegen Hybrid SDD Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the `sitegen` orchestrator skill to use a hybrid Subagent-Driven Development (SDD) approach with inline subagent dispatches and human-in-the-loop checkpoints per page.

**Architecture:** Modify the `sitegen` master `SKILL.md` to define a two-phase generation process. Phase 1 batches the creation and approval of all Product Requirement Documents (PRDs). Phase 2 sequentially loops through each page, using inline SDD (dispatching `generator` and `qa-reviewer` with automated fix loops) followed by a mandatory human review stop per page. Finally, delete the local `subagent-driven-development` folder as orchestration will now be handled directly in the master skill.

**Tech Stack:** Markdown, Git, Shell commands

## Global Constraints

- Must retain Steps 1 to 3 of the `sitegen` master flow unchanged.
- Must execute all commands relative to the `sitegen` skill directory: `D:/AryokPunya/Magang/sitegen/.agents/skills/sitegen/`
- Exact files and folder paths must be used.

---

### Task 1: Clean Up Unused SDD Folder

**Files:**
- Delete: `D:/AryokPunya/Magang/sitegen/.agents/skills/sitegen/subagent-driven-development/`

**Interfaces:**
- Consumes: The recently copied `subagent-driven-development` folder.
- Produces: A clean working directory without unnecessary SDD script overhead.

- [ ] **Step 1: Remove the directory**

Run: `Remove-Item -Path "D:/AryokPunya/Magang/sitegen/.agents/skills/sitegen/subagent-driven-development" -Recurse -Force`
Expected: No output, folder removed.

- [ ] **Step 2: Verify deletion**

Run: `Test-Path "D:/AryokPunya/Magang/sitegen/.agents/skills/sitegen/subagent-driven-development"`
Expected: `False`

- [ ] **Step 3: Commit**

```bash
git rm -r subagent-driven-development
git commit -m "chore: remove unused subagent-driven-development folder"
```

### Task 2: Rewrite Master Flow in SKILL.md

**Files:**
- Modify: `D:/AryokPunya/Magang/sitegen/.agents/skills/sitegen/SKILL.md`

**Interfaces:**
- Consumes: The current `SKILL.md`.
- Produces: The updated `SKILL.md` containing the Hybrid SDD flow.

- [ ] **Step 1: Replace steps 4 to 12**

Using the `replace_file_content` tool, replace everything from Step 4 down to Step 12 with the following content:

```markdown
4. **Fase Persiapan Batch (PRD & Visual):**
   a. **Buat PRD Semua Halaman:** Baca `landings/<brand>/planning/PAGES-LIST.md`. Panggil sub-skill `planner` mode=page untuk men-generate PRD (`PLAN-<halaman>.md`) untuk **semua** halaman yang terdaftar sekaligus.
   b. **Review QA PRD:** Panggil `qa-reviewer` untuk menilai kelayakan semua `PLAN-<halaman>.md` secara internal.
   c. **Persiapan Visual & Aset:** Periksa folder `public/assets/` untuk logo. Panggil `ui-ux-pro-max` dan `impeccable` untuk mendapatkan pedoman layout dan animasi yang memukau.
   d. **[CRITICAL STOP - TUNGGU REVIEW USER]:** Perlihatkan semua PRD yang telah dibuat dan konsep visual kepada user. **HARD STOP**: Anda WAJIB berhenti bekerja dan menunggu persetujuan user sebelum lanjut.

5. **Fase Eksekusi Halaman (Hybrid SDD Iteration):**
   Lakukan loop berurutan untuk *setiap halaman* dari `PAGES-LIST.md`:
   a. **AI-to-AI SDD Loop:**
      - Panggil subagent `generator` khusus untuk membangun halaman tersebut ke dalam project Next.js berdasarkan PRD-nya. Generator WAJIB membaca pedoman visual dan `PLAN-DESIGN-SYSTEM.md`.
      - Setelah selesai, panggil subagent `qa-reviewer` untuk mengecek hasil kode terhadap PRD dan best practices.
      - Jika ada bug, UI kurang memukau, atau tidak sesuai PRD, biarkan subagent saling berkoordinasi: panggil ulang `generator` (atau `systematic-debugging` / `impeccable`) untuk memperbaikinya secara otomatis. Batasi maksimal 5 iterasi (fix loop) tanpa interupsi user.
   b. **Playwright Spec:** Setelah AI menganggap halaman sempurna, generate test `tests/<halaman>.spec.ts` berdasarkan PRD dan jalankan.
   c. **[CRITICAL STOP - TUNGGU REVIEW USER]:** Tampilkan hasil akhir halaman tersebut kepada user. **HARD STOP**: BERHENTI MENGEKSEKUSI TOOL. Tunggu user mengecek dev server (misal `localhost:3000`) dan memberikan persetujuan atau revisi. JANGAN lanjut ke halaman berikutnya sebelum disetujui.
   d. Ulangi loop untuk halaman berikutnya dari langkah 5a.

6. **Penggabungan (Integration):** Setelah semua halaman selesai dan disetujui, gabungkan navigasi antar halaman agar berfungsi sempurna.

7. **SEO Validation & Debug Lokal Final**:
   a. Panggil skill SEO eksternal (dari github.com/affaan-m/everything-claude-code) untuk validasi struktur SEO terhadap `final_intake.md` dan PRD.
   b. Jalankan dev server di background (`cd landings/<brand> && npm run dev`), lalu panggil `debug` untuk visual debugging, Lighthouse, dan SEO fixing akhir.

8. **[CRITICAL STOP - TUNGGU REVIEW USER]:** Perlihatkan keseluruhan website ke user untuk persetujuan akhir. **HARD STOP**: BERHENTI TOTAL.

9. **Deploy**: Jika user setuju, panggil `deploy` ke Vercel.

10. **Post-Deploy Debug**: Panggil `debug` untuk **Post-Deploy Debug**. Jika ada bug/error, perbaiki lokal dan re-deploy (Maksimal 2 iterasi).

11. **Cleanup**: Setelah selesai, matikan (kill) proses dev server Node.js.
```

- [ ] **Step 2: Commit**

```bash
git add SKILL.md
git commit -m "refactor: implement hybrid SDD page generation flow in SKILL.md"
```
