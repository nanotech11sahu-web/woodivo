import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { ImageUploader } from '@/components/shared/image-uploader';
import { MultiImageUploader } from '@/components/shared/multi-image-uploader';
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
import { useBlog, useCreateBlog, useUpdateBlog } from './blogs-api';
import { useBlogCategories } from './blog-categories-api';
import { TagsEditor } from './tags-editor';
import { MarkdownContentEditor } from './markdown-content-editor';
import { BlogFaqEditor } from './blog-faq-editor';
import { blogFormSchema, BLOG_FORM_DEFAULTS, type BlogFormValues } from './blog-form-schema';
import type { MediaAsset } from '@/types/common';
import type { BlogFaqItem } from '@/types/blog';
import { Copy, /* ...existing icons... */ } from 'lucide-react';

/** Copies a ready-to-paste `![alt](url)` markdown snippet for an uploaded
 * image, so the writer (or the Blog Factory pipeline) can drop it straight
 * into the content field at the point in the post where it belongs. */
function copyImageMarkdown(asset: MediaAsset) {
  const snippet = `![${asset.alt || 'describe this image'}](${asset.url})`;
  void navigator.clipboard.writeText(snippet).then(
    () => toast.success('Markdown copied', snippet),
    () => toast.error("Couldn't copy to clipboard"),
  );
}

/** `<input type="datetime-local">` has no timezone; treat its value as local time and expand to a full ISO string for the backend's `@IsDateString()`. */
function toIsoString(datetimeLocal: string): string | undefined {
  if (!datetimeLocal) return undefined;
  const date = new Date(datetimeLocal);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

/** Inverse of `toIsoString`, for populating the datetime-local input from a stored ISO string. */
function toDatetimeLocal(iso: string | undefined): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function BlogFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const { data: blog, isLoading: isLoadingBlog } = useBlog(id);
  const { data: categories, isLoading: isLoadingCategories } = useBlogCategories();
  const createBlog = useCreateBlog();
  const updateBlog = useUpdateBlog(id ?? '');

  const [featuredImage, setFeaturedImage] = useState<MediaAsset | undefined>();
  const [images, setImages] = useState<MediaAsset[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [faqs, setFaqs] = useState<BlogFaqItem[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BlogFormValues>({
    resolver: zodResolver(blogFormSchema),
    defaultValues: BLOG_FORM_DEFAULTS,
  });

  const status = watch('status');

  useEffect(() => {
    if (!blog) return;
    reset({
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt ?? '',
      content: blog.content,
      authorName: blog.authorName ?? '',
      category: blog.category?._id ?? '',
      status: blog.status,
      publishAt: toDatetimeLocal(blog.publishAt),
      isFeatured: blog.isFeatured,
    });
    setFeaturedImage(blog.featuredImage);
    setImages(blog.images ?? []);
    setTags(blog.tags ?? []);
    setFaqs(blog.faqs ?? []);
  }, [blog, reset]);

  async function onSubmit(values: BlogFormValues) {
    const payload = {
      title: values.title,
      slug: values.slug || undefined,
      excerpt: values.excerpt || undefined,
      content: values.content,
      authorName: values.authorName || undefined,
      featuredImage,
      images,
      category: values.category || undefined,
      tags,
      faqs,
      status: values.status,
      publishAt: toIsoString(values.publishAt ?? ''),
      isFeatured: values.isFeatured,
    };

    try {
      if (isEditMode) {
        await updateBlog.mutateAsync(payload);
        toast.success('Blog post updated');
      } else {
        await createBlog.mutateAsync(payload);
        toast.success('Blog post created');
      }
      navigate('/blogs');
    } catch (error) {
      toast.error(isEditMode ? "Couldn't update blog post" : "Couldn't create blog post", getErrorMessage(error));
    }
  }

  if (isEditMode && isLoadingBlog) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <Link
        to="/blogs"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-espresso"
      >
        <ArrowLeft size={15} />
        Back to blogs
      </Link>

      <PageHeader title={isEditMode ? 'Edit Blog Post' : 'New Blog Post'} />

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
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" className="mt-1.5" placeholder="auto-generated from title" {...register('slug')} />
              {errors.slug && <p className="mt-1 text-xs text-rust">{errors.slug.message}</p>}
            </div>

            <div>
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea id="excerpt" className="mt-1.5" rows={2} {...register('excerpt')} />
              {errors.excerpt && <p className="mt-1 text-xs text-rust">{errors.excerpt.message}</p>}
            </div>

            <div>
              <Label htmlFor="content">Content</Label>
              <div className="mt-1.5">
                <Controller
                  control={control}
                  name="content"
                  render={({ field }) => (
                    <MarkdownContentEditor
                      id="content"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                    />
                  )}
                />
              </div>
              {errors.content && <p className="mt-1 text-xs text-rust">{errors.content.message}</p>}
            </div>

            <div>
              <MultiImageUploader
                label="Images"
                value={images}
                onChange={setImages}
                folder="blogs"
                hint="Upload photos here, then use Copy Markdown to place any of them in the content above."
              />
              {images.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {images.map((asset) => (
                    <button
                      key={asset.publicId ?? asset.url}
                      type="button"
                      onClick={() => copyImageMarkdown(asset)}
                      className="inline-flex items-center gap-1.5 rounded-full bg-sand-dark px-2.5 py-1 text-xs text-espresso hover:bg-border-warm"
                    >
                      <Copy size={11} />
                      Copy Markdown
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ImageUploader
                label="Featured image"
                value={featuredImage}
                onChange={setFeaturedImage}
                folder="blogs"
              />
              <div>
                <Label htmlFor="authorName">Author name</Label>
                <Input id="authorName" className="mt-1.5" {...register('authorName')} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>FAQs</CardTitle>
          </CardHeader>
          <CardContent>
            <BlogFaqEditor value={faqs} onChange={setFaqs} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Taxonomy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select id="category" className="mt-1.5" disabled={isLoadingCategories} {...register('category')}>
                <option value="">No category</option>
                {categories?.map((option) => (
                  <option key={option._id} value={option._id}>
                    {option.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Tags</Label>
              <div className="mt-1.5">
                <TagsEditor value={tags} onChange={setTags} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Publishing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select id="status" className="mt-1.5" {...register('status')}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="archived">Archived</option>
                </Select>
              </div>
              {status === 'scheduled' && (
                <div>
                  <Label htmlFor="publishAt">Publish date</Label>
                  <Input id="publishAt" type="datetime-local" className="mt-1.5" {...register('publishAt')} />
                  {errors.publishAt && (
                    <p className="mt-1 text-xs text-rust">{errors.publishAt.message}</p>
                  )}
                </div>
              )}
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

        <SeoManageNote searchTerm={blog?.slug} />

        <div className="flex justify-end gap-2">
          <Link to="/blogs" className={buttonVariants({ variant: 'secondary' })}>
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
