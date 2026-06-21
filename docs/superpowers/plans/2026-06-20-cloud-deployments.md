# Cloud Deployments (Render & Vercel) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a blueprint configuration file for Render (`render.yaml`), a custom theme-packaging `Dockerfile`, and update `README.md` with detailed instructions on deploying to Render and Vercel, preserving all existing options.

**Architecture:** We will create a `render.yaml` defining a web service running a custom Docker image and a private MySQL instance. The `Dockerfile` will inject our custom Handlebars theme into both `/content` and `/content.orig` inside the container. We will document the full deployment guides for Render and Next.js + Ghost on Vercel.

**Tech Stack:** Docker, YAML, Markdown, Render, Vercel, Ghost CMS.

---

## File Map

| File | Responsibility |
|------|----------------|
| `Dockerfile` | Image configuration to package the custom theme into Ghost container templates. |
| `render.yaml` | Render Blueprint file defining MySQL database and Ghost Web Service configurations. |
| `README.md` | Contains instructions for Local Dev, VPS Production, Render Deployment, and Vercel Headless Deployment. |

---

### Task 1: Custom Theme packaging Dockerfile (`Dockerfile`)

**Files:**
- Create: `Dockerfile`

- [ ] **Step 1: Write `Dockerfile` in the root of the project**

Create `/Users/vizionik/NSFW-Aff-Blog/Dockerfile` with the following content:
```dockerfile
FROM ghost:5-alpine

# Copy the custom theme into the container's content and template directories
COPY --chown=node:node ./ghost/themes/nightfall /var/lib/ghost/content.orig/themes/nightfall
COPY --chown=node:node ./ghost/themes/nightfall /var/lib/ghost/content/themes/nightfall
```

- [ ] **Step 2: Verify Dockerfile syntax**
Ensure the instructions are correct and that the directories match the source files.

- [ ] **Step 3: Commit changes**
```bash
git add Dockerfile
git commit -m "feat: add Dockerfile to package custom theme"
```

---

### Task 2: Render Blueprint Configuration (`render.yaml`)

**Files:**
- Create: `render.yaml`

- [ ] **Step 1: Write `render.yaml` in the root of the project**

Create `/Users/vizionik/NSFW-Aff-Blog/render.yaml` with the following content:
```yaml
services:
  # MySQL Private Database Service
  - type: pserv
    name: ghost-db
    env: docker
    image: mysql:8.0
    plan: starter
    envVars:
      - key: MYSQL_ROOT_PASSWORD
        generateValue: true
      - key: MYSQL_DATABASE
        value: ghost
      - key: MYSQL_USER
        value: ghost
      - key: MYSQL_PASSWORD
        generateValue: true
    disk:
      name: mysql-data
      mountPath: /var/lib/mysql
      sizeGB: 10

  # Ghost Web Service
  - type: web
    name: ghost-app
    env: docker
    dockerfilePath: Dockerfile
    plan: starter
    healthCheckPath: /
    disk:
      name: ghost-content
      mountPath: /var/lib/ghost/content
      sizeGB: 10
    envVars:
      - key: url
        value: https://yourdomain.onrender.com # Replace with your actual domain
      - key: database__client
        value: mysql
      - key: database__connection__host
        value: ghost-db
      - key: database__connection__port
        value: 3306
      - key: database__connection__database
        value: ghost
      - key: database__connection__user
        value: ghost
      - key: database__connection__password
        fromService:
          type: pserv
          name: ghost-db
          envVar: MYSQL_PASSWORD
      - key: NODE_ENV
        value: production
```

- [ ] **Step 2: Validate yaml format**
Verify that the YAML file contains no formatting syntax issues.

- [ ] **Step 3: Commit changes**
```bash
git add render.yaml
git commit -m "feat: add render.yaml blueprint for MySQL and Ghost"
```

---

### Task 3: Update README.md with Render & Vercel Deployments

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Append Path C and Path D to the Quick Start section of `README.md`**

Open `/Users/vizionik/NSFW-Aff-Blog/README.md`.
Find line 150 (or where the Quick Start pathways end) and append the new cloud pathways before the `Theme File Structure` section:

```markdown
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

Render will automatically spin up the private MySQL service, create a persistent SSD disk (Render Disk), compile the custom `nightfall` theme into the container, and link the Ghost CMS to your database. Access the admin page at `https://your-app.onrender.com/ghost/`.

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
```

- [ ] **Step 2: Commit changes**
```bash
git add README.md
git commit -m "docs: add Render and Vercel deployment options in README"
```
