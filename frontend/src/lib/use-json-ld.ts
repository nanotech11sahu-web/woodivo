import { useEffect } from 'react';

/**
 * Injects a `<script type="application/ld+json">` tag into `<head>`,
 * keyed by `key` so unrelated callers (e.g. `Breadcrumbs`' `'breadcrumb'`
 * schema and a details page's `'entity'` schema) never clobber each
 * other's tag, and repeat calls with the same `key` update the existing
 * node instead of appending a duplicate — the same `data-seo-managed`
 * upsert pattern `use-seo-meta.ts` already uses for `<meta>`/`<link>`.
 *
 * Unlike `useSeoMeta`'s tags, a stale JSON-LD block left behind after
 * navigating away is worse than a stale meta tag (it's a structured claim
 * a crawler can extract facts from, not just decoration), so this always
 * removes its own node on unmount — a page that stops rendering a
 * `'entity'` schema (or navigates elsewhere entirely) doesn't leave a
 * dangling `Product`/`BlogPosting` block for whatever renders next.
 */
export function useJsonLd(
  key: string,
  schema: Record<string, unknown> | undefined,
): void {
  const json = schema ? JSON.stringify(schema) : undefined;

  useEffect(() => {
    const selector = `script[type="application/ld+json"][data-seo-jsonld="${key}"]`;
    const existing = document.head.querySelector<HTMLScriptElement>(selector);

    if (!json) {
      existing?.remove();
      return;
    }

    const el = existing ?? document.createElement('script');
    el.setAttribute('type', 'application/ld+json');
    el.setAttribute('data-seo-jsonld', key);
    el.textContent = json;
    if (!existing) document.head.appendChild(el);

    return () => {
      document.head.querySelector<HTMLScriptElement>(selector)?.remove();
    };
  }, [key, json]);
}
