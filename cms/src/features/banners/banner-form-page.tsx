import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { ImageUploader } from '@/components/shared/image-uploader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { toast } from '@/lib/toast';
import { getErrorMessage } from '@/lib/http-error';
import { useBanner, useCreateBanner, useUpdateBanner } from './banners-api';
import {
  bannerFormSchema,
  BANNER_FORM_DEFAULTS,
  BANNER_PLACEMENTS,
  PLACEMENT_LABELS,
  type BannerFormValues,
} from './banner-form-schema';
import type { MediaAsset } from '@/types/common';

export function BannerFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const { data: banner, isLoading: isLoadingBanner } = useBanner(id);
  const createBanner = useCreateBanner();
  const updateBanner = useUpdateBanner(id ?? '');

  const [desktopImage, setDesktopImage] = useState<MediaAsset | undefined>();
  const [mobileImage, setMobileImage] = useState<MediaAsset | undefined>();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BannerFormValues>({
    resolver: zodResolver(bannerFormSchema),
    defaultValues: BANNER_FORM_DEFAULTS,
  });

  useEffect(() => {
    if (!banner) return;
    reset({
      title: banner.title,
      subtitle: banner.subtitle ?? '',
      ctaLabel: banner.ctaLabel ?? '',
      ctaLink: banner.ctaLink ?? '',
      placement: banner.placement,
      displayOrder: banner.displayOrder,
      status: banner.status,
    });
    setDesktopImage(banner.desktopImage);
    setMobileImage(banner.mobileImage);
  }, [banner, reset]);

  async function onSubmit(values: BannerFormValues) {
    if (!desktopImage?.url) {
      toast.error('Desktop image required', 'Upload a desktop image before saving.');
      return;
    }

    const payload = {
      title: values.title,
      subtitle: values.subtitle || undefined,
      desktopImage,
      mobileImage,
      ctaLabel: values.ctaLabel || undefined,
      ctaLink: values.ctaLink || undefined,
      placement: values.placement,
      displayOrder: values.displayOrder,
      status: values.status,
    };

    try {
      if (isEditMode) {
        await updateBanner.mutateAsync(payload);
        toast.success('Banner updated');
      } else {
        await createBanner.mutateAsync(payload);
        toast.success('Banner created');
      }
      navigate('/banners');
    } catch (error) {
      toast.error(isEditMode ? "Couldn't update banner" : "Couldn't create banner", getErrorMessage(error));
    }
  }

  if (isEditMode && isLoadingBanner) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <Link
        to="/banners"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-espresso"
      >
        <ArrowLeft size={15} />
        Back to banners
      </Link>

      <PageHeader title={isEditMode ? 'Edit Banner' : 'New Banner'} />

      <form onSubmit={(event) => void handleSubmit(onSubmit)(event)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" className="mt-1.5" {...register('title')} />
              {errors.title && <p className="mt-1 text-xs text-rust">{errors.title.message}</p>}
            </div>

            <div>
              <Label htmlFor="subtitle">Subtitle</Label>
              <Input id="subtitle" className="mt-1.5" {...register('subtitle')} />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ImageUploader
                label="Desktop image"
                value={desktopImage}
                onChange={setDesktopImage}
                folder="banners"
              />
              <ImageUploader
                label="Mobile image"
                value={mobileImage}
                onChange={setMobileImage}
                folder="banners"
                hint="Optional — falls back to the desktop image if not set."
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="ctaLabel">CTA label</Label>
                <Input id="ctaLabel" className="mt-1.5" placeholder="e.g. Shop Now" {...register('ctaLabel')} />
              </div>
              <div>
                <Label htmlFor="ctaLink">CTA link</Label>
                <Input id="ctaLink" className="mt-1.5" placeholder="/products" {...register('ctaLink')} />
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
                <Label htmlFor="placement">Placement</Label>
                <Select id="placement" className="mt-1.5" {...register('placement')}>
                  {BANNER_PLACEMENTS.map((p) => (
                    <option key={p} value={p}>
                      {PLACEMENT_LABELS[p]}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select id="status" className="mt-1.5" {...register('status')}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="displayOrder">Display order</Label>
              <Input
                id="displayOrder"
                type="number"
                min={0}
                className="mt-1.5 max-w-40"
                {...register('displayOrder')}
              />
              <p className="mt-1 text-xs text-ink-muted">
                Order is scoped to this banner's placement (e.g. all "Hero" banners share one
                sequence).
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Link to="/banners" className={buttonVariants({ variant: 'secondary' })}>
            Cancel
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Spinner className="text-current" />}
            {isEditMode ? 'Save changes' : 'Create banner'}
          </Button>
        </div>
      </form>
    </div>
  );
}
