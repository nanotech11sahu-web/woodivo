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
exports.WebsiteSettingsSchema = exports.WebsiteSettings = exports.HomepageHighlightIcon = exports.SETTINGS_SINGLETON_KEY = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const media_asset_schema_1 = require("../../../common/schemas/media-asset.schema");
const social_links_schema_1 = require("../../../common/schemas/social-links.schema");
exports.SETTINGS_SINGLETON_KEY = 'global';
let ContactInfo = class ContactInfo {
    phone;
    whatsapp;
    email;
    address;
    city;
    state;
    pincode;
    googleMapEmbedUrl;
};
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], ContactInfo.prototype, "phone", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], ContactInfo.prototype, "whatsapp", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], ContactInfo.prototype, "email", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], ContactInfo.prototype, "address", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], ContactInfo.prototype, "city", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], ContactInfo.prototype, "state", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], ContactInfo.prototype, "pincode", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], ContactInfo.prototype, "googleMapEmbedUrl", void 0);
ContactInfo = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], ContactInfo);
let FooterSettings = class FooterSettings {
    aboutText;
    copyrightText;
};
__decorate([
    (0, mongoose_1.Prop)({ trim: true, maxlength: 500 }),
    __metadata("design:type", String)
], FooterSettings.prototype, "aboutText", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], FooterSettings.prototype, "copyrightText", void 0);
FooterSettings = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], FooterSettings);
var HomepageHighlightIcon;
(function (HomepageHighlightIcon) {
    HomepageHighlightIcon["TREE_PINE"] = "tree-pine";
    HomepageHighlightIcon["RULER"] = "ruler";
    HomepageHighlightIcon["HAMMER"] = "hammer";
    HomepageHighlightIcon["TRUCK"] = "truck";
    HomepageHighlightIcon["SHIELD_CHECK"] = "shield-check";
    HomepageHighlightIcon["AWARD"] = "award";
    HomepageHighlightIcon["LEAF"] = "leaf";
    HomepageHighlightIcon["CLOCK"] = "clock";
    HomepageHighlightIcon["THUMBS_UP"] = "thumbs-up";
    HomepageHighlightIcon["PEN_TOOL"] = "pen-tool";
    HomepageHighlightIcon["PACKAGE"] = "package";
    HomepageHighlightIcon["USERS"] = "users";
})(HomepageHighlightIcon || (exports.HomepageHighlightIcon = HomepageHighlightIcon = {}));
let HomepageHighlight = class HomepageHighlight {
    icon;
    title;
    description;
};
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: HomepageHighlightIcon, required: true }),
    __metadata("design:type", String)
], HomepageHighlight.prototype, "icon", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true, maxlength: 80 }),
    __metadata("design:type", String)
], HomepageHighlight.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true, maxlength: 200 }),
    __metadata("design:type", String)
], HomepageHighlight.prototype, "description", void 0);
HomepageHighlight = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], HomepageHighlight);
const HomepageHighlightSchema = mongoose_1.SchemaFactory.createForClass(HomepageHighlight);
let HomepageSettings = class HomepageSettings {
    whyWoodivoPoints;
};
__decorate([
    (0, mongoose_1.Prop)({ type: [HomepageHighlightSchema], default: [] }),
    __metadata("design:type", Array)
], HomepageSettings.prototype, "whyWoodivoPoints", void 0);
HomepageSettings = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], HomepageSettings);
const HomepageSettingsSchema = mongoose_1.SchemaFactory.createForClass(HomepageSettings);
let WebsiteSettings = class WebsiteSettings {
    key;
    siteName;
    tagline;
    logo;
    favicon;
    contact;
    socialLinks;
    footer;
    homepage;
    googleAnalyticsId;
    facebookPixelId;
    createdAt;
    updatedAt;
};
exports.WebsiteSettings = WebsiteSettings;
__decorate([
    (0, mongoose_1.Prop)({ default: exports.SETTINGS_SINGLETON_KEY, unique: true, index: true }),
    __metadata("design:type", String)
], WebsiteSettings.prototype, "key", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, maxlength: 80 }),
    __metadata("design:type", String)
], WebsiteSettings.prototype, "siteName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, maxlength: 200 }),
    __metadata("design:type", String)
], WebsiteSettings.prototype, "tagline", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: media_asset_schema_1.MediaAssetSchema }),
    __metadata("design:type", media_asset_schema_1.MediaAsset)
], WebsiteSettings.prototype, "logo", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: media_asset_schema_1.MediaAssetSchema }),
    __metadata("design:type", media_asset_schema_1.MediaAsset)
], WebsiteSettings.prototype, "favicon", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: ContactInfo, default: {} }),
    __metadata("design:type", ContactInfo)
], WebsiteSettings.prototype, "contact", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: social_links_schema_1.SocialLinksSchema, default: {} }),
    __metadata("design:type", social_links_schema_1.SocialLinks)
], WebsiteSettings.prototype, "socialLinks", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: FooterSettings, default: {} }),
    __metadata("design:type", FooterSettings)
], WebsiteSettings.prototype, "footer", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: HomepageSettingsSchema, default: {} }),
    __metadata("design:type", HomepageSettings)
], WebsiteSettings.prototype, "homepage", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, maxlength: 500 }),
    __metadata("design:type", String)
], WebsiteSettings.prototype, "googleAnalyticsId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, maxlength: 500 }),
    __metadata("design:type", String)
], WebsiteSettings.prototype, "facebookPixelId", void 0);
exports.WebsiteSettings = WebsiteSettings = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], WebsiteSettings);
exports.WebsiteSettingsSchema = mongoose_1.SchemaFactory.createForClass(WebsiteSettings);
//# sourceMappingURL=website-settings.schema.js.map