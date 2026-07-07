import { BadRequestException } from '@nestjs/common';
import { memoryStorage } from 'multer';
import type { Request } from 'express';
import {
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_UPLOAD_SIZE_BYTES,
} from '@common/constants/app.constants';

export const imageUploadOptions = {
  storage: memoryStorage(),
  limits: {
    fileSize: MAX_UPLOAD_SIZE_BYTES,
  },
  fileFilter: (
    _req: Request,
    file: Express.Multer.File,
    callback: (error: Error | null, acceptFile: boolean) => void,
  ): void => {
    if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype)) {
      callback(
        new BadRequestException(
          `Unsupported file type "${file.mimetype}". Allowed: ${ALLOWED_IMAGE_MIME_TYPES.join(', ')}`,
        ),
        false,
      );
      return;
    }
    callback(null, true);
  },
};
