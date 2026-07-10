import { useSearchParams } from 'react-router-dom';
import { useProjects } from '@/features/projects/projects-api';
import { useBanners } from '@/features/banners/banners-api';
import { SectionBannerSlider } from '@/components/shared/section-banner-slider';
import { useSeoMeta } from '@/lib/use-seo-meta';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { SectionSpinner } from '@/components/shared/spinner';
import { ErrorNote } from '@/components/shared/error-note';
import { Pagination } from '@/components/shared/pagination';
import { ProjectCard } from '@/components/shared/project-card';

const PAGE_SIZE = 12;

/**
 * Unlike category-listing-page (Phase 19), which is scoped to one category
 * via `:slug`, this is a single flat listing — the master prompt's page
 * list has one "Projects" page, not a dynamic-per-category one, and
 * nothing in the site links to a category-filtered project list yet. If
 * that need shows up later, `useProjects` already accepts a `category`
 * param (used by the backend's `findAllPublic`), so adding the filter
 * would be a query-param addition here, not a new hook.
 *
 * Hero: `'projects'` is one of the three `BannerPlacement` values flagged
 * every phase since 22 as never wired to `useBanners` (Phase 26 clears
 * this backlog item alongside About and Blogs). Unlike About or Category,
 * this page has no entity of its own to carry a hero image, so the banner
 * image is the only source — falling back to the same radial-gradient
 * block used when no banner is set for this placement. The heading and
 * description stay hardcoded strings, unchanged, matching the
 * image-only-swap precedent already set for `cat.banner`.
 */
export function ProjectListingPage() {
  const { data: banners } = useBanners('projects');
  const banner = banners?.[0];

  useSeoMeta({
    title: 'Projects',
    description: 'Completed WOODIVO installations — custom wooden temples, doors and furniture delivered across India.',
    ogImage: banner?.desktopImage?.url,
    canonicalPath: '/projects',
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, Number(searchParams.get('page')) || 1);

  const projects = useProjects({ page, limit: PAGE_SIZE });

  function goToPage(nextPage: number) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (nextPage <= 1) next.delete('page');
      else next.set('page', String(nextPage));
      return next;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div>
      <section className="relative overflow-hidden bg-teak-deep text-ivory">
        {banners && banners.length > 0 ? (
          <>
            <SectionBannerSlider banners={banners} dimmed showDots={banners.length > 1} />
            <div className="absolute inset-0 bg-gradient-to-t from-teak-deep via-teak-deep/75 to-teak-deep/40" />
          </>
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,_rgba(176,129,63,0.18),_transparent_45%)]" />
        )}
        <div className="relative mx-auto max-w-5xl px-4 py-14 text-center sm:px-6">
          <div className="mb-6 flex justify-center">
            <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Projects' }]} />
          </div>
          <h1 className="text-4xl sm:text-5xl">Our Projects</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-ivory-deep/85">
            Completed installations across temples, doors and full home interiors — a record of
            what we've built, site by site.
          </p>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {projects.isLoading ? <SectionSpinner /> : null}
          {projects.isError ? <ErrorNote label="Projects" /> : null}

          {!projects.isLoading && !projects.isError && projects.data?.items.length === 0 ? (
            <p className="py-16 text-center text-charcoal-soft">
              No projects are listed yet — check back soon.
            </p>
          ) : null}

          {projects.data && projects.data.items.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {projects.data.items.map((project) => (
                  <ProjectCard key={project._id} project={project} />
                ))}
              </div>
              <Pagination
                page={projects.data.meta.page}
                totalPages={projects.data.meta.totalPages}
                onPageChange={goToPage}
              />
            </>
          ) : null}
        </div>
      </section>
    </div>
  );
}
