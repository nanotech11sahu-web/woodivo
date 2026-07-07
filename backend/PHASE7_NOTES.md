# Phase 7 — Content Modules + Dashboard

Builds on Phase 6 (Enquiries). Brings the six schema-only content modules up
to full CRUD, plus a real dashboard-stats endpoint and a decision on the
empty SEO module.

## 1. Blogs (`modules/blogs`)

Two sub-resources sharing one schema file, split like Categories/Products:

- **BlogCategory** — lightweight admin-only CRUD (`/admin/blog-categories`),
  with `reorder` and delete-guard (409 if any blog still references it, same
  pattern as Categories vs Products). Exposed to the public site as
  `GET /blogs/categories` (a flat list, not a paginated resource — there
  won't be many).
- **Blog** — `Blog.category` is stored as the referencing `BlogCategory`'s
  `_id.toString()` (the schema declares it `type: String, ref: ...`, not
  `ObjectId` — Mongoose still populates fine since it casts the string back
  to ObjectId on the query side).
  - Public (`GET /blogs`, `@Public()`): auto-publish logic — a `scheduled`
    post whose `publishAt` has already passed reads as published, no cron
    needed. Implemented as `status: published OR (status: scheduled AND
    publishAt <= now)`.
  - `GET /blogs/latest?limit=` — homepage widget, published-only, newest
    first.
  - `GET /blogs/:slug` — increments `viewCount` fire-and-forget (`.catch(()
    => undefined)`), same don't-fail-the-request philosophy Phase 6 used for
    the enquiry mail send. A slow view-count write must never break the page.
  - Admin (`/admin/blogs`): draft/publish/schedule is just `status` +
    `publishAt` on the normal update DTO — no separate status-toggle
    endpoint, since blog publishing needs a date, unlike Categories' simple
    active/inactive flip.

## 2. Projects (`modules/projects`)

Straight copy of the Categories/Products pattern: public listing (active
only, category-slug filter, `displayOrder` sort), public detail by slug,
admin CRUD, `reorder`, `setStatus`. `Category` registered directly via
`forFeature` in `ProjectsModule` (not by importing `CategoriesModule`) —
same circular-import avoidance Products already uses.

## 3. Gallery (`modules/gallery`)

No detail endpoint — public `GET /gallery` is a grid (type + tag filters,
`displayOrder` sort). Added `POST /admin/gallery/bulk` alongside the normal
single-item `POST` — pairs with `POST /admin/media/upload-multiple` from
Phase 5, which already returns an array the CMS will want to turn into
gallery items in one action rather than N sequential calls.

## 4. Testimonials (`modules/testimonials`)

Public `GET /testimonials` with a `featuredOnly` flag for a homepage
carousel. Standard admin CRUD + `reorder` + `setStatus`.

## 5. FAQs (`modules/faqs`)

Public `GET /faqs` with an optional `group` filter, since FAQs are grouped
per-page (e.g. a product-page FAQ set vs a general one) rather than being
one flat list. Standard admin CRUD + `reorder` + `setStatus`.

## 6. Banners (`modules/banners`)

Public `GET /banners` **requires** a `placement` query param — throws
`BadRequestException` if missing or invalid, listing the valid enum values
in the message. Deliberately not returning all placements unfiltered: the
frontend always renders one placement (hero, category, etc.) at a time, so
an unscoped response would just be dead weight the client immediately
filters down. `reorder` is placement-agnostic in the service (it just
applies whatever ids+displayOrder the caller sends) — the "scoped per
placement" behavior is the CMS's job: it only sends the ids belonging to
the placement currently being reordered.

## 7. Website Settings (`modules/settings`) — singleton, not a normal CRUD

No create/delete/pagination. `SettingsService.get()` and `.update()` both go
through `findOneAndUpdate({ key: SETTINGS_SINGLETON_KEY }, ..., { upsert:
true, new: true })`, so the one document is lazily created on first access
— no seeder entry required. `GET /settings` is public (header/footer/logo/
contact/social data needed on every public page load, nothing sensitive in
it). `GET|PATCH /admin/settings` restricted to admin/super_admin only (no
editor access — unlike content modules, this is closer to a structural
change than routine content work).

## 8. SEO module — removed

`modules/seo` was a fully empty `@Module({})` with no schema. Every content
schema (Category, Product, Blog, Project) already embeds its own
`SeoMetaSchema`, so a standalone SEO collection would be duplicate,
speculative scope. Deleted the module directory and its import in
`app.module.ts` rather than build something nothing currently needs. If a
sitemap-generation endpoint turns out to be wanted later, that's a single
new controller pulling slugs from the four content models — cheap to add
when there's an actual frontend build step asking for it.

## 9. Health / Dashboard (`modules/health`)

- `GET /health` unchanged from Phase 1-3 — stays public and fast for uptime
  monitors.
- `GET /admin/dashboard/stats` — all eight content-area counts fetched in
  parallel via `Promise.all`, not sequential awaits. Products and Blogs get
  a `$group`-by-status breakdown (mirrors the exact aggregation shape
  `EnquiriesService.getStats()` already used in Phase 6); everything else
  (Categories, Projects, Gallery, Testimonials, FAQs) is a flat
  `countDocuments()` since they don't have a multi-state status a dashboard
  widget needs broken down. **Enquiry stats are not recomputed here** —
  `DashboardService` injects `EnquiriesService` and calls its existing
  `getStats()`, since that aggregation already exists and duplicating it
  would just be two places to keep in sync.
- Models for the other six collections are registered directly via
  `forFeature` in `HealthModule` rather than importing each feature module,
  keeping this a read-only aggregation point with no write-side module
  dependencies — same "register directly" reasoning Products/Projects/
  Enquiries already use for `Category`.

## Shared addition

`common/dto/reorder-items.dto.ts` — pulled the `{ id, displayOrder }[]`
shape out of Categories' `reorder-categories.dto.ts` into a common,
generically-named DTO (`ReorderItemsDto`), since six new modules in this
phase needed the identical shape. Categories' own DTO was left untouched
rather than refactored to reuse it — it works, and touching Phase 4 code
wasn't in scope for this phase.

## Verified

- `npx tsc --noEmit` — clean
- `npm run build` — clean
- `npx eslint` on all new/changed files — clean. (A handful of pre-existing
  prettier/`require-await` issues remain in the schema files that shipped
  with the repo before this phase — `blog.schema.ts`, `project.schema.ts`,
  `gallery-item.schema.ts`, `testimonial.schema.ts`, `banner.schema.ts`,
  `website-settings.schema.ts` — untouched here, same as the ones Phase 5/6
  flagged and left alone.)
- **Not verified in-sandbox:** live DB boot (`npm run start:dev`) or an
  actual bulk-gallery-insert against real Mongo — no `mongod` in this
  environment. `Model.bulkSave()` (used in `GalleryService.createMany`) is
  a real Mongoose 9 API, checked against the installed `mongoose` types via
  `tsc`, but not exercised against a live database. Recommend running the
  full CRUD surface for at least Blogs (most complex — auto-publish
  filter) and Settings (singleton upsert) against a real `MONGODB_URI`
  before relying on them.

## Next (Phase 8 candidate)

All backend content modules are now done — Categories, Products, Enquiries,
Blogs, Projects, Gallery, Testimonials, FAQs, Banners, Settings, plus Auth/
Users/Media/Health. This is the natural point to start frontend integration:
scaffold the `frontend/` (public site) and `cms/` (admin) Vite apps per the
master prompt's architecture, wire up TanStack Query against this API, and
build the CMS's Website Builder / dashboard screens against
`GET /admin/dashboard/stats`. Recommend starting with the CMS auth flow +
dashboard shell first (it exercises Auth + the new stats endpoint together),
then Categories/Products CRUD screens, since those are the two modules
everything else references.
