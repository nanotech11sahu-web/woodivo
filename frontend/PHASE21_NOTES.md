# Phase 21 — Public Frontend: Blogs

Phase 20 built Projects and Gallery and named the natural continuation in
its own "Next" section: Blogs listing/detail was first on the list, "same
shape as this phase, plus the rich-text-rendering wrinkle Phase 19 already
flagged." This phase builds `/blogs` and `/blogs/:slug` and resolves that
wrinkle by actually checking what it was — it turns out not to exist.
About, Contact and `<head>`/SEO management remain `ComingSoonPage` /
unaddressed, still explicitly out of scope here.

## The "rich-text-rendering wrinkle" wasn't one

Phase 19 and Phase 20 both deferred Blogs partly because rendering CMS
rich text safely (sanitizing HTML, avoiding a raw `dangerouslySetInnerHTML`)
sounded like real work worth its own pass. Checking
`cms/src/features/blogs/blog-form-page.tsx` before writing anything: the
content field is a plain `<Textarea>` bound straight to `content: z.string()`
— there is no rich-text editor anywhere in this CMS, no HTML, nothing to
sanitize. `Blog.content` (`backend/src/modules/blogs/schemas/blog.schema.ts`)
is just a long string. The only real formatting decision left is
paragraph breaks: blank lines in the textarea become `<p>` boundaries,
single newlines stay as line breaks within a paragraph
(`content.split(/\n{2,}/)`, each block rendered with `whitespace-pre-line`).
No new dependency, no sanitizer library — there was nothing to defer.

## `types/blog.ts` had the same populate bug `product.ts` and `project.ts` had

`category` was typed `string` — not even `Category | string` like the other
two had, just a bare string, since nothing had ever tried to render it.
`BlogsService` (`backend/src/modules/blogs/blogs.service.ts`) populates it
with `CATEGORY_POPULATE_FIELDS = 'name slug'` on every public read
(`findAllPublic`, `findLatestPublic`, `findBySlugPublic`) — an object, not
a string, and a narrower one than `ProductCategoryRef` /
`ProjectCategoryRef` (no `thumbnail`, no `status` — `BlogCategory` doesn't
have either field on its schema). Added `BlogCategoryRef` mirroring that
shape, and kept the existing `BlogCategory` name for the *other* shape this
phase actually needed: `GET /blogs/categories` (`BlogCategoriesService.findAll()`)
returns the full record, `displayOrder` included, which is what powers the
listing page's filter pills below. Two interfaces, because the populated
field and the standalone-list endpoint genuinely return different shapes
of the same underlying document — collapsing them into one would mean
either pretending the populated `category` has a `displayOrder` it
doesn't, or pretending the categories list is missing one it does.

## `BlogCard` — same extraction Phase 19 and 20 already did twice

The home page's `BlogsSection` has had an inline blog-card `<Link>` since
Phase 18. `BlogListingPage` needs the same card. Pulled out to
`components/shared/blog-card.tsx` as `BlogCard`, taking a narrow
`BlogCardItem` rather than the full `Blog` type — same reasoning as
`ProductCardItem` and `ProjectCardItem`. `BlogsSection` now imports this
instead of its own copy, with no visual change. Added a publish-date line
to the card (`formatDate(blog.publishAt || blog.createdAt)`) that wasn't
on the old inline version — the listing page's grid needed some way to
show recency, and once the card had it, homepage got it too for free
rather than forking two versions.

## `formatDate` — first date-formatting helper this app has needed

Every previous public-site entity either had no dates worth displaying
on the page itself (Products, Projects, Categories, Gallery items all
show `createdAt`/`updatedAt` in the CMS, never on the public site) or
displayed them as-is. Blogs is the first where a human-readable publish
date matters on the page a visitor sees — a listing card, a detail
byline. Added `formatDate` to `lib/utils.ts` rather than inlining
`toLocaleDateString` twice; `en-IN` matches the site's other hardcoded
India-specific assumptions (WhatsApp digit stripping, Razorpay, INR
throughout the CMS).

## Blog listing — category filter pills, fetched not hardcoded

`GalleryPage`'s "All / Photos / Videos" toggle (Phase 20) is safely
hardcoded because `GalleryItemType` is a fixed two-value schema enum.
Blog categories are the opposite: `BlogCategory` is a CMS-editable
collection an admin can add to, rename, reorder or delete at any time
(`cms/src/features/blogs/blog-category-manager.tsx`) — exactly the case
the master prompt's "never hardcode categories" rule exists for. Pills
come from `useBlogCategories()` (`GET /blogs/categories`), sorted by
`displayOrder` same as the CMS's own category manager, with an "All"
pill prepended client-side. Selecting one sets `?category=<slug>` and
forwards straight to `useBlogs({ category })`, which — same pattern
`ProjectListingPage` noted for its own category param — was already
plumbed server-side (`QueryPublicBlogDto.category`,
`BlogsService.findAllPublic`'s category-slug lookup) and just needed a UI.

Single flat list otherwise, same "no `:categorySlug` nested route" call
`ProjectListingPage` made — nothing links to a category-scoped `/blogs`
path except the query-param link this phase itself adds (blog detail's
category label links to `/blogs?category=<slug>`, not a second route).

## Blog listing — page size is 9, not 12

Every other public grid (`CategoryListingPage`, `ProjectListingPage`)
uses `PAGE_SIZE = 12` at 3-4 columns. `BlogCard`'s `aspect-[16/10]`
featured-image treatment reads noticeably taller than `ProductCard`'s
square or `ProjectCard`'s `4:3`, and the grid tops out at 3 columns
(`sm:grid-cols-2 lg:grid-cols-3`, matching `ProjectListingPage`, not
`CategoryListingPage`'s 4) — 12 posts at 3-wide is four full rows before
a scroll, noticeably longer than the equivalent product/project grids.
9 (three full rows at the widest breakpoint) was closer to what the other
listings feel like at their own page sizes than carrying 12 over
unexamined would have been.

## Blog details — no rendering CTA, and here's why

`ProductDetailsPage` has two CTAs, `ProjectDetailsPage` has one
("Enquire About This Project"), matching what the master prompt names for
each. Nothing in the master prompt's Blogs section names an enquiry CTA
for a blog post, and `EnquirySource` (Phase 20 added `project` for exactly
this reason, when the project page needed one) has no `blog` value —
adding one to satisfy a CTA the prompt never asked for would mean
inventing both the UI and the backend enum member. Left off entirely,
consistent with Phase 20's "don't invent a second CTA to match another
page's layout" reasoning, applied here to inventing a first one nothing
calls for. The category label still links back to a filtered `/blogs`
list, and there's a plain "Back to all posts" link at the bottom — reading
recovery, not a sales action.

## Blog details — 404 vs error split, same as every other detail page

Identical to Phase 19/20's pattern: `isNotFoundError` → `EntityNotFound`
with a link back to `/blogs` (not `/`, "read other posts" is the more
useful recovery from a dead blog link specifically, same reasoning
`ProjectDetailsPage` gave for `/projects`); any other error → the shared
`ErrorNote`.

## `viewCount` — read but not shown

`BlogsService.findBySlugPublic` still fire-and-forgets a `viewCount`
increment on every read, same as before this phase. Nothing in the master
prompt's Blogs section calls for displaying a view count publicly (unlike,
say, a "trending posts" widget that might use it), so `Blog.viewCount` is
in `types/blog.ts` for completeness but neither `BlogCard` nor
`BlogDetailsPage` renders it. Left as data the backend already tracks for
whenever the CMS side wants to surface "most-read" sorting, not
invented UI for it here.

## What's deliberately not in this phase

- **About, Contact** — still `ComingSoonPage`. Both were named as
  remaining work in Phase 20's "Next" section but weren't the item Phase
  20 itself pointed to first; Contact still needs the unread
  `googleMapEmbedUrl`, About still needs its own CMS-editable content
  block neither of which this phase's scope (Blogs) touches.
- **`<head>` / full SEO management** — flagged by Phase 18, 19 and 20,
  flagged a fourth time here. `useDocumentTitle` covers the tab title on
  both new blog pages, same as every other content page; meta
  description, OG tags and canonical URLs (`Blog.seo` is fully populated
  server-side and sitting unused on every response) are still nowhere.
  This is now the longest-running open item across four phases.
- **Blog search / tag filtering** — `QueryPublicBlogDto` accepts both
  `search` and `tag` server-side (same as `QueryPublicGalleryItemDto`'s
  unused `tag` param, flagged by Phase 20), neither has a UI. No search
  box or tag-chip UI exists anywhere else on the public site to match
  against, so this follows Phase 20's gallery-tag reasoning rather than
  inventing a first one here.
- **Related/"you may also like" posts on blog detail** — `ProductDetailsPage`
  has this via `relatedProducts`, a field that exists on the `Product`
  schema specifically. `Blog` has no equivalent field (no admin-curated
  "related posts" picker in the CMS's blog form), and guessing a "same
  category" query to fake one wasn't asked for — left off rather than
  invented.

## Verified

- `npm install` — clean in `frontend`; no new dependencies added (no
  markdown/sanitizer library needed, per the rich-text finding above).
- `frontend`: `npx tsc -b` clean, `npm run build` clean (546.1KB / 167.6KB
  gzip — up from Phase 20's 540.5KB / 166.8KB gzip for two more routes,
  still a single chunk, same warning carried forward), `npx eslint .`
  clean except the same two pre-existing `react-refresh/only-export-
  components` warnings every phase since 18 has had.
- **Not run, same caveat as every phase in this project:** nothing against
  a live backend or real Cloudinary-hosted media. The category-pill
  filter, pagination-plus-category-param interaction, and the paragraph-
  break rendering are reasoned through against the schema and service
  code, not against real API responses or real blog content.

## Next (Phase 22 candidate)

- **Contact page** — its own enquiry form plus `googleMapEmbedUrl`
  (`WebsiteSettings.contact.googleMapEmbedUrl`), unread anywhere on the
  public site still. The one remaining page with a clear existing data
  source (`useSettings`, already wired for `useDocumentTitle`'s site
  name) to draw from.
- **About page** — still needs its own CMS-editable content block; no
  existing schema to reuse the way Contact can reuse `WebsiteSettings`.
- **`<head>` / SEO management** — flagged a fourth time now. Every detail
  page (`Product`, `Project`, `Blog`) already returns a fully-populated
  `seo` object that nothing but `useDocumentTitle`'s title-only slice
  reads.
