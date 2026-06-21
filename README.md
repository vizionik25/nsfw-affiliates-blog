# NeonLust — NSFW Affiliate Blog

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

### 1. Clone & Initialize

First, clone the repository and run the automated setup script to generate secure environment configurations and fix permissions:

```bash
git clone https://github.com/your-org/NSFW-Aff-Blog.git
cd NSFW-Aff-Blog
chmod +x bin/setup.sh
./bin/setup.sh
```

---

### Path A: Local Development & Theme Preview

Use this mode to run the site locally on your computer for developing, testing, or editing the `neonlust` theme without requiring a domain name, SSL, or mail credentials.

#### 1. Configure for Development
Open the generated `.env` file in the project root and update the environment to:
```env
NODE_ENV=development
SITE_URL=http://localhost:2368
```
*(Setting `NODE_ENV=development` tells Ghost to disable theme caching. Any edits you make to the template files in `ghost/themes/neonlust/` will show up instantly in your browser when you reload the page).*

#### 2. Start the Local Containers
Spin up only the database and the Ghost application:
```bash
docker compose up -d ghost
```
*(Caddy and the backup daemon are automatically skipped as they are not needed for localhost development).*

#### 3. Access Your Local Blog
*   **Homepage:** [http://localhost:2368](http://localhost:2368)
*   **Admin Panel:** [http://localhost:2368/ghost/](http://localhost:2368/ghost/)
*   **Activate Theme:** Go to **Settings (⚙️) → Design → Change theme → Advanced** and click **Activate** next to the `neonlust` theme (which is pre-loaded via Docker volume mapping).

---

### Path B: Production Deployment (Locally-Hosted or VPS)

Use this mode to deploy a live, hardened production blog on a public server (VPS) with automated daily backups, transactional email memberships, and automatic Let's Encrypt HTTPS via Caddy.

#### Prerequisites
*   A domain name pointed at your server's public IP address.
*   Ports `80` and `443` open in your server's firewall.

#### 1. Configure the Production URL
Open your `.env` file and set the canonical URL of your site:
```env
NODE_ENV=production
SITE_URL=https://yourdomain.com
```

#### 2. Configure SMTP Mail (Required for Newsletter/Invites)
Uncomment and fill in SMTP credentials in your `.env` file:
```env
MAIL_FROM="NeonLust Blog <noreply@yourdomain.com>"
MAIL_HOST=smtp.mailgun.org
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=postmaster@yourdomain.com
MAIL_PASS=your_smtp_password_here
```

#### 3. Update Caddyfile Domain
Open `Caddyfile` and replace the placeholder domain on the first line with your live domain:
```caddy
yourdomain.com {
    ...
}
```

#### 4. Launch the Production Stack
Start all services (Ghost, MySQL, Caddy proxy, and Backup Cron daemon):
```bash
docker compose up -d
```

#### 5. Verification & Live Access
*   **Status Verification:** Run `docker compose ps` to ensure all 4 services are healthy.
*   **Admin Setup:** Navigate to `https://yourdomain.com/ghost/` to create your administrator account.
*   **Activate Theme:** Go to **Settings (⚙️) → Design → Change theme → Advanced** and click **Activate** next to the `neonlust` theme.


---

### Path C: Render Cloud Deployment (1-Click Blueprint)

Use this option to deploy the entire stack (Ghost CMS + MySQL 8 + Disk persistence) on the Render hosting platform.

#### 1. Fork the Repository
Fork this repository to your GitHub account.

#### 2. Create Blueprint on Render
*   Go to your **Render Dashboard** and click **New > Blueprint Instance**.
*   Select your forked repository and click **Connect**.

#### 3. Configure Properties
*   Give your Blueprint Group a name.
*   Find the `ghost-app` Web Service settings in the blueprint deployment and set the `url` environment variable to your target Render URL (e.g., `https://my-blog-name.onrender.com`) or your custom domain name.
*   Click **Apply**.

Render will automatically spin up the private MySQL service, create a persistent SSD disk (Render Disk), compile the custom `neonlust` theme into the container, and link the Ghost CMS to your database. Access the admin page at `https://your-app.onrender.com/ghost/`.

---

### Path D: Headless Vercel Deployment (Jamstack Frontend)

Since Vercel is a serverless platform, it cannot host the stateful Ghost CMS backend directly. Instead, you host the Ghost CMS backend on a server/VPS (Path B) or Render (Path C), and deploy a static or Next.js frontend to Vercel that queries the content from your Ghost API.

#### 1. Setup Ghost Content API
*   Log into your self-hosted Ghost Admin panel (`https://yourdomain.com/ghost/`).
*   Go to **Settings (⚙️) → Integrations** and click **Add custom integration**.
*   Name it "Vercel Frontend".
*   Copy the **API URL** and the **Content API Key**.

#### 2. Deploy Frontend to Vercel
*   Deploy a Next.js frontend (such as the official [Next.js + Ghost starter template](https://github.com/vercel/next.js/tree/canary/examples/cms-ghost)).
*   Set the following environment variables in your Vercel Project Settings:
    *   `GHOST_API_URL` — Your copied Ghost API URL (e.g. `https://yourdomain.com`).
    *   `GHOST_API_KEY` — Your copied Content API Key.

Vercel will build the frontend statically, pulling posts and themes from your self-hosted backend. Set up rebuild webhooks in Ghost to trigger new Vercel builds whenever content changes.


---


## 📂 Theme File Structure

```
ghost/themes/neonlust/
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

## 💾 Backups & Disaster Recovery

The project contains an automated `backup` container running an Alpine cron job. It performs a daily database dump and files archive, placing them in the `./backups` directory on the host (with a 7-day retention policy).

### Backup Files Created Daily
- `backups/db_backup_YYYY-MM-DD.sql.gz` — Compressed MySQL database dump
- `backups/ghost_content_YYYY-MM-DD.tar.gz` — Tarball of the `/var/lib/ghost/content` directory (images, settings, themes)

### Manual Backup Trigger
You can force a backup at any time by running:
```bash
docker compose exec backup /etc/periodic/daily/backup
```

### Restoration Procedure

#### 1. Restore Database
Run the following command to restore a database backup:
```bash
gunzip < backups/db_backup_YYYY-MM-DD.sql.gz | docker compose exec -T db sh -c 'exec mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE"'
```

#### 2. Restore Files
Run the following to extract backup assets back into the Ghost content volume:
```bash
docker run --rm -v ghost-self-hosted_ghost_content:/var/lib/ghost/content -v $(pwd)/backups:/backup alpine tar -xzf /backup/ghost_content_YYYY-MM-DD.tar.gz -C /var/lib/ghost/content
```
*Note: If you renamed your project directory, your volume prefix might differ. You can list all docker volumes to find the exact name by running `docker volume ls`.*

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
