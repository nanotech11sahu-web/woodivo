import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';
import {
  GalleryItemStatus,
  GalleryItemType,
} from '../schemas/gallery-item.schema';

export class QueryGalleryItemDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(GalleryItemStatus)
  status?: GalleryItemStatus;

  @IsOptional()
  @IsEnum(GalleryItemType)
  type?: GalleryItemType;

  @IsOptional()
  @IsString()
  tag?: string;
}
