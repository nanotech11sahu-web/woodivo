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
exports.MediaService = void 0;
const common_1 = require("@nestjs/common");
const cloudinary_provider_1 = require("./providers/cloudinary.provider");
const CLOUDINARY_ROOT_FOLDER = 'woodivo';
let MediaService = class MediaService {
    cloudinary;
    constructor(cloudinary) {
        this.cloudinary = cloudinary;
    }
    async uploadImage(file, folder, alt) {
        if (!file) {
            throw new common_1.BadRequestException('No file provided');
        }
        const result = await this.streamUpload(file.buffer, folder);
        return {
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            alt: alt ?? '',
        };
    }
    async uploadImages(files, folder) {
        if (!files?.length) {
            throw new common_1.BadRequestException('No files provided');
        }
        return Promise.all(files.map((file) => this.uploadImage(file, folder)));
    }
    async deleteImage(publicId) {
        const response = (await this.cloudinary.uploader.destroy(publicId, {
            invalidate: true,
        }));
        return { deleted: response.result === 'ok' };
    }
    async listAssets(query) {
        const limit = query.limit ?? 24;
        const expression = this.buildSearchExpression(query);
        const result = (await this.cloudinary.search
            .expression(expression)
            .sort_by('created_at', 'desc')
            .max_results(limit)
            .next_cursor(query.cursor)
            .execute());
        return {
            items: result.resources.map((resource) => this.toLibraryAsset(resource)),
            nextCursor: result.next_cursor ?? null,
            totalCount: result.total_count,
        };
    }
    buildSearchExpression(query) {
        const folderPath = query.folder
            ? `${CLOUDINARY_ROOT_FOLDER}/${query.folder}`
            : CLOUDINARY_ROOT_FOLDER;
        const clauses = [`folder:${folderPath}/*`, 'resource_type:image'];
        if (query.search) {
            const sanitized = query.search.replace(/["\\]/g, '').trim();
            if (sanitized)
                clauses.push(`filename:*${sanitized}*`);
        }
        return clauses.join(' AND ');
    }
    toLibraryAsset(resource) {
        const withoutRoot = resource.public_id.startsWith(`${CLOUDINARY_ROOT_FOLDER}/`)
            ? resource.public_id.slice(CLOUDINARY_ROOT_FOLDER.length + 1)
            : resource.public_id;
        const folder = withoutRoot.includes('/')
            ? withoutRoot.split('/')[0]
            : 'misc';
        return {
            publicId: resource.public_id,
            url: resource.secure_url,
            folder,
            format: resource.format,
            width: resource.width,
            height: resource.height,
            bytes: resource.bytes,
            createdAt: resource.created_at,
        };
    }
    streamUpload(buffer, folder) {
        return new Promise((resolve, reject) => {
            const uploadStream = this.cloudinary.uploader.upload_stream({
                folder: `${CLOUDINARY_ROOT_FOLDER}/${folder}`,
                resource_type: 'image',
            }, (error, result) => {
                if (error || !result) {
                    reject(error instanceof Error
                        ? error
                        : new Error(error?.message ?? 'Cloudinary upload failed'));
                    return;
                }
                resolve(result);
            });
            uploadStream.end(buffer);
        });
    }
};
exports.MediaService = MediaService;
exports.MediaService = MediaService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(cloudinary_provider_1.CLOUDINARY_PROVIDER)),
    __metadata("design:paramtypes", [Object])
], MediaService);
//# sourceMappingURL=media.service.js.map