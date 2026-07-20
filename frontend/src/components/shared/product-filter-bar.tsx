import { useState } from 'react';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SearchInput } from '@/components/shared/search-input';

/**
 * Top bar for product listing pages: search (always visible, the filter
 * customers actually use most) + sort, plus a mobile-only "Filters" button
 * that opens the CategoryFilterSidebar sheet (subcategory checkboxes +
 * price range live there now, not here — desktop shows that sidebar as a
 * permanent left column instead).
 */
export function ProductFilterBar<TSort extends string>({
  search,
  onSearchChange,
  searchPlaceholder,
  sort,
  onSortChange,
  sortLabels,
  sortOptions,
  onOpenMobileFilters,
  mobileFilterCount,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  sort: TSort;
  onSortChange: (value: TSort) => void;
  sortLabels: Record<TSort, string>;
  sortOptions: TSort[];
  onOpenMobileFilters?: () => void;
  mobileFilterCount?: number;
}) {
  const [sortOpen, setSortOpen] = useState(false);

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
        {onOpenMobileFilters ? (
          <button
            type="button"
            onClick={onOpenMobileFilters}
            className={cn(
              'flex h-9 items-center gap-1.5 rounded-[var(--radius-card)] border px-3 text-sm font-medium hover:border-brass lg:hidden',
              mobileFilterCount
                ? 'border-brass bg-brass-pale text-brass'
                : 'border-border-warm text-charcoal',
            )}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filters
            {mobileFilterCount ? (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-brass px-1 text-[10px] font-semibold text-ivory">
                {mobileFilterCount}
              </span>
            ) : null}
          </button>
        ) : null}

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
            <div className="absolute right-0 top-full z-10 mt-2 w-48 rounded-[var(--radius-card)] border border-border-warm bg-ivory p-1.5 shadow-pop">
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
