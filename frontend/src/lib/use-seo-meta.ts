import { useEffect } from 'react';
import { useSettings } from '@/features/settings/settings-api';
import { useSeoOverride } from './seo-api';

export interface SeoMetaInput {
  /**
   * Page-specific fallback title, used only when nothing's been entered
   * for this path in the centralized SEO section (CMS → SEO). E.g.
   * `product.name`. `undefined` renders just the site name (matches
   * useDocumentTitle's old behaviour).
   */
  title?: string;
  description?: string;
  /** Absolute or relative image URL for `og:image`. */
  ogImage?: string;
  /**
   * Path to canonicalize, e.g. `/products/${slug}`. Defaults to the current
   * `location.pathname` when omitted. Also the lookup key sent to
   * `GET /seo/resolve` — this needs to match exactly what the corresponding
   * SeoEntry's `path` is (see backend `SeoEntriesService.syncForEntity`).
   */
  canonicalPath?: string;
  /** 404 and any other page that shouldn't be indexed. */
  noIndex?: boolean;
}

// Phase 18 through 23 only ever set `document.title` (`useDocumentTitle`) —
// its own comment flagged full `<head>` management as a bigger, separately
// scoped change, deferred every phase since and flagged six times through
// Phase 23. No `react-helmet`-equivalent is installed and none is added
// here (option (a) from the Phase 24 prompt) — direct DOM manipulation is
// enough for a handful of tags and avoids a new dependency + wrapping
// every page in a provider. Every managed element is tagged
// `data-seo-managed="true"` so repeated navigation updates the same node
// instead of appending duplicates.
function upsertMeta(attr: 'name' | 'property', key: string, content: string | undefined): void {
  const selector = `meta[${attr}="${key}"][data-seo-managed="true"]`;
  const existing = document.head.querySelector<HTMLMetaElement>(selector);

  if (!content) {
    existing?.remove();
    return;
  }

  const el = existing ?? document.createElement('meta');
  el.setAttribute(attr, key);
  el.setAttribute('data-seo-managed', 'true');
  el.setAttribute('content', content);
  if (!existing) document.head.appendChild(el);
}

function upsertCanonical(href: string | undefined): void {
  const existing = document.head.querySelector<HTMLLinkElement>(
    'link[rel="canonical"][data-seo-managed="true"]',
  );

  if (!href) {
    existing?.remove();
    return;
  }

  const el = existing ?? document.createElement('link');
  el.setAttribute('rel', 'canonical');
  el.setAttribute('data-seo-managed', 'true');
  el.setAttribute('href', href);
  if (!existing) document.head.appendChild(el);
}

function toAbsoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${window.location.origin}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;
}

/**
 * Replaces `useDocumentTitle` — same `${title} | ${siteName}` fallback
 * logic (via `useSettings`), plus meta description, canonical link, basic
 * Open Graph tags, and an opt-in `noindex` for pages like the 404 that
 * should never appear in search results.
 *
 * SEO used to be a field embedded on each entity (`product.seo`,
 * `blog.seo`, etc.), each page reading its own `entity.seo?.field ||
 * fallback`. It's now centralized in one CMS section keyed by path, so
 * this hook does that lookup itself (`useSeoOverride`) and prefers it
 * over whatever fallback the page passed in — callers no longer need to
 * know or care whether an override exists.
 */
export function useSeoMeta({ title, description, ogImage, canonicalPath, noIndex }: SeoMetaInput): void {
  const { data: settings } = useSettings();
  const path = canonicalPath ?? window.location.pathname;
  const { data: override } = useSeoOverride(path);

  const siteName = settings?.siteName ?? 'WOODIVO';
  const effectiveTitle = override?.metaTitle || title;
  const effectiveDescription = override?.metaDescription || description;
  const effectiveOgImage = override?.ogImage || ogImage;
  const fullTitle = effectiveTitle ? `${effectiveTitle} | ${siteName}` : siteName;
  const canonicalHref = toAbsoluteUrl(override?.canonicalUrl || path);

  useEffect(() => {
    document.title = fullTitle;
    upsertMeta('name', 'description', effectiveDescription);
    upsertMeta('name', 'robots', noIndex ? 'noindex, nofollow' : undefined);
    upsertCanonical(canonicalHref);
    upsertMeta('property', 'og:title', effectiveTitle ?? siteName);
    upsertMeta('property', 'og:description', effectiveDescription);
    upsertMeta('property', 'og:url', canonicalHref);
    upsertMeta('property', 'og:image', effectiveOgImage ? toAbsoluteUrl(effectiveOgImage) : undefined);
  }, [fullTitle, effectiveDescription, noIndex, canonicalHref, effectiveTitle, siteName, effectiveOgImage]);
}
