import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useCategories } from '@/features/categories/categories-api';
import { SectionHeading } from '@/components/shared/section-heading';
import { SectionSpinner } from '@/components/shared/spinner';
import { ErrorNote } from '@/components/shared/error-note';

export function FeaturedCategoriesSection() {
  const { data: categories, isLoading, isError } = useCategories(true);

  // Featured categories are opt-in from the CMS (Category.isFeatured) — an
  // empty result is a legitimate CMS state (nothing marked featured yet),
  // not an error, so this section simply omits itself rather than showing
  // an empty grid or a misleading error.
  if (!isLoading && !isError && (!categories || categories.length === 0)) {
    return null;
  }

  return (
    <section className="bg-ivory px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="What we build"
          title="Every piece starts with a category, not a template"
          description="Browse by what you're furnishing — each collection is built and finished to order."
        />

        {isLoading ? <SectionSpinner /> : null}
        {isError ? <div className="mt-10"><ErrorNote label="Categories" /></div> : null}

        {categories && categories.length > 0 ? (
          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <Link
                key={category._id}
                to={`/categories/${category.slug}`}
                className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-[var(--radius-card)] border border-border-warm bg-ivory-deep"
              >
                {category.thumbnail?.url ? (
                  <img
                    src={category.thumbnail.url}
                    alt={category.thumbnail.alt || category.name}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/10 to-transparent" />
                <div className="relative flex items-center justify-between gap-2 p-5">
                  <span className="text-lg text-ivory">{category.name}</span>
                  <ArrowUpRight className="h-5 w-5 shrink-0 text-brass-light transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
