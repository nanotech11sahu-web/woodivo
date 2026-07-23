import { Link, useParams } from 'react-router-dom';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { useBlog } from '@/features/blogs/blogs-api';
import { useProducts } from '@/features/products/products-api';
import { useSettings } from '@/features/settings/settings-api';
import { ProductCard } from '@/components/shared/product-card';
import { useSeoMeta } from '@/lib/use-seo-meta';
import { useJsonLd } from '@/lib/use-json-ld';
import { isNotFoundError } from '@/lib/http-error';
import { formatDate, truncate } from '@/lib/utils';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { SectionSpinner } from '@/components/shared/spinner';
import { ErrorNote } from '@/components/shared/error-note';
import { EntityNotFound } from '@/components/shared/entity-not-found';
import { JaliDivider } from '@/components/shared/jali-divider';
import type { Blog } from '@/types/blog';
import type { WebsiteSettings } from '@/types/settings';

/** In-body markdown images get the same rounded-corner/`object-cover`
 * treatment the hero image already has, plus lazy-loading — a post can now
 * carry several. */
const markdownComponents: Components = {
  img: ({ src, alt }) => (
    <img
      src={src}
      alt={alt || ''}
      loading="lazy"
      className="w-full rounded-[var(--radius-card)] border border-border-warm object-cover"
    />
  ),
};

function toAbsoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${window.location.origin}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;
}

/**
 * `BlogPosting` was the second of Phase 27's two named structured-data
 * types. `datePublished` prefers `publishAt` over `createdAt` — same
 * precedent this page's own `date` display already set (`formatDate(blog
 * .publishAt || blog.createdAt)`) — falling back to `createdAt` for posts
 * published before the `publishAt` toggle existed. `author` is a `Person`
 * when `authorName` is set (the only author info the schema carries — no
 * separate author entity/URL to link to) and falls back to the site's own
 * `Organization` name otherwise, since `author` is a required property for
 * this type to validate and something has to fill it. `publisher` is
 * always the `Organization`, per the type's own spec, and needs a `logo`
 * to satisfy Google's rich-result requirements — omitted (not fabricated)
 * when `WebsiteSettings.logo` isn't set, same "don't invent it" rule
 * `useProductJsonLd` follows for `offers`.
 */
function useBlogPostingJsonLd(
  blog: Blog | undefined,
  settings: WebsiteSettings | undefined,
  canonicalHref: string,
): void {
  const siteName = settings?.siteName || 'WOODIVO';

  const schema = blog
    ? {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: blog.title,
        ...(blog.excerpt || blog.content
          ? { description: blog.excerpt || truncate(blog.content) }
          : {}),
        ...(blog.featuredImage?.url ? { image: [blog.featuredImage.url] } : {}),
        datePublished: blog.publishAt || blog.createdAt,
        author: {
          '@type': blog.authorName ? 'Person' : 'Organization',
          name: blog.authorName || siteName,
        },
        publisher: {
          '@type': 'Organization',
          name: siteName,
          ...(settings?.logo?.url
            ? { logo: { '@type': 'ImageObject', url: settings.logo.url } }
            : {}),
        },
        mainEntityOfPage: canonicalHref,
      }
    : undefined;

  useJsonLd('entity', schema);
}

/**
 * Sibling to `useBlogPostingJsonLd` — a separate `'faq'` key so the two
 * scripts don't clobber each other (`useJsonLd` upserts per-key). Only
 * emitted when the post actually has FAQ entries; per Google's guidance,
 * `FAQPage` should only mark up Q&A content that's genuinely visible on
 * the page, which the FAQ section below always renders alongside this.
 */
function useFaqJsonLd(faqs: Blog['faqs'] | undefined): void {
  const schema =
    faqs && faqs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.answer,
            },
          })),
        }
      : undefined;

  useJsonLd('faq', schema);
}

export function BlogDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: blog, isLoading, isError, error } = useBlog(slug);
  const { data: settings } = useSettings();

  const canonicalPath = slug ? `/blogs/${slug}` : undefined;

  useSeoMeta({
    title: blog?.title,
    description: truncate(blog?.excerpt) || truncate(blog?.content),
    ogImage: blog?.featuredImage?.url,
    canonicalPath,
  });

  useBlogPostingJsonLd(blog, settings, toAbsoluteUrl(canonicalPath ?? window.location.pathname));
  useFaqJsonLd(blog?.faqs);

  // Blogs and products have no direct schema relationship (unlike
  // Product.relatedBlogs, which is CMS-curated the other way) — reusing
  // the tag words as a product search is a zero-schema-change way to
  // surface genuinely relevant products under a post instead of leaving
  // every blog post a dead end.
  const relatedProductsQuery = useProducts(
    { search: blog?.tags?.slice(0, 3).join(' '), limit: 4 },
    { enabled: Boolean(blog?.tags?.length) },
  );
  const relatedProducts = relatedProductsQuery.data?.items ?? [];

  if (isLoading) {
    return <SectionSpinner />;
  }

  if (isError) {
    if (isNotFoundError(error)) {
      return (
        <EntityNotFound
          title="This post isn't available."
          message="It may have been unpublished or the link is out of date. Take a look at our other posts instead."
          backHref="/blogs"
          backLabel="Back to Blogs"
        />
      );
    }
    return (
      <div className="mx-auto max-w-xl px-4 py-24">
        <ErrorNote label="This post" />
      </div>
    );
  }

  if (!blog) return null;

  const category = typeof blog.category === 'object' ? blog.category : undefined;
  const date = formatDate(blog.publishAt || blog.createdAt);

  // `content` is authored as Markdown in the CMS (Phase 37) — bold, bullet
  // lists, and in-body `![alt](url)` images all live directly in the
  // string. Every pre-Phase-37 plain-text post (paragraphs separated by
  // blank lines) is already valid Markdown, so this renders unchanged.
  // `rehype-sanitize` strips any stray raw HTML/script tags before this
  // ever reaches the DOM.

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'Blogs', to: '/blogs' },
          { label: blog.title },
        ]}
      />

      <header className="mt-8">
        {category ? (
          <Link
            to={`/blogs?category=${category.slug}`}
            className="text-xs font-semibold uppercase tracking-[0.25em] text-brass hover:text-brass-light"
          >
            {category.name}
          </Link>
        ) : null}
        <h1 className="mt-2 text-4xl leading-tight text-teak">{blog.title}</h1>

        <p className="mt-4 text-sm text-charcoal-soft">
          {[blog.authorName, date].filter(Boolean).join(' · ')}
        </p>
      </header>

      {blog.featuredImage?.url ? (
        <div className="mt-8 aspect-[16/9] overflow-hidden rounded-[var(--radius-card)] border border-border-warm bg-ivory-deep">
          <img
            src={blog.featuredImage.url}
            alt={blog.featuredImage.alt || blog.title}
            className="h-full w-full object-cover"
          />
        </div>
      ) : null}

      <div className="mt-10 leading-relaxed text-charcoal-soft [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_strong]:font-semibold [&_strong]:text-teak [&_p]:mb-5 [&_ul]:mb-5 [&_ol]:mb-5 [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:text-teak [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-xl [&_h3]:text-teak [&_a]:text-brass [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-brass [&_blockquote]:pl-4 [&_blockquote]:italic">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeSanitize]}
          components={markdownComponents}
        >
          {blog.content}
        </ReactMarkdown>
      </div>

      {blog.tags.length > 0 ? (
        <div className="mt-10 flex flex-wrap gap-2">
          {blog.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-[var(--radius-card)] border border-border-warm px-3 py-1 text-xs text-charcoal-soft"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      {relatedProducts.length > 0 ? (
        <div className="mt-10">
          <h2 className="text-2xl text-teak">Shop related products</h2>
          <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-4">
            {relatedProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      ) : null}

      {blog.faqs.length > 0 ? (
        <div className="mt-10">
          <h2 className="text-2xl text-teak">Frequently asked questions</h2>
          <div className="mt-4 space-y-4">
            {blog.faqs.map((faq, index) => (
              <div key={index} className="border-b border-border-warm pb-4">
                <p className="font-semibold text-teak">{faq.question}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-charcoal-soft">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="my-12 w-32">
        <JaliDivider />
      </div>

      <Link to="/blogs" className="text-sm font-semibold text-brass hover:text-brass-light">
        ← Back to all posts
      </Link>
    </article>
  );
}
