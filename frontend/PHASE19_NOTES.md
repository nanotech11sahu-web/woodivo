# Phase 19 — Public Frontend: Category Listing & Product Details

Phase 18 scaffolded the public site and built Home; every other route in
the master prompt's page list rendered `ComingSoonPage`. Its own "Next"
section named the natural continuation: Category Listing and Product
Details, "the most natural next step — they're what 'Enquire Now' and
every category/product card built this phase actually link to." This
phase builds those two, and leaves the rest (About, Projects, Gallery,
Blogs, Contact) on `ComingSoonPage` — still unbuilt, still explicitly out
of scope here, not silently forgotten.

## Two real content pages, not a generic "detail page" abstraction

`pages/categories/category-listing-page.tsx` and
`pages/products/product-details-page.tsx` are separate files with separate
data shapes, separate hero treatments, separate empty/error states —
not a shared `<EntityPage>` parameterized by type. A category page shows a
banner-hero and a paginated grid; a product page shows a two-column
gallery/specs layout and a related-products rail. Forcing both through one
generic component would mean more conditional branches inside it than the
two files have combined.

## Two bugs in `frontend/src/types/product.ts` found and fixed

Neither was exercised until this phase actually rendered the fields:

- **`SpecificationItem` had `label`, not `key`.** The backend schema
  (`backend/src/common/schemas/specification-item.schema.ts`) stores
  `key`/`value`. Nothing in Phase 18 read `product.specifications`, so the
  wrong field name shipped unnoticed. Fixed to `key`, and the CMS's own
  `SpecificationItem` (`cms/src/types/product.ts`) already had this right
  — this phase's version now matches it.
- **`category` and `relatedProducts` were typed as if the public API
  returned raw references, but the backend populates both.**
  `ProductsService.findAllPublic`/`findBySlugPublic`
  (`backend/src/modules/products/products.service.ts`) populate `category`
  with `'name slug thumbnail status'`
  (`CATEGORY_POPULATE_FIELDS`) — not the full `Category` document (no
  banner, description, seo, displayOrder) — and populate `relatedProducts`
  with `'name slug images seo'`, filtered to active products only via a
  `match`. The old type had `category: Category | string` and
  `relatedProducts: string[]`, neither of which matches what actually
  comes back over the wire. Replaced with `ProductCategoryRef` and
  `RelatedProductRef`, mirroring the CMS's own `CategoryRef` /
  `RelatedProductRef` (`cms/src/types/product.ts`), which already had this
  right because the CMS's product list/form pages needed it from Phase 9
  onward. Public and admin were reading the same populate, so there was no
  reason for the frontend type to guess differently.

## `components/shared/product-card.tsx` — extracted, and deliberately not typed as `Product`

`FeaturedProductsSection` had its own inline card JSX since Phase 18. This
phase needs the same card in two more places — the category grid and
"You may also like" on the product page — so a third inline copy would
mean three places to update the next time the card's design changes.
Pulled out as `ProductCard`, taking a new `ProductCardItem` interface
(`_id`, `name`, `slug`, optional `images`, optional `category`) rather
than the full `Product` type: `RelatedProductRef` items (what "You may
also like" actually receives) don't carry a `category` field at all, per
the populate `select` above. Typing the prop as `Product` would have
forced every related-product render to fake a `category` that was never
fetched. Structural typing means both `Product` and `RelatedProductRef`
satisfy `ProductCardItem` without either page lying about its data shape.

## Two failure states per page, not one

`isNotFoundError` (`lib/http-error.ts`, mirroring the CMS's own
`http-error.ts`) checks for a `404` specifically. Both pages branch on it:

- **404** (`CategoriesService.findBySlugPublic` /
  `ProductsService.findBySlugPublic` throw `NotFoundException` for an
  unknown or unpublished slug) → `EntityNotFound`, a "this isn't here
  (anymore)" message with a link back to Home. New component, not a reuse
  of `NotFoundPage`: the router's `*` page means the URL itself is
  unrecognized; this means the URL shape is correct
  (`/categories/:slug`, `/products/:slug`) but the specific slug doesn't
  resolve — a genuinely different situation (deleted product, unpublished
  category, stale link) that calls for different copy, even though it
  borrows the same `JaliDivider` visual language.
- **Any other error** (network failure, 500) → the existing `ErrorNote`,
  same "couldn't load, try again" component every home-page section
  already uses on a failed fetch. Not conflated with 404 — a timeout isn't
  "this product doesn't exist," and showing `EntityNotFound` for a
  transient failure would send a visitor away from a product that's still
  there.

## Category listing — banner hero, then a paginated product grid

- **Hero** follows the same pattern `HeroSection` established: a real
  banner image with a gradient overlay if `category.banner` exists, a CSS
  radial-gradient fallback if not (a category can exist with no banner
  uploaded yet — same reasoning Phase 18 gave for the homepage hero not
  assuming `banners[0]`).
- **Products** come from `useProducts({ category: slug, page, limit })` —
  the existing public products endpoint's `category` filter, which
  `ProductsService.findAllPublic` already resolves by slug server-side
  (`categoryModel.findOne({ slug: slugify(category), ... })`) and returns
  an empty page rather than an error for an unmatched slug. That backend
  behavior only mattered as an edge case before; here it's load-bearing —
  it's what keeps a category with zero products from being indistinguishable from a 404 in the UI (checked separately, since the *category*
  itself resolving is what's gated on `isNotFoundError`, not the product
  list).
- **Pagination** is `page` in the URL's query string
  (`useSearchParams`), not component state — so a shared or bookmarked
  `/categories/wooden-doors?page=3` link lands on the same page a visitor
  was looking at, and back/forward navigation between pages works. New
  `components/shared/pagination.tsx` rather than reusing the CMS's own
  `pagination.tsx`: different visual language (public palette vs. admin),
  different app (`cms/` and `frontend/` are separate builds with separate
  `package.json`s — there's no shared package between them to reuse from).

## Product details — gallery, specs, related products

- **Gallery** (`ProductGallery`, local to this file — the only place a
  multi-image gallery exists so far) is a large image plus a thumbnail
  strip, active image held in local `useState`. No carousel library: five
  or six product photos in a grid of buttons covers this without a new
  dependency, the same call Phase 18 made for the enquiry dialog over a
  modal library.
- **Specifications** render as a `<dl>` only if
  `product.specifications.length > 0` — a product with none (perfectly
  valid; the schema defaults to `[]`) doesn't get an empty "Specifications"
  heading over nothing.
- **Related products** render as the same `ProductCard` grid, only when
  the array is non-empty. Since the backend's populate already `match`es
  on `status: ACTIVE`, an inactive related product is silently absent from
  the array rather than needing a client-side filter — nothing to
  reproduce here.
- **CTAs** ("Enquire Now" and "Get Quote") both open the shared enquiry
  dialog via `openEnquiryDialog('product', category?.slug)` — two buttons,
  one behavior, consistent with how the master prompt describes both as
  the product page's calls to action without implying they should do
  different things.

## `lib/use-document-title.ts` — title only, not full `<head>` management

Phase 18 flagged per-page SEO tags as deferred, "belongs with whichever
phase builds the content pages that actually need per-page title/meta
tags" — this phase. What's built is deliberately partial: a `useEffect`
that sets `document.title` to `"{page title} | {siteName}"`, falling back
to `category.seo.metaTitle` / `product.seo.metaTitle` when the CMS has one
set. Meta description, OG tags, and canonical URLs — all typed already on
`SeoMeta` and present on both schemas — are still not written anywhere.
There's no `react-helmet`-equivalent installed, and adding one is a
bigger, separately-scoped change (a dependency plus a consistent pattern
every future content page would need to follow) rather than a drive-by
addition here. A tab title that matches the page is the minimum a content
page needs; full `<head>` management is still explicitly open.

## What's deliberately not in this phase

- **About, Projects, Gallery, Blogs listing/detail, Contact** — still
  `ComingSoonPage`. Category Listing and Product Details were the two
  named as "most natural next step"; the rest weren't in scope.
- **Full `<head>` / meta tag management** — see above. Title only.
- **Product search or category-internal filtering** (by price, by
  specification) — nothing in the master prompt's public-site page list
  asks for either; the category page filters by category only, same as
  the backend endpoint it calls.
- **Image lazy-loading / route-level code-splitting** — the master
  prompt's "Performance" section still isn't addressed; same note Phase 18
  carried forward from the CMS's own Phase 8. The production bundle grew
  from Phase 18's 520.9KB/162.6KB gzip to 531.2KB/165.1KB gzip for two more
  full pages — still a single chunk.
- **Breadcrumb structured data (JSON-LD)** — `components/shared/breadcrumbs.tsx`
  renders a visual/semantic `<nav>` trail only; no `BreadcrumbList` schema
  markup. Belongs with the same future `<head>`-management phase as the
  meta tags above.

## Verified

- `npm install` — clean, 233 packages (unchanged dependency set — no new
  packages added this phase).
- `npx tsc -b` — clean.
- `npm run build` — clean, ships a working bundle (531.2KB / 165.1KB
  gzip). Same single-chunk warning as Phase 18, not addressed this phase.
- `npx eslint .` — clean except the same two
  `react-refresh/only-export-components` warnings Phase 18 already had
  (`components/ui/button.tsx`, `enquiry-dialog-context.tsx`) — no new
  warnings introduced.
- **Not run, same caveat as every phase in this project:** nothing against
  a live backend. Both pages' hooks and populate-shape assumptions are
  reasoned through against the actual `products.service.ts` /
  `categories.service.ts` code, not against real responses from a running
  API with real Cloudinary-hosted images and CMS-authored specifications.

## Next (Phase 20 candidate)

- **Projects listing/detail and Gallery** — the two remaining page types
  with existing homepage sections to draw visual language from
  (`pages/home/sections/projects-section.tsx` already renders a projects
  teaser the same way `featured-categories-section.tsx` did before this
  phase built out its full listing page).
- **Blogs listing/detail** — same shape, with the added wrinkle of
  rendering CMS rich-text content (`cms/src/features/blogs/blog-form-page.tsx`
  is where that content is authored) safely on the public side.
- **Contact page** — its own enquiry form plus `googleMapEmbedUrl`
  (`WebsiteSettings.contact.googleMapEmbedUrl`, typed and already in the
  CMS's settings form, unread anywhere on the public site yet).
- **`<head>` / SEO management** — flagged again, now by two phases in a
  row. The longer this waits, the more pages need retrofitting once it's
  finally built.
