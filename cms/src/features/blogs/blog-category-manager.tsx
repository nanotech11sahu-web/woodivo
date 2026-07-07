import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, ArrowUp, ArrowDown, Pencil, Trash2, Plus } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable, type DataTableColumn } from '@/components/shared/data-table';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { toast } from '@/lib/toast';
import { getErrorMessage } from '@/lib/http-error';
import {
  useBlogCategories,
  useCreateBlogCategory,
  useUpdateBlogCategory,
  useDeleteBlogCategory,
  useReorderBlogCategories,
} from './blog-categories-api';
import type { BlogCategory } from '@/types/blog';

const formSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers and hyphens only')
    .optional()
    .or(z.literal('')),
});

type FormValues = z.infer<typeof formSchema>;

export function BlogCategoryManager() {
  const { data: categories, isLoading, isError } = useBlogCategories();
  const reorderCategories = useReorderBlogCategories();
  const deleteCategory = useDeleteBlogCategory();

  const [editing, setEditing] = useState<BlogCategory | 'new' | null>(null);
  const [pendingDelete, setPendingDelete] = useState<BlogCategory | null>(null);

  const items = categories ?? [];

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    try {
      await deleteCategory.mutateAsync(pendingDelete._id);
      toast.success('Category deleted');
      setPendingDelete(null);
    } catch (error) {
      toast.error('Couldn\u2019t delete category', getErrorMessage(error));
    }
  }

  function moveCategory(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const current = items[index];
    const target = items[targetIndex];

    reorderCategories.mutate(
      [
        { id: current._id, displayOrder: target.displayOrder },
        { id: target._id, displayOrder: current.displayOrder },
      ],
      { onError: (error) => toast.error('Couldn\u2019t reorder categories', getErrorMessage(error)) },
    );
  }

  const columns: DataTableColumn<BlogCategory>[] = [
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
      key: 'order',
      header: 'Order',
      render: (row) => {
        const index = items.findIndex((item) => item._id === row._id);
        return (
          <div className="flex items-center gap-1">
            <span className="w-6 font-mono text-xs text-ink-muted">{row.displayOrder}</span>
            <button
              type="button"
              onClick={() => moveCategory(index, -1)}
              disabled={index === 0 || reorderCategories.isPending}
              className="rounded p-1 text-ink-muted hover:bg-sand-dark hover:text-espresso disabled:opacity-30"
              aria-label="Move up"
            >
              <ArrowUp size={14} />
            </button>
            <button
              type="button"
              onClick={() => moveCategory(index, 1)}
              disabled={index === items.length - 1 || reorderCategories.isPending}
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
          <button
            type="button"
            onClick={() => setEditing(row)}
            className="rounded p-1.5 text-ink-muted hover:bg-sand-dark hover:text-espresso"
            aria-label={`Edit ${row.name}`}
          >
            <Pencil size={15} />
          </button>
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
      <Link
        to="/blogs"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-espresso"
      >
        <ArrowLeft size={15} />
        Back to blogs
      </Link>

      <PageHeader
        title="Blog Categories"
        description="Lightweight categories used to group blog posts."
        action={
          <Button type="button" onClick={() => setEditing('new')}>
            <Plus size={16} />
            New Category
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={items}
        getRowKey={(row) => row._id}
        isLoading={isLoading}
        isError={isError}
        emptyTitle="No blog categories yet"
        emptyDescription="Create a category to start grouping blog posts."
      />

      <BlogCategoryFormDialog
        open={editing !== null}
        category={editing === 'new' ? null : editing}
        onClose={() => setEditing(null)}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        title={`Delete "${pendingDelete?.name}"?`}
        description="This can't be undone. Categories that still have posts attached can't be deleted."
        confirmLabel="Delete"
        destructive
        isLoading={deleteCategory.isPending}
        onConfirm={() => void handleConfirmDelete()}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}

interface BlogCategoryFormDialogProps {
  open: boolean;
  category: BlogCategory | null;
  onClose: () => void;
}

function BlogCategoryFormDialog({ open, category, onClose }: BlogCategoryFormDialogProps) {
  const isEditMode = Boolean(category);
  const createCategory = useCreateBlogCategory();
  const updateCategory = useUpdateBlogCategory(category?._id ?? '');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', slug: '' },
  });

  useEffect(() => {
    if (!open) return;
    reset({ name: category?.name ?? '', slug: category?.slug ?? '' });
  }, [open, category, reset]);

  async function onSubmit(values: FormValues) {
    const payload = { name: values.name, slug: values.slug || undefined };
    try {
      if (isEditMode && category) {
        await updateCategory.mutateAsync(payload);
        toast.success('Category updated');
      } else {
        await createCategory.mutateAsync(payload);
        toast.success('Category created');
      }
      onClose();
    } catch (error) {
      toast.error(isEditMode ? "Couldn't update category" : "Couldn't create category", getErrorMessage(error));
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEditMode ? 'Edit Category' : 'New Category'}
    >
      <form onSubmit={(event) => void handleSubmit(onSubmit)(event)} className="mt-4 space-y-4">
        <div>
          <Label htmlFor="blogCategoryName">Name</Label>
          <Input id="blogCategoryName" className="mt-1.5" {...register('name')} />
          {errors.name && <p className="mt-1 text-xs text-rust">{errors.name.message}</p>}
        </div>
        <div>
          <Label htmlFor="blogCategorySlug">Slug</Label>
          <Input
            id="blogCategorySlug"
            className="mt-1.5"
            placeholder="auto-generated from name"
            {...register('slug')}
          />
          {errors.slug && <p className="mt-1 text-xs text-rust">{errors.slug.message}</p>}
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Spinner className="text-current" />}
            {isEditMode ? 'Save changes' : 'Create category'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
