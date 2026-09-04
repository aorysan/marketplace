# Documentation Review Criteria (10 Dimensions)

1. **Accuracy**: Compare `[OUT_DIR]/docs/markdown/*` against `[OUT_DIR]/.insightify/knowledge/*`. All claims must match knowledge facts.
2. **Completeness**: Compare `[OUT_DIR]/docs/markdown/*` against `[OUT_DIR]/.insightify/plan.md`. All planned sections must be present.
3. **Consistency**: Terminology, tone, formatting must be uniform across all `[OUT_DIR]/docs/markdown/*`.
4. **Structure**: Heading levels must be incremental (H1 -> H2 -> H3). Links between pages must be valid.
5. **Usability**: Clear code examples, readable prose targeted to the intended audience.
6. **Type Safety**: TypeScript interfaces valid, no `any` without justification, strict mode compatible, generics properly used.
7. **Architecture Alignment**: Documentation accurately reflects the project's actual architectural patterns as extracted in the knowledge base (state management, routing, API layer, component structure, cross-cutting concerns).
8. **Business Alignment**: User journeys, state machines, and business policies are logically sound and well-represented as extracted in the knowledge base (user-journeys.md, business-policies.md, state-management.md / data-models.md).
9. **Scannability**: High information density with minimal long prose paragraphs. Dense, enumerable information (architecture, endpoints, processes) is structured as cards, grids, or tables rather than bullet lists or paragraph walls.
10. **Brevity**: Product-level abstraction maintained (~500 lines target, strictly <700 lines). No raw TypeScript interface/type dumps, no localStorage/environment variable dumps, no redundant duplicate sections (anchors used), shallow directory trees (≤2 levels), and concise diagram explanations (≤1 sentence per step/node).

Report Verdicts:
- `approved`: All 10 dimensions ≥3, no critical issues.
- `changes_needed`: Any dimension <3 OR any critical issue.

Safety Valve:
- Max 3 iteration loops. After 3 loops, escalate remaining issues to user.

## Scoring Rubric (1-5 per dimension)

**Accuracy** (vs knowledge base):
- 5: All facts match, no unsupported claims
- 3: Minor inaccuracies or missing nuances
- 1: Major factual errors or contradictions

**Completeness** (vs plan):
- 5: All planned sections present and substantive
- 3: Most sections present, some thin
- 1: Major planned sections missing

**Consistency** (cross-page):
- 5: Terminology, tone, formatting uniform
- 3: Minor inconsistencies
- 1: Same concept different names, mixed tone, inconsistent formatting

**Structure** (heading/link integrity):
- 5: Heading levels incremental, all internal links valid, no orphans
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
- 5: User journeys, state machines, and business policies are logically sound, accurately extracted, and well-represented
- 3: Minor logical gaps in user journeys or missing some business policies
- 1: State machines or user journeys make no business sense, or business policies are entirely ignored

**Scannability** (density and structure):
- 5: High density throughout; processes/endpoints/architecture rendered as cards, grids, or tables; paragraphs ≤1 sentence; instantly scannable headings
- 3: Mostly structured but several prose-heavy sections or bullet walls remain
- 1: Wall-of-text output; low scannability; ignores card/grid formatting guidance

**Brevity** (product-level abstraction & conciseness):
- 5: Product-level focus throughout (~500 lines target); strictly no TS interface/type dumps or env variable listings; concise Mermaid explanations (≤1 sentence/step); shallow directory tree (≤2 levels).
- 3: Mostly product-focused with some leaks of implementation details, slightly verbose diagram explanations, or length between 500-700 lines.
- 1: Implementation dump, full TypeScript interface/type dumps, localStorage/env variable listings, multi-sentence narrative prose after diagrams, or total length exceeding 700 lines.
