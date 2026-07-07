# Phase 12 — CMS: Testimonials & FAQs

Picks up the "Phase 12 candidate" flagged at the end of `PHASE11_NOTES.md`:
Testimonials and FAQs, both simpler than Projects (no rich image handling,
short forms) and both had complete backends already (Phase 1:
`admin/testimonials`, `admin/faqs`).

## What's built

### `types/testimonial.ts`, `types/faq.ts`
Hand-copied from the backend schemas/DTOs, same pattern as every module so
far. Neither `Testimonial` nor `Faq` has a `seo` field on the backend
schema — first two modules with no SEO card in their forms. Neither
`ListParams` has a `search` field either: `QueryTestimonialDto` and
`QueryFaqDto` only support `status`/`isFeatured` and `status`/`group`
respectively — no `$text` index, no search filter in either service. List
pages reflect that: no search box, just the filters the backend actually
supports, rather than shipping a search input that would silently do
nothing.

### `features/testimonials/`
- `testimonials-api.ts` — same shape as `projects-api.ts` (list/detail/
  create/update/delete/reorder — `PATCH /admin/testimonials/reorder`
  exists on the backend).
- `testimonial-form-schema.ts` — `rating` is a `1`–`5` **select**, not a
  coerced number input. A free-text/number field would use
  `z.coerce.number()`, but `Number('')` is `0`, not `undefined` — an empty
  rating field would silently save as a 0-star rating instead of "no
  rating". The select sidesteps that by making the empty state an explicit
  option (`''` → "No rating").
- `testimonial-list-page.tsx` — photo thumbnail (circular, since it's a
  headshot vs. the square thumbnails everywhere else), star-rating column,
  featured filter (`isFeatured` as a 3-way select: All / Featured only / Not
  featured — first list page to filter on a boolean field), status filter,
  ↑/↓ reorder with the same `canReorder` guard introduced in Phase 11
  (disabled whenever the featured or status filter is active).
- `testimonial-form-page.tsx` — client name/location/project type, rating
  select, testimonial text (textarea), single `ImageUploader` for
  `clientPhoto` (folder: `testimonials`), status/order/featured. No SEO
  card, no multi-image gallery — testimonials don't need either.

### `features/faqs/`
- `faqs-api.ts` — same shape again, reorder included.
- `faq-form-schema.ts` — `question`/`answer`/`group`/`displayOrder`/
  `status` only. The simplest form yet: no images, no SEO, no `isFeatured`
  (the schema doesn't have one — FAQs don't get featured on the homepage
  independently of their group).
- `faq-list-page.tsx` — question + truncated answer preview, group column,
  status, reorder. The `group` filter is a plain text input rather than a
  `Select` populated from existing values: `group` is free text on the
  backend (`@MaxLength(80) group?: string`), not a reference to another
  collection like category is for products/projects, and there's no
  endpoint that returns the distinct set of groups in use. Typed exactly
  matches; there's no partial/regex search on the backend for this field
  either. Reorder uses the same `canReorder` guard, gated on `status` and
  `group` both being empty.
- `faq-form-page.tsx` — question (input), answer (textarea), group (input,
  with a one-line hint that it's optional and site-facing grouping only),
  status/order. No `Card` for "Visibility → featured" toggle since there's
  nothing to toggle beyond status.

### `routes.tsx`
`/testimonials`, `/testimonials/new`, `/testimonials/:id/edit`, `/faqs`,
`/faqs/new`, `/faqs/:id/edit` now point at real pages. `ComingSoon` still
covers Gallery and Banners. Sidebar nav already pointed at both (Phase 8's
`nav-items.ts`), so no nav changes needed this phase.

## Verified

- `npx tsc -b` — clean
- `npx eslint .` — clean except the same two pre-existing
  `react-refresh/only-export-components` warnings (`auth-context.tsx`,
  `button.tsx`) — nothing new from this phase
- `npm run build` — clean, ships a working bundle (716.6KB / 212.5KB gzip,
  vs Phase 11's 698KB / 210KB — two more full CRUD modules, expected
  growth, same "revisit with route-based code-splitting later" situation
  flagged since Phase 8)
- **Not run:** `npm run dev` against a live backend — same sandbox
  constraint as every phase so far (no `mongod`, no browser here). The
  rating-select-to-number conversion and the group exact-match filter are
  only verified by reading the DTOs, not by submitting real data.

## Next (Phase 13 candidate)

Gallery and Banners are the only two `ComingSoon` CMS modules left.

- **Gallery**: worth checking the backend schema before assuming it mirrors
  Projects — likely images + captions + category, no client/location/year
  fields, so probably closer to a trimmed-down Projects form than a new
  pattern.
- **Banners**: flagged as the odd one out since Phase 10 — positioning/
  homepage-slot driven rather than content-driven. Worth reading the
  backend schema fresh rather than assuming it fits the list/form pattern
  every other module has used so far; it may need a different UI
  altogether (e.g. a slot picker instead of a paginated list).

Once Gallery and Banners are done, the CMS module list from the master
prompt is fully implemented except Website Settings, Users & Roles, Media
Library (standalone browser view — uploads already work everywhere via
`ImageUploader`/`MultiImageUploader`), Enquiries, and Website Builder /
Dashboard refinement.

Still true from Phase 8 onward: `backend/` and `cms/` hand-copy types with
nothing enforcing they stay in sync — now seven modules deep
(`DashboardStats`, `Category`/`Product`, `Blog`/`BlogCategory`, `Project`,
and now `Testimonial`/`Faq`).

Smaller, scoped-out-on-purpose items:
- No bulk actions (bulk delete/status-change) on either list page,
  consistent with every module so far.
- FAQ `group` has no autocomplete/picker — a future pass could add an
  endpoint returning distinct groups and turn this into a `Select` +
  "create new" combo, but that's backend work outside this phase's scope.
- Testimonial rating is optional and unbounded in *display* (a testimonial
  with no rating just shows an em dash) — matches the backend, which never
  requires a rating.
