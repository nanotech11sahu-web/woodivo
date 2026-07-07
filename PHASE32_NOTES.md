# Phase 32 — Build Verification (Backend, CMS, Frontend)

Top of the open backlog since Phase 31's notes, carried forward unchanged
from Phase 30 before that:

> **Verify Phases 30 and 31 against a real build** — run `npm install` in
> `cms/` ..., then `tsc -b` / `eslint` / `vite build`. Should be the first
> thing whichever phase runs next in an environment with network access
> does — two phases of unverified code is enough to stop deferring this.

This sandbox has npm registry egress (`registry.npmjs.org` is reachable),
unlike every environment the project was built in through Phase 31. This
phase used that access to actually install dependencies and build all
three apps — the first time that's happened anywhere in this project's
history — rather than deferring again.

## What was run, in each app

```
npm install
npx tsc -b            # or `-p tsconfig.build.json --noEmit` for backend
npx eslint .           # backend: eslint "{src,test}/**/*.ts"
npx vite build          # backend: npm run build (nest build)
```

## backend/ — 6 real lint failures found and fixed

`npm install` pulled 770 packages clean. `tsc` was clean on the first
try — every phase's types were already sound. `eslint` was not: 43
problems, 37 of them pure Prettier formatting (fixed with `--fix`,
touching 24 files, no behavior change in any of them) and 6 substantive:

- **`no-unsafe-enum-comparison`** in `all-exceptions.filter.ts` —
  `statusCode >= HttpStatus.INTERNAL_SERVER_ERROR` compared a plain
  `number` (any valid HTTP status, since `exception.getStatus()` isn't
  restricted to `HttpStatus` enum members) against an enum literal.
  Fixed with a module-level `SERVER_ERROR_THRESHOLD: number` constant so
  the comparison is number-to-number, with a comment explaining why the
  annotation is there (the assertion-vs-comparison lint pair fights
  itself here — an inline `as number` cast gets flagged as unnecessary
  by a *different* rule than the one that requires it be a number in the
  first place — so the fix has to be a typed constant, not a cast).
- **`no-unnecessary-type-assertion`**, same file — `(response as {
  message: unknown }).message` right after a `'message' in response`
  narrowing check. The `in` check already narrows `response` enough that
  TypeScript infers `.message` without the cast; removed it.
- **`require-await`** × 5 — every Mongoose `Schema.pre('save', async
  function () {...})` slug-generation hook (`BlogCategory`, `Blog`,
  `Project`, `Category`, `Product`) was `async` with no `await` inside.
  These are synchronous field mutations (`this.slug = slugify(...)`);
  Mongoose doesn't need the hook to return a promise unless it does async
  work, so `async` was just wrong here, not a stub for future work.
  Dropped `async` from all five; behavior is identical (synchronous
  hooks work exactly the same way in a `pre('save')` middleware chain).

After these fixes: `eslint` reports zero errors and zero warnings, `tsc`
is clean, and `nest build` (the actual `npm run build` script) completes
with no errors or warnings — not just `--noEmit`, the real build.

## cms/ — clean, and Phase 31's route-splitting is confirmed working

`npm install` pulled 237 packages (including Phase 30's `@dnd-kit`
packages, un-installed until now). `tsc -b`, `eslint` (3 pre-existing
`react-refresh/only-export-components` warnings, unrelated to this
phase, not errors), and `vite build` all pass. The build output has one
small chunk per lazy-loaded route (`faq-form-page`, `product-list-page`,
`blog-form-page`, etc. — roughly 50 separate chunk files) plus one large
shared `index-*.js` (619 kB) carrying React, React Query, `@dnd-kit`,
and every other vendor dependency. Phase 31's route-level code-splitting
is real and working as designed: no code changes were needed here, this
phase's job for `cms/` was purely to confirm it.

That 619 kB shared chunk is a separate, pre-existing thing from what
Phase 31 targeted (per-route feature code, not vendor code) — see "Next"
below.

## frontend/ — clean, and a size gap noted (not fixed)

`npm install` pulled 233 packages. `tsc -b`, `eslint` (2 pre-existing
warnings, same `react-refresh` rule, unrelated), and `vite build` all
pass with zero errors. Unlike `cms/`, `frontend/` has never had a
route-splitting pass — Phase 31 was scoped to `cms/` only, per its own
notes — so this build produces a single 569 kB JS bundle for the entire
public site. Not a regression from this phase and not fixed here (out of
this phase's verification scope, and a real feature-sized item — see
backlog item 3 below, which already covers image lazy-loading; route
splitting isn't currently on that list and should probably be added
alongside it next time frontend bundle size comes up).

## What this phase deliberately didn't do

- **No source changes in `cms/` or `frontend/`** — both were already
  clean; touching working code to "improve" it with no lint/build
  justification isn't this phase's job.
- **Did not chase the 619 kB CMS vendor chunk or 569 kB frontend
  bundle** — `vite build`'s size warning is a suggestion, not an error,
  and `manualChunks` tuning is exactly the kind of thing Phase 31's own
  notes said not to do without a real bundle-analysis reason. Flagging
  it as a backlog item is proportionate; doing speculative chunk surgery
  in the same phase that's meant to be pure verification is not.
- **Did not add tests** — `backend/test/app.e2e-spec.ts` exists but
  needs a live MongoDB connection this sandbox doesn't have; running it
  was out of scope (this phase verified static build correctness, not
  runtime behavior against a database).
- **Did not commit `node_modules` or `dist`** to the delivered project —
  installed locally to run the checks, excluded from the zip like every
  prior phase's delivery. `package-lock.json` in all three apps is
  unchanged by this phase (no dependency version was added or bumped;
  Phase 30's `@dnd-kit` lockfile entries were already correct, just
  previously unexercised by an actual install).

## Verified

Genuinely verified this time, not caveated: `npm install` +
`tsc`/`eslint`/build all green in `backend/`, `cms/`, and `frontend/`,
each checked independently in this sandbox. This closes the
build-verification gap Phase 30's notes opened and Phase 31 carried
forward — the first time in the project's history this has actually
been done rather than deferred.

## Next (Phase 33 candidate)

Full open backlog, carried forward from Phase 31's notes (item 1
resolved this phase; nothing else was touched):

1. **Shared types package** between backend/CMS/frontend — flagged
   since Phase 8, never fixed. Three independent `package.json`s, no
   root workspace; a repo-structure change, not a quick fix.
2. **Lazy-loading images** on the public frontend — flagged Phase 20.
   `ProductCard`/`ProjectCard`/gallery thumbnails still load eager; must
   exclude hero/LCP images.
3. **`'contact'` banner placement** — Phase 26 left this out of its
   named scope (About/Projects/Blogs only); still a one-line addition
   matching the pattern there if it comes up.
4. **Reverse-proxy rewrite** for `sitemap.xml`/`robots.txt` — infra
   decision from Phase 25, not application code.
5. **Sitemap index/pagination** — not a real gap yet, just the
   ~50,000-URL threshold to watch.
6. **Category/Project structured data** — flagged Phase 27 as a natural
   follow-up now that the `useJsonLd` plumbing and `'entity'`-key
   precedent both exist.
7. **Gallery distinct-tags endpoint** — flagged Phase 28; a prerequisite
   for ever turning the tag *filter box* into a tag *chip list*.
8. **Custom icon-picker for the Homepage highlights editor** — flagged
   Phase 29; a nice-to-have (rendered icon preview per `<Select>`
   option) rather than a gap.
9. **Preload route chunks on sidebar link hover** — flagged Phase 31; a
   polish item on top of that phase's code-splitting, not a gap in it.
10. **Frontend route/vendor code-splitting** — new this phase. The
    public site ships one 569 kB bundle; `cms/` got per-route splitting
    in Phase 31 but `frontend/` never has. Worth scoping alongside item
    2 (image lazy-loading) next time frontend performance comes up,
    since both are the same "public site loads too much upfront" gap.
11. **CMS vendor chunk size** — new this phase. Even with Phase 31's
    per-route splitting, `cms/`'s shared `index-*.js` is 619 kB
    (React/React Query/`@dnd-kit`/etc. all in one chunk). A
    `manualChunks` pass could split this further, but only worth it
    against a real bundle-analysis reason, not speculatively.
12. **Website Builder / Dashboard refinement** — still completely
    unscoped across every phase since 13; needs a dedicated scoping pass
    before it's phase-sized work at all.
