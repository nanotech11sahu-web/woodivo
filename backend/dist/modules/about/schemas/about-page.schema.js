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
exports.AboutPageSchema = exports.AboutPage = exports.ABOUT_PAGE_SINGLETON_KEY = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const media_asset_schema_1 = require("../../../common/schemas/media-asset.schema");
exports.ABOUT_PAGE_SINGLETON_KEY = 'global';
let ValueItem = class ValueItem {
    title;
    description;
};
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true, maxlength: 80 }),
    __metadata("design:type", String)
], ValueItem.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true, maxlength: 300 }),
    __metadata("design:type", String)
], ValueItem.prototype, "description", void 0);
ValueItem = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], ValueItem);
const ValueItemSchema = mongoose_1.SchemaFactory.createForClass(ValueItem);
let Milestone = class Milestone {
    year;
    title;
    description;
};
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true, maxlength: 20 }),
    __metadata("design:type", String)
], Milestone.prototype, "year", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true, maxlength: 100 }),
    __metadata("design:type", String)
], Milestone.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, maxlength: 300 }),
    __metadata("design:type", String)
], Milestone.prototype, "description", void 0);
Milestone = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], Milestone);
const MilestoneSchema = mongoose_1.SchemaFactory.createForClass(Milestone);
let TeamMember = class TeamMember {
    name;
    role;
    photo;
    bio;
};
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true, maxlength: 100 }),
    __metadata("design:type", String)
], TeamMember.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true, maxlength: 100 }),
    __metadata("design:type", String)
], TeamMember.prototype, "role", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: media_asset_schema_1.MediaAssetSchema }),
    __metadata("design:type", media_asset_schema_1.MediaAsset)
], TeamMember.prototype, "photo", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, maxlength: 400 }),
    __metadata("design:type", String)
], TeamMember.prototype, "bio", void 0);
TeamMember = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], TeamMember);
const TeamMemberSchema = mongoose_1.SchemaFactory.createForClass(TeamMember);
let AboutPage = class AboutPage {
    key;
    heroTitle;
    heroSubtitle;
    heroImage;
    storyTitle;
    storyContent;
    storyImage;
    missionText;
    visionText;
    values;
    milestones;
    teamTitle;
    teamSubtitle;
    teamMembers;
    ctaTitle;
    ctaText;
    createdAt;
    updatedAt;
};
exports.AboutPage = AboutPage;
__decorate([
    (0, mongoose_1.Prop)({ default: exports.ABOUT_PAGE_SINGLETON_KEY, unique: true, index: true }),
    __metadata("design:type", String)
], AboutPage.prototype, "key", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, maxlength: 150 }),
    __metadata("design:type", String)
], AboutPage.prototype, "heroTitle", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, maxlength: 300 }),
    __metadata("design:type", String)
], AboutPage.prototype, "heroSubtitle", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: media_asset_schema_1.MediaAssetSchema }),
    __metadata("design:type", media_asset_schema_1.MediaAsset)
], AboutPage.prototype, "heroImage", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, maxlength: 150 }),
    __metadata("design:type", String)
], AboutPage.prototype, "storyTitle", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, maxlength: 4000 }),
    __metadata("design:type", String)
], AboutPage.prototype, "storyContent", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: media_asset_schema_1.MediaAssetSchema }),
    __metadata("design:type", media_asset_schema_1.MediaAsset)
], AboutPage.prototype, "storyImage", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, maxlength: 2000 }),
    __metadata("design:type", String)
], AboutPage.prototype, "missionText", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, maxlength: 2000 }),
    __metadata("design:type", String)
], AboutPage.prototype, "visionText", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [ValueItemSchema], default: [] }),
    __metadata("design:type", Array)
], AboutPage.prototype, "values", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [MilestoneSchema], default: [] }),
    __metadata("design:type", Array)
], AboutPage.prototype, "milestones", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, maxlength: 150 }),
    __metadata("design:type", String)
], AboutPage.prototype, "teamTitle", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, maxlength: 300 }),
    __metadata("design:type", String)
], AboutPage.prototype, "teamSubtitle", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [TeamMemberSchema], default: [] }),
    __metadata("design:type", Array)
], AboutPage.prototype, "teamMembers", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, maxlength: 150 }),
    __metadata("design:type", String)
], AboutPage.prototype, "ctaTitle", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, maxlength: 300 }),
    __metadata("design:type", String)
], AboutPage.prototype, "ctaText", void 0);
exports.AboutPage = AboutPage = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], AboutPage);
exports.AboutPageSchema = mongoose_1.SchemaFactory.createForClass(AboutPage);
//# sourceMappingURL=about-page.schema.js.map