export type SocialPostStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'VALIDATING'
  | 'AI_GENERATING'
  | 'MEDIA_PROCESSING'
  | 'PUBLISHING'
  | 'COMPLETED'
  | 'FAILED';

export type SocialPostSourceType = 'PRODUCT' | 'BLOG' | 'OTHER';

export interface SocialPostPlatformResult {
  platform: 'FACEBOOK' | 'INSTAGRAM';
  externalId: string;
  permalink: string | null;
  publishedAt: string;
}

export interface SocialPostSummary {
  id: string;
  reference: string;
  sourceType: SocialPostSourceType;
  sourceId: string | null;
  sourceTitle: string | null;
  status: SocialPostStatus;
  failedStage: string | null;
  failureReason: string | null;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  failedAt: string | null;
  platforms: SocialPostPlatformResult[];
}

export interface SocialHealthResult {
  reachable: boolean;
  detail: unknown;
}
