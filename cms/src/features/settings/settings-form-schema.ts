import { z } from 'zod';
import { HOMEPAGE_HIGHLIGHT_ICON_OPTIONS, type HomepageHighlightIconValue } from '@/lib/homepage-icons';

// Matches ContactInfoDto: IsOptional/IsString only, no format validation on the
// backend — phone/pincode etc. stay plain strings here too. Email gets a client-side
// format check anyway since it's the one field where a typo is easy to make and
// costly (bounces, missed leads), same reasoning as the login form's email field.
const contactSchema = z.object({
  phone: z.string().optional().or(z.literal('')),
  whatsapp: z.string().optional().or(z.literal('')),
  email: z.string().email('Enter a valid email address').optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  state: z.string().optional().or(z.literal('')),
  pincode: z.string().optional().or(z.literal('')),
  googleMapEmbedUrl: z.string().optional().or(z.literal('')),
});

// Matches SocialLinksDto — free-text strings, no url() check, consistent with
// how banner.ctaLink is handled elsewhere (relative paths are valid too).
const socialLinksSchema = z.object({
  facebook: z.string().optional().or(z.literal('')),
  instagram: z.string().optional().or(z.literal('')),
  youtube: z.string().optional().or(z.literal('')),
  pinterest: z.string().optional().or(z.literal('')),
  linkedin: z.string().optional().or(z.literal('')),
  twitter: z.string().optional().or(z.literal('')),
});

// Matches FooterSettingsDto: aboutText has the schema's 500-char maxlength,
// copyrightText has none on the backend either.
const footerSchema = z.object({
  aboutText: z.string().max(500, 'Keep it under 500 characters').optional().or(z.literal('')),
  copyrightText: z.string().optional().or(z.literal('')),
});

// Matches HomepageHighlightDto: `icon` is a required enum (validated
// server-side via `IsEnum`), title/description are required free text
// capped at the same 80/200-char limits as the schema's `maxlength`.
const iconValues = HOMEPAGE_HIGHLIGHT_ICON_OPTIONS.map((option) => option.value) as [
  HomepageHighlightIconValue,
  ...HomepageHighlightIconValue[],
];

const homepageHighlightSchema = z.object({
  icon: z.enum(iconValues),
  title: z.string().trim().min(1, 'Title is required').max(80),
  description: z.string().trim().min(1, 'Description is required').max(200),
});

const homepageSchema = z.object({
  whyWoodivoPoints: z.array(homepageHighlightSchema),
});

export const settingsFormSchema = z.object({
  siteName: z.string().trim().max(80).optional().or(z.literal('')),
  tagline: z.string().trim().max(200).optional().or(z.literal('')),
  contact: contactSchema,
  socialLinks: socialLinksSchema,
  footer: footerSchema,
  homepage: homepageSchema,
  googleAnalyticsId: z.string().max(500).optional().or(z.literal('')),
  facebookPixelId: z.string().max(500).optional().or(z.literal('')),
});

export type SettingsFormValues = z.infer<typeof settingsFormSchema>;

export const SETTINGS_FORM_DEFAULTS: SettingsFormValues = {
  siteName: '',
  tagline: '',
  contact: {
    phone: '',
    whatsapp: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    googleMapEmbedUrl: '',
  },
  socialLinks: {
    facebook: '',
    instagram: '',
    youtube: '',
    pinterest: '',
    linkedin: '',
    twitter: '',
  },
  footer: {
    aboutText: '',
    copyrightText: '',
  },
  homepage: {
    whyWoodivoPoints: [],
  },
  googleAnalyticsId: '',
  facebookPixelId: '',
};
