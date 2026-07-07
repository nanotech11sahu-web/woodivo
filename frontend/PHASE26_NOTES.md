# Phase 26 — Frontend: Banner-Placement Wiring (About / Projects / Blogs)

Backend Phase 25 notes ranked the open backlog and named this item 1: the
recommended Phase 26. `BannerPlacement` (`src/types/banner.ts`) has
included `'about'` and `'projects'` and `'blog'` since Phase 7, and the CMS
Banners module has let operators create banners for all seven placements
since it shipped — but only `'hero'` was ever actually read via
`useBanners`. Flagged every phase since 22 (23, 24, 25 — four phases
running) with zero code movement until now.

## Pattern: image-only swap, not a content takeover

`hero-section.tsx` (`'hero'` placement) treats the banner as the page's
entire content source — title, subtitle, CTA label/link all come from the
`Banner` document because the homepage hero has no other content source.
About/Projects/Blogs are different: each already has its own heading and
description (from `AboutPage` or a hardcoded string), so pulling banner
text into them would mean two competing content sources fighting over the
same `<h1>`. Instead this phase follows the precedent
`category-listing-page.tsx` already set for `cat.banner`: the banner
supplies the background **image only**; every page keeps its own heading,
subtitle/description, and any other content untouched.

## Per-page precedence

- **About** (`about-page.tsx`) — `about?.heroImage?.url` first (an
  operator-chosen image scoped to this page's own CMS content, unchanged
  from Phase 22), then `useBanners('about')`'s `desktopImage.url`, then the
  static teak-deep gradient. `ogImage` in `useSeoMeta` now follows the same
  precedence chain instead of stopping at `heroImage`.
- **Projects** (`project-listing-page.tsx`) — no entity-level image exists
  here (unlike About or Category), so `useBanners('projects')` is the only
  image source, falling back straight to the existing radial-gradient
  block. `ogImage` added to `useSeoMeta` (previously unset).
- **Blogs** (`blog-listing-page.tsx`) — same shape as Projects, using
  `useBanners('blog')`. Category filter pills and the active-category
  heading logic are untouched.

All three reuse the exact image-plus-gradient-overlay JSX already proven
in `hero-section.tsx` / `category-listing-page.tsx`
(`opacity-35` image + `bg-gradient-to-t from-teak-deep via-teak-deep/75
to-teak-deep/40`), not a new visual treatment.

## What's deliberately staying out of this phase

- **Banner title/subtitle/CTA on these three pages** — considered and
  rejected above; would create two competing content sources per page.
- **`'category'`/`'product'` placements** — already served by
  `Category.banner` / product-level fields, a different mechanism from the
  `Banner` CMS entity; not part of this backlog item.
- **`'contact'` placement** — not named in the Phase 25 backlog item 1
  scope (About/Projects/Blogs only); `contact-page.tsx` still uses its
  static block. Worth a one-line follow-up if it turns out to matter, but
  not folded in here to keep this phase's diff matched to what was
  actually flagged.
- **Structured data / JSON-LD** — flagged Phase 24 and 25 as the Phase 26
  candidate before this backlog reprioritization moved it to Phase 27; see
  below.

## Verified

`tsc -b` passes clean. `eslint` clean on all three touched files
(`about-page.tsx`, `project-listing-page.tsx`, `blog-listing-page.tsx`).
Manually confirmed: creating an active CMS banner for each of the
`about`/`projects`/`blog` placements swaps the corresponding hero
background image with no layout shift, and deleting/deactivating the
banner correctly falls back to the prior gradient — including About
falling through two levels (banner removed but `AboutPage.heroImage` still
set → image persists; both unset → gradient).

## Next (Phase 27 candidate)

1. **Structured data / JSON-LD** (Organization, Product, BlogPosting,
   BreadcrumbList) — flagged Phase 24 and 25, next in the SEO thread
   `<head>` meta (24) → sitemap (25) → banner wiring (26, this phase) →
   structured data (27). `Product` has no price/SKU/rating field anywhere
   in the schema — do **not** emit `offers` or `aggregateRating` with
   fabricated data; that's a Google manual-action risk, not a minor
   omission.
2. **`seo` fields on `AboutPage`/`WebsiteSettings`** — flagged Phase 24.
   Pairs naturally with item 1 since both touch the same pages'
   `<head>`/structured-data output in one pass.
3. **Blog/Gallery search & tag-filter UI** — flagged Phase 20/21.
   `search`/`tag` params already exist server-side on both public query
   DTOs; this is UI-only, no backend work.
4. **Homepage content module** — flagged Phase 18. Needs a new backend
   module (or a `WebsiteSettings` sub-document), a CMS array editor, and a
   frontend rewrite of `why-woodivo-section.tsx` off its hardcoded
   `POINTS` array. Worth its own phase once items 1–3 are cleared.
5. **Drag-and-drop reorder** on CMS array editors
   (`specifications-editor.tsx`, `values-editor.tsx`,
   `milestones-editor.tsx`, `team-members-editor.tsx`) — flagged Phase 23.
   No drag library installed yet; `@dnd-kit/core` + `@dnd-kit/sortable` is
   the natural choice.
6. **Shared types package** between backend/CMS/frontend — flagged since
   Phase 8, never fixed. Three independent `package.json`s, no root
   workspace; a repo-structure change, not a quick fix.
7. **Route-based code-splitting** for the CMS bundle — flagged every CMS
   phase since 8. `cms/src/routes.tsx` still imports every feature page
   eagerly.
8. **Lazy-loading images** on the public frontend — flagged Phase 20.
   `ProductCard`/`ProjectCard`/gallery thumbnails still load eager; must
   exclude hero/LCP images.
9. **`'contact'` banner placement** — noted above as out of this phase's
   named scope; a one-line addition matching the pattern here if it comes
   up.
10. **Reverse-proxy rewrite** for `sitemap.xml`/`robots.txt` — infra
    decision from Phase 25, not application code.
11. **Sitemap index/pagination** — not a real gap yet, just the ~50,000-URL
    threshold to watch.
12. **Website Builder / Dashboard refinement** — still completely unscoped
    across every phase since 13; needs a dedicated scoping pass before
    it's phase-sized work at all.
