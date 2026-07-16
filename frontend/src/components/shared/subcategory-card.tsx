import { ArrowUpRight } from 'lucide-react';
import type { SubCategory } from '@/types/subcategory';

/**
 * Nice-card grid tile shown on `CategoryListingPage` when a category has
 * subcategories — the customer picks one here before ever seeing a
 * product grid, rather than the old behaviour of dumping every product
 * from every subcategory into one list with filter pills bolted on top.
 * Visual language matches `ProductCard`/`BlogCard`: white card, image,
 * name, small action row — just swapped for a subcategory's thumbnail
 * (falling back to its banner) since subcategories don't carry a price.
 */
export function SubCategoryCard({
  subCategory,
  onSelect,
}: {
  subCategory: SubCategory;
  onSelect: (slug: string) => void;
}) {
  const image = subCategory.thumbnail?.url || subCategory.banner?.url;

  return (
    <button
      type="button"
      onClick={() => onSelect(subCategory.slug)}
      className="group flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-border-warm bg-ivory text-left transition-shadow hover:shadow-lg hover:shadow-charcoal/10"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-ivory-deep">
        {image ? (
          <img
            src={image}
            alt={subCategory.thumbnail?.alt || subCategory.name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : null}
      </div>
      <div className="flex flex-1 items-center justify-between gap-2 p-4">
        <div>
          <p className="text-sm font-semibold text-charcoal">{subCategory.name}</p>
          {subCategory.description ? (
            <p className="mt-0.5 line-clamp-1 text-xs text-charcoal-soft">{subCategory.description}</p>
          ) : null}
        </div>
        <ArrowUpRight className="h-4 w-4 shrink-0 text-brass transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
    </button>
  );
}
