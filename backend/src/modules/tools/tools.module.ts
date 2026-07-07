import { Module } from '@nestjs/common';
import { BlogsModule } from '@modules/blogs/blogs.module';
import { MediaModule } from '@modules/media/media.module';
import { SeoEntriesModule } from '@modules/seo-entries/seo-entries.module';
import { ToolsAdminController } from './tools.admin.controller';
import { ImageGeneratorService } from './image-generator.service';
import { DraftBlogUploaderService } from './draft-blog-uploader.service';

@Module({
  imports: [BlogsModule, MediaModule, SeoEntriesModule],
  controllers: [ToolsAdminController],
  providers: [ImageGeneratorService, DraftBlogUploaderService],
})
export class ToolsModule {}
