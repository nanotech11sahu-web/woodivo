import { IsArray, IsBoolean, IsIn, IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateAutoReplyRuleDto {
  @IsOptional()
  @IsIn(['FACEBOOK', 'INSTAGRAM', 'BOTH'])
  platform?: 'FACEBOOK' | 'INSTAGRAM' | 'BOTH';

  @IsOptional()
  @IsIn(['COMMENT', 'DM'])
  trigger?: 'COMMENT' | 'DM';

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsInt()
  priority?: number;

  @IsOptional()
  @IsString()
  replyComment?: string;

  @IsOptional()
  @IsString()
  replyDm?: string;
}
