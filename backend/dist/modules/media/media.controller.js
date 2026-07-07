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
exports.MediaController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const app_constants_1 = require("../../common/constants/app.constants");
const app_constants_2 = require("../../common/constants/app.constants");
const media_service_1 = require("./media.service");
const upload_media_dto_1 = require("./dto/upload-media.dto");
const delete_media_dto_1 = require("./dto/delete-media.dto");
const query_media_dto_1 = require("./dto/query-media.dto");
const multer_config_1 = require("./config/multer.config");
let MediaController = class MediaController {
    mediaService;
    constructor(mediaService) {
        this.mediaService = mediaService;
    }
    list(query) {
        return this.mediaService.listAssets(query);
    }
    upload(file, dto) {
        return this.mediaService.uploadImage(file, dto.folder, dto.alt);
    }
    uploadMultiple(files, dto) {
        return this.mediaService.uploadImages(files, dto.folder);
    }
    delete(dto) {
        return this.mediaService.deleteImage(dto.publicId);
    }
};
exports.MediaController = MediaController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_media_dto_1.QueryMediaDto]),
    __metadata("design:returntype", void 0)
], MediaController.prototype, "list", null);
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', multer_config_1.imageUploadOptions)),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, upload_media_dto_1.UploadMediaDto]),
    __metadata("design:returntype", void 0)
], MediaController.prototype, "upload", null);
__decorate([
    (0, common_1.Post)('upload-multiple'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', app_constants_2.MAX_FILES_PER_UPLOAD, multer_config_1.imageUploadOptions)),
    __param(0, (0, common_1.UploadedFiles)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, upload_media_dto_1.UploadMediaDto]),
    __metadata("design:returntype", void 0)
], MediaController.prototype, "uploadMultiple", null);
__decorate([
    (0, common_1.Post)('delete'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [delete_media_dto_1.DeleteMediaDto]),
    __metadata("design:returntype", void 0)
], MediaController.prototype, "delete", null);
exports.MediaController = MediaController = __decorate([
    (0, common_1.Controller)('admin/media'),
    (0, roles_decorator_1.Roles)(app_constants_1.UserRole.SUPER_ADMIN, app_constants_1.UserRole.ADMIN, app_constants_1.UserRole.EDITOR),
    __metadata("design:paramtypes", [media_service_1.MediaService])
], MediaController);
//# sourceMappingURL=media.controller.js.map