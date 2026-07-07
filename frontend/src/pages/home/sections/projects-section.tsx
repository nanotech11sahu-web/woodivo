import { useFeaturedProjects } from '@/features/projects/projects-api';
import { SectionHeading } from '@/components/shared/section-heading';
import { SectionSpinner } from '@/components/shared/spinner';
import { ErrorNote } from '@/components/shared/error-note';
import { ProjectCard } from '@/components/shared/project-card';

export function ProjectsSection() {
  const { data, isLoading, isError } = useFeaturedProjects(6);
  const projects = data?.items;

  if (!isLoading && !isError && (!projects || projects.length === 0)) {
    return null;
  }

  return (
    <section className="bg-ivory px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Recent projects"
          title="Homes and spaces we've fitted out"
          description="A look at completed installations — temples, doors and full interiors delivered site-wide."
        />

        {isLoading ? <SectionSpinner /> : null}
        {isError ? <div className="mt-10"><ErrorNote label="Projects" /></div> : null}

        {projects && projects.length > 0 ? (
          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project._id} project={project} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
