const GA_MEASUREMENT_ID = 'G-33T94KMTZH';
const META_PIXEL_ID = '1343727104581833';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

let initialized = false;

/**
 * Loads gtag.js and configures it with `send_page_view: false` — this is
 * an SPA (react-router client-side navigation, no full page reloads), so
 * the automatic pageview gtag.js fires on script load would only ever
 * count the very first page a visitor lands on. `trackPageView` below
 * fires the real per-route pageviews instead, from a router-aware hook.
 *
 * Gated on `import.meta.env.PROD` so `npm run dev` / local QA never sends
 * data to the real GA4 property — only an actual production build does.
 */
export function initAnalytics(): void {
  if (initialized || !import.meta.env.PROD) return;
  initialized = true;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer!.push(args);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, { send_page_view: false });

  initMetaPixel();
}

/**
 * Standard Meta Pixel base code (fbevents.js loader), scoped the same way
 * as GA above — production builds only, loaded once. `fbq('track',
 * 'PageView')` here covers the very first page; per-route views after that
 * are fired from `trackPageView` alongside the GA4 pageview, since this is
 * an SPA with no full page reloads for `fbevents.js`'s own PageView
 * auto-tracking to catch.
 */
function initMetaPixel(): void {
  if (typeof window.fbq === 'function') return;

  // fbevents.js overwrites window.fbq with its real implementation once
  // loaded and drains this queue -- until then every call is just queued.
  const queue: unknown[][] = [];
  const fbq = ((...args: unknown[]) => {
    queue.push(args);
  }) as Window['fbq'] & { queue: unknown[][]; loaded: boolean; version: string };
  fbq.queue = queue;
  fbq.loaded = true;
  fbq.version = '2.0';

  window.fbq = fbq;
  if (!window._fbq) window._fbq = fbq;

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  document.head.appendChild(script);

  window.fbq('init', META_PIXEL_ID);
  window.fbq('track', 'PageView');
}

export function trackPageView(path: string, title?: string): void {
  if (!import.meta.env.PROD) return;
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'page_view', {
      page_path: path,
      page_title: title,
      page_location: window.location.href,
    });
  }
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'PageView');
  }
}

/** Fired once an enquiry is successfully saved — the one action that actually matters for ad spend decisions. */
export function trackEnquirySubmitted(): void {
  if (!import.meta.env.PROD) return;
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'generate_lead');
  }
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'Lead');
  }
}
