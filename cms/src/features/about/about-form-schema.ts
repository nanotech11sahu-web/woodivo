import { z } from 'zod';

const valueItemSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(80),
  description: z.string().trim().min(1, 'Description is required').max(300),
});

const milestoneSchema = z.object({
  year: z.string().trim().min(1, 'Year is required').max(20),
  title: z.string().trim().min(1, 'Title is required').max(100),
  description: z.string().trim().max(300).optional().or(z.literal('')),
});

const teamMemberSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  role: z.string().trim().min(1, 'Role is required').max(100),
  bio: z.string().trim().max(400).optional().or(z.literal('')),
});

export const aboutFormSchema = z.object({
  heroTitle: z.string().trim().max(150).optional().or(z.literal('')),
  heroSubtitle: z.string().trim().max(300).optional().or(z.literal('')),
  storyTitle: z.string().trim().max(150).optional().or(z.literal('')),
  storyContent: z.string().trim().max(4000).optional().or(z.literal('')),
  missionText: z.string().trim().max(2000).optional().or(z.literal('')),
  visionText: z.string().trim().max(2000).optional().or(z.literal('')),
  values: z.array(valueItemSchema),
  milestones: z.array(milestoneSchema),
  teamTitle: z.string().trim().max(150).optional().or(z.literal('')),
  teamSubtitle: z.string().trim().max(300).optional().or(z.literal('')),
  teamMembers: z.array(teamMemberSchema),
  ctaTitle: z.string().trim().max(150).optional().or(z.literal('')),
  ctaText: z.string().trim().max(300).optional().or(z.literal('')),
});

export type AboutFormValues = z.infer<typeof aboutFormSchema>;

export const ABOUT_FORM_DEFAULTS: AboutFormValues = {
  heroTitle: '',
  heroSubtitle: '',
  storyTitle: '',
  storyContent: '',
  missionText: '',
  visionText: '',
  values: [],
  milestones: [],
  teamTitle: '',
  teamSubtitle: '',
  teamMembers: [],
  ctaTitle: '',
  ctaText: '',
};
