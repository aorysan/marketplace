# Sitegen Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor Sitegen skill documentation to use dynamic page lists, dynamic ports, strict Anime.js animation rules, explicit image URL validation, and synchronized sub-skill workflows.

**Architecture:** We are directly modifying the markdown `.md` files within the `.agents/skills/sitegen` directory. There is no software stack or tests, as these are prompt instructions for AI agents.

**Tech Stack:** Markdown

## Global Constraints

- No placeholders (like `picsum.photos`).
- Enforce Anime.js and remove pure CSS / Framer Motion contradictions.
- The `PAGES-LIST.md` file replaces the hardcoded 7 pages rule.
- Must read port dynamically rather than hardcoding `-p 3000`.

---

### Task 1: Update Planner Rules (Dynamic Pages & Images)

**Files:**
- Modify: `planner/SKILL.md`

**Interfaces:**
- Consumes: N/A
- Produces: Rules for generating `PAGES-LIST.md` and explicitly declaring image requirements in PRD.

- [ ] **Step 1: Modify planner/SKILL.md**

Edit `planner/SKILL.md` to add two rules:
1. The planner MUST output a `PAGES-LIST.md` file containing just the list of page names based on `PLAN-USER-NEEDS.md` and `PLAN-COMPETITOR.md`.
2. The planner MUST explicitly declare whether each section in a page's PRD requires an image (only if conceptually suitable).

- [ ] **Step 2: Commit**

```bash
git add planner/SKILL.md
git commit -m "docs: add dynamic pages list and image requirements to planner"
```

### Task 2: Update Master Orchestrator (SKILL.md & README.md)

**Files:**
- Modify: `SKILL.md`
- Modify: `README.md`

**Interfaces:**
- Consumes: `PAGES-LIST.md` from Task 1.
- Produces: Updated `SKILL.md` and `README.md` for orchestrator agent.

- [ ] **Step 1: Modify SKILL.md**

Edit `SKILL.md`:
1. Remove the hardcoded 7 pages. Change step 4 to read the `PAGES-LIST.md` file and loop through the pages listed there.
2. Remove `npm run dev -- -p 3000` and `npx kill-port 3000`. Instruct the agent to run `npm run dev` (let Next.js choose the port automatically) and read the terminal output to determine the active port for Playwright testing.

- [ ] **Step 2: Modify README.md**

Edit `README.md`:
1. Add `Research (/research)` as step 2 in the workflow, shifting subsequent steps down. This synchronizes it with `SKILL.md`.

- [ ] **Step 3: Commit**

```bash
git add SKILL.md README.md
git commit -m "docs: update orchestrator workflow with dynamic pages and dynamic port"
```

### Task 3: Update Generator Rules (Animation & Image Verification)

**Files:**
- Modify: `generator/SKILL.md`
- Modify: `generator/reference/sop.md`

**Interfaces:**
- Consumes: Image requirements from PRD (Task 1).
- Produces: Generator rules enforcing Anime.js Strict Mode cleanup and preventing image 404s/placeholders.

- [ ] **Step 1: Modify generator/SKILL.md**

Edit `generator/SKILL.md`:
1. In the animation rules (Section 61 or similar), add: "To prevent glitches in React Strict Mode, you MUST call `anime.remove(elementRef.current)` inside the `useEffect` cleanup return."
2. In the image rules, explicitly forbid placeholders (`picsum.photos`). State that all external images must return HTTP 200 OK. If no valid image is found, halt and ask the user to place images in `public/assets/`.

- [ ] **Step 2: Modify generator/reference/sop.md**

Edit `generator/reference/sop.md`:
1. Delete the "CSS murni" (pure CSS) rule regarding scroll animations to prevent conflicts with Anime.js.
2. Delete the rule instructing the use of `picsum.photos` placeholders.

- [ ] **Step 3: Commit**

```bash
git add generator/SKILL.md generator/reference/sop.md
git commit -m "docs: enforce anime.js strict cleanup and remove image placeholders in generator"
```

### Task 4: Update Debug Flow (Remove Framer Motion Check)

**Files:**
- Modify: `debug/SKILL.md`

**Interfaces:**
- Consumes: N/A
- Produces: Corrected debug rules aligned with generator rules.

- [ ] **Step 1: Modify debug/SKILL.md**

Edit `debug/SKILL.md`:
1. Delete the rule requiring the agent to check for `framer-motion` (line 42). 
2. Add a rule for Puppeteer to explicitly check for missing `alt` attributes and 404 broken image links.
3. Ensure the rule mentions checking for Anime.js animations instead of Framer Motion.

- [ ] **Step 2: Commit**

```bash
git add debug/SKILL.md
git commit -m "docs: remove framer-motion check and add 404 image check to debug flow"
```
