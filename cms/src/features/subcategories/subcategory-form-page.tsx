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
import { useCategoryOptions } from '@/features/categories/categories-api';
import { useSubCategory, useCreateSubCategory, useUpdateSubCategory } from './subcategories-api';
import type { MediaAsset } from '@/types/common';

const formSchema = z.object({
  category: z.string().min(1, 'Category is required'),
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
  category: '',
  name: '',
  slug: '',
  description: '',
  displayOrder: 0,
  status: 'active',
  isFeatured: false,
};

export function SubCategoryFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const { data: subCategory, isLoading: isLoadingSubCategory } = useSubCategory(id);
  const { data: categoryOptions, isLoading: isLoadingCategories } = useCategoryOptions();
  const createSubCategory = useCreateSubCategory();
  const updateSubCategory = useUpdateSubCategory(id ?? '');

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
    if (!subCategory) return;
    reset({
      category: subCategory.category?._id ?? '',
      name: subCategory.name,
      slug: subCategory.slug,
      description: subCategory.description ?? '',
      displayOrder: subCategory.displayOrder,
      status: subCategory.status,
      isFeatured: subCategory.isFeatured,
    });
    setThumbnail(subCategory.thumbnail);
    setBanner(subCategory.banner);
  }, [subCategory, reset]);

  async function onSubmit(values: FormValues) {
    const payload = {
      category: values.category,
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
        await updateSubCategory.mutateAsync(payload);
        toast.success('Subcategory updated');
      } else {
        await createSubCategory.mutateAsync(payload);
        toast.success('Subcategory created');
      }
      navigate('/subcategories');
    } catch (error) {
      toast.error(
        isEditMode ? "Couldn't update subcategory" : "Couldn't create subcategory",
        getErrorMessage(error),
      );
    }
  }

  if (isEditMode && isLoadingSubCategory) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <Link
        to="/subcategories"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-espresso"
      >
        <ArrowLeft size={15} />
        Back to subcategories
      </Link>

      <PageHeader title={isEditMode ? 'Edit Subcategory' : 'New Subcategory'} />

      <form onSubmit={(event) => void handleSubmit(onSubmit)(event)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                id="category"
                className="mt-1.5"
                disabled={isLoadingCategories}
                {...register('category')}
              >
                <option value="">Select a category</option>
                {categoryOptions?.items.map((option) => (
                  <option key={option._id} value={option._id}>
                    {option.name}
                  </option>
                ))}
              </Select>
              {errors.category && <p className="mt-1 text-xs text-rust">{errors.category.message}</p>}
            </div>

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
              <ImageUploader label="Thumbnail" value={thumbnail} onChange={setThumbnail} folder="subcategories" />
              <ImageUploader label="Banner" value={banner} onChange={setBanner} folder="subcategories" />
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

        <SeoManageNote searchTerm={subCategory?.slug} />

        <div className="flex justify-end gap-2">
          <Link to="/subcategories" className={buttonVariants({ variant: 'secondary' })}>
            Cancel
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Spinner className="text-current" />}
            {isEditMode ? 'Save changes' : 'Create subcategory'}
          </Button>
        </div>
      </form>
    </div>
  );
}
