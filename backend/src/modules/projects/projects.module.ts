import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Project, ProjectSchema } from './schemas/project.schema';
import {
  Category,
  CategorySchema,
} from '@modules/categories/schemas/category.schema';
import { SeoEntriesModule } from '@modules/seo-entries/seo-entries.module';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { ProjectsAdminController } from './projects.admin.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Project.name, schema: ProjectSchema },
      // Registered directly (not via CategoriesModule) to avoid a circular
      // module dependency — same pattern as ProductsModule.
      { name: Category.name, schema: CategorySchema },
    ]),
    SeoEntriesModule,
  ],
  controllers: [ProjectsController, ProjectsAdminController],
  providers: [ProjectsService],
  exports: [MongooseModule, ProjectsService],
})
export class ProjectsModule {}
