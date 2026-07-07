import type { EntityStatus, MediaAsset } from './common';

export type ProjectStatus = EntityStatus;

/** Minimal ref shape — projects point at the same Category collection products use. */
export interface ProjectCategoryRef {
  _id: string;
  name: string;
  slug: string;
}

export interface Project {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  clientName?: string;
  location?: string;
  completionYear?: string;
  category?: ProjectCategoryRef;
  coverImage?: MediaAsset;
  images: MediaAsset[];
  isFeatured: boolean;
  displayOrder: number;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: ProjectStatus;
  category?: string;
  isFeatured?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ProjectPayload {
  title: string;
  slug?: string;
  description?: string;
  clientName?: string;
  location?: string;
  completionYear?: string;
  category?: string;
  coverImage?: MediaAsset;
  images?: MediaAsset[];
  isFeatured: boolean;
  displayOrder?: number;
  status: ProjectStatus;
}
