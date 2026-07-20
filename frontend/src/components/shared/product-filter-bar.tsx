import { useState } from 'react';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SearchInput } from '@/components/shared/search-input';

/**
 * Single standardized filter bar for product listing pages — replaces what
 * used to be three independent, ad-hoc rows (search+price inline, a
 * separate subcategory-pill row, a separate sort dropdown) with one
 * consistent control: search and sort are always visible (the filters
 * customers actually use), price range sits behind a "Filters" toggle
 * since it's used far less often and was cluttering the page for everyone
 * who never touches it.
 */
export function ProductFilterBar<TSort extends string>({
  search,
  onSearchChange,
  searchPlaceholder,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  sort,
  onSortChange,
  sortLabels,
  sortOptions,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  minPrice: string;
  maxPrice: string;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
  sort: TSort;
  onSortChange: (value: TSort) => void;
  sortLabels: Record<TSort, string>;
  sortOptions: TSort[];
}) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const hasPriceFilter = Boolean(minPrice || maxPrice);

  return (
    <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <SearchInput
        value={search}
        onChange={onSearchChange}
        placeholder={searchPlaceholder}
        aria-label="Search products"
        className="max-w-sm"
      />

      <div className="flex items-center gap-2">
        <div className="relative">
          <button
            type="button"
            onClick={() => setFiltersOpen((v) => !v)}
            className={cn(
              'flex h-9 items-center gap-1.5 rounded-[var(--radius-card)] border px-3 text-sm font-medium hover:border-brass',
              hasPriceFilter ? 'border-brass bg-brass-pale text-brass' : 'border-border-warm text-charcoal',
            )}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filters
            {hasPriceFilter ? <span className="h-1.5 w-1.5 rounded-full bg-brass" /> : null}
          </button>
          {filtersOpen ? (
            <div className="absolute right-0 top-full z-10 mt-2 w-64 rounded-[var(--radius-card)] border border-border-warm bg-ivory p-3 shadow-lg shadow-charcoal/10">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-charcoal-soft">Price (₹)</p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={minPrice}
                  onChange={(event) => onMinPriceChange(event.target.value)}
                  placeholder="Min"
                  aria-label="Minimum price"
                  className="h-9 w-full rounded-[var(--radius-card)] border border-border-warm bg-ivory-deep px-2.5 text-sm text-charcoal placeholder:text-charcoal-soft/60 focus:border-brass focus:outline-none"
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
                  className="h-9 w-full rounded-[var(--radius-card)] border border-border-warm bg-ivory-deep px-2.5 text-sm text-charcoal placeholder:text-charcoal-soft/60 focus:border-brass focus:outline-none"
                />
              </div>
              {hasPriceFilter ? (
                <button
                  type="button"
                  onClick={() => {
                    onMinPriceChange('');
                    onMaxPriceChange('');
                  }}
                  className="mt-2 text-xs font-medium text-charcoal-soft hover:text-brass"
                >
                  Clear price filter
                </button>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setSortOpen((v) => !v)}
            className="flex h-9 items-center gap-1.5 rounded-[var(--radius-card)] border border-border-warm px-3 text-sm font-medium text-charcoal hover:border-brass"
          >
            <span className="hidden text-charcoal-soft sm:inline">Sort by</span>
            {sortLabels[sort]}
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          {sortOpen ? (
            <div className="absolute right-0 top-full z-10 mt-2 w-48 rounded-[var(--radius-card)] border border-border-warm bg-ivory p-1.5 shadow-lg shadow-charcoal/10">
              {sortOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    onSortChange(option);
                    setSortOpen(false);
                  }}
                  className={cn(
                    'block w-full rounded px-3 py-2 text-left text-sm hover:bg-ivory-deep',
                    sort === option ? 'text-brass' : 'text-charcoal',
                  )}
                >
                  {sortLabels[option]}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
