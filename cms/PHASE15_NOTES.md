# Phase 15 — CMS: Website Settings

Picks up **Website Settings** from the Phase 14 candidate list. Of the
three remaining items (Users & Roles, Media Library, Website Builder),
this is the only one with a complete, obviously-scoped backend sitting
there already: `SettingsAdminController` (`GET`/`PATCH /admin/settings`),
`UpdateWebsiteSettingsDto`, and a singleton `WebsiteSettings` schema that
the service lazily upserts on first read. Users & Roles has no
`users.controller.ts` at all yet — only a service/schema — so there's
nothing to wire a CMS page to. Media Library needs a "list everything
ever uploaded" endpoint that doesn't exist (uploads are only ever
attached to a specific record). Website Builder is still unscoped. None
of those three got any closer to buildable this phase.

## Why this module breaks the established shape

Every module through Phase 14 — even Enquiries, which dropped create and
reorder — was still fundamentally a collection: a list page, pagination,
filters, one document per row. Website Settings has none of that, because
there's exactly one document, keyed by `SETTINGS_SINGLETON_KEY` and
upserted into existence the first time anyone calls `GET`:

- **No list page.** `/settings` is a single form page, full stop — no
  `/settings/new`, no `/settings/:id/edit`, no table.
- **No create, no delete.** Only `GET` (to load current values) and
  `PATCH` (to save changes). There will never be a second settings
  document to create or a reason to delete the one that exists.
- **No status field, no `displayOrder`.** The schema is just content —
  identity, contact, social, footer, tracking IDs — with nothing to
  toggle active/inactive or reorder.

## What's built

### `types/settings.ts`
`WebsiteSettings`, plus its three nested shapes (`ContactInfo`,
`SocialLinks`, `FooterSettings`) hand-copied from the backend schema, and
`UpdateWebsiteSettingsPayload` mirroring `UpdateWebsiteSettingsDto` (every
field optional, PATCH-only — no separate create-payload type, since
there's no create).

### `features/settings/`
- `settings-api.ts` — `useWebsiteSettings` (`GET /admin/settings`) and
  `useUpdateWebsiteSettings` (`PATCH /admin/settings`). The update hook's
  `onSuccess` writes the response straight into the query cache with
  `setQueryData` instead of `invalidateQueries` — every other module's
  mutations invalidate and let a refetch happen, but here the PATCH
  response already *is* the full singleton document, so there's nothing a
  refetch would tell us that the response didn't already.
- `settings-form-schema.ts` — one flat-ish zod object with three nested
  sub-schemas (`contact`, `socialLinks`, `footer`) matching the backend's
  nested DTOs. No `url()` validation on any link field (Google Maps embed,
  social profiles) — same permissiveness as banner's `ctaLink` and FAQ's
  `group`, since the backend DTOs don't validate format either, only
  `IsString`. `contact.email` is the one exception: it gets a client-side
  `.email()` check (same reasoning as the login form) since a typo there
  silently breaks the site's contact channel rather than just looking odd.
- `settings-page.tsx` — five stacked `Card`s (General, Contact Info,
  Social Links, Footer, Tracking) rather than a tabbed layout — there's no
  `Tabs` component in this codebase yet, and every other multi-section
  form so far (Banner's Details/Visibility, Product's several sections)
  uses stacked cards too, so this stays consistent rather than
  introducing a new UI primitive for one page. Logo/favicon use two
  `ImageUploader`s exactly like every other module's image fields,
  `folder="settings"` — which was already sitting in `MediaFolder`
  (`types/common.ts`) unused until now. No cancel/back link, since there's
  no list to go back to; just a single "Save changes" button. Blank
  optional inputs are sent as `undefined` rather than `""`, matching
  banner's `|| undefined` pattern, even though the backend's `IsOptional`
  DTOs would accept empty strings just fine.

### `routes.tsx`
`/settings` now points at `SettingsPage`, replacing `ComingSoon`.
`ComingSoon` still covers Users & Roles only. Sidebar nav already pointed
at `/settings` (Phase 8's `nav-items.ts`), no nav changes needed.

## Verified

- `npx tsc -b` — clean
- `npx eslint .` — clean except the same two pre-existing
  `react-refresh/only-export-components` warnings (`auth-context.tsx`,
  `button.tsx`) — nothing new from this phase
- `npm run build` — clean, ships a working bundle (755.5KB / 219.1KB gzip,
  vs Phase 14's 746.2KB / 217.4KB — one more module, expected growth, same
  "revisit with route-based code-splitting later" situation flagged since
  Phase 8)
- **Not run:** `npm run dev` against a live backend — same sandbox
  constraint as every phase so far. In particular, the lazy-upsert-on-
  first-`GET` behavior (an admin hitting Settings before anyone has ever
  saved it) is only reasoned through from `SettingsService.get()`, not
  confirmed against a real empty database.

## Next (Phase 16 candidate)

Two items remain from the Phase 13 list:

- **Users & Roles** — still blocked on the backend having no
  `users.controller.ts`; would need at least list/detail/role-update
  endpoints added to `UsersModule` before a CMS page has anything to call.
  First module that would touch `UserRole` beyond route guards
  (`@Roles(...)` decorators have gated every admin controller since
  Phase 1, but nothing manages who has which role).
- **Media Library** (standalone browser) — still needs a backend endpoint
  that lists media generically; nothing currently returns "all uploaded
  assets," only per-record attachments.
- **Website Builder / Dashboard refinement** — still undefined, needs
  scoping before it can be built.

With those three the CMS side of the master prompt's module list is
exhausted. After Users & Roles gets a real backend (or gets dropped from
scope), the next major piece of unbuilt work is `frontend/` — the public
customer-facing site — which still has no code at all (see `README.md`).

Smaller, scoped-out-on-purpose items:
- No "unsaved changes" warning if an admin navigates away mid-edit;
  consistent with every other form page in this codebase, none of which
  guard against it either.
- No preview of how `footer.aboutText` / social links will actually
  render on the public site — there's no `frontend/` yet to preview
  against.
