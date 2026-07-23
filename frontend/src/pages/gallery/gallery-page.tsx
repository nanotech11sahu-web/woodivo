import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PlayCircle } from 'lucide-react';
import { useGalleryItems } from '@/features/gallery/gallery-api';
import { useSeoMeta } from '@/lib/use-seo-meta';
import { useDebouncedValue } from '@/lib/use-debounced-value';
import { cn } from '@/lib/utils';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { SectionSpinner } from '@/components/shared/spinner';
import { ErrorNote } from '@/components/shared/error-note';
import { Pagination } from '@/components/shared/pagination';
import { GalleryLightbox } from '@/components/shared/gallery-lightbox';
import { SearchInput } from '@/components/shared/search-input';
import type { GalleryItemType } from '@/types/gallery';

const PAGE_SIZE = 24;

const TYPE_FILTERS: { label: string; value: GalleryItemType | undefined }[] = [
  { label: 'All', value: undefined },
  { label: 'Photos', value: 'image' },
  { label: 'Videos', value: 'video' },
];

/**
 * The "All / Photos / Videos" toggle stays hardcoded — `GalleryItemType`
 * is a fixed two-value schema enum, unlike blog categories, which are
 * CMS-editable content. Tags are still freeform strings set per-item in
 * the CMS with no "list distinct tags" endpoint behind `/gallery`, so
 * Phase 28 doesn't add a tag *chip* list (that would mean either
 * hardcoding a vocabulary the CMS never guarantees stays in sync, or a
 * new backend aggregation endpoint — a bigger change than this phase's
 * "search & tag-filter UI, no backend work" scope). Instead it's a
 * free-text box: type a tag, matching items filter via the exact `tag`
 * param `QueryPublicGalleryItemDto` already accepted before this phase
 * touched anything, same as the un-enumerated single-value filter the
 * admin gallery table already offers.
 */
export function GalleryPage() {
  const { t } = useTranslation();
  useSeoMeta({
    title: 'Gallery',
    description: 'Photos and videos of WOODIVO\u2019s handcrafted wooden temples, doors and furniture in workshop and finished settings.',
    canonicalPath: '/gallery',
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const type = (searchParams.get('type') as GalleryItemType | null) ?? undefined;
  const tag = searchParams.get('tag') ?? undefined;

  // Same draft/debounce split as the blog search box (Phase 28): the input
  // tracks every keystroke, the URL/query only updates once typing pauses.
  const [tagDraft, setTagDraft] = useState(() => searchParams.get('tag') ?? '');
  const debouncedTag = useDebouncedValue(tagDraft.trim(), 400);

  useEffect(() => {
    const current = searchParams.get('tag') ?? '';
    if (current === debouncedTag) return;
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('page');
      if (debouncedTag) next.set('tag', debouncedTag);
      else next.delete('tag');
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedTag]);

  const gallery = useGalleryItems({ page, limit: PAGE_SIZE, type, tag });
  const items = gallery.data?.items ?? [];

  function setType(nextType: GalleryItemType | undefined) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('page');
      if (nextType) next.set('type', nextType);
      else next.delete('type');
      return next;
    });
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

  return (
    <div>
      <section className="bg-teak-deep px-4 py-16 text-center text-ivory sm:px-6">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 flex justify-center">
            <Breadcrumbs items={[{ label: t('nav.home'), to: '/' }, { label: t('nav.gallery') }]} />
          </div>
          <h1 className="text-4xl sm:text-5xl">Gallery</h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-ivory-deep/85">
            A closer look at our craftsmanship — finished pieces, installations and details from
            the workshop floor.
          </p>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-6 max-w-md">
            <SearchInput
              value={tagDraft}
              onChange={setTagDraft}
              placeholder="Filter by tag…"
              aria-label="Filter gallery by tag"
            />
          </div>

          <div className="mb-10 flex justify-center gap-2">
            {TYPE_FILTERS.map((filter) => (
              <button
                key={filter.label}
                type="button"
                onClick={() => setType(filter.value)}
                className={cn(
                  'rounded-[var(--radius-card)] border px-4 py-2 text-sm font-medium transition-colors',
                  type === filter.value
                    ? 'border-brass bg-brass text-ivory'
                    : 'border-border-warm text-charcoal-soft hover:border-brass hover:text-brass',
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {gallery.isLoading ? <SectionSpinner /> : null}
          {gallery.isError ? <ErrorNote label="The gallery" /> : null}

          {!gallery.isLoading && !gallery.isError && items.length === 0 ? (
            <p className="py-16 text-center text-charcoal-soft">
              {tag
                ? `No items tagged "${tag}" — try a different tag.`
                : 'Nothing to show here yet — check back soon.'}
            </p>
          ) : null}

          {items.length > 0 ? (
            <>
              <div className="columns-2 gap-4 sm:columns-3 lg:columns-4">
                {items.map((item, index) => (
                  <button
                    key={item._id}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className="group relative mb-4 block w-full break-inside-avoid overflow-hidden rounded-[var(--radius-card)] border border-border-warm bg-ivory-deep"
                  >
                    <img
                      src={item.media.url}
                      alt={item.media.alt || item.caption || 'Gallery image'}
                      className="w-full transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    {item.type === 'video' ? (
                      <span className="absolute inset-0 flex items-center justify-center bg-charcoal/20">
                        <PlayCircle className="h-10 w-10 text-ivory drop-shadow" strokeWidth={1.5} />
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>

              <Pagination
                page={gallery.data?.meta.page ?? page}
                totalPages={gallery.data?.meta.totalPages ?? 1}
                onPageChange={goToPage}
              />
            </>
          ) : null}
        </div>
      </section>

      <GalleryLightbox
        items={items}
        activeIndex={activeIndex}
        onClose={() => setActiveIndex(null)}
        onNavigate={setActiveIndex}
      />
    </div>
  );
}
