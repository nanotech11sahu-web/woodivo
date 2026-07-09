import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import type { MediaAsset } from '@/types/common';
import type { ProductCategoryRef } from '@/types/product';
import { useEnquiryDialog } from '@/features/enquiry/enquiry-dialog-context';

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
 *
 * Visual language matches the reference storefront's product tile: white
 * card, square image, name, price-row-shaped action row — but since
 * Woodivo products carry no price (custom-order, quote-based), the pill
 * reads "Enquire Now" in the same slot the reference uses for "Add +". It's
 * rendered as a solid filled button (not a thin outline) so it reads as a
 * real, clickable call-to-action rather than a decorative label.
 */
export function ProductCard({ product }: { product: ProductCardItem }) {
  const { openEnquiryDialog } = useEnquiryDialog();
  const categorySlug = typeof product.category === 'object' ? product.category.slug : undefined;

  return (
    <div className="group flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-border-warm bg-ivory transition-shadow hover:shadow-lg hover:shadow-charcoal/10">
      <Link
        to={`/products/${product.slug}`}
        className="relative block aspect-square overflow-hidden bg-ivory-deep"
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
      <div className="flex flex-1 flex-col gap-2.5 p-3.5">
        <Link
          to={`/products/${product.slug}`}
          className="text-sm font-medium leading-snug text-charcoal hover:text-brass"
        >
          {product.name}
        </Link>
        <button
          type="button"
          onClick={() => openEnquiryDialog('product', categorySlug)}
          className="mt-auto inline-flex h-9 w-fit items-center gap-1.5 rounded-[var(--radius-pill)] bg-brass px-4 text-xs font-semibold uppercase tracking-wide text-ivory shadow-sm transition-all hover:bg-brass-light hover:shadow-md active:scale-95"
        >
          Enquire Now
          <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
