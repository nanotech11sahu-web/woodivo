# Phase 35 — Demo Data Seeder

Directly requested: a seeder that populates dummy categories, products,
blogs, and "all places" with placeholder content, so the site doesn't
look empty before real content is entered.

## What was added

**`backend/src/database/seeders/demo-data.seed.ts`** — a standalone
script (`npm run seed:demo`), separate from `seeder.service.ts` (the
existing super-admin seed that already runs on every boot). Deliberately
**not** wired into `onApplicationBootstrap` — inserting a few dozen fake
products and blog posts into a live production database on every deploy
would be actively harmful, not a harmless idempotent no-op the way
re-confirming the super-admin account is. This is opt-in, run once,
whenever you want it.

Populates every content type the person asked about ("blog product and
all"):

| Content type | Count | Notes |
|---|---|---|
| Categories | 6 | Dining Tables, Coffee Tables, Wardrobes, Bookshelves, Outdoor Furniture, Custom Cabinetry |
| Products | 16 | 2–3 per category, each with 2 images, specs, some marked featured |
| Blog categories | 3 | Craftsmanship, Care & Maintenance, Design Trends |
| Blog posts | 6 | 2 per category, real multi-paragraph content (not lorem ipsum), published + dated across recent weeks |
| Projects | 6 | Spread across Indian cities, linked to categories |
| Gallery items | 12 | Varied tags for the existing tag-filter feature |
| Testimonials | 5 | With ratings, 3 marked featured |
| Banners | 7 | One per `BannerPlacement` enum value — hero, category, product, blog, projects, about, contact |
| FAQs | 8 | Grouped: General, Ordering, Shipping & Delivery, Care |
| About page | 1 (singleton) | Hero, story, mission/vision, values, milestones, team members, CTA — every field the schema has |
| Website settings | 1 (singleton) | Site name, tagline, contact info, social links, footer, homepage highlights |

## Design decisions worth calling out

**Idempotent per collection, not per script run.** Each content type
checks its own `countDocuments()` before inserting anything and skips if
that collection already has data — not a single "have I run before"
flag. This means running it against a database where you've already
manually added a few real products (but nothing else yet) seeds
everything except products, rather than either skipping everything or
duplicating what's there. Verified this logic reads correctly against
every schema (see below) but — important caveat — not run against a
live MongoDB instance; see "What wasn't verified."

**Real placeholder images, not broken links.** Every `MediaAsset.url`
points at `picsum.photos/seed/<name>/<width>/<height>` — a real, always-
reachable placeholder image service. `alt` text is set to something
meaningful (the product/category/person name), not empty. None of these
have a `publicId` set (the field Cloudinary-uploaded images get) — this
is intentional, these are placeholders to swap out via the CMS's own
Media Library whenever real photography is ready, not something that
needs to be "uninstalled" first.

**Website settings uses a smarter merge, not overwrite-or-skip.**
Every other content type is all-or-nothing (empty collection → seed;
anything present → skip entirely), but `WebsiteSettings` is a singleton
that a fresh install already creates with mostly-blank fields on first
CMS save. This one instead fills in only the specific fields that are
still empty (contact info, footer text, homepage highlights, tagline)
and leaves everything else on an existing settings document exactly as
it is — so running this after someone has already configured, say, the
site's social links doesn't touch those, only adds what's missing.

**Blog `category` field stores an ObjectId string, not a slug** —
confirmed by reading `blogs.service.ts` (`category: categoryId` where
`categoryId = (await this.getCategoryOrThrow(...))._id.toString()`)
before writing this, not assumed from the schema's `type: String`
annotation alone (which could easily be misread as "stores the slug").
Getting this wrong would have silently broken the blog category filter
on the public site — `blog-listing-page.tsx` calls
`?category=<slug>` but the backend resolves that against
`BlogCategory.slug` internally and filters on the stored ObjectId
string, so a wrong value here wouldn't error, it would just always
return zero results.

## What wasn't verified

**No live MongoDB reachable in this sandbox** — MongoDB's own download/
package servers aren't in this environment's network allowlist, and
`apt-get install mongodb` has no candidate in default Ubuntu repos
either. Same category of caveat as Phase 33's Dockerfiles: this was
built and checked as thoroughly as this environment allows, not run
end-to-end.

What *was* verified, concretely: a full `tsc -p tsconfig.build.json
--noEmit` pass (catches import-path typos, wrong field names, and type
mismatches against the real Mongoose schema classes — this is a
non-trivial check, not a formality, since it would have caught e.g. a
wrong enum value or a field that doesn't exist on a schema), a clean
`eslint` pass, and every field name/shape in this script was checked
directly against the corresponding `*.schema.ts` file's actual `@Prop()`
declarations before being used, not written from assumption or from
Phase 32-era memory of the schemas.

**Run `npm run seed:demo` against a real database and read the log
output before trusting it fully** — it logs a line per content type
either seeded or skipped, so a real run will make it immediately obvious
if anything didn't go as expected.

## What this phase didn't touch

No changes to any schema, service, controller, or frontend code — purely
additive (`demo-data.seed.ts` + one new `package.json` script entry +
one `DEPLOYMENT.md` section). Nothing from `PHASE32_NOTES.md`'s backlog
was touched.

## Fix after first real run

The first actual run against a live database (outside this sandbox,
where no MongoDB was reachable to test against — see above) failed on
`Category validation failed: slug: Path 'slug' is required.` Root
cause: Mongoose runs schema validation *before* `pre('save')` middleware,
not after — so `CategorySchema.pre('save', ...)` (and the same pattern
on `Product`/`Blog`/`BlogCategory`/`Project`) is too late to satisfy
`slug`'s `required: true` on a brand-new document. Every existing CRUD
service already works around this by computing `slug` explicitly before
calling `.create()`/`.save()` (e.g. `CategoriesService.create()`); this
seeder now does the same for all five affected entity types. This is the
kind of thing only a real run against a real database surfaces — noted
here rather than glossed over.

## Next

Unchanged from `PHASE32_NOTES.md`, minus items 2 and 4 (Phase 34) —
everything else still open, still fine to leave for later.
