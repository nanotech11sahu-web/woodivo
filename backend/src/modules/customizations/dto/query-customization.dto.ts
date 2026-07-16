import { IsEnum, IsMongoId, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';
import { CustomizationStatus } from '../schemas/customization.schema';

export class QueryCustomizationDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(CustomizationStatus)
  status?: CustomizationStatus;

  @IsOptional()
  @IsMongoId()
  category?: string;

  @IsOptional()
  @IsString()
  tag?: string;
}
