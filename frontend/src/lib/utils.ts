import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** WhatsApp's click-to-chat URL only accepts digits (no "+", spaces, dashes). */
export function toWhatsAppDigits(phone: string): string {
  return phone.replace(/[^0-9]/g, '');
}

/**
 * INR price formatting for product cards/detail pages — `en-IN` matches
 * `formatDate` above and every other hardcoded India-specific assumption
 * in this codebase. No decimals: furniture prices here are always whole
 * rupees, and showing ".00" on every card is just noise.
 */
export function formatPrice(value: number | undefined): string | undefined {
  if (typeof value !== 'number' || Number.isNaN(value)) return undefined;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * First date-formatting helper this app has needed — `Blog` is the first
 * public-site entity with a date worth showing on the page itself (a
 * publish date on a listing card and a detail byline), as opposed to
 * timestamps the CMS displays admin-side. `en-IN` matches every other
 * hardcoded India-specific assumption already in this codebase (WhatsApp
 * numbers, Razorpay, INR).
 */
export function formatDate(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

/**
 * Meta-description fallback for Phase 24's `useSeoMeta` — entity `.seo`
 * data is optional, so pages fall back to their own free-text field
 * (`description`, `excerpt`, `storyContent`), which can run far longer
 * than the ~160 chars a meta description should be. Cuts at the last
 * whole word inside the limit rather than mid-word.
 */
export function truncate(value: string | undefined, maxLength = 160): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (trimmed.length <= maxLength) return trimmed;
  const cut = trimmed.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(' ');
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : maxLength).trim()}…`;
}
