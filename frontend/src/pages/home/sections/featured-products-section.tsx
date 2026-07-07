import { useFeaturedProducts } from '@/features/products/products-api';
import { SectionHeading } from '@/components/shared/section-heading';
import { SectionSpinner } from '@/components/shared/spinner';
import { ErrorNote } from '@/components/shared/error-note';
import { ProductCard } from '@/components/shared/product-card';

export function FeaturedProductsSection() {
  const { data, isLoading, isError } = useFeaturedProducts(8);
  const products = data?.items;

  if (!isLoading && !isError && (!products || products.length === 0)) {
    return null;
  }

  return (
    <section className="bg-ivory-deep px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Featured work"
          title="A few pieces we're proud of"
          description="A cross-section of what leaves the workshop — every item shown is available to order in your own dimensions and wood."
        />

        {isLoading ? <SectionSpinner /> : null}
        {isError ? <div className="mt-10"><ErrorNote label="Products" /></div> : null}

        {products && products.length > 0 ? (
          <div className="mt-14 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
