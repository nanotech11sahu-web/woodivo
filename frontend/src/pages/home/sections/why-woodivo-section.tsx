import { useSettings } from '@/features/settings/settings-api';
import { HOMEPAGE_ICON_MAP } from '@/lib/homepage-icons';
import { SectionHeading } from '@/components/shared/section-heading';
import type { HomepageHighlight } from '@/types/settings';

// Fallback only — shown until a CMS operator adds points under Settings
// > Homepage, or if the array is ever cleared back to empty. Same
// "hardcoded default survives as the pre-Settings-visit fallback" pattern
// `home-page.tsx`'s `seo` handling and `about-page.tsx`'s SEO card already
// use, just for this section's content instead of meta tags.
const DEFAULT_POINTS: HomepageHighlight[] = [
  {
    icon: 'tree-pine',
    title: 'Solid timber, not veneer',
    description: 'Every piece is solid wood through and through — no MDF core, no laminate shortcuts.',
  },
  {
    icon: 'ruler',
    title: 'Built to your dimensions',
    description: 'Doors, temples and furniture are made for your space, not pulled off a shelf.',
  },
  {
    icon: 'hammer',
    title: 'Hand-finished joinery',
    description: 'Traditional joinery and hand-finishing on every surface — no shortcuts in the workshop.',
  },
  {
    icon: 'truck',
    title: 'Delivered, not just sold',
    description: 'Careful packing and delivery across India, with installation guidance included.',
  },
];

/**
 * Phase 29 — was a hardcoded `POINTS` array (see git history / Phase 18's
 * original comment on this file) with no CMS module behind it. Now reads
 * `WebsiteSettings.homepage.whyWoodivoPoints`, the same singleton
 * `useSettings()` already powers the header/footer/WhatsApp button, so
 * this section adds no new network request on a page that already fetches
 * settings. `icon` is a fixed key (`HomepageHighlightIcon`, validated
 * server-side) translated to a `lucide-react` component via
 * `HOMEPAGE_ICON_MAP` — never a raw imported/rendered string.
 */
export function WhyWoodivoSection() {
  const { data: settings } = useSettings();
  const points = settings?.homepage?.whyWoodivoPoints?.length
    ? settings.homepage.whyWoodivoPoints
    : DEFAULT_POINTS;

  return (
    <section className="bg-teak px-4 py-16 text-ivory sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Why Woodivo"
          title="Furniture that's meant to be inherited"
          tone="dark"
        />

        <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {points.map((point, index) => {
            const Icon = HOMEPAGE_ICON_MAP[point.icon];
            return (
              <div key={`${point.title}-${index}`} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-brass-light/40">
                  <Icon className="h-6 w-6 text-brass-light" strokeWidth={1.5} />
                </div>
                <h3 className="mt-5 text-xl text-ivory">{point.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ivory-deep/75">
                  {point.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
