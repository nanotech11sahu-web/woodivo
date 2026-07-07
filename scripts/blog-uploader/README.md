# Woodivo Blog Uploader

Takes the zips the Blog Factory Claude Project hands you and turns each post
into a **draft** in the real CMS — uploads every image, creates the blog,
patches its SEO fields. Nothing gets published automatically; every post
still needs a human to hit "Publish" in the CMS.

## Where this lives in your repo

```
woodivo/                      ← repo root, sibling to backend/cms/frontend
├── backend/
├── cms/
├── frontend/
├── draft-blogs/               ← NEW: drop zips here (also where processed/ and failed/ land)
│   ├── processed/
│   └── failed/
└── scripts/
    └── blog-uploader/         ← NEW: this tool
        ├── package.json
        ├── upload-blogs.js
        ├── .env.example
        └── README.md
```

**Why `draft-blogs/` sits at the repo root, not inside `backend/`, `cms/`, or `frontend/`:** it isn't part of any of the three deployed apps — it's an input/output folder for an operational script. Keeping it outside all three means it never accidentally gets swept into a Docker build context, a `vite build`, or a Nest build step. Same reasoning for `scripts/` — it's tooling, not app code.

If your repo structure differs, the only thing that actually matters is the three paths in `.env` (`DRAFT_BLOGS_DIR`, `PROCESSED_DIR`, `FAILED_DIR`) — point them wherever makes sense for you.

## Setup

```bash
cd woodivo/scripts/blog-uploader
npm install
cp .env.example .env
```

Edit `.env`:
- `WOODIVO_API_BASE` — your backend URL + `/api/v1` (e.g. `http://localhost:3000/api/v1` locally, or your real domain in production).
- `WOODIVO_ADMIN_EMAIL` / `WOODIVO_ADMIN_PASSWORD` — an existing CMS login. **EDITOR role is enough** — the script only ever creates blogs, uploads media, and patches the SEO entry the backend auto-creates; it never touches anything that requires ADMIN/SUPER_ADMIN.
- Leave the folder paths as-is if you're using the layout above, or point them elsewhere.

## Running it

**One-off** (process whatever's sitting in `draft-blogs/` right now, then exit):
```bash
npm run upload
```

**Long-running / cron-style** (checks every `WATCH_INTERVAL_MINUTES`, default 15):
```bash
npm run watch
```
Run this under `pm2`, a `systemd` service, or inside a `screen`/`tmux` session so it survives you closing the terminal.

**Or, real cron instead of `--watch`** — if you'd rather the OS scheduler own this instead of a long-running node process, use a plain crontab entry and drop `--watch` entirely:
```
# every 15 minutes
*/15 * * * * cd /path/to/woodivo/scripts/blog-uploader && /usr/bin/node upload-blogs.js >> upload.log 2>&1
```

## What happens when it runs

1. Scans `draft-blogs/` for `.zip` files.
2. Logs into the API once per run.
3. Fetches your current blog categories (so it can turn `"Craftsmanship"` into the real category ID the backend expects).
4. For each post in each zip:
   - Uploads the hero image + every in-body image to Cloudinary via `/admin/media/upload`.
   - Splices the real image URLs into the post's Markdown (replacing each `![alt](image-1.jpg)` with `![alt](https://real-cloudinary-url...)`).
   - Creates the blog via `/admin/blogs` as a **draft**.
   - Finds the SeoEntry the backend auto-created for the new post and patches in `metaTitle`/`metaDescription`/`metaKeywords`/`ogImage`/`canonicalUrl`.
5. On success: moves the zip to `draft-blogs/processed/`.
6. On failure: moves the zip to `draft-blogs/failed/` with an `<zipname>.error.log` next to it explaining what went wrong, so you can fix and re-drop it into `draft-blogs/` to retry.

## After it runs

Open the CMS → Blogs. Your new posts are sitting there as drafts with images, SEO, and FAQs already filled in. Review, swap any AI-generated placeholder images for real photography if you haven't already, then publish.

## Known limitation, by design

This script never sets `status: "published"` itself, even if a zip's `content.json` said otherwise — there's no code path in `upload-blogs.js` for it, on purpose. A human reviews and publishes. If you later want true unattended publishing, that's a deliberate follow-up change, not something to flip on by accident.
