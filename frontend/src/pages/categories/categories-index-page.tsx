import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCategories } from '@/features/categories/categories-api';
import { useSeoMeta } from '@/lib/use-seo-meta';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { SectionSpinner } from '@/components/shared/spinner';
import { ErrorNote } from '@/components/shared/error-note';

export function CategoriesIndexPage() {
  const { t } = useTranslation();
  const { data: categories, isLoading, isError } = useCategories();

  useSeoMeta({
    title: 'All Categories',
    description: 'Browse every Woodivo category — wooden furniture, decor and custom woodwork.',
    canonicalPath: '/categories',
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: t('nav.home'), to: '/' }, { label: t('nav.categories') }]} />
      <h1 className="mt-4 text-2xl sm:text-3xl">{t('footer.explore_all_categories')}</h1>

      {isLoading ? <SectionSpinner /> : null}
      {isError ? <ErrorNote label="Categories" /> : null}

      {categories && categories.length > 0 ? (
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {categories.map((category) => (
            <Link
              key={category._id}
              to={`/categories/${category.slug}`}
              className="group flex flex-col items-center gap-3 text-center"
            >
              <span className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-border-warm bg-ivory-deep sm:h-24 sm:w-24">
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
              <span className="text-sm font-medium text-charcoal group-hover:text-brass">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      ) : null}

      {!isLoading && !isError && categories && categories.length === 0 ? (
        <p className="py-16 text-center text-charcoal-soft">No categories are published yet.</p>
      ) : null}
    </div>
  );
}
