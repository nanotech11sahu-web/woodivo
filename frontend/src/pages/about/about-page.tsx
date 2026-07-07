import { Target, Eye } from 'lucide-react';
import { useAboutPage } from '@/features/about/about-api';
import { useBanners } from '@/features/banners/banners-api';
import { useSeoMeta } from '@/lib/use-seo-meta';
import { truncate } from '@/lib/utils';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { SectionSpinner } from '@/components/shared/spinner';
import { ErrorNote } from '@/components/shared/error-note';
import { SectionHeading } from '@/components/shared/section-heading';
import { CtaSection } from '@/components/shared/cta-section';

/**
 * Phase 21/22 both flagged About as the one remaining page from the master
 * prompt's list with no existing schema to draw from — unlike Contact,
 * which read `WebsiteSettings.contact` that had existed since Phase 7,
 * About needed its own CMS-editable content block. This phase adds that:
 * `backend/src/modules/about` (a singleton document, same `key`-based
 * upsert pattern as `WebsiteSettings`) plus a CMS editor and this page.
 *
 * Hero background precedence (Phase 26 wires the gap Phase 22-25 all
 * flagged): `AboutPage.heroImage` first - it's an operator-chosen image
 * scoped specifically to this page's content - then a `useBanners('about')`
 * placement image (same `Banner` entity `hero-section.tsx` already reads
 * for `'hero'`), then the static teak-deep gradient every interior page
 * falls back to when neither is set. Only the image is taken from the
 * banner; `heroTitle`/`heroSubtitle` stay sourced from `AboutPage` the way
 * they always have, matching the precedent `category-listing-page.tsx`
 * already set for `cat.banner` (image swap only, text stays page-owned).
 */
export function AboutPage() {
  const { data: about, isLoading, isError } = useAboutPage();
  const { data: banners } = useBanners('about');
  const banner = banners?.[0];
  const heroImage = about?.heroImage?.url || banner?.desktopImage?.url;

  // The `/about` row in the centralized SEO CMS section overrides these —
  // `useSeoMeta` fetches it itself via `useSeoOverride`. What's below is
  // just the fallback chain for when nothing's been entered there yet:
  // `storyContent` truncated, then a hardcoded sentence. `ogImage` follows
  // the same heroImage precedence as the section below.
  useSeoMeta({
    title: 'About Us',
    description:
      truncate(about?.storyContent) ||
      'The story, mission and people behind WOODIVO\u2019s handcrafted wooden temples, doors and furniture.',
    ogImage: heroImage,
    canonicalPath: '/about',
  });

  const storyParagraphs = (about?.storyContent ?? '')
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  return (
    <div>
      <section
        className="relative overflow-hidden bg-teak-deep bg-cover bg-center text-ivory"
        style={heroImage ? { backgroundImage: `url(${heroImage})` } : undefined}
      >
        <div className="absolute inset-0 bg-teak-deep/80" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,_rgba(176,129,63,0.18),_transparent_45%)]" />
        <div className="relative mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
          <div className="mb-6 flex justify-center">
            <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'About' }]} />
          </div>
          <h1 className="text-4xl sm:text-5xl">{about?.heroTitle || 'Our Story'}</h1>
          {about?.heroSubtitle ? (
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-ivory-deep/85">
              {about.heroSubtitle}
            </p>
          ) : null}
        </div>
      </section>

      {isLoading ? (
        <div className="px-4 py-16">
          <SectionSpinner />
        </div>
      ) : null}

      {isError ? (
        <div className="mx-auto max-w-xl px-4 py-16">
          <ErrorNote label="This page" />
        </div>
      ) : null}

      {!isLoading && !isError && about ? (
        <>
          {(about.storyTitle || storyParagraphs.length > 0 || about.storyImage) && (
            <section className="px-4 py-16 sm:px-6 lg:px-8">
              <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
                {about.storyImage?.url ? (
                  <div className="aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] border border-border-warm bg-ivory-deep">
                    <img
                      src={about.storyImage.url}
                      alt={about.storyImage.alt || about.storyTitle || 'Our story'}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : null}
                <div>
                  <SectionHeading
                    eyebrow="Our Story"
                    title={about.storyTitle || 'Rooted in craft'}
                    align="left"
                  />
                  <div className="mt-6 space-y-4 leading-relaxed text-charcoal-soft">
                    {storyParagraphs.map((paragraph, index) => (
                      <p key={index} className="whitespace-pre-line">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {(about.missionText || about.visionText) && (
            <section className="bg-ivory-deep px-4 py-16 sm:px-6 lg:px-8">
              <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-2">
                {about.missionText ? (
                  <div className="rounded-[var(--radius-card)] border border-border-warm bg-card p-8">
                    <Target className="h-7 w-7 text-brass" strokeWidth={1.5} />
                    <h3 className="mt-4 text-2xl text-teak">Our Mission</h3>
                    <p className="mt-3 leading-relaxed text-charcoal-soft">{about.missionText}</p>
                  </div>
                ) : null}
                {about.visionText ? (
                  <div className="rounded-[var(--radius-card)] border border-border-warm bg-card p-8">
                    <Eye className="h-7 w-7 text-brass" strokeWidth={1.5} />
                    <h3 className="mt-4 text-2xl text-teak">Our Vision</h3>
                    <p className="mt-3 leading-relaxed text-charcoal-soft">{about.visionText}</p>
                  </div>
                ) : null}
              </div>
            </section>
          )}

          {about.values.length > 0 && (
            <section className="bg-teak px-4 py-24 text-ivory sm:px-6 lg:px-8">
              <div className="mx-auto max-w-7xl">
                <SectionHeading eyebrow="What We Stand For" title="Our Values" tone="dark" />
                <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {about.values.map((value) => (
                    <div key={value.title} className="text-center">
                      <h3 className="text-xl text-ivory">{value.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-ivory-deep/75">
                        {value.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {about.milestones.length > 0 && (
            <section className="px-4 py-16 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-3xl">
                <SectionHeading eyebrow="Our Journey" title="Milestones" />
                <ol className="mt-14 space-y-10 border-l border-border-warm pl-8">
                  {about.milestones.map((milestone, index) => (
                    <li key={index} className="relative">
                      <span className="absolute -left-[calc(2rem+5px)] top-1 h-2.5 w-2.5 rounded-full bg-brass" />
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brass">
                        {milestone.year}
                      </p>
                      <h3 className="mt-1 text-xl text-teak">{milestone.title}</h3>
                      {milestone.description ? (
                        <p className="mt-2 leading-relaxed text-charcoal-soft">
                          {milestone.description}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ol>
              </div>
            </section>
          )}

          {about.teamMembers.length > 0 && (
            <section className="bg-ivory-deep px-4 py-16 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-6xl">
                <SectionHeading
                  eyebrow="Meet the Team"
                  title={about.teamTitle || 'The people behind the craft'}
                  description={about.teamSubtitle}
                />
                <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {about.teamMembers.map((member, index) => (
                    <div key={index} className="text-center">
                      <div className="mx-auto h-28 w-28 overflow-hidden rounded-full border border-border-warm bg-card">
                        {member.photo?.url ? (
                          <img
                            src={member.photo.url}
                            alt={member.photo.alt || member.name}
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                      </div>
                      <h3 className="mt-4 text-lg text-teak">{member.name}</h3>
                      <p className="text-xs font-semibold uppercase tracking-wider text-brass">
                        {member.role}
                      </p>
                      {member.bio ? (
                        <p className="mt-2 text-sm leading-relaxed text-charcoal-soft">
                          {member.bio}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      ) : null}

      <CtaSection
        title={about?.ctaTitle || undefined}
        text={about?.ctaText || undefined}
        source="about"
      />
    </div>
  );
}
