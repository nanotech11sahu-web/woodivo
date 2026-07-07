# Phase 36 — Centralized SEO Management

Directly requested: remove the per-page SEO fields from every content
type's CMS form, replace them with one centralized SEO section in the
CMS covering every page on the site, and make sure any product/blog
created or updated automatically gets — and keeps — an entry there for
its current URL. Frontend updated to match.

## What was removed

Every entity that had an embedded `seo: SeoMeta` sub-document —
**Product, Blog, Category, Project, AboutPage, WebsiteSettings** — no
longer has one:

- `backend/src/modules/*/schemas/*.schema.ts` — `seo` prop and the
  `SeoMeta`/`SeoMetaSchema` import removed from all six.
- `backend/src/modules/*/dto/{create,update}-*.dto.ts` — `seo` field and
  `SeoMetaDto` import removed from all corresponding DTOs.
- `cms/src/features/{products,blogs,categories,projects,settings,about}/*-form-*.{ts,tsx}`
  — the "SEO" `<Card>` (meta title/description/keywords/OG
  image/canonical URL inputs), its zod fields, its `reset()` values and
  its payload block all removed from all six forms.
- `cms/src/types/*.ts` and `frontend/src/types/*.ts` — `seo?: SeoMeta`
  field and now-unused `SeoMeta` import removed from all six entity
  type files in both apps. `common.ts`'s `SeoMeta` interface itself is
  untouched — the new centralized model still uses that exact shape.

`common/schemas/seo-meta.schema.ts` (backend) is no longer imported by
anything and is left in place rather than deleted — it's inert, and
deleting a shared schema file felt like more churn than this phase's
scope called for.

## What replaced it

**`backend/src/modules/seo-entries/`** — a new module, one row per URL
on the site:

- **`schemas/seo-entry.schema.ts`** — `SeoEntry`: `path` (unique,
  indexed — the lookup key), `pageType` (enum: `home`, `about`,
  `contact`, `gallery`, `projects-listing`, `blogs-listing`, `product`,
  `blog`, `category`, `project`, `custom`), `entityId` + `entityLabel`
  (which Product/Blog/Category/Project this mirrors, and its display
  name — both absent for static/custom pages), plus the same five meta
  fields `SeoMetaDto` already defined (`metaTitle`, `metaDescription`,
  `metaKeywords`, `ogImage`, `canonicalUrl`).
- **`seo-entries.service.ts`**:
  - `findByPath(path)` — public lookup, returns `null` (not a 404) when
    nothing's been entered yet.
  - `findAllAdmin` / `findByIdAdmin` / `update` / `createCustom` /
    `remove` — CMS CRUD. `update` only ever touches the five meta
    fields; `remove` refuses anything that isn't `pageType: 'custom'`
    (an entity-backed row's lifecycle is driven by that entity, not a
    delete button).
  - **`syncForEntity({ pageType, entityId, entityLabel, path })`** — the
    piece that answers "any product or blog created or updated should
    have that in the SEO CMS with that URL." Looks up by
    `(entityId, pageType)` (identity, not path, since path is exactly
    what a rename changes); if found, updates `path`/`entityLabel` only
    if they drifted; if not found, creates a new row. Never touches
    `metaTitle`/`metaDescription`/etc. on an existing row — an editor's
    typed-in SEO copy survives the product being renamed.
  - `removeForEntity(pageType, entityId)` — deletes the row when the
    entity is deleted, so the CMS list never accumulates orphans.
  - `ensureStaticPages()` — idempotent upsert of the six fixed-path rows
    (`/`, `/about`, `/contact`, `/gallery`, `/projects`, `/blogs`) so
    there's always something to edit for them, even before anyone's
    touched Settings/About. Wired into `SeederService.onApplicationBootstrap`
    (runs every boot, same idempotent-on-every-boot pattern as
    `seedSuperAdmin`).
- **`seo-entries.controller.ts`** (`@Public()`, `GET /seo/resolve?path=`)
  — what the frontend calls.
- **`seo-entries.admin.controller.ts`** (`GET/POST /admin/seo`,
  `GET/PATCH/DELETE /admin/seo/:id`) — what the CMS calls.

**Wired into `ProductsService`, `BlogsService`, `CategoriesService`,
`ProjectsService`** — each now takes `SeoEntriesService` in its
constructor and calls `syncForEntity` at the end of `create()` and
`update()`, `removeForEntity` in `remove()`. `AboutService` and
`SettingsService` weren't touched — both are fixed-path singletons
already covered by `ensureStaticPages()`.

**`backend/src/database/seeders/migrate-seo.seed.ts`** (`npm run
migrate:seo`) — one-off script to carry over anything already typed
into the old per-entity `seo` fields before this phase, since a plain
schema field removal doesn't delete the underlying data, just Mongoose's
view of it. Reads through the native driver's `.collection.find()`
(bypasses Mongoose's strict-mode field filtering, which would otherwise
silently hide the now-unlisted `seo` field) and creates/updates the
matching `SeoEntry` rows without overwriting one that's already been
edited since. **Run this once after deploying, before relying on the
SEO CMS section** — not wired into every-boot startup, same reasoning
as `demo-data.seed.ts`: a real one-time migration, not a no-op on repeat
runs.

## CMS

**`cms/src/features/seo/`** — new section, linked from the sidebar
(Operations → SEO):

- **`seo-list-page.tsx`** — one row per page: label + path, page type
  badge, meta title preview ("Not set" in italics when empty), last
  updated, edit link. Search box and page-type filter.
- **`seo-form-page.tsx`** — same component handles both `/seo/:id/edit`
  (existing row — path/type shown read-only with a note that it stays
  in sync automatically) and `/seo/new` (a custom row for a page with no
  backing content, e.g. a bespoke landing page — path is a free-typed,
  validated input here).
- **`cms/src/components/shared/seo-manage-note.tsx`** — the small card
  that now sits where the old SEO `<Card>` used to, on all six content
  forms: a one-paragraph explanation plus a link to `/seo?search=<slug>`
  (or `/seo?search=Home` / `?search=About` for the two singletons) so
  clicking through from, say, editing a product lands directly on that
  product's SEO row instead of a blank list.

## Frontend

**`frontend/src/lib/seo-api.ts`** (new) — `useSeoOverride(path)`, a
`GET /seo/resolve?path=` React Query hook, 5-minute `staleTime`.

**`frontend/src/lib/use-seo-meta.ts`** — `useSeoMeta` now calls
`useSeoOverride` itself (keyed on `canonicalPath ?? location.pathname`)
and prefers the override's `metaTitle`/`metaDescription`/`ogImage`/
`canonicalUrl` over whatever the page passed in as a fallback. Every
call site that used to read `entity.seo?.field || fallback` now just
passes the fallback — `product-details-page.tsx`, `project-details-page.tsx`,
`category-listing-page.tsx`, `blog-details-page.tsx`, `home-page.tsx`,
`about-page.tsx`. The six static-path pages (`contact-page.tsx`,
`gallery-page.tsx`, `project-listing-page.tsx`, `blog-listing-page.tsx`,
plus Home and About above) already passed a fixed `canonicalPath`
(`/contact`, `/gallery`, etc.) that matches the seeded static `SeoEntry`
rows exactly — no changes needed there beyond what Home/About already
got, they pick up CMS overrides automatically.

## Design decisions worth calling out

**Identity-keyed sync, not path-keyed.** `syncForEntity` looks up the
existing row by `(entityId, pageType)`, never by `path`. A path-keyed
lookup would break the moment someone renamed a product — the row for
the *old* slug wouldn't match the *new* slug, so it'd create a duplicate
instead of updating in place, orphaning the original with whatever SEO
copy had been entered. Identity-keyed lookup finds the same row
regardless of how many times the slug has changed.

**Read via the native driver in the migration script, not
`Model.find()`.** Mongoose's default strict mode means a typed model
built against the *current* schema (with `seo` removed) simply won't
return that field even though it's sitting in MongoDB — not an error,
just silently absent. `.collection.find()` bypasses that. This is the
one place in the codebase that reaches past Mongoose on purpose, and
it's commented as such in the script.

**`findByPath` returns `null`, not a 404.** Every page's fallback chain
(product name, truncated description, etc.) already exists for the
common case where nobody's opened the SEO section for that path yet —
that's normal, expected state for most of the site most of the time,
not an error condition the frontend needs to catch.

## What wasn't verified

Same constraint as every prior phase in this sandbox: **no live MongoDB
reachable**, so none of this — the sync-on-create/update logic, the
static-page seeding, the migration script, the CMS search-to-edit
round-trip — was run end-to-end against a real database.

What *was* verified concretely: a clean `tsc -p tsconfig.build.json
--noEmit` and `eslint` pass on the backend; a clean `tsc --noEmit -p
tsconfig.app.json`, `eslint`, and `vite build` pass on both the CMS and
the frontend; every removed/added field name checked directly against
the real schema/DTO files it touches, not from memory of earlier
phases. **Run `npm run migrate:seo` once against a real database and
check the CMS's SEO list before trusting that any pre-existing SEO copy
carried over correctly** — same category of caveat Phase 35's demo
seeder flagged, for the same reason.

## What this phase didn't touch

Testimonials, FAQs, Gallery, Banners, Enquiries, Users, Media Library —
none of these ever had a `seo` field, nothing about them changed. The
existing `SeoModule` (sitemap.xml/robots.txt generation) is untouched
and unrelated to this new `SeoEntriesModule` — different concern,
kept as two separate modules rather than merged into one.
