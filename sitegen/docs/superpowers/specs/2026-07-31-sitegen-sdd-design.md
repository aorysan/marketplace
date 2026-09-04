# Sitegen Master Flow SDD Refactor Design

## Context
The current `sitegen` skill uses a sequential loop to generate pages (Step 4). This takes a long time and is prone to context issues. We are refactoring Step 4 to use the `sub-agent-driven-development` (SDD) skill.

## New Architecture

The new flow will modify `SKILL.md` in the `sitegen` masterskill.

1. **Intake**: Extract data PDF to `landings/<brand>/intake_compro.md`.
2. **Research**: Generate `PLAN-USER-NEEDS.md` and `PLAN-COMPETITOR.md`.
3. **Brainstorming, Rekonsiliasi & Global Design**: Generate `PLAN-GLOBAL.md` and `PLAN-DESIGN-SYSTEM.md`.
4. **SDD Plan Generation**: Generate a single implementation plan (e.g., `landings/<brand>/planning/SDD-PAGES-PLAN.md`) detailing the generation of all pages as separate tasks.
5. **Execute SDD**: Invoke the `sub-agent-driven-development` skill with `SDD-PAGES-PLAN.md`.
    - SDD dispatches an implementer (generator) subagent for each page task.
    - SDD dispatches a task reviewer (qa-reviewer) subagent to verify the generated page against PRD.
    - SDD handles the fix loop automatically (up to 5 rounds) using debug skills (`impeccable`, `systematic-debugging`).
6. **Playwright E2E & Final QA**: Generate and run Playwright spec tests for all pages.
7. **SEO Validation**: External SEO skill validation.
8. **Debug Lokal Final**: Final debugging.
9. **Deploy**: Vercel deployment.
10. **Post-Deploy Debug**: Final verification.
11. **Cleanup**: Terminate processes.

## Changes Required
- Copy the global `subagent-driven-development` skill folder into `D:\AryokPunya\Magang\sitegen\.agents\skills\sitegen\subagent-driven-development`.
- Modify `SKILL.md` to reflect the new Steps 4-5.
- Update references to sequential iteration to instead point to SDD execution.
