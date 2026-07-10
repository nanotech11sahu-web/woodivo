"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALLOWED_IMAGE_MIME_TYPES = exports.MAX_CUSTOM_ORDER_IMAGES = exports.MAX_FILES_PER_UPLOAD = exports.MAX_UPLOAD_SIZE_BYTES = exports.MediaFolder = exports.ContentStatus = exports.UserRole = exports.API_PREFIX = void 0;
exports.API_PREFIX = 'api/v1';
var UserRole;
(function (UserRole) {
    UserRole["SUPER_ADMIN"] = "super_admin";
    UserRole["ADMIN"] = "admin";
    UserRole["EDITOR"] = "editor";
})(UserRole || (exports.UserRole = UserRole = {}));
var ContentStatus;
(function (ContentStatus) {
    ContentStatus["DRAFT"] = "draft";
    ContentStatus["PUBLISHED"] = "published";
    ContentStatus["SCHEDULED"] = "scheduled";
    ContentStatus["ARCHIVED"] = "archived";
})(ContentStatus || (exports.ContentStatus = ContentStatus = {}));
var MediaFolder;
(function (MediaFolder) {
    MediaFolder["CATEGORIES"] = "categories";
    MediaFolder["PRODUCTS"] = "products";
    MediaFolder["PROJECTS"] = "projects";
    MediaFolder["GALLERY"] = "gallery";
    MediaFolder["BLOGS"] = "blogs";
    MediaFolder["BANNERS"] = "banners";
    MediaFolder["TESTIMONIALS"] = "testimonials";
    MediaFolder["SETTINGS"] = "settings";
    MediaFolder["ABOUT"] = "about";
    MediaFolder["ENQUIRIES"] = "enquiries";
    MediaFolder["MISC"] = "misc";
})(MediaFolder || (exports.MediaFolder = MediaFolder = {}));
exports.MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024;
exports.MAX_FILES_PER_UPLOAD = 10;
exports.MAX_CUSTOM_ORDER_IMAGES = 4;
exports.ALLOWED_IMAGE_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif',
];
//# sourceMappingURL=app.constants.js.map