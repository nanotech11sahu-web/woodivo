import { Module } from '@nestjs/common';
import { SeederService } from './seeder.service';
import { UsersModule } from '@modules/users/users.module';
import { SeoEntriesModule } from '@modules/seo-entries/seo-entries.module';

@Module({
  imports: [UsersModule, SeoEntriesModule],
  providers: [SeederService],
})
export class SeederModule {}
