# Phase 11 — CMS: Projects

Picks up the "Phase 11 candidate" flagged at the end of `PHASE10_NOTES.md`:
Projects, since it shares the most surface with Blogs (images, SEO, status)
while also reusing the reorder pattern from Categories. Backend was already
complete (Phase 1: `admin/projects`, `Project` schema).

## What's built

### `types/project.ts`
Hand-copied from the backend's `Project` schema/DTOs, same "no shared
package yet" situation as every module so far. `ProjectCategoryRef` is a
local, minimal `{_id, name, slug}` type — same call as `BlogCategoryRef` in
Phase 10 — rather than importing `CategoryRef` from `types/product.ts`.
Unlike blogs, though, a project's `category` *is* a plain product Category
(the backend registers the same `Category` schema directly in
`ProjectsModule`, no separate collection), so the category **picker** reuses
`useCategoryOptions()` from `features/categories/categories-api.ts` as-is —
only the ref type on the `Project` interface itself is locally declared.

### `features/projects/`
- `projects-api.ts` — same TanStack Query shape as `categories-api.ts`:
  list/detail/create/update/delete plus `reorder`, since the backend exposes
  `PATCH /admin/projects/reorder` (`displayOrder` on the schema, indexed,
  same as categories/products).
- `project-form-schema.ts` — title/slug/SEO/status/displayOrder, same shape
  as `product-form-schema.ts`, plus three plain string fields
  (`clientName`, `location`, `completionYear`) and an **optional** `category`
  — the backend's `CreateProjectDto.category` has no `@IsNotEmpty()`, unlike
  products where category is required, so the form doesn't validate it as
  required either. The list/form pickers show "No category" as a real,
  selectable option rather than defaulting to the first one.
- `project-list-page.tsx` — search, category filter, status filter, cover
  thumbnail, featured star, ↑/↓ reorder (category-list-page pattern) *and* a
  category filter (product-list-page pattern) in the same table for the
  first time. That combination needed one new guard: reorder swaps
  `displayOrder` between the two rows adjacent in the *currently rendered*
  list, which is only correct when that list matches the full
  `displayOrder`-sorted sequence. Categories never hit this because they have
  no secondary filter; here, `canReorder = !search && !status && !category`
  disables the up/down buttons whenever a filter is active, rather than
  silently producing a reorder that looks fine in the filtered view but
  scrambles the real sequence.
- `project-form-page.tsx` — title/category/slug/description, three plain
  detail fields, `ImageUploader` for `coverImage` (single, category-form-page
  pattern) *and* `MultiImageUploader` for `images` (product-form-page
  pattern) in the same form — first module needing both. No specifications
  or related-items picker; projects don't have that kind of structured data
  on the backend.

### `routes.tsx`
`/projects`, `/projects/new`, `/projects/:id/edit` now point at real pages.
`ComingSoon` still covers Gallery, Testimonials, FAQs, Banners, Enquiries,
Users, Settings. Sidebar nav already pointed at `/projects` (Phase 8's
`nav-items.ts`), so no nav changes needed this phase.

## Verified

- `npx tsc -b` — clean
- `npx eslint .` — clean except the same two pre-existing
  `react-refresh/only-export-components` warnings (`auth-context.tsx`,
  `button.tsx`) — nothing new from this phase
- `npm run build` — clean, ships a working bundle (698KB / 210KB gzip, vs
  Phase 10's 685KB / 209KB — one more full CRUD module, expected growth,
  same "revisit with route-based code-splitting later" situation flagged
  since Phase 8)
- **Not run:** `npm run dev` against a live backend — same sandbox
  constraint as every phase so far (no `mongod`, no browser here). The
  reorder-disabled-while-filtered guard in particular is only verified by
  reading the code, not by clicking through it against real data.

## Next (Phase 12 candidate)

Gallery, Testimonials, FAQs, Banners are all still `ComingSoon`.

- **Testimonials** and **FAQs** are the natural next pick — no images (well,
  Testimonials has an optional avatar), short forms, no reorder edge case
  like the one just solved for Projects. Should go quickly.
- **Gallery** is image-heavy but structurally simpler than Projects (likely
  just images + captions + category, no client/location/year fields) —
  worth checking the backend schema before assuming it mirrors Projects.
- **Banners** is still the odd one out — positioning/homepage-slot driven
  rather than content-driven, worth scoping separately as flagged in Phase
  10.

Still true from Phase 8/9/10: `backend/` and `cms/` hand-copy types with
nothing enforcing they stay in sync — now five modules deep
(`DashboardStats`, `Category`/`Product`, `Blog`/`BlogCategory`, and now
`Project`).

Smaller, scoped-out-on-purpose items:
- The `canReorder` filter guard on the Projects list is a UI-level lock, not
  a backend one — the `PATCH /admin/projects/reorder` endpoint itself has no
  concept of "filtered view" and will happily accept any two IDs. Worth
  keeping in mind if a future module reuses this pattern: the guard belongs
  wherever filters and reorder coexist, not in the API layer.
- No bulk actions (bulk delete/status-change) on the project list page,
  consistent with every other list page so far.
- Project search relies on the backend's `$text` index over
  `title`/`description` only — doesn't reach `clientName` or `location`.
