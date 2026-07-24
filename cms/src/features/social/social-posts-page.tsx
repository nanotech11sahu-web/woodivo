import { useState } from 'react';
import { ExternalLink, RefreshCw } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable, type DataTableColumn } from '@/components/shared/data-table';
import { Pagination } from '@/components/shared/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSocialHealth, useSocialPosts } from './social-api';
import type { SocialPostStatus, SocialPostSummary } from '@/types/social-post';

const PAGE_LIMIT = 20;

const STATUS_VARIANT: Record<SocialPostStatus, 'active' | 'destructive' | 'neutral'> = {
  PENDING: 'neutral',
  PROCESSING: 'neutral',
  VALIDATING: 'neutral',
  AI_GENERATING: 'neutral',
  MEDIA_PROCESSING: 'neutral',
  PUBLISHING: 'neutral',
  COMPLETED: 'active',
  FAILED: 'destructive',
};

const STATUS_LABEL: Record<SocialPostStatus, string> = {
  PENDING: 'Pending',
  PROCESSING: 'Processing',
  VALIDATING: 'Validating',
  AI_GENERATING: 'Generating captions',
  MEDIA_PROCESSING: 'Processing media',
  PUBLISHING: 'Publishing',
  COMPLETED: 'Published',
  FAILED: 'Failed',
};

function HealthBanner() {
  const { data, isLoading, refetch, isFetching } = useSocialHealth();
  const reachable = data?.reachable ?? false;

  return (
    <div
      className={
        'mb-4 flex items-center justify-between rounded-card border px-4 py-2.5 ' +
        (isLoading
          ? 'border-border-warm bg-sand/60'
          : reachable
            ? 'border-sage/40 bg-sage-light'
            : 'border-rust/40 bg-rust-light')
      }
    >
      <div className="flex items-center gap-2 text-sm">
        <span
          className={
            'h-2 w-2 rounded-full ' +
            (isLoading ? 'bg-ink-muted' : reachable ? 'bg-sage' : 'bg-rust')
          }
        />
        <span className={isLoading ? 'text-ink-muted' : reachable ? 'text-sage' : 'text-rust'}>
          {isLoading
            ? 'Checking Social Publisher connection…'
            : reachable
              ? 'Social Publisher: Connected'
              : 'Social Publisher: Unreachable'}
        </span>
      </div>
      <Button variant="ghost" size="sm" onClick={() => void refetch()} disabled={isFetching}>
        <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
        Recheck
      </Button>
    </div>
  );
}

export function SocialPostsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useSocialPosts(page, PAGE_LIMIT);

  const columns: DataTableColumn<SocialPostSummary>[] = [
    {
      key: 'type',
      header: 'Type',
      render: (row) => (
        <Badge variant="neutral" className="capitalize">
          {row.sourceType.toLowerCase()}
        </Badge>
      ),
    },
    {
      key: 'title',
      header: 'Title',
      render: (row) => (
        <div>
          <p className="font-medium text-espresso">{row.sourceTitle ?? row.reference}</p>
          <p className="text-xs text-ink-muted">{row.reference}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <div>
          <Badge variant={STATUS_VARIANT[row.status]}>{STATUS_LABEL[row.status]}</Badge>
          {row.status === 'FAILED' && row.failureReason && (
            <p className="mt-1 max-w-xs text-xs text-rust">{row.failureReason}</p>
          )}
        </div>
      ),
    },
    {
      key: 'submitted',
      header: 'Submitted',
      render: (row) => (
        <span className="text-xs text-ink-muted">
          {new Date(row.createdAt).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'resolved',
      header: 'Completed / Failed',
      render: (row) => {
        const resolvedAt = row.completedAt ?? row.failedAt;
        return (
          <span className="text-xs text-ink-muted">
            {resolvedAt ? new Date(resolvedAt).toLocaleString() : '—'}
          </span>
        );
      },
    },
    {
      key: 'platforms',
      header: 'Live links',
      render: (row) =>
        row.platforms.length === 0 ? (
          <span className="text-xs text-ink-muted">—</span>
        ) : (
          <div className="flex flex-col gap-1">
            {row.platforms.map((platform) =>
              platform.permalink ? (
                <a
                  key={platform.platform}
                  href={platform.permalink}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-xs text-walnut hover:underline"
                >
                  <ExternalLink size={12} />
                  {platform.platform === 'FACEBOOK' ? 'Facebook' : 'Instagram'}
                </a>
              ) : (
                <span key={platform.platform} className="text-xs text-ink-muted">
                  {platform.platform === 'FACEBOOK' ? 'Facebook' : 'Instagram'} (no link)
                </span>
              ),
            )}
          </div>
        ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Social Posts"
        description="Everything sent to the Social Publisher for Facebook/Instagram, with live status."
      />

      <HealthBanner />

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        getRowKey={(row) => row.id}
        isLoading={isLoading}
        isError={isError}
        emptyTitle="Nothing sent to social yet"
        emptyDescription="Use 'Post to Social' on a product or blog to see it show up here."
      />

      {data && <Pagination meta={data.meta} onPageChange={setPage} />}
    </div>
  );
}
