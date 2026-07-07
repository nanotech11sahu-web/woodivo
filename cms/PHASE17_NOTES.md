# Phase 17 — Media Library

The last item from Phase 13's original three that had any obvious path
forward. Website Builder / Dashboard refinement is still unscoped exactly
as Phases 15 and 16 left it — untouched this phase too.

## Why this module breaks the established shape

Every module through Phase 16 — even Users & Roles, which had no edit
page — was still backed by a MongoDB collection: a schema, a service
querying that schema, `PaginatedResult<T>` with `page`/`limit`/`totalPages`.
Media Library has none of that, because **there is no MediaAsset
collection.** Every upload (`MediaService.uploadImage`) goes straight to
Cloudinary and only the resulting `{ url, publicId, width, height, alt }`
gets saved wherever the *consuming* record stores its image fields — a
product's `images[]`, a banner's `image`, and so on. Nothing in this app
has ever tracked "every file that was uploaded," only "every file some
other record currently references."

Two ways to fix that were on the table:

1. Introduce a `MediaAsset` collection and touch every module's
   create/update path to also write to it, keeping two copies of the same
   fact (what's in Cloudinary; what Mongo thinks is in Cloudinary) in
   sync forever.
2. Treat Cloudinary itself as the source of truth and query *it* for a
   listing, since it already has every file, every folder, every upload
   timestamp — the exact information a library needs — with zero new
   sync surface.

Went with (2). It's why this phase touches zero other modules and adds
zero new Mongo schemas — the entire backend change is inside
`modules/media`.

## `backend/` — `modules/media`

### `GET /admin/media` (new)
Backed by Cloudinary's **Search API**
(`cloudinary.search.expression(...).sort_by(...).max_results(...).next_cursor(...).execute()`),
not the simpler `resources()` Admin API call — Search was chosen
specifically because it can combine a folder scope *and* a filename
substring in one `expression` string (`folder:woodivo/products/*` AND
`filename:*chair*`), which is what `QueryUserDto`-style search+filter
combos look like everywhere else in this app. Plain `resources()` only
takes a folder prefix, no text search, which would've meant either
filtering client-side across every result or building something
narrower than what every other list endpoint offers.

`QueryMediaDto` (`folder?`, `search?`, `cursor?`, `limit? = 24`) is
deliberately **not** `PaginationQueryDto` — Cloudinary's Search API is
cursor-paginated (`next_cursor`), not page-numbered, and sort is fixed
server-side to `created_at desc` rather than exposed as `sortBy`/
`sortOrder`. Response shape follows: `{ items, nextCursor, totalCount }`,
not `{ items, meta: { page, totalPages, ... } }`.

`MediaService.listAssets()` maps each Cloudinary search result into a
`MediaLibraryAsset` (`publicId`, `url`, `folder`, `format`, `width`,
`height`, `bytes`, `createdAt`). `folder` isn't a stored field anywhere —
it's derived by stripping the `woodivo/` root prefix off `public_id` and
taking the first remaining path segment, which is always one of the
`MediaFolder` values because every upload already nests under
`woodivo/{folder}/...` (`uploadImage`'s existing behavior, untouched).
Falls back to `'misc'` for anything that predates that convention.

### Delete — unchanged, reused
No new delete route. The library's delete action calls the exact same
`POST /admin/media/delete` that `ImageUploader` already calls when a
field's image gets replaced. That endpoint still allows `EDITOR` (the
controller's class-level `@Roles(SUPER_ADMIN, ADMIN, EDITOR)`, no
method-level override) — left alone, since tightening it would break
`ImageUploader`'s own replace-image flow for every EDITOR in every
module. The Library page restricts *its own* delete button to ADMIN+ at
the CMS layer instead (see below) — the API itself is unchanged and
still permits what it always permitted.

### The gap this doesn't close
Deleting an image from `ImageUploader`'s replace flow is safe: the old
`publicId` is being swapped for a new one on the same field, so nothing
else needed it. Deleting from the **Library** is not the same action
wearing a different UI — there's no "swap" happening, so nothing checks
whether some *other* record (a different product using the same
reused/shared image, an old blog post's cover) still points at that
`publicId` before it's gone from Cloudinary entirely. Building that check
would mean a reverse index of every image field across every module,
kept current — real scope, not something to bolt on as a side effect of
a listing endpoint. Flagged instead of silently ignored: the CMS gates
this destructive action to ADMIN+ and the confirm dialog says explicitly
what could break.

## `cms/` — `features/media`

### `types/media.ts`
`MediaLibraryAsset`, `MediaLibraryParams`, `MediaLibraryResult` — mirrors
the backend's cursor-shaped response rather than `types/common.ts`'s
`PaginatedResult<T>`. `MediaLibraryAsset.folder` is typed as
`MediaFolder | string` rather than just `MediaFolder`, matching the
backend's own `'misc'`-fallback looseness.

### `features/media/`
- `media-api.ts` — `useMediaAssets` uses TanStack Query's
  `useInfiniteQuery` (first use of it in this codebase) instead of
  `useQuery` + the shared `Pagination` component, since there's no
  `PaginationMeta` to hand that component — only a cursor and a
  "was there another page" boolean. `useDeleteMediaAsset` posts straight
  to `/admin/media/delete`, the same route `image-uploader.tsx` already
  calls.
- `media-library-page.tsx` — the one page for this module. No create, no
  edit, no detail route: everything here already exists in Cloudinary,
  uploaded through whatever module's form put it there.
  - Grid gallery (2–6 columns depending on viewport) rather than
    `DataTable`, since the entire point is seeing the images, not reading
    rows about them. Hover overlay shows dimensions/format/size and two
    actions: copy URL (`navigator.clipboard`, available to everyone who
    can see the page) and delete (ADMIN+ only, per the gap noted above).
  - Search (filename) + folder filter, same shape as every other list
    page's filter row, even though what's underneath is a Cloudinary
    query instead of a Mongo one.
  - "Load more" button instead of `Pagination`'s prev/next — appends the
    next cursor's page onto what's already rendered rather than replacing
    it, which is the more natural pattern for a visual gallery (losing
    your scroll position to flip "pages" of a grid is worse than it is
    for a table).
  - No debounce on the search input — matches every other search box in
    this codebase (Enquiries, Users, FAQ's group filter), none of which
    debounce either. Noted here only because a Cloudinary API call per
    keystroke is a slightly worse trade than a Mongo regex query per
    keystroke, not because the convention itself is new.

### `nav-items.ts` / `routes.tsx`
Added `/media` → "Media Library" (new nav entry, `Images` icon from
`lucide-react`) under the Operations section, after Users & Roles.
Unlike Phase 16, there was no pre-existing sidebar link or `ComingSoon`
placeholder to replace — Media Library was never in `NAV_SECTIONS` before
this phase, so both the nav entry and the route are new.

## Verified

- Backend: `npx tsc -b` — clean. `npm run build` — clean. `npx eslint` on
  every file touched — clean after `--fix` (pure formatting, same as
  every prior phase's cleanup pass).
- CMS: `npx tsc -b` — clean. `npm run build` — clean, ships a working
  bundle (769.5KB / 222.4KB gzip, vs Phase 16's 762.3KB / 220.4KB — same
  growth trend, same "revisit with code-splitting" note carried forward
  since Phase 8). `npx eslint .` — clean except the same two pre-existing
  `react-refresh/only-export-components` warnings.
- **Not run, same as every phase:** anything against a live Cloudinary
  account. The Search API's `expression` syntax (`folder:x/*` as a
  recursive-folder match, `filename:*y*` as a substring match) is
  reasoned through from Cloudinary's documented grammar, not confirmed
  against a real cloud with real uploaded assets — in particular, whether
  `next_cursor` behaves exactly as expected across repeated calls with a
  changing `expression` (e.g. typing while a request is in flight) is
  unverified.

## Next (Phase 18 candidate)

One item left from the master prompt's CMS module list:

- **Website Builder / Dashboard refinement** — still completely
  unscoped. Three phases in a row (15, 16, 17) picked the *other*
  candidate specifically because this one had nothing concrete to build
  against yet. It needs a scoping pass — what "Website Builder" actually
  means for a project that already has Website Settings (Phase 15) and a
  stats dashboard (Phase 8) — before it can turn into a phase the way
  Users & Roles or Media Library did.

With Media Library done, that's every module from the master prompt's CMS
list except Website Builder. Once that's scoped/built or explicitly
dropped, the CMS side of the master prompt is exhausted, and the next
major piece of unbuilt work is still `frontend/` — the public
customer-facing site — completely unstarted (see `README.md`).

Smaller, scoped-out-on-purpose items:
- No bulk delete or multi-select in the gallery — every other module's
  list page is single-row-at-a-time too (Phase 16 noted the same for
  Users).
- No upload-from-library — uploading still only happens inline on a
  module's own form (`ImageUploader`/`MultiImageUploader`), which is
  where the `folder` context naturally comes from. A bare "upload to the
  library" button would need to ask which folder it belongs in with no
  form field driving that choice, which felt like a worse experience than
  not having it.
- No rename/alt-text editing from the library — `alt` is set once at
  upload time per the `UploadMediaDto` and isn't stored anywhere
  queryable by `publicId` afterward (it lives on whatever record used
  it), so there's nothing for the library to read or write back to.
