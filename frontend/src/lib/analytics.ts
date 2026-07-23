const GA_MEASUREMENT_ID = 'G-33T94KMTZH';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
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
}

export function trackPageView(path: string, title?: string): void {
  if (!import.meta.env.PROD || typeof window.gtag !== 'function') return;
  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title,
    page_location: window.location.href,
  });
}
