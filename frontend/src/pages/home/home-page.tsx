import { HeroSection } from './sections/hero-section';
import { FeaturedCategoriesSection } from './sections/featured-categories-section';
import { FeaturedProductsSection } from './sections/featured-products-section';
import { WhyWoodivoSection } from './sections/why-woodivo-section';
import { ProjectsSection } from './sections/projects-section';
import { TestimonialsSection } from './sections/testimonials-section';
import { BlogsSection } from './sections/blogs-section';
import { FaqsSection } from './sections/faqs-section';
import { CtaSection } from '@/components/shared/cta-section';
import { useSeoMeta } from '@/lib/use-seo-meta';
import { useSettings } from '@/features/settings/settings-api';

// Order follows the master prompt's "Homepage sections (CMS managed)" list
// exactly: Hero, Featured Categories, Featured Products, Why Woodivo,
// Projects, Testimonials, Blogs, FAQs, CTA.
//
// Home never called a title hook before Phase 24 — it relied entirely on
// `index.html`'s static `<title>`/description, which was fine as long as
// no other page ever changed `document.title` first. Every interior page
// now manages its own via `useSeoMeta`, so Home needs the same call purely
// to reset those tags when a user navigates back here client-side; without
// it, `document.title` would keep showing whatever page they came from.
//
// The `/` row in the centralized SEO CMS section is what overrides the
// hardcoded description below — see `useSeoMeta` (it fetches that row
// itself via `useSeoOverride`) and `SeoEntriesService.ensureStaticPages`
// on the backend, which seeds that row on first boot so there's always
// something for a CMS operator to edit.
export function HomePage() {
  const { data: settings } = useSettings();

  useSeoMeta({
    description: 'WOODIVO — handcrafted wooden temples, doors and custom wood furniture, made to order.',
    ogImage: settings?.logo?.url,
    canonicalPath: '/',
  });

  return (
    <>
      <HeroSection />
      <FeaturedCategoriesSection />
      <FeaturedProductsSection />
      <BlogsSection />
      <WhyWoodivoSection />
      <ProjectsSection />
      <TestimonialsSection />
      <FaqsSection />
      <CtaSection />
    </>
  );
}
