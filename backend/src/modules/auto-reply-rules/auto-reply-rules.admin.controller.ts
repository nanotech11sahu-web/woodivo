import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@common/constants/app.constants';
import { AutoReplyRulesService } from './auto-reply-rules.service';
import { CreateAutoReplyRuleDto } from './dto/create-auto-reply-rule.dto';
import { UpdateAutoReplyRuleDto } from './dto/update-auto-reply-rule.dto';

/**
 * CMS surface for keyword auto-reply rules - thin proxy to the Social
 * Publisher's /admin/auto-reply-rules, same shape as SocialAdminController's
 * proxy of /posts.
 */
@Controller('admin/auto-reply-rules')
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR)
export class AutoReplyRulesAdminController {
  constructor(private readonly autoReplyRulesService: AutoReplyRulesService) {}

  @Get()
  findAll() {
    return this.autoReplyRulesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.autoReplyRulesService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateAutoReplyRuleDto) {
    return this.autoReplyRulesService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAutoReplyRuleDto) {
    return this.autoReplyRulesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.autoReplyRulesService.remove(id);
  }
}
