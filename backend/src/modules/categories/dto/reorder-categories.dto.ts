import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  Min,
  ValidateNested,
} from 'class-validator';

export class ReorderCategoryItemDto {
  @IsMongoId()
  id!: string;

  @IsInt()
  @Min(0)
  displayOrder!: number;
}

export class ReorderCategoriesDto {
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => ReorderCategoryItemDto)
  items!: ReorderCategoryItemDto[];
}
