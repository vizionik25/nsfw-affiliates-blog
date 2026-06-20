# NSFW Affiliate Blog — Design Specification

**Date:** 2026-06-20
**Status:** Approved
**Stack:** Ghost CMS · Caddy · MySQL 8.0 · Docker Compose
**Theme Codename:** Nightfall

---

## 1. Project Overview

A fully SEO-optimized NSFW affiliate blog covering multiple adult verticals (dating, content platforms, products, cam sites). The blog serves as a content-driven funnel to promote affiliate offers through articles, reviews, comparison pages, and dedicated landing pages. It includes a newsletter signup funnel and is pre-wired for ad placements.

### Goals

- High-converting affiliate content site with premium dark/neon aesthetic
- Zero-friction deployment via Docker Compose
- Comprehensive SEO from day one (structured data, semantic HTML, Core Web Vitals)
- Ad-ready layout with pre-defined slots that activate when ad code is inserted
- 18+ age verification gate with localStorage persistence

### Non-Goals

- User accounts / membership paywalls (Ghost memberships disabled for this use case)
- E-commerce / direct product sales
- Forum or community features
- Server provisioning or hosting setup guidance

---

## 2. Architecture

```
Internet
   │
   ▼
┌──────────────────────────────────────────┐
│            Caddy (ports 80/443)          │
│       Automatic HTTPS via ACME           │
│       Reverse proxy → ghost:2368         │
│       Static robots.txt serving          │
│       Gzip compression                   │
│       Security headers                   │
└──────────────────┬───────────────────────┘
                   │
┌──────────────────▼───────────────────────┐
│            Ghost CMS (Node.js)           │
│       Content API + Admin at /ghost/     │
│       Custom "Nightfall" theme           │
│       Built-in sitemap + RSS             │
└──────────────────┬───────────────────────┘
                   │
┌──────────────────▼───────────────────────┐
│              MySQL 8.0                   │
│         Ghost content database           │
│         Named volume persistence         │
└──────────────────────────────────────────┘
```

### Docker Compose Services

| Service | Image | Ports | Notes |
|---------|-------|-------|-------|
| `caddy` | `caddy:2-alpine` | `80:80`, `443:443` | Mounts `Caddyfile`, persists certs in named volume |
| `ghost` | `ghost:5-alpine` | Internal `2368` only | Mounts theme directory, env-configured for MySQL |
| `db` | `mysql:8.0` | Internal `3306` only | Named volume for data persistence |

### Named Volumes

- `caddy_data` — TLS certificates and ACME state
- `caddy_config` — Caddy server config
- `ghost_content` — Ghost content directory (images, themes, settings)
- `mysql_data` — MySQL database files

### Network

Single Docker bridge network `blog_network`. Ghost and MySQL communicate internally. Only Caddy exposes ports to the host.

---

## 3. Caddy Configuration

The `Caddyfile` provides:

- **Automatic HTTPS** — Caddy handles Let's Encrypt certificate provisioning and renewal with zero configuration
- **Reverse proxy** — All traffic proxied to `ghost:2368`
- **Compression** — `encode gzip` for all responses
- **Security headers** — `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`
- **Static file serving** — `/robots.txt` served directly by Caddy
- **Placeholder domain** — Ships with `yourdomain.com` placeholder; user replaces before deployment

---

## 4. Ghost CMS Configuration

### Environment Variables (via docker-compose.yml)

| Variable | Value | Purpose |
|----------|-------|---------|
| `url` | `https://yourdomain.com` | Site canonical URL (user replaces) |
| `database__client` | `mysql` | Database driver |
| `database__connection__host` | `db` | MySQL service name |
| `database__connection__database` | `ghost` | Database name |
| `database__connection__user` | `ghost` | Database user |
| `database__connection__password` | (generated) | Database password |
| `NODE_ENV` | `production` | Run in production mode |

### Ghost Settings (applied via admin after first boot)

- Active theme: `nightfall`
- Memberships: Disabled (no signup/login for visitors beyond newsletter)
- Newsletter: Enabled for email collection
- Labs → Portal: Disabled (we use our own styled newsletter form)

---

## 5. Theme: Nightfall

### 5.1 Design Language

**Color Palette:**

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | `#0a0a0f` | Page background |
| `--bg-secondary` | `#111118` | Card backgrounds |
| `--bg-glass` | `rgba(17, 17, 24, 0.7)` | Glassmorphism panels |
| `--accent-purple` | `#9333ea` | Primary accent, links |
| `--accent-pink` | `#ec4899` | CTA buttons, highlights |
| `--accent-cyan` | `#06b6d4` | Secondary accent, badges |
| `--text-primary` | `#f0f0f5` | Body text |
| `--text-secondary` | `#9ca3af` | Muted text, captions |
| `--text-tertiary` | `#6b7280` | Subtle labels |
| `--border-glass` | `rgba(255, 255, 255, 0.08)` | Glass card borders |
| `--glow-purple` | `0 0 20px rgba(147, 51, 234, 0.3)` | Hover glow effect |
| `--glow-pink` | `0 0 20px rgba(236, 72, 153, 0.3)` | CTA glow effect |

**Typography:**

- Headings: **Outfit** (700, 800 weights) — via Google Fonts
- Body: **Inter** (400, 500, 600 weights) — via Google Fonts
- Base size: 16px, scale ratio 1.25 (Major Third)

**Effects:**

- Glassmorphism: `backdrop-filter: blur(12px)` with `--bg-glass` background and `--border-glass` borders
- Card hover: Translate Y -4px + `--glow-purple` box shadow
- CTA buttons: Gradient background (purple → pink) with `--glow-pink` on hover + scale(1.02) transform
- Scroll reveals: CSS `@keyframes fadeInUp` triggered by `IntersectionObserver` in JS
- Gradient text: `background-clip: text` with purple-to-pink gradient on hero headings

### 5.2 Template Files

#### `default.hbs` — Base Layout

The shell for every page. Contains:

- `<!DOCTYPE html>` with `lang="en"`
- `<head>`: charset, viewport, preconnect to Google Fonts, font stylesheet, theme CSS, Ghost head injection `{{ghost_head}}`
- SEO meta partial: `{{> seo-meta}}`
- `<body>`: age gate partial → navbar partial → `{{{body}}}` → footer partial → ad slots → theme JS → Ghost foot injection `{{ghost_foot}}`

#### `index.hbs` — Homepage

Sections (top to bottom):

1. **Hero** — Full-width gradient background with large heading ("Explore. Discover. Indulge."), subheading, and primary CTA button. Animated gradient border.
2. **Featured Posts** — 3-card grid of featured/pinned posts (`{{#get "posts" filter="featured:true" limit="3"}}`). Glassmorphism cards with thumbnail, tag badge, title, excerpt.
3. **Latest Posts** — Responsive grid (3 columns desktop, 2 tablet, 1 mobile) of recent posts. Uses `{{#foreach posts}}` with the `post-card` partial. Pagination at bottom.
4. **Category Sections** — For each major tag, a horizontal scrolling row of post cards. Uses `{{#get "posts" filter="tag:dating" limit="6"}}` pattern.
5. **Newsletter Signup** — Full-width section with glassmorphism card, heading, description, and styled email input + submit button.

#### `post.hbs` — Article Page

Layout: Two-column on desktop (content + sidebar), single column on mobile.

**Content Column:**

- Post header: tag badge, title (`<h1>`), author + date + reading time, featured image
- Post body: `{{content}}` — Ghost renders Mobiledoc/Lexical to HTML
- Affiliate CTA block: Inserted via `{{> affiliate-cta}}` after the content (also insertable mid-content via Ghost's HTML card)
- Author bio card: Photo, name, bio, social links
- Related posts: 3-card grid using `{{#get "posts" filter="tags:[{{post.primary_tag.slug}}]+id:-{{post.id}}" limit="3"}}`

**Sidebar (desktop only):**

- Sticky position
- Newsletter signup (compact version)
- Ad slot (`{{> ad-slot position="sidebar"}}`)
- Popular posts list — Uses Ghost's internal tag `#popular` (tags prefixed with `#` are hidden from public). Authors manually tag their top-performing posts with `#popular`. The sidebar queries `{{#get "posts" filter="tag:hash-popular" limit="5"}}` to display them.

#### `page.hbs` — Static Pages

Simple full-width content layout. Used for About, Disclaimer, Privacy Policy, Terms of Service, DMCA. Clean typography, no sidebar.

#### `page-landing.hbs` — Affiliate Landing Page

Custom template (selected in Ghost editor via template dropdown). Single-offer focus:

- Hero with offer name, large image/graphic, value proposition
- Feature list with icons
- Pros/cons card (glassmorphism)
- Large CTA button (full-width, animated glow)
- FAQ accordion (CSS-only using `<details>/<summary>`)
- Trust signals section

Activated by creating a page in Ghost and selecting "Landing Page" template.

#### `page-comparisons.hbs` — Comparison/Top-10 Page

Custom template for review roundups:

- Page title + intro content from Ghost editor
- Styled comparison table with columns: Rank, Name, Rating (stars), Key Feature, Price, CTA button
- Each row is a glassmorphism card on mobile (table transforms to card layout)
- Individual detailed review sections below the table (anchor-linked from table rows)

Content for the comparison rows is authored using Ghost's HTML card with specific CSS classes that the theme styles.

#### `tag.hbs` — Tag/Category Archives

- Tag header: Tag name, description, post count
- Post grid: Same card layout as index.hbs
- Pagination

#### `author.hbs` — Author Page

- Author header: Avatar, name, bio, social links, post count
- Post grid: Their posts in card layout
- Pagination

### 5.3 Partials

#### `partials/navbar.hbs`

- Fixed top navigation, glassmorphism background
- Logo/site title on left
- Navigation links from Ghost settings (`{{navigation}}`)
- Mobile: Hamburger menu → slide-in drawer with backdrop blur

#### `partials/footer.hbs`

- Dark section with site description, navigation links, social icons
- Legal links row: Privacy Policy, Terms, DMCA, Disclaimer
- 18+ disclaimer text: "This website contains age-restricted content. By using this site, you confirm you are 18 years of age or older."
- Copyright notice

#### `partials/age-gate.hbs`

- Full-screen overlay (`position: fixed`, `z-index: 9999`)
- Centered glassmorphism card
- Warning icon (⚠️ or shield icon via SVG)
- Heading: "Age Verification Required"
- Text: "This website contains adult content. You must be 18 years or older to enter."
- Two buttons: "I Am 18+" (primary, purple-pink gradient) and "Leave" (secondary, redirects to Google)
- JavaScript: On "I Am 18+" click → `localStorage.setItem('age_verified', 'true')` → hide overlay
- On page load: Check `localStorage.getItem('age_verified')` — if truthy, hide overlay immediately, else show it
- No scrolling allowed while gate is visible (`body.overflow: hidden`)

#### `partials/affiliate-cta.hbs`

Reusable affiliate call-to-action block. Rendered as a glassmorphism card with:

- Offer name/heading
- Short description
- Star rating (visual stars via CSS)
- CTA button (gradient, animated glow)
- "Visit Site →" link

Content is passed via Ghost's HTML card using data attributes or structured HTML that the theme CSS styles. This allows editors to create offer blocks by pasting a template HTML snippet in the Ghost editor.

#### `partials/newsletter-form.hbs`

- Uses Ghost's native `data-members-form="subscribe"` form attribute for newsletter signups
- Since memberships are set to "free only" mode (no paid tiers), the form collects email addresses for the newsletter without creating member accounts with login access
- Styled: glassmorphism card, email input with purple border-glow on focus, gradient submit button
- Success state: Shows a "Welcome aboard!" message with fade-in animation
- Error state: Shows inline error with subtle shake animation

#### `partials/ad-slot.hbs`

- Container `<div>` with class `ad-slot ad-slot--{position}`
- Positions: `header`, `sidebar`, `in-content`, `footer`
- Default: `display: none` via CSS
- Activated by adding ad code to Ghost's code injection (site-wide) or per-post code injection
- CSS rule: `.ad-slot:not(:empty) { display: block; }` — auto-shows when content is injected

#### `partials/post-card.hbs`

- Glassmorphism card component
- Featured image (lazy loaded, `loading="lazy"`)
- Tag badge (colored by tag accent)
- Title (linked)
- Excerpt (2-3 lines, truncated)
- Author avatar + name + date
- Hover: translateY(-4px) + purple glow

#### `partials/comparison-table.hbs`

- Responsive table component
- Desktop: Full table with columns
- Mobile: Each row becomes a stacked card
- Star rating component (CSS-only using `clip-path` or unicode stars)
- CTA buttons per row

#### `partials/seo-meta.hbs`

Injects structured data and meta tags not covered by Ghost's defaults:

- JSON-LD `Organization` schema (site-wide)
- JSON-LD `WebSite` schema with `SearchAction` (for Google sitelinks search)
- JSON-LD `BreadcrumbList` (context-aware: Home → Tag → Post)
- JSON-LD `BlogPosting` / `Article` (on post pages, with author, datePublished, dateModified, image)
- Open Graph tags (supplementing Ghost's built-in ones where needed)
- Twitter Card meta
- Canonical URL (Ghost handles this, but partial ensures it's present)

### 5.4 Assets

#### `assets/css/style.css`

Single CSS file. Structure:

1. **CSS Custom Properties** — All design tokens (colors, typography, spacing, shadows)
2. **Reset/Base** — Modern CSS reset, box-sizing, smooth scrolling
3. **Typography** — Heading scale, body text, links, lists
4. **Layout** — CSS Grid utilities, container widths, responsive breakpoints
5. **Components** — Navbar, footer, post-card, age-gate, affiliate-cta, newsletter-form, ad-slot, comparison-table, buttons, badges
6. **Glassmorphism** — Reusable glass panel class with backdrop-filter
7. **Animations** — Keyframes for fadeInUp, glow pulse, gradient shift, hover transitions
8. **Page-specific** — Hero section, post layout, landing page, comparison page
9. **Responsive** — Media queries (mobile-first: `min-width: 768px`, `min-width: 1024px`, `min-width: 1280px`)
10. **Utility** — Screen reader only, hidden, truncation

No CSS framework. No preprocessor. Pure vanilla CSS with custom properties for theming.

#### `assets/js/main.js`

Minimal JavaScript. Functions:

1. **Age gate** — localStorage check, show/hide overlay, button handlers
2. **Mobile nav** — Hamburger toggle, drawer open/close, body scroll lock
3. **Scroll reveals** — IntersectionObserver that adds `.revealed` class to `.reveal-on-scroll` elements
4. **Navbar scroll effect** — Add `.scrolled` class to navbar on scroll (increases backdrop blur)
5. **Lazy image loading** — Native `loading="lazy"` is used on `<img>` tags; JS is a fallback for older browsers only
6. **Smooth scroll** — For anchor links (comparison table → review sections)

No jQuery. No framework. Vanilla JS, ES6+, under 5KB minified.

---

## 6. SEO Implementation Checklist

### On-Page SEO

- [x] Dynamic `<title>` tags — Ghost generates from post/page titles
- [x] Meta descriptions — Ghost's excerpt field maps to meta description
- [x] Single `<h1>` per page — Enforced in templates
- [x] Proper heading hierarchy — `<h1>` → `<h2>` → `<h3>` in templates
- [x] Semantic HTML5 — `<article>`, `<nav>`, `<main>`, `<aside>`, `<header>`, `<footer>`, `<section>`, `<figure>`
- [x] Canonical URLs — Ghost built-in
- [x] Alt text on images — Ghost's editor supports alt text on every image
- [x] Internal linking — Related posts, category sections, breadcrumbs

### Technical SEO

- [x] XML Sitemap — Ghost auto-generates at `/sitemap.xml`
- [x] RSS Feed — Ghost auto-generates at `/rss/`
- [x] `robots.txt` — Served by Caddy, allows all crawlers, references sitemap
- [x] Structured data (JSON-LD) — Article, BlogPosting, Organization, WebSite, BreadcrumbList
- [x] Open Graph tags — Ghost built-in + theme supplementation
- [x] Twitter Card meta — Ghost built-in + theme supplementation
- [x] Responsive design — Mobile-first CSS, passes Google mobile-friendly test
- [x] Fast page loads — No render-blocking JS, minimal CSS, lazy images, Caddy gzip
- [x] Clean URL structure — Ghost uses `/slug/` format by default

### Core Web Vitals Optimizations

- [x] **LCP** — Hero images use `fetchpriority="high"`, fonts preloaded, critical CSS inlined in `<head>` if needed
- [x] **INP** — No heavy JS event handlers, all interactions are CSS transitions
- [x] **CLS** — Image dimensions specified, ad slots reserve no space when empty, font-display: swap

### Content SEO (author responsibilities, documented in README)

- [ ] Keyword research per post
- [ ] Optimized post slugs
- [ ] Internal linking strategy
- [ ] Image alt text on all uploads
- [ ] Meta descriptions via Ghost's SEO settings per post

---

## 7. Ad Integration Strategy

Pre-defined ad slot positions:

| Position | Location | Visibility |
|----------|----------|------------|
| `header` | Below navbar, above content | Hidden until populated |
| `sidebar` | Right sidebar on post pages | Hidden until populated |
| `in-content` | After 3rd paragraph in posts (via Ghost HTML card) | Hidden until populated |
| `footer` | Above footer | Hidden until populated |

**Activation method:** Insert ad network code (e.g., ExoClick, JuicyAds, TrafficStars) into Ghost's code injection panel (Settings → Code injection → Site footer) targeting the slot class names, or directly into the theme partials.

The CSS rule `.ad-slot:not(:empty) { display: block; }` ensures slots only appear when they contain ad code.

---

## 8. File Structure

```
NSFW-Aff-Blog/
├── docker-compose.yml
├── Caddyfile
├── .env.example                    # Template for environment variables
├── README.md                       # Setup guide, configuration reference
├── ghost/
│   └── themes/
│       └── nightfall/
│           ├── package.json        # Theme metadata (name, version, Ghost compatibility)
│           ├── default.hbs         # Base layout
│           ├── index.hbs           # Homepage
│           ├── post.hbs            # Single post
│           ├── page.hbs            # Static page
│           ├── page-landing.hbs    # Affiliate landing page template
│           ├── page-comparisons.hbs # Comparison/review page template
│           ├── tag.hbs             # Tag archive
│           ├── author.hbs          # Author page
│           ├── error.hbs           # 404 and error page
│           ├── partials/
│           │   ├── navbar.hbs
│           │   ├── footer.hbs
│           │   ├── age-gate.hbs
│           │   ├── affiliate-cta.hbs
│           │   ├── newsletter-form.hbs
│           │   ├── ad-slot.hbs
│           │   ├── post-card.hbs
│           │   ├── comparison-table.hbs
│           │   └── seo-meta.hbs
│           └── assets/
│               ├── css/
│               │   └── style.css
│               └── js/
│                   └── main.js
└── docs/
    └── superpowers/
        └── specs/
            └── 2026-06-20-nsfw-affiliate-blog-design.md
```

---

## 9. Configuration & Customization Points

| What | Where | How |
|------|-------|-----|
| Domain name | `Caddyfile` + `docker-compose.yml` (`url` env var) | Replace `yourdomain.com` |
| Database password | `.env` file (referenced in docker-compose.yml) | Set before first `docker compose up` |
| Site title/description | Ghost Admin → Settings → General | Via Ghost UI |
| Navigation links | Ghost Admin → Settings → Navigation | Via Ghost UI |
| Social links | Ghost Admin → Settings → General → Social | Via Ghost UI |
| Color palette | `assets/css/style.css` → CSS custom properties | Edit CSS variables |
| Ad code | Ghost Admin → Settings → Code injection | Paste ad network scripts |
| Affiliate CTAs | Ghost Editor → HTML card | Paste affiliate CTA HTML template |
| Newsletter | Ghost Admin → Settings → Membership | Configure email integration |

---

## 10. Error Handling

- **404 Page** — `error.hbs` template with styled "Page Not Found" message, search suggestion, link back to homepage. Matches Nightfall aesthetic.
- **Age gate localStorage failure** — Falls back to always showing the gate (safe default). Uses try/catch around localStorage access for private browsing compatibility.
- **Missing featured image** — Post cards display a gradient placeholder instead of broken image.
- **Empty ad slots** — CSS hides them. No layout shift.
- **Ghost API errors** — Handlebars `{{#if}}` guards around all data blocks to prevent template crashes.

---

## 11. Testing Plan

| Test | Method |
|------|--------|
| Theme validity | `gscan` (Ghost's theme validator CLI tool) |
| Responsive layout | Manual testing at 320px, 768px, 1024px, 1440px breakpoints |
| SEO validation | Lighthouse SEO audit, structured data testing tool |
| Performance | Lighthouse performance audit targeting 90+ score |
| Age gate | Verify localStorage persistence, private browsing fallback |
| Ad slots | Verify hidden when empty, visible when populated |
| Cross-browser | Chrome, Firefox, Safari — modern versions only |
| Accessibility | Lighthouse a11y audit, keyboard navigation check |
