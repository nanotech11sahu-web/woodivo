import { Link } from 'react-router-dom';
import { ImageOff } from 'lucide-react';
import type { MediaAsset } from '@/types/common';
import type { ProductCategoryRef } from '@/types/product';
import { useEnquiryDialog } from '@/features/enquiry/enquiry-dialog-context';
import { formatPrice, cn } from '@/lib/utils';

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
 * Photo-forward listing tile — the border/shadow/button-heavy version this
 * replaced put as much visual weight on chrome as on the product itself.
 * Here the image carries the card: no border, a hairline-thin shadow that
 * only appears on hover, and — when a product has a second photo — a
 * crossfade + slight zoom into it on hover (the "lifestyle" shot most
 * listings only show on the detail page). "Enquire" is a text link, not a
 * button, so it doesn't visually compete with the photo on every single
 * tile in a grid of twelve.
 */
export function ProductCard({ product }: { product: ProductCardItem }) {
  const { openEnquiryDialog } = useEnquiryDialog();
  const category = typeof product.category === 'object' ? product.category : undefined;
  const secondImage = product.images?.[1];

  const hasDiscount =
    typeof product.discountPrice === 'number' &&
    typeof product.price === 'number' &&
    product.discountPrice < product.price;

  return (
    <div className="group flex flex-col">
      <Link
        to={`/products/${product.slug}`}
        className="relative block aspect-square overflow-hidden rounded-[var(--radius-card)] bg-ivory-deep transition-shadow duration-300 group-hover:shadow-card-hover"
      >
        {product.images?.[0]?.url ? (
          <img
            src={product.images[0].url}
            alt={product.images[0].alt || product.name}
            loading="lazy"
            decoding="async"
            className={cn(
              'absolute inset-0 h-full w-full object-cover transition-[transform,opacity] duration-500 ease-out group-hover:scale-[1.04]',
              secondImage?.url && 'group-hover:opacity-0',
            )}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-charcoal-soft/40">
            <ImageOff className="h-8 w-8" />
          </div>
        )}
        {secondImage?.url ? (
          <img
            src={secondImage.url}
            alt={secondImage.alt || product.name}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-[transform,opacity] duration-500 ease-out group-hover:scale-[1.04] group-hover:opacity-100"
          />
        ) : null}
        {hasDiscount ? (
          <span className="absolute left-2.5 top-2.5 rounded-[var(--radius-pill)] bg-vermilion px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ivory">
            {Math.round(((product.price! - product.discountPrice!) / product.price!) * 100)}% Off
          </span>
        ) : null}
      </Link>
      <div className="mt-3 flex flex-1 flex-col gap-1">
        {category ? (
          <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-brass/80">
            {category.name}
          </span>
        ) : null}
        <Link
          to={`/products/${product.slug}`}
          className="font-display text-[15px] leading-snug text-charcoal hover:text-brass"
        >
          {product.name}
        </Link>
        {typeof product.price === 'number' ? (
          <div className="mt-0.5 flex items-baseline gap-2">
            <span className="text-base font-semibold text-charcoal">
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
          onClick={() =>
            openEnquiryDialog('product', {
              categorySlug: category?.slug,
              productSlug: product.slug,
              productName: product.name,
            })
          }
          className="mt-1.5 w-fit text-xs font-semibold uppercase tracking-wide text-brass underline-offset-4 hover:underline"
        >
          Enquire now
        </button>
      </div>
    </div>
  );
}
