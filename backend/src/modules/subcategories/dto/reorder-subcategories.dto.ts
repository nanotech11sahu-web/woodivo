import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  Min,
  ValidateNested,
} from 'class-validator';

export class ReorderSubCategoryItemDto {
  @IsMongoId()
  id!: string;

  @IsInt()
  @Min(0)
  displayOrder!: number;
}

export class ReorderSubCategoriesDto {
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => ReorderSubCategoryItemDto)
  items!: ReorderSubCategoryItemDto[];
}
