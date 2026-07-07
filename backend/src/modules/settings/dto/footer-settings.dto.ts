import { IsOptional, IsString, MaxLength } from 'class-validator';

export class FooterSettingsDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  aboutText?: string;

  @IsOptional()
  @IsString()
  copyrightText?: string;
}
