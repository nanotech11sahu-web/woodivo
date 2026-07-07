import type { ReactNode } from 'react';
import { Inbox, AlertCircle } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
  headerClassName?: string;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  getRowKey: (row: T) => string;
  isLoading?: boolean;
  isError?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function DataTable<T>({
  columns,
  data,
  getRowKey,
  isLoading = false,
  isError = false,
  emptyTitle = 'Nothing here yet',
  emptyDescription,
}: DataTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-card border border-border-warm bg-card">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border-warm bg-sand/60">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    'px-4 py-3 text-xs font-medium uppercase tracking-wider text-ink-muted',
                    column.headerClassName,
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading &&
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index} className="border-b border-border-warm last:border-0">
                  {columns.map((column) => (
                    <td key={column.key} className="px-4 py-3.5">
                      <div className="h-4 w-full max-w-32 animate-pulse rounded bg-sand-dark" />
                    </td>
                  ))}
                </tr>
              ))}

            {!isLoading && isError && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10">
                  <div className="flex flex-col items-center gap-2 text-center text-rust">
                    <AlertCircle size={22} />
                    <p className="text-sm">Couldn't load this data. Try refreshing the page.</p>
                  </div>
                </td>
              </tr>
            )}

            {!isLoading && !isError && data.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <Inbox size={22} className="text-ink-muted" />
                    <p className="text-sm font-medium text-espresso">{emptyTitle}</p>
                    {emptyDescription && (
                      <p className="max-w-sm text-sm text-ink-muted">{emptyDescription}</p>
                    )}
                  </div>
                </td>
              </tr>
            )}

            {!isLoading &&
              !isError &&
              data.map((row) => (
                <tr
                  key={getRowKey(row)}
                  className="border-b border-border-warm last:border-0 hover:bg-sand/40"
                >
                  {columns.map((column) => (
                    <td key={column.key} className={cn('px-4 py-3.5 align-middle', column.className)}>
                      {column.render(row)}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center gap-2 border-t border-border-warm py-3 text-xs text-ink-muted">
          <Spinner className="h-3.5 w-3.5" />
          Loading
        </div>
      )}
    </div>
  );
}
