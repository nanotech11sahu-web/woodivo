import type { MediaFolder } from './common';

export interface MediaLibraryAsset {
  publicId: string;
  url: string;
  // Backend derives this from the public_id path segment after `woodivo/`
  // rather than a stored field, so it's typed loosely — a `misc` fallback
  // and any pre-convention upload won't necessarily be a `MediaFolder`.
  folder: MediaFolder | string;
  format: string;
  width?: number;
  height?: number;
  bytes: number;
  createdAt: string;
}

export interface MediaLibraryParams {
  folder?: MediaFolder;
  search?: string;
  cursor?: string;
  limit?: number;
}

export interface MediaLibraryResult {
  items: MediaLibraryAsset[];
  nextCursor: string | null;
  totalCount: number;
}
