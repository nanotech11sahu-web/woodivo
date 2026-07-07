import type { EntityStatus, MediaAsset } from './common';

export type GalleryItemStatus = EntityStatus;
export type GalleryItemType = 'image' | 'video';

export interface GalleryItem {
  _id: string;
  media: MediaAsset;
  caption?: string;
  type: GalleryItemType;
  tags: string[];
  displayOrder: number;
  status: GalleryItemStatus;
  createdAt: string;
  updatedAt: string;
}

export interface GalleryItemListParams {
  page?: number;
  limit?: number;
  status?: GalleryItemStatus;
  type?: GalleryItemType;
  tag?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface GalleryItemPayload {
  media?: MediaAsset;
  caption?: string;
  type?: GalleryItemType;
  tags?: string[];
  displayOrder?: number;
  status?: GalleryItemStatus;
}
