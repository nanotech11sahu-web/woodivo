import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Share2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable, type DataTableColumn } from '@/components/shared/data-table';
import { Pagination } from '@/components/shared/pagination';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Badge } from '@/components/ui/badge';
import { buttonVariants, Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { toast } from '@/lib/toast';
import { getErrorMessage } from '@/lib/http-error';
import {
  useCustomPosts,
  useDeleteCustomPost,
  usePostCustomPostsToSocial,
} from './custom-posts-api';
import type { CustomPost, CustomPostStatus } from '@/types/custom-post';

const PAGE_LIMIT = 20;

export function CustomPostListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<CustomPostStatus | ''>('');
  const [pendingDelete, setPendingDelete] = useState<CustomPost | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [pendingSocialIds, setPendingSocialIds] = useState<string[] | null>(null);
  const [postNow, setPostNow] = useState(false);

  const { data, isLoading, isError } = useCustomPosts({
    page,
    limit: PAGE_LIMIT,
    search: search || undefined,
    status: status || undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const deleteCustomPost = useDeleteCustomPost();
  const postToSocial = usePostCustomPostsToSocial();
  const items = data?.items ?? [];

  useEffect(() => {
    setSelectedIds(new Set());
  }, [page, search, status]);

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleStatusChange(value: string) {
    setStatus(value as CustomPostStatus | '');
    setPage(1);
  }

  function toggleRow(row: CustomPost) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(row._id)) next.delete(row._id);
      else next.add(row._id);
      return next;
    });
  }

  function toggleAll() {
    setSelectedIds((prev) =>
      prev.size === items.length ? new Set() : new Set(items.map((row) => row._id)),
    );
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    try {
      await deleteCustomPost.mutateAsync(pendingDelete._id);
      toast.success('Post deleted');
      setPendingDelete(null);
    } catch (error) {
      toast.error("Couldn't delete post", getErrorMessage(error));
    }
  }

  async function handleConfirmPostToSocial() {
    if (!pendingSocialIds) return;
    try {
      const response = await postToSocial.mutateAsync({
        ids: pendingSocialIds,
        options: postNow ? { postNow: true } : undefined,
      });
      const succeeded = response.results.filter((r) => r.success);
      const failed = response.results.filter((r) => !r.success);

      if (succeeded.length > 0) {
        toast.success(
          postNow
            ? `Publishing ${succeeded.length} post${succeeded.length === 1 ? '' : 's'} now`
            : `Queued ${succeeded.length} post${succeeded.length === 1 ? '' : 's'} for publishing`,
        );
      }
      if (failed.length > 0) {
        toast.error(
          `${failed.length} item${failed.length === 1 ? '' : 's'} couldn't be queued`,
          failed.map((f) => f.error).join('; '),
        );
      }

      setPendingSocialIds(null);
      setPostNow(false);
      setSelectedIds(new Set());
    } catch (error) {
      toast.error("Couldn't post to social", getErrorMessage(error));
    }
  }

  const columns: DataTableColumn<CustomPost>[] = [
    {
      key: 'images',
      header: '',
      headerClassName: 'w-16',
      render: (row) =>
        row.images[0] ? (
          <img
            src={row.images[0].url}
            alt={row.images[0].alt || row.title}
            className="h-10 w-10 rounded-md border border-border-warm object-cover"
          />
        ) : (
          <div className="h-10 w-10 rounded-md border border-dashed border-border-warm" />
        ),
    },
    {
      key: 'title',
      header: 'Title',
      render: (row) => (
        <div>
          <p className="font-medium text-espresso">{row.title}</p>
          <p className="text-xs text-ink-muted">
            {row.images.length} image{row.images.length === 1 ? '' : 's'}
          </p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge variant={row.status === 'posted' ? 'active' : 'inactive'}>
          {row.status === 'posted' ? 'Posted' : 'Draft'}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (row) => (
        <span className="text-xs text-ink-muted">
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      headerClassName: 'w-32',
      className: 'text-right',
      render: (row) => (
        <div className="flex justify-end gap-1.5">
          <button
            type="button"
            onClick={() => setPendingSocialIds([row._id])}
            className="rounded p-1.5 text-ink-muted hover:bg-sand-dark hover:text-espresso"
            aria-label={`Post ${row.title} to social`}
          >
            <Share2 size={15} />
          </button>
          <Link
            to={`/custom-posts/${row._id}/edit`}
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
        title="Custom Posts"
        description="One-off image posts for Facebook/Instagram — not tied to any product or blog, and never shown on the website."
        action={
          <Link to="/custom-posts/new" className={buttonVariants({ variant: 'primary' })}>
            <Plus size={16} />
            New Post
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <Input
          placeholder="Search by title…"
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
          <option value="draft">Draft</option>
          <option value="posted">Posted</option>
        </Select>
      </div>

      {selectedIds.size > 0 && (
        <div className="mb-4 flex items-center justify-between rounded-card border border-border-warm bg-sand/60 px-4 py-2.5">
          <span className="text-sm text-ink-muted">
            {selectedIds.size} post{selectedIds.size === 1 ? '' : 's'} selected
          </span>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>
              Clear
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPendingSocialIds(Array.from(selectedIds))}
            >
              <Share2 size={14} />
              Post to Social
            </Button>
          </div>
        </div>
      )}

      <DataTable
        columns={columns}
        data={items}
        getRowKey={(row) => row._id}
        isLoading={isLoading}
        isError={isError}
        emptyTitle="No custom posts yet"
        emptyDescription="Create a post to share images and a caption straight to social media."
        selection={{ selectedIds, onToggleRow: toggleRow, onToggleAll: toggleAll }}
      />

      {data && <Pagination meta={data.meta} onPageChange={setPage} />}

      <ConfirmDialog
        open={pendingDelete !== null}
        title={`Delete "${pendingDelete?.title}"?`}
        description="This can't be undone."
        confirmLabel="Delete"
        destructive
        isLoading={deleteCustomPost.isPending}
        onConfirm={() => void handleConfirmDelete()}
        onCancel={() => setPendingDelete(null)}
      />

      <ConfirmDialog
        open={pendingSocialIds !== null}
        title={
          pendingSocialIds && pendingSocialIds.length === 1
            ? 'Post this to social?'
            : `Post ${pendingSocialIds?.length ?? 0} posts to social?`
        }
        description="This generates AI captions from each post's images and brief, and publishes live to Facebook and Instagram — every image goes out together as a carousel."
        confirmLabel="Post"
        isLoading={postToSocial.isPending}
        onConfirm={() => void handleConfirmPostToSocial()}
        onCancel={() => {
          setPendingSocialIds(null);
          setPostNow(false);
        }}
      >
        <label className="flex items-start gap-2 text-sm text-ink-muted">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-border-warm accent-walnut"
            checked={postNow}
            onChange={(event) => setPostNow(event.target.checked)}
          />
          <span>
            <span className="font-medium text-espresso">Post now</span> — skip the next
            scheduled slot (10am/1pm/5pm/8pm) and publish as soon as possible.
          </span>
        </label>
      </ConfirmDialog>
    </div>
  );
}
