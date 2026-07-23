import { useTranslation } from 'react-i18next';
import { useEnquiryDialog } from '@/features/enquiry/enquiry-dialog-context';
import { Button } from '@/components/ui/button';
import { JaliDivider } from '@/components/shared/jali-divider';
import type { EnquirySource } from '@/types/enquiry';

interface CtaSectionProps {
  title?: string;
  text?: string;
  source?: EnquirySource;
  buttonLabel?: string;
}

/**
 * Originally `pages/home/sections/cta-section.tsx`, hardcoded homepage copy
 * and `source: 'homepage'`. Moved to shared and given optional overrides
 * once the About page (Phase 23) needed the identical CTA block with its
 * own copy and `source: 'about'` — same "pull it out once a second caller
 * needs it" move this project made for `ProductCard`, `SocialLinksRow` and
 * the rest. `HomePage`'s own usage is unchanged: no props passed, so it
 * falls through to the original defaults below.
 */
export function CtaSection({
  title,
  text,
  source = 'homepage',
  buttonLabel,
}: CtaSectionProps) {
  const { t } = useTranslation();
  const { openEnquiryDialog } = useEnquiryDialog();
  const resolvedTitle = title ?? t('cta.title');
  const resolvedText = text ?? t('cta.text');
  const resolvedButtonLabel = buttonLabel ?? t('cta.button');

  return (
    <section className="relative overflow-hidden bg-teak-deep px-4 py-16 text-center text-ivory sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,_rgba(176,129,63,0.25),_transparent_55%)]" />
      <div className="relative mx-auto max-w-2xl">
        <h2 className="text-4xl leading-tight sm:text-5xl">{resolvedTitle}</h2>
        <p className="mx-auto mt-4 max-w-md text-ivory-deep/80">{resolvedText}</p>
        <div className="mt-9">
          <Button size="lg" variant="brass" onClick={() => openEnquiryDialog(source)}>
            {resolvedButtonLabel}
          </Button>
        </div>
        <div className="mx-auto mt-14 w-56">
          <JaliDivider className="text-brass-light" />
        </div>
      </div>
    </section>
  );
}
