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
exports.UpdateWebsiteSettingsDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const media_asset_dto_1 = require("../../../common/dto/media-asset.dto");
const contact_info_dto_1 = require("./contact-info.dto");
const social_links_dto_1 = require("./social-links.dto");
const footer_settings_dto_1 = require("./footer-settings.dto");
const homepage_settings_dto_1 = require("./homepage-settings.dto");
class UpdateWebsiteSettingsDto {
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
}
exports.UpdateWebsiteSettingsDto = UpdateWebsiteSettingsDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(80),
    __metadata("design:type", String)
], UpdateWebsiteSettingsDto.prototype, "siteName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], UpdateWebsiteSettingsDto.prototype, "tagline", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => media_asset_dto_1.MediaAssetDto),
    __metadata("design:type", media_asset_dto_1.MediaAssetDto)
], UpdateWebsiteSettingsDto.prototype, "logo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => media_asset_dto_1.MediaAssetDto),
    __metadata("design:type", media_asset_dto_1.MediaAssetDto)
], UpdateWebsiteSettingsDto.prototype, "favicon", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => contact_info_dto_1.ContactInfoDto),
    __metadata("design:type", contact_info_dto_1.ContactInfoDto)
], UpdateWebsiteSettingsDto.prototype, "contact", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => social_links_dto_1.SocialLinksDto),
    __metadata("design:type", social_links_dto_1.SocialLinksDto)
], UpdateWebsiteSettingsDto.prototype, "socialLinks", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => footer_settings_dto_1.FooterSettingsDto),
    __metadata("design:type", footer_settings_dto_1.FooterSettingsDto)
], UpdateWebsiteSettingsDto.prototype, "footer", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => homepage_settings_dto_1.HomepageSettingsDto),
    __metadata("design:type", homepage_settings_dto_1.HomepageSettingsDto)
], UpdateWebsiteSettingsDto.prototype, "homepage", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], UpdateWebsiteSettingsDto.prototype, "googleAnalyticsId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], UpdateWebsiteSettingsDto.prototype, "facebookPixelId", void 0);
//# sourceMappingURL=update-website-settings.dto.js.map