import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { ImageUploader } from '@/components/shared/image-uploader';
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
import { useTestimonial, useCreateTestimonial, useUpdateTestimonial } from './testimonials-api';
import {
  testimonialFormSchema,
  TESTIMONIAL_FORM_DEFAULTS,
  type TestimonialFormValues,
} from './testimonial-form-schema';
import type { MediaAsset } from '@/types/common';

export function TestimonialFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const { data: testimonial, isLoading: isLoadingTestimonial } = useTestimonial(id);
  const createTestimonial = useCreateTestimonial();
  const updateTestimonial = useUpdateTestimonial(id ?? '');

  const [clientPhoto, setClientPhoto] = useState<MediaAsset | undefined>();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<TestimonialFormValues>({
    resolver: zodResolver(testimonialFormSchema),
    defaultValues: TESTIMONIAL_FORM_DEFAULTS,
  });

  useEffect(() => {
    if (!testimonial) return;
    reset({
      clientName: testimonial.clientName,
      clientLocation: testimonial.clientLocation ?? '',
      projectType: testimonial.projectType ?? '',
      testimonialText: testimonial.testimonialText,
      rating: testimonial.rating ? (String(testimonial.rating) as '1' | '2' | '3' | '4' | '5') : '',
      displayOrder: testimonial.displayOrder,
      status: testimonial.status,
      isFeatured: testimonial.isFeatured,
    });
    setClientPhoto(testimonial.clientPhoto);
  }, [testimonial, reset]);

  async function onSubmit(values: TestimonialFormValues) {
    const payload = {
      clientName: values.clientName,
      clientLocation: values.clientLocation || undefined,
      projectType: values.projectType || undefined,
      clientPhoto,
      testimonialText: values.testimonialText,
      rating: values.rating ? Number(values.rating) : undefined,
      displayOrder: values.displayOrder,
      status: values.status,
      isFeatured: values.isFeatured,
    };

    try {
      if (isEditMode) {
        await updateTestimonial.mutateAsync(payload);
        toast.success('Testimonial updated');
      } else {
        await createTestimonial.mutateAsync(payload);
        toast.success('Testimonial created');
      }
      navigate('/testimonials');
    } catch (error) {
      toast.error(
        isEditMode ? "Couldn't update testimonial" : "Couldn't create testimonial",
        getErrorMessage(error),
      );
    }
  }

  if (isEditMode && isLoadingTestimonial) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <Link
        to="/testimonials"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-espresso"
      >
        <ArrowLeft size={15} />
        Back to testimonials
      </Link>

      <PageHeader title={isEditMode ? 'Edit Testimonial' : 'New Testimonial'} />

      <form onSubmit={(event) => void handleSubmit(onSubmit)(event)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="clientName">Client name</Label>
                <Input id="clientName" className="mt-1.5" {...register('clientName')} />
                {errors.clientName && <p className="mt-1 text-xs text-rust">{errors.clientName.message}</p>}
              </div>
              <div>
                <Label htmlFor="clientLocation">Client location</Label>
                <Input id="clientLocation" className="mt-1.5" {...register('clientLocation')} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="projectType">Project type</Label>
                <Input
                  id="projectType"
                  className="mt-1.5"
                  placeholder="e.g. Wooden Temple, Wardrobe"
                  {...register('projectType')}
                />
              </div>
              <div>
                <Label htmlFor="rating">Rating</Label>
                <Select id="rating" className="mt-1.5" {...register('rating')}>
                  <option value="">No rating</option>
                  <option value="1">1 star</option>
                  <option value="2">2 stars</option>
                  <option value="3">3 stars</option>
                  <option value="4">4 stars</option>
                  <option value="5">5 stars</option>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="testimonialText">Testimonial</Label>
              <Textarea id="testimonialText" className="mt-1.5" rows={5} {...register('testimonialText')} />
              {errors.testimonialText && (
                <p className="mt-1 text-xs text-rust">{errors.testimonialText.message}</p>
              )}
            </div>

            <ImageUploader label="Client photo" value={clientPhoto} onChange={setClientPhoto} folder="testimonials" />
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

        <div className="flex justify-end gap-2">
          <Link to="/testimonials" className={buttonVariants({ variant: 'secondary' })}>
            Cancel
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Spinner className="text-current" />}
            {isEditMode ? 'Save changes' : 'Create testimonial'}
          </Button>
        </div>
      </form>
    </div>
  );
}
