import type { MediaAsset } from './common';

export interface ValueItem {
  title: string;
  description: string;
}

export interface Milestone {
  year: string;
  title: string;
  description?: string;
}

export interface TeamMember {
  name: string;
  role: string;
  photo?: MediaAsset;
  bio?: string;
}

export interface AboutPage {
  heroTitle?: string;
  heroSubtitle?: string;
  heroImage?: MediaAsset;
  storyTitle?: string;
  storyContent?: string;
  storyImage?: MediaAsset;
  missionText?: string;
  visionText?: string;
  values: ValueItem[];
  milestones: Milestone[];
  teamTitle?: string;
  teamSubtitle?: string;
  teamMembers: TeamMember[];
  ctaTitle?: string;
  ctaText?: string;
}

export type UpdateAboutPagePayload = Partial<AboutPage>;
