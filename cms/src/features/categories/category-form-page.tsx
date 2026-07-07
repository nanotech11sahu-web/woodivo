import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { ImageUploader } from '@/components/shared/image-uploader';
import { SeoManageNote } from '@/components/shared/seo-manage-note';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Spinner } from '@/components/ui/spinner';
import { toast } from '@/lib/toast';
import { getErrorMessage } from '@/lib/http-error';
import { useCategory, useCreateCategory, useUpdateCategory } from './categories-api';
import type { MediaAsset } from '@/types/common';

const formSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers and hyphens only')
    .optional()
    .or(z.literal('')),
  description: z.string().optional(),
  displayOrder: z.coerce.number().int().min(0).optional(),
  status: z.enum(['active', 'inactive']),
  isFeatured: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

const DEFAULT_VALUES: FormValues = {
  name: '',
  slug: '',
  description: '',
  displayOrder: 0,
  status: 'active',
  isFeatured: false,
};

export function CategoryFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const { data: category, isLoading: isLoadingCategory } = useCategory(id);
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory(id ?? '');

  const [thumbnail, setThumbnail] = useState<MediaAsset | undefined>();
  const [banner, setBanner] = useState<MediaAsset | undefined>();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (!category) return;
    reset({
      name: category.name,
      slug: category.slug,
      description: category.description ?? '',
      displayOrder: category.displayOrder,
      status: category.status,
      isFeatured: category.isFeatured,
    });
    setThumbnail(category.thumbnail);
    setBanner(category.banner);
  }, [category, reset]);

  async function onSubmit(values: FormValues) {
    const payload = {
      name: values.name,
      slug: values.slug || undefined,
      description: values.description || undefined,
      thumbnail,
      banner,
      displayOrder: values.displayOrder,
      status: values.status,
      isFeatured: values.isFeatured,
    };

    try {
      if (isEditMode) {
        await updateCategory.mutateAsync(payload);
        toast.success('Category updated');
      } else {
        await createCategory.mutateAsync(payload);
        toast.success('Category created');
      }
      navigate('/categories');
    } catch (error) {
      toast.error(isEditMode ? "Couldn't update category" : "Couldn't create category", getErrorMessage(error));
    }
  }

  if (isEditMode && isLoadingCategory) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <Link
        to="/categories"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-espresso"
      >
        <ArrowLeft size={15} />
        Back to categories
      </Link>

      <PageHeader title={isEditMode ? 'Edit Category' : 'New Category'} />

      <form onSubmit={(event) => void handleSubmit(onSubmit)(event)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" className="mt-1.5" {...register('name')} />
              {errors.name && <p className="mt-1 text-xs text-rust">{errors.name.message}</p>}
            </div>

            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" className="mt-1.5" placeholder="auto-generated from name" {...register('slug')} />
              {errors.slug && <p className="mt-1 text-xs text-rust">{errors.slug.message}</p>}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" className="mt-1.5" rows={4} {...register('description')} />
            </div>

            <div className="flex flex-wrap gap-6">
              <ImageUploader label="Thumbnail" value={thumbnail} onChange={setThumbnail} folder="categories" />
              <ImageUploader label="Banner" value={banner} onChange={setBanner} folder="categories" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Visibility</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select id="status" className="mt-1.5" {...register('status')}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="displayOrder">Display order</Label>
                <Input
                  id="displayOrder"
                  type="number"
                  min={0}
                  className="mt-1.5"
                  {...register('displayOrder')}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Controller
                control={control}
                name="isFeatured"
                render={({ field }) => (
                  <Switch id="isFeatured" checked={field.value} onCheckedChange={field.onChange} />
                )}
              />
              <Label htmlFor="isFeatured">Feature on homepage</Label>
            </div>
          </CardContent>
        </Card>

        <SeoManageNote searchTerm={category?.slug} />

        <div className="flex justify-end gap-2">
          <Link to="/categories" className={buttonVariants({ variant: 'secondary' })}>
            Cancel
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Spinner className="text-current" />}
            {isEditMode ? 'Save changes' : 'Create category'}
          </Button>
        </div>
      </form>
    </div>
  );
}
