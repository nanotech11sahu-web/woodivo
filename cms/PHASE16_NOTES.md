# Phase 16 — Users & Roles

Picks up the first of the two items left on Phase 15's candidate list.
Media Library and Website Builder are still unscoped/blocked exactly as
Phase 15 described; this phase is Users & Roles only.

Unlike every phase since 8, this one touches `backend/` again — Phase 15
confirmed the blocker was real: `UsersModule` had a service and schema but
no controller, so there was nothing for a CMS page to call. That gets
fixed first, then the CMS module is built on top of it.

## `backend/` — `modules/users`

### What existed already
`UsersService` (create, findByEmail, findById, refresh-token handling,
`ensureSuperAdminExists` for the startup seed) and `UserSchema`
(`name`, `email`, `password`, `role`, `status`, `refreshToken`,
`lastLoginAt`). All of it built for `AuthModule` to consume
(`/auth/login`, `/auth/me`, `/auth/change-password`) — none of it was ever
exposed as an admin-manageable resource.

### New: `users.admin.controller.ts` (`/admin/users`)
- `GET /` — paginated list (`QueryUserDto`: search by name/email regex,
  filter by `role`/`status`), same shape as every other admin list
  endpoint (`PaginatedResult<T>` via `buildPaginationMeta`).
- `GET /:id` — single user.
- `POST /` — create (reuses the `CreateUserDto` that already existed for
  the seeder).
- `PATCH /:id/role` — role change, its own DTO/route rather than folded
  into a general update, same reasoning as banners'/products' `:id/status`
  split: this is a distinct, more sensitive action than editing a name.
- `PATCH /:id/status` — activate/deactivate.
- `DELETE /:id`.

All five mutating actions run through `UsersService`, and list/detail
always `.select('-password -refreshToken')` — the pre-existing
`findAll()` already did this; `findAllAdmin`/`findByIdAdmin` follow suit.
`create()` still returns the raw saved document (hashed password
included, since Mongoose's `select: false` only hides fields on queries,
not on an in-memory doc after `.save()`), so the controller re-fetches
through `findByIdAdmin` before returning rather than handing back what
`create()` gave it directly.

### Role gate
Class-level `@Roles(SUPER_ADMIN, ADMIN)` on the controller (list/detail
readable by both). Method-level overrides tighten `create`, `:id/role`,
and `delete` to `@Roles(SUPER_ADMIN)` only; `:id/status` is left
inheriting the class-level gate, so an ADMIN can deactivate/reactivate an
EDITOR without needing role-change rights.

### Self-protection
Added because this is the first module where a user can act on *their
own* record through an admin surface — `/auth/me` and
`/auth/change-password` already exist for self-service, so there was
never a reason for `/admin/users/:id` to allow `id === currentUser`.
`UsersService.updateRole` / `updateStatus` / `remove` all take a
`currentUserId` argument (from `@CurrentUser()` in the controller) and
throw `BadRequestException` if it matches the target `id` — an admin
can't demote, deactivate, or delete themselves and get locked out with no
one left to undo it.

**Not handled:** nothing stops a `SUPER_ADMIN` from demoting or
deactivating the *last other* `SUPER_ADMIN`, only themselves. Guarding
"don't leave zero super admins" would need a count query on every
role/status change to every user, not just self-checks, and felt like
scope beyond what this phase needed — flagged here rather than silently
assumed away.

## `cms/` — `features/users`

### `types/user.ts`
`User`, `UserListParams`, `CreateUserPayload`. `UserStatus` is an alias of
the existing `EntityStatus` from `types/common.ts` rather than a new type,
since the backend's `UserStatus` enum values (`active`/`inactive`) are
identical to every other module's status field, even though it's a
separate enum on the backend (`schemas/user.schema.ts`, not
`app.constants.ts`). `UserRole` isn't redeclared either — it already
existed in `types/auth.ts` for `AuthUser.role`, so `types/user.ts` imports
it from there instead of maintaining two copies of `'super_admin' |
'admin' | 'editor'`.

### `features/users/`
- `users-api.ts` — `useUsers` (list), `useCreateUser`,
  `useUpdateUserRole`, `useUpdateUserStatus`, `useDeleteUser`. No
  `useUser(id)` single-fetch hook — unlike every other module, there's no
  edit page to load one into (see below), so nothing needs it.
- `user-form-schema.ts` — zod schema for the create form only
  (name/email/password/role). No separate edit-payload type, since role
  and status are edited inline on the list rather than through this form.
- `user-create-dialog.tsx` — a `Dialog`-based form instead of a
  `/users/new` route. Every other module's create flow is a full page
  because it has multiple sections (images, SEO, rich text, visibility).
  This form is four inputs; a full page would be mostly whitespace. The
  `Dialog` primitive was already proven for more than a yes/no prompt by
  `ConfirmDialog`, so this reuses it rather than introducing a new
  full-page route pattern for one small form.
- `user-list-page.tsx` — the one page for this module; no `/users/:id`
  detail or edit route exists.
  - **Role** renders as an inline `Select` (editor/admin/super_admin) that
    fires `useUpdateUserRole` on change — but only for a `SUPER_ADMIN`
    viewer, on someone else's row. Everyone else (including a
    `SUPER_ADMIN` looking at their own row) sees it as a plain read-only
    `Badge`, matching what the backend's role gate would actually allow —
    an ADMIN viewer would just get a 403 from an editable control they
    couldn't use.
  - **Status** renders as a clickable `Badge` that toggles
    active/inactive directly (not a `Select`, since it's a two-state
    value — a dropdown for a boolean toggle would be one extra click for
    no benefit). Clickable for `SUPER_ADMIN` or `ADMIN` viewers, on
    someone else's row; otherwise it's inert, same reasoning as role.
  - **Delete** — same `SUPER_ADMIN`-and-not-self gating, reusing
    `ConfirmDialog` exactly like every other module's delete flow.
  - **"New user" button** — only rendered for a `SUPER_ADMIN` viewer,
    since `POST /admin/users` is `SUPER_ADMIN`-only.
  - Self-row shows a small "(you)" marker next to the name so the
    disabled controls read as intentional rather than broken.
  - Search (name/email) + role filter + status filter, standard
    pagination — same shape as every other list page.

### `routes.tsx`
`/users` now points at `UserListPage`, replacing `ComingSoon`. No new
routes added (no `/users/new`, no `/users/:id/edit` — see above). Sidebar
nav already pointed at `/users` with the right label and icon since
Phase 8's `nav-items.ts`; no nav changes needed.

## Verified

- Backend: `npx tsc -b` — clean. `npm run build` — clean. `npx eslint` on
  every file touched this phase — clean (some pre-existing
  `prettier/prettier` formatting debt in `create-user.dto.ts` and
  `user.schema.ts`, neither touched this phase, was left alone rather than
  reformatted as a drive-by).
- CMS: `npx tsc -b` — clean. `npm run build` — clean, ships a working
  bundle (762.3KB / 220.4KB gzip, vs Phase 15's 755.5KB / 219.1KB — one
  more module, same growth trend, same "revisit with code-splitting"
  situation flagged since Phase 8). `npx eslint .` — clean except the same
  two pre-existing `react-refresh/only-export-components` warnings
  (`auth-context.tsx`, `button.tsx`) — nothing new from this phase.
- **Not run, same as every phase:** `npm run dev` against a live backend
  with a real MongoDB. In particular, the self-protection checks
  (`id === currentUserId`) are only reasoned through against the JWT
  payload shape, not confirmed against a real login session; and the
  "last SUPER_ADMIN" gap above is untested by definition, since nothing
  currently prevents it.

## Next (Phase 17 candidate)

Two items left from Phase 13's original three, both still blocked the
same way Phase 15 and Phase 16 found them:

- **Media Library** (standalone browser) — needs a backend endpoint that
  lists media generically; nothing currently returns "all uploaded
  assets," only per-record attachments. No obvious owner module for it
  either (unlike Users, which at least had `UsersModule` sitting there
  half-built) — this would start from close to zero on the backend.
- **Website Builder / Dashboard refinement** — still undefined, still
  needs scoping before it can be built.

With Users & Roles done, that's every module from the master prompt's CMS
list except those two. After they're scoped (or dropped), the next major
piece of unbuilt work is still `frontend/` — the public customer-facing
site — which remains completely unstarted (see `README.md`).

Smaller, scoped-out-on-purpose items:
- No bulk actions (bulk-deactivate, bulk-delete) — every other module's
  list page is single-row-at-a-time too.
- No audit trail of who changed whose role/status — nothing else in this
  codebase logs admin actions either, so this doesn't introduce a new gap
  so much as inherit an existing one.
- No email notification to a user when their role or status changes —
  `MailModule` exists (used for enquiry notifications), but wiring it here
  felt like scope creep for a phase that was mainly about unblocking the
  backend.
