export const API_PREFIX = 'api/v1';

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  EDITOR = 'editor',
}

export enum ContentStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  SCHEDULED = 'scheduled',
  ARCHIVED = 'archived',
}

export enum MediaFolder {
  CATEGORIES = 'categories',
  SUBCATEGORIES = 'subcategories',
  PRODUCTS = 'products',
  GALLERY = 'gallery',
  CUSTOMIZATIONS = 'customizations',
  BLOGS = 'blogs',
  BANNERS = 'banners',
  TESTIMONIALS = 'testimonials',
  SETTINGS = 'settings',
  ABOUT = 'about',
  ENQUIRIES = 'enquiries',
  CUSTOM_POSTS = 'custom-posts',
  MISC = 'misc',
}

export const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
export const MAX_FILES_PER_UPLOAD = 10;
export const MAX_CUSTOM_ORDER_IMAGES = 4;
export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
];

// Single-video uploads only (Custom Posts "Post as Reel" flow) - larger cap
// than images since Reels are commonly 10-60s of compressed video.
export const MAX_VIDEO_UPLOAD_SIZE_BYTES = 100 * 1024 * 1024; // 100MB
export const ALLOWED_VIDEO_MIME_TYPES = ['video/mp4', 'video/quicktime'];
