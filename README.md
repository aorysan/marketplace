# 🛍️ Aorysan Plugin Marketplace

A curated collection of Claude Code plugins built by [Aorysan](https://github.com/aorysan). Each plugin lives in its own directory and is self-contained with a `plugin.json` manifest, skills, and documentation.

## Plugins

| Plugin | Description | Version |
|--------|-------------|---------|
| [sitegen](./sitegen) | Master orchestrator for end-to-end website generation — from PDF intake to deployment. Handles intake, generation, SEO validation, debugging, and deployment. | 1.0.0 |
| [insightify](./insightify) | Generate artifact-style technical documentation and a Product Knowledge Base from code repositories, URLs, and files. | 6.4.1 |
| [compro](./compro) | Layer 3 Company Profile multi-agent plugin with slide deck generator and Vercel deployment. | 2.0.0 |
| [business-intelligence-layer](./business-intelligence-layer) | Strategic analysis plugin that turns Product Knowledge Base, Pitch Deck, Pricing, and Market Notes into a structured Business Knowledge Base, Business Audit Report, and Brand Story Guide. | 1.1.0 |

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
