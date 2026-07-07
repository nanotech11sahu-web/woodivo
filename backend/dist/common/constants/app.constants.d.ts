export declare const API_PREFIX = "api/v1";
export declare enum UserRole {
    SUPER_ADMIN = "super_admin",
    ADMIN = "admin",
    EDITOR = "editor"
}
export declare enum ContentStatus {
    DRAFT = "draft",
    PUBLISHED = "published",
    SCHEDULED = "scheduled",
    ARCHIVED = "archived"
}
export declare enum MediaFolder {
    CATEGORIES = "categories",
    PRODUCTS = "products",
    PROJECTS = "projects",
    GALLERY = "gallery",
    BLOGS = "blogs",
    BANNERS = "banners",
    TESTIMONIALS = "testimonials",
    SETTINGS = "settings",
    ABOUT = "about",
    MISC = "misc"
}
export declare const MAX_UPLOAD_SIZE_BYTES: number;
export declare const MAX_FILES_PER_UPLOAD = 10;
export declare const ALLOWED_IMAGE_MIME_TYPES: string[];
