import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Grid3x3 } from 'lucide-react';
import { useCategory } from '@/features/categories/categories-api';
import { useSubCategories } from '@/features/subcategories/subcategories-api';
import { useProducts } from '@/features/products/products-api';
import { useEnquiryDialog } from '@/features/enquiry/enquiry-dialog-context';
import { useSeoMeta } from '@/lib/use-seo-meta';
import { useDebouncedValue } from '@/lib/use-debounced-value';
import { isNotFoundError } from '@/lib/http-error';
import { truncate, cn } from '@/lib/utils';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { SectionSpinner } from '@/components/shared/spinner';
import { ErrorNote } from '@/components/shared/error-note';
import { EntityNotFound } from '@/components/shared/entity-not-found';
import { ProductCard } from '@/components/shared/product-card';
import { SubCategoryCard } from '@/components/shared/subcategory-card';
import { ProductFilterBar } from '@/components/shared/product-filter-bar';
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

  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const subCategorySlug = searchParams.get('subcategory') || undefined;
  const viewAll = searchParams.get('all') === '1';
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
  const showSubCategoryPicker = hasSubCategories && !subCategorySlug && !viewAll;

  const products = useProducts({
    category: slug,
    subCategory: subCategorySlug,
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

  function goToSubCategory(nextSlug: string | undefined) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('page');
      if (nextSlug) {
        next.set('subcategory', nextSlug);
        next.delete('all');
      } else {
        next.delete('subcategory');
      }
      return next;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function goToAllProducts() {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('page');
      next.delete('subcategory');
      next.set('all', '1');
      return next;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function backToSubCategories() {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('subcategory');
      next.delete('all');
      next.delete('page');
      return next;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const activeSubCategoryName = subCategories.data?.find((s) => s.slug === subCategorySlug)?.name;

  return (
    <div>
      <div className="border-b border-border-warm px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-3 hidden sm:block">
            <Breadcrumbs
              items={[
                { label: 'Home', to: '/' },
                ...(!subCategorySlug && !viewAll
                  ? [{ label: cat.name }]
                  : [{ label: cat.name, to: `/categories/${cat.slug}` }]),
                ...(activeSubCategoryName ? [{ label: activeSubCategoryName }] : []),
              ]}
            />
          </div>
          <div className="flex items-center justify-between gap-3">
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
                <h1 className="text-xl sm:text-2xl">
                  {activeSubCategoryName ?? cat.name}
                </h1>
                {!showSubCategoryPicker && products.data ? (
                  <p className="text-xs text-charcoal-soft sm:text-sm">
                    {products.data.meta.total} {products.data.meta.total === 1 ? 'item' : 'items'}
                  </p>
                ) : null}
                {showSubCategoryPicker && subCategories.data ? (
                  <p className="text-xs text-charcoal-soft sm:text-sm">
                    {subCategories.data.length} {subCategories.data.length === 1 ? 'collection' : 'collections'}
                  </p>
                ) : null}
              </div>
            </div>

          </div>

          {cat.description ? (
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-charcoal-soft">
              {cat.description}
            </p>
          ) : null}

          {!showSubCategoryPicker ? (
            <ProductFilterBar
              search={searchDraft}
              onSearchChange={setSearchDraft}
              searchPlaceholder={`Search in ${cat.name}…`}
              minPrice={minPriceDraft}
              maxPrice={maxPriceDraft}
              onMinPriceChange={setMinPriceDraft}
              onMaxPriceChange={setMaxPriceDraft}
              sort={sort}
              onSortChange={setSort}
              sortLabels={SORT_LABELS}
              sortOptions={SORT_OPTIONS}
            />
          ) : null}

          {!showSubCategoryPicker && hasSubCategories ? (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={backToSubCategories}
                className="flex items-center gap-1 rounded-[var(--radius-pill)] border border-border-warm px-3.5 py-1.5 text-sm font-medium text-charcoal-soft hover:border-brass hover:text-brass"
              >
                <Grid3x3 className="h-3.5 w-3.5" />
                Collections
              </button>
              <button
                type="button"
                onClick={goToAllProducts}
                className={cn(
                  'rounded-[var(--radius-pill)] border px-3.5 py-1.5 text-sm font-medium',
                  viewAll
                    ? 'border-brass bg-brass-pale text-brass'
                    : 'border-border-warm text-charcoal-soft hover:border-brass',
                )}
              >
                All
              </button>
              {subCategories.data?.map((subCat) => (
                <button
                  key={subCat._id}
                  type="button"
                  onClick={() => goToSubCategory(subCat.slug)}
                  className={cn(
                    'rounded-[var(--radius-pill)] border px-3.5 py-1.5 text-sm font-medium',
                    subCategorySlug === subCat.slug
                      ? 'border-brass bg-brass-pale text-brass'
                      : 'border-border-warm text-charcoal-soft hover:border-brass',
                  )}
                >
                  {subCat.name}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {showSubCategoryPicker ? (
        <section className="px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            {subCategories.isLoading ? <SectionSpinner /> : null}
            {subCategories.isError ? <ErrorNote label="Collections" /> : null}

            {subCategories.data && subCategories.data.length > 0 ? (
              <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
                {subCategories.data.map((subCat) => (
                  <SubCategoryCard key={subCat._id} subCategory={subCat} onSelect={goToSubCategory} />
                ))}
              </div>
            ) : null}

            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={goToAllProducts}
                className="inline-flex h-10 items-center rounded-[var(--radius-pill)] border border-brass px-5 text-sm font-semibold text-brass hover:bg-brass-pale"
              >
                Browse All Products in {cat.name}
              </button>
            </div>
          </div>
        </section>
      ) : (
        <section className="px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            {products.isLoading ? <SectionSpinner /> : null}
            {products.isError ? <ErrorNote label="Products" /> : null}

            {!products.isLoading && !products.isError && products.data?.items.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-charcoal-soft">
                  {debouncedSearch
                    ? `No products match "${debouncedSearch}" — try a different search or price range.`
                    : `No products are listed under ${activeSubCategoryName ?? cat.name} yet — check back soon, or ask us directly.`}
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
                <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
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
          </div>
        </section>
      )}
    </div>
  );
}
