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
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@common/constants/app.constants';
import { ReorderItemsDto } from '@common/dto/reorder-items.dto';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { QueryProjectDto } from './dto/query-project.dto';
import { ProjectStatus } from './schemas/project.schema';

@Controller('admin/projects')
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR)
export class ProjectsAdminController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  findAll(@Query() query: QueryProjectDto) {
    return this.projectsService.findAllAdmin(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findByIdAdmin(id);
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  create(@Body() dto: CreateProjectDto) {
    return this.projectsService.create(dto);
  }

  @Patch('reorder')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  reorder(@Body() dto: ReorderItemsDto) {
    return this.projectsService.reorder(dto);
  }

  @Patch(':id/status')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  setStatus(@Param('id') id: string, @Body('status') status: ProjectStatus) {
    return this.projectsService.setStatus(id, status);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.projectsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }
}
