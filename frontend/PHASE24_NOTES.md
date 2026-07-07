# Phase 24 — Public Frontend: `<head>` / SEO Meta Rendering

`useDocumentTitle`'s own comment flagged this since Phase 18: no
`react-helmet`-equivalent was installed, and full `<head>` management
(per-page meta description, OG tags, canonical URLs from `Category.seo` /
`Product.seo` / `Blog.seo` / `Project.seo`) was "a bigger, separately-scoped
change." Flagged again in Phases 19 through 23 — six phases running. This
phase closes it. Frontend-only; no backend or CMS changes, since
`SeoMeta` (`metaTitle`, `metaDescription`, `metaKeywords`, `ogImage`,
`canonicalUrl`) has existed on every relevant schema and been editable in
the CMS since before Phase 18 ever started building public pages. The data
was always there — nothing on the public site ever read past
`seo?.metaTitle`.

## `useSeoMeta` replaces `useDocumentTitle`, not alongside it

New: `src/lib/use-seo-meta.ts`. Old `src/lib/use-document-title.ts` is
deleted, not deprecated — every one of its nine call sites needed the same
`${title} | ${siteName}` logic `useSeoMeta` already has to compute
internally to build `og:title`, so keeping both hooks around would mean
either two sources of truth for the title string or `useSeoMeta` wrapping
`useDocumentTitle` for one field while duplicating its `useSettings` read
for everything else. One hook, same fallback behavior for title
(`title ? \`${title} | ${siteName}\` : siteName`) plus five more managed
tags.

## No `react-helmet-async` — direct DOM manipulation

Chose option (a) from the phase brief over adding a dependency: a
`useEffect` that finds-or-creates `<meta>`/`<link>` elements via
`document.head.querySelector`/`createElement`. Every element `useSeoMeta`
touches gets `data-seo-managed="true"` so:

- Repeated navigation between two entities of the same type (Product A →
  Product B) updates the existing tag's `content`/`href` instead of
  appending a duplicate — `upsertMeta`/`upsertCanonical` look for the
  managed selector first, only create a new node if none exists yet.
- A page that passes `description: undefined` (nothing to fall back to)
  removes its own managed tag rather than leaving stale content from
  whatever page came before — this is what makes Home's static
  `index.html` `<meta name="description">` still work correctly: Home's
  own `useSeoMeta` call passes an explicit description, but if it ever
  didn't, the *unmanaged* static tag from `index.html` (no
  `data-seo-managed` attribute) is invisible to `upsertMeta`'s selector
  and never gets touched either way.

`og:image` and canonical URLs get resolved to absolute
(`window.location.origin`-prefixed) via a small `toAbsoluteUrl` helper —
`Category.seo.ogImage` etc. can be a bare Cloudinary path or a full URL
depending on how the CMS operator entered it (same "some fields are
sometimes-absolute" looseness `Banner.ctaLink` already had), OG tags need
an absolute URL either way.

## Fallback chain, same shape on every entity page

Product/Category/Blog/Project details all follow the same pattern:
`entity.seo.metaTitle || entity.name`, `entity.seo.metaDescription ||
truncate(entity.description)`, `entity.seo.ogImage ||
entity.images[0]?.url`, `entity.seo.canonicalUrl || `/products/${slug}``
— CMS-entered SEO data wins when present, otherwise derive something
reasonable from content that's already there rather than leaving the tag
empty. `truncate()` (new, `src/lib/utils.ts`) cuts at the last whole word
under 160 chars rather than mid-word, same reasoning `SeoMeta.metaDescription`
already enforces server-side via its own `maxlength: 160`.

## Static pages get hardcoded descriptions, not new schema

Home, About, Projects listing, Gallery, Blog listing, Contact, and 404 have
no `seo` field to read from — same gap Phase 23's own notes considered for
About's *content* and solved with a real schema. Solving it here for
About's *meta description* would mean adding a field to a schema Phase 23
just finished, for one string, on one page — out of proportion to the
problem. Each of these seven pages gets a hardcoded, page-specific
description passed straight into `useSeoMeta`. About goes one step further
since it already has *a* content field to draw from post-Phase-23:
`truncate(about?.storyContent)`, falling back to a hardcoded sentence only
if the CMS operator hasn't filled in `storyContent` yet.

## Home needed a `useSeoMeta` call it never had

Home was the one page with zero title management before this phase — it
relied entirely on `index.html`'s static tags, which worked only because
nothing else on the site ever touched `document.title` first. Now that
every interior page manages its own title, navigating Product → Home
client-side would otherwise leave the Product's title showing forever.
Home's `useSeoMeta` call exists specifically to reset that on the way
back, not because Home needed dynamic SEO data of its own.

## 404 is the one `noIndex: true` call

`useSeoMeta` accepts an optional `noIndex` flag that adds
`<meta name="robots" content="noindex, nofollow">` — every other call site
in the codebase leaves it unset (indexable by default). `NotFoundPage` is
the only page that should actively tell search engines not to index it.

## What's deliberately not in this phase

- **Sitemap / `robots.txt` generation.** Needs `SeoMeta` (slug +
  `updatedAt`) aggregated server-side across content types — the Phase 7
  prompt weighed and explicitly deferred a standalone backend
  `modules/seo` for exactly this; still deferred, now that this phase
  proves out the frontend consumption side, a clean next step.
- **Structured data / JSON-LD** (`Product`, `Article`, `Organization`
  schema blocks) — a real SEO improvement, but a distinct concern from
  meta-tag plumbing, not folded in here.
- **`seo` fields on `AboutPage` or `WebsiteSettings`** — About gets a
  content-derived fallback instead (see above); the other six static
  pages stay hardcoded strings. Adding real schema fields for these is a
  future option, not a blocker this phase needed to clear.
- **Banner-placement wiring for `about`/`projects`/`blog`** — unrelated
  gap, still flagged from Phase 22/23, still not this phase.

## Verified

`tsc -b` passes clean. `eslint` clean on every touched file. Manually
confirmed on Product, Category, Blog, and Project pages: `document.title`,
`<meta name="description">`, `<link rel="canonical">`, and the four `og:*`
tags all update in place (no duplicates) across client-side navigation
between two entities of the same type, and correctly reset to Home's
values on navigating back to `/`.

## Next (Phase 25 candidate)

- **Sitemap / `robots.txt` generation** — the natural continuation of this
  phase: a backend endpoint (`GET /seo/sitemap-data`, `@Public()`) that
  returns slug + `updatedAt` across Categories/Products/Blogs/Projects in
  one call, for `sitemap.xml` generation. The Phase 7 prompt weighed and
  deferred this exact module; now that the frontend actually consumes
  `SeoMeta` per-entity, the backend side is worth building.
- **Banner-placement wiring for `about`/`projects`/`blog`** — flagged by
  Phase 22, flagged again by Phase 23, still not solved. `BannerPlacement`
  has included these values since Phase 7; only `hero` is actually wired
  to `useBanners` today.
- **Structured data / JSON-LD** — `Product`, `Article`, and `Organization`
  schema blocks, a distinct concern from the meta-tag plumbing this phase
  built, deliberately not folded in here.
- **Drag-and-drop reorder** for the array editors
  (`specifications-editor.tsx`, `values-editor.tsx`,
  `milestones-editor.tsx`, `team-members-editor.tsx`) — still add/remove
  only, flagged since Phase 23.
