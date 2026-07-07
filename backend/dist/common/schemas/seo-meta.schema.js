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
exports.SeoMetaSchema = exports.SeoMeta = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let SeoMeta = class SeoMeta {
    metaTitle;
    metaDescription;
    metaKeywords;
    ogImage;
    canonicalUrl;
};
exports.SeoMeta = SeoMeta;
__decorate([
    (0, mongoose_1.Prop)({ trim: true, maxlength: 70 }),
    __metadata("design:type", String)
], SeoMeta.prototype, "metaTitle", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, maxlength: 160 }),
    __metadata("design:type", String)
], SeoMeta.prototype, "metaDescription", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], SeoMeta.prototype, "metaKeywords", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], SeoMeta.prototype, "ogImage", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], SeoMeta.prototype, "canonicalUrl", void 0);
exports.SeoMeta = SeoMeta = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], SeoMeta);
exports.SeoMetaSchema = mongoose_1.SchemaFactory.createForClass(SeoMeta);
//# sourceMappingURL=seo-meta.schema.js.map