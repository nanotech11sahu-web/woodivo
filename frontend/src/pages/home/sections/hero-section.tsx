import { Link } from 'react-router-dom';
import { useBanners } from '@/features/banners/banners-api';
import { useEnquiryDialog } from '@/features/enquiry/enquiry-dialog-context';
import { Button } from '@/components/ui/button';
import { JaliDivider } from '@/components/shared/jali-divider';

/**
 * The hero is the one section this phase that tolerates an empty CMS
 * gracefully by design, not by accident: a brand-new install has no
 * banners yet (Banner Management is its own CMS module a store owner
 * fills in after launch), so this can't assume `banners[0]` exists the
 * way most sections below assume "just don't render if the list is
 * empty" is fine — the hero is the one section that can't just disappear.
 */
export function HeroSection() {
  const { data: banners } = useBanners('hero');
  const { openEnquiryDialog } = useEnquiryDialog();
  const hero = banners?.[0];

  return (
    <section className="relative overflow-hidden bg-teak-deep text-ivory">
      {hero?.desktopImage.url ? (
        <div className="absolute inset-0">
          <img
            src={hero.desktopImage.url}
            alt={hero.desktopImage.alt || hero.title}
            className="h-full w-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-teak-deep via-teak-deep/70 to-teak-deep/30" />
        </div>
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_rgba(176,129,63,0.18),_transparent_45%),radial-gradient(circle_at_80%_70%,_rgba(176,129,63,0.14),_transparent_45%)]" />
      )}

      <div className="relative mx-auto flex min-h-[86vh] max-w-5xl flex-col items-center justify-center px-4 py-28 text-center sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brass-light">
          Handcrafted &middot; Made to order
        </p>
        <h1 className="mt-6 max-w-3xl text-5xl leading-[1.08] sm:text-6xl lg:text-7xl">
          {hero?.title ?? 'Wood, shaped into something that outlasts you.'}
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-ivory-deep/85 sm:text-lg">
          {hero?.subtitle ??
            'Temples, doors and furniture carved by hand from solid timber — every piece built to a family, not a catalogue.'}
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Button size="lg" variant="brass" onClick={() => openEnquiryDialog('homepage')}>
            {hero?.ctaLabel ?? 'Get a Quote'}
          </Button>
          <Link
            to={hero?.ctaLink && hero.ctaLink !== '' ? hero.ctaLink : '/gallery'}
            className="inline-flex h-13 items-center justify-center rounded-[var(--radius-card)] border border-ivory-deep/40 px-8 text-base font-semibold text-ivory transition-colors hover:border-brass hover:text-brass-light"
          >
            View Our Work
          </Link>
        </div>

        <div className="mt-16 w-56 opacity-70">
          <JaliDivider className="text-brass-light" />
        </div>
      </div>
    </section>
  );
}
