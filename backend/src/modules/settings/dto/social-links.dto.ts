import { IsOptional, IsString } from 'class-validator';

export class SocialLinksDto {
  @IsOptional() @IsString() facebook?: string;
  @IsOptional() @IsString() instagram?: string;
  @IsOptional() @IsString() youtube?: string;
  @IsOptional() @IsString() pinterest?: string;
  @IsOptional() @IsString() linkedin?: string;
  @IsOptional() @IsString() twitter?: string;
}
