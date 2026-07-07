import { Module } from '@nestjs/common';
import { CloudinaryProvider } from './providers/cloudinary.provider';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';

@Module({
  controllers: [MediaController],
  providers: [CloudinaryProvider, MediaService],
  exports: [CloudinaryProvider, MediaService],
})
export class MediaModule {}
