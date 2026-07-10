import { useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';
import { toast } from '@/lib/toast';
import { getErrorMessage } from '@/lib/http-error';
import { useSeoEntry, useCreateSeoEntry, useUpdateSeoEntry } from './seo-api';
import { seoFormSchema, SEO_FORM_DEFAULTS, type SeoFormValues } from './seo-form-schema';

const PAGE_TYPE_LABELS: Record<string, string> = {
  home: 'Home',
  about: 'About',
  contact: 'Contact',
  gallery: 'Gallery',
  'blogs-listing': 'Blogs listing',
  product: 'Product',
  blog: 'Blog',
  category: 'Category',
  custom: 'Custom',
};

function splitKeywords(value: string): string[] | undefined {
  const keywords = value
    .split(',')
    .map((keyword) => keyword.trim())
    .filter(Boolean);
  return keywords.length ? keywords : undefined;
}

export function SeoFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const { data: entry, isLoading: isLoadingEntry } = useSeoEntry(id);
  const createEntry = useCreateSeoEntry();
  const updateEntry = useUpdateSeoEntry(id ?? '');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SeoFormValues>({
    resolver: zodResolver(seoFormSchema),
    defaultValues: SEO_FORM_DEFAULTS,
  });

  useEffect(() => {
    if (!entry) return;
    reset({
      path: entry.path,
      metaTitle: entry.metaTitle ?? '',
      metaDescription: entry.metaDescription ?? '',
      metaKeywords: entry.metaKeywords?.join(', ') ?? '',
      ogImage: entry.ogImage ?? '',
      canonicalUrl: entry.canonicalUrl ?? '',
    });
  }, [entry, reset]);

  async function onSubmit(values: SeoFormValues) {
    const meta = {
      metaTitle: values.metaTitle || undefined,
      metaDescription: values.metaDescription || undefined,
      metaKeywords: values.metaKeywords ? splitKeywords(values.metaKeywords) : undefined,
      ogImage: values.ogImage || undefined,
      canonicalUrl: values.canonicalUrl || undefined,
    };

    try {
      if (isEditMode) {
        await updateEntry.mutateAsync(meta);
        toast.success('SEO entry updated');
      } else {
        await createEntry.mutateAsync({ path: values.path, ...meta });
        toast.success('SEO entry created');
      }
      navigate('/seo');
    } catch (error) {
      toast.error(
        isEditMode ? "Couldn\u2019t update SEO entry" : "Couldn\u2019t create SEO entry",
        getErrorMessage(error),
      );
    }
  }

  if (isEditMode && isLoadingEntry) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  const isDerived = isEditMode && entry && entry.pageType !== 'custom';

  return (
    <div>
      <Link to="/seo" className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-espresso">
        <ArrowLeft size={15} />
        Back to SEO
      </Link>

      <PageHeader
        title={isEditMode ? 'Edit SEO entry' : 'Add custom page'}
        description={
          isEditMode
            ? 'Meta title, description, keywords, OG image and canonical URL for this page.'
            : 'For a page with no product, blog or category behind it — a bespoke landing page, for example.'
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Page</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isDerived ? (
              <div className="flex items-center gap-3">
                <div>
                  <p className="font-medium text-espresso">{entry?.entityLabel || entry?.path}</p>
                  <p className="font-mono text-xs text-ink-muted">{entry?.path}</p>
                </div>
                <Badge variant="neutral">{PAGE_TYPE_LABELS[entry?.pageType ?? 'custom']}</Badge>
              </div>
            ) : (
              <div>
                <Label htmlFor="path">Path</Label>
                <Input
                  id="path"
                  className="mt-1.5 font-mono"
                  placeholder="/example-landing-page"
                  disabled={isEditMode}
                  {...register('path')}
                />
                {errors.path && <p className="mt-1 text-xs text-rust">{errors.path.message}</p>}
              </div>
            )}
            {isDerived && (
              <p className="text-xs text-ink-muted">
                Path and page name are derived from this content and stay in sync automatically if it's
                renamed — only the fields below are editable here.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Meta tags</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="metaTitle">Meta title</Label>
              <Input id="metaTitle" className="mt-1.5" {...register('metaTitle')} />
              {errors.metaTitle && <p className="mt-1 text-xs text-rust">{errors.metaTitle.message}</p>}
            </div>
            <div>
              <Label htmlFor="metaDescription">Meta description</Label>
              <Textarea id="metaDescription" className="mt-1.5" rows={2} {...register('metaDescription')} />
              {errors.metaDescription && (
                <p className="mt-1 text-xs text-rust">{errors.metaDescription.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="metaKeywords">Meta keywords</Label>
              <Input
                id="metaKeywords"
                className="mt-1.5"
                placeholder="comma, separated, keywords"
                {...register('metaKeywords')}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="ogImage">OG image URL</Label>
                <Input id="ogImage" className="mt-1.5" {...register('ogImage')} />
              </div>
              <div>
                <Label htmlFor="canonicalUrl">Canonical URL</Label>
                <Input id="canonicalUrl" className="mt-1.5" {...register('canonicalUrl')} />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Link to="/seo" className={buttonVariants({ variant: 'secondary' })}>
            Cancel
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Spinner className="text-current" />}
            {isEditMode ? 'Save changes' : 'Create entry'}
          </Button>
        </div>
      </form>
    </div>
  );
}
