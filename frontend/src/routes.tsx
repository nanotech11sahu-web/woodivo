import { createBrowserRouter } from 'react-router-dom';
import { SiteLayout } from '@/components/layout/site-layout';
import { HomePage } from '@/pages/home/home-page';
import { CategoryListingPage } from '@/pages/categories/category-listing-page';
import { CategoriesIndexPage } from '@/pages/categories/categories-index-page';
import { ProductDetailsPage } from '@/pages/products/product-details-page';
import { SearchResultsPage } from '@/pages/products/search-results-page';
import { ProjectListingPage } from '@/pages/projects/project-listing-page';
import { ProjectDetailsPage } from '@/pages/projects/project-details-page';
import { GalleryPage } from '@/pages/gallery/gallery-page';
import { BlogListingPage } from '@/pages/blogs/blog-listing-page';
import { BlogDetailsPage } from '@/pages/blogs/blog-details-page';
import { ContactPage } from '@/pages/contact/contact-page';
import { AboutPage } from '@/pages/about/about-page';
import { NotFoundPage } from '@/pages/misc/not-found-page';

// Every page from the master prompt's "Public Website" page list has had a
// real route since Phase 18 — About, dynamic Category listing, dynamic
// Product details, Projects, Gallery, Blogs, Blog details, Contact — so
// every nav link, category link, product link and blog link resolves to
// something instead of a router error. Phase 18 built Home; Phase 19
// filled in Category listing and Product details; Phase 20 filled in
// Projects (listing + detail) and Gallery; Phase 21 filled in Blogs
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
      { path: 'products/:slug', element: <ProductDetailsPage /> },
      { path: 'search', element: <SearchResultsPage /> },
      { path: 'projects', element: <ProjectListingPage /> },
      { path: 'projects/:slug', element: <ProjectDetailsPage /> },
      { path: 'gallery', element: <GalleryPage /> },
      { path: 'blogs', element: <BlogListingPage /> },
      { path: 'blogs/:slug', element: <BlogDetailsPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
