import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AboutPage, AboutPageSchema } from './schemas/about-page.schema';
import { AboutService } from './about.service';
import { AboutController } from './about.controller';
import { AboutAdminController } from './about.admin.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AboutPage.name, schema: AboutPageSchema },
    ]),
  ],
  controllers: [AboutController, AboutAdminController],
  providers: [AboutService],
  exports: [MongooseModule, AboutService],
})
export class AboutModule {}
