# Ghost Self-Hosted Production Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Harden the Ghost self-hosted Docker Compose stack by adding SMTP mail variables, automated database and asset backups via a cron container, security limits in Caddy, and a setup shell script to configure passwords and directory permissions.

**Architecture:** We will extend the existing `docker-compose.yml` with a lightweight Alpine-based daily cron service that performs `mysqldump` and file archives to a host-mounted directory. We will implement `bin/setup.sh` to handle initial `.env` generation and permissions on the host, expand environment mapping for SMTP, and tweak Caddy's payload limit.

**Tech Stack:** Docker Compose, Alpine, Bash, Caddy, MySQL 8.0, Ghost 5.

---

## File Map

| File | Responsibility |
|------|----------------|
| `.env.example` | Template for site metadata, database passwords, and SMTP credentials. |
| `bin/setup.sh` | Orchestrates initial setup, generates secure passwords, creates backup folder, sets permissions. |
| `docker-compose.yml` | Defines Ghost SMTP mappings and adds the daily `backup` service. |
| `Caddyfile` | Protects the backend by adding request body payload size limitations. |
| `README.md` | Documents production deployment instructions, backup restoration, and mail setup. |

---

### Task 1: Environment Template (`.env.example`)

**Files:**
- Modify: `.env.example`

- [ ] **Step 1: Edit `.env.example` to define SMTP and production variables**

Update `.env.example` content:
```env
# .env.example — Copy to .env and fill in your values
SITE_URL=https://yourdomain.com

# Database Configurations
MYSQL_ROOT_PASSWORD=change_me_root_password_here
MYSQL_PASSWORD=change_me_ghost_password_here

# Mail / SMTP Configurations
MAIL_FROM="Nightfall Blog <noreply@yourdomain.com>"
MAIL_HOST=smtp.mailgun.org
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=postmaster@yourdomain.com
MAIL_PASS=your_smtp_password_here
```

- [ ] **Step 2: Verify the template format**
Verify that all variables are documented and clear.

- [ ] **Step 3: Commit changes**
```bash
git add .env.example
git commit -m "config: expand .env.example with SMTP variables"
```

---

### Task 2: Automated Initial Setup Script (`bin/setup.sh`)

**Files:**
- Create: `bin/setup.sh`

- [ ] **Step 1: Write `bin/setup.sh` to automate environment variables and directory setups**

Create `/Users/vizionik/NSFW-Aff-Blog/bin/setup.sh` with the following content:
```bash
#!/bin/bash
# bin/setup.sh
set -e

# Determine the absolute project root directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

# Copy .env if not present
if [ ! -f .env ]; then
  echo "Creating .env from .env.example..."
  cp .env.example .env
fi

# Function to generate a secure random password
generate_password() {
  # Generate a 32-character hexadecimal string
  openssl rand -hex 16
}

# Replace placeholder passwords in .env if they exist
if grep -q "change_me_root_password_here" .env; then
  ROOT_PASS=$(generate_password)
  if sed --version >/dev/null 2>&1; then
    sed -i "s/change_me_root_password_here/$ROOT_PASS/g" .env
  else
    sed -i '' "s/change_me_root_password_here/$ROOT_PASS/g" .env
  fi
  echo "Generated secure random MYSQL_ROOT_PASSWORD in .env"
fi

if grep -q "change_me_ghost_password_here" .env; then
  GHOST_PASS=$(generate_password)
  if sed --version >/dev/null 2>&1; then
    sed -i "s/change_me_ghost_password_here/$GHOST_PASS/g" .env
  else
    sed -i '' "s/change_me_ghost_password_here/$GHOST_PASS/g" .env
  fi
  echo "Generated secure random MYSQL_PASSWORD in .env"
fi

# Ensure host backups folder exists
mkdir -p backups
echo "Created ./backups directory."

# Make sure permissions on theme are readable by container (node user UID 1000)
chmod -R o+r ghost/themes/nightfall
echo "Adjusted permissions on theme files to be container-readable."

echo "Setup complete. Please verify or update additional values in your .env file."
```

- [ ] **Step 2: Make `bin/setup.sh` executable and run it**
Run:
```bash
chmod +x bin/setup.sh
./bin/setup.sh
```
Expected output: Creates `.env` and generates secure values for `MYSQL_ROOT_PASSWORD` and `MYSQL_PASSWORD`.

- [ ] **Step 3: Verify the generated `.env` contents**
Ensure `.env` was successfully created, passwords are random strings, and `backups` directory is created.
Run:
```bash
cat .env | grep -E "MYSQL_ROOT_PASSWORD|MYSQL_PASSWORD"
```
Ensure passwords are NOT the original placeholder values.

- [ ] **Step 4: Commit changes**
```bash
git add bin/setup.sh
git commit -m "feat: add automated environment setup script"
```

---

### Task 3: Hardened Docker Compose Configuration (`docker-compose.yml`)

**Files:**
- Modify: `docker-compose.yml`

- [ ] **Step 1: Modify `docker-compose.yml` to include SMTP vars and the backup daemon service**

Update `/Users/vizionik/NSFW-Aff-Blog/docker-compose.yml`:
```yaml
services:
  caddy:
    image: caddy:2-alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
      - "443:443/udp"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy_data:/data
      - caddy_config:/config
    depends_on:
      - ghost
    networks:
      - blog_network

  ghost:
    image: ghost:5-alpine
    restart: unless-stopped
    expose:
      - "2368"
    volumes:
      - ghost_content:/var/lib/ghost/content
      - ./ghost/themes/nightfall:/var/lib/ghost/content/themes/nightfall:ro
    environment:
      url: ${SITE_URL:-https://yourdomain.com}
      database__client: mysql
      database__connection__host: db
      database__connection__port: 3306
      database__connection__database: ghost
      database__connection__user: ghost
      database__connection__password: ${MYSQL_PASSWORD}
      NODE_ENV: production
      # SMTP Mail Configuration
      mail__transport: SMTP
      mail__from: ${MAIL_FROM:-"Nightfall Blog <noreply@yourdomain.com>"}
      mail__options__host: ${MAIL_HOST:-smtp.mailgun.org}
      mail__options__port: ${MAIL_PORT:-587}
      mail__options__secure: ${MAIL_SECURE:-false}
      mail__options__auth__user: ${MAIL_USER}
      mail__options__auth__pass: ${MAIL_PASS}
    depends_on:
      db:
        condition: service_healthy
    networks:
      - blog_network

  db:
    image: mysql:8.0
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: ghost
      MYSQL_USER: ghost
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
    volumes:
      - mysql_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-p${MYSQL_ROOT_PASSWORD}"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s
    networks:
      - blog_network

  backup:
    image: alpine:latest
    restart: unless-stopped
    volumes:
      - ghost_content:/backup/ghost_content:ro
      - ./backups:/backups
    environment:
      MYSQL_HOST: db
      MYSQL_USER: ghost
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
      MYSQL_DATABASE: ghost
    depends_on:
      db:
        condition: service_healthy
    command: >
      sh -c "
      apk add --no-cache mariadb-client tar &&
      echo 'echo \"Starting daily backup...\" && mysqldump -h $$MYSQL_HOST -u $$MYSQL_USER -p$$MYSQL_PASSWORD $$MYSQL_DATABASE | gzip > /backups/db_backup_\$(date +%F).sql.gz && tar -czf /backups/ghost_content_\$(date +%F).tar.gz -C /backup/ghost_content . && find /backups -maxdepth 1 -mtime +7 -type f -delete && echo \"Backup complete.\"' > /etc/periodic/daily/backup &&
      chmod +x /etc/periodic/daily/backup &&
      exec crond -f -l 2
      "
    networks:
      - blog_network

volumes:
  caddy_data:
  caddy_config:
  ghost_content:
  mysql_data:

networks:
  blog_network:
    driver: bridge
```

- [ ] **Step 2: Validate the Docker Compose configuration syntax**
Run:
```bash
docker compose config
```
Expected outcome: The configuration parses successfully without errors.

- [ ] **Step 3: Commit changes**
```bash
git add docker-compose.yml
git commit -m "feat: add mail configurations and alpine backup daemon to compose stack"
```

---

### Task 4: Caddyfile Payload Security Limit

**Files:**
- Modify: `Caddyfile`

- [ ] **Step 1: Edit `Caddyfile` to add request payload size limits**

Update `/Users/vizionik/NSFW-Aff-Blog/Caddyfile`:
```caddy
yourdomain.com {
    encode gzip

    header {
        X-Content-Type-Options "nosniff"
        X-Frame-Options "DENY"
        Referrer-Policy "strict-origin-when-cross-origin"
        Permissions-Policy "camera=(), microphone=(), geolocation=()"
        Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
        X-XSS-Protection "1; mode=block"
    }

    handle /robots.txt {
        respond "User-agent: *
Allow: /
Disallow: /ghost/
Disallow: /p/

Sitemap: https://yourdomain.com/sitemap.xml" 200
    }

    # Limit request body sizes to 20MB (prevents malicious large media payload attacks)
    request_body_limit 20971520

    reverse_proxy ghost:2368
}
```

- [ ] **Step 2: Commit changes**
```bash
git add Caddyfile
git commit -m "security: add 20MB request body size limits in Caddyfile"
```

---

### Task 5: Document Setup and Operations in `README.md`

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Edit `README.md` to reflect the hardened setup, automated script, and backup/restore steps**

Add sections for "Production Setup", "Backup Architecture", and "Restoration Procedure" under appropriate locations in `/Users/vizionik/NSFW-Aff-Blog/README.md`.

In the backup details, document that backups are placed in `./backups` on the host, and include the commands to restore the database and directory files:
- DB Restore command:
```bash
gunzip < backups/db_backup_YYYY-MM-DD.sql.gz | docker compose exec -T db mysql -u ghost -p[password] ghost
```
- Assets Restore command:
```bash
tar -xzf backups/ghost_content_YYYY-MM-DD.tar.gz -C [ghost_content_volume_path]
```

- [ ] **Step 2: Verify README format and markdown links**

- [ ] **Step 3: Commit changes**
```bash
git add README.md
git commit -m "docs: document production setup, mail, and backup/restore procedures in README"
```
