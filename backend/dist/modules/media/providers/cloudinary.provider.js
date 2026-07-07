"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudinaryProvider = exports.CLOUDINARY_PROVIDER = void 0;
const config_1 = require("@nestjs/config");
const cloudinary_1 = require("cloudinary");
exports.CLOUDINARY_PROVIDER = 'CLOUDINARY';
exports.CloudinaryProvider = {
    provide: exports.CLOUDINARY_PROVIDER,
    inject: [config_1.ConfigService],
    useFactory: (configService) => {
        const cloudinaryConfig = configService.get('cloudinary');
        cloudinary_1.v2.config({
            cloud_name: cloudinaryConfig?.cloudName,
            api_key: cloudinaryConfig?.apiKey,
            api_secret: cloudinaryConfig?.apiSecret,
            secure: true,
        });
        return cloudinary_1.v2;
    },
};
//# sourceMappingURL=cloudinary.provider.js.map