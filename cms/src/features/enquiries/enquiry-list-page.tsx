import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Trash2, Inbox, Bell, PhoneCall, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable, type DataTableColumn } from '@/components/shared/data-table';
import { Pagination } from '@/components/shared/pagination';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { toast } from '@/lib/toast';
import { getErrorMessage } from '@/lib/http-error';
import { StatCard } from '@/features/dashboard/stat-card';
import { useCategoryOptions } from '@/features/categories/categories-api';
import { useEnquiries, useEnquiryStats, useDeleteEnquiry } from './enquiries-api';
import { EnquiryStatusBadge } from './enquiry-status-badge';
import { ENQUIRY_STATUSES, ENQUIRY_SOURCES, SOURCE_LABELS } from './enquiry-constants';
import type { Enquiry, EnquiryStatus, EnquirySource } from '@/types/enquiry';

const PAGE_LIMIT = 20;

export function EnquiryListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<EnquiryStatus | ''>('');
  const [source, setSource] = useState<EnquirySource | ''>('');
  const [category, setCategory] = useState('');
  const [pendingDelete, setPendingDelete] = useState<Enquiry | null>(null);

  const { data, isLoading, isError } = useEnquiries({
    page,
    limit: PAGE_LIMIT,
    search: search || undefined,
    status: status || undefined,
    source: source || undefined,
    category: category || undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const { data: stats } = useEnquiryStats();
  const { data: categoryOptions } = useCategoryOptions();
  const deleteEnquiry = useDeleteEnquiry();

  const items = data?.items ?? [];

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleStatusChange(value: string) {
    setStatus(value as EnquiryStatus | '');
    setPage(1);
  }

  function handleSourceChange(value: string) {
    setSource(value as EnquirySource | '');
    setPage(1);
  }

  function handleCategoryChange(value: string) {
    setCategory(value);
    setPage(1);
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    try {
      await deleteEnquiry.mutateAsync(pendingDelete._id);
      toast.success('Enquiry deleted');
      setPendingDelete(null);
    } catch (error) {
      toast.error('Couldn\u2019t delete enquiry', getErrorMessage(error));
    }
  }

  const columns: DataTableColumn<Enquiry>[] = [
    {
      key: 'lead',
      header: 'Lead',
      render: (row) => (
        <div>
          <p className="font-medium text-espresso">{row.fullName}</p>
          <p className="text-xs text-ink-muted">
            {row.mobileNumber}
            {row.city ? ` \u00b7 ${row.city}` : ''}
          </p>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Interested in',
      render: (row) => (
        <span className="text-sm text-ink-muted">{row.interestedCategory?.name ?? '\u2014'}</span>
      ),
    },
    {
      key: 'source',
      header: 'Source',
      render: (row) => <span className="text-sm text-ink-muted">{SOURCE_LABELS[row.source]}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <EnquiryStatusBadge status={row.status} />,
    },
    {
      key: 'createdAt',
      header: 'Received',
      render: (row) => (
        <span className="text-xs text-ink-muted">
          {new Date(row.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
          })}{' '}
          {new Date(row.createdAt).toLocaleTimeString('en-IN', {
            hour: 'numeric',
            minute: '2-digit',
          })}
        </span>
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
            to={`/enquiries/${row._id}`}
            className="rounded p-1.5 text-ink-muted hover:bg-sand-dark hover:text-espresso"
            aria-label={`View enquiry from ${row.fullName}`}
          >
            <Eye size={15} />
          </Link>
          <button
            type="button"
            onClick={() => setPendingDelete(row)}
            className="rounded p-1.5 text-ink-muted hover:bg-rust-light hover:text-rust"
            aria-label={`Delete enquiry from ${row.fullName}`}
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Enquiries" description="Leads submitted through the website." />

      {stats && (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total leads" value={stats.total} icon={Inbox} />
          <StatCard label="New" value={stats.byStatus.new} icon={Bell} accent="rust" />
          <StatCard label="Contacted" value={stats.byStatus.contacted} icon={PhoneCall} accent="sage" />
          <StatCard label="Closed" value={stats.byStatus.closed} icon={CheckCircle2} />
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-3">
        <Input
          placeholder="Search name, mobile, city…"
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
          value={source}
          onChange={(event) => handleSourceChange(event.target.value)}
          className="max-w-44"
        >
          <option value="">All sources</option>
          {ENQUIRY_SOURCES.map((s) => (
            <option key={s} value={s}>
              {SOURCE_LABELS[s]}
            </option>
          ))}
        </Select>
        <Select
          value={status}
          onChange={(event) => handleStatusChange(event.target.value)}
          className="max-w-40"
        >
          <option value="">All statuses</option>
          {ENQUIRY_STATUSES.map((s) => (
            <option key={s} value={s} className="capitalize">
              {s}
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
        emptyTitle="No enquiries yet"
        emptyDescription="Leads submitted through the site's enquiry forms will show up here."
      />

      {data && <Pagination meta={data.meta} onPageChange={setPage} />}

      <ConfirmDialog
        open={pendingDelete !== null}
        title={`Delete enquiry from "${pendingDelete?.fullName}"?`}
        description="This can't be undone."
        confirmLabel="Delete"
        destructive
        isLoading={deleteEnquiry.isPending}
        onConfirm={() => void handleConfirmDelete()}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
