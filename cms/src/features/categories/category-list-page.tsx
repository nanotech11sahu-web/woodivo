import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, Star } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable, type DataTableColumn } from '@/components/shared/data-table';
import { Pagination } from '@/components/shared/pagination';
import { StatusBadge } from '@/components/shared/status-badge';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { toast } from '@/lib/toast';
import { getErrorMessage } from '@/lib/http-error';
import {
  useCategories,
  useDeleteCategory,
  useReorderCategories,
} from './categories-api';
import type { Category, CategoryStatus } from '@/types/category';

const PAGE_LIMIT = 20;

export function CategoryListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<CategoryStatus | ''>('');
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null);

  const { data, isLoading, isError } = useCategories({
    page,
    limit: PAGE_LIMIT,
    search: search || undefined,
    status: status || undefined,
    sortBy: 'displayOrder',
    sortOrder: 'asc',
  });

  const deleteCategory = useDeleteCategory();
  const reorderCategories = useReorderCategories();

  const items = data?.items ?? [];

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleStatusChange(value: string) {
    setStatus(value as CategoryStatus | '');
    setPage(1);
  }

  function moveCategory(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const current = items[index];
    const target = items[targetIndex];

    reorderCategories.mutate(
      [
        { id: current._id, displayOrder: target.displayOrder },
        { id: target._id, displayOrder: current.displayOrder },
      ],
      {
        onError: (error) => toast.error('Couldn\u2019t reorder categories', getErrorMessage(error)),
      },
    );
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    try {
      await deleteCategory.mutateAsync(pendingDelete._id);
      toast.success('Category deleted');
      setPendingDelete(null);
    } catch (error) {
      toast.error('Couldn\u2019t delete category', getErrorMessage(error));
    }
  }

  const columns: DataTableColumn<Category>[] = [
    {
      key: 'thumbnail',
      header: '',
      headerClassName: 'w-16',
      render: (row) =>
        row.thumbnail ? (
          <img
            src={row.thumbnail.url}
            alt={row.thumbnail.alt || row.name}
            className="h-10 w-10 rounded-md border border-border-warm object-cover"
          />
        ) : (
          <div className="h-10 w-10 rounded-md border border-dashed border-border-warm" />
        ),
    },
    {
      key: 'name',
      header: 'Name',
      render: (row) => (
        <div>
          <p className="font-medium text-espresso">{row.name}</p>
          <p className="text-xs text-ink-muted">/{row.slug}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'featured',
      header: 'Featured',
      render: (row) =>
        row.isFeatured ? <Star size={16} className="fill-walnut text-walnut" /> : null,
    },
    {
      key: 'order',
      header: 'Order',
      render: (row) => {
        const index = items.findIndex((item) => item._id === row._id);
        return (
          <div className="flex items-center gap-1">
            <span className="w-6 font-mono text-xs text-ink-muted">{row.displayOrder}</span>
            <button
              type="button"
              onClick={() => moveCategory(index, -1)}
              disabled={index === 0 || reorderCategories.isPending}
              className="rounded p-1 text-ink-muted hover:bg-sand-dark hover:text-espresso disabled:opacity-30"
              aria-label="Move up"
            >
              <ArrowUp size={14} />
            </button>
            <button
              type="button"
              onClick={() => moveCategory(index, 1)}
              disabled={index === items.length - 1 || reorderCategories.isPending}
              className="rounded p-1 text-ink-muted hover:bg-sand-dark hover:text-espresso disabled:opacity-30"
              aria-label="Move down"
            >
              <ArrowDown size={14} />
            </button>
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: '',
      headerClassName: 'w-24',
      className: 'text-right',
      render: (row) => (
        <div className="flex justify-end gap-1.5">
          <Link
            to={`/categories/${row._id}/edit`}
            className="rounded p-1.5 text-ink-muted hover:bg-sand-dark hover:text-espresso"
            aria-label={`Edit ${row.name}`}
          >
            <Pencil size={15} />
          </Link>
          <button
            type="button"
            onClick={() => setPendingDelete(row)}
            className="rounded p-1.5 text-ink-muted hover:bg-rust-light hover:text-rust"
            aria-label={`Delete ${row.name}`}
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Categories"
        description="Product categories shown across the header, footer, homepage and filters."
        action={
          <Link to="/categories/new" className={buttonVariants({ variant: 'primary' })}>
            <Plus size={16} />
            New Category
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <Input
          placeholder="Search by name or slug…"
          value={search}
          onChange={(event) => handleSearchChange(event.target.value)}
          className="max-w-xs"
        />
        <Select
          value={status}
          onChange={(event) => handleStatusChange(event.target.value)}
          className="max-w-40"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={items}
        getRowKey={(row) => row._id}
        isLoading={isLoading}
        isError={isError}
        emptyTitle="No categories yet"
        emptyDescription="Create your first category to start building the catalog."
      />

      {data && <Pagination meta={data.meta} onPageChange={setPage} />}

      <ConfirmDialog
        open={pendingDelete !== null}
        title={`Delete "${pendingDelete?.name}"?`}
        description="This can't be undone. Categories that still have products attached can't be deleted."
        confirmLabel="Delete"
        destructive
        isLoading={deleteCategory.isPending}
        onConfirm={() => void handleConfirmDelete()}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
