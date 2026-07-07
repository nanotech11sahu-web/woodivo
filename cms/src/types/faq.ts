import type { EntityStatus } from './common';

export type FaqStatus = EntityStatus;

export interface Faq {
  _id: string;
  question: string;
  answer: string;
  group?: string;
  displayOrder: number;
  status: FaqStatus;
  createdAt: string;
  updatedAt: string;
}

export interface FaqListParams {
  page?: number;
  limit?: number;
  status?: FaqStatus;
  group?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FaqPayload {
  question: string;
  answer: string;
  group?: string;
  displayOrder?: number;
  status: FaqStatus;
}
