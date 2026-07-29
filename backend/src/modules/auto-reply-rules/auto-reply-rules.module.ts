import { Module } from '@nestjs/common';
import { AutoReplyRulesAdminController } from './auto-reply-rules.admin.controller';
import { AutoReplyRulesService } from './auto-reply-rules.service';

@Module({
  controllers: [AutoReplyRulesAdminController],
  providers: [AutoReplyRulesService],
})
export class AutoReplyRulesModule {}
