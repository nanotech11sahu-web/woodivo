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
exports.CategorySchema = exports.Category = exports.CategoryStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const media_asset_schema_1 = require("../../../common/schemas/media-asset.schema");
const slugify_1 = require("../../../common/utils/slugify");
var CategoryStatus;
(function (CategoryStatus) {
    CategoryStatus["ACTIVE"] = "active";
    CategoryStatus["INACTIVE"] = "inactive";
})(CategoryStatus || (exports.CategoryStatus = CategoryStatus = {}));
let Category = class Category {
    name;
    slug;
    banner;
    thumbnail;
    description;
    displayOrder;
    status;
    isFeatured;
    createdAt;
    updatedAt;
};
exports.Category = Category;
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true, maxlength: 120 }),
    __metadata("design:type", String)
], Category.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        index: true,
    }),
    __metadata("design:type", String)
], Category.prototype, "slug", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: media_asset_schema_1.MediaAssetSchema }),
    __metadata("design:type", media_asset_schema_1.MediaAsset)
], Category.prototype, "banner", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: media_asset_schema_1.MediaAssetSchema }),
    __metadata("design:type", media_asset_schema_1.MediaAsset)
], Category.prototype, "thumbnail", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], Category.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Category.prototype, "displayOrder", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: CategoryStatus,
        default: CategoryStatus.ACTIVE,
        index: true,
    }),
    __metadata("design:type", String)
], Category.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Category.prototype, "isFeatured", void 0);
exports.Category = Category = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Category);
exports.CategorySchema = mongoose_1.SchemaFactory.createForClass(Category);
exports.CategorySchema.index({ displayOrder: 1 });
exports.CategorySchema.pre('save', function () {
    if (this.isModified('name') && !this.slug) {
        this.slug = (0, slugify_1.slugify)(this.name);
    }
    else if (this.isModified('slug') && this.slug) {
        this.slug = (0, slugify_1.slugify)(this.slug);
    }
});
//# sourceMappingURL=category.schema.js.map