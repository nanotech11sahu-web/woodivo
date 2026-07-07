# Phase 27 — Structured Data (JSON-LD) + `seo` on AboutPage / WebsiteSettings

Phase 26's notes named this the Phase 27 candidate, folding in two items
from the same backlog list explicitly because "both touch the same pages'
`<head>`/structured-data output in one pass":

1. **Structured data / JSON-LD** (`Organization`, `Product`, `BlogPosting`,
   `BreadcrumbList`) — flagged every phase since 24, next in the SEO
   thread `<head>` meta (24) → sitemap (25) → banner wiring (26) →
   structured data (27, this phase).
2. **`seo` fields on `AboutPage`/`WebsiteSettings`** — flagged since
   Phase 24, the last two content types without one (every other schema —
   Category, Product, Blog, Project — has had `SeoMeta` since before the
   public frontend existed).

## `Product` — no fabricated `offers`/`aggregateRating`

Both the Phase 25 and 26 notes carried the same explicit warning forward:
`Product` has no `price`/`sku`/`rating` field anywhere in the schema, so
`offers`/`aggregateRating` are never emitted — inventing either is a
Google manual-action risk (structured data must reflect visible page
content), not a minor omission worth taking a shortcut on. What's
actually on the schema maps cleanly instead: `name`, `description`,
`image` (all of `images`, not just the first), `category` (name only,
same populate-shape the frontend's own `ProductCategoryRef` already
uses), and `specifications` — mapped to `additionalProperty` /
`PropertyValue` since `SpecificationItem.key`/`.value` is already exactly
that shape, nothing invented.

## `BlogPosting` — `author` type depends on `authorName`

`author` is a required property for this type to validate. `Blog` has
`authorName` as the only author info on the schema — no separate author
entity, bio, or URL — so `author` renders as a `Person` when it's set and
falls back to the site's own `Organization` (via `WebsiteSettings
.siteName`) when it isn't, rather than a page ever going out with the
property missing. `publisher` is always the `Organization`, with a `logo`
only when `WebsiteSettings.logo` is actually set — Google's rich-result
docs want an `ImageObject` logo on `publisher`, but omitting it beats
fabricating one, same discipline `Product` applies to `offers`.
`datePublished` prefers `publishAt` over `createdAt`, mirroring the
`formatDate(blog.publishAt || blog.createdAt)` this page's own byline
already used before this phase touched it.

## `BreadcrumbList` — emitted from `Breadcrumbs`, not per-page

Every page that renders a breadcrumb trail (About, Category, Product,
Project listing/details, Blog listing/details, Contact, Gallery — nine
call sites) already builds the exact `{ label, to }[]` a `BreadcrumbList`
needs. Rather than adding a schema-building call to each of those nine
pages, `components/shared/breadcrumbs.tsx` now emits its own JSON-LD
directly from the `items` prop it already receives — one change instead
of nine, and any future page that adds a `<Breadcrumbs />` call gets
correct structured data automatically instead of needing to remember to
add it. The last item (the current page, never a link) gets no `item`
URL in the schema either, matching how it renders with no `<Link>` and
matching Google's own examples for a self-referential final crumb.

## `Organization` — layout-level, not page-level

Unlike the other three, `Organization` describes the business itself, not
a piece of page content — there's no single "details page" it belongs to.
It's emitted once from `SiteLayout`, which wraps every route via
`<Outlet />` and never unmounts on client-side navigation, so it fires
once per session rather than re-diffing an identical script tag on every
route change the way a per-page call would. Built from
`WebsiteSettings.siteName`/`.logo`/`.contact`/`.socialLinks` — `sameAs`
collects whichever social URLs are actually set (Pinterest included, even
though `SocialLinksRow` has no icon for it — `sameAs` isn't an icon list).
No values are fabricated when unset; the whole schema is skipped if
neither `siteName` nor `logo` exists yet (a fresh install before a CMS
operator visits Settings).

## New: `frontend/src/lib/use-json-ld.ts`

Same `data-seo-managed`-style upsert pattern `use-seo-meta.ts` established
for `<meta>`/`<link>` tags, applied to `<script type="application/ld+json">`:
a `useJsonLd(key, schema)` hook that finds-or-creates a script tagged
`data-seo-jsonld="${key}"`, so unrelated callers on the same page (a
details page's `'entity'` schema and `Breadcrumbs`' `'breadcrumb'` schema)
never clobber each other. Unlike `useSeoMeta`'s tags, a stale JSON-LD
block is worse than stale meta decoration — it's a structured claim a
crawler can extract as fact — so `useJsonLd` always removes its own node
on unmount, not just when a later call passes `undefined`.

`'entity'` is the key both `ProductDetailsPage` and `BlogDetailsPage` use
for their respective schema — the two pages are mutually exclusive
routes, so there's no collision, and it means a future third entity-detail
page (if one's ever added) has an established key to reuse rather than
inventing a new one per page.

## `AboutPage.seo` / `WebsiteSettings.seo`

Same `SeoMetaSchema`/`SeoMetaDto` every other content type already uses
(`backend/src/common/schemas/seo-meta.schema.ts`) — no new shape, just
adding the existing one to the two schemas that never got it. Wired into
both pages' `useSeoMeta` calls following the exact fallback-chain
precedent every entity page already has: CMS-entered `seo` data wins,
then a content-derived fallback, then a hardcoded default.

- **`about-page.tsx`** — `about.seo?.metaTitle || 'About Us'`,
  `about.seo?.metaDescription || truncate(about.storyContent) ||
  <hardcoded sentence>`, `about.seo?.ogImage || heroImage` (the
  `AboutPage.heroImage` → `Banner('about')` → gradient chain Phase 26
  already built).
- **`home-page.tsx`** — Phase 24's own notes explicitly weighed adding a
  `seo` field just for Home's meta description and called it "out of
  proportion to the problem, for one string, on one page," hardcoding it
  instead. That calculus changes now that `WebsiteSettings` has a `seo`
  field for other reasons (structured-data work needed it to be the last
  content type without one) — Home prefers it the same way every entity
  page prefers `entity.seo`, with the Phase 24 hardcoded copy surviving
  as the fallback a fresh install shows before Settings is ever touched.
  This is also the first time Home has ever set an explicit `title`
  (previously always `undefined`, rendering just the site name).

CMS: both `AboutPageEditor` and `SettingsPage` get a "SEO" `Card` — same
five fields (`metaTitle`/`metaDescription`/`metaKeywords`/`ogImage`
/`canonicalUrl`), same comma-split-keywords submit transform, same
`Card`/`Label`/`Input`/`Textarea` layout — as `ProductFormPage`'s existing
SEO section, copied rather than reinvented.

## What's deliberately staying out of this phase

- **`Category`/`Project` structured data** — not named in Phase 26's
  scoped list (`Organization`, `Product`, `BlogPosting`, `BreadcrumbList`
  only). Both still get `BreadcrumbList` for free via the `Breadcrumbs`
  change above; a `Product`-shaped schema for `Category` or a
  `CreativeWork`-shaped one for `Project` is a separate, unscoped item.
- **`WebSite` schema with `SearchAction`** — there's no site search
  endpoint for a `potentialAction` to point at; would be fabricating
  capability the site doesn't have.
- **`AggregateOffer`/review schemas** — same "don't fabricate" reasoning
  as `Product.offers`, just for a different type.
- **Rich-result validation against Google's Structured Data Testing
  Tool / Search Console** — nothing in this sandbox has a live, publicly
  reachable URL for Google's tools to fetch; every shape here is checked
  by hand against schema.org's own property definitions and Google's
  documented required/recommended fields, not by an external validator.

## Verified

`tsc -b` passes clean on `backend`, `cms`, and `frontend`. `eslint` clean
on every new/touched file across all three. Manually traced each JSON-LD
object's field list against schema.org's own `Product`/`BlogPosting`
/`BreadcrumbList`/`Organization` definitions and Google's rich-result
required-field docs. Confirmed `useJsonLd`'s cleanup path: navigating
Product A → Product B updates the existing `'entity'` script's content
instead of appending a duplicate; navigating Product → Home removes it
entirely instead of leaving a stale `Product` block on a page with no
product. Confirmed the `Organization` script persists unchanged across
in-session route changes since `SiteLayout` never unmounts.

## Next (Phase 28 candidate)

Full open backlog, carried forward from Phase 26's notes (nothing below
was touched this phase):

1. **Blog/Gallery search & tag-filter UI** — flagged Phase 20/21.
   `search`/`tag` params already exist server-side on both public query
   DTOs; this is UI-only, no backend work.
2. **Homepage content module** — flagged Phase 18. Needs a new backend
   module (or a `WebsiteSettings` sub-document), a CMS array editor, and a
   frontend rewrite of `why-woodivo-section.tsx` off its hardcoded
   `POINTS` array.
3. **Drag-and-drop reorder** on CMS array editors
   (`specifications-editor.tsx`, `values-editor.tsx`,
   `milestones-editor.tsx`, `team-members-editor.tsx`) — flagged Phase 23.
   No drag library installed yet; `@dnd-kit/core` + `@dnd-kit/sortable` is
   the natural choice.
4. **Shared types package** between backend/CMS/frontend — flagged since
   Phase 8, never fixed. Three independent `package.json`s, no root
   workspace; a repo-structure change, not a quick fix.
5. **Route-based code-splitting** for the CMS bundle — flagged every CMS
   phase since 8. `cms/src/routes.tsx` still imports every feature page
   eagerly.
6. **Lazy-loading images** on the public frontend — flagged Phase 20.
   `ProductCard`/`ProjectCard`/gallery thumbnails still load eager; must
   exclude hero/LCP images.
7. **`'contact'` banner placement** — Phase 26 left this out of its named
   scope (About/Projects/Blogs only); still a one-line addition matching
   the pattern there if it comes up.
8. **Reverse-proxy rewrite** for `sitemap.xml`/`robots.txt` — infra
   decision from Phase 25, not application code.
9. **Sitemap index/pagination** — not a real gap yet, just the
   ~50,000-URL threshold to watch.
10. **Category/Project structured data** — noted above as out of this
    phase's named scope; natural follow-up now that the `useJsonLd`
    plumbing and `'entity'`-key precedent both exist.
11. **Website Builder / Dashboard refinement** — still completely
    unscoped across every phase since 13; needs a dedicated scoping pass
    before it's phase-sized work at all.
