import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useProducts } from '@/features/products/products-api';
import { useCategories } from '@/features/categories/categories-api';
import { useSeoMeta } from '@/lib/use-seo-meta';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { SectionSpinner } from '@/components/shared/spinner';
import { ErrorNote } from '@/components/shared/error-note';
import { ProductCard } from '@/components/shared/product-card';
import { Pagination } from '@/components/shared/pagination';

const PAGE_SIZE = 12;

export function SearchResultsPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q')?.trim() ?? '';
  const page = Math.max(1, Number(searchParams.get('page')) || 1);

  const products = useProducts({ search: query || undefined, page, limit: PAGE_SIZE });
  const { data: categories } = useCategories();

  useSeoMeta({
    title: query ? `Search results for "${query}"` : 'Search',
    description: `Products matching "${query}" on Woodivo.`,
  });

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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: t('nav.home'), to: '/' }, { label: 'Search' }]} />
      <h1 className="mt-4 text-2xl sm:text-3xl">
        {query ? (
          <>
            Results for <span className="text-brass">&ldquo;{query}&rdquo;</span>
          </>
        ) : (
          'Search'
        )}
      </h1>
      {products.data ? (
        <p className="mt-1 text-sm text-charcoal-soft">
          {products.data.meta.total} {products.data.meta.total === 1 ? 'product' : 'products'} found
        </p>
      ) : null}

      <div className="mt-8">
        {!query ? (
          <p className="py-16 text-center text-charcoal-soft">
            Type something into the search bar to find products.
          </p>
        ) : null}

        {query && products.isLoading ? <SectionSpinner /> : null}
        {query && products.isError ? <ErrorNote label="Search results" /> : null}

        {query && products.data && products.data.items.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-charcoal-soft">
              No products matched &ldquo;{query}&rdquo;. Try a different search, or browse
              a category instead.
            </p>
            {categories && categories.length > 0 ? (
              <div className="mt-6 flex flex-wrap justify-center gap-2.5">
                {categories.slice(0, 8).map((category) => (
                  <Link
                    key={category._id}
                    to={`/categories/${category.slug}`}
                    className="rounded-[var(--radius-pill)] border border-brass px-4 py-2 text-sm font-medium text-brass hover:bg-brass-pale"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        {query && products.data && products.data.items.length > 0 ? (
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
    </div>
  );
}
