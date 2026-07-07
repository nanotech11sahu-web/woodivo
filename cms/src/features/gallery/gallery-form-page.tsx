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
import { useGalleryItem, useCreateGalleryItem, useUpdateGalleryItem } from './gallery-api';
import {
  galleryItemFormSchema,
  GALLERY_ITEM_FORM_DEFAULTS,
  parseTags,
  type GalleryItemFormValues,
} from './gallery-form-schema';
import type { MediaAsset } from '@/types/common';

export function GalleryFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const { data: galleryItem, isLoading: isLoadingGalleryItem } = useGalleryItem(id);
  const createGalleryItem = useCreateGalleryItem();
  const updateGalleryItem = useUpdateGalleryItem(id ?? '');

  const [media, setMedia] = useState<MediaAsset | undefined>();
  // Video items store a URL directly on `media.url` — there's no video
  // upload pipeline (ImageUploader only accepts image mime types), so a
  // plain URL field stands in for an embed/hosted-video link instead.
  const [videoUrl, setVideoUrl] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<GalleryItemFormValues>({
    resolver: zodResolver(galleryItemFormSchema),
    defaultValues: GALLERY_ITEM_FORM_DEFAULTS,
  });

  const type = watch('type');

  useEffect(() => {
    if (!galleryItem) return;
    reset({
      caption: galleryItem.caption ?? '',
      type: galleryItem.type,
      tags: galleryItem.tags.join(', '),
      displayOrder: galleryItem.displayOrder,
      status: galleryItem.status,
    });
    if (galleryItem.type === 'video') {
      setVideoUrl(galleryItem.media.url);
      setMedia(undefined);
    } else {
      setMedia(galleryItem.media);
    }
  }, [galleryItem, reset]);

  async function onSubmit(values: GalleryItemFormValues) {
    const resolvedMedia: MediaAsset | undefined =
      values.type === 'video' ? (videoUrl ? { url: videoUrl } : undefined) : media;

    if (!resolvedMedia?.url) {
      toast.error(
        values.type === 'video' ? 'Video URL required' : 'Image required',
        values.type === 'video'
          ? 'Add a video URL before saving.'
          : 'Upload an image before saving.',
      );
      return;
    }

    const payload = {
      media: resolvedMedia,
      caption: values.caption || undefined,
      type: values.type,
      tags: parseTags(values.tags ?? ''),
      displayOrder: values.displayOrder,
      status: values.status,
    };

    try {
      if (isEditMode) {
        await updateGalleryItem.mutateAsync(payload);
        toast.success('Gallery item updated');
      } else {
        await createGalleryItem.mutateAsync(payload);
        toast.success('Gallery item created');
      }
      navigate('/gallery');
    } catch (error) {
      toast.error(
        isEditMode ? "Couldn't update gallery item" : "Couldn't create gallery item",
        getErrorMessage(error),
      );
    }
  }

  if (isEditMode && isLoadingGalleryItem) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <Link
        to="/gallery"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-espresso"
      >
        <ArrowLeft size={15} />
        Back to gallery
      </Link>

      <PageHeader title={isEditMode ? 'Edit Gallery Item' : 'New Gallery Item'} />

      <form onSubmit={(event) => void handleSubmit(onSubmit)(event)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="type">Type</Label>
              <Select id="type" className="mt-1.5 max-w-40" {...register('type')}>
                <option value="image">Image</option>
                <option value="video">Video</option>
              </Select>
            </div>

            {type === 'video' ? (
              <div>
                <Label htmlFor="videoUrl">Video URL</Label>
                <Input
                  id="videoUrl"
                  className="mt-1.5"
                  placeholder="https://…"
                  value={videoUrl}
                  onChange={(event) => setVideoUrl(event.target.value)}
                />
              </div>
            ) : (
              <ImageUploader label="Image" value={media} onChange={setMedia} folder="gallery" />
            )}

            <div>
              <Label htmlFor="caption">Caption</Label>
              <Input id="caption" className="mt-1.5" {...register('caption')} />
              {errors.caption && <p className="mt-1 text-xs text-rust">{errors.caption.message}</p>}
            </div>

            <div>
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                className="mt-1.5"
                placeholder="e.g. workshop, wardrobe, teak"
                {...register('tags')}
              />
              <p className="mt-1 text-xs text-ink-muted">Comma-separated.</p>
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
          <Link to="/gallery" className={buttonVariants({ variant: 'secondary' })}>
            Cancel
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Spinner className="text-current" />}
            {isEditMode ? 'Save changes' : 'Create gallery item'}
          </Button>
        </div>
      </form>
    </div>
  );
}
