# Phase 34 — Image Lazy-Loading + Platform-Hosting Sitemap/Robots Rewrite

Picked directly off `PHASE32_NOTES.md`'s backlog: items 2 (image
lazy-loading, flagged since Phase 20) and 4 (reverse-proxy rewrite for
sitemap.xml/robots.txt, flagged since Phase 25) — the two items the
person asked for by name, everything else on that list left alone as
requested.

## Image lazy-loading — `frontend/` only (`cms/` is an internal tool,
not indexed, no LCP to protect)

Added `loading="lazy" decoding="async"` to every below-the-fold or
grid/thumbnail `<img>` across the public site, and deliberately left
every hero/primary-content image untouched (still defaults to eager —
that's correct, not an oversight):

**Lazy now:**
- `product-card.tsx`, `project-card.tsx`, `blog-card.tsx` — the three
  grid-listing card components named directly in the original backlog
  item.
- `media-gallery.tsx`'s thumbnail strip (the small selector row under a
  product/project's main image) — not the main "active" image itself,
  which stays eager (see below).
- `featured-categories-section.tsx` and `testimonials-section.tsx` —
  homepage sections below the hero.
- `about-page.tsx`'s story image and team-member photo grid — both sit
  below that page's hero, which is a CSS `background-image` (already
  always-eager by nature, unaffected by this change either way).
- `gallery-page.tsx`'s masonry grid already had `loading="lazy"` before
  this phase — Phase 28 (which built that page) did this correctly the
  first time; nothing to fix there, confirmed while auditing.

**Left eager, on purpose:**
- `hero-section.tsx` (homepage hero) — the site's most likely actual LCP
  element.
- The banner `<img>` at the top of `blog-listing-page.tsx`,
  `category-listing-page.tsx`, and `project-listing-page.tsx` — each is
  that page's own first-paint hero.
- `media-gallery.tsx`'s main "active" image — the primary content image
  on a product/project detail page, likely that page's LCP element.
- `blog-details-page.tsx`'s featured image — sits right after the
  title/breadcrumb/author block with nothing else above it; close
  enough to first-paint that lazy-loading it risked a real LCP
  regression for a page whose main content *is* that image. Judgment
  call, not a rule — revisit if a real Lighthouse/PageSpeed run says
  otherwise.
- `site-header.tsx`'s logo — small, always visible, part of the header
  every page renders immediately.
- `gallery-lightbox.tsx`'s enlarged image — only mounts when the user
  actively opens it; it's the thing they just asked to see, so it should
  load with priority, not be deferred.

No library added — `loading="lazy"` is native browser support (every
current evergreen browser), consistent with this project's existing
"no unnecessary dependency" pattern (same reasoning `PHASE30_NOTES.md`
gave for choosing `@dnd-kit` only when drag-and-drop specifically needed
it, not for lighter-weight problems).

## Sitemap/robots rewrite — the Vercel/Netlify half that Phase 33 flagged
as still missing

Phase 33 closed this for the Docker path (`frontend/nginx.conf` already
proxies both routes to the backend). This phase closes it for Path B —
platform hosting — since `DEPLOYMENT.md` named both `frontend/` and
`cms/` as needing it and Path B is the one most people reach for first
when they don't want to run a VPS.

- **`frontend/vercel.json`** — rewrites `/sitemap.xml` and
  `/robots.txt` to the backend's real routes, plus the SPA-fallback
  catch-all every client-routed React app needs on Vercel.
- **`frontend/public/_redirects`** — same two rewrites plus SPA
  fallback, Netlify's format. Placed in `public/` (not `dist/`
  directly) specifically so Vite copies it into every build — verified
  this actually happens (`ls dist/` after a real build shows
  `_redirects` present, not just assumed from Vite's docs).
- **`cms/vercel.json`** + **`cms/public/_redirects`** +
  **`cms/public/_headers`** — SPA fallback for the CMS on both
  platforms, plus `X-Robots-Tag: noindex, nofollow` so the admin panel
  doesn't get crawled and indexed the way a public page would (same
  concern `cms/nginx.conf` already addressed for the Docker path in
  Phase 33).

**One placeholder value needs filling in before/after deploy:**
`REPLACE_WITH_YOUR_BACKEND_DOMAIN` appears in both
`frontend/vercel.json` and `frontend/public/_redirects` — swap it for
your actual deployed backend's origin (no `/api/v1`, sitemap/robots are
served at the backend's own root). `DEPLOYMENT.md` now says this
explicitly in Path B and the smoke-test section references it. `cms/`'s
files need no filling-in — nothing in them is deployment-specific.

## What this phase deliberately didn't touch

Every other item on `PHASE32_NOTES.md`'s "Next" list — the person asked
for these two specifically and to leave the rest for later. Nothing else
in the project changed.

## Verified

Fresh `npm install` + `tsc`/`eslint`/`vite build`, all three apps —
clean, same as every phase since 32. Specifically re-confirmed for this
phase: `frontend/dist/_redirects` and `cms/dist/_redirects` +
`cms/dist/_headers` are present after a real build (Vite's `public/`
copy-through actually checked, not assumed), and both `vercel.json`
files are valid JSON (parsed, not just eyeballed).

## Next

Unchanged from `PHASE32_NOTES.md`, minus items 2 and 4 (both done as of
this phase). Everything else on that list — shared types package,
frontend/CMS bundle splitting, contact banner placement, sitemap
pagination, category/project structured data, gallery distinct-tags
endpoint, icon picker, hover-preload, Website Builder scoping — is
still open and still fine to leave for later.
