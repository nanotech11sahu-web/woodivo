import { useTranslation } from 'react-i18next';
import { useLatestBlogs } from '@/features/blogs/blogs-api';
import { SectionHeading } from '@/components/shared/section-heading';
import { SectionSpinner } from '@/components/shared/spinner';
import { ErrorNote } from '@/components/shared/error-note';
import { BlogCard } from '@/components/shared/blog-card';
import { CardSlider, sliderItemWidths } from '@/components/shared/card-slider';

export function BlogsSection() {
  const { t } = useTranslation();
  const { data: blogs, isLoading, isError } = useLatestBlogs(8);

  if (!isLoading && !isError && (!blogs || blogs.length === 0)) {
    return null;
  }

  return (
    <section className="bg-ivory px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow={t('home.workshop_eyebrow')}
          title={t('home.workshop_title')}
          description={t('home.workshop_desc')}
        />

        {isLoading ? <SectionSpinner /> : null}
        {isError ? <div className="mt-10"><ErrorNote label="Blogs" /></div> : null}

        {blogs && blogs.length > 0 ? (
          <CardSlider className="mt-14">
            {blogs.map((blog) => (
              <div key={blog._id} className={sliderItemWidths.blog}>
                <BlogCard blog={blog} />
              </div>
            ))}
          </CardSlider>
        ) : null}
      </div>
    </section>
  );
}
