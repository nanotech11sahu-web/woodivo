import { Controller, Get, Param, Query } from '@nestjs/common';
import { Public } from '@common/decorators/public.decorator';
import { ProjectsService } from './projects.service';
import { QueryPublicProjectDto } from './dto/query-public-project.dto';

@Public()
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  findAll(@Query() query: QueryPublicProjectDto) {
    return this.projectsService.findAllPublic(query);
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.projectsService.findBySlugPublic(slug);
  }
}
