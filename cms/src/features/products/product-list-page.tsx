import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Star } from 'lucide-react';
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
import { useProducts, useDeleteProduct } from './products-api';
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

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    try {
      await deleteProduct.mutateAsync(pendingDelete._id);
      toast.success('Product deleted');
      setPendingDelete(null);
    } catch (error) {
      toast.error('Couldn\u2019t delete product', getErrorMessage(error));
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
          <p>{row.category?.name ?? '\u2014'}</p>
          {row.subCategory && <p className="text-xs">{row.subCategory.name}</p>}
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
      headerClassName: 'w-24',
      className: 'text-right',
      render: (row) => (
        <div className="flex justify-end gap-1.5">
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

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        getRowKey={(row) => row._id}
        isLoading={isLoading}
        isError={isError}
        emptyTitle="No products yet"
        emptyDescription="Add your first product once at least one category exists."
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
    </div>
  );
}
