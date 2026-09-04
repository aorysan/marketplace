# Insightify Writer HTML Cards Design

## Goal
Improve the `writer` skill/agent in the Insightify plugin so that it consistently generates structured HTML (`<div class="grid-2">`, `<div class="artifact-card">`) for enumerating components, directories, and API endpoints, instead of relying on standard markdown bullet points.

## Context
Currently, the `writer` skill is instructed to use `grid-2` and `artifact-card` for dense enumerations, but it frequently ignores this and emits standard markdown lists. The user has had to manually adjust the generated `documentation.md` (as seen in the `congen6` test) to force this structure. We want this to happen automatically without manual intervention.

## Proposed Changes

### 1. Update `writer/SKILL.md`
We will rewrite the "Artifact HTML Formatting" section in `d:\AryokPunya\Magang\insight\.claude\plugins\insightify\skills\writer\SKILL.md` to be much more forceful.

- **Hard Anti-Pattern Rule**: Explicitly forbid standard markdown lists (`-` or `*`) when describing directory structures, features, or APIs.
- **Mandatory HTML Usage**: Enforce that enumerations MUST be wrapped in `<div class="grid-2">` (or `grid-3`) and each item MUST be an `<div class="artifact-card">`.
- **Card Content Rules**:
  - The title inside the card MUST use an `<h4>` tag.
  - File names, paths, or code terms MUST be wrapped in `<code>` tags.

### 2. Inject Few-Shot Example
Provide a concrete template block inside `writer/SKILL.md` that the agent can copy. Example:

```html
### src/app

<div class="grid-2">
  <div class="artifact-card">
    <h4>Pages</h4>
    The main app at <code>page.tsx</code> plus <code>login</code> and <code>register</code> auth screens.
  </div>
  <div class="artifact-card">
    <h4>API routes</h4>
    <code>api/chat</code> powers the live AI chatbot.
  </div>
</div>
```

## Review & Verification
- Check the prompt against `writer/SKILL.md` to ensure it doesn't break existing rules.
- Test the pipeline or run the `writer` agent to verify it consistently follows the grid format.
