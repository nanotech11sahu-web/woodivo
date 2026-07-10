import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, ImagePlus, Loader2, MessageCircle, Phone, X } from 'lucide-react';
import { useCreateEnquiry, useUploadEnquiryImages } from './enquiry-api';
import {
  customizeProductFormSchema,
  MAX_CUSTOM_ORDER_IMAGES,
  type CustomizeProductFormValues,
} from './customize-product-form-schema';
import { useSettings } from '@/features/settings/settings-api';
import { toWhatsAppDigits, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { JaliDivider } from '@/components/shared/jali-divider';

const inputClass = cn(
  'w-full rounded-[var(--radius-card)] border border-border-warm bg-ivory px-4 py-2.5 text-sm text-charcoal',
  'placeholder:text-charcoal-soft/60 focus:border-brass',
);

interface CustomizeProductSectionProps {
  productSlug: string;
  productName: string;
}

interface PickedImage {
  file: File;
  previewUrl: string;
}

/**
 * "Customize this product" — lets a shopper attach up to 4 reference photos
 * of what they want changed (a different wood tone, a size tweak, an inlay
 * pattern) plus a short description, tied to this specific product. Sits
 * alongside a direct call/WhatsApp panel for people who'd rather just talk
 * it through. Submits as an Enquiry with source: 'custom_order' and
 * interestedProduct: this product's slug, so it lands in the same CMS
 * inbox as every other lead, filterable by that source.
 */
export function CustomizeProductSection({ productSlug, productName }: CustomizeProductSectionProps) {
  const { data: settings } = useSettings();
  const phone = settings?.contact?.phone;
  const whatsapp = settings?.contact?.whatsapp;

  const [images, setImages] = useState<PickedImage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadImages = useUploadEnquiryImages();
  const createEnquiry = useCreateEnquiry();
  const isSubmitting = uploadImages.isPending || createEnquiry.isPending;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomizeProductFormValues>({
    resolver: zodResolver(customizeProductFormSchema),
    defaultValues: { fullName: '', mobileNumber: '', description: '' },
  });

  function addFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const incoming = Array.from(fileList).filter((file) => file.type.startsWith('image/'));
    setImages((current) => {
      const room = MAX_CUSTOM_ORDER_IMAGES - current.length;
      const accepted = incoming.slice(0, Math.max(room, 0));
      return [...current, ...accepted.map((file) => ({ file, previewUrl: URL.createObjectURL(file) }))];
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function removeImage(index: number) {
    setImages((current) => {
      URL.revokeObjectURL(current[index].previewUrl);
      return current.filter((_, i) => i !== index);
    });
  }

  const onSubmit = handleSubmit(async (values) => {
    const referenceImages =
      images.length > 0
        ? await uploadImages.mutateAsync(images.map((image) => image.file))
        : undefined;

    createEnquiry.mutate(
      {
        fullName: values.fullName,
        mobileNumber: values.mobileNumber,
        message: values.description,
        interestedProduct: productSlug,
        referenceImages,
        source: 'custom_order',
      },
      {
        onSuccess: () => {
          reset();
          images.forEach((image) => URL.revokeObjectURL(image.previewUrl));
          setImages([]);
        },
      },
    );
  });

  const submitFailed = uploadImages.isError || createEnquiry.isError;
  const submitted = createEnquiry.isSuccess;

  return (
    <section className="mt-24">
      <div className="mb-10 w-32">
        <JaliDivider />
      </div>
      <h2 className="text-2xl text-teak">Want it customized?</h2>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-charcoal-soft">
        Different wood, a different size, an added detail — show us a reference photo or two and
        tell us what you have in mind for the {productName}.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="rounded-[var(--radius-card)] border border-border-warm bg-white p-6 sm:p-8 lg:col-span-3">
          {submitted ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <CheckCircle2 className="h-12 w-12 text-brass" strokeWidth={1.5} />
              <h3 className="text-xl text-teak">Got it, thank you.</h3>
              <p className="max-w-xs text-sm text-charcoal-soft">
                Our craftsmen's team will look over your reference photos and call you back
                shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={(event) => void onSubmit(event)} className="flex flex-col gap-4" noValidate>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-charcoal-soft">
                  Reference photos (up to {MAX_CUSTOM_ORDER_IMAGES})
                </label>
                <div className="flex flex-wrap gap-3">
                  {images.map((image, index) => (
                    <div
                      key={image.previewUrl}
                      className="group relative h-20 w-20 overflow-hidden rounded-[var(--radius-card)] border border-border-warm"
                    >
                      <img src={image.previewUrl} alt="" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        aria-label="Remove image"
                        className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-charcoal/70 text-ivory opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {images.length < MAX_CUSTOM_ORDER_IMAGES ? (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-[var(--radius-card)] border border-dashed border-border-warm text-charcoal-soft/70 transition-colors hover:border-brass hover:text-brass"
                    >
                      <ImagePlus className="h-5 w-5" />
                      <span className="text-[10px] font-medium">Add</span>
                    </button>
                  ) : null}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(event) => addFiles(event.target.files)}
                />
              </div>

              <div>
                <label
                  htmlFor="customize-description"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-charcoal-soft"
                >
                  What would you like customized? *
                </label>
                <textarea
                  id="customize-description"
                  rows={3}
                  className={inputClass}
                  placeholder="e.g. Same design but in teak wood, and 6 inches taller"
                  {...register('description')}
                />
                {errors.description ? (
                  <p className="mt-1 text-xs text-vermilion">{errors.description.message}</p>
                ) : null}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="customize-fullName"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-charcoal-soft"
                  >
                    Full name *
                  </label>
                  <input id="customize-fullName" className={inputClass} {...register('fullName')} />
                  {errors.fullName ? (
                    <p className="mt-1 text-xs text-vermilion">{errors.fullName.message}</p>
                  ) : null}
                </div>
                <div>
                  <label
                    htmlFor="customize-mobileNumber"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-charcoal-soft"
                  >
                    Mobile number *
                  </label>
                  <input
                    id="customize-mobileNumber"
                    inputMode="tel"
                    className={inputClass}
                    {...register('mobileNumber')}
                  />
                  {errors.mobileNumber ? (
                    <p className="mt-1 text-xs text-vermilion">{errors.mobileNumber.message}</p>
                  ) : null}
                </div>
              </div>

              {submitFailed ? (
                <p className="text-sm text-vermilion">
                  Something went wrong sending that — please try again in a moment.
                </p>
              ) : null}

              <Button type="submit" variant="primary" size="lg" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {isSubmitting ? 'Sending…' : 'Send Customization Request'}
              </Button>
            </form>
          )}
        </div>

        <div className="relative flex flex-col justify-center overflow-hidden rounded-[var(--radius-card)] bg-teak-deep p-6 text-center text-ivory sm:p-8 lg:col-span-2">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(176,129,63,0.25),_transparent_60%)]" />
          <div className="relative">
            <p className="text-lg font-semibold">Prefer to just talk it through?</p>
            <p className="mx-auto mt-2 max-w-xs text-sm text-ivory-deep/80">
              Call our team directly — no form, no waiting.
            </p>
            <div className="mt-6 flex flex-col items-center gap-3">
              {phone ? (
                <a
                  href={`tel:${phone}`}
                  className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] bg-ivory px-6 py-3 text-sm font-semibold text-charcoal transition-colors hover:bg-ivory-deep"
                >
                  <Phone className="h-4 w-4" />
                  {phone}
                </a>
              ) : null}
              {whatsapp ? (
                <a
                  href={`https://wa.me/${toWhatsAppDigits(whatsapp)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-ivory-deep/90 hover:text-ivory"
                >
                  <MessageCircle className="h-4 w-4" />
                  Chat on WhatsApp
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
