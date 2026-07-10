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
exports.SeoEntrySchema = exports.SeoEntry = exports.ENTITY_PAGE_TYPES = exports.SeoPageType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var SeoPageType;
(function (SeoPageType) {
    SeoPageType["HOME"] = "home";
    SeoPageType["ABOUT"] = "about";
    SeoPageType["CONTACT"] = "contact";
    SeoPageType["GALLERY"] = "gallery";
    SeoPageType["PROJECTS_LISTING"] = "projects-listing";
    SeoPageType["BLOGS_LISTING"] = "blogs-listing";
    SeoPageType["PRODUCT"] = "product";
    SeoPageType["BLOG"] = "blog";
    SeoPageType["CATEGORY"] = "category";
    SeoPageType["PROJECT"] = "project";
    SeoPageType["CUSTOM"] = "custom";
})(SeoPageType || (exports.SeoPageType = SeoPageType = {}));
exports.ENTITY_PAGE_TYPES = [
    SeoPageType.PRODUCT,
    SeoPageType.BLOG,
    SeoPageType.CATEGORY,
    SeoPageType.PROJECT,
];
let SeoEntry = class SeoEntry {
    path;
    pageType;
    entityId;
    entityLabel;
    metaTitle;
    metaDescription;
    metaKeywords;
    ogImage;
    canonicalUrl;
    createdAt;
    updatedAt;
};
exports.SeoEntry = SeoEntry;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true, trim: true, index: true }),
    __metadata("design:type", String)
], SeoEntry.prototype, "path", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: SeoPageType, required: true, index: true }),
    __metadata("design:type", String)
], SeoEntry.prototype, "pageType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], SeoEntry.prototype, "entityId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], SeoEntry.prototype, "entityLabel", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, maxlength: 70 }),
    __metadata("design:type", String)
], SeoEntry.prototype, "metaTitle", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, maxlength: 160 }),
    __metadata("design:type", String)
], SeoEntry.prototype, "metaDescription", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], SeoEntry.prototype, "metaKeywords", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], SeoEntry.prototype, "ogImage", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], SeoEntry.prototype, "canonicalUrl", void 0);
exports.SeoEntry = SeoEntry = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], SeoEntry);
exports.SeoEntrySchema = mongoose_1.SchemaFactory.createForClass(SeoEntry);
exports.SeoEntrySchema.index({ entityId: 1, pageType: 1 });
//# sourceMappingURL=seo-entry.schema.js.map