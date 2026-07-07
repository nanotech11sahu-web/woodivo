# WOODIVO — Project Status

Architecture per the master prompt:

```
woodivo/
├── frontend/   # Phases 18-29, 34, 37 — public customer website (React/TS/Vite): every page built, SEO + structured data, blog search + gallery tag filter, CMS-managed homepage highlights, lazy-loaded images, Markdown blog content + FAQ schema
├── cms/        # Phases 8-17, 27, 29-31, 37 — auth + dashboard + full content CRUD + Users & Roles + Media Library, Markdown blog editor
├── backend/    # Phases 1-7, 16-17, 25, 29, 35, 37 — full REST API + sitemap/robots.txt + demo data seeder, blog images/FAQ schema
├── docker-compose.yml + .env.example   # Phase 33 — full-stack local/VPS deploy
├── DEPLOYMENT.md       # Phase 33-35 — how to actually put this live
├── PHASE32_NOTES.md    # Phase 32 — cross-cutting build verification across all three apps
├── PHASE33_NOTES.md    # Phase 33 — go-live readiness (real bugs fixed + deploy scaffolding)
├── PHASE34_NOTES.md    # Phase 34 — image lazy-loading + platform-hosting sitemap/robots rewrite
├── PHASE35_NOTES.md    # Phase 35 — demo data seeder (categories, products, blogs, and every other content type)
├── PHASE37_NOTES.md    # Phase 37 — blog Markdown content, in-body images, FAQ block + FAQPage JSON-LD
└── docs/
    ├── WOODIVO_Enterprise_Master_Prompt.md
    └── WOODIVO_Phase7_Prompt.md
```

## Going live

See `DEPLOYMENT.md` for the actual walkthrough (Docker Compose on a VPS,
or Vercel/Netlify/Render on managed platforms) and `PHASE33_NOTES.md` /
`PHASE34_NOTES.md` / `PHASE35_NOTES.md` for what those phases found and
fixed — two real bugs Phase 33 caught that Phase 32's build checks
couldn't (a wrong backend URL baked into the CMS, and a runtime
dependency misclassified as dev-only), Phase 34's image lazy-loading and
the Vercel/Netlify sitemap/robots rewrite, and Phase 35's `npm run
seed:demo` for populating a fresh database with realistic placeholder
content across every content type. **If deploying via Path B
(Vercel/Netlify)**, replace `REPLACE_WITH_YOUR_BACKEND_DOMAIN` in
`frontend/vercel.json` and `frontend/public/_redirects` with your real
backend URL before it'll work — everything else needs no editing.

## Phase 32 — build verification (all three apps)

Every phase through 31 was built and reviewed in sandboxes with no npm
registry access, so nothing had ever actually been through `npm
install` + `tsc`/`eslint`/`vite build` (or `nest build`) end to end —
only reviewed by hand. Phase 32 had registry access and used it: all
three apps now install and build clean. `backend/` had 6 substantive
ESLint findings (an enum-comparison and an unnecessary-assertion in
`all-exceptions.filter.ts`, plus 5 Mongoose `pre('save')` hooks marked
`async` with no `await` inside) fixed alongside 37 pure-formatting
issues; `cms/` and `frontend/` were already clean. See
`PHASE32_NOTES.md` for the full findings list and the resulting backlog
(shared types package, frontend image lazy-loading, frontend route
splitting, and more — nothing here is urgent, all of it was already
open before this phase).


## backend/ — Phases 1–7, plus 16, 17, 25 and 29

NestJS + MongoDB API. Auth, Users, Categories, Products, Enquiries, Blogs
(+ BlogCategories), Projects, Gallery, Testimonials, FAQs, Banners,
Website Settings (singleton, now with `seo` — Phase 27 — and `homepage`
— Phase 29 — fields), About page (singleton, `seo` field added Phase 27),
Media (Cloudinary), Health + Admin Dashboard stats, and a `modules/seo`
for sitemap/robots.txt (Phase 25). See `backend/PHASE4_NOTES.md` through
`backend/PHASE7_NOTES.md` for what was built in each early phase.

Four later phases came back to `backend/` after it was declared "done
through Phase 7":

- **Phase 16** added `/admin/users` (list/detail/create/role-change/
  status-toggle/delete) — `UsersModule` had a service/schema from the
  start but no controller until then.
- **Phase 17** added `GET /admin/media` — a Media Library listing backed
  directly by Cloudinary's Search API rather than a new Mongo collection,
  since Cloudinary was already the source of truth for every uploaded
  file.
- **Phase 25** added `modules/seo`: `GET /seo/sitemap-data` (JSON),
  `GET /sitemap.xml` and `GET /robots.txt` (excluded from the global
  `api/v1` prefix), aggregating every published `Category`/`Product`
  /`Blog`/`Project` plus the frontend's static routes.
- **Phase 29** added `WebsiteSettings.homepage.whyWoodivoPoints` — an
  embedded, enum-validated array (`icon`/`title`/`description`) powering
  the frontend's "Why Woodivo" homepage section, previously a hardcoded
  array with no backing content type at all.

Covered in `cms/PHASE16_NOTES.md`, `cms/PHASE17_NOTES.md` (phase numbering
is global across the project, so both folders' notes live together under
`cms/`), `backend/PHASE25_NOTES.md`, and `frontend/PHASE29_NOTES.md`
(Phase 29's backend change is documented alongside its CMS/frontend
counterparts, same as Phase 27's `seo` fields were).

Nothing in this project has been run against a live MongoDB instance or a
live Cloudinary account — every phase was verified at `tsc`/`build`
/`eslint` level only, in a sandbox with neither. As of Phase 32 that
static-level verification is a real, complete `npm install` +
`tsc`/`eslint`/`nest build` pass (not just hand-review), covering every
phase through 31 — see `PHASE32_NOTES.md`.

```
cd backend
cp .env.example .env   # fill in MONGODB_URI, JWT secrets, Cloudinary, SMTP
npm install
npm run start:dev
```

## cms/ — Phases 8–17, plus 27, 29, 30 and 31

React 19 + Vite 6 + Tailwind v4 admin app. Login page, token refresh, app
shell (sidebar/topbar), a dashboard pulling live stats from the backend,
and full CRUD for every content module: Categories, Products, Blogs (+
Blog Categories), Projects, Gallery, Testimonials, FAQs, Banners,
Enquiries (list/detail/status, no create/reorder), Website Settings
(singleton form, no list — an SEO card since Phase 27, a Homepage
highlights array editor since Phase 29), About page (singleton form, now
with an SEO card — Phase 27), Users & Roles (list, inline role/status
controls, create, delete), and Media Library (a Cloudinary-backed
gallery — search, folder filter, copy URL, ADMIN+ delete — see
`cms/PHASE17_NOTES.md`). All five array-editing forms (Products'
specifications, About's values/milestones/team members, Settings'
Homepage highlights) got drag-to-reorder in Phase 30, on a shared
`@dnd-kit`-based primitive (`components/shared/sortable-list.tsx`) — see
`cms/PHASE30_NOTES.md`, including that phase's build-verification caveat.
Phase 31 split every feature page in `routes.tsx` into its own
lazy-loaded chunk (`React.lazy` + one `Suspense` boundary in
`AppShell`), addressing the CMS bundle-size warning flagged since Phase
8 — see `cms/PHASE31_NOTES.md`, which carries the same unverified-build
caveat forward.

See `cms/PHASE8_NOTES.md` through `cms/PHASE17_NOTES.md` for what was
built in each phase and what's still unverified against a live backend
(same caveat as `backend/` above — live services only, not the build
itself, which Phase 32 confirmed). `frontend/PHASE27_NOTES.md` and
`frontend/PHASE29_NOTES.md` cover this app's later changes alongside
their frontend/backend counterparts — Phase 27's `seo` cards and Phase
29's Homepage highlights editor were each part of a single cross-cutting
item, not CMS-only work. `cms/PHASE30_NOTES.md` and `cms/PHASE31_NOTES.md`
are both CMS-only (drag-and-drop reorder and route code-splitting touched
no backend or public-frontend code); `PHASE32_NOTES.md` (project root)
is the cross-cutting phase that finally installed and built all three
apps for real, confirming both of them work as designed.

One item remains unbuilt from the master prompt's module list:

- **Website Builder / Dashboard refinement** — still unscoped. Every
  phase since 13 has picked another candidate specifically because this
  one had nothing concrete to build against yet.

```
cd cms
cp .env.example .env   # set VITE_API_BASE_URL to your running backend
npm install
npm run dev
```

## frontend/ — Phases 18–29

React 19 + Vite 6 + Tailwind v4 public site, same stack the master
prompt specifies, deliberately not sharing the CMS's admin visual theme
(see `frontend/PHASE18_NOTES.md` for the design direction — heartwood
brown, aged brass, ivory, a carved-lattice signature motif).

Every page in the master prompt's "Public Website" list has real content:
Home, About, Category Listing, Product Details, Projects (listing +
details), Gallery, Blogs (listing + details), Contact, 404. Phase 18
built Home; Phases 19–23 filled in Category/Product (19), Projects/Gallery
(20), Blogs (21), Contact (22) and About (23) one at a time, each reading
from the backend's public (`@Public()`) endpoints with no hardcoded
categories anywhere.

A second wave of phases (24–27) went back over the whole site for SEO
rather than adding new pages:

- **Phase 24** — `<head>` meta management (`useSeoMeta`): per-page title,
  meta description, canonical URL and Open Graph tags, direct DOM
  manipulation with no `react-helmet` dependency.
- **Phase 25** *(backend)* — sitemap.xml / robots.txt aggregating every
  published entity.
- **Phase 26** — wired the `Banner` CMS entity's `about`/`projects`/`blog`
  placements (`BannerPlacement` had included them since Phase 7; only
  `hero` was ever read until this phase).
- **Phase 27** — structured data (`Organization`, `Product`,
  `BlogPosting`, `BreadcrumbList` JSON-LD via a new `useJsonLd` hook) and
  a `seo` field on `AboutPage`/`WebsiteSettings`, the last two content
  types that didn't have one.

A third, single-item phase came after the SEO wave, off the same backlog
list rather than a new thread:

- **Phase 28** — blog search (`?search=`, full-text via the existing
  `$text` index) and a gallery tag filter (`?tag=`), both debounced
  text inputs (`useDebouncedValue`, `SearchInput`) composing with the
  category pills / type toggle each page already had. No backend
  changes — both query params already existed server-side, just unread
  by any UI until this phase.

A fourth phase followed straight after, also off the same backlog list:

- **Phase 29** — `WhyWoodivoSection` (the homepage's "why choose us"
  points) is no longer a hardcoded array. It now reads
  `WebsiteSettings.homepage.whyWoodivoPoints`, editable from the CMS's
  Settings page with a fixed icon picker (twelve `lucide-react` icons,
  validated server-side) — the last hardcoded homepage section named in
  the master prompt's "Homepage sections (CMS managed)" list. Falls back
  to the original four points when the array is empty, same as every
  other content type's pre-CMS-visit fallback.

Also built (Phase 18–22): a site-wide enquiry dialog (available from the
header, the hero, every product card, and the closing CTA — matching the
master prompt's "available from every page"), a WhatsApp float button
read from Website Settings, and category/contact data pulled live rather
than hardcoded anywhere.

See `frontend/PHASE18_NOTES.md` through `frontend/PHASE29_NOTES.md` for
what was built each phase, what's a deliberate placeholder, and what's
next. The current full prioritized backlog across all three folders now
lives in `PHASE32_NOTES.md`'s "Next" section (Phase 30 resolved
drag-and-drop reorder, Phase 31 resolved CMS route code-splitting, and
Phase 32 resolved the build-verification gap both of those phases had
been carrying forward — all three apps now install and build clean).

```
cd frontend
cp .env.example .env   # set VITE_API_BASE_URL to your running backend
npm install
npm run dev
```

