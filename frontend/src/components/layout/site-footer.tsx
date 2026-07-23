import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone, ShieldCheck, Truck, Headset } from 'lucide-react';
import { useSettings } from '@/features/settings/settings-api';
import { useCategories } from '@/features/categories/categories-api';
import { SocialLinksRow } from '@/components/shared/social-links';

const INFO_BAND = [
  {
    icon: Truck,
    title: 'Pan-India Delivery',
    text: 'Carefully packed and shipped nationwide',
  },
  {
    icon: ShieldCheck,
    title: 'Handcrafted Assurance',
    text: 'Solid wood, made and finished to order',
  },
  {
    icon: Headset,
    title: 'Customer Support',
    text: 'Talk to us on call or WhatsApp',
  },
];

export function SiteFooter() {
  const { data: settings } = useSettings();
  const { data: categories } = useCategories();
  const siteName = settings?.siteName ?? 'WOODIVO';
  const year = new Date().getFullYear();

  return (
    <footer className="bg-teak-deep text-ivory-deep">
      {/* Info band — reference-style service strip */}
      <div className="border-b border-ivory-deep/10">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-12 sm:grid-cols-3 sm:px-6 lg:px-8">
          {INFO_BAND.map((item) => (
            <div key={item.title} className="flex flex-col items-center gap-3 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-vermilion/15 text-vermilion">
                <item.icon className="h-6 w-6" strokeWidth={1.75} />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-ivory">{item.title}</h3>
                <p className="mt-1 text-xs text-ivory-deep/70">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <img src="/brand/woodivo-mark.png" alt="" className="h-10 w-10 rounded-md" />
            <h3 className="mt-3 text-2xl font-semibold tracking-tight text-ivory">{siteName}</h3>
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
              <li><Link to="/categories" className="hover:text-brass-light">All Categories</Link></li>
              <li><Link to="/blogs" className="hover:text-brass-light">Blogs</Link></li>
              <li><Link to="/about" className="hover:text-brass-light">About Us</Link></li>
              <li><Link to="/gallery" className="hover:text-brass-light">Gallery</Link></li>
              <li><Link to="/customize" className="hover:text-brass-light">Customize</Link></li>
              <li><Link to="/contact" className="hover:text-brass-light">Contact</Link></li>
              <li><Link to="/sitemap" className="hover:text-brass-light">Sitemap</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-brass-light">
              Get in touch
            </h4>
            <ul className="mt-4 space-y-3 text-sm text-ivory-deep/80">
              {settings?.contact?.phone ? (
                <li className="flex items-start gap-2.5">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brass-light" />
                  <a href={`tel:${settings.contact.phone}`} className="hover:text-brass-light">
                    {settings.contact.phone}
                  </a>
                </li>
              ) : null}
              {settings?.contact?.email ? (
                <li className="flex items-start gap-2.5">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brass-light" />
                  <a href={`mailto:${settings.contact.email}`} className="hover:text-brass-light">
                    {settings.contact.email}
                  </a>
                </li>
              ) : null}
              {settings?.contact?.address ? (
                <li className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brass-light" />
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
