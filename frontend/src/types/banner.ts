import type { MediaAsset } from './common';

export type BannerPlacement =
  | 'hero'
  | 'category'
  | 'product'
  | 'blog'
  | 'contact'
  | 'about';

export interface Banner {
  _id: string;
  title: string;
  subtitle?: string;
  desktopImage: MediaAsset;
  mobileImage?: MediaAsset;
  ctaLabel?: string;
  ctaLink?: string;
  placement: BannerPlacement;
  displayOrder: number;
}
