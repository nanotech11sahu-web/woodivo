import { Controller, Get, Param, Query } from '@nestjs/common';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@common/constants/app.constants';
import { SocialService } from './social.service';
import { QuerySocialPostsDto } from './dto/query-social-posts.dto';

/**
 * Read-only status surface for the Social Publisher, consumed by the CMS
 * "Social Posts" page. Deliberately has no write endpoints - submitting posts
 * happens via ProductsAdminController/BlogsAdminController's post-to-social.
 */
@Controller('admin/social')
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR)
export class SocialAdminController {
  constructor(private readonly socialService: SocialService) {}

  @Get('health')
  getHealth() {
    return this.socialService.getHealth();
  }

  @Get('posts')
  listPosts(@Query() query: QuerySocialPostsDto) {
    return this.socialService.listPosts(query.page ?? 1, query.limit ?? 20);
  }

  @Get('posts/:id')
  getPost(@Param('id') id: string) {
    return this.socialService.getPost(id);
  }
}
