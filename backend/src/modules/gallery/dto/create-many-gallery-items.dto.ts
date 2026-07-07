import { Type } from 'class-transformer';
import { ArrayMinSize, ValidateNested } from 'class-validator';
import { CreateGalleryItemDto } from './create-gallery-item.dto';

export class CreateManyGalleryItemsDto {
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateGalleryItemDto)
  items!: CreateGalleryItemDto[];
}
