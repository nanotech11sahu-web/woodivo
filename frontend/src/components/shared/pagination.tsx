import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/**
 * The CMS has its own `pagination.tsx` (table-row-count driven, admin
 * styling). This is a separate, smaller component rather than a shared
 * one — the public site's only paginated view is a product grid, the
 * visual language is the public palette not the admin one, and importing
 * across the `cms/` ↔ `frontend/` boundary isn't how these two apps are
 * wired together (each has its own `package.json`, its own build).
 */
export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = visiblePageNumbers(page, totalPages);

  return (
    <nav aria-label="Pagination" className="mt-14 flex items-center justify-center gap-1.5">
      <button
        type="button"
        aria-label="Previous page"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-card)] border border-border-warm text-charcoal-soft transition-colors hover:border-brass hover:text-brass disabled:pointer-events-none disabled:opacity-40"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {pages.map((entry, index) =>
        entry === 'ellipsis' ? (
          <span key={`ellipsis-${index}`} className="px-1.5 text-sm text-charcoal-soft">
            &hellip;
          </span>
        ) : (
          <button
            key={entry}
            type="button"
            aria-current={entry === page ? 'page' : undefined}
            onClick={() => onPageChange(entry)}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-[var(--radius-card)] border text-sm transition-colors',
              entry === page
                ? 'border-brass bg-brass text-ivory'
                : 'border-border-warm text-charcoal-soft hover:border-brass hover:text-brass',
            )}
          >
            {entry}
          </button>
        ),
      )}

      <button
        type="button"
        aria-label="Next page"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-card)] border border-border-warm text-charcoal-soft transition-colors hover:border-brass hover:text-brass disabled:pointer-events-none disabled:opacity-40"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}

type PageEntry = number | 'ellipsis';

function visiblePageNumbers(current: number, total: number): PageEntry[] {
  const windowSize = 1;
  const pages = new Set<number>([1, total]);
  for (let p = current - windowSize; p <= current + windowSize; p += 1) {
    if (p >= 1 && p <= total) pages.add(p);
  }

  const sorted = [...pages].sort((a, b) => a - b);
  const result: PageEntry[] = [];
  sorted.forEach((p, index) => {
    if (index > 0 && p - sorted[index - 1] > 1) result.push('ellipsis');
    result.push(p);
  });
  return result;
}
