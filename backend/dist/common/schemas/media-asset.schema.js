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
exports.MediaAssetSchema = exports.MediaAsset = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let MediaAsset = class MediaAsset {
    url;
    publicId;
    alt;
    width;
    height;
};
exports.MediaAsset = MediaAsset;
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], MediaAsset.prototype, "url", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], MediaAsset.prototype, "publicId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, default: '' }),
    __metadata("design:type", String)
], MediaAsset.prototype, "alt", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], MediaAsset.prototype, "width", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], MediaAsset.prototype, "height", void 0);
exports.MediaAsset = MediaAsset = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], MediaAsset);
exports.MediaAssetSchema = mongoose_1.SchemaFactory.createForClass(MediaAsset);
//# sourceMappingURL=media-asset.schema.js.map