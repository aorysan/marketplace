---
title: "Constraints & Limits"
description: "Technical limitations, performance budgets, version constraints, security, and known issues"
audience: "developers, architects"
sources:
  - constraints-and-limits.md
---

## Overview

Explicit technical limitations, performance budgets, dependency/version constraints, security requirements, and known issues with workarounds. These constraints form the boundary the team agrees not to cross and guide future architecture decisions.

---

## 1. Technical Constraints

### Runtime Requirements
| Constraint | Detail |
|------------|--------|
| Browser support | <List of supported browsers / minimum versions> |
| Node version | <Minimum Node.js version> |
| Rendering | <SPA / SSR / SSG model> |

### Build & Bundle Constraints
| Constraint | Detail |
|------------|--------|
| Bundler | <Vite / Webpack...> |
| Code splitting | <Route-level + vendor splitting policy> |

### Dependency Constraints
| Constraint | Detail |
|------------|--------|
| Core framework | <Framework + pinned major version> |
| Peer dependencies | <Must-match exact versions> |

---

## 2. Performance Budgets

### Core Web Vitals Targets
| Metric | Target |
|--------|--------|
| LCP | <e.g. ≤ 2.5s> |
| INP | <e.g. ≤ 200ms> |
| CLS | <e.g. ≤ 0.1> |

### Bundle Budgets (per route)
| Chunk | Budget |
|-------|--------|
| Vendor | <e.g. ≤ 300 kB gzip> |
| Route | <e.g. ≤ 150 kB gzip> |
| Initial (critical) | <e.g. ≤ 200 kB gzip> |

---

## 3. Dependency Constraints

### Peer Dependencies (Must Match Exactly)
| Dependency | Version |
|------------|---------|
| <peerDep> | <exact version> |

### Known Version Conflicts
| Package | Conflict | Resolution |
|---------|----------|------------|
| <pkg> | <conflict with X> | <pin/override/upgrade path> |

---

## 4. Security Requirements

| Requirement | Implementation |
|-------------|----------------|
| Authentication | <JWT session / cookie policy, token rotation> |
| Authorization | <RBAC roles & guards, least privilege> |
| Data handling | <PII minimization, encryption at rest/in transit, no secrets in client> |
| Dependency scanning | <SCA in CI, license audit> |

---

## 5. Operational Constraints

### Deployment
| Area | Constraint |
|------|------------|
| Hosting | <Platform / region> |
| Release | <Cadence, blue-green / canary> |

### Monitoring
| Area | Constraint |
|------|------------|
| Observability | <Logs, metrics, traces collection> |
| Alerts | <On-call & severity policy> |

---

## 6. Known Issues & Workarounds

| Issue | Impact | Workaround / Status |
|-------|--------|---------------------|
| <Issue 1> | <Impact / affected area> | <Workaround or tracking issue link> |
| <Issue 2> | <Impact / affected area> | <Workaround or tracking issue link> |
| <Issue 3> | <Impact / affected area> | <Workaround or tracking issue link> |

---

## 7. Browser-Specific Limitations

| Browser | Limitation | Mitigation |
|---------|------------|-----------|
| <Browser> | <Specific limitation> | <Polyfill / feature detection> |

---

## 8. Scalability Limits

| Dimension | Limit | Mitigation |
|-----------|-------|-----------|
| Concurrent users | <Approx. supported ceiling> | <Scaling strategy> |
| Data volume | <Approx. row/size ceiling> | <Pagination, archiving, caching> |

---

## 9. Migration Constraints

| Area | Constraint |
|------|------------|
| Data | <Migration & rollback constraints> |
| API | <Versioning & deprecation policy> |
| Infrastructure | <Zero-downtime requirements> |
