import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Star, Settings2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable, type DataTableColumn } from '@/components/shared/data-table';
import { Pagination } from '@/components/shared/pagination';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { toast } from '@/lib/toast';
import { getErrorMessage } from '@/lib/http-error';
import { useBlogs, useDeleteBlog } from './blogs-api';
import { useBlogCategories } from './blog-categories-api';
import { BlogStatusBadge } from './blog-status-badge';
import type { Blog, BlogStatus } from '@/types/blog';

const PAGE_LIMIT = 20;

export function BlogListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<BlogStatus | ''>('');
  const [category, setCategory] = useState('');
  const [pendingDelete, setPendingDelete] = useState<Blog | null>(null);

  const { data, isLoading, isError } = useBlogs({
    page,
    limit: PAGE_LIMIT,
    search: search || undefined,
    status: status || undefined,
    category: category || undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const { data: categories } = useBlogCategories();

  const deleteBlog = useDeleteBlog();
  const items = data?.items ?? [];

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleStatusChange(value: string) {
    setStatus(value as BlogStatus | '');
    setPage(1);
  }

  function handleCategoryChange(value: string) {
    setCategory(value);
    setPage(1);
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    try {
      await deleteBlog.mutateAsync(pendingDelete._id);
      toast.success('Blog post deleted');
      setPendingDelete(null);
    } catch (error) {
      toast.error('Couldn\u2019t delete blog post', getErrorMessage(error));
    }
  }

  const columns: DataTableColumn<Blog>[] = [
    {
      key: 'featuredImage',
      header: '',
      headerClassName: 'w-16',
      render: (row) =>
        row.featuredImage ? (
          <img
            src={row.featuredImage.url}
            alt={row.featuredImage.alt || row.title}
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
          <p className="text-xs text-ink-muted">/{row.slug}</p>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (row) => (
        <span className="text-ink-muted">{row.category?.name ?? '\u2014'}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <BlogStatusBadge status={row.status} />,
    },
    {
      key: 'featured',
      header: 'Featured',
      render: (row) =>
        row.isFeatured ? <Star size={16} className="fill-walnut text-walnut" /> : null,
    },
    {
      key: 'publishAt',
      header: 'Publish date',
      render: (row) =>
        row.publishAt ? (
          <span className="text-xs text-ink-muted">
            {new Date(row.publishAt).toLocaleDateString()}
          </span>
        ) : (
          <span className="text-xs text-ink-muted">\u2014</span>
        ),
    },
    {
      key: 'actions',
      header: '',
      headerClassName: 'w-24',
      className: 'text-right',
      render: (row) => (
        <div className="flex justify-end gap-1.5">
          <Link
            to={`/blogs/${row._id}/edit`}
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
        title="Blogs"
        description="Posts shown on the public blog, with draft, scheduled and published workflow."
        action={
          <div className="flex gap-2">
            <Link to="/blogs/categories" className={buttonVariants({ variant: 'secondary' })}>
              <Settings2 size={16} />
              Categories
            </Link>
            <Link to="/blogs/new" className={buttonVariants({ variant: 'primary' })}>
              <Plus size={16} />
              New Post
            </Link>
          </div>
        }
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <Input
          placeholder="Search by title, excerpt or tag…"
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
          <option value="published">Published</option>
          <option value="scheduled">Scheduled</option>
          <option value="archived">Archived</option>
        </Select>
        <Select
          value={category}
          onChange={(event) => handleCategoryChange(event.target.value)}
          className="max-w-48"
        >
          <option value="">All categories</option>
          {categories?.map((option) => (
            <option key={option._id} value={option._id}>
              {option.name}
            </option>
          ))}
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={items}
        getRowKey={(row) => row._id}
        isLoading={isLoading}
        isError={isError}
        emptyTitle="No blog posts yet"
        emptyDescription="Create your first post to start filling out the blog."
      />

      {data && <Pagination meta={data.meta} onPageChange={setPage} />}

      <ConfirmDialog
        open={pendingDelete !== null}
        title={`Delete "${pendingDelete?.title}"?`}
        description="This can't be undone."
        confirmLabel="Delete"
        destructive
        isLoading={deleteBlog.isPending}
        onConfirm={() => void handleConfirmDelete()}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
