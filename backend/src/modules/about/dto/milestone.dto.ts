import { IsOptional, IsString, MaxLength } from 'class-validator';

export class MilestoneDto {
  @IsString()
  @MaxLength(20)
  year!: string;

  @IsString()
  @MaxLength(100)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  description?: string;
}
