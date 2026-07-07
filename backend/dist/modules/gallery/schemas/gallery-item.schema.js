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
exports.GalleryItemSchema = exports.GalleryItem = exports.GalleryItemStatus = exports.GalleryItemType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const media_asset_schema_1 = require("../../../common/schemas/media-asset.schema");
var GalleryItemType;
(function (GalleryItemType) {
    GalleryItemType["IMAGE"] = "image";
    GalleryItemType["VIDEO"] = "video";
})(GalleryItemType || (exports.GalleryItemType = GalleryItemType = {}));
var GalleryItemStatus;
(function (GalleryItemStatus) {
    GalleryItemStatus["ACTIVE"] = "active";
    GalleryItemStatus["INACTIVE"] = "inactive";
})(GalleryItemStatus || (exports.GalleryItemStatus = GalleryItemStatus = {}));
let GalleryItem = class GalleryItem {
    media;
    caption;
    type;
    tags;
    displayOrder;
    status;
    createdAt;
    updatedAt;
};
exports.GalleryItem = GalleryItem;
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: media_asset_schema_1.MediaAssetSchema }),
    __metadata("design:type", media_asset_schema_1.MediaAsset)
], GalleryItem.prototype, "media", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, maxlength: 150 }),
    __metadata("design:type", String)
], GalleryItem.prototype, "caption", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: GalleryItemType,
        default: GalleryItemType.IMAGE,
        index: true,
    }),
    __metadata("design:type", String)
], GalleryItem.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [], index: true }),
    __metadata("design:type", Array)
], GalleryItem.prototype, "tags", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], GalleryItem.prototype, "displayOrder", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: GalleryItemStatus,
        default: GalleryItemStatus.ACTIVE,
        index: true,
    }),
    __metadata("design:type", String)
], GalleryItem.prototype, "status", void 0);
exports.GalleryItem = GalleryItem = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], GalleryItem);
exports.GalleryItemSchema = mongoose_1.SchemaFactory.createForClass(GalleryItem);
exports.GalleryItemSchema.index({ displayOrder: 1 });
//# sourceMappingURL=gallery-item.schema.js.map