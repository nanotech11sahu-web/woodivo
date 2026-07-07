# Phase 37 — Blog content upgrade: Markdown, in-body images, FAQs

Directly requested (`WOODIVO_Blog_Tech_Upgrade_Request.md`): fix the three
gaps the Content Bible flagged in blog posts — no bold/bullets, no
in-body images, no FAQ block — by switching `content` from plain text
to Markdown, adding a per-post image gallery, and adding an embedded
FAQ list with `FAQPage` JSON-LD. Sized and delivered as one phase
across all three apps, per the request doc's own rollout order.

## Backend

- **`schemas/blog.schema.ts`** — added `BlogFaqItem` (`question`,
  `answer`, `@Schema({ _id: false })`, same embedded-subdocument shape
  as everywhere else in this codebase that isn't its own collection)
  and two new props on `Blog`: `images: MediaAsset[]` (identical
  pattern to `product.schema.ts`) and `faqs: BlogFaqItem[]`. `content`
  itself is unchanged — `@Prop({ required: true }) content!: string`
  was already just a string; Markdown doesn't need a schema change.
- **`dto/blog-faq-item.dto.ts`** (new) — `BlogFaqItemDto`, two
  `@IsString()` fields, same folder as `media-asset.dto.ts`.
- **`dto/create-blog.dto.ts`** / **`update-blog.dto.ts`** — added
  matching `images?: MediaAssetDto[]` and `faqs?: BlogFaqItemDto[]`,
  both `@IsOptional() @IsArray() @ValidateNested({ each: true })`.
- **`blogs.service.ts`** — untouched. No field whitelisting exists on
  the create/update path (checked directly), so the two new DTO fields
  flow through the same way `tags`/`category` already do.

## CMS (`cms/src/features/blogs/`)

- **`markdown-content-editor.tsx`** (new) — replaces the plain
  `<Textarea>` for `content`. Thin toolbar (Bold / Bullet list / Insert
  image) that wraps or inserts at the current selection, plus an
  Edit/Preview toggle. No block/rich-text editor — the toolbar just
  writes Markdown into the same string the backend already stores.
  Preview renders with `react-markdown` + `remark-gfm` +
  `rehype-sanitize`, the same three packages the public frontend uses,
  so what the writer previews is what actually ships.
- **`blog-faq-editor.tsx`** (new) — repeatable question/answer rows,
  add/remove, plain component state (`faqs`) alongside `featuredImage`
  and `tags`, same pattern `blog-form-page.tsx` already used for those.
- **`blog-form-page.tsx`** — added `images` and `faqs` state, wired
  into `reset()` on load and into the submit payload. Added a
  `MultiImageUploader` (`folder="blogs"`, same component
  `product-form-page.tsx` already uses) with a "Copy Markdown" chip per
  uploaded image (`![alt](url)`) so a writer can paste it straight into
  the content editor above. Added a new "FAQs" `Card` using
  `BlogFaqEditor`. `blog-form-schema.ts` needed no Zod change — `content`
  is still just a non-empty string; `images`/`faqs` are unvalidated
  component state exactly like `featuredImage`/`tags` already were.
- **`types/blog.ts`** — added `BlogFaqItem` interface and
  `images`/`faqs` fields to `Blog` and `BlogPayload`.
- **`index.css`** — added a small hand-rolled `.markdown-preview`
  block (headings, lists, links, blockquote, images) for the preview
  pane. Neither app has a Tailwind Typography plugin installed, so this
  uses the CMS's own design tokens (`--color-espresso`, `--font-display`,
  etc.) rather than pulling in `@tailwindcss/typography` for one panel.

## Frontend (`frontend/src/pages/blogs/blog-details-page.tsx`)

- Replaced the `blog.content.split(/\n{2,}/)` paragraph-splitting block
  with `<ReactMarkdown remarkPlugins={[remarkGfm]}
  rehypePlugins={[rehypeSanitize]}>`. Every pre-Phase-37 post (plain
  text, paragraphs separated by blank lines) is already valid Markdown,
  so existing posts render unchanged — no migration needed.
- Custom `img` component in `components` so in-body images get the
  same rounded-corner/`object-cover` treatment the hero image already
  has, plus `loading="lazy"` (a post can now carry several).
- Content typography (bold, bullets, headings, links, blockquote)
  styled with arbitrary-variant Tailwind selectors on the wrapping
  `<div>` (`[&_ul]:list-disc`, etc.) for the same reason as the CMS
  preview pane — no typography plugin installed in this app either, and
  this needed the site's own `teak`/`brass`/`charcoal-soft` tokens, not
  generic prose grays.
- Added a FAQ section (rendered only when `blog.faqs.length > 0`) after
  the tags block, plus a new `useFaqJsonLd` hook — sibling to the
  existing `useBlogPostingJsonLd`, keyed `'faq'` in `useJsonLd` so the
  two `<script type="application/ld+json">` tags don't clobber each
  other. Emits schema.org `FAQPage`/`Question`/`acceptedAnswer` only
  when FAQs exist, matching what's visibly on the page (Google's own
  guidance for this markup).
- **`types/blog.ts`** — added `BlogFaqItem` and `images`/`faqs` fields
  to the public `Blog` type.

## New dependencies

```bash
# frontend
npm install react-markdown remark-gfm rehype-sanitize

# cms (preview pane uses the same renderer)
npm install react-markdown remark-gfm rehype-sanitize
```

Added directly to both `package.json` files (`react-markdown@^10.1.0`,
`remark-gfm@^4.0.1`, `rehype-sanitize@^6.0.0` — versions checked
against the npm registry, and `react-markdown@10` confirmed compatible
with React 19 GA, which both apps are on). **Run `npm install` in both
`frontend/` and `cms/` before building** — this sandbox has no
`node_modules` in either app, so nothing here was run through
`tsc`/`eslint`/`vite build`. Read every changed and new file by hand
against the real component/type signatures it touches (`MultiImageUploader`,
`useJsonLd`, `Components` from `react-markdown`, etc.) instead, but that's
not a substitute for an actual build pass — do that before shipping.

## What does NOT need to change

Same list the request doc gave, confirmed against the real files:
`excerpt`, `slug`, `metaTitle`/`metaDescription`/etc. (there's no
per-entity `seo` field at all any more — Phase 36 centralized that into
`SeoEntry`, untouched here), `category`, `tags`, `status`, `publishAt`,
`featuredImage`/hero behavior on listing/homepage cards. Existing
published posts render correctly with zero data migration.

## Deferred (not in this phase)

- **Backend-side Markdown/HTML sanitization on write.** The request
  doc flagged this as optional/low-risk today since only the internal
  team writes posts; `rehype-sanitize` at render time is the actual
  XSS defense right now. Worth adding before the Blog Factory pipeline
  is wired to auto-publish without a human in the loop — track this as
  a backlog item for whenever that pipeline work starts, not bundled
  into this phase's scope.
- **`@uiw/react-md-editor`** or any richer authoring UI — the toolbar +
  textarea + preview covers everything the Content Bible asked for with
  zero extra dependencies beyond the renderer itself; a nicer editor
  stays a nice-to-have.
- **Blog Factory pipeline doc update** (dropping `[[IMAGE:n]]` markers,
  populating `images[]`/`faqs[]` in `content.json`) — per the request
  doc's own rollout order, that's a follow-up once steps 1–3 here are
  live, not part of this phase.

## Next

- Backend sanitization on `content` write, once the Blog Factory
  pipeline moves toward unattended auto-publish.
- Update `WOODIVO_Blog_Factory_Instructions.md` to match (see
  "Deferred" above).
- Drag-and-drop library, shared types package, CMS bundle
  code-splitting — still deferred from earlier phases, unchanged by
  this one.
