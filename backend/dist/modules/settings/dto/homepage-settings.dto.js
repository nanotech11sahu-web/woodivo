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
exports.HomepageSettingsDto = exports.HomepageHighlightDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const website_settings_schema_1 = require("../schemas/website-settings.schema");
class HomepageHighlightDto {
    icon;
    title;
    description;
}
exports.HomepageHighlightDto = HomepageHighlightDto;
__decorate([
    (0, class_validator_1.IsEnum)(website_settings_schema_1.HomepageHighlightIcon),
    __metadata("design:type", String)
], HomepageHighlightDto.prototype, "icon", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(80),
    __metadata("design:type", String)
], HomepageHighlightDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], HomepageHighlightDto.prototype, "description", void 0);
class HomepageSettingsDto {
    whyWoodivoPoints;
}
exports.HomepageSettingsDto = HomepageSettingsDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMaxSize)(12),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => HomepageHighlightDto),
    __metadata("design:type", Array)
], HomepageSettingsDto.prototype, "whyWoodivoPoints", void 0);
//# sourceMappingURL=homepage-settings.dto.js.map