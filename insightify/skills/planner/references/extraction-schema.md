# Knowledge Extraction Schema Reference

Extracted knowledge MUST be categorized into archetype-specific files under `[OUT_DIR]/.insightify/knowledge/` (up to 10 for `frontend-spa`; see planner SKILL.md Phase 0):

1. `product.md`: Product name, description, target audience, value proposition, tech stack.
2. `directory-structure.md`: Feature-based modular folder tree with purpose descriptions.
3. `architecture.md`: Component hierarchy, layout wrappers, routing structure, module boundaries, data models (entity names + purpose only, not full field listings).
4. `state-and-data.md`: Global and local state stores, data models, hooks, selectors, persistence.
5. `design-system.md`: Reusable UI primitives, components inventory, design tokens, accessibility.
6. `api-patterns.md`: API client patterns, endpoints, hooks, request/response models.
7. `features-and-journeys.md`: Feature catalog, personas, end-to-end task flows, requirements, user interactions.
8. `business-policies.md`: Business rules, validation policies, SLAs, compliance, shared concerns (auth, logging, error handling), domain glossary.
9. `constraints-and-limits.md`: Technical limitations, performance budgets, version constraints, security, known issues.
10. `workflows.md`: Step-by-step procedures, execution flows, CI/CD, deployment, release.
11. `unanswered.md`: Gaps, contradictions, ambiguities, missing information.

Each file MUST contain YAML frontmatter:

```yaml
---
category: "<category_name>"
extracted_from:
  - source-001.md
confidence: "high" | "medium" | "low"
extracted_at: "YYYY-MM-DDTHH:mm:ssZ"
---
```
