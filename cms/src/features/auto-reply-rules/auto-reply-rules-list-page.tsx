import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable, type DataTableColumn } from '@/components/shared/data-table';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { toast } from '@/lib/toast';
import { getErrorMessage } from '@/lib/http-error';
import { useAutoReplyRules, useDeleteAutoReplyRule } from './auto-reply-rules-api';
import type { AutoReplyRule } from '@/types/auto-reply-rule';

export function AutoReplyRulesListPage() {
  const { data, isLoading, isError } = useAutoReplyRules();
  const deleteRule = useDeleteAutoReplyRule();
  const [pendingDelete, setPendingDelete] = useState<AutoReplyRule | null>(null);

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    try {
      await deleteRule.mutateAsync(pendingDelete.id);
      toast.success('Rule deleted');
      setPendingDelete(null);
    } catch (error) {
      toast.error("Couldn't delete rule", getErrorMessage(error));
    }
  }

  const columns: DataTableColumn<AutoReplyRule>[] = [
    {
      key: 'platform',
      header: 'Platform',
      render: (row) => (
        <Badge variant="neutral" className="capitalize">
          {row.platform.toLowerCase()}
        </Badge>
      ),
    },
    {
      key: 'trigger',
      header: 'Fires on',
      render: (row) => (
        <Badge variant="neutral">{row.trigger === 'COMMENT' ? 'Comment' : 'DM'}</Badge>
      ),
    },
    {
      key: 'keywords',
      header: 'Keywords',
      render: (row) => (
        <div className="flex max-w-xs flex-wrap gap-1">
          {row.keywords.map((keyword) => (
            <span
              key={keyword}
              className="rounded bg-sand-dark px-1.5 py-0.5 text-xs text-ink-muted"
            >
              {keyword}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'active',
      header: 'Active',
      render: (row) => (
        <Badge variant={row.active ? 'active' : 'inactive'}>{row.active ? 'Active' : 'Off'}</Badge>
      ),
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (row) => <span className="text-xs text-ink-muted">{row.priority}</span>,
    },
    {
      key: 'actions',
      header: '',
      headerClassName: 'w-24',
      className: 'text-right',
      render: (row) => (
        <div className="flex justify-end gap-1.5">
          <Link
            to={`/auto-reply-rules/${row.id}/edit`}
            className="rounded p-1.5 text-ink-muted hover:bg-sand-dark hover:text-espresso"
            aria-label="Edit rule"
          >
            <Pencil size={15} />
          </Link>
          <button
            type="button"
            onClick={() => setPendingDelete(row)}
            className="rounded p-1.5 text-ink-muted hover:bg-rust-light hover:text-rust"
            aria-label="Delete rule"
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
        title="Auto-Reply Rules"
        description="Keyword-triggered replies and DMs for Facebook/Instagram comments and messages."
        action={
          <Link to="/auto-reply-rules/new" className={buttonVariants({ variant: 'primary' })}>
            <Plus size={16} />
            New Rule
          </Link>
        }
      />

      <DataTable
        columns={columns}
        data={data ?? []}
        getRowKey={(row) => row.id}
        isLoading={isLoading}
        isError={isError}
        emptyTitle="No auto-reply rules yet"
        emptyDescription="Create a rule to automatically reply to comments or DMs that match a keyword."
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete this rule?"
        description="This can't be undone."
        confirmLabel="Delete"
        destructive
        isLoading={deleteRule.isPending}
        onConfirm={() => void handleConfirmDelete()}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
