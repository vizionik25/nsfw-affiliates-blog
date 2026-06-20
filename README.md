# Nightfall — NSFW Affiliate Blog

A dark, premium Ghost-powered affiliate blog built for the adult/NSFW niche. Fully containerised with Docker, reverse-proxied through Caddy (auto-HTTPS), and designed for performance, SEO, and monetisation out of the box.

---

## ✨ Feature Highlights

| Category | Details |
|---|---|
| **Dark Aesthetic** | Hand-crafted dark theme with neon accent colors, glassmorphism cards, and smooth micro-animations |
| **SEO-Optimised** | Structured data (JSON-LD), semantic HTML5, Open Graph & Twitter Cards, sitemap, canonical URLs |
| **Affiliate-Ready** | Styled CTA blocks, comparison tables, and review layouts purpose-built for affiliate content |
| **Newsletter** | Native Ghost membership & newsletter integration — no third-party forms needed |
| **Responsive** | Mobile-first design with off-canvas drawer nav and fluid typography |
| **Age Gate** | Full-screen age verification overlay with `localStorage` persistence |
| **Ad-Ready** | Four predefined ad slots (header, sidebar, in-content, footer) |
| **Zero Frameworks** | Pure vanilla CSS & JS — no Tailwind, no jQuery, no React. Fast and dependency-free |

---

## 🚀 Quick Start

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) & Docker Compose v2+
- A domain name pointed at your server (for automatic HTTPS via Caddy)
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/NSFW-Aff-Blog.git
cd NSFW-Aff-Blog
```

### 2. Configure Environment Variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Key variables to set:

| Variable | Description |
|---|---|
| `GHOST_URL` | Public URL of your site (e.g. `https://yourdomain.com`) |
| `GHOST_DB_PASSWORD` | MySQL root password |
| `GHOST_MAIL_*` | SMTP credentials for transactional email |

### 3. Edit the Caddyfile

Open `caddy/Caddyfile` and replace the placeholder domain with your own:

```
yourdomain.com {
    reverse_proxy ghost:2368
}
```

### 4. Launch

```bash
docker compose up -d
```

### 5. Ghost Admin Setup

1. Navigate to `https://yourdomain.com/ghost/`
2. Create your admin account
3. Go to **Settings → Design → Change theme → Upload theme**
4. Upload the `nightfall` theme ZIP from `ghost/themes/nightfall/`
5. Activate the theme

---

## 📂 Theme File Structure

```
ghost/themes/nightfall/
├── assets/
│   ├── css/
│   │   └── style.css          # Complete stylesheet (variables, components, utilities)
│   └── js/
│       └── main.js            # Age gate, mobile nav, scroll effects, smooth scroll
├── partials/
│   ├── age-gate.hbs           # Age verification overlay
│   ├── navbar.hbs             # Navbar & mobile drawer
│   ├── footer.hbs             # Footer with newsletter CTA
│   ├── affiliate-cta.hbs      # Reusable affiliate call-to-action block
│   ├── comparison-table.hbs   # Product comparison table partial
│   ├── ad-slot.hbs            # Ad placement partial
│   ├── post-card.hbs          # Blog post card for listings
│   ├── newsletter-form.hbs    # Newsletter form partial
│   └── seo-meta.hbs           # SEO metadata partial
├── page-landing.hbs           # Landing page template
├── page-comparisons.hbs       # Product comparison page template
├── default.hbs                # Base layout
├── index.hbs                  # Homepage / post listing
├── post.hbs                   # Single post
├── page.hbs                   # Static page
├── tag.hbs                    # Tag archive
├── author.hbs                 # Author archive
├── error.hbs                  # Error page (404, etc.)
└── package.json               # Theme metadata
```

---

## 📝 Custom Templates

Ghost lets you assign custom templates to individual pages via the **Page Editor → Page settings (⚙️) → Template** dropdown.

### Landing Page (`page-landing.hbs`)

A full-width hero page designed for niche landing pages, squeeze pages, or homepage overrides. Features a hero section with a primary CTA, feature grid, and testimonial/social-proof area.

**To use:** Create a new Page in Ghost → open Page settings → select **Landing Page** from the Template dropdown.

### Comparison Page (`page-comparisons.hbs`)

A structured product comparison layout with side-by-side feature tables and individual affiliate CTA buttons. Perfect for "Best X vs Y" review posts.

**To use:** Create a new Page in Ghost → open Page settings → select **Comparison** from the Template dropdown.

---

## 🔗 How to Add Affiliate CTAs

Paste the following HTML block into any post or page using Ghost's **HTML card** (click `+` → HTML):

```html
<div class="affiliate-cta">
  <div class="affiliate-cta__badge">Editor's Pick</div>
  <h3 class="affiliate-cta__title">Product Name</h3>
  <p class="affiliate-cta__description">
    Brief description of the product and why you recommend it.
  </p>
  <a href="https://your-affiliate-link.com"
     class="affiliate-cta__button"
     target="_blank"
     rel="noopener noreferrer nofollow">
    Visit Product →
  </a>
  <span class="affiliate-cta__disclosure">
    We may earn a commission at no extra cost to you.
  </span>
</div>
```

The theme styles `.affiliate-cta` blocks with a dark glassmorphism card, neon hover glow, and clear visual hierarchy.

---

## 📊 How to Add Comparison Tables

Paste this HTML into a Ghost **HTML card** for a responsive comparison table:

```html
<div class="comparison-table-wrapper">
  <table class="comparison-table">
    <thead>
      <tr>
        <th>Feature</th>
        <th>Product A</th>
        <th>Product B</th>
        <th>Product C</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td data-label="Feature">Price</td>
        <td data-label="Product A">$29/mo</td>
        <td data-label="Product B">$39/mo</td>
        <td data-label="Product C">$19/mo</td>
      </tr>
      <tr>
        <td data-label="Feature">Free Trial</td>
        <td data-label="Product A">✅ Yes</td>
        <td data-label="Product B">❌ No</td>
        <td data-label="Product C">✅ Yes</td>
      </tr>
      <tr>
        <td data-label="Feature">Rating</td>
        <td data-label="Product A">⭐ 4.8</td>
        <td data-label="Product B">⭐ 4.2</td>
        <td data-label="Product C">⭐ 4.5</td>
      </tr>
    </tbody>
  </table>
</div>
```

The `data-label` attributes power the responsive mobile layout where each cell is prefixed with its column header.

---

## 📢 Ad Integration

Four pre-styled ad slots are available. Insert ad code (e.g., from an ad network) into a Ghost **HTML card** or directly in the theme partials.

| Slot | CSS Class | Placement | Recommended Size |
|---|---|---|---|
| **Header Banner** | `.ad-slot--header` | Below navbar, above content | 728 × 90 (leaderboard) |
| **Sidebar** | `.ad-slot--sidebar` | Right column on desktop | 300 × 250 (medium rectangle) |
| **In-Content** | `.ad-slot--in-content` | Between post paragraphs | 336 × 280 or native |
| **Footer** | `.ad-slot--footer` | Above site footer | 728 × 90 (leaderboard) |

All ad slots are hidden by default and appear only when they contain content, preventing empty-space layout shifts.

---

## 🎨 Customisation

| What | Where | How |
|---|---|---|
| **Accent colors** | `assets/css/style.css` | Edit CSS custom properties under `:root` (e.g. `--color-accent`, `--color-bg`) |
| **Navigation links** | Ghost Admin | Settings → Navigation |
| **Logo & icon** | Ghost Admin | Settings → Design & branding |
| **Social links** | Ghost Admin | Settings → General → Social accounts |
| **Newsletter text** | Ghost Admin | Settings → Membership |
| **Code injection** | Ghost Admin | Settings → Code injection (for analytics, ad scripts, etc.) |
| **Age gate text** | `partials/age-gate.hbs` | Edit heading, description, and button labels directly |

---

## 🔍 SEO Features

- **Structured Data** — Automatic JSON-LD schema for `Article`, `WebSite`, and `BreadcrumbList`
- **Open Graph & Twitter Cards** — Full meta tags for rich social previews
- **Semantic HTML5** — Proper use of `<article>`, `<section>`, `<nav>`, `<aside>`, `<header>`, `<footer>`
- **Canonical URLs** — Handled natively by Ghost
- **XML Sitemap** — Auto-generated at `/sitemap.xml` by Ghost
- **Optimised Headings** — Single `<h1>` per page with logical heading hierarchy
- **Lazy-loaded Images** — Native `loading="lazy"` on below-fold images
- **Minimal Render-blocking** — No external framework CSS/JS to delay First Contentful Paint
- **Meta Descriptions** — Pulled from Ghost's built-in excerpt or custom excerpt field

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

```
MIT License

Copyright (c) 2025 Nightfall Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```
