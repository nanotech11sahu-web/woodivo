# Phase 31 — Route-Based Code-Splitting for the CMS Bundle

Flagged in every CMS phase's notes since Phase 8, most recently repeated
as item 3 on Phase 30's backlog:

> **Route-based code-splitting** for the CMS bundle — flagged every CMS
> phase since 8. `cms/src/routes.tsx` still imports every feature page
> eagerly. (The CMS bundle crossed the 500kB chunk-size warning
> threshold building this phase — 787kB minified — for the first time
> since this warning started appearing; still not urgent, but worth
> noting as the trigger the phase notes have been watching for.)

This phase splits every feature page into its own chunk, loaded on
navigation rather than upfront.

## `React.lazy`, not React Router's `lazy` route field

React Router v6.4+'s data routers (`createBrowserRouter`, already in use
here) support a `lazy` property per route object as an alternative to
`React.lazy` + `Suspense` — it integrates with the router's own loading
state instead of a component-level boundary. This phase used plain
`React.lazy`/`Suspense` instead: every page component here is a *named*
export with no `loader`/`action` to colocate, so router-level `lazy`
would buy route-data integration this app doesn't use yet, at the cost
of every route needing its own `{ Component: ... }`-shaped wrapper
export. A single `Suspense` boundary around `AppShell`'s `<Outlet />`
gets the same code-splitting outcome with less restructuring — worth
revisiting if `loader`/`action` data-router features ever get adopted
project-wide, not before.

## `lib/lazy-import.ts` — one helper instead of ~24 inline `.then()`s

`React.lazy` requires the dynamically imported module's component to be
a *default* export; every page component in this CMS is a named export
(`export function CategoryListPage`, consistent with the rest of the
project — not changed just to fit `lazy`). Rather than repeat
`lazy(() => import('...').then(m => ({ default: m.X })))` by hand at
every one of `routes.tsx`'s ~24 feature-page lines, `lazyImport(factory,
name)` wraps that remapping once.

## What stayed eager

`LoginPage`, `ProtectedRoute`, and `AppShell` are still plain top-of-file
imports in `routes.tsx` — they're needed for the very first paint
(`/login` for anyone unauthenticated, `ProtectedRoute`+`AppShell` for
everyone else), so splitting them would just move the same bytes into a
chunk that downloads immediately regardless, buying nothing. Every
actual feature page — Dashboard through Media Library, list pages and
form pages alike, 24 in total — is lazy, including `DashboardPage`
itself: it's the default `/` route, but showing one route-transition
spinner right after login is consistent with what every other route in
this app now does, rather than the one page in the app that's special.

## The fallback UI

New `components/shared/route-fallback.tsx`, a centered `Spinner` (already
used elsewhere in this CMS — login button pending states, form submit
states) in a `min-h-[50vh]` box. `AppShell`'s `<Suspense>` wraps only its
`<Outlet />`, not the whole shell — the sidebar and topbar stay mounted
and interactive while a route chunk downloads, so navigating between two
already-visited pages (both already cached by the browser/Vite's dynamic
`import()`) shows no flash at all, and a genuinely new chunk shows a
spinner in the content area only, not a blank screen.

## What's deliberately staying out of this phase

- **React Router's `lazy` route field / data loaders** — as above, a
  bigger architectural adoption than this phase's scope, not a rejected
  idea.
- **Preloading on hover/focus** (e.g. prefetching a route's chunk when
  the user hovers its `NavLink` in the sidebar, before they click) — a
  real UX polish item, but a separate one from "split the bundle" itself;
  nothing today prefetches, every navigation pays the chunk's download
  cost on click.
- **`vite.config.ts` `manualChunks` tuning** — Vite already emits one
  chunk per dynamic `import()` by default; this phase didn't need to hand
  -configure chunk boundaries (e.g. grouping several small feature pages
  into one shared chunk) since nothing here suggested the default
  per-route split was wrong. Worth revisiting only if a future bundle
  analysis shows it should be.

## Verified

**Not verified against a real build**, same limitation as Phase 30: this
sandbox has no network egress (`registry.npmjs.org` returns
`host_not_allowed` from the egress proxy) and no `node_modules` exists
anywhere in the project, so there's no way to run `vite build` and
confirm the chunk split actually happens or that `tsc -b`/`eslint` pass.

What *was* checked by hand: every one of the ~24 `lazyImport(...)` calls
in `routes.tsx` was cross-checked against its target file's actual named
export (`grep`-verified, not assumed) to catch the one mistake this
pattern is prone to — a typo'd export name that `React.lazy` would only
surface as a runtime error on that route, not a build-time one, since
`lazyImport`'s `Record<string, T>` return type doesn't constrain `name`
to the module's actual keys. `lazyImport`'s generic signature was also
type-checked in isolation against a stub matching `React.lazy`'s real
type (`lazy<T>(factory: () => Promise<{ default: T }>): T`) and passes.
Neither check is a substitute for `vite build`.

`cms/package.json` needed no new dependencies for this phase — code
-splitting via dynamic `import()` is native to Vite/`React.lazy`, unlike
Phase 30's `@dnd-kit` addition. `cms/package-lock.json` is therefore
unaffected by this phase specifically, but still carries Phase 30's
un-installed `@dnd-kit` entries pending that `npm install`.

## Next (Phase 32 candidate)

Full open backlog, carried forward from Phase 30's notes (item 3
resolved this phase; item 1, the build-verification gap, still applies
to both Phase 30's and this phase's changes together — nothing else
touched):

1. **Verify Phases 30 and 31 against a real build** — run `npm install`
   in `cms/` (picks up both Phase 30's `@dnd-kit` packages and confirms
   nothing about Phase 31's lazy-loading needs a dependency this sandbox
   couldn't add), then `tsc -b` / `eslint` / `vite build`. Should be the
   first thing whichever phase runs next in an environment with network
   access does — two phases of unverified code is enough to stop
   deferring this.
2. **Shared types package** between backend/CMS/frontend — flagged since
   Phase 8, never fixed. Three independent `package.json`s, no root
   workspace; a repo-structure change, not a quick fix.
3. **Lazy-loading images** on the public frontend — flagged Phase 20.
   `ProductCard`/`ProjectCard`/gallery thumbnails still load eager; must
   exclude hero/LCP images. (Unrelated to this phase's route-chunk
   splitting — this item is `<img loading="lazy">` on the public site,
   not the CMS bundle.)
4. **`'contact'` banner placement** — Phase 26 left this out of its named
   scope (About/Projects/Blogs only); still a one-line addition matching
   the pattern there if it comes up.
5. **Reverse-proxy rewrite** for `sitemap.xml`/`robots.txt` — infra
   decision from Phase 25, not application code.
6. **Sitemap index/pagination** — not a real gap yet, just the
   ~50,000-URL threshold to watch.
7. **Category/Project structured data** — flagged Phase 27 as a natural
   follow-up now that the `useJsonLd` plumbing and `'entity'`-key
   precedent both exist.
8. **Gallery distinct-tags endpoint** — flagged Phase 28; a prerequisite
   for ever turning the tag *filter box* into a tag *chip list*.
9. **Custom icon-picker for the Homepage highlights editor** — flagged
   Phase 29; a nice-to-have (rendered icon preview per `<Select>` option)
   rather than a gap.
10. **Preload route chunks on sidebar link hover** — new this phase, see
    above; a polish item on top of the code-splitting this phase already
    did, not a gap in it.
11. **Website Builder / Dashboard refinement** — still completely
    unscoped across every phase since 13; needs a dedicated scoping pass
    before it's phase-sized work at all.
