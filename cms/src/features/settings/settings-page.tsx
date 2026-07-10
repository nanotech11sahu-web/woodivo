import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PageHeader } from '@/components/shared/page-header';
import { ImageUploader } from '@/components/shared/image-uploader';
import { SeoManageNote } from '@/components/shared/seo-manage-note';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';
import { toast } from '@/lib/toast';
import { getErrorMessage } from '@/lib/http-error';
import { useUpdateWebsiteSettings, useWebsiteSettings } from './settings-api';
import { HomepageHighlightsEditor } from './homepage-highlights-editor';
import {
  settingsFormSchema,
  SETTINGS_FORM_DEFAULTS,
  type SettingsFormValues,
} from './settings-form-schema';
import type { MediaAsset } from '@/types/common';

/** Blank strings round-trip fine (every field is IsOptional/IsString on the backend),
 * but sending `undefined` keeps the payload clean and matches how the rest of the
 * app treats empty optional inputs (see banner-form-page's `|| undefined`). */
function orUndefined(value: string | undefined): string | undefined {
  return value ? value : undefined;
}

export function SettingsPage() {
  const { data: settings, isLoading } = useWebsiteSettings();
  const updateSettings = useUpdateWebsiteSettings();

  const [logo, setLogo] = useState<MediaAsset | undefined>();
  const [favicon, setFavicon] = useState<MediaAsset | undefined>();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: SETTINGS_FORM_DEFAULTS,
  });

  useEffect(() => {
    if (!settings) return;
    reset({
      siteName: settings.siteName ?? '',
      tagline: settings.tagline ?? '',
      contact: {
        phone: settings.contact?.phone ?? '',
        whatsapp: settings.contact?.whatsapp ?? '',
        email: settings.contact?.email ?? '',
        address: settings.contact?.address ?? '',
        city: settings.contact?.city ?? '',
        state: settings.contact?.state ?? '',
        pincode: settings.contact?.pincode ?? '',
        googleMapEmbedUrl: settings.contact?.googleMapEmbedUrl ?? '',
      },
      socialLinks: {
        facebook: settings.socialLinks?.facebook ?? '',
        instagram: settings.socialLinks?.instagram ?? '',
        youtube: settings.socialLinks?.youtube ?? '',
        pinterest: settings.socialLinks?.pinterest ?? '',
        linkedin: settings.socialLinks?.linkedin ?? '',
        twitter: settings.socialLinks?.twitter ?? '',
      },
      footer: {
        aboutText: settings.footer?.aboutText ?? '',
        copyrightText: settings.footer?.copyrightText ?? '',
      },
      homepage: {
        whyWoodivoPoints: settings.homepage?.whyWoodivoPoints ?? [],
      },
      googleAnalyticsId: settings.googleAnalyticsId ?? '',
      facebookPixelId: settings.facebookPixelId ?? '',
    });
    setLogo(settings.logo);
    setFavicon(settings.favicon);
  }, [settings, reset]);

  async function onSubmit(values: SettingsFormValues) {
    const payload = {
      siteName: orUndefined(values.siteName),
      tagline: orUndefined(values.tagline),
      logo,
      favicon,
      contact: {
        phone: orUndefined(values.contact.phone),
        whatsapp: orUndefined(values.contact.whatsapp),
        email: orUndefined(values.contact.email),
        address: orUndefined(values.contact.address),
        city: orUndefined(values.contact.city),
        state: orUndefined(values.contact.state),
        pincode: orUndefined(values.contact.pincode),
        googleMapEmbedUrl: orUndefined(values.contact.googleMapEmbedUrl),
      },
      socialLinks: {
        facebook: orUndefined(values.socialLinks.facebook),
        instagram: orUndefined(values.socialLinks.instagram),
        youtube: orUndefined(values.socialLinks.youtube),
        pinterest: orUndefined(values.socialLinks.pinterest),
        linkedin: orUndefined(values.socialLinks.linkedin),
        twitter: orUndefined(values.socialLinks.twitter),
      },
      footer: {
        aboutText: orUndefined(values.footer.aboutText),
        copyrightText: orUndefined(values.footer.copyrightText),
      },
      homepage: {
        whyWoodivoPoints: values.homepage.whyWoodivoPoints,
      },
      googleAnalyticsId: orUndefined(values.googleAnalyticsId),
      facebookPixelId: orUndefined(values.facebookPixelId),
    };

    try {
      await updateSettings.mutateAsync(payload);
      toast.success('Settings saved');
    } catch (error) {
      toast.error("Couldn't save settings", getErrorMessage(error));
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Website Settings"
        description="Site identity, contact details, social links and footer content shown across the public site."
      />

      <form onSubmit={(event) => void handleSubmit(onSubmit)(event)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>General</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="siteName">Site name</Label>
                <Input id="siteName" className="mt-1.5" {...register('siteName')} />
                {errors.siteName && (
                  <p className="mt-1 text-xs text-rust">{errors.siteName.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="tagline">Tagline</Label>
                <Input id="tagline" className="mt-1.5" {...register('tagline')} />
                {errors.tagline && (
                  <p className="mt-1 text-xs text-rust">{errors.tagline.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ImageUploader label="Logo" value={logo} onChange={setLogo} folder="settings" />
              <ImageUploader
                label="Favicon"
                value={favicon}
                onChange={setFavicon}
                folder="settings"
                hint="Square image works best."
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="contact.phone">Phone</Label>
                <Input id="contact.phone" className="mt-1.5" {...register('contact.phone')} />
              </div>
              <div>
                <Label htmlFor="contact.whatsapp">WhatsApp</Label>
                <Input
                  id="contact.whatsapp"
                  className="mt-1.5"
                  {...register('contact.whatsapp')}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="contact.email">Email</Label>
              <Input id="contact.email" className="mt-1.5" {...register('contact.email')} />
              {errors.contact?.email && (
                <p className="mt-1 text-xs text-rust">{errors.contact.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="contact.address">Address</Label>
              <Textarea
                id="contact.address"
                className="mt-1.5"
                rows={2}
                {...register('contact.address')}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="contact.city">City</Label>
                <Input id="contact.city" className="mt-1.5" {...register('contact.city')} />
              </div>
              <div>
                <Label htmlFor="contact.state">State</Label>
                <Input id="contact.state" className="mt-1.5" {...register('contact.state')} />
              </div>
              <div>
                <Label htmlFor="contact.pincode">Pincode</Label>
                <Input
                  id="contact.pincode"
                  className="mt-1.5"
                  {...register('contact.pincode')}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="contact.googleMapEmbedUrl">Google Maps embed URL</Label>
              <Input
                id="contact.googleMapEmbedUrl"
                className="mt-1.5"
                placeholder="https://www.google.com/maps/embed?..."
                {...register('contact.googleMapEmbedUrl')}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Social Links</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="socialLinks.facebook">Facebook</Label>
              <Input
                id="socialLinks.facebook"
                className="mt-1.5"
                {...register('socialLinks.facebook')}
              />
            </div>
            <div>
              <Label htmlFor="socialLinks.instagram">Instagram</Label>
              <Input
                id="socialLinks.instagram"
                className="mt-1.5"
                {...register('socialLinks.instagram')}
              />
            </div>
            <div>
              <Label htmlFor="socialLinks.youtube">YouTube</Label>
              <Input
                id="socialLinks.youtube"
                className="mt-1.5"
                {...register('socialLinks.youtube')}
              />
            </div>
            <div>
              <Label htmlFor="socialLinks.pinterest">Pinterest</Label>
              <Input
                id="socialLinks.pinterest"
                className="mt-1.5"
                {...register('socialLinks.pinterest')}
              />
            </div>
            <div>
              <Label htmlFor="socialLinks.linkedin">LinkedIn</Label>
              <Input
                id="socialLinks.linkedin"
                className="mt-1.5"
                {...register('socialLinks.linkedin')}
              />
            </div>
            <div>
              <Label htmlFor="socialLinks.twitter">Twitter / X</Label>
              <Input
                id="socialLinks.twitter"
                className="mt-1.5"
                {...register('socialLinks.twitter')}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Footer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="footer.aboutText">About text</Label>
              <Textarea
                id="footer.aboutText"
                className="mt-1.5"
                rows={3}
                {...register('footer.aboutText')}
              />
              {errors.footer?.aboutText && (
                <p className="mt-1 text-xs text-rust">{errors.footer.aboutText.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="footer.copyrightText">Copyright text</Label>
              <Input
                id="footer.copyrightText"
                className="mt-1.5"
                placeholder="© 2026 Woodivo. All rights reserved."
                {...register('footer.copyrightText')}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Homepage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-ink-muted">
              The "Why Woodivo" highlights shown on the homepage, between Featured Products
              and Testimonials.
            </p>
            <HomepageHighlightsEditor control={control} register={register} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tracking</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
              <Input
                id="googleAnalyticsId"
                className="mt-1.5"
                placeholder="G-XXXXXXXXXX"
                {...register('googleAnalyticsId')}
              />
            </div>
            <div>
              <Label htmlFor="facebookPixelId">Facebook Pixel ID</Label>
              <Input
                id="facebookPixelId"
                className="mt-1.5"
                {...register('facebookPixelId')}
              />
            </div>
          </CardContent>
        </Card>

        <SeoManageNote searchTerm="Home" />

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Spinner className="text-current" />}
            Save changes
          </Button>
        </div>
      </form>
    </div>
  );
}
