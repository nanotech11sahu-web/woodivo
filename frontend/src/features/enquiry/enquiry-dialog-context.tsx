import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { EnquirySource } from '@/types/enquiry';

interface EnquiryDialogState {
  isOpen: boolean;
  source: EnquirySource;
  presetCategorySlug?: string;
  presetProductSlug?: string;
  presetProductName?: string;
}

interface OpenEnquiryDialogOptions {
  categorySlug?: string;
  productSlug?: string;
  productName?: string;
}

interface EnquiryDialogContextValue extends EnquiryDialogState {
  openEnquiryDialog: (source: EnquirySource, options?: OpenEnquiryDialogOptions) => void;
  closeEnquiryDialog: () => void;
}

const EnquiryDialogContext = createContext<EnquiryDialogContextValue | null>(null);

/**
 * One enquiry modal, mounted once near the app root, opened from anywhere —
 * the header's "Enquire Now", the hero CTA, a product page's "Get Quote",
 * the floating button — all share this instead of each rendering (and
 * re-validating) their own copy of the form. `source` is threaded through
 * so the backend's EnquirySource on the saved record reflects where the
 * visitor actually was, not just that an enquiry happened.
 */
export function EnquiryDialogProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<EnquiryDialogState>({
    isOpen: false,
    source: 'homepage',
  });

  const openEnquiryDialog = useCallback(
    (source: EnquirySource, options?: OpenEnquiryDialogOptions) => {
      setState({
        isOpen: true,
        source,
        presetCategorySlug: options?.categorySlug,
        presetProductSlug: options?.productSlug,
        presetProductName: options?.productName,
      });
    },
    [],
  );

  const closeEnquiryDialog = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const value = useMemo(
    () => ({ ...state, openEnquiryDialog, closeEnquiryDialog }),
    [state, openEnquiryDialog, closeEnquiryDialog],
  );

  return (
    <EnquiryDialogContext.Provider value={value}>
      {children}
    </EnquiryDialogContext.Provider>
  );
}

export function useEnquiryDialog(): EnquiryDialogContextValue {
  const ctx = useContext(EnquiryDialogContext);
  if (!ctx) {
    throw new Error('useEnquiryDialog must be used within EnquiryDialogProvider');
  }
  return ctx;
}
