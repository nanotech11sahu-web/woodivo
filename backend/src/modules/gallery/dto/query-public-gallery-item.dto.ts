import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';
import { GalleryItemType } from '../schemas/gallery-item.schema';

export class QueryPublicGalleryItemDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(GalleryItemType)
  type?: GalleryItemType;

  @IsOptional()
  @IsString()
  tag?: string;
}
