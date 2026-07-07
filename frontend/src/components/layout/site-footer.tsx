import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone } from 'lucide-react';
import { useSettings } from '@/features/settings/settings-api';
import { useCategories } from '@/features/categories/categories-api';
import { JaliDivider } from '@/components/shared/jali-divider';
import { SocialLinksRow } from '@/components/shared/social-links';

export function SiteFooter() {
  const { data: settings } = useSettings();
  const { data: categories } = useCategories();
  const siteName = settings?.siteName ?? 'WOODIVO';
  const year = new Date().getFullYear();

  return (
    <footer className="bg-teak-deep text-ivory-deep">
      <JaliDivider className="text-brass/40" />
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="text-2xl text-ivory">{siteName}</h3>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-ivory-deep/75">
              {settings?.footer?.aboutText ??
                'Handcrafted wooden temples, doors and custom furniture — made to order by hand, in the wood you choose.'}
            </p>
            <SocialLinksRow links={settings?.socialLinks} className="mt-5" />
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-brass-light">
              Categories
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm text-ivory-deep/80">
              {categories?.slice(0, 6).map((category) => (
                <li key={category._id}>
                  <Link to={`/categories/${category.slug}`} className="hover:text-brass-light">
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-brass-light">
              Explore
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm text-ivory-deep/80">
              <li><Link to="/about" className="hover:text-brass-light">About Us</Link></li>
              <li><Link to="/projects" className="hover:text-brass-light">Projects</Link></li>
              <li><Link to="/gallery" className="hover:text-brass-light">Gallery</Link></li>
              <li><Link to="/blogs" className="hover:text-brass-light">Blogs</Link></li>
              <li><Link to="/contact" className="hover:text-brass-light">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-brass-light">
              Get in touch
            </h4>
            <ul className="mt-4 space-y-3 text-sm text-ivory-deep/80">
              {settings?.contact?.phone ? (
                <li className="flex items-start gap-2.5">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brass" />
                  <a href={`tel:${settings.contact.phone}`} className="hover:text-brass-light">
                    {settings.contact.phone}
                  </a>
                </li>
              ) : null}
              {settings?.contact?.email ? (
                <li className="flex items-start gap-2.5">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brass" />
                  <a href={`mailto:${settings.contact.email}`} className="hover:text-brass-light">
                    {settings.contact.email}
                  </a>
                </li>
              ) : null}
              {settings?.contact?.address ? (
                <li className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brass" />
                  <span>
                    {settings.contact.address}
                    {settings.contact.city ? `, ${settings.contact.city}` : ''}
                  </span>
                </li>
              ) : null}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-ivory-deep/15 pt-6 text-center text-xs text-ivory-deep/60">
          {settings?.footer?.copyrightText ??
            `© ${year} ${siteName}. All rights reserved.`}
        </div>
      </div>
    </footer>
  );
}
