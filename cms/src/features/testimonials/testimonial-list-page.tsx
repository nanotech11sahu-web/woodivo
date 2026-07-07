import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, Star } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable, type DataTableColumn } from '@/components/shared/data-table';
import { Pagination } from '@/components/shared/pagination';
import { StatusBadge } from '@/components/shared/status-badge';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { buttonVariants } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { toast } from '@/lib/toast';
import { getErrorMessage } from '@/lib/http-error';
import { useTestimonials, useDeleteTestimonial, useReorderTestimonials } from './testimonials-api';
import type { Testimonial, TestimonialStatus } from '@/types/testimonial';

const PAGE_LIMIT = 20;

export function TestimonialListPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<TestimonialStatus | ''>('');
  const [featured, setFeatured] = useState<'' | 'true' | 'false'>('');
  const [pendingDelete, setPendingDelete] = useState<Testimonial | null>(null);

  const { data, isLoading, isError } = useTestimonials({
    page,
    limit: PAGE_LIMIT,
    status: status || undefined,
    isFeatured: featured ? featured === 'true' : undefined,
    sortBy: 'displayOrder',
    sortOrder: 'asc',
  });
  const deleteTestimonial = useDeleteTestimonial();
  const reorderTestimonials = useReorderTestimonials();

  const items = data?.items ?? [];
  // Same guard as Projects (Phase 11): reorder only makes sense against the
  // unfiltered, order-sorted list.
  const canReorder = !status && !featured;

  function handleStatusChange(value: string) {
    setStatus(value as TestimonialStatus | '');
    setPage(1);
  }

  function handleFeaturedChange(value: string) {
    setFeatured(value as '' | 'true' | 'false');
    setPage(1);
  }

  function moveTestimonial(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const current = items[index];
    const target = items[targetIndex];

    reorderTestimonials.mutate(
      [
        { id: current._id, displayOrder: target.displayOrder },
        { id: target._id, displayOrder: current.displayOrder },
      ],
      {
        onError: (error) => toast.error('Couldn\u2019t reorder testimonials', getErrorMessage(error)),
      },
    );
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    try {
      await deleteTestimonial.mutateAsync(pendingDelete._id);
      toast.success('Testimonial deleted');
      setPendingDelete(null);
    } catch (error) {
      toast.error('Couldn\u2019t delete testimonial', getErrorMessage(error));
    }
  }

  const columns: DataTableColumn<Testimonial>[] = [
    {
      key: 'clientPhoto',
      header: '',
      headerClassName: 'w-16',
      render: (row) =>
        row.clientPhoto ? (
          <img
            src={row.clientPhoto.url}
            alt={row.clientPhoto.alt || row.clientName}
            className="h-10 w-10 rounded-full border border-border-warm object-cover"
          />
        ) : (
          <div className="h-10 w-10 rounded-full border border-dashed border-border-warm" />
        ),
    },
    {
      key: 'clientName',
      header: 'Client',
      render: (row) => (
        <div>
          <p className="font-medium text-espresso">{row.clientName}</p>
          {row.clientLocation && <p className="text-xs text-ink-muted">{row.clientLocation}</p>}
        </div>
      ),
    },
    {
      key: 'projectType',
      header: 'Project type',
      render: (row) => <span className="text-sm text-ink-muted">{row.projectType || '\u2014'}</span>,
    },
    {
      key: 'rating',
      header: 'Rating',
      render: (row) =>
        row.rating ? (
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }, (_, index) => (
              <Star
                key={index}
                size={13}
                className={index < row.rating! ? 'fill-walnut text-walnut' : 'text-border-warm'}
              />
            ))}
          </div>
        ) : (
          <span className="text-sm text-ink-muted">\u2014</span>
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
              onClick={() => moveTestimonial(index, -1)}
              disabled={!canReorder || index === 0 || reorderTestimonials.isPending}
              className="rounded p-1 text-ink-muted hover:bg-sand-dark hover:text-espresso disabled:opacity-30"
              aria-label="Move up"
            >
              <ArrowUp size={14} />
            </button>
            <button
              type="button"
              onClick={() => moveTestimonial(index, 1)}
              disabled={!canReorder || index === items.length - 1 || reorderTestimonials.isPending}
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
            to={`/testimonials/${row._id}/edit`}
            className="rounded p-1.5 text-ink-muted hover:bg-sand-dark hover:text-espresso"
            aria-label={`Edit ${row.clientName}`}
          >
            <Pencil size={15} />
          </Link>
          <button
            type="button"
            onClick={() => setPendingDelete(row)}
            className="rounded p-1.5 text-ink-muted hover:bg-rust-light hover:text-rust"
            aria-label={`Delete ${row.clientName}`}
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
        title="Testimonials"
        description="Client quotes shown on the homepage and testimonials section."
        action={
          <Link to="/testimonials/new" className={buttonVariants({ variant: 'primary' })}>
            <Plus size={16} />
            New Testimonial
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <Select
          value={featured}
          onChange={(event) => handleFeaturedChange(event.target.value)}
          className="max-w-44"
        >
          <option value="">All testimonials</option>
          <option value="true">Featured only</option>
          <option value="false">Not featured</option>
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
        emptyTitle="No testimonials yet"
        emptyDescription="Add your first client testimonial to build trust on the site."
      />

      {data && <Pagination meta={data.meta} onPageChange={setPage} />}

      <ConfirmDialog
        open={pendingDelete !== null}
        title={`Delete testimonial from "${pendingDelete?.clientName}"?`}
        description="This can't be undone."
        confirmLabel="Delete"
        destructive
        isLoading={deleteTestimonial.isPending}
        onConfirm={() => void handleConfirmDelete()}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
