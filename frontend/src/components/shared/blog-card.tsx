import { Link } from 'react-router-dom';
import type { MediaAsset } from '@/types/common';
import { formatDate } from '@/lib/utils';

/**
 * Narrower than the full `Blog` type, same reasoning as `ProductCardItem`
 * / `ProjectCardItem`: only what the card renders. `content`, `tags`,
 * `viewCount` and `seo` never show up on a card.
 */
export interface BlogCardItem {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  featuredImage?: MediaAsset;
  publishAt?: string;
  createdAt: string;
}

/**
 * Two distinct layouts, not one squeezed into both: on mobile this is a
 * compact horizontal row (small thumbnail + title/date) so a list of posts
 * scans quickly without a full-width photo per post eating the whole
 * viewport height. From `sm` up it switches to the original stacked photo
 * card, which has the room to earn a full-width image.
 */
export function BlogCard({ blog }: { blog: BlogCardItem }) {
  const date = formatDate(blog.publishAt || blog.createdAt);

  return (
    <Link
      to={`/blogs/${blog.slug}`}
      className="group flex gap-4 rounded-[var(--radius-card)] transition-shadow duration-300 sm:block sm:overflow-hidden sm:bg-ivory sm:shadow-card sm:hover:shadow-card-hover"
    >
      <div className="aspect-square w-24 shrink-0 overflow-hidden rounded-[var(--radius-card)] bg-brass-pale sm:aspect-[16/10] sm:w-full sm:rounded-none">
        {blog.featuredImage?.url ? (
          <img
            src={blog.featuredImage.url}
            alt={blog.featuredImage.alt || blog.title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 sm:group-hover:scale-105"
          />
        ) : null}
      </div>
      <div className="min-w-0 flex-1 py-0.5 sm:p-5">
        {date ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brass sm:text-xs">
            {date}
          </p>
        ) : null}
        <h3 className="mt-1.5 line-clamp-2 font-display text-base leading-snug text-teak sm:mt-2 sm:text-lg">
          {blog.title}
        </h3>
        {blog.excerpt ? (
          <p className="mt-1.5 hidden text-sm text-charcoal-soft sm:mt-2 sm:line-clamp-2 sm:block">
            {blog.excerpt}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
