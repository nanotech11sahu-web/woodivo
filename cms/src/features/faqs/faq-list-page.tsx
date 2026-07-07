import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
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
import { useFaqs, useDeleteFaq, useReorderFaqs } from './faqs-api';
import type { Faq, FaqStatus } from '@/types/faq';

const PAGE_LIMIT = 20;

export function FaqListPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<FaqStatus | ''>('');
  const [group, setGroup] = useState('');
  const [pendingDelete, setPendingDelete] = useState<Faq | null>(null);

  const { data, isLoading, isError } = useFaqs({
    page,
    limit: PAGE_LIMIT,
    status: status || undefined,
    // The backend matches `group` exactly (no partial/regex match, no
    // endpoint listing distinct groups yet), so this behaves less like a
    // search box and more like a precise filter — it just won't match until
    // the value is typed exactly as stored.
    group: group || undefined,
    sortBy: 'displayOrder',
    sortOrder: 'asc',
  });
  const deleteFaq = useDeleteFaq();
  const reorderFaqs = useReorderFaqs();

  const items = data?.items ?? [];
  const canReorder = !status && !group;

  function handleStatusChange(value: string) {
    setStatus(value as FaqStatus | '');
    setPage(1);
  }

  function handleGroupChange(value: string) {
    setGroup(value);
    setPage(1);
  }

  function moveFaq(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const current = items[index];
    const target = items[targetIndex];

    reorderFaqs.mutate(
      [
        { id: current._id, displayOrder: target.displayOrder },
        { id: target._id, displayOrder: current.displayOrder },
      ],
      {
        onError: (error) => toast.error('Couldn\u2019t reorder FAQs', getErrorMessage(error)),
      },
    );
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    try {
      await deleteFaq.mutateAsync(pendingDelete._id);
      toast.success('FAQ deleted');
      setPendingDelete(null);
    } catch (error) {
      toast.error('Couldn\u2019t delete FAQ', getErrorMessage(error));
    }
  }

  const columns: DataTableColumn<Faq>[] = [
    {
      key: 'question',
      header: 'Question',
      render: (row) => (
        <div className="max-w-md">
          <p className="font-medium text-espresso">{row.question}</p>
          <p className="line-clamp-1 text-xs text-ink-muted">{row.answer}</p>
        </div>
      ),
    },
    {
      key: 'group',
      header: 'Group',
      render: (row) => <span className="text-sm text-ink-muted">{row.group || '\u2014'}</span>,
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
              onClick={() => moveFaq(index, -1)}
              disabled={!canReorder || index === 0 || reorderFaqs.isPending}
              className="rounded p-1 text-ink-muted hover:bg-sand-dark hover:text-espresso disabled:opacity-30"
              aria-label="Move up"
            >
              <ArrowUp size={14} />
            </button>
            <button
              type="button"
              onClick={() => moveFaq(index, 1)}
              disabled={!canReorder || index === items.length - 1 || reorderFaqs.isPending}
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
            to={`/faqs/${row._id}/edit`}
            className="rounded p-1.5 text-ink-muted hover:bg-sand-dark hover:text-espresso"
            aria-label={`Edit ${row.question}`}
          >
            <Pencil size={15} />
          </Link>
          <button
            type="button"
            onClick={() => setPendingDelete(row)}
            className="rounded p-1.5 text-ink-muted hover:bg-rust-light hover:text-rust"
            aria-label={`Delete ${row.question}`}
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
        title="FAQs"
        description="Frequently asked questions shown on the homepage and dedicated FAQ sections."
        action={
          <Link to="/faqs/new" className={buttonVariants({ variant: 'primary' })}>
            <Plus size={16} />
            New FAQ
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <Input
          placeholder="Filter by exact group…"
          value={group}
          onChange={(event) => handleGroupChange(event.target.value)}
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
        emptyTitle="No FAQs yet"
        emptyDescription="Add your first frequently asked question."
      />

      {data && <Pagination meta={data.meta} onPageChange={setPage} />}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete this FAQ?"
        description="This can't be undone."
        confirmLabel="Delete"
        destructive
        isLoading={deleteFaq.isPending}
        onConfirm={() => void handleConfirmDelete()}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
