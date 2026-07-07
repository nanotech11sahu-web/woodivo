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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeoController = void 0;
const common_1 = require("@nestjs/common");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const seo_service_1 = require("./seo.service");
let SeoController = class SeoController {
    seoService;
    constructor(seoService) {
        this.seoService = seoService;
    }
    getSitemapData() {
        return this.seoService.getSitemapData();
    }
    async getSitemapXml(res) {
        const xml = await this.seoService.getSitemapXml();
        res.type('application/xml').send(xml);
    }
    getRobotsTxt(res) {
        res.type('text/plain').send(this.seoService.getRobotsTxt());
    }
};
exports.SeoController = SeoController;
__decorate([
    (0, common_1.Get)('seo/sitemap-data'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SeoController.prototype, "getSitemapData", null);
__decorate([
    (0, common_1.Get)('sitemap.xml'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SeoController.prototype, "getSitemapXml", null);
__decorate([
    (0, common_1.Get)('robots.txt'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SeoController.prototype, "getRobotsTxt", null);
exports.SeoController = SeoController = __decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [seo_service_1.SeoService])
], SeoController);
//# sourceMappingURL=seo.controller.js.map