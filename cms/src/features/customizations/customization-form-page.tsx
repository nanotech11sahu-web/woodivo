import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { MultiImageUploader } from '@/components/shared/multi-image-uploader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { toast } from '@/lib/toast';
import { getErrorMessage } from '@/lib/http-error';
import { useCategoryOptions } from '@/features/categories/categories-api';
import {
  useCustomization,
  useCreateCustomization,
  useUpdateCustomization,
} from './customizations-api';
import {
  customizationFormSchema,
  CUSTOMIZATION_FORM_DEFAULTS,
  parseTags,
  type CustomizationFormValues,
} from './customization-form-schema';
import type { MediaAsset } from '@/types/common';

export function CustomizationFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const { data: categoryOptions, isLoading: isLoadingCategories } = useCategoryOptions();
  const { data: customization, isLoading: isLoadingCustomization } = useCustomization(id);
  const createCustomization = useCreateCustomization();
  const updateCustomization = useUpdateCustomization(id ?? '');

  const [images, setImages] = useState<MediaAsset[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CustomizationFormValues>({
    resolver: zodResolver(customizationFormSchema),
    defaultValues: CUSTOMIZATION_FORM_DEFAULTS,
  });

  useEffect(() => {
    if (!customization) return;
    reset({
      title: customization.title,
      description: customization.description ?? '',
      category: customization.category?._id ?? '',
      tags: customization.tags.join(', '),
      displayOrder: customization.displayOrder,
      status: customization.status,
    });
    setImages(customization.images);
  }, [customization, reset]);

  async function onSubmit(values: CustomizationFormValues) {
    if (images.length === 0) {
      toast.error('Images required', 'Upload at least one photo before saving.');
      return;
    }

    const payload = {
      title: values.title,
      description: values.description || undefined,
      images,
      category: values.category || undefined,
      tags: parseTags(values.tags ?? ''),
      displayOrder: values.displayOrder,
      status: values.status,
    };

    try {
      if (isEditMode) {
        await updateCustomization.mutateAsync(payload);
        toast.success('Customization updated');
      } else {
        await createCustomization.mutateAsync(payload);
        toast.success('Customization created');
      }
      navigate('/customizations');
    } catch (error) {
      toast.error(
        isEditMode ? "Couldn't update customization" : "Couldn't create customization",
        getErrorMessage(error),
      );
    }
  }

  if (isEditMode && isLoadingCustomization) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <Link
        to="/customizations"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-espresso"
      >
        <ArrowLeft size={15} />
        Back to customizations
      </Link>

      <PageHeader title={isEditMode ? 'Edit Customization' : 'New Customization'} />

      <form onSubmit={(event) => void handleSubmit(onSubmit)(event)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <MultiImageUploader
              label="Photos"
              value={images}
              onChange={setImages}
              folder="customizations"
              max={8}
              hint="Up to 8 photos of the finished custom piece."
            />

            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" className="mt-1.5" {...register('title')} />
              {errors.title && <p className="mt-1 text-xs text-rust">{errors.title.message}</p>}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" className="mt-1.5" rows={4} {...register('description')} />
              {errors.description && (
                <p className="mt-1 text-xs text-rust">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  id="category"
                  className="mt-1.5"
                  disabled={isLoadingCategories}
                  {...register('category')}
                >
                  <option value="">No category</option>
                  {categoryOptions?.items.map((option) => (
                    <option key={option._id} value={option._id}>
                      {option.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  className="mt-1.5"
                  placeholder="e.g. teak, dining, made-to-size"
                  {...register('tags')}
                />
                <p className="mt-1 text-xs text-ink-muted">Comma-separated.</p>
              </div>
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
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Link to="/customizations" className={buttonVariants({ variant: 'secondary' })}>
            Cancel
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Spinner className="text-current" />}
            {isEditMode ? 'Save changes' : 'Create customization'}
          </Button>
        </div>
      </form>
    </div>
  );
}
