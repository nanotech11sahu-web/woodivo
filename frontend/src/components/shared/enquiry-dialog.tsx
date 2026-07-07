import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useEnquiryDialog } from '@/features/enquiry/enquiry-dialog-context';
import { EnquiryForm } from './enquiry-form';

/**
 * Built on the native <dialog> element rather than a headless-UI/Radix
 * dependency — it already gives a real top-layer stacking context, Escape-
 * to-close, ::backdrop styling, and a sensible focus trap for free, and
 * this app's only modal is this one. Reaching for a dialog library for a
 * single use case would be the extra dependency, not this.
 */
export function EnquiryDialog() {
  const { isOpen, source, presetCategorySlug, closeEnquiryDialog } = useEnquiryDialog();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    if (isOpen && !node.open) {
      node.showModal();
    } else if (!isOpen && node.open) {
      node.close();
    }
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      onClose={closeEnquiryDialog}
      onCancel={closeEnquiryDialog}
      onClick={(event) => {
        if (event.target === dialogRef.current) closeEnquiryDialog();
      }}
      className="m-auto w-[min(30rem,92vw)] rounded-[var(--radius-card)] border border-border-warm bg-ivory p-0 backdrop:bg-charcoal/60 backdrop:backdrop-blur-sm"
    >
      {isOpen ? (
        <div className="p-6 sm:p-8">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brass">
                Get in touch
              </p>
              <h2 className="mt-1 text-3xl text-teak">Enquire Now</h2>
            </div>
            <button
              type="button"
              onClick={closeEnquiryDialog}
              aria-label="Close"
              className="rounded-full p-1.5 text-charcoal-soft hover:bg-ivory-deep"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <EnquiryForm
            key={`${source}-${presetCategorySlug ?? ''}`}
            source={source}
            presetCategorySlug={presetCategorySlug}
          />
        </div>
      ) : null}
    </dialog>
  );
}
