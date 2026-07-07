import { Link } from 'react-router-dom';
import { Hammer } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { JaliDivider } from '@/components/shared/jali-divider';

/**
 * The master prompt's page list (About, Category Listing, Product Details,
 * Projects, Gallery, Blogs, Blog Details, Contact) is scaffolded as real
 * routes from Phase 18 so nav links, category links and blog links all
 * resolve to something rather than a router error — but only Home's
 * content is actually built this phase. Every other route renders this
 * placeholder until its own phase, the same pattern the CMS used for
 * `ComingSoon` from Phase 8 through Phase 16.
 */
export function ComingSoonPage({ title }: { title: string }) {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-4 py-24 text-center">
      <Hammer className="h-10 w-10 text-brass" strokeWidth={1.5} />
      <h1 className="mt-6 text-4xl text-teak">{title}</h1>
      <p className="mt-3 text-charcoal-soft">
        This page is still being crafted. Check back soon, or get in touch with our
        team directly in the meantime.
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
