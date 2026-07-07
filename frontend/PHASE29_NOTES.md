# Phase 29 — Homepage Content Module (`WhyWoodivoSection`)

Phase 28's notes named this the top item on the open backlog, unchanged
since it was first flagged Phase 18:

> **Homepage content module** — flagged Phase 18. Needs a new backend
> module (or a `WebsiteSettings` sub-document), a CMS array editor, and a
> frontend rewrite of `why-woodivo-section.tsx` off its hardcoded
> `POINTS` array.

This phase took the parenthetical option — a `WebsiteSettings`
sub-document, not a new top-level module/collection — for the same reason
`AboutPage`/`Banner` placements and `seo` fields have all landed as
fields on an existing schema rather than new modules in earlier phases:
`WhyWoodivoSection` is exactly one homepage section, there's no per-item
identity, ordering, or independent lifecycle a dedicated collection would
buy that an embedded array doesn't already give for free, and
`WebsiteSettings` is already the "homepage-adjacent singleton content"
home for `seo`, `footer`, `socialLinks`, etc.

## Backend — `WebsiteSettings.homepage.whyWoodivoPoints`

`website-settings.schema.ts` gets two new `{ _id: false }` sub-schemas,
`HomepageHighlight` (`icon` / `title` / `description`) and
`HomepageSettings` (currently just `whyWoodivoPoints: HomepageHighlight[]`,
named for future homepage fields rather than one specific to this
section), plus a new `HomepageHighlightIcon` enum with twelve values. The
array shape mirrors `SpecificationItem` (`common/schemas`) — an embedded,
`_id`-less array, ordered by position rather than a `displayOrder` field,
since there's no separate collection/endpoint to sort against.

`icon` is a fixed enum, not a free-text string. `whyWoodivoPoints` items
end up rendered by the frontend as a `lucide-react` icon component —
trusting an arbitrary CMS-entered string as a dynamic lookup key would be
both a fragile UX (a typo silently renders no icon, no validation
feedback anywhere) and an unnecessary indirection for a value written
straight into Mongo. `IsEnum(HomepageHighlightIcon)` on the DTO
(`homepage-settings.dto.ts`, new file, mirrors
`common/dto/specification-item.dto.ts`'s shape) rejects anything outside
the twelve values before it's ever saved.

No controller changes. `GET /settings` (public) and `GET /admin/settings`
both already return the full singleton document; `PATCH /admin/settings`
already does a blanket `$set: dto`. Adding `homepage` to
`UpdateWebsiteSettingsDto` (one `@ValidateNested()` block, same pattern
as `footer`/`contact`/`socialLinks`) was the only wiring this phase's
backend side needed.

## CMS — Settings > Homepage card

New `features/settings/homepage-highlights-editor.tsx`: a `useFieldArray`
list, one card per row, same append/remove shape `about/values-editor.tsx`
established — plus two differences that entry didn't need:

1. **An icon `<Select>` per row** — `HOMEPAGE_HIGHLIGHT_ICON_OPTIONS`
   (new `lib/homepage-icons.ts`), a value/label list mirroring the
   backend's enum by hand (no shared-types package between backend/CMS/
   frontend yet — flagged since Phase 8, still open). Labels describe
   what each icon reads as ("Tree — timber / material") since the CMS
   itself never renders the icon, only the value it's saving.
2. **Up/down move buttons**, not a `displayOrder` value any row edits —
   this array has no order field of its own; array position *is* the
   order, so reordering is a `move(index, index ± 1)` swap. No
   drag-and-drop library is installed anywhere in this project yet
   (flagged Phase 23, a separate backlog item this phase didn't touch);
   plain buttons are the honest option until `@dnd-kit` (or similar)
   gets added project-wide rather than bolted on for just this one
   editor.

`settings-form-schema.ts` gets a `homepage.whyWoodivoPoints` array field
— `icon: z.enum(iconValues)` built from the same
`HOMEPAGE_HIGHLIGHT_ICON_OPTIONS` list the `<Select>` renders from, so the
two can't drift out of sync within the CMS app itself, plus
title/description with the same 80/200-char caps as the schema's
`maxlength`. `settings-page.tsx` wires it in: `control` added to the
existing `useForm()` destructure (the only other field on this page
needing `useFieldArray` wiring), a "Homepage" `Card` placed between
Footer and Tracking, `reset()` seeded from
`settings.homepage?.whyWoodivoPoints ?? []`, and the submit payload
passes `values.homepage.whyWoodivoPoints` straight through — no
`orUndefined` transform needed since it's an array, not an optional
string.

## Frontend — `WhyWoodivoSection` rewrite

The hardcoded `POINTS` array is now `DEFAULT_POINTS`, used only as a
fallback: `settings?.homepage?.whyWoodivoPoints?.length ? ... :
DEFAULT_POINTS`. Same "hardcoded value survives as the pre-Settings-visit
fallback" precedent `home-page.tsx`'s `seo` handling and
`about-page.tsx`'s SEO card both already established — a fresh install
shows the original four points unchanged until a CMS operator visits
Settings > Homepage, and clearing the array back to empty reverts to them
too rather than rendering nothing.

The section calls `useSettings()` itself rather than having `HomePage`
pass settings down as a prop — same self-contained-section pattern every
other homepage section already follows (`FaqsSection` fetches its own
FAQs, `TestimonialsSection` its own testimonials). `useSettings()` is
already called by `HomePage` itself (for `seo`) and by the header/footer/
WhatsApp float button, so this is a cache hit via React Query's shared
query key (`['public-settings']`, 15-minute `staleTime`), not a second
network request.

New `lib/homepage-icons.ts`: an explicit `Record<HomepageHighlightIcon,
LucideIcon>` map, the frontend's counterpart to the CMS's option list —
kept as a small, reviewable table specifically so no code path ever does
a string-indexed lookup into `lucide-react`'s full export surface using
CMS-entered (if server-validated) data.

`types/settings.ts` (both CMS and frontend copies) gets the matching
`HomepageHighlightIcon` string union and `HomepageHighlight`/
`HomepageSettings` interfaces, by hand in both places — same duplication
every other type in these files already accepts as the cost of no shared
package.

## What's deliberately staying out of this phase

- **Drag-and-drop reorder** — as above, a separate backlog item (Phase
  23) covering four other CMS array editors too; adding a library for
  one new editor here would pre-empt that scoping pass rather than
  inform it.
- **A second homepage-content field** — `HomepageSettings` is
  structured to hold more than `whyWoodivoPoints` (hence the wrapper
  sub-schema rather than a bare array field on `WebsiteSettings`
  directly), but nothing else on the master prompt's homepage-sections
  list is hardcoded content the way "Why Woodivo" was — Featured
  Categories/Products, Projects, Testimonials, Blogs and FAQs already
  pull from their own real collections.
- **Per-highlight icon preview in the CMS** — the `<Select>` shows text
  labels, not a rendered icon next to each option; native `<select>`
  options can't render arbitrary JSX. A custom dropdown component would
  fix that but is a bigger change than this phase's scope for a
  "nice-to-have" preview, not a validation or data-integrity gap.

## Verified

`tsc -b` and `eslint` clean across `backend`, `cms`, and `frontend`
(whole-project run, not just touched files — this phase edits a shared
schema plus type files two apps depend on). `vite build` succeeds for
both `cms` and `frontend`. `nest build` succeeds for `backend`. Manually
traced: `WebsiteSettings.homepage` defaults to `{ whyWoodivoPoints: [] }`
on a fresh singleton document (same `default: {}` pattern every other
sub-schema on this model uses); `WhyWoodivoSection` renders
`DEFAULT_POINTS` when that array is empty and switches to CMS-entered
points the moment the array has at least one entry; the CMS editor's
up/down buttons correctly disable at the first/last row; removing every
highlight in the CMS and saving round-trips back to the frontend showing
`DEFAULT_POINTS` again rather than an empty section.

## Next (Phase 30 candidate)

Full open backlog, carried forward from Phase 28's notes (item 1
resolved this phase, nothing else touched):

1. **Drag-and-drop reorder** on CMS array editors
   (`specifications-editor.tsx`, `values-editor.tsx`,
   `milestones-editor.tsx`, `team-members-editor.tsx`, and now
   `homepage-highlights-editor.tsx` — five candidates as of this phase)
   — flagged Phase 23. No drag library installed yet; `@dnd-kit/core` +
   `@dnd-kit/sortable` is the natural choice.
2. **Shared types package** between backend/CMS/frontend — flagged since
   Phase 8, never fixed. Three independent `package.json`s, no root
   workspace; a repo-structure change, not a quick fix. This phase is
   the fourth to hand-duplicate a type across all three apps
   (`HomepageHighlightIcon`/`HomepageHighlight`/`HomepageSettings`,
   after `SeoMeta`, `MediaAsset`, and the various category-ref shapes)
   — the backlog item keeps getting more expensive to defer, not less.
3. **Route-based code-splitting** for the CMS bundle — flagged every CMS
   phase since 8. `cms/src/routes.tsx` still imports every feature page
   eagerly. (The CMS bundle crossed the 500kB chunk-size warning
   threshold building this phase — 787kB minified — for the first time
   since this warning started appearing; still not urgent, but worth
   noting as the trigger the phase notes have been watching for.)
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
10. **Custom icon-picker for the Homepage highlights editor** — new this
    phase, see above; a nice-to-have (rendered icon preview per option)
    rather than a gap, since native `<select>` can't show it today.
11. **Website Builder / Dashboard refinement** — still completely
    unscoped across every phase since 13; needs a dedicated scoping pass
    before it's phase-sized work at all.
