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
exports.EnquiriesController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const app_constants_1 = require("../../common/constants/app.constants");
const multer_config_1 = require("../media/config/multer.config");
const media_service_1 = require("../media/media.service");
const enquiries_service_1 = require("./enquiries.service");
const create_enquiry_dto_1 = require("./dto/create-enquiry.dto");
let EnquiriesController = class EnquiriesController {
    enquiriesService;
    mediaService;
    constructor(enquiriesService, mediaService) {
        this.enquiriesService = enquiriesService;
        this.mediaService = mediaService;
    }
    async create(dto) {
        const enquiry = await this.enquiriesService.create(dto);
        return {
            id: enquiry._id,
            fullName: enquiry.fullName,
            submittedAt: enquiry.createdAt,
        };
    }
    uploadImages(files) {
        return this.mediaService.uploadImages(files, app_constants_1.MediaFolder.ENQUIRIES);
    }
};
exports.EnquiriesController = EnquiriesController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_enquiry_dto_1.CreateEnquiryDto]),
    __metadata("design:returntype", Promise)
], EnquiriesController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('upload-images'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', app_constants_1.MAX_CUSTOM_ORDER_IMAGES, multer_config_1.imageUploadOptions)),
    __param(0, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", void 0)
], EnquiriesController.prototype, "uploadImages", null);
exports.EnquiriesController = EnquiriesController = __decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Controller)('enquiries'),
    __metadata("design:paramtypes", [enquiries_service_1.EnquiriesService,
        media_service_1.MediaService])
], EnquiriesController);
//# sourceMappingURL=enquiries.controller.js.map