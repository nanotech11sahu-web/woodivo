import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateAutoReplyRuleDto {
  @IsOptional()
  @IsIn(['FACEBOOK', 'INSTAGRAM', 'BOTH'])
  platform?: 'FACEBOOK' | 'INSTAGRAM' | 'BOTH';

  @IsIn(['COMMENT', 'DM'])
  trigger!: 'COMMENT' | 'DM';

  @IsArray()
  @ArrayMinSize(1, { message: 'At least one keyword is required' })
  @IsString({ each: true })
  keywords!: string[];

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
