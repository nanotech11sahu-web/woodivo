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
exports.TestimonialSchema = exports.Testimonial = exports.TestimonialStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const media_asset_schema_1 = require("../../../common/schemas/media-asset.schema");
var TestimonialStatus;
(function (TestimonialStatus) {
    TestimonialStatus["ACTIVE"] = "active";
    TestimonialStatus["INACTIVE"] = "inactive";
})(TestimonialStatus || (exports.TestimonialStatus = TestimonialStatus = {}));
let Testimonial = class Testimonial {
    clientName;
    clientLocation;
    projectType;
    clientPhoto;
    testimonialText;
    rating;
    isFeatured;
    displayOrder;
    status;
    createdAt;
    updatedAt;
};
exports.Testimonial = Testimonial;
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true, maxlength: 120 }),
    __metadata("design:type", String)
], Testimonial.prototype, "clientName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, maxlength: 100 }),
    __metadata("design:type", String)
], Testimonial.prototype, "clientLocation", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, maxlength: 80 }),
    __metadata("design:type", String)
], Testimonial.prototype, "projectType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: media_asset_schema_1.MediaAssetSchema }),
    __metadata("design:type", media_asset_schema_1.MediaAsset)
], Testimonial.prototype, "clientPhoto", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true, maxlength: 1200 }),
    __metadata("design:type", String)
], Testimonial.prototype, "testimonialText", void 0);
__decorate([
    (0, mongoose_1.Prop)({ min: 1, max: 5 }),
    __metadata("design:type", Number)
], Testimonial.prototype, "rating", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Testimonial.prototype, "isFeatured", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Testimonial.prototype, "displayOrder", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: TestimonialStatus,
        default: TestimonialStatus.ACTIVE,
        index: true,
    }),
    __metadata("design:type", String)
], Testimonial.prototype, "status", void 0);
exports.Testimonial = Testimonial = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Testimonial);
exports.TestimonialSchema = mongoose_1.SchemaFactory.createForClass(Testimonial);
exports.TestimonialSchema.index({ displayOrder: 1 });
//# sourceMappingURL=testimonial.schema.js.map