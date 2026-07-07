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
} from '@nestjs/common';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@common/constants/app.constants';
import { ReorderItemsDto } from '@common/dto/reorder-items.dto';
import { BlogCategoriesService } from './blog-categories.service';
import { CreateBlogCategoryDto } from './dto/create-blog-category.dto';
import { UpdateBlogCategoryDto } from './dto/update-blog-category.dto';

@Controller('admin/blog-categories')
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR)
export class BlogCategoriesAdminController {
  constructor(private readonly blogCategoriesService: BlogCategoriesService) {}

  @Get()
  findAll() {
    return this.blogCategoriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.blogCategoriesService.findByIdAdmin(id);
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  create(@Body() dto: CreateBlogCategoryDto) {
    return this.blogCategoriesService.create(dto);
  }

  @Patch('reorder')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  reorder(@Body() dto: ReorderItemsDto) {
    return this.blogCategoriesService.reorder(dto);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateBlogCategoryDto) {
    return this.blogCategoriesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.blogCategoriesService.remove(id);
  }
}
