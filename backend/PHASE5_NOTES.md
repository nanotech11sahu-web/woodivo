# Phase 5 — Media Uploads + Products Module (CMS + Public API)

Builds on Phase 4 (Categories). Two things, because Products can't really be
tested/used from the CMS without a way to get images onto them first.

## 1. Media module — real upload endpoints

Cloudinary was only *configured* before (connection provider only, no way to
actually send it a file). Now wired up:

- `media.service.ts` — `uploadImage`, `uploadImages`, `deleteImage`, all
  streaming through Cloudinary's `upload_stream` (no temp files on disk —
  multer uses `memoryStorage()`)
- `media.controller.ts` (`/admin/media`, protected, any CMS role):
  - `POST /admin/media/upload` — single file (`file` field) + `folder` +
    optional `alt`, returns a `MediaAsset`-shaped object
  - `POST /admin/media/upload-multiple` — up to 10 files (`files` field), same
    `folder`, returns `MediaAsset[]`
  - `POST /admin/media/delete` — body `{ publicId }` (kept out of the URL path
    since Cloudinary public IDs contain slashes)
- Uploads are folder-namespaced under `woodivo/<folder>` in Cloudinary, where
  `folder` is a whitelisted `MediaFolder` enum (`categories`, `products`,
  `projects`, `gallery`, `blogs`, `banners`, `testimonials`, `settings`, `misc`)
  — CMS just sends the enum value, not a free-text path
- 5MB size limit, JPEG/PNG/WebP/AVIF only, enforced by multer's `fileFilter`
  before anything reaches Cloudinary

Added `@types/multer` as a dev dependency (wasn't previously installed;
`Express.Multer.File` has no types without it).

## 2. Products module — same CRUD pattern as Categories, plus relations

- `products.service.ts`:
  - `create` / `update` validate the referenced `category` actually exists
    (400 if not) and resolve it to an ObjectId
  - `relatedProducts` ids are validated to exist and a product can't relate
    to itself
  - Admin list: paginated, filtered by `status` / `isFeatured` / `category`,
    text search via the existing `$text` index on name+description
  - Public list (`GET /products`): active only, filterable by category
    **slug** (not id — the public site only knows slugs) and `featured`;
    unknown category slug returns an empty page rather than a 404, since
    that's a client bug, not a "product not found"
  - Public detail (`GET /products/:slug`): populates `category` and
    `relatedProducts` (related products additionally filtered to
    `status: active` inside the populate `match`, so a de-published related
    product silently drops off rather than 404ing the whole page)
  - Delete pulls the product out of any other product's `relatedProducts`
    array first, so you never end up with a dangling reference
- Controllers follow the exact same split as Categories: public
  `products.controller.ts` (`@Public()`) + `products.admin.controller.ts`
  (`/admin/products`, editor can read, admin/super_admin can write)

**Module wiring note:** `ProductsModule` registers the `Category` schema
directly via `MongooseModule.forFeature` rather than importing
`CategoriesModule`, because `CategoriesModule` already imports
`ProductsModule` (for its own delete-guard check against orphaned products).
Importing each other would be circular. Registering the same schema in two
modules' `forFeature` calls is safe — Nest/Mongoose only compiles a model
once per connection per name.

## Verified

- `npx tsc --noEmit` — clean
- `npm run build` — clean
- `npx eslint` on all new/changed files — clean (two pre-existing
  `require-await` warnings in the Phase 2 schema files are untouched and
  unrelated to this phase)
- **Not verified in-sandbox:** an actual DB-connected boot (`npm run
  start:dev`) — no local `mongod` or network access to a Mongo instance is
  available in this environment. The DI graph was checked by hand for
  circular imports and confirmed via `nest build`, which does resolve the
  full module/provider graph at compile time, but that doesn't fully replace
  a live boot test. Recommend running `npm run start:dev` against a real
  `MONGODB_URI` before deploying.

## Next (Phase 6 candidate)

Enquiry system — the one feature that's actually revenue-critical per the
master prompt ("Enquire Now" / "Get Quote" on every page): public
`POST /enquiries` (name, mobile, city, category, message), save to Mongo,
Nodemailer admin notification (transporter provider already exists, unused),
plus the CMS-side `/admin/enquiries` list + status/notes for follow-up.
