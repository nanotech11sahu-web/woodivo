"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlogSchema = exports.Blog = exports.BlogFaqItemSchema = exports.BlogFaqItem = exports.BlogCategorySchema = exports.BlogCategory = exports.BlogStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const media_asset_schema_1 = require("../../../common/schemas/media-asset.schema");
const slugify_1 = require("../../../common/utils/slugify");
var BlogStatus;
(function (BlogStatus) {
    BlogStatus["DRAFT"] = "draft";
    BlogStatus["PUBLISHED"] = "published";
    BlogStatus["SCHEDULED"] = "scheduled";
    BlogStatus["ARCHIVED"] = "archived";
})(BlogStatus || (exports.BlogStatus = BlogStatus = {}));
let BlogCategory = class BlogCategory {
    name;
    slug;
    displayOrder;
};
exports.BlogCategory = BlogCategory;
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true, maxlength: 100 }),
    __metadata("design:type", String)
], BlogCategory.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        index: true,
    }),
    __metadata("design:type", String)
], BlogCategory.prototype, "slug", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], BlogCategory.prototype, "displayOrder", void 0);
exports.BlogCategory = BlogCategory = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], BlogCategory);
exports.BlogCategorySchema = mongoose_1.SchemaFactory.createForClass(BlogCategory);
exports.BlogCategorySchema.pre('save', function () {
    if (this.isModified('name') && !this.slug) {
        this.slug = (0, slugify_1.slugify)(this.name);
    }
    else if (this.isModified('slug') && this.slug) {
        this.slug = (0, slugify_1.slugify)(this.slug);
    }
});
let BlogFaqItem = class BlogFaqItem {
    question;
    answer;
};
exports.BlogFaqItem = BlogFaqItem;
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true, maxlength: 300 }),
    __metadata("design:type", String)
], BlogFaqItem.prototype, "question", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], BlogFaqItem.prototype, "answer", void 0);
exports.BlogFaqItem = BlogFaqItem = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], BlogFaqItem);
exports.BlogFaqItemSchema = mongoose_1.SchemaFactory.createForClass(BlogFaqItem);
let Blog = class Blog {
    title;
    slug;
    excerpt;
    content;
    featuredImage;
    images;
    faqs;
    category;
    tags;
    status;
    publishAt;
    isFeatured;
    authorName;
    viewCount;
    createdAt;
    updatedAt;
};
exports.Blog = Blog;
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true, maxlength: 200 }),
    __metadata("design:type", String)
], Blog.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        index: true,
    }),
    __metadata("design:type", String)
], Blog.prototype, "slug", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, maxlength: 300 }),
    __metadata("design:type", String)
], Blog.prototype, "excerpt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Blog.prototype, "content", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: media_asset_schema_1.MediaAssetSchema }),
    __metadata("design:type", media_asset_schema_1.MediaAsset)
], Blog.prototype, "featuredImage", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [media_asset_schema_1.MediaAssetSchema], default: [] }),
    __metadata("design:type", Array)
], Blog.prototype, "images", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [exports.BlogFaqItemSchema], default: [] }),
    __metadata("design:type", Array)
], Blog.prototype, "faqs", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, ref: BlogCategory.name, index: true }),
    __metadata("design:type", String)
], Blog.prototype, "category", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Blog.prototype, "tags", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: BlogStatus,
        default: BlogStatus.DRAFT,
        index: true,
    }),
    __metadata("design:type", String)
], Blog.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ index: true }),
    __metadata("design:type", Date)
], Blog.prototype, "publishAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Blog.prototype, "isFeatured", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, maxlength: 100 }),
    __metadata("design:type", String)
], Blog.prototype, "authorName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Blog.prototype, "viewCount", void 0);
exports.Blog = Blog = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Blog);
exports.BlogSchema = mongoose_1.SchemaFactory.createForClass(Blog);
exports.BlogSchema.index({ status: 1, publishAt: -1 });
exports.BlogSchema.index({ title: 'text', excerpt: 'text', tags: 'text' });
exports.BlogSchema.pre('save', function () {
    if (this.isModified('title') && !this.slug) {
        this.slug = (0, slugify_1.slugify)(this.title);
    }
    else if (this.isModified('slug') && this.slug) {
        this.slug = (0, slugify_1.slugify)(this.slug);
    }
});
//# sourceMappingURL=blog.schema.js.map