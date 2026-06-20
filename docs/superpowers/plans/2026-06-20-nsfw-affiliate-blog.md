# Nightfall NSFW Affiliate Blog — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a fully SEO-optimized NSFW affiliate blog using Ghost CMS with a custom "Nightfall" theme, Caddy reverse proxy, and Docker Compose orchestration.

**Architecture:** Three Docker services (Caddy → Ghost → MySQL) behind a single `docker-compose.yml`. A custom Ghost Handlebars theme provides the dark/neon glassmorphism UI with age verification, affiliate CTA components, ad slots, and comprehensive structured data for SEO.

**Tech Stack:** Ghost 5 (Node.js CMS), Handlebars (templating), Vanilla CSS + JS (no frameworks), Caddy 2 (reverse proxy + auto-SSL), MySQL 8.0, Docker Compose v3.

**Spec:** [2026-06-20-nsfw-affiliate-blog-design.md](file:///Users/vizionik/NSFW-Aff-Blog/docs/superpowers/specs/2026-06-20-nsfw-affiliate-blog-design.md)

---

## File Map

| File | Responsibility |
|------|----------------|
| `docker-compose.yml` | Defines Caddy, Ghost, MySQL services, volumes, and network |
| `Caddyfile` | Reverse proxy config, compression, security headers, robots.txt |
| `.env.example` | Template for environment variables (domain, DB password) |
| `README.md` | Setup guide, deployment, customization reference |
| `ghost/themes/nightfall/package.json` | Theme metadata for Ghost |
| `ghost/themes/nightfall/default.hbs` | Base HTML layout shell |
| `ghost/themes/nightfall/index.hbs` | Homepage template |
| `ghost/themes/nightfall/post.hbs` | Single article template |
| `ghost/themes/nightfall/page.hbs` | Static page template |
| `ghost/themes/nightfall/page-landing.hbs` | Affiliate landing page custom template |
| `ghost/themes/nightfall/page-comparisons.hbs` | Comparison/top-10 custom template |
| `ghost/themes/nightfall/tag.hbs` | Tag archive template |
| `ghost/themes/nightfall/author.hbs` | Author page template |
| `ghost/themes/nightfall/error.hbs` | 404/error page template |
| `ghost/themes/nightfall/partials/navbar.hbs` | Fixed navigation bar |
| `ghost/themes/nightfall/partials/footer.hbs` | Site footer with legal links |
| `ghost/themes/nightfall/partials/age-gate.hbs` | 18+ verification overlay |
| `ghost/themes/nightfall/partials/affiliate-cta.hbs` | Reusable affiliate offer card |
| `ghost/themes/nightfall/partials/newsletter-form.hbs` | Email subscription form |
| `ghost/themes/nightfall/partials/ad-slot.hbs` | Ad container slot |
| `ghost/themes/nightfall/partials/post-card.hbs` | Post preview card component |
| `ghost/themes/nightfall/partials/comparison-table.hbs` | Comparison table component |
| `ghost/themes/nightfall/partials/seo-meta.hbs` | JSON-LD structured data |
| `ghost/themes/nightfall/assets/css/style.css` | All styles — design tokens, components, responsive |
| `ghost/themes/nightfall/assets/js/main.js` | Age gate, mobile nav, scroll reveals, navbar effects |

---

_Full task content is in the spec plan file._
