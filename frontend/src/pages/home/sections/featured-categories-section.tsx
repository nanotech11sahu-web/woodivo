import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCategories } from '@/features/categories/categories-api';
import { SectionSpinner } from '@/components/shared/spinner';
import { ErrorNote } from '@/components/shared/error-note';
import { CardSlider, sliderItemWidths } from '@/components/shared/card-slider';

/**
 * Reference-style "All categories" strip: small square thumbnails with a
 * label underneath, not the large cinematic image cards this section used
 * before. Shows every published category (not just `isFeatured` ones) —
 * matching the reference, which treats this as primary catalogue
 * navigation rather than a curated highlight reel.
 */
export function FeaturedCategoriesSection() {
  const { t } = useTranslation();
  const { data: categories, isLoading, isError } = useCategories();

  if (!isLoading && !isError && (!categories || categories.length === 0)) {
    return null;
  }

  return (
    <section className="bg-ivory px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl sm:text-2xl">{t('home.shop_by_category')}</h2>
          <Link to="/categories" className="text-sm font-medium text-brass hover:text-brass-light">
            {t('nav.view_all')}
          </Link>
        </div>

        {isLoading ? <SectionSpinner /> : null}
        {isError ? <div className="mt-6"><ErrorNote label="Categories" /></div> : null}

        {categories && categories.length > 0 ? (
          <CardSlider className="mt-7">
            {categories.map((category) => (
              <Link
                key={category._id}
                to={`/categories/${category.slug}`}
                className={`group flex flex-col items-center gap-3 rounded-2xl border border-transparent p-3 text-center transition-colors hover:border-border-warm hover:bg-ivory-deep/60 ${sliderItemWidths.category}`}
              >
                <span className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl border border-border-warm bg-ivory-deep transition-all duration-300 group-hover:border-brass group-hover:shadow-md group-hover:shadow-charcoal/5">
                  {category.thumbnail?.url ? (
                    <img
                      src={category.thumbnail.url}
                      alt={category.thumbnail.alt || category.name}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : null}
                </span>
                <span className="text-sm font-medium leading-tight text-charcoal group-hover:text-brass">
                  {category.name}
                </span>
              </Link>
            ))}
          </CardSlider>
        ) : null}
      </div>
    </section>
  );
}
