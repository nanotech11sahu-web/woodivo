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
import { useProject, useCreateProject, useUpdateProject } from './projects-api';
import { useCategoryOptions } from '@/features/categories/categories-api';
import { projectFormSchema, PROJECT_FORM_DEFAULTS, type ProjectFormValues } from './project-form-schema';
import type { MediaAsset } from '@/types/common';

export function ProjectFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const { data: project, isLoading: isLoadingProject } = useProject(id);
  const { data: categoryOptions, isLoading: isLoadingCategories } = useCategoryOptions();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject(id ?? '');

  const [coverImage, setCoverImage] = useState<MediaAsset | undefined>();
  const [images, setImages] = useState<MediaAsset[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: PROJECT_FORM_DEFAULTS,
  });

  useEffect(() => {
    if (!project) return;
    reset({
      title: project.title,
      slug: project.slug,
      description: project.description ?? '',
      clientName: project.clientName ?? '',
      location: project.location ?? '',
      completionYear: project.completionYear ?? '',
      category: project.category?._id ?? '',
      displayOrder: project.displayOrder,
      status: project.status,
      isFeatured: project.isFeatured,
    });
    setCoverImage(project.coverImage);
    setImages(project.images ?? []);
  }, [project, reset]);

  async function onSubmit(values: ProjectFormValues) {
    const payload = {
      title: values.title,
      slug: values.slug || undefined,
      description: values.description || undefined,
      clientName: values.clientName || undefined,
      location: values.location || undefined,
      completionYear: values.completionYear || undefined,
      category: values.category || undefined,
      coverImage,
      images,
      displayOrder: values.displayOrder,
      status: values.status,
      isFeatured: values.isFeatured,
    };

    try {
      if (isEditMode) {
        await updateProject.mutateAsync(payload);
        toast.success('Project updated');
      } else {
        await createProject.mutateAsync(payload);
        toast.success('Project created');
      }
      navigate('/projects');
    } catch (error) {
      toast.error(isEditMode ? "Couldn't update project" : "Couldn't create project", getErrorMessage(error));
    }
  }

  if (isEditMode && isLoadingProject) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <Link
        to="/projects"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-espresso"
      >
        <ArrowLeft size={15} />
        Back to projects
      </Link>

      <PageHeader title={isEditMode ? 'Edit Project' : 'New Project'} />

      <form onSubmit={(event) => void handleSubmit(onSubmit)(event)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input id="title" className="mt-1.5" {...register('title')} />
                {errors.title && <p className="mt-1 text-xs text-rust">{errors.title.message}</p>}
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select id="category" className="mt-1.5" disabled={isLoadingCategories} {...register('category')}>
                  <option value="">No category</option>
                  {categoryOptions?.items.map((option) => (
                    <option key={option._id} value={option._id}>
                      {option.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" className="mt-1.5" placeholder="auto-generated from title" {...register('slug')} />
              {errors.slug && <p className="mt-1 text-xs text-rust">{errors.slug.message}</p>}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" className="mt-1.5" rows={4} {...register('description')} />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="clientName">Client name</Label>
                <Input id="clientName" className="mt-1.5" {...register('clientName')} />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input id="location" className="mt-1.5" {...register('location')} />
              </div>
              <div>
                <Label htmlFor="completionYear">Completion year</Label>
                <Input id="completionYear" className="mt-1.5" placeholder="2026" {...register('completionYear')} />
              </div>
            </div>

            <ImageUploader label="Cover image" value={coverImage} onChange={setCoverImage} folder="projects" />
            <MultiImageUploader label="Gallery images" value={images} onChange={setImages} folder="projects" />
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

        <SeoManageNote searchTerm={project?.slug} />

        <div className="flex justify-end gap-2">
          <Link to="/projects" className={buttonVariants({ variant: 'secondary' })}>
            Cancel
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Spinner className="text-current" />}
            {isEditMode ? 'Save changes' : 'Create project'}
          </Button>
        </div>
      </form>
    </div>
  );
}
