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
exports.SocialLinksSchema = exports.SocialLinks = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let SocialLinks = class SocialLinks {
    facebook;
    instagram;
    youtube;
    pinterest;
    linkedin;
    twitter;
};
exports.SocialLinks = SocialLinks;
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], SocialLinks.prototype, "facebook", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], SocialLinks.prototype, "instagram", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], SocialLinks.prototype, "youtube", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], SocialLinks.prototype, "pinterest", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], SocialLinks.prototype, "linkedin", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], SocialLinks.prototype, "twitter", void 0);
exports.SocialLinks = SocialLinks = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], SocialLinks);
exports.SocialLinksSchema = mongoose_1.SchemaFactory.createForClass(SocialLinks);
//# sourceMappingURL=social-links.schema.js.map