import { createBrowserRouter } from 'react-router-dom';
import { LoginPage } from '@/features/auth/login-page';
import { ProtectedRoute } from '@/features/auth/protected-route';
import { AppShell } from '@/components/layout/app-shell';
import { lazyImport } from '@/lib/lazy-import';

/**
 * Every feature page below is lazy-loaded — flagged as an open backlog
 * item every CMS phase since 8, resolved this phase (31). `LoginPage`,
 * `ProtectedRoute` and `AppShell` stay eager imports above: they're
 * needed for the very first paint (unauthenticated or not), so splitting
 * them would just move the same code into a chunk that loads immediately
 * anyway, buying nothing.
 *
 * `AppShell`'s `<Suspense>` boundary (`components/layout/app-shell.tsx`)
 * is what actually shows a fallback while one of these chunks loads —
 * `lazyImport` alone only defers *when* the code downloads, not what the
 * user sees while it does.
 */
const DashboardPage = lazyImport(() => import('@/features/dashboard/dashboard-page'), 'DashboardPage');
const CategoryListPage = lazyImport(() => import('@/features/categories/category-list-page'), 'CategoryListPage');
const CategoryFormPage = lazyImport(() => import('@/features/categories/category-form-page'), 'CategoryFormPage');
const SubCategoryListPage = lazyImport(() => import('@/features/subcategories/subcategory-list-page'), 'SubCategoryListPage');
const SubCategoryFormPage = lazyImport(() => import('@/features/subcategories/subcategory-form-page'), 'SubCategoryFormPage');
const ProductListPage = lazyImport(() => import('@/features/products/product-list-page'), 'ProductListPage');
const ProductFormPage = lazyImport(() => import('@/features/products/product-form-page'), 'ProductFormPage');
const BlogListPage = lazyImport(() => import('@/features/blogs/blog-list-page'), 'BlogListPage');
const BlogFormPage = lazyImport(() => import('@/features/blogs/blog-form-page'), 'BlogFormPage');
const BlogCategoryManager = lazyImport(() => import('@/features/blogs/blog-category-manager'), 'BlogCategoryManager');
const TestimonialListPage = lazyImport(() => import('@/features/testimonials/testimonial-list-page'), 'TestimonialListPage');
const TestimonialFormPage = lazyImport(() => import('@/features/testimonials/testimonial-form-page'), 'TestimonialFormPage');
const FaqListPage = lazyImport(() => import('@/features/faqs/faq-list-page'), 'FaqListPage');
const FaqFormPage = lazyImport(() => import('@/features/faqs/faq-form-page'), 'FaqFormPage');
const GalleryListPage = lazyImport(() => import('@/features/gallery/gallery-list-page'), 'GalleryListPage');
const GalleryFormPage = lazyImport(() => import('@/features/gallery/gallery-form-page'), 'GalleryFormPage');
const CustomizationListPage = lazyImport(() => import('@/features/customizations/customization-list-page'), 'CustomizationListPage');
const CustomizationFormPage = lazyImport(() => import('@/features/customizations/customization-form-page'), 'CustomizationFormPage');
const BannerListPage = lazyImport(() => import('@/features/banners/banner-list-page'), 'BannerListPage');
const BannerFormPage = lazyImport(() => import('@/features/banners/banner-form-page'), 'BannerFormPage');
const EnquiryListPage = lazyImport(() => import('@/features/enquiries/enquiry-list-page'), 'EnquiryListPage');
const EnquiryDetailPage = lazyImport(() => import('@/features/enquiries/enquiry-detail-page'), 'EnquiryDetailPage');
const SettingsPage = lazyImport(() => import('@/features/settings/settings-page'), 'SettingsPage');
const AboutPageEditor = lazyImport(() => import('@/features/about/about-page'), 'AboutPageEditor');
const SeoListPage = lazyImport(() => import('@/features/seo/seo-list-page'), 'SeoListPage');
const SeoFormPage = lazyImport(() => import('@/features/seo/seo-form-page'), 'SeoFormPage');
const UserListPage = lazyImport(() => import('@/features/users/user-list-page'), 'UserListPage');
const MediaLibraryPage = lazyImport(() => import('@/features/media/media-library-page'), 'MediaLibraryPage');
const ToolsPage = lazyImport(() => import('@/features/tools/tools-page'), 'ToolsPage');

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: '/', element: <DashboardPage /> },
          { path: '/categories', element: <CategoryListPage /> },
          { path: '/categories/new', element: <CategoryFormPage /> },
          { path: '/categories/:id/edit', element: <CategoryFormPage /> },
          { path: '/subcategories', element: <SubCategoryListPage /> },
          { path: '/subcategories/new', element: <SubCategoryFormPage /> },
          { path: '/subcategories/:id/edit', element: <SubCategoryFormPage /> },
          { path: '/products', element: <ProductListPage /> },
          { path: '/products/new', element: <ProductFormPage /> },
          { path: '/products/:id/edit', element: <ProductFormPage /> },
          { path: '/blogs', element: <BlogListPage /> },
          { path: '/blogs/new', element: <BlogFormPage /> },
          { path: '/blogs/categories', element: <BlogCategoryManager /> },
          { path: '/blogs/:id/edit', element: <BlogFormPage /> },
          { path: '/gallery', element: <GalleryListPage /> },
          { path: '/gallery/new', element: <GalleryFormPage /> },
          { path: '/gallery/:id/edit', element: <GalleryFormPage /> },
          { path: '/customizations', element: <CustomizationListPage /> },
          { path: '/customizations/new', element: <CustomizationFormPage /> },
          { path: '/customizations/:id/edit', element: <CustomizationFormPage /> },
          {
            path: '/testimonials',
            element: <TestimonialListPage />,
          },
          { path: '/testimonials/new', element: <TestimonialFormPage /> },
          { path: '/testimonials/:id/edit', element: <TestimonialFormPage /> },
          { path: '/faqs', element: <FaqListPage /> },
          { path: '/faqs/new', element: <FaqFormPage /> },
          { path: '/faqs/:id/edit', element: <FaqFormPage /> },
          { path: '/banners', element: <BannerListPage /> },
          { path: '/banners/new', element: <BannerFormPage /> },
          { path: '/banners/:id/edit', element: <BannerFormPage /> },
          { path: '/enquiries', element: <EnquiryListPage /> },
          { path: '/enquiries/:id', element: <EnquiryDetailPage /> },
          { path: '/users', element: <UserListPage /> },
          { path: '/media', element: <MediaLibraryPage /> },
          { path: '/tools', element: <ToolsPage /> },
          { path: '/settings', element: <SettingsPage /> },
          { path: '/about-page', element: <AboutPageEditor /> },
          { path: '/seo', element: <SeoListPage /> },
          { path: '/seo/new', element: <SeoFormPage /> },
          { path: '/seo/:id/edit', element: <SeoFormPage /> },
        ],
      },
    ],
  },
]);
