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
import { SeoMetaDto } from '@common/dto/seo-meta.dto';
import { SeoEntriesService } from './seo-entries.service';
import { CreateSeoEntryDto } from './dto/create-seo-entry.dto';
import { QuerySeoEntryDto } from './dto/query-seo-entry.dto';

@Controller('admin/seo')
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR)
export class SeoEntriesAdminController {
  constructor(private readonly seoEntriesService: SeoEntriesService) {}

  @Get()
  findAll(@Query() query: QuerySeoEntryDto) {
    return this.seoEntriesService.findAllAdmin(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.seoEntriesService.findByIdAdmin(id);
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  create(@Body() dto: CreateSeoEntryDto) {
    return this.seoEntriesService.createCustom(dto);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR)
  update(@Param('id') id: string, @Body() dto: SeoMetaDto) {
    return this.seoEntriesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.seoEntriesService.remove(id);
  }
}
