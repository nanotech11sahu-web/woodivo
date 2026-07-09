import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useCategories } from '@/features/categories/categories-api';
import { useCreateEnquiry } from '@/features/enquiry/enquiry-api';
import {
  enquiryFormSchema,
  type EnquiryFormValues,
} from '@/features/enquiry/enquiry-form-schema';
import type { EnquirySource } from '@/types/enquiry';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { INDIAN_STATES, getCitiesForState } from '@/lib/use-india-locations';

interface EnquiryFormProps {
  source: EnquirySource;
  presetCategorySlug?: string;
  onSubmitted?: () => void;
}

const inputClass = cn(
  'w-full rounded-[var(--radius-card)] border border-border-warm bg-ivory px-4 py-2.5 text-sm text-charcoal',
  'placeholder:text-charcoal-soft/60 focus:border-brass',
);

export function EnquiryForm({ source, presetCategorySlug, onSubmitted }: EnquiryFormProps) {
  const { data: categories } = useCategories();
  const createEnquiry = useCreateEnquiry();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EnquiryFormValues>({
    resolver: zodResolver(enquiryFormSchema),
    defaultValues: {
      fullName: '',
      mobileNumber: '',
      state: '',
      city: '',
      interestedCategory: presetCategorySlug ?? '',
      message: '',
    },
  });

  const selectedState = watch('state');
  const cityOptions = getCitiesForState(selectedState);

  const onSubmit = handleSubmit((values) => {
    createEnquiry.mutate(
      {
        ...values,
        state: values.state || undefined,
        city: values.city || undefined,
        message: values.message || undefined,
        interestedCategory: values.interestedCategory || undefined,
        source,
      },
      {
        onSuccess: () => {
          reset();
          onSubmitted?.();
        },
      },
    );
  });

  if (createEnquiry.isSuccess) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <CheckCircle2 className="h-12 w-12 text-brass" strokeWidth={1.5} />
        <h3 className="text-2xl text-teak">Thank you, we've got it.</h3>
        <p className="max-w-xs text-sm text-charcoal-soft">
          One of our craftsmen's team will call you back shortly to discuss your
          requirement.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <div>
        <label htmlFor="fullName" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-charcoal-soft">
          Full name *
        </label>
        <input id="fullName" className={inputClass} {...register('fullName')} />
        {errors.fullName ? (
          <p className="mt-1 text-xs text-vermilion">{errors.fullName.message}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="mobileNumber" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-charcoal-soft">
          Mobile number *
        </label>
        <input
          id="mobileNumber"
          inputMode="tel"
          className={inputClass}
          {...register('mobileNumber')}
        />
        {errors.mobileNumber ? (
          <p className="mt-1 text-xs text-vermilion">{errors.mobileNumber.message}</p>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="state" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-charcoal-soft">
            State
          </label>
          <select
            id="state"
            className={inputClass}
            {...register('state', {
              onChange: () => setValue('city', ''),
            })}
          >
            <option value="">Select state</option>
            {INDIAN_STATES.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="city" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-charcoal-soft">
            City
          </label>
          {cityOptions.length > 0 ? (
            <select id="city" className={inputClass} {...register('city')}>
              <option value="">Select city</option>
              {cityOptions.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          ) : (
            <input
              id="city"
              className={inputClass}
              placeholder="Select a state first"
              disabled={!selectedState}
              {...register('city')}
            />
          )}
        </div>
      </div>

      <div>
        <label htmlFor="interestedCategory" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-charcoal-soft">
          Interested in
        </label>
        <select
          id="interestedCategory"
          className={inputClass}
          {...register('interestedCategory')}
        >
          <option value="">Any category</option>
          {categories?.map((category) => (
            <option key={category._id} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="message" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-charcoal-soft">
          Message (optional)
        </label>
        <textarea
          id="message"
          rows={3}
          className={inputClass}
          {...register('message')}
        />
      </div>

      {createEnquiry.isError ? (
        <p className="text-sm text-vermilion">
          Something went wrong sending that — please try again in a moment.
        </p>
      ) : null}

      <Button type="submit" variant="primary" size="lg" disabled={createEnquiry.isPending}>
        {createEnquiry.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : null}
        {createEnquiry.isPending ? 'Sending…' : 'Enquire Now'}
      </Button>
    </form>
  );
}
