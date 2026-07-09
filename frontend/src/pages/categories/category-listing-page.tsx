import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { useCategory } from '@/features/categories/categories-api';
import { useProducts } from '@/features/products/products-api';
import { useEnquiryDialog } from '@/features/enquiry/enquiry-dialog-context';
import { useSeoMeta } from '@/lib/use-seo-meta';
import { isNotFoundError } from '@/lib/http-error';
import { truncate, cn } from '@/lib/utils';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { SectionSpinner } from '@/components/shared/spinner';
import { ErrorNote } from '@/components/shared/error-note';
import { EntityNotFound } from '@/components/shared/entity-not-found';
import { ProductCard } from '@/components/shared/product-card';
import { Pagination } from '@/components/shared/pagination';

const PAGE_SIZE = 12;

type SortOption = 'featured' | 'name-asc' | 'name-desc' | 'newest';

const SORT_LABELS: Record<SortOption, string> = {
  featured: 'Featured',
  'name-asc': 'Name: A-Z',
  'name-desc': 'Name: Z-A',
  newest: 'Newest',
};

export function CategoryListingPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { openEnquiryDialog } = useEnquiryDialog();
  const navigate = useNavigate();
  const [sort, setSort] = useState<SortOption>('featured');
  const [sortOpen, setSortOpen] = useState(false);

  const page = Math.max(1, Number(searchParams.get('page')) || 1);

  const category = useCategory(slug);
  const products = useProducts({ category: slug, page, limit: PAGE_SIZE });

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

  const items = products.data?.items ?? [];
  const sortedItems = [...items].sort((a, b) => {
    switch (sort) {
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default:
        return a.displayOrder - b.displayOrder;
    }
  });

  return (
    <div>
      <div className="border-b border-border-warm px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-3 hidden sm:block">
            <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: cat.name }]} />
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
                <h1 className="text-xl sm:text-2xl">{cat.name}</h1>
                {products.data ? (
                  <p className="text-xs text-charcoal-soft sm:text-sm">
                    {products.data.meta.total} {products.data.meta.total === 1 ? 'item' : 'items'}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setSortOpen((v) => !v)}
                className="flex h-9 items-center gap-1.5 rounded-[var(--radius-card)] border border-border-warm px-3 text-sm font-medium text-charcoal hover:border-brass"
              >
                <span className="hidden text-charcoal-soft sm:inline">Sort by</span>
                {SORT_LABELS[sort]}
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              {sortOpen ? (
                <div className="absolute right-0 top-full z-10 mt-2 w-44 rounded-[var(--radius-card)] border border-border-warm bg-ivory p-1.5 shadow-lg shadow-charcoal/10">
                  {(Object.keys(SORT_LABELS) as SortOption[]).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setSort(option);
                        setSortOpen(false);
                      }}
                      className={cn(
                        'block w-full rounded px-3 py-2 text-left text-sm hover:bg-ivory-deep',
                        sort === option ? 'text-brass' : 'text-charcoal',
                      )}
                    >
                      {SORT_LABELS[option]}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          {cat.description ? (
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-charcoal-soft">
              {cat.description}
            </p>
          ) : null}
        </div>
      </div>

      <section className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {products.isLoading ? <SectionSpinner /> : null}
          {products.isError ? <ErrorNote label="Products" /> : null}

          {!products.isLoading && !products.isError && sortedItems.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-charcoal-soft">
                No products are listed under {cat.name} yet — check back soon, or ask us directly.
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

          {sortedItems.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
                {sortedItems.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
              {products.data ? (
                <Pagination
                  page={products.data.meta.page}
                  totalPages={products.data.meta.totalPages}
                  onPageChange={goToPage}
                />
              ) : null}
            </>
          ) : null}
        </div>
      </section>
    </div>
  );
}
