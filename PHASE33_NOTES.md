# Phase 33 — Go-Live Readiness

Different kind of phase than 1–32: not a feature or a lint pass, a "can
this actually be deployed" pass, prompted directly by the person wanting
to put the site live. Scoped deliberately narrow — real blockers and
missing deployment scaffolding only, explicitly not the polish backlog
(that's still open, see the bottom of this file).

## Two real bugs found — both would have broken a live deploy

**1. CMS pointed at the wrong backend URL, in two places.**
`cms/.env.example` had `VITE_API_BASE_URL=http://localhost:3000/api` —
wrong port (backend runs on 4000) and wrong prefix (the API is mounted
at `/api/v1`, not `/api`; see `backend/src/common/constants/app.constants.ts`).
The same wrong value was also the *hardcoded fallback* in
`cms/src/lib/api-client.ts`, so even a correctly-filled `.env` wouldn't
have saved you if the build ever ran without `VITE_API_BASE_URL` set —
the admin panel would have silently pointed at a URL nothing listens on
and every request would fail. `frontend/.env.example` had the right
value the whole time (localhost:4000/api/v1) — this was CMS-only.
Fixed both the example and the source fallback.

**2. `tsconfig-paths` was a devDependency, but `start:prod` needs it at
runtime.** `backend/package.json`'s `start:prod` script is `node -r
tsconfig-paths/register dist/main` — that `-r` flag requires
`tsconfig-paths` to exist in `node_modules` at boot. Any real production
install (`npm ci --omit=dev`, which is what every Dockerfile, Render,
Railway, etc. actually run) skips devDependencies, so the server would
have crashed on line one with `Cannot find module
'tsconfig-paths/register'` — never even reaching Nest's own config
validation. Moved it to `dependencies`. Verified the fix by actually
reproducing the failure: built the project, ran a real `npm ci
--omit=dev`, and confirmed the server now boots past module resolution
into normal `ConfigModule` env validation instead of crashing on a
missing module (see the commands below — this was tested, not assumed).

```bash
npm run build
rm -rf node_modules && npm ci --omit=dev
node -r tsconfig-paths/register dist/main.js
# Before the fix: "Cannot find module 'tsconfig-paths/register'"
# After the fix: proceeds to Nest's Joi env validation, as expected
# without a filled-in .env — the correct failure mode for a bare
# checkout, not a broken one.
```

Neither of these would have shown up in Phase 32's `tsc`/`eslint`/build
checks — both are runtime-only failures (a wrong-but-valid URL string;
a module resolution gap that only appears under `--omit=dev`, which
Phase 32 never ran). Worth calling out precisely because "the build
passes" and "this is deployable" are different claims — Phase 32
confirmed the first, this phase found two ways the second was still
false.

## What was added: actual deployment scaffolding

Nothing before this phase had a Dockerfile, a docker-compose file, an
nginx config, or a deployment guide anywhere in the project — every
phase's "Setup" section was `npm install && npm run dev`, which is a
local-dev loop, not a path to a live URL. This phase adds:

- **`backend/Dockerfile`** — multi-stage (build → prod-deps-only →
  runtime), runs as the non-root `node` user, `tini` for real signal
  handling on `docker stop` (so `app.enableShutdownHooks()`, already
  wired in `main.ts`, actually gets a chance to run), a `HEALTHCHECK`
  hitting the real `/api/v1/health` endpoint.
- **`frontend/Dockerfile`** + **`frontend/nginx.conf`** — static Vite
  build served by nginx, with React Router's client-side routing
  handled via `try_files ... /index.html` (without this, refreshing on
  any non-root route like `/products/some-slug` would 404 against
  nginx instead of loading the SPA). Also proxies `/sitemap.xml` and
  `/robots.txt` to the backend — this is the "reverse-proxy rewrite"
  item flagged as open infra work since Phase 25's notes and repeated
  in every backlog since; it's done now, for the Docker path at least
  (Path B in `DEPLOYMENT.md` covers the platform-hosting equivalent,
  which needs a different rewrite mechanism per platform).
- **`cms/Dockerfile`** + **`cms/nginx.conf`** — same SPA-fallback
  pattern, plus `X-Robots-Tag: noindex, nofollow` and a blanket
  `robots.txt` disallow — this is an internal admin tool and nothing
  before this phase stopped it from being crawled and indexed like a
  public page.
- **`docker-compose.yml`** (root) — wires `mongo` + `backend` +
  `frontend` + `cms` into one stack, `backend` waits on Mongo's
  healthcheck before starting, `frontend`/`cms` get their
  `VITE_API_BASE_URL` build args from a root `.env` (see `.env.example`,
  also new) rather than being hardcoded.
- **`.dockerignore`** in each of the three apps — without these,
  `docker build` would `COPY . .` including each app's own
  `node_modules` before `npm ci` even runs, at minimum wasting the
  build's time and at worst copying host-platform native binaries
  (`bcrypt` in `backend/` compiles natively) into a differently-arched
  image.
- **`DEPLOYMENT.md`** (root) — the actual walkthrough: two paths (Docker
  Compose on a VPS, or Vercel/Netlify/Render on managed platforms), what
  accounts you need first (Mongo, Cloudinary, SMTP), how the seeded
  super-admin login works (already existed in
  `backend/src/database/seeders/seeder.service.ts`, just never
  documented anywhere outside a `.env.example` comment), and a 6-step
  post-deploy smoke test that exercises auth, file upload, email, and
  the sitemap proxy specifically — not just "does the homepage load."

## What this phase deliberately left alone

Per the request to skip small things — everything below is real, still
open, and intentionally not touched here:

- **The CMS's 619 kB and frontend's 569 kB JS bundles** — both build
  and run correctly; smaller is better but neither is a go-live blocker.
  Still on the backlog (Phase 32's notes, items 10–11).
- **Shared types package, image lazy-loading, contact banner placement,
  sitemap pagination, structured data on categories/projects, the icon
  picker, hover-preload, Website Builder scoping** — the full list is in
  `PHASE32_NOTES.md`'s "Next" section, unchanged by this phase.
- **CI/CD, automated backups, monitoring beyond `/health`** — called out
  explicitly in `DEPLOYMENT.md` as real next steps, deliberately kept
  out of "how do I get live the first time."
- **No code changes in `cms/src` or `frontend/src` beyond the one
  `api-client.ts` line** — this phase's brief was "make it deployable,"
  not "improve it further."

## Verified

- Fresh `npm install` + `tsc`/`eslint`/build, all three apps, after
  every change in this phase — still clean (same commands as Phase 32).
- The `tsconfig-paths` fix specifically reproduced and re-verified as
  described above — not just reasoned about, actually run.
- Dockerfiles and `docker-compose.yml` were **not** build-tested — this
  sandbox has no Docker daemon available. They're written against the
  same patterns Phase 32 already confirmed work (the exact `npm run
  build` / `npm ci --omit=dev` / `node -r tsconfig-paths/register
  dist/main.js` sequence each Dockerfile stage runs was tested directly,
  just not inside an actual container). Building the images is the
  first thing to do in an environment with Docker before trusting them
  fully — flagged here rather than glossed over.

## Next

Unchanged from `PHASE32_NOTES.md` — this phase didn't resolve or add
backlog items, it addressed a different axis (deployability) than that
list covers (code polish). See that file for the full prioritized list.
