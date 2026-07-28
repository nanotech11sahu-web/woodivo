import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@common/constants/app.constants';
import { SocialService } from './social.service';
import { QuerySocialPostsDto } from './dto/query-social-posts.dto';

/**
 * Status surface for the Social Publisher, consumed by the CMS "Social
 * Posts" page. Submitting new posts still happens via
 * ProductsAdminController/BlogsAdminController's post-to-social - the only
 * write action here is retrying a post the Publisher already knows about.
 */
@Controller('admin/social')
export class SocialAdminController {
  constructor(private readonly socialService: SocialService) {}

  @Get('health')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR)
  getHealth() {
    return this.socialService.getHealth();
  }

  @Get('posts')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR)
  listPosts(@Query() query: QuerySocialPostsDto) {
    return this.socialService.listPosts(query.page ?? 1, query.limit ?? 20);
  }

  @Get('posts/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR)
  getPost(@Param('id') id: string) {
    return this.socialService.getPost(id);
  }

  @Post('posts/:id/retry')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  retryPost(@Param('id') id: string) {
    return this.socialService.retryPost(id);
  }
}
