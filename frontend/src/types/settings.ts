import type { MediaAsset } from './common';

export interface ContactInfo {
  phone?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  googleMapEmbedUrl?: string;
}

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  youtube?: string;
  pinterest?: string;
  linkedin?: string;
  twitter?: string;
}

export interface FooterSettings {
  aboutText?: string;
  copyrightText?: string;
}

// Mirrors backend's HomepageHighlightIcon enum values exactly — this app
// has no shared-types package with the backend (flagged since Phase 8),
// so the string union is kept in sync by hand, same as every other type
// in this file.
export type HomepageHighlightIcon =
  | 'tree-pine'
  | 'ruler'
  | 'hammer'
  | 'truck'
  | 'shield-check'
  | 'award'
  | 'leaf'
  | 'clock'
  | 'thumbs-up'
  | 'pen-tool'
  | 'package'
  | 'users';

export interface HomepageHighlight {
  icon: HomepageHighlightIcon;
  title: string;
  description: string;
}

export interface HomepageSettings {
  whyWoodivoPoints?: HomepageHighlight[];
}

export interface WebsiteSettings {
  siteName?: string;
  tagline?: string;
  logo?: MediaAsset;
  favicon?: MediaAsset;
  contact?: ContactInfo;
  socialLinks?: SocialLinks;
  footer?: FooterSettings;
  homepage?: HomepageSettings;
}
