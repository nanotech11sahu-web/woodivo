# Phase — Fallback defaults when CMS hasn't set related products / blogs / FAQs

Only one file actually needed logic changes: `products.service.ts`. Since
the CMS pickers/editor already existed from the previous phase, the only
missing piece was: what does the product page show when an editor hasn't
touched those fields yet? Now:

## Behavior (all in `ProductsService.findBySlugPublic`)

| Field | If CMS has set it | If CMS left it empty |
|---|---|---|
| **Similar products** | Exactly what's picked in CMS (active only) | Other **active products in the same category**, up to 8, ordered by `displayOrder` |
| **Related blog posts** | Exactly what's picked in CMS (published only) | The **3 most recently published** blog posts (`publishAt` desc, falling back to `createdAt` for posts without a scheduled publish date) |
| **FAQs** | Exactly what's entered in CMS | A **generic, product-agnostic FAQ set** (5 Q&As covering wood/material, customization, delivery, warranty, and care) — defined once as `DEFAULT_PRODUCT_FAQS` in `products.service.ts`, not persisted to any product's document |

Important: these are **either/or, never merged**. The moment a CMS editor
adds even a single item to any of the three fields, that field switches
fully to the CMS picks — the fallback only fires when the field is
genuinely empty (accounting for `populate({ match })` leaving `null`
placeholders for refs that no longer match, e.g. a related product that
went inactive — those are filtered out before the "is it empty" check).

Nothing is written back to the database — the fallback data is computed
fresh on every request in `findBySlugPublic` and merged into the response
object only, so:
- it always reflects live category/blog data (not stale at read time)
- CMS editors still see the *actual* saved value (empty) when editing —
  `findByIdAdmin` (used by the CMS form) is untouched, so the "leave empty
  for automatic fallback" note added to the CMS cards stays accurate.

## Also added
Small helper text under each of the three CMS cards (Related products /
Related blog posts / FAQs) explaining the fallback so it's discoverable
without reading code:
> "Optional — leave empty and the product page automatically shows [X] instead."

## Files changed
- `backend/src/modules/products/products.service.ts` — fallback logic + `DEFAULT_PRODUCT_FAQS`
- `cms/src/features/products/product-form-page.tsx` — helper text only

## Verified
- `tsc --noEmit` and `nest build` — clean.
- `tsc -b` and `vite build` for CMS — clean.

## Note
`findBySlugPublic`'s return type changed from `ProductDocument` to a plain
`Record<string, unknown>` (it now returns a `.toObject()` with computed
fields merged in, not a live Mongoose document) — this method is only ever
called from the public products controller, which just passes the result
straight through as JSON, so nothing else needed updating.
