import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useFaqs } from '@/features/faqs/faqs-api';
import { SectionHeading } from '@/components/shared/section-heading';
import { SectionSpinner } from '@/components/shared/spinner';
import { ErrorNote } from '@/components/shared/error-note';
import { cn } from '@/lib/utils';

export function FaqsSection() {
  const { data, isLoading, isError } = useFaqs(undefined, 10);
  const faqs = data?.items;
  const [openId, setOpenId] = useState<string | null>(null);

  if (!isLoading && !isError && (!faqs || faqs.length === 0)) {
    return null;
  }

  return (
    <section className="bg-ivory-deep px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <SectionHeading eyebrow="Questions" title="Frequently asked questions" />

        {isLoading ? <SectionSpinner /> : null}
        {isError ? <div className="mt-10"><ErrorNote label="FAQs" /></div> : null}

        {faqs && faqs.length > 0 ? (
          <div className="mt-12 divide-y divide-border-warm border-y border-border-warm">
            {faqs.map((faq) => {
              const isOpen = openId === faq._id;
              return (
                <div key={faq._id}>
                  <button
                    type="button"
                    onClick={() => setOpenId(isOpen ? null : faq._id)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 py-5 text-left"
                  >
                    <span className="text-base font-medium text-teak">{faq.question}</span>
                    <Plus
                      className={cn(
                        'h-5 w-5 shrink-0 text-brass transition-transform duration-200',
                        isOpen && 'rotate-45',
                      )}
                    />
                  </button>
                  {isOpen ? (
                    <p className="pb-5 text-sm leading-relaxed text-charcoal-soft">
                      {faq.answer}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </section>
  );
}
