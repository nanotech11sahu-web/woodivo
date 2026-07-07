# Phase 22 — Public Frontend: Contact

Phase 21 built Blogs and named Contact first in its own "Next" section:
"its own enquiry form plus `googleMapEmbedUrl`... unread anywhere on the
public site still." This phase builds `/contact`. About and `<head>`/SEO
management remain out of scope, still explicitly deferred.

## Nothing new to build server-side — this phase is entirely "wire up what already exists"

Unlike every prior public-frontend phase, Contact needed no schema check,
no populate-bug hunt, no new backend field. `WebsiteSettings.contact`
(`backend/src/modules/settings/schemas/website-settings.schema.ts`) has
had `phone`, `whatsapp`, `email`, `address`, `city`, `state`, `pincode` and
`googleMapEmbedUrl` since Phase 7, all editable via the CMS's existing
Settings page since Phase 8, all returned in full by the already-public
`GET /settings` (`useSettings`, `staleTime: 15 * 60_000`, already fetched
on every page load for the header/footer). `EnquirySource` already had a
`'contact'` member — added in Phase 20 for a different reason (the
project-details CTA needed *some* value and `'category'`/`'homepage'`
were both wrong), but it happens to be exactly right here too. The only
things this phase actually adds are the page itself and one extraction.

## Contact info is read a third time, more fully each time — no fourth copy

`SiteHeader`, `SiteFooter` and `WhatsAppFloatButton` each already read a
different slice of `settings.contact` (footer: phone/email/address;
floating button: whatsapp only). None of them read `whatsapp` *and*
`phone` *and* `email` *and* the full address *and* `googleMapEmbedUrl`
together — this page is the first thing on the site that needs the whole
object at once, which is why it gets its own render logic (a conditional
`<li>` per field, same "only render what's set" pattern
`ProjectDetailsPage`'s details `<dl>` established in Phase 20) rather than
extracting a fourth shared component for a shape nothing else needs
in full.

## `SocialLinksRow` — extracted from `SiteFooter`, same move as every card before it

`SiteFooter` has had an inline `Object.keys(SOCIAL_ICONS).map(...)` block
since Phase 18. This page needs the identical icon row next to the
contact details. Pulled out to `components/shared/social-links.tsx` as
`SocialLinksRow` — same "pull it out once a second caller needs it" call
this project made for `ProductCard` (19), `ProjectCard`/`MediaGallery`
(20) and `BlogCard` (21). `SiteFooter` now imports this instead of its
own copy, with no visual change there.

One difference from those four: this component needed a `tone` prop
(`'dark' | 'light'`, defaulting to `'dark'`) that none of the earlier
extractions did. `ProductCard`/`ProjectCard`/`BlogCard`/`MediaGallery` all
render inside the same light-ivory page background everywhere they're
used. `SocialLinksRow`'s original home (`SiteFooter`) is the one
teak-deep-background context on the whole site, and this page's contact
column is ordinary ivory — reusing the footer's `border-ivory-deep/25
text-ivory-deep` styling unchanged here would render pale-on-pale and be
nearly invisible. `tone="light"` swaps in `border-border-warm
text-charcoal-soft`, matching this page's own palette; leaving `tone`
unset at the `SiteFooter` callsite keeps its exact original look.

Confirmed while extracting, not newly discovered: lucide-react has no
Pinterest icon, so `SocialLinks.pinterest` — present on the schema and the
CMS's settings form — still has nothing to render here, same as before
this phase. Not a gap this extraction introduced; a text link instead of
an icon would fix it, but nothing asked for one.

## Enquiry form embedded on the page, not opened via the dialog

Every other "Enquire" button on the site (`ProductDetailsPage`,
`ProjectDetailsPage`, `CategoryListingPage`, the hero, the header) opens
`EnquiryDialog` — a modal over whatever page the visitor was already on,
because the enquiry is incidental to why they're on that page. Contact is
different: the entire point of `/contact` *is* sending an enquiry, so
routing that through a second click to open a modal on top of the page
whose only content is that same form would be backwards. `EnquiryForm`
(`components/shared/enquiry-form.tsx`) already took `source` as a plain
prop from Phase 18, specifically so `EnquiryDialog` could pass it through
— nothing about the component is dialog-specific, it just hadn't been
rendered outside one yet. This is the first page that renders it directly,
inside a bordered card next to the contact details rather than inside
`<dialog>`. `EnquiryDialog` itself is untouched — a visitor can still open
the popup version from anywhere else on the site, including from `/contact`
via the header's own "Enquire Now", and both write through the same
`useCreateEnquiry` mutation with `source: 'contact'` either way.

## Google Maps embed — trusted as a `src`, not validated

`googleMapEmbedUrl` is a free-text field in the CMS
(`cms/src/features/settings/settings-page.tsx`, placeholder
`https://www.google.com/maps/embed?...`) with no format validation beyond
`@IsString()` on the backend DTO. Rendered as a plain `<iframe src={...}>`
— same trust level the CMS operator already has over every other
settings field (logo URL, social links, banner images), not something
this phase adds new exposure for. No validation that the string is
actually a Google embed URL and not something else; that's a CMS-side
input-validation question, out of scope for a page that only reads
`GET /settings`.

## Hero banner: considered `useBanners('contact')`, didn't use it

`BannerPlacement` (`types/banner.ts`) includes `'contact'` as a valid
placement — Banner Management has supported it since Phase 7. This page's
hero is still the same static teak-deep block every other interior page
uses (`ProjectListingPage`, `GalleryPage`, `BlogListingPage`), not a
`useBanners('contact')` fetch. `CategoryListingPage` is the one page that
does show a CMS-sourced hero image, but that's `Category.banner` — a
field on the category document itself, not the separate Banner Management
module — a different mechanism this page has no equivalent entity for.
Wiring up placement-based banners for Contact (and, by the same logic,
About/Projects/Blog, all valid `BannerPlacement` values nothing on the
site reads yet) is a real gap, but a site-wide one bigger than this one
page — noted here rather than solved halfway by wiring only `contact`.

## What's deliberately not in this phase

- **About** — the one remaining page from the master prompt's list, still
  `ComingSoonPage`. Unlike Contact, it has no existing schema to draw
  from (no `AboutPage` document, nothing on `WebsiteSettings`) — Phase 21
  already flagged it needs its own CMS-editable content block, which is
  real backend + CMS work, not just a frontend read of data that already
  exists.
- **`<head>` / SEO management** — flagged by Phases 18 through 21, flagged
  a fifth time here. `Contact` has no `seo` field on `WebsiteSettings` to
  begin with (unlike `Category`/`Product`/`Project`/`Blog`, which all
  embed one and still go unread by `<head>`), so this page's
  `useDocumentTitle('Contact Us')` is a hardcoded string, same as
  `ProjectListingPage`, `GalleryPage` and `BlogListingPage` before it —
  consistent with those, not a new gap specific to this page.
- **Banner-placement wiring for `contact`/`about`/`projects`/`blog`** — see
  above; a real but site-wide gap, not solved for one placement in
  isolation here.
- **Client-side map-URL validation** — see above; a CMS input-validation
  concern, not something the public read side changes.
