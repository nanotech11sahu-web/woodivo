import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { LayoutGrid, Menu, MessageSquareText, Phone, Search, X } from 'lucide-react';
import { useCategories } from '@/features/categories/categories-api';
import { useSettings } from '@/features/settings/settings-api';
import { useEnquiryDialog } from '@/features/enquiry/enquiry-dialog-context';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Blogs', to: '/blogs' },
  { label: 'Projects', to: '/projects' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

export function SiteHeader() {
  const { data: settings } = useSettings();
  const { data: categories } = useCategories();
  const { openEnquiryDialog } = useEnquiryDialog();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [query, setQuery] = useState('');

  const siteName = settings?.siteName ?? 'WOODIVO';

  function submitSearch() {
    const trimmed = query.trim();
    if (!trimmed) return;
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    setMobileSearchOpen(false);
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border-warm bg-ivory/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:h-24 lg:gap-8 lg:px-8">
        {/* Logo */}
        <Link
          to="/"
          className="flex shrink-0 items-center gap-2"
          onClick={() => setMobileOpen(false)}
        >
          {settings?.logo?.url ? (
            <img src={settings.logo.url} alt={siteName} className="h-12 w-auto sm:h-14 lg:h-16" />
          ) : (
            <img src="/brand/woodivo-logo-full.png" alt={siteName} className="h-12 w-auto sm:h-14 lg:h-16" />
          )}
        </Link>

        {/* Nav links — sit directly left, next to the logo */}
        <nav className="hidden shrink-0 items-center gap-6 lg:flex xl:gap-7">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.to === '/'} className={navLinkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Desktop search — takes remaining space */}
        <div className="hidden flex-1 md:block">
          <label className="relative block max-w-md">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-soft" />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && submitSearch()}
              placeholder="Search for products..."
              aria-label="Search for products"
              className="h-11 w-full rounded-[var(--radius-pill)] border border-border-warm bg-ivory-deep pl-10 pr-4 text-sm text-charcoal placeholder:text-charcoal-soft focus:border-brass focus:outline-none"
            />
          </label>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-1.5">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center text-charcoal md:hidden"
            aria-label="Search"
            onClick={() => setMobileSearchOpen((v) => !v)}
          >
            {mobileSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
          </button>

          <div
            className="relative hidden sm:block"
            onMouseEnter={() => setCategoriesOpen(true)}
            onMouseLeave={() => setCategoriesOpen(false)}
          >
            <button
              type="button"
              className="flex h-10 items-center gap-1.5 rounded-[var(--radius-card)] px-2.5 text-sm font-medium text-charcoal transition-colors hover:bg-ivory-deep"
              aria-expanded={categoriesOpen}
              onClick={() => setCategoriesOpen((v) => !v)}
            >
              <LayoutGrid className="h-[18px] w-[18px]" />
              <span className="hidden xl:inline">Categories</span>
            </button>
            {categoriesOpen && categories && categories.length > 0 ? (
              <div className="absolute right-0 top-full w-64 pt-3">
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

          <button
            type="button"
            className="hidden h-10 items-center gap-1.5 rounded-[var(--radius-card)] px-2.5 text-sm font-medium text-charcoal transition-colors hover:bg-ivory-deep sm:flex"
            onClick={() => openEnquiryDialog('floating_cta')}
          >
            <MessageSquareText className="h-[18px] w-[18px]" />
            <span className="hidden xl:inline">Enquire</span>
          </button>

          <Link
            to="/contact"
            className="hidden h-10 items-center gap-1.5 rounded-[var(--radius-card)] px-2.5 text-sm font-medium text-charcoal transition-colors hover:bg-ivory-deep lg:flex"
          >
            <Phone className="h-[18px] w-[18px]" />
            <span className="hidden xl:inline">Contact</span>
          </Link>

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center text-charcoal lg:hidden"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile search row */}
      {mobileSearchOpen ? (
        <div className="border-t border-border-warm px-4 py-3 md:hidden">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-soft" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && submitSearch()}
              placeholder="Search for products..."
              aria-label="Search for products"
              className="h-11 w-full rounded-[var(--radius-pill)] border border-border-warm bg-ivory-deep pl-10 pr-4 text-sm text-charcoal placeholder:text-charcoal-soft focus:border-brass focus:outline-none"
            />
          </label>
        </div>
      ) : null}

      {/* Mobile nav drawer */}
      {mobileOpen ? (
        <nav className="border-t border-border-warm bg-ivory px-4 pb-6 pt-2 lg:hidden">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={mobileNavLinkClass}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
          <NavLink to="/contact" className={mobileNavLinkClass} onClick={() => setMobileOpen(false)}>
            Contact
          </NavLink>
          {categories && categories.length > 0 ? (
            <>
              <p className="mt-3 pt-3 text-xs font-semibold uppercase tracking-[0.2em] text-charcoal-soft">
                Categories
              </p>
              {categories.map((category) => (
                <NavLink
                  key={category._id}
                  to={`/categories/${category.slug}`}
                  className={mobileNavLinkClass}
                  onClick={() => setMobileOpen(false)}
                >
                  {category.name}
                </NavLink>
              ))}
            </>
          ) : null}
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
