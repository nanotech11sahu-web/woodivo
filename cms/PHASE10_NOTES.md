# Phase 10 — CMS: Blogs & Blog Categories

Picks up the "Phase 10 candidate" flagged at the end of `PHASE9_NOTES.md`:
Blogs was the natural next module — full backend already existed (Phase 1,
`admin/blogs` + `admin/blog-categories`), and it reuses every shared
building block Phase 9 proved out (`DataTable`, `Pagination`, `ConfirmDialog`,
`ImageUploader`).

## What's built

### `types/blog.ts`
Hand-copied from the backend's `Blog` / `BlogCategory` schemas and DTOs,
same "no shared package yet" situation flagged in Phase 8 and Phase 9.
`BlogStatus` is its own union (`draft | published | scheduled | archived`)
— distinct from the `active | inactive` `EntityStatus` categories/products
use, since blog posts have a publishing workflow instead of a simple
on/off toggle.

### `features/blogs/`
- `blogs-api.ts` — same TanStack Query shape as `categories-api.ts`/
  `products-api.ts`: list (paginated, filtered by search/status/category/
  featured), detail, create, update, delete. No `reorder` — blog posts sort
  by `createdAt`, not `displayOrder`.
- `blog-categories-api.ts` — separate from `blogs-api.ts` because the
  backend treats `BlogCategory` as its own lightweight collection (`name`,
  `slug`, `displayOrder` only — no thumbnail/banner/SEO/status). `findAll`
  isn't paginated on the backend, so `useBlogCategories()` returns a plain
  array, unlike `useCategories()`. Reorder mirrors the product-category
  reorder endpoint.
- `blog-status-badge.tsx` — maps the 4-value `BlogStatus` onto the 4
  existing `Badge` variants (`draft`→inactive, `published`→active,
  `scheduled`→neutral, `archived`→destructive) rather than adding new
  badge variants for a single consumer.
- `tags-editor.tsx` — free-text chip input (Enter/comma to add, Backspace
  to pop the last chip on an empty field). Deliberately simpler than
  `RelatedProductsPicker`: tags aren't a reference to another collection,
  so there's no API search to debounce against.
- `blog-form-schema.ts` — Zod schema + `BlogFormValues`, same field set as
  `product-form-schema.ts` (title/slug/SEO/status) plus a `.refine()` that
  requires `publishAt` only when `status === 'scheduled'`, matching the
  backend's own scheduled-publish semantics (`findAllPublic` treats a
  scheduled post as published once `publishAt` has passed).
- `blog-list-page.tsx` — search, status filter, category filter (populated
  from `useBlogCategories()`), featured star, publish date column. Includes
  a "Categories" button in the header next to "New Post" that routes to
  `/blogs/categories`, since blog categories don't get their own sidebar
  entry (the master prompt's CMS module list only has "Blogs").
- `blog-form-page.tsx` — title/slug/excerpt/content/featured
  image/author, category select, `TagsEditor`, status select with a
  `publishAt` datetime-local field that only renders when status is
  Scheduled, same SEO section as every other form. `content` is a plain
  `Textarea` (16 rows) rather than a rich text editor — no such library is
  in `package.json`, and Phase 9's toast-store precedent ("pulling one in
  for three call sites felt like the wrong trade") applies even more here
  since a rich text editor is a much bigger dependency for one field. Two
  small helpers, `toIsoString`/`toDatetimeLocal`, convert between the
  input's local-time string and the full ISO string the backend's
  `@IsDateString()` expects.
- `blog-category-manager.tsx` — list + ↑/↓ reorder (same swap-with-neighbor
  pattern as category reorder) at `/blogs/categories`, with add/edit
  through a `Dialog`-based mini-form instead of a full page — the entity is
  only `name`/`slug`/`displayOrder`, so a dedicated route felt like more
  scaffolding than the data justifies. Delete goes through `ConfirmDialog`,
  since categories with posts attached get a `409` from the backend that
  surfaces as a toast (matching the existing product-category behavior).

### `routes.tsx`
`/blogs`, `/blogs/new`, `/blogs/categories`, `/blogs/:id/edit` now point at
real pages. `ComingSoon` still covers Projects, Gallery, Testimonials,
FAQs, Banners, Enquiries, Users, Settings.

## Verified

- `npx tsc -b` — clean
- `npx eslint .` — clean except the same two
  `react-refresh/only-export-components` warnings Phase 8/9 already
  accepted (`auth-context.tsx`, `button.tsx`) — nothing new from this phase
- `npm run build` — clean, ships a working bundle (685KB / 209KB gzip,
  vs Phase 9's 666KB — one more full CRUD module plus a datetime helper,
  expected growth, same "revisit with route-based code-splitting later"
  situation flagged since Phase 8)
- **Not run:** `npm run dev` against a live backend — same sandbox
  constraint as every phase so far (no `mongod`, no browser here). The
  `publishAt` ISO conversion in particular is only verified by reading
  `@IsDateString()`'s expectations against `toISOString()`'s output, not by
  actually submitting a scheduled post.

## Next (Phase 11 candidate)

Projects, Gallery, Testimonials, FAQs, Banners are all still `ComingSoon`.
Projects and Gallery likely share the most surface with what's built here
(images, SEO, status) — Testimonials and FAQs are simpler (no images,
shorter forms) and could go quickly once one of the media-heavy modules is
done. Banners is the odd one out — it's positioning/homepage-slot driven
rather than content-driven, worth scoping separately.

Still true from Phase 8/9: `backend/` and `cms/` hand-copy types with
nothing enforcing they stay in sync — now four modules deep
(`DashboardStats`, `Category`/`Product`, and now `Blog`/`BlogCategory`).

Smaller, scoped-out-on-purpose items:
- Blog content is a plain textarea, not a rich text editor — fine for now,
  but if editors start wanting bold/links/images inline in post bodies,
  worth revisiting (would need to pick and add a dependency).
- Blog category reorder is ↑/↓ swap-with-neighbor, not drag-and-drop (same
  as product categories).
- No bulk actions (bulk delete/status-change) on the blog list page.
- Blog search relies on the backend's `$text` index over
  `title`/`excerpt`/`tags` — works for the fields it covers, doesn't reach
  into `content`.
