import { Link } from 'react-router-dom';
import { useCategories } from '@/features/categories/categories-api';
import { useSubCategories } from '@/features/subcategories/subcategories-api';
import { useBlogs } from '@/features/blogs/blogs-api';
import { useSeoMeta } from '@/lib/use-seo-meta';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { SectionSpinner } from '@/components/shared/spinner';

const STATIC_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'All Categories', to: '/categories' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'Blogs', to: '/blogs' },
  { label: 'Customize', to: '/customize' },
  { label: 'About Us', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

/**
 * Human-readable sitemap — a crawlable, browsable index of every category,
 * subcategory and blog post, distinct from the machine-readable
 * `sitemap.xml` (generated at build time by `scripts/generate-sitemap.mjs`
 * and not something a visitor ever opens). Individual products aren't
 * listed here (1000+ of them would make this page itself unusable) —
 * they're reachable through their category/subcategory instead.
 */
export function SitemapPage() {
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: subCategories } = useSubCategories();
  const { data: blogsResult } = useBlogs({ limit: 100 });

  useSeoMeta({
    title: 'Sitemap',
    description: 'Every category, collection and article on Woodivo in one place.',
    canonicalPath: '/sitemap',
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Sitemap' }]} />
      <h1 className="mt-4 text-2xl sm:text-3xl">Sitemap</h1>
      <p className="mt-2 text-sm text-charcoal-soft">
        Every page, category and collection on Woodivo, in one place.
      </p>

      {categoriesLoading ? <SectionSpinner /> : null}

      <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-2">
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-charcoal-soft">Pages</h2>
          <ul className="mt-3 space-y-2">
            {STATIC_LINKS.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="text-sm text-teak hover:text-brass">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-charcoal-soft">Categories</h2>
          <ul className="mt-3 space-y-4">
            {categories?.map((category) => {
              const children = subCategories?.filter((sc) => sc.category.slug === category.slug) ?? [];
              return (
                <li key={category._id}>
                  <Link to={`/categories/${category.slug}`} className="text-sm font-medium text-teak hover:text-brass">
                    {category.name}
                  </Link>
                  {children.length > 0 ? (
                    <ul className="mt-1.5 ml-4 space-y-1 border-l border-border-warm pl-3">
                      {children.map((sub) => (
                        <li key={sub._id}>
                          <Link
                            to={`/categories/${category.slug}/${sub.slug}`}
                            className="text-sm text-charcoal-soft hover:text-brass"
                          >
                            {sub.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </section>

        {blogsResult && blogsResult.items.length > 0 ? (
          <section className="sm:col-span-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-charcoal-soft">Articles</h2>
            <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {blogsResult.items.map((blog) => (
                <li key={blog._id}>
                  <Link to={`/blogs/${blog.slug}`} className="text-sm text-teak hover:text-brass">
                    {blog.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </div>
  );
}
