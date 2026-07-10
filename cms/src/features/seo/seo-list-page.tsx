import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Pencil, Plus, Search } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable, type DataTableColumn } from '@/components/shared/data-table';
import { Pagination } from '@/components/shared/pagination';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { buttonVariants } from '@/components/ui/button';
import { useSeoEntries } from './seo-api';
import type { SeoEntry, SeoPageType } from '@/types/seo';

const PAGE_LIMIT = 20;

const PAGE_TYPE_LABELS: Record<SeoPageType, string> = {
  home: 'Home',
  about: 'About',
  contact: 'Contact',
  gallery: 'Gallery',
  'blogs-listing': 'Blogs listing',
  product: 'Product',
  blog: 'Blog',
  category: 'Category',
  custom: 'Custom',
};

/**
 * One row per URL on the site — static pages (home, about, contact,
 * gallery, the two listing pages) plus one auto-generated row per
 * product/blog/category, kept in sync with that content's current
 * slug by the backend (see `SeoEntriesService.syncForEntity`). Editing
 * here only ever touches meta title/description/keywords/OG
 * image/canonical URL — path, type and the content it belongs to are
 * read-only, derived from that content itself.
 */
export function SeoListPage() {
  const [searchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [pageType, setPageType] = useState<SeoPageType | ''>('');

  const { data, isLoading, isError } = useSeoEntries({
    page,
    limit: PAGE_LIMIT,
    search: search || undefined,
    pageType: pageType || undefined,
  });

  const items = data?.items ?? [];

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handlePageTypeChange(value: string) {
    setPageType(value as SeoPageType | '');
    setPage(1);
  }

  const columns: DataTableColumn<SeoEntry>[] = [
    {
      key: 'path',
      header: 'Page',
      render: (row) => (
        <div>
          <p className="font-medium text-espresso">{row.entityLabel || row.path}</p>
          <p className="font-mono text-xs text-ink-muted">{row.path}</p>
        </div>
      ),
    },
    {
      key: 'pageType',
      header: 'Type',
      render: (row) => <Badge variant="neutral">{PAGE_TYPE_LABELS[row.pageType]}</Badge>,
    },
    {
      key: 'metaTitle',
      header: 'Meta title',
      render: (row) =>
        row.metaTitle ? (
          <span className="text-sm text-espresso">{row.metaTitle}</span>
        ) : (
          <span className="text-sm italic text-ink-muted">Not set</span>
        ),
    },
    {
      key: 'updatedAt',
      header: 'Updated',
      render: (row) => (
        <span className="text-sm text-ink-muted">
          {new Date(row.updatedAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      headerClassName: 'w-16',
      className: 'text-right',
      render: (row) => (
        <Link
          to={`/seo/${row._id}/edit`}
          className="rounded p-1.5 text-ink-muted hover:bg-sand-dark hover:text-espresso"
          aria-label={`Edit SEO for ${row.entityLabel || row.path}`}
        >
          <Pencil size={15} />
        </Link>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="SEO"
        description="Meta title, description, keywords, OG image and canonical URL for every page on the site, in one place."
        action={
          <Link to="/seo/new" className={buttonVariants({ variant: 'primary' })}>
            <Plus size={16} />
            Add custom page
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative max-w-xs flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <Input
            value={search}
            onChange={(event) => handleSearchChange(event.target.value)}
            placeholder="Search by page or path…"
            className="pl-9"
          />
        </div>
        <Select
          value={pageType}
          onChange={(event) => handlePageTypeChange(event.target.value)}
          className="max-w-52"
        >
          <option value="">All page types</option>
          {(Object.entries(PAGE_TYPE_LABELS) as [SeoPageType, string][]).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
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
        emptyTitle="No SEO entries found"
        emptyDescription="Entries appear automatically as you add products, blogs and categories."
      />

      {data && <Pagination meta={data.meta} onPageChange={setPage} />}
    </div>
  );
}
