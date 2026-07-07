import { useLatestBlogs } from '@/features/blogs/blogs-api';
import { SectionHeading } from '@/components/shared/section-heading';
import { SectionSpinner } from '@/components/shared/spinner';
import { ErrorNote } from '@/components/shared/error-note';
import { BlogCard } from '@/components/shared/blog-card';

export function BlogsSection() {
  const { data: blogs, isLoading, isError } = useLatestBlogs(3);

  if (!isLoading && !isError && (!blogs || blogs.length === 0)) {
    return null;
  }

  return (
    <section className="bg-ivory px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="From the workshop"
          title="Notes on wood, craft and care"
          description="Guides on choosing timber, maintaining a wooden temple, and what to expect from a made-to-order piece."
        />

        {isLoading ? <SectionSpinner /> : null}
        {isError ? <div className="mt-10"><ErrorNote label="Blogs" /></div> : null}

        {blogs && blogs.length > 0 ? (
          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {blogs.map((blog) => (
              <BlogCard key={blog._id} blog={blog} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
