# WOODIVO — Phase 24 Prompt (Frontend: `<head>` / SEO Meta Rendering)

> Feed this to Claude Code alongside the Enterprise Master Prompt and the
> Phase 23 frontend zip. Builds on Phase 23 (About). Frontend-only — no
> backend or CMS changes required.

## Context

Every content schema already carries SEO data — `Category.seo`,
`Product.seo`, `Blog.seo`, `Project.seo` (`SeoMeta`: `metaTitle`,
`metaDescription`, `metaKeywords`, `ogImage`, `canonicalUrl`) — and the CMS
already lets operators edit it. The frontend types mirror this
(`src/types/category.ts`, `product.ts`, `blog.ts`, `project.ts` all type
`seo?: SeoMeta`). None of it reaches the actual `<head>`.

`useDocumentTitle` (`src/lib/use-document-title.ts`) is the only thing
touching `<head>` today, and its own comment says why it stops where it
does: no `react-helmet`-equivalent is installed, and full meta management
was called "a bigger, separately-scoped change" — deferred every phase
since 18, flagged six times through Phase 23. This is that phase.

## Goal

Every page sets a real `<title>`, `<meta name="description">`, canonical
`<link>`, and Open Graph tags reflecting what's actually on screen —
falling back to sane site-wide defaults when a content item has no `seo`
data, exactly the way `useDocumentTitle` already falls back to `product.name`
when `product.seo.metaTitle` is empty.

## Reuse these exact patterns (do not deviate)

- No new data fetching. Every page that needs SEO data already fetches the
  entity that carries it (`useProduct`, `useCategory`, `useBlogDetails`,
  `useProjectDetails`) — read `.seo` off the same query result already in
  scope, the same way `product-details-page.tsx` already does for the
  title.
- `useSettings()` stays the source for site-wide fallbacks (`siteName`,
  future default OG image) — same hook `useDocumentTitle` already calls.
- Keep `useDocumentTitle`'s call sites untouched where possible; extend
  rather than replace. Every page currently calls
  `useDocumentTitle(x?.seo?.metaTitle || x?.name)` — that title logic is
  correct and should not be re-derived twice.
- Follow the existing per-page inline doc-comment convention (see
  `about-page.tsx`, `use-document-title.ts`) — explain non-obvious
  fallback choices in a comment at the call site, not just in code.

## Approach — pick one, document the choice

No `react-helmet-async` or equivalent is installed. Two reasonable paths;
default to (a) unless a reason emerges to add the dependency:

- **(a) No new dependency.** A `useSeoMeta` hook (`src/lib/use-seo-meta.ts`)
  that does direct DOM manipulation in a `useEffect` — `document.title`,
  and `getElementById`/`querySelector` + create-or-update for
  `<meta name="description">`, `<link rel="canonical">`,
  `<meta property="og:title">`, `og:description`, `og:image`,
  `og:url`. Tag each managed element with a `data-seo-managed="true"`
  attribute so the hook can find and update its own tags on route change
  without duplicating them, and clean up on unmount only where a static
  fallback (from `index.html`) should reappear for pages this hook never
  runs on (there are none currently, but write the cleanup correctly
  regardless).
- **(b) Add `react-helmet-async`.** Only if (a) proves awkward for OG tags
  specifically — wrap `App.tsx` in `HelmetProvider`, replace
  `useDocumentTitle` call sites with a `<SeoHead>` component. More
  idiomatic, but a new dependency and a wrapper-component change to every
  page for what (a) can do with a hook swap. State which was chosen and
  why in the phase notes.

## Page-by-page scope

- **Product details** (`product-details-page.tsx`): title (already
  correct), description from `product.seo.metaDescription` falling back
  to a truncated `product.description`, canonical from
  `product.seo.canonicalUrl` falling back to the current product URL,
  `og:image` from `product.seo.ogImage` falling back to `product.images[0]`.
- **Category listing** (`category-listing-page.tsx`): same shape, sourced
  from `Category.seo`.
- **Blog details** (`blog-details-page.tsx`): same shape from `Blog.seo`,
  `og:image` fallback to `blog.featuredImage`.
- **Project details** (`project-details-page.tsx`): same shape from
  `Project.seo`, `og:image` fallback to `project.images?.[0]`.
- **Static pages with no `seo` field** (Home, About, Projects listing,
  Gallery, Blog listing, Contact, 404): no schema change in this phase —
  each gets a hardcoded, page-specific meta description via the same
  `useSeoMeta` hook, passed as plain strings/props (not sourced from an
  API). This is the same "no schema to draw from yet" situation Phase 23
  solved for About's *content*; solving it for these pages' *meta* is a
  smaller, single-field problem that doesn't need a backend module —
  flag adding `seo` to `AboutPage`/`WebsiteSettings` as a future
  consideration, don't build it now.

## What's deliberately staying out of this phase

- **Sitemap / `robots.txt` generation.** Needs the `SeoMeta` data
  aggregated server-side (slug + `updatedAt` across content types) —
  the Phase 7 prompt weighed and explicitly deferred a standalone
  backend `modules/seo` for this; still deferred, now a clean Phase 25
  candidate once this phase proves out the frontend consumption side.
- **Structured data / JSON-LD** (Product, Article, Organization schema
  blocks) — a real SEO improvement, but a distinct concern from meta-tag
  plumbing; don't fold it in here.
- **Banner-placement wiring for `about`/`projects`/`blog`** — unrelated
  gap, still flagged, still not this phase.
- **Adding `seo` fields to `AboutPage` or `WebsiteSettings` schemas** —
  noted above as a future option, not built here to keep this phase
  frontend-only with zero backend/CMS changes.

## Verify

`tsc -b` passes clean. Manually confirm on at least one Product, one
Category, one Blog, and one Project page: `document.title`,
`<meta name="description">`, `<link rel="canonical">`, and the `og:*` tags
all update correctly on client-side route change (not just on hard
reload) and do not duplicate on repeated navigation between two entities of
the same type.
