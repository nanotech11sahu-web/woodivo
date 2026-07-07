import { Link } from 'react-router-dom';
import type { MediaAsset } from '@/types/common';

/**
 * Narrower than the full `Project` type, same reasoning as `ProductCard`'s
 * `ProductCardItem`: only what the card renders.
 */
export interface ProjectCardItem {
  _id: string;
  title: string;
  slug: string;
  coverImage?: MediaAsset;
  location?: string;
}

/**
 * Was inline JSX inside the home page's `ProjectsSection` since Phase 18.
 * Pulled out here because project-listing-page (Phase 20) needs the exact
 * same card — unlike `ProductCard` vs `ProjectCard`, which stay separate
 * because product and project cards render different data, this is the
 * same entity's card needed in a second place, so `ProjectsSection` now
 * imports this instead of keeping its own copy.
 */
export function ProjectCard({ project }: { project: ProjectCardItem }) {
  return (
    <Link
      to={`/projects/${project.slug}`}
      className="group overflow-hidden rounded-[var(--radius-card)] border border-border-warm bg-ivory-deep"
    >
      <div className="aspect-[4/3] overflow-hidden bg-brass-pale">
        {project.coverImage?.url ? (
          <img
            src={project.coverImage.url}
            alt={project.coverImage.alt || project.title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : null}
      </div>
      <div className="p-5">
        <h3 className="text-lg text-teak">{project.title}</h3>
        {project.location ? (
          <p className="mt-1 text-sm text-charcoal-soft">{project.location}</p>
        ) : null}
      </div>
    </Link>
  );
}
