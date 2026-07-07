# WOODIVO — Phase 7 Prompt (Content Modules + Dashboard)

> Feed this to Claude Code alongside the Enterprise Master Prompt and the
> Phase 6 backend zip. Builds on Phase 6 (Enquiries).

## Context

Six content modules currently have **schema only** — no service, no DTOs, no
controller, nothing registered beyond an empty `@Module({})` shell that's
already imported in `app.module.ts`:

- `modules/blogs` — `blog.schema.ts` (`Blog` + a separate lightweight `BlogCategory`)
- `modules/projects` — `project.schema.ts`
- `modules/gallery` — `gallery-item.schema.ts`
- `modules/testimonials` — `testimonial.schema.ts`
- `modules/faqs` — `faq.schema.ts`
- `modules/banners` — `banner.schema.ts`

Plus one singleton config schema with the same gap:

- `modules/settings` — `website-settings.schema.ts` (single document, keyed
  by `SETTINGS_SINGLETON_KEY = 'global'`, not a normal collection)

And `modules/seo` is a completely empty module (`@Module({})`, no schema even).

`modules/health` currently only returns DB connection status — no aggregate
counts.

## Goal

Bring all six content modules up to the same standard as
Categories/Products/Enquiries: full CRUD, public + admin split where it
applies, reusing the **exact existing patterns** already in the codebase.
Do not introduce new conventions.

## Reuse these exact patterns (do not deviate)

- `common/dto/pagination-query.dto.ts` + `common/interfaces/paginated-result.interface.ts`
  (`{ items, meta }` + `buildPaginationMeta()`) for every admin list endpoint.
- `common/utils/slugify.ts` + the `pre('save')` slug hook already present on
  `Blog`, `BlogCategory`, and `Project` schemas — services must re-slugify on
  update the same way `categories.service.ts` does (slug re-validated on
  change, 409 on collision).
- `@Public()` decorator for public-site controllers, `@Roles()` +
  `RolesGuard` for admin controllers — copy the exact role split used in
  `categories.admin.controller.ts` / `products.admin.controller.ts`:
  editor can read, admin/super_admin can write, `super_admin` only for
  destructive bulk ops if any module needs one.
- `displayOrder` + a `reorder` bulk-update endpoint (see
  `categories.service.ts` `reorder()` / `ReorderCategoriesDto`) for every
  schema that has a `displayOrder` field: Projects, Gallery, Testimonials,
  FAQs, Banners.
- Circular-import avoidance: Projects references `Category` — register
  `Category` via `MongooseModule.forFeature` directly in `ProjectsModule`,
  same as `ProductsModule` already does. Do not import `CategoriesModule`.
- Media fields (`featuredImage`, `coverImage`, `images`, `media`,
  `desktopImage`, `mobileImage`, `clientPhoto`, `logo`, `favicon`) are
  `MediaAsset` objects the CMS already gets from
  `POST /admin/media/upload` — DTOs should accept the same
  `common/dto/media-asset.dto.ts` shape used elsewhere, not raw strings.

## Module-by-module scope

### 1. Blogs (`modules/blogs`)
- `BlogCategory` sub-resource: simple CRUD, admin-only
  (`/admin/blog-categories`), no public listing needed on its own — blog
  category is exposed as a filter on the blogs endpoints instead.
- Public (`GET /blogs`, `@Public()`): `status: published` only, and
  `publishAt <= now` — a `scheduled` post with a past `publishAt` should
  auto-qualify as published on read (don't require a cron; just filter
  `status IN [published, scheduled] AND publishAt <= now OR status = published
  AND publishAt is null`). Paginated, filterable by `category` (slug) and
  `tags`, full-text search via the existing `$text` index.
- Public detail (`GET /blogs/:slug`): increment `viewCount` on read
  (fire-and-forget, don't block the response on it — same
  don't-fail-the-request philosophy as the Phase 6 mail send).
- Admin (`/admin/blogs`): full CRUD, filter by `status`/`category`/`isFeatured`,
  draft/publish/schedule via `status` + `publishAt` on the same update DTO
  (no separate endpoints needed — matches how Categories does `setStatus` as
  a dedicated endpoint only where the CMS needs a single-click toggle,
  which a blog's multi-state status doesn't).
- Homepage latest-blogs needs a `GET /blogs/latest?limit=` public endpoint
  (published only, sorted `publishAt desc`) — the master prompt says
  homepage shows latest blogs automatically.

### 2. Projects (`modules/projects`)
- Public (`GET /projects`, `@Public()`): active only, filterable by
  `category` slug, `featured`, sorted by `displayOrder`.
- Public detail (`GET /projects/:slug`): populate `category`.
- Admin (`/admin/projects`): full CRUD, same category-existence validation
  on create/update that `products.service.ts` does, plus `reorder` and
  `setStatus` endpoints matching Categories.

### 3. Gallery (`modules/gallery`)
- Public (`GET /gallery`, `@Public()`): active only, filterable by `type`
  and `tags`, sorted by `displayOrder`. No detail endpoint needed — it's a
  grid, not individual pages.
- Admin (`/admin/gallery`): full CRUD, `reorder`, `setStatus`. Create/update
  should accept multiple items in one call optionally (bulk-add after a
  multi-upload from `/admin/media/upload-multiple`) — check whether a
  bulk-create endpoint is worth it or whether looping client-side is fine;
  default to single-item CRUD + a `createMany` convenience endpoint since
  Media's `upload-multiple` already returns an array the CMS will want to
  turn into gallery items in one action.

### 4. Testimonials (`modules/testimonials`)
- Public (`GET /testimonials`, `@Public()`): active only, `featuredOnly`
  query flag, sorted by `displayOrder`.
- Admin (`/admin/testimonials`): full CRUD, `reorder`, `setStatus`.

### 5. FAQs (`modules/faqs`)
- Public (`GET /faqs`, `@Public()`): active only, optional `group` filter
  (FAQs can be grouped per-page, e.g. product-page FAQs vs general FAQs),
  sorted by `displayOrder`.
- Admin (`/admin/faqs`): full CRUD, `reorder`, `setStatus`.

### 6. Banners (`modules/banners`)
- Public (`GET /banners`, `@Public()`): **required** `placement` query
  param (`hero`/`category`/`product`/`blog`/`contact`/`about`/`projects`) —
  active only, sorted by `displayOrder`. Don't return all placements
  unfiltered; the frontend always wants one placement at a time.
- Admin (`/admin/banners`): full CRUD, `reorder` (scoped per-placement, not
  global — reordering hero banners shouldn't touch category banner order),
  `setStatus`.

### 7. Website Settings (`modules/settings`) — singleton, different shape
- No `create`, no `delete`, no pagination. One document only.
- `GET /settings` (`@Public()`) — public site needs this for header/footer/
  logo/contact/social links on every page load. Return the full document
  (nothing here is sensitive).
- `GET /admin/settings` + `PATCH /admin/settings` (admin/super_admin only) —
  service does a `findOneAndUpdate({ key: SETTINGS_SINGLETON_KEY }, dto,
  { upsert: true, new: true })` so the singleton is lazily created on first
  save rather than needing a seeder entry. (Check if the seeder already
  creates one — if not, that upsert is the only bootstrap needed.)

### 8. SEO module (`modules/seo`)
Currently fully empty — decide scope before building. The master prompt
lists "SEO" as its own CMS module, but every content schema
(`Category`, `Product`, `Blog`, `Project`) already embeds its own
`SeoMetaSchema`. Two reasonable options:
- **(a)** Skip a standalone SEO module entirely — SEO is already
  per-entity via the embedded `seo` field on each schema, no separate
  collection needed. Remove the empty module and its `app.module.ts`
  import, or
- **(b)** Keep it minimal: a single `GET /seo/sitemap-data` endpoint
  (`@Public()`) that returns slugs + `updatedAt` across
  Categories/Products/Blogs/Projects in one call, for the frontend/build
  step to generate `sitemap.xml` from.

Recommend **(a)** for this phase — don't build speculative scope. Flag it
back to me if you disagree.

### 9. Health / Dashboard (`modules/health`)
- Keep the existing `GET /health` as-is (uptime/DB status — used by
  uptime monitors, must stay fast and public).
- Add `GET /admin/dashboard/stats` (any CMS role) — aggregate counts in
  parallel (`Promise.all`, not sequential awaits): total categories,
  products (by status), enquiries (reuse the existing
  `EnquiriesService` stats logic from Phase 6 rather than duplicating the
  aggregation), blogs (by status), projects, gallery items, testimonials,
  FAQs. This is the CMS dashboard landing-page widget data.

## Explicitly out of scope for this phase

- Frontend/CMS UI — backend only, same as every phase so far.
- Comments/replies on blogs — not in the master prompt.
- Video hosting for Gallery `video` type — just store the `MediaAsset` URL,
  no transcoding.
- Any change to Auth, Users, Categories, Products, Enquiries, or Media —
  those are done; don't touch them unless you find an actual bug while
  wiring the new modules in.

## Before you start

- `app.module.ts` already imports all seven of these modules — the
  `@Module({})` shells exist and are wired. You're filling them in, not
  creating new module registrations (except SEO, if removed per option (a)
  above — then also remove the import).
- Follow the same "Verified" checklist Phases 4–6 used: `npx tsc --noEmit`,
  `npm run build`, `npx eslint` on new/changed files only. Flag anything not
  verifiable in-sandbox (live DB boot, actual file uploads) rather than
  claiming it works.
- Write `PHASE7_NOTES.md` in the same format as the existing phase notes
  (what was built, what's deliberately deferred, a "Next" section for
  Phase 8 — which should be the point where frontend integration starts,
  since all content modules will be done).

Build module-by-module within this phase too — don't generate all seven in
one giant response if the context gets unwieldy; Blogs and Settings have
the most nuance (auto-publish-by-date, singleton-upsert), do those first.
