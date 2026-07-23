import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LayoutGrid, Menu, MessageSquareText, Phone, Search, X } from 'lucide-react';
import { useCategories } from '@/features/categories/categories-api';
import { useSubCategories } from '@/features/subcategories/subcategories-api';
import { useSettings } from '@/features/settings/settings-api';
import { useEnquiryDialog } from '@/features/enquiry/enquiry-dialog-context';
import { LanguageSwitcher } from '@/components/shared/language-switcher';
import { cn } from '@/lib/utils';

export function SiteHeader() {
  const { t } = useTranslation();
  const { data: settings } = useSettings();
  const { data: categories } = useCategories();
  const { data: subCategories } = useSubCategories();
  const { openEnquiryDialog } = useEnquiryDialog();
  const navigate = useNavigate();

  const NAV_LINKS = [
    { label: t('nav.home'), to: '/' },
    { label: t('nav.blogs'), to: '/blogs' },
    { label: t('nav.gallery'), to: '/gallery' },
    { label: t('nav.customize'), to: '/customize' },
    { label: t('nav.about'), to: '/about' },
    { label: t('nav.contact'), to: '/contact' },
  ];

  const [mobileOpen, setMobileOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [hoveredCategorySlug, setHoveredCategorySlug] = useState<string | null>(null);
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
              placeholder={t('nav.search_placeholder')}
              aria-label={t('nav.search_aria')}
              className="h-11 w-full rounded-[var(--radius-pill)] border border-border-warm bg-ivory-deep pl-10 pr-4 text-sm text-charcoal placeholder:text-charcoal-soft focus:border-brass focus:outline-none"
            />
          </label>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-1.5">
          <LanguageSwitcher className="hidden sm:block" />
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
              <span className="hidden xl:inline">{t('nav.categories')}</span>
            </button>
            {categoriesOpen && categories && categories.length > 0 ? (
              <div className="absolute right-0 top-full pt-3">
                <div className="flex w-[36rem] max-w-[90vw] rounded-[var(--radius-card)] border border-border-warm bg-ivory shadow-pop">
                  <div className="w-56 shrink-0 border-r border-border-warm p-2">
                    {categories.map((category) => {
                      const isActive = (hoveredCategorySlug ?? categories[0]?.slug) === category.slug;
                      return (
                        <Link
                          key={category._id}
                          to={`/categories/${category.slug}`}
                          onMouseEnter={() => setHoveredCategorySlug(category.slug)}
                          onClick={() => setCategoriesOpen(false)}
                          className={cn(
                            'block rounded px-3 py-2 text-sm text-charcoal hover:bg-ivory-deep hover:text-brass',
                            isActive && 'bg-ivory-deep text-brass',
                          )}
                        >
                          {category.name}
                        </Link>
                      );
                    })}
                  </div>
                  <div className="flex-1 p-4">
                    {(() => {
                      const activeSlug = hoveredCategorySlug ?? categories[0]?.slug;
                      const activeCategory = categories.find((c) => c.slug === activeSlug);
                      const children = subCategories?.filter((sc) => sc.category.slug === activeSlug) ?? [];
                      if (children.length === 0) {
                        return (
                          <Link
                            to={`/categories/${activeSlug}`}
                            onClick={() => setCategoriesOpen(false)}
                            className="text-sm font-medium text-brass hover:underline"
                          >
                            {t('nav.view_all')} {activeCategory?.name}
                          </Link>
                        );
                      }
                      return (
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                          {children.map((sub) => (
                            <Link
                              key={sub._id}
                              to={`/categories/${activeSlug}/${sub.slug}`}
                              onClick={() => setCategoriesOpen(false)}
                              className="rounded px-2 py-1.5 text-sm text-charcoal-soft hover:bg-ivory-deep hover:text-brass"
                            >
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
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
            <span className="hidden xl:inline">{t('nav.enquire')}</span>
          </button>

          <Link
            to="/contact"
            className="hidden h-10 items-center gap-1.5 rounded-[var(--radius-card)] px-2.5 text-sm font-medium text-charcoal transition-colors hover:bg-ivory-deep lg:flex"
          >
            <Phone className="h-[18px] w-[18px]" />
            <span className="hidden xl:inline">{t('nav.contact')}</span>
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
              placeholder={t('nav.search_placeholder')}
              aria-label={t('nav.search_aria')}
              className="h-11 w-full rounded-[var(--radius-pill)] border border-border-warm bg-ivory-deep pl-10 pr-4 text-sm text-charcoal placeholder:text-charcoal-soft focus:border-brass focus:outline-none"
            />
          </label>
        </div>
      ) : null}

      {/* Mobile nav drawer */}
      {mobileOpen ? (
        <nav className="border-t border-border-warm bg-ivory px-4 pb-6 pt-2 lg:hidden">
          <div className="py-2">
            <LanguageSwitcher />
          </div>
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
            {t('nav.contact')}
          </NavLink>
          {categories && categories.length > 0 ? (
            <>
              <p className="mt-3 pt-3 text-xs font-semibold uppercase tracking-[0.2em] text-charcoal-soft">
                {t('nav.categories')}
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
    'relative py-1 text-sm font-medium tracking-wide transition-colors hover:text-brass',
    'after:absolute after:-bottom-1 after:left-0 after:h-[1.5px] after:bg-brass after:transition-all after:duration-200',
    isActive ? 'text-brass after:w-full' : 'text-charcoal after:w-0',
  );
}

function mobileNavLinkClass({ isActive }: { isActive: boolean }): string {
  return cn(
    'block border-b border-border-warm py-3 text-sm font-medium',
    isActive ? 'text-brass' : 'text-charcoal',
  );
}
