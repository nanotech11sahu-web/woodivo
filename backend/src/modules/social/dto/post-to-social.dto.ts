import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsMongoId,
  IsOptional,
  IsString,
} from 'class-validator';

export class PostToSocialDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsMongoId({ each: true })
  ids!: string[];

  // Defaults to ['Facebook', 'Instagram'] when omitted - see SocialService callers.
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  platforms?: string[];

  @IsOptional()
  @IsString()
  tone?: string;

  @IsOptional()
  @IsString()
  cta?: string;

  @IsOptional()
  @IsString()
  additionalInstructions?: string;

  // "Post Now" - skip the wait for the next scheduled slot (10am/1pm/5pm/8pm)
  // and publish as soon as the Publisher can process it.
  @IsOptional()
  @IsBoolean()
  postNow?: boolean;
}
