import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable, type DataTableColumn } from '@/components/shared/data-table';
import { Pagination } from '@/components/shared/pagination';
import { StatusBadge } from '@/components/shared/status-badge';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { toast } from '@/lib/toast';
import { getErrorMessage } from '@/lib/http-error';
import { useCategoryOptions } from '@/features/categories/categories-api';
import {
  useCustomizations,
  useDeleteCustomization,
  useReorderCustomizations,
} from './customizations-api';
import type { Customization, CustomizationStatus } from '@/types/customization';

const PAGE_LIMIT = 20;

export function CustomizationListPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<CustomizationStatus | ''>('');
  const [category, setCategory] = useState('');
  const [tag, setTag] = useState('');
  const [pendingDelete, setPendingDelete] = useState<Customization | null>(null);

  const { data: categoryOptions } = useCategoryOptions();
  const { data, isLoading, isError } = useCustomizations({
    page,
    limit: PAGE_LIMIT,
    status: status || undefined,
    category: category || undefined,
    tag: tag || undefined,
    sortBy: 'displayOrder',
    sortOrder: 'asc',
  });
  const deleteCustomization = useDeleteCustomization();
  const reorderCustomizations = useReorderCustomizations();

  const items = data?.items ?? [];
  // Same guard as Gallery: only meaningful against the unfiltered,
  // order-sorted list.
  const canReorder = !status && !category && !tag;

  function handleStatusChange(value: string) {
    setStatus(value as CustomizationStatus | '');
    setPage(1);
  }

  function handleCategoryChange(value: string) {
    setCategory(value);
    setPage(1);
  }

  function handleTagChange(value: string) {
    setTag(value);
    setPage(1);
  }

  function moveItem(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const current = items[index];
    const target = items[targetIndex];

    reorderCustomizations.mutate(
      [
        { id: current._id, displayOrder: target.displayOrder },
        { id: target._id, displayOrder: current.displayOrder },
      ],
      {
        onError: (error) => toast.error('Couldn\u2019t reorder customizations', getErrorMessage(error)),
      },
    );
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    try {
      await deleteCustomization.mutateAsync(pendingDelete._id);
      toast.success('Customization deleted');
      setPendingDelete(null);
    } catch (error) {
      toast.error('Couldn\u2019t delete customization', getErrorMessage(error));
    }
  }

  const columns: DataTableColumn<Customization>[] = [
    {
      key: 'images',
      header: '',
      headerClassName: 'w-16',
      render: (row) => (
        <img
          src={row.images[0]?.url}
          alt={row.images[0]?.alt || row.title}
          className="h-12 w-16 rounded-md border border-border-warm object-cover"
        />
      ),
    },
    {
      key: 'title',
      header: 'Title',
      render: (row) => (
        <div className="max-w-xs">
          <p className="line-clamp-1 font-medium text-espresso">{row.title}</p>
          {row.tags.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {row.tags.map((t) => (
                <Badge key={t} variant="neutral" className="text-[10px]">
                  {t}
                </Badge>
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (row) => (
        <span className="text-sm text-ink-muted">{row.category?.name ?? '\u2014'}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
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
              onClick={() => moveItem(index, -1)}
              disabled={!canReorder || index === 0 || reorderCustomizations.isPending}
              className="rounded p-1 text-ink-muted hover:bg-sand-dark hover:text-espresso disabled:opacity-30"
              aria-label="Move up"
            >
              <ArrowUp size={14} />
            </button>
            <button
              type="button"
              onClick={() => moveItem(index, 1)}
              disabled={!canReorder || index === items.length - 1 || reorderCustomizations.isPending}
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
            to={`/customizations/${row._id}/edit`}
            className="rounded p-1.5 text-ink-muted hover:bg-sand-dark hover:text-espresso"
            aria-label="Edit customization"
          >
            <Pencil size={15} />
          </Link>
          <button
            type="button"
            onClick={() => setPendingDelete(row)}
            className="rounded p-1.5 text-ink-muted hover:bg-rust-light hover:text-rust"
            aria-label="Delete customization"
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
        title="Customizations"
        description="Showcase of custom orders already made, shown below the request form on the public Customize page."
        action={
          <Link to="/customizations/new" className={buttonVariants({ variant: 'primary' })}>
            <Plus size={16} />
            New Customization
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <Input
          placeholder="Filter by exact tag…"
          value={tag}
          onChange={(event) => handleTagChange(event.target.value)}
          className="max-w-xs"
        />
        <Select
          value={category}
          onChange={(event) => handleCategoryChange(event.target.value)}
          className="max-w-48"
        >
          <option value="">All categories</option>
          {categoryOptions?.items.map((option) => (
            <option key={option._id} value={option._id}>
              {option.name}
            </option>
          ))}
        </Select>
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
        emptyTitle="No customizations yet"
        emptyDescription="Add the first piece you've custom-built for a customer."
      />

      {data && <Pagination meta={data.meta} onPageChange={setPage} />}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete this customization?"
        description="This can't be undone."
        confirmLabel="Delete"
        destructive
        isLoading={deleteCustomization.isPending}
        onConfirm={() => void handleConfirmDelete()}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
