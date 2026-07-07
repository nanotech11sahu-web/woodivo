import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { MediaFolder } from '@common/constants/app.constants';

export class UploadMediaDto {
  @IsEnum(MediaFolder)
  folder!: MediaFolder;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  alt?: string;
}
