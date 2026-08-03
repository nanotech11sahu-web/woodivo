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
 * Every image on this site is a Cloudinary URL served byte-for-byte as
 * originally uploaded -- PageSpeed Insights flagged ~4MB of avoidable
 * transfer from this alone, and an 18.6s mobile LCP largely traces back to
 * it. Cloudinary applies transformations from a URL segment inserted right
 * after `/upload/`, so `f_auto` (serve WebP/AVIF where supported), `q_auto`
 * (automatic quality), and `w_<width>` (resize server-side instead of
 * shipping the full original) turn any existing URL into an optimized one
 * with no re-upload needed. Non-Cloudinary URLs pass through untouched.
 */
export function optimizeImageUrl(url: string, width: number): string {
  const marker = '/image/upload/';
  const markerIndex = url.indexOf(marker);
  if (markerIndex === -1) return url;
  const insertAt = markerIndex + marker.length;
  return `${url.slice(0, insertAt)}f_auto,q_auto,w_${width}/${url.slice(insertAt)}`;
}

/**
 * Made-to-order products keep the price hidden behind the enquiry flow since
 * each piece is quoted individually; in-stock/out-of-stock products have a
 * fixed real price and show it directly.
 */
export function formatPrice(value: number | undefined): string | undefined {
  if (typeof value !== 'number' || Number.isNaN(value)) return undefined;
  return `₹${value.toLocaleString('en-IN')}`;
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
