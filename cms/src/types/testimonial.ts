import type { EntityStatus, MediaAsset } from './common';

export type TestimonialStatus = EntityStatus;

export interface Testimonial {
  _id: string;
  clientName: string;
  clientLocation?: string;
  projectType?: string;
  clientPhoto?: MediaAsset;
  testimonialText: string;
  rating?: number;
  isFeatured: boolean;
  displayOrder: number;
  status: TestimonialStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TestimonialListParams {
  page?: number;
  limit?: number;
  status?: TestimonialStatus;
  isFeatured?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface TestimonialPayload {
  clientName: string;
  clientLocation?: string;
  projectType?: string;
  clientPhoto?: MediaAsset;
  testimonialText: string;
  rating?: number;
  isFeatured: boolean;
  displayOrder?: number;
  status: TestimonialStatus;
}
