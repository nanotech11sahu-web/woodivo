import { Link } from 'react-router-dom';
import { useFeaturedProducts } from '@/features/products/products-api';
import { SectionSpinner } from '@/components/shared/spinner';
import { ErrorNote } from '@/components/shared/error-note';
import { ProductCard } from '@/components/shared/product-card';
import { CardSlider, sliderItemWidths } from '@/components/shared/card-slider';

export function FeaturedProductsSection() {
  const { data, isLoading, isError } = useFeaturedProducts(8);
  const products = data?.items;

  if (!isLoading && !isError && (!products || products.length === 0)) {
    return null;
  }

  return (
    <section className="bg-ivory-deep px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl sm:text-2xl">Featured Products</h2>
          <Link to="/categories" className="text-sm font-medium text-brass hover:text-brass-light">
            View all
          </Link>
        </div>

        {isLoading ? <SectionSpinner /> : null}
        {isError ? <div className="mt-6"><ErrorNote label="Products" /></div> : null}

        {products && products.length > 0 ? (
          <CardSlider className="mt-6">
            {products.map((product) => (
              <div key={product._id} className={sliderItemWidths.product}>
                <ProductCard product={product} />
              </div>
            ))}
          </CardSlider>
        ) : null}
      </div>
    </section>
  );
}
