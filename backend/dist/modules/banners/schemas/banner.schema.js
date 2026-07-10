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
exports.BannerSchema = exports.Banner = exports.BannerPlacement = exports.BannerStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const media_asset_schema_1 = require("../../../common/schemas/media-asset.schema");
var BannerStatus;
(function (BannerStatus) {
    BannerStatus["ACTIVE"] = "active";
    BannerStatus["INACTIVE"] = "inactive";
})(BannerStatus || (exports.BannerStatus = BannerStatus = {}));
var BannerPlacement;
(function (BannerPlacement) {
    BannerPlacement["HERO"] = "hero";
    BannerPlacement["CATEGORY"] = "category";
    BannerPlacement["PRODUCT"] = "product";
    BannerPlacement["BLOG"] = "blog";
    BannerPlacement["CONTACT"] = "contact";
    BannerPlacement["ABOUT"] = "about";
    BannerPlacement["PROJECTS"] = "projects";
})(BannerPlacement || (exports.BannerPlacement = BannerPlacement = {}));
let Banner = class Banner {
    title;
    subtitle;
    desktopImage;
    mobileImage;
    ctaLabel;
    ctaLink;
    placement;
    displayOrder;
    status;
    createdAt;
    updatedAt;
};
exports.Banner = Banner;
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true, maxlength: 150 }),
    __metadata("design:type", String)
], Banner.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, maxlength: 300 }),
    __metadata("design:type", String)
], Banner.prototype, "subtitle", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: media_asset_schema_1.MediaAssetSchema }),
    __metadata("design:type", media_asset_schema_1.MediaAsset)
], Banner.prototype, "desktopImage", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: media_asset_schema_1.MediaAssetSchema }),
    __metadata("design:type", media_asset_schema_1.MediaAsset)
], Banner.prototype, "mobileImage", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], Banner.prototype, "ctaLabel", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], Banner.prototype, "ctaLink", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: BannerPlacement,
        default: BannerPlacement.HERO,
        index: true,
    }),
    __metadata("design:type", String)
], Banner.prototype, "placement", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Banner.prototype, "displayOrder", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: BannerStatus,
        default: BannerStatus.ACTIVE,
        index: true,
    }),
    __metadata("design:type", String)
], Banner.prototype, "status", void 0);
exports.Banner = Banner = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Banner);
exports.BannerSchema = mongoose_1.SchemaFactory.createForClass(Banner);
exports.BannerSchema.index({ placement: 1, displayOrder: 1 });
//# sourceMappingURL=banner.schema.js.map