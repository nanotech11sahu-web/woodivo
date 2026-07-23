import { useTranslation } from 'react-i18next';
import { Star } from 'lucide-react';
import { useTestimonials } from '@/features/testimonials/testimonials-api';
import { SectionHeading } from '@/components/shared/section-heading';
import { SectionSpinner } from '@/components/shared/spinner';
import { ErrorNote } from '@/components/shared/error-note';
import { CardSlider, sliderItemWidths } from '@/components/shared/card-slider';

export function TestimonialsSection() {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useTestimonials(true, 7);
  const testimonials = data?.items;

  if (!isLoading && !isError && (!testimonials || testimonials.length === 0)) {
    return null;
  }

  return (
    <section className="bg-ivory-deep px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading eyebrow={t('home.client_stories_eyebrow')} title={t('home.client_stories_title')} />

        {isLoading ? <SectionSpinner /> : null}
        {isError ? <div className="mt-10"><ErrorNote label="Testimonials" /></div> : null}

        {testimonials && testimonials.length > 0 ? (
          <CardSlider className="mt-14">
            {testimonials.map((testimonial) => (
              <figure
                key={testimonial._id}
                className={`flex flex-col rounded-[var(--radius-card)] border border-border-warm bg-ivory p-6 ${sliderItemWidths.testimonial}`}
              >
                {testimonial.rating ? (
                  <div className="mb-3 flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={index}
                        className="h-4 w-4"
                        fill={index < testimonial.rating! ? 'currentColor' : 'none'}
                        strokeWidth={1.5}
                        style={{ color: 'var(--color-brass)' }}
                      />
                    ))}
                  </div>
                ) : null}
                <blockquote className="flex-1 text-sm leading-relaxed text-charcoal-soft">
                  “{testimonial.testimonialText}”
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  {testimonial.clientPhoto?.url ? (
                    <img
                      src={testimonial.clientPhoto.url}
                      alt={testimonial.clientPhoto.alt || testimonial.clientName}
                      loading="lazy"
                      decoding="async"
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brass-pale text-sm font-semibold text-brass">
                      {testimonial.clientName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-teak">{testimonial.clientName}</p>
                    <p className="text-xs text-charcoal-soft">
                      {[testimonial.projectType, testimonial.clientLocation].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </CardSlider>
        ) : null}
      </div>
    </section>
  );
}
