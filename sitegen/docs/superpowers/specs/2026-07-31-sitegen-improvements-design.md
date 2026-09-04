# Sitegen Skill Improvements Design

## Background
Sitegen is an orchestrator agent that scaffolds a Next.js website based on a PDF company profile. The workflow currently has hardcoded pages, port conflict risks, image rendering issues (404/placeholders), and animation glitches due to contradictory rules in sub-skills.

## Modifications

### 1. Dynamic Pages (`sitegen/SKILL.md`)
- Remove the hardcoded 7 pages requirement (Beranda, Layanan, About, Portofolio, Kontak, Blog, Karir).
- Modify step 4 to read from a dynamically generated file `PAGES-LIST.md`.
- The `planner` sub-skill must be updated to output `PAGES-LIST.md` based on `PLAN-USER-NEEDS.md` and `PLAN-COMPETITOR.md`.

### 2. Documentation Synchronization (`sitegen/README.md`)
- Insert the `Research` phase into `README.md` as step 2.
- Ensure the master workflow described in `README.md` matches `SKILL.md` exactly.

### 3. Dynamic Port Configuration (`sitegen/SKILL.md`)
- Remove `npx kill-port 3000` and `-p 3000` instructions.
- Change dev server startup instruction to let Next.js find an available port automatically.
- Instruct the orchestrator agent to parse the active port from the terminal output to pass to Playwright.

### 4. Animation Fixes (`generator/SKILL.md` & `generator/reference/sop.md`)
- **Generator SOP Update**: Delete the contradictory "CSS murni (pure CSS)" rule in `generator/reference/sop.md`. Enforce Anime.js across all docs.
- **Strict Mode Cleanup**: Add a strict rule in `generator/SKILL.md` requiring `anime.remove(elementRef.current)` or equivalent in the `useEffect` cleanup function of `AnimatedSection.tsx` to prevent animation glitching due to React Strict Mode double invocation.

### 5. Image Handling (`planner` & `generator/reference/sop.md`)
- **Forbid Placeholders**: Remove the `picsum.photos` rule in `generator/reference/sop.md`.
- **Planner Update**: Require the planner to declare image needs per section explicitly in the PRD (only if the section conceptually fits an image).
- **Generator Verification**: The generator MUST verify external image URLs (HTTP 200). If verification fails, it must halt and ask the user to provide local image assets in `public/assets/`. Do not insert broken links or placeholders.

### 6. Debug Flow Fixes (`debug/SKILL.md`)
- **Remove Framer Motion Check**: Delete the instruction in `debug/SKILL.md` requiring the agent to check for `framer-motion`.
- **Add Anime.js & Image 404 Checks**: Ensure the Puppeteer crawler checks for missing `alt` tags and 404 errors on images, and verifies Anime.js animations.

## Spec Self-Review
- Placeholders: None.
- Contradictions: None. Generator and Debug are now fully aligned on Anime.js.
- Scope: Focused entirely on instruction updates to the existing skill files.
