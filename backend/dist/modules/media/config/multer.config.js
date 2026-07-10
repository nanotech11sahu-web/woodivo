"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageUploadOptions = void 0;
const common_1 = require("@nestjs/common");
const multer_1 = require("multer");
const app_constants_1 = require("../../../common/constants/app.constants");
exports.imageUploadOptions = {
    storage: (0, multer_1.memoryStorage)(),
    limits: {
        fileSize: app_constants_1.MAX_UPLOAD_SIZE_BYTES,
    },
    fileFilter: (_req, file, callback) => {
        if (!app_constants_1.ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype)) {
            callback(new common_1.BadRequestException(`Unsupported file type "${file.mimetype}". Allowed: ${app_constants_1.ALLOWED_IMAGE_MIME_TYPES.join(', ')}`), false);
            return;
        }
        callback(null, true);
    },
};
//# sourceMappingURL=multer.config.js.map