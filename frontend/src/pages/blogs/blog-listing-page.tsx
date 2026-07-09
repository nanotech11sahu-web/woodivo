import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useBlogCategories, useBlogs } from '@/features/blogs/blogs-api';
import { useBanners } from '@/features/banners/banners-api';
import { useSeoMeta } from '@/lib/use-seo-meta';
import { useDebouncedValue } from '@/lib/use-debounced-value';
import { cn } from '@/lib/utils';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { SectionSpinner } from '@/components/shared/spinner';
import { ErrorNote } from '@/components/shared/error-note';
import { Pagination } from '@/components/shared/pagination';
import { BlogCard } from '@/components/shared/blog-card';
import { SearchInput } from '@/components/shared/search-input';

const PAGE_SIZE = 9;

/**
 * Single flat listing, filterable by category via `?category=`, same
 * "one page, filter with a query param instead of a nested route" call
 * `ProjectListingPage` (Phase 20) made — nothing in the master prompt's
 * page list names a per-category blog route, and the header/footer both
 * link to a plain `/blogs`.
 *
 * The filter pills themselves come from `GET /blogs/categories`
 * (`useBlogCategories`), not a hardcoded list — unlike `GalleryPage`'s
 * "All / Photos / Videos" toggle, which is safe to hardcode because
 * `GalleryItemType` is a fixed two-value schema enum, blog categories are
 * CMS-editable content (`BlogCategory` documents an admin can add, rename
 * or reorder at any time), the exact case the master prompt's "never
 * hardcode categories" rule exists for.
 *
 * `?search=` (Phase 28) layers on top of `?category=` the same way — both
 * params can be set at once, `useBlogs` passes them straight through to
 * `findAllPublic`'s `$text` search + category filter. The box is debounced
 * (`useDebouncedValue`, 400ms) so typing doesn't fire a request per
 * keystroke; `searchDraft` is local state so the input itself never
 * lags behind what's typed, only the URL/query update does.
 *
 * Hero: `'blog'` is the last of the three `BannerPlacement` values wired
 * this phase (About, Projects, Blogs — flagged every phase since 22).
 * Same image-only swap as `ProjectListingPage`: no entity here to carry a
 * hero image of its own, banner image or the existing radial gradient,
 * heading/description/category pills untouched.
 */
export function BlogListingPage() {
  const { data: banners } = useBanners('blog');
  const banner = banners?.[0];

  useSeoMeta({
    title: 'Blogs',
    description: 'Stories, guides and updates from the WOODIVO workshop — wood care, craft process and project features.',
    ogImage: banner?.desktopImage?.url,
    canonicalPath: '/blogs',
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const category = searchParams.get('category') ?? undefined;
  const search = searchParams.get('search') ?? undefined;

  // Draft state so the input reflects every keystroke immediately, while
  // the URL (and therefore the `useBlogs` query) only updates once typing
  // pauses. Seeded from the URL once so a shared/bookmarked `?search=`
  // link still shows in the box on load.
  const [searchDraft, setSearchDraft] = useState(() => searchParams.get('search') ?? '');
  const debouncedSearch = useDebouncedValue(searchDraft.trim(), 400);

  useEffect(() => {
    const current = searchParams.get('search') ?? '';
    if (current === debouncedSearch) return;
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('page');
      if (debouncedSearch) next.set('search', debouncedSearch);
      else next.delete('search');
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const categories = useBlogCategories();
  const blogs = useBlogs({ page, limit: PAGE_SIZE, category, search });

  function setCategory(nextSlug: string | undefined) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('page');
      if (nextSlug) next.set('category', nextSlug);
      else next.delete('category');
      return next;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function goToPage(nextPage: number) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (nextPage <= 1) next.delete('page');
      else next.set('page', String(nextPage));
      return next;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const activeCategoryName = categories.data?.find((cat) => cat.slug === category)?.name;

  return (
    <div>
      <section className="relative overflow-hidden bg-teak-deep text-ivory">
        {banner?.desktopImage?.url ? (
          <div className="absolute inset-0">
            <img
              src={banner.desktopImage.url}
              alt={banner.desktopImage.alt || banner.title}
              className="h-full w-full object-cover opacity-35"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-teak-deep via-teak-deep/75 to-teak-deep/40" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,_rgba(176,129,63,0.18),_transparent_45%)]" />
        )}
        <div className="relative mx-auto max-w-5xl px-4 py-14 text-center sm:px-6">
          <div className="mb-6 flex justify-center">
            <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Blogs' }]} />
          </div>
          <h1 className="text-4xl sm:text-5xl">
            {activeCategoryName ? activeCategoryName : 'Notes on wood, craft and care'}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-ivory-deep/85">
            Guides on choosing timber, maintaining a wooden temple, and what to expect from a
            made-to-order piece.
          </p>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-8 max-w-md">
            <SearchInput
              value={searchDraft}
              onChange={setSearchDraft}
              placeholder="Search blog posts…"
              aria-label="Search blog posts"
            />
          </div>

          {categories.data && categories.data.length > 0 ? (
            <div className="mb-10 flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={() => setCategory(undefined)}
                className={cn(
                  'rounded-[var(--radius-card)] border px-4 py-2 text-sm font-medium transition-colors',
                  !category
                    ? 'border-brass bg-brass text-ivory'
                    : 'border-border-warm text-charcoal-soft hover:border-brass hover:text-brass',
                )}
              >
                All
              </button>
              {categories.data.map((cat) => (
                <button
                  key={cat._id}
                  type="button"
                  onClick={() => setCategory(cat.slug)}
                  className={cn(
                    'rounded-[var(--radius-card)] border px-4 py-2 text-sm font-medium transition-colors',
                    category === cat.slug
                      ? 'border-brass bg-brass text-ivory'
                      : 'border-border-warm text-charcoal-soft hover:border-brass hover:text-brass',
                  )}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          ) : null}

          {blogs.isLoading ? <SectionSpinner /> : null}
          {blogs.isError ? <ErrorNote label="Blogs" /> : null}

          {!blogs.isLoading && !blogs.isError && blogs.data?.items.length === 0 ? (
            <p className="py-16 text-center text-charcoal-soft">
              {search
                ? `No posts match "${search}"${category ? ' in this category' : ''} — try a different search.`
                : category
                  ? 'No posts under this category yet — check back soon.'
                  : 'No posts published yet — check back soon.'}
            </p>
          ) : null}

          {blogs.data && blogs.data.items.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {blogs.data.items.map((blog) => (
                  <BlogCard key={blog._id} blog={blog} />
                ))}
              </div>
              <Pagination
                page={blogs.data.meta.page}
                totalPages={blogs.data.meta.totalPages}
                onPageChange={goToPage}
              />
            </>
          ) : null}
        </div>
      </section>
    </div>
  );
}
