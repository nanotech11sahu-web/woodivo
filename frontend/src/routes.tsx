import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { SiteLayout } from '@/components/layout/site-layout';

// Lazily imported (rather than the previous top-level imports) so Vite
// splits each page into its own chunk -- PageSpeed Insights flagged 369KB
// of unused JavaScript on a fresh homepage load, almost entirely because
// every page's code (blog markdown rendering, gallery lightbox, search,
// customize form, etc.) was bundled into the one file every route loaded
// upfront, regardless of which page a visitor actually landed on.
const HomePage = lazy(() => import('@/pages/home/home-page').then((m) => ({ default: m.HomePage })));
const CategoryListingPage = lazy(() =>
  import('@/pages/categories/category-listing-page').then((m) => ({ default: m.CategoryListingPage })),
);
const CategoriesIndexPage = lazy(() =>
  import('@/pages/categories/categories-index-page').then((m) => ({ default: m.CategoriesIndexPage })),
);
const ProductDetailsPage = lazy(() =>
  import('@/pages/products/product-details-page').then((m) => ({ default: m.ProductDetailsPage })),
);
const SearchResultsPage = lazy(() =>
  import('@/pages/products/search-results-page').then((m) => ({ default: m.SearchResultsPage })),
);
const GalleryPage = lazy(() => import('@/pages/gallery/gallery-page').then((m) => ({ default: m.GalleryPage })));
const CustomizePage = lazy(() =>
  import('@/pages/customize/customize-page').then((m) => ({ default: m.CustomizePage })),
);
const BlogListingPage = lazy(() =>
  import('@/pages/blogs/blog-listing-page').then((m) => ({ default: m.BlogListingPage })),
);
const BlogDetailsPage = lazy(() =>
  import('@/pages/blogs/blog-details-page').then((m) => ({ default: m.BlogDetailsPage })),
);
const ContactPage = lazy(() => import('@/pages/contact/contact-page').then((m) => ({ default: m.ContactPage })));
const AboutPage = lazy(() => import('@/pages/about/about-page').then((m) => ({ default: m.AboutPage })));
const SitemapPage = lazy(() => import('@/pages/misc/sitemap-page').then((m) => ({ default: m.SitemapPage })));
const NotFoundPage = lazy(() => import('@/pages/misc/not-found-page').then((m) => ({ default: m.NotFoundPage })));

// Every page from the master prompt's "Public Website" page list has had a
// real route since Phase 18 — About, dynamic Category listing, dynamic
// Product details, Gallery, Blogs, Blog details, Contact — so
// every nav link, category link, product link and blog link resolves to
// something instead of a router error. Phase 18 built Home; Phase 19
// filled in Category listing and Product details; Phase 20 filled in
// Gallery; Phase 21 filled in Blogs
// (listing + detail); Phase 22 filled in Contact; this phase (23) fills
// in About, the last page on the list — see backend/src/modules/about
// and cms/src/features/about for the CMS-editable content it reads.
export const router = createBrowserRouter([
  {
    path: '/',
    element: <SiteLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'categories', element: <CategoriesIndexPage /> },
      { path: 'categories/:slug', element: <CategoryListingPage /> },
      { path: 'categories/:slug/:subCategorySlug', element: <CategoryListingPage /> },
      { path: 'products/:slug', element: <ProductDetailsPage /> },
      { path: 'search', element: <SearchResultsPage /> },
      { path: 'gallery', element: <GalleryPage /> },
      { path: 'customize', element: <CustomizePage /> },
      { path: 'blogs', element: <BlogListingPage /> },
      { path: 'blogs/:slug', element: <BlogDetailsPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'sitemap', element: <SitemapPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
