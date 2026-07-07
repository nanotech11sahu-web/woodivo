# Phase 30 — Drag-and-Drop Reorder on CMS Array Editors

Top item on the open backlog since Phase 23 first flagged it (and every
phase's notes since — 24 through 29 — carried it forward unchanged):

> **Drag-and-drop reorder** on CMS array editors — flagged Phase 23. No
> drag library installed yet; `@dnd-kit/core` + `@dnd-kit/sortable` is the
> natural choice.

This phase adds `@dnd-kit` to `cms/package.json` and rewrites all five
array editors the backlog item named — `specifications-editor.tsx`
(products), `values-editor.tsx`, `milestones-editor.tsx`,
`team-members-editor.tsx` (about), and `homepage-highlights-editor.tsx`
(settings, Phase 29's own up/down-button editor) — to drag handles.

## One shared primitive, not five separate `@dnd-kit` setups

New `cms/src/components/shared/sortable-list.tsx`:

- **`SortableList`** — a thin `DndContext` + `SortableContext` wrapper.
  Takes `ids` (each row's RHF `field.id`, not `index` — `field.id` is
  stable across reorders, `index` isn't) and an `onReorder(oldIndex,
  newIndex)` callback. It doesn't touch form state itself; every editor
  already has its own `move()` from its own `useFieldArray` call (Phase
  29's `homepage-highlights-editor.tsx` was already calling it, just from
  up/down buttons instead of a drag event), so `SortableList` only has to
  report which two indexes swapped.
- **`useSortableRow(id)`** — a hook, not a wrapping row component. The
  five editors' row markup differs too much (an icon `<Select>` in one,
  an `ImageUploader` in another, a two-column year/title split in a
  third) for one row component to own layout across all of them. Each
  editor spreads the returned `setNodeRef`/`style` onto its own existing
  row `<div>` and renders the new `DragHandle` component wherever its
  layout wants the grip.
- **`DragHandle`** — the grip icon (`lucide-react`'s `GripVertical`),
  taking the `dragHandleProps` `useSortableRow` returns.

Pointer sensor (4px activation distance, so a click on an input inside
the row doesn't start a drag) plus a keyboard sensor
(`sortableKeyboardCoordinates` — space to pick up, arrow keys to move,
space to drop) — `@dnd-kit`'s built-in accessible fallback, not extra
work this phase did on top of the library.

## Per-editor changes

Four editors (`values`, `milestones`, `specifications`,
`team-members`) went from a plain `.map()` over `fields` to
`<SortableList ids={...} onReorder={...}>` wrapping a per-row
`*Row` component that calls `useSortableRow` and renders `<DragHandle
{...dragHandleProps} />` before its existing content — no other markup
changed, and the `{ control, register }` props each editor takes from
its parent page are unchanged, so `product-form-page.tsx` and
`about-page.tsx` needed no edits.

`homepage-highlights-editor.tsx` is the one editor that already had
*some* reorder UI: Phase 29 gave it up/down buttons because no drag
library existed yet at the time. Those buttons (`ArrowUp`/`ArrowDown`
imports, the `flex flex-col` button stack) are removed; the row now
carries a `DragHandle` like every other editor, and the `disabled` /
`index === 0` / `index === fields.length - 1` bookkeeping the buttons
needed goes with them — `SortableList` doesn't need per-row "is this the
first/last row" state.

`team-members-editor.tsx` needed one extra piece the other four didn't:
`photos` is a parent-held array, index-aligned with the `teamMembers`
field array but outside RHF entirely (an uploaded `MediaAsset`, tracked
the same way `logo`/`favicon` are on the Settings page — see Phase 23's
notes). `move()` from `useFieldArray` only reorders `teamMembers`, so a
new `handleReorder(oldIndex, newIndex)` does the matching splice on
`photos` and calls `onPhotosChange`, the same "touch both arrays
together" pattern `handleAppend`/`handleRemove` already used for
append/remove.

## Visual treatment while dragging

Every row gets `bg-card` (previously several rows had no explicit
background, relying on the page's own `Card` wrapper) plus, conditionally
on `isDragging`, `z-10 opacity-90 shadow-lg` — a dragged row needs to sit
visually above its neighbours and read as "lifted," which an unstyled
`transform`-only move doesn't convey on its own.

## What's deliberately staying out of this phase

- **Cross-editor list virtualization or animation libraries beyond
  `@dnd-kit`** — none of these arrays run past a few dozen rows
  (`homepage.whyWoodivoPoints` is capped at 12), so `@dnd-kit`'s default
  reorder animation is enough; no need for anything heavier.
- **A sixth editor** — the backlog item named exactly five
  (`specifications`, `values`, `milestones`, `team-members`,
  `homepage-highlights`); no other array-editing form exists in this CMS
  today.
- **Touch-specific tuning beyond the default `PointerSensor`** — `@dnd-kit`'s
  `PointerSensor` already handles touch as well as mouse; nothing in this
  phase's rows (no nested horizontal-scroll areas, no long lists needing
  a touch-scroll vs. drag disambiguation beyond the 4px activation
  distance) needed a `TouchSensor` on top of it.

## Verified

**Not verified against a real build.** Every prior phase's notes end with
a `tsc -b` / `eslint` / `vite build` line; this one can't, honestly —
this session's sandbox has no network egress (`host_not_allowed` from the
egress proxy on `registry.npmjs.org`), no `node_modules` exists anywhere
in the extracted project, and there's no way to fetch `@dnd-kit` to
actually type-check against it. `@dnd-kit`'s public API (`DndContext`,
`SortableContext`, `useSortable`, `arrayMove`-style index reporting via
`DragEndEvent.active.id`/`over.id`, `CSS.Transform.toString`) was used
exactly as documented and mirrors the shape every `@dnd-kit` sortable-list
example uses, and the five editors' `register`/`control` prop signatures
were deliberately left untouched so no caller (`product-form-page.tsx`,
`about-page.tsx`, `settings-page.tsx`) needed edits — but that's manual
review, not a green build.

`cms/package-lock.json` was **not** regenerated (same network
limitation) — it still reflects Phase 29's dependency set. Run `npm
install` in `cms/` before building; that will update the lockfile with
`@dnd-kit/core`, `@dnd-kit/sortable`, and `@dnd-kit/utilities` and their
transitive dependencies. Until that's run and a real `tsc -b`/`vite
build` pass happens, treat this phase's code as unverified — the next
phase (or the first local `npm install`) should confirm it before
anything else gets layered on top.

## Next (Phase 31 candidate)

Full open backlog, carried forward from Phase 29's notes (item 1 resolved
this phase — pending the verification caveat above — nothing else
touched):

1. **Verify Phase 30 against a real build** — run `npm install` in
   `cms/`, then `tsc -b` / `eslint` / `vite build`, now that `@dnd-kit` is
   declared in `package.json` but never installed or type-checked in this
   sandbox. Should be the very first thing the next phase does, before
   any new feature work.
2. **Shared types package** between backend/CMS/frontend — flagged since
   Phase 8, never fixed. Three independent `package.json`s, no root
   workspace; a repo-structure change, not a quick fix.
3. **Route-based code-splitting** for the CMS bundle — flagged every CMS
   phase since 8. `cms/src/routes.tsx` still imports every feature page
   eagerly (787kB minified as of Phase 29's build).
4. **Lazy-loading images** on the public frontend — flagged Phase 20.
   `ProductCard`/`ProjectCard`/gallery thumbnails still load eager; must
   exclude hero/LCP images.
5. **`'contact'` banner placement** — Phase 26 left this out of its named
   scope (About/Projects/Blogs only); still a one-line addition matching
   the pattern there if it comes up.
6. **Reverse-proxy rewrite** for `sitemap.xml`/`robots.txt` — infra
   decision from Phase 25, not application code.
7. **Sitemap index/pagination** — not a real gap yet, just the
   ~50,000-URL threshold to watch.
8. **Category/Project structured data** — flagged Phase 27 as a natural
   follow-up now that the `useJsonLd` plumbing and `'entity'`-key
   precedent both exist.
9. **Gallery distinct-tags endpoint** — flagged Phase 28; a prerequisite
   for ever turning the tag *filter box* into a tag *chip list*.
10. **Custom icon-picker for the Homepage highlights editor** — flagged
    Phase 29; a nice-to-have (rendered icon preview per `<Select>` option)
    rather than a gap.
11. **Website Builder / Dashboard refinement** — still completely
    unscoped across every phase since 13; needs a dedicated scoping pass
    before it's phase-sized work at all.
