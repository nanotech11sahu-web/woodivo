# WOODIVO — Deployment Guide

This covers what's needed to take this project from "builds clean
locally" (confirmed in Phase 32) to "live on a real domain." It doesn't
cover things that are safe to defer — see `PHASE32_NOTES.md`'s and
`PHASE33_NOTES.md`'s "Next" sections for the polish backlog. This guide
is scoped to: what would actually break or block a real launch.

## Before you start: accounts you need

- **MongoDB** — either MongoDB Atlas (free tier is enough to start) or a
  self-hosted instance. The Docker Compose path below runs one for you.
- **Cloudinary** — every image upload (products, blogs, gallery, banners,
  etc.) goes through it. Free tier works to start.
- **SMTP credentials** — for enquiry-notification emails. Any provider
  works (SendGrid, Mailgun, AWS SES, Gmail app password for testing).
- **A domain**, if you want this on a real URL instead of raw IPs — not
  strictly required to go live, but you'll want it for TLS and for
  `PUBLIC_SITE_URL` (used to build correct sitemap.xml URLs).

## Two ways to deploy

### Path A — Docker Compose (one VPS, full control)

Good if you already have a VPS (DigitalOcean, Hetzner, EC2, etc.) and
want everything — database included — on one box.

```bash
cp backend/.env.example backend/.env
# Fill in: JWT_SECRET, JWT_REFRESH_SECRET (long random strings — e.g.
# `openssl rand -hex 32`), CLOUDINARY_*, SMTP_*, SEED_ADMIN_EMAIL/PASSWORD.
# Leave MONGODB_URI as-is — docker-compose.yml overrides it to point at
# the mongo service automatically.

cp .env.example .env
# Set FRONTEND_API_BASE_URL / CMS_API_BASE_URL to your real domain once
# you have one, e.g. https://api.yourdomain.com/api/v1 — see the
# comments in that file for why this has to happen before building, not
# after.

docker compose up --build -d
```

This gets you:
- `mongo` — MongoDB with a persistent volume
- `backend` — the API, on port 4000
- `frontend` — the public site, on port 8080
- `cms` — the admin panel, on port 8081

**This alone is not a public HTTPS site.** Put a real reverse proxy in
front of it for TLS — [Caddy](https://caddyserver.com/) is the fastest
path (automatic Let's Encrypt certs, ~5 lines of config):

```
yourdomain.com {
    reverse_proxy localhost:8080
}
admin.yourdomain.com {
    reverse_proxy localhost:8081
}
api.yourdomain.com {
    reverse_proxy localhost:4000
}
```

If you use nginx or Traefik instead, the same three-host-to-three-port
mapping applies — this project doesn't care which reverse proxy sits in
front of it, only that CORS_ORIGINS (backend/.env) lists the real
`yourdomain.com` and `admin.yourdomain.com` origins once you have them.

### Path B — Platform hosting (no server to manage)

Good if you'd rather not run a VPS at all.

- **`backend/`** → Render, Railway, or Fly.io. Point it at this repo's
  `backend/` folder, build command `npm ci && npm run build`, start
  command `npm run start:prod`. Set every var from `backend/.env.example`
  in the platform's env settings. Point `MONGODB_URI` at Atlas instead
  of a local Mongo.
- **`frontend/`** and **`cms/`** → Vercel or Netlify, one project each,
  root directory set to `frontend/` and `cms/` respectively. Both auto-
  detect Vite. Set `VITE_API_BASE_URL` in each project's environment
  variables to your deployed backend's URL — same build-time caveat as
  the Docker path: change it later, redeploy, don't just restart.
- **MongoDB Atlas** for the database — no container to manage.

Both `frontend/` and `cms/` already include a `vercel.json` and a
`public/_redirects` (Netlify) with the SPA-fallback rewrite done for
you. `frontend/`'s two files also proxy `/sitemap.xml` and
`/robots.txt` to your backend, matching what `frontend/nginx.conf`
does for Path A — **open both files and replace
`REPLACE_WITH_YOUR_BACKEND_DOMAIN` with your backend's real deployed
origin** (no trailing slash, no `/api/v1` — sitemap.xml/robots.txt are
served at the backend's own root) before or right after your first
deploy. `cms/`'s files also set `X-Robots-Tag: noindex, nofollow` so
the admin panel doesn't get crawled — nothing to fill in there.

## After first boot: logging into the CMS

The backend seeds a super-admin user automatically on every boot,
idempotently, from `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` in
`backend/.env` (see `backend/src/database/seeders/seeder.service.ts`) —
nothing extra to run. Log into the CMS at whatever URL you deployed it
to with those credentials, then **change that password immediately**
from the CMS's own account settings — `SEED_ADMIN_PASSWORD` sitting in
plaintext in an env file is fine for bootstrapping, not for the
password you actually use going forward.

## Optional: seed demo data

If you want the site to look populated (categories, products, blog posts,
projects, gallery, testimonials, banners, FAQs, About page, contact
info) before you've entered any real content, run this once your backend
is up and pointed at your real database:

```bash
cd backend
npm run seed:demo
```

This inserts realistic placeholder content — six product categories,
sixteen products, six blog posts, six projects, twelve gallery images,
five testimonials, one banner per placement, eight FAQs, a filled-in
About page, and basic site/contact settings — using
[picsum.photos](https://picsum.photos) placeholder images (real,
reachable URLs, not broken links) so everything renders immediately on
both the CMS and the public site. It's safe to run against a database
that already has some real content: it checks each content type (blog
posts, products, etc.) independently and skips anything that already
has data, so it never creates duplicates or touches something a real
editor already wrote.

Delete or edit anything it created the normal way — through the CMS —
whenever real content is ready to replace it. There's no "undo demo
data" command; it's just normal CMS-editable rows.

**Not run automatically on boot** — unlike the super-admin seed, this
is a manual, opt-in command. See the comment at the top of
`backend/src/database/seeders/demo-data.seed.ts` for why.

## Post-deploy smoke test

Before calling it live, check all of these — each one exercises a
different layer:

1. `https://api.yourdomain.com/api/v1/health` returns
   `{"status":"ok","database":"connected",...}` — confirms the backend
   is up and actually talking to MongoDB, not just running.
2. Log into the CMS, create or edit one Category — confirms auth, the
   database write path, and CORS are all correctly wired together.
3. Upload an image anywhere in the CMS (a product photo is fine) —
   confirms Cloudinary credentials are correct; a bad API key fails
   silently in some upload UIs, so don't skip this one.
4. Load the public site's homepage and one category/product page —
   confirms the frontend can actually reach the backend's public
   endpoints, not just that it deployed.
5. Submit the enquiry form once, with an email address you control —
   confirms SMTP credentials work end to end, not just that they're
   present in the env file.
6. `https://yourdomain.com/sitemap.xml` returns real XML, not a 404 —
   confirms the reverse-proxy rewrite is actually wired up (Path A:
   `frontend/nginx.conf`; Path B: `frontend/vercel.json` or
   `frontend/public/_redirects`, with the backend domain filled in).

## What this guide deliberately doesn't cover

- **Backups** — MongoDB Atlas has automatic backups on paid tiers; a
  self-hosted `mongo` service (Path A) does not, and needs its own
  `mongodump` cron or equivalent. Worth setting up before you have real
  customer data, not blocking the initial launch.
- **CI/CD** — this guide is a manual first deploy. Wiring GitHub Actions
  (or similar) to auto-build/deploy on push is a real next step, but a
  separate one from getting live at all the first time.
- **Monitoring/alerting** beyond the `/health` endpoint — fine to add
  once there's real traffic to monitor.
