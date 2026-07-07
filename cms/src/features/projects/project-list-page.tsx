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
import { useProjects, useDeleteProject, useReorderProjects } from './projects-api';
import { useCategoryOptions } from '@/features/categories/categories-api';
import type { Project, ProjectStatus } from '@/types/project';

const PAGE_LIMIT = 20;

export function ProjectListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<ProjectStatus | ''>('');
  const [category, setCategory] = useState('');
  const [pendingDelete, setPendingDelete] = useState<Project | null>(null);

  const { data, isLoading, isError } = useProjects({
    page,
    limit: PAGE_LIMIT,
    search: search || undefined,
    status: status || undefined,
    category: category || undefined,
    sortBy: 'displayOrder',
    sortOrder: 'asc',
  });
  const { data: categoryOptions } = useCategoryOptions();
  const deleteProject = useDeleteProject();
  const reorderProjects = useReorderProjects();

  const items = data?.items ?? [];
  // Reorder only makes sense against the unfiltered, order-sorted list — same
  // caveat as categories, just more likely to bite here since projects also
  // filter by category.
  const canReorder = !search && !status && !category;

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleStatusChange(value: string) {
    setStatus(value as ProjectStatus | '');
    setPage(1);
  }

  function handleCategoryChange(value: string) {
    setCategory(value);
    setPage(1);
  }

  function moveProject(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const current = items[index];
    const target = items[targetIndex];

    reorderProjects.mutate(
      [
        { id: current._id, displayOrder: target.displayOrder },
        { id: target._id, displayOrder: current.displayOrder },
      ],
      {
        onError: (error) => toast.error('Couldn\u2019t reorder projects', getErrorMessage(error)),
      },
    );
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    try {
      await deleteProject.mutateAsync(pendingDelete._id);
      toast.success('Project deleted');
      setPendingDelete(null);
    } catch (error) {
      toast.error('Couldn\u2019t delete project', getErrorMessage(error));
    }
  }

  const columns: DataTableColumn<Project>[] = [
    {
      key: 'coverImage',
      header: '',
      headerClassName: 'w-16',
      render: (row) =>
        row.coverImage ? (
          <img
            src={row.coverImage.url}
            alt={row.coverImage.alt || row.title}
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
      render: (row) => <span className="text-sm text-ink-muted">{row.category?.name ?? '\u2014'}</span>,
    },
    {
      key: 'location',
      header: 'Location',
      render: (row) => <span className="text-sm text-ink-muted">{row.location || '\u2014'}</span>,
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
              onClick={() => moveProject(index, -1)}
              disabled={!canReorder || index === 0 || reorderProjects.isPending}
              className="rounded p-1 text-ink-muted hover:bg-sand-dark hover:text-espresso disabled:opacity-30"
              aria-label="Move up"
            >
              <ArrowUp size={14} />
            </button>
            <button
              type="button"
              onClick={() => moveProject(index, 1)}
              disabled={!canReorder || index === items.length - 1 || reorderProjects.isPending}
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
            to={`/projects/${row._id}/edit`}
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
        title="Projects"
        description="Completed work shown on the Projects page and homepage."
        action={
          <Link to="/projects/new" className={buttonVariants({ variant: 'primary' })}>
            <Plus size={16} />
            New Project
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <Input
          placeholder="Search by title or description…"
          value={search}
          onChange={(event) => handleSearchChange(event.target.value)}
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
        emptyTitle="No projects yet"
        emptyDescription="Add your first completed project to showcase it on the site."
      />

      {data && <Pagination meta={data.meta} onPageChange={setPage} />}

      <ConfirmDialog
        open={pendingDelete !== null}
        title={`Delete "${pendingDelete?.title}"?`}
        description="This can't be undone."
        confirmLabel="Delete"
        destructive
        isLoading={deleteProject.isPending}
        onConfirm={() => void handleConfirmDelete()}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
