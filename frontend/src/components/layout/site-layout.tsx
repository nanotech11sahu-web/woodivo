import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { SiteHeader } from './site-header';
import { SiteFooter } from './site-footer';
import { WhatsAppFloatButton } from './whatsapp-float-button';
import { MobileTabBar } from './mobile-tab-bar';
import { ScrollToTop } from './scroll-to-top';
import { EnquiryDialog } from '@/components/shared/enquiry-dialog';
import { useSettings } from '@/features/settings/settings-api';
import { useJsonLd } from '@/lib/use-json-ld';
import { initAnalytics, trackPageView } from '@/lib/analytics';

/**
 * Fires a GA4 pageview on every client-side route change — `SiteLayout`
 * never unmounts between routes (only `<Outlet />`'s children do), so this
 * is the one place that sees every navigation exactly once. `useSeoMeta`
 * already updates `document.title` before this runs on the same render
 * pass, so `document.title` here reflects the page just navigated to, not
 * the previous one.
 */
function useAnalytics(): void {
  const location = useLocation();

  useEffect(() => {
    initAnalytics();
  }, []);

  useEffect(() => {
    trackPageView(location.pathname + location.search, document.title);
  }, [location.pathname, location.search]);
}

/**
 * `Organization` is the one structured-data type Phase 27's brief named
 * that has no single "details page" to render from — it describes the
 * business itself, not a piece of content, so it belongs once at the
 * layout level rather than duplicated (or worse, only present) on
 * whichever page happens to render first. `SiteLayout` already wraps
 * every route via `<Outlet />`, and never unmounts on client-side
 * navigation between pages, so this fires once per session rather than
 * re-running (and needlessly diffing an identical script tag) on every
 * route change the way a per-page `useJsonLd` call would.
 *
 * `sameAs` — the standard way to link an Organization to its social
 * profiles — is built from `WebsiteSettings.socialLinks`, filtered to the
 * five schema.org actually cares about seeing here (Pinterest is on the
 * type but not a schema.org `sameAs`-worthy profile link any more than it
 * gets an icon in `SocialLinksRow`). No `logo`/`contact` fallback values
 * are fabricated — same `SeoMeta` "don't fabricate for SEO" discipline
 * Phase 25's notes flagged for `Product.offers` applies here too, just
 * omit the field until the CMS operator actually sets a logo.
 */
function useOrganizationJsonLd(): void {
  const { data: settings } = useSettings();

  const sameAs = settings?.socialLinks
    ? Object.values(settings.socialLinks).filter((url): url is string => Boolean(url))
    : [];

  const schema =
    settings && (settings.siteName || settings.logo)
      ? {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: settings.siteName || 'WOODIVO',
          ...(settings.logo?.url ? { logo: settings.logo.url, image: settings.logo.url } : {}),
          url: window.location.origin,
          ...(settings.contact?.phone ? { telephone: settings.contact.phone } : {}),
          ...(settings.contact?.email ? { email: settings.contact.email } : {}),
          ...(sameAs.length > 0 ? { sameAs } : {}),
        }
      : undefined;

  useJsonLd('organization', schema);
}

export function SiteLayout() {
  useOrganizationJsonLd();
  useAnalytics();

  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <SiteHeader />
      <main className="flex-1 pb-16 sm:pb-0">
        <Outlet />
      </main>
      <SiteFooter />
      <MobileTabBar />
      <WhatsAppFloatButton />
      <EnquiryDialog />
    </div>
  );
}
