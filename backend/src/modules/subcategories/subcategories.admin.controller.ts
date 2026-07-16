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
import { SubCategoriesService } from './subcategories.service';
import { CreateSubCategoryDto } from './dto/create-subcategory.dto';
import { UpdateSubCategoryDto } from './dto/update-subcategory.dto';
import { QuerySubCategoryDto } from './dto/query-subcategory.dto';
import { ReorderSubCategoriesDto } from './dto/reorder-subcategories.dto';
import { SubCategoryStatus } from './schemas/subcategory.schema';

@Controller('admin/subcategories')
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR)
export class SubCategoriesAdminController {
  constructor(private readonly subCategoriesService: SubCategoriesService) {}

  @Get()
  findAll(@Query() query: QuerySubCategoryDto) {
    return this.subCategoriesService.findAllAdmin(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subCategoriesService.findByIdAdmin(id);
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  create(@Body() dto: CreateSubCategoryDto) {
    return this.subCategoriesService.create(dto);
  }

  @Patch('reorder')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  reorder(@Body() dto: ReorderSubCategoriesDto) {
    return this.subCategoriesService.reorder(dto);
  }

  @Patch(':id/status')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  setStatus(
    @Param('id') id: string,
    @Body('status') status: SubCategoryStatus,
  ) {
    return this.subCategoriesService.setStatus(id, status);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateSubCategoryDto) {
    return this.subCategoriesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.subCategoriesService.remove(id);
  }
}
