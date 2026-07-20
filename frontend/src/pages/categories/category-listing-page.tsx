import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, X } from 'lucide-react';
import { useCategory } from '@/features/categories/categories-api';
import { useSubCategories } from '@/features/subcategories/subcategories-api';
import { useProducts } from '@/features/products/products-api';
import { useEnquiryDialog } from '@/features/enquiry/enquiry-dialog-context';
import { useSeoMeta } from '@/lib/use-seo-meta';
import { useDebouncedValue } from '@/lib/use-debounced-value';
import { isNotFoundError } from '@/lib/http-error';
import { truncate } from '@/lib/utils';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { SectionSpinner } from '@/components/shared/spinner';
import { ErrorNote } from '@/components/shared/error-note';
import { EntityNotFound } from '@/components/shared/entity-not-found';
import { ProductCard } from '@/components/shared/product-card';
import { ProductFilterBar } from '@/components/shared/product-filter-bar';
import { CategoryFilterSidebar } from '@/components/shared/category-filter-sidebar';
import { Pagination } from '@/components/shared/pagination';
import type { ProductPublicSort } from '@/types/product';

const PAGE_SIZE = 12;

const SORT_LABELS: Record<ProductPublicSort, string> = {
  featured: 'Featured',
  latest: 'Latest',
  popular: 'Popular',
  'most-purchased': 'Most Purchased',
  'price-asc': 'Price: Low to High',
  'price-desc': 'Price: High to Low',
  'name-asc': 'Name: A-Z',
  'name-desc': 'Name: Z-A',
};

const SORT_OPTIONS = Object.keys(SORT_LABELS) as ProductPublicSort[];

export function CategoryListingPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { openEnquiryDialog } = useEnquiryDialog();
  const navigate = useNavigate();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const subCategorySlugs = (searchParams.get('subcategory') ?? '').split(',').filter(Boolean);
  const sort = (searchParams.get('sort') as ProductPublicSort | null) || 'featured';
  const minPriceParam = searchParams.get('minPrice');
  const maxPriceParam = searchParams.get('maxPrice');

  // Draft state so the search box and price inputs reflect every
  // keystroke immediately, while the URL (and therefore the `useProducts`
  // query) only updates once typing pauses — same pattern as
  // `BlogListingPage`'s `search` param.
  const [searchDraft, setSearchDraft] = useState(() => searchParams.get('search') ?? '');
  const debouncedSearch = useDebouncedValue(searchDraft.trim(), 400);

  const [minPriceDraft, setMinPriceDraft] = useState(() => minPriceParam ?? '');
  const [maxPriceDraft, setMaxPriceDraft] = useState(() => maxPriceParam ?? '');
  const debouncedMinPrice = useDebouncedValue(minPriceDraft.trim(), 500);
  const debouncedMaxPrice = useDebouncedValue(maxPriceDraft.trim(), 500);

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

  useEffect(() => {
    const currentMin = searchParams.get('minPrice') ?? '';
    const currentMax = searchParams.get('maxPrice') ?? '';
    if (currentMin === debouncedMinPrice && currentMax === debouncedMaxPrice) return;
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('page');
      if (debouncedMinPrice) next.set('minPrice', debouncedMinPrice);
      else next.delete('minPrice');
      if (debouncedMaxPrice) next.set('maxPrice', debouncedMaxPrice);
      else next.delete('maxPrice');
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedMinPrice, debouncedMaxPrice]);

  const category = useCategory(slug);
  const subCategories = useSubCategories(slug);
  const hasSubCategories = Boolean(subCategories.data && subCategories.data.length > 0);

  const products = useProducts({
    category: slug,
    subCategory: subCategorySlugs.length ? subCategorySlugs.join(',') : undefined,
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
    sort,
    minPrice: debouncedMinPrice ? Number(debouncedMinPrice) : undefined,
    maxPrice: debouncedMaxPrice ? Number(debouncedMaxPrice) : undefined,
  });

  useSeoMeta({
    title: category.data?.name,
    description: truncate(category.data?.description),
    ogImage: category.data?.banner?.url || category.data?.thumbnail?.url,
    canonicalPath: slug ? `/categories/${slug}` : undefined,
  });

  if (category.isLoading) {
    return <SectionSpinner />;
  }

  if (category.isError) {
    if (isNotFoundError(category.error)) {
      return (
        <EntityNotFound
          title="This category isn't available."
          message="It may have been renamed or unpublished. Browse everything we currently offer instead."
          backHref="/"
          backLabel="Back to Home"
        />
      );
    }
    return (
      <div className="mx-auto max-w-xl px-4 py-24">
        <ErrorNote label="This category" />
      </div>
    );
  }

  const cat = category.data;
  if (!cat) return null;

  function goToPage(nextPage: number) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (nextPage <= 1) next.delete('page');
      else next.set('page', String(nextPage));
      return next;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function toggleSubCategory(nextSlug: string) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('page');
      const current = new Set(subCategorySlugs);
      if (current.has(nextSlug)) current.delete(nextSlug);
      else current.add(nextSlug);
      if (current.size) next.set('subcategory', [...current].join(','));
      else next.delete('subcategory');
      return next;
    });
  }

  function clearAllFilters() {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('page');
      next.delete('subcategory');
      next.delete('minPrice');
      next.delete('maxPrice');
      return next;
    });
    setMinPriceDraft('');
    setMaxPriceDraft('');
  }

  function setSort(nextSort: ProductPublicSort) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('page');
      if (nextSort === 'featured') next.delete('sort');
      else next.set('sort', nextSort);
      return next;
    });
  }

  const activeFilterCount =
    subCategorySlugs.length + (minPriceDraft ? 1 : 0) + (maxPriceDraft ? 1 : 0);

  const activeSubCategoryNames = subCategorySlugs
    .map((s) => subCategories.data?.find((sc) => sc.slug === s)?.name)
    .filter((name): name is string => Boolean(name));

  return (
    <div>
      <div className="border-b border-border-warm px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-3 hidden sm:block">
            <Breadcrumbs
              items={[
                { label: 'Home', to: '/' },
                { label: cat.name },
              ]}
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label="Go back"
              className="flex h-8 w-8 items-center justify-center rounded-full text-charcoal hover:bg-ivory-deep sm:hidden"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl">{cat.name}</h1>
              {products.data ? (
                <p className="text-xs text-charcoal-soft sm:text-sm">
                  {products.data.meta.total} {products.data.meta.total === 1 ? 'item' : 'items'}
                  {activeSubCategoryNames.length ? ` in ${activeSubCategoryNames.join(', ')}` : ''}
                </p>
              ) : null}
            </div>
          </div>

          {cat.description ? (
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-charcoal-soft">{cat.description}</p>
          ) : null}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-[240px_1fr] lg:items-start lg:gap-8">
          {hasSubCategories ? (
            <aside className="hidden lg:sticky lg:top-20 lg:block lg:rounded-[var(--radius-card)] lg:border lg:border-border-warm lg:bg-ivory lg:p-5 lg:shadow-card">
              <CategoryFilterSidebar
                subCategories={subCategories.data ?? []}
                selectedSlugs={subCategorySlugs}
                onToggleSubCategory={toggleSubCategory}
                minPrice={minPriceDraft}
                maxPrice={maxPriceDraft}
                onMinPriceChange={setMinPriceDraft}
                onMaxPriceChange={setMaxPriceDraft}
                onClearAll={clearAllFilters}
              />
            </aside>
          ) : null}

          <div>
            <ProductFilterBar
              search={searchDraft}
              onSearchChange={setSearchDraft}
              searchPlaceholder={`Search in ${cat.name}…`}
              sort={sort}
              onSortChange={setSort}
              sortLabels={SORT_LABELS}
              sortOptions={SORT_OPTIONS}
              onOpenMobileFilters={hasSubCategories ? () => setMobileFiltersOpen(true) : undefined}
              mobileFilterCount={activeFilterCount}
            />

            <section className="mt-6">
              {products.isLoading ? <SectionSpinner /> : null}
              {products.isError ? <ErrorNote label="Products" /> : null}

              {!products.isLoading && !products.isError && products.data?.items.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="text-charcoal-soft">
                    {debouncedSearch
                      ? `No products match "${debouncedSearch}" — try a different search or price range.`
                      : `No products are listed under ${activeSubCategoryNames.join(', ') || cat.name} yet — check back soon, or ask us directly.`}
                  </p>
                  <button
                    type="button"
                    onClick={() => openEnquiryDialog('category', cat.slug)}
                    className="mt-4 inline-flex h-10 items-center rounded-[var(--radius-pill)] border border-brass px-5 text-sm font-semibold text-brass hover:bg-brass-pale"
                  >
                    Enquire About {cat.name}
                  </button>
                </div>
              ) : null}

              {products.data && products.data.items.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 xl:grid-cols-4">
                    {products.data.items.map((product) => (
                      <ProductCard key={product._id} product={product} />
                    ))}
                  </div>
                  <Pagination
                    page={products.data.meta.page}
                    totalPages={products.data.meta.totalPages}
                    onPageChange={goToPage}
                  />
                </>
              ) : null}
            </section>
          </div>
        </div>
      </div>

      {mobileFiltersOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close filters"
            className="absolute inset-0 bg-charcoal/40"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-[85%] max-w-sm flex-col bg-ivory shadow-pop">
            <div className="flex items-center justify-between border-b border-border-warm px-4 py-3">
              <p className="text-sm font-semibold text-charcoal">Filters</p>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                aria-label="Close filters"
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-ivory-deep"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <CategoryFilterSidebar
                subCategories={subCategories.data ?? []}
                selectedSlugs={subCategorySlugs}
                onToggleSubCategory={toggleSubCategory}
                minPrice={minPriceDraft}
                maxPrice={maxPriceDraft}
                onMinPriceChange={setMinPriceDraft}
                onMaxPriceChange={setMaxPriceDraft}
                onClearAll={clearAllFilters}
              />
            </div>
            <div className="border-t border-border-warm p-4">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="flex h-11 w-full items-center justify-center rounded-[var(--radius-pill)] bg-brass text-sm font-semibold text-ivory hover:bg-brass-light"
              >
                Show {products.data?.meta.total ?? 0} results
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
