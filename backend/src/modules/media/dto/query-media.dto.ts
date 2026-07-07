import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { MediaFolder } from '@common/constants/app.constants';

// Deliberately not `PaginationQueryDto` — Cloudinary's Search API is
// cursor-paginated (`next_cursor`), not page-numbered, and has no concept
// of `sortBy`/`sortOrder` beyond what `sort_by()` is called with server-side
// (fixed to `created_at desc` in `MediaService.listAssets`). See
// PHASE17_NOTES.md's "Why this module breaks the established shape".
export class QueryMediaDto {
  @IsOptional()
  @IsEnum(MediaFolder)
  folder?: MediaFolder;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 24;
}
