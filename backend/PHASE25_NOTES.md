# Phase 25 — Backend: Sitemap / `robots.txt`

The Phase 24 notes named this as the next candidate: `SeoMeta` (`metaTitle`,
`metaDescription`, `metaKeywords`, `ogImage`, `canonicalUrl`) has existed on
`Category`/`Product`/`Blog`/`Project` and been consumed on the frontend
since Phase 24, but nothing aggregated it server-side for a sitemap. The
Phase 7 prompt weighed and deferred a standalone `modules/seo` for exactly
this. This phase builds it.

## New: `src/modules/seo/`

Thin module, same shape as `about`/`faqs` — controller + service, no schema
of its own. Depends on `CategoriesModule`, `ProductsModule`,
`ProjectsModule`, `BlogsModule` and calls each service's existing
`findAllPublic()` rather than touching their Mongoose models directly.

- **`GET /api/v1/seo/sitemap-data`** (`@Public()`) — JSON aggregation:
  `{ categories, products, blogs, projects }`, each an array of
  `{ slug, updatedAt }` only. Normal route, normal
  `TransformInterceptor` envelope.
- **`GET /sitemap.xml`** — full sitemap XML built from the same
  aggregation plus the static routes in `frontend/src/routes.tsx` that
  don't take a `:slug` (`/`, `/about`, `/projects`, `/gallery`, `/blogs`,
  `/contact`).
- **`GET /robots.txt`** — `Allow: /`, `Disallow: /admin`, and a
  `Sitemap:` line pointing at `${PUBLIC_SITE_URL}/sitemap.xml`.

## Pagination: `findAllPublic()` only returns one page

`ProductsService`/`ProjectsService`/`BlogsService.findAllPublic()` are
paginated (`PaginationQueryDto`, capped at `limit: 100` via `@Max(100)`)
because they're built for listing-page requests, not sitemap generation.
`SeoService.collectAll()` walks every page (`hasNextPage` from
`buildPaginationMeta()`) until exhausted, so the sitemap reflects the full
catalog regardless of size — capped at `MAX_PAGES_PER_ENTITY = 500`
(50,000 items per entity type) purely as a runaway-loop safety net, not a
real limit. `CategoriesService.findAllPublic()` has no pagination to walk;
called directly.

## New required env var: `PUBLIC_SITE_URL`

Nothing before this phase built absolute URLs server-side —
`use-seo-meta.ts` (Phase 24) resolves them client-side via
`window.location.origin`, which doesn't exist when a sitemap is generated
with no request context. `PUBLIC_SITE_URL` (Joi-validated as a URI,
defaults to `http://localhost:5173`, trailing slash stripped) lives in
`AppConfig` next to `corsOrigins`, read via the existing `ConfigService`
pattern.

## Bypassing the global JSON envelope

`TransformInterceptor` wraps every response in `{ success, statusCode,
message, data, timestamp }` via `APP_INTERCEPTOR` — correct for JSON
endpoints, wrong for XML/plain-text. `sitemap.xml` and `robots.txt` use
`@Res()` **without** `{ passthrough: true }`, which opts the route out of
Nest's normal response handling entirely: the interceptor's `map()` still
runs but its output is discarded since the handler already wrote and
closed the response via `res.type(...).send(...)`. `sitemap-data` stays a
normal return-value route since it's meant to be consumed as JSON.

## Global prefix exclusion

`API_PREFIX` (`api/v1`) applies to every route via `setGlobalPrefix()` —
crawlers expect `sitemap.xml`/`robots.txt` at a site's root, not under
`/api/v1`, so both are excluded via `setGlobalPrefix(API_PREFIX, {
exclude: [...] })` in `main.ts`. This only moves them to the **API's own**
root. If the public frontend is a separately hosted static SPA on a
different origin than the API, `yourdomain.com/sitemap.xml` still won't
resolve without a reverse-proxy rewrite (nginx/Vercel rule forwarding
`/sitemap.xml` and `/robots.txt` to the API) — flagged in a `main.ts`
comment, not solved here since it's an infra decision, not a code one.

## What's deliberately staying out of this phase

- **Structured data / JSON-LD** — distinct concern from both Phase 24's
  meta tags and this phase's sitemap plumbing, still not folded in.
- **Sitemap index / pagination** — not needed at current catalog size;
  only worth building once a single `sitemap.xml` nears the ~50,000-URL
  protocol-recommended ceiling.
- **Banner-placement wiring for `about`/`projects`/`blog`** — flagged
  since Phase 22/23, unrelated to SEO infra.
- **Drag-and-drop reorder** on CMS array editors — flagged since Phase 23,
  unrelated to this phase.

## Next — full open backlog, in priority order

Everything below is flagged and unresolved as of this phase. Ranked by
how long it's been carried forward and how much it's actively blocking,
highest priority first — **item 1 is the recommended Phase 26**.

1. **Banner-placement wiring for `about`/`projects`/`blog`** — top
   priority. `BannerPlacement` has included these three values since
   Phase 7; only `hero` is wired to `useBanners`. Flagged every phase
   since 22 (23, 24, 25 — four phases running) with zero code movement.
   `about-page.tsx` already has a comment pointing at the exact spot to
   fix it. Small, self-contained, purely additive — no reason this stays
   open a fifth phase.
2. **Structured data / JSON-LD** (Organization, Product, BlogPosting,
   BreadcrumbList) — flagged Phase 24 and this phase. Natural next step
   in the SEO thread `<head>` meta (24) → sitemap (25) → structured data
   (26) was always heading toward. Note for whoever builds it: `Product`
   has no price/SKU/rating field anywhere in the schema — do **not**
   emit `offers` or `aggregateRating` with fabricated data; that's a
   Google manual-action risk, not a minor omission.
3. **`seo` fields on `AboutPage`/`WebsiteSettings`** — flagged Phase 24.
   Small addition, pairs naturally with item 2 since both touch the same
   pages' `<head>`/structured-data output in one pass.
4. **Blog/Gallery search & tag-filter UI** — flagged Phase 20/21.
   `search`/`tag` params already exist server-side on both public query
   DTOs; this is UI-only, no backend work.
5. **Homepage content module** — flagged Phase 18. Larger than the items
   above: needs a new backend module (or a `WebsiteSettings` sub-document),
   a CMS array editor, and a frontend rewrite of
   `why-woodivo-section.tsx` off its hardcoded `POINTS` array. Worth its
   own phase once items 1–4 are cleared.
6. **Drag-and-drop reorder** on CMS array editors
   (`specifications-editor.tsx`, `values-editor.tsx`,
   `milestones-editor.tsx`, `team-members-editor.tsx`) — flagged Phase
   23. No drag library installed yet; needs one added
   (`@dnd-kit/core` + `@dnd-kit/sortable` is the natural choice, nothing
   else in the CMS conflicts with it).
7. **Shared types package** between backend/CMS/frontend — flagged since
   Phase 8, never fixed. Real cost already paid once: the
   `SpecificationItem.key`-vs-`.label` mismatch Phase 19 found came
   directly from this. No workspace tooling exists yet (three independent
   `package.json`s, no root workspace) — this is a repo-structure change,
   not a quick fix, which is presumably why it's been deferred nine-plus
   phases running.
8. **Route-based code-splitting** for the CMS bundle — flagged every CMS
   phase since 8. `cms/src/routes.tsx` still imports every feature page
   eagerly; bundle size has grown every phase since. Straightforward
   `React.lazy()` + `<Suspense>` conversion once someone allocates the
   phase to it.
9. **Lazy-loading images** on the public frontend — flagged Phase 20.
   `ProductCard`/`ProjectCard`/gallery thumbnails still load eager. Small,
   but must exclude hero/LCP images or it hurts load performance instead
   of helping — don't lazy-load the first image the user sees.
10. **Reverse-proxy rewrite** for `sitemap.xml`/`robots.txt` at the
    frontend's root, if frontend and API end up on different origins —
    infra/deployment decision from this phase, not application code;
    revisit at actual deploy time, not before.
11. **Sitemap index/pagination** — not a real gap yet, just the threshold
    to watch (~50,000 URLs) before a single `sitemap.xml` needs
    splitting.
12. **Website Builder / Dashboard refinement** — the one master-prompt
    CMS item still completely unscoped across every phase since 13.
    Lowest priority not because it doesn't matter, but because "scope
    it" has to happen before "build it" can even be estimated — needs a
    dedicated scoping pass (what does "Website Builder" mean given the
    CMS already edits every page's content individually?) before it's
    phase-sized work at all.

## Verified

`tsc -b` and `nest build` pass clean. `eslint` clean on every new/touched
file. `GET /seo/sitemap-data` returns all four arrays with `slug`/
`updatedAt` only. `GET /sitemap.xml` is well-formed XML including every
static route and every published entity with no duplicates. `GET
/robots.txt` returns the correct `Sitemap:` line built from
`PUBLIC_SITE_URL`.
