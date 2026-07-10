import { Body, Controller, HttpCode, HttpStatus, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Public } from '@common/decorators/public.decorator';
import { MediaFolder, MAX_CUSTOM_ORDER_IMAGES } from '@common/constants/app.constants';
import { imageUploadOptions } from '@modules/media/config/multer.config';
import { MediaService } from '@modules/media/media.service';
import { EnquiriesService } from './enquiries.service';
import { CreateEnquiryDto } from './dto/create-enquiry.dto';

@Public()
@Controller('enquiries')
export class EnquiriesController {
  constructor(
    private readonly enquiriesService: EnquiriesService,
    private readonly mediaService: MediaService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateEnquiryDto) {
    const enquiry = await this.enquiriesService.create(dto);
    // Deliberately return a minimal payload — the public form only needs to
    // know it succeeded, not the full CRM record (status, notes, etc).
    return {
      id: enquiry._id,
      fullName: enquiry.fullName,
      submittedAt: enquiry.createdAt,
    };
  }

  // Reference-photo upload for the "Customize this product" form — a
  // narrower, unauthenticated sibling of /admin/media/upload-multiple.
  // Deliberately doesn't expose list/delete here, and hardcodes the
  // destination folder (MediaFolder.ENQUIRIES) rather than taking one from
  // the client, so this can't be used to write into any other app folder.
  @Post('upload-images')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FilesInterceptor('files', MAX_CUSTOM_ORDER_IMAGES, imageUploadOptions),
  )
  uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
    return this.mediaService.uploadImages(files, MediaFolder.ENQUIRIES);
  }
}
