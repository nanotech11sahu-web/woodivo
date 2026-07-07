import { Link } from 'react-router-dom';
import type { MediaAsset } from '@/types/common';
import type { ProductCategoryRef } from '@/types/product';
import { useEnquiryDialog } from '@/features/enquiry/enquiry-dialog-context';
import { Button } from '@/components/ui/button';

/**
 * Deliberately narrower than the full `Product` type. The two places this
 * card is fed from a "related products" list (`RelatedProductRef`, per
 * `findBySlugPublic`'s `select: 'name slug images seo'` populate) don't
 * carry a `category` at all — full `Product` items (featured products,
 * category listing) do. Structural typing means both satisfy this without
 * either page needing to fake the missing field.
 */
export interface ProductCardItem {
  _id: string;
  name: string;
  slug: string;
  images?: MediaAsset[];
  category?: ProductCategoryRef | string;
}

/**
 * Was inline JSX inside FeaturedProductsSection through Phase 18 — pulled
 * out here because Phase 19 needs the exact same card in three more places
 * (category listing grid, product-detail "related products") and forking
 * near-identical copies would drift the moment one gets a design tweak the
 * others don't.
 */
export function ProductCard({ product }: { product: ProductCardItem }) {
  const { openEnquiryDialog } = useEnquiryDialog();
  const categorySlug = typeof product.category === 'object' ? product.category.slug : undefined;

  return (
    <div className="group flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-border-warm bg-ivory">
      <Link
        to={`/products/${product.slug}`}
        className="relative block aspect-square overflow-hidden bg-brass-pale"
      >
        {product.images?.[0]?.url ? (
          <img
            src={product.images[0].url}
            alt={product.images[0].alt || product.name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <Link to={`/products/${product.slug}`} className="text-sm font-medium text-charcoal hover:text-brass">
          {product.name}
        </Link>
        <Button
          variant="link"
          size="sm"
          className="mt-2 self-start"
          onClick={() => openEnquiryDialog('product', categorySlug)}
        >
          Get Quote →
        </Button>
      </div>
    </div>
  );
}
