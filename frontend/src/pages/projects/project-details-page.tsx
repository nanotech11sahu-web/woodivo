import { Link, useParams } from 'react-router-dom';
import { useProject } from '@/features/projects/projects-api';
import { useEnquiryDialog } from '@/features/enquiry/enquiry-dialog-context';
import { useSeoMeta } from '@/lib/use-seo-meta';
import { isNotFoundError } from '@/lib/http-error';
import { truncate } from '@/lib/utils';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { SectionSpinner } from '@/components/shared/spinner';
import { ErrorNote } from '@/components/shared/error-note';
import { EntityNotFound } from '@/components/shared/entity-not-found';
import { MediaGallery } from '@/components/shared/media-gallery';
import { Button } from '@/components/ui/button';

export function ProjectDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: project, isLoading, isError, error } = useProject(slug);
  const { openEnquiryDialog } = useEnquiryDialog();

  useSeoMeta({
    title: project?.title,
    description: truncate(project?.description),
    ogImage: project?.coverImage?.url || project?.images?.[0]?.url,
    canonicalPath: slug ? `/projects/${slug}` : undefined,
  });

  if (isLoading) {
    return <SectionSpinner />;
  }

  if (isError) {
    if (isNotFoundError(error)) {
      return (
        <EntityNotFound
          title="This project isn't available."
          message="It may have been removed or unpublished. Take a look at our other completed work instead."
          backHref="/projects"
          backLabel="Back to Projects"
        />
      );
    }
    return (
      <div className="mx-auto max-w-xl px-4 py-24">
        <ErrorNote label="This project" />
      </div>
    );
  }

  if (!project) return null;

  const category = typeof project.category === 'object' ? project.category : undefined;

  // `coverImage` and `images` are separate fields on the schema — the
  // gallery treats coverImage as image zero when present rather than
  // showing it once in a hero and again buried in the thumbnail strip.
  const gallery = project.coverImage ? [project.coverImage, ...project.images] : project.images;

  // Rendered as a <dl> only for the fields actually set — clientName,
  // location and completionYear are all optional on the schema, and a
  // project with none of them shouldn't get an empty details block.
  const details = [
    { label: 'Client', value: project.clientName },
    { label: 'Location', value: project.location },
    { label: 'Completed', value: project.completionYear },
  ].filter((detail): detail is { label: string; value: string } => Boolean(detail.value));

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'Projects', to: '/projects' },
          { label: project.title },
        ]}
      />

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
        {gallery.length > 0 ? (
          <MediaGallery images={gallery} itemName={project.title} />
        ) : (
          <div className="aspect-square rounded-[var(--radius-card)] border border-border-warm bg-ivory-deep" />
        )}

        <div className="flex flex-col">
          {category ? (
            <Link
              to={`/categories/${category.slug}`}
              className="text-xs font-semibold uppercase tracking-[0.25em] text-brass hover:text-brass-light"
            >
              {category.name}
            </Link>
          ) : null}
          <h1 className="mt-2 text-4xl text-teak">{project.title}</h1>

          {project.description ? (
            <p className="mt-5 leading-relaxed text-charcoal-soft">{project.description}</p>
          ) : null}

          {details.length > 0 ? (
            <dl className="mt-8 divide-y divide-border-warm border-t border-border-warm">
              {details.map((detail) => (
                <div key={detail.label} className="flex justify-between gap-6 py-3 text-sm">
                  <dt className="text-charcoal-soft">{detail.label}</dt>
                  <dd className="text-right font-medium text-charcoal">{detail.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          <div className="mt-8">
            <Button
              variant="primary"
              size="lg"
              onClick={() => openEnquiryDialog('project', category?.slug)}
            >
              Enquire About This Project
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
