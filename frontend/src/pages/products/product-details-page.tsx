import { Link, useParams } from 'react-router-dom';
import { useProduct } from '@/features/products/products-api';
import { useEnquiryDialog } from '@/features/enquiry/enquiry-dialog-context';
import { useSeoMeta } from '@/lib/use-seo-meta';
import { useJsonLd } from '@/lib/use-json-ld';
import { isNotFoundError } from '@/lib/http-error';
import { truncate } from '@/lib/utils';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { SectionSpinner } from '@/components/shared/spinner';
import { ErrorNote } from '@/components/shared/error-note';
import { EntityNotFound } from '@/components/shared/entity-not-found';
import { ProductCard } from '@/components/shared/product-card';
import { BlogCard } from '@/components/shared/blog-card';
import { JaliDivider } from '@/components/shared/jali-divider';
import { MediaGallery } from '@/components/shared/media-gallery';
import { Button } from '@/components/ui/button';
import type { Product } from '@/types/product';

function toAbsoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${window.location.origin}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;
}

/**
 * `Product` was the first of Phase 27's two named structured-data types,
 * with a specific warning attached in both the Phase 25 and 26 notes:
 * there's no `price`/`sku`/`rating` field anywhere on the schema, so
 * `offers`/`aggregateRating` are deliberately never emitted here —
 * fabricating either is a Google manual-action risk, not a minor gap. What
 * *is* on the schema (name, description, images, category, specs) maps
 * cleanly to `Product` without inventing anything: `additionalProperty`
 * carries `specifications` since `SpecificationItem.key`/`.value` is
 * already exactly `PropertyValue`'s `name`/`value` shape.
 */
function useProductJsonLd(product: Product | undefined, canonicalHref: string): void {
  const category = product && typeof product.category === 'object' ? product.category : undefined;

  const schema = product
    ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        ...(product.description ? { description: product.description } : {}),
        ...(product.images.length > 0 ? { image: product.images.map((image) => image.url) } : {}),
        url: canonicalHref,
        ...(category ? { category: category.name } : {}),
        ...(product.specifications.length > 0
          ? {
              additionalProperty: product.specifications.map((spec) => ({
                '@type': 'PropertyValue',
                name: spec.key,
                value: spec.value,
              })),
            }
          : {}),
      }
    : undefined;

  useJsonLd('entity', schema);
}

/**
 * Sibling to `useProductJsonLd` — a separate `'faq'` key so the two scripts
 * don't clobber each other (`useJsonLd` upserts per-key). Mirrors the blog
 * details page's `useFaqJsonLd`: only emitted when the product actually has
 * FAQ entries, and the FAQ section below always renders alongside it, per
 * Google's guidance that `FAQPage` markup should match visible content.
 */
function useProductFaqJsonLd(faqs: Product['faqs'] | undefined): void {
  const schema =
    faqs && faqs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.answer,
            },
          })),
        }
      : undefined;

  useJsonLd('faq', schema);
}

export function ProductDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading, isError, error } = useProduct(slug);
  const { openEnquiryDialog } = useEnquiryDialog();

  const canonicalPath = slug ? `/products/${slug}` : undefined;

  useSeoMeta({
    title: product?.name,
    description: truncate(product?.description),
    ogImage: product?.images?.[0]?.url,
    canonicalPath,
  });

  useProductJsonLd(product, toAbsoluteUrl(canonicalPath ?? window.location.pathname));
  useProductFaqJsonLd(product?.faqs);

  if (isLoading) {
    return <SectionSpinner />;
  }

  if (isError) {
    if (isNotFoundError(error)) {
      return (
        <EntityNotFound
          title="This product isn't available."
          message="It may have been removed or is out of production. Take a look at what's currently on offer instead."
          backHref="/"
          backLabel="Back to Home"
        />
      );
    }
    return (
      <div className="mx-auto max-w-xl px-4 py-24">
        <ErrorNote label="This product" />
      </div>
    );
  }

  if (!product) return null;

  const category = typeof product.category === 'object' ? product.category : undefined;
  const relatedProducts = product.relatedProducts;
  const relatedBlogs = product.relatedBlogs;
  const faqs = product.faqs;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          ...(category ? [{ label: category.name, to: `/categories/${category.slug}` }] : []),
          { label: product.name },
        ]}
      />

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
        <MediaGallery images={product.images} itemName={product.name} />

        <div className="flex flex-col">
          {category ? (
            <Link
              to={`/categories/${category.slug}`}
              className="text-xs font-semibold uppercase tracking-[0.25em] text-brass hover:text-brass-light"
            >
              {category.name}
            </Link>
          ) : null}
          <h1 className="mt-2 text-4xl text-teak">{product.name}</h1>

          {product.description ? (
            <p className="mt-5 leading-relaxed text-charcoal-soft">{product.description}</p>
          ) : null}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              variant="primary"
              size="lg"
              onClick={() => openEnquiryDialog('product', category?.slug)}
            >
              Enquire Now
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => openEnquiryDialog('product', category?.slug)}
            >
              Get Quote
            </Button>
          </div>

          {product.specifications.length > 0 ? (
            <div className="mt-10">
              <h2 className="text-xl text-teak">Specifications</h2>
              <dl className="mt-4 divide-y divide-border-warm border-t border-border-warm">
                {product.specifications.map((spec) => (
                  <div key={spec.key} className="flex justify-between gap-6 py-3 text-sm">
                    <dt className="text-charcoal-soft">{spec.key}</dt>
                    <dd className="text-right font-medium text-charcoal">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}
        </div>
      </div>

      {faqs.length > 0 ? (
        <section className="mt-20">
          <h2 className="text-2xl text-teak">Frequently asked questions</h2>
          <div className="mt-6 space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-border-warm pb-4">
                <p className="font-semibold text-teak">{faq.question}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-charcoal-soft">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {relatedProducts.length > 0 ? (
        <section className="mt-24">
          <div className="mb-10 w-32">
            <JaliDivider />
          </div>
          <h2 className="text-2xl text-teak">You may also like</h2>
          <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {relatedProducts.map((related) => (
              <ProductCard key={related._id} product={related} />
            ))}
          </div>
        </section>
      ) : null}

      {relatedBlogs.length > 0 ? (
        <section className="mt-24">
          <div className="mb-10 w-32">
            <JaliDivider />
          </div>
          <h2 className="text-2xl text-teak">Related reading</h2>
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {relatedBlogs.map((blog) => (
              <BlogCard key={blog._id} blog={blog} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

