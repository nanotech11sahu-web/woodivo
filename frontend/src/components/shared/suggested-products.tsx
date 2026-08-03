import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ImageOff, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useFeaturedProducts, useProducts } from '@/features/products/products-api';
import { useCreateEnquiry } from '@/features/enquiry/enquiry-api';
import type { EnquirySource } from '@/types/enquiry';
import type { Product } from '@/types/product';
import { formatPrice } from '@/lib/utils';

interface SubmittedContact {
  fullName: string;
  mobileNumber: string;
  state?: string;
  city?: string;
  interestedCategory?: string;
}

interface SuggestedProductsProps {
  contact: SubmittedContact;
  excludeProductSlug?: string;
  source: EnquirySource;
}

const SUGGESTION_LIMIT = 4;

/**
 * Shown in the enquiry form's thank-you state — reuses the contact details
 * just submitted, so following up on another product is a single click
 * instead of filling the whole form again. Prefers products from the same
 * category as the enquiry just sent; falls back to featured products when
 * there's no category to match on (or that category turns up nothing).
 */
export function SuggestedProducts({ contact, excludeProductSlug, source }: SuggestedProductsProps) {
  const { t } = useTranslation();
  const categorySlug = contact.interestedCategory;

  const categoryProducts = useProducts(
    { category: categorySlug, limit: SUGGESTION_LIMIT + 1 },
    { enabled: Boolean(categorySlug) },
  );
  const featuredProducts = useFeaturedProducts(SUGGESTION_LIMIT + 1);

  const pool = categorySlug && categoryProducts.data?.items.length
    ? categoryProducts.data.items
    : featuredProducts.data?.items ?? [];

  const suggestions = pool
    .filter((product) => product.slug !== excludeProductSlug)
    .slice(0, SUGGESTION_LIMIT);

  if (suggestions.length === 0) return null;

  return (
    <div className="mt-6 w-full border-t border-border-warm pt-6 text-left">
      <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.2em] text-brass">
        {t('enquiry_form.you_may_also_like')}
      </p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {suggestions.map((product) => (
          <SuggestedProductCard
            key={product._id}
            product={product}
            contact={contact}
            source={source}
          />
        ))}
      </div>
    </div>
  );
}

function SuggestedProductCard({
  product,
  contact,
  source,
}: {
  product: Product;
  contact: SubmittedContact;
  source: EnquirySource;
}) {
  const { t } = useTranslation();
  const createEnquiry = useCreateEnquiry();
  const [sent, setSent] = useState(false);

  function handleSendEnquiry() {
    createEnquiry.mutate(
      {
        fullName: contact.fullName,
        mobileNumber: contact.mobileNumber,
        state: contact.state,
        city: contact.city,
        interestedProduct: product.slug,
        source,
      },
      { onSuccess: () => setSent(true) },
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Link
        to={`/products/${product.slug}`}
        className="block aspect-square overflow-hidden rounded-[var(--radius-card)] bg-ivory-deep"
      >
        {product.images?.[0]?.url ? (
          <img
            src={product.images[0].url}
            alt={product.images[0].alt || product.name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-charcoal-soft/40">
            <ImageOff className="h-6 w-6" />
          </div>
        )}
      </Link>
      <Link
        to={`/products/${product.slug}`}
        className="line-clamp-2 text-xs font-medium leading-snug text-charcoal hover:text-brass"
      >
        {product.name}
      </Link>
      {typeof product.price === 'number' ? (
        <span className="text-xs font-semibold text-charcoal">
          {product.stockStatus === 'made_to_order' ? '₹XXX' : formatPrice(product.price)}
        </span>
      ) : null}
      <button
        type="button"
        onClick={handleSendEnquiry}
        disabled={sent || createEnquiry.isPending}
        className="mt-0.5 inline-flex items-center justify-center gap-1 rounded-[var(--radius-pill)] border border-brass px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-brass transition-colors hover:bg-brass hover:text-ivory disabled:cursor-default disabled:border-brass/40 disabled:text-brass/60 disabled:hover:bg-transparent"
      >
        {sent ? (
          <>
            <CheckCircle2 className="h-3.5 w-3.5" />
            {t('enquiry_form.enquiry_sent')}
          </>
        ) : createEnquiry.isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          t('enquiry_form.send_enquiry')
        )}
      </button>
    </div>
  );
}
