# Phase 13 — CMS: Gallery & Banners

Picks up the two remaining `ComingSoon` modules flagged at the end of
`PHASE12_NOTES.md`. Read both backend schemas fresh before building, per
that note's suggestion — neither turned out to be a copy of an existing
pattern.

## What's built

### `types/gallery.ts`, `types/banner.ts`
Hand-copied from the backend schemas/DTOs, same pattern as every module so
far. Neither has a `seo` field (same as Testimonials/FAQs).

### `features/gallery/`
Gallery turned out **not** to be a trimmed-down Projects form as guessed in
Phase 12 — the schema is one `media: MediaAsset` per document (`GalleryItem`
is a single photo/video, not a project-style entity holding many images).
So each row in the CMS list is one gallery item, same shape as every other
CRUD module here.

- `gallery-api.ts` — list/detail/create/update/delete/reorder. The backend
  also has `POST /admin/gallery/bulk` (`createMany`) for adding several
  items in one call — **not wired into the UI this phase**. It doesn't fit
  a single form cleanly (bulk items would need to share caption/tags,
  which isn't obviously desirable) and building a proper multi-upload flow
  for it felt like a separate, larger piece of work rather than filling
  out this phase's CRUD pattern. Flagged below as a Phase 14 candidate.
- `gallery-form-schema.ts` — `tags` is a comma-separated text input
  (`parseTags` splits/trims/dedupes on submit) rather than a tag picker,
  same reasoning as FAQ's free-text `group`: no distinct-tags endpoint on
  the backend to populate a picker from.
- `gallery-form-page.tsx` — the one piece with no precedent in this
  codebase: `type` (image/video) changes what the media field looks like.
  For `image`, it's the standard `ImageUploader`. For `video`, there's no
  upload pipeline for video files (`ImageUploader` only accepts image mime
  types, and there's no video endpoint on `/admin/media`), so it's a plain
  URL input instead — assumes a hosted/embed link (YouTube, Vimeo, CDN)
  rather than a file upload. Submission builds `media: { url }` from
  whichever input is active and blocks with a toast if it's empty, since
  `media` is required on the backend but isn't a react-hook-form field.
- `gallery-list-page.tsx` — thumbnail (with a play-icon overlay for video
  rows, since `<img>` can't render a video file), caption + tag chips,
  type, status, reorder. Filters: type (select), tag (exact-match text
  input, same reasoning/wording as FAQ's group filter), status. Reorder
  guarded on all three being empty, consistent with every prior module.

### `features/banners/`
Banners is the "odd one out" flagged since Phase 10 — positioning-driven,
not content-driven — and it does need a different reorder story, though
the list/form shape itself fits the established pattern fine.

- `banners-api.ts` — same shape as every other module, reorder included.
- `banner-form-schema.ts` — `placement` is one of 7 enum values (hero,
  category, product, blog, contact, about, projects) with human labels in
  `PLACEMENT_LABELS`. `ctaLabel`/`ctaLink` are plain optional strings, no
  URL validation — same permissiveness as FAQ's `group` and other
  free-text fields, since the backend DTO doesn't validate them either.
- `banner-form-page.tsx` — two `ImageUploader`s side by side
  (`desktopImage` required, `mobileImage` optional, both folder
  `banners`), title/subtitle, CTA label/link, placement + status selects,
  display order.
- `banner-list-page.tsx` — **reorder logic differs from every prior
  module.** The schema's compound index is `{ placement: 1, displayOrder:
  1 }`, meaning order is scoped *within* a placement (e.g. all "Hero"
  banners form one carousel sequence, independent of "Blog" banners'
  order). Every other module so far has a single flat `displayOrder`
  sequence, so the established guard (`canReorder` = no filters active)
  would be actively wrong here: swapping two banners' `displayOrder` in
  the unfiltered, mixed-placement list doesn't correspond to anything the
  site renders. Instead, `canReorder` requires a **placement filter to be
  selected** (and no status filter) — reordering only happens once you've
  narrowed to one placement's list. A hint line explains this above the
  table when no placement is selected. This is a deliberate deviation from
  the pattern, not an oversight — worth double-checking against the actual
  frontend rendering logic (which wasn't available to inspect here) if
  banners ever look mis-ordered on the live site.

### `routes.tsx`
`/gallery`, `/gallery/new`, `/gallery/:id/edit`, `/banners`,
`/banners/new`, `/banners/:id/edit` now point at real pages. `ComingSoon`
still covers Enquiries, Users & Roles, and Website Settings. Sidebar nav
already pointed at both (Phase 8's `nav-items.ts`), so no nav changes
needed.

## Verified

- `npx tsc -b` — clean
- `npx eslint .` — clean except the same two pre-existing
  `react-refresh/only-export-components` warnings (`auth-context.tsx`,
  `button.tsx`) — nothing new from this phase
- `npm run build` — clean, ships a working bundle (735.6KB / 215.2KB gzip,
  vs Phase 12's 716.6KB / 212.5KB — two more modules, expected growth,
  same "revisit with route-based code-splitting later" situation flagged
  since Phase 8)
- **Not run:** `npm run dev` against a live backend — same sandbox
  constraint as every phase so far. In particular, the video-URL fallback
  for gallery items and the placement-scoped reorder guard for banners are
  only reasoned through from the DTOs/schema, not confirmed against real
  data or the live storefront's rendering logic.

## Next (Phase 14 candidate)

With Gallery and Banners done, every CMS module from the master prompt's
content list is implemented except:

- **Website Settings** — single-document settings form (no list/pagination
  pattern to reuse; closer to a one-off form page).
- **Users & Roles** — user list + role assignment; first module touching
  `UserRole` beyond route guards.
- **Media Library** (standalone browser) — uploads already work everywhere
  via `ImageUploader`/`MultiImageUploader`; this would be a dedicated
  grid/browser view over everything in Cloudinary (or wherever media
  lives), independent of any single content type.
- **Enquiries** — inbound contact-form submissions, read/respond flow
  rather than create/edit.
- **Website Builder / Dashboard refinement** — not a defined feature yet,
  needs scoping.
- **Gallery bulk-add UI** — the backend's `POST /admin/gallery/bulk` is
  still unused; a proper multi-image-upload flow for adding many gallery
  items at once (see note above).

Still true from Phase 8 onward: `backend/` and `cms/` hand-copy types with
nothing enforcing they stay in sync — now nine modules deep.

Smaller, scoped-out-on-purpose items:
- No bulk actions (bulk delete/status-change) on either list page,
  consistent with every module so far.
- Gallery `tag` filter is exact-match only, same limitation as FAQ's
  `group` filter — no partial/regex search on the backend for either.
- Video gallery items store a bare URL with no oEmbed/thumbnail preview;
  the list page shows the fallback square with a play icon rather than an
  actual video frame.
