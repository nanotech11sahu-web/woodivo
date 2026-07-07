import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PaginationMeta } from '@/types/common';

interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}

export function Pagination({ meta, onPageChange }: PaginationProps) {
  if (meta.total === 0) return null;

  const start = (meta.page - 1) * meta.limit + 1;
  const end = Math.min(meta.page * meta.limit, meta.total);

  return (
    <div className="flex items-center justify-between border-t border-border-warm px-4 py-3">
      <p className="text-sm text-ink-muted">
        Showing <span className="font-medium text-espresso">{start}</span>–
        <span className="font-medium text-espresso">{end}</span> of{' '}
        <span className="font-medium text-espresso">{meta.total}</span>
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={!meta.hasPrevPage}
          onClick={() => onPageChange(meta.page - 1)}
        >
          <ChevronLeft size={14} />
          Prev
        </Button>
        <span className="text-sm text-ink-muted">
          Page {meta.page} of {meta.totalPages}
        </span>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={!meta.hasNextPage}
          onClick={() => onPageChange(meta.page + 1)}
        >
          Next
          <ChevronRight size={14} />
        </Button>
      </div>
    </div>
  );
}
