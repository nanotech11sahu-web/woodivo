import type { EntityStatus, MediaAsset } from './common';

export type BannerStatus = EntityStatus;

export type BannerPlacement =
  | 'hero'
  | 'category'
  | 'product'
  | 'blog'
  | 'contact'
  | 'about'
  | 'projects';

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
  status: BannerStatus;
  createdAt: string;
  updatedAt: string;
}

export interface BannerListParams {
  page?: number;
  limit?: number;
  status?: BannerStatus;
  placement?: BannerPlacement;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface BannerPayload {
  title: string;
  subtitle?: string;
  desktopImage?: MediaAsset;
  mobileImage?: MediaAsset;
  ctaLabel?: string;
  ctaLink?: string;
  placement?: BannerPlacement;
  displayOrder?: number;
  status: BannerStatus;
}
