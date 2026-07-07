# Phase 18 — Public Frontend: Foundation & Home Page

`frontend/` was the last piece of the architecture with zero code (see
root `README.md`'s "not started" note). Website Builder — the other
candidate Phase 17 left open — is still unscoped for the same reason
Phases 15–17 all skipped it: there's nothing concrete to build against
yet. This phase picks up the other thread instead: scaffold the public
site and build the one page every other page links back to.

## Why Home first, and why everything else is a placeholder

The master prompt's page list is nine pages deep (Home, About, Category
Listing, Product Details, Projects, Gallery, Blogs, Blog Details, Contact,
404). Building all nine in one phase would repeat the CMS's own mistake
in reverse — Phase 8 built the CMS shell plus a dashboard and left every
content module as `ComingSoon` for Phases 9–17 to fill in one at a time.
This phase follows that same shape on the public side: the router defines
all nine routes now, so nav links, category cards, product cards and blog
cards all resolve to a real page instead of a 404 — but only `/` has real
content. Every other route renders `ComingSoonPage`, the public-site
equivalent of the CMS's `ComingSoon`.

`NotFoundPage` (the `*` route) is the one exception — it's a real, finished
page, not a placeholder, since a 404 shouldn't itself say "coming soon."

## `frontend/` scaffold

Mirrors `cms/`'s tooling choices deliberately, not by coincidence — same
React 19 + Vite 6 + Tailwind v4 + TanStack Query + React Hook Form + Zod
stack the master prompt specifies for both apps, same path alias (`@/*`),
same strict `tsconfig` flags. Diverges from `cms/` in exactly two places:

1. **No auth.** The public site never logs in — there's no token to
   store, so `lib/api-client.ts` has no refresh-token interceptor and no
   redirect-to-login. It keeps the one thing that *is* shared regardless
   of which app is calling: unwrapping the backend's
   `{ success, data, ... }` envelope, so hooks can treat responses as raw
   payloads the same way CMS hooks do.
2. **No shadcn/ui install.** The master prompt lists shadcn/ui for both
   apps, but this phase's only interactive primitive is a single modal
   (the enquiry dialog) and a button. Pulling in the shadcn CLI, Radix,
   and its generated `components/ui/*` for one dialog felt like more
   surface than the phase needed — `EnquiryDialog` is built on the native
   `<dialog>` element instead (real top-layer stacking, Escape-to-close,
   `::backdrop` styling, a working focus trap, zero extra dependency).
   `components/ui/button.tsx` is still hand-rolled in the shadcn pattern
   (`cva` + `cn`) so swapping in the real shadcn CLI later, once a second
   or third primitive is actually needed, is a drop-in, not a rewrite.

`VITE_API_BASE_URL` defaults to `http://localhost:4000/api/v1` in
`.env.example`, matching `backend/src/main.ts`'s actual default port and
`API_PREFIX` constant — not a guessed `3000`.

## Design direction

The CMS's warm walnut/espresso admin palette (`cms/src/index.css`) was
deliberately not reused as-is — that's a back-office theme tuned for
screens full of tables and forms, and reusing it verbatim for a
customer-facing brand site would read as "the admin panel's colors,
minus the admin panel." The public site takes the same wood-and-warmth
starting point and pushes it toward what it's actually selling — heartwood
brown, aged brass, ivory, a single vermilion accent — set in Cormorant
Garamond (a display serif with the kind of chiseled contrast that reads
as carved, not corporate) over Sora for body text.

The signature element is `components/shared/jali-divider.tsx` — a tiling
SVG lattice unit standing in for the pierced jali screens carved into
Woodivo's own temple doors, used as a section divider instead of a plain
rule or gradient fade. It's pure vector (a `<pattern>` tile, no image
request) so it repeats cleanly at any width and recolors with `currentColor`
for both the ivory and teak-deep backgrounds it appears on.

## Shared infrastructure

- **`features/enquiry/enquiry-dialog-context.tsx`** — one enquiry modal,
  mounted once in `SiteLayout`, opened from anywhere via
  `useEnquiryDialog().openEnquiryDialog(source, presetCategorySlug)`. This
  is what makes "Enquire Now available from every page" (master prompt)
  true without every page owning its own copy of the form: the header's
  button, the hero's CTA, each product card's "Get Quote," and the
  closing CTA section all share it. `source` threads through to
  `CreateEnquiryDto.source` so the saved record reflects where the
  visitor actually was — `EnquirySource.PRODUCT` from a product card,
  `EnquirySource.HOMEPAGE` from the header/hero/CTA — not just that an
  enquiry happened.
- **`components/shared/enquiry-form.tsx`** — `react-hook-form` +
  `zod`, validated against the same rule `CreateEnquiryDto` enforces
  server-side (the mobile-number regex is copied character-for-character
  from `backend/.../create-enquiry.dto.ts` rather than a looser
  client-side approximation). Category select is populated from
  `useCategories()` — never hardcoded, per the master prompt's rules.
  Shows an inline thank-you state on success rather than an alert/toast,
  since the dialog itself is already the "thank-you popup" the master
  prompt asks for.
- **`components/layout/whatsapp-float-button.tsx`** — reads
  `settings.contact.whatsapp` and renders nothing if it's unset, rather
  than showing a floating button that opens `https://wa.me/undefined`.

## Home page — section by section

Built in the exact order the master prompt's "Homepage sections (CMS
managed)" list gives: Hero → Featured Categories → Featured Products →
Why Woodivo → Projects → Testimonials → Blogs → FAQs → CTA. Each section
is its own file under `pages/home/sections/`, each fetches its own data
independently (no single "get homepage data" endpoint exists, or was
asked for) and each fails independently — one section's error doesn't
blank the rest of the page.

- **Hero** — the one section that renders even with zero CMS content,
  because a fresh install has no banners yet (Banner Management is filled
  in after launch, not before). Falls back to static headline/subtitle
  copy and a CSS radial-gradient background instead of assuming
  `banners[0]` exists.
- **Featured Categories / Products / Projects / Testimonials / Blogs** —
  each returns `null` on an empty (not errored) result rather than
  rendering an empty grid. Empty is a legitimate CMS state — nothing's
  been marked `isFeatured` yet — not a bug to paper over.
- **Why Woodivo** — the one section with no backing collection at all.
  Nothing under `backend/src/modules` persists "why choose us" copy —
  it's not `Testimonials`, not `Faqs`, not a settings field. Hardcoded
  here rather than invented as a fake API call against an endpoint that
  doesn't exist. Flagged, not silently assumed away: a real fix is a
  homepage-content module, which is its own scoped phase, not a drive-by
  addition to this one.
- **FAQs** — a plain expand/collapse accordion (native button + state,
  no accordion library) since it's the only accordion UI in this app so
  far.
- **CTA** — closes the page with the same `openEnquiryDialog('homepage')`
  the header and hero already use.

## What's deliberately not in this phase

- **Every other page** — About, Category Listing, Product Details,
  Projects listing, Gallery, Blogs listing, Blog Details, Contact — is a
  routed `ComingSoonPage`, not built content. That's the bulk of the
  master prompt's "Public Website" page list, and it's next.
- **Header search** — no product/category search box. Nothing in the
  master prompt's public-site page list calls for one, and none of the
  built pages yet have enough content for search to matter.
- **SEO tags per page** — `Category.seo` / `Product.seo` / `Blog.seo` /
  `Project.seo` all exist on the backend and are typed on the frontend
  (`types/*.ts`), but nothing in this phase writes them into `<head>` —
  there's no `react-helmet`-equivalent wired up yet, and Home is the only
  page with content to tag. Belongs with whichever phase builds the
  content pages that actually need per-page `<title>`/meta tags.
- **Image lazy-loading / code-splitting** — the master prompt's
  "Performance" section asks for both. Every `<img>` in this phase is a
  plain tag with no `loading="lazy"`, and the production bundle is a
  single 520KB/163KB-gzip chunk with no route-level `React.lazy` — the
  same "revisit with code-splitting" note the CMS has carried since its
  own Phase 8, now inherited here too, on a bundle about 30% smaller than
  the CMS's for having a fraction of the pages built.

## Verified

- `npm install` — clean, 230 packages.
- `npx tsc -b` — clean.
- `npm run build` — clean, ships a working bundle (520.9KB / 162.6KB
  gzip). Single-chunk warning noted above, not addressed this phase.
- `npx eslint .` — clean except one `react-refresh/only-export-components`
  warning on `components/ui/button.tsx` (exports both `Button` and
  `buttonVariants`, the latter reused by `ComingSoonPage`/`NotFoundPage`
  to style a `<Link>` as a button without nesting an `<a>` inside a
  `<button>`) and one on `enquiry-dialog-context.tsx` (exports both the
  provider component and the `useEnquiryDialog` hook) — the same shape of
  warning the CMS has carried since its own early phases, not a new
  problem.
- **Not run, same caveat as every phase in this project:** nothing
  against a live backend. Every hook's shape is reasoned through against
  the actual controller/DTO/schema code in `backend/src/modules`, not
  against real responses from a running API with real Cloudinary-hosted
  images.

## Next (Phase 19 candidate)

Two threads left, same as Phase 17 left two:

- **Public content pages** — About, Category Listing, Product Details,
  Projects listing/detail, Gallery, Blogs listing/detail, Contact (with
  its own enquiry form + `googleMapEmbedUrl`). Category Listing and
  Product Details are the most natural next step — they're what "Enquire
  Now" and every category/product card built this phase actually link to.
- **Website Builder / Dashboard refinement** — still unscoped, four
  phases running (15, 16, 17, 18) now.

Smaller, scoped-out-on-purpose items:
- No `robots.txt` / `sitemap.xml` — nothing to index yet with only Home
  built.
- No analytics wiring — `WebsiteSettings.googleAnalyticsId` and
  `facebookPixelId` exist on the backend and aren't read anywhere on the
  frontend yet; belongs with whichever phase adds `<head>` management.
- No skeleton loaders beyond a single centered spinner per section —
  content-shaped skeletons (grid placeholders sized like the real cards)
  would read as more polished but felt like more visual design than a
  foundation phase needed to get right on the first pass.
