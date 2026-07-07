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
 * `BlogsSection` (home page) has had this exact card inline since Phase
 * 18. Pulled out here because `BlogListingPage` needs the identical card —
 * same move Phase 19 made for `ProductCard` and Phase 20 made for
 * `ProjectCard`. `BlogsSection` now imports this instead of its own copy,
 * with no visual change.
 */
export function BlogCard({ blog }: { blog: BlogCardItem }) {
  const date = formatDate(blog.publishAt || blog.createdAt);

  return (
    <Link
      to={`/blogs/${blog.slug}`}
      className="group overflow-hidden rounded-[var(--radius-card)] border border-border-warm bg-ivory-deep"
    >
      <div className="aspect-[16/10] overflow-hidden bg-brass-pale">
        {blog.featuredImage?.url ? (
          <img
            src={blog.featuredImage.url}
            alt={blog.featuredImage.alt || blog.title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : null}
      </div>
      <div className="p-5">
        {date ? (
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass">{date}</p>
        ) : null}
        <h3 className="mt-2 text-lg leading-snug text-teak">{blog.title}</h3>
        {blog.excerpt ? (
          <p className="mt-2 line-clamp-2 text-sm text-charcoal-soft">{blog.excerpt}</p>
        ) : null}
      </div>
    </Link>
  );
}
