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
exports.EnquirySchema = exports.Enquiry = exports.EnquirySource = exports.EnquiryStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const category_schema_1 = require("../../categories/schemas/category.schema");
var EnquiryStatus;
(function (EnquiryStatus) {
    EnquiryStatus["NEW"] = "new";
    EnquiryStatus["SEEN"] = "seen";
    EnquiryStatus["CONTACTED"] = "contacted";
    EnquiryStatus["CLOSED"] = "closed";
})(EnquiryStatus || (exports.EnquiryStatus = EnquiryStatus = {}));
var EnquirySource;
(function (EnquirySource) {
    EnquirySource["HOMEPAGE"] = "homepage";
    EnquirySource["PRODUCT"] = "product";
    EnquirySource["CATEGORY"] = "category";
    EnquirySource["PROJECT"] = "project";
    EnquirySource["CONTACT"] = "contact";
    EnquirySource["FLOATING_CTA"] = "floating_cta";
    EnquirySource["ABOUT"] = "about";
})(EnquirySource || (exports.EnquirySource = EnquirySource = {}));
let Enquiry = class Enquiry {
    fullName;
    mobileNumber;
    city;
    interestedCategory;
    message;
    status;
    source;
    notes;
    createdAt;
    updatedAt;
};
exports.Enquiry = Enquiry;
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true, maxlength: 120 }),
    __metadata("design:type", String)
], Enquiry.prototype, "fullName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true, maxlength: 15 }),
    __metadata("design:type", String)
], Enquiry.prototype, "mobileNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, maxlength: 80 }),
    __metadata("design:type", String)
], Enquiry.prototype, "city", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: category_schema_1.Category.name, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Enquiry.prototype, "interestedCategory", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, maxlength: 1000 }),
    __metadata("design:type", String)
], Enquiry.prototype, "message", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: EnquiryStatus,
        default: EnquiryStatus.NEW,
        index: true,
    }),
    __metadata("design:type", String)
], Enquiry.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: EnquirySource, default: EnquirySource.CONTACT }),
    __metadata("design:type", String)
], Enquiry.prototype, "source", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], Enquiry.prototype, "notes", void 0);
exports.Enquiry = Enquiry = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Enquiry);
exports.EnquirySchema = mongoose_1.SchemaFactory.createForClass(Enquiry);
exports.EnquirySchema.index({ createdAt: -1 });
exports.EnquirySchema.index({ mobileNumber: 1 });
//# sourceMappingURL=enquiry.schema.js.map