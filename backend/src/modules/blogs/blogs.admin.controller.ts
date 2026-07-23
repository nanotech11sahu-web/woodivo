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
import { ConfigService } from '@nestjs/config';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@common/constants/app.constants';
import type { AppConfig } from '@config/configuration';
import { SocialService } from '@modules/social/social.service';
import type { PostToSocialParams } from '@modules/social/interfaces/post-to-social-params.interface';
import { PostToSocialDto } from '@modules/social/dto/post-to-social.dto';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { QueryBlogDto } from './dto/query-blog.dto';
import { BlogDocument } from './schemas/blog.schema';

@Controller('admin/blogs')
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR)
export class BlogsAdminController {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly socialService: SocialService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  findAll(@Query() query: QueryBlogDto) {
    return this.blogsService.findAllAdmin(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.blogsService.findByIdAdmin(id);
  }

  @Post()
  create(@Body() dto: CreateBlogDto) {
    return this.blogsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBlogDto) {
    return this.blogsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.blogsService.remove(id);
  }

  // No @Roles override - inherits the controller-level SUPER_ADMIN/ADMIN/EDITOR
  // from above. Accepts one id or many (bulk = same request, more ids).
  @Post('post-to-social')
  async postToSocial(@Body() dto: PostToSocialDto) {
    const results = await this.socialService.postManyToSocial(dto.ids, (id) =>
      this.buildSocialParams(id, dto),
    );

    if (dto.postNow && results.some((result) => result.success)) {
      // Best-effort: the posts are already queued regardless, so a failed
      // trigger just means they wait for the next scheduled slot instead.
      await this.socialService.triggerNow().catch(() => undefined);
    }

    return { results };
  }

  private async buildSocialParams(
    id: string,
    overrides: PostToSocialDto,
  ): Promise<PostToSocialParams> {
    const blog = await this.blogsService.findByIdAdmin(id);
    return mapBlogToSocialParams(blog, overrides, this.configService);
  }
}

function stripMarkdown(markdown: string): string {
  return markdown
    .replace(/!\[[^\]]*]\([^)]*\)/g, '') // images
    .replace(/\[([^\]]*)]\([^)]*\)/g, '$1') // links -> text
    .replace(/[#*_`>]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function mapBlogToSocialParams(
  blog: BlogDocument,
  overrides: PostToSocialDto,
  configService: ConfigService,
): PostToSocialParams {
  const mediaUrl = blog.featuredImage?.url ?? blog.images?.[0]?.url;
  if (!mediaUrl) {
    throw new Error(`Blog "${blog.title}" has no image to post`);
  }

  const category = blog.category as unknown as
    { name?: string } | string | undefined;
  const categoryName =
    typeof category === 'object' ? category?.name : undefined;

  const description =
    blog.excerpt ?? `${stripMarkdown(blog.content).slice(0, 250)}...`;

  const publicSiteUrl = configService.get<AppConfig>('app')?.publicSiteUrl;
  const website = publicSiteUrl
    ? `${publicSiteUrl}/blogs/${blog.slug}`
    : undefined;

  const keywords =
    blog.tags.length > 0
      ? blog.tags
      : [categoryName, blog.title].filter((v): v is string => Boolean(v));

  return {
    title: blog.title,
    description,
    keywords,
    tone: overrides.tone ?? 'authentic, story-driven, slightly casual',
    cta: overrides.cta ?? 'Read the full story - link in bio',
    website,
    platforms: overrides.platforms?.length
      ? overrides.platforms
      : ['Facebook', 'Instagram'],
    language: 'English',
    additionalInstructions: overrides.additionalInstructions,
    mediaUrl,
    sourceType: 'BLOG',
    sourceId: String(blog._id),
    urgent: overrides.postNow,
  };
}
