# Phase 23 — Public Frontend: About

Phase 21 and 22 both named About the one remaining page from the master
prompt's list still on `ComingSoonPage`, and both flagged the same reason
it kept getting deferred: unlike Contact, which read `WebsiteSettings.contact`
— a field that had existed since Phase 7 — About had no schema to draw from
at all. This phase adds that schema, a CMS editor for it, and the page.

## New module, not a bolt-on to Settings

`WebsiteSettings` already holds `footer.aboutText` (a short blurb used in
the footer, added Phase 7) — tempting to extend, but the actual About page
needs a hero, a story, mission/vision text, a values list, a milestones
timeline and a team roster, none of which belong on a "site settings"
document conceptually or size-wise (`storyContent` alone allows up to 4000
chars). Built as its own singleton instead: `backend/src/modules/about`,
same `key`-based upsert pattern as `WebsiteSettings`
(`ABOUT_PAGE_SINGLETON_KEY`, `findOneAndUpdate` with `upsert: true` on both
`get()` and `update()`) — one document, lazily created on first read so the
public `GET /about` returns a sensible empty shape instead of a 404 before
the CMS operator has touched anything.

## Three embedded arrays, no `displayOrder` field

`values`, `milestones` and `teamMembers` are plain embedded sub-schemas
(`_id: false`, same as `SpecificationItem` on `Product`). None of them got
a separate `displayOrder` field — array position *is* display order, the
same choice `ProductSchema.specifications` already made. The CMS editors
(`values-editor.tsx`, `milestones-editor.tsx`, `team-members-editor.tsx`)
are `useFieldArray` + append/remove, identical shape to
`specifications-editor.tsx`; reordering means removing and re-adding in the
right order, not a drag handle — consistent with the one existing precedent
for an array-editing form in this CMS, not a new capability invented for
this phase.

## Team photos live outside the validated form

`values` and `milestones` are plain text and validate cleanly through
`aboutFormSchema`. `teamMembers` needed a `photo` (an uploaded `MediaAsset`)
per row, which isn't a text input — same reason `logo`/`favicon` sit outside
`settingsFormSchema` in the Settings page, tracked as separate `useState`
instead. Extended to an array here: `AboutPageEditor` holds
`teamPhotos: (MediaAsset | undefined)[]`, index-aligned with the
`teamMembers` field array, passed down to `TeamMembersEditor` along with a
setter. `append`/`remove` in that component touch both arrays together —
without that, removing row 2 would leave row 3's photo sitting at index 2
after the text fields shifted up.

## `MediaFolder.ABOUT` and `EnquirySource.ABOUT` — two new enum members

`MediaFolder` (`backend/src/common/constants/app.constants.ts`) gets
`ABOUT = 'about'` for hero/story/team-photo uploads — every other content
module already has its own folder, About had none. `EnquirySource` gets
`ABOUT = 'about'` for the same reason Phase 20 added `CONTACT`: the page's
CTA needed *some* value, and reusing `'homepage'` would misattribute every
enquiry submitted from About to the actual homepage. Both mirrored on the
frontend (`cms/src/types/common.ts`, `frontend/src/types/enquiry.ts`) by
hand, same as every other enum kept in sync across the three apps.

## `CtaSection` extracted to shared — second caller, same move as before

`pages/home/sections/cta-section.tsx` had hardcoded "Have something in
mind?" copy and `source: 'homepage'` — fine when Home was its only caller.
About's CTA needed the identical block (same background, same button, same
`JaliDivider`) with its own copy and `source: 'about'`. Moved to
`components/shared/cta-section.tsx` with `title`/`text`/`source`/
`buttonLabel` props, each defaulting to the original hardcoded values —
`HomePage`'s own usage (`<CtaSection />`, no props) is pixel-identical to
before. Same "pull it out once a second caller needs it" call this project
made for `ProductCard` (Phase 19), `ProjectCard`/`MediaGallery` (Phase 20),
`BlogCard` (Phase 21) and `SocialLinksRow` (Phase 22). About's own CTA
passes `about.ctaTitle`/`about.ctaText` when the CMS operator has set them,
falling back to the shared defaults otherwise — the "leave blank to use the
site's default copy" note on the CMS's own CTA card.

## Hero image, not a banner-placement fetch

`AboutPage.heroImage` is a field on the About document itself, uploaded
through the same page's editor — not `useBanners('about')`. `BannerPlacement`
has included `'about'` as a valid value since Phase 7, and Phase 22 explicitly
considered wiring it up for Contact, decided it was a real gap but a
site-wide one (`about`, `projects`, `blog` all sit unused the same way),
and deferred it rather than half-solving one page. Still deferred here for
the same reason — About's hero uses its own dedicated field instead, the
same relationship `Category.banner` has to its listing page, not the
separate Banner Management module.

## What's deliberately not in this phase

- **Banner-placement wiring for `about`/`projects`/`blog`** — flagged by
  Phase 22, flagged again here. Still a real, still a site-wide gap, still
  not solved for one placement in isolation.
- **`<head>` / SEO management** — flagged by Phases 18 through 22, flagged
  a sixth time here. `AboutPage` has no `seo` field, so `useDocumentTitle('About
  Us')` is a hardcoded string, consistent with every other page before it.
- **Reordering values/milestones/team members via drag-and-drop** — the CMS
  editors match the one existing array-editing precedent
  (`specifications-editor.tsx`): add, remove, no reorder. A real
  improvement, but a bigger one than this phase's array editors need to
  solve, and not something any existing array editor in this CMS does yet.
- **Rich text for `storyContent`** — authored as a plain `<Textarea>`,
  rendered with the same blank-line-as-paragraph-break split
  `BlogDetailsPage.content` uses (Phase 21), not a markup renderer. Same
  "no HTML to sanitize" reasoning that page already established.

## Verified

`tsc -b` passes clean on `frontend`, `cms` and `backend` (`nest build`)
after these changes — no leftover references to `ComingSoonPage` on the
`/about` route, no unresolved imports from the `CtaSection` move.
