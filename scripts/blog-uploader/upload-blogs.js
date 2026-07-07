#!/usr/bin/env node
/**
 * Woodivo Blog Uploader
 * ---------------------
 * Reads zip files dropped in DRAFT_BLOGS_DIR (produced by the Blog Factory
 * Claude Project, per WOODIVO_Blog_Factory_Instructions.md), uploads every
 * image, creates each post as a DRAFT via the real admin API, and patches
 * the SEO fields onto the SeoEntry the backend auto-creates for it.
 *
 * Nothing is auto-published — every post lands in the CMS as `status: draft`
 * (whatever content.json says, but the Blog Factory always sets draft) so a
 * human still reviews and hits "Publish" in the CMS themselves.
 *
 * Endpoints used (checked directly against the Phase 37 backend):
 *   POST  /api/v1/auth/login                -> { accessToken, refreshToken }
 *   GET   /api/v1/admin/blog-categories      -> [{ _id, name, slug }]
 *   POST  /api/v1/admin/media/upload         -> { url, publicId, width, height, alt }
 *   POST  /api/v1/admin/blogs                -> created Blog (includes _id, slug)
 *   GET   /api/v1/admin/seo?pageType=blog    -> paginated SeoEntry list
 *   PATCH /api/v1/admin/seo/:id              -> updated SeoEntry
 *
 * Run once:      node upload-blogs.js
 * Run as daemon: node upload-blogs.js --watch   (polls every WATCH_INTERVAL_MINUTES)
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const os = require('os');
const axios = require('axios');
const FormData = require('form-data');
const AdmZip = require('adm-zip');

const API_BASE = process.env.WOODIVO_API_BASE || 'http://localhost:3000/api/v1';
const EMAIL = process.env.WOODIVO_ADMIN_EMAIL;
const PASSWORD = process.env.WOODIVO_ADMIN_PASSWORD;
const DRAFT_DIR = path.resolve(__dirname, process.env.DRAFT_BLOGS_DIR || '../../draft-blogs');
const PROCESSED_DIR = path.resolve(__dirname, process.env.PROCESSED_DIR || '../../draft-blogs/processed');
const FAILED_DIR = path.resolve(__dirname, process.env.FAILED_DIR || '../../draft-blogs/failed');
const WATCH_MINUTES = Number(process.env.WATCH_INTERVAL_MINUTES || 15);

function log(...args) {
  console.log(`[${new Date().toISOString()}]`, ...args);
}

/**
 * Every successful response from this backend is wrapped by a global
 * TransformInterceptor: { success, statusCode, message, data, timestamp }.
 * The thing we actually want is always at `.data`.
 */
function unwrap(res) {
  return res.data.data;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

// ---------- Auth ----------

async function login() {
  if (!EMAIL || !PASSWORD) {
    throw new Error('WOODIVO_ADMIN_EMAIL / WOODIVO_ADMIN_PASSWORD not set — copy .env.example to .env and fill them in.');
  }
  const res = await axios.post(`${API_BASE}/auth/login`, { email: EMAIL, password: PASSWORD });
  const { tokens } = unwrap(res); // LoginResponse = { user: {...}, tokens: { accessToken, refreshToken } }
  if (!tokens || !tokens.accessToken) {
    throw new Error('Login response did not contain tokens.accessToken — check credentials and API response shape.');
  }
  return tokens.accessToken;
}

function authHeaders(token) {
  return { Authorization: `Bearer ${token}` };
}

// ---------- Categories ----------

async function fetchCategoryMap(token) {
  const res = await axios.get(`${API_BASE}/admin/blog-categories`, { headers: authHeaders(token) });
  const map = new Map();
  for (const cat of unwrap(res)) {
    map.set(cat.name.trim().toLowerCase(), cat._id);
  }
  return map;
}

// ---------- Media ----------

/** Uploads one image file, returns the MediaAsset the backend hands back. */
async function uploadImage(token, absoluteFilePath, alt) {
  const form = new FormData();
  form.append('file', fs.createReadStream(absoluteFilePath));
  form.append('folder', 'blogs');
  if (alt) form.append('alt', alt.slice(0, 200));

  const res = await axios.post(`${API_BASE}/admin/media/upload`, form, {
    headers: { ...authHeaders(token), ...form.getHeaders() },
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
  });
  return unwrap(res); // { url, publicId, width, height, alt }
}

// ---------- SEO ----------

/**
 * The backend auto-creates a bare SeoEntry (path + label only) the moment a
 * blog is created (BlogsService.syncSeoEntry). We fetch the most recent
 * pageType=blog entries and match on `path` to find that entry, then PATCH
 * the real meta fields onto it.
 */
async function patchSeoForBlog(token, slug, seoFields) {
  const targetPath = `/blogs/${slug}`;
  const res = await axios.get(`${API_BASE}/admin/seo`, {
    headers: authHeaders(token),
    params: { pageType: 'blog', limit: 10, sortBy: 'createdAt', sortOrder: 'desc' },
  });
  const items = unwrap(res).items; // PaginatedResult<SeoEntry> -> { items, meta }
  const entry = (Array.isArray(items) ? items : []).find((e) => e.path === targetPath);
  if (!entry) {
    log(`  ! could not find auto-created SEO entry for ${targetPath} — skipping SEO patch, fix manually in CMS`);
    return;
  }
  await axios.patch(`${API_BASE}/admin/seo/${entry._id}`, seoFields, { headers: authHeaders(token) });
}

// ---------- Per-post processing ----------

/**
 * Replaces every `](filename)` markdown image reference in `content` with
 * the real uploaded URL. Matches the `markdownRef` field the Blog Factory
 * writes into each images[] entry.
 */
function spliceImageUrls(content, refToUrl) {
  let result = content;
  for (const [ref, url] of Object.entries(refToUrl)) {
    // Escape regex special characters in the filename before building the pattern.
    const escaped = ref.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    result = result.replace(new RegExp(`\\]\\(${escaped}\\)`, 'g'), `](${url})`);
  }
  return result;
}

async function processBlogFolder(token, blogDir, categoryMap) {
  const contentPath = path.join(blogDir, 'content.json');
  if (!fs.existsSync(contentPath)) {
    throw new Error(`content.json missing in ${blogDir}`);
  }
  const post = JSON.parse(fs.readFileSync(contentPath, 'utf8'));

  // 1. Upload the hero image.
  log(`  uploading hero image...`);
  const heroAsset = await uploadImage(
    token,
    path.join(blogDir, post.featuredImage.file),
    post.featuredImage.alt,
  );

  // 2. Upload every in-body image, and build a markdownRef -> url map.
  const refToUrl = {};
  const uploadedImages = [];
  for (const img of post.images || []) {
    log(`  uploading ${img.file}...`);
    const asset = await uploadImage(token, path.join(blogDir, img.file), img.alt);
    refToUrl[img.markdownRef] = asset.url;
    uploadedImages.push({ ...asset, alt: img.alt || asset.alt });
  }

  // 3. Splice the real URLs into the markdown body.
  const finalContent = spliceImageUrls(post.content, refToUrl);

  // 4. Resolve category name -> ObjectId (CreateBlogDto requires a Mongo ID).
  let categoryId;
  if (post.category) {
    categoryId = categoryMap.get(post.category.trim().toLowerCase());
    if (!categoryId) {
      log(`  ! category "${post.category}" not found in CMS — creating post uncategorized, fix manually`);
    }
  }

  // 5. Create the blog as a draft.
  const payload = {
    title: post.title,
    slug: post.slug || undefined,
    excerpt: post.excerpt,
    content: finalContent,
    category: categoryId,
    tags: post.tags || [],
    authorName: post.authorName || 'Woodivo Team',
    status: post.status || 'draft',
    isFeatured: Boolean(post.isFeatured),
    featuredImage: heroAsset,
    images: uploadedImages,
    faqs: post.faqs || [],
  };

  log(`  creating blog "${post.title}"...`);
  const created = await axios.post(`${API_BASE}/admin/blogs`, payload, { headers: authHeaders(token) });
  const blog = unwrap(created);

  // 6. Patch the auto-created SEO entry with the real meta fields.
  if (post.seo) {
    log(`  patching SEO fields...`);
    await patchSeoForBlog(token, blog.slug, {
      metaTitle: post.seo.metaTitle,
      metaDescription: post.seo.metaDescription,
      metaKeywords: post.seo.metaKeywords || [],
      ogImage: post.seo.ogImage || heroAsset.url,
      canonicalUrl: post.seo.canonicalUrl || undefined,
    });
  }

  return { title: post.title, slug: blog.slug, id: blog._id };
}

// ---------- Zip processing ----------

async function processZip(zipPath, token, categoryMap) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'woodivo-blog-'));
  try {
    new AdmZip(zipPath).extractAllTo(tmpDir, true);

    // The zip contains one top-level folder (woodivo-blogs-YYYY-MM-DD/); find it.
    const rootEntries = fs.readdirSync(tmpDir);
    const rootDir = path.join(tmpDir, rootEntries.find((e) => fs.statSync(path.join(tmpDir, e)).isDirectory()) || '.');

    const manifestPath = path.join(rootDir, 'manifest.json');
    if (!fs.existsSync(manifestPath)) {
      throw new Error(`manifest.json not found at expected location inside ${zipPath}`);
    }
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

    const results = [];
    for (const postEntry of manifest.posts) {
      const blogDir = path.join(rootDir, postEntry.folder);
      log(`Processing ${postEntry.folder}...`);
      const result = await processBlogFolder(token, blogDir, categoryMap);
      log(`  done -> blog id ${result.id}, slug "${result.slug}"`);
      results.push(result);
    }
    return results;
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

// ---------- Main run ----------

async function run() {
  ensureDir(DRAFT_DIR);
  ensureDir(PROCESSED_DIR);
  ensureDir(FAILED_DIR);

  const zips = fs.readdirSync(DRAFT_DIR).filter((f) => f.toLowerCase().endsWith('.zip'));
  if (zips.length === 0) {
    log('No zip files waiting in', DRAFT_DIR);
    return;
  }

  log(`Found ${zips.length} zip(s) to process.`);
  const token = await login();
  const categoryMap = await fetchCategoryMap(token);

  for (const zipName of zips) {
    const zipPath = path.join(DRAFT_DIR, zipName);
    log(`--- ${zipName} ---`);
    try {
      const results = await processZip(zipPath, token, categoryMap);
      fs.renameSync(zipPath, path.join(PROCESSED_DIR, zipName));
      log(`✔ ${zipName} — ${results.length} post(s) created as drafts. Review in the CMS before publishing.`);
    } catch (err) {
      const message = err.response ? JSON.stringify(err.response.data) : err.message;
      log(`✘ ${zipName} failed: ${message}`);
      fs.writeFileSync(
        path.join(FAILED_DIR, `${zipName}.error.log`),
        `${new Date().toISOString()}\n${message}\n`,
      );
      fs.renameSync(zipPath, path.join(FAILED_DIR, zipName));
    }
  }
}

async function main() {
  const watch = process.argv.includes('--watch');
  await run().catch((err) => logError(err));

  if (watch) {
    log(`Watch mode — checking every ${WATCH_MINUTES} minute(s). Ctrl+C to stop.`);
    setInterval(() => {
      run().catch((err) => logError(err));
    }, WATCH_MINUTES * 60 * 1000);
  }
}

function logError(err) {
  if (err.response) {
    // The API responded, but with an error status (auth failure, validation error, etc).
    log(`Fatal error: request failed with status ${err.response.status}`);
    log('Response body:', JSON.stringify(err.response.data));
  } else if (err.request) {
    // The request was sent but no response came back at all — almost always
    // means the backend isn't running, or WOODIVO_API_BASE is wrong.
    log(`Fatal error: no response from ${API_BASE} — is the backend running, and is WOODIVO_API_BASE correct in .env?`);
    log('Underlying error code:', err.code || '(none)');
  } else {
    log('Fatal error:', err.message || err);
  }
}

main();