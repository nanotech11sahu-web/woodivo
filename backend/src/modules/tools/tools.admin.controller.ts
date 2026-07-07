import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { Response } from 'express';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@common/constants/app.constants';
import { ImageGeneratorService } from './image-generator.service';
import { DraftBlogUploaderService } from './draft-blog-uploader.service';

const PROMPTS_FILE_MAX_BYTES = 2 * 1024 * 1024; // 2MB — it's a text file
const DRAFT_ZIP_MAX_BYTES = 50 * 1024 * 1024; // 50MB — images + content.json per post

@Controller('admin/tools')
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR)
export class ToolsAdminController {
  constructor(
    private readonly imageGeneratorService: ImageGeneratorService,
    private readonly draftBlogUploaderService: DraftBlogUploaderService,
  ) {}

  // ---------- Blog image generator ----------

  /** Starts generation in the background and returns immediately — the CMS polls the status endpoint below for progress. */
  @Post('image-prompts/generate')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: PROMPTS_FILE_MAX_BYTES },
    }),
  )
  startImageGeneration(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No prompts file provided');
    }
    return this.imageGeneratorService.startJob(file.buffer.toString('utf-8'));
  }

  @Get('image-prompts/generate/:jobId/status')
  getImageGenerationStatus(@Param('jobId') jobId: string) {
    return this.imageGeneratorService.getStatus(jobId);
  }

  @Get('image-prompts/generate/:jobId/download')
  downloadImageGenerationZip(
    @Param('jobId') jobId: string,
    @Res() res: Response,
  ) {
    const zipBuffer = this.imageGeneratorService.getZip(jobId);

    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename="blog-images.zip"',
      'Content-Length': zipBuffer.length,
    });
    res.send(zipBuffer);
  }

  // ---------- Draft blog uploader ----------

  @Get('draft-blogs')
  listDraftZips() {
    return this.draftBlogUploaderService.listPending();
  }

  @Post('draft-blogs/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: DRAFT_ZIP_MAX_BYTES },
      fileFilter: (_req, uploadedFile, callback) => {
        if (!uploadedFile.originalname.toLowerCase().endsWith('.zip')) {
          callback(
            new BadRequestException('Only .zip files are accepted'),
            false,
          );
          return;
        }
        callback(null, true);
      },
    }),
  )
  uploadDraftZip(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No zip file provided');
    }
    return this.draftBlogUploaderService.saveIncomingZip(
      file.buffer,
      file.originalname,
    );
  }

  @Delete('draft-blogs/:filename')
  removeDraftZip(@Param('filename') filename: string) {
    this.draftBlogUploaderService.removePending(filename);
    return { removed: filename };
  }

  @Post('draft-blogs/run')
  runDraftBlogUploader() {
    return this.draftBlogUploaderService.runAll();
  }
}
