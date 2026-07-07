# Phase 4 — Categories Module (CMS + Public API)

Builds on Phase 3 (Auth). Categories are the backbone of the catalog — Products
reference them, and the public site's header/footer/nav/homepage/filters all
consume them — so this is the natural next module per the master prompt's
"module-by-module" workflow.

## What's included

**Shared, reusable across future modules:**
- `common/dto/pagination-query.dto.ts` — page/limit/search/sortBy/sortOrder
- `common/interfaces/paginated-result.interface.ts` — `{ items, meta }` shape + `buildPaginationMeta()`
- `common/dto/seo-meta.dto.ts`, `common/dto/media-asset.dto.ts` — validated nested DTOs matching the existing `SeoMeta`/`MediaAsset` sub-schemas

**Categories module:**
- `categories.service.ts` — create, admin list (paginated + filtered by status/isFeatured/search), public list (active only, sorted by displayOrder, optional `featuredOnly`), get by id (admin) / by slug (public, active only), update (slug re-validated on change), delete (blocked with 409 if any Product still references the category), bulk `reorder` (drag-and-drop in CMS), `setStatus` (quick publish/unpublish toggle)
- `categories.controller.ts` — public, `@Public()`: `GET /categories`, `GET /categories/:slug`
- `categories.admin.controller.ts` — protected: `GET/POST /admin/categories`, `GET/PATCH/DELETE /admin/categories/:id`, `PATCH /admin/categories/:id/status`, `PATCH /admin/categories/reorder`
  - Reads (`GET`) allowed for editor/admin/super_admin
  - Writes (create/update/delete/reorder/status) require admin or super_admin (role hierarchy already enforced by the existing `RolesGuard`)
- Slug auto-generated from `name` via the existing `slugify()` util if not supplied, uniqueness enforced (409 on collision) on both create and update

**Note on mongoose version:** the installed mongoose is v9, which renamed
`FilterQuery` → `QueryFilter`. Keep this in mind for the Products/Blogs/etc.
modules that come next — same pagination/filter pattern applies.

## Verified

- `npx tsc --noEmit` — clean
- `npm run build` — clean
- `npx eslint` on all new files — clean

## Next (Phase 5 candidate)

Products module — same CRUD + pagination pattern, plus category population,
featured flag, related products, and (new) an actual file-upload endpoint on
the Media module since products/categories need to send real Cloudinary URLs
from the CMS before they can be saved.
