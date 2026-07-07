import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';
import { BannerPlacement, BannerStatus } from '../schemas/banner.schema';

export class QueryBannerDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(BannerStatus)
  status?: BannerStatus;

  @IsOptional()
  @IsEnum(BannerPlacement)
  placement?: BannerPlacement;
}
