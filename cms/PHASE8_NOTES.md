# Phase 8 — CMS Scaffold: Auth Flow + Dashboard Shell

First frontend work on the project. Scopes down to exactly what Phase 7's
notes recommended: the CMS's auth flow and dashboard shell, since that
exercises Auth + the new `/admin/dashboard/stats` endpoint together and
establishes the app shell every later CMS screen will sit inside.

Full CRUD screens (Categories, Products, Blogs, etc.) are **not** in this
phase — see "Next" below.

## Stack (matches the master prompt exactly)

React 19, TypeScript, Vite 6, React Router 7, TanStack Query 5, Axios,
React Hook Form + Zod, Tailwind CSS v4, Framer Motion (via the `motion`
package — the project's new name for framer-motion), lucide-react for icons.

**shadcn/ui note:** the sandbox this was built in has no network access to
`ui.shadcn.com`, so the primitives (`Button`, `Input`, `Label`, `Card`,
`Spinner`) are hand-written in the same style shadcn generates — Tailwind
classes + `class-variance-authority` for variants, `cn()` merge helper, same
file layout under `components/ui/`. If you run `npx shadcn init` /
`shadcn add` locally later, these can be swapped 1:1 or left as-is; nothing
downstream depends on shadcn's CLI having generated them.

**Tailwind v4** — CSS-first config via `@theme` in `index.css`, no
`tailwind.config.ts`. Picked this over v3 because it's the version you've
been using on FoodShare, so it matches what you're already reaching for.

## Design direction

CMS admin tool for a premium wooden-products brand — functional first, but
warm and specific rather than generic-admin-blue. Token system:

- **Color**: Espresso `#2B1D14` (text/ink), Walnut `#7A4A2B` (primary
  brand/actions), Sand `#F6EFE6` (app background), white cards, Sage
  `#6E7D5C` (secondary/positive accent), Rust `#B14A34` (destructive/errors)
- **Type**: Fraunces (serif, display — wordmark and page titles only),
  Inter (body/UI text), JetBrains Mono (stat figures and anything
  numeric/id-like) — loaded via Google Fonts `<link>` tags in `index.html`
- **Signature element**: a thin walnut gradient rule that appears next to
  the active sidebar item — the one warm, tactile touch against an
  otherwise quiet, restrained interface. Same gradient reused on the login
  page above the wordmark, tying the two together.
- Visible focus rings everywhere (`:focus-visible` outline, no
  `outline: none` anywhere), `prefers-reduced-motion` respected globally.

**Not visually verified in a browser** — this sandbox has no way to launch
one. Everything here is verified at the compile level (`tsc -b`, `vite
build`, `eslint`) but not eyeballed. Worth a quick look in `npm run dev`
before you trust the spacing/contrast choices.

## What's built

### `lib/`
- `api-client.ts` — Axios instance with a request interceptor that attaches
  the access token, and a response interceptor that handles 401s: tries
  exactly one silent refresh via `POST /auth/refresh` (concurrent 401s
  share the same in-flight refresh call rather than each firing their own),
  retries the original request once, and only redirects to `/login` if the
  refresh itself fails or there's no refresh token stored.
- `query-client.ts` — shared `QueryClient` (30s stale time, no
  refetch-on-window-focus — an admin dashboard doesn't need that
  aggressiveness).
- `utils.ts` — `cn()` (clsx + tailwind-merge), the standard shadcn helper.

### `features/auth/`
- `auth-context.tsx` — `AuthProvider` + `useAuth()`. Restores session from
  `localStorage` on load (access token + cached user object) so a page
  refresh doesn't force a re-login. `login()` calls `POST /auth/login`,
  stores both tokens plus the user object; `logout()` calls
  `POST /auth/logout` then clears local state regardless of whether that
  call succeeds (a logout should never get "stuck" because the network
  request failed).
- `login-page.tsx` — React Hook Form + Zod, redirects back to whatever
  route the person was trying to reach before being bounced to `/login`
  (via router state), single generic error message on 401 (doesn't leak
  whether the email or password was the wrong one).
- `protected-route.tsx` — gate on `useAuth().isAuthenticated`, shows a
  spinner during the initial session-restore check so an authenticated
  person doesn't flash the login page on refresh.

### `features/dashboard/`
- `dashboard-api.ts` — `useDashboardStats()`, a thin TanStack Query wrapper
  around `GET /admin/dashboard/stats`.
- `dashboard-page.tsx` — 8 stat cards (Categories, Products, Enquiries,
  Blogs, Projects, Gallery, Testimonials, FAQs) plus 3 status-breakdown
  cards (Products, Blogs, Enquiries — the three collections the backend
  actually groups by status). Types in `types/dashboard.ts` are copied
  directly from the backend's `DashboardStats`/`EnquiryStatsSummary`
  interfaces from Phase 7 — kept in sync by hand for now since there's no
  shared package between `backend/` and `cms/` yet (see "Next").

### `components/layout/`
- `nav-items.ts` — single source of truth for the sidebar nav list, reused
  by both the sidebar itself and the topbar (which derives the page title
  from the current route via longest-prefix match against this list,
  rather than each page having to set its own title).
- `sidebar.tsx`, `topbar.tsx`, `app-shell.tsx` — fixed sidebar (grouped:
  Overview / Catalog / Content / Operations, matching the master prompt's
  CMS module list), topbar with a user menu (name, role, sign out).

### `components/shared/coming-soon.tsx`
Every sidebar link routes somewhere real — nothing 404s — but everything
except Dashboard renders a plain "not built yet" placeholder rather than a
broken page. Honest about what's actually done in this phase.

## Verified

- `npx tsc -b` — clean
- `npm run build` (`tsc -b && vite build`) — clean, ships a working
  production bundle (612KB single JS chunk — Vite's default chunk-size
  warning, not an error; worth revisiting with route-based code-splitting
  once there are enough real screens to make it matter, not before)
- `npx eslint .` — clean except one benign
  `react-refresh/only-export-components` warning on `auth-context.tsx`
  (exporting both `AuthProvider` and `useAuth` from one file — completely
  standard for a context module, not worth splitting into two files to
  silence)
- **Not run:** `npm run dev` against a live backend. No `mongod` and no
  browser in this sandbox, so the actual login → dashboard flow — token
  storage round-tripping, the refresh-on-401 logic, the stat cards
  rendering real numbers — hasn't been exercised end-to-end. Recommend
  running `docker run mongo` or pointing `MONGODB_URI` at a real instance,
  seeding a user, and walking through login → dashboard by hand before
  building on top of this.

## Next (Phase 9 candidate)

CRUD screens for the two modules everything else in the CMS references:
**Categories** and **Products**. Categories first (it's the simpler shape —
no image gallery, no specs table — and Products' create/edit form needs a
category picker, so Categories needs to exist first). Suggest a shared
`DataTable` + pagination component in this phase too, since every other
content module (Blogs, Projects, Gallery, Testimonials, FAQs, Banners,
Enquiries) will reuse the exact same list-page shape afterward — building
it generically once here saves rebuilding it eight times.

Also worth deciding before Phase 9: whether `backend/` and `cms/` end up in
one monorepo with a shared `types` package (so `DashboardStats` etc. aren't
hand-copied between the two, as they are right now), or stay fully separate
repos. Doesn't block Phase 9 either way, but the longer the hand-copying
goes on the more it'll drift.
