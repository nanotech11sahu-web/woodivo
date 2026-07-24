import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@common/constants/app.constants';
import { SocialService } from '@modules/social/social.service';
import type { PostToSocialParams } from '@modules/social/interfaces/post-to-social-params.interface';
import { PostToSocialDto } from '@modules/social/dto/post-to-social.dto';
import { CustomPostsService } from './custom-posts.service';
import { CreateCustomPostDto } from './dto/create-custom-post.dto';
import { UpdateCustomPostDto } from './dto/update-custom-post.dto';
import { QueryCustomPostDto } from './dto/query-custom-post.dto';
import { CustomPostDocument } from './schemas/custom-post.schema';

@Controller('admin/custom-posts')
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR)
export class CustomPostsAdminController {
  constructor(
    private readonly customPostsService: CustomPostsService,
    private readonly socialService: SocialService,
  ) {}

  @Get()
  findAll(@Query() query: QueryCustomPostDto) {
    return this.customPostsService.findAllAdmin(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customPostsService.findByIdAdmin(id);
  }

  @Post()
  create(@Body() dto: CreateCustomPostDto) {
    return this.customPostsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCustomPostDto) {
    return this.customPostsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.customPostsService.remove(id);
  }

  // No @Roles override - inherits the controller-level SUPER_ADMIN/ADMIN/EDITOR
  // from above. Accepts one id or many (bulk = same request, more ids), same
  // shape as ProductsAdminController/BlogsAdminController's post-to-social.
  @Post('post-to-social')
  async postToSocial(@Body() dto: PostToSocialDto) {
    const results = await this.socialService.postManyToSocial(dto.ids, (id) =>
      this.buildSocialParams(id, dto),
    );

    await Promise.all(
      results
        .filter((result) => result.success)
        .map((result) => this.customPostsService.markPosted(result.id)),
    );

    if (dto.postNow && results.some((result) => result.success)) {
      await this.socialService.triggerNow().catch(() => undefined);
    }

    return { results };
  }

  private async buildSocialParams(
    id: string,
    overrides: PostToSocialDto,
  ): Promise<PostToSocialParams> {
    const post = await this.customPostsService.findByIdAdmin(id);
    return mapCustomPostToSocialParams(post, overrides);
  }
}

export function mapCustomPostToSocialParams(
  post: CustomPostDocument,
  overrides: PostToSocialDto,
): PostToSocialParams {
  const mediaUrls = overrides.isReel
    ? post.video?.url
      ? [post.video.url]
      : []
    : post.images.map((image) => image.url).filter(Boolean);

  if (mediaUrls.length === 0) {
    throw new Error(
      overrides.isReel
        ? `Custom post "${post.title}" has no video to post as a Reel`
        : `Custom post "${post.title}" has no images to post`,
    );
  }

  return {
    title: post.title,
    description: post.caption,
    keywords: post.keywords ?? [],
    tone: overrides.tone ?? post.tone,
    cta: overrides.cta ?? post.cta,
    platforms: overrides.platforms?.length
      ? overrides.platforms
      : ['Facebook', 'Instagram'],
    language: 'English',
    additionalInstructions: overrides.additionalInstructions,
    mediaUrls,
    sourceType: 'CUSTOM',
    sourceId: String(post._id),
    urgent: overrides.postNow,
    isReel: overrides.isReel,
  };
}
