import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useJsonLd } from '@/lib/use-json-ld';

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

function toAbsoluteUrl(path: string): string {
  return `${window.location.origin}${path.startsWith('/') ? '' : '/'}${path}`;
}

/**
 * Every page on the site that renders a breadcrumb trail (About, Category,
 * Product, Blog listing/details, Contact,
 * Gallery — everywhere but Home, which has none to show) already builds
 * the exact `{ label, to }` list a `BreadcrumbList` needs. Emitting the
 * JSON-LD straight from this shared component, rather than adding a
 * duplicate schema-building call to every one of those pages, is what
 * makes this one of the two items Phase 27 named structured data
 * candidates (Product, BlogPosting) actually complete in every page's
 * `<head>` for free.
 *
 * The last item (the current page) has no `to`, same as it renders with
 * no link — `item()` only sets `item` on entries that have a real URL,
 * which matches Google's own examples for a self-referential last crumb
 * (name-only, no `item`).
 */
function useBreadcrumbJsonLd(items: BreadcrumbItem[]): void {
  const schema =
    items.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.label,
            ...(item.to ? { item: toAbsoluteUrl(item.to) } : {}),
          })),
        }
      : undefined;

  useJsonLd('breadcrumb', schema);
}

/** Last item renders as plain text (the current page), never a link. */
export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  useBreadcrumbJsonLd(items);

  return (
    <nav aria-label="Breadcrumb" className="text-xs text-charcoal-soft">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <Fragment key={`${item.label}-${index}`}>
              {index > 0 ? <ChevronRight className="h-3 w-3 shrink-0" /> : null}
              <li className="flex items-center">
                {item.to && !isLast ? (
                  <Link to={item.to} className="hover:text-brass">
                    {item.label}
                  </Link>
                ) : (
                  <span aria-current={isLast ? 'page' : undefined} className={isLast ? 'text-teak' : undefined}>
                    {item.label}
                  </span>
                )}
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
