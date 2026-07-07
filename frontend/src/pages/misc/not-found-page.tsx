import { Link } from 'react-router-dom';
import { useSeoMeta } from '@/lib/use-seo-meta';
import { buttonVariants } from '@/components/ui/button';
import { JaliDivider } from '@/components/shared/jali-divider';

export function NotFoundPage() {
  // The one page that should actively tell search engines not to index it
  // — every other `useSeoMeta` call in this codebase leaves `noIndex`
  // unset (defaults to indexable), this is the single exception.
  useSeoMeta({ title: 'Page Not Found', noIndex: true });

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-4 py-24 text-center">
      <p className="font-display text-8xl text-brass">404</p>
      <h1 className="mt-4 text-3xl text-teak">This page hasn't been carved yet.</h1>
      <p className="mt-3 text-charcoal-soft">
        The page you're looking for doesn't exist, or may have moved.
      </p>
      <div className="my-8 w-40">
        <JaliDivider />
      </div>
      <Link to="/" className={buttonVariants({ variant: 'primary', size: 'lg' })}>
        Back to Home
      </Link>
    </div>
  );
}
