import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomPost, CustomPostSchema } from './schemas/custom-post.schema';
import { SocialModule } from '@modules/social/social.module';
import { CustomPostsService } from './custom-posts.service';
import { CustomPostsAdminController } from './custom-posts.admin.controller';

// CMS-only content, never reaches the public site - so unlike Products/Blogs
// this imports no TranslationModule and registers no public controller.
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CustomPost.name, schema: CustomPostSchema },
    ]),
    SocialModule,
  ],
  controllers: [CustomPostsAdminController],
  providers: [CustomPostsService],
  exports: [MongooseModule, CustomPostsService],
})
export class CustomPostsModule {}
