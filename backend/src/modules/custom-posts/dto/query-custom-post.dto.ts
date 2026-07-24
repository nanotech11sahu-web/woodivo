import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';
import { CustomPostStatus } from '../schemas/custom-post.schema';

export class QueryCustomPostDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(CustomPostStatus)
  status?: CustomPostStatus;
}
