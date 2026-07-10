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
  PRODUCTS = 'products',
  GALLERY = 'gallery',
  BLOGS = 'blogs',
  BANNERS = 'banners',
  TESTIMONIALS = 'testimonials',
  SETTINGS = 'settings',
  ABOUT = 'about',
  ENQUIRIES = 'enquiries',
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
