import { useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { toast } from '@/lib/toast';
import { getErrorMessage } from '@/lib/http-error';
import { useFaq, useCreateFaq, useUpdateFaq } from './faqs-api';
import { faqFormSchema, FAQ_FORM_DEFAULTS, type FaqFormValues } from './faq-form-schema';

export function FaqFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const { data: faq, isLoading: isLoadingFaq } = useFaq(id);
  const createFaq = useCreateFaq();
  const updateFaq = useUpdateFaq(id ?? '');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FaqFormValues>({
    resolver: zodResolver(faqFormSchema),
    defaultValues: FAQ_FORM_DEFAULTS,
  });

  useEffect(() => {
    if (!faq) return;
    reset({
      question: faq.question,
      answer: faq.answer,
      group: faq.group ?? '',
      displayOrder: faq.displayOrder,
      status: faq.status,
    });
  }, [faq, reset]);

  async function onSubmit(values: FaqFormValues) {
    const payload = {
      question: values.question,
      answer: values.answer,
      group: values.group || undefined,
      displayOrder: values.displayOrder,
      status: values.status,
    };

    try {
      if (isEditMode) {
        await updateFaq.mutateAsync(payload);
        toast.success('FAQ updated');
      } else {
        await createFaq.mutateAsync(payload);
        toast.success('FAQ created');
      }
      navigate('/faqs');
    } catch (error) {
      toast.error(isEditMode ? "Couldn't update FAQ" : "Couldn't create FAQ", getErrorMessage(error));
    }
  }

  if (isEditMode && isLoadingFaq) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <Link
        to="/faqs"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-espresso"
      >
        <ArrowLeft size={15} />
        Back to FAQs
      </Link>

      <PageHeader title={isEditMode ? 'Edit FAQ' : 'New FAQ'} />

      <form onSubmit={(event) => void handleSubmit(onSubmit)(event)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="question">Question</Label>
              <Input id="question" className="mt-1.5" {...register('question')} />
              {errors.question && <p className="mt-1 text-xs text-rust">{errors.question.message}</p>}
            </div>

            <div>
              <Label htmlFor="answer">Answer</Label>
              <Textarea id="answer" className="mt-1.5" rows={5} {...register('answer')} />
              {errors.answer && <p className="mt-1 text-xs text-rust">{errors.answer.message}</p>}
            </div>

            <div>
              <Label htmlFor="group">Group</Label>
              <Input
                id="group"
                className="mt-1.5"
                placeholder="e.g. Pricing, Shipping, Custom Orders"
                {...register('group')}
              />
              <p className="mt-1 text-xs text-ink-muted">
                Optional. Used to group related FAQs together on the public site.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Visibility</CardTitle>
          </CardHeader>
          <CardContent>
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
          <Link to="/faqs" className={buttonVariants({ variant: 'secondary' })}>
            Cancel
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Spinner className="text-current" />}
            {isEditMode ? 'Save changes' : 'Create FAQ'}
          </Button>
        </div>
      </form>
    </div>
  );
}
