import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import type { CloudinaryConfig } from '@config/configuration';

export const CLOUDINARY_PROVIDER = 'CLOUDINARY';
export type CloudinaryClient = typeof cloudinary;

export const CloudinaryProvider: Provider = {
  provide: CLOUDINARY_PROVIDER,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const cloudinaryConfig = configService.get<CloudinaryConfig>('cloudinary');

    cloudinary.config({
      cloud_name: cloudinaryConfig?.cloudName,
      api_key: cloudinaryConfig?.apiKey,
      api_secret: cloudinaryConfig?.apiSecret,
      secure: true,
    });

    return cloudinary;
  },
};
