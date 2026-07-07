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
exports.FaqSchema = exports.Faq = exports.FaqStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
var FaqStatus;
(function (FaqStatus) {
    FaqStatus["ACTIVE"] = "active";
    FaqStatus["INACTIVE"] = "inactive";
})(FaqStatus || (exports.FaqStatus = FaqStatus = {}));
let Faq = class Faq {
    question;
    answer;
    group;
    displayOrder;
    status;
    createdAt;
    updatedAt;
};
exports.Faq = Faq;
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true, maxlength: 300 }),
    __metadata("design:type", String)
], Faq.prototype, "question", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], Faq.prototype, "answer", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, maxlength: 80, index: true }),
    __metadata("design:type", String)
], Faq.prototype, "group", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Faq.prototype, "displayOrder", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: FaqStatus,
        default: FaqStatus.ACTIVE,
        index: true,
    }),
    __metadata("design:type", String)
], Faq.prototype, "status", void 0);
exports.Faq = Faq = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Faq);
exports.FaqSchema = mongoose_1.SchemaFactory.createForClass(Faq);
exports.FaqSchema.index({ displayOrder: 1 });
//# sourceMappingURL=faq.schema.js.map