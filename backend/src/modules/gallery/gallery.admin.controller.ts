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
import { GalleryService } from './gallery.service';
import { CreateGalleryItemDto } from './dto/create-gallery-item.dto';
import { CreateManyGalleryItemsDto } from './dto/create-many-gallery-items.dto';
import { UpdateGalleryItemDto } from './dto/update-gallery-item.dto';
import { QueryGalleryItemDto } from './dto/query-gallery-item.dto';
import { GalleryItemStatus } from './schemas/gallery-item.schema';

@Controller('admin/gallery')
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR)
export class GalleryAdminController {
  constructor(private readonly galleryService: GalleryService) {}

  @Get()
  findAll(@Query() query: QueryGalleryItemDto) {
    return this.galleryService.findAllAdmin(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.galleryService.findByIdAdmin(id);
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  create(@Body() dto: CreateGalleryItemDto) {
    return this.galleryService.create(dto);
  }

  @Post('bulk')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  createMany(@Body() dto: CreateManyGalleryItemsDto) {
    return this.galleryService.createMany(dto);
  }

  @Patch('reorder')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  reorder(@Body() dto: ReorderItemsDto) {
    return this.galleryService.reorder(dto);
  }

  @Patch(':id/status')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  setStatus(
    @Param('id') id: string,
    @Body('status') status: GalleryItemStatus,
  ) {
    return this.galleryService.setStatus(id, status);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateGalleryItemDto) {
    return this.galleryService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.galleryService.remove(id);
  }
}
