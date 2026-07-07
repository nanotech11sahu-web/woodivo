import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@common/constants/app.constants';
import { MAX_FILES_PER_UPLOAD } from '@common/constants/app.constants';
import { MediaService } from './media.service';
import { UploadMediaDto } from './dto/upload-media.dto';
import { DeleteMediaDto } from './dto/delete-media.dto';
import { QueryMediaDto } from './dto/query-media.dto';
import { imageUploadOptions } from './config/multer.config';

@Controller('admin/media')
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get()
  list(@Query() query: QueryMediaDto) {
    return this.mediaService.listAssets(query);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', imageUploadOptions))
  upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadMediaDto,
  ) {
    return this.mediaService.uploadImage(file, dto.folder, dto.alt);
  }

  @Post('upload-multiple')
  @UseInterceptors(
    FilesInterceptor('files', MAX_FILES_PER_UPLOAD, imageUploadOptions),
  )
  uploadMultiple(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: UploadMediaDto,
  ) {
    return this.mediaService.uploadImages(files, dto.folder);
  }

  @Post('delete')
  delete(@Body() dto: DeleteMediaDto) {
    return this.mediaService.deleteImage(dto.publicId);
  }
}
