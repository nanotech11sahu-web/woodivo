import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { useSettings } from '@/features/settings/settings-api';
import { useSeoMeta } from '@/lib/use-seo-meta';
import { toWhatsAppDigits } from '@/lib/utils';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { SectionSpinner } from '@/components/shared/spinner';
import { ErrorNote } from '@/components/shared/error-note';
import { SocialLinksRow } from '@/components/shared/social-links';
import { EnquiryForm } from '@/components/shared/enquiry-form';

/**
 * The one page on the site with an obvious existing data source to draw
 * from instead of needing new schema or CMS work — `WebsiteSettings.contact`
 * has had `phone`, `whatsapp`, `email`, `address`/`city`/`state`/`pincode`
 * and `googleMapEmbedUrl` since Phase 7, all filled in via the CMS's
 * existing Settings page, all sitting unread on the public site until now
 * (only `SiteHeader`/`SiteFooter`/`WhatsAppFloatButton` had touched
 * `settings.contact` before this phase, and only a subset of it each).
 *
 * The enquiry form is embedded directly on the page rather than opened via
 * `EnquiryDialog` — this *is* the page whose whole purpose is "send an
 * enquiry", so putting the form behind a second click to open a modal on
 * top of it would be backwards. `EnquiryForm` already took `source` as a
 * prop from Phase 18 specifically so it could be reused outside the
 * dialog; this is the first page that actually does.
 */
export function ContactPage() {
  useSeoMeta({
    title: 'Contact Us',
    description: 'Get in touch with WOODIVO for enquiries on handcrafted wooden temples, doors and custom furniture.',
    canonicalPath: '/contact',
  });
  const { data: settings, isLoading, isError } = useSettings();
  const contact = settings?.contact;

  const addressLines = [
    contact?.address,
    [contact?.city, contact?.state].filter(Boolean).join(', '),
    contact?.pincode,
  ].filter((line): line is string => Boolean(line));

  const hasAnyContactDetail = Boolean(
    contact?.phone || contact?.whatsapp || contact?.email || addressLines.length > 0,
  );

  return (
    <div>
      <section className="relative overflow-hidden bg-teak-deep text-ivory">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,_rgba(176,129,63,0.18),_transparent_45%)]" />
        <div className="relative mx-auto max-w-5xl px-4 py-14 text-center sm:px-6">
          <div className="mb-6 flex justify-center">
            <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Contact' }]} />
          </div>
          <h1 className="text-4xl sm:text-5xl">Get in Touch</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-ivory-deep/85">
            Questions about a temple, a door or a custom piece — reach us directly, or send an
            enquiry below and we'll call you back.
          </p>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-5 lg:gap-16">
          <div className="lg:col-span-2">
            {isLoading ? <SectionSpinner /> : null}
            {isError ? <ErrorNote label="Contact details" /> : null}

            {!isLoading && !isError ? (
              <div className="flex flex-col gap-8">
                {hasAnyContactDetail ? (
                  <ul className="flex flex-col gap-4 text-sm text-charcoal-soft">
                    {contact?.phone ? (
                      <li className="flex items-start gap-3">
                        <Phone className="mt-0.5 h-5 w-5 shrink-0 text-brass" />
                        <a href={`tel:${contact.phone}`} className="hover:text-brass">
                          {contact.phone}
                        </a>
                      </li>
                    ) : null}
                    {contact?.whatsapp ? (
                      <li className="flex items-start gap-3">
                        <MessageCircle className="mt-0.5 h-5 w-5 shrink-0 text-brass" />
                        <a
                          href={`https://wa.me/${toWhatsAppDigits(contact.whatsapp)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-brass"
                        >
                          Chat on WhatsApp
                        </a>
                      </li>
                    ) : null}
                    {contact?.email ? (
                      <li className="flex items-start gap-3">
                        <Mail className="mt-0.5 h-5 w-5 shrink-0 text-brass" />
                        <a href={`mailto:${contact.email}`} className="hover:text-brass">
                          {contact.email}
                        </a>
                      </li>
                    ) : null}
                    {addressLines.length > 0 ? (
                      <li className="flex items-start gap-3">
                        <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brass" />
                        <span>{addressLines.join(', ')}</span>
                      </li>
                    ) : null}
                  </ul>
                ) : (
                  <p className="text-sm text-charcoal-soft">
                    Contact details haven't been added yet — send an enquiry and we'll get back
                    to you directly.
                  </p>
                )}

                <SocialLinksRow links={settings?.socialLinks} tone="light" />

                {contact?.googleMapEmbedUrl ? (
                  <div className="aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] border border-border-warm">
                    <iframe
                      src={contact.googleMapEmbedUrl}
                      title="Our location"
                      className="h-full w-full"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="rounded-[var(--radius-card)] border border-border-warm bg-ivory-deep p-6 sm:p-8 lg:col-span-3">
            <h2 className="text-2xl text-teak">Send an Enquiry</h2>
            <p className="mt-2 text-sm text-charcoal-soft">
              Tell us what you're looking for, and one of our craftsmen's team will call you
              back.
            </p>
            <div className="mt-6">
              <EnquiryForm source="contact" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
