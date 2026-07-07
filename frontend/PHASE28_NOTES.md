# Phase 28 — Blog Search + Gallery Tag-Filter UI

Phase 27's notes named this the top item on the open backlog, unchanged
since it was first flagged Phase 20 (Gallery) / Phase 21 (Blogs):

> **Blog/Gallery search & tag-filter UI** — `search`/`tag` params already
> exist server-side on both public query DTOs; this is UI-only, no
> backend work.

That claim needed a small correction once this phase actually looked at
both DTOs side by side. `QueryPublicBlogDto` has `search` (`$text`
full-text) and `category`. `QueryPublicGalleryItemDto` has `tag` and
`type` — **no `search` field at all**, on either the public or admin
gallery DTO. So this phase is genuinely UI-only and needed zero backend
changes, but the two pages don't get the same filter: blogs get a
full-text search box, gallery gets a tag filter box. Both were already
wired end-to-end in the client (`QueryPublicBlogParams.search`,
`QueryPublicGalleryParams.tag` — Phase 19/20's original API layer already
had both fields typed, just never read by a page component) — the actual
gap was purely "no input on either page ever sets these params."

## New: `lib/use-debounced-value.ts`

First debounce need this codebase has had. Every existing filter
(category pills, the gallery type toggle, pagination) is a discrete click
that can hit the API immediately; a free-text box firing a request per
keystroke would be the first filter here to actually need one. Generic
`useDebouncedValue(value, delayMs = 400)` — a plain `setTimeout`/cleanup
`useEffect`, nothing fancier needed for two call sites.

## New: `components/shared/search-input.tsx`

Controlled text input, leading search icon, trailing clear (`×`) button
that only renders when there's a value to clear. No debounce logic of its
own — both callers debounce *before* the URL/query update, so the
component stays a dumb, reusable primitive rather than baking in one
caller's timing assumption. Lives in `components/shared/` next to
`Pagination`/`ErrorNote` rather than `components/ui/` — this project's
`ui/` folder only has `Button` so far, and this is closer in spirit to
the other purpose-built shared pieces than a generic design-system atom.

## `BlogListingPage` — `?search=`

Same draft/debounce split in both pages: local `searchDraft` state so the
box reflects every keystroke with zero lag, a debounced value that only
pushes to `searchParams` (and therefore `useBlogs`'s query key) once
typing pauses for 400ms. The sync effect guards on
`searchParams.get('search') !== debouncedValue` before calling
`setSearchParams`, so it doesn't fire (or push a redundant history
update) on mount when the debounced value already matches a
bookmarked/shared `?search=` URL. `?search=` composes with the existing
`?category=` pills — both can be set at once, exactly how
`findAllPublic`'s filter already ANDs `$text` and `category` together.
Empty-state copy now distinguishes "no posts under this category" from
"no posts match this search" rather than one generic message covering
both.

## `GalleryPage` — `?tag=`

Same pattern, `tag` instead of `search`. Deliberately **not** a chip list
— see the updated doc comment on the page itself for why a tag *chip*
list is a different, bigger, still-unscoped change (no distinct-tags
endpoint exists; hardcoding a vocabulary or adding an aggregation
endpoint is out of this phase's "no backend work" scope). The type toggle
(All/Photos/Videos) is untouched — still correctly hardcoded, since
`GalleryItemType` is a fixed two-value schema enum rather than
CMS-editable content, the same distinction Phase 21's original comment on
this page already drew. `?tag=` composes with `?type=` the same way
`?search=` composes with `?category=` on the blog page.

## What's deliberately staying out of this phase

- **Gallery tag chips / distinct-tags endpoint** — as above; a real
  "browse by tag" UI needs `GalleryService` to expose a distinct-tag list
  (a `distinct('tags', activeFilter)` call plus a new admin+public
  endpoint pair), which is backend work this phase's scope excluded.
- **Blog full-text search highlighting / relevance ordering** — `$text`
  search on MongoDB ranks by `textScore` when you ask for it;
  `findAllPublic` still sorts by `{ publishAt: -1, createdAt: -1 }`
  regardless of whether `search` is set, same as before this phase. A
  future pass could sort by `textScore` when `search` is present, but
  that's a service-layer change, not this phase's "UI-only" scope.
- **Debouncing the existing category/type pill clicks** — deliberately
  untouched; a click is already a single discrete event, adding a
  debounce there would only add latency for no benefit.

## Verified

`tsc -b` and `eslint` clean on both new files and both touched pages.
`vite build` succeeds end-to-end (no new chunk-size regressions beyond
the pre-existing single-chunk-size warning `PHASE27_NOTES.md`'s "Next"
list didn't flag and this phase didn't touch). Manually traced: typing in
either box updates the input on every keystroke; the URL and network
request only update ~400ms after the last keystroke; clearing via the ×
button removes the param from the URL rather than leaving `?search=`;
reloading a page with `?search=` or `?tag=` already in the URL seeds the
box correctly on mount without an extra request loop (the mount-time
effect run is a no-op once the guard sees the values already match).

## Next (Phase 29 candidate)

Full open backlog, carried forward from Phase 27's notes (item 1
resolved this phase, nothing else touched):

1. **Homepage content module** — flagged Phase 18. Needs a new backend
   module (or a `WebsiteSettings` sub-document), a CMS array editor, and a
   frontend rewrite of `why-woodivo-section.tsx` off its hardcoded
   `POINTS` array.
2. **Drag-and-drop reorder** on CMS array editors
   (`specifications-editor.tsx`, `values-editor.tsx`,
   `milestones-editor.tsx`, `team-members-editor.tsx`) — flagged Phase 23.
   No drag library installed yet; `@dnd-kit/core` + `@dnd-kit/sortable` is
   the natural choice.
3. **Shared types package** between backend/CMS/frontend — flagged since
   Phase 8, never fixed. Three independent `package.json`s, no root
   workspace; a repo-structure change, not a quick fix.
4. **Route-based code-splitting** for the CMS bundle — flagged every CMS
   phase since 8. `cms/src/routes.tsx` still imports every feature page
   eagerly.
5. **Lazy-loading images** on the public frontend — flagged Phase 20.
   `ProductCard`/`ProjectCard`/gallery thumbnails still load eager; must
   exclude hero/LCP images. (Gallery's lightbox thumbnails already use
   `loading="lazy"` — the listing grids elsewhere don't.)
6. **`'contact'` banner placement** — Phase 26 left this out of its named
   scope (About/Projects/Blogs only); still a one-line addition matching
   the pattern there if it comes up.
7. **Reverse-proxy rewrite** for `sitemap.xml`/`robots.txt` — infra
   decision from Phase 25, not application code.
8. **Sitemap index/pagination** — not a real gap yet, just the
   ~50,000-URL threshold to watch.
9. **Category/Project structured data** — flagged Phase 27 as a natural
   follow-up now that the `useJsonLd` plumbing and `'entity'`-key
   precedent both exist.
10. **Gallery distinct-tags endpoint** — new this phase, see above; a
    prerequisite for ever turning the Phase 28 tag *box* into a tag chip
    list.
11. **Website Builder / Dashboard refinement** — still completely
    unscoped across every phase since 13; needs a dedicated scoping pass
    before it's phase-sized work at all.
