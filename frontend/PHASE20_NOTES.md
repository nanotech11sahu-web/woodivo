# Phase 20 — Public Frontend: Projects & Gallery

Phase 19 built Category Listing and Product Details and named the natural
continuation in its own "Next" section: "Projects listing/detail and
Gallery — the two remaining page types with existing homepage sections to
draw visual language from." This phase builds those three routes
(`/projects`, `/projects/:slug`, `/gallery`) and leaves About, Blogs,
Blog Details and Contact on `ComingSoonPage` — still unbuilt, still
explicitly out of scope here.

## `types/project.ts` had the same populate bug `types/product.ts` had before Phase 19

`category` was typed `Category | string` — the full `Category` record,
banner/description/seo/displayOrder included. `ProjectsService`
(`backend/src/modules/projects/projects.service.ts`) only ever populates
it with `CATEGORY_POPULATE_FIELDS = 'name slug thumbnail status'`, the
same constant `ProductsService` uses. Nothing rendered `project.category`
until this phase's detail page needed the category name/slug for the
breadcrumb-adjacent link, so the wrong shape shipped unnoticed since
whichever phase first wrote this file. Replaced with `ProjectCategoryRef`,
mirroring `ProductCategoryRef` from Phase 19.

## `MediaGallery` — extracted from product-details-page, not duplicated a second time

Phase 19 deliberately kept `CategoryListingPage` and `ProductDetailsPage`
as two separate files rather than one generic `<EntityPage>`, because
their hero treatments and data shapes genuinely differ. The large-image-
plus-thumbnail-strip gallery inside `ProductDetailsPage` is a different
case: it never read anything product-specific, only a flat
`{url, alt}[]` and a name to fall back to for alt text. Once
`ProjectDetailsPage` needed the identical pattern for `project.images`,
keeping two copies would mean two places to update the next time the
gallery's thumbnail-strip behavior changes. Pulled out to
`components/shared/media-gallery.tsx`; `ProductDetailsPage` now imports
it instead of its old local `ProductGallery` function, with no visual
change.

## `ProjectCard` — same move, for the same reason `ProductCard` happened in Phase 19

The home page's `ProjectsSection` has had an inline project-card `<Link>`
since Phase 18. `ProjectListingPage` needs the same card. Pulled out to
`components/shared/project-card.tsx` as `ProjectCard`, taking a narrow
`ProjectCardItem` (`_id`, `title`, `slug`, optional `coverImage`, optional
`location`) rather than the full `Project` type — same reasoning as
`ProductCardItem`, though in this case every current caller happens to
have the full `Project` shape available; the narrower prop still avoids
coupling the card to fields it doesn't render. `ProjectsSection` now
imports this instead of its own copy, with no visual change. This one
stays a separate file from `ProductCard` — different entity, different
data — the way Phase 19 kept category and product pages separate.

## Enquiry source: added `project`, in both apps and the backend

Every enquiry origin so far has an `EnquirySource` value that matches it:
`homepage`, `product`, `category`, `contact`, `floating_cta`. There was no
`project` value. `ProjectDetailsPage`'s "Enquire About This Project"
button needed to call `openEnquiryDialog(source, presetCategorySlug)`
with *some* source, and the backend's `CreateEnquiryDto.source` is
`@IsEnum(EnquirySource)` — passing an arbitrary string would 400. Rather
than mislabel every project enquiry as `'category'` or `'homepage'` (both
wrong, and both would make the CMS's enquiry-source filter lie about
where a lead came from), added `PROJECT = 'project'` to the enum in three
places that all needed to agree:

- `backend/src/modules/enquiries/schemas/enquiry.schema.ts` — the
  source of truth `@IsEnum` validates against.
- `frontend/src/types/enquiry.ts` — the public site's `EnquirySource`
  union, so `openEnquiryDialog('project', ...)` type-checks.
- `cms/src/types/enquiry.ts` plus
  `cms/src/features/enquiries/enquiry-constants.ts` — `SOURCE_LABELS` is
  typed `Record<EnquirySource, string>`, so leaving `project` out there
  would have been a compile error the moment the union changed, not a
  silent gap. Added `'Project page'` alongside the rest, and `project` to
  `ENQUIRY_SOURCES` so it shows up in the CMS's source filter `<Select>`.

## Gallery — masonry grid, type toggle, no tag filter

- **Grid** uses CSS `columns` (`columns-2`/`sm:columns-3`/`lg:columns-4`)
  with `break-inside-avoid` per item, not a fixed-aspect grid like
  `ProductCard`'s. Gallery images come from the CMS's Media Library at
  whatever aspect ratio they were uploaded — cropping them all to squares
  would lose the point of a photo gallery. Images render at their natural
  width inside each column instead.
- **Type toggle** ("All / Photos / Videos") is safe to hardcode because
  `GalleryItemType` (`backend/src/modules/gallery/schemas/gallery-item.schema.ts`)
  is a fixed two-value enum, unlike Categories, which the master prompt's
  "Never hardcode categories" rule exists for specifically.
- **No tag filter.** `QueryPublicGalleryItemDto` accepts a `tag` param
  server-side, but tags are freeform strings set per-item in the CMS with
  no "list distinct tags in use" endpoint behind `/gallery`. A tag-filter
  UI would need to either hardcode a tag vocabulary the CMS never
  guarantees stays in sync, or a new backend endpoint — out of scope for
  this phase's listing-plus-detail pass. Left for whichever phase actually
  needs it.
- **Video items** show a `PlayCircle` icon overlay on the grid thumbnail
  (still just `item.media.url` as a poster-less preview — no separate
  thumbnail field on `GalleryItem`) and play inline via a native
  `<video controls autoPlay>` once opened in the lightbox.
- **No per-item detail route.** Nothing in the master prompt's page list
  calls for `/gallery/:id`; the lightbox is the "detail view."

## `GalleryLightbox` — native `<dialog>`, same call `EnquiryDialog` already made

The site's only existing modal (`components/shared/enquiry-dialog.tsx`,
Phase 18) is a native `<dialog>` specifically to avoid a headless-UI/Radix
dependency for a single use case. A second modal doesn't change that
math, so `GalleryLightbox` follows the identical shape: `showModal()` /
`close()` driven by a boolean derived from a prop, `onCancel` and a
backdrop-click both closing it. `activeIndex` is owned by `GalleryPage`,
not the lightbox itself — Left/Right arrow-key navigation and the
prev/next buttons all wrap within the *current page's* `items` array
(the grid is paginated, same `page` query-param pattern
`CategoryListingPage` established in Phase 19), so paging past the last
thumbnail on a page wraps to the first rather than reaching into a page
of items that hasn't been fetched.

## Project details — gallery, optional detail fields, single CTA

- **Gallery** treats `coverImage` as image zero when present
  (`[project.coverImage, ...project.images]`), rather than showing it once
  in a separate hero block and again buried partway through the thumbnail
  strip — `Project` keeps them as two schema fields, but visually they're
  one set of photos.
- **Details `<dl>`** (`Client` / `Location` / `Completed`) renders only
  the fields actually set — all three (`clientName`, `location`,
  `completionYear`) are optional on the schema, same reasoning Phase 19
  gave for `ProductDetailsPage`'s specifications block not showing an
  empty heading.
- **One CTA**, not two. `ProductDetailsPage` has "Enquire Now" and "Get
  Quote" because the master prompt's Products section names both as the
  product page's calls to action. Nothing in the master prompt names a
  second CTA for Projects, so this page has a single "Enquire About This
  Project" button rather than inventing a second one to match the product
  page's layout.
- **404 vs error split** is identical to Phase 19's pattern:
  `isNotFoundError` → `EntityNotFound` with a link back to `/projects`
  (not `/`, since "browse other projects" is the more useful recovery
  from a dead project link specifically); any other error → the shared
  `ErrorNote`.

## Project listing — single flat list, no category filter

`CategoryListingPage` (Phase 19) is scoped to one category via `:slug`.
Projects has one page in the master prompt's list, not a per-category
variant, and nothing in the site links to a category-filtered project
list yet — the home page's `ProjectsSection` and the header/footer nav
both link to a plain `/projects`. Built as a single paginated grid instead
of guessing at a filter UI nothing asks for. `useProjects` already forwards
a `category` param to the backend's `findAllPublic` (used internally by
`useFeaturedProjects`), so adding a category filter later is a
query-param addition to this page, not a new hook or endpoint.

## What's deliberately not in this phase

- **About, Blogs listing/detail, Contact** — still `ComingSoonPage`.
  Projects and Gallery were the two named as "next" in Phase 19; Blogs
  carries its own noted wrinkle (rendering CMS rich-text safely) and
  Contact needs the still-unread `googleMapEmbedUrl` — both explicitly
  deferred again, not silently dropped.
- **`<head>` / full SEO management** — flagged by Phase 18, flagged again
  by Phase 19, not addressed here either. `useDocumentTitle` covers the
  tab title on both new detail pages; meta description, OG tags and
  canonical URLs are still nowhere.
- **Gallery tag filtering** — see above; needs either a hardcoded
  vocabulary or a new backend endpoint, neither in scope here.
- **Cross-page lightbox navigation** — see above; scoped to the current
  page's fetched items, same boundary `Pagination` already draws
  everywhere else on the public site.
- **Image lazy-loading site-wide** — only the gallery grid got
  `loading="lazy"` this phase (it's the one place with 24 images on
  screen at once); `ProductCard`, `ProjectCard` and the gallery/product
  detail heroes are unchanged from Phase 19, still not lazy. The master
  prompt's "Performance" section remains open, same carried-forward note
  Phase 19 gave.

## Verified

- `npm install` — clean in all three apps (`frontend`, `cms`, `backend`);
  no new dependencies added anywhere this phase.
- `frontend`: `npx tsc -b` clean, `npm run build` clean (540.5KB / 166.8KB
  gzip — up from Phase 19's 531.2KB / 165.1KB gzip for three more routes,
  still a single chunk, same warning carried forward), `npx eslint .`
  clean except the same two pre-existing `react-refresh/only-export-
  components` warnings Phase 18 and 19 already had.
- `cms`: `npx tsc -b` clean after the `EnquirySource` union grew a member
  — confirms `SOURCE_LABELS`'s `Record<EnquirySource, string>` type
  actually caught the exhaustiveness check as intended, not just in
  principle.
- `backend`: `npx tsc --noEmit` clean after the same enum addition.
- **Not run, same caveat as every phase in this project:** nothing against
  a live backend or real Cloudinary-hosted media. The gallery's masonry
  layout, video-item handling, and the lightbox's keyboard navigation are
  reasoned through against the schema and service code, not against real
  API responses.

## Next (Phase 21 candidate)

- **Blogs listing/detail** — same shape as this phase, plus the
  rich-text-rendering wrinkle Phase 19 already flagged
  (`cms/src/features/blogs/blog-form-page.tsx` is where that content is
  authored).
- **Contact page** — its own enquiry form plus `googleMapEmbedUrl`
  (`WebsiteSettings.contact.googleMapEmbedUrl`), unread anywhere on the
  public site still.
- **About page** — the one remaining page with no obvious existing
  homepage section to draw from; likely needs its own CMS-editable content
  block rather than reusing an existing schema.
- **`<head>` / SEO management** — flagged a third time now. Still the
  longest-running open item on the public site.
