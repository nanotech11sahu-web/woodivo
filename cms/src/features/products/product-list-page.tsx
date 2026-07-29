import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Star, Share2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable, type DataTableColumn } from '@/components/shared/data-table';
import { Pagination } from '@/components/shared/pagination';
import { StatusBadge } from '@/components/shared/status-badge';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { buttonVariants, Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { toast } from '@/lib/toast';
import { getErrorMessage } from '@/lib/http-error';
import { useProducts, useDeleteProduct, usePostProductsToSocial } from './products-api';
import { useCategoryOptions } from '@/features/categories/categories-api';
import { useSubCategoryOptions } from '@/features/subcategories/subcategories-api';
import type { Product, ProductStatus } from '@/types/product';

const PAGE_LIMIT = 20;

export function ProductListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<ProductStatus | ''>('');
  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [needsPriceReviewOnly, setNeedsPriceReviewOnly] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [pendingSocialIds, setPendingSocialIds] = useState<string[] | null>(null);
  const [postNow, setPostNow] = useState(false);

  const { data, isLoading, isError } = useProducts({
    page,
    limit: PAGE_LIMIT,
    search: search || undefined,
    status: status || undefined,
    category: category || undefined,
    subCategory: subCategory || undefined,
    needsPriceReview: needsPriceReviewOnly || undefined,
  });
  const { data: categoryOptions } = useCategoryOptions();
  const { data: subCategoryOptions } = useSubCategoryOptions(category || undefined);
  const deleteProduct = useDeleteProduct();
  const postToSocial = usePostProductsToSocial();

  const items = data?.items ?? [];

  // A selection only ever refers to what's visible on the current page/filter -
  // clear it whenever any of those change so "select all" can't silently carry
  // over ids the admin can no longer see.
  useEffect(() => {
    setSelectedIds(new Set());
  }, [page, search, status, category, subCategory, needsPriceReviewOnly]);

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleStatusChange(value: string) {
    setStatus(value as ProductStatus | '');
    setPage(1);
  }

  function handleCategoryChange(value: string) {
    setCategory(value);
    setSubCategory('');
    setPage(1);
  }

  function handleSubCategoryChange(value: string) {
    setSubCategory(value);
    setPage(1);
  }

  function toggleRow(row: Product) {
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
      await deleteProduct.mutateAsync(pendingDelete._id);
      toast.success('Product deleted');
      setPendingDelete(null);
    } catch (error) {
      toast.error('Couldn’t delete product', getErrorMessage(error));
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
          `${failed.length} item${failed.length === 1 ? '' : 's'} couldn’t be queued`,
          failed.map((f) => f.error).join('; '),
        );
      }

      setPendingSocialIds(null);
      setPostNow(false);
      setSelectedIds(new Set());
    } catch (error) {
      toast.error('Couldn’t post to social', getErrorMessage(error));
    }
  }

  const columns: DataTableColumn<Product>[] = [
    {
      key: 'image',
      header: '',
      headerClassName: 'w-16',
      render: (row) =>
        row.images[0] ? (
          <img
            src={row.images[0].url}
            alt={row.images[0].alt || row.name}
            className="h-10 w-10 rounded-md border border-border-warm object-cover"
          />
        ) : (
          <div className="h-10 w-10 rounded-md border border-dashed border-border-warm" />
        ),
    },
    {
      key: 'name',
      header: 'Name',
      render: (row) => (
        <div>
          <p className="font-medium text-espresso">{row.name}</p>
          <p className="text-xs text-ink-muted">/{row.slug}</p>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (row) => (
        <div className="text-sm text-ink-muted">
          <p>{row.category?.name ?? '—'}</p>
          {row.subCategories && row.subCategories.length > 0 && (
            <p className="text-xs">{row.subCategories.map((s) => s.name).join(', ')}</p>
          )}
        </div>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      render: (row) => (
        <div className="text-sm">
          {row.discountPrice ? (
            <>
              <span className="font-medium text-espresso">₹{row.discountPrice.toLocaleString('en-IN')}</span>{' '}
              <span className="text-xs text-ink-muted line-through">₹{row.price.toLocaleString('en-IN')}</span>
            </>
          ) : (
            <span className="font-medium text-espresso">₹{row.price.toLocaleString('en-IN')}</span>
          )}
          {row.needsPriceReview ? (
            <p className="mt-0.5 text-xs font-medium text-rust">Needs review</p>
          ) : null}
        </div>
      ),
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
            aria-label={`Post ${row.name} to social`}
          >
            <Share2 size={15} />
          </button>
          <Link
            to={`/products/${row._id}/edit`}
            className="rounded p-1.5 text-ink-muted hover:bg-sand-dark hover:text-espresso"
            aria-label={`Edit ${row.name}`}
          >
            <Pencil size={15} />
          </Link>
          <button
            type="button"
            onClick={() => setPendingDelete(row)}
            className="rounded p-1.5 text-ink-muted hover:bg-rust-light hover:text-rust"
            aria-label={`Delete ${row.name}`}
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
        title="Products"
        description="Products shown on category pages, product detail pages and homepage."
        action={
          <Link to="/products/new" className={buttonVariants({ variant: 'primary' })}>
            <Plus size={16} />
            New Product
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <Input
          placeholder="Search by name…"
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
          value={subCategory}
          onChange={(event) => handleSubCategoryChange(event.target.value)}
          disabled={!category}
          className="max-w-48"
        >
          <option value="">All subcategories</option>
          {subCategoryOptions?.items.map((option) => (
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
        <label className="flex items-center gap-2 rounded-md border border-border-warm px-3 text-sm text-ink-muted">
          <input
            type="checkbox"
            checked={needsPriceReviewOnly}
            onChange={(event) => {
              setNeedsPriceReviewOnly(event.target.checked);
              setPage(1);
            }}
          />
          Needs price review
        </label>
      </div>

      {selectedIds.size > 0 && (
        <div className="mb-4 flex items-center justify-between rounded-card border border-border-warm bg-sand/60 px-4 py-2.5">
          <span className="text-sm text-ink-muted">
            {selectedIds.size} product{selectedIds.size === 1 ? '' : 's'} selected
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
        emptyTitle="No products yet"
        emptyDescription="Add your first product once at least one category exists."
        selection={{ selectedIds, onToggleRow: toggleRow, onToggleAll: toggleAll }}
      />

      {data && <Pagination meta={data.meta} onPageChange={setPage} />}

      <ConfirmDialog
        open={pendingDelete !== null}
        title={`Delete "${pendingDelete?.name}"?`}
        description="This can't be undone. The product will also be removed from any related-products lists."
        confirmLabel="Delete"
        destructive
        isLoading={deleteProduct.isPending}
        onConfirm={() => void handleConfirmDelete()}
        onCancel={() => setPendingDelete(null)}
      />

      <ConfirmDialog
        open={pendingSocialIds !== null}
        title={
          pendingSocialIds && pendingSocialIds.length === 1
            ? 'Post this product to social?'
            : `Post ${pendingSocialIds?.length ?? 0} products to social?`
        }
        description="This generates AI captions from each product's details and publishes live to Facebook and Instagram."
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
