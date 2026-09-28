# Color Data Extraction During Intake

## Overview

Insightify's intake parsers extract text content only — no visual/design data. Color values in HTML sources (inline `style=""` attributes and `<style>` tags) are currently discarded (`html-parser.js` strips `style` tags on line 5). This design adds mechanical color extraction to the HTML parser during the ingest phase, emitting the palette as a markdown section in the normalized `source-XXX.md` body.

This is **data-only**. The extracted palette is stored for downstream consumers (e.g., as intake for another plugin). Insightify's own pipeline stages (extract/plan/writer/builder) do not consume or render it.

## Architecture & Components

- New file `skills/planner/parsers/color-extractor.js` — CommonJS module. Exports `extractColors(htmlString, $)`.
  - Input: the raw HTML string and the already-loaded cheerio instance.
  - Returns an array of `{ color, hex }` entries (empty array when no colors present). Never throws.
- `html-parser.js` integration:
  1. Call `extractColors` **before** `<style>` tags are removed (current line 5).
  2. Append the rendered `## Colors` section to the output markdown body (only when non-empty).
- No changes to JSON/PDF/code parsers, the builder, or knowledge extraction.
- `planner/SKILL.md`: update the `.html`/`.htm` row note in the Supported Input Types table to read "Strips nav/footer/scripts, preserves content structure; extracts color palette data".
- No new dependencies (regex + cheerio only).

## Data Format

Section appended to the body of `source-XXX.md`:

```markdown
## Colors

| Color | Hex |
|-------|-----|
| rgb(26, 115, 232) | #1a73e8 |
| #ffffff | #ffffff |
```

- **Color**: raw original value exactly as written in the source (hex / `rgb()` / `rgba()` / `hsl()` / `hsla()`).
- **Hex**: normalized color value in hex — shorthand `#abc` expanded to `#aabbcc`; `rgb()`/`rgba()`/`hsl()`/`hsla()` converted to their hex equivalent (alpha preserved for rgba/hsla via 8-digit hex).
- Deduplicated by Hex; the first raw occurrence encountered is kept.
- Contexts and frequency are intentionally excluded.
- When no colors are found, the section is omitted entirely (no empty `## Colors` header).

## Extraction Rules

- Sources: `style=""` attributes on any element **and** `<style>` tag contents.
- Captured formats: `hex` (`#rgb`, `#rrggbb`, case-insensitive), `rgb()`, `rgba()`, `hsl()`, `hsla()`.
- Matched on any CSS declaration whose value contains a supported color format — property name is irrelevant (`color`, `background`, `background-color`, `border`, `fill`, shadows, etc.). Inline style attributes are parsed the same way.
- Execution happens before `<style>` stripping so the color data is captured even though the tags are removed from content.

## Error Handling

- HTML with no `<style>` and no inline styles → `extractColors` returns `[]`, no `## Colors` section, ingest proceeds normally.
- Malformed CSS (unbalanced braces, invalid declaration syntax) → the affected rule is skipped silently; remaining rules still processed.
- `extractColors` never throws; any internal error returns `[]`.

## Testing Strategy

New test file `tests/color-extractor.test.js` (matches existing pattern, run via `npm test` / `node --test`):
- Hex: 3-digit, 6-digit, uppercase → normalized to lowercase 6-digit hex.
- `rgb()` / `rgba()` / `hsl()` / `hsla()` → correct hex conversion.
- Colors from `<style>` across multiple rules.
- Colors from inline `style=""` attributes.
- Deduplication: same value from `<style>` + inline collapses to one row.
- No-color document → empty array / no section.
- Malformed CSS skipped without error.

Check `tests/ingest-parsers.test.js` for existing html-parser content assertions and update fixtures accordingly if they assert full-body content.