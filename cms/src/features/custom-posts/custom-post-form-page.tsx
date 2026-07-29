import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { MultiImageUploader } from '@/components/shared/multi-image-uploader';
import { VideoUploader } from '@/components/shared/video-uploader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';
import { toast } from '@/lib/toast';
import { getErrorMessage } from '@/lib/http-error';
import { useCustomPost, useCreateCustomPost, useUpdateCustomPost } from './custom-posts-api';
import {
  customPostFormSchema,
  CUSTOM_POST_FORM_DEFAULTS,
  parseKeywords,
  type CustomPostFormValues,
} from './custom-post-form-schema';
import type { MediaAsset } from '@/types/common';

export function CustomPostFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const { data: customPost, isLoading: isLoadingCustomPost } = useCustomPost(id);
  const createCustomPost = useCreateCustomPost();
  const updateCustomPost = useUpdateCustomPost(id ?? '');

  const [images, setImages] = useState<MediaAsset[]>([]);
  const [video, setVideo] = useState<MediaAsset | undefined>(undefined);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CustomPostFormValues>({
    resolver: zodResolver(customPostFormSchema),
    defaultValues: CUSTOM_POST_FORM_DEFAULTS,
  });

  const mediaMode = watch('mediaMode');

  useEffect(() => {
    if (!customPost) return;
    reset({
      title: customPost.title,
      mediaMode: customPost.video ? 'video' : 'images',
      caption: customPost.caption,
      keywords: customPost.keywords.join(', '),
      tone: customPost.tone ?? '',
      cta: customPost.cta ?? '',
      status: customPost.status,
    });
    setImages(customPost.images);
    setVideo(customPost.video);
  }, [customPost, reset]);

  async function onSubmit(values: CustomPostFormValues) {
    if (values.mediaMode === 'images' && images.length === 0) {
      toast.error('Images required', 'Upload at least one image before saving.');
      return;
    }
    if (values.mediaMode === 'video' && !video) {
      toast.error('Video required', 'Upload a video before saving.');
      return;
    }

    const payload = {
      title: values.title,
      images: values.mediaMode === 'images' ? images : [],
      video: values.mediaMode === 'video' ? video : undefined,
      caption: values.caption,
      keywords: parseKeywords(values.keywords ?? ''),
      tone: values.tone || undefined,
      cta: values.cta || undefined,
      status: values.status,
    };

    try {
      if (isEditMode) {
        await updateCustomPost.mutateAsync(payload);
        toast.success('Post updated');
      } else {
        await createCustomPost.mutateAsync(payload);
        toast.success('Post created');
      }
      navigate('/custom-posts');
    } catch (error) {
      toast.error(
        isEditMode ? "Couldn't update post" : "Couldn't create post",
        getErrorMessage(error),
      );
    }
  }

  if (isEditMode && isLoadingCustomPost) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <Link
        to="/custom-posts"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-espresso"
      >
        <ArrowLeft size={15} />
        Back to custom posts
      </Link>

      <PageHeader
        title={isEditMode ? 'Edit Custom Post' : 'New Custom Post'}
        description="Images and a social caption for a one-off Facebook/Instagram post — not shown anywhere on the website."
      />

      <form onSubmit={(event) => void handleSubmit(onSubmit)(event)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                className="mt-1.5"
                placeholder="Internal label — not posted"
                {...register('title')}
              />
              {errors.title && <p className="mt-1 text-xs text-rust">{errors.title.message}</p>}
            </div>

            <div>
              <Label htmlFor="mediaMode">Post type</Label>
              <Select
                id="mediaMode"
                className="mt-1.5 max-w-48"
                value={mediaMode}
                onChange={(event) =>
                  setValue('mediaMode', event.target.value as 'images' | 'video')
                }
              >
                <option value="images">Images</option>
                <option value="video">Video (Reel)</option>
              </Select>
            </div>

            {mediaMode === 'images' ? (
              <MultiImageUploader
                label="Images"
                value={images}
                onChange={setImages}
                folder="custom-posts"
                hint="All images are sent together as a Facebook/Instagram carousel, each watermarked with the Woodivo mark."
              />
            ) : (
              <VideoUploader
                label="Video"
                value={video}
                onChange={setVideo}
                folder="custom-posts"
                hint="Published as a Reel on Instagram and Facebook when you use 'Post as Reel' on the list page."
              />
            )}

            <div>
              <Label htmlFor="caption">Caption / brief</Label>
              <Textarea
                id="caption"
                rows={5}
                className="mt-1.5"
                placeholder="What this post is about — used to generate the Facebook/Instagram caption."
                {...register('caption')}
              />
              {errors.caption && (
                <p className="mt-1 text-xs text-rust">{errors.caption.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="keywords">Keywords</Label>
              <Input
                id="keywords"
                className="mt-1.5"
                placeholder="e.g. custom furniture, walnut, workshop"
                {...register('keywords')}
              />
              <p className="mt-1 text-xs text-ink-muted">Comma-separated.</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="tone">Tone</Label>
                <Input
                  id="tone"
                  className="mt-1.5"
                  placeholder="e.g. warm and inviting"
                  {...register('tone')}
                />
              </div>
              <div>
                <Label htmlFor="cta">Call to action</Label>
                <Input
                  id="cta"
                  className="mt-1.5"
                  placeholder="e.g. Message us to order"
                  {...register('cta')}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Select id="status" className="max-w-40" {...register('status')}>
              <option value="draft">Draft</option>
              <option value="posted">Posted</option>
            </Select>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Link to="/custom-posts" className={buttonVariants({ variant: 'secondary' })}>
            Cancel
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Spinner className="text-current" />}
            {isEditMode ? 'Save changes' : 'Create post'}
          </Button>
        </div>
      </form>
    </div>
  );
}
