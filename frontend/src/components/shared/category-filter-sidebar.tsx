import { cn } from '@/lib/utils';
import type { SubCategory } from '@/types/subcategory';

const AVAILABILITY_OPTIONS: { value: string; label: string }[] = [
  { value: 'in_stock', label: 'In stock' },
  { value: 'made_to_order', label: 'Made to order' },
];

/**
 * Amazon-style left-rail filter panel for CategoryListingPage — replaces
 * the old two-step flow (a full-screen grid of subcategory tiles the
 * customer had to pick one of before ever seeing a product) with checkbox
 * filters customers can combine while staying on the product grid. Since a
 * product can now belong to several subcategories, multi-select here is a
 * real "match any of these" filter rather than a single radio choice.
 *
 * Rendered twice by the page: statically in a sticky column on desktop,
 * and inside a slide-over sheet on mobile — this component only renders
 * the filter controls themselves, the host decides the chrome around it.
 */
export function CategoryFilterSidebar({
  subCategories,
  selectedSlugs,
  onToggleSubCategory,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  selectedAvailability,
  onToggleAvailability,
  onSale,
  onOnSaleChange,
  onClearAll,
}: {
  subCategories: SubCategory[];
  selectedSlugs: string[];
  onToggleSubCategory: (slug: string) => void;
  minPrice: string;
  maxPrice: string;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
  selectedAvailability: string[];
  onToggleAvailability: (value: string) => void;
  onSale: boolean;
  onOnSaleChange: (value: boolean) => void;
  onClearAll: () => void;
}) {
  const hasActiveFilters =
    selectedSlugs.length > 0 ||
    Boolean(minPrice) ||
    Boolean(maxPrice) ||
    selectedAvailability.length > 0 ||
    onSale;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-charcoal-soft">Filters</h2>
        {hasActiveFilters ? (
          <button type="button" onClick={onClearAll} className="text-xs font-semibold text-brass hover:underline">
            Clear all
          </button>
        ) : null}
      </div>

      {subCategories.length > 0 ? (
        <div>
          <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-charcoal-soft">Collections</h3>
          <ul className="space-y-1">
            {subCategories.map((subCat) => {
              const checked = selectedSlugs.includes(subCat.slug);
              const thumb = subCat.thumbnail?.url || subCat.banner?.url;
              return (
                <li key={subCat._id}>
                  <label className="flex cursor-pointer items-center gap-2.5 rounded-[var(--radius-card)] px-1.5 py-1.5 hover:bg-ivory-deep">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggleSubCategory(subCat.slug)}
                      className="h-4 w-4 shrink-0 rounded border-border-warm text-brass accent-brass"
                    />
                    {thumb ? (
                      <img
                        src={thumb}
                        alt=""
                        loading="lazy"
                        className="h-8 w-8 shrink-0 rounded-[var(--radius-card)] object-cover object-top"
                      />
                    ) : (
                      <span className="h-8 w-8 shrink-0 rounded-[var(--radius-card)] bg-ivory-deep" />
                    )}
                    <span className={cn('text-sm', checked ? 'font-semibold text-charcoal' : 'text-charcoal-soft')}>
                      {subCat.name}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      <div>
        <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-charcoal-soft">Price (₹)</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            inputMode="numeric"
            value={minPrice}
            onChange={(event) => onMinPriceChange(event.target.value)}
            placeholder="Min"
            aria-label="Minimum price"
            className="h-9 w-full min-w-0 rounded-[var(--radius-card)] border border-border-warm bg-ivory-deep px-2.5 text-sm text-charcoal placeholder:text-charcoal-soft/60 focus:border-brass focus:outline-none"
          />
          <span className="text-charcoal-soft">–</span>
          <input
            type="number"
            min={0}
            inputMode="numeric"
            value={maxPrice}
            onChange={(event) => onMaxPriceChange(event.target.value)}
            placeholder="Max"
            aria-label="Maximum price"
            className="h-9 w-full min-w-0 rounded-[var(--radius-card)] border border-border-warm bg-ivory-deep px-2.5 text-sm text-charcoal placeholder:text-charcoal-soft/60 focus:border-brass focus:outline-none"
          />
        </div>
      </div>

      <div>
        <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-charcoal-soft">Availability</h3>
        <ul className="space-y-1">
          {AVAILABILITY_OPTIONS.map((option) => {
            const checked = selectedAvailability.includes(option.value);
            return (
              <li key={option.value}>
                <label className="flex cursor-pointer items-center gap-2.5 rounded-[var(--radius-card)] px-1.5 py-1.5 hover:bg-ivory-deep">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggleAvailability(option.value)}
                    className="h-4 w-4 shrink-0 rounded border-border-warm text-brass accent-brass"
                  />
                  <span className={cn('text-sm', checked ? 'font-semibold text-charcoal' : 'text-charcoal-soft')}>
                    {option.label}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </div>

      <div>
        <label className="flex cursor-pointer items-center gap-2.5 rounded-[var(--radius-card)] px-1.5 py-1.5 hover:bg-ivory-deep">
          <input
            type="checkbox"
            checked={onSale}
            onChange={(event) => onOnSaleChange(event.target.checked)}
            className="h-4 w-4 shrink-0 rounded border-border-warm text-brass accent-brass"
          />
          <span className={cn('text-sm', onSale ? 'font-semibold text-charcoal' : 'text-charcoal-soft')}>
            On sale only
          </span>
        </label>
      </div>
    </div>
  );
}
