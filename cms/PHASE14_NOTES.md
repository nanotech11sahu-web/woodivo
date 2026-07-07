# Phase 14 — CMS: Enquiries

Picks up **Enquiries** from the Phase 13 candidate list — described there as
"a read/respond flow rather than create/edit," which turned out to be
exactly right once the backend DTOs were read.

## Why Enquiries over the other candidates

Phase 13 left five things on the table: Website Settings, Users & Roles,
Media Library, Enquiries, and Website Builder/Dashboard refinement. Picked
Enquiries because it's the only one of the five with a complete, obviously-
scoped backend already sitting there (`CreateEnquiryDto` /
`UpdateEnquiryDto` / `QueryEnquiryDto`, search, a `/stats` endpoint) and
because it's the actual lead-capture pipeline — every enquiry form on the
public site ends up here, so it's the module with the most immediate
business value of what's left. The other four are either single-document
settings, first-touch on user/role management, or undefined scope
(Website Builder), each of which deserves its own phase rather than being
squeezed in alongside this one.

## What's different about this module

Every prior module followed the same create/edit/list/reorder shape.
Enquiries breaks that shape on purpose, because the data doesn't originate
in the CMS:

- **No create form.** Enquiries are submitted by visitors through the
  public site's contact/product/category forms
  (`EnquiriesController` — the public, non-admin controller — handles
  that). The CMS only ever reads and updates them. There's no
  `/enquiries/new` route.
- **No reorder.** The schema has no `displayOrder` — leads sort by
  `createdAt` (newest first), which is also the `PaginationQueryDto`
  default.
- **`UpdateEnquiryDto` only accepts `status` and `notes`.** Every other
  field (`fullName`, `mobileNumber`, `city`, `message`, `interestedCategory`,
  `source`) is treated as read-only in the CMS — they're what the visitor
  actually submitted, and there's no legitimate reason to let an admin edit
  someone's name or message after the fact.

## What's built

### `types/enquiry.ts`
`EnquiryStatus` (`new`/`seen`/`contacted`/`closed`) and `EnquirySource`
(`homepage`/`product`/`category`/`contact`/`floating_cta`) are both string
unions, not the shared `EntityStatus` type every other module uses —
they're a genuinely different shape (a lifecycle, not an active/inactive
toggle), so `EnquiryUpdatePayload` only carries `status`/`notes`, matching
the backend DTO instead of the usual full-entity payload shape.

### `features/enquiries/`
- `enquiries-api.ts` — `useEnquiries`, `useEnquiry`, `useEnquiryStats`
  (backend's `GET /admin/enquiries/stats`, aggregated count-by-status),
  `useUpdateEnquiry`, `useDeleteEnquiry`. No create hook.
- `enquiry-constants.ts` — status/source option lists and source display
  labels, split into their own file (not exported alongside the badge
  component) purely to keep `react-refresh/only-export-components` quiet;
  mixing them in one file the way `button.tsx` does was flagged by eslint
  and there was no reason to add three more instances of a warning the
  codebase already tolerates for exactly two files.
- `enquiry-status-badge.tsx` — reuses the existing `Badge` component but
  repurposes its four variants (`active`/`inactive`/`neutral`/`destructive`,
  normally just active/inactive) to read as a lifecycle: `new` is
  `destructive` (rust — needs attention), `seen` is `neutral`, `contacted`
  is `active` (sage — positive progress), `closed` is `inactive` (muted,
  done). This is a deliberate reinterpretation of what those variant names
  mean elsewhere in the app; worth knowing if a future phase touches the
  `Badge` component's variants directly.
- `enquiry-list-page.tsx` — search (name/mobile/city, matches the backend's
  `$or` regex search), category filter (reuses `useCategoryOptions` from
  Categories, same as Products), source filter, status filter. Four
  `StatCard`s at the top (reusing the Dashboard's component) show Total,
  New, Contacted, and Closed counts from `/stats` — Seen was left out of
  the headline cards (it's still visible via the status filter dropdown)
  to keep the row to four cards rather than five; not a hard backend
  limitation, just an editorial call.
- `enquiry-detail-page.tsx` — no `/new` counterpart, just `/enquiries/:id`.
  Left column shows the visitor's submitted data as plain read-only text
  (name, click-to-call mobile number, city, interested category, source,
  message in a muted box). Right column is the only editable part: status
  select + notes textarea, saved independently of the read-only side.
  Delete lives in the page header (icon button) rather than the list only,
  since from the detail page is often where an admin decides a lead was
  spam or a duplicate.

### `routes.tsx`
`/enquiries` and `/enquiries/:id` now point at real pages, replacing
`ComingSoon`. `ComingSoon` still covers Users & Roles and Website Settings.
Sidebar nav already pointed at `/enquiries` (Phase 8's `nav-items.ts`), no
nav changes needed.

## Verified

- `npx tsc -b` — clean
- `npx eslint .` — clean except the same two pre-existing
  `react-refresh/only-export-components` warnings (`auth-context.tsx`,
  `button.tsx`) — nothing new from this phase
- `npm run build` — clean, ships a working bundle (746.2KB / 217.4KB gzip,
  vs Phase 13's 735.6KB / 215.2KB — one more module, expected growth, same
  "revisit with route-based code-splitting later" situation flagged since
  Phase 8)
- **Not run:** `npm run dev` against a live backend — same sandbox
  constraint as every phase so far. The stats-cards layout, the search
  regex behavior, and the status-badge color mapping are only reasoned
  through from the DTOs/service code, not confirmed against real data.

## Next (Phase 15 candidate)

Four items remain from the Phase 13 list, none started:

- **Website Settings** — single-document settings form. No list/pagination
  pattern applies here; closer to a one-off form page bound to a single
  backend document than anything built so far.
- **Users & Roles** — user list + role assignment. First module to touch
  `UserRole` beyond route guards (`@Roles(...)` decorators have gated every
  admin controller since Phase 1, but nothing in the CMS currently manages
  who has which role).
- **Media Library** (standalone browser) — uploads already work everywhere
  via `ImageUploader`/`MultiImageUploader`; this would be a dedicated
  grid/browser view over already-uploaded media, independent of any single
  content type. Needs a backend endpoint that lists media generically
  (nothing currently returns "all uploaded assets" — uploads are only
  ever attached to a specific record).
- **Website Builder / Dashboard refinement** — still not a defined
  feature; needs scoping before it can be built.

Smaller, scoped-out-on-purpose items:
- No inline "quick mark as seen/contacted" action on the list page — status
  changes require opening the detail page. A fast-triage inline status
  select on each row would be a reasonable follow-up if admins are
  processing a high volume of leads, but every other list page in this
  codebase routes field edits through a form rather than an inline
  control, so this stayed consistent with that instead of introducing a
  new interaction pattern.
- No bulk actions (bulk status-change/delete), consistent with every
  module so far.
- No CSV export of leads — plausible future ask for a sales/marketing
  workflow, but nothing in the backend currently supports it.
