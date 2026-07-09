import { useFeaturedProjects } from '@/features/projects/projects-api';
import { SectionHeading } from '@/components/shared/section-heading';
import { SectionSpinner } from '@/components/shared/spinner';
import { ErrorNote } from '@/components/shared/error-note';
import { ProjectCard } from '@/components/shared/project-card';
import { CardSlider, sliderItemWidths } from '@/components/shared/card-slider';

export function ProjectsSection() {
  const { data, isLoading, isError } = useFeaturedProjects(8);
  const projects = data?.items;

  if (!isLoading && !isError && (!projects || projects.length === 0)) {
    return null;
  }

  return (
    <section className="bg-ivory px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Recent projects"
          title="Homes and spaces we've fitted out"
          description="A look at completed installations — temples, doors and full interiors delivered site-wide."
        />

        {isLoading ? <SectionSpinner /> : null}
        {isError ? <div className="mt-10"><ErrorNote label="Projects" /></div> : null}

        {projects && projects.length > 0 ? (
          <CardSlider className="mt-14">
            {projects.map((project) => (
              <div key={project._id} className={sliderItemWidths.project}>
                <ProjectCard project={project} />
              </div>
            ))}
          </CardSlider>
        ) : null}
      </div>
    </section>
  );
}
