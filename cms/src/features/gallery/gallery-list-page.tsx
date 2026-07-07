import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, PlayCircle } from 'lucide-react';
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
import { useGalleryItems, useDeleteGalleryItem, useReorderGalleryItems } from './gallery-api';
import type { GalleryItem, GalleryItemStatus, GalleryItemType } from '@/types/gallery';

const PAGE_LIMIT = 20;

export function GalleryListPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<GalleryItemStatus | ''>('');
  const [type, setType] = useState<GalleryItemType | ''>('');
  const [tag, setTag] = useState('');
  const [pendingDelete, setPendingDelete] = useState<GalleryItem | null>(null);

  const { data, isLoading, isError } = useGalleryItems({
    page,
    limit: PAGE_LIMIT,
    status: status || undefined,
    type: type || undefined,
    tag: tag || undefined,
    sortBy: 'displayOrder',
    sortOrder: 'asc',
  });
  const deleteGalleryItem = useDeleteGalleryItem();
  const reorderGalleryItems = useReorderGalleryItems();

  const items = data?.items ?? [];
  // Same guard as every other reorderable module: only meaningful against
  // the unfiltered, order-sorted list.
  const canReorder = !status && !type && !tag;

  function handleStatusChange(value: string) {
    setStatus(value as GalleryItemStatus | '');
    setPage(1);
  }

  function handleTypeChange(value: string) {
    setType(value as GalleryItemType | '');
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

    reorderGalleryItems.mutate(
      [
        { id: current._id, displayOrder: target.displayOrder },
        { id: target._id, displayOrder: current.displayOrder },
      ],
      {
        onError: (error) => toast.error('Couldn\u2019t reorder gallery items', getErrorMessage(error)),
      },
    );
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    try {
      await deleteGalleryItem.mutateAsync(pendingDelete._id);
      toast.success('Gallery item deleted');
      setPendingDelete(null);
    } catch (error) {
      toast.error('Couldn\u2019t delete gallery item', getErrorMessage(error));
    }
  }

  const columns: DataTableColumn<GalleryItem>[] = [
    {
      key: 'media',
      header: '',
      headerClassName: 'w-16',
      render: (row) => (
        <div className="relative h-12 w-16">
          <img
            src={row.media.url}
            alt={row.media.alt || row.caption || 'Gallery item'}
            className="h-12 w-16 rounded-md border border-border-warm object-cover"
          />
          {row.type === 'video' && (
            <PlayCircle
              size={18}
              className="absolute inset-0 m-auto text-white drop-shadow"
            />
          )}
        </div>
      ),
    },
    {
      key: 'caption',
      header: 'Caption',
      render: (row) => (
        <div className="max-w-xs">
          <p className="line-clamp-1 font-medium text-espresso">{row.caption || '\u2014'}</p>
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
      key: 'type',
      header: 'Type',
      render: (row) => <span className="text-sm capitalize text-ink-muted">{row.type}</span>,
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
              disabled={!canReorder || index === 0 || reorderGalleryItems.isPending}
              className="rounded p-1 text-ink-muted hover:bg-sand-dark hover:text-espresso disabled:opacity-30"
              aria-label="Move up"
            >
              <ArrowUp size={14} />
            </button>
            <button
              type="button"
              onClick={() => moveItem(index, 1)}
              disabled={!canReorder || index === items.length - 1 || reorderGalleryItems.isPending}
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
            to={`/gallery/${row._id}/edit`}
            className="rounded p-1.5 text-ink-muted hover:bg-sand-dark hover:text-espresso"
            aria-label="Edit gallery item"
          >
            <Pencil size={15} />
          </Link>
          <button
            type="button"
            onClick={() => setPendingDelete(row)}
            className="rounded p-1.5 text-ink-muted hover:bg-rust-light hover:text-rust"
            aria-label="Delete gallery item"
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
        title="Gallery"
        description="Photos and videos shown in the site's gallery section."
        action={
          <Link to="/gallery/new" className={buttonVariants({ variant: 'primary' })}>
            <Plus size={16} />
            New Gallery Item
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
          value={type}
          onChange={(event) => handleTypeChange(event.target.value)}
          className="max-w-36"
        >
          <option value="">All types</option>
          <option value="image">Image</option>
          <option value="video">Video</option>
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
        emptyTitle="No gallery items yet"
        emptyDescription="Add your first photo or video to the gallery."
      />

      {data && <Pagination meta={data.meta} onPageChange={setPage} />}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete this gallery item?"
        description="This can't be undone."
        confirmLabel="Delete"
        destructive
        isLoading={deleteGalleryItem.isPending}
        onConfirm={() => void handleConfirmDelete()}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
