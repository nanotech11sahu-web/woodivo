import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ChevronDown, Menu, X } from 'lucide-react';
import { useCategories } from '@/features/categories/categories-api';
import { useSettings } from '@/features/settings/settings-api';
import { useEnquiryDialog } from '@/features/enquiry/enquiry-dialog-context';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Projects', to: '/projects' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'Blogs', to: '/blogs' },
  { label: 'Contact', to: '/contact' },
];

export function SiteHeader() {
  const { data: settings } = useSettings();
  const { data: categories } = useCategories();
  const { openEnquiryDialog } = useEnquiryDialog();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  const siteName = settings?.siteName ?? 'WOODIVO';

  return (
    <header className="sticky top-0 z-30 border-b border-border-warm bg-ivory/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
          {settings?.logo?.url ? (
            <img src={settings.logo.url} alt={siteName} className="h-10 w-auto" />
          ) : (
            <span className="text-2xl font-semibold tracking-wide text-teak">
              {siteName}
            </span>
          )}
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 lg:flex">
          <NavLink to="/" end className={navLinkClass}>
            Home
          </NavLink>

          <div
            className="relative"
            onMouseEnter={() => setCategoriesOpen(true)}
            onMouseLeave={() => setCategoriesOpen(false)}
          >
            <button
              type="button"
              className="flex items-center gap-1 text-sm font-medium text-charcoal transition-colors hover:text-brass"
              aria-expanded={categoriesOpen}
              onClick={() => setCategoriesOpen((v) => !v)}
            >
              Categories
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            {categoriesOpen && categories && categories.length > 0 ? (
              <div className="absolute left-1/2 top-full w-56 -translate-x-1/2 pt-3">
                <div className="rounded-[var(--radius-card)] border border-border-warm bg-ivory p-2 shadow-lg shadow-charcoal/10">
                  {categories.map((category) => (
                    <Link
                      key={category._id}
                      to={`/categories/${category.slug}`}
                      className="block rounded px-3 py-2 text-sm text-charcoal hover:bg-ivory-deep hover:text-brass"
                      onClick={() => setCategoriesOpen(false)}
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {NAV_LINKS.slice(1).map((link) => (
            <NavLink key={link.to} to={link.to} className={navLinkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:block">
          <Button variant="brass" onClick={() => openEnquiryDialog('homepage')}>
            Enquire Now
          </Button>
        </div>

        <button
          type="button"
          className="p-2 text-teak lg:hidden"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen ? (
        <nav className="border-t border-border-warm bg-ivory px-4 pb-6 pt-2 lg:hidden">
          <NavLink to="/" end className={mobileNavLinkClass} onClick={() => setMobileOpen(false)}>
            Home
          </NavLink>
          {categories?.map((category) => (
            <NavLink
              key={category._id}
              to={`/categories/${category.slug}`}
              className={mobileNavLinkClass}
              onClick={() => setMobileOpen(false)}
            >
              {category.name}
            </NavLink>
          ))}
          {NAV_LINKS.slice(1).map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={mobileNavLinkClass}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
          <Button
            variant="brass"
            className="mt-3 w-full"
            onClick={() => {
              setMobileOpen(false);
              openEnquiryDialog('homepage');
            }}
          >
            Enquire Now
          </Button>
        </nav>
      ) : null}
    </header>
  );
}

function navLinkClass({ isActive }: { isActive: boolean }): string {
  return cn(
    'text-sm font-medium transition-colors hover:text-brass',
    isActive ? 'text-brass' : 'text-charcoal',
  );
}

function mobileNavLinkClass({ isActive }: { isActive: boolean }): string {
  return cn(
    'block border-b border-border-warm py-3 text-sm font-medium',
    isActive ? 'text-brass' : 'text-charcoal',
  );
}
