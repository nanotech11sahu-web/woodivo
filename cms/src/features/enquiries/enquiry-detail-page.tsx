import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Phone, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';
import { toast } from '@/lib/toast';
import { getErrorMessage } from '@/lib/http-error';
import { useEnquiry, useUpdateEnquiry, useDeleteEnquiry } from './enquiries-api';
import { ENQUIRY_STATUSES, SOURCE_LABELS } from './enquiry-constants';
import { enquiryUpdateFormSchema, type EnquiryUpdateFormValues } from './enquiry-form-schema';

export function EnquiryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: enquiry, isLoading } = useEnquiry(id);
  const updateEnquiry = useUpdateEnquiry(id ?? '');
  const deleteEnquiry = useDeleteEnquiry();
  const [pendingDelete, setPendingDelete] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<EnquiryUpdateFormValues>({
    resolver: zodResolver(enquiryUpdateFormSchema),
    defaultValues: { status: 'new', notes: '' },
  });

  useEffect(() => {
    if (!enquiry) return;
    reset({ status: enquiry.status, notes: enquiry.notes ?? '' });
  }, [enquiry, reset]);

  async function onSubmit(values: EnquiryUpdateFormValues) {
    try {
      await updateEnquiry.mutateAsync({
        status: values.status,
        notes: values.notes || undefined,
      });
      toast.success('Enquiry updated');
    } catch (error) {
      toast.error("Couldn't update enquiry", getErrorMessage(error));
    }
  }

  async function handleConfirmDelete() {
    if (!id) return;
    try {
      await deleteEnquiry.mutateAsync(id);
      toast.success('Enquiry deleted');
      navigate('/enquiries');
    } catch (error) {
      toast.error('Couldn\u2019t delete enquiry', getErrorMessage(error));
    }
  }

  if (isLoading || !enquiry) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <Link
        to="/enquiries"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-espresso"
      >
        <ArrowLeft size={15} />
        Back to enquiries
      </Link>

      <PageHeader
        title={enquiry.fullName}
        description={`Submitted ${new Date(enquiry.createdAt).toLocaleString('en-IN')}`}
        action={
          <button
            type="button"
            onClick={() => setPendingDelete(true)}
            className="rounded p-2 text-ink-muted hover:bg-rust-light hover:text-rust"
            aria-label="Delete enquiry"
          >
            <Trash2 size={16} />
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Lead details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DetailRow label="Full name" value={enquiry.fullName} />
            <DetailRow
              label="Mobile"
              value={
                <a
                  href={`tel:${enquiry.mobileNumber}`}
                  className="inline-flex items-center gap-1.5 text-walnut hover:underline"
                >
                  <Phone size={13} />
                  {enquiry.mobileNumber}
                </a>
              }
            />
            <DetailRow label="State" value={enquiry.state || '\u2014'} />
            <DetailRow label="City" value={enquiry.city || '\u2014'} />
            <DetailRow label="Interested in" value={enquiry.interestedCategory?.name ?? '\u2014'} />
            {enquiry.interestedProduct ? (
              <DetailRow label="Product to customize" value={enquiry.interestedProduct.name} />
            ) : null}
            <DetailRow label="Source" value={SOURCE_LABELS[enquiry.source]} />
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-ink-muted">
                Message
              </p>
              <p className="whitespace-pre-wrap rounded-md border border-border-warm bg-sand/40 p-3 text-sm text-espresso">
                {enquiry.message || 'No message was left with this enquiry.'}
              </p>
            </div>
            {enquiry.referenceImages && enquiry.referenceImages.length > 0 ? (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-muted">
                  Reference photos ({enquiry.referenceImages.length})
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {enquiry.referenceImages.map((image, index) => (
                    <a
                      key={image.publicId ?? index}
                      href={image.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block overflow-hidden rounded-md border border-border-warm"
                    >
                      <img
                        src={image.url}
                        alt={image.alt || `Reference photo ${index + 1}`}
                        className="aspect-square w-full object-cover transition-transform hover:scale-105"
                      />
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status & notes</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={(event) => void handleSubmit(onSubmit)(event)} className="space-y-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select id="status" className="mt-1.5 max-w-48" {...register('status')}>
                  {ENQUIRY_STATUSES.map((s) => (
                    <option key={s} value={s} className="capitalize">
                      {s}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="notes">Internal notes</Label>
                <Textarea
                  id="notes"
                  className="mt-1.5"
                  rows={6}
                  placeholder="e.g. Called, wants a quote for a wardrobe, follow up next week."
                  {...register('notes')}
                />
                <p className="mt-1 text-xs text-ink-muted">Visible to admins only, never shown on the site.</p>
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Spinner className="text-current" />}
                  Save changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={pendingDelete}
        title={`Delete enquiry from "${enquiry.fullName}"?`}
        description="This can't be undone."
        confirmLabel="Delete"
        destructive
        isLoading={deleteEnquiry.isPending}
        onConfirm={() => void handleConfirmDelete()}
        onCancel={() => setPendingDelete(false)}
      />
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-ink-muted">{label}</span>
      <span className="font-medium text-espresso">{value}</span>
    </div>
  );
}
