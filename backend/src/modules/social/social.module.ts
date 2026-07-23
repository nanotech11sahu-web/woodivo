import { Module } from '@nestjs/common';
import { SocialService } from './social.service';
import { SocialAdminController } from './social.admin.controller';

@Module({
  controllers: [SocialAdminController],
  providers: [SocialService],
  exports: [SocialService],
})
export class SocialModule {}
