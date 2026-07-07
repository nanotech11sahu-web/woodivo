import { Link } from 'react-router-dom';
import { buttonVariants } from '@/components/ui/button';
import { JaliDivider } from '@/components/shared/jali-divider';

interface EntityNotFoundProps {
  title: string;
  message: string;
  backHref: string;
  backLabel: string;
}

/**
 * Visually related to NotFoundPage (same jali-divider, same centered
 * layout) but a distinct component: the router's `*` route means the URL
 * itself doesn't match anything, while this means the URL shape is right
 * (`/categories/:slug`, `/products/:slug`) but the slug doesn't resolve to
 * an active record — a deleted product, a mistyped link, a category an
 * admin unpublished. Different cause, so it gets its own copy and its own
 * "back to categories/products" link rather than always routing to "/".
 */
export function EntityNotFound({ title, message, backHref, backLabel }: EntityNotFoundProps) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 py-24 text-center">
      <h1 className="text-3xl text-teak">{title}</h1>
      <p className="mt-3 text-charcoal-soft">{message}</p>
      <div className="my-8 w-40">
        <JaliDivider />
      </div>
      <Link to={backHref} className={buttonVariants({ variant: 'primary', size: 'lg' })}>
        {backLabel}
      </Link>
    </div>
  );
}
