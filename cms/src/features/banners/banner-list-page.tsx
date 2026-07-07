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
import { Select } from '@/components/ui/select';
import { toast } from '@/lib/toast';
import { getErrorMessage } from '@/lib/http-error';
import { useBanners, useDeleteBanner, useReorderBanners } from './banners-api';
import { BANNER_PLACEMENTS, PLACEMENT_LABELS } from './banner-form-schema';
import type { Banner, BannerPlacement, BannerStatus } from '@/types/banner';

const PAGE_LIMIT = 20;

export function BannerListPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<BannerStatus | ''>('');
  const [placement, setPlacement] = useState<BannerPlacement | ''>('');
  const [pendingDelete, setPendingDelete] = useState<Banner | null>(null);

  const { data, isLoading, isError } = useBanners({
    page,
    limit: PAGE_LIMIT,
    status: status || undefined,
    placement: placement || undefined,
    sortBy: 'displayOrder',
    sortOrder: 'asc',
  });
  const deleteBanner = useDeleteBanner();
  const reorderBanners = useReorderBanners();

  const items = data?.items ?? [];
  // Order is scoped per placement on the backend (index is
  // `{ placement: 1, displayOrder: 1 }` — each placement runs its own
  // carousel). Reordering only makes sense once a single placement is
  // selected; the unfiltered list interleaves every placement's items by a
  // shared displayOrder value, so swapping two of them there wouldn't
  // reflect anything real on the site.
  const canReorder = Boolean(placement) && !status;

  function handleStatusChange(value: string) {
    setStatus(value as BannerStatus | '');
    setPage(1);
  }

  function handlePlacementChange(value: string) {
    setPlacement(value as BannerPlacement | '');
    setPage(1);
  }

  function moveBanner(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const current = items[index];
    const target = items[targetIndex];

    reorderBanners.mutate(
      [
        { id: current._id, displayOrder: target.displayOrder },
        { id: target._id, displayOrder: current.displayOrder },
      ],
      {
        onError: (error) => toast.error('Couldn\u2019t reorder banners', getErrorMessage(error)),
      },
    );
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    try {
      await deleteBanner.mutateAsync(pendingDelete._id);
      toast.success('Banner deleted');
      setPendingDelete(null);
    } catch (error) {
      toast.error('Couldn\u2019t delete banner', getErrorMessage(error));
    }
  }

  const columns: DataTableColumn<Banner>[] = [
    {
      key: 'desktopImage',
      header: '',
      headerClassName: 'w-20',
      render: (row) => (
        <img
          src={row.desktopImage.url}
          alt={row.desktopImage.alt || row.title}
          className="h-10 w-16 rounded-md border border-border-warm object-cover"
        />
      ),
    },
    {
      key: 'title',
      header: 'Banner',
      render: (row) => (
        <div>
          <p className="font-medium text-espresso">{row.title}</p>
          {row.subtitle && <p className="line-clamp-1 text-xs text-ink-muted">{row.subtitle}</p>}
        </div>
      ),
    },
    {
      key: 'placement',
      header: 'Placement',
      render: (row) => (
        <Badge variant="neutral" className="capitalize">
          {row.placement}
        </Badge>
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
              onClick={() => moveBanner(index, -1)}
              disabled={!canReorder || index === 0 || reorderBanners.isPending}
              className="rounded p-1 text-ink-muted hover:bg-sand-dark hover:text-espresso disabled:opacity-30"
              aria-label="Move up"
            >
              <ArrowUp size={14} />
            </button>
            <button
              type="button"
              onClick={() => moveBanner(index, 1)}
              disabled={!canReorder || index === items.length - 1 || reorderBanners.isPending}
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
            to={`/banners/${row._id}/edit`}
            className="rounded p-1.5 text-ink-muted hover:bg-sand-dark hover:text-espresso"
            aria-label={`Edit ${row.title}`}
          >
            <Pencil size={15} />
          </Link>
          <button
            type="button"
            onClick={() => setPendingDelete(row)}
            className="rounded p-1.5 text-ink-muted hover:bg-rust-light hover:text-rust"
            aria-label={`Delete ${row.title}`}
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
        title="Banners"
        description="Hero and section banners shown across the site."
        action={
          <Link to="/banners/new" className={buttonVariants({ variant: 'primary' })}>
            <Plus size={16} />
            New Banner
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <Select
          value={placement}
          onChange={(event) => handlePlacementChange(event.target.value)}
          className="max-w-48"
        >
          <option value="">All placements</option>
          {BANNER_PLACEMENTS.map((p) => (
            <option key={p} value={p}>
              {PLACEMENT_LABELS[p]}
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

      {!placement && (
        <p className="mb-4 text-xs text-ink-muted">
          Select a placement above to reorder banners within that slot — order is per-placement,
          so it isn't meaningful across the mixed, unfiltered list.
        </p>
      )}

      <DataTable
        columns={columns}
        data={items}
        getRowKey={(row) => row._id}
        isLoading={isLoading}
        isError={isError}
        emptyTitle="No banners yet"
        emptyDescription="Add your first banner for the homepage or a section page."
      />

      {data && <Pagination meta={data.meta} onPageChange={setPage} />}

      <ConfirmDialog
        open={pendingDelete !== null}
        title={`Delete banner "${pendingDelete?.title}"?`}
        description="This can't be undone."
        confirmLabel="Delete"
        destructive
        isLoading={deleteBanner.isPending}
        onConfirm={() => void handleConfirmDelete()}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
