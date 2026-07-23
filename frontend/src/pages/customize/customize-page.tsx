import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useProduct } from '@/features/products/products-api';
import { useCustomizations } from '@/features/customizations/customizations-api';
import { CustomizeRequestForm } from '@/features/enquiry/customize-request-form';
import { useSeoMeta } from '@/lib/use-seo-meta';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { SectionSpinner } from '@/components/shared/spinner';
import { ErrorNote } from '@/components/shared/error-note';
import { Pagination } from '@/components/shared/pagination';
import { JaliDivider } from '@/components/shared/jali-divider';
import { CustomizationCard } from '@/components/shared/customization-card';

const PAGE_SIZE = 12;

/**
 * The standalone "Customize" page (Phase 38) — replaces the old
 * per-product-detail-page embedded form. Customization requests are now
 * their own entity: one request form here (optionally still carrying
 * `?product=<slug>` context from a product page's "Request a Custom
 * Order" link), plus a CMS-managed showcase grid of pieces already built
 * to a customer's custom request, shown below the form the same way a
 * portfolio would be.
 */
export function CustomizePage() {
  const { t } = useTranslation();
  useSeoMeta({
    title: 'Customize',
    description:
      'Request a custom-built piece from WOODIVO — a different wood, a different size, an added detail — and see examples of custom orders we\u2019ve already made.',
    canonicalPath: '/customize',
  });

  const [searchParams] = useSearchParams();
  const productSlug = searchParams.get('product') ?? undefined;
  const { data: product } = useProduct(productSlug);

  const [page, setPage] = useState(1);
  const showcase = useCustomizations({ page, limit: PAGE_SIZE });
  const items = showcase.data?.items ?? [];

  function goToPage(nextPage: number) {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div>
      <section className="bg-teak-deep px-4 py-16 text-center text-ivory sm:px-6">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 flex justify-center">
            <Breadcrumbs items={[{ label: t('nav.home'), to: '/' }, { label: t('nav.customize') }]} />
          </div>
          <h1 className="text-4xl sm:text-5xl">Customize a Piece</h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-ivory-deep/85">
            Different wood, a different size, an added detail — tell us what you have in mind and
            share a reference photo or two. Our craftsmen take it from there.
          </p>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <CustomizeRequestForm productSlug={productSlug} productName={product?.name} />
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 w-32">
            <JaliDivider />
          </div>
          <h2 className="text-2xl text-teak">Custom orders we've already made</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-charcoal-soft">
            A look at pieces we've built for other customers' custom requests.
          </p>

          <div className="mt-8">
            {showcase.isLoading ? <SectionSpinner /> : null}
            {showcase.isError ? <ErrorNote label="This showcase" /> : null}

            {!showcase.isLoading && !showcase.isError && items.length === 0 ? (
              <p className="py-16 text-center text-charcoal-soft">
                Nothing to show here yet — check back soon.
              </p>
            ) : null}

            {items.length > 0 ? (
              <>
                <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
                  {items.map((item) => (
                    <CustomizationCard key={item._id} item={item} />
                  ))}
                </div>

                <div className="mt-4">
                  <Pagination
                    page={showcase.data?.meta.page ?? page}
                    totalPages={showcase.data?.meta.totalPages ?? 1}
                    onPageChange={goToPage}
                  />
                </div>
              </>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
