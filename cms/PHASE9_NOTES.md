# Phase 9 — CMS: Categories & Products CRUD

Scopes to exactly what `PHASE8_NOTES.md` recommended: full CRUD screens for
Categories and Products, plus the shared `DataTable`/`Pagination` building
blocks every later content module (Blogs, Projects, Gallery, Testimonials,
FAQs, Banners, Enquiries) will reuse.

## Bug fixed along the way

`api-client.ts` never unwrapped the backend's global `TransformInterceptor`
envelope (`{ success, statusCode, message, data, timestamp }`). Phase 8's
`auth-api.ts` and `dashboard-api.ts` were both silently reading the envelope
itself instead of the payload inside `data` — invisible in that phase
because nothing was ever run against a live backend. Fixed once, centrally,
in the response interceptor's success branch, so every module built from
here on (and the two from Phase 8) gets the real payload automatically.

## What's built

### `lib/`
- `http-error.ts` — `getErrorMessage()`, pulls the `message` field out of the
  backend's `AllExceptionsFilter` error body for toasts.
- `toast.ts` — a ~40-line pub/sub toast store (no toast library in
  `package.json`, and pulling one in for three call sites felt like the
  wrong trade). `toast.success()` / `.error()` / `.info()`, 4.5s auto-dismiss.
- `api-client.ts` — added envelope unwrapping (see above).

### `components/ui/` (new primitives, same hand-written shadcn style as Phase 8)
`select.tsx`, `textarea.tsx`, `switch.tsx` (custom toggle, RHF-friendly via
`Controller`), `badge.tsx` (active/inactive/neutral/destructive variants),
`dialog.tsx` (minimal modal, Escape-to-close), `toaster.tsx` (renders the
`lib/toast.ts` store via `useSyncExternalStore`). `button.tsx` now exports
`buttonVariants` so `<Link>`s can be styled as buttons without a Radix
`asChild` primitive this project doesn't have.

### `components/shared/` (reused by both modules, and meant for every module after)
- `data-table.tsx` — generic `DataTable<T>` with typed columns, loading
  skeleton rows, error state, empty state. Every future list screen plugs
  into this instead of hand-rolling a table.
- `pagination.tsx` — reads the backend's `PaginationMeta` shape directly
  (`total/page/limit/totalPages/hasNextPage/hasPrevPage`) — no reimplementing
  page-math on the frontend.
- `confirm-dialog.tsx` — delete confirmation, built on `ui/dialog.tsx`.
- `image-uploader.tsx` / `multi-image-uploader.tsx` — wrap
  `POST /admin/media/upload` and `/admin/media/upload-multiple`
  (multipart, Cloudinary-backed per Phase 1). Removing an image best-effort
  calls `/admin/media/delete` with the stored `publicId` (failure is
  swallowed — the asset is already detached from the record either way).
- `page-header.tsx`, `status-badge.tsx` — small shared layout pieces.

### `types/`
`common.ts` (`PaginationMeta`, `PaginatedResult<T>`, `MediaAsset`, `SeoMeta`,
`MediaFolder`), `category.ts`, `product.ts` — hand-copied from the backend's
Mongoose schemas/DTOs, same "no shared package yet" situation Phase 8 flagged
for `DashboardStats`. Still true, still worth fixing eventually (see Next).

### `features/categories/`
- `categories-api.ts` — full TanStack Query surface: list (paginated,
  filtered by search/status/featured), detail, create, update, delete,
  reorder, plus `useCategoryOptions()` (100-item, unpaginated fetch used by
  the Products form's category picker).
- `category-list-page.tsx` — search, status filter, thumbnail column,
  featured star, inline reorder via ↑/↓ buttons that swap `displayOrder`
  between adjacent rows and call the existing `/admin/categories/reorder`
  bulk endpoint (drag-and-drop would be nicer; scoped out — see Next).
  Delete goes through `ConfirmDialog`, since categories with products
  attached get a `409` from the backend that surfaces as a toast.
- `category-form-page.tsx` — single component handles both `/categories/new`
  and `/categories/:id/edit` (branches on whether `useParams` has an `id`).
  React Hook Form + Zod; slug is optional (backend derives it from `name` if
  left blank — the form doesn't duplicate that logic, just leaves it out of
  the payload). Thumbnail/banner are plain `useState<MediaAsset>` rather
  than RHF fields, since `ImageUploader` already owns its own async
  upload/remove lifecycle. `isFeatured` is the one RHF `Controller` field
  in the form (needed for the custom `Switch`).

### `features/products/`
- `products-api.ts` — same shape as `categories-api.ts` (list/detail/create/
  update/delete). No `reorder` — the backend doesn't expose one for
  products (categories only).
- `product-form-schema.ts` — Zod schema + `ProductFormValues` type shared
  between `product-form-page.tsx` and `specifications-editor.tsx`, split out
  so the field-array component isn't fighting a circular import with the
  page that owns the form.
- `specifications-editor.tsx` — `useFieldArray`-backed repeatable key/value
  rows (`{ key, value }`) matching the backend's `SpecificationItem`.
- `related-products-picker.tsx` — debounce-free live search against
  `useProducts()` (TanStack Query's own dedup/caching makes an explicit
  debounce unnecessary at this scale), renders results as a dropdown,
  selections as removable chips. Excludes the product being edited from its
  own related list (belt-and-suspenders — the backend already rejects that
  with a 400).
- `product-list-page.tsx` — search, status filter, **and** category filter
  (populated from `useCategoryOptions()`), thumbnail, category name column.
- `product-form-page.tsx` — category select, `MultiImageUploader` for the
  `images` array, `SpecificationsEditor`, `RelatedProductsPicker`, same
  SEO/status/featured/displayOrder sections as the category form.

### `routes.tsx`
`/categories`, `/categories/new`, `/categories/:id/edit`, `/products`,
`/products/new`, `/products/:id/edit` now point at real pages.
`ComingSoon` still covers everything else — Blogs, Projects, Gallery,
Testimonials, FAQs, Banners, Enquiries, Users, Settings.

## Verified

- `npx tsc -b` — clean
- `npx eslint .` — clean except the same
  `react-refresh/only-export-components` warning category Phase 8 already
  accepted for `auth-context.tsx` (now also on `button.tsx`, for exporting
  both `Button` and `buttonVariants` — same reasoning, not worth a file
  split to silence)
- `npm run build` — clean, ships a working bundle. Chunk-size warning is
  larger than Phase 8's (666KB vs 612KB, expected — two full CRUD modules
  with RHF/Zod forms) but still the same "not an error, revisit with
  route-based code-splitting later" situation Phase 8 flagged.
- **Not run:** `npm run dev` against a live backend, same constraint as
  every phase so far — no `mongod`, no browser in this sandbox. The
  envelope-unwrapping fix in particular is only verified by reading the
  interceptor code and the backend's `TransformInterceptor` side by side,
  not by actually hitting the API. Worth confirming first, before trusting
  login/dashboard/category/product screens against real data.

## Next (Phase 10 candidate)

The `DataTable`/`Pagination`/`ConfirmDialog`/image-uploader building blocks
are now proven on two modules — the next several (Blogs, Projects, Gallery,
Testimonials, FAQs, Banners) should be materially faster since the shared
shape is already there. Blogs is the natural next pick: it already has a
full backend (Phase 1) including scheduled publishing, and shares the most
form surface (SEO, status, images) with what's built here.

Also still true from Phase 8: `backend/` and `cms/` hand-copy types
(`DashboardStats`, and now `Category`/`Product`/`MediaAsset`/`SeoMeta`) with
nothing enforcing they stay in sync. Three modules deep into this pattern —
worth deciding on a shared `types` package before a fourth and fifth module
make manual drift more likely.

Smaller, scoped-out-on-purpose items:
- Category reorder is ↑/↓ swap-with-neighbor, not drag-and-drop.
- Related-products search has no debounce (fine at current scale; revisit
  if the products collection gets large enough for it to matter).
- No bulk actions (bulk delete/status-change) on either list page yet.
