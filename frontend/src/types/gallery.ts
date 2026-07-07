import type { MediaAsset } from './common';

export type GalleryItemType = 'image' | 'video';

export interface GalleryItem {
  _id: string;
  media: MediaAsset;
  caption?: string;
  type: GalleryItemType;
  tags: string[];
  displayOrder: number;
}

export interface QueryPublicGalleryParams {
  page?: number;
  limit?: number;
  type?: GalleryItemType;
  tag?: string;
}
