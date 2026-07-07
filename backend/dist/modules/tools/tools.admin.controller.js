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
exports.ToolsAdminController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const app_constants_1 = require("../../common/constants/app.constants");
const image_generator_service_1 = require("./image-generator.service");
const draft_blog_uploader_service_1 = require("./draft-blog-uploader.service");
const PROMPTS_FILE_MAX_BYTES = 2 * 1024 * 1024;
const DRAFT_ZIP_MAX_BYTES = 50 * 1024 * 1024;
let ToolsAdminController = class ToolsAdminController {
    imageGeneratorService;
    draftBlogUploaderService;
    constructor(imageGeneratorService, draftBlogUploaderService) {
        this.imageGeneratorService = imageGeneratorService;
        this.draftBlogUploaderService = draftBlogUploaderService;
    }
    startImageGeneration(file) {
        if (!file) {
            throw new common_1.BadRequestException('No prompts file provided');
        }
        return this.imageGeneratorService.startJob(file.buffer.toString('utf-8'));
    }
    getImageGenerationStatus(jobId) {
        return this.imageGeneratorService.getStatus(jobId);
    }
    downloadImageGenerationZip(jobId, res) {
        const zipBuffer = this.imageGeneratorService.getZip(jobId);
        res.set({
            'Content-Type': 'application/zip',
            'Content-Disposition': 'attachment; filename="blog-images.zip"',
            'Content-Length': zipBuffer.length,
        });
        res.send(zipBuffer);
    }
    listDraftZips() {
        return this.draftBlogUploaderService.listPending();
    }
    uploadDraftZip(file) {
        if (!file) {
            throw new common_1.BadRequestException('No zip file provided');
        }
        return this.draftBlogUploaderService.saveIncomingZip(file.buffer, file.originalname);
    }
    removeDraftZip(filename) {
        this.draftBlogUploaderService.removePending(filename);
        return { removed: filename };
    }
    runDraftBlogUploader() {
        return this.draftBlogUploaderService.runAll();
    }
};
exports.ToolsAdminController = ToolsAdminController;
__decorate([
    (0, common_1.Post)('image-prompts/generate'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.memoryStorage)(),
        limits: { fileSize: PROMPTS_FILE_MAX_BYTES },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ToolsAdminController.prototype, "startImageGeneration", null);
__decorate([
    (0, common_1.Get)('image-prompts/generate/:jobId/status'),
    __param(0, (0, common_1.Param)('jobId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ToolsAdminController.prototype, "getImageGenerationStatus", null);
__decorate([
    (0, common_1.Get)('image-prompts/generate/:jobId/download'),
    __param(0, (0, common_1.Param)('jobId')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ToolsAdminController.prototype, "downloadImageGenerationZip", null);
__decorate([
    (0, common_1.Get)('draft-blogs'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ToolsAdminController.prototype, "listDraftZips", null);
__decorate([
    (0, common_1.Post)('draft-blogs/upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.memoryStorage)(),
        limits: { fileSize: DRAFT_ZIP_MAX_BYTES },
        fileFilter: (_req, uploadedFile, callback) => {
            if (!uploadedFile.originalname.toLowerCase().endsWith('.zip')) {
                callback(new common_1.BadRequestException('Only .zip files are accepted'), false);
                return;
            }
            callback(null, true);
        },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ToolsAdminController.prototype, "uploadDraftZip", null);
__decorate([
    (0, common_1.Delete)('draft-blogs/:filename'),
    __param(0, (0, common_1.Param)('filename')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ToolsAdminController.prototype, "removeDraftZip", null);
__decorate([
    (0, common_1.Post)('draft-blogs/run'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ToolsAdminController.prototype, "runDraftBlogUploader", null);
exports.ToolsAdminController = ToolsAdminController = __decorate([
    (0, common_1.Controller)('admin/tools'),
    (0, roles_decorator_1.Roles)(app_constants_1.UserRole.SUPER_ADMIN, app_constants_1.UserRole.ADMIN, app_constants_1.UserRole.EDITOR),
    __metadata("design:paramtypes", [image_generator_service_1.ImageGeneratorService,
        draft_blog_uploader_service_1.DraftBlogUploaderService])
], ToolsAdminController);
//# sourceMappingURL=tools.admin.controller.js.map