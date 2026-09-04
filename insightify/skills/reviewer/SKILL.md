---
name: reviewer
description: Stage 3 - Evaluate generated documentation across 10 quality dimensions, generate report, and output finalized document.
---

# Reviewer Skill

## Instructions

1. Distribute the evaluation of `[OUT_DIR]/docs/markdown/documentation.md` against `[OUT_DIR]/.insightify/knowledge/*` and `[OUT_DIR]/.insightify/plan.md` to **multiple sub-agents running concurrently**. Assign specific dimensions from the 10 quality dimensions in `references/review-criteria.md` to each sub-agent.
2. Wait for all concurrent sub-agents to complete their independent evaluations.
3. Merge the results/reports from the concurrently running sub-agents into a single comprehensive review report.
4. Write the merged report to `[OUT_DIR]/.insightify/review/review-report.md`.
5. If verdict is `changes_needed`, send specific issues back to Writer or apply targeted fixes.
6. If iteration reaches 3, escalate remaining issues to user.
7. If approved or after applying fixes, explicitly output the finalized document to `[OUT_DIR]/docs/final/final-documentation.md` so the user and Builder can see the definitive result.
8. Ask approval: "Approve doc? [Y/n/revise]"
   - Y/Enter → save as `approved`, proceed to the `builder` phase.
   - n → exit, save as `rejected`.
   - revise → prompt "What changes?". Implement a Fast-Fix Loop: direct feedback back to the `writer` or apply targeted fixes directly in the `reviewer` before moving to the `builder` phase. Loop (max 3 cycles).

## Scoring Rubric (1-5 per dimension)

**Accuracy** (vs knowledge base):
- 5: All facts match, no unsupported claims
- 3: Minor inaccuracies or missing nuances
- 1: Major factual errors or contradictions

**Completeness** (vs plan):
- 5: All planned sections present and substantive
- 3: Most sections present, some thin
- 1: Major planned sections missing

**Consistency** (internal consistency):
- 5: Terminology, tone, formatting uniform across all sections
- 3: Minor inconsistencies
- 1: Same concept different names, mixed tone, inconsistent formatting

**Structure** (heading/link integrity):
- 5: Heading levels incremental, all internal section links valid, no orphans
- 3: Minor heading issues or 1-2 broken links
- 1: Heading hierarchy broken, multiple broken links

**Usability** (readability):
- 5: Clear code examples, approachable prose, good flow
- 3: Adequate but could be clearer
- 1: Missing examples, wall-of-text, unclear instructions

**Type Safety** (TypeScript correctness):
- 5: All interfaces valid, no `any` without justification, strict mode compatible
- 3: Minor type issues, some `any` with comments
- 1: Major type errors, missing generics, broken interfaces

**Architecture Alignment** (matches extracted knowledge base):
- 5: All documented patterns match the extracted knowledge base; no fabricated or assumed patterns
- 3: Most patterns accurately reflected, minor gaps or slight assumptions
- 1: Documentation describes patterns not found in the codebase, or misrepresents the architecture

**Business Alignment** (matches business policies and user journeys):
- 5: User journeys, state machines, and business policies are logically sound, accurately extracted, and well-represented (user-journeys.md, business-policies.md, state-management.md / data-models.md)
- 3: Minor logical gaps in user journeys or missing some business policies
- 1: State machines or user journeys make no business sense, or business policies are entirely ignored

**Scannability** (density and structure):
- 5: High density throughout; processes/endpoints/architecture rendered as cards, grids, or tables; paragraphs ≤1 sentence; instantly scannable headings
- 3: Mostly structured but several prose-heavy sections or bullet walls remain
- 1: Wall-of-text output; low scannability; ignores card/grid formatting guidance

**Brevity** (conciseness & abstraction level):
- 5: Product-level focus throughout (~500 lines target), strictly no TS interface dumps or env variable dumps, concise diagram explanations (≤1 sentence/step), shallow directory tree (≤2 levels)
- 3: Mostly concise with minor leaks of implementation details, slightly verbose diagram explanations, or length between 500-700 lines
- 1: Implementation dump, full TypeScript interface/type dumps, localStorage/env variable dumps, numbering prose after diagrams, or length exceeding 700 lines

## Verdict Thresholds

- `approved`: All 10 dimensions ≥3, no critical issues
- `changes_needed`: Any dimension <3 OR any critical issue

## Issue Classification

- **Critical**: Factual error, missing entire planned section, broken navigation, TypeScript errors, architecture violations
- **Critical**: Dense prose — any paragraph exceeding 1 sentence or wall-of-text blocks
- **Critical**: Brevity violations — full TypeScript interface/type dumps, localStorage/env variable dumps, numbering prose after diagrams, or total length exceeding 700 lines
- **Minor**: Typo, slightly inconsistent tone, suboptimal heading level, missing citation, document length between 500-700 lines

## Issue Format for Writer

```markdown
### Issue: [Short description]
- **Location:** `[OUT_DIR]/docs/markdown/documentation.md` (Section: [Section Name])
- **Dimension:** [Accuracy|Completeness|Consistency|Structure|Usability|Type Safety|Architecture Alignment|Business Alignment|Scannability|Brevity]
- **Severity:** [Critical|Minor]
- **Issue:** [Description of what's wrong]
- **Suggestion:** [How to fix it]
```
