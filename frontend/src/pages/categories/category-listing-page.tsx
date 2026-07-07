import { useParams, useSearchParams } from 'react-router-dom';
import { useCategory } from '@/features/categories/categories-api';
import { useProducts } from '@/features/products/products-api';
import { useEnquiryDialog } from '@/features/enquiry/enquiry-dialog-context';
import { useSeoMeta } from '@/lib/use-seo-meta';
import { isNotFoundError } from '@/lib/http-error';
import { truncate } from '@/lib/utils';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { SectionSpinner } from '@/components/shared/spinner';
import { ErrorNote } from '@/components/shared/error-note';
import { EntityNotFound } from '@/components/shared/entity-not-found';
import { ProductCard } from '@/components/shared/product-card';
import { Pagination } from '@/components/shared/pagination';
import { Button } from '@/components/ui/button';

const PAGE_SIZE = 12;

export function CategoryListingPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { openEnquiryDialog } = useEnquiryDialog();

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

  return (
    <div>
      <section className="relative overflow-hidden bg-teak-deep text-ivory">
        {cat.banner?.url ? (
          <div className="absolute inset-0">
            <img
              src={cat.banner.url}
              alt={cat.banner.alt || cat.name}
              className="h-full w-full object-cover opacity-35"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-teak-deep via-teak-deep/75 to-teak-deep/40" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,_rgba(176,129,63,0.18),_transparent_45%)]" />
        )}

        <div className="relative mx-auto max-w-5xl px-4 py-20 text-center sm:px-6">
          <div className="mb-6 flex justify-center">
            <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: cat.name }]} />
          </div>
          <h1 className="text-4xl sm:text-5xl">{cat.name}</h1>
          {cat.description ? (
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-ivory-deep/85">
              {cat.description}
            </p>
          ) : null}
          <Button
            variant="brass"
            size="lg"
            className="mt-8"
            onClick={() => openEnquiryDialog('category', cat.slug)}
          >
            Enquire About {cat.name}
          </Button>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {products.isLoading ? <SectionSpinner /> : null}
          {products.isError ? <ErrorNote label="Products" /> : null}

          {!products.isLoading && !products.isError && products.data?.items.length === 0 ? (
            <p className="py-16 text-center text-charcoal-soft">
              No products are listed under {cat.name} yet — check back soon, or ask us directly.
            </p>
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
    </div>
  );
}
