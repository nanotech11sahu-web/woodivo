import type { MediaAsset } from './common';

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
}
