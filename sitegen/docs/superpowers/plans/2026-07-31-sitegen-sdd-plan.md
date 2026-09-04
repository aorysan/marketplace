# Sitegen SDD Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the sitegen skill to use Subagent-Driven Development (SDD) for parallel/isolated page generation.

**Architecture:** Copy the global SDD skill locally into the sitegen folder, and update the `SKILL.md` master workflow to replace the sequential generation loop (Step 4) with an SDD plan generation and execution phase.

**Tech Stack:** Markdown, Git, Shell commands

## Global Constraints

- Must copy the folder, not cut it.
- Must retain all subsequent steps (SEO validation, debug, deploy) after page generation.

---

### Task 1: Copy SDD Skill Locally

**Files:**
- Create: `D:/AryokPunya/Magang/sitegen/.agents/skills/sitegen/subagent-driven-development/`

**Interfaces:**
- Consumes: Global `subagent-driven-development` folder at `C:\Users\ThinkPad\.gemini\config\plugins\superpowers\skills\subagent-driven-development\`
- Produces: Local `subagent-driven-development` skill inside `sitegen`

- [ ] **Step 1: Copy the folder**

Run: `cp -r C:/Users/ThinkPad/.gemini/config/plugins/superpowers/skills/subagent-driven-development D:/AryokPunya/Magang/sitegen/.agents/skills/sitegen/`
Expected: Folder is copied successfully.

- [ ] **Step 2: Verify the folder exists**

Run: `ls D:/AryokPunya/Magang/sitegen/.agents/skills/sitegen/subagent-driven-development/SKILL.md`
Expected: File exists and is listed.

- [ ] **Step 3: Commit**

```bash
git add subagent-driven-development
git commit -m "feat: add local copy of subagent-driven-development skill"
```

### Task 2: Update `SKILL.md` Workflow

**Files:**
- Modify: `D:/AryokPunya/Magang/sitegen/.agents/skills/sitegen/SKILL.md`

**Interfaces:**
- Consumes: None
- Produces: Updated workflow steps for Sitegen orchestration.

- [ ] **Step 1: Replace Sequential Loop (Steps 4-11)**

We need to rewrite steps 4 and onwards to use SDD, renumbering the final steps.

```markdown
4. **SDD Plan Generation**: Buat rencana implementasi utama (`landings/<brand>/planning/SDD-PAGES-PLAN.md`) yang mendetailkan pembuatan semua halaman (dari `PAGES-LIST.md`) sebagai task terpisah.

5. **Execute SDD (Subagent-Driven Development)**: Panggil sub-skill `subagent-driven-development` lokal (dari folder `subagent-driven-development` di dalam sitegen) menggunakan `SDD-PAGES-PLAN.md`.
    - SDD akan memanggil subagent `generator` untuk setiap task halaman.
    - SDD akan memanggil subagent `qa-reviewer` untuk memverifikasi halaman terhadap PRD.
    - SDD akan menangani fix loop secara otomatis (maksimal 5 iterasi) menggunakan `impeccable` atau `systematic-debugging`.

6. **Playwright E2E & Final QA**: Generate file test `tests/<halaman>.spec.ts` untuk memvalidasi secara End-to-End berdasarkan PRD setiap halaman, dan jalankan secara bersamaan.

7. **SEO Validation**: Panggil skill SEO eksternal (dari github.com/affaan-m/everything-claude-code) untuk validasi struktur SEO terhadap `final_intake.md` dan PRD sebelum deploy.

8. **Debug Lokal Final**: Jalankan dev server di background dengan perintah `cd landings/<brand> && npm run dev` (biarkan Next.js memilih port secara otomatis). Baca output terminal untuk menentukan port yang aktif (misal: 3000, 3001, dst.) yang digunakan untuk Playwright testing dan visual debugging. Setelah server berjalan, panggil `debug` untuk menjalankan visual debugging, analisis Lighthouse, perbaikan SEO, dan **Debugging Mandiri**. Pastikan tidak ada bug tersisa.

9. **[CRITICAL STOP - TUNGGU REVIEW USER]:** Perlihatkan keseluruhan website ke user untuk persetujuan akhir. **HARD STOP**: BERHENTI TOTAL. Jangan panggil tool deploy sebelum user bilang "Ya/Deploy".

10. **Deploy**: Jika user setuju, panggil `deploy` ke Vercel.

11. **Post-Deploy Debug**: Panggil `debug` untuk **Post-Deploy Debug**. Jika bug/error muncul, perbaiki lokal lalu re-deploy (Maksimal 2 iterasi). Jika masih error, laporkan ke user.

12. **Cleanup**: Setelah semua proses selesai, matikan (kill) proses dev server Node.js yang berjalan pada port aktif yang digunakan sebelumnya.
```

- [ ] **Step 2: Commit**

```bash
git add SKILL.md
git commit -m "refactor: update master flow to use subagent-driven-development"
```
