import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { SeoMetaDto } from '@common/dto/seo-meta.dto';

export class CreateSeoEntryDto extends SeoMetaDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\/[a-zA-Z0-9\-/]*$/, {
    message:
      'Path must start with "/" and contain only letters, numbers, hyphens and slashes',
  })
  path!: string;
}
