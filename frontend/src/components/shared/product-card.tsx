import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import type { MediaAsset } from '@/types/common';
import type { ProductCategoryRef } from '@/types/product';
import { useEnquiryDialog } from '@/features/enquiry/enquiry-dialog-context';
import { formatPrice } from '@/lib/utils';

/**
 * Deliberately narrower than the full `Product` type. The two places this
 * card is fed from a "related products" list (`RelatedProductRef`, per
 * `findBySlugPublic`'s `select: 'name slug images price discountPrice'`
 * populate) don't carry a `category` at all — full `Product` items
 * (featured products, category listing) do. Structural typing means both
 * satisfy this without either page needing to fake the missing field.
 * `price`/`discountPrice` are optional for the same reason — older
 * cached data or a related-product select that ever drops them shouldn't
 * crash the card, it just renders without a price row.
 */
export interface ProductCardItem {
  _id: string;
  name: string;
  slug: string;
  images?: MediaAsset[];
  category?: ProductCategoryRef | string;
  price?: number;
  discountPrice?: number;
}

/**
 * Was inline JSX inside FeaturedProductsSection through Phase 18 — pulled
 * out here because Phase 19 needs the exact same card in three more places
 * (category listing grid, product-detail "related products") and forking
 * near-identical copies would drift the moment one gets a design tweak the
 * others don't.
 *
 * Visual language matches the reference storefront's product tile: white
 * card, square image, name, price row, action row. Every product now
 * carries a `price` (and optionally a lower `discountPrice`, shown
 * struck-through next to it) — pieces remain made-to-order/quote-
 * adjustable in practice, so the CTA stays "Enquire Now" rather than an
 * "Add to cart" the site has no checkout to back up.
 */
export function ProductCard({ product }: { product: ProductCardItem }) {
  const { openEnquiryDialog } = useEnquiryDialog();
  const categorySlug = typeof product.category === 'object' ? product.category.slug : undefined;

  const hasDiscount =
    typeof product.discountPrice === 'number' &&
    typeof product.price === 'number' &&
    product.discountPrice < product.price;

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
        {hasDiscount ? (
          <span className="absolute left-2.5 top-2.5 rounded-[var(--radius-pill)] bg-rust px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ivory">
            {Math.round(((product.price! - product.discountPrice!) / product.price!) * 100)}% Off
          </span>
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col gap-2.5 p-3.5">
        <Link
          to={`/products/${product.slug}`}
          className="text-sm font-medium leading-snug text-charcoal hover:text-brass"
        >
          {product.name}
        </Link>
        {typeof product.price === 'number' ? (
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold text-charcoal">
              {formatPrice(hasDiscount ? product.discountPrice : product.price)}
            </span>
            {hasDiscount ? (
              <span className="text-xs text-charcoal-soft/70 line-through">
                {formatPrice(product.price)}
              </span>
            ) : null}
          </div>
        ) : null}
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
