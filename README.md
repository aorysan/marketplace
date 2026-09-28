# 🛍️ Aorysan Plugin Marketplace

A curated collection of Claude Code plugins built by [Aorysan](https://github.com/aorysan). Each plugin lives in its own directory and is self-contained with a `plugin.json` manifest, skills, and documentation.

## Plugins

| Plugin | Description | Version |
|--------|-------------|---------|
| [sitegen](./sitegen) | Master orchestrator for end-to-end website generation — from PDF intake to deployment. Handles intake, generation, SEO validation, debugging, and deployment. | 1.0.0 |
| [insightify](./insightify) | Generate artifact-style technical documentation and a Product Knowledge Base from code repositories, URLs, and files. | 6.4.1 |
| [compro](./compro) | Layer 3 Company Profile multi-agent plugin with Aperture Cinematic slide deck generator and Vercel deployment. | 2.8.0 |
| [business-intelligence-layer](./business-intelligence-layer) | Strategic analysis plugin that turns Product Knowledge Base, Pitch Deck, Pricing, and Market Notes into a structured Business Knowledge Base, Business Audit Report, and Brand Story Guide. | 1.1.1 |

## Structure

```
marketplace/
├── README.md                          # This file
├── plugins.json                       # Machine-readable index of all plugins
├── sitegen/                           # Full website generation orchestrator
├── insightify/                        # Technical documentation generator
├── compro/                            # Company profile multi-agent plugin
└── business-intelligence-layer/       # Strategic business analysis plugin
```

## Installing a Plugin

Each plugin directory is self-contained. To use a plugin, point Claude Code at the plugin directory:

```bash
claude plugin add <marketplace-path>/<plugin-name>
```

Or reference a specific plugin via its repository. Each plugin's own README contains detailed installation and usage instructions.

## 🔁 Sync & Version Guard

Each directory here is a vendored copy of a plugin repository. Normally you do not have to do this by hand: after releasing a plugin, run the [Sync vendored plugins](./.github/workflows/sync-plugins.yml) workflow (Actions → *Sync vendored plugins* → *Run workflow*). It clones the four plugin repositories on a runner, mirrors them, propagates versions, runs the guard, and commits — so a release needs **no local clone of this repository** at all.

To do it by hand instead, refresh the copy from the plugin's committed tree and re-run the guard:

```bash
# 1. Refresh one plugin from its source repo (committed tree, tracked files only)
SRC=/path/to/plugin        # e.g. ../insight/.claude/plugins/insightify
DST=insightify
rm -rf "$DST" && mkdir -p "$DST"
git -C "$SRC" archive --format=tar HEAD | tar -x -C "$DST"

# 2. Propagate the plugin version into this repository's metadata, then verify it
node scripts/sync-versions.mjs
node scripts/check-versions.mjs
```

Use `git archive` rather than a plain file copy: it takes both the content and the file
modes from git. A working tree can carry executable bits git never tracked, and copying
those would land here as spurious mode-change commits.

`scripts/check-versions.mjs` compares the vendored `.claude-plugin/plugin.json` of every plugin against its entry in `.claude-plugin/marketplace.json`, `plugins.json`, and the README table. It exits `1` on any mismatch, so it can gate a push: a stale `version` field pins every install to a plugin version that no longer exists.
