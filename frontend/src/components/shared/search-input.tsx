import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  'aria-label': string;
  className?: string;
}

/**
 * Phase 28's only new presentational component — a controlled text input
 * with a leading search icon and a trailing clear button, shared between
 * `BlogListingPage` (full-text `search`) and `GalleryPage` (`tag` filter).
 * Purely controlled: it has no debounce logic of its own, so the same
 * component works whether a caller debounces before it hits the URL/API
 * (both current callers do, via `useDebouncedValue`) or not. Kept in
 * `components/shared` rather than `components/ui` alongside `Button` —
 * this project's `ui/` only has the one primitive so far, and this is
 * closer in spirit to the other purpose-built `shared/` pieces
 * (`Pagination`, `ErrorNote`) than a generic design-system primitive.
 */
export function SearchInput({
  value,
  onChange,
  placeholder,
  className,
  ...rest
}: SearchInputProps) {
  return (
    <div className={cn('relative', className)}>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-soft/60" />
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={rest['aria-label']}
        className="h-11 w-full rounded-[var(--radius-card)] border border-border-warm bg-ivory-deep py-2 pl-10 pr-9 text-sm text-charcoal placeholder:text-charcoal-soft/60 transition-colors focus:border-brass focus:outline-none"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear"
          className="absolute right-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center text-charcoal-soft/60 transition-colors hover:text-brass"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}
