import type { ProductCardItem } from '@/components/shared/product-card';

const STORAGE_KEY = 'woodivo:recently-viewed';
const MAX_ITEMS = 12;

function read(): ProductCardItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Called once a product detail page finishes loading — moves the product
 * to the front of the list (most-recent-first), de-duping by slug. */
export function recordRecentlyViewed(item: ProductCardItem): void {
  try {
    const existing = read().filter((entry) => entry.slug !== item.slug);
    const next = [item, ...existing].slice(0, MAX_ITEMS);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage unavailable (private browsing, quota) — recently-viewed is a
    // nice-to-have, never worth surfacing an error over.
  }
}

export function getRecentlyViewed(excludeSlug?: string): ProductCardItem[] {
  return read().filter((entry) => entry.slug !== excludeSlug);
}
